/**
 * Offline Service
 * Handles offline data persistence and sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { create } from 'zustand';

// Storage keys
const OFFLINE_QUEUE_KEY = 'offline_action_queue';
const CACHED_DATA_PREFIX = 'cache:';

// ============================================
// Network State Store
// ============================================

interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string;
    setNetworkState: (state: NetInfoState) => void;
}

export const useNetworkState = create<NetworkState>((set) => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',

    setNetworkState: (state) => {
        set({
            isConnected: state.isConnected ?? true,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
        });
    },
}));

/**
 * Initialize network listener
 */
export function initNetworkListener(): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
        useNetworkState.getState().setNetworkState(state);
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
        useNetworkState.getState().setNetworkState(state);
    });

    return unsubscribe;
}

// ============================================
// Offline Action Queue
// ============================================

interface OfflineAction {
    id: string;
    type: string;
    payload: unknown;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    timestamp: number;
    retries: number;
    maxRetries: number;
}

/**
 * Queue an action for later execution when online
 */
export async function queueOfflineAction(
    type: string,
    payload: unknown,
    endpoint: string,
    method: OfflineAction['method'] = 'POST'
): Promise<string> {
    const queue = await getOfflineQueue();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const action: OfflineAction = {
        id,
        type,
        payload,
        endpoint,
        method,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3,
    };

    queue.push(action);
    await saveOfflineQueue(queue);

    return id;
}

/**
 * Get offline queue
 */
export async function getOfflineQueue(): Promise<OfflineAction[]> {
    try {
        const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Save offline queue
 */
async function saveOfflineQueue(queue: OfflineAction[]): Promise<void> {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Remove action from queue
 */
export async function removeFromQueue(id: string): Promise<void> {
    const queue = await getOfflineQueue();
    const filtered = queue.filter(action => action.id !== id);
    await saveOfflineQueue(filtered);
}

/**
 * Clear offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

/**
 * Process offline queue
 */
export async function processOfflineQueue(
    executeAction: (action: OfflineAction) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
    const queue = await getOfflineQueue();
    let success = 0;
    let failed = 0;

    const remainingQueue: OfflineAction[] = [];

    for (const action of queue) {
        try {
            const result = await executeAction(action);
            if (result) {
                success++;
            } else {
                action.retries++;
                if (action.retries < action.maxRetries) {
                    remainingQueue.push(action);
                } else {
                    failed++;
                }
            }
        } catch {
            action.retries++;
            if (action.retries < action.maxRetries) {
                remainingQueue.push(action);
            } else {
                failed++;
            }
        }
    }

    await saveOfflineQueue(remainingQueue);

    return { success, failed };
}

// ============================================
// Data Caching
// ============================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

/**
 * Cache data with TTL
 */
export async function cacheData<T>(
    key: string,
    data: T,
    ttlMinutes: number = 60
): Promise<void> {
    const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
    };

    await AsyncStorage.setItem(
        `${CACHED_DATA_PREFIX}${key}`,
        JSON.stringify(entry)
    );
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
    try {
        const stored = await AsyncStorage.getItem(`${CACHED_DATA_PREFIX}${key}`);
        if (!stored) return null;

        const entry: CacheEntry<T> = JSON.parse(stored);

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            await AsyncStorage.removeItem(`${CACHED_DATA_PREFIX}${key}`);
            return null;
        }

        return entry.data;
    } catch {
        return null;
    }
}

/**
 * Remove cached data
 */
export async function removeCachedData(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${CACHED_DATA_PREFIX}${key}`);
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHED_DATA_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHED_DATA_PREFIX));

    let cleared = 0;

    for (const key of cacheKeys) {
        try {
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
                const entry: CacheEntry<unknown> = JSON.parse(stored);
                if (Date.now() - entry.timestamp > entry.ttl) {
                    await AsyncStorage.removeItem(key);
                    cleared++;
                }
            }
        } catch {
            // Skip invalid entries
        }
    }

    return cleared;
}

// ============================================
// Offline-First Fetch
// ============================================

interface FetchOptions {
    cacheKey?: string;
    cacheTtlMinutes?: number;
    forceRefresh?: boolean;
}

/**
 * Fetch with offline-first strategy
 */
export async function offlineFirstFetch<T>(
    fetcher: () => Promise<T>,
    options: FetchOptions = {}
): Promise<{ data: T | null; fromCache: boolean; error?: string }> {
    const { cacheKey, cacheTtlMinutes = 60, forceRefresh = false } = options;
    const { isConnected } = useNetworkState.getState();

    // Try to get from cache first
    if (cacheKey && !forceRefresh) {
        const cached = await getCachedData<T>(cacheKey);
        if (cached) {
            // If offline, return cached data
            if (!isConnected) {
                return { data: cached, fromCache: true };
            }

            // If online, try to refresh in background
            fetcher()
                .then(freshData => {
                    cacheData(cacheKey, freshData, cacheTtlMinutes);
                })
                .catch(() => {
                    // Ignore refresh errors
                });

            return { data: cached, fromCache: true };
        }
    }

    // If offline and no cache, return error
    if (!isConnected) {
        return {
            data: null,
            fromCache: false,
            error: 'No internet connection and no cached data available',
        };
    }

    // Fetch from network
    try {
        const data = await fetcher();

        // Cache the result
        if (cacheKey) {
            await cacheData(cacheKey, data, cacheTtlMinutes);
        }

        return { data, fromCache: false };
    } catch (error) {
        // Try to get stale cache as fallback
        if (cacheKey) {
            const staleCache = await getCachedData<T>(cacheKey);
            if (staleCache) {
                return { data: staleCache, fromCache: true };
            }
        }

        return {
            data: null,
            fromCache: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

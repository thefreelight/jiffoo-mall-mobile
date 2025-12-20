/**
 * Push Notification Service
 * Handles push notifications using Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Storage keys
const PUSH_TOKEN_KEY = 'push_notification_token';
const NOTIFICATION_PREFS_KEY = 'notification_preferences';

// Default notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Notification preferences
 */
export interface NotificationPreferences {
    enabled: boolean;
    orders: boolean;     // Order status updates
    promotions: boolean; // Sales and discounts
    reminders: boolean;  // Cart reminders, wishlist updates
    messages: boolean;   // Customer support messages
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    enabled: true,
    orders: true,
    promotions: true,
    reminders: true,
    messages: true,
};

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Check if physical device
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
    }

    // Get Expo push token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId,
        })).data;

        // Store token
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

        // Configure Android channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#3B82F6',
            });

            await Notifications.setNotificationChannelAsync('orders', {
                name: 'Order Updates',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('promotions', {
                name: 'Promotions',
                importance: Notifications.AndroidImportance.DEFAULT,
                sound: 'default',
            });
        }

        return token;
    } catch (error) {
        console.error('Failed to get push token:', error);
        return null;
    }
}

/**
 * Get stored push token
 */
export async function getPushToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    } catch {
        return null;
    }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
        if (stored) {
            return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
    } catch { }
    return DEFAULT_PREFERENCES;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
    return updated;
}

/**
 * Handle notification received (foreground)
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Handle notification response (tap)
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Default notification response handler
 */
export function setupDefaultNotificationHandler(): Notifications.Subscription {
    return addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
    });
}

/**
 * Navigate based on notification data
 */
export function handleNotificationNavigation(data: Record<string, unknown>): void {
    const { type, id } = data;

    switch (type) {
        case 'order':
            router.push(`/order/${id}` as any);
            break;
        case 'product':
            router.push(`/product/${id}` as any);
            break;
        case 'promotion':
            if (typeof data.url === 'string') {
                router.push(data.url as any);
            }
            break;
        case 'cart':
            router.push('/(tabs)/cart');
            break;
        case 'message':
            router.push('/profile/messages' as any);
            break;
        default:
            router.push('/(tabs)');
    }
}

/**
 * Schedule local notification
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>,
    triggerSeconds?: number
): Promise<string> {
    const trigger: Notifications.NotificationTriggerInput = triggerSeconds
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: triggerSeconds, repeats: false }
        : null;

    return await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: data || {},
            sound: 'default',
        },
        trigger,
    });
}

/**
 * Cancel scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
}

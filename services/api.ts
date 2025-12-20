/**
 * API Service for React Native Mobile App
 * Handles all HTTP requests to the backend
 */

import { useAuthStore } from '../store/auth';

// API Base URL - can be configured per environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005/api';

interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    status: number;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name?: string;
        avatar?: string;
    };
}

interface RegisterResponse extends LoginResponse { }

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { getAccessToken, refreshAccessToken, logout } = useAuthStore.getState();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if available
    const token = getAccessToken();
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle token refresh on 401
        if (response.status === 401 && token) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry with new token
                const newToken = getAccessToken();
                (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, { ...options, headers });

                if (retryResponse.ok) {
                    const data = await retryResponse.json();
                    return { data, status: retryResponse.status };
                }
            }

            // Token refresh failed, logout
            logout();
            return { error: 'Session expired', status: 401 };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                error: errorData.message || `Request failed with status ${response.status}`,
                status: response.status,
            };
        }

        const data = await response.json();
        return { data, status: response.status };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Network error',
            status: 0,
        };
    }
}

// ============================================
// Auth API
// ============================================

export async function loginWithEmail(
    email: string,
    password: string
): Promise<ApiResponse<LoginResponse>> {
    return apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function registerWithEmail(
    email: string,
    password: string,
    name?: string
): Promise<ApiResponse<RegisterResponse>> {
    return apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
}

export async function loginWithOAuth(
    provider: 'google' | 'apple' | 'facebook',
    token: string
): Promise<ApiResponse<LoginResponse>> {
    return apiRequest<LoginResponse>('/auth/oauth', {
        method: 'POST',
        body: JSON.stringify({ provider, token }),
    });
}

export async function refreshToken(
    refreshToken: string
): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiRequest<RefreshTokenResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
}

export async function requestPasswordReset(
    email: string
): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(
    token: string,
    newPassword: string
): Promise<ApiResponse<{ success: boolean }>> {
    return apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });
}

// ============================================
// Products API
// ============================================

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: { id: string; name: string };
    variants?: ProductVariant[];
    stock: number;
    rating?: number;
    reviewCount?: number;
}

export interface ProductVariant {
    id: string;
    name: string;
    options: string[];
    price: number;
    stock: number;
}

export async function getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: 'price' | 'newest' | 'popular' | 'rating';
    sortOrder?: 'asc' | 'desc';
}): Promise<ApiResponse<{ products: Product[]; total: number; page: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    return apiRequest(`/products?${searchParams.toString()}`);
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiRequest(`/products/${id}`);
}

export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return apiRequest('/products/featured');
}

export async function searchProducts(
    query: string
): Promise<ApiResponse<Product[]>> {
    return apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
}

// ============================================
// Categories API
// ============================================

export interface Category {
    id: string;
    name: string;
    image?: string;
    parentId?: string;
    children?: Category[];
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
    return apiRequest('/categories');
}

// ============================================
// Cart API
// ============================================

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    coupon?: { code: string; discount: number };
}

export async function getCart(): Promise<ApiResponse<Cart>> {
    return apiRequest('/cart');
}

export async function addToCart(
    productId: string,
    quantity: number,
    variantId?: string
): Promise<ApiResponse<Cart>> {
    return apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, variantId }),
    });
}

export async function updateCartItem(
    itemId: string,
    quantity: number
): Promise<ApiResponse<Cart>> {
    return apiRequest(`/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
    });
}

export async function removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    return apiRequest(`/cart/items/${itemId}`, {
        method: 'DELETE',
    });
}

export async function applyCoupon(code: string): Promise<ApiResponse<Cart>> {
    return apiRequest('/cart/coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
}

export async function removeCoupon(): Promise<ApiResponse<Cart>> {
    return apiRequest('/cart/coupon', {
        method: 'DELETE',
    });
}

export async function syncCart(items: CartItem[]): Promise<ApiResponse<Cart>> {
    return apiRequest('/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ items }),
    });
}

// ============================================
// Orders API
// ============================================

export interface Order {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: Address;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    trackingNumber?: string;
    trackingUrl?: string;
}

export interface Address {
    id?: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
}

export async function getOrders(params?: {
    page?: number;
    limit?: number;
}): Promise<ApiResponse<{ orders: Order[]; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    return apiRequest(`/orders?${searchParams.toString()}`);
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
    return apiRequest(`/orders/${id}`);
}

export async function createOrder(data: {
    shippingAddressId: string;
    shippingMethod: string;
    paymentMethod: string;
    notes?: string;
}): Promise<ApiResponse<Order>> {
    return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return apiRequest(`/orders/${id}/cancel`, {
        method: 'POST',
    });
}

// ============================================
// User API
// ============================================

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    phone?: string;
}

export async function getProfile(): Promise<ApiResponse<User>> {
    return apiRequest('/user/profile');
}

export async function updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiRequest('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function getAddresses(): Promise<ApiResponse<Address[]>> {
    return apiRequest('/user/addresses');
}

export async function addAddress(address: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
    return apiRequest('/user/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
    });
}

export async function updateAddress(
    id: string,
    address: Partial<Address>
): Promise<ApiResponse<Address>> {
    return apiRequest(`/user/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(address),
    });
}

export async function deleteAddress(id: string): Promise<ApiResponse<void>> {
    return apiRequest(`/user/addresses/${id}`, {
        method: 'DELETE',
    });
}

// ============================================
// Wishlist API
// ============================================

export async function getWishlist(): Promise<ApiResponse<Product[]>> {
    return apiRequest('/user/wishlist');
}

export async function addToWishlist(productId: string): Promise<ApiResponse<void>> {
    return apiRequest('/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
    });
}

export async function removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return apiRequest(`/user/wishlist/${productId}`, {
        method: 'DELETE',
    });
}

// ============================================
// Search API
// ============================================

export async function getSearchSuggestions(
    query: string
): Promise<ApiResponse<string[]>> {
    return apiRequest(`/search/suggestions?q=${encodeURIComponent(query)}`);
}

export async function getSearchHistory(): Promise<ApiResponse<string[]>> {
    return apiRequest('/search/history');
}

export async function clearSearchHistory(): Promise<ApiResponse<void>> {
    return apiRequest('/search/history', {
        method: 'DELETE',
    });
}

// ============================================
// Home API
// ============================================

export interface Banner {
    id: string;
    image: string;
    url?: string;
    title?: string;
}

export interface HomeData {
    banners: Banner[];
    categories: Category[];
    featuredProducts: Product[];
    newArrivals: Product[];
    bestSellers: Product[];
}

export async function getHomeData(): Promise<ApiResponse<HomeData>> {
    return apiRequest('/home');
}

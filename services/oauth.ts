/**
 * OAuth Service for React Native Mobile App
 * Handles OAuth authentication with Google, Apple, and Facebook
 */

import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { loginWithOAuth } from './api';
import { useAuthStore, secureStorage } from '../store/auth';

// Complete auth session for web redirects
WebBrowser.maybeCompleteAuthSession();

// OAuth Client IDs - should be configured in environment
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';

/**
 * Google Sign In
 */
export function useGoogleAuth() {
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    });

    const signIn = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await promptAsync();

            if (result.type === 'success' && result.authentication?.accessToken) {
                const apiResponse = await loginWithOAuth('google', result.authentication.accessToken);

                if (apiResponse.data) {
                    const { login } = useAuthStore.getState();
                    // Store tokens directly since login API already validated
                    await secureStorage.setToken(apiResponse.data.accessToken);
                    await secureStorage.setRefreshToken(apiResponse.data.refreshToken);
                    await secureStorage.setUser({ ...apiResponse.data.user, name: apiResponse.data.user.name || '' });
                    return { success: true };
                }

                return { success: false, error: apiResponse.error || 'Login failed' };
            }

            return { success: false, error: 'Google sign in cancelled' };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Google sign in failed'
            };
        }
    };

    return { signIn, isReady: !!request };
}

/**
 * Apple Sign In
 */
export async function signInWithApple(): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if Apple Sign In is available
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        if (!isAvailable) {
            return { success: false, error: 'Apple Sign In is not available on this device' };
        }

        const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        });

        if (credential.identityToken) {
            const apiResponse = await loginWithOAuth('apple', credential.identityToken);

            if (apiResponse.data) {
                const { login } = useAuthStore.getState();
                // Store tokens directly since login API already validated
                await secureStorage.setToken(apiResponse.data.accessToken);
                await secureStorage.setRefreshToken(apiResponse.data.refreshToken);
                await secureStorage.setUser({ ...apiResponse.data.user, name: apiResponse.data.user.name || '' });
                return { success: true };
            }

            return { success: false, error: apiResponse.error || 'Login failed' };
        }

        return { success: false, error: 'Apple Sign In failed' };
    } catch (error: any) {
        if (error.code === 'ERR_CANCELED') {
            return { success: false, error: 'Apple Sign In cancelled' };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Apple Sign In failed'
        };
    }
}

/**
 * Facebook Sign In
 */
export function useFacebookAuth() {
    const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: FACEBOOK_APP_ID,
    });

    const signIn = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await promptAsync();

            if (result.type === 'success' && result.authentication?.accessToken) {
                const apiResponse = await loginWithOAuth('facebook', result.authentication.accessToken);

                if (apiResponse.data) {
                    const { login } = useAuthStore.getState();
                    // Store tokens directly since login API already validated
                    await secureStorage.setToken(apiResponse.data.accessToken);
                    await secureStorage.setRefreshToken(apiResponse.data.refreshToken);
                    await secureStorage.setUser({ ...apiResponse.data.user, name: apiResponse.data.user.name || '' });
                    return { success: true };
                }

                return { success: false, error: apiResponse.error || 'Login failed' };
            }

            return { success: false, error: 'Facebook sign in cancelled' };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Facebook sign in failed'
            };
        }
    };

    return { signIn, isReady: !!request };
}

/**
 * Check if Apple Sign In is available (iOS only, iOS 13+)
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    return await AppleAuthentication.isAvailableAsync();
}

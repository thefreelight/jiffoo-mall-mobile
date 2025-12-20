/**
 * Biometric Authentication Service
 * Handles fingerprint and Face ID authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

interface BiometricAuthResult {
    success: boolean;
    error?: string;
}

/**
 * Check if biometric authentication is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) return false;

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return isEnrolled;
    } catch {
        return false;
    }
}

/**
 * Get supported biometric types
 */
export async function getSupportedBiometricTypes(): Promise<BiometricType[]> {
    try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        return types.map(type => {
            switch (type) {
                case LocalAuthentication.AuthenticationType.FINGERPRINT:
                    return 'fingerprint';
                case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                    return 'facial';
                case LocalAuthentication.AuthenticationType.IRIS:
                    return 'iris';
                default:
                    return 'none';
            }
        }).filter(t => t !== 'none') as BiometricType[];
    } catch {
        return [];
    }
}

/**
 * Get a user-friendly name for the primary biometric type
 */
export async function getBiometricTypeName(): Promise<string> {
    const types = await getSupportedBiometricTypes();
    if (types.includes('facial')) {
        return 'Face ID';
    }
    if (types.includes('fingerprint')) {
        return 'Touch ID';
    }
    if (types.includes('iris')) {
        return 'Iris';
    }
    return 'Biometric';
}

/**
 * Authenticate with biometrics
 */
export async function authenticateWithBiometric(
    options?: {
        promptMessage?: string;
        cancelLabel?: string;
        fallbackLabel?: string;
        disableDeviceFallback?: boolean;
    }
): Promise<BiometricAuthResult> {
    try {
        const isAvailable = await isBiometricAvailable();
        if (!isAvailable) {
            return {
                success: false,
                error: 'Biometric authentication is not available'
            };
        }

        const biometricName = await getBiometricTypeName();

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: options?.promptMessage || `Authenticate with ${biometricName}`,
            cancelLabel: options?.cancelLabel || 'Cancel',
            fallbackLabel: options?.fallbackLabel || 'Use Password',
            disableDeviceFallback: options?.disableDeviceFallback ?? false,
        });

        if (result.success) {
            return { success: true };
        }

        // Handle different error types
        switch (result.error) {
            case 'user_cancel':
                return { success: false, error: 'Authentication cancelled' };
            case 'too_many_attempts':
                return { success: false, error: 'Too many failed attempts' };
            case 'authentication_failed':
                return { success: false, error: 'Authentication failed' };
            case 'lockout':
                return { success: false, error: 'Biometric locked. Try again later' };
            default:
                return { success: false, error: result.error || 'Authentication failed' };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Biometric authentication failed',
        };
    }
}

/**
 * Check biometric security level
 */
export async function getSecurityLevel(): Promise<LocalAuthentication.SecurityLevel> {
    try {
        return await LocalAuthentication.getEnrolledLevelAsync();
    } catch {
        return LocalAuthentication.SecurityLevel.NONE;
    }
}

/**
 * Biometric settings store key
 */
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';

import * as SecureStore from 'expo-secure-store';

/**
 * Check if biometric login is enabled
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
    try {
        const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        return value === 'true';
    } catch {
        return false;
    }
}

/**
 * Enable/disable biometric login
 */
export async function setBiometricLoginEnabled(enabled: boolean): Promise<void> {
    try {
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
        console.error('Failed to save biometric setting:', error);
        throw error;
    }
}

/**
 * Authenticate and then perform login
 * Uses stored credentials for quick login
 */
export async function biometricLogin(): Promise<BiometricAuthResult> {
    try {
        // First check if biometric login is enabled
        const isEnabled = await isBiometricLoginEnabled();
        if (!isEnabled) {
            return { success: false, error: 'Biometric login is not enabled' };
        }

        // Authenticate with biometrics
        const authResult = await authenticateWithBiometric({
            promptMessage: 'Sign in to Jiffoo Mall',
            fallbackLabel: 'Use Password',
        });

        if (!authResult.success) {
            return authResult;
        }

        // Biometric auth successful - the actual login will be handled by the auth store
        // which stores tokens securely
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Biometric login failed',
        };
    }
}

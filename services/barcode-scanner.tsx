/**
 * Barcode Scanner Service
 * Handles barcode and QR code scanning for product search
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { searchProducts } from './api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export interface ScanResult {
    type: string;
    data: string;
}

interface BarcodeScannerProps {
    onScan: (result: ScanResult) => void;
    onClose: () => void;
}

/**
 * Barcode Scanner Component
 */
export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const lineAnim = useRef(new Animated.Value(0)).current;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        // Animate scanning line
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(lineAnim, {
                    toValue: SCAN_AREA_SIZE - 2,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(lineAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.permissionContainer, isDark && styles.containerDark]}>
                <Ionicons name="camera-outline" size={64} color={isDark ? '#6B7280' : '#9CA3AF'} />
                <Text style={[styles.permissionTitle, isDark && styles.textLight]}>
                    Camera Permission Required
                </Text>
                <Text style={[styles.permissionText, isDark && styles.textMuted]}>
                    We need camera access to scan barcodes and QR codes.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={[styles.closeButtonText, isDark && styles.textMuted]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);
        onScan({ type, data });
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: [
                        'qr',
                        'ean13',
                        'ean8',
                        'upc_a',
                        'upc_e',
                        'code39',
                        'code128',
                        'pdf417',
                        'datamatrix',
                    ],
                }}
                onBarcodeScanned={handleBarcodeScanned}
                enableTorch={torch}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Top overlay */}
                <View style={styles.overlayTop} />

                {/* Middle row */}
                <View style={styles.overlayMiddle}>
                    <View style={styles.overlaySide} />

                    {/* Scan area */}
                    <View style={styles.scanArea}>
                        {/* Corner markers */}
                        <View style={[styles.corner, styles.cornerTopLeft]} />
                        <View style={[styles.corner, styles.cornerTopRight]} />
                        <View style={[styles.corner, styles.cornerBottomLeft]} />
                        <View style={[styles.corner, styles.cornerBottomRight]} />

                        {/* Scanning line */}
                        <Animated.View
                            style={[
                                styles.scanLine,
                                { transform: [{ translateY: lineAnim }] },
                            ]}
                        />
                    </View>

                    <View style={styles.overlaySide} />
                </View>

                {/* Bottom overlay */}
                <View style={styles.overlayBottom}>
                    <Text style={styles.instructionText}>
                        Point camera at barcode or QR code
                    </Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, torch && styles.controlButtonActive]}
                    onPress={() => setTorch(!torch)}
                >
                    <Ionicons
                        name={torch ? 'flash' : 'flash-outline'}
                        size={28}
                        color={torch ? '#F59E0B' : '#FFFFFF'}
                    />
                </TouchableOpacity>

                {scanned && (
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setScanned(false)}
                    >
                        <Ionicons name="refresh" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

/**
 * Search product by barcode
 */
export async function searchByBarcode(barcode: string): Promise<{ found: boolean; productId?: string }> {
    try {
        const response = await searchProducts(barcode);
        if (response.data && response.data.length > 0) {
            return { found: true, productId: response.data[0].id };
        }
        return { found: false };
    } catch (error) {
        console.error('Barcode search failed:', error);
        return { found: false };
    }
}

/**
 * Handle barcode scan result
 */
export async function handleBarcodeScan(
    result: ScanResult,
    onNavigate?: (productId: string) => void
): Promise<void> {
    const { data } = result;

    // Search for product
    const searchResult = await searchByBarcode(data);

    if (searchResult.found && searchResult.productId) {
        if (onNavigate) {
            onNavigate(searchResult.productId);
        } else {
            router.push(`/product/${searchResult.productId}` as any);
        }
    } else {
        // Show not found alert
        Alert.alert(
            'Product Not Found',
            `No product found with barcode: ${data}`,
            [
                {
                    text: 'Search Instead',
                    onPress: () => router.push(`/(tabs)/search?q=${encodeURIComponent(data)}` as any),
                },
                { text: 'OK', style: 'cancel' },
            ]
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    containerDark: { backgroundColor: '#111827' },

    // Permission
    permissionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    closeButton: { marginTop: 16 },
    closeButtonText: { color: '#6B7280', fontSize: 16 },

    // Overlay
    overlay: { ...StyleSheet.absoluteFillObject },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayMiddle: { flexDirection: 'row' },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        paddingTop: 32,
    },

    // Scan area
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#3B82F6',
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },

    // Instructions
    instructionText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },

    // Controls
    controls: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    controlButtonActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#3B82F6',
    },

    textLight: { color: '#F9FAFB' },
    textMuted: { color: '#9CA3AF' },
});

export default BarcodeScanner;

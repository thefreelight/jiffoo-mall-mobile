/**
 * Address Form Component
 * Form for adding/editing shipping addresses
 */

import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '../services/api';

interface AddressFormProps {
    address?: Address | null;
    onSave: (address: Omit<Address, 'id'>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function AddressForm({ address, onSave, onCancel, loading = false }: AddressFormProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [form, setForm] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (address) {
            setForm({
                name: address.name || '',
                phone: address.phone || '',
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                postalCode: address.postalCode || '',
                country: address.country || 'United States',
                isDefault: address.isDefault || false,
            });
        }
    }, [address]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone is required';
        if (!form.street.trim()) newErrors.street = 'Street address is required';
        if (!form.city.trim()) newErrors.city = 'City is required';
        if (!form.state.trim()) newErrors.state = 'State is required';
        if (!form.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        if (!form.country.trim()) newErrors.country = 'Country is required';

        // Phone validation
        if (form.phone && !/^\+?[\d\s-()]+$/.test(form.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        // Postal code validation (US format)
        if (form.country === 'United States' && form.postalCode && !/^\d{5}(-\d{4})?$/.test(form.postalCode)) {
            newErrors.postalCode = 'Invalid ZIP code (e.g., 12345 or 12345-6789)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            await onSave(form);
        } catch (error) {
            Alert.alert('Error', 'Failed to save address');
        }
    };

    const renderInput = (
        label: string,
        field: keyof typeof form,
        options?: {
            placeholder?: string;
            keyboardType?: 'default' | 'phone-pad' | 'number-pad';
            autoCapitalize?: 'none' | 'sentences' | 'words';
        }
    ) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textLight]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    isDark && styles.inputDark,
                    errors[field] && styles.inputError,
                ]}
                placeholder={options?.placeholder || label}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={form[field] as string}
                onChangeText={text => {
                    setForm(f => ({ ...f, [field]: text }));
                    if (errors[field]) {
                        setErrors(e => ({ ...e, [field]: '' }));
                    }
                }}
                keyboardType={options?.keyboardType || 'default'}
                autoCapitalize={options?.autoCapitalize || 'words'}
            />
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    return (
        <ScrollView style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.form}>
                {renderInput('Full Name', 'name')}
                {renderInput('Phone Number', 'phone', { keyboardType: 'phone-pad' })}
                {renderInput('Street Address', 'street', { placeholder: 'House number, Street name' })}

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        {renderInput('City', 'city')}
                    </View>
                    <View style={styles.halfInput}>
                        {renderInput('State/Province', 'state')}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        {renderInput('Postal Code', 'postalCode', { keyboardType: 'number-pad' })}
                    </View>
                    <View style={styles.halfInput}>
                        {renderInput('Country', 'country')}
                    </View>
                </View>

                {/* Default address toggle */}
                <TouchableOpacity
                    style={[styles.defaultToggle, isDark && styles.defaultToggleDark]}
                    onPress={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
                >
                    <View style={[
                        styles.checkbox,
                        isDark && styles.checkboxDark,
                        form.isDefault && styles.checkboxChecked,
                    ]}>
                        {form.isDefault && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                    </View>
                    <Text style={[styles.defaultText, isDark && styles.textLight]}>
                        Set as default address
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                    onPress={onCancel}
                >
                    <Text style={[styles.cancelButtonText, isDark && styles.textLight]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {address ? 'Update Address' : 'Add Address'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    containerDark: { backgroundColor: '#111827' },

    form: { padding: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputDark: { backgroundColor: '#1F2937', color: '#F9FAFB', borderColor: '#374151' },
    inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },

    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },

    defaultToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 8,
    },
    defaultToggleDark: { backgroundColor: '#1F2937' },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxDark: { borderColor: '#6B7280' },
    checkboxChecked: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
    defaultText: { fontSize: 16, color: '#111827' },

    buttons: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        paddingTop: 24,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    cancelButtonDark: { backgroundColor: '#374151' },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#3B82F6',
    },
    saveButtonDisabled: { backgroundColor: '#9CA3AF' },
    saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

    textLight: { color: '#F9FAFB' },
});

export default AddressForm;

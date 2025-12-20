/**
 * Checkout Screen
 * Multi-step checkout process
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/cart';
import { getAddresses, Address, createOrder } from '../services/api';
import { useAuthStore } from '../store/auth';

type CheckoutStep = 'shipping' | 'payment' | 'review';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
  { id: 'applepay', name: 'Apple Pay', icon: 'logo-apple' },
  { id: 'googlepay', name: 'Google Pay', icon: 'logo-google' },
];

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: 'Next business day' },
];

export default function CheckoutScreen() {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_METHODS[0]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { items, subtotal, total, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to continue checkout',
        [
          { text: 'Cancel', onPress: () => router.back() },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    loadAddresses();
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await getAddresses();
      if (response.data) {
        setAddresses(response.data);
        const defaultAddress = response.data.find(a => a.isDefault) || response.data[0];
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createOrder({
        shippingAddressId: selectedAddress.id!,
        shippingMethod: selectedShipping.id,
        paymentMethod: selectedPayment.id,
      });

      if (response.data) {
        clearCart();
        router.replace({
          pathname: '/order/[id]',
          params: { id: response.data.id, success: 'true' },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {(['shipping', 'payment', 'review'] as CheckoutStep[]).map((s, index) => (
        <View key={s} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            (step === s || getStepIndex(step) > index) && styles.stepCircleActive,
          ]}>
            {getStepIndex(step) > index ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepNumber,
                (step === s || getStepIndex(step) > index) && styles.stepNumberActive,
              ]}>
                {index + 1}
              </Text>
            )}
          </View>
          <Text style={[
            styles.stepLabel,
            step === s && styles.stepLabelActive,
            isDark && styles.textMuted,
          ]}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Text>
          {index < 2 && <View style={[styles.stepLine, getStepIndex(step) > index && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  const getStepIndex = (s: CheckoutStep) => ['shipping', 'payment', 'review'].indexOf(s);

  const renderShippingStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Shipping Address</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : addresses.length === 0 ? (
        <TouchableOpacity
          style={[styles.addAddressButton, isDark && styles.addAddressButtonDark]}
          onPress={() => router.push('/profile/addresses/new' as any)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          <Text style={styles.addAddressText}>Add Shipping Address</Text>
        </TouchableOpacity>
      ) : (
        addresses.map((address) => (
          <TouchableOpacity
            key={address.id}
            style={[
              styles.addressCard,
              isDark && styles.addressCardDark,
              selectedAddress?.id === address.id && styles.addressCardSelected,
            ]}
            onPress={() => setSelectedAddress(address)}
          >
            <View style={styles.addressRadio}>
              <View style={[
                styles.radioOuter,
                selectedAddress?.id === address.id && styles.radioOuterSelected,
              ]}>
                {selectedAddress?.id === address.id && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.addressInfo}>
              <Text style={[styles.addressName, isDark && styles.textLight]}>{address.name}</Text>
              <Text style={[styles.addressText, isDark && styles.textMuted]}>
                {address.street}, {address.city}
              </Text>
              <Text style={[styles.addressText, isDark && styles.textMuted]}>
                {address.state} {address.postalCode}, {address.country}
              </Text>
              <Text style={[styles.addressPhone, isDark && styles.textMuted]}>{address.phone}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.sectionTitle, isDark && styles.textLight, { marginTop: 24 }]}>
        Shipping Method
      </Text>

      {SHIPPING_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.shippingMethod,
            isDark && styles.shippingMethodDark,
            selectedShipping.id === method.id && styles.shippingMethodSelected,
          ]}
          onPress={() => setSelectedShipping(method)}
        >
          <View style={styles.addressRadio}>
            <View style={[
              styles.radioOuter,
              selectedShipping.id === method.id && styles.radioOuterSelected,
            ]}>
              {selectedShipping.id === method.id && <View style={styles.radioInner} />}
            </View>
          </View>
          <View style={styles.shippingInfo}>
            <Text style={[styles.shippingName, isDark && styles.textLight]}>{method.name}</Text>
            <Text style={[styles.shippingDays, isDark && styles.textMuted]}>{method.days}</Text>
          </View>
          <Text style={styles.shippingPrice}>${method.price.toFixed(2)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Payment Method</Text>

      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            isDark && styles.paymentMethodDark,
            selectedPayment.id === method.id && styles.paymentMethodSelected,
          ]}
          onPress={() => setSelectedPayment(method)}
        >
          <View style={styles.addressRadio}>
            <View style={[
              styles.radioOuter,
              selectedPayment.id === method.id && styles.radioOuterSelected,
            ]}>
              {selectedPayment.id === method.id && <View style={styles.radioInner} />}
            </View>
          </View>
          <Ionicons name={method.icon as any} size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.paymentName, isDark && styles.textLight]}>{method.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Order Summary</Text>

      <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Items ({items.length})</Text>
          <Text style={[styles.summaryValue, isDark && styles.textLight]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Shipping</Text>
          <Text style={[styles.summaryValue, isDark && styles.textLight]}>${selectedShipping.price.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, isDark && styles.textLight]}>Total</Text>
          <Text style={styles.totalValue}>${(subtotal + selectedShipping.price).toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.reviewSection, isDark && styles.reviewSectionDark]}>
        <View style={styles.reviewHeader}>
          <Ionicons name="location-outline" size={20} color="#3B82F6" />
          <Text style={[styles.reviewTitle, isDark && styles.textLight]}>Shipping Address</Text>
        </View>
        <Text style={[styles.reviewText, isDark && styles.textMuted]}>
          {selectedAddress?.name} - {selectedAddress?.street}, {selectedAddress?.city}
        </Text>
      </View>

      <View style={[styles.reviewSection, isDark && styles.reviewSectionDark]}>
        <View style={styles.reviewHeader}>
          <Ionicons name="card-outline" size={20} color="#3B82F6" />
          <Text style={[styles.reviewTitle, isDark && styles.textLight]}>Payment Method</Text>
        </View>
        <Text style={[styles.reviewText, isDark && styles.textMuted]}>{selectedPayment.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {renderStepIndicator()}

      <ScrollView style={styles.scrollView}>
        {step === 'shipping' && renderShippingStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'review' && renderReviewStep()}
      </ScrollView>

      <View style={[styles.footer, isDark && styles.footerDark]}>
        {step !== 'shipping' && (
          <TouchableOpacity
            style={[styles.backButton, isDark && styles.backButtonDark]}
            onPress={() => setStep(step === 'review' ? 'payment' : 'shipping')}
          >
            <Text style={[styles.backButtonText, isDark && styles.textLight]}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
          onPress={() => {
            if (step === 'shipping') setStep('payment');
            else if (step === 'payment') setStep('review');
            else handlePlaceOrder();
          }}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 'review' ? 'Place Order' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  scrollView: { flex: 1 },

  // Step indicator
  stepIndicator: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF' },
  stepContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: '#3B82F6' },
  stepNumber: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  stepNumberActive: { color: '#FFFFFF' },
  stepLabel: { fontSize: 12, marginLeft: 8, color: '#6B7280' },
  stepLabelActive: { color: '#3B82F6', fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: '#3B82F6' },

  // Content
  stepContent: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },

  // Address card
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressCardDark: { backgroundColor: '#1F2937' },
  addressCardSelected: { borderColor: '#3B82F6' },
  addressRadio: { marginRight: 12 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#3B82F6' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  addressInfo: { flex: 1 },
  addressName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  addressText: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  addressPhone: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addAddressButtonDark: { backgroundColor: '#1E3A5F' },
  addAddressText: { fontSize: 16, color: '#3B82F6', fontWeight: '500' },

  // Shipping method
  shippingMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shippingMethodDark: { backgroundColor: '#1F2937' },
  shippingMethodSelected: { borderColor: '#3B82F6' },
  shippingInfo: { flex: 1, marginLeft: 12 },
  shippingName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  shippingDays: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  shippingPrice: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },

  // Payment method
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  paymentMethodDark: { backgroundColor: '#1F2937' },
  paymentMethodSelected: { borderColor: '#3B82F6' },
  paymentName: { flex: 1, fontSize: 16, color: '#111827' },

  // Summary
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryCardDark: { backgroundColor: '#1F2937' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#111827' },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#3B82F6' },

  // Review section
  reviewSection: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  reviewSectionDark: { backgroundColor: '#1F2937' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reviewText: { fontSize: 14, color: '#6B7280' },

  // Footer
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  footerDark: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  backButtonDark: { backgroundColor: '#374151' },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  nextButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#9CA3AF' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

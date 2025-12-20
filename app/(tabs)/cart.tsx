/**
 * Cart Screen
 * Shopping cart with items, quantity management, and checkout
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, Image, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useCartStore, useCartItemCount } from '../../store/cart';
import { applyCoupon as applyCouponApi, removeCoupon as removeCouponApi } from '../../services/api';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const {
    items,
    subtotal,
    shipping,
    tax,
    total,
    coupon,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    syncWithServer,
  } = useCartStore();

  const itemCount = useCartItemCount();

  // Sync cart on mount
  useEffect(() => {
    syncWithServer();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const response = await applyCouponApi(couponCode);
      if (response.data?.coupon) {
        applyCoupon(response.data.coupon.code, response.data.coupon.discount);
        setCouponCode('');
        Alert.alert('Success', 'Coupon applied successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCouponApi();
      removeCoupon();
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }
    router.push('/checkout');
  };

  const renderRightActions = (itemId: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        Alert.alert(
          'Remove Item',
          'Are you sure you want to remove this item?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeItem(itemId) },
          ]
        );
      }}
    >
      <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: typeof items[0] }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={[styles.cartItem, isDark && styles.cartItemDark]}>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, isDark && styles.textLight]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.quantityButton, isDark && styles.quantityButtonDark]}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, isDark && styles.textLight]}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, isDark && styles.quantityButtonDark]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </Swipeable>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={isDark ? '#374151' : '#D1D5DB'} />
      <Text style={[styles.emptyTitle, isDark && styles.textLight]}>Your cart is empty</Text>
      <Text style={[styles.emptySubtitle, isDark && styles.textMuted]}>
        Browse our products and add some items!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>
          Shopping Cart ({itemCount})
        </Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to clear all items?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearCart },
              ]
            );
          }}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />

          {/* Summary */}
          <View style={[styles.summary, isDark && styles.summaryDark]}>
            {/* Coupon */}
            {coupon ? (
              <View style={styles.couponApplied}>
                <View style={styles.couponInfo}>
                  <Ionicons name="pricetag" size={16} color="#10B981" />
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                  <Text style={styles.couponDiscount}>-${coupon.discount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={handleRemoveCoupon}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.couponRow}>
                <View style={[styles.couponInput, isDark && styles.couponInputDark]}>
                  <Ionicons name="pricetag-outline" size={16} color="#9CA3AF" />
                  {/* Note: TextInput not imported for brevity, use inline Text */}
                  <Text style={styles.couponPlaceholder}>Enter coupon code</Text>
                </View>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyCoupon}
                  disabled={applyingCoupon}
                >
                  {applyingCoupon ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Subtotal</Text>
              <Text style={[styles.summaryValue, isDark && styles.textLight]}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Shipping</Text>
              <Text style={[styles.summaryValue, isDark && styles.textLight]}>
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Tax</Text>
              <Text style={[styles.summaryValue, isDark && styles.textLight]}>${tax.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, isDark && styles.textLight]}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  clearText: { color: '#EF4444', fontSize: 14 },

  // List
  listContent: { padding: 16 },

  // Cart item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cartItemDark: { backgroundColor: '#1F2937' },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, color: '#111827', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#3B82F6', fontWeight: '500', marginBottom: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDark: { backgroundColor: '#374151' },
  quantityText: { fontSize: 14, fontWeight: '500', color: '#111827' },
  itemTotal: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },

  // Delete action
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
    marginLeft: 8,
  },

  // Empty cart
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  shopButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  shopButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  // Summary
  summary: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryDark: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
  couponRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  couponInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  couponInputDark: { backgroundColor: '#374151' },
  couponPlaceholder: { color: '#9CA3AF', fontSize: 14 },
  applyButton: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  applyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  couponApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  couponInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  couponCode: { fontSize: 14, fontWeight: '500', color: '#10B981' },
  couponDiscount: { fontSize: 14, color: '#10B981' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#111827' },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#3B82F6' },
  checkoutButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonDisabled: { backgroundColor: '#9CA3AF' },
  checkoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

/**
 * Order Detail Screen
 * Displays full order information with tracking
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Image, Linking, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOrder, cancelOrder, Order } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';

const ORDER_STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: '#F59E0B', icon: 'time-outline', label: 'Pending' },
  confirmed: { color: '#3B82F6', icon: 'checkmark-circle-outline', label: 'Confirmed' },
  processing: { color: '#8B5CF6', icon: 'cube-outline', label: 'Processing' },
  shipped: { color: '#6366F1', icon: 'airplane-outline', label: 'Shipped' },
  delivered: { color: '#10B981', icon: 'checkmark-done-outline', label: 'Delivered' },
  cancelled: { color: '#EF4444', icon: 'close-circle-outline', label: 'Cancelled' },
};

const ORDER_TIMELINE = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

export default function OrderDetailScreen() {
  const { id, success } = useLocalSearchParams<{ id: string; success?: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadOrder();

    // Show success message if coming from checkout
    if (success === 'true') {
      Alert.alert(
        'Order Placed!',
        'Thank you for your order. You will receive a confirmation email shortly.',
        [{ text: 'OK' }]
      );
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getOrder(id);
      if (response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const response = await cancelOrder(id!);
              if (response.data) {
                setOrder(response.data);
                Alert.alert('Success', 'Order has been cancelled');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleTrackShipment = () => {
    if (order?.trackingUrl) {
      Linking.openURL(order.trackingUrl);
    } else if (order?.trackingNumber) {
      // Default to a common tracking site
      Linking.openURL(`https://www.google.com/search?q=${order.trackingNumber}`);
    }
  };

  const getStatusIndex = (status: string) => {
    return ORDER_TIMELINE.findIndex(s => s.status === status);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.textLight]}>Order not found</Text>
      </View>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View>
          <Text style={[styles.orderNumber, isDark && styles.textLight]}>
            Order #{order.orderNumber}
          </Text>
          <Text style={[styles.orderDate, isDark && styles.textMuted]}>
            Placed {formatRelativeTime(order.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <View style={[styles.timelineCard, isDark && styles.cardDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Order Status</Text>
          <View style={styles.timeline}>
            {ORDER_TIMELINE.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <View key={step.status} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}>
                      {isCompleted && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    {index < ORDER_TIMELINE.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]} />
                    )}
                  </View>
                  <Text style={[
                    styles.timelineLabel,
                    isDark && styles.textMuted,
                    isCompleted && styles.timelineLabelCompleted,
                    isCurrent && styles.timelineLabelCurrent,
                  ]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Tracking */}
          {order.trackingNumber && order.status === 'shipped' && (
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackShipment}>
              <Ionicons name="location-outline" size={20} color="#3B82F6" />
              <View style={styles.trackInfo}>
                <Text style={styles.trackLabel}>Tracking Number</Text>
                <Text style={styles.trackNumber}>{order.trackingNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Items */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Items</Text>
        {order.items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.orderItem,
              index < order.items.length - 1 && styles.orderItemBorder,
            ]}
            onPress={() => router.push(`/product/${item.productId}` as any)}
          >
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            )}
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, isDark && styles.textLight]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.itemMeta, isDark && styles.textMuted]}>
                Qty: {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Shipping Address</Text>
        <View style={styles.addressInfo}>
          <Ionicons name="location-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <View style={styles.addressText}>
            <Text style={[styles.addressName, isDark && styles.textLight]}>
              {order.shippingAddress.name}
            </Text>
            <Text style={[styles.addressLine, isDark && styles.textMuted]}>
              {order.shippingAddress.street}
            </Text>
            <Text style={[styles.addressLine, isDark && styles.textMuted]}>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </Text>
            <Text style={[styles.addressLine, isDark && styles.textMuted]}>
              {order.shippingAddress.phone}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Subtotal</Text>
          <Text style={[styles.summaryValue, isDark && styles.textLight]}>
            ${order.subtotal.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Shipping</Text>
          <Text style={[styles.summaryValue, isDark && styles.textLight]}>
            ${order.shipping.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDark && styles.textMuted]}>Tax</Text>
          <Text style={[styles.summaryValue, isDark && styles.textLight]}>
            ${order.tax.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, isDark && styles.textLight]}>Total</Text>
          <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
        </View>
        <View style={styles.paymentMethod}>
          <Ionicons name="card-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.paymentText, isDark && styles.textMuted]}>
            Paid with {order.paymentMethod}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {order.status === 'pending' && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.buttonDisabled]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => router.push('/profile/help' as any)}
        >
          <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
          <Text style={styles.helpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  center: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6B7280' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerDark: { backgroundColor: '#1F2937' },
  orderNumber: { fontSize: 18, fontWeight: '600', color: '#111827' },
  orderDate: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: { fontSize: 14, fontWeight: '500' },

  // Card
  card: { backgroundColor: '#FFFFFF', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16 },
  cardDark: { backgroundColor: '#1F2937' },
  timelineCard: { backgroundColor: '#FFFFFF', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 },

  // Timeline
  timeline: { marginBottom: 16 },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLeft: { alignItems: 'center', marginRight: 12 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: { backgroundColor: '#10B981' },
  timelineDotCurrent: { backgroundColor: '#3B82F6' },
  timelineLine: { width: 2, height: 24, backgroundColor: '#E5E7EB', marginVertical: 4 },
  timelineLineCompleted: { backgroundColor: '#10B981' },
  timelineLabel: { fontSize: 14, color: '#6B7280', paddingTop: 2, paddingBottom: 26 },
  timelineLabelCompleted: { color: '#10B981' },
  timelineLabelCurrent: { color: '#3B82F6', fontWeight: '600' },

  // Track button
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  trackInfo: { flex: 1 },
  trackLabel: { fontSize: 12, color: '#6B7280' },
  trackNumber: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },

  // Order items
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  orderItemBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: '#111827' },
  itemMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },

  // Address
  addressInfo: { flexDirection: 'row', gap: 12 },
  addressText: { flex: 1 },
  addressName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  addressLine: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#111827' },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#3B82F6' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  paymentText: { fontSize: 14, color: '#6B7280' },

  // Actions
  actions: { padding: 16, gap: 12 },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
  },
  helpButtonText: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
  buttonDisabled: { opacity: 0.6 },

  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
  bottomPadding: { height: 100 },
});

/**
 * Orders Screen
 * Order history list with status tracking
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOrders, Order } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';

const ORDER_STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: '#F59E0B', icon: 'time-outline', label: 'Pending' },
  confirmed: { color: '#3B82F6', icon: 'checkmark-circle-outline', label: 'Confirmed' },
  processing: { color: '#8B5CF6', icon: 'cube-outline', label: 'Processing' },
  shipped: { color: '#6366F1', icon: 'airplane-outline', label: 'Shipped' },
  delivered: { color: '#10B981', icon: 'checkmark-done-outline', label: 'Delivered' },
  cancelled: { color: '#EF4444', icon: 'close-circle-outline', label: 'Cancelled' },
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadOrders = useCallback(async (refresh = false) => {
    if (refresh) {
      setPage(1);
      setHasMore(true);
    }

    const currentPage = refresh ? 1 : page;

    try {
      const response = await getOrders({ page: currentPage, limit: 10 });
      if (response.data) {
        if (refresh) {
          setOrders(response.data.orders);
        } else {
          setOrders(prev => [...prev, ...response.data!.orders]);
        }
        setHasMore(response.data.orders.length === 10);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, [loadOrders]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
      loadOrders();
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = ORDER_STATUS_CONFIG[item.status] || ORDER_STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        style={[styles.orderCard, isDark && styles.orderCardDark]}
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        <View style={styles.orderHeader}>
          <Text style={[styles.orderNumber, isDark && styles.textLight]}>
            #{item.orderNumber}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          <Text style={[styles.itemsText, isDark && styles.textMuted]} numberOfLines={1}>
            {item.items.map(i => i.name).join(', ')}
          </Text>
          <Text style={[styles.itemCount, isDark && styles.textMuted]}>
            {item.items.length} item{item.items.length > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={[styles.orderDate, isDark && styles.textMuted]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
          <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
        </View>

        {item.trackingNumber && item.status === 'shipped' && (
          <View style={styles.trackingRow}>
            <Ionicons name="location-outline" size={14} color="#6366F1" />
            <Text style={styles.trackingText}>Track shipment</Text>
            <Ionicons name="chevron-forward" size={14} color="#6366F1" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color={isDark ? '#374151' : '#D1D5DB'} />
      <Text style={[styles.emptyTitle, isDark && styles.textLight]}>No orders yet</Text>
      <Text style={[styles.emptySubtitle, isDark && styles.textMuted]}>
        Your order history will appear here
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  center: { justifyContent: 'center', alignItems: 'center' },

  listContent: { padding: 16, flexGrow: 1 },

  // Order card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderCardDark: { backgroundColor: '#1F2937' },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: '500' },
  orderItems: { marginBottom: 12 },
  itemsText: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  itemCount: { fontSize: 12, color: '#9CA3AF' },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: { fontSize: 12, color: '#9CA3AF' },
  orderTotal: { fontSize: 18, fontWeight: '600', color: '#3B82F6' },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  trackingText: { flex: 1, fontSize: 14, color: '#6366F1' },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
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

  // Footer
  loadingFooter: { padding: 16, alignItems: 'center' },

  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

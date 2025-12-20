/**
 * Home Screen
 * Main landing page with banners, categories, and featured products
 */

import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHomeData, HomeData, Product, Category, Banner } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 180;
const CATEGORY_SIZE = 80;

// Cache key for offline support
const HOME_CACHE_KEY = 'home_data_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function HomeScreen() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Load home data with cache support
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      // Try to load from cache first
      if (!forceRefresh) {
        const cached = await loadFromCache();
        if (cached) {
          setData(cached);
          setLoading(false);
        }
      }

      // Fetch fresh data
      const response = await getHomeData();
      if (response.data) {
        setData(response.data);
        await saveToCache(response.data);
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cache management
  const loadFromCache = async (): Promise<HomeData | null> => {
    try {
      const cached = await AsyncStorage.getItem(HOME_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch { }
    return null;
  };

  const saveToCache = async (data: HomeData) => {
    try {
      await AsyncStorage.setItem(
        HOME_CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch { }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  // Render banner carousel
  const renderBanner = () => {
    if (!data?.banners?.length) return null;

    return (
      <View style={styles.bannerContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setBannerIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {data.banners.map((banner, index) => (
            <TouchableOpacity
              key={banner.id}
              style={styles.bannerSlide}
              onPress={() => banner.url && router.push(banner.url as any)}
            >
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {banner.title && (
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Pagination dots */}
        <View style={styles.bannerPagination}>
          {data.banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === bannerIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  // Render category grid
  const renderCategories = () => {
    if (!data?.categories?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => router.push(`/category/${category.id}` as any)}
            >
              <View style={[styles.categoryIcon, isDark && styles.categoryIconDark]}>
                {category.image ? (
                  <Image source={{ uri: category.image }} style={styles.categoryImage} />
                ) : (
                  <Ionicons name="grid-outline" size={32} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
              </View>
              <Text style={[styles.categoryName, isDark && styles.textMuted]} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render product card
  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={[styles.productCard, isDark && styles.productCardDark]}
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      <Image
        source={{ uri: product.images[0] }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, isDark && styles.textLight]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.productPricing}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Text style={styles.productOriginalPrice}>
              ${product.compareAtPrice.toFixed(2)}
            </Text>
          )}
        </View>
        {product.rating && (
          <View style={styles.productRating}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.productRatingText}>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render product section
  const renderProductSection = (title: string, products: Product[]) => {
    if (!products?.length) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>{title}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.map(renderProductCard)}
        </ScrollView>
      </View>
    );
  };

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <Text style={[styles.loadingText, isDark && styles.textMuted]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Search Bar */}
      <TouchableOpacity
        style={[styles.searchBar, isDark && styles.searchBarDark]}
        onPress={() => router.push('/(tabs)/search' as any)}
      >
        <Ionicons name="search-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text style={[styles.searchPlaceholder, isDark && styles.textMuted]}>
          Search products...
        </Text>
      </TouchableOpacity>

      {renderBanner()}
      {renderCategories()}
      {renderProductSection('Featured Products', data?.featuredProducts || [])}
      {renderProductSection('New Arrivals', data?.newArrivals || [])}
      {renderProductSection('Best Sellers', data?.bestSellers || [])}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchBarDark: { backgroundColor: '#1F2937' },
  searchPlaceholder: { flex: 1, fontSize: 16, color: '#9CA3AF' },

  // Banner
  bannerContainer: { height: BANNER_HEIGHT, marginBottom: 16 },
  bannerSlide: { width: SCREEN_WIDTH, height: BANNER_HEIGHT },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  bannerPagination: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: { backgroundColor: '#FFFFFF', width: 16 },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', paddingHorizontal: 16, marginBottom: 12 },
  seeAllText: { color: '#3B82F6', fontSize: 14, fontWeight: '500' },

  // Categories
  categoryItem: { alignItems: 'center', marginLeft: 16, width: CATEGORY_SIZE },
  categoryIcon: {
    width: CATEGORY_SIZE,
    height: CATEGORY_SIZE,
    borderRadius: CATEGORY_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconDark: { backgroundColor: '#1F2937' },
  categoryImage: { width: CATEGORY_SIZE - 20, height: CATEGORY_SIZE - 20, borderRadius: (CATEGORY_SIZE - 20) / 2 },
  categoryName: { fontSize: 12, color: '#374151', textAlign: 'center' },

  // Product card
  productCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginLeft: 16,
    overflow: 'hidden',
  },
  productCardDark: { backgroundColor: '#1F2937' },
  productImage: { width: 160, height: 160 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, color: '#111827', marginBottom: 4 },
  productPricing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productPrice: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
  productOriginalPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  productRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  productRatingText: { fontSize: 12, color: '#6B7280' },

  // Text
  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },

  bottomPadding: { height: 100 },
});

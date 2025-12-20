/**
 * Category Screen
 * Displays products in a category with filters
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, getCategories, Product, Category } from '../../services/api';
import { FilterSortModal, FilterOptions, SortOption } from '../../components/FilterSort';

export default function CategoryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({});
    const [sort, setSort] = useState<SortOption>('popular');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const loadCategory = async () => {
        try {
            const response = await getCategories();
            if (response.data) {
                const cat = response.data.find(c => c.id === id);
                if (cat) setCategory(cat);
            }
        } catch (error) {
            console.error('Failed to load category:', error);
        }
    };

    const loadProducts = useCallback(async (reset = false) => {
        const currentPage = reset ? 1 : page;

        if (!reset && loadingMore) return;

        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await getProducts({
                page: currentPage,
                limit: 20,
                category: id,
                sortBy: sort === 'price-asc' || sort === 'price-desc' ? 'price' : sort,
                sortOrder: sort === 'price-desc' ? 'desc' : 'asc',
            });

            if (response.data) {
                if (reset) {
                    setProducts(response.data.products);
                    setPage(1);
                } else {
                    setProducts(prev => [...prev, ...response.data!.products]);
                }
                setHasMore(response.data.products.length === 20);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [id, page, sort, loadingMore]);

    useEffect(() => {
        loadCategory();
        loadProducts(true);
    }, [id, sort]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadProducts(true);
    }, [loadProducts]);

    const loadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            setPage(p => p + 1);
            loadProducts();
        }
    };

    const handleApplyFilters = (newFilters: FilterOptions, newSort: SortOption) => {
        setFilters(newFilters);
        setSort(newSort);
        setShowFilters(false);
        // Reload with new filters
        loadProducts(true);
    };

    const renderProduct = ({ item, index }: { item: Product; index: number }) => (
        <TouchableOpacity
            style={[
                styles.productCard,
                isDark && styles.productCardDark,
                index % 2 === 0 ? styles.productCardLeft : styles.productCardRight,
            ]}
            onPress={() => router.push(`/product/${item.id}` as any)}
        >
            <Image
                source={{ uri: item.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={[styles.productName, isDark && styles.textLight]} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <Text style={styles.originalPrice}>${item.compareAtPrice.toFixed(2)}</Text>
                    )}
                </View>
                {item.rating && (
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={styles.headerInfo}>
                <Text style={[styles.categoryName, isDark && styles.textLight]}>
                    {category?.name || 'Products'}
                </Text>
                <Text style={[styles.productCount, isDark && styles.textMuted]}>
                    {products.length} products
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.filterButton, isDark && styles.filterButtonDark]}
                onPress={() => setShowFilters(true)}
            >
                <Ionicons name="options-outline" size={20} color={isDark ? '#F9FAFB' : '#374151'} />
                <Text style={[styles.filterText, isDark && styles.textLight]}>Filter</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={isDark ? '#374151' : '#D1D5DB'} />
            <Text style={[styles.emptyTitle, isDark && styles.textLight]}>No products found</Text>
            <Text style={[styles.emptySubtitle, isDark && styles.textMuted]}>
                Try adjusting your filters
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#3B82F6" />
            </View>
        );
    };

    if (loading && products.length === 0) {
        return (
            <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={item => item.id}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
            />

            <FilterSortModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                currentFilters={filters}
                currentSort={sort}
                resultCount={products.length}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    containerDark: { backgroundColor: '#111827' },
    center: { justifyContent: 'center', alignItems: 'center' },

    listContent: { flexGrow: 1 },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    headerDark: { backgroundColor: '#1F2937' },
    headerInfo: {},
    categoryName: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    productCount: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    filterButtonDark: { backgroundColor: '#374151' },
    filterText: { fontSize: 14, color: '#374151', fontWeight: '500' },

    // Product card
    productCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        margin: 4,
        overflow: 'hidden',
    },
    productCardDark: { backgroundColor: '#1F2937' },
    productCardLeft: { marginLeft: 16 },
    productCardRight: { marginRight: 16 },
    productImage: { width: '100%', aspectRatio: 1 },
    productInfo: { padding: 12 },
    productName: { fontSize: 14, color: '#111827', marginBottom: 4, height: 36 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    productPrice: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
    originalPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { fontSize: 12, color: '#6B7280' },

    // Empty
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

    // Footer
    loadingFooter: { padding: 16, alignItems: 'center' },

    textLight: { color: '#F9FAFB' },
    textMuted: { color: '#9CA3AF' },
});

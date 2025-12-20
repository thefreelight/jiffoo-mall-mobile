/**
 * Filter and Sort Component
 * Product filtering and sorting modal
 */

import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Modal, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export interface FilterOptions {
    priceMin?: number;
    priceMax?: number;
    categories?: string[];
    brands?: string[];
    ratings?: number[];
    inStock?: boolean;
}

export type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

interface FilterSortProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions, sort: SortOption) => void;
    currentFilters: FilterOptions;
    currentSort: SortOption;
    availableCategories?: { id: string; name: string }[];
    availableBrands?: { id: string; name: string }[];
    priceRange?: { min: number; max: number };
    resultCount?: number;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
    { value: 'popular', label: 'Most Popular', icon: 'trending-up-outline' },
    { value: 'newest', label: 'Newest First', icon: 'time-outline' },
    { value: 'price-asc', label: 'Price: Low to High', icon: 'arrow-up-outline' },
    { value: 'price-desc', label: 'Price: High to Low', icon: 'arrow-down-outline' },
    { value: 'rating', label: 'Highest Rated', icon: 'star-outline' },
];

export function FilterSortModal({
    visible,
    onClose,
    onApply,
    currentFilters,
    currentSort,
    availableCategories = [],
    availableBrands = [],
    priceRange = { min: 0, max: 1000 },
    resultCount,
}: FilterSortProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [activeTab, setActiveTab] = useState<'filter' | 'sort'>('filter');
    const [filters, setFilters] = useState<FilterOptions>(currentFilters);
    const [sort, setSort] = useState<SortOption>(currentSort);
    const [localPriceRange, setLocalPriceRange] = useState({
        min: currentFilters.priceMin ?? priceRange.min,
        max: currentFilters.priceMax ?? priceRange.max,
    });

    useEffect(() => {
        setFilters(currentFilters);
        setSort(currentSort);
        setLocalPriceRange({
            min: currentFilters.priceMin ?? priceRange.min,
            max: currentFilters.priceMax ?? priceRange.max,
        });
    }, [currentFilters, currentSort, priceRange, visible]);

    const handleApply = () => {
        onApply(
            {
                ...filters,
                priceMin: localPriceRange.min > priceRange.min ? localPriceRange.min : undefined,
                priceMax: localPriceRange.max < priceRange.max ? localPriceRange.max : undefined,
            },
            sort
        );
    };

    const handleReset = () => {
        setFilters({});
        setSort('popular');
        setLocalPriceRange(priceRange);
    };

    const toggleCategory = (categoryId: string) => {
        setFilters(f => {
            const categories = f.categories || [];
            if (categories.includes(categoryId)) {
                return { ...f, categories: categories.filter(c => c !== categoryId) };
            }
            return { ...f, categories: [...categories, categoryId] };
        });
    };

    const toggleBrand = (brandId: string) => {
        setFilters(f => {
            const brands = f.brands || [];
            if (brands.includes(brandId)) {
                return { ...f, brands: brands.filter(b => b !== brandId) };
            }
            return { ...f, brands: [...brands, brandId] };
        });
    };

    const toggleRating = (rating: number) => {
        setFilters(f => {
            const ratings = f.ratings || [];
            if (ratings.includes(rating)) {
                return { ...f, ratings: ratings.filter(r => r !== rating) };
            }
            return { ...f, ratings: [...ratings, rating] };
        });
    };

    const renderFilterTab = () => (
        <ScrollView style={styles.scrollView}>
            {/* Price Range */}
            <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Price Range</Text>
                <View style={styles.priceLabels}>
                    <Text style={[styles.priceLabel, isDark && styles.textMuted]}>
                        ${localPriceRange.min}
                    </Text>
                    <Text style={[styles.priceLabel, isDark && styles.textMuted]}>
                        ${localPriceRange.max}
                    </Text>
                </View>
                <View style={styles.sliderContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={priceRange.min}
                        maximumValue={priceRange.max}
                        value={localPriceRange.min}
                        onValueChange={(v: number) => setLocalPriceRange(r => ({ ...r, min: Math.round(v) }))}
                        minimumTrackTintColor="#3B82F6"
                        maximumTrackTintColor={isDark ? '#374151' : '#E5E7EB'}
                        thumbTintColor="#3B82F6"
                    />
                    <Slider
                        style={styles.slider}
                        minimumValue={priceRange.min}
                        maximumValue={priceRange.max}
                        value={localPriceRange.max}
                        onValueChange={(v: number) => setLocalPriceRange(r => ({ ...r, max: Math.round(v) }))}
                        minimumTrackTintColor="#3B82F6"
                        maximumTrackTintColor={isDark ? '#374151' : '#E5E7EB'}
                        thumbTintColor="#3B82F6"
                    />
                </View>
            </View>

            {/* Categories */}
            {availableCategories.length > 0 && (
                <View style={styles.filterSection}>
                    <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Categories</Text>
                    <View style={styles.chipContainer}>
                        {availableCategories.map(category => {
                            const isSelected = filters.categories?.includes(category.id);
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.chip,
                                        isDark && styles.chipDark,
                                        isSelected && styles.chipSelected,
                                    ]}
                                    onPress={() => toggleCategory(category.id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        isDark && styles.textMuted,
                                        isSelected && styles.chipTextSelected,
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Brands */}
            {availableBrands.length > 0 && (
                <View style={styles.filterSection}>
                    <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Brands</Text>
                    <View style={styles.chipContainer}>
                        {availableBrands.map(brand => {
                            const isSelected = filters.brands?.includes(brand.id);
                            return (
                                <TouchableOpacity
                                    key={brand.id}
                                    style={[
                                        styles.chip,
                                        isDark && styles.chipDark,
                                        isSelected && styles.chipSelected,
                                    ]}
                                    onPress={() => toggleBrand(brand.id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        isDark && styles.textMuted,
                                        isSelected && styles.chipTextSelected,
                                    ]}>
                                        {brand.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Rating */}
            <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Rating</Text>
                <View style={styles.ratingOptions}>
                    {[5, 4, 3, 2, 1].map(rating => {
                        const isSelected = filters.ratings?.includes(rating);
                        return (
                            <TouchableOpacity
                                key={rating}
                                style={[
                                    styles.ratingOption,
                                    isDark && styles.ratingOptionDark,
                                    isSelected && styles.ratingOptionSelected,
                                ]}
                                onPress={() => toggleRating(rating)}
                            >
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Ionicons
                                            key={star}
                                            name={star <= rating ? 'star' : 'star-outline'}
                                            size={14}
                                            color="#F59E0B"
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.ratingText, isDark && styles.textMuted]}>& up</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* In Stock */}
            <View style={styles.filterSection}>
                <TouchableOpacity
                    style={[styles.stockOption, isDark && styles.stockOptionDark]}
                    onPress={() => setFilters(f => ({ ...f, inStock: !f.inStock }))}
                >
                    <View style={[
                        styles.checkbox,
                        isDark && styles.checkboxDark,
                        filters.inStock && styles.checkboxChecked,
                    ]}>
                        {filters.inStock && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                    </View>
                    <Text style={[styles.stockText, isDark && styles.textLight]}>In Stock Only</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderSortTab = () => (
        <View style={styles.sortContainer}>
            {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                    key={option.value}
                    style={[
                        styles.sortOption,
                        isDark && styles.sortOptionDark,
                        sort === option.value && styles.sortOptionSelected,
                    ]}
                    onPress={() => setSort(option.value)}
                >
                    <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={sort === option.value ? '#3B82F6' : isDark ? '#9CA3AF' : '#6B7280'}
                    />
                    <Text style={[
                        styles.sortText,
                        isDark && styles.textMuted,
                        sort === option.value && styles.sortTextSelected,
                    ]}>
                        {option.label}
                    </Text>
                    {sort === option.value && (
                        <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, isDark && styles.containerDark]}>
                {/* Header */}
                <View style={[styles.header, isDark && styles.headerDark]}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && styles.textLight]}>Filter & Sort</Text>
                    <TouchableOpacity onPress={handleReset}>
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={[styles.tabs, isDark && styles.tabsDark]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'filter' && styles.tabActive]}
                        onPress={() => setActiveTab('filter')}
                    >
                        <Text style={[
                            styles.tabText,
                            isDark && styles.textMuted,
                            activeTab === 'filter' && styles.tabTextActive,
                        ]}>
                            Filter
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'sort' && styles.tabActive]}
                        onPress={() => setActiveTab('sort')}
                    >
                        <Text style={[
                            styles.tabText,
                            isDark && styles.textMuted,
                            activeTab === 'sort' && styles.tabTextActive,
                        ]}>
                            Sort
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {activeTab === 'filter' ? renderFilterTab() : renderSortTab()}

                {/* Footer */}
                <View style={[styles.footer, isDark && styles.footerDark]}>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>
                            Apply{resultCount !== undefined ? ` (${resultCount} results)` : ''}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
    resetText: { fontSize: 14, color: '#3B82F6' },

    // Tabs
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tabsDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: '#3B82F6' },
    tabText: { fontSize: 14, color: '#6B7280' },
    tabTextActive: { color: '#3B82F6', fontWeight: '600' },

    // Filter
    scrollView: { flex: 1 },
    filterSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },

    // Price
    priceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceLabel: { fontSize: 14, color: '#6B7280' },
    sliderContainer: { gap: 8 },
    slider: { width: '100%', height: 40 },

    // Chips
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipDark: { backgroundColor: '#374151' },
    chipSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
    chipText: { fontSize: 14, color: '#374151' },
    chipTextSelected: { color: '#3B82F6' },

    // Rating
    ratingOptions: { gap: 8 },
    ratingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    ratingOptionDark: { backgroundColor: '#374151' },
    ratingOptionSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
    starsRow: { flexDirection: 'row' },
    ratingText: { fontSize: 14, color: '#6B7280' },

    // Stock
    stockOption: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stockOptionDark: {},
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
    stockText: { fontSize: 16, color: '#111827' },

    // Sort
    sortContainer: { padding: 16 },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    sortOptionDark: { backgroundColor: '#1F2937' },
    sortOptionSelected: { backgroundColor: '#EFF6FF' },
    sortText: { flex: 1, fontSize: 16, color: '#374151' },
    sortTextSelected: { color: '#3B82F6', fontWeight: '500' },

    // Footer
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerDark: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
    applyButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

    textLight: { color: '#F9FAFB' },
    textMuted: { color: '#9CA3AF' },
});

export default FilterSortModal;

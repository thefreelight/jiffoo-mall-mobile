/**
 * Search Screen
 * Product search with suggestions, filters, and history
 */

import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, useColorScheme, Keyboard, Image, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from '../../utils/helpers';
import { searchProducts, getSearchSuggestions, Product } from '../../services/api';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Filters state
  const [filters, setFilters] = useState({
    sortBy: 'popular' as 'price' | 'newest' | 'popular' | 'rating',
    priceMin: '',
    priceMax: '',
  });

  // Load search history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch { }
  };

  const saveToHistory = async (searchQuery: string) => {
    try {
      const newHistory = [
        searchQuery,
        ...history.filter(h => h !== searchQuery),
      ].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch { }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch { }
  };

  // Debounced search suggestions
  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }
      const response = await getSearchSuggestions(q);
      if (response.data) {
        setSuggestions(response.data);
      }
    }, 300),
    []
  );

  // Handle query change
  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      fetchSuggestions(text);
    } else {
      setSuggestions([]);
    }
  };

  // Execute search
  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    Keyboard.dismiss();
    setLoading(true);
    setSuggestions([]);

    try {
      await saveToHistory(searchQuery);
      const response = await searchProducts(searchQuery);
      if (response.data) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
      <View style={[styles.searchInputContainer, isDark && styles.searchInputContainerDark]}>
        <Ionicons name="search-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          style={[styles.searchInput, isDark && styles.textLight]}
          placeholder="Search products..."
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => executeSearch(query)}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); setResults([]); }}>
            <Ionicons name="close-circle" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[styles.filterButton, isDark && styles.filterButtonDark]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options-outline" size={20} color={isDark ? '#F9FAFB' : '#374151'} />
      </TouchableOpacity>
    </View>
  );

  // Render suggestions
  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <View style={[styles.suggestionsContainer, isDark && styles.suggestionsContainerDark]}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => {
              setQuery(suggestion);
              executeSearch(suggestion);
            }}
          >
            <Ionicons name="search-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.suggestionText, isDark && styles.textLight]}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render search history
  const renderHistory = () => {
    if (history.length === 0 || query.length > 0 || results.length > 0) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, isDark && styles.textLight]}>Recent Searches</Text>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        {history.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => {
              setQuery(item);
              executeSearch(item);
            }}
          >
            <Ionicons name="time-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.historyText, isDark && styles.textMuted]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render product result
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, isDark && styles.productCardDark]}
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
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        {item.rating && (
          <View style={styles.productRating}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render results
  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    if (results.length === 0 && query.length > 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={isDark ? '#374151' : '#D1D5DB'} />
          <Text style={[styles.emptyTitle, isDark && styles.textLight]}>No results found</Text>
          <Text style={[styles.emptySubtitle, isDark && styles.textMuted]}>
            Try different keywords or check spelling
          </Text>
        </View>
      );
    }

    if (results.length > 0) {
      return (
        <FlatList
          data={results}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.resultsContainer}
          columnWrapperStyle={styles.resultsRow}
        />
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {renderSearchBar()}
      {renderSuggestions()}
      {renderHistory()}
      {renderResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },

  // Search bar
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  searchContainerDark: { backgroundColor: '#1F2937' },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInputContainerDark: { backgroundColor: '#374151' },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#111827' },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonDark: { backgroundColor: '#374151' },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    ...StyleSheet.absoluteFillObject,
    top: 80,
    bottom: 'auto',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  suggestionsContainerDark: { backgroundColor: '#1F2937' },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionText: { fontSize: 16, color: '#111827' },

  // History
  historyContainer: { padding: 16 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  clearText: { color: '#3B82F6', fontSize: 14 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  historyText: { fontSize: 16, color: '#6B7280' },

  // Results
  resultsContainer: { padding: 8 },
  resultsRow: { gap: 8 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },

  // Product card
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 4,
    overflow: 'hidden',
  },
  productCardDark: { backgroundColor: '#1F2937' },
  productImage: { width: '100%', aspectRatio: 1 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, color: '#111827', marginBottom: 4 },
  productPrice: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
  productRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: '#6B7280' },

  // Text
  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

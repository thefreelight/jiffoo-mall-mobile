/**
 * Product Detail Screen
 * Full product information with images, variants, reviews
 */

import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useColorScheme, Dimensions, Share, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProduct, addToCart, addToWishlist, removeFromWishlist, Product, ProductVariant } from '../../services/api';
import { useCartStore } from '../../store/cart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addItem } = useCartStore();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getProduct(id);
      if (response.data) {
        setProduct(response.data);
        if (response.data.variants?.length) {
          setSelectedVariant(response.data.variants[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Add to local store
      addItem({
        id: `${product.id}-${selectedVariant?.id || 'default'}`,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        quantity,
        image: product.images[0],
      });

      // Sync to server
      await addToCart(product.id, quantity, selectedVariant?.id);

      Alert.alert('Success', 'Added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out ${product.name} - $${product.price}`,
        url: `https://jiffoo.com/product/${product.id}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = currentStock === 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.textLight]}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setSelectedImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image pagination */}
          <View style={styles.imagePagination}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === selectedImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* Action buttons */}
          <TouchableOpacity
            style={[styles.actionButton, styles.wishlistButton]}
            onPress={handleToggleWishlist}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={isWishlisted ? '#EF4444' : '#374151'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, isDark && styles.textLight]}>
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <>
                <Text style={styles.originalPrice}>
                  ${product.compareAtPrice.toFixed(2)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round((1 - currentPrice / product.compareAtPrice) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= product.rating! ? 'star' : 'star-outline'}
                    size={16}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={[styles.ratingText, isDark && styles.textMuted]}>
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </Text>
            </View>
          )}

          {/* Stock status */}
          <View style={styles.stockRow}>
            <View style={[
              styles.stockIndicator,
              isOutOfStock ? styles.stockOut : styles.stockIn
            ]} />
            <Text style={[styles.stockText, isDark && styles.textMuted]}>
              {isOutOfStock ? 'Out of Stock' : `${currentStock} in stock`}
            </Text>
          </View>
        </View>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Options</Text>
            <View style={styles.variantList}>
              {product.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantButton,
                    selectedVariant?.id === variant.id && styles.variantButtonSelected,
                    variant.stock === 0 && styles.variantButtonDisabled,
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                >
                  <Text style={[
                    styles.variantText,
                    selectedVariant?.id === variant.id && styles.variantTextSelected,
                  ]}>
                    {variant.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.quantityButton, isDark && styles.quantityButtonDark]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, isDark && styles.textLight]}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, isDark && styles.quantityButtonDark]}
              onPress={() => setQuantity(Math.min(currentStock, quantity + 1))}
            >
              <Ionicons name="add" size={20} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Description</Text>
          <Text style={[styles.description, isDark && styles.textMuted]}>
            {product.description}
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, isDark && styles.bottomBarDark]}>
        <View style={styles.totalSection}>
          <Text style={[styles.totalLabel, isDark && styles.textMuted]}>Total</Text>
          <Text style={styles.totalPrice}>${(currentPrice * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (isOutOfStock || addingToCart) && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
              <Text style={styles.addToCartText}>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  center: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6B7280' },

  // Image gallery
  imageGallery: { position: 'relative' },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
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
  actionButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistButton: { top: 16, right: 16 },
  shareButton: { top: 16, right: 64 },

  // Product info
  productInfo: { padding: 16 },
  productName: { fontSize: 22, fontWeight: '600', color: '#111827', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  price: { fontSize: 24, fontWeight: '700', color: '#3B82F6' },
  originalPrice: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  discountText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  ratingText: { fontSize: 14, color: '#6B7280' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stockIndicator: { width: 8, height: 8, borderRadius: 4 },
  stockIn: { backgroundColor: '#10B981' },
  stockOut: { backgroundColor: '#EF4444' },
  stockText: { fontSize: 14, color: '#6B7280' },

  // Section
  section: { padding: 16, backgroundColor: '#FFFFFF', marginTop: 8 },
  sectionDark: { backgroundColor: '#1F2937' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },

  // Variants
  variantList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  variantButtonSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  variantButtonDisabled: { opacity: 0.5 },
  variantText: { fontSize: 14, color: '#374151' },
  variantTextSelected: { color: '#3B82F6' },

  // Quantity
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDark: { backgroundColor: '#374151' },
  quantityText: { fontSize: 18, fontWeight: '600', color: '#111827', width: 40, textAlign: 'center' },

  // Description
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  bottomBarDark: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
  totalSection: { justifyContent: 'center' },
  totalLabel: { fontSize: 12, color: '#6B7280' },
  totalPrice: { fontSize: 20, fontWeight: '700', color: '#3B82F6' },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartButtonDisabled: { backgroundColor: '#9CA3AF' },
  addToCartText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
  bottomPadding: { height: 100 },
});

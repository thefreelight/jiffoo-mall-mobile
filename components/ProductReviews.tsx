/**
 * Product Reviews Component
 * Displays and manages product reviews
 */

import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '../utils/helpers';

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title?: string;
    content: string;
    images?: string[];
    helpful: number;
    createdAt: string;
    verified: boolean;
}

interface ReviewsProps {
    productId: string;
    reviews: Review[];
    ratingStats: {
        average: number;
        total: number;
        distribution: { [key: number]: number };
    };
    onLoadMore?: () => void;
    onSubmitReview?: (review: { rating: number; title: string; content: string }) => Promise<void>;
    onMarkHelpful?: (reviewId: string) => void;
    hasMore?: boolean;
    loading?: boolean;
    canReview?: boolean;
}

export function ProductReviews({
    productId,
    reviews,
    ratingStats,
    onLoadMore,
    onSubmitReview,
    onMarkHelpful,
    hasMore = false,
    loading = false,
    canReview = false,
}: ReviewsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReview = async () => {
        if (!newReview.content.trim()) {
            Alert.alert('Error', 'Please write a review');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmitReview?.(newReview);
            setNewReview({ rating: 5, title: '', content: '' });
            setShowReviewForm(false);
            Alert.alert('Success', 'Your review has been submitted');
        } catch (error) {
            Alert.alert('Error', 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderRatingBar = (star: number) => {
        const count = ratingStats.distribution[star] || 0;
        const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;

        return (
            <View key={star} style={styles.ratingBarRow}>
                <Text style={[styles.starLabel, isDark && styles.textMuted]}>{star}</Text>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <View style={[styles.ratingBarBg, isDark && styles.ratingBarBgDark]}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={[styles.countLabel, isDark && styles.textMuted]}>{count}</Text>
            </View>
        );
    };

    const renderReviewItem = ({ item }: { item: Review }) => (
        <View style={[styles.reviewCard, isDark && styles.reviewCardDark]}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    {item.userAvatar ? (
                        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
                            <Ionicons name="person" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
                        </View>
                    )}
                    <View>
                        <View style={styles.nameRow}>
                            <Text style={[styles.reviewerName, isDark && styles.textLight]}>{item.userName}</Text>
                            {item.verified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.reviewDate, isDark && styles.textMuted]}>
                            {formatRelativeTime(item.createdAt)}
                        </Text>
                    </View>
                </View>
                <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Ionicons
                            key={star}
                            name={star <= item.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#F59E0B"
                        />
                    ))}
                </View>
            </View>

            {item.title && (
                <Text style={[styles.reviewTitle, isDark && styles.textLight]}>{item.title}</Text>
            )}

            <Text style={[styles.reviewContent, isDark && styles.textMuted]}>{item.content}</Text>

            {item.images && item.images.length > 0 && (
                <View style={styles.reviewImages}>
                    {item.images.slice(0, 4).map((img, idx) => (
                        <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
                    ))}
                </View>
            )}

            <View style={styles.reviewFooter}>
                <TouchableOpacity
                    style={styles.helpfulButton}
                    onPress={() => onMarkHelpful?.(item.id)}
                >
                    <Ionicons name="thumbs-up-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.helpfulText, isDark && styles.textMuted]}>
                        Helpful ({item.helpful})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View>
            {/* Rating Summary */}
            <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
                <View style={styles.summaryLeft}>
                    <Text style={styles.averageRating}>{ratingStats.average.toFixed(1)}</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Ionicons
                                key={star}
                                name={star <= Math.round(ratingStats.average) ? 'star' : 'star-outline'}
                                size={18}
                                color="#F59E0B"
                            />
                        ))}
                    </View>
                    <Text style={[styles.totalReviews, isDark && styles.textMuted]}>
                        {ratingStats.total} reviews
                    </Text>
                </View>
                <View style={styles.summaryRight}>
                    {[5, 4, 3, 2, 1].map(renderRatingBar)}
                </View>
            </View>

            {/* Write Review Button */}
            {canReview && !showReviewForm && (
                <TouchableOpacity
                    style={[styles.writeReviewButton, isDark && styles.writeReviewButtonDark]}
                    onPress={() => setShowReviewForm(true)}
                >
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                    <Text style={styles.writeReviewText}>Write a Review</Text>
                </TouchableOpacity>
            )}

            {/* Review Form */}
            {showReviewForm && (
                <View style={[styles.reviewForm, isDark && styles.reviewFormDark]}>
                    <Text style={[styles.formLabel, isDark && styles.textLight]}>Your Rating</Text>
                    <View style={styles.ratingSelector}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity key={star} onPress={() => setNewReview(r => ({ ...r, rating: star }))}>
                                <Ionicons
                                    name={star <= newReview.rating ? 'star' : 'star-outline'}
                                    size={32}
                                    color="#F59E0B"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.formLabel, isDark && styles.textLight]}>Title (Optional)</Text>
                    <TextInput
                        style={[styles.titleInput, isDark && styles.inputDark]}
                        placeholder="Summarize your review"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={newReview.title}
                        onChangeText={title => setNewReview(r => ({ ...r, title }))}
                    />

                    <Text style={[styles.formLabel, isDark && styles.textLight]}>Review</Text>
                    <TextInput
                        style={[styles.contentInput, isDark && styles.inputDark]}
                        placeholder="Share your experience with this product"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={newReview.content}
                        onChangeText={content => setNewReview(r => ({ ...r, content }))}
                        multiline
                        numberOfLines={4}
                    />

                    <View style={styles.formButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowReviewForm(false)}
                        >
                            <Text style={[styles.cancelButtonText, isDark && styles.textLight]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmitReview}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Customer Reviews</Text>
        </View>
    );

    const renderFooter = () => {
        if (!hasMore || !onLoadMore) return null;
        return (
            <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
                {loading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                    <Text style={styles.loadMoreText}>Load More Reviews</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color={isDark ? '#374151' : '#D1D5DB'} />
            <Text style={[styles.emptyText, isDark && styles.textMuted]}>No reviews yet</Text>
            <Text style={[styles.emptySubtext, isDark && styles.textMuted]}>
                Be the first to review this product
            </Text>
        </View>
    );

    return (
        <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
        />
    );
}

const styles = StyleSheet.create({
    listContent: { padding: 16 },

    // Summary card
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        marginBottom: 16,
    },
    summaryCardDark: { backgroundColor: '#1F2937' },
    summaryLeft: { alignItems: 'center', marginRight: 24 },
    averageRating: { fontSize: 48, fontWeight: 'bold', color: '#3B82F6' },
    starsRow: { flexDirection: 'row', marginVertical: 4 },
    totalReviews: { fontSize: 14, color: '#6B7280' },
    summaryRight: { flex: 1 },
    ratingBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    starLabel: { fontSize: 12, width: 12, color: '#6B7280', marginRight: 4 },
    ratingBarBg: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginHorizontal: 8 },
    ratingBarBgDark: { backgroundColor: '#374151' },
    ratingBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 4 },
    countLabel: { fontSize: 12, width: 30, color: '#6B7280', textAlign: 'right' },

    // Write review
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    writeReviewButtonDark: { backgroundColor: '#1E3A5F' },
    writeReviewText: { fontSize: 16, color: '#3B82F6', fontWeight: '500' },

    // Review form
    reviewForm: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    reviewFormDark: { backgroundColor: '#1F2937' },
    formLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8, marginTop: 12 },
    ratingSelector: { flexDirection: 'row', gap: 8 },
    titleInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    contentInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputDark: { backgroundColor: '#374151', color: '#F9FAFB' },
    formButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#F3F4F6' },
    cancelButtonText: { fontSize: 16, color: '#374151' },
    submitButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#3B82F6' },
    submitButtonDisabled: { backgroundColor: '#9CA3AF' },
    submitButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },

    // Section
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },

    // Review card
    reviewCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
    reviewCardDark: { backgroundColor: '#1F2937' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarPlaceholderDark: { backgroundColor: '#374151' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reviewerName: { fontSize: 14, fontWeight: '500', color: '#111827' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    verifiedText: { fontSize: 10, color: '#10B981' },
    reviewDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    ratingStars: { flexDirection: 'row' },
    reviewTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
    reviewContent: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
    reviewImages: { flexDirection: 'row', gap: 8, marginTop: 12 },
    reviewImage: { width: 60, height: 60, borderRadius: 8 },
    reviewFooter: { marginTop: 12 },
    helpfulButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    helpfulText: { fontSize: 12, color: '#6B7280' },

    // Load more
    loadMoreButton: { padding: 16, alignItems: 'center' },
    loadMoreText: { fontSize: 14, color: '#3B82F6' },

    // Empty
    emptyContainer: { alignItems: 'center', padding: 32 },
    emptyText: { fontSize: 16, fontWeight: '500', color: '#6B7280', marginTop: 12 },
    emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },

    textLight: { color: '#F9FAFB' },
    textMuted: { color: '#9CA3AF' },
});

export default ProductReviews;

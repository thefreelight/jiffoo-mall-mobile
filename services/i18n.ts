/**
 * Internationalization (i18n) Service
 * Handles translations and locale management
 */

import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Storage key
const LOCALE_KEY = 'app_locale';

// Supported locales
export const SUPPORTED_LOCALES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code'];

// Translation keys
export interface TranslationKeys {
    // Common
    'common.loading': string;
    'common.error': string;
    'common.success': string;
    'common.cancel': string;
    'common.confirm': string;
    'common.save': string;
    'common.delete': string;
    'common.edit': string;
    'common.back': string;
    'common.next': string;
    'common.done': string;
    'common.search': string;
    'common.seeAll': string;

    // Auth
    'auth.signIn': string;
    'auth.signUp': string;
    'auth.signOut': string;
    'auth.email': string;
    'auth.password': string;
    'auth.forgotPassword': string;
    'auth.resetPassword': string;
    'auth.createAccount': string;
    'auth.orContinueWith': string;

    // Home
    'home.welcome': string;
    'home.categories': string;
    'home.featured': string;
    'home.newArrivals': string;
    'home.bestSellers': string;
    'home.searchProducts': string;

    // Product
    'product.addToCart': string;
    'product.buyNow': string;
    'product.outOfStock': string;
    'product.inStock': string;
    'product.reviews': string;
    'product.description': string;
    'product.quantity': string;
    'product.options': string;

    // Cart
    'cart.title': string;
    'cart.empty': string;
    'cart.subtotal': string;
    'cart.shipping': string;
    'cart.tax': string;
    'cart.total': string;
    'cart.checkout': string;
    'cart.applyCoupon': string;
    'cart.removeCoupon': string;
    'cart.freeShipping': string;

    // Checkout
    'checkout.title': string;
    'checkout.shipping': string;
    'checkout.payment': string;
    'checkout.review': string;
    'checkout.placeOrder': string;
    'checkout.shippingAddress': string;
    'checkout.paymentMethod': string;
    'checkout.orderSummary': string;

    // Orders
    'orders.title': string;
    'orders.empty': string;
    'orders.status.pending': string;
    'orders.status.confirmed': string;
    'orders.status.processing': string;
    'orders.status.shipped': string;
    'orders.status.delivered': string;
    'orders.status.cancelled': string;
    'orders.trackOrder': string;

    // Profile
    'profile.title': string;
    'profile.editProfile': string;
    'profile.addresses': string;
    'profile.paymentMethods': string;
    'profile.wishlist': string;
    'profile.notifications': string;
    'profile.language': string;
    'profile.currency': string;
    'profile.help': string;
    'profile.about': string;
    'profile.logout': string;
}

// Translations
const translations: Record<LocaleCode, TranslationKeys> = {
    en: {
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.done': 'Done',
        'common.search': 'Search',
        'common.seeAll': 'See All',

        // Auth
        'auth.signIn': 'Sign In',
        'auth.signUp': 'Sign Up',
        'auth.signOut': 'Sign Out',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.forgotPassword': 'Forgot Password?',
        'auth.resetPassword': 'Reset Password',
        'auth.createAccount': 'Create Account',
        'auth.orContinueWith': 'or continue with',

        // Home
        'home.welcome': 'Welcome',
        'home.categories': 'Categories',
        'home.featured': 'Featured Products',
        'home.newArrivals': 'New Arrivals',
        'home.bestSellers': 'Best Sellers',
        'home.searchProducts': 'Search products...',

        // Product
        'product.addToCart': 'Add to Cart',
        'product.buyNow': 'Buy Now',
        'product.outOfStock': 'Out of Stock',
        'product.inStock': 'In Stock',
        'product.reviews': 'Reviews',
        'product.description': 'Description',
        'product.quantity': 'Quantity',
        'product.options': 'Options',

        // Cart
        'cart.title': 'Shopping Cart',
        'cart.empty': 'Your cart is empty',
        'cart.subtotal': 'Subtotal',
        'cart.shipping': 'Shipping',
        'cart.tax': 'Tax',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout',
        'cart.applyCoupon': 'Apply Coupon',
        'cart.removeCoupon': 'Remove',
        'cart.freeShipping': 'Free Shipping',

        // Checkout
        'checkout.title': 'Checkout',
        'checkout.shipping': 'Shipping',
        'checkout.payment': 'Payment',
        'checkout.review': 'Review',
        'checkout.placeOrder': 'Place Order',
        'checkout.shippingAddress': 'Shipping Address',
        'checkout.paymentMethod': 'Payment Method',
        'checkout.orderSummary': 'Order Summary',

        // Orders
        'orders.title': 'My Orders',
        'orders.empty': 'No orders yet',
        'orders.status.pending': 'Pending',
        'orders.status.confirmed': 'Confirmed',
        'orders.status.processing': 'Processing',
        'orders.status.shipped': 'Shipped',
        'orders.status.delivered': 'Delivered',
        'orders.status.cancelled': 'Cancelled',
        'orders.trackOrder': 'Track Order',

        // Profile
        'profile.title': 'Profile',
        'profile.editProfile': 'Edit Profile',
        'profile.addresses': 'Addresses',
        'profile.paymentMethods': 'Payment Methods',
        'profile.wishlist': 'Wishlist',
        'profile.notifications': 'Notifications',
        'profile.language': 'Language',
        'profile.currency': 'Currency',
        'profile.help': 'Help Center',
        'profile.about': 'About',
        'profile.logout': 'Logout',
    },

    zh: {
        // Common
        'common.loading': '加载中...',
        'common.error': '错误',
        'common.success': '成功',
        'common.cancel': '取消',
        'common.confirm': '确认',
        'common.save': '保存',
        'common.delete': '删除',
        'common.edit': '编辑',
        'common.back': '返回',
        'common.next': '下一步',
        'common.done': '完成',
        'common.search': '搜索',
        'common.seeAll': '查看全部',

        // Auth
        'auth.signIn': '登录',
        'auth.signUp': '注册',
        'auth.signOut': '退出登录',
        'auth.email': '邮箱',
        'auth.password': '密码',
        'auth.forgotPassword': '忘记密码？',
        'auth.resetPassword': '重置密码',
        'auth.createAccount': '创建账户',
        'auth.orContinueWith': '或使用以下方式继续',

        // Home
        'home.welcome': '欢迎',
        'home.categories': '分类',
        'home.featured': '精选商品',
        'home.newArrivals': '新品上架',
        'home.bestSellers': '热销商品',
        'home.searchProducts': '搜索商品...',

        // Product
        'product.addToCart': '加入购物车',
        'product.buyNow': '立即购买',
        'product.outOfStock': '缺货',
        'product.inStock': '有货',
        'product.reviews': '评价',
        'product.description': '商品描述',
        'product.quantity': '数量',
        'product.options': '规格',

        // Cart
        'cart.title': '购物车',
        'cart.empty': '购物车是空的',
        'cart.subtotal': '小计',
        'cart.shipping': '运费',
        'cart.tax': '税费',
        'cart.total': '合计',
        'cart.checkout': '结算',
        'cart.applyCoupon': '使用优惠券',
        'cart.removeCoupon': '移除',
        'cart.freeShipping': '免运费',

        // Checkout
        'checkout.title': '结算',
        'checkout.shipping': '配送',
        'checkout.payment': '支付',
        'checkout.review': '确认',
        'checkout.placeOrder': '提交订单',
        'checkout.shippingAddress': '收货地址',
        'checkout.paymentMethod': '支付方式',
        'checkout.orderSummary': '订单摘要',

        // Orders
        'orders.title': '我的订单',
        'orders.empty': '暂无订单',
        'orders.status.pending': '待处理',
        'orders.status.confirmed': '已确认',
        'orders.status.processing': '处理中',
        'orders.status.shipped': '已发货',
        'orders.status.delivered': '已送达',
        'orders.status.cancelled': '已取消',
        'orders.trackOrder': '追踪订单',

        // Profile
        'profile.title': '我的',
        'profile.editProfile': '编辑资料',
        'profile.addresses': '收货地址',
        'profile.paymentMethods': '支付方式',
        'profile.wishlist': '收藏夹',
        'profile.notifications': '通知设置',
        'profile.language': '语言',
        'profile.currency': '货币',
        'profile.help': '帮助中心',
        'profile.about': '关于',
        'profile.logout': '退出登录',
    },

    // 其他语言使用英语作为后备
    'zh-TW': {} as TranslationKeys,
    ja: {} as TranslationKeys,
    ko: {} as TranslationKeys,
    es: {} as TranslationKeys,
    fr: {} as TranslationKeys,
    de: {} as TranslationKeys,
};

// Fill missing translations with English
for (const locale of SUPPORTED_LOCALES) {
    if (locale.code !== 'en' && locale.code !== 'zh') {
        translations[locale.code] = { ...translations.en };
    }
}

// ============================================
// i18n Store
// ============================================

interface I18nState {
    locale: LocaleCode;
    setLocale: (locale: LocaleCode) => void;
    t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string;
}

export const useI18n = create<I18nState>()(
    persist(
        (set, get) => ({
            locale: getDeviceLocale(),

            setLocale: (locale) => {
                set({ locale });
            },

            t: (key, params) => {
                const { locale } = get();
                let text = translations[locale]?.[key] || translations.en[key] || key;

                // Replace parameters
                if (params) {
                    for (const [param, value] of Object.entries(params)) {
                        text = text.replace(`{{${param}}}`, String(value));
                    }
                }

                return text;
            },
        }),
        {
            name: 'i18n-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ locale: state.locale }),
        }
    )
);

/**
 * Get device locale
 */
function getDeviceLocale(): LocaleCode {
    const locales = getLocales();
    if (locales.length === 0) return 'en';

    const deviceLocale = locales[0].languageCode;

    // Find matching supported locale
    for (const supported of SUPPORTED_LOCALES) {
        if (supported.code === deviceLocale || supported.code.startsWith(deviceLocale || '')) {
            return supported.code;
        }
    }

    return 'en';
}

/**
 * Hook to get translation function
 */
export function useTranslation() {
    const { locale, t, setLocale } = useI18n();
    return { locale, t, setLocale };
}

/**
 * Get locale info
 */
export function getLocaleInfo(code: LocaleCode) {
    return SUPPORTED_LOCALES.find(l => l.code === code) || SUPPORTED_LOCALES[0];
}

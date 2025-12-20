/**
 * Profile Screen
 * User profile and settings
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Image, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { getProfile, User } from '../../services/api';
import { isBiometricAvailable, getBiometricTypeName, isBiometricLoginEnabled, setBiometricLoginEnabled } from '../../services/biometric';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  value?: string;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    loadProfile();
    checkBiometric();
  }, []);

  const loadProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const response = await getProfile();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
    if (available) {
      const name = await getBiometricTypeName();
      setBiometricName(name);
      const enabled = await isBiometricLoginEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      await setBiometricLoginEnabled(value);
      setBiometricEnabled(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update biometric setting');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const accountMenuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => router.push('/profile/edit' as any),
      showArrow: true,
    },
    {
      id: 'addresses',
      icon: 'location-outline',
      label: 'Shipping Addresses',
      onPress: () => router.push('/profile/addresses' as any),
      showArrow: true,
    },
    {
      id: 'payment',
      icon: 'card-outline',
      label: 'Payment Methods',
      onPress: () => router.push('/profile/payment' as any),
      showArrow: true,
    },
    {
      id: 'wishlist',
      icon: 'heart-outline',
      label: 'Wishlist',
      onPress: () => router.push('/profile/wishlist' as any),
      showArrow: true,
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => router.push('/profile/notifications' as any),
      showArrow: true,
    },
    {
      id: 'language',
      icon: 'language-outline',
      label: 'Language',
      onPress: () => router.push('/profile/language' as any),
      value: 'English',
      showArrow: true,
    },
    {
      id: 'currency',
      icon: 'cash-outline',
      label: 'Currency',
      onPress: () => router.push('/profile/currency' as any),
      value: 'USD',
      showArrow: true,
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help Center',
      onPress: () => router.push('/profile/help' as any),
      showArrow: true,
    },
    {
      id: 'contact',
      icon: 'chatbubble-outline',
      label: 'Contact Us',
      onPress: () => router.push('/profile/contact' as any),
      showArrow: true,
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => router.push('/profile/about' as any),
      showArrow: true,
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isDark && styles.menuItemDark]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, isDark && styles.menuIconDark]}>
          <Ionicons name={item.icon as any} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </View>
        <Text style={[styles.menuLabel, isDark && styles.textLight]}>{item.label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.value && (
          <Text style={[styles.menuValue, isDark && styles.textMuted]}>{item.value}</Text>
        )}
        {item.showArrow && (
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.center, isDark && styles.containerDark]}>
        <Ionicons name="person-circle-outline" size={80} color={isDark ? '#374151' : '#D1D5DB'} />
        <Text style={[styles.guestTitle, isDark && styles.textLight]}>Welcome!</Text>
        <Text style={[styles.guestSubtitle, isDark && styles.textMuted]}>
          Sign in to access your account
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={[styles.registerButtonText, isDark && styles.textLight]}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, isDark && styles.profileHeaderDark]}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
              <Ionicons name="person" size={40} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </View>
          )}
        </View>
        <Text style={[styles.userName, isDark && styles.textLight]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, isDark && styles.textMuted]}>
          {user?.email}
        </Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>Account</Text>
        {accountMenuItems.map(renderMenuItem)}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>Settings</Text>
        {settingsMenuItems.map(renderMenuItem)}

        {/* Biometric toggle */}
        {biometricAvailable && (
          <View style={[styles.menuItem, isDark && styles.menuItemDark]}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, isDark && styles.menuIconDark]}>
                <Ionicons name="finger-print-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <Text style={[styles.menuLabel, isDark && styles.textLight]}>{biometricName} Login</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
              thumbColor={biometricEnabled ? '#3B82F6' : '#F9FAFB'}
            />
          </View>
        )}
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>Support</Text>
        {supportMenuItems.map(renderMenuItem)}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },

  // Guest state
  guestTitle: { fontSize: 24, fontWeight: '600', color: '#111827', marginTop: 16 },
  guestSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  signInButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  signInButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  registerButton: { marginTop: 16 },
  registerButtonText: { color: '#3B82F6', fontSize: 14, fontWeight: '500' },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  profileHeaderDark: { backgroundColor: '#1F2937' },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderDark: { backgroundColor: '#374151' },
  userName: { fontSize: 20, fontWeight: '600', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  // Section
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Menu item
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDark: { backgroundColor: '#374151' },
  menuLabel: { fontSize: 16, color: '#111827' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuValue: { fontSize: 14, color: '#9CA3AF' },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },

  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
  bottomPadding: { height: 100 },
});

import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="storefront" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, isDark && styles.textLight]}>Welcome Back</Text>
          <Text style={[styles.subtitle, isDark && styles.textMuted]}>Sign in to continue shopping</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.input, isDark && styles.textLight]}
              placeholder="Email"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.input, isDark && styles.textLight]}
              placeholder="Password"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        {/* OAuth */}
        <View style={styles.oauth}>
          <View style={styles.divider}>
            <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
            <Text style={[styles.dividerText, isDark && styles.textMuted]}>or continue with</Text>
            <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
          </View>

          <View style={styles.oauthButtons}>
            <TouchableOpacity style={[styles.oauthButton, isDark && styles.oauthButtonDark]}>
              <Ionicons name="logo-google" size={24} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.oauthButton, isDark && styles.oauthButtonDark]}>
              <Ionicons name="logo-apple" size={24} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.oauthButton, isDark && styles.oauthButtonDark]}>
              <Ionicons name="logo-facebook" size={24} color={isDark ? '#F9FAFB' : '#374151'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, isDark && styles.textMuted]}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  form: { marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  inputContainerDark: { backgroundColor: '#1F2937' },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotPasswordText: { color: '#3B82F6', fontSize: 14, fontWeight: '500' },
  loginButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  oauth: { marginBottom: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerLineDark: { backgroundColor: '#374151' },
  dividerText: { marginHorizontal: 12, color: '#6B7280', fontSize: 14 },
  oauthButtons: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  oauthButton: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  oauthButtonDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#6B7280', fontSize: 14 },
  registerLink: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

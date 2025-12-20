import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textLight]}>Create Account</Text>
          <Text style={[styles.subtitle, isDark && styles.textMuted]}>Sign up to start shopping</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.input, isDark && styles.textLight]}
              placeholder="Full Name"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              style={[styles.input, isDark && styles.textLight]}
              placeholder="Confirm Password"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={[styles.terms, isDark && styles.textMuted]}>
          By signing up, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, isDark && styles.textMuted]}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  form: { marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  inputContainerDark: { backgroundColor: '#1F2937' },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  registerButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  terms: { textAlign: 'center', fontSize: 12, color: '#6B7280', marginBottom: 24 },
  termsLink: { color: '#3B82F6' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

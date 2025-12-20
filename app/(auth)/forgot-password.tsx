import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send reset email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, styles.centered, isDark && styles.containerDark]}>
        <View style={styles.successIcon}>
          <Ionicons name="mail" size={48} color="#FFFFFF" />
        </View>
        <Text style={[styles.successTitle, isDark && styles.textLight]}>Check Your Email</Text>
        <Text style={[styles.successText, isDark && styles.textMuted]}>
          We've sent a password reset link to {email}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textLight]}>Reset Password</Text>
          <Text style={[styles.subtitle, isDark && styles.textMuted]}>
            Enter your email and we'll send you a link to reset your password
          </Text>
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

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 8, lineHeight: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, gap: 12 },
  inputContainerDark: { backgroundColor: '#1F2937' },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  resetButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  resetButtonDisabled: { opacity: 0.7 },
  resetButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  successText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  backButton: { backgroundColor: '#3B82F6', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  textLight: { color: '#F9FAFB' },
  textMuted: { color: '#9CA3AF' },
});

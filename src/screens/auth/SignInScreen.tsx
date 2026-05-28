import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../hooks/useAuth';
import {signInSchema, type SignInData} from '../../schemas/auth';
import {Input, Button, GoogleSignInButton, AppleSignInButton} from '../../components';
import {useAppDispatch} from '../../store';
import {setError as setAuthError} from '../../store/slices/authSlice';
import type {AuthStackParamList} from '../../types/navigation';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const {signIn, signInWithGoogle, signInWithApple, loading, error} = useAuth();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {email: '', password: ''},
  });

  const onSubmit = (data: SignInData) => {
    signIn(data.email, data.password);
  };

  const handleGoogleSuccess = (idToken: string, accessToken: string) => {
    signInWithGoogle(idToken, accessToken);
  };

  const handleAppleSuccess = (idToken: string, fullName?: any) => {
    signInWithApple(idToken, fullName);
  };

  const handleOAuthError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : 'Đăng nhập với nhà cung cấp thất bại';
    dispatch(setAuthError(message));
  };

  return (
    <KeyboardAvoidingView
      testID="signin-screen"
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

        <View style={styles.oauthSection}>
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleOAuthError}
            loading={loading}
          />
          <AppleSignInButton
            onSuccess={handleAppleSuccess}
            onError={handleOAuthError}
            loading={loading}
          />
        </View>

        <View style={styles.dividerSection}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.divider} />
        </View>

        <Controller
          control={control}
          name="email"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              testID="signin-email-input"
              label="Email"
              placeholder="email@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              testID="signin-password-input"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <TouchableOpacity
          testID="signin-forgot-password-btn"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {error && (
          <Text testID="signin-error-message" style={styles.error}>
            {error}
          </Text>
        )}

        <Button
          testID="signin-submit-btn"
          title="Đăng nhập"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />

        <TouchableOpacity
          testID="signin-goto-signup-btn"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.linkBtn}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  oauthSection: {
    marginBottom: 24,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 13,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 8,
  },
  forgotText: {
    color: '#2563EB',
    fontSize: 14,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 24,
  },
  linkBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563EB',
    fontSize: 15,
  },
});

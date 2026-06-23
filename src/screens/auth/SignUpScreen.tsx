import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks';
import { signUpSchema, type SignUpData } from '../../schemas';
import { PressableOpacity, Input, Button, GoogleSignInButton, AppleSignInButton } from '../../components';
import { useAppDispatch } from '../../store';
import { setError as setAuthError } from '../../store/slices/authSlice';
import { setUserRole } from '../../utils';
import { resendEmailConfirmation } from '../../services';
import type { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const {
    signUp,
    signInWithGoogle,
    signInWithApple,
    loading,
    error,
    session,
    user,
  } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>(
    'tenant',
  );
  const submittedEmailRef = React.useRef<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const prevLoadingRef = React.useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'tenant',
    },
  });

  useEffect(() => {
    if (session && !user) {
      navigation.replace('RoleSelection');
    }
  }, [navigation, session, user]);

  useEffect(() => {
    if (
      submittedEmailRef.current &&
      prevLoadingRef.current &&
      !loading &&
      !error &&
      !session
    ) {
      setConfirmationSent(true);
    }
    prevLoadingRef.current = loading;
  }, [error, loading, session]);

  const onSubmit = (data: SignUpData) => {
    submittedEmailRef.current = data.email;
    setConfirmationSent(false);
    signUp(data.email, data.password, data.full_name, selectedRole);
  };

  const handleResendConfirmation = async () => {
    if (!submittedEmailRef.current) {
      return;
    }

    try {
      await resendEmailConfirmation(submittedEmailRef.current);
      Alert.alert('Da gui lai', 'Vui long kiem tra email xac nhan.');
    } catch (err: any) {
      Alert.alert('Loi', err?.message ?? 'Khong gui lai duoc email xac nhan');
    }
  };

  const handleGoogleSuccess = (idToken: string, accessToken: string) => {
    setUserRole(selectedRole);
    signInWithGoogle(idToken, accessToken);
  };

  const handleAppleSuccess = (idToken: string, fullName?: any) => {
    setUserRole(selectedRole);
    signInWithApple(idToken, fullName);
  };

  const handleOAuthError = (err: unknown) => {
    const message =
      err instanceof Error
        ? err.message
        : 'Đăng nhập với nhà cung cấp thất bại';
    dispatch(setAuthError(message));
  };

  return (
    <KeyboardAvoidingView
      testID="signup-screen"
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tạo tài khoản</Text>

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

        <View style={styles.roleSelector}>
          <PressableOpacity
            testID="signup-role-tenant-btn"
            style={[
              styles.roleBtn,
              selectedRole === 'tenant' && styles.roleBtnActive,
            ]}
            onPress={() => setSelectedRole('tenant')}
          >
            <Text
              style={[
                styles.roleText,
                selectedRole === 'tenant' && styles.roleTextActive,
              ]}
            >
              Người thuê
            </Text>
          </PressableOpacity>
          <PressableOpacity
            testID="signup-role-landlord-btn"
            style={[
              styles.roleBtn,
              selectedRole === 'landlord' && styles.roleBtnActive,
            ]}
            onPress={() => setSelectedRole('landlord')}
          >
            <Text
              style={[
                styles.roleText,
                selectedRole === 'landlord' && styles.roleTextActive,
              ]}
            >
              Chủ nhà
            </Text>
          </PressableOpacity>
        </View>

        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              testID="signup-fullname-input"
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.full_name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              testID="signup-email-input"
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
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              testID="signup-password-input"
              label="Mật khẩu"
              placeholder="Tối thiểu 6 ký tự"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              testID="signup-confirm-password-input"
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry
            />
          )}
        />

        {error && (
          <Text testID="signup-error-message" style={styles.error}>
            {error}
          </Text>
        )}

        {confirmationSent && (
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationTitle}>Kiem tra email</Text>
            <Text style={styles.confirmationText}>
              Tai khoan da duoc tao. Hay mo link xac nhan trong email truoc khi
              dang nhap.
            </Text>
            <Button
              title="Gui lai email xac nhan"
              onPress={handleResendConfirmation}
              variant="outline"
              style={styles.resendBtn}
            />
          </View>
        )}

        <Button
          testID="signup-submit-btn"
          title="Đăng ký"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />

        <PressableOpacity
          testID="signup-goto-signin-btn"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.linkBtn}
        >
          <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
        </PressableOpacity>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
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
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  roleTextActive: {
    color: '#2563EB',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  confirmationBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  confirmationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  confirmationText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  resendBtn: {
    marginTop: 12,
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

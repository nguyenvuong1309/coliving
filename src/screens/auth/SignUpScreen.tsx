import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../hooks/useAuth';
import {signUpSchema, type SignUpData} from '../../schemas/auth';
import {Input} from '../../components';
import {Button} from '../../components';
import type {AuthStackParamList} from '../../types/navigation';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const {signUp, loading, error} = useAuth();
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>(
    'tenant',
  );

  const {
    control,
    handleSubmit,
    formState: {errors},
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

  const onSubmit = (data: SignUpData) => {
    signUp(data.email, data.password, data.full_name, selectedRole);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản</Text>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'tenant' && styles.roleBtnActive,
            ]}
            onPress={() => setSelectedRole('tenant')}>
            <Text
              style={[
                styles.roleText,
                selectedRole === 'tenant' && styles.roleTextActive,
              ]}>
              Người thuê
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'landlord' && styles.roleBtnActive,
            ]}
            onPress={() => setSelectedRole('landlord')}>
            <Text
              style={[
                styles.roleText,
                selectedRole === 'landlord' && styles.roleTextActive,
              ]}>
              Chủ nhà
            </Text>
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="full_name"
          render={({field: {onChange, onBlur, value}}) => (
            <Input
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
          render={({field: {onChange, onBlur, value}}) => (
            <Input
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
          render={({field: {onChange, onBlur, value}}) => (
            <Input
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

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          title="Đăng ký"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.linkBtn}>
          <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
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

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from '../../schemas/auth';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ForgotPasswordScreen() {
  const { resetPassword, loading } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordData) => {
    resetPassword(data.email);
    setSent(true);
  };

  if (sent) {
    return (
      <View testID="forgotpassword-screen" style={styles.container}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Email đã gửi!</Text>
        <Text style={styles.desc}>
          Kiểm tra hộp thư và làm theo hướng dẫn để đặt lại mật khẩu.
        </Text>
      </View>
    );
  }

  return (
    <View testID="forgotpassword-screen" style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.desc}>
        Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            testID="forgot-password-email-input"
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

      <Button
        testID="forgot-password-submit-btn"
        title="Gửi link đặt lại"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingTop: 40,
  },
  icon: {
    fontSize: 48,
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  submitBtn: {
    marginTop: 16,
  },
});

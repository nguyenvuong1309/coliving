import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApartment } from '../../hooks/useApartment';
import {
  joinApartmentSchema,
  type JoinApartmentData,
} from '../../schemas/auth';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function JoinApartmentScreen() {
  const { joinApartment, loading, error } = useApartment();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinApartmentData>({
    resolver: zodResolver(joinApartmentSchema),
    defaultValues: { invite_code: '' },
  });

  const onSubmit = (data: JoinApartmentData) => {
    joinApartment(data.invite_code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tham gia căn hộ</Text>
      <Text style={styles.desc}>
        Nhập mã mời từ chủ nhà để tham gia căn hộ của bạn.
      </Text>

      <Controller
        control={control}
        name="invite_code"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Mã mời"
            placeholder="Nhập mã 8 ký tự"
            value={value}
            onChangeText={text => onChange(text.toUpperCase())}
            onBlur={onBlur}
            error={errors.invite_code?.message}
            autoCapitalize="characters"
          />
        )}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title="Tham gia"
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
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 24,
  },
});

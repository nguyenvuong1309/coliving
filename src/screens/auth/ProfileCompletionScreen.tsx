import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { PressableOpacity, Input, Button } from '../../components';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLoading, setError, setUser } from '../../store/slices/authSlice';
import { supabase } from '../../config/supabase';
import { getUserRole, setAuthToken } from '../../utils';
import type { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ProfileCompletion'>;

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không quá 100 ký tự'),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfileCompletionScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { session, loading, error } = useAppSelector(state => state.auth);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '' },
  });

  // Get user metadata on mount
  useEffect(() => {
    if (session?.user?.user_metadata?.full_name) {
      setValue('full_name', session.user.user_metadata.full_name);
    }
  }, [session, setValue]);

  const onSubmit = async (data: ProfileData) => {
    try {
      setIsSaving(true);
      dispatch(setLoading(true));

      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const role = getUserRole();
      if (!role) {
        throw new Error('Role not selected');
      }

      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: data.full_name,
          role,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (profile) {
        dispatch(setUser(profile));
      }

      // Save token
      if (session.access_token) {
        setAuthToken(session.access_token);
      }

      dispatch(setLoading(false));
      // Navigation will be handled by app.tsx based on role
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete profile';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      testID="profile-completion-screen"
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Hoàn thiện hồ sơ ✏️</Text>
        <Text style={styles.subtitle}>Cập nhật thông tin cá nhân của bạn</Text>

        {session?.user?.email && (
          <View style={styles.emailSection}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailField}>
              <Text style={styles.emailText}>{session.user.email}</Text>
            </View>
          </View>
        )}

        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              testID="profile-completion-name-input"
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.full_name?.message}
              editable={!isSaving}
            />
          )}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          testID="profile-completion-submit-btn"
          title="Lưu & Vào ứng dụng"
          onPress={handleSubmit(onSubmit)}
          loading={isSaving || loading}
          style={styles.submitBtn}
        />

        <PressableOpacity
          onPress={() => navigation.navigate('RoleSelection')}
          disabled={isSaving}
          style={styles.backLink}
        >
          <Text style={styles.backText}>← Quay lại</Text>
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
    marginBottom: 32,
  },
  emailSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emailField: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
  },
  emailText: {
    fontSize: 15,
    color: '#1E293B',
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
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
});

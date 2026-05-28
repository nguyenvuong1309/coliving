import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PressableOpacity from '../../components/PressableOpacity';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../store';
import { setLoading } from '../../store/slices/authSlice';
import { setUserRole } from '../../utils/mmkv';
import Button from '../../components/Button';
import type { AuthStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const [selectedRole, setSelectedRole] = useState<
    'tenant' | 'landlord' | null
  >(null);

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }
    setUserRole(selectedRole);
    dispatch(setLoading(false));
    // Navigate to profile completion or home based on app flow
    navigation.navigate('ProfileCompletion');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bạn là ai? 👤</Text>
        <Text style={styles.subtitle}>Chọn để tiếp tục</Text>

        <View style={styles.roleContainer}>
          <PressableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'tenant' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('tenant')}
          >
            <Text style={styles.roleEmoji}>🏠</Text>
            <Text style={styles.roleTitle}>Người thuê</Text>
            <Text style={styles.roleDescription}>Tôi đang tìm kiếm chỗ ở</Text>
          </PressableOpacity>

          <PressableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'landlord' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('landlord')}
          >
            <Text style={styles.roleEmoji}>🏢</Text>
            <Text style={styles.roleTitle}>Chủ nhà</Text>
            <Text style={styles.roleDescription}>Tôi quản lý căn hộ</Text>
          </PressableOpacity>
        </View>

        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          disabled={!selectedRole}
          style={styles.button}
        />

        <PressableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.backLink}
        >
          <Text style={styles.backText}>← Quay lại</Text>
        </PressableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  roleContainer: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
});

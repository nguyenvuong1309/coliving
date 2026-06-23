import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, StyleSheet, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { PressableOpacity, ScreenWrapper, Input, Button, LoadingOverlay } from '../../components';
import { useAuth } from '../../hooks';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateProfileRequest } from '../../store/slices/authSlice';
import { uploadImage, getImageUrl } from '../../services';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { loading } = useAppSelector(state => state.auth);

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar_url ?? null,
  );
  const avatarChangedRef = React.useRef(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Chỉnh sửa thông tin' });
  }, [navigation]);

  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      navigation.goBack();
    }
    prevLoadingRef.current = loading;
  }, [loading, navigation]);

  const handlePickAvatar = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 600,
      });
      if (result.assets && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
        avatarChangedRef.current = true;
      }
    } catch {
      // user cancelled
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên');
      return;
    }
    let avatar_url: string | null | undefined;
    if (avatarChangedRef.current && avatarUri && user?.id) {
      try {
        setUploading(true);
        const ext = avatarUri.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        await uploadImage('avatars', path, {
          uri: avatarUri,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          name: path.split('/').pop()!,
        });
        avatar_url = getImageUrl('avatars', path);
      } catch (e: any) {
        Alert.alert('Lỗi', e?.message ?? 'Không tải được ảnh');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    dispatch(
      updateProfileRequest({
        updates: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          ...(avatar_url !== undefined ? { avatar_url } : {}),
        },
      }),
    );
  }, [fullName, phone, avatarUri, user?.id, dispatch]);

  return (
    <ScreenWrapper testID="edit-profile-screen" scroll>
      <LoadingOverlay visible={loading || uploading} />

      <PressableOpacity
        style={styles.avatarWrapper}
        onPress={handlePickAvatar}
        activeOpacity={0.7}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>+</Text>
          </View>
        )}
        <Text style={styles.avatarLabel}>Đổi ảnh đại diện</Text>
      </PressableOpacity>

      <Input
        testID="edit-profile-name-input"
        label="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nguyễn Văn A"
      />

      <Input
        testID="edit-profile-phone-input"
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        placeholder="0901234567"
        keyboardType="phone-pad"
      />

      <Button
        testID="edit-profile-submit-btn"
        title="Lưu thay đổi"
        onPress={handleSubmit}
        loading={loading || uploading}
        style={styles.submitBtn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    color: '#94A3B8',
  },
  avatarLabel: {
    marginTop: 8,
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 16,
  },
});

export default EditProfileScreen;

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAppDispatch, useAppSelector } from '../../store';
import { changePasswordRequest } from '../../store/slices/authSlice';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const submittedRef = React.useRef(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Đổi mật khẩu' });
  }, [navigation]);

  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (submittedRef.current && prevLoadingRef.current && !loading && !error) {
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
    prevLoadingRef.current = loading;
  }, [loading, error, navigation]);

  const handleSubmit = useCallback(() => {
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    submittedRef.current = true;
    dispatch(changePasswordRequest({ newPassword }));
  }, [newPassword, confirm, dispatch]);

  return (
    <ScreenWrapper testID="change-password-screen">
      <LoadingOverlay visible={loading} />

      <Text style={styles.hint}>Mật khẩu mới phải có ít nhất 6 ký tự.</Text>

      <Input
        testID="change-password-new-input"
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      <Input
        testID="change-password-confirm-input"
        label="Xác nhận mật khẩu"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••••"
        secureTextEntry
      />

      <Button
        testID="change-password-submit-btn"
        title="Đổi mật khẩu"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: 12,
  },
});

export default ChangePasswordScreen;

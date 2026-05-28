import React, {useCallback, useEffect, useState} from 'react';
import {Alert, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ScreenWrapper, Input, Button, LoadingOverlay} from '../../components';
import {useAppDispatch, useAppSelector} from '../../store';
import {changePasswordRequest} from '../../store/slices/authSlice';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(state => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    navigation.setOptions({title: 'Đổi mật khẩu'});
  }, [navigation]);

  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (submitted && prevLoadingRef.current && !loading && !error) {
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }
    prevLoadingRef.current = loading;
  }, [loading, error, submitted, navigation]);

  const handleSubmit = useCallback(() => {
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    setSubmitted(true);
    dispatch(changePasswordRequest({newPassword}));
  }, [newPassword, confirm, dispatch]);

  return (
    <ScreenWrapper>
      <LoadingOverlay visible={loading} />

      <Text style={styles.hint}>
        Mật khẩu mới phải có ít nhất 6 ký tự.
      </Text>

      <Input
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      <Input
        label="Xác nhận mật khẩu"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••••"
        secureTextEntry
      />

      <Button
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

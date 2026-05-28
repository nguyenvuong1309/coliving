import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import PressableOpacity from './PressableOpacity';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store';
import { setError as setAuthError } from '../store/slices/authSlice';
import { setError as setApartmentError } from '../store/slices/apartmentSlice';
import { setError as setBorrowError } from '../store/slices/borrowSlice';
import { setError as setIssueError } from '../store/slices/issueSlice';
import { setError as setPaymentError } from '../store/slices/paymentSlice';
import { setError as setAssetError } from '../store/slices/assetSlice';
import { setError as setNotificationError } from '../store/slices/notificationSlice';

const ErrorToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const authError = useAppSelector(state => state.auth.error);
  const apartmentError = useAppSelector(state => state.apartment.error);
  const borrowError = useAppSelector(state => state.borrow.error);
  const issueError = useAppSelector(state => state.issue.error);
  const paymentError = useAppSelector(state => state.payment.error);
  const assetError = useAppSelector(state => state.asset.error);
  const notificationError = useAppSelector(state => state.notification.error);

  const [visible, setVisible] = useState<{
    message: string;
    source:
      | 'auth'
      | 'apartment'
      | 'borrow'
      | 'issue'
      | 'payment'
      | 'asset'
      | 'notification'
      | null;
  } | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    const pairs: Array<[string | null, NonNullable<typeof visible>['source']]> =
      [
        [authError, 'auth'],
        [apartmentError, 'apartment'],
        [borrowError, 'borrow'],
        [issueError, 'issue'],
        [paymentError, 'payment'],
        [assetError, 'asset'],
        [notificationError, 'notification'],
      ];
    const active = pairs.find(([msg]) => !!msg);
    if (active && active[0]) {
      setVisible({ message: active[0], source: active[1] });
    }
  }, [
    authError,
    apartmentError,
    borrowError,
    issueError,
    paymentError,
    assetError,
    notificationError,
  ]);

  const clearVisible = useCallback(() => {
    if (visible) {
      switch (visible.source) {
        case 'auth':
          dispatch(setAuthError(null));
          break;
        case 'apartment':
          dispatch(setApartmentError(null));
          break;
        case 'borrow':
          dispatch(setBorrowError(null));
          break;
        case 'issue':
          dispatch(setIssueError(null));
          break;
        case 'payment':
          dispatch(setPaymentError(null));
          break;
        case 'asset':
          dispatch(setAssetError(null));
          break;
        case 'notification':
          dispatch(setNotificationError(null));
          break;
      }
    }
    setVisible(null);
  }, [dispatch, visible]);

  const dismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(-20, { duration: 180 }, finished => {
      if (finished) {
        runOnJS(clearVisible)();
      }
    });
  }, [clearVisible, opacity, translateY]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });

    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [dismiss, opacity, translateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + 12 }, animatedStyle]}
    >
      <PressableOpacity
        style={styles.toast}
        activeOpacity={0.9}
        onPress={dismiss}
      >
        <Text style={styles.text} numberOfLines={3}>
          {visible.message}
        </Text>
      </PressableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
  },
  toast: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ErrorToast;

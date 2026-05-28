import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDispatch, useAppSelector} from '../store';
import {setError as setAuthError} from '../store/slices/authSlice';
import {setError as setApartmentError} from '../store/slices/apartmentSlice';
import {setError as setBorrowError} from '../store/slices/borrowSlice';
import {setError as setIssueError} from '../store/slices/issueSlice';
import {setError as setPaymentError} from '../store/slices/paymentSlice';
import {setError as setAssetError} from '../store/slices/assetSlice';
import {setError as setNotificationError} from '../store/slices/notificationSlice';

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

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const pairs: Array<[string | null, NonNullable<typeof visible>['source']]> = [
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
      setVisible({message: active[0], source: active[1]});
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

  useEffect(() => {
    if (!visible) {
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => dismiss(), 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
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
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {top: insets.top + 12, opacity, transform: [{translateY}]},
      ]}>
      <TouchableOpacity
        style={styles.toast}
        activeOpacity={0.9}
        onPress={dismiss}>
        <Text style={styles.text} numberOfLines={3}>
          {visible.message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ErrorToast;

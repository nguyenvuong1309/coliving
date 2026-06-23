import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {ScreenWrapper, Card, Button, StatusBadge, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks';
import {formatCurrency, formatDate} from '../../../utils';
import {getSignedImageUrl} from '../../../services';
import type {LandlordStackParamList} from '../../../types';
import { useAppSelector, useAppDispatch } from '../../../store';
import {
  confirmPaymentRequest,
  rejectPaymentRequest,
} from '../../../store/slices/paymentSlice';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type ConfirmRouteProp = RouteProp<LandlordStackParamList, 'PaymentConfirm'>;

const PaymentConfirmScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ConfirmRouteProp>();
  const dispatch = useAppDispatch();
  const { id } = route.params;
  const { members } = useApartment();
  const { payments, loading } = useAppSelector(state => state.payment);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const payment = useMemo(
    () => payments.find(p => p.id === id),
    [payments, id],
  );

  const tenantName = useMemo(() => {
    if (!payment) return 'Nguoi thue';
    const member = members.find(m => m.user_id === payment.tenant_id);
    return member?.profile?.full_name ?? 'Nguoi thue';
  }, [payment, members]);
  const rentAmount = payment
    ? payment.rent_amount ?? payment.amount - payment.utility_total
    : 0;

  const handleConfirm = useCallback(() => {
    Alert.alert(
      'Xac nhan thanh toan',
      `Xac nhan da nhan ${
        payment ? formatCurrency(payment.amount) : ''
      } tu ${tenantName}?`,
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xac nhan',
          onPress: () => {
            dispatch(confirmPaymentRequest({ paymentId: id }));
            navigation.goBack();
          },
        },
      ],
    );
  }, [id, payment, tenantName, dispatch, navigation]);

  const handleReject = useCallback(() => {
    Alert.alert(
      'Tu choi thanh toan',
      `Ban xac nhan chua nhan duoc thanh toan tu ${tenantName}?`,
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Chua nhan duoc',
          style: 'destructive',
          onPress: () => {
            dispatch(rejectPaymentRequest({ paymentId: id }));
            navigation.goBack();
          },
        },
      ],
    );
  }, [id, tenantName, dispatch, navigation]);

  useEffect(() => {
    let cancelled = false;
    const loadReceipt = async () => {
      if (!payment?.receipt_image_url) {
        setReceiptUrl(null);
        return;
      }
      const signedUrl = await getSignedImageUrl(
        'payment-receipts',
        payment.receipt_image_url,
      );
      if (!cancelled) {
        setReceiptUrl(signedUrl);
      }
    };
    loadReceipt();
    return () => {
      cancelled = true;
    };
  }, [payment?.receipt_image_url]);

  if (!payment) {
    return (
      <ScreenWrapper testID="payment-confirm-screen" scroll>
        <LoadingOverlay visible={loading} />
        <Text style={styles.emptyText}>Khong tim thay thanh toan</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper testID="payment-confirm-screen" scroll>
      <LoadingOverlay visible={loading} />

      <Text style={styles.title}>Xac nhan thanh toan</Text>

      {/* Tenant Info */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nguoi thue</Text>
          <Text style={styles.infoValue}>{tenantName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>So tien</Text>
          <Text style={[styles.infoValue, styles.amountText]}>
            {formatCurrency(payment.amount)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tien phong</Text>
          <Text style={styles.infoValue}>{formatCurrency(rentAmount)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dich vu</Text>
          <Text style={styles.infoValue}>
            {formatCurrency(payment.utility_total)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phuong thuc</Text>
          <Text style={styles.infoValue}>
            {payment.payment_method === 'bank_transfer'
              ? 'Chuyen khoan'
              : payment.payment_method === 'cash'
              ? 'Tien mat'
              : 'Chua ro'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trang thai</Text>
          <StatusBadge status={payment.status} size="small" />
        </View>
        {payment.paid_at && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngay bao</Text>
            <Text style={styles.infoValue}>{formatDate(payment.paid_at)}</Text>
          </View>
        )}
        {payment.note && (
          <View style={styles.noteSection}>
            <Text style={styles.infoLabel}>Ghi chu</Text>
            <Text style={styles.noteText}>{payment.note}</Text>
          </View>
        )}
      </Card>

      {/* Receipt Image */}
      {receiptUrl && (
        <View style={styles.receiptSection}>
          <Text style={styles.sectionTitle}>Hinh anh xac nhan</Text>
          <Image
            source={{ uri: receiptUrl }}
            style={styles.receiptImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Action Buttons */}
      {payment.status === 'tenant_reported' && (
        <View style={styles.actions}>
          <Button
            testID="payment-confirm-btn"
            title="Xac nhan da nhan"
            onPress={handleConfirm}
            variant="primary"
            style={styles.confirmBtn}
          />
          <Button
            testID="payment-reject-btn"
            title="Chua nhan duoc"
            onPress={handleReject}
            variant="danger"
            style={styles.actionBtn}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  noteSection: {
    paddingTop: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    lineHeight: 20,
  },
  receiptSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  actions: {
    gap: 12,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
  },
  actionBtn: {
    width: '100%',
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 32,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default PaymentConfirmScreen;

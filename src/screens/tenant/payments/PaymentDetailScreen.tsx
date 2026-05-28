import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import PressableOpacity from '../../../components/PressableOpacity';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useAppSelector, useAppDispatch } from '../../../store';
import {
  fetchMyPaymentsRequest,
  reportPaymentRequest,
} from '../../../store/slices/paymentSlice';
import { useAuth } from '../../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { TenantStackParamList } from '../../../types/navigation';

type ScreenRouteProp = RouteProp<TenantStackParamList, 'PaymentDetail'>;

const PAYMENT_METHODS = [
  { value: 'bank_transfer' as const, label: 'Chuyen khoan' },
  { value: 'cash' as const, label: 'Tien mat' },
];

const PaymentDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const { id } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { myPayments, loading } = useAppSelector(state => state.payment);

  const [selectedMethod, setSelectedMethod] = useState<
    'bank_transfer' | 'cash' | null
  >(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Find the payment
  const payment = myPayments.find(p => p.id === id);

  useEffect(() => {
    if (user?.id && !payment) {
      dispatch(fetchMyPaymentsRequest({ userId: user.id }));
    }
  }, [user?.id, payment, dispatch]);

  const handlePickReceipt = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });
      if (result.assets && result.assets[0]?.uri) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Loi', 'Khong the chon hinh anh');
    }
  }, []);

  const handleReportPayment = useCallback(() => {
    if (!selectedMethod) {
      Alert.alert('Thieu thong tin', 'Vui long chon phuong thuc thanh toan');
      return;
    }
    dispatch(
      reportPaymentRequest({
        paymentId: id,
        method: selectedMethod,
        receiptUri: receiptImage ?? undefined,
      }),
    );
  }, [id, selectedMethod, receiptImage, dispatch]);

  if (!payment) {
    return (
      <ScreenWrapper>
        <LoadingOverlay visible={loading} />
        <Text style={styles.emptyText}>Khong tim thay thanh toan</Text>
      </ScreenWrapper>
    );
  }

  const isUnpaid = payment.status === 'unpaid' || payment.status === 'overdue';
  const isTenantReported = payment.status === 'tenant_reported';
  const isConfirmed = payment.status === 'confirmed';

  return (
    <ScreenWrapper>
      <LoadingOverlay visible={loading} />

      {/* Amount card */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>So tien</Text>
        <Text
          style={[
            styles.amountValue,
            isConfirmed ? styles.amountConfirmed : styles.amountUnpaid,
          ]}
        >
          {formatCurrency(payment.amount)}
        </Text>
        <StatusBadge status={payment.status} />
      </Card>

      {/* Payment info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Thong tin thanh toan</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trang thai:</Text>
          <StatusBadge status={payment.status} size="small" />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngay tao:</Text>
          <Text style={styles.infoValue}>{formatDate(payment.created_at)}</Text>
        </View>

        {payment.paid_at && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngay thanh toan:</Text>
            <Text style={styles.infoValue}>{formatDate(payment.paid_at)}</Text>
          </View>
        )}

        {payment.confirmed_at && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngay xac nhan:</Text>
            <Text style={styles.infoValue}>
              {formatDate(payment.confirmed_at)}
            </Text>
          </View>
        )}

        {payment.payment_method && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phuong thuc:</Text>
            <Text style={styles.infoValue}>
              {payment.payment_method === 'bank_transfer'
                ? 'Chuyen khoan'
                : 'Tien mat'}
            </Text>
          </View>
        )}
      </Card>

      {/* Unpaid / Overdue: show payment form */}
      {isUnpaid && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Bao cao thanh toan</Text>

          {/* Payment method picker */}
          <Text style={styles.fieldLabel}>Phuong thuc thanh toan</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map(method => (
              <PressableOpacity
                key={method.value}
                style={[
                  styles.methodBtn,
                  selectedMethod === method.value && styles.methodBtnActive,
                ]}
                onPress={() => setSelectedMethod(method.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.methodBtnText,
                    selectedMethod === method.value &&
                      styles.methodBtnTextActive,
                  ]}
                >
                  {method.label}
                </Text>
              </PressableOpacity>
            ))}
          </View>

          {/* Receipt image */}
          <Text style={styles.fieldLabel}>
            Hinh anh bien lai (khong bat buoc)
          </Text>
          {receiptImage ? (
            <View style={styles.receiptWrapper}>
              <Image
                source={{ uri: receiptImage }}
                style={styles.receiptImage}
              />
              <PressableOpacity
                style={styles.removeReceiptBtn}
                onPress={() => setReceiptImage(null)}
              >
                <Text style={styles.removeReceiptText}>X</Text>
              </PressableOpacity>
            </View>
          ) : (
            <PressableOpacity
              style={styles.addReceiptBtn}
              onPress={handlePickReceipt}
              activeOpacity={0.7}
            >
              <Text style={styles.addReceiptText}>+ Chon hinh anh</Text>
            </PressableOpacity>
          )}

          <View style={styles.submitContainer}>
            <Button
              title="Toi da thanh toan"
              onPress={handleReportPayment}
              loading={loading}
            />
          </View>
        </Card>
      )}

      {/* Tenant reported: show waiting message */}
      {isTenantReported && (
        <Card style={styles.waitingCard}>
          <Text style={styles.waitingText}>Dang cho xac nhan tu chu nha</Text>
          <Text style={styles.waitingSubtext}>
            Ban da bao thanh toan. Vui long doi chu nha xac nhan.
          </Text>
        </Card>
      )}

      {/* Confirmed: show success */}
      {isConfirmed && (
        <Card style={styles.confirmedCard}>
          <Text style={styles.confirmedText}>Da xac nhan thanh toan</Text>
          {payment.confirmed_at && (
            <Text style={styles.confirmedDate}>
              Xac nhan luc: {formatDate(payment.confirmed_at)}
            </Text>
          )}
        </Card>
      )}

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  amountCard: {
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  amountUnpaid: {
    color: '#DC2626',
  },
  amountConfirmed: {
    color: '#16A34A',
  },
  card: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  methodBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  methodBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  methodBtnTextActive: {
    color: '#2563EB',
  },
  receiptWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  receiptImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeReceiptText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addReceiptBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addReceiptText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  submitContainer: {
    marginTop: 8,
  },
  waitingCard: {
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    paddingVertical: 24,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  waitingSubtext: {
    fontSize: 13,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmedCard: {
    marginBottom: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    paddingVertical: 24,
  },
  confirmedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 4,
  },
  confirmedDate: {
    fontSize: 13,
    color: '#15803D',
  },
  bottomSpacer: {
    height: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default PaymentDetailScreen;

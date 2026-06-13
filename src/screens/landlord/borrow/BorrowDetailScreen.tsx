import React, { useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchBorrowDetailRequest,
  updateBorrowStatusRequest,
} from '../../../store/slices/borrowSlice';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import type { LandlordStackParamList } from '../../../types/navigation';

type DetailRouteProp = RouteProp<LandlordStackParamList, 'LandlordBorrowDetail'>;

const BorrowDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;
  const dispatch = useAppDispatch();
  const { currentRequest, loading } = useAppSelector(state => state.borrow);

  useEffect(() => {
    dispatch(fetchBorrowDetailRequest({ id }));
  }, [dispatch, id]);

  const handleStatusUpdate = useCallback(
    (
      status:
        | 'approved'
        | 'rejected'
        | 'in_use'
        | 'return_requested'
        | 'returned',
    ) => {
      Alert.alert('Xac nhan', 'Cap nhat trang thai yeu cau muon do?', [
        {text: 'Huy', style: 'cancel'},
        {
          text: 'Dong y',
          onPress: () => dispatch(updateBorrowStatusRequest({ id, status })),
        },
      ]);
    },
    [dispatch, id],
  );

  if (!currentRequest) {
    return (
      <ScreenWrapper testID="landlord-borrow-detail-screen">
        <LoadingOverlay visible={loading} />
        <Text style={styles.emptyText}>Khong tim thay yeu cau</Text>
      </ScreenWrapper>
    );
  }

  const assetName = (currentRequest as any).assets?.name ?? currentRequest.asset_id;
  const borrowerName =
    (currentRequest as any).borrower?.full_name ?? 'Nguoi muon';
  const lenderName = (currentRequest as any).lender?.full_name ?? 'Nguoi cho muon';

  return (
    <ScreenWrapper testID="landlord-borrow-detail-screen">
      <LoadingOverlay visible={loading} />
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tai san</Text>
        <Text style={styles.assetName}>{assetName}</Text>
        <View style={styles.statusRow}>
          <StatusBadge status={currentRequest.status} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Nguoi lien quan</Text>
        <InfoRow label="Nguoi muon" value={borrowerName} />
        <InfoRow label="Nguoi cho muon" value={lenderName} />
        <InfoRow label="Ngay tao" value={formatDate(currentRequest.created_at)} />
        {currentRequest.borrow_duration ? (
          <InfoRow label="Thoi gian muon" value={currentRequest.borrow_duration} />
        ) : null}
        {currentRequest.due_date ? (
          <InfoRow label="Han tra" value={formatDate(currentRequest.due_date)} />
        ) : null}
      </Card>

      {currentRequest.note ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ghi chu</Text>
          <Text style={styles.noteText}>{currentRequest.note}</Text>
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tien trinh</Text>
        <Text style={styles.timelineText}>
          Tao yeu cau: {formatDateTime(currentRequest.created_at)}
        </Text>
        <Text style={styles.timelineText}>
          Cap nhat gan nhat: {formatDateTime(currentRequest.updated_at)}
        </Text>
      </Card>

      {currentRequest.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            testID="landlord-borrow-approve-btn"
            title="Chap nhan"
            onPress={() => handleStatusUpdate('approved')}
            loading={loading}
            style={styles.actionButton}
          />
          <Button
            testID="landlord-borrow-reject-btn"
            title="Tu choi"
            onPress={() => handleStatusUpdate('rejected')}
            variant="danger"
            loading={loading}
            style={styles.actionButton}
          />
        </View>
      )}

      {currentRequest.status === 'approved' && (
        <Button
          testID="landlord-borrow-in-use-btn"
          title="Danh dau dang muon"
          onPress={() => handleStatusUpdate('in_use')}
          loading={loading}
          style={styles.fullButton}
        />
      )}

      {currentRequest.status === 'return_requested' && (
        <Button
          testID="landlord-borrow-returned-btn"
          title="Xac nhan da nhan lai"
          onPress={() => handleStatusUpdate('returned')}
          loading={loading}
          style={styles.fullButton}
        />
      )}
    </ScreenWrapper>
  );
};

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  assetName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusRow: {
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  noteText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  timelineText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  fullButton: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default BorrowDetailScreen;

import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {ScreenWrapper, Card, Button, StatusBadge, LoadingOverlay} from '../../../components';
import {useAuth} from '../../../hooks/useAuth';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../../store';
import {
  fetchBorrowDetailRequest,
  updateBorrowStatusRequest,
} from '../../../store/slices/borrowSlice';
import {formatDate, formatDateTime} from '../../../utils/formatters';
import type {TenantStackParamList} from '../../../types/navigation';

type ScreenRouteProp = RouteProp<TenantStackParamList, 'BorrowDetail'>;
type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

const BorrowDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const {id} = route.params;
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {members} = useApartment();
  const {currentRequest, loading} = useAppSelector(state => state.borrow);

  useEffect(() => {
    dispatch(fetchBorrowDetailRequest({id}));
  }, [id, dispatch]);

  const getMemberName = useCallback(
    (userId: string) => {
      const member = members.find(m => m.user_id === userId);
      return member?.profile?.full_name ?? 'Khong ro';
    },
    [members],
  );

  const handleUpdateStatus = useCallback(
    (
      status:
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'in_use'
        | 'return_requested'
        | 'returned',
    ) => {
      dispatch(updateBorrowStatusRequest({id, status}));
    },
    [id, dispatch],
  );

  if (!currentRequest) {
    return (
      <ScreenWrapper>
        <LoadingOverlay visible={loading} />
        <Text style={styles.emptyText}>Khong tim thay yeu cau</Text>
      </ScreenWrapper>
    );
  }

  const isLender = currentRequest.lender_id === user?.id;
  const isBorrower = currentRequest.borrower_id === user?.id;
  const {status} = currentRequest;

  return (
    <ScreenWrapper>
      <LoadingOverlay visible={loading} />

      {/* Asset info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Thong tin do muon</Text>
        <Text style={styles.assetName}>{currentRequest.asset_id}</Text>
      </Card>

      {/* People info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Nguoi lien quan</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nguoi muon:</Text>
          <Text style={styles.value}>
            {getMemberName(currentRequest.borrower_id)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nguoi cho muon:</Text>
          <Text style={styles.value}>
            {getMemberName(currentRequest.lender_id)}
          </Text>
        </View>
      </Card>

      {/* Status timeline */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Trang thai</Text>
        <View style={styles.statusRow}>
          <StatusBadge status={status} />
        </View>

        <View style={styles.timelineContainer}>
          <TimelineItem
            label="Tao yeu cau"
            date={currentRequest.created_at}
            active
          />
          {(status === 'approved' ||
            status === 'in_use' ||
            status === 'return_requested' ||
            status === 'returned') && (
            <TimelineItem label="Duoc chap nhan" date={currentRequest.updated_at} active />
          )}
          {status === 'rejected' && (
            <TimelineItem label="Tu choi" date={currentRequest.updated_at} active />
          )}
          {(status === 'in_use' ||
            status === 'return_requested' ||
            status === 'returned') && (
            <TimelineItem label="Dang muon" date={currentRequest.updated_at} active />
          )}
          {(status === 'return_requested' || status === 'returned') && (
            <TimelineItem label="Yeu cau tra" date={currentRequest.updated_at} active />
          )}
          {status === 'returned' && (
            <TimelineItem label="Da tra" date={currentRequest.updated_at} active />
          )}
        </View>
      </Card>

      {/* Note */}
      {currentRequest.note && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ghi chu</Text>
          <Text style={styles.noteText}>{currentRequest.note}</Text>
        </Card>
      )}

      {/* Duration */}
      {currentRequest.borrow_duration && (
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thoi gian muon:</Text>
            <Text style={styles.value}>{currentRequest.borrow_duration}</Text>
          </View>
          {currentRequest.due_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Han tra:</Text>
              <Text style={styles.value}>
                {formatDate(currentRequest.due_date)}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {isLender && status === 'pending' && (
          <>
            <Button
              title="Chap nhan"
              onPress={() => handleUpdateStatus('approved')}
              loading={loading}
              style={styles.actionBtn}
            />
            <Button
              title="Tu choi"
              onPress={() => handleUpdateStatus('rejected')}
              variant="danger"
              loading={loading}
              style={styles.actionBtn}
            />
          </>
        )}

        {isBorrower && status === 'in_use' && (
          <Button
            title="Da tra"
            onPress={() => handleUpdateStatus('return_requested')}
            loading={loading}
          />
        )}

        {isLender && status === 'return_requested' && (
          <Button
            title="Xac nhan da nhan"
            onPress={() => handleUpdateStatus('returned')}
            loading={loading}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

/* Timeline item sub-component */
interface TimelineItemProps {
  label: string;
  date: string;
  active?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({label, date, active}) => (
  <View style={timelineStyles.item}>
    <View style={timelineStyles.dotColumn}>
      <View
        style={[
          timelineStyles.dot,
          active ? timelineStyles.dotActive : timelineStyles.dotInactive,
        ]}
      />
      <View style={timelineStyles.line} />
    </View>
    <View style={timelineStyles.content}>
      <Text style={timelineStyles.label}>{label}</Text>
      <Text style={timelineStyles.date}>{formatDateTime(date)}</Text>
    </View>
  </View>
);

const timelineStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    minHeight: 48,
  },
  dotColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    backgroundColor: '#CBD5E1',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusRow: {
    marginBottom: 12,
  },
  timelineContainer: {
    marginTop: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default BorrowDetailScreen;

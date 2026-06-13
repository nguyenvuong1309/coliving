import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PressableOpacity from '../../components/PressableOpacity';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import { useApartment } from '../../hooks/useApartment';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchBorrowRequestsRequest } from '../../store/slices/borrowSlice';
import { fetchIssuesRequest } from '../../store/slices/issueSlice';
import { fetchMyPaymentsRequest } from '../../store/slices/paymentSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { TenantStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { apartment, fetchMembers } = useApartment();

  const borrowRequests = useAppSelector(state => state.borrow.requests);
  const issues = useAppSelector(state => state.issue.issues);
  const myPayments = useAppSelector(state => state.payment.myPayments);
  const borrowLoading = useAppSelector(state => state.borrow.loading);
  const issueLoading = useAppSelector(state => state.issue.loading);
  const paymentLoading = useAppSelector(state => state.payment.loading);
  const loading = borrowLoading || issueLoading || paymentLoading;

  useEffect(() => {
    if (apartment?.id && user?.id) {
      dispatch(fetchBorrowRequestsRequest({ apartmentId: apartment.id }));
      dispatch(fetchIssuesRequest({ apartmentId: apartment.id }));
      dispatch(fetchMyPaymentsRequest({ userId: user.id }));
      fetchMembers(apartment.id);
    }
  }, [apartment?.id, user?.id, dispatch, fetchMembers]);

  const nextUnpaidPayment = useMemo(() => {
    return myPayments.find(
      p => p.status === 'unpaid' || p.status === 'overdue',
    );
  }, [myPayments]);

  const pendingBorrowCount = useMemo(() => {
    return borrowRequests.filter(r => r.status === 'pending').length;
  }, [borrowRequests]);

  const openIssueCount = useMemo(() => {
    return issues.filter(i => i.status === 'open' || i.status === 'reopened')
      .length;
  }, [issues]);

  return (
    <ScreenWrapper testID="tenant-home-screen">
      <LoadingOverlay visible={loading} />

      {/* Welcome */}
      <Text style={styles.greeting}>Xin chao, {user?.full_name ?? 'Ban'}!</Text>
      <Text style={styles.subGreeting}>Chuc ban mot ngay tot lanh</Text>

      {/* Payment reminder */}
      {nextUnpaidPayment && (
        <Card
          style={styles.card}
          onPress={() =>
            navigation.navigate('PaymentDetail', { id: nextUnpaidPayment.id })
          }
        >
          <Text style={styles.cardTitle}>Nhac thanh toan</Text>
          <Text style={styles.paymentAmount}>
            {formatCurrency(nextUnpaidPayment.amount)}
          </Text>
          {nextUnpaidPayment.created_at && (
            <Text style={styles.cardSubtext}>
              Han: {formatDate(nextUnpaidPayment.created_at)}
            </Text>
          )}
        </Card>
      )}

      {/* Pending borrow requests */}
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('BorrowList')}
      >
        <Text style={styles.cardTitle}>Yeu cau muon do dang cho</Text>
        <Text style={styles.countText}>{pendingBorrowCount}</Text>
        <Text style={styles.cardSubtext}>yeu cau dang cho xu ly</Text>
      </Card>

      {/* Open issues */}
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('IssueList')}
      >
        <Text style={styles.cardTitle}>Su co dang mo</Text>
        <Text style={styles.countText}>{openIssueCount}</Text>
        <Text style={styles.cardSubtext}>su co chua duoc giai quyet</Text>
      </Card>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Thao tac nhanh</Text>
      <View style={styles.quickActions}>
        <PressableOpacity
          testID="home-borrow-create-btn"
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('BorrowCreate')}
          activeOpacity={0.7}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}
          >
            <Text style={styles.quickActionEmoji}>📦</Text>
          </View>
          <Text style={styles.quickActionLabel}>Muon do</Text>
        </PressableOpacity>

        <PressableOpacity
          testID="home-issue-create-btn"
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('IssueCreate')}
          activeOpacity={0.7}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: '#FEF2F2' }]}
          >
            <Text style={styles.quickActionEmoji}>⚠️</Text>
          </View>
          <Text style={styles.quickActionLabel}>Bao cao su co</Text>
        </PressableOpacity>

        <PressableOpacity
          testID="home-roommates-btn"
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('RoommateList')}
          activeOpacity={0.7}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}
          >
            <Text style={styles.quickActionEmoji}>👥</Text>
          </View>
          <Text style={styles.quickActionLabel}>Xem roommates</Text>
        </PressableOpacity>

        <PressableOpacity
          testID="home-notifications-btn"
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}
          >
            <Text style={styles.quickActionEmoji}>🔔</Text>
          </View>
          <Text style={styles.quickActionLabel}>Thong bao</Text>
        </PressableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  card: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 13,
    color: '#64748B',
  },
  countText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionBtn: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});

export default HomeScreen;

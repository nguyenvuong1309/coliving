import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card, Button, LoadingOverlay, ScreenWrapper} from '../../components';
import {useAuth} from '../../hooks/useAuth';
import {useApartment} from '../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../store';
import {fetchIssuesRequest} from '../../store/slices/issueSlice';
import {fetchBillingPeriodsRequest, fetchPaymentsRequest} from '../../store/slices/paymentSlice';
import {fetchBorrowRequestsRequest} from '../../store/slices/borrowSlice';
import {fetchNotificationsRequest} from '../../store/slices/notificationSlice';
import {formatCurrency, formatRelativeTime} from '../../utils/formatters';
import type {LandlordStackParamList} from '../../types/navigation';
import type {Notification} from '../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment, members, fetchApartment, fetchMembers} = useApartment();

  const {issues} = useAppSelector(state => state.issue);
  const {payments, billingPeriods} = useAppSelector(state => state.payment);
  const {requests: borrowRequests} = useAppSelector(state => state.borrow);
  const {notifications} = useAppSelector(state => state.notification);
  const apartmentLoading = useAppSelector(state => state.apartment.loading);

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(() => {
    if (apartment?.id) {
      fetchMembers(apartment.id);
      dispatch(fetchIssuesRequest({apartmentId: apartment.id}));
      dispatch(fetchBillingPeriodsRequest({apartmentId: apartment.id}));
      dispatch(fetchBorrowRequestsRequest({apartmentId: apartment.id}));
    }
    if (user?.id) {
      dispatch(fetchNotificationsRequest({userId: user.id}));
    }
  }, [apartment?.id, user?.id, dispatch, fetchMembers]);

  useEffect(() => {
    if (user?.id && !apartment) {
      // Landlord's apartment should be fetched from their profile
    }
  }, [user?.id, apartment, fetchApartment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadData]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = useMemo(() => {
    const currentPeriod = billingPeriods.find(
      bp => bp.month === currentMonth && bp.year === currentYear,
    );
    if (!currentPeriod) {
      return 0;
    }
    return payments
      .filter(p => p.billing_period_id === currentPeriod.id && p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, billingPeriods, currentMonth, currentYear]);

  const unpaidCount = useMemo(() => {
    return payments.filter(
      p => p.status === 'unpaid' || p.status === 'overdue',
    ).length;
  }, [payments]);

  const openIssuesCount = useMemo(() => {
    return issues.filter(
      i => i.status === 'open' || i.status === 'reopened',
    ).length;
  }, [issues]);

  const pendingBorrowCount = useMemo(() => {
    return borrowRequests.filter(r => r.status === 'pending').length;
  }, [borrowRequests]);

  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  const renderNotification = ({item}: {item: Notification}) => (
    <TouchableOpacity style={styles.notificationItem}>
      <View style={styles.notificationDot}>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.body && (
          <Text style={styles.notificationBody} numberOfLines={1}>
            {item.body}
          </Text>
        )}
        <Text style={styles.notificationTime}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper scroll>
      <LoadingOverlay visible={apartmentLoading && !refreshing} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Xin chao, {user?.full_name ?? 'Chu nha'}
        </Text>
        {apartment && (
          <Text style={styles.apartmentName}>{apartment.name}</Text>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Doanh thu thang</Text>
          <Text style={[styles.summaryValue, {color: '#16A34A'}]}>
            {formatCurrency(monthlyRevenue)}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Chua thanh toan</Text>
          <Text style={[styles.summaryValue, {color: '#F59E0B'}]}>
            {unpaidCount}
          </Text>
        </Card>
      </View>

      {/* Open Issues Card */}
      <Card
        style={styles.infoCard}
        onPress={() => navigation.navigate('LandlordIssueList')}>
        <View style={styles.infoCardRow}>
          <View>
            <Text style={styles.infoCardLabel}>Su co cho xu ly</Text>
            <Text style={styles.infoCardValue}>{openIssuesCount}</Text>
          </View>
          <Text style={styles.chevron}>{'>'}</Text>
        </View>
      </Card>

      {/* Pending Borrows Card */}
      <Card style={styles.infoCard}>
        <View style={styles.infoCardRow}>
          <View>
            <Text style={styles.infoCardLabel}>
              Yeu cau muon do dang cho
            </Text>
            <Text style={styles.infoCardValue}>{pendingBorrowCount}</Text>
          </View>
        </View>
      </Card>

      {/* Recent Activity */}
      {recentNotifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoat dong gan day</Text>
          <Card style={styles.activityCard}>
            <FlatList
              data={recentNotifications}
              keyExtractor={item => item.id}
              renderItem={renderNotification}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tac nhanh</Text>
        <View style={styles.quickActions}>
          <Button
            title="Tao ky thu tien"
            onPress={() => navigation.navigate('CreateBilling')}
            variant="primary"
            style={styles.quickActionBtn}
          />
          <Button
            title="Quan ly can ho"
            onPress={() =>
              navigation.navigate('ApartmentSetup', {
                id: apartment?.id,
              })
            }
            variant="outline"
            style={styles.quickActionBtn}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  apartmentName: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  infoCard: {
    marginBottom: 12,
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCardLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  chevron: {
    fontSize: 20,
    color: '#94A3B8',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  activityCard: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  notificationDot: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  notificationBody: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  quickActions: {
    gap: 10,
    marginBottom: 24,
  },
  quickActionBtn: {
    width: '100%',
  },
});

export default DashboardScreen;

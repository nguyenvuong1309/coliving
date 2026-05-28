import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useApartment } from '../../../hooks/useApartment';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchPaymentsRequest } from '../../../store/slices/paymentSlice';
import { formatCurrency } from '../../../utils/formatters';
import type { LandlordStackParamList } from '../../../types/navigation';
import type { Payment } from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type OverviewRouteProp = RouteProp<LandlordStackParamList, 'PaymentOverview'>;

const PaymentOverviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OverviewRouteProp>();
  const dispatch = useAppDispatch();
  const { billingId } = route.params;
  const { members } = useApartment();
  const { payments, billingPeriods, loading } = useAppSelector(
    state => state.payment,
  );

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchPaymentsRequest({ billingPeriodId: billingId }));
  }, [billingId, dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchPaymentsRequest({ billingPeriodId: billingId }));
    setTimeout(() => setRefreshing(false), 1000);
  }, [billingId, dispatch]);

  const renderSeparator = React.useCallback(
    () => <View style={styles.gap} />,
    [],
  );

  const period = useMemo(
    () => billingPeriods.find(bp => bp.id === billingId),
    [billingPeriods, billingId],
  );

  const periodPayments = useMemo(
    () => payments.filter(p => p.billing_period_id === billingId),
    [payments, billingId],
  );

  const totalExpected = useMemo(
    () => periodPayments.reduce((sum, p) => sum + p.amount, 0),
    [periodPayments],
  );

  const totalConfirmed = useMemo(
    () =>
      periodPayments
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + p.amount, 0),
    [periodPayments],
  );

  const totalPending = useMemo(
    () =>
      periodPayments
        .filter(p => p.status === 'tenant_reported')
        .reduce((sum, p) => sum + p.amount, 0),
    [periodPayments],
  );

  const memberNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach(m => {
      map[m.user_id] = m.profile?.full_name ?? 'Nguoi thue';
    });
    return map;
  }, [members]);

  const renderItem = ({ item }: { item: Payment }) => {
    const tenantName = memberNameMap[item.tenant_id] ?? 'Nguoi thue';
    const canConfirm = item.status === 'tenant_reported';

    return (
      <Card
        style={styles.paymentCard}
        onPress={
          canConfirm
            ? () => navigation.navigate('PaymentConfirm', { id: item.id })
            : undefined
        }
      >
        <View style={styles.paymentRow}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{tenantName}</Text>
            <Text style={styles.paymentAmount}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
          <StatusBadge status={item.status} size="small" />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />

      {/* Summary */}
      <View style={styles.summarySection}>
        {period && (
          <Text style={styles.periodTitle}>
            Thang {period.month}/{period.year}
          </Text>
        )}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tong</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalExpected)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Da thu</Text>
            <Text style={[styles.summaryValue, { color: '#16A34A' }]}>
              {formatCurrency(totalConfirmed)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Cho duyet</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {formatCurrency(totalPending)}
            </Text>
          </View>
        </View>
      </View>

      {periodPayments.length === 0 && !loading ? (
        <EmptyState
          title="Chua co thanh toan"
          description="Khong co thanh toan nao trong ky nay"
        />
      ) : (
        <FlatList
          data={periodPayments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ItemSeparatorComponent={renderSeparator}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  gap: {
    height: 10,
  },
  paymentCard: {
    paddingVertical: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentInfo: {
    flex: 1,
    marginRight: 8,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  paymentAmount: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
});

export default PaymentOverviewScreen;

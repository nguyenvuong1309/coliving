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
import {Card, EmptyState, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchBillingPeriodsRequest} from '../../../store/slices/paymentSlice';
import {formatCurrency} from '../../../utils/formatters';
import type {LandlordStackParamList} from '../../../types/navigation';
import type {BillingPeriod} from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const PaymentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {apartment} = useApartment();
  const {billingPeriods, payments, loading} = useAppSelector(
    state => state.payment,
  );

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (apartment?.id) {
      dispatch(fetchBillingPeriodsRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateBilling')}
          style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Tao ky thu</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = React.useCallback(() => {
    if (apartment?.id) {
      setRefreshing(true);
      dispatch(fetchBillingPeriodsRequest({apartmentId: apartment.id}));
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [apartment?.id, dispatch]);

  const periodStats = useMemo(() => {
    const stats: Record<
      string,
      {total: number; confirmed: number; count: number}
    > = {};
    billingPeriods.forEach(bp => {
      const periodPayments = payments.filter(
        p => p.billing_period_id === bp.id,
      );
      const total = periodPayments.reduce((sum, p) => sum + p.amount, 0);
      const confirmed = periodPayments
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + p.amount, 0);
      stats[bp.id] = {total, confirmed, count: periodPayments.length};
    });
    return stats;
  }, [billingPeriods, payments]);

  const sortedPeriods = useMemo(() => {
    return [...billingPeriods].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [billingPeriods]);

  const renderItem = ({item}: {item: BillingPeriod}) => {
    const stats = periodStats[item.id] ?? {total: 0, confirmed: 0, count: 0};
    const progress =
      stats.total > 0 ? Math.min(stats.confirmed / stats.total, 1) : 0;

    return (
      <Card
        style={styles.periodCard}
        onPress={() =>
          navigation.navigate('PaymentOverview', {billingId: item.id})
        }>
        <Text style={styles.periodTitle}>
          Thang {item.month}/{item.year}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {width: `${progress * 100}%`},
            ]}
          />
        </View>

        <View style={styles.periodStats}>
          <View>
            <Text style={styles.statsLabel}>Da thu</Text>
            <Text style={[styles.statsValue, {color: '#16A34A'}]}>
              {formatCurrency(stats.confirmed)}
            </Text>
          </View>
          <View style={styles.statsRight}>
            <Text style={styles.statsLabel}>Tong</Text>
            <Text style={styles.statsValue}>
              {formatCurrency(stats.total)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (!loading && billingPeriods.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Chua co ky thu tien"
          description="Tao ky thu tien de bat dau thu tien tu nguoi thue"
          actionLabel="Tao ky thu tien"
          onAction={() => navigation.navigate('CreateBilling')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />
      <FlatList
        data={sortedPeriods}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  gap: {
    height: 12,
  },
  periodCard: {
    paddingVertical: 16,
  },
  periodTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  periodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  statsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
});

export default PaymentsScreen;

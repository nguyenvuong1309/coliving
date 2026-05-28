import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAppSelector } from '../../store';
import { formatCurrency } from '../../utils/formatters';

interface MonthRevenue {
  periodId: string;
  month: number;
  year: number;
  confirmedAmount: number;
  tenantsPaid: number;
  totalTenants: number;
}

const RevenueHistoryScreen: React.FC = () => {
  const { billingPeriods, payments } = useAppSelector(state => state.payment);

  const revenueData = useMemo(() => {
    const data: MonthRevenue[] = billingPeriods
      .map(bp => {
        const periodPayments = payments.filter(
          p => p.billing_period_id === bp.id,
        );
        const confirmedPayments = periodPayments.filter(
          p => p.status === 'confirmed',
        );
        return {
          periodId: bp.id,
          month: bp.month,
          year: bp.year,
          confirmedAmount: confirmedPayments.reduce(
            (sum, p) => sum + p.amount,
            0,
          ),
          tenantsPaid: confirmedPayments.length,
          totalTenants: periodPayments.length,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    return data;
  }, [billingPeriods, payments]);

  const totalAllTime = useMemo(
    () => revenueData.reduce((sum, r) => sum + r.confirmedAmount, 0),
    [revenueData],
  );

  const renderItem = ({ item }: { item: MonthRevenue }) => (
    <Card style={styles.revenueCard}>
      <View style={styles.revenueRow}>
        <View>
          <Text style={styles.monthText}>
            Thang {item.month}/{item.year}
          </Text>
          <Text style={styles.tenantCount}>
            {item.tenantsPaid}/{item.totalTenants} nguoi da tra
          </Text>
        </View>
        <Text style={styles.amountText}>
          {formatCurrency(item.confirmedAmount)}
        </Text>
      </View>
    </Card>
  );

  if (revenueData.length === 0) {
    return (
      <ScreenWrapper scroll={false}>
        <EmptyState
          title="Chua co doanh thu"
          description="Doanh thu se hien thi khi co thanh toan duoc xac nhan"
        />
      </ScreenWrapper>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryLabel}>Tong doanh thu</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalAllTime)}</Text>
      </View>

      <FlatList
        data={revenueData}
        keyExtractor={item => item.periodId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
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
  summaryHeader: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  gap: {
    height: 10,
  },
  revenueCard: {
    paddingVertical: 14,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  tenantCount: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  amountText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16A34A',
  },
});

export default RevenueHistoryScreen;

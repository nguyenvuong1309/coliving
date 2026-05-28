import React, { useEffect, useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useAuth } from '../../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchMyPaymentsRequest } from '../../../store/slices/paymentSlice';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { TenantStackParamList } from '../../../types/navigation';
import type { Payment } from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

interface SectionData {
  title: string;
  isCurrent: boolean;
  data: Payment[];
}

const MONTH_NAMES = [
  'Thang 1',
  'Thang 2',
  'Thang 3',
  'Thang 4',
  'Thang 5',
  'Thang 6',
  'Thang 7',
  'Thang 8',
  'Thang 9',
  'Thang 10',
  'Thang 11',
  'Thang 12',
];

const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { myPayments, loading } = useAppSelector(state => state.payment);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyPaymentsRequest({ userId: user.id }));
    }
  }, [user?.id, dispatch]);

  const sections: SectionData[] = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Group payments by month/year
    const grouped = new Map<string, Payment[]>();
    for (const payment of myPayments) {
      const d = new Date(payment.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(payment);
    }

    // Convert to sections and sort
    const result: SectionData[] = [];
    for (const [key, payments] of grouped) {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const isCurrent = month === currentMonth && year === currentYear;
      result.push({
        title: `${MONTH_NAMES[month]} ${year}`,
        isCurrent,
        data: payments,
      });
    }

    // Sort: current month first, then by date descending
    result.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) {
        return -1;
      }
      if (!a.isCurrent && b.isCurrent) {
        return 1;
      }
      return b.title.localeCompare(a.title);
    });

    return result;
  }, [myPayments]);

  const renderItem = ({ item }: { item: Payment }) => (
    <Card
      style={styles.itemCard}
      onPress={() => navigation.navigate('PaymentDetail', { id: item.id })}
    >
      <View style={styles.itemRow}>
        <View style={styles.itemLeft}>
          <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
          {item.paid_at && (
            <Text style={styles.paidDate}>
              Thanh toan: {formatDate(item.paid_at)}
            </Text>
          )}
        </View>
        <StatusBadge status={item.status} size="small" />
      </View>
    </Card>
  );

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View
      style={[
        styles.sectionHeader,
        section.isCurrent && styles.sectionHeaderCurrent,
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          section.isCurrent && styles.sectionTitleCurrent,
        ]}
      >
        {section.title}
      </Text>
      {section.isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>Thang nay</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={
          sections.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Chua co thanh toan"
            description="Ban chua co hoa don thanh toan nao"
          />
        }
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 8,
  },
  sectionHeaderCurrent: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionTitleCurrent: {
    color: '#2563EB',
  },
  currentBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemCard: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  paidDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});

export default PaymentHistoryScreen;

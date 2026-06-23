import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {PressableOpacity, Card, EmptyState, LoadingOverlay} from '../../../components';
import {useAuth, useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchExpensesRequest} from '../../../store/slices/expenseSlice';
import {formatCurrency, formatDate} from '../../../utils';
import type {Expense, ExpenseCategory} from '../../../types';

type FilterTab = 'all' | 'mine' | 'related';

const FILTER_TABS: {key: FilterTab; label: string}[] = [
  {key: 'all', label: 'Tat ca'},
  {key: 'mine', label: 'Toi tra'},
  {key: 'related', label: 'Lien quan toi'},
];

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  food: 'An uong',
  household: 'Do dung',
  utility: 'Tien ich',
  party: 'Tiec',
  transport: 'Di lai',
  other: 'Khac',
};

const ExpenseListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment} = useApartment();
  const {expenses, loading} = useAppSelector(
    (state: any) => state.expense,
  ) as {expenses: Expense[]; loading: boolean};
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchExpensesRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (activeTab === 'mine') {
      return expenses.filter(e => e.payer_id === user?.id);
    }
    if (activeTab === 'related') {
      const shares = (e: Expense) =>
        (e as any).expense_shares?.some(
          (s: any) => s.member_id === user?.id,
        ) ?? false;
      return expenses.filter(e => e.payer_id === user?.id || shares(e));
    }
    return expenses;
  }, [expenses, activeTab, user?.id]);

  const renderItem = ({item}: {item: Expense}) => {
    const payerName = (item as any).payer?.full_name ?? 'Khong ro';
    return (
      <Card
        testID={`expense-item-${item.id}`}
        style={styles.itemCard}
        onPress={() => navigation.navigate('ExpenseDetail', {id: item.id})}>
        <View style={styles.itemHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        </View>
        <Text style={styles.meta}>
          {CATEGORY_LABEL[item.category] ?? item.category} · {payerName} tra
          truoc
        </Text>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView
      testID="tenant-expense-list-screen"
      style={styles.container}
      edges={['top', 'left', 'right']}>
      <LoadingOverlay visible={loading} />

      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <PressableOpacity
            key={tab.key}
            testID={`expense-filter-${tab.key}`}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}>
              {tab.label}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Chua co khoan chi nao"
            description="Tao khoan chi chung dau tien cua can ho"
          />
        }
        refreshing={loading}
        onRefresh={loadData}
      />

      <View style={styles.bottomBar}>
        <PressableOpacity
          testID="expense-balance-btn"
          style={styles.balanceBtn}
          onPress={() => navigation.navigate('Balance')}
          activeOpacity={0.8}>
          <Text style={styles.balanceBtnText}>So no rong</Text>
        </PressableOpacity>
      </View>

      <PressableOpacity
        testID="expense-create-fab"
        style={styles.fab}
        onPress={() => navigation.navigate('ExpenseCreate')}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </PressableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeTab: {backgroundColor: '#2563EB'},
  tabText: {fontSize: 13, fontWeight: '600', color: '#64748B'},
  activeTabText: {color: '#FFFFFF'},
  listContent: {padding: 16, paddingBottom: 140},
  emptyContainer: {flex: 1},
  itemCard: {marginBottom: 10},
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  amount: {fontSize: 16, fontWeight: '700', color: '#2563EB'},
  meta: {fontSize: 13, color: '#64748B', marginBottom: 4},
  dateText: {fontSize: 12, color: '#94A3B8'},
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  balanceBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  balanceBtnText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)',
  },
  fabText: {fontSize: 28, color: '#FFFFFF', lineHeight: 30},
});

export default ExpenseListScreen;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import PressableOpacity from '../../../components/PressableOpacity';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useAuth } from '../../../hooks/useAuth';
import { useApartment } from '../../../hooks/useApartment';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchBorrowRequestsRequest } from '../../../store/slices/borrowSlice';
import { formatDate } from '../../../utils/formatters';
import type { TenantStackParamList } from '../../../types/navigation';
import type { BorrowRequest } from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

type FilterTab = 'all' | 'pending' | 'in_use' | 'returned';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tat ca' },
  { key: 'pending', label: 'Dang cho' },
  { key: 'in_use', label: 'Dang muon' },
  { key: 'returned', label: 'Da tra' },
];

const BorrowListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { apartment, members } = useApartment();
  const { requests, loading } = useAppSelector(state => state.borrow);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchBorrowRequestsRequest({ apartmentId: apartment.id }));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') {
      return requests;
    }
    if (activeTab === 'returned') {
      return requests.filter(
        r => r.status === 'returned' || r.status === 'rejected',
      );
    }
    if (activeTab === 'in_use') {
      return requests.filter(
        r =>
          r.status === 'in_use' ||
          r.status === 'approved' ||
          r.status === 'return_requested',
      );
    }
    return requests.filter(r => r.status === activeTab);
  }, [requests, activeTab]);

  const getMemberName = useCallback(
    (userId: string) => {
      const member = members.find(m => m.user_id === userId);
      return member?.profile?.full_name ?? 'Khong ro';
    },
    [members],
  );

  const renderItem = ({ item }: { item: BorrowRequest }) => {
    const isBorrower = item.borrower_id === user?.id;
    return (
      <Card
        style={styles.itemCard}
        onPress={() => navigation.navigate('BorrowDetail', { id: item.id })}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.assetName} numberOfLines={1}>
            {item.asset_id}
          </Text>
          <StatusBadge status={item.status} size="small" />
        </View>
        <Text style={styles.personLabel}>
          {isBorrower ? 'Nguoi cho muon' : 'Nguoi muon'}:{' '}
          <Text style={styles.personName}>
            {isBorrower
              ? getMemberName(item.lender_id)
              : getMemberName(item.borrower_id)}
          </Text>
        </Text>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />

      {/* Filter tabs */}
      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <PressableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredRequests.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Khong co yeu cau muon do"
            description="Ban chua co yeu cau muon do nao"
          />
        }
        refreshing={loading}
        onRefresh={loadData}
      />

      {/* FAB */}
      <PressableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BorrowCreate')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </PressableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
  },
  itemCard: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  personLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  personName: {
    fontWeight: '600',
    color: '#1E293B',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)',
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 30,
  },
});

export default BorrowListScreen;

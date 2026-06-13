import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PressableOpacity from '../../../components/PressableOpacity';
import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import LoadingOverlay from '../../../components/LoadingOverlay';
import StatusBadge from '../../../components/StatusBadge';
import { useApartment } from '../../../hooks/useApartment';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchBorrowRequestsRequest } from '../../../store/slices/borrowSlice';
import { formatDate } from '../../../utils/formatters';
import type { LandlordStackParamList } from '../../../types/navigation';
import type { BorrowRequest } from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type FilterTab = 'pending' | 'active' | 'history';

const FILTER_TABS: {key: FilterTab; label: string}[] = [
  {key: 'pending', label: 'Dang cho'},
  {key: 'active', label: 'Dang muon'},
  {key: 'history', label: 'Lich su'},
];

const BorrowListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { apartment } = useApartment();
  const { requests, loading } = useAppSelector(state => state.borrow);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchBorrowRequestsRequest({ apartmentId: apartment.id }));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'pending') {
      return requests.filter(item => item.status === 'pending');
    }
    if (activeTab === 'active') {
      return requests.filter(item =>
        ['approved', 'in_use', 'return_requested'].includes(item.status),
      );
    }
    return requests.filter(item =>
      ['returned', 'rejected'].includes(item.status),
    );
  }, [activeTab, requests]);

  const renderItem = ({ item }: {item: BorrowRequest}) => {
    const assetName = (item as any).assets?.name ?? item.asset_id;
    const borrowerName = (item as any).borrower?.full_name ?? 'Nguoi muon';

    return (
      <Card
        testID={`landlord-borrow-item-${item.id}`}
        style={styles.itemCard}
        onPress={() =>
          navigation.navigate('LandlordBorrowDetail', { id: item.id })
        }
      >
        <View style={styles.itemHeader}>
          <Text style={styles.assetName} numberOfLines={1}>
            {assetName}
          </Text>
          <StatusBadge status={item.status} size="small" />
        </View>
        <Text style={styles.metaText}>
          Nguoi muon: <Text style={styles.metaValue}>{borrowerName}</Text>
        </Text>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView
      testID="landlord-borrow-list-screen"
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <LoadingOverlay visible={loading} />
      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <PressableOpacity
            key={tab.key}
            testID={`landlord-borrow-filter-${tab.key}`}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
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
        refreshing={loading}
        onRefresh={loadData}
        contentContainerStyle={
          filteredRequests.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Khong co yeu cau"
            description="Chua co yeu cau muon do trong nhom nay"
          />
        }
      />
    </SafeAreaView>
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
    paddingBottom: 32,
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
    gap: 8,
    marginBottom: 8,
  },
  assetName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  metaValue: {
    fontWeight: '600',
    color: '#1E293B',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default BorrowListScreen;

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card, StatusBadge, EmptyState, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchIssuesRequest} from '../../../store/slices/issueSlice';
import {formatDate, getStatusLabel} from '../../../utils/formatters';
import type {TenantStackParamList} from '../../../types/navigation';
import type {Issue} from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

type FilterTab = 'all' | 'open' | 'in_progress' | 'resolved';

const FILTER_TABS: {key: FilterTab; label: string}[] = [
  {key: 'all', label: 'Tat ca'},
  {key: 'open', label: 'Mo'},
  {key: 'in_progress', label: 'Dang xu ly'},
  {key: 'resolved', label: 'Da xong'},
];

const CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Hong hoc',
  noise: 'Tieng on',
  hygiene: 'Ve sinh',
  security: 'An ninh',
  other: 'Khac',
};

const CATEGORY_COLORS: Record<string, string> = {
  equipment: '#EA580C',
  noise: '#9333EA',
  hygiene: '#16A34A',
  security: '#DC2626',
  other: '#64748B',
};

const IssueListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {apartment} = useApartment();
  const {issues, loading} = useAppSelector(state => state.issue);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchIssuesRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredIssues = useMemo(() => {
    if (activeTab === 'all') {
      return issues;
    }
    if (activeTab === 'resolved') {
      return issues.filter(
        i => i.status === 'resolved' || i.status === 'closed',
      );
    }
    if (activeTab === 'open') {
      return issues.filter(
        i => i.status === 'open' || i.status === 'reopened',
      );
    }
    return issues.filter(i => i.status === activeTab);
  }, [issues, activeTab]);

  const renderItem = ({item}: {item: Issue}) => (
    <Card
      style={styles.itemCard}
      onPress={() => navigation.navigate('IssueDetail', {id: item.id})}>
      <View style={styles.itemHeader}>
        <Text style={styles.issueTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <StatusBadge status={item.status} size="small" />
      </View>

      <View style={styles.badgeRow}>
        {/* Category badge */}
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor:
                (CATEGORY_COLORS[item.category] ?? '#64748B') + '18',
            },
          ]}>
          <Text
            style={[
              styles.categoryBadgeText,
              {color: CATEGORY_COLORS[item.category] ?? '#64748B'},
            ]}>
            {CATEGORY_LABELS[item.category] ?? item.category}
          </Text>
        </View>

        {/* Urgency badge */}
        <View
          style={[
            styles.urgencyBadge,
            item.urgency === 'urgent'
              ? styles.urgentBadge
              : styles.normalBadge,
          ]}>
          <Text
            style={[
              styles.urgencyBadgeText,
              item.urgency === 'urgent'
                ? styles.urgentText
                : styles.normalText,
            ]}>
            {getStatusLabel(item.urgency)}
          </Text>
        </View>
      </View>

      <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />

      {/* Filter tabs */}
      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
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
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredIssues}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filteredIssues.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Khong co su co nao"
            description="Chua co su co nao duoc bao cao"
          />
        }
        refreshing={loading}
        onRefresh={loadData}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('IssueCreate')}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
  },
  normalBadge: {
    backgroundColor: '#EFF6FF',
  },
  urgencyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgentText: {
    color: '#DC2626',
  },
  normalText: {
    color: '#2563EB',
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
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 30,
  },
});

export default IssueListScreen;

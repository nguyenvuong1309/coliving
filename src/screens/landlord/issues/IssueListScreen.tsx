import React, {useEffect, useMemo, useState} from 'react';
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
import {
  Card,
  StatusBadge,
  EmptyState,
  LoadingOverlay,
} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchIssuesRequest} from '../../../store/slices/issueSlice';
import {formatRelativeTime, getStatusLabel} from '../../../utils/formatters';
import type {LandlordStackParamList} from '../../../types/navigation';
import type {Issue} from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

type FilterTab = 'all' | 'open' | 'in_progress' | 'resolved';

const FILTER_TABS: {key: FilterTab; label: string}[] = [
  {key: 'all', label: 'Tat ca'},
  {key: 'open', label: 'Mo'},
  {key: 'in_progress', label: 'Dang xu ly'},
  {key: 'resolved', label: 'Da xong'},
];

const IssueListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {apartment, members} = useApartment();
  const {issues, loading} = useAppSelector(state => state.issue);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (apartment?.id) {
      dispatch(fetchIssuesRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  const onRefresh = React.useCallback(() => {
    if (apartment?.id) {
      setRefreshing(true);
      dispatch(fetchIssuesRequest({apartmentId: apartment.id}));
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [apartment?.id, dispatch]);

  const memberNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach(m => {
      map[m.user_id] = m.profile?.full_name ?? 'Nguoi thue';
    });
    return map;
  }, [members]);

  const filteredIssues = useMemo(() => {
    let result = [...issues];

    if (activeFilter !== 'all') {
      if (activeFilter === 'open') {
        result = result.filter(
          i => i.status === 'open' || i.status === 'reopened',
        );
      } else if (activeFilter === 'resolved') {
        result = result.filter(
          i => i.status === 'resolved' || i.status === 'closed',
        );
      } else {
        result = result.filter(i => i.status === activeFilter);
      }
    }

    // Sort: urgent first, then by date
    result.sort((a, b) => {
      if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
      if (a.urgency !== 'urgent' && b.urgency === 'urgent') return 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return result;
  }, [issues, activeFilter]);

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      equipment: 'Thiet bi',
      noise: 'Tieng on',
      hygiene: 'Ve sinh',
      security: 'An ninh',
      other: 'Khac',
    };
    return labels[category] ?? category;
  };

  const renderItem = ({item}: {item: Issue}) => (
    <Card
      style={styles.issueCard}
      onPress={() =>
        navigation.navigate('LandlordIssueDetail', {id: item.id})
      }>
      <View style={styles.issueHeader}>
        <Text style={styles.issueTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.urgency === 'urgent' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>Khan cap</Text>
          </View>
        )}
      </View>
      <View style={styles.issueMeta}>
        <Text style={styles.issueMetaText}>
          {memberNameMap[item.reporter_id] ?? 'Nguoi bao'}
        </Text>
        <Text style={styles.issueDot}> - </Text>
        <Text style={styles.issueMetaText}>
          {getCategoryLabel(item.category)}
        </Text>
      </View>
      <View style={styles.issueFooter}>
        <StatusBadge status={item.status} size="small" />
        <Text style={styles.issueDate}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(tab.key)}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredIssues.length === 0 && !loading ? (
        <EmptyState
          title="Khong co su co nao"
          description="Tat ca su co se hien thi o day"
        />
      ) : (
        <FlatList
          data={filteredIssues}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.gap} />}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  gap: {
    height: 10,
  },
  issueCard: {
    paddingVertical: 14,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  issueTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  issueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueMetaText: {
    fontSize: 13,
    color: '#64748B',
  },
  issueDot: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  issueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  issueDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default IssueListScreen;

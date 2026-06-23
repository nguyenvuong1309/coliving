import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PressableOpacity, Card, StatusBadge, EmptyState, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {
  fetchChoresRequest,
  fetchAssignmentsRequest,
  completeAssignmentRequest,
} from '../../../store/slices/choreSlice';
import {formatDate} from '../../../utils';
import type {TenantStackParamList, ChoreAssignment} from '../../../types';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

type FilterTab = 'pending' | 'done' | 'all';

const FILTER_TABS: {key: FilterTab; label: string}[] = [
  {key: 'pending', label: 'Can lam'},
  {key: 'done', label: 'Da xong'},
  {key: 'all', label: 'Tat ca'},
];

const RECURRENCE_LABEL: Record<string, string> = {
  once: 'Mot lan',
  daily: 'Hang ngay',
  weekly: 'Hang tuan',
  monthly: 'Hang thang',
};

const ChoreBoardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {apartment} = useApartment();
  const {assignments, loading} = useAppSelector(state => state.chore);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchChoresRequest({apartmentId: apartment.id}));
      dispatch(fetchAssignmentsRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') {
      return assignments;
    }
    if (activeTab === 'done') {
      return assignments.filter((a: ChoreAssignment) => a.status === 'done');
    }
    return assignments.filter(
      (a: ChoreAssignment) => a.status === 'pending',
    );
  }, [assignments, activeTab]);

  const handleComplete = useCallback(
    (id: string) => {
      if (apartment?.id) {
        dispatch(completeAssignmentRequest({id, apartmentId: apartment.id}));
      }
    },
    [apartment?.id, dispatch],
  );

  const renderItem = ({item}: {item: ChoreAssignment}) => {
    const title = item.chore?.title ?? 'Viec nha';
    const points = item.chore?.points ?? 0;
    const recurrence = item.chore?.recurrence
      ? RECURRENCE_LABEL[item.chore.recurrence]
      : '';
    return (
      <Card testID={`chore-assignment-${item.id}`} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.choreTitle} numberOfLines={1}>
            {title}
          </Text>
          <StatusBadge status={item.status} size="small" />
        </View>
        <Text style={styles.metaText}>
          Nguoi lam:{' '}
          <Text style={styles.metaStrong}>
            {item.assignee?.full_name ?? 'Khong ro'}
          </Text>
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.pointsText}>+{points} diem</Text>
          {!!recurrence && <Text style={styles.metaText}>{recurrence}</Text>}
          {!!item.due_date && (
            <Text style={styles.metaText}>Han: {formatDate(item.due_date)}</Text>
          )}
        </View>
        {item.status === 'pending' && (
          <PressableOpacity
            testID={`chore-done-${item.id}`}
            style={styles.doneBtn}
            onPress={() => handleComplete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.doneBtnText}>Danh dau hoan thanh</Text>
          </PressableOpacity>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView
      testID="tenant-chore-board-screen"
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <LoadingOverlay visible={loading} />

      <View style={styles.headerRow}>
        <Text style={styles.heading}>Viec nha</Text>
        <PressableOpacity
          testID="chore-leaderboard-link"
          style={styles.lbBtn}
          onPress={() => navigation.navigate('ChoreLeaderboard')}
          activeOpacity={0.7}
        >
          <Text style={styles.lbBtnText}>Bang xep hang</Text>
        </PressableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <PressableOpacity
            key={tab.key}
            testID={`chore-filter-${tab.key}`}
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
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Chua co viec nha"
            description="Tao viec nha va phan cong cho cac thanh vien"
          />
        }
        refreshing={loading}
        onRefresh={loadData}
      />

      <PressableOpacity
        testID="chore-create-fab"
        style={styles.fab}
        onPress={() => navigation.navigate('ChoreCreate')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </PressableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heading: {fontSize: 20, fontWeight: '700', color: '#1E293B'},
  lbBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
  },
  lbBtnText: {fontSize: 13, fontWeight: '600', color: '#B45309'},
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
  listContent: {padding: 16, paddingBottom: 80},
  emptyContainer: {flex: 1},
  itemCard: {marginBottom: 10},
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  metaText: {fontSize: 13, color: '#64748B', marginBottom: 4},
  metaStrong: {fontWeight: '600', color: '#1E293B'},
  metaRow: {flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 2},
  pointsText: {fontSize: 13, fontWeight: '700', color: '#16A34A'},
  doneBtn: {
    marginTop: 10,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {color: '#FFFFFF', fontSize: 14, fontWeight: '600'},
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
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

export default ChoreBoardScreen;

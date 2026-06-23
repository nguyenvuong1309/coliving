import React, {useCallback, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, EmptyState, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchLeaderboardRequest} from '../../../store/slices/choreSlice';
import type {LeaderboardEntry} from '../../../types';

const MEDALS = ['🥇', '🥈', '🥉'];

const ChoreLeaderboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {apartment} = useApartment();
  const {leaderboard, loading} = useAppSelector(state => state.chore);

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchLeaderboardRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    const medal = MEDALS[index];
    return (
      <Card testID={`leaderboard-item-${item.assignee_id}`} style={styles.card}>
        <View style={styles.rankWrap}>
          {medal ? (
            <Text style={styles.medal}>{medal}</Text>
          ) : (
            <Text style={styles.rankNum}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.infoWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {item.full_name ?? 'Thanh vien'}
          </Text>
          <Text style={styles.subText}>{item.done_count} viec da xong</Text>
        </View>
        <Text style={styles.points}>{item.total_points} d</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView
      testID="tenant-chore-leaderboard-screen"
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <LoadingOverlay visible={loading} />
      <Text style={styles.heading}>Bang xep hang viec nha</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={item => item.assignee_id}
        renderItem={renderItem}
        contentContainerStyle={
          leaderboard.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Chua co diem nao"
            description="Hoan thanh viec nha de ghi diem va leo hang"
          />
        }
        refreshing={loading}
        onRefresh={loadData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {padding: 16},
  emptyContainer: {flex: 1},
  card: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankWrap: {width: 40, alignItems: 'center'},
  medal: {fontSize: 24},
  rankNum: {fontSize: 18, fontWeight: '700', color: '#64748B'},
  infoWrap: {flex: 1, marginLeft: 8},
  name: {fontSize: 16, fontWeight: '600', color: '#1E293B'},
  subText: {fontSize: 13, color: '#64748B', marginTop: 2},
  points: {fontSize: 18, fontWeight: '700', color: '#16A34A'},
});

export default ChoreLeaderboardScreen;

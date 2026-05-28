import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import { useApartment } from '../../hooks/useApartment';

const RoommateListScreen: React.FC = () => {
  const { user } = useAuth();
  const { apartment, members, loading, fetchMembers } = useApartment();

  useEffect(() => {
    if (apartment?.id) {
      fetchMembers(apartment.id);
    }
  }, [apartment?.id, fetchMembers]);

  const roommates = members.filter(m => m.user_id !== user?.id);

  const renderItem = ({ item }: { item: (typeof members)[0] }) => (
    <View style={styles.memberCard}>
      <Avatar
        uri={item.profile?.avatar_url}
        name={item.profile?.full_name ?? 'U'}
        size={48}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.profile?.full_name ?? 'Khong ro'}
        </Text>
        {item.room_name && (
          <Text style={styles.memberRoom}>{item.room_name}</Text>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper scroll={false} padding={0}>
      <LoadingOverlay visible={loading} />
      <FlatList
        data={roommates}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          roommates.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Chua co roommate"
            description="Can ho chua co thanh vien nao khac"
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
  memberInfo: {
    marginLeft: 14,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  memberRoom: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});

export default RoommateListScreen;

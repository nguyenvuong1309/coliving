import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import {PressableOpacity, Card, Avatar, StatusBadge, EmptyState, LoadingOverlay, ScreenWrapper} from '../../../components';
import {useApartment} from '../../../hooks';
import {formatCurrency} from '../../../utils';
import type {LandlordStackParamList} from '../../../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../../store';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const TenantListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { apartment, members, loading, fetchMembers } = useApartment();
  const { payments } = useAppSelector(state => state.payment);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (apartment?.id) {
      fetchMembers(apartment.id);
    }
  }, [apartment?.id, fetchMembers]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PressableOpacity
          testID="tenants-invite-btn"
          onPress={() => {
            if (apartment?.id) {
              navigation.navigate('InviteCode', {
                apartmentId: apartment.id,
              });
            }
          }}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>Ma moi</Text>
        </PressableOpacity>
      ),
    });
  }, [navigation, apartment?.id]);

  const onRefresh = React.useCallback(() => {
    if (apartment?.id) {
      setRefreshing(true);
      fetchMembers(apartment.id);
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [apartment?.id, fetchMembers]);

  const renderSeparator = React.useCallback(
    () => <View style={styles.gap} />,
    [],
  );

  const paymentStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    payments.forEach(p => {
      map[p.tenant_id] = p.status;
    });
    return map;
  }, [payments]);

  const renderItem = ({ item }: { item: (typeof members)[0] }) => {
    const profile = item.profile;
    const name = profile?.full_name ?? 'Nguoi thue';
    const paymentStatus = paymentStatusMap[item.user_id] ?? 'unpaid';

    return (
      <Card
        testID={`tenant-item-${item.user_id}`}
        style={styles.tenantCard}
        onPress={() =>
          navigation.navigate('TenantDetail', { id: item.user_id })
        }
      >
        <View style={styles.tenantRow}>
          <Avatar uri={profile?.avatar_url} name={name} size={48} />
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantName}>{name}</Text>
            <Text style={styles.tenantRoom}>
              {item.room_name ?? 'Chua gan phong'} -{' '}
              {formatCurrency(item.rent_amount)}
            </Text>
          </View>
          <StatusBadge status={paymentStatus} size="small" />
        </View>
      </Card>
    );
  };

  if (!loading && members.length === 0) {
    return (
      <ScreenWrapper testID="tenant-list-screen" scroll={false}>
        <EmptyState
          title="Chua co nguoi thue"
          description="Moi nguoi thue tham gia can ho cua ban bang ma moi"
          actionLabel="Moi nguoi thue"
          onAction={() => {
            if (apartment?.id) {
              navigation.navigate('InviteCode', {
                apartmentId: apartment.id,
              });
            }
          }}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper testID="tenant-list-screen" scroll={false}>
      <LoadingOverlay visible={loading && !refreshing} />
      <FlatList
        data={members}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={renderSeparator}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  gap: {
    height: 10,
  },
  tenantCard: {
    paddingVertical: 14,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  tenantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  tenantRoom: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
});

export default TenantListScreen;

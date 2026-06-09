import React, {useCallback, useEffect} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import LoadingOverlay from '../../../components/LoadingOverlay';
import {useAuth} from '../../../hooks/useAuth';
import {useApartment} from '../../../hooks/useApartment';
import type {LandlordStackParamList} from '../../../types/navigation';
import type {Apartment} from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const ApartmentSwitcherScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {user} = useAuth();
  const {
    apartment,
    apartments,
    loading,
    fetchApartments,
    selectApartment,
  } = useApartment();

  useEffect(() => {
    if (user?.id && user.role) {
      fetchApartments(user.id, user.role);
    }
  }, [fetchApartments, user?.id, user?.role]);

  const handleSelect = useCallback(
    (item: Apartment) => {
      selectApartment(item.id);
      navigation.goBack();
    },
    [navigation, selectApartment],
  );

  const renderItem = ({item}: {item: Apartment}) => {
    const isSelected = item.id === apartment?.id;

    return (
      <Card style={styles.card} onPress={() => handleSelect(item)}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address} numberOfLines={2}>
              {item.address}
            </Text>
            <Text style={styles.meta}>{item.num_rooms} phong</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>Dang chon</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <FlatList
        data={apartments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          apartments.length === 0 ? styles.emptyContainer : styles.list
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <EmptyState
            title="Chua co can ho"
            description="Hay tao can ho dau tien de bat dau quan ly."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
  },
  gap: {
    height: 10,
  },
  card: {
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  address: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  selectedBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
});

export default ApartmentSwitcherScreen;

import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card, StatusBadge, EmptyState, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector} from '../../../store';
import {getStatusLabel} from '../../../utils/formatters';
import type {LandlordStackParamList} from '../../../types/navigation';
import type {Asset} from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const AssetListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {apartment} = useApartment();
  const {requests: borrowRequests} = useAppSelector(state => state.borrow);

  // Assets would typically come from a dedicated asset slice; using borrow slice data
  // to derive the currently borrowed assets.
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const borrowedAssetMap = useMemo(() => {
    const map: Record<string, string> = {};
    borrowRequests
      .filter(r => r.status === 'in_use' || r.status === 'approved')
      .forEach(r => {
        map[r.asset_id] = r.borrower_id;
      });
    return map;
  }, [borrowRequests]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = ({item}: {item: Asset}) => {
    const borrowerId = borrowedAssetMap[item.id];

    return (
      <Card
        style={styles.assetCard}
        onPress={() => navigation.navigate('AssetEdit', {id: item.id})}>
        <View style={styles.assetRow}>
          {item.image_url ? (
            <Image source={{uri: item.image_url}} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailText}>IMG</Text>
            </View>
          )}
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{item.name}</Text>
            {item.category && (
              <Text style={styles.assetMeta}>{item.category}</Text>
            )}
            {item.location && (
              <Text style={styles.assetMeta}>{item.location}</Text>
            )}
            {borrowerId && (
              <Text style={styles.borrowedText}>Dang duoc muon</Text>
            )}
          </View>
          <StatusBadge status={item.condition} size="small" />
        </View>
      </Card>
    );
  };

  if (!loading && assets.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Chua co tai san"
          description="Them tai san de quan ly va cho muon"
          actionLabel="Them tai san"
          onAction={() => navigation.navigate('AssetEdit', {})}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AssetEdit', {})}
          activeOpacity={0.8}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />
      <FlatList
        data={assets}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AssetEdit', {})}
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
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  gap: {
    height: 10,
  },
  assetCard: {
    paddingVertical: 12,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  assetInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  assetMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  borrowedText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
    fontWeight: '400',
    lineHeight: 30,
  },
});

export default AssetListScreen;

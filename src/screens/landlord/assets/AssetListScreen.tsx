import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import {PressableOpacity, Card, StatusBadge, EmptyState, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks';
import {getSignedImageUrl} from '../../../services';
import type {LandlordStackParamList, Asset} from '../../../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchAssetsRequest } from '../../../store/slices/assetSlice';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const AssetListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { apartment } = useApartment();
  const { requests: borrowRequests } = useAppSelector(state => state.borrow);
  const { assets, loading } = useAppSelector(state => state.asset);
  const [refreshing, setRefreshing] = React.useState(false);
  const [signedImageUrls, setSignedImageUrls] = React.useState<
    Record<string, string>
  >({});

  const borrowedAssetMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of borrowRequests) {
      if (r.status === 'in_use' || r.status === 'approved') {
        map[r.asset_id] = r.borrower_id;
      }
    }
    return map;
  }, [borrowRequests]);

  useEffect(() => {
    if (apartment?.id) {
      dispatch(fetchAssetsRequest({ apartmentId: apartment.id }));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const loadSignedUrls = async () => {
      const imageAssets = [];
      for (const asset of assets) {
        if (asset.image_url) {
          imageAssets.push(asset);
        }
      }

      const entries = await Promise.all(
        imageAssets.map(
          async asset =>
            [
              asset.id,
              await getSignedImageUrl('asset-images', asset.image_url!),
            ] as const,
        ),
      );

      if (!cancelled) {
        setSignedImageUrls(Object.fromEntries(entries));
      }
    };

    loadSignedUrls();
    return () => {
      cancelled = true;
    };
  }, [assets]);

  const onRefresh = React.useCallback(() => {
    if (!apartment?.id) {
      return;
    }
    setRefreshing(true);
    dispatch(fetchAssetsRequest({ apartmentId: apartment.id }));
    setTimeout(() => setRefreshing(false), 600);
  }, [apartment?.id, dispatch]);

  const renderSeparator = React.useCallback(
    () => <View style={styles.gap} />,
    [],
  );

  const renderItem = ({ item }: { item: Asset }) => {
    const borrowerId = borrowedAssetMap[item.id];

    return (
      <Card
        testID={`asset-item-${item.id}`}
        style={styles.assetCard}
        onPress={() => navigation.navigate('AssetEdit', { id: item.id })}
      >
        <View style={styles.assetRow}>
          {item.image_url ? (
            <Image
              source={{ uri: signedImageUrls[item.id] ?? item.image_url }}
              style={styles.thumbnail}
            />
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
      <View testID="asset-list-screen" style={styles.container}>
        <EmptyState
          title="Chua co tai san"
          description="Them tai san de quan ly va cho muon"
          actionLabel="Them tai san"
          onAction={() => navigation.navigate('AssetEdit', {})}
        />
        <PressableOpacity
          testID="asset-create-fab"
          style={styles.fab}
          onPress={() => navigation.navigate('AssetEdit', {})}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </PressableOpacity>
      </View>
    );
  }

  return (
    <View testID="asset-list-screen" style={styles.container}>
      <LoadingOverlay visible={loading && !refreshing} />
      <FlatList
        data={assets}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={renderSeparator}
      />
      <PressableOpacity
        testID="asset-create-fab"
        style={styles.fab}
        onPress={() => navigation.navigate('AssetEdit', {})}
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
    boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)',
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 30,
  },
});

export default AssetListScreen;

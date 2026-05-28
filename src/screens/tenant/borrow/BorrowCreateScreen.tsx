import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import PressableOpacity from '../../../components/PressableOpacity';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Card from '../../../components/Card';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useAuth } from '../../../hooks/useAuth';
import { useApartment } from '../../../hooks/useApartment';
import { useAppSelector, useAppDispatch } from '../../../store';
import { createBorrowRequestRequest } from '../../../store/slices/borrowSlice';
import { fetchAssetsRequest } from '../../../store/slices/assetSlice';
import {
  borrowRequestSchema,
  type BorrowRequestFormData,
} from '../../../schemas/borrow';
import type { Asset } from '../../../types/database';

const BorrowCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { apartment } = useApartment();
  const { loading } = useAppSelector(state => state.borrow);
  const assets = useAppSelector(state => state.asset.assets) as Asset[];

  useEffect(() => {
    if (apartment?.id) {
      dispatch(fetchAssetsRequest({ apartmentId: apartment.id }));
    }
  }, [apartment?.id, dispatch]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BorrowRequestFormData>({
    resolver: zodResolver(borrowRequestSchema),
    defaultValues: {
      asset_id: '',
      lender_id: '',
      note: '',
      borrow_duration: '',
    },
  });

  const selectedAssetId = watch('asset_id');
  const borrowableAssets = useMemo(
    () => assets.filter(asset => asset.is_borrowable),
    [assets],
  );

  const onSubmit = (data: BorrowRequestFormData) => {
    if (!user?.id || !apartment?.id) {
      return;
    }
    dispatch(
      createBorrowRequestRequest({
        apartment_id: apartment.id,
        asset_id: data.asset_id,
        borrower_id: user.id,
        lender_id: data.lender_id,
        note: data.note,
        borrow_duration: data.borrow_duration,
      }),
    );
  };

  // Navigate back on success
  const prevLoading = React.useRef(loading);
  useEffect(() => {
    if (prevLoading.current && !loading) {
      navigation.goBack();
    }
    prevLoading.current = loading;
  }, [loading, navigation]);

  const renderAssetItem = ({ item }: { item: Asset }) => {
    const isSelected = selectedAssetId === item.id;
    return (
      <PressableOpacity
        style={[styles.assetItem, isSelected && styles.assetItemSelected]}
        onPress={() => {
          setValue('asset_id', item.id, { shouldValidate: true });
          if (item.owner_id) {
            setValue('lender_id', item.owner_id, { shouldValidate: true });
          }
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.assetName, isSelected && styles.assetNameSelected]}
        >
          {item.name}
        </Text>
        {item.category && (
          <Text style={styles.assetCategory}>{item.category}</Text>
        )}
      </PressableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <LoadingOverlay visible={loading} message="Dang tao yeu cau..." />

      <Text style={styles.title}>Tao yeu cau muon do</Text>

      {/* Asset selection */}
      <Text style={styles.label}>Chon do muon</Text>
      {borrowableAssets.length > 0 ? (
        <FlatList
          data={borrowableAssets}
          keyExtractor={item => item.id}
          renderItem={renderAssetItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.assetList}
          contentContainerStyle={styles.assetListContent}
        />
      ) : (
        <Card style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Chua co tai san nao de muon
          </Text>
        </Card>
      )}
      {errors.asset_id && (
        <Text style={styles.errorText}>{errors.asset_id.message}</Text>
      )}

      {/* Note */}
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Ghi chu"
            placeholder="Ly do muon, thoi gian du kien..."
            value={value ?? ''}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
            error={errors.note?.message}
          />
        )}
      />

      {/* Borrow duration */}
      <Controller
        control={control}
        name="borrow_duration"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Thoi gian muon"
            placeholder="VD: 2 ngay, 1 tuan..."
            value={value}
            onChangeText={onChange}
            error={errors.borrow_duration?.message}
          />
        )}
      />

      <View style={styles.submitContainer}>
        <Button
          title="Gui yeu cau"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  assetList: {
    marginBottom: 8,
  },
  assetListContent: {
    gap: 10,
  },
  assetItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minWidth: 120,
  },
  assetItemSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  assetNameSelected: {
    color: '#2563EB',
  },
  assetCategory: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  placeholderCard: {
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 12,
  },
  submitContainer: {
    marginTop: 16,
  },
});

export default BorrowCreateScreen;

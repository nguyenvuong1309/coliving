import React, { useCallback, useEffect, useReducer } from 'react';
import { View, Text, Switch, Alert, Image, StyleSheet } from 'react-native';
import {PressableOpacity, ScreenWrapper, Input, Button, Card, LoadingOverlay} from '../../../components';
import {useApartment, useAuth} from '../../../hooks';
import {getSignedImageUrl} from '../../../services';
import type {LandlordStackParamList, Asset} from '../../../types';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  createAssetRequest,
  updateAssetRequest,
  deleteAssetRequest,
} from '../../../store/slices/assetSlice';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type EditRouteProp = RouteProp<LandlordStackParamList, 'AssetEdit'>;

const CATEGORIES = ['Dien tu', 'Noi that', 'Bep', 'Ve sinh', 'Khac'];
const LOCATIONS = ['Phong khach', 'Bep', 'Ban cong', 'Kho', 'San thuong'];
const CONDITIONS: { label: string; value: 'good' | 'fair' | 'poor' }[] = [
  { label: 'Tot', value: 'good' },
  { label: 'Kha', value: 'fair' },
  { label: 'Kem', value: 'poor' },
];

type AssetFormState = {
  name: string;
  category: string;
  location: string;
  condition: 'good' | 'fair' | 'poor';
  isBorrowable: boolean;
  imageUri: string | null;
};

type AssetFormAction =
  | { type: 'setName'; value: string }
  | { type: 'setCategory'; value: string }
  | { type: 'setLocation'; value: string }
  | { type: 'setCondition'; value: 'good' | 'fair' | 'poor' }
  | { type: 'setIsBorrowable'; value: boolean }
  | { type: 'setImageUri'; value: string | null };

function getInitialAssetFormState(existing: Asset | undefined): AssetFormState {
  return {
    name: existing?.name ?? '',
    category: existing?.category ?? CATEGORIES[0],
    location: existing?.location ?? LOCATIONS[0],
    condition: existing?.condition ?? 'good',
    isBorrowable: existing?.is_borrowable ?? true,
    imageUri: existing?.image_url ?? null,
  };
}

function assetFormReducer(
  state: AssetFormState,
  action: AssetFormAction,
): AssetFormState {
  switch (action.type) {
    case 'setName':
      return { ...state, name: action.value };
    case 'setCategory':
      return { ...state, category: action.value };
    case 'setLocation':
      return { ...state, location: action.value };
    case 'setCondition':
      return { ...state, condition: action.value };
    case 'setIsBorrowable':
      return { ...state, isBorrowable: action.value };
    case 'setImageUri':
      return { ...state, imageUri: action.value };
  }
}

const AssetEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditRouteProp>();
  const dispatch = useAppDispatch();
  const { apartment } = useApartment();
  const { user } = useAuth();
  const { assets, loading } = useAppSelector(state => state.asset);

  const editId = route.params?.id;
  const isEditMode = !!editId;
  const existing = isEditMode ? assets.find(a => a.id === editId) : undefined;

  const [form, updateForm] = useReducer(
    assetFormReducer,
    existing,
    getInitialAssetFormState,
  );
  const newImagePickedRef = React.useRef(false);
  const [signedPreviewUrl, setSignedPreviewUrl] = React.useState<string | null>(
    null,
  );

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Chinh sua tai san' : 'Them tai san',
    });
  }, [isEditMode, navigation]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });
      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri ?? null;
        updateForm({ type: 'setImageUri', value: uri });
        setSignedPreviewUrl(null);
        newImagePickedRef.current = true;
      }
    } catch {
      // User cancelled
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSignedPreview = async () => {
      if (!form.imageUri || newImagePickedRef.current) {
        setSignedPreviewUrl(null);
        return;
      }

      const signedUrl = await getSignedImageUrl('asset-images', form.imageUri);
      if (!cancelled) {
        setSignedPreviewUrl(signedUrl);
      }
    };

    loadSignedPreview();
    return () => {
      cancelled = true;
    };
  }, [form.imageUri]);

  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      navigation.goBack();
    }
    prevLoadingRef.current = loading;
  }, [loading, navigation]);

  const handleSubmit = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Loi', 'Vui long nhap ten tai san');
      return;
    }
    if (!apartment?.id) {
      Alert.alert('Loi', 'Khong tim thay can ho');
      return;
    }
    if (isEditMode && editId) {
      dispatch(
        updateAssetRequest({
          id: editId,
          updates: {
            name: form.name.trim(),
            category: form.category,
            location: form.location,
            condition: form.condition,
            is_borrowable: form.isBorrowable,
          },
          imageUri:
            newImagePickedRef.current && form.imageUri
              ? form.imageUri
              : undefined,
        }),
      );
    } else {
      dispatch(
        createAssetRequest({
          apartment_id: apartment.id,
          owner_id: user?.id ?? null,
          name: form.name.trim(),
          category: form.category,
          location: form.location,
          condition: form.condition,
          is_borrowable: form.isBorrowable,
          imageUri: form.imageUri ?? undefined,
        }),
      );
    }
  }, [apartment?.id, user?.id, isEditMode, editId, form, dispatch]);

  const handleDelete = useCallback(() => {
    if (!editId) {
      return;
    }
    Alert.alert('Xoa tai san', 'Ban co chac chan muon xoa tai san nay?', [
      { text: 'Huy', style: 'cancel' },
      {
        text: 'Xoa',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteAssetRequest({ id: editId }));
        },
      },
    ]);
  }, [editId, dispatch]);

  return (
    <ScreenWrapper testID="asset-edit-screen" scroll>
      <LoadingOverlay visible={loading} />

      {/* Image Picker */}
      <PressableOpacity
        style={styles.imagePicker}
        onPress={handlePickImage}
        activeOpacity={0.7}
      >
        {form.imageUri ? (
          <Image
            source={{ uri: signedPreviewUrl ?? form.imageUri }}
            style={styles.imagePreview}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>+</Text>
            <Text style={styles.imagePlaceholderText}>Chon hinh anh</Text>
          </View>
        )}
      </PressableOpacity>

      {/* Name */}
      <Input
        testID="asset-name-input"
        label="Ten tai san"
        placeholder="VD: May giat Samsung"
        value={form.name}
        onChangeText={value => updateForm({ type: 'setName', value })}
      />

      {/* Category Picker */}
      <Text style={styles.label}>Danh muc</Text>
      <View style={styles.pickerRow}>
        {CATEGORIES.map(cat => (
          <PressableOpacity
            testID={`asset-category-${cat}`}
            key={cat}
            style={[
              styles.pickerChip,
              form.category === cat && styles.pickerChipActive,
            ]}
            onPress={() => updateForm({ type: 'setCategory', value: cat })}
          >
            <Text
              style={[
                styles.pickerChipText,
                form.category === cat && styles.pickerChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      {/* Location Picker */}
      <Text style={styles.label}>Vi tri</Text>
      <View style={styles.pickerRow}>
        {LOCATIONS.map(loc => (
          <PressableOpacity
            testID={`asset-location-${loc}`}
            key={loc}
            style={[
              styles.pickerChip,
              form.location === loc && styles.pickerChipActive,
            ]}
            onPress={() => updateForm({ type: 'setLocation', value: loc })}
          >
            <Text
              style={[
                styles.pickerChipText,
                form.location === loc && styles.pickerChipTextActive,
              ]}
            >
              {loc}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      {/* Condition Picker */}
      <Text style={styles.label}>Tinh trang</Text>
      <View style={styles.pickerRow}>
        {CONDITIONS.map(c => (
          <PressableOpacity
            testID={`asset-condition-${c.value}`}
            key={c.value}
            style={[
              styles.pickerChip,
              form.condition === c.value && styles.pickerChipActive,
            ]}
            onPress={() => updateForm({ type: 'setCondition', value: c.value })}
          >
            <Text
              style={[
                styles.pickerChipText,
                form.condition === c.value && styles.pickerChipTextActive,
              ]}
            >
              {c.label}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      {/* Borrowable Switch */}
      <Card style={styles.switchCard}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Cho phep muon</Text>
            <Text style={styles.switchDescription}>
              Nguoi thue co the yeu cau muon tai san nay
            </Text>
          </View>
          <Switch
            testID="asset-borrowable-switch"
            value={form.isBorrowable}
            onValueChange={value =>
              updateForm({ type: 'setIsBorrowable', value })
            }
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={form.isBorrowable ? '#2563EB' : '#F1F5F9'}
          />
        </View>
      </Card>

      {/* Submit */}
      <Button
        testID="asset-submit-btn"
        title={isEditMode ? 'Cap nhat' : 'Them tai san'}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />

      {/* Delete (edit mode only) */}
      {isEditMode && (
        <Button
          testID="asset-delete-btn"
          title="Xoa tai san"
          onPress={handleDelete}
          variant="danger"
          style={styles.deleteBtn}
        />
      )}

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  imagePlaceholderIcon: {
    fontSize: 32,
    color: '#94A3B8',
    marginBottom: 4,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  pickerChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  pickerChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  pickerChipTextActive: {
    color: '#2563EB',
  },
  switchCard: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  switchDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  submitBtn: {
    marginBottom: 12,
  },
  deleteBtn: {
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default AssetEditScreen;

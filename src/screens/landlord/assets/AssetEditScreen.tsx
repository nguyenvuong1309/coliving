import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Switch,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  ScreenWrapper,
  Input,
  Button,
  Card,
  LoadingOverlay,
} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import type {LandlordStackParamList} from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type EditRouteProp = RouteProp<LandlordStackParamList, 'AssetEdit'>;

const CATEGORIES = ['Dien tu', 'Noi that', 'Bep', 'Ve sinh', 'Khac'];
const LOCATIONS = ['Phong khach', 'Bep', 'Ban cong', 'Kho', 'San thuong'];
const CONDITIONS: {label: string; value: 'good' | 'fair' | 'poor'}[] = [
  {label: 'Tot', value: 'good'},
  {label: 'Kha', value: 'fair'},
  {label: 'Kem', value: 'poor'},
];

const AssetEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditRouteProp>();
  const {apartment} = useApartment();

  const editId = route.params?.id;
  const isEditMode = !!editId;

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [condition, setCondition] = useState<'good' | 'fair' | 'poor'>('good');
  const [isBorrowable, setIsBorrowable] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      // In a real app, fetch asset by editId and pre-fill fields
      navigation.setOptions({title: 'Chinh sua tai san'});
    } else {
      navigation.setOptions({title: 'Them tai san'});
    }
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
        setImageUri(result.assets[0].uri ?? null);
      }
    } catch {
      // User cancelled
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Loi', 'Vui long nhap ten tai san');
      return;
    }

    setLoading(true);
    // In a real app, dispatch create or update action
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 1000);
  }, [name, category, location, condition, isBorrowable, imageUri, navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert('Xoa tai san', 'Ban co chac chan muon xoa tai san nay?', [
      {text: 'Huy', style: 'cancel'},
      {
        text: 'Xoa',
        style: 'destructive',
        onPress: () => {
          setLoading(true);
          // In a real app, dispatch delete action
          setTimeout(() => {
            setLoading(false);
            navigation.goBack();
          }, 500);
        },
      },
    ]);
  }, [navigation]);

  return (
    <ScreenWrapper scroll>
      <LoadingOverlay visible={loading} />

      {/* Image Picker */}
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={handlePickImage}
        activeOpacity={0.7}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>+</Text>
            <Text style={styles.imagePlaceholderText}>Chon hinh anh</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name */}
      <Input
        label="Ten tai san"
        placeholder="VD: May giat Samsung"
        value={name}
        onChangeText={setName}
      />

      {/* Category Picker */}
      <Text style={styles.label}>Danh muc</Text>
      <View style={styles.pickerRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.pickerChip,
              category === cat && styles.pickerChipActive,
            ]}
            onPress={() => setCategory(cat)}>
            <Text
              style={[
                styles.pickerChipText,
                category === cat && styles.pickerChipTextActive,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location Picker */}
      <Text style={styles.label}>Vi tri</Text>
      <View style={styles.pickerRow}>
        {LOCATIONS.map(loc => (
          <TouchableOpacity
            key={loc}
            style={[
              styles.pickerChip,
              location === loc && styles.pickerChipActive,
            ]}
            onPress={() => setLocation(loc)}>
            <Text
              style={[
                styles.pickerChipText,
                location === loc && styles.pickerChipTextActive,
              ]}>
              {loc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Condition Picker */}
      <Text style={styles.label}>Tinh trang</Text>
      <View style={styles.pickerRow}>
        {CONDITIONS.map(c => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.pickerChip,
              condition === c.value && styles.pickerChipActive,
            ]}
            onPress={() => setCondition(c.value)}>
            <Text
              style={[
                styles.pickerChipText,
                condition === c.value && styles.pickerChipTextActive,
              ]}>
              {c.label}
            </Text>
          </TouchableOpacity>
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
            value={isBorrowable}
            onValueChange={setIsBorrowable}
            trackColor={{false: '#CBD5E1', true: '#93C5FD'}}
            thumbColor={isBorrowable ? '#2563EB' : '#F1F5F9'}
          />
        </View>
      </Card>

      {/* Submit */}
      <Button
        title={isEditMode ? 'Cap nhat' : 'Them tai san'}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />

      {/* Delete (edit mode only) */}
      {isEditMode && (
        <Button
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

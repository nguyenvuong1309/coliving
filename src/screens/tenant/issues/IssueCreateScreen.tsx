import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {launchImageLibrary} from 'react-native-image-picker';
import {ScreenWrapper, Button, Input, LoadingOverlay} from '../../../components';
import {useAuth} from '../../../hooks/useAuth';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../../store';
import {createIssueRequest} from '../../../store/slices/issueSlice';
import {
  issueCreateSchema,
  type IssueCreateFormData,
} from '../../../schemas/issue';

const CATEGORIES = [
  {value: 'equipment' as const, label: 'Hong hoc'},
  {value: 'noise' as const, label: 'Tieng on'},
  {value: 'hygiene' as const, label: 'Ve sinh'},
  {value: 'security' as const, label: 'An ninh'},
  {value: 'other' as const, label: 'Khac'},
];

const LOCATIONS = [
  {value: 'living_room', label: 'Phong khach'},
  {value: 'kitchen', label: 'Bep'},
  {value: 'bathroom', label: 'WC'},
  {value: 'balcony', label: 'Ban cong'},
  {value: 'private_room', label: 'Phong rieng'},
];

const URGENCY_OPTIONS = [
  {value: 'normal' as const, label: 'Binh thuong'},
  {value: 'urgent' as const, label: 'Khan cap'},
];

const IssueCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment} = useApartment();
  const {loading} = useAppSelector(state => state.issue);
  const [images, setImages] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = useForm<IssueCreateFormData>({
    resolver: zodResolver(issueCreateSchema),
    defaultValues: {
      category: undefined,
      location: '',
      urgency: 'normal',
      title: '',
      description: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedLocation = watch('location');
  const selectedUrgency = watch('urgency');

  const onSubmit = (data: IssueCreateFormData) => {
    if (!user?.id || !apartment?.id) {
      return;
    }
    dispatch(
      createIssueRequest({
        title: data.title,
        description: data.description ?? '',
        apartmentId: apartment.id,
        reporterId: user.id,
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

  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Gioi han', 'Ban chi co the chon toi da 3 hinh anh');
      return;
    }
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });
      if (result.assets && result.assets[0]?.uri) {
        setImages(prev => [...prev, result.assets![0].uri!]);
      }
    } catch {
      Alert.alert('Loi', 'Khong the chon hinh anh');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ScreenWrapper>
      <LoadingOverlay visible={loading} message="Dang tao bao cao..." />

      <Text style={styles.title}>Bao cao su co</Text>

      {/* Category picker */}
      <Text style={styles.label}>Danh muc</Text>
      <View style={styles.optionRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.optionChip,
              selectedCategory === cat.value && styles.optionChipActive,
            ]}
            onPress={() =>
              setValue('category', cat.value, {shouldValidate: true})
            }
            activeOpacity={0.7}>
            <Text
              style={[
                styles.optionChipText,
                selectedCategory === cat.value && styles.optionChipTextActive,
              ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && (
        <Text style={styles.errorText}>{errors.category.message}</Text>
      )}

      {/* Location picker */}
      <Text style={styles.label}>Vi tri</Text>
      <View style={styles.optionRow}>
        {LOCATIONS.map(loc => (
          <TouchableOpacity
            key={loc.value}
            style={[
              styles.optionChip,
              selectedLocation === loc.value && styles.optionChipActive,
            ]}
            onPress={() =>
              setValue('location', loc.value, {shouldValidate: true})
            }
            activeOpacity={0.7}>
            <Text
              style={[
                styles.optionChipText,
                selectedLocation === loc.value && styles.optionChipTextActive,
              ]}>
              {loc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.location && (
        <Text style={styles.errorText}>{errors.location.message}</Text>
      )}

      {/* Urgency toggle */}
      <Text style={styles.label}>Muc do</Text>
      <View style={styles.urgencyRow}>
        {URGENCY_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.urgencyBtn,
              selectedUrgency === opt.value && (
                opt.value === 'urgent'
                  ? styles.urgencyBtnUrgent
                  : styles.urgencyBtnNormal
              ),
            ]}
            onPress={() =>
              setValue('urgency', opt.value, {shouldValidate: true})
            }
            activeOpacity={0.7}>
            <Text
              style={[
                styles.urgencyBtnText,
                selectedUrgency === opt.value &&
                  styles.urgencyBtnTextActive,
              ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({field: {onChange, value}}) => (
          <Input
            label="Tieu de"
            placeholder="Mo ta ngan gon su co..."
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({field: {onChange, value}}) => (
          <Input
            label="Mo ta chi tiet"
            placeholder="Mo ta chi tiet hon ve su co..."
            value={value ?? ''}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            error={errors.description?.message}
          />
        )}
      />

      {/* Image picker */}
      <Text style={styles.label}>Hinh anh (toi da 3)</Text>
      <View style={styles.imageRow}>
        {images.map((uri, index) => (
          <View key={uri} style={styles.imageWrapper}>
            <Image source={{uri}} style={styles.imageThumbnail} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => handleRemoveImage(index)}>
              <Text style={styles.removeImageText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 3 && (
          <TouchableOpacity
            style={styles.addImageBtn}
            onPress={handlePickImage}
            activeOpacity={0.7}>
            <Text style={styles.addImageText}>+</Text>
            <Text style={styles.addImageLabel}>Them anh</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.submitContainer}>
        <Button
          title="Gui bao cao"
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
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  optionChipActive: {
    backgroundColor: '#2563EB',
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  urgencyBtnNormal: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  urgencyBtnUrgent: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  urgencyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  urgencyBtnTextActive: {
    color: '#1E293B',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 24,
    color: '#94A3B8',
    lineHeight: 26,
  },
  addImageLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  submitContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default IssueCreateScreen;

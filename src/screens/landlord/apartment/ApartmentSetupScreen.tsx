import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  ScreenWrapper,
  Input,
  Button,
  LoadingOverlay,
} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  createApartmentRequest,
  fetchApartmentRequest,
} from '../../../store/slices/apartmentSlice';
import {
  apartmentSetupSchema,
  type ApartmentSetupFormData,
} from '../../../schemas/apartment';
import type {LandlordStackParamList} from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type SetupRouteProp = RouteProp<LandlordStackParamList, 'ApartmentSetup'>;

const ApartmentSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SetupRouteProp>();
  const dispatch = useAppDispatch();
  const {apartment, loading} = useApartment();

  const editId = route.params?.id;
  const isEditMode = !!editId;

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<ApartmentSetupFormData>({
    resolver: zodResolver(apartmentSetupSchema),
    defaultValues: {
      name: '',
      address: '',
      num_rooms: 1,
    },
  });

  useEffect(() => {
    if (isEditMode && editId) {
      dispatch(fetchApartmentRequest({id: editId}));
    }
  }, [editId, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && apartment) {
      reset({
        name: apartment.name,
        address: apartment.address,
        num_rooms: apartment.num_rooms,
      });
    }
  }, [isEditMode, apartment, reset]);

  const prevLoadingRef = React.useRef(loading);
  useEffect(() => {
    if (prevLoadingRef.current && !loading && apartment && !isEditMode) {
      navigation.navigate('InviteCode', {apartmentId: apartment.id});
    }
    prevLoadingRef.current = loading;
  }, [loading, apartment, isEditMode, navigation]);

  const onSubmit = (data: ApartmentSetupFormData) => {
    dispatch(createApartmentRequest(data));
  };

  return (
    <ScreenWrapper scroll>
      <LoadingOverlay visible={loading} />

      <Text style={styles.title}>
        {isEditMode ? 'Chinh sua can ho' : 'Thiet lap can ho'}
      </Text>
      <Text style={styles.subtitle}>
        {isEditMode
          ? 'Cap nhat thong tin can ho cua ban'
          : 'Nhap thong tin can ho de bat dau quan ly'}
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({field: {onChange, value}}) => (
            <Input
              label="Ten can ho"
              placeholder="VD: Chung cu Sunrise"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({field: {onChange, value}}) => (
            <Input
              label="Dia chi"
              placeholder="VD: 123 Nguyen Hue, Q.1, TP.HCM"
              value={value}
              onChangeText={onChange}
              error={errors.address?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="num_rooms"
          render={({field: {onChange, value}}) => (
            <Input
              label="So phong"
              placeholder="VD: 10"
              value={value ? String(value) : ''}
              onChangeText={text => {
                const num = parseInt(text, 10);
                onChange(isNaN(num) ? 0 : num);
              }}
              keyboardType="number-pad"
              error={errors.num_rooms?.message}
            />
          )}
        />

        <Button
          title={isEditMode ? 'Cap nhat' : 'Tao can ho'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 28,
    lineHeight: 22,
  },
  form: {
    gap: 4,
  },
  submitBtn: {
    marginTop: 12,
  },
});

export default ApartmentSetupScreen;

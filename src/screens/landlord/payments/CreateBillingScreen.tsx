import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  ScreenWrapper,
  Card,
  Button,
  LoadingOverlay,
} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppDispatch, useAppSelector} from '../../../store';
import {createBillingRequest} from '../../../store/slices/paymentSlice';
import {
  createBillingSchema,
  type CreateBillingFormData,
} from '../../../schemas/payment';
import {formatCurrency, formatDate} from '../../../utils/formatters';
import type {LandlordStackParamList} from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const MONTHS = Array.from({length: 12}, (_, i) => i + 1);

const CreateBillingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {apartment, members} = useApartment();
  const {loading} = useAppSelector(state => state.payment);

  const currentDate = new Date();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
  );

  const [adjustedAmounts, setAdjustedAmounts] = useState<
    Record<string, number>
  >({});

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<CreateBillingFormData>({
    resolver: zodResolver(createBillingSchema),
    defaultValues: {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      due_date: dueDate.toISOString(),
    },
  });

  const selectedMonth = watch('month');
  const selectedYear = watch('year');

  const tenantList = useMemo(() => {
    return members.map(m => ({
      userId: m.user_id,
      name: m.profile?.full_name ?? 'Nguoi thue',
      room: m.room_name ?? 'Chua gan',
      defaultAmount: m.rent_amount,
      amount: adjustedAmounts[m.user_id] ?? m.rent_amount,
    }));
  }, [members, adjustedAmounts]);

  const totalAmount = useMemo(() => {
    return tenantList.reduce((sum, t) => sum + t.amount, 0);
  }, [tenantList]);

  const handleAmountChange = useCallback(
    (userId: string, text: string) => {
      const num = parseInt(text.replace(/\D/g, ''), 10);
      setAdjustedAmounts(prev => ({
        ...prev,
        [userId]: isNaN(num) ? 0 : num,
      }));
    },
    [],
  );

  const onDateChange = useCallback(
    (_: any, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    },
    [],
  );

  const onSubmit = useCallback(
    (data: CreateBillingFormData) => {
      Alert.alert(
        'Xac nhan tao ky thu tien',
        `Thang ${data.month}/${data.year}\nHan: ${formatDate(dueDate.toISOString())}\nTong: ${formatCurrency(totalAmount)}\nSo nguoi thue: ${tenantList.length}`,
        [
          {text: 'Huy', style: 'cancel'},
          {
            text: 'Tao',
            onPress: () => {
              if (apartment?.id) {
                dispatch(
                  createBillingRequest({
                    apartmentId: apartment.id,
                    month: data.month,
                    year: data.year,
                    dueDate: dueDate.toISOString(),
                  }),
                );
                navigation.goBack();
              }
            },
          },
        ],
      );
    },
    [apartment?.id, totalAmount, tenantList.length, dueDate, dispatch, navigation],
  );

  const renderTenantItem = ({
    item,
  }: {
    item: (typeof tenantList)[0];
  }) => (
    <View style={styles.tenantItem}>
      <View style={styles.tenantInfo}>
        <Text style={styles.tenantName}>{item.name}</Text>
        <Text style={styles.tenantRoom}>{item.room}</Text>
      </View>
      <TextInput
        style={styles.amountInput}
        value={String(item.amount)}
        onChangeText={text => handleAmountChange(item.userId, text)}
        keyboardType="number-pad"
        selectTextOnFocus
      />
    </View>
  );

  return (
    <ScreenWrapper scroll>
      <LoadingOverlay visible={loading} />

      <Text style={styles.title}>Tao ky thu tien</Text>

      {/* Month Picker */}
      <Text style={styles.label}>Thang</Text>
      <Controller
        control={control}
        name="month"
        render={({field: {onChange, value}}) => (
          <View style={styles.monthRow}>
            {MONTHS.map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.monthChip,
                  value === m && styles.monthChipActive,
                ]}
                onPress={() => onChange(m)}>
                <Text
                  style={[
                    styles.monthChipText,
                    value === m && styles.monthChipTextActive,
                  ]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.month && (
        <Text style={styles.errorText}>{errors.month.message}</Text>
      )}

      {/* Year Picker */}
      <Controller
        control={control}
        name="year"
        render={({field: {onChange, value}}) => (
          <View style={styles.yearRow}>
            {[
              currentDate.getFullYear() - 1,
              currentDate.getFullYear(),
              currentDate.getFullYear() + 1,
            ].map(y => (
              <TouchableOpacity
                key={y}
                style={[
                  styles.yearChip,
                  value === y && styles.yearChipActive,
                ]}
                onPress={() => onChange(y)}>
                <Text
                  style={[
                    styles.yearChipText,
                    value === y && styles.yearChipTextActive,
                  ]}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.year && (
        <Text style={styles.errorText}>{errors.year.message}</Text>
      )}

      {/* Due Date */}
      <Text style={styles.label}>Han thanh toan</Text>
      <TouchableOpacity
        style={styles.datePickerBtn}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>{formatDate(dueDate.toISOString())}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Tenant Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>
          Danh sach nguoi thue ({tenantList.length})
        </Text>
        <Card>
          <FlatList
            data={tenantList}
            keyExtractor={item => item.userId}
            renderItem={renderTenantItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      </View>

      {/* Total */}
      <Card style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tong cong</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </Card>

      {/* Submit */}
      <Button
        title="Tao ky thu tien"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.submitBtn}
      />

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 4,
  },
  monthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  monthChip: {
    width: 48,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  monthChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  monthChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  monthChipTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  yearRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  yearChip: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  yearChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  yearChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  yearChipTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 8,
  },
  datePickerBtn: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 15,
    color: '#1E293B',
  },
  previewSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  tenantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  tenantRoom: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountInput: {
    width: 120,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  totalCard: {
    marginBottom: 20,
    backgroundColor: '#EFF6FF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  submitBtn: {
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default CreateBillingScreen;

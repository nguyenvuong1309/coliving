import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import {PressableOpacity, ScreenWrapper, Card, Button, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks';
import {createBillingSchema, type CreateBillingFormData} from '../../../schemas';
import {formatCurrency, formatDate, parseMoneyInput} from '../../../utils';
import type {LandlordStackParamList} from '../../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createBillingRequest } from '../../../store/slices/paymentSlice';
import { fetchUtilityConfigsRequest } from '../../../store/slices/utilitySlice';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface TenantBillingItem {
  userId: string;
  name: string;
  room: string;
  rentAmount: number;
  utilityAmount: number;
  amount: number;
}

interface TenantBillingRowProps {
  item: TenantBillingItem;
  onRentChange: (userId: string, text: string) => void;
  onUtilityChange: (userId: string, text: string) => void;
}

const TenantBillingRow = React.memo(function TenantBillingRow({
  item,
  onRentChange,
  onUtilityChange,
}: TenantBillingRowProps) {
  return (
    <View style={styles.tenantItem}>
      <View style={styles.tenantInfo}>
        <Text style={styles.tenantName}>{item.name}</Text>
        <Text style={styles.tenantRoom}>
          {item.room} - Tong {formatCurrency(item.amount)}
        </Text>
      </View>
      <View style={styles.amountColumn}>
        <Text style={styles.amountLabel}>Tien phong</Text>
        <TextInput
          testID={`billing-rent-${item.userId}`}
          style={styles.amountInput}
          value={String(item.rentAmount)}
          onChangeText={text => onRentChange(item.userId, text)}
          keyboardType="number-pad"
          selectTextOnFocus
        />
        <Text style={styles.amountLabel}>Dich vu</Text>
        <TextInput
          testID={`billing-utility-${item.userId}`}
          style={styles.amountInput}
          value={String(item.utilityAmount)}
          onChangeText={text => onUtilityChange(item.userId, text)}
          keyboardType="number-pad"
          selectTextOnFocus
        />
      </View>
    </View>
  );
});

const CreateBillingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { apartment, members } = useApartment();
  const { loading } = useAppSelector(state => state.payment);
  const { configs: utilityConfigs, loading: utilityLoading } = useAppSelector(
    state => state.utility,
  );

  const currentDate = useMemo(() => new Date(), []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
  );

  const [adjustedAmounts, setAdjustedAmounts] = useState<
    Record<string, number>
  >({});
  const [utilityAmounts, setUtilityAmounts] = useState<Record<string, number>>(
    {},
  );

  React.useEffect(() => {
    if (apartment?.id) {
      dispatch(fetchUtilityConfigsRequest({ apartmentId: apartment.id }));
    }
  }, [apartment?.id, dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBillingFormData>({
    resolver: zodResolver(createBillingSchema),
    defaultValues: {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      due_date: dueDate.toISOString(),
    },
  });

  const defaultUtilityTotal = useMemo(() => {
    return utilityConfigs
      .filter(config => config.is_active && config.pricing_type === 'fixed')
      .reduce((sum, config) => sum + (config.fixed_amount ?? 0), 0);
  }, [utilityConfigs]);

  const tenantList = useMemo(() => {
    return members.reduce<TenantBillingItem[]>((list, m) => {
      if (m.profile?.role !== 'tenant') {
        return list;
      }

      const rentAmount = adjustedAmounts[m.user_id] ?? m.rent_amount;
      const utilityAmount =
        utilityAmounts[m.user_id] ?? defaultUtilityTotal;

      list.push({
        userId: m.user_id,
        name: m.profile?.full_name ?? 'Nguoi thue',
        room: m.room_name ?? 'Chua gan',
        rentAmount,
        utilityAmount,
        amount: rentAmount + utilityAmount,
      });
      return list;
    }, []);
  }, [members, adjustedAmounts, utilityAmounts, defaultUtilityTotal]);

  const totalAmount = useMemo(() => {
    return tenantList.reduce((sum, t) => sum + t.amount, 0);
  }, [tenantList]);

  const handleAmountChange = useCallback((userId: string, text: string) => {
    setAdjustedAmounts(prev => ({
      ...prev,
      [userId]: parseMoneyInput(text),
    }));
  }, []);

  const handleUtilityAmountChange = useCallback(
    (userId: string, text: string) => {
      setUtilityAmounts(prev => ({
        ...prev,
        [userId]: parseMoneyInput(text),
      }));
    },
    [],
  );

  const onDateChange = useCallback((_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }, []);

  const onSubmit = useCallback(
    (data: CreateBillingFormData) => {
      if (tenantList.length === 0) {
        Alert.alert('Chua co nguoi thue', 'Hay moi nguoi thue vao can ho truoc.');
        return;
      }

      const tenantsWithoutRent = tenantList.filter(t => t.rentAmount <= 0);
      if (tenantsWithoutRent.length > 0) {
        Alert.alert(
          'Thieu tien thue',
          'Vui long cap nhat tien thue cho tat ca nguoi thue truoc khi tao ky thu.',
        );
        return;
      }

      Alert.alert(
        'Xac nhan tao ky thu tien',
        `Thang ${data.month}/${data.year}\nHan: ${formatDate(
          dueDate.toISOString(),
        )}\nTong: ${formatCurrency(totalAmount)}\nSo nguoi thue: ${
          tenantList.length
        }`,
        [
          { text: 'Huy', style: 'cancel' },
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
                    payments: tenantList.map(tenant => ({
                      tenantId: tenant.userId,
                      amount: tenant.amount,
                      rentAmount: tenant.rentAmount,
                      utilityTotal: tenant.utilityAmount,
                      extraCharges: [],
                    })),
                  }),
                );
                navigation.goBack();
              }
            },
          },
        ],
      );
    },
    [
      apartment?.id,
      totalAmount,
      tenantList,
      dueDate,
      dispatch,
      navigation,
    ],
  );

  const renderTenantItem = useCallback(
    ({ item }: { item: TenantBillingItem }) => (
      <TenantBillingRow
        item={item}
        onRentChange={handleAmountChange}
        onUtilityChange={handleUtilityAmountChange}
      />
    ),
    [handleAmountChange, handleUtilityAmountChange],
  );
  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <ScreenWrapper testID="create-billing-screen" scroll>
      <LoadingOverlay visible={loading || utilityLoading} />

      <Text style={styles.title}>Tao ky thu tien</Text>

      <Text style={styles.label}>Thang</Text>
      <Controller
        control={control}
        name="month"
        render={({ field: { onChange, value } }) => (
          <View style={styles.monthRow}>
            {MONTHS.map(m => (
              <PressableOpacity
                testID={`billing-month-${m}`}
                key={m}
                style={[
                  styles.monthChip,
                  value === m && styles.monthChipActive,
                ]}
                onPress={() => onChange(m)}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    value === m && styles.monthChipTextActive,
                  ]}
                >
                  {m}
                </Text>
              </PressableOpacity>
            ))}
          </View>
        )}
      />
      {errors.month && (
        <Text style={styles.errorText}>{errors.month.message}</Text>
      )}

      <Controller
        control={control}
        name="year"
        render={({ field: { onChange, value } }) => (
          <View style={styles.yearRow}>
            {[
              currentDate.getFullYear() - 1,
              currentDate.getFullYear(),
              currentDate.getFullYear() + 1,
            ].map(y => (
              <PressableOpacity
                testID={`billing-year-${y}`}
                key={y}
                style={[styles.yearChip, value === y && styles.yearChipActive]}
                onPress={() => onChange(y)}
              >
                <Text
                  style={[
                    styles.yearChipText,
                    value === y && styles.yearChipTextActive,
                  ]}
                >
                  {y}
                </Text>
              </PressableOpacity>
            ))}
          </View>
        )}
      />
      {errors.year && (
        <Text style={styles.errorText}>{errors.year.message}</Text>
      )}

      <Text style={styles.label}>Han thanh toan</Text>
      <PressableOpacity
        testID="billing-due-date-btn"
        style={styles.datePickerBtn}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>
          {formatDate(dueDate.toISOString())}
        </Text>
      </PressableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={currentDate}
        />
      )}

      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>
          Danh sach nguoi thue ({tenantList.length})
        </Text>
        {defaultUtilityTotal > 0 && (
          <Text style={styles.utilityHint}>
            Phi dich vu mac dinh: {formatCurrency(defaultUtilityTotal)} / nguoi
          </Text>
        )}
        <Card>
          <FlatList
            data={tenantList}
            keyExtractor={item => item.userId}
            renderItem={renderTenantItem}
            scrollEnabled={false}
            ItemSeparatorComponent={renderSeparator}
          />
        </Card>
      </View>

      <Card style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tong cong</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </Card>

      <Button
        testID="billing-submit-btn"
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
  utilityHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -6,
    marginBottom: 10,
  },
  tenantItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  tenantInfo: {
    flex: 1,
    paddingTop: 4,
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
  amountColumn: {
    width: 120,
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  amountInput: {
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

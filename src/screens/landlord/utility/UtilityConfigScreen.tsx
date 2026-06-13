import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import LoadingOverlay from '../../../components/LoadingOverlay';
import {useApartment} from '../../../hooks/useApartment';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  fetchUtilityConfigsRequest,
  upsertUtilityConfigRequest,
} from '../../../store/slices/utilitySlice';
import {formatCurrency} from '../../../utils/formatters';
import {
  DEFAULT_ELECTRICITY_TIERS_VN,
  calculateTieredAmount,
  parseMoneyInput,
} from '../../../utils/utilityCalculator';
import type {Json} from '../../../types/database';

type UtilityType = 'electricity' | 'water' | 'internet' | 'parking';

const DEFAULT_UTILITIES: Array<{
  type: UtilityType;
  label: string;
  unitName?: string;
}> = [
  {type: 'electricity', label: 'Tien dien', unitName: 'kWh'},
  {type: 'water', label: 'Tien nuoc', unitName: 'm3'},
  {type: 'internet', label: 'Internet'},
  {type: 'parking', label: 'Gui xe'},
];

const SWITCH_TRACK_COLOR = {false: '#CBD5E1', true: '#93C5FD'};

interface UtilityConfigRowProps {
  item: (typeof DEFAULT_UTILITIES)[number];
  amountText: string;
  active: boolean;
  exists: boolean;
  loading: boolean;
  onAmountChange: (type: UtilityType, text: string) => void;
  onActiveChange: (type: UtilityType, value: boolean) => void;
  onSave: (type: UtilityType) => void;
}

const UtilityConfigRow = React.memo(function UtilityConfigRow({
  item,
  amountText,
  active,
  exists,
  loading,
  onAmountChange,
  onActiveChange,
  onSave,
}: UtilityConfigRowProps) {
  const amount = parseMoneyInput(amountText);
  const description =
    item.type === 'electricity'
      ? `Mau bac thang 100 kWh: ${formatCurrency(calculateTieredAmount(100))}`
      : 'Cong co dinh vao moi ky thu tien';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.name}>{item.label}</Text>
          <Text style={styles.meta}>{description}</Text>
        </View>
        <Switch
          testID={`utility-active-${item.type}`}
          value={active}
          onValueChange={value => onActiveChange(item.type, value)}
          trackColor={SWITCH_TRACK_COLOR}
          thumbColor={active ? '#2563EB' : '#F1F5F9'}
        />
      </View>

      <Text style={styles.label}>So tien moi nguoi / thang</Text>
      <TextInput
        testID={`utility-amount-${item.type}`}
        value={amountText}
        onChangeText={text => onAmountChange(item.type, text)}
        keyboardType="number-pad"
        style={styles.input}
        selectTextOnFocus
      />
      <Text style={styles.preview}>{formatCurrency(amount)}</Text>

      <Button
        testID={`utility-save-${item.type}`}
        title={exists ? 'Cap nhat' : 'Luu cau hinh'}
        onPress={() => onSave(item.type)}
        loading={loading}
        style={styles.button}
      />
    </Card>
  );
});

const UtilityConfigScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {apartment} = useApartment();
  const {configs, loading} = useAppSelector(state => state.utility);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (apartment?.id) {
      dispatch(fetchUtilityConfigsRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    const configMap = new Map(
      configs.map(config => [config.utility_type, config]),
    );
    const nextAmounts: Record<string, string> = {};
    const nextActiveMap: Record<string, boolean> = {};
    for (const item of DEFAULT_UTILITIES) {
      const config = configMap.get(item.type);
      nextAmounts[item.type] = String(config?.fixed_amount ?? 0);
      nextActiveMap[item.type] = config?.is_active ?? false;
    }
    setAmounts(nextAmounts);
    setActiveMap(nextActiveMap);
  }, [configs]);

  const configMap = useMemo(() => {
    return Object.fromEntries(configs.map(config => [config.utility_type, config]));
  }, [configs]);

  const handleAmountChange = useCallback((type: UtilityType, text: string) => {
    setAmounts(prev => ({...prev, [type]: text.replace(/\D/g, '')}));
  }, []);

  const handleActiveChange = useCallback(
    (type: UtilityType, value: boolean) => {
      setActiveMap(prev => ({...prev, [type]: value}));
    },
    [],
  );

  const handleSave = useCallback(
    (type: UtilityType) => {
      if (!apartment?.id) {
        return;
      }
      const utility = DEFAULT_UTILITIES.find(item => item.type === type)!;
      dispatch(
        upsertUtilityConfigRequest({
          apartment_id: apartment.id,
          utility_type: type,
          name: utility.label,
          pricing_type: 'fixed',
          fixed_amount: parseMoneyInput(amounts[type] ?? '0'),
          unit_name: utility.unitName ?? null,
          is_active: activeMap[type] ?? false,
          tiers:
            type === 'electricity'
              ? (DEFAULT_ELECTRICITY_TIERS_VN as unknown as Json)
              : [],
        }),
      );
    },
    [activeMap, amounts, apartment?.id, dispatch],
  );

  const renderItem = useCallback(
    ({item}: {item: (typeof DEFAULT_UTILITIES)[number]}) => (
      <UtilityConfigRow
        item={item}
        amountText={amounts[item.type] ?? '0'}
        active={activeMap[item.type] ?? false}
        exists={!!configMap[item.type]}
        loading={loading}
        onAmountChange={handleAmountChange}
        onActiveChange={handleActiveChange}
        onSave={handleSave}
      />
    ),
    [
      activeMap,
      amounts,
      configMap,
      handleActiveChange,
      handleAmountChange,
      handleSave,
      loading,
    ],
  );
  const renderSeparator = useCallback(() => <View style={styles.gap} />, []);

  return (
    <ScreenWrapper testID="utility-config-screen" scroll={false}>
      <LoadingOverlay visible={loading} />
      <FlatList
        data={DEFAULT_UTILITIES}
        keyExtractor={item => item.type}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={renderSeparator}
        renderItem={renderItem}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  gap: {
    height: 12,
  },
  card: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  preview: {
    fontSize: 13,
    color: '#64748B',
  },
  button: {
    marginTop: 4,
  },
});

export default UtilityConfigScreen;

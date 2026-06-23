import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {ScreenWrapper, Button, Input, Card, Avatar, LoadingOverlay} from '../../../components';
import {useAuth, useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {
  createSettlementRequest,
  fetchSettlementsRequest,
  updateSettlementStatusRequest,
} from '../../../store/slices/expenseSlice';
import {formatCurrency} from '../../../utils';

// Hai che do:
//  - Tao tat toan moi: params { toUser, amount } (tu BalanceScreen)
//  - Xac nhan tat toan dang cho: params { settlementId } (tu notification)
type SettleRoute = RouteProp<
  {
    SettleUp: {
      toUser?: string;
      amount?: number;
      settlementId?: string;
    };
  },
  'SettleUp'
>;

const SettleUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SettleRoute>();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment, members} = useApartment();
  const {settlements, loading} = useAppSelector(
    (state: any) => state.expense,
  ) as {
    settlements: import('../../../types/expense').Settlement[];
    loading: boolean;
  };

  const {toUser, amount: initialAmount, settlementId} = route.params ?? {};
  const isConfirmMode = !!settlementId;

  const [amountText, setAmountText] = useState(
    initialAmount ? String(initialAmount) : '',
  );
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isConfirmMode && apartment?.id && settlements.length === 0) {
      dispatch(fetchSettlementsRequest({apartmentId: apartment.id}));
    }
  }, [isConfirmMode, apartment?.id, settlements.length, dispatch]);

  const settlement = useMemo(
    () => settlements.find(s => s.id === settlementId),
    [settlements, settlementId],
  );

  const amount = useMemo(() => {
    const n = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? 0 : n;
  }, [amountText]);

  const memberName = (uid?: string) =>
    members.find(m => m.user_id === uid)?.profile?.full_name ?? 'Khong ro';
  const memberAvatar = (uid?: string) =>
    members.find(m => m.user_id === uid)?.profile?.avatar_url ?? undefined;

  const prevLoading = React.useRef(loading);
  useEffect(() => {
    if (prevLoading.current && !loading) {
      navigation.goBack();
    }
    prevLoading.current = loading;
  }, [loading, navigation]);

  const onCreate = () => {
    if (!user?.id || !apartment?.id || !toUser || amount <= 0) {
      return;
    }
    dispatch(
      createSettlementRequest({
        apartment_id: apartment.id,
        from_user: user.id,
        to_user: toUser,
        amount,
        note: note.trim() || null,
      }),
    );
  };

  const onConfirm = (status: 'confirmed' | 'rejected') => {
    if (!settlement) {
      return;
    }
    dispatch(
      updateSettlementStatusRequest({id: settlement.id, status}),
    );
  };

  return (
    <ScreenWrapper testID="tenant-settle-up-screen">
      <LoadingOverlay visible={loading} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {isConfirmMode ? (
          <>
            <Text style={styles.title}>Xac nhan tat toan</Text>
            {settlement ? (
              <Card style={styles.card}>
                <View style={styles.row}>
                  <Avatar
                    uri={memberAvatar(settlement.from_user)}
                    name={memberName(settlement.from_user)}
                    size={40}
                  />
                  <Text style={styles.flowText}>
                    {memberName(settlement.from_user)} da tra ban
                  </Text>
                </View>
                <Text style={styles.bigAmount}>
                  {formatCurrency(settlement.amount)}
                </Text>
                {settlement.note ? (
                  <Text style={styles.note}>{settlement.note}</Text>
                ) : null}
                {settlement.status === 'pending' ? (
                  <View style={styles.actionRow}>
                    <View style={styles.actionBtn}>
                      <Button
                        testID="settle-reject-btn"
                        title="Tu choi"
                        variant="secondary"
                        onPress={() => onConfirm('rejected')}
                      />
                    </View>
                    <View style={styles.actionBtn}>
                      <Button
                        testID="settle-confirm-btn"
                        title="Xac nhan"
                        onPress={() => onConfirm('confirmed')}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.statusText}>
                    Trang thai:{' '}
                    {settlement.status === 'confirmed'
                      ? 'Da xac nhan'
                      : 'Da tu choi'}
                  </Text>
                )}
              </Card>
            ) : (
              <Text style={styles.note}>Khong tim thay yeu cau tat toan.</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.title}>Tat toan</Text>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Avatar
                  uri={memberAvatar(toUser)}
                  name={memberName(toUser)}
                  size={40}
                />
                <Text style={styles.flowText}>
                  Ban tra cho {memberName(toUser)}
                </Text>
              </View>
            </Card>

            <Input
              testID="settle-amount-input"
              label="So tien (VND)"
              placeholder="0"
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="numeric"
            />
            <Input
              testID="settle-note-input"
              label="Ghi chu"
              placeholder="VD: chuyen khoan Momo..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />
            <View style={styles.submitContainer}>
              <Button
                testID="settle-submit-btn"
                title="Gui yeu cau tat toan"
                onPress={onCreate}
                loading={loading}
              />
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  card: {marginBottom: 16},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  flowText: {fontSize: 15, color: '#1E293B', fontWeight: '500', flex: 1},
  bigAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 12,
    textAlign: 'center',
  },
  note: {fontSize: 14, color: '#64748B', marginTop: 10},
  actionRow: {flexDirection: 'row', gap: 12, marginTop: 16},
  actionBtn: {flex: 1},
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },
  submitContainer: {marginTop: 16},
});

export default SettleUpScreen;

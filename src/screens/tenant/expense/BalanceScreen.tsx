import React, {useCallback, useEffect, useMemo} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {PressableOpacity, ScreenWrapper, Card, Avatar, EmptyState, LoadingOverlay} from '../../../components';
import {useAuth, useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchBalancesRequest} from '../../../store/slices/expenseSlice';
import {simplifyDebts, formatCurrency} from '../../../utils';

const BalanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment, members} = useApartment();
  const {balances, loading} = useAppSelector(
    (state: any) => state.expense,
  ) as {
    balances: import('../../../types/expense').MemberBalance[];
    loading: boolean;
  };

  const loadData = useCallback(() => {
    if (apartment?.id) {
      dispatch(fetchBalancesRequest({apartmentId: apartment.id}));
    }
  }, [apartment?.id, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const transfers = useMemo(() => simplifyDebts(balances), [balances]);

  const memberName = (uid: string) =>
    members.find(m => m.user_id === uid)?.profile?.full_name ?? 'Khong ro';
  const memberAvatar = (uid: string) =>
    members.find(m => m.user_id === uid)?.profile?.avatar_url ?? undefined;

  const myTransfersToPay = transfers.filter(t => t.from === user?.id);

  return (
    <ScreenWrapper testID="tenant-balance-screen">
      <LoadingOverlay visible={loading} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}>
        <Text style={styles.title}>Ai no ai bao nhieu</Text>

        {transfers.length === 0 ? (
          <EmptyState
            title="Da can bang"
            description="Khong ai no ai trong can ho luc nay"
          />
        ) : (
          transfers.map((t, idx) => {
            const involvesMe = t.from === user?.id || t.to === user?.id;
            return (
              <Card
                key={`${t.from}-${t.to}-${idx}`}
                style={involvesMe ? {...styles.card, ...styles.cardMine} : styles.card}>
                <View style={styles.row}>
                  <Avatar
                    uri={memberAvatar(t.from)}
                    name={memberName(t.from)}
                    size={36}
                  />
                  <View style={styles.middle}>
                    <Text style={styles.flowText}>
                      <Text style={styles.bold}>{memberName(t.from)}</Text> no{' '}
                      <Text style={styles.bold}>{memberName(t.to)}</Text>
                    </Text>
                    <Text style={styles.amount}>
                      {formatCurrency(t.amount)}
                    </Text>
                  </View>
                  <Avatar
                    uri={memberAvatar(t.to)}
                    name={memberName(t.to)}
                    size={36}
                  />
                </View>
                {t.from === user?.id && (
                  <PressableOpacity
                    testID={`settle-btn-${idx}`}
                    style={styles.settleBtn}
                    onPress={() =>
                      navigation.navigate('SettleUp', {
                        toUser: t.to,
                        amount: t.amount,
                      })
                    }>
                    <Text style={styles.settleBtnText}>Tat toan</Text>
                  </PressableOpacity>
                )}
              </Card>
            );
          })
        )}

        {myTransfersToPay.length === 0 && transfers.length > 0 && (
          <Text style={styles.hint}>Ban khong no ai khoan nao.</Text>
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
  card: {marginBottom: 10},
  cardMine: {borderWidth: 1.5, borderColor: '#2563EB'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  middle: {flex: 1, alignItems: 'center'},
  flowText: {fontSize: 13, color: '#64748B'},
  bold: {fontWeight: '700', color: '#1E293B'},
  amount: {fontSize: 16, fontWeight: '800', color: '#DC2626', marginTop: 2},
  settleBtn: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  settleBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 14},
  hint: {fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 12},
});

export default BalanceScreen;

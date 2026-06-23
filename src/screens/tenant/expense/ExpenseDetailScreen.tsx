import React, {useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {ScreenWrapper, Card, Avatar, LoadingOverlay} from '../../../components';
import {useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {fetchExpenseDetailRequest} from '../../../store/slices/expenseSlice';
import {formatCurrency, formatDateTime} from '../../../utils';
import type {ExpenseCategory, ExpenseShare} from '../../../types';

type DetailRoute = RouteProp<{ExpenseDetail: {id: string}}, 'ExpenseDetail'>;

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  food: 'An uong',
  household: 'Do dung',
  utility: 'Tien ich',
  party: 'Tiec',
  transport: 'Di lai',
  other: 'Khac',
};

const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const dispatch = useAppDispatch();
  const {members} = useApartment();
  const {currentExpense, loading} = useAppSelector(
    (state: any) => state.expense,
  ) as {currentExpense: import('../../../types/expense').Expense | null; loading: boolean};

  useEffect(() => {
    if (route.params?.id) {
      dispatch(fetchExpenseDetailRequest({id: route.params.id}));
    }
  }, [route.params?.id, dispatch]);

  const memberName = (uid: string) =>
    members.find(m => m.user_id === uid)?.profile?.full_name ?? 'Khong ro';
  const memberAvatar = (uid: string) =>
    members.find(m => m.user_id === uid)?.profile?.avatar_url ?? undefined;

  const exp = currentExpense;
  const shares: ExpenseShare[] = (exp as any)?.expense_shares ?? [];

  return (
    <ScreenWrapper testID="tenant-expense-detail-screen">
      <LoadingOverlay visible={loading} />
      {exp && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card style={styles.headCard}>
            <Text style={styles.title}>{exp.title}</Text>
            <Text style={styles.amount}>{formatCurrency(exp.amount)}</Text>
            <Text style={styles.meta}>
              {CATEGORY_LABEL[exp.category] ?? exp.category}
            </Text>
            <Text style={styles.meta}>{formatDateTime(exp.created_at)}</Text>
            {exp.note ? (
              <Text style={styles.note}>{exp.note}</Text>
            ) : null}
          </Card>

          <Card style={styles.payerCard}>
            <Text style={styles.sectionTitle}>Nguoi tra truoc</Text>
            <View style={styles.row}>
              <Avatar
                uri={memberAvatar(exp.payer_id)}
                name={memberName(exp.payer_id)}
                size={40}
              />
              <Text style={styles.payerName}>
                {memberName(exp.payer_id)}
              </Text>
              <Text style={styles.payerAmount}>
                {formatCurrency(exp.amount)}
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Ai no bao nhieu</Text>
          {shares.map(s => (
            <Card key={s.id} style={styles.shareCard}>
              <View style={styles.row}>
                <Avatar
                  uri={memberAvatar(s.member_id)}
                  name={memberName(s.member_id)}
                  size={36}
                />
                <Text style={styles.shareName}>
                  {memberName(s.member_id)}
                </Text>
                <Text style={styles.shareAmount}>
                  {formatCurrency(s.share_amount)}
                </Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headCard: {marginBottom: 12},
  title: {fontSize: 20, fontWeight: '700', color: '#1E293B'},
  amount: {fontSize: 24, fontWeight: '800', color: '#2563EB', marginTop: 6},
  meta: {fontSize: 13, color: '#64748B', marginTop: 4},
  note: {fontSize: 14, color: '#334155', marginTop: 10},
  payerCard: {marginBottom: 16},
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  payerName: {flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500'},
  payerAmount: {fontSize: 15, fontWeight: '700', color: '#16A34A'},
  shareCard: {marginBottom: 8},
  shareName: {flex: 1, fontSize: 14, color: '#1E293B'},
  shareAmount: {fontSize: 14, fontWeight: '700', color: '#DC2626'},
});

export default ExpenseDetailScreen;

import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, ScrollView, StyleSheet, Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {TenantStackParamList, ExpenseCategory, SplitType} from '../../../types';
import {PressableOpacity, ScreenWrapper, Button, Input, Card, Avatar, LoadingOverlay} from '../../../components';
import {useAuth, useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {createExpenseRequest} from '../../../store/slices/expenseSlice';
import {hasActiveEntitlement} from '../../../services';
import {splitEqual, splitExact, splitPercentage, validateExactSplit} from '../../../utils';

const CATEGORIES: {key: ExpenseCategory; label: string}[] = [
  {key: 'food', label: 'An uong'},
  {key: 'household', label: 'Do dung'},
  {key: 'utility', label: 'Tien ich'},
  {key: 'party', label: 'Tiec'},
  {key: 'transport', label: 'Di lai'},
  {key: 'other', label: 'Khac'},
];

const SPLIT_TYPES: {key: SplitType; label: string}[] = [
  {key: 'equal', label: 'Chia deu'},
  {key: 'exact', label: 'Theo so tien'},
  {key: 'percentage', label: 'Theo %'},
];

// Free tier: gioi han so khoan chi moi thang.
const FREE_MONTHLY_LIMIT = 10;

const ExpenseCreateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<TenantStackParamList, 'ExpenseCreate'>>();
  const prefill = route.params?.prefill;
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment, members} = useApartment();
  const {expenses, loading} = useAppSelector(
    (state: any) => state.expense,
  ) as {expenses: import('../../../types/expense').Expense[]; loading: boolean};

  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [payerId, setPayerId] = useState<string>(user?.id ?? '');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [participants, setParticipants] = useState<string[]>(
    user?.id ? [user.id] : [],
  );
  // Cho exact / percentage: map memberId -> gia tri nhap.
  const [exactInputs, setExactInputs] = useState<Record<string, string>>({});
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>(
    {},
  );

  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Graceful neu RevenueCat chua cau hinh: hasActiveEntitlement tra ve false.
    hasActiveEntitlement('premium')
      .then(active => {
        if (mounted) {
          setIsPremium(active);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsPremium(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Do san du lieu tu hoa don da quet (Tro ly AI).
  useEffect(() => {
    if (!prefill) {
      return;
    }
    if (prefill.title) {
      setTitle(prefill.title);
    }
    if (prefill.total) {
      setAmountText(String(prefill.total));
    }
    const valid = CATEGORIES.map(c => c.key);
    if (
      prefill.suggestedCategory &&
      (valid as string[]).includes(prefill.suggestedCategory)
    ) {
      setCategory(prefill.suggestedCategory as ExpenseCategory);
    }
    if (prefill.items?.length) {
      const lines = prefill.items
        .map(it => `• ${it.name}: ${it.amount}`)
        .join('\n');
      setNote(lines);
    }
  }, [prefill]);

  const amount = useMemo(() => {
    const n = parseInt(amountText.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? 0 : n;
  }, [amountText]);

  const monthlyCount = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.created_at);
      return (
        e.payer_id === user?.id &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [expenses, user?.id]);

  const reachedFreeLimit = !isPremium && monthlyCount >= FREE_MONTHLY_LIMIT;

  const toggleParticipant = (memberUserId: string) => {
    setParticipants(prev =>
      prev.includes(memberUserId)
        ? prev.filter(id => id !== memberUserId)
        : [...prev, memberUserId],
    );
  };

  const memberName = (uid: string) =>
    members.find(m => m.user_id === uid)?.profile?.full_name ?? 'Khong ro';
  const memberAvatar = (uid: string) =>
    members.find(m => m.user_id === uid)?.profile?.avatar_url ?? undefined;

  const handleScanReceipt = () => {
    if (!isPremium) {
      Alert.alert(
        'Tinh nang Premium',
        'Quet hoa don tu dong la tinh nang danh cho ban Premium. Nang cap de mo khoa.',
      );
      return;
    }
    Alert.alert('Quet hoa don', 'Tinh nang dang duoc phat trien.');
  };

  const computeShares = ():
    | {member_id: string; share_amount: number}[]
    | null => {
    if (participants.length === 0) {
      Alert.alert('Loi', 'Chon it nhat mot nguoi tham gia.');
      return null;
    }
    if (splitType === 'equal') {
      return splitEqual(amount, participants).map(s => ({
        member_id: s.memberId,
        share_amount: s.shareAmount,
      }));
    }
    if (splitType === 'exact') {
      const exact = participants.map(uid => ({
        memberId: uid,
        amount: parseInt((exactInputs[uid] ?? '0').replace(/[^0-9]/g, ''), 10) || 0,
      }));
      if (!validateExactSplit(amount, exact)) {
        Alert.alert('Loi', 'Tong so tien chia phai bang tong khoan chi.');
        return null;
      }
      return splitExact(exact).map(s => ({
        member_id: s.memberId,
        share_amount: s.shareAmount,
      }));
    }
    // percentage
    const percents = participants.map(uid => ({
      memberId: uid,
      percent: parseFloat(percentInputs[uid] ?? '0') || 0,
    }));
    const totalPct = percents.reduce((sum, p) => sum + p.percent, 0);
    if (Math.round(totalPct) !== 100) {
      Alert.alert('Loi', 'Tong phan tram phai bang 100%.');
      return null;
    }
    return splitPercentage(amount, percents).map(s => ({
      member_id: s.memberId,
      share_amount: s.shareAmount,
    }));
  };

  const onSubmit = () => {
    if (!user?.id || !apartment?.id) {
      return;
    }
    if (!title.trim()) {
      Alert.alert('Loi', 'Vui long nhap ten khoan chi.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Loi', 'So tien phai lon hon 0.');
      return;
    }
    if (reachedFreeLimit) {
      Alert.alert(
        'Da dat gioi han',
        `Ban mien phi cho phep ${FREE_MONTHLY_LIMIT} khoan/thang. Nang cap Premium de tao khong gioi han.`,
      );
      return;
    }
    const shares = computeShares();
    if (!shares) {
      return;
    }
    dispatch(
      createExpenseRequest({
        apartment_id: apartment.id,
        payer_id: payerId || user.id,
        created_by: user.id,
        title: title.trim(),
        category,
        amount,
        note: note.trim() || null,
        split_type: splitType,
        shares,
      }),
    );
  };

  const prevLoading = React.useRef(loading);
  useEffect(() => {
    if (prevLoading.current && !loading) {
      navigation.goBack();
    }
    prevLoading.current = loading;
  }, [loading, navigation]);

  return (
    <ScreenWrapper testID="tenant-expense-create-screen">
      <LoadingOverlay visible={loading} message="Dang tao khoan chi..." />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Tao khoan chi chung</Text>
          <PressableOpacity
            testID="expense-scan-receipt-btn"
            style={[styles.scanBtn, !isPremium && styles.scanBtnLocked]}
            onPress={handleScanReceipt}>
            <Text style={styles.scanBtnText}>
              {isPremium ? 'Quet hoa don' : 'Quet hoa don 🔒'}
            </Text>
          </PressableOpacity>
        </View>

        {reachedFreeLimit && (
          <Card style={styles.warnCard}>
            <Text style={styles.warnText}>
              Ban da dat gioi han {FREE_MONTHLY_LIMIT} khoan/thang cua ban mien
              phi. Nang cap Premium de tao khong gioi han.
            </Text>
          </Card>
        )}

        <Input
          testID="expense-title-input"
          label="Ten khoan chi"
          placeholder="VD: Di cho cuoi tuan"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          testID="expense-amount-input"
          label="So tien (VND)"
          placeholder="0"
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Danh muc</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <PressableOpacity
              key={c.key}
              style={[styles.chip, category === c.key && styles.chipActive]}
              onPress={() => setCategory(c.key)}>
              <Text
                style={[
                  styles.chipText,
                  category === c.key && styles.chipTextActive,
                ]}>
                {c.label}
              </Text>
            </PressableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nguoi tra truoc</Text>
        <View style={styles.chipRow}>
          {members.map(m => (
            <PressableOpacity
              key={m.user_id}
              style={[
                styles.chip,
                payerId === m.user_id && styles.chipActive,
              ]}
              onPress={() => setPayerId(m.user_id)}>
              <Text
                style={[
                  styles.chipText,
                  payerId === m.user_id && styles.chipTextActive,
                ]}>
                {memberName(m.user_id)}
              </Text>
            </PressableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Cach chia</Text>
        <View style={styles.chipRow}>
          {SPLIT_TYPES.map(s => (
            <PressableOpacity
              key={s.key}
              style={[styles.chip, splitType === s.key && styles.chipActive]}
              onPress={() => setSplitType(s.key)}>
              <Text
                style={[
                  styles.chipText,
                  splitType === s.key && styles.chipTextActive,
                ]}>
                {s.label}
              </Text>
            </PressableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nguoi tham gia</Text>
        {members.map(m => {
          const selected = participants.includes(m.user_id);
          return (
            <Card key={m.user_id} style={styles.memberCard}>
              <PressableOpacity
                style={styles.memberRow}
                onPress={() => toggleParticipant(m.user_id)}>
                <Avatar
                  uri={memberAvatar(m.user_id)}
                  name={memberName(m.user_id)}
                  size={36}
                />
                <Text style={styles.memberName}>
                  {memberName(m.user_id)}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    selected && styles.checkboxOn,
                  ]}>
                  {selected && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
              </PressableOpacity>
              {selected && splitType === 'exact' && (
                <Input
                  label=""
                  placeholder="So tien"
                  value={exactInputs[m.user_id] ?? ''}
                  onChangeText={t =>
                    setExactInputs(prev => ({...prev, [m.user_id]: t}))
                  }
                  keyboardType="numeric"
                />
              )}
              {selected && splitType === 'percentage' && (
                <Input
                  label=""
                  placeholder="% (0-100)"
                  value={percentInputs[m.user_id] ?? ''}
                  onChangeText={t =>
                    setPercentInputs(prev => ({...prev, [m.user_id]: t}))
                  }
                  keyboardType="numeric"
                />
              )}
            </Card>
          );
        })}

        <Input
          testID="expense-note-input"
          label="Ghi chu"
          placeholder="Ghi chu them..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        <View style={styles.submitContainer}>
          <Button
            testID="expense-submit-btn"
            title="Luu khoan chi"
            onPress={onSubmit}
            loading={loading}
            disabled={reachedFreeLimit}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1E293B', flex: 1},
  scanBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scanBtnLocked: {backgroundColor: '#94A3B8'},
  scanBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '600'},
  warnCard: {marginBottom: 12, backgroundColor: '#FEF3C7'},
  warnText: {fontSize: 13, color: '#92400E'},
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  chipActive: {backgroundColor: '#2563EB'},
  chipText: {fontSize: 13, color: '#64748B', fontWeight: '600'},
  chipTextActive: {color: '#FFFFFF'},
  memberCard: {marginBottom: 8},
  memberRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  memberName: {flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500'},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {backgroundColor: '#2563EB', borderColor: '#2563EB'},
  checkboxMark: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},
  submitContainer: {marginTop: 16, marginBottom: 32},
});

export default ExpenseCreateScreen;

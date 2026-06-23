import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PressableOpacity, Input, Button, LoadingOverlay} from '../../../components';
import {useAuth, useApartment} from '../../../hooks';
import {useAppSelector, useAppDispatch} from '../../../store';
import {createChoreRequest} from '../../../store/slices/choreSlice';
import {rotateAssignees} from '../../../utils';
import type {TenantStackParamList, ChoreRecurrence} from '../../../types';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

const RECURRENCE_OPTIONS: {key: ChoreRecurrence; label: string}[] = [
  {key: 'once', label: 'Mot lan'},
  {key: 'daily', label: 'Hang ngay'},
  {key: 'weekly', label: 'Hang tuan'},
  {key: 'monthly', label: 'Hang thang'},
];

const ChoreCreateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {apartment, members, fetchMembers} = useApartment();
  const {loading, error} = useAppSelector(state => state.chore);

  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('10');
  const [recurrence, setRecurrence] = useState<ChoreRecurrence>('once');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (apartment?.id) {
      fetchMembers(apartment.id);
    }
  }, [apartment?.id, fetchMembers]);

  useEffect(() => {
    if (!loading && submitting) {
      setSubmitting(false);
      if (!error) {
        navigation.goBack();
      }
    }
  }, [loading, submitting, error, navigation]);

  const toggleAssignee = useCallback((userId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  }, []);

  const titleError = useMemo(
    () => (title.trim().length === 0 ? 'Vui long nhap ten viec' : undefined),
    [title],
  );

  const handleSubmit = useCallback(() => {
    if (!apartment?.id || !user?.id || title.trim().length === 0) {
      return;
    }
    const parsedPoints = Number.parseInt(points, 10);
    const safePoints = Number.isFinite(parsedPoints) ? parsedPoints : 10;

    // Goi y gan tron 1 chore moi tao cho cac thanh vien duoc chon (round-robin).
    // chore_id se duoc dien trong saga sau khi tao chore.
    const targets =
      selectedAssignees.length > 0
        ? selectedAssignees.map(id => ({user_id: id}))
        : members.map(m => ({user_id: m.user_id}));

    const rotation = rotateAssignees(targets, [{id: ''}], 0);
    const assignments = rotation.map(r => ({
      chore_id: '',
      assignee_id: r.assignee_id,
      due_date: null,
    }));

    dispatch(
      createChoreRequest({
        chore: {
          apartment_id: apartment.id,
          title: title.trim(),
          recurrence,
          points: safePoints,
          created_by: user.id,
        },
        assignments,
      }),
    );
    setSubmitting(true);
  }, [
    apartment?.id,
    user?.id,
    title,
    points,
    recurrence,
    selectedAssignees,
    members,
    dispatch,
  ]);

  return (
    <SafeAreaView
      testID="tenant-chore-create-screen"
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          testID="chore-title-input"
          label="Ten viec nha"
          placeholder="Vi du: Rua bat, do rac..."
          value={title}
          onChangeText={setTitle}
          error={title.length > 0 ? titleError : undefined}
        />

        <Input
          testID="chore-points-input"
          label="Diem thuong"
          placeholder="10"
          value={points}
          onChangeText={setPoints}
          keyboardType="number-pad"
        />

        <Text style={styles.sectionLabel}>Tan suat</Text>
        <View style={styles.optionRow}>
          {RECURRENCE_OPTIONS.map(opt => (
            <PressableOpacity
              key={opt.key}
              testID={`chore-recurrence-${opt.key}`}
              style={[
                styles.chip,
                recurrence === opt.key && styles.chipActive,
              ]}
              onPress={() => setRecurrence(opt.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  recurrence === opt.key && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </PressableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>
          Phan cong (de trong = chia deu ca nha)
        </Text>
        <View style={styles.optionRow}>
          {members.map(m => {
            const selected = selectedAssignees.includes(m.user_id);
            const name = m.profile?.full_name ?? 'Thanh vien';
            return (
              <PressableOpacity
                key={m.user_id}
                testID={`chore-assignee-${m.user_id}`}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => toggleAssignee(m.user_id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextActive]}
                >
                  {name}
                </Text>
              </PressableOpacity>
            );
          })}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          testID="chore-submit-btn"
          title="Tao viec nha"
          onPress={handleSubmit}
          loading={loading}
          disabled={title.trim().length === 0}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  content: {padding: 16, paddingBottom: 48},
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  chipActive: {backgroundColor: '#2563EB'},
  chipText: {fontSize: 13, fontWeight: '600', color: '#64748B'},
  chipTextActive: {color: '#FFFFFF'},
  errorText: {fontSize: 13, color: '#DC2626', marginBottom: 12},
  submitBtn: {marginTop: 8},
});

export default ChoreCreateScreen;

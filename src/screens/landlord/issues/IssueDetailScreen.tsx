import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {
  ScreenWrapper,
  Card,
  StatusBadge,
  Button,
  LoadingOverlay,
} from '../../../components';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector, useAppDispatch} from '../../../store';
import {
  fetchIssueDetailRequest,
  updateIssueStatusRequest,
} from '../../../store/slices/issueSlice';
import {
  formatDate,
  formatRelativeTime,
  getStatusLabel,
} from '../../../utils/formatters';
import type {LandlordStackParamList} from '../../../types/navigation';

type DetailRouteProp = RouteProp<LandlordStackParamList, 'LandlordIssueDetail'>;

const CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Thiet bi',
  noise: 'Tieng on',
  hygiene: 'Ve sinh',
  security: 'An ninh',
  other: 'Khac',
};

const STATUS_FLOW: {
  status: string;
  label: string;
  next: string;
  nextLabel: string;
}[] = [
  {status: 'open', label: 'Mo', next: 'in_progress', nextLabel: 'Tiep nhan'},
  {
    status: 'in_progress',
    label: 'Dang xu ly',
    next: 'resolved',
    nextLabel: 'Da xu ly',
  },
  {
    status: 'reopened',
    label: 'Mo lai',
    next: 'in_progress',
    nextLabel: 'Tiep nhan',
  },
];

const IssueDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const {id} = route.params;
  const dispatch = useAppDispatch();
  const {members} = useApartment();
  const {currentIssue: issue, loading} = useAppSelector(state => state.issue);

  const [note, setNote] = useState('');

  useEffect(() => {
    dispatch(fetchIssueDetailRequest({id}));
  }, [id, dispatch]);

  const reporterName = useMemo(() => {
    if (!issue) return '';
    const member = members.find(m => m.user_id === issue.reporter_id);
    return member?.profile?.full_name ?? 'Nguoi bao cao';
  }, [issue, members]);

  const currentAction = useMemo(() => {
    if (!issue) return null;
    return STATUS_FLOW.find(s => s.status === issue.status) ?? null;
  }, [issue]);

  const handleStatusUpdate = useCallback(
    (newStatus: string) => {
      if (!issue) return;
      Alert.alert('Xac nhan', `Ban muon chuyen trang thai sang "${getStatusLabel(newStatus)}"?`, [
        {text: 'Huy', style: 'cancel'},
        {
          text: 'Dong y',
          onPress: () => {
            dispatch(
              updateIssueStatusRequest({
                id: issue.id,
                status: newStatus,
              }),
            );
            setNote('');
          },
        },
      ]);
    },
    [issue, note, dispatch],
  );

  if (!issue && !loading) {
    return (
      <ScreenWrapper scroll>
        <Text style={styles.emptyText}>Khong tim thay su co</Text>
      </ScreenWrapper>
    );
  }

  if (!issue) {
    return (
      <ScreenWrapper scroll>
        <LoadingOverlay visible />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      <LoadingOverlay visible={loading} />

      {/* Title & Status */}
      <View style={styles.header}>
        <Text style={styles.title}>{issue.title}</Text>
        <View style={styles.statusRow}>
          <StatusBadge status={issue.status} />
          {issue.urgency === 'urgent' && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Khan cap</Text>
            </View>
          )}
        </View>
      </View>

      {/* Details */}
      <Card style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nguoi bao cao</Text>
          <Text style={styles.detailValue}>{reporterName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Danh muc</Text>
          <Text style={styles.detailValue}>
            {CATEGORY_LABELS[issue.category] ?? issue.category}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vi tri</Text>
          <Text style={styles.detailValue}>{issue.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngay tao</Text>
          <Text style={styles.detailValue}>{formatDate(issue.created_at)}</Text>
        </View>
      </Card>

      {/* Description */}
      {issue.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mo ta</Text>
          <Card>
            <Text style={styles.description}>{issue.description}</Text>
          </Card>
        </View>
      )}

      {/* Status Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tien trinh</Text>
        <Card>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStatus}>Tao su co</Text>
              <Text style={styles.timelineDate}>
                {formatDate(issue.created_at)}
              </Text>
            </View>
          </View>
          {issue.status !== 'open' && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {backgroundColor: '#2563EB'}]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>Tiep nhan xu ly</Text>
                {issue.landlord_note && (
                  <Text style={styles.timelineNote}>{issue.landlord_note}</Text>
                )}
              </View>
            </View>
          )}
          {(issue.status === 'resolved' || issue.status === 'closed') && (
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, {backgroundColor: '#16A34A'}]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>Da giai quyet</Text>
                {issue.resolution_note && (
                  <Text style={styles.timelineNote}>
                    {issue.resolution_note}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Card>
      </View>

      {/* Action Section */}
      {currentAction && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hanh dong</Text>
          <Card>
            <TextInput
              style={styles.noteInput}
              placeholder={
                currentAction.next === 'resolved'
                  ? 'Ghi chu giai quyet...'
                  : 'Ghi chu tiep nhan...'
              }
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />
            <Button
              title={currentAction.nextLabel}
              onPress={() => handleStatusUpdate(currentAction.next)}
              loading={loading}
              style={styles.actionBtn}
            />
          </Card>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  detailCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  timelineDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  timelineNote: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 80,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  actionBtn: {
    marginTop: 4,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 32,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default IssueDetailScreen;

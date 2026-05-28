import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useAppSelector, useAppDispatch } from '../../../store';
import {
  fetchIssueDetailRequest,
  updateIssueStatusRequest,
} from '../../../store/slices/issueSlice';
import {
  formatDate,
  formatDateTime,
  getStatusLabel,
} from '../../../utils/formatters';
import { getSignedImageUrl } from '../../../services/storage';
import type { TenantStackParamList } from '../../../types/navigation';

type ScreenRouteProp = RouteProp<TenantStackParamList, 'IssueDetail'>;

const CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Hong hoc',
  noise: 'Tieng on',
  hygiene: 'Ve sinh',
  security: 'An ninh',
  other: 'Khac',
};

const LOCATION_LABELS: Record<string, string> = {
  living_room: 'Phong khach',
  kitchen: 'Bep',
  bathroom: 'WC',
  balcony: 'Ban cong',
  private_room: 'Phong rieng',
};

const IssueDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const { id } = route.params;
  const dispatch = useAppDispatch();
  const { currentIssue, loading } = useAppSelector(state => state.issue);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchIssueDetailRequest({ id }));
  }, [id, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const rows = ((currentIssue as any)?.issue_images ?? []) as Array<{
        image_url: string;
      }>;
      const urls = await Promise.all(
        rows.map(row => getSignedImageUrl('issue-images', row.image_url)),
      );
      if (!cancelled) {
        setImageUrls(urls);
      }
    };
    loadImages();
    return () => {
      cancelled = true;
    };
  }, [currentIssue]);

  const handleUpdateStatus = useCallback(
    (status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened') => {
      dispatch(updateIssueStatusRequest({ id, status }));
    },
    [id, dispatch],
  );

  if (!currentIssue) {
    return (
      <ScreenWrapper>
        <LoadingOverlay visible={loading} />
        <Text style={styles.emptyText}>Khong tim thay su co</Text>
      </ScreenWrapper>
    );
  }

  const { status } = currentIssue;

  return (
    <ScreenWrapper>
      <LoadingOverlay visible={loading} />

      {/* Title and status */}
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.issueTitle}>{currentIssue.title}</Text>
          <StatusBadge status={status} />
        </View>
      </Card>

      {/* Details */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Thong tin chi tiet</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Danh muc:</Text>
          <Text style={styles.detailValue}>
            {CATEGORY_LABELS[currentIssue.category] ?? currentIssue.category}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vi tri:</Text>
          <Text style={styles.detailValue}>
            {LOCATION_LABELS[currentIssue.location] ?? currentIssue.location}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Muc do:</Text>
          <View
            style={[
              styles.urgencyInline,
              currentIssue.urgency === 'urgent'
                ? styles.urgentBg
                : styles.normalBg,
            ]}
          >
            <Text
              style={[
                styles.urgencyInlineText,
                currentIssue.urgency === 'urgent'
                  ? styles.urgentColor
                  : styles.normalColor,
              ]}
            >
              {getStatusLabel(currentIssue.urgency)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngay tao:</Text>
          <Text style={styles.detailValue}>
            {formatDate(currentIssue.created_at)}
          </Text>
        </View>
      </Card>

      {/* Description */}
      {currentIssue.description && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Mo ta</Text>
          <Text style={styles.descriptionText}>{currentIssue.description}</Text>
        </Card>
      )}

      {imageUrls.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Hinh anh</Text>
          <View style={styles.imageGrid}>
            {imageUrls.map(url => (
              <Image key={url} source={{ uri: url }} style={styles.issueImage} />
            ))}
          </View>
        </Card>
      )}

      {/* Status timeline */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tien trinh</Text>
        <View style={styles.timelineContainer}>
          <TimelineItem
            label="Tao bao cao"
            date={currentIssue.created_at}
            active
          />
          {(status === 'in_progress' ||
            status === 'resolved' ||
            status === 'closed') && (
            <TimelineItem
              label="Dang xu ly"
              date={currentIssue.updated_at}
              active
            />
          )}
          {(status === 'resolved' || status === 'closed') && (
            <TimelineItem
              label="Da giai quyet"
              date={currentIssue.updated_at}
              active
            />
          )}
          {status === 'closed' && (
            <TimelineItem
              label="Da dong"
              date={currentIssue.updated_at}
              active
            />
          )}
          {status === 'reopened' && (
            <TimelineItem
              label="Mo lai"
              date={currentIssue.updated_at}
              active
            />
          )}
        </View>
      </Card>

      {/* Landlord notes */}
      {currentIssue.landlord_note && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ghi chu tu chu nha</Text>
          <View style={styles.landlordNoteBox}>
            <Text style={styles.landlordNoteText}>
              {currentIssue.landlord_note}
            </Text>
          </View>
        </Card>
      )}

      {/* Resolution note */}
      {currentIssue.resolution_note && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Ghi chu giai quyet</Text>
          <Text style={styles.descriptionText}>
            {currentIssue.resolution_note}
          </Text>
        </Card>
      )}

      {/* Action buttons when resolved */}
      {status === 'resolved' && (
        <View style={styles.actionsContainer}>
          <Button
            title="Xac nhan da on"
            onPress={() => handleUpdateStatus('closed')}
            loading={loading}
            style={styles.actionBtn}
          />
          <Button
            title="Chua xong, mo lai"
            onPress={() => handleUpdateStatus('reopened')}
            variant="outline"
            loading={loading}
            style={styles.actionBtn}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

/* Timeline item sub-component */
interface TimelineItemProps {
  label: string;
  date: string;
  active?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ label, date, active }) => (
  <View style={timelineStyles.item}>
    <View style={timelineStyles.dotColumn}>
      <View
        style={[
          timelineStyles.dot,
          active ? timelineStyles.dotActive : timelineStyles.dotInactive,
        ]}
      />
      <View style={timelineStyles.line} />
    </View>
    <View style={timelineStyles.content}>
      <Text style={timelineStyles.label}>{label}</Text>
      <Text style={timelineStyles.date}>{formatDateTime(date)}</Text>
    </View>
  </View>
);

const timelineStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    minHeight: 48,
  },
  dotColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    backgroundColor: '#CBD5E1',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  urgencyInline: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgentBg: {
    backgroundColor: '#FEF2F2',
  },
  normalBg: {
    backgroundColor: '#EFF6FF',
  },
  urgencyInlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgentColor: {
    color: '#DC2626',
  },
  normalColor: {
    color: '#2563EB',
  },
  descriptionText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
  },
  timelineContainer: {
    marginTop: 4,
  },
  landlordNoteBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  landlordNoteText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
  bottomSpacer: {
    height: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default IssueDetailScreen;

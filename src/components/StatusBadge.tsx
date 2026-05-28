import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeSize = 'small' | 'medium';

interface StatusBadgeProps {
  status: string;
  size?: BadgeSize;
}

interface StatusConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  pending: { label: 'Chờ xử lý', backgroundColor: '#FFF7ED', textColor: '#EA580C' },
  unpaid: { label: 'Chưa trả', backgroundColor: '#FFF7ED', textColor: '#EA580C' },
  approved: { label: 'Đã duyệt', backgroundColor: '#F0FDF4', textColor: '#16A34A' },
  confirmed: { label: 'Đã xác nhận', backgroundColor: '#F0FDF4', textColor: '#16A34A' },
  rejected: { label: 'Từ chối', backgroundColor: '#FEF2F2', textColor: '#DC2626' },
  in_use: { label: 'Đang mượn', backgroundColor: '#EFF6FF', textColor: '#2563EB' },
  return_requested: { label: 'Yêu cầu trả', backgroundColor: '#FAF5FF', textColor: '#9333EA' },
  returned: { label: 'Đã trả', backgroundColor: '#F1F5F9', textColor: '#64748B' },
  open: { label: 'Mở', backgroundColor: '#FFF7ED', textColor: '#EA580C' },
  in_progress: { label: 'Đang xử lý', backgroundColor: '#EFF6FF', textColor: '#2563EB' },
  resolved: { label: 'Đã xử lý', backgroundColor: '#F0FDF4', textColor: '#16A34A' },
  closed: { label: 'Đóng', backgroundColor: '#F1F5F9', textColor: '#64748B' },
  reopened: { label: 'Mở lại', backgroundColor: '#FFF7ED', textColor: '#EA580C' },
  tenant_reported: { label: 'Đã báo trả', backgroundColor: '#FEFCE8', textColor: '#CA8A04' },
  overdue: { label: 'Quá hạn', backgroundColor: '#FEF2F2', textColor: '#DC2626' },
  good: { label: 'Tốt', backgroundColor: '#F0FDF4', textColor: '#16A34A' },
  fair: { label: 'Khá', backgroundColor: '#FEFCE8', textColor: '#CA8A04' },
  poor: { label: 'Kém', backgroundColor: '#FEF2F2', textColor: '#DC2626' },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: '',
  backgroundColor: '#F1F5F9',
  textColor: '#64748B',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const config = STATUS_MAP[status] || { ...DEFAULT_CONFIG, label: status };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        size === 'small' ? styles.small : styles.medium,
      ]}>
      <Text
        style={[
          styles.text,
          { color: config.textColor },
          size === 'small' ? styles.smallText : styles.mediumText,
        ]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 100,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 13,
  },
});

export default StatusBadge;

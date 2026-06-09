import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import PressableOpacity from '../../../components/PressableOpacity';
import {useApartment} from '../../../hooks/useApartment';
import {useAppSelector} from '../../../store';
import {formatCurrency} from '../../../utils/formatters';

type ReportType = 'payments' | 'tenants' | 'issues';

const REPORTS: Array<{key: ReportType; label: string}> = [
  {key: 'payments', label: 'Thanh toan'},
  {key: 'tenants', label: 'Nguoi thue'},
  {key: 'issues', label: 'Su co'},
];

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: unknown[][]) {
  return rows.map(row => row.map(csvEscape).join(',')).join('\n');
}

const ReportExportScreen: React.FC = () => {
  const {members} = useApartment();
  const {payments, billingPeriods} = useAppSelector(state => state.payment);
  const {issues} = useAppSelector(state => state.issue);
  const [reportType, setReportType] = useState<ReportType>('payments');
  const [copied, setCopied] = useState(false);

  const memberNameMap = useMemo(() => {
    return Object.fromEntries(
      members.map(member => [
        member.user_id,
        member.profile?.full_name ?? 'Nguoi thue',
      ]),
    );
  }, [members]);

  const periodMap = useMemo(() => {
    return Object.fromEntries(
      billingPeriods.map(period => [
        period.id,
        `${period.month}/${period.year}`,
      ]),
    );
  }, [billingPeriods]);

  const csv = useMemo(() => {
    if (reportType === 'tenants') {
      const tenantRows = members.reduce<unknown[][]>((rows, member) => {
        if (member.profile?.role === 'tenant') {
          rows.push([
            member.profile?.full_name ?? '',
            member.room_name ?? '',
            member.rent_amount,
            member.joined_at,
          ]);
        }
        return rows;
      }, []);

      return toCsv([
        ['Ten', 'Phong', 'Tien thue', 'Ngay tham gia'],
        ...tenantRows,
      ]);
    }

    if (reportType === 'issues') {
      return toCsv([
        ['Tieu de', 'Nguoi bao', 'Trang thai', 'Muc do', 'Vi tri', 'Ngay tao'],
        ...issues.map(issue => [
          issue.title,
          memberNameMap[issue.reporter_id] ?? issue.reporter_id,
          issue.status,
          issue.urgency,
          issue.location,
          issue.created_at,
        ]),
      ]);
    }

    return toCsv([
      ['Ky', 'Nguoi thue', 'Tien phong', 'Dich vu', 'Tong', 'Trang thai'],
      ...payments.map(payment => [
        periodMap[payment.billing_period_id] ?? payment.billing_period_id,
        memberNameMap[payment.tenant_id] ?? payment.tenant_id,
        payment.rent_amount ?? payment.amount - payment.utility_total,
        payment.utility_total,
        payment.amount,
        payment.status,
      ]),
    ]);
  }, [issues, memberNameMap, members, payments, periodMap, reportType]);

  const totalPaymentAmount = useMemo(() => {
    return payments
      .filter(payment => payment.status === 'confirmed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const handleCopy = () => {
    Clipboard.setString(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ScreenWrapper>
      <View style={styles.tabs}>
        {REPORTS.map(report => (
          <PressableOpacity
            key={report.key}
            style={[
              styles.tab,
              reportType === report.key && styles.tabActive,
            ]}
            onPress={() => setReportType(report.key)}
          >
            <Text
              style={[
                styles.tabText,
                reportType === report.key && styles.tabTextActive,
              ]}
            >
              {report.label}
            </Text>
          </PressableOpacity>
        ))}
      </View>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Da thu</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(totalPaymentAmount)}
        </Text>
      </Card>

      <TextInput
        value={csv}
        editable={false}
        multiline
        style={styles.preview}
      />

      <Button
        title={copied ? 'Da copy CSV' : 'Copy CSV'}
        onPress={handleCopy}
        style={styles.button}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    marginBottom: 12,
    backgroundColor: '#F0FDF4',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#166534',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: '#16A34A',
  },
  preview: {
    minHeight: 280,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 12,
    color: '#1E293B',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 14,
  },
});

export default ReportExportScreen;

import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Avatar from '../../../components/Avatar';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useApartment } from '../../../hooks/useApartment';
import { useAppSelector } from '../../../store';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';
import type { LandlordStackParamList } from '../../../types/navigation';
import type { Payment, Issue } from '../../../types/database';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type DetailRouteProp = RouteProp<LandlordStackParamList, 'TenantDetail'>;

const TenantDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;
  const { apartment, members, loading, fetchMembers, removeMember } =
    useApartment();

  const { payments } = useAppSelector(state => state.payment);
  const { issues } = useAppSelector(state => state.issue);

  useEffect(() => {
    if (apartment?.id) {
      fetchMembers(apartment.id);
    }
  }, [apartment?.id, fetchMembers]);

  const member = useMemo(
    () => members.find(m => m.user_id === id),
    [members, id],
  );

  const profile = member?.profile;
  const name = profile?.full_name ?? 'Nguoi thue';

  const tenantPayments = useMemo(
    () =>
      payments
        .filter(p => p.tenant_id === id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 10),
    [payments, id],
  );

  const tenantIssues = useMemo(
    () =>
      issues
        .filter(i => i.reporter_id === id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 10),
    [issues, id],
  );

  const handleRemove = useCallback(() => {
    Alert.alert(
      'Xoa nguoi thue',
      `Ban co chac chan muon xoa ${name} khoi can ho?`,
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: () => {
            if (member) {
              removeMember(member.id);
              navigation.goBack();
            }
          },
        },
      ],
    );
  }, [member, name, removeMember, navigation]);

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{formatCurrency(item.amount)}</Text>
        <Text style={styles.listItemDate}>{formatDate(item.created_at)}</Text>
      </View>
      <StatusBadge status={item.status} size="small" />
    </View>
  );

  const renderIssueItem = ({ item }: { item: Issue }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.listItemDate}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
      <StatusBadge status={item.status} size="small" />
    </View>
  );

  return (
    <ScreenWrapper scroll>
      <LoadingOverlay visible={loading} />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar uri={profile?.avatar_url} name={name} size={72} />
        <Text style={styles.name}>{name}</Text>
        {profile?.phone && <Text style={styles.infoText}>{profile.phone}</Text>}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phong</Text>
            <Text style={styles.detailValue}>
              {member?.room_name ?? 'Chua gan'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tien thue</Text>
            <Text style={styles.detailValue}>
              {member ? formatCurrency(member.rent_amount) : '-'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ngay tham gia</Text>
            <Text style={styles.detailValue}>
              {member ? formatDate(member.joined_at) : '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lich su thanh toan</Text>
        {tenantPayments.length > 0 ? (
          <Card>
            <FlatList
              data={tenantPayments}
              keyExtractor={item => item.id}
              renderItem={renderPaymentItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>
        ) : (
          <Text style={styles.emptyText}>Chua co thanh toan nao</Text>
        )}
      </View>

      {/* Issue History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Su co da bao cao</Text>
        {tenantIssues.length > 0 ? (
          <Card>
            <FlatList
              data={tenantIssues}
              keyExtractor={item => item.id}
              renderItem={renderIssueItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>
        ) : (
          <Text style={styles.emptyText}>Chua co su co nao</Text>
        )}
      </View>

      {/* Remove Button */}
      <Button
        title="Xoa khoi can ho"
        onPress={handleRemove}
        variant="danger"
        style={styles.removeBtn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 24,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  listItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  listItemDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 16,
  },
  removeBtn: {
    marginTop: 8,
    marginBottom: 32,
  },
});

export default TenantDetailScreen;

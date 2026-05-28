import React, {useCallback} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenWrapper, Avatar, Card, Button} from '../../components';
import {useAuth} from '../../hooks/useAuth';
import {useApartment} from '../../hooks/useApartment';
import type {TenantStackParamList} from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {user, signOut, loading} = useAuth();
  const {apartment, members} = useApartment();

  const currentMember = members.find(m => m.user_id === user?.id);

  const handleSignOut = useCallback(() => {
    Alert.alert('Dang xuat', 'Ban co chac chan muon dang xuat?', [
      {text: 'Huy', style: 'cancel'},
      {
        text: 'Dang xuat',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }, [signOut]);

  return (
    <ScreenWrapper>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <Avatar
          uri={user?.avatar_url}
          name={user?.full_name ?? 'U'}
          size={80}
        />
        <Text style={styles.userName}>{user?.full_name ?? 'Khong ro'}</Text>
        <Text style={styles.userEmail}>{user?.id ?? ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user?.role === 'tenant' ? 'Nguoi thue' : 'Chu nha'}
          </Text>
        </View>
      </View>

      {/* Personal info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Thong tin ca nhan</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>So dien thoai</Text>
          <Text style={styles.infoValue}>
            {user?.phone ?? 'Chua cap nhat'}
          </Text>
        </View>

        {currentMember?.room_name && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phong</Text>
            <Text style={styles.infoValue}>{currentMember.room_name}</Text>
          </View>
        )}
      </Card>

      {/* Apartment info */}
      {apartment && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Can ho</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ten can ho</Text>
            <Text style={styles.infoValue}>{apartment.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dia chi</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {apartment.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>So phong</Text>
            <Text style={styles.infoValue}>{apartment.num_rooms}</Text>
          </View>
        </Card>
      )}

      {/* Account actions */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tai khoan</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.settingLabel}>Chinh sua thong tin</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('ChangePassword')}>
          <Text style={styles.settingLabel}>Doi mat khau</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Phien ban</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </Card>

      {/* Sign out */}
      <View style={styles.signOutContainer}>
        <Button
          title="Dang xuat"
          onPress={handleSignOut}
          variant="danger"
          loading={loading}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  card: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 14,
    color: '#1E293B',
  },
  settingValue: {
    fontSize: 14,
    color: '#64748B',
  },
  settingChevron: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '300',
  },
  signOutContainer: {
    marginTop: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ProfileScreen;

import React, { useCallback } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import PressableOpacity from '../../components/PressableOpacity';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApartment } from '../../hooks/useApartment';
import type { LandlordStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, session, signOut } = useAuth();
  const { apartment, apartments } = useApartment();

  const handleSignOut = useCallback(() => {
    Alert.alert('Dang xuat', 'Ban co chac chan muon dang xuat?', [
      { text: 'Huy', style: 'cancel' },
      {
        text: 'Dang xuat',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  }, [signOut]);

  return (
    <ScreenWrapper scroll>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar
          uri={user?.avatar_url}
          name={user?.full_name ?? 'User'}
          size={80}
        />
        <Text style={styles.name}>{user?.full_name ?? 'Chu nha'}</Text>
        <Text style={styles.email}>
          {session?.user?.email ?? 'Chua co email'}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Chu nha</Text>
        </View>
      </View>

      {/* Apartment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Can ho</Text>
        {apartment ? (
          <Card
            style={styles.apartmentCard}
            onPress={() =>
              navigation.navigate('ApartmentSetup', { id: apartment.id })
            }
          >
            <Text style={styles.apartmentName}>{apartment.name}</Text>
            <Text style={styles.apartmentAddress}>{apartment.address}</Text>
            <View style={styles.inviteRow}>
              <Text style={styles.inviteLabel}>Ma moi:</Text>
              <Text style={styles.inviteCode}>{apartment.invite_code}</Text>
            </View>
          </Card>
        ) : (
          <Card>
            <Text style={styles.noApartmentText}>
              Chua co can ho. Hay thiet lap can ho de bat dau.
            </Text>
            <Button
              title="Thiet lap can ho"
              onPress={() => navigation.navigate('ApartmentSetup', {})}
              variant="primary"
              style={styles.setupBtn}
            />
          </Card>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tai khoan</Text>
        <Card>
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.settingText}>Chinh sua thong tin</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.settingText}>Doi mat khau</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Text style={styles.settingText}>Cai dat thong bao</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>So dien thoai</Text>
            <Text style={styles.settingMutedText}>
              {user?.phone ?? 'Chua cap nhat'}
            </Text>
          </View>
          <View style={styles.settingSeparator} />
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Phien ban</Text>
            <Text style={styles.settingMutedText}>
              {Config.APP_VERSION ?? '1.0.0'}
            </Text>
          </View>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('RevenueHistory')}
          >
            <Text style={styles.settingText}>Lich su doanh thu</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('ReportExport')}
          >
            <Text style={styles.settingText}>Xuat bao cao CSV</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('UtilityConfig')}
          >
            <Text style={styles.settingText}>Cau hinh dich vu</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('ApartmentSwitcher')}
          >
            <Text style={styles.settingText}>Chon can ho</Text>
            <Text style={styles.settingMutedText}>
              {apartments.length} can ho
            </Text>
          </PressableOpacity>
          <View style={styles.settingSeparator} />
          <PressableOpacity
            style={styles.settingItem}
            onPress={() => {
              if (apartment?.id) {
                navigation.navigate('InviteCode', {
                  apartmentId: apartment.id,
                });
              }
            }}
          >
            <Text style={styles.settingText}>Ma moi can ho</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </PressableOpacity>
        </Card>
      </View>

      {/* Sign Out */}
      <Button
        title="Dang xuat"
        onPress={handleSignOut}
        variant="danger"
        style={styles.signOutBtn}
      />

      <View style={styles.bottomSpacer} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 14,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
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
  apartmentCard: {
    gap: 4,
  },
  apartmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  apartmentAddress: {
    fontSize: 14,
    color: '#64748B',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  inviteLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginRight: 6,
  },
  inviteCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  noApartmentText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  setupBtn: {
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingText: {
    fontSize: 15,
    color: '#1E293B',
  },
  settingMutedText: {
    fontSize: 14,
    color: '#64748B',
  },
  settingChevron: {
    fontSize: 18,
    color: '#94A3B8',
  },
  settingSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  signOutBtn: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ProfileScreen;

import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenWrapper, Card, Avatar, Button} from '../../components';
import {useAuth} from '../../hooks/useAuth';
import {useApartment} from '../../hooks/useApartment';
import type {LandlordStackParamList} from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {user, signOut} = useAuth();
  const {apartment} = useApartment();

  const handleSignOut = useCallback(() => {
    Alert.alert('Dang xuat', 'Ban co chac chan muon dang xuat?', [
      {text: 'Huy', style: 'cancel'},
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
              navigation.navigate('ApartmentSetup', {id: apartment.id})
            }>
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
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.settingText}>Chinh sua thong tin</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.settingSeparator} />
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.settingText}>Doi mat khau</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.settingSeparator} />
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('RevenueHistory')}>
            <Text style={styles.settingText}>Lich su doanh thu</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </TouchableOpacity>
          <View style={styles.settingSeparator} />
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              if (apartment?.id) {
                navigation.navigate('InviteCode', {
                  apartmentId: apartment.id,
                });
              }
            }}>
            <Text style={styles.settingText}>Ma moi can ho</Text>
            <Text style={styles.settingChevron}>{'>'}</Text>
          </TouchableOpacity>
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

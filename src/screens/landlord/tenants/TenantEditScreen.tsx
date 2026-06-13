import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { useApartment } from '../../../hooks/useApartment';
import type { LandlordStackParamList } from '../../../types/navigation';

type NavigationProp = NativeStackNavigationProp<LandlordStackParamList>;
type EditRouteProp = RouteProp<LandlordStackParamList, 'TenantEdit'>;
type ApartmentHook = ReturnType<typeof useApartment>;
type TenantMember = ApartmentHook['members'][number];
type UpdateMember = ApartmentHook['updateMember'];

const TenantEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditRouteProp>();
  const { id } = route.params;
  const { members, loading, updateMember } = useApartment();
  const member = useMemo(
    () => members.find(item => item.user_id === id),
    [id, members],
  );

  if (!member) {
    return (
      <ScreenWrapper testID="tenant-edit-screen">
        <Text style={styles.emptyText}>Khong tim thay nguoi thue</Text>
      </ScreenWrapper>
    );
  }

  return (
    <TenantEditForm
      key={member.id}
      member={member}
      loading={loading}
      updateMember={updateMember}
      navigation={navigation}
    />
  );
};

function TenantEditForm({
  member,
  loading,
  updateMember,
  navigation,
}: {
  member: TenantMember;
  loading: boolean;
  updateMember: UpdateMember;
  navigation: NavigationProp;
}) {
  const [roomName, setRoomName] = useState(member?.room_name ?? '');
  const [rentAmount, setRentAmount] = useState(
    member?.rent_amount ? String(member.rent_amount) : '',
  );
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      navigation.goBack();
    }
    prevLoadingRef.current = loading;
  }, [loading, navigation]);

  const handleSubmit = () => {
    if (!member) {
      Alert.alert('Loi', 'Khong tim thay nguoi thue');
      return;
    }

    const amount = parseInt(rentAmount.replace(/\D/g, ''), 10);
    if (Number.isNaN(amount) || amount < 0) {
      Alert.alert('Loi', 'Tien thue khong hop le');
      return;
    }

    updateMember(member.id, {
      room_name: roomName.trim() || null,
      rent_amount: amount,
    });
  };

  return (
    <ScreenWrapper testID="tenant-edit-screen">
      <LoadingOverlay visible={loading} />
      <Text style={styles.title}>
        {member.profile?.full_name ?? 'Nguoi thue'}
      </Text>
      <Input
        testID="tenant-edit-room-input"
        label="Phong"
        placeholder="VD: P101"
        value={roomName}
        onChangeText={setRoomName}
      />
      <Input
        testID="tenant-edit-rent-input"
        label="Tien thue hang thang"
        placeholder="VD: 3500000"
        value={rentAmount}
        onChangeText={text => setRentAmount(text.replace(/\D/g, ''))}
        keyboardType="number-pad"
      />
      <Button
        testID="tenant-edit-submit-btn"
        title="Luu thay doi"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  submitBtn: {
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 48,
  },
});

export default TenantEditScreen;

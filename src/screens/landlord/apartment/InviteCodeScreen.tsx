import React from 'react';
import { View, Text, Share, StyleSheet, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { useAppSelector } from '../../../store';
import type { LandlordStackParamList } from '../../../types/navigation';

type InviteCodeRouteProp = RouteProp<LandlordStackParamList, 'InviteCode'>;

const InviteCodeScreen: React.FC = () => {
  const route = useRoute<InviteCodeRouteProp>();
  const { apartmentId } = route.params;

  const apartment = useAppSelector(state => state.apartment.apartment);

  const inviteCode = apartment?.invite_code ?? '';

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
    Alert.alert('Da sao chep', 'Ma moi da duoc sao chep vao bo nho tam.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tham gia can ho cua toi tren CoLiving! Ma moi: ${inviteCode}`,
      });
    } catch {
      // User cancelled share
    }
  };

  return (
    <ScreenWrapper scroll>
      <View style={styles.container}>
        <Text style={styles.title}>Ma moi tham gia</Text>
        <Text style={styles.subtitle}>
          Gui ma nay cho nguoi thue de ho tham gia can ho
        </Text>

        <Card style={styles.codeCard}>
          <Text style={styles.codeLabel}>Ma moi cua ban</Text>
          <Text style={styles.code} selectable>
            {inviteCode}
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Sao chep"
            onPress={handleCopy}
            variant="primary"
            style={styles.actionBtn}
          />
          <Button
            title="Chia se"
            onPress={handleShare}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>

        <Card style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Huong dan</Text>
          <Text style={styles.instructionText}>
            1. Sao chep hoac chia se ma moi o tren{'\n'}
            2. Nguoi thue mo ung dung CoLiving va chon "Tham gia can ho"{'\n'}
            3. Nhap ma moi de tham gia
          </Text>
        </Card>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  code: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    width: '100%',
  },
  instructionCard: {
    width: '100%',
    backgroundColor: '#EFF6FF',
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});

export default InviteCodeScreen;

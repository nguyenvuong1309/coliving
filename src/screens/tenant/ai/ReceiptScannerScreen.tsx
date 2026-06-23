import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  launchImageLibrary,
  launchCamera,
  type Asset,
} from 'react-native-image-picker';
import {ScreenWrapper, Card, Button, EmptyState, LoadingOverlay} from '../../../components';
import {scanReceipt, hasActiveEntitlement} from '../../../services';
import {formatCurrency} from '../../../utils';
import type {ScanReceiptResult, TenantStackParamList} from '../../../types';

type NavigationProp = NativeStackNavigationProp<TenantStackParamList>;

const ReceiptScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [checkingPremium, setCheckingPremium] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScanReceiptResult | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Quet hoa don AI' });
  }, [navigation]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const active = await hasActiveEntitlement('premium');
        if (mounted) {
          setIsPremium(active);
        }
      } finally {
        if (mounted) {
          setCheckingPremium(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const processAsset = useCallback(async (asset: Asset) => {
    if (!asset.base64 || !asset.uri) {
      Alert.alert('Loi', 'Khong doc duoc anh, vui long thu lai.');
      return;
    }
    setImageUri(asset.uri);
    setResult(null);
    setScanning(true);
    try {
      const scanned = await scanReceipt(
        asset.base64,
        asset.type ?? 'image/jpeg',
      );
      setResult(scanned);
    } catch (e: any) {
      Alert.alert('Khong quet duoc', e?.message ?? 'Da co loi xay ra.');
    } finally {
      setScanning(false);
    }
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1600,
        maxHeight: 1600,
        includeBase64: true,
      });
      if (res.assets && res.assets[0]) {
        await processAsset(res.assets[0]);
      }
    } catch {
      // huy chon
    }
  }, [processAsset]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1600,
        maxHeight: 1600,
        includeBase64: true,
        saveToPhotos: false,
      });
      if (res.assets && res.assets[0]) {
        await processAsset(res.assets[0]);
      }
    } catch {
      // huy chup
    }
  }, [processAsset]);

  const handleConfirm = useCallback(() => {
    if (!result) {
      return;
    }
    // Chuyen sang man hinh tao khoan chi (feature 1) voi du lieu da quet.
    // Man hinh ExpenseCreate co the chua ton tai — se duoc noi day sau, nen
    // dung `as any` de tranh phu thuoc vao navigation types (khong duoc sua).
    (navigation.navigate as any)('ExpenseCreate', { prefill: result });
  }, [navigation, result]);

  if (checkingPremium) {
    return (
      <ScreenWrapper testID="receipt-scanner-screen">
        <LoadingOverlay visible />
      </ScreenWrapper>
    );
  }

  // Gate: chi nguoi dung Premium moi dung duoc quet hoa don AI.
  if (!isPremium) {
    return (
      <ScreenWrapper testID="receipt-scanner-screen" scroll>
        <EmptyState
          title="Tinh nang danh cho Premium"
          description="Nang cap Premium de quet hoa don bang AI, tu dong tao khoan chi va xem giai thich chi phi thong minh."
        />
        <Button
          testID="receipt-scanner-upsell-btn"
          title="Tim hieu Premium"
          onPress={() =>
            Alert.alert(
              'Premium',
              'Mo khoa quet hoa don AI va nhieu tinh nang khac voi goi Premium.',
            )
          }
          style={styles.upsellBtn}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper testID="receipt-scanner-screen" scroll>
      <LoadingOverlay visible={scanning} />

      <Text style={styles.intro}>
        Chup hoac chon anh hoa don. AI se tu dong trich xuat cac mon va tong tien.
      </Text>

      <View style={styles.actionRow}>
        <Button
          testID="receipt-scanner-camera-btn"
          title="Chup anh"
          onPress={handleTakePhoto}
          style={styles.actionBtn}
        />
        <Button
          testID="receipt-scanner-library-btn"
          title="Chon tu thu vien"
          variant="outline"
          onPress={handlePickFromLibrary}
          style={styles.actionBtn}
        />
      </View>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          resizeMode="contain"
        />
      ) : null}

      {result ? (
        <Card testID="receipt-scanner-result" style={styles.resultCard}>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultCategory}>
            Danh muc goi y: {result.suggestedCategory}
          </Text>

          {result.items.map((item, idx) => (
            <View key={`${item.name}-${idx}`} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tong cong</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(result.total)}
            </Text>
          </View>

          <Button
            testID="receipt-scanner-confirm-btn"
            title="Tao khoan chi tu hoa don nay"
            onPress={handleConfirm}
            style={styles.confirmBtn}
          />
        </Card>
      ) : null}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
  },
  upsellBtn: {
    marginTop: 16,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  resultCard: {
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  itemName: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  confirmBtn: {
    marginTop: 16,
  },
});

export default ReceiptScannerScreen;

import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import LoadingOverlay from '../../components/LoadingOverlay';
import {useAuth} from '../../hooks/useAuth';
import {
  getNotificationPreference,
  upsertNotificationPreference,
} from '../../services/deviceToken';
import type {NotificationPreference} from '../../types/database';

type ToggleKey =
  | 'push_enabled'
  | 'payment_enabled'
  | 'issue_enabled'
  | 'borrow_enabled'
  | 'announcement_enabled';

const TOGGLES: Array<{key: ToggleKey; label: string; description: string}> = [
  {
    key: 'push_enabled',
    label: 'Push notification',
    description: 'Cho phep gui thong bao den thiet bi khi da cau hinh Firebase.',
  },
  {
    key: 'payment_enabled',
    label: 'Thanh toan',
    description: 'Nhac han, qua han va xac nhan thanh toan.',
  },
  {
    key: 'issue_enabled',
    label: 'Su co',
    description: 'Bao cao moi va cap nhat trang thai su co.',
  },
  {
    key: 'borrow_enabled',
    label: 'Muon do',
    description: 'Yeu cau muon, duyet, tra va qua han.',
  },
  {
    key: 'announcement_enabled',
    label: 'Thong bao chung',
    description: 'Thong bao tu chu nha hoac can ho.',
  },
];

const NotificationSettingsScreen: React.FC = () => {
  const {user} = useAuth();
  const [preference, setPreference] = useState<NotificationPreference | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.id) {
        return;
      }
      setLoading(true);
      try {
        const data = await getNotificationPreference(user.id);
        if (!cancelled) {
          setPreference(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleToggle = useCallback(
    async (key: ToggleKey, value: boolean) => {
      if (!user?.id || !preference) {
        return;
      }
      const next = {...preference, [key]: value};
      setPreference(next);
      setLoading(true);
      try {
        const saved = await upsertNotificationPreference(user.id, {
          [key]: value,
        });
        setPreference(saved);
      } finally {
        setLoading(false);
      }
    },
    [preference, user?.id],
  );

  return (
    <ScreenWrapper testID="notification-settings-screen">
      <LoadingOverlay visible={loading} />
      <Card style={styles.card}>
        {TOGGLES.map((item, index) => (
          <View key={item.key}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Switch
                testID={`notification-setting-${item.key}`}
                value={preference?.[item.key] ?? true}
                onValueChange={value => handleToggle(item.key, value)}
                trackColor={{false: '#CBD5E1', true: '#93C5FD'}}
                thumbColor={
                  preference?.[item.key] ?? true ? '#2563EB' : '#F1F5F9'
                }
              />
            </View>
            {index < TOGGLES.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});

export default NotificationSettingsScreen;

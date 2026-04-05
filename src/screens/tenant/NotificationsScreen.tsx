import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ScreenWrapper, EmptyState, LoadingOverlay} from '../../components';
import {useAuth} from '../../hooks/useAuth';
import {useAppSelector, useAppDispatch} from '../../store';
import {
  fetchNotificationsRequest,
  markAsReadRequest,
  markAllAsReadRequest,
} from '../../store/slices/notificationSlice';
import {formatRelativeTime} from '../../utils/formatters';
import type {Notification} from '../../types/database';

const TYPE_ICONS: Record<string, string> = {
  payment: '💰',
  borrow: '📦',
  issue: '⚠️',
  general: '🔔',
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {user} = useAuth();
  const {notifications, loading} = useAppSelector(
    state => state.notification,
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotificationsRequest({userId: user.id}));
    }
  }, [user?.id, dispatch]);

  const handleMarkAsRead = useCallback(
    (notif: Notification) => {
      if (!notif.is_read) {
        dispatch(markAsReadRequest({id: notif.id}));
      }
    },
    [dispatch],
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (user?.id) {
      dispatch(markAllAsReadRequest({userId: user.id}));
    }
  }, [user?.id, dispatch]);

  // Set header button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7}>
          <Text style={styles.headerBtn}>Danh dau tat ca da doc</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleMarkAllAsRead]);

  const renderItem = ({item}: {item: Notification}) => {
    const icon = TYPE_ICONS[item.type] ?? TYPE_ICONS.general;

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.is_read && styles.notifItemUnread]}
        onPress={() => handleMarkAsRead(item)}
        activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text
              style={[
                styles.notifTitle,
                !item.is_read && styles.notifTitleUnread,
              ]}
              numberOfLines={1}>
              {item.title}
            </Text>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>

          {item.body && (
            <Text style={styles.notifBody} numberOfLines={2}>
              {item.body}
            </Text>
          )}

          <Text style={styles.notifTime}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          notifications.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="Khong co thong bao"
            description="Ban chua co thong bao nao"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBtn: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
  },
  notifItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifItemUnread: {
    backgroundColor: '#F8FAFF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notifBody: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default NotificationsScreen;

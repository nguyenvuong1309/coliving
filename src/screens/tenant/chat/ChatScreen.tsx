import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {PressableOpacity, Avatar, EmptyState} from '../../../components';
import {useAuth, useApartment} from '../../../hooks';
import { useAppSelector, useAppDispatch } from '../../../store';
import {
  fetchMessagesRequest,
  sendMessageRequest,
  addIncomingMessage,
  clearMessages,
} from '../../../store/slices/chatSlice';
import {subscribeToApartmentMessages, unsubscribe} from '../../../services';
import {formatRelativeTime} from '../../../utils';
import type {Message} from '../../../types';

const ChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { apartment, members } = useApartment();
  const { messages, sending } = useAppSelector(state => state.chat);
  const [text, setText] = useState('');
  const channelRef = useRef<ReturnType<
    typeof subscribeToApartmentMessages
  > | null>(null);

  const apartmentId = apartment?.id;

  useEffect(() => {
    if (!apartmentId) {
      return;
    }
    dispatch(fetchMessagesRequest({ apartmentId }));

    channelRef.current = subscribeToApartmentMessages(apartmentId, message => {
      dispatch(addIncomingMessage(message));
    });

    return () => {
      unsubscribe(channelRef.current);
      channelRef.current = null;
      dispatch(clearMessages());
    };
  }, [apartmentId, dispatch]);

  const getMember = useCallback(
    (userId: string) => members.find(m => m.user_id === userId),
    [members],
  );

  const handleSend = useCallback(() => {
    const body = text.trim();
    if (!body || !apartmentId || !user?.id) {
      return;
    }
    dispatch(
      sendMessageRequest({
        apartment_id: apartmentId,
        sender_id: user.id,
        body,
      }),
    );
    setText('');
  }, [text, apartmentId, user?.id, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      const isMine = item.sender_id === user?.id;
      const member = getMember(item.sender_id);
      const name = member?.profile?.full_name ?? 'Khong ro';
      const avatarUrl = member?.profile?.avatar_url ?? null;

      return (
        <View
          testID={`chat-message-${item.id}`}
          style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}
        >
          {!isMine && (
            <View style={styles.avatarWrap}>
              <Avatar uri={avatarUrl} name={name} size={32} />
            </View>
          )}
          <View style={styles.bubbleWrap}>
            {!isMine && <Text style={styles.senderName}>{name}</Text>}
            <View
              style={[
                styles.bubble,
                isMine ? styles.bubbleMine : styles.bubbleOther,
              ]}
            >
              <Text style={isMine ? styles.bodyMine : styles.bodyOther}>
                {item.body}
              </Text>
            </View>
            <Text style={[styles.time, isMine && styles.timeMine]}>
              {formatRelativeTime(item.created_at)}
            </Text>
          </View>
        </View>
      );
    },
    [user?.id, getMember],
  );

  const contentStyle = useMemo(
    () => (messages.length === 0 ? styles.emptyContainer : styles.listContent),
    [messages.length],
  );

  return (
    <SafeAreaView
      testID="tenant-chat-screen"
      style={styles.container}
      edges={['left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          inverted={messages.length > 0}
          contentContainerStyle={contentStyle}
          ListEmptyComponent={
            <EmptyState
              title="Chua co tin nhan"
              description="Hay gui tin nhan dau tien cho can ho cua ban"
            />
          }
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputBar}>
          <TextInput
            testID="chat-input"
            style={styles.input}
            placeholder="Nhap tin nhan..."
            placeholderTextColor="#94A3B8"
            value={text}
            onChangeText={setText}
            multiline
          />
          <PressableOpacity
            testID="chat-send-button"
            style={[
              styles.sendButton,
              (!text.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Gui</Text>
          </PressableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatarWrap: {
    marginRight: 8,
  },
  bubbleWrap: {
    maxWidth: '78%',
  },
  senderName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  bodyMine: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  bodyOther: {
    fontSize: 15,
    color: '#1E293B',
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginLeft: 4,
  },
  timeMine: {
    textAlign: 'right',
    marginRight: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ChatScreen;

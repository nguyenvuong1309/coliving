import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getMessages, sendMessage } from '../../services';
import type { Message, MessageInsert } from '../../types';

type SendMessagePayload = Omit<MessageInsert, 'id' | 'created_at'>;

interface ChatState {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

// Messages duoc luu theo thu tu moi nhat truoc (created_at desc) de hop voi
// inverted FlatList o ChatScreen.
function sortByNewestFirst(messages: Message[]): Message[] {
  return [...messages].sort((a, b) =>
    a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0,
  );
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchMessagesRequest(
      state,
      _action: PayloadAction<{ apartmentId: string; limit?: number }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    sendMessageRequest(state, _action: PayloadAction<SendMessagePayload>) {
      state.sending = true;
      state.error = null;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = sortByNewestFirst(action.payload);
      state.loading = false;
    },
    addIncomingMessage(state, action: PayloadAction<Message>) {
      if (state.messages.some(m => m.id === action.payload.id)) {
        return;
      }
      state.messages = sortByNewestFirst([action.payload, ...state.messages]);
    },
    setSending(state, action: PayloadAction<boolean>) {
      state.sending = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
      state.sending = false;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const {
  fetchMessagesRequest,
  sendMessageRequest,
  setMessages,
  addIncomingMessage,
  setSending,
  setLoading,
  setError,
  clearMessages,
} = chatSlice.actions;

// Sagas

function* handleFetchMessages(
  action: ReturnType<typeof fetchMessagesRequest>,
): Generator<any, void, any> {
  try {
    const messages = yield call(
      getMessages,
      action.payload.apartmentId,
      action.payload.limit,
    );
    yield put(setMessages(messages));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch messages'));
  }
}

function* handleSendMessage(
  action: ReturnType<typeof sendMessageRequest>,
): Generator<any, void, any> {
  try {
    const message = yield call(sendMessage, action.payload);
    // Realtime co the chua kip ban ve, them ngay de phan hoi tuc thi.
    yield put(addIncomingMessage(message));
    yield put(setSending(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to send message'));
  }
}

export function* chatSaga() {
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeLatest(sendMessageRequest.type, handleSendMessage);
}

export default chatSlice.reducer;

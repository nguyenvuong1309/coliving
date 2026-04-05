import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  fetchUnreadCount,
} from '../../services/notification';
import type {Notification} from '../../types/database';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    fetchNotificationsRequest(
      state,
      _action: PayloadAction<{userId: string}>,
    ) {
      state.loading = true;
    },
    markAsReadRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
    },
    markAllAsReadRequest(state, _action: PayloadAction<{userId: string}>) {
      state.loading = true;
    },
    fetchUnreadCountRequest(
      state,
      _action: PayloadAction<{userId: string}>,
    ) {
      state.loading = true;
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.loading = false;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
      state.loading = false;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications = [action.payload, ...state.notifications];
      state.unreadCount += 1;
    },
  },
});

export const {
  fetchNotificationsRequest,
  markAsReadRequest,
  markAllAsReadRequest,
  fetchUnreadCountRequest,
  setNotifications,
  setUnreadCount,
  addNotification,
} = notificationSlice.actions;

// Sagas

function* handleFetchNotifications(
  action: ReturnType<typeof fetchNotificationsRequest>,
): Generator<any, void, any> {
  try {
    const notifications = yield call(
      fetchNotifications,
      action.payload.userId,
    );
    yield put(setNotifications(notifications));
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error.message);
    yield put(setNotifications([]));
  }
}

function* handleMarkAsRead(
  action: ReturnType<typeof markAsReadRequest>,
): Generator<any, void, any> {
  try {
    yield call(markAsRead, action.payload.id);
  } catch (error: any) {
    console.error('Failed to mark as read:', error.message);
  }
}

function* handleMarkAllAsRead(
  action: ReturnType<typeof markAllAsReadRequest>,
): Generator<any, void, any> {
  try {
    yield call(markAllAsRead, action.payload.userId);
    yield put(setUnreadCount(0));
  } catch (error: any) {
    console.error('Failed to mark all as read:', error.message);
  }
}

function* handleFetchUnreadCount(
  action: ReturnType<typeof fetchUnreadCountRequest>,
): Generator<any, void, any> {
  try {
    const count = yield call(fetchUnreadCount, action.payload.userId);
    yield put(setUnreadCount(count));
  } catch (error: any) {
    console.error('Failed to fetch unread count:', error.message);
    yield put(setUnreadCount(0));
  }
}

export function* notificationSaga() {
  yield takeLatest(
    fetchNotificationsRequest.type,
    handleFetchNotifications,
  );
  yield takeLatest(markAsReadRequest.type, handleMarkAsRead);
  yield takeLatest(markAllAsReadRequest.type, handleMarkAllAsRead);
  yield takeLatest(fetchUnreadCountRequest.type, handleFetchUnreadCount);
}

export default notificationSlice.reducer;

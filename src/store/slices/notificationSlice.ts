import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../../services/notification';
import type {Notification} from '../../types/database';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
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
      state.unreadCount = action.payload.filter(item => !item.is_read).length;
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
    markLocalAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        item => item.id === action.payload,
      );
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.loading = false;
    },
    markAllLocalAsRead(state) {
      state.notifications = state.notifications.map(item => ({
        ...item,
        is_read: true,
      }));
      state.unreadCount = 0;
      state.loading = false;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
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
  markLocalAsRead,
  markAllLocalAsRead,
  setError,
} = notificationSlice.actions;

// Sagas

function* handleFetchNotifications(
  action: ReturnType<typeof fetchNotificationsRequest>,
): Generator<any, void, any> {
  try {
    const notifications = yield call(
      getNotifications,
      action.payload.userId,
    );
    yield put(setNotifications(notifications));
  } catch (error: any) {
    yield put(setNotifications([]));
    yield put(setError(error?.message ?? 'Failed to fetch notifications'));
  }
}

function* handleMarkAsRead(
  action: ReturnType<typeof markAsReadRequest>,
): Generator<any, void, any> {
  try {
    yield call(markAsRead, action.payload.id);
    yield put(markLocalAsRead(action.payload.id));
  } catch (error: any) {
    yield put(setError(error?.message ?? 'Failed to mark as read'));
  }
}

function* handleMarkAllAsRead(
  action: ReturnType<typeof markAllAsReadRequest>,
): Generator<any, void, any> {
  try {
    yield call(markAllAsRead, action.payload.userId);
    yield put(markAllLocalAsRead());
  } catch (error: any) {
    yield put(setError(error?.message ?? 'Failed to mark all as read'));
  }
}

function* handleFetchUnreadCount(
  action: ReturnType<typeof fetchUnreadCountRequest>,
): Generator<any, void, any> {
  try {
    const count = yield call(getUnreadCount, action.payload.userId);
    yield put(setUnreadCount(count));
  } catch (error: any) {
    yield put(setUnreadCount(0));
    yield put(setError(error?.message ?? 'Failed to fetch unread count'));
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

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  fetchIssues,
  createIssue,
  updateIssueStatus,
  fetchIssueDetail,
} from '../../services/issue';
import type {Issue} from '../../types/database';

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  loading: boolean;
  error: string | null;
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  loading: false,
  error: null,
};

const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    fetchIssuesRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    createIssueRequest(
      state,
      _action: PayloadAction<{
        title: string;
        description: string;
        apartmentId: string;
        reporterId: string;
      }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    updateIssueStatusRequest(
      state,
      _action: PayloadAction<{id: string; status: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchIssueDetailRequest(state, _action: PayloadAction<{id: string}>) {
      state.loading = true;
      state.error = null;
    },
    setIssues(state, action: PayloadAction<Issue[]>) {
      state.issues = action.payload;
    },
    setCurrentIssue(state, action: PayloadAction<Issue | null>) {
      state.currentIssue = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  fetchIssuesRequest,
  createIssueRequest,
  updateIssueStatusRequest,
  fetchIssueDetailRequest,
  setIssues,
  setCurrentIssue,
  setLoading,
  setError,
} = issueSlice.actions;

// Sagas

function* handleFetchIssues(
  action: ReturnType<typeof fetchIssuesRequest>,
): Generator<any, void, any> {
  try {
    const issues = yield call(fetchIssues, action.payload.apartmentId);
    yield put(setIssues(issues));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch issues'));
  }
}

function* handleCreateIssue(
  action: ReturnType<typeof createIssueRequest>,
): Generator<any, void, any> {
  try {
    const issue = yield call(createIssue, action.payload);
    yield put(setCurrentIssue(issue));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create issue'));
  }
}

function* handleUpdateIssueStatus(
  action: ReturnType<typeof updateIssueStatusRequest>,
): Generator<any, void, any> {
  try {
    const issue = yield call(
      updateIssueStatus,
      action.payload.id,
      action.payload.status,
    );
    yield put(setCurrentIssue(issue));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to update issue status'));
  }
}

function* handleFetchIssueDetail(
  action: ReturnType<typeof fetchIssueDetailRequest>,
): Generator<any, void, any> {
  try {
    const issue = yield call(fetchIssueDetail, action.payload.id);
    yield put(setCurrentIssue(issue));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch issue detail'));
  }
}

export function* issueSaga() {
  yield takeLatest(fetchIssuesRequest.type, handleFetchIssues);
  yield takeLatest(createIssueRequest.type, handleCreateIssue);
  yield takeLatest(updateIssueStatusRequest.type, handleUpdateIssueStatus);
  yield takeLatest(fetchIssueDetailRequest.type, handleFetchIssueDetail);
}

export default issueSlice.reducer;

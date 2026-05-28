import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  getIssues,
  createIssue,
  updateIssueStatus,
  getIssue,
  addIssueImages,
} from '../../services/issue';
import {uploadImage, getImageUrl} from '../../services/storage';
import type {Issue, IssueInsert} from '../../types/database';

type IssueStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'reopened';

type CreateIssuePayload = Omit<
  IssueInsert,
  'id' | 'created_at' | 'updated_at' | 'status'
> & {
  imageUris?: string[];
};

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
      _action: PayloadAction<CreateIssuePayload>,
    ) {
      state.loading = true;
      state.error = null;
    },
    updateIssueStatusRequest(
      state,
      _action: PayloadAction<{id: string; status: IssueStatus; note?: string}>,
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
    const issues = yield call(getIssues, action.payload.apartmentId);
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
    const {imageUris, ...issueData} = action.payload;
    const issue = yield call(createIssue, issueData);

    if (issue?.id && imageUris && imageUris.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${issue.id}/${Date.now()}-${i}.${ext}`;
        yield call(uploadImage, 'issue-images', path, {
          uri,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          name: path.split('/').pop()!,
        });
        urls.push(getImageUrl('issue-images', path));
      }
      if (urls.length > 0) {
        yield call(addIssueImages, issue.id, urls);
      }
    }

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
      action.payload.note,
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
    const issue = yield call(getIssue, action.payload.id);
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

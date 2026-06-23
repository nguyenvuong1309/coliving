import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {call, put, takeLatest} from 'redux-saga/effects';
import {
  createChore,
  getChores,
  getAssignments,
  createAssignment,
  completeAssignment,
  getLeaderboard,
  createNotification,
} from '../../services';
import type {
  Chore,
  ChoreInsert,
  ChoreAssignment,
  ChoreAssignmentInsert,
  LeaderboardEntry,
} from '../../types';

type CreateChorePayload = Omit<
  ChoreInsert,
  'id' | 'created_at' | 'updated_at'
>;

type CreateAssignmentPayload = Omit<
  ChoreAssignmentInsert,
  'id' | 'created_at'
>;

interface ChoreState {
  chores: Chore[];
  assignments: ChoreAssignment[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: ChoreState = {
  chores: [],
  assignments: [],
  leaderboard: [],
  loading: false,
  error: null,
};

const choreSlice = createSlice({
  name: 'chore',
  initialState,
  reducers: {
    fetchChoresRequest(state, _action: PayloadAction<{apartmentId: string}>) {
      state.loading = true;
      state.error = null;
    },
    createChoreRequest(
      state,
      _action: PayloadAction<{
        chore: CreateChorePayload;
        assignments?: CreateAssignmentPayload[];
      }>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchAssignmentsRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    completeAssignmentRequest(
      state,
      _action: PayloadAction<{id: string; apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchLeaderboardRequest(
      state,
      _action: PayloadAction<{apartmentId: string}>,
    ) {
      state.loading = true;
      state.error = null;
    },
    setChores(state, action: PayloadAction<Chore[]>) {
      state.chores = action.payload;
    },
    setAssignments(state, action: PayloadAction<ChoreAssignment[]>) {
      state.assignments = action.payload;
    },
    setLeaderboard(state, action: PayloadAction<LeaderboardEntry[]>) {
      state.leaderboard = action.payload;
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
  fetchChoresRequest,
  createChoreRequest,
  fetchAssignmentsRequest,
  completeAssignmentRequest,
  fetchLeaderboardRequest,
  setChores,
  setAssignments,
  setLeaderboard,
  setLoading,
  setError,
} = choreSlice.actions;

// Sagas

function* handleFetchChores(
  action: ReturnType<typeof fetchChoresRequest>,
): Generator<any, void, any> {
  try {
    const chores = yield call(getChores, action.payload.apartmentId);
    yield put(setChores(chores));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch chores'));
  }
}

function* handleCreateChore(
  action: ReturnType<typeof createChoreRequest>,
): Generator<any, void, any> {
  try {
    const chore = yield call(createChore, action.payload.chore);

    const assignmentInputs = action.payload.assignments ?? [];
    for (const input of assignmentInputs) {
      const assignment = yield call(createAssignment, {
        ...input,
        chore_id: input.chore_id || chore.id,
      });
      try {
        yield call(createNotification, {
          user_id: assignment.assignee_id,
          apartment_id: chore.apartment_id,
          type: 'announcement',
          title: 'Ban duoc giao mot viec nha moi',
          body: `Viec: ${chore.title} (+${chore.points} diem).`,
          data: {
            route: 'ChoreBoard',
            entityType: 'chore',
            entityId: chore.id,
          },
        });
      } catch {
        // Notification delivery must not block chore creation.
      }
    }

    const chores = yield call(getChores, chore.apartment_id);
    yield put(setChores(chores));
    const assignments = yield call(getAssignments, chore.apartment_id);
    yield put(setAssignments(assignments));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to create chore'));
  }
}

function* handleFetchAssignments(
  action: ReturnType<typeof fetchAssignmentsRequest>,
): Generator<any, void, any> {
  try {
    const assignments = yield call(getAssignments, action.payload.apartmentId);
    yield put(setAssignments(assignments));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch assignments'));
  }
}

function* handleCompleteAssignment(
  action: ReturnType<typeof completeAssignmentRequest>,
): Generator<any, void, any> {
  try {
    yield call(completeAssignment, action.payload.id);
    const assignments = yield call(
      getAssignments,
      action.payload.apartmentId,
    );
    yield put(setAssignments(assignments));
    const leaderboard = yield call(
      getLeaderboard,
      action.payload.apartmentId,
    );
    yield put(setLeaderboard(leaderboard));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to complete assignment'));
  }
}

function* handleFetchLeaderboard(
  action: ReturnType<typeof fetchLeaderboardRequest>,
): Generator<any, void, any> {
  try {
    const leaderboard = yield call(
      getLeaderboard,
      action.payload.apartmentId,
    );
    yield put(setLeaderboard(leaderboard));
    yield put(setLoading(false));
  } catch (error: any) {
    yield put(setError(error.message ?? 'Failed to fetch leaderboard'));
  }
}

export function* choreSaga() {
  yield takeLatest(fetchChoresRequest.type, handleFetchChores);
  yield takeLatest(createChoreRequest.type, handleCreateChore);
  yield takeLatest(fetchAssignmentsRequest.type, handleFetchAssignments);
  yield takeLatest(completeAssignmentRequest.type, handleCompleteAssignment);
  yield takeLatest(fetchLeaderboardRequest.type, handleFetchLeaderboard);
}

export default choreSlice.reducer;

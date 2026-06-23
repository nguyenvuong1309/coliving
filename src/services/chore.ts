import {supabase} from '../config/supabase';
import {isE2EMode} from '../e2e/fakeBackend';
import type {
  Chore,
  ChoreInsert,
  ChoreAssignment,
  ChoreAssignmentInsert,
  LeaderboardEntry,
} from '../types';

const ASSIGNMENT_SELECT =
  '*, chore:chore_id(*), assignee:assignee_id(id, full_name, avatar_url, role)';

export async function createChore(
  data: Omit<ChoreInsert, 'id' | 'created_at' | 'updated_at'>,
): Promise<Chore> {
  if (isE2EMode) {
    const now = new Date().toISOString();
    return {
      id: `e2e-chore-${Date.now()}`,
      recurrence: 'once',
      points: 10,
      ...data,
      created_at: now,
      updated_at: now,
    } as Chore;
  }

  const {data: chore, error} = await supabase
    .from('chores')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return chore as Chore;
}

export async function getChores(apartmentId: string): Promise<Chore[]> {
  if (isE2EMode) {
    return [];
  }

  const {data, error} = await supabase
    .from('chores')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return (data ?? []) as Chore[];
}

export async function getAssignments(
  apartmentId: string,
): Promise<ChoreAssignment[]> {
  if (isE2EMode) {
    return [];
  }

  // Lay id cac chore cua can ho roi lay assignment cua chung.
  const {data: chores, error: choreError} = await supabase
    .from('chores')
    .select('id')
    .eq('apartment_id', apartmentId);

  if (choreError) {
    throw choreError;
  }

  const choreIds = (chores ?? []).map((c: {id: string}) => c.id);
  if (choreIds.length === 0) {
    return [];
  }

  const {data, error} = await supabase
    .from('chore_assignments')
    .select(ASSIGNMENT_SELECT)
    .in('chore_id', choreIds)
    .order('due_date', {ascending: true, nullsFirst: false})
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return (data ?? []) as ChoreAssignment[];
}

export async function createAssignment(
  data: Omit<ChoreAssignmentInsert, 'id' | 'created_at'>,
): Promise<ChoreAssignment> {
  if (isE2EMode) {
    return {
      id: `e2e-assign-${Date.now()}`,
      status: 'pending',
      completed_at: null,
      points_awarded: 0,
      due_date: null,
      ...data,
      created_at: new Date().toISOString(),
    } as ChoreAssignment;
  }

  const {data: created, error} = await supabase
    .from('chore_assignments')
    .insert(data)
    .select(ASSIGNMENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return created as ChoreAssignment;
}

export async function completeAssignment(
  id: string,
): Promise<ChoreAssignment> {
  if (isE2EMode) {
    return {
      id,
      chore_id: '',
      assignee_id: '',
      due_date: null,
      status: 'done',
      completed_at: new Date().toISOString(),
      points_awarded: 10,
      created_at: new Date().toISOString(),
    } as ChoreAssignment;
  }

  // Lay so diem cua chore de awarded.
  const {data: assignment, error: fetchError} = await supabase
    .from('chore_assignments')
    .select('id, chore:chore_id(points)')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const points =
    ((assignment as any)?.chore?.points as number | undefined) ?? 0;

  const {data, error} = await supabase
    .from('chore_assignments')
    .update({
      status: 'done',
      completed_at: new Date().toISOString(),
      points_awarded: points,
    })
    .eq('id', id)
    .select(ASSIGNMENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data as ChoreAssignment;
}

export async function getLeaderboard(
  apartmentId: string,
): Promise<LeaderboardEntry[]> {
  const assignments = await getAssignments(apartmentId);

  const byAssignee = new Map<string, LeaderboardEntry>();
  for (const a of assignments) {
    if (a.status !== 'done') {
      continue;
    }
    const existing = byAssignee.get(a.assignee_id);
    if (existing) {
      existing.total_points += a.points_awarded;
      existing.done_count += 1;
    } else {
      byAssignee.set(a.assignee_id, {
        assignee_id: a.assignee_id,
        full_name: a.assignee?.full_name ?? null,
        avatar_url: a.assignee?.avatar_url ?? null,
        total_points: a.points_awarded,
        done_count: 1,
      });
    }
  }

  return Array.from(byAssignee.values()).sort(
    (x, y) => y.total_points - x.total_points,
  );
}

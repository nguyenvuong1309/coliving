// Tinh nang 3: Viec nha + Gamification
// Types tu dinh nghia (khong dung database.ts vi migration 0007 chua sinh type).

export type ChoreRecurrence = 'once' | 'daily' | 'weekly' | 'monthly';

export type ChoreAssignmentStatus = 'pending' | 'done' | 'skipped';

export interface Chore {
  id: string;
  apartment_id: string;
  title: string;
  recurrence: ChoreRecurrence;
  points: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChoreInsert {
  id?: string;
  apartment_id: string;
  title: string;
  recurrence?: ChoreRecurrence;
  points?: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChoreAssignment {
  id: string;
  chore_id: string;
  assignee_id: string;
  due_date: string | null;
  status: ChoreAssignmentStatus;
  completed_at: string | null;
  points_awarded: number;
  created_at: string;
  // Quan he (khi join):
  chore?: Chore | null;
  assignee?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role?: string | null;
  } | null;
}

export interface ChoreAssignmentInsert {
  id?: string;
  chore_id: string;
  assignee_id: string;
  due_date?: string | null;
  status?: ChoreAssignmentStatus;
  completed_at?: string | null;
  points_awarded?: number;
  created_at?: string;
}

export interface LeaderboardEntry {
  assignee_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  done_count: number;
}

// Thuat toan xoay vong nguoi duoc giao viec nha (round-robin).
import type {ChoreAssignmentInsert} from '../types';

export interface RotationMember {
  user_id: string;
}

export interface RotationChore {
  id: string;
}

/**
 * Sinh goi y gan viec theo kieu round-robin.
 * Moi chore[i] duoc gan cho member[(startIndex + i) % members.length].
 *
 * @param members  Danh sach thanh vien can ho (theo thu tu xoay vong)
 * @param chores   Danh sach viec nha can gan
 * @param startIndex  Vi tri bat dau trong danh sach members (default 0)
 * @param dueDate  due_date gan cho cac assignment (optional)
 */
export function rotateAssignees(
  members: RotationMember[],
  chores: RotationChore[],
  startIndex = 0,
  dueDate?: string | null,
): Array<Pick<ChoreAssignmentInsert, 'chore_id' | 'assignee_id' | 'due_date'>> {
  if (members.length === 0 || chores.length === 0) {
    return [];
  }

  const n = members.length;
  const normalizedStart = ((startIndex % n) + n) % n;

  return chores.map((chore, i) => {
    const memberIndex = (normalizedStart + i) % n;
    return {
      chore_id: chore.id,
      assignee_id: members[memberIndex].user_id,
      due_date: dueDate ?? null,
    };
  });
}

import {supabase} from '../config/supabase';
import type {IssueInsert} from '../types/database';

export async function createIssue(
  data: Omit<IssueInsert, 'id' | 'created_at' | 'updated_at'>,
) {
  const {data: issue, error} = await supabase
    .from('issues')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return issue;
}

export async function getIssues(apartmentId: string) {
  const {data, error} = await supabase
    .from('issues')
    .select('*, reporter:reporter_id(id, full_name, avatar_url)')
    .eq('apartment_id', apartmentId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return data;
}

export async function getIssue(id: string) {
  const {data, error} = await supabase
    .from('issues')
    .select(
      '*, reporter:reporter_id(id, full_name, avatar_url), issue_images(*)',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateIssueStatus(
  id: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened',
  note?: string,
) {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (note !== undefined) {
    // Use landlord_note for status changes by landlord, or resolution_note for resolved
    if (status === 'resolved' || status === 'closed') {
      updates.resolution_note = note;
    } else {
      updates.landlord_note = note;
    }
  }

  const {data, error} = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addIssueImages(issueId: string, urls: string[]) {
  const rows = urls.map(url => ({
    issue_id: issueId,
    image_url: url,
  }));

  const {data, error} = await supabase
    .from('issue_images')
    .insert(rows)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

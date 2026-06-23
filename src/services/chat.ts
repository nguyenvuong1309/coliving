import { supabase } from '../config/supabase';
import { isE2EMode } from '../e2e/fakeBackend';
import type { Message, MessageInsert } from '../types';

type RealtimeChannel = ReturnType<typeof supabase.channel>;

export async function sendMessage(
  data: Omit<MessageInsert, 'id' | 'created_at'>,
): Promise<Message> {
  if (isE2EMode) {
    return {
      id: `e2e-${Date.now()}`,
      apartment_id: data.apartment_id,
      sender_id: data.sender_id,
      body: data.body,
      attachment_url: data.attachment_url ?? null,
      reply_to: data.reply_to ?? null,
      entity_type: data.entity_type ?? null,
      entity_id: data.entity_id ?? null,
      created_at: new Date().toISOString(),
    };
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return message as Message;
}

export async function getMessages(
  apartmentId: string,
  limit = 50,
): Promise<Message[]> {
  if (isE2EMode) {
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as Message[];
}

export async function markRead(
  messageId: string,
  userId: string,
): Promise<void> {
  if (isE2EMode) {
    return;
  }

  const { error } = await supabase
    .from('message_reads')
    .upsert(
      { message_id: messageId, user_id: userId, read_at: new Date().toISOString() },
      { onConflict: 'message_id,user_id' },
    );

  if (error) {
    throw error;
  }
}

export function subscribeToApartmentMessages(
  apartmentId: string,
  onMessage: (message: Message) => void,
): RealtimeChannel | null {
  if (isE2EMode) {
    return null;
  }

  const channel = supabase
    .channel(`apartment:${apartmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `apartment_id=eq.${apartmentId}`,
      },
      payload => {
        onMessage(payload.new as Message);
      },
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel | null): void {
  if (!channel) {
    return;
  }
  supabase.removeChannel(channel);
}

// Chat theo can ho - kieu du lieu cho tin nhan nhom.
// Khong dung database.ts (tach rieng de tranh xung dot voi cac agent khac).

export type MessageEntityType = 'borrow' | 'issue' | 'payment' | 'expense';

export interface Message {
  id: string;
  apartment_id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  reply_to: string | null;
  entity_type: MessageEntityType | null;
  entity_id: string | null;
  created_at: string;
}

export interface MessageInsert {
  id?: string;
  apartment_id: string;
  sender_id: string;
  body: string;
  attachment_url?: string | null;
  reply_to?: string | null;
  entity_type?: MessageEntityType | null;
  entity_id?: string | null;
  created_at?: string;
}

export interface MessageRead {
  message_id: string;
  user_id: string;
  read_at: string;
}

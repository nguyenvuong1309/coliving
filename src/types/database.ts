export type Json =
  | string
  | number
  | boolean
  | null
  | {[key: string]: Json | undefined}
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: 'tenant' | 'landlord';
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          role: 'tenant' | 'landlord';
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'tenant' | 'landlord';
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      apartments: {
        Row: {
          id: string;
          landlord_id: string;
          name: string;
          address: string;
          num_rooms: number;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          name: string;
          address: string;
          num_rooms: number;
          invite_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          name?: string;
          address?: string;
          num_rooms?: number;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      apartment_members: {
        Row: {
          id: string;
          apartment_id: string;
          user_id: string;
          room_name: string | null;
          rent_amount: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          user_id: string;
          room_name?: string | null;
          rent_amount: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          user_id?: string;
          room_name?: string | null;
          rent_amount?: number;
          joined_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          apartment_id: string;
          owner_id: string | null;
          name: string;
          category: string | null;
          location: string | null;
          condition: 'good' | 'fair' | 'poor';
          image_url: string | null;
          is_borrowable: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          owner_id?: string | null;
          name: string;
          category?: string | null;
          location?: string | null;
          condition: 'good' | 'fair' | 'poor';
          image_url?: string | null;
          is_borrowable: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          owner_id?: string | null;
          name?: string;
          category?: string | null;
          location?: string | null;
          condition?: 'good' | 'fair' | 'poor';
          image_url?: string | null;
          is_borrowable?: boolean;
          created_at?: string;
        };
      };
      borrow_requests: {
        Row: {
          id: string;
          apartment_id: string;
          asset_id: string;
          borrower_id: string;
          lender_id: string;
          status:
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'in_use'
            | 'return_requested'
            | 'returned';
          note: string | null;
          borrow_duration: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          asset_id: string;
          borrower_id: string;
          lender_id: string;
          status?:
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'in_use'
            | 'return_requested'
            | 'returned';
          note?: string | null;
          borrow_duration?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          asset_id?: string;
          borrower_id?: string;
          lender_id?: string;
          status?:
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'in_use'
            | 'return_requested'
            | 'returned';
          note?: string | null;
          borrow_duration?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      issues: {
        Row: {
          id: string;
          apartment_id: string;
          reporter_id: string;
          category:
            | 'equipment'
            | 'noise'
            | 'hygiene'
            | 'security'
            | 'other';
          location: string;
          urgency: 'normal' | 'urgent';
          title: string;
          description: string | null;
          status:
            | 'open'
            | 'in_progress'
            | 'resolved'
            | 'closed'
            | 'reopened';
          landlord_note: string | null;
          resolution_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          reporter_id: string;
          category:
            | 'equipment'
            | 'noise'
            | 'hygiene'
            | 'security'
            | 'other';
          location: string;
          urgency: 'normal' | 'urgent';
          title: string;
          description?: string | null;
          status?:
            | 'open'
            | 'in_progress'
            | 'resolved'
            | 'closed'
            | 'reopened';
          landlord_note?: string | null;
          resolution_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          reporter_id?: string;
          category?:
            | 'equipment'
            | 'noise'
            | 'hygiene'
            | 'security'
            | 'other';
          location?: string;
          urgency?: 'normal' | 'urgent';
          title?: string;
          description?: string | null;
          status?:
            | 'open'
            | 'in_progress'
            | 'resolved'
            | 'closed'
            | 'reopened';
          landlord_note?: string | null;
          resolution_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      issue_images: {
        Row: {
          id: string;
          issue_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
      billing_periods: {
        Row: {
          id: string;
          apartment_id: string;
          month: number;
          year: number;
          due_date: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          apartment_id: string;
          month: number;
          year: number;
          due_date: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          apartment_id?: string;
          month?: number;
          year?: number;
          due_date?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          billing_period_id: string;
          tenant_id: string;
          amount: number;
          status: 'unpaid' | 'tenant_reported' | 'confirmed' | 'overdue';
          payment_method: 'bank_transfer' | 'cash' | null;
          receipt_image_url: string | null;
          paid_at: string | null;
          confirmed_at: string | null;
          confirmed_by: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          billing_period_id: string;
          tenant_id: string;
          amount: number;
          status?: 'unpaid' | 'tenant_reported' | 'confirmed' | 'overdue';
          payment_method?: 'bank_transfer' | 'cash' | null;
          receipt_image_url?: string | null;
          paid_at?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          billing_period_id?: string;
          tenant_id?: string;
          amount?: number;
          status?: 'unpaid' | 'tenant_reported' | 'confirmed' | 'overdue';
          payment_method?: 'bank_transfer' | 'cash' | null;
          receipt_image_url?: string | null;
          paid_at?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          apartment_id: string | null;
          type: string;
          title: string;
          body: string | null;
          data: Record<string, any>;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          apartment_id?: string | null;
          type: string;
          title: string;
          body?: string | null;
          data?: Record<string, any>;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          apartment_id?: string | null;
          type?: string;
          title?: string;
          body?: string | null;
          data?: Record<string, any>;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Apartment = Database['public']['Tables']['apartments']['Row'];
export type ApartmentInsert =
  Database['public']['Tables']['apartments']['Insert'];
export type ApartmentUpdate =
  Database['public']['Tables']['apartments']['Update'];

export type ApartmentMember =
  Database['public']['Tables']['apartment_members']['Row'];
export type ApartmentMemberInsert =
  Database['public']['Tables']['apartment_members']['Insert'];
export type ApartmentMemberUpdate =
  Database['public']['Tables']['apartment_members']['Update'];

export type Asset = Database['public']['Tables']['assets']['Row'];
export type AssetInsert = Database['public']['Tables']['assets']['Insert'];
export type AssetUpdate = Database['public']['Tables']['assets']['Update'];

export type BorrowRequest =
  Database['public']['Tables']['borrow_requests']['Row'];
export type BorrowRequestInsert =
  Database['public']['Tables']['borrow_requests']['Insert'];
export type BorrowRequestUpdate =
  Database['public']['Tables']['borrow_requests']['Update'];

export type Issue = Database['public']['Tables']['issues']['Row'];
export type IssueInsert = Database['public']['Tables']['issues']['Insert'];
export type IssueUpdate = Database['public']['Tables']['issues']['Update'];

export type IssueImage = Database['public']['Tables']['issue_images']['Row'];
export type IssueImageInsert =
  Database['public']['Tables']['issue_images']['Insert'];

export type BillingPeriod =
  Database['public']['Tables']['billing_periods']['Row'];
export type BillingPeriodInsert =
  Database['public']['Tables']['billing_periods']['Insert'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate =
  Database['public']['Tables']['notifications']['Update'];

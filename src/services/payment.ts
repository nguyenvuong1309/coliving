import {supabase} from '../config/supabase';
import type {Json, Payment} from '../types/database';
import {e2eBackend, isE2EMode} from '../e2e/fakeBackend';

export interface CreatePaymentRow {
  tenant_id: string;
  amount: number;
  rent_amount?: number | null;
  utility_total?: number;
  extra_charges?: Json;
}

function applyOverdueStatus<T extends Record<string, any>>(payment: T): T {
  const dueDate = payment.billing_periods?.due_date;
  if (!dueDate || payment.status !== 'unpaid') {
    return payment;
  }

  const now = new Date();
  const due = new Date(dueDate);
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < now) {
    return {...payment, status: 'overdue'};
  }

  return payment;
}

export async function createBillingPeriod(
  apartmentId: string,
  month: number,
  year: number,
  dueDate: string,
  createdBy: string,
  paymentRows?: CreatePaymentRow[],
) {
  if (isE2EMode) {
    return e2eBackend.createBillingPeriod(
      apartmentId,
      month,
      year,
      dueDate,
      createdBy,
      paymentRows,
    );
  }

  const {data: existing, error: existingError} = await supabase
    .from('billing_periods')
    .select('id')
    .eq('apartment_id', apartmentId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    throw new Error('Ky thu tien nay da ton tai');
  }

  if (new Date(dueDate).toString() === 'Invalid Date') {
    throw new Error('Han thanh toan khong hop le');
  }

  if (paymentRows?.some(row => row.amount <= 0)) {
    throw new Error('So tien thanh toan phai lon hon 0');
  }

  // Create the billing period
  const {data: billing, error: billingError} = await supabase
    .from('billing_periods')
    .insert({
      apartment_id: apartmentId,
      month,
      year,
      due_date: dueDate,
      created_by: createdBy,
    })
    .select()
    .single();

  if (billingError) {
    throw billingError;
  }

  let rows = paymentRows;

  if (!rows) {
    const {data: members, error: membersError} = await supabase
      .from('apartment_members')
      .select('user_id, rent_amount')
      .eq('apartment_id', apartmentId)
      .neq('user_id', createdBy);

    if (membersError) {
      throw membersError;
    }

    rows = (members ?? []).map(member => ({
      tenant_id: member.user_id,
      amount: member.rent_amount,
      rent_amount: member.rent_amount,
      utility_total: 0,
      extra_charges: [],
    }));
  }

  if (rows.length > 0) {
    const insertRows = rows.map(row => ({
      billing_period_id: billing.id,
      tenant_id: row.tenant_id,
      amount: row.amount,
      rent_amount: row.rent_amount ?? row.amount,
      utility_total: row.utility_total ?? 0,
      extra_charges: row.extra_charges ?? [],
    }));

    const {error: paymentsError} = await supabase
      .from('payments')
      .insert(insertRows);

    if (paymentsError) {
      await supabase.from('billing_periods').delete().eq('id', billing.id);
      throw paymentsError;
    }
  }

  return billing;
}

export async function getBillingPeriods(apartmentId: string) {
  if (isE2EMode) {
    return e2eBackend.getBillingPeriods(apartmentId);
  }

  const {data, error} = await supabase
    .from('billing_periods')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('year', {ascending: false})
    .order('month', {ascending: false});

  if (error) {
    throw error;
  }

  return data;
}

export async function getPayments(billingId: string) {
  if (isE2EMode) {
    return e2eBackend.getPayments(billingId);
  }

  const {data, error} = await supabase
    .from('payments')
    .select(
      '*, tenant:tenant_id(id, full_name, avatar_url), billing_periods:billing_period_id(*)',
    )
    .eq('billing_period_id', billingId)
    .order('created_at', {ascending: true});

  if (error) {
    throw error;
  }

  return (data ?? []).map(applyOverdueStatus) as Payment[];
}

export async function getPaymentsForApartment(apartmentId: string) {
  if (isE2EMode) {
    return e2eBackend.getPaymentsForApartment(apartmentId);
  }

  const {data, error} = await supabase
    .from('payments')
    .select(
      '*, tenant:tenant_id(id, full_name, avatar_url), billing_periods:billing_period_id!inner(*)',
    )
    .eq('billing_periods.apartment_id', apartmentId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return (data ?? []).map(applyOverdueStatus) as Payment[];
}

export async function getMyPayments(tenantId: string) {
  if (isE2EMode) {
    return e2eBackend.getMyPayments(tenantId);
  }

  const {data, error} = await supabase
    .from('payments')
    .select('*, billing_periods:billing_period_id(*)')
    .eq('tenant_id', tenantId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return (data ?? []).map(applyOverdueStatus) as Payment[];
}

export async function getPayment(id: string) {
  if (isE2EMode) {
    return e2eBackend.getPayment(id);
  }

  const {data, error} = await supabase
    .from('payments')
    .select(
      '*, tenant:tenant_id(id, full_name, avatar_url), billing_periods:billing_period_id(*)',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return applyOverdueStatus(data) as Payment;
}

export async function reportPayment(
  id: string,
  method: 'bank_transfer' | 'cash',
  receiptUrl?: string,
) {
  if (isE2EMode) {
    return e2eBackend.reportPayment(id, method, receiptUrl);
  }

  const updates: Record<string, any> = {
    status: 'tenant_reported',
    payment_method: method,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (receiptUrl) {
    updates.receipt_image_url = receiptUrl;
  }

  const {data, error} = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function confirmPayment(id: string, confirmedBy: string) {
  if (isE2EMode) {
    return e2eBackend.confirmPayment(id, confirmedBy);
  }

  const {data, error} = await supabase
    .from('payments')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: confirmedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function rejectPayment(id: string, note?: string) {
  if (isE2EMode) {
    return e2eBackend.rejectPayment(id, note);
  }

  const updates: Record<string, any> = {
    status: 'unpaid',
    paid_at: null,
    payment_method: null,
    receipt_image_url: null,
    updated_at: new Date().toISOString(),
  };
  if (note !== undefined) {
    updates.note = note;
  }
  const {data, error} = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

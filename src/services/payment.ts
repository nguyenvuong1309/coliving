import {supabase} from '../config/supabase';

export async function createBillingPeriod(
  apartmentId: string,
  month: number,
  year: number,
  dueDate: string,
  createdBy: string,
) {
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

  // Fetch all members of the apartment (excluding the landlord creating the billing)
  const {data: members, error: membersError} = await supabase
    .from('apartment_members')
    .select('user_id, rent_amount')
    .eq('apartment_id', apartmentId)
    .neq('user_id', createdBy);

  if (membersError) {
    throw membersError;
  }

  // Auto-create payment records for each tenant
  if (members && members.length > 0) {
    const paymentRows = members.map(member => ({
      billing_period_id: billing.id,
      tenant_id: member.user_id,
      amount: member.rent_amount,
    }));

    const {error: paymentsError} = await supabase
      .from('payments')
      .insert(paymentRows);

    if (paymentsError) {
      throw paymentsError;
    }
  }

  return billing;
}

export async function getBillingPeriods(apartmentId: string) {
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
  const {data, error} = await supabase
    .from('payments')
    .select('*, tenant:tenant_id(id, full_name, avatar_url)')
    .eq('billing_period_id', billingId)
    .order('created_at', {ascending: true});

  if (error) {
    throw error;
  }

  return data;
}

export async function getMyPayments(tenantId: string) {
  const {data, error} = await supabase
    .from('payments')
    .select('*, billing_periods:billing_period_id(*)')
    .eq('tenant_id', tenantId)
    .order('created_at', {ascending: false});

  if (error) {
    throw error;
  }

  return data;
}

export async function reportPayment(
  id: string,
  method: 'bank_transfer' | 'cash',
  receiptUrl?: string,
) {
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

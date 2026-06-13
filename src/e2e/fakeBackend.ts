import Config from 'react-native-config';
import type {
  ApartmentInsert,
  ApartmentUpdate,
  ApartmentMemberUpdate,
  AssetInsert,
  AssetUpdate,
  IssueInsert,
  Json,
  NotificationInsert,
  NotificationPreferenceUpdate,
  ProfileUpdate,
  UtilityConfigInsert,
  UtilityConfigUpdate,
} from '../types/database';

export const isE2EMode = Config.E2E_MODE === 'true';

export const E2E_ACCOUNTS = {
  tenant: {
    email: 'tenant@e2e.coliving.local',
    password: 'E2e123456!',
  },
  landlord: {
    email: 'landlord@e2e.coliving.local',
    password: 'E2e123456!',
  },
} as const;

const IDS = {
  landlord: '00000000-0000-4000-8000-000000000001',
  tenant: '00000000-0000-4000-8000-000000000002',
  roommate: '00000000-0000-4000-8000-000000000003',
  apartment: '10000000-0000-4000-8000-000000000001',
  apartment2: '10000000-0000-4000-8000-000000000002',
  landlordMember: '20000000-0000-4000-8000-000000000001',
  tenantMember: '20000000-0000-4000-8000-000000000002',
  roommateMember: '20000000-0000-4000-8000-000000000003',
  assetWasher: '30000000-0000-4000-8000-000000000001',
  assetDrill: '30000000-0000-4000-8000-000000000002',
  borrowPending: '40000000-0000-4000-8000-000000000001',
  borrowInUse: '40000000-0000-4000-8000-000000000002',
  borrowReturned: '40000000-0000-4000-8000-000000000003',
  issueOpen: '50000000-0000-4000-8000-000000000001',
  issueResolved: '50000000-0000-4000-8000-000000000002',
  billingCurrent: '60000000-0000-4000-8000-000000000001',
  billingPrevious: '60000000-0000-4000-8000-000000000002',
  paymentUnpaid: '70000000-0000-4000-8000-000000000001',
  paymentReported: '70000000-0000-4000-8000-000000000002',
  paymentConfirmed: '70000000-0000-4000-8000-000000000003',
  notificationIssue: '80000000-0000-4000-8000-000000000001',
  notificationPayment: '80000000-0000-4000-8000-000000000002',
} as const;

const now = () => new Date().toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function createInitialState() {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  const previousDate = new Date(currentYear, currentMonth - 2, 1);

  const profiles: any[] = [
    {
      id: IDS.landlord,
      full_name: 'E2E Chu Nha',
      email: E2E_ACCOUNTS.landlord.email,
      avatar_url: null,
      role: 'landlord',
      phone: '0901000001',
      created_at: daysAgo(365),
      updated_at: daysAgo(2),
    },
    {
      id: IDS.tenant,
      full_name: 'E2E Nguoi Thue',
      email: E2E_ACCOUNTS.tenant.email,
      avatar_url: null,
      role: 'tenant',
      phone: '0901000002',
      created_at: daysAgo(180),
      updated_at: daysAgo(1),
    },
    {
      id: IDS.roommate,
      full_name: 'E2E Ban Cung Phong',
      email: 'roommate@e2e.coliving.local',
      avatar_url: null,
      role: 'tenant',
      phone: '0901000003',
      created_at: daysAgo(120),
      updated_at: daysAgo(3),
    },
  ];

  const apartments: any[] = [
    {
      id: IDS.apartment,
      landlord_id: IDS.landlord,
      name: 'Can ho E2E',
      address: '123 Duong Kiem Thu, Quan 1',
      num_rooms: 4,
      invite_code: 'E2E12345',
      created_at: daysAgo(365),
      updated_at: daysAgo(2),
    },
    {
      id: IDS.apartment2,
      landlord_id: IDS.landlord,
      name: 'Can ho E2E Thu Hai',
      address: '456 Duong Tu Dong, Quan 3',
      num_rooms: 2,
      invite_code: 'E2E67890',
      created_at: daysAgo(90),
      updated_at: daysAgo(5),
    },
  ];

  const members: any[] = [
    {
      id: IDS.landlordMember,
      apartment_id: IDS.apartment,
      user_id: IDS.landlord,
      room_name: null,
      rent_amount: 0,
      joined_at: daysAgo(365),
    },
    {
      id: IDS.tenantMember,
      apartment_id: IDS.apartment,
      user_id: IDS.tenant,
      room_name: 'P101',
      rent_amount: 3500000,
      joined_at: daysAgo(180),
    },
    {
      id: IDS.roommateMember,
      apartment_id: IDS.apartment,
      user_id: IDS.roommate,
      room_name: 'P102',
      rent_amount: 3200000,
      joined_at: daysAgo(120),
    },
    {
      id: nextId('member'),
      apartment_id: IDS.apartment2,
      user_id: IDS.landlord,
      room_name: null,
      rent_amount: 0,
      joined_at: daysAgo(90),
    },
  ];

  const assets: any[] = [
    {
      id: IDS.assetWasher,
      apartment_id: IDS.apartment,
      owner_id: IDS.landlord,
      name: 'May giat E2E',
      category: 'Dien tu',
      location: 'Ban cong',
      condition: 'good',
      image_url: null,
      is_borrowable: true,
      created_at: daysAgo(40),
    },
    {
      id: IDS.assetDrill,
      apartment_id: IDS.apartment,
      owner_id: IDS.roommate,
      name: 'May khoan E2E',
      category: 'Khac',
      location: 'Kho',
      condition: 'fair',
      image_url: null,
      is_borrowable: true,
      created_at: daysAgo(25),
    },
  ];

  const borrowRequests: any[] = [
    {
      id: IDS.borrowPending,
      apartment_id: IDS.apartment,
      asset_id: IDS.assetWasher,
      borrower_id: IDS.tenant,
      lender_id: IDS.landlord,
      status: 'pending',
      note: 'Muon giat chan',
      borrow_duration: '2 ngay',
      due_date: daysAgo(-2),
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
    },
    {
      id: IDS.borrowInUse,
      apartment_id: IDS.apartment,
      asset_id: IDS.assetDrill,
      borrower_id: IDS.tenant,
      lender_id: IDS.roommate,
      status: 'in_use',
      note: 'Sua ke sach',
      borrow_duration: '1 ngay',
      due_date: daysAgo(-1),
      created_at: daysAgo(3),
      updated_at: daysAgo(2),
    },
    {
      id: IDS.borrowReturned,
      apartment_id: IDS.apartment,
      asset_id: IDS.assetDrill,
      borrower_id: IDS.roommate,
      lender_id: IDS.tenant,
      status: 'returned',
      note: null,
      borrow_duration: '3 gio',
      due_date: daysAgo(6),
      created_at: daysAgo(7),
      updated_at: daysAgo(6),
    },
  ];

  const issues: any[] = [
    {
      id: IDS.issueOpen,
      apartment_id: IDS.apartment,
      reporter_id: IDS.tenant,
      category: 'equipment',
      location: 'kitchen',
      urgency: 'urgent',
      title: 'Voi nuoc bi ro E2E',
      description: 'Nuoc ro lien tuc duoi bon rua.',
      status: 'open',
      landlord_note: null,
      resolution_note: null,
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
      issue_images: [],
    },
    {
      id: IDS.issueResolved,
      apartment_id: IDS.apartment,
      reporter_id: IDS.tenant,
      category: 'noise',
      location: 'living_room',
      urgency: 'normal',
      title: 'Quat keu lon E2E',
      description: 'Quat tran co tieng keu.',
      status: 'resolved',
      landlord_note: 'Da tiep nhan',
      resolution_note: 'Da thay vong bi',
      created_at: daysAgo(10),
      updated_at: daysAgo(2),
      issue_images: [],
    },
  ];

  const billingPeriods: any[] = [
    {
      id: IDS.billingCurrent,
      apartment_id: IDS.apartment,
      month: currentMonth,
      year: currentYear,
      due_date: new Date(currentYear, currentMonth, 15)
        .toISOString()
        .slice(0, 10),
      created_by: IDS.landlord,
      created_at: daysAgo(5),
    },
    {
      id: IDS.billingPrevious,
      apartment_id: IDS.apartment,
      month: previousDate.getMonth() + 1,
      year: previousDate.getFullYear(),
      due_date: new Date(
        previousDate.getFullYear(),
        previousDate.getMonth(),
        15,
      )
        .toISOString()
        .slice(0, 10),
      created_by: IDS.landlord,
      created_at: daysAgo(35),
    },
  ];

  const payments: any[] = [
    {
      id: IDS.paymentUnpaid,
      billing_period_id: IDS.billingCurrent,
      tenant_id: IDS.tenant,
      amount: 3850000,
      rent_amount: 3500000,
      utility_total: 300000,
      extra_charges: [{ name: 'Gui xe', amount: 50000 }],
      status: 'unpaid',
      payment_method: null,
      receipt_image_url: null,
      paid_at: null,
      confirmed_at: null,
      confirmed_by: null,
      note: null,
      created_at: daysAgo(5),
      updated_at: daysAgo(5),
    },
    {
      id: IDS.paymentReported,
      billing_period_id: IDS.billingCurrent,
      tenant_id: IDS.roommate,
      amount: 3500000,
      rent_amount: 3200000,
      utility_total: 300000,
      extra_charges: [],
      status: 'tenant_reported',
      payment_method: 'bank_transfer',
      receipt_image_url: null,
      paid_at: daysAgo(1),
      confirmed_at: null,
      confirmed_by: null,
      note: null,
      created_at: daysAgo(5),
      updated_at: daysAgo(1),
    },
    {
      id: IDS.paymentConfirmed,
      billing_period_id: IDS.billingPrevious,
      tenant_id: IDS.tenant,
      amount: 3800000,
      rent_amount: 3500000,
      utility_total: 300000,
      extra_charges: [],
      status: 'confirmed',
      payment_method: 'cash',
      receipt_image_url: null,
      paid_at: daysAgo(30),
      confirmed_at: daysAgo(29),
      confirmed_by: IDS.landlord,
      note: null,
      created_at: daysAgo(35),
      updated_at: daysAgo(29),
    },
  ];

  const notifications: any[] = [
    {
      id: IDS.notificationIssue,
      user_id: IDS.tenant,
      apartment_id: IDS.apartment,
      type: 'issue_updated',
      title: 'Su co da duoc xu ly',
      body: 'Quat keu lon E2E da duoc cap nhat.',
      data: { issue_id: IDS.issueResolved },
      is_read: false,
      created_at: daysAgo(1),
    },
    {
      id: IDS.notificationPayment,
      user_id: IDS.landlord,
      apartment_id: IDS.apartment,
      type: 'payment_reported',
      title: 'Nguoi thue bao da thanh toan',
      body: 'E2E Ban Cung Phong da bao thanh toan.',
      data: { payment_id: IDS.paymentReported },
      is_read: false,
      created_at: daysAgo(1),
    },
  ];

  const utilityConfigs: any[] = [
    {
      id: nextId('utility'),
      apartment_id: IDS.apartment,
      utility_type: 'internet',
      name: 'Internet',
      pricing_type: 'fixed',
      fixed_amount: 100000,
      unit_price: null,
      unit_name: null,
      tiers: [],
      is_active: true,
      created_at: daysAgo(60),
      updated_at: daysAgo(10),
    },
  ];

  return {
    profiles,
    apartments,
    members,
    assets,
    borrowRequests,
    issues,
    billingPeriods,
    payments,
    notifications,
    utilityConfigs,
    notificationPreferences: {} as Record<string, any>,
    currentUserId: null as string | null,
  };
}

let state = createInitialState();

function profileFor(id: string) {
  return state.profiles.find(profile => profile.id === id);
}

function apartmentFor(id: string) {
  return state.apartments.find(apartment => apartment.id === id);
}

function memberWithProfile(member: any) {
  return { ...member, profile: clone(profileFor(member.user_id)) };
}

function enrichBorrow(request: any) {
  return {
    ...request,
    assets: clone(state.assets.find(asset => asset.id === request.asset_id)),
    borrower: clone(profileFor(request.borrower_id)),
    lender: clone(profileFor(request.lender_id)),
  };
}

function enrichIssue(issue: any) {
  return {
    ...issue,
    reporter: clone(profileFor(issue.reporter_id)),
    issue_images: clone(issue.issue_images ?? []),
  };
}

function enrichPayment(payment: any) {
  return {
    ...payment,
    tenant: clone(profileFor(payment.tenant_id)),
    billing_periods: clone(
      state.billingPeriods.find(
        billing => billing.id === payment.billing_period_id,
      ),
    ),
  };
}

function requireRecord<T>(record: T | undefined, message: string): T {
  if (!record) {
    throw new Error(message);
  }
  return record;
}

function sessionFor(profile: any) {
  return {
    access_token: `e2e-token-${profile.id}`,
    refresh_token: `e2e-refresh-${profile.id}`,
    user: { id: profile.id, email: profile.email },
  };
}

export const e2eBackend = {
  reset() {
    state = createInitialState();
  },

  async signIn(email: string, password: string) {
    const profile = state.profiles.find(item => item.email === email);
    if (!profile || password !== 'E2e123456!') {
      throw new Error('Email hoac mat khau khong dung');
    }
    state.currentUserId = profile.id;
    return { session: sessionFor(profile), user: sessionFor(profile).user };
  },

  async signUp(
    email: string,
    _password: string,
    fullName: string,
    role: 'tenant' | 'landlord',
  ) {
    if (state.profiles.some(profile => profile.email === email)) {
      throw new Error('Email da duoc su dung');
    }
    const profile = {
      id: nextId('profile'),
      full_name: fullName,
      email,
      avatar_url: null,
      role,
      phone: null,
      created_at: now(),
      updated_at: now(),
    };
    state.profiles.push(profile);
    state.currentUserId = profile.id;
    return { session: sessionFor(profile), user: sessionFor(profile).user };
  },

  async signOut() {
    state.currentUserId = null;
  },

  async resetPassword(_email: string) {
    return {};
  },

  async resendEmailConfirmation(_email: string) {
    return {};
  },

  async changePassword(_newPassword: string) {
    return { user: clone(profileFor(state.currentUserId ?? '')) };
  },

  async getProfile(userId: string) {
    return clone(requireRecord(profileFor(userId), 'Khong tim thay ho so'));
  },

  async updateProfile(userId: string, updates: ProfileUpdate) {
    const profile = requireRecord(profileFor(userId), 'Khong tim thay ho so');
    Object.assign(profile, updates, { updated_at: now() });
    return clone(profile);
  },

  async signInWithProvider() {
    const profile = requireRecord(
      profileFor(IDS.tenant),
      'Khong tim thay tai khoan E2E',
    );
    state.currentUserId = IDS.tenant;
    return { session: sessionFor(profile), user: sessionFor(profile).user };
  },

  async createApartment(
    data: Omit<ApartmentInsert, 'id' | 'created_at' | 'updated_at'>,
  ) {
    const apartment = {
      ...data,
      id: nextId('apartment'),
      created_at: now(),
      updated_at: now(),
    };
    state.apartments.unshift(apartment);
    state.members.push({
      id: nextId('member'),
      apartment_id: apartment.id,
      user_id: data.landlord_id,
      room_name: null,
      rent_amount: 0,
      joined_at: now(),
    });
    return clone(apartment);
  },

  async getApartment(id: string) {
    return clone(requireRecord(apartmentFor(id), 'Khong tim thay can ho'));
  },

  async updateApartment(id: string, updates: ApartmentUpdate) {
    const apartment = requireRecord(apartmentFor(id), 'Khong tim thay can ho');
    Object.assign(apartment, updates, { updated_at: now() });
    return clone(apartment);
  },

  async getApartmentsForUser(userId: string, role: 'tenant' | 'landlord') {
    if (role === 'landlord') {
      return clone(
        state.apartments.filter(apartment => apartment.landlord_id === userId),
      );
    }
    const apartmentIds = state.members
      .filter(member => member.user_id === userId)
      .map(member => member.apartment_id);
    return clone(
      state.apartments.filter(apartment => apartmentIds.includes(apartment.id)),
    );
  },

  async getApartmentByInviteCode(code: string) {
    return clone(
      requireRecord(
        state.apartments.find(apartment => apartment.invite_code === code),
        'Ma moi khong hop le',
      ),
    );
  },

  async joinApartment(apartmentId: string, userId: string) {
    let member = state.members.find(
      item => item.apartment_id === apartmentId && item.user_id === userId,
    );
    if (!member) {
      member = {
        id: nextId('member'),
        apartment_id: apartmentId,
        user_id: userId,
        room_name: null,
        rent_amount: 0,
        joined_at: now(),
      };
      state.members.push(member);
    }
    return clone(member);
  },

  async getMembers(apartmentId: string) {
    return clone(
      state.members
        .filter(member => member.apartment_id === apartmentId)
        .map(memberWithProfile),
    );
  },

  async updateMember(memberId: string, updates: ApartmentMemberUpdate) {
    const member = requireRecord(
      state.members.find(item => item.id === memberId),
      'Khong tim thay nguoi thue',
    );
    Object.assign(member, updates);
    return clone(memberWithProfile(member));
  },

  async removeMember(memberId: string) {
    state.members = state.members.filter(member => member.id !== memberId);
  },

  async getAssets(apartmentId: string) {
    return clone(
      state.assets.filter(asset => asset.apartment_id === apartmentId),
    );
  },

  async getAsset(id: string) {
    return clone(
      requireRecord(
        state.assets.find(asset => asset.id === id),
        'Khong tim thay tai san',
      ),
    );
  },

  async createAsset(payload: Omit<AssetInsert, 'id' | 'created_at'>) {
    const asset = {
      ...payload,
      id: nextId('asset'),
      owner_id: payload.owner_id ?? null,
      category: payload.category ?? null,
      location: payload.location ?? null,
      image_url: payload.image_url ?? null,
      created_at: now(),
    };
    state.assets.unshift(asset);
    return clone(asset);
  },

  async updateAsset(id: string, updates: AssetUpdate) {
    const asset = requireRecord(
      state.assets.find(item => item.id === id),
      'Khong tim thay tai san',
    );
    Object.assign(asset, updates);
    return clone(asset);
  },

  async deleteAsset(id: string) {
    state.assets = state.assets.filter(asset => asset.id !== id);
  },

  async createBorrowRequest(data: any) {
    const request = {
      ...data,
      id: nextId('borrow'),
      status: data.status ?? 'pending',
      created_at: now(),
      updated_at: now(),
    };
    state.borrowRequests.unshift(request);
    return clone(request);
  },

  async getBorrowRequests(apartmentId: string) {
    return clone(
      state.borrowRequests
        .filter(request => request.apartment_id === apartmentId)
        .map(enrichBorrow),
    );
  },

  async getBorrowRequest(id: string) {
    const request = requireRecord(
      state.borrowRequests.find(item => item.id === id),
      'Khong tim thay yeu cau',
    );
    return clone(enrichBorrow(request));
  },

  async updateBorrowStatus(id: string, status: string) {
    const request = requireRecord(
      state.borrowRequests.find(item => item.id === id),
      'Khong tim thay yeu cau',
    );
    request.status = status;
    request.updated_at = now();
    return clone(request);
  },

  async createIssue(
    data: Omit<IssueInsert, 'id' | 'created_at' | 'updated_at'>,
  ) {
    const issue = {
      ...data,
      id: nextId('issue'),
      status: data.status ?? 'open',
      created_at: now(),
      updated_at: now(),
      issue_images: [],
    };
    state.issues.unshift(issue);
    return clone(issue);
  },

  async getIssues(apartmentId: string) {
    return clone(
      state.issues
        .filter(issue => issue.apartment_id === apartmentId)
        .map(enrichIssue),
    );
  },

  async getIssue(id: string) {
    return clone(
      enrichIssue(
        requireRecord(
          state.issues.find(issue => issue.id === id),
          'Khong tim thay su co',
        ),
      ),
    );
  },

  async updateIssueStatus(id: string, status: string, note?: string) {
    const issue = requireRecord(
      state.issues.find(item => item.id === id),
      'Khong tim thay su co',
    );
    issue.status = status;
    issue.updated_at = now();
    if (note !== undefined) {
      if (status === 'resolved' || status === 'closed') {
        issue.resolution_note = note;
      } else {
        issue.landlord_note = note;
      }
    }
    return clone(issue);
  },

  async addIssueImages(issueId: string, urls: string[]) {
    const issue = requireRecord(
      state.issues.find(item => item.id === issueId),
      'Khong tim thay su co',
    );
    const rows = urls.map(url => ({
      id: nextId('issue-image'),
      issue_id: issueId,
      image_url: url,
      created_at: now(),
    }));
    issue.issue_images = [...(issue.issue_images ?? []), ...rows];
    return clone(rows);
  },

  async createBillingPeriod(
    apartmentId: string,
    month: number,
    year: number,
    dueDate: string,
    createdBy: string,
    paymentRows?: Array<{
      tenant_id: string;
      amount: number;
      rent_amount?: number | null;
      utility_total?: number;
      extra_charges?: Json;
    }>,
  ) {
    if (
      state.billingPeriods.some(
        item =>
          item.apartment_id === apartmentId &&
          item.month === month &&
          item.year === year,
      )
    ) {
      throw new Error('Ky thu tien nay da ton tai');
    }
    const billing = {
      id: nextId('billing'),
      apartment_id: apartmentId,
      month,
      year,
      due_date: dueDate,
      created_by: createdBy,
      created_at: now(),
    };
    state.billingPeriods.unshift(billing);
    const rows =
      paymentRows ??
      state.members
        .filter(
          member =>
            member.apartment_id === apartmentId && member.user_id !== createdBy,
        )
        .map(member => ({
          tenant_id: member.user_id,
          amount: member.rent_amount,
          rent_amount: member.rent_amount,
          utility_total: 0,
          extra_charges: [] as Json,
        }));
    for (const row of rows) {
      state.payments.unshift({
        id: nextId('payment'),
        billing_period_id: billing.id,
        tenant_id: row.tenant_id,
        amount: row.amount,
        rent_amount: row.rent_amount ?? row.amount,
        utility_total: row.utility_total ?? 0,
        extra_charges: row.extra_charges ?? [],
        status: 'unpaid',
        payment_method: null,
        receipt_image_url: null,
        paid_at: null,
        confirmed_at: null,
        confirmed_by: null,
        note: null,
        created_at: now(),
        updated_at: now(),
      });
    }
    return clone(billing);
  },

  async getBillingPeriods(apartmentId: string) {
    return clone(
      state.billingPeriods.filter(
        billing => billing.apartment_id === apartmentId,
      ),
    );
  },

  async getPayments(billingId: string) {
    return clone(
      state.payments
        .filter(payment => payment.billing_period_id === billingId)
        .map(enrichPayment),
    );
  },

  async getPaymentsForApartment(apartmentId: string) {
    const billingIds = state.billingPeriods
      .filter(billing => billing.apartment_id === apartmentId)
      .map(billing => billing.id);
    return clone(
      state.payments
        .filter(payment => billingIds.includes(payment.billing_period_id))
        .map(enrichPayment),
    );
  },

  async getMyPayments(tenantId: string) {
    return clone(
      state.payments
        .filter(payment => payment.tenant_id === tenantId)
        .map(enrichPayment),
    );
  },

  async getPayment(id: string) {
    return clone(
      enrichPayment(
        requireRecord(
          state.payments.find(payment => payment.id === id),
          'Khong tim thay thanh toan',
        ),
      ),
    );
  },

  async reportPayment(
    id: string,
    method: 'bank_transfer' | 'cash',
    receiptUrl?: string,
  ) {
    const payment = requireRecord(
      state.payments.find(item => item.id === id),
      'Khong tim thay thanh toan',
    );
    Object.assign(payment, {
      status: 'tenant_reported',
      payment_method: method,
      receipt_image_url: receiptUrl ?? null,
      paid_at: now(),
      updated_at: now(),
    });
    return clone(payment);
  },

  async confirmPayment(id: string, confirmedBy: string) {
    const payment = requireRecord(
      state.payments.find(item => item.id === id),
      'Khong tim thay thanh toan',
    );
    Object.assign(payment, {
      status: 'confirmed',
      confirmed_at: now(),
      confirmed_by: confirmedBy,
      updated_at: now(),
    });
    return clone(payment);
  },

  async rejectPayment(id: string, note?: string) {
    const payment = requireRecord(
      state.payments.find(item => item.id === id),
      'Khong tim thay thanh toan',
    );
    Object.assign(payment, {
      status: 'unpaid',
      payment_method: null,
      receipt_image_url: null,
      paid_at: null,
      note: note ?? payment.note,
      updated_at: now(),
    });
    return clone(payment);
  },

  async createNotification(payload: NotificationInsert) {
    const notification = {
      ...payload,
      id: nextId('notification'),
      is_read: payload.is_read ?? false,
      created_at: now(),
    };
    state.notifications.unshift(notification);
    return clone(notification);
  },

  async getNotifications(userId: string) {
    return clone(state.notifications.filter(item => item.user_id === userId));
  },

  async markAsRead(id: string) {
    const notification = requireRecord(
      state.notifications.find(item => item.id === id),
      'Khong tim thay thong bao',
    );
    notification.is_read = true;
    return clone(notification);
  },

  async markAllAsRead(userId: string) {
    const notifications = state.notifications.filter(
      item => item.user_id === userId && !item.is_read,
    );
    notifications.forEach(item => {
      item.is_read = true;
    });
    return clone(notifications);
  },

  async getUnreadCount(userId: string) {
    return state.notifications.filter(
      item => item.user_id === userId && !item.is_read,
    ).length;
  },

  async getUtilityConfigs(apartmentId: string) {
    return clone(
      state.utilityConfigs.filter(
        config => config.apartment_id === apartmentId,
      ),
    );
  },

  async upsertUtilityConfig(payload: UtilityConfigInsert) {
    let config = state.utilityConfigs.find(
      item =>
        item.apartment_id === payload.apartment_id &&
        item.utility_type === payload.utility_type,
    );
    if (config) {
      Object.assign(config, payload, { updated_at: now() });
    } else {
      config = {
        ...payload,
        id: nextId('utility'),
        pricing_type: payload.pricing_type ?? 'fixed',
        fixed_amount: payload.fixed_amount ?? null,
        unit_price: payload.unit_price ?? null,
        unit_name: payload.unit_name ?? null,
        tiers: payload.tiers ?? [],
        is_active: payload.is_active ?? true,
        created_at: now(),
        updated_at: now(),
      };
      state.utilityConfigs.push(config);
    }
    return clone(config);
  },

  async updateUtilityConfig(id: string, updates: UtilityConfigUpdate) {
    const config = requireRecord(
      state.utilityConfigs.find(item => item.id === id),
      'Khong tim thay cau hinh',
    );
    Object.assign(config, updates, { updated_at: now() });
    return clone(config);
  },

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android',
  ) {
    return {
      id: nextId('device-token'),
      user_id: userId,
      token,
      platform,
      is_active: true,
      created_at: now(),
      updated_at: now(),
    };
  },

  async getNotificationPreference(userId: string) {
    if (!state.notificationPreferences[userId]) {
      state.notificationPreferences[userId] = {
        user_id: userId,
        payment_enabled: true,
        issue_enabled: true,
        borrow_enabled: true,
        announcement_enabled: true,
        push_enabled: true,
        updated_at: now(),
      };
    }
    return clone(state.notificationPreferences[userId]);
  },

  async upsertNotificationPreference(
    userId: string,
    updates: NotificationPreferenceUpdate,
  ) {
    const current = await this.getNotificationPreference(userId);
    state.notificationPreferences[userId] = {
      ...current,
      ...updates,
      updated_at: now(),
    };
    return clone(state.notificationPreferences[userId]);
  },

  async uploadImage(bucket: string, path: string) {
    return { path: `${bucket}/${path}` };
  },

  getImageUrl(bucket: string, path: string) {
    return `https://e2e.invalid/${bucket}/${path}`;
  },

  async getSignedImageUrl(_bucket: string, pathOrUrl: string) {
    return pathOrUrl;
  },
};

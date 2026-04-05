import type {NavigatorScreenParams} from '@react-navigation/native';

// Auth flow screens
export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  JoinApartment: undefined;
};

// Tenant bottom tab screens
export type TenantTabParamList = {
  TenantHome: undefined;
  BorrowList: undefined;
  IssueList: undefined;
  PaymentHistory: undefined;
  TenantProfile: undefined;
};

// Landlord bottom tab screens
export type LandlordTabParamList = {
  LandlordDashboard: undefined;
  TenantManagement: undefined;
  AssetList: undefined;
  LandlordIssueList: undefined;
  LandlordPayments: undefined;
  LandlordProfile: undefined;
};

// Tenant stack (tabs + detail screens)
export type TenantStackParamList = TenantTabParamList & {
  BorrowCreate: undefined;
  BorrowDetail: {id: string};
  IssueCreate: undefined;
  IssueDetail: {id: string};
  PaymentDetail: {id: string};
  RoommateList: undefined;
  Notifications: undefined;
};

// Landlord stack (tabs + detail screens)
export type LandlordStackParamList = LandlordTabParamList & {
  ApartmentSetup: {id?: string};
  InviteCode: {apartmentId: string};
  TenantDetail: {id: string};
  AssetEdit: {id?: string};
  LandlordIssueDetail: {id: string};
  CreateBilling: undefined;
  PaymentOverview: {billingId: string};
  PaymentConfirm: {id: string};
  RevenueHistory: undefined;
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Tenant: NavigatorScreenParams<TenantStackParamList> | undefined;
  Landlord: NavigatorScreenParams<LandlordStackParamList> | undefined;
};

// Augment the global ReactNavigation namespace for useNavigation type safety
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

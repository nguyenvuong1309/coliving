/**
 * Barrel export cho toàn bộ Page Object.
 * Mỗi screen object là một singleton (đã `new` sẵn) — import và dùng trực tiếp.
 *
 * Ví dụ:
 *   import {TenantHomeScreen, BorrowCreateScreen} from '../screenObjects';
 */

// Auth
export {default as WelcomeScreen} from './WelcomeScreen';
export {default as SignInScreen} from './SignInScreen';
export {default as SignUpScreen} from './SignUpScreen';
export {default as SplashScreen} from './auth/SplashScreen';
export {default as ForgotPasswordScreen} from './auth/ForgotPasswordScreen';
export {default as RoleSelectionScreen} from './auth/RoleSelectionScreen';
export {default as ProfileCompletionScreen} from './auth/ProfileCompletionScreen';
export {default as JoinApartmentScreen} from './auth/JoinApartmentScreen';

// Tenant
export {default as TenantHomeScreen} from './tenant/TenantHomeScreen';
export {default as BorrowListScreen} from './tenant/BorrowListScreen';
export {default as BorrowCreateScreen} from './tenant/BorrowCreateScreen';
export {default as BorrowDetailScreen} from './tenant/BorrowDetailScreen';
export {default as IssueListScreen} from './tenant/IssueListScreen';
export {default as IssueCreateScreen} from './tenant/IssueCreateScreen';
export {default as IssueDetailScreen} from './tenant/IssueDetailScreen';
export {default as PaymentHistoryScreen} from './tenant/PaymentHistoryScreen';
export {default as PaymentDetailScreen} from './tenant/PaymentDetailScreen';
export {default as RoommateListScreen} from './tenant/RoommateListScreen';
export {default as NotificationsScreen} from './tenant/NotificationsScreen';
export {default as TenantProfileScreen} from './tenant/TenantProfileScreen';

// Landlord
export {default as DashboardScreen} from './landlord/DashboardScreen';
export {default as TenantListScreen} from './landlord/TenantListScreen';
export {default as TenantDetailScreen} from './landlord/TenantDetailScreen';
export {default as TenantEditScreen} from './landlord/TenantEditScreen';
export {default as AssetListScreen} from './landlord/AssetListScreen';
export {default as AssetEditScreen} from './landlord/AssetEditScreen';
export {default as LandlordPaymentsScreen} from './landlord/LandlordPaymentsScreen';
export {default as CreateBillingScreen} from './landlord/CreateBillingScreen';
export {default as PaymentOverviewScreen} from './landlord/PaymentOverviewScreen';
export {default as PaymentConfirmScreen} from './landlord/PaymentConfirmScreen';
export {default as LandlordIssueListScreen} from './landlord/LandlordIssueListScreen';
export {default as LandlordIssueDetailScreen} from './landlord/LandlordIssueDetailScreen';
export {default as LandlordBorrowListScreen} from './landlord/LandlordBorrowListScreen';
export {default as LandlordBorrowDetailScreen} from './landlord/LandlordBorrowDetailScreen';
export {default as ApartmentSetupScreen} from './landlord/ApartmentSetupScreen';
export {default as ApartmentSwitcherScreen} from './landlord/ApartmentSwitcherScreen';
export {default as InviteCodeScreen} from './landlord/InviteCodeScreen';
export {default as UtilityConfigScreen} from './landlord/UtilityConfigScreen';
export {default as ReportExportScreen} from './landlord/ReportExportScreen';
export {default as RevenueHistoryScreen} from './landlord/RevenueHistoryScreen';
export {default as LandlordProfileScreen} from './landlord/LandlordProfileScreen';

// Shared
export {default as EditProfileScreen} from './shared/EditProfileScreen';
export {default as ChangePasswordScreen} from './shared/ChangePasswordScreen';
export {default as NotificationSettingsScreen} from './shared/NotificationSettingsScreen';

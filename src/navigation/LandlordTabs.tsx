import React from 'react';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';
import type {
  LandlordTabParamList,
  LandlordStackParamList,
} from '../types/navigation';

import DashboardScreen from '../screens/landlord/DashboardScreen';
import TenantListScreen from '../screens/landlord/tenants/TenantListScreen';
import TenantDetailScreen from '../screens/landlord/tenants/TenantDetailScreen';
import TenantEditScreen from '../screens/landlord/tenants/TenantEditScreen';
import AssetListScreen from '../screens/landlord/assets/AssetListScreen';
import AssetEditScreen from '../screens/landlord/assets/AssetEditScreen';
import LandlordIssueListScreen from '../screens/landlord/issues/IssueListScreen';
import LandlordIssueDetailScreen from '../screens/landlord/issues/IssueDetailScreen';
import LandlordBorrowListScreen from '../screens/landlord/borrow/BorrowListScreen';
import LandlordBorrowDetailScreen from '../screens/landlord/borrow/BorrowDetailScreen';
import LandlordPaymentsScreen from '../screens/landlord/payments/PaymentsScreen';
import CreateBillingScreen from '../screens/landlord/payments/CreateBillingScreen';
import PaymentOverviewScreen from '../screens/landlord/payments/PaymentOverviewScreen';
import PaymentConfirmScreen from '../screens/landlord/payments/PaymentConfirmScreen';
import ApartmentSetupScreen from '../screens/landlord/apartment/ApartmentSetupScreen';
import InviteCodeScreen from '../screens/landlord/apartment/InviteCodeScreen';
import RevenueHistoryScreen from '../screens/landlord/RevenueHistoryScreen';
import LandlordProfileScreen from '../screens/landlord/ProfileScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';

const Tab = createNativeBottomTabNavigator<LandlordTabParamList>();
const Stack = createNativeStackNavigator<LandlordStackParamList>();

function LandlordTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="LandlordDashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Tổng quan' }}
      />
      <Tab.Screen
        name="TenantManagement"
        component={TenantListScreen}
        options={{ tabBarLabel: 'Người thuê' }}
      />
      <Tab.Screen
        name="AssetList"
        component={AssetListScreen}
        options={{ tabBarLabel: 'Tài sản' }}
      />
      <Tab.Screen
        name="LandlordIssueList"
        component={LandlordIssueListScreen}
        options={{ tabBarLabel: 'Sự cố' }}
      />
      <Tab.Screen
        name="LandlordPayments"
        component={LandlordPaymentsScreen}
        options={{ tabBarLabel: 'Thu tiền' }}
      />
      <Tab.Screen
        name="LandlordProfile"
        component={LandlordProfileScreen}
        options={{ tabBarLabel: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
}

export default function LandlordStack() {
  const apartment = useAppSelector(state => state.apartment.apartment);

  if (!apartment) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="ApartmentSetup"
          component={ApartmentSetupScreen}
          options={{ title: 'Thiết lập căn hộ' }}
        />
        <Stack.Screen
          name="InviteCode"
          component={InviteCodeScreen}
          options={{ title: 'Mã mời' }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ title: 'Đổi mật khẩu' }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LandlordDashboard"
        component={LandlordTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ApartmentSetup"
        component={ApartmentSetupScreen}
        options={{ title: 'Thiết lập căn hộ' }}
      />
      <Stack.Screen
        name="InviteCode"
        component={InviteCodeScreen}
        options={{ title: 'Mã mời' }}
      />
      <Stack.Screen
        name="TenantDetail"
        component={TenantDetailScreen}
        options={{ title: 'Chi tiết người thuê' }}
      />
      <Stack.Screen
        name="TenantEdit"
        component={TenantEditScreen}
        options={{ title: 'Cập nhật người thuê' }}
      />
      <Stack.Screen
        name="AssetEdit"
        component={AssetEditScreen}
        options={{ title: 'Chỉnh sửa tài sản' }}
      />
      <Stack.Screen
        name="LandlordIssueDetail"
        component={LandlordIssueDetailScreen}
        options={{ title: 'Xử lý sự cố' }}
      />
      <Stack.Screen
        name="LandlordBorrowList"
        component={LandlordBorrowListScreen}
        options={{ title: 'Yêu cầu mượn đồ' }}
      />
      <Stack.Screen
        name="LandlordBorrowDetail"
        component={LandlordBorrowDetailScreen}
        options={{ title: 'Xử lý mượn đồ' }}
      />
      <Stack.Screen
        name="CreateBilling"
        component={CreateBillingScreen}
        options={{ title: 'Tạo kỳ thu tiền' }}
      />
      <Stack.Screen
        name="PaymentOverview"
        component={PaymentOverviewScreen}
        options={{ title: 'Tổng quan thanh toán' }}
      />
      <Stack.Screen
        name="PaymentConfirm"
        component={PaymentConfirmScreen}
        options={{ title: 'Xác nhận thanh toán' }}
      />
      <Stack.Screen
        name="RevenueHistory"
        component={RevenueHistoryScreen}
        options={{ title: 'Lịch sử doanh thu' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Chỉnh sửa thông tin' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Đổi mật khẩu' }}
      />
    </Stack.Navigator>
  );
}

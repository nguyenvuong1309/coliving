import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';
import type {
  TenantTabParamList,
  TenantStackParamList,
} from '../types';

import TenantHomeScreen from '../screens/tenant/HomeScreen';
import BorrowListScreen from '../screens/tenant/borrow/BorrowListScreen';
import BorrowCreateScreen from '../screens/tenant/borrow/BorrowCreateScreen';
import BorrowDetailScreen from '../screens/tenant/borrow/BorrowDetailScreen';
import IssueListScreen from '../screens/tenant/issues/IssueListScreen';
import IssueCreateScreen from '../screens/tenant/issues/IssueCreateScreen';
import IssueDetailScreen from '../screens/tenant/issues/IssueDetailScreen';
import PaymentHistoryScreen from '../screens/tenant/payments/PaymentHistoryScreen';
import PaymentDetailScreen from '../screens/tenant/payments/PaymentDetailScreen';
import RoommateListScreen from '../screens/tenant/RoommateListScreen';
import NotificationsScreen from '../screens/tenant/NotificationsScreen';
import TenantProfileScreen from '../screens/tenant/ProfileScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/shared/NotificationSettingsScreen';
import JoinApartmentScreen from '../screens/auth/JoinApartmentScreen';
import ExpenseListScreen from '../screens/tenant/expense/ExpenseListScreen';
import ExpenseCreateScreen from '../screens/tenant/expense/ExpenseCreateScreen';
import ExpenseDetailScreen from '../screens/tenant/expense/ExpenseDetailScreen';
import BalanceScreen from '../screens/tenant/expense/BalanceScreen';
import SettleUpScreen from '../screens/tenant/expense/SettleUpScreen';
import ChatScreen from '../screens/tenant/chat/ChatScreen';
import ChoreBoardScreen from '../screens/tenant/chore/ChoreBoardScreen';
import ChoreCreateScreen from '../screens/tenant/chore/ChoreCreateScreen';
import ChoreLeaderboardScreen from '../screens/tenant/chore/ChoreLeaderboardScreen';
import ReceiptScannerScreen from '../screens/tenant/ai/ReceiptScannerScreen';

const Tab = createNativeBottomTabNavigator<TenantTabParamList>();
const Stack = createNativeStackNavigator<TenantStackParamList>();

function ApartmentLoadingScreen() {
  return (
    <View testID="apartment-loading-screen" style={styles.loading}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

function TenantTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TenantHome"
        component={TenantHomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="BorrowList"
        component={BorrowListScreen}
        options={{
          tabBarLabel: 'Mượn đồ',
        }}
      />
      <Tab.Screen
        name="IssueList"
        component={IssueListScreen}
        options={{
          tabBarLabel: 'Sự cố',
        }}
      />
      <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{
          tabBarLabel: 'Thanh toán',
        }}
      />
      <Tab.Screen
        name="ExpenseList"
        component={ExpenseListScreen}
        options={{
          tabBarLabel: 'Quỹ chung',
        }}
      />
      <Tab.Screen
        name="TenantProfile"
        component={TenantProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
        }}
      />
    </Tab.Navigator>
  );
}

export default function TenantStack() {
  const userId = useAppSelector(state => state.auth.user?.id);
  const { apartment, loadedForUserId } = useAppSelector(
    state => state.apartment,
  );

  if (userId && loadedForUserId !== userId) {
    return <ApartmentLoadingScreen />;
  }

  if (!apartment) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="JoinApartment"
          component={JoinApartmentScreen}
          options={{ title: 'Tham gia căn hộ' }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ title: 'Đổi mật khẩu' }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{ title: 'Cài đặt thông báo' }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TenantHome"
        component={TenantTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BorrowCreate"
        component={BorrowCreateScreen}
        options={{ title: 'Yêu cầu mượn đồ' }}
      />
      <Stack.Screen
        name="BorrowDetail"
        component={BorrowDetailScreen}
        options={{ title: 'Chi tiết mượn đồ' }}
      />
      <Stack.Screen
        name="IssueCreate"
        component={IssueCreateScreen}
        options={{ title: 'Tạo báo cáo' }}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetailScreen}
        options={{ title: 'Chi tiết sự cố' }}
      />
      <Stack.Screen
        name="PaymentDetail"
        component={PaymentDetailScreen}
        options={{ title: 'Chi tiết thanh toán' }}
      />
      <Stack.Screen
        name="RoommateList"
        component={RoommateListScreen}
        options={{ title: 'Bạn cùng phòng' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Thông báo' }}
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
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Cài đặt thông báo' }}
      />
      <Stack.Screen
        name="ExpenseCreate"
        component={ExpenseCreateScreen}
        options={{ title: 'Tạo khoản chi' }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{ title: 'Chi tiết khoản chi' }}
      />
      <Stack.Screen
        name="Balance"
        component={BalanceScreen}
        options={{ title: 'Số nợ ròng' }}
      />
      <Stack.Screen
        name="SettleUp"
        component={SettleUpScreen}
        options={{ title: 'Tất toán' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Thảo luận căn hộ' }}
      />
      <Stack.Screen
        name="ChoreBoard"
        component={ChoreBoardScreen}
        options={{ title: 'Việc nhà' }}
      />
      <Stack.Screen
        name="ChoreCreate"
        component={ChoreCreateScreen}
        options={{ title: 'Tạo việc nhà' }}
      />
      <Stack.Screen
        name="ChoreLeaderboard"
        component={ChoreLeaderboardScreen}
        options={{ title: 'Bảng xếp hạng' }}
      />
      <Stack.Screen
        name="ReceiptScanner"
        component={ReceiptScannerScreen}
        options={{ title: 'Quét hóa đơn AI' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
});

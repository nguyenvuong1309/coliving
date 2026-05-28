import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {
  TenantTabParamList,
  TenantStackParamList,
} from '../types/navigation';

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

const Tab = createBottomTabNavigator<TenantTabParamList>();
const Stack = createNativeStackNavigator<TenantStackParamList>();

function TenantTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      }}>
      <Tab.Screen
        name="TenantHome"
        component={TenantHomeScreen}
        options={{tabBarLabel: 'Trang chủ'}}
      />
      <Tab.Screen
        name="BorrowList"
        component={BorrowListScreen}
        options={{tabBarLabel: 'Mượn đồ'}}
      />
      <Tab.Screen
        name="IssueList"
        component={IssueListScreen}
        options={{tabBarLabel: 'Sự cố'}}
      />
      <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{tabBarLabel: 'Thanh toán'}}
      />
      <Tab.Screen
        name="TenantProfile"
        component={TenantProfileScreen}
        options={{tabBarLabel: 'Cá nhân'}}
      />
    </Tab.Navigator>
  );
}

export default function TenantStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TenantHome"
        component={TenantTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BorrowCreate"
        component={BorrowCreateScreen}
        options={{title: 'Yêu cầu mượn đồ'}}
      />
      <Stack.Screen
        name="BorrowDetail"
        component={BorrowDetailScreen}
        options={{title: 'Chi tiết mượn đồ'}}
      />
      <Stack.Screen
        name="IssueCreate"
        component={IssueCreateScreen}
        options={{title: 'Tạo báo cáo'}}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetailScreen}
        options={{title: 'Chi tiết sự cố'}}
      />
      <Stack.Screen
        name="PaymentDetail"
        component={PaymentDetailScreen}
        options={{title: 'Chi tiết thanh toán'}}
      />
      <Stack.Screen
        name="RoommateList"
        component={RoommateListScreen}
        options={{title: 'Bạn cùng phòng'}}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: 'Thông báo'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Chỉnh sửa thông tin'}}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{title: 'Đổi mật khẩu'}}
      />
    </Stack.Navigator>
  );
}

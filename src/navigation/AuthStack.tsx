import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AuthStackParamList} from '../types/navigation';

import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import JoinApartmentScreen from '../screens/auth/JoinApartmentScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: true,
          title: 'Đăng ký',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          headerShown: true,
          title: 'Đăng nhập',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Quên mật khẩu',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="JoinApartment"
        component={JoinApartmentScreen}
        options={{
          headerShown: true,
          title: 'Tham gia căn hộ',
          headerBackTitle: 'Quay lại',
        }}
      />
    </Stack.Navigator>
  );
}

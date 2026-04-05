import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {useAppSelector} from '../store';
import type {RootStackParamList} from '../types/navigation';

import AuthStack from './AuthStack';
import TenantStack from './TenantTabs';
import LandlordStack from './LandlordTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {user, session} = useAppSelector(state => state.auth);

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!session || !user) {
      return 'Auth';
    }
    return user.role === 'landlord' ? 'Landlord' : 'Tenant';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{headerShown: false}}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'landlord' ? (
          <Stack.Screen name="Landlord" component={LandlordStack} />
        ) : (
          <Stack.Screen name="Tenant" component={TenantStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

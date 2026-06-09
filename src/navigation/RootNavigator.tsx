import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../store';
import {fetchCurrentApartmentRequest} from '../store/slices/apartmentSlice';
import {
  setSession,
  setUser,
} from '../store/slices/authSlice';
import {fetchUnreadCountRequest} from '../store/slices/notificationSlice';
import {supabase} from '../config/supabase';
import {getProfile} from '../services/auth';
import {setAuthToken} from '../utils/mmkv';
import {usePushNotifications} from '../hooks/usePushNotifications';
import type {RootStackParamList} from '../types/navigation';

import AuthStack from './AuthStack';
import TenantStack from './TenantTabs';
import LandlordStack from './LandlordTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

function parseDeepLinkParams(url: string) {
  const params: Record<string, string> = {};
  const parts = [url.split('?')[1], url.split('#')[1]].filter(Boolean);

  for (const part of parts) {
    for (const pair of part.split('&')) {
      const [key, value = ''] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
  }

  return params;
}

export default function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const dispatch = useAppDispatch();
  const {user, session} = useAppSelector(state => state.auth);
  const pendingPasswordResetRef = React.useRef(false);
  const isAuthenticated = !!session && !!user;
  const isAuthenticatedRef = React.useRef(isAuthenticated);
  usePushNotifications(user?.id);

  const openPendingPasswordReset = React.useCallback(
    (role?: 'tenant' | 'landlord' | null) => {
      if (
        !pendingPasswordResetRef.current ||
        !isAuthenticatedRef.current ||
        !role ||
        !navigationRef.isReady()
      ) {
        return;
      }

      navigationRef.navigate(role === 'landlord' ? 'Landlord' : 'Tenant', {
        screen: 'ChangePassword',
      } as any);
      pendingPasswordResetRef.current = false;
    },
    [navigationRef],
  );

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.id && user.role) {
      dispatch(fetchCurrentApartmentRequest({userId: user.id, role: user.role}));
      dispatch(fetchUnreadCountRequest({userId: user.id}));
    }
  }, [dispatch, user?.id, user?.role]);

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      const params = parseDeepLinkParams(url);
      if (!params.access_token || !params.refresh_token) {
        return;
      }

      const {data, error} = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error || !data.session?.user?.id) {
        return;
      }

      dispatch(setSession(data.session));
      setAuthToken(data.session.access_token);
      const profile = await getProfile(data.session.user.id);
      dispatch(setUser(profile));
      if (params.type === 'recovery' || url.includes('reset-password')) {
        pendingPasswordResetRef.current = true;
        openPendingPasswordReset(profile?.role);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', event => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, [dispatch, openPendingPasswordReset]);

  useEffect(() => {
    openPendingPasswordReset(user?.role);
  }, [isAuthenticated, openPendingPasswordReset, user?.role]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
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

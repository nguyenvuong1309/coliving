import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../hooks/useAuth';
import type {AuthStackParamList} from '../../types/navigation';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const {checkSession} = useAuth();

  useEffect(() => {
    const init = async () => {
      const hasSession = await checkSession();
      if (!hasSession) {
        navigation.replace('Welcome');
      }
    };
    init();
  }, [checkSession, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CoLiving</Text>
      <Text style={styles.tagline}>Quản lý căn hộ thông minh</Text>
      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

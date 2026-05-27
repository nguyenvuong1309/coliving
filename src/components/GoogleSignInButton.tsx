import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  type SignInResponse,
} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string, accessToken: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  loading = false,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Check if Play Services is available (Android)
      await GoogleSignin.hasPlayServices();

      const response = (await GoogleSignin.signIn()) as SignInResponse;

      if (
        response.type === 'success' &&
        response.data &&
        response.data.idToken &&
        response.data.serverAuthCode
      ) {
        onSuccess(response.data.idToken, response.data.serverAuthCode);
      } else {
        onError('Failed to get authentication tokens');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        onError('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError('Google Play Services is not available');
      } else {
        onError(error.message || 'Google sign-in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, (loading || isLoading) && styles.buttonDisabled]}
      onPress={handleGoogleSignIn}
      disabled={loading || isLoading}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔵</Text>
        {isLoading || loading ? (
          <ActivityIndicator color="#1F2937" size="small" />
        ) : (
          <Text style={styles.text}>Đăng nhập với Google</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});

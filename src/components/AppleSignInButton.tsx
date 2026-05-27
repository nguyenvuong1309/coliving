import React, {useState} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
  Alert,
} from 'react-native';
import appleAuth, {
  AppleAuthRequestScope,
  AppleAuthError,
} from '@invertase/react-native-apple-authentication';

interface AppleSignInButtonProps {
  onSuccess: (idToken: string, fullName?: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export function AppleSignInButton({
  onSuccess,
  onError,
  loading = false,
}: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Only render on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.FULL_NAME,
          AppleAuthRequestScope.EMAIL,
        ],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      if (credentialState === appleAuth.State.AUTHORIZED) {
        if (appleAuthRequestResponse.identityToken) {
          onSuccess(appleAuthRequestResponse.identityToken, {
            givenName: appleAuthRequestResponse.fullName?.givenName,
            familyName: appleAuthRequestResponse.fullName?.familyName,
          });
        } else {
          onError('No identity token received');
        }
      } else {
        onError('Apple Sign-In authorization failed');
      }
    } catch (error: any) {
      if (error.code === AppleAuthError.CANCELED) {
        // User cancelled
      } else {
        onError(error.message || 'Apple sign-in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, (loading || isLoading) && styles.buttonDisabled]}
      onPress={handleAppleSignIn}
      disabled={loading || isLoading}>
      <View style={styles.content}>
        <Text style={styles.icon}>🍎</Text>
        {isLoading || loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.text}>Đăng nhập với Apple</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
  },
});

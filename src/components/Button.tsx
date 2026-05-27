import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#2563EB' : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            styles[`${variant}Text` as keyof typeof styles] as TextStyle,
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#E2E8F0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#1E293B',
  },
  outlineText: {
    color: '#2563EB',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});

export default Button;

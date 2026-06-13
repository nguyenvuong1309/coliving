import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { isE2EMode } from '../e2e/fakeBackend';

interface InputProps extends Omit<TextInputProps, 'style'> {
  ref?: React.Ref<TextInput>;
  label?: string;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  ref,
  label,
  placeholder,
  error,
  secureTextEntry,
  leftIcon,
  value,
  onChangeText,
  multiline,
  numberOfLines,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? '#DC2626' : isFocused ? '#2563EB' : '#CBD5E1';
  const effectiveSecureTextEntry = isE2EMode ? false : secureTextEntry;
  const e2eSecureTextProps =
    isE2EMode && secureTextEntry
      ? ({
          autoComplete: 'off',
          importantForAutofill: 'no',
          textContentType: 'none',
        } satisfies TextInputProps)
      : undefined;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { borderColor },
          multiline && { height: undefined, minHeight: 80 },
        ]}
      >
        {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : undefined,
            multiline && { textAlignVertical: 'top' },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={effectiveSecureTextEntry}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
          {...e2eSecureTextProps}
        />
      </View>
      {error && (
        <Text
          testID={rest.testID ? `${rest.testID}-error` : undefined}
          style={styles.error}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingHorizontal: 12,
  },
  iconWrapper: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0,
  },
  error: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});

export default Input;

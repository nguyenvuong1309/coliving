import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import PressableOpacity from './PressableOpacity';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  testID?: string;
}

const Card: React.FC<CardProps> = ({ children, style, onPress, testID }) => {
  if (onPress) {
    return (
      <PressableOpacity
        testID={testID}
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </PressableOpacity>
    );
  }

  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
});

export default Card;

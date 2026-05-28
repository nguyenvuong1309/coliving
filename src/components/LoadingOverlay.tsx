import React from 'react';
import { View, Text, ActivityIndicator, Modal, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2563EB" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#1E293B',
    textAlign: 'center',
  },
});

export default LoadingOverlay;

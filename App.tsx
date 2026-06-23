import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { ErrorToast } from './src/components';
import { Sentry } from './src/config/sentry';

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
          <RootNavigator />
          <ErrorToast />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Sentry.wrap bao boc app de bat loi render + performance. No-op an toan khi
// Sentry chua duoc init (khong co SENTRY_DSN).
export default Sentry.wrap(App);

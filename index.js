/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';
import {initSentry} from './src/config/sentry';
import {initPurchases} from './src/config/revenuecat';
import {
  displayNotification,
  isPushConfigured,
} from './src/services/pushNotifications';

// Khoi tao Sentry cang som cang tot, truoc khi import App.
initSentry();

// Khoi tao RevenueCat (anonymous). Goi `identifyUser(userId)` sau khi dang nhap
// de gan voi nguoi dung. No-op an toan neu chua co API key.
initPurchases();

// Xu ly message khi app o background/quit. Phai dang ky o top-level (ngoai React).
if (isPushConfigured()) {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await displayNotification(remoteMessage);
  });
}

const App = require('./App').default;

AppRegistry.registerComponent(appName, () => App);

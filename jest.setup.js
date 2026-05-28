/* eslint-env jest */

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    GestureHandlerRootView: ({children, style}) =>
      React.createElement(View, {style}, children),
    gestureHandlerRootHOC: component => component,
    Directions: {},
    State: {},
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ({children, ...props}) => React.createElement(View, props, children),
    },
    runOnJS: fn => fn,
    useAnimatedStyle: updater => updater(),
    useSharedValue: value => ({value}),
    withTiming: (value, _config, callback) => {
      if (callback) {
        callback(true);
      }
      return value;
    },
  };
});

jest.mock('react-native-config', () => ({
  ENV: 'test',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  APP_NAME: 'CoLiving Test',
  APP_DISPLAY_NAME: 'CoLiving Test',
  APP_VERSION: '1.0.0-test',
  APP_PASSWORD_RESET_REDIRECT_URL: 'coliving://auth/reset-password',
  GOOGLE_WEB_CLIENT_ID: 'test-google-client-id',
  GOOGLE_REVERSED_CLIENT_ID: 'com.googleusercontent.apps.test',
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  }),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('@invertase/react-native-apple-authentication', () => ({
  __esModule: true,
  default: {
    performRequest: jest.fn(),
    getCredentialStateForUser: jest.fn(),
    Operation: {LOGIN: 'LOGIN'},
    State: {AUTHORIZED: 'AUTHORIZED'},
  },
  AppleRequestScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
  AppleError: {
    CANCELED: 'CANCELED',
  },
}));

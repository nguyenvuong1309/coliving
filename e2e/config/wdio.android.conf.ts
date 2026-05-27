import { config as sharedConfig } from './wdio.shared.conf';
import path from 'path';
import type { Options } from '@wdio/types';

const ROOT = path.join(__dirname, '../..');

// Build app trước khi chạy test:
//   cd android && ./gradlew assembleDevDebug
const APP_PATH =
  process.env.ANDROID_APP_PATH ||
  path.join(
    ROOT,
    'android/app/build/outputs/apk/devDebug/app-devDebug.apk',
  );

export const config: Options.Testrunner = {
  ...(sharedConfig as Options.Testrunner),
  capabilities: [
    {
      platformName: 'Android',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
      'appium:automationName': 'UiAutomator2',
      'appium:app': APP_PATH,
      'appium:appPackage': 'com.coliving.dev',
      'appium:appActivity': 'com.coliving.MainActivity',
      'appium:newCommandTimeout': 240,
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:autoGrantPermissions': true,
    },
  ],
};

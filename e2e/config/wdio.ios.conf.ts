import { config as sharedConfig } from './wdio.shared.conf';
import path from 'path';
import type { Options } from '@wdio/types';

const ROOT = path.join(__dirname, '../..');

// Build app trước khi chạy test:
//   cd ios && xcodebuild -workspace CoLiving.xcworkspace \
//     -scheme CoLiving-Dev -configuration Debug \
//     -sdk iphonesimulator -derivedDataPath build
const APP_PATH =
  process.env.IOS_APP_PATH ||
  path.join(
    ROOT,
    'ios/build/Build/Products/Debug-iphonesimulator/CoLiving.app',
  );

export const config: Options.Testrunner = {
  ...(sharedConfig as Options.Testrunner),
  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 16',
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '18.0',
      'appium:automationName': 'XCUITest',
      'appium:app': APP_PATH,
      'appium:newCommandTimeout': 240,
      'appium:wdaLaunchTimeout': 120000,
      'appium:wdaConnectionTimeout': 120000,
      'appium:noReset': false,
      'appium:fullReset': false,
    },
  ],
};

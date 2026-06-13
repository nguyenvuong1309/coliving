const path = require('path');
const { config: sharedConfig } = require('./wdio.shared.conf.cjs');

const ROOT = path.join(__dirname, '../..');
const APP_PATH =
  process.env.ANDROID_APP_PATH ||
  path.join(ROOT, 'android/app/build/outputs/apk/devDebug/app-devDebug.apk');

exports.config = {
  ...sharedConfig,
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
      'appium:disableWindowAnimation': true,
      'appium:uiautomator2ServerLaunchTimeout': 120000,
    },
  ],
};

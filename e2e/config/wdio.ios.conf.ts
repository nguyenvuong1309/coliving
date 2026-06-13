import { config as sharedConfig } from './wdio.shared.conf';
import path from 'path';
import type { Options } from '@wdio/types';
import { execFileSync } from 'child_process';

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

function getBootedSimulator() {
  try {
    const output = execFileSync(
      'xcrun',
      ['simctl', 'list', 'devices', 'booted', '-j'],
      { encoding: 'utf8' },
    );
    const runtimes = JSON.parse(output).devices as Record<
      string,
      Array<{ name: string; udid: string; state: string }>
    >;
    for (const [runtime, devices] of Object.entries(runtimes)) {
      const device = devices.find(item => item.state === 'Booted');
      if (device) {
        return {
          name: device.name,
          udid: device.udid,
          platformVersion:
            runtime
              .match(/iOS-(\d+)-(\d+)/)
              ?.slice(1)
              .join('.') ?? undefined,
        };
      }
    }
  } catch {
    // Appium sẽ tự boot simulator mặc định nếu chưa có thiết bị đang chạy.
  }
  return null;
}

const bootedSimulator = getBootedSimulator();
const deviceName =
  process.env.IOS_DEVICE_NAME || bootedSimulator?.name || 'iPhone 17 Pro';
const platformVersion =
  process.env.IOS_PLATFORM_VERSION || bootedSimulator?.platformVersion;
const udid = process.env.IOS_UDID || bootedSimulator?.udid;

export const config: Options.Testrunner = {
  ...(sharedConfig as Options.Testrunner),
  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': deviceName,
      ...(platformVersion ? { 'appium:platformVersion': platformVersion } : {}),
      'appium:automationName': 'XCUITest',
      'appium:app': APP_PATH,
      ...(udid ? { 'appium:udid': udid } : {}),
      'appium:newCommandTimeout': 240,
      'appium:wdaLaunchTimeout': 120000,
      'appium:wdaConnectionTimeout': 120000,
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:shouldUseSingletonTestManager': false,
    },
  ],
};

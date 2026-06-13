const path = require('path');
const { execFileSync } = require('child_process');
const { config: sharedConfig } = require('./wdio.shared.conf.cjs');

const ROOT = path.join(__dirname, '../..');
const APP_PATH =
  process.env.IOS_APP_PATH ||
  path.join(
    ROOT,
    'ios/build/Build/Products/Release-iphonesimulator/CoLiving.app',
  );

function getBootedSimulator() {
  try {
    const output = execFileSync(
      'xcrun',
      ['simctl', 'list', 'devices', 'booted', '-j'],
      { encoding: 'utf8' },
    );
    const runtimes = JSON.parse(output).devices || {};
    for (const [runtime, devices] of Object.entries(runtimes)) {
      const device = devices.find(item => item.state === 'Booted');
      if (device) {
        const versionParts = runtime.match(/iOS-(\d+)-(\d+)/);
        return {
          name: device.name,
          udid: device.udid,
          platformVersion: versionParts
            ? `${versionParts[1]}.${versionParts[2]}`
            : undefined,
        };
      }
    }
  } catch {
    // Appium will use the configured/default simulator.
  }
  return null;
}

const bootedSimulator = getBootedSimulator();
const deviceName =
  process.env.IOS_DEVICE_NAME || bootedSimulator?.name || 'iPhone 17 Pro';
const platformVersion =
  process.env.IOS_PLATFORM_VERSION || bootedSimulator?.platformVersion;
const udid = process.env.IOS_UDID || bootedSimulator?.udid;

exports.config = {
  ...sharedConfig,
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

import type { Options } from '@wdio/types';
import path from 'path';

const ROOT = path.join(__dirname, '../..');

export const config: Partial<Options.Testrunner> = {
  runner: 'local',

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: path.join(ROOT, 'e2e/tsconfig.json'),
    },
  },

  specs: [path.join(ROOT, 'e2e/specs/**/*.spec.ts')],
  exclude: [],

  maxInstances: 1,
  logLevel: 'info',
  bail: 0,

  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      'appium',
      {
        // Dùng appium binary trong node_modules
        command: path.join(ROOT, 'node_modules/.bin/appium'),
        args: {
          relaxedSecurity: true,
          log: path.join(ROOT, 'e2e/logs/appium.log'),
          // Chỉ appium đến drivers trong node_modules
          useDrivers: ['xcuitest', 'uiautomator2'],
        },
      },
    ],
  ],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};

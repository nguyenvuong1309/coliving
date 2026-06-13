import type { Options } from '@wdio/types';
import type AppiumService from '@wdio/appium-service';
import type LocalRunner from '@wdio/local-runner';
import type MochaFramework from '@wdio/mocha-framework';
import type SpecReporter from '@wdio/spec-reporter';
import type UiAutomator2Driver from 'appium-uiautomator2-driver';
import type XCUITestDriver from 'appium-xcuitest-driver';
import path from 'path';
import fs from 'fs';

const ROOT = path.join(__dirname, '../..');
const ARTIFACTS_DIR = path.join(ROOT, 'e2e/artifacts');

export type WdioRuntimeDependencies = [
  AppiumService,
  LocalRunner,
  typeof MochaFramework,
  SpecReporter,
  UiAutomator2Driver,
  XCUITestDriver,
];

export const config: Partial<Options.Testrunner> = {
  runner: 'local',

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: path.join(ROOT, 'e2e/tsconfig.json'),
    },
  },

  specs: [
    process.env.E2E_SPEC
      ? path.resolve(ROOT, process.env.E2E_SPEC)
      : path.join(ROOT, 'e2e/specs/**/*.spec.ts'),
  ],
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
        },
      },
    ],
  ],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 180000,
  },

  onPrepare: function () {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  },

  afterTest: async function (_test, _context, result) {
    if (!result.passed) {
      const safeName = `${Date.now()}-${result.error?.name ?? 'failure'}`
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .slice(0, 120);
      await driver.saveScreenshot(path.join(ARTIFACTS_DIR, `${safeName}.png`));
    }
  },
};

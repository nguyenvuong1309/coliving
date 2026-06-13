const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const ARTIFACTS_DIR = path.join(ROOT, 'e2e/artifacts');

function resolveSpecs() {
  if (!process.env.E2E_SPEC) {
    return [path.join(ROOT, 'e2e/build/specs/**/*.spec.js')];
  }
  const sourceSpec = process.env.E2E_SPEC.replace(/^\.\//, '');
  const builtSpec = sourceSpec
    .replace(/^e2e\//, 'e2e/build/')
    .replace(/\.ts$/, '.js');
  return [path.resolve(ROOT, builtSpec)];
}

exports.config = {
  runner: 'local',

  specs: resolveSpecs(),
  exclude: [],

  maxInstances: 1,
  logLevel: 'warn',
  bail: 0,

  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      'appium',
      {
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
    ...(process.env.E2E_GREP ? { grep: process.env.E2E_GREP } : {}),
  },

  onPrepare() {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  },

  async afterTest(_test, _context, result) {
    if (!result.passed) {
      const safeName = `${Date.now()}-${result.error?.name ?? 'failure'}`
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .slice(0, 120);
      await driver.saveScreenshot(path.join(ARTIFACTS_DIR, `${safeName}.png`));
    }
  },
};

import WelcomeScreen from '../screenObjects/WelcomeScreen';
import SignInScreen from '../screenObjects/SignInScreen';
import { tap, tapText, waitForDisplayed, waitForExisting, TIMEOUT } from './utils';

export const E2E_ACCOUNT = {
  tenant: {
    email: 'tenant@e2e.coliving.local',
    password: 'E2e123456!',
    homeId: 'tenant-home-screen',
  },
  landlord: {
    email: 'landlord@e2e.coliving.local',
    password: 'E2e123456!',
    homeId: 'landlord-dashboard-screen',
  },
} as const;

function getAppId(): string {
  return driver.isIOS
    ? process.env.IOS_BUNDLE_ID || 'com.coliving'
    : process.env.ANDROID_APP_PACKAGE || 'com.coliving.dev';
}

export async function restartAtWelcome(): Promise<void> {
  const appId = getAppId();
  try {
    await driver.terminateApp(appId, {});
  } catch {
    // Appium may already have stopped the app between sessions.
  }
  await driver.activateApp(appId);
  await WelcomeScreen.waitForShown(TIMEOUT.long);
}

export async function signInAs(role: keyof typeof E2E_ACCOUNT): Promise<void> {
  const account = E2E_ACCOUNT[role];
  if (!(await WelcomeScreen.isShown())) {
    await restartAtWelcome();
  }
  await WelcomeScreen.tapSignIn();
  await SignInScreen.waitForShown();
  await SignInScreen.signIn(account.email, account.password);
  await waitForExisting(account.homeId, TIMEOUT.long);
}

export async function openTenantTab(label: string, pageId: string) {
  await tapText(label);
  await waitForDisplayed(pageId, TIMEOUT.long);
}

export async function openLandlordTab(label: string, pageId: string) {
  await tapText(label);
  await waitForDisplayed(pageId, TIMEOUT.long);
}

export async function openProfileRoute(
  role: 'tenant' | 'landlord',
  route: 'edit' | 'password' | 'notifications',
  pageId: string,
) {
  await tap(`${role}-profile-${route}-btn`);
  await waitForDisplayed(pageId, TIMEOUT.long);
}

import WelcomeScreen from '../../screenObjects/WelcomeScreen';
import { restartAtWelcome } from '../../helpers/session';
import {
  isTextDisplayed,
  tap,
  typeText,
  waitForDisplayed,
} from '../../helpers/utils';

describe('Forgot password', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await WelcomeScreen.tapSignIn();
    await waitForDisplayed('signin-screen');
    await tap('signin-forgot-password-btn');
    await waitForDisplayed('forgotpassword-screen');
  });

  it('validates an empty email', async () => {
    await tap('forgot-password-submit-btn');
    expect(await isTextDisplayed('Email không hợp lệ')).toBe(true);
  });

  it('submits a reset request', async () => {
    await typeText('forgot-password-email-input', 'tenant@e2e.coliving.local');
    await tap('forgot-password-submit-btn');
    expect(await isTextDisplayed('Email đã gửi!')).toBe(true);
  });
});

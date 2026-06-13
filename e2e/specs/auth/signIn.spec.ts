import WelcomeScreen from '../../screenObjects/WelcomeScreen';
import SignInScreen from '../../screenObjects/SignInScreen';
import SignUpScreen from '../../screenObjects/SignUpScreen';
import { waitForExisting, TIMEOUT } from '../../helpers/utils';
import { E2E_ACCOUNT, restartAtWelcome } from '../../helpers/session';

describe('SignIn', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await WelcomeScreen.tapSignIn();
    await SignInScreen.waitForShown();
  });

  it('should display sign in screen correctly', async () => {
    expect(await SignInScreen.isShown()).toBe(true);
  });

  it('should show validation error for empty email', async () => {
    await SignInScreen.tapSubmit();
    expect(await SignInScreen.hasEmailError()).toBe(true);
  });

  it('should show validation error for empty password', async () => {
    await SignInScreen.enterEmail('test@example.com');
    await SignInScreen.tapSubmit();
    expect(await SignInScreen.hasPasswordError()).toBe(true);
  });

  it('should show error message for wrong credentials', async () => {
    await SignInScreen.signIn('wrong@example.com', 'WrongPass123');
    const error = await SignInScreen.getErrorMessage();
    expect(error).not.toBeNull();
  });

  it('should navigate to ForgotPassword screen', async () => {
    await SignInScreen.tapForgotPassword();
    await waitForExisting('forgotpassword-screen', TIMEOUT.medium);
  });

  it('should navigate to SignUp screen', async () => {
    await SignInScreen.tapGoToSignUp();
    await SignUpScreen.waitForShown();
  });

  it('should sign in successfully as tenant', async () => {
    await SignInScreen.signIn(
      E2E_ACCOUNT.tenant.email,
      E2E_ACCOUNT.tenant.password,
    );
    await waitForExisting('tenant-home-screen', TIMEOUT.long);
  });

  it('should sign in successfully as landlord', async () => {
    await SignInScreen.signIn(
      E2E_ACCOUNT.landlord.email,
      E2E_ACCOUNT.landlord.password,
    );
    await waitForExisting('landlord-dashboard-screen', TIMEOUT.long);
  });
});

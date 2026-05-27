import WelcomeScreen from '../../screenObjects/WelcomeScreen';
import SignInScreen from '../../screenObjects/SignInScreen';
import SignUpScreen from '../../screenObjects/SignUpScreen';
import { waitForDisplayed, TIMEOUT } from '../../helpers/utils';

// Đặt trong .env hoặc biến môi trường khi chạy CI
const TEST_EMAIL = process.env.E2E_USER_EMAIL ?? 'test@coliving.dev';
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Test123456';

describe('SignIn', () => {
  beforeEach(async () => {
    await driver.reloadSession();
    await WelcomeScreen.waitForShown();
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
    await waitForDisplayed('forgotpassword-screen', TIMEOUT.medium);
  });

  it('should navigate to SignUp screen', async () => {
    await SignInScreen.tapGoToSignUp();
    expect(await SignUpScreen.isShown()).toBe(true);
  });

  // Bật khi đã có test account trên Supabase
  it.skip('should sign in successfully with valid credentials', async () => {
    await SignInScreen.signIn(TEST_EMAIL, TEST_PASSWORD);
    // Sau khi đăng nhập, chuyển đến màn hình chính tương ứng với role
    await waitForDisplayed('tenant-home-screen', TIMEOUT.long);
  });
});

import WelcomeScreen from '../../screenObjects/WelcomeScreen';
import SignInScreen from '../../screenObjects/SignInScreen';
import SignUpScreen from '../../screenObjects/SignUpScreen';

describe('WelcomeScreen', () => {
  before(async () => {
    await WelcomeScreen.waitForShown();
  });

  it('should display welcome screen on launch', async () => {
    expect(await WelcomeScreen.isShown()).toBe(true);
  });

  it('should navigate to SignUp when tap Đăng ký', async () => {
    await WelcomeScreen.tapSignUp();
    expect(await SignUpScreen.isShown()).toBe(true);
  });

  it('should navigate back and go to SignIn', async () => {
    // Quay về welcome từ SignUp
    await driver.back();
    await WelcomeScreen.waitForShown();

    await WelcomeScreen.tapSignIn();
    expect(await SignInScreen.isShown()).toBe(true);
  });
});

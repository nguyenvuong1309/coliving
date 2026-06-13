import WelcomeScreen from '../../screenObjects/WelcomeScreen';
import SignUpScreen from '../../screenObjects/SignUpScreen';
import SignInScreen from '../../screenObjects/SignInScreen';
import { TIMEOUT, waitForDisplayed } from '../../helpers/utils';
import { restartAtWelcome } from '../../helpers/session';

// Dùng timestamp để tạo email unique mỗi lần test
const uniqueEmail = () => `e2e+${Date.now()}@coliving.dev`;

describe('SignUp', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await WelcomeScreen.tapSignUp();
    await SignUpScreen.waitForShown();
  });

  it('should display sign up screen correctly', async () => {
    expect(await SignUpScreen.isShown()).toBe(true);
  });

  it('should show validation errors on empty submit', async () => {
    await SignUpScreen.tapSubmit();
    const hasAnyError =
      (await SignUpScreen.hasFullNameError()) ||
      (await SignUpScreen.hasEmailError()) ||
      (await SignUpScreen.hasPasswordError());
    expect(hasAnyError).toBe(true);
  });

  it('should select tenant role by default and switch to landlord', async () => {
    // Role tenant phải hiển thị mặc định
    const tenantBtn = await $('~signup-role-tenant-btn');
    expect(await tenantBtn.isDisplayed()).toBe(true);

    // Chuyển sang landlord
    await SignUpScreen.selectRole('landlord');
    const landlordBtn = await $('~signup-role-landlord-btn');
    expect(await landlordBtn.isDisplayed()).toBe(true);
  });

  it('should show error when passwords do not match', async () => {
    await SignUpScreen.enterFullName('Nguyen Van A');
    await SignUpScreen.enterEmail('test@example.com');
    await SignUpScreen.enterPassword('Password123');
    await SignUpScreen.enterConfirmPassword('DifferentPass456');
    await SignUpScreen.tapSubmit();

    expect(await SignUpScreen.hasConfirmPasswordError()).toBe(true);
  });

  it('should show error for invalid email format', async () => {
    await SignUpScreen.enterFullName('Nguyen Van A');
    await SignUpScreen.enterEmail('not-an-email');
    await SignUpScreen.enterPassword('Password123');
    await SignUpScreen.enterConfirmPassword('Password123');
    await SignUpScreen.tapSubmit();

    expect(await SignUpScreen.hasEmailError()).toBe(true);
  });

  it('should navigate to SignIn from SignUp', async () => {
    await SignUpScreen.tapGoToSignIn();
    expect(await SignInScreen.isShown()).toBe(true);
  });

  it('should register a new tenant account successfully', async () => {
    await SignUpScreen.signUp(
      'Test Tenant',
      uniqueEmail(),
      'Password123!',
      'tenant',
    );
    await waitForDisplayed('join-apartment-screen', TIMEOUT.long);
  });

  it('should register a new landlord account successfully', async () => {
    await SignUpScreen.signUp(
      'Test Landlord',
      uniqueEmail(),
      'Password123!',
      'landlord',
    );
    await waitForDisplayed('apartment-setup-screen', TIMEOUT.long);
  });
});

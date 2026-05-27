import BasePage from './BasePage';
import { tap, typeText, isDisplayed, getText } from '../helpers/utils';

class SignInScreen extends BasePage {
  readonly pageId = 'signin-screen';

  async enterEmail(email: string): Promise<void> {
    await typeText('signin-email-input', email);
  }

  async enterPassword(password: string): Promise<void> {
    await typeText('signin-password-input', password);
  }

  async tapSubmit(): Promise<void> {
    await tap('signin-submit-btn');
  }

  async tapForgotPassword(): Promise<void> {
    await tap('signin-forgot-password-btn');
  }

  async tapGoToSignUp(): Promise<void> {
    await tap('signin-goto-signup-btn');
  }

  async getErrorMessage(): Promise<string | null> {
    if (await isDisplayed('signin-error-message')) {
      return getText('signin-error-message');
    }
    return null;
  }

  async hasEmailError(): Promise<boolean> {
    return isDisplayed('signin-email-input-error');
  }

  async hasPasswordError(): Promise<boolean> {
    return isDisplayed('signin-password-input-error');
  }

  /** Điền form và submit */
  async signIn(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapSubmit();
  }
}

export default new SignInScreen();

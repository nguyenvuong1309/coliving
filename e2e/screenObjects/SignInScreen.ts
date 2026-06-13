import BasePage from './BasePage';
import {
  tap,
  typeText,
  waitForDisplayed,
  waitForExisting,
  dismissIosPasswordSavePrompt,
  TIMEOUT,
} from '../helpers/utils';

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
    try {
      const error = await waitForExisting('signin-error-message', TIMEOUT.medium);
      return error.getText();
    } catch {
      return null;
    }
  }

  async hasEmailError(): Promise<boolean> {
    try {
      await waitForDisplayed('signin-email-input-error', TIMEOUT.short);
      return true;
    } catch {
      return false;
    }
  }

  async hasPasswordError(): Promise<boolean> {
    try {
      await waitForDisplayed('signin-password-input-error', TIMEOUT.short);
      return true;
    } catch {
      return false;
    }
  }

  /** Điền form và submit */
  async signIn(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapSubmit();
    await dismissIosPasswordSavePrompt();
  }
}

export default new SignInScreen();

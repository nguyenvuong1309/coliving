import BasePage from './BasePage';
import {
  tap,
  typeText,
  isDisplayed,
  waitForDisplayed,
  TIMEOUT,
} from '../helpers/utils';

class SignUpScreen extends BasePage {
  readonly pageId = 'signup-screen';

  async enterFullName(name: string): Promise<void> {
    await typeText('signup-fullname-input', name);
  }

  async enterEmail(email: string): Promise<void> {
    await typeText('signup-email-input', email);
  }

  async enterPassword(password: string): Promise<void> {
    await typeText('signup-password-input', password);
  }

  async enterConfirmPassword(password: string): Promise<void> {
    await typeText('signup-confirm-password-input', password);
  }

  async selectRole(role: 'tenant' | 'landlord'): Promise<void> {
    await tap(`signup-role-${role}-btn`);
  }

  async tapSubmit(): Promise<void> {
    await tap('signup-submit-btn');
  }

  async tapGoToSignIn(): Promise<void> {
    await tap('signup-goto-signin-btn');
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      const error = await waitForDisplayed('signup-error-message', TIMEOUT.short);
      return error.getText();
    } catch {
      return null;
    }
  }

  async hasFullNameError(): Promise<boolean> {
    return isDisplayed('signup-fullname-input-error');
  }

  async hasEmailError(): Promise<boolean> {
    return isDisplayed('signup-email-input-error');
  }

  async hasPasswordError(): Promise<boolean> {
    return isDisplayed('signup-password-input-error');
  }

  async hasConfirmPasswordError(): Promise<boolean> {
    return isDisplayed('signup-confirm-password-input-error');
  }

  /** Điền form và submit */
  async signUp(
    fullName: string,
    email: string,
    password: string,
    role: 'tenant' | 'landlord' = 'tenant',
  ): Promise<void> {
    await this.selectRole(role);
    await this.enterFullName(fullName);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.enterConfirmPassword(password);
    await this.tapSubmit();
  }
}

export default new SignUpScreen();

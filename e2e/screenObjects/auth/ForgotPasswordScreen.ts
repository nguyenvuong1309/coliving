import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class ForgotPasswordScreen extends BasePage {
  readonly pageId = 'forgotpassword-screen';

  async enterEmail(email: string): Promise<void> {
    await typeText('forgot-password-email-input', email);
  }

  async tapSubmit(): Promise<void> {
    await tap('forgot-password-submit-btn');
  }

  async requestReset(email: string): Promise<void> {
    await this.enterEmail(email);
    await this.tapSubmit();
  }
}

export default new ForgotPasswordScreen();

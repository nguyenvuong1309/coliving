import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class JoinApartmentScreen extends BasePage {
  readonly pageId = 'join-apartment-screen';

  async enterCode(code: string): Promise<void> {
    await typeText('join-apartment-code-input', code);
  }

  async tapSubmit(): Promise<void> {
    await tap('join-apartment-submit-btn');
  }

  async join(code: string): Promise<void> {
    await this.enterCode(code);
    await this.tapSubmit();
  }
}

export default new JoinApartmentScreen();

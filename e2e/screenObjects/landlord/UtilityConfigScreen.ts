import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class UtilityConfigScreen extends BasePage {
  readonly pageId = 'utility-config-screen';

  async toggleActive(type: string): Promise<void> {
    await tap(`utility-active-${type}`);
  }

  async enterAmount(type: string, amount: string): Promise<void> {
    await typeText(`utility-amount-${type}`, amount);
  }

  async save(type: string): Promise<void> {
    await tap(`utility-save-${type}`);
  }
}

export default new UtilityConfigScreen();

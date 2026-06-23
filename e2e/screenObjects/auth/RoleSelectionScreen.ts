import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class RoleSelectionScreen extends BasePage {
  readonly pageId = 'role-selection-screen';

  async selectRole(role: 'tenant' | 'landlord'): Promise<void> {
    await tap(`role-selection-${role}-btn`);
  }

  async tapContinue(): Promise<void> {
    await tap('role-selection-continue-btn');
  }

  async chooseRole(role: 'tenant' | 'landlord'): Promise<void> {
    await this.selectRole(role);
    await this.tapContinue();
  }
}

export default new RoleSelectionScreen();

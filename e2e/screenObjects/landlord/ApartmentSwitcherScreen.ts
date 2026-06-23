import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class ApartmentSwitcherScreen extends BasePage {
  readonly pageId = 'apartment-switcher-screen';

  async selectApartment(id: string): Promise<void> {
    await tap(`apartment-item-${id}`);
  }

  async hasApartment(id: string): Promise<boolean> {
    return isExisting(`apartment-item-${id}`);
  }
}

export default new ApartmentSwitcherScreen();

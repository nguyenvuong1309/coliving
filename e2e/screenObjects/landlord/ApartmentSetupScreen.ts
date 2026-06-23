import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class ApartmentSetupScreen extends BasePage {
  readonly pageId = 'apartment-setup-screen';

  async enterName(name: string): Promise<void> {
    await typeText('apartment-name-input', name);
  }

  async enterAddress(address: string): Promise<void> {
    await typeText('apartment-address-input', address);
  }

  async enterRooms(rooms: string): Promise<void> {
    await typeText('apartment-rooms-input', rooms);
  }

  async tapSubmit(): Promise<void> {
    await tap('apartment-submit-btn');
  }
}

export default new ApartmentSetupScreen();

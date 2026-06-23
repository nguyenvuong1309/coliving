import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class AssetEditScreen extends BasePage {
  readonly pageId = 'asset-edit-screen';

  async enterName(name: string): Promise<void> {
    await typeText('asset-name-input', name);
  }

  async selectCategory(cat: string): Promise<void> {
    await tap(`asset-category-${cat}`);
  }

  async selectLocation(loc: string): Promise<void> {
    await tap(`asset-location-${loc}`);
  }

  async selectCondition(value: string): Promise<void> {
    await tap(`asset-condition-${value}`);
  }

  async toggleBorrowable(): Promise<void> {
    await tap('asset-borrowable-switch');
  }

  async tapSubmit(): Promise<void> {
    await tap('asset-submit-btn');
  }

  async tapDelete(): Promise<void> {
    await tap('asset-delete-btn');
  }
}

export default new AssetEditScreen();

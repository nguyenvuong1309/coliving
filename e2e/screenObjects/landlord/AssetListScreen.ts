import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class AssetListScreen extends BasePage {
  readonly pageId = 'asset-list-screen';

  async openItem(id: string): Promise<void> {
    await tap(`asset-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`asset-item-${id}`);
  }

  async tapCreateFab(): Promise<void> {
    await tap('asset-create-fab');
  }
}

export default new AssetListScreen();

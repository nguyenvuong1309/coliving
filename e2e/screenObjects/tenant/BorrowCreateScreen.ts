import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class BorrowCreateScreen extends BasePage {
  readonly pageId = 'tenant-borrow-create-screen';

  async selectAsset(assetId: string): Promise<void> {
    await tap(`borrow-asset-${assetId}`);
  }

  async enterNote(note: string): Promise<void> {
    await typeText('borrow-note-input', note);
  }

  async enterDuration(days: string): Promise<void> {
    await typeText('borrow-duration-input', days);
  }

  async tapDueDate(): Promise<void> {
    await tap('borrow-due-date-btn');
  }

  async tapSubmit(): Promise<void> {
    await tap('borrow-submit-btn');
  }
}

export default new BorrowCreateScreen();

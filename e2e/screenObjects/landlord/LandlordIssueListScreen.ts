import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

type IssueFilter = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

class LandlordIssueListScreen extends BasePage {
  readonly pageId = 'landlord-issue-list-screen';

  async filterBy(tab: IssueFilter): Promise<void> {
    await tap(`landlord-issue-filter-${tab}`);
  }

  async openItem(id: string): Promise<void> {
    await tap(`landlord-issue-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`landlord-issue-item-${id}`);
  }
}

export default new LandlordIssueListScreen();

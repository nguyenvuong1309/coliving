import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

type IssueFilter = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

class IssueListScreen extends BasePage {
  readonly pageId = 'tenant-issue-list-screen';

  async filterBy(tab: IssueFilter): Promise<void> {
    await tap(`issue-filter-${tab}`);
  }

  async tapCreateFab(): Promise<void> {
    await tap('issue-create-fab');
  }

  async openItem(id: string): Promise<void> {
    await tap(`issue-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`issue-item-${id}`);
  }
}

export default new IssueListScreen();

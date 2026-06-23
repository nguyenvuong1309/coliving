import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class IssueDetailScreen extends BasePage {
  readonly pageId = 'tenant-issue-detail-screen';

  async tapClose(): Promise<void> {
    await tap('tenant-issue-close-btn');
  }

  async tapReopen(): Promise<void> {
    await tap('tenant-issue-reopen-btn');
  }
}

export default new IssueDetailScreen();

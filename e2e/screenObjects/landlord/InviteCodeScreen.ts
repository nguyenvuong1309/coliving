import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class InviteCodeScreen extends BasePage {
  readonly pageId = 'invite-code-screen';

  async tapCopy(): Promise<void> {
    await tap('invite-copy-btn');
  }

  async tapShare(): Promise<void> {
    await tap('invite-share-btn');
  }
}

export default new InviteCodeScreen();

import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class ProfileCompletionScreen extends BasePage {
  readonly pageId = 'profile-completion-screen';

  async enterName(name: string): Promise<void> {
    await typeText('profile-completion-name-input', name);
  }

  async tapSubmit(): Promise<void> {
    await tap('profile-completion-submit-btn');
  }

  async complete(name: string): Promise<void> {
    await this.enterName(name);
    await this.tapSubmit();
  }
}

export default new ProfileCompletionScreen();

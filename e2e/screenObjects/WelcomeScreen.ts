import BasePage from './BasePage';
import { tap } from '../helpers/utils';

class WelcomeScreen extends BasePage {
  readonly pageId = 'welcome-screen';

  async tapSignUp(): Promise<void> {
    await tap('welcome-signup-btn');
  }

  async tapSignIn(): Promise<void> {
    await tap('welcome-signin-btn');
  }
}

export default new WelcomeScreen();

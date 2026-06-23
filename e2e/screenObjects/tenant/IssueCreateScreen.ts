import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class IssueCreateScreen extends BasePage {
  readonly pageId = 'tenant-issue-create-screen';

  async selectCategory(value: string): Promise<void> {
    await tap(`issue-category-${value}`);
  }

  async selectLocation(value: string): Promise<void> {
    await tap(`issue-location-${value}`);
  }

  async selectUrgency(value: string): Promise<void> {
    await tap(`issue-urgency-${value}`);
  }

  async enterTitle(title: string): Promise<void> {
    await typeText('issue-title-input', title);
  }

  async enterDescription(description: string): Promise<void> {
    await typeText('issue-description-input', description);
  }

  async tapAddImage(): Promise<void> {
    await tap('issue-add-image-btn');
  }

  async tapSubmit(): Promise<void> {
    await tap('issue-submit-btn');
  }
}

export default new IssueCreateScreen();

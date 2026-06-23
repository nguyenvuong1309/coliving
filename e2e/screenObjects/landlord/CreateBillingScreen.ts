import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class CreateBillingScreen extends BasePage {
  readonly pageId = 'create-billing-screen';

  async selectMonth(month: string | number): Promise<void> {
    await tap(`billing-month-${month}`);
  }

  async selectYear(year: string | number): Promise<void> {
    await tap(`billing-year-${year}`);
  }

  async enterRent(tenantId: string, amount: string): Promise<void> {
    await typeText(`billing-rent-${tenantId}`, amount);
  }

  async enterUtility(tenantId: string, amount: string): Promise<void> {
    await typeText(`billing-utility-${tenantId}`, amount);
  }

  async tapDueDate(): Promise<void> {
    await tap('billing-due-date-btn');
  }

  async tapSubmit(): Promise<void> {
    await tap('billing-submit-btn');
  }
}

export default new CreateBillingScreen();

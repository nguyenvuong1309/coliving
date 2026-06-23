import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class DashboardScreen extends BasePage {
  readonly pageId = 'landlord-dashboard-screen';

  async tapOpenIssues(): Promise<void> {
    await tap('dashboard-open-issues-btn');
  }

  async tapBorrowRequests(): Promise<void> {
    await tap('dashboard-borrow-requests-btn');
  }

  async tapCreateBilling(): Promise<void> {
    await tap('dashboard-create-billing-btn');
  }

  async tapApartment(): Promise<void> {
    await tap('dashboard-apartment-btn');
  }
}

export default new DashboardScreen();

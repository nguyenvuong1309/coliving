import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class ReportExportScreen extends BasePage {
  readonly pageId = 'report-export-screen';

  async tapCopy(): Promise<void> {
    await tap('report-copy-btn');
  }
}

export default new ReportExportScreen();

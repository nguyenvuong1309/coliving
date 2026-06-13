import {
  byId,
  isExisting,
  waitForExisting,
  TIMEOUT,
} from '../helpers/utils';

export default abstract class BasePage {
  /** testID của container ngoài cùng của screen */
  abstract readonly pageId: string;

  async waitForShown(timeout = TIMEOUT.long): Promise<void> {
    await waitForExisting(this.pageId, timeout);
  }

  async isShown(): Promise<boolean> {
    return isExisting(this.pageId);
  }

  async waitForHidden(timeout = TIMEOUT.medium): Promise<void> {
    const el = await $(byId(this.pageId));
    await el.waitForDisplayed({ timeout, reverse: true });
  }
}

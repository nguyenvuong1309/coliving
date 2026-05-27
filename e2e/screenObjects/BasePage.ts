import { byId, isDisplayed, waitForDisplayed, TIMEOUT } from '../helpers/utils';

export default abstract class BasePage {
  /** testID của container ngoài cùng của screen */
  abstract readonly pageId: string;

  async waitForShown(timeout = TIMEOUT.long): Promise<void> {
    await waitForDisplayed(this.pageId, timeout);
  }

  async isShown(): Promise<boolean> {
    return isDisplayed(this.pageId);
  }

  async waitForHidden(timeout = TIMEOUT.medium): Promise<void> {
    const el = await $(byId(this.pageId));
    await el.waitForDisplayed({ timeout, reverse: true });
  }
}

export const TIMEOUT = {
  short: 3_000,
  medium: 10_000,
  long: 30_000,
};

/** Tạo selector bằng accessibility ID (testID trong React Native) */
export function byId(testID: string): string {
  return `~${testID}`;
}

/** Chờ element xuất hiện và trả về nó */
export async function waitForDisplayed(
  testID: string,
  timeout = TIMEOUT.medium,
): Promise<WebdriverIO.Element> {
  const el = await $(byId(testID));
  await el.waitForDisplayed({ timeout });
  return el;
}

/** Tap vào element theo testID */
export async function tap(testID: string): Promise<void> {
  const el = await waitForDisplayed(testID);
  await el.click();
}

/** Nhập text vào field theo testID */
export async function typeText(testID: string, text: string): Promise<void> {
  const el = await waitForDisplayed(testID);
  await el.clearValue();
  await el.setValue(text);
  try {
    await driver.hideKeyboard();
  } catch {
    // ignore nếu keyboard không hiện
  }
}

/** Lấy text của element */
export async function getText(testID: string): Promise<string> {
  const el = await waitForDisplayed(testID);
  return el.getText();
}

/** Kiểm tra element có đang hiển thị không (không throw nếu không tìm thấy) */
export async function isDisplayed(testID: string): Promise<boolean> {
  try {
    const el = await $(byId(testID));
    return el.isDisplayed();
  } catch {
    return false;
  }
}

/** Chờ element biến mất */
export async function waitForHidden(
  testID: string,
  timeout = TIMEOUT.medium,
): Promise<void> {
  const el = await $(byId(testID));
  await el.waitForDisplayed({ timeout, reverse: true });
}

/** Scroll đến element */
export async function scrollToElement(
  testID: string,
): Promise<WebdriverIO.Element> {
  const el = await $(byId(testID));
  await el.scrollIntoView();
  return el;
}

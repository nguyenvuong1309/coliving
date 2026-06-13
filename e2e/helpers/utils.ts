export const TIMEOUT = {
  short: 3_000,
  medium: 10_000,
  long: 30_000,
};

/** Tạo selector bằng accessibility ID (testID trong React Native) */
export function byId(testID: string): string {
  return `~${testID}`;
}

function xpathLiteral(value: string): string {
  if (!value.includes("'")) {
    return `'${value}'`;
  }
  if (!value.includes('"')) {
    return `"${value}"`;
  }
  return `concat(${value
    .split("'")
    .map(part => `'${part}'`)
    .join(`, "'", `)})`;
}

/** Selector text dùng được cho cả Android và iOS native context. */
export function byText(text: string): string {
  const value = xpathLiteral(text);
  return `//*[@text=${value} or @label=${value} or @name=${value} or @value=${value}]`;
}

/** Chờ element xuất hiện và trả về nó */
export async function waitForDisplayed(
  testID: string,
  timeout = TIMEOUT.medium,
): Promise<WebdriverIO.Element> {
  const el = await $(byId(testID));
  if (testID.endsWith('-screen')) {
    await el.waitForExist({ timeout });
    return el;
  }

  await el.waitForDisplayed({ timeout });
  return el;
}

export async function waitForExisting(
  testID: string,
  timeout = TIMEOUT.medium,
): Promise<WebdriverIO.Element> {
  const el = await $(byId(testID));
  await el.waitForExist({ timeout });
  return el;
}

async function tapAt(x: number, y: number): Promise<void> {
  try {
    await driver.execute('mobile: tap', { x, y });
    return;
  } catch {
    await driver.touchAction({ action: 'tap', x, y });
  }
}

export async function dismissKeyboard(): Promise<void> {
  if (driver.isIOS) {
    const { width, height } = await driver.getWindowSize();
    await tapAt(Math.round(width * 0.5), Math.round(height * 0.18));
    await driver.pause(300);
    return;
  }

  try {
    await driver.hideKeyboard();
  } catch {
    // ignore nếu keyboard không hiện
  }
}

async function makeDisplayed(
  el: WebdriverIO.Element,
  timeout = TIMEOUT.medium,
): Promise<WebdriverIO.Element> {
  await el.waitForExist({ timeout });
  if (await el.isDisplayed().catch(() => false)) {
    return el;
  }

  await dismissKeyboard();
  if (await el.isDisplayed().catch(() => false)) {
    return el;
  }

  try {
    await el.scrollIntoView();
  } catch {
    await scrollDown();
  }

  await el.waitForDisplayed({ timeout });
  return el;
}

/** Tap vào element theo testID */
export async function tap(testID: string): Promise<void> {
  const selector = byId(testID);
  const el = await $(selector);
  try {
    await (await makeDisplayed(el)).click();
  } catch (error) {
    if (driver.isIOS) {
      const freshEl = await $(selector);
      await freshEl.waitForExist({ timeout: TIMEOUT.medium });
      await freshEl.click();
      return;
    }
    throw error;
  }
}

/** Tap vào element đã tồn tại, kể cả khi iOS báo visible=false. */
export async function tapExisting(
  testID: string,
  timeout = TIMEOUT.medium,
): Promise<void> {
  const el = await $(byId(testID));
  await el.waitForExist({ timeout });
  if (driver.isIOS) {
    const { x, y } = await el.getLocation();
    const { width, height } = await el.getSize();
    await tapAt(Math.round(x + width / 2), Math.round(y + height / 2));
    return;
  }

  await el.click();
}

export async function waitForText(
  text: string,
  timeout = TIMEOUT.medium,
): Promise<WebdriverIO.Element> {
  const el = await $(byText(text));
  await el.waitForDisplayed({ timeout });
  return el;
}

export async function tapText(
  text: string,
  timeout = TIMEOUT.medium,
): Promise<void> {
  const selector = byText(text);
  const el = await $(selector);
  try {
    await (await makeDisplayed(el, timeout)).click();
  } catch (error) {
    if (driver.isIOS) {
      const freshEl = await $(selector);
      await freshEl.waitForExist({ timeout });
      await freshEl.click();
      return;
    }
    throw error;
  }
}

export async function openBottomTab(label: string): Promise<void> {
  try {
    await tapText(label, TIMEOUT.short);
    return;
  } catch {
    await tapText('More', TIMEOUT.short);
    await tapText(label, TIMEOUT.medium);
  }
}

/** Nhập text vào field theo testID */
export async function typeText(testID: string, text: string): Promise<void> {
  const el = await makeDisplayed(await $(byId(testID)));
  await el.clearValue();
  await el.setValue(text);
}

/** Lấy text của element */
export async function getText(testID: string): Promise<string> {
  const el = await makeDisplayed(await $(byId(testID)));
  return el.getText();
}

/** Kiểm tra element có đang hiển thị không (không throw nếu không tìm thấy) */
export async function isDisplayed(testID: string): Promise<boolean> {
  try {
    const el = await $(byId(testID));
    if (testID.endsWith('-screen')) {
      return el.isExisting();
    }

    return el.isDisplayed();
  } catch {
    return false;
  }
}

export async function isExisting(testID: string): Promise<boolean> {
  try {
    return $(byId(testID)).isExisting();
  } catch {
    return false;
  }
}

export async function isTextDisplayed(text: string): Promise<boolean> {
  try {
    return $(byText(text)).isDisplayed();
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

/** Chọn nút xác nhận mặc định của native Alert. */
export async function acceptAlert(buttonLabel?: string): Promise<void> {
  await driver.waitUntil(
    async () => {
      try {
        await driver.getAlertText();
        return true;
      } catch {
        return false;
      }
    },
    { timeout: TIMEOUT.medium, timeoutMsg: 'Native alert did not appear' },
  );
  if (buttonLabel && driver.isIOS) {
    await driver.execute('mobile: alert', {
      action: 'accept',
      buttonLabel,
    });
    return;
  }
  await driver.acceptAlert();
}

export async function dismissAlert(): Promise<void> {
  await driver.waitUntil(
    async () => {
      try {
        await driver.getAlertText();
        return true;
      } catch {
        return false;
      }
    },
    { timeout: TIMEOUT.medium, timeoutMsg: 'Native alert did not appear' },
  );
  await driver.dismissAlert();
}

export async function dismissIosPasswordSavePrompt(
  timeout = TIMEOUT.short,
): Promise<void> {
  if (!driver.isIOS) {
    return;
  }

  try {
    const notNowButton = await $(byText('Not Now'));
    await notNowButton.waitForExist({ timeout, interval: 250 });
    await notNowButton.click();
    await driver.pause(300);
  } catch {
    // The prompt is controlled by iOS and does not appear on every simulator.
  }

  try {
    const source = await driver.getPageSource();
    if (!source.includes('Save Password')) {
      return;
    }

    const { width, height } = await driver.getWindowSize();
    await tapAt(Math.round(width * 0.33), Math.round(height * 0.72));
    await driver.pause(300);
  } catch {
    // ignore non-blocking prompt cleanup
  }
}

export async function scrollDown(): Promise<void> {
  if (driver.isIOS) {
    await driver.execute('mobile: swipe', { direction: 'up' });
    return;
  }

  const { width, height } = await driver.getWindowSize();
  await driver.touchAction([
    {
      action: 'press',
      x: Math.round(width * 0.5),
      y: Math.round(height * 0.75),
    },
    { action: 'wait', ms: 300 },
    {
      action: 'moveTo',
      x: Math.round(width * 0.5),
      y: Math.round(height * 0.25),
    },
    'release',
  ]);
}

export async function scrollUntilDisplayed(
  testID: string,
  attempts = 5,
): Promise<WebdriverIO.Element> {
  const element = await $(byId(testID));
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await element.isDisplayed().catch(() => false)) {
      return element;
    }
    await scrollDown();
  }
  await element.waitForDisplayed({ timeout: TIMEOUT.short });
  return element;
}

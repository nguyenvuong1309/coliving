import { FIXTURE_ID } from '../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../helpers/session';
import {
  dismissKeyboard,
  openBottomTab,
  tap,
  tapExisting,
  typeText,
  waitForDisplayed,
  waitForExisting,
} from '../helpers/utils';

describe('Debug borrow submit', () => {
  it('prints source after submit', async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await openBottomTab('Mượn đồ');
    await waitForDisplayed('tenant-borrow-list-screen');
    await tapExisting('borrow-create-fab');
    await waitForDisplayed('tenant-borrow-create-screen');
    await tap(`borrow-asset-${FIXTURE_ID.assetWasher}`);
    await typeText('borrow-note-input', 'E2E muon them');
    await typeText('borrow-duration-input', '3 ngay');
    await dismissKeyboard();
    await tap('borrow-submit-btn');
    await driver.pause(3000);
    const source = await driver.getPageSource();
    console.log(
      JSON.stringify({
        hasCreate: source.includes('tenant-borrow-create-screen'),
        hasList: source.includes('tenant-borrow-list-screen'),
        hasAssetError: source.includes('asset_id'),
        hasDurationError: source.includes('Thoi gian'),
        hasLoading: source.includes('Dang tao yeu cau'),
        hasWasher: source.includes('May giat E2E'),
        hasSubmit: source.includes('borrow-submit-btn'),
        hasSelected: source.includes('borrow-asset-' + FIXTURE_ID.assetWasher),
        sample: source.replace(/\s+/g, ' ').slice(0, 4000),
      }),
    );
    await waitForExisting('tenant-borrow-create-screen');
  });
});

import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  isTextDisplayed,
  openBottomTab,
  tap,
  tapText,
  typeText,
  waitForDisplayed,
  waitForText,
} from '../../helpers/utils';

describe('Landlord asset management', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
    await openBottomTab('Tài sản');
    await waitForDisplayed('asset-list-screen');
  });

  it('creates, updates and deletes an asset', async () => {
    await tap('asset-create-fab');
    await waitForDisplayed('asset-edit-screen');
    await tap('asset-submit-btn');
    await acceptAlert();

    await typeText('asset-name-input', 'Tu lanh E2E');
    await tap('asset-category-Dien tu');
    await tap('asset-location-Bep');
    await tap('asset-condition-good');
    await tap('asset-submit-btn');
    await waitForDisplayed('asset-list-screen');
    await waitForText('Tu lanh E2E');

    await tapText('Tu lanh E2E');
    await waitForDisplayed('asset-edit-screen');
    await typeText('asset-name-input', 'Tu lanh E2E Updated');
    await tap('asset-condition-fair');
    await tap('asset-submit-btn');
    await waitForDisplayed('asset-list-screen');
    await waitForText('Tu lanh E2E Updated');

    await tap(`asset-item-${FIXTURE_ID.assetWasher}`);
    await waitForDisplayed('asset-edit-screen');
    await tap('asset-delete-btn');
    await acceptAlert('Xoa');
    await waitForDisplayed('asset-list-screen');
    expect(await isTextDisplayed('May giat E2E')).toBe(false);
  });
});

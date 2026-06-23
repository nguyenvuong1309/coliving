/**
 * Demo: cùng luồng "mượn đồ" nhưng viết hoàn toàn bằng Page Object
 * (so sánh với borrow.spec.ts dùng testID trực tiếp).
 * Bao phủ: happy path + validation (submit khi chưa chọn tài sản).
 */
import {FIXTURE_ID} from '../../helpers/fixtures';
import {restartAtWelcome, signInAs} from '../../helpers/session';
import {dismissKeyboard, isExisting, openBottomTab, TIMEOUT} from '../../helpers/utils';
import {
  BorrowListScreen,
  BorrowCreateScreen,
} from '../../screenObjects';

describe('Tenant borrow flow (Page Object)', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await openBottomTab('Mượn đồ');
    await BorrowListScreen.waitForShown();
  });

  it('creates a borrow request through the happy path', async () => {
    await BorrowListScreen.tapCreateFab();
    await BorrowCreateScreen.waitForShown();

    await BorrowCreateScreen.selectAsset(FIXTURE_ID.assetWasher);
    await BorrowCreateScreen.enterNote('E2E POM muon');
    await BorrowCreateScreen.enterDuration('3 ngay');
    await dismissKeyboard();
    await BorrowCreateScreen.tapSubmit();

    await BorrowListScreen.waitForShown(TIMEOUT.long);
  });

  it('keeps the user on the form when submitting without an asset', async () => {
    await BorrowListScreen.tapCreateFab();
    await BorrowCreateScreen.waitForShown();

    // Chưa chọn tài sản -> submit phải bị chặn, vẫn ở lại màn hình tạo.
    await BorrowCreateScreen.tapSubmit();
    await BorrowCreateScreen.waitForShown(TIMEOUT.short);
    expect(await isExisting('tenant-borrow-create-screen')).toBe(true);
  });
});

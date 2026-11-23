import { test as base } from '@playwright/test';
import { AccountSuccessPage } from '../pages/AccountSuccessPage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { RegisterPage } from '../pages/RegisterPage';

type Pages = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountSuccessPage: AccountSuccessPage;
  myAccountPage: MyAccountPage;
  logoutPage: LogoutPage;
};

/**
 * Playwright `test` extended with one fixture per page object.
 * Each is created lazily, only for tests that ask for it, and shares that test's `page`.
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  accountSuccessPage: async ({ page }, use) => use(new AccountSuccessPage(page)),
  myAccountPage: async ({ page }, use) => use(new MyAccountPage(page)),
  logoutPage: async ({ page }, use) => use(new LogoutPage(page)),
});

export { expect } from '@playwright/test';

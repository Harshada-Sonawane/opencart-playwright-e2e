import type { Locator, Page } from '@playwright/test';

export class LogoutPage {
  static readonly path = 'index.php?route=account/logout';

  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Account Logout' });
  }

  async goto() {
    await this.page.goto(LogoutPage.path);
  }
}

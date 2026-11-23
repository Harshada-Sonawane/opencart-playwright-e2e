import type { Locator, Page } from '@playwright/test';

export class AccountSuccessPage {
  static readonly urlPattern = /route=account\/success/;

  readonly heading: Locator;
  readonly congratulationsText: Locator;
  readonly continueLink: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Your Account Has Been Created!' });
    this.congratulationsText = page.getByText('Congratulations! Your new account has been successfully created!');
    this.continueLink = page.getByRole('link', { name: 'Continue' });
  }

  async continue() {
    await this.continueLink.click();
  }
}

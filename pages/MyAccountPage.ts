import type { Locator, Page } from '@playwright/test';

export class MyAccountPage {
  static readonly urlPattern = /route=account\/account/;

  readonly heading: Locator;
  readonly logoutLink: Locator;

  constructor(readonly page: Page) {
    // level 2 distinguishes the page heading from the footer's "My Account" (h5).
    this.heading = page.getByRole('heading', { level: 2, name: 'My Account' });
    // The header dropdown's Logout link is hidden, so only the sidebar link matches.
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }
}

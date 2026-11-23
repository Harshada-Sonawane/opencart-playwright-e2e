import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  static readonly path = 'index.php?route=account/login';
  static readonly urlPattern = /route=account\/login/;

  readonly newCustomerHeading: Locator;
  readonly registerAccountText: Locator;
  readonly newCustomerContinueLink: Locator;
  readonly returningCustomerHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(readonly page: Page) {
    this.newCustomerHeading = page.getByRole('heading', { name: 'New Customer' });
    this.registerAccountText = page.getByText('Register Account', { exact: true });
    this.newCustomerContinueLink = page.getByRole('link', { name: 'Continue' });
    this.returningCustomerHeading = page.getByRole('heading', { name: 'Returning Customer' });
    this.emailInput = page.getByRole('textbox', { name: 'E-Mail Address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto(LoginPage.path);
  }

  async continueAsNewCustomer() {
    await this.newCustomerContinueLink.click();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

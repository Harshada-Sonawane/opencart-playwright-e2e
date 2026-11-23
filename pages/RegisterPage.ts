import type { Locator, Page } from '@playwright/test';

export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
  confirm: string;
  agree: boolean;
  newsletter?: boolean;
};

export class RegisterPage {
  // Relative (no leading "/") so it resolves under the /opencart/ baseURL.
  static readonly path = 'index.php?route=account/register';
  static readonly urlPattern = /route=account\/register/;

  static readonly errors = {
    privacyPolicy: 'Warning: You must agree to the Privacy Policy!',
    emailTaken: 'Warning: E-Mail Address is already registered!',
    firstName: 'First Name must be between 1 and 32 characters!',
    lastName: 'Last Name must be between 1 and 32 characters!',
    email: 'E-Mail Address does not appear to be valid!',
    telephone: 'Telephone must be between 3 and 32 characters!',
    password: 'Password must be between 4 and 20 characters!',
    confirm: 'Password confirmation does not match password!',
  } as const;

  readonly heading: Locator;
  readonly loginPageLink: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly telephone: Locator;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly newsletterYes: Locator;
  readonly newsletterNo: Locator;
  /** The "I have read and agree to the Privacy Policy" row holding the checkbox and submit button. */
  readonly agreement: Locator;
  readonly privacyPolicyLink: Locator;
  readonly privacyCheckbox: Locator;
  readonly continueButton: Locator;
  /** Matches any inline per-field validation message. */
  readonly fieldErrors: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Register Account' });
    this.loginPageLink = page.getByRole('link', { name: 'login page' });
    this.firstName = page.getByRole('textbox', { name: '* First Name' });
    this.lastName = page.getByRole('textbox', { name: '* Last Name' });
    this.email = page.getByRole('textbox', { name: '* E-Mail' });
    this.telephone = page.getByRole('textbox', { name: '* Telephone' });
    this.password = page.getByRole('textbox', { name: '* Password', exact: true });
    this.confirm = page.getByRole('textbox', { name: '* Password Confirm' });
    this.newsletterYes = page.getByRole('radio', { name: 'Yes' });
    this.newsletterNo = page.getByRole('radio', { name: 'No' });
    // Scoped to the agreement row: the footer has its own "Privacy Policy" link.
    this.agreement = page.getByText('I have read and agree to the');
    this.privacyPolicyLink = this.agreement.getByRole('link', { name: 'Privacy Policy' });
    this.privacyCheckbox = this.agreement.getByRole('checkbox');
    this.continueButton = this.agreement.getByRole('button', { name: 'Continue' });
    this.fieldErrors = page.getByText(
      /must be between \d+ and \d+ characters!|does not appear to be valid!|does not match password!/,
    );
  }

  async goto() {
    await this.page.goto(RegisterPage.path);
  }

  /** The visible message for a given error, whether it's the top alert or an inline field error. */
  error(key: keyof typeof RegisterPage.errors): Locator {
    return this.page.getByText(RegisterPage.errors[key]);
  }

  textFields(): Locator[] {
    return [this.firstName, this.lastName, this.email, this.telephone, this.password, this.confirm];
  }

  async fill(data: SignupData) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.telephone.fill(data.telephone);
    await this.password.fill(data.password);
    await this.confirm.fill(data.confirm);
    if (data.newsletter) await this.newsletterYes.check();
    if (data.agree) await this.privacyCheckbox.check();
  }

  async submit() {
    await this.continueButton.click();
  }

  async register(data: SignupData) {
    await this.fill(data);
    await this.submit();
  }

  async isEmailNativelyValid(): Promise<boolean> {
    return this.email.evaluate((el: HTMLInputElement) => el.checkValidity());
  }
}

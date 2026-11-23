import { test, expect } from '../fixtures/fixtures';
import { AccountSuccessPage } from '../pages/AccountSuccessPage';
import { LoginPage } from '../pages/LoginPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { RegisterPage } from '../pages/RegisterPage';
import { duplicateAttemptName, users } from '../test-data/users';

test.describe('OpenCart signup', () => {
  test('login page links to the registration form', async ({ page, loginPage, registerPage }) => {
    await loginPage.goto();

    await expect(loginPage.newCustomerHeading).toBeVisible();
    await expect(loginPage.registerAccountText).toBeVisible();
    await loginPage.continueAsNewCustomer();

    await expect(page).toHaveURL(RegisterPage.urlPattern);
    await expect(page).toHaveTitle('Register Account');
    await expect(registerPage.heading).toBeVisible();
  });

  test.describe('registration form', () => {
    test.beforeEach(async ({ registerPage }) => {
      await registerPage.goto();
    });

    test('renders all fields with the expected defaults', async ({ registerPage }) => {
      for (const field of registerPage.textFields()) {
        await expect(field).toBeVisible();
        await expect(field).toBeEmpty();
      }
      await expect(registerPage.email).toHaveAttribute('type', 'email');
      await expect(registerPage.password).toHaveAttribute('type', 'password');
      await expect(registerPage.confirm).toHaveAttribute('type', 'password');

      await expect(registerPage.newsletterNo).toBeChecked();
      await expect(registerPage.newsletterYes).not.toBeChecked();
      await expect(registerPage.privacyCheckbox).not.toBeChecked();
      await expect(registerPage.privacyPolicyLink).toBeVisible();
    });

    test('"login page" link goes back to login', async ({ page, registerPage, loginPage }) => {
      await registerPage.loginPageLink.click();
      await expect(page).toHaveURL(LoginPage.urlPattern);
      await expect(loginPage.returningCustomerHeading).toBeVisible();
    });

    test('submitting an empty form shows every required-field error', async ({ page, registerPage }) => {
      await registerPage.submit();

      await expect(registerPage.error('privacyPolicy')).toBeVisible();
      await expect(registerPage.error('firstName')).toBeVisible();
      await expect(registerPage.error('lastName')).toBeVisible();
      await expect(registerPage.error('email')).toBeVisible();
      await expect(registerPage.error('telephone')).toBeVisible();
      await expect(registerPage.error('password')).toBeVisible();
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });

    test('rejects a valid form when the privacy policy is not accepted', async ({ page, registerPage }) => {
      await registerPage.register(users.withoutPrivacyConsent());

      await expect(registerPage.error('privacyPolicy')).toBeVisible();
      await expect(registerPage.fieldErrors).toHaveCount(0);
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });

    test('rejects mismatched password confirmation', async ({ page, registerPage }) => {
      await registerPage.register(users.mismatchedPassword());

      await expect(registerPage.error('confirm')).toBeVisible();
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });

    test('enforces server-side field length and format rules', async ({ page, registerPage }) => {
      await registerPage.register(users.outOfRangeFields());

      await expect(registerPage.error('firstName')).toBeVisible();
      await expect(registerPage.error('lastName')).toBeVisible();
      await expect(registerPage.error('email')).toBeVisible();
      await expect(registerPage.error('telephone')).toBeVisible();
      await expect(registerPage.error('password')).toBeVisible();
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });

    test('rejects a password longer than 20 characters', async ({ page, registerPage }) => {
      // Known defect: the message says "4 and 20 characters" but the demo store accepts
      // a 21-character password and creates the account. Remove test.fail() once fixed.
      test.fail(true, 'Site does not enforce the 20-character maximum it advertises');
      await registerPage.register(users.passwordTooLong());

      await expect(registerPage.error('password')).toBeVisible();
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });

    test('browser blocks submission of an email without "@"', async ({ page, registerPage }) => {
      await registerPage.register(users.emailWithoutAt());

      expect(await registerPage.isEmailNativelyValid()).toBe(false);
      // Native validation stops the POST, so no server-side errors appear.
      await expect(registerPage.fieldErrors).toHaveCount(0);
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });

    test('keeps entered values after a failed submission', async ({ registerPage }) => {
      const user = users.withoutPrivacyConsent();
      await registerPage.register(user);

      await expect(registerPage.firstName).toHaveValue(user.firstName);
      await expect(registerPage.lastName).toHaveValue(user.lastName);
      await expect(registerPage.email).toHaveValue(user.email);
      await expect(registerPage.telephone).toHaveValue(user.telephone);
    });
  });

  test.describe('successful registration', () => {
    test('creates the account and lands on My Account', async ({
      page,
      registerPage,
      accountSuccessPage,
      myAccountPage,
    }) => {
      await registerPage.goto();
      await registerPage.register(users.withNewsletter());

      await expect(page).toHaveURL(AccountSuccessPage.urlPattern);
      await expect(accountSuccessPage.heading).toBeVisible();
      await expect(accountSuccessPage.congratulationsText).toBeVisible();

      await accountSuccessPage.continue();
      await expect(page).toHaveURL(MyAccountPage.urlPattern);
      await expect(myAccountPage.heading).toBeVisible();
      await expect(myAccountPage.logoutLink).toBeVisible();
    });

    test('new credentials can log in after logging out', async ({
      page,
      registerPage,
      logoutPage,
      loginPage,
      myAccountPage,
    }) => {
      const user = users.valid();

      await registerPage.goto();
      await registerPage.register(user);
      await expect(page).toHaveURL(AccountSuccessPage.urlPattern);

      await logoutPage.goto();
      await expect(logoutPage.heading).toBeVisible();

      await loginPage.goto();
      await loginPage.login(user.email, user.password);

      await expect(page).toHaveURL(MyAccountPage.urlPattern);
      await expect(myAccountPage.heading).toBeVisible();
    });

    test('rejects an email that is already registered', async ({ page, registerPage, logoutPage }) => {
      const user = users.valid();

      await registerPage.goto();
      await registerPage.register(user);
      await expect(page).toHaveURL(AccountSuccessPage.urlPattern);

      await logoutPage.goto();
      await registerPage.goto();
      await registerPage.register({ ...user, ...duplicateAttemptName });

      await expect(registerPage.error('emailTaken')).toBeVisible();
      await expect(page).toHaveURL(RegisterPage.urlPattern);
    });
  });
});

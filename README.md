# OpenCart Playwright E2E

End-to-end tests for the account signup flow of the [OpenCart demo store](https://naveenautomationlabs.com/opencart/), written with [Playwright](https://playwright.dev/) and TypeScript.

- **Page Object Model**: one class per page in `pages/`
- **Custom fixtures**: page objects are injected into tests (`{ registerPage, loginPage, ... }`)
- **Role-based locators** (`getByRole`, `getByText`) instead of CSS/XPath
- **Data-driven scenarios** with a unique email per test, so tests run in parallel and can be re-run safely
- **Cross-browser**: Chromium, Firefox, and WebKit
- **CI** on GitHub Actions, with the HTML report uploaded as an artifact

## Prerequisites

- Node.js 18 or later (LTS recommended)

## Setup

```bash
npm ci                           # install dependencies
npx playwright install --with-deps   # install browsers
```

Then create a `.env` file in the project root:

```dotenv
SIGNUP_PASSWORD=your-password-here
```

`SIGNUP_PASSWORD` is the password used for every account the tests create. It must be 4–20 characters. `.env` is git-ignored, so it never gets committed.

## Running tests

| Command | What it does |
|---|---|
| `npm test` | Run all tests in all browsers (headless) |
| `npm run test:chromium` | Run in Chromium only (fastest for local work) |
| `npm run test:headed` | Run with visible browser windows |
| `npm run test:ui` | Open Playwright UI mode (pick, watch, and re-run tests) |
| `npm run test:debug` | Step through tests with the Playwright Inspector |
| `npm run report` | Open the HTML report from the last run |
| `npm run typecheck` | Type-check the project without running tests |
| `npm run codegen` | Record actions on the site and generate locators |

Pass extra Playwright options after `--`:

```bash
npm test -- -g "registration form"              # only tests whose title matches
npm run test:chromium -- tests/signup.spec.ts:67    # a single test by line number
```

## Project structure

```
├── tests/                 # Test specs
│   └── signup.spec.ts
├── pages/                 # Page objects: locators + actions, no assertions
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── AccountSuccessPage.ts
│   ├── MyAccountPage.ts
│   └── LogoutPage.ts
├── fixtures/fixtures.ts   # Extends `test` with one fixture per page object
├── test-data/users.ts     # Named signup scenarios (valid, mismatched password, ...)
├── utils/
│   ├── email.ts           # uniqueEmail(): fresh @example.com address per call
│   └── env.ts             # requireEnv(): reads a required environment variable
├── playwright.config.ts   # Base URL, browsers, retries, reporter; loads .env
└── .github/workflows/     # CI pipeline
```

## Test coverage

**Navigation**: the login page links to the registration form and back.

**Form validation** (stays on the Register page with the right error):
- empty submission shows every required-field error
- privacy policy not accepted
- password confirmation mismatch
- out-of-range field lengths and invalid email (server-side)
- email without `@` (blocked by browser validation)
- entered values are kept after a failed submission

**Successful registration**:
- new account lands on the success page, then My Account
- new credentials can log in after logging out
- an already-registered email is rejected

### Known issue

`rejects a password longer than 20 characters` is marked `test.fail()`. The site says passwords must be 4–20 characters but accepts 21. When the site is fixed, the test will report an unexpected pass. Remove `test.fail()` at that point.

## Writing a new test

1. Add or extend a page object in `pages/` (locators in the constructor, actions as methods).
2. Register new page objects in `fixtures/fixtures.ts`.
3. Add a scenario to `users` in `test-data/users.ts` if you need new data.
4. Import `test` and `expect` from `../fixtures/fixtures` (not `@playwright/test`) and request page objects as fixtures:

```ts
import { test, expect } from '../fixtures/fixtures';
import { users } from '../test-data/users';

test('example', async ({ registerPage }) => {
  await registerPage.goto();
  await registerPage.register(users.valid());
  // assertions here
});
```

## CI

`.github/workflows/playwright.yml` runs the suite on every push and pull request to `main`. Add `SIGNUP_PASSWORD` under **Settings → Secrets and variables → Actions**. The HTML report is uploaded as the `playwright-report` artifact and kept for 30 days.

> The tests run against a shared public demo site and create real accounts there (using reserved `@example.com` addresses). Results can be affected by the site's availability.

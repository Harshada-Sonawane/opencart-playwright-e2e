import type { SignupData } from '../pages/RegisterPage';
import { uniqueEmail } from '../utils/email';
import { requireEnv } from '../utils/env';

/** Baseline values that satisfy every validation rule on the Register form. */
const defaults = {
  firstName: 'Play',
  lastName: 'Wright',
  telephone: '5551234',
} as const;

/** A complete, valid signup with a fresh email. Pass overrides to vary individual fields. */
export function validUser(overrides: Partial<SignupData> = {}): SignupData {
  // Read at call time, so a missing value fails only the tests that need it.
  const password = requireEnv('SIGNUP_PASSWORD');
  return {
    firstName: defaults.firstName,
    lastName: defaults.lastName,
    email: uniqueEmail(),
    telephone: defaults.telephone,
    password,
    confirm: password,
    agree: true,
    ...overrides,
  };
}

const tooLongPassword = 'p'.repeat(21);

/**
 * Named signup scenarios. Each is a function so every call gets its own unique email.
 */
export const users = {
  valid: () => validUser(),

  withNewsletter: () => validUser({ newsletter: true }),

  withoutPrivacyConsent: () => validUser({ agree: false }),

  mismatchedPassword: () => validUser({ confirm: 'Different123' }),

  /** Every field just outside its allowed range. */
  outOfRangeFields: () =>
    validUser({
      firstName: 'A'.repeat(33), // max 32
      lastName: 'B'.repeat(33), // max 32
      email: 'user@nodomain', // passes the browser's type=email check, fails the server's
      telephone: '12', // min 3
      password: 'abc', // min 4
      confirm: 'abc',
    }),

  /** 21 characters: one over the 20-character maximum the site advertises. */
  passwordTooLong: () => validUser({ password: tooLongPassword, confirm: tooLongPassword }),

  /** Blocked by the browser's built-in email validation before the form is sent. */
  emailWithoutAt: () => validUser({ email: 'not-an-email' }),
};

/** Different name used when re-registering an existing email, so only the email collides. */
export const duplicateAttemptName = { firstName: 'Second', lastName: 'Attempt' } as const;

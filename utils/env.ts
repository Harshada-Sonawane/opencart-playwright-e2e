/**
 * Returns the value of a required environment variable, or throws a clear error if it's missing.
 *
 * Values come from the shell or CI, or from `.env`, which playwright.config.ts loads into `process.env`.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Set it in .env or in your shell/CI environment.`);
  }
  return value;
}

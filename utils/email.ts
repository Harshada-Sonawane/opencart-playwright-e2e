import { randomUUID } from 'node:crypto';

/**
 * Returns a new, never-before-used email address on every call.
 *
 * The demo store is shared and rejects already-registered emails, so each signup needs
 * a fresh address. A timestamp plus a random UUID fragment keeps addresses unique across
 * tests, parallel workers, browser projects and runs. `example.com` is reserved (RFC 2606),
 * so no real mailbox ever receives mail.
 */
export function uniqueEmail(prefix = 'pw.signup'): string {
  return `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
}

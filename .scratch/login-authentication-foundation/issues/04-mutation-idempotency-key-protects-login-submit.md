Status: needs-triage

# Mutation Idempotency Key protects login submit

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Add server-function mutation idempotency middleware requiring `x-idempotency-key`, deduping duplicate pending login submits, reusing short-lived successful results, and allowing retry after failures.

## Acceptance criteria

- [ ] Missing `x-idempotency-key` fails loudly for idempotent mutation endpoints.
- [ ] Duplicate pending requests with same key share same work/result and do not repeat backend side effects.
- [ ] Success results are reused within TTL; failed attempts remain retryable with fresh key; in-memory limitation is documented.

## Blocked by

- `.scratch/login-authentication-foundation/issues/01-auth-server-foundation-session-establishment-and-current-session.md`

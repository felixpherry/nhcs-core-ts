Status: needs-triage

# TanStack Form login form uses `useAppForm`

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Build login UI workflow on TanStack Form `useAppForm` with shared field primitives, preserving login UX behavior (trimmed userId, password show/hide, pending submit, non-modal form errors, password retained on failure).

## Acceptance criteria

- [ ] Login form uses app form abstraction and shared input/textarea field primitives, not Conform/RHF patterns.
- [ ] Client validation enforces required/min/max userId and required/max password rules with trimmed userId before submit.
- [ ] Submit wiring integrates auth server outcomes and idempotency flow, showing inline errors while preserving password field after failure.

## Blocked by

- `.scratch/login-authentication-foundation/issues/03-auth-server-outcomes-validation-failure-and-logout-cleanup.md`
- `.scratch/login-authentication-foundation/issues/04-mutation-idempotency-key-protects-login-submit.md`

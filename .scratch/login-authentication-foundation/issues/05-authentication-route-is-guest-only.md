Status: needs-triage

# Authentication route is guest-only

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Guard public authentication route as guest-only using current-session summary so authenticated users are redirected away from login page.

## Acceptance criteria

- [ ] Visiting authentication route with valid App Session redirects user away from login form.
- [ ] Unauthenticated users can open authentication route normally.
- [ ] Route file remains thin and delegates session logic to authentication server-function boundary.

## Blocked by

- `.scratch/login-authentication-foundation/issues/01-auth-server-foundation-session-establishment-and-current-session.md`

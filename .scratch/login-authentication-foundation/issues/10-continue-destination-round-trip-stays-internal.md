Status: needs-triage

# Continue Destination round trip stays internal

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Implement safe Continue Destination capture and post-login redirect flow across guards and authentication page, accepting only internal/same-origin destinations and falling back to private landing route when absent/unsafe.

## Acceptance criteria

- [ ] Unauthenticated access to private route captures continue destination with enough path intent to resume task after login.
- [ ] Login success redirects to continue destination only when destination is internal/same-origin safe.
- [ ] Unsafe or missing continue destination falls back to private landing route.

## Blocked by

- `.scratch/login-authentication-foundation/issues/07-tanstack-form-login-form-uses-useappform.md`
- `.scratch/login-authentication-foundation/issues/05-authentication-route-is-guest-only.md`
- `.scratch/login-authentication-foundation/issues/06-private-pathless-guard-requires-app-session.md`

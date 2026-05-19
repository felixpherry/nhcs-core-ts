Status: needs-triage

# Private pathless guard requires App Session

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Add one private pathless layout guard enforcing App Session presence for private routes and redirecting missing sessions to authentication with Continue Destination intent preserved.

## Acceptance criteria

- [ ] Private routes inherit guard through single pathless layout instead of per-route auth duplication.
- [ ] Missing sessions redirect immediately to authentication with captured continue intent.
- [ ] Route files stay thin and use current-session server function for guard decision.

## Blocked by

- `.scratch/login-authentication-foundation/issues/01-auth-server-foundation-session-establishment-and-current-session.md`

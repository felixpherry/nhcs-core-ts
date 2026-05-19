Status: needs-triage

# Auth server outcomes: validation/failure + logout cleanup

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Implement authentication outcome behavior in server-function surface: validation failures and backend/auth failures returned as form-safe errors, plus logout that clears app-owned and Legacy Cookies and returns server-selected Logout Destination with safe fallback.

## Acceptance criteria

- [ ] Invalid login inputs fail before backend call and return actionable form-safe error state.
- [ ] Auth failures/outages surface clear non-modal login errors while preserving retry flow.
- [ ] Logout clears app and legacy session cookies, calls backend logout when session exists, and returns configured Logout Destination with authentication fallback.

## Blocked by

- `.scratch/login-authentication-foundation/issues/01-auth-server-foundation-session-establishment-and-current-session.md`

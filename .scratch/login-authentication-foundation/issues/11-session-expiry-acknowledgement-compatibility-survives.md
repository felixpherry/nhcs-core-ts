Status: needs-triage

# Session Expiry Acknowledgement compatibility survives

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Preserve session-expiry compatibility semantics: missing App Session redirects immediately to authentication, while backend-rejected existing sessions trigger Session Expiry Acknowledgement flow before redirect.

## Acceptance criteria

- [ ] Missing/absent session cookies cause immediate auth redirect without acknowledgement step.
- [ ] Existing session rejected by backend triggers explicit Session Expiry Acknowledgement behavior before redirect.
- [ ] Behavior is covered by auth/session tests or integration checks documenting preserved compatibility.

## Blocked by

- `.scratch/login-authentication-foundation/issues/01-auth-server-foundation-session-establishment-and-current-session.md`
- `.scratch/login-authentication-foundation/issues/06-private-pathless-guard-requires-app-session.md`

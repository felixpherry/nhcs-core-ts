Status: needs-triage

# Auth server foundation: Session Establishment + current-session

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Implement authentication server-function foundation that performs Session Establishment through server-only backend boundary logic, writes both App Session and Legacy Cookies, and exposes current-session reading as a safe Authentication Result summary for route guards and client-safe consumers.

## Acceptance criteria

- [x] Login server function validates input, encrypts password server-side, calls legacy backend contract through backend boundary, and never exposes backend tokens/session identifiers in browser-visible result.
- [x] Successful login writes both app-owned `nhcs_session` and full Legacy Cookies compatibility set with configured signing/domain semantics.
- [x] Current-session server function returns safe normalized session summary (or null) for guards, including identity and enabled module groups.

## Blocked by

None - can start immediately

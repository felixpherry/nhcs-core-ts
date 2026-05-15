Status: needs-triage

# Add Legacy Cookies fallback into App Session

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Extend the App Session boundary so it reads the internal `nhcs_session` cookie first and falls back to Legacy Cookies for cross-app login continuity. Cookie compatibility configuration should be documented and validated so local and deployed environments behave consistently.

## Acceptance criteria

- [ ] App Session parsing prefers valid `nhcs_session` and falls back to valid Legacy Cookies only when internal session is absent or unusable.
- [ ] Cookie compatibility environment variables are added, validated, and documented.
- [ ] Unit tests cover internal-session preference, Legacy Cookies fallback, invalid/tampered Legacy Cookies, and required-cookie absence.

## Blocked by

- .scratch/backend-boundary-app-session/issues/03-define-app-session-from-internal-nhcs-session-cookie.md
- .scratch/backend-boundary-app-session/issues/04-confirm-legacy-cookies-compatibility-contract.md

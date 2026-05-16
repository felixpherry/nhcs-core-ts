Status: needs-triage

# Add Backend Session Headers for authenticated calls

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Add authenticated Backend Boundary calls through `api.private`. Protected backend calls should read the App Session, fail locally when no valid session exists, and include Backend Session Headers derived centrally from the App Session.

## Acceptance criteria

- [x] `api.private` reads the App Session and throws a session-expired error before contacting the backend when no valid session exists.
- [x] Authenticated calls include `Authorization`, `user-id`, and `user-login-id` derived from the App Session.
- [x] Unit tests cover missing-session behavior and Backend Session Header derivation.

## Blocked by

- .scratch/backend-boundary-app-session/issues/03-define-app-session-from-internal-nhcs-session-cookie.md

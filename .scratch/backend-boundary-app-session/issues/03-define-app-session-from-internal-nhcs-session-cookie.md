Status: ready-for-human

# Define App Session from internal `nhcs_session` cookie

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Add the App Session boundary for the new app-owned signed `nhcs_session` cookie. Shared Platform code should expose a normalized App Session shape so modules never parse session cookies directly.

## Acceptance criteria

- [x] A normalized App Session type captures the values needed to derive Backend Session Headers.
- [x] The session boundary reads and validates the signed `nhcs_session` cookie before returning an App Session.
- [x] Unit tests cover valid internal session, missing cookie, invalid cookie, and tampered cookie behavior.

## Blocked by

None - can start immediately

## Comments

- Phase 3 implemented in `src/shared/platform/app-session/app-session.server.ts` with normalized `AppSession` type in `src/shared/platform/app-session/app-session.types.ts`.
- Internal `nhcs_session` values are signed as base64url JSON plus HMAC-SHA256 signature and validated through `src/shared/platform/app-session/implementation/signed-app-session-cookie.server.ts` before returning an App Session.
- App Session currently captures `accessToken`, `userId`, `accessId`, and `userLevel`, matching old NHCS header derivation behavior for later Backend Session Headers.
- Added `NHCS_SESSION_SECRET` to environment schema and `.env.example` for the app-owned cookie signing secret.
- Tests cover valid internal session, missing cookie, invalid cookie, and tampered cookie behavior.

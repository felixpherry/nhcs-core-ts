Status: ready-for-human

# Add Legacy Cookies fallback into App Session

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Extend the App Session boundary so it reads the internal `nhcs_session` cookie first and falls back to Legacy Cookies for cross-app login continuity. Cookie compatibility configuration should be documented and validated so local and deployed environments behave consistently.

## Acceptance criteria

- [x] App Session parsing prefers valid `nhcs_session` and falls back to valid Legacy Cookies only when internal session is absent or unusable.
- [x] Cookie compatibility environment variables are added, validated, and documented.
- [x] Unit tests cover internal-session preference, Legacy Cookies fallback, invalid/tampered Legacy Cookies, and required-cookie absence.

## Blocked by

- .scratch/backend-boundary-app-session/issues/03-define-app-session-from-internal-nhcs-session-cookie.md
- .scratch/backend-boundary-app-session/issues/04-confirm-legacy-cookies-compatibility-contract.md

## Comments

- Phase 5 implemented in `src/shared/platform/app-session/implementation/read-app-session.server.ts` and `src/shared/platform/app-session/implementation/legacy-cookies.server.ts`.
- `getAppSession` now prefers valid app-owned `nhcs_session`, then falls back to verified Legacy Cookies when the internal cookie is missing or unusable.
- Legacy Cookies fallback verifies `COOKIE_SECRET`, appends non-empty `COOKIE_NAME_SUFFIX`, decodes the legacy Base64 JSON string payload, and requires non-empty `accessId`, `accessToken`, `userId`, `userLevel`, `fgEss`, `fgMss`, and `fgCore` values.
- Normalized `AppSession` now includes `menuGroups`, derived from Legacy Cookies flags for navlink rendering.
- Added cookie compatibility env vars to `src/env.ts` and `.env.example`: `COOKIE_SECRET`, `COOKIE_NAME_SUFFIX`, `PARENT_DOMAIN_COOKIE`, and `APP_ENV`.
- Tests cover Legacy Cookies fallback, `menuGroups` derivation, internal-session preference, unusable internal-session fallback, invalid/tampered Legacy Cookies, and missing required Legacy Cookies.

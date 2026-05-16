Status: ready-for-human

# Confirm Legacy Cookies compatibility contract

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Confirm the exact Legacy Cookies contract before implementing fallback parsing. The team needs the cookie names, suffix behavior, signing/verification details, and payload fields needed to create a normalized App Session compatible with older NHCS apps.

## Acceptance criteria

- [x] Legacy Cookies names, required non-empty suffix rules, and environment variable names are documented.
- [x] Legacy Cookies signing/verification behavior is documented enough for implementation and tests.
- [x] Legacy payload fields are mapped to the normalized App Session fields needed for Backend Session Headers.

## Blocked by

None - can start immediately

## Comments

- Phase 4 documented the confirmed Legacy Cookies compatibility details in `.scratch/backend-boundary-app-session/legacy-cookies-compatibility.md` and linked it from the PRD.
- `/home/felixp/dev/NHCS_Frontend` is not present in this workspace; behavior was confirmed from `/home/felixp/dev/NHCS_Core` and `/home/felixp/dev/NHCS_ESS_MSS`.
- Legacy cookie names are obfuscated base names plus `COOKIE_NAME_SUFFIX`; this app should require a configured non-empty suffix to avoid cross-environment collisions and legacy Core's missing-suffix `undefined` name bug.
- Legacy cookie verification uses `COOKIE_SECRET` with `cookie-signature` over a standard Base64 JSON-string payload; this differs from the app-owned `nhcs_session` HMAC/base64url format.
- Normalized App Session fallback needs verified, non-empty `accessId`, `accessToken`, `userId`, `userLevel`, `fgEss`, `fgMss`, and `fgCore`; Backend Session Headers derive `Authorization`, `user-id`, and `user-login-id` from identity/token fields, while `menuGroups` derive from legacy product flags.

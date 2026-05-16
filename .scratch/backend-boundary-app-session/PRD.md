Status: needs-triage

# Backend Boundary and App Session Foundation PRD

## Problem Statement

The migration needs a stable **Backend Boundary** before business modules are ported. The NHCS backend has inconsistent and surprising contracts: HTTP `200` can still mean business failure, `isGranted: false` indicates session expiry, payloads can appear under either `result` or `data`, and authenticated calls require compatibility headers derived from legacy session values. Without a shared foundation, each module would reimplement backend quirks, duplicate cookie parsing, and risk direct browser-to-backend calls that violate the agreed architecture.

## Solution

Build a shared **Backend Boundary** and **App Session** foundation. All backend calls will go through TanStack Start server functions and shared server-side utilities. The shared API client will normalize **Backend Envelope** responses, throw typed errors, derive **Backend Session Headers** from the normalized **App Session**, and keep **Legacy Cookies** compatibility isolated from module code.

This gives feature migration a stable interface: modules call typed server functions and receive normal payloads or typed errors, while backend response quirks, shared-cookie compatibility, and auth headers stay centralized in the Shared Platform.

## User Stories

1. As a feature developer, I want one shared Backend Boundary, so that I do not need to learn backend quirks for every migrated module.
2. As a feature developer, I want backend calls to happen only through server functions, so that browser code never calls backend endpoints directly.
3. As a feature developer, I want the API client to return normalized payloads, so that module code does not depend on Backend Envelope details.
4. As a feature developer, I want the API client to throw typed errors, so that server functions can handle business failures, session expiry, forbidden access, validation failures, and backend outages consistently.
5. As a feature developer, I want `isGranted: false` to become a session-expired error, so that session expiry behavior is consistent across modules.
6. As a feature developer, I want `isSuccess: false` under HTTP `200` to become a business error, so that application-level failures can show backend messages without being confused with transport failures.
7. As a feature developer, I want HTTP `400` to become a validation error, so that Swagger/request contract failures are distinct from business failures.
8. As a feature developer, I want HTTP `403` to become a forbidden error, so that no-access cases can use access-denied UI.
9. As a feature developer, I want HTTP `500` and network failures to become server-down errors, so that backend outage handling is consistent.
10. As a feature developer, I want unknown non-`200` statuses to become unknown API errors, so that unsupported backend behavior is visible instead of guessed.
11. As a feature developer, I want the Backend Envelope parser to support both `result` and `data`, so that migrated code can handle existing NHCS response shapes.
12. As a feature developer, I want `result` to win when both `result` and `data` exist, so that the canonical backend payload field remains preferred.
13. As a feature developer, I want raw Backend Envelope values preserved in diagnostics, so that backend issues can still be debugged.
14. As a feature developer, I want the low-level API client to accept only relative backend paths, so that backend base URL ownership stays centralized.
15. As a feature developer, I want `api.public` for unauthenticated calls, so that login can call the backend without requiring a session.
16. As a feature developer, I want `api.auth` for authenticated calls, so that protected backend calls automatically use the App Session.
17. As a feature developer, I want authenticated calls with no valid App Session to fail before contacting the backend, so that missing session behavior is predictable.
18. As a feature developer, I want Backend Session Headers derived centrally, so that modules do not construct backend-specific auth headers.
19. As a feature developer, I want authenticated backend calls to include `Authorization`, `user-id`, and `user-login-id`, so that legacy NHCS backend expectations are met.
20. As a feature developer, I want an App Session abstraction, so that module code does not read Legacy Cookies directly.
21. As a user already logged into another NHCS app, I want this app to recognize my Legacy Cookies, so that I stay logged in across apps during migration.
22. As a user logging into this app later, I want the app to write compatible session cookies, so that other NHCS apps can still recognize my login.
23. As a maintainer, I want internal session state stored in a signed `nhcs_session` cookie, so that the new app has a cleaner session model than the legacy cookie set.
24. As a maintainer, I want Legacy Cookies isolated behind a session boundary, so that the legacy cookie contract can be removed later without changing modules.
25. As a maintainer, I want cookie environment variables documented, so that local and deployed environments configure shared login consistently.
26. As a maintainer, I want `API_BASE_URL` to be required, so that backend configuration failures fail early.
27. As a maintainer, I want the API boundary unit-tested, so that backend quirks remain centralized and safe to refactor.
28. As a maintainer, I want session parsing and header derivation unit-tested, so that cross-app login compatibility does not regress.
29. As a maintainer, I want password encryption kept out of this first slice, so that API/session foundation can land before the full login flow.
30. As a maintainer, I want upload and SSE support deferred, so that the initial Backend Boundary stays focused on JSON API calls and session handling.

## Implementation Decisions

- Backend calls go through TanStack Start server functions, not direct browser-to-backend requests.
- Shared Platform owns the Backend Boundary, Backend Envelope normalization, App Session parsing, Legacy Cookies compatibility, and Backend Session Headers.
- Business modules call typed server functions and shared platform utilities; they do not call backend URLs directly.
- The API client throws typed errors rather than returning discriminated result objects.
- Typed errors include business failure, session expiry, forbidden access, request validation failure, backend/server-down failure, and unknown API failure.
- Backend Envelope parsing supports both `result` and `data` payload fields and prefers `result` when both exist.
- `isGranted: false` takes precedence over `isSuccess` and maps to session expiry.
- HTTP `200` with `isSuccess: false` maps to business failure.
- HTTP `400` maps to request validation failure.
- HTTP `403` maps to forbidden access.
- HTTP `500` and network failures map to backend/server-down failure.
- Other non-`200` statuses map to unknown API failure.
- The low-level API client accepts relative backend paths only.
- The API client exposes a public mode for login/no-auth calls and an authenticated mode for protected backend calls.
- The authenticated mode reads the App Session and throws session expiry locally if no valid session exists.
- The authenticated mode sends the backend compatibility headers: bearer authorization, composite user identifier, and user login identifier.
- The App Session boundary reads the internal signed `nhcs_session` cookie first and falls back to Legacy Cookies.
- Legacy Cookies are signed shared cookies with obfuscated names and a required non-empty cookie name suffix.
- The app will eventually write both Legacy Cookies and the internal `nhcs_session` cookie on login, but full login implementation is not part of the first slice.
- The canonical backend base URL env var is `API_BASE_URL`.
- Cookie compatibility env vars must be added and documented before session parsing is considered complete.
- Password encryption for backend login is preserved for the later login slice, but is out of scope for this foundation slice.

## Testing Decisions

- Tests should verify external behavior at the API/session boundary, not internal implementation details.
- Backend Envelope normalization should be unit-tested with mocked responses.
- Typed error mapping should be unit-tested across success, business failure, session expiry, validation failure, forbidden access, server-down failure, network failure, and unknown status cases.
- Payload extraction should be unit-tested for `result`, `data`, and both fields with `result` preferred.
- The authenticated API client should be unit-tested for missing session behavior and Backend Session Header derivation.
- The App Session boundary should be unit-tested for internal session parsing, Legacy Cookies fallback, invalid/tampered cookies, and required-cookie absence.
- Tests should be colocated beside the modules they exercise.
- Vitest is the test runner for this repo.
- Prior art exists in the package scripts through `vitest run`, but this foundation should introduce the first focused Shared Platform unit tests if none exist yet.

## Out of Scope

- Migrating business modules.
- Implementing the full authentication page or login flow.
- Writing password encryption integration for login.
- Writing login/logout server functions.
- Building TanStack Query wrappers.
- Implementing upload or multipart form-data support.
- Implementing SSE support.
- Migrating the design system from the ESS/MSS app.
- Building route guards or access-denied UI.
- Adding production metrics or request logging.
- Enforcing import boundaries with additional tooling.

## Further Notes

- ADR-0001 records the decision to use server functions for the Backend Boundary.
- ADR-0002 records the decision to normalize Legacy Cookies into an App Session while preserving cross-app login compatibility.
- Phase 4 confirmed the Legacy Cookies compatibility details in `.scratch/backend-boundary-app-session/legacy-cookies-compatibility.md`.
- Phase 5 added Legacy Cookies fallback inside the App Session boundary.
- Shared Platform glossary terms are documented in the context map and shared context documentation.
- The old apps show that the backend uses `result` for most payloads, `result.data` for list wrappers, and top-level `data` for transformed authentication responses.
- The backend status contract is intentionally handled as a compatibility layer because HTTP status alone is not a reliable success signal.

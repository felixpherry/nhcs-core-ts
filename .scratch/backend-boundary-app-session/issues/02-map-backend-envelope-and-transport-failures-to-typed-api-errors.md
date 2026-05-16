Status: needs-triage

# Map Backend Envelope and transport failures to typed API errors

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Extend the Backend Boundary so backend failure modes become typed errors. Server functions and module code should see consistent error types for business failure, session expiry, validation failure, forbidden access, backend outage, and unknown backend behavior, with raw Backend Envelope details preserved for diagnostics.

## Acceptance criteria

- [x] `isGranted: false` maps to a session-expired error before `isSuccess` handling.
- [x] HTTP `200` with `isSuccess: false`, HTTP `400`, HTTP `403`, HTTP `500`, network failure, and unknown non-`200` statuses map to distinct typed API errors.
- [x] Unit tests cover all mapped failure cases and verify raw Backend Envelope/diagnostic values remain available.

## Blocked by

- .scratch/backend-boundary-app-session/issues/01-add-backend-boundary-public-json-call.md

## Comments

- Phase 2 implemented in `src/shared/backend-boundary/api.server.ts`.
- Added exported typed API errors: `ApiBusinessError`, `ApiSessionExpiredError`, `ApiValidationError`, `ApiForbiddenError`, `ApiServerDownError`, and `ApiUnknownError`.
- Each API error exposes `kind` and `diagnostics`; diagnostics preserve HTTP status, raw Backend Envelope, and network failure cause when available.
- Failure mapping tests live in `src/shared/backend-boundary/api.server.test.ts`.
- Review follow-up: `BackendEnvelope<TPayload>` and API error diagnostics now type known envelope fields and payload generically; network failures use a reachability-neutral message; all HTTP `5xx` statuses map to server-down with `Internal server error.` fallback.
- Refactor follow-up: `api.server.ts` now contains server-boundary flow only; types live in `api.types.ts`, helper functions in `api.utils.ts`, and runtime API error classes in `api.errors.ts`.

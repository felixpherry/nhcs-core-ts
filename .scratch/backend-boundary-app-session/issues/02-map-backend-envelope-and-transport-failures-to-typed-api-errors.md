Status: needs-triage

# Map Backend Envelope and transport failures to typed API errors

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Extend the Backend Boundary so backend failure modes become typed errors. Server functions and module code should see consistent error types for business failure, session expiry, validation failure, forbidden access, backend outage, and unknown backend behavior, with raw Backend Envelope details preserved for diagnostics.

## Acceptance criteria

- [ ] `isGranted: false` maps to a session-expired error before `isSuccess` handling.
- [ ] HTTP `200` with `isSuccess: false`, HTTP `400`, HTTP `403`, HTTP `500`, network failure, and unknown non-`200` statuses map to distinct typed API errors.
- [ ] Unit tests cover all mapped failure cases and verify raw Backend Envelope/diagnostic values remain available.

## Blocked by

- .scratch/backend-boundary-app-session/issues/01-add-backend-boundary-public-json-call.md

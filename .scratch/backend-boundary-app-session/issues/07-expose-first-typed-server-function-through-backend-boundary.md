Status: ready-for-human

# Expose first typed server function through Backend Boundary

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Add a thin TanStack Start server function that proves modules call typed server functions instead of backend URLs. The server function should validate input, call the shared Backend Boundary, and return normalized payloads or typed errors through the agreed server-side path.

## Acceptance criteria

- [x] A module-facing server function uses the shared Backend Boundary instead of direct backend fetch logic.
- [x] The server function validates input and returns normalized payload behavior suitable for module use.
- [x] Tests verify the server function delegates through the Backend Boundary and handles typed API errors consistently.

## Blocked by

- .scratch/backend-boundary-app-session/issues/01-add-backend-boundary-public-json-call.md
- .scratch/backend-boundary-app-session/issues/02-map-backend-envelope-and-transport-failures-to-typed-api-errors.md
- .scratch/backend-boundary-app-session/issues/06-add-backend-session-headers-for-authenticated-calls.md

## Comments

- Phase 7 implemented `getAuthenticationMenus` in `src/modules/authentication/authentication.functions.ts` as a thin TanStack Start server function.
- The server function validates `menuGroup` (`CORE`/`ESS`/`MSS`), calls server-only implementation in `src/modules/authentication/authentication.server.ts`, and returns the backend list wrapper's `data` array to module callers.
- Tests in `src/modules/authentication/authentication.functions.test.ts` cover Backend Boundary delegation, input validation before boundary contact, and typed API error propagation.

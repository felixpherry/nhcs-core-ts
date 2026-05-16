Status: ready-for-human

# Add Backend Boundary public JSON call

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Add the first shared Backend Boundary path for unauthenticated JSON backend calls. Feature code should be able to call `api.public` with a relative backend path and receive the normalized payload from the Backend Envelope without knowing whether the backend used `result` or `data`.

## Acceptance criteria

- [x] `api.public` accepts only relative backend paths and uses `API_BASE_URL` centrally.
- [x] Successful Backend Envelope responses return payload from `result` or `data`, with `result` preferred when both exist.
- [x] Unit tests cover relative-path enforcement, base URL use, `result`, `data`, and `result`-preferred payload extraction.

## Blocked by

None - can start immediately

## Comments

- Phase 1 implemented in `src/shared/platform/backend-boundary/api.server.ts` with focused tests in `src/shared/platform/backend-boundary/api.server.test.ts`.
- Public API narrowed to `api.public.get` and `api.public.post` because backend only uses GET/POST.
- Public API now takes exactly `(backendPath, options?)`; `options.query` merges query params with the URL via `query-string`, and POST JSON body lives at `options.body`.
- After checking old NHCS Core and ESS/MSS APIs, backend boundary file was made server-only (`api.server.ts`) and parent path segments were rejected so relative paths cannot escape `API_BASE_URL` path prefixes.

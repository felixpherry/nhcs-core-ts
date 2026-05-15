Status: needs-triage

# Add Backend Boundary public JSON call

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Add the first shared Backend Boundary path for unauthenticated JSON backend calls. Feature code should be able to call `api.public` with a relative backend path and receive the normalized payload from the Backend Envelope without knowing whether the backend used `result` or `data`.

## Acceptance criteria

- [ ] `api.public` accepts only relative backend paths and uses `API_BASE_URL` centrally.
- [ ] Successful Backend Envelope responses return payload from `result` or `data`, with `result` preferred when both exist.
- [ ] Unit tests cover relative-path enforcement, base URL use, `result`, `data`, and `result`-preferred payload extraction.

## Blocked by

None - can start immediately

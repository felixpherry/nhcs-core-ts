Status: needs-triage

# Define App Session from internal `nhcs_session` cookie

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Add the App Session boundary for the new app-owned signed `nhcs_session` cookie. Shared Platform code should expose a normalized App Session shape so modules never parse session cookies directly.

## Acceptance criteria

- [ ] A normalized App Session type captures the values needed to derive Backend Session Headers.
- [ ] The session boundary reads and validates the signed `nhcs_session` cookie before returning an App Session.
- [ ] Unit tests cover valid internal session, missing cookie, invalid cookie, and tampered cookie behavior.

## Blocked by

None - can start immediately

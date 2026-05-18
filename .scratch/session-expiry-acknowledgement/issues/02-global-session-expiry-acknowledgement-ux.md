Status: needs-triage

# Wire global Session Expiry Acknowledgement UX

## Parent

.scratch/session-expiry-acknowledgement/PRD.md

## What to build

Wire the Session Expiry Acknowledgement foundation into the app UX. Query and mutation failures caused by backend-rejected sessions should open one root-mounted dialog over the current page. When the user clicks OK, the app clears expired cookies through the server function, clears the acknowledgement latch, and navigates with TanStack Router to authentication using a validated internal `continueTo` path. Authentication entry clears stale acknowledgement state.

## Acceptance criteria

- [ ] Shared TanStack Query error handling triggers the acknowledgement latch for backend-rejected session-expired query failures.
- [ ] Shared TanStack mutation error handling triggers the same acknowledgement latch for backend-rejected session-expired mutation failures.
- [ ] Non-session errors and missing-cookie immediate-authentication errors do not open the acknowledgement dialog.
- [ ] One global Session Expiry Acknowledgement dialog is mounted from root/app shell infrastructure, not page modules.
- [ ] Pending latch state shows the dialog; no pending latch hides it.
- [ ] Concurrent query and mutation failures produce only one visible acknowledgement dialog.
- [ ] Dialog OK calls the clear-session server function, clears the latch, and navigates through TanStack Router.
- [ ] `continueTo` is built from current pathname plus search only, excluding origin and hash.
- [ ] `continueTo` validation rejects absolute URLs, protocol-relative URLs, and invalid values with safe fallback behavior.
- [ ] Authentication entry clears any stale pending acknowledgement latch.
- [ ] Tests cover query integration, mutation integration, dialog behavior, navigation target construction, and authentication latch cleanup.

## Blocked by

- .scratch/session-expiry-acknowledgement/issues/01-shared-platform-session-expiry-acknowledgement-foundation.md

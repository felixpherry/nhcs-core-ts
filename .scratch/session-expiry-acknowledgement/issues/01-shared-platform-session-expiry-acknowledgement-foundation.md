Status: done

# Build Shared Platform Session Expiry Acknowledgement foundation

## Parent

.scratch/session-expiry-acknowledgement/PRD.md

## What to build

Build the Shared Platform foundation for Session Expiry Acknowledgement. Backend-rejected existing App Sessions must be distinguishable from missing or unreadable App Sessions, so only backend `isGranted: false` expiry signals can open the acknowledgement flow. Add a shared client acknowledgement latch with structural expiry detection, and add a server function that acknowledges expiry by clearing the app-owned session cookie and known Legacy Cookies.

## Acceptance criteria

- [x] Backend Boundary behavior distinguishes backend-rejected Session Expiry from missing or unreadable App Session.
- [x] Missing or unreadable App Session remains an immediate-authentication case and does not satisfy the acknowledgement detector.
- [x] Session-expired detection works structurally across serialized errors, including backend-rejected expiry markers.
- [x] Shared client latch can set, read, clear, and subscribe to pending Session Expiry Acknowledgement state.
- [x] Repeated latch sets are idempotent; first expiry signal wins while acknowledgement is pending.
- [x] Latch stores UI state only; no credentials, user identifiers, or App Session truth are stored in browser session storage.
- [x] Storage failures are handled predictably and covered by tests.
- [x] Clear-session server function does not require a valid backend session.
- [x] Clear-session server function expires the app-owned session cookie and all known Legacy Cookies, including optional legacy authentication fields.
- [x] Cookie expiration covers both host-only and configured domain-scoped cookie variants.
- [x] Tests cover Backend Boundary distinction, structural detector, latch contract, and cookie clearing behavior.

## Implementation notes

- Added `ApiMissingAppSessionError` so local missing/unreadable App Session stays separate from backend-rejected `ApiSessionExpiredError`.
- Added `src/shared/platform/session-expiry-acknowledgement/` contract, client latch/detector, server cookie clearing helper, and `acknowledgeExpiredSession` server function.
- Cookie clearing uses fixed app/legacy cookie names, includes optional legacy auth fields, and emits host-only plus configured domain-scoped expirations.
- Verified with `bun run test` and `bun run check`.

## Blocked by

None - can start immediately

Status: needs-triage

# Session Expiry Acknowledgement PRD

## Problem Statement

Users can lose their NHCS backend session while actively working on a page. The old Core app redirected users as soon as session expiry was detected, but the desired migrated behavior is less disruptive: if an existing session is rejected by the backend, the user should stay on the same page, see a clear session-expired popup, and only leave the page after acknowledging it. At the same time, missing cookies are not an expired-session acknowledgement case; if no readable App Session exists, protected access should redirect to authentication immediately.

## Solution

Add a shared Session Expiry Acknowledgement flow to the Shared Platform. The Backend Boundary will continue translating backend `isGranted: false` responses into session-expired API errors. Client-side infrastructure will detect those errors from in-page backend calls, set one browser-session acknowledgement latch, and render one global dialog above the current page. When the user clicks OK, the app will call a server function that clears the app-owned session cookie and all known Legacy Cookies, clear the acknowledgement latch, and navigate with TanStack Router to authentication using an internal `continueTo` path built from the current pathname and search params.

Protected access with missing cookies remains a separate flow: if no readable App Session exists, redirect immediately to authentication because there is no existing session for the backend to judge. Existing signed cookies are treated as unknown validity until the first private backend call proves whether the backend still grants them.

## User Stories

1. As a user actively working in NHCS Core, I want the page to stay visible when my backend session expires, so that I do not lose immediate context before reading what happened.
2. As a user actively working in NHCS Core, I want a clear popup when my session expires, so that I understand why I can no longer continue.
3. As a user actively working in NHCS Core, I want redirect to happen only after I click OK, so that the app does not surprise-kick me during an interaction.
4. As a user, I want the session-expired popup to appear on the same page, so that I can see where I was before returning to login.
5. As a user, I want the login page to know where I came from, so that I can continue back to the intended internal page after re-authentication.
6. As a user, I want only one session-expired popup even if several backend calls fail at once, so that I am not spammed by duplicate dialogs.
7. As a user, I want expired app and legacy session cookies cleared after I acknowledge expiry, so that I do not get stuck in a loop where stale cookies recreate the same failure.
8. As a user opening a protected page with no cookies, I want immediate redirect to authentication, so that I am not shown a protected shell that cannot work.
9. As a user with signed cookies from another NHCS app, I want the app to let the backend judge whether the session is still valid, so that cross-app login continuity keeps working.
10. As a user with signed but backend-expired Legacy Cookies, I want the first backend rejection to show the acknowledgement popup, so that expiry is handled consistently across migrated pages.
11. As a feature developer, I want Backend Boundary session-expired errors to drive the acknowledgement flow, so that individual modules do not duplicate expiry handling.
12. As a feature developer, I want missing-cookie redirects separate from backend-rejected session expiry, so that route access and in-page expiry remain distinct concepts.
13. As a feature developer, I want one shared client latch for pending acknowledgement, so that all migrated pages share the same behavior.
14. As a feature developer, I want the acknowledgement latch stored for the browser session, so that re-renders and repeated query errors do not close/reopen duplicate dialogs.
15. As a feature developer, I want the acknowledgement latch to store only UI state, so that it is not mistaken for an authentication bypass or session source of truth.
16. As a feature developer, I want the current URL captured as an internal path only, so that `continueTo` cannot become an open redirect vector.
17. As a feature developer, I want the redirect performed through TanStack Router navigation, so that session expiry behavior uses the app's routing mechanism rather than direct location assignment.
18. As a maintainer, I want cookie clearing centralized behind a server function, so that the app-owned session cookie and Legacy Cookies are invalidated consistently.
19. As a maintainer, I want all known Legacy Cookies cleared, including optional authentication fields, so that old cookie state cannot leak into a new login attempt.
20. As a maintainer, I want both domain-scoped and host-only cookie expirations when clearing sessions, so that local and deployed environments are covered.
21. As a maintainer, I want the Session Expiry Acknowledgement language documented, so that future contributors do not conflate missing cookies with backend-rejected sessions.
22. As a maintainer, I want this behavior tested at platform boundaries, so that new modules inherit session-expiry behavior without test duplication.
23. As a maintainer, I want TanStack Query failures to trigger the shared acknowledgement flow, so that query-based migrated pages get the behavior by default.
24. As a maintainer, I want mutation failures to trigger the shared acknowledgement flow, so that save/submit actions are covered as well as reads.
25. As a maintainer, I want the session-expired dialog to be mounted once globally, so that page modules do not own session infrastructure.
26. As a maintainer, I want login to clear any pending acknowledgement latch, so that stale UI state does not survive after authentication.
27. As a maintainer, I want the first backend expiry signal to win, so that concurrent failures do not race to change dialog state or navigation.
28. As a maintainer, I want acknowledgement behavior to work without adopting old Core's axios interceptor architecture, so that the migration keeps the new Backend Boundary architecture.
29. As a security reviewer, I want session tokens to remain in HTTP-only cookies, so that the browser-session latch cannot expose credentials.
30. As a security reviewer, I want `continueTo` validated as an internal path, so that a crafted URL cannot redirect users to another origin.

## Implementation Decisions

- Build a deep Shared Platform session-expiry module that exposes a small client API for reading, setting, clearing, and subscribing to the Session Expiry Acknowledgement latch.
- Store the acknowledgement latch in browser session storage as UI state only. It must not contain tokens, user identifiers, or any value treated as authentication proof.
- Use a clear canonical storage key for the acknowledgement latch rather than joke or temporary naming.
- Treat missing or unreadable cookies as an immediate-authentication case, not a Session Expiry Acknowledgement case.
- Treat readable App Session cookies as unknown validity until the backend rejects them.
- Continue using Backend Boundary typed errors as the canonical signal for backend-rejected sessions.
- Detect session-expired errors structurally, not only by class identity, because server-function errors may cross serialization boundaries.
- Wire TanStack Query's shared query and mutation error handling to trigger the acknowledgement latch when a session-expired error occurs.
- Suppress duplicate acknowledgement triggers while the latch is already pending.
- Mount one global Session Expiry Acknowledgement dialog in app shell/root UI.
- Keep routes thin: route/root wiring may render the global dialog, but dialog behavior belongs to shared platform/app-wide infrastructure.
- Use TanStack Router navigation after acknowledgement instead of assigning `window.location` directly.
- Build `continueTo` from the current pathname plus search string only; do not include origin, hash, or full absolute URL.
- Validate `continueTo` as an internal path before using it in redirects or navigation.
- Add a server function dedicated to acknowledging expired sessions and clearing session cookies.
- The clear-session server function clears the app-owned session cookie and all known Legacy Cookies.
- Known Legacy Cookies include required App Session fields and optional legacy authentication fields such as refresh token, user group, and user name.
- Cookie clearing should account for both domain-scoped cookies and host-only cookies to support local development and deployment behavior.
- After successful clear-session server function completion, clear the acknowledgement latch and navigate to authentication with `continueTo`.
- Login/authentication UI should clear any pending acknowledgement latch so stale popup state does not survive successful re-authentication.
- Do not copy the old Core axios interceptor pattern. Use the existing TanStack Start, TanStack Router, TanStack Query, Backend Boundary, App Session, and Legacy Cookies architecture.
- Do not change the Backend Envelope normalization rules as part of this PRD.
- Do not use session storage as a source of App Session truth or as a permission bypass.
- Protected layout route gating for missing cookies should redirect immediately when a protected route exists; if the current app has no real protected layout yet, this may be implemented with the first protected layout slice.

## Testing Decisions

- Tests should verify user-observable and boundary behavior rather than implementation details.
- Test the session-expiry latch module as a deep module: setting expiry opens the pending state, repeated sets are idempotent, clearing removes the pending state, and session storage failures are handled predictably.
- Test structural session-expired error detection, including errors with `kind: "session-expired"` and/or `name: "ApiSessionExpiredError"`.
- Test shared TanStack Query error integration by simulating query and mutation failures and verifying the acknowledgement latch is triggered exactly once.
- Test the global dialog behavior with component tests: pending latch shows dialog, no pending latch hides dialog, OK calls the clear-session server function, clears the latch, and navigates to authentication with internal `continueTo`.
- Test the clear-session server function externally: it emits expirations for app-owned and Legacy Cookies and does not require a valid backend session.
- Test internal path construction/validation: pathname plus search is preserved, absolute URLs are rejected, protocol-relative URLs are rejected, and empty/invalid values fall back safely.
- Reuse testing style from existing Backend Boundary and App Session unit tests, which assert external behavior of platform seams.
- Reuse component-test conventions from existing React UI tests where applicable.
- Do not add brittle tests that assert exact storage implementation mechanics beyond the stable contract.
- Do not test old Core or ESS/MSS internals; use those repos only as behavior references.

## Out of Scope

- Full login implementation.
- Password encryption integration.
- Logout endpoint parity with old Core or ESS/MSS.
- HCPlus production logout redirects.
- Upload, multipart form-data, SSE, or GraphQL proxy behavior.
- Metrics or request logging parity with old Core.
- Full access-denied or forbidden UI.
- Broad protected-route layout implementation if no protected layout exists yet.
- Changing Backend Envelope success/error mapping rules.
- Replacing the Backend Boundary typed-error model with raw envelope returns.
- Persisting authentication state in client-accessible storage.

## Further Notes

- Shared Platform glossary now distinguishes App Session, Legacy Cookies, Backend Boundary, Backend Session Headers, and Session Expiry Acknowledgement.
- Old NHCS_ESS_MSS confirms the desired UX shape: a root-level session-expired dialog appears when in-page backend calls report `isGranted: false`, and acknowledgement clears cookies before redirecting to authentication.
- The old Core app used axios interceptors and immediate redirect headers; this migration intentionally keeps behavior while replacing the mechanism with TanStack and Shared Platform seams.
- The decision tree is: missing cookies redirect immediately; existing cookies are allowed until the first private backend call judges them; backend-rejected existing cookies trigger Session Expiry Acknowledgement; OK clears all session cookies and navigates to authentication with `continueTo`.
- The canonical continuation value is `pathname + search`, not a full URL.

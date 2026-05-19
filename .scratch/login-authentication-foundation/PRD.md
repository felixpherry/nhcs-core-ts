Status: needs-triage

# Login Authentication Foundation PRD

## Problem Statement

NHCS Core needs a production-shaped login page, but the login page depends on several foundations being correct first: **Session Establishment**, **App Session** creation, **Legacy Cookies** compatibility, private route protection, idempotent mutation submits, app-wide form conventions, and migration of the ESS/MSS visual language. Without these pieces, the first page would either duplicate old Core quirks in UI code, expose backend tokens to the browser, lose cross-app compatibility, or create form behavior that later modules must undo.

## Solution

Build the login slice as an authentication foundation, not just a page. The app will authenticate through a TanStack Start server function, keep backend credentials and password encryption server-side, create both the app-owned **App Session** and old NHCS **Legacy Cookies**, return only a client-safe **Authentication Result**, and route users through a safe **Continue Destination** flow. The login UI will use the migrated ESS/MSS visual system, shared TanStack Form primitives through `useAppForm`, delayed navigation feedback through NProgress, subtle delayed BlockUI for manually blocked operations, and **Mutation Idempotency Key** middleware to prevent repeated backend side effects from double submit.

## User Stories

1. As an unauthenticated NHCS Core user, I want to open the authentication page, so that I can sign in to the migrated app.
2. As an unauthenticated NHCS Core user, I want the login page to look like the ESS/MSS design system, so that the migrated app feels consistent with the target NHCS experience.
3. As an unauthenticated NHCS Core user, I want to enter my user ID and password, so that I can establish a session.
4. As an unauthenticated NHCS Core user, I want user ID validation before submission, so that obvious mistakes are caught quickly.
5. As an unauthenticated NHCS Core user, I want password validation before submission, so that empty or invalid password input is caught quickly.
6. As an unauthenticated NHCS Core user, I want my user ID trimmed before login, so that accidental surrounding spaces do not block authentication.
7. As an unauthenticated NHCS Core user, I want a password show/hide control, so that I can verify what I typed when needed.
8. As an unauthenticated NHCS Core user, I want no remember-me behavior, so that login semantics match the legacy Core behavior.
9. As an unauthenticated NHCS Core user, I want the submit button to show pending state, so that I know the app is processing my login.
10. As an unauthenticated NHCS Core user, I want fast login submissions to avoid flashing a blocking overlay, so that the interface feels responsive.
11. As an unauthenticated NHCS Core user, I want slow blocked operations to show a subtle spinner overlay, so that I know the app is busy.
12. As an unauthenticated NHCS Core user, I want repeated double-click submits to avoid repeating backend login side effects, so that one intended login attempt does not create multiple backend requests.
13. As an unauthenticated NHCS Core user, I want login failures displayed on the form, so that I can correct the issue without a disruptive modal.
14. As an unauthenticated NHCS Core user, I want my password kept in the field after login failure, so that I can decide whether to edit or retry.
15. As an unauthenticated NHCS Core user, I want backend outage errors shown clearly, so that I know the problem is not necessarily my credentials.
16. As an unauthenticated NHCS Core user, I want successful login to take me to my intended internal page when I came from a protected route, so that my task can continue.
17. As an unauthenticated NHCS Core user, I want unsafe external continue URLs rejected, so that I cannot be redirected to another origin after signing in.
18. As an unauthenticated NHCS Core user, I want successful login without a Continue Destination to take me to the private landing route, so that the app can decide the right module landing experience.
19. As an already authenticated NHCS Core user, I want visiting the authentication page to redirect me away, so that I do not see a login form while already signed in.
20. As an authenticated NHCS Core user, I want protected routes to require an App Session, so that private pages cannot render for anonymous visitors.
21. As an authenticated NHCS Core user, I want missing session cookies to redirect immediately to authentication with a Continue Destination, so that I can sign in and resume navigation.
22. As a user logged into older NHCS apps, I want the migrated app to preserve Legacy Cookies compatibility, so that cross-app login continuity keeps working during migration.
23. As a user logging in through migrated Core, I want both the App Session and Legacy Cookies written, so that this app and older NHCS apps can recognize the login.
24. As a user logging out, I want local app cookies and Legacy Cookies cleared, so that old session state does not leak into the next login.
25. As a user logging out, I want the server to choose the post-logout location, so that environment-specific logout behavior works without hardcoding UI paths.
26. As a user logging out in an environment without HCPlus logout configuration, I want a safe authentication fallback, so that logout still completes.
27. As a user whose backend session expires while using the app, I want the existing Session Expiry Acknowledgement behavior preserved, so that expiry is acknowledged before redirect.
28. As a user navigating between pages, I want slow navigations to show NProgress, so that I receive feedback only when navigation is meaningfully slow.
29. As a user navigating quickly, I do not want NProgress flashes, so that fast transitions feel clean.
30. As a feature developer, I want login implemented through a server function, so that browser code never calls the backend login endpoint directly.
31. As a feature developer, I want password encryption kept server-side, so that the browser never sees backend encryption details or secrets.
32. As a feature developer, I want the legacy backend login contract preserved, so that migrated login behavior matches old Core behavior where compatibility matters.
33. As a feature developer, I want the login server function to return only an Authentication Result, so that tokens and backend session identifiers stay out of browser-visible results.
34. As a feature developer, I want the Authentication Result to include user identity and enabled module groups, so that UI can render safe session-aware state.
35. As a feature developer, I want user name and user group included in the App Session when available, so that future nav/profile UI can show display identity.
36. As a feature developer, I want refresh token excluded from the App Session for now, so that unused sensitive values are not added to the normalized session model.
37. As a feature developer, I want refresh token preserved only in Legacy Cookies for compatibility, so that old apps continue to work without expanding the new session contract.
38. As a feature developer, I want auth environment variables required, so that missing login/session configuration fails early.
39. As a feature developer, I want HCPlus logout configuration optional, so that local development can fall back to authentication.
40. As a feature developer, I want all auth server functions exported from one authentication functions module for now, so that the small module stays flat until pressure exists.
41. As a feature developer, I want the functions module to stay thin, so that validation and server function wiring do not hide business logic.
42. As a feature developer, I want authentication server logic kept in the server-only module, so that encryption, backend calls, and cookie writing stay out of client-safe imports.
43. As a feature developer, I want current-session reading exposed through the authentication server function surface, so that routes can guard using a safe session summary.
44. As a feature developer, I want the public authentication route guarded as guest-only, so that authenticated users are redirected away from login.
45. As a feature developer, I want one private pathless layout guard, so that all private pages inherit session enforcement without adding guard code to every route.
46. As a feature developer, I want route files to remain thin, so that route code only wires guards, search params, and module pages.
47. As a feature developer, I want form components based on TanStack Form and `useAppForm`, so that form behavior is consistent across migrated modules.
48. As a feature developer, I want input and textarea field primitives first, so that the login form and near-term forms share the same form architecture.
49. As a feature developer, I want to avoid copying Conform or React Hook Form patterns from the design repo, so that the migrated app has one TanStack Form convention.
50. As a feature developer, I want the button primitive unchanged for now, so that loading behavior can be composed locally until an app-wide API proves necessary.
51. As a feature developer, I want the ESS/MSS visual system migrated to Tailwind v4, so that design tokens and utilities work in the current app stack.
52. As a feature developer, I want shadcn semantic tokens preserved, so that existing shadcn component class names keep working.
53. As a feature developer, I want shadcn tokens remapped to ESS/MSS palette approximations, so that the design system migrates without rewriting every class name.
54. As a feature developer, I want the old scenic starter theme removed, so that the app has one visual language.
55. As a feature developer, I want design repo component APIs copied only when local usage creates pressure, so that the app does not inherit APIs we already dislike.
56. As a feature developer, I want the login auth layout visually copied from the design repo, so that the first migrated page matches the target UI.
57. As a feature developer, I want custom Tailwind v3 utilities translated to Tailwind v4 syntax, so that design utilities such as text, background, border, and icon semantics compile correctly.
58. As a feature developer, I want NProgress behavior implemented through router pending state, so that navigation feedback is centralized.
59. As a feature developer, I want BlockUI to be manual-only, so that navigation uses NProgress and blocked operations use a distinct overlay.
60. As a feature developer, I want BlockUI visuals delayed with spin delay, so that fast operations do not flash a blocker.
61. As a feature developer, I want BlockUI implemented with React context and a subtle Loader2 spinner, so that it avoids unnecessary dependencies.
62. As a feature developer, I want idempotency implemented as server function middleware, so that mutation dedupe is reusable across modules.
63. As a feature developer, I want the Mutation Idempotency Key sent as a request header, so that middleware can enforce dedupe independently of the input schema.
64. As a feature developer, I want idempotent mutation functions to require the header, so that missing duplicate protection fails loudly instead of silently bypassing safety.
65. As a feature developer, I want duplicate pending submits with the same key to share the same result, so that only one backend side effect happens.
66. As a feature developer, I want successful idempotency results retained briefly, so that very near duplicate requests do not repeat work.
67. As a feature developer, I want failed idempotency results not retained permanently, so that users can retry after a failure.
68. As a feature developer, I want the form to rotate the Mutation Idempotency Key after a settled failed attempt, so that retry attempts are distinct.
69. As a maintainer, I want in-memory idempotency documented as non-distributed, so that production limitations are understood.
70. As a maintainer, I want no prebuilt `createIdempotentMutationServerFn` abstraction yet, so that type inference and server-function method order remain explicit.
71. As a maintainer, I want CSRF origin middleware deferred, so that this PRD stays focused on login foundation decisions already made.
72. As a maintainer, I want ESS/MSS external module URL configuration deferred, so that this slice does not build sidebar/module switching before it exists.
73. As a maintainer, I want tests around authentication and idempotency behavior, so that risky server-side contracts are pinned before UI polish.
74. As a maintainer, I want implementation to stop and ask if TanStack Start cookie or middleware APIs are unclear, so that migration decisions are not guessed.

## Implementation Decisions

- Build the slice in this order: authentication server functions and tests, shared form abstraction, ESS/MSS design CSS and assets, BlockUI and NProgress providers, route guards and layout split, then login page wiring.
- The authentication module remains flat until pressure exists.
- The authentication functions surface exports login, logout, current-session reading, and authentication menu reading from one functions module.
- The functions module is a thin server-function boundary: validate input, attach middleware, import server-only implementation, and return results.
- The server-only authentication implementation owns password encryption, backend calls, cookie creation and clearing, logout destination selection, and safe result mapping.
- Login preserves the old backend contract by posting to the backend login endpoint through the Backend Boundary public side.
- Password encryption uses the legacy CryptoJS AES behavior with the server-only authentication secret so backend compatibility is preserved.
- Login writes both the app-owned App Session cookie and the Legacy Cookies required for backward compatibility.
- Login returns an Authentication Result only: user identity and enabled module groups, with no access token, refresh token, or backend session identifier in the browser-facing result.
- The App Session expands to include display identity such as user name and user group when the backend provides it.
- Refresh token is not added to App Session until a refresh flow exists.
- Legacy Cookies may still carry refresh token for old-app compatibility.
- Login input validation preserves old Core rules: user ID required, trimmed, minimum four characters, maximum one hundred characters; password required with maximum two hundred fifty-five characters.
- No remember-me support is included.
- No dev credential prefill is included.
- Login failures are shown in the form, not through SweetAlert or modal alerts.
- Password remains in the field after login failure.
- Continue Destination handling accepts only same-origin/internal destinations.
- After Session Establishment, a safe Continue Destination wins; otherwise the app navigates to the private landing route.
- The private landing route owns future module placement decisions.
- The authentication route is public but guest-only.
- All remaining app routes live under a private pathless layout that checks for a readable App Session.
- Private layout guard redirects missing sessions to authentication with a Continue Destination built from the full current path.
- Guards call the current-session server function initially on each relevant navigation; caching can be optimized later.
- Logout calls the backend logout endpoint when a session exists, clears the app-owned session cookie and all known Legacy Cookies, and returns a server-selected Logout Destination.
- Logout Destination falls back to authentication when HCPlus logout configuration is missing.
- Existing Session Expiry Acknowledgement semantics remain: missing App Session redirects immediately, backend-rejected existing sessions require acknowledgement.
- Build an app-wide TanStack Form abstraction based on `useAppForm`.
- The first form fields supported are input and textarea fields.
- Form architecture uses TanStack Form, not Conform or React Hook Form from the design repo.
- The button primitive remains unchanged; loading state is composed in the login form until repetition proves a better API.
- Fully migrate the ESS/MSS visual language into Tailwind v4 CSS.
- Preserve shadcn semantic token names and remap them to ESS/MSS token approximations.
- Remove the current scenic starter theme so the app has one visual language.
- Copy/adapt the design repo authentication layout visually, including relevant public assets.
- Do not copy the design repo component API wholesale; component APIs evolve locally as usage creates pressure.
- Translate Tailwind v3 configuration, custom utilities, and deprecated classes into Tailwind v4 CSS constructs.
- Accept Tailwind v4 browser requirements.
- Add NProgress for router navigation only, with delayed display and minimum visible duration through spin delay.
- Add subtle React-context BlockUI with Loader2 spinner for manual blocking only.
- BlockUI uses spin delay so fast operations do not show the overlay.
- Navigation progress and BlockUI are separate to avoid duplicate indicators.
- Add a shared idempotency platform module for mutation server-function middleware and a small in-memory TTL cache.
- Idempotent mutation server functions require an `x-idempotency-key` header.
- Idempotency keys are per submit attempt, not permanent form identifiers.
- Duplicate pending requests with the same key reuse the same pending work and do not call the backend again.
- Successful idempotency results are retained for about sixty seconds.
- Failed attempts are not retained as a permanent block so retries can proceed with a fresh key.
- The in-memory idempotency cache is capped around one thousand entries.
- No Redis, database, or backend-owned distributed idempotency is included in this slice.
- Do not build a custom server-function factory for idempotent mutations yet; explicit middleware stays clearer until repetition proves pain.
- Add required auth environment variables for password encryption and cookie signing/session creation.
- Keep HCPlus logout URL optional with safe fallback behavior.
- Defer ESS/MSS external module URL setup until module switching/sidebar work exists.
- Defer CSRF origin middleware for this PRD.
- Follow existing ADRs requiring server functions as the backend boundary and normalizing Legacy Cookies into App Session.
- Follow the ADRs for remapping shadcn tokens to ESS/MSS and using in-memory idempotency for server function mutations.

## Testing Decisions

- Tests should verify externally observable behavior and boundary contracts, not private implementation details.
- Authentication server function tests should extend the existing authentication tests that mock the Backend Boundary.
- Login tests should verify input validation rejects invalid user IDs and passwords before backend contact.
- Login tests should verify backend login is called through the server-only implementation and not exposed to browser code.
- Login tests should verify successful Session Establishment writes both App Session and Legacy Cookies.
- Login tests should verify the Authentication Result contains safe identity and module-group data but no tokens or backend session identifiers.
- Login tests should verify menu groups are derived from backend flags and can be empty without rejecting authentication.
- Login tests should verify user name and user group are preserved in App Session when present.
- Login tests should verify refresh token is not exposed in Authentication Result or required by App Session behavior.
- Logout tests should verify backend logout is called when a session exists.
- Logout tests should verify app-owned session cookies and known Legacy Cookies are cleared.
- Logout tests should verify Logout Destination uses HCPlus configuration when present and authentication fallback when absent.
- Current-session tests should verify readable sessions return safe summaries and missing sessions return null.
- App Session tests should be updated for user name and user group schema behavior.
- Idempotency middleware tests should verify missing keys fail loudly.
- Idempotency middleware tests should verify duplicate pending keys do not execute the wrapped mutation twice.
- Idempotency middleware tests should verify successful results are reused within TTL.
- Idempotency middleware tests should verify failed attempts are retryable rather than permanently cached.
- Idempotency middleware tests should verify TTL cleanup and max-entry behavior at the cache boundary.
- Form abstraction tests should focus on user-visible field behavior if component tests are added; do not snapshot internal TanStack Form state.
- Design-system migration should be checked through typecheck/build and visual review rather than brittle CSS implementation tests.
- NProgress and BlockUI behavior can be tested only where practical; the core acceptance is delayed indicator behavior and separation between navigation progress and manual blocking.
- Route guard tests may be added if straightforward; otherwise route behavior should be validated through integration/manual checks once the layout split exists.
- No E2E suite is required for this PRD, but the flow should remain ready for future E2E login coverage.

## Out of Scope

- ESS/MSS sidebar, module switching, and external ESS/MSS URL integration are out of scope.
- A dedicated no-module-access landing experience is out of scope; empty module groups are allowed and can be handled later by the private landing route.
- Refresh token usage and token refresh flow are out of scope.
- Distributed idempotency with Redis, database storage, or backend-owned idempotency is out of scope.
- A custom `createIdempotentMutationServerFn` helper is out of scope until repeated usage proves the abstraction.
- CSRF origin middleware is out of scope for this PRD and should be revisited before production hardening.
- Full copying of the design repo component APIs is out of scope.
- React Hook Form and Conform migration from the design repo are out of scope.
- Dev credential prefill is out of scope.
- Remember-me behavior is out of scope.
- SweetAlert-style modal errors for login are out of scope.
- Permission/feature-level guards beyond the private session layout are out of scope.
- E2E test automation is out of scope for this PRD.

## Further Notes

The old Core repo is a behavior reference, not an architecture reference. The migrated app should preserve login/logout/session compatibility where required, but the implementation should follow the current TanStack Start architecture: thin routes, module-owned workflows, server functions as backend boundaries, and shared platform seams for cross-cutting infrastructure.

The design repo is a visual and token reference, not a form architecture reference. The migrated app should keep TanStack Form as the app form foundation and preserve shadcn semantic token compatibility while adopting ESS/MSS visual tokens.

The in-memory idempotency decision is deliberately scoped to double-click protection during migration. It is not a guarantee across server restarts or multiple server instances.

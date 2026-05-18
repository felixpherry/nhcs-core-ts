# Shared Platform

Cross-module platform language for backend access, auth/session handling, and reusable app infrastructure. Platform seams live under `src/shared/platform/`.

## Language

**Backend Boundary**:
The server-side boundary through which all calls to the NHCS backend pass.
_Avoid_: Client API calls, direct backend fetches

**Backend Envelope**:
The NHCS backend response wrapper that reports success, authorization, message, and payload fields.
_Avoid_: Raw API response, plain JSON

**App Session**:
The normalized session shape this app uses after reading either internal session cookies or legacy shared cookies.
_Avoid_: Auth store, cookie bag

**Legacy Cookies**:
The signed shared cookies created by older NHCS apps to enable login continuity across apps.
_Avoid_: New session, browser storage

**Backend Session Headers**:
The compatibility headers sent to the NHCS backend for authenticated requests.
_Avoid_: Auth headers, token headers

**Session Expiry Acknowledgement**:
The user-visible acknowledgement step required after an in-page session expiry before redirecting to authentication.
_Avoid_: Immediate kick-out, silent redirect

## Relationships

- A **Backend Boundary** normalizes a **Backend Envelope** before module code receives data.
- An **App Session** may be created from **Legacy Cookies**.
- **App Session** owns the app-owned and **Legacy Cookies** names that carry session continuity.
- **Backend Session Headers** are derived from an **App Session**.
- **Session Expiry Acknowledgement** happens when the backend rejects an existing **App Session**; missing cookies redirect to authentication immediately because no session can be judged.
- Modules depend on the **Backend Boundary**, not direct backend endpoints.

## Example dialogue

> **Dev:** "Can this page call the backend URL directly from the browser?"
> **Domain expert:** "No. It must go through the **Backend Boundary** so **Backend Envelope** quirks and **Legacy Cookies** stay centralized."

## Flagged ambiguities

- "Session" can mean raw legacy cookie values or normalized app state — resolved: use **Legacy Cookies** for raw shared cookies and **App Session** for normalized app state.
- "Session expired" can mean backend-rejected existing cookies or missing cookies — resolved: missing cookies redirect immediately; existing cookies are judged only by the first backend call, which may trigger **Session Expiry Acknowledgement**.

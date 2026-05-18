Status: needs-triage

# Deferred Auth Lifecycle Gaps

Only legacy cookie write compatibility is in-scope now. Deferred gaps from old Core parity review:

- Full login flow: auth page, login server function, password encryption, backend `/authentication/api/auth/login`, response mapping, query cache clear, continue redirect.
- Full logout flow: backend logout call, store/session cleanup, cookie clearing, HCPlus production logout redirect.
- Route guards/protected layout: unauthenticated redirect to authentication with continuation, authenticated login redirect.
- Global session-expiry UX: TanStack Query/mutation error integration, one root dialog, acknowledge then redirect.
- Forbidden/access-denied UX: 403 handling and modal/navigation behavior.
- Change password flow: old/new password encryption and backend `/authentication/api/auth/change-password` call.
- Observability parity: backend-boundary request logging, error logging, Prometheus metrics, upstream header propagation, body limit policy.

Out of scope here: GraphQL, SSE, file upload.

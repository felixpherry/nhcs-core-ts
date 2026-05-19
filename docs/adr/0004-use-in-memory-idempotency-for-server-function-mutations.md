# Use in-memory idempotency for server function mutations

Mutation server functions that can repeat backend side effects will require an `x-idempotency-key` header and use server function middleware to dedupe repeated submits in process memory for a short TTL. This is intentionally scoped to double-click and fast retry protection during the frontend migration; it is not a distributed idempotency guarantee, and can later move to Redis, the database, or backend-owned idempotency if multi-instance production behavior requires it.

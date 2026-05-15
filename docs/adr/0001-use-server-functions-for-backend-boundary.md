# Use server functions for the backend boundary

Backend calls go through TanStack Start server functions rather than direct browser-to-backend requests. This keeps backend response quirks, cookies, auth/session handling, and error normalization in one server-side boundary while modules call typed server functions instead of raw backend endpoints.

# Context Map

## Contexts

- [Shared Platform](./src/shared/CONTEXT.md) — cross-module platform language for backend access, auth/session handling, and reusable app infrastructure.

## Relationships

- **Modules → Shared Platform**: modules call server functions and shared platform utilities instead of calling the backend directly.
- **Shared Platform → Backend**: shared platform code owns backend quirks, legacy cookie compatibility, and normalized app-facing contracts.

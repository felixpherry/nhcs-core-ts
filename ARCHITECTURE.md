# Frontend Architecture

Short rules. Always read this before changing `src/`.

More detail:

- [`docs/architecture/examples.md`](docs/architecture/examples.md) — concrete folder/file examples
- [`docs/architecture/decisions.md`](docs/architecture/decisions.md) — rationale and tradeoffs

## Core Shape

```txt
src/
  routes/        # TanStack route files only
  modules/       # business features / workflows
  shared/        # cross-module reusable code
  integrations/  # external integration setup
```

Mental model:

```txt
routes = URL, loader, guard, layout wiring
modules = business logic + feature UI
shared = reusable primitives or cross-module building blocks
```

## Rules

### Routes stay thin

Allowed in routes:

- `createFileRoute`
- loader/action wiring
- auth/permission guards
- search param validation
- import and render module page
- pending/error boundary wiring

Not allowed in routes:

- big JSX
- form/table logic
- business rules
- API implementation
- reusable components

Every route should usually render one module page.

### Modules own business workflows

Small modules stay flat:

```txt
modules/authentication/
  authentication-page.tsx
  authentication.functions.ts
  authentication.server.ts
  authentication.schema.ts
  authentication.types.ts
```

Large modules split into child slices only when pressure exists.

Rule:

```txt
Flat until it hurts.
Folder when there is pressure.
shared/ means shared only by child slices inside the module.
```

### Server functions are boundaries

`.functions.ts` files export TanStack Start server functions and are safe to import from client code.

`.functions.ts` flow:

```txt
createServerFn -> validate -> require user/session -> call server-only implementation -> return result
```

Server-only implementation goes in `{module}.server.ts` and is imported only inside server function handlers.

DB/external API/Backend Boundary details stay server-only; split to named `*.server.ts` files only when pressure exists.

Never mix client-safe query keys with server-only implementation.

### Shared stays honest

- `shared/components/ui` = shadcn/generic UI primitives
- `shared/components` = app-wide composed components only
- `shared/{domain}` = reusable business/domain code used by multiple modules
- `shared/platform/{concept}` = cross-cutting app infrastructure seams
- `shared/lib` = configured app/library code, clients, adapters, setup
- `shared/utils` = pure helper functions

Do not put domain-specific code in `shared/components`.

Shared platform modules with noisy mechanics may expose a contract-first shape:

```txt
shared/platform/{concept}/
  {concept}.contract.ts  # review surface: interface, invariants, error modes
  {concept}.server.ts    # tiny exported adapter / wiring
  {concept}.types.ts
  {concept}.errors.ts    # when caller-visible errors exist
  implementation/        # module-local implementation mechanics
```

Rules:

- `*.contract.ts` is what reviewers read first.
- `*.server.ts` should stay boring and small.
- `implementation/` inside `shared/platform/{concept}` is module-local, not generic `shared/utils`.
- Prefer named implementation files (`backend-url.ts`) over vague files (`utils.ts`, `helpers.ts`).
- Do not force contracts for small modules that remain easy to scan.

### Tests colocate

Unit/component tests live beside code.

E2E tests live outside `src` in `e2e/`.

### Imports follow ownership

Allowed:

```txt
routes -> modules
routes -> shared
modules -> same module
modules -> shared
shared/* -> shared/*
```

Avoid:

```txt
shared -> modules
module -> another module
sibling slice -> sibling slice
```

If two modules need same business concept, move it to `shared/{domain}`.
If two modules need same infrastructure seam, move it to `shared/platform/{concept}`.
If two sibling slices need same thing, move it to `modules/{module}/shared`.

### Names are searchable

Prefer:

```txt
authentication-page.tsx
pcn-list-table-columns.tsx
```

Avoid vague names when they hurt picker search:

```txt
page.tsx
form.tsx
table.tsx
```

## Final Rules

```txt
Keep routes thin.
Keep modules business-focused.
Keep shared honest.
Use contracts for noisy shared seams.
Colocate tests.
Prefer searchable filenames.
Do not force identical folder trees.
Flat until it hurts.
Folder when there is pressure.
Split by use case, not aesthetics.
```

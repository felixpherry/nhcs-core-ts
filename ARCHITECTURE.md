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
  authentication.schema.ts
  authentication.server.ts
  authentication.service.ts
  authentication.types.ts
```

Large modules split into child slices only when pressure exists.

Rule:

```txt
Flat until it hurts.
Folder when there is pressure.
shared/ means shared only by child slices inside the module.
```

### Server files are boundaries

`.server.ts` flow:

```txt
createServerFn -> validate -> require user/session -> call service -> return result
```

Business/use-case logic goes in `{module}.service.ts`.

DB/external API details go in `{module}.repository.ts`.

Never mix client-safe query keys with server-only functions.

### Shared stays honest

- `shared/components/ui` = shadcn/generic UI primitives
- `shared/components` = app-wide composed components only
- `shared/{domain}` = reusable domain-aware code used by multiple modules
- `shared/lib` = configured app/library code, clients, adapters, setup
- `shared/utils` = pure helper functions

Do not put domain-specific code in `shared/components`.

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

If two modules need same thing, move it to `shared/{domain}`.
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
Colocate tests.
Prefer searchable filenames.
Do not force identical folder trees.
Flat until it hurts.
Folder when there is pressure.
Split by use case, not aesthetics.
```

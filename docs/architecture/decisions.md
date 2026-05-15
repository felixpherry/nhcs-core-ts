# Frontend Architecture Decisions

Rationale and tradeoffs behind [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md).

## Routes stay thin

Routes represent URL, loader, guard, and layout wiring. Business logic in routes makes flows harder to test, reuse, and move.

Tradeoff: tiny route-specific glue can live in route files. Once JSX, form state, table logic, or API logic grows, move it into module code.

## Modules own business workflows

`src/modules/` contains feature UI, schemas, service logic, server-function boundaries, and module types.

Tradeoff: small modules can stay flat. Large modules can split into child slices when there is real pressure.

## Shared stays honest

`src/shared/` is for cross-module code only.

- Generic UI primitives go in `shared/components/ui`.
- App-wide composed components go in `shared/components`.
- Reusable domain-aware code used by multiple modules goes in `shared/{domain}`.

Tradeoff: promoting code to shared too early creates vague abstractions. Prefer module-local first.

## Flat until it hurts

Do not force identical folder trees across modules. Start with searchable flat files for one-file categories:

- `{module}.server.ts`
- `{module}.service.ts`
- `{module}.schema.ts`
- `{module}.types.ts`

Create folders when category has multiple peer files or files become hard to scan.

## Split by use case, not aesthetics

Large modules split by workflow/slice (`list`, `approval`) instead of technical layer (`components`, `services`, `schemas`) alone.

Tradeoff: shared code between sibling slices moves to `modules/{module}/shared/`.

## Server files are boundaries

`.server.ts` files expose server functions and handle boundary concerns:

- validation wiring
- session/current-user extraction
- service calls
- expected error mapping

Business/use-case logic belongs in `{module}.service.ts`. DB or external API details belong in `{module}.repository.ts`.

Tradeoff: start with one cohesive server file. Split when it exceeds roughly 200–300 lines, mixes permissions/schemas/tests, or causes merge/agent conflicts.

## Query keys are client-safe

Never mix client-safe query keys with server-only functions.

Reason: import boundaries become unclear and client bundles can accidentally touch server-only code.

## `lib` vs `utils`

`shared/lib` holds configured app/library code, clients, adapters, and setup.

`shared/utils` holds pure helper functions.

Reason: configured things have environment/framework coupling; utilities should stay portable and easy to test.

## Import boundaries

Allowed:

```txt
routes -> modules
routes -> shared

modules -> same module
modules -> shared

modules/pcn/list -> modules/pcn/shared
modules/pcn/approval -> modules/pcn/shared

shared/* -> shared/*
```

Avoid:

```txt
shared -> modules
modules/pcn -> modules/leave-and-absence
modules/pcn/list -> modules/pcn/approval
```

If two modules need same code, move it to `shared/{domain}`. If two sibling slices need same code, move it to `modules/{module}/shared`.

## Decision rules

```txt
Used by one slice only?
-> modules/{module}/{slice}/

Used by sibling slices in same module?
-> modules/{module}/shared/

Used by multiple top-level modules?
-> shared/{domain}/

Generic UI primitive?
-> shared/components/ui/

App-wide composed component?
-> shared/components/

Route/page entry?
-> routes/ imports module page

Small module?
-> flat files

Large module?
-> child slices + shared/
```

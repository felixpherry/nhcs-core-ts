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
- Reusable business/domain code used by multiple modules goes in `shared/{domain}`.
- Cross-cutting app infrastructure seams go in `shared/platform/{concept}`.

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

## Contract-first shared boundaries

Some shared platform modules are cross-module seams with a small caller interface and noisy implementation mechanics. For these, use a contract-first shape:

```txt
shared/platform/{concept}/
  {concept}.contract.ts
  {concept}.server.ts
  {concept}.types.ts
  {concept}.errors.ts
  implementation/
```

`*.contract.ts` documents the caller interface, invariants, and error modes. `*.server.ts` stays as the tiny exported adapter. `implementation/` holds module-local mechanics that reviewers can skip unless debugging.

Reason: reviewers should be able to inspect the interface without reading cookie parsing, envelope mapping, URL safety, or similar mechanical code.

Tradeoff: this adds files. Use it only when the shared module is important enough that a clean review surface is valuable. Small modules should stay flat.

## `lib` vs `utils`

`shared/lib` holds configured app/library code, clients, adapters, and setup.

`shared/utils` holds pure helper functions.

`shared/platform/{concept}/implementation` holds module-local mechanics for that platform module. These helpers may be infrastructure-aware or server-only when the parent platform module owns that concern.

Reason: configured things have environment/framework coupling; global utilities should stay portable and easy to test. Module-local implementation files exist to keep the parent module's review surface clean without promoting mechanics to global `shared/utils`.

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

If two modules need same business code, move it to `shared/{domain}`. If two modules need same infrastructure seam, move it to `shared/platform/{concept}`. If two sibling slices need same code, move it to `modules/{module}/shared`.

## Decision rules

```txt
Used by one slice only?
-> modules/{module}/{slice}/

Used by sibling slices in same module?
-> modules/{module}/shared/

Used by multiple top-level modules as business/domain code?
-> shared/{domain}/

Used by multiple top-level modules as infrastructure seam?
-> shared/platform/{concept}/

Shared platform seam with noisy mechanics?
-> shared/platform/{concept}/{concept}.contract.ts + {concept}.server.ts + implementation/

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

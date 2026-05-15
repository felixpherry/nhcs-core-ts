# Frontend Architecture Examples

Concrete examples for the progressive architecture rules in [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md).

## Core Shape

```txt
src/
  routes/                 # TanStack route files only
  modules/                # business features / workflows
  shared/                 # cross-module reusable code
    components/
      ui/                 # shadcn primitives
    lib/                  # app/library setup + adapters
    utils/                # pure helper functions
  integrations/           # external integration setup
  env.ts
  router.tsx
  styles.css

e2e/                      # end-to-end tests
```

## Route File

```tsx
// routes/(auth)/authentication.tsx
import { createFileRoute } from '@tanstack/react-router';
import { AuthenticationPage } from '#/modules/authentication/authentication-page';

export const Route = createFileRoute('/(auth)/authentication')({
  component: AuthenticationPage,
});
```

## Small Module

```txt
modules/authentication/
  components/
    authentication-form.tsx
  authentication-page.tsx
  authentication.schema.ts
  authentication.server.ts
  authentication.service.ts
  authentication.types.ts
```

## Large Module With Slices

```txt
modules/pcn/
  shared/
    components/
      pcn-form.tsx
      pcn-status-badge.tsx
    pcn.server.ts
    pcn.service.ts
    pcn.repository.ts
    pcn.schema.ts
    pcn.types.ts
    pcn-query-keys.ts

  list/
    components/
      pcn-list-table.tsx
      pcn-list-table-columns.tsx
      pcn-list-filters.tsx
    hooks/
      use-pcn-list-query.ts
    pcn-list-page.tsx
    pcn-list.schema.ts

  approval/
    components/
      pcn-approval-actions.tsx
    hooks/
      use-pcn-approval-flow.ts
    pcn-approval-page.tsx
    pcn-approval.schema.ts
```

## Components And Hooks

```txt
modules/{module}/components/
modules/{module}/hooks/
modules/{module}/{slice}/components/
modules/{module}/{slice}/hooks/
```

Prefer flat one-file categories:

```txt
authentication.server.ts
authentication.service.ts
authentication.schema.ts
authentication.types.ts
```

Avoid early category folders:

```txt
server/authentication.server.ts
services/authentication.service.ts
schemas/authentication.schema.ts
types/authentication.types.ts
```

## Server Function Flow

```txt
createServerFn -> validate -> require user/session -> call service -> return result
```

Good split:

```txt
pcn.server.ts
pcn-query-keys.ts
```

Bad split:

```txt
pcn.server.ts  # exports server fns and query keys
```

## Shared

```txt
shared/components/ui/
  button.tsx
  input.tsx
  label.tsx
  select.tsx
```

```txt
shared/components/
  app-sidebar.tsx
  page-header.tsx
  data-toolbar.tsx
```

```txt
shared/employee/
  components/
    employee-picker.tsx
    employee-avatar.tsx
  api/
    search-employees.ts
  types/
    employee-option.types.ts
```

Placement examples:

```txt
Button -> shared/components/ui
PageHeader -> shared/components
EmployeePicker -> shared/employee
PcnForm -> modules/pcn/shared
PcnListTable -> modules/pcn/list
```

## Lib vs Utils

```txt
shared/lib   = configured app/library code, clients, adapters, setup
shared/utils = pure helper functions
```

Examples:

```txt
shared/lib/utils.ts          # shadcn cn()
shared/lib/query-client.ts
shared/lib/api-client.ts

shared/utils/format-date.ts
shared/utils/format-currency.ts
shared/utils/assert-never.ts
```

## Table Columns

```txt
modules/pcn/list/components/
  pcn-list-table.tsx
  pcn-list-table-columns.tsx
```

Shared by sibling slices:

```txt
modules/pcn/shared/components/pcn-table-columns.tsx
```

## Tests

```txt
pcn-form.tsx
pcn-form.test.tsx

pcn-permissions.ts
pcn-permissions.test.ts

use-pcn-list-query.ts
use-pcn-list-query.test.ts
```

```txt
e2e/
  auth.spec.ts
  pcn-list.spec.ts
  pcn-approval.spec.ts
```

## Searchable Names

Good:

```txt
authentication-page.tsx
authentication-form.tsx
pcn-list-page.tsx
pcn-list-table.tsx
pcn-list-table-columns.tsx
pcn-approval-actions.tsx
```

Avoid when it hurts picker search:

```txt
page.tsx
form.tsx
table.tsx
types.ts
utils.ts
```

Tiny leaf components may stay simple:

```txt
password-field.tsx
remember-me-checkbox.tsx
```

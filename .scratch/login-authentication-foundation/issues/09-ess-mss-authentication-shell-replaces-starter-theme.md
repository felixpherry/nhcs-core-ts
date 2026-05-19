Status: needs-triage

# ESS/MSS authentication shell replaces starter theme

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Migrate ESS/MSS authentication visual shell into app (Tailwind v4 tokens/utilities/assets/layout), replacing scenic starter theme while preserving shadcn semantic token compatibility and existing component class semantics.

## Acceptance criteria

- [ ] Authentication page matches ESS/MSS auth shell visuals (background/media/layout/typography) using migrated local assets and Tailwind v4 CSS.
- [ ] Starter scenic theme styles are removed so single visual language remains.
- [ ] shadcn semantic token names continue to work after remap to ESS/MSS approximations.

## Blocked by

- `.scratch/login-authentication-foundation/issues/07-tanstack-form-login-form-uses-useappform.md`

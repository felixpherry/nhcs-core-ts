Status: needs-triage

# Delayed NProgress handles router pending state

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Add app-level delayed NProgress wired to router pending state so slow navigations show feedback and fast navigations avoid progress flash.

## Acceptance criteria

- [ ] Router pending transitions start NProgress only after configured delay.
- [ ] NProgress stays visible for minimum duration once shown to prevent flicker.
- [ ] Navigation progress remains separate from manual BlockUI behavior.

## Blocked by

None - can start immediately

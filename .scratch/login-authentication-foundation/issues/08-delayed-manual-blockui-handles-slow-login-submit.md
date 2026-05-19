Status: needs-triage

# Delayed manual BlockUI handles slow login submit

## Parent

- `.scratch/login-authentication-foundation/PRD.md`

## What to build

Implement subtle manual BlockUI via React context with delayed spinner display for slow blocked operations (login submit path), while avoiding overlays for fast operations.

## Acceptance criteria

- [ ] BlockUI can be toggled explicitly by workflow code and is not coupled to router pending state.
- [ ] Overlay spinner appears only after delay threshold, avoiding flash on fast submits.
- [ ] Login submit path uses BlockUI only for blocked operations and remains visually distinct from NProgress.

## Blocked by

- `.scratch/login-authentication-foundation/issues/07-tanstack-form-login-form-uses-useappform.md`

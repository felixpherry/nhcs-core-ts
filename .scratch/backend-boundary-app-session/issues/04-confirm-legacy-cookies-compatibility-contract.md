Status: needs-triage

# Confirm Legacy Cookies compatibility contract

## Parent

.scratch/backend-boundary-app-session/PRD.md

## What to build

Confirm the exact Legacy Cookies contract before implementing fallback parsing. The team needs the cookie names, suffix behavior, signing/verification details, and payload fields needed to create a normalized App Session compatible with older NHCS apps.

## Acceptance criteria

- [ ] Legacy Cookies names, required non-empty suffix rules, and environment variable names are documented.
- [ ] Legacy Cookies signing/verification behavior is documented enough for implementation and tests.
- [ ] Legacy payload fields are mapped to the normalized App Session fields needed for Backend Session Headers.

## Blocked by

None - can start immediately

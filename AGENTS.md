## Migration Context
This project migrates business behavior from `~/dev/NHCS_Frontend/`.
Design system reference: `~/dev/NHCS_ESS_MSS/`.

Before making migration decisions:
- Explore the old repo first.
- Explore the design system repo if it's UI-related.
- Spawn subagents when useful.
- Understand behavior, flows, edge cases, and business rules.

Do **not** blindly copy architecture, patterns, abstractions, or technical decisions from the old "crap" repo. Treat it as behavior reference, not design reference.

When old-code behavior matters:
1. Explain what the old repo does.
2. Propose several implementation options.
3. Recommend one option with trade-offs.
4. Ask before adopting any major pattern from the old codebase.

## Hard Rules
- ALWAYS use `bun`.
- ALWAYS use `bun install` to add packages.
- ALWAYS read `ARCHITECTURE.md` before changing `src/`.
- STOP in the middle of implementation if you're stuck or unsure about something. Get back to me and clear your doubts.

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain docs use a multi-context layout, with contexts organised by module. See `docs/agents/domain.md`.

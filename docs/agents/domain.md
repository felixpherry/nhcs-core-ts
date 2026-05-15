# Domain Docs

How engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses a **multi-context** domain documentation layout organised by module.

- Root `CONTEXT-MAP.md` lists available contexts and points to relevant module docs.
- Module contexts live at `src/modules/<module>/CONTEXT.md`.
- System-wide ADRs live under `docs/adr/`.
- Module-specific ADRs live under `src/modules/<module>/docs/adr/`.

Current module contexts should follow this shape:

```text
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    └── modules/
        └── authentication/
            ├── CONTEXT.md
            └── docs/adr/              ← module-specific decisions
```

## Before exploring, read these

- **`CONTEXT-MAP.md`** at repo root if it exists. Use it to select relevant module contexts.
- **`src/modules/<module>/CONTEXT.md`** for any module touched by task.
- **`docs/adr/`** for system-wide decisions touching task area.
- **`src/modules/<module>/docs/adr/`** for module-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag absence; don't suggest creating them upfront. Producer skill (`/grill-with-docs`) creates them lazily when terms or decisions get resolved.

## Use glossary vocabulary

When output names domain concept (issue title, refactor proposal, hypothesis, test name), use term as defined in relevant `CONTEXT.md`. Don't drift to synonyms glossary avoids.

If concept needed isn't in glossary yet, that's signal: either invented language project doesn't use (reconsider) or real gap (note for `/grill-with-docs`).

## Flag ADR conflicts

If output contradicts existing ADR, surface explicitly rather than silently overriding:

> _Contradicts ADR-0007 (example decision) — but worth reopening because…_

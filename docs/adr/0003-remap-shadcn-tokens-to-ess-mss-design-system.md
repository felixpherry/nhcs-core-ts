# Remap shadcn tokens to the ESS/MSS design system

The app will migrate the ESS/MSS visual system into Tailwind v4 CSS while preserving shadcn's semantic token API (`--background`, `--primary`, `--border`, etc.) so existing shadcn component class names keep working. We will approximate ESS/MSS palette values through those semantic tokens and migrate component APIs only when local usage creates pressure, rather than copying the design repo's component API wholesale or rewriting every shadcn class name.

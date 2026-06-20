# NullFi — Trust-Minimized Finance

Visual, interactive dashboard for transparent, programmable, on-chain financial
systems on **Sui**. Manage programmable loans, milestone escrow, automated
payments, and treasury controls — with contract logic and conditions rendered
visually in real time.

> Frontend phase. Data is currently mocked (`src/data/mock.ts`); the Sui /
> Move backend wires in behind the same `types/` contract.

## Stack

React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · Motion (Framer Motion 12) ·
Lucide React · Recharts

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the build
```

## Structure

```
src/
  App.tsx                       3-column shell + modal layer
  config/brand.ts               product name / tagline (single source of truth)
  types/index.ts                domain model (Contract, Condition, Tx, …)
  data/mock.ts                  seed data standing in for on-chain reads
  hooks/useAppState.tsx         context + reducer (auth / contracts / ui / feed)
  lib/
    motion.ts                   shared animation variants
    contractMeta.tsx            enum → color / icon / label maps
  utils/formatting.ts           address / money / time / countdown helpers
  components/
    Navigation.tsx              header: logo, nav, search, bell, account
    Sidebar.tsx                 contract list + filters (desktop + mobile drawer)
    CenterPanel.tsx             detail: stats, flow diagram, conditions, tx
    RightSidebar.tsx            live feed, quick stats, alerts (lg+)
    SVG/
      ContractFlowDiagram.tsx   animated initiator → contract → recipient
      ConditionProgressBar.tsx
      TimeCountdown.tsx
    Modals/
      ModalShell.tsx
      CreateContractModal.tsx
      ExecuteConditionModal.tsx
```

## Rename the product

Everything brand-facing reads from `src/config/brand.ts`. Change `BRAND.name`
and the whole app follows.

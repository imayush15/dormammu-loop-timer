# Dormammu Loop Timer

Time is not linear here.
A local ritual console for focus cycles, session chronicles, and streak divination.

## What This Relic Does

- Summons configurable focus and break loops.
- Stores every session in local IndexedDB memory.
- Splits chronicles by date and category.
- Reveals streaks, daily totals, and 7-day pulse.
- Demands a session inscription when a loop ends, is sealed, or is rewound.

## Arcane Stack

- React + TypeScript + Vite
- Local IndexedDB (`pomodoro-local-tracker`)
- No backend. No cloud. No external persistence.

## Summoning Instructions

```bash
npm install
npm run dev
```

Open the portal at:

```text
http://localhost:5173
```

## Production Incantation

```bash
npm run build
npm run preview
```

## Core Rituals

- `Invoke Loop`: begin current cycle.
- `Stall Time`: pause current cycle.
- `Seal Chronicle`: stop and log progress.
- `Rewind Ritual`: reset current cycle with summary flow.
- `Bind New Runes`: apply custom focus/break durations.
- `Inscribe Chronicle`: persist summary entry.

## Local Memory Notes

- Sessions are stored in IndexedDB object store: `sessions`.
- Pending interrupted session context is stored in localStorage key:
  `pomodoro:pending:v1`.

## File Map (Runes)

- `src/App.tsx` — orchestration layer
- `src/components/` — UI fragments (`TimerPanel`, `InsightsPanel`, `SummaryModal`)
- `src/hooks/` — timer + session store logic
- `src/lib/` — constants, time helpers, audio, storage, IndexedDB adapter
- `src/types/` — shared TypeScript domain types

## Oath

All records stay on your machine.
The loop serves focus, not distraction.

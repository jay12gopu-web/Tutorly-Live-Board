# Tutorly Live Board

An interactive, client-side geometry workspace prototype for Tutorly's guided angle-bisector lesson.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/tutorly-live-board/src/pages/LiveBoardPage.tsx` — autoplay lesson orchestration, playback controls, and student work mode
- `artifacts/tutorly-live-board/src/components/BoardCanvas.tsx` — SVG board rendering and pointer interactions
- `artifacts/tutorly-live-board/src/board/commands.ts` — structured `BoardCommandEngine`, camera focus, and layer operations
- `artifacts/tutorly-live-board/src/board/types.ts` — layered object, animation, focus, and command metadata
- `artifacts/tutorly-live-board/src/board/lesson.ts` — angle-bisector demo steps, focus areas, and playback metadata
- `artifacts/tutorly-live-board/src/index.css` — Tutorly board theme and responsive layout

## Architecture decisions

- Structured geometry is stored as editable SVG-friendly objects rather than a flattened bitmap.
- Tutorly and student-created objects share one board model but retain separate `TutorlyLayer` / `StudentLayer` metadata.
- Tutorly objects are locked to pointer editing; internal lesson actions still route through `BoardCommandEngine.execute()`.
- Lesson camera framing is a reusable `focus_objects` command driven by step metadata, not UI-specific coordinates.
- This prototype intentionally stays client-only; lesson state persists only for the current browser session.

## Product

Tutorly Live Board presents a six-step angle-bisector lesson as an autoplay visual explanation with animated geometry, camera focus, playback controls, and a simplified Tutorly guide. Students can enter My Work / Let Me Try mode to draw on a separate editable layer while Tutorly's construction remains locked.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- This is a standalone prototype and does not connect to Tutorly authentication, voice, AI APIs, billing, or a database.
- Voice is intentionally a placeholder that reports where Tutorly's existing voice chat will connect later.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

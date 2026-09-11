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

- `artifacts/tutorly-live-board/src/pages/LiveBoardPage.tsx` — lesson orchestration and local board session state
- `artifacts/tutorly-live-board/src/components/BoardCanvas.tsx` — SVG board rendering and pointer interactions
- `artifacts/tutorly-live-board/src/board/commands.ts` — structured `BoardCommandEngine`
- `artifacts/tutorly-live-board/src/board/types.ts` — editable object and command metadata
- `artifacts/tutorly-live-board/src/board/lesson.ts` — angle-bisector demo steps and tutor commands
- `artifacts/tutorly-live-board/src/index.css` — Tutorly board theme and responsive layout

## Architecture decisions

- Structured geometry is stored as editable SVG-friendly objects rather than a flattened bitmap.
- Tutorly and student-created objects share one board model but retain separate `createdBy` metadata.
- Tutor lesson actions route through `BoardCommandEngine.execute()` so a future AI command source can reuse the same interface.
- This prototype intentionally stays client-only; lesson state persists only for the current browser session.

## Product

Tutorly Live Board lets students construct geometry with point, line, ray, arrow, circle, arc, rectangle, text, equation, pen, highlighter, axes, and graph tools. It includes selection, moving, erasing, zooming, panning, undo/redo, a collapsible tutor panel, and a six-step angle-bisector teaching demo with Show Me and Let Me Try modes.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- This is a standalone prototype and does not connect to Tutorly authentication, voice, AI APIs, billing, or a database.
- Voice is intentionally a placeholder that reports where Tutorly's existing voice chat will connect later.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

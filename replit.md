# EduVerse AI

EduVerse AI is a student learning companion that connects personalized study help, planning, career discovery, roadmaps, and skill-gap progress.

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

- `artifacts/eduverse-ai/src/` — the student-facing React app and its EduVerse UI
- `artifacts/api-server/src/routes/eduverse.ts` — MVP API handlers and demo student state
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `artifacts/eduverse-ai/src/index.css` — shared visual theme and typography tokens

## Architecture decisions

- The first release centers on the PRD's core loop rather than trying to ship opportunities, community, gamification, and teacher workflows at once.
- API contracts are generated from OpenAPI before client work so each primary interaction has a typed path.
- The MVP uses a seeded in-memory student profile on the API server to keep the prototype immediately usable while later persistence and auth decisions are finalized.

## Product

The MVP supports a personalized dashboard, resource discovery with bookmarks, daily/weekly/monthly study tasks, career matching, roadmap milestones, skill-gap recommendations, an eduGPT study assistant, and profile preferences.

## User preferences

No additional user preferences recorded.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- The web app and API are separate managed workflows; restart both after changes that affect their startup or bundles.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

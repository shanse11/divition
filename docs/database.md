# Database

## Local development

Local development uses Prisma with SQLite (`DATABASE_URL=file:./dev.db`). Its schema and migration history live in `prisma/`.

```bash
pnpm db:migrate
pnpm db:seed # optional, local only
```

`pnpm dev` and `pnpm test:e2e` automatically generate the SQLite Prisma Client. `pnpm vercel-build` intentionally replaces it with the PostgreSQL client for the Vercel build; the next local development or E2E command restores the SQLite client.

## Production: Neon PostgreSQL

Vercel has no persistent local filesystem. Production therefore uses the independent PostgreSQL schema and initial migration in `prisma-postgres/`; do not apply the SQLite migrations to Neon.

Configure these values only in the deployment platform or an ignored local environment file:

```env
# Runtime: Neon pooled URL for serverless request concurrency.
DATABASE_URL=postgresql://...
# Prisma CLI: Neon direct URL for migration operations.
DIRECT_URL=postgresql://...
```

Generate the production Prisma Client and apply reviewed migrations with:

```bash
pnpm db:generate:postgres
pnpm db:deploy
```

`db:deploy` runs `prisma migrate deploy` against `prisma-postgres/schema.prisma`; Prisma uses `DIRECT_URL` for the migration connection. Run it against a fresh production database before serving traffic, and run it in CI before each later production release containing a migration. Do not run `prisma migrate dev`, `prisma db push`, or the demo seed against production.

The schema includes User, Account, Session, TarotReading, TarotDraw, ReadingNote, Favorite, DailyReading, DreamReading, UserSettings, ShareLink, Achievement and UserAchievement.

## Invariants

- Tarot draws are unique by reading and position.
- Daily readings are unique by owner and date.
- Share IDs are random and the private question is hidden by default.
- User-owned records cascade on account deletion.
- Owner/date and owner/createdAt indexes support history and daily lookup.

Back up a populated production database before applying schema changes. SQLite-to-PostgreSQL data transfer is intentionally not part of this initial deployment path; migrate existing local data separately if it must be retained.

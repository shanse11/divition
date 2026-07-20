# Architecture

## Layers

- `src/app`: App Router pages and server Route Handlers.
- `src/components`: visual system and feature Client/Server Components.
- `src/data`: immutable tarot deck, spreads and zodiac definitions.
- `src/lib`: validation, random drawing, AI orchestration and local fallback engines.
- `src/server`: authentication, identity, rate limiting, Prisma and repositories.

## Core reading flow

`ReadingFlow` owns wizard state through Zustand. `DrawStep` uses Web Crypto helpers from `src/lib/tarot/draw.ts`; the browser posts validated cards to `/api/readings`. The server performs ownership/rate-limit checks, requests a structured interpretation, persists it through `readingsRepo`, then redirects to a private result page.

## Identity

Anonymous visitors receive an HttpOnly `astral_anon_id`. Email login uses hashed passwords and an HttpOnly session token. Registration claims anonymous readings. Every mutation verifies the current user/anonymous owner ID.

## Privacy sharing

`POST /api/readings/[id]/share` verifies ownership and creates a random ShareLink. Public pages expose only the reading summary and show the original question solely when explicitly opted in.

# Pokémon Browser (Next.js + Laravel API)

A simple Next.js app to browse Pokémon with:
- Infinite scroll + “Load more” fallback
- Search by name/ID
- LocalStorage page caching
- Abortable fetches, sticky search, accessible UI

Backend API is a Laravel service exposing:
- GET http://127.0.0.1:8080/api/pokemon?limit=24&offset=0
- GET http://127.0.0.1:8080/api/pokemon/:nameOrId

## Prerequisites

- Node.js 18+ (recommended 20+)
- pnpm, npm, or yarn
- Running Laravel API at http://127.0.0.1:8080/api

If your API runs on a different host/port, update BASE_URL in lib/api.ts.

## Getting Started

1) Install dependencies
```bash
pnpm install
# or
npm install
# or
yarn
```

2) Configure environment

Create a .env.local at the project root if needed:
```bash
# Example (optional if you keep the hardcoded BASE_URL in lib/api.ts)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api
```
If you add NEXT_PUBLIC_API_BASE_URL, adjust lib/api.ts to read from it.

3) Run the development server
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

## Build for Production

```bash
pnpm build
pnpm start
# or with npm
npm run build
npm run start
# or yarn
yarn build
yarn start
```

- By default, Next.js serves on http://localhost:3000.
- Ensure your API is reachable from the production environment.

## Project Structure

- components/pokemon-list.tsx
  - Main UI: search bar, grid, infinite scroll, load more
  - Disables infinite scroll while searching
- lib/api.ts
  - fetchPokemonPage(limit, offset): paginated list with localStorage cache
  - fetchSinglePokemon(nameOrId): single Pokémon (no cache)
- components/pokemon-card.tsx
  - Card UI for a single Pokémon
- lib/types.ts
  - Type definitions for Pokemon

## API Expectations

- GET /api/pokemon
  - Query: limit (number), offset (number)
  - Returns either:
    - Array<Pokemon> or
    - { data: Array<Pokemon> }
- GET /api/pokemon/:nameOrId
  - Case-insensitive names recommended (client normalizes to lowercase)
  - Returns either:
    - Pokemon or
    - { data: Pokemon }
  - 404 when not found

Adjust parsing in lib/api.ts if your API shape differs.

## LocalStorage Caching

- Key format: pokemon_page_cache_{offset}_{limit}
- Only paginated pages are cached.
- Search results are fetched live to avoid partial/incomplete matches from cache.

To clear cache manually:
- Open devtools Application > Local Storage and remove keys starting with pokemon_page_cache_.
- Or clear all site data.

## Common Tasks

- Change page size: update PAGE_SIZE in components/pokemon-list.tsx.
- Change API base URL: edit BASE_URL in lib/api.ts or use NEXT_PUBLIC_API_BASE_URL and read it in code.
- Enable partial match search: add backend endpoint /api/pokemon?search=term and modify fetch to use it in “search mode” with pagination.

## Troubleshooting

- I type a name and still see all Pokémon
  - Ensure API supports that name (client lowercases input).
  - The app disables infinite scroll when search is non-empty; verify your backend returns 404 for unknown names.
- CORS errors
  - Configure CORS on your Laravel API to allow http://localhost:3000.
- Nothing loads / “Failed to load Pokémon”
  - Confirm the API endpoints are up.
  - Check your BASE_URL and network tab for failing requests.
- Cache not updating
  - localStorage is only used for paginated pages; search is always live.
  - Clear localStorage if you changed API data.

## Scripts

- dev: start development server with HMR
- build: production build
- start: run production server
- lint (if configured): run linter
- type-check (if configured): run TypeScript

Example with pnpm:
```bash
pnpm dev
pnpm build
pnpm start
```

## Tech Stack

- Next.js (App Router compatible)
- React 18
- TypeScript
- Tailwind (assumed by class names; adjust if different)
- LocalStorage caching
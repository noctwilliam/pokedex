# Pokémon Browser Monorepo (Next.js + Laravel PokéAPI Proxy)

This repository contains both:
- Backend: Laravel-based proxy to PokéAPI (https://pokeapi.co), with consolidated Pokémon list/detail endpoints.
- Frontend: Next.js app to browse/search Pokémon with infinite scroll, localStorage caching, and accessible UI.

This README centralizes setup, development, build, and troubleshooting for both apps, so you can get the full system running end-to-end quickly.

## Prerequisites

Backend (Laravel):
- PHP 8.1+ (tested with PHP 8.4.13)
- Composer
- Git
- cURL enabled in PHP
- OpenSSL CA certs available (see SSL note)

Frontend (Next.js):
- Node.js 18+ (recommended 20+)
- pnpm, npm, or yarn

General:
- Windows PowerShell or any POSIX shell (macOS/Linux)

## Repository Structure

- backend/ — Laravel PokéAPI Proxy
  - routes/api.php
  - app/Http/Controllers/Api/PokemonController.php
  - config/services.php
- frontend/ — Next.js Pokémon Browser
  - components/
  - lib/
  - app/ or pages/
- README.md — this file

If your repo uses different folder names, adjust paths accordingly in commands below.

## Quick Start (Full System)

1) Backend: install and run API
```bash
cd backend
composer install
# copy env
cp .env.example .env   # PowerShell: Copy-Item ".env.example" ".env"
php artisan key:generate

# Configure PokéAPI base URL (optional; defaults provided)
# In .env:
# POKEAPI_BASE_URL="https://pokeapi.co/api/v2"
# POKEAPI_TIMEOUT=10

# Clear caches to ensure routes/config are loaded
php artisan optimize:clear
php artisan config:clear
php artisan route:clear

# Start Laravel dev server on 127.0.0.1:8080
php artisan serve --host=127.0.0.1 --port=8080
```

2) Frontend: install and run Next.js
Open a new terminal:
```bash
cd frontend
pnpm install    # or: npm install / yarn
# Optional: create .env.local if API host differs
# echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api" > .env.local

pnpm dev        # or: npm run dev / yarn dev
```

3) Open the app
- Frontend: http://localhost:3000
- Backend API base: http://127.0.0.1:8080/api
  - GET /api/pokemon?limit=24&offset=0
  - GET /api/pokemon/:nameOrId

## Backend (Laravel) Details

### Environment

Edit backend/.env:
```ini
POKEAPI_BASE_URL="https://pokeapi.co/api/v2"
POKEAPI_TIMEOUT=10
```

Ensure config/services.php reads:
```php
'pokeapi' => [
    'base_url' => env('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
    'timeout' => env('POKEAPI_TIMEOUT', 10),
],
```

RouteServiceProvider must be present and registered:
- app/Providers/RouteServiceProvider.php should include:
```php
Route::middleware('api')
    ->prefix('api')
    ->group(base_path('routes/api.php'));
```
- config/app.php has App\Providers\RouteServiceProvider::class in providers.

After route or provider changes:
```bash
php artisan optimize:clear
php artisan route:clear
php artisan route:list
```

### Running the API

```bash
php artisan serve --host=127.0.0.1 --port=8080
```

Endpoints:
- GET /api/pokemon?limit={n}&offset={n}
- GET /api/pokemon/{nameOrId}
- GET /api/pokemon/{nameOrId}/species (original endpoint if present)

### SSL Troubleshooting (cURL error 60)

Preferred fix (php.ini):
- Download latest cacert.pem from https://curl.se/ca/cacert.pem
- Set in php.ini:
```ini
curl.cainfo = "C:\php\extras\ssl\cacert.pem"
openssl.cafile = "C:\php\extras\ssl\cacert.pem"
# or Linux/macOS paths
```
Restart the Laravel dev server.

Temporary dev-only workaround:
Add `withOptions(['verify' => false])` to Http client calls in the controller.

## Frontend (Next.js) Details

### Environment

By default, lib/api.ts may use a hardcoded BASE_URL. To make it configurable:
- Create frontend/.env.local:
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api
```
- Update lib/api.ts to read from `process.env.NEXT_PUBLIC_API_BASE_URL`.

### Development

```bash
pnpm dev
# or npm run dev / yarn dev
```
Open http://localhost:3000

### Production

```bash
pnpm build && pnpm start
# or npm run build && npm run start / yarn build && yarn start
```

Ensure the API is reachable from your production deployment. Configure CORS on Laravel if serving the frontend from a different origin.

### Features

- Infinite scroll with “Load more” fallback
- Search by name/ID (lowercased)
- LocalStorage caching for paginated pages
- Abortable fetches, sticky search, accessible UI

Key files:
- components/pokemon-list.tsx — grid, pagination, search behavior
- components/pokemon-card.tsx — card UI
- lib/api.ts — fetch functions
- lib/types.ts — TypeScript types

## CORS Configuration (Laravel)

If frontend runs at http://localhost:3000, configure CORS in backend/config/cors.php:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```
Then:
```bash
php artisan optimize:clear
```

## Common Workflows

- Change page size: edit PAGE_SIZE in frontend/components/pokemon-list.tsx
- Change API base: set NEXT_PUBLIC_API_BASE_URL or edit frontend/lib/api.ts
- Add backend search endpoint: support /api/pokemon?search=term and wire up frontend to use it when search is non-empty

## Troubleshooting

Backend 404 for /api/pokemon:
- Ensure routes in backend/routes/api.php
- RouteServiceProvider maps API group with prefix('api')
- Correct controller namespace and use statements
- Clear caches and check `php artisan route:list`

cURL SSL error:
- Configure cacert.pem in php.ini; restart server
- Dev-only: `verify => false` in Http client

Nothing loads in frontend:
- Confirm API is up at http://127.0.0.1:8080/api
- Check frontend env/base URL and browser network tab

CORS errors:
- Configure backend CORS to allow http://localhost:3000
- Clear Laravel caches

Cache not updating:
- Only paginated pages use localStorage
- Clear localStorage keys starting with `pokemon_page_cache_`

## Scripts

Backend:
- Serve: `php artisan serve --host=127.0.0.1 --port=8080`
- Clear caches: `php artisan optimize:clear`
- Routes: `php artisan route:list`

Frontend (pnpm shown; use npm/yarn equivalents):
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`

## Contributing

- Use Prettier (print width 80) and follow TypeScript/PSR-12 where applicable.
- Keep API response shapes stable or bump frontend parsing accordingly.
- Update this README when changing ports, env variables, or endpoint contracts.
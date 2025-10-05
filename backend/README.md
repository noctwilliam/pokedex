# Laravel PokéAPI Proxy

This project provides a simple Laravel-based API to fetch and transform data from the external PokéAPI (https://pokeapi.co). It fetches a list of Pokémon, then retrieves detailed information for each, merging them into a structured JSON response.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **PHP:** Version 8.1 or higher (PHP 8.4.13 is used in the provided context).
*   **Composer:** The PHP dependency manager.
*   **Node.js & npm (Optional):** If you plan to work with frontend assets, though not strictly required for this API backend.
*   **Git:** For cloning the repository.

## Setup Instructions (PowerShell)

Follow these steps to get the API up and running on your local machine.

1.  **Clone the repository:**

    ```powershell
    git clone <your-repository-url> pokemon-api-proxy
    cd pokemon-api-proxy
    ```

2.  **Install Composer dependencies:**

    ```powershell
    composer install
    ```

3.  **Create your environment file:**
    This copies the example environment file, which you'll configure next.

    ```powershell
    Copy-Item ".env.example" ".env"
    ```

4.  **Generate an application key:**
    This key is crucial for Laravel's security features.

    ```powershell
    php artisan key:generate
    ```

5.  **Configure PokéAPI Base URL:**
    Open the `.env` file you just created (e.g., in a text editor like VS Code or Notepad).
    Ensure the `POKEAPI_BASE_URL` is correctly set, along with an optional timeout.

    ```ini
    # .env
    POKEAPI_BASE_URL="https://pokeapi.co/api/v2"
    POKEAPI_TIMEOUT=10
    ```

    Also, check `config/services.php` to ensure the `pokeapi` configuration matches:

    ```php
    // config/services.php
    'pokeapi' => [
        'base_url' => env('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
        'timeout' => env('POKEAPI_TIMEOUT', 10),
    ],
    ```

6.  **Ensure `RouteServiceProvider` is present and registered:**
    Verify that `app/Providers/RouteServiceProvider.php` exists and contains the API route mapping. If it's missing (as might happen in some minimal Laravel installations), you'll need to create it with the standard Laravel contents that define how `routes/api.php` is loaded.

    Also, check `config/app.php` within the `'providers'` array to ensure `App\Providers\RouteServiceProvider::class` is listed.

7.  **Clear Laravel caches:**
    This ensures that all configuration, routes, and views are reloaded properly.

    ```powershell
    php artisan optimize:clear
    php artisan config:clear
    php artisan route:clear
    ```

## Running the Application (PowerShell)

1.  **Start the Laravel development server:**

    ```powershell
    php artisan serve --host=127.0.0.1 --port=8080
    ```
    This will start the server, typically accessible at `http://127.0.0.1:8080`.

2.  **Access the API endpoints:**

    *   **List Pokémon:**
        `GET http://127.0.0.1:8080/api/pokemon`
        (Optional query parameters: `limit` and `offset`, e.g., `http://127.0.0.1:8080/api/pokemon?limit=10&offset=0`)

    *   **Get Single Pokémon Details:**
        `GET http://127.0.0.1:8080/api/pokemon/{nameOrId}`
        (e.g., `http://127.0.0.1:8080/api/pokemon/pikachu` or `http://127.0.0.1:8080/api/pokemon/25`)

    *   **Get Single Pokémon Species Details (original endpoint, not modified to specs):**
        `GET http://127.0.0.1:8080/api/pokemon/{nameOrId}/species`
        (e.g., `http://127.0.0.1:8080/api/pokemon/pikachu/species`)

## Troubleshooting

### 1. "404 Not Found" for API Routes

If you're getting an HTML "404 Not Found" page when accessing `/api/pokemon`, it means Laravel isn't recognizing your API routes.

*   **Check `routes/api.php`:** Ensure your API routes are defined in `routes/api.php` and not `routes/web.php`.
*   **Verify RouteServiceProvider:**
    *   Make sure `app/Providers/RouteServiceProvider.php` exists and correctly defines the API route group:
        ```php
        // app/Providers/RouteServiceProvider.php
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));
        ```
    *   Ensure `App\Providers\RouteServiceProvider::class` is present in the `providers` array in `config/app.php`.
*   **Controller Namespace:** Double-check that the namespace in your `PokemonController.php` (e.g., `namespace App\Http\Controllers\Api;`) matches its file path (`app/Http/Controllers/Api/PokemonController.php`), and that the `use` statement in `routes/api.php` also matches (`use App\Http\Controllers\Api\PokemonController;`).
*   **Clear Caches:** Always run `php artisan optimize:clear` and `php artisan route:clear` after making changes to routes or providers.
*   **List Routes:** Use `php artisan route:list` to see all registered routes. You should see entries for `/api/pokemon`, `/api/pokemon/{nameOrId}`, etc. If not, the routes are still not loading.

### 2. "cURL error 60: SSL certificate problem"

This error indicates that PHP's cURL extension cannot verify the SSL certificate of `pokeapi.co`. This is common in local development environments.

**Recommended Fix (PHP Configuration):**

1.  **Download `cacert.pem`:** Get the latest CA certificates bundle from the cURL website:
    *   Go to: <https://curl.se/ca/cacert.pem>
    *   Save this file to a location on your system, for example, `C:\php\extras\ssl\cacert.pem` or inside your project like `storage/certs/cacert.pem`.

2.  **Configure `php.ini`:**
    *   Find your active `php.ini` file by running `php --ini` in PowerShell. It will show you the path to the loaded configuration file.
    *   Open `php.ini` in a text editor.
    *   Search for `curl.cainfo` and `openssl.cafile`. Uncomment these lines (remove the `;` at the beginning) and set their values to the absolute path of your `cacert.pem` file.
        ```ini
        ; For Windows (example path)
        curl.cainfo = "C:\php\extras\ssl\cacert.pem"
        openssl.cafile = "C:\php\extras\ssl\cacert.pem"

        ; For Linux/macOS (example path)
        ; curl.cainfo = "/etc/ssl/certs/cacert.pem"
        ; openssl.cafile = "/etc/ssl/certs/cacert.pem"
        ```
    *   Save `php.ini`.

3.  **Restart your PHP/Laravel server:** It's crucial to restart `php artisan serve` for the `php.ini` changes to take effect.

**Temporary Development Fix (Not for Production):**

If you cannot modify `php.ini`, you can disable SSL verification directly in your HTTP calls for development purposes. **Do not use this in production as it bypasses critical security checks.**

In `app/Http/Controllers/Api/PokemonController.php`, modify your `Http::get` calls:

```php
// In listPokemon, getPokemon, getSpecies methods
$response = Http::withOptions(['verify' => false]) // <-- Add this line
    ->timeout($this->timeout)
    ->acceptJson()
    ->get("{$this->baseUrl}/pokemon", [
        'limit' => $limit,
        'offset' => $offset,
    ]);
```

### 3. Other General Issues

*   **Composer Dependencies:** If you missed `composer install`, many classes won't be found.
*   **`.env` not set up:** Ensure you've copied `.env.example` to `.env` and configured it.
*   **`APP_KEY` not generated:** Run `php artisan key:generate` if you haven't.
*   **Server not running:** Ensure `php artisan serve` is actively running in your terminal.
*   **PHP Version:** Verify your PHP version meets the Laravel project's requirements.

If you encounter persistent issues, check your `laravel.log` file in the `storage/logs` directory for more detailed error messages.

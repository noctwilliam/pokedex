<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class PokemonController extends Controller
{
    protected string $baseUrl;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.pokeapi.base_url');
        $this->timeout = (int) config('services.pokeapi.timeout', 10);
    }

    // GET /api/pokemon?limit=20&offset=0
    public function listPokemon(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 20);
        $offset = (int) $request->query('offset', 0);

        $response = Http::timeout($this->timeout)
            ->acceptJson()
            ->get("{$this->baseUrl}/pokemon", [
                'limit' => $limit,
                'offset' => $offset,
            ]);

        if ($response->failed()) {
            return response()->json([
                'error' => 'Failed to fetch data from PokéAPI.',
                'status' => $response->status(),
            ], 502);
        }
        return response()->json($response->json());
    }

    // GET /api/pokemon/{nameOrId}
    public function getPokemon(string $nameOrId): JsonResponse
    {
        $nameOrId = Str::lower($nameOrId);

        $response = Http::timeout($this->timeout)
            ->acceptJson()
            ->get("{$this->baseUrl}/pokemon/{$nameOrId}");

        if ($response->notFound()) {
            return response()->json([
                'error' => 'Pokemon not found.',
            ], 404);
        }

        if ($response->failed()) {
            return response()->json([
                'error' => 'Failed to fetch data from PokéAPI.',
                'status' => $response->status(),
            ], 502);
        }

        return response()->json($response->json());
    }

    // Example: GET /api/pokemon/{nameOrId}/species
    public function getSpecies(string $nameOrId): JsonResponse
    {
        $nameOrId = Str::lower($nameOrId);

        $response = Http::timeout($this->timeout)
            ->acceptJson()
            ->get("{$this->baseUrl}/pokemon-species/{$nameOrId}");

        if ($response->notFound()) {
            return response()->json([
                'error' => 'Pokemon species not found.',
            ], 404);
        }

        if ($response->failed()) {
            return response()->json([
                'error' => 'Failed to fetch data from PokéAPI.',
                'status' => $response->status(),
            ], 502);
        }

        return response()->json($response->json());
    }
}

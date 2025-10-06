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

    // take value from config
    public function __construct()
    {
        $this->baseUrl = config('services.pokeapi.base_url');
        $this->timeout = (int) config('services.pokeapi.timeout', 10);
    }

    private function extractPokemonData(array $pokemonDetail): array
    {
        $name = $pokemonDetail['name'] ?? null;
        $image = $pokemonDetail['sprites']['other']['official-artwork']['front_default'] ?? null;
        $types = array_map(fn($typeInfo) => $typeInfo['type']['name'], $pokemonDetail['types'] ?? []);
        $height = $pokemonDetail['height'] ?? null;
        $weight = $pokemonDetail['weight'] ?? null;

        return [
            "name" => $name,
            "image" => $image,
            "types" => $types,
            "height" => $height,
            "weight" => $weight,
        ];
    }

    /**
     * GET /api/pokemon?limit=20&offset=0
     * Fetches a list of Pokémon, then retrieves details for each,
     * merging them into a single, structured JSON response.
     */
    public function listPokemon(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 20);
        $offset = (int) $request->query('offset', 0);

        $limit = max(1, min(100, $limit));
        $offset = max(0, $offset);

        $listResponse = Http::timeout($this->timeout)
            ->acceptJson()
            ->get("{$this->baseUrl}/pokemon", [
                'limit' => $limit,
                'offset' => $offset,
            ]);

        if ($listResponse->failed()) {
            return response()->json([
                'error' => 'Failed to fetch Pokémon list from PokéAPI.',
                'status' => $listResponse->status(),
            ], 502);
        }

        $pokemonReferences = $listResponse->json('results', []);
        $mergedPokemonData = [];

        foreach ($pokemonReferences as $pokemonRef) {
            $detailResponse = Http::timeout($this->timeout)
                ->acceptJson()
                ->get($pokemonRef['url']);

            if ($detailResponse->successful()) {
                $mergedPokemonData[] = $this->extractPokemonData($detailResponse->json());
            }
        }

        return response()->json($mergedPokemonData);
    }

    /**
     * GET /api/pokemon/{nameOrId}
     * Fetches details for a single Pokémon by name or ID.
     */
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

        return response()->json($this->extractPokemonData($response->json()));
    }

    /**
     * GET /api/pokemon/{nameOrId}/species
     * Fetches species details for a single Pokémon by name or ID.
     */
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

// lib/api.ts
import { Pokemon } from "./types";

// Updated BASE_URL as per your API documentation
const BASE_URL = "http://127.0.0.1:8080/api";

/**
 * Fetch a page of Pokemon from Laravel API using 'limit' and 'offset'.
 * Used when the search bar is empty.
 */
export async function fetchPokemonPage(opts: {
	limit: number;
	offset: number;
	signal?: AbortSignal;
}): Promise<Pokemon[]> {
	const { limit, offset, signal } = opts;
	const url = new URL(`${BASE_URL}/pokemon`);

	url.searchParams.set("limit", String(limit));
	url.searchParams.set("offset", String(offset));

	const res = await fetch(url.toString(), {
		method: "GET",
		cache: "no-store",
		signal,
	});

	if (!res.ok) {
		// Treat 404 as no more data for pagination
		if (res.status === 404) return [];
		throw new Error(`Failed to fetch paginated Pokémon: ${res.status}`);
	}
	const data = (await res.json()) as Pokemon[] | { data: Pokemon[] };
	return Array.isArray(data) ? data : data.data ?? [];
}

/**
 * Fetch a single Pokémon by name or ID.
 * Used when a search term is provided.
 * @param nameOrId The name or ID of the Pokémon to fetch.
 */
export async function fetchSinglePokemon(
	nameOrId: string,
	signal?: AbortSignal
): Promise<Pokemon | null> {
	if (!nameOrId.trim()) return null; // Don't fetch for empty string

	const url = `${BASE_URL}/pokemon/${encodeURIComponent(nameOrId)}`;
	const res = await fetch(url, {
		method: "GET",
		cache: "no-store",
		signal,
	});

	if (res.status === 404) {
		return null; // Pokémon not found
	}
	if (!res.ok) {
		throw new Error(`Failed to fetch single Pokémon: ${res.status}`);
	}
	const data = (await res.json()) as Pokemon | { data: Pokemon };
	return (data as { data: Pokemon }).data || (data as Pokemon);
}

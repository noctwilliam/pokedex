// lib/api.ts
import { Pokemon } from "./types";

const BASE_URL = "http://127.0.0.1:8080/api";

const getPokemonPageCacheKey = (offset: number, limit: number) =>
	`pokemon_page_cache_${offset}_${limit}`;

/**
 * Fetch a page of Pokemon from Laravel API using 'limit' and 'offset',
 * with localStorage caching.
 * Used when the search bar is empty.
 */
export async function fetchPokemonPage(opts: {
	limit: number;
	offset: number;
	signal?: AbortSignal;
}): Promise<Pokemon[]> {
	const { limit, offset, signal } = opts;

	// 1. Try to load from localStorage cache
	if (typeof window !== "undefined") {
		try {
			const cachedData = localStorage.getItem(
				getPokemonPageCacheKey(offset, limit)
			);
			if (cachedData) {
				const parsedData = JSON.parse(cachedData) as
					| Pokemon[]
					| { data: Pokemon[] };
				console.log(`Cache hit for page (offset: ${offset}, limit: ${limit})`);
				return Array.isArray(parsedData) ? parsedData : parsedData.data ?? [];
			}
		} catch (e) {
			console.error("Error parsing cached data from localStorage:", e);
			// If cached data is corrupted, fall through to fetch from API
		}
	}

	// 2. If not in cache, fetch from the API
	const url = new URL(`${BASE_URL}/pokemon`);
	url.searchParams.set("limit", String(limit));
	url.searchParams.set("offset", String(offset));

	const res = await fetch(url.toString(), {
		method: "GET",
		cache: "no-store", // We manage caching manually
		signal,
	});

	if (!res.ok) {
		if (res.status === 404) return []; // Treat 404 as no more data for pagination
		throw new Error(`Failed to fetch paginated Pokémon: ${res.status}`);
	}

	const data = (await res.json()) as Pokemon[] | { data: Pokemon[] };
	const items = Array.isArray(data) ? data : data.data ?? [];

	// 3. Store fetched data in localStorage cache
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem(
				getPokemonPageCacheKey(offset, limit),
				JSON.stringify(items)
			);
			console.log(`Cache set for page (offset: ${offset}, limit: ${limit})`);
		} catch (e) {
			console.warn("Could not save to localStorage (possibly full):", e);
			// Continue without caching if localStorage is full or there's another error
		}
	}

	return items;
}

/**
 * Fetch a single Pokémon by name or ID.
 * This function will continue to directly hit the API for real-time search results.
 * Caching individual search results could be implemented, but given the dynamic
 * nature of search, directly querying the API is often more reliable.
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

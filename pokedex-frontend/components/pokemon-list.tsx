// components/pokemon-list.tsx
"use client";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Pokemon } from "@/lib/types";
import { PokemonCard } from "./pokemon-card";
import { fetchPokemonPage, fetchSinglePokemon } from "@/lib/api";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 24;
const IO_ROOT_MARGIN = "200px";

export function PokemonList() {
	// Source of truth for search committed to the API
	const [search, setSearch] = useState("");
	// UI input value (not normalized until commit)
	const [searchInput, setSearchInput] = useState("");
	const [page, setPage] = useState(0);
	const [items, setItems] = useState<Pokemon[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Keep these refs to avoid stale closure usage inside observers
	const loadingRef = useRef(isLoading);
	const hasMoreRef = useRef(hasMore);
	const pageRef = useRef(page);
	const searchRef = useRef(search);

	useEffect(() => {
		loadingRef.current = isLoading;
	}, [isLoading]);

	useEffect(() => {
		hasMoreRef.current = hasMore;
	}, [hasMore]);

	useEffect(() => {
		pageRef.current = page;
	}, [page]);

	useEffect(() => {
		searchRef.current = search;
	}, [search]);

	// Abort any in-flight request when starting a new one or unmounting
	const abortRef = useRef<AbortController | null>(null);
	const abortInFlight = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
	}, []);

	const commitSearch = useCallback((raw: string) => {
		// Normalize for API; keep raw value in field
		const normalized = raw.trim().toLowerCase();
		setSearchInput(raw);
		setSearch(normalized);
		setPage(0);
		// Do NOT clear items immediately to avoid flicker; next load will replace
		// Disable pagination when searching; re-enable on clear
		setHasMore(normalized === "");
		setError(null);
	}, []);

	const load = useCallback(
		async (nextPage: number) => {
			if (loadingRef.current) return;

			setIsLoading(true);
			setError(null);
			abortInFlight();
			const controller = new AbortController();
			abortRef.current = controller;

			try {
				if (searchRef.current) {
					// Search mode: single fetch by name or ID
					const pokemon = await fetchSinglePokemon(
						searchRef.current,
						controller.signal
					);
					setItems(pokemon ? [pokemon] : []);
					setHasMore(false);
					setPage(0);
				} else {
					// Paginated mode
					if (!hasMoreRef.current && nextPage !== 0) {
						return;
					}
					const offset = nextPage * PAGE_SIZE;
					const data = await fetchPokemonPage({
						limit: PAGE_SIZE,
						offset,
						signal: controller.signal,
					});
					setItems((prev) => (nextPage === 0 ? data : [...prev, ...data]));
					setHasMore(data.length === PAGE_SIZE);
					setPage(nextPage);
				}
			} catch (e: unknown) {
				// Ignore AbortErrors; surface the rest
				if (!(e instanceof DOMException && e.name === "AbortError")) {
					console.error("Fetch error:", e);
					setError("Failed to load Pokémon. Please try again.");
					// Keep hasMore as-is to allow retry via button
				}
			} finally {
				setIsLoading(false);
			}
		},
		[abortInFlight]
	);

	// Initial load and whenever committed search changes
	// useLayoutEffect avoids a visible flicker on first paint in some cases
	useLayoutEffect(() => {
		void load(0);
	}, [load, search]);

	// IntersectionObserver for infinite scroll
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		if (typeof window === "undefined") return;

		// Disable when searching
		if (searchRef.current) return;
		if (!("IntersectionObserver" in window)) return;

		const rootEl = el.parentElement ?? null;
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (
					entry.isIntersecting &&
					!loadingRef.current &&
					hasMoreRef.current &&
					!searchRef.current
				) {
					void load(pageRef.current + 1);
				}
			},
			{ root: rootEl, rootMargin: IO_ROOT_MARGIN }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [load, search]); // reattach if search mode toggles

	const onSubmit = useCallback(
		() => commitSearch(searchInput),
		[commitSearch, searchInput]
	);

	const content = useMemo(() => {
		if (!items.length && !isLoading && (search || error)) {
			return (
				<li className="col-span-full">
					<p className="py-10 text-center text-sm text-slate-500">
						{error ? error : "No Pokémon found."}
					</p>
				</li>
			);
		}
		return items.map((p) => (
			<li key={`${p.name}-${p.image}`}>
				<PokemonCard pokemon={p} />
			</li>
		));
	}, [items, isLoading, search, error]);

	return (
		<div className="flex h-full flex-col">
			{/* Sticky search bar inside scroll container */}
			<div className="sticky top-0 z-30">
				<div className="bg-[var(--page-bg)]/80 px-2 py-2 backdrop-blur">
					<div className="flex items-center gap-2">
						<label htmlFor="pokemon-search" className="sr-only">
							Search Pokémon by name or ID
						</label>
						<input
							id="pokemon-search"
							className="inline-flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-hidden ring-0 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
							placeholder="Pokemon Name"
							value={searchInput}
							autoComplete="off"
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") onSubmit();
							}}
						/>
						<Button onClick={onSubmit} disabled={isLoading}>
							{isLoading && search ? "Searching..." : "Search"}
						</Button>
						{search && (
							<Button
								variant="secondary"
								onClick={() => commitSearch("")}
								disabled={isLoading}
							>
								Clear
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Scrollable list */}
			<div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
				<ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{content}
				</ul>

				{/* Sentinel for infinite scroll - only appears if not searching */}
				{!search && <div ref={sentinelRef} className="h-10 w-full" />}

				{/* Load more fallback */}
				{!search && hasMore && (
					<div className="mt-4 flex justify-center">
						<Button
							variant="secondary"
							disabled={isLoading}
							onClick={() => void load(page + 1)}
						>
							{isLoading ? "Loading..." : "Load more"}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

import { PokemonList } from "@/components/pokemon-list";
import { BannerAndCarousel } from "@/components/banner-and-carousel";

/**
 * Layout notes:
 * - Full-height page grid.
 * - Left/right columns are sticky; middle column scrolls.
 */
export default function Page() {
	return (
		<main className="mx-auto max-w-7xl px-4 py-6">
			{/* Top: Carousel + two banners */}
			<BannerAndCarousel />

			{/* Three-column below */}
			<section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_260px]">
				{/* Left static image - sticky */}
				<div className="hidden lg:block">
					<div className="sticky top-6">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="https://placehold.co/260x600/eaf2fa/111?text=Static+Image"
							alt="Left Static"
							className="h-[calc(100vh-120px)] w-full rounded-xl border border-slate-200 object-cover"
						/>
					</div>
				</div>

				{/* Middle: search + scrollable list */}
				<div className="min-h-[60vh] rounded-xl border border-slate-200 bg-white">
					{/* Dedicated scroll container with sticky search bar inside */}
					<div className="flex h-[calc(100vh-140px)] flex-col">
						<PokemonList />
					</div>
				</div>

				{/* Right static image - sticky */}
				<div className="hidden lg:block">
					<div className="sticky top-6">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="https://placehold.co/260x600/eaf2fa/111?text=Static+Image"
							alt="Right Static"
							className="h-[calc(100vh-120px)] w-full rounded-xl border border-slate-200 object-cover"
						/>
					</div>
				</div>
			</section>
		</main>
	);
}

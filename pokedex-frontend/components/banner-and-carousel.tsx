"use client";

import Autoplay from "embla-carousel-autoplay";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";

const slides = [
	"https://placehold.co/1200x300/ffe4e6/111?text=Carousel+Banner+1",
	"https://placehold.co/1200x300/ffeccc/111?text=Carousel+Banner+2",
	"https://placehold.co/1200x300/e3f2ff/111?text=Carousel+Banner+3",
];

export function BannerAndCarousel() {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
			<div className="rounded-lg border border-slate-200 bg-white p-2">
				<Carousel
					plugins={[Autoplay({ delay: 3000 })]}
					opts={{ loop: true, align: "start" }}
				>
					<CarouselContent>
						{slides.map((src) => (
							<CarouselItem key={src}>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={src}
									alt="Banner"
									className="h-56 w-full rounded-md object-cover md:h-64"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			<div className="hidden flex-col gap-4 lg:flex">
				{/* Two static banners on the right */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="https://placehold.co/300x150/fef2f2/111?text=Static+Banner"
					alt="Static Banner"
					className="h-[150px] w-full rounded-lg border border-slate-200 object-cover"
				/>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src="https://placehold.co/300x150/fef2f2/111?text=Static+Banner"
					alt="Static Banner"
					className="h-[150px] w-full rounded-lg border border-slate-200 object-cover"
				/>
			</div>
		</div>
	);
}

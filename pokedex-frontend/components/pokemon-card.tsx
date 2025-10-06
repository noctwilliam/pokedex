"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pokemon } from "@/lib/types";

type Props = { pokemon: Pokemon };

export function PokemonCard({ pokemon }: Props) {
	return (
		<Card className="flex items-center gap-4 p-4">
			<div className="size-14 shrink-0 rounded-full bg-white/80 ring-1 ring-black/5">
				<Image
					src={pokemon.image}
					alt={pokemon.name}
					width={56}
					height={56}
					className="size-14 object-contain"
				/>
			</div>

			<div className="min-w-0">
				<div className="font-medium capitalize">{pokemon.name}</div>
				<div className="mt-1 flex flex-wrap gap-2">
					{pokemon.types.map((t) => (
						<Badge
							key={t}
							variant="secondary"
							className="capitalize bg-slate-100 text-slate-700"
						>
							{t}
						</Badge>
					))}
				</div>
			</div>
		</Card>
	);
}

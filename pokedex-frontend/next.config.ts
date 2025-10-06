import type { NextConfig } from "next";

const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "raw.githubusercontent.com",
				port: "",
				pathname: "/PokeAPI/sprites/**",
			},
		],
	},
};

export default nextConfig;

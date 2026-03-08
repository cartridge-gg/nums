import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";
import path from "node:path";

// __dirname resolves to remotion CLI dir, so use process.cwd() instead
const ROOT = process.cwd();

Config.overrideWebpackConfig((currentConfiguration) => {
	const withTailwind = enableTailwind(currentConfiguration);

	return {
		...withTailwind,
		resolve: {
			...withTailwind.resolve,
			alias: {
				...withTailwind.resolve?.alias,
				// Stub out audio context so client components render silently
				"@/context/audio": path.resolve(ROOT, "src/providers/audio.tsx"),
				"@video": path.resolve(ROOT, "src"),
				"@": path.resolve(ROOT, "../client/src"),
			},
		},
	};
});

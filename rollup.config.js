import terser from "@rollup/plugin-terser";

export default [
	{
		input: "index.js",
		output: {
			file: "dist/index.js",
			format: "iife",
			name: "kodmobi",
			exports: "named",
			sourcemap: true,
		},
		plugins: [terser()],
	},
	{
		input: "index.js",
		output: {
			file: "dist/index.mjs",
			format: "es",
			sourcemap: true,
		},
		plugins: [terser()],
	},
];

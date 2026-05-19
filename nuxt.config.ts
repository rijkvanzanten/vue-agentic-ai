// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	modules: ["@pinia/nuxt", "@nuxt/ui"],

	devtools: {
		enabled: true,
	},

	css: ["~/assets/css/main.css"],

	compatibilityDate: "2025-01-15",

	vite: {
		optimizeDeps: {
			include: [
				'@ai-sdk/vue',
				'ai',
				'md4x/wasm',
				'zod',
				'zod/v4/core',
			]
		}
	}
});

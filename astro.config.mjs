import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    server: {
        port: 4321,
    },
    output: 'server', // Enable SSR for API endpoints
    adapter: undefined // Using Bun's built-in server capabilities locally. For deployment we might need an adapter, but for local 'astro dev' it's fine.
});

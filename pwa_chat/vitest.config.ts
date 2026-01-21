import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './test/setup.ts',
        coverage: {
            reporter: ['text', 'lcov'],
        },
    },
    plugins: [tsconfigPaths()],
});
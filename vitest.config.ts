import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'src/features/sorting/algorithms/**',
        'src/features/traversals/tree/algorithms/**',
        'src/features/traversals/graph/algorithms/**',
        'src/features/algorithms/linked-list/algorithms/**',
      ],
      // CI fails if coverage drops below these floors.
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85,
      },
    },
  },
});

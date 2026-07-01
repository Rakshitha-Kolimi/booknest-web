import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./apps/web/src/setupTests.ts'],
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    isolate: false, // Enable parallel test execution across monorepo packages for faster CI/CD; use VITEST_ISOLATE=true to run a single package's tests in isolation.
  },
})

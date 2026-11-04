import { defineConfig, devices } from '@playwright/test';

/**
 * Version B's own browser checks: screenshots (docs/screenshots/version-b) and B-only checks.
 * Behaviour parity is verified with version-a's e2e suite pointed at B (docs/PLAN-B.md §6).
 * Runs against `php artisan serve` on :8000 (started automatically unless E2E_BASE_URL is set).
 */
const PORT = 8000;
const externalBaseURL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  // `php artisan serve` handles one request at a time: parallel workers slow every page down and make
  // captures timing-dependent (e.g. fonts arriving late). Screenshots are taken one after another.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: externalBaseURL ?? `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'it-IT',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `php artisan serve --host=127.0.0.1 --port=${PORT}`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});

import { defineConfig, devices } from "@playwright/test";
import z from "zod";

/*
 * Validating environment variables with zod
 * https://jfranciscosousa.com/blog/validating-environment-variables-with-zod/
 */
const _envSchema = z.object({
  CI: z.boolean().optional().default(false),
});
const _env = _envSchema.parse(process.env);
const _webServerPort = 4999;
const _webServerUrl = `http://127.0.0.1:${_webServerPort}`;
// filepaths are relative to the playwright config
const _testsDir = "./tests";
const _testsOutputBaseDir = `${_testsDir}/test-results`;
const _testReportersOutputBaseDir = `${_testsOutputBaseDir}/reporters`;
// monocart reporter dirs are NOT relative to the playwright config
const _monocartReporterOutputDir = `./tests/monocart/test-results/reporters/monocart`;

export default defineConfig({
  testDir: _testsDir,
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: `${_testsOutputBaseDir}/test-results`,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: _env.CI,
  /* Retry on CI only */
  retries: _env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // eslint-disable-next-line no-undefined
  workers: _env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "html",
      { open: "never", outputFolder: `${_testReportersOutputBaseDir}/html` },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: _webServerUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          // args: ["--disable-gpu"],
          // ignoreDefaultArgs: ["--hide-scrollbars"],
        },
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: `npx ng serve --port ${_webServerPort}`,
    url: _webServerUrl,
    reuseExistingServer: !_env.CI,
    stdout: "pipe",
    timeout: 10 * 60 * 1000, // 1 min
  },
});

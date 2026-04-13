import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Config — Produto Pedido (runner local)
 *
 * Configuração standalone para desenvolvedores que trabalham
 * exclusivamente no produto Pedido, sem precisar do monorepo.
 *
 * Pré-requisito: servidor rodando em http://localhost:5179
 * Execute com: npx playwright test --config=e2e/playwright.config.ts
 *
 * Para rodar via monorepo (CI/QA), use o projeto 'pedido' em
 * playwright.config.ts na raiz do repositório.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:5179',
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  outputDir: '../../../test-results',

  // NÃO inicia servidor automaticamente — rode `npm run dev` antes
  webServer: undefined,
})

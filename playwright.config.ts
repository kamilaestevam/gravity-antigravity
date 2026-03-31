import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Config — Gravity E2E
 *
 * Projetos:
 *  - bid-frete:       frontend 5181 → backend 8023
 *  - simula-custo:    frontend 5180 → backend 8020
 *  - nf-importacao:   frontend 5183 → backend 8028
 *
 * Backends do Configurador (8005) devem estar rodando para testes de catálogo.
 */
export default defineConfig({
  testDir: './testes/testes-e2e',
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  outputDir: 'test-results',

  projects: [
    {
      name: 'bid-frete',
      testDir: './testes/testes-e2e/bid-frete',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5181',
      },
    },
    {
      name: 'simula-custo',
      testDir: './testes/testes-e2e/simula-custo',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5180',
      },
    },
    {
      name: 'bid-cambio',
      testDir: './testes/testes-e2e/bid-cambio',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5002',
      },
    },
    {
      name: 'configurador',
      testDir: './testes/testes-e2e/configurador',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5010',
      },
    },
    {
      name: 'i18n',
      testDir: './testes/testes-e2e/i18n',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5010',
      },
    },
    {
      name: 'lpco',
      testDir: './testes/testes-e2e/lpco',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5182',
      },
    },
    {
      name: 'nf-importacao',
      testDir: './testes/testes-e2e/nf-importacao',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5183',
      },
    },
  ],
})

import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Config — Gravity E2E
 *
 * Estrutura: 16 escopos × N sublocais.
 * Cada escopo é um `project` separado com sua baseURL.
 *
 * Convenção de IDs: TST-E2E-{ESCOPO}-{NNNNNN}
 * Pasta padrão:     testes/testes-e2e/{escopo-kebab}/{sublocal-kebab}/TST-E2E-*.spec.ts
 *
 * Detalhes em:
 *   - documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md
 *   - documentos-tecnicos/testes/regras/01-convencao-ids.md
 *
 * Todo .spec.ts importa de testes/playwright.fixtures.ts em vez de @playwright/test
 * — assim ganha automaticamente screenshot final, captura de erros JS e tracking de requests.
 */
export default defineConfig({
  testDir:        './testes/testes-e2e',
  fullyParallel:  false,
  forbidOnly:     !!process.env.CI,
  retries:        process.env.CI ? 1 : 0,
  workers:        1,

  reporter: [
    ['html', { outputFolder: 'testes/playwright-report', open: 'never' }],
    ['json', { outputFile:   'testes/playwright-report/results.json' }],
    ['list'],
  ],

  timeout:           60_000,
  expect:            { timeout: 10_000 },
  outputDir:         'testes/test-results',

  use: {
    trace:             'retain-on-failure',  // só guarda trace quando falha
    screenshot:        'off',                // fixture global tira o print
    video:             'off',                // sem vídeo (custo de storage)
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // ───── Núcleo / Plataforma ───────────────────────────────────────────────
    {
      name:    'login',
      testDir: './testes/testes-e2e/login',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5000' },
    },
    {
      name:    'configurador',
      testDir: './testes/testes-e2e/configurador',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8000' },
    },
    {
      name:    'admin',
      testDir: './testes/testes-e2e/admin',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8000' },
    },
    {
      name:    'hub',
      testDir: './testes/testes-e2e/hub',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8000' },
    },
    {
      name:    'core',
      testDir: './testes/testes-e2e/core',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8000' },
    },
    {
      name:    'marketplace',
      testDir: './testes/testes-e2e/marketplace',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5001' },
    },
    {
      name:    'tenant',
      testDir: './testes/testes-e2e/tenant',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8000' },
    },
    {
      name:    'dbase',
      testDir: './testes/testes-e2e/dbase',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:8005' },
    },

    // ───── Produtos ──────────────────────────────────────────────────────────
    {
      name:    'pedido',
      testDir: './testes/testes-e2e/pedido',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5179' },
    },
    {
      name:    'nf-importacao',
      testDir: './testes/testes-e2e/nf-importacao',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5183' },
    },
    {
      name:    'lpco',
      testDir: './testes/testes-e2e/lpco',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5182' },
    },
    {
      name:    'bid-frete',
      testDir: './testes/testes-e2e/bid-frete',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5181' },
    },
    {
      name:    'bid-cambio',
      testDir: './testes/testes-e2e/bid-cambio',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5002' },
    },
    {
      name:    'simula-custo',
      testDir: './testes/testes-e2e/simula-custo',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5180' },
    },
    {
      name:    'financeiro-comex',
      testDir: './testes/testes-e2e/financeiro-comex',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5184' },
    },
    {
      name:    'processo',
      testDir: './testes/testes-e2e/processo',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5185' },
    },
  ],
})

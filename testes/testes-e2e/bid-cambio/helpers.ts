import { type Page, expect } from '@playwright/test'

/** ──────────────────────────────────────────────────────────────
 *  BID Cambio — E2E Helpers
 *  ────────────────────────────────────────────────────────────── */

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5002'
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:8025'
export const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? 'gravity-dev-internal-key-2026'
export const TENANT_ID = 'tenant-demo-001'
export const USER_ID = 'user-demo-001'

// --- Interfaces ---

export interface TestParcela {
  id: string
  referencia_processo: string
  status: string
  moeda: string
  valor_a_pagar: number
}

export interface TestCotacao {
  id: string
  moeda: string
  valor: number
  status: string
}

export interface TestCorretora {
  id: string
  razao_social: string
  nome_fantasia: string
  email: string
}

export interface TestBidRequest {
  id: string
  token_publico: string
  corretora_id: string
  status: string
}

// --- Navigation ---

export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
}

export async function waitForElement(page: Page, testId: string, timeout = 10_000): Promise<void> {
  await expect(page.getByTestId(testId)).toBeVisible({ timeout })
}

// --- Wait helpers ---

export async function waitForToast(page: Page, text: string | RegExp): Promise<void> {
  const toast = page.locator('[data-testid="toast"], [role="alert"]').filter({ hasText: text })
  await expect(toast).toBeVisible({ timeout: 8_000 })
}

export async function waitForLoadingToFinish(page: Page): Promise<void> {
  const loader = page.locator('[data-testid="loading"], [role="progressbar"], [data-testid="skeleton"]')
  if (await loader.isVisible().catch(() => false)) {
    await expect(loader).toBeHidden({ timeout: 15_000 })
  }
}

// --- Screenshot ---

export async function screenshotStep(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/bid-cambio/${name.replace(/\s+/g, '-')}.png`,
    fullPage: true,
  })
}

// --- API helpers ---

function defaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': TENANT_ID,
    'x-user-id': USER_ID,
  }
}

export async function apiPost<T>(page: Page, endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await page.request.post(`${API_URL}${endpoint}`, {
    data: body,
    headers: defaultHeaders(),
  })
  expect(response.ok(), `POST ${endpoint} failed: ${response.status()}`).toBe(true)
  return response.json() as Promise<T>
}

export async function apiGet<T>(page: Page, endpoint: string): Promise<T> {
  const response = await page.request.get(`${API_URL}${endpoint}`, {
    headers: defaultHeaders(),
  })
  expect(response.ok(), `GET ${endpoint} failed: ${response.status()}`).toBe(true)
  return response.json() as Promise<T>
}

export async function apiPatch<T>(page: Page, endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await page.request.patch(`${API_URL}${endpoint}`, {
    data: body,
    headers: defaultHeaders(),
  })
  expect(response.ok(), `PATCH ${endpoint} failed: ${response.status()}`).toBe(true)
  return response.json() as Promise<T>
}

export async function apiDelete(page: Page, endpoint: string): Promise<void> {
  const response = await page.request.delete(`${API_URL}${endpoint}`, {
    headers: defaultHeaders(),
  })
  expect(response.ok(), `DELETE ${endpoint} failed: ${response.status()}`).toBe(true)
}

// --- Seed helpers ---

export async function seedCorretora(page: Page, overrides: Partial<{ razao_social: string; email: string }> = {}): Promise<TestCorretora> {
  const ts = Date.now()
  return apiPost<TestCorretora>(page, '/api/v1/bid-cambio/corretoras', {
    razao_social: overrides.razao_social ?? `Corretora Teste ${ts}`,
    nome_fantasia: `CT-${ts}`,
    cnpj: `${String(ts).slice(-14).padStart(14, '0')}`,
    tipo: 'CORRETORA_CAMBIO',
    email: overrides.email ?? `corretora-${ts}@teste.com`,
    telefone: '+5511999999999',
    portal_habilitado: true,
    moedas_operadas: 'USD,EUR',
  })
}

export async function seedCotacao(page: Page, overrides: Partial<{ moeda: string; valor: number }> = {}): Promise<TestCotacao> {
  return apiPost<TestCotacao>(page, '/api/v1/bid-cambio/cotacoes', {
    moeda: overrides.moeda ?? 'USD',
    valor: overrides.valor ?? 50000,
    tipo_operacao: 'IMPORTACAO',
    modalidade: 'PRONTO',
    liquidacao: 'D2',
    referencia_processo: `PROC-E2E-${Date.now()}`,
  })
}

export async function seedDisparo(page: Page, cotacaoId: string, corretoraIds: string[]): Promise<{ bid_requests: TestBidRequest[] }> {
  return apiPost(page, '/api/v1/bid-cambio/bids/disparar', {
    cotacao_id: cotacaoId,
    corretora_ids: corretoraIds,
  })
}

export async function respondViaPotalPublico(page: Page, token: string, taxa: number, spread: number): Promise<void> {
  await apiPost(page, `/api/v1/bid-cambio/portal/public/responder/${token}`, {
    taxa_oferecida: taxa,
    spread,
    validade_minutos: 60,
    liquidacao_proposta: 'D2',
  })
}

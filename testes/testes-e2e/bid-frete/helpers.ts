import { type Page, type APIRequestContext, expect } from '@playwright/test'

/** ──────────────────────────────────────────────────────────────
 *  BID Frete v2 — E2E Helpers
 *  ────────────────────────────────────────────────────────────── */

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5181'
export const API_URL = process.env.E2E_API_URL ?? BASE_URL
export const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? 'gravity-dev-internal-key-2026'
export const TENANT_ID = 'tenant-teste'
export const USER_ID = 'user-teste'

// ── Interfaces ──────────────────────────────────────────────────

export interface TestCotacao {
  id: string
  referencia: string
  status: string
}

export interface TestFornecedor {
  id: string
  nome: string
  email: string
}

export interface BidRequest {
  id: string
  token: string
  fornecedor_id: string
  status: string
}

export interface DisparoResult {
  bidRequests: BidRequest[]
}

// ── Navigation helpers ──────────────────────────────────────────

export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
}

export async function waitForElement(
  page: Page,
  testId: string,
  options: { timeout?: number } = {},
): Promise<void> {
  await expect(page.getByTestId(testId)).toBeVisible({
    timeout: options.timeout ?? 10_000,
  })
}

// ── Wait helpers ────────────────────────────────────────────────

export async function waitForToast(page: Page, text: string | RegExp): Promise<void> {
  const toast = page
    .locator('[data-testid="toast"], [role="alert"]')
    .filter({ hasText: text })
  await expect(toast).toBeVisible({ timeout: 8_000 })
}

export async function waitForLoadingToFinish(page: Page): Promise<void> {
  const loader = page.locator(
    '[data-testid="loading"], [role="progressbar"], [data-testid="skeleton"]',
  )
  if (await loader.isVisible().catch(() => false)) {
    await expect(loader).toBeHidden({ timeout: 15_000 })
  }
}

// ── Screenshot helper ───────────────────────────────────────────

export async function screenshotStep(
  page: Page,
  name: string,
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name.replace(/\s+/g, '-')}.png`,
    fullPage: true,
  })
}

// ── API helpers (request context from page) ─────────────────────

function defaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': TENANT_ID,
    'x-user-id': USER_ID,
  }
}

export async function apiPost<T>(
  page: Page,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await page.request.post(`${API_URL}${endpoint}`, {
    data: body,
    headers: defaultHeaders(),
  })
  expect(response.ok()).toBe(true)
  return response.json() as Promise<T>
}

export async function apiGet<T>(page: Page, endpoint: string): Promise<T> {
  const response = await page.request.get(`${API_URL}${endpoint}`, {
    headers: defaultHeaders(),
  })
  expect(response.ok()).toBe(true)
  return response.json() as Promise<T>
}

export async function apiPatch<T>(
  page: Page,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await page.request.patch(`${API_URL}${endpoint}`, {
    data: body,
    headers: defaultHeaders(),
  })
  expect(response.ok()).toBe(true)
  return response.json() as Promise<T>
}

export async function apiDelete(page: Page, endpoint: string): Promise<void> {
  const response = await page.request.delete(`${API_URL}${endpoint}`, {
    headers: defaultHeaders(),
  })
  expect(response.ok()).toBe(true)
}

// ── Seed helpers ────────────────────────────────────────────────

export async function seedFornecedor(
  page: Page,
  overrides: Partial<{ nome: string; email: string; tipo: string }> = {},
): Promise<TestFornecedor> {
  const ts = Date.now()
  const data = {
    nome: overrides.nome ?? `Fornecedor Test ${ts}`,
    email: overrides.email ?? `fornecedor-${ts}@teste.com`,
    tipo: overrides.tipo ?? 'AGENTE_CARGA',
    telefone: '+5511999999999',
    pais: 'BR',
  }
  return apiPost<TestFornecedor>(page, '/api/v1/bid-frete/fornecedores', data)
}

export async function seedCotacao(
  page: Page,
  overrides: Partial<{
    modal: string
    modalidade: string
    incoterm: string
    origem_porto: string
    destino_porto: string
  }> = {},
): Promise<TestCotacao> {
  const data = {
    tipo_operacao: 'IMPORTACAO',
    modal: overrides.modal ?? 'MARITIMO',
    modalidade: overrides.modalidade ?? 'FCL',
    incoterm: overrides.incoterm ?? 'FOB',
    origem_porto: overrides.origem_porto ?? 'Santos',
    origem_pais: 'BR',
    destino_porto: overrides.destino_porto ?? 'Shanghai',
    destino_pais: 'CN',
    peso_kg: 15_000,
    volume_m3: 33,
    container_tipo: '40HC',
    container_qtd: 1,
    data_embarque: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    prazo_resposta: new Date(Date.now() + 3 * 86_400_000).toISOString(),
  }
  return apiPost<TestCotacao>(page, '/api/v1/bid-frete/cotacoes', data)
}

export async function seedDisparoWithResponses(
  page: Page,
  cotacaoId: string,
  fornecedorIds: string[],
  responses: Array<{ valor_total: number; moeda: string; transit_time_dias: number }>,
): Promise<DisparoResult> {
  const disparo = await apiPost<DisparoResult>(
    page,
    '/api/v1/bid-frete/bids/disparar',
    { cotacao_id: cotacaoId, fornecedor_ids: fornecedorIds, canal: 'EMAIL' },
  )

  for (let i = 0; i < responses.length && i < disparo.bidRequests.length; i++) {
    const br = disparo.bidRequests[i]
    await apiPost(page, `/api/v1/bid-frete/portal/public/responder/${br.token}`, {
      ...responses[i],
      validade: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    })
  }

  return disparo
}

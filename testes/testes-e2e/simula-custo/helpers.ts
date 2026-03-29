/**
 * E2E — SimulaCusto: Helpers reutilizaveis
 * Funcoes auxiliares para seed de dados, navegacao e interacao com formularios.
 */
import { type Page, expect } from '@playwright/test'

// ─── Constantes ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5180'
const CONFIGURADOR_BASE_URL = process.env.CONFIGURADOR_BASE_URL ?? 'http://localhost:5006'
const STORE_BASE_URL = process.env.STORE_BASE_URL ?? 'http://localhost:5006'
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? 'gravity-dev-internal-key-2026'
const TENANT_ID = process.env.E2E_TENANT_ID ?? 'cmnbuvwyw00034rru361h5xng'
const USER_ID = process.env.E2E_USER_ID ?? 'user_demo'
const PRODUCT_KEY = 'simula-custo'

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface TestEstimativa {
  id: string
  numero: string
  status: string
  ncm: string
  operacao: string
  referencia: string | null
  landed_cost_brl: number | null
  total_tributos: number | null
}

export interface TestKpis {
  total: number
  em_criacao: number
  criadas: number
  arquivadas: number
  landed_cost_medio: number
  total_tributos_acumulado: number
}

export interface TestResultadoFiscal {
  vAduaneiroBRL: number
  tributos: {
    ii: { aliquota: number; baseCalculo: number; valor: number }
    ipi: { aliquota: number; baseCalculo: number; valor: number }
    pis: { aliquota: number; baseCalculo: number; valor: number }
    cofins: { aliquota: number; baseCalculo: number; valor: number }
    icms: { aliquota: number; baseCalculo: number; valor: number }
  }
  totalTributos: number
  landedCostBRL: number
  ptaxUtilizada: number
  source: string
}

export interface TestProdutoCatalogo {
  id: string
  nome: string
  slug: string
  status: string
  tipoCobranca: string
  precoUnitario: { valor: string; moeda: string }
}

// ─── API Helpers ────────────────────────────────────────────────────────────

export async function apiPost<T>(
  page: Page,
  endpoint: string,
  body: Record<string, unknown>,
  baseUrl: string = BASE_URL
): Promise<T> {
  const response = await page.request.post(`${baseUrl}${endpoint}`, {
    data: body,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': INTERNAL_KEY,
      'x-tenant-id': TENANT_ID,
      'x-user-id': USER_ID,
    },
  })
  expect(response.ok()).toBe(true)
  return response.json() as Promise<T>
}

export async function apiGet<T>(
  page: Page,
  endpoint: string,
  baseUrl: string = BASE_URL
): Promise<T> {
  const response = await page.request.get(`${baseUrl}${endpoint}`, {
    headers: {
      'x-internal-key': INTERNAL_KEY,
      'x-tenant-id': TENANT_ID,
      'x-user-id': USER_ID,
    },
  })
  expect(response.ok()).toBe(true)
  return response.json() as Promise<T>
}

export async function apiPatch<T>(
  page: Page,
  endpoint: string,
  body: Record<string, unknown>,
  baseUrl: string = BASE_URL
): Promise<T> {
  const response = await page.request.patch(`${baseUrl}${endpoint}`, {
    data: body,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': INTERNAL_KEY,
      'x-tenant-id': TENANT_ID,
      'x-user-id': USER_ID,
    },
  })
  expect(response.ok()).toBe(true)
  return response.json() as Promise<T>
}

// ─── Seed Helpers ───────────────────────────────────────────────────────────

/**
 * Seed: Garante que SimulaCusto esta no catalogo.
 * Retorna dados do produto no catalogo.
 */
export async function seedProduct(page: Page): Promise<TestProdutoCatalogo> {
  return apiGet<TestProdutoCatalogo>(
    page,
    `/api/v1/configurador/catalog/products/${PRODUCT_KEY}`,
    CONFIGURADOR_BASE_URL
  )
}

/**
 * Seed: Garante que o tenant de teste existe.
 */
export async function seedTenant(page: Page): Promise<{ id: string; name: string }> {
  return apiPost<{ id: string; name: string }>(
    page,
    '/api/v1/configurador/tenants',
    { id: TENANT_ID, name: 'Tenant de Teste E2E' },
    CONFIGURADOR_BASE_URL
  )
}

/**
 * Ativa SimulaCusto para o tenant de teste.
 */
export async function activateProduct(page: Page): Promise<{ product_key: string; active: boolean }> {
  return apiPost<{ product_key: string; active: boolean }>(
    page,
    `/api/v1/configurador/tenant/products`,
    { tenant_id: TENANT_ID, product_key: PRODUCT_KEY },
    CONFIGURADOR_BASE_URL
  )
}

/**
 * Desativa SimulaCusto para o tenant de teste.
 */
export async function deactivateProduct(page: Page): Promise<void> {
  const response = await page.request.delete(
    `${CONFIGURADOR_BASE_URL}/api/v1/configurador/tenant/products/${PRODUCT_KEY}`,
    {
      headers: {
        'x-internal-key': INTERNAL_KEY,
        'x-tenant-id': TENANT_ID,
      },
    }
  )
  expect(response.ok()).toBe(true)
}

/**
 * Seed: Cria uma estimativa via API para uso em testes.
 */
export async function seedEstimativa(
  page: Page,
  overrides: Partial<{
    ncm: string
    operacao: string
    tipo_operacao: string
    valorProduto: number
    referencia: string
  }> = {}
): Promise<TestEstimativa> {
  const data = {
    ncm: overrides.ncm ?? '84713019',
    paisOrigem: 'US',
    dataFatoGerador: new Date().toISOString().split('T')[0],
    operacao: overrides.operacao ?? 'IMPORTACAO',
    tipo_operacao: overrides.tipo_operacao ?? 'DIRETA',
    incoterm: 'FOB',
    quantidade: 1,
    referencia: overrides.referencia ?? `REF-E2E-${Date.now()}`,
    valorProduto: overrides.valorProduto ?? 5925.0,
    moedaProduto: 'USD',
    freteInter: 500.0,
    moedaFrete: 'USD',
    seguroInter: 50.0,
    moedaSeguro: 'USD',
    taxasOrigem: [],
    taxasDestino: [],
    ufDesembaraco: 'SP',
    aliquotaII: 0.16,
    aliquotaIPI: 0,
    aliquotaPIS: 0.021,
    aliquotaCOFINS: 0.0965,
    aliquotaICMS: 0.18,
    documentos: [],
  }
  return apiPost<TestEstimativa>(page, '/api/v1/simula-custo/estimativas', data)
}

// ─── UI Navigation Helpers ──────────────────────────────────────────────────

/**
 * Navega para um path relativo ao BASE_URL do SimulaCusto.
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`)
  await page.waitForLoadState('networkidle')
}

/**
 * Navega para o Configurador.
 */
export async function navigateToConfigurador(page: Page, path: string): Promise<void> {
  await page.goto(`${CONFIGURADOR_BASE_URL}${path}`)
  await page.waitForLoadState('networkidle')
}

/**
 * Navega para a Store (Marketplace).
 */
export async function navigateToStore(page: Page, path: string = '/'): Promise<void> {
  await page.goto(`${STORE_BASE_URL}${path}`)
  await page.waitForLoadState('networkidle')
}

/**
 * Aguarda o dashboard de estimativas carregar completamente.
 */
export async function waitForDashboard(page: Page): Promise<void> {
  // Aguardar que os KPI cards e a tabela estejam visiveis
  await expect(
    page.locator('.ed-kpi-card').first()
  ).toBeVisible({ timeout: 10000 })

  // Aguardar loading/skeleton desaparecer
  const loader = page.locator('[data-testid="loading"], [role="progressbar"]')
  if (await loader.isVisible()) {
    await expect(loader).toBeHidden({ timeout: 10000 })
  }
}

// ─── UI Form Helpers ────────────────────────────────────────────────────────

/**
 * Preenche o formulario de nova estimativa com dados padroes de teste.
 */
export async function fillEstimativaForm(
  page: Page,
  overrides: Partial<{
    ncm: string
    paisOrigem: string
    ufDesembaraco: string
    quantidade: string
    valorProduto: string
    moedaProduto: string
    freteInter: string
    seguroInter: string
    aliquotaII: string
    aliquotaIPI: string
    aliquotaPIS: string
    aliquotaCOFINS: string
    aliquotaICMS: string
    operacao: string
    tipoOperacao: string
    incoterm: string
    referencia: string
  }> = {}
): Promise<void> {
  // Secao: Operacao
  if (overrides.operacao) {
    await page.locator('select').filter({ hasText: /Importa|Exporta/i }).selectOption(overrides.operacao)
  }
  if (overrides.tipoOperacao) {
    await page.locator('select').filter({ hasText: /Direta|Conta e Ordem/i }).selectOption(overrides.tipoOperacao)
  }
  if (overrides.incoterm) {
    await page.locator('select').filter({ hasText: /FOB|CIF|EXW/i }).selectOption(overrides.incoterm)
  }
  if (overrides.referencia) {
    await page.getByPlaceholder('REF-2026-001').fill(overrides.referencia)
  }

  // Secao: Produto & Origem
  const ncmInput = page.getByPlaceholder('84713019')
  await ncmInput.fill(overrides.ncm ?? '84713019')

  const paisInput = page.getByPlaceholder('US')
  await paisInput.fill(overrides.paisOrigem ?? 'US')

  const ufInput = page.getByPlaceholder('SP')
  await ufInput.fill(overrides.ufDesembaraco ?? 'SP')

  const qtdInput = page.getByPlaceholder('1')
  await qtdInput.fill(overrides.quantidade ?? '1')

  // Secao: Valores
  const valorProdutoInput = page.getByPlaceholder('5925.00')
  await valorProdutoInput.fill(overrides.valorProduto ?? '5925')

  const freteInput = page.getByPlaceholder('0.00').first()
  await freteInput.fill(overrides.freteInter ?? '500')

  // Secao: Aliquotas
  const iiInput = page.getByPlaceholder('16.00')
  await iiInput.fill(overrides.aliquotaII ?? '16')

  const ipiInput = page.getByPlaceholder('0.00').nth(2)
  await ipiInput.fill(overrides.aliquotaIPI ?? '0')

  const pisInput = page.getByPlaceholder('2.10')
  await pisInput.fill(overrides.aliquotaPIS ?? '2.10')

  const cofinsInput = page.getByPlaceholder('9.65')
  await cofinsInput.fill(overrides.aliquotaCOFINS ?? '9.65')

  const icmsInput = page.getByPlaceholder('18.00')
  await icmsInput.fill(overrides.aliquotaICMS ?? '18')
}

/**
 * Clica no botao "Simular Custo" e aguarda o resultado.
 */
export async function submitSimulacao(page: Page): Promise<void> {
  await page.getByRole('button', { name: /simular custo/i }).click()

  // Aguardar o resultado fiscal aparecer
  await expect(
    page.locator('.sc-result, [data-testid="resultado-fiscal"]')
  ).toBeVisible({ timeout: 15000 })
}

// ─── UI Assertion Helpers ───────────────────────────────────────────────────

/**
 * Aguarda um toast de feedback aparecer na tela.
 */
export async function waitForToast(page: Page, text: string | RegExp): Promise<void> {
  const toast = page.locator('[data-testid="toast"], [role="alert"]').filter({ hasText: text })
  await expect(toast).toBeVisible({ timeout: 5000 })
}

/**
 * Aguarda qualquer loading/skeleton finalizar.
 */
export async function waitForLoadingToFinish(page: Page): Promise<void> {
  const loader = page.locator('[data-testid="loading"], [role="progressbar"]')
  if (await loader.isVisible()) {
    await expect(loader).toBeHidden({ timeout: 10000 })
  }
}

export {
  BASE_URL,
  CONFIGURADOR_BASE_URL,
  STORE_BASE_URL,
  INTERNAL_KEY,
  TENANT_ID,
  USER_ID,
  PRODUCT_KEY,
}

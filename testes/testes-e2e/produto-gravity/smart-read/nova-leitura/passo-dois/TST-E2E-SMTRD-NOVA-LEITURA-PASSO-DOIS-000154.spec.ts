/**
 * TST-E2E-SMTRD-NOVA-LEITURA-PASSO-DOIS-000154
 * E2E — Passo 02 Análise do arquivo (Nova Leitura Smart Read)
 */
import { test, expect, type Page } from '../../../../../playwright.fixtures'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8000'
const ROTA_INSIGHTS = '/smart_read/insights'
const ID_LEITURA = 'e2e-leitura-passo-dois-000154'
const NOME_LEITURA = 'Leitura E2E Passo 2'
const FIXTURES = resolve(
  __dir,
  '../../../../../testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras',
)

function respostaLeituraCompleta() {
  return {
    id_leitura: ID_LEITURA,
    nome_leitura: NOME_LEITURA,
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    arquivos_processados: 1,
    arquivos: [
      {
        id_arquivo: 'arq-e2e-dois-001',
        nome_arquivo: 'amostra.pdf',
        status_arquivo: 'COMPLETED',
        tempo_extracao_ia_ms: 5000,
        resultado_extracao: [
          { tipo_documento: 'Bill of Lading', dados: { numero: 'BL-E2E' } },
          { tipo_documento: 'Commercial Invoice', dados: { numero: 'INV-E2E' } },
        ],
      },
    ],
  }
}

async function mockarApisPassoDois(page: Page) {
  await page.route('**/api/v1/smart-read/leituras', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          id_leitura: ID_LEITURA,
          id_arquivo: 'arq-e2e-dois-001',
          status_leitura: 'PROCESSING',
        }),
      })
      return
    }
    await route.continue()
  })

  await page.route(`**/api/v1/smart-read/leituras/${ID_LEITURA}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(respostaLeituraCompleta()),
    })
  })

  await page.route('**/api/v1/smart-read/leituras/metricas/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        transacoes: [],
        paginacao: { pagina: 1, limite: 50, total: 0 },
      }),
    })
  })
}

async function abrirPassoDois(page: Page) {
  await mockarApisPassoDois(page)
  await page.goto(`${BASE_URL}${ROTA_INSIGHTS}`)
  await page.getByRole('button', { name: /^Novo$/i }).click()
  await page.getByRole('menuitem', { name: /Nova Leitura/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 20_000 })
  await dialog.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'amostra.pdf'))
  const inicio = Date.now()
  await dialog.getByRole('button', { name: 'Enviar' }).click()
  await expect(dialog.getByText('Análise do arquivo').first()).toBeVisible({ timeout: 15_000 })
  return { dialog, inicio }
}

test.describe('TST-E2E-SMTRD-NOVA-LEITURA-PASSO-DOIS-000154', () => {
  test('E01–E02: passo 2 aberto com nome da leitura correto', async ({ page }) => {
    const { dialog } = await abrirPassoDois(page)
    await expect(dialog.getByText('Análise do arquivo').first()).toBeVisible()
    await expect(dialog.locator('.sr-wizard-modal-subtitulo-leitura')).toContainText(NOME_LEITURA)
  })

  test('E03: cards carregam documentos identificados', async ({ page }) => {
    const { dialog } = await abrirPassoDois(page)
    await expect(dialog.getByText('Bill of Lading')).toBeVisible({ timeout: 20_000 })
    await expect(dialog.getByText('Commercial Invoice')).toBeVisible()
    await expect(dialog.getByText('Análise completa')).toBeVisible()
  })

  test('E04: visualizar documento no card expandido', async ({ page, context }) => {
    const { dialog } = await abrirPassoDois(page)
    await expect(dialog.getByText('Bill of Lading')).toBeVisible({ timeout: 20_000 })
    await dialog.getByRole('button', { name: /Expandir documentos identificados/i }).click()
    const popupPromise = context.waitForEvent('page')
    await dialog.getByRole('button', { name: /Visualizar Bill of Lading/i }).click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    expect(popup.url()).toMatch(/^blob:/)
    await popup.close()
  })

  test('E05–E07: métricas, três análises, globo e SLA 75s', async ({ page }) => {
    const { dialog, inicio } = await abrirPassoDois(page)
    await expect(dialog.getByText('Tempo de leitura')).toBeVisible({ timeout: 20_000 })
    await expect(dialog.getByText('Recursos reduzidos com a leitura')).toBeVisible()
    await expect(dialog.getByText('Tempo reduzido acumulado')).toBeVisible()
    await expect(dialog.getByText('Primeira análise')).toBeVisible()
    await expect(dialog.getByText('Segunda análise')).toBeVisible()
    await expect(dialog.getByText('Terceira análise')).toBeVisible()
    await expect(dialog.getByText('Completo').first()).toBeVisible({ timeout: 25_000 })
    await expect(dialog.getByText('100%').first()).toBeVisible({ timeout: 25_000 })
    expect(Date.now() - inicio).toBeLessThan(75_000)
  })
})

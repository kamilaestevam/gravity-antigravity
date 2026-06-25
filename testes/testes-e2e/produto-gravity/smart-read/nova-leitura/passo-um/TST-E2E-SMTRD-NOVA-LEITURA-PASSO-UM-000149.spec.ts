/**
 * TST-E2E-SMTRD-NOVA-LEITURA-PASSO-UM-000149
 * E2E — Passo 01 Anexar arquivo (Nova Leitura Smart Read)
 */
import { test, expect, type Page } from '../../../../../playwright.fixtures'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8000'
const ROTA_INSIGHTS = '/smart_read/insights'
const FIXTURES = resolve(
  __dir,
  '../../../../../testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras',
)

async function abrirNovaLeituraPassoUm(page: Page) {
  await page.goto(`${BASE_URL}${ROTA_INSIGHTS}`)
  await page.getByRole('button', { name: /^Novo$/i }).click()
  await page.getByRole('menuitem', { name: /Nova Leitura/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 20_000 })
  await expect(dialog.getByText('Anexar arquivo').first()).toBeVisible()
  await expect(dialog.getByText('Bem-vindo ao Smart Read')).toBeVisible()
  return dialog
}

test.describe('TST-E2E-SMTRD-NOVA-LEITURA-PASSO-UM-000149', () => {
  test('E01–E02: abre modal Nova Leitura no passo 01 Anexar arquivo', async ({ page }) => {
    const dialog = await abrirNovaLeituraPassoUm(page)
    await expect(dialog.getByText('Formatos aceitos pela plataforma')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  })

  test('E03–E06: anexa PDF, exibe card com nome do arquivo', async ({ page }) => {
    const dialog = await abrirNovaLeituraPassoUm(page)
    const input = dialog.locator('input[type="file"]')
    await input.setInputFiles(resolve(FIXTURES, 'amostra.pdf'))
    await expect(dialog.getByText('amostra.pdf')).toBeVisible({ timeout: 10_000 })
    await expect(dialog.getByText('Arquivo enviado')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Enviar' })).toBeEnabled()
  })

  test('E04: aceita todos os 8 tipos de arquivo', async ({ page }) => {
    const dialog = await abrirNovaLeituraPassoUm(page)
    const input = dialog.locator('input[type="file"]')
    const arquivos = [
      'amostra.pdf',
      'amostra.jpg',
      'amostra.jpeg',
      'amostra.png',
      'amostra.xml',
      'amostra.csv',
      'amostra.xls',
      'amostra.xlsx',
    ].map((nome) => resolve(FIXTURES, nome))
    await input.setInputFiles(arquivos)
    for (const nome of arquivos.map((p) => p.split(/[/\\]/).pop()!)) {
      await expect(dialog.getByText(nome)).toBeVisible()
    }
    await expect(dialog.getByText('Arquivos enviados').locator('..').getByText('8')).toBeVisible()
  })

  test('E07–E08: visualizar abre nova aba com blob URL', async ({ page, context }) => {
    const dialog = await abrirNovaLeituraPassoUm(page)
    await dialog.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'amostra.pdf'))
    await expect(dialog.getByText('amostra.pdf')).toBeVisible()
    const popupPromise = context.waitForEvent('page')
    await dialog.getByRole('button', { name: /Visualizar original amostra\.pdf/i }).click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    expect(popup.url()).toMatch(/^blob:/)
    await popup.close()
  })

  test('E09: excluir exibe confirmação padrão e remove card', async ({ page }) => {
    const dialog = await abrirNovaLeituraPassoUm(page)
    await dialog.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'amostra.pdf'))
    await expect(dialog.getByText('amostra.pdf')).toBeVisible()
    await dialog.getByRole('button', { name: /Remover amostra\.pdf/i }).click()
    const confirmacao = page.getByRole('dialog', { name: /Excluir arquivo/i })
    await expect(confirmacao).toBeVisible()
    await expect(confirmacao.getByText('O arquivo será removido desta leitura.')).toBeVisible()
    await confirmacao.getByRole('button', { name: /Excluir|Confirmar/i }).click()
    await expect(dialog.getByText('amostra.pdf')).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  })

  test('E10: Cancelar fecha o wizard', async ({ page }) => {
    const dialog = await abrirNovaLeituraPassoUm(page)
    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 })
  })

  test('E11: Enviar avança para passo 2 Análise do arquivo', async ({ page }) => {
    const idLeitura = 'e2e-leitura-passo-um-000149'
    await page.route('**/api/v1/smart-read/leituras', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({
            id_leitura: idLeitura,
            id_arquivo: 'arq-e2e-001',
            status_leitura: 'PROCESSING',
          }),
        })
        return
      }
      await route.continue()
    })
    await page.route(`**/api/v1/smart-read/leituras/${idLeitura}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id_leitura: idLeitura,
          nome_leitura: 'Leitura E2E',
          status_leitura: 'PROCESSING',
          arquivos: [
            {
              id_arquivo: 'arq-e2e-001',
              nome_arquivo: 'amostra.pdf',
              status_arquivo: 'PROCESSING',
              resultado_extracao: [],
            },
          ],
        }),
      })
    })

    const dialog = await abrirNovaLeituraPassoUm(page)
    await dialog.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'amostra.pdf'))
    await dialog.getByRole('button', { name: 'Enviar' }).click()
    await expect(dialog.getByText('Análise do arquivo').first()).toBeVisible({ timeout: 15_000 })
    await expect(dialog.getByText(/Analisando arquivo|Enviando arquivo/i)).toBeVisible()
  })
})

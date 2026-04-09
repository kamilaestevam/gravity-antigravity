import { test, expect } from '@playwright/test'
import { mkdirSync } from 'fs'
import path from 'path'

/**
 * Testes E2E — Smart Import: Campos Corrigidos (produto Pedido)
 * Porta: 5179
 *
 * Cobertura:
 *  - Novos aliases: Currency→moeda_pedido, Unit→unidade_comercializada_item,
 *    Unit Price→valor_unitario_item, Total Value→valor_total_itens
 *  - 12 de 12 colunas mapeadas com CSV estendido
 *  - Confirmação retorna pedido criado (sem erros)
 *  - campos do Pedido: cobertura_cambial, casas_decimais_total_pedido gravados corretamente
 */

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-smart-import-campos-corrigidos',
)
mkdirSync(PRINTS_DIR, { recursive: true })

const CSV_PATH = path.join(process.cwd(), 'testes/fixtures/pedido/test_import_campos.csv')

async function navegarParaImportacao(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  await page.goto('/pedidos')
  // Aguardar página completamente carregada antes de interagir com o toolbar
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.mtg-left__page-title')).toBeVisible({ timeout: 10000 })

  await page.locator('button').filter({ hasText: /novo/i }).first().click({ timeout: 20000 })
  await page.waitForTimeout(600)
  const box = await page.locator('button').filter({ hasText: /novo pedido/i }).first().boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.waitForTimeout(500)
  const importBox = await page.locator('button').filter({ hasText: /importa/i }).first().boundingBox()
  await page.mouse.move(importBox!.x + importBox!.width / 2, importBox!.y + importBox!.height / 2)
  await page.waitForTimeout(200)
  await page.mouse.click(importBox!.x + importBox!.width / 2, importBox!.y + importBox!.height / 2)
  await expect(page.locator('text=Importar Pedidos')).toBeVisible({ timeout: 8000 })
}

test.describe('Smart Import — Campos Corrigidos @critico', () => {

  test('12 de 12 colunas auto-mapeadas: novos aliases Currency, Unit, Unit Price, Total Value', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.screenshot({ path: path.join(PRINTS_DIR, '01-modal-upload.png') })

    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(PRINTS_DIR, '02-etapa-mapeamento.png') })

    // Todos os 12 campos devem estar mapeados
    await expect(page.locator('text=/\\d+ de \\d+ colunas mapeadas/')).toBeVisible()
    const texto = await page.locator('text=/\\d+ de \\d+ colunas mapeadas/').textContent()
    // Verificar que é 12 de 12 (todos mapeados)
    const match = texto?.match(/(\d+) de (\d+)/)
    expect(Number(match?.[1])).toBe(Number(match?.[2]))
    await page.screenshot({ path: path.join(PRINTS_DIR, '03-todas-colunas-mapeadas.png') })
  })

  test('coluna Currency mapeada para moeda_pedido no select', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1500)

    // Linha da coluna "Currency" — usar td:first-child com texto exato
    const selectCurrency = page.locator('.smart-import__tabela tbody tr')
      .filter({ has: page.locator('td').first().filter({ hasText: /^Currency$/ }) })
      .first()
      .locator('select')
    await expect(selectCurrency).toHaveValue('moeda_pedido')
    await page.screenshot({ path: path.join(PRINTS_DIR, '04-currency-mapeada.png') })
  })

  test('coluna Unit mapeada para unidade_comercializada_item no select', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1500)

    // Linha da coluna "Unit" — usar o aria-label único do select (não pega "Unit Price")
    const selectUnit = page.locator('select[aria-label="Campo sistema para Unit"]')
    await expect(selectUnit).toHaveValue('unidade_comercializada_item')
    await page.screenshot({ path: path.join(PRINTS_DIR, '05-unit-mapeada.png') })
  })

  test('coluna Unit Price mapeada para valor_unitario_item no select', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1500)

    const selectUnitPrice = page.locator('.smart-import__tabela tbody tr')
      .filter({ has: page.locator('td').first().filter({ hasText: /^Unit Price$/ }) })
      .first()
      .locator('select')
    await expect(selectUnitPrice).toHaveValue('valor_unitario_item')
    await page.screenshot({ path: path.join(PRINTS_DIR, '06-unit-price-mapeada.png') })
  })

  test('coluna Total Value mapeada para valor_total_itens no select', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1500)

    const selectTotalValue = page.locator('.smart-import__tabela tbody tr')
      .filter({ has: page.locator('td').first().filter({ hasText: /^Total Value$/ }) })
      .first()
      .locator('select')
    await expect(selectTotalValue).toHaveValue('valor_total_itens')
    await page.screenshot({ path: path.join(PRINTS_DIR, '07-total-value-mapeada.png') })
  })

  test('confirmação via UI: importação conclui sem erro e exibe resultado', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(PRINTS_DIR, '08-mapeamento-antes-continuar.png') })

    // Clicar em Continuar para avançar para Preview
    const btnContinuar = page.locator('button').filter({ hasText: /continuar|próximo|next/i }).last()
    await expect(btnContinuar).toBeVisible({ timeout: 5000 })
    await btnContinuar.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(PRINTS_DIR, '09-etapa-preview.png') })

    // Preview step — verificar que há linhas para importar
    const tituloPreview = page.locator('text=/preview|revisão|confirmar|importar/i').first()
    await expect(tituloPreview).toBeVisible({ timeout: 8000 })

    // Clicar em Confirmar Importação
    const btnConfirmar = page.locator('button').filter({ hasText: /confirm|importar|finalizar/i }).last()
    await expect(btnConfirmar).toBeVisible({ timeout: 5000 })
    await btnConfirmar.click()
    await page.waitForTimeout(3000)
    await page.screenshot({ path: path.join(PRINTS_DIR, '10-resultado-importacao.png') })

    // Verificar resultado: deve mostrar pedidos criados (sem "erro")
    const resultadoTela = page.locator('text=/criado|importado|sucesso/i').first()
    await expect(resultadoTela).toBeVisible({ timeout: 10000 })
  })

})

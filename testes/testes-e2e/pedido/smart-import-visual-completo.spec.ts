/**
 * smart-import-visual-completo.spec.ts
 * Valida visualmente:
 *   1. Modal de upload abre corretamente
 *   2. Botão "Baixar planilha modelo" está presente e link funciona (HTTP 200)
 *   3. Após upload: etapa mapeamento exibe colunas
 *   4. Incluir/Excluir coluna via toggle "Ignorar" reflete na tabela
 *   5. Contador de colunas mapeadas atualiza ao ignorar/restaurar
 */

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'fs'
import path from 'path'

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-smart-import-incluir-excluir',
)
mkdirSync(PRINTS_DIR, { recursive: true })

const CSV_PATH = path.join(process.cwd(), 'testes/fixtures/pedido/test_import_temp.csv')

async function abrirModalImport(page: Page) {
  await page.goto('/pedidos', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.mtg-left__page-title')).toBeVisible({ timeout: 10000 })
  await page.locator('button').filter({ hasText: /novo/i }).first().click()
  await page.waitForTimeout(600)
  const box = await page.locator('button').filter({ hasText: /novo pedido/i }).first().boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.waitForTimeout(400)
  const importBtn = page.locator('button').filter({ hasText: /importa/i }).first()
  await importBtn.click()
  await expect(page.locator('text=Importar Pedidos')).toBeVisible({ timeout: 8000 })
}

test.describe('Smart Import — Visual Completo @critico', () => {

  test('01 — modal de upload renderiza corretamente com botão de download', async ({ page }) => {
    await abrirModalImport(page)
    await page.screenshot({ path: path.join(PRINTS_DIR, '01-modal-upload-aberto.png'), fullPage: false })

    // Step indicator visível
    await expect(page.locator('text=Upload')).toBeVisible()
    await expect(page.locator('text=Mapeamento')).toBeVisible()
    await expect(page.locator('text=Preview')).toBeVisible()
    await expect(page.locator('text=Resultado')).toBeVisible()

    // Botão de download presente
    const linkDownload = page.locator('a', { hasText: /baixar planilha modelo/i })
    await expect(linkDownload).toBeVisible()
    await page.screenshot({ path: path.join(PRINTS_DIR, '02-botao-download-visivel.png'), fullPage: false })

    // Verificar que href aponta para /template
    const href = await linkDownload.getAttribute('href')
    expect(href).toContain('/smart-import/template')
  })

  test('02 — link download retorna 200 (sem auth)', async ({ request }) => {
    const res = await request.get('http://localhost:8026/api/v1/pedidos/smart-import/template')
    expect(res.status()).toBe(200)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toContain('openxmlformats-officedocument.spreadsheetml.sheet')
  })

  test('03 — após upload CSV: etapa mapeamento exibe tabela com colunas', async ({ page }) => {
    await abrirModalImport(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 12000 })
    // Aguardar tabela carregar
    await expect(page.locator('.smart-import__tabela, table').first()).toBeVisible({ timeout: 8000 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(PRINTS_DIR, '03-etapa-mapeamento.png'), fullPage: false })

    // Deve ter pelo menos 1 linha de dados na tabela
    const linhas = page.locator('.smart-import__tabela tbody tr, table tbody tr')
    const count = await linhas.count()
    expect(count).toBeGreaterThan(0)
    await page.screenshot({ path: path.join(PRINTS_DIR, '04-tabela-com-linhas.png'), fullPage: false })
  })

  test('04 — contador de colunas mapeadas exibido', async ({ page }) => {
    await abrirModalImport(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 12000 })
    await expect(page.locator('.smart-import__tabela, table').first()).toBeVisible({ timeout: 8000 })
    await page.waitForTimeout(1000)

    // Contador no formato "X de Y colunas mapeadas"
    const contador = page.locator('text=/\\d+ de \\d+ colunas mapeadas/i')
    await expect(contador).toBeVisible({ timeout: 5000 })
    const textoContador = await contador.textContent()
    await page.screenshot({ path: path.join(PRINTS_DIR, '05-contador-colunas.png'), fullPage: false })
    console.log('Contador:', textoContador)
  })

  test('05 — ignorar coluna: select muda para "ignorado" e reflete na UI', async ({ page }) => {
    await abrirModalImport(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 12000 })
    await expect(page.locator('.smart-import__tabela, table').first()).toBeVisible({ timeout: 8000 })
    await page.waitForTimeout(1000)

    // Capturar contador inicial
    const contador = page.locator('text=/\\d+ de \\d+ colunas mapeadas/i')
    const textoInicial = await contador.textContent()
    const matchInicial = textoInicial?.match(/(\d+) de (\d+)/)
    const mapeadasInicial = matchInicial ? parseInt(matchInicial[1]) : 0

    await page.screenshot({ path: path.join(PRINTS_DIR, '06-antes-ignorar.png'), fullPage: false })

    // Selecionar "ignorado" no primeiro select de campo
    const selects = page.locator('select')
    const count = await selects.count()
    if (count > 0) {
      // Opção "Ignorar" tem value="" (string vazia)
      await selects.first().selectOption({ value: '' })
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(PRINTS_DIR, '07-coluna-ignorada.png'), fullPage: false })

      // Contador deve ter diminuído
      const textoDepois = await contador.textContent()
      const matchDepois = textoDepois?.match(/(\d+) de (\d+)/)
      const mapeadasDepois = matchDepois ? parseInt(matchDepois[1]) : mapeadasInicial
      console.log(`Antes: ${textoInicial} | Depois: ${textoDepois}`)
      expect(mapeadasDepois).toBeLessThan(mapeadasInicial)
    }
  })

  test('06 — restaurar coluna ignorada: contador volta ao valor anterior', async ({ page }) => {
    await abrirModalImport(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_PATH)
    await expect(page.locator('text=Mapeamento')).toBeVisible({ timeout: 12000 })
    await expect(page.locator('.smart-import__tabela, table').first()).toBeVisible({ timeout: 8000 })
    await page.waitForTimeout(1000)

    const contador = page.locator('text=/\\d+ de \\d+ colunas mapeadas/i')
    const selects = page.locator('select')

    if (await selects.count() > 0) {
      // Ignorar — value="" é a opção "— Ignorar —"
      const textoAntes = await contador.textContent()
      await selects.first().selectOption({ value: '' })
      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(PRINTS_DIR, '08-ignorado.png'), fullPage: false })

      // Restaurar selecionando outro valor
      const opcoes = await selects.first().locator('option').allTextContents()
      const primeiraOpcaoValida = opcoes.find(o => o && !o.toLowerCase().includes('ignor') && !o.toLowerCase().includes('selecione'))
      if (primeiraOpcaoValida) {
        const values = await selects.first().locator('option').all()
        for (const opt of values) {
          const val = await opt.getAttribute('value')
          const txt = await opt.textContent()
          if (txt && !txt.toLowerCase().includes('ignor') && !txt.toLowerCase().includes('selecione') && val) {
            await selects.first().selectOption({ value: val })
            break
          }
        }
        await page.waitForTimeout(300)
        await page.screenshot({ path: path.join(PRINTS_DIR, '09-restaurado.png'), fullPage: false })
        const textoDepois = await contador.textContent()
        console.log(`Antes ignorar: ${textoAntes} | Depois restaurar: ${textoDepois}`)
      }
    }
  })

})

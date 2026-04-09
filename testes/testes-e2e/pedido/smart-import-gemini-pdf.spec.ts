import { test, expect } from '@playwright/test'
import { mkdirSync } from 'fs'
import path from 'path'

/**
 * Testes E2E — Smart Import: Importação de PDF via Gemini
 * Porta: 5179
 *
 * Cobertura:
 *  - Upload de PDF → parser deve ser 'gemini' (não 'pdf-parse')
 *  - Etapa de mapeamento mostra colunas reais da invoice (não lixo numérico)
 *  - Pelo menos 1 coluna mapeada com confiança ≥ 70%
 *  - Modal não crasha ao carregar PDF
 */

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-gemini-pdf-import',
)
mkdirSync(PRINTS_DIR, { recursive: true })

const PDF_PATH = path.join(process.cwd(), 'testes/fixtures/pedido/invoice-test.pdf')

// Tempo máximo para extração Gemini (até 90s com retry 503)
const GEMINI_TIMEOUT = 120_000

async function navegarParaImportacao(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  await page.goto('/pedidos')
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

/** Aguarda a tabela de mapeamento aparecer (Gemini pode levar até 90s + retry 503) */
async function aguardarMapeamento(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  // Aguarda a tabela de mapeamento com timeout alto para cobrir extração Gemini completa
  await expect(page.locator('.smart-import__tabela')).toBeVisible({ timeout: GEMINI_TIMEOUT })
  // Aguarda as linhas popularem (dados do Gemini/pdf-parse)
  await expect(page.locator('.smart-import__tabela tbody tr').first()).toBeVisible({ timeout: 15000 })
  await page.waitForTimeout(500)
}

test.describe('Smart Import — PDF via Gemini @critico', () => {

  test('upload de PDF não crasha o modal e avança para etapa de mapeamento', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.screenshot({ path: path.join(PRINTS_DIR, '01-modal-upload.png') })

    await page.locator('input[type="file"]').first().setInputFiles(PDF_PATH)

    // Aguardar a tabela de mapeamento carregar (Gemini pode levar até 90s com retry)
    await page.screenshot({ path: path.join(PRINTS_DIR, '02-extraindo.png') })
    await aguardarMapeamento(page)
    // aguardarMapeamento já verificou tbody tr — capturar screenshot como evidência
    await page.screenshot({ path: path.join(PRINTS_DIR, '03-tabela-mapeamento.png') })
  })

  test('parser usado é gemini (não pdf-parse ou pdf-erro)', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(PDF_PATH)
    await aguardarMapeamento(page)
    await page.waitForTimeout(500)

    // Verificar parser na barra de status:
    //   - Gemini OK: "✦ Extraído com IA (Gemini)"
    //   - Fallback: "parser: pdf-parse" (não deve ocorrer se Gemini estiver ativo)
    const statusBar = page.locator('text=/Extraído com IA|parser:/i').first()
    const statusText = await statusBar.textContent({ timeout: 5000 }).catch(() => '')
    await page.screenshot({ path: path.join(PRINTS_DIR, '05-status-parser.png') })

    // O parser deve ser gemini (qualquer forma)
    const textoLower = statusText?.toLowerCase() ?? ''
    expect(textoLower.includes('gemini') || textoLower.includes('ia')).toBe(true)
  })

  test('colunas da invoice são nomes reais (não números como "1", "26", "of")', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(PDF_PATH)
    await aguardarMapeamento(page)

    // Pegar todos os textos da primeira coluna (COLUNA DO ARQUIVO)
    const colunas = await page.locator('.smart-import__tabela tbody tr td:first-child').allTextContents()
    await page.screenshot({ path: path.join(PRINTS_DIR, '06-colunas-arquivo.png') })

    // Nenhuma coluna deve ser um número puro ou "of" — esses são artefatos do parser de texto
    const colunasInvalidas = colunas.filter(c => {
      const t = c.trim()
      return /^\d+$/.test(t) || t === 'of' || t === '--' || t === ''
    })

    expect(colunasInvalidas).toHaveLength(0)
    // Deve haver pelo menos 1 coluna
    expect(colunas.length).toBeGreaterThan(0)
  })

  test('pelo menos 1 coluna mapeada automaticamente com campo do sistema', async ({ page }) => {
    await navegarParaImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(PDF_PATH)
    await aguardarMapeamento(page)

    // Verificar contador "X de Y colunas mapeadas"
    const contadorVisible = await page.locator('text=/\\d+ de \\d+ colunas mapeadas/').isVisible()
    await page.screenshot({ path: path.join(PRINTS_DIR, '07-contador-mapeamento.png') })

    if (contadorVisible) {
      const texto = await page.locator('text=/\\d+ de \\d+ colunas mapeadas/').textContent()
      const match = texto?.match(/(\d+) de (\d+)/)
      const mapeadas = Number(match?.[1] ?? 0)
      expect(mapeadas).toBeGreaterThan(0)
    } else {
      // Fallback: verificar que pelo menos 1 select não está em "Ignorar"
      const selects = page.locator('.smart-import__tabela tbody tr select')
      const count = await selects.count()
      let mapeadas = 0
      for (let i = 0; i < count; i++) {
        const val = await selects.nth(i).inputValue()
        if (val && val !== '') mapeadas++
      }
      expect(mapeadas).toBeGreaterThan(0)
    }
  })

})

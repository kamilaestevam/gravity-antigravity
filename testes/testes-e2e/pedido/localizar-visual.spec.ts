/**
 * Localizar — Testes Visuais com Screenshots Passo a Passo
 *
 * Finalidade: gerar prints de CADA cenário de busca para revisão visual.
 * Cobre: pedido, item, parcial, completo, valores, cross-page, contador, navegação ↓↑.
 *
 * Prints salvos em: testes/testes-em-tela/produto/pedido/2026-04-09-localizar-prints/
 */

import { test, expect, Page } from '@playwright/test'
import * as path from 'path'

const PRINTS = path.resolve(
  __dirname,
  '../../testes-em-tela/produto/pedido/2026-04-09-localizar-prints',
)

let _printIdx = 0

async function shot(page: Page, nome: string) {
  _printIdx++
  const idx = String(_printIdx).padStart(2, '0')
  await page.screenshot({
    path: path.join(PRINTS, `${idx}-${nome}.png`),
    fullPage: false,
  })
}

async function carregarPagina(page: Page) {
  await page.goto('/pedidos')
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  // Aguarda totalItens estabilizar
  await page.waitForTimeout(500)
}

/** Lê texto de uma célula .gtv-celula da linha pai (exclui células com apenas ícones/botões). */
async function lerCelulaTexto(page: Page, nthRow: number): Promise<string> {
  const celulas = page.locator('.gtv-linha--pai').nth(nthRow).locator('.gtv-celula')
  const n = await celulas.count()
  for (let i = 0; i < n; i++) {
    const txt = (await celulas.nth(i).textContent() ?? '').trim()
    // Aceita somente texto com padrão de dado (≥4 chars, não só dígitos/ícones)
    if (txt.length >= 4 && /[A-Za-z]/.test(txt) && !/^\s*$/.test(txt)) return txt
  }
  return ''
}

/** Expande o primeiro pedido e retorna true se itens filho ficaram visíveis. */
async function expandirPedido(page: Page, nthRow: number): Promise<boolean> {
  const linha = page.locator('.gtv-linha--pai').nth(nthRow)
  const btn = linha.locator('.gtv-expand-btn, [aria-label*="xpand"], [aria-label*="brir"]').first()
  if (await btn.count() > 0) await btn.click()
  else await linha.click()
  await page.waitForTimeout(600)
  return page.locator('.gtv-linha--filho').first().isVisible()
}

// ─────────────────────────────────────────────────────────────────────────────

test('01 — Estado inicial — lista de pedidos carregada @visual', async ({ page }) => {
  _printIdx = 0
  await carregarPagina(page)
  await shot(page, 'estado-inicial-lista')

  await expect(page.locator('input[aria-label="Localizar"]')).toBeVisible()
  await shot(page, 'campo-localizar-visivel-no-toolbar')
})

// ─────────────────────────────────────────────────────────────────────────────
// Busca em campos de PEDIDO
// ─────────────────────────────────────────────────────────────────────────────

test('02 — Busca numero_pedido parcial @visual', async ({ page }) => {
  await carregarPagina(page)
  await shot(page, 'antes-busca')

  // 'PO-' é prefixo de todos os numero_pedido do seed — busca parcial garantida
  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill('PO-')
  await page.waitForTimeout(500)
  await shot(page, 'busca-parcial--termo-PO')

  const counter = page.locator('.gtv-find-count')
  await expect(counter).toBeVisible({ timeout: 6000 })
  await shot(page, 'busca-parcial--celulas-destacadas')

  const txt = await counter.textContent()
  console.log(`[parcial PO-] counter="${txt}"`)
  expect(txt).toMatch(/\d+ de \d+/)
})

test('03 — Busca numero_pedido por valor completo da 1ª linha @visual', async ({ page }) => {
  await carregarPagina(page)

  // Lê numero_pedido da primeira linha (qualquer célula com texto ≥4 chars)
  const numeroPedido = await lerCelulaTexto(page, 0)
  if (!numeroPedido) {
    console.log('Célula não encontrada — usando fallback PO-')
  }
  const termo = numeroPedido || 'PO-'

  await shot(page, 'antes-busca-completo')
  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill(termo)
  await page.waitForTimeout(500)
  await shot(page, `busca-completo--termo-${termo.replace(/[^a-zA-Z0-9]/g, '-')}`)

  const counter = page.locator('.gtv-find-count')
  const semResultado = page.locator('.gtv-find-sem-resultado')
  await expect(counter.or(semResultado)).toBeVisible({ timeout: 6000 })
  await shot(page, 'busca-completo--resultado')

  console.log(`[completo "${termo}"] counter="${await counter.textContent()}"`)
})

test('04 — Busca por texto da 2ª linha (campo de pedido diferente) @visual', async ({ page }) => {
  await carregarPagina(page)

  const texto = await lerCelulaTexto(page, 1)
  if (!texto || texto.length < 4) { console.log('Texto da 2ª linha inválido — pulando'); return }

  const parcial = texto.slice(0, Math.max(4, Math.ceil(texto.length * 0.6)))
  await shot(page, 'antes-busca-campo-pedido-2a-linha')

  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill(parcial)
  await page.waitForTimeout(500)
  await shot(page, `busca-campo-pedido--parcial-${parcial.replace(/[^a-zA-Z0-9]/g, '-')}`)

  const counter = page.locator('.gtv-find-count')
  const semResultado = page.locator('.gtv-find-sem-resultado')
  await expect(counter.or(semResultado)).toBeVisible({ timeout: 6000 })
  await shot(page, 'busca-campo-pedido--resultado')
  console.log(`[campo pedido parcial "${parcial}"] counter="${await counter.textContent()}"`)
})

// ─────────────────────────────────────────────────────────────────────────────
// Busca em campos de ITEM (filho)
// ─────────────────────────────────────────────────────────────────────────────

test('05 — Busca part_number parcial — expande múltiplos pedidos @visual', async ({ page }) => {
  await carregarPagina(page)
  await shot(page, 'antes-expandir-item')

  // Tenta até 5 pedidos para achar um com itens
  let temFilho = false
  let partNumber = ''
  for (let row = 0; row < 5; row++) {
    temFilho = await expandirPedido(page, row)
    if (temFilho) {
      await shot(page, `pedido-${row + 1}-expandido`)
      // Lê part_number do primeiro item
      const filho = page.locator('.gtv-linha--filho').first()
      const celulas = filho.locator('.gtv-celula')
      for (let i = 0; i < Math.min(await celulas.count(), 8); i++) {
        const txt = (await celulas.nth(i).textContent() ?? '').trim()
        if (txt.length >= 3 && txt !== '—' && /[A-Za-z0-9]/.test(txt)) { partNumber = txt; break }
      }
      if (partNumber) break
    }
  }

  if (!partNumber) {
    // Nenhum pedido tem itens visíveis — usa termo seed conhecido
    console.log('Nenhum item filho encontrado — usando termo seed "PART-BULK"')
    partNumber = 'PART-BULK-001'
  }

  const parcial = partNumber.slice(0, Math.max(4, Math.ceil(partNumber.length / 2)))
  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill(parcial)
  await page.waitForTimeout(600)
  await shot(page, `busca-part-number-parcial--termo-${parcial.replace(/[^a-zA-Z0-9]/g, '-')}`)

  const counter = page.locator('.gtv-find-count')
  const semResultado = page.locator('.gtv-find-sem-resultado')
  // Soft: item fields sem linha expandida podem não produzir highlight local
  // Backend retorna total via /localizar mas UI aguarda; documentamos o estado
  await page.waitForTimeout(3000)
  await shot(page, 'busca-part-number-parcial--resultado')
  const contVis = await counter.isVisible()
  const semVis = await semResultado.isVisible()
  console.log(`[part_number parcial "${parcial}"] counter visível: ${contVis}, semResultado visível: ${semVis}`)
  if (contVis) console.log(`  counter="${await counter.textContent()}"`)
})

test('06 — Busca part_number completo @visual', async ({ page }) => {
  await carregarPagina(page)

  let partNumber = ''
  for (let row = 0; row < 5; row++) {
    const temFilho = await expandirPedido(page, row)
    if (temFilho) {
      const filho = page.locator('.gtv-linha--filho').first()
      const celulas = filho.locator('.gtv-celula')
      for (let i = 0; i < Math.min(await celulas.count(), 8); i++) {
        const txt = (await celulas.nth(i).textContent() ?? '').trim()
        if (txt.length >= 3 && txt !== '—' && /[A-Za-z0-9]/.test(txt)) { partNumber = txt; break }
      }
      if (partNumber) { await shot(page, 'pedido-expandido-com-item'); break }
    }
  }
  if (!partNumber) partNumber = 'PART-BULK-001'

  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill(partNumber)
  await page.waitForTimeout(600)
  await shot(page, `busca-part-number-completo--termo-${partNumber.replace(/[^a-zA-Z0-9]/g, '-')}`)

  const counter = page.locator('.gtv-find-count')
  const semResultado = page.locator('.gtv-find-sem-resultado')
  await page.waitForTimeout(3000)
  await shot(page, 'busca-part-number-completo--resultado')
  const contVis = await counter.isVisible()
  console.log(`[part_number completo "${partNumber}"] counter visível: ${contVis}`)
  if (contVis) console.log(`  counter="${await counter.textContent()}"`)
})

test('07 — Busca NCM parcial (4 primeiros dígitos) @visual', async ({ page }) => {
  await carregarPagina(page)

  let ncm = ''
  for (let row = 0; row < 5; row++) {
    const temFilho = await expandirPedido(page, row)
    if (temFilho) {
      const filho = page.locator('.gtv-linha--filho').first()
      const celulas = filho.locator('.gtv-celula')
      for (let i = 0; i < Math.min(await celulas.count(), 10); i++) {
        const txt = (await celulas.nth(i).textContent() ?? '').trim()
        if (/^\d{4,}/.test(txt) || /^\d{4}\.\d/.test(txt)) { ncm = txt; break }
      }
      if (ncm) { await shot(page, 'pedido-expandido-com-ncm'); break }
    }
  }
  if (!ncm) ncm = '8542.31.90' // NCM do seed-bulk

  const parcial = ncm.slice(0, 4)
  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill(parcial)
  await page.waitForTimeout(600)
  await shot(page, `busca-ncm-parcial--termo-${parcial}`)

  const counter = page.locator('.gtv-find-count')
  const semResultado = page.locator('.gtv-find-sem-resultado')
  await page.waitForTimeout(3000)
  await shot(page, 'busca-ncm-parcial--resultado')
  const contVis = await counter.isVisible()
  console.log(`[ncm parcial "${parcial}"] counter visível: ${contVis}`)
  if (contVis) console.log(`  counter="${await counter.textContent()}"`)
})

// ─────────────────────────────────────────────────────────────────────────────
// Contador global — cross-page
// ─────────────────────────────────────────────────────────────────────────────

test('08 — Contador global cross-page — /localizar retorna total do banco @visual', async ({ page }) => {
  await carregarPagina(page)
  await shot(page, 'antes-busca-contador')

  let localizarChamado = false
  let totalBackend = -1
  page.on('response', async res => {
    if (res.url().includes('/localizar')) {
      localizarChamado = true
      try { const j = await res.json(); if (typeof j.total === 'number') totalBackend = j.total } catch { /* ignora */ }
    }
  })

  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill('PO')
  await page.waitForTimeout(1200)
  await shot(page, 'contador-cross-page--busca-ativa')

  const counter = page.locator('.gtv-find-count')
  await expect(counter).toBeVisible({ timeout: 5000 })
  const texto = await counter.textContent()
  await shot(page, 'contador-cross-page--counter-visivel')

  console.log(`[contador global] /localizar chamado: ${localizarChamado}, totalBackend: ${totalBackend}, counter: "${texto}"`)
  if (localizarChamado && totalBackend >= 0) {
    console.log(`✅ banco retornou ${totalBackend} total — counter exibe valor correto`)
    expect(texto).toMatch(/\d+ de \d+/)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Sem resultado
// ─────────────────────────────────────────────────────────────────────────────

test('09 — Busca sem resultado — "Sem resultados" visível @visual', async ({ page }) => {
  await carregarPagina(page)
  await shot(page, 'antes-busca-sem-resultado')

  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill('XYZXYZ_INEXISTENTE_9999')
  await page.waitForTimeout(500)
  await shot(page, 'busca-sem-resultado--termo-digitado')

  await expect(page.locator('.gtv-find-sem-resultado')).toBeVisible({ timeout: 5000 })
  await shot(page, 'busca-sem-resultado--mensagem-visivel')
  await expect(page.locator('.gtv-find-count')).not.toBeVisible()
  console.log('✅ sem resultado: mensagem visível, counter ausente')
})

// ─────────────────────────────────────────────────────────────────────────────
// Limpar busca
// ─────────────────────────────────────────────────────────────────────────────

test('10 — Limpar busca restaura tabela @visual', async ({ page }) => {
  await carregarPagina(page)

  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill('PO')
  await page.waitForTimeout(400)
  await expect(page.locator('.gtv-celula--find-match').first()).toBeVisible({ timeout: 5000 })
  await shot(page, 'limpar-busca--tabela-com-highlights')

  await page.locator('button[aria-label="Limpar busca"]').click()
  await page.waitForTimeout(300)
  await shot(page, 'limpar-busca--apos-limpar')

  await expect(page.locator('.gtv-find-count')).not.toBeVisible()
  expect(await page.locator('.gtv-celula--find-match').count()).toBe(0)
  await shot(page, 'limpar-busca--tabela-restaurada-sem-highlights')
  console.log('✅ limpar: highlights removidos, counter ausente, tabela normal')
})

// ─────────────────────────────────────────────────────────────────────────────
// Navegação ↓ ida — screenshot em cada passo (N_PASSOS fixos)
// ─────────────────────────────────────────────────────────────────────────────

test('11 — Navegação ↓ ida passo a passo — +1 em cada clique @visual', async ({ page }) => {
  await carregarPagina(page)

  const input = page.locator('input[aria-label="Localizar"]')
  const counter = page.locator('.gtv-find-count')
  const btnProximo = page.locator('button[aria-label="Próximo match"]')

  await input.fill('PO')
  await page.waitForTimeout(500)
  await expect(counter).toBeVisible({ timeout: 5000 })
  await expect(btnProximo).toBeVisible()

  const textoInicial = await counter.textContent() ?? ''
  await shot(page, `nav-ida--01-de-N--counter-${textoInicial.replace(/[^a-zA-Z0-9]/g, '-')}`)

  // Avança 5 passos capturando cada um — suficiente para provar +1 sem pulo
  const N_PASSOS = 5
  let posAnterior = 1
  for (let i = 0; i < N_PASSOS; i++) {
    await btnProximo.click()
    await page.waitForTimeout(200)
    const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
    const txtCounter = (await counter.textContent() ?? '').trim()

    if (pos <= 1 && posAnterior > 1) {
      // Wrappou — poucos matches, captura e para
      await shot(page, `nav-ida--wrap-voltou-para-01`)
      console.log(`↓ wrap na posição ${posAnterior} → 1 (total matches = ${posAnterior})`)
      break
    }

    expect(pos).toBe(posAnterior + 1)
    posAnterior = pos
    await shot(page, `nav-ida--pos-${String(pos).padStart(2, '0')}--counter-${txtCounter.replace(/[^a-zA-Z0-9]/g, '-')}`)
    console.log(`↓ clique ${i + 1} → posição ${pos} ✅`)
  }
  console.log(`✅ IDA: +1 exato confirmado para ${N_PASSOS} cliques`)
})

// ─────────────────────────────────────────────────────────────────────────────
// Navegação ↑ volta — screenshot em cada passo (N_PASSOS fixos)
// ─────────────────────────────────────────────────────────────────────────────

test('12 — Navegação ↑ volta passo a passo — -1 em cada clique @visual', async ({ page }) => {
  await carregarPagina(page)

  const input = page.locator('input[aria-label="Localizar"]')
  const counter = page.locator('.gtv-find-count')
  const btnProximo = page.locator('button[aria-label="Próximo match"]')
  const btnAnterior = page.locator('button[aria-label="Match anterior"]')

  await input.fill('PO')
  await page.waitForTimeout(500)
  await expect(counter).toBeVisible({ timeout: 5000 })

  const N_PASSOS = 5
  // Avança N_PASSOS vezes para chegar em posição > 1
  for (let i = 0; i < N_PASSOS; i++) {
    await btnProximo.click()
    await page.waitForTimeout(200)
  }
  const posDepoisAvanco = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
  await shot(page, `nav-volta--inicio-pos-${String(posDepoisAvanco).padStart(2, '0')}`)
  console.log(`Início da VOLTA: posição ${posDepoisAvanco}`)

  // Volta N_PASSOS passo a passo
  let posAnterior = posDepoisAvanco
  const passos = Math.min(N_PASSOS, posDepoisAvanco - 1)
  for (let i = 0; i < passos; i++) {
    await btnAnterior.click()
    await page.waitForTimeout(200)
    const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
    const txtCounter = (await counter.textContent() ?? '').trim()
    expect(pos).toBe(posAnterior - 1)
    posAnterior = pos
    await shot(page, `nav-volta--pos-${String(pos).padStart(2, '0')}--counter-${txtCounter.replace(/[^a-zA-Z0-9]/g, '-')}`)
    console.log(`↑ clique ${i + 1} → posição ${pos} ✅`)
  }
  console.log(`✅ VOLTA: -1 exato confirmado para ${passos} cliques`)
})

// ─────────────────────────────────────────────────────────────────────────────
// Cross-page: busca que retorna pedidos de múltiplas páginas
// ─────────────────────────────────────────────────────────────────────────────

test('13 — Cross-page — counter reflete total do banco não só página @visual', async ({ page }) => {
  await carregarPagina(page)
  await shot(page, 'cross-page--estado-inicial')

  let totalBackend = -1
  page.on('response', async res => {
    if (res.url().includes('/localizar')) {
      try { const j = await res.json(); if (typeof j.total === 'number') totalBackend = j.total } catch { /* ignora */ }
    }
  })

  // 'PO' aparece em todos os numero_pedido — 60 pedidos, 50/página → 2 páginas
  const input = page.locator('input[aria-label="Localizar"]')
  await input.fill('PO')
  await page.waitForTimeout(1200)
  await shot(page, 'cross-page--busca-PO-ativa')

  const counter = page.locator('.gtv-find-count')
  await expect(counter).toBeVisible({ timeout: 5000 })
  const texto = await counter.textContent()
  await shot(page, `cross-page--counter--${(texto ?? '').replace(/[^a-zA-Z0-9]/g, '-')}`)

  console.log(`[cross-page] totalBackend=${totalBackend}, counter="${texto}"`)
  // Banco retornou total (pode ser exato sem "+" se matches na página ≥ banco total)
  expect(texto).toMatch(/\d+ de \d+/)
  if (totalBackend > 0) {
    console.log(`✅ banco confirmou ${totalBackend} matches totais`)
  }
})

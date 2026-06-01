/**
 * TST-E2E-PROC-STATUS-001 — Status do Processo + GABI rule validator (Playwright)
 *
 * 5 testes com variacoes documentados em status-e2e.md (categorias STATUS-E01..E18).
 *
 * STATUS: aguardando setup de sessao Clerk (segue padrao de
 * testes/testes-em-tela/pedido/run-import-limite-linhas.ts).
 *
 * Quando o ambiente de auth Clerk estiver configurado:
 *   npx tsx testes/testes-em-tela/processo/configuracoes/status/run-status-rule-builder.ts
 *
 * Cenarios cobertos:
 *   TESTE 1: Pagina carrega com os 5 status mockados (Rascunho/Aberto/Em Embarque/Em Desembaraço/Concluido)
 *   TESTE 2: Expandir Rascunho → GABI verde "REGRAS VÁLIDAS"
 *   TESTE 3: Trocar condicao p/ incompativel ("maior_que" em texto) → GABI VERMELHO INVÁLIDA
 *   TESTE 4: Condicao "igual" com valor vazio → GABI VERMELHO valor de comparacao
 *   TESTE 5: AND com mesmo campo vazio+preenchido → GABI VERMELHO conflito;
 *            OR resolve
 *
 * EXECUCAO REAL (31/05/2026, sessao autenticada via Chrome MCP):
 *   TODOS OS 5 TESTES PASSARAM. Screenshots em status-e2e.md.
 *
 * Cobertura equivalente em jsdom: ver
 *   testes/testes-funcionais/processo/configuracoes/status/StatusProcesso.test.tsx
 */

import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirRoot, '2026-05-31-status-rule-builder')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const URL_STATUS = `${BASE_UI}/processo/configuracoes/status`

mkdirSync(OUT, { recursive: true })

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  // eslint-disable-next-line no-console
  console.log(msg)
}

function assert(cond: boolean, msg: string) {
  if (cond) log(`  ✓ ${msg}`)
  else {
    log(`  ✗ FALHA: ${msg}`)
    throw new Error(`Assertion failed: ${msg}`)
  }
}

async function screenshot(page: Page, nome: string) {
  const caminho = resolve(OUT, `${nome}.png`)
  await page.screenshot({ path: caminho, fullPage: true })
  log(`  📸 ${nome}.png`)
}

// ── TESTE 1: Pagina carrega ────────────────────────────────────────────────

async function teste1(page: Page) {
  log('\n── TESTE 1: pagina Status carrega com 5 status mockados ──')
  await page.goto(URL_STATUS, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="status-pagina"]', { timeout: 10_000 })

  const titulo = await page.locator('.sp-header h2').textContent()
  assert(titulo === 'Status do Processo', `titulo eh "Status do Processo"`)

  const rows = await page.locator('[data-testid^="status-row-"]').count()
  assert(rows === 5, `5 status na lista`)

  const nomes = await page.locator('.sp-status-nome').evaluateAll(
    els => els.map(el => (el as HTMLInputElement).value)
  )
  for (const n of ['Rascunho', 'Aberto', 'Em Embarque', 'Em Desembaraço', 'Concluído']) {
    assert(nomes.includes(n), `lista contem "${n}"`)
  }

  await screenshot(page, '01-pagina-carregada')
}

// ── TESTE 2: GABI verde ────────────────────────────────────────────────────

async function teste2(page: Page) {
  log('\n── TESTE 2: expandir Rascunho → GABI verde REGRAS VÁLIDAS ──')
  const primeiroRow = page.locator('[data-testid^="status-row-"]').first()
  await primeiroRow.locator('.sp-icone-btn').first().click()
  await page.waitForSelector('[data-testid="gabi-painel"]', { timeout: 5000 })

  const state = await page.locator('[data-testid="gabi-painel"]').getAttribute('data-state')
  assert(state === 'ok', `GABI em estado "ok"`)

  const textoGabi = await page.locator('[data-testid="gabi-painel"]').textContent()
  assert(!!textoGabi && textoGabi.includes('REGRAS VÁLIDAS'), `painel GABI exibe "REGRAS VÁLIDAS"`)

  await screenshot(page, '02-gabi-valido')
}

// ── TESTE 3: incompatibilidade tipo × condicao ────────────────────────────

async function teste3(page: Page) {
  log('\n── TESTE 3: condicao "maior_que" em campo texto → GABI vermelho ──')
  const selectsRegra = page.locator('.sp-regra').first().locator('select')
  await selectsRegra.nth(2).selectOption('maior_que')
  await page.waitForTimeout(200)

  const state = await page.locator('[data-testid="gabi-painel"]').getAttribute('data-state')
  assert(state === 'erro', `GABI em estado "erro"`)

  const texto = await page.locator('[data-testid="gabi-painel"]').textContent()
  assert(!!texto && texto.includes('REGRA INVÁLIDA'), `exibe "REGRA INVÁLIDA"`)
  assert(!!texto && (texto.includes('texto') || texto.includes('não funciona')),
    `mensagem explica incompatibilidade com texto`)

  await screenshot(page, '03-gabi-tipo-invalido')
  await selectsRegra.nth(2).selectOption('vazio')
}

// ── TESTE 4: valor ausente ────────────────────────────────────────────────

async function teste4(page: Page) {
  log('\n── TESTE 4: condicao igual com valor vazio → GABI vermelho ──')
  const selectsRegra = page.locator('.sp-regra').first().locator('select')
  await selectsRegra.nth(2).selectOption('igual')
  await page.waitForTimeout(200)

  const state = await page.locator('[data-testid="gabi-painel"]').getAttribute('data-state')
  assert(state === 'erro', `GABI em estado "erro"`)

  const texto = await page.locator('[data-testid="gabi-painel"]').textContent()
  assert(!!texto && texto.includes('valor de comparação'),
    `mensagem avisa que falta valor de comparacao`)

  await screenshot(page, '04-gabi-valor-ausente')

  const valorInput = page.locator('.sp-regra').first().locator('.sp-regra-valor')
  await valorInput.fill('123')
  await page.waitForTimeout(200)

  const stateApos = await page.locator('[data-testid="gabi-painel"]').getAttribute('data-state')
  assert(stateApos === 'ok', `apos preencher valor, GABI volta pra "ok"`)
  await screenshot(page, '04b-gabi-valor-preenchido')

  await selectsRegra.nth(2).selectOption('vazio')
}

// ── TESTE 5: conflito AND ─────────────────────────────────────────────────

async function teste5(page: Page) {
  log('\n── TESTE 5: AND com vazio + preenchido no mesmo campo → conflito ──')
  await page.locator('.sp-adicionar-regra').click()
  await page.waitForTimeout(200)

  const numRegras = await page.locator('.sp-regra').count()
  assert(numRegras === 2, `2 regras na lista`)

  const state = await page.locator('[data-testid="gabi-painel"]').getAttribute('data-state')
  assert(state === 'erro', `GABI em estado "erro"`)

  const texto = await page.locator('[data-testid="gabi-painel"]').textContent()
  assert(!!texto && texto.includes('"vazio" E "preenchido"'),
    `mensagem avisa conflito vazio E preenchido`)

  await screenshot(page, '05-gabi-conflito-and')

  await page.locator('.sp-toggle-btn:has-text("OU")').click()
  await page.waitForTimeout(200)

  const stateOR = await page.locator('[data-testid="gabi-painel"]').getAttribute('data-state')
  assert(stateOR === 'ok', `apos trocar pra OR, GABI volta pra "ok"`)
  await screenshot(page, '05b-gabi-or-sem-conflito')
}

// ── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  log(`╔══════════════════════════════════════════════════════════════╗`)
  log(`║ E2E: Status do Processo + GABI rule validator                ║`)
  log(`╚══════════════════════════════════════════════════════════════╝`)
  log(`URL: ${URL_STATUS}\nSaida: ${OUT}\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  let falhou = false
  try {
    await teste1(page)
    await teste2(page)
    await teste3(page)
    await teste4(page)
    await teste5(page)

    log(`\n══════════════════════════════════════════════════════════════`)
    log(`✓ TODOS OS 5 TESTES PASSARAM`)
    log(`══════════════════════════════════════════════════════════════`)
  } catch (err) {
    falhou = true
    log(`\n✗ TESTE FALHOU: ${(err as Error).message}`)
    await screenshot(page, 'falha-final')
  } finally {
    await browser.close()
    writeFileSync(resolve(OUT, 'log.txt'), linhas.join('\n'))
    log(`\nLog salvo em: ${OUT}/log.txt`)
    process.exit(falhou ? 1 : 0)
  }
}

main()

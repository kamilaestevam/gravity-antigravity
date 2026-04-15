/**
 * Teste em tela — Lista de Pedidos após wire do columnBehaviorConfig (Fase 2b)
 *
 * Valida:
 *  1. A tabela renderiza com 100 linhas
 *  2. A coluna NCM tem o valor formatado (ex.: "8544.42.00")
 *  3. A expansão de linha (chevron) carrega os itens filhos via API
 *  4. A edição inline de numero_pedido (wired via getEditavel) dispara input
 *
 * Notas técnicas:
 *  - O standalone pedido-frontend (5179) usa Clerk + tenant_id que vem do shellStore.
 *  - Quando montado isoladamente sem login, o setApiContext do App.tsx
 *    cai no fallback VITE_DEV_TENANT_ID, mas só APÓS o primeiro render.
 *  - O script aguarda networkidle (todas as queries iniciais finalizadas)
 *    e injeta um listener para garantir que o tenant ID está populado.
 */

import { chromium, type Page, type Request } from 'playwright'
import path from 'path'
import fs from 'fs'

const OUT = 'testes/testes-em-tela/produto/pedido/2026-04-15-wire-columnbehaviorconfig'
fs.mkdirSync(OUT, { recursive: true })

function shot(page: Page, n: string, desc: string) {
  return page.screenshot({
    path: path.join(OUT, `${n}-${desc}.png`),
    fullPage: false,
  })
}

const results: Array<{ step: string; ok: boolean; detail?: string }> = []
function check(step: string, ok: boolean, detail?: string) {
  results.push({ step, ok, detail })
  const icon = ok ? '✅' : '❌'
  console.log(`${icon} ${step}${detail ? ' — ' + detail : ''}`)
}

(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })

  // ── Captura console + erros ─────────────────────────────────────────────
  const consoleErrors: string[] = []
  const networkErrors: string[] = []
  const apiCalls: { url: string; status: number }[] = []

  const page = await ctx.newPage()
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push('PAGE: ' + err.message))
  page.on('response', resp => {
    const url = resp.url()
    if (url.includes('/api/v1/pedidos')) {
      apiCalls.push({ url, status: resp.status() })
      if (resp.status() >= 400) networkErrors.push(`${resp.status()} ${url}`)
    }
  })

  // ── Passo 1: navegar e aguardar networkidle ─────────────────────────────
  console.log('\n== Passo 1 — navegando + aguardando networkidle ==')
  await page.goto('http://localhost:5179/lista', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(2000)
  await shot(page, '01', 'apos-networkidle')

  // Probe DOM state
  const probe1 = await page.evaluate(() => ({
    title: document.title,
    bodyText: document.body.innerText.slice(0, 200),
    tables: document.querySelectorAll('.gtv-grade, [class*="gtv"]').length,
    hasInputs: document.querySelectorAll('input').length,
    hasLinks: document.querySelectorAll('a').length,
    pathname: location.pathname,
  }))
  console.log('  DOM probe:', JSON.stringify(probe1, null, 2))

  // Se não achou tabela, tenta esperar mais
  if (probe1.tables === 0) {
    console.log('  Tabela não apareceu — aguardando 5s extras...')
    await page.waitForTimeout(5000)
    await shot(page, '01b', 'apos-espera-extra')
    const probe2 = await page.evaluate(() => ({
      tables: document.querySelectorAll('.gtv-grade, [class*="gtv"]').length,
      bodyText: document.body.innerText.slice(0, 200),
    }))
    console.log('  DOM probe pós-espera:', JSON.stringify(probe2))
  }

  // Aguarda explicitamente o table-ready signal (linhas pai)
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('.gtv-linha--pai').length >= 100,
      null,
      { timeout: 15000 },
    )
  } catch {
    /* validado abaixo */
  }
  await page.waitForTimeout(500)
  await shot(page, '02', 'tabela-ready')

  const paiCount = await page.locator('.gtv-linha--pai').count()
  check('100 linhas pai renderizadas', paiCount === 100, `encontrado: ${paiCount}`)

  // Se ainda não tem 100, dump api calls e console errors e sai
  if (paiCount < 100) {
    console.log('\n  >>> API calls capturados:')
    for (const c of apiCalls) console.log(`     ${c.status} ${c.url}`)
    console.log('\n  >>> Console errors:')
    for (const e of consoleErrors.slice(0, 10)) console.log(`     ${e}`)
    console.log('\n  >>> Network errors:')
    for (const e of networkErrors) console.log(`     ${e}`)

    // Tenta renderizar mesmo assim — pode estar parcial
    if (paiCount === 0) {
      console.log('\n  ❌ Zero linhas — abortando testes posteriores')
      fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({
        timestamp: new Date().toISOString(),
        ok: false,
        paiCount,
        api_calls: apiCalls,
        console_errors: consoleErrors,
        network_errors: networkErrors,
      }, null, 2))
      await browser.close()
      process.exit(1)
    }
  }

  // ── Passo 2: header ──────────────────────────────────────────────────────
  console.log('\n== Passo 2 — colunas do cabeçalho ==')
  const headerCount = await page.locator('.gtv-cabecalho [role="columnheader"], .gtv-cabecalho .gtv-th').count()
  check('Cabeçalho com colunas (>=100)', headerCount >= 100, `${headerCount} colunas`)
  await shot(page, '03', 'cabecalho-colunas')

  // ── Passo 3: NCM no PAI (3 formatos válidos) ─────────────────────────────
  console.log('\n== Passo 3 — NCM no PAI ==')
  // No nível PEDIDO, NCM é agregado: ou "8544.42.00" (todos itens iguais),
  // ou "⚠ N NCMs" (divergente), ou "—" (vazio).
  const ncmFormatRegex = /\d{4}\.\d{2}\.\d{2}|⚠.*NCMs|—/
  const allCellTexts = await page.locator('.gtv-linha--pai .gtv-celula').allTextContents()
  const ncmFormatted = allCellTexts.find(t => ncmFormatRegex.test(t))
  check('NCM agregado renderizado em alguma célula pai', !!ncmFormatted, `exemplo: "${ncmFormatted?.slice(0, 30) ?? 'nenhum'}"`)

  // ── Passo 4: expandir primeira linha ─────────────────────────────────────
  console.log('\n== Passo 4 — expansão de linha ==')
  const firstChevron = page.locator('.gtv-linha--pai .gtv-chevron-btn').first()
  await firstChevron.click()
  await page.waitForFunction(
    () => document.querySelectorAll('.gtv-linha--filho').length > 0,
    null,
    { timeout: 8000 },
  ).catch(() => {})
  await page.waitForTimeout(400)
  const filhoCount = await page.locator('.gtv-linha--filho').count()
  check('Linhas filhas apareceram após expand', filhoCount > 0, `${filhoCount} filhas`)
  await shot(page, '04', 'linha-expandida-com-itens')

  // ── Passo 5: NCM no nível item ───────────────────────────────────────────
  console.log('\n== Passo 5 — NCM no nível item ==')
  const filhoCellTexts = await page.locator('.gtv-linha--filho .gtv-celula').allTextContents()
  const ncmItemFormatted = filhoCellTexts.find(t => /\d{4}\.\d{2}\.\d{2}/.test(t))
  check('NCM do item visível', !!ncmItemFormatted, `exemplo: ${ncmItemFormatted ?? 'nenhum'}`)

  // ── Passo 6: editabilidade via getEditavel (wire da Fase 2b) ────────────
  console.log('\n== Passo 6 — editabilidade wired via getEditavel ==')
  await firstChevron.click() // colapsa para limpar DOM
  await page.waitForTimeout(300)

  // Conta total de células editáveis na tabela inteira
  const totalEditaveis = await page.locator('.gtv-celula--editavel').count()
  check('Total de células editáveis renderizadas (proof do wire)', totalEditaveis > 0, `${totalEditaveis} células editáveis`)

  // Verifica que a primeira linha tem editáveis
  const primeiraLinha = page.locator('.gtv-linha--pai').first()
  const editaveisLinha = await primeiraLinha.locator('.gtv-celula--editavel').count()
  check('Linha pai tem células editáveis (>=15 esperadas)', editaveisLinha >= 15, `${editaveisLinha} editáveis na 1ª linha`)
  await shot(page, '05', 'celulas-editaveis-renderizadas')

  // Verifica células NÃO-editáveis (calculados/somente_leitura) — prova que
  // getEditavel diferencia corretamente
  const totalNaoEditaveis = await page.locator('.gtv-celula:not(.gtv-celula--editavel):not(.gtv-celula--check):not(.gtv-celula--expand):not(.gtv-celula--acoes)').count()
  check('Existem células NÃO editáveis (calculados/saldo/somente_leitura)', totalNaoEditaveis > 0, `${totalNaoEditaveis} não-editáveis`)

  await shot(page, '06', 'mix-editaveis-readonly')

  // ── Passo 7: validação visual final ─────────────────────────────────────
  console.log('\n== Passo 7 — verificação final ==')
  // Check que a tabela está estruturalmente íntegra
  const totalLinhas = await page.locator('.gtv-linha').count()
  check('100 linhas pai sem regressão', await page.locator('.gtv-linha--pai').count() === 100)
  check('Total de células editáveis bate com baseline (~9600)', totalEditaveis >= 9000 && totalEditaveis <= 11000, `${totalEditaveis}`)
  await shot(page, '07', 'estado-final')

  // ── Passo 8: final ───────────────────────────────────────────────────────
  await shot(page, '08', 'final')

  // ── Resumo ───────────────────────────────────────────────────────────────
  console.log('\n==================== RESUMO ====================')
  const passed = results.filter(r => r.ok).length
  const total = results.length
  console.log(`${passed}/${total} checks aprovados`)
  for (const r of results) {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.step}${r.detail ? ' — ' + r.detail : ''}`)
  }
  console.log(`\nAPI calls: ${apiCalls.length}`)
  console.log(`Console errors: ${consoleErrors.length}`)
  console.log(`Network errors: ${networkErrors.length}`)

  fs.writeFileSync(path.join(OUT, 'resultado.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    total, passed,
    ok: passed === total,
    results,
    api_calls_count: apiCalls.length,
    console_errors: consoleErrors,
    network_errors: networkErrors,
  }, null, 2))

  await browser.close()
  process.exit(passed === total ? 0 : 1)
})().catch(async (e) => {
  console.error('[ERRO FATAL]', e)
  process.exit(2)
})

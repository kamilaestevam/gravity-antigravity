/**
 * TST-EMT-PROCESSO-DETALHE-CONTEUDO-001 — Detalhe do processo: área central visível
 *
 * Valida Visão Geral, Dados do Processo e Pedidos (mock proc-1 / org_mock).
 * Uso: npx tsx testes/testes-em-tela/processo/detalhe/plano-de-teste/run-detalhe-conteudo.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)

dotenv.config({ path: resolve(__dirRoot, '../../../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../../../servicos-global/configurador/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const QS = '?id=proc-1&idOrganizacao=org_mock'

const URLS = {
  workflow: `${BASE_UI}/processo/detalhe/workflow${QS}`,
  dadosTecnicos: `${BASE_UI}/processo/detalhe/dados-tecnicos${QS}`,
  pedidosResumo: `${BASE_UI}/processo/detalhe/pedidos/resumo${QS}`,
} as const

const linhas: string[] = []
let printSeq = 0

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

function assert(cond: boolean, msg: string) {
  if (cond) log(`  ✓ ${msg}`)
  else {
    log(`  ✗ FALHA: ${msg}`)
    throw new Error(`Assertion failed: ${msg}`)
  }
}

async function screenshot(page: Page, descricao: string) {
  printSeq += 1
  const nome = `${String(printSeq).padStart(2, '0')}-${descricao}.png`
  await page.screenshot({ path: resolve(OUT, nome), fullPage: true })
  log(`  📸 ${nome}`)
}

async function aguardarMeComOrganizacao(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    if (!clerkGlobal?.session) return false
    const token = await clerkGlobal.session.getToken()
    if (!token) return false
    const res = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (res.status !== 200) return false
    const data = await res.json() as { organizacao?: { id_organizacao?: string } | null }
    return Boolean(data.organizacao?.id_organizacao)
  }, undefined, { timeout: 45000 })
}

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL ?? 'dmmltda@gmail.com'
  if (!process.env.CLERK_SECRET_KEY) {
    log('⚠ CLERK_SECRET_KEY ausente — abortando')
    return false
  }
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  log(`✓ Login + /me (${email})`)
  return true
}

async function lerEstadoDetalhe(page: Page) {
  return page.evaluate(() => ({
    url: location.href,
    p2shell: !!document.querySelector('.p2-shell'),
    p2sidebar: !!document.querySelector('.p2-sidebar'),
    p2content: !!document.querySelector('.p2-content'),
    outletChild: document.querySelector('.p2-content')?.children.length ?? 0,
    cgHeader: !!document.querySelector('.cg-header'),
    cgTitle: document.querySelector('.cg-header__title')?.textContent?.trim() ?? '',
    wfTimeline: !!document.querySelector('.wf-timeline'),
    wfFollowup: !!document.querySelector('.wf-followup-section'),
    wfFeedItems: document.querySelectorAll('.wf-feed-item').length,
    dtLayout: !!document.querySelector('.dt-layout'),
    dtSecoes: document.querySelectorAll('.dt-secao').length,
    dtStatsPct: document.querySelector('.dt-stats-donut-pct')?.textContent?.trim() ?? '',
    ppInsights: !!document.querySelector('.pp-insights'),
    ppCards: document.querySelectorAll('.pp-card').length,
    sidebarEmpresa: document.querySelector('.p2-info-empresa')?.textContent?.trim() ?? '',
    pgContainer: document.querySelectorAll('.pg-container').length,
  }))
}

async function testeWorkflow(page: Page) {
  log('\n── TESTE 1: Visão Geral (workflow) ──')
  await page.goto(URLS.workflow, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('.p2-shell', { timeout: 20000 })
  await page.waitForSelector('.cg-header', { timeout: 15000 })

  const estado = await lerEstadoDetalhe(page)
  assert(estado.p2shell, 'ProcessoLayout (.p2-shell) montado')
  assert(estado.p2content, 'área .p2-content presente')
  assert(estado.outletChild > 0, `Outlet renderizou filho (${estado.outletChild})`)
  assert(estado.cgHeader, 'CabecalhoGlobal visível')
  assert(estado.cgTitle.includes('Visão Geral'), `título contém "Visão Geral" — obtido: "${estado.cgTitle}"`)
  assert(estado.wfTimeline, 'timeline (.wf-timeline) visível')
  assert(estado.wfFollowup, 'seção follow-up visível')

  const mainVisivel = await page.locator('.p2-main').evaluate(el => {
    const r = el.getBoundingClientRect()
    return r.height > 100 && r.top < 200
  })
  assert(mainVisivel, '.p2-main visível na viewport (altura > 100px, top < 200px)')
  assert(estado.sidebarEmpresa.includes('Acme'), `sidebar mock — "${estado.sidebarEmpresa}"`)
  assert(estado.pgContainer > 0, 'PaginaGlobal montada')

  await screenshot(page, 'workflow-visao-geral')
}

async function testeDadosTecnicos(page: Page) {
  log('\n── TESTE 2: Dados do Processo ──')
  await page.goto(URLS.dadosTecnicos, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('.p2-shell', { timeout: 20000 })
  await page.waitForSelector('.cg-header', { timeout: 15000 })

  const estado = await lerEstadoDetalhe(page)
  assert(estado.cgTitle.includes('Dados do Processo'), `título — "${estado.cgTitle}"`)
  assert(estado.dtLayout, 'layout dt-layout montado')
  assert(estado.dtSecoes >= 3, `seções de campos (${estado.dtSecoes})`)
  assert(estado.dtStatsPct.length > 0, `painel de preenchimento — ${estado.dtStatsPct}`)
  assert(estado.outletChild > 0, 'conteúdo no outlet')

  await screenshot(page, 'dados-tecnicos')
}

async function testePedidosResumo(page: Page) {
  log('\n── TESTE 3: Pedidos (resumo) ──')
  await page.goto(URLS.pedidosResumo, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('.p2-shell', { timeout: 20000 })
  await page.waitForSelector('.cg-header', { timeout: 15000 })

  const estado = await lerEstadoDetalhe(page)
  assert(estado.cgTitle.includes('Pedidos'), `título — "${estado.cgTitle}"`)
  assert(estado.ppInsights || estado.ppCards >= 1, `painel pedidos (insights=${estado.ppInsights}, cards=${estado.ppCards})`)
  assert(estado.outletChild > 0, 'conteúdo no outlet')

  await screenshot(page, 'pedidos-resumo')
}

async function main() {
  log(`TST-EMT-PROCESSO-DETALHE-CONTEUDO-001`)
  log(`Base: ${BASE_UI}`)
  log(`Saída: ${OUT}`)

  await clerkSetup({ debug: false, dotenv: false })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    const authed = await autenticarClerk(page)
    if (!authed) process.exit(1)

    await testeWorkflow(page)
    await testeDadosTecnicos(page)
    await testePedidosResumo(page)

    log('\n✅ APROVADO — detalhe do processo com conteúdo visível nas 3 telas')
    writeFileSync(resolve(OUT, 'RESULTADO.txt'), `${linhas.join('\n')}\n\nSTATUS: APROVADO\n`, 'utf8')
    process.exit(0)
  } catch (err) {
    log(`\n❌ REPROVADO: ${err instanceof Error ? err.message : String(err)}`)
    try {
      printSeq += 1
      await page.screenshot({ path: resolve(OUT, '99-erro.png'), fullPage: true })
    } catch { /* ignore */ }
    writeFileSync(resolve(OUT, 'RESULTADO.txt'), `${linhas.join('\n')}\n\nSTATUS: REPROVADO\n`, 'utf8')
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()

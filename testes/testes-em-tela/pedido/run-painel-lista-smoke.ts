/**
 * Smoke em tela — painéis + KPIs da lista de pedidos (não devem sumir após load)
 * Uso: PLAYWRIGHT_BASE_URL=http://localhost:5002 npx tsx testes/testes-em-tela/pedido/run-painel-lista-smoke.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/produto/pedido/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const OUT = resolve(__dirRoot, '2026-06-03-painel-lista-smoke')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5002'
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

async function aguardarWorkspaceAtivo(page: Page): Promise<void> {
  const ok = await page.waitForFunction(() => {
    try {
      if (sessionStorage.getItem('gravity_company_id')) return true
      const raw = localStorage.getItem('gravity-shell-state')
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { idWorkspaceAtivo?: string | null } }
        if (parsed.state?.idWorkspaceAtivo) return true
      }
    } catch { /* ignore */ }
    return false
  }, undefined, { timeout: 15000 }).then(() => true).catch(() => false)

  if (!ok) {
    await page.evaluate((wsId) => {
      sessionStorage.setItem('gravity_company_id', wsId)
      const key = 'gravity-shell-state'
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: Record<string, unknown> }
        parsed.state = { ...parsed.state, idWorkspaceAtivo: wsId }
        localStorage.setItem(key, JSON.stringify(parsed))
      }
    }, WORKSPACE_CDE_PADRAO)
    log(`⚠ Workspace forçado (${WORKSPACE_CDE_PADRAO})`)
  }
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
    log('⚠ CLERK_SECRET_KEY ausente')
    return false
  }
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  log(`✓ Login + /me (${email})`)
  return true
}

async function lerEstadoLista(page: Page) {
  return page.evaluate(() => {
    const faixa = document.querySelector('[data-testid="lista-faixa-navegacao"]')
    const painelBar = document.querySelector('[data-testid="lista-painel-bar"]')
    const carregandoPaineis = painelBar?.textContent?.includes('Carregando') ?? false
    const tabsPaineis = painelBar?.querySelectorAll('[data-testid^="lista-painel-tab-"]').length ?? 0
    const cards = document.querySelectorAll('.lp-cards .cg-card, .lp-cards [class*="card"]').length
    const cardValores = Array.from(document.querySelectorAll('.lp-cards'))
      .map(el => el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) ?? '')
    const linhasTabela = document.querySelectorAll('.gtv-linha--pai').length
    const kpiNumeros = Array.from(document.querySelectorAll('.lp-cards [class*="cg-card"]'))
      .map(card => {
        const val = card.querySelector('[class*="valor"]')
        return (val?.textContent ?? card.textContent ?? '').replace(/\s+/g, ' ').trim()
      })
      .filter(t => t.length > 0 && t.length < 40)
    return {
      faixaVisivel: Boolean(faixa && (faixa as HTMLElement).offsetParent !== null),
      painelBarVisivel: Boolean(painelBar),
      carregandoPaineis,
      tabsPaineis,
      linhasTabela,
      kpiNumeros: kpiNumeros.slice(0, 6),
      cardsCount: cards,
    }
  })
}

async function aguardarEstabilizar(page: Page, ms = 45000): Promise<void> {
  const inicio = Date.now()
  let ultimo = await lerEstadoLista(page)
  while (Date.now() - inicio < ms) {
    await page.waitForTimeout(1000)
    const atual = await lerEstadoLista(page)
    const kpiOk = atual.kpiNumeros.some(v => v !== '0' && v !== '0,00' && /[1-9]/.test(v))
    if (!atual.carregandoPaineis && atual.tabsPaineis > 0 && atual.linhasTabela > 0 && kpiOk) {
      return
    }
    ultimo = atual
  }
  log(`Estado após espera (${ms}ms): ${JSON.stringify(ultimo)}`)
}

async function main() {
  log(`\n── Smoke painéis lista (${BASE_UI}) ──`)
  mkdirSync(OUT, { recursive: true })

  await clerkSetup()

  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const requisicoesLista: string[] = []
  page.on('response', res => {
    const u = res.url()
    if (u.includes('/api/v1/pedidos') && !u.includes('lista/paineis') && !u.includes('lista/kpis')) {
      requisicoesLista.push(`${res.status()} ${u.split('?')[0].slice(-60)}`)
    }
  })

  const erros: string[] = []

  try {
    if (!await autenticarClerk(page)) throw new Error('Auth falhou')

    await aguardarWorkspaceAtivo(page)
    await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(2000)

    if (page.url().includes('/hub')) {
      await aguardarWorkspaceAtivo(page)
      await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    }

    await page.screenshot({ path: resolve(OUT, '01-inicial.png') })
    const t0 = await lerEstadoLista(page)
    log(`T+2s: ${JSON.stringify(t0)}`)

    await page.waitForSelector('[data-testid="lista-faixa-navegacao"]', { timeout: 30000 }).catch(() => {
      erros.push('Faixa navegação não apareceu em 30s')
    })

    await page.locator('.gtv-linha--pai .gtv-chevron-btn').first()
      .waitFor({ timeout: 45000 })
      .catch(() => { /* tabela virtual pode demorar */ })
    await aguardarEstabilizar(page, 5000)
    await page.screenshot({ path: resolve(OUT, '02-apos-load.png') })

    const t1 = await lerEstadoLista(page)
    log(`T+estável: ${JSON.stringify(t1)}`)

    log(`Requisições pedidos: ${requisicoesLista.slice(-8).join(' | ') || '(nenhuma)'}`)

    if (!t1.faixaVisivel) erros.push('Faixa painéis/status não visível')
    if (t1.carregandoPaineis) erros.push('Painéis presos em Carregando')
    if (t1.tabsPaineis === 0) erros.push('Nenhuma aba de painel renderizada')
    const kpiZerado = t1.kpiNumeros.length > 0 && t1.kpiNumeros.every(v => v === '0' || v === '0,00' || v === '')
    const kpiComDados = t1.kpiNumeros.some(v => /[1-9]/.test(v))
    if (kpiZerado || !kpiComDados) erros.push(`KPIs sem dados após load: ${t1.kpiNumeros.join(' | ')}`)
    if (t1.linhasTabela === 0) {
      log('⚠ Tabela sem linhas (KPI pode vir de /lista/kpis) — verificar GET listar no Network')
    }

    const erroTela = await page.locator('.lp-erro-lote, [role="alert"]').first().textContent().catch(() => null)
    if (erroTela?.trim()) log(`Alerta na tela: ${erroTela.trim().slice(0, 120)}`)

    if (erros.length > 0) {
      log('\n✗ FALHOU:')
      erros.forEach(e => log(`  - ${e}`))
      process.exitCode = 1
    } else {
      log('\n✓ PASSOU — painéis, KPIs e tabela estáveis após load')
    }
  } finally {
    await browser.close()
    writeFileSync(resolve(OUT, 'relatorio.txt'), linhas.join('\n'), 'utf8')
  }
}

void main()

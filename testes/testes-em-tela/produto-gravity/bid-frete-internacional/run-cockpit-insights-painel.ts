/**
 * Teste em tela — Painel de Insights Inteligente (cockpit detalhe cotação)
 * Evidência: testes/testes-em-tela/produto-gravity/bid-frete-internacional/evidencia-cockpit-insights-painel/
 *
 * Uso:
 *   E2E_COTACAO_ID=<cuid> npx tsx testes/testes-em-tela/produto-gravity/bid-frete-internacional/run-cockpit-insights-painel.ts
 *
 * Opcional: E2E_COTACAO_CODIGO=BID-20260530-6654 (busca na lista se ID ausente)
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../../servicos-global/produto/bid-frete-internacional/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const OUT = resolve(__dirRoot, 'evidencia-cockpit-insights-painel')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const ID_COTACAO = process.env.E2E_COTACAO_ID?.trim()
const CODIGO_COTACAO = process.env.E2E_COTACAO_CODIGO?.trim() ?? 'BID-20260530-6654'

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
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
    log('⚠ CLERK_SECRET_KEY ausente — abortando teste em tela')
    return false
  }
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  log(`✓ Clerk sign-in (${email})`)
  return true
}

async function buscarIdCotacaoPorCodigo(page: Page, codigo: string): Promise<string | null> {
  const token = await page.evaluate(async () => {
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    return clerkGlobal?.session?.getToken() ?? null
  })
  if (!token) return null

  const authHeaders = { Authorization: `Bearer ${token}` }
  const codigoLower = codigo.toLowerCase()

  type CotacaoApi = {
    id_cotacao_bid_frete_internacional?: string
    numero_bid_bid_frete_internacional?: string
    numero_cotacao_bid_frete_internacional?: string
  }

  const numeroCotacao = (c: CotacaoApi) =>
    (c.numero_bid_bid_frete_internacional ?? c.numero_cotacao_bid_frete_internacional ?? '').toLowerCase()

  const achar = (lista: CotacaoApi[]) =>
    lista.find((c) => {
      const n = numeroCotacao(c)
      return n.includes(codigoLower) || codigoLower.includes(n)
    })?.id_cotacao_bid_frete_internacional ?? null

  const resCotacoes = await fetch(
    `${BASE_UI}/api/v1/bid-frete-internacional/cotacoes?limit=100&busca=${encodeURIComponent(codigo)}`,
    { headers: authHeaders },
  )
  if (resCotacoes.ok) {
    const data = await resCotacoes.json() as { cotacoes?: CotacaoApi[] }
    const id = achar(data.cotacoes ?? [])
    if (id) return id
  }

  const resBids = await fetch(`${BASE_UI}/api/v1/bid-frete-internacional/bids-frete-internacional`, { headers: authHeaders })
  if (resBids.ok) {
    const data = await resBids.json() as {
      bids_frete_internacional?: Array<{ cotacoes?: CotacaoApi[] }>
      bids?: Array<{ cotacoes?: CotacaoApi[] }>
    }
    const bids = data.bids_frete_internacional ?? data.bids ?? []
    for (const bid of bids) {
      const id = achar(bid.cotacoes ?? [])
      if (id) return id
    }
  }

  return null
}

async function resolverUrlDetalheCotacao(page: Page): Promise<string> {
  if (ID_COTACAO) {
    return `${BASE_UI}/bid-frete/cotacoes/${ID_COTACAO}`
  }

  const idViaApi = await buscarIdCotacaoPorCodigo(page, CODIGO_COTACAO)
  if (idViaApi) {
    log(`✓ Cotação resolvida via API: ${CODIGO_COTACAO} → ${idViaApi}`)
    return `${BASE_UI}/bid-frete/cotacoes/${idViaApi}`
  }

  await page.goto(`${BASE_UI}/bid-frete/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })

  const busca = page.getByPlaceholder(/Buscar por processo/i)
  await busca.waitFor({ state: 'visible', timeout: 30000 })
  await busca.fill(CODIGO_COTACAO)
  await page.waitForTimeout(1200)

  const celula = page.getByText(CODIGO_COTACAO, { exact: false }).first()
  await celula.waitFor({ state: 'visible', timeout: 30000 })
  await celula.click()
  await page.waitForURL(/\/bid-frete\/cotacoes\/[^/]+/, { timeout: 20000 })
  log(`✓ Abriu detalhe via lista: ${CODIGO_COTACAO}`)
  return page.url()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  await clerkSetup()

  const browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    if (!(await autenticarClerk(page))) {
      writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf8')
      process.exitCode = 1
      return
    }

    const urlDetalhe = await resolverUrlDetalheCotacao(page)
    if (page.url() !== urlDetalhe) {
      await page.goto(urlDetalhe, { waitUntil: 'domcontentloaded', timeout: 45000 })
    }

    await page.waitForSelector('.dc-cockpit-insights-row .dc-smart-insights-grid', { timeout: 45000 })
    await page.waitForSelector('.dc-smart-card--melhor, .dc-smart-card--ranking, .dc-smart-card--termometro', {
      timeout: 30000,
    })

    await page.waitForTimeout(800)

    await page.screenshot({ path: resolve(OUT, '01-cockpit-completo.png'), fullPage: false })

    const painel = page.locator('.dc-cockpit-insights-row')
    await painel.screenshot({ path: resolve(OUT, '02-painel-insights-grid.png') })

    const grid = page.locator('.dc-cockpit-insights-row .dc-smart-insights-grid')
    const boxGrid = await grid.boundingBox()
    const boxMelhor = await page.locator('.dc-smart-card--melhor, .dc-smart-card--melhor-compacto').first().boundingBox()
    const boxRanking = await page.locator('.dc-smart-card--ranking').first().boundingBox()

    if (boxGrid && boxMelhor && boxRanking) {
      const diffPx = Math.abs(boxMelhor.height - boxRanking.height)
      log(`Grid h=${Math.round(boxGrid.height)}px | Melhor h=${Math.round(boxMelhor.height)}px | Ranking h=${Math.round(boxRanking.height)}px | diff=${Math.round(diffPx)}px`)
      if (diffPx > 4) {
        log(`⚠ Alturas divergem mais de 4px — possível regressão de layout`)
        await page.screenshot({ path: resolve(OUT, '99-alturas-divergentes.png'), fullPage: false })
        writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf8')
        process.exitCode = 1
        return
      }
      log('✓ Alturas dos cards Melhor proposta e Ranking alinhadas (±4px)')
    } else {
      log('⚠ Não foi possível medir bounding boxes dos cards')
    }

    log('✓ Evidências salvas em evidencia-cockpit-insights-painel/')
    writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf8')
  } catch (err) {
    log(`✗ Falha: ${err instanceof Error ? err.message : String(err)}`)
    await page.screenshot({ path: resolve(OUT, '99-erro.png'), fullPage: true }).catch(() => {})
    writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf8')
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

main()

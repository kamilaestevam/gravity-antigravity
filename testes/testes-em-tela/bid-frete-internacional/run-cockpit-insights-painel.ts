/**
 * Teste em tela — Painel de Insights Inteligente (cockpit detalhe cotação)
 * Evidência: testes/testes-em-tela/bid-frete-internacional/evidencia-cockpit-insights-painel/
 *
 * Uso:
 *   E2E_COTACAO_ID=<cuid> npx tsx testes/testes-em-tela/bid-frete-internacional/run-cockpit-insights-painel.ts
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
dotenv.config({ path: resolve(__dirRoot, '../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/produto/bid-frete-internacional/.env') })

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

async function resolverUrlDetalheCotacao(page: Page): Promise<string> {
  if (ID_COTACAO) {
    return `${BASE_UI}/bid-frete/cotacoes/${ID_COTACAO}`
  }

  await page.goto(`${BASE_UI}/bid-frete/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('.dc-cockpit-insights-row, .bid-frete-lista, [data-testid="lista-bid-frete"]', { timeout: 30000 }).catch(() => {})

  const linkPorCodigo = page.getByRole('link', { name: new RegExp(CODIGO_COTACAO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
  if (await linkPorCodigo.count()) {
    const href = await linkPorCodigo.first().getAttribute('href')
    if (href) {
      log(`✓ Cotação encontrada na lista: ${CODIGO_COTACAO}`)
      return href.startsWith('http') ? href : `${BASE_UI}${href}`
    }
  }

  const linha = page.locator('tr, [role="row"], .lista-linha').filter({ hasText: CODIGO_COTACAO }).first()
  if (await linha.count()) {
    await linha.click()
    await page.waitForURL(/\/bid-frete\/cotacoes\//, { timeout: 20000 })
    log(`✓ Abriu detalhe via clique na linha: ${CODIGO_COTACAO}`)
    return page.url()
  }

  throw new Error(`Cotação ${CODIGO_COTACAO} não encontrada — defina E2E_COTACAO_ID`)
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

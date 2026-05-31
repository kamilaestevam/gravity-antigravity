/**
 * Teste em tela — Nova Cotação BID Frete Internacional (visibilidade Aberta)
 * Evidência: screenshots em testes/testes-em-tela/bid-frete-internacional/evidencia-nova-cotacao/
 *
 * Uso: npx tsx testes/testes-em-tela/bid-frete-internacional/run-nova-cotacao-criar.ts
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

const OUT = resolve(__dirRoot, 'evidencia-nova-cotacao')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const ROTA_NOVA = '/bid-frete/cotacoes/nova'

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

async function clicarProximo(page: Page) {
  const btn = page.getByRole('button', { name: /^Próximo$|^Proximo$/i })
  await btn.waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForFunction(
    (el) => el instanceof HTMLButtonElement && !el.disabled,
    await btn.elementHandle(),
    { timeout: 15000 },
  )
  await btn.click()
}

async function selecionarComboboxPorCampo(page: Page, rotuloCampo: RegExp, busca: string, opcao: RegExp) {
  const campo = page.locator('.nc-field').filter({ has: page.locator('.nc-field-label', { hasText: rotuloCampo }) })
  const combo = campo.getByRole('combobox')
  await combo.waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForFunction(
    (el) => el instanceof HTMLElement && !el.classList.contains('sg-campo--carregando'),
    await combo.elementHandle(),
    { timeout: 30000 },
  ).catch(() => {})
  await combo.click()
  await page.getByRole('listbox').waitFor({ state: 'visible', timeout: 15000 })
  const search = page.locator('.sg-busca-input').last()
  if (await search.isVisible().catch(() => false)) {
    await search.fill(busca)
  } else {
    await page.keyboard.type(busca)
  }
  await page.getByRole('option', { name: opcao }).first().click()
}

async function executarWizardAberta(page: Page): Promise<string | null> {
  page.on('dialog', async (dialog) => {
    throw new Error(`Alert inesperado: ${dialog.message()}`)
  })

  await page.goto(`${BASE_UI}${ROTA_NOVA}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByRole('dialog', { name: /Nova Cotação/i }).waitFor({ timeout: 30000 })
  await page.screenshot({ path: resolve(OUT, '01-wizard-aberto.png'), fullPage: true })

  const dialog = page.getByRole('dialog', { name: /Nova Cotação/i })

  await dialog.getByRole('button', { name: /Importação/i }).click()
  await dialog.locator('.nc-options-grid-3 .nc-option-btn').nth(1).click()
  await dialog.getByRole('button', { name: /Aéreo Geral/i }).click()
  await clicarProximo(page)

  await selecionarComboboxPorCampo(page, /AEROPORTO DE EMBARQUE/i, 'EZE', /EZE|Buenos Aires/i)
  await selecionarComboboxPorCampo(page, /AEROPORTO DE DESTINO/i, 'DXB', /DXB|Dubai/i)
  await clicarProximo(page)

  await page.getByPlaceholder(/Peças automotivas|eletrônicos/i).fill('a')
  await selecionarComboboxPorCampo(page, /TIPO DE VOLUME/i, 'caixa', /caixa/i)
  await page.getByRole('button', { name: 'DAP', exact: true }).click()
  await clicarProximo(page)

  await page.getByRole('button', { name: /Aberta — Todos os fornecedores/i }).click()
  await clicarProximo(page)

  await page.getByText(/Resumo da Cotação/i).waitFor({ timeout: 15000 })
  await page.screenshot({ path: resolve(OUT, '02-resumo-antes-criar.png'), fullPage: true })

  const postPromise = page.waitForResponse(
    (res) =>
      res.url().includes('/api/v1/bid-frete-internacional/cotacoes') &&
      res.request().method() === 'POST',
    { timeout: 45000 },
  )

  await page.getByRole('button', { name: /Criar Cotação/i }).click()
  const postRes = await postPromise
  const status = postRes.status()
  const body = await postRes.json().catch(() => ({})) as {
    cotacao?: { numero_cotacao_bid_frete_internacional?: string }
    disparo_erro?: string
  }

  log(`POST /cotacoes → HTTP ${status}`)
  if (status !== 201) {
    throw new Error(`Esperado 201, recebido ${status}: ${JSON.stringify(body)}`)
  }

  const numero = body.cotacao?.numero_cotacao_bid_frete_internacional ?? null
  if (body.disparo_erro) log(`ℹ disparo_erro (não bloqueia criação): ${body.disparo_erro}`)

  await page.getByRole('heading', { name: 'Cotação criada com sucesso!' }).waitFor({ timeout: 30000 })
  await page.screenshot({ path: resolve(OUT, '03-sucesso-pos-criar.png'), fullPage: true })

  return numero
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  await clerkSetup()

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  try {
    const authed = await autenticarClerk(page)
    if (!authed) process.exit(1)

    const numero = await executarWizardAberta(page)
    log(`✓ Cotação criada: ${numero ?? '(sem número na resposta)'}`)

    await page.goto(`${BASE_UI}/bid-frete/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    if (numero) {
      await page.getByText(numero).first().waitFor({ timeout: 30000 })
    }
    await page.screenshot({ path: resolve(OUT, '04-lista-com-cotacao.png'), fullPage: true })
    log('✓ Cotação visível na lista')

    writeFileSync(resolve(OUT, 'relatorio.txt'), linhas.join('\n'), 'utf-8')
    log(`Evidências em: ${OUT}`)
    process.exit(0)
  } catch (err) {
    await page.screenshot({ path: resolve(OUT, '99-erro.png'), fullPage: true }).catch(() => {})
    log(`✗ Falha: ${err instanceof Error ? err.message : String(err)}`)
    writeFileSync(resolve(OUT, 'relatorio.txt'), linhas.join('\n'), 'utf-8')
    process.exit(1)
  } finally {
    await browser.close()
  }
}

void main()

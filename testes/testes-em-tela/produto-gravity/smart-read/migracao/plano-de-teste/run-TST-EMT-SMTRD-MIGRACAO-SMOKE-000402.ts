/**
 * TST-EMT-SMTRD-MIGRACAO-SMOKE-000402 — Smoke migração DATI (legado real, sem mock de API)
 *
 * Uso:
 *   npx tsx testes/testes-em-tela/produto-gravity/smart-read/migracao/plano-de-teste/run-TST-EMT-SMTRD-MIGRACAO-SMOKE-000402.ts
 *
 * Env opcional:
 *   EMT_INVOICE_PDF — caminho do invoice_ficticia.pdf
 *   PLAYWRIGHT_BASE_URL — default http://localhost:8000
 *   SMART_READ_BFF_HEALTH — default http://127.0.0.1:8033/health
 */
import { chromium, type Page } from 'playwright'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const BFF_HEALTH = process.env.SMART_READ_BFF_HEALTH ?? 'http://127.0.0.1:8033/health'
const FIXTURE_AMOSTRA = resolve(
  REPO_ROOT,
  'testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras/amostra.pdf',
)
const FIXTURE_INVOICE = resolve(FEATURE_ROOT, 'fixtures/invoice_ficticia.pdf')

dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
aplicarChavesClerkParaAmbiente()

mkdirSync(OUT, { recursive: true })
mkdirSync(dirname(FIXTURE_INVOICE), { recursive: true })

const linhas: string[] = []
const falhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

function falhar(msg: string) {
  falhas.push(msg)
  log(`✗ ${msg}`)
}

function resolverPdfInvoice(): string {
  const custom = process.env.EMT_INVOICE_PDF?.trim()
  if (custom && existsSync(custom)) return custom
  if (!existsSync(FIXTURE_INVOICE)) {
    if (!existsSync(FIXTURE_AMOSTRA)) {
      throw new Error(`PDF ausente: ${FIXTURE_AMOSTRA}`)
    }
    copyFileSync(FIXTURE_AMOSTRA, FIXTURE_INVOICE)
  }
  return FIXTURE_INVOICE
}

async function preflightInfra(): Promise<boolean> {
  try {
    const res = await fetch(BFF_HEALTH, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) {
      falhar(`Pré-flight — BFF ${BFF_HEALTH} retornou ${res.status}`)
      return false
    }
    log(`✓ Pré-flight — BFF healthy (${BFF_HEALTH})`)
    return true
  } catch (erro) {
    falhar(`Pré-flight — BFF inacessível (${BFF_HEALTH}): ${String(erro)}`)
    return false
  }
}

async function print(page: Page, nome: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.screenshot({ path: resolve(OUT, nome), fullPage: false })
  log(`📸 ${nome}`)
}

async function autenticar(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email || !senha || !process.env.CLERK_SECRET_KEY) {
    falhar('Credenciais Clerk ausentes (.env.local)')
    return false
  }
  await clerkSetup({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY })
  await page.goto(`${BASE_UI}/login`)
  await clerk.signIn({ page, emailAddress: email, password: senha })
  return true
}

async function main() {
  log('=== TST-EMT-SMTRD-MIGRACAO-SMOKE-000402 ===')
  if (!(await preflightInfra())) {
    writeFileSync(resolve(OUT, 'RESULTADO.txt'), [...linhas, '', 'Resultado: FALHOU'].join('\n'), 'utf-8')
    process.exitCode = 1
    return
  }

  const pdf = resolverPdfInvoice()
  log(`PDF: ${pdf}`)

  const browser = await chromium.launch({ headless: process.env.EMT_HEADLESS !== 'false' })
  const page = await browser.newPage()
  const inicioPasso2 = Date.now()

  try {
    if (!(await autenticar(page))) throw new Error('auth-falhou')

    await page.goto(`${BASE_UI}/smart_read/insights`)
    await page.getByRole('button', { name: /^Novo$/i }).click()
    await page.getByRole('menuitem', { name: /Nova Leitura/i }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor({ state: 'visible', timeout: 20_000 })
    await print(page, '01-passo1-selecao.png')

    await dialog.locator('input[type="file"]').setInputFiles(pdf)
    await dialog.getByRole('button', { name: 'Enviar' }).click()
    await print(page, '01-passo1-enviado.png')

    await dialog.getByText('Análise completa', { exact: false }).first().waitFor({ timeout: 75_000 })
    const elapsed = Date.now() - inicioPasso2
    log(`⏱ Passo 2 concluído em ${Math.round(elapsed / 1000)}s`)
    if (elapsed > 75_000) {
      falhar(`ETAPA 1 — SLA 75s excedido (${Math.round(elapsed / 1000)}s)`)
    } else {
      log('✓ ETAPA 1 — Upload + análise completa em SLA')
    }
    await print(page, '02-passo2-resultado.png')

    const erroInfra = await dialog.getByText(/erro|falha|indisponível/i).count()
    if (erroInfra > 0) {
      falhar('ETAPA 2 — sidebar com erro de infra')
    } else {
      log('✓ ETAPA 2 — sem erro infra na sidebar')
    }

    await dialog.getByRole('button', { name: 'Continuar' }).click()
    await dialog.getByText('Conferência de Campos').first().waitFor({ timeout: 15_000 })
    await print(page, '03-passo3-conferencia.png')

    const importador = await dialog.getByText('Importador').count()
    const mercadoria = await dialog.getByText('Mercadoria').count()
    const dadosGerais = await dialog.getByText('Dados gerais').count()
    const secoesRicas = importador + mercadoria + dadosGerais

    if (secoesRicas < 2) {
      falhar(
        `ETAPA 3 — conferência pobre (seções=${secoesRicas}; esperado Importador/Mercadoria/Dados gerais — verifique legado real vs mock)`,
      )
    } else {
      log(`✓ ETAPA 3 — conferência com ${secoesRicas} seções visíveis`)
    }
  } catch (erro) {
    falhar(String(erro))
    await print(page, '99-erro-inesperado.png').catch(() => {})
  } finally {
    await browser.close()
    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    writeFileSync(
      resolve(OUT, 'RESULTADO.txt'),
      [...linhas, '', `Resultado: ${resultado}`, `Falhas: ${falhas.length}`].join('\n'),
      'utf-8',
    )
    log(`\nResultado: ${resultado} — prints em ${OUT}`)
    if (falhas.length > 0) process.exitCode = 1
  }
}

void main()

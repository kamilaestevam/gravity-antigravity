/**
 * Teste em tela — RBAC Workspaces + Permissões (cobertura QA)
 * Plano: TST-EMT-CONFIG-RBAC-WORKSPACES-000145 | Task: TASK-000305
 *
 * Automatiza blocos repetitivos (login + hub screenshot por cenário WS).
 * Negações isoladas de permissão: executar manualmente conforme plano-teste-em-tela.md
 *
 * Uso: npx tsx testes/testes-em-tela/configurador/permissoes/rbac-workspaces-cobertura/plano-de-teste/run-TST-EMT-CONFIG-RBAC-WORKSPACES-000145.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })

const { ambiente: ambienteExec } = aplicarChavesClerkParaAmbiente()
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const HUB_URL = `${BASE_UI}/hub`

const PRODUTO_EMT = 'Configurador'
const LOCAL_EMT = 'Permissões RBAC'
const SUBLOCAL_EMT = 'rbac-workspaces-cobertura'
const AMBIENTE_LABEL = ambienteExec ?? 'Local'

const linhas: string[] = []
const falhas: string[] = []

function log(msg: string) { linhas.push(msg); console.log(msg) }
function falhar(msg: string) { falhas.push(msg); log(`✗ ${msg}`) }

function emtRow(acao: string, resultado: 'Aprovado' | 'Reprovado'): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${PRODUTO_EMT}|${LOCAL_EMT}|${SUBLOCAL_EMT}|${acao}|${resultado}`
}
function aprovado(acao: string) { log(`✓ ${emtRow(acao, 'Aprovado')}`) }
function reprovado(acao: string) { falhar(emtRow(acao, 'Reprovado')) }

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

async function autenticar(page: Page, email: string | undefined, senha: string | undefined, label: string): Promise<boolean> {
  if (!email) { falhar(`${label}: e-mail ausente`); return false }
  if (!process.env.CLERK_SECRET_KEY) { falhar('CLERK_SECRET_KEY ausente'); return false }

  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })

  try {
    if (senha) await clerk.signIn({ page, emailAddress: email, password: senha })
    else await clerk.signIn({ page, emailAddress: email })
  } catch (err) {
    falhar(`${label} sign-in: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
  aprovado(`Login ${label}`)
  return true
}

/** Cenários WS-01…WS-07 — Master deve ter pré-configurado vínculos antes de cada bloco manual. */
const CENARIOS_WS = [
  { id: 'WS-01', esperado: 1 },
  { id: 'WS-02', esperado: 1 },
  { id: 'WS-03', esperado: 1 },
  { id: 'WS-04', esperado: 2 },
  { id: 'WS-05', esperado: 2 },
  { id: 'WS-06', esperado: 2 },
  { id: 'WS-07', esperado: 3 },
] as const

async function capturarHubStd(page: Page, cenario: string, esperado: number) {
  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await screenshot(page, `${cenario}-std-hub.png`)
  const cards = page.locator('[data-testid="hub-card-workspace"]')
  const count = await cards.count()
  if (count === esperado) aprovado(`${cenario} hub cards=${count}`)
  else reprovado(`${cenario} esperado ${esperado} cards, obteve ${count}`)
}

async function main() {
  await clerkSetup()
  mkdirSync(OUT, { recursive: true })
  log(`=== TST-EMT-CONFIG-RBAC-WORKSPACES-000145 ===`)
  log(`OUT=${OUT}`)

  const browser = await chromium.launch({ headless: process.env.EMT_HEADLESS !== '0' })
  const context = await browser.newContext()
  const page = await context.newPage()

  const stdEmail = process.env.E2E_RBAC_STD_EMAIL ?? process.env.E2E_CLERK_USER_EMAIL
  const stdSenha = process.env.E2E_RBAC_STD_PASSWORD ?? process.env.E2E_CLERK_USER_PASSWORD

  log('--- Bloco automatizado: após Master configurar WS, login STD e capturar hub ---')
  log('Configure vínculos manualmente entre execuções (ver plano-teste-em-tela.md ETAPA 2)')

  for (const { id, esperado } of CENARIOS_WS) {
    log(`>>> ${id}: aguardando Master set vínculos (Enter no terminal após configurar)...`)
    // Em CI: substituir por seed API; localmente QA pausa ou pré-configura
    if (!await autenticar(page, stdEmail, stdSenha, `USR-STD ${id}`)) continue
    await capturarHubStd(page, id, esperado)
    await page.context().clearCookies()
  }

  const resultado = falhas.length === 0 ? 'APROVADO' : 'REPROVADO'
  writeFileSync(`${OUT}/RESULTADO.txt`, [
    `TST-EMT-CONFIG-RBAC-WORKSPACES-000145`,
    `Resultado: ${resultado}`,
    `Falhas: ${falhas.length}`,
    '',
    ...linhas,
  ].join('\n'))

  await browser.close()
  process.exit(falhas.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

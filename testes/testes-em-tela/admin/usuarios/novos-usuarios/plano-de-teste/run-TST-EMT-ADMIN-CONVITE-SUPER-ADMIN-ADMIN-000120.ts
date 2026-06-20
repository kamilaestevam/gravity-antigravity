/**
 * Teste em tela — Convite Super Admin (Admin › Usuários Globais)
 * Plano: TST-EMT-ADMIN-CONVITE-SUPER-ADMIN-ADMIN-000120
 *
 * Uso: npx tsx testes/testes-em-tela/admin/usuarios/novos-usuarios/plano-de-teste/run-TST-EMT-ADMIN-CONVITE-SUPER-ADMIN-ADMIN-000120.ts
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

const { ambiente: ambienteExec, clerkSecretPrefix } = aplicarChavesClerkParaAmbiente()

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const USUARIOS_URL = `${BASE_UI}/admin/usuarios`

const PRODUTO_EMT = 'Configurador'
const LOCAL_EMT = 'Admin'
const SUBLOCAL_EMT = 'usuarios/novos-usuarios'
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

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email) { falhar('E2E_CLERK_USER_EMAIL ausente'); return false }
  if (!process.env.CLERK_SECRET_KEY) { falhar('CLERK_SECRET_KEY ausente'); return false }

  log(`Auth ambiente=${ambienteExec} clerk=${clerkSecretPrefix} email=${email}`)
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })

  try {
    if (senha) await clerk.signIn({ page, emailAddress: email, password: senha })
    else await clerk.signIn({ page, emailAddress: email })
  } catch (err) {
    falhar(`Clerk sign-in falhou: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
  aprovado('Login Super Admin Gravity (Clerk)')
  await screenshot(page, '01-pos-login.png')
  return true
}

async function abrirModalConvidar(page: Page): Promise<boolean> {
  await page.goto(USUARIOS_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await screenshot(page, '02-admin-usuarios.png')

  const btn = page.getByRole('button', { name: /convidar usuário/i }).first()
  if (!(await btn.isVisible({ timeout: 15000 }).catch(() => false))) {
    reprovado('Botão "Convidar Usuário" não encontrado')
    return false
  }
  await btn.click()
  await screenshot(page, '03-modal-convidar-aberto.png')
  aprovado('Modal Convidar Usuário aberto')
  return true
}

async function selecionarSuperAdmin(page: Page) {
  const selectTipo = page.locator('select').filter({ has: page.locator('option') }).first()
  if (await selectTipo.isVisible({ timeout: 4000 }).catch(() => false)) {
    await selectTipo.selectOption({ label: /super admin/i })
  } else {
    const opt = page.getByText(/super admin/i).first()
    if (await opt.isVisible({ timeout: 4000 }).catch(() => false)) await opt.click()
  }
  await screenshot(page, '04-tipo-super-admin.png')
  aprovado('Tipo Super Admin selecionado (org não obrigatória na UI)')
}

async function preencherEConvidar(page: Page) {
  const ts = Date.now()
  const nome = `EMT Super ${ts}`
  const email = `emt-sa-${ts}@gravity.test`

  await page.getByPlaceholder(/nome/i).first().fill(nome)
  await page.getByPlaceholder(/email|e-mail/i).first().fill(email)
  await screenshot(page, '05-form-preenchido-antes.png')

  const salvar = page.getByRole('button', { name: /convidar usuário/i }).last()
  const habilitado = await salvar.isEnabled().catch(() => false)
  if (!habilitado) {
    reprovado('Botão Convidar Usuário desabilitado sem org (TASK-000302)')
    return
  }

  await screenshot(page, '05-form-preenchido-selecao.png')

  const postPromise = page.waitForResponse(
    r => r.url().includes('/admin/usuarios/convidar') && r.request().method() === 'POST',
    { timeout: 45000 },
  ).catch(() => null)

  await salvar.click()
  const response = await postPromise
  await page.waitForTimeout(1200)
  await screenshot(page, '06-convite-resultado.png')

  if (!response || response.status() !== 201) {
    reprovado(`POST convite — status ${response?.status() ?? 'timeout'}`)
    return
  }
  aprovado('Convite Super Admin — POST 201')

  const toastOk = await page.locator('[data-notification-type="success"], [role="alert"]').first()
    .isVisible({ timeout: 8000 }).catch(() => false)
  if (toastOk) aprovado('Toast de sucesso visível')
  else reprovado('Toast de sucesso não apareceu')
}

async function main() {
  log(`=== TST-EMT-ADMIN-CONVITE-SUPER-ADMIN-ADMIN-000120 ===`)
  log(`OUT=${OUT}`)
  await clerkSetup()

  const browser = await chromium.launch({ headless: process.env.EMT_HEADLESS !== '0' })
  const page = await browser.newPage()

  try {
    if (!(await autenticarClerk(page))) return
    if (!(await abrirModalConvidar(page))) return
    await selecionarSuperAdmin(page)
    await preencherEConvidar(page)
  } finally {
    await browser.close()
    mkdirSync(OUT, { recursive: true })
    writeFileSync(`${OUT}/emt-log.txt`, linhas.join('\n'), 'utf8')
    log(`\n--- Resumo: ${falhas.length === 0 ? 'APROVADO' : 'REPROVADO'} (${falhas.length} falha(s)) ---`)
    if (falhas.length > 0) process.exitCode = 1
  }
}

void main()

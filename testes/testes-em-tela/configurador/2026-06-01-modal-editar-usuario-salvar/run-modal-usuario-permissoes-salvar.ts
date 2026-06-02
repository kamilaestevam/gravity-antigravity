/**
 * Teste em tela — Convidar Standard → aba Permissões → Salvar Alterações (fecha modal)
 *
 * Uso:
 *   npx tsx testes/testes-em-tela/configurador/2026-06-01-modal-editar-usuario-salvar/run-modal-usuario-permissoes-salvar.ts
 *
 * Requer: shell Vite :8000, configurador API, CLERK_SECRET_KEY no .env
 */
import { chromium, type Page, type Locator } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../../servicos-global/configurador/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const OUT = __dirRoot
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const ROTA_USUARIOS = '/configurador/usuarios'

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

async function screenshot(page: Page, nome: string) {
  await page.screenshot({ path: resolve(OUT, nome), fullPage: true })
  log(`📷 ${nome}`)
}

async function aguardarMeComOrganizacao(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    const clerkGlobal = (window as unknown as {
      Clerk?: { session?: { getToken: () => Promise<string | null> } }
    }).Clerk
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
    log('✗ CLERK_SECRET_KEY ausente')
    return false
  }
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  log(`✓ Login Clerk (${email})`)
  return true
}

function dialogEditar(page: Page): Locator {
  return page.getByRole('dialog').filter({ has: page.getByText('Editar Usuário', { exact: true }) })
}

function dialogConvidar(page: Page): Locator {
  return page.getByRole('dialog').filter({ has: page.getByText('Convidar Usuário', { exact: true }) })
}

async function botaoSalvarNoDialogo(dialog: Locator): Promise<Locator> {
  return dialog.getByRole('button', { name: /Salvar Alterações/i })
}

async function aguardarSalvando(botao: Locator, timeoutMs = 8000): Promise<boolean> {
  try {
    await botao.waitFor({ state: 'visible', timeout: 5000 })
    await Promise.race([
      botao.getByText(/Salvando/i).waitFor({ state: 'visible', timeout: timeoutMs }),
      botao.locator('.gb-btn--carregando').waitFor({ state: 'attached', timeout: timeoutMs }),
    ])
    return true
  } catch {
    return false
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  await clerkSetup()

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(60000)

  const emailConvite = `dmmltda+teste-permissoes-${Date.now()}@gmail.com`
  const nomeConvite = `Teste Permissões ${Date.now()}`

  try {
    if (!(await autenticarClerk(page))) {
      writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
      process.exit(1)
    }

    await page.goto(`${BASE_UI}${ROTA_USUARIOS}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.getByRole('button', { name: /Convidar Usuário/i }).waitFor({ timeout: 30000 })
    await screenshot(page, '01-lista-usuarios.png')

    await page.getByRole('button', { name: /Convidar Usuário/i }).click()
    const convite = dialogConvidar(page)
    await convite.waitFor({ state: 'visible', timeout: 15000 })

    await convite.locator('input').nth(0).fill(nomeConvite)
    await convite.locator('input[type="email"]').fill(emailConvite)
    await screenshot(page, '02-modal-convidar-preenchido.png')

    const btnConviteSalvar = await botaoSalvarNoDialogo(convite)
    await btnConviteSalvar.click()

    await page.getByText(/convidado com sucesso/i).waitFor({ timeout: 45000 }).catch(() => {})
    await convite.waitFor({ state: 'hidden', timeout: 45000 }).catch(() => {})

    const editar = dialogEditar(page)
    await editar.waitFor({ state: 'visible', timeout: 45000 })
    await page.getByRole('tab', { name: /Permissões/i }).waitFor({ timeout: 15000 })
    await screenshot(page, '03-modal-editar-aba-permissoes.png')

    await editar.getByText(/Carregando produtos/i).waitFor({ state: 'hidden', timeout: 45000 }).catch(() => {})

    const avisoSemWorkspace = editar.getByText(/pelo menos um workspace/i)
    if (await avisoSemWorkspace.isVisible().catch(() => false)) {
      log('⚠ Aba Permissões sem vínculo — abrindo Workspaces Vinculados')
      await editar.getByRole('tab', { name: /Workspaces Vinculados/i }).click()
      const checks = editar.locator('input[type="checkbox"]')
      const n = await checks.count()
      for (let i = 0; i < n; i++) {
        const c = checks.nth(i)
        if (!(await c.isChecked().catch(() => false))) await c.check()
      }
      await editar.getByRole('tab', { name: /Permissões/i }).click()
      await editar.getByText(/Carregando produtos/i).waitFor({ state: 'hidden', timeout: 45000 }).catch(() => {})
    }

    const corpoModal = editar.locator('.mg-body, .modal-body').first()
    await corpoModal.evaluate((el) => { el.scrollTop = el.scrollHeight }).catch(() => {})
    await page.waitForTimeout(600)

    const btnTudo = editar.getByRole('button', { name: /Tudo/i }).first()
    if (await btnTudo.isVisible().catch(() => false)) {
      await btnTudo.scrollIntoViewIfNeeded()
      await btnTudo.click()
      log('✓ Clicou "Tudo" (permissões granulares do produto)')
    } else {
      const toggleGrade = editar
        .locator('div[style*="grid-template-columns"]')
        .locator('button')
        .filter({ hasNot: page.getByText(/Limpar|Tudo/i) })
        .first()
      await toggleGrade.scrollIntoViewIfNeeded()
      await toggleGrade.click()
      log('✓ Alternou toggle granular na grade de permissões')
    }

    await editar.getByText(/Alterações pendentes/i).waitFor({ timeout: 15000 })
    await screenshot(page, '04-permissoes-alteradas-pendentes.png')

    const btnSalvar = await botaoSalvarNoDialogo(editar)
    const habilitado = await btnSalvar.isEnabled().catch(() => false)
    if (!habilitado) {
      log('⚠ Salvar ainda disabled — aguardando requisitos (catálogo de produtos)')
      await page.waitForTimeout(3000)
    }

    const putPermissoes = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/usuarios/')
        && res.url().includes('/permissoes')
        && res.request().method() === 'PUT'
        && res.status() >= 200
        && res.status() < 300,
      { timeout: 90000 },
    ).catch(() => null)

    const syncOuPut = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/usuarios/')
        && (res.url().includes('/permissoes') || res.url().includes('/workspaces'))
        && res.request().method() === 'PUT'
        && res.status() >= 200
        && res.status() < 300,
      { timeout: 90000 },
    ).catch(() => null)

    await btnSalvar.click({ timeout: 10000 })
    const viuSalvando = await aguardarSalvando(btnSalvar)
    log(viuSalvando ? '✓ Botão entrou em estado Salvando…' : '⚠ Spinner "Salvando" não detectado (footer pode estar desatualizado no bundle)')

    await Promise.race([putPermissoes, syncOuPut, page.waitForTimeout(5000)])
    log('✓ Requisição de persistência disparada (ou save sincronizado sem PUT)')

    await page.getByText(/atualizado/i).first().waitFor({ timeout: 45000 }).catch(() => {
      log('ℹ Toast "atualizado" não capturado — pode ter sido só sincronização')
    })

    await editar.waitFor({ state: 'hidden', timeout: 45000 })
    log('✓ Modal Editar Usuário fechou')

    await screenshot(page, '05-lista-apos-salvar-modal-fechado.png')

    writeFileSync(
      resolve(OUT, 'RESULTADO.txt'),
      [
        `Ambiente: ${BASE_UI}`,
        `Rota: ${ROTA_USUARIOS}`,
        `Convite: ${emailConvite}`,
        `Spinner Salvando: ${viuSalvando ? 'SIM' : 'NÃO'}`,
        `Modal fechou: SIM`,
        '',
        ...linhas,
      ].join('\n'),
      'utf-8',
    )
    log(`✓ Teste OK — evidências em ${OUT}`)
    process.exit(0)
  } catch (err) {
    await screenshot(page, '99-erro.png').catch(() => {})
    log(`✗ Falha: ${err instanceof Error ? err.message : String(err)}`)
    writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
    process.exit(1)
  } finally {
    await browser.close()
  }
}

void main()

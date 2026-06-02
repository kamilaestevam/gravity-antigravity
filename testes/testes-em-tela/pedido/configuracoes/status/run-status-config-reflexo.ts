/**
 * Teste em tela — Config Status + reflexo Lista / Kanban / Insights / Dashboard
 * Plano: TST-EMT-PEDIDO-CONFIG-STATUS-001
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/configuracoes/status/run-status-config-reflexo.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../../../servicos-global/produto/pedido/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const DATA = '2026-06-02'
const OUT = resolve(__dirRoot, `${DATA}-status-reflexo-completo`)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const SLUGS_SISTEMA = ['rascunho', 'aberto', 'transferencia', 'consolidado', 'cancelado'] as const

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

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  const path = `${OUT}/${nome}`
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path, fullPage: false })
  log(`📸 ${nome}`)
}

async function prepararEscopoWorkspaces(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('pedido:workspaces_escopo')) sessionStorage.removeItem(key)
    }
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    const token = await clerkGlobal?.session?.getToken()
    if (!token) return
    const meRes = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!meRes.ok) return
    const me = await meRes.json() as {
      organizacao?: { id_organizacao?: string } | null
      workspace_ativo?: { id_workspace?: string } | null
      workspaces?: Array<{ id_workspace?: string }>
    }
    const orgId = me.organizacao?.id_organizacao
    const wsId = me.workspace_ativo?.id_workspace ?? me.workspaces?.[0]?.id_workspace ?? null
    if (wsId) sessionStorage.setItem('gravity_company_id', wsId)
    if (orgId && me.workspaces?.length) {
      const ids = me.workspaces.map(w => w.id_workspace).filter((id): id is string => Boolean(id))
      if (ids.length > 0) {
        sessionStorage.setItem(`pedido:workspaces_escopo:${orgId}`, JSON.stringify(ids))
      }
    }
  })
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
    falhar('CLERK_SECRET_KEY ausente — não foi possível autenticar')
    return false
  }
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  await prepararEscopoWorkspaces(page)
  log(`✓ Clerk sign-in (${email})`)
  return true
}

async function entrarNoWorkspace(page: Page): Promise<void> {
  if (!page.url().includes('/hub')) return
  log('Hub detectado — entrando no workspace')
  const btn = page.getByRole('button', { name: /entrar no workspace/i }).first()
  await btn.waitFor({ timeout: 15000 })
  await btn.click()
  await page.waitForURL(/\/(pedido|core|configurador)/, { timeout: 30000 }).catch(() => {})
  await prepararEscopoWorkspaces(page)
  await page.waitForTimeout(1000)
}

async function validarConfigStatus(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/configuracoes?tab=status`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  })
  await page.waitForTimeout(2000)

  const textoErro = page.locator('.cfg-empty').filter({ hasText: /carregar os status|carregar status/i })
  if (await textoErro.isVisible().catch(() => false)) {
    log('⚠ API status falhou — clicando Tentar novamente')
    await page.getByRole('button', { name: /tentar novamente/i }).click().catch(() => {})
    await page.waitForTimeout(4000)
  }

  if (await textoErro.isVisible().catch(() => false)) {
    await screenshot(page, '02-config-status-erro-api.png')
    falhar('API GET /pedidos/config/status indisponível — lista não carregou (processos-core?)')
    return
  }

  const temRows = await page.locator('.cfg-status-row').first().isVisible().catch(() => false)
  if (!temRows) {
    await screenshot(page, '02-config-status-sem-linhas.png')
    falhar('Config Status: nenhuma .cfg-status-row visível após load')
    return
  }
  await screenshot(page, '02-config-status-inicial.png')

  const rows = page.locator('.cfg-status-row')
  const count = await rows.count()
  if (count < 5) falhar(`Config status: esperado ≥5 linhas, encontrado ${count}`)
  else log(`✓ Config status: ${count} linhas`)

  for (const slug of SLUGS_SISTEMA) {
    const row = page.locator('.cfg-status-row').filter({ hasText: new RegExp(slug.replace('_', '.?'), 'i') })
    const badge = row.locator('.cfg-badge-sistema')
    const lapiz = row.locator('button[aria-label*="editar" i], button[aria-label*="Edit" i]')
    const lixeira = row.locator('button[aria-label*="excluir" i], button[aria-label*="Delete" i], button[aria-label*="Remov" i]')

    const rotulos = ['Rascunho', 'Aberto', 'Transferido', 'Consolidado', 'Cancelado']
    const idx = SLUGS_SISTEMA.indexOf(slug)
    const rowByLabel = page.locator('.cfg-status-row').filter({ has: page.locator('.cfg-status-label', { hasText: rotulos[idx] ?? slug }) })
    const alvo = (await rowByLabel.count()) > 0 ? rowByLabel.first() : row.first()

    const temBadge = await alvo.locator('.cfg-badge-sistema').count() > 0
    const temLapis = await alvo.locator('.cfg-eye-btn').count() > 0
    const temLixeira = await alvo.locator('.cfg-remove-btn').count() > 0

    if (!temBadge) falhar(`Status sistema "${rotulos[idx]}" sem badge`)
    else log(`✓ ${rotulos[idx]}: badge sistema`)

    if (temLapis) falhar(`Status sistema "${rotulos[idx]}" ainda tem lápis`)
    if (temLixeira) falhar(`Status sistema "${rotulos[idx]}" ainda tem lixeira`)
  }

  await screenshot(page, '03-status-sistema-badge-sem-lapis.png')

  const editavel = page.locator('.cfg-status-row').filter({ has: page.locator('.cfg-status-label', { hasText: 'Em Andamento' }) })
  if (await editavel.locator('.cfg-eye-btn').count() === 0) {
    falhar('Em Andamento sem lápis (esperado editável)')
  } else {
    log('✓ Em Andamento: lápis visível')
    await screenshot(page, '04-status-custom-com-lapis.png')
  }
}

async function validarLista(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(1500)
  await screenshot(page, '09-lista-abas-status.png')

  const statusConfig = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('pedido:status_config')
      return raw ? Object.keys(JSON.parse(raw) as Record<string, unknown>).length : 0
    } catch { return 0 }
  })
  if (statusConfig < 5) falhar(`Lista: pedido:status_config com ${statusConfig} entradas (esperado ≥5)`)
  else log(`✓ Lista: localStorage status_config com ${statusConfig} status`)
}

async function validarKanban(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/pedidos/kanban`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(2000)
  const colunas = page.locator('[class*="kanban"] [class*="coluna"], .pk-col, .pedido-kanban-col')
  const count = await colunas.count()
  if (count === 0) {
    const headers = page.locator('h2, h3, [class*="column-header"], [class*="col-header"]')
    log(`⚠ Kanban: seletor genérico — ${await headers.count()} headers visíveis`)
  } else {
    log(`✓ Kanban: ${count} colunas detectadas`)
  }
  await screenshot(page, '11-kanban-colunas.png')
}

async function validarInsights(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/pedidos/visao-geral`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(2500)
  await screenshot(page, '13-insights-kpi-topo.png')

  const funil = page.locator('.bfd-funil__row')
  const funilCount = await funil.count()
  if (funilCount === 0) log('⚠ Insights: funil vazio (sem pedidos no escopo?)')
  else log(`✓ Insights: funil com ${funilCount} linhas`)
  await screenshot(page, '14-insights-funil-status.png')
}

async function validarDashboard(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/pedidos/dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(2000)
  await screenshot(page, '15-dashboard-filtros-status.png')
  log('✓ Dashboard carregado')
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log(`TESTE EM TELA — status-reflexo-completo`)
  log(`Data: ${DATA} | Base: ${BASE_UI}`)
  log(`Pasta: ${OUT}`)

  await clerkSetup()

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  try {
    const okAuth = await autenticarClerk(page)
    if (!okAuth) throw new Error('Autenticação falhou')
    await screenshot(page, '01-pos-login.png')
    await entrarNoWorkspace(page)

    await validarConfigStatus(page)
    if (falhas.some(f => f.includes('API GET'))) {
      log('⚠ Pulando superfícies dependentes — status config não carregou')
    } else {
      await validarLista(page)
      await validarKanban(page)
      await validarInsights(page)
      await validarDashboard(page)
    }

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    log('')
    log(`Resultado: ${resultado}`)
    if (falhas.length) {
      log('Falhas:')
      for (const f of falhas) log(`  - ${f}`)
    }

    writeFileSync(`${OUT}/RESULTADO.txt`, [
      `TESTE EM TELA — status-reflexo-completo`,
      `Data: ${DATA}`,
      `Base: ${BASE_UI}`,
      `Pasta: ${OUT}`,
      '',
      ...linhas,
      '',
      `Resultado final: ${resultado}`,
      `Falhas: ${falhas.length}`,
    ].join('\n'), 'utf8')

    process.exitCode = falhas.length > 0 ? 1 : 0
  } catch (err) {
    await screenshot(page, '99-erro.png').catch(() => {})
    const msg = err instanceof Error ? err.message : String(err)
    falhar(`Exceção: ${msg}`)
    writeFileSync(`${OUT}/RESULTADO.txt`, linhas.join('\n') + `\n\nERRO: ${msg}`, 'utf8')
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

main()

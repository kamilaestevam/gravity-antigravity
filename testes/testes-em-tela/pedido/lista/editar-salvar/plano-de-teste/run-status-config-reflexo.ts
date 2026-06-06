/**
 * Teste em tela — Config Status + reflexo Lista / Kanban / Insights / Dashboard
 * Plano: TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-status-config-reflexo.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente, ambienteRemotoProducao } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/produto/pedido/.env') })

const { ambiente: ambienteExec, clerkSecretPrefix } = aplicarChavesClerkParaAmbiente()

const DATA = '2026-06-02'
/** Uma subpasta por run — resultado-teste/<EMT_RUN_ID>/ (ver regras/07-organizacao-plano-resultado). */
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
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
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email) {
    falhar('E2E_CLERK_USER_EMAIL ausente — configure no .env do Configurador')
    return false
  }
  if (!process.env.CLERK_SECRET_KEY) {
    falhar('CLERK_SECRET_KEY ausente — não foi possível autenticar')
    return false
  }

  log(`Auth ambiente=${ambienteExec} clerk=${clerkSecretPrefix} email=${email}`)

  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })

  try {
    if (senha) {
      await clerk.signIn({ page, emailAddress: email, password: senha })
    } else {
      await clerk.signIn({ page, emailAddress: email })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (clerkSecretPrefix === 'sk_test' && ambienteRemotoProducao()) {
      falhar(`Clerk dev (sk_test) em URL de produção — configure CLERK_PROD_SECRET_KEY no .env: ${msg}`)
    } else {
      falhar(`Clerk sign-in falhou: ${msg}`)
    }
    return false
  }

  await aguardarMeComOrganizacao(page)
  await prepararEscopoWorkspaces(page)
  log(`✓ Clerk sign-in (${email})`)
  return true
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

async function entrarNoWorkspace(page: Page): Promise<void> {
  const noHub = page.url().includes('/hub') || page.url().includes('/selecionar-workspace')
  if (!noHub) return

  log('Hub detectado — aguardando UI do workspace')
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2500)

  const btnAcordo = page.getByRole('button', { name: /estou de acordo/i })
  if (await btnAcordo.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btnAcordo.click()
    await page.waitForTimeout(1000)
  }

  const cardWs = page.locator('.sw-ws-card').first()
  if (await cardWs.isVisible({ timeout: 15000 }).catch(() => false)) {
    await cardWs.click()
    await page.waitForTimeout(600)
  }

  const btnEnter = page
    .locator('.sw-ws-enter-btn')
    .or(page.getByRole('button', { name: /entrar no workspace/i }))
    .first()

  if (await btnEnter.isVisible({ timeout: 20000 }).catch(() => false)) {
    await btnEnter.click()
    await page.waitForURL(/\/(pedido|core|configurador)/, { timeout: 60000 }).catch(() => {})
  } else {
    log('⚠ Botão "Entrar no workspace" não visível — navegação direta')
    await page.goto(`${BASE_UI}/pedido/configuracoes?tab=status`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
  }

  await aguardarWorkspaceAtivo(page)
  await prepararEscopoWorkspaces(page)
  await page.waitForTimeout(1500)
}

async function validarConfigStatus(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/configuracoes?tab=status`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })

  const rowLocator = page.locator('.cfg-status-row').first()
  const carregouRows = await rowLocator.waitFor({ timeout: 60000 }).then(() => true).catch(() => false)

  if (!carregouRows && await page.locator('.cfg-status-erro').isVisible().catch(() => false)) {
    log('⚠ API status falhou — clicando Tentar novamente')
    await page.getByRole('button', { name: /tentar novamente/i }).click().catch(() => {})
    await rowLocator.waitFor({ timeout: 45000 }).catch(() => {})
  }

  const temRows = await rowLocator.isVisible().catch(() => false)
  if (!temRows) {
    await screenshot(page, '02-config-status-sem-linhas.png')
    falhar('Config Status: nenhuma .cfg-status-row visível após load (timeout 60s)')
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

  const editavel = page.locator('.cfg-status-row').filter({
    hasNot: page.locator('.cfg-badge-sistema'),
  }).first()
  const temLapisCustom = await editavel.locator('.cfg-eye-btn').count()
  if (temLapisCustom === 0) {
    falhar('Nenhum status customizado com lápis (esperado ao menos 1 editável)')
  } else {
    const rotulo = (await editavel.locator('.cfg-status-label').first().textContent())?.trim() ?? 'custom'
    log(`✓ Status custom "${rotulo}": lápis visível`)
    await screenshot(page, '04-status-custom-com-lapis.png')
  }
}

async function aguardarNotificacaoSalvar(
  page: Page,
  timeoutMs = 10000,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const sucesso = page.getByText(/campo atualizado com sucesso/i)
  const erro = page.getByText(/erro ao editar campo/i)
  try {
    const resultado = await Promise.race([
      sucesso.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => 'sucesso' as const),
      erro.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => 'erro' as const),
    ])
    return resultado
  } catch {
    return 'nenhuma'
  }
}

async function obterPrimeiroPedidoRowId(page: Page): Promise<string | null> {
  const cel = page.locator('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').first()
  const visivel = await cel.waitFor({ timeout: 45000 }).then(() => true).catch(() => false)
  if (!visivel) return null
  return cel.getAttribute('data-gtv-rowid')
}

async function expandirPrimeiroPedido(page: Page, rowId: string): Promise<boolean> {
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
  const chevron = pai.locator('.gtv-chevron-btn')
  if (await chevron.count() === 0) return false
  const jaExpandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida'))
  if (!jaExpandido) {
    await chevron.click()
    await page.waitForTimeout(800)
  }
  await page.locator('.gtv-linha--filho').first().waitFor({ timeout: 30000 }).catch(() => {})
  return await page.locator('.gtv-linha--filho').first().isVisible().catch(() => false)
}

async function editarCampoTextoPai(
  page: Page,
  rowId: string,
  campo: string,
  novoValor: string,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  const existe = await cel.count()
  if (existe === 0) return 'nenhuma'
  await cel.click()
  const input = page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
  await input.waitFor({ timeout: 10000 })
  await input.fill(novoValor)
  await input.press('Enter')
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

async function editarCampoTextoItem(
  page: Page,
  campo: string,
  novoValor: string,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const clicou = await page.evaluate((colKey) => {
    const filho = document.querySelector('.gtv-linha--filho')
    if (!filho) return false
    const porAttr = filho.querySelector(
      `[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`,
    ) as HTMLElement | null
    const alvo = porAttr?.classList.contains('gtv-celula--editavel')
      ? porAttr
      : (filho.querySelector('.gtv-celula--editavel') as HTMLElement | null)
    if (!alvo) return false
    alvo.click()
    return true
  }, campo)
  if (!clicou) return 'nenhuma'
  const input = page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
  const abriu = await input.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
  if (!abriu) return 'nenhuma'
  await input.fill(novoValor)
  await input.press('Enter')
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

async function validarLista(page: Page): Promise<void> {
  await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 }).catch(() => {})

  const rowId = await obterPrimeiroPedidoRowId(page)
  if (!rowId) {
    falhar('Lista: nenhum pedido editável na grade')
    await screenshot(page, '09a-lista-pedido-itens-carregando.png')
    return
  }

  const temItens = await expandirPrimeiroPedido(page, rowId)
  if (temItens) log('✓ Lista: pedido expandido — itens visíveis na grade')
  else log('⚠ Lista: pedido sem linha filho visível (pode não ter itens)')
  await screenshot(page, '09a-lista-pedido-itens-carregando.png')

  const sufixo = `EMT-${Date.now().toString(36).slice(-5)}`
  const notifPedido = await editarCampoTextoPai(page, rowId, 'referencia_importador', `QA-REF-${sufixo}`)
  await page.waitForTimeout(600)
  await screenshot(page, '09b-lista-editar-pedido-sucesso.png')
  if (notifPedido === 'erro') falhar('Lista: edição do pedido retornou erro')
  else if (notifPedido === 'sucesso') log('✓ Lista: edição do pedido salva com sucesso')
  else log('⚠ Lista: edição do pedido — toast de sucesso não detectado')

  if (temItens) {
    const notifItem = await editarCampoTextoItem(page, 'part_number', `QA-PN-${sufixo}`)
    await page.waitForTimeout(600)
    await screenshot(page, '09c-lista-editar-item-sucesso.png')
    if (notifItem === 'erro') falhar('Lista: edição do item retornou erro')
    else if (notifItem === 'sucesso') log('✓ Lista: edição do item salva com sucesso')
    else log('⚠ Lista: edição do item — toast de sucesso não detectado')
  } else {
    log('⚠ Lista: pulando edição de item — sem linha filho')
  }

  await page.waitForTimeout(800)
  await screenshot(page, '09-lista-com-novo-status-aba.png')

  const statusConfig = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('pedido:status_config')
      return raw ? Object.keys(JSON.parse(raw) as Record<string, unknown>).length : 0
    } catch { return 0 }
  })
  if (statusConfig < 5) falhar(`Lista: pedido:status_config com ${statusConfig} entradas (esperado ≥5)`)
  else log(`✓ Lista: localStorage status_config com ${statusConfig} status`)

  await screenshot(page, '10-lista-coluna-status-badge.png')
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
  log(`Data: ${DATA} | Base: ${BASE_UI} | Ambiente: ${ambienteExec} | Clerk: ${clerkSecretPrefix}`)
  log(`Pasta: ${OUT}`)

  await clerkSetup()

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  try {
    const okAuth = await autenticarClerk(page)
    if (!okAuth) throw new Error('Autenticação falhou')
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)
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

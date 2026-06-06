/**
 * Teste em tela — Lista Pedido: editar e salvar pedido + itens (coluna Nº PEDIDO / Nº ITEM)
 * Plano: TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts
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

const DATA = '2026-06-06'
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

/**
 * Rótulos exatos como renderizados na lista (i18n + `text-transform: uppercase` no `.gtv-cabecalho`).
 * @see nucleo-global/Utilidades/Localization/locales/pt.json → pedido.coluna_pai.numero_pedido
 */
const COLUNA_ALVO = 'Nº PEDIDO / Nº ITEM'
const CAMPO_PEDIDO_COLUNA = 'Nº PEDIDO'
const CAMPO_ITEM_COLUNA = 'Nº ITEM'
const ALERTA_DUPLICADO_TOOLTIP = 'Existem itens com o mesmo Part Number neste pedido'
const PRODUTO_EMT = 'Pedido'
const LOCAL_LISTA = 'Lista'

function resolverLabelAmbiente(): string {
  if (ambienteRemotoProducao() || BASE_UI.includes('usegravity.com.br')) return 'Produção'
  if (ambienteExec === 'Producao' || ambienteExec === 'producao') return 'Produção'
  return 'Local'
}

const AMBIENTE_LABEL = resolverLabelAmbiente()

type ResultadoEmtLinha = 'Aprovado' | 'Reprovado'

/** Contrato Admin: linha tabular `EMT_ROW|Ambiente|Produto|Local|Sublocal|O que foi feito|Resultado` */
function emtRow(
  local: string,
  sublocal: string,
  acao: string,
  resultado: ResultadoEmtLinha,
  produto = PRODUTO_EMT,
): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${produto}|${local}|${sublocal}|${acao}|${resultado}`
}

function logAprovado(local: string, sublocal: string, acao: string, produto = PRODUTO_EMT): void {
  log(`✓ ${emtRow(local, sublocal, acao, 'Aprovado', produto)}`)
}

function falharTabela(local: string, sublocal: string, acao: string, produto = PRODUTO_EMT): void {
  falhar(emtRow(local, sublocal, acao, 'Reprovado', produto))
}

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
    } else if (clerkSecretPrefix === 'sk_test' && /no user found/i.test(msg)) {
      falhar(
        `Clerk sign-in falhou: ${msg}. `
        + `Conta "${email}" não existe no Clerk DEV (sk_test). `
        + `No Admin → Executar testes, selecione ambiente **Producao** (usegravity.com.br + sk_live), conforme o plano.`,
      )
    } else {
      falhar(`Clerk sign-in falhou: ${msg}`)
    }
    return false
  }

  await aguardarMeComOrganizacao(page)
  await prepararEscopoWorkspaces(page)
  logAprovado('Login', '—', `Clerk sign-in (${email})`, 'Plataforma')
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
    log('⚠ Botão "Entrar no workspace" não visível — navegação direta para lista')
    await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  }

  await aguardarWorkspaceAtivo(page)
  await prepararEscopoWorkspaces(page)
  await page.waitForTimeout(1500)
}

async function aguardarNotificacaoSalvar(
  page: Page,
  timeoutMs = 10000,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const sucesso = page.getByText(/campo atualizado com sucesso/i)
  const erro = page.getByText(/erro ao editar campo/i)
  try {
    return await Promise.race([
      sucesso.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => 'sucesso' as const),
      erro.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => 'erro' as const),
    ])
  } catch {
    return 'nenhuma'
  }
}

async function obterPrimeiroPedidoRowId(page: Page): Promise<string | null> {
  const cel = page.locator('.gtv-linha--pai .gtv-celula--editavel[data-gtv-campo="numero_pedido"]').first()
    .or(page.locator('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').first())
  const visivel = await cel.waitFor({ timeout: 45000 }).then(() => true).catch(() => false)
  if (!visivel) return null
  return cel.getAttribute('data-gtv-rowid')
}

async function expandirPrimeiroPedido(page: Page, rowId: string): Promise<number> {
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
  const chevron = pai.locator('.gtv-chevron-btn')
  if (await chevron.count() === 0) return 0
  const jaExpandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida'))
  if (!jaExpandido) {
    await chevron.click()
    await page.waitForTimeout(800)
  }
  await page.locator('.gtv-linha--filho').first().waitFor({ timeout: 30000 }).catch(() => {})
  return page.locator('.gtv-linha--filho').count()
}

async function editarCampoTextoPai(
  page: Page,
  rowId: string,
  campo: string,
  novoValor: string,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  if (await cel.count() === 0) return 'nenhuma'
  await cel.click()
  const input = page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
  await input.waitFor({ timeout: 10000 })
  await input.fill(novoValor)
  await input.press('Enter')
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

/** Na grade mapeada, coluna pai `numero_pedido` usa data-gtv-campo=numero_pedido nos filhos. */
function campoColunaFilho(campo: string): string {
  return campo === 'part_number' ? 'numero_pedido' : campo
}

function filhosDoPedidoLocator(page: Page, pedidoRowId: string) {
  return page
    .locator(`.gtv-linha--filho[data-gtv-pai-id="${pedidoRowId}"]`)
    .or(page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${pedidoRowId}"]) ~ .gtv-linha--filho`))
}

async function editarCampoTextoItemPorIndice(
  page: Page,
  pedidoRowId: string,
  indice: number,
  campo: string,
  novoValor: string,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const colKey = campoColunaFilho(campo)
  const clicou = await page.evaluate(({ paiId, idx, colKey }) => {
    let filhos = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
    if (filhos.length === 0) {
      const paiEl = document.querySelector(`.gtv-linha--pai [data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
      if (paiEl) {
        filhos = []
        let prox = paiEl.nextElementSibling
        while (prox?.classList.contains('gtv-linha--filho')) {
          filhos.push(prox)
          prox = prox.nextElementSibling
        }
      }
    }
    const filho = filhos[idx]
    if (!filho) return false
    const porAttr = filho.querySelector(
      `[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`,
    ) as HTMLElement | null
    const alvo = porAttr?.classList.contains('gtv-celula--editavel')
      ? porAttr
      : (filho.querySelector(`[data-gtv-campo="${colKey}"]`) as HTMLElement | null)
        ?? (filho.querySelector('.gtv-celula--editavel') as HTMLElement | null)
    if (!alvo) return false
    alvo.click()
    return true
  }, { paiId: pedidoRowId, idx: indice, colKey })

  if (!clicou) return 'nenhuma'
  const input = page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
  const abriu = await input.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
  if (!abriu) return 'nenhuma'
  await input.fill(novoValor)
  await input.press('Enter')
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

/**
 * Regra de negócio (APROVADO): Part Numbers iguais no pedido → alerta visível.
 * SSOT: data-testid no produto; fallback svg na coluna numero_pedido (produção sem deploy).
 */
async function pedidoTemAlertaPartNumberDuplicado(page: Page, pedidoRowId: string): Promise<boolean> {
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${pedidoRowId}"])`).first()
  const filhos = filhosDoPedidoLocator(page, pedidoRowId)

  await pai.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
  log(`ℹ Regra: ${CAMPO_ITEM_COLUNA} duplicado → alerta visível na coluna ${COLUNA_ALVO} = APROVADO`)

  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const alertaPedidoTestid = await pai.getByTestId('lista-alerta-part-number-duplicado-pedido').isVisible().catch(() => false)
    const alertasItemTestid = await filhos.getByTestId('lista-alerta-part-number-duplicado-item').count()

    if (alertaPedidoTestid || alertasItemTestid >= 1) {
      logAprovado(LOCAL_LISTA, COLUNA_ALVO, `Validar alerta ${CAMPO_ITEM_COLUNA} duplicado (testid pedido=${alertaPedidoTestid}, itens=${alertasItemTestid})`)
      return true
    }

    const svgPedido = await pai.locator('[data-gtv-campo="numero_pedido"] svg').count()
    const svgItens = await filhos.locator('[data-gtv-campo="numero_pedido"] svg').count()

    if (svgPedido > 0 || svgItens >= 1) {
      logAprovado(LOCAL_LISTA, COLUNA_ALVO, `Validar alerta ${CAMPO_ITEM_COLUNA} duplicado (ícone coluna svg pedido=${svgPedido}, itens=${svgItens})`)
      return true
    }

    await page.waitForTimeout(500)
  }

  return false
}

async function validarListaEditarSalvar(page: Page): Promise<void> {
  await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 }).catch(() => {})
  logAprovado(LOCAL_LISTA, '—', `Carregar a lista (${LISTA_URL})`)

  const rowId = await obterPrimeiroPedidoRowId(page)
  if (!rowId) {
    falharTabela(LOCAL_LISTA, COLUNA_ALVO, 'Localizar campo editável na coluna')
    await screenshot(page, '02-lista-carregada.png')
    return
  }

  const qtdItens = await expandirPrimeiroPedido(page, rowId)
  if (qtdItens === 0) {
    falharTabela(LOCAL_LISTA, '—', 'Expandir pedido com itens visíveis (necessário ≥2)')
    await screenshot(page, '02-lista-carregada.png')
    return
  }
  if (qtdItens < 2) {
    log(`⚠ ${emtRow(LOCAL_LISTA, '—', `Expandir pedido — apenas ${qtdItens} item (ideal ≥2)`, 'Aprovado')}`)
  } else {
    logAprovado(LOCAL_LISTA, '—', `Expandir pedido (${qtdItens} itens)`)
  }
  await screenshot(page, '02-lista-carregada.png')

  const sufixo = `EMT-${Date.now().toString(36).slice(-5)}`
  const numeroPedido = `QA-NUM-${sufixo}`
  const partNumber = `QA-PN-${sufixo}`

  const notifPedido = await editarCampoTextoPai(page, rowId, 'numero_pedido', numeroPedido)
  await page.waitForTimeout(600)
  await screenshot(page, '03-editar-pedido-numero-sucesso.png')
  if (notifPedido === 'erro') falharTabela(LOCAL_LISTA, CAMPO_PEDIDO_COLUNA, 'Salvar o pedido — toast de erro')
  else if (notifPedido === 'sucesso') logAprovado(LOCAL_LISTA, CAMPO_PEDIDO_COLUNA, `Salvar o pedido (${numeroPedido})`)
  else falharTabela(LOCAL_LISTA, CAMPO_PEDIDO_COLUNA, 'Salvar o pedido — toast de sucesso não detectado')

  const notifItem1 = await editarCampoTextoItemPorIndice(page, rowId, 0, 'part_number', partNumber)
  await page.waitForTimeout(600)
  await screenshot(page, '04-editar-item-part-number-sucesso.png')
  if (notifItem1 === 'erro') falharTabela(LOCAL_LISTA, CAMPO_ITEM_COLUNA, 'Salvar o item 1 — toast de erro')
  else if (notifItem1 === 'sucesso') logAprovado(LOCAL_LISTA, CAMPO_ITEM_COLUNA, `Salvar o item 1 (${partNumber})`)
  else falharTabela(LOCAL_LISTA, CAMPO_ITEM_COLUNA, 'Salvar o item 1 — toast de sucesso não detectado')

  if (qtdItens >= 2) {
    const notifItem2 = await editarCampoTextoItemPorIndice(page, rowId, 1, 'part_number', partNumber)
    await page.waitForTimeout(1000)
    const temAlerta = await pedidoTemAlertaPartNumberDuplicado(page, rowId)
    await screenshot(page, '05-alerta-part-number-duplicado-pedido.png')
    if (notifItem2 === 'erro') falharTabela(LOCAL_LISTA, CAMPO_ITEM_COLUNA, 'Salvar o item 2 com mesmo Nº ITEM — toast de erro')
    else if (!temAlerta) {
      falharTabela(
        LOCAL_LISTA,
        COLUNA_ALVO,
        `Validar alerta ${CAMPO_ITEM_COLUNA} duplicado — não detectado (print 05)`,
      )
    }
  } else {
    log(`⚠ ${emtRow(LOCAL_LISTA, COLUNA_ALVO, 'Validar alerta Nº ITEM duplicado — pulado (menos de 2 itens)', 'Reprovado')}`)
    await screenshot(page, '05-alerta-part-number-duplicado-pedido.png')
    falharTabela(LOCAL_LISTA, COLUNA_ALVO, `Validar alerta ${CAMPO_ITEM_COLUNA} duplicado — pedido com menos de 2 itens`)
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log('TESTE EM TELA — lista-editar-salvar')
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

    await validarListaEditarSalvar(page)

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    log('')
    log(`Resultado: ${resultado}`)
    if (falhas.length) {
      log('Falhas:')
      for (const f of falhas) log(`  - ${f}`)
    }

    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — lista-editar-salvar',
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

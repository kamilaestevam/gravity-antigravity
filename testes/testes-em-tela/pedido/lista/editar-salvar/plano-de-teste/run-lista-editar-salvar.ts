/**
 * Teste em tela — Lista Pedido: Nº PEDIDO / Nº ITEM + TIPO DE OPERAÇÃO + REFERÊNCIA IMPORTADOR
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
const COLUNA_TIPO_OPERACAO = 'TIPO DE OPERAÇÃO'
const COL_KEY_TIPO_OPERACAO = 'tipo_operacao'
const COLUNA_REF_IMPORTADOR = 'REFERÊNCIA IMPORTADOR'
const COL_KEY_REF_IMPORTADOR = 'referencia_importador'
const ALERTA_REF_DIVERGENTE = /referências divergentes entre itens/i
const LABEL_TIPO_IMPORTACAO = 'Importação'
const LABEL_TIPO_EXPORTACAO = 'Exportação'
const CHECKBOX_REPLICAR_REGEX = /aplicar a todos os itens deste pedido/i
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

async function aguardarListaComPedidosEditaveis(page: Page): Promise<void> {
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 })
  await page.locator('.gtv-linha--pai .gtv-chevron-btn').first().waitFor({ timeout: 45000 })
  await page.waitForFunction(
    () => document.querySelectorAll('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').length > 0,
    undefined,
    { timeout: 60000 },
  )
  await page.waitForTimeout(800)
}

async function garantirColunasListaVisiveis(page: Page): Promise<void> {
  const btnColunas = page.getByRole('button', { name: 'Colunas' })
  const visivel = await btnColunas.isVisible({ timeout: 10000 }).catch(() => false)
  if (!visivel) return
  await btnColunas.click()
  await page.getByRole('button', { name: /Selecionar tudo/i }).click()
  await page.waitForTimeout(600)
  await page.keyboard.press('Escape')
  await page.locator('.scg-popover').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(1200)
  log('✓ Colunas: "Selecionar tudo" aplicado (Nº PEDIDO, TIPO OP., REF. IMPORTADOR visíveis)')
}

async function garantirListaPedidos(page: Page): Promise<void> {
  await aguardarWorkspaceAtivo(page)
  await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })

  if (page.url().includes('/hub') || page.url().includes('/login') || page.url().includes('/selecionar-workspace')) {
    log(`⚠ Redirecionado (${page.url()}) — tentando lista novamente`)
    await aguardarWorkspaceAtivo(page)
    await prepararEscopoWorkspaces(page)
    await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  }

  await aguardarListaComPedidosEditaveis(page)

  // Recarrega após escopo de workspace para garantir pedidos do CDE correto (padrão logística EMT)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await aguardarListaComPedidosEditaveis(page)
  await garantirColunasListaVisiveis(page)
}

async function diagnosticarLista(page: Page): Promise<string> {
  return page.evaluate(() => {
    const linhasPai = document.querySelectorAll('.gtv-linha--pai').length
    const chevrons = document.querySelectorAll('.gtv-linha--pai .gtv-chevron-btn').length
    const editaveis = document.querySelectorAll('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').length
    const numeroPedidoEditavel = document.querySelectorAll(
      '.gtv-linha--pai .gtv-celula--editavel[data-gtv-campo="numero_pedido"]',
    ).length
    return `linhasPai=${linhasPai}, chevrons=${chevrons}, editaveis=${editaveis}, numero_pedido_editavel=${numeroPedidoEditavel}`
  })
}

async function listarRowIdsPedidosEditaveis(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const ids = new Set<string>()
    document.querySelectorAll('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').forEach(el => {
      const id = el.getAttribute('data-gtv-rowid')
      if (id) ids.add(id)
    })
    return Array.from(ids)
  })
}

/** Prefere pedido com ≥2 itens (alerta PN duplicado / divergência REF); senão o primeiro com ≥1. */
async function obterPedidoComItens(page: Page): Promise<{ rowId: string; qtdItens: number } | null> {
  const rowIds = await listarRowIdsPedidosEditaveis(page)
  if (rowIds.length === 0) {
    log(`ℹ Diagnóstico lista: ${await diagnosticarLista(page)}`)
    return null
  }

  const limite = Math.min(rowIds.length, 8)
  for (let i = 0; i < limite; i++) {
    const qtd = await expandirPrimeiroPedido(page, rowIds[i])
    if (qtd >= 2) return { rowId: rowIds[i], qtdItens: qtd }
  }
  for (let i = 0; i < limite; i++) {
    const qtd = await expandirPrimeiroPedido(page, rowIds[i])
    if (qtd >= 1) return { rowId: rowIds[i], qtdItens: qtd }
  }
  return null
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
  opts?: { replicarEmItens?: boolean; scrollColuna?: boolean },
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  if (opts?.scrollColuna !== false) {
    await scrollColunaParaVisivel(page, campo)
  }
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  if (await cel.count() === 0) return 'nenhuma'
  await cel.click()
  const input = page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
  const abriu = await input.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
  if (!abriu) return 'nenhuma'
  if (opts?.replicarEmItens) {
    const cb = page.locator('.gtv-edit-popover input[type="checkbox"]').first()
    if (await cb.isVisible().catch(() => false)) {
      const marcado = await cb.isChecked().catch(() => false)
      if (!marcado) await cb.check()
    }
  }
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
  await scrollColunaParaVisivel(page, campo)
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
 * SSOT: `data-find-col-key` no cabeçalho GTV (`.gtv-th`, não `.gtv-celula`).
 * Itens travados não expõem `data-gtv-campo` — índice via colunas de dados (sem fixas).
 * @see testes/testes-em-tela/pedido/run-logistica-colunas-inline.ts
 */
async function scrollColunaParaVisivel(page: Page, colKey: string): Promise<void> {
  await page.evaluate((key) => {
    const th = document.querySelector(`[data-find-col-key="${key}"]`) as HTMLElement | null
    th?.scrollIntoView({ inline: 'center', block: 'nearest' })
    const scroll = document.querySelector('.gtv-tabela-scroll') as HTMLElement | null
    if (scroll && th) {
      const left = th.offsetLeft - scroll.clientWidth / 2
      scroll.scrollLeft = Math.max(0, left)
    }
  }, colKey)
  await page.waitForTimeout(400)
}

async function clicarCelulaTipoOperacaoItem(
  page: Page,
  pedidoRowId: string,
  indiceItem: number,
): Promise<boolean> {
  await scrollColunaParaVisivel(page, COL_KEY_TIPO_OPERACAO)
  return page.evaluate(({ paiId, idx, colKey }) => {
    const filhos = (() => {
      let f = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
      if (f.length === 0) {
        const paiEl = document.querySelector(`.gtv-linha--pai [data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
        if (paiEl) {
          f = []
          let prox = paiEl.nextElementSibling
          while (prox?.classList.contains('gtv-linha--filho')) {
            f.push(prox)
            prox = prox.nextElementSibling
          }
        }
      }
      return f
    })()
    const filho = filhos[idx]
    if (!filho) return false
    const porAttr = filho.querySelector(`[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`) as HTMLElement | null
    const cel = porAttr ?? (() => {
      const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
      const colIdx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
      if (colIdx < 0) return null
      const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
        c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
      )
      return (cells[colIdx] as HTMLElement) ?? null
    })()
    if (!cel) return false
    cel.click()
    return true
  }, { paiId: pedidoRowId, idx: indiceItem, colKey: COL_KEY_TIPO_OPERACAO })
}

async function abrirPopoverTipoOperacaoPai(page: Page, rowId: string): Promise<boolean> {
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="tipo_operacao"]`)
  if (await cel.count() === 0) return false
  await cel.click()
  return page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function popoverExibeCheckboxReplicar(page: Page): Promise<boolean> {
  const cb = page.locator('.gtv-edit-popover label').filter({ hasText: CHECKBOX_REPLICAR_REGEX })
  return cb.isVisible().catch(() => false)
}

async function fecharPopoverSeAberto(page: Page): Promise<void> {
  const visivel = await page.locator('.gtv-edit-popover').isVisible().catch(() => false)
  if (visivel) {
    await page.keyboard.press('Escape')
    await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  }
}

async function selecionarTipoOperacaoPopover(page: Page, label: string): Promise<void> {
  await page.locator('.gtv-edit-popover .gtv-edit-popover-opcao').filter({ hasText: label }).first().click()
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
}

async function lerBadgeTipoOperacaoPai(page: Page, rowId: string): Promise<string | null> {
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="tipo_operacao"]`)
  return cel.textContent()
}

/** Badge na grade usa uppercase (CSS); popover usa título misto — comparar sem case/acento. */
function normalizarTipoOperacaoTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

function pedidoExibeTipo(badge: string | null, label: string): boolean {
  if (!badge) return false
  const normBadge = normalizarTipoOperacaoTexto(badge)
  const normLabel = normalizarTipoOperacaoTexto(label)
  return normBadge.includes(normLabel)
}

async function lerTextosTipoOperacaoItens(page: Page, pedidoRowId: string): Promise<string[]> {
  await scrollColunaParaVisivel(page, COL_KEY_TIPO_OPERACAO)
  return page.evaluate(({ paiId, colKey }) => {
    const filhos = (() => {
      let f = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
      if (f.length === 0) {
        const paiEl = document.querySelector(`.gtv-linha--pai [data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
        if (paiEl) {
          f = []
          let prox = paiEl.nextElementSibling
          while (prox?.classList.contains('gtv-linha--filho')) {
            f.push(prox)
            prox = prox.nextElementSibling
          }
        }
      }
      return f
    })()
    const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
    const colIdx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
    return filhos.map(filho => {
      const porAttr = filho.querySelector(`[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`)
      const cel = porAttr ?? (() => {
        if (colIdx < 0) return null
        const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
          c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
        )
        return cells[colIdx] ?? null
      })()
      return cel?.textContent?.trim() ?? ''
    })
  }, { paiId: pedidoRowId, colKey: COL_KEY_TIPO_OPERACAO })
}

async function pedidoEItensExibemTipo(
  page: Page,
  rowId: string,
  label: typeof LABEL_TIPO_IMPORTACAO | typeof LABEL_TIPO_EXPORTACAO,
): Promise<{ pedidoOk: boolean; itensOk: boolean; qtdItens: number }> {
  const badgePai = await lerBadgeTipoOperacaoPai(page, rowId)
  const textosItens = await lerTextosTipoOperacaoItens(page, rowId)
  const pedidoOk = pedidoExibeTipo(badgePai, label)
  const itensOk = textosItens.length > 0 && textosItens.every(t => pedidoExibeTipo(t, label))
  return { pedidoOk, itensOk, qtdItens: textosItens.length }
}

async function itensTipoOperacaoTravados(page: Page, pedidoRowId: string): Promise<boolean> {
  await scrollColunaParaVisivel(page, COL_KEY_TIPO_OPERACAO)
  const travados = await page.evaluate(({ paiId, colKey }) => {
    const filhos = (() => {
      let f = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
      if (f.length === 0) {
        const paiEl = document.querySelector(`.gtv-linha--pai [data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
        if (paiEl) {
          f = []
          let prox = paiEl.nextElementSibling
          while (prox?.classList.contains('gtv-linha--filho')) {
            f.push(prox)
            prox = prox.nextElementSibling
          }
        }
      }
      return f
    })()
    if (filhos.length === 0) return false
    const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
    const colIdx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
    return filhos.every(filho => {
      const porAttr = filho.querySelector(`[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`) as HTMLElement | null
      const cel = porAttr ?? (() => {
        if (colIdx < 0) return null
        const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
          c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
        )
        return (cells[colIdx] as HTMLElement) ?? null
      })()
      return cel != null && !cel.classList.contains('gtv-celula--editavel')
    })
  }, { paiId: pedidoRowId, colKey: COL_KEY_TIPO_OPERACAO })
  if (!travados) return false
  const textosItens = await lerTextosTipoOperacaoItens(page, pedidoRowId)
  for (let i = 0; i < textosItens.length; i++) {
    await fecharPopoverSeAberto(page)
    await page.waitForTimeout(150)
    const clicou = await clicarCelulaTipoOperacaoItem(page, pedidoRowId, i)
    if (!clicou) return false
    await page.waitForTimeout(400)
    const popover = await page.locator('.gtv-edit-popover').isVisible().catch(() => false)
    if (popover) return false
  }
  return textosItens.length > 0
}

async function garantirTipoOperacaoPedido(
  page: Page,
  rowId: string,
  label: typeof LABEL_TIPO_IMPORTACAO | typeof LABEL_TIPO_EXPORTACAO,
): Promise<void> {
  const badge = await lerBadgeTipoOperacaoPai(page, rowId)
  if (pedidoExibeTipo(badge, label)) return
  const abriu = await abrirPopoverTipoOperacaoPai(page, rowId)
  if (!abriu) return
  await selecionarTipoOperacaoPopover(page, label)
  await aguardarNotificacaoSalvar(page, 8000)
  await page.waitForTimeout(500)
}

async function aguardarPedidoEItensExibemTipo(
  page: Page,
  rowId: string,
  label: typeof LABEL_TIPO_IMPORTACAO | typeof LABEL_TIPO_EXPORTACAO,
  timeoutMs = 15000,
): Promise<{ pedidoOk: boolean; itensOk: boolean; qtdItens: number; badgePai: string | null; textosItens: string[] }> {
  const deadline = Date.now() + timeoutMs
  let last = { pedidoOk: false, itensOk: false, qtdItens: 0, badgePai: null as string | null, textosItens: [] as string[] }
  while (Date.now() < deadline) {
    const badgePai = await lerBadgeTipoOperacaoPai(page, rowId)
    const textosItens = await lerTextosTipoOperacaoItens(page, rowId)
    const pedidoOk = pedidoExibeTipo(badgePai, label)
    const itensOk = textosItens.length > 0 && textosItens.every(t => pedidoExibeTipo(t, label))
    last = { pedidoOk, itensOk, qtdItens: textosItens.length, badgePai, textosItens }
    if (pedidoOk && itensOk) return last
    await page.waitForTimeout(400)
  }
  return last
}

async function validarAlteracaoTipoPedidoEItens(
  page: Page,
  rowId: string,
  label: typeof LABEL_TIPO_IMPORTACAO | typeof LABEL_TIPO_EXPORTACAO,
  acaoLog: string,
): Promise<boolean> {
  const { pedidoOk, itensOk, qtdItens, badgePai, textosItens } = await aguardarPedidoEItensExibemTipo(page, rowId, label)
  if (pedidoOk && itensOk) {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, `${acaoLog} (${qtdItens} itens)`)
    return true
  }
  log(`ℹ Diagnóstico TOP: badgePai=${JSON.stringify(badgePai)}, itens=${JSON.stringify(textosItens)}`)
  if (!pedidoOk) falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, `${acaoLog} — pedido não exibe ${label}`)
  if (!itensOk) falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, `${acaoLog} — itens não replicaram ${label}`)
  return false
}

/** Passos 06–12 — TIPO DE OPERAÇÃO (Importação ↔ Exportação). */
async function validarTipoOperacaoLista(page: Page, rowId: string): Promise<void> {
  log(`ℹ Coluna ${COLUNA_TIPO_OPERACAO}: passos 06–12 (modal, sem checkbox, replica pedido+itens, item travado)`)

  await garantirTipoOperacaoPedido(page, rowId, LABEL_TIPO_IMPORTACAO)

  // 06 — abrir modal com pedido em Importação
  await fecharPopoverSeAberto(page)
  const abriu06 = await abrirPopoverTipoOperacaoPai(page, rowId)
  if (!abriu06) {
    falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '06 — Abrir modal na linha do pedido (Importação)')
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '06 — Abrir modal na linha do pedido (Importação)')
  }
  await screenshot(page, '06-tipo-operacao-modal-importacao.png')

  // 07 — modal sem checkbox (Importação)
  const temCb07 = await popoverExibeCheckboxReplicar(page)
  await screenshot(page, '07-tipo-operacao-sem-checkbox-importacao.png')
  if (temCb07) {
    falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '07 — Modal não deve exibir «Aplicar a todos os itens» (Importação)')
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '07 — Modal sem checkbox replicar (Importação)')
  }

  // 08 — Importação → Exportação (pedido + itens)
  await selecionarTipoOperacaoPopover(page, LABEL_TIPO_EXPORTACAO)
  await aguardarNotificacaoSalvar(page, 8000)
  await scrollColunaParaVisivel(page, COL_KEY_TIPO_OPERACAO)
  await validarAlteracaoTipoPedidoEItens(
    page,
    rowId,
    LABEL_TIPO_EXPORTACAO,
    '08 — Alterar pedido Importação → Exportação (pedido e itens)',
  )
  await screenshot(page, '08-tipo-operacao-pedido-itens-exportacao.png')

  // Itens travados após Exportação (passo implícito entre 08 e 09)
  const travadosPosExp = await itensTipoOperacaoTravados(page, rowId)
  if (travadosPosExp) {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, 'Itens com célula travada após Exportação')
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, 'Itens devem estar travados após Exportação')
  }

  // 09 — abrir modal com pedido em Exportação
  await fecharPopoverSeAberto(page)
  const abriu09 = await abrirPopoverTipoOperacaoPai(page, rowId)
  if (!abriu09) {
    falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '09 — Abrir modal na linha do pedido (Exportação)')
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '09 — Abrir modal na linha do pedido (Exportação)')
  }
  await screenshot(page, '09-tipo-operacao-modal-exportacao.png')

  // 10 — modal sem checkbox (Exportação)
  const temCb10 = await popoverExibeCheckboxReplicar(page)
  await screenshot(page, '10-tipo-operacao-sem-checkbox-exportacao.png')
  if (temCb10) {
    falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '10 — Modal não deve exibir «Aplicar a todos os itens» (Exportação)')
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '10 — Modal sem checkbox replicar (Exportação)')
  }

  // 11 — Exportação → Importação (pedido + itens)
  await selecionarTipoOperacaoPopover(page, LABEL_TIPO_IMPORTACAO)
  await aguardarNotificacaoSalvar(page, 8000)
  await scrollColunaParaVisivel(page, COL_KEY_TIPO_OPERACAO)
  await validarAlteracaoTipoPedidoEItens(
    page,
    rowId,
    LABEL_TIPO_IMPORTACAO,
    '11 — Alterar pedido Exportação → Importação (pedido e itens)',
  )
  await screenshot(page, '11-tipo-operacao-pedido-itens-importacao.png')

  // 12 — itens travados (célula não editável, popover não abre)
  await fecharPopoverSeAberto(page)
  await clicarCelulaTipoOperacaoItem(page, rowId, 0)
  await page.waitForTimeout(400)
  const travados12 = await itensTipoOperacaoTravados(page, rowId)
  await screenshot(page, '12-tipo-operacao-item-travado.png')
  if (travados12) {
    logAprovado(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '12 — Itens com célula travada (não permite edição)')
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_TIPO_OPERACAO, '12 — Itens devem estar travados (célula sem edição)')
  }
}

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
  await garantirListaPedidos(page)
  logAprovado(LOCAL_LISTA, '—', `Carregar a lista (${LISTA_URL})`)

  const pedido = await obterPedidoComItens(page)
  if (!pedido) {
    falharTabela(LOCAL_LISTA, COLUNA_ALVO, `Localizar campo editável na coluna (${await diagnosticarLista(page)})`)
    await screenshot(page, '02-lista-carregada.png')
    return
  }

  const { rowId, qtdItens } = pedido
  if (qtdItens === 0) {
    falharTabela(LOCAL_LISTA, '—', 'Expandir pedido com itens visíveis (necessário ≥1)')
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

  await validarTipoOperacaoLista(page, rowId)
  await validarReferenciaImportadorLista(page, rowId, sufixo, qtdItens)
}

function normalizarTextoCelula(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim()
}

function celulaContemValor(texto: string | null | undefined, valor: string): boolean {
  if (!texto) return false
  return normalizarTextoCelula(texto).includes(valor)
}

async function lerTextoCampoPai(page: Page, rowId: string, campo: string): Promise<string> {
  await scrollColunaParaVisivel(page, campo)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  return normalizarTextoCelula(await cel.textContent() ?? '')
}

async function lerTextosCampoItens(page: Page, pedidoRowId: string, campo: string): Promise<string[]> {
  await scrollColunaParaVisivel(page, campo)
  return page.evaluate(({ paiId, colKey }) => {
    const filhos = (() => {
      let f = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
      if (f.length === 0) {
        const paiEl = document.querySelector(`.gtv-linha--pai [data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
        if (paiEl) {
          f = []
          let prox = paiEl.nextElementSibling
          while (prox?.classList.contains('gtv-linha--filho')) {
            f.push(prox)
            prox = prox.nextElementSibling
          }
        }
      }
      return f
    })()
    const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
    const colIdx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
    return filhos.map(filho => {
      const porAttr = filho.querySelector(`[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`)
      const cel = porAttr ?? (() => {
        if (colIdx < 0) return null
        const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
          c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
        )
        return cells[colIdx] ?? null
      })()
      return cel?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    })
  }, { paiId: pedidoRowId, colKey: campo })
}

async function pedidoTemAlertaReferenciaImportadorDivergente(page: Page, pedidoRowId: string): Promise<boolean> {
  await scrollColunaParaVisivel(page, COL_KEY_REF_IMPORTADOR)
  const cel = page.locator(`[data-gtv-rowid="${pedidoRowId}"][data-gtv-campo="${COL_KEY_REF_IMPORTADOR}"]`)
  const svg = await cel.locator('svg').count()
  if (svg > 0) return true
  const title = await cel.getAttribute('title').catch(() => null)
  if (title && ALERTA_REF_DIVERGENTE.test(title)) return true
  const texto = await cel.textContent()
  return Boolean(texto && ALERTA_REF_DIVERGENTE.test(texto))
}

/** Passos 13–16 — REFERÊNCIA IMPORTADOR (salvar pedido, replicar, item isolado, alerta). */
async function validarReferenciaImportadorLista(
  page: Page,
  rowId: string,
  sufixo: string,
  qtdItens: number,
): Promise<void> {
  log(`ℹ Coluna ${COLUNA_REF_IMPORTADOR}: passos 13–16 (pedido sem replicar, com checkbox, item isolado, alerta)`)

  if (qtdItens < 1) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, 'Pré-condição — pedido sem itens visíveis')
    return
  }

  const refSolo = `REF-EMT-SOLO-${sufixo}`
  const refTodos = `REF-EMT-TODOS-${sufixo}`
  const refItem = `REF-EMT-ITEM-${sufixo}`

  const textosItensAntes = await lerTextosCampoItens(page, rowId, COL_KEY_REF_IMPORTADOR)

  // 13 — pedido sem replicar
  await fecharPopoverSeAberto(page)
  const notif13 = await editarCampoTextoPai(page, rowId, COL_KEY_REF_IMPORTADOR, refSolo, { replicarEmItens: false })
  await page.waitForTimeout(600)
  const textoPai13 = await lerTextoCampoPai(page, rowId, COL_KEY_REF_IMPORTADOR)
  const textosItens13 = await lerTextosCampoItens(page, rowId, COL_KEY_REF_IMPORTADOR)
  await screenshot(page, '13-ref-importador-pedido-sem-replicar.png')

  const pedidoOk13 = celulaContemValor(textoPai13, refSolo)
  const itensNaoReplicaram = textosItens13.every((t, i) => t === (textosItensAntes[i] ?? ''))

  if (notif13 === 'erro') {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '13 — Salvar pedido sem replicar — toast de erro')
  } else if (!pedidoOk13) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `13 — Pedido deve exibir ${refSolo}`)
  } else if (!itensNaoReplicaram) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '13 — Itens não devem replicar ao salvar pedido sem checkbox')
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `13 — Salvar pedido sem replicar (${refSolo})`)
  }

  // 14 — pedido com checkbox replicar
  await fecharPopoverSeAberto(page)
  const temCb14 = await (async () => {
    await scrollColunaParaVisivel(page, COL_KEY_REF_IMPORTADOR)
    const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_REF_IMPORTADOR}"]`)
    if (await cel.count() === 0) return false
    await cel.click()
    const abriu = await page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
    if (!abriu) return false
    const visivel = await popoverExibeCheckboxReplicar(page)
    await fecharPopoverSeAberto(page)
    return visivel
  })()
  if (!temCb14) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '14 — Popover do pedido deve exibir checkbox «Aplicar a todos os itens»')
  }

  const notif14 = await editarCampoTextoPai(page, rowId, COL_KEY_REF_IMPORTADOR, refTodos, { replicarEmItens: true })
  await page.waitForTimeout(800)
  const textoPai14 = await lerTextoCampoPai(page, rowId, COL_KEY_REF_IMPORTADOR)
  const textosItens14 = await lerTextosCampoItens(page, rowId, COL_KEY_REF_IMPORTADOR)
  await screenshot(page, '14-ref-importador-pedido-replicar-todos.png')

  const pedidoOk14 = celulaContemValor(textoPai14, refTodos)
  const itensOk14 = textosItens14.length > 0 && textosItens14.every(t => celulaContemValor(t, refTodos))

  if (notif14 === 'erro') {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '14 — Salvar pedido com replicar — toast de erro')
  } else if (!pedidoOk14 || !itensOk14) {
    log(`ℹ Diagnóstico REF: pai=${JSON.stringify(textoPai14)}, itens=${JSON.stringify(textosItens14)}`)
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `14 — Pedido e todos os itens devem exibir ${refTodos}`)
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `14 — Replicar para todos os itens (${refTodos}, ${textosItens14.length} itens)`)
  }

  // 15 — editar só o 1º item
  await fecharPopoverSeAberto(page)
  const notif15 = await editarCampoTextoItemPorIndice(page, rowId, 0, COL_KEY_REF_IMPORTADOR, refItem)
  await page.waitForTimeout(800)
  const textoPai15 = await lerTextoCampoPai(page, rowId, COL_KEY_REF_IMPORTADOR)
  const textosItens15 = await lerTextosCampoItens(page, rowId, COL_KEY_REF_IMPORTADOR)
  await screenshot(page, '15-ref-importador-editar-item-isolado.png')

  const item0Ok15 = celulaContemValor(textosItens15[0], refItem)
  const pedidoManteve15 = celulaContemValor(textoPai15, refTodos)
  const demaisItensOk15 = textosItens15.length <= 1
    || textosItens15.slice(1).every(t => celulaContemValor(t, refTodos))

  if (notif15 === 'erro') {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '15 — Salvar item isolado — toast de erro')
  } else if (!item0Ok15) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `15 — Item 1 deve exibir ${refItem}`)
  } else if (!pedidoManteve15) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `15 — Pedido deve manter ${refTodos}`)
  } else if (!demaisItensOk15) {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `15 — Demais itens devem manter ${refTodos}`)
  } else {
    logAprovado(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, `15 — Editar apenas o item 1 (${refItem})`)
  }

  // 16 — alerta de divergência
  await page.waitForTimeout(600)
  const temAlerta16 = await pedidoTemAlertaReferenciaImportadorDivergente(page, rowId)
  await screenshot(page, '16-ref-importador-alerta-divergencia.png')
  if (temAlerta16) {
    logAprovado(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '16 — Alerta de divergência visível na coluna do pedido')
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_REF_IMPORTADOR, '16 — Alerta «Referências divergentes entre itens» não detectado')
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

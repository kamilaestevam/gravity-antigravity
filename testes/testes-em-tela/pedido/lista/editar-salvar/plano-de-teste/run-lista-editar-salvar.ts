/**
 * Teste em tela — Lista Pedido: Nº PEDIDO / Nº ITEM + TIPO OP. + REF. IMP./EXP. + INCOTERM + DESCRIÇÃO + LOGÍSTICA (6 colunas)
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
const COLUNA_NCM = 'NCM'
const COL_KEY_NCM = 'ncm'
const NCM_CODIGO_TESTE = '8528.59.00'
const NCM_BUSCA_TEXTO = 'monitor'
const TOOLTIP_NCM_PEDIDO_REGEX = /editável no pedido/i
const COLUNA_QTD_PRONTA = 'QTD. PRONTA DO PEDIDO/ITEM'
const COL_KEY_QTD_PRONTA = 'quantidade_pronta_itens_pedido_total'
const ALERTA_UNIDADES_DIVERGENTES = /unidades divergentes entre itens/i
const AVISO_IMPACTO_UNIDADE_PRONTA =
  /alteração da unidade irá alterar também unidade comercializada, qtd\. inicial, qtd\. transferida, saldo e qtd\. cancelada/i
const QTD_PRONTA_VALOR_INCLUIR = '150,00'
const QTD_PRONTA_VALOR_EDITAR = '275,50'
const UNIDADE_QTD_PRONTA = 'UN'
const HUB_URL = `${BASE_UI}/hub`
const COLUNA_REF_IMPORTADOR = 'REFERÊNCIA IMPORTADOR'
const COL_KEY_REF_IMPORTADOR = 'referencia_importador'
const COLUNA_REF_EXPORTADOR = 'REFERÊNCIA EXPORTADOR'
const COL_KEY_REF_EXPORTADOR = 'referencia_exportador'
const COLUNA_INCOTERM = 'INCOTERM'
const COL_KEY_INCOTERM = 'incoterm'
const COLUNA_DESCRICAO_ITEM = 'DESCRIÇÃO DO ITEM'
const COL_KEY_DESCRICAO_ITEM = 'descricao_item'
const TITULO_TOOLTIP_DESCRICAO = 'Descrição do Item'
const ALERTA_REF_DIVERGENTE = /referências divergentes entre itens/i
const ALERTA_INCOTERM_DIVERGENTE = /incoterms divergentes entre itens/i
const ALERTA_PILL_DIVERGENCIA = /alerta se itens divergirem/i

const PILLS_TOOLTIP_LOGISTICA = [
  /editável no pedido/i,
  /editável no item/i,
  /espelhado com itens e pedido/i,
] as const

const PILLS_TOOLTIP_DESCRICAO = [
  /editável no pedido/i,
  /editável no item/i,
  /aplicar em todos os itens/i,
] as const

type ConfigLogisticaCampo = {
  key: string
  colunaLabel: string
  tituloTooltip: string
  opcaoPedido: string
  opcaoItem: string
  passo: number
  slug: string
}

/** SSOT alinhado a `CAMPOS_LOGISTICA_PEDIDO` + i18n `pedido.coluna_pai.*_titulo`. */
const CFG_LOGISTICA_COLUNAS: ConfigLogisticaCampo[] = [
  { key: 'porto_origem', colunaLabel: 'PORTO DE ORIGEM', tituloTooltip: 'Porto de Origem', opcaoPedido: 'BRFOR', opcaoItem: 'BRSSZ', passo: 29, slug: 'porto-origem' },
  { key: 'porto_destino', colunaLabel: 'PORTO DE DESTINO', tituloTooltip: 'Porto de Destino', opcaoPedido: 'BRSSZ', opcaoItem: 'BRITJ', passo: 30, slug: 'porto-destino' },
  { key: 'local_de_origem', colunaLabel: 'PAÍS DE ORIGEM', tituloTooltip: 'País de Origem', opcaoPedido: 'BR', opcaoItem: 'DE', passo: 31, slug: 'pais-origem' },
  { key: 'local_de_destino', colunaLabel: 'PAÍS DE DESTINO', tituloTooltip: 'País de Destino', opcaoPedido: 'DE', opcaoItem: 'AO', passo: 32, slug: 'pais-destino' },
  { key: 'aeroporto_origem', colunaLabel: 'AEROPORTO DE ORIGEM', tituloTooltip: 'Aeroporto de Origem', opcaoPedido: 'GRU', opcaoItem: 'CGH', passo: 33, slug: 'aeroporto-origem' },
  { key: 'aeroporto_destino', colunaLabel: 'AEROPORTO DE DESTINO', tituloTooltip: 'Aeroporto de Destino', opcaoPedido: 'EZE', opcaoItem: 'GRU', passo: 34, slug: 'aeroporto-destino' },
]

type ConfigReferenciaCampo = {
  colunaLabel: string
  colKey: string
  passoSolo: number
  passoReplicar: number
  passoItem: number
  passoAlerta: number
  prefixoValor: string
  slugPrint: string
}

const CFG_REF_IMPORTADOR: ConfigReferenciaCampo = {
  colunaLabel: COLUNA_REF_IMPORTADOR,
  colKey: COL_KEY_REF_IMPORTADOR,
  passoSolo: 13,
  passoReplicar: 14,
  passoItem: 15,
  passoAlerta: 16,
  prefixoValor: 'REF-IMP-EMT',
  slugPrint: 'importador',
}

const CFG_REF_EXPORTADOR: ConfigReferenciaCampo = {
  colunaLabel: COLUNA_REF_EXPORTADOR,
  colKey: COL_KEY_REF_EXPORTADOR,
  passoSolo: 17,
  passoReplicar: 18,
  passoItem: 19,
  passoAlerta: 20,
  prefixoValor: 'REF-EXP-EMT',
  slugPrint: 'exportador',
}
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
  log('✓ Colunas: "Selecionar tudo" aplicado (Nº PEDIDO, TIPO OP., REF., INCOTERM, DESCRIÇÃO, LOGÍSTICA visíveis)')
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

function printSelecao(prefixo: string): string {
  return `${prefixo}-selecao.png`
}

function printResultado(prefixo: string): string {
  return `${prefixo}-resultado.png`
}

async function abrirPopoverTextoPai(page: Page, rowId: string, campo: string): Promise<boolean> {
  await scrollColunaParaVisivel(page, campo)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  if (await cel.count() === 0) return false
  await cel.click()
  return page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
    .waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function abrirPopoverTextoItem(
  page: Page,
  pedidoRowId: string,
  indice: number,
  campo: string,
): Promise<boolean> {
  const clicou = await clicarCelulaItemPorIndice(page, pedidoRowId, indice, campo)
  if (!clicou) return false
  return page.locator('.gtv-edit-popover .gtv-edit-popover-input').first()
    .waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function marcarCheckboxReplicarPopover(page: Page): Promise<boolean> {
  const cb = page.locator('.gtv-edit-popover input[type="checkbox"]').first()
  if (!(await cb.isVisible().catch(() => false))) return false
  if (!(await cb.isChecked().catch(() => false))) await cb.check()
  return true
}

async function preencherPopoverTexto(page: Page, valor: string): Promise<void> {
  await page.locator('.gtv-edit-popover .gtv-edit-popover-input').first().fill(valor)
}

async function confirmarPopoverTexto(page: Page): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  await page.locator('.gtv-edit-popover .gtv-edit-popover-input').first().press('Enter')
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

async function editarCampoTextoPai(
  page: Page,
  rowId: string,
  campo: string,
  novoValor: string,
  opts?: { replicarEmItens?: boolean; scrollColuna?: boolean },
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const abriu = await abrirPopoverTextoPai(page, rowId, campo)
  if (!abriu) return 'nenhuma'
  if (opts?.replicarEmItens) await marcarCheckboxReplicarPopover(page)
  await preencherPopoverTexto(page, novoValor)
  return confirmarPopoverTexto(page)
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
  await selecionarOpcaoPopoverSelect(page, label)
}

async function clicarOpcaoPopoverSelect(page: Page, siglaOuLabel: string): Promise<void> {
  const re = new RegExp(`\\b${siglaOuLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  await page.locator('.gtv-edit-popover .gtv-edit-popover-opcao').filter({ hasText: re }).first().click()
}

/** Select sem checkbox: clique na opção já dispara save e fecha o popover. */
async function selecionarOpcaoPopoverSelect(page: Page, siglaOuLabel: string): Promise<void> {
  await clicarOpcaoPopoverSelect(page, siglaOuLabel)
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
}

/**
 * Select com checkbox «Aplicar a todos os itens»: clique só pré-seleciona;
 * o GTV exige botão Confirmar (ou Enter) para enviar replicar_em_itens.
 */
async function confirmarPopoverSelectComBotao(page: Page): Promise<void> {
  const btn = page.locator('.gtv-edit-popover .gtv-edit-popover-btn--primary').filter({ hasText: /^Confirmar$/ })
  await btn.click()
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 15000 })
}

async function popoverSelectTemOpcoes(page: Page): Promise<number> {
  const visivel = await page.locator('.gtv-edit-popover-opcoes').isVisible().catch(() => false)
  if (!visivel) return 0
  return page.locator('.gtv-edit-popover .gtv-edit-popover-opcao').count()
}

/** Extrai siglas (FOB, CIF…) das opções do select padrão Incoterm (Cadastros). */
async function listarSiglasIncotermPopover(page: Page): Promise<string[]> {
  const textos = await page.locator('.gtv-edit-popover .gtv-edit-popover-opcao').evaluateAll(els =>
    els.map(el => el.textContent?.trim() ?? '').filter(Boolean),
  )
  const siglas = textos.map(t => t.split(/\s|—|–|-/)[0]?.trim() ?? '').filter(Boolean)
  return [...new Set(siglas)]
}

async function resolverTresIncotermsDistintos(page: Page, rowId: string): Promise<string[] | null> {
  await fecharPopoverSeAberto(page)
  await scrollColunaParaVisivel(page, COL_KEY_INCOTERM)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_INCOTERM}"]`)
  if (await cel.count() === 0) return null
  await cel.click()
  const abriu = await page.locator('.gtv-edit-popover-opcoes').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
  if (!abriu) return null
  const siglas = await listarSiglasIncotermPopover(page)
  await fecharPopoverSeAberto(page)
  if (siglas.length < 3) return null
  return siglas.slice(0, 3)
}

async function abrirPopoverSelectPai(page: Page, rowId: string, campo: string): Promise<boolean> {
  await scrollColunaParaVisivel(page, campo)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  if (await cel.count() === 0) return false
  await cel.click()
  return page.locator('.gtv-edit-popover-opcoes').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function abrirPopoverSelectItem(
  page: Page,
  pedidoRowId: string,
  indice: number,
  campo: string,
): Promise<boolean> {
  const clicou = await clicarCelulaItemPorIndice(page, pedidoRowId, indice, campo)
  if (!clicou) return false
  return page.locator('.gtv-edit-popover-opcoes').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function destacarSiglaNoPopoverSelect(page: Page, sigla: string): Promise<void> {
  await page.evaluate((codigo) => {
    const re = new RegExp(`\\b${codigo}\\b`, 'i')
    const op = Array.from(document.querySelectorAll('.gtv-edit-popover-opcao'))
      .find(el => re.test(el.textContent ?? ''))
    if (op) (op as HTMLElement).scrollIntoView({ block: 'nearest' })
  }, sigla)
}

async function confirmarOpcaoPopoverSelect(
  page: Page,
  sigla: string,
  opts?: { replicarEmItens?: boolean },
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  await clicarOpcaoPopoverSelect(page, sigla)
  if (opts?.replicarEmItens) {
    await confirmarPopoverSelectComBotao(page)
  } else {
    await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  }
  return aguardarNotificacaoSalvar(page)
}

async function editarCampoSelectPai(
  page: Page,
  rowId: string,
  campo: string,
  sigla: string,
  opts?: { replicarEmItens?: boolean; scrollColuna?: boolean },
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const abriu = await abrirPopoverSelectPai(page, rowId, campo)
  if (!abriu) return 'nenhuma'
  if (opts?.replicarEmItens) await marcarCheckboxReplicarPopover(page)
  return confirmarOpcaoPopoverSelect(page, sigla, { replicarEmItens: opts?.replicarEmItens })
}

async function clicarCelulaItemPorIndice(
  page: Page,
  pedidoRowId: string,
  indiceItem: number,
  colKey: string,
): Promise<boolean> {
  await scrollColunaParaVisivel(page, colKey)
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
  }, { paiId: pedidoRowId, idx: indiceItem, colKey })
}

async function editarCampoSelectItemPorIndice(
  page: Page,
  pedidoRowId: string,
  indice: number,
  campo: string,
  sigla: string,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const clicou = await clicarCelulaItemPorIndice(page, pedidoRowId, indice, campo)
  if (!clicou) return 'nenhuma'
  const abriu = await page.locator('.gtv-edit-popover-opcoes').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
  if (!abriu) return 'nenhuma'
  await selecionarOpcaoPopoverSelect(page, sigla)
  return aguardarNotificacaoSalvar(page)
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
  await validarReferenciaCampoLista(page, rowId, sufixo, qtdItens, CFG_REF_IMPORTADOR)
  await validarReferenciaCampoLista(page, rowId, sufixo, qtdItens, CFG_REF_EXPORTADOR)
  await validarIncotermLista(page, rowId, qtdItens)
  await validarDescricaoItemLista(page, rowId, sufixo, qtdItens)
  await validarLogisticaLista(page, rowId, qtdItens)
  await validarNcmLista(page, rowId)
  await validarQtdProntaLista(page, rowId, numeroPedido)
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

async function pedidoTemAlertaCampoDivergente(
  page: Page,
  pedidoRowId: string,
  colKey: string,
  padraoTooltip: RegExp,
): Promise<boolean> {
  await scrollColunaParaVisivel(page, colKey)
  const cel = page.locator(`[data-gtv-rowid="${pedidoRowId}"][data-gtv-campo="${colKey}"]`)
  const svg = await cel.locator('svg').count()
  if (svg > 0) return true
  const title = await cel.getAttribute('title').catch(() => null)
  if (title && padraoTooltip.test(title)) return true
  const texto = await cel.textContent()
  return Boolean(texto && padraoTooltip.test(texto))
}

/** Passos 13–16 (importador) ou 17–20 (exportador) — padrão Incoterm: pedido+item editáveis, checkbox, alerta. */
async function validarReferenciaCampoLista(
  page: Page,
  rowId: string,
  sufixo: string,
  qtdItens: number,
  cfg: ConfigReferenciaCampo,
): Promise<void> {
  const { colunaLabel, colKey, passoSolo, passoReplicar, passoItem, passoAlerta, prefixoValor, slugPrint } = cfg
  log(`ℹ Coluna ${colunaLabel}: passos ${passoSolo}–${passoAlerta} (pedido sem replicar, com checkbox, item isolado, alerta)`)

  if (qtdItens < 1) {
    falharTabela(LOCAL_LISTA, colunaLabel, 'Pré-condição — pedido sem itens visíveis')
    return
  }

  const refSolo = `${prefixoValor}-SOLO-${sufixo}`
  const refTodos = `${prefixoValor}-TODOS-${sufixo}`
  const refItem = `${prefixoValor}-ITEM-${sufixo}`

  const textosItensAntes = await lerTextosCampoItens(page, rowId, colKey)
  const prefixoSolo = `${String(passoSolo).padStart(2, '0')}-ref-${slugPrint}-pedido-sem-replicar`
  const prefixoTodos = `${String(passoReplicar).padStart(2, '0')}-ref-${slugPrint}-pedido-replicar-todos`
  const prefixoItem = `${String(passoItem).padStart(2, '0')}-ref-${slugPrint}-editar-item-isolado`

  // pedido sem replicar — selecao → resultado
  await fecharPopoverSeAberto(page)
  const abriuSolo = await abrirPopoverTextoPai(page, rowId, colKey)
  if (!abriuSolo) {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passoSolo} — Abrir popover no pedido (sem replicar)`)
  } else {
    await preencherPopoverTexto(page, refSolo)
    await screenshot(page, printSelecao(prefixoSolo))
    const notifSolo = await confirmarPopoverTexto(page)
    await page.waitForTimeout(600)
    const textoPaiSolo = await lerTextoCampoPai(page, rowId, colKey)
    const textosItensSolo = await lerTextosCampoItens(page, rowId, colKey)
    await screenshot(page, printResultado(prefixoSolo))

    const pedidoOkSolo = celulaContemValor(textoPaiSolo, refSolo)
    const itensNaoReplicaram = textosItensSolo.every((t, i) => t === (textosItensAntes[i] ?? ''))

    if (notifSolo === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoSolo} — Salvar pedido sem replicar — toast de erro`)
    } else if (!pedidoOkSolo) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoSolo} — Pedido deve exibir ${refSolo}`)
    } else if (!itensNaoReplicaram) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoSolo} — Itens não devem replicar ao salvar pedido sem checkbox`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `${passoSolo} — Salvar pedido sem replicar (${refSolo})`)
    }
  }

  // pedido com checkbox replicar — selecao → resultado
  await fecharPopoverSeAberto(page)
  const abriuTodos = await abrirPopoverTextoPai(page, rowId, colKey)
  if (!abriuTodos) {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passoReplicar} — Abrir popover no pedido (com replicar)`)
  } else {
    const temCbReplicar = await popoverExibeCheckboxReplicar(page)
    if (!temCbReplicar) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoReplicar} — Popover do pedido deve exibir checkbox «Aplicar a todos os itens»`)
    }
    await marcarCheckboxReplicarPopover(page)
    await preencherPopoverTexto(page, refTodos)
    await screenshot(page, printSelecao(prefixoTodos))
    const notifTodos = await confirmarPopoverTexto(page)
    await page.waitForTimeout(800)
    const textoPaiTodos = await lerTextoCampoPai(page, rowId, colKey)
    const textosItensTodos = await lerTextosCampoItens(page, rowId, colKey)
    await screenshot(page, printResultado(prefixoTodos))

    const pedidoOkTodos = celulaContemValor(textoPaiTodos, refTodos)
    const itensOkTodos = textosItensTodos.length > 0 && textosItensTodos.every(t => celulaContemValor(t, refTodos))

    if (notifTodos === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoReplicar} — Salvar pedido com replicar — toast de erro`)
    } else if (!pedidoOkTodos || !itensOkTodos) {
      log(`ℹ Diagnóstico ${colKey}: pai=${JSON.stringify(textoPaiTodos)}, itens=${JSON.stringify(textosItensTodos)}`)
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoReplicar} — Pedido e todos os itens devem exibir ${refTodos}`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `${passoReplicar} — Replicar para todos os itens (${refTodos}, ${textosItensTodos.length} itens)`)
    }
  }

  // editar só o 1º item — selecao → resultado
  await fecharPopoverSeAberto(page)
  const abriuItem = await abrirPopoverTextoItem(page, rowId, 0, colKey)
  let notifItem: 'sucesso' | 'erro' | 'nenhuma' = 'nenhuma'
  let textoPaiItem = ''
  let textosItensItem: string[] = []
  if (!abriuItem) {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passoItem} — Abrir popover no item 1`)
  } else {
    await preencherPopoverTexto(page, refItem)
    await screenshot(page, printSelecao(prefixoItem))
    notifItem = await confirmarPopoverTexto(page)
    await page.waitForTimeout(800)
    textoPaiItem = await lerTextoCampoPai(page, rowId, colKey)
    textosItensItem = await lerTextosCampoItens(page, rowId, colKey)
    await screenshot(page, printResultado(prefixoItem))

    const item0Ok = celulaContemValor(textosItensItem[0], refItem)
    const pedidoManteve = celulaContemValor(textoPaiItem, refTodos)
    const demaisItensOk = textosItensItem.length <= 1
      || textosItensItem.slice(1).every(t => celulaContemValor(t, refTodos))

    if (notifItem === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoItem} — Salvar item isolado — toast de erro`)
    } else if (!item0Ok) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoItem} — Item 1 deve exibir ${refItem}`)
    } else if (!pedidoManteve) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoItem} — Pedido deve manter ${refTodos}`)
    } else if (!demaisItensOk) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passoItem} — Demais itens devem manter ${refTodos}`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `${passoItem} — Editar apenas o item 1 (${refItem})`)
    }
  }

  // alerta de divergência
  await page.waitForTimeout(600)
  const temAlerta = await pedidoTemAlertaCampoDivergente(page, rowId, colKey, ALERTA_REF_DIVERGENTE)
  await screenshot(page, `${String(passoAlerta).padStart(2, '0')}-ref-${slugPrint}-alerta-divergencia-resultado.png`)
  if (temAlerta) {
    logAprovado(LOCAL_LISTA, colunaLabel, `${passoAlerta} — Alerta de divergência visível na coluna do pedido`)
  } else {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passoAlerta} — Alerta «Referências divergentes entre itens» não detectado`)
  }
}

async function esconderTooltipGlobal(page: Page): Promise<void> {
  await page.mouse.move(8, 8)
  await page.waitForTimeout(250)
  await page.locator('.tg-card').waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {})
}

async function validarTooltipLogisticaCelula(
  page: Page,
  locatorCelula: ReturnType<Page['locator']>,
  tituloEsperado: string,
  nomePrint: string,
): Promise<boolean> {
  await esconderTooltipGlobal(page)
  await locatorCelula.hover()
  const visivel = await page.locator('.tg-card').first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false)
  if (!visivel) return false
  await screenshot(page, nomePrint)
  const titulo = (await page.locator('.tg-titulo').first().textContent()) ?? ''
  const descricao = (await page.locator('.tg-descricao').first().innerText()) ?? ''
  const tituloOk = normalizarTipoOperacaoTexto(titulo).includes(normalizarTipoOperacaoTexto(tituloEsperado))
  const pillsOk = PILLS_TOOLTIP_LOGISTICA.every(re => re.test(descricao))
  return tituloOk && pillsOk
}

async function validarTooltipDescricaoCelula(
  page: Page,
  locatorCelula: ReturnType<Page['locator']>,
  nomePrint: string,
): Promise<boolean> {
  await esconderTooltipGlobal(page)
  await locatorCelula.hover()
  const visivel = await page.locator('.tg-card').first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false)
  if (!visivel) return false
  await screenshot(page, nomePrint)
  const titulo = (await page.locator('.tg-titulo').first().textContent()) ?? ''
  const descricao = (await page.locator('.tg-descricao').first().innerText()) ?? ''
  const tituloOk = normalizarTipoOperacaoTexto(titulo).includes(normalizarTipoOperacaoTexto(TITULO_TOOLTIP_DESCRICAO))
  const pillsOk = PILLS_TOOLTIP_DESCRICAO.every(re => re.test(descricao))
  const semPillAlerta = !ALERTA_PILL_DIVERGENCIA.test(descricao)
  return tituloOk && pillsOk && semPillAlerta
}

async function selecionarOpcaoPopoverPorTermo(page: Page, termo: string): Promise<void> {
  await page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 })
  await page.waitForFunction(
    () => document.querySelectorAll('.gtv-edit-popover-opcao').length > 0,
    undefined,
    { timeout: 20000 },
  )
  const clicou = await page.evaluate((t) => {
    const botoes = Array.from(document.querySelectorAll('.gtv-edit-popover-opcao')) as HTMLElement[]
    const alvo = botoes.find(b => (b.textContent ?? '').includes(t))
      ?? botoes.find(b => (b.textContent ?? '').trim().startsWith(t))
    const btn = alvo ?? botoes[0]
    if (!btn) return false
    btn.click()
    return true
  }, termo)
  if (!clicou) throw new Error(`Nenhuma opção no popover para termo "${termo}"`)
  await page.waitForTimeout(300)
}

async function confirmarOpcaoPopoverPorTermo(page: Page, termo: string): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  await selecionarOpcaoPopoverPorTermo(page, termo)
  return aguardarNotificacaoSalvar(page)
}

function prefixoPrintLogistica(passo: number, slug: string): string {
  return `${String(passo).padStart(2, '0')}-log-${slug}`
}

/** Um campo logístico — passo N (tooltip pedido/item, edição espelhada, sem checkbox). */
async function validarLogisticaCampoLista(
  page: Page,
  rowId: string,
  qtdItens: number,
  cfg: ConfigLogisticaCampo,
): Promise<void> {
  const { key, colunaLabel, tituloTooltip, opcaoPedido, opcaoItem, passo, slug } = cfg
  const prefix = prefixoPrintLogistica(passo, slug)
  log(`ℹ Coluna ${colunaLabel}: passo ${passo} (tooltip espelhado + select pedido/item)`)

  await scrollColunaParaVisivel(page, key)
  const celPai = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${key}"]`)
  const celItem = page.locator(`.gtv-linha--filho [data-gtv-campo="${key}"]`).first()

  const tooltipPaiOk = await validarTooltipLogisticaCelula(
    page,
    celPai,
    tituloTooltip,
    `${prefix}-tooltip-pedido.png`,
  )
  if (tooltipPaiOk) {
    logAprovado(LOCAL_LISTA, colunaLabel, `${passo} — Tooltip pedido («${tituloTooltip}» + 3 pills espelhadas)`)
  } else {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Tooltip pedido com título e pills espelhadas`)
  }

  await esconderTooltipGlobal(page)
  const tooltipItemOk = await validarTooltipLogisticaCelula(
    page,
    celItem,
    tituloTooltip,
    `${prefix}-tooltip-item.png`,
  )
  if (tooltipItemOk) {
    logAprovado(LOCAL_LISTA, colunaLabel, `${passo} — Tooltip item («${tituloTooltip}» + 3 pills espelhadas)`)
  } else {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Tooltip item com título e pills espelhadas`)
  }

  // Edição no pedido — espelha nos itens; sem checkbox replicar
  await fecharPopoverSeAberto(page)
  const abriuPedido = await abrirPopoverSelectPai(page, rowId, key)
  if (!abriuPedido) {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Abrir select no pedido`)
  } else {
    const temCheckbox = await popoverExibeCheckboxReplicar(page)
    if (temCheckbox) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Popover logística não deve exibir checkbox «Aplicar a todos os itens»`)
    }
    await destacarSiglaNoPopoverSelect(page, opcaoPedido)
    await screenshot(page, printSelecao(`${prefix}-pedido`))
    const notifPedido = await confirmarOpcaoPopoverPorTermo(page, opcaoPedido)
    await page.waitForTimeout(800)
    const textoPai = await lerTextoCampoPai(page, rowId, key)
    const textosItens = await lerTextosCampoItens(page, rowId, key)
    await screenshot(page, printResultado(`${prefix}-pedido`))

    const pedidoOk = celulaContemValor(textoPai, opcaoPedido)
    const itensEspelhados = textosItens.length > 0
      && textosItens.every(t => celulaContemValor(t, opcaoPedido))

    if (notifPedido === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Salvar pedido (${opcaoPedido}) — toast de erro`)
    } else if (!pedidoOk) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Pedido deve exibir ${opcaoPedido}`)
    } else if (!itensEspelhados) {
      log(`ℹ Diagnóstico ${key}: pai=${JSON.stringify(textoPai)}, itens=${JSON.stringify(textosItens)}`)
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Itens devem espelhar pedido após edição no pedido`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `${passo} — Editar pedido (${opcaoPedido}) — espelhado em ${textosItens.length} item(ns)`)
    }
  }

  // Edição no item — roteia PATCH pedido; todos espelham
  await fecharPopoverSeAberto(page)
  const abriuItem = await abrirPopoverSelectItem(page, rowId, 0, key)
  if (!abriuItem) {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Abrir select no item 1`)
  } else {
    await destacarSiglaNoPopoverSelect(page, opcaoItem)
    await screenshot(page, printSelecao(`${prefix}-item`))
    const notifItem = await confirmarOpcaoPopoverPorTermo(page, opcaoItem)
    await page.waitForTimeout(800)
    const textoPaiItem = await lerTextoCampoPai(page, rowId, key)
    const textosItensItem = await lerTextosCampoItens(page, rowId, key)
    await screenshot(page, printResultado(`${prefix}-item`))

    const pedidoAtualizado = celulaContemValor(textoPaiItem, opcaoItem)
    const itensOk = textosItensItem.length > 0
      && textosItensItem.every(t => celulaContemValor(t, opcaoItem))

    if (notifItem === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Salvar item (${opcaoItem}) — toast de erro`)
    } else if (!pedidoAtualizado) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Pedido deve atualizar para ${opcaoItem} via edição no item`)
    } else if (!itensOk) {
      falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Todos os itens devem espelhar ${opcaoItem}`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `${passo} — Editar item (${opcaoItem}) — pedido + ${textosItensItem.length} item(ns) espelhados`)
    }
  }

  // Sem alerta de divergência (logística não diverge)
  await page.waitForTimeout(400)
  const temAlertaRef = await pedidoTemAlertaCampoDivergente(page, rowId, key, ALERTA_REF_DIVERGENTE)
  const temAlertaInc = await pedidoTemAlertaCampoDivergente(page, rowId, key, ALERTA_INCOTERM_DIVERGENTE)
  if (temAlertaRef || temAlertaInc) {
    falharTabela(LOCAL_LISTA, colunaLabel, `${passo} — Coluna logística não deve exibir alerta de divergência`)
  } else if (qtdItens >= 1) {
    logAprovado(LOCAL_LISTA, colunaLabel, `${passo} — Sem alerta de divergência na coluna`)
  }
}

/** Passos 25–28 — DESCRIÇÃO DO ITEM (ghost: tooltip + texto + checkbox; sem alerta). */
async function validarDescricaoItemLista(
  page: Page,
  rowId: string,
  sufixo: string,
  qtdItens: number,
): Promise<void> {
  const colKey = COL_KEY_DESCRICAO_ITEM
  const colunaLabel = COLUNA_DESCRICAO_ITEM
  log(`ℹ Coluna ${colunaLabel}: passos 25–28 (tooltip ghost + pedido/item + sem alerta de divergência)`)

  if (qtdItens < 1) {
    falharTabela(LOCAL_LISTA, colunaLabel, 'Pré-condição — pedido sem itens visíveis')
    return
  }

  const descSolo = `DESC-EMT-SOLO-${sufixo}`
  const descTodos = `DESC-EMT-TODOS-${sufixo}`
  const descItem = `DESC-EMT-ITEM-${sufixo}`

  await scrollColunaParaVisivel(page, colKey)
  const celPai = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${colKey}"]`)
  const celItem = page.locator(`.gtv-linha--filho [data-gtv-campo="${colKey}"]`).first()

  // 25 — tooltips pedido e item
  const tooltipPaiOk = await validarTooltipDescricaoCelula(page, celPai, '25-descricao-tooltip-pedido.png')
  if (tooltipPaiOk) {
    logAprovado(LOCAL_LISTA, colunaLabel, '25 — Tooltip pedido («Descrição do Item» + 3 pills ghost)')
  } else {
    falharTabela(LOCAL_LISTA, colunaLabel, '25 — Tooltip pedido com título e 3 pills (sem alerta)')
  }

  await esconderTooltipGlobal(page)
  const tooltipItemOk = await validarTooltipDescricaoCelula(page, celItem, '25-descricao-tooltip-item.png')
  if (tooltipItemOk) {
    logAprovado(LOCAL_LISTA, colunaLabel, '25 — Tooltip item («Descrição do Item» + 3 pills ghost)')
  } else {
    falharTabela(LOCAL_LISTA, colunaLabel, '25 — Tooltip item com título e 3 pills (sem alerta)')
  }

  const textosItensAntes = await lerTextosCampoItens(page, rowId, colKey)

  // 26 — pedido sem replicar
  await fecharPopoverSeAberto(page)
  const abriuSolo = await abrirPopoverTextoPai(page, rowId, colKey)
  if (!abriuSolo) {
    falharTabela(LOCAL_LISTA, colunaLabel, '26 — Abrir popover no pedido (sem replicar)')
  } else {
    await preencherPopoverTexto(page, descSolo)
    await screenshot(page, printSelecao('26-descricao-pedido-sem-replicar'))
    const notifSolo = await confirmarPopoverTexto(page)
    await page.waitForTimeout(600)
    const textoPaiSolo = await lerTextoCampoPai(page, rowId, colKey)
    const textosItensSolo = await lerTextosCampoItens(page, rowId, colKey)
    await screenshot(page, printResultado('26-descricao-pedido-sem-replicar'))

    const pedidoOkSolo = celulaContemValor(textoPaiSolo, descSolo)
    const itensNaoReplicaram = textosItensSolo.every((t, i) => t === (textosItensAntes[i] ?? ''))

    if (notifSolo === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `26 — Salvar pedido sem replicar (${descSolo}) — toast de erro`)
    } else if (!pedidoOkSolo) {
      falharTabela(LOCAL_LISTA, colunaLabel, `26 — Pedido deve exibir ${descSolo}`)
    } else if (!itensNaoReplicaram) {
      falharTabela(LOCAL_LISTA, colunaLabel, '26 — Itens não devem replicar ao salvar pedido sem checkbox')
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `26 — Salvar pedido sem replicar (${descSolo})`)
    }
  }

  // 27 — pedido com checkbox replicar
  await fecharPopoverSeAberto(page)
  const abriuTodos = await abrirPopoverTextoPai(page, rowId, colKey)
  if (!abriuTodos) {
    falharTabela(LOCAL_LISTA, colunaLabel, '27 — Abrir popover no pedido (com replicar)')
  } else {
    const temCbReplicar = await popoverExibeCheckboxReplicar(page)
    if (!temCbReplicar) {
      falharTabela(LOCAL_LISTA, colunaLabel, '27 — Popover do pedido deve exibir checkbox «Aplicar a todos os itens»')
    }
    await marcarCheckboxReplicarPopover(page)
    await preencherPopoverTexto(page, descTodos)
    await screenshot(page, printSelecao('27-descricao-pedido-replicar-todos'))
    const notifTodos = await confirmarPopoverTexto(page)
    await page.waitForTimeout(800)
    const textoPaiTodos = await lerTextoCampoPai(page, rowId, colKey)
    const textosItensTodos = await lerTextosCampoItens(page, rowId, colKey)
    await screenshot(page, printResultado('27-descricao-pedido-replicar-todos'))

    const pedidoOkTodos = celulaContemValor(textoPaiTodos, descTodos)
    const itensOkTodos = textosItensTodos.length > 0 && textosItensTodos.every(t => celulaContemValor(t, descTodos))

    if (notifTodos === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `27 — Salvar pedido com replicar (${descTodos}) — toast de erro`)
    } else if (!pedidoOkTodos || !itensOkTodos) {
      log(`ℹ Diagnóstico descricao_item: pai=${JSON.stringify(textoPaiTodos)}, itens=${JSON.stringify(textosItensTodos)}`)
      falharTabela(LOCAL_LISTA, colunaLabel, `27 — Pedido e todos os itens devem exibir ${descTodos}`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `27 — Replicar para todos os itens (${descTodos}, ${textosItensTodos.length} itens)`)
    }
  }

  // 28 — item isolado + sem alerta de divergência
  await fecharPopoverSeAberto(page)
  const abriuItem = await abrirPopoverTextoItem(page, rowId, 0, colKey)
  if (!abriuItem) {
    falharTabela(LOCAL_LISTA, colunaLabel, '28 — Abrir popover no item 1')
  } else {
    await preencherPopoverTexto(page, descItem)
    await screenshot(page, printSelecao('28-descricao-editar-item-isolado'))
    const notifItem = await confirmarPopoverTexto(page)
    await page.waitForTimeout(800)
    const textoPaiItem = await lerTextoCampoPai(page, rowId, colKey)
    const textosItensItem = await lerTextosCampoItens(page, rowId, colKey)
    await screenshot(page, printResultado('28-descricao-editar-item-isolado'))

    const item0Ok = celulaContemValor(textosItensItem[0], descItem)
    const pedidoManteve = celulaContemValor(textoPaiItem, descTodos)
    const demaisItensOk = textosItensItem.length <= 1
      || textosItensItem.slice(1).every(t => celulaContemValor(t, descTodos))

    if (notifItem === 'erro') {
      falharTabela(LOCAL_LISTA, colunaLabel, `28 — Salvar item isolado (${descItem}) — toast de erro`)
    } else if (!item0Ok) {
      falharTabela(LOCAL_LISTA, colunaLabel, `28 — Item 1 deve exibir ${descItem}`)
    } else if (!pedidoManteve) {
      falharTabela(LOCAL_LISTA, colunaLabel, `28 — Pedido deve manter ${descTodos}`)
    } else if (!demaisItensOk) {
      falharTabela(LOCAL_LISTA, colunaLabel, `28 — Demais itens devem manter ${descTodos}`)
    } else {
      logAprovado(LOCAL_LISTA, colunaLabel, `28 — Editar apenas o item 1 (${descItem})`)
    }
  }

  await page.waitForTimeout(400)
  const temAlertaRef = await pedidoTemAlertaCampoDivergente(page, rowId, colKey, ALERTA_REF_DIVERGENTE)
  const temAlertaInc = await pedidoTemAlertaCampoDivergente(page, rowId, colKey, ALERTA_INCOTERM_DIVERGENTE)
  const temAlertaGenerico = await pedidoTemAlertaCampoDivergente(page, rowId, colKey, /diverg/i)
  await screenshot(page, '28-descricao-sem-alerta-divergencia-resultado.png')
  if (temAlertaRef || temAlertaInc || temAlertaGenerico) {
    falharTabela(LOCAL_LISTA, colunaLabel, '28 — Coluna descrição não deve exibir alerta âmbar de divergência')
  } else {
    logAprovado(LOCAL_LISTA, colunaLabel, '28 — Sem alerta de divergência na coluna do pedido')
  }
}

/** Passos 29–34 — LOGÍSTICA (6 colunas espelhadas). */
async function validarLogisticaLista(page: Page, rowId: string, qtdItens: number): Promise<void> {
  log('ℹ ETAPA 7 — LOGÍSTICA: passos 29–34 (Porto, País, Aeroporto — tooltip + edição espelhada)')
  if (qtdItens < 1) {
    falharTabela(LOCAL_LISTA, 'LOGÍSTICA', 'Pré-condição — pedido sem itens visíveis')
    return
  }
  for (const cfg of CFG_LOGISTICA_COLUNAS) {
    await fecharPopoverSeAberto(page)
    await validarLogisticaCampoLista(page, rowId, qtdItens, cfg)
  }
}

/** Passos 21–24 — INCOTERM (select Cadastros; selecao → resultado por ação). */
async function validarIncotermLista(page: Page, rowId: string, qtdItens: number): Promise<void> {
  log(`ℹ Coluna ${COLUNA_INCOTERM}: passos 21–24 (select: selecao → resultado; alerta no 24)`)

  if (qtdItens < 1) {
    falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, 'Pré-condição — pedido sem itens visíveis')
    return
  }

  const incoterms = await resolverTresIncotermsDistintos(page, rowId)
  if (!incoterms || incoterms.length < 3) {
    falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, 'Pré-condição — select Incoterm deve listar ≥3 opções do Cadastros')
    return
  }

  const [incSolo, incTodos, incItem] = incoterms
  const textosItensAntes = await lerTextosCampoItens(page, rowId, COL_KEY_INCOTERM)

  // 21 — pedido sem replicar: select aberto → grade após salvar
  await fecharPopoverSeAberto(page)
  const abriu21 = await abrirPopoverSelectPai(page, rowId, COL_KEY_INCOTERM)
  if (!abriu21) {
    falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, '21 — Abrir select Incoterm no pedido')
  } else {
    const qtdOpcoes = await popoverSelectTemOpcoes(page)
    if (qtdOpcoes < 3) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `21 — Select deve listar opções Cadastros (${qtdOpcoes} encontradas)`)
    }
    await destacarSiglaNoPopoverSelect(page, incSolo)
    await screenshot(page, printSelecao('21-incoterm-pedido-sem-replicar'))
    const notif21 = await confirmarOpcaoPopoverSelect(page, incSolo)
    await page.waitForTimeout(600)
    const textoPai21 = await lerTextoCampoPai(page, rowId, COL_KEY_INCOTERM)
    const textosItens21 = await lerTextosCampoItens(page, rowId, COL_KEY_INCOTERM)
    await screenshot(page, printResultado('21-incoterm-pedido-sem-replicar'))

    const pedidoOk21 = celulaContemValor(textoPai21, incSolo)
    const itensNaoReplicaram = textosItens21.every((t, i) => t === (textosItensAntes[i] ?? ''))

    if (notif21 === 'erro') {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `21 — Salvar pedido sem replicar (${incSolo}) — toast de erro`)
    } else if (!pedidoOk21) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `21 — Pedido deve exibir ${incSolo}`)
    } else if (!itensNaoReplicaram) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, '21 — Itens não devem replicar ao salvar pedido sem checkbox')
    } else {
      logAprovado(LOCAL_LISTA, COLUNA_INCOTERM, `21 — Salvar pedido sem replicar (${incSolo})`)
    }
  }

  // 22 — pedido com replicar: select + checkbox → grade
  await fecharPopoverSeAberto(page)
  const abriu22 = await abrirPopoverSelectPai(page, rowId, COL_KEY_INCOTERM)
  if (!abriu22) {
    falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, '22 — Abrir select Incoterm no pedido (com replicar)')
  } else {
    const temCb22 = await popoverExibeCheckboxReplicar(page)
    if (!temCb22) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, '22 — Select deve exibir checkbox «Aplicar a todos os itens»')
    }
    await marcarCheckboxReplicarPopover(page)
    await destacarSiglaNoPopoverSelect(page, incTodos)
    await screenshot(page, printSelecao('22-incoterm-pedido-replicar-todos'))
    const notif22 = await confirmarOpcaoPopoverSelect(page, incTodos, { replicarEmItens: true })
    await page.waitForTimeout(800)
    const textoPai22 = await lerTextoCampoPai(page, rowId, COL_KEY_INCOTERM)
    const textosItens22 = await lerTextosCampoItens(page, rowId, COL_KEY_INCOTERM)
    await screenshot(page, printResultado('22-incoterm-pedido-replicar-todos'))

    const pedidoOk22 = celulaContemValor(textoPai22, incTodos)
    const itensOk22 = textosItens22.length > 0 && textosItens22.every(t => celulaContemValor(t, incTodos))

    if (notif22 === 'erro') {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `22 — Salvar pedido com replicar (${incTodos}) — toast de erro`)
    } else if (!pedidoOk22 || !itensOk22) {
      log(`ℹ Diagnóstico incoterm: pai=${JSON.stringify(textoPai22)}, itens=${JSON.stringify(textosItens22)}`)
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `22 — Pedido e todos os itens devem exibir ${incTodos}`)
    } else {
      logAprovado(LOCAL_LISTA, COLUNA_INCOTERM, `22 — Replicar para todos os itens (${incTodos}, ${textosItens22.length} itens)`)
    }
  }

  // 23 — item isolado: select → grade
  await fecharPopoverSeAberto(page)
  const abriu23 = await abrirPopoverSelectItem(page, rowId, 0, COL_KEY_INCOTERM)
  let notif23: 'sucesso' | 'erro' | 'nenhuma' = 'nenhuma'
  let textoPai23 = ''
  let textosItens23: string[] = []
  if (!abriu23) {
    falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, '23 — Abrir select Incoterm no item 1')
  } else {
    await destacarSiglaNoPopoverSelect(page, incItem)
    await screenshot(page, printSelecao('23-incoterm-editar-item-isolado'))
    notif23 = await confirmarOpcaoPopoverSelect(page, incItem)
    await page.waitForTimeout(800)
    textoPai23 = await lerTextoCampoPai(page, rowId, COL_KEY_INCOTERM)
    textosItens23 = await lerTextosCampoItens(page, rowId, COL_KEY_INCOTERM)
    await screenshot(page, printResultado('23-incoterm-editar-item-isolado'))

    const item0Ok23 = celulaContemValor(textosItens23[0], incItem)
    const pedidoManteve23 = celulaContemValor(textoPai23, incTodos)
    const demaisItensOk23 = textosItens23.length <= 1
      || textosItens23.slice(1).every(t => celulaContemValor(t, incTodos))

    if (notif23 === 'erro') {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `23 — Salvar item isolado (${incItem}) — toast de erro`)
    } else if (!item0Ok23) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `23 — Item 1 deve exibir ${incItem}`)
    } else if (!pedidoManteve23) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `23 — Pedido deve manter ${incTodos}`)
    } else if (!demaisItensOk23) {
      falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, `23 — Demais itens devem manter ${incTodos}`)
    } else {
      logAprovado(LOCAL_LISTA, COLUNA_INCOTERM, `23 — Editar apenas o item 1 (${incItem})`)
    }
  }

  // 24 — alerta divergência (somente resultado na grade)
  await page.waitForTimeout(600)
  const temAlerta = await pedidoTemAlertaCampoDivergente(page, rowId, COL_KEY_INCOTERM, ALERTA_INCOTERM_DIVERGENTE)
  await screenshot(page, '24-incoterm-alerta-divergencia-resultado.png')
  if (temAlerta) {
    logAprovado(LOCAL_LISTA, COLUNA_INCOTERM, '24 — Alerta «Incoterms divergentes entre itens» visível na coluna do pedido')
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_INCOTERM, '24 — Alerta «Incoterms divergentes entre itens» não detectado')
  }
}

function normalizarNcmDigitos(texto: string): string {
  return texto.replace(/\D/g, '')
}

function ncmExibeCodigo(texto: string | null, codigo: string): boolean {
  if (!texto) return false
  const alvo = normalizarNcmDigitos(codigo)
  const norm = normalizarNcmDigitos(texto)
  return norm.includes(alvo) || texto.includes(codigo)
}

async function inputNcmPopover(page: Page) {
  return page.locator('.gtv-edit-popover--ncm .gtv-edit-popover-input, .gtv-edit-popover .gtv-edit-popover-input').first()
}

async function aguardarNcmValido(page: Page, timeoutMs = 20000): Promise<boolean> {
  const ok = page.locator('.gtv-edit-popover-input--ncm-ok')
    .or(page.locator('.gtv-ncm-validation'))
  return ok.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => true).catch(() => false)
}

async function confirmarPopoverNcm(page: Page): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const btn = page.locator('.gtv-edit-popover-btn--primary')
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ force: true })
  } else {
    await page.keyboard.press('Enter')
  }
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

async function abrirPopoverNcmPai(page: Page, rowId: string): Promise<boolean> {
  await scrollColunaParaVisivel(page, COL_KEY_NCM)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_NCM}"]`)
  if (await cel.count() === 0) return false
  await cel.click()
  return page.locator('.gtv-edit-popover--ncm, .gtv-edit-popover').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function clicarCelulaNcmItem(page: Page, pedidoRowId: string, indiceItem: number): Promise<boolean> {
  await scrollColunaParaVisivel(page, COL_KEY_NCM)
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
  }, { paiId: pedidoRowId, idx: indiceItem, colKey: COL_KEY_NCM })
}

async function abrirPopoverNcmItem(page: Page, pedidoRowId: string, indiceItem: number): Promise<boolean> {
  const clicou = await clicarCelulaNcmItem(page, pedidoRowId, indiceItem)
  if (!clicou) return false
  return page.locator('.gtv-edit-popover--ncm, .gtv-edit-popover').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function lerTextoNcmPai(page: Page, rowId: string): Promise<string> {
  await scrollColunaParaVisivel(page, COL_KEY_NCM)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_NCM}"]`)
  return (await cel.textContent())?.trim() ?? ''
}

async function lerTextoNcmItem(page: Page, pedidoRowId: string, indiceItem: number): Promise<string> {
  await scrollColunaParaVisivel(page, COL_KEY_NCM)
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
    if (!filho) return ''
    const porAttr = filho.querySelector(`[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`)
    const cel = porAttr ?? (() => {
      const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
      const colIdx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
      if (colIdx < 0) return null
      const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
        c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
      )
      return cells[colIdx] ?? null
    })()
    return cel?.textContent?.trim() ?? ''
  }, { paiId: pedidoRowId, idx: indiceItem, colKey: COL_KEY_NCM })
}

async function preencherNcmCodigoNoPopover(page: Page, codigo: string): Promise<boolean> {
  const input = await inputNcmPopover(page)
  await input.waitFor({ timeout: 10000 })
  await input.fill(codigo)
  await page.waitForTimeout(600)
  return aguardarNcmValido(page)
}

async function preencherNcmBuscaNoPopover(page: Page, termo: string): Promise<number> {
  const input = await inputNcmPopover(page)
  await input.waitFor({ timeout: 10000 })
  await input.fill(termo)
  await page.waitForTimeout(1200)
  const lista = page.locator('.gtv-ncm-busca-item')
  await lista.first().waitFor({ timeout: 20000 }).catch(() => {})
  return lista.count()
}

async function selecionarPrimeiroNcmBusca(page: Page): Promise<string | null> {
  const item = page.locator('.gtv-ncm-busca-item').first()
  if (await item.count() === 0) return null
  const codigo = await item.locator('.gtv-ncm-busca-codigo').textContent()
  await item.click()
  await page.waitForTimeout(400)
  return codigo?.trim() ?? null
}

async function tooltipNcmContemPedido(page: Page): Promise<boolean> {
  const tip = page.getByRole('tooltip').filter({ hasText: TOOLTIP_NCM_PEDIDO_REGEX })
  return tip.first().isVisible({ timeout: 8000 }).catch(() => false)
}

async function hoverCelulaNcmPai(page: Page, rowId: string): Promise<void> {
  await scrollColunaParaVisivel(page, COL_KEY_NCM)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_NCM}"]`)
  await cel.hover()
  await page.waitForTimeout(600)
}

/** Passos 35–41 — NCM (código, busca por texto, tooltip «Editável no pedido»). */
async function validarNcmLista(page: Page, rowId: string): Promise<void> {
  log(`ℹ Coluna ${COLUNA_NCM}: passos 35–41 (código 8528.59.00, busca «monitor», tooltip pedido)`)

  await fecharPopoverSeAberto(page)
  const abriu35 = await abrirPopoverNcmPai(page, rowId)
  if (!abriu35) {
    falharTabela(LOCAL_LISTA, COLUNA_NCM, '35 — Abrir NCM na linha do pedido')
  } else {
    await screenshot(page, '35-ncm-pedido-codigo-selecao.png')
    const valido35 = await preencherNcmCodigoNoPopover(page, NCM_CODIGO_TESTE)
    if (!valido35) {
      falharTabela(LOCAL_LISTA, COLUNA_NCM, `35 — NCM ${NCM_CODIGO_TESTE} não validou no pedido`)
    } else {
      const notif35 = await confirmarPopoverNcm(page)
      const texto35 = await lerTextoNcmPai(page, rowId)
      await screenshot(page, '35-ncm-pedido-codigo-resultado.png')
      if (notif35 === 'erro') falharTabela(LOCAL_LISTA, COLUNA_NCM, '35 — Salvar NCM por código no pedido — toast de erro')
      else if (!ncmExibeCodigo(texto35, NCM_CODIGO_TESTE)) {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, `35 — Pedido não exibe NCM ${NCM_CODIGO_TESTE} após salvar`)
      } else if (notif35 === 'sucesso') {
        logAprovado(LOCAL_LISTA, COLUNA_NCM, `35 — NCM ${NCM_CODIGO_TESTE} validou e salvou no pedido`)
      } else {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '35 — Salvar NCM por código no pedido — toast de sucesso não detectado')
      }
    }
  }

  await fecharPopoverSeAberto(page)
  const abriu36 = await abrirPopoverNcmPai(page, rowId)
  if (!abriu36) {
    falharTabela(LOCAL_LISTA, COLUNA_NCM, '36 — Abrir NCM no pedido para busca por texto')
  } else {
    const qtd36 = await preencherNcmBuscaNoPopover(page, NCM_BUSCA_TEXTO)
    await screenshot(page, '36-ncm-pedido-busca-monitor-selecao.png')
    if (qtd36 < 2) {
      falharTabela(LOCAL_LISTA, COLUNA_NCM, `36 — Busca «${NCM_BUSCA_TEXTO}» deve listar várias NCMs (encontradas: ${qtd36})`)
    } else {
      logAprovado(LOCAL_LISTA, COLUNA_NCM, `36 — Busca «${NCM_BUSCA_TEXTO}» abriu lista com ${qtd36} NCMs`)
      const codigoSel37 = await selecionarPrimeiroNcmBusca(page)
      const notif37 = await confirmarPopoverNcm(page)
      const texto37 = await lerTextoNcmPai(page, rowId)
      await screenshot(page, '37-ncm-pedido-busca-monitor-resultado.png')
      if (!codigoSel37) {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '37 — Selecionar NCM da lista no pedido')
      } else if (notif37 === 'erro') {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '37 — Salvar NCM selecionada no pedido — toast de erro')
      } else if (!ncmExibeCodigo(texto37, codigoSel37)) {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, `37 — Pedido não exibe NCM selecionada (${codigoSel37})`)
      } else if (notif37 === 'sucesso') {
        logAprovado(LOCAL_LISTA, COLUNA_NCM, `37 — NCM selecionada da busca salvou no pedido (${codigoSel37})`)
      } else {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '37 — Salvar NCM selecionada no pedido — toast de sucesso não detectado')
      }
    }
  }

  await fecharPopoverSeAberto(page)
  const abriu38 = await abrirPopoverNcmItem(page, rowId, 0)
  if (!abriu38) {
    falharTabela(LOCAL_LISTA, COLUNA_NCM, '38 — Abrir NCM na linha do item 1')
  } else {
    await screenshot(page, '38-ncm-item-codigo-selecao.png')
    const valido38 = await preencherNcmCodigoNoPopover(page, NCM_CODIGO_TESTE)
    if (!valido38) {
      falharTabela(LOCAL_LISTA, COLUNA_NCM, `38 — NCM ${NCM_CODIGO_TESTE} não validou no item`)
    } else {
      const notif38 = await confirmarPopoverNcm(page)
      const texto38 = await lerTextoNcmItem(page, rowId, 0)
      await screenshot(page, '38-ncm-item-codigo-resultado.png')
      if (notif38 === 'erro') falharTabela(LOCAL_LISTA, COLUNA_NCM, '38 — Salvar NCM por código no item — toast de erro')
      else if (!ncmExibeCodigo(texto38, NCM_CODIGO_TESTE)) {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, `38 — Item 1 não exibe NCM ${NCM_CODIGO_TESTE} após salvar`)
      } else if (notif38 === 'sucesso') {
        logAprovado(LOCAL_LISTA, COLUNA_NCM, `38 — NCM ${NCM_CODIGO_TESTE} validou e salvou no item 1`)
      } else {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '38 — Salvar NCM por código no item — toast de sucesso não detectado')
      }
    }
  }

  await fecharPopoverSeAberto(page)
  const abriu39 = await abrirPopoverNcmItem(page, rowId, 0)
  if (!abriu39) {
    falharTabela(LOCAL_LISTA, COLUNA_NCM, '39 — Abrir NCM no item para busca por texto')
  } else {
    const qtd39 = await preencherNcmBuscaNoPopover(page, NCM_BUSCA_TEXTO)
    await screenshot(page, '39-ncm-item-busca-monitor-selecao.png')
    if (qtd39 < 2) {
      falharTabela(LOCAL_LISTA, COLUNA_NCM, `39 — Busca «${NCM_BUSCA_TEXTO}» no item deve listar várias NCMs (encontradas: ${qtd39})`)
    } else {
      logAprovado(LOCAL_LISTA, COLUNA_NCM, `39 — Busca «${NCM_BUSCA_TEXTO}» no item abriu lista com ${qtd39} NCMs`)
      const codigoSel40 = await selecionarPrimeiroNcmBusca(page)
      const notif40 = await confirmarPopoverNcm(page)
      const texto40 = await lerTextoNcmItem(page, rowId, 0)
      await screenshot(page, '40-ncm-item-busca-monitor-resultado.png')
      if (!codigoSel40) {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '40 — Selecionar NCM da lista no item')
      } else if (notif40 === 'erro') {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '40 — Salvar NCM selecionada no item — toast de erro')
      } else if (!ncmExibeCodigo(texto40, codigoSel40)) {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, `40 — Item 1 não exibe NCM selecionada (${codigoSel40})`)
      } else if (notif40 === 'sucesso') {
        logAprovado(LOCAL_LISTA, COLUNA_NCM, `40 — NCM selecionada da busca salvou no item 1 (${codigoSel40})`)
      } else {
        falharTabela(LOCAL_LISTA, COLUNA_NCM, '40 — Salvar NCM selecionada no item — toast de sucesso não detectado')
      }
    }
  }

  await fecharPopoverSeAberto(page)
  await hoverCelulaNcmPai(page, rowId)
  const tooltipOk = await tooltipNcmContemPedido(page)
  await screenshot(page, '41-ncm-tooltip-pedido.png')
  if (tooltipOk) {
    logAprovado(LOCAL_LISTA, COLUNA_NCM, '41 — Tooltip NCM contém «Editável no pedido»')
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_NCM, '41 — Tooltip NCM deve conter texto «Editável no pedido»')
  }
}

function parseNumeroBR(valor: string): number {
  const t = valor.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : 0
}

function parseQuantidadeUnidadeCelula(texto: string): { qty: number; unit: string } | null {
  const t = normalizarTextoCelula(texto)
  if (!t || t === '—' || t === '-') return null
  if (ALERTA_UNIDADES_DIVERGENTES.test(t)) return null
  const m = t.match(/^([\d.,]+)\s*([A-Za-z]{1,10})$/)
  if (!m) return null
  return { qty: parseNumeroBR(m[1]), unit: m[2].toUpperCase() }
}

function celulaQtdProntaEhVazia(texto: string): boolean {
  const t = normalizarTextoCelula(texto)
  return !t || t === '—' || t === '-'
}

function celulaQtdProntaExibeValor(texto: string, valor: string, unidade: string): boolean {
  const t = normalizarTextoCelula(texto)
  return t.includes(valor) && new RegExp(`\\b${unidade}\\b`, 'i').test(t)
}

function quantidadesProximas(a: number, b: number, eps = 0.01): boolean {
  return Math.abs(a - b) <= eps
}

async function colapsarPedido(page: Page, rowId: string): Promise<void> {
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
  const expandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida')).catch(() => false)
  if (expandido) {
    await pai.locator('.gtv-chevron-btn').click()
    await page.waitForTimeout(500)
  }
}

async function contarItensDoPedido(page: Page, rowId: string): Promise<number> {
  return page.evaluate((paiId) => {
    let filhos = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
    if (filhos.length === 0) {
      const paiEl = document.querySelector(`.gtv-linha--pai [data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
      if (paiEl) {
        filhos = []
        let prox = paiEl.nextElementSibling
        while (prox?.classList.contains('gtv-linha--filho')) {
          filhos.push(prox as Element)
          prox = prox.nextElementSibling
        }
      }
    }
    return filhos.length
  }, rowId)
}

async function expandirPedidoRetornaQtd(page: Page, rowId: string): Promise<number> {
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
  const chevron = pai.locator('.gtv-chevron-btn')
  if (await chevron.count() === 0) return 0
  const expandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida'))
  if (!expandido) {
    await chevron.click()
    await page.waitForTimeout(800)
  }
  return contarItensDoPedido(page, rowId)
}

async function localizarRowIdPorNumeroPedido(page: Page, numero: string): Promise<string | null> {
  return page.evaluate((num) => {
    const cels = Array.from(document.querySelectorAll('[data-gtv-campo="numero_pedido"][data-gtv-rowid]'))
    for (const cel of cels) {
      if ((cel.textContent ?? '').includes(num)) {
        return cel.getAttribute('data-gtv-rowid')
      }
    }
    return null
  }, numero)
}

type ScanQtdProntaPedidos = {
  semItens: string | null
  mesmaUnidade: string | null
  unidadesDivergentes: string | null
}

async function escanearPedidosQtdPronta(page: Page, excluirRowId: string): Promise<ScanQtdProntaPedidos> {
  const resultado: ScanQtdProntaPedidos = {
    semItens: null,
    mesmaUnidade: null,
    unidadesDivergentes: null,
  }
  const rowIds = await listarRowIdsPedidosEditaveis(page)
  const limite = Math.min(rowIds.length, 15)

  for (let i = 0; i < limite; i++) {
    const id = rowIds[i]
    if (id === excluirRowId) continue
    await colapsarPedido(page, excluirRowId)
    const qtdItens = await expandirPedidoRetornaQtd(page, id)
    await scrollColunaParaVisivel(page, COL_KEY_QTD_PRONTA)

    if (!resultado.semItens && qtdItens === 0) {
      resultado.semItens = id
    }

    if (qtdItens >= 2) {
      const textosItens = await lerTextosCampoItens(page, id, COL_KEY_QTD_PRONTA)
      const unidades = textosItens
        .map(t => parseQuantidadeUnidadeCelula(t)?.unit ?? extrairUnidadeBadgeCelula(t))
        .filter((u): u is string => Boolean(u))
      const unidadesUnicas = [...new Set(unidades)]

      if (!resultado.mesmaUnidade && unidadesUnicas.length === 1 && unidades.length >= 2) {
        const textoPai = await lerTextoCampoPai(page, id, COL_KEY_QTD_PRONTA)
        const parsedItens = textosItens.map(t => parseQuantidadeUnidadeCelula(t))
        const soma = parsedItens.reduce((s, p) => s + (p?.qty ?? 0), 0)
        const parsedPai = parseQuantidadeUnidadeCelula(textoPai)
        if (parsedPai && quantidadesProximas(parsedPai.qty, soma)) {
          resultado.mesmaUnidade = id
        }
      }

      if (!resultado.unidadesDivergentes && unidadesUnicas.length >= 2) {
        const textoPai = await lerTextoCampoPai(page, id, COL_KEY_QTD_PRONTA)
        if (ALERTA_UNIDADES_DIVERGENTES.test(textoPai) && !parseQuantidadeUnidadeCelula(textoPai)) {
          resultado.unidadesDivergentes = id
        }
      }
    }

    await colapsarPedido(page, id)
    if (resultado.semItens && resultado.mesmaUnidade && resultado.unidadesDivergentes) break
  }

  return resultado
}

function extrairUnidadeBadgeCelula(texto: string): string | null {
  const t = normalizarTextoCelula(texto)
  const m = t.match(/\b([A-Z]{1,10})\b$/)
  return m?.[1] ?? null
}

async function abrirPopoverQtdProntaItem(page: Page, pedidoRowId: string, indice: number): Promise<boolean> {
  const clicou = await clicarCelulaItemPorIndice(page, pedidoRowId, indice, COL_KEY_QTD_PRONTA)
  if (!clicou) return false
  return page.locator('.gtv-edit-unidade-qty').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function preencherQuantidadePopover(page: Page, valor: string): Promise<void> {
  await page.locator('.gtv-edit-unidade-qty').fill(valor)
}

async function abrirDropdownUnidadePopover(page: Page): Promise<void> {
  await page.locator('.gtv-edit-unidade .gtv-edit-custom-select-trigger').click()
  await page.locator('.gtv-edit-custom-select-list').waitFor({ timeout: 5000 })
}

async function selecionarUnidadePopover(page: Page, sigla: string): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const re = new RegExp(`\\b${sigla.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  await page.locator('.gtv-edit-custom-select-list .gtv-edit-custom-select-item').filter({ hasText: re }).first().click()
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
  return aguardarNotificacaoSalvar(page)
}

async function popoverExibeAvisoImpactoUnidade(page: Page): Promise<boolean> {
  const aviso = page.locator('.gtv-edit-aviso-impacto')
  if (!(await aviso.isVisible().catch(() => false))) return false
  const texto = await aviso.textContent()
  return Boolean(texto && AVISO_IMPACTO_UNIDADE_PRONTA.test(texto))
}

async function salvarQtdProntaItem(
  page: Page,
  pedidoRowId: string,
  indice: number,
  valor: string,
  unidade: string,
  prefixoPrint: string,
): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  await fecharPopoverSeAberto(page)
  const abriu = await abrirPopoverQtdProntaItem(page, pedidoRowId, indice)
  if (!abriu) return 'nenhuma'
  await preencherQuantidadePopover(page, valor)
  await abrirDropdownUnidadePopover(page)
  await screenshot(page, printSelecao(prefixoPrint))
  return selecionarUnidadePopover(page, unidade)
}

/** Passos 42–48 — Qtd. Pronta do Pedido/Item (agregado + edição no item). */
async function validarQtdProntaLista(page: Page, rowIdPrincipal: string, numeroPedido: string): Promise<void> {
  log(`ℹ Coluna ${COLUNA_QTD_PRONTA}: passos 42–48 (vazio, soma, divergência, incluir, editar, aviso, persistência)`)
  await scrollColunaParaVisivel(page, COL_KEY_QTD_PRONTA)

  const scan = await escanearPedidosQtdPronta(page, rowIdPrincipal)

  if (scan.semItens) {
    await colapsarPedido(page, rowIdPrincipal)
    await expandirPedidoRetornaQtd(page, scan.semItens)
    const texto42 = await lerTextoCampoPai(page, scan.semItens, COL_KEY_QTD_PRONTA)
    await screenshot(page, '42-qtd-pronta-pedido-sem-itens-resultado.png')
    if (celulaQtdProntaEhVazia(texto42)) {
      logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, '42 — Pedido sem itens exibe célula vazia (—)')
    } else {
      falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, `42 — Pedido sem itens deve exibir — (obtido: ${texto42})`)
    }
    await colapsarPedido(page, scan.semItens)
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '42 — Nenhum pedido sem itens encontrado na lista')
    await screenshot(page, '42-qtd-pronta-pedido-sem-itens-resultado.png')
  }

  if (scan.mesmaUnidade) {
    await expandirPedidoRetornaQtd(page, scan.mesmaUnidade)
    const textoPai43 = await lerTextoCampoPai(page, scan.mesmaUnidade, COL_KEY_QTD_PRONTA)
    const textosItens43 = await lerTextosCampoItens(page, scan.mesmaUnidade, COL_KEY_QTD_PRONTA)
    const soma43 = textosItens43.reduce((s, t) => s + (parseQuantidadeUnidadeCelula(t)?.qty ?? 0), 0)
    const parsedPai43 = parseQuantidadeUnidadeCelula(textoPai43)
    await screenshot(page, '43-qtd-pronta-pedido-mesma-unidade-resultado.png')
    if (parsedPai43 && quantidadesProximas(parsedPai43.qty, soma43)) {
      logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, `43 — Pedido com mesma unidade exibe soma (${parsedPai43.qty} = ${soma43})`)
    } else {
      falharTabela(
        LOCAL_LISTA,
        COLUNA_QTD_PRONTA,
        `43 — Soma incorreta (pedido=${textoPai43}, soma itens=${soma43})`,
      )
    }
    await colapsarPedido(page, scan.mesmaUnidade)
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '43 — Nenhum pedido com itens de mesma unidade e soma coerente')
    await screenshot(page, '43-qtd-pronta-pedido-mesma-unidade-resultado.png')
  }

  if (scan.unidadesDivergentes) {
    await expandirPedidoRetornaQtd(page, scan.unidadesDivergentes)
    const textoPai44 = await lerTextoCampoPai(page, scan.unidadesDivergentes, COL_KEY_QTD_PRONTA)
    await screenshot(page, '44-qtd-pronta-pedido-unidades-divergentes-resultado.png')
    if (ALERTA_UNIDADES_DIVERGENTES.test(textoPai44) && !parseQuantidadeUnidadeCelula(textoPai44)) {
      logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, '44 — Unidades divergentes — alerta sem valor numérico')
    } else {
      falharTabela(
        LOCAL_LISTA,
        COLUNA_QTD_PRONTA,
        `44 — Deve exibir «Unidades divergentes entre itens» sem número (obtido: ${textoPai44})`,
      )
    }
    await colapsarPedido(page, scan.unidadesDivergentes)
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '44 — Nenhum pedido com unidades comercializadas divergentes')
    await screenshot(page, '44-qtd-pronta-pedido-unidades-divergentes-resultado.png')
  }

  await expandirPedidoRetornaQtd(page, rowIdPrincipal)

  const notif45 = await salvarQtdProntaItem(page, rowIdPrincipal, 0, QTD_PRONTA_VALOR_INCLUIR, UNIDADE_QTD_PRONTA, '45-qtd-pronta-item-incluir')
  const textoItem45 = await lerTextosCampoItens(page, rowIdPrincipal, COL_KEY_QTD_PRONTA)
  await screenshot(page, printResultado('45-qtd-pronta-item-incluir'))
  if (notif45 === 'erro') {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '45 — Salvar qtd pronta no item 1 — toast de erro')
  } else if (!celulaQtdProntaExibeValor(textoItem45[0] ?? '', QTD_PRONTA_VALOR_INCLUIR, UNIDADE_QTD_PRONTA)) {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, `45 — Item 1 deve exibir ${QTD_PRONTA_VALOR_INCLUIR} ${UNIDADE_QTD_PRONTA} (obtido: ${textoItem45[0]})`)
  } else if (notif45 === 'sucesso') {
    logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, `45 — Incluir qtd pronta no item 1 (${QTD_PRONTA_VALOR_INCLUIR} ${UNIDADE_QTD_PRONTA})`)
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '45 — Salvar qtd pronta no item 1 — toast de sucesso não detectado')
  }

  const notif46 = await salvarQtdProntaItem(page, rowIdPrincipal, 0, QTD_PRONTA_VALOR_EDITAR, UNIDADE_QTD_PRONTA, '46-qtd-pronta-item-editar')
  const textoItem46 = await lerTextosCampoItens(page, rowIdPrincipal, COL_KEY_QTD_PRONTA)
  await screenshot(page, printResultado('46-qtd-pronta-item-editar'))
  if (notif46 === 'erro') {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '46 — Editar qtd pronta no item 1 — toast de erro')
  } else if (!celulaQtdProntaExibeValor(textoItem46[0] ?? '', QTD_PRONTA_VALOR_EDITAR, UNIDADE_QTD_PRONTA)) {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, `46 — Item 1 deve exibir ${QTD_PRONTA_VALOR_EDITAR} ${UNIDADE_QTD_PRONTA} (obtido: ${textoItem46[0]})`)
  } else if (notif46 === 'sucesso') {
    logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, `46 — Editar qtd pronta no item 1 (${QTD_PRONTA_VALOR_EDITAR} ${UNIDADE_QTD_PRONTA})`)
  } else {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '46 — Editar qtd pronta no item 1 — toast de sucesso não detectado')
  }

  await fecharPopoverSeAberto(page)
  const abriu47 = await abrirPopoverQtdProntaItem(page, rowIdPrincipal, 0)
  if (!abriu47) {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '47 — Abrir popover qtd pronta no item 1')
  } else {
    const avisoOk = await popoverExibeAvisoImpactoUnidade(page)
    await screenshot(page, '47-qtd-pronta-aviso-unidade-item.png')
    if (avisoOk) {
      logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, '47 — Popover item exibe aviso de impacto da unidade')
    } else {
      falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, '47 — Popover deve exibir aviso de impacto da unidade comercializada')
    }
  }
  await fecharPopoverSeAberto(page)

  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  await garantirListaPedidos(page)

  const rowId48 = await localizarRowIdPorNumeroPedido(page, numeroPedido)
  if (!rowId48) {
    falharTabela(LOCAL_LISTA, COLUNA_QTD_PRONTA, `48 — Reencontrar pedido ${numeroPedido} após navegar`)
    await screenshot(page, '48-qtd-pronta-persistencia-apos-navegar-resultado.png')
    return
  }

  await expandirPedidoRetornaQtd(page, rowId48)
  const textoItem48 = await lerTextosCampoItens(page, rowId48, COL_KEY_QTD_PRONTA)
  await screenshot(page, '48-qtd-pronta-persistencia-apos-navegar-resultado.png')
  if (celulaQtdProntaExibeValor(textoItem48[0] ?? '', QTD_PRONTA_VALOR_EDITAR, UNIDADE_QTD_PRONTA)) {
    logAprovado(LOCAL_LISTA, COLUNA_QTD_PRONTA, `48 — Persistência após navegar (${QTD_PRONTA_VALOR_EDITAR} ${UNIDADE_QTD_PRONTA})`)
  } else {
    falharTabela(
      LOCAL_LISTA,
      COLUNA_QTD_PRONTA,
      `48 — Qtd pronta não persistiu após navegar (obtido: ${textoItem48[0]})`,
    )
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

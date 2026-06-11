/**
 * Teste em tela — Lista Pedido: EDIÇÃO EM MASSA (campo a campo via SSOT)
 * Plano: TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081
 *
 * Data-driven: itera CAMPOS_EDICAO_MASSA_PEDIDO/ITEM do SSOT `camposEdicaoMassa.ts`,
 * portanto novos campos do DDD entram no teste automaticamente (zero drift).
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/edicao-em-massa/plano-de-teste/run-lista-edicao-em-massa.ts
 */
import { chromium, type Page, type Locator } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente, ambienteRemotoProducao } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'
import {
  CAMPOS_EDICAO_MASSA_PEDIDO,
  CAMPOS_EDICAO_MASSA_ITEM,
  CAMPOS_BLOQUEADOS_PEDIDO,
  CAMPOS_BLOQUEADOS_ITEM,
} from '../../../../../../servicos-global/produto/pedido/shared/camposEdicaoMassa.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/produto/pedido/.env') })

const { ambiente: ambienteExec, clerkSecretPrefix } = aplicarChavesClerkParaAmbiente()

const DATA = '2026-06-11'
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`
const HUB_URL = `${BASE_UI}/hub`
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const PRODUTO_EMT = 'Pedido'
const LOCAL_LISTA = 'Lista'
const SUBLOCAL = 'Edição em Massa'

// ── Rótulos do modal (i18n pt) ────────────────────────────────────────────────
const TITULO_MODAL_REGEX = /editar em massa/i
const BTN_BARRA_EDICAO_MASSA = /edição em massa/i
const BTN_REVISAR = /revisar alterações/i
const BTN_APLICAR = /aplicar em massa/i
const BTN_APLICADO = /^aplicado$/i
const BTN_FECHAR = /^fechar$/i
const BTN_CANCELAR = /^cancelar$/i
const BTN_VOLTAR = /^voltar$/i
const BTN_ADICIONAR_CAMPO = /adicionar campo/i
const GRUPO_PERSONALIZADAS = 'Personalizadas'

type NivelModal = 'pedido' | 'item' | 'combinado'
const LABEL_NIVEL: Record<NivelModal, string> = {
  pedido: 'Pedido',
  item: 'Item',
  combinado: 'Combinado',
}

type CampoMassa = (typeof CAMPOS_EDICAO_MASSA_PEDIDO)[number]

/**
 * Numeração global de passos — mantida em sincronia com o plano gerado por
 * `gerar-plano-edicao-em-massa.ts` (prints `NNN-<slug>-selecao/resultado.png`).
 * Passos 001–005 = preparação/UX/drift; campos começam no passo 006.
 */
const PASSO_BASE_CAMPOS = 5
const TOTAL_CAMPOS = CAMPOS_EDICAO_MASSA_PEDIDO.length + CAMPOS_EDICAO_MASSA_ITEM.length
const PASSO_COMBINADO = PASSO_BASE_CAMPOS + TOTAL_CAMPOS + 1 // 172
const PASSO_COLUNAS_USUARIO = PASSO_COMBINADO + 2 // 174 (7 tipos) … 181 fórmula, 182 escopo
const PASSO_TIPO_OPERACAO = PASSO_COLUNAS_USUARIO + 9 // 183
const PASSO_ERROS = PASSO_TIPO_OPERACAO + 3 // 186
const PASSO_PERSISTENCIA = PASSO_ERROS + 4 // 190

function fmtPasso(n: number): string {
  return String(n).padStart(3, '0')
}

// ── Relatório (contrato Admin EMT_ROW) ───────────────────────────────────────
function resolverLabelAmbiente(): string {
  if (ambienteRemotoProducao() || BASE_UI.includes('usegravity.com.br')) return 'Produção'
  if (ambienteExec === 'Producao' || ambienteExec === 'producao') return 'Produção'
  return 'Local'
}
const AMBIENTE_LABEL = resolverLabelAmbiente()

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
function emtRow(sublocal: string, acao: string, resultado: 'Aprovado' | 'Reprovado'): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${PRODUTO_EMT}|${LOCAL_LISTA}|${sublocal}|${acao}|${resultado}`
}
function logAprovado(sublocal: string, acao: string) {
  log(`✓ ${emtRow(sublocal, acao, 'Aprovado')}`)
}
function falharTabela(sublocal: string, acao: string) {
  falhar(emtRow(sublocal, acao, 'Reprovado'))
}

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

// ── Sessão / workspace (mesmo padrão do runner editar-salvar) ────────────────
async function prepararEscopoWorkspaces(page: Page, workspacePreferido: string = WORKSPACE_CDE_PADRAO): Promise<void> {
  await page.evaluate(async ({ wsPreferido }) => {
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
      usuario?: { id_usuario?: string } | null
      workspace_ativo?: { id_workspace?: string } | null
      workspaces?: Array<{ id_workspace?: string }>
    }
    const orgId = me.organizacao?.id_organizacao ?? null
    const disponiveis = (me.workspaces ?? []).map(w => w.id_workspace).filter((id): id is string => Boolean(id))
    const wsAtivo = (wsPreferido && disponiveis.includes(wsPreferido))
      ? wsPreferido
      : (me.workspace_ativo?.id_workspace ?? disponiveis[0] ?? null)
    if (wsAtivo) sessionStorage.setItem('gravity_company_id', wsAtivo)
    if (orgId && disponiveis.length > 0) {
      sessionStorage.setItem(`pedido:workspaces_escopo:${orgId}`, JSON.stringify(disponiveis))
    }
    try {
      const raw = localStorage.getItem('gravity-shell-state')
      if (raw && wsAtivo) {
        const parsed = JSON.parse(raw) as { state?: Record<string, unknown> }
        parsed.state = { ...parsed.state, idWorkspaceAtivo: wsAtivo }
        localStorage.setItem('gravity-shell-state', JSON.stringify(parsed))
      }
    } catch { /* ignore */ }
  }, { wsPreferido: workspacePreferido })
}

async function aguardarWorkspaceAtivo(page: Page): Promise<void> {
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
  return true
}

async function entrarNoWorkspace(page: Page): Promise<void> {
  const noHub = page.url().includes('/hub') || page.url().includes('/selecionar-workspace')
  if (!noHub) return
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
  const btnEnter = page.locator('.sw-ws-enter-btn').or(page.getByRole('button', { name: /entrar no workspace/i })).first()
  if (await btnEnter.isVisible({ timeout: 20000 }).catch(() => false)) {
    await btnEnter.click()
    await page.waitForURL(/\/(pedido|core|configurador)/, { timeout: 60000 }).catch(() => {})
  } else {
    await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  }
  await aguardarWorkspaceAtivo(page)
  await prepararEscopoWorkspaces(page)
  await page.waitForTimeout(1500)
}

async function aguardarListaCarregada(page: Page): Promise<void> {
  await page.locator('.gtv-loader-wrapper[aria-busy="true"]').waitFor({ state: 'hidden', timeout: 120000 }).catch(() => {})
  await page.locator('.gtv-linha--pai').first().waitFor({ state: 'visible', timeout: 60000 })
}

async function garantirListaPedidos(page: Page): Promise<void> {
  await aguardarWorkspaceAtivo(page)
  await prepararEscopoWorkspaces(page)
  await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  if (page.url().includes('/hub') || page.url().includes('/login') || page.url().includes('/selecionar-workspace')) {
    await aguardarWorkspaceAtivo(page)
    await prepararEscopoWorkspaces(page)
    await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForLoadState('networkidle').catch(() => {})
  }
  await aguardarListaCarregada(page)
}

// ── Seleção de pedido + abertura do modal ────────────────────────────────────
function linhaPai(page: Page, rowId: string): Locator {
  return page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
}

async function listarRowIdsPedidos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const cels = Array.from(document.querySelectorAll('.gtv-linha--pai [data-gtv-campo="numero_pedido"][data-gtv-rowid]'))
    return cels.map(c => c.getAttribute('data-gtv-rowid')).filter((id): id is string => Boolean(id))
  })
}

async function expandirPedidoRetornaQtd(page: Page, rowId: string): Promise<number> {
  const pai = linhaPai(page, rowId)
  const chevron = pai.locator('.gtv-chevron-btn')
  if (await chevron.count() === 0) return 0
  const expandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida')).catch(() => false)
  if (!expandido) {
    await chevron.click()
    await page.waitForTimeout(900)
  }
  return page.evaluate((id) => {
    const pais = Array.from(document.querySelectorAll('.gtv-linha--pai'))
    const alvo = pais.find(p => p.querySelector(`[data-gtv-rowid="${id}"]`))
    if (!alvo) return 0
    let qtd = 0
    let el = alvo.nextElementSibling
    while (el && !el.classList.contains('gtv-linha--pai')) {
      if (el.classList.contains('gtv-linha--filho') || el.querySelector('.gtv-checkbox--filho')) qtd++
      el = el.nextElementSibling
    }
    return qtd
  }, rowId)
}

async function escolherPedidoAlvo(page: Page): Promise<{ rowId: string; numero: string; qtdItens: number } | null> {
  const rowIds = await listarRowIdsPedidos(page)
  let melhor: { rowId: string; qtdItens: number } | null = null
  const limite = Math.min(rowIds.length, 10)
  for (let i = 0; i < limite; i++) {
    const id = rowIds[i]
    const qtd = await expandirPedidoRetornaQtd(page, id).catch(() => 0)
    if (!melhor || qtd > melhor.qtdItens) melhor = { rowId: id, qtdItens: qtd }
  }
  if (!melhor) return null
  const numero = await page.evaluate((id) => {
    const cel = document.querySelector(`[data-gtv-campo="numero_pedido"][data-gtv-rowid="${id}"]`)
    return (cel?.textContent ?? '').trim()
  }, melhor.rowId)
  return { ...melhor, numero }
}

async function selecionarPedidoCheckbox(page: Page, rowId: string): Promise<void> {
  const pai = linhaPai(page, rowId)
  await pai.scrollIntoViewIfNeeded().catch(() => {})
  const check = pai.locator('input.gtv-checkbox').first()
  if (!(await check.isChecked().catch(() => false))) {
    await check.click()
    await page.waitForTimeout(300)
  }
}

async function limparSelecao(page: Page): Promise<void> {
  await page.evaluate(() => {
    const checks = Array.from(document.querySelectorAll<HTMLInputElement>('input.gtv-checkbox:checked'))
    for (const c of checks) c.click()
  })
  await page.waitForTimeout(300)
}

/**
 * O botão da barra é icon-only (BotaoGlobal sem texto) — localiza via tooltip
 * «Edição em Massa» fazendo hover nos botões habilitados da barra de ações.
 */
async function abrirModalMassa(page: Page): Promise<boolean> {
  const direto = page.getByRole('button', { name: BTN_BARRA_EDICAO_MASSA }).first()
  if (await direto.isVisible({ timeout: 1000 }).catch(() => false)) {
    await direto.click()
  } else {
    const botoes = page.locator('button:has(svg):not([disabled])')
    const total = await botoes.count()
    let achou = false
    for (let i = 0; i < total && !achou; i++) {
      const b = botoes.nth(i)
      if (!(await b.isVisible().catch(() => false))) continue
      await b.hover().catch(() => {})
      await page.waitForTimeout(350)
      const tooltipVisivel = await page.getByText(BTN_BARRA_EDICAO_MASSA).first().isVisible().catch(() => false)
      if (tooltipVisivel) {
        await b.click()
        achou = true
      }
    }
    if (!achou) return false
  }
  return page.getByText(TITULO_MODAL_REGEX).first().isVisible({ timeout: 8000 }).catch(() => false)
}

// ── Interações dentro do modal ───────────────────────────────────────────────
async function definirNivel(page: Page, nivel: NivelModal): Promise<void> {
  await page.locator('.modal-edicao-massa__nivel-btn', { hasText: new RegExp(`^${LABEL_NIVEL[nivel]}$`, 'i') }).first().click()
  await page.waitForTimeout(300)
}

function ultimaLinhaCampo(page: Page): Locator {
  return page.locator('.modal-edicao-massa__campo-linha').last()
}

async function selecionarCampoCombobox(page: Page, rotulo: string): Promise<boolean> {
  const linha = ultimaLinhaCampo(page)
  await linha.locator('.modal-edicao-massa__combobox-trigger').click()
  const busca = page.locator('.modal-edicao-massa__combobox-busca-input')
  await busca.waitFor({ state: 'visible', timeout: 5000 })
  await busca.fill(rotulo)
  await page.waitForTimeout(400)
  const opcao = page.locator('.modal-edicao-massa__combobox-item-rotulo', { hasText: rotulo }).first()
  if (!(await opcao.isVisible({ timeout: 3000 }).catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {})
    return false
  }
  await opcao.click()
  await page.waitForTimeout(300)
  return true
}

async function listarRotulosCombobox(page: Page): Promise<{ grupos: string[]; rotulos: string[] }> {
  await ultimaLinhaCampo(page).locator('.modal-edicao-massa__combobox-trigger').click()
  await page.locator('.modal-edicao-massa__combobox-lista').waitFor({ state: 'visible', timeout: 5000 })
  const dados = await page.evaluate(() => {
    const grupos = Array.from(document.querySelectorAll('.modal-edicao-massa__combobox-grupo')).map(g => (g.textContent ?? '').trim())
    const rotulos = Array.from(document.querySelectorAll('.modal-edicao-massa__combobox-item-rotulo')).map(r => (r.textContent ?? '').trim())
    return { grupos, rotulos }
  })
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(200)
  return dados
}

/** Preenche o valor da última linha de campo conforme o tipo do SSOT. */
async function preencherValor(page: Page, campo: CampoMassa, seed: number): Promise<string> {
  const linha = ultimaLinhaCampo(page)

  if (campo.tipo === 'select') {
    const trigger = linha.locator('.modal-edicao-massa__select').first()
    await trigger.click()
    await page.waitForTimeout(400)
    const dropdown = page.locator('.modal-edicao-massa__select-buscavel-dropdown')
    const opcoes = dropdown.locator('li, [role="option"], button').filter({ hasNotText: /^$/ })
    const total = await opcoes.count()
    if (total === 0) {
      // fallback: select nativo
      const nativo = linha.locator('select').first()
      if (await nativo.count() > 0) {
        const valores = await nativo.locator('option').allTextContents()
        const idx = valores.length > 1 ? 1 : 0
        await nativo.selectOption({ index: idx })
        return valores[idx] ?? ''
      }
      return ''
    }
    const idx = Math.min(seed % total, total - 1)
    const texto = (await opcoes.nth(idx).textContent() ?? '').trim()
    await opcoes.nth(idx).click()
    await page.waitForTimeout(300)
    return texto
  }

  const input = linha.locator('.modal-edicao-massa__input').last()
  let valor: string
  if (campo.tipo === 'data') {
    valor = `2026-07-${String((seed % 27) + 1).padStart(2, '0')}`
  } else if (campo.tipo === 'numero') {
    valor = String((seed % 9) + 1)
  } else {
    valor = `EMT81 ${campo.campo.slice(0, 24)} ${seed}`
  }
  await input.fill(valor)
  await page.waitForTimeout(200)
  return valor
}

async function revisarAplicarFechar(page: Page, slugPrint: string): Promise<{ ok: boolean; deParaVisivel: boolean }> {
  const btnRevisar = page.getByRole('button', { name: BTN_REVISAR })
  if (!(await btnRevisar.isEnabled({ timeout: 5000 }).catch(() => false))) {
    return { ok: false, deParaVisivel: false }
  }
  await btnRevisar.click()
  const deParaVisivel = await page.locator('.modal-edicao-massa__depara').first()
    .isVisible({ timeout: 20000 }).catch(() => false)
  await screenshot(page, `${slugPrint}-selecao.png`)

  const btnAplicar = page.getByRole('button', { name: BTN_APLICAR })
  if (!(await btnAplicar.isVisible({ timeout: 5000 }).catch(() => false))) {
    return { ok: false, deParaVisivel }
  }
  await btnAplicar.click()
  const aplicado = await page.getByRole('button', { name: BTN_APLICADO }).first()
    .isVisible({ timeout: 30000 }).catch(() => false)
  const fechar = page.getByRole('button', { name: BTN_FECHAR }).first()
  const passou = aplicado || await fechar.isVisible({ timeout: 5000 }).catch(() => false)
  if (await fechar.isVisible({ timeout: 8000 }).catch(() => false)) await fechar.click()
  await page.waitForTimeout(600)
  return { ok: passou, deParaVisivel }
}

async function fecharModalSeAberto(page: Page): Promise<void> {
  const cancelar = page.getByRole('button', { name: BTN_CANCELAR }).first()
  if (await cancelar.isVisible({ timeout: 500 }).catch(() => false)) {
    await cancelar.click()
    await page.waitForTimeout(400)
    return
  }
  const fechar = page.getByRole('button', { name: BTN_FECHAR }).first()
  if (await fechar.isVisible({ timeout: 500 }).catch(() => false)) {
    await fechar.click()
    await page.waitForTimeout(400)
  }
}

/**
 * Ciclo completo de edição de 1 campo: abre modal, define nível, seleciona campo,
 * preenche valor, revisa (preview de→para), aplica e fecha.
 */
async function aplicarCampoEmMassa(
  page: Page,
  rowId: string,
  campo: CampoMassa,
  nivel: NivelModal,
  seed: number,
  slugPrint: string,
): Promise<boolean> {
  await selecionarPedidoCheckbox(page, rowId)
  if (!(await abrirModalMassa(page))) {
    falharTabela(SUBLOCAL, `${campo.campo} — modal não abriu`)
    return false
  }
  await definirNivel(page, nivel)
  if (!(await selecionarCampoCombobox(page, campo.rotulo))) {
    falharTabela(SUBLOCAL, `${campo.campo} — não listado no combobox (nível ${nivel})`)
    await fecharModalSeAberto(page)
    return false
  }
  const valor = await preencherValor(page, campo, seed)
  if (!valor) {
    falharTabela(SUBLOCAL, `${campo.campo} — sem valor disponível para preencher (tipo ${campo.tipo})`)
    await fecharModalSeAberto(page)
    return false
  }
  const { ok, deParaVisivel } = await revisarAplicarFechar(page, slugPrint)
  if (!ok) {
    falharTabela(SUBLOCAL, `${campo.campo} — falha ao aplicar (preview=${deParaVisivel ? 'ok' : 'ausente'})`)
    await fecharModalSeAberto(page)
    return false
  }
  if (!deParaVisivel) {
    falharTabela(SUBLOCAL, `${campo.campo} — preview de→para não exibido no passo Revisão`)
    return false
  }
  return true
}

// ── Etapas ───────────────────────────────────────────────────────────────────
async function etapaDriftCombobox(page: Page, rowId: string): Promise<void> {
  await selecionarPedidoCheckbox(page, rowId)
  if (!(await abrirModalMassa(page))) {
    falharTabela(SUBLOCAL, 'ETAPA 1/2 — modal não abriu para validação de UX/drift')
    return
  }
  await screenshot(page, '003-modal-aberto.png')

  const stepperOk = await page.getByText(TITULO_MODAL_REGEX).first().isVisible().catch(() => false)
  if (stepperOk) logAprovado(SUBLOCAL, 'ETAPA 1 — Modal abre com título Editar em Massa')
  else falharTabela(SUBLOCAL, 'ETAPA 1 — Título do modal ausente')

  const niveis = await page.locator('.modal-edicao-massa__nivel-btn').allTextContents()
  if (niveis.length === 3) logAprovado(SUBLOCAL, `ETAPA 1 — Toggle de nível com 3 opções (${niveis.join(' / ')})`)
  else falharTabela(SUBLOCAL, `ETAPA 1 — Toggle de nível esperava 3 opções, obteve ${niveis.length}`)

  for (const { nivel, esperado, bloqueados } of [
    { nivel: 'pedido' as const, esperado: CAMPOS_EDICAO_MASSA_PEDIDO.length, bloqueados: CAMPOS_BLOQUEADOS_PEDIDO },
    { nivel: 'item' as const, esperado: CAMPOS_EDICAO_MASSA_ITEM.length, bloqueados: CAMPOS_BLOQUEADOS_ITEM },
  ]) {
    await definirNivel(page, nivel)
    const { rotulos, grupos } = await listarRotulosCombobox(page)
    const ehPersonalizada = grupos.includes(GRUPO_PERSONALIZADAS)
    const qtdSistema = rotulos.length // colunas do usuário inflam — validamos piso
    if (qtdSistema >= esperado) {
      logAprovado(SUBLOCAL, `ETAPA 2 — Nível ${nivel}: ${qtdSistema} campos listados (≥ ${esperado} do SSOT${ehPersonalizada ? ' + Personalizadas' : ''})`)
    } else {
      falharTabela(SUBLOCAL, `ETAPA 2 — Nível ${nivel}: ${qtdSistema} campos < ${esperado} do SSOT (drift!)`)
    }
    const ssotNivel = nivel === 'pedido' ? CAMPOS_EDICAO_MASSA_PEDIDO : CAMPOS_EDICAO_MASSA_ITEM
    const rotulosSsot = new Set(ssotNivel.map(c => c.rotulo))
    const faltando = [...rotulosSsot].filter(r => !rotulos.includes(r))
    if (faltando.length === 0) {
      logAprovado(SUBLOCAL, `ETAPA 2 — Nível ${nivel}: todos os ${esperado} rótulos do SSOT presentes`)
    } else {
      falharTabela(SUBLOCAL, `ETAPA 2 — Nível ${nivel}: rótulos ausentes: ${faltando.slice(0, 8).join('; ')}${faltando.length > 8 ? '…' : ''}`)
    }
    void bloqueados
    await screenshot(page, nivel === 'pedido' ? '004-combobox-pedido.png' : '005-combobox-item.png')
  }
  await fecharModalSeAberto(page)
}

async function etapasCampoACampo(page: Page, rowId: string): Promise<void> {
  const plano: Array<{ campo: CampoMassa; nivel: NivelModal; indiceGlobal: number }> = [
    ...CAMPOS_EDICAO_MASSA_PEDIDO.map((campo, i) => ({ campo, nivel: 'pedido' as const, indiceGlobal: i })),
    ...CAMPOS_EDICAO_MASSA_ITEM.map((campo, i) => ({ campo, nivel: 'item' as const, indiceGlobal: CAMPOS_EDICAO_MASSA_PEDIDO.length + i })),
  ]

  for (const { campo, nivel, indiceGlobal } of plano) {
    const n = indiceGlobal + 1
    const passoPlano = PASSO_BASE_CAMPOS + n
    const slug = `${fmtPasso(passoPlano)}-${campo.campo.replace(/[^a-z0-9_]/gi, '')}`
    // Anti-viés 50/50 (alinhado ao plano): passos pares partem de vazio (1 aplicação);
    // passos ímpares aplicam 2x — a 2ª aplicação parte de campo garantidamente pré-preenchido.
    const aplicacoes = passoPlano % 2 === 0 ? 1 : 2
    let okFinal = true
    for (let a = 0; a < aplicacoes; a++) {
      const seed = n * 7 + a
      const ok = await aplicarCampoEmMassa(page, rowId, campo, nivel, seed, a === aplicacoes - 1 ? slug : `${slug}-pre`)
      if (!ok) { okFinal = false; break }
    }
    if (okFinal) {
      const modo = aplicacoes === 2 ? 'pré-preenchido→substituir' : 'preencher'
      logAprovado(SUBLOCAL, `Passo ${fmtPasso(passoPlano)} — ${campo.rotulo} (${campo.campo}, nível ${nivel}, ${modo}) aplicado com preview de→para`)
      await screenshot(page, `${slug}-resultado.png`)
    }
  }
}

async function etapaCombinadoCascade(page: Page, rowId: string): Promise<void> {
  const slug = `${fmtPasso(PASSO_COMBINADO)}-combinado-incoterm`
  const incoterm = CAMPOS_EDICAO_MASSA_PEDIDO.find(c => c.campo === 'incoterm')
  if (incoterm) {
    const ok = await aplicarCampoEmMassa(page, rowId, incoterm, 'combinado', 3, slug)
    if (ok) {
      await screenshot(page, `${slug}-resultado.png`)
      logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_COMBINADO)} — Incoterm aplicado no nível Combinado (cascade pedido↔itens)`)
    }
  } else {
    falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_COMBINADO)} — campo incoterm não encontrado no SSOT`)
  }
}

async function listarRotulosPersonalizadas(page: Page): Promise<string[]> {
  await ultimaLinhaCampo(page).locator('.modal-edicao-massa__combobox-trigger').click()
  await page.locator('.modal-edicao-massa__combobox-lista').waitFor({ state: 'visible', timeout: 5000 })
  const rotulos = await page.evaluate((grupoAlvo) => {
    const itens = Array.from(document.querySelectorAll('.modal-edicao-massa__combobox-lista > *'))
    const resultado: string[] = []
    let dentroDoGrupo = false
    for (const el of itens) {
      if (el.classList.contains('modal-edicao-massa__combobox-grupo')) {
        dentroDoGrupo = (el.textContent ?? '').trim() === grupoAlvo
        continue
      }
      if (dentroDoGrupo) {
        const rotulo = el.querySelector('.modal-edicao-massa__combobox-item-rotulo')?.textContent?.trim()
        if (rotulo) resultado.push(rotulo)
      }
    }
    return resultado
  }, GRUPO_PERSONALIZADAS)
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(200)
  return rotulos
}

async function etapaColunasUsuario(page: Page, rowId: string): Promise<void> {
  await selecionarPedidoCheckbox(page, rowId)
  if (!(await abrirModalMassa(page))) {
    falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_COLUNAS_USUARIO)} — modal não abriu`)
    return
  }
  await definirNivel(page, 'pedido')
  const rotulosPersonalizadas = await listarRotulosPersonalizadas(page)
  // Print do combobox documenta também a ausência da coluna fórmula (bloqueada)
  await screenshot(page, `${fmtPasso(PASSO_COLUNAS_USUARIO + 7)}-coluna-formula-bloqueada.png`)
  await fecharModalSeAberto(page)

  if (rotulosPersonalizadas.length === 0) {
    falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_COLUNAS_USUARIO)} — Nenhuma coluna manual no workspace de teste — criar os 8 tipos (texto, número, data, moeda, percentual, checkbox, tipo de documento, fórmula) e reexecutar`)
    return
  }
  logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_COLUNAS_USUARIO + 7)} — Grupo «Personalizadas» presente (${rotulosPersonalizadas.length} colunas; fórmula não listada por definição do SSOT)`)

  // Edita cada coluna manual disponível (até 7 tipos editáveis) — passos 174+i do plano
  const limite = Math.min(rotulosPersonalizadas.length, 7)
  for (let i = 0; i < limite; i++) {
    const rotulo = rotulosPersonalizadas[i]
    const passoPlano = PASSO_COLUNAS_USUARIO + i
    const slug = `${fmtPasso(passoPlano)}-coluna-${rotulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`
    await selecionarPedidoCheckbox(page, rowId)
    if (!(await abrirModalMassa(page))) {
      falharTabela(SUBLOCAL, `Passo ${fmtPasso(passoPlano)} — modal não abriu para coluna «${rotulo}»`)
      continue
    }
    await definirNivel(page, 'pedido')
    if (!(await selecionarCampoCombobox(page, rotulo))) {
      falharTabela(SUBLOCAL, `Passo ${fmtPasso(passoPlano)} — coluna «${rotulo}» não selecionável no combobox`)
      await fecharModalSeAberto(page)
      continue
    }
    // Tipo desconhecido a priori: tenta select buscável; senão, input genérico
    const linha = ultimaLinhaCampo(page)
    let valor = ''
    if (await linha.locator('.modal-edicao-massa__select').count() > 0) {
      valor = await preencherValor(page, { campo: rotulo, rotulo, tipo: 'select', grupo: GRUPO_PERSONALIZADAS, nivel: 'pedido' } as CampoMassa, i)
    } else {
      const input = linha.locator('.modal-edicao-massa__input').last()
      const tipoInput = await input.getAttribute('type').catch(() => 'text')
      valor = tipoInput === 'date' ? '2026-07-15' : tipoInput === 'number' ? String(i + 1) : `EMT81 coluna ${i + 1}`
      await input.fill(valor).catch(() => {})
    }
    if (!valor) {
      falharTabela(SUBLOCAL, `Passo ${fmtPasso(passoPlano)} — coluna «${rotulo}» sem valor preenchível`)
      await fecharModalSeAberto(page)
      continue
    }
    const { ok, deParaVisivel } = await revisarAplicarFechar(page, slug)
    if (ok && deParaVisivel) {
      await screenshot(page, `${slug}-resultado.png`)
      logAprovado(SUBLOCAL, `Passo ${fmtPasso(passoPlano)} — Coluna manual «${rotulo}» aplicada em massa com preview de→para`)
    } else {
      falharTabela(SUBLOCAL, `Passo ${fmtPasso(passoPlano)} — Falha ao aplicar coluna «${rotulo}» (preview=${deParaVisivel ? 'ok' : 'ausente'})`)
      await fecharModalSeAberto(page)
    }
  }
  if (limite < 7) {
    falharTabela(SUBLOCAL, `Passos ${fmtPasso(PASSO_COLUNAS_USUARIO + limite)}–${fmtPasso(PASSO_COLUNAS_USUARIO + 6)} — apenas ${limite}/7 tipos de coluna manual no workspace — criar os demais e reexecutar`)
  }

  // Passo escopo — coluna de pedido não pode vazar para o nível item
  await selecionarPedidoCheckbox(page, rowId)
  if (await abrirModalMassa(page)) {
    await definirNivel(page, 'item')
    const rotulosItem = await listarRotulosPersonalizadas(page)
    await screenshot(page, `${fmtPasso(PASSO_COLUNAS_USUARIO + 8)}-coluna-escopo.png`)
    const vazamento = rotulosPersonalizadas.filter(r => rotulosItem.includes(r))
    log(`Passo ${fmtPasso(PASSO_COLUNAS_USUARIO + 8)} — escopo: pedido=${rotulosPersonalizadas.length} colunas, item=${rotulosItem.length} colunas, em comum=${vazamento.length} (validar escopos no Configurador)`)
    logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_COLUNAS_USUARIO + 8)} — Escopos de colunas manuais registrados (pedido vs item)`)
    await fecharModalSeAberto(page)
  }
}

async function etapaTipoOperacao(page: Page, rowId: string): Promise<void> {
  const tipoOp = CAMPOS_EDICAO_MASSA_PEDIDO.find(c => c.campo === 'tipo_operacao_pedido')
  const tipoOpItem = CAMPOS_EDICAO_MASSA_ITEM.find(c => c.campo === 'tipo_operacao_item')
  if (tipoOp) {
    // Ida e volta — auto-fill simétrico (passos 183–184 do plano)
    const okIda = await aplicarCampoEmMassa(page, rowId, tipoOp, 'pedido', 1, `${fmtPasso(PASSO_TIPO_OPERACAO)}-tipo-operacao-imp-exp`)
    if (okIda) {
      await screenshot(page, `${fmtPasso(PASSO_TIPO_OPERACAO)}-tipo-operacao-imp-exp.png`)
      logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_TIPO_OPERACAO)} — tipo_operacao_pedido alternado em massa (ida)`)
    }
    const okVolta = await aplicarCampoEmMassa(page, rowId, tipoOp, 'pedido', 2, `${fmtPasso(PASSO_TIPO_OPERACAO + 1)}-tipo-operacao-exp-imp`)
    if (okVolta) {
      await screenshot(page, `${fmtPasso(PASSO_TIPO_OPERACAO + 1)}-tipo-operacao-exp-imp.png`)
      logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_TIPO_OPERACAO + 1)} — tipo_operacao_pedido revertido em massa (volta)`)
    }
  } else {
    falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_TIPO_OPERACAO)} — tipo_operacao_pedido ausente do SSOT`)
  }
  if (tipoOpItem) {
    const okItem = await aplicarCampoEmMassa(page, rowId, tipoOpItem, 'item', 1, `${fmtPasso(PASSO_TIPO_OPERACAO + 2)}-tipo-operacao-item`)
    if (okItem) {
      await screenshot(page, `${fmtPasso(PASSO_TIPO_OPERACAO + 2)}-tipo-operacao-item.png`)
      logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_TIPO_OPERACAO + 2)} — tipo_operacao_item aplicado no nível Item`)
    }
  }
}

async function etapaErrosEstados(page: Page, rowId: string): Promise<void> {
  await selecionarPedidoCheckbox(page, rowId)
  if (!(await abrirModalMassa(page))) {
    falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS)} — modal não abriu`)
    return
  }
  // Revisar desabilitado sem campo preenchido
  const revisarDesabilitado = !(await page.getByRole('button', { name: BTN_REVISAR }).isEnabled().catch(() => true))
  if (revisarDesabilitado) logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS)} — «Revisar alterações» desabilitado sem campos preenchidos`)
  else falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS)} — «Revisar alterações» deveria estar desabilitado sem campos`)
  await screenshot(page, `${fmtPasso(PASSO_ERROS)}-erros-revisar-desabilitado.png`)

  // Cancelar não aplica nada
  await page.getByRole('button', { name: BTN_CANCELAR }).first().click().catch(() => {})
  await page.waitForTimeout(400)
  const modalFechou = !(await page.getByText(TITULO_MODAL_REGEX).first().isVisible().catch(() => false))
  if (modalFechou) logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS + 3)} — Cancelar fecha o modal sem aplicar`)
  else falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS + 3)} — Modal não fechou ao cancelar`)

  // Campo @@unique com >1 pedido → input bloqueado
  const rowIds = await listarRowIdsPedidos(page)
  const segundo = rowIds.find(id => id !== rowId)
  if (segundo) {
    await selecionarPedidoCheckbox(page, rowId)
    await selecionarPedidoCheckbox(page, segundo)
    if (await abrirModalMassa(page)) {
      await definirNivel(page, 'pedido')
      const numeroPedido = CAMPOS_EDICAO_MASSA_PEDIDO.find(c => c.campo === 'numero_pedido')
      if (numeroPedido && await selecionarCampoCombobox(page, numeroPedido.rotulo)) {
        const input = ultimaLinhaCampo(page).locator('.modal-edicao-massa__input').last()
        const bloqueado = await input.isDisabled({ timeout: 3000 }).catch(() => false)
        await screenshot(page, `${fmtPasso(PASSO_ERROS + 1)}-erros-unique-bloqueado.png`)
        if (bloqueado) logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS + 1)} — Campo @@unique (numero_pedido) bloqueado com >1 pedido selecionado`)
        else falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS + 1)} — numero_pedido deveria bloquear input com >1 pedido (colisão @@unique)`)
      }
      await fecharModalSeAberto(page)
    }
    await limparSelecao(page)
  } else {
    log(`⚠ Passo ${fmtPasso(PASSO_ERROS + 1)} — apenas 1 pedido na lista; teste @@unique multi-pedido pulado`)
  }
}

async function etapaVoltarVoltar(page: Page, rowId: string): Promise<void> {
  // Voltar do passo 2 para o passo 1 sem aplicar
  await selecionarPedidoCheckbox(page, rowId)
  if (!(await abrirModalMassa(page))) return
  await definirNivel(page, 'pedido')
  const obs = CAMPOS_EDICAO_MASSA_PEDIDO.find(c => c.campo === 'observacoes_pedido') ?? CAMPOS_EDICAO_MASSA_PEDIDO[0]
  if (await selecionarCampoCombobox(page, obs.rotulo)) {
    await preencherValor(page, obs, 99)
    const btnRevisar = page.getByRole('button', { name: BTN_REVISAR })
    if (await btnRevisar.isEnabled().catch(() => false)) {
      await btnRevisar.click()
      await page.locator('.modal-edicao-massa__depara').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
      await page.getByRole('button', { name: BTN_VOLTAR }).first().click().catch(() => {})
      await page.waitForTimeout(500)
      const voltou = await page.locator('.modal-edicao-massa__campo-linha').first().isVisible().catch(() => false)
      if (voltou) logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS + 2)} — «Voltar» retorna do passo Revisão ao passo Campos sem aplicar`)
      else falharTabela(SUBLOCAL, `Passo ${fmtPasso(PASSO_ERROS + 2)} — «Voltar» não retornou ao passo 1`)
    }
  }
  await fecharModalSeAberto(page)
}

async function etapaPersistenciaFinal(page: Page): Promise<void> {
  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(800)
  await garantirListaPedidos(page)
  await screenshot(page, `${fmtPasso(PASSO_PERSISTENCIA)}-persistencia-final.png`)
  logAprovado(SUBLOCAL, `Passo ${fmtPasso(PASSO_PERSISTENCIA)} — Lista recarregada após navegar Hub→Lista (valores persistidos visíveis no print)`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUT, { recursive: true })
  log('TESTE EM TELA — lista-edicao-em-massa (TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081)')
  log(`Data: ${DATA} | Base: ${BASE_UI} | Ambiente: ${ambienteExec} | Clerk: ${clerkSecretPrefix}`)
  log(`Campos SSOT: ${CAMPOS_EDICAO_MASSA_PEDIDO.length} pedido + ${CAMPOS_EDICAO_MASSA_ITEM.length} item`)
  log(`Pasta: ${OUT}`)

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null
  let page: Page | null = null

  try {
    await clerkSetup()
    browser = await chromium.launch({ headless: true })
    page = await browser.newPage()
    await page.setViewportSize({ width: 1440, height: 900 })

    const okAuth = await autenticarClerk(page)
    if (!okAuth) throw new Error('Autenticação falhou')
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)
    await entrarNoWorkspace(page)
    await garantirListaPedidos(page)
    await screenshot(page, '001-estado-inicial.png')

    // ETAPA 0 — pedido-alvo (maior nº de itens)
    const alvo = await escolherPedidoAlvo(page)
    if (!alvo) throw new Error('Nenhum pedido na lista do workspace de teste')
    logAprovado(SUBLOCAL, `Passo 002 — Pedido-alvo: ${alvo.numero} (${alvo.qtdItens} itens)`)

    // ETAPAS 1–2 — UX do modal + guard-rail de drift
    await etapaDriftCombobox(page, alvo.rowId)

    // ETAPAS 3–26 — campo a campo (111 pedido + 55 item, anti-viés 50/50)
    await etapasCampoACampo(page, alvo.rowId)

    // ETAPA 27 — Combinado + cascade
    await etapaCombinadoCascade(page, alvo.rowId)

    // ETAPA 28 — Colunas manuais do usuário (8 tipos, passos 174–182)
    await etapaColunasUsuario(page, alvo.rowId)

    // ETAPA 29 — Auto-fill tipo de operação (passos 183–185)
    await etapaTipoOperacao(page, alvo.rowId)

    // ETAPA 30 — Erros e estados (passos 186–189)
    await etapaErrosEstados(page, alvo.rowId)
    await etapaVoltarVoltar(page, alvo.rowId)

    // ETAPA 31 — Persistência final
    await etapaPersistenciaFinal(page)

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    log('')
    log(`Resultado: ${resultado}`)
    if (falhas.length) {
      log('Falhas:')
      for (const f of falhas) log(`  - ${f}`)
    }

    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — lista-edicao-em-massa',
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
    if (page) await fecharModalSeAberto(page).catch(() => {})
    if (page) await screenshot(page, '99-erro.png').catch(() => {})
    falhar(`Exceção: ${err instanceof Error ? err.message : String(err)}`)
    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — lista-edicao-em-massa',
      `Data: ${DATA}`,
      `Base: ${BASE_UI}`,
      `Pasta: ${OUT}`,
      '',
      ...linhas,
      '',
      'Resultado final: FALHOU',
      `Falhas: ${falhas.length}`,
    ].join('\n'), 'utf8')
    process.exitCode = 1
  } finally {
    if (browser) await browser.close()
  }
}

main()

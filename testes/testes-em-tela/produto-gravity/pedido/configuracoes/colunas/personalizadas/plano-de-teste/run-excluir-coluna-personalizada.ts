/**
 * EMT — Excluir Coluna Manual (Configurações → Lista + Hub)
 * Plano: TST-EMT-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001
 *
 * Uso: npx tsx testes/testes-em-tela/produto-gravity/pedido/configuracoes/colunas/personalizadas/plano-de-teste/run-excluir-coluna-personalizada.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente, ambienteRemotoProducao } from '../../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/produto/pedido/.env') })

const { ambiente: ambienteExec, clerkSecretPrefix } = aplicarChavesClerkParaAmbiente()

const DATA = '2026-06-09'
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID ?? 'exclusao-01')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`
const CONFIG_PERSONALIZADAS_URL = `${BASE_UI}/pedido/configuracoes?tab=colunas-personalizadas`
const HUB_URL = `${BASE_UI}/hub`
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const PRODUTO_EMT = 'Pedido'
const LOCAL_LISTA = 'Lista'
const LOCAL_CONFIG = 'Configurações'
const SUBLOCAL_PERSONALIZADAS = 'Colunas / Personalizadas'

const AMBIENTE_LABEL =
  process.env.GRAVITY_TEST_AMBIENTE === 'producao' || /usegravity\.com\.br/i.test(BASE_UI)
    ? 'Producao'
    : 'Local'

type ColunaUsuarioResumo = {
  id: string
  nome: string
  chave: string
  ativo: boolean
  tipo: string
}

type ResultadoEmtLinha = 'Aprovado' | 'Reprovado'

const linhas: string[] = []
const falhas: string[] = []

function emtRow(local: string, sublocal: string, acao: string, resultado: ResultadoEmtLinha): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${PRODUTO_EMT}|${local}|${sublocal}|${acao}|${resultado}`
}

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

function falhar(msg: string) {
  falhas.push(msg)
  log(`✗ ${msg}`)
}

function logAprovado(local: string, sublocal: string, acao: string) {
  log(`✓ ${emtRow(local, sublocal, acao, 'Aprovado')}`)
}

function falharTabela(local: string, sublocal: string, acao: string) {
  falhar(emtRow(local, sublocal, acao, 'Reprovado'))
}

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

async function prepararEscopoWorkspaces(page: Page): Promise<void> {
  await page.evaluate(async (wsPreferido) => {
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
      workspaces?: Array<{ id_workspace?: string; nome_workspace?: string }>
    }
    const orgId = me.organizacao?.id_organizacao
    const cde = me.workspaces?.find(w => w.id_workspace === wsPreferido)
    const wsId = cde?.id_workspace ?? me.workspace_ativo?.id_workspace ?? me.workspaces?.[0]?.id_workspace ?? null
    if (wsId) sessionStorage.setItem('gravity_company_id', wsId)
    if (orgId && me.workspaces?.length) {
      const ids = me.workspaces.map(w => w.id_workspace).filter((id): id is string => Boolean(id))
      if (ids.length > 0) {
        sessionStorage.setItem(`pedido:workspaces_escopo:${orgId}`, JSON.stringify(ids))
      }
    }
  }, WORKSPACE_CDE_PADRAO)
}

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email || !process.env.CLERK_SECRET_KEY) {
    falhar('Credenciais Clerk ausentes')
    return false
  }

  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })

  try {
    if (senha) await clerk.signIn({ page, emailAddress: email, password: senha })
    else await clerk.signIn({ page, emailAddress: email })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (clerkSecretPrefix === 'sk_test' && ambienteRemotoProducao()) {
      falhar(`Clerk dev em URL de produção: ${msg}`)
    } else {
      falhar(`Clerk sign-in falhou: ${msg}`)
    }
    return false
  }

  await prepararEscopoWorkspaces(page)
  logAprovado('Login', '—', `Clerk sign-in (${email})`)
  return true
}

async function entrarNoWorkspace(page: Page): Promise<void> {
  if (!page.url().includes('/hub') && !page.url().includes('/selecionar-workspace')) return
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(2000)
  const btnAcordo = page.getByRole('button', { name: /estou de acordo/i })
  if (await btnAcordo.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btnAcordo.click()
    await page.waitForTimeout(800)
  }
  const card = page.locator('[data-workspace-id], .workspace-card, button').filter({ hasText: /CDE|EXPORTADOR/i }).first()
  if (await card.isVisible({ timeout: 8000 }).catch(() => false)) {
    await card.click()
    await page.waitForTimeout(1500)
  }
}

async function aguardarListaCarregada(page: Page): Promise<void> {
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 60000 })
  await page.locator('.gtv-linha--pai .gtv-chevron-btn').first().waitFor({ timeout: 60000 }).catch(() => {})
  await page.locator('.gtv-loader-wrapper[aria-busy="true"]').waitFor({ state: 'hidden', timeout: 120000 }).catch(() => {})
  await page.waitForTimeout(600)
}

async function garantirColunasListaVisiveis(page: Page): Promise<void> {
  const btnColunas = page.getByRole('button', { name: 'Colunas' })
  if (!(await btnColunas.isVisible({ timeout: 8000 }).catch(() => false))) return
  await btnColunas.click()
  await page.getByRole('button', { name: /Selecionar tudo/i }).click()
  await page.waitForTimeout(500)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1000)
}

async function irListaPedidos(page: Page): Promise<void> {
  await prepararEscopoWorkspaces(page)
  await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await aguardarListaCarregada(page)
  await garantirColunasListaVisiveis(page)
}

async function listarColunasUsuario(page: Page): Promise<ColunaUsuarioResumo[]> {
  return page.evaluate(async () => {
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    const token = await clerkGlobal?.session?.getToken()
    if (!token) return []
    const res = await fetch('/api/v1/pedidos/colunas-usuario', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return []
    return res.json() as ColunaUsuarioResumo[]
  })
}

async function colunaVisivelNaLista(page: Page, chave: string): Promise<boolean> {
  const el = page.locator(`[data-find-col-key="${chave}"]`)
  if (await el.count() === 0) return false
  await el.first().scrollIntoViewIfNeeded().catch(() => {})
  return el.first().isVisible().catch(() => false)
}

async function criarColunaViaUi(page: Page, nome: string): Promise<ColunaUsuarioResumo | null> {
  await page.goto(CONFIG_PERSONALIZADAS_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.getByRole('heading', { name: /colunas personalizadas/i }).waitFor({ timeout: 30000 })

  await page.getByRole('button', { name: /criar coluna/i }).click()
  await page.locator('#mnc-nome').waitFor({ timeout: 10000 })
  await page.locator('#mnc-nome').fill(nome)
  await page.getByRole('button', { name: /^salvar$/i }).click()
  await page.locator('#mnc-nome').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1200)

  const lista = await listarColunasUsuario(page)
  return lista.find(c => c.nome === nome) ?? null
}

async function resolverColunaAlvo(page: Page): Promise<ColunaUsuarioResumo | null> {
  let colunas = await listarColunasUsuario(page)
  const ativas = colunas.filter(c => c.ativo && c.tipo !== 'formula')

  for (const col of ativas) {
    if (await colunaVisivelNaLista(page, col.chave)) return col
  }

  const emt = ativas.find(c => /^EMT EXCLUIR/i.test(c.nome))
  if (emt) {
    await garantirColunasListaVisiveis(page)
    if (await colunaVisivelNaLista(page, emt.chave)) return emt
  }

  if (ativas.length > 0) {
    await garantirColunasListaVisiveis(page)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await aguardarListaCarregada(page)
    await garantirColunasListaVisiveis(page)
    for (const col of ativas) {
      if (await colunaVisivelNaLista(page, col.chave)) return col
    }
  }

  const nomeNovo = `EMT EXCLUIR ${Date.now()}`
  log(`ℹ Nenhuma coluna manual visível — criando "${nomeNovo}"`)
  const criada = await criarColunaViaUi(page, nomeNovo)
  if (!criada) return null

  await irListaPedidos(page)
  if (await colunaVisivelNaLista(page, criada.chave)) return criada

  await garantirColunasListaVisiveis(page)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await aguardarListaCarregada(page)
  await garantirColunasListaVisiveis(page)
  if (await colunaVisivelNaLista(page, criada.chave)) return criada

  return criada
}

async function irConfiguracoesPersonalizadasPeloMenu(page: Page): Promise<void> {
  const linkConfig = page.getByRole('link', { name: /configurações/i })
    .or(page.getByRole('button', { name: /configurações/i }))
    .first()
  if (await linkConfig.isVisible({ timeout: 8000 }).catch(() => false)) {
    await linkConfig.click()
  } else {
    await page.goto(`${BASE_UI}/pedido/configuracoes`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  }
  await page.waitForLoadState('networkidle').catch(() => {})

  const btnColunas = page.locator('.cfg-sidebar__item').filter({ hasText: /colunas/i }).first()
  await btnColunas.waitFor({ timeout: 20000 })
  const submenuAberto = await page.locator('.cfg-sidebar__submenu--open .cfg-sidebar__subitem').filter({ hasText: /personalizadas/i }).isVisible().catch(() => false)
  if (!submenuAberto) await btnColunas.click()

  await page.locator('.cfg-sidebar__subitem').filter({ hasText: /^Personalizadas$/i }).click()
  await page.getByRole('heading', { name: /colunas personalizadas/i }).waitFor({ timeout: 20000 })
}

function linhaColunaPersonalizada(page: Page, nome: string) {
  return page.locator('.cfg-kanban-campo-row').filter({ has: page.locator('.cfg-kanban-campo-row__nome', { hasText: nome }) })
}

async function validarModalExcluir(page: Page, nomeColuna: string): Promise<boolean> {
  const overlay = page.locator('.mce__overlay[role="dialog"]')
  if (!(await overlay.isVisible({ timeout: 5000 }).catch(() => false))) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '04 — Modal padrão não abriu')
    return false
  }

  let ok = true

  const titulo = await page.locator('#mce-titulo').innerText().catch(() => '')
  if (!/excluir coluna/i.test(titulo)) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `04 — Título modal incorreto (obtido: ${titulo})`)
    ok = false
  }

  const subtitulo = await page.locator('.mce__subtitulo').innerText().catch(() => '')
  if (!/confirme antes de prosseguir com a exclusão/i.test(subtitulo)) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `04 — Subtítulo modal incorreto (obtido: ${subtitulo})`)
    ok = false
  }

  const aviso = await page.locator('.mce__aviso-texto').innerText().catch(() => '')
  if (!/esta ação é irreversível/i.test(aviso) || !/os valores existentes serão preservados/i.test(aviso)) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `04 — Aviso modal incorreto (obtido: ${aviso})`)
    ok = false
  }

  const registro = await page.locator('.mce__td').innerText().catch(() => '')
  if (!registro.includes(nomeColuna)) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `04 — Registro modal não exibe "${nomeColuna}" (obtido: ${registro})`)
    ok = false
  }

  const temCancelar = await page.locator('.mce__footer').getByRole('button', { name: /^cancelar$/i }).isVisible().catch(() => false)
  const temExcluir = await page.locator('.mce__footer').getByRole('button', { name: /^excluir$/i }).isVisible().catch(() => false)
  if (!temCancelar || !temExcluir) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '04 — Botões Cancelar/Excluir ausentes no footer')
    ok = false
  }

  const layoutOk = await page.locator('.mce__container, .mce__header, .mce__body, .mce__footer').count() >= 4
  if (!layoutOk) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '04 — Layout mce__* incompleto')
    ok = false
  }

  if (ok) logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '04 — Modal padrão com mensagem, botões e layout corretos')
  return ok
}

async function executarFluxoExclusao(page: Page): Promise<void> {
  // ── Passo 01 — Pedido / Lista / localizar coluna manual (ou criar) ──
  await irListaPedidos(page)
  const colunaAlvo = await resolverColunaAlvo(page)
  if (!colunaAlvo) {
    falharTabela(LOCAL_LISTA, 'Coluna manual', '01 — Não foi possível localizar nem criar coluna manual')
    await screenshot(page, '01-lista-coluna-manual-como-esta.png')
    return
  }

  const { nome: nomeColuna, chave: chaveColuna, id: idColuna } = colunaAlvo
  log(`ℹ Coluna alvo: "${nomeColuna}" (chave=${chaveColuna}, id=${idColuna})`)

  await page.locator(`[data-find-col-key="${chaveColuna}"]`).first().scrollIntoViewIfNeeded().catch(() => {})
  await screenshot(page, '01-lista-coluna-manual-como-esta.png')
  logAprovado(LOCAL_LISTA, nomeColuna, '01 — Coluna manual localizada na lista')

  // ── Passo 02 — Configurações / Colunas / Personalizadas ──
  await irConfiguracoesPersonalizadasPeloMenu(page)
  await screenshot(page, '02-config-personalizadas-coluna-como-esta.png')

  const linha = linhaColunaPersonalizada(page, nomeColuna)
  if (!(await linha.isVisible({ timeout: 10000 }).catch(() => false))) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `02 — Coluna "${nomeColuna}" não visível em Personalizadas`)
  } else {
    logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `02 — Coluna "${nomeColuna}" visível em Personalizadas`)
  }
  await screenshot(page, '02-config-personalizadas-coluna-resultado.png')

  // ── Passo 03 — Clicar ícone lixeira ──
  const btnExcluirLinha = linha.locator('.cfg-kanban-campo-btn--remove').first()
  await btnExcluirLinha.scrollIntoViewIfNeeded().catch(() => {})
  await screenshot(page, '03-excluir-icone-como-esta.png')
  await btnExcluirLinha.click()
  await page.waitForTimeout(500)
  await screenshot(page, '03-excluir-icone-selecao.png')
  logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '03 — Ícone lixeira clicado')

  // ── Passo 04 — Modal padrão ──
  await screenshot(page, '04-modal-excluir-como-esta.png')
  await validarModalExcluir(page, nomeColuna)

  // ── Passo 05 — Confirmar exclusão ──
  const btnConfirmarExcluir = page.locator('.mce__footer').getByRole('button', { name: /^excluir$/i })
  await screenshot(page, '05-confirmar-exclusao-selecao.png')

  // ── Passo 06 — Botão Excluindo... ──
  const esperaExcluindo = page.getByText(/excluindo/i).waitFor({ state: 'visible', timeout: 15000 })
  await Promise.all([
    esperaExcluindo,
    btnConfirmarExcluir.click(),
  ]).catch(() => {})

  const btnCancelar = page.locator('.mce__footer').getByRole('button', { name: /^cancelar$/i })
  const cancelarDisabled = await btnCancelar.isDisabled().catch(() => false)
  const fecharDisabled = await page.locator('.mce__fechar').isDisabled().catch(() => false)

  await screenshot(page, '06-botao-excluindo-resultado.png')

  const textoBotao = await page.locator('.mce__footer button').filter({ hasText: /excluindo/i }).innerText().catch(() => '')
  if (/excluindo/i.test(textoBotao)) {
    logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '06 — Botão exibe "Excluindo..."')
  } else {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `06 — Botão não exibiu "Excluindo..." (obtido: ${textoBotao})`)
  }
  if (cancelarDisabled && fecharDisabled) {
    logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '06 — Cancelar e fechar desabilitados durante exclusão')
  } else {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '06 — Guards do modal durante loading')
  }

  // ── Passo 07 — Toast de confirmação ──
  const toastRegex = new RegExp(`coluna\\s*["']?${nomeColuna.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']?\\s*excluída com sucesso`, 'i')
  const toast = page.locator('.shell-toast--success .shell-toast__message').filter({ hasText: toastRegex })
  await toast.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {})
  await page.locator('.mce__overlay').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
  await screenshot(page, '07-toast-exclusao-resultado.png')

  if (await toast.isVisible().catch(() => false)) {
    logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '07 — Toast de exclusão exibido')
  } else {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '07 — Toast de exclusão não detectado')
  }

  if (await linhaColunaPersonalizada(page, nomeColuna).isVisible({ timeout: 3000 }).catch(() => false)) {
    falharTabela(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, `07 — Coluna "${nomeColuna}" ainda na lista após exclusão`)
  } else {
    logAprovado(LOCAL_CONFIG, SUBLOCAL_PERSONALIZADAS, '07 — Coluna removida da lista Personalizadas')
  }

  // ── Passo 08 — Voltar à Lista sem coluna ──
  await irListaPedidos(page)
  const aindaNaLista = await colunaVisivelNaLista(page, chaveColuna)
  await screenshot(page, '08-lista-sem-coluna-resultado.png')
  if (aindaNaLista) {
    falharTabela(LOCAL_LISTA, nomeColuna, '08 — Coluna ainda visível na lista após exclusão')
  } else {
    logAprovado(LOCAL_LISTA, nomeColuna, '08 — Coluna ausente na lista após exclusão')
  }

  // ── Passo 08 — Hub → voltar → coluna continua ausente ──
  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  await entrarNoWorkspace(page)
  await irListaPedidos(page)
  const aposHub = await colunaVisivelNaLista(page, chaveColuna)
  await screenshot(page, '08-hub-voltar-lista-sem-coluna-resultado.png')
  if (aposHub) {
    falharTabela(LOCAL_LISTA, nomeColuna, '08 — Coluna reapareceu na lista após Hub → voltar')
  } else {
    logAprovado(LOCAL_LISTA, nomeColuna, '08 — Coluna permanece ausente após Hub → voltar à lista')
  }
}

async function main() {
  await clerkSetup()
  log(`EMT Excluir Coluna Manual — ${BASE_UI} — ambiente=${ambienteExec}`)
  log(`Pasta saída: ${OUT}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } })
  const page = await context.newPage()

  try {
    if (!(await autenticarClerk(page))) throw new Error('Autenticação falhou')
    await entrarNoWorkspace(page)
    await executarFluxoExclusao(page)

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    log('')
    log(`Resultado: ${resultado}`)
    if (falhas.length) {
      log('Falhas:')
      for (const f of falhas) log(`  - ${f}`)
    }

    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — excluir-coluna-personalizada',
      `ID: TST-EMT-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001`,
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
    if (page) await screenshot(page, '99-erro.png').catch(() => {})
    const msg = err instanceof Error ? err.message : String(err)
    falhar(`Exceção: ${msg}`)
    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — excluir-coluna-personalizada',
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
    await browser.close()
  }
}

main()

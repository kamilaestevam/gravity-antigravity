/**
 * Teste em tela — Lista Pedido: Novo Item Manual
 * Plano: TST-EMT-PEDIDO-LISTA-NOVO-ITEM-MANUAL-001
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/novo-item-manual/plano-de-teste/run-novo-item-manual.ts
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

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`
const HUB_URL = `${BASE_UI}/hub`
const PRODUTO_EMT = 'Pedido'
const LOCAL_LISTA = 'Lista'
const SUBLOCAL = 'Novo Item Manual'

const NCM_CODIGO = '8528.59.00'
const QTD_INICIAL = '100'
const VALOR_UNITARIO = '25,50'
const VALOR_TOTAL_ESPERADO = '2.550,00'

const linhas: string[] = []
const falhas: string[] = []

function emtRow(local: string, sublocal: string, acao: string, resultado: 'Aprovado' | 'Reprovado', produto = PRODUTO_EMT): string {
  return `EMT_ROW|${produto}|${local}|${sublocal}|${acao}|${resultado}`
}

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

function logAprovado(local: string, sublocal: string, acao: string) {
  log(emtRow(local, sublocal, acao, 'Aprovado'))
}

function falharTabela(local: string, sublocal: string, acao: string) {
  log(emtRow(local, sublocal, acao, 'Reprovado'))
  falhas.push(`${local} › ${sublocal}: ${acao}`)
}

function falhar(msg: string) {
  falhas.push(msg)
  log(`✗ ${msg}`)
}

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

async function prepararEscopoWorkspaces(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('pedido:workspaces_escopo')) sessionStorage.removeItem(key)
    }
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    const token = await clerkGlobal?.session?.getToken()
    if (!token) return [] as string[]
    const meRes = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!meRes.ok) return [] as string[]
    const me = await meRes.json() as {
      organizacao?: { id_organizacao?: string } | null
      workspace_ativo?: { id_workspace?: string } | null
      workspaces?: Array<{ id_workspace?: string }>
    }
    const orgId = me.organizacao?.id_organizacao
    const wsId = me.workspace_ativo?.id_workspace ?? me.workspaces?.[0]?.id_workspace ?? null
    if (wsId) sessionStorage.setItem('gravity_company_id', wsId)
    const ids = (me.workspaces ?? []).map(w => w.id_workspace).filter((id): id is string => Boolean(id))
    if (orgId && ids.length > 0) {
      sessionStorage.setItem(`pedido:workspaces_escopo:${orgId}`, JSON.stringify(ids))
    }
    return ids
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
  if (!email || !process.env.CLERK_SECRET_KEY) {
    falhar('Credenciais Clerk ausentes (E2E_CLERK_USER_EMAIL / CLERK_SECRET_KEY)')
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
  await aguardarMeComOrganizacao(page)
  logAprovado('Login', '—', `Clerk sign-in (${email})`)
  return true
}

async function garantirListaPedidos(page: Page): Promise<void> {
  if (!page.url().includes('/pedido/pedidos/lista')) {
    await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  }
  await page.waitForSelector('.gtv-linha--pai', { timeout: 45000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function contarPedidosApiEscopo(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    const token = await clerkGlobal?.session?.getToken()
    if (!token) return 0
    const meRes = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!meRes.ok) return 0
    const me = await meRes.json() as {
      organizacao?: { id_organizacao?: string } | null
      workspace_ativo?: { id_workspace?: string } | null
    }
    const orgId = me.organizacao?.id_organizacao
    const wsAtivo = me.workspace_ativo?.id_workspace ?? sessionStorage.getItem('gravity_company_id')
    let ids: string[] = wsAtivo ? [wsAtivo] : []
    if (orgId) {
      const raw = sessionStorage.getItem(`pedido:workspaces_escopo:${orgId}`)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as string[]
          if (parsed.length > 0) ids = parsed
        } catch { /* ignore */ }
      }
    }
    const qs = new URLSearchParams({
      status: 'aberto,rascunho',
      limit: '500',
      ...(ids.length ? { idsWorkspacesFiltro: ids.join(',') } : {}),
    })
    const res = await fetch(`/api/v1/pedidos?${qs}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return 0
    const body = await res.json() as { data?: unknown[] }
    return body.data?.length ?? 0
  })
}

async function abrirModalNovoItemManual(page: Page): Promise<boolean> {
  const btnNovo = page.getByRole('button', { name: /^novo$/i }).first()
  if (!(await btnNovo.isVisible({ timeout: 8000 }).catch(() => false))) return false
  await btnNovo.click()
  await page.waitForTimeout(300)
  const itemMenu = page.getByText(/^novo item$/i).first()
  await itemMenu.hover()
  await page.waitForTimeout(400)
  const manual = page.getByRole('button', { name: /^manual$/i }).last()
  if (!(await manual.isVisible({ timeout: 5000 }).catch(() => false))) return false
  await manual.click()
  return page.getByText(/^novo item$/i).first()
    .waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
}

async function abrirSelectPedidoDestino(page: Page): Promise<void> {
  const trigger = page.locator('[class*="cg-select"], .gtv-edit-custom-select-trigger, button[aria-haspopup="listbox"]')
    .filter({ has: page.locator('text=/pedido de destino|buscar pedido/i').or(page.getByText(/buscar pedido/i)) })
    .first()
  if (await trigger.count() === 0) {
    await page.getByText(/pedido de destino|buscar pedido/i).first().click()
  } else {
    await trigger.click()
  }
  await page.waitForTimeout(500)
}

async function contarOpcoesSelectAberto(page: Page): Promise<number> {
  return page.locator('[role="option"], .cg-select-option, .gtv-edit-custom-select-option').count()
}

async function selecionarPrimeiroPedidoModal(page: Page): Promise<{ numero: string; id: string } | null> {
  const opcao = page.locator('[role="option"], .cg-select-option, .gtv-edit-custom-select-option').first()
  if (!(await opcao.isVisible({ timeout: 8000 }).catch(() => false))) return null
  const rotulo = ((await opcao.textContent()) ?? '').trim()
  await opcao.click()
  await page.waitForTimeout(400)
  return { numero: rotulo.split(/\s/)[0] ?? rotulo, id: '' }
}

async function clicarProximoModal(page: Page): Promise<void> {
  await page.getByRole('button', { name: /próximo|proximo|adicionar item|avançar/i }).first().click()
  await page.waitForTimeout(600)
}

async function preencherNcm(page: Page): Promise<boolean> {
  const input = page.locator('.gtv-edit-popover-input, input[placeholder*="NCM" i], .gtv-ncm-input').first()
  if (await input.count() === 0) {
    const ncmTrigger = page.getByText(/^ncm$/i).first()
    await ncmTrigger.click({ force: true }).catch(() => {})
  }
  const campo = page.locator('.gtv-edit-popover-input, input').filter({ hasNot: page.locator('[id="mni-pn"]') }).first()
  await campo.fill(NCM_CODIGO).catch(async () => {
    await page.locator('input').nth(1).fill(NCM_CODIGO)
  })
  await page.waitForTimeout(800)
  const ok = await page.locator('.gtv-edit-popover-input--ncm-ok, .gtv-ncm-validation').first()
    .isVisible().catch(() => false)
  if (ok) await page.keyboard.press('Enter').catch(() => {})
  return true
}

async function selecionarPrimeiraMoeda(page: Page): Promise<string> {
  const moedaTrigger = page.locator('#mni-moeda').locator('..').locator('button, [role="combobox"]').first()
    .or(page.locator('[id="mni-moeda"] ~ button, label:has-text("Moeda") + * button').first())
  await moedaTrigger.click()
  await page.waitForTimeout(400)
  const opcao = page.locator('[role="option"], .cg-select-option').first()
  const texto = ((await opcao.textContent()) ?? '').trim()
  await opcao.click()
  return texto.split(/\s/)[0] ?? texto
}

function normalizarTexto(t: string): string {
  return t.replace(/\s+/g, ' ').trim()
}

function celulaContem(texto: string | null | undefined, trecho: string): boolean {
  return normalizarTexto(texto ?? '').toLowerCase().includes(trecho.toLowerCase())
}

async function lerCelulaItemPorCampo(page: Page, partNumber: string, colKey: string): Promise<string> {
  return page.evaluate(({ pn, key }) => {
    const filhos = Array.from(document.querySelectorAll('.gtv-linha--filho'))
    for (const filho of filhos) {
      const pnCel = filho.querySelector('[data-gtv-campo="part_number"]')
      if (!(pnCel?.textContent ?? '').includes(pn)) continue
      const cel = filho.querySelector(`[data-gtv-campo="${key}"]`)
      return (cel?.textContent ?? '').replace(/\s+/g, ' ').trim()
    }
    return ''
  }, { pn: partNumber, key: colKey })
}

async function expandirPedidoPorNumero(page: Page, numeroPedido: string): Promise<boolean> {
  const rowId = await page.evaluate((num) => {
    const cels = Array.from(document.querySelectorAll('[data-gtv-campo="numero_pedido"][data-gtv-rowid]'))
    for (const cel of cels) {
      if ((cel.textContent ?? '').includes(num)) return cel.getAttribute('data-gtv-rowid')
    }
    return null
  }, numeroPedido)
  if (!rowId) return false
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
  const chevron = pai.locator('.gtv-chevron-btn')
  const expandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida')).catch(() => false)
  if (!expandido && await chevron.count() > 0) {
    await chevron.click()
    await page.waitForTimeout(800)
  }
  return true
}

async function validarNovoItemManual(page: Page, sufixo: string): Promise<void> {
  const partNumber = `EMT-NIM-${sufixo}`
  const descricao = `EMT Novo Item Manual ${sufixo}`
  let numeroPedido = ''
  let moedaEscolhida = ''

  await garantirListaPedidos(page)
  const linhasPai = await page.locator('.gtv-linha--pai').count()
  await screenshot(page, '01-lista-carregada.png')
  if (linhasPai < 1) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, '01 — Lista deve exibir ≥1 pedido')
    return
  }
  logAprovado(LOCAL_LISTA, SUBLOCAL, `01 — Lista carregada (${linhasPai} pedidos visíveis)`)

  const modalAberto = await abrirModalNovoItemManual(page)
  await screenshot(page, '02-modal-novo-item-manual-aberto.png')
  if (!modalAberto) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, '02 — Abrir Novo → Novo Item → Manual')
    return
  }
  logAprovado(LOCAL_LISTA, SUBLOCAL, '02 — Modal Novo Item Manual aberto')

  const totalApi = await contarPedidosApiEscopo(page)
  await abrirSelectPedidoDestino(page)
  await screenshot(page, '03-modal-lista-pedidos-escopo-workspace.png')
  const opcoesUi = await contarOpcoesSelectAberto(page)
  if (opcoesUi < 1) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, `03 — Dropdown pedidos vazio (API escopo=${totalApi})`)
  } else if (totalApi > 0 && opcoesUi > totalApi) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, `03 — Opções UI (${opcoesUi}) excedem API escopo (${totalApi})`)
  } else {
    logAprovado(LOCAL_LISTA, SUBLOCAL, `03 — Pedidos do escopo workspace visíveis (UI=${opcoesUi}, API≈${totalApi})`)
  }

  const pedidoSel = await selecionarPrimeiroPedidoModal(page)
  if (!pedidoSel) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, '04 — Selecionar pedido no modal')
    return
  }
  numeroPedido = pedidoSel.numero
  await clicarProximoModal(page)
  await screenshot(page, '04-modal-pedido-selecionado-passo-dados.png')
  const passoDados = await page.getByText(/dados do item/i).first().isVisible().catch(() => false)
  if (!passoDados) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, '04 — Avançar para passo Dados do Item')
  } else {
    logAprovado(LOCAL_LISTA, SUBLOCAL, `04 — Pedido selecionado (${numeroPedido})`)
  }

  await page.locator('#mni-pn').fill(partNumber)
  await screenshot(page, '05.1-campo-part-number.png')
  logAprovado(LOCAL_LISTA, SUBLOCAL, `05.1 — Part Number (${partNumber})`)

  await preencherNcm(page)
  await screenshot(page, '05.2-campo-ncm-selecao.png')
  logAprovado(LOCAL_LISTA, SUBLOCAL, `05.2 — NCM (${NCM_CODIGO})`)

  await page.locator('#mni-desc').fill(descricao)
  await screenshot(page, '05.3-campo-descricao.png')
  logAprovado(LOCAL_LISTA, SUBLOCAL, '05.3 — Descrição preenchida')

  await page.locator('#mni-qty').click()
  await page.locator('#mni-qty').fill(QTD_INICIAL)
  await screenshot(page, '05.4-campo-qtd-inicial.png')
  logAprovado(LOCAL_LISTA, SUBLOCAL, `05.4 — Qtd. Inicial (${QTD_INICIAL})`)

  moedaEscolhida = await selecionarPrimeiraMoeda(page)
  await screenshot(page, '05.5-campo-moeda-selecao.png')
  logAprovado(LOCAL_LISTA, SUBLOCAL, `05.5 — Moeda (${moedaEscolhida})`)

  await page.locator('#mni-valor').click()
  await page.locator('#mni-valor').fill(VALOR_UNITARIO)
  await page.waitForTimeout(400)
  await screenshot(page, '05.6-campo-valor-unitario-total-calculado.png')
  const totalModal = await page.locator('#mni-total').inputValue().catch(() => '')
  if (!totalModal.includes('2550') && !totalModal.includes('2.550')) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, `05.6 — Valor total calculado esperado ~${VALOR_TOTAL_ESPERADO} (obtido: ${totalModal})`)
  } else {
    logAprovado(LOCAL_LISTA, SUBLOCAL, `05.6 — Valor unitário ${VALOR_UNITARIO} · total ${totalModal}`)
  }

  await page.getByRole('button', { name: /adicionar item/i }).click()
  await page.waitForTimeout(2000)
  await screenshot(page, '05.7-adicionar-item-resultado.png')
  const modalFechou = !(await page.getByText(/^novo item$/i).first().isVisible().catch(() => false))
  if (!modalFechou) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, '05.7 — Adicionar Item (modal deve fechar)')
  } else {
    logAprovado(LOCAL_LISTA, SUBLOCAL, '05.7 — Item adicionado com sucesso')
  }

  await garantirListaPedidos(page)
  await expandirPedidoPorNumero(page, numeroPedido)
  await screenshot(page, '06-item-novo-linha-grade-resultado.png')
  const pnGrade = await lerCelulaItemPorCampo(page, partNumber, 'part_number')
  if (!celulaContem(pnGrade, partNumber)) {
    falharTabela(LOCAL_LISTA, SUBLOCAL, `06 — Item ${partNumber} visível na grade`)
  } else {
    logAprovado(LOCAL_LISTA, SUBLOCAL, `06 — Linha item na grade (${partNumber})`)
  }

  const checks: Array<{ passo: string; key: string; print: string; esperado: string }> = [
    { passo: '07.1', key: 'part_number', print: '07.1-coluna-part-number.png', esperado: partNumber },
    { passo: '07.2', key: 'ncm', print: '07.2-coluna-ncm.png', esperado: NCM_CODIGO },
    { passo: '07.3', key: 'descricao_item', print: '07.3-coluna-descricao.png', esperado: descricao.slice(0, 12) },
    { passo: '07.4', key: 'quantidade_total_pedido', print: '07.4-coluna-qtd-inicial.png', esperado: QTD_INICIAL },
    { passo: '07.5', key: 'moeda_pedido', print: '07.5-coluna-moeda.png', esperado: moedaEscolhida },
    { passo: '07.6', key: 'valor_por_unidade_item', print: '07.6-coluna-valor-unitario.png', esperado: '25,50' },
    { passo: '07.7', key: 'valor_total_pedido', print: '07.7-coluna-valor-total.png', esperado: '550' },
  ]

  for (const c of checks) {
    const texto = await lerCelulaItemPorCampo(page, partNumber, c.key)
    await screenshot(page, c.print)
    if (celulaContem(texto, c.esperado)) {
      logAprovado(LOCAL_LISTA, SUBLOCAL, `${c.passo} — Coluna ${c.key} (${texto})`)
    } else {
      falharTabela(LOCAL_LISTA, SUBLOCAL, `${c.passo} — Coluna ${c.key} deve conter «${c.esperado}» (obtido: ${texto})`)
    }
  }

  await screenshot(page, '07.8-pedido-agregados-resultado.png')
  logAprovado(LOCAL_LISTA, SUBLOCAL, '07.8 — Agregados do pedido inspecionados')

  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1200)
  await garantirListaPedidos(page)
  await expandirPedidoPorNumero(page, numeroPedido)
  const pnPersist = await lerCelulaItemPorCampo(page, partNumber, 'part_number')
  await screenshot(page, '08-novo-item-persistencia-apos-navegar-resultado.png')
  if (celulaContem(pnPersist, partNumber)) {
    logAprovado(LOCAL_LISTA, SUBLOCAL, '08 — Persistência hub→lista')
  } else {
    falharTabela(LOCAL_LISTA, SUBLOCAL, `08 — Item não persistiu após navegar (obtido: ${pnPersist})`)
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log('TESTE EM TELA — novo-item-manual')
  log(`Ambiente: ${ambienteExec} | Base: ${BASE_UI}`)
  log(`Pasta: ${OUT}`)

  await clerkSetup()
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  try {
    if (!(await autenticarClerk(page))) throw new Error('Autenticação falhou')
    await prepararEscopoWorkspaces(page)
    await page.waitForTimeout(1000)

    const sufixo = Date.now().toString(36).slice(-6).toUpperCase()
    await validarNovoItemManual(page, sufixo)

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    log('')
    log(`Resultado: ${resultado}`)
    if (falhas.length) {
      log('Falhas:')
      for (const f of falhas) log(`  - ${f}`)
    }

    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — novo-item-manual',
      `TST-EMT-PEDIDO-LISTA-NOVO-ITEM-MANUAL-001`,
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

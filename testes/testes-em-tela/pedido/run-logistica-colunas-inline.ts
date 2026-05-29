/**
 * Teste em tela — edição inline das 6 colunas logísticas (Pedido)
 *
 * Cenários por coluna:
 *   A) somente no pedido (linha pai)
 *   B) na linha filho — editável e roteia PATCH para o pedido (não PUT item)
 *   C) pedido + checkbox "Aplicar a todos" (logística: checkbox não deve aparecer)
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/run-logistica-colunas-inline.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/produto/pedido/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const OUT = resolve(__dirRoot, '2026-05-29-logistica-pais-origem-destino-validacao')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

type ColunaLogistica = {
  key: string
  label: string
  /** Texto parcial da opção no popover (UN/LOCODE, ISO ou IATA) */
  opcaoContem: string
}

const COLUNAS: ColunaLogistica[] = [
  { key: 'porto_origem', label: 'Porto de Origem', opcaoContem: 'DEHAM' },
  { key: 'porto_destino', label: 'Porto de Destino', opcaoContem: 'BRSSZ' },
  { key: 'local_de_origem', label: 'País origem', opcaoContem: 'BR' },
  { key: 'local_de_destino', label: 'País destino', opcaoContem: 'DE' },
  { key: 'aeroporto_origem', label: 'Aeroporto de Origem', opcaoContem: 'GRU' },
  { key: 'aeroporto_destino', label: 'Aeroporto de Destino', opcaoContem: 'EZE' },
]

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

async function aguardarWorkspaceAtivo(page: Page): Promise<void> {
  await prepararEscopoWorkspaces(page)
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
    }, WORKSPACE_CDE_PADRAO)
    log(`⚠ Workspace forçado (${WORKSPACE_CDE_PADRAO})`)
  }
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
    log('⚠ CLERK_SECRET_KEY ausente')
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

async function garantirListaPedidos(page: Page): Promise<void> {
  await aguardarWorkspaceAtivo(page)
  await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 })
  await page.locator('.gtv-linha--pai .gtv-chevron-btn').first().waitFor({ timeout: 45000 })
  // Aguarda células editáveis (lista com pedidos carregados)
  await page.waitForFunction(
    () => document.querySelectorAll('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').length > 0,
    undefined,
    { timeout: 60000 },
  )
  await page.waitForTimeout(800)
  if (page.url().includes('/hub') || page.url().includes('/login')) {
    throw new Error(`Lista inacessível — URL ${page.url()}`)
  }
  // Recarrega após workspace para garantir pedidos do escopo correto
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 })
  await page.waitForFunction(
    () => document.querySelectorAll('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').length > 0,
    undefined,
    { timeout: 60000 },
  )
  await page.waitForTimeout(1500)
}

async function garantirColunasLogisticaVisiveis(page: Page): Promise<void> {
  const btnColunas = page.getByRole('button', { name: 'Colunas' })
  await btnColunas.click()
  await page.getByRole('button', { name: /Selecionar tudo/i }).click()
  await page.waitForTimeout(600)
  await page.keyboard.press('Escape')
  await page.locator('.scg-popover').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(1200)
  log('✓ Colunas: "Selecionar tudo" aplicado (logística visível)')
}

async function scrollColunaParaVisivel(page: Page, campo: string): Promise<void> {
  await page.evaluate((colKey) => {
    const th = document.querySelector(`[data-find-col-key="${colKey}"]`) as HTMLElement | null
    th?.scrollIntoView({ inline: 'center', block: 'nearest' })
    const scroll = document.querySelector('.gtv-tabela-scroll') as HTMLElement | null
    if (scroll && th) {
      const left = th.offsetLeft - scroll.clientWidth / 2
      scroll.scrollLeft = Math.max(0, left)
    }
  }, campo)
  await page.waitForTimeout(600)
}

async function aguardarCelulaPaiEditavel(
  page: Page,
  rowId: string,
  campo: string,
): Promise<void> {
  await scrollColunaParaVisivel(page, campo)
  await page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`).waitFor({ timeout: 20000 })
}

async function obterPrimeiroPedidoRowId(page: Page): Promise<string> {
  const celEditavel = page.locator('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').first()
  await celEditavel.waitFor({ timeout: 30000 })
  const id = await celEditavel.getAttribute('data-gtv-rowid')
  if (!id) throw new Error('Nenhum pedido com data-gtv-rowid na lista')
  return id
}

async function expandirPedidoPorRowId(page: Page, rowId: string): Promise<void> {
  const pai = page.locator(`.gtv-linha--pai:has([data-gtv-rowid="${rowId}"])`).first()
  await pai.waitFor({ timeout: 20000 })
  const jaExpandido = await pai.evaluate(el => el.classList.contains('gtv-linha--expandida'))
  if (!jaExpandido) {
    await pai.locator('.gtv-chevron-btn').click()
    await page.waitForTimeout(800)
  }
  await pai.locator('~ .gtv-linha--filho, + * .gtv-linha--filho').first().waitFor({ timeout: 60000 }).catch(async () => {
    await page.locator('.gtv-linha--filho').first().waitFor({ timeout: 60000 })
  })
  await page.waitForTimeout(400)
}

async function clicarCelulaFilhoLogistica(page: Page, colKey: string): Promise<{ ok: boolean; debug: string }> {
  await scrollColunaParaVisivel(page, colKey)
  await page.waitForTimeout(600)
  return page.evaluate((colKey) => {
    const filho = document.querySelector('.gtv-linha--filho')
    if (!filho) return { ok: false, debug: 'sem-linha-filho' }
    const porAttr = filho.querySelector(`[data-gtv-filho-rowid][data-gtv-campo="${colKey}"]`) as HTMLElement | null
    if (porAttr) {
      porAttr.click()
      return { ok: true, debug: 'click-attr' }
    }
    const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
    const idx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
    if (idx < 0) return { ok: false, debug: `col-idx-nao-${colKey}` }
    const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
      c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
    )
    const cel = cells[idx] as HTMLElement | undefined
    if (!cel) return { ok: false, debug: `cel-idx-${idx}-ausente` }
    const editavel = cel.classList.contains('gtv-celula--editavel')
    cel.click()
    return { ok: editavel, debug: `click-idx-${idx}-editavel=${editavel}-class=${cel.className}` }
  }, colKey)
}

async function fecharPopover(page: Page): Promise<void> {
  await page.keyboard.press('Escape').catch(() => {})
  await page.locator('.gtv-edit-popover').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(300)
}

async function screenshotCabecalhosPais(page: Page): Promise<void> {
  await scrollColunaParaVisivel(page, 'local_de_origem')
  await scrollColunaParaVisivel(page, 'local_de_destino')
  await screenshot(page, '01-cabecalhos-pais-origem-destino.png')
  const headers = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-find-col-key]'))
      .map(el => ({
        key: el.getAttribute('data-find-col-key'),
        label: (el.textContent ?? '').trim(),
      }))
      .filter(h => h.key === 'local_de_origem' || h.key === 'local_de_destino'),
  )
  log(`  Cabeçalhos país: ${JSON.stringify(headers)}`)
  const ok = headers.some(h => h.key === 'local_de_origem' && /país origem/i.test(h.label))
    && headers.some(h => h.key === 'local_de_destino' && /país destino/i.test(h.label))
  if (!ok) {
    throw new Error(`Labels incorretos nos cabeçalhos: ${JSON.stringify(headers)}`)
  }
  log('  ✓ Labels "País origem" e "País destino" visíveis no cabeçalho')
}

async function screenshot(page: Page, nome: string): Promise<void> {
  const path = resolve(OUT, nome)
  await page.screenshot({ path, fullPage: false })
  log(`  📷 ${nome}`)
}

async function lerTextoCelulaPai(page: Page, rowId: string, campo: string): Promise<string> {
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${campo}"]`)
  if (await cel.count() === 0) return '(celula nao editavel)'
  return (await cel.innerText()).trim()
}

async function selecionarOpcaoNoPopover(page: Page, termo: string): Promise<void> {
  await page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 })
  await page.waitForFunction(
    () => document.querySelectorAll('.gtv-edit-popover-opcao').length > 0,
    undefined,
    { timeout: 20000 },
  )
  const busca = page.locator('.gtv-edit-popover-input--busca')
  const temBusca = await busca.count() > 0
  const numOpcoes = await page.locator('.gtv-edit-popover-opcao').count()
  // Busca com 2 letras (ISO) zera a lista no filtro — clicar direto na lista completa.
  if (temBusca && numOpcoes > 8 && termo.length > 3) {
    await busca.fill(termo)
    await page.waitForTimeout(900)
  }
  const clicou = await page.evaluate((t) => {
    const botoes = Array.from(document.querySelectorAll('.gtv-edit-popover-opcao')) as HTMLElement[]
    const alvo = botoes.find(b => (b.textContent ?? '').includes(t))
      ?? botoes.find(b => (b.textContent ?? '').trim().startsWith(t))
    const btn = alvo ?? botoes[0]
    if (!btn) return false
    btn.click()
    return true
  }, termo)
  if (!clicou) {
    throw new Error(`Nenhuma opção no popover para termo "${termo}"`)
  }
  await page.waitForTimeout(300)
}

async function aguardarNotificacao(page: Page, timeoutMs = 8000): Promise<'sucesso' | 'erro' | 'nenhuma'> {
  const sucesso = page.getByText(/campo atualizado com sucesso/i)
  const erro = page.getByText(/erro ao editar campo/i)
  try {
    await Promise.race([
      sucesso.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => 'sucesso' as const),
      erro.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => 'erro' as const),
    ])
  } catch {
    return 'nenhuma'
  }
  if (await erro.isVisible().catch(() => false)) return 'erro'
  if (await sucesso.isVisible().catch(() => false)) return 'sucesso'
  return 'nenhuma'
}

/** Cenário A — edição na linha pai */
async function testarSomentePedido(
  page: Page,
  col: ColunaLogistica,
  rowId: string,
  prefix: string,
): Promise<'PASS' | 'FAIL'> {
  try {
    await aguardarCelulaPaiEditavel(page, rowId, col.key)
  } catch {
    log(`  ✗ ${col.key} pedido: célula editável não encontrada`)
    await screenshot(page, `${prefix}-pedido-celula-ausente.png`)
    return 'FAIL'
  }
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${col.key}"]`)

  const antes = await lerTextoCelulaPai(page, rowId, col.key)
  await cel.click()
  await page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 })
  await screenshot(page, `${prefix}-01-pedido-popover-aberto.png`)

  await selecionarOpcaoNoPopover(page, col.opcaoContem)

  const notif = await aguardarNotificacao(page)
  await page.waitForTimeout(1000)
  await screenshot(page, `${prefix}-02-pedido-apos-salvar.png`)

  const depois = await lerTextoCelulaPai(page, rowId, col.key)
  const codigoEsperado = col.opcaoContem.split('—')[0].trim()
  const ok = depois !== '—' && (
    notif === 'sucesso'
    || depois !== antes
    || depois.includes(codigoEsperado)
    || depois.includes(col.opcaoContem)
  )
  log(`  ${ok ? '✓' : '✗'} pedido: notif=${notif}, antes="${antes.slice(0, 40)}", depois="${depois.slice(0, 40)}"`)
  return ok ? 'PASS' : 'FAIL'
}

/** Cenário B — edição na linha filho (roteia para PATCH pedido, sem erro 400 em item) */
async function testarSomenteItem(
  page: Page,
  col: ColunaLogistica,
  rowId: string,
  prefix: string,
): Promise<'PASS' | 'FAIL'> {
  await expandirPedidoPorRowId(page, rowId)

  await screenshot(page, `${prefix}-03-item-linha-expandida.png`)

  const antesItem = await page.evaluate((colKey) => {
    const filho = document.querySelector('.gtv-linha--filho')
    if (!filho) return ''
    const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
    const idx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
    const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
      c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
    )
    return (cells[idx]?.textContent ?? '').trim()
  }, col.key)

  const click = await clicarCelulaFilhoLogistica(page, col.key)
  if (!click.ok) {
    log(`  ✗ item: célula não editável para ${col.key} (${click.debug})`)
    await screenshot(page, `${prefix}-04-item-celula-ausente.png`)
    return 'FAIL'
  }

  const popoverAbriu = await page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
  if (!popoverAbriu) {
    log(`  ✗ item: popover não abriu para ${col.key}`)
    await screenshot(page, `${prefix}-04-item-popover-nao-abriu.png`)
    return 'FAIL'
  }
  await screenshot(page, `${prefix}-04-item-popover-aberto.png`)

  await selecionarOpcaoNoPopover(page, col.opcaoContem)
  const notif = await aguardarNotificacao(page, 12000)
  await page.waitForTimeout(1000)
  await screenshot(page, `${prefix}-05-item-apos-salvar.png`)

  if (notif === 'erro') {
    log(`  ✗ item: toast de erro ao salvar ${col.key} (esperado sucesso via pedido)`)
    return 'FAIL'
  }

  const depoisItem = await page.evaluate((colKey) => {
    const filho = document.querySelector('.gtv-linha--filho')
    if (!filho) return ''
    const headers = Array.from(document.querySelectorAll('[data-find-col-key]'))
    const idx = headers.findIndex(h => h.getAttribute('data-find-col-key') === colKey)
    const cells = Array.from(filho.querySelectorAll('.gtv-celula')).filter(
      c => !c.classList.contains('gtv-col-fixa') && !c.classList.contains('gtv-celula--expand'),
    )
    return (cells[idx]?.textContent ?? '').trim()
  }, col.key)
  const depoisPai = await lerTextoCelulaPai(page, rowId, col.key)
  const codigoEsperado = col.opcaoContem.split('—')[0].trim()
  const ok = (notif === 'sucesso' || notif === 'nenhuma')
    && depoisItem !== '—'
    && (
      depoisItem.includes(codigoEsperado)
      || depoisItem !== antesItem
      || depoisPai.includes(codigoEsperado)
    )
  log(`  ${ok ? '✓' : '✗'} item→pedido: notif=${notif}, item="${depoisItem.slice(0, 40)}", pai="${depoisPai.slice(0, 40)}"`)
  return ok ? 'PASS' : 'FAIL'
}

/** Cenário C — popover pai: checkbox replicar (logística não deve exibir) */
async function testarPedidoReplicar(
  page: Page,
  col: ColunaLogistica,
  rowId: string,
  prefix: string,
): Promise<'PASS' | 'FAIL'> {
  await aguardarCelulaPaiEditavel(page, rowId, col.key)
  const cel = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${col.key}"]`)
  await cel.click()
  await page.locator('.gtv-edit-popover').waitFor({ timeout: 10000 })
  await screenshot(page, `${prefix}-05-pedido-popover-replicar.png`)

  const checkbox = page.getByText(/Aplicar a todos os itens deste pedido/i)
  const checkboxVisivel = await checkbox.isVisible().catch(() => false)

  if (checkboxVisivel) {
    log(`  ✗ replicar: checkbox visível em ${col.key} (deveria estar oculto)`)
    await fecharPopover(page)
    return 'FAIL'
  }

  log(`  ✓ replicar: checkbox oculto (correto — campo só existe no Pedido)`)

  await screenshot(page, `${prefix}-06-pedido-popover-sem-checkbox.png`)
  log('  ✓ replicar: cenário validado (sem checkbox; salvar é clique direto na opção)')
  return 'PASS'
}

async function testarUi() {
  log(`\n── UI logística inline (${BASE_UI}) ──`)
  mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })

  const resultados: Record<string, { pedido: string; item: string; replicar: string }> = {}

  try {
    if (!(await autenticarClerk(page))) {
      throw new Error('Autenticação Clerk falhou')
    }

    await garantirListaPedidos(page)
    await screenshot(page, '00-lista-pedidos-carregada.png')
    await garantirColunasLogisticaVisiveis(page)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 })
    await page.waitForFunction(
      () => document.querySelectorAll('.gtv-linha--pai .gtv-celula--editavel[data-gtv-rowid]').length > 0,
      undefined,
      { timeout: 60000 },
    )
    await page.waitForTimeout(2000)
    await screenshot(page, '00b-colunas-todas-visiveis.png')
    await screenshotCabecalhosPais(page)

    const rowId = await obterPrimeiroPedidoRowId(page)
    log(`Pedido alvo: ${rowId}`)

    for (const col of COLUNAS) {
      const prefix = col.key
      log(`\n── Coluna: ${col.label} (${col.key}) ──`)

      await fecharPopover(page)
      const rPedido = await testarSomentePedido(page, col, rowId, prefix)
      await fecharPopover(page)

      const rItem = await testarSomenteItem(page, col, rowId, prefix)
      await fecharPopover(page)

      const rReplicar = await testarPedidoReplicar(page, col, rowId, prefix)
      await fecharPopover(page)

      resultados[col.key] = {
        pedido: rPedido,
        item: rItem,
        replicar: rReplicar,
      }
    }

    const falhas = Object.entries(resultados).filter(([, r]) => r.pedido === 'FAIL' || r.item === 'FAIL' || r.replicar === 'FAIL')
    if (falhas.length > 0) {
      throw new Error(`Falhas: ${falhas.map(([k, r]) => `${k}(pedido=${r.pedido},item=${r.item},replicar=${r.replicar})`).join(', ')}`)
    }
  } finally {
    await browser.close()
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log(`Teste logística colunas inline — ${new Date().toISOString()}`)
  log(`Pasta prints: ${OUT}`)

  await clerkSetup({ debug: false, dotenv: false })
  await testarUi()

  writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
  log('\n✅ Teste em tela concluído — veja RESULTADO.txt e screenshots')
}

main().catch((err) => {
  console.error(err)
  mkdirSync(OUT, { recursive: true })
  writeFileSync(
    resolve(OUT, 'RESULTADO.txt'),
    [...linhas, `ERRO: ${err instanceof Error ? err.message : String(err)}`].join('\n'),
    'utf-8',
  )
  process.exit(1)
})

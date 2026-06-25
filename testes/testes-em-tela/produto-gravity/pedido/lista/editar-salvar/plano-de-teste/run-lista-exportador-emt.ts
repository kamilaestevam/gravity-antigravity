/**
 * EMT — Coluna Exportador (Lista Pedido)
 * Valida: EXP → lista workspaces com nomes; IMP → lista fornecedores exportadores; nunca CUID cru.
 *
 * Uso: npx tsx testes/testes-em-tela/produto-gravity/pedido/lista/editar-salvar/plano-de-teste/run-lista-exportador-emt.ts
 */
import { chromium, type Page, type Locator } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/produto/pedido/.env') })

const { ambiente: ambienteExec } = aplicarChavesClerkParaAmbiente()

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID ?? 'exportador')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`

const COLUNA_EXPORTADOR = 'EXPORTADOR'
const CUID_RE = /^c[a-z0-9]{8,}$/i

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
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
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

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL ?? 'dmmltda@gmail.com'
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
    falhar(`Clerk sign-in falhou: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
  await prepararEscopoWorkspaces(page)
  return true
}

async function aguardarListaComPedidos(page: Page): Promise<void> {
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 45000 })
  await page.locator('.gtv-linha--pai .gtv-chevron-btn').first().waitFor({ timeout: 45000 })
  await page.waitForTimeout(800)
}

async function garantirColunasListaVisiveis(page: Page): Promise<void> {
  const btnColunas = page.getByRole('button', { name: 'Colunas' })
  if (!(await btnColunas.isVisible({ timeout: 10000 }).catch(() => false))) return
  await btnColunas.click()
  await page.getByRole('button', { name: /Selecionar tudo/i }).click()
  await page.waitForTimeout(600)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1200)
}

async function entrarNaLista(page: Page): Promise<void> {
  await page.goto(LISTA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await aguardarListaComPedidos(page)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await aguardarListaComPedidos(page)
  await garantirColunasListaVisiveis(page)
}

async function celulaCampo(linha: Locator, campo: string): Promise<Locator> {
  return linha.locator(`.gtv-celula[data-gtv-campo="${campo}"]`).first()
}

async function textoCelula(celula: Locator): Promise<string> {
  return (await celula.innerText()).trim()
}

async function tipoOperacaoDaLinha(linha: Locator): Promise<'importacao' | 'exportacao' | null> {
  const cel = await celulaCampo(linha, 'tipo_operacao')
  const txt = await textoCelula(cel)
  if (/importação/i.test(txt)) return 'importacao'
  if (/exportação/i.test(txt)) return 'exportacao'
  return null
}

async function main() {
  await clerkSetup()
  log(`EMT Exportador — ${BASE_UI} — ambiente=${ambienteExec}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } })
  const page = await context.newPage()

  if (!(await autenticarClerk(page))) {
    await browser.close()
    process.exit(1)
  }

  await entrarNaLista(page)
  await screenshot(page, '01-lista-carregada.png')

  const celulasExportador = page.locator('.gtv-linha--pai .gtv-celula[data-gtv-campo="nome_exportador"]')
  const qtdCelulasExp = await celulasExportador.count()
  if (qtdCelulasExp < 1) {
    falhar('Coluna nome_exportador não visível (data-gtv-campo)')
  } else {
    log(`✓ Coluna ${COLUNA_EXPORTADOR} visível (${qtdCelulasExp} células editáveis)`)
  }

  const linhasPai = page.locator('.gtv-linha--pai')
  const total = await linhasPai.count()
  log(`Pedidos na página: ${total}`)

  let pedidoExp: Locator | null = null
  let pedidoImp: Locator | null = null
  let textoWsExp = ''
  let textoExp = ''

  for (let i = 0; i < Math.min(total, 40); i++) {
    const linha = linhasPai.nth(i)
    const tipo = await tipoOperacaoDaLinha(linha)
    if (tipo === 'exportacao' && !pedidoExp) {
      pedidoExp = linha
      textoWsExp = await textoCelula(await celulaCampo(linha, 'id_workspace'))
      textoExp = await textoCelula(await celulaCampo(linha, 'nome_exportador'))
    }
    if (tipo === 'importacao' && !pedidoImp) pedidoImp = linha
  }

  // Passo 1 — EXP: célula Exportador não exibe CUID (espelha workspace)
  if (!pedidoExp) {
    falhar('Nenhum pedido de Exportação encontrado na página')
  } else {
    if (CUID_RE.test(textoExp)) {
      falhar(`Exportação: coluna Exportador exibe CUID cru (${textoExp})`)
      await screenshot(page, '02-exp-cuid-errado.png')
    } else {
      log(`✓ EXP Exportador legível: "${textoExp}"`)
      if (textoWsExp && textoExp !== textoWsExp && !CUID_RE.test(textoWsExp)) {
        log(`⚠ EXP: Exportador (${textoExp}) difere de Workspace (${textoWsExp}) — verificar regra espelho`)
      }
    }
  }

  // Passo 2 — EXP: popover abre com lista de workspaces (não texto livre)
  if (pedidoExp) {
    const celExpCol = await celulaCampo(pedidoExp, 'nome_exportador')
    await celExpCol.click()
    const popover = page.locator('.gtv-edit-popover')
    await popover.waitFor({ state: 'visible', timeout: 8000 })
    await page.locator('.gtv-edit-popover-opcao').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(400)
    const opcoes = popover.locator('.gtv-edit-popover-opcao')
    const qtdOpcoes = await opcoes.count()
    const inputTexto = popover.locator('input[type="text"], textarea').first()
    const temInput = await inputTexto.isVisible().catch(() => false)

    await screenshot(page, '03-exp-popover-exportador.png')

    if (qtdOpcoes < 2) {
      falhar(`EXP: popover Exportador deveria listar workspaces (opções=${qtdOpcoes})`)
    } else {
      log(`✓ EXP popover com ${qtdOpcoes} opções de workspace`)
      const labels = await opcoes.allInnerTexts()
      const cuidNasOpcoes = labels.some(l => CUID_RE.test(l.trim()))
      if (cuidNasOpcoes) {
        falhar('EXP: opções do popover contêm CUID como label')
      } else {
        log('✓ EXP: labels das opções são legíveis')
      }
    }
    if (temInput && qtdOpcoes === 0) {
      falhar('EXP: popover abriu em modo texto livre em vez de lista')
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  }

  // Passo 3 — IMP: popover lista fornecedores exportadores (não workspace do pedido)
  if (!pedidoImp) {
    log('⚠ Nenhum pedido Importação na página — passo IMP ignorado')
  } else {
    const celImp = await celulaCampo(pedidoImp, 'nome_exportador')
    const textoWsImp = await textoCelula(await celulaCampo(pedidoImp, 'id_workspace'))
    const textoImp = await textoCelula(celImp)
    if (CUID_RE.test(textoImp)) {
      falhar(`IMP: coluna Exportador exibe CUID cru (${textoImp})`)
    } else if (textoImp.trim() && textoWsImp.trim() && textoImp.trim() === textoWsImp.trim()) {
      falhar(`IMP: Exportador exibe nome do workspace (${textoImp}) — deve ser fornecedor`)
    } else {
      log(`✓ IMP Exportador legível: "${textoImp || '(vincular)'}"`)
    }
    await celImp.click()
    const popoverImp = page.locator('.gtv-edit-popover')
    await popoverImp.waitFor({ state: 'visible', timeout: 8000 })
    await page.locator('.gtv-edit-popover-opcao').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(400)
    const opcoesImp = popoverImp.locator('.gtv-edit-popover-opcao')
    const qtdImp = await opcoesImp.count()
    await screenshot(page, '04-imp-popover-exportador.png')
    if (qtdImp < 1) {
      falhar(`IMP: popover Exportador sem fornecedores (opções=${qtdImp})`)
    } else {
      const labelsImp = await opcoesImp.allInnerTexts()
      const vazouWorkspace = labelsImp.some((l) => l.trim() === textoWsImp.trim())
      if (vazouWorkspace && textoWsImp.trim()) {
        falhar(`IMP: popover listou workspace "${textoWsImp}" como exportador`)
      } else {
        log(`✓ IMP popover com ${qtdImp} exportadores (sem workspace do pedido)`)
      }
    }
    await page.keyboard.press('Escape')
  }

  // Passo 4 — MANUAL 777 se existir
  const linha777 = page.locator('.gtv-linha--pai').filter({ hasText: 'MANUAL 777' }).first()
  if (await linha777.isVisible().catch(() => false)) {
    const txt777 = await textoCelula(await celulaCampo(linha777, 'nome_exportador'))
    await screenshot(page, '05-manual-777-exportador.png')
    if (CUID_RE.test(txt777)) {
      falhar(`MANUAL 777: Exportador ainda exibe CUID (${txt777})`)
    } else {
      log(`✓ MANUAL 777 Exportador: "${txt777}"`)
    }
  } else {
    log('⚠ MANUAL 777 não visível nesta página')
  }

  mkdirSync(OUT, { recursive: true })
  const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
  writeFileSync(`${OUT}/RESULTADO.txt`, [...linhas, '', `RESULTADO: ${resultado}`, ...falhas.map(f => `FALHA: ${f}`)].join('\n'))
  log(`\n=== ${resultado} (${falhas.length} falha(s)) ===`)
  log(`Relatório: ${OUT}/RESULTADO.txt`)

  await browser.close()
  process.exit(falhas.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

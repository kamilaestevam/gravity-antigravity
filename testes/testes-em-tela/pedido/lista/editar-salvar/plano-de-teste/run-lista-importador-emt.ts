/**
 * EMT — Coluna Importador (Lista Pedido)
 * Valida: IMP → lista workspaces com nomes; EXP → lista fornecedores; nunca CUID cru.
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-importador-emt.ts
 */
import { chromium, type Page, type Locator } from 'playwright'
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

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID ?? 'importador')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const COLUNA_IMPORTADOR = 'IMPORTADOR'
const COLUNA_TIPO_OPERACAO = 'TIPO DE OPERAÇÃO'
const COLUNA_WORKSPACE = 'WORKSPACE'
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
  log(`EMT Importador — ${BASE_UI} — ambiente=${ambienteExec}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } })
  const page = await context.newPage()

  if (!(await autenticarClerk(page))) {
    await browser.close()
    process.exit(1)
  }

  await entrarNaLista(page)
  await screenshot(page, '01-lista-carregada.png')

  const celulasImportador = page.locator('.gtv-linha--pai .gtv-celula[data-gtv-campo="nome_importador"]')
  const qtdCelulasImp = await celulasImportador.count()
  if (qtdCelulasImp < 1) {
    falhar('Coluna nome_importador não visível (data-gtv-campo)')
  } else {
    log(`✓ Coluna Importador visível (${qtdCelulasImp} células editáveis)`)
  }

  const linhasPai = page.locator('.gtv-linha--pai')
  const total = await linhasPai.count()
  log(`Pedidos na página: ${total}`)

  let pedidoImp: Locator | null = null
  let pedidoExp: Locator | null = null
  let textoWsImp = ''
  let textoImp = ''

  for (let i = 0; i < Math.min(total, 40); i++) {
    const linha = linhasPai.nth(i)
    const tipo = await tipoOperacaoDaLinha(linha)
    if (tipo === 'importacao' && !pedidoImp) {
      pedidoImp = linha
      textoWsImp = await textoCelula(await celulaCampo(linha, 'id_workspace'))
      textoImp = await textoCelula(await celulaCampo(linha, 'nome_importador'))
    }
    if (tipo === 'exportacao' && !pedidoExp) pedidoExp = linha
  }

  // Passo 1 — IMP: célula Importador não exibe CUID
  if (!pedidoImp) {
    falhar('Nenhum pedido de Importação encontrado na página')
  } else {
    if (CUID_RE.test(textoImp)) {
      falhar(`Importação: coluna Importador exibe CUID cru (${textoImp})`)
      await screenshot(page, '02-imp-cuid-errado.png')
    } else {
      log(`✓ IMP Importador legível: "${textoImp}"`)
      if (textoWsImp && textoImp !== textoWsImp && !CUID_RE.test(textoWsImp)) {
        log(`⚠ IMP: Importador (${textoImp}) difere de Workspace (${textoWsImp}) — verificar regra espelho`)
      }
    }
  }

  // Passo 2 — IMP: popover abre com lista de opções (não campo texto livre)
  if (pedidoImp) {
    const celImp = await celulaCampo(pedidoImp, 'nome_importador')
    await celImp.click()
    const popover = page.locator('.gtv-edit-popover')
    await popover.waitFor({ state: 'visible', timeout: 8000 })
    await page.locator('.gtv-edit-popover-opcao').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(400)
    const opcoes = popover.locator('.gtv-edit-popover-opcao')
    const qtdOpcoes = await opcoes.count()
    const inputTexto = popover.locator('input[type="text"], textarea').first()
    const temInput = await inputTexto.isVisible().catch(() => false)

    await screenshot(page, '03-imp-popover-importador.png')

    if (qtdOpcoes < 2) {
      falhar(`IMP: popover Importador deveria listar workspaces (opções=${qtdOpcoes})`)
    } else {
      log(`✓ IMP popover com ${qtdOpcoes} opções de workspace`)
      const labels = await opcoes.allInnerTexts()
      const cuidNasOpcoes = labels.some(l => CUID_RE.test(l.trim()))
      if (cuidNasOpcoes) {
        falhar('IMP: opções do popover contêm CUID como label')
      } else {
        log('✓ IMP: labels das opções são legíveis')
      }
    }
    if (temInput && qtdOpcoes === 0) {
      falhar('IMP: popover abriu em modo texto livre em vez de lista')
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  }

  // Passo 3 — EXP: popover lista fornecedores (ou badge legível)
  if (!pedidoExp) {
    log('⚠ Nenhum pedido Exportação na página — passo EXP ignorado')
  } else {
    const celExp = await celulaCampo(pedidoExp, 'nome_importador')
    const textoWsExp = await textoCelula(await celulaCampo(pedidoExp, 'id_workspace'))
    const textoExp = await textoCelula(celExp)
    if (CUID_RE.test(textoExp)) {
      falhar(`EXP: coluna Importador exibe CUID cru (${textoExp})`)
    } else if (textoExp.trim() && textoWsExp.trim() && textoExp.trim() === textoWsExp.trim()) {
      falhar(`EXP: Importador exibe nome do workspace (${textoExp}) — deve ser fornecedor`)
    } else {
      log(`✓ EXP Importador legível: "${textoExp || '(vincular)'}"`)
    }
    await celExp.click()
    const popoverExp = page.locator('.gtv-edit-popover')
    await popoverExp.waitFor({ state: 'visible', timeout: 8000 })
    await page.locator('.gtv-edit-popover-opcao').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(400)
    const opcoesExp = popoverExp.locator('.gtv-edit-popover-opcao')
    const qtdExp = await opcoesExp.count()
    await screenshot(page, '04-exp-popover-importador.png')
    if (qtdExp < 1) {
      falhar(`EXP: popover Importador sem fornecedores (opções=${qtdExp})`)
    } else {
      const labelsExp = await opcoesExp.allInnerTexts()
      const textoWs = await textoCelula(await celulaCampo(pedidoExp, 'id_workspace'))
      const vazouWorkspace = labelsExp.some((l) => l.trim() === textoWs.trim())
      if (vazouWorkspace && textoWs.trim()) {
        falhar(`EXP: popover listou workspace "${textoWs}" como importador`)
      } else {
        log(`✓ EXP popover com ${qtdExp} importadores (sem workspace do pedido)`)
      }
    }
    await page.keyboard.press('Escape')
  }

  // Passo 4 — MANUAL 777 se existir
  const linha777 = page.locator('.gtv-linha--pai').filter({ hasText: 'MANUAL 777' }).first()
  if (await linha777.isVisible().catch(() => false)) {
    const txt777 = await textoCelula(await celulaCampo(linha777, 'nome_importador'))
    await screenshot(page, '05-manual-777-importador.png')
    if (CUID_RE.test(txt777)) {
      falhar(`MANUAL 777: Importador ainda exibe CUID (${txt777})`)
    } else {
      log(`✓ MANUAL 777 Importador: "${txt777}"`)
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

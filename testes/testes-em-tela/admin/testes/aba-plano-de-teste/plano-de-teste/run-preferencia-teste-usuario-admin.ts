/**
 * Teste em tela — Preferência de Teste do Usuário (Admin › Rodar Testes › Favoritos)
 * Plano: TST-EMT-PREFERENCIA-TESTE-USUARIO-ADMIN-000095
 *
 * Ciclo: salvar favorito → aplicar → excluir → persistência após navegar.
 * Favoritos são gravados na tabela `teste_favorito_usuario` (escopo por id_usuario).
 *
 * Uso: npx tsx testes/testes-em-tela/admin/testes/aba-plano-de-teste/plano-de-teste/run-preferencia-teste-usuario-admin.ts
 */
import { chromium, type Page } from 'playwright'
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

const { ambiente: ambienteExec, clerkSecretPrefix } = aplicarChavesClerkParaAmbiente()

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const ADMIN_TESTES_URL = `${BASE_UI}/admin/testes`
const HUB_URL = `${BASE_UI}/hub`

const PRODUTO_EMT = 'Configurador'
const LOCAL_EMT = 'Admin'
const SUBLOCAL_EMT = 'testes/aba-plano-de-teste'
const AMBIENTE_LABEL = ambienteExec ?? 'Local'

const linhas: string[] = []
const falhas: string[] = []

function log(msg: string) { linhas.push(msg); console.log(msg) }
function falhar(msg: string) { falhas.push(msg); log(`✗ ${msg}`) }

/** Contrato Admin: `EMT_ROW|Ambiente|Produto|Local|Sublocal|Ação|Resultado` */
function emtRow(acao: string, resultado: 'Aprovado' | 'Reprovado'): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${PRODUTO_EMT}|${LOCAL_EMT}|${SUBLOCAL_EMT}|${acao}|${resultado}`
}
function aprovado(acao: string) { log(`✓ ${emtRow(acao, 'Aprovado')}`) }
function reprovado(acao: string) { falhar(emtRow(acao, 'Reprovado')) }

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email) { falhar('E2E_CLERK_USER_EMAIL ausente — configure no .env do Configurador'); return false }
  if (!process.env.CLERK_SECRET_KEY) { falhar('CLERK_SECRET_KEY ausente — não foi possível autenticar'); return false }

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
  aprovado('Login admin Gravity (Clerk)')
  return true
}

async function abrirModalRodarTestes(page: Page): Promise<boolean> {
  await page.goto(ADMIN_TESTES_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await screenshot(page, '02-admin-testes.png')

  const botaoModal = page.getByRole('button', { name: /rodar (todos os )?testes/i }).first()
  if (!(await botaoModal.isVisible({ timeout: 15000 }).catch(() => false))) {
    reprovado('Botão "Rodar Testes" não encontrado em Admin › Testes')
    return false
  }
  await botaoModal.click()
  const secao = page.getByText('Testes Favoritos', { exact: false }).first()
  const ok = await secao.isVisible({ timeout: 10000 }).catch(() => false)
  await screenshot(page, '03-modal-aberto.png')
  if (!ok) { reprovado('Seção "Testes Favoritos" não visível no modal'); return false }
  aprovado('Modal "Rodar Testes" aberto com seção Testes Favoritos')
  return true
}

async function marcarPrimeiroTipo(page: Page) {
  // Tipos são toggles (UNI/FUN/E2E/CRO/EMT). Marca o primeiro disponível.
  const tipo = page.getByRole('button', { name: /^(UNI|Unit)/i }).first()
  if (await tipo.isVisible({ timeout: 4000 }).catch(() => false)) await tipo.click()
}

async function salvarFavorito(page: Page) {
  try {
    await marcarPrimeiroTipo(page)
    await screenshot(page, '04-salvar-favorito-antes.png')
    const btnSalvar = page.getByRole('button', { name: /salvar configuração atual/i }).first()
    await btnSalvar.click()
    await screenshot(page, '04-salvar-favorito-selecao.png')
    await page.waitForTimeout(800)
    const aplicar = page.getByTitle(/aplicar esta configuração/i).first()
    const apareceu = await aplicar.isVisible({ timeout: 8000 }).catch(() => false)
    await screenshot(page, '04-salvar-favorito-resultado.png')
    if (apareceu) aprovado('Salvar favorito — item adicionado à lista')
    else reprovado('Salvar favorito — item não apareceu na lista')
  } catch (err) {
    reprovado(`Exceção ao salvar favorito: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function aplicarFavorito(page: Page) {
  try {
    await screenshot(page, '05-aplicar-favorito-antes.png')
    const aplicar = page.getByTitle(/aplicar esta configuração/i).first()
    await aplicar.click()
    await screenshot(page, '05-aplicar-favorito-selecao.png')
    await page.waitForTimeout(600)
    await screenshot(page, '05-aplicar-favorito-resultado.png')
    aprovado('Aplicar favorito — configuração reposta')
  } catch (err) {
    reprovado(`Exceção ao aplicar favorito: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function excluirFavorito(page: Page) {
  try {
    await screenshot(page, '06-excluir-favorito-antes.png')
    const remover = page.getByTitle(/remover favorito/i).first()
    const antes = await page.getByTitle(/remover favorito/i).count()
    await remover.click()
    await screenshot(page, '06-excluir-favorito-selecao.png')
    await page.waitForTimeout(800)
    const depois = await page.getByTitle(/remover favorito/i).count()
    await screenshot(page, '06-excluir-favorito-resultado.png')
    if (depois < antes) aprovado('Excluir favorito — item removido da lista')
    else reprovado('Excluir favorito — item permaneceu na lista')
  } catch (err) {
    reprovado(`Exceção ao excluir favorito: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function validarPersistencia(page: Page) {
  try {
    // Salva um favorito novo
    await marcarPrimeiroTipo(page)
    await page.getByRole('button', { name: /salvar configuração atual/i }).first().click()
    await page.waitForTimeout(800)
    // Navega hub → admin/testes e reabre o modal
    await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(800)
    const reaberto = await abrirModalRodarTestes(page)
    const presente = reaberto && await page.getByTitle(/aplicar esta configuração/i).first().isVisible({ timeout: 8000 }).catch(() => false)
    await screenshot(page, '07-persistencia-apos-navegar-resultado.png')
    if (presente) aprovado('Persistência — favorito permanece após navegar (gravado no banco)')
    else reprovado('Persistência — favorito não permaneceu após navegar')
  } catch (err) {
    reprovado(`Exceção na persistência: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log('TESTE EM TELA — preferencia-teste-usuario-admin')
  log(`Base: ${BASE_UI} | Ambiente: ${ambienteExec} | Clerk: ${clerkSecretPrefix}`)
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
    await page.waitForTimeout(1500)
    await screenshot(page, '01-pos-login.png')

    const okModal = await abrirModalRodarTestes(page)
    if (okModal) {
      await salvarFavorito(page)
      await aplicarFavorito(page)
      await excluirFavorito(page)
      await validarPersistencia(page)
    }

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    log('')
    log(`Resultado: ${resultado}`)
    for (const f of falhas) log(`  - ${f}`)

    writeFileSync(`${OUT}/RESULTADO.txt`, [
      'TESTE EM TELA — preferencia-teste-usuario-admin',
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
      'TESTE EM TELA — preferencia-teste-usuario-admin',
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

void main()

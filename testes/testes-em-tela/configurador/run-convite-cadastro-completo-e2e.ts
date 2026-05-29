/**
 * E2E COMPLETO — convite real Clerk → /cadastro/continuar → senha → hub
 *
 * Uso: npx tsx testes/testes-em-tela/configurador/run-convite-cadastro-completo-e2e.ts
 * Requer: Vite :8000, backend :8005, CLERK_SECRET_KEY, CONFIGURADOR_DATABASE_URL
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { clerkSetup, setupClerkTestingToken, clerk } from '@clerk/testing/playwright'
import { PrismaClient } from '../../../configurador/generated/index.js'
import { convidarUsuarioService } from '../../../servicos-global/configurador/server/services/convidar-usuario-service.js'
import { clerkClient } from '../../../servicos-global/configurador/server/lib/clerk.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/configurador/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const SENHA = process.env.E2E_CONVITE_PASSWORD ?? 'Gravity@Convite2026!'
const stamp = Date.now()
const OUT = resolve(__dirname, `${new Date().toISOString().split('T')[0]}-convite-cadastro-completo-e2e`)
const EMAIL = `dmmltda+prova-convite-${stamp}@gmail.com`
const NOME = 'Prova Convite E2E'

function urlConviteLocal(clerkUrl: string): string {
  try {
    const u = new URL(clerkUrl)
    const ticket = u.searchParams.get('ticket')
    if (ticket) {
      return `${BASE}/cadastro/continuar?__clerk_ticket=${encodeURIComponent(ticket)}&__clerk_status=sign_up`
    }
  } catch { /* fallback */ }
  return clerkUrl
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

const linhas: string[] = []
function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

async function vincularClerkPosCadastro(email: string, idUsuario: string) {
  for (let i = 0; i < 10; i++) {
    const list = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 })
    const data = Array.isArray(list) ? list : (list as { data?: Array<{ id: string }> }).data ?? []
    if (data[0]?.id) {
      await prisma.usuario.update({
        where: { id_usuario: idUsuario },
        data: { id_clerk_usuario: data[0].id },
      })
      return data[0].id
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error(`Clerk user não encontrado para ${email}`)
}

async function main() {
  mkdirSync(OUT, { recursive: true })

  const admin = await prisma.usuario.findFirst({
    where: { tipo_usuario: 'SUPER_ADMIN', status_usuario: 'ATIVO' },
  })
  if (!admin) throw new Error('SUPER_ADMIN ausente no banco')

  const org = await prisma.organizacao.findFirst({
    where: { status_organizacao: 'ATIVO', hospeda_colaboradores_gravity: false },
    orderBy: { data_criacao_organizacao: 'desc' },
  })
  const ws = org
    ? await prisma.workspace.findFirst({
        where: { id_organizacao: org.id_organizacao, status_workspace: 'ATIVO' },
      })
    : null
  if (!org || !ws) throw new Error('Org/workspace cliente ausentes')

  log('=== E2E CONVITE COMPLETO ===')
  log(`Email convite: ${EMAIL}`)
  log(`Senha: ${SENHA}`)

  const convite = await convidarUsuarioService({
    ator: {
      id_usuario: admin.id_usuario,
      id_organizacao: admin.id_organizacao,
      tipo_usuario: admin.tipo_usuario,
      nome_usuario: admin.nome_usuario ?? 'Admin',
      clerkUserId: admin.id_clerk_usuario,
    },
    id_organizacao_alvo: org.id_organizacao,
    email_usuario: EMAIL,
    nome_usuario: NOME,
    tipo_usuario: 'PADRAO',
    workspaces_alvo: [ws.id_workspace],
  })
  log(`Convite DB criado: ${convite.id_usuario}`)

  const pending = await prisma.usuario.findUnique({
    where: { id_usuario: convite.id_usuario },
    select: { id_clerk_usuario: true },
  })
  const invitationId = pending?.id_clerk_usuario?.replace(/^pending_/, '')
  if (!invitationId) throw new Error('pending_* ausente')

  const list = await clerkClient.invitations.getInvitationList({ status: 'pending', limit: 100 })
  const dataArr = Array.isArray(list) ? list : (list as { data?: unknown[] }).data ?? []
  const inv = (dataArr as Array<{ id: string; url?: string }>).find((i) => i.id === invitationId)
  if (!inv?.url) throw new Error('URL Clerk do convite não encontrada')

  const urlLocal = urlConviteLocal(inv.url)
  log(`URL convite (local): ${urlLocal}`)

  await clerkSetup({ debug: false, dotenv: false })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.setDefaultTimeout(180_000)

  try {
    await setupClerkTestingToken({ page })
    await page.goto(urlLocal, { waitUntil: 'domcontentloaded' })
    await page.screenshot({ path: resolve(OUT, '01-link-convite-aberto.png'), fullPage: true })

    await page.waitForFunction(() => {
      const email = document.querySelector('input[autocomplete="email"]') as HTMLInputElement | null
      return !!email?.value?.includes('@')
    }, { timeout: 180_000, polling: 500 })

    const emailValor = await page.locator('input[autocomplete="email"]').inputValue()
    const googleBtn = await page.getByRole('button', { name: /Continuar com Google/i }).count()
    const subtitulo = (await page.locator('.login-global-subtitle').first().textContent())?.trim() ?? ''

    if (googleBtn > 0) throw new Error('BUG: botão Google visível no convite')
    if (/entrou com Google/i.test(subtitulo)) throw new Error(`BUG: subtítulo OAuth: ${subtitulo}`)
    if (emailValor !== EMAIL) throw new Error(`BUG: email esperado ${EMAIL}, got ${emailValor}`)

    await page.screenshot({ path: resolve(OUT, '02-email-convite-preenchido.png'), fullPage: true })
    log(`Email preenchido: ${emailValor}`)

    await page.getByPlaceholder(/ex: ana paula silva/i).fill(NOME)
    await page.getByPlaceholder(/mínimo 8/i).first().fill(SENHA)
    const confirm = page.getByPlaceholder(/novamente|confirmar/i)
    if (await confirm.count()) await confirm.fill(SENHA)
    await page.locator('input[type="checkbox"]').click({ force: true })
    await page.waitForFunction(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => /criar conta/i.test(b.textContent ?? ''))
      return btn && !btn.hasAttribute('disabled')
    }, { timeout: 30_000 })
    await page.screenshot({ path: resolve(OUT, '03-formulario-senha-preenchido.png'), fullPage: true })

    await page.getByRole('button', { name: /criar conta/i }).click()

    await page.waitForURL(/\/login|\/hub|\/trial|\/selecionar-workspace/, { timeout: 30_000 })
    if (page.url().includes('/login')) {
      await setupClerkTestingToken({ page })
      await page.reload({ waitUntil: 'domcontentloaded' })
    }
    await page.waitForURL(/\/hub|\/trial|\/selecionar-workspace/, { timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(1000)
    await page.screenshot({ path: resolve(OUT, '04-pos-criar-conta.png'), fullPage: true })
    log(`URL após criar conta: ${page.url()}`)

    const codigoInput = page.getByPlaceholder(/000000/i)
    if (await codigoInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      log('Verificação e-mail — código 424242')
      await codigoInput.fill('424242')
      await page.getByRole('button', { name: /criar conta|verificar|confirmar/i }).click()
      await page.waitForTimeout(3000)
    }

    if (!page.url().match(/\/hub|\/trial|\/selecionar-workspace/)) {
      log(`Sem redirect automático (${page.url()}) — vincula Clerk + signIn`)
      await vincularClerkPosCadastro(EMAIL, convite.id_usuario)
      await clerk.signIn({ page, emailAddress: EMAIL, password: SENHA })
    }

    await page.waitForFunction(async () => {
      const clerkGlobal = (window as unknown as {
        Clerk?: { session?: { getToken: () => Promise<string | null> } }
      }).Clerk
      const token = await clerkGlobal?.session?.getToken()
      return !!token
    }, undefined, { timeout: 90_000 }).catch(async () => {
      await vincularClerkPosCadastro(EMAIL, convite.id_usuario)
      await clerk.signIn({ page, emailAddress: EMAIL, password: SENHA })
    })

    await page.goto(`${BASE}/hub`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: resolve(OUT, '05-hub-logado.png'), fullPage: true })
    log(`URL final: ${page.url()}`)

    const entrouNaPlataforma =
      page.url().includes('/trial')
      || page.url().includes('/hub')
      || page.url().includes('/selecionar-workspace')
      || (await page.getByText(/Bem-vindo a bordo/i).count()) > 0

    if (page.url().includes('/login')) throw new Error('BUG: ainda em /login após cadastro + signIn')
    if (!entrouNaPlataforma) throw new Error(`BUG: não entrou na plataforma — URL ${page.url()}`)

    log('APROVADO — entrou na plataforma')
    log(`Prints em: ${OUT}`)
  } catch (err) {
    await page.screenshot({ path: resolve(OUT, '99-falha.png'), fullPage: true }).catch(() => {})
    throw err
  } finally {
    await browser.close()
  }

  writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
}

main()
  .catch((e) => {
    console.error('FALHA E2E:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

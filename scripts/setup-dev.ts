#!/usr/bin/env npx tsx
/**
 * scripts/setup-dev.ts
 * Script de setup completo para desenvolvimento local.
 *
 * Executa:
 * 1. Cria .env files com valores de dev (se não existirem)
 * 2. Roda prisma migrate dev nos dois bancos
 * 3. Seed do catálogo de produtos (SimulaCusto, Smart Read, BID Frete)
 * 4. Cria tenant demo + user demo
 * 5. Ativa SimulaCusto para o tenant demo
 *
 * Uso:
 *   npx tsx scripts/setup-dev.ts
 *
 * Pré-requisitos:
 *   - PostgreSQL rodando localmente (porta 5432)
 *   - Banco 'configurador_dev' criado
 *   - Banco 'simulacusto_dev' criado
 *   - Node >= 18
 */

import { execSync } from 'child_process'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const CONFIGURADOR_PRISMA = resolve(ROOT, 'configurador/prisma')
const SIMULACUSTO_PRISMA = resolve(ROOT, 'produto/simula-custo/server/prisma')
const CONFIGURADOR_SERVER = resolve(ROOT, 'servicos-global/configurador')
const SIMULACUSTO_SERVER = resolve(ROOT, 'produto/simula-custo')

// ─── Cores para output ──────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
}

function log(msg: string) { console.log(`${C.cyan}[setup]${C.reset} ${msg}`) }
function ok(msg: string) { console.log(`${C.green}  ✓${C.reset} ${msg}`) }
function warn(msg: string) { console.log(`${C.yellow}  ⚠${C.reset} ${msg}`) }
function fail(msg: string) { console.log(`${C.red}  ✗${C.reset} ${msg}`) }
function header(msg: string) { console.log(`\n${C.bold}${C.cyan}═══ ${msg} ═══${C.reset}\n`) }

// ─── Constantes de dev ──────────────────────────────────────────────────────

const DEV_INTERNAL_KEY = 'gravity-dev-internal-key-2026'
const DEV_CONFIGURADOR_DB = 'postgresql://postgres:postgres@localhost:5432/configurador_dev'
const DEV_SIMULACUSTO_DB = 'postgresql://postgres:postgres@localhost:5432/simulacusto_dev'
const DEV_CLERK_PK = 'pk_test_PLACEHOLDER_CONFIGURE_IN_CLERK_DASHBOARD'
const DEV_CLERK_SK = 'sk_test_PLACEHOLDER_CONFIGURE_IN_CLERK_DASHBOARD'
const CONFIGURADOR_PORT = 8005
const SIMULACUSTO_PORT = 8020

// ─── Step 1: Criar .env files ───────────────────────────────────────────────

function createEnvFiles() {
  header('Step 1: Env Files')

  // Configurador server .env
  const confEnvPath = resolve(CONFIGURADOR_SERVER, '.env')
  if (!existsSync(confEnvPath)) {
    writeFileSync(confEnvPath, `# Gerado por setup-dev.ts — ${new Date().toISOString()}
NODE_ENV=development
PORT=${CONFIGURADOR_PORT}

# Database
CONFIGURADOR_DATABASE_URL=${DEV_CONFIGURADOR_DB}

# Auth (Clerk) — substitua por suas chaves reais do dashboard.clerk.com
CLERK_SECRET_KEY=${DEV_CLERK_SK}
CLERK_WEBHOOK_SECRET=whsec_dev_placeholder

# Billing (Stripe) — substitua por suas chaves reais
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_dev_placeholder

# S2S
INTERNAL_SERVICE_KEY=${DEV_INTERNAL_KEY}

# Trial
TRIAL_DAYS=14
DEMO_MODE=true
`)
    ok('Criado: servicos-global/configurador/.env')
  } else {
    warn('Já existe: servicos-global/configurador/.env (não sobrescrito)')
  }

  // Configurador client .env (Vite)
  const confClientEnvPath = resolve(CONFIGURADOR_SERVER, '../.env')
  if (!existsSync(confClientEnvPath)) {
    writeFileSync(confClientEnvPath, `# Gerado por setup-dev.ts
VITE_CLERK_PUBLISHABLE_KEY=${DEV_CLERK_PK}
VITE_INTERNAL_SERVICE_KEY=${DEV_INTERNAL_KEY}
VITE_CONFIGURADOR_URL=http://localhost:${CONFIGURADOR_PORT}
`)
    ok('Criado: servicos-global/configurador/.env (Vite client)')
  }

  // SimulaCusto server .env
  const scEnvPath = resolve(SIMULACUSTO_SERVER, 'server/.env')
  if (!existsSync(scEnvPath)) {
    writeFileSync(scEnvPath, `# Gerado por setup-dev.ts — ${new Date().toISOString()}
NODE_ENV=development
PORT=${SIMULACUSTO_PORT}

# Database
DATABASE_URL=${DEV_SIMULACUSTO_DB}

# S2S
INTERNAL_SERVICE_KEY=${DEV_INTERNAL_KEY}

# Clerk
CLERK_SECRET_KEY=${DEV_CLERK_SK}

# Integrações externas
SISCOMEX_BASE_URL=https://api-externa.portalunico.siscomex.gov.br/ttce/api/ext
SISCOMEX_HCAPTCHA_SITE_KEY=51829642-2c97-4db0-881c-d40b4ef3b259
CAPSOLVER_API_KEY=
BACEN_URL=https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata
`)
    ok('Criado: produto/simula-custo/server/.env')
  } else {
    warn('Já existe: produto/simula-custo/server/.env (não sobrescrito)')
  }

  // SimulaCusto client .env (Vite)
  const scClientEnvPath = resolve(SIMULACUSTO_SERVER, 'client/.env')
  if (!existsSync(scClientEnvPath)) {
    writeFileSync(scClientEnvPath, `# Gerado por setup-dev.ts
VITE_INTERNAL_SERVICE_KEY=${DEV_INTERNAL_KEY}
`)
    ok('Criado: produto/simula-custo/client/.env')
  }
}

// ─── Step 2: Criar bancos PostgreSQL ────────────────────────────────────────

function createDatabases() {
  header('Step 2: Criar Bancos de Dados')

  const databases = ['configurador_dev', 'simulacusto_dev']
  for (const db of databases) {
    try {
      execSync(
        `psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${db}'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE ${db}"`,
        { stdio: 'pipe', env: { ...process.env, PGPASSWORD: 'postgres' } }
      )
      ok(`Banco '${db}' disponível`)
    } catch {
      warn(`Não foi possível verificar/criar '${db}' automaticamente.`)
      warn(`Crie manualmente: CREATE DATABASE ${db};`)
    }
  }
}

// ─── Step 3: Prisma Migrate ─────────────────────────────────────────────────

function runMigrations() {
  header('Step 3: Prisma Migrate')

  // Configurador
  log('Migrando configurador_dev...')
  try {
    execSync('npx prisma migrate dev --name init --skip-seed', {
      cwd: CONFIGURADOR_PRISMA,
      stdio: 'inherit',
      env: { ...process.env, CONFIGURADOR_DATABASE_URL: DEV_CONFIGURADOR_DB },
    })
    ok('configurador_dev migrado')
  } catch {
    fail('Erro na migration do configurador. Verifique se o PostgreSQL está rodando.')
    warn('Tente manualmente: cd configurador/prisma && npx prisma migrate dev')
  }

  // SimulaCusto
  log('Migrando simulacusto_dev...')
  try {
    execSync('npx prisma migrate dev --name init --skip-seed', {
      cwd: SIMULACUSTO_PRISMA,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: DEV_SIMULACUSTO_DB },
    })
    ok('simulacusto_dev migrado')
  } catch {
    fail('Erro na migration do simula-custo. Verifique se o PostgreSQL está rodando.')
    warn('Tente manualmente: cd produto/simula-custo/server/prisma && npx prisma migrate dev')
  }
}

// ─── Step 4: Generate Prisma Client ─────────────────────────────────────────

function generatePrismaClients() {
  header('Step 4: Prisma Generate')

  try {
    execSync('npx prisma generate', {
      cwd: CONFIGURADOR_PRISMA,
      stdio: 'inherit',
      env: { ...process.env, CONFIGURADOR_DATABASE_URL: DEV_CONFIGURADOR_DB },
    })
    ok('Prisma client gerado (configurador)')
  } catch {
    warn('Falha no prisma generate do configurador')
  }

  try {
    execSync('npx prisma generate', {
      cwd: SIMULACUSTO_PRISMA,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: DEV_SIMULACUSTO_DB },
    })
    ok('Prisma client gerado (simula-custo)')
  } catch {
    warn('Falha no prisma generate do simula-custo')
  }
}

// ─── Step 5: Seed & Demo Data ───────────────────────────────────────────────

async function seedData() {
  header('Step 5: Seed & Demo Data')

  const BASE = `http://localhost:${CONFIGURADOR_PORT}`
  const HEADERS = {
    'Content-Type': 'application/json',
    'x-internal-key': DEV_INTERNAL_KEY,
  }

  // Esperar o servidor estar pronto
  log('Verificando se o servidor Configurador está rodando...')

  let serverReady = false
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(`${BASE}/health`)
      if (res.ok) {
        serverReady = true
        break
      }
    } catch {
      // Server não está rodando
    }
    if (i < 4) {
      log(`Tentativa ${i + 1}/5 — servidor não responde. Aguardando 2s...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  if (!serverReady) {
    warn('Servidor Configurador não está rodando.')
    warn(`Inicie com: cd servicos-global/configurador && npm run dev`)
    warn('Depois execute o seed separadamente:')
    console.log(`
  ${C.cyan}# Seed manual (após iniciar o servidor):${C.reset}

  # 1. Seed do catálogo de produtos
  curl -X POST ${BASE}/api/admin/products/seed \\
    -H "x-internal-key: ${DEV_INTERNAL_KEY}"

  # 2. Criar tenant demo
  curl -X POST ${BASE}/api/v1/tenants \\
    -H "Content-Type: application/json" \\
    -d '{"name":"Demo Corp","slug":"demo-corp","clerkUserId":"user_demo","ownerEmail":"admin@demo.com","ownerName":"Admin Demo"}'

  # 3. Ativar SimulaCusto para o tenant (use o id retornado no passo 2)
  curl -X POST ${BASE}/api/admin/tenants/{TENANT_ID}/products/simula-custo/activate \\
    -H "x-internal-key: ${DEV_INTERNAL_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '{}'
`)
    return
  }

  ok('Servidor Configurador respondendo')

  // 5a. Seed do catálogo de produtos
  log('Fazendo seed do catálogo de produtos...')
  try {
    // O seed via API requer auth admin, então vamos usar o Prisma diretamente
    const seedRes = await fetch(`${BASE}/api/admin/products/seed`, {
      method: 'POST',
      headers: HEADERS,
    })
    if (seedRes.ok) {
      const data = await seedRes.json()
      if (data.seeded) {
        ok(`Seed concluído: ${data.count} produtos criados`)
      } else {
        warn('Produtos já existem no catálogo (seed pulado)')
      }
    } else {
      warn(`Seed via API retornou ${seedRes.status} — talvez precise de auth admin`)
      warn('Execute manualmente após configurar Clerk')
    }
  } catch (err) {
    warn(`Erro no seed: ${err}`)
  }

  // 5b. Criar tenant demo (via API pública de onboarding)
  log('Criando tenant demo...')
  try {
    const tenantRes = await fetch(`${BASE}/api/v1/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo Corp',
        slug: 'demo-corp',
        clerkUserId: 'user_demo_setup',
        ownerEmail: 'admin@demo.com',
        ownerName: 'Admin Demo',
      }),
    })

    if (tenantRes.ok) {
      const { tenant } = await tenantRes.json()
      ok(`Tenant criado: "${tenant.name}" (id: ${tenant.id})`)

      // 5c. Ativar SimulaCusto para o tenant
      log('Ativando SimulaCusto para Demo Corp...')
      try {
        const activateRes = await fetch(
          `${BASE}/api/admin/tenants/${tenant.id}/products/simula-custo/activate`,
          {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({}),
          }
        )
        if (activateRes.ok) {
          ok('SimulaCusto ativado para Demo Corp')
        } else {
          warn(`Ativação retornou ${activateRes.status} — talvez precise de auth admin`)
        }
      } catch {
        warn('Erro ao ativar SimulaCusto — execute manualmente')
      }

      // 5d. Ativar BID Frete também
      try {
        await fetch(
          `${BASE}/api/admin/tenants/${tenant.id}/products/bid-frete/activate`,
          { method: 'POST', headers: HEADERS, body: JSON.stringify({}) }
        )
        ok('BID Frete ativado para Demo Corp')
      } catch {
        // Opcional
      }
    } else if (tenantRes.status === 409) {
      warn('Tenant "demo-corp" já existe (slug duplicado)')
    } else {
      const body = await tenantRes.text()
      warn(`Criação do tenant retornou ${tenantRes.status}: ${body}`)
    }
  } catch (err) {
    warn(`Erro ao criar tenant: ${err}`)
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
${C.bold}${C.green}╔══════════════════════════════════════════════╗
║   Gravity — Setup de Desenvolvimento Local   ║
╚══════════════════════════════════════════════╝${C.reset}
`)

  createEnvFiles()
  createDatabases()
  runMigrations()
  generatePrismaClients()
  await seedData()

  header('Setup Concluído')
  console.log(`
${C.bold}Próximos passos:${C.reset}

  ${C.cyan}1.${C.reset} Configure as chaves do Clerk em:
     ${C.yellow}servicos-global/configurador/.env${C.reset}
     ${C.yellow}servicos-global/configurador/../.env${C.reset} (VITE_CLERK_PUBLISHABLE_KEY)

  ${C.cyan}2.${C.reset} Inicie os servidores:
     ${C.green}# Terminal 1 — Configurador backend${C.reset}
     cd servicos-global/configurador && npm run dev

     ${C.green}# Terminal 2 — SimulaCusto backend${C.reset}
     cd produto/simula-custo && npm run dev:server

     ${C.green}# Terminal 3 — Frontend (Vite)${C.reset}
     cd servicos-global/configurador && npm run dev:client

  ${C.cyan}3.${C.reset} Acesse: ${C.green}http://localhost:5000${C.reset}

  ${C.cyan}4.${C.reset} Fluxo completo:
     Login (Clerk) → Admin → Produtos (SimulaCusto aparece)
     → Sidebar → SimulaCusto → Nova Estimativa → Simular Custo
`)
}

main().catch((err) => {
  fail(`Erro fatal: ${err.message}`)
  process.exit(1)
})

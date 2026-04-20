// Script CLI de infraestrutura — PrismaClient direto permitido (ver skill deploy §Bootstrap)
/**
 * bootstrap-seed.ts
 *
 * Seed inicial do banco do Configurador para ambiente vazio (Railway / local dev).
 *
 * Cria:
 *   1. Organizacao interna da Gravity (slug: "gravity", status: ACTIVE)
 *   2. Usuário SUPER_ADMIN vinculado à org Gravity
 *
 * Segurança:
 *   - clerk_user_id = "bootstrap_<timestamp>" — placeholder único
 *   - No primeiro login, o requireAuth auto-vincula pelo email (fallback de 1 candidato)
 *   - Idempotente: verifica existência antes de criar
 *
 * Uso (a partir de servicos-global/configurador):
 *   npx tsx server/scripts/bootstrap-seed.ts
 *   npx tsx server/scripts/bootstrap-seed.ts --email=outro@email.com --name="Outro Nome"
 *
 * Em seguida, rode o seed de produtos:
 *   npx tsx server/scripts/seedProducts.ts
 */

import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

const DEFAULT_EMAIL = 'dmmltda@gmail.com'
const DEFAULT_NAME  = 'Daniel'
const ORG_SLUG      = 'gravity'
const ORG_NAME      = 'Gravity'

function getArg(flag: string): string | undefined {
  const match = process.argv.find(a => a.startsWith(`--${flag}=`))
  return match?.slice(flag.length + 3)
}

async function main() {
  const email = getArg('email') ?? DEFAULT_EMAIL
  const name  = getArg('name')  ?? DEFAULT_NAME

  console.log('\n══════════════════════════════════════════════')
  console.log('   BOOTSTRAP SEED — Configurador              ')
  console.log('══════════════════════════════════════════════\n')
  console.log(`  DB: ${process.env.CONFIGURADOR_DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}\n`)

  // ── 1. Organizacao ───────────────────────────────────────────────────────────
  let org = await prisma.organizacao.findFirst({ where: { slug: ORG_SLUG } })

  if (org) {
    console.log(`  ✔ Organizacao já existe: ${org.name} (${org.id})`)
  } else {
    org = await prisma.organizacao.create({
      data: {
        name:   ORG_NAME,
        slug:   ORG_SLUG,
        status: 'ACTIVE',
      },
    })
    console.log(`  ✔ Organizacao criada: ${org.name} → ${org.id}`)
  }

  // ── 2. Usuario SUPER_ADMIN ───────────────────────────────────────────────────
  const existing = await prisma.usuario.findFirst({ where: { email } })

  if (existing) {
    console.log(`  ✔ Usuário já existe: ${existing.email} | ${existing.role} | tenant: ${existing.tenant_id}`)
    console.log('\n  Nada criado. O banco já tem dados de bootstrap.\n')
    return
  }

  const user = await prisma.usuario.create({
    data: {
      email,
      name,
      role:          'SUPER_ADMIN',
      tenant_id:     org.id,
      clerk_user_id: `bootstrap_${Date.now()}`,
    },
  })

  console.log(`  ✔ Usuário criado:`)
  console.log(`      id:        ${user.id}`)
  console.log(`      email:     ${user.email}`)
  console.log(`      role:      ${user.role}`)
  console.log(`      tenant_id: ${user.tenant_id}`)

  console.log(`
  ──────────────────────────────────────────────
  PRÓXIMOS PASSOS:

  1. Rode o seed de produtos (catálogo no hub):
       npx tsx server/scripts/seedProducts.ts

  2. Faça login normalmente no app.
     O requireAuth vai auto-vincular o Clerk user ID pelo email
     (dmmltda@gmail.com → 1 candidato → link automático).

  3. Para confirmar o vínculo após login:
       npx tsx server/scripts/list-users.ts
  ──────────────────────────────────────────────
`)
}

main()
  .catch((err: Error) => {
    console.error(`\n  ✖ ERRO: ${err.message}`)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

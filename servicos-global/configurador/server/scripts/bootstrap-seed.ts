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
  let org = await prisma.organizacao.findFirst({ where: { subdominio_organizacao: ORG_SLUG } })

  if (org) {
    console.log(`  ✔ Organizacao já existe: ${org.nome_organizacao} (${org.id_organizacao})`)
  } else {
    org = await prisma.organizacao.create({
      data: {
        nome_organizacao:       ORG_NAME,
        subdominio_organizacao: ORG_SLUG,
        status_organizacao:     'ATIVO',
      },
    })
    console.log(`  ✔ Organizacao criada: ${org.nome_organizacao} → ${org.id_organizacao}`)
  }

  // ── 2. Usuario SUPER_ADMIN ───────────────────────────────────────────────────
  const existing = await prisma.usuario.findFirst({ where: { email_usuario: email } })

  if (existing) {
    console.log(`  ✔ Usuário já existe: ${existing.email_usuario} | ${existing.tipo_usuario} | tenant: ${existing.tenant_id}`)
    console.log('\n  Nada criado. O banco já tem dados de bootstrap.\n')
    return
  }

  const user = await prisma.usuario.create({
    data: {
      email_usuario: email,
      nome_usuario:  name,
      tipo_usuario:  'SUPER_ADMIN',
      tenant_id:     org.id_organizacao,
      clerk_user_id: `bootstrap_${Date.now()}`,
    },
  })

  console.log(`  ✔ Usuário criado:`)
  console.log(`      id:        ${user.id}`)
  console.log(`      email:     ${user.email_usuario}`)
  console.log(`      role:      ${user.tipo_usuario}`)
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

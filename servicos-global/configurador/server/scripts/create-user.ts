/**
 * create-user.ts
 * Cria um usuário no banco vinculado a um tenant existente.
 * Uso: npx tsx server/scripts/create-user.ts <email> <id_organizacao> [SUPER_ADMIN|ADMIN|MASTER|PADRAO|FORNECEDOR]
 */
import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const email          = process.argv[2]
  const id_organizacao = process.argv[3]
  const role           = (process.argv[4] ?? 'SUPER_ADMIN') as 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'

  if (!email || !id_organizacao) {
    console.error('Uso: npx tsx server/scripts/create-user.ts <email> <id_organizacao> [role]')
    process.exit(1)
  }

  const existing = await prisma.usuario.findFirst({ where: { email_usuario: email } })
  if (existing) {
    console.log(`Usuário já existe: ${existing.email_usuario} | role: ${existing.tipo_usuario} | tenant: ${existing.id_organizacao}`)
    process.exit(0)
  }

  const tenant = await prisma.organizacao.findUnique({ where: { id_organizacao } })
  if (!tenant) {
    console.error(`Organizacao ${id_organizacao} não encontrado.`)
    process.exit(1)
  }

  const user = await prisma.usuario.create({
    data: {
      email_usuario: email,
      nome_usuario:  email.split('@')[0],
      tipo_usuario:  role,
      id_organizacao: id_organizacao,
      id_clerk_usuario: `pending_${Date.now()}`,  // será auto-vinculado no primeiro login
    },
  })

  console.log(`\n✓ Usuário criado:`)
  console.log(`  ID:       ${user.id_usuario}`)
  console.log(`  Email:    ${user.email_usuario}`)
  console.log(`  Role:     ${user.tipo_usuario}`)
  console.log(`  Organizacao:   ${user.id_organizacao}`)
  console.log(`\nQuando fizer login, o requireAuth vai auto-vincular o clerk_user_id pelo email.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())

/**
 * create-user.ts
 * Cria um usuário no banco vinculado a um tenant existente.
 * Uso: npx tsx server/scripts/create-user.ts <email> <tenant_id> [SUPER_ADMIN|ADMIN|MASTER|STANDARD]
 */
import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const email    = process.argv[2]
  const tenantId = process.argv[3]
  const role     = (process.argv[4] ?? 'SUPER_ADMIN') as 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'STANDARD'

  if (!email || !tenantId) {
    console.error('Uso: npx tsx server/scripts/create-user.ts <email> <tenant_id> [role]')
    process.exit(1)
  }

  const existing = await prisma.usuario.findFirst({ where: { email } })
  if (existing) {
    console.log(`Usuário já existe: ${existing.email} | role: ${existing.role} | tenant: ${existing.tenant_id}`)
    process.exit(0)
  }

  const tenant = await prisma.organizacao.findUnique({ where: { id: tenantId } })
  if (!tenant) {
    console.error(`Organizacao ${tenantId} não encontrado.`)
    process.exit(1)
  }

  const user = await prisma.usuario.create({
    data: {
      email,
      name: email.split('@')[0],
      role,
      tenant_id: tenantId,
      clerk_user_id: `pending_${Date.now()}`,  // será auto-vinculado no primeiro login
    },
  })

  console.log(`\n✓ Usuário criado:`)
  console.log(`  ID:       ${user.id}`)
  console.log(`  Email:    ${user.email}`)
  console.log(`  Role:     ${user.role}`)
  console.log(`  Organizacao:   ${user.tenant_id}`)
  console.log(`\nQuando fizer login, o requireAuth vai auto-vincular o clerk_user_id pelo email.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())

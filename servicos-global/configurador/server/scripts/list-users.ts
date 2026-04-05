import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, tenant_id: true, clerk_user_id: true },
  })
  console.log(`Total usuários: ${users.length}`)
  users.forEach(u => {
    console.log(`  email: ${u.email}`)
    console.log(`  role:  ${u.role}`)
    console.log(`  tenant_id: ${u.tenant_id}`)
    console.log(`  clerk_user_id: ${u.clerk_user_id ?? '(vazio)'}`)
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())

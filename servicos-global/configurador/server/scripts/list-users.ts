import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const users = await prisma.usuario.findMany({
    select: { id: true, email_usuario: true, tipo_usuario: true, id_organizacao_usuario: true, clerk_user_id: true },
  })
  console.log(`Total usuários: ${users.length}`)
  users.forEach(u => {
    console.log(`  email: ${u.email_usuario}`)
    console.log(`  role:  ${u.tipo_usuario}`)
    console.log(`  tenant_id: ${u.id_organizacao_usuario}`)
    console.log(`  clerk_user_id: ${u.clerk_user_id ?? '(vazio)'}`)
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())

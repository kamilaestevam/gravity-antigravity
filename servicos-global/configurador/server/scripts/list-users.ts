import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const users = await prisma.usuario.findMany({
    select: { id_usuario: true, email_usuario: true, tipo_usuario: true, id_organizacao: true, id_clerk_usuario: true },
  })
  console.log(`Total usuários: ${users.length}`)
  users.forEach(u => {
    console.log(`  email: ${u.email_usuario}`)
    console.log(`  role:  ${u.tipo_usuario}`)
    console.log(`  tenant_id: ${u.id_organizacao}`)
    console.log(`  id_clerk_usuario: ${u.id_clerk_usuario ?? '(vazio)'}`)
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())

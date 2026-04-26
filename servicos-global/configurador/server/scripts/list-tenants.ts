import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const tenants = await prisma.organizacao.findMany({
    select: { id: true, nome_organizacao: true, subdominio_organizacao: true, status_organizacao: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })

  if (tenants.length === 0) {
    console.log('Nenhum tenant no banco.')
    return
  }

  console.log(`${tenants.length} tenant(s) encontrado(s):\n`)
  for (const t of tenants) {
    console.log(`  slug: ${t.subdominio_organizacao}`)
    console.log(`  name: ${t.nome_organizacao}`)
    console.log(`  id:   ${t.id}`)
    console.log(`  status: ${t.status_organizacao}`)
    console.log(`  criado: ${t.created_at.toISOString()}`)
    console.log('')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

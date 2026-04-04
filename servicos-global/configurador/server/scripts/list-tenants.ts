import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, slug: true, status: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })

  if (tenants.length === 0) {
    console.log('Nenhum tenant no banco.')
    return
  }

  console.log(`${tenants.length} tenant(s) encontrado(s):\n`)
  for (const t of tenants) {
    console.log(`  slug: ${t.slug}`)
    console.log(`  name: ${t.name}`)
    console.log(`  id:   ${t.id}`)
    console.log(`  status: ${t.status}`)
    console.log(`  criado: ${t.created_at.toISOString()}`)
    console.log('')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

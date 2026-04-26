import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const tenants = await prisma.organizacao.findMany({
    select: { id_organizacao: true, nome_organizacao: true, subdominio_organizacao: true, status_organizacao: true, data_criacao_organizacao: true },
    orderBy: { data_criacao_organizacao: 'asc' },
  })

  if (tenants.length === 0) {
    console.log('Nenhum tenant no banco.')
    return
  }

  console.log(`${tenants.length} tenant(s) encontrado(s):\n`)
  for (const t of tenants) {
    console.log(`  slug: ${t.subdominio_organizacao}`)
    console.log(`  name: ${t.nome_organizacao}`)
    console.log(`  id:   ${t.id_organizacao}`)
    console.log(`  status: ${t.status_organizacao}`)
    console.log(`  criado: ${t.data_criacao_organizacao.toISOString()}`)
    console.log('')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

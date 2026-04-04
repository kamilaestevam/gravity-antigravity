import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

const EMAILS_TO_DELETE = [
  'daniel@dmm-ie.com.br',
  'daniel@dmmtrading.com.br',
]

async function main() {
  console.log('🧹 Deletando usuários...\n')

  for (const email of EMAILS_TO_DELETE) {
    const user = await prisma.user.findFirst({ where: { email } })

    if (!user) {
      console.log(`⚠  ${email} — não encontrado, pulando`)
      continue
    }

    await prisma.user.delete({ where: { id: user.id } })
    console.log(`✓  ${email} deletado (${user.id})`)
  }

  console.log('\n✅ Concluído.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

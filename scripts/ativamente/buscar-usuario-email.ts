import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/configurador/.env') })

const fragment = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1]?.trim() ?? 'testefornecedor77'

async function main() {
  const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
  const users = await prisma.usuario.findMany({
    where: { email_usuario: { contains: fragment, mode: 'insensitive' } },
    select: {
      id_usuario: true,
      email_usuario: true,
      id_organizacao: true,
      id_clerk_usuario: true,
      tipo_usuario: true,
      status_usuario: true,
    },
  })
  console.log(JSON.stringify(users, null, 2))
}

main()
  .finally(async () => {
    const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
    await prisma.$disconnect()
  })

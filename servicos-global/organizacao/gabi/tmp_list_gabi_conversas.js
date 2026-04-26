
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const conversas = await prisma.gabiConversation.findMany({
      orderBy: { created_at: 'asc' }
    })
    console.log('--- LISTA DE CONVERSAS (GABI) ---')
    conversas.forEach((c, index) => {
      console.log(`${index + 1}. ID: ${c.id} | Título: ${c.title} | Criado em: ${c.created_at}`)
    })
    if (conversas.length === 0) {
      console.log('Nenhuma conversa encontrada no banco Gabi.')
    }
  } catch (err) {
    console.error('Erro ao listar conversas:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()

// server/lib/prisma.ts
// Tenta conectar ao Prisma. Se nao tiver banco, exporta um mock seguro
// para que o servidor inicie e o chat funcione sem persistencia.

let prisma: any

try {
  const { PrismaClient } = await import('@prisma/client')
  prisma = new PrismaClient()
  // Testa a conexao
  await prisma.$connect()
  console.log('[PRISMA] Conectado ao banco de dados')
} catch {
  console.warn('[PRISMA] ⚠️ Banco de dados indisponivel — modo sem persistencia ativado')
  // Mock minimo para o chat funcionar sem banco
  const emptyResult = { findMany: async () => [], count: async () => 0, create: async (args: any) => ({ id: 'mock', ...args.data }) }
  prisma = {
    gabiConversation: emptyResult,
    gabiMessage: emptyResult,
    gabiUsageLog: emptyResult,
    $connect: async () => {},
    $disconnect: async () => {},
  }
}

export default prisma

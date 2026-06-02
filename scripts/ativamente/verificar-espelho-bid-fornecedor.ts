/**
 * Verifica espelho BID: id_usuario no fornecedor_bid_frete_internacional.
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/produto/bid-frete-internacional/server/.env') })

const email = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1]?.trim()

async function main() {
  const { PrismaClient } = await import(
    '../../servicos-global/produto/bid-frete-internacional/server/src/generated/client/index.js'
  )
  const prisma = new PrismaClient()

  const { prisma: cfgPrisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')

  const where = email ? { email_usuario: email } : { tipo_usuario: 'FORNECEDOR' as const }
  const usuarios = await cfgPrisma.usuario.findMany({
    where,
    select: {
      id_usuario: true,
      email_usuario: true,
      id_organizacao: true,
      status_usuario: true,
    },
    take: 10,
    orderBy: { data_criacao_usuario: 'desc' },
  })

  for (const u of usuarios) {
    const fornecedores = await prisma.fornecedorBidFreteInternacional.findMany({
      where: {
        id_organizacao: u.id_organizacao,
        OR: [{ id_usuario: u.id_usuario }, { id_clerk_usuario: u.id_usuario }],
      },
      select: {
        id_fornecedor_bid_frete_internacional: true,
        id_usuario: true,
        id_clerk_usuario: true,
        nome_fornecedor_bid_frete_internacional: true,
      },
    })
    const semVinculo = await prisma.fornecedorBidFreteInternacional.findMany({
      where: { id_organizacao: u.id_organizacao, id_usuario: null },
      select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true },
      take: 3,
    })
    console.log('\n---', u.email_usuario, '---')
    console.log('usuario:', u)
    console.log('fornecedores vinculados:', fornecedores)
    if (fornecedores.length === 0) console.log('fornecedores SEM id_usuario na org:', semVinculo)
  }

  await prisma.$disconnect()
  await cfgPrisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

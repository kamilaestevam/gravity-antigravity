/**
 * Repara espelho BID para usuário FORNECEDOR (id_usuario no fornecedor_bid_frete_internacional).
 *
 * Uso:
 *   npx tsx scripts/ativamente/reparar-sync-bid-fornecedor-usuario.ts
 *   npx tsx scripts/ativamente/reparar-sync-bid-fornecedor-usuario.ts --email=dmmltda+fornecedor@gmail.com
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/configurador/.env') })

const emailArg = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1]?.trim()

async function main() {
  const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
  const {
    exigirVinculosCadastrosFornecedorAtivos,
    sincronizarUsuarioBidFreteFornecedor,
  } = await import('../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js')

  const usuarios = emailArg
    ? await prisma.usuario.findMany({
        where: { email_usuario: emailArg, tipo_usuario: 'FORNECEDOR' },
        select: {
          id_usuario: true,
          email_usuario: true,
          id_organizacao: true,
          id_clerk_usuario: true,
          status_usuario: true,
        },
      })
    : await prisma.usuario.findMany({
        where: {
          tipo_usuario: 'FORNECEDOR',
          status_usuario: { in: ['ATIVO', 'CONVIDADO'] },
        },
        select: {
          id_usuario: true,
          email_usuario: true,
          id_organizacao: true,
          id_clerk_usuario: true,
          status_usuario: true,
        },
        orderBy: { data_criacao_usuario: 'desc' },
        take: 20,
      })

  if (usuarios.length === 0) {
    console.log('Nenhum usuário FORNECEDOR encontrado.')
    return
  }

  for (const u of usuarios) {
    console.log(`\n--- ${u.email_usuario} (${u.status_usuario}) ---`)
    try {
      const vinculos = await exigirVinculosCadastrosFornecedorAtivos({
        id_usuario: u.id_usuario,
        id_organizacao: u.id_organizacao,
        correlation_id: crypto.randomUUID(),
      })
      for (const v of vinculos) {
        await sincronizarUsuarioBidFreteFornecedor({
          id_organizacao_cliente: v.id_organizacao,
          id_fornecedor: v.id_fornecedor,
          id_usuario: u.id_usuario,
          id_clerk_usuario: u.id_clerk_usuario,
          obrigatorio: true,
        })
        console.log(`OK BID sync: fornecedor=${v.id_fornecedor} org=${v.id_organizacao}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const code = (err as { code?: string }).code
      console.error(`FALHA: ${code ?? ''} ${msg}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
    await prisma.$disconnect()
  })

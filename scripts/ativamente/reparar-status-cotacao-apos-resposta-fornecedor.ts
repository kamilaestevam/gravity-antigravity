/**
 * Repara status da cotação (visão cliente) para cotações com disparo RESPONDIDO
 * mas status ainda ENVIADA_FORNECEDORES / EM_COTACAO desatualizado.
 *
 * Uso:
 *   npx tsx scripts/ativamente/reparar-status-cotacao-apos-resposta-fornecedor.ts
 *   npx tsx scripts/ativamente/reparar-status-cotacao-apos-resposta-fornecedor.ts --numero=BID-20260601-9417
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/produto/bid-frete-internacional/server/.env') })

const numeroArg = process.argv.find((a) => a.startsWith('--numero='))?.split('=')[1]?.trim()

async function main() {
  const { PrismaClient } = await import(
    '../../servicos-global/produto/bid-frete-internacional/server/src/generated/client/index.js'
  )
  const { sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional } = await import(
    '../../servicos-global/produto/bid-frete-internacional/server/src/lib/sincronizar-status-cotacao-apos-resposta-fornecedor-bid-frete-internacional.js'
  )

  const prisma = new PrismaClient()

  try {
    const cotacoes = await (prisma as any).cotacaoBidFreteInternacional.findMany({
      where: {
        ...(numeroArg
          ? { numero_cotacao_bid_frete_internacional: numeroArg }
          : {
              status_cotacao_bid_frete_internacional: {
                in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'],
              },
              disparos_cotacao: {
                some: { status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO' },
              },
            }),
      },
      select: {
        id_cotacao_bid_frete_internacional: true,
        numero_cotacao_bid_frete_internacional: true,
        status_cotacao_bid_frete_internacional: true,
      },
    })

    if (cotacoes.length === 0) {
      console.log('Nenhuma cotação pendente de reparo.')
      return
    }

    for (const cotacao of cotacoes) {
      const antes = cotacao.status_cotacao_bid_frete_internacional
      const depois = await sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional(
        prisma,
        cotacao.id_cotacao_bid_frete_internacional,
        antes,
      )
      console.log(
        `${cotacao.numero_cotacao_bid_frete_internacional}: ${antes} → ${depois ?? '(sem alteração)'}`,
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

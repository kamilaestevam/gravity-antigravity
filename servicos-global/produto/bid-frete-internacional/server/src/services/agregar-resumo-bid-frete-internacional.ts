export {
  gerarNumeroBidFreteInternacional,
  gerarNumeroCotacaoFreteInternacional,
} from '../../../shared/numeracao-bid-frete-internacional.js'

export { agregarResumoBidFreteInternacional } from '../../../client/src/shared/agregar-resumo-bid-frete-internacional.js'

import { agregarResumoBidFreteInternacional } from '../../../client/src/shared/agregar-resumo-bid-frete-internacional.js'
import { resolverStatusBidPersistidoDeCotacoesBidFreteInternacional } from '../../../shared/status-agregado-bid-frete-internacional.js'

export async function sincronizarResumoBid(prisma: {
  cotacaoBidFreteInternacional: { findMany: (args: unknown) => Promise<Array<Record<string, string>>> }
  bidFreteInternacional: { update: (args: unknown) => Promise<unknown> }
}, idBid: string): Promise<void> {
  const cotacoes = await prisma.cotacaoBidFreteInternacional.findMany({
    where: { id_bid_bid_frete_internacional: idBid },
    select: {
      modal_cotacao_bid_frete_internacional: true,
      origem_nome_cotacao_bid_frete_internacional: true,
      origem_codigo_cotacao_bid_frete_internacional: true,
      origem_pais_cotacao_bid_frete_internacional: true,
      destino_nome_cotacao_bid_frete_internacional: true,
      destino_codigo_cotacao_bid_frete_internacional: true,
      destino_pais_cotacao_bid_frete_internacional: true,
      tipo_operacao_cotacao_bid_frete_internacional: true,
      modalidade_cotacao_bid_frete_internacional: true,
      status_cotacao_bid_frete_internacional: true,
    },
  })
  if (cotacoes.length === 0) return

  const resumo = agregarResumoBidFreteInternacional(cotacoes as Parameters<typeof agregarResumoBidFreteInternacional>[0])
  await prisma.bidFreteInternacional.update({
    where: { id_bid_bid_frete_internacional: idBid },
    data: {
      modais_bid_bid_frete_internacional: resumo.modais_bid_bid_frete_internacional,
      origens_bid_bid_frete_internacional: resumo.origens_bid_bid_frete_internacional,
      destinos_bid_bid_frete_internacional: resumo.destinos_bid_bid_frete_internacional,
      tipo_operacao_bid_bid_frete_internacional: resumo.tipo_operacao_bid_bid_frete_internacional,
      modalidade_bid_bid_frete_internacional: resumo.modalidade_bid_frete_internacional,
      status_bid_bid_frete_internacional: resolverStatusBidPersistidoDeCotacoesBidFreteInternacional(cotacoes),
    },
  })
}

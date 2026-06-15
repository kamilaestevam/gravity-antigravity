export {
  gerarNumeroBidFreteInternacional,
  gerarNumeroCotacaoFreteInternacional,
} from '../../../shared/numeracao-bid-frete-internacional.js'

export { agregarResumoBidFreteInternacional } from '../../../client/src/shared/agregar-resumo-bid-frete-internacional.js'

import { agregarResumoBidFreteInternacional } from '../../../client/src/shared/agregar-resumo-bid-frete-internacional.js'

export async function sincronizarResumoBid(prisma: {
  cotacaoBidFreteInternacional: { findMany: (args: unknown) => Promise<Array<Record<string, string>>> }
  bidFreteInternacional: { update: (args: unknown) => Promise<unknown> }
}, idBid: string): Promise<void> {
  const cotacoes = await prisma.cotacaoBidFreteInternacional.findMany({
    where: { id_bid_bid_frete_internacional: idBid },
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
      modalidade_bid_bid_frete_internacional: resumo.modalidade_bid_bid_frete_internacional,
    },
  })
}

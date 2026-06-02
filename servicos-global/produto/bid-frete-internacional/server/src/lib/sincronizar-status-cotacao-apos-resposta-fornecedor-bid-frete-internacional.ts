/**
 * Atualiza status da cotação (visão cliente) após resposta de fornecedor.
 * - Pelo menos 1 disparo RESPONDIDO → AGUARDANDO_APROVACAO (cliente pode comparar/aprovar)
 * Disparos EXPIRADO/ERRO_ENVIO não impedem a transição.
 */

import type { PrismaClient } from '@prisma/client'

const STATUS_COTACAO_SINCRONIZAVEL = new Set([
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
])

export type StatusCotacaoPosRespostaFornecedor =
  | 'AGUARDANDO_APROVACAO'
  | null

export function resolverStatusCotacaoPosRespostaFornecedor(args: {
  status_cotacao_bid_frete_internacional: string | null | undefined
  total_disparos_respondidos: number
}): StatusCotacaoPosRespostaFornecedor {
  const statusAtual = args.status_cotacao_bid_frete_internacional ?? null
  if (statusAtual != null && !STATUS_COTACAO_SINCRONIZAVEL.has(statusAtual)) {
    return null
  }

  if (args.total_disparos_respondidos <= 0) {
    return null
  }

  return 'AGUARDANDO_APROVACAO'
}

export async function sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional(
  prisma: PrismaClient,
  id_cotacao_bid_frete_internacional: string,
  status_cotacao_atual?: string | null,
): Promise<StatusCotacaoPosRespostaFornecedor> {
  const totalRespondidos = await (prisma as any).disparoCotacaoBidFreteInternacional.count({
    where: {
      id_cotacao_bid_frete_internacional,
      status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
    },
  })

  let statusAtual = status_cotacao_atual ?? null
  if (statusAtual == null) {
    const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({
      where: { id_cotacao_bid_frete_internacional },
      select: { status_cotacao_bid_frete_internacional: true },
    })
    statusAtual = cotacao?.status_cotacao_bid_frete_internacional ?? null
  }

  const proximoStatus = resolverStatusCotacaoPosRespostaFornecedor({
    status_cotacao_bid_frete_internacional: statusAtual,
    total_disparos_respondidos: totalRespondidos,
  })

  if (proximoStatus == null) {
    return null
  }

  await (prisma as any).cotacaoBidFreteInternacional.update({
    where: { id_cotacao_bid_frete_internacional },
    data: { status_cotacao_bid_frete_internacional: proximoStatus },
  })

  return proximoStatus
}

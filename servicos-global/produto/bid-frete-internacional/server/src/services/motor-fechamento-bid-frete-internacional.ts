/**
 * motor-fechamento-bid-frete-internacional.ts — Confirma fechamento na plataforma
 */

import type { PrismaClient } from '../generated/client/index.js'
import { AppError } from '../lib/erros.js'
import { lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional } from '../lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js'
import { monetizacao } from './monetizacao.js'

export const motorFechamentoBidFreteInternacional = {
  async fechar(
    prisma: PrismaClient,
    id_cotacao_bid_frete_internacional: string,
    id_usuario: string,
  ) {
    const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({
      where: { id_cotacao_bid_frete_internacional },
      include: {
        propostas: {
          where: { status_proposta_bid_frete_internacional: 'APROVACAO_RECEBIDA' },
          include: {
            fornecedor: {
              select: {
                id_fornecedor_bid_frete_internacional: true,
                nome_fornecedor_bid_frete_internacional: true,
                email_fornecedor_bid_frete_internacional: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!cotacao) {
      throw new AppError('Cotação não encontrada', 404, 'COTACAO_NAO_ENCONTRADA')
    }

    if (cotacao.status_cotacao_bid_frete_internacional === 'FECHADA') {
      throw new AppError('Cotação já fechada na plataforma', 409, 'COTACAO_JA_FECHADA')
    }

    if (cotacao.status_cotacao_bid_frete_internacional !== 'APROVADA') {
      throw new AppError('Cotação não está aprovada', 409, 'COTACAO_NAO_APROVADA')
    }

    const propostaGanhadora = cotacao.propostas?.[0]
    if (!propostaGanhadora) {
      throw new AppError(
        'Aguardando aceite do fornecedor ganhador antes do fechamento',
        409,
        'ACEITE_PENDENTE',
      )
    }

    const agora = new Date()
    const empresaPagadora = lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
      id_cotacao_bid_frete_internacional,
    )

    const cobranca = await monetizacao.registrarCobrancaFechamento(prisma, {
      id_fornecedor_bid_frete_internacional: String(
        propostaGanhadora.id_fornecedor_bid_frete_internacional,
      ),
      email_fornecedor_bid_frete_internacional:
        propostaGanhadora.fornecedor?.email_fornecedor_bid_frete_internacional ?? '',
      id_cotacao_bid_frete_internacional,
      cotacao_numero: String(cotacao.numero_cotacao_bid_frete_internacional ?? id_cotacao_bid_frete_internacional),
      valor_frete_aprovado: Number(propostaGanhadora.valor_total_proposta_bid_frete_internacional ?? 0),
      id_organizacao: String(cotacao.id_organizacao),
      id_usuario,
      empresa_pagadora_taxa_fechamento_plataforma_gravity: empresaPagadora,
    })

    await (prisma as any).cotacaoBidFreteInternacional.update({
      where: { id_cotacao_bid_frete_internacional },
      data: {
        status_cotacao_bid_frete_internacional: 'FECHADA',
        data_fechamento_cotacao_bid_frete_internacional: agora,
        id_usuario_fechamento_cotacao_bid_frete_internacional: id_usuario,
      },
    })

    return {
      fechada: true as const,
      data_fechamento_cotacao_bid_frete_internacional: agora.toISOString(),
      cobranca,
      fornecedor_nome:
        propostaGanhadora.fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor',
    }
  },
}

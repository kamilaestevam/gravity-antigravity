/**
 * persistir-taxas-proposta.ts — Grava taxas detalhadas em origem/destino (split DDD)
 */
import type { PrismaClient } from '../generated/client/index.js'
import { randomUUID } from 'crypto'

export type TaxaInputProposta = {
  tipo_taxa_bid_frete_internacional: 'origem' | 'destino' | 'frete'
  nome_taxa_bid_frete_internacional: string
  valor_taxa_bid_frete_internacional: number
  moeda_taxa_bid_frete_internacional?: string
}

export async function persistirTaxasProposta(
  prisma: PrismaClient,
  params: {
    id_organizacao: string
    id_proposta_bid_frete_internacional: string
    taxas: TaxaInputProposta[]
  },
): Promise<void> {
  const { id_organizacao, id_proposta_bid_frete_internacional, taxas } = params
  if (!taxas.length) return

  const origem = taxas.filter(t => t.tipo_taxa_bid_frete_internacional === 'origem' || t.tipo_taxa_bid_frete_internacional === 'frete')
  const destino = taxas.filter(t => t.tipo_taxa_bid_frete_internacional === 'destino')

  if (origem.length) {
    await (prisma as PrismaClient).taxaOrigemBidFreteInternacional.createMany({
      data: origem.map(t => ({
        id_taxa_origem_bid_frete_internacional: randomUUID(),
        id_organizacao,
        id_proposta_bid_frete_internacional,
        nome_taxa_origem_bid_frete_internacional: t.nome_taxa_bid_frete_internacional,
        valor_taxa_origem_bid_frete_internacional: t.valor_taxa_bid_frete_internacional,
        moeda_taxa_origem_bid_frete_internacional: t.moeda_taxa_bid_frete_internacional ?? 'USD',
      })),
    })
  }

  if (destino.length) {
    await (prisma as PrismaClient).taxaDestinoBidFreteInternacional.createMany({
      data: destino.map(t => ({
        id_taxa_destino_bid_frete_internacional: randomUUID(),
        id_organizacao,
        id_proposta_bid_frete_internacional,
        nome_taxa_destino_bid_frete_internacional: t.nome_taxa_bid_frete_internacional,
        valor_taxa_destino_bid_frete_internacional: t.valor_taxa_bid_frete_internacional,
        moeda_taxa_destino_bid_frete_internacional: t.moeda_taxa_bid_frete_internacional ?? 'USD',
      })),
    })
  }
}

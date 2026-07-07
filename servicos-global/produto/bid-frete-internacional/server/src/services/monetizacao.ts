/**
 * monetizacao.ts — Motor de Monetização do Fornecedor
 * Cobrança por frete fechado na plataforma (success fee USD 10,00).
 */

import type { PrismaClient } from '../generated/client/index.js'
import { TAXA_FECHAMENTO_FRETE_USD } from '../../../shared/condicoes-plataforma-fornecedor-bid-frete-internacional.js'
import type { EmpresaPagadoraTaxaFechamentoPlataformaGravity } from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'

const DEFAULT_CONFIG = {
  taxa_por_frete_usd: TAXA_FECHAMENTO_FRETE_USD,
  free_tier_cotacoes: 10,
  modelo: 'por_frete' as 'por_frete' | 'assinatura' | 'free',
}

export interface CobrancaFornecedor {
  id_taxa_fechamento_plataforma_bid_frete_internacional?: string
  id_fornecedor_bid_frete_internacional: string
  email_fornecedor_bid_frete_internacional: string
  id_cotacao_bid_frete_internacional: string
  cotacao_numero: string
  valor_frete_aprovado: number
  taxa_cobrada: number
  moeda_ganho_bid_frete_internacional: string
  empresa_pagadora_taxa_fechamento_plataforma_gravity: EmpresaPagadoraTaxaFechamentoPlataformaGravity
  status: 'PENDENTE' | 'PAGA' | 'ISENTA'
  motivo_isencao?: string
}

export const monetizacao = {
  async registrarCobrancaFechamento(
    prisma: PrismaClient,
    data: {
      id_fornecedor_bid_frete_internacional: string
      email_fornecedor_bid_frete_internacional: string
      id_cotacao_bid_frete_internacional: string
      cotacao_numero: string
      valor_frete_aprovado: number
      id_organizacao: string
      id_usuario: string
      empresa_pagadora_taxa_fechamento_plataforma_gravity: EmpresaPagadoraTaxaFechamentoPlataformaGravity
    },
  ): Promise<CobrancaFornecedor> {
    const totalFechadas = await (prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_organizacao: data.id_organizacao,
        status_cotacao_bid_frete_internacional: 'FECHADA',
        id_fornecedor_vencedor_cotacao_bid_frete_internacional: data.id_fornecedor_bid_frete_internacional,
      },
    })

    const isenta = totalFechadas < DEFAULT_CONFIG.free_tier_cotacoes
    const taxaCobrada = isenta ? 0 : DEFAULT_CONFIG.taxa_por_frete_usd
    const statusDb = isenta ? 'ISENTA' : 'PENDENTE'

    const registro = await (prisma as any).taxaFechamentoPlataformaBidFreteInternacional.create({
      data: {
        id_produto_gravity: 'bid-frete-internacional',
        id_organizacao: data.id_organizacao,
        id_usuario: data.id_usuario,
        id_cotacao_bid_frete_internacional: data.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: data.id_fornecedor_bid_frete_internacional,
        numero_cotacao_bid_frete_internacional: data.cotacao_numero,
        valor_taxa_fechamento_plataforma_bid_frete_internacional: taxaCobrada,
        moeda_taxa_fechamento_plataforma_bid_frete_internacional: 'USD',
        empresa_pagadora_taxa_fechamento_plataforma_gravity:
          data.empresa_pagadora_taxa_fechamento_plataforma_gravity,
        status_cobranca_taxa_fechamento_plataforma_bid_frete_internacional: statusDb,
        motivo_isencao_taxa_fechamento_plataforma_bid_frete_internacional: isenta
          ? `Free tier: ${totalFechadas + 1}/${DEFAULT_CONFIG.free_tier_cotacoes} fechamentos`
          : null,
      },
    })

    console.log(
      `[Monetização] Taxa fechamento ${statusDb} USD ${taxaCobrada} — cotação ${data.cotacao_numero}`,
    )

    return {
      id_taxa_fechamento_plataforma_bid_frete_internacional:
        registro.id_taxa_fechamento_plataforma_bid_frete_internacional,
      id_fornecedor_bid_frete_internacional: data.id_fornecedor_bid_frete_internacional,
      email_fornecedor_bid_frete_internacional: data.email_fornecedor_bid_frete_internacional,
      id_cotacao_bid_frete_internacional: data.id_cotacao_bid_frete_internacional,
      cotacao_numero: data.cotacao_numero,
      valor_frete_aprovado: data.valor_frete_aprovado,
      taxa_cobrada: taxaCobrada,
      moeda_ganho_bid_frete_internacional: 'USD',
      empresa_pagadora_taxa_fechamento_plataforma_gravity:
        data.empresa_pagadora_taxa_fechamento_plataforma_gravity,
      status: statusDb,
      motivo_isencao: isenta
        ? `Free tier: ${totalFechadas + 1}/${DEFAULT_CONFIG.free_tier_cotacoes} fechamentos`
        : undefined,
    }
  },

  /** @deprecated Use registrarCobrancaFechamento após aceite + fechamento explícito */
  async registrarCobranca(
    prisma: PrismaClient,
    data: {
      id_fornecedor_bid_frete_internacional: string
      email_fornecedor_classificacao_bid_frete_internacional: string
      id_cotacao_bid_frete_internacional: string
      cotacao_numero: string
      valor_frete_aprovado: number
      id_organizacao: string
    },
  ): Promise<CobrancaFornecedor> {
    return this.registrarCobrancaFechamento(prisma, {
      ...data,
      email_fornecedor_bid_frete_internacional: data.email_fornecedor_classificacao_bid_frete_internacional,
      id_usuario: '',
      empresa_pagadora_taxa_fechamento_plataforma_gravity: 'FORNECEDOR',
    })
  },

  async resumoFornecedor(prisma: PrismaClient, fornecedorId: string) {
    const totalFechadas = await (prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_fornecedor_vencedor_cotacao_bid_frete_internacional: fornecedorId,
        status_cotacao_bid_frete_internacional: 'FECHADA',
      },
    })

    const freeTierRestante = Math.max(0, DEFAULT_CONFIG.free_tier_cotacoes - totalFechadas)
    const cobrancoesTotais = Math.max(0, totalFechadas - DEFAULT_CONFIG.free_tier_cotacoes)

    return {
      total_fretes_fechados: totalFechadas,
      free_tier_restante: freeTierRestante,
      free_tier_total: DEFAULT_CONFIG.free_tier_cotacoes,
      cobrancas_totais: cobrancoesTotais,
      taxa_unitaria_usd: DEFAULT_CONFIG.taxa_por_frete_usd,
      total_cobrado_usd: cobrancoesTotais * DEFAULT_CONFIG.taxa_por_frete_usd,
      modelo: DEFAULT_CONFIG.modelo,
    }
  },
}

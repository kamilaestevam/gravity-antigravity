/**
 * monetizacao.ts — Motor de Monetização do Fornecedor
 * Modelo: cobrança por frete fechado (cotação aprovada)
 *
 * Fluxo:
 * 1. Quando cotação é APROVADA, registra cobrança pendente para o fornecedor vencedor
 * 2. Fornecedor tem dashboard com saldo de cobranças
 * 3. Cobrança pode ser via Stripe (futuro) ou faturamento manual
 *
 * Valores configuráveis por tenant/plano:
 * - taxa_por_frete: USD 5.00 (default)
 * - free_tier: primeiras 10 cotações grátis
 * - modelo: 'por_frete' | 'assinatura' | 'free'
 */

import { PrismaClient } from '@prisma/client'

// Configurações default (podem ser overridden por ProductConfig no Configurador)
const DEFAULT_CONFIG = {
  taxa_por_frete_usd: 5.00,
  free_tier_cotacoes: 10,
  modelo: 'por_frete' as 'por_frete' | 'assinatura' | 'free',
}

export interface CobrancaFornecedor {
  fornecedor_id: string
  fornecedor_email: string
  cotacao_id: string
  cotacao_numero: string
  valor_frete_aprovado: number
  taxa_cobrada: number
  moeda: string
  status: 'PENDENTE' | 'PAGA' | 'ISENTA'
  motivo_isencao?: string
}

export const monetizacao = {
  /**
   * Registra cobrança quando cotação é aprovada
   * Chamado pelo comparativoEngine.aprovar()
   */
  async registrarCobranca(
    prisma: PrismaClient,
    data: {
      fornecedor_id: string
      fornecedor_email: string
      cotacao_id: string
      cotacao_numero: string
      valor_frete_aprovado: number
      tenant_id: string
    }
  ): Promise<CobrancaFornecedor> {
    // Verificar quantas cotações o fornecedor já fechou (para free tier)
    const totalFechadas = await (prisma as any).freteIntBidPropostas.count({
      where: {
        fornecedor_id: data.fornecedor_id,
        status: 'APROVADA',
      },
    })

    // Se está no free tier, isentar
    if (totalFechadas <= DEFAULT_CONFIG.free_tier_cotacoes) {
      console.log(`[Monetização] Fornecedor ${data.fornecedor_email} no free tier (${totalFechadas}/${DEFAULT_CONFIG.free_tier_cotacoes})`)
      return {
        fornecedor_id: data.fornecedor_id,
        fornecedor_email: data.fornecedor_email,
        cotacao_id: data.cotacao_id,
        cotacao_numero: data.cotacao_numero,
        valor_frete_aprovado: data.valor_frete_aprovado,
        taxa_cobrada: 0,
        moeda: 'USD',
        status: 'ISENTA',
        motivo_isencao: `Free tier: ${totalFechadas}/${DEFAULT_CONFIG.free_tier_cotacoes} cotações`,
      }
    }

    // Cobrar taxa
    const cobranca: CobrancaFornecedor = {
      fornecedor_id: data.fornecedor_id,
      fornecedor_email: data.fornecedor_email,
      cotacao_id: data.cotacao_id,
      cotacao_numero: data.cotacao_numero,
      valor_frete_aprovado: data.valor_frete_aprovado,
      taxa_cobrada: DEFAULT_CONFIG.taxa_por_frete_usd,
      moeda: 'USD',
      status: 'PENDENTE',
    }

    console.log(`[Monetização] Cobrança de USD ${cobranca.taxa_cobrada} registrada para ${data.fornecedor_email}`)

    // TODO: Integrar com Stripe do Configurador para cobrança automática
    // await stripeService.createCharge({
    //   customer: fornecedor.stripe_customer_id,
    //   amount: DEFAULT_CONFIG.taxa_por_frete_usd * 100,
    //   currency: 'usd',
    //   description: `BID Frete - Taxa por frete fechado (${data.cotacao_numero})`,
    // })

    return cobranca
  },

  /**
   * Retorna resumo de cobranças do fornecedor
   */
  async resumoFornecedor(prisma: PrismaClient, fornecedorId: string) {
    const totalAprovadas = await (prisma as any).freteIntBidPropostas.count({
      where: { fornecedor_id: fornecedorId, status: 'APROVADA' },
    })

    const freeTierRestante = Math.max(0, DEFAULT_CONFIG.free_tier_cotacoes - totalAprovadas)
    const cobrancoesTotais = Math.max(0, totalAprovadas - DEFAULT_CONFIG.free_tier_cotacoes)

    return {
      total_fretes_fechados: totalAprovadas,
      free_tier_restante: freeTierRestante,
      free_tier_total: DEFAULT_CONFIG.free_tier_cotacoes,
      cobrancas_totais: cobrancoesTotais,
      taxa_unitaria_usd: DEFAULT_CONFIG.taxa_por_frete_usd,
      total_cobrado_usd: cobrancoesTotais * DEFAULT_CONFIG.taxa_por_frete_usd,
      modelo: DEFAULT_CONFIG.modelo,
    }
  },
}

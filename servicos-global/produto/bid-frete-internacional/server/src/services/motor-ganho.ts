/**
 * motor-ganho.ts — Motor de Calculo de Ganhos/Savings
 * Calcula e agrega ganhos por tenant, empresa, periodo
 */

import { PrismaClient } from '../generated/client/index.js'

export const motorGanho = {
  /**
   * Retorna metricas de ganhos agregadas
   */
  async calcularMetricas(prisma: PrismaClient, filtros?: {
    id_workspace?: string
    data_inicio?: Date
    data_fim?: Date
  }) {
    const where: Record<string, unknown> = { id_produto_gravity: 'bid-frete-internacional' }

    if (filtros?.id_workspace) where.id_workspace = filtros.id_workspace
    if (filtros?.data_inicio || filtros?.data_fim) {
      const createdAt: Record<string, unknown> = {}
      if (filtros.data_inicio) createdAt.gte = filtros.data_inicio
      if (filtros.data_fim) createdAt.lte = filtros.data_fim
      where.created_at = createdAt
    }

    type SavingRow = {
      ganho_vs_meta_ganho_bid_frete_internacional?: number | null
      ganho_vs_media_ganho_bid_frete_internacional?: number | null
      valor_aprovado_ganho_bid_frete_internacional: number
      ganho_percentual_ganho_bid_frete_internacional?: number | null
    }

    const savings: SavingRow[] = await (prisma as any).bidFreteInternacionalGanho.findMany({ where })

    const totalSavingTarget = savings
      .filter((s: SavingRow) => s.ganho_vs_meta_ganho_bid_frete_internacional != null)
      .reduce((acc: number, s: SavingRow) => acc + (s.ganho_vs_meta_ganho_bid_frete_internacional ?? 0), 0)

    const totalSavingMedia = savings
      .reduce((acc: number, s: SavingRow) => acc + (s.ganho_vs_media_ganho_bid_frete_internacional ?? 0), 0)

    const totalAprovado = savings
      .reduce((acc: number, s: SavingRow) => acc + s.valor_aprovado_ganho_bid_frete_internacional, 0)

    const mediaSavingPct = savings.length > 0
      ? savings.reduce((acc: number, s: SavingRow) => acc + (s.ganho_percentual_ganho_bid_frete_internacional ?? 0), 0) / savings.length
      : 0

    return {
      total_cotacoes_aprovadas_classificacao_bid_frete_internacional: savings.length,
      total_saving_vs_target: totalSavingTarget,
      total_saving_vs_media: totalSavingMedia,
      total_valor_aprovado: totalAprovado,
      media_saving_percentual: mediaSavingPct,
      moeda_ganho_bid_frete_internacional: 'USD',
    }
  },
}

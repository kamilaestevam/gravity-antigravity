/**
 * savingsEngine.ts — Motor de Calculo de Savings
 * Calcula e agrega savings por tenant, empresa, periodo
 */

import { PrismaClient } from '@prisma/client'

export const savingsEngine = {
  /**
   * Retorna metricas de savings agregadas
   */
  async calcularMetricas(prisma: PrismaClient, filtros?: {
    company_id?: string
    data_inicio?: Date
    data_fim?: Date
  }) {
    const where: Record<string, unknown> = { product_id: 'bid-frete' }

    if (filtros?.company_id) where.company_id = filtros.company_id
    if (filtros?.data_inicio || filtros?.data_fim) {
      const createdAt: Record<string, unknown> = {}
      if (filtros.data_inicio) createdAt.gte = filtros.data_inicio
      if (filtros.data_fim) createdAt.lte = filtros.data_fim
      where.created_at = createdAt
    }

    type SavingRow = {
      saving_vs_target?: number | null
      saving_vs_media?: number | null
      valor_aprovado: number
      saving_percentual?: number | null
    }

    const savings: SavingRow[] = await (prisma as any).freteIntBidGanhoEstimado.findMany({ where })

    const totalSavingTarget = savings
      .filter((s: SavingRow) => s.saving_vs_target != null)
      .reduce((acc: number, s: SavingRow) => acc + (s.saving_vs_target ?? 0), 0)

    const totalSavingMedia = savings
      .reduce((acc: number, s: SavingRow) => acc + (s.saving_vs_media ?? 0), 0)

    const totalAprovado = savings
      .reduce((acc: number, s: SavingRow) => acc + s.valor_aprovado, 0)

    const mediaSavingPct = savings.length > 0
      ? savings.reduce((acc: number, s: SavingRow) => acc + (s.saving_percentual ?? 0), 0) / savings.length
      : 0

    return {
      total_cotacoes_aprovadas: savings.length,
      total_saving_vs_target: totalSavingTarget,
      total_saving_vs_media: totalSavingMedia,
      total_valor_aprovado: totalAprovado,
      media_saving_percentual: mediaSavingPct,
      moeda: 'USD',
    }
  },
}

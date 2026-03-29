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
    const where: any = { product_id: 'bid-frete' }

    if (filtros?.company_id) where.company_id = filtros.company_id
    if (filtros?.data_inicio || filtros?.data_fim) {
      where.created_at = {}
      if (filtros.data_inicio) where.created_at.gte = filtros.data_inicio
      if (filtros.data_fim) where.created_at.lte = filtros.data_fim
    }

    const savings = await (prisma as any).saving.findMany({ where })

    const totalSavingTarget = savings
      .filter((s: any) => s.saving_vs_target != null)
      .reduce((acc: number, s: any) => acc + s.saving_vs_target, 0)

    const totalSavingMedia = savings
      .reduce((acc: number, s: any) => acc + (s.saving_vs_media ?? 0), 0)

    const totalAprovado = savings
      .reduce((acc: number, s: any) => acc + s.valor_aprovado, 0)

    const mediaSavingPct = savings.length > 0
      ? savings.reduce((acc: number, s: any) => acc + (s.saving_percentual ?? 0), 0) / savings.length
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

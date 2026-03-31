/**
 * lpcoCancelamentoJob.ts — Cron job: cancelamento automatico de 90 dias
 *
 * Roda diariamente. Busca LPCOs em status 'em_exigencia'
 * com data_ultima_exigencia > 90 dias atras.
 * Cancela automaticamente + registra no historico.
 */

import { PrismaClient } from '@prisma/client'
import { transitarStatus } from './lpcoStatusEngine.js'

const DIAS_PARA_CANCELAMENTO = 90

export async function executarCancelamentoAutomatico(
  prisma: PrismaClient
): Promise<{ cancelados: number; erros: string[] }> {
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - DIAS_PARA_CANCELAMENTO)

  const lpcosPendentes = await prisma.lpco.findMany({
    where: {
      status: 'em_exigencia',
      data_ultima_exigencia: { lt: dataLimite },
    },
    select: { id: true, tenant_id: true, company_id: true },
  })

  let cancelados = 0
  const erros: string[] = []

  for (const lpco of lpcosPendentes) {
    try {
      await transitarStatus({
        prisma,
        lpcoId: lpco.id,
        tenantId: lpco.tenant_id,
        companyId: lpco.company_id,
        statusNovo: 'cancelada',
        userId: 'sistema',
        userNome: 'Sistema (Auto)',
        descricao: `Cancelamento automatico — ${DIAS_PARA_CANCELAMENTO} dias sem resposta a exigencia`,
        dadosExtras: { tipo: 'cancelamento_automatico', dias: DIAS_PARA_CANCELAMENTO },
      })
      cancelados++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      erros.push(`${lpco.id}: ${msg}`)
    }
  }

  return { cancelados, erros }
}

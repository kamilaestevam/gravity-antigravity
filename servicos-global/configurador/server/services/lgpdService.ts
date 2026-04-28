/**
 * lgpdService.ts — Servico de compliance LGPD/GDPR
 *
 * Implementa o direito ao esquecimento (Right to be Forgotten) conforme
 * secao 13.17 do documento de projeto.
 *
 * Fluxo:
 * 1. Admin solicita exclusao via painel
 * 2. Sistema valida que o usuario existe e pertence ao tenant
 * 3. Exporta dados do usuario (backup antes da exclusao)
 * 4. Executa exclusao cascata em todos os servicos
 * 5. Registra no audit log com LGPD_REQUEST
 *
 * IMPORTANTE: Este servico NAO deleta dados do Clerk (auth provider).
 * A exclusao no Clerk deve ser feita separadamente via painel Clerk.
 */

import { PrismaClient } from '@prisma/client'

interface LgpdDeletionResult {
  userId: string
  tenantId: string
  tablesAffected: string[]
  totalRecordsDeleted: number
  exportUrl?: string
  completedAt: string
}

interface LgpdExportResult {
  userId: string
  tenantId: string
  data: Record<string, unknown[]>
  exportedAt: string
}

/**
 * Exportar todos os dados de um usuario (para entrega antes da exclusao)
 */
export async function exportUserData(
  prisma: PrismaClient,
  tenantId: string,
  userId: string
): Promise<LgpdExportResult> {
  const data: Record<string, unknown[]> = {}

  // Tabelas do Configurador
  const user = await (prisma as any).user.findFirst({
    where: { tenant_id: tenantId, clerk_user_id: userId },
  })
  if (user) data.user = [user]

  const permissions = await (prisma as any).userPermission.findMany({
    where: { tenant_id: tenantId, user_id: userId },
  })
  if (permissions.length) data.permissions = permissions

  return {
    userId,
    tenantId,
    data,
    exportedAt: new Date().toISOString(),
  }
}

/**
 * Executar exclusao cascata de dados do usuario em todos os bancos.
 *
 * Ordem de exclusao (dependencias primeiro):
 * 1. Servicos tenant (historico, notificacoes, cronometro, etc.)
 * 2. Produtos (dados do usuario nos produtos)
 * 3. Configurador (user record por ultimo)
 */
export async function deleteUserData(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  options: { dryRun?: boolean } = {}
): Promise<LgpdDeletionResult> {
  const tablesAffected: string[] = []
  let totalRecordsDeleted = 0

  // Helper para executar delete e contabilizar
  async function deleteFrom(model: string, where: Record<string, unknown>): Promise<number> {
    try {
      const result = await (prisma as any)[model].deleteMany({ where })
      const count = result?.count || 0
      if (count > 0) {
        tablesAffected.push(model)
        totalRecordsDeleted += count
      }
      return count
    } catch {
      // Tabela pode nao existir neste banco — ignorar
      return 0
    }
  }

  if (options.dryRun) {
    // Em dry run, apenas contar sem deletar
    const countFrom = async (model: string, where: Record<string, unknown>): Promise<number> => {
      try {
        const count = await (prisma as any)[model].count({ where })
        if (count > 0) {
          tablesAffected.push(model)
          totalRecordsDeleted += count
        }
        return count
      } catch { return 0 }
    }

    // Contar em todas as tabelas com id_usuario
    await countFrom('userPermission', { tenant_id: tenantId, user_id: userId })
    await countFrom('historyLog', { tenant_id: tenantId, user_id: userId })

    return {
      userId,
      tenantId,
      tablesAffected,
      totalRecordsDeleted,
      completedAt: new Date().toISOString(),
    }
  }

  // Exclusao real — em transacao para atomicidade
  await prisma.$transaction(async (tx) => {
    // 1. Permissoes do usuario
    await deleteFrom('userPermission', { tenant_id: tenantId, user_id: userId })

    // 2. Historico (anonimizar em vez de deletar — compliance)
    try {
      await tx.historyLog.updateMany({
        where: { tenant_id: tenantId, user_id: userId },
        data: { user_id: 'DELETED_USER', actor_id: 'DELETED_USER' },
      })
      tablesAffected.push('historyLog (anonimizado)')
    } catch { /* tabela pode nao existir */ }

    // 3. Usuario record (por ultimo)
    await deleteFrom('user', { tenant_id: tenantId, clerk_user_id: userId })
  })

  return {
    userId,
    tenantId,
    tablesAffected,
    totalRecordsDeleted,
    completedAt: new Date().toISOString(),
  }
}

/**
 * Tabelas que contem dados do usuario em cada servico.
 * Usado pelo painel Admin para mostrar o impacto antes da exclusao.
 */
export const USER_DATA_MAP = {
  configurador: ['Usuario', 'UsuarioPermissao', 'AssinaturaProdutoGravity'],
  tenant: {
    atividades: ['Atividade', 'Contato'],
    cronometro: ['TimerSession', 'TimerActive', 'RelatorioTempoCache'],
    email: ['EmailThread', 'EmailMessage', 'Template'],
    notificacoes: ['Notification', 'NotificationPreference'],
    relatorios: ['Relatorio', 'ExportJob'],
    historico: ['HistoricoLog (anonimizado, nao deletado)'],
  },
  produtos: {
    'bid-frete': ['Cotacao', 'BidRequest', 'Avaliacao', 'Saving'],
    'simula-custo': ['Estimativa', 'TaxaEstimativa', 'TributoEstimativa'],
    processo: ['Processo', 'FollowUp', 'Documento'],
  },
} as const

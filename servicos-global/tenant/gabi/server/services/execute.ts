// server/services/execute.ts
import { assertGabiPermission, PermissionChecker } from './permission.js'
import { auditGabiAction } from './audit.js'
import { AppError } from '../lib/errors.js'

export type GabiActionPayload = {
  type: string       // action (ex: 'delete', 'create')
  resource: string   // resource (ex: 'Activity', 'Service')
  context: string    // conversation_snapshot
  confirmed?: boolean
  data?: unknown
}

type SSEPayloadEmit = (event: string, data: unknown) => void

// ---------------------------------------------------------------------------
// Execução de Ações da Gabi (Barreiras 3, 4 e 6)
// ---------------------------------------------------------------------------
export async function executeGabiAction(
  userId: string,
  tenantId: string,
  actionPayload: GabiActionPayload,
  emitSse?: SSEPayloadEmit,
  permissionChecker?: PermissionChecker,
  mockServiceRunner?: (payload: GabiActionPayload) => Promise<any>
) {
  // Transparência (Barreira 6)
  emitSse?.('transparency', { message: `Verificando permissões para ${actionPayload.type} em ${actionPayload.resource}...` })

  // 1. Verifica permissão (Barreira 1)
  await assertGabiPermission(userId, actionPayload.type, actionPayload.resource, tenantId, permissionChecker)

  // 4. Confirmação destrutiva (Barreira 4)
  const isDestructive = actionPayload.type === 'delete' || actionPayload.type === 'bulk_delete'
  if (isDestructive && !actionPayload.confirmed) {
    emitSse?.('transparency', { message: 'Ação destrutiva exige confirmação do usuário.' })
    return { requiresConfirmation: true, message: `Gabi: Confirme a ação destrutiva ${actionPayload.type} em ${actionPayload.resource}` }
  }

  emitSse?.('transparency', { message: '📝 Esta conversa será salva no histórico...' })

  // 2. Grava log ANTES de executar (Barreira 2). Se falhar -> Exception -> Rollback (Barreira 3)
  const auditLog = await auditGabiAction(userId, tenantId, actionPayload.type, actionPayload.context)
  
  if (!auditLog) {
    throw new AppError('Falha ao registrar auditoria da Gabi. Ação cancelada (Barreira 3).', 500, 'AUDIT_FAILED')
  }

  emitSse?.('transparency', { message: `Executando ação executada de forma autônoma...` })

  // 5. Executa a ação real usando mockServiceRunner ou via message broker
  // Isso será substituído pela ação real chamando o Conector / Banco etc.
  const result = mockServiceRunner 
    ? await mockServiceRunner(actionPayload)
    : { success: true, processedBy: 'gabi' }

  return { success: true, auditLogId: auditLog.id_gabi_log_uso, result }
}

// server/services/permission.ts
import { AppError } from '../lib/errors.js'

/**
 * Dependência injetável para testes. Em produção pode consultar o ConfiguradorS2S.
 */
export type PermissionChecker = (userId: string, action: string, resource: string, tenantId: string) => Promise<boolean>

const defaultPermissionChecker: PermissionChecker = async (userId, action, _resource, _tenantId) => {
  // Leitura: sempre permitida para usuários autenticados
  if (action === 'read') return userId !== 'anonymous'
  // Escrita: permitida para autenticados — o tenant_id do JWT já garante isolamento
  // TODO: integrar com Configurador S2S para permissões granulares por role
  return userId !== 'anonymous'
}

// ---------------------------------------------------------------------------
// Barreira 1 — Permissões Espelhadas
// ---------------------------------------------------------------------------
export async function assertGabiPermission(
  userId: string,
  action: string,
  resource: string,
  tenantId: string,
  checker: PermissionChecker = defaultPermissionChecker
): Promise<void> {
  const hasPermission = await checker(userId, action, resource, tenantId)
  
  if (!hasPermission) {
    throw new AppError(
      `Gabi: Usuário ${userId} não tem permissão para ${action} em ${resource} (Barreira 1)`,
      403,
      'FORBIDDEN_GABI_ACTION'
    )
  }
}

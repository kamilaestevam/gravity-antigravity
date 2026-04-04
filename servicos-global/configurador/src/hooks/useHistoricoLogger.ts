import { useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'

export type ActorTypeHistorico = 'USER' | 'AI' | 'JOB' | 'API' | 'INTEGRATION'

export type DiffObj = {
  campo: string
  antes: string
  depois: string
}

export type PayloadHistorico = {
  /** Ação executada (ex: 'CRIAÇÃO', 'ALTERAÇÃO', 'EXCLUSÃO', 'CONFIGURAÇÃO') */
  action: string
  /** Módulo afetado em snake_case (ex: 'empresa', 'produto', 'usuario') */
  module: string
  /** Tipo do recurso em PascalCase (ex: 'Company', 'Product', 'User') */
  resource_type: string
  /** Descrição legível do que foi feito */
  action_detail: string
  /** ID do recurso afetado */
  resource_id?: string
  /** Tipo de ator — padrão: 'USER' */
  actor_type?: ActorTypeHistorico
  /** Estado antes da alteração */
  before?: Record<string, unknown>
  /** Estado depois da alteração */
  after?: Record<string, unknown>
  /** Diff simplificado — convertido automaticamente em before/after */
  diff?: DiffObj[]
  /** ID do produto que originou a ação */
  product_id?: string
}

/**
 * Hook universal para envio de logs ao Histórico Global.
 * Fire-and-forget: nunca bloqueia a execução principal.
 *
 * Requer que o componente esteja dentro de <ClerkProvider>.
 * O actor_id e actor_name são preenchidos automaticamente via useUser().
 */
export function useHistoricoLogger() {
  const { user } = useUser()

  const logEvent = useCallback((payload: PayloadHistorico) => {
    if (!user) return

    // Converter diff simplificado para before/after se fornecido
    let before = payload.before
    let after = payload.after
    if (payload.diff && payload.diff.length > 0 && !before && !after) {
      before = Object.fromEntries(payload.diff.map((d) => [d.campo, d.antes]))
      after = Object.fromEntries(payload.diff.map((d) => [d.campo, d.depois]))
    }

    const body = {
      actor_type: payload.actor_type ?? 'USER',
      actor_id: user.id,
      actor_name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? user.id,
      module: payload.module,
      resource_type: payload.resource_type,
      resource_id: payload.resource_id,
      action: payload.action,
      action_detail: payload.action_detail,
      before,
      after,
      status: 'SUCCESS',
      product_id: payload.product_id,
      user_id: user.id,
    }

    fetch('/api/tenant/historico-global/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch((err) => {
      console.warn('[useHistoricoLogger] Falha silenciosa ao gravar log:', err)
    })
  }, [user])

  return { logEvent }
}

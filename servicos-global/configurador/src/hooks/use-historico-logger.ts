import { useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'

export type TipoAtorHistoricoLog = 'USUARIO' | 'IA' | 'JOB' | 'API' | 'INTEGRACAO'

export type DiffObj = {
  campo: string
  antes: string
  depois: string
}

export type PayloadHistorico = {
  acao_historico_log: string
  modulo_historico_log: string
  tipo_recurso_historico_log: string
  detalhe_acao_historico_log: string
  id_recurso_historico_log?: string
  tipo_ator_historico_log?: TipoAtorHistoricoLog
  estado_anterior_historico_log?: Record<string, unknown>
  estado_posterior_historico_log?: Record<string, unknown>
  diff?: DiffObj[]
  id_produto_historico_log?: string
}

export function useHistoricoLogger() {
  const { getToken } = useAuth()
  const { user } = useUser()

  const logEvent = useCallback((payload: PayloadHistorico) => {
    if (!user) return

    let estado_anterior = payload.estado_anterior_historico_log
    let estado_posterior = payload.estado_posterior_historico_log
    if (payload.diff && payload.diff.length > 0 && !estado_anterior && !estado_posterior) {
      estado_anterior = Object.fromEntries(payload.diff.map((d) => [d.campo, d.antes]))
      estado_posterior = Object.fromEntries(payload.diff.map((d) => [d.campo, d.depois]))
    }

    const body = {
      tipo_ator_historico_log: payload.tipo_ator_historico_log ?? 'USUARIO',
      id_ator_historico_log: user.id,
      nome_ator_historico_log: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? user.id,
      modulo_historico_log: payload.modulo_historico_log,
      tipo_recurso_historico_log: payload.tipo_recurso_historico_log,
      id_recurso_historico_log: payload.id_recurso_historico_log,
      acao_historico_log: payload.acao_historico_log,
      detalhe_acao_historico_log: payload.detalhe_acao_historico_log,
      estado_anterior_historico_log: estado_anterior,
      estado_posterior_historico_log: estado_posterior,
      status_historico_log: 'SUCESSO' as const,
      id_produto_historico_log: payload.id_produto_historico_log,
      id_usuario: user.id,
    }

    getToken()
      .then((token) => {
        if (!token) {
          console.warn('[useHistoricoLogger] Token Clerk ausente — log descartado')
          return
        }
        return fetch('/api/v1/admin/historico-global/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })
      })
      .then((res) => {
        if (res && !res.ok) {
          console.warn(`[useHistoricoLogger] POST falhou: ${res.status} ${res.statusText}`)
        }
      })
      .catch((err) => {
        console.warn('[useHistoricoLogger] Falha ao gravar log:', err)
      })
  }, [user, getToken])

  return { logEvent }
}

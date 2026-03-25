import { useCallback } from 'react'

export type TipoAcaoHistorico = 
  | 'CRIAÇÃO' 
  | 'ALTERAÇÃO' 
  | 'EXCLUSÃO' 
  | 'ENVIO' 
  | 'RECEBIMENTO' 
  | 'EXPORTAÇÃO' 
  | 'LOGIN' 
  | 'CONFIGURAÇÃO' 
  | 'IA'

export type DiffObj = {
  campo: string
  antes: string
  depois: string
}

export type PayloadHistorico = {
  acao: TipoAcaoHistorico
  entidade: string
  oQueFoiFeito: string
  quemNome?: string
  quemTipo?: 'user' | 'gabi' | 'system'
  diff?: DiffObj[]
}

/**
 * Hook universal para envio de logs assíncronos ao Histórico Global (Onda 3).
 * Siga o padrão Fire-and-Forget: não utilize `await` travando a execução principal
 * do usuário, o disparo do log não deve interferir no tempo de resposta da UI.
 */
export function useHistoricoLogger() {
  const logEvent = useCallback((payload: PayloadHistorico) => {
    // Fire-and-forget: Inicia a requisição mas não bloqueia
    // Quando o serviço Backend estiver 100% no ar, este fetch baterá no /api/tenant/historico-global/logs
    // Mapeamento para o contrato fixo do Backend (IngestHistorySchema)
    const body = {
      actor_id: payload.quemNome || 'Daniel Martins',
      actor_type: (payload.quemTipo === 'gabi' ? 'GABI_IA' : payload.quemTipo?.toUpperCase() || 'USER'),
      action: payload.acao,
      metadata: {
        oQueFoiFeito: payload.oQueFoiFeito,
        entidade: payload.entidade,
        diff: payload.diff,
        quando: new Date().toISOString()
      }
    }

    fetch('/api/tenant/historico-global/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).catch((err) => {
      console.warn('Falha silenciosa ao gravar no Histórico Global:', err)
    })
  }, [])

  return { logEvent }
}

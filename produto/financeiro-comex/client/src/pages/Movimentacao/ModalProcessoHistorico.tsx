/**
 * ModalHistorico.tsx — Histórico de alterações do processo financeiro
 */

import { useState, useEffect } from 'react'
import { historico as historicoApi } from '../../shared/api'

interface Props {
  processoId: string
  onClose: () => void
}

interface EntradaHistorico {
  id: string
  acao: string
  descricao: string
  user_nome: string
  created_at: string
}

export default function ModalHistoricoProcesso({ processoId, onClose }: Props) {
  const [entradas, setEntradas] = useState<EntradaHistorico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historicoApi.listar(processoId, { page: 1 }).then(res => {
      setEntradas(res.data as EntradaHistorico[])
    }).finally(() => setLoading(false))
  }, [processoId])

  function formatDate(d: string) {
    return new Date(d).toLocaleString('pt-BR')
  }

  return (
    <div className="fincom-modal-overlay" onClick={onClose}>
      <div className="fincom-modal" onClick={e => e.stopPropagation()}>
        <div className="fincom-modal__header">
          <h2>Historico de Alteracoes</h2>
          <button className="fincom-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="fincom-modal__body">
          {loading ? (
            <p>Carregando...</p>
          ) : entradas.length === 0 ? (
            <p className="fincom-info">Nenhuma alteracao registrada.</p>
          ) : (
            <div className="fincom-historico-lista">
              {entradas.map(e => (
                <div key={e.id} className="fincom-historico-item">
                  <div className="fincom-historico-item__acao">{e.acao}</div>
                  <div className="fincom-historico-item__desc">{e.descricao}</div>
                  <div className="fincom-historico-item__meta">
                    {e.user_nome} · {formatDate(e.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="fincom-modal__footer">
          <button className="fincom-btn fincom-btn--secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

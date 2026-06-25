/**
 * KanbanLeituraSmartRead — colunas por status_leitura
 */

import { useMemo } from 'react'
import { useSmartReadVisualizacao } from '../../components/smart-read-visualizacao-context'
import { ROTULO_STATUS_LEITURA } from '../../shared/formatacao-leitura-smart-read'
import { useTransacoesLeituraSmartRead } from '../../shared/use-transacoes-leitura-smart-read'
import type { StatusLeitura, TransacaoLeitura } from '../../shared/schemas'
import '../../shared/smart-read-leituras.css'

const COLUNAS: StatusLeitura[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

function agruparPorStatus(transacoes: TransacaoLeitura[]): Record<StatusLeitura, TransacaoLeitura[]> {
  const mapa: Record<StatusLeitura, TransacaoLeitura[]> = {
    PENDING: [],
    PROCESSING: [],
    COMPLETED: [],
    FAILED: [],
  }
  for (const item of transacoes) {
    mapa[item.status_leitura].push(item)
  }
  return mapa
}

export default function KanbanLeituraSmartRead() {
  const { painelAtivo } = useSmartReadVisualizacao()
  const { transacoes, carregando, erro } = useTransacoesLeituraSmartRead('envios', painelAtivo('kanban'))
  const grupos = useMemo(() => agruparPorStatus(transacoes), [transacoes])

  if (carregando && transacoes.length === 0) {
    return <div className="sr-placeholder-pagina">Carregando kanban…</div>
  }

  return (
    <div className="sr-pagina">
      {erro && (
        <div className="sr-erro" role="alert">
          {erro}
        </div>
      )}
      <div className="sr-kanban">
        {COLUNAS.map((status) => (
          <div key={status} className="sr-kanban-coluna">
            <h3 className="sr-kanban-coluna-titulo">
              {ROTULO_STATUS_LEITURA[status]} ({grupos[status].length})
            </h3>
            {grupos[status].map((item) => (
              <article key={item.id_leitura} className="sr-kanban-card">
                <p className="sr-kanban-card-titulo">
                  {item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura}
                </p>
                <p className="sr-kanban-card-meta">
                  {item.total_arquivos} arquivo(s) · {item.origem_leitura}
                </p>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

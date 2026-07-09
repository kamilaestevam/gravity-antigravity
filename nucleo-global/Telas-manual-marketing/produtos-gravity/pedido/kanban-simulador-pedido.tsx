import { ArrowRight, CheckCircle, X } from '@phosphor-icons/react'
import { useState } from 'react'
import {
  CARDS_KANBAN_INICIAIS_PEDIDO_SIMULADOR,
  type CardKanbanPedidoSimulador,
  type StatusKanbanPedidoSimulador,
} from './dados-kanban-simulador-pedido'
import './kanban-simulador-pedido.css'

const COLUNAS_KANBAN: { status: StatusKanbanPedidoSimulador; titulo: string; cor: string }[] = [
  { status: 'abertura', titulo: 'Abertura', cor: '#818cf8' },
  { status: 'anuencia', titulo: 'Anuência', cor: '#fbbf24' },
  { status: 'desembaraco', titulo: 'Desembaraço', cor: '#10b981' },
]

const ETAPAS_TIMELINE = [
  { chave: 'criacao', rotulo: 'Criação do Pedido' },
  { chave: 'bid', rotulo: 'Vincular Cotação de Frete (BID)' },
  { chave: 'li', rotulo: 'Registrar Licença de Importação' },
] as const

function etapaConcluida(status: StatusKanbanPedidoSimulador, chave: (typeof ETAPAS_TIMELINE)[number]['chave']): boolean {
  if (chave === 'criacao') return true
  if (chave === 'bid') return status !== 'abertura'
  return status === 'desembaraco'
}

export function KanbanSimuladorPedido() {
  const [cards, setCards] = useState<CardKanbanPedidoSimulador[]>(CARDS_KANBAN_INICIAIS_PEDIDO_SIMULADOR)
  const [selecionado, setSelecionado] = useState<CardKanbanPedidoSimulador | null>(null)

  function handleDragStart(e: React.DragEvent, cardId: string) {
    e.dataTransfer.setData('cardId', cardId)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(e: React.DragEvent, status: StatusKanbanPedidoSimulador) {
    const cardId = e.dataTransfer.getData('cardId')
    setCards((lista) =>
      lista.map((card) => (card.id === cardId ? { ...card, status } : card)),
    )
    setSelecionado((prev) => (prev?.id === cardId ? { ...prev, status } : prev))
  }

  function avancarCard(status: StatusKanbanPedidoSimulador) {
    if (!selecionado) return
    setCards((lista) =>
      lista.map((card) => (card.id === selecionado.id ? { ...card, status } : card)),
    )
    setSelecionado((prev) => (prev ? { ...prev, status } : null))
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
      <div className="pds-kanban">
        {COLUNAS_KANBAN.map((coluna) => {
          const cardsColuna = cards.filter((card) => card.status === coluna.status)
          return (
            <div
              key={coluna.status}
              className="pds-kanban-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, coluna.status)}
            >
              <div className="pds-kanban-col__head">
                <div className="pds-kanban-col__titulo">
                  <span className="pds-kanban-col__dot" style={{ background: coluna.cor }} />
                  {coluna.titulo}
                </div>
                <span className="pds-kanban-col__count">{cardsColuna.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {cardsColuna.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onClick={() => setSelecionado(card)}
                    className="pds-kanban-card"
                    style={{ borderLeft: `2.5px solid ${coluna.cor}`, ['--pds-col-cor' as string]: coluna.cor }}
                  >
                    <p className="pds-kanban-card__titulo">{card.titulo}</p>
                    <div className="pds-kanban-card__meta">
                      <span>{card.cliente}</span>
                      <span className="pds-kanban-card__valor">{card.valor}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selecionado && (
        <aside className="pds-kanban-drawer">
          <div className="pds-kanban-drawer__head">
            <p className="pds-kanban-drawer__titulo">Detalhamento do Processo</p>
            <button type="button" className="pds-kanban-drawer__fechar" onClick={() => setSelecionado(null)} aria-label="Fechar">
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <p className="pds-kanban-drawer__campo-label">Referência</p>
              <p className="pds-kanban-drawer__campo-valor" style={{ fontWeight: 700, color: '#fff' }}>
                {selecionado.titulo}
              </p>
            </div>
            <div>
              <p className="pds-kanban-drawer__campo-label">Cliente</p>
              <p className="pds-kanban-drawer__campo-valor">{selecionado.cliente}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <p className="pds-kanban-drawer__campo-label">Data de Abertura</p>
                <p className="pds-kanban-drawer__campo-valor">{selecionado.data}</p>
              </div>
              <div>
                <p className="pds-kanban-drawer__campo-label">Valor Total FOB</p>
                <p className="pds-kanban-drawer__campo-valor pds-kanban-drawer__campo-valor--destaque">
                  {selecionado.valor}
                </p>
              </div>
            </div>

            <div className="pds-kanban-timeline">
              <p className="pds-kanban-timeline__titulo">Rastreabilidade de Etapas</p>
              {ETAPAS_TIMELINE.map((etapa) => {
                const ok = etapaConcluida(selecionado.status, etapa.chave)
                return (
                  <div key={etapa.chave} className="pds-kanban-timeline__item">
                    <span
                      className={`pds-kanban-timeline__icone ${ok ? 'pds-kanban-timeline__icone--ok' : 'pds-kanban-timeline__icone--pendente'}`}
                    >
                      {ok ? '✓' : '●'}
                    </span>
                    <span style={{ color: ok ? '#cbd5e1' : '#64748b', fontWeight: ok ? 600 : 400, fontSize: 11 }}>
                      {etapa.rotulo}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pds-kanban-drawer__acoes">
            {selecionado.status === 'abertura' && (
              <button type="button" className="pds-kanban-btn-acao pds-kanban-btn-acao--indigo" onClick={() => avancarCard('anuencia')}>
                <span>Vincular Cotação (BID)</span>
                <ArrowRight size={12} />
              </button>
            )}
            {selecionado.status === 'anuencia' && (
              <button type="button" className="pds-kanban-btn-acao pds-kanban-btn-acao--amber" onClick={() => avancarCard('desembaraco')}>
                <span>Registrar Anuência da LI</span>
                <ArrowRight size={12} />
              </button>
            )}
            {selecionado.status === 'desembaraco' && (
              <button type="button" className="pds-kanban-btn-acao pds-kanban-btn-acao--green" onClick={() => setSelecionado(null)}>
                <CheckCircle size={14} />
                <span>Emitir Declaração de Importação</span>
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}

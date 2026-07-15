import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowSquareOut,
  Bell,
  CalendarBlank,
  CalendarCheck,
  CalendarX,
  Package,
  PencilSimple,
  Scales,
  X,
} from '@phosphor-icons/react'
import type { AbaModalKanbanPedido } from './dados-tutorial-opcional-simulador-pedido'
import {
  KANBAN_PREFS_SIMULADOR_PEDIDO,
  ROTULOS_STATUS_KANBAN_SIMULADOR,
  type KanbanPreferenciasSimulador,
  type PedidoKanbanSimulador,
  type StatusKanbanPedidoSimulador,
} from './dados-kanban-simulador-pedido'

type ColunaKanbanModal = {
  key: StatusKanbanPedidoSimulador
  label: string
  color: string
}

export interface ModalKanbanSimuladorPedidoProps {
  pedido: PedidoKanbanSimulador | null
  aberto: boolean
  colunas: ColunaKanbanModal[]
  abaAtiva?: AbaModalKanbanPedido
  onAbaAtivaChange?: (aba: AbaModalKanbanPedido) => void
  preferencias?: KanbanPreferenciasSimulador
  onFechar: () => void
  onAbrirPedidoCompleto: (numeroPedido: string) => void
}

function formatarValorCampoKanban(pedido: PedidoKanbanSimulador, campo: string): string {
  const val = (pedido as unknown as Record<string, unknown>)[campo]
  if (val === null || val === undefined || val === '') return '—'
  if (campo.startsWith('data_')) {
    const d = new Date(String(val))
    return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('pt-BR')
  }
  if (campo === 'tipo_operacao') return val === 'importacao' ? 'Importação' : 'Exportação'
  if (typeof val === 'number') {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return String(val)
}

const ALVO_ABA_MODAL: Record<AbaModalKanbanPedido, string> = {
  pedido: 'pedido-kanban-modal-aba-pedido',
  quantidades: 'pedido-kanban-modal-aba-quantidades',
  datas: 'pedido-kanban-modal-aba-datas',
  lembrete: 'pedido-kanban-modal-aba-lembrete',
}

export function ModalKanbanSimuladorPedido({
  pedido,
  aberto,
  colunas,
  abaAtiva = 'pedido',
  onAbaAtivaChange,
  preferencias = KANBAN_PREFS_SIMULADOR_PEDIDO,
  onFechar,
  onAbrirPedidoCompleto,
}: ModalKanbanSimuladorPedidoProps) {
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto || !pedido) return null

  const camposPedido = (preferencias.abas.find(a => a.aba === 'pedido')?.campos ?? []).filter(c => c.visivel)
  const camposQuantidades = (preferencias.abas.find(a => a.aba === 'quantidades')?.campos ?? []).filter(c => c.visivel)
  const camposDatas = (preferencias.abas.find(a => a.aba === 'datas')?.campos ?? []).filter(c => c.visivel)

  const colunaAtual = colunas.find(c => c.key === pedido.status)
  const statusCor = colunaAtual?.color ?? '#64748b'
  const statusRotulo = ROTULOS_STATUS_KANBAN_SIMULADOR[pedido.status] ?? colunaAtual?.label ?? pedido.status

  const ABAS_MODAL: Array<{ id: AbaModalKanbanPedido; rotulo: string; icone: ReactNode }> = [
    { id: 'pedido', rotulo: 'Pedido', icone: <PencilSimple size={13} weight="duotone" /> },
    { id: 'quantidades', rotulo: 'Quantidades', icone: <Package size={13} weight="duotone" /> },
    { id: 'datas', rotulo: 'Datas', icone: <CalendarBlank size={13} weight="duotone" /> },
    { id: 'lembrete', rotulo: 'Lembrete', icone: <Bell size={13} weight="duotone" /> },
  ]

  const hoje = new Date()

  function abrirCompleto() {
    onAbrirPedidoCompleto(pedido.numero_pedido)
    onFechar()
  }

  function selecionarAba(id: AbaModalKanbanPedido) {
    onAbaAtivaChange?.(id)
  }

  const modal = (
    <div
      className="kbp-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      data-sds-tutorial-alvo="pedido-kanban-modal-overlay"
    >
      <div
        className="kbp-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={pedido.numero_pedido}
        data-sds-tutorial-alvo="pedido-kanban-modal-dialog"
      >

        <div className="kbp-modal-cabecalho" data-sds-tutorial-alvo="pedido-kanban-modal-cabecalho">
          <div className="kbp-modal-titulo-wrap">
            <span className="kbp-modal-numero">{pedido.numero_pedido}</span>
            <span className={`kbp-modal-tipo kbp-modal-tipo--${pedido.tipo_operacao}`}>
              {pedido.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
            </span>
          </div>
          <div className="kbp-modal-status-row" data-sds-tutorial-alvo="pedido-kanban-modal-status">
            <span className="kbp-modal-status-label">STATUS</span>
            <button
              type="button"
              className="kbp-modal-status-badge"
              style={{ color: statusCor, background: `${statusCor}1a`, borderColor: `${statusCor}40` }}
            >
              <span className="kbp-modal-status-dot" style={{ background: statusCor }} />
              {statusRotulo}
            </button>
          </div>
          <button
            type="button"
            className="kbp-modal-btn-fechar"
            onClick={onFechar}
            aria-label="Fechar"
            data-sds-tutorial-alvo="pedido-kanban-modal-fechar"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <nav className="kbp-modal-abas" role="tablist" data-sds-tutorial-alvo="pedido-kanban-modal-abas">
          {ABAS_MODAL.map(aba => (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={abaAtiva === aba.id}
              className={`kbp-modal-aba${abaAtiva === aba.id ? ' kbp-modal-aba--ativa' : ''}`}
              onClick={() => selecionarAba(aba.id)}
              data-sds-tutorial-alvo={ALVO_ABA_MODAL[aba.id]}
            >
              {aba.icone}
              {aba.rotulo}
            </button>
          ))}
        </nav>

        <div className="kbp-modal-body" role="tabpanel">
          {abaAtiva === 'pedido' && (
            <div className="kbp-modal-aba-grid" data-sds-tutorial-alvo="pedido-kanban-modal-campos-pedido">
              {camposPedido.map(cfg => (
                <div key={cfg.campo} className="kbp-modal-campo">
                  <span className="kbp-modal-campo-label">{cfg.label}</span>
                  <span className="kbp-modal-campo-valor">{formatarValorCampoKanban(pedido, cfg.campo)}</span>
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'quantidades' && (
            <div className="kbp-modal-qtd-lista" data-sds-tutorial-alvo="pedido-kanban-modal-qtd-lista">
              {camposQuantidades.map(cfg => {
                const val = (pedido as unknown as Record<string, unknown>)[cfg.campo]
                const isSaldo = cfg.campo === 'saldo_itens_do_pedido'
                const alvoQtd = cfg.campo === 'quantidade_total_pedido'
                  ? 'pedido-kanban-modal-qtd-inicial'
                  : cfg.campo === 'quantidade_pronta_itens_pedido_total'
                    ? 'pedido-kanban-modal-qtd-pronta'
                    : cfg.campo === 'quantidade_transferida_total'
                      ? 'pedido-kanban-modal-qtd-transferida'
                      : isSaldo
                        ? 'pedido-kanban-modal-qtd-saldo'
                        : undefined
                return (
                  <div
                    key={cfg.campo}
                    className={`kbp-modal-qtd-row${isSaldo ? ' kbp-modal-qtd-row--saldo' : ''}`}
                    {...(alvoQtd ? { 'data-sds-tutorial-alvo': alvoQtd } : {})}
                  >
                    <span className="kbp-modal-qtd-label">
                      {isSaldo ? <Scales size={13} weight="duotone" /> : <Package size={13} weight="duotone" />}
                      {cfg.label}
                    </span>
                    <span className="kbp-modal-qtd-valor">
                      {val != null ? Number(val).toLocaleString('pt-BR') : '—'}
                    </span>
                  </div>
                )
              })}
              {pedido.unidade_comercializada_pedido && (
                <p className="kbp-modal-qtd-unidade">
                  Unidade: {pedido.unidade_comercializada_pedido}
                </p>
              )}
            </div>
          )}

          {abaAtiva === 'datas' && (
            <div className="kbp-modal-datas-lista" data-sds-tutorial-alvo="pedido-kanban-modal-datas-lista">
              {camposDatas.map(cfg => {
                const val = (pedido as unknown as Record<string, unknown>)[cfg.campo] as string | null
                const d = val ? new Date(val) : null
                const vencida = d && d < hoje && cfg.campo.includes('prevista')
                const alvoData = cfg.campo === 'data_emissao_pedido'
                  ? 'pedido-kanban-modal-data-emissao'
                  : cfg.campo === 'data_prevista_coleta_pedido'
                    ? 'pedido-kanban-modal-data-coleta'
                    : cfg.campo === 'data_prevista_pedido_pronto'
                      ? 'pedido-kanban-modal-data-pronto'
                      : cfg.campo === 'data_prevista_inspecao_pedido'
                        ? 'pedido-kanban-modal-data-inspecao'
                        : undefined
                return (
                  <div
                    key={cfg.campo}
                    className="kbp-modal-data-row"
                    {...(alvoData ? { 'data-sds-tutorial-alvo': alvoData } : {})}
                  >
                    <span className="kbp-modal-data-label">
                      {vencida
                        ? <CalendarX size={13} weight="duotone" className="kbp-icon-vencida" />
                        : <CalendarCheck size={13} weight="duotone" />}
                      {cfg.label}
                    </span>
                    <span className={`kbp-modal-data-valor${vencida ? ' kbp-modal-data-valor--vencida' : ''}`}>
                      {d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {abaAtiva === 'lembrete' && (
            <div className="kbp-modal-lembrete" data-sds-tutorial-alvo="pedido-kanban-modal-lembrete-info">
              <p className="kbp-modal-lembrete-info">
                Configure lembretes para este pedido na tela completa.
              </p>
              <button
                type="button"
                className="kbp-modal-btn-abrir"
                onClick={abrirCompleto}
                data-sds-tutorial-alvo="pedido-kanban-modal-abrir-completo"
              >
                <ArrowSquareOut size={15} weight="duotone" />
                Abrir pedido completo
              </button>
            </div>
          )}
        </div>

        <div className="kbp-modal-footer">
          <button
            type="button"
            className="kbp-modal-btn-abrir"
            onClick={abrirCompleto}
            data-sds-tutorial-alvo="pedido-kanban-modal-abrir-completo"
          >
            <ArrowSquareOut size={15} weight="duotone" />
            Abrir pedido completo
          </button>
          <button
            type="button"
            className="kbp-modal-btn-fechar-footer"
            onClick={onFechar}
            data-sds-tutorial-alvo="pedido-kanban-modal-fechar"
          >
            <X size={13} weight="bold" />
            Fechar
          </button>
        </div>

      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

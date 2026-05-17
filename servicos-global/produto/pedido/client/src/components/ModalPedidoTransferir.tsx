/**
 * ModalTransferir.tsx — Modal de transferência de pedidos
 *
 * Fluxo em 5 passos:
 *   1. Selecionar cenário (cards visuais)
 *   2. Selecionar item e quantidade
 *   3. Configurar destinos (varia por cenário)
 *   4. Preview do impacto (/preview)
 *   5. Confirmar (/confirmar)
 *
 * Regras de negócio:
 *   - Cenários irreversíveis: reducao_simples, transfer_intercompany
 *   - Multi-split: múltiplos destinos com soma de quantidades
 *   - Substituição: part_number alterado no destino
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import {
  Warning,
  CheckCircle,
  ArrowRight,
  ArrowSquareOut,
  ArrowSquareIn,
  CaretDown,
  Database,
  PlusCircle,
  ArrowDown,
  Eye,
  MinusCircle,
  GitBranch,
  ArrowBendUpRight,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useShellStore } from '@gravity/shell'
import type {
  Pedido,
  PedidoItem,
  CenarioTransfer,
  TransferDestino,
  TransferPayload,
  TransferPreview,
  TransferResultado,
} from '../shared/types'
import { pedidoTransferirApi, pedidoApi } from '../shared/api'
import { fmtQuantidade } from '../shared/types'

// ── Definição de Cenários ─────────────────────────────────────────────────────

interface CenarioInfo {
  id: CenarioTransfer
  nomeKey: string
  descricaoKey: string
  Icone: React.ComponentType<{ size?: number; weight?: string; className?: string }>
  reversivel: boolean
  criaDestinos: boolean
}

const CENARIOS: CenarioInfo[] = [
  {
    id: 'reducao_simples',
    nomeKey: 'pedido.modal_transf.cenario_reducao_nome',
    descricaoKey: 'pedido.modal_transf.cenario_reducao_desc',
    Icone: MinusCircle,
    reversivel: false,
    criaDestinos: false,
  },
  {
    id: 'split_novo_pedido',
    nomeKey: 'pedido.modal_transf.cenario_split_novo_nome',
    descricaoKey: 'pedido.modal_transf.cenario_split_novo_desc',
    Icone: GitBranch,
    reversivel: true,
    criaDestinos: true,
  },
  {
    id: 'split_pedido_existente',
    nomeKey: 'pedido.modal_transf.cenario_split_exist_nome',
    descricaoKey: 'pedido.modal_transf.cenario_split_exist_desc',
    Icone: ArrowBendUpRight,
    reversivel: true,
    criaDestinos: true,
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalTransferirPedidoProps {
  pedidos: Pedido[]
  itemIdInicial?: string
  /** IDs dos itens pré-selecionados na lista (multi-select) */
  itensSelecionadosIds?: string[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Tipos de estado interno ───────────────────────────────────────────────────

type Passo = 1 | 2 | 3 | 4 | 5

// ── Sub-componente: Seletor de Cenário ────────────────────────────────────────

interface SeletorCenarioProps {
  cenarioSelecionado: CenarioTransfer | null
  onChange: (c: CenarioTransfer) => void
}

function SeletorCenario({ cenarioSelecionado, onChange }: SeletorCenarioProps) {
  const { t } = useTranslation()

  return (
    <div className="modal-transferir__cenario-cards">
      <span className="modal-transferir__cenario-cards-label">
        {t('pedido.modal_transf.cenario_tipo_label')}
      </span>
      <div className="modal-transferir__cenario-cards-grid">
        {CENARIOS.map(c => {
          const ativo = c.id === cenarioSelecionado
          return (
            <button
              key={c.id}
              type="button"
              className={`modal-transferir__cenario-card${ativo ? ' modal-transferir__cenario-card--ativo' : ''}`}
              onClick={() => onChange(c.id)}
              aria-pressed={ativo}
            >
              <span className={`modal-transferir__cenario-card-icone${ativo ? ' modal-transferir__cenario-card-icone--ativo' : ''}`}>
                <c.Icone size={20} weight={ativo ? 'fill' : 'duotone'} />
              </span>
              <span className="modal-transferir__cenario-card-texto">
                <span className="modal-transferir__cenario-card-nome">{t(c.nomeKey)}</span>
                <span className="modal-transferir__cenario-card-desc">{t(c.descricaoKey)}</span>
              </span>
              {!c.reversivel && (
                <span className="modal-transferir__badge-irreversivel">{t('pedido.modal_transf.badge_irreversivel')}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Sub-componente: Seletor de Item e Quantidade ──────────────────────────────

/** Item enriquecido com referência ao pedido pai */
interface ItemComPedido {
  item: PedidoItem
  pedido: Pedido
}

interface SeletorItemQuantidadeProps {
  /** Itens de todos os pedidos selecionados, agrupados por pedido */
  itensComPedido: ItemComPedido[]
  /** Mapa itemId → quantidade a transferir (multi-select) */
  itensQuantidades: Map<string, number>
  onToggleItem: (itemId: string) => void
  onQuantidadeChange: (itemId: string, qty: number) => void
  /** Quando há múltiplos pedidos, mostra coluna "Pedido" */
  multiPedido: boolean
}

function SeletorItemQuantidade({
  itensComPedido,
  itensQuantidades,
  onToggleItem,
  onQuantidadeChange,
  multiPedido,
}: SeletorItemQuantidadeProps) {
  const { t } = useTranslation()

  return (
    <table className="modal-transferir__tabela-itens" aria-label={t('pedido.modal_transf.aria_tabela_itens')}>
      <thead>
        <tr>
          {multiPedido && <th scope="col">Pedido</th>}
          <th scope="col">{t('pedido.modal_transf.col_part_number')}</th>
          <th scope="col">{t('pedido.modal_transf.col_descricao')}</th>
          <th scope="col">{t('pedido.modal_transf.col_saldo')}</th>
          <th scope="col" style={{ minWidth: 130 }}>{t('pedido.modal_transf.col_qty_transfer')}</th>
          <th scope="col" style={{ minWidth: 90 }}>{t('pedido.modal_transf.col_saldo_apos')}</th>
        </tr>
      </thead>
      <tbody>
        {itensComPedido.map(({ item, pedido }) => {
          const selecionado = itensQuantidades.has(item.id)
          const qty = itensQuantidades.get(item.id) ?? 0
          const qtyMax = item.quantidade_atual_pedido
          const qtyInvalida = selecionado && (qty > qtyMax || qty <= 0)
          const saldoApos = selecionado
            ? Math.max(0, item.quantidade_atual_pedido - (qty || 0))
            : null
          return (
            <tr
              key={item.id}
              className="modal-transferir__tabela-itens-row"
              onClick={() => onToggleItem(item.id)}
              aria-selected={selecionado}
            >
              {multiPedido && (
                <td className="modal-transferir__col-pedido">
                  <span className="modal-transferir__pedido-numero">{pedido.numero_pedido}</span>
                </td>
              )}
              <td>
                <span className="modal-transferir__radio-label">
                  <input
                    type="checkbox"
                    checked={selecionado}
                    readOnly
                    aria-label={`Selecionar item ${item.part_number}`}
                  />
                  <strong>
                    {item.part_number && item.part_number.length > 20 ? (
                      <TooltipGlobal titulo={t('pedido.modal_transf.col_part_number')} descricao={item.part_number}>
                        <span className="modal-transferir__desc-truncada">
                          {item.part_number.slice(0, 20) + '…'}
                          <Eye size={14} className="modal-transferir__desc-eye" />
                        </span>
                      </TooltipGlobal>
                    ) : item.part_number}
                  </strong>
                </span>
              </td>
              <td>
                {item.descricao_item && item.descricao_item.length > 30 ? (
                  <TooltipGlobal titulo={t('pedido.modal_transf.col_descricao')} descricao={item.descricao_item}>
                    <span className="modal-transferir__desc-truncada">
                      {item.descricao_item.slice(0, 30) + '…'}
                      <Eye size={14} className="modal-transferir__desc-eye" />
                    </span>
                  </TooltipGlobal>
                ) : (
                  <span>{item.descricao_item || '—'}</span>
                )}
              </td>
              <td>{fmtQuantidade(item.quantidade_atual_pedido, item.casas_decimais_quantidade_item)}</td>
              <td onClick={e => e.stopPropagation()}>
                {selecionado ? (
                  <div>
                    <input
                      type="number"
                      className={`modal-transferir__input-qty${qtyInvalida ? ' modal-transferir__input-qty--erro' : ''}`}
                      value={qty || ''}
                      min={0.001}
                      max={qtyMax}
                      step={0.001}
                      onChange={e => onQuantidadeChange(item.id, parseFloat(e.target.value) || 0)}
                      aria-label={t('pedido.modal_transf.aria_qtd_transferir')}
                      aria-invalid={qtyInvalida}
                    />
                    <div className="modal-transferir__qty-disponivel">
                      {t('pedido.modal_transf.max_label')} {fmtQuantidade(qtyMax, item.casas_decimais_quantidade_item)}
                    </div>
                  </div>
                ) : (
                  <span className="modal-transferir__texto-muted">—</span>
                )}
              </td>
              <td>
                {selecionado && qty > 0 ? (
                  <span
                    className={saldoApos === 0 ? 'modal-transferir__saldo-zero' : 'modal-transferir__saldo-apos'}
                  >
                    {fmtQuantidade(saldoApos ?? 0, item.casas_decimais_quantidade_item)}
                  </span>
                ) : (
                  <span className="modal-transferir__texto-muted">—</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Sub-componente: Configurar Destinos ───────────────────────────────────────

interface ConfigurarDestinosProps {
  cenario: CenarioTransfer
  pedido: Pedido
  destinos: TransferDestino[]
  numeroPedidoNovo: string
  /** Quantidade total selecionada (soma de todos os itens) */
  quantidadeTotal: number
  /** Casas decimais (do primeiro item selecionado ou fallback 2) */
  casasDecimais: number
  pedidosDestinoDisponiveis: Pedido[]
  carregandoPedidosDestino: boolean
  erroPedidosDestino: string | null
  onDestinosChange: (d: TransferDestino[]) => void
  onNumeroPedidoChange: (n: string) => void
}

function ConfigurarDestinos({
  cenario,
  pedido,
  destinos,
  numeroPedidoNovo,
  quantidadeTotal,
  casasDecimais,
  pedidosDestinoDisponiveis,
  carregandoPedidosDestino,
  erroPedidosDestino,
  onDestinosChange,
  onNumeroPedidoChange,
}: ConfigurarDestinosProps) {
  const { t } = useTranslation()
  const casas = casasDecimais
  const atualizarDestino = (idx: number, campo: Partial<TransferDestino>) => {
    const novos = destinos.map((d, i) => (i === idx ? { ...d, ...campo } : d))
    onDestinosChange(novos)
  }

  if (cenario === 'reducao_simples') {
    return (
      <div className="modal-transferir__destinos">
        <div className="modal-transferir__alerta">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {t('pedido.modal_transf.alerta_reducao')}
        </div>
      </div>
    )
  }

  return (
    <div className="modal-transferir__destinos">
      {cenario === 'split_pedido_existente' && carregandoPedidosDestino && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
          <GravityLoader texto="Carregando pedidos…" tamanho="sm" />
        </div>
      )}
      {!(cenario === 'split_pedido_existente' && carregandoPedidosDestino) && destinos.map((destino, idx) => (
        <div key={idx} className="modal-transferir__destino-bloco">
          <div className="modal-transferir__destino-titulo">{t('pedido.modal_transf.destino_titulo')}</div>

          {cenario === 'split_pedido_existente' && (
            <div className="modal-transferir__destino-linha">
              <SelectGlobal
                label={t('pedido.modal_transf.destino_id_label')}
                placeholder={t('pedido.modal_transf.destino_id_placeholder')}
                buscavel
                opcoes={pedidosDestinoDisponiveis.map(p => ({
                  valor: p.id,
                  rotulo: p.numero_pedido,
                  descricao: p.referencia_importador ?? p.referencia_exportador ?? undefined,
                }))}
                valor={destino.pedido_id ?? null}
                aoMudarValor={v => atualizarDestino(idx, { pedido_id: v != null ? String(v) : undefined })}
                obrigatorio
              />
              {erroPedidosDestino && (
                <div className="modal-transferir__alerta" role="alert">
                  <Warning size={14} weight="fill" aria-hidden="true" />
                  {erroPedidosDestino}
                </div>
              )}
            </div>
          )}

          {cenario === 'split_novo_pedido' && (
            <div className="modal-transferir__destino-linha">
              <label className="modal-transferir__label" htmlFor="destino-numero-novo">
                {t('pedido.modal_transf.novo_pedido_label')}
              </label>
              <input
                id="destino-numero-novo"
                type="text"
                className="modal-transferir__input"
                value={numeroPedidoNovo}
                onChange={e => onNumeroPedidoChange(e.target.value)}
                placeholder={t('pedido.modal_transf.novo_pedido_placeholder')}
                aria-required="true"
              />
            </div>
          )}

          {quantidadeTotal > 0 && (
            <div className="modal-transferir__destino-linha">
              <span className="modal-transferir__label">{t('pedido.modal_transf.qty_a_transferir')}</span>
              <span className="modal-transferir__destino-qty-readonly">
                {fmtQuantidade(destino.quantidade, casas)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Sub-componente: Preview de Impacto ────────────────────────────────────────

interface PreviewImpactoProps {
  preview: TransferPreview
}

function PreviewImpacto({ preview }: PreviewImpactoProps) {
  const { t } = useTranslation()

  return (
    <div className="modal-transferir__preview-container">
      <div className="modal-transferir__preview-origem">
        <div className="modal-transferir__preview-titulo">
          <ArrowSquareOut size={18} weight="duotone" aria-hidden="true" className="modal-transferir__preview-icone modal-transferir__preview-icone--origem" />
          <span>{t('pedido.modal_transf.preview_origem')}</span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>{t('pedido.modal_transf.preview_label_pedido')}</span>
          <span className="modal-transferir__preview-valor">{preview.origem.pedido_numero}</span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>{t('pedido.modal_transf.preview_label_item')}</span>
          <span className="modal-transferir__preview-valor">{preview.origem.item_part_number}</span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>{t('pedido.modal_transf.preview_label_qtd_atual')}</span>
          <span className="modal-transferir__preview-valor">
            {fmtQuantidade(preview.origem.quantidade_atual_pedido)}
          </span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>{t('pedido.modal_transf.preview_label_qtd_apos')}</span>
          <span
            className={`modal-transferir__preview-valor modal-transferir__preview-valor--com-icone${preview.origem.encerra ? ' modal-transferir__preview-valor--alerta' : ''}`}
          >
            <ArrowDown size={12} weight="bold" aria-hidden="true" className="modal-transferir__preview-seta-reducao" />
            {fmtQuantidade(preview.origem.quantidade_apos)}
            {preview.origem.encerra && ` ${t('pedido.modal_transf.preview_ficara_zero')}`}
          </span>
        </div>
      </div>

      {preview.destinos.length > 0 && (
        <>
          <div className="modal-transferir__preview-fluxo" aria-hidden="true">
            <CaretDown size={20} weight="bold" />
          </div>
          <div className="modal-transferir__preview-destinos">
            {preview.destinos.map((d, idx) => (
              <div key={idx} className="modal-transferir__preview-destino">
                <div className="modal-transferir__preview-titulo">
                  <ArrowSquareIn size={18} weight="duotone" aria-hidden="true" className="modal-transferir__preview-icone modal-transferir__preview-icone--destino" />
                  <span>{t('pedido.modal_transf.preview_destino_titulo', { n: preview.destinos.length > 1 ? idx + 1 : '' })}</span>
                  {d.tipo === 'novo' ? (
                    <span className="modal-transferir__badge-novo">
                      <PlusCircle size={11} weight="fill" aria-hidden="true" />
                      {t('pedido.modal_transf.badge_novo')}
                    </span>
                  ) : (
                    <span className="modal-transferir__badge-existente">
                      <Database size={11} weight="fill" aria-hidden="true" />
                      {t('pedido.modal_transf.badge_existente')}
                    </span>
                  )}
                </div>
                {d.pedido_numero && (
                  <div className="modal-transferir__preview-linha">
                    <span>{t('pedido.modal_transf.preview_label_pedido')}</span>
                    <span className="modal-transferir__preview-valor">{d.pedido_numero}</span>
                  </div>
                )}
                <div className="modal-transferir__preview-linha">
                  <span>{t('pedido.modal_transf.preview_label_quantidade')}</span>
                  <span className="modal-transferir__preview-valor modal-transferir__preview-valor--positivo">
                    +{fmtQuantidade(d.quantidade)}
                  </span>
                </div>
                {d.alertas.map((a, ai) => (
                  <div key={ai} className="modal-transferir__alerta" role="alert">
                    <Warning size={14} weight="fill" aria-hidden="true" />
                    {a}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {preview.alertas_globais.length > 0 && (
        <div className="modal-transferir__alertas" role="status" aria-live="polite">
          {preview.alertas_globais.map((a, i) => (
            <div key={i} className="modal-transferir__alerta">
              <Warning size={14} weight="fill" aria-hidden="true" />
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Componente Principal ──────────────────────────────────────────────────────

// ── NOMES_PASSOS — definido dentro do componente via useMemo([t]) ─────────────

export function ModalTransferirPedido({ pedidos, itemIdInicial, itensSelecionadosIds, onFechar, onConcluido }: ModalTransferirPedidoProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()

  const NOMES_PASSOS = useMemo<Record<Passo, string>>(() => ({
    1: t('pedido.modal_transf.passo_cenario'),
    2: t('pedido.modal_transf.passo_item'),
    3: t('pedido.modal_transf.passo_destinos'),
    4: t('pedido.modal_transf.passo_preview'),
    5: t('pedido.modal_transf.passo_confirmacao'),
  }), [t])
  const pedido = pedidos[0]

  // ── Multi-pedido: todos os itens de todos os pedidos selecionados ────────────
  const itensComPedido = useMemo<ItemComPedido[]>(() => {
    const resultado: ItemComPedido[] = []
    for (const p of pedidos) {
      for (const item of p.itens) {
        resultado.push({ item, pedido: p })
      }
    }
    return resultado
  }, [pedidos])

  const multiPedido = pedidos.length > 1

  /** Mapa itemId → pedido pai (para lookup no confirm/preview) */
  const itemToPedidoMap = useMemo(() => {
    const mapa = new Map<string, Pedido>()
    for (const { item, pedido: p } of itensComPedido) {
      mapa.set(item.id, p)
    }
    return mapa
  }, [itensComPedido])

  const [passo, setPasso] = useState<Passo>(1)
  const [cenario, setCenario] = useState<CenarioTransfer | null>(null)

  // ── Multi-item: mapa itemId → quantidade ────────────────────────────────────
  const [itensQuantidades, setItensQuantidades] = useState<Map<string, number>>(() => {
    const mapa = new Map<string, number>()
    // Pré-selecionar itens que vieram da lista
    if (itensSelecionadosIds && itensSelecionadosIds.length > 0) {
      for (const id of itensSelecionadosIds) mapa.set(id, 0)
    } else if (itemIdInicial) {
      mapa.set(itemIdInicial, 0)
    } else {
      // Quando pedidos inteiros foram selecionados (sem itens individuais),
      // pré-seleciona todos os itens de todos os pedidos
      for (const p of pedidos) {
        for (const item of p.itens) {
          mapa.set(item.id, 0)
        }
      }
    }
    return mapa
  })

  // Compat: primeiro item selecionado (para preview/destinos que usam single-item)
  const primeiroItemId = useMemo(() => {
    const keys = Array.from(itensQuantidades.keys())
    return keys.length > 0 ? keys[0] : null
  }, [itensQuantidades])

  const [destinos, setDestinos] = useState<TransferDestino[]>([{ tipo: 'existente', quantidade: 0 }])
  const [numeroPedidoNovo, setNumeroPedidoNovo] = useState('')
  const [previews, setPreviews] = useState<TransferPreview[]>([])
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroPreview, setErroPreview] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [erroConfirmar, setErroConfirmar] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)
  const [resultado, setResultado] = useState<TransferResultado | null>(null)
  /** Confirmação explícita do usuário quando pedidos são de tipos diferentes */
  const [confirmarTiposDivergentes, setConfirmarTiposDivergentes] = useState(false)

  /** Lista de pedidos da MESMA tipo_operacao (sem o de origem) — Fase F */
  const [pedidosDestinoDisponiveis, setPedidosDestinoDisponiveis] = useState<Pedido[]>([])
  const [carregandoPedidosDestino, setCarregandoPedidosDestino] = useState(false)
  const [erroPedidosDestino, setErroPedidosDestino] = useState<string | null>(null)

  // Fechar com Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onFechar])

  // Fase F: carrega pedidos elegíveis como destino quando entra no passo 3
  // com cenário split_pedido_existente. Filtra pela mesma tipo_operacao_pedido
  // do pedido de origem e remove o próprio pedido da lista.
  useEffect(() => {
    if (passo !== 3 || cenario !== 'split_pedido_existente' || !pedido) return
    const tipo = pedido.tipo_operacao
    if (!tipo) {
      setErroPedidosDestino(t('pedido.modal_transf.erro_carregar_pedidos'))
      return
    }
    setCarregandoPedidosDestino(true)
    setErroPedidosDestino(null)
    const idsOrigem = new Set(pedidos.map(p => p.id))
    pedidoApi.listar({ tipo_operacao: tipo, limit: '500' })
      .then((res: { data: Pedido[]; total: number }) => {
        const lista = res.data ?? []
        setPedidosDestinoDisponiveis(lista.filter(p => !idsOrigem.has(p.id)))
      })
      .catch((err: unknown) => {
        setPedidosDestinoDisponiveis([])
        setErroPedidosDestino(err instanceof Error ? err.message : t('pedido.modal_transf.erro_carregar_pedidos'))
      })
      .finally(() => setCarregandoPedidosDestino(false))
  }, [passo, cenario, pedido, pedidos, t])

  // ── Handlers multi-item ─────────────────────────────────────────────────────

  const handleToggleItem = useCallback((itemId: string) => {
    setItensQuantidades(prev => {
      const novo = new Map(prev)
      if (novo.has(itemId)) {
        novo.delete(itemId)
      } else {
        novo.set(itemId, 0)
      }
      return novo
    })
  }, [])

  const handleQuantidadeItemChange = useCallback((itemId: string, qty: number) => {
    setItensQuantidades(prev => {
      const novo = new Map(prev)
      novo.set(itemId, qty)
      return novo
    })
  }, [])

  // Soma total das quantidades selecionadas (para destino)
  const quantidadeTotalSelecionada = useMemo(() => {
    let soma = 0
    for (const qty of itensQuantidades.values()) soma += qty
    return soma
  }, [itensQuantidades])

  // Resetar destinos ao mudar cenário — pré-preenche quantidade com o total do passo 2
  const quantidadeTotalRef = React.useRef(quantidadeTotalSelecionada)
  useEffect(() => { quantidadeTotalRef.current = quantidadeTotalSelecionada })

  useEffect(() => {
    if (!cenario) return
    if (cenario === 'reducao_simples') {
      setDestinos([])
    } else {
      setDestinos([{ tipo: cenario === 'split_novo_pedido' ? 'novo' : 'existente', quantidade: quantidadeTotalRef.current }])
    }
  }, [cenario])

  const cenarioInfo = CENARIOS.find(c => c.id === cenario)

  // ── Validações por passo ─────────────────────────────────────────────────────

  const podeProsseguirPasso1 = cenario !== null

  const itemSelecionado = itensComPedido.find(ic => ic.item.id === primeiroItemId)?.item ?? null
  const podeProsseguirPasso2 = itensQuantidades.size > 0 && (() => {
    for (const [id, qty] of itensQuantidades.entries()) {
      const ic = itensComPedido.find(x => x.item.id === id)
      if (!ic || qty <= 0 || qty > ic.item.quantidade_atual_pedido) return false
    }
    return true
  })()

  const podeProsseguirPasso3 = (() => {
    if (!cenario) return false
    if (cenario === 'reducao_simples') return true
    if (!destinos.length) return false
    return destinos.every(d => {
      if (d.quantidade <= 0) return false
      if (cenario === 'split_pedido_existente' && !d.pedido_id?.trim()) return false
      if (cenario === 'split_novo_pedido' && !numeroPedidoNovo.trim()) return false
      return true
    })
  })()

  // ── Buscar preview ────────────────────────────────────────────────────────────

  const buscarPreview = useCallback(async () => {
    if (!cenario || itensQuantidades.size === 0) return

    setCarregandoPreview(true)
    setErroPreview(null)
    setPreviews([])

    try {
      const resultados: TransferPreview[] = []
      for (const [itemIdAtual, qty] of itensQuantidades.entries()) {
        const pedidoDoItem = itemToPedidoMap.get(itemIdAtual)
        if (!pedidoDoItem) continue
        const payload: Omit<TransferPayload, 'numero_pedido_novo'> = {
          cenario,
          pedido_id: pedidoDoItem.id,
          item_id: itemIdAtual,
          quantidade_origem: qty,
          destinos: cenario === 'reducao_simples' ? [] : destinos.map(d => ({ ...d, quantidade: qty })),
        }
        const data = await pedidoTransferirApi.preview(payload)
        resultados.push(data)
      }
      setPreviews(resultados)
    } catch (err: unknown) {
      setErroPreview(err instanceof Error ? err.message : 'Erro ao calcular preview')
    } finally {
      setCarregandoPreview(false)
    }
  }, [cenario, itensQuantidades, itemToPedidoMap, destinos])

  // ── Avanço e retorno de passos ────────────────────────────────────────────────

  const avancar = useCallback(async () => {
    if (passo === 2) {
      // Sincroniza destino.quantidade com a soma total dos itens selecionados
      const total = Array.from(itensQuantidades.values()).reduce((s, q) => s + q, 0)
      setDestinos(prev => prev.map(d => ({ ...d, quantidade: total })))
      setPasso(3)
    } else if (passo === 3) {
      await buscarPreview()
      setPasso(4)
    } else if (passo < 5) {
      setPasso(prev => (prev + 1) as Passo)
    }
  }, [passo, buscarPreview, itensQuantidades])

  const voltar = useCallback(() => {
    if (passo > 1) setPasso(prev => (prev - 1) as Passo)
  }, [passo])

  // ── Confirmar transferência ───────────────────────────────────────────────────

  const handleConfirmar = useCallback(async () => {
    if (!cenario || itensQuantidades.size === 0) return

    setConfirmando(true)
    setErroConfirmar(null)

    const itensArray = Array.from(itensQuantidades.entries())
    let ultimoResultado: TransferResultado | null = null
    let numeroPedidoCriado = numeroPedidoNovo.trim() || undefined

    try {
      for (let idx = 0; idx < itensArray.length; idx++) {
        const [itemIdAtual, qty] = itensArray[idx]
        const pedidoDoItem = itemToPedidoMap.get(itemIdAtual)
        if (!pedidoDoItem) continue

        const payload: TransferPayload = {
          cenario,
          pedido_id: pedidoDoItem.id,
          item_id: itemIdAtual,
          quantidade_origem: qty,
          destinos: cenario === 'reducao_simples' ? [] : destinos.map(d => ({
            ...d,
            quantidade: qty,
            // Após o primeiro item criar o pedido novo, os demais vão para o mesmo pedido
            ...(idx > 0 && cenario === 'split_novo_pedido' && ultimoResultado?.pedidos_criados[0]
              ? { tipo: 'existente' as const, pedido_id: ultimoResultado.pedidos_criados[0] }
              : {}),
          })),
          numero_pedido_novo: idx === 0 ? numeroPedidoCriado : undefined,
        }

        const res = await pedidoTransferirApi.confirmar(payload)
        ultimoResultado = res
      }

      setResultado(ultimoResultado)
      setConcluido(true)
      const totalQty = itensArray.reduce((s, [, q]) => s + q, 0)
      const pedidosEnvolvidos = [...new Set(itensArray.map(([id]) => itemToPedidoMap.get(id)?.numero_pedido).filter(Boolean))]
      addNotification({ type: 'success', message: `Transferência concluída: ${itensArray.length} item(ns), ${totalQty} un. de ${pedidosEnvolvidos.join(', ')} processadas.`, duration: 4000 })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao confirmar transferência'
      setErroConfirmar(msg)
      addNotification({ type: 'error', message: `Falha na transferência: ${msg}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [cenario, itensQuantidades, itemToPedidoMap, destinos, numeroPedidoNovo, addNotification])

  // ── Renderização ──────────────────────────────────────────────────────────────

  // No passo 4: quando há aviso de tipos divergentes, requer confirmação explícita do usuário
  const temAvisoTipo = previews.some(p => p.aviso_tipo_operacao)
  const podeProsseguirPasso4 = previews.length > 0 && !erroPreview &&
    (!temAvisoTipo || confirmarTiposDivergentes)

  const podeProsseguir = (() => {
    if (passo === 1) return podeProsseguirPasso1
    if (passo === 2) return podeProsseguirPasso2
    if (passo === 3) return podeProsseguirPasso3
    if (passo === 4) return podeProsseguirPasso4
    return false
  })()

  if (!pedido) {
    return null
  }

  const PASSOS_TRANSFERIR: PassoConfig[] = useMemo(() => [
    { id: 1, label: t('pedido.modal_transf.passo1_label', { defaultValue: 'Cenário' }) },
    { id: 2, label: t('pedido.modal_transf.passo2_label', { defaultValue: 'Destino' }) },
    { id: 3, label: t('pedido.modal_transf.passo3_label', { defaultValue: 'Quantidades' }) },
    { id: 4, label: t('pedido.modal_transf.passo4_label', { defaultValue: 'Revisão' }) },
    { id: 5, label: t('pedido.modal_transf.passo5_label', { defaultValue: 'Confirmação' }) },
  ], [t])

  const footerTransferir = concluido ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <BotaoGlobal
        variante="primario"
        tamanho="medio"
        onClick={onConcluido}
      >
        {t('pedido.modal_transf.fechar')}
      </BotaoGlobal>
    </div>
  ) : (
    <>
      <BotaoGlobal
        variante="secundario"
        tamanho="medio"
        onClick={passo === 1 ? onFechar : voltar}
        disabled={confirmando}
      >
        {passo === 1 ? t('pedido.modal_transf.cancelar') : t('pedido.modal_transf.voltar')}
      </BotaoGlobal>

      <div className="modal-transferir__footer-direita">
        {passo === 5 ? (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleConfirmar}
            disabled={confirmando}
            aria-busy={confirmando}
          >
            {confirmando ? t('pedido.modal_transf.transferindo') : t('pedido.modal_transf.confirmar')}
          </BotaoGlobal>
        ) : (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={avancar}
            disabled={!podeProsseguir || carregandoPreview}
          >
            {passo === 4 ? t('pedido.modal_transf.revisar_confirmar') : t('pedido.modal_transf.proximo')}
          </BotaoGlobal>
        )}
      </div>
    </>
  )

  return (
    <ModalPassoPassoGlobal
      titulo={t('pedido.modal_transf.titulo', { numero: multiPedido ? pedidos.map(p => p.numero_pedido).join(', ') : pedido.numero_pedido })}
      icone={<ArrowSquareOut size={20} weight="duotone" />}
      subtitulo={t('pedido.modal_transf.subtitulo')}
      aberto={true}
      passos={PASSOS_TRANSFERIR}
      passoAtual={passo}
      onProximo={() => {}}
      onVoltar={() => {}}
      onFechar={onFechar}
      tamanho={multiPedido ? '2xl' : 'xl'}
      ocultarStepper={concluido}
      footerCustom={footerTransferir}
    >
        {/* Corpo */}
        <div className="modal-transferir__corpo">
          {concluido ? (
            <div className="modal-transferir__resultado" role="status" aria-live="polite">
              {/* Banner de sucesso */}
              <div className="modal-transferir__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-transferir__icone-sucesso" />
                <p className="modal-transferir__resultado-texto">
                  {t('pedido.modal_transf.resultado_titulo')}
                </p>
              </div>

              {/* Seção: Origem */}
              <div className="modal-transferir__secao-titulo">
                <ArrowSquareOut size={14} weight="duotone" className="modal-transferir__secao-icone" />
                {t('pedido.modal_transf.secao_origem_resultado')}
              </div>
              <ul className="modal-transferir__lista-resultado">
                <li className="modal-transferir__item-resultado">
                  <span className="modal-transferir__resultado-label">{t('pedido.modal_transf.sucesso_label_cenario')}</span>
                  <span className="modal-transferir__resultado-valor">{cenarioInfo ? t(cenarioInfo.nomeKey) : ''}</span>
                </li>
                <li className="modal-transferir__item-resultado">
                  <span className="modal-transferir__resultado-label">{t('pedido.modal_transf.preview_label_pedido')}</span>
                  <span className="modal-transferir__resultado-valor">
                    {multiPedido ? pedidos.map(p => p.numero_pedido).join(', ') : pedido.numero_pedido}
                  </span>
                </li>
                {itensQuantidades.size > 0 && (
                  <li className="modal-transferir__item-resultado">
                    <span className="modal-transferir__resultado-label">{t('pedido.modal_transf.sucesso_label_item')}</span>
                    <span className="modal-transferir__resultado-valor">
                      {itensQuantidades.size === 1
                        ? (itensComPedido.find(ic => ic.item.id === primeiroItemId)?.item.part_number ?? '—')
                        : `${itensQuantidades.size} itens`
                      }
                    </span>
                  </li>
                )}
                <li className="modal-transferir__item-resultado">
                  <span className="modal-transferir__resultado-label">{t('pedido.modal_transf.sucesso_label_qtd')}</span>
                  <span className="modal-transferir__resultado-valor">
                    {fmtQuantidade(quantidadeTotalSelecionada, itemSelecionado?.casas_decimais_quantidade_item)}
                  </span>
                </li>
              </ul>

              {/* Seção: Destino (quando aplicável) */}
              {resultado && (resultado.pedidos_criados.length > 0 || resultado.pedidos_destino_ids.length > 0) && (
                <>
                  <div className="modal-transferir__secao-titulo">
                    <ArrowSquareIn size={14} weight="duotone" className="modal-transferir__secao-icone" />
                    {t('pedido.modal_transf.secao_destino_resultado')}
                  </div>
                  <ul className="modal-transferir__lista-resultado">
                    {resultado.pedidos_criados.length > 0 && (
                      <li className="modal-transferir__item-resultado">
                        <span className="modal-transferir__resultado-label">{t('pedido.modal_transf.sucesso_label_novo_pedido')}</span>
                        <span className="modal-transferir__resultado-valor">
                          {numeroPedidoNovo || resultado.pedidos_criados[0]}
                        </span>
                      </li>
                    )}
                    {resultado.pedidos_destino_ids.length > 0 && resultado.pedidos_criados.length === 0 && (
                      <li className="modal-transferir__item-resultado">
                        <span className="modal-transferir__resultado-label">{t('pedido.modal_transf.sucesso_label_destino')}</span>
                        <span className="modal-transferir__resultado-valor">
                          {t('pedido.modal_transf.sucesso_atualizado', { count: resultado.pedidos_destino_ids.length })}
                        </span>
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Passo 1: Cenário */}
              {passo === 1 && (
                <SeletorCenario
                  cenarioSelecionado={cenario}
                  onChange={setCenario}
                />
              )}

              {/* Passo 2: Item e Quantidade (multi-select) */}
              {passo === 2 && (
                <SeletorItemQuantidade
                  itensComPedido={itensComPedido}
                  itensQuantidades={itensQuantidades}
                  onToggleItem={handleToggleItem}
                  onQuantidadeChange={handleQuantidadeItemChange}
                  multiPedido={multiPedido}
                />
              )}

              {/* Passo 3: Destinos */}
              {passo === 3 && cenario && (
                <ConfigurarDestinos
                  cenario={cenario}
                  pedido={pedido}
                  destinos={destinos}
                  numeroPedidoNovo={numeroPedidoNovo}
                  quantidadeTotal={quantidadeTotalSelecionada}
                  casasDecimais={itemSelecionado?.casas_decimais_quantidade_item ?? 2}
                  pedidosDestinoDisponiveis={pedidosDestinoDisponiveis}
                  carregandoPedidosDestino={carregandoPedidosDestino}
                  erroPedidosDestino={erroPedidosDestino}
                  onDestinosChange={setDestinos}
                  onNumeroPedidoChange={setNumeroPedidoNovo}
                />
              )}

              {/* Passo 4: Preview (multi-item) */}
              {passo === 4 && (
                carregandoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }} aria-live="polite">
                    <GravityLoader texto={t('pedido.modal_transf.calculando')} tamanho="sm" />
                  </div>
                ) : erroPreview ? (
                  <div className="modal-transferir__erro" role="alert">
                    <Warning size={16} weight="fill" aria-hidden="true" />
                    {erroPreview}
                  </div>
                ) : previews.length > 0 ? (
                  <div className="modal-transferir__preview-wrapper">
                    {/* Banner: aviso de tipo de operação diferente */}
                    {temAvisoTipo && (
                      <div className="modal-transferir__aviso-tipos">
                        <Warning weight="duotone" size={18} className="modal-transferir__aviso-tipos-icone" />
                        <div>
                          <p className="modal-transferir__aviso-tipos-titulo">
                            {t('pedido.modal_transf.aviso_tipos_titulo')}
                          </p>
                          <p className="modal-transferir__aviso-tipos-msg">
                            {t('pedido.modal_transf.aviso_tipos_msg')}
                          </p>
                        </div>
                      </div>
                    )}
                    {previews.map((prev, idx) => (
                      <PreviewImpacto key={idx} preview={prev} />
                    ))}
                    {/* Checkbox de confirmação explícita quando há divergência de tipos */}
                    {temAvisoTipo && (
                      <label className="modal-transferir__confirmacao-tipos">
                        <input
                          type="checkbox"
                          checked={confirmarTiposDivergentes}
                          onChange={e => setConfirmarTiposDivergentes(e.target.checked)}
                          className="modal-transferir__confirmacao-tipos-check"
                        />
                        {t('pedido.modal_transf.confirm_tipos_divergentes')}
                      </label>
                    )}
                  </div>
                ) : null
              )}

              {/* Passo 5: Confirmação */}
              {passo === 5 && (
                <div className="modal-transferir__confirmacao-bloco">
                  <div className="modal-transferir__alerta modal-transferir__alerta--confirmacao">
                    <ArrowRight size={14} weight="bold" aria-hidden="true" />
                    {cenarioInfo?.reversivel
                      ? t('pedido.modal_transf.passo5_reversivel')
                      : t('pedido.modal_transf.passo5_irreversivel')}
                  </div>
                  {previews.map((prev, idx) => (
                    <PreviewImpacto key={idx} preview={prev} />
                  ))}
                  {erroConfirmar && (
                    <div className="modal-transferir__erro" role="alert">
                      <Warning size={16} weight="fill" aria-hidden="true" />
                      {erroConfirmar}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

    </ModalPassoPassoGlobal>
  )
}

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
import {
  Warning,
  Spinner,
  CheckCircle,
  ArrowRight,
  ArrowSquareOut,
  ArrowSquareIn,
  CaretDown,
  Database,
  PlusCircle,
  ArrowDown,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
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
  icone: string
  reversivel: boolean
  criaDestinos: boolean
}

const CENARIOS: CenarioInfo[] = [
  {
    id: 'reducao_simples',
    nomeKey: 'pedido.modal_transf.cenario_reducao_nome',
    descricaoKey: 'pedido.modal_transf.cenario_reducao_desc',
    icone: '↓',
    reversivel: false,
    criaDestinos: false,
  },
  {
    id: 'split_novo_pedido',
    nomeKey: 'pedido.modal_transf.cenario_split_novo_nome',
    descricaoKey: 'pedido.modal_transf.cenario_split_novo_desc',
    icone: '✂',
    reversivel: true,
    criaDestinos: true,
  },
  {
    id: 'split_pedido_existente',
    nomeKey: 'pedido.modal_transf.cenario_split_exist_nome',
    descricaoKey: 'pedido.modal_transf.cenario_split_exist_desc',
    icone: '→',
    reversivel: true,
    criaDestinos: true,
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalTransferirPedidoProps {
  pedidos: Pedido[]
  itemIdInicial?: string
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
  const [aberto, setAberto] = React.useState(false)
  const [listaPos, setListaPos] = React.useState<{ top: number; left: number; width: number } | null>(null)
  const selecionado = cenarioSelecionado ? CENARIOS.find(c => c.id === cenarioSelecionado) : null
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Calcular posição do trigger para fixar a lista fora do overflow
  const abrirLista = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setListaPos({ top: rect.bottom + 2, left: rect.left, width: rect.width })
    }
    setAberto(v => !v)
  }

  // Fechar ao clicar fora
  useEffect(() => {
    const onClickFora = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    if (aberto) document.addEventListener('mousedown', onClickFora)
    return () => document.removeEventListener('mousedown', onClickFora)
  }, [aberto])

  return (
    <div className="modal-transferir__cenario-select-wrapper" ref={wrapperRef}>
      <label className="modal-transferir__label" id="cenario-select-label">
        {t('pedido.modal_transf.cenario_tipo_label')}
      </label>
      <button
        ref={triggerRef}
        type="button"
        className={`modal-transferir__dropdown-trigger${aberto ? ' modal-transferir__dropdown-trigger--aberto' : ''}`}
        onClick={abrirLista}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-labelledby="cenario-select-label"
      >
        <span className={selecionado ? '' : 'modal-transferir__dropdown-placeholder'}>
          {selecionado ? t(selecionado.nomeKey) : t('pedido.modal_transf.cenario_placeholder')}
        </span>
        <svg className="modal-transferir__dropdown-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {aberto && listaPos && (
        <ul
          className="modal-transferir__dropdown-lista"
          role="listbox"
          aria-labelledby="cenario-select-label"
          style={{ position: 'fixed', top: listaPos.top, left: listaPos.left, width: listaPos.width }}
        >
          {CENARIOS.map(c => (
            <li
              key={c.id}
              role="option"
              aria-selected={c.id === cenarioSelecionado}
              className={`modal-transferir__dropdown-item${c.id === cenarioSelecionado ? ' modal-transferir__dropdown-item--selecionado' : ''}`}
              onClick={() => { onChange(c.id); setAberto(false) }}
            >
              <span className="modal-transferir__dropdown-item-nome">{t(c.nomeKey)}</span>
              <span className="modal-transferir__dropdown-item-desc">{t(c.descricaoKey)}</span>
            </li>
          ))}
        </ul>
      )}

      {selecionado && (
        <p className="modal-transferir__cenario-descricao-inline">
          {t(selecionado.descricaoKey)}
          {!selecionado.reversivel && (
            <span className="modal-transferir__badge-irreversivel"> {t('pedido.modal_transf.badge_irreversivel')}</span>
          )}
        </p>
      )}
    </div>
  )
}

// ── Sub-componente: Seletor de Item e Quantidade ──────────────────────────────

interface SeletorItemQuantidadeProps {
  pedido: Pedido
  itemId: string | null
  quantidadeOrigem: number
  onItemChange: (itemId: string) => void
  onQuantidadeChange: (qty: number) => void
}

function SeletorItemQuantidade({
  pedido,
  itemId,
  quantidadeOrigem,
  onItemChange,
  onQuantidadeChange,
}: SeletorItemQuantidadeProps) {
  const { t } = useTranslation()
  const itemSelecionado = pedido.itens.find(i => i.id === itemId)
  const qtyMax = itemSelecionado?.quantidade_atual_pedido ?? 0
  const qtyInvalida = quantidadeOrigem > qtyMax || quantidadeOrigem <= 0

  return (
    <table className="modal-transferir__tabela-itens" aria-label={t('pedido.modal_transf.aria_tabela_itens')}>
      <thead>
        <tr>
          <th scope="col">{t('pedido.modal_transf.col_part_number')}</th>
          <th scope="col">{t('pedido.modal_transf.col_descricao')}</th>
          <th scope="col">{t('pedido.modal_transf.col_saldo')}</th>
          <th scope="col">{t('pedido.modal_transf.col_qty_transfer')}</th>
          <th scope="col">{t('pedido.modal_transf.col_saldo_apos')}</th>
        </tr>
      </thead>
      <tbody>
        {pedido.itens.map(item => {
          const selecionado = item.id === itemId
          const saldoApos = selecionado
            ? Math.max(0, item.quantidade_atual_pedido - (quantidadeOrigem || 0))
            : null
          return (
            <tr
              key={item.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onItemChange(item.id)}
              aria-selected={selecionado}
            >
              <td>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="item-origem"
                    checked={selecionado}
                    onChange={() => onItemChange(item.id)}
                    aria-label={`Selecionar item ${item.part_number}`}
                    onClick={e => e.stopPropagation()}
                  />
                  <strong>{item.part_number}</strong>
                </label>
              </td>
              <td>{item.descricao_item}</td>
              <td>{fmtQuantidade(item.quantidade_atual_pedido, item.casas_decimais_quantidade_item)}</td>
              <td onClick={e => e.stopPropagation()}>
                {selecionado ? (
                  <div>
                    <input
                      type="number"
                      className={`modal-transferir__input-qty${qtyInvalida ? ' modal-transferir__input-qty--erro' : ''}`}
                      value={quantidadeOrigem || ''}
                      min={0.001}
                      max={qtyMax}
                      step={0.001}
                      onChange={e => onQuantidadeChange(parseFloat(e.target.value) || 0)}
                      aria-label={t('pedido.modal_transf.aria_qtd_transferir')}
                      aria-invalid={qtyInvalida}
                    />
                    <div className="modal-transferir__qty-disponivel">
                      {t('pedido.modal_transf.max_label')} {fmtQuantidade(qtyMax, item.casas_decimais_quantidade_item)}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-text-muted, #64748b)' }}>—</span>
                )}
              </td>
              <td>
                {selecionado && quantidadeOrigem > 0 ? (
                  <span
                    className={saldoApos === 0 ? 'modal-transferir__saldo-zero' : 'modal-transferir__saldo-apos'}
                  >
                    {fmtQuantidade(saldoApos ?? 0, item.casas_decimais_quantidade_item)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-text-muted, #64748b)' }}>—</span>
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
  itemSelecionado: PedidoItem | undefined
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
  itemSelecionado,
  pedidosDestinoDisponiveis,
  carregandoPedidosDestino,
  erroPedidosDestino,
  onDestinosChange,
  onNumeroPedidoChange,
}: ConfigurarDestinosProps) {
  const { t } = useTranslation()
  const saldoAtual = itemSelecionado?.quantidade_atual_pedido ?? 0
  const casas = itemSelecionado?.casas_decimais_quantidade_item ?? 2
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
      {destinos.map((destino, idx) => (
        <div key={idx} className="modal-transferir__destino-bloco">
          <div className="modal-transferir__destino-titulo">{t('pedido.modal_transf.destino_titulo')}</div>

          {cenario === 'split_pedido_existente' && (
            <div className="modal-transferir__destino-linha">
              <SelectGlobal
                label={t('pedido.modal_transf.destino_id_label')}
                placeholder={t('pedido.modal_transf.destino_id_placeholder')}
                buscavel
                carregando={carregandoPedidosDestino}
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

          {itemSelecionado && (
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

export function ModalTransferirPedido({ pedidos, itemIdInicial, onFechar, onConcluido }: ModalTransferirPedidoProps) {
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

  const [passo, setPasso] = useState<Passo>(1)
  const [cenario, setCenario] = useState<CenarioTransfer | null>(null)
  const [itemId, setItemId] = useState<string | null>(itemIdInicial ?? null)
  const [quantidadeOrigem, setQuantidadeOrigem] = useState<number>(0)
  const [destinos, setDestinos] = useState<TransferDestino[]>([{ tipo: 'existente', quantidade: 0 }])
  const [numeroPedidoNovo, setNumeroPedidoNovo] = useState('')
  const [preview, setPreview] = useState<TransferPreview | null>(null)
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
    pedidoApi.listar({ tipo_operacao: tipo, limit: '500' })
      .then((res: { data: Pedido[]; total: number }) => {
        const lista = res.data ?? []
        setPedidosDestinoDisponiveis(lista.filter(p => p.id !== pedido.id))
      })
      .catch((err: unknown) => {
        setPedidosDestinoDisponiveis([])
        setErroPedidosDestino(err instanceof Error ? err.message : t('pedido.modal_transf.erro_carregar_pedidos'))
      })
      .finally(() => setCarregandoPedidosDestino(false))
  }, [passo, cenario, pedido, t])

  // Resetar destinos ao mudar cenário — pré-preenche quantidade com o valor do passo 2
  // Nota: quantidadeOrigemRef captura o valor atual sem re-executar o efeito quando ela muda,
  // evitando que edições manuais no passo 3 sejam sobrescritas.
  const quantidadeOrigemRef = React.useRef(quantidadeOrigem)
  useEffect(() => { quantidadeOrigemRef.current = quantidadeOrigem })

  useEffect(() => {
    if (!cenario) return
    if (cenario === 'reducao_simples') {
      setDestinos([])
    } else {
      setDestinos([{ tipo: cenario === 'split_novo_pedido' ? 'novo' : 'existente', quantidade: quantidadeOrigemRef.current }])
    }
  }, [cenario])

  const cenarioInfo = CENARIOS.find(c => c.id === cenario)

  // ── Validações por passo ─────────────────────────────────────────────────────

  const podeProsseguirPasso1 = cenario !== null

  const itemSelecionado = pedido?.itens.find(i => i.id === itemId)
  const podeProsseguirPasso2 = !!itemId && quantidadeOrigem > 0 && quantidadeOrigem <= (itemSelecionado?.quantidade_atual_pedido ?? 0)

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
    if (!cenario || !itemId || !pedido) return

    setCarregandoPreview(true)
    setErroPreview(null)
    setPreview(null)

    const payload: Omit<TransferPayload, 'numero_pedido_novo'> = {
      cenario,
      pedido_id: pedido.id,
      item_id: itemId,
      quantidade_origem: quantidadeOrigem,
      destinos: cenario === 'reducao_simples' ? [] : destinos,
    }

    try {
      const data = await pedidoTransferirApi.preview(payload)
      setPreview(data)
    } catch (err: unknown) {
      setErroPreview(err instanceof Error ? err.message : 'Erro ao calcular preview')
    } finally {
      setCarregandoPreview(false)
    }
  }, [cenario, itemId, pedido, quantidadeOrigem, destinos])

  // ── Avanço e retorno de passos ────────────────────────────────────────────────

  const avancar = useCallback(async () => {
    if (passo === 2) {
      // Sincroniza destino.quantidade com o valor confirmado no passo 2
      setDestinos(prev => prev.map(d => ({ ...d, quantidade: quantidadeOrigem })))
      setPasso(3)
    } else if (passo === 3) {
      await buscarPreview()
      setPasso(4)
    } else if (passo < 5) {
      setPasso(prev => (prev + 1) as Passo)
    }
  }, [passo, buscarPreview, quantidadeOrigem])

  const voltar = useCallback(() => {
    if (passo > 1) setPasso(prev => (prev - 1) as Passo)
  }, [passo])

  // ── Confirmar transferência ───────────────────────────────────────────────────

  const handleConfirmar = useCallback(async () => {
    if (!cenario || !itemId || !pedido) return

    setConfirmando(true)
    setErroConfirmar(null)

    const payload: TransferPayload = {
      cenario,
      pedido_id: pedido.id,
      item_id: itemId,
      quantidade_origem: quantidadeOrigem,
      destinos: cenario === 'reducao_simples' ? [] : destinos,
      numero_pedido_novo: numeroPedidoNovo.trim() || undefined,
    }

    try {
      const res = await pedidoTransferirApi.confirmar(payload)
      setResultado(res)
      setConcluido(true)
      addNotification({ type: 'success', message: `Transferência concluída: ${quantidadeOrigem} un. de ${pedido.numero_pedido} processadas.`, duration: 4000 })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao confirmar transferência'
      setErroConfirmar(msg)
      addNotification({ type: 'error', message: `Falha na transferência: ${msg}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [cenario, itemId, pedido, quantidadeOrigem, destinos, numeroPedidoNovo, addNotification])

  // ── Renderização ──────────────────────────────────────────────────────────────

  // No passo 4: quando há aviso de tipos divergentes, requer confirmação explícita do usuário
  const podeProsseguirPasso4 = !!preview && !erroPreview &&
    (!preview.aviso_tipo_operacao || confirmarTiposDivergentes)

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

  return (
    <div
      className="modal-transferir__overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-transferir-titulo"
    >
      <div className="modal-transferir__container">
        {/* Header */}
        <div className="modal-transferir__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowSquareOut size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 id="modal-transferir-titulo" className="modal-transferir__titulo">
                {t('pedido.modal_transf.titulo', { numero: pedido.numero_pedido })}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Mova itens entre pedidos da mesma organização</p>
          </div>
          <button
            className="modal-transferir__fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_transf.aria_fechar')}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Indicador de passos */}
        {!concluido && (
          <div className="modal-transferir__passos" aria-label={t('pedido.modal_transf.aria_progresso')}>
            {([1, 2, 3, 4, 5] as Passo[]).map((p, idx) => (
              <React.Fragment key={p}>
                {idx > 0 && (
                  <div className="modal-transferir__passo-separador" aria-hidden="true" />
                )}
                <div
                  className={`modal-transferir__passo${
                    p === passo ? ' modal-transferir__passo--ativo' : ''
                  }${p < passo ? ' modal-transferir__passo--concluido' : ''}`}
                  aria-current={p === passo ? 'step' : undefined}
                >
                  <span className="modal-transferir__passo-numero" aria-hidden="true">
                    {p < passo ? '✓' : p}
                  </span>
                  {NOMES_PASSOS[p]}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Corpo */}
        <div className="modal-transferir__corpo">
          {concluido ? (
            <div className="modal-transferir__sucesso" role="status" aria-live="polite">
              <CheckCircle size={48} weight="fill" aria-hidden="true" />
              <div className="modal-transferir__sucesso-titulo">{t('pedido.modal_transf.sucesso_titulo')}</div>
              <div className="modal-transferir__sucesso-descricao">
                {t('pedido.modal_transf.sucesso_desc', { cenario: cenarioInfo ? t(cenarioInfo.nomeKey) : '' })}
              </div>
              <div className="modal-transferir__sucesso-detalhes">
                <div className="modal-transferir__preview-linha">
                  <span>{t('pedido.modal_transf.sucesso_label_cenario')}</span>
                  <span className="modal-transferir__preview-valor">{cenarioInfo ? t(cenarioInfo.nomeKey) : ''}</span>
                </div>
                {itemSelecionado && (
                  <div className="modal-transferir__preview-linha">
                    <span>{t('pedido.modal_transf.sucesso_label_item')}</span>
                    <span className="modal-transferir__preview-valor">{itemSelecionado.part_number}</span>
                  </div>
                )}
                <div className="modal-transferir__preview-linha">
                  <span>{t('pedido.modal_transf.sucesso_label_qtd')}</span>
                  <span className="modal-transferir__preview-valor">
                    {fmtQuantidade(quantidadeOrigem, itemSelecionado?.casas_decimais_quantidade_item)}
                  </span>
                </div>
                {resultado && resultado.pedidos_criados.length > 0 && (
                  <div className="modal-transferir__preview-linha">
                    <span>{t('pedido.modal_transf.sucesso_label_novo_pedido')}</span>
                    <span className="modal-transferir__preview-valor">
                      {numeroPedidoNovo || resultado.pedidos_criados[0]}
                    </span>
                  </div>
                )}
                {resultado && resultado.pedidos_destino_ids.length > 0 && resultado.pedidos_criados.length === 0 && (
                  <div className="modal-transferir__preview-linha">
                    <span>{t('pedido.modal_transf.sucesso_label_destino')}</span>
                    <span className="modal-transferir__preview-valor">
                      {t('pedido.modal_transf.sucesso_atualizado', { count: resultado.pedidos_destino_ids.length })}
                    </span>
                  </div>
                )}
              </div>
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

              {/* Passo 2: Item e Quantidade */}
              {passo === 2 && (
                <SeletorItemQuantidade
                  pedido={pedido}
                  itemId={itemId}
                  quantidadeOrigem={quantidadeOrigem}
                  onItemChange={id => {
                    setItemId(id)
                    setQuantidadeOrigem(0)
                  }}
                  onQuantidadeChange={setQuantidadeOrigem}
                />
              )}

              {/* Passo 3: Destinos */}
              {passo === 3 && cenario && (
                <ConfigurarDestinos
                  cenario={cenario}
                  pedido={pedido}
                  destinos={destinos}
                  numeroPedidoNovo={numeroPedidoNovo}
                  itemSelecionado={itemSelecionado}
                  pedidosDestinoDisponiveis={pedidosDestinoDisponiveis}
                  carregandoPedidosDestino={carregandoPedidosDestino}
                  erroPedidosDestino={erroPedidosDestino}
                  onDestinosChange={setDestinos}
                  onNumeroPedidoChange={setNumeroPedidoNovo}
                />
              )}

              {/* Passo 4: Preview */}
              {passo === 4 && (
                carregandoPreview ? (
                  <div className="modal-transferir__loading" aria-live="polite">
                    <Spinner size={24} className="modal-transferir__spinner" aria-hidden="true" />
                    <span>{t('pedido.modal_transf.calculando')}</span>
                  </div>
                ) : erroPreview ? (
                  <div className="modal-transferir__erro" role="alert">
                    <Warning size={16} weight="fill" aria-hidden="true" />
                    {erroPreview}
                  </div>
                ) : preview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Banner: aviso de tipo de operação diferente (campo Onda C) */}
                    {preview.aviso_tipo_operacao && (
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'color-mix(in srgb, var(--warning) 8%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        <Warning weight="duotone" size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                            {t('pedido.modal_transf.aviso_tipos_titulo')}
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                            {t('pedido.modal_transf.aviso_tipos_msg')}
                          </p>
                        </div>
                      </div>
                    )}
                    <PreviewImpacto preview={preview} />
                    {/* Checkbox de confirmação explícita quando há divergência de tipos */}
                    {preview.aviso_tipo_operacao && (
                      <label style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                        cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)',
                      }}>
                        <input
                          type="checkbox"
                          checked={confirmarTiposDivergentes}
                          onChange={e => setConfirmarTiposDivergentes(e.target.checked)}
                          style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        {t('pedido.modal_transf.confirm_tipos_divergentes')}
                      </label>
                    )}
                  </div>
                ) : null
              )}

              {/* Passo 5: Confirmação */}
              {passo === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="modal-transferir__alerta" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', background: 'color-mix(in srgb, var(--accent) 7%, transparent)', color: 'var(--text-primary)' }}>
                    <ArrowRight size={14} weight="bold" aria-hidden="true" />
                    {cenarioInfo?.reversivel
                      ? t('pedido.modal_transf.passo5_reversivel')
                      : t('pedido.modal_transf.passo5_irreversivel')}
                  </div>
                  {preview && <PreviewImpacto preview={preview} />}
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

        {/* Footer */}
        <div className="modal-transferir__footer">
          {concluido ? (
            <span />
          ) : (
            <BotaoGlobal
              variante="secundario"
              tamanho="medio"
              onClick={passo === 1 ? onFechar : voltar}
              disabled={confirmando}
            >
              {passo === 1 ? t('pedido.modal_transf.cancelar') : t('pedido.modal_transf.voltar')}
            </BotaoGlobal>
          )}

          <div className="modal-transferir__footer-direita">
            {concluido ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={onConcluido}
              >
                {t('pedido.modal_transf.fechar')}
              </BotaoGlobal>
            ) : passo === 5 ? (
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
        </div>
      </div>
    </div>
  )
}

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

import React, { useState, useEffect, useCallback } from 'react'
import { Warning, Spinner, CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
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
import { pedidoTransferirApi } from '../shared/api'
import { fmtQuantidade } from '../shared/types'

// ── Definição de Cenários ─────────────────────────────────────────────────────

interface CenarioInfo {
  id: CenarioTransfer
  nome: string
  descricao: string
  icone: string
  reversivel: boolean
  criaDestinos: boolean
}

const CENARIOS: CenarioInfo[] = [
  {
    id: 'reducao_simples',
    nome: 'Redução Simples',
    descricao: 'Cancela a diferença — quantidade reduzida sem destino.',
    icone: '↓',
    reversivel: false,
    criaDestinos: false,
  },
  {
    id: 'split_novo_pedido',
    nome: 'Split → Novo Pedido',
    descricao: 'Diferença vira um novo pedido com número definido.',
    icone: '✂',
    reversivel: true,
    criaDestinos: true,
  },
  {
    id: 'split_pedido_existente',
    nome: 'Split → Pedido Existente',
    descricao: 'Diferença vai para um pedido que já existe.',
    icone: '→',
    reversivel: true,
    criaDestinos: true,
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalTransferirProps {
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
  const selecionado = cenarioSelecionado ? CENARIOS.find(c => c.id === cenarioSelecionado) : null

  return (
    <div className="modal-transferir__cenario-select-wrapper">
      <label className="modal-transferir__label" htmlFor="cenario-select">
        Tipo de transferência
      </label>
      <select
        id="cenario-select"
        className="modal-transferir__select"
        value={cenarioSelecionado ?? ''}
        onChange={e => onChange(e.target.value as CenarioTransfer)}
        aria-label="Selecione o tipo de transferência"
      >
        <option value="" disabled>Selecione...</option>
        {CENARIOS.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>
      {selecionado && (
        <p className="modal-transferir__cenario-descricao-inline">
          {selecionado.descricao}
          {!selecionado.reversivel && (
            <span className="modal-transferir__badge-irreversivel"> · Irreversível</span>
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
  const itemSelecionado = pedido.itens.find(i => i.id === itemId)
  const qtyMax = itemSelecionado?.saldo_item_pedido ?? 0
  const qtyInvalida = quantidadeOrigem > qtyMax || quantidadeOrigem <= 0

  return (
    <table className="modal-transferir__tabela-itens" aria-label="Itens do pedido de origem">
      <thead>
        <tr>
          <th scope="col">Part Number</th>
          <th scope="col">Descrição</th>
          <th scope="col">Qty Atual</th>
          <th scope="col">Qty a Transferir</th>
        </tr>
      </thead>
      <tbody>
        {pedido.itens.map(item => {
          const selecionado = item.id === itemId
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
              <td>{fmtQuantidade(item.saldo_item_pedido, item.casas_decimais_quantidade_item)}</td>
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
                      aria-label="Quantidade a transferir"
                      aria-invalid={qtyInvalida}
                    />
                    <div className="modal-transferir__qty-disponivel">
                      Máx: {fmtQuantidade(qtyMax, item.casas_decimais_quantidade_item)}
                    </div>
                  </div>
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
  onDestinosChange: (d: TransferDestino[]) => void
  onNumeroPedidoChange: (n: string) => void
}

function ConfigurarDestinos({
  cenario,
  pedido,
  destinos,
  numeroPedidoNovo,
  itemSelecionado,
  onDestinosChange,
  onNumeroPedidoChange,
}: ConfigurarDestinosProps) {
  const saldoAtual = itemSelecionado?.saldo_item_pedido ?? 0
  const casas = itemSelecionado?.casas_decimais_quantidade_item ?? 2
  const atualizarDestino = (idx: number, campo: Partial<TransferDestino>) => {
    const novos = destinos.map((d, i) => (i === idx ? { ...d, ...campo } : d))
    onDestinosChange(novos)
  }

  // Redução simples — sem destino
  if (cenario === 'reducao_simples') {
    return (
      <div className="modal-transferir__destinos">
        <div className="modal-transferir__alerta">
          <Warning size={14} weight="fill" aria-hidden="true" />
          A quantidade será cancelada sem destino. Esta operação não é reversível.
        </div>
      </div>
    )
  }

  return (
    <div className="modal-transferir__destinos">
      {destinos.map((destino, idx) => (
        <div key={idx} className="modal-transferir__destino-bloco">
          <div className="modal-transferir__destino-titulo">Destino</div>

          {/* ID do pedido existente */}
          {cenario === 'split_pedido_existente' && (
            <div className="modal-transferir__destino-linha">
              <label className="modal-transferir__label" htmlFor={`destino-pedido-id-${idx}`}>
                Número ou ID do pedido destino
              </label>
              <input
                id={`destino-pedido-id-${idx}`}
                type="text"
                className="modal-transferir__input"
                value={destino.pedido_id ?? ''}
                onChange={e => atualizarDestino(idx, { pedido_id: e.target.value })}
                placeholder="Ex: PO-2026/001"
                aria-required="true"
              />
            </div>
          )}

          {/* Número do novo pedido */}
          {cenario === 'split_novo_pedido' && (
            <div className="modal-transferir__destino-linha">
              <label className="modal-transferir__label" htmlFor="destino-numero-novo">
                Número do novo pedido
              </label>
              <input
                id="destino-numero-novo"
                type="text"
                className="modal-transferir__input"
                value={numeroPedidoNovo}
                onChange={e => onNumeroPedidoChange(e.target.value)}
                placeholder="Ex: PO-2026/002"
                aria-required="true"
              />
            </div>
          )}

          {/* Quantidade */}
          <div className="modal-transferir__destino-linha">
            <label className="modal-transferir__label" htmlFor={`destino-qty-${idx}`}>
              Quantidade
            </label>
            <input
              id={`destino-qty-${idx}`}
              type="number"
              className="modal-transferir__input"
              value={destino.quantidade || ''}
              min={0.001}
              step={0.001}
              onChange={e => atualizarDestino(idx, { quantidade: parseFloat(e.target.value) || 0 })}
              aria-required="true"
            />
            {itemSelecionado && (
              <div className="modal-transferir__qty-disponivel">
                Saldo após: {fmtQuantidade(Math.max(0, saldoAtual - destino.quantidade), casas)}
              </div>
            )}
          </div>
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Origem */}
      <div className="modal-transferir__preview-origem">
        <div className="modal-transferir__preview-titulo">Pedido de Origem</div>
        <div className="modal-transferir__preview-linha">
          <span>Pedido</span>
          <span className="modal-transferir__preview-valor">{preview.origem.pedido_numero}</span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>Item</span>
          <span className="modal-transferir__preview-valor">{preview.origem.item_part_number}</span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>Quantidade atual</span>
          <span className="modal-transferir__preview-valor">
            {fmtQuantidade(preview.origem.saldo_item_pedido)}
          </span>
        </div>
        <div className="modal-transferir__preview-linha">
          <span>Quantidade após</span>
          <span
            className={`modal-transferir__preview-valor${preview.origem.encerra ? ' modal-transferir__preview-valor--alerta' : ''}`}
          >
            {fmtQuantidade(preview.origem.quantidade_apos)}
            {preview.origem.encerra && ' (ficará zero)'}
          </span>
        </div>
      </div>

      {/* Destinos */}
      {preview.destinos.length > 0 && (
        <div className="modal-transferir__preview-destinos">
          {preview.destinos.map((d, idx) => (
            <div key={idx} className="modal-transferir__preview-destino">
              <div className="modal-transferir__preview-titulo">
                Destino {preview.destinos.length > 1 ? idx + 1 : ''}
                {' '}
                {d.tipo === 'novo' ? (
                  <span className="modal-transferir__badge-novo">novo</span>
                ) : (
                  <span className="modal-transferir__badge-existente">existente</span>
                )}
              </div>
              {d.pedido_numero && (
                <div className="modal-transferir__preview-linha">
                  <span>Pedido</span>
                  <span className="modal-transferir__preview-valor">{d.pedido_numero}</span>
                </div>
              )}
              <div className="modal-transferir__preview-linha">
                <span>Quantidade</span>
                <span className="modal-transferir__preview-valor">{fmtQuantidade(d.quantidade)}</span>
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
      )}

      {/* Alertas globais */}
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

const NOMES_PASSOS: Record<Passo, string> = {
  1: 'Cenário',
  2: 'Item',
  3: 'Destinos',
  4: 'Preview',
  5: 'Confirmação',
}

export function ModalTransferir({ pedidos, itemIdInicial, onFechar, onConcluido }: ModalTransferirProps) {
  const { addNotification } = useShellStore()
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

  // Fechar com Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onFechar])

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
  const podeProsseguirPasso2 = !!itemId && quantidadeOrigem > 0 && quantidadeOrigem <= (itemSelecionado?.saldo_item_pedido ?? 0)

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
    if (passo === 3) {
      await buscarPreview()
      setPasso(4)
    } else if (passo < 5) {
      setPasso(prev => (prev + 1) as Passo)
    }
  }, [passo, buscarPreview])

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

  const podeProsseguir = (() => {
    if (passo === 1) return podeProsseguirPasso1
    if (passo === 2) return podeProsseguirPasso2
    if (passo === 3) return podeProsseguirPasso3
    if (passo === 4) return !!preview && !erroPreview
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
          <h2 id="modal-transferir-titulo" className="modal-transferir__titulo">
            Transferir Pedido — {pedido.numero_pedido}
          </h2>
          <button
            className="modal-transferir__fechar"
            onClick={onFechar}
            aria-label="Fechar modal de transferência"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Indicador de passos */}
        {!concluido && (
          <div className="modal-transferir__passos" aria-label="Progresso do assistente de transferência">
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
              <div className="modal-transferir__sucesso-titulo">Transferência realizada!</div>
              <div className="modal-transferir__sucesso-descricao">
                {cenarioInfo?.nome} concluído com sucesso.
              </div>
              <div className="modal-transferir__sucesso-detalhes">
                <div className="modal-transferir__preview-linha">
                  <span>Cenário</span>
                  <span className="modal-transferir__preview-valor">{cenarioInfo?.nome}</span>
                </div>
                {itemSelecionado && (
                  <div className="modal-transferir__preview-linha">
                    <span>Item</span>
                    <span className="modal-transferir__preview-valor">{itemSelecionado.part_number}</span>
                  </div>
                )}
                <div className="modal-transferir__preview-linha">
                  <span>Quantidade processada</span>
                  <span className="modal-transferir__preview-valor">
                    {fmtQuantidade(quantidadeOrigem, itemSelecionado?.casas_decimais_quantidade_item)}
                  </span>
                </div>
                {resultado && resultado.pedidos_criados.length > 0 && (
                  <div className="modal-transferir__preview-linha">
                    <span>Novo pedido</span>
                    <span className="modal-transferir__preview-valor">
                      {numeroPedidoNovo || resultado.pedidos_criados[0]}
                    </span>
                  </div>
                )}
                {resultado && resultado.pedidos_destino_ids.length > 0 && resultado.pedidos_criados.length === 0 && (
                  <div className="modal-transferir__preview-linha">
                    <span>Pedido(s) destino</span>
                    <span className="modal-transferir__preview-valor">
                      {resultado.pedidos_destino_ids.length} pedido(s) atualizado(s)
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
                  onDestinosChange={setDestinos}
                  onNumeroPedidoChange={setNumeroPedidoNovo}
                />
              )}

              {/* Passo 4: Preview */}
              {passo === 4 && (
                carregandoPreview ? (
                  <div className="modal-transferir__loading" aria-live="polite">
                    <Spinner size={24} className="modal-transferir__spinner" aria-hidden="true" />
                    <span>Calculando impacto...</span>
                  </div>
                ) : erroPreview ? (
                  <div className="modal-transferir__erro" role="alert">
                    <Warning size={16} weight="fill" aria-hidden="true" />
                    {erroPreview}
                  </div>
                ) : preview ? (
                  <PreviewImpacto preview={preview} />
                ) : null
              )}

              {/* Passo 5: Confirmação */}
              {passo === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="modal-transferir__alerta" style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.07)', color: '#93c5fd' }}>
                    <ArrowRight size={14} weight="bold" aria-hidden="true" />
                    Revise o resumo acima antes de confirmar. Esta ação
                    {cenarioInfo?.reversivel
                      ? ' pode ser revertida posteriormente.'
                      : ' não pode ser revertida.'}
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
              {passo === 1 ? 'Cancelar' : 'Voltar'}
            </BotaoGlobal>
          )}

          <div className="modal-transferir__footer-direita">
            {concluido ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={onConcluido}
              >
                Concluir
              </BotaoGlobal>
            ) : passo === 5 ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleConfirmar}
                disabled={confirmando}
                aria-busy={confirmando}
              >
                {confirmando ? 'Transferindo...' : 'Confirmar Transferência'}
              </BotaoGlobal>
            ) : (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={avancar}
                disabled={!podeProsseguir || carregandoPreview}
              >
                {passo === 4 ? 'Revisar e Confirmar' : 'Próximo'}
              </BotaoGlobal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

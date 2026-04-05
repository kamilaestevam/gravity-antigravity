/**
 * ModalNovoItem.tsx — Adicionar item a um pedido existente
 *
 * Fluxo:
 *   - Se pedidoId for fornecido (contexto): 1 passo — Dados do Item
 *   - Se pedidoId não for fornecido (toolbar genérico): 2 passos —
 *       Passo 1: Selecionar Pedido / Passo 2: Dados do Item
 *
 * Usa ModalPassoPassoGlobal (nucleo-global) — padrão Gravity.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Tag, MagnifyingGlass } from '@phosphor-icons/react'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { Pedido, PedidoItem } from '../shared/types'
import { pedidoApi, pedidoItemApi } from '../shared/api'

// ── Passos ─────────────────────────────────────────────────────────────────────

const PASSOS_COMPLETO: PassoConfig[] = [
  { id: 1, label: 'Selecionar Pedido', icone: <MagnifyingGlass size={14} weight="duotone" /> },
  { id: 2, label: 'Dados do Item',     icone: <Tag size={14} weight="duotone" /> },
]

const PASSOS_DIRETO: PassoConfig[] = [
  { id: 1, label: 'Dados do Item', icone: <Tag size={14} weight="duotone" /> },
]

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ItemForm {
  part_number: string
  ncm: string
  descricao: string
  quantidade_inicial_item_pedido: string
  unidade_comercializada_item: string
  valor_unitario: string
}

const ITEM_VAZIO: ItemForm = {
  part_number: '',
  ncm: '',
  descricao: '',
  quantidade_inicial_item_pedido: '',
  unidade_comercializada_item: 'UN',
  valor_unitario: '',
}

const OPCOES_UOM = ['UN','MT','M2','KG','LT','TON','CM3','PC']
  .map(v => ({ valor: v, rotulo: v }))

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ModalNovoItemProps {
  aberto: boolean
  /** Pré-seleciona o pedido — pula o passo 1 */
  pedidoId?: string
  /** Número do pedido para exibir no header quando pré-selecionado */
  numeroPedido?: string
  onFechar: () => void
  onSalvo: (item: PedidoItem) => void
}

// ── Estilos inline ─────────────────────────────────────────────────────────────

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  } as React.CSSProperties,
  gridFull: {
    gridColumn: '1 / -1',
  } as React.CSSProperties,
  campo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  secaoTitulo: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '1rem',
  } as React.CSSProperties,
  pedidoSelecionado: {
    padding: '0.75rem 1rem',
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  erro: {
    fontSize: '0.8125rem',
    color: 'var(--danger, #ef4444)',
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(239,68,68,0.08)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
}

// ── Componente ─────────────────────────────────────────────────────────────────

export function ModalNovoItem({
  aberto,
  pedidoId: pedidoIdProp,
  numeroPedido: numeroPedidoProp,
  onFechar,
  onSalvo,
}: ModalNovoItemProps) {
  const modoContexto = Boolean(pedidoIdProp)

  const [passo, setPasso]                         = useState(modoContexto ? 1 : 1)
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState<string>(pedidoIdProp ?? '')
  const [numeroPedido, setNumeroPedido]            = useState<string>(numeroPedidoProp ?? '')
  const [pedidos, setPedidos]                      = useState<Pedido[]>([])
  const [carregandoPedidos, setCarregandoPedidos]  = useState(false)
  const [item, setItem]                            = useState<ItemForm>(ITEM_VAZIO)
  const [salvando, setSalvando]                    = useState(false)
  const [erro, setErro]                            = useState<string | null>(null)

  // Carregar lista de pedidos editáveis para o seletor
  useEffect(() => {
    if (!aberto || modoContexto) return
    setCarregandoPedidos(true)
    pedidoApi.listar({ status: 'aberto,draft' })
      .then(data => {
        const lista = Array.isArray(data) ? data : (data as { data?: Pedido[] }).data ?? []
        setPedidos(lista)
      })
      .catch(() => setPedidos([]))
      .finally(() => setCarregandoPedidos(false))
  }, [aberto, modoContexto])

  const handleFechar = useCallback(() => {
    setPasso(1)
    setItem(ITEM_VAZIO)
    setPedidoSelecionadoId(pedidoIdProp ?? '')
    setNumeroPedido(numeroPedidoProp ?? '')
    setErro(null)
    onFechar()
  }, [onFechar, pedidoIdProp, numeroPedidoProp])

  function setItemField(campo: keyof ItemForm, valor: string) {
    setItem(prev => ({ ...prev, [campo]: valor }))
  }

  const passos = modoContexto ? PASSOS_DIRETO : PASSOS_COMPLETO
  const ultimoPasso = passos[passos.length - 1].id

  // Validação por passo
  const podeAvancar = (() => {
    if (modoContexto) {
      return item.part_number.trim() !== '' || item.descricao.trim() !== ''
    }
    if (passo === 1) return pedidoSelecionadoId.trim() !== ''
    return item.part_number.trim() !== '' || item.descricao.trim() !== ''
  })()

  async function handleProximo() {
    const passoEhUltimo = passo === ultimoPasso

    if (!passoEhUltimo) {
      setPasso(p => p + 1)
      setErro(null)
      return
    }

    // Salvar item
    setSalvando(true)
    setErro(null)
    try {
      const pedidoAlvo = modoContexto ? pedidoIdProp! : pedidoSelecionadoId
      const resultado = await pedidoItemApi.adicionar(pedidoAlvo, {
        part_number: item.part_number,
        ncm: item.ncm,
        descricao: item.descricao,
        quantidade_inicial_item_pedido: parseFloat(item.quantidade_inicial_item_pedido) || 0,
        unidade_comercializada_item: item.unidade_comercializada_item,
        valor_unitario: item.valor_unitario ? parseFloat(item.valor_unitario) : undefined,
      } as Partial<PedidoItem>)
      onSalvo(resultado)
      handleFechar()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar item. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function handleVoltar() {
    if (passo > 1) { setPasso(p => p - 1); setErro(null) }
    else handleFechar()
  }

  const titulo = modoContexto && numeroPedido
    ? `Novo Item — ${numeroPedido}`
    : 'Novo Item'

  const labelBotaoFinal = salvando ? 'Adicionando...' : 'Adicionar Item'

  return (
    <ModalPassoPassoGlobal
      titulo={titulo}
      aberto={aberto}
      passos={passos}
      passoAtual={passo}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      onFechar={handleFechar}
      podeAvancar={podeAvancar && !salvando}
      labelBotaoFinal={labelBotaoFinal}
      tamanho="md"
      altura="480px"
    >
      {/* Passo seletor (apenas sem contexto) */}
      {!modoContexto && passo === 1 && (
        <div>
          <p style={s.secaoTitulo}>Selecione o Pedido</p>
          <SelectGlobal
            label="Pedido de destino"
            placeholder="Buscar pedido..."
            buscavel
            carregando={carregandoPedidos}
            opcoes={pedidos.map(p => ({
              valor: p.id,
              rotulo: p.numero_pedido,
              descricao: p.importacao_exportador_id ?? undefined,
            }))}
            valor={pedidoSelecionadoId || null}
            aoMudarValor={v => {
              const id = String(v ?? '')
              setPedidoSelecionadoId(id)
              const found = pedidos.find(p => p.id === id)
              if (found) setNumeroPedido(found.numero_pedido)
            }}
          />
        </div>
      )}

      {/* Passo dados do item */}
      {(modoContexto ? passo === 1 : passo === 2) && (
        <div>
          {numeroPedido && (
            <div style={s.pedidoSelecionado}>
              Pedido: <strong>{numeroPedido}</strong>
            </div>
          )}
          <p style={s.secaoTitulo}>Dados do Item</p>
          <div style={s.grid}>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-pn">Part Number</label>
              <input
                id="mni-pn"
                style={s.input}
                value={item.part_number}
                onChange={e => setItemField('part_number', e.target.value)}
                placeholder="SKU"
              />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-ncm">NCM</label>
              <input
                id="mni-ncm"
                style={{ ...s.input, fontFamily: 'monospace' }}
                value={item.ncm}
                onChange={e => setItemField('ncm', e.target.value)}
                placeholder="0000.00.00"
              />
            </div>
            <div style={{ ...s.campo, ...s.gridFull }}>
              <label style={s.label} htmlFor="mni-desc">Descrição</label>
              <input
                id="mni-desc"
                style={s.input}
                value={item.descricao}
                onChange={e => setItemField('descricao', e.target.value)}
                placeholder="Descrição do item"
              />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-qty">Quantidade Inicial</label>
              <input
                id="mni-qty"
                type="number"
                style={{ ...s.input, textAlign: 'right' }}
                value={item.quantidade_inicial_item_pedido}
                onChange={e => setItemField('quantidade_inicial_item_pedido', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div style={s.campo}>
              <SelectGlobal
                label="Unidade (UoM)"
                opcoes={OPCOES_UOM}
                valor={item.unidade_comercializada_item}
                aoMudarValor={v => setItemField('unidade_comercializada_item', String(v ?? 'UN'))}
              />
            </div>
            <div style={{ ...s.campo, ...s.gridFull }}>
              <label style={s.label} htmlFor="mni-vl">Valor Unitário</label>
              <input
                id="mni-vl"
                type="number"
                style={{ ...s.input, textAlign: 'right' }}
                value={item.valor_unitario}
                onChange={e => setItemField('valor_unitario', e.target.value)}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          {erro && <p style={s.erro}>{erro}</p>}
        </div>
      )}
    </ModalPassoPassoGlobal>
  )
}

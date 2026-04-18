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

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tag, MagnifyingGlass } from '@phosphor-icons/react'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { NcmSelectGlobal } from '@nucleo/campo-ncm-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, PedidoItem } from '../shared/types'
import { pedidoApi, pedidoItemApi } from '../shared/api'

// ── Passos — movidos para dentro do componente (dependem de t()) ───────────────

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ItemForm {
  part_number: string
  ncm: string
  descricao_item: string
  quantidade_inicial_item_pedido: string
}

const ITEM_VAZIO: ItemForm = {
  part_number: '',
  ncm: '',
  descricao_item: '',
  quantidade_inicial_item_pedido: '',
}

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
  const { addNotification } = useShellStore()
  const { t } = useTranslation()

  const PASSOS_COMPLETO = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.modal_item.passo_selecionar'), icone: <MagnifyingGlass size={14} weight="duotone" /> },
    { id: 2, label: t('pedido.modal_item.passo_dados'),      icone: <Tag size={14} weight="duotone" /> },
  ], [t])

  const PASSOS_DIRETO = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.modal_item.passo_dados'), icone: <Tag size={14} weight="duotone" /> },
  ], [t])

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
      return item.part_number.trim() !== '' || item.descricao_item.trim() !== ''
    }
    if (passo === 1) return pedidoSelecionadoId.trim() !== ''
    return item.part_number.trim() !== '' || item.descricao_item.trim() !== ''
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
        descricao_item: item.descricao_item,
        quantidade_inicial_item_pedido: parseFloat(item.quantidade_inicial_item_pedido) || 0,
      } as Partial<PedidoItem>)
      const pn = item.part_number.trim() || item.descricao_item.trim() || 'item'
      addNotification({ type: 'success', message: `Item ${pn} adicionado ao PO.`, duration: 4000 })
      onSalvo(resultado)
      handleFechar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar item. Tente novamente.'
      setErro(msg)
      addNotification({ type: 'error', message: `Falha ao adicionar item: ${msg}`, duration: 4000 })
    } finally {
      setSalvando(false)
    }
  }

  function handleVoltar() {
    if (passo > 1) { setPasso(p => p - 1); setErro(null) }
    else handleFechar()
  }

  const titulo = modoContexto && numeroPedido
    ? t('pedido.modal_item.titulo_com_pedido', { numero: numeroPedido })
    : t('pedido.modal_item.titulo')

  const labelBotaoFinal = salvando ? t('pedido.modal_item.adicionando') : t('pedido.modal_item.adicionar')

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
          <p style={s.secaoTitulo}>{t('pedido.modal_item.secao_selecionar')}</p>
          <SelectGlobal
            label={t('pedido.modal_item.destino_label')}
            placeholder={t('pedido.modal_item.destino_placeholder')}
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
              {t('pedido.modal_item.pedido_info', { numero: numeroPedido })}
            </div>
          )}
          <p style={s.secaoTitulo}>{t('pedido.modal_item.secao_dados')}</p>
          <div style={s.grid}>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-pn">Part Number</label>
              <input
                id="mni-pn"
                style={s.input}
                value={item.part_number}
                onChange={e => setItemField('part_number', e.target.value)}
                placeholder={t('pedido.modal_item.ph_sku')}
              />
            </div>
            <div style={s.campo}>
              <NcmSelectGlobal
                label="NCM"
                value={item.ncm}
                onChange={(codigo) => setItemField('ncm', codigo)}
              />
            </div>
            <div style={{ ...s.campo, ...s.gridFull }}>
              <label style={s.label} htmlFor="mni-desc">Descrição</label>
              <input
                id="mni-desc"
                style={s.input}
                value={item.descricao_item}
                onChange={e => setItemField('descricao_item', e.target.value)}
                placeholder={t('pedido.modal_item.ph_descricao')}
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
          </div>
          {erro && <p style={s.erro}>{erro}</p>}
        </div>
      )}
    </ModalPassoPassoGlobal>
  )
}

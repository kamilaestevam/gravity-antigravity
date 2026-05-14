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
import { Tag, MagnifyingGlass, Lock } from '@phosphor-icons/react'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import { CampoDecimalGlobal } from '@nucleo/campo-decimal-global'
import { useMoedas } from '@nucleo/modal-tabela-moeda'
import { useShellStore } from '@gravity/shell'
import type { Pedido, PedidoItem } from '../shared/types'
import { pedidoApi, pedidoItemApi } from '../shared/api'
import { getCasas } from './lista/ColunasPai'

// Casas decimais padrão alinhadas com Configurações › Casas Decimais
// (`COLUNAS_NUMERICAS` em pages/Configuracoes.tsx) e com `getCasas` usado em
// renderQtdPedido / colunas da lista. Defaults:
//   - quantidade_item     → 0 casas  (herda de quantidade_total_pedido na config)
//   - valor_por_unidade_item → 2 casas
//   - valor_total_pedido     → 2 casas  (Valor Total dos Itens herda)
function casasQtdItem()        { return getCasas('quantidade_item', 0) }
function casasValorUnitario()  { return getCasas('valor_por_unidade_item', 2) }
function casasValorTotal()     { return getCasas('valor_total_pedido', 2) }

// ── Passos — movidos para dentro do componente (dependem de t()) ───────────────

// ── Tipos ──────────────────────────────────────────────────────────────────────

// P15: nomes DDD (Mandamento 03) + Moeda + Valor do Item (mesmos nomes
// usados no ModalPedidoNovo Passo 2 — consistência cross-modal).
interface ItemForm {
  part_number_item: string
  ncm_item: string
  descricao_item: string
  quantidade_inicial_item: string
  moeda_item: string
  valor_por_unidade_item: string
}

const ITEM_VAZIO: ItemForm = {
  part_number_item: '',
  ncm_item: '',
  descricao_item: '',
  quantidade_inicial_item: '',
  // P16: sem default — usuário escolhe explicitamente (Mandamento 08, mesma
  // regra usada em ModalPedidoNovo › ITEM_VAZIO e no Incoterm). Placeholder
  // "USD" no SelectGlobal só sinaliza a sigla canônica esperada.
  moeda_item: '',
  valor_por_unidade_item: '',
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ModalNovoItemPedidoProps {
  aberto: boolean
  /** Pré-seleciona o pedido — pula o passo 1 */
  pedidoId?: string
  /** Número do pedido para exibir no header quando pré-selecionado */
  numeroPedido?: string
  onFechar: () => void
  onSalvo: (item: PedidoItem) => void
}

// ── Estilos inline ─────────────────────────────────────────────────────────────

// P15: styles padronizados com o sistema (alinha com ModalPedidoNovo):
// - label: --text-micro (0.75rem) + --text-muted (canônico .cg-label)
// - input: --bg-body (dark) + border 1.5px acento sutil + radius-md
// - secaoTitulo: letter-spacing 0.05em (alinha labels)
// - pedidoSelecionado: vira campo locked (cinza + ícone Lock — espelha CampoEmpresaDaOrg)
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
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    lineHeight: 1.3,
  } as React.CSSProperties,
  input: {
    background:    'var(--ws-bg-body, var(--bg-body, #0f172a))',
    border:        '1.5px solid var(--ws-accent-border, var(--border-accent, rgba(129,140,248,0.20)))',
    borderRadius:  'var(--radius-md, 8px)',
    color:         'var(--text-primary)',
    fontSize:      '0.875rem',
    padding:       '0.5625rem 0.875rem',
    outline:       'none',
    transition:    'border-color 0.18s ease, box-shadow 0.18s ease',
    width:         '100%',
    boxSizing:     'border-box' as const,
  } as React.CSSProperties,
  secaoTitulo: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  } as React.CSSProperties,
  // P15: card de pedido fixado vira campo locked (cinza + Lock) pra sinalizar
  // que não é editável aqui (usuário já selecionou o pedido no passo anterior).
  pedidoLocked: {
    display:       'flex',
    alignItems:    'center',
    gap:           '0.5rem',
    padding:       '0.5625rem 0.875rem',
    background:    'var(--bg-elevated)',
    border:        '1px solid var(--bg-elevated)',
    borderRadius:  'var(--radius-md, 8px)',
    color:         'var(--text-secondary)',
    fontSize:      '0.875rem',
    opacity:       0.7,
    cursor:        'not-allowed',
    marginBottom:  '1.5rem',
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

export function ModalNovoItemPedido({
  aberto,
  pedidoId: pedidoIdProp,
  numeroPedido: numeroPedidoProp,
  onFechar,
  onSalvo,
}: ModalNovoItemPedidoProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()

  // P15: moedas via SSOT (banco Cadastros). Mapeia pra SelectOpcao do SelectGlobal.
  const { moedas } = useMoedas()
  const opcoesMoedas = useMemo(
    () => moedas.map((m) => ({ valor: m.codigo_moeda, rotulo: m.codigo_moeda, descricao: m.nome_moeda })),
    [moedas],
  )

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
    pedidoApi.listar({ status: 'aberto,rascunho' })
      .then(data => {
        const lista = Array.isArray(data) ? data : (data as { data?: Pedido[] }).data ?? []
        setPedidos(lista)
      })
      .catch(() => setPedidos([]))
      .finally(() => setCarregandoPedidos(false))
  }, [aberto, modoContexto])

  // P16: reset garantido a cada abertura do modal (idempotente). Sem isso o
  // estado pode persistir de uma sessão anterior — usuário viu USD pré-selecionado
  // mesmo após ITEM_VAZIO.moeda_item ser zerado (HMR + estado preso).
  useEffect(() => {
    if (!aberto) return
    setItem(ITEM_VAZIO)
    setErro(null)
    setPasso(modoContexto ? 1 : 1)
    if (modoContexto) {
      setPedidoSelecionadoId(pedidoIdProp ?? '')
      setNumeroPedido(numeroPedidoProp ?? '')
    }
  }, [aberto, modoContexto, pedidoIdProp, numeroPedidoProp])

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

  // Validação por passo (item pode ser salvo com qualquer campo preenchido)
  const podeAvancar = (() => {
    const itemTemDado =
      item.part_number_item.trim() !== '' ||
      item.descricao_item.trim() !== '' ||
      item.ncm_item.trim() !== '' ||
      item.valor_por_unidade_item.trim() !== '' ||
      item.quantidade_inicial_item.trim() !== ''
    if (modoContexto) return itemTemDado
    if (passo === 1) return pedidoSelecionadoId.trim() !== ''
    return itemTemDado
  })()

  async function handleProximo() {
    const passoEhUltimo = passo === ultimoPasso

    if (!passoEhUltimo) {
      setPasso(p => p + 1)
      setErro(null)
      return
    }

    // Salvar item (DDD-puro — Mandamento 03; alinha com criarItemSchema do backend)
    setSalvando(true)
    setErro(null)
    try {
      const pedidoAlvo = modoContexto ? pedidoIdProp! : pedidoSelecionadoId
      const qtd = parseFloat(item.quantidade_inicial_item) || 0
      const valorUnit = item.valor_por_unidade_item.trim() === '' ? null : (parseFloat(item.valor_por_unidade_item) || 0)
      const resultado = await pedidoItemApi.adicionar(pedidoAlvo, {
        part_number_item:        item.part_number_item,
        ncm_item:                item.ncm_item,
        descricao_item:          item.descricao_item,
        quantidade_inicial_item: qtd,
        moeda_item:              item.moeda_item,
        valor_por_unidade_item:  valorUnit,
        // valor_total_item: NÃO enviado — backend recalcula via
        // recalcularAgregadosPedido (fonte única de verdade, Mandamento 08)
      } as Partial<PedidoItem>)
      const pn = item.part_number_item.trim() || item.descricao_item.trim() || 'item'
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
      altura="580px"
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
          {/* Pedido selecionado vira campo "locked" (cinza + ícone Lock).
              Sinaliza que não é editável aqui — usuário já escolheu o pedido. */}
          {numeroPedido && (
            <div style={s.pedidoLocked}>
              <Lock size={14} weight="duotone" style={{ flexShrink: 0 }} />
              <span>{t('pedido.modal_item.pedido_info', { numero: numeroPedido })}</span>
            </div>
          )}
          <p style={s.secaoTitulo}>{t('pedido.modal_item.secao_dados')}</p>
          <div style={s.grid}>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-pn">{t('pedido.item.part_number')}</label>
              <input
                id="mni-pn"
                style={s.input}
                value={item.part_number_item}
                onChange={e => setItemField('part_number_item', e.target.value)}
                placeholder={t('pedido.modal_item.ph_sku')}
              />
            </div>
            <div style={s.campo}>
              <SelectNcmGlobal
                label={t('pedido.item.ncm')}
                value={item.ncm_item}
                onChange={(codigo) => setItemField('ncm_item', codigo)}
              />
            </div>
            <div style={{ ...s.campo, ...s.gridFull }}>
              <label style={s.label} htmlFor="mni-desc">{t('pedido.drawer.label_descricao')}</label>
              <input
                id="mni-desc"
                style={s.input}
                value={item.descricao_item}
                onChange={e => setItemField('descricao_item', e.target.value)}
                placeholder={t('pedido.modal_item.ph_descricao')}
              />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-qty">{t('pedido.drawer.label_qtd')}</label>
              {/* P15: Live mask BR (10.000,00) — padrão sistêmico CampoDecimalGlobal */}
              <CampoDecimalGlobal
                id="mni-qty"
                valor={item.quantidade_inicial_item === '' ? null : Number(item.quantidade_inicial_item)}
                aoMudarValor={(n) => setItemField('quantidade_inicial_item', n === null ? '' : String(n))}
                casasDecimais={casasQtdItem()}
                style={s.input}
                textAlign="right"
              />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-moeda">{t('pedido.item.moeda', 'Moeda')}</label>
              {/* P15: SelectGlobal canônico (Mandamento 03), lista vem do hook
                  useMoedas() — SSOT é banco Cadastros (Mandamento 06+09). */}
              <SelectGlobal
                id="mni-moeda"
                opcoes={opcoesMoedas}
                valor={item.moeda_item || null}
                aoMudarValor={(v) => setItemField('moeda_item', String(v ?? ''))}
                buscavel
                placeholder="Selecionar moeda"
              />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-valor">{t('pedido.item.valor_por_unidade_item', 'Valor do Item')}</label>
              <CampoDecimalGlobal
                id="mni-valor"
                valor={item.valor_por_unidade_item === '' ? null : Number(item.valor_por_unidade_item)}
                aoMudarValor={(n) => setItemField('valor_por_unidade_item', n === null ? '' : String(n))}
                casasDecimais={casasValorUnitario()}
                style={s.input}
                textAlign="right"
              />
            </div>
            <div style={s.campo}>
              <label style={s.label} htmlFor="mni-total">{t('pedido.item.valor_total_item', 'Valor Total dos Itens')}</label>
              {/* P15: computed read-only = qtd × valor_por_unidade. Não enviado ao
                  backend — fonte única é o backend via recalcularAgregadosPedido. */}
              <CampoDecimalGlobal
                id="mni-total"
                valor={
                  item.valor_por_unidade_item === '' || item.quantidade_inicial_item === ''
                    ? null
                    : Number(item.valor_por_unidade_item) * Number(item.quantidade_inicial_item)
                }
                aoMudarValor={() => { /* read-only */ }}
                casasDecimais={casasValorTotal()}
                style={{ ...s.input, opacity: 0.7, cursor: 'not-allowed' }}
                textAlign="right"
                desabilitado
              />
            </div>
          </div>
          {erro && <p style={s.erro}>{erro}</p>}
        </div>
      )}
    </ModalPassoPassoGlobal>
  )
}

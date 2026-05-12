/**
 * ColunasPai.tsx — Definição de colunas do Pedido (linha pai)
 *
 * Exporta buildColunasPai(t) (GTColuna<Pedido>[]) e o _regrasAlertasRef compartilhado.
 * Separado para manter ListaPedidos.tsx abaixo de 2000 linhas.
 */

import React from 'react'
import type { TFunction } from 'i18next'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/types'
import { STATUS_PEDIDO_LABELS, fmtQuantidade, fmtData } from '../../shared/types'
import type { RegrasConfigBackend } from '../../shared/api'
import { LABELS_FILTRO_INVERSO } from './filtros'
import { UNIDADES_PESO_OPCOES_PEDIDO as UNIDADES_PESO_OPCOES } from '../../shared/unidadesPesoColuna'
import { getEditavel } from '../../shared/columnBehaviorConfig'

// Re-export so callers that used to import from ListaPedidos still work
export { LABELS_FILTRO_INVERSO }

// ── Status: cores padrão e leitura de localStorage ───────────────────────────

const PEDIDO_STATUS_STORAGE_KEY = 'pedido:status_config'

/** Cores padrão por código de status (backend) */
const STATUS_CORES_DEFAULT: Record<string, string> = {
  rascunho:      '#94a3b8',
  aberto:        '#60a5fa',
  transferencia: '#818cf8',
  consolidado:   '#a78bfa',
  cancelado:     '#f87171',
}

// ── Caches de parse — evitam JSON.parse repetido sem risco de dados stale ────
// Ainda chamam localStorage.getItem (barato), mas só fazem JSON.parse
// quando a string muda (caro). Funciona mesmo se o usuário salvar config
// durante a mesma sessão.

let _statusRaw: string | null | undefined = undefined
let _statusParsed: Record<string, { label: string; cor: string }> = {}

function _lerStatusConfig(): Record<string, { label: string; cor: string }> {
  const raw = localStorage.getItem(PEDIDO_STATUS_STORAGE_KEY)
  if (raw !== _statusRaw) {
    _statusRaw = raw
    try { _statusParsed = raw ? JSON.parse(raw) : {} }
    catch { _statusParsed = {} }
  }
  return _statusParsed
}

let _casasRaw: string | null | undefined = undefined
let _casasParsed: Record<string, number> = {}

function _lerCasasConfig(): Record<string, number> {
  const raw = localStorage.getItem('pedido:casas_decimais')
  if (raw !== _casasRaw) {
    _casasRaw = raw
    try { _casasParsed = raw ? JSON.parse(raw) as Record<string, number> : {} }
    catch { _casasParsed = {} }
  }
  return _casasParsed
}

/** Lê o mapa {id → cor} salvo pelo Configuracoes via localStorage */
export function lerStatusCores(): Record<string, string> {
  const config = _lerStatusConfig()
  const mapa: Record<string, string> = {}
  for (const [id, cfg] of Object.entries(config)) mapa[id] = cfg.cor
  return mapa
}

export function getStatusCor(status: string): string {
  const config = _lerStatusConfig()
  return config[status]?.cor ?? STATUS_CORES_DEFAULT[status] ?? '#64748b'
}

/** Lê o label de um status — inclui status customizados do localStorage */
export function getStatusLabel(status: string, t?: TFunction): string {
  const config = _lerStatusConfig()
  if (config[status]?.label) return config[status].label
  if (t) return t(`pedido.status.${status}`)
  return STATUS_PEDIDO_LABELS[status as keyof typeof STATUS_PEDIDO_LABELS] ?? status
}

// ── Casas decimais configuráveis pelo usuário ────────────────────────────────

export function lerCasasDecimaisConfig(): Record<string, number> {
  return _lerCasasConfig()
}

/** Retorna casas decimais para um campo, respeitando config do usuário em Configurações */
export function getCasas(campo: string, padrao: number): number {
  return _lerCasasConfig()[campo] ?? padrao
}

// ── Ref de alertas: carregado uma vez no mount, acessível pelos renders estáticos ──
export const _regrasAlertasRef: { current: RegrasConfigBackend | null } = { current: null }

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

export function renderQtdPedido(row: Pedido, campoItem: keyof PedidoItem, casas = 0, tooltip?: { titulo: string; descricao: string }) {
  const itens = row.itens ?? []
  if (itens.length === 0) return <span style={{ fontVariantNumeric: 'tabular-nums' }}>—</span>

  // Onda A8 — homogeneidade de unidade. Considera apenas itens que de fato
  // contribuem para a soma (valor numérico > 0). Itens com qty zero não
  // poluem a detecção de divergência (e a soma deles é 0 mesmo).
  const unidadesContribuintes = new Set(
    itens
      .filter(i => (Number(i[campoItem]) || 0) > 0)
      .map(i => i.unidade_comercializada_item ?? 'UN')
  )
  const wrap = (node: React.ReactNode) => tooltip
    ? <TooltipGlobal titulo={tooltip.titulo} descricao={tooltip.descricao}><span style={{ display: 'contents' }}>{node}</span></TooltipGlobal>
    : <>{node}</>

  // Unidades divergentes → não somar; mostrar alerta no padrão `renderAgregado`.
  if (unidadesContribuintes.size > 1) {
    return wrap(renderAgregado(null, true, 'Unidades divergentes entre itens'))
  }

  const unidade = [...unidadesContribuintes][0] ?? 'UN'
  const soma = itens.reduce((s, i) => s + (Number(i[campoItem]) || 0), 0)
  return wrap(
    <span className="gtv-celula-moeda">
      {fmtQuantidade(soma, casas)}
      <span className="gtv-celula-unidade-badge">{unidade}</span>
    </span>
  )
}

// ── Helper: badge de divergência entre itens ─────────────────────────────────
// Usado pelas colunas que agregam valores dos filhos.
// Os flags `_divergente` e `_valor_unico` são populados no FRONTEND (não no
// backend, apesar de comentário antigo dizer o contrário). A função que
// popula é `calcularDivergencias()` em `Pedidos.tsx`, disparada quando os
// itens do pedido são carregados (expansão da linha). Backend só retorna
// os campos brutos do Pedido — a divergência é detectada client-side por
// `getAlertavelKeys()` em `shared/columnAlertConfig.ts`.
const WarnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export function renderAgregado(
  valor: string | null | undefined,
  divergente: boolean | null | undefined,
  labelDivergente?: string,
  opts?: { fontMono?: boolean }
): React.ReactElement {
  const centro: React.CSSProperties = { display: 'block', textAlign: 'center' }

  // Nada para mostrar — célula vazia.
  if (!valor && !divergente) return <span style={centro}>—</span>

  // Sem valor canônico (caso clássico de agregado puro, ex: unidades divergentes
  // que nem podem ser somadas) — mostra só o alerta.
  if (!valor && divergente) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600 }}
        title={labelDivergente}>
        <WarnIcon />{labelDivergente ?? 'Valores divergentes'}
      </span>
    )
  }

  // Renderização do valor (estilo mantido com fontMono opcional).
  const conteudoValor = (
    <span style={opts?.fontMono ? { fontFamily: 'var(--font-mono, monospace)' } : undefined}>{valor}</span>
  )

  // Pedido tem valor próprio, mas itens divergem dele — mostra valor + badge
  // de alerta ao lado. Tooltip detalha a divergência.
  if (divergente) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        title={labelDivergente ?? 'Itens divergem do pedido'}>
        {conteudoValor}
        <span style={{ display: 'inline-flex', color: '#F59E0B', flexShrink: 0 }}><WarnIcon /></span>
      </span>
    )
  }

  return conteudoValor
}

export function buildColunasPai(t: TFunction): GTColuna<Pedido>[] {
  return [
  {
    key: 'numero_pedido',
    label: t('pedido.coluna_pai.numero_pedido'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('numero_pedido'),
    campo: 'numero_pedido',
    tooltipTitulo: t('pedido.coluna_pai.numero_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.numero_pedido_desc'),
    grupo: 'Identificação',
  },
  {
    key: 'tipo_operacao',
    label: t('pedido.coluna_pai.tipo_operacao'),
    tipo: 'badge',
    align: 'center',
    filtravel: true,
    editavel: getEditavel('tipo_operacao'),
    campo: 'tipo_operacao',
    opcoes: [
      { valor: 'importacao', label: 'Importação' },
      { valor: 'exportacao', label: 'Exportação' },
    ],
    tooltipTitulo: t('pedido.coluna_pai.tipo_operacao_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.tipo_operacao_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
        genero="feminino"
        style={row.tipo_operacao === 'importacao'
          ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
          : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
        }
      />
    ),
    findDisplay: (row: Pedido) => row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação',
  },
  {
    key: 'nome_exportador',
    label: t('pedido.coluna_pai.nome_exportador'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_exportador'),
    tooltipBloqueado: 'Exportador definido automaticamente pelo workspace — não editável em Exportação',
    tooltipTitulo: t('pedido.coluna_pai.nome_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_exportador_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_exportador, row.nome_exportador_divergente, 'Exportadores divergentes entre itens'),
  },
  {
    key: 'nome_importador',
    label: t('pedido.coluna_pai.nome_importador'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_importador'),
    tooltipBloqueado: 'Importador definido automaticamente pelo workspace — não editável em Importação',
    tooltipTitulo: t('pedido.coluna_pai.nome_importador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_importador_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_importador, row.nome_importador_divergente, 'Importadores divergentes entre itens'),
  },
  {
    key: 'nome_fabricante',
    label: t('pedido.coluna_pai.nome_fabricante'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_fabricante'),
    campo: 'nome_fabricante',
    tooltipTitulo: t('pedido.coluna_pai.nome_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_fabricante_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_fabricante, row.nome_fabricante_divergente, 'Fabricantes divergentes entre itens'),
  },
  {
    key: 'referencia_importador',
    label: t('pedido.coluna_pai.referencia_importador'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_importador'),
    tooltipTitulo: t('pedido.coluna_pai.referencia_importador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.referencia_importador_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.referencia_importador, row.referencia_importador_divergente, 'Referências divergentes entre itens'),
  },
  {
    key: 'referencia_exportador',
    label: t('pedido.coluna_pai.referencia_exportador'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_exportador'),
    tooltipTitulo: t('pedido.coluna_pai.referencia_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.referencia_exportador_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.referencia_exportador, row.referencia_exportador_divergente, 'Referências divergentes entre itens'),
  },
  {
    key: 'ncm',
    label: t('pedido.coluna_pai.ncm'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('ncm'),
    tooltipTitulo: t('pedido.coluna_pai.ncm_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.ncm_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      // Formata NCM (8 dígitos → 0000.00.00) para consistência visual.
      const raw = row.ncm_valor_unico ?? null
      const d = (raw ?? '').replace(/\D/g, '')
      const fmt = d.length === 8 ? `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6)}` : raw
      // Quando divergente, label informa quantos NCMs distintos existem nos itens.
      // Usa renderAgregado para padronizar com as demais colunas (valor + ícone
      // de alerta lado a lado). Sem ⚠ na string — o ícone SVG já sinaliza.
      const labelDivergente = `${row.ncms_distintos_count ?? '?'} NCMs diferentes nos itens`
      return renderAgregado(fmt, row.ncm_divergente, labelDivergente, { fontMono: true })
    },
  },
  {
    key: 'numero_proforma',
    label: t('pedido.coluna_pai.numero_proforma'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('numero_proforma'),
    campo: 'numero_proforma',
    tooltipTitulo: t('pedido.coluna_pai.numero_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.numero_proforma_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => <span>{row.numero_proforma ?? '—'}</span>,
  },
  {
    key: 'numero_invoice',
    label: t('pedido.coluna_pai.numero_invoice'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('numero_invoice'),
    campo: 'numero_invoice',
    tooltipTitulo: t('pedido.coluna_pai.numero_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.numero_invoice_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => <span>{row.numero_invoice ?? '—'}</span>,
  },
  {
    key: 'incoterm',
    label: t('pedido.coluna_pai.incoterm'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('incoterm'),
    tooltipTitulo: t('pedido.coluna_pai.incoterm_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.incoterm_desc'),
    grupo: 'Financeiro',
    align: 'center',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.incoterm, row.incoterm_divergente, 'Incoterms divergentes entre itens'),
  },
  {
    key: 'valor_total_pedido',
    label: t('pedido.coluna_pai.valor_total_pedido'),
    tipo: 'moeda',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: 2,
    tooltipTitulo: t('pedido.coluna_pai.valor_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.valor_total_pedido_desc'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) => {
      // Onda A8 — homogeneidade de moeda. Quando itens divergem em moeda,
      // o helper recalcularAgregadosPedido grava `valor_total_pedido = null`
      // e o front (via calcularDivergencias em Pedidos.tsx) seta a flag
      // `moeda_item_divergente = true`. renderAgregado então mostra o
      // alerta padrão "⚠ Moedas divergentes entre itens".
      const moeda = row.moeda_pedido ?? 'USD'
      const num = Number(row.valor_total_pedido)
      const valorFormatado = row.valor_total_pedido != null && !isNaN(num)
        ? `${moeda} ${fmtQuantidade(num, 2)}`
        : null
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.valor_total_pedido_titulo')} descricao={t('pedido.coluna_pai.valor_total_pedido_desc')}>
          <span style={{ display: 'contents' }}>
            {renderAgregado(valorFormatado, row.moeda_item_divergente, 'Moedas divergentes entre itens')}
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'valor_por_unidade_item',
    label: t('pedido.coluna_pai.valor_unitario_item'),
    tipo: 'moeda',
    filtravel: true,
    align: 'right',
    casasDecimais: getCasas('valor_por_unidade_item', 2),
    tooltipTitulo: t('pedido.coluna_pai.valor_unitario_item_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.valor_unitario_item_desc'),
    grupo: 'Financeiro',
    // valor_por_unidade_item é por item — não há somatória no nível pai.
    // MAS se as moedas dos itens divergem, mostramos alerta (Mand. 08 — faz
    // barulho explícito em vez de "—" silencioso). Flag populada pelo
    // `calcularDivergencias` em Pedidos.tsx ao expandir o pedido.
    render: (_val: unknown, row: Pedido) =>
      row.moeda_item_divergente
        ? renderAgregado(null, true, 'Moedas divergentes entre itens')
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
  },
  {
    key: 'quantidade_total_pedido',
    label: t('pedido.coluna_pai.quantidade_total_inicial_pedido'),
    tipo: 'unidade',
    align: 'right',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_total_inicial_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_total_inicial_pedido_desc'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_inicial_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_total_inicial_pedido_titulo'), descricao: t('pedido.coluna_pai.quantidade_total_inicial_pedido_desc') }),
  },
  {
    key: 'quantidade_pronta_itens_pedido_total',
    label: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total'),
    tipo: 'unidade',
    align: 'right',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_desc'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_pronta_total_item_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_titulo'), descricao: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_desc') }),
  },
  {
    key: 'saldo_itens_do_pedido',
    label: t('pedido.coluna_pai.saldo_itens_do_pedido'),
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: t('pedido.coluna_pai.saldo_itens_do_pedido_titulo'),
    tooltipDescricao: <span>Calculado com base nos itens — não editável. <a href="/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>,
    tooltipInterativo: true,
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => {
      const total = row.quantidade_total_pedido ?? null
      const transf = row.quantidade_transferida_total ?? null
      const qtd = row.saldo_itens_do_pedido ?? (total != null && transf != null ? Math.max(0, total - transf) : null)
      return (
        <TooltipGlobal
          titulo={t('pedido.coluna_pai.saldo_itens_do_pedido_titulo')}
          descricao={<span>Calculado com base nos itens — não editável. <a href="/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>}
          interativo
        >
          <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#60a5fa' : undefined }}>
            {qtd != null ? fmtQuantidade(qtd, getCasas('quantidade_total_pedido', 0)) : '—'}
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'quantidade_transferida_total',
    label: t('pedido.coluna_pai.quantidade_transferida_total'),
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_transferida_total_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_transferida_total_desc'),
    tooltipBloqueado: 'Campo calculado — soma de quantidade_transferida_pedido de todos os itens. Alterado apenas por operações de transferência.',
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#60a5fa' }}>
        {row.quantidade_transferida_total != null ? fmtQuantidade(row.quantidade_transferida_total, getCasas('quantidade_total_pedido', 0)) : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada_total_pedido',
    label: t('pedido.coluna_pai.quantidade_cancelada_total_pedido'),
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_cancelada_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_cancelada_total_pedido_desc'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: (row.quantidade_cancelada_total_pedido ?? 0) > 0 ? 'var(--color-error, #ef4444)' : undefined }}>
        {row.quantidade_cancelada_total_pedido != null ? fmtQuantidade(row.quantidade_cancelada_total_pedido, getCasas('quantidade_total_pedido', 0)) : '—'}
      </span>
    ),
  },
  {
    key: 'data_emissao_pedido',
    label: t('pedido.coluna_pai.data_emissao_pedido'),
    tipo: 'periodo',
    filtravel: true,
    editavel: getEditavel('data_emissao_pedido'),
    campo: 'data_emissao_pedido',
    tooltipTitulo: t('pedido.coluna_pai.data_emissao_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_emissao_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(
        row.data_emissao_pedido ? fmtData(row.data_emissao_pedido) : null,
        row.data_emissao_pedido_divergente,
        'Datas de emissão divergentes entre itens',
      ),
  },
  {
    key: 'status',
    label: t('pedido.coluna_pai.status'),
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: t('pedido.coluna_pai.status_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.status_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      const cor = getStatusCor(row.status)
      return (
        <StatusBadgeGlobal
          valor={getStatusLabel(row.status, t)}
          genero="masculino"
          style={{
            color: cor,
            background: `${cor}1e`,
            border: `1px solid ${cor}33`,
          }}
        />
      )
    },
    findDisplay: (row: Pedido) => getStatusLabel(row.status, t),
  },
  // ── Dados comerciais ────────────────────────────────────────────────────────
  {
    key: 'referencia_fabricante',
    label: t('pedido.coluna_pai.referencia_fabricante'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_fabricante'),
    tooltipTitulo: t('pedido.coluna_pai.referencia_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.referencia_fabricante_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.referencia_fabricante, row.referencia_fabricante_divergente, 'Referências divergentes entre itens'),
  },
  {
    key: 'cobertura_cambial',
    label: t('pedido.coluna_pai.cobertura_cambial'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('cobertura_cambial'),
    campo: 'cobertura_cambial',
    tooltipTitulo: t('pedido.coluna_pai.cobertura_cambial_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cobertura_cambial_desc'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.cobertura_cambial_valor_unico, row.cobertura_cambial_divergente, 'Coberturas cambiais divergentes entre itens'),
  },
  {
    key: 'condicao_pagamento',
    label: t('pedido.coluna_pai.condicao_pagamento_pedido'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('condicao_pagamento'),
    tooltipTitulo: t('pedido.coluna_pai.condicao_pagamento_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.condicao_pagamento_pedido_desc'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.condicao_pagamento, row.condicao_pagamento_divergente, 'Condições de pagamento divergentes entre itens'),
  },
  // ── Dados físicos ───────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_total_pedido',
    label: t('pedido.coluna_pai.peso_liquido_total_pedido'),
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('peso_liquido_total_pedido', 3),
    unidades: UNIDADES_PESO_OPCOES,
    tooltipTitulo: t('pedido.coluna_pai.peso_liquido_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.peso_liquido_total_pedido_desc'),
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('peso_liquido_total_pedido', 3)
      const num = Number(row.peso_liquido_total_pedido ?? 0)
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.peso_liquido_total_pedido_titulo')} descricao={t('pedido.coluna_pai.peso_liquido_total_pedido_desc')}>
          <span className="gtv-celula-moeda">
            {row.peso_liquido_total_pedido != null ? fmtQuantidade(num, casas) : '—'}
            <span className="gtv-celula-unidade-badge">kg</span>
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'peso_bruto_total_pedido',
    label: t('pedido.coluna_pai.peso_bruto_total_pedido'),
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('peso_bruto_total_pedido', 3),
    unidades: UNIDADES_PESO_OPCOES,
    tooltipTitulo: t('pedido.coluna_pai.peso_bruto_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.peso_bruto_total_pedido_desc'),
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('peso_bruto_total_pedido', 3)
      const num = Number(row.peso_bruto_total_pedido ?? 0)
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.peso_bruto_total_pedido_titulo')} descricao={t('pedido.coluna_pai.peso_bruto_total_pedido_desc')}>
          <span className="gtv-celula-moeda">
            {row.peso_bruto_total_pedido != null ? fmtQuantidade(num, casas) : '—'}
            <span className="gtv-celula-unidade-badge">kg</span>
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'cubagem_total_pedido',
    label: t('pedido.coluna_pai.cubagem_total_pedido'),
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('cubagem_total_pedido', 4),
    unidades: [{ sigla: 'm³', rotulo: 'Metro Cúbico' }],
    tooltipTitulo: t('pedido.coluna_pai.cubagem_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cubagem_total_pedido_desc'),
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('cubagem_total_pedido', 4)
      const num = Number(row.cubagem_total_pedido ?? 0)
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.cubagem_total_pedido_titulo')} descricao={t('pedido.coluna_pai.cubagem_total_pedido_desc')}>
          <span className="gtv-celula-moeda">
            {row.cubagem_total_pedido != null ? fmtQuantidade(num, casas) : '—'}
            <span className="gtv-celula-unidade-badge">m³</span>
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── Datas de progresso ──────────────────────────────────────────────────────
  {
    key: 'data_prevista_pedido_pronto',
    label: t('pedido.coluna_pai.data_prevista_pedido_pronto'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_pedido_pronto_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_pedido_pronto_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_pedido_pronto ? fmtData(row.data_prevista_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_confirmada_pedido_pronto',
    label: t('pedido.coluna_pai.data_confirmada_pedido_pronto'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_pedido_pronto_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_pedido_pronto_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_pedido_pronto ? fmtData(row.data_confirmada_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_meta_pedido_pronto',
    label: t('pedido.coluna_pai.data_meta_pedido_pronto'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_meta_pedido_pronto_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_pedido_pronto_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_pedido_pronto ? fmtData(row.data_meta_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_prevista_inspecao_pedido',
    label: t('pedido.coluna_pai.data_prevista_inspecao_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_inspecao_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_inspecao_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_inspecao_pedido ? fmtData(row.data_prevista_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_inspecao_pedido',
    label: t('pedido.coluna_pai.data_confirmada_inspecao_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_inspecao_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_inspecao_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_inspecao_pedido ? fmtData(row.data_confirmada_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_inspecao_pedido',
    label: t('pedido.coluna_pai.data_meta_inspecao_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_meta_inspecao_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_inspecao_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_inspecao_pedido ? fmtData(row.data_meta_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_coleta_pedido',
    label: t('pedido.coluna_pai.data_prevista_coleta_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_coleta_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_coleta_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_coleta_pedido ? fmtData(row.data_prevista_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_coleta_pedido',
    label: t('pedido.coluna_pai.data_confirmada_coleta_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_coleta_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_coleta_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_coleta_pedido ? fmtData(row.data_confirmada_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_coleta_pedido',
    label: t('pedido.coluna_pai.data_meta_coleta_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_meta_coleta_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_coleta_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_coleta_pedido ? fmtData(row.data_meta_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_pedido',
    label: t('pedido.coluna_pai.data_consolidacao_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_consolidacao_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_consolidacao_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_consolidacao_pedido ? fmtData(row.data_consolidacao_pedido) : '—'}</span>,
  },
  {
    key: 'data_transferencia_saldo_pedido',
    label: t('pedido.coluna_pai.data_transferencia_saldo_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: t('pedido.coluna_pai.data_transferencia_saldo_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_transferencia_saldo_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_transferencia_saldo_pedido ? fmtData(row.data_transferencia_saldo_pedido) : '—'}</span>,
  },
  // ── Exportador (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_exportador',
    label: t('pedido.coluna_pai.pais_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.pais_exportador ?? '—'}</span>,
  },
  {
    key: 'estado_exportador',
    label: t('pedido.coluna_pai.estado_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.estado_exportador ?? '—'}</span>,
  },
  {
    key: 'cidade_exportador',
    label: t('pedido.coluna_pai.cidade_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_exportador ?? '—'}</span>,
  },
  {
    key: 'endereco_exportador',
    label: t('pedido.coluna_pai.endereco_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_exportador ?? '—'}</span>,
  },
  {
    key: 'zip_code_exportador',
    label: t('pedido.coluna_pai.zip_code_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_exportador ?? '—'}</span>,
  },
  {
    key: 'exportador_ou_fabricante',
    label: t('pedido.coluna_pai.exportador_ou_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.exportador_ou_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.exportador_ou_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_ou_fabricante ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante',
    label: t('pedido.coluna_pai.relacao_exportador_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.relacao_exportador_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.relacao_exportador_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.relacao_exportador_fabricante ?? '—'}</span>,
  },
  // ── Contato do exportador ───────────────────────────────────────────────────
  {
    key: 'nome_contato_exportador',
    label: t('pedido.coluna_pai.nome_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.nome_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.nome_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'email_contato_exportador',
    label: t('pedido.coluna_pai.email_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.email_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.email_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.email_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'whatsapp_contato_exportador',
    label: t('pedido.coluna_pai.whatsapp_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.whatsapp_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.whatsapp_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.whatsapp_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'cargo_contato_exportador',
    label: t('pedido.coluna_pai.cargo_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cargo_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cargo_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cargo_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'departamento_contato_exportador',
    label: t('pedido.coluna_pai.departamento_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.departamento_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.departamento_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.departamento_contato_exportador ?? '—'}</span>,
  },
  // ── Fabricante (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_fabricante',
    label: t('pedido.coluna_pai.pais_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.pais_fabricante ?? '—'}</span>,
  },
  {
    key: 'estado_fabricante',
    label: t('pedido.coluna_pai.estado_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.estado_fabricante ?? '—'}</span>,
  },
  {
    key: 'cidade_fabricante',
    label: t('pedido.coluna_pai.cidade_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_fabricante ?? '—'}</span>,
  },
  {
    key: 'endereco_fabricante',
    label: t('pedido.coluna_pai.endereco_fabricante'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_fabricante ?? '—'}</span>,
  },
  {
    key: 'zip_code_fabricante',
    label: t('pedido.coluna_pai.zip_code_fabricante'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_fabricante ?? '—'}</span>,
  },
  // ── OPE ────────────────────────────────────────────────────────────────────
  {
    key: 'cnpj_raiz_empresa_responsavel',
    label: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cnpj_raiz_empresa_responsavel ?? '—'}</span>,
  },
  {
    key: 'codigo_ope',
    label: t('pedido.coluna_pai.codigo_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.codigo_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.codigo_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.codigo_ope ?? '—'}</span>,
  },
  {
    key: 'situacao_ope',
    label: t('pedido.coluna_pai.situacao_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.situacao_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.situacao_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.situacao_ope ?? '—'}</span>,
  },
  {
    key: 'versao_ope',
    label: t('pedido.coluna_pai.versao_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.versao_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.versao_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.versao_ope ?? '—'}</span>,
  },
  {
    key: 'nome_ope',
    label: t('pedido.coluna_pai.nome_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.nome_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.nome_ope ?? '—'}</span>,
  },
  {
    key: 'pais_ope',
    label: t('pedido.coluna_pai.pais_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.pais_ope ?? '—'}</span>,
  },
  {
    key: 'estado_ope',
    label: t('pedido.coluna_pai.estado_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.estado_ope ?? '—'}</span>,
  },
  {
    key: 'cidade_ope',
    label: t('pedido.coluna_pai.cidade_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_ope ?? '—'}</span>,
  },
  {
    key: 'endereco_ope',
    label: t('pedido.coluna_pai.endereco_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_ope ?? '—'}</span>,
  },
  {
    key: 'zip_code_ope',
    label: t('pedido.coluna_pai.zip_code_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_ope ?? '—'}</span>,
  },
  {
    key: 'tin_ope',
    label: t('pedido.coluna_pai.tin_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.tin_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.tin_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.tin_ope ?? '—'}</span>,
  },
  {
    key: 'email_ope',
    label: t('pedido.coluna_pai.email_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.email_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.email_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.email_ope ?? '—'}</span>,
  },
  // ── Documentos (anexos e volumes) ───────────────────────────────────────────
  {
    key: 'anexo_pedido',
    label: t('pedido.coluna_pai.anexo_pedido'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_pai.anexo_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.anexo_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_pedido ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_proforma',
    label: t('pedido.coluna_pai.anexo_proforma'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_pai.anexo_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.anexo_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_proforma ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_invoice',
    label: t('pedido.coluna_pai.anexo_invoice'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_pai.anexo_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.anexo_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_invoice ? '📎' : '—'}</span>,
  },
  {
    key: 'quantidade_volumes_pedido',
    label: t('pedido.coluna_pai.quantidade_volumes_pedido'),
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_volumes_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_volumes_pedido_desc'),
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_volumes_pedido != null ? String(row.quantidade_volumes_pedido) : '—'}
      </span>
    ),
  },
  // ── Datas — Draft do Pedido ─────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_rascunho_pedido',
    label: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_rascunho_pedido ? fmtData(row.data_prevista_recebimento_rascunho_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_rascunho_pedido',
    label: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_rascunho_pedido ? fmtData(row.data_confirmada_recebimento_rascunho_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_rascunho_pedido',
    label: t('pedido.coluna_pai.data_meta_recebimento_rascunho_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_recebimento_rascunho_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_recebimento_rascunho_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_rascunho_pedido ? fmtData(row.data_meta_recebimento_rascunho_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_rascunho_pedido',
    label: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_rascunho_pedido ? fmtData(row.data_prevista_aprovacao_rascunho_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_rascunho_pedido',
    label: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_rascunho_pedido ? fmtData(row.data_confirmada_aprovacao_rascunho_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_rascunho_pedido',
    label: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_rascunho_pedido ? fmtData(row.data_meta_aprovacao_rascunho_pedido) : '—'}</span>,
  },
  {
    key: 'data_documento_pedido',
    label: t('pedido.coluna_pai.data_documento_pedido'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_documento_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_documento_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_documento_pedido ? fmtData(row.data_documento_pedido) : '—'}</span>,
  },
  // ── Datas — Proforma Invoice ────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_rascunho_proforma',
    label: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_rascunho_proforma ? fmtData(row.data_prevista_recebimento_rascunho_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_rascunho_proforma',
    label: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_rascunho_proforma ? fmtData(row.data_confirmada_recebimento_rascunho_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_rascunho_proforma',
    label: t('pedido.coluna_pai.data_meta_recebimento_rascunho_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_recebimento_rascunho_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_recebimento_rascunho_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_rascunho_proforma ? fmtData(row.data_meta_recebimento_rascunho_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_rascunho_proforma',
    label: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_rascunho_proforma ? fmtData(row.data_prevista_aprovacao_rascunho_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_rascunho_proforma',
    label: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_rascunho_proforma ? fmtData(row.data_confirmada_aprovacao_rascunho_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_rascunho_proforma',
    label: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_rascunho_proforma ? fmtData(row.data_meta_aprovacao_rascunho_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_proforma',
    label: t('pedido.coluna_pai.data_prevista_envio_original_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_envio_original_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_envio_original_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_proforma ? fmtData(row.data_prevista_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_proforma',
    label: t('pedido.coluna_pai.data_confirmada_envio_original_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_envio_original_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_envio_original_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_proforma ? fmtData(row.data_confirmada_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_proforma',
    label: t('pedido.coluna_pai.data_meta_envio_original_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_envio_original_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_envio_original_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_proforma ? fmtData(row.data_meta_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_proforma',
    label: t('pedido.coluna_pai.data_prevista_recebimento_original_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_recebimento_original_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_recebimento_original_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_proforma ? fmtData(row.data_prevista_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_proforma',
    label: t('pedido.coluna_pai.data_confirmada_recebimento_original_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_recebimento_original_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_recebimento_original_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_proforma ? fmtData(row.data_confirmada_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_proforma',
    label: t('pedido.coluna_pai.data_meta_recebimento_original_proforma'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_recebimento_original_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_recebimento_original_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_proforma ? fmtData(row.data_meta_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_proforma_invoice',
    label: t('pedido.coluna_pai.data_proforma_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_proforma_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_proforma_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_proforma_invoice ? fmtData(row.data_proforma_invoice) : '—'}</span>,
  },
  // ── Datas — Invoice ─────────────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_rascunho_invoice',
    label: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_recebimento_rascunho_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_rascunho_invoice ? fmtData(row.data_prevista_recebimento_rascunho_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_rascunho_invoice',
    label: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_recebimento_rascunho_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_rascunho_invoice ? fmtData(row.data_confirmada_recebimento_rascunho_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_rascunho_invoice',
    label: t('pedido.coluna_pai.data_meta_recebimento_rascunho_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_recebimento_rascunho_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_recebimento_rascunho_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_rascunho_invoice ? fmtData(row.data_meta_recebimento_rascunho_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_rascunho_invoice',
    label: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_aprovacao_rascunho_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_rascunho_invoice ? fmtData(row.data_prevista_aprovacao_rascunho_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_rascunho_invoice',
    label: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_aprovacao_rascunho_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_rascunho_invoice ? fmtData(row.data_confirmada_aprovacao_rascunho_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_rascunho_invoice',
    label: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_aprovacao_rascunho_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_rascunho_invoice ? fmtData(row.data_meta_aprovacao_rascunho_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_invoice',
    label: t('pedido.coluna_pai.data_prevista_envio_original_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_envio_original_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_envio_original_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_invoice ? fmtData(row.data_prevista_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_invoice',
    label: t('pedido.coluna_pai.data_confirmada_envio_original_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_envio_original_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_envio_original_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_invoice ? fmtData(row.data_confirmada_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_invoice',
    label: t('pedido.coluna_pai.data_meta_envio_original_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_envio_original_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_envio_original_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_invoice ? fmtData(row.data_meta_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_invoice',
    label: t('pedido.coluna_pai.data_prevista_recebimento_original_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_prevista_recebimento_original_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_prevista_recebimento_original_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_invoice ? fmtData(row.data_prevista_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_invoice',
    label: t('pedido.coluna_pai.data_confirmada_recebimento_original_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_confirmada_recebimento_original_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_confirmada_recebimento_original_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_invoice ? fmtData(row.data_confirmada_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_invoice',
    label: t('pedido.coluna_pai.data_meta_recebimento_original_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_meta_recebimento_original_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_meta_recebimento_original_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_invoice ? fmtData(row.data_meta_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_invoice',
    label: t('pedido.coluna_pai.data_invoice'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: t('pedido.coluna_pai.data_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.data_invoice ? fmtData(row.data_invoice) : '—'}</span>,
  },
  ]
}

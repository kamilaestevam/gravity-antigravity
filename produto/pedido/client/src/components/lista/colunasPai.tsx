/**
 * colunasPai.tsx — Definição de colunas do Pedido (linha pai)
 *
 * Exporta COLUNAS_PAI (GTColuna<Pedido>[]) e o _regrasAlertasRef compartilhado.
 * Separado para manter ListaPedidos.tsx abaixo de 2000 linhas.
 */

import React from 'react'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/types'
import { STATUS_PEDIDO_LABELS, fmtQuantidade, fmtData } from '../../shared/types'
import type { RegrasConfigBackend } from '../../shared/api'
import { LABELS_FILTRO_INVERSO } from './filtros'
import { UNIDADES_PESO_OPCOES } from '@nucleo/tabelas-base-unidades-peso'
import { getEditavel } from '../../shared/columnBehaviorConfig'

// Re-export so callers that used to import from ListaPedidos still work
export { LABELS_FILTRO_INVERSO }

// ── Status: cores padrão e leitura de localStorage ───────────────────────────

const PEDIDO_STATUS_STORAGE_KEY = 'pedido:status_config'

/** Cores padrão por código de status (backend) */
const STATUS_CORES_DEFAULT: Record<string, string> = {
  draft:         '#94a3b8',
  aberto:        '#60a5fa',
  transferencia: '#818cf8',
  consolidado:   '#a78bfa',
  cancelado:     '#f87171',
}

/** Lê o mapa {id → cor} salvo pelo Configuracoes via localStorage */
export function lerStatusCores(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PEDIDO_STATUS_STORAGE_KEY)
    if (!raw) return {}
    const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
    // mapeia por id direto
    const mapa: Record<string, string> = {}
    for (const [id, cfg] of Object.entries(parsed)) mapa[id] = cfg.cor
    return mapa
  } catch { return {} }
}

export function getStatusCor(status: string): string {
  const local = lerStatusCores()
  return local[status] ?? STATUS_CORES_DEFAULT[status] ?? '#64748b'
}

/** Lê o label de um status — inclui status customizados do localStorage */
export function getStatusLabel(status: string): string {
  try {
    const raw = localStorage.getItem(PEDIDO_STATUS_STORAGE_KEY)
    if (raw) {
      const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
      if (parsed[status]?.label) return parsed[status].label
    }
  } catch { /* ignore */ }
  return STATUS_PEDIDO_LABELS[status as keyof typeof STATUS_PEDIDO_LABELS] ?? status
}

// ── Casas decimais configuráveis pelo usuário ────────────────────────────────

export function lerCasasDecimaisConfig(): Record<string, number> {
  try {
    const raw = localStorage.getItem('pedido:casas_decimais')
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch { /* ignore */ }
  return {}
}

/** Retorna casas decimais para um campo, respeitando config do usuário em Configurações */
export function getCasas(campo: string, padrao: number): number {
  const config = lerCasasDecimaisConfig()
  return config[campo] ?? padrao
}

// ── Ref de alertas: carregado uma vez no mount, acessível pelos renders estáticos ──
export const _regrasAlertasRef: { current: RegrasConfigBackend | null } = { current: null }

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

export function renderQtdPedido(row: Pedido, campoItem: keyof PedidoItem, casas = 0, tooltip?: { titulo: string; descricao: string }) {
  const itens = row.itens ?? []
  if (itens.length === 0) return <span style={{ fontVariantNumeric: 'tabular-nums' }}>—</span>
  const unidades = [...new Set(itens.map(i => i.unidade_comercializada_item ?? 'UN'))]
  const wrap = (node: React.ReactNode) => tooltip
    ? <TooltipGlobal titulo={tooltip.titulo} descricao={tooltip.descricao}><span style={{ display: 'contents' }}>{node}</span></TooltipGlobal>
    : <>{node}</>
  const soma = itens.reduce((s, i) => s + (Number(i[campoItem]) || 0), 0)
  return wrap(
    <span className="gtv-celula-moeda">
      {fmtQuantidade(soma, casas)}
      <span className="gtv-celula-unidade-badge">{unidades[0]}</span>
    </span>
  )
}

// ── Helper: badge de divergência entre itens ─────────────────────────────────
// Usado pelas colunas que agregam valores dos filhos sem precisar de row.itens.
// Backend já pré-computa os flags _divergente e _valor_unico na list view.
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
  if (!valor && !divergente) return <span style={centro}>—</span>
  if (divergente) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600 }}
        title={labelDivergente}>
        <WarnIcon />{labelDivergente ?? 'Valores divergentes'}
      </span>
    )
  }
  return <span style={opts?.fontMono ? { fontFamily: 'var(--font-mono, monospace)' } : undefined}>{valor ?? '—'}</span>
}

export const COLUNAS_PAI: GTColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: 'Nº Pedido / Nº do Item',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('numero_pedido'),
    campo: 'numero_pedido',
    tooltipTitulo: 'Nº Pedido / Nº do Item',
    tooltipDescricao: 'Número do pedido (linha pai) ou Nº do Item (linha filho)',
    grupo: 'Identificação',
  },
  {
    key: 'tipo_operacao',
    label: 'Tipo de Operação',
    tipo: 'badge',
    align: 'center',
    filtravel: true,
    editavel: getEditavel('tipo_operacao'),
    campo: 'tipo_operacao',
    opcoes: [
      { valor: 'importacao', label: 'Importação' },
      { valor: 'exportacao', label: 'Exportação' },
    ],
    tooltipTitulo: 'Tipo de Operação',
    tooltipDescricao: 'Importação (Purchase Order) ou Exportação (Sales Order)',
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
    label: 'Nome do Exportador',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_exportador'),
    tooltipBloqueado: 'Exportador definido automaticamente pelo workspace — não editável em Exportação',
    tooltipTitulo: 'Nome do Exportador',
    tooltipDescricao: 'Fornecedor/exportador estrangeiro na operação de importação',
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_exportador, row.nome_exportador_divergente, 'Exportadores divergentes entre itens'),
  },
  {
    key: 'nome_importador',
    label: 'Nome do Importador',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_importador'),
    tooltipBloqueado: 'Importador definido automaticamente pelo workspace — não editável em Importação',
    tooltipTitulo: 'Nome do Importador',
    tooltipDescricao: 'Comprador/importador estrangeiro na operação de exportação',
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_importador, row.nome_importador_divergente, 'Importadores divergentes entre itens'),
  },
  {
    key: 'nome_fabricante',
    label: 'Nome do Fabricante',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_fabricante'),
    campo: 'nome_fabricante',
    tooltipTitulo: 'Nome do Fabricante',
    tooltipDescricao: 'Identificação da origem produtiva',
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_fabricante, row.nome_fabricante_divergente, 'Fabricantes divergentes entre itens'),
  },
  {
    key: 'referencia_importador',
    label: 'Referência Importador',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_importador'),
    tooltipTitulo: 'Referência do Importador',
    tooltipDescricao: 'Código de referência interna do importador para o pedido',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.referencia_importador, row.referencia_importador_divergente, 'Referências divergentes entre itens'),
  },
  {
    key: 'referencia_exportador',
    label: 'Referência Exportador',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_exportador'),
    tooltipTitulo: 'Referência do Exportador',
    tooltipDescricao: 'Código de referência utilizado pelo exportador',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.referencia_exportador, row.referencia_exportador_divergente, 'Referências divergentes entre itens'),
  },
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('ncm'),
    tooltipTitulo: 'NCM',
    tooltipDescricao: 'Nomenclatura Comum do Mercosul — quantidade de NCMs distintos nos itens do pedido',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      if (row.ncm_divergente) {
        const label = `⚠ ${row.ncms_distintos_count ?? '?'} NCMs`
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}
            title="Itens com NCMs diferentes">
            <WarnIcon />{label}
          </span>
        )
      }
      if (!row.ncm_valor_unico) return <span style={{ display: 'block', textAlign: 'center' }}>—</span>
      const d = row.ncm_valor_unico.replace(/\D/g, '')
      const fmt = d.length === 8 ? `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6)}` : row.ncm_valor_unico
      return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{fmt}</span>
    },
  },
  {
    key: 'numero_proforma',
    label: 'Número da Proforma',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('numero_proforma'),
    campo: 'numero_proforma',
    tooltipTitulo: 'Número da Proforma',
    tooltipDescricao: 'Referência da Proforma Invoice vinculada',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => <span>{row.numero_proforma ?? '—'}</span>,
  },
  {
    key: 'numero_invoice',
    label: 'Número da Invoice',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('numero_invoice'),
    campo: 'numero_invoice',
    tooltipTitulo: 'Número da Invoice',
    tooltipDescricao: 'Identificador da Commercial Invoice (Fatura)',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => <span>{row.numero_invoice ?? '—'}</span>,
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('incoterm'),
    tooltipTitulo: 'Incoterm',
    tooltipDescricao: 'Regra de entrega: FOB, CIF, EXW, etc. Editar no pedido propaga para todos os itens.',
    grupo: 'Financeiro',
    align: 'center',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.incoterm, row.incoterm_divergente, 'Incoterms divergentes entre itens'),
  },
  {
    key: 'valor_total_pedido',
    label: 'Valor Total do Pedido',
    tipo: 'moeda',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: 2,
    tooltipTitulo: 'Valor Total do Pedido',
    tooltipDescricao: 'Calculado com base nos itens — não editável. Itens com moedas diferentes impedem o cálculo',
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) => {
      const tooltipDescricao = 'Calculado com base nos itens — não editável. Itens com moedas diferentes impedem o cálculo'
      const moeda = row.moeda_pedido ?? 'USD'
      const num = Number(row.valor_total_pedido)
      return (
        <TooltipGlobal titulo="Valor Total do Pedido" descricao={tooltipDescricao}>
          <span className="gtv-celula-moeda">
            <span className="gtv-celula-moeda-badge">{moeda}</span>
            {row.valor_total_pedido != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'quantidade_total_inicial_pedido',
    label: 'Qtd. Inicial do Pedido',
    tipo: 'unidade',
    align: 'right',
    tooltipTitulo: 'Qtd. Inicial do Pedido',
    tooltipDescricao: 'Calculado com base nos itens — não editável. Itens com unidades diferentes impedem o cálculo',
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_inicial_item_pedido', 0, { titulo: 'Qtd. Inicial do Pedido', descricao: 'Calculado com base nos itens — não editável. Itens com unidades diferentes impedem o cálculo' }),
  },
  {
    key: 'quantidade_pronta_itens_pedido_total',
    label: 'Qtd. Pronta do Pedido',
    tipo: 'unidade',
    align: 'right',
    tooltipTitulo: 'Qtd. Pronta do Pedido',
    tooltipDescricao: 'Calculado com base nos itens — não editável. Itens com unidades diferentes impedem o cálculo',
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_pronta_total_item_pedido', 0, { titulo: 'Qtd. Pronta do Pedido', descricao: 'Calculado com base nos itens — não editável. Itens com unidades diferentes impedem o cálculo' }),
  },
  {
    key: 'saldo_itens_do_pedido',
    label: 'Saldo do Pedido',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Saldo do Pedido',
    tooltipDescricao: <span>Calculado com base nos itens — não editável. <a href="/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>,
    tooltipInterativo: true,
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => {
      const total = row.quantidade_total_inicial_pedido ?? null
      const transf = row.quantidade_transferida_total ?? null
      const qtd = row.saldo_itens_do_pedido ?? (total != null && transf != null ? Math.max(0, total - transf) : null)
      return (
        <TooltipGlobal
          titulo="Saldo do Pedido"
          descricao={<span>Calculado com base nos itens — não editável. <a href="/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>}
          interativo
        >
          <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#60a5fa' : undefined }}>
            {qtd != null ? fmtQuantidade(qtd, getCasas('quantidade_total_inicial_pedido', 0)) : '—'}
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'quantidade_transferida_total',
    label: 'Qtd. Transferida do Pedido',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Qtd. Transferida do Pedido',
    tooltipDescricao: 'Soma da quantidade transferida de todos os itens do pedido.',
    tooltipBloqueado: 'Campo calculado — soma de quantidade_transferida_item_pedido de todos os itens. Alterado apenas por operações de transferência.',
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#60a5fa' }}>
        {row.quantidade_transferida_total != null ? fmtQuantidade(row.quantidade_transferida_total, getCasas('quantidade_total_inicial_pedido', 0)) : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada_total_pedido',
    label: 'Qtd. Cancelada do Pedido',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Qtd. Cancelada do Pedido',
    tooltipDescricao: 'Total cancelado permanentemente nos itens do pedido — subtrai do saldo inicial.',
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: (row.quantidade_cancelada_total_pedido ?? 0) > 0 ? 'var(--color-error, #ef4444)' : undefined }}>
        {row.quantidade_cancelada_total_pedido != null ? fmtQuantidade(row.quantidade_cancelada_total_pedido, getCasas('quantidade_total_inicial_pedido', 0)) : '—'}
      </span>
    ),
  },
  {
    key: 'data_emissao_pedido',
    label: 'Data P.O',
    tipo: 'periodo',
    filtravel: true,
    editavel: getEditavel('data_emissao_pedido'),
    campo: 'data_emissao_pedido',
    tooltipTitulo: 'Data do Pedido',
    tooltipDescricao: 'Data de registro ou emissão da Purchase Order',
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
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Status do Pedido',
    tooltipDescricao: 'Ciclo de vida: Draft, Aberto, Em Transferência, Consolidado, Cancelado',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      const cor = getStatusCor(row.status)
      return (
        <StatusBadgeGlobal
          valor={getStatusLabel(row.status)}
          genero="masculino"
          style={{
            color: cor,
            background: `${cor}1e`,
            border: `1px solid ${cor}33`,
          }}
        />
      )
    },
    findDisplay: (row: Pedido) => getStatusLabel(row.status),
  },
  // ── Dados comerciais ────────────────────────────────────────────────────────
  {
    key: 'referencia_fabricante',
    label: 'Referência do Fabricante',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_fabricante'),
    tooltipTitulo: 'Referência do Fabricante',
    tooltipDescricao: 'Código de referência utilizado pelo fabricante para identificar o pedido',
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.referencia_fabricante, row.referencia_fabricante_divergente, 'Referências divergentes entre itens'),
  },
  {
    key: 'cobertura_cambial',
    label: 'Cobertura Cambial do Pedido',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('cobertura_cambial'),
    campo: 'cobertura_cambial',
    tooltipTitulo: 'Cobertura Cambial',
    tooltipDescricao: 'Modalidade de cobertura cambial por item. Se os itens divergem, exibe alerta.',
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.cobertura_cambial_valor_unico, row.cobertura_cambial_divergente, 'Coberturas cambiais divergentes entre itens'),
  },
  {
    key: 'condicao_pagamento_pedido',
    label: 'Condição de Pagamento do Pedido',
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('condicao_pagamento_pedido'),
    tooltipTitulo: 'Condição de Pagamento',
    tooltipDescricao: 'Prazo e forma de pagamento acordados com o exportador. Editar no pedido propaga para todos os itens.',
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.condicao_pagamento_pedido, row.condicao_pagamento_divergente, 'Condições de pagamento divergentes entre itens'),
  },
  // ── Dados físicos ───────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_total_pedido',
    label: 'Peso Líquido Total do Pedido',
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('peso_liquido_total_pedido', 3),
    unidades: UNIDADES_PESO_OPCOES,
    tooltipTitulo: 'Peso Líquido Total do Pedido',
    tooltipDescricao: 'Calculado com base nos itens — não editável. Itens sem peso líquido informado impedem o cálculo',
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('peso_liquido_total_pedido', 3)
      const num = Number(row.peso_liquido_total_pedido ?? 0)
      return (
        <TooltipGlobal titulo="Peso Líquido Total do Pedido" descricao="Calculado com base nos itens — não editável. Itens sem peso líquido informado impedem o cálculo">
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
    label: 'Peso Bruto Total do Pedido',
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('peso_bruto_total_pedido', 3),
    unidades: UNIDADES_PESO_OPCOES,
    tooltipTitulo: 'Peso Bruto Total do Pedido',
    tooltipDescricao: 'Calculado com base nos itens — não editável. Itens sem peso bruto informado impedem o cálculo',
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('peso_bruto_total_pedido', 3)
      const num = Number(row.peso_bruto_total_pedido ?? 0)
      return (
        <TooltipGlobal titulo="Peso Bruto Total do Pedido" descricao="Calculado com base nos itens — não editável. Itens sem peso bruto informado impedem o cálculo">
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
    label: 'Cubagem Total do Pedido',
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('cubagem_total_pedido', 4),
    unidades: [{ sigla: 'm³', rotulo: 'Metro Cúbico' }],
    tooltipTitulo: 'Cubagem Total do Pedido',
    tooltipDescricao: 'Calculado com base nos itens — não editável. Itens sem cubagem informada impedem o cálculo',
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('cubagem_total_pedido', 4)
      const num = Number(row.cubagem_total_pedido ?? 0)
      return (
        <TooltipGlobal titulo="Cubagem Total do Pedido" descricao="Calculado com base nos itens — não editável. Itens sem cubagem informada impedem o cálculo">
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
    label: 'Data Prevista Pedido Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Prevista — Pedido Pronto',
    tooltipDescricao: 'Data prevista para o pedido estar pronto para embarque (confirmada pelo exportador)',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_pedido_pronto ? fmtData(row.data_prevista_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_confirmada_pedido_pronto',
    label: 'Data Confirmada Pedido Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Confirmada — Pedido Pronto',
    tooltipDescricao: 'Data confirmada para o pedido estar pronto, após validação do exportador',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_pedido_pronto ? fmtData(row.data_confirmada_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_meta_pedido_pronto',
    label: 'Data Meta Pedido Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Meta — Pedido Pronto',
    tooltipDescricao: 'Data meta definida pelo importador para o pedido estar pronto',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_pedido_pronto ? fmtData(row.data_meta_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_prevista_inspecao_pedido',
    label: 'Data Prevista Inspeção do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Prevista — Inspeção do Pedido',
    tooltipDescricao: 'Data prevista para realização da inspeção pré-embarque (PSI/ISF)',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_inspecao_pedido ? fmtData(row.data_prevista_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_inspecao_pedido',
    label: 'Data Confirmada Inspeção do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Confirmada — Inspeção do Pedido',
    tooltipDescricao: 'Data confirmada para realização da inspeção pré-embarque',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_inspecao_pedido ? fmtData(row.data_confirmada_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_inspecao_pedido',
    label: 'Data Meta Inspeção do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Meta — Inspeção do Pedido',
    tooltipDescricao: 'Data meta definida pelo importador para a inspeção do pedido',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_inspecao_pedido ? fmtData(row.data_meta_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_coleta_pedido',
    label: 'Data Prevista Coleta do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Prevista — Coleta do Pedido',
    tooltipDescricao: 'Data prevista para a coleta/retirada da mercadoria no exportador',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_coleta_pedido ? fmtData(row.data_prevista_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_coleta_pedido',
    label: 'Data Confirmada Coleta do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Confirmada — Coleta do Pedido',
    tooltipDescricao: 'Data confirmada para coleta/retirada da mercadoria',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_coleta_pedido ? fmtData(row.data_confirmada_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_coleta_pedido',
    label: 'Data Meta Coleta do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data Meta — Coleta do Pedido',
    tooltipDescricao: 'Data meta definida pelo importador para a coleta do pedido',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_coleta_pedido ? fmtData(row.data_meta_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_pedido',
    label: 'Data Consolidação do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data de Consolidação do Pedido',
    tooltipDescricao: 'Data em que o pedido foi consolidado em um processo logístico',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_consolidacao_pedido ? fmtData(row.data_consolidacao_pedido) : '—'}</span>,
  },
  {
    key: 'data_transferencia_saldo_pedido',
    label: 'Dt Transferência Qtd. do Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data de Transferência de Saldo',
    tooltipDescricao: 'Data em que o saldo do pedido foi transferido para um processo',
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => <span>{row.data_transferencia_saldo_pedido ? fmtData(row.data_transferencia_saldo_pedido) : '—'}</span>,
  },
  // ── Exportador (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_exportador',
    label: 'País do Exportador',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'País do Exportador',
    tooltipDescricao: 'País de origem do exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_exportador ?? '—'}</span>,
  },
  {
    key: 'estado_exportador',
    label: 'Estado/Província do Exportador',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Estado ou Província do Exportador',
    tooltipDescricao: 'Estado ou província do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_exportador ?? '—'}</span>,
  },
  {
    key: 'cidade_exportador',
    label: 'Cidade do Exportador',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Cidade do Exportador',
    tooltipDescricao: 'Cidade do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_exportador ?? '—'}</span>,
  },
  {
    key: 'endereco_exportador',
    label: 'Endereço do Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Endereço do Exportador',
    tooltipDescricao: 'Endereço completo do exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_exportador ?? '—'}</span>,
  },
  {
    key: 'zip_code_exportador',
    label: 'Zipcode do Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Zip Code do Exportador',
    tooltipDescricao: 'Código postal do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_exportador ?? '—'}</span>,
  },
  {
    key: 'exportador_ou_fabricante',
    label: 'Exportador/Fabricante?',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Exportador ou Fabricante?',
    tooltipDescricao: 'Indica se o exportador é também o fabricante do produto',
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_ou_fabricante ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante',
    label: 'Relação Exportador e Fabricante',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Relação entre Exportador e Fabricante',
    tooltipDescricao: 'Tipo de relação entre o exportador e o fabricante do produto',
    render: (_val: unknown, row: Pedido) => <span>{row.relacao_exportador_fabricante ?? '—'}</span>,
  },
  // ── Contato do exportador ───────────────────────────────────────────────────
  {
    key: 'nome_contato_exportador',
    label: 'Contato Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Nome do Contato do Exportador',
    tooltipDescricao: 'Nome do contato principal no exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.nome_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'email_contato_exportador',
    label: 'Email do Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'E-mail do Contato do Exportador',
    tooltipDescricao: 'E-mail do contato principal no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.email_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'whatsapp_contato_exportador',
    label: 'Whatsapp do Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'WhatsApp do Contato do Exportador',
    tooltipDescricao: 'Número de WhatsApp do contato do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.whatsapp_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'cargo_contato_exportador',
    label: 'Cargo do Contato no Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Cargo do Contato do Exportador',
    tooltipDescricao: 'Cargo ou função do contato no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.cargo_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'departamento_contato_exportador',
    label: 'Departamento do Contato no Exportador',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Departamento do Contato do Exportador',
    tooltipDescricao: 'Departamento do contato no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.departamento_contato_exportador ?? '—'}</span>,
  },
  // ── Fabricante (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_fabricante',
    label: 'País do Fabricante',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'País do Fabricante',
    tooltipDescricao: 'País onde o produto foi fabricado',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_fabricante ?? '—'}</span>,
  },
  {
    key: 'estado_fabricante',
    label: 'Estado/Província do Fabricante',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Estado ou Província do Fabricante',
    tooltipDescricao: 'Estado ou província onde o fabricante está localizado',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_fabricante ?? '—'}</span>,
  },
  {
    key: 'cidade_fabricante',
    label: 'Cidade do Fabricante',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Cidade do Fabricante',
    tooltipDescricao: 'Cidade onde o fabricante está localizado',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_fabricante ?? '—'}</span>,
  },
  {
    key: 'endereco_fabricante',
    label: 'Endereço do Fabricante',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Endereço do Fabricante',
    tooltipDescricao: 'Endereço completo do fabricante',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_fabricante ?? '—'}</span>,
  },
  {
    key: 'zip_code_fabricante',
    label: 'Zipcode do Fabricante',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Zip Code do Fabricante',
    tooltipDescricao: 'Código postal do fabricante',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_fabricante ?? '—'}</span>,
  },
  // ── OPE ────────────────────────────────────────────────────────────────────
  {
    key: 'cnpj_raiz_empresa_responsavel',
    label: 'CNPJ Raiz Empresa - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'CNPJ Raiz Empresa Responsável',
    tooltipDescricao: 'CNPJ raiz da empresa responsável pelo produto no catálogo',
    render: (_val: unknown, row: Pedido) => <span>{row.cnpj_raiz_empresa_responsavel ?? '—'}</span>,
  },
  {
    key: 'codigo_ope',
    label: 'Código OPE - Catálogo',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Código do Operador Estrangeiro (OPE)',
    tooltipDescricao: 'Código do operador estrangeiro cadastrado na DUIMP',
    render: (_val: unknown, row: Pedido) => <span>{row.codigo_ope ?? '—'}</span>,
  },
  {
    key: 'situacao_ope',
    label: 'Situação OPE - Catálogo',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'Situação do Operador Estrangeiro',
    tooltipDescricao: 'Situação cadastral do OPE na DUIMP (Ativo, Inativo, etc.)',
    render: (_val: unknown, row: Pedido) => <span>{row.situacao_ope ?? '—'}</span>,
  },
  {
    key: 'versao_ope',
    label: 'Versão OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Versão do Operador Estrangeiro',
    tooltipDescricao: 'Versão do cadastro do OPE na DUIMP',
    render: (_val: unknown, row: Pedido) => <span>{row.versao_ope ?? '—'}</span>,
  },
  {
    key: 'nome_ope',
    label: 'Nome OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Nome do Operador Estrangeiro',
    tooltipDescricao: 'Nome completo do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.nome_ope ?? '—'}</span>,
  },
  {
    key: 'pais_ope',
    label: 'País OPE - Catálogo',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: 'País do Operador Estrangeiro',
    tooltipDescricao: 'País do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_ope ?? '—'}</span>,
  },
  {
    key: 'estado_ope',
    label: 'Estado OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Estado do Operador Estrangeiro',
    tooltipDescricao: 'Estado ou província do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_ope ?? '—'}</span>,
  },
  {
    key: 'cidade_ope',
    label: 'Cidade OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Cidade do Operador Estrangeiro',
    tooltipDescricao: 'Cidade do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_ope ?? '—'}</span>,
  },
  {
    key: 'endereco_ope',
    label: 'Endereço OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Endereço do Operador Estrangeiro',
    tooltipDescricao: 'Endereço completo do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_ope ?? '—'}</span>,
  },
  {
    key: 'zip_code_ope',
    label: 'ZIP OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'Zip Code do Operador Estrangeiro',
    tooltipDescricao: 'Código postal do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_ope ?? '—'}</span>,
  },
  {
    key: 'tin_ope',
    label: 'TIN OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'TIN do Operador Estrangeiro',
    tooltipDescricao: 'Número de identificação fiscal (Tax Identification Number) do OPE',
    render: (_val: unknown, row: Pedido) => <span>{row.tin_ope ?? '—'}</span>,
  },
  {
    key: 'email_ope',
    label: 'E-mail OPE - Catálogo',
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: 'E-mail do Operador Estrangeiro',
    tooltipDescricao: 'E-mail de contato do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.email_ope ?? '—'}</span>,
  },
  // ── Documentos (anexos e volumes) ───────────────────────────────────────────
  {
    key: 'anexo_pedido',
    label: 'Anexo do Pedido',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Anexo do Pedido',
    tooltipDescricao: 'Arquivo do pedido (Purchase Order) em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_pedido ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_proforma',
    label: 'Anexo da Proforma',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Anexo da Proforma Invoice',
    tooltipDescricao: 'Arquivo da Proforma Invoice em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_proforma ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_invoice',
    label: 'Anexo da Invoice',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Anexo da Invoice',
    tooltipDescricao: 'Arquivo da Commercial Invoice em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_invoice ? '📎' : '—'}</span>,
  },
  {
    key: 'quantidade_volumes_pedido',
    label: 'Quantidade de Volumes do Pedido',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Quantidade de Volumes Total do Pedido',
    tooltipDescricao: 'Número total de volumes (caixas, pallets, etc.) do pedido',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_volumes_pedido != null ? String(row.quantidade_volumes_pedido) : '—'}
      </span>
    ),
  },
  // ── Datas — Draft do Pedido ─────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_pedido',
    label: 'Dt Prev. Recebimento Draft Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data prevista para recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_pedido ? fmtData(row.data_prevista_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_pedido',
    label: 'Dt Conf. Recebimento Draft Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_pedido ? fmtData(row.data_confirmada_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_pedido',
    label: 'Dt Meta Recebimento Draft Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data meta para recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_pedido ? fmtData(row.data_meta_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_pedido',
    label: 'Dt Prev. Aprovação Draft Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data prevista para aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_pedido ? fmtData(row.data_prevista_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_pedido',
    label: 'Dt Conf. Aprovação Draft Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_pedido ? fmtData(row.data_confirmada_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_pedido',
    label: 'Dt Meta Aprovação Draft Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data meta para aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_pedido ? fmtData(row.data_meta_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_documento_pedido',
    label: 'Data do Documento Pedido',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data do Documento Pedido',
    tooltipDescricao: 'Data de emissão do documento do pedido (Purchase Order)',
    render: (_val: unknown, row: Pedido) => <span>{row.data_documento_pedido ? fmtData(row.data_documento_pedido) : '—'}</span>,
  },
  // ── Datas — Proforma Invoice ────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_proforma',
    label: 'Dt Prev. Recebimento Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data prevista para recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_proforma ? fmtData(row.data_prevista_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_proforma',
    label: 'Dt Conf. Recebimento Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_proforma ? fmtData(row.data_confirmada_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_proforma',
    label: 'Dt Meta Recebimento Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data meta para recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_proforma ? fmtData(row.data_meta_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_proforma',
    label: 'Dt Prev. Aprovação Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_proforma ? fmtData(row.data_prevista_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_proforma',
    label: 'Dt Conf. Aprovação Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_proforma ? fmtData(row.data_confirmada_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_proforma',
    label: 'Dt Meta Aprovação Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data meta para aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_proforma ? fmtData(row.data_meta_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_proforma',
    label: 'Dt Prev. Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data prevista para envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_proforma ? fmtData(row.data_prevista_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_proforma',
    label: 'Dt Conf. Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_proforma ? fmtData(row.data_confirmada_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_proforma',
    label: 'Dt Meta Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data meta para envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_proforma ? fmtData(row.data_meta_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_proforma',
    label: 'Dt Prev. Recebimento Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data prevista para recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_proforma ? fmtData(row.data_prevista_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_proforma',
    label: 'Dt Conf. Recebimento Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_proforma ? fmtData(row.data_confirmada_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_proforma',
    label: 'Dt Meta Recebimento Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data meta para recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_proforma ? fmtData(row.data_meta_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_proforma_invoice',
    label: 'Data do Documento Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data da Proforma Invoice',
    tooltipDescricao: 'Data de emissão da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_proforma_invoice ? fmtData(row.data_proforma_invoice) : '—'}</span>,
  },
  // ── Datas — Invoice ─────────────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_invoice',
    label: 'Dt Prev. Recebimento Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data prevista para recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_invoice ? fmtData(row.data_prevista_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_invoice',
    label: 'Dt Conf. Recebimento Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_invoice ? fmtData(row.data_confirmada_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_invoice',
    label: 'Dt Meta Recebimento Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data meta para recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_invoice ? fmtData(row.data_meta_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_invoice',
    label: 'Dt Prev. Aprovação Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_invoice ? fmtData(row.data_prevista_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_invoice',
    label: 'Dt Conf. Aprovação Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_invoice ? fmtData(row.data_confirmada_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_invoice',
    label: 'Dt Meta Aprovação Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data meta para aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_invoice ? fmtData(row.data_meta_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_invoice',
    label: 'Dt Prev. Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Envio — Original da Invoice',
    tooltipDescricao: 'Data prevista para envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_invoice ? fmtData(row.data_prevista_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_invoice',
    label: 'Dt Conf. Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Envio — Original da Invoice',
    tooltipDescricao: 'Data confirmada de envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_invoice ? fmtData(row.data_confirmada_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_invoice',
    label: 'Dt Meta Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Envio — Original da Invoice',
    tooltipDescricao: 'Data meta para envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_invoice ? fmtData(row.data_meta_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_invoice',
    label: 'Dt Prev. Recebimento Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Prevista de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data prevista para recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_invoice ? fmtData(row.data_prevista_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_invoice',
    label: 'Dt Conf. Recebimento Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Confirmada de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_invoice ? fmtData(row.data_confirmada_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_invoice',
    label: 'Dt Meta Recebimento Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data Meta de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data meta para recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_invoice ? fmtData(row.data_meta_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_invoice',
    label: 'Data do Documento Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Datas',
    tooltipTitulo: 'Data da Invoice',
    tooltipDescricao: 'Data de emissão da Commercial Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_invoice ? fmtData(row.data_invoice) : '—'}</span>,
  },
]

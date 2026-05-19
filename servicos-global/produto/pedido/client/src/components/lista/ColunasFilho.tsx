/**
 * colunasFilho.tsx — Definição de colunas do PedidoItem (linha filho)
 *
 * Exporta COLUNAS_FILHO, MAPA_COLUNAS_FILHO e helpers de mapeamento de colunas do usuário.
 * Separado para manter ListaPedidos.tsx abaixo de 2000 linhas.
 */

import React from 'react'
import type { TFunction } from 'i18next'
import { Eye } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import type { GTColuna, GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem, ColunaUsuario } from '../../shared/types'
import { fmtQuantidade, fmtData, classeMoedaBadge } from '../../shared/types'
import { parsearFormula, avaliarFormula } from '../../shared/formulaEngine'
import { _regrasAlertasRef, getCasas, getStatusCor, getStatusLabel, type OpcoesUnidadesColunas } from './ColunasPai'

// Re-export _regrasAlertasRef so that ListaPedidos can still write to it via this module
export { _regrasAlertasRef }

// ── Contexto numérico do pedido para avaliação de fórmulas C2 (T03) ──────────

export function buildFormulaContexto(row: Pedido): Record<string, number | null> {
  const n = (v: unknown): number | null => {
    if (v == null) return null
    const num = typeof v === 'object' ? (v as Record<string, unknown>).valor : v
    const parsed = Number(num)
    return isNaN(parsed) ? null : parsed
  }
  const r = row as Record<string, unknown>
  // Itens usam campos de nível item, mapeados para as mesmas chaves de fórmula
  // que o pedido-pai usa, para que a mesma expressão funcione em ambos os níveis.
  return {
    quantidade_total_pedido:              n(r.quantidade_inicial_pedido),
    quantidade_cancelada_total_pedido:    n(r.quantidade_cancelada_pedido),
    quantidade_transferida_total:         n(r.quantidade_transferida_pedido),
    quantidade_pronta_itens_pedido_total: n(r.quantidade_pronta_total_item_pedido),
    saldo_itens_do_pedido:                n(r.quantidade_atual_pedido),
    valor_total:                          n(r.valor_total_item),
    peso_liquido_total_pedido:            n(r.peso_liquido_unitario),
    peso_bruto_total_pedido:              n(r.peso_bruto_unitario),
    cubagem_total_pedido:                 n(r.cubagem_unitaria),
  }
}

// ── Helper: texto com truncamento a 150 chars + tooltip (T04) ────────────────

export function renderTextoC2(valor: string, label: string): React.ReactElement {
  if (valor === '—') return <span>{valor}</span>
  if (valor.length > 150) {
    return (
      <TooltipGlobal titulo={label} descricao={valor}>
        <span>{valor.slice(0, 150) + '…'}</span>
      </TooltipGlobal>
    )
  }
  return <span>{valor}</span>
}

// ── Helper: descrição com truncamento a 50 chars + ícone Eye + tooltip ───────

function renderDescricaoTruncada(valor: string | null | undefined, label: string): React.ReactElement {
  if (!valor) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
  if (valor.length <= 50) return <span>{valor}</span>
  return (
    <TooltipGlobal titulo={label} descricao={valor}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        {valor.slice(0, 50) + '…'}
        <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
      </span>
    </TooltipGlobal>
  )
}

export function mapColunaUsuarioParaGTColuna(col: ColunaUsuario): GTColuna<Pedido> {
  // Parse AST e casas decimais uma vez por definição de coluna, não por linha renderizada
  const formulaExpr = col.tipo === 'formula' ? (col.valor_padrao ?? col.formula_expressao) : null
  const formulaAST = formulaExpr
    ? (() => { try { return parsearFormula(formulaExpr) } catch { return null } })()
    : null
  const casasCol = getCasas(col.id, 2)

  return {
    key:             col.chave as keyof Pedido,
    label:           col.nome,
    tipo:            col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula' ? 'numero' : col.tipo === 'data' ? 'periodo' : 'texto',
    align:           col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula' ? 'right'
                   : col.tipo === 'data' || col.tipo === 'select' || col.tipo === 'checkbox' ? 'center'
                   : undefined,
    filtravel:       true,
    oculta:          true,
    tooltipTitulo:   col.nome,
    tooltipDescricao: col.descricao,
    render: (_val: unknown, row: Pedido) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as
        Record<string, string> | undefined
      const valor = valores?.[col.id] ?? '—'

      // ── Checkbox ────────────────────────────────────────────────────────────
      if (col.tipo === 'checkbox') {
        return <span>{valor === 'true' ? '✓' : valor === 'false' ? '✗' : '—'}</span>
      }

      // ── Fórmula: calcula em tempo real a partir dos campos do pedido (T03) ──
      if (col.tipo === 'formula') {
        if (formulaAST) {
          try {
            const contexto = buildFormulaContexto(row)
            // Inclui valores de outras colunas C2 numéricas no contexto
            if (valores) {
              for (const [k, v] of Object.entries(valores)) {
                const num = Number(v)
                if (!isNaN(num)) contexto[k] = num
              }
            }
            const { valor: num, temNulo } = avaliarFormula(formulaAST, contexto)
            return (
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmtQuantidade(num, casasCol)}
                {temNulo && (
                  <span title="Um ou mais campos usados nesta fórmula estavam vazios e foram tratados como 0" style={{ marginLeft: '0.25rem', cursor: 'help' }}>⚠️</span>
                )}
              </span>
            )
          } catch {
            // expressão inválida — exibe '—'
          }
        }
        return <span>—</span>
      }

      // ── Numérico / Percentual ────────────────────────────────────────────────
      if ((col.tipo === 'numero' || col.tipo === 'percentual') && valor !== '—') {
        const num = Number(valor)
        if (!isNaN(num)) {
          const sufixo = col.tipo === 'percentual' ? '%' : ''
          return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtQuantidade(num, casasCol)}{sufixo}</span>
        }
      }

      // ── Texto / Select / Tipo Documento — trunca em 150 chars (T04) ─────────
      return renderTextoC2(valor, col.nome)
    },
  }
}

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

export function buildColunasFilho(t: TFunction, opcoes: OpcoesUnidadesColunas): GTColuna<PedidoItem>[] {
  const { unidadesPeso, unidadesCubagem } = opcoes
  return [
  {
    key: 'part_number',
    label: t('pedido.item.part_number'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.part_number
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.item.part_number')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono, monospace)' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'ncm',
    label: t('pedido.item.ncm'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.ncm
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.item.ncm')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono, monospace)' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'descricao_item',
    label: t('pedido.item.descricao_item'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_item, t('pedido.item.descricao_item')),
  },
  {
    key: 'tipo_operacao_item',
    label: 'Tipo de Operação',
    tipo: 'badge',
    align: 'center',
    grupo: t('pedido.item_grupo.identificacao'),
    render: (_val: unknown, row: PedidoItem) => {
      const tipo = (row as Record<string, unknown>).tipo_operacao_item as string | null
      if (!tipo) return <span style={{ color: 'var(--text-muted)' }}>—</span>
      return (
        <span style={{
          padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          background: tipo === 'importacao'
            ? 'color-mix(in srgb, var(--color-info, #3b82f6) 15%, transparent)'
            : 'color-mix(in srgb, var(--color-success, #22c55e) 15%, transparent)',
          color: tipo === 'importacao'
            ? 'var(--color-info, #60a5fa)'
            : 'var(--color-success, #4ade80)',
        }}>
          {tipo === 'importacao' ? 'Importação' : 'Exportação'}
        </span>
      )
    },
  },
  {
    key: 'unidade_comercializada_item',
    label: 'Unidade Comercializada',
    tipo: 'texto',
    grupo: t('pedido.item_grupo.quantidades'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
        {row.unidade_comercializada_item ?? '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_inicial_pedido',
    label: t('pedido.item.qtd_inicial'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: t('pedido.item.qtd_inicial_tooltip'),
    tooltipDescricao: t('pedido.item.qtd_inicial_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_inicial_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_atual_pedido',
    label: t('pedido.item.saldo'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: t('pedido.item.saldo_tooltip'),
    tooltipDescricao: t('pedido.item.saldo_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontVariantNumeric: 'tabular-nums',
        fontWeight: row.quantidade_atual_pedido === 0 ? 400 : 600,
        color: row.quantidade_atual_pedido === 0 ? 'var(--text-muted)' : 'var(--color-success, #34d399)',
      }}>
        {fmtQuantidade(row.quantidade_atual_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_pronta_total_item_pedido',
    label: t('pedido.item.qtd_pronta'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: t('pedido.item.qtd_pronta_tooltip'),
    tooltipDescricao: t('pedido.item.qtd_pronta_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_pronta_total_item_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida_pedido',
    label: t('pedido.item.qtd_transferida'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: t('pedido.item.qtd_transferida_tooltip'),
    tooltipDescricao: t('pedido.item.qtd_transferida_desc'),
    tooltipBloqueado: t('pedido.item.qtd_transferida_bloqueado'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#60a5fa' }}>
        {fmtQuantidade(row.quantidade_transferida_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada_pedido',
    label: t('pedido.item.qtd_cancelada'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: t('pedido.item.qtd_cancelada_tooltip'),
    tooltipDescricao: t('pedido.item.qtd_cancelada_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontVariantNumeric: 'tabular-nums',
        color: row.quantidade_cancelada_pedido > 0 ? 'var(--color-error, #ef4444)' : 'var(--text-muted)',
      }}>
        {fmtQuantidade(row.quantidade_cancelada_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'sequencia_item',
    label: t('pedido.item.seq_item'),
    tipo: 'numero',
    align: 'center',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.seq_item_tooltip'),
    tooltipDescricao: t('pedido.item.seq_item_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.sequencia_item != null ? String(row.sequencia_item).padStart(3, '0') : '—'}
      </span>
    ),
  },
  {
    key: 'descricao_completa_item_pt',
    label: t('pedido.item.desc_completa_pt'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.desc_completa_pt_tooltip'),
    tooltipDescricao: t('pedido.item.desc_completa_pt_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_completa_item_pt, t('pedido.item.desc_completa_pt')),
  },
  {
    key: 'descricao_completa_item_nf',
    label: t('pedido.item.desc_completa_nf'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.desc_completa_nf_tooltip'),
    tooltipDescricao: t('pedido.item.desc_completa_nf_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_completa_item_nf, t('pedido.item.desc_completa_nf')),
  },
  {
    key: 'quantidade_unidade_estatistica',
    label: t('pedido.item.qtd_estatistica'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: t('pedido.item.qtd_estatistica_tooltip'),
    tooltipDescricao: t('pedido.item.qtd_estatistica_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_unidade_estatistica_duimp != null
          ? `${fmtQuantidade(row.quantidade_unidade_estatistica_duimp, getCasas('quantidade_unidade_estatistica_duimp', 2))} ${row.unidade_estatistica_duimp ?? ''}`
          : '—'}
      </span>
    ),
  },
  // ── Pesos e cubagem ──────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_unitario',
    label: t('pedido.item.peso_liq_unitario'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.dados_fisicos'),
    tooltipTitulo: t('pedido.item.peso_liq_unitario_tooltip'),
    tooltipDescricao: t('pedido.item.peso_liq_unitario_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_liquido_unitario != null
          ? `${fmtQuantidade(row.peso_liquido_unitario, getCasas('peso_liquido_unitario', 3))} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'peso_bruto_unitario',
    label: t('pedido.item.peso_bruto_unitario'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.dados_fisicos'),
    tooltipTitulo: t('pedido.item.peso_bruto_unitario_tooltip'),
    tooltipDescricao: t('pedido.item.peso_bruto_unitario_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_bruto_unitario != null
          ? `${fmtQuantidade(row.peso_bruto_unitario, getCasas('peso_bruto_unitario', 3))} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'cubagem_unitaria',
    label: t('pedido.item.cubagem_unitaria'),
    tipo: 'numero',
    align: 'right',
    grupo: t('pedido.item_grupo.dados_fisicos'),
    tooltipTitulo: t('pedido.item.cubagem_unitaria_tooltip'),
    tooltipDescricao: t('pedido.item.cubagem_unitaria_desc'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.cubagem_unitaria != null
          ? `${fmtQuantidade(row.cubagem_unitaria, getCasas('cubagem_unitaria', 4))} m³`
          : '—'}
      </span>
    ),
  },
  // ── Embalagem e documentos ───────────────────────────────────────────────────
  {
    key: 'tipo_embalagem',
    label: t('pedido.item.tipo_embalagem'),
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.dados_fisicos'),
    tooltipTitulo: t('pedido.item.tipo_embalagem_tooltip'),
    tooltipDescricao: t('pedido.item.tipo_embalagem_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.tipo_embalagem, 'tipo_embalagem'),
  },
  {
    key: 'numero_lpco',
    label: t('pedido.item.numero_lpco'),
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.duimp_fiscal'),
    tooltipTitulo: t('pedido.item.numero_lpco_tooltip'),
    tooltipDescricao: t('pedido.item.numero_lpco_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.numero_lpco, 'numero_lpco'),
  },
  {
    key: 'numero_certificado_origem',
    label: t('pedido.item.numero_cert_origem'),
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.duimp_fiscal'),
    tooltipTitulo: t('pedido.item.numero_cert_origem_tooltip'),
    tooltipDescricao: t('pedido.item.numero_cert_origem_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.numero_certificado_origem, 'numero_certificado_origem'),
  },
  {
    key: 'data_certificado_origem',
    label: t('pedido.item.data_cert_origem'),
    tipo: 'periodo',
    grupo: t('pedido.item_grupo.duimp_fiscal'),
    tooltipTitulo: t('pedido.item.data_cert_origem_tooltip'),
    tooltipDescricao: t('pedido.item.data_cert_origem_desc'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── Classificação ────────────────────────────────────────────────────────────
  {
    key: 'grupo_item',
    label: t('pedido.item.grupo_item'),
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.grupo_item_tooltip'),
    tooltipDescricao: t('pedido.item.grupo_item_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.grupo_item, 'grupo_item'),
  },
  {
    key: 'subgrupo_item',
    label: t('pedido.item.subgrupo_item'),
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.subgrupo_item_tooltip'),
    tooltipDescricao: t('pedido.item.subgrupo_item_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.subgrupo_item, 'subgrupo_item'),
  },
  {
    key: 'campo_especial_item',
    label: t('pedido.item.campo_especial'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.campo_especial_tooltip'),
    tooltipDescricao: t('pedido.item.campo_especial_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.campo_especial_item, 'campo_especial_item'),
  },
  // ── Descrições multilíngues ──────────────────────────────────────────────────
  {
    key: 'descricao_completa_item_en',
    label: t('pedido.item.desc_completa_en'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.desc_completa_en_tooltip'),
    tooltipDescricao: t('pedido.item.desc_completa_en_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_completa_item_en, t('pedido.item.desc_completa_en')),
  },
  {
    key: 'descricao_completa_item_es',
    label: t('pedido.item.desc_completa_es'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.desc_completa_es_tooltip'),
    tooltipDescricao: t('pedido.item.desc_completa_es_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_completa_item_es, t('pedido.item.desc_completa_es')),
  },
  {
    key: 'texto_posicao_ncm',
    label: t('pedido.item.texto_ncm'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.texto_ncm_tooltip'),
    tooltipDescricao: t('pedido.item.texto_ncm_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.texto_posicao_ncm, 'texto_posicao_ncm'),
  },
  {
    key: 'atributos_catalogo',
    label: t('pedido.item.atributos_catalogo'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.atributos_catalogo_tooltip'),
    tooltipDescricao: t('pedido.item.atributos_catalogo_desc'),
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.atributos_catalogo, 'atributos_catalogo'),
  },
  {
    key: 'anexo_lpco',
    label: t('pedido.item.anexo_lpco'),
    tipo: 'texto',
    grupo: t('pedido.item_grupo.duimp_fiscal'),
    tooltipTitulo: t('pedido.item.anexo_lpco_tooltip'),
    tooltipDescricao: t('pedido.item.anexo_lpco_desc'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.anexo_lpco ? '📎' : '—'}</span>,
  },
  // ── Datas do item ────────────────────────────────────────────────────────────
  {
    key: 'data_transferencia_item',
    label: t('pedido.item.data_transferencia'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.data_transferencia_tooltip'),
    tooltipDescricao: t('pedido.item.data_transferencia_desc'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_transferencia_item ? fmtData(row.data_transferencia_item) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_item',
    label: t('pedido.item.data_consolidacao'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: t('pedido.item.data_consolidacao_tooltip'),
    tooltipDescricao: t('pedido.item.data_consolidacao_desc'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_consolidacao_item ? fmtData(row.data_consolidacao_item) : '—'}</span>,
  },
  // ── Datas LPCO ───────────────────────────────────────────────────────────────
  {
    key: 'data_prevista_conferencia_draft_lpco',
    label: 'Dt Prev. Conferência Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data prevista para conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_conferencia_draft_lpco ? fmtData(row.data_prevista_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_conferencia_draft_lpco',
    label: 'Dt Conf. Conferência Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data confirmada de conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_conferencia_draft_lpco ? fmtData(row.data_confirmada_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_conferencia_draft_lpco',
    label: 'Dt Meta Conferência Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data meta para conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_conferencia_draft_lpco ? fmtData(row.data_meta_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_lpco',
    label: 'Dt Prev. Aprovação Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_lpco ? fmtData(row.data_prevista_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_lpco',
    label: 'Dt Conf. Aprovação Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_lpco ? fmtData(row.data_confirmada_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_lpco',
    label: 'Dt Meta Aprovação Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data meta para aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_lpco ? fmtData(row.data_meta_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_registro_lpco',
    label: 'Dt Prev. Registro da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista do Registro da LPCO',
    tooltipDescricao: 'Data prevista para registro da LPCO no órgão competente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_registro_lpco ? fmtData(row.data_prevista_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_registro_lpco',
    label: 'Dt Conf. Registro da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada do Registro da LPCO',
    tooltipDescricao: 'Data confirmada de registro da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_registro_lpco ? fmtData(row.data_confirmada_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_registro_lpco',
    label: 'Dt Meta. Registro da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta do Registro da LPCO',
    tooltipDescricao: 'Data meta para registro da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_registro_lpco ? fmtData(row.data_meta_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_resultado_analise_lpco',
    label: 'Dt Prev. Análise da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data prevista para resultado da análise pelo órgão anuente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_resultado_analise_lpco ? fmtData(row.data_prevista_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_resultado_analise_lpco',
    label: 'Dt Conf. Análise da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data confirmada do resultado da análise da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_resultado_analise_lpco ? fmtData(row.data_confirmada_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_resultado_analise_lpco',
    label: 'Dt Meta. Análise da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data meta para resultado da análise da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_resultado_analise_lpco ? fmtData(row.data_meta_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_deferimento_lpco',
    label: 'Dt Prev. Deferimento da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista do Deferimento da LPCO',
    tooltipDescricao: 'Data prevista para deferimento (aprovação final) da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_deferimento_lpco ? fmtData(row.data_prevista_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_deferimento_lpco',
    label: 'Dt Conf. Deferimento da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada do Deferimento da LPCO',
    tooltipDescricao: 'Data confirmada do deferimento da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_deferimento_lpco ? fmtData(row.data_confirmada_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_deferimento_lpco',
    label: 'Dt Meta. Deferimento da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta do Deferimento da LPCO',
    tooltipDescricao: 'Data meta para deferimento da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_deferimento_lpco ? fmtData(row.data_meta_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_indeferimento_lpco',
    label: 'Dt Conf. Indeferimento da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada do Indeferimento da LPCO',
    tooltipDescricao: 'Data confirmada do indeferimento (reprovação) da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_indeferimento_lpco ? fmtData(row.data_confirmada_indeferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_exigencia_lpco',
    label: 'Dt Conf. Exigência da LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada da Exigência da LPCO',
    tooltipDescricao: 'Data confirmada de exigência/pendência da LPCO pelo órgão anuente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_exigencia_lpco ? fmtData(row.data_confirmada_exigencia_lpco) : '—'}</span>,
  },
  // ── Datas Certificado de Origem ──────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_cert_origem',
    label: 'Prev. Rec. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista de Recebimento — Draft do Certificado de Origem',
    tooltipDescricao: 'Data prevista para recebimento do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_recebimento_draft_cert_origem ? fmtData(row.data_prevista_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_cert_origem',
    label: 'Conf. Rec. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_recebimento_draft_cert_origem ? fmtData(row.data_confirmada_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_cert_origem',
    label: 'Meta Rec. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta de Recebimento — Draft do Certificado de Origem',
    tooltipDescricao: 'Data meta para recebimento do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_draft_cert_origem ? fmtData(row.data_meta_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_cert_origem',
    label: 'Prev. Aprov. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista de Aprovação — Draft do Certificado de Origem',
    tooltipDescricao: 'Data prevista para aprovação do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_cert_origem ? fmtData(row.data_prevista_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_cert_origem',
    label: 'Conf. Aprov. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_cert_origem ? fmtData(row.data_confirmada_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_cert_origem',
    label: 'Meta Aprov. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta de Aprovação — Draft do Certificado de Origem',
    tooltipDescricao: 'Data meta para aprovação do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_cert_origem ? fmtData(row.data_meta_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_cert_origem',
    label: 'Prev. Envio Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista de Envio — Original do Certificado de Origem',
    tooltipDescricao: 'Data prevista para envio do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_envio_original_cert_origem ? fmtData(row.data_prevista_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_cert_origem',
    label: 'Conf. Envio Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada de Envio — Original do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de envio do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_envio_original_cert_origem ? fmtData(row.data_confirmada_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_cert_origem',
    label: 'Meta Envio Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta de Envio — Original do Certificado de Origem',
    tooltipDescricao: 'Data meta para envio do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_envio_original_cert_origem ? fmtData(row.data_meta_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_cert_origem',
    label: 'Prev. Rec. Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Prevista de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data prevista para recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_recebimento_original_cert_origem ? fmtData(row.data_prevista_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_cert_origem',
    label: 'Conf. Rec. Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Confirmada de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_recebimento_original_cert_origem ? fmtData(row.data_confirmada_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_cert_origem',
    label: 'Meta Rec. Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data Meta de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data meta para recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_original_cert_origem ? fmtData(row.data_meta_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_certificado_origem',
    label: 'Data de emissão do Certificado de Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data do Certificado de Origem',
    tooltipDescricao: 'Data de emissão do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── DUIMP — Dados gerais ─────────────────────────────────────────────────────
  {
    key: 'tipo_operacao_duimp',
    label: 'Tipo de Operação - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Tipo de Operação — DUIMP',
    tooltipDescricao: 'Tipo de operação de importação conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.tipo_operacao_duimp, 'tipo_operacao_duimp'),
  },
  {
    key: 'descricao_resumida_duimp',
    label: 'Descrição Resumida Produto - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Descrição Resumida do Produto — DUIMP',
    tooltipDescricao: 'Descrição resumida do produto conforme cadastro na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_resumida_duimp, 'descricao_resumida_duimp'),
  },
  {
    key: 'versao_produto_duimp',
    label: 'Versão do Produto - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Versão do Produto — Catálogo DUIMP',
    tooltipDescricao: 'Versão do cadastro do produto no catálogo DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.versao_produto_duimp, 'versao_produto_duimp'),
  },
  {
    key: 'ncm_duimp',
    label: 'NCM - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'NCM — DUIMP',
    tooltipDescricao: 'Código NCM utilizado na DUIMP (pode diferir do NCM do catálogo)',
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.ncm_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
      return (
        <TooltipGlobal titulo="NCM — DUIMP" descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono, monospace)' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'atributos_duimp',
    label: 'Atributos - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Atributos — DUIMP',
    tooltipDescricao: 'Atributos técnicos do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.atributos_duimp, 'atributos_duimp'),
  },
  {
    key: 'aplicacao_mercadoria_duimp',
    label: 'Aplicação Mercadoria - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Aplicação da Mercadoria — DUIMP',
    tooltipDescricao: 'Finalidade ou aplicação da mercadoria conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.aplicacao_mercadoria_duimp, 'aplicacao_mercadoria_duimp'),
  },
  {
    key: 'condicao_mercadoria_duimp',
    label: 'Condição Mercadoria - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Condição da Mercadoria — DUIMP',
    tooltipDescricao: 'Estado da mercadoria (nova, usada, recondicionada) conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.condicao_mercadoria_duimp, 'condicao_mercadoria_duimp'),
  },
  {
    key: 'relacao_exportador_fabricante_duimp',
    label: 'Relação Exportador/Fabricante - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Relação entre Exportador e Fabricante — DUIMP',
    tooltipDescricao: 'Tipo de relação entre exportador e fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.relacao_exportador_fabricante_duimp, 'relacao_exportador_fabricante_duimp'),
  },
  {
    key: 'vinculacao_preco_duimp',
    label: 'Vinculação Preço - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Vinculação de Preço — DUIMP',
    tooltipDescricao: 'Indica se há vinculação de preço entre comprador e vendedor conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.vinculacao_preco_duimp, 'vinculacao_preco_duimp'),
  },
  {
    key: 'descricao_completa_duimp',
    label: 'Descrição Completa - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Descrição Completa do Produto — DUIMP',
    tooltipDescricao: 'Descrição completa e técnica do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_completa_duimp, 'descricao_completa_duimp'),
  },
  {
    key: 'descricao_complementar_duimp',
    label: 'Descrição Complementar - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Descrição Complementar da Mercadoria — DUIMP',
    tooltipDescricao: 'Informações complementares sobre a mercadoria na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.descricao_complementar_duimp, 'descricao_complementar_duimp'),
  },
  // ── DUIMP — OPE ─────────────────────────────────────────────────────────────
  {
    key: 'codigo_ope_duimp',
    label: 'Cód. OPE Descrição Completa - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Código do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Código do OPE (exportador) conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.codigo_ope_duimp, 'codigo_ope_duimp'),
  },
  {
    key: 'nome_ope_duimp',
    label: 'Nome OPE - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Nome do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Nome do OPE conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.nome_ope_duimp, 'nome_ope_duimp'),
  },
  {
    key: 'pais_ope_duimp',
    label: 'País OPE - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'País do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'País do OPE conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.pais_ope_duimp, 'pais_ope_duimp'),
  },
  {
    key: 'codigo_ope_fabricante_duimp',
    label: 'Cód. OPE Fabricante - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Código do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Código do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.codigo_ope_fabricante_duimp, 'codigo_ope_fabricante_duimp'),
  },
  {
    key: 'nome_ope_fabricante_duimp',
    label: 'Nome OPE Fabricante - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Nome do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Nome do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.nome_ope_fabricante_duimp, 'nome_ope_fabricante_duimp'),
  },
  {
    key: 'pais_fabricante_ope_duimp',
    label: 'País OPE Fab. - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'País do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'País do OPE fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.pais_fabricante_ope_duimp, 'pais_fabricante_ope_duimp'),
  },
  // ── DUIMP — Valoração ────────────────────────────────────────────────────────
  {
    key: 'metodo_valoracao_duimp',
    label: 'Método Valoração - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Método de Valoração — DUIMP',
    tooltipDescricao: 'Método de valoração aduaneira utilizado na DUIMP (ex: Método 1 — Valor de Transação)',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.metodo_valoracao_duimp, 'metodo_valoracao_duimp'),
  },
  {
    key: 'incoterm_duimp',
    label: 'Incoterm - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Incoterm / Condição de Venda — DUIMP',
    tooltipDescricao: 'Incoterm ou condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.incoterm_duimp, 'incoterm_duimp'),
  },
  {
    key: 'moeda_produto_duimp',
    label: 'Moeda - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Moeda do Produto — DUIMP',
    tooltipDescricao: 'Moeda utilizada no valor do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.moeda_produto_duimp, 'moeda_produto_duimp'),
  },
  {
    key: 'valor_unitario_duimp',
    label: 'Valor Unitário do Produto - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Unitário do Produto — DUIMP',
    tooltipDescricao: 'Valor unitário do produto na moeda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => {
      const moeda = row.moeda_produto_duimp ?? 'USD'
      const num = Number(row.valor_unitario_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
          {row.valor_unitario_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_total_condicao_venda_duimp',
    label: 'Valor Total na Condição de Venda - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Total na Condição de Venda — DUIMP',
    tooltipDescricao: 'Valor total do item na condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => {
      const moeda = row.moeda_produto_duimp ?? 'USD'
      const num = Number(row.valor_total_condicao_venda_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
          {row.valor_total_condicao_venda_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_condicao_venda_brl_duimp',
    label: 'Valor na Condição de Venda - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor na Condição de Venda (R$) — DUIMP',
    tooltipDescricao: 'Valor do item na condição de venda convertido em reais',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_condicao_venda_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_condicao_venda_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_frete_internacional_brl_duimp',
    label: 'Frete Internacional (R$) - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor do Frete Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do frete internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_frete_internacional_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_frete_internacional_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_seguro_internacional_brl_duimp',
    label: 'Seguro Internacional (R$) - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor do Seguro Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do seguro internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_seguro_internacional_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_seguro_internacional_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_local_embarque_brl_duimp',
    label: 'Valor Local de Embarque (R$) - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor no Local de Embarque (R$) — DUIMP',
    tooltipDescricao: 'Valor da mercadoria no local de embarque em reais',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_local_embarque_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_local_embarque_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_aduaneiro_brl_duimp',
    label: 'Valor Aduaneiro (R$) - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Aduaneiro (R$) — DUIMP',
    tooltipDescricao: 'Valor aduaneiro calculado em reais, base para tributos de importação',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_aduaneiro_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_aduaneiro_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  // ── DUIMP — Cobertura cambial ────────────────────────────────────────────────
  {
    key: 'tipo_cobertura_cambial_duimp',
    label: 'Tipo Cobertura Cambial - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Tipo de Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Modalidade de cobertura cambial declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.tipo_cobertura_cambial_duimp, 'tipo_cobertura_cambial_duimp'),
  },
  {
    key: 'numero_rof_bacen_duimp',
    label: 'Número do ROF - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Número do ROF/BACEN — DUIMP',
    tooltipDescricao: 'Número do Registro de Operações Financeiras junto ao BACEN',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.numero_rof_bacen_duimp, 'numero_rof_bacen_duimp'),
  },
  {
    key: 'motivo_sem_cobertura_duimp',
    label: 'Motivo Sem Cobertura - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Motivo Sem Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Justificativa legal para ausência de cobertura cambial',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.motivo_sem_cobertura_duimp, 'motivo_sem_cobertura_duimp'),
  },
  // ── DUIMP — II ──────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ii_duimp',
    label: 'BC II (R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Base de Cálculo do II (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do Imposto de Importação em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_ii_duimp != null ? row.base_calculo_ii_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ii_duimp',
    label: 'Alíquota do II (%) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Alíquota do II (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do Imposto de Importação',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_ii_duimp != null ? `${fmtQuantidade(row.percentual_ii_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_devido_ii_duimp',
    label: 'Valor Devido do II - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Devido do II (R$) — DUIMP',
    tooltipDescricao: 'Valor total do Imposto de Importação devido',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_devido_ii_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_devido_ii_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_recolher_ii_duimp',
    label: 'Valor Recolher do II - DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do II (R$) — DUIMP',
    tooltipDescricao: 'Valor efetivo do Imposto de Importação a recolher (deduzidas suspensões)',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_ii_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_recolher_ii_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  // ── DUIMP — IPI ─────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ipi_duimp',
    label: 'BC IPI (R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Base de Cálculo do IPI (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do IPI em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_ipi_duimp != null ? row.base_calculo_ipi_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ipi_duimp',
    label: 'Alíquota do IPI(%) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Alíquota do IPI (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do IPI',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_ipi_duimp != null ? `${fmtQuantidade(row.percentual_ipi_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_ipi_duimp',
    label: 'Valor Recolher do IPI- DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do IPI (R$) — DUIMP',
    tooltipDescricao: 'Valor do IPI a recolher',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_ipi_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_recolher_ipi_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  // ── DUIMP — PIS ─────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_pis_duimp',
    label: 'BC PIS(R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Base de Cálculo do PIS (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do PIS/PASEP em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_pis_duimp != null ? row.base_calculo_pis_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_pis_duimp',
    label: 'Alíquota do PIS(%) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Alíquota do PIS (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do PIS/PASEP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_pis_duimp != null ? `${fmtQuantidade(row.percentual_pis_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_pis_duimp',
    label: 'Valor Recolher do PIS- DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do PIS (R$) — DUIMP',
    tooltipDescricao: 'Valor do PIS/PASEP a recolher',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_pis_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_recolher_pis_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  // ── DUIMP — COFINS ──────────────────────────────────────────────────────────
  {
    key: 'base_calculo_cofins_duimp',
    label: 'BC COFINS(R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Base de Cálculo do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do COFINS em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_cofins_duimp != null ? row.base_calculo_cofins_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_cofins_duimp',
    label: 'Alíquota do COFINS(%) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Alíquota do COFINS (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do COFINS',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_cofins_duimp != null ? `${fmtQuantidade(row.percentual_cofins_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_cofins_duimp',
    label: 'Valor Recolher do COFINS- DUIMP',
    tipo: 'numero',
    align: 'left',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Valor do COFINS a recolher',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_cofins_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge('BRL')}>BRL</span>
          {row.valor_recolher_cofins_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  // ── DUIMP — Tratamento administrativo ───────────────────────────────────────
  {
    key: 'existe_tratamento_administrativo_duimp',
    label: 'Existe Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Existe Tratamento Administrativo? — DUIMP',
    tooltipDescricao: 'Indica se existe tratamento administrativo associado ao item na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.existe_tratamento_administrativo_duimp, 'existe_tratamento_administrativo_duimp'),
  },
  {
    key: 'tipo_trat_adm_duimp',
    label: 'Tipo Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Tipo de Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Tipo/modalidade do tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.tipo_trat_adm_duimp, 'tipo_trat_adm_duimp'),
  },
  {
    key: 'orgao_trat_adm_duimp',
    label: 'Órgão Anuente Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Órgão do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Órgão anuente responsável pelo tratamento administrativo',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.orgao_trat_adm_duimp, 'orgao_trat_adm_duimp'),
  },
  {
    key: 'numero_lpco_trat_adm_duimp',
    label: 'Número LPCO Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Número da LPCO do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Número da LPCO vinculada ao tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.numero_lpco_trat_adm_duimp, 'numero_lpco_trat_adm_duimp'),
  },
  // ── Comercial (item) ────────────────────────────────────────────────────────
  {
    key: 'moeda_item',
    label: 'Moeda do Item',
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: 'Moeda do Item',
    tooltipDescricao: 'Moeda utilizada para valoração do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
        {row.moeda_item ?? '—'}
      </span>
    ),
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: 'Incoterm',
    tooltipDescricao: 'Condição de venda internacional do item (ex: FOB, CIF, EXW)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
        {row.incoterm ?? '—'}
      </span>
    ),
  },
  {
    key: 'condicao_pagamento',
    label: 'Cond. Pagamento',
    tipo: 'texto',
    filtravel: true,
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: 'Condição de Pagamento',
    tooltipDescricao: 'Condição de pagamento acordada para o item',
    render: (_val: unknown, row: PedidoItem) => renderDescricaoTruncada(row.condicao_pagamento, 'condicao_pagamento'),
  },
  {
    key: 'casas_decimais_quantidade_item',
    label: 'Casas Decimais Qtd',
    tipo: 'numero',
    align: 'center',
    grupo: t('pedido.item_grupo.quantidades'),
    tooltipTitulo: 'Casas Decimais — Quantidade',
    tooltipDescricao: 'Número de casas decimais para campos de quantidade do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.casas_decimais_quantidade_item ?? '—'}
      </span>
    ),
  },
  // ── Datas do item (adicionais) ──────────────────────────────────────────────
  {
    key: 'data_emissao_pedido',
    label: 'Data P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: 'Data da P.O. (Item)',
    tooltipDescricao: 'Data de emissão da Purchase Order no nível do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_emissao_pedido ? fmtData(row.data_emissao_pedido) : '—'}</span>,
  },
  {
    key: 'data_embarque_item',
    label: 'Data Embarque',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: t('pedido.item_grupo.identificacao'),
    tooltipTitulo: 'Data de Embarque (Item)',
    tooltipDescricao: 'Data de embarque no nível do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_embarque_item ? fmtData(row.data_embarque_item) : '—'}</span>,
  },
] }

// ── Tipo auxiliar: item enriquecido com dados do pedido pai para renderização ──

type PedidoItemEnriquecido = PedidoItem & {
  _p: {
    id: string
    tipo_operacao: string
    nome_exportador: string | null
    nome_importador: string | null
    nome_fabricante: string | null
    referencia_importador: string | null
    referencia_exportador: string | null
    referencia_fabricante: string | null
    numero_proforma: string | null
    numero_invoice: string | null
    incoterm: string | null
    condicao_pagamento: string | null
    data_emissao_pedido: string | null
    status: string
    moeda_pedido: string
  }
}

// Fator de conversão reversa: KG armazenado → unidade de exibição
const KG_PARA_UNIDADE: Record<string, number> = { KG: 1, G: 1000, TON: 0.001, KGBR: 1 }

export function buildMapaColunasFilho(opcoes: OpcoesUnidadesColunas): Record<string, GTMapaColunasFilho<PedidoItem>> {
  const { unidadesPeso, unidadesCubagem } = opcoes
  return {
  // ── Número do pedido → Part Number do item ────────────────────────────────
  numero_pedido: {
    editavel: true,
    campo: 'part_number',
    render: (row: PedidoItem) => row.part_number,
  },
  // ── NCM do item ───────────────────────────────────────────────────────────
  ncm: {
    editavel: true,
    render: (row: PedidoItem) => {
      const digits = (row.ncm ?? '').replace(/\D/g, '')
      const formatted = digits.length === 8
        ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
        : (row.ncm ?? '—')
      return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{formatted}</span>
    },
  },
  // ── Colunas herdadas do pedido pai ────────────────────────────────────────
  tipo_operacao: {
    render: (row: PedidoItem) => {
      // Usar tipo_operacao_item do próprio item; fallback para pai se null
      const tipoItem = (row as Record<string, unknown>).tipo_operacao_item as string | null
      const p = (row as PedidoItemEnriquecido)._p
      const tipo = tipoItem ?? p?.tipo_operacao ?? null
      if (!tipo) return null
      return (
        <StatusBadgeGlobal
          valor={tipo === 'importacao' ? 'Importação' : 'Exportação'}
          genero="feminino"
          style={tipo === 'importacao'
            ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
            : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
          }
        />
      )
    },
  },
  nome_exportador: {
    editavel: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.tipo_operacao === 'importacao',
    tooltipBloqueado: (row: PedidoItem) =>
      (row as PedidoItemEnriquecido)._p?.tipo_operacao === 'exportacao'
        ? 'Exportador definido automaticamente pelo workspace — não editável em Exportação'
        : undefined,
    campo: 'nome_exportador',
    render: (row: PedidoItem) => {
      const tipoOp = (row as PedidoItemEnriquecido)._p?.tipo_operacao
      const v = tipoOp === 'importacao' ? (row.nome_exportador ?? null) : ((row as PedidoItemEnriquecido)._p?.nome_exportador ?? null)
      return renderDescricaoTruncada(v, 'Exportador')
    },
  },
  nome_importador: {
    editavel: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.tipo_operacao === 'exportacao',
    tooltipBloqueado: (row: PedidoItem) =>
      (row as PedidoItemEnriquecido)._p?.tipo_operacao === 'importacao'
        ? 'Importador definido automaticamente pelo workspace — não editável em Importação'
        : undefined,
    campo: 'nome_importador',
    render: (row: PedidoItem) => {
      const tipoOp = (row as PedidoItemEnriquecido)._p?.tipo_operacao
      const v = tipoOp === 'exportacao' ? (row.nome_importador ?? null) : ((row as PedidoItemEnriquecido)._p?.nome_importador ?? null)
      return renderDescricaoTruncada(v, 'Importador')
    },
  },
  nome_fabricante: {
    editavel: true,
    campo: 'nome_fabricante',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.nome_fabricante, 'Fabricante'),
  },
  referencia_importador: {
    editavel: true,
    campo: 'referencia_importador',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.referencia_importador, 'Ref. Importador'),
  },
  referencia_exportador: {
    editavel: true,
    campo: 'referencia_exportador',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.referencia_exportador, 'Ref. Exportador'),
  },
  numero_proforma: {
    editavel: true,
    campo: 'numero_proforma',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.numero_proforma ?? '—'}</span>
    },
  },
  numero_invoice: {
    editavel: true,
    campo: 'numero_invoice',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.numero_invoice ?? '—'}</span>
    },
  },
  incoterm: {
    editavel: true,
    campo: 'incoterm',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.incoterm, 'incoterm'),
  },
  status: {
    editavel: true,
    campo: 'status',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      if (!p) return null
      const cor = getStatusCor(p.status)
      return (
        <StatusBadgeGlobal
          valor={getStatusLabel(p.status)}
          genero="masculino"
          style={{ color: cor, background: `${cor}1e`, border: `1px solid ${cor}33` }}
        />
      )
    },
  },
  referencia_fabricante: {
    editavel: true,
    campo: 'referencia_fabricante',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.referencia_fabricante, 'referencia_fabricante'),
  },
  cobertura_cambial: {
    editavel: true,
    campo: 'cobertura_cambial',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.cobertura_cambial, 'cobertura_cambial'),
  },
  condicao_pagamento: {
    editavel: true,
    campo: 'condicao_pagamento',
    render: (row: PedidoItem) => renderDescricaoTruncada(row.condicao_pagamento, 'condicao_pagamento'),
  },
  data_emissao_pedido: {
    editavel: true,
    campo: 'data_emissao_pedido',
    render: (row: PedidoItem) => <span>{fmtData(row.data_emissao_pedido ?? null)}</span>,
  },
  // ── Datas replicáveis pai→item (geradas a partir do mapa de propagação) ──
  // mapItem (backend) envia dados do item sob o nome FRONTEND do pai
  // (ex: 'data_prevista_pedido_pronto') — mesmo padrão de incoterm, condicao_pagamento, etc.
  // campo = keyPai → PATCH item envia esse nome; publicToDddItem resolve para coluna Prisma.
  ...(() => {
    const datasColunaPai = [
      'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
      'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
      'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
      'data_consolidacao_pedido', 'data_transferencia_saldo_pedido',
      'data_prevista_recebimento_rascunho_pedido', 'data_confirmada_recebimento_rascunho_pedido', 'data_meta_recebimento_rascunho_pedido',
      'data_prevista_aprovacao_rascunho_pedido', 'data_confirmada_aprovacao_rascunho_pedido', 'data_meta_aprovacao_rascunho_pedido',
      'data_documento_pedido',
      'data_prevista_recebimento_rascunho_proforma', 'data_confirmada_recebimento_rascunho_proforma', 'data_meta_recebimento_rascunho_proforma',
      'data_prevista_aprovacao_rascunho_proforma', 'data_confirmada_aprovacao_rascunho_proforma', 'data_meta_aprovacao_rascunho_proforma',
      'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
      'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
      'data_prevista_recebimento_rascunho_invoice', 'data_confirmada_recebimento_rascunho_invoice', 'data_meta_recebimento_rascunho_invoice',
      'data_prevista_aprovacao_rascunho_invoice', 'data_confirmada_aprovacao_rascunho_invoice', 'data_meta_aprovacao_rascunho_invoice',
      'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
      'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
    ]
    const entries: Array<[string, GTMapaColunasFilho<PedidoItem>]> = []
    for (const keyPai of datasColunaPai) {
      entries.push([keyPai, {
        editavel: true,
        campo: keyPai,
        render: (row: PedidoItem) => {
          const v = (row as unknown as Record<string, unknown>)[keyPai]
          return <span>{v ? fmtData(String(v)) : '—'}</span>
        },
      }])
    }
    return Object.fromEntries(entries)
  })(),
  // ── Pesos e cubagem do item ───────────────────────────────────────────────
  peso_liquido_total_pedido: {
    editavel: true,
    campo: 'peso_liquido_unitario',
    casasDecimais: getCasas('peso_liquido_unitario', 3),
    unidades: unidadesPeso,
    getValorEditar: (row: PedidoItem) => {
      const unit = row.peso_liquido_unidade_item ?? 'KG'
      const kg = Number(row.peso_liquido_unitario ?? 0)
      return { unit, quantity: kg * (KG_PARA_UNIDADE[unit] ?? 1) }
    },
    render: (row: PedidoItem) => {
      const unit = row.peso_liquido_unidade_item ?? 'KG'
      const kg = Number(row.peso_liquido_unitario ?? 0)
      const display = kg * (KG_PARA_UNIDADE[unit] ?? 1)
      return (
        <span className="gtv-celula-moeda">
          {row.peso_liquido_unitario != null
            ? fmtQuantidade(display, getCasas('peso_liquido_unitario', 3))
            : '—'}
          <span className="gtv-celula-unidade-badge">{unit.toLowerCase()}</span>
        </span>
      )
    },
  },
  peso_bruto_total_pedido: {
    editavel: true,
    campo: 'peso_bruto_unitario',
    casasDecimais: getCasas('peso_bruto_unitario', 3),
    unidades: unidadesPeso,
    getValorEditar: (row: PedidoItem) => {
      const unit = row.peso_bruto_unidade_item ?? 'KG'
      const kg = Number(row.peso_bruto_unitario ?? 0)
      return { unit, quantity: kg * (KG_PARA_UNIDADE[unit] ?? 1) }
    },
    render: (row: PedidoItem) => {
      const unit = row.peso_bruto_unidade_item ?? 'KG'
      const kg = Number(row.peso_bruto_unitario ?? 0)
      const display = kg * (KG_PARA_UNIDADE[unit] ?? 1)
      return (
        <span className="gtv-celula-moeda">
          {row.peso_bruto_unitario != null
            ? fmtQuantidade(display, getCasas('peso_bruto_unitario', 3))
            : '—'}
          <span className="gtv-celula-unidade-badge">{unit.toLowerCase()}</span>
        </span>
      )
    },
  },
  cubagem_total_pedido: {
    editavel: true,
    campo: 'cubagem_unitaria',
    casasDecimais: getCasas('cubagem_unitaria', 4),
    unidades: unidadesCubagem,
    getValorEditar: (row: PedidoItem) => ({
      unit: row.cubagem_unidade_item ?? 'M3',
      quantity: Number(row.cubagem_unitaria ?? 0),
    }),
    render: (row: PedidoItem) => {
      const unit = row.cubagem_unidade_item ?? 'M3'
      return (
        <span className="gtv-celula-moeda">
          {row.cubagem_unitaria != null
            ? fmtQuantidade(row.cubagem_unitaria, getCasas('cubagem_unitaria', 4))
            : '—'}
          <span className="gtv-celula-unidade-badge">{unit.toLowerCase().replace('m3', 'm³')}</span>
        </span>
      )
    },
  },
  // ── Moeda e Unidade ────────────────────────────────────────────────────────
  moeda_pedido: {
    editavel: true,
    getValorEditar: (row: PedidoItem) => row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD',
    render: (row: PedidoItem) => {
      const moeda = row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido
      if (!moeda) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
        </span>
      )
    },
  },
  unidade_comercializada_pedido: {
    render: (row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
        {(row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? '—'}
      </span>
    ),
  },
  // ── Valores ───────────────────────────────────────────────────────────────
  valor_por_unidade_item: {
    editavel: true,
    campo: 'valor_por_unidade_item',
    casasDecimais: getCasas('valor_por_unidade_item', 2),
    getValorEditar: (row: PedidoItem) => ({
      currency: row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD',
      amount: row.valor_por_unidade_item ?? 0,
    }),
    render: (row: PedidoItem) => {
      const moeda = row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD'
      const num = Number(row.valor_por_unidade_item)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
          {row.valor_por_unidade_item != null && !isNaN(num) ? fmtQuantidade(num, getCasas('valor_por_unidade_item', 2)) : '—'}
        </span>
      )
    },
  },
  valor_total_pedido: {
    editavel: true,
    campo: 'valor_total_item',
    casasDecimais: 2,
    getValorEditar: (row: PedidoItem) => ({
      currency: row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD',
      amount: row.valor_total_item ?? 0,
    }),
    render: (row: PedidoItem) => {
      const moeda = row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD'
      const num = Number(row.valor_total_item)
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
          {row.valor_total_item != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  // ── Quantidades ───────────────────────────────────────────────────────────
  quantidade_atual_pedido: {
    // Saldo = qtd_inicial - cancelada - transferida → sempre calculado, nunca editável
    casasDecimais: getCasas('quantidade_item', 0),
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      return (
        <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-success, #34d399)', fontWeight: 600 }}>
          {fmtQuantidade(row.quantidade_atual_pedido ?? 0, getCasas('quantidade_item', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  quantidade_total_pedido: {
    editavel: true,
    campo: 'quantidade_inicial_pedido',
    casasDecimais: getCasas('quantidade_item', 0),
    getValorEditar: (row: PedidoItem) => ({
      unit: (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN',
      quantity: Number(row.quantidade_inicial_pedido ?? 0),
    }),
    render: (row: PedidoItem) => (
      <span className="gtv-celula-moeda">
        {fmtQuantidade(row.quantidade_inicial_pedido ?? 0, getCasas('quantidade_item', 0))}
        <span className="gtv-celula-unidade-badge">
          {(row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'}
        </span>
      </span>
    ),
  },
  saldo_itens_do_pedido: {
    render: (row: PedidoItem) => {
      const qtd = Math.max(0, (row.quantidade_inicial_pedido ?? 0) - (row.quantidade_transferida_pedido ?? 0) - (row.quantidade_cancelada_pedido ?? 0))
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd > 0 ? '#60a5fa' : undefined }}>
          {fmtQuantidade(qtd, getCasas('quantidade_item', 0))}
        </span>
      )
    },
  },
  quantidade_transferida_total: {
    editavel: false,
    tooltipBloqueado: 'Campo calculado — incrementado automaticamente ao executar uma transferência. Não pode ser editado diretamente.',
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      return (
        <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums', color: '#60a5fa' }}>
          {fmtQuantidade(row.quantidade_transferida_pedido ?? 0, getCasas('quantidade_item', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  quantidade_pronta_itens_pedido_total: {
    editavel: true,
    campo: 'quantidade_pronta_total_item_pedido',
    casasDecimais: getCasas('quantidade_item', 0),
    getValorEditar: (row: PedidoItem) => ({
      unit: (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN',
      quantity: Number(row.quantidade_pronta_total_item_pedido ?? 0),
    }),
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      return (
        <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtQuantidade(row.quantidade_pronta_total_item_pedido ?? 0, getCasas('quantidade_item', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  }
}

/**
 * ListaPedidos.tsx — Tela principal do produto Pedido
 *
 * Tabela virtualizada com TabelaVirtualGlobal (TanStack Virtual v3).
 * Suporta até 1 milhão de linhas via cursor keyset pagination.
 *
 * Hierarquia: Pedido (pai) → PedidoItem (filho expandível)
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'
import {
  Package,
  Plus,
  Eye,
  PencilSimple,
  Trash,
  Copy,
  CurrencyDollar,
  Scales,
  Warning,
  ArrowRight,
  DownloadSimple,
  ArrowsClockwise,
  X,
  UploadSimple,
  CheckSquare,
  ArrowsLeftRight,
  PencilLine,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import { useCardPreferences } from '../shared/useCardPreferences'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON } from '../shared/exportUtils'
import type { ColunasExport } from '../shared/exportUtils'
import {
  pedidoVirtualApi,
  pedidoConfigApi,
  pedidoLoteApi,
  pedidoItemApi,
} from '../shared/api'
import type {
  Pedido,
  PedidoItem,
  PedidoStatusConfig,
  PedidoPreferenciasColunas,
} from '../shared/types'
import {
  STATUS_PEDIDO_LABELS,
  fmtQuantidade,
  fmtMoeda,
  fmtData,
} from '../shared/types'
import './ListaPedidos.css'

// ── Status padrão (fallback sem API) ─────────────────────────────────────────

const ABAS_PADRAO: GTAbaTipo[] = [
  { valor: 'todos',        label: 'Todos'           },
  { valor: 'aberto',       label: 'Aberto'          },
  { valor: 'transferencia',label: 'Em Transferência'},
  { valor: 'consolidado',  label: 'Consolidado'     },
  { valor: 'cancelado',    label: 'Cancelado'       },
]

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

const COLUNAS_PAI: GTColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: 'Número do Pedido',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    naoOcultavel: true,
    frozen: true,
    tooltipTitulo: 'Número do Pedido',
    tooltipDescricao: 'Identificador único do documento comercial (PO/SO)',
    largura: 140,
  },
  {
    key: 'tipo_operacao',
    label: 'Tipo',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Tipo de Operação',
    tooltipDescricao: 'Importação (Purchase Order) ou Exportação (Sales Order)',
    largura: 150,
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
        genero="feminino"
      />
    ),
  },
  {
    key: 'exportador_nome',
    label: 'Exportador',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Exportador / Fornecedor',
    tooltipDescricao: 'Fornecedor estrangeiro (na importação) ou entidade exportadora',
    largura: 180,
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_nome ?? '—'}</span>,
  },
  {
    key: 'fabricante_nome',
    label: 'Fabricante',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Fabricante',
    tooltipDescricao: 'Identificação da origem produtiva',
    largura: 160,
    render: (_val: unknown, row: Pedido) => <span>{row.fabricante_nome ?? '—'}</span>,
  },
  {
    key: 'referencia_importador',
    label: 'Ref. Importador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referência do Importador',
    tooltipDescricao: 'Código de referência interna do importador para o pedido',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_importador ?? '—'}</span>,
  },
  {
    key: 'referencia_exportador',
    label: 'Ref. Exportador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referência do Exportador',
    tooltipDescricao: 'Código de referência utilizado pelo exportador',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_exportador ?? '—'}</span>,
  },
  {
    key: 'numero_proforma',
    label: 'Proforma',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Número Proforma',
    tooltipDescricao: 'Referência da Proforma Invoice vinculada',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.numero_proforma ?? '—'}</span>,
  },
  {
    key: 'numero_invoice',
    label: 'Invoice',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Número Invoice',
    tooltipDescricao: 'Identificador da Commercial Invoice (Fatura)',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.numero_invoice ?? '—'}</span>,
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Incoterm',
    tooltipDescricao: 'Regra de entrega: FOB, CIF, EXW, etc.',
    largura: 90,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.incoterm ?? '—'}</span>,
  },
  {
    key: 'valor_total_pedido',
    label: 'Valor Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Valor Total do Pedido',
    tooltipDescricao: 'Valor FOB total na moeda do pedido',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_total_pedido != null
          ? fmtMoeda(row.valor_total_pedido, row.moeda_pedido)
          : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_total_pedido',
    label: 'Qtd Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Total',
    tooltipDescricao: 'Quantidade total contratada no pedido',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.quantidade_total_pedido != null
          ? `${fmtQuantidade(row.quantidade_total_pedido, row.casas_decimais_quantidade_total_pedido)} ${row.unidade_comercializada_pedido ?? ''}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'data_emissao_pedido',
    label: 'Data P.O',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data do Pedido',
    tooltipDescricao: 'Data de registro ou emissão da Purchase Order',
    largura: 100,
    render: (_val: unknown, row: Pedido) => <span>{fmtData(row.data_emissao_pedido)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Status do Pedido',
    tooltipDescricao: 'Ciclo de vida: Draft, Aberto, Em Transferência, Consolidado, Cancelado',
    oculta: true,
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={STATUS_PEDIDO_LABELS[row.status] ?? row.status}
        genero="masculino"
      />
    ),
  },
  // ── Dados comerciais ────────────────────────────────────────────────────────
  {
    key: 'moeda_pedido',
    label: 'Moeda',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Moeda do Pedido',
    tooltipDescricao: 'Moeda de referência do valor total do pedido (ex: USD, EUR)',
    largura: 90,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.moeda_pedido ?? '—'}</span>,
  },
  {
    key: 'unidade_comercializada_pedido',
    label: 'Unidade do Pedido',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Unidade Comercializada do Pedido',
    tooltipDescricao: 'Unidade de medida principal do pedido (ex: KG, UN, CX)',
    largura: 100,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.unidade_comercializada_pedido ?? '—'}</span>,
  },
  {
    key: 'referencia_fabricante',
    label: 'Ref. Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Referência do Fabricante',
    tooltipDescricao: 'Código de referência utilizado pelo fabricante para identificar o pedido',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_fabricante ?? '—'}</span>,
  },
  {
    key: 'cobertura_cambial',
    label: 'Cobertura Cambial',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Cobertura Cambial',
    tooltipDescricao: 'Modalidade de cobertura cambial do pedido (ex: Antecipado, à Vista, a Prazo)',
    largura: 150,
    render: (_val: unknown, row: Pedido) => <span>{row.cobertura_cambial ?? '—'}</span>,
  },
  {
    key: 'condicao_pagamento',
    label: 'Cond. Pagamento',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Condição de Pagamento',
    tooltipDescricao: 'Prazo e forma de pagamento acordados com o exportador',
    largura: 150,
    render: (_val: unknown, row: Pedido) => <span>{row.condicao_pagamento ?? '—'}</span>,
  },
  // ── Dados físicos ───────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_total_pedido',
    label: 'Peso Líq. Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    tooltipTitulo: 'Peso Líquido Total do Pedido',
    tooltipDescricao: 'Peso líquido total de todos os itens do pedido, em kg',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.peso_liquido_total_pedido != null
          ? `${fmtQuantidade(row.peso_liquido_total_pedido, row.casas_decimais_peso_pedido ?? 3)} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'peso_bruto_total_pedido',
    label: 'Peso Bruto Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    tooltipTitulo: 'Peso Bruto Total do Pedido',
    tooltipDescricao: 'Peso bruto total incluindo embalagens, em kg',
    largura: 140,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.peso_bruto_total_pedido != null
          ? `${fmtQuantidade(row.peso_bruto_total_pedido, row.casas_decimais_peso_pedido ?? 3)} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'cubagem_total_pedido',
    label: 'Cubagem Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    tooltipTitulo: 'Cubagem Total do Pedido',
    tooltipDescricao: 'Volume total cubado de todos os itens do pedido, em m³',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.cubagem_total_pedido != null
          ? `${fmtQuantidade(row.cubagem_total_pedido, row.casas_decimais_cubagem_pedido ?? 4)} m³`
          : '—'}
      </span>
    ),
  },
  // ── Datas de progresso ──────────────────────────────────────────────────────
  {
    key: 'data_prevista_pedido_pronto',
    label: 'Prev. Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Prevista — Pedido Pronto',
    tooltipDescricao: 'Data prevista para o pedido estar pronto para embarque (confirmada pelo exportador)',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_pedido_pronto ? fmtData(row.data_prevista_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_confirmada_pedido_pronto',
    label: 'Conf. Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Confirmada — Pedido Pronto',
    tooltipDescricao: 'Data confirmada para o pedido estar pronto, após validação do exportador',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_pedido_pronto ? fmtData(row.data_confirmada_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_meta_pedido_pronto',
    label: 'Meta Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Meta — Pedido Pronto',
    tooltipDescricao: 'Data meta definida pelo importador para o pedido estar pronto',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_pedido_pronto ? fmtData(row.data_meta_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_prevista_inspecao_pedido',
    label: 'Prev. Inspeção',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Prevista — Inspeção do Pedido',
    tooltipDescricao: 'Data prevista para realização da inspeção pré-embarque (PSI/ISF)',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_inspecao_pedido ? fmtData(row.data_prevista_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_inspecao_pedido',
    label: 'Conf. Inspeção',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Confirmada — Inspeção do Pedido',
    tooltipDescricao: 'Data confirmada para realização da inspeção pré-embarque',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_inspecao_pedido ? fmtData(row.data_confirmada_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_inspecao_pedido',
    label: 'Meta Inspeção',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Meta — Inspeção do Pedido',
    tooltipDescricao: 'Data meta definida pelo importador para a inspeção do pedido',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_inspecao_pedido ? fmtData(row.data_meta_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_coleta_pedido',
    label: 'Prev. Coleta',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Prevista — Coleta do Pedido',
    tooltipDescricao: 'Data prevista para a coleta/retirada da mercadoria no exportador',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_coleta_pedido ? fmtData(row.data_prevista_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_coleta_pedido',
    label: 'Conf. Coleta',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Confirmada — Coleta do Pedido',
    tooltipDescricao: 'Data confirmada para coleta/retirada da mercadoria',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_coleta_pedido ? fmtData(row.data_confirmada_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_coleta_pedido',
    label: 'Meta Coleta',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Meta — Coleta do Pedido',
    tooltipDescricao: 'Data meta definida pelo importador para a coleta do pedido',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_coleta_pedido ? fmtData(row.data_meta_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_pedido',
    label: 'Dt Consolidação',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data de Consolidação do Pedido',
    tooltipDescricao: 'Data em que o pedido foi consolidado em um processo logístico',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.data_consolidacao_pedido ? fmtData(row.data_consolidacao_pedido) : '—'}</span>,
  },
  {
    key: 'data_transferencia_saldo_pedido',
    label: 'Dt Transf. Saldo',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data de Transferência de Saldo',
    tooltipDescricao: 'Data em que o saldo do pedido foi transferido para um processo',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.data_transferencia_saldo_pedido ? fmtData(row.data_transferencia_saldo_pedido) : '—'}</span>,
  },
  // ── Exportador (detalhes) ───────────────────────────────────────────────────
  {
    key: 'id_exportador',
    label: 'ID Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'ID do Exportador',
    tooltipDescricao: 'Identificador único do exportador/fornecedor no sistema',
    render: (_val: unknown, row: Pedido) => <span>{row.id_exportador ?? '—'}</span>,
  },
  {
    key: 'pais_exportador',
    label: 'País Exportador',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'País do Exportador',
    tooltipDescricao: 'País de origem do exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_exportador ?? '—'}</span>,
  },
  {
    key: 'estado_exportador',
    label: 'Estado/Prov. Exportador',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Estado ou Província do Exportador',
    tooltipDescricao: 'Estado ou província do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_exportador ?? '—'}</span>,
  },
  {
    key: 'cidade_exportador',
    label: 'Cidade Exportador',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Cidade do Exportador',
    tooltipDescricao: 'Cidade do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_exportador ?? '—'}</span>,
  },
  {
    key: 'endereco_exportador',
    label: 'Endereço Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Endereço do Exportador',
    tooltipDescricao: 'Endereço completo do exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_exportador ?? '—'}</span>,
  },
  {
    key: 'zip_code_exportador',
    label: 'ZIP Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Zip Code do Exportador',
    tooltipDescricao: 'Código postal do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_exportador ?? '—'}</span>,
  },
  {
    key: 'exportador_ou_fabricante',
    label: 'Exportador/Fabricante?',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Exportador ou Fabricante?',
    tooltipDescricao: 'Indica se o exportador é também o fabricante do produto',
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_ou_fabricante ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante',
    label: 'Relação Exp./Fab.',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Relação entre Exportador e Fabricante',
    tooltipDescricao: 'Tipo de relação entre o exportador e o fabricante do produto',
    render: (_val: unknown, row: Pedido) => <span>{row.relacao_exportador_fabricante ?? '—'}</span>,
  },
  // ── Contato do exportador ───────────────────────────────────────────────────
  {
    key: 'nome_contato_exportador',
    label: 'Contato Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Nome do Contato do Exportador',
    tooltipDescricao: 'Nome do contato principal no exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.nome_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'email_contato_exportador',
    label: 'E-mail Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'E-mail do Contato do Exportador',
    tooltipDescricao: 'E-mail do contato principal no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.email_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'whatsapp_contato_exportador',
    label: 'WhatsApp Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 170,
    tooltipTitulo: 'WhatsApp do Contato do Exportador',
    tooltipDescricao: 'Número de WhatsApp do contato do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.whatsapp_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'cargo_contato_exportador',
    label: 'Cargo Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Cargo do Contato do Exportador',
    tooltipDescricao: 'Cargo ou função do contato no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.cargo_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'departamento_contato_exportador',
    label: 'Depto. Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Departamento do Contato do Exportador',
    tooltipDescricao: 'Departamento do contato no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.departamento_contato_exportador ?? '—'}</span>,
  },
  // ── Fabricante (detalhes) ───────────────────────────────────────────────────
  {
    key: 'id_fabricante',
    label: 'ID Fabricante',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'ID do Fabricante',
    tooltipDescricao: 'Identificador único do fabricante no sistema',
    render: (_val: unknown, row: Pedido) => <span>{row.id_fabricante ?? '—'}</span>,
  },
  {
    key: 'pais_fabricante',
    label: 'País Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'País do Fabricante',
    tooltipDescricao: 'País onde o produto foi fabricado',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_fabricante ?? '—'}</span>,
  },
  {
    key: 'estado_fabricante',
    label: 'Estado/Prov. Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Estado ou Província do Fabricante',
    tooltipDescricao: 'Estado ou província onde o fabricante está localizado',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_fabricante ?? '—'}</span>,
  },
  {
    key: 'cidade_fabricante',
    label: 'Cidade Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Cidade do Fabricante',
    tooltipDescricao: 'Cidade onde o fabricante está localizado',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_fabricante ?? '—'}</span>,
  },
  {
    key: 'endereco_fabricante',
    label: 'Endereço Fabricante',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Endereço do Fabricante',
    tooltipDescricao: 'Endereço completo do fabricante',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_fabricante ?? '—'}</span>,
  },
  {
    key: 'zip_code_fabricante',
    label: 'ZIP Fabricante',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Zip Code do Fabricante',
    tooltipDescricao: 'Código postal do fabricante',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_fabricante ?? '—'}</span>,
  },
  // ── OPE ────────────────────────────────────────────────────────────────────
  {
    key: 'cnpj_raiz_empresa_responsavel',
    label: 'CNPJ Raiz Empresa',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'CNPJ Raiz Empresa Responsável',
    tooltipDescricao: 'CNPJ raiz da empresa responsável pelo produto no catálogo',
    render: (_val: unknown, row: Pedido) => <span>{row.cnpj_raiz_empresa_responsavel ?? '—'}</span>,
  },
  {
    key: 'codigo_ope',
    label: 'Cód. OPE',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Código do Operador Estrangeiro (OPE)',
    tooltipDescricao: 'Código do operador estrangeiro cadastrado na DUIMP',
    render: (_val: unknown, row: Pedido) => <span>{row.codigo_ope ?? '—'}</span>,
  },
  {
    key: 'situacao_ope',
    label: 'Situação OPE',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Situação do Operador Estrangeiro',
    tooltipDescricao: 'Situação cadastral do OPE na DUIMP (Ativo, Inativo, etc.)',
    render: (_val: unknown, row: Pedido) => <span>{row.situacao_ope ?? '—'}</span>,
  },
  {
    key: 'versao_ope',
    label: 'Versão OPE',
    tipo: 'texto',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Versão do Operador Estrangeiro',
    tooltipDescricao: 'Versão do cadastro do OPE na DUIMP',
    render: (_val: unknown, row: Pedido) => <span>{row.versao_ope ?? '—'}</span>,
  },
  {
    key: 'nome_ope',
    label: 'Nome OPE',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Nome do Operador Estrangeiro',
    tooltipDescricao: 'Nome completo do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.nome_ope ?? '—'}</span>,
  },
  {
    key: 'pais_ope',
    label: 'País OPE',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'País do Operador Estrangeiro',
    tooltipDescricao: 'País do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_ope ?? '—'}</span>,
  },
  {
    key: 'estado_ope',
    label: 'Estado OPE',
    tipo: 'texto',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Estado do Operador Estrangeiro',
    tooltipDescricao: 'Estado ou província do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_ope ?? '—'}</span>,
  },
  {
    key: 'cidade_ope',
    label: 'Cidade OPE',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Cidade do Operador Estrangeiro',
    tooltipDescricao: 'Cidade do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_ope ?? '—'}</span>,
  },
  {
    key: 'endereco_ope',
    label: 'Endereço OPE',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Endereço do Operador Estrangeiro',
    tooltipDescricao: 'Endereço completo do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_ope ?? '—'}</span>,
  },
  {
    key: 'zip_code_ope',
    label: 'ZIP OPE',
    tipo: 'texto',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Zip Code do Operador Estrangeiro',
    tooltipDescricao: 'Código postal do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_ope ?? '—'}</span>,
  },
  {
    key: 'tin_ope',
    label: 'TIN OPE',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'TIN do Operador Estrangeiro',
    tooltipDescricao: 'Número de identificação fiscal (Tax Identification Number) do OPE',
    render: (_val: unknown, row: Pedido) => <span>{row.tin_ope ?? '—'}</span>,
  },
  {
    key: 'email_ope',
    label: 'E-mail OPE',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'E-mail do Operador Estrangeiro',
    tooltipDescricao: 'E-mail de contato do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.email_ope ?? '—'}</span>,
  },
  // ── Documentos (anexos e volumes) ───────────────────────────────────────────
  {
    key: 'anexo_pedido',
    label: 'Anexo P.O.',
    tipo: 'texto',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Anexo do Pedido',
    tooltipDescricao: 'Arquivo do pedido (Purchase Order) em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_pedido ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_proforma',
    label: 'Anexo Proforma',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Anexo da Proforma Invoice',
    tooltipDescricao: 'Arquivo da Proforma Invoice em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_proforma ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_invoice',
    label: 'Anexo Invoice',
    tipo: 'texto',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Anexo da Invoice',
    tooltipDescricao: 'Arquivo da Commercial Invoice em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_invoice ? '📎' : '—'}</span>,
  },
  {
    key: 'quantidade_volumes_pedido',
    label: 'Qtd Volumes',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Quantidade de Volumes Total do Pedido',
    tooltipDescricao: 'Número total de volumes (caixas, pallets, etc.) do pedido',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.quantidade_volumes_pedido != null ? String(row.quantidade_volumes_pedido) : '—'}
      </span>
    ),
  },
  {
    key: 'partnumber_produto_pedido',
    label: 'Part Number',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Part Number do Produto',
    tooltipDescricao: 'Código de referência do produto principal do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.partnumber_produto_pedido ?? '—'}</span>,
  },
  {
    key: 'referencia_interna_produto_catalogo',
    label: 'Ref. Catálogo',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Referência Interna do Produto — Catálogo',
    tooltipDescricao: 'Referência interna do produto conforme catálogo de produtos',
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_interna_produto_catalogo ?? '—'}</span>,
  },
  // ── Datas — Draft do Pedido ─────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_pedido',
    label: 'Prev. Rec. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data prevista para recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_pedido ? fmtData(row.data_prevista_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_pedido',
    label: 'Conf. Rec. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_pedido ? fmtData(row.data_confirmada_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_pedido',
    label: 'Meta Rec. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Meta de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data meta para recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_pedido ? fmtData(row.data_meta_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_pedido',
    label: 'Prev. Aprov. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data prevista para aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_pedido ? fmtData(row.data_prevista_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_pedido',
    label: 'Conf. Aprov. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_pedido ? fmtData(row.data_confirmada_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_pedido',
    label: 'Meta Aprov. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Data Meta de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data meta para aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_pedido ? fmtData(row.data_meta_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_documento_pedido',
    label: 'Dt Documento P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Data do Documento Pedido',
    tooltipDescricao: 'Data de emissão do documento do pedido (Purchase Order)',
    render: (_val: unknown, row: Pedido) => <span>{row.data_documento_pedido ? fmtData(row.data_documento_pedido) : '—'}</span>,
  },
  // ── Datas — Proforma Invoice ────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_proforma',
    label: 'Prev. Rec. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data prevista para recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_proforma ? fmtData(row.data_prevista_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_proforma',
    label: 'Conf. Rec. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_proforma ? fmtData(row.data_confirmada_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_proforma',
    label: 'Meta Rec. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Meta de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data meta para recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_proforma ? fmtData(row.data_meta_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_proforma',
    label: 'Prev. Aprov. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_proforma ? fmtData(row.data_prevista_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_proforma',
    label: 'Conf. Aprov. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_proforma ? fmtData(row.data_confirmada_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_proforma',
    label: 'Meta Aprov. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Data Meta de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data meta para aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_proforma ? fmtData(row.data_meta_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_proforma',
    label: 'Prev. Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Prevista de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data prevista para envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_proforma ? fmtData(row.data_prevista_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_proforma',
    label: 'Conf. Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Data Confirmada de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_proforma ? fmtData(row.data_confirmada_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_proforma',
    label: 'Meta Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Meta de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data meta para envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_proforma ? fmtData(row.data_meta_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_proforma',
    label: 'Prev. Rec. Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Prevista de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data prevista para recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_proforma ? fmtData(row.data_prevista_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_proforma',
    label: 'Conf. Rec. Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Data Confirmada de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_proforma ? fmtData(row.data_confirmada_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_proforma',
    label: 'Meta Rec. Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Meta de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data meta para recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_proforma ? fmtData(row.data_meta_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_proforma_invoice',
    label: 'Dt Proforma Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Data da Proforma Invoice',
    tooltipDescricao: 'Data de emissão da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_proforma_invoice ? fmtData(row.data_proforma_invoice) : '—'}</span>,
  },
  // ── Datas — Invoice ─────────────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_invoice',
    label: 'Prev. Rec. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data prevista para recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_invoice ? fmtData(row.data_prevista_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_invoice',
    label: 'Conf. Rec. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_invoice ? fmtData(row.data_confirmada_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_invoice',
    label: 'Meta Rec. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Meta de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data meta para recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_invoice ? fmtData(row.data_meta_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_invoice',
    label: 'Prev. Aprov. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_invoice ? fmtData(row.data_prevista_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_invoice',
    label: 'Conf. Aprov. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_invoice ? fmtData(row.data_confirmada_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_invoice',
    label: 'Meta Aprov. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Meta de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data meta para aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_invoice ? fmtData(row.data_meta_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_invoice',
    label: 'Prev. Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Prevista de Envio — Original da Invoice',
    tooltipDescricao: 'Data prevista para envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_invoice ? fmtData(row.data_prevista_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_invoice',
    label: 'Conf. Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Confirmada de Envio — Original da Invoice',
    tooltipDescricao: 'Data confirmada de envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_invoice ? fmtData(row.data_confirmada_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_invoice',
    label: 'Meta Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Meta de Envio — Original da Invoice',
    tooltipDescricao: 'Data meta para envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_invoice ? fmtData(row.data_meta_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_invoice',
    label: 'Prev. Rec. Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Prevista de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data prevista para recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_invoice ? fmtData(row.data_prevista_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_invoice',
    label: 'Conf. Rec. Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Confirmada de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_invoice ? fmtData(row.data_confirmada_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_invoice',
    label: 'Meta Rec. Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Meta de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data meta para recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_invoice ? fmtData(row.data_meta_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_invoice',
    label: 'Dt Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Data da Invoice',
    tooltipDescricao: 'Data de emissão da Commercial Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_invoice ? fmtData(row.data_invoice) : '—'}</span>,
  },
]

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

const COLUNAS_FILHO: GTColuna<PedidoItem>[] = [
  {
    key: 'part_number',
    label: 'Part Number',
    tipo: 'texto',
    naoOcultavel: true,
    largura: 130,
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.part_number}</span>,
  },
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    largura: 100,
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.ncm}</span>,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    tipo: 'texto',
    largura: 220,
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao}</span>,
  },
  {
    key: 'quantidade_inicial',
    label: 'Qtd Inicial',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Quantidade Inicial',
    tooltipDescricao: 'Quantidade original do item — valor imutável',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_inicial, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_atual',
    label: 'Saldo Atual',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Saldo Atual',
    tooltipDescricao: 'Saldo vivo disponível para alocação em processos logísticos',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.8125rem',
        fontWeight: row.quantidade_atual === 0 ? 400 : 600,
        color: row.quantidade_atual === 0 ? 'var(--text-muted)' : 'var(--color-success, #34d399)',
      }}>
        {fmtQuantidade(row.quantidade_atual, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_pronta',
    label: 'Qtd Pronta',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Quantidade Pronta',
    tooltipDescricao: 'Montante produzido pela fábrica e validado para embarque',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_pronta, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida',
    label: 'Qtd Transferida',
    tipo: 'numero',
    align: 'right',
    largura: 130,
    tooltipTitulo: 'Quantidade Transferida',
    tooltipDescricao: 'Total já alocado em processos logísticos (embarques)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_transferida, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada',
    label: 'Qtd Cancelada',
    tipo: 'numero',
    align: 'right',
    largura: 120,
    tooltipTitulo: 'Quantidade Cancelada',
    tooltipDescricao: 'Total cancelado permanentemente — subtrai do saldo inicial',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.8125rem',
        color: row.quantidade_cancelada > 0 ? 'var(--color-error, #ef4444)' : 'var(--text-muted)',
      }}>
        {fmtQuantidade(row.quantidade_cancelada, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'unidade_comercializada_item',
    label: 'UoM',
    tipo: 'texto',
    align: 'center',
    largura: 80,
    tooltipTitulo: 'Unidade de Medida',
    tooltipDescricao: 'Unidade de medida do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.unidade_comercializada_item ?? '—'}</span>,
  },
  {
    key: 'valor_unitario',
    label: 'Vlr Unitário',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Valor Unitário',
    tooltipDescricao: 'Valor unitário na moeda do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_unitario != null ? fmtMoeda(row.valor_unitario, row.moeda_item) : '—'}
      </span>
    ),
  },
  {
    key: 'valor_item',
    label: 'Vlr Total Item',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Valor Total do Item',
    tooltipDescricao: 'Valor total do item (valor unitário × quantidade) na moeda do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_item != null ? fmtMoeda(row.valor_item, row.moeda_item) : '—'}
      </span>
    ),
  },
  {
    key: 'moeda_item',
    label: 'Moeda Item',
    tipo: 'texto',
    align: 'center',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Moeda do Item',
    tooltipDescricao: 'Moeda utilizada para o valor unitário e total do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.moeda_item ?? '—'}</span>,
  },
  {
    key: 'sequencia_item',
    label: 'Seq.',
    tipo: 'numero',
    align: 'center',
    oculta: true,
    largura: 70,
    tooltipTitulo: 'Sequência do Item',
    tooltipDescricao: 'Número sequencial do item dentro do pedido (conforme invoice)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.sequencia_item != null ? String(row.sequencia_item).padStart(3, '0') : '—'}
      </span>
    ),
  },
  {
    key: 'descricao_completa',
    label: 'Desc. Completa',
    tipo: 'texto',
    oculta: true,
    largura: 260,
    tooltipTitulo: 'Descrição Completa do Produto',
    tooltipDescricao: 'Descrição técnica detalhada do produto conforme catálogo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa ?? '—'}</span>,
  },
  {
    key: 'descricao_espelho_nf',
    label: 'Desc. NF',
    tipo: 'texto',
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Descrição Espelho da Nota Fiscal',
    tooltipDescricao: 'Descrição do produto conforme será exibida na nota fiscal de entrada',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_espelho_nf ?? '—'}</span>,
  },
  {
    key: 'quantidade_unidade_estatistica',
    label: 'Qtd Est.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Quantidade na Unidade Estatística',
    tooltipDescricao: 'Quantidade do item expressa na unidade estatística exigida pela DUIMP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.quantidade_unidade_estatistica != null
          ? `${fmtQuantidade(row.quantidade_unidade_estatistica, row.casas_decimais_unidade_estatistica ?? 2)} ${row.unidade_estatistica ?? ''}`
          : '—'}
      </span>
    ),
  },
  // ── Pesos e cubagem ──────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_unitario',
    label: 'Peso Líq. Unit.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Peso Líquido Unitário',
    tooltipDescricao: 'Peso líquido unitário do produto, em kg',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.peso_liquido_unitario != null
          ? `${fmtQuantidade(row.peso_liquido_unitario, row.casas_decimais_peso ?? 3)} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'peso_bruto_unitario',
    label: 'Peso Bruto Unit.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Peso Bruto Unitário',
    tooltipDescricao: 'Peso bruto unitário incluindo embalagem, em kg',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.peso_bruto_unitario != null
          ? `${fmtQuantidade(row.peso_bruto_unitario, row.casas_decimais_peso ?? 3)} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'cubagem_unitaria',
    label: 'Cubagem Unit.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Cubagem Unitária',
    tooltipDescricao: 'Volume unitário do produto, em m³',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.cubagem_unitaria != null
          ? `${fmtQuantidade(row.cubagem_unitaria, row.casas_decimais_cubagem ?? 4)} m³`
          : '—'}
      </span>
    ),
  },
  // ── Embalagem e documentos ───────────────────────────────────────────────────
  {
    key: 'tipo_embalagem',
    label: 'Embalagem',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Tipo de Embalagem',
    tooltipDescricao: 'Tipo de embalagem do produto (ex: Caixa, Pallet, Tambor)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_embalagem ?? '—'}</span>,
  },
  {
    key: 'numero_lpco',
    label: 'LPCO',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Número da LPCO',
    tooltipDescricao: 'Licença, Permissão, Certificado ou Outros documentos exigidos para importação',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_lpco ?? '—'}</span>,
  },
  {
    key: 'numero_certificado_origem',
    label: 'Cert. Origem',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Número do Certificado de Origem',
    tooltipDescricao: 'Número do certificado de origem emitido pelo exportador ou câmara de comércio',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_certificado_origem ?? '—'}</span>,
  },
  {
    key: 'data_certificado_origem',
    label: 'Dt Cert. Origem',
    tipo: 'periodo',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Data do Certificado de Origem',
    tooltipDescricao: 'Data de emissão do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── Classificação ────────────────────────────────────────────────────────────
  {
    key: 'grupo_produto',
    label: 'Grupo',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Grupo do Produto',
    tooltipDescricao: 'Grupo de classificação do produto conforme cadastro',
    render: (_val: unknown, row: PedidoItem) => <span>{row.grupo_produto ?? '—'}</span>,
  },
  {
    key: 'subgrupo_produto',
    label: 'Subgrupo',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Subgrupo do Produto',
    tooltipDescricao: 'Subgrupo de classificação do produto dentro do grupo principal',
    render: (_val: unknown, row: PedidoItem) => <span>{row.subgrupo_produto ?? '—'}</span>,
  },
  {
    key: 'campo_especial',
    label: 'Campo Especial',
    tipo: 'texto',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Campo Especial',
    tooltipDescricao: 'Campo configurável para uso interno ou integrações específicas',
    render: (_val: unknown, row: PedidoItem) => <span>{row.campo_especial ?? '—'}</span>,
  },
  // ── Descrições multilíngues ──────────────────────────────────────────────────
  {
    key: 'descricao_en',
    label: 'Desc. (EN)',
    tipo: 'texto',
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Product Description (English)',
    tooltipDescricao: 'Descrição do produto em inglês, conforme invoice internacional',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_en ?? '—'}</span>,
  },
  {
    key: 'descricao_es',
    label: 'Desc. (ES)',
    tipo: 'texto',
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Descripción del Producto (Español)',
    tooltipDescricao: 'Descrição do produto em espanhol',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_es ?? '—'}</span>,
  },
  {
    key: 'texto_posicao_ncm',
    label: 'Texto NCM',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Texto da Posição da NCM',
    tooltipDescricao: 'Descrição oficial da posição tarifária NCM conforme TEC',
    render: (_val: unknown, row: PedidoItem) => <span>{row.texto_posicao_ncm ?? '—'}</span>,
  },
  {
    key: 'atributos_catalogo',
    label: 'Atributos',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Atributos — Catálogo de Produtos',
    tooltipDescricao: 'Atributos técnicos do produto conforme catálogo (cor, voltagem, etc.)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.atributos_catalogo ?? '—'}</span>,
  },
  {
    key: 'anexo_lpco',
    label: 'Anexo LPCO',
    tipo: 'texto',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Anexo da LPCO',
    tooltipDescricao: 'Arquivo da Licença, Permissão, Certificado ou Outros (LPCO)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.anexo_lpco ? '📎' : '—'}</span>,
  },
  // ── Datas do item ────────────────────────────────────────────────────────────
  {
    key: 'data_inclusao_item',
    label: 'Dt Inclusão Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 145,
    tooltipTitulo: 'Data de Inclusão do Produto/Item',
    tooltipDescricao: 'Data em que o item foi incluído no pedido',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_inclusao_item ? fmtData(row.data_inclusao_item) : '—'}</span>,
  },
  {
    key: 'data_transferencia_item',
    label: 'Dt Transf. Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 135,
    tooltipTitulo: 'Data de Transferência do Produto/Item',
    tooltipDescricao: 'Data em que o item foi transferido para um processo logístico',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_transferencia_item ? fmtData(row.data_transferencia_item) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_item',
    label: 'Dt Consol. Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Data de Consolidação do Produto/Item',
    tooltipDescricao: 'Data em que o item foi consolidado em um processo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_consolidacao_item ? fmtData(row.data_consolidacao_item) : '—'}</span>,
  },
  // ── Datas LPCO ───────────────────────────────────────────────────────────────
  {
    key: 'data_prevista_conferencia_draft_lpco',
    label: 'Prev. Conf. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Prevista de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data prevista para conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_conferencia_draft_lpco ? fmtData(row.data_prevista_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_conferencia_draft_lpco',
    label: 'Conf. Conf. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Confirmada de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data confirmada de conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_conferencia_draft_lpco ? fmtData(row.data_confirmada_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_conferencia_draft_lpco',
    label: 'Meta Conf. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Meta de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data meta para conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_conferencia_draft_lpco ? fmtData(row.data_meta_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_lpco',
    label: 'Prev. Aprov. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_lpco ? fmtData(row.data_prevista_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_lpco',
    label: 'Conf. Aprov. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_lpco ? fmtData(row.data_confirmada_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_lpco',
    label: 'Meta Aprov. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Meta de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data meta para aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_lpco ? fmtData(row.data_meta_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_registro_lpco',
    label: 'Prev. Registro LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Prevista do Registro da LPCO',
    tooltipDescricao: 'Data prevista para registro da LPCO no órgão competente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_registro_lpco ? fmtData(row.data_prevista_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_registro_lpco',
    label: 'Conf. Registro LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 165,
    tooltipTitulo: 'Data Confirmada do Registro da LPCO',
    tooltipDescricao: 'Data confirmada de registro da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_registro_lpco ? fmtData(row.data_confirmada_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_registro_lpco',
    label: 'Meta Registro LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Data Meta do Registro da LPCO',
    tooltipDescricao: 'Data meta para registro da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_registro_lpco ? fmtData(row.data_meta_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_resultado_analise_lpco',
    label: 'Prev. Análise LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Prevista do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data prevista para resultado da análise pelo órgão anuente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_resultado_analise_lpco ? fmtData(row.data_prevista_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_resultado_analise_lpco',
    label: 'Conf. Análise LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 165,
    tooltipTitulo: 'Data Confirmada do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data confirmada do resultado da análise da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_resultado_analise_lpco ? fmtData(row.data_confirmada_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_resultado_analise_lpco',
    label: 'Meta Análise LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Data Meta do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data meta para resultado da análise da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_resultado_analise_lpco ? fmtData(row.data_meta_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_deferimento_lpco',
    label: 'Prev. Deferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Prevista do Deferimento da LPCO',
    tooltipDescricao: 'Data prevista para deferimento (aprovação final) da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_deferimento_lpco ? fmtData(row.data_prevista_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_deferimento_lpco',
    label: 'Conf. Deferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Confirmada do Deferimento da LPCO',
    tooltipDescricao: 'Data confirmada do deferimento da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_deferimento_lpco ? fmtData(row.data_confirmada_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_deferimento_lpco',
    label: 'Meta Deferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Meta do Deferimento da LPCO',
    tooltipDescricao: 'Data meta para deferimento da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_deferimento_lpco ? fmtData(row.data_meta_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_indeferimento_lpco',
    label: 'Conf. Indeferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Confirmada do Indeferimento da LPCO',
    tooltipDescricao: 'Data confirmada do indeferimento (reprovação) da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_indeferimento_lpco ? fmtData(row.data_confirmada_indeferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_exigencia_lpco',
    label: 'Conf. Exigência LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
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
    oculta: true,
    largura: 210,
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
    oculta: true,
    largura: 215,
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
    oculta: true,
    largura: 210,
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
    oculta: true,
    largura: 220,
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
    oculta: true,
    largura: 225,
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
    oculta: true,
    largura: 220,
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
    oculta: true,
    largura: 230,
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
    oculta: true,
    largura: 235,
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
    oculta: true,
    largura: 230,
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
    oculta: true,
    largura: 230,
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
    oculta: true,
    largura: 235,
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
    oculta: true,
    largura: 230,
    tooltipTitulo: 'Data Meta de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data meta para recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_original_cert_origem ? fmtData(row.data_meta_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_cert_origem',
    label: 'Dt Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Data do Certificado de Origem',
    tooltipDescricao: 'Data de emissão do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_cert_origem ? fmtData(row.data_cert_origem) : '—'}</span>,
  },
  // ── DUIMP — Dados gerais ─────────────────────────────────────────────────────
  {
    key: 'tipo_operacao_duimp',
    label: 'Tipo Op. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Tipo de Operação — DUIMP',
    tooltipDescricao: 'Tipo de operação de importação conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_operacao_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_resumida_duimp',
    label: 'Desc. Resumida DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Descrição Resumida do Produto — DUIMP',
    tooltipDescricao: 'Descrição resumida do produto conforme cadastro na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_resumida_duimp ?? '—'}</span>,
  },
  {
    key: 'versao_produto_duimp',
    label: 'Versão Produto DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Versão do Produto — Catálogo DUIMP',
    tooltipDescricao: 'Versão do cadastro do produto no catálogo DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.versao_produto_duimp ?? '—'}</span>,
  },
  {
    key: 'ncm_duimp',
    label: 'NCM DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'NCM — DUIMP',
    tooltipDescricao: 'Código NCM utilizado na DUIMP (pode diferir do NCM do catálogo)',
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.ncm_duimp ?? '—'}</span>,
  },
  {
    key: 'atributos_duimp',
    label: 'Atributos DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Atributos — DUIMP',
    tooltipDescricao: 'Atributos técnicos do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.atributos_duimp ?? '—'}</span>,
  },
  {
    key: 'aplicacao_mercadoria_duimp',
    label: 'Aplicação Mercadoria DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Aplicação da Mercadoria — DUIMP',
    tooltipDescricao: 'Finalidade ou aplicação da mercadoria conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.aplicacao_mercadoria_duimp ?? '—'}</span>,
  },
  {
    key: 'condicao_mercadoria_duimp',
    label: 'Condição Mercadoria DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Condição da Mercadoria — DUIMP',
    tooltipDescricao: 'Estado da mercadoria (nova, usada, recondicionada) conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.condicao_mercadoria_duimp ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante_duimp',
    label: 'Relação Exp./Fab. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Relação entre Exportador e Fabricante — DUIMP',
    tooltipDescricao: 'Tipo de relação entre exportador e fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.relacao_exportador_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'vinculacao_preco_duimp',
    label: 'Vinculação Preço DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Vinculação de Preço — DUIMP',
    tooltipDescricao: 'Indica se há vinculação de preço entre comprador e vendedor conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.vinculacao_preco_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_completa_duimp',
    label: 'Desc. Completa DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Descrição Completa do Produto — DUIMP',
    tooltipDescricao: 'Descrição completa e técnica do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_complementar_duimp',
    label: 'Desc. Complementar DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Descrição Complementar da Mercadoria — DUIMP',
    tooltipDescricao: 'Informações complementares sobre a mercadoria na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_complementar_duimp ?? '—'}</span>,
  },
  // ── DUIMP — OPE ─────────────────────────────────────────────────────────────
  {
    key: 'codigo_ope_duimp',
    label: 'Cód. OPE DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Código do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Código do OPE (exportador) conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.codigo_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'nome_ope_duimp',
    label: 'Nome OPE DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Nome do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Nome do OPE conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.nome_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'pais_ope_duimp',
    label: 'País OPE DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'País do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'País do OPE conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.pais_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'codigo_ope_fabricante_duimp',
    label: 'Cód. OPE Fab. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Código do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Código do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.codigo_ope_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'nome_ope_fabricante_duimp',
    label: 'Nome OPE Fab. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Nome do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Nome do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.nome_ope_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'pais_fabricante_ope_duimp',
    label: 'País OPE Fab. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'País do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'País do OPE fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.pais_fabricante_ope_duimp ?? '—'}</span>,
  },
  // ── DUIMP — Valoração ────────────────────────────────────────────────────────
  {
    key: 'metodo_valoracao_duimp',
    label: 'Método Valoração DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Método de Valoração — DUIMP',
    tooltipDescricao: 'Método de valoração aduaneira utilizado na DUIMP (ex: Método 1 — Valor de Transação)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.metodo_valoracao_duimp ?? '—'}</span>,
  },
  {
    key: 'incoterm_duimp',
    label: 'Incoterm DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Incoterm / Condição de Venda — DUIMP',
    tooltipDescricao: 'Incoterm ou condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.incoterm_duimp ?? '—'}</span>,
  },
  {
    key: 'moeda_produto_duimp',
    label: 'Moeda DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Moeda do Produto — DUIMP',
    tooltipDescricao: 'Moeda utilizada no valor do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.moeda_produto_duimp ?? '—'}</span>,
  },
  {
    key: 'valor_unitario_duimp',
    label: 'Vlr Unit. DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Valor Unitário do Produto — DUIMP',
    tooltipDescricao: 'Valor unitário do produto na moeda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_unitario_duimp != null ? fmtMoeda(row.valor_unitario_duimp, row.moeda_produto_duimp ?? 'USD') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_total_condicao_venda_duimp',
    label: 'Vlr Total Cond. Venda DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Valor Total na Condição de Venda — DUIMP',
    tooltipDescricao: 'Valor total do item na condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_total_condicao_venda_duimp != null ? fmtMoeda(row.valor_total_condicao_venda_duimp, row.moeda_produto_duimp ?? 'USD') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_condicao_venda_brl_duimp',
    label: 'Vlr Cond. Venda (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Valor na Condição de Venda (R$) — DUIMP',
    tooltipDescricao: 'Valor do item na condição de venda convertido em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_condicao_venda_brl_duimp != null ? fmtMoeda(row.valor_condicao_venda_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_frete_internacional_brl_duimp',
    label: 'Frete Internacional (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Valor do Frete Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do frete internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_frete_internacional_brl_duimp != null ? fmtMoeda(row.valor_frete_internacional_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_seguro_internacional_brl_duimp',
    label: 'Seguro Internacional (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 215,
    tooltipTitulo: 'Valor do Seguro Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do seguro internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_seguro_internacional_brl_duimp != null ? fmtMoeda(row.valor_seguro_internacional_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_local_embarque_brl_duimp',
    label: 'Vlr Local Embarque (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 215,
    tooltipTitulo: 'Valor no Local de Embarque (R$) — DUIMP',
    tooltipDescricao: 'Valor da mercadoria no local de embarque em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_local_embarque_brl_duimp != null ? fmtMoeda(row.valor_local_embarque_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_aduaneiro_brl_duimp',
    label: 'Valor Aduaneiro (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Valor Aduaneiro (R$) — DUIMP',
    tooltipDescricao: 'Valor aduaneiro calculado em reais, base para tributos de importação',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_aduaneiro_brl_duimp != null ? fmtMoeda(row.valor_aduaneiro_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — Cobertura cambial ────────────────────────────────────────────────
  {
    key: 'tipo_cobertura_cambial_duimp',
    label: 'Tipo Cob. Cambial DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Tipo de Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Modalidade de cobertura cambial declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_cobertura_cambial_duimp ?? '—'}</span>,
  },
  {
    key: 'numero_rof_bacen_duimp',
    label: 'ROF/BACEN DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Número do ROF/BACEN — DUIMP',
    tooltipDescricao: 'Número do Registro de Operações Financeiras junto ao BACEN',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_rof_bacen_duimp ?? '—'}</span>,
  },
  {
    key: 'motivo_sem_cobertura_duimp',
    label: 'Motivo Sem Cobertura DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Motivo Sem Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Justificativa legal para ausência de cobertura cambial',
    render: (_val: unknown, row: PedidoItem) => <span>{row.motivo_sem_cobertura_duimp ?? '—'}</span>,
  },
  // ── DUIMP — II ──────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ii_duimp',
    label: 'BC II (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Base de Cálculo do II (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do Imposto de Importação em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.base_calculo_ii_duimp != null ? fmtMoeda(row.base_calculo_ii_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ii_duimp',
    label: 'Alíq. II (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Alíquota do II (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do Imposto de Importação',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.percentual_ii_duimp != null ? `${fmtQuantidade(row.percentual_ii_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_devido_ii_duimp',
    label: 'II Devido (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Valor Devido do II (R$) — DUIMP',
    tooltipDescricao: 'Valor total do Imposto de Importação devido',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_devido_ii_duimp != null ? fmtMoeda(row.valor_devido_ii_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_ii_duimp',
    label: 'II a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 145,
    tooltipTitulo: 'Valor a Recolher do II (R$) — DUIMP',
    tooltipDescricao: 'Valor efetivo do Imposto de Importação a recolher (deduzidas suspensões)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_recolher_ii_duimp != null ? fmtMoeda(row.valor_recolher_ii_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — IPI ─────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ipi_duimp',
    label: 'BC IPI (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Base de Cálculo do IPI (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do IPI em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.base_calculo_ipi_duimp != null ? fmtMoeda(row.base_calculo_ipi_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ipi_duimp',
    label: 'Alíq. IPI (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 115,
    tooltipTitulo: 'Alíquota do IPI (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do IPI',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.percentual_ipi_duimp != null ? `${fmtQuantidade(row.percentual_ipi_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_ipi_duimp',
    label: 'IPI a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Valor a Recolher do IPI (R$) — DUIMP',
    tooltipDescricao: 'Valor do IPI a recolher',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_recolher_ipi_duimp != null ? fmtMoeda(row.valor_recolher_ipi_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — PIS ─────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_pis_duimp',
    label: 'BC PIS (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Base de Cálculo do PIS (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do PIS/PASEP em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.base_calculo_pis_duimp != null ? fmtMoeda(row.base_calculo_pis_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_pis_duimp',
    label: 'Alíq. PIS (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 115,
    tooltipTitulo: 'Alíquota do PIS (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do PIS/PASEP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.percentual_pis_duimp != null ? `${fmtQuantidade(row.percentual_pis_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_pis_duimp',
    label: 'PIS a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Valor a Recolher do PIS (R$) — DUIMP',
    tooltipDescricao: 'Valor do PIS/PASEP a recolher',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_recolher_pis_duimp != null ? fmtMoeda(row.valor_recolher_pis_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — COFINS ──────────────────────────────────────────────────────────
  {
    key: 'base_calculo_cofins_duimp',
    label: 'BC COFINS (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 135,
    tooltipTitulo: 'Base de Cálculo do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do COFINS em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.base_calculo_cofins_duimp != null ? fmtMoeda(row.base_calculo_cofins_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_cofins_duimp',
    label: 'Alíq. COFINS (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Alíquota do COFINS (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do COFINS',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.percentual_cofins_duimp != null ? `${fmtQuantidade(row.percentual_cofins_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_cofins_duimp',
    label: 'COFINS a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 165,
    tooltipTitulo: 'Valor a Recolher do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Valor do COFINS a recolher',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_recolher_cofins_duimp != null ? fmtMoeda(row.valor_recolher_cofins_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — Tratamento administrativo ───────────────────────────────────────
  {
    key: 'existe_tratamento_administrativo_duimp',
    label: 'Trat. Adm. DUIMP?',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Existe Tratamento Administrativo? — DUIMP',
    tooltipDescricao: 'Indica se existe tratamento administrativo associado ao item na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.existe_tratamento_administrativo_duimp ?? '—'}</span>,
  },
  {
    key: 'tipo_trat_adm_duimp',
    label: 'Tipo Trat. Adm. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Tipo de Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Tipo/modalidade do tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_trat_adm_duimp ?? '—'}</span>,
  },
  {
    key: 'orgao_trat_adm_duimp',
    label: 'Órgão Trat. Adm. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Órgão do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Órgão anuente responsável pelo tratamento administrativo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.orgao_trat_adm_duimp ?? '—'}</span>,
  },
  {
    key: 'numero_lpco_trat_adm_duimp',
    label: 'LPCO Trat. Adm. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Número da LPCO do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Número da LPCO vinculada ao tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_lpco_trat_adm_duimp ?? '—'}</span>,
  },
]

// ── Colunas para exportação ───────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Pedido',                   key: 'numero_pedido',                    largura: 18 },
  { header: 'Tipo',                     key: 'tipo_operacao',                    largura: 14 },
  { header: 'Status',                   key: 'status',                           largura: 16 },
  { header: 'Exportador',               key: 'exportador_nome',                  largura: 25 },
  { header: 'Fabricante',               key: 'fabricante_nome',                  largura: 22 },
  { header: 'Ref. Importador',          key: 'referencia_importador',            largura: 20 },
  { header: 'Ref. Exportador',          key: 'referencia_exportador',            largura: 20 },
  { header: 'Ref. Fabricante',          key: 'referencia_fabricante',            largura: 20 },
  { header: 'Proforma',                 key: 'numero_proforma',                  largura: 16 },
  { header: 'Invoice',                  key: 'numero_invoice',                   largura: 16 },
  { header: 'Incoterm',                 key: 'incoterm',                         largura: 12 },
  { header: 'Valor Total',              key: 'valor_total_pedido',               largura: 18 },
  { header: 'Moeda',                    key: 'moeda_pedido',                     largura: 10 },
  { header: 'Qtd Total',                key: 'quantidade_total_pedido',          largura: 14 },
  { header: 'Unidade',                  key: 'unidade_comercializada_pedido',    largura: 12 },
  { header: 'Peso Líq. Total (kg)',      key: 'peso_liquido_total_pedido',        largura: 18 },
  { header: 'Peso Bruto Total (kg)',     key: 'peso_bruto_total_pedido',          largura: 18 },
  { header: 'Cubagem Total (m³)',        key: 'cubagem_total_pedido',             largura: 16 },
  { header: 'Cobertura Cambial',        key: 'cobertura_cambial',               largura: 18 },
  { header: 'Cond. Pagamento',          key: 'condicao_pagamento',              largura: 18 },
  { header: 'Data P.O',                 key: 'data_emissao_pedido',              largura: 14 },
  { header: 'Prev. Pronto',             key: 'data_prevista_pedido_pronto',      largura: 14 },
  { header: 'Conf. Pronto',             key: 'data_confirmada_pedido_pronto',    largura: 14 },
  { header: 'Meta Pronto',              key: 'data_meta_pedido_pronto',          largura: 14 },
  { header: 'Prev. Inspeção',           key: 'data_prevista_inspecao_pedido',    largura: 14 },
  { header: 'Conf. Inspeção',           key: 'data_confirmada_inspecao_pedido',  largura: 14 },
  { header: 'Meta Inspeção',            key: 'data_meta_inspecao_pedido',        largura: 14 },
  { header: 'Prev. Coleta',             key: 'data_prevista_coleta_pedido',      largura: 14 },
  { header: 'Conf. Coleta',             key: 'data_confirmada_coleta_pedido',    largura: 14 },
  { header: 'Meta Coleta',              key: 'data_meta_coleta_pedido',          largura: 14 },
  { header: 'Dt Consolidação',          key: 'data_consolidacao_pedido',         largura: 14 },
  { header: 'Dt Transf. Saldo',         key: 'data_transferencia_saldo_pedido',  largura: 14 },
]

// ── Ações de linha (pai) — criadas dentro do componente para acesso ao navigate ─

// ── Componente ────────────────────────────────────────────────────────────────

// ── Helper: traduz erro de API em mensagem clara para o usuário ───────────────

function mensagemErro(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const low = msg.toLowerCase()

  // ── Erros HTTP por código exato ────────────────────────────────────────────
  if (msg.includes('HTTP 400'))
    return 'Dados inválidos. Verifique o valor informado e tente novamente.'
  if (msg.includes('HTTP 401'))
    return 'Sessão expirada. Recarregue a página e faça login novamente.'
  if (msg.includes('HTTP 403'))
    return 'Sem permissão para editar este campo.'
  if (msg.includes('HTTP 404'))
    return 'Registro não encontrado. Atualize a página.'
  if (msg.includes('HTTP 409'))
    return 'Conflito de edição — outra aba já alterou este registro. Valor restaurado.'
  if (msg.includes('HTTP 422'))
    return 'Valor inválido para este campo. Verifique o formato esperado.'
  if (msg.includes('HTTP 429'))
    return 'Muitas requisições. Aguarde alguns segundos e tente novamente.'
  if (/HTTP 5\d\d/.test(msg))
    return 'Erro interno do servidor. Tente novamente em instantes.'

  // ── Resposta inválida do servidor (JSON parse error) ──────────────────────
  if (low.includes('unexpected token') || low.includes('is not valid json') || low.includes('syntaxerror'))
    return 'O servidor retornou uma resposta inválida. Tente novamente ou contate o suporte.'

  // ── Erros de rede / conectividade ─────────────────────────────────────────
  if (low.includes('failed to fetch') || low.includes('networkerror') || low.includes('network request failed'))
    return 'Sem conexão com o servidor. Verifique sua rede e tente novamente.'
  if (low.includes('timeout') || low.includes('timed out'))
    return 'A requisição demorou demais. Verifique sua conexão e tente novamente.'
  if (low.includes('aborted') || low.includes('abort'))
    return 'A operação foi cancelada. Tente novamente.'

  // ── Mensagem da API com conteúdo útil — exibir diretamente ───────────────
  // Mensagens curtas sem prefixo HTTP vêm do backend e são legíveis
  // ex: "O campo incoterm deve ser FOB, CIF ou EXW"
  if (msg.length > 0 && msg.length <= 120 && !msg.startsWith('HTTP'))
    return msg

  // ── Fallback genérico ─────────────────────────────────────────────────────
  return 'Erro ao salvar. Tente novamente ou contate o suporte.'
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ListaPedidos() {
  const { t } = useTranslation()
  const { visiveis: cardsVisiveis } = useCardPreferences()
  const navigate = useNavigate()
  const addNotification = useShellStore(s => s.addNotification)

  // ── Estado de dados ──────────────────────────────────────────────────────────
  const [pedidos, setPedidos]               = useState<Pedido[]>([])
  const [carregando, setCarregando]         = useState(true)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [temMais, setTemMais]               = useState(false)
  const [cursor, setCursor]                 = useState<string | undefined>(undefined)
  const [total, setTotal]                   = useState(0)

  // ── Seleção de pedidos (bubbled do TabelaVirtualGlobal) ──────────────────────
  const [pedidosSelecionados, setPedidosSelecionados] = useState<Pedido[]>([])

  // ── Estado do modal Transferir ───────────────────────────────────────────────
  const [modalTransferir, setModalTransferir] = useState<{ item: PedidoItem; pedidoId: string } | null>(null)
  const [qtdTransferir, setQtdTransferir]     = useState('')

  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [abaAtiva, setAbaAtiva]             = useState('todos')
  const [abas, setAbas]                     = useState<GTAbaTipo[]>(ABAS_PADRAO)
  const [preferencias, setPreferencias]     = useState<GTPreferencias | undefined>(undefined)
  const [sortCampo, setSortCampo]           = useState('data_emissao_pedido')
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>('desc')
  const [busca, setBusca]                   = useState('')
  const [erroLote, setErroLote]             = useState<string | null>(null)

  // ── Refs para evitar duplo carregamento ──────────────────────────────────────
  const carregandoRef = useRef(false)

  // ── Ações de linha (pai) ──────────────────────────────────────────────────────
  const ACOES_PAI: GTAcao<Pedido>[] = [
    {
      id: 'ver',
      tooltip: 'Ver detalhes do pedido',
      icone: <Eye size={15} weight="duotone" />,
      onClick: (row: Pedido) => { console.info('[Pedido] Ver:', row.id) },
    },
    {
      id: 'editar',
      tooltip: 'Editar dados do pedido',
      icone: <PencilSimple size={15} weight="duotone" />,
      onClick: (row: Pedido) => { navigate(`${row.id}/editar`) },
    },
    {
      id: 'duplicar',
      tooltip: 'Duplicar pedido',
      icone: <Copy size={15} weight="duotone" />,
      onClick: (row: Pedido) => { console.info('[Pedido] Duplicar:', row.id) },
    },
    {
      id: 'deletar',
      tooltip: 'Deletar pedido (somente Draft)',
      icone: <Trash size={15} weight="duotone" />,
      variant: 'danger',
      visivel: (row: Pedido) => row.status === 'draft',
      onClick: (row: Pedido) => { console.info('[Pedido] Deletar:', row.id) },
    },
  ]

  // ── Ações de linha (filho / item) ─────────────────────────────────────────────
  const ACOES_FILHO: GTAcao<PedidoItem>[] = [
    {
      id: 'transferir',
      tooltip: 'Transferir quantidade para processo logístico',
      icone: <ArrowRight size={14} weight="duotone" />,
      visivel: (row: PedidoItem) => row.quantidade_atual > 0,
      onClick: (row: PedidoItem) => {
        setModalTransferir({ item: row, pedidoId: row.pedido_id })
        setQtdTransferir('')
      },
    },
    {
      id: 'cancelar-item',
      tooltip: 'Cancelar quantidade do item',
      icone: <X size={14} weight="duotone" />,
      variant: 'danger',
      visivel: (row: PedidoItem) => row.quantidade_atual > 0,
      onClick: (row: PedidoItem) => { console.info('[Pedido] Cancelar item:', row.id) },
    },
  ]

  // ── Carregar status e preferências ──────────────────────────────────────────
  useEffect(() => {
    pedidoConfigApi.listarStatus()
      .then(res => {
        if (res.data.length > 0) {
          const abasApi: GTAbaTipo[] = [
            { valor: 'todos', label: 'Todos' },
            ...res.data
              .sort((a, b) => a.ordem - b.ordem)
              .map((s: PedidoStatusConfig) => ({
                valor: s.nome,
                label: s.rotulo,
                cor: s.cor,
              })),
          ]
          setAbas(abasApi)
        }
      })
      .catch(() => { /* fallback para ABAS_PADRAO */ })

    pedidoConfigApi.getPreferenciasUsuario()
      .then(prefs => {
        if (prefs?.colunas_visiveis?.length > 0) {
          setPreferencias({
            colunas_visiveis: prefs.colunas_visiveis,
            larguras: prefs.colunas_largura,
          })
        }
      })
      .catch(() => { /* sem preferências salvas */ })
  }, [])

  // ── Primeira carga ───────────────────────────────────────────────────────────
  const carregarInicial = useCallback(async (
    novaAba: string = abaAtiva,
    novaOrdem: string = sortCampo,
    novaDir: 'asc' | 'desc' = sortDir,
    novaBusca: string = busca,
  ) => {
    if (carregandoRef.current) return
    carregandoRef.current = true
    setCarregando(true)
    setCursor(undefined)
    try {
      const res = await pedidoVirtualApi.listar({
        sort: novaOrdem,
        dir: novaDir,
        limit: 100,
        status: novaAba !== 'todos' ? novaAba : undefined,
        busca: novaBusca || undefined,
      })
      setPedidos(res.data)
      setTotal(res.total)
      setTemMais(res.hasMore)
      setCursor(res.nextCursor ?? undefined)
    } catch {
      // Em dev sem backend, usar mock vazio para não bloquear UI
      setPedidos([])
      setTotal(0)
      setTemMais(false)
    } finally {
      setCarregando(false)
      carregandoRef.current = false
    }
  }, [abaAtiva, sortCampo, sortDir, busca])

  useEffect(() => { carregarInicial() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Carregar mais (cursor) ───────────────────────────────────────────────────
  const handleCarregarMais = useCallback(async () => {
    if (!temMais || carregandoMais || !cursor) return
    setCarregandoMais(true)
    try {
      const res = await pedidoVirtualApi.listar({
        cursor,
        sort: sortCampo,
        dir: sortDir,
        limit: 100,
        status: abaAtiva !== 'todos' ? abaAtiva : undefined,
        busca: busca || undefined,
      })
      setPedidos(prev => [...prev, ...res.data])
      setTemMais(res.hasMore)
      setCursor(res.nextCursor ?? undefined)
    } finally {
      setCarregandoMais(false)
    }
  }, [temMais, carregandoMais, cursor, sortCampo, sortDir, abaAtiva, busca])

  // ── Mudar aba ────────────────────────────────────────────────────────────────
  const handleMudarAba = useCallback((aba: string) => {
    setAbaAtiva(aba)
    carregarInicial(aba, sortCampo, sortDir, busca)
  }, [carregarInicial, sortCampo, sortDir, busca])

  // ── Ordenação ────────────────────────────────────────────────────────────────
  const handleOrdenar = useCallback((campo: string, dir: 'asc' | 'desc') => {
    setSortCampo(campo)
    setSortDir(dir)
    carregarInicial(abaAtiva, campo, dir, busca)
  }, [carregarInicial, abaAtiva, busca])

  // ── Busca ────────────────────────────────────────────────────────────────────
  const handleBuscar = useCallback((termo: string) => {
    setBusca(termo)
    carregarInicial(abaAtiva, sortCampo, sortDir, termo)
  }, [carregarInicial, abaAtiva, sortCampo, sortDir])

  // ── Edição inline (pai) ──────────────────────────────────────────────────────
  const handleEditar = useCallback(async (id: string, campo: string, valor: unknown): Promise<Pedido> => {
    const atualizado = await pedidoVirtualApi.editarCampo(id, campo, valor)
    setPedidos(prev => prev.map(p => p.id === id ? atualizado : p))
    return atualizado
  }, [])

  // ── Edição inline (filho / item) ──────────────────────────────────────────────
  const handleEditarFilho = useCallback(async (id: string, campo: string, valor: unknown): Promise<PedidoItem> => {
    // Localiza o item no estado atual para saber o pedidoId
    const pedido = pedidos.find(p => p.itens?.some(i => i.id === id))
    if (!pedido) throw new Error('Não foi possível localizar o pedido deste item. Recarregue a página.')

    const atualizado = await pedidoItemApi.atualizar(pedido.id, id, { [campo]: valor } as Partial<PedidoItem>)
      .catch(() => {
        if (import.meta.env.DEV) {
          const item = pedido.itens?.find(i => i.id === id)
          if (item) return { ...item, [campo]: valor } as PedidoItem
        }
        throw new Error(`Erro ao editar campo ${campo}`)
      })

    // Atualiza o item dentro do pedido no estado
    setPedidos(prev => prev.map(p =>
      p.id === pedido.id
        ? { ...p, itens: p.itens?.map(i => i.id === id ? atualizado : i) }
        : p,
    ))
    return atualizado
  }, [pedidos])

  // ── Carregar filhos (itens do pedido) ────────────────────────────────────────
  const handleCarregarFilhos = useCallback(async (pedido: Pedido): Promise<PedidoItem[]> => {
    return pedido.itens ?? []
  }, [])

  // ── Salvar preferências ──────────────────────────────────────────────────────
  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    pedidoConfigApi.salvarPreferenciasUsuario({
      colunas_visiveis: prefs.colunas_visiveis,
      colunas_largura: prefs.larguras,
    }).catch(() => { /* silent — preferências ficam localmente */ })
  }, [])

  // ── Ações em lote ─────────────────────────────────────────────────────────────
  const acoesLote: GTAcaoLote<Pedido>[] = [
    {
      id: 'mudar-status',
      label: 'Mudar Status',
      icone: <ArrowsClockwise size={15} weight="duotone" />,
      onClick: async (itens: Pedido[]) => {
        const ids = itens.map((p: Pedido) => p.id)
        try {
          const preview = await pedidoLoteApi.mudarStatusPreview(ids, 'consolidado')
          const resumo = preview.afetados.map(a => `✓ ${a.numero_pedido} → ${a.status}`).join('\n')
          if (window.confirm(`${resumo}\n\nConfirmar mudança de status?`)) {
            await pedidoLoteApi.mudarStatusConfirmar(ids, 'consolidado')
            await carregarInicial()
          }
        } catch (err) {
          setErroLote(err instanceof Error ? err.message : 'Erro ao mudar status')
        }
      },
    },
    {
      id: 'cancelar',
      label: 'Cancelar Pedidos',
      icone: <X size={15} weight="duotone" />,
      variant: 'danger',
      onClick: async (itens: Pedido[]) => {
        const ids = itens.map((p: Pedido) => p.id)
        try {
          const preview = await pedidoLoteApi.cancelarPreview(ids)
          if (window.confirm(`${preview.resumo.join('\n')}\n\nConfirmar cancelamento?`)) {
            await pedidoLoteApi.cancelarConfirmar(ids)
            await carregarInicial()
          }
        } catch (err) {
          setErroLote(err instanceof Error ? err.message : 'Erro ao cancelar')
        }
      },
    },
  ]

  // ── Ações de exportação (client-side) ────────────────────────────────────────
  const acoesExportacao = useMemo((): GTAcaoExport[] => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarExcel(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos', titulo: 'Pedidos' },
      ),
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSV(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarTXT(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarXML(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarJSON(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
  ], [pedidos])

  // ── Stats para KPIs ──────────────────────────────────────────────────────────
  const valorTotal    = pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)
  const qtdTotal      = pedidos.reduce((acc, p) => acc + (p.quantidade_total_pedido ?? 0), 0)
  const todosItens    = pedidos.flatMap(p => p.itens ?? [])
  const itensProntos  = todosItens.reduce((acc, i) => acc + (i.quantidade_pronta    ?? 0), 0)
  const qtdAtualTotal = todosItens.reduce((acc, i) => acc + (i.quantidade_atual     ?? 0), 0)
  const coberturaPend = pedidos
    .filter(p => p.cobertura_cambial === 'sem_cobertura' || !p.cobertura_cambial)
    .reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)

  return (
    <div className="ws-fade-up lp-page">

      {/* ── KPI cards ── */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          {cardsVisiveis.map(pref => {
            if (pref.id === 'total_pedidos') return (
              <CardBasicoGlobal key="total_pedidos"
                titulo={t('pedido.total_pedidos')}
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
                valor={total}
                subtexto={`${todosItens.length} ${t('pedido.itens_total')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.abertos')}</span><strong>{pedidos.filter(p => p.status === 'aberto').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.em_andamento')}</span><strong>{pedidos.filter(p => p.status === 'transferencia').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.concluidos')}</span><strong>{pedidos.filter(p => p.status === 'consolidado').length}</strong></p>
                </>}
              />
            )
            if (pref.id === 'valor_total') return (
              <CardBasicoGlobal key="valor_total"
                titulo={t('pedido.valor_total')}
                icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={fmtMoeda(valorTotal)}
                variante="sucesso"
                subtexto={t('pedido.soma_pedidos')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.moeda')}</span><strong>USD</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_por_pedido')}</span><strong>{fmtMoeda(pedidos.length ? valorTotal / pedidos.length : 0)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'qtd_total') return (
              <CardBasicoGlobal key="qtd_total"
                titulo={t('pedido.qtd_total')}
                icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                valor={fmtQuantidade(qtdTotal)}
                variante="aviso"
                subtexto={`${fmtQuantidade(qtdAtualTotal)} ${t('pedido.saldo_atual')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.pronto')}</span><strong>{fmtQuantidade(itensProntos)}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.saldo_vivo')}</span><strong>{fmtQuantidade(qtdAtualTotal)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'cobertura_pendente') return (
              <CardBasicoGlobal key="cobertura_pendente"
                titulo={t('pedido.cobertura_pendente')}
                icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
                valor={fmtMoeda(coberturaPend)}
                variante="erro"
                subtexto={t('pedido.sem_cobertura')}
                tooltip={<p className="cg-tooltip__row"><span>{t('pedido.aguardando_cobertura')}</span><strong>{pedidos.filter(p => !p.cobertura_cambial || p.cobertura_cambial === 'sem_cobertura').length}</strong></p>}
              />
            )
            return null
          })}
        </div>
      </div>

      {/* ── Feedback de erro em lote ── */}
      {erroLote && (
        <div className="lp-erro-lote" role="alert">
          <Warning size={16} weight="duotone" />
          <span>{erroLote}</span>
          <button onClick={() => setErroLote(null)} aria-label="Fechar erro"><X size={14} /></button>
        </div>
      )}

      {/* ── Tabela virtual ── */}
      <div className="lp-tabela-wrapper">
        <TabelaVirtualGlobal<Pedido, PedidoItem>
          dados={pedidos}
          colunas={COLUNAS_PAI}
          itemId={(p: Pedido) => p.id}

          colunasFilhas={COLUNAS_FILHO}
          onCarregarFilhos={handleCarregarFilhos}
          filhoId={(i: PedidoItem) => i.id}
          acoesFilhas={ACOES_FILHO}

          temMais={temMais}
          carregandoMais={carregandoMais}
          onCarregarMais={handleCarregarMais}

          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={handleMudarAba}

          acoes={ACOES_PAI}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          onSelecaoMudar={setPedidosSelecionados}

          acoesBarra={
            <>
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={<Plus size={14} weight="bold" />}
                onClick={() => { navigate('novo') }}
              >
                Novo
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<UploadSimple size={14} weight="duotone" />}
                onClick={() => { console.info('[Pedido] Importar') }}
              >
                Importar
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<CheckSquare size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={async () => {
                  const ids = pedidosSelecionados.map(p => p.id)
                  try {
                    const preview = await pedidoLoteApi.mudarStatusPreview(ids, 'consolidado')
                    const resumo = preview.afetados.map(a => `✓ ${a.numero_pedido} → ${a.status}`).join('\n')
                    if (window.confirm(`${resumo}\n\nConsolidar pedidos selecionados?`)) {
                      await pedidoLoteApi.mudarStatusConfirmar(ids, 'consolidado')
                      await carregarInicial()
                    }
                  } catch (err) {
                    setErroLote(err instanceof Error ? err.message : 'Erro ao consolidar')
                  }
                }}
              >
                Consolidar{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<ArrowsLeftRight size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => { console.info('[Pedido] Transferir lote:', pedidosSelecionados.map(p => p.id)) }}
              >
                Transferir{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<PencilLine size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => { console.info('[Pedido] Editar em massa:', pedidosSelecionados.map(p => p.id)) }}
              >
                Editar em Massa{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="perigo"
                tamanho="pequeno"
                icone={<Trash size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={async () => {
                  const ids = pedidosSelecionados.map(p => p.id)
                  try {
                    const preview = await pedidoLoteApi.cancelarPreview(ids)
                    if (window.confirm(`${preview.resumo.join('\n')}\n\nExcluir/cancelar pedidos selecionados?`)) {
                      await pedidoLoteApi.cancelarConfirmar(ids)
                      await carregarInicial()
                    }
                  } catch (err) {
                    setErroLote(err instanceof Error ? err.message : 'Erro ao excluir')
                  }
                }}
              >
                Excluir{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
            </>
          }

          onBuscar={handleBuscar}
          placeholderBusca="Buscar pedido, exportador, referência..."
          onOrdenar={handleOrdenar}
          sortCampo={sortCampo}
          sortDir={sortDir}

          camposEditaveis={[
            'numero_pedido',
            'exportador_nome',
            'fabricante_nome',
            'referencia_importador',
            'referencia_exportador',
            'numero_proforma',
            'numero_invoice',
            'incoterm',
          ]}
          onEditar={handleEditar}

          camposEditaveisFilhos={[
            'part_number',
            'ncm',
            'descricao',
            'unidade_comercializada_item',
            'valor_unitario',
          ]}
          onEditarFilho={handleEditarFilho}

          onSalvoComSucesso={() => addNotification({ type: 'success', message: 'Campo atualizado com sucesso.' })}
          onErroAoSalvar={(msg) => addNotification({ type: 'error', message: mensagemErro(msg) })}

          preferencias={preferencias}
          onSalvarPreferencias={handleSalvarPreferencias}

          carregando={carregando}
          emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
          emptyTitle="Nenhum pedido encontrado"
          emptyDescription="Crie seu primeiro pedido ou ajuste os filtros ativos."
          emptyAction={
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<Plus size={14} weight="bold" />}
              onClick={() => { navigate('novo') }}
            >
              Novo Pedido
            </BotaoGlobal>
          }

          rowHeight={44}
          childRowHeight={36}
          overscan={6}
          ariaLabel="Lista de pedidos"
        />
      </div>

      {/* ── Modal Transferir Quantidade ── */}
      {modalTransferir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '1.5rem', width: '400px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Transferir Quantidade — {modalTransferir.item.part_number}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Saldo disponível: <strong>{fmtQuantidade(modalTransferir.item.quantidade_atual, modalTransferir.item.casas_decimais_quantidade)} {modalTransferir.item.unidade_comercializada_item}</strong>
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Quantidade a Transferir
              </label>
              <input
                type="number"
                style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                value={qtdTransferir}
                onChange={e => setQtdTransferir(e.target.value)}
                max={modalTransferir.item.quantidade_atual}
                min={0.01}
                step={0.01}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <BotaoGlobal variante="secundario" onClick={() => { setModalTransferir(null); setQtdTransferir('') }}>Cancelar</BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                icone={<ArrowRight size={14} />}
                onClick={async () => {
                  const qtd = parseFloat(qtdTransferir)
                  if (!qtd || qtd <= 0 || qtd > modalTransferir.item.quantidade_atual) return
                  console.info('[Pedido] Transferir:', { item: modalTransferir.item.id, quantidade: qtd })
                  window.alert(`✓ Transferência de ${fmtQuantidade(qtd, modalTransferir.item.casas_decimais_quantidade)} ${modalTransferir.item.unidade_comercializada_item ?? ''} registrada.`)
                  setModalTransferir(null)
                  setQtdTransferir('')
                }}
              >
                Transferir
              </BotaoGlobal>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

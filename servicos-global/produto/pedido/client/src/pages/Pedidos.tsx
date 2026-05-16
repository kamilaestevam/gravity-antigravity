/**
 * ListaPedidos.tsx — Tela principal do produto Pedido
 *
 * Tabela virtualizada com TabelaVirtualGlobal (TanStack Virtual v3).
 * Suporta até 1 milhão de linhas via cursor keyset pagination.
 *
 * Hierarquia: Pedido (pai) → PedidoItem (filho expandível)
 *
 * Filtros de coluna: client-side, chips ativos, popover por coluna.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
import { useSelecaoStore, usePedidosSelecionados, useItensSelecionados, useHasMixedTipos } from '../shared/state/selecaoStore'
import { useLinkContextualSync } from '../shared/state/useLinkContextualSync'
import {
  Package,
  Plus,
  CaretDown,
  CaretRight,
  Eye,
  PencilSimple,
  Trash,
  CurrencyDollar,
  CurrencyCircleDollar,
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
  Sparkle,
  CopySimple,
  FilePdf,
  ArrowUp,
  ArrowDown,
  PlusCircle,
  Tag,
  Columns,
  PlugsConnected,
  PencilSimpleLine,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTMapaColunasFilho,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
  GTVirtualHandle,
} from '@nucleo/tabela-virtual-global'
// Subsistema FiltrosColuna — refactor D9 (2026-05-13). Promovido do Pedido.
import {
  FiltroChips,
  FiltroPopoverColuna,
  rotulofiltro,
  detectarTipoColuna as detectarTipoColunaCore,
} from '@nucleo/tabela-virtual-global'
import type {
  FiltroAtivo,
  FiltrosAtivosMap,
  FiltroTipo,
} from '@nucleo/tabela-virtual-global'
import { useCardPreferences, CARDS_CATALOGO } from '../shared/useCardPreferences'
import { CARD_REGISTRY, computeCardStats } from '../shared/cardRegistry'
import { useTaxasCambio } from '../shared/useTaxasCambio'
import { useTrackBehavior } from '../hooks/useTrackBehavior'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF } from '../shared/exportUtils'
import type { ColunasExport } from '../shared/exportUtils'
import {
  pedidoApi,
  pedidoVirtualApi,
  pedidoConfigApi,
  pedidoLoteApi,
  pedidoItemApi,
  pedidoDuplicarApi,
  pedidoExcluirApi,
  colunasUsuarioApi,
  configRegrasApi,
  casasDecimaisApi,
  saldoFormulaApi,
  getApiContext,
} from '../shared/api'
import type { RegrasConfigBackend } from '../shared/api'
import { parsearFormula, avaliarFormula } from '../shared/formulaEngine'
import { isPropagavel, getAlertavelKeys } from '../shared/columnBehaviorConfig'
import { renderAgregado, buildColunasPai } from '../components/lista/ColunasPai'
import { workspacesDisponiveisApi, type WorkspaceDisponivel } from '../shared/api'
import { inserirColunaAposAncora, moverColunaParaAposAncora } from '../shared/migracaoColunas'
import { ModalConsolidarPedidos } from '../components/ModalPedidosConsolidar'
import '../components/ModalPedidosConsolidar.css'
import { ModalGerarPdfPedido } from '../components/ModalPedidoGerarPdf'
import '../components/ModalPedidoGerarPdf.css'
import { ModalDuplicarPedidos } from '../components/ModalPedidosDuplicar'
import '../components/ModalPedidosDuplicar.css'
import { ModalPedidosExcluir } from '../components/ModalPedidosExcluir'
import { ModalTransferirPedido } from '../components/ModalPedidoTransferir'
import '../components/ModalPedidoTransferir.css'
import { ModalEdicaoMassaPedidos } from '../components/ModalPedidosEdicaoMassa'
import '../components/ModalPedidosEdicaoMassa.css'
import { DrawerPedido } from '../components/DrawerPedido'
import '../components/DrawerPedido.css'
import { GabiTokenBadge, useGabiQuota } from '@nucleo/gabi-field-icon-global'
import { ModalNovoPedido } from '../components/ModalPedidoNovo'
import { ModalNovoItemPedido } from '../components/ModalItemNovo'
import { ModalSmartImportPedido } from '../components/SmartImport/ModalPedidoSmartImport'
import '../components/SmartImport/ModalPedidoSmartImport.css'
import type {
  Pedido,
  PedidoItem,
  PedidoStatusConfig,
  PedidoPreferenciasColunas,
  ColunaUsuario,
} from '../shared/types'
import {
  STATUS_PEDIDO_LABELS,
  fmtQuantidade,
  fmtData,
} from '../shared/types'
import { setFormatoData, getPlaceholderData } from '../shared/useFormatoData'
import { useUnidadesPedido } from '../shared/useUnidadesPedido'
import { useIncotermsPedido } from '../shared/useIncotermsPedido'
import type { OpcoesUnidadesColunas } from '../components/lista/ColunasPai'
import './Pedidos.css'

// ── Status: cores padrão e leitura de localStorage ───────────────────────────

const PEDIDO_STATUS_STORAGE_KEY = 'pedido:status_config'

// ── Saldo do Pedido: fórmula configurável via API /configuracoes/saldo-formula
//    (fonte de verdade é o banco — tela /configuracoes grava/lê via saldoFormulaApi)

const SALDO_FORMULA_PADRAO = 'quantidade_total_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido'

/** AST inicial (síncrono) — parse do padrão para não segurar o primeiro render.
 *  Depois do mount, um useEffect busca a fórmula real via API e atualiza. */
function parsearPadraoSeguro() {
  try { return parsearFormula(SALDO_FORMULA_PADRAO) } catch { return parsearFormula('0') }
}

/** Cores padrão por código de status (backend) */
const STATUS_CORES_DEFAULT: Record<string, string> = {
  rascunho:      '#94a3b8',
  aberto:        '#f472b6',
  em_andamento:  '#fb923c',
  aprovado:      '#facc15',
  transferencia: '#2dd4bf',
  consolidado:   '#a78bfa',
  cancelado:     '#f87171',
}

// ── Caches de parse para status e casas decimais ─────────────────────────────
// Ainda chamam localStorage.getItem (barato) mas só fazem JSON.parse
// quando a string muda. Funciona mesmo com mudanças de config na mesma sessão.

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

/** Lê o mapa {id → cor} salvo pelo Configuracoes via localStorage */
function lerStatusCores(): Record<string, string> {
  const config = _lerStatusConfig()
  const mapa: Record<string, string> = {}
  for (const [id, cfg] of Object.entries(config)) mapa[id] = cfg.cor
  return mapa
}

function getStatusCor(status: string): string {
  const config = _lerStatusConfig()
  return config[status]?.cor ?? STATUS_CORES_DEFAULT[status] ?? '#64748b'
}

/** Lê o label de um status — inclui status customizados do localStorage */
function getStatusLabel(status: string): string {
  const config = _lerStatusConfig()
  return config[status]?.label ?? STATUS_PEDIDO_LABELS[status as keyof typeof STATUS_PEDIDO_LABELS] ?? status
}

// ── Tipos e helpers de filtro ─────────────────────────────────────────────────
//
// Refactor D9 (2026-05-13): tipos `FiltroAtivo`/`FiltrosAtivosMap`, o helper
// `rotulofiltro` e o componente `FiltroPopoverColuna` foram promovidos para
// `@nucleo/tabela-virtual-global`. Os imports abaixo expõem o mesmo contrato
// para outros produtos (LPCO, NF Importação, bid-frete) reusarem sem cópia.
//
// `detectarTipoColuna` Pedido-específico: o nucleo-global expõe o helper
// genérico, mas as keys "tipo_operacao", "status", "incoterm", "id_workspace"
// são forçadas a 'enum' via `tipoFiltroOverrides` abaixo — lógica do produto,
// não do framework.
//
// `FILTRO_TIPO_OVERRIDES_PEDIDO` é declarado abaixo, em escopo do módulo,
// para ser usado em `detectarTipoColunaLocal`.

// ── Helpers de filtragem (Pedido-specific) ───────────────────────────────────
//
// Overrides do Pedido para `detectarTipoColuna`: força 'enum' em colunas que
// não usam `tipo: 'badge'` mas têm valores discretos. O nucleo-global usa
// regras default (`tipo === 'badge'` → enum, `tipo === 'numero'` → numero),
// e cada produto contribui com seus overrides.
const FILTRO_TIPO_OVERRIDES_PEDIDO: Record<string, FiltroTipo> = {
  tipo_operacao: 'enum',
  status:        'enum',
  incoterm:      'enum',
  id_workspace:  'enum',  // filtro multi-workspace usa popover enum
}

/** Wrapper Pedido-specific de detectarTipoColuna — aplica overrides do produto */
function detectarTipoColunaPedido(col: GTColuna<Pedido>): FiltroTipo {
  return detectarTipoColunaCore(col, FILTRO_TIPO_OVERRIDES_PEDIDO)
}

/** Mapeia valor raw → label legível para exibição no filtro */
const LABELS_FILTRO: Record<string, Record<string, string>> = {
  tipo_operacao: { importacao: 'Importação', exportacao: 'Exportação' },
  status: {
    rascunho: 'Rascunho',
    aberto: 'Aberto',
    transferencia: 'Em Transferência',
    consolidado: 'Consolidado',
    cancelado: 'Cancelado',
  },
}

/** Inverte LABELS_FILTRO: label → raw (para aplicar filtro com valor real do banco) */
const LABELS_FILTRO_INVERSO: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(LABELS_FILTRO).map(([campo, map]) => [
    campo,
    Object.fromEntries(Object.entries(map).map(([raw, label]) => [label, raw])),
  ]),
)

// ── Status padrão (fallback sem API) ─────────────────────────────────────────

const ABAS_STATUS_VALORES = ['todos','aberto','em_andamento','aprovado','transferencia','consolidado','cancelado'] as const

/** Lê abas do localStorage (salvo pelo Configuracoes) */
function lerAbasDoLocalStorage(t: (key: string) => string = i18next.t.bind(i18next)): GTAbaTipo[] | null {
  try {
    const raw = localStorage.getItem('pedido:status_config')
    if (!raw) return null
    const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
    const entries = Object.entries(parsed)
    if (entries.length === 0) return null
    return [
      { valor: 'todos', label: t('pedido.status.todos') },
      ...entries.map(([id, cfg]) => ({
        valor: id,
        // Use i18n for known statuses, keep custom label for user-defined ones
        label: t(`pedido.status.${id}`) !== `pedido.status.${id}` ? t(`pedido.status.${id}`) : cfg.label,
        cor: cfg.cor,
      })),
    ]
  } catch { return null }
}

// ── Casas decimais configuráveis pelo usuário ────────────────────────────────

let _casasRaw: string | null | undefined = undefined
let _casasParsed: Record<string, number> = {}

function lerCasasDecimaisConfig(): Record<string, number> {
  const raw = localStorage.getItem('pedido:casas_decimais')
  if (raw !== _casasRaw) {
    _casasRaw = raw
    try { _casasParsed = raw ? JSON.parse(raw) as Record<string, number> : {} }
    catch { _casasParsed = {} }
  }
  return _casasParsed
}

/** Mapeamento de herança: campos de item herdam a config do pedido correspondente */
const CASAS_HERANCA_ITEM: Record<string, string> = {
  quantidade_item:              'quantidade_total_pedido',
  peso_liquido_unitario:   'peso_liquido_total_pedido',
  peso_bruto_unitario:     'peso_bruto_total_pedido',
  cubagem_unitaria:        'cubagem_total_pedido',
}

/** Retorna casas decimais para um campo, respeitando config do usuário em Configurações */
function getCasas(campo: string, padrao: number): number {
  const config = lerCasasDecimaisConfig()
  const key = CASAS_HERANCA_ITEM[campo] ?? campo
  return config[key] ?? padrao
}

// ── Ref de alertas: carregado uma vez no mount, acessível pelos renders estáticos ──
const _regrasAlertasRef: { current: RegrasConfigBackend | null } = { current: null }

// ── Helpers de data ───────────────────────────────────────────────────────────

/**
 * Normaliza uma string de data digitada pelo usuário para ISO datetime (noon UTC).
 * Aceita: 'dd/mm/yyyy', 'yyyy-mm-dd', ISO datetime completo.
 * Usar noon UTC (T12:00:00Z) evita offset de fuso em qualquer timezone.
 */
function normalizarDataISO(val: unknown): string | null {
  if (!val || typeof val !== 'string') return null
  const v = val.trim()
  if (!v) return null
  // dd/mm/yyyy
  const ddmm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v)
  if (ddmm) return `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}T12:00:00.000Z`
  // yyyy-mm-dd (date-only ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T12:00:00.000Z`
  // já é ISO datetime completo
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v
  return null
}

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

function renderQtdPedido(row: Pedido, campoItem: keyof PedidoItem, casas = 0, tooltip?: { titulo: string; descricao: string }) {
  const itens = row.itens ?? []
  if (itens.length === 0) return <span style={{ fontVariantNumeric: 'tabular-nums' }}>—</span>
  const unidades = [...new Set(itens.map(i => i.unidade_comercializada_item ?? 'UN'))]
  const diverge = unidades.length > 1
  const wrap = (node: React.ReactNode) => tooltip
    ? <TooltipGlobal titulo={tooltip.titulo} descricao={tooltip.descricao}><span style={{ display: 'contents' }}>{node}</span></TooltipGlobal>
    : <>{node}</>
  if (diverge) {
    const grupos: Record<string, number> = {}
    for (const item of itens) {
      const u = item.unidade_comercializada_item ?? 'UN'
      grupos[u] = (grupos[u] ?? 0) + (Number(item[campoItem]) || 0)
    }
    return wrap(
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
        {Object.entries(grupos).map(([unit, soma]) => (
          <span key={unit} className="gtv-celula-moeda">
            {fmtQuantidade(soma, casas)}
            <span className="gtv-celula-unidade-badge" style={{ color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>{unit}</span>
          </span>
        ))}
      </span>
    )
  }
  const soma = itens.reduce((s, i) => s + (Number(i[campoItem]) || 0), 0)
  return wrap(
    <span className="gtv-celula-moeda">
      {fmtQuantidade(soma, casas)}
      <span className="gtv-celula-unidade-badge">{unidades[0]}</span>
    </span>
  )
}

// Colunas pai agora vem de buildColunasPai(t, opcoes) — ver colunasPai.tsx
// Variavel module-level para codigo que precisa das colunas fora do componente React.
// Aqui só usamos as KEYS (COLUNAS_PAI_CHAVES) — unidades podem ser vazias.
const COLUNAS_PAI: GTColuna<Pedido>[] = buildColunasPai(
  i18next.t.bind(i18next),
  { unidadesPeso: [], unidadesCubagem: [] },
)

// ── Chaves das colunas estáticas do Pedido (para camposDisponiveis em fórmulas) ──

export const COLUNAS_PAI_CHAVES: string[] = COLUNAS_PAI
  .map(c => c.key as string)

// ── Sequência padrão de colunas visíveis (primeira abertura sem preferências salvas) ──
// As primeiras N aparecem na ordem definida; as demais seguem a ordem original de COLUNAS_PAI.

const _COLUNAS_PADRAO_SEQUENCIA: string[] = [
  // ── Sequência padrão definida pelo dono (UX 2026-05-14) ──
  // Esta é a ordem exata que o usuário verá na primeira abertura.
  // Após arrastar/ocultar, as preferências do usuário prevalecem.
  'numero_pedido',
  'tipo_operacao',
  'status',
  'id_workspace',
  'nome_importador',
  'nome_exportador',
  'referencia_importador',
  'referencia_exportador',
  'incoterm',
  'descricao_item',
  'ncm',
  'moeda_pedido',
  'valor_por_unidade_item',
  'quantidade_total_pedido',
  'valor_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'unidade_comercializada_pedido',
  'quantidade_transferida_total',
  'saldo_itens_do_pedido',
  'quantidade_cancelada_total_pedido',
  'quantidade_volumes_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  'cnpj_importador',
  'cnpj_exportador',
  'endereco_exportador',
  'estado_exportador',
  'cidade_exportador',
  'pais_exportador',
  'zip_code_exportador',
  'nome_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  'referencia_fabricante',
  'relacao_exportador_fabricante',
  'exportador_ou_fabricante',
  'nome_fabricante',
  'endereco_fabricante',
  'cidade_fabricante',
  'pais_fabricante',
  'zip_code_fabricante',
  'cobertura_cambial',
  'condicao_pagamento',
  'moeda_cambio_pedido',
  'valor_total_cambio_pedido',
  'contrato_cambio_id_pedido',
  'taxa_cambio_estimada',
  'numero_proforma',
  'numero_invoice',
  'data_emissao_pedido',
  'data_transferencia_saldo_pedido',
  'estado_fabricante',
  'whatsapp_contato_exportador',
  'data_prevista_pedido_pronto',
  'email_contato_exportador',
  'data_confirmada_pedido_pronto',
  'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido',
  'data_confirmada_inspecao_pedido',
  'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido',
  'data_confirmada_coleta_pedido',
  'data_meta_coleta_pedido',
  'data_prevista_recebimento_rascunho_pedido',
  'data_confirmada_recebimento_rascunho_pedido',
  'data_meta_recebimento_rascunho_pedido',
  'data_consolidacao_pedido',
  'data_prevista_aprovacao_rascunho_pedido',
  'data_confirmada_aprovacao_rascunho_pedido',
  'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'anexo_pedido',
  'data_documento_proforma',
  'data_prevista_recebimento_rascunho_proforma',
  'data_confirmada_recebimento_rascunho_proforma',
  'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma',
  'data_confirmada_aprovacao_rascunho_proforma',
  'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'anexo_proforma',
  'data_documento_invoice',
  'data_prevista_recebimento_rascunho_invoice',
  'data_confirmada_recebimento_rascunho_invoice',
  'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice',
  'data_confirmada_aprovacao_rascunho_invoice',
  'data_meta_aprovacao_rascunho_invoice',
  'data_prevista_envio_original_invoice',
  'data_confirmada_envio_original_invoice',
  'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice',
  'data_confirmada_recebimento_original_invoice',
  'data_meta_recebimento_original_invoice',
  'anexo_invoice',
  'cnpj_raiz_empresa_responsavel',
  'codigo_ope',
  'situacao_ope',
  'versao_ope',
  'nome_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'endereco_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
]

const COLUNAS_PADRAO_VISIVEIS: string[] = [
  ..._COLUNAS_PADRAO_SEQUENCIA,
  ...COLUNAS_PAI_CHAVES.filter(k => !_COLUNAS_PADRAO_SEQUENCIA.includes(k)),
]

// ── Mapper: ColunaUsuario → GTColuna<Pedido> ──────────────────────────────────

// Contexto numérico do pedido para avaliação de fórmulas C2 (T03)
function buildFormulaContexto(row: Pedido): Record<string, number | null> {
  const n = (v: unknown): number | null => {
    if (v == null) return null
    const num = typeof v === 'object' ? (v as Record<string, unknown>).valor : v
    const parsed = Number(num)
    return isNaN(parsed) ? null : parsed
  }
  const r = row as Record<string, unknown>
  return {
    quantidade_total_pedido:      n(r.quantidade_total_pedido),
    quantidade_cancelada_total_pedido:    n(r.quantidade_cancelada_total_pedido),
    quantidade_transferida_total:         n(r.quantidade_transferida_total),
    quantidade_pronta_itens_pedido_total: n(r.quantidade_pronta_itens_pedido_total),
    saldo_itens_do_pedido:                n(r.saldo_itens_do_pedido),
    valor_total:                          n(r.valor_total_pedido),
    peso_liquido_total_pedido:            n(r.peso_liquido_total_pedido),
    peso_bruto_total_pedido:              n(r.peso_bruto_total_pedido),
    cubagem_total_pedido:                 n(r.cubagem_total_pedido),
  }
}

// Helper: texto com truncamento a 150 chars + tooltip (T04)
function renderTextoC2(valor: string, label: string): React.ReactElement {
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

function mapColunaUsuarioParaGTColuna(col: ColunaUsuario): GTColuna<Pedido> {
  // Parse AST e casas decimais uma vez por definição de coluna, não por linha renderizada
  const formulaAST = col.tipo === 'formula' && col.formula_expressao
    ? (() => { try { return parsearFormula(col.formula_expressao!) } catch { return null } })()
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
    oculta:          !col.ativo,
    // fórmula e checkbox são read-only; demais tipos permitem edição inline
    editavel:        col.tipo !== 'formula' && col.tipo !== 'checkbox',
    opcoes:          (col.tipo === 'select' || col.tipo === 'tipo_documento') && col.opcoes?.length
                       ? col.opcoes.map(o => ({ valor: o, label: o }))
                       : undefined,
    tooltipTitulo:   col.nome,
    tooltipDescricao: col.descricao,
    getValorEditar: (row: Pedido) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined
      const raw = valores?.[col.id]
      if (raw == null) return col.tipo === 'numero' || col.tipo === 'percentual' ? 0 : ''
      if (col.tipo === 'numero' || col.tipo === 'percentual') return Number(raw) || 0
      return raw
    },
    render: (_val: unknown, row: Pedido) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as
        Record<string, string> | undefined
      const valor = valores?.[col.id] ?? '—'

      const divergentes = (row as Record<string, unknown>)['_colunas_usuario_divergentes'] as Record<string, boolean> | undefined
      const divergente = (col.escopo || 'ambos') === 'ambos' && (divergentes?.[col.id] ?? false)

      // ── Checkbox ────────────────────────────────────────────────────────────
      if (col.tipo === 'checkbox') {
        const txt = valor === 'true' ? '✓' : valor === 'false' ? '✗' : '—'
        return renderAgregado(txt, divergente, `Valores divergentes entre itens para "${col.nome}"`)
      }

      // ── Fórmula: calcula em tempo real a partir dos campos do pedido (T03) ──
      if (col.tipo === 'formula') {
        if (formulaAST) {
          try {
            const contexto = buildFormulaContexto(row)
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
          return renderAgregado(`${fmtQuantidade(num, casasCol)}${sufixo}`, divergente, `Valores divergentes entre itens para "${col.nome}"`)
        }
      }

      // ── Data — aplica o formato global configurado pelo tenant ───────────────
      if (col.tipo === 'data' && valor !== '—') {
        return renderAgregado(fmtData(valor), divergente, `Valores divergentes entre itens para "${col.nome}"`)
      }

      // ── Texto / Select / Tipo Documento — trunca em 150 chars (T04) ─────────
      if (divergente) {
        return renderAgregado(valor !== '—' ? valor : null, true, `Valores divergentes entre itens para "${col.nome}"`)
      }
      return renderTextoC2(valor, col.nome)
    },
  }
}

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

const COLUNAS_FILHO: GTColuna<PedidoItem>[] = [
  {
    key: 'part_number',
    label: 'Nº do Item',
    tipo: 'texto',
    grupo: 'Identificação',
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.part_number}</span>,
  },
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    grupo: 'Identificação',
    render: (_val: unknown, row: PedidoItem) => {
      const digits = (row.ncm ?? '').replace(/\D/g, '')
      const formatted = digits.length === 8
        ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
        : (row.ncm ?? '—')
      return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{formatted}</span>
    },
  },
  {
    key: 'descricao_item',
    label: 'Descrição do Item',
    tipo: 'texto',
    grupo: 'Identificação',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_item}</span>,
  },
  {
    key: 'quantidade_inicial_pedido',
    label: 'Qtd Inicial do Item no Pedido',
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Quantidade Inicial',
    tooltipDescricao: 'Quantidade original do item — valor imutável',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_inicial_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_atual_pedido',
    label: 'Saldo do Item',
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Saldo',
    tooltipDescricao: 'Quantidade inicial menos canceladas e transferidas',
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
    label: 'Quantidade Pronta do Item no Pedido',
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Quantidade Pronta',
    tooltipDescricao: 'Montante produzido pela fábrica e validado para embarque',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_pronta_total_item_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida_pedido',
    label: 'Quantidade Transferida do Item no Pedido',
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Quantidade Transferida',
    tooltipDescricao: 'Quantidade já transferida deste item para outros pedidos.',
    tooltipBloqueado: 'Campo calculado — incrementado automaticamente ao executar uma transferência. Não pode ser editado diretamente.',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#60a5fa' }}>
        {fmtQuantidade(row.quantidade_transferida_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada_pedido',
    label: 'Quantidade Cancelada do Item no Pedido',
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Quantidade Cancelada',
    tooltipDescricao: 'Total cancelado permanentemente — subtrai do saldo inicial',
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
    label: 'Seq. Item',
    tipo: 'numero',
    align: 'center',
    grupo: 'Identificação',
    tooltipTitulo: 'Sequência do Item',
    tooltipDescricao: 'Número sequencial do item dentro do pedido (conforme invoice)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.sequencia_item != null ? String(row.sequencia_item).padStart(3, '0') : '—'}
      </span>
    ),
  },
  {
    key: 'descricao_completa_item_pt',
    label: 'Descrição Completa do Item/Produto',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Descrição Completa do Produto',
    tooltipDescricao: 'Descrição técnica detalhada do produto conforme catálogo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_item_pt ?? '—'}</span>,
  },
  {
    key: 'descricao_completa_item_nf',
    label: 'Descrição Completa do Item/Produto- NF',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Descrição Espelho da Nota Fiscal',
    tooltipDescricao: 'Descrição do produto conforme será exibida na nota fiscal de entrada',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_item_nf ?? '—'}</span>,
  },
  {
    key: 'quantidade_unidade_estatistica',
    label: 'Qtd Est.',
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: 'Quantidade na Unidade Estatística',
    tooltipDescricao: 'Quantidade do item expressa na unidade estatística exigida pela DUIMP',
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
    label: 'Peso Líquido Unitário do Item',
    tipo: 'numero',
    align: 'right',
    grupo: 'Dados Físicos',
    tooltipTitulo: 'Peso Líquido Unitário',
    tooltipDescricao: 'Peso líquido unitário do produto, em kg',
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
    label: 'Peso Bruto Unitário do Item',
    tipo: 'numero',
    align: 'right',
    grupo: 'Dados Físicos',
    tooltipTitulo: 'Peso Bruto Unitário',
    tooltipDescricao: 'Peso bruto unitário incluindo embalagem, em kg',
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
    label: 'Cubagem Unitária do Item',
    tipo: 'numero',
    align: 'right',
    grupo: 'Dados Físicos',
    tooltipTitulo: 'Cubagem Unitária',
    tooltipDescricao: 'Volume unitário do produto, em m³',
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
    label: 'Tipo de Embalagem',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Dados Físicos',
    tooltipTitulo: 'Tipo de Embalagem',
    tooltipDescricao: 'Tipo de embalagem do produto (ex: Caixa, Pallet, Tambor)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_embalagem ?? '—'}</span>,
  },
  {
    key: 'numero_lpco',
    label: 'Número da LPCO',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Número da LPCO',
    tooltipDescricao: 'Licença, Permissão, Certificado ou Outros documentos exigidos para importação',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_lpco ?? '—'}</span>,
  },
  {
    key: 'numero_certificado_origem',
    label: 'Número do Certificado de Origem',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Número do Certificado de Origem',
    tooltipDescricao: 'Número do certificado de origem emitido pelo exportador ou câmara de comércio',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_certificado_origem ?? '—'}</span>,
  },
  {
    key: 'data_certificado_origem',
    label: 'Dt Cert. Origem',
    tipo: 'periodo',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Data do Certificado de Origem',
    tooltipDescricao: 'Data de emissão do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── Classificação ────────────────────────────────────────────────────────────
  {
    key: 'grupo_item',
    label: 'Grupo do Item/Produto',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Identificação',
    tooltipTitulo: 'Grupo do Produto',
    tooltipDescricao: 'Grupo de classificação do produto conforme cadastro',
    render: (_val: unknown, row: PedidoItem) => <span>{row.grupo_item ?? '—'}</span>,
  },
  {
    key: 'subgrupo_item',
    label: 'Subgrupo do Item/Produto',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Identificação',
    tooltipTitulo: 'Subgrupo do Produto',
    tooltipDescricao: 'Subgrupo de classificação do produto dentro do grupo principal',
    render: (_val: unknown, row: PedidoItem) => <span>{row.subgrupo_item ?? '—'}</span>,
  },
  {
    key: 'campo_especial_item',
    label: 'Campo Especial do Item/Produto',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Campo Especial',
    tooltipDescricao: 'Campo configurável para uso interno ou integrações específicas',
    render: (_val: unknown, row: PedidoItem) => <span>{row.campo_especial_item ?? '—'}</span>,
  },
  // ── Descrições multilíngues ──────────────────────────────────────────────────
  {
    key: 'descricao_completa_item_en',
    label: 'Descrição Completa do Item/Produto- Inglês',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Product Description (English)',
    tooltipDescricao: 'Descrição do produto em inglês, conforme invoice internacional',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_item_en ?? '—'}</span>,
  },
  {
    key: 'descricao_completa_item_es',
    label: 'Descrição Completa do Item/Produto- Espanhol',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Descripción del Producto (Español)',
    tooltipDescricao: 'Descrição do produto em espanhol',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_item_es ?? '—'}</span>,
  },
  {
    key: 'texto_posicao_ncm',
    label: 'Texto NCM',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Texto da Posição da NCM',
    tooltipDescricao: 'Descrição oficial da posição tarifária NCM conforme TEC',
    render: (_val: unknown, row: PedidoItem) => <span>{row.texto_posicao_ncm ?? '—'}</span>,
  },
  {
    key: 'atributos_catalogo',
    label: 'Atributo do Produto - Catálogo',
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: 'Atributos — Catálogo de Produtos',
    tooltipDescricao: 'Atributos técnicos do produto conforme catálogo (cor, voltagem, etc.)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.atributos_catalogo ?? '—'}</span>,
  },
  {
    key: 'anexo_lpco',
    label: 'Anexo LPCO',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Anexo da LPCO',
    tooltipDescricao: 'Arquivo da Licença, Permissão, Certificado ou Outros (LPCO)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.anexo_lpco ? '📎' : '—'}</span>,
  },
  // ── Datas do item ────────────────────────────────────────────────────────────
  {
    key: 'data_transferencia_item',
    label: 'Data de Transferência do Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Identificação',
    tooltipTitulo: 'Data de Transferência do Produto/Item',
    tooltipDescricao: 'Data em que o item foi transferido para um processo logístico',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_transferencia_item ? fmtData(row.data_transferencia_item) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_item',
    label: 'Data de Consolidação do Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Identificação',
    tooltipTitulo: 'Data de Consolidação do Produto/Item',
    tooltipDescricao: 'Data em que o item foi consolidado em um processo',
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
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_operacao_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_resumida_duimp',
    label: 'Descrição Resumida Produto - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Descrição Resumida do Produto — DUIMP',
    tooltipDescricao: 'Descrição resumida do produto conforme cadastro na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_resumida_duimp ?? '—'}</span>,
  },
  {
    key: 'versao_produto_duimp',
    label: 'Versão do Produto - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Versão do Produto — Catálogo DUIMP',
    tooltipDescricao: 'Versão do cadastro do produto no catálogo DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.versao_produto_duimp ?? '—'}</span>,
  },
  {
    key: 'ncm_duimp',
    label: 'NCM - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'NCM — DUIMP',
    tooltipDescricao: 'Código NCM utilizado na DUIMP (pode diferir do NCM do catálogo)',
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.ncm_duimp ?? '—'}</span>,
  },
  {
    key: 'atributos_duimp',
    label: 'Atributos - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Atributos — DUIMP',
    tooltipDescricao: 'Atributos técnicos do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.atributos_duimp ?? '—'}</span>,
  },
  {
    key: 'aplicacao_mercadoria_duimp',
    label: 'Aplicação Mercadoria - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Aplicação da Mercadoria — DUIMP',
    tooltipDescricao: 'Finalidade ou aplicação da mercadoria conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.aplicacao_mercadoria_duimp ?? '—'}</span>,
  },
  {
    key: 'condicao_mercadoria_duimp',
    label: 'Condição Mercadoria - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Condição da Mercadoria — DUIMP',
    tooltipDescricao: 'Estado da mercadoria (nova, usada, recondicionada) conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.condicao_mercadoria_duimp ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante_duimp',
    label: 'Relação Exportador/Fabricante - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Relação entre Exportador e Fabricante — DUIMP',
    tooltipDescricao: 'Tipo de relação entre exportador e fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.relacao_exportador_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'vinculacao_preco_duimp',
    label: 'Vinculação Preço - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Vinculação de Preço — DUIMP',
    tooltipDescricao: 'Indica se há vinculação de preço entre comprador e vendedor conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.vinculacao_preco_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_completa_duimp',
    label: 'Descrição Completa - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Descrição Completa do Produto — DUIMP',
    tooltipDescricao: 'Descrição completa e técnica do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_complementar_duimp',
    label: 'Descrição Complementar - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Descrição Complementar da Mercadoria — DUIMP',
    tooltipDescricao: 'Informações complementares sobre a mercadoria na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_complementar_duimp ?? '—'}</span>,
  },
  // ── DUIMP — OPE ─────────────────────────────────────────────────────────────
  {
    key: 'codigo_ope_duimp',
    label: 'Cód. OPE Descrição Completa - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Código do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Código do OPE (exportador) conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.codigo_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'nome_ope_duimp',
    label: 'Nome OPE - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Nome do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Nome do OPE conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.nome_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'pais_ope_duimp',
    label: 'País OPE - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'País do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'País do OPE conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.pais_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'codigo_ope_fabricante_duimp',
    label: 'Cód. OPE Fabricante - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Código do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Código do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.codigo_ope_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'nome_ope_fabricante_duimp',
    label: 'Nome OPE Fabricante - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Nome do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Nome do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.nome_ope_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'pais_fabricante_ope_duimp',
    label: 'País OPE Fab. - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'País do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'País do OPE fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.pais_fabricante_ope_duimp ?? '—'}</span>,
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
    render: (_val: unknown, row: PedidoItem) => <span>{row.metodo_valoracao_duimp ?? '—'}</span>,
  },
  {
    key: 'incoterm_duimp',
    label: 'Incoterm - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Incoterm / Condição de Venda — DUIMP',
    tooltipDescricao: 'Incoterm ou condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.incoterm_duimp ?? '—'}</span>,
  },
  {
    key: 'moeda_produto_duimp',
    label: 'Moeda - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Moeda do Produto — DUIMP',
    tooltipDescricao: 'Moeda utilizada no valor do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.moeda_produto_duimp ?? '—'}</span>,
  },
  {
    key: 'valor_unitario_duimp',
    label: 'Valor Unitário do Produto - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Unitário do Produto — DUIMP',
    tooltipDescricao: 'Valor unitário do produto na moeda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => {
      const moeda = row.moeda_produto_duimp ?? 'USD'
      const num = Number(row.valor_unitario_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
          {row.valor_unitario_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_total_condicao_venda_duimp',
    label: 'Valor Total na Condição de Venda - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Total na Condição de Venda — DUIMP',
    tooltipDescricao: 'Valor total do item na condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => {
      const moeda = row.moeda_produto_duimp ?? 'USD'
      const num = Number(row.valor_total_condicao_venda_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
          {row.valor_total_condicao_venda_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_condicao_venda_brl_duimp',
    label: 'Valor na Condição de Venda - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor na Condição de Venda (R$) — DUIMP',
    tooltipDescricao: 'Valor do item na condição de venda convertido em reais',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_condicao_venda_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
          {row.valor_condicao_venda_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_frete_internacional_brl_duimp',
    label: 'Frete Internacional (R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor do Frete Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do frete internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_frete_internacional_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
          {row.valor_frete_internacional_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_seguro_internacional_brl_duimp',
    label: 'Seguro Internacional (R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor do Seguro Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do seguro internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_seguro_internacional_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
          {row.valor_seguro_internacional_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_local_embarque_brl_duimp',
    label: 'Valor Local de Embarque (R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor no Local de Embarque (R$) — DUIMP',
    tooltipDescricao: 'Valor da mercadoria no local de embarque em reais',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_local_embarque_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
          {row.valor_local_embarque_brl_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_aduaneiro_brl_duimp',
    label: 'Valor Aduaneiro (R$) - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Aduaneiro (R$) — DUIMP',
    tooltipDescricao: 'Valor aduaneiro calculado em reais, base para tributos de importação',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_aduaneiro_brl_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
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
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_cobertura_cambial_duimp ?? '—'}</span>,
  },
  {
    key: 'numero_rof_bacen_duimp',
    label: 'Número do ROF - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Número do ROF/BACEN — DUIMP',
    tooltipDescricao: 'Número do Registro de Operações Financeiras junto ao BACEN',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_rof_bacen_duimp ?? '—'}</span>,
  },
  {
    key: 'motivo_sem_cobertura_duimp',
    label: 'Motivo Sem Cobertura - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Motivo Sem Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Justificativa legal para ausência de cobertura cambial',
    render: (_val: unknown, row: PedidoItem) => <span>{row.motivo_sem_cobertura_duimp ?? '—'}</span>,
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
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor Devido do II (R$) — DUIMP',
    tooltipDescricao: 'Valor total do Imposto de Importação devido',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_devido_ii_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
          {row.valor_devido_ii_duimp != null && !isNaN(num) ? fmtQuantidade(num, 2) : '—'}
        </span>
      )
    },
  },
  {
    key: 'valor_recolher_ii_duimp',
    label: 'Valor Recolher do II - DUIMP',
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do II (R$) — DUIMP',
    tooltipDescricao: 'Valor efetivo do Imposto de Importação a recolher (deduzidas suspensões)',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_ii_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
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
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do IPI (R$) — DUIMP',
    tooltipDescricao: 'Valor do IPI a recolher',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_ipi_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
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
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do PIS (R$) — DUIMP',
    tooltipDescricao: 'Valor do PIS/PASEP a recolher',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_pis_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
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
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Valor a Recolher do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Valor do COFINS a recolher',
    render: (_val: unknown, row: PedidoItem) => {
      const num = Number(row.valor_recolher_cofins_duimp)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">BRL</span>
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
    render: (_val: unknown, row: PedidoItem) => <span>{row.existe_tratamento_administrativo_duimp ?? '—'}</span>,
  },
  {
    key: 'tipo_trat_adm_duimp',
    label: 'Tipo Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Tipo de Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Tipo/modalidade do tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_trat_adm_duimp ?? '—'}</span>,
  },
  {
    key: 'orgao_trat_adm_duimp',
    label: 'Órgão Anuente Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Órgão do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Órgão anuente responsável pelo tratamento administrativo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.orgao_trat_adm_duimp ?? '—'}</span>,
  },
  {
    key: 'numero_lpco_trat_adm_duimp',
    label: 'Número LPCO Tratamento Administrativo - DUIMP',
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: 'Número da LPCO do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Número da LPCO vinculada ao tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_lpco_trat_adm_duimp ?? '—'}</span>,
  },
]

// ── Campos editáveis pai — exclui todos os totais calculados automaticamente ──
// Categoria A (derivados dos itens): nunca editáveis pelo usuário
const CAMPOS_DERIVADOS_PAI = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'saldo_itens_do_pedido',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
])

const CAMPOS_EDITAVEIS_PAI = COLUNAS_PAI
  .filter(c => !CAMPOS_DERIVADOS_PAI.has(c.key) && c.editavel !== false)
  .map(c => c.key)

// ── Mapa de colunas filho → renderização nas linhas expandidas ────────────────
// As linhas de item usam as mesmas colunas do pedido pai para alinhamento perfeito.
// Colunas sem mapeamento ficam vazias na linha do item.

const CAMPOS_NUMERICOS_ITEM = new Set([
  'quantidade_inicial_pedido', 'quantidade_atual_pedido', 'quantidade_pronta_total_item_pedido',
  'quantidade_transferida_pedido', 'quantidade_cancelada_pedido',
  'peso_liquido_unitario', 'peso_bruto_unitario', 'cubagem_unitaria',
])

// Fator de conversão reversa: KG armazenado → unidade de exibição
const KG_PARA_UNIDADE: Record<string, number> = { KG: 1, G: 1000, TON: 0.001, KGBR: 1 }

// Campos com unidade física fixa — GTValorUnidade usado só para exibir a unidade no popover,
// mas NÃO grava unidade_comercializada_item (a unidade não muda)
const CAMPOS_UNIDADE_FIXA_ITEM = new Set([
  'peso_liquido_unitario', 'peso_bruto_unitario', 'cubagem_unitaria',
])

// Campos que pertencem ao Pedido pai — edição roteia para pedidoApi
const CAMPOS_PAI_TEXTO = new Set([
  'numero_proforma', 'numero_invoice',
])

// Tipo auxiliar: item enriquecido com dados do pedido pai para renderização
type PedidoItemEnriquecido = PedidoItem & {
  _p: {
    id: string
    id_workspace?: string | null
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

function buildMapaColunasFilho(opcoes: OpcoesUnidadesColunas): Record<string, GTMapaColunasFilho<PedidoItem>> {
  const { unidadesPeso, unidadesCubagem, workspacesMap } = opcoes

  /** Monta URL deep-link para editar CNPJ do workspace no Configurador, com retorno automático */
  const urlEditarCnpjWorkspace = (idWorkspace: string, pedidoId?: string) => {
    const urlAtual = new URL(window.location.href)
    if (pedidoId) urlAtual.searchParams.set('expandir', pedidoId)
    const retorno = encodeURIComponent(urlAtual.toString())
    const base = import.meta.env.DEV ? 'http://localhost:8000' : '/configurador'
    return `${base}/workspace/workspaces?id=${idWorkspace}&foco=cnpj&retorno=${retorno}`
  }

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
      const p = (row as PedidoItemEnriquecido)._p
      if (!p) return null
      return (
        <StatusBadgeGlobal
          valor={p.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
          genero="feminino"
          style={p.tipo_operacao === 'importacao'
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
      if (tipoOp === 'importacao') return <span>{row.nome_exportador ?? '—'}</span>
      return <span>{(row as PedidoItemEnriquecido)._p?.nome_exportador ?? '—'}</span>
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
      if (tipoOp === 'exportacao') return <span>{row.nome_importador ?? '—'}</span>
      return <span>{(row as PedidoItemEnriquecido)._p?.nome_importador ?? '—'}</span>
    },
  },
  nome_fabricante: {
    editavel: true,
    campo: 'nome_fabricante',
    render: (row: PedidoItem) => <span>{row.nome_fabricante ?? '—'}</span>,
  },
  referencia_importador: {
    editavel: true,
    campo: 'referencia_importador',
    render: (row: PedidoItem) => <span>{row.referencia_importador ?? '—'}</span>,
  },
  referencia_exportador: {
    editavel: true,
    campo: 'referencia_exportador',
    render: (row: PedidoItem) => <span>{row.referencia_exportador ?? '—'}</span>,
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
    render: (row: PedidoItem) => <span>{row.incoterm ?? '—'}</span>,
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
    render: (row: PedidoItem) => <span>{row.referencia_fabricante ?? '—'}</span>,
  },
  cobertura_cambial: {
    editavel: true,
    campo: 'cobertura_cambial',
    render: (row: PedidoItem) => <span>{row.cobertura_cambial ?? 'com_cobertura'}</span>,
  },
  condicao_pagamento: {
    editavel: true,
    campo: 'condicao_pagamento',
    render: (row: PedidoItem) => <span>{row.condicao_pagamento ?? '—'}</span>,
  },
  data_emissao_pedido: {
    editavel: true,
    campo: 'data_emissao_pedido',
    render: (row: PedidoItem) => <span>{fmtData(row.data_emissao_pedido)}</span>,
  },
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
  // ── Valores ───────────────────────────────────────────────────────────────
  valor_total_pedido: {
    editavel: true,
    campo: 'valor_total_item',
    casasDecimais: getCasas('valor_total_pedido', 2),
    getValorEditar: (row: PedidoItem) => ({
      currency: row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD',
      amount: row.valor_total_item ?? 0,
    }),
    render: (row: PedidoItem) => {
      const casas = getCasas('valor_total_pedido', 2)
      const moeda = row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD'
      const num = Number(row.valor_total_item)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
          {row.valor_total_item != null && !isNaN(num) ? fmtQuantidade(num, casas) : '—'}
        </span>
      )
    },
  },
  valor_por_unidade_item: {
    editavel: true,
    campo: 'valor_por_unidade_item',
    casasDecimais: getCasas('valor_por_unidade_item', 2),
    getValorEditar: (row: PedidoItem) => ({
      currency: row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD',
      amount: row.valor_por_unidade_item ?? 0,
    }),
    render: (row: PedidoItem) => {
      const casas = getCasas('valor_por_unidade_item', 2)
      const moeda = row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD'
      const num = Number(row.valor_por_unidade_item)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
          {row.valor_por_unidade_item != null && !isNaN(num) ? fmtQuantidade(num, casas) : '—'}
        </span>
      )
    },
  },
  // ── CNPJ Importador / Exportador (nível item = espelha lógica do pai) ───
  cnpj_importador: {
    render: (row: PedidoItem) => {
      const pai = (row as PedidoItemEnriquecido)._p
      const tipoOp = pai?.tipo_operacao
      if (tipoOp !== 'importacao') {
        return (
          <TooltipGlobal descricao="Em operações de exportação, o CNPJ do Importador não se aplica — a contraparte estrangeira não possui CNPJ brasileiro.">
            <span style={{ color: 'var(--text-disabled, #666)', cursor: 'not-allowed' }}>—</span>
          </TooltipGlobal>
        )
      }
      const cnpjRaw = workspacesMap?.get(pai?.id_workspace ?? '')?.cnpj ?? ''
      const digits = cnpjRaw.replace(/\D/g, '')
      if (digits.length !== 14) {
        const href = urlEditarCnpjWorkspace(pai?.id_workspace ?? '', pai?.id)
        return (
          <TooltipGlobal descricao="CNPJ não cadastrado no Workspace. Clique para cadastrar">
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              Cadastrar CNPJ
            </span>
          </TooltipGlobal>
        )
      }
      const formatted = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`
      return <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', letterSpacing: '0.01em' }}>{formatted}</span>
    },
  },
  cnpj_exportador: {
    render: (row: PedidoItem) => {
      const pai = (row as PedidoItemEnriquecido)._p
      const tipoOp = pai?.tipo_operacao
      if (tipoOp !== 'exportacao') {
        return (
          <TooltipGlobal descricao="Em operações de importação, o CNPJ do Exportador não se aplica — a contraparte estrangeira não possui CNPJ brasileiro.">
            <span style={{ color: 'var(--text-disabled, #666)', cursor: 'not-allowed' }}>—</span>
          </TooltipGlobal>
        )
      }
      const cnpjRaw = workspacesMap?.get(pai?.id_workspace ?? '')?.cnpj ?? ''
      const digits = cnpjRaw.replace(/\D/g, '')
      if (digits.length !== 14) {
        const href = urlEditarCnpjWorkspace(pai?.id_workspace ?? '', pai?.id)
        return (
          <TooltipGlobal descricao="CNPJ não cadastrado no Workspace. Clique para cadastrar">
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              Cadastrar CNPJ
            </span>
          </TooltipGlobal>
        )
      }
      const formatted = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`
      return <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', letterSpacing: '0.01em' }}>{formatted}</span>
    },
  },
  // ── Moeda ──────────────────────────────────────────────────────────────────
  moeda_pedido: {
    editavel: true,
    campo: 'moeda_item',
    getValorEditar: (row: PedidoItem) => ({
      currency: row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD',
      amount: 0,
    }),
    render: (row: PedidoItem) => {
      const moeda = row.moeda_item
      if (!moeda) return <span>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
        </span>
      )
    },
  },
  // ── Descrição Item ───────────────────────────────────────────────────────
  descricao_item: {
    render: (row: PedidoItem) => (
      <span>{row.descricao_item ?? '—'}</span>
    ),
  },
  // ── Unidade Comercializada ───────────────────────────────────────────────
  unidade_comercializada_pedido: {
    editavel: true,
    campo: 'unidade_comercializada_item',
    getValorEditar: (row: PedidoItem) => ({
      unit: (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN',
      quantity: 0,
    }),
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item
      if (!unidade) return <span>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{unidade}</span>
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
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      const qtd = Math.max(0, (row.quantidade_inicial_pedido ?? 0) - (row.quantidade_pronta_total_item_pedido ?? 0))
      return (
        <TooltipGlobal
          titulo="Saldo do Pedido"
          descricao={<span>Calculado com base nos itens — não editável. <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>}
          interativo
        >
          <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums', color: qtd > 0 ? '#60a5fa' : undefined }}>
            {fmtQuantidade(qtd, getCasas('saldo_itens_do_pedido', 0))}
            <span className="gtv-celula-unidade-badge">{unidade}</span>
          </span>
        </TooltipGlobal>
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
          {fmtQuantidade(row.quantidade_transferida_pedido ?? 0, getCasas('quantidade_transferida_total', 0))}
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
  quantidade_cancelada_total_pedido: {
    editavel: false,
    tooltipBloqueado: 'Campo calculado — incrementado ao cancelar itens. Não pode ser editado diretamente.',
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      const qtd = row.quantidade_cancelada_pedido ?? 0
      return (
        <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums', color: qtd > 0 ? 'var(--color-error, #ef4444)' : undefined }}>
          {fmtQuantidade(qtd, getCasas('quantidade_cancelada_total_pedido', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  // ── Datas replicáveis pedido→item (44 colunas) ─────────────────────────────
  ...Object.fromEntries(([
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
  ] as const).map(key => [key, {
    campo: key,
    render: (row: PedidoItem) => {
      const v = (row as unknown as Record<string, unknown>)[key] as string | null | undefined
      return <span>{v ? fmtData(v) : '—'}</span>
    },
  }])),
  }
}

// ── Colunas para exportação ───────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Linha',                                    key: '_tipo_linha',                       largura: 10 },
  { header: 'Nº Pedido',                                key: 'numero_pedido',                    largura: 18 },
  { header: 'Nº do Item',                                 key: 'numero_item',                      largura: 20 },
  { header: 'Tipo de Operação',                          key: 'tipo_operacao',                    largura: 14 },
  { header: 'Status',                                    key: 'status',                           largura: 16 },
  { header: 'Nome do Exportador',                        key: 'nome_exportador',                  largura: 25 },
  { header: 'Nome do Fabricante',                        key: 'nome_fabricante',                  largura: 22 },
  { header: 'Referência Importador',                     key: 'referencia_importador',            largura: 20 },
  { header: 'Referência Exportador',                     key: 'referencia_exportador',            largura: 20 },
  { header: 'Referência do Fabricante',                  key: 'referencia_fabricante',            largura: 20 },
  { header: 'Número da Proforma',                        key: 'numero_proforma',                  largura: 16 },
  { header: 'Número da Invoice',                         key: 'numero_invoice',                   largura: 16 },
  { header: 'Incoterm',                                  key: 'incoterm',                         largura: 12 },
  { header: 'Valor Total do Pedido/Item',                 key: 'valor_total_pedido',               largura: 18 },
  { header: 'Qtd. Inicial do Pedido',                    key: 'quantidade_total_pedido',  largura: 14 },
  { header: 'Peso Líquido Total do Pedido',              key: 'peso_liquido_total_pedido',        largura: 18 },
  { header: 'Peso Bruto Total do Pedido',                key: 'peso_bruto_total_pedido',          largura: 18 },
  { header: 'Cubagem Total do Pedido',                   key: 'cubagem_total_pedido',             largura: 16 },
  { header: 'Cobertura Cambial do Pedido',               key: 'cobertura_cambial',               largura: 18 },
  { header: 'Condição de Pagamento do Pedido',           key: 'condicao_pagamento',       largura: 18 },
  { header: 'Data P.O',                                  key: 'data_emissao_pedido',              largura: 14 },
  { header: 'Data Prevista Pedido Pronto',               key: 'data_prevista_pedido_pronto',      largura: 14 },
  { header: 'Data Confirmada Pedido Pronto',             key: 'data_confirmada_pedido_pronto',    largura: 14 },
  { header: 'Data Meta Pedido Pronto',                   key: 'data_meta_pedido_pronto',          largura: 14 },
  { header: 'Data Prevista Inspeção do Pedido',          key: 'data_prevista_inspecao_pedido',    largura: 14 },
  { header: 'Data Confirmada Inspeção do Pedido',        key: 'data_confirmada_inspecao_pedido',  largura: 14 },
  { header: 'Data Meta Inspeção do Pedido',              key: 'data_meta_inspecao_pedido',        largura: 14 },
  { header: 'Data Prevista Coleta do Pedido',            key: 'data_prevista_coleta_pedido',      largura: 14 },
  { header: 'Data Confirmada Coleta do Pedido',          key: 'data_confirmada_coleta_pedido',    largura: 14 },
  { header: 'Data Meta Coleta do Pedido',                key: 'data_meta_coleta_pedido',          largura: 14 },
  { header: 'Data Consolidação do Pedido',               key: 'data_consolidacao_pedido',         largura: 14 },
  { header: 'Dt Transferência Qtd. do Pedido',           key: 'data_transferencia_saldo_pedido',  largura: 14 },
]

// ── Ações de linha (pai) — criadas dentro do componente para acesso ao navigate ─

// ── Estáveis: funções de identidade para props da tabela ─────────────────────
// CRÍTICO: devem ser module-level para evitar nova referência a cada render,
// o que quebraria a comparação de deps do itensSelecionados useMemo dentro de
// TabelaVirtualGlobal e causaria loop infinito via onSelecaoMudar → setPedidosSelecionados.
const pedidoItemId   = (p: Pedido): string    => p.id
const pedidoFilhoId  = (i: PedidoItem): string => i.id
const pedidoRenderConectorFilho = (i: PedidoItem) => (
  <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
    {i.sequencia_item ?? '—'}
  </span>
)

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

// ── BarraAcoesPedido — sub-componente memoizado da barra de ações ────────────
// Extraído para evitar que ~250 linhas de JSX sejam recriadas a cada render de
// ListaPedidos. React.memo faz shallow comparison das props; useMemo no pai
// garante que o nó JSX só é recriado quando os deps de estado mudam de fato.

interface BarraAcoesPedidoProps {
  novoDropdownRef: React.RefObject<HTMLDivElement>
  novoDropdownAberto: boolean
  novoSubmenu: 'pedido' | 'item' | null
  pedidosSelecionados: Pedido[]
  itensSelecionados: PedidoItem[]
  excluindoLote: boolean
  filtrosAtivos: FiltrosAtivosMap
  setNovoDropdownAberto: React.Dispatch<React.SetStateAction<boolean>>
  setNovoSubmenu: React.Dispatch<React.SetStateAction<'pedido' | 'item' | null>>
  setSmartImportAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalCockpitAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalNovoPedidoAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalNovoItemAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalTransferirAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalConsolidarAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalEdicaoMassaAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalGerarPdfAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalDuplicarAberto: React.Dispatch<React.SetStateAction<boolean>>
  onExcluirLote: () => void
  onNavigateToConfiguracoes: () => void
  handleLimparFiltro: (campo: string) => void
  handleLimparTodosFiltros: () => void
  busca: string
  onLimparBusca: () => void
  /** Abre o popover de filtro da coluna ao clicar no body do chip — UX 2026-05-13 */
  onFiltroColuna?: (key: string, anchor: HTMLElement) => void
  podeEditarLista: boolean
}

const BarraAcoesPedido = React.memo(function BarraAcoesPedido({
  novoDropdownRef,
  novoDropdownAberto,
  novoSubmenu,
  pedidosSelecionados,
  itensSelecionados,
  excluindoLote,
  filtrosAtivos,
  setNovoDropdownAberto,
  setNovoSubmenu,
  setSmartImportAberto,
  setModalCockpitAberto,
  setModalNovoPedidoAberto,
  setModalNovoItemAberto,
  setModalTransferirAberto,
  setModalConsolidarAberto,
  setModalEdicaoMassaAberto,
  setModalGerarPdfAberto,
  setModalDuplicarAberto,
  onExcluirLote,
  onNavigateToConfiguracoes,
  handleLimparFiltro,
  handleLimparTodosFiltros,
  busca,
  onLimparBusca,
  onFiltroColuna,
  podeEditarLista,
}: BarraAcoesPedidoProps) {
  const { t } = useTranslation()
  return (
    <>
      {/* ── Dropdown "Novo" — Pedido · Item · Coluna ── */}
      <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<Plus size={14} weight="bold" />}
          onClick={() => { setNovoDropdownAberto(prev => !prev); setNovoSubmenu(null) }}
        >
          {t('pedido.barra.novo')} <CaretDown size={12} weight="bold" style={{ marginLeft: 2, transition: 'transform 0.15s', transform: novoDropdownAberto ? 'rotate(180deg)' : 'none' }} />
        </BotaoGlobal>

        {novoDropdownAberto && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
            minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
          }}>

            {/* ── Novo Pedido ── */}
            <div
              style={{
                position: 'relative',
                ...(podeEditarLista ? {} : { opacity: 0.45, pointerEvents: 'none', cursor: 'not-allowed' }),
              }}
              title={podeEditarLista ? undefined : 'Sem permissão para criar pedidos'}
              aria-disabled={!podeEditarLista}
              onMouseEnter={() => podeEditarLista && setNovoSubmenu('pedido')}
              onMouseLeave={() => setNovoSubmenu(null)}
            >
              <button type="button" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.5rem', padding: '0.5rem 0.625rem', border: 'none', borderRadius: '0.5rem',
                background: novoSubmenu === 'pedido' ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(129,140,248,0.12)', flexShrink: 0 }}>
                    <Package size={13} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)' }} />
                  </span>
                  {t('pedido.barra.novo_pedido')}
                </span>
                <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>

              {novoSubmenu === 'pedido' && (
                <div style={{
                  position: 'absolute', left: '100%', top: 0, marginLeft: '4px', zIndex: 301,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                  minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
                }}>
                  {([
                    { icon: 'upload' as const, label: t('pedido.barra.importacao'), desc: t('pedido.barra.importacao_desc_pedido'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'api' as const, label: t('pedido.barra.api'), desc: t('pedido.barra.api_desc_pedido'), action: () => { setModalCockpitAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'sparkle' as const, label: t('pedido.barra.smart_read'), desc: t('pedido.barra.smart_read_desc_pedido'), badge: t('pedido.barra.em_breve'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'pencil' as const, label: t('pedido.barra.manual'), desc: t('pedido.barra.manual_desc_pedido'), action: () => { setModalNovoPedidoAberto(true); setNovoDropdownAberto(false) } },
                  ] as { icon: 'upload'|'api'|'sparkle'|'pencil', label: string, desc: string, badge?: string, action: () => void }[]).map(item => (
                    <button key={item.label} type="button" className="lp-dropdown-btn" onClick={item.action}>
                      <span style={{ color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                        {item.icon === 'pencil' && <PencilSimple size={16} weight="duotone" />}
                        {item.icon === 'sparkle' && <Sparkle size={16} weight="duotone" />}
                        {item.icon === 'upload' && <UploadSimple size={16} weight="duotone" />}
                        {item.icon === 'api' && <ArrowsLeftRight size={16} weight="duotone" />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                          {item.label}
                          {item.badge && <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.badge}</span>}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{item.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Novo Item ── */}
            <div
              style={{
                position: 'relative',
                ...(podeEditarLista ? {} : { opacity: 0.45, pointerEvents: 'none', cursor: 'not-allowed' }),
              }}
              title={podeEditarLista ? undefined : 'Sem permissão para criar itens'}
              aria-disabled={!podeEditarLista}
              onMouseEnter={() => podeEditarLista && setNovoSubmenu('item')}
              onMouseLeave={() => setNovoSubmenu(null)}
            >
              <button type="button" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.5rem', padding: '0.5rem 0.625rem', border: 'none', borderRadius: '0.5rem',
                background: novoSubmenu === 'item' ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(52,211,153,0.12)', flexShrink: 0 }}>
                    <Tag size={13} weight="duotone" style={{ color: '#34d399' }} />
                  </span>
                  {t('pedido.barra.novo_item')}
                </span>
                <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>

              {novoSubmenu === 'item' && (
                <div style={{
                  position: 'absolute', left: '100%', top: 0, marginLeft: '4px', zIndex: 301,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                  minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
                }}>
                  {([
                    { icon: 'upload' as const, label: t('pedido.barra.importacao'), desc: t('pedido.barra.importacao_desc_item'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'api' as const, label: t('pedido.barra.api'), desc: t('pedido.barra.api_desc_item'), action: () => { setModalCockpitAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'sparkle' as const, label: t('pedido.barra.smart_read'), desc: t('pedido.barra.smart_read_desc_item'), badge: t('pedido.barra.em_breve'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'pencil' as const, label: t('pedido.barra.manual'), desc: t('pedido.barra.manual_desc_item'), action: () => { setModalNovoItemAberto(true); setNovoDropdownAberto(false) } },
                  ] as { icon: 'upload'|'api'|'sparkle'|'pencil', label: string, desc: string, badge?: string, action: () => void }[]).map(item => (
                    <button key={item.label} type="button" className="lp-dropdown-btn" onClick={item.action}>
                      <span style={{ color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                        {item.icon === 'pencil' && <PencilSimple size={16} weight="duotone" />}
                        {item.icon === 'sparkle' && <Sparkle size={16} weight="duotone" />}
                        {item.icon === 'upload' && <UploadSimple size={16} weight="duotone" />}
                        {item.icon === 'api' && <ArrowsLeftRight size={16} weight="duotone" />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                          {item.label}
                          {item.badge && <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.badge}</span>}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{item.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Nova Coluna ── */}
            <button type="button" className="lp-dropdown-item-btn" onClick={onNavigateToConfiguracoes}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(99,102,241,0.12)', flexShrink: 0 }}>
                  <Columns size={13} weight="duotone" style={{ color: '#818cf8' }} />
                </span>
                {t('pedido.barra.nova_coluna')}
              </span>
              <ArrowRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Ações contextuais — sempre visíveis, desativadas sem seleção ── */}
      <>
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 2px', flexShrink: 0 }} />

        {/* Transferir */}
        <TooltipGlobal
          titulo={
            pedidosSelecionados.length > 0 ? `${t('pedido.barra.transferir')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` :
            itensSelecionados.length > 0   ? `${t('pedido.barra.transferir')} · ${itensSelecionados.length} item${itensSelecionados.length !== 1 ? 's' : ''}` :
            t('pedido.barra.transferir')
          }
          descricao={t('pedido.barra.transferir_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<ArrowRight size={14} weight="duotone" />}
            disabled={!podeEditarLista || (pedidosSelecionados.length === 0 && itensSelecionados.length === 0)}
            onClick={() => { setModalTransferirAberto(true) }}
          >
            {pedidosSelecionados.length > 0 ? `${t('pedido.barra.transferir')} (${pedidosSelecionados.length})` :
             itensSelecionados.length > 0   ? `${t('pedido.barra.transferir')} (${itensSelecionados.length})` :
             t('pedido.barra.transferir')}
          </BotaoGlobal>
        </TooltipGlobal>

        {/* Consolidar */}
        <TooltipGlobal
          titulo={pedidosSelecionados.length >= 2 ? `${t('pedido.barra.consolidar')} · ${pedidosSelecionados.length} pedidos` : t('pedido.barra.consolidar')}
          descricao={pedidosSelecionados.length < 2 ? t('pedido.barra.consolidar_min') : t('pedido.barra.consolidar_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<CheckSquare size={14} weight="duotone" />}
            disabled={!podeEditarLista || pedidosSelecionados.length < 2}
            onClick={() => { setModalConsolidarAberto(true) }}
          />
        </TooltipGlobal>

        {/* Editar em Massa */}
        <TooltipGlobal
          titulo={
            pedidosSelecionados.length > 0
              ? `${t('pedido.barra.editar_massa')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}`
              : itensSelecionados.length > 0
                ? `${t('pedido.barra.editar_massa')} · ${itensSelecionados.length} item${itensSelecionados.length !== 1 ? 's' : ''}`
                : t('pedido.barra.editar_massa')
          }
          descricao={t('pedido.barra.editar_massa_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<PencilLine size={14} weight="duotone" />}
            disabled={!podeEditarLista || (pedidosSelecionados.length === 0 && itensSelecionados.length === 0)}
            onClick={() => { setModalEdicaoMassaAberto(true) }}
          />
        </TooltipGlobal>

        {/* Gerar Documento */}
        <TooltipGlobal
          titulo={pedidosSelecionados.length > 0 ? `${t('pedido.barra.gerar_documento')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` : t('pedido.barra.gerar_documento')}
          descricao={t('pedido.barra.gerar_documento_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<FilePdf size={14} weight="duotone" />}
            disabled={pedidosSelecionados.length === 0}
            onClick={() => setModalGerarPdfAberto(true)}
          />
        </TooltipGlobal>

        {/* Duplicar — aceita pedido E/OU item (modal único trata mistura) */}
        <TooltipGlobal
          titulo={(() => {
            // Plural de "item" em PT é "itens" (irregular). NUNCA usar `item + 'ns'` aqui:
            // gera "itemns" (bug do typo plural reportado 2026-05-11).
            const labelItem = itensSelecionados.length === 1 ? 'item' : 'itens'
            const labelPedido = pedidosSelecionados.length === 1 ? 'pedido' : 'pedidos'
            if (pedidosSelecionados.length > 0 && itensSelecionados.length > 0) {
              return `${t('pedido.barra.duplicar')} · ${pedidosSelecionados.length} ${labelPedido} + ${itensSelecionados.length} ${labelItem}`
            }
            if (pedidosSelecionados.length > 0) {
              return `${t('pedido.barra.duplicar')} · ${pedidosSelecionados.length} ${labelPedido}`
            }
            if (itensSelecionados.length > 0) {
              return `${t('pedido.barra.duplicar')} · ${itensSelecionados.length} ${labelItem}`
            }
            return t('pedido.barra.duplicar')
          })()}
          descricao={t('pedido.barra.duplicar_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<CopySimple size={14} weight="duotone" />}
            aria-label={t('pedido.barra.duplicar')}
            disabled={!podeEditarLista || (pedidosSelecionados.length === 0 && itensSelecionados.length === 0)}
            onClick={() => setModalDuplicarAberto(true)}
          />
        </TooltipGlobal>

        {/* Excluir */}
        <TooltipGlobal
          titulo={
            pedidosSelecionados.length > 0 && itensSelecionados.length > 0
              ? `${t('pedido.barra.excluir')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''} e ${itensSelecionados.length} item${itensSelecionados.length !== 1 ? 's' : ''}`
              : pedidosSelecionados.length > 0
                ? `${t('pedido.barra.excluir')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}`
                : itensSelecionados.length > 0
                  ? `${t('pedido.barra.excluir')} · ${itensSelecionados.length} item${itensSelecionados.length !== 1 ? 's' : ''}`
                  : t('pedido.barra.excluir')
          }
          descricao={t('pedido.barra.excluir_desc')}
        >
          <BotaoGlobal
            variante="perigo"
            tamanho="pequeno"
            icone={<Trash size={14} weight="duotone" />}
            disabled={!podeEditarLista || (pedidosSelecionados.length === 0 && itensSelecionados.length === 0) || excluindoLote}
            onClick={onExcluirLote}
          />
        </TooltipGlobal>
      </>

      {/* ── Chips de filtros ativos (dentro da toolbar) ──
       * Refactor D9 (2026-05-13): JSX inline substituído por <FiltroChips> do
       * nucleo-global. O chip de BUSCA fica como `prefixo` (composição), porque
       * busca é responsabilidade do produto Pedido — não do framework de chips. */}
      {(Object.keys(filtrosAtivos).length > 0 || busca) && (
        <FiltroChips
          colunas={COLUNAS_PAI}
          filtrosAtivos={filtrosAtivos}
          onLimparFiltro={handleLimparFiltro}
          onLimparTodos={handleLimparTodosFiltros}
          onEditarFiltro={onFiltroColuna}
          thresholdConsolidar={2}
          prefixo={busca ? (
            <span className="fc-chip">
              <span className="fc-chip-label">{t('pedido.barra.chip_busca', { defaultValue: 'Busca' })}:</span>
              <span className="fc-chip-valor">{busca}</span>
              <button
                className="fc-chip-remove"
                onClick={onLimparBusca}
                aria-label={t('pedido.barra.remover_busca', { defaultValue: 'Remover busca' })}
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ) : null}
        />
      )}
    </>
  )
})

// ── Componente ────────────────────────────────────────────────────────────────

export default function Pedidos() {
  const { t, i18n } = useTranslation()
  // Gating granular `pedido:lista:editar` (decisão dono + Líder + Coordenador 2026-05-13).
  // `podeEditar` é ESTRITO durante load (bypass para Master/SAdmin/Admin; false
  // durante carregando; check no banco quando dados chegarem). Evita flash de
  // botões habilitados que disparariam 403 ao salvar.
  const { podeEditar } = usePermissoesPedido()
  const podeEditarLista = podeEditar('lista')
  // Unidades de medida — SSOT cadastros.unidade via hook (substitui hardcode anterior).
  const { unidadesPeso, unidadesCubagem } = useUnidadesPedido()
  // Incoterms — SSOT cadastros.incoterm via hook (substitui hardcode em 2026-05-13).
  const { incotermsOpcoes } = useIncotermsPedido()
  // Workspaces disponíveis ao usuário — carregados de /api/v1/hub/init.
  // Usado em (i) FiltroMultiWorkspace e (ii) coluna "Workspace" da Lista.
  // Carregamento elevado aqui para evitar fetch duplicado.
  const [workspacesDisponiveis, setWorkspacesDisponiveis] = useState<WorkspaceDisponivel[]>([])
  useEffect(() => {
    let cancelado = false
    workspacesDisponiveisApi
      .listar()
      .then((lista) => { if (!cancelado) setWorkspacesDisponiveis(lista) })
      .catch((err) => {
        if (cancelado) return
        // eslint-disable-next-line no-console
        console.warn('[Pedidos] falha ao carregar workspaces:', err)
      })
    return () => { cancelado = true }
  }, [])
  const workspacesMap = useMemo(() => {
    const m = new Map<string, { nome: string; cnpj?: string | null }>()
    for (const w of workspacesDisponiveis) {
      m.set(w.id_workspace, { nome: w.nome_workspace, cnpj: w.cnpj_workspace ?? null })
    }
    return m
  }, [workspacesDisponiveis])

  const opcoesUnidadesColunas = useMemo<OpcoesUnidadesColunas>(
    () => ({ unidadesPeso, unidadesCubagem, incotermsOpcoes, workspacesMap }),
    [unidadesPeso, unidadesCubagem, incotermsOpcoes, workspacesMap],
  )
  // Colunas pai reativas — rebuild quando o idioma muda OU quando o catálogo
  // de unidades do Cadastros termina de carregar (primeiro render: vazio).
  // ── Colunas do Usuário ────────────────────────────────────────────────────────
  const [colunasUsuario, setColunasUsuario] = useState<ColunaUsuario[]>([])
  const [temExpandido, setTemExpandido] = useState(false)

  // IMPORTANTE: a função `t` do react-i18next é referencialmente estável mesmo
  // após troca de idioma, então depender só de `[t]` NUNCA invalida o memo.
  // i18n.language muda de string a cada troca ("pt" → "en"), forçando o rebuild.
  const colunasPai = useMemo(
    () => buildColunasPai(t, opcoesUnidadesColunas),
    [t, i18n.language, opcoesUnidadesColunas],
  )
  const mapaColunasFilho = useMemo(() => {
    const base = buildMapaColunasFilho(opcoesUnidadesColunas)
    const custom: Record<string, GTMapaColunasFilho<PedidoItem>> = {}
    for (const col of colunasUsuario) {
      const escopo = col.escopo || 'ambos'
      if (escopo === 'pedido') {
        custom[col.chave] = {
          editavel: false,
          tooltipBloqueado: t('pedido.config.colunas.personalizadas.tooltip_escopo_pedido', 'Esta coluna é exclusiva do pedido. Para editar, clique na linha do pedido.'),
          render: () => <span style={{ opacity: 0.4 }}>—</span>,
        }
        continue
      }
      custom[col.chave] = {
        editavel: col.tipo !== 'formula' && col.tipo !== 'checkbox',
        opcoes: (col.tipo === 'select' || col.tipo === 'tipo_documento') && col.opcoes?.length
          ? col.opcoes.map(o => ({ valor: o, label: o }))
          : undefined,
        render: (row: PedidoItem) => {
          const valores = (row as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined
          const valor = valores?.[col.id] ?? '—'
          if (col.tipo === 'checkbox') return <span>{valor === 'true' ? '✓' : valor === 'false' ? '✗' : '—'}</span>
          if ((col.tipo === 'numero' || col.tipo === 'percentual') && valor !== '—') {
            const num = Number(valor)
            if (!isNaN(num)) {
              const sufixo = col.tipo === 'percentual' ? '%' : ''
              return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtQuantidade(num, getCasas(col.id, 2))}{sufixo}</span>
            }
          }
          if (col.tipo === 'data' && valor !== '—') return <span>{fmtData(valor)}</span>
          return <span>{typeof valor === 'string' && valor.length > 150 ? valor.slice(0, 150) + '…' : valor}</span>
        },
        getValorEditar: (row: PedidoItem) => {
          const valores = (row as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined
          const raw = valores?.[col.id]
          if (raw == null) return col.tipo === 'numero' || col.tipo === 'percentual' ? 0 : ''
          if (col.tipo === 'numero' || col.tipo === 'percentual') return Number(raw) || 0
          return raw
        },
      }
    }
    return { ...base, ...custom }
  }, [opcoesUnidadesColunas, colunasUsuario])
  const { visiveis: cardsVisiveis } = useCardPreferences()
  const navigate = useNavigate()
  const location = useLocation()
  const addNotification = useShellStore(s => s.addNotification)
  const idOrganizacao = useShellStore(s => s.currentUser.idOrganizacao ?? (import.meta.env.VITE_DEV_ID_ORGANIZACAO as string | undefined) ?? '')

  // ── Filtro multi-workspace ──────────────────────────────────────────────────
  // Default = workspace ativo (lido do sessionStorage 'gravity_company_id').
  // Lista de workspaces e workspacesMap já carregados acima.
  const workspaceAtivo = useMemo(() => {
    if (typeof sessionStorage === 'undefined') return ''
    return sessionStorage.getItem('gravity_company_id') ?? ''
  }, [])
  const [workspacesSelecionados, setWorkspacesSelecionados] = useState<string[]>(() =>
    workspaceAtivo ? [workspaceAtivo] : [],
  )

  // ── Filtro multi-workspace — sincronização filtro-da-coluna → backend ──────
  //
  // EXCEÇÃO AO PADRÃO. Os demais filtros de coluna são CLIENT-SIDE: aplicam
  // sobre o array `pedidos` já carregado. Para `id_workspace` isso não basta,
  // pois os pedidos de outros workspaces ainda não foram trazidos do backend.
  //
  // Fluxo:
  //   1. Usuário marca/desmarca workspaces no popover do header da coluna
  //   2. filtrosAtivos['id_workspace'] = { tipo: 'enum', valor: Set<nome> }
  //   3. Este useEffect converte NOMES → IDs (via workspacesMap)
  //   4. Atualiza workspacesSelecionados
  //   5. Outro useEffect (já existente) detecta a mudança e re-fetch o backend
  //      passando ?ids_workspaces=...
  //
  // Quando o filtro é limpo (filtrosAtivos['id_workspace'] === undefined),
  // volta ao default (somente workspaceAtivo). Isso evita estado vazio que
  // dispararia "ver tudo" indesejado.
  // (definido abaixo, após filtrosAtivos ser declarado)

  // ── GABI quota badge ────────────────────────────────────────────────────────
  // useGabiQuota faz fetch direto sem passar pelo request() do api.ts —
  // precisamos injetar Authorization: Bearer aqui (mesmo padrao da Pedido SDK
  // resolverOrganizacao que exige JWT). Sem isso, /pedidos/gabi/quota volta 401.
  const { getToken: getClerkToken } = useAuth()
  const [gabiAuthToken, setGabiAuthToken] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void getClerkToken().then(t => { if (!cancelled) setGabiAuthToken(t) })
    return () => { cancelled = true }
  }, [getClerkToken])

  const gabiQuotaFetchOptions = useMemo((): RequestInit => {
    const ctx = getApiContext()
    return {
      headers: {
        ...(gabiAuthToken ? { Authorization: `Bearer ${gabiAuthToken}` } : {}),
        'x-id-organizacao': ctx.idOrganizacao,
        'x-id-usuario': ctx.userId,
        'x-internal-key': (import.meta as any).env?.VITE_INTERNAL_SERVICE_KEY || '',
      },
    }
  }, [gabiAuthToken])
  // Conditional fetching: só dispara quando idOrganizacao já está hidratado do store.
  // Evita requisição prematura no milissegundo 0 do render (que resulta em 400).
  const { quota: gabiQuota } = useGabiQuota(idOrganizacao ? '/api/v1/pedidos/gabi/quota' : null, gabiQuotaFetchOptions)

  // ── Taxas PTAX (para conversão BRL) — cache singleton por sessão ────────────
  const taxasVenda = useTaxasCambio()

  // ── Rastreamento de comportamento (Gabi Insights Fase 2) ─────────────────────
  const { trackFilter } = useTrackBehavior()

  // ── Estado de dados ──────────────────────────────────────────────────────────
  const [pedidos, setPedidos]               = useState<Pedido[]>([])
  const [carregando, setCarregando]         = useState(true)
  // Erro do ultimo carregamento — usado pelo empty state para diferenciar
  // "lista vazia" de "falhou ao carregar" (Mand. 08, sem fallback silencioso).
  const [erroCarga, setErroCarga]           = useState<string | null>(null)
  // Total global de matches no find-in-page (calculado via pré-scan de todos os registros)
  const [findTotalExterno, setFindTotalExterno] = useState<number | null>(null)
  const [paginaAtual, setPaginaAtual]       = useState(1)
  const [total, setTotal]                   = useState(0)
  const [totalItensBanco, setTotalItensBanco] = useState(0)
  const ITENS_POR_PAGINA: 25 | 50 | 100 | 200 = (() => {
    try {
      const raw = localStorage.getItem('pedido:tabela_config')
      if (raw) {
        const parsed = JSON.parse(raw) as { linhasPorPagina?: number }
        const v = parsed.linhasPorPagina
        if (v === 25 || v === 50 || v === 100 || v === 200) return v
      }
    } catch { /* ignore */ }
    return 100
  })()

  // ── Seleção de pedidos/itens via selecaoStore (Zustand) ──────────────────────
  const { setPedidosSelecionados, setItensSelecionados } = useSelecaoStore()
  const pedidosSelecionados = usePedidosSelecionados()
  const itensSelecionados = useItensSelecionados()
  const hasMixedTipos = useHasMixedTipos()
  useLinkContextualSync()

  // ── Estado de exclusão de itens ───────────────────────────────────────────────
  const [excluindoItens, setExcluindoItens] = useState(false)

  // ── Estado do modal Transferir ───────────────────────────────────────────────
  const [modalTransferir, setModalTransferir] = useState<{ item: PedidoItem; pedidoId: string } | null>(null)
  const [qtdTransferir, setQtdTransferir]     = useState('')

  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [abaAtiva, setAbaAtiva]             = useState('todos')
  const [abas, setAbas]                     = useState<GTAbaTipo[]>(() =>
    ABAS_STATUS_VALORES.map(v => ({ valor: v, label: t(`pedido.status.${v}`) }))
  )
  const [preferencias, setPreferencias]     = useState<GTPreferencias | undefined>(undefined)
  const [sortCampo, setSortCampo]           = useState('data_emissao_pedido')
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>('desc')
  const [busca, setBusca]                   = useState('')
  const [erroLote, setErroLote]             = useState<string | null>(null)
  const [modalConsolidarAberto, setModalConsolidarAberto] = useState(false)
  const [modalTransferirAberto, setModalTransferirAberto] = useState(false)
  const [modalEdicaoMassaAberto, setModalEdicaoMassaAberto] = useState(false)
  const [modalDuplicarAberto, setModalDuplicarAberto] = useState(false)
  const [modalGerarPdfAberto, setModalGerarPdfAberto] = useState(false)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [excluindoLote, setExcluindoLote] = useState(false)
  const [resetFilhos, setResetFilhos] = useState(0)

  // ── Fórmula do Saldo do Pedido (fonte: API /configuracoes/saldo-formula) ────
  // Começa com o padrão (render imediato) e atualiza assincronamente ao montar
  // e ao ganhar foco — a fonte de verdade é o backend, então mudanças feitas
  // em outra aba/device são capturadas no próximo focus.
  const [saldoFormulaAST, setSaldoFormulaAST] = useState(parsearPadraoSeguro)

  useEffect(() => {
    let cancelado = false
    const carregar = async () => {
      try {
        const resp = await saldoFormulaApi.obter()
        if (cancelado) return
        const ast = parsearFormula(resp.data.formula_expressao)
        setSaldoFormulaAST(ast)
      } catch {
        /* mantém AST atual */
      }
    }
    carregar()
    // revalidateOnFocus: false — não refaz esta requisição ao voltar o foco da aba.
    // Evita concorrência com refresh de token do Clerk após idle timeout.
    return () => { cancelado = true }
  }, [])

  // ── Status customizados (sincroniza com localStorage ao ganhar foco) ─────────
  const [statusOpts, setStatusOpts] = useState<{ valor: string; label: string }[]>(() => {
    const abas = lerAbasDoLocalStorage(t)
    return abas
      ? abas.filter(a => a.valor !== 'todos').map(a => ({ valor: a.valor, label: a.label }))
      : [
          { valor: 'rascunho',      label: 'Rascunho'    },
          { valor: 'aberto',        label: 'Aberto'      },
          { valor: 'em_andamento',  label: 'Em Andamento'},
          { valor: 'aprovado',      label: 'Aprovado'    },
          { valor: 'transferencia', label: 'Transferido' },
          { valor: 'consolidado',   label: 'Consolidado' },
          { valor: 'cancelado',     label: 'Cancelado'   },
        ]
  })

  useEffect(() => {
    const sync = () => {
      const abas = lerAbasDoLocalStorage(t)
      if (abas) setStatusOpts(abas.filter(a => a.valor !== 'todos').map(a => ({ valor: a.valor, label: a.label })))
    }
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  // colunasUsuario e temExpandido movidos para antes do useMemo que os referencia

  // Colunas pai estáticas + colunas customizadas do usuário (escopo pedido ou ambos)
  // O render da coluna status é sobreposto aqui para ter acesso ao setPedidos
  const colunasComUsuario = useMemo<GTColuna<Pedido>[]>(() => {
    const custom = colunasUsuario
      .filter(c => { const e = c.escopo || 'ambos'; return e === 'pedido' || e === 'ambos' })
      .map(mapColunaUsuarioParaGTColuna)

    const STATUS_OPTS = statusOpts

    const colunasBase = colunasPai.map(col => {
      if (col.key === 'status') {
        return {
          ...col,
          editavel: true,
          opcoes: STATUS_OPTS,
          render: (_val: unknown, row: Pedido) => {
            const cor = getStatusCor(row.status)
            return (
              <StatusBadgeGlobal
                valor={getStatusLabel(row.status)}
                genero="masculino"
                style={{ color: cor, background: `${cor}1e`, border: `1px solid ${cor}33`, cursor: 'pointer' }}
              />
            )
          },
        }
      }

      const COLUNAS_DINAMICAS_PEDIDO_ITEM: Record<string, string> = {
        valor_total_pedido:                   'Valor Total do Pedido/Item',
        quantidade_total_pedido:      'Qtd. Inicial do Pedido/Item',
        quantidade_pronta_itens_pedido_total: 'Qtd. Pronta do Pedido/Item',
        saldo_itens_do_pedido:                'Saldo do Pedido/Item',
        quantidade_transferida_total:         'Qtd. Transferida do Pedido/Item',
        quantidade_cancelada_total_pedido:    'Qtd. Cancelada do Pedido/Item',
        peso_liquido_total_pedido:            'Peso Líquido Total do Pedido/Item',
        peso_bruto_total_pedido:              'Peso Bruto Total do Pedido/Item',
        cubagem_total_pedido:                 'Cubagem Total do Pedido/Item',
      }
      if (temExpandido && col.key in COLUNAS_DINAMICAS_PEDIDO_ITEM) {
        const label = COLUNAS_DINAMICAS_PEDIDO_ITEM[col.key]
        return { ...col, label, tooltipTitulo: label }
      }

      if (col.key === 'saldo_itens_do_pedido') {
        const tooltipSaldo = (conteudo: React.ReactNode) => (
          <TooltipGlobal
            titulo="Saldo do Pedido"
            descricao={<span>Calculado com base nos itens — não editável. <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>}
            interativo
          >
            <span style={{ display: 'contents' }}>{conteudo}</span>
          </TooltipGlobal>
        )
        return {
          ...col,
          render: (_val: unknown, row: Pedido) => {
            try {
              const contexto = buildFormulaContexto(row)
              const { valor: num, temNulo } = avaliarFormula(saldoFormulaAST, contexto)
              const qtd = temNulo || num == null ? null : Math.max(0, num)
              return tooltipSaldo(
                <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#60a5fa' : undefined }}>
                  {qtd != null ? fmtQuantidade(qtd, getCasas('saldo_itens_do_pedido', 0)) : '—'}
                </span>
              )
            } catch {
              const total = row.quantidade_total_pedido ?? null
              const transf = row.quantidade_transferida_total ?? null
              const cancel = row.quantidade_cancelada_total_pedido ?? 0
              const qtd = total != null && transf != null ? Math.max(0, total - transf - cancel) : null
              return tooltipSaldo(
                <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#60a5fa' : undefined }}>
                  {qtd != null ? fmtQuantidade(qtd, getCasas('saldo_itens_do_pedido', 0)) : '—'}
                </span>
              )
            }
          },
        }
      }

      return col
    })

    return [...colunasBase, ...custom]
  }, [colunasPai, colunasUsuario, statusOpts, saldoFormulaAST, temExpandido])

  // Campos editáveis em linhas filho — estáticos + chaves das colunas customizadas editáveis
  const camposEditaveisFilhosComCustom = useMemo(() => {
    const customKeys = colunasUsuario
      .filter(c => c.tipo !== 'formula' && c.tipo !== 'checkbox' && c.tipo !== 'anexo'
                 && ((c.escopo || 'ambos') === 'item' || (c.escopo || 'ambos') === 'ambos'))
      .map(c => c.chave)
    return [...CAMPOS_EDITAVEIS_PAI, ...customKeys]
  }, [colunasUsuario])

  // ── Estado de filtros de coluna ───────────────────────────────────────────────
  const [filtrosAtivos, setFiltrosAtivos]   = useState<FiltrosAtivosMap>({})
  const filtrosAtivosKeys = useMemo(() => new Set(Object.keys(filtrosAtivos)), [filtrosAtivos])
  const [popoverAberto, setPopoverAberto]   = useState<string | null>(null)
  const popoverAnchorRefs                   = useRef<Record<string, React.MutableRefObject<HTMLElement | null>>>({})

  // ── Inicialização (UMA VEZ): popover abre com workspace ativo marcado ─────
  // No mount, populamos `filtrosAtivos['id_workspace']` com o workspace ativo
  // para que o popover já apareça refletindo a realidade (lista filtrada por
  // ele via header). Roda UMA vez (initializedFilterRef) — depois o usuário
  // tem controle TOTAL: pode desmarcar tudo e ver lista vazia (intencional).
  const initializedFilterRef = useRef(false)
  useEffect(() => {
    if (initializedFilterRef.current) return
    if (workspacesMap.size === 0) return                 // mapa ainda carregando
    if (!workspaceAtivo) return                          // sem ativo, nada a fazer
    if (filtrosAtivos['id_workspace']) return            // filtro já presente (ex: deep-link)
    const w = workspacesMap.get(workspaceAtivo)
    if (!w) return                                       // ativo não está em workspacesMap (?)
    initializedFilterRef.current = true
    setFiltrosAtivos(prev => ({
      ...prev,
      id_workspace: { tipo: 'enum', valor: new Set([w.nome]) },
    }))
  }, [workspacesMap, workspaceAtivo, filtrosAtivos])

  // ── Sincronia: filtrosAtivos['id_workspace'] → workspacesSelecionados ─────
  //
  // Casos:
  //   - Mount inicial, antes da inicialização: filtro undefined →
  //     initializedFilterRef.current = false → não toca (espera init).
  //   - Após init, usuário clicou "× Limpar filtro" ou desmarcou último item:
  //     filtro undefined → workspacesSelecionados = [] → lista vazia (intencional).
  //   - Filtro presente com Set não vazio: resolve nomes em ids.
  //   - Filtro presente com Set vazio: workspacesSelecionados = [] → lista vazia.
  useEffect(() => {
    const filtro = filtrosAtivos['id_workspace']
    if (!filtro || filtro.tipo !== 'enum') {
      if (!initializedFilterRef.current) return  // mount — aguarda init
      setWorkspacesSelecionados(prev => (prev.length === 0 ? prev : []))
      return
    }
    const nomes = filtro.valor
    // Converte nomes em ids via workspacesMap
    const idsSelecionados: string[] = []
    for (const [id, w] of workspacesMap.entries()) {
      if (nomes.has(w.nome)) idsSelecionados.push(id)
    }
    setWorkspacesSelecionados(prev =>
      prev.length === idsSelecionados.length && prev.every((v, i) => v === idsSelecionados[i]) ? prev : idsSelecionados,
    )
  }, [filtrosAtivos, workspacesMap])

  function getAnchorRef(campo: string): React.MutableRefObject<HTMLElement | null> {
    if (!popoverAnchorRefs.current[campo]) {
      popoverAnchorRefs.current[campo] = React.createRef<HTMLElement>() as React.MutableRefObject<HTMLElement | null>
    }
    return popoverAnchorRefs.current[campo]
  }

  // ── Pedidos filtrados (client-side) ───────────────────────────────────────────
  const pedidosFiltrados = useMemo<Pedido[]>(() => {
    let resultado = pedidos
    // Filtro por aba de status (client-side para dev/mock; produção filtra no servidor)
    if (abaAtiva !== 'todos') {
      resultado = resultado.filter(p => p.status === abaAtiva)
    }
    // Busca global client-side (em dev o mock ignora o param de busca do servidor)
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase()
      resultado = resultado.filter(p =>
        [p.numero_pedido, p.nome_exportador, p.nome_fabricante,
         p.referencia_importador, p.referencia_exportador,
         p.numero_proforma, p.numero_invoice]
          .some(v => v != null && String(v).toLowerCase().includes(termo))
      )
    }
    if (Object.keys(filtrosAtivos).length === 0) return resultado
    return resultado.filter(p => {
      const row = p as Record<string, unknown>
      for (const [campo, filtro] of Object.entries(filtrosAtivos)) {
        // Exceção: id_workspace é aplicado server-side via workspacesSelecionados
        // (sincronizado por useEffect adiante). Não filtra client-side.
        if (campo === 'id_workspace') continue
        const val = row[campo]
        if (filtro.tipo === 'texto') {
          if (!String(val ?? '').toLowerCase().includes(filtro.valor.toLowerCase())) return false
        } else if (filtro.tipo === 'enum') {
          const strVal = String(val ?? '')
          const inverso = LABELS_FILTRO_INVERSO[campo]
          const rawSet = inverso
            ? new Set(Array.from(filtro.valor).map(l => inverso[l] ?? l))
            : filtro.valor
          if (rawSet.size > 0 && !rawSet.has(strVal)) return false
        } else if (filtro.tipo === 'numero') {
          const n = Number(val)
          if (filtro.valor.min != null && n < filtro.valor.min) return false
          if (filtro.valor.max != null && n > filtro.valor.max) return false
        }
      }
      return true
    })
  }, [pedidos, filtrosAtivos, abaAtiva, busca])

  // ── Handlers de filtro ────────────────────────────────────────────────────────
  const handleAplicarFiltro = useCallback((campo: string, filtro: FiltroAtivo) => {
    setFiltrosAtivos(prev => ({ ...prev, [campo]: filtro }))
    const valor = filtro.tipo === 'texto'
      ? filtro.valor
      : filtro.tipo === 'enum'
        ? [...filtro.valor].join(',')
        : `${filtro.valor.min ?? ''}-${filtro.valor.max ?? ''}`
    trackFilter(campo, valor)
  }, [trackFilter])

  const handleLimparFiltro = useCallback((campo: string) => {
    setFiltrosAtivos(prev => {
      const novo = { ...prev }
      delete novo[campo]
      return novo
    })
  }, [])

  const handleLimparTodosFiltros = useCallback(() => {
    setFiltrosAtivos({})
    handleBuscar('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Estado dos modais de criação ─────────────────────────────────────────────
  const [drawerAberto, setDrawerAberto]           = useState(false)
  const [pedidoEditandoId, setPedidoEditandoId]   = useState<string | undefined>(undefined)
  const [drawerInitialTab, setDrawerInitialTab]   = useState<'dados' | 'itens' | 'transferencias'>('dados')
  const [drawerFocusField, setDrawerFocusField]   = useState<string | undefined>(undefined)

  // ── Ref imperativo da tabela + edição inline pendente (navegação via Kanban) ─
  const tabelaRef = useRef<GTVirtualHandle | null>(null)
  const pendingInlineEditRef = useRef<{ id: string; campo: string } | null>(null)

  // Navegação via Kanban:
  //   { openPedidoId, editCampo, numeroPedido } → edição inline na célula
  //   { numeroPedido }                          → apenas filtrar na lista (Abrir pedido completo)
  useEffect(() => {
    const st = location.state as {
      openPedidoId?: string
      editCampo?: string
      numeroPedido?: string
    } | null
    if (!st?.openPedidoId && !st?.numeroPedido) return
    window.history.replaceState({}, '')

    if (st.openPedidoId && st.editCampo) {
      // Fluxo inline: filtrar + abrir célula para edição
      pendingInlineEditRef.current = { id: st.openPedidoId, campo: st.editCampo }
      if (st.numeroPedido) {
        handleBuscar(st.numeroPedido)
      }
    } else if (st.numeroPedido) {
      // Fluxo "Abrir pedido completo": apenas filtrar na lista
      handleBuscar(st.numeroPedido)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  // Dispara edição inline assim que o pedido estiver no array e o carregamento terminar
  useEffect(() => {
    const pending = pendingInlineEditRef.current
    if (!pending || carregando) return
    const pedido = pedidos.find(p => (p as Record<string, unknown>).id === pending.id)
    if (!pedido) return
    pendingInlineEditRef.current = null
    const valorAtual = (pedido as Record<string, unknown>)[pending.campo] ?? null
    // Aguarda a tabela renderizar a linha antes de disparar a edição
    setTimeout(() => {
      tabelaRef.current?.iniciarEdicao(pending.id, pending.campo, valorAtual)
    }, 200)
  }, [pedidos, carregando])
  const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false)
  const [modalNovoItemAberto, setModalNovoItemAberto]     = useState(false)
  const [smartImportAberto, setSmartImportAberto] = useState(false)
  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)
  const [novoSubmenu, setNovoSubmenu]             = useState<'pedido' | 'item' | null>(null)
  const [modalCockpitAberto, setModalCockpitAberto] = useState(false)
  const novoDropdownRef = useRef<HTMLDivElement>(null)

  // ── Refs para evitar duplo carregamento ──────────────────────────────────────
  const carregandoRef = useRef(false)
  // Cache de itens carregados por pedido: pedidoId → PedidoItem[]
  // Não-reativo: evita que setPedidos dispare re-loads em useGTExpandir
  const itensCarregadosRef = useRef<Map<string, PedidoItem[]>>(new Map())

  // ── Props estáveis para TabelaVirtualGlobal ──────────────────────────────────
  // REGRA: qualquer função/array passado como prop que entra em dep de useMemo/useEffect
  // dentro da tabela DEVE ser estável. useMemo/useCallback evitam recriação a cada render.

  // ── Primeira carga ───────────────────────────────────────────────────────────
  const carregarInicial = useCallback(async (
    novaAba: string = abaAtiva,
    novaOrdem: string = sortCampo,
    novaDir: 'asc' | 'desc' = sortDir,
    novaBusca: string = busca,
    novaPagina = 1,
  ) => {
    // Curto-circuito ANTES do guard carregandoRef:
    // 0 workspaces selecionados = usuário desmarcou tudo intencionalmente →
    // lista vazia, sem fetch (evita falar com backend que cairia no header).
    // Precisa rodar mesmo se outro fetch está em-flight (caso contrário a UI
    // fica presa mostrando os pedidos antigos).
    if (workspacesSelecionados.length === 0) {
      setPedidos([])
      setTotal(0)
      setTotalItensBanco(0)
      setCarregando(false)
      setErroCarga(null)
      setPaginaAtual(novaPagina)
      // Aborta o flag de carga se estava setado por uma chamada anterior
      carregandoRef.current = false
      return
    }

    if (carregandoRef.current) return
    carregandoRef.current = true
    setCarregando(true)
    setErroCarga(null)
    setPaginaAtual(novaPagina)
    try {
      // Filtro multi-workspace: envia query param sempre que a seleção do usuário
      // diferir do default (= apenas o workspace ativo). Isso inclui:
      //  - usuário escolheu OUTRO workspace único (ex: ativo=CDE, filtro=ABC)
      //  - usuário escolheu múltiplos workspaces
      // Quando seleção == [workspaceAtivo] o header x-id-workspace cuida sozinho.
      const ehSelecaoDefault =
        workspacesSelecionados.length === 1 &&
        workspacesSelecionados[0] === workspaceAtivo
      const idsWorkspacesFiltro = ehSelecaoDefault ? undefined : workspacesSelecionados

      const res = await pedidoVirtualApi.listar({
        sort: novaOrdem,
        dir: novaDir,
        limit: ITENS_POR_PAGINA,
        page: novaPagina,
        status: novaAba !== 'todos' ? novaAba : undefined,
        busca: novaBusca || undefined,
        idsWorkspacesFiltro,
      })
      // Pré-computa flags de divergência no carregamento inicial — pedidos vem
      // com itens populados do backend (include itens_pedido na rota /listar).
      // Sem isso, alertas como data_emissao_pedido_divergente ficavam undefined
      // até o usuário expandir manualmente o pedido (handleCarregarFilhos).
      // Decisão UX 2026-05-13: alerta deve aparecer no list view sem expansão.
      const pedidosComDivergencias = res.data.map(p => {
        if (!p.itens || p.itens.length === 0) return p
        return { ...p, ...calcularDivergencias(p.itens, p) }
      })
      setPedidos(pedidosComDivergencias)
      setTotal(res.total)
      setTotalItensBanco(res.totalItens ?? 0)
    } catch (err) {
      // keepPreviousData: mantém os pedidos atualmente exibidos caso o fetch falhe
      // (ex: token Clerk expirando após idle timeout, race condition de refresh).
      // Sem isso, qualquer falha transitória zera a tela e mostra Empty State
      // mesmo quando o usuário tem dados válidos carregados.
      // Mand. 08 — registramos o erro no estado para que o empty state possa
      // diferenciar "vazio legítimo" de "falhou ao carregar" (sem fallback silencioso).
      setErroCarga(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setCarregando(false)
      carregandoRef.current = false
    }
  }, [abaAtiva, sortCampo, sortDir, busca, ITENS_POR_PAGINA, workspacesSelecionados, workspaceAtivo])

  // Recarrega lista quando mudou seleção de workspaces (filtro multi-workspace)
  useEffect(() => {
    if (!idOrganizacao) return
    carregarInicial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspacesSelecionados])

  // ── Deep-link: auto-expandir pedido ao retornar do Configurador ────────────
  // URL param ?expandir=<pedidoId> — expande o pedido e limpa o param.
  // Depende de [carregando, pedidos] para garantir que:
  //  1) carregando=false (fetch concluído)
  //  2) pedidos contém dados (a tabela tem o pedido no dadosRef)
  const expandirAutoFeito = useRef(false)
  useEffect(() => {
    if (expandirAutoFeito.current) return
    if (carregando || pedidos.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const idExpandir = params.get('expandir')
    if (!idExpandir) return
    // Verifica se o pedido existe nos dados carregados
    const pedidoExiste = pedidos.some(p => p.id === idExpandir)
    if (!pedidoExiste) {
      // Pedido não está na página atual — limpa param para não tentar infinitamente
      expandirAutoFeito.current = true
      params.delete('expandir')
      const novaUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
      window.history.replaceState({}, '', novaUrl)
      return
    }
    expandirAutoFeito.current = true
    // Limpa o param da URL sem recarregar
    params.delete('expandir')
    const novaUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', novaUrl)
    // Aguarda a tabela renderizar com os dados antes de expandir
    // requestAnimationFrame garante que o render cycle completou;
    // setTimeout adicional dá tempo para o imperativeHandle registrar
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (tabelaRef.current) {
          tabelaRef.current.expandir(idExpandir)
        }
      }, 150)
    })
  }, [carregando, pedidos])

  const acoesPai = useMemo(() => ([
    {
      id: 'editar',
      tooltip: 'Editar pedido',
      icone: <PencilLine size={14} weight="duotone" />,
      onClick: (pedido: Pedido) => {
        setPedidoEditandoId(pedido.id)
        setDrawerAberto(true)
      },
    },
  ]), [])

  const acoesFilhoEstavel = useCallback((item: PedidoItem) => ([
    {
      label: 'Transferir',
      icone: <ArrowsLeftRight size={13} weight="duotone" />,
      onClick: () => {
        setItensSelecionados([item])
        setModalTransferirAberto(true)
      },
    },
    {
      label: 'Duplicar',
      icone: <CopySimple size={13} weight="duotone" />,
      onClick: () => {
        setItensSelecionados([item])
        setModalDuplicarAberto(true)
      },
    },
    {
      label: 'Excluir',
      icone: <Trash size={13} weight="duotone" />,
      perigo: true,
      onClick: async () => {
        setExcluindoItens(true)
        try {
          await pedidoExcluirApi.excluirItens(item.pedido_id, [item.id])
          addNotification({ type: 'success', message: 'Item excluído com sucesso.' })
          await carregarInicial()
        } catch {
          addNotification({ type: 'error', message: 'Erro ao excluir item. Tente novamente.' })
        } finally {
          setExcluindoItens(false)
        }
      },
    },
  ]), [carregarInicial, addNotification])

  const onSelecaoFilhoEstavel = useCallback(
    (itens: PedidoItem[]) => setItensSelecionados(itens),
    [setItensSelecionados],
  )

  const onFiltroColuna = useCallback((key: string, anchor: HTMLElement) => {
    setPopoverAberto(prev => prev === key ? null : key)
    const ref = getAnchorRef(key)
    if (ref && 'current' in ref) (ref as React.MutableRefObject<HTMLElement | null>).current = anchor
  }, [])

  // Abre o modal customizado de exclusão (substitui o window.confirm() nativo).
  // O modal cuida do preview, da confirmação e do resultado — aqui só sinalizamos
  // abertura e mantemos o flag `excluindoLote` para travar a UI da BarraAcoes.
  const handleExcluirLote = useCallback(() => {
    if (pedidosSelecionados.length === 0 && itensSelecionados.length === 0) return
    setModalExcluirAberto(true)
  }, [pedidosSelecionados.length, itensSelecionados.length])

  const handleNavConfiguracoes = useCallback(() => {
    // Rota do produto Pedido montada sob /produto/pedido/* (ver App.tsx).
    // Usar '/configuracoes' (sem prefixo) bate no shell e dá 404.
    // tab=colunas-personalizadas (não 'colunas' — id de categoria precisa
    // bater com COLUNAS_FILHOS para o effect de scroll+focus disparar).
    navigate('/produto/pedido/configuracoes?tab=colunas-personalizadas&acao=nova')
    setNovoDropdownAberto(false)
  }, [navigate])

  const acoesBarra = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
      {/* Filtro multi-workspace agora vive na COLUNA "Workspace" (header). */}
      <BarraAcoesPedido
        novoDropdownRef={novoDropdownRef}
        novoDropdownAberto={novoDropdownAberto}
        novoSubmenu={novoSubmenu}
        pedidosSelecionados={pedidosSelecionados}
        itensSelecionados={itensSelecionados}
        excluindoLote={excluindoLote}
        filtrosAtivos={filtrosAtivos}
        setNovoDropdownAberto={setNovoDropdownAberto}
        setNovoSubmenu={setNovoSubmenu}
        setSmartImportAberto={setSmartImportAberto}
        setModalCockpitAberto={setModalCockpitAberto}
        setModalNovoPedidoAberto={setModalNovoPedidoAberto}
        setModalNovoItemAberto={setModalNovoItemAberto}
        setModalTransferirAberto={setModalTransferirAberto}
        setModalConsolidarAberto={setModalConsolidarAberto}
        setModalEdicaoMassaAberto={setModalEdicaoMassaAberto}
        setModalGerarPdfAberto={setModalGerarPdfAberto}
        setModalDuplicarAberto={setModalDuplicarAberto}
        onExcluirLote={handleExcluirLote}
        onNavigateToConfiguracoes={handleNavConfiguracoes}
        handleLimparFiltro={handleLimparFiltro}
        handleLimparTodosFiltros={handleLimparTodosFiltros}
        busca={busca}
        onLimparBusca={() => handleBuscar('')}
        onFiltroColuna={onFiltroColuna}
        podeEditarLista={podeEditarLista}
      />
    </div>
  ), [
    novoDropdownAberto, novoSubmenu, pedidosSelecionados, itensSelecionados, excluindoLote, filtrosAtivos, busca,
    novoDropdownRef, setNovoDropdownAberto, setNovoSubmenu, setSmartImportAberto,
    setModalCockpitAberto, setModalNovoPedidoAberto, setModalNovoItemAberto,
    setModalTransferirAberto, setModalConsolidarAberto, setModalEdicaoMassaAberto,
    setModalGerarPdfAberto, setModalDuplicarAberto,
    handleExcluirLote, handleNavConfiguracoes, handleLimparFiltro, handleLimparTodosFiltros,
    onFiltroColuna, podeEditarLista,
  ])

  // ── Valores únicos por campo (para filtro enum e sugestões texto) ────────────
  const valoresUnicosPorCampo = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {}
    for (const col of colunasPai) {
      if (!col.filtravel) continue
      if (detectarTipoColunaPedido(col) === 'numero') continue // range — sem lista
      // Exceção: id_workspace usa a lista completa de workspaces disponíveis
      // (não apenas os presentes na página atual), pois o filtro afeta o que
      // será carregado do backend.
      if (col.key === 'id_workspace') {
        const nomes = workspacesDisponiveis
          .map(w => w.nome_workspace)
          .filter((n): n is string => !!n)
        if (nomes.length > 0) result[col.key] = Array.from(new Set(nomes)).sort()
        continue
      }
      const labelMap = LABELS_FILTRO[col.key]
      const vals = new Set<string>()
      for (const p of pedidos) {
        const raw = String((p as Record<string, unknown>)[col.key] ?? '').trim()
        if (!raw || raw === 'undefined' || raw === 'null') continue
        // Exibir label formatada se existir, senão valor raw
        vals.add(labelMap?.[raw] ?? raw)
      }
      if (vals.size > 0) result[col.key] = Array.from(vals).sort()
    }
    return result
  }, [pedidos, colunasPai, workspacesDisponiveis])

  // ── Carregar status e preferências ──────────────────────────────────────────
  useEffect(() => {
    // Inicializar abas do localStorage imediatamente (enquanto API carrega)
    const abasLocal = lerAbasDoLocalStorage(t)
    if (abasLocal && abasLocal.length > 1) setAbas(abasLocal)

    // Conditional fetching: aguarda idOrganizacao hidratar antes de chamar as APIs,
    // caso contrário /config/preferencias/usuario e afins retornam 400.
    if (!idOrganizacao) return

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
          // Mescla com extras do localStorage (status criados pelo usuário)
          const idsApi = new Set(abasApi.map(a => a.valor))
          const extras = (abasLocal ?? []).filter(a => a.valor !== 'todos' && !idsApi.has(a.valor))
          setAbas([...abasApi, ...extras])
        }
      })
      .catch(() => {
        // Fallback: usar dados do localStorage ou ABAS_PADRAO
        if (!abasLocal || abasLocal.length <= 1) return
        setAbas(abasLocal)
      })

    // Carregar preferências e colunas customizadas em paralelo para mesclar corretamente
    Promise.all([
      pedidoConfigApi.obterPreferenciaUsuarioColunaPedido().catch(() => ({ data: null })),
      colunasUsuarioApi.listar().catch(() => [] as ColunaUsuario[]),
    ]).then(([prefsResp, lista]) => {
      setColunasUsuario(lista)

      const prefs = prefsResp?.data ?? null
      const savedVisible: string[] = prefs?.colunas_visiveis && prefs.colunas_visiveis.length > 0
        ? prefs.colunas_visiveis
        : COLUNAS_PADRAO_VISIVEIS

      // Colunas customizadas ativas que ainda não estão nas preferências salvas
      // (criadas após o último save de prefs) → adicionar como visíveis por padrão
      const activeCustomKeys = lista
        .filter(c => c.ativo && ((c.escopo || 'ambos') === 'pedido' || (c.escopo || 'ambos') === 'ambos'))
        .map(c => c.chave)
      const savedSet = new Set(savedVisible)
      const novas = activeCustomKeys.filter(k => !savedSet.has(k))

      // Migração de prefs salvas → padrão atual via helpers de `migracaoColunas`.
      // Refactor D12 (2026-05-13): lógica antes inline aqui (40+ linhas duplicadas)
      // foi extraída para shared/migracaoColunas.ts com cobertura unitária.
      //
      // Caso 1: id_workspace NÃO está nas prefs → inserir (entrega 2026-05-13).
      //         Tenta inserir após tipo_operacao; fallback para numero_pedido; fallback no início.
      // Caso 2: id_workspace JÁ está, mas em posição antiga (antes de tipo_operacao) → mover.
      const passoInserir = inserirColunaAposAncora(
        savedVisible,
        'id_workspace',
        ['tipo_operacao', 'numero_pedido'],
      )
      const passoMover = moverColunaParaAposAncora(
        passoInserir.resultado,
        'id_workspace',
        'tipo_operacao',
      )
      // Caso 3: descricao_item NÃO está nas prefs → inserir após ncm (entrega 2026-05-14).
      const passoDescItem = inserirColunaAposAncora(
        passoMover.resultado,
        'descricao_item',
        ['ncm'],
      )
      // Caso 4: moeda_pedido NÃO está nas prefs → inserir após ncm/descricao_item (entrega 2026-05-15).
      const passoMoeda = inserirColunaAposAncora(
        passoDescItem.resultado,
        'moeda_pedido',
        ['descricao_item', 'ncm'],
      )
      // Caso 5: unidade_comercializada_pedido NÃO está nas prefs → inserir após quantidade_pronta_itens_pedido_total (entrega 2026-05-15).
      const passoUnidade = inserirColunaAposAncora(
        passoMoeda.resultado,
        'unidade_comercializada_pedido',
        ['quantidade_pronta_itens_pedido_total', 'valor_total_pedido', 'quantidade_total_pedido'],
      )
      const visivelComMigracao = passoUnidade.resultado
      const mudouPosicao = passoMover.mudou || passoDescItem.mudou || passoMoeda.mudou || passoUnidade.mudou
      const novasBuiltin = [
        ...(passoInserir.mudou ? ['id_workspace'] : []),
        ...(passoDescItem.mudou ? ['descricao_item'] : []),
        ...(passoMoeda.mudou ? ['moeda_pedido'] : []),
        ...(passoUnidade.mudou ? ['unidade_comercializada_pedido'] : []),
      ]

      const finalVisible = novas.length > 0 || novasBuiltin.length > 0 || mudouPosicao
        ? [...visivelComMigracao, ...novas]
        : savedVisible

      if (novas.length > 0 || novasBuiltin.length > 0 || mudouPosicao) {
        // Persistir preferências com as novas colunas (ou reposicionamento) para
        // que hide/show e a ordem funcionem corretamente em todos os dispositivos.
        pedidoConfigApi.salvarPreferenciaUsuarioColunaPedido({ colunas_visiveis: finalVisible }).catch(() => {})
      }

      setPreferencias({ colunas_visiveis: finalVisible })
    })
  }, [idOrganizacao]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fechar dropdown ao clicar fora ──────────────────────────────────────────
  useEffect(() => {
    if (!novoDropdownAberto) return
    const handler = (e: MouseEvent) => {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(e.target as Node)) {
        setNovoDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [novoDropdownAberto])

  useEffect(() => { if (!idOrganizacao) return; carregarInicial() }, [idOrganizacao]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!idOrganizacao) return
    configRegrasApi.obter().then(cfg => { _regrasAlertasRef.current = cfg }).catch(() => { /* silencioso */ })
  }, [idOrganizacao]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!idOrganizacao) return
    casasDecimaisApi.obter()
      .then(res => {
        if (res.data.formato_data) setFormatoData(res.data.formato_data as import('../shared/useFormatoData').FormatoData)
      })
      .catch(() => { /* silencioso — usa valor do localStorage ou default DD/MM/AAAA */ })
  }, [idOrganizacao]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mudar página ─────────────────────────────────────────────────────────────
  const handleMudarPagina = useCallback((pagina: number) => {
    carregarInicial(abaAtiva, sortCampo, sortDir, busca, pagina)
  }, [carregarInicial, abaAtiva, sortCampo, sortDir, busca])

  // ── Mudar aba ────────────────────────────────────────────────────────────────
  const handleMudarAba = useCallback((aba: string) => {
    setAbaAtiva(aba)
    setFindTotalExterno(null)
    carregarInicial(aba, sortCampo, sortDir, busca)
  }, [carregarInicial, sortCampo, sortDir, busca])

  // ── Ordenação ────────────────────────────────────────────────────────────────
  const handleOrdenar = useCallback((campo: string, dir: 'asc' | 'desc') => {
    setSortCampo(campo)
    setSortDir(dir)
    carregarInicial(abaAtiva, campo, dir, busca)
  }, [carregarInicial, abaAtiva, busca])

  // ── Drag-and-drop: reordenar pedidos (client-side) ─────────────────────────
  const handleReordenarPedidos = useCallback((ids: string[]) => {
    // Reordena array local de pedidos na ordem dos IDs recebidos
    const mapa = new Map(pedidos.map(p => [p.id, p]))
    const reordenados = ids.map(id => mapa.get(id)).filter((p): p is Pedido => p != null)
    // Pedidos que não estavam no array de IDs (caso raro) ficam no final
    const restantes = pedidos.filter(p => !ids.includes(p.id))
    setPedidos([...reordenados, ...restantes])
  }, [pedidos])

  // ── Drag-and-drop: reordenar itens (persistido via backend) ────────────────
  const handleReordenarItens = useCallback(async (paiId: string, ids: string[]) => {
    try {
      await pedidoItemApi.reordenar(paiId, ids)
    } catch (err) {
      console.error('[handleReordenarItens] paiId:', paiId, 'ids:', ids, 'erro:', err)
      addNotification({ type: 'error', message: 'Erro ao reordenar itens. Tente novamente.' })
    }
  }, [addNotification])

  // ── Busca ────────────────────────────────────────────────────────────────────
  const handleBuscar = useCallback((termo: string) => {
    setBusca(termo)
    carregarInicial(abaAtiva, sortCampo, sortDir, termo)
  }, [carregarInicial, abaAtiva, sortCampo, sortDir])

  // ── Find-in-page: busca o total de matches no banco (pedidos + itens) ──────────
  // Debounce de 350ms para não disparar a cada keystroke.
  const findPreScanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleFindTermoChange = useCallback((termo: string) => {
    if (findPreScanTimerRef.current) clearTimeout(findPreScanTimerRef.current)
    setFindTotalExterno(null)
    if (!termo) return
    findPreScanTimerRef.current = setTimeout(async () => {
      try {
        const res = await pedidoVirtualApi.localizar({
          termo,
          status: abaAtiva !== 'todos' ? abaAtiva : undefined,
          busca: busca || undefined,
        })
        setFindTotalExterno(res.total)
      } catch {
        setFindTotalExterno(null)
      }
    }, 350)
  }, [abaAtiva, busca])

  // Campos "ghost" — existem no item mas NÃO como coluna directa no pai. PATCH directo nos itens.
  const CAMPOS_GHOST_ITENS = new Set(['ncm', 'cobertura_cambial'])

  // ── Edição inline (pai) ──────────────────────────────────────────────────────
  const handleEditar = useCallback(async (
    id: string,
    campo: string,
    valor: unknown,
    opts?: { replicar_em_itens?: boolean },
  ): Promise<Pedido> => {
    // Coluna customizada do usuário — salva via endpoint próprio
    const colunaCustom = colunasUsuario.find(c => c.chave === campo)
    if (colunaCustom) {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error('Pedido não encontrado')
      await colunasUsuarioApi.salvarValores('pedido', id, { [colunaCustom.id]: String(valor) })
      const replicarCustom = opts?.replicar_em_itens ?? false
      if (replicarCustom && ((colunaCustom.escopo || 'ambos') === 'ambos')) {
        let itens = itensCarregadosRef.current.get(id)
        if (!itens || itens.length === 0) {
          itens = (pedidoAtual.itens?.length ?? 0) > 0
            ? pedidoAtual.itens as PedidoItem[]
            : await pedidoItemApi.listar(id)
        }
        if (itens.length > 0) {
          await Promise.all(
            itens.map(item =>
              colunasUsuarioApi.salvarValores('item', item.id, { [colunaCustom.id]: String(valor) })
            )
          )
          const itensAtualizados = itens.map(i => {
            const colAntes = (i as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
            return { ...i, _colunas_usuario: { ...colAntes, [colunaCustom.id]: String(valor) } }
          })
          itensCarregadosRef.current.set(id, itensAtualizados as PedidoItem[])
        }
      }
      const colunasAntes = (pedidoAtual as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
      const itensFinais = itensCarregadosRef.current.get(id) ?? pedidoAtual.itens ?? []
      const atualizado = {
        ...pedidoAtual,
        _colunas_usuario: { ...colunasAntes, [colunaCustom.id]: String(valor) },
        itens: itensFinais,
        updated_at: new Date().toISOString(),
      } as Pedido
      const divergenciasCustom = (itensFinais as PedidoItem[]).length > 0
        ? calcularDivergencias(itensFinais as PedidoItem[], atualizado)
        : {}
      setPedidos(prev => prev.map(p => p.id === id ? { ...atualizado, ...divergenciasCustom } : p))
      return atualizado
    }
    if (campo === 'status') {
      const pedidoAtual = pedidos.find(p => p.id === id)
      const novoStatus = String(valor)
      const atualizado = { ...pedidoAtual!, status: novoStatus } as Pedido
      await pedidoLoteApi.mudarStatusConfirmar([id], novoStatus).catch(err => {
        if (!import.meta.env.DEV) throw err
        // DEV: sem servidor → aplica localmente mesmo assim
      })
      // Items herdam status do pai (PedidoItem não tem coluna status própria).
      // Quando "Aplicar a todos" está marcado OU simplesmente quando itens
      // estão em cache, atualizamos o status herdado para reflexo imediato.
      const itensCache = itensCarregadosRef.current.get(id)
      if (itensCache && itensCache.length > 0) {
        const itensAtualizados = itensCache.map(i => ({ ...i, status: novoStatus }))
        itensCarregadosRef.current.set(id, itensAtualizados)
      }
      setPedidos(prev => prev.map(p => p.id === id
        ? { ...atualizado, itens: itensCarregadosRef.current.get(id) ?? p.itens }
        : p
      ))
      return atualizado
    }
    // ── Ghost: campos que existem no item mas NÃO como coluna directa no pai ────
    // PATCH directo nos itens. Lógica de propagação real fica no servidor para
    // campos normais (isPropagavel) — o frontend é apenas o reflexo visual.
    if (CAMPOS_GHOST_ITENS.has(campo)) {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error('Pedido não encontrado')
      const valorEnviar = campo === 'data_emissao_pedido' ? normalizarDataISO(valor) : valor
      const itensGhost = itensCarregadosRef.current.get(id) ?? []
      await Promise.all(
        itensGhost.map(item => pedidoItemApi.editarCampo(id, item.id, campo, valorEnviar))
      )
      // Invalida cache local — itemVersion detectará mudança e refetch acontece automaticamente
      itensCarregadosRef.current.delete(id)
      const pedidoAtualizado = { ...pedidoAtual, [campo]: valorEnviar } as Pedido
      setPedidos(prev => prev.map(p => p.id === id ? pedidoAtualizado : p))
      return pedidoAtualizado
    }
    const pedidoAtual = pedidos.find(p => p.id === id)
    // GTValorUnidade { unit, quantity } → extrai quantity, aplica conversão para KG em campos de peso
    const FATOR_PARA_KG_PAI: Record<string, number> = { KG: 1, G: 0.001, TON: 1000, KGBR: 1 }
    const CAMPOS_PESO_PAI = new Set(['peso_liquido_total_pedido', 'peso_bruto_total_pedido'])
    const isUnidadePai = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)
    const valorEnviarPai: unknown = isUnidadePai
      ? (() => {
          const { unit, quantity } = valor as { unit: string; quantity: number }
          return CAMPOS_PESO_PAI.has(campo) ? quantity * (FATOR_PARA_KG_PAI[unit] ?? 1) : quantity
        })()
      : valor
    // replicar_em_itens vem do checkbox "Aplicar a todos os itens" no popover
    // do pai (Decisão UX 2026-05-13). Default false — comportamento divergente.
    const replicar = opts?.replicar_em_itens ?? false
    const updatedPedido = await pedidoVirtualApi.editarCampo(id, campo, valorEnviarPai, replicar)
    // Quando replicou, o servidor atualizou os itens filhos via updateMany.
    // ATUALIZA o cache local de itens com o novo valor (em vez de só invalidar
    // — invalidar sozinho exige refetch ao expandir e mantém flag stale).
    // Decisão UX 2026-05-13: refletir imediatamente nos itens em memória.
    if (replicar && isPropagavel(campo)) {
      const itensCache = itensCarregadosRef.current.get(id) ?? []
      if (itensCache.length > 0) {
        // O campo no item pode ter nome diferente (e.g. data_emissao_pedido →
        // data_emissao_item). Atualizamos AMBOS porque o front lê via
        // `i.data_emissao_pedido` (legado/contrato público) e o item Prisma
        // usa `data_emissao_item`. Set defensivo cobre os 2.
        const itensAtualizados = itensCache.map(i => ({
          ...i,
          [campo]: valorEnviarPai,
        }))
        itensCarregadosRef.current.set(id, itensAtualizados)
      } else {
        // Sem cache (pedido nunca foi expandido) — só invalida para refetch quando expandir.
        itensCarregadosRef.current.delete(id)
      }
    }
    // Recalcula flags de divergência com o novo valor do pai. Necessário pra
    // campos como data_emissao_pedido onde a regra é "pai != filhos -> alerta"
    // (decisão UX 2026-05-13). Sem isso, a flag continua stale após edição do pai.
    const itensAtuais = itensCarregadosRef.current.get(id) ?? []
    const divergenciasPos = itensAtuais.length > 0 ? calcularDivergencias(itensAtuais, updatedPedido) : {}
    setPedidos(prev => prev.map(p => p.id === id ? { ...updatedPedido, itens: itensAtuais.length > 0 ? itensAtuais : p.itens, ...divergenciasPos } : p))
    return updatedPedido
  }, [pedidos, colunasUsuario])

  // ── Recalcula flags de divergência a partir dos itens carregados ─────────────
  // SSOT: getAlertavelKeys() vem de columnAlertConfig.ts (shared) — 76 campos.
  // Convenção: {key}_divergente (boolean), {key}_valor_unico (string|null) para campos ghost.
  const CAMPOS_GHOST = new Set(['ncm', 'cobertura_cambial', 'data_emissao_pedido'])

  function calcularDivergencias(itens: PedidoItem[], pedidoPai?: Pedido): Partial<Pedido> {
    const result: Record<string, unknown> = {}
    for (const campo of getAlertavelKeys()) {
      const valores = itens
        .map(i => (i as Record<string, unknown>)[campo])
        .filter((v): v is string => v != null && v !== '')
      const distintos = new Set(valores).size
      result[`${campo}_divergente`] = distintos > 1
      if (CAMPOS_GHOST.has(campo)) {
        result[`${campo}_valor_unico`] = distintos === 1 ? valores[0] : null
      }
    }
    // NCM (campo ghost) — recomputa flag + valor único + contagem juntos.
    // Espelha a regra do backend (mapPedido em processos-core/routes/pedidos.ts):
    // ncm_divergente quando há mais de 1 NCM distinto entre os itens.
    // Sem isso, `ncm_divergente` ficaria stale (vindo do payload anterior) e o badge
    // mostraria "⚠ 1 NCMs diferentes nos itens" mesmo com itens homogêneos.
    const ncms = itens.map(i => i.ncm).filter((v): v is string => v != null && v !== '')
    const ncmsUnicos = new Set(ncms)
    result.ncms_distintos_count = ncmsUnicos.size
    result.ncm_divergente = ncmsUnicos.size > 1
    result.ncm_valor_unico = ncmsUnicos.size === 1 ? [...ncmsUnicos][0] : null

    // data_emissao_pedido (campo ghost) — decisão UX 2026-05-13:
    // alerta no pai quando algum item tem data ≠ pai (ou itens divergem entre si).
    // O pai pode ter sido editado pelo usuário com uma data diferente da dos itens
    // (e vice-versa). Padrão: mostra o valor + ⚠ ao lado, não esconde o valor.
    //
    // Normalização: backend pode devolver date em formatos diferentes para pai vs
    // filhos (Date object via Prisma, ISO completo `2026-05-12T00:00:00.000Z`, ou
    // date-only `2026-05-12` se recém-editado). Usamos `new Date().toISOString()`
    // para canonizar antes de comparar — evita falsos positivos por timezone ou
    // por formato. Falha silenciosa só se a data for inválida (volta a substring).
    function dateKey(v: unknown): string | null {
      if (v == null) return null
      const s = String(v)
      if (!s) return null
      const d = new Date(s)
      if (!isNaN(d.getTime())) {
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const dd = String(d.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${dd}`
      }
      return s.substring(0, 10) || null
    }
    const datasItens = itens
      .map(i => dateKey(i.data_emissao_pedido))
      .filter((v): v is string => v != null)
    const datasUnicas = new Set(datasItens)
    const dataPai = dateKey(pedidoPai?.data_emissao_pedido)
    // Divergente se: (a) itens divergem entre si OU (b) pai tem valor e difere
    // de algum item OU (c) algum item tem valor e o pai não (e os itens divergem).
    let dataEmissaoDivergente = datasUnicas.size > 1
    if (!dataEmissaoDivergente && dataPai && datasUnicas.size === 1) {
      const dataUnicaItens = [...datasUnicas][0]
      if (dataUnicaItens !== dataPai) dataEmissaoDivergente = true
    }
    result.data_emissao_pedido_divergente = dataEmissaoDivergente
    result.data_emissao_pedido_valor_unico = datasUnicas.size === 1 ? [...datasUnicas][0] : null

    // Colunas customizadas: compara _colunas_usuario entre itens e com o pai
    const colIdsSet = new Set<string>()
    for (const item of itens) {
      const cu = (item as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined
      if (cu) for (const k of Object.keys(cu)) colIdsSet.add(k)
    }
    const paiCu = pedidoPai ? (pedidoPai as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined : undefined
    const divergenciasCustom: Record<string, boolean> = {}
    for (const colId of colIdsSet) {
      const valoresItens = itens
        .map(i => ((i as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined)?.[colId])
        .filter((v): v is string => v != null && v !== '')
      const distintos = new Set(valoresItens)
      let div = distintos.size > 1
      if (!div && paiCu?.[colId] && distintos.size === 1) {
        div = [...distintos][0] !== paiCu[colId]
      }
      divergenciasCustom[colId] = div
    }
    result['_colunas_usuario_divergentes'] = divergenciasCustom

    return result as Partial<Pedido>
  }

  // ── Edição inline (filho / item) ──────────────────────────────────────────────
  const handleEditarFilho = useCallback(async (id: string, campo: string, valor: unknown): Promise<PedidoItem> => {
    // Localiza o pedido pai via cache de itens carregados (p.itens é sempre [] na list view)
    let pedidoId: string | undefined
    for (const [pId, itensCache] of itensCarregadosRef.current) {
      if (itensCache.some(i => i.id === id)) { pedidoId = pId; break }
    }
    const pedido = pedidoId ? pedidos.find(p => p.id === pedidoId) : undefined
    if (!pedido) throw new Error('Não foi possível localizar o pedido deste item. Recarregue a página.')
    // Helper: itens carregados via handleCarregarFilhos (lista view retorna itens:[])
    const getItensCache = () => itensCarregadosRef.current.get(pedido.id) ?? []

    // Status → espelha para o pedido inteiro (todos os itens mudam junto)
    if (campo === 'status') {
      await pedidoLoteApi.mudarStatusConfirmar([pedido.id], String(valor)).catch(err => {
        if (!import.meta.env.DEV) throw err
      })
      const pedidoAtualizado = { ...pedido, status: String(valor) as Pedido['status'] }
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...pedidoAtualizado,
          itens: p.itens?.map(i => ({ ...i, _p: { ...(i as PedidoItemEnriquecido)._p, status: String(valor) } })),
        }
      }))
      const item = getItensCache().find(i => i.id === id)!
      return { ...item, _p: { ...(item as PedidoItemEnriquecido)._p, status: String(valor) } } as PedidoItem
    }

    // Campos do pedido pai → atualiza o pedido, não o item
    if (CAMPOS_PAI_TEXTO.has(campo)) {
      const pedidoAtualizado = await pedidoApi.atualizar(pedido.id, { [campo]: valor as string } as Partial<Pedido>)
        .catch(() => {
          if (import.meta.env.DEV) return { ...pedido, [campo]: valor } as Pedido
          throw new Error(`Erro ao editar campo ${campo} do pedido`)
        })
      // _p completo construído a partir do pedidoAtualizado (itens crus de pedidos.itens não têm _p)
      const novoPaiP = {
        id: pedidoAtualizado.id,
        id_workspace: pedidoAtualizado.id_workspace ?? null,
        tipo_operacao: pedidoAtualizado.tipo_operacao,
        nome_exportador: pedidoAtualizado.nome_exportador ?? null,
        nome_importador: pedidoAtualizado.nome_importador ?? null,
        nome_fabricante: pedidoAtualizado.nome_fabricante ?? null,
        referencia_importador: pedidoAtualizado.referencia_importador ?? null,
        referencia_exportador: pedidoAtualizado.referencia_exportador ?? null,
        referencia_fabricante: pedidoAtualizado.referencia_fabricante ?? null,
        numero_proforma: pedidoAtualizado.numero_proforma ?? null,
        numero_invoice: pedidoAtualizado.numero_invoice ?? null,
        incoterm: pedidoAtualizado.incoterm ?? null,
        condicao_pagamento: pedidoAtualizado.condicao_pagamento ?? null,
        data_emissao_pedido: pedidoAtualizado.data_emissao_pedido ?? null,
        status: pedidoAtualizado.status,
        moeda_pedido: (pedidoAtualizado as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
      }
      // Atualiza o pedido e re-enriquece os itens com o _p correto
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...pedidoAtualizado,
          itens: p.itens?.map(i => ({ ...i, _p: novoPaiP })),
        }
      }))
      const item = getItensCache().find(i => i.id === id)!
      return { ...item, _p: novoPaiP } as PedidoItem
    }

    // valor_total_item retorna GTValorMoeda { currency, amount } → salva amount + moeda_item no item (por item)
    if (campo === 'valor_total_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const itemAtualMv = getItensCache().find(i => i.id === id)
      const atualizadoMv = await pedidoItemApi.atualizar(pedido.id, id, {
        valor_total_item: mv.amount,
        moeda_item: mv.currency,
      } as Partial<PedidoItem>)
        .catch(() => {
          if (import.meta.env.DEV && itemAtualMv) return { ...itemAtualMv, valor_total_item: mv.amount, moeda_item: mv.currency } as PedidoItem
          throw new Error('Erro ao editar valor_total_item')
        })
      const enriquecidoMv: PedidoItemEnriquecido = {
        ...atualizadoMv,
        _p: {
          id: pedido.id,
          id_workspace: pedido.id_workspace ?? null,
          tipo_operacao: pedido.tipo_operacao,
          nome_exportador: pedido.nome_exportador ?? null,
          nome_importador: pedido.nome_importador ?? null,
          nome_fabricante: pedido.nome_fabricante ?? null,
          referencia_importador: pedido.referencia_importador ?? null,
          referencia_exportador: pedido.referencia_exportador ?? null,
          referencia_fabricante: pedido.referencia_fabricante ?? null,
          numero_proforma: pedido.numero_proforma ?? null,
          numero_invoice: pedido.numero_invoice ?? null,
          incoterm: pedido.incoterm ?? null,
          condicao_pagamento: pedido.condicao_pagamento ?? null,
          data_emissao_pedido: pedido.data_emissao_pedido ?? null,
          status: pedido.status,
          moeda_pedido: (pedido as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
        },
      }
      // Bug fix: alinhar o caminho de edição de valor_total_item (que inclui moeda)
      // ao caminho genérico — recomputa flags de divergência E reaplica a regra
      // de homogeneidade (Onda A8) localmente. Sem isso, mudar moeda do item
      // não dispara o flag `moeda_item_divergente` no front e o pai mostra
      // valor stale ou alerta stale.
      const itensAposEdicaoMv = getItensCache().map(i => i.id === id ? enriquecidoMv : i)
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoMv)
      const divergenciasMv = calcularDivergencias(itensAposEdicaoMv, pedido)

      // Regra de homogeneidade (espelha helper recalcularAgregadosPedido):
      // moedas mistas → valor_total_pedido = null; unidades mistas → qty null.
      const moedasContrib = new Set(
        itensAposEdicaoMv
          .filter(i => Number(i.valor_total_item ?? 0) > 0 && i.moeda_item)
          .map(i => i.moeda_item as string)
      )
      const unidadesContrib = new Set(
        itensAposEdicaoMv
          .filter(i => Number(i.quantidade_inicial_pedido ?? 0) > 0 && i.unidade_comercializada_item)
          .map(i => i.unidade_comercializada_item as string)
      )
      const valorTotalLocal = moedasContrib.size > 1
        ? null
        : itensAposEdicaoMv.reduce((s, i) => s + (Number(i.valor_total_item) || 0), 0)
      const qtyTotalLocal = unidadesContrib.size > 1
        ? null
        : itensAposEdicaoMv.reduce((s, i) => s + (Number(i.quantidade_inicial_pedido) || 0), 0)

      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasMv,
          itens: itensAposEdicaoMv,
          valor_total_pedido: valorTotalLocal,
          quantidade_total_pedido: qtyTotalLocal,
        }
      }))
      return enriquecidoMv
    }

    // moeda_item: o editor tipo 'moeda' retorna GTValorMoeda { currency, amount }.
    // Precisamos extrair apenas o currency e salvar no campo moeda_item.
    if (campo === 'moeda_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const itemAtualMi = getItensCache().find(i => i.id === id)
      const atualizadoMi = await pedidoItemApi.atualizar(pedido.id, id, {
        moeda_item: mv.currency,
      } as Partial<PedidoItem>)
        .catch(() => {
          if (import.meta.env.DEV && itemAtualMi) return { ...itemAtualMi, moeda_item: mv.currency } as PedidoItem
          throw new Error('Erro ao editar moeda_item')
        })
      const enriquecidoMi: PedidoItemEnriquecido = {
        ...atualizadoMi,
        _p: {
          id: pedido.id,
          id_workspace: pedido.id_workspace ?? null,
          tipo_operacao: pedido.tipo_operacao,
          nome_exportador: pedido.nome_exportador ?? null,
          nome_importador: pedido.nome_importador ?? null,
          nome_fabricante: pedido.nome_fabricante ?? null,
          referencia_importador: pedido.referencia_importador ?? null,
          referencia_exportador: pedido.referencia_exportador ?? null,
          referencia_fabricante: pedido.referencia_fabricante ?? null,
          numero_proforma: pedido.numero_proforma ?? null,
          numero_invoice: pedido.numero_invoice ?? null,
          incoterm: pedido.incoterm ?? null,
        },
      }
      setDadosPedidosLocais(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        const itensAposEdicaoMi = (p.itens ?? []).map(it =>
          it.id === id ? enriquecidoMi : it
        )
        return {
          ...p,
          itens: itensAposEdicaoMi,
        }
      }))
      return enriquecidoMi
    }

    // unidade_comercializada_item: o editor tipo 'unidade' retorna
    // GTValorUnidade { unit, quantity }. Extraímos apenas o unit.
    if (campo === 'unidade_comercializada_item' && valor != null && typeof valor === 'object' && 'unit' in (valor as object)) {
      const uv = valor as { unit: string; quantity: number }
      const itemAtualUi = getItensCache().find(i => i.id === id)
      const atualizadoUi = await pedidoItemApi.atualizar(pedido.id, id, {
        unidade_comercializada_item: uv.unit,
      } as Partial<PedidoItem>)
        .catch(() => {
          if (import.meta.env.DEV && itemAtualUi) return { ...itemAtualUi, unidade_comercializada_item: uv.unit } as PedidoItem
          throw new Error('Erro ao editar unidade_comercializada_item')
        })
      const enriquecidoUi: PedidoItemEnriquecido = {
        ...atualizadoUi,
        _p: {
          id: pedido.id,
          id_workspace: pedido.id_workspace ?? null,
          tipo_operacao: pedido.tipo_operacao,
          nome_exportador: pedido.nome_exportador ?? null,
          nome_importador: pedido.nome_importador ?? null,
          nome_fabricante: pedido.nome_fabricante ?? null,
          referencia_importador: pedido.referencia_importador ?? null,
          referencia_exportador: pedido.referencia_exportador ?? null,
          referencia_fabricante: pedido.referencia_fabricante ?? null,
          numero_proforma: pedido.numero_proforma ?? null,
          numero_invoice: pedido.numero_invoice ?? null,
          incoterm: pedido.incoterm ?? null,
        },
      }
      setDadosPedidosLocais(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        const itensAposEdicaoUi = (p.itens ?? []).map(it =>
          it.id === id ? enriquecidoUi : it
        )
        return {
          ...p,
          itens: itensAposEdicaoUi,
        }
      }))
      return enriquecidoUi
    }

    // valor_por_unidade_item: também retorna GTValorMoeda { currency, amount }
    // (configurado em valor_por_unidade_item.getValorEditar:2317). Caminho
    // dedicado igual ao do valor_total_item — extrai amount + currency e envia
    // separados. Sem isso, o caminho genérico empacotava o objeto inteiro no
    // payload e o backend Zod (que espera number) rejeitava silenciosamente
    // (catch DEV mascarava), resultando em "USD —" no front (NaN render).
    if (campo === 'valor_por_unidade_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const itemAtualVu = getItensCache().find(i => i.id === id)
      const atualizadoVu = await pedidoItemApi.atualizar(pedido.id, id, {
        valor_por_unidade_item: mv.amount,
        moeda_item: mv.currency,
      } as Partial<PedidoItem>)
        .catch(() => {
          if (import.meta.env.DEV && itemAtualVu) return { ...itemAtualVu, valor_por_unidade_item: mv.amount, moeda_item: mv.currency } as PedidoItem
          throw new Error('Erro ao editar valor_por_unidade_item')
        })
      const enriquecidoVu: PedidoItemEnriquecido = {
        ...atualizadoVu,
        _p: {
          id: pedido.id,
          id_workspace: pedido.id_workspace ?? null,
          tipo_operacao: pedido.tipo_operacao,
          nome_exportador: pedido.nome_exportador ?? null,
          nome_importador: pedido.nome_importador ?? null,
          nome_fabricante: pedido.nome_fabricante ?? null,
          referencia_importador: pedido.referencia_importador ?? null,
          referencia_exportador: pedido.referencia_exportador ?? null,
          referencia_fabricante: pedido.referencia_fabricante ?? null,
          numero_proforma: pedido.numero_proforma ?? null,
          numero_invoice: pedido.numero_invoice ?? null,
          incoterm: pedido.incoterm ?? null,
          condicao_pagamento: pedido.condicao_pagamento ?? null,
          data_emissao_pedido: pedido.data_emissao_pedido ?? null,
          status: pedido.status,
          moeda_pedido: (pedido as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
        },
      }

      // Mesma lógica de recompute do caminho valor_total_item: divergências
      // + agregados locais (homogeneidade Onda A8).
      const itensAposEdicaoVu = getItensCache().map(i => i.id === id ? enriquecidoVu : i)
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoVu)
      const divergenciasVu = calcularDivergencias(itensAposEdicaoVu, pedido)
      const moedasContribVu = new Set(
        itensAposEdicaoVu
          .filter(i => Number(i.valor_total_item ?? 0) > 0 && i.moeda_item)
          .map(i => i.moeda_item as string)
      )
      const unidadesContribVu = new Set(
        itensAposEdicaoVu
          .filter(i => Number(i.quantidade_inicial_pedido ?? 0) > 0 && i.unidade_comercializada_item)
          .map(i => i.unidade_comercializada_item as string)
      )
      const valorTotalLocalVu = moedasContribVu.size > 1
        ? null
        : itensAposEdicaoVu.reduce((s, i) => s + (Number(i.valor_total_item) || 0), 0)
      const qtyTotalLocalVu = unidadesContribVu.size > 1
        ? null
        : itensAposEdicaoVu.reduce((s, i) => s + (Number(i.quantidade_inicial_pedido) || 0), 0)

      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasVu,
          itens: itensAposEdicaoVu,
          valor_total_pedido: valorTotalLocalVu,
          quantidade_total_pedido: qtyTotalLocalVu,
        }
      }))
      return enriquecidoVu
    }

    // quantidade_pronta_total_item_pedido → endpoint dedicado PATCH /pronta
    if (campo === 'quantidade_pronta_total_item_pedido') {
      const isUnidade = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)
      const qtd = isUnidade ? (valor as { quantity: number }).quantity : Number(valor) || 0
      const novaUnidade = isUnidade ? (valor as { unit: string }).unit : undefined
      const itemAtualPronta = getItensCache().find(i => i.id === id)
      const unidadeMudou = !!(novaUnidade && itemAtualPronta && itemAtualPronta.unidade_comercializada_item !== novaUnidade)

      // Se o usuário trocou a unidade junto com a qty, persiste a nova unidade
      // ANTES via PUT no item (PATCH /pronta só aceita qty — descarta unit).
      // Mesmo padrão aplicado a peso/cubagem: unidade do item deve persistir.
      if (unidadeMudou) {
        await pedidoItemApi.atualizar(pedido.id, id, { unidade_comercializada_item: novaUnidade } as Partial<PedidoItem>)
          .catch(() => {
            if (!import.meta.env.DEV) throw new Error('Erro ao atualizar unidade do item')
          })
      }

      const atualizadoPronta = await pedidoItemApi.atualizarPronta(pedido.id, id, qtd)
        .catch(() => {
          if (import.meta.env.DEV && itemAtualPronta) return { ...itemAtualPronta, quantidade_pronta_total_item_pedido: qtd, unidade_comercializada_item: novaUnidade ?? itemAtualPronta.unidade_comercializada_item } as PedidoItem
          throw new Error('Erro ao atualizar quantidade pronta')
        })
      // Garante que a unidade persistida via PUT acima esteja no objeto retornado
      // (atualizarPronta devolve apenas o item — pode não refletir a unidade nova).
      const itemComUnidade: PedidoItem = unidadeMudou && novaUnidade
        ? { ...atualizadoPronta, unidade_comercializada_item: novaUnidade }
        : atualizadoPronta
      const enriquecidoPronta: PedidoItemEnriquecido = {
        ...itemComUnidade,
        _p: {
          id: pedido.id,
          id_workspace: pedido.id_workspace ?? null,
          tipo_operacao: pedido.tipo_operacao,
          nome_exportador: pedido.nome_exportador ?? null,
          nome_importador: pedido.nome_importador ?? null,
          nome_fabricante: pedido.nome_fabricante ?? null,
          referencia_importador: pedido.referencia_importador ?? null,
          referencia_exportador: pedido.referencia_exportador ?? null,
          referencia_fabricante: pedido.referencia_fabricante ?? null,
          numero_proforma: pedido.numero_proforma ?? null,
          numero_invoice: pedido.numero_invoice ?? null,
          incoterm: pedido.incoterm ?? null,
          condicao_pagamento: pedido.condicao_pagamento ?? null,
          data_emissao_pedido: pedido.data_emissao_pedido ?? null,
          status: pedido.status,
          moeda_pedido: (pedido as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
        },
      }
      const itensAposEdicao = getItensCache().map(i => i.id === id ? enriquecidoPronta : i)
      itensCarregadosRef.current.set(pedido.id, itensAposEdicao)
      // Recalcula divergencias: se unidade mudou e divergem entre itens, a flag
      // `unidade_comercializada_item_divergente` é setada e a coluna mostra o
      // alerta "⚠ Unidades divergentes entre itens" via renderQtdPedido.
      const divergenciasPronta = calcularDivergencias(itensAposEdicao, pedido)
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasPronta,
          itens: itensAposEdicao,
          quantidade_pronta_itens_pedido_total: itensAposEdicao.reduce((s, i) => s + (Number(i.quantidade_pronta_total_item_pedido) || 0), 0),
        }
      }))
      return enriquecidoPronta
    }

    // ── Colunas customizadas do usuário ──────────────────────────────────────
    // BUG fix 2026-05-13 (Coordenador+Líder aprovaram):
    //   Versão anterior sobrescrevia `_colunas_usuario` do PEDIDO PAI com o valor
    //   do filho (linha `_colunas_usuario: novasColunas` no spread do pedido) E
    //   espalhava o valor em TODOS os itens em vez de só no `id` editado.
    //   Resultado: pedido pai perdia suas colunas, e o item correto nem recebia
    //   o valor de forma estável.
    //
    //   Versão correta abaixo:
    //   - vinculo='pedido' → atualiza só `_colunas_usuario` do PAI, NÃO toca em itens
    //   - vinculo='item'   → atualiza só `_colunas_usuario` do ITEM com `i.id === id`,
    //                        NÃO toca no PAI nem nos outros itens
    const colunaCustomFilho = colunasUsuario.find(c => c.chave === campo)
    if (colunaCustomFilho) {
      // BUG fix 2026-05-13 (parte 2): a versão anterior tratava `escopo='ambos'`
      // como pedido-level mesmo quando o usuário editava na LINHA DO ITEM.
      // Como esse handler é exatamente o de edição na linha do item, a regra
      // correta é: se a coluna ACEITA valores por item ('item' ou 'ambos'),
      // grava no nível do item (vinculo='item', id=item.id). Caso contrário
      // (escopo='pedido' apenas), grava no nível do pedido — embora o ideal
      // seria a coluna nem ser editável na linha do item neste cenário.
      const escopoFilho = colunaCustomFilho.escopo || 'ambos'
      const aceitaPorItem = escopoFilho === 'item' || escopoFilho === 'ambos'
      const vinculo: 'pedido' | 'item' = aceitaPorItem ? 'item' : 'pedido'
      const vinculoId = vinculo === 'item' ? id : pedido.id
      await colunasUsuarioApi.salvarValores(vinculo, vinculoId, { [colunaCustomFilho.id]: String(valor) })

      // Atualiza cache ref usado por handleEditarFilho (não-reativo) para refletir
      // o novo valor imediatamente — sem isso, o próximo click na mesma linha
      // perderia a edição local.
      if (vinculo === 'item') {
        const cache = itensCarregadosRef.current.get(pedido.id) ?? []
        const cacheAtualizado = cache.map(i => {
          if (i.id !== id) return i
          const colunasAntes = (i as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
          return { ...i, _colunas_usuario: { ...colunasAntes, [colunaCustomFilho.id]: String(valor) } }
        })
        itensCarregadosRef.current.set(pedido.id, cacheAtualizado)
      }

      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        if (vinculo === 'pedido') {
          const colunasAntesPai = (p as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
          return {
            ...p,
            _colunas_usuario: { ...colunasAntesPai, [colunaCustomFilho.id]: String(valor) },
          }
        }
        // vinculo === 'item' — atualiza o item editado + recalcula divergências no pai
        const itensAtualizados = (p.itens ?? []).map(i => {
          if (i.id !== id) return i
          const colunasAntesItem = (i as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
          return { ...i, _colunas_usuario: { ...colunasAntesItem, [colunaCustomFilho.id]: String(valor) } }
        })
        const itensDivCache = itensCarregadosRef.current.get(pedido.id) ?? itensAtualizados
        const divergenciasFilho = itensDivCache.length > 0 ? calcularDivergencias(itensDivCache as PedidoItem[], p) : {}
        return {
          ...p,
          ...divergenciasFilho,
          itens: itensAtualizados,
        }
      }))

      const item = getItensCache().find(i => i.id === id)!
      const colunasAtuais = (item as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
      return { ...item, _colunas_usuario: { ...colunasAtuais, [colunaCustomFilho.id]: String(valor) } } as PedidoItem
    }

    let payload: Partial<PedidoItem>
    {
      // Normaliza datas para ISO antes de enviar ao servidor
      if (campo === 'data_emissao_pedido') {
        const isoData = normalizarDataISO(valor)
        const itemAtualData = getItensCache().find(i => i.id === id)
        const atualizadoData = await pedidoItemApi.editarCampo(pedido.id, id, campo, isoData)
          .catch(() => {
            if (import.meta.env.DEV && itemAtualData) return { ...itemAtualData, data_emissao_pedido: isoData } as PedidoItem
            throw new Error('Erro ao salvar data')
          })
        const enriquecidoData: PedidoItemEnriquecido = {
          ...atualizadoData,
          _p: (getItensCache().find(i => i.id === id) as PedidoItemEnriquecido)?._p ?? (atualizadoData as PedidoItemEnriquecido)._p,
        }
        setPedidos(prev => prev.map(p => {
          if (p.id !== pedido.id) return p
          return { ...p, itens: p.itens?.map(i => i.id === id ? enriquecidoData : i) }
        }))
        return enriquecidoData
      }

      // GTValorUnidade { unit, quantity } → extrai quantity para campos numéricos + salva unidade
      const isUnidade = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)
      // Fatores de conversão para kg (todos os campos de peso são persistidos em kg)
      const FATOR_PARA_KG: Record<string, number> = { 'KG': 1, 'G': 0.001, 'TON': 1000, 'KGBR': 1 }
      const CAMPOS_PESO_ITEM = new Set(['peso_liquido_unitario', 'peso_bruto_unitario'])
      const valorFinal: unknown = CAMPOS_NUMERICOS_ITEM.has(campo)
        ? (() => {
            const qty = isUnidade ? (valor as { quantity: number }).quantity : Number(valor) || 0
            if (CAMPOS_PESO_ITEM.has(campo) && isUnidade) {
              const unit = (valor as { unit: string }).unit
              return qty * (FATOR_PARA_KG[unit] ?? 1)
            }
            return qty
          })()
        : valor
      payload = { [campo]: valorFinal } as Partial<PedidoItem>
      if (isUnidade && !CAMPOS_UNIDADE_FIXA_ITEM.has(campo)) {
        // Salva a unidade comercializada junto com a quantidade (apenas campos com unidade variável)
        ;(payload as Record<string, unknown>).unidade_comercializada_item = (valor as { unit: string }).unit
      }
      // Salva a unidade de exibição para campos de peso (valor é persistido em KG).
      // Espelhamento (decisão UX 2026-05-13): peso líquido e peso bruto do
      // MESMO item devem ter sempre a mesma unidade — não faz sentido mostrar
      // "1,5 ton" de bruto e "1500 kg" de líquido lado a lado. Quando o
      // usuário troca a unidade em qualquer um dos dois, gravamos os DOIS
      // campos com o mesmo valor no payload — backend persiste ambos atomicamente.
      if (isUnidade && CAMPOS_PESO_ITEM.has(campo)) {
        const novaUnidade = (valor as { unit: string }).unit
        ;(payload as Record<string, unknown>).peso_liquido_unidade_item = novaUnidade
        ;(payload as Record<string, unknown>).peso_bruto_unidade_item   = novaUnidade
      }
      // Cubagem: aceita 1D/2D/3D (CM/M/CM2/M2/ML/LT/M3 — decisão UX 2026-05-12).
      // Sem conversão numérica entre dimensões; valor é persistido como digitado
      // e a unidade fica em cubagem_unidade_item.
      if (isUnidade && campo === 'cubagem_unitaria') {
        ;(payload as Record<string, unknown>).cubagem_unidade_item = (valor as { unit: string }).unit
      }
    }

    const itemAtual = getItensCache().find(i => i.id === id)
    const atualizado = await pedidoItemApi.atualizar(pedido.id, id, payload)
      .catch(() => {
        if (import.meta.env.DEV) {
          if (itemAtual) return { ...itemAtual, ...payload } as PedidoItem
        }
        throw new Error(`Erro ao editar campo ${campo}`)
      })

    // Persiste o total do pedido pai no servidor (fire-and-forget) quando um campo de peso muda
    if (campo === 'peso_liquido_unitario') {
      pedidoVirtualApi.editarCampo(pedido.id, 'peso_liquido_total_pedido', null).catch(() => {})
    }
    if (campo === 'peso_bruto_unitario') {
      pedidoVirtualApi.editarCampo(pedido.id, 'peso_bruto_total_pedido', null).catch(() => {})
    }
    if (campo === 'cubagem_unitaria') {
      pedidoVirtualApi.editarCampo(pedido.id, 'cubagem_total_pedido', null).catch(() => {})
    }

    // Re-enriquece o item com os dados do pedido pai (_p) para manter o cache íntegro
    const enriquecido: PedidoItemEnriquecido = {
      ...atualizado,
      _p: {
        id: pedido.id,
        id_workspace: pedido.id_workspace ?? null,
        tipo_operacao: pedido.tipo_operacao,
        nome_exportador: pedido.nome_exportador ?? null,
        nome_importador: pedido.nome_importador ?? null,
        nome_fabricante: pedido.nome_fabricante ?? null,
        referencia_importador: pedido.referencia_importador ?? null,
        referencia_exportador: pedido.referencia_exportador ?? null,
        referencia_fabricante: pedido.referencia_fabricante ?? null,
        numero_proforma: pedido.numero_proforma ?? null,
        numero_invoice: pedido.numero_invoice ?? null,
        incoterm: pedido.incoterm ?? null,
        condicao_pagamento: pedido.condicao_pagamento ?? null,
        data_emissao_pedido: pedido.data_emissao_pedido ?? null,
        status: pedido.status,
        moeda_pedido: (pedido as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
      },
    }

    // Atualiza cache e recalcula os aggregates do pedido pai
    const itensAposEdicao = getItensCache().map(i => i.id === id ? enriquecido : i)
    itensCarregadosRef.current.set(pedido.id, itensAposEdicao)
    const divergencias = calcularDivergencias(itensAposEdicao, pedido)
    setPedidos(prev => prev.map(p => {
      if (p.id !== pedido.id) return p
      return {
        ...p,
        ...divergencias,
        itens: itensAposEdicao,
        quantidade_total_pedido: itensAposEdicao.reduce((s, i) => s + (Number(i.quantidade_inicial_pedido) || 0), 0),
        quantidade_transferida_total:    itensAposEdicao.reduce((s, i) => s + (Number(i.quantidade_transferida_pedido)    || 0), 0),
        peso_liquido_total_pedido:       itensAposEdicao.reduce((s, i) => s + (Number(i.peso_liquido_unitario) || 0), 0),
        peso_bruto_total_pedido:         itensAposEdicao.reduce((s, i) => s + (Number(i.peso_bruto_unitario)  || 0), 0),
        cubagem_total_pedido:            itensAposEdicao.reduce((s, i) => s + (Number(i.cubagem_unitaria)     || 0), 0),
      }
    }))
    return enriquecido
  }, [pedidos])

  // ── Carregar filhos (itens do pedido) ────────────────────────────────────────
  const handleCarregarFilhos = useCallback(async (pedido: Pedido): Promise<PedidoItem[]> => {
    // BUG fix 2026-05-13: removida atribuição `_colunas_usuario: parentColunas`.
    // Sobrescrever `_colunas_usuario` do ITEM com o do PAI é incorreto —
    // colunas de escopo='item' têm valores PRÓPRIOS por id_item. O backend agora
    // injeta o `_colunas_usuario` correto em cada item (GET /:id/itens + init),
    // então só preservamos o que veio da rede via spread `...item`.
    // Init e paginação já incluem itens no pedido. Só busca via API se não vieram carregados.
    const rawItens = (pedido.itens?.length ?? 0) > 0
      ? pedido.itens
      : await pedidoItemApi.listar(pedido.id)
    const itensEnriquecidos = rawItens.map(item => ({
      ...item,
      _p: {
        id: pedido.id,
        id_workspace: pedido.id_workspace ?? null,
        tipo_operacao: pedido.tipo_operacao,
        nome_exportador: item.nome_exportador ?? pedido.nome_exportador ?? null,
        nome_importador: item.nome_importador ?? pedido.nome_importador ?? null,
        nome_fabricante: pedido.nome_fabricante ?? null,
        referencia_importador: item.referencia_importador ?? pedido.referencia_importador ?? null,
        referencia_exportador: item.referencia_exportador ?? pedido.referencia_exportador ?? null,
        referencia_fabricante: item.referencia_fabricante ?? pedido.referencia_fabricante ?? null,
        numero_proforma: pedido.numero_proforma ?? null,
        numero_invoice: pedido.numero_invoice ?? null,
        incoterm: pedido.incoterm ?? null,
        condicao_pagamento: pedido.condicao_pagamento ?? null,
        data_emissao_pedido: pedido.data_emissao_pedido ?? null,
        status: pedido.status,
        moeda_pedido: pedido.moeda_pedido ?? 'USD',
      },
    }))
    // Popula cache para handleEditarFilho (não-reativo, evita re-loads em useGTExpandir)
    itensCarregadosRef.current.set(pedido.id, itensEnriquecidos)
    // Atualiza pedidos state com itens carregados + recalcula aggregates e divergências.
    // Isso habilita alertas de peso (unidades mistas), renderQtdPedido (soma por unidade)
    // e qualquer outra lógica que depende de row.itens na renderização do pai.
    const divergencias = calcularDivergencias(itensEnriquecidos, pedido)
    setPedidos(prev => prev.map(p => {
      if (p.id !== pedido.id) return p
      return {
        ...p,
        ...divergencias,
        itens: itensEnriquecidos,
        quantidade_total_pedido: itensEnriquecidos.reduce((s, i) => s + (Number(i.quantidade_inicial_pedido) || 0), 0),
        quantidade_transferida_total:    itensEnriquecidos.reduce((s, i) => s + (Number(i.quantidade_transferida_pedido) || 0), 0),
        peso_liquido_total_pedido:       itensEnriquecidos.reduce((s, i) => s + (Number(i.peso_liquido_unitario) || 0), 0),
        peso_bruto_total_pedido:         itensEnriquecidos.reduce((s, i) => s + (Number(i.peso_bruto_unitario) || 0), 0),
        cubagem_total_pedido:            itensEnriquecidos.reduce((s, i) => s + (Number(i.cubagem_unitaria) || 0), 0),
      }
    }))
    return itensEnriquecidos
  }, [])

  // ── Salvar preferências ──────────────────────────────────────────────────────
  const pedidoItemVersion = useCallback((p: Pedido) => p.updated_at, [])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    pedidoConfigApi.salvarPreferenciaUsuarioColunaPedido({
      colunas_visiveis: prefs.colunas_visiveis,
    }).catch(() => { /* silent — preferências ficam localmente */ })
  }, [])

  // ── Ações em lote ─────────────────────────────────────────────────────────────

  // ── Config de exportação (lida do localStorage — mesmas preferências de Configurações) ──
  // ── Lê config de exportação fresco no momento do clique (não cache stale) ──
  function lerExportConfig() {
    try {
      const raw = localStorage.getItem('pedido:export_config')
      if (raw) return JSON.parse(raw) as {
        formatoPadrao: 'csv' | 'xlsx' | 'pdf'
        incluirColunasUsuario: boolean
        incluirItens: boolean
        apenasSelection: boolean
        incluirCabecalho: boolean
        separadorCsv: 'virgula' | 'ponto-virgula' | 'tab'
      }
    } catch { /* ignore */ }
    return { formatoPadrao: 'xlsx' as const, incluirColunasUsuario: true, incluirItens: true, apenasSelection: false, incluirCabecalho: true, separadorCsv: 'ponto-virgula' as const }
  }

  function buildDadosExport() {
    const cfg = lerExportConfig()
    const base = cfg.apenasSelection && pedidosSelecionados.length > 0
      ? pedidosSelecionados
      : pedidosFiltrados

    const colunasExport: ColunasExport[] = [
      ...COLUNAS_EXPORT,
      ...(cfg.incluirColunasUsuario
        ? colunasUsuario.map(c => ({ header: c.nome, key: c.chave, largura: 18 }))
        : []),
    ]

    const sepMap = { virgula: ',' as const, 'ponto-virgula': ';' as const, tab: '\t' as const }
    const sep = sepMap[cfg.separadorCsv] ?? ','

    let dados: Record<string, unknown>[]
    if (cfg.incluirItens) {
      dados = base.flatMap(p => {
        const pai = p as unknown as Record<string, unknown>
        const itensDoPedido = (p.itens ?? []).map((i, _idx) => ({
          ...pai,
          _tipo_linha: 'Item',
          numero_item: i.part_number ?? '',
          part_number: i.part_number,
          descricao_item: i.descricao_item,
          ncm: i.ncm,
          quantidade_item: i.quantidade_atual_pedido,
          quantidade_inicial_item: i.quantidade_inicial_pedido,
          valor_item: i.valor_total_item,
        }))
        return itensDoPedido.length > 0
          ? [{ ...pai, _tipo_linha: 'Pedido', numero_item: '' }, ...itensDoPedido]
          : [{ ...pai, _tipo_linha: 'Pedido' }]
      })
    } else {
      dados = base.map(p => ({ ...(p as unknown as Record<string, unknown>), _tipo_linha: 'Pedido' }))
    }

    // Aplica fmtData em todas as colunas de data — colunas estáticas (data_*) e
    // colunas customizadas do usuário com tipo 'data' — exportação formata igual à tabela
    const chavesDataCustom = new Set(
      colunasUsuario.filter(c => c.tipo === 'data').map(c => c.chave)
    )
    const CHAVES_DATA = colunasExport.map(c => c.key).filter(k =>
      k.startsWith('data_') || chavesDataCustom.has(k)
    )
    if (CHAVES_DATA.length > 0) {
      dados = dados.map(row => {
        const copia: Record<string, unknown> = { ...row }
        for (const k of CHAVES_DATA) {
          const val = row[k]
          if (val && typeof val === 'string') copia[k] = fmtData(val)
        }
        return copia
      })
    }

    return { cfg, dados, colunasExport, sep }
  }

  // ── Ações de exportação (client-side) ────────────────────────────────────────
  const acoesExportacao = useMemo((): GTAcaoExport[] => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarExcel(dados, colunasExport, { nomeArquivo: 'pedidos', titulo: 'Pedidos' })
      },
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { cfg, dados, colunasExport, sep } = buildDadosExport()
        exportarCSV(dados, colunasExport, { nomeArquivo: 'pedidos', semCabecalho: !cfg.incluirCabecalho, separadorCsv: sep })
      },
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { cfg, dados, colunasExport } = buildDadosExport()
        exportarTXT(dados, colunasExport, { nomeArquivo: 'pedidos', semCabecalho: !cfg.incluirCabecalho })
      },
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarXML(dados, colunasExport, { nomeArquivo: 'pedidos' })
      },
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarJSON(dados, colunasExport, { nomeArquivo: 'pedidos' })
      },
    },
    {
      label: 'PDF',
      icone: <FilePdf size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        void exportarPDF(dados, colunasExport, { nomeArquivo: 'pedidos', titulo: 'Pedidos' })
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [pedidos, pedidosFiltrados, pedidosSelecionados, colunasUsuario])

  // ── Stats para KPIs ──────────────────────────────────────────────────────────
  // Number() obrigatório: Prisma Decimal serializa como string no JSON
  const valorTotal    = pedidos.reduce((acc, p) => acc + (Number(p.valor_total_pedido) || 0), 0)
  const qtdTotal      = pedidos.reduce((acc, p) => acc + (Number(p.quantidade_total_pedido) || 0), 0)
  const todosItens    = pedidos.flatMap(p => p.itens ?? [])
  // Com list view otimizada, itens são carregados sob demanda — usar campos pré-computados do pedido
  const itensProntos  = pedidos.reduce((acc, p) => acc + (Number((p as Pedido & { quantidade_pronta_itens_pedido_total?: number }).quantidade_pronta_itens_pedido_total) || 0), 0)
  const qtdAtualTotal = pedidos.reduce((acc, p) => {
    // saldo = inicial - pronta - cancelada (pré-computado pelo mapPedidoListView via itensMinimos)
    const pronta     = Number((p as Pedido & { quantidade_pronta_itens_pedido_total?: number }).quantidade_pronta_itens_pedido_total) || 0
    const cancelada  = Number((p as Pedido & { quantidade_cancelada_total_pedido?: number }).quantidade_cancelada_total_pedido) || 0
    const inicial    = Number(p.quantidade_total_pedido) || 0
    return acc + Math.max(0, inicial - pronta - cancelada)
  }, 0)
  // Breakdown de quantidade por unidade (para tooltip do card)
  const qtdPorUnidade: Record<string, number> = {}
  const qtdSaldoPorUnidade: Record<string, number> = {}
  for (const item of todosItens) {
    const un = (item as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
    qtdPorUnidade[un] = (qtdPorUnidade[un] ?? 0) + (Number(item.quantidade_inicial_pedido) || 0)
    qtdSaldoPorUnidade[un] = (qtdSaldoPorUnidade[un] ?? 0) + (Number(item.quantidade_atual_pedido) || 0)
  }
  const unidadesQtd = Object.keys(qtdPorUnidade)
  const coberturaPend = pedidos
    .filter(p => (p.itens ?? []).some(i => i.cobertura_cambial === 'sem_cobertura'))
    .reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)
  // Valor total convertido para BRL usando taxa PTAX de venda
  // Number() necessário pois Prisma Decimal serializa como string no JSON
  const valorTotalBrl = pedidos.reduce((acc, p) => {
    const moeda = p.moeda_pedido ?? 'USD'
    const taxa  = taxasVenda[moeda] ?? taxasVenda['USD'] ?? 1
    return acc + Number(p.valor_total_pedido ?? 0) * taxa
  }, 0)
  // Stats computadas pelo registry (usadas como fallback no map de cards)
  const cardStats = computeCardStats(pedidos, todosItens as PedidoItem[], total, new Date().toISOString().slice(0, 10), totalItensBanco)

  return (
    <div className="ws-fade-up lp-page">

      {/* ── GABI Token Badge — exibe consumo mensal quando quota estiver configurada ── */}
      {gabiQuota && gabiQuota.quota_mensal > 0 && (
        <div style={{ position: 'fixed', top: '0.75rem', right: '1rem', zIndex: 500 }}>
          <GabiTokenBadge tokensUsados={gabiQuota.tokens_usados} quotaMensal={gabiQuota.quota_mensal} />
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          {cardsVisiveis.map(pref => {
            if (pref.id === 'total_pedidos') return (
              <CardBasicoGlobal key="total_pedidos"
                titulo={t('pedido.total_pedidos')}
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
                valor={total}
                subtexto={`${totalItensBanco > 0 ? totalItensBanco : todosItens.length} ${t('pedido.itens_total')}`}
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
                valor={fmtQuantidade(valorTotal, 2)}
                variante="sucesso"
                subtexto={t('pedido.soma_pedidos')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_por_pedido')}</span><strong>{fmtQuantidade(pedidos.length ? valorTotal / pedidos.length : 0, 2)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'valor_total_brl') {
              // Number() evita concatenação de string Decimal do Prisma
              const porMoeda: Record<string, number> = {}
              for (const p of pedidos) {
                const m = p.moeda_pedido ?? 'USD'
                porMoeda[m] = (porMoeda[m] ?? 0) + Number(p.valor_total_pedido ?? 0)
              }
              const MOEDA_ORDEM = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CHF', 'CAD']
              const entradas = Object.entries(porMoeda).sort(([a], [b]) => {
                const ia = MOEDA_ORDEM.indexOf(a); const ib = MOEDA_ORDEM.indexOf(b)
                return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
              })
              return (
                <CardBasicoGlobal key="valor_total_brl"
                  titulo="Total Pedidos — BRL"
                  icone={<CurrencyCircleDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                  valor={`R$ ${fmtQuantidade(valorTotalBrl, 2)}`}
                  variante="sucesso"
                  subtexto="Todos os pedidos convertidos para R$"
                  tooltip={<>
                    {entradas.map(([m, v]) => {
                      const taxa = taxasVenda[m]
                      return (
                        <p key={m} className="cg-tooltip__row">
                          <span>{m} {fmtQuantidade(Number(v), 2)}</span>
                          <strong>{taxa != null ? `× ${fmtQuantidade(taxa, 4)}` : '— sem taxa'}</strong>
                        </p>
                      )
                    })}
                  </>}
                />
              )
            }
            if (pref.id === 'qtd_total') {
              const unicaUnidade = unidadesQtd.length === 1 ? unidadesQtd[0] : null
              return (
                <CardBasicoGlobal key="qtd_total"
                  titulo={t('pedido.qtd_total')}
                  icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                  valor={unicaUnidade ? `${fmtQuantidade(qtdTotal)} ${unicaUnidade}` : fmtQuantidade(qtdTotal)}
                  variante="aviso"
                  subtexto={`${fmtQuantidade(qtdAtualTotal)} ${t('pedido.saldo_atual')}`}
                  tooltip={<>
                    {unidadesQtd.length > 1
                      ? unidadesQtd.map(un => (
                          <p key={un} className="cg-tooltip__row">
                            <span>{fmtQuantidade(qtdPorUnidade[un])} {un}</span>
                            <strong>{fmtQuantidade(qtdSaldoPorUnidade[un])} saldo</strong>
                          </p>
                        ))
                      : <>
                          <p className="cg-tooltip__row"><span>{t('pedido.pronto')}</span><strong>{fmtQuantidade(itensProntos)}{unicaUnidade ? ` ${unicaUnidade}` : ''}</strong></p>
                          <p className="cg-tooltip__row"><span>{t('pedido.saldo_vivo')}</span><strong>{fmtQuantidade(qtdAtualTotal)}{unicaUnidade ? ` ${unicaUnidade}` : ''}</strong></p>
                        </>
                    }
                  </>}
                />
              )
            }
            if (pref.id === 'cobertura_pendente') return (
              <CardBasicoGlobal key="cobertura_pendente"
                titulo={t('pedido.cobertura_pendente')}
                icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
                valor={fmtQuantidade(coberturaPend, 2)}
                variante="erro"
                subtexto={t('pedido.sem_cobertura')}
                tooltip={<p className="cg-tooltip__row"><span>{t('pedido.aguardando_cobertura')}</span><strong>{pedidos.filter(p => (p.itens ?? []).some(i => (i as PedidoItem & { cobertura_cambial?: string }).cobertura_cambial === 'sem_cobertura')).length}</strong></p>}
              />
            )
            // Fallback: cards definidos no CARD_REGISTRY mas sem bloco manual acima
            const registryEntry = CARD_REGISTRY[pref.id]
            if (registryEntry) {
              const def = CARDS_CATALOGO.find(c => c.id === pref.id)
              const titulo = def ? t(def.labelKey) : pref.id
              const valor = registryEntry.format(registryEntry.getValue(cardStats))
              return (
                <CardBasicoGlobal key={pref.id}
                  titulo={titulo}
                  icone={registryEntry.icone}
                  valor={valor}
                  variante={registryEntry.variante}
                  subtexto={registryEntry.subtexto(cardStats)}
                  tooltip={registryEntry.tooltip(pedidos, cardStats)}
                />
              )
            }
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

      {/* ── Popovers de filtro (renderizados no nível do page para z-index correto) ── */}
      {popoverAberto && (() => {
        const col = colunasPai.find(c => c.key === popoverAberto)
        if (!col) return null
        const anchorRef = getAnchorRef(popoverAberto)
        return (
          <FiltroPopoverColuna
            campo={col.key}
            label={col.label}
            tipo={detectarTipoColunaPedido(col)}
            filtroAtual={filtrosAtivos[col.key]}
            valoresUnicos={valoresUnicosPorCampo[col.key] ?? []}
            onAplicar={handleAplicarFiltro}
            onLimpar={handleLimparFiltro}
            onOrdenar={handleOrdenar}
            onFechar={() => setPopoverAberto(null)}
            anchorRef={anchorRef}
            labelInverso={LABELS_FILTRO_INVERSO[col.key]}
          />
        )
      })()}

      {/* ── Tabela virtual ── */}
      <div className="lp-tabela-wrapper">
        <TabelaVirtualGlobal<Pedido, PedidoItem>
          imperativeRef={tabelaRef}
          dados={pedidosFiltrados}
          colunas={colunasComUsuario}
          itemId={pedidoItemId}

          mapaColunasFilho={mapaColunasFilho}
          onCarregarFilhos={handleCarregarFilhos}
          onExpandidosMudar={(count) => setTemExpandido(count > 0)}
          itemVersion={pedidoItemVersion}
          filhoId={pedidoFilhoId}
          renderConectorFilho={pedidoRenderConectorFilho}
          itensPorPagina={ITENS_POR_PAGINA}
          totalItens={total}
          paginaAtual={paginaAtual}
          onMudarPagina={handleMudarPagina}
          labelPai={['pedido', 'pedidos']}
          totalFilhos={todosItens.length}

          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={handleMudarAba}

          acoes={acoesPai}
          acoesExportacao={acoesExportacao}
          onSelecaoMudar={setPedidosSelecionados}
          onFiltroColuna={onFiltroColuna}
          filtrosAtivosKeys={filtrosAtivosKeys}

          selecionavelFilhos
          onSelecaoFilho={onSelecaoFilhoEstavel}
          resetSelecaoFilhos={resetFilhos}
          acoesFilho={acoesFilhoEstavel}

          acoesBarra={acoesBarra}

          onBuscar={handleBuscar}
          modoLocalizar={true}
          onFindProximaPagina={
            paginaAtual < Math.ceil(total / ITENS_POR_PAGINA)
              ? () => handleMudarPagina(paginaAtual + 1)
              : undefined
          }
          onFindPaginaAnterior={
            paginaAtual > 1
              ? () => handleMudarPagina(paginaAtual - 1)
              : undefined
          }
          onFindTermoChange={handleFindTermoChange}
          findTotalExterno={findTotalExterno}
          placeholderBusca={t('pedido.barra.placeholder_busca')}
          placeholderData={getPlaceholderData()}
          onOrdenar={handleOrdenar}
          sortCampo={sortCampo}
          sortDir={sortDir}

          camposEditaveis={CAMPOS_EDITAVEIS_PAI}
          mensagemSemPermissaoEditar={!podeEditarLista ? 'Sem permissão para editar' : undefined}
          onEditar={podeEditarLista ? async (id: string, campo: string, valor: unknown, opts) => {
            let idReal = id;
            if (!pedidosFiltrados.some(p => p.id === idReal)) {
               const pedidoCerto = pedidosFiltrados.find(p => p.numero_pedido === idReal || (p as any)._idVirtual === idReal);
               if (pedidoCerto) idReal = pedidoCerto.id;
            }
            return handleEditar(idReal, campo, valor, opts);
          } : undefined}
          permiteReplicacaoPaiEmItens={podeEditarLista ? (campo) => {
            const COLUNAS_SEM_REPLICACAO = new Set([
              'numero_pedido',
              'valor_total_pedido',
              'valor_por_unidade_item',
              'valor_total_cambio_pedido',
              'quantidade_total_pedido',
              'saldo_itens_do_pedido',
              'quantidade_transferida_total',
              'quantidade_volumes_pedido',
            ])
            return !COLUNAS_SEM_REPLICACAO.has(campo)
          } : undefined}

          camposEditaveisFilhos={camposEditaveisFilhosComCustom}
          onEditarFilho={podeEditarLista ? handleEditarFilho : undefined}

          onSalvoComSucesso={() => addNotification({ type: 'success', message: 'Campo atualizado com sucesso.' })}
          onErroAoSalvar={(msg) => addNotification({ type: 'error', message: mensagemErro(msg) })}

          arrastavelPai
          onReordenarPai={handleReordenarPedidos}
          arrastavelFilho
          onReordenarFilho={handleReordenarItens}
          onOrdemManualResetada={() => addNotification({ type: 'info', message: 'Ordem manual dos pedidos foi resetada pela ordenação por coluna.' })}

          preferencias={preferencias}
          onSalvarPreferencias={handleSalvarPreferencias}
          colunasPadrao={COLUNAS_PADRAO_VISIVEIS}

          carregando={carregando}
          emptyIcon={
            erroCarga
              ? <Warning size={40} weight="duotone" style={{ color: 'var(--color-error, #ef4444)' }} />
              : <Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />
          }
          emptyTitle={
            erroCarga
              ? t('pedido.vazio_erro')
              : (busca || Object.keys(filtrosAtivos).length > 0)
                ? t('pedido.vazio_filtro')
                : t('pedido.vazio_inicial')
          }
          emptyDescription={
            erroCarga
              ? t('pedido.vazio_erro_desc')
              : (busca || Object.keys(filtrosAtivos).length > 0)
                ? t('pedido.vazio_filtro_desc')
                : t('pedido.vazio_inicial_desc')
          }
          emptyAction={
            erroCarga ? (
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={<ArrowsClockwise size={14} weight="bold" />}
                onClick={() => carregarInicial()}
              >
                {t('pedido.tentar_novamente')}
              </BotaoGlobal>
            ) : (busca || Object.keys(filtrosAtivos).length > 0) ? (
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={<X size={14} weight="bold" />}
                onClick={handleLimparTodosFiltros}
              >
                {t('pedido.limpar_filtros')}
              </BotaoGlobal>
            ) : (
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={<Plus size={14} weight="bold" />}
                onClick={() => setModalNovoPedidoAberto(true)}
              >
                {t('pedido.novo_pedido')}
              </BotaoGlobal>
            )
          }

          ariaLabel="Lista de pedidos"
        />
      </div>

      {/* ── Modal Criar Novo Pedido (wizard 2 passos) ── */}
      <ModalNovoPedido
        aberto={modalNovoPedidoAberto}
        onFechar={() => setModalNovoPedidoAberto(false)}
        onSalvo={async (pedidoCriado) => {
          setModalNovoPedidoAberto(false)
          // Reseta para página 1 — pedido recém-criado vem no topo (orderBy
          // data_criacao_pedido desc) — e abre os itens para conferência.
          await carregarInicial(abaAtiva, sortCampo, sortDir, busca, 1)
          // requestAnimationFrame garante que setPedidos já comitou antes do
          // expandir tentar localizar a linha em dadosRef.
          requestAnimationFrame(() => {
            if (pedidoCriado?.id) tabelaRef.current?.expandir(pedidoCriado.id)
          })
        }}
      />

      {/* ── Modal Novo Item (adicionar item a pedido existente) ── */}
      <ModalNovoItemPedido
        aberto={modalNovoItemAberto}
        onFechar={() => setModalNovoItemAberto(false)}
        onSalvo={async (itemCriado) => {
          setModalNovoItemAberto(false)
          await carregarInicial()
          // Abre o pedido que recebeu o item novo para conferência imediata.
          requestAnimationFrame(() => {
            if (itemCriado?.pedido_id) tabelaRef.current?.expandir(itemCriado.pedido_id)
          })
        }}
      />

      {/* ── Drawer Editar Pedido (edição — mantém abas Dados/Itens/Transferências) ── */}
      <DrawerPedido
        aberto={drawerAberto}
        pedidoId={pedidoEditandoId}
        onFechar={() => { setDrawerAberto(false); setDrawerFocusField(undefined) }}
        onSalvo={() => {
          setDrawerAberto(false)
          setDrawerFocusField(undefined)
          carregarInicial()
        }}
        initialTab={drawerInitialTab}
        focusField={drawerFocusField}
      />

      {/* ── Smart Import Modal ── */}
      <ModalSmartImportPedido
        aberto={smartImportAberto}
        onFechar={() => setSmartImportAberto(false)}
        onConcluido={async (idsCriados) => {
          setSmartImportAberto(false)
          await carregarInicial(abaAtiva, sortCampo, sortDir, busca, 1)
          // Abre o(s) pedido(s) recém-importado(s) para conferência. Se mais
          // de um, expande todos — vêm no topo via orderBy data_criacao desc.
          requestAnimationFrame(() => {
            for (const id of idsCriados ?? []) {
              tabelaRef.current?.expandir(id)
            }
          })
        }}
      />

      {/* ── Modal Transferir Quantidade ── */}
      {modalTransferir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '1.5rem', width: '400px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Transferir Quantidade — {modalTransferir.item.part_number}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Saldo disponível: <strong>{fmtQuantidade(modalTransferir.item.quantidade_atual_pedido, getCasas('quantidade_item', 0))}</strong>
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
                max={modalTransferir.item.quantidade_atual_pedido}
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
                  if (!qtd || qtd <= 0 || qtd > modalTransferir.item.quantidade_atual_pedido) return
                  console.info('[Pedido] Transferir:', { item: modalTransferir.item.id, quantidade: qtd })
                  window.alert(`✓ Transferência de ${fmtQuantidade(qtd, getCasas('quantidade_item', 0))} registrada.`)
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

      {/* ── Modal Transferir Pedidos ── */}
      {modalTransferirAberto && (pedidosSelecionados.length > 0 || itensSelecionados.length > 0) && (
        <ModalTransferirPedido
          pedidos={
            pedidosSelecionados.length > 0
              ? pedidosSelecionados
              : pedidos.filter(p => itensSelecionados.some(i => i.pedido_id === p.id))
          }
          itemIdInicial={
            itensSelecionados.length === 1
              ? itensSelecionados[0].id
              : (pedidosSelecionados.length === 1 && (itensCarregadosRef.current.get(pedidosSelecionados[0].id)?.length === 1))
                ? itensCarregadosRef.current.get(pedidosSelecionados[0].id)![0].id
                : undefined
          }
          onFechar={() => setModalTransferirAberto(false)}
          onConcluido={() => {
            setModalTransferirAberto(false)
            setPedidosSelecionados([])
            setItensSelecionados([])
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Edição em Massa ── */}
      {modalEdicaoMassaAberto && pedidosSelecionados.length > 0 && (
        <ModalEdicaoMassaPedidos
          pedidos={pedidosSelecionados}
          onFechar={() => setModalEdicaoMassaAberto(false)}
          onConcluido={() => {
            setModalEdicaoMassaAberto(false)
            setPedidosSelecionados([])
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Consolidar Pedidos ── */}
      {modalConsolidarAberto && (
        <ModalConsolidarPedidos
          pedidosSelecionados={pedidosSelecionados}
          conflito_tipo_operacao={hasMixedTipos}
          onFechar={() => setModalConsolidarAberto(false)}
          onConcluido={async () => {
            setModalConsolidarAberto(false)
            setPedidosSelecionados([])
            await carregarInicial()
          }}
        />
      )}

      {/* ── Modal Duplicar Pedidos e/ou Itens (modal único, misto) ── */}
      {modalDuplicarAberto && (pedidosSelecionados.length > 0 || itensSelecionados.length > 0) && (
        <ModalDuplicarPedidos
          pedidos={pedidosSelecionados}
          itens={itensSelecionados}
          todosPedidos={pedidos}
          onFechar={() => setModalDuplicarAberto(false)}
          onConcluido={() => {
            setModalDuplicarAberto(false)
            setPedidosSelecionados([])
            setItensSelecionados([])
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Excluir Pedidos e/ou Itens ── */}
      {modalExcluirAberto && (pedidosSelecionados.length > 0 || itensSelecionados.length > 0) && (
        <ModalPedidosExcluir
          pedidos={pedidosSelecionados}
          itens={itensSelecionados}
          pedidosMapa={new Map(pedidos.map(p => [p.id, p.numero_pedido]))}
          onFechar={() => setModalExcluirAberto(false)}
          onConcluido={() => {
            setModalExcluirAberto(false)
            setPedidosSelecionados([])
            setItensSelecionados([])
            setResetFilhos(prev => prev + 1)
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Gerar Documento PDF ── */}
      {modalGerarPdfAberto && pedidosSelecionados.length > 0 && (
        <ModalGerarPdfPedido
          pedidos={pedidosSelecionados.map(p => ({ id: p.id, numero: p.numero_pedido }))}
          onFechar={() => setModalGerarPdfAberto(false)}
          onConcluido={() => {
            setModalGerarPdfAberto(false)
          }}
        />
      )}

      {/* ── Modal Cockpit API ── */}
      {modalCockpitAberto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModalCockpitAberto(false)}
        >
          <div
            style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '1.5rem', width: '540px', maxWidth: '90vw', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--bg-elevated, #334155)', marginBottom: '1.25rem', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlugsConnected size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                    Criar Pedido via API
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Use a API do Cockpit para criar pedidos programaticamente</p>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center' }}
                onClick={() => setModalCockpitAberto(false)}
                aria-label="Fechar"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Endpoint */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                Endpoint
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--ws-accent)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>
                POST /api/v1/cockpit/pedidos
              </code>
            </div>

            {/* Auth */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                Autenticação
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)', whiteSpace: 'pre' }}>
                {`Authorization: Bearer gravity_token_api_producao_...`}
              </code>
            </div>

            {/* Payload */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                Exemplo de Payload
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.875rem', fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)', whiteSpace: 'pre', lineHeight: 1.6, overflowX: 'auto' }}>
                {`{
  "tipo_operacao_pedido": "importacao",
  "numero_pedido": "PO-2026-001",
  "suid_importador": "empresa_da_org_abc",
  "suid_exportador": "empresa_estrangeira_xyz",
  "incoterm_pedido": "FOB",
  "data_emissao_pedido": "2026-04-04",
  "itens": [
    {
      "part_number_item": "ABC-001",
      "descricao_item": "Produto exemplo",
      "quantidade_inicial_item": 100
    }
  ]
}`}
              </code>
            </div>

            {/* Nota */}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', border: '1px solid var(--border-subtle)', margin: 0 }}>
              Gerencie seus tokens em <strong style={{ color: 'var(--ws-accent)' }}>Configurações → API</strong>
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

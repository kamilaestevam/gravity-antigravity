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

import React, { useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from 'react'
import i18next, { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
import { PRODUCT_CONFIG } from '../shared/config'
import { resolverIdsWorkspacesParaApi, useEscopoWorkspacesPedido } from '../shared/useEscopoWorkspacesPedido'
import {
  useListaPainelPedido,
  type EstadoListaParaPainel,
  type SnapshotAplicarListaPainel,
} from '../shared/useListaPainelPedido'
import { PedidosListaFaixaNavegacao } from '../components/PedidosListaFaixaNavegacao'
import { useSelecaoStore, usePedidosSelecionados, useItensSelecionados, useHasMixedTipos } from '../shared/state/selecaoStore'
import { useLinkContextualSync } from '../shared/state/useLinkContextualSync'
import {
  Package,
  Plus,
  CaretDown,
  CaretDoubleDown,
  CaretDoubleUp,
  CaretRight,
  Eye,
  PencilSimple,
  Trash,
  CurrencyCircleDollar,
  Warning,
  ArrowRight,
  DownloadSimple,
  ArrowsClockwise,
  X,
  UploadSimple,
  ArrowsMerge,
  GitMerge,
  ArrowsLeftRight,
  PencilLine,
  Sparkle,
  StackPlus,
  FilePdf,
  ArrowUp,
  ArrowDown,
  PlusCircle,
  Tag,
  Columns,
  SquaresFour,
  PlugsConnected,
  PencilSimpleLine,
} from '@phosphor-icons/react'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { renderBadgeParteWorkspace } from '../components/lista/renderBadgeParteWorkspace'
import { renderBadgeParteVinculada, renderLinkVincularParte } from '../components/lista/renderBadgeParteVinculada'
import {
  urlEditarCnpjWorkspace,
  urlVincularExportador,
  urlVincularImportador,
} from '../components/lista/urlsDeepLinkConfigurador'
import {
  cadastrosApi,
  filtrarOpcoesExportadorImpSemWorkspaces,
  filtrarOpcoesImportadorExpSemWorkspaces,
  mapearOpcoesExportadorImportacao,
  mapearOpcoesImportadorExportacao,
} from '../shared/cadastrosApi'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTMapaColunasFilho,
  GTAcaoExport,
  GTAbaTipo,
  GTFiltroStatusToolbar,
  GTPreferencias,
  GTVirtualHandle,
  GTCarregarFilhosOpts,
} from '@nucleo/tabela-virtual-global'
// Subsistema FiltrosColuna — refactor D9 (2026-05-13). Promovido do Pedido.
import {
  FiltroChips,
  FiltroPopoverColuna,
  rotulofiltro,
  detectarTipoColuna as detectarTipoColunaCore,
  resolverFiltroStatusToolbar,
  FiltroChipStatus,
} from '@nucleo/tabela-virtual-global'
import type {
  FiltroAtivo,
  FiltrosAtivosMap,
  FiltroTipo,
} from '@nucleo/tabela-virtual-global'
import { useCardPreferences } from '../shared/useCardPreferences'
import {
  mesclarVisibilidadeCardsTopoPainel,
  painelCardsTopoTemIntersecaoComPrefs,
} from '../shared/cardsPrefsSync'
import { ListaPedidoCards } from '../components/ListaPedidoCards'
import { useTaxasCambio } from '../shared/useTaxasCambio'
import { useTrackBehavior } from '../hooks/useTrackBehavior'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF } from '../shared/exportUtils'
import type { ColunasExport } from '../shared/exportUtils'
import { isCampoGhostItemNoPedido } from '../../../shared/camposGhostPedidoItem'
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
  relancarErroApi,
} from '../shared/api'
import type { RegrasConfigBackend } from '../shared/api'
import { parsearFormula, avaliarFormula } from '../shared/formulaEngine'
import { valorTotalItemParaLista } from '../shared/valorTotalItemLista'
import {
  somaCubagemItensLista,
  somaPesoBrutoItensLista,
  somaPesoLiquidoItensLista,
  somaQuantidadeTotalPedidoLocal,
  somaValorTotalPedidoLocal,
} from '../shared/agregadosFisicosLista'
import { valorTotalCambioItemParaLista } from '../shared/valorTotalCambioItemLista'
import { isPedidoAtrasado } from '../shared/listaCardStats'
import {
  carregarTabelaConfigPedido,
  SYNC_EVENT_TABELA_PEDIDO,
  type TabelaConfigPedido,
} from '../shared/tabela-config-pedido'
import { isPropagavel, getAlertavelKeys } from '../shared/columnBehaviorConfig'
import { obterCampoItemComLegado } from '../../../shared/mapaPropagacaoPedidoItem'
import {
  CAMPOS_LOGISTICA_PEDIDO,
  isCampoLogisticaPedido,
  normalizarCodigoLogisticaPedido,
} from '../../../shared/camposLogisticaPedido'
import { resolverEdicaoKanbanParaLista } from '../shared/kanbanNavegacaoLista'
import { marcarPartNumbersDuplicados, pedidoTemPartNumberDuplicado } from '../../../shared/partNumberDuplicado'
import {
  calcularDivergenciasPedido,
  mesclarDivergenciasPreservandoCoberturaPedido,
  mesclarDivergenciasPreservandoMoedaCambioPedido,
  mesclarDivergenciasPreservandoDescricaoPedido,
  mesclarDivergenciasPreservandoNcmPedido,
  pedidoPossuiItensNaLista,
  resolverStatusEfetivoItemAoCarregar,
} from '../../../shared/pedidoDivergencias'
import { renderAgregado, buildColunasPai } from '../components/lista/ColunasPai'
import { renderRotuloCadastro } from '../shared/useLogisticaCadastrosPedido'
import {
  CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO,
  CHAVES_TOOLTIP_INLINE_LISTA,
  enriquecerColunaBloqueadaInlinePedido,
  enriquecerColunaComRegraTooltip,
  enriquecerMapaColunasFilhoComRegraTooltip,
  enriquecerMapaFilhoTooltipInline,
  wrapCelulaListaRegras,
} from '../shared/buildTooltipRegraLista'
import {
  buildEntradasMapaAnexoLista,
  isChaveColunaAnexo,
  METADADOS_COLUNA_ANEXO_LISTA,
  renderCelulaAnexoLista,
} from '../shared/renderCelulaAnexoLista'
import { TooltipRegrasColuna } from '../shared/TooltipRegrasColuna'
import { workspacesDisponiveisApi, type WorkspaceDisponivel } from '../shared/api'
import {
  inserirBlocoColunasFaltantes,
  inserirColunaAposAncora,
  moverColunaParaAposAncora,
  reordenarBlocoColunas,
} from '../shared/migracaoColunas'
import { ModalConsolidarPedidos } from '../components/ModalPedidosConsolidar'
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
import {
  useUnidadesPedido,
  formatarBadgeUnidadeCelula,
  kgParaQuantidadeExibicao,
  quantidadeExibicaoParaKg,
  rotuloExibicaoUnidadeOpcao,
} from '../shared/useUnidadesPedido'
import {
  formatarExibicaoQuantidadeVolume,
  formatarNomeVolumeExibicao,
  useVolumesPedido,
} from '../shared/useVolumesPedido'
import { useIncotermsPedido } from '../shared/useIncotermsPedido'
import { useMoedasPedido } from '../shared/useMoedasPedido'
import { useCambioSiscomexPedido, rotuloCambioSiscomex } from '../shared/useCambioSiscomexPedido'
import { useLogisticaCadastrosPedido } from '../shared/useLogisticaCadastrosPedido'
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

/** Mapeia valor raw → label legível para exibição no filtro (tipo_operacao é fixo, status é dinâmico) */
function getLabelsFiltro(campo: string, t: (key: string) => string = i18next.t.bind(i18next)): Record<string, string> {
  if (campo === 'status') {
    const config = _lerStatusConfig()
    const map: Record<string, string> = {}
    for (const [nome, cfg] of Object.entries(config)) map[nome] = cfg.label
    if (!Object.keys(map).length) {
      return {
        rascunho: t('pedido.status.rascunho'),
        aberto: t('pedido.status.aberto'),
        em_andamento: t('pedido.status.em_andamento'),
        aprovado: t('pedido.status.aprovado'),
        transferencia: t('pedido.status.transferencia'),
        consolidado: t('pedido.status.consolidado'),
        cancelado: t('pedido.status.cancelado'),
      }
    }
    return map
  }
  if (campo === 'tipo_operacao') {
    return {
      importacao: t('pedido.lista.tipo_operacao.importacao'),
      exportacao: t('pedido.lista.tipo_operacao.exportacao'),
    }
  }
  return {}
}

function getLabelsFiltroInverso(campo: string, t: (key: string) => string = i18next.t.bind(i18next)): Record<string, string> {
  const map = getLabelsFiltro(campo, t)
  return Object.fromEntries(Object.entries(map).map(([raw, label]) => [label, raw]))
}

// ── Status padrão (fallback sem API) ─────────────────────────────────────────

const ABAS_STATUS_VALORES = ['todos','aberto','em_andamento','aprovado','transferencia','consolidado','cancelado'] as const

/** Regra lista: pedido novo ou importado sempre na primeira linha (P19 — data_atualizacao DESC). */
const SORT_LISTA_NOVOS_PEDIDO = { campo: 'data_atualizacao_pedido', direcao: 'desc' as const }

/** Lê abas do localStorage (salvo pelo Configuracoes e pela API success da Lista).
 *  Usa label do banco (cfg.label) como fonte da verdade — respeita customizações
 *  feitas pelo usuário em Configurações (ex: "Transferido" → "Transferência"). */
function lerAbasDoLocalStorage(t: TFunction = i18next.t.bind(i18next) as unknown as TFunction): GTAbaTipo[] | null {
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
        // SSOT: rótulo salvo em Configurações (rotulo do banco). i18n só se faltar label.
        label: cfg.label?.trim()
          ? cfg.label
          : t(`pedido.status.${id}`, { defaultValue: id }),
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
  { unidadesPeso: [], unidadesCubagem: [], mapaFatorParaKg: {} },
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
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
  'descricao_item',
  'ncm',
  'moeda_pedido',
  'valor_por_unidade_item',
  'quantidade_total_pedido',
  'valor_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'unidade_comercializada_pedido',
  'tipo_volume_pedido',
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
// Usado tanto para linhas-pai (Pedido) quanto linhas-filho (PedidoItem).
// Campos pedido-level (ex: quantidade_transferida_total) podem não existir
// no item — nesse caso, fazemos fallback para o nome item-level equivalente
// (ex: quantidade_transferida_pedido) para que a fórmula funcione em ambos.
function buildFormulaContexto(row: Pedido): Record<string, number | null> {
  const n = (v: unknown): number | null => {
    if (v == null) return null
    const num = typeof v === 'object' ? (v as Record<string, unknown>).valor : v
    const parsed = Number(num)
    return isNaN(parsed) ? null : parsed
  }
  const r = row as Record<string, unknown>
  return {
    quantidade_total_pedido:              n(r.quantidade_total_pedido)              ?? n(r.quantidade_inicial_pedido),
    quantidade_cancelada_total_pedido:    n(r.quantidade_cancelada_total_pedido)    ?? n(r.quantidade_cancelada_pedido),
    quantidade_transferida_total:         n(r.quantidade_transferida_total)         ?? n(r.quantidade_transferida_pedido),
    quantidade_pronta_itens_pedido_total: n(r.quantidade_pronta_itens_pedido_total) ?? n(r.quantidade_pronta_item),
    saldo_itens_do_pedido:                n(r.saldo_itens_do_pedido)                ?? n(r.quantidade_atual_pedido),
    valor_total:                          n(r.valor_total_pedido)                   ?? n(r.valor_total_item),
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
  if (col.tipo === 'anexo') {
    return {
      key: col.chave as keyof Pedido,
      label: col.nome,
      tipo: 'texto',
      filtravel: false,
      oculta: !col.ativo,
      ...METADADOS_COLUNA_ANEXO_LISTA,
      tooltipTitulo: col.nome,
      tooltipDescricao: col.descricao,
      render: (_val: unknown, row: Pedido) =>
        renderCelulaAnexoLista({
          vinculo: 'pedido',
          vinculo_id: row.id,
          chaveColuna: col.chave,
          colunaNome: col.nome,
          categoriaOverride: col.id,
        }),
    }
  }

  // Parse AST e casas decimais uma vez por definição de coluna, não por linha renderizada
  const formulaExpr = col.tipo === 'formula' ? (col.valor_padrao ?? col.formula_expressao) : null
  const formulaAST = formulaExpr
    ? (() => { try { return parsearFormula(formulaExpr) } catch (e) { console.error('[FORMULA PARSE ERROR]', formulaExpr, e); return null } })()
    : null
  const casasCol = getCasas(col.id, 2)

  // Texto que o find-in-page enxerga na célula. O valor da coluna do usuário
  // vive em `_colunas_usuario[col.id]` (não em `row[col.chave]`) — sem isto o
  // find lê `undefined` e o conteúdo fica invisível para a busca. O find usa
  // esta mesma coluna-pai para varrer linhas filhas, então `row` pode ser
  // Pedido OU PedidoItem — ambos carregam `_colunas_usuario` keyed por col.id.
  const findDisplayColunaUsuario = (row: Pedido): string => {
    const valores = (row as unknown as Record<string, unknown>)['_colunas_usuario'] as
      Record<string, string> | undefined
    if (col.tipo === 'formula') {
      if (!formulaAST) return ''
      try {
        const contexto = buildFormulaContexto(row)
        if (valores) {
          for (const [k, v] of Object.entries(valores)) {
            const num = Number(v)
            if (!isNaN(num)) contexto[k] = num
          }
        }
        const { valor: num } = avaliarFormula(formulaAST, contexto)
        return fmtQuantidade(num, casasCol)
      } catch {
        return ''
      }
    }
    const valor = valores?.[col.id]
    if (valor == null || valor === '') return ''
    if (col.tipo === 'checkbox') return valor === 'true' ? '✓' : valor === 'false' ? '✗' : ''
    if (col.tipo === 'numero' || col.tipo === 'percentual') {
      const num = Number(valor)
      if (!isNaN(num)) return `${fmtQuantidade(num, casasCol)}${col.tipo === 'percentual' ? '%' : ''}`
      return valor
    }
    if (col.tipo === 'data') return fmtData(valor)
    return valor
  }

  return {
    findDisplay:     findDisplayColunaUsuario,
    key:             col.chave as keyof Pedido,
    label:           col.nome,
    tipo:            col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula' ? 'numero' : col.tipo === 'data' ? 'periodo' : 'texto',
    align:           col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula' ? 'right'
                   : col.tipo === 'data' || col.tipo === 'select' || col.tipo === 'checkbox' ? 'center'
                   : undefined,
    filtravel:       true,
    oculta:          !col.ativo,
    // fórmula é read-only; demais tipos (incluindo checkbox) permitem edição inline
    editavel:        col.tipo !== 'formula',
    opcoes:          col.tipo === 'checkbox'
                       ? [{ valor: 'true', label: '✓ Sim' }, { valor: 'false', label: '✗ Não' }]
                       : (col.tipo === 'select' || col.tipo === 'tipo_documento') && col.opcoes?.length
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
      const divergente = col.alerta_divergencia_itens === true
        && (col.escopo || 'ambos') === 'ambos'
        && (divergentes?.[col.id] ?? false)

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

// ── Part Number do item — valor + alerta quando repetido no mesmo pedido ─────

function renderPartNumberItemLista(t: TFunction, row: PedidoItem): React.ReactElement {
  const v = row.part_number
  const duplicado = row.part_number_duplicado_no_pedido === true
  const msgDuplicado = t('pedido.coluna_filho.part_number.duplicado_tooltip')

  if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>

  const texto = v.length <= 50
    ? <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
    : (
      <TooltipGlobal titulo={t('pedido.coluna_filho.part_number.tooltip_titulo')} descricao={v}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono, monospace)' }}>
          {v.slice(0, 50) + '…'}
          <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
        </span>
      </TooltipGlobal>
    )

  if (!duplicado) return texto

  return (
    <TooltipGlobal
      titulo={t('pedido.coluna_filho.part_number.tooltip_titulo')}
      descricao={msgDuplicado}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {texto}
        <Warning
          data-testid="lista-alerta-part-number-duplicado-item"
          size={14}
          weight="fill"
          style={{ color: '#F59E0B', flexShrink: 0 }}
          aria-hidden="true"
        />
      </span>
    </TooltipGlobal>
  )
}

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

function buildColunasFilho(t: TFunction): GTColuna<PedidoItem>[] {
  return [
  {
    key: 'part_number',
    label: t('pedido.coluna_filho.part_number.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    render: (_val: unknown, row: PedidoItem) => renderPartNumberItemLista(t, row),
  },
  {
    key: 'ncm',
    label: t('pedido.coluna_filho.ncm.label'),
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
    label: t('pedido.coluna_filho.descricao_item.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_item
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_item.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'quantidade_inicial_pedido',
    label: t('pedido.coluna_filho.quantidade_inicial_pedido.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_filho.quantidade_inicial_pedido.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.quantidade_inicial_pedido.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_inicial_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_atual_pedido',
    label: t('pedido.coluna_filho.quantidade_atual_pedido.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_filho.quantidade_atual_pedido.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.quantidade_atual_pedido.tooltip_descricao'),
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
    key: 'quantidade_pronta_item',
    label: t('pedido.coluna_filho.quantidade_pronta_item.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_filho.quantidade_pronta_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.quantidade_pronta_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_pronta_item, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida_pedido',
    label: t('pedido.coluna_filho.quantidade_transferida_pedido.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_filho.quantidade_transferida_pedido.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.quantidade_transferida_pedido.tooltip_descricao'),
    tooltipBloqueado: t('pedido.coluna_filho.quantidade_transferida_pedido.tooltip_bloqueado'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: '#60a5fa' }}>
        {fmtQuantidade(row.quantidade_transferida_pedido, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada_pedido',
    label: t('pedido.coluna_filho.quantidade_cancelada_pedido.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_filho.quantidade_cancelada_pedido.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.quantidade_cancelada_pedido.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.sequencia_item.label'),
    tipo: 'numero',
    align: 'center',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.sequencia_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.sequencia_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.sequencia_item != null ? String(row.sequencia_item).padStart(3, '0') : '—'}
      </span>
    ),
  },
  {
    key: 'descricao_completa_item_pt',
    label: t('pedido.coluna_filho.descricao_completa_item_pt.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.descricao_completa_item_pt.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_completa_item_pt.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_completa_item_pt
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_completa_item_pt.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'descricao_completa_item_nf',
    label: t('pedido.coluna_filho.descricao_completa_item_nf.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.descricao_completa_item_nf.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_completa_item_nf.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_completa_item_nf
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_completa_item_nf.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'quantidade_unidade_estatistica',
    label: t('pedido.coluna_filho.quantidade_unidade_estatistica.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_filho.quantidade_unidade_estatistica.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.quantidade_unidade_estatistica.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.peso_liquido_unitario.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Dados Físicos',
    tooltipTitulo: t('pedido.coluna_filho.peso_liquido_unitario.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.peso_liquido_unitario.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_liquido_unitario != null
          ? `${fmtQuantidade(row.peso_liquido_unitario, getCasas('peso_liquido_unitario', 3))} ${formatarBadgeUnidadeCelula(row.peso_liquido_unidade_item ?? 'KG')}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'peso_bruto_unitario',
    label: t('pedido.coluna_filho.peso_bruto_unitario.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Dados Físicos',
    tooltipTitulo: t('pedido.coluna_filho.peso_bruto_unitario.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.peso_bruto_unitario.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_bruto_unitario != null
          ? `${fmtQuantidade(row.peso_bruto_unitario, getCasas('peso_bruto_unitario', 3))} ${formatarBadgeUnidadeCelula(row.peso_bruto_unidade_item ?? 'KG')}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'cubagem_unitaria',
    label: t('pedido.coluna_filho.cubagem_unitaria.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'Dados Físicos',
    tooltipTitulo: t('pedido.coluna_filho.cubagem_unitaria.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.cubagem_unitaria.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.cubagem_unitaria != null
          ? `${fmtQuantidade(row.cubagem_unitaria, getCasas('cubagem_unitaria', 4))} ${formatarBadgeUnidadeCelula(row.cubagem_unidade_item ?? 'M3')}`
          : '—'}
      </span>
    ),
  },
  // ── Embalagem e documentos ───────────────────────────────────────────────────
  {
    key: 'tipo_embalagem',
    label: t('pedido.coluna_filho.tipo_embalagem.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Dados Físicos',
    tooltipTitulo: t('pedido.coluna_filho.tipo_embalagem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.tipo_embalagem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.tipo_embalagem
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.tipo_embalagem.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'numero_lpco',
    label: t('pedido.coluna_filho.numero_lpco.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.numero_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.numero_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.numero_lpco
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.numero_lpco.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'numero_certificado_origem',
    label: t('pedido.coluna_filho.numero_certificado_origem.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.numero_certificado_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.numero_certificado_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.numero_certificado_origem
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.numero_certificado_origem.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'data_certificado_origem',
    label: t('pedido.coluna_filho.data_certificado_origem.label'),
    tipo: 'periodo',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_certificado_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_certificado_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── Classificação ────────────────────────────────────────────────────────────
  {
    key: 'grupo_item',
    label: t('pedido.coluna_filho.grupo_item.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.grupo_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.grupo_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.grupo_item
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.grupo_item.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'subgrupo_item',
    label: t('pedido.coluna_filho.subgrupo_item.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.subgrupo_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.subgrupo_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.subgrupo_item
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.subgrupo_item.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'campo_especial_item',
    label: t('pedido.coluna_filho.campo_especial_item.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.campo_especial_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.campo_especial_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.campo_especial_item
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.campo_especial_item.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── Descrições multilíngues ──────────────────────────────────────────────────
  {
    key: 'descricao_completa_item_en',
    label: t('pedido.coluna_filho.descricao_completa_item_en.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.descricao_completa_item_en.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_completa_item_en.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_completa_item_en
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_completa_item_en.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'descricao_completa_item_es',
    label: t('pedido.coluna_filho.descricao_completa_item_es.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.descricao_completa_item_es.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_completa_item_es.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_completa_item_es
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_completa_item_es.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'texto_posicao_ncm',
    label: t('pedido.coluna_filho.texto_posicao_ncm.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.texto_posicao_ncm.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.texto_posicao_ncm.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.texto_posicao_ncm
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.texto_posicao_ncm.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'atributos_catalogo',
    label: t('pedido.coluna_filho.atributos_catalogo.label'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.atributos_catalogo.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.atributos_catalogo.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.atributos_catalogo
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.atributos_catalogo.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'anexo_lpco',
    label: t('pedido.coluna_filho.anexo_lpco.label'),
    tipo: 'texto',
    ...METADADOS_COLUNA_ANEXO_LISTA,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.anexo_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.anexo_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) =>
      renderCelulaAnexoLista({
        vinculo: 'item',
        vinculo_id: row.id,
        chaveColuna: 'anexo_lpco',
        colunaNome: t('pedido.coluna_filho.anexo_lpco.label'),
      }),
  },
  // ── Datas do item ────────────────────────────────────────────────────────────
  {
    key: 'data_transferencia_item',
    label: t('pedido.coluna_filho.data_transferencia_item.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.data_transferencia_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_transferencia_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_transferencia_item ? fmtData(row.data_transferencia_item) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_item',
    label: t('pedido.coluna_filho.data_consolidacao_item.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_filho.data_consolidacao_item.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_consolidacao_item.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_consolidacao_item ? fmtData(row.data_consolidacao_item) : '—'}</span>,
  },
  // ── Datas LPCO ───────────────────────────────────────────────────────────────
  {
    key: 'data_prevista_conferencia_draft_lpco',
    label: t('pedido.coluna_filho.data_prevista_conferencia_draft_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_conferencia_draft_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_conferencia_draft_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_conferencia_draft_lpco ? fmtData(row.data_prevista_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_conferencia_draft_lpco',
    label: t('pedido.coluna_filho.data_confirmada_conferencia_draft_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_conferencia_draft_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_conferencia_draft_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_conferencia_draft_lpco ? fmtData(row.data_confirmada_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_conferencia_draft_lpco',
    label: t('pedido.coluna_filho.data_meta_conferencia_draft_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_conferencia_draft_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_conferencia_draft_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_conferencia_draft_lpco ? fmtData(row.data_meta_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_lpco',
    label: t('pedido.coluna_filho.data_prevista_aprovacao_draft_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_aprovacao_draft_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_aprovacao_draft_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_lpco ? fmtData(row.data_prevista_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_lpco',
    label: t('pedido.coluna_filho.data_confirmada_aprovacao_draft_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_aprovacao_draft_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_aprovacao_draft_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_lpco ? fmtData(row.data_confirmada_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_lpco',
    label: t('pedido.coluna_filho.data_meta_aprovacao_draft_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_aprovacao_draft_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_aprovacao_draft_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_lpco ? fmtData(row.data_meta_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_registro_lpco',
    label: t('pedido.coluna_filho.data_prevista_registro_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_registro_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_registro_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_registro_lpco ? fmtData(row.data_prevista_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_registro_lpco',
    label: t('pedido.coluna_filho.data_confirmada_registro_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_registro_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_registro_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_registro_lpco ? fmtData(row.data_confirmada_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_registro_lpco',
    label: t('pedido.coluna_filho.data_meta_registro_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_registro_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_registro_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_registro_lpco ? fmtData(row.data_meta_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_resultado_analise_lpco',
    label: t('pedido.coluna_filho.data_prevista_resultado_analise_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_resultado_analise_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_resultado_analise_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_resultado_analise_lpco ? fmtData(row.data_prevista_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_resultado_analise_lpco',
    label: t('pedido.coluna_filho.data_confirmada_resultado_analise_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_resultado_analise_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_resultado_analise_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_resultado_analise_lpco ? fmtData(row.data_confirmada_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_resultado_analise_lpco',
    label: t('pedido.coluna_filho.data_meta_resultado_analise_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_resultado_analise_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_resultado_analise_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_resultado_analise_lpco ? fmtData(row.data_meta_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_deferimento_lpco',
    label: t('pedido.coluna_filho.data_prevista_deferimento_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_deferimento_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_deferimento_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_deferimento_lpco ? fmtData(row.data_prevista_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_deferimento_lpco',
    label: t('pedido.coluna_filho.data_confirmada_deferimento_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_deferimento_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_deferimento_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_deferimento_lpco ? fmtData(row.data_confirmada_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_deferimento_lpco',
    label: t('pedido.coluna_filho.data_meta_deferimento_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_deferimento_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_deferimento_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_deferimento_lpco ? fmtData(row.data_meta_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_indeferimento_lpco',
    label: t('pedido.coluna_filho.data_confirmada_indeferimento_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_indeferimento_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_indeferimento_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_indeferimento_lpco ? fmtData(row.data_confirmada_indeferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_exigencia_lpco',
    label: t('pedido.coluna_filho.data_confirmada_exigencia_lpco.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_exigencia_lpco.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_exigencia_lpco.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_exigencia_lpco ? fmtData(row.data_confirmada_exigencia_lpco) : '—'}</span>,
  },
  // ── Datas Certificado de Origem ──────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_cert_origem',
    label: t('pedido.coluna_filho.data_prevista_recebimento_draft_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_recebimento_draft_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_recebimento_draft_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_recebimento_draft_cert_origem ? fmtData(row.data_prevista_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_cert_origem',
    label: t('pedido.coluna_filho.data_confirmada_recebimento_draft_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_recebimento_draft_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_recebimento_draft_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_recebimento_draft_cert_origem ? fmtData(row.data_confirmada_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_cert_origem',
    label: t('pedido.coluna_filho.data_meta_recebimento_draft_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_recebimento_draft_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_recebimento_draft_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_draft_cert_origem ? fmtData(row.data_meta_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_cert_origem',
    label: t('pedido.coluna_filho.data_prevista_aprovacao_draft_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_aprovacao_draft_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_aprovacao_draft_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_cert_origem ? fmtData(row.data_prevista_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_cert_origem',
    label: t('pedido.coluna_filho.data_confirmada_aprovacao_draft_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_aprovacao_draft_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_aprovacao_draft_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_cert_origem ? fmtData(row.data_confirmada_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_cert_origem',
    label: t('pedido.coluna_filho.data_meta_aprovacao_draft_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_aprovacao_draft_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_aprovacao_draft_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_cert_origem ? fmtData(row.data_meta_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_cert_origem',
    label: t('pedido.coluna_filho.data_prevista_envio_original_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_envio_original_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_envio_original_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_envio_original_cert_origem ? fmtData(row.data_prevista_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_cert_origem',
    label: t('pedido.coluna_filho.data_confirmada_envio_original_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_envio_original_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_envio_original_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_envio_original_cert_origem ? fmtData(row.data_confirmada_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_cert_origem',
    label: t('pedido.coluna_filho.data_meta_envio_original_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_envio_original_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_envio_original_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_envio_original_cert_origem ? fmtData(row.data_meta_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_cert_origem',
    label: t('pedido.coluna_filho.data_prevista_recebimento_original_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_prevista_recebimento_original_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_prevista_recebimento_original_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_recebimento_original_cert_origem ? fmtData(row.data_prevista_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_cert_origem',
    label: t('pedido.coluna_filho.data_confirmada_recebimento_original_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_confirmada_recebimento_original_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_confirmada_recebimento_original_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_recebimento_original_cert_origem ? fmtData(row.data_confirmada_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_cert_origem',
    label: t('pedido.coluna_filho.data_meta_recebimento_original_cert_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_meta_recebimento_original_cert_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_meta_recebimento_original_cert_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_original_cert_origem ? fmtData(row.data_meta_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_certificado_origem',
    label: t('pedido.coluna_filho.data_certificado_origem.label'),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.data_certificado_origem.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.data_certificado_origem.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── DUIMP — Dados gerais ─────────────────────────────────────────────────────
  {
    key: 'tipo_operacao_duimp',
    label: t('pedido.coluna_filho.tipo_operacao_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.tipo_operacao_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.tipo_operacao_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.tipo_operacao_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.tipo_operacao_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'descricao_resumida_duimp',
    label: t('pedido.coluna_filho.descricao_resumida_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.descricao_resumida_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_resumida_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_resumida_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_resumida_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'versao_produto_duimp',
    label: t('pedido.coluna_filho.versao_produto_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.versao_produto_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.versao_produto_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.versao_produto_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.versao_produto_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'ncm_duimp',
    label: t('pedido.coluna_filho.ncm_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.ncm_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.ncm_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.ncm_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.ncm_duimp.tooltip_titulo')} descricao={v}>
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
    label: t('pedido.coluna_filho.atributos_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.atributos_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.atributos_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.atributos_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.atributos_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'aplicacao_mercadoria_duimp',
    label: t('pedido.coluna_filho.aplicacao_mercadoria_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.aplicacao_mercadoria_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.aplicacao_mercadoria_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.aplicacao_mercadoria_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.aplicacao_mercadoria_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'condicao_mercadoria_duimp',
    label: t('pedido.coluna_filho.condicao_mercadoria_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.condicao_mercadoria_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.condicao_mercadoria_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.condicao_mercadoria_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.condicao_mercadoria_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'relacao_exportador_fabricante_duimp',
    label: t('pedido.coluna_filho.relacao_exportador_fabricante_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.relacao_exportador_fabricante_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.relacao_exportador_fabricante_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.relacao_exportador_fabricante_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.relacao_exportador_fabricante_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'vinculacao_preco_duimp',
    label: t('pedido.coluna_filho.vinculacao_preco_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.vinculacao_preco_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.vinculacao_preco_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.vinculacao_preco_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.vinculacao_preco_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'descricao_completa_duimp',
    label: t('pedido.coluna_filho.descricao_completa_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.descricao_completa_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_completa_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_completa_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_completa_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'descricao_complementar_duimp',
    label: t('pedido.coluna_filho.descricao_complementar_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.descricao_complementar_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.descricao_complementar_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.descricao_complementar_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.descricao_complementar_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── DUIMP — OPE ─────────────────────────────────────────────────────────────
  {
    key: 'codigo_ope_duimp',
    label: t('pedido.coluna_filho.codigo_ope_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.codigo_ope_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.codigo_ope_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.codigo_ope_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.codigo_ope_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'nome_ope_duimp',
    label: t('pedido.coluna_filho.nome_ope_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.nome_ope_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.nome_ope_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.nome_ope_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.nome_ope_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'pais_ope_duimp',
    label: t('pedido.coluna_filho.pais_ope_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.pais_ope_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.pais_ope_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.pais_ope_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.pais_ope_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'codigo_ope_fabricante_duimp',
    label: t('pedido.coluna_filho.codigo_ope_fabricante_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.codigo_ope_fabricante_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.codigo_ope_fabricante_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.codigo_ope_fabricante_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.codigo_ope_fabricante_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'nome_ope_fabricante_duimp',
    label: t('pedido.coluna_filho.nome_ope_fabricante_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.nome_ope_fabricante_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.nome_ope_fabricante_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.nome_ope_fabricante_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.nome_ope_fabricante_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'pais_fabricante_ope_duimp',
    label: t('pedido.coluna_filho.pais_fabricante_ope_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.pais_fabricante_ope_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.pais_fabricante_ope_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.pais_fabricante_ope_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.pais_fabricante_ope_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── DUIMP — Valoração ────────────────────────────────────────────────────────
  {
    key: 'metodo_valoracao_duimp',
    label: t('pedido.coluna_filho.metodo_valoracao_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.metodo_valoracao_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.metodo_valoracao_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.metodo_valoracao_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.metodo_valoracao_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'incoterm_duimp',
    label: t('pedido.coluna_filho.incoterm_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.incoterm_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.incoterm_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.incoterm_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.incoterm_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'moeda_produto_duimp',
    label: t('pedido.coluna_filho.moeda_produto_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.moeda_produto_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.moeda_produto_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.moeda_produto_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.moeda_produto_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'valor_unitario_duimp',
    label: t('pedido.coluna_filho.valor_unitario_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_unitario_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_unitario_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_total_condicao_venda_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_total_condicao_venda_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_total_condicao_venda_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_condicao_venda_brl_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_condicao_venda_brl_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_condicao_venda_brl_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_frete_internacional_brl_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_frete_internacional_brl_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_frete_internacional_brl_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_seguro_internacional_brl_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_seguro_internacional_brl_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_seguro_internacional_brl_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_local_embarque_brl_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_local_embarque_brl_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_local_embarque_brl_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_aduaneiro_brl_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_aduaneiro_brl_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_aduaneiro_brl_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.tipo_cobertura_cambial_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.tipo_cobertura_cambial_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.tipo_cobertura_cambial_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.tipo_cobertura_cambial_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.tipo_cobertura_cambial_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'numero_rof_bacen_duimp',
    label: t('pedido.coluna_filho.numero_rof_bacen_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.numero_rof_bacen_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.numero_rof_bacen_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.numero_rof_bacen_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.numero_rof_bacen_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'motivo_sem_cobertura_duimp',
    label: t('pedido.coluna_filho.motivo_sem_cobertura_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.motivo_sem_cobertura_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.motivo_sem_cobertura_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.motivo_sem_cobertura_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.motivo_sem_cobertura_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── DUIMP — II ──────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ii_duimp',
    label: t('pedido.coluna_filho.base_calculo_ii_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.base_calculo_ii_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.base_calculo_ii_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_ii_duimp != null ? row.base_calculo_ii_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ii_duimp',
    label: t('pedido.coluna_filho.percentual_ii_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.percentual_ii_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.percentual_ii_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_ii_duimp != null ? `${fmtQuantidade(row.percentual_ii_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_devido_ii_duimp',
    label: t('pedido.coluna_filho.valor_devido_ii_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_devido_ii_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_devido_ii_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.valor_recolher_ii_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_recolher_ii_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_recolher_ii_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.base_calculo_ipi_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.base_calculo_ipi_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.base_calculo_ipi_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_ipi_duimp != null ? row.base_calculo_ipi_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ipi_duimp',
    label: t('pedido.coluna_filho.percentual_ipi_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.percentual_ipi_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.percentual_ipi_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_ipi_duimp != null ? `${fmtQuantidade(row.percentual_ipi_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_ipi_duimp',
    label: t('pedido.coluna_filho.valor_recolher_ipi_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_recolher_ipi_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_recolher_ipi_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.base_calculo_pis_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.base_calculo_pis_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.base_calculo_pis_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_pis_duimp != null ? row.base_calculo_pis_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_pis_duimp',
    label: t('pedido.coluna_filho.percentual_pis_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.percentual_pis_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.percentual_pis_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_pis_duimp != null ? `${fmtQuantidade(row.percentual_pis_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_pis_duimp',
    label: t('pedido.coluna_filho.valor_recolher_pis_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_recolher_pis_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_recolher_pis_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.base_calculo_cofins_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.base_calculo_cofins_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.base_calculo_cofins_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_cofins_duimp != null ? row.base_calculo_cofins_duimp.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_cofins_duimp',
    label: t('pedido.coluna_filho.percentual_cofins_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.percentual_cofins_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.percentual_cofins_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_cofins_duimp != null ? `${fmtQuantidade(row.percentual_cofins_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_cofins_duimp',
    label: t('pedido.coluna_filho.valor_recolher_cofins_duimp.label'),
    tipo: 'numero',
    align: 'right',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.valor_recolher_cofins_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.valor_recolher_cofins_duimp.tooltip_descricao'),
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
    label: t('pedido.coluna_filho.existe_tratamento_administrativo_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.existe_tratamento_administrativo_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.existe_tratamento_administrativo_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.existe_tratamento_administrativo_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.existe_tratamento_administrativo_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'tipo_trat_adm_duimp',
    label: t('pedido.coluna_filho.tipo_trat_adm_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.tipo_trat_adm_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.tipo_trat_adm_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.tipo_trat_adm_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.tipo_trat_adm_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'orgao_trat_adm_duimp',
    label: t('pedido.coluna_filho.orgao_trat_adm_duimp.label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.orgao_trat_adm_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.orgao_trat_adm_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.orgao_trat_adm_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.orgao_trat_adm_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'numero_lpco_trat_adm_duimp',
    label: t('pedido.coluna_filho.numero_lpco_trat_adm_duimp.label'),
    tipo: 'texto',
    grupo: 'DUIMP / Fiscal',
    tooltipTitulo: t('pedido.coluna_filho.numero_lpco_trat_adm_duimp.tooltip_titulo'),
    tooltipDescricao: t('pedido.coluna_filho.numero_lpco_trat_adm_duimp.tooltip_descricao'),
    render: (_val: unknown, row: PedidoItem) => {
      const v = row.numero_lpco_trat_adm_duimp
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.numero_lpco_trat_adm_duimp.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  ]
}

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
  'taxa_cambio_estimada',
  'valor_total_cambio_pedido',
  'quantidade_volumes_pedido',
])

const CAMPOS_EDITAVEIS_PAI = COLUNAS_PAI
  .filter(c => !CAMPOS_DERIVADOS_PAI.has(c.key) && c.editavel !== false && !isChaveColunaAnexo(String(c.key)))
  .map(c => c.key)

// ── Mapa de colunas filho → renderização nas linhas expandidas ────────────────
// As linhas de item usam as mesmas colunas do pedido pai para alinhamento perfeito.
// Colunas sem mapeamento ficam vazias na linha do item.

const CAMPOS_NUMERICOS_ITEM = new Set([
  'quantidade_inicial_pedido', 'quantidade_atual_pedido', 'quantidade_pronta_item',
  'quantidade_transferida_pedido', 'quantidade_cancelada_pedido',
  'peso_liquido_unitario', 'peso_bruto_unitario', 'cubagem_unitaria',
])

// Campos com unidade física fixa — GTValorUnidade usado só para exibir a unidade no popover,
// mas NÃO grava unidade_comercializada_item (a unidade não muda)
const CAMPOS_UNIDADE_FIXA_ITEM = new Set([
  'peso_liquido_unitario', 'peso_bruto_unitario', 'cubagem_unitaria',
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
    moeda_pedido: string | null
    moeda_cambio_pedido: string | null
    importacao_exportador_id: string | null
    exportacao_importador_id: string | null
    porto_origem: string | null
    porto_destino: string | null
    local_de_origem: string | null
    local_de_destino: string | null
    aeroporto_origem: string | null
    aeroporto_destino: string | null
    quantidade_volumes_pedido: number | null
    tipo_volume_pedido: string | null
  }
}

function montarContextoPaiItem(pedido: Pedido, item: PedidoItem): PedidoItemEnriquecido['_p'] {
  const statusItem = resolverStatusEfetivoItemAoCarregar(pedido as Record<string, unknown>) ?? pedido.status
  return {
    id: pedido.id,
    id_workspace: pedido.id_workspace ?? null,
    tipo_operacao: pedido.tipo_operacao,
    nome_exportador: item.nome_exportador ?? pedido.nome_exportador ?? null,
    nome_importador: item.nome_importador ?? pedido.nome_importador ?? null,
    nome_fabricante: pedido.nome_fabricante ?? null,
    referencia_importador: item.referencia_importador ?? pedido.referencia_importador ?? null,
    referencia_exportador: item.referencia_exportador ?? pedido.referencia_exportador ?? null,
    referencia_fabricante: item.referencia_fabricante ?? pedido.referencia_fabricante ?? null,
    numero_proforma: item.numero_proforma ?? pedido.numero_proforma ?? null,
    numero_invoice: item.numero_invoice ?? pedido.numero_invoice ?? null,
    incoterm: pedido.incoterm ?? null,
    condicao_pagamento: pedido.condicao_pagamento ?? null,
    data_emissao_pedido: pedido.data_emissao_pedido ?? null,
    status: statusItem as Pedido['status'],
    moeda_pedido: pedido.moeda_pedido ?? null,
    moeda_cambio_pedido: pedido.moeda_cambio_pedido ?? null,
    importacao_exportador_id: pedido.importacao_exportador_id ?? null,
    exportacao_importador_id: pedido.exportacao_importador_id ?? null,
    porto_origem: pedido.porto_origem ?? null,
    porto_destino: pedido.porto_destino ?? null,
    local_de_origem: pedido.local_de_origem ?? null,
    local_de_destino: pedido.local_de_destino ?? null,
    aeroporto_origem: pedido.aeroporto_origem ?? null,
    aeroporto_destino: pedido.aeroporto_destino ?? null,
    quantidade_volumes_pedido: pedido.quantidade_volumes_pedido ?? null,
    tipo_volume_pedido: pedido.tipo_volume_pedido ?? null,
  }
}

function atualizarCacheItensContextoPai(
  pedidoId: string,
  pedidoAtualizado: Pedido,
  itensCarregadosRef: React.MutableRefObject<Map<string, PedidoItem[]>>,
) {
  const itens = itensCarregadosRef.current.get(pedidoId)
  if (!itens?.length) return
  itensCarregadosRef.current.set(
    pedidoId,
    itens.map((i) => ({
      ...i,
      _p: montarContextoPaiItem(pedidoAtualizado, i),
    })) as PedidoItem[],
  )
}

/** ID de workspace do pedido (DDD id_workspace ou ACL company_id). */
function extrairIdWorkspaceDePedido(p: Pedido): string {
  const r = p as Record<string, unknown>
  return String(r.id_workspace ?? r.company_id ?? '').trim()
}

/** ID de workspace do item (ACL company_id ou _p.id_workspace). */
function extrairIdWorkspaceDeItem(item: PedidoItem): string {
  const enr = item as PedidoItemEnriquecido
  return String(item.company_id ?? enr._p?.id_workspace ?? '').trim()
}

const CUID_INTERNO_RE = /^c[a-z0-9]{8,}$/i

function pareceIdInternoGravity(valor: string): boolean {
  return CUID_INTERNO_RE.test(valor.trim())
}

/** Normaliza tipo_operacao vindo da API (importacao/exportacao). */
function tipoOperacaoLista(row: { tipo_operacao?: string | null }): 'importacao' | 'exportacao' | null {
  const raw = String(row.tipo_operacao ?? '').trim().toLowerCase()
  if (raw === 'importacao' || raw === 'importação') return 'importacao'
  if (raw === 'exportacao' || raw === 'exportação') return 'exportacao'
  return null
}

/**
 * Comportamento da coluna Importador — usa tipo_operacao ou heurística de dado corrompido
 * (nome_importador = CUID do workspace → tratar como importação na UI).
 */
function comportamentoImportadorLista(row: Pedido): 'importacao' | 'exportacao' | null {
  const tipo = tipoOperacaoLista(row)
  if (tipo) return tipo
  const idWs = extrairIdWorkspaceDePedido(row)
  const snap = row.nome_importador?.trim()
  if (!idWs || !snap) return null
  if (snap === idWs || pareceIdInternoGravity(snap)) return 'importacao'
  return null
}

/** Opções do popover IMP — nunca retorna vazio se o pedido tem workspace. */
function garantirOpcoesWorkspaceImportador(
  row: Pedido,
  workspaceOpcoes: { valor: string; label: string }[],
  workspacesMap: Map<string, { nome: string; cnpj?: string | null }> | undefined,
): { valor: string; label: string }[] {
  if (workspaceOpcoes.length > 0) return workspaceOpcoes
  const id = extrairIdWorkspaceDePedido(row)
  if (!id) return []
  const label = nomeLegivelWorkspace(id, workspacesMap, [], null)
  return [{ valor: id, label: label !== '—' ? label : id }]
}

/** Snapshot de nome_importador só quando legível (nunca CUID). */
function snapshotNomeImportadorLegivel(valor?: string | null): string | null {
  const snap = valor?.trim()
  if (!snap || pareceIdInternoGravity(snap)) return null
  return snap
}

/** Nunca exibir CUID cru na UI — mapa → opções → snapshot do pedido IMP. */
function nomeLegivelWorkspace(
  idWs: string,
  workspacesMap?: Map<string, { nome: string; cnpj?: string | null }>,
  opcoes?: { valor: string; label: string }[],
  nomeSnapshot?: string | null,
): string {
  const id = idWs.trim()
  if (!id) return '—'
  const doMapa = workspacesMap?.get(id)?.nome?.trim()
  if (doMapa && !pareceIdInternoGravity(doMapa)) return doMapa
  const doOpcao = opcoes?.find((o) => o.valor === id)?.label?.trim()
  if (doOpcao && !pareceIdInternoGravity(doOpcao)) return doOpcao
  const snap = nomeSnapshot?.trim()
  if (snap && !pareceIdInternoGravity(snap) && snap !== id) return snap
  return '—'
}

/** Nome do workspace do pedido — usado para bloquear vazamento na coluna Importador (EXP). */
function nomeWorkspacePedidoLista(
  row: Pedido,
  workspacesMap: Map<string, { nome: string; cnpj?: string | null }> | undefined,
  workspaceOpcoes: { valor: string; label: string }[],
): string {
  return nomeLegivelWorkspace(extrairIdWorkspaceDePedido(row), workspacesMap, workspaceOpcoes, null)
}

function nomeImportadorPareceWorkspace(
  nome: string,
  row: Pedido,
  workspacesMap: Map<string, { nome: string; cnpj?: string | null }> | undefined,
  workspaceOpcoes: { valor: string; label: string }[],
): boolean {
  const nomeWs = nomeWorkspacePedidoLista(row, workspacesMap, workspaceOpcoes)
  if (nomeWs === '—') return false
  return nome.trim().toLowerCase() === nomeWs.trim().toLowerCase()
}

/** Nome exibido na coluna Importador (pedido) — IMP espelha workspace; EXP usa fornecedor. */
function nomeExibicaoImportadorPedido(
  row: Pedido,
  workspacesMap: Map<string, { nome: string; cnpj?: string | null }> | undefined,
  workspaceOpcoes: { valor: string; label: string }[],
  opcoesImportadoresExp: { valor: string; label: string }[],
): string {
  const tipo = comportamentoImportadorLista(row)
  if (tipo === 'importacao') {
    const nome = nomeLegivelWorkspace(
      extrairIdWorkspaceDePedido(row),
      workspacesMap,
      workspaceOpcoes,
      snapshotNomeImportadorLegivel(row.nome_importador),
    )
    return pareceIdInternoGravity(nome) ? '—' : nome
  }
  const idForn = row.exportacao_importador_id?.trim()
  if (idForn) {
    const doOpcao = opcoesImportadoresExp.find((o) => o.valor === idForn)?.label?.trim()
    if (doOpcao && !pareceIdInternoGravity(doOpcao)) return doOpcao
  }
  const nome = snapshotNomeImportadorLegivel(row.nome_importador)
  if (nome && nomeImportadorPareceWorkspace(nome, row, workspacesMap, workspaceOpcoes)) {
    return ''
  }
  return nome ?? ''
}

/** Comportamento da coluna Exportador — espelho invertido do Importador. */
function comportamentoExportadorLista(row: Pedido): 'importacao' | 'exportacao' | null {
  const tipo = tipoOperacaoLista(row)
  if (tipo) return tipo
  const idWs = extrairIdWorkspaceDePedido(row)
  const snap = row.nome_exportador?.trim()
  if (!idWs || !snap) return null
  if (snap === idWs || pareceIdInternoGravity(snap)) return 'exportacao'
  return null
}

function snapshotNomeExportadorLegivel(valor?: string | null): string | null {
  return snapshotNomeImportadorLegivel(valor)
}

function nomeExportadorPareceWorkspace(
  nome: string,
  row: Pedido,
  workspacesMap: Map<string, { nome: string; cnpj?: string | null }> | undefined,
  workspaceOpcoes: { valor: string; label: string }[],
): boolean {
  return nomeImportadorPareceWorkspace(nome, row, workspacesMap, workspaceOpcoes)
}

/** Nome exibido na coluna Exportador — EXP espelha workspace; IMP usa fornecedor. */
function nomeExibicaoExportadorPedido(
  row: Pedido,
  workspacesMap: Map<string, { nome: string; cnpj?: string | null }> | undefined,
  workspaceOpcoes: { valor: string; label: string }[],
  opcoesExportadoresImp: { valor: string; label: string }[],
): string {
  const tipo = comportamentoExportadorLista(row)
  if (tipo === 'exportacao') {
    const nome = nomeLegivelWorkspace(
      extrairIdWorkspaceDePedido(row),
      workspacesMap,
      workspaceOpcoes,
      snapshotNomeExportadorLegivel(row.nome_exportador),
    )
    return pareceIdInternoGravity(nome) ? '—' : nome
  }
  const idForn = row.importacao_exportador_id?.trim()
  if (idForn) {
    const doOpcao = opcoesExportadoresImp.find((o) => o.valor === idForn)?.label?.trim()
    if (doOpcao && !pareceIdInternoGravity(doOpcao)) return doOpcao
  }
  const nome = snapshotNomeExportadorLegivel(row.nome_exportador)
  if (nome && nomeExportadorPareceWorkspace(nome, row, workspacesMap, workspaceOpcoes)) {
    return ''
  }
  return nome ?? ''
}

function montarMapaWorkspacesRapido(
  workspacesDisponiveis: { id_workspace: string; nome_workspace: string; cnpj_workspace?: string | null }[],
  workspacesShell: { id: string; nome_workspace: string }[],
): Map<string, { nome: string; cnpj?: string | null }> {
  const m = new Map<string, { nome: string; cnpj?: string | null }>()
  const registrar = (id: string, nome: string, cnpj?: string | null) => {
    const idWs = id.trim()
    if (!idWs) return
    const label = nome.trim() || idWs
    const prev = m.get(idWs)
    if (!prev || (prev.nome === idWs && label !== idWs)) {
      m.set(idWs, { nome: label, cnpj: cnpj ?? prev?.cnpj ?? null })
    }
  }
  for (const w of workspacesDisponiveis) {
    registrar(w.id_workspace, w.nome_workspace, w.cnpj_workspace ?? null)
  }
  for (const w of workspacesShell) {
    registrar(w.id, w.nome_workspace)
  }
  return m
}

/** Corrige nome_importador e nome_exportador corrompidos ao carregar a lista. */
function sanitizarNomesPartesListaPedidos(
  lista: Pedido[],
  workspacesDisponiveis: { id_workspace: string; nome_workspace: string; cnpj_workspace?: string | null }[],
  workspacesShell: { id: string; nome_workspace: string }[],
  opcoesImportadoresExp: { valor: string; label: string }[],
  opcoesExportadoresImp: { valor: string; label: string }[],
): Pedido[] {
  const mapa = montarMapaWorkspacesRapido(workspacesDisponiveis, workspacesShell)
  const workspaceOpcoes = [
    ...workspacesDisponiveis.map((w) => ({
      valor: w.id_workspace,
      label: w.nome_workspace.trim() || w.id_workspace,
    })),
    ...workspacesShell.map((w) => ({
      valor: w.id,
      label: w.nome_workspace.trim() || w.id,
    })),
  ]
  const opcoesImpExp = filtrarOpcoesImportadorExpSemWorkspaces(opcoesImportadoresExp, workspaceOpcoes)
  const opcoesExpImp = filtrarOpcoesExportadorImpSemWorkspaces(opcoesExportadoresImp, workspaceOpcoes)
  return lista.map((p) => {
    const tipo = tipoOperacaoLista(p)
    const idWs = extrairIdWorkspaceDePedido(p)
    let next = p

    const snapImp = p.nome_importador?.trim()
    const snapImpCuid = Boolean(snapImp && idWs && (snapImp === idWs || pareceIdInternoGravity(snapImp)))
    if (tipo === 'importacao' || (snapImpCuid && tipo !== 'exportacao')) {
      const nomeCorreto = nomeLegivelWorkspace(idWs, mapa, workspaceOpcoes, null)
      if (tipo === 'importacao' && nomeCorreto !== '—' && next.nome_importador !== nomeCorreto) {
        next = { ...next, nome_importador: nomeCorreto }
      } else if (snapImpCuid && nomeCorreto !== '—') {
        next = { ...next, nome_importador: nomeCorreto }
      }
    } else if (tipo === 'exportacao') {
      const nomeExibImp = nomeExibicaoImportadorPedido(next, mapa, workspaceOpcoes, opcoesImpExp)
      const snapExpImp = next.nome_importador?.trim()
      const precisaImp = Boolean(
        snapExpImp && (
          pareceIdInternoGravity(snapExpImp)
          || snapExpImp === idWs
          || nomeImportadorPareceWorkspace(snapExpImp, next, mapa, workspaceOpcoes)
          || (nomeExibImp && snapExpImp !== nomeExibImp)
        ),
      )
      if (precisaImp) {
        next = { ...next, nome_importador: nomeExibImp || null }
      }
    }

    const snapExp = next.nome_exportador?.trim()
    const snapExpCuid = Boolean(snapExp && idWs && (snapExp === idWs || pareceIdInternoGravity(snapExp)))
    if (tipo === 'exportacao' || (snapExpCuid && tipo !== 'importacao')) {
      const nomeCorreto = nomeLegivelWorkspace(idWs, mapa, workspaceOpcoes, null)
      if (tipo === 'exportacao' && nomeCorreto !== '—' && next.nome_exportador !== nomeCorreto) {
        next = { ...next, nome_exportador: nomeCorreto }
      } else if (snapExpCuid && nomeCorreto !== '—') {
        next = { ...next, nome_exportador: nomeCorreto }
      }
    } else if (tipo === 'importacao') {
      const nomeExibExp = nomeExibicaoExportadorPedido(next, mapa, workspaceOpcoes, opcoesExpImp)
      const snapExpImp = next.nome_exportador?.trim()
      const precisaExp = Boolean(
        snapExpImp && (
          pareceIdInternoGravity(snapExpImp)
          || snapExpImp === idWs
          || nomeExportadorPareceWorkspace(snapExpImp, next, mapa, workspaceOpcoes)
          || (nomeExibExp && snapExpImp !== nomeExibExp)
        ),
      )
      if (precisaExp) {
        next = { ...next, nome_exportador: nomeExibExp || null }
      }
    }

    return next
  })
}

/** Extrai código ISO de moeda (select, GTValorMoeda ou rótulo "USD — Dólar…"). */
function extrairCodigoMoedaLista(valor: unknown): string | null {
  if (valor == null || valor === '') return null
  if (typeof valor === 'object' && valor !== null && 'currency' in valor) {
    const codigo = (valor as { currency: unknown }).currency
    return codigo == null || codigo === '' ? null : String(codigo).trim()
  }
  const bruto = String(valor).trim()
  if (!bruto) return null
  const sep = bruto.indexOf(' — ')
  return sep > 0 ? bruto.slice(0, sep).trim() : bruto
}

function codigoMoedaExibicaoLista(valor: string | null | undefined): string | null {
  if (!valor?.trim()) return null
  const sep = valor.indexOf(' — ')
  return sep > 0 ? valor.slice(0, sep).trim() : valor.trim()
}

/** Coluna Prisma do item → chave no contrato JSON do mapItem (ACL). */
const CAMPO_ITEM_JSON: Partial<Record<string, keyof PedidoItem | string>> = {
  moeda_item: 'moeda_item',
  incoterm_item: 'incoterm',
  tipo_operacao_item: 'tipo_operacao',
  condicao_pagamento_item: 'condicao_pagamento_pedido',
  unidade_comercializada_item: 'unidade_comercializada_item',
  tipo_volume_item: 'tipo_volume_item',
  numero_proforma_item: 'numero_proforma',
  numero_invoice_item: 'numero_invoice',
  cobertura_cambial_item: 'cobertura_cambial',
  moeda_cambio_item_pedido: 'moeda_cambio_item_pedido',
}

/** Propaga valor do pai no item em memória — usa MAPA_PROPAGACAO + nomes JSON do mapItem. */
function aplicarPropagacaoPedidoNoItem(
  item: PedidoItem,
  campoPedido: string,
  valor: unknown,
): PedidoItem {
  const patched = { ...item } as PedidoItem & Record<string, unknown>

  if (campoPedido === 'tipo_operacao' || campoPedido === 'tipo_operacao_pedido') {
    patched.tipo_operacao = valor as string | null | undefined
    patched.tipo_operacao_item = valor as string | null | undefined
    return patched
  }

  if (campoPedido === 'id_workspace') {
    patched.company_id = String(valor ?? '')
    const enr = item as PedidoItemEnriquecido
    if (enr._p) {
      (patched as PedidoItemEnriquecido)._p = {
        ...enr._p,
        id_workspace: (valor as string | null | undefined) ?? null,
      }
    }
    return patched
  }

  const campoItemPrisma = obterCampoItemComLegado(campoPedido)
  if (campoItemPrisma) {
    const chaveJson = CAMPO_ITEM_JSON[campoItemPrisma]
      ?? (campoPedido.startsWith('data_') ? campoPedido : campoItemPrisma)
    patched[chaveJson] = valor
    if (campoItemPrisma === 'tipo_operacao_item') {
      patched.tipo_operacao_item = valor
    }
    return patched
  }

  patched[campoPedido] = valor
  return patched
}

/** Tooltip com pílulas para célula de item somente leitura (padrão Workspace / Tipo de Operação). */
function wrapCelulaItemSomenteLeituraLista(
  conteudo: React.ReactNode,
  t: TFunction,
  titulo: string,
): React.ReactElement {
  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={(
        <TooltipRegrasColuna
          t={t}
          pillsPedido={['itens_bloqueados_pedido']}
        />
      )}
    >
      <span style={{ display: 'block', cursor: 'not-allowed' }}>{conteudo}</span>
    </TooltipGlobal>
  )
}

/** Logística: valor único no pedido — itens espelham _p; tooltip via coluna (wrapTooltipRegraCelula). */
function wrapCelulaItemLogisticaLista(conteudo: React.ReactNode): React.ReactElement {
  return <span style={{ display: 'block' }}>{conteudo}</span>
}

/** Nome do workspace do pedido pai — espelha ColunasPai (importação/exportação). */
function resolverNomeWorkspacePedidoPai(
  row: PedidoItem,
  workspacesMap?: OpcoesUnidadesColunas['workspacesMap'],
): string | null {
  const enr = row as PedidoItemEnriquecido
  const id = enr._p?.id_workspace ?? row.company_id ?? ''
  if (!id) return null
  return workspacesMap?.get(id)?.nome ?? null
}

function buildMapaColunasFilho(t: TFunction, opcoes: OpcoesUnidadesColunas): Record<string, GTMapaColunasFilho<PedidoItem>> {
  const {
    unidadesPeso,
    unidadesCubagem,
    mapaFatorParaKg,
    volumesOpcoes = [],
    workspacesMap,
    workspaceOpcoesLista = [],
    opcoesImportadoresExpLista = [],
    opcoesExportadoresImpLista = [],
    paisesOpcoes = [],
    portosOpcoes = [],
    aeroportosOpcoes = [],
    coberturaCambialOpcoes = [],
    modalidadePagamentoOpcoes = [],
    moedasOpcoes = [],
  } = opcoes
  const opcoesCobertura = coberturaCambialOpcoes.map(o => ({ valor: o.valor, label: o.label }))
  const opcoesSiscomex = modalidadePagamentoOpcoes.map(o => ({ valor: o.valor, label: o.label }))

  return {
  // ── Número do pedido → Part Number do item ────────────────────────────────
  numero_pedido: {
    editavel: true,
    campo: 'part_number',
    render: (row: PedidoItem) => renderPartNumberItemLista(t, row),
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
    editavel: false,
    tooltipBloqueado: t(
      'pedido.coluna_filho.mapa_tipo_operacao.tooltip_bloqueado',
      'Tipo de operação é do pedido — altere na linha do pedido',
    ),
    render: (row: PedidoItem) => {
      const tipoItem = (row as Record<string, unknown>).tipo_operacao_item as string | null
      const p = (row as PedidoItemEnriquecido)._p
      const tipo = tipoItem ?? p?.tipo_operacao ?? null
      if (!tipo) return null
      const badge = (
        <StatusBadgeGlobal
          valor={tipo === 'importacao' ? t('pedido.coluna_filho.mapa_tipo_operacao.valor_importacao') : t('pedido.coluna_filho.mapa_tipo_operacao.valor_exportacao')}
          genero="feminino"
          style={tipo === 'importacao'
            ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
            : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
          }
        />
      )
      return wrapCelulaItemSomenteLeituraLista(badge, t, t('pedido.coluna_pai.tipo_operacao'))
    },
  },
  id_workspace: {
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_filho.mapa_id_workspace.tooltip_bloqueado', 'Workspace é do pedido — altere na linha do pedido'),
    render: (row: PedidoItem) => {
      const enr = row as PedidoItemEnriquecido
      const id = enr._p?.id_workspace ?? row.company_id ?? ''
      const titulo = t('pedido.coluna_pai.workspace_label')
      if (!id) {
        return wrapCelulaItemSomenteLeituraLista(
          <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>,
          t,
          titulo,
        )
      }
      const nome = nomeLegivelWorkspace(id, workspacesMap, undefined, enr._p?.nome_importador)
      const conteudo = nome.length <= 50
        ? <span>{nome}</span>
        : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {nome.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        )
      return wrapCelulaItemSomenteLeituraLista(conteudo, t, titulo)
    },
  },
  nome_exportador: {
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_filho.mapa_nome_exportador.tooltip_bloqueado_cond'),
    campo: 'nome_exportador',
    render: (row: PedidoItem) => {
      const enr = row as PedidoItemEnriquecido
      const titulo = t('pedido.coluna_pai.nome_exportador')
      const pedidoEspelho = {
        tipo_operacao: enr._p?.tipo_operacao,
        id_workspace: enr._p?.id_workspace,
        company_id: enr._p?.id_workspace ?? row.company_id,
        importacao_exportador_id: enr._p?.importacao_exportador_id,
        nome_exportador: enr._p?.nome_exportador,
      } as Pedido
      const tipoOp = comportamentoExportadorLista(pedidoEspelho)

      if (tipoOp === 'exportacao') {
        const nomeWs = nomeExibicaoExportadorPedido(pedidoEspelho, workspacesMap, workspaceOpcoesLista, [])
        const conteudo = nomeWs.length <= 50
          ? <span>{nomeWs}</span>
          : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {nomeWs.slice(0, 50) + '…'}
              <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
            </span>
          )
        return wrapCelulaItemSomenteLeituraLista(conteudo, t, titulo)
      }

      const nome = nomeExibicaoExportadorPedido(pedidoEspelho, workspacesMap, workspaceOpcoesLista, opcoesExportadoresImpLista)
      if (!nome) {
        return wrapCelulaItemSomenteLeituraLista(
          <span style={{ color: '#818cf8', fontSize: '0.75rem', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
            {t('pedido.coluna_pai.vincular_exportador')}
          </span>,
          t,
          titulo,
        )
      }
      return wrapCelulaItemSomenteLeituraLista(
        renderBadgeParteVinculada({
          nome,
          titulo: t('pedido.coluna_pai.parte_exportador_titulo'),
          descricao: t('pedido.coluna_pai.clique_editar_exportador'),
        }),
        t,
        titulo,
      )
    },
  },
  nome_importador: {
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_filho.mapa_nome_importador.tooltip_bloqueado'),
    campo: 'nome_importador',
    render: (row: PedidoItem) => {
      const enr = row as PedidoItemEnriquecido
      const titulo = t('pedido.coluna_pai.nome_importador')
      const pedidoEspelho = {
        tipo_operacao: enr._p?.tipo_operacao,
        id_workspace: enr._p?.id_workspace,
        company_id: enr._p?.id_workspace ?? row.company_id,
        exportacao_importador_id: enr._p?.exportacao_importador_id,
        nome_importador: enr._p?.nome_importador,
      } as Pedido
      const tipoOp = comportamentoImportadorLista(pedidoEspelho)

      if (tipoOp === 'importacao') {
        const nomeWs = nomeExibicaoImportadorPedido(pedidoEspelho, workspacesMap, workspaceOpcoesLista, [])
        const conteudo = nomeWs.length <= 50
          ? <span>{nomeWs}</span>
          : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {nomeWs.slice(0, 50) + '…'}
              <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
            </span>
          )
        return wrapCelulaItemSomenteLeituraLista(conteudo, t, titulo)
      }

      // Exportação — espelha pedido (somente _p), somente leitura no item.
      const nome = nomeExibicaoImportadorPedido(pedidoEspelho, workspacesMap, workspaceOpcoesLista, opcoesImportadoresExpLista)
      if (!nome) {
        return wrapCelulaItemSomenteLeituraLista(
          <span style={{ color: '#818cf8', fontSize: '0.75rem', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
            {t('pedido.coluna_pai.vincular_importador')}
          </span>,
          t,
          titulo,
        )
      }
      return wrapCelulaItemSomenteLeituraLista(
        renderBadgeParteVinculada({
          nome,
          titulo: t('pedido.coluna_pai.parte_importador_titulo'),
          descricao: t('pedido.coluna_pai.clique_editar_importador_lista'),
        }),
        t,
        titulo,
      )
    },
  },
  nome_fabricante: {
    editavel: true,
    campo: 'nome_fabricante',
    render: (row: PedidoItem) => {
      const v = row.nome_fabricante
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_nome_fabricante.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  referencia_importador: {
    editavel: true,
    campo: 'referencia_importador',
    render: (row: PedidoItem) => {
      const v = row.referencia_importador
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_referencia_importador.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  referencia_exportador: {
    editavel: true,
    campo: 'referencia_exportador',
    render: (row: PedidoItem) => {
      const v = row.referencia_exportador
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_referencia_exportador.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  numero_proforma: {
    editavel: true,
    campo: 'numero_proforma',
    render: (row: PedidoItem) => {
      const v = row.numero_proforma
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_numero_proforma.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  numero_invoice: {
    editavel: true,
    campo: 'numero_invoice',
    render: (row: PedidoItem) => {
      const v = row.numero_invoice
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_numero_invoice.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  incoterm: {
    editavel: true,
    campo: 'incoterm',
    render: (row: PedidoItem) => {
      const v = row.incoterm
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_incoterm.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
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
    render: (row: PedidoItem) => {
      const v = row.referencia_fabricante
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_referencia_fabricante.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  cobertura_cambial: {
    editavel: true,
    campo: 'cobertura_cambial',
    opcoes: opcoesCobertura,
    getValorEditar: (row: PedidoItem) => row.cobertura_cambial ?? '',
    render: (row: PedidoItem) => {
      const rotulo = rotuloCambioSiscomex(row.cobertura_cambial, coberturaCambialOpcoes)
      if (rotulo === '—') return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (rotulo.length <= 50) return <span>{rotulo}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_cobertura_cambial.tooltip_titulo')} descricao={rotulo}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {rotulo.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  condicao_pagamento_siscomex: {
    editavel: true,
    campo: 'condicao_pagamento_siscomex',
    opcoes: opcoesSiscomex,
    getValorEditar: (row: PedidoItem) => row.condicao_pagamento_siscomex ?? '',
    render: (row: PedidoItem) => {
      const rotulo = rotuloCambioSiscomex(row.condicao_pagamento_siscomex, modalidadePagamentoOpcoes)
      if (rotulo === '—') return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (rotulo.length <= 50) return <span>{rotulo}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.condicao_pagamento_siscomex_pedido_titulo')} descricao={rotulo}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {rotulo.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
  },
  condicao_pagamento: {
    editavel: true,
    campo: 'condicao_pagamento',
    render: (row: PedidoItem) => {
      const v = row.condicao_pagamento
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_condicao_pagamento.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
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
      return { unit, quantity: kgParaQuantidadeExibicao(kg, unit, mapaFatorParaKg) }
    },
    render: (row: PedidoItem) => {
      const unit = row.peso_liquido_unidade_item ?? 'KG'
      const kg = Number(row.peso_liquido_unitario ?? 0)
      const display = kgParaQuantidadeExibicao(kg, unit, mapaFatorParaKg)
      return (
        <span className="gtv-celula-moeda">
          {row.peso_liquido_unitario != null
            ? fmtQuantidade(display, getCasas('peso_liquido_unitario', 3))
            : '—'}
          <span className="gtv-celula-unidade-badge">{formatarBadgeUnidadeCelula(unit)}</span>
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
      return { unit, quantity: kgParaQuantidadeExibicao(kg, unit, mapaFatorParaKg) }
    },
    render: (row: PedidoItem) => {
      const unit = row.peso_bruto_unidade_item ?? 'KG'
      const kg = Number(row.peso_bruto_unitario ?? 0)
      const display = kgParaQuantidadeExibicao(kg, unit, mapaFatorParaKg)
      return (
        <span className="gtv-celula-moeda">
          {row.peso_bruto_unitario != null
            ? fmtQuantidade(display, getCasas('peso_bruto_unitario', 3))
            : '—'}
          <span className="gtv-celula-unidade-badge">{formatarBadgeUnidadeCelula(unit)}</span>
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
          <span className="gtv-celula-unidade-badge">{formatarBadgeUnidadeCelula(unit)}</span>
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
      amount: valorTotalItemParaLista(row) ?? 0,
    }),
    render: (row: PedidoItem) => {
      const casas = getCasas('valor_total_pedido', 2)
      const moeda = row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? 'USD'
      const num = valorTotalItemParaLista(row)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
          {num != null && !isNaN(num) ? fmtQuantidade(num, casas) : '—'}
        </span>
      )
    },
  },
  valor_total_cambio_pedido: {
    editavel: true,
    campo: 'valor_total_cambio_item_pedido',
    casasDecimais: getCasas('valor_total_cambio_pedido', 2),
    getValorEditar: (row: PedidoItem) => {
      const enriquecido = row as PedidoItemEnriquecido
      const moedaRaw = enriquecido.moeda_cambio_item_pedido ?? enriquecido._p?.moeda_cambio_pedido ?? 'BRL'
      const moeda = codigoMoedaExibicaoLista(moedaRaw) ?? moedaRaw ?? 'BRL'
      return {
        currency: moeda,
        amount: valorTotalCambioItemParaLista(row) ?? 0,
      }
    },
    render: (row: PedidoItem) => {
      const casas = getCasas('valor_total_cambio_pedido', 2)
      const enriquecido = row as PedidoItemEnriquecido
      const moedaRaw = enriquecido.moeda_cambio_item_pedido ?? enriquecido._p?.moeda_cambio_pedido ?? 'BRL'
      const moeda = codigoMoedaExibicaoLista(moedaRaw) ?? moedaRaw ?? 'BRL'
      const num = valorTotalCambioItemParaLista(row)
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
          {num != null && !isNaN(num) ? fmtQuantidade(num, casas) : '—'}
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
          <TooltipGlobal descricao={t('pedido.coluna_filho.mapa_cnpj_importador.descricao')}>
            <span style={{ color: 'var(--text-disabled, #666)', cursor: 'not-allowed' }}>—</span>
          </TooltipGlobal>
        )
      }
      const cnpjRaw = workspacesMap?.get(pai?.id_workspace ?? '')?.cnpj ?? ''
      const digits = cnpjRaw.replace(/\D/g, '')
      if (digits.length !== 14) {
        const href = urlEditarCnpjWorkspace(pai?.id_workspace ?? '', pai?.id)
        return (
          <TooltipGlobal descricao={t('pedido.coluna_filho.mapa_cnpj_importador.descricao_2')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              {t('pedido.coluna_filho.helper.cadastrar_cnpj')}
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
          <TooltipGlobal descricao={t('pedido.coluna_filho.mapa_cnpj_exportador.descricao')}>
            <span style={{ color: 'var(--text-disabled, #666)', cursor: 'not-allowed' }}>—</span>
          </TooltipGlobal>
        )
      }
      const cnpjRaw = workspacesMap?.get(pai?.id_workspace ?? '')?.cnpj ?? ''
      const digits = cnpjRaw.replace(/\D/g, '')
      if (digits.length !== 14) {
        const href = urlEditarCnpjWorkspace(pai?.id_workspace ?? '', pai?.id)
        return (
          <TooltipGlobal descricao={t('pedido.coluna_filho.mapa_cnpj_exportador.descricao_2')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              {t('pedido.coluna_filho.helper.cadastrar_cnpj')}
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
    editavel: true,
    campo: 'descricao_item',
    render: (row: PedidoItem) => {
      const v = row.descricao_item
      if (!v) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      if (v.length <= 50) return <span>{v}</span>
      return (
        <TooltipGlobal titulo={t('pedido.coluna_filho.mapa_descricao_item.tooltip_titulo')} descricao={v}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {v.slice(0, 50) + '…'}
            <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
          </span>
        </TooltipGlobal>
      )
    },
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
  tipo_volume_pedido: {
    editavel: true,
    campo: 'tipo_volume_item',
    unidades: volumesOpcoes,
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_tipo_volume'),
    rotuloUnidadeSelecionada: (unit) => rotuloExibicaoUnidadeOpcao(unit, volumesOpcoes),
    getValorEditar: (row: PedidoItem) => ({
      unit: (row as PedidoItem & { tipo_volume_item?: string | null }).tipo_volume_item ?? '05',
      quantity: 0,
    }),
    render: (row: PedidoItem) => {
      const tipo = (row as PedidoItem & { tipo_volume_item?: string | null }).tipo_volume_item
      if (!tipo) return <span>{'—'}</span>
      const nome = rotuloExibicaoUnidadeOpcao(tipo, volumesOpcoes)
      return <span>{formatarNomeVolumeExibicao(nome, 1)}</span>
    },
  },
  quantidade_volumes_pedido: {
    editavel: true,
    campo: 'quantidade_volumes_pedido',
    unidades: volumesOpcoes,
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_quantidade_volumes'),
    rotuloUnidadeSelecionada: (unit) => rotuloExibicaoUnidadeOpcao(unit, volumesOpcoes),
    formatarValorUnidade: (v) => formatarExibicaoQuantidadeVolume(v.quantity, v.unit, volumesOpcoes),
    getValorEditar: (row: PedidoItem) => {
      const enr = row as PedidoItemEnriquecido
      return {
        unit: (row as PedidoItem & { tipo_volume_item?: string | null }).tipo_volume_item
          ?? enr._p?.tipo_volume_pedido
          ?? '05',
        quantity: enr._p?.quantidade_volumes_pedido ?? 0,
      }
    },
    render: (row: PedidoItem) => {
      const enr = row as PedidoItemEnriquecido
      const tipo = (row as PedidoItem & { tipo_volume_item?: string | null }).tipo_volume_item
      const texto = formatarExibicaoQuantidadeVolume(
        enr._p?.quantidade_volumes_pedido,
        tipo,
        volumesOpcoes,
      )
      if (texto === '—') return <span style={{ opacity: 0.4 }}>—</span>
      return <span>{texto}</span>
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
    editavel: false,
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      const qtd = Math.max(0, (row.quantidade_inicial_pedido ?? 0) - (row.quantidade_transferida_pedido ?? 0) - (row.quantidade_cancelada_pedido ?? 0))
      return (
        <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums', color: qtd > 0 ? '#60a5fa' : undefined }}>
          {fmtQuantidade(qtd, getCasas('saldo_itens_do_pedido', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  quantidade_transferida_total: {
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_filho.mapa_quantidade_transferida_total.tooltip_bloqueado'),
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
    campo: 'quantidade_pronta_item',
    casasDecimais: getCasas('quantidade_item', 0),
    getValorEditar: (row: PedidoItem) => ({
      unit: (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN',
      quantity: Number(row.quantidade_pronta_item ?? 0),
    }),
    render: (row: PedidoItem) => {
      const unidade = (row as PedidoItemEnriquecido & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
      return (
        <span className="gtv-celula-moeda" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtQuantidade(row.quantidade_pronta_item ?? 0, getCasas('quantidade_item', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  quantidade_cancelada_total_pedido: {
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_filho.mapa_quantidade_cancelada_total_pedido.tooltip_bloqueado'),
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
  // ── Moeda Câmbio: item editável independente do pedido (mirror cobertura_cambial) ──
  moeda_cambio_pedido: {
    editavel: true,
    campo: 'moeda_cambio_item_pedido',
    opcoes: moedasOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido).moeda_cambio_item_pedido ?? '',
    render: (row: PedidoItem) => {
      const moeda = codigoMoedaExibicaoLista((row as PedidoItemEnriquecido).moeda_cambio_item_pedido)
      if (!moeda) return <span>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className="gtv-celula-moeda-badge">{moeda}</span>
        </span>
      )
    },
  },
  // ── Logística: valor no Pedido; edição na linha do item roteia para PATCH pedido ──
  porto_origem: {
    editavel: true,
    campo: 'porto_origem',
    opcoes: portosOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.porto_origem ?? null,
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      const titulo = t('pedido.coluna_pai.porto_origem')
      return wrapCelulaItemLogisticaLista(
        renderRotuloCadastro(p?.porto_origem ?? null, portosOpcoes, titulo),
      )
    },
  },
  porto_destino: {
    editavel: true,
    campo: 'porto_destino',
    opcoes: portosOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.porto_destino ?? null,
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      const titulo = t('pedido.coluna_pai.porto_destino')
      return wrapCelulaItemLogisticaLista(
        renderRotuloCadastro(p?.porto_destino ?? null, portosOpcoes, titulo),
      )
    },
  },
  local_de_origem: {
    editavel: true,
    campo: 'local_de_origem',
    opcoes: paisesOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.local_de_origem ?? null,
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      const titulo = t('pedido.coluna_pai.local_de_origem')
      return wrapCelulaItemLogisticaLista(
        renderRotuloCadastro(p?.local_de_origem ?? null, paisesOpcoes, titulo),
      )
    },
  },
  local_de_destino: {
    editavel: true,
    campo: 'local_de_destino',
    opcoes: paisesOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.local_de_destino ?? null,
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      const titulo = t('pedido.coluna_pai.local_de_destino')
      return wrapCelulaItemLogisticaLista(
        renderRotuloCadastro(p?.local_de_destino ?? null, paisesOpcoes, titulo),
      )
    },
  },
  aeroporto_origem: {
    editavel: true,
    campo: 'aeroporto_origem',
    opcoes: aeroportosOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.aeroporto_origem ?? null,
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      const titulo = t('pedido.coluna_pai.aeroporto_origem')
      return wrapCelulaItemLogisticaLista(
        renderRotuloCadastro(p?.aeroporto_origem ?? null, aeroportosOpcoes, titulo),
      )
    },
  },
  aeroporto_destino: {
    editavel: true,
    campo: 'aeroporto_destino',
    opcoes: aeroportosOpcoes,
    getValorEditar: (row: PedidoItem) => (row as PedidoItemEnriquecido)._p?.aeroporto_destino ?? null,
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      const titulo = t('pedido.coluna_pai.aeroporto_destino')
      return wrapCelulaItemLogisticaLista(
        renderRotuloCadastro(p?.aeroporto_destino ?? null, aeroportosOpcoes, titulo),
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
    'data_documento_proforma',
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
  ...buildEntradasMapaAnexoLista(t),
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

function mensagemErro(err: unknown, t: (key: string) => string = i18next.t.bind(i18next)): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const low = msg.toLowerCase()

  // ── Erros HTTP por código exato ────────────────────────────────────────────
  if (msg.includes('HTTP 400'))
    return t('pedido.lista.erro.http_400')
  if (msg.includes('HTTP 401'))
    return t('pedido.lista.erro.http_401')
  if (msg.includes('HTTP 403'))
    return t('pedido.lista.erro.http_403')
  if (msg.includes('HTTP 404'))
    return t('pedido.lista.erro.http_404')
  if (msg.includes('HTTP 409'))
    return t('pedido.lista.erro.http_409')
  if (msg.includes('HTTP 422'))
    return t('pedido.lista.erro.http_422')
  if (msg.includes('HTTP 429'))
    return t('pedido.lista.erro.http_429')
  if (/HTTP 5\d\d/.test(msg))
    return t('pedido.lista.erro.http_5xx')

  // ── Resposta inválida do servidor (JSON parse error) ──────────────────────
  if (low.includes('unexpected token') || low.includes('is not valid json') || low.includes('syntaxerror'))
    return t('pedido.lista.erro.resposta_invalida')

  // ── Erros de rede / conectividade ─────────────────────────────────────────
  if (low.includes('failed to fetch') || low.includes('networkerror') || low.includes('network request failed'))
    return t('pedido.lista.erro.sem_conexao')
  if (low.includes('timeout') || low.includes('timed out'))
    return t('pedido.lista.erro.timeout')
  if (low.includes('aborted') || low.includes('abort'))
    return t('pedido.lista.erro.cancelada')

  // ── Mensagem da API com conteúdo útil — exibir diretamente ───────────────
  // Mensagens curtas sem prefixo HTTP vêm do backend e são legíveis
  // ex: "O campo incoterm deve ser FOB, CIF ou EXW"
  const msgCampoNaoEditavel = msg.match(/^Campo "[^"]+" nao pode ser editado inline\./)
  if (msgCampoNaoEditavel) return msgCampoNaoEditavel[0]
  if (msg.length > 0 && msg.length <= 120 && !msg.startsWith('HTTP'))
    return msg

  // ── Fallback genérico ─────────────────────────────────────────────────────
  return t('pedido.lista.erro.generico')
}

// ── BarraAcoesPedido — sub-componente memoizado da barra de ações ────────────
// Extraído para evitar que ~250 linhas de JSX sejam recriadas a cada render de
// ListaPedidos. React.memo faz shallow comparison das props; useMemo no pai
// garante que o nó JSX só é recriado quando os deps de estado mudam de fato.

interface BarraAcoesPedidoProps {
  novoDropdownRef: React.RefObject<HTMLDivElement>
  novoDropdownAberto: boolean
  novoSubmenu: 'pedido' | 'item' | 'painel' | null
  onCriarPainelLista: (nome: string) => Promise<boolean>
  pedidosSelecionados: Pedido[]
  itensSelecionados: PedidoItem[]
  excluindoLote: boolean
  filtrosAtivos: FiltrosAtivosMap
  setNovoDropdownAberto: React.Dispatch<React.SetStateAction<boolean>>
  setNovoSubmenu: React.Dispatch<React.SetStateAction<'pedido' | 'item' | 'painel' | null>>
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
  /** Rótulo do escopo de workspaces (menu lateral) — chip informativo */
  rotuloEscopoWorkspaces?: string | null
  /** Nomes completos para tooltip do chip de escopo */
  tooltipEscopoWorkspaces?: React.ReactNode
  /** Abre o menu de workspaces no sidebar */
  onAbrirMenuWorkspaces?: () => void
  /** Abre o popover de filtro da coluna ao clicar no body do chip — UX 2026-05-13 */
  onFiltroColuna?: (key: string, anchor: HTMLElement) => void
  podeEditarLista: boolean
  /** Chip de status da faixa de navegação (ex: "Status: Em Andamento") */
  filtroStatus?: GTFiltroStatusToolbar
}

function ListaNumeradaWorkspacesTooltip({ nomes }: { nomes: readonly string[] }) {
  if (nomes.length === 1) {
    return <span>{nomes[0]}</span>
  }

  return (
    <ul className="pedido-escopo-ws-tooltip-list">
      {nomes.map((nome, indice) => (
        <li key={`${indice}-${nome}`} className="pedido-escopo-ws-tooltip-item">
          <span className="pedido-escopo-ws-tooltip-num" aria-hidden="true">{indice + 1}</span>
          <span className="pedido-escopo-ws-tooltip-nome">{nome}</span>
        </li>
      ))}
    </ul>
  )
}

const BarraAcoesPedido = React.memo(function BarraAcoesPedido({
  novoDropdownRef,
  novoDropdownAberto,
  novoSubmenu,
  onCriarPainelLista,
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
  rotuloEscopoWorkspaces,
  tooltipEscopoWorkspaces,
  onAbrirMenuWorkspaces,
  onFiltroColuna,
  podeEditarLista,
  filtroStatus,
}: BarraAcoesPedidoProps) {
  const { t } = useTranslation()
  const [novoNomePainelLista, setNovoNomePainelLista] = useState('')
  return (
    <>
      {/* ── Dropdown "Novo" — Pedido · Item · Coluna · Painel ── */}
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
              title={podeEditarLista ? undefined : t('pedido.barra.sem_permissao_criar_pedido')}
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
                    ...(PRODUCT_CONFIG.features.smart_read ? [{
                      icon: 'sparkle' as const,
                      label: t('pedido.barra.smart_read'),
                      desc: t('pedido.barra.smart_read_desc_pedido'),
                      action: () => {
                        setNovoDropdownAberto(false)
                        window.location.href = '/smart-read/lista?origem=pedido&acao=nova-leitura'
                      },
                    }] : []),
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
              title={podeEditarLista ? undefined : t('pedido.barra.sem_permissao_criar_item')}
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
                    ...(PRODUCT_CONFIG.features.smart_read ? [{
                      icon: 'sparkle' as const,
                      label: t('pedido.barra.smart_read'),
                      desc: t('pedido.barra.smart_read_desc_item'),
                      action: () => {
                        setNovoDropdownAberto(false)
                        window.location.href = '/smart-read/lista?origem=pedido&acao=nova-leitura'
                      },
                    }] : []),
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

            <div style={{ height: 1, margin: '0.25rem 0.375rem', background: 'var(--border-subtle)' }} />

            {/* ── Novo Painel (lista) ── */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setNovoSubmenu('painel')}
              onMouseLeave={() => setNovoSubmenu(null)}
            >
              <button type="button" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.5rem', padding: '0.5rem 0.625rem', border: 'none', borderRadius: '0.5rem',
                background: novoSubmenu === 'painel' ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(139,92,246,0.12)', flexShrink: 0 }}>
                    <SquaresFour size={13} weight="duotone" style={{ color: '#a78bfa' }} />
                  </span>
                  {t('pedido.lista.painel_novo', { defaultValue: 'Novo painel' })}
                </span>
                <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>

              {novoSubmenu === 'painel' && (
                <form
                  style={{
                    position: 'absolute', left: '100%', top: 0, marginLeft: '4px', zIndex: 301,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                    minWidth: '220px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem',
                  }}
                  onSubmit={e => {
                    e.preventDefault()
                    const nome = novoNomePainelLista.trim()
                    if (!nome) return
                    void (async () => {
                      const ok = await onCriarPainelLista(nome)
                      if (!ok) return
                      setNovoNomePainelLista('')
                      setNovoDropdownAberto(false)
                      setNovoSubmenu(null)
                    })()
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('pedido.lista.painel_novo_placeholder', { defaultValue: 'Nome do painel' })}
                    value={novoNomePainelLista}
                    onChange={e => setNovoNomePainelLista(e.target.value)}
                    maxLength={60}
                    style={{
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.375rem 0.625rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      background: 'rgba(139,92,246,0.25)',
                      color: '#c4b5fd',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t('pedido.dashboard.painel_criar', { defaultValue: 'Criar' })}
                  </button>
                </form>
              )}
            </div>
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
            icone={<GitMerge size={14} weight="duotone" />}
            disabled={!podeEditarLista || (() => {
              // Total de pedidos = inteiros + parciais (pedidos-pai de itens avulsos)
              const inteirosIds = new Set(pedidosSelecionados.map(p => p.id))
              const parciaisIds = new Set(itensSelecionados.map(i => i.pedido_id).filter(id => !inteirosIds.has(id)))
              return (inteirosIds.size + parciaisIds.size) < 2
            })()}
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

        {/* Duplicar — aceita pedido E/OU item (modal único trata mistura) */}
        <TooltipGlobal
          titulo={(() => {
            const labelItem = itensSelecionados.length === 1 ? t('pedido.barra.label_item_one') : t('pedido.barra.label_item_other')
            const labelPedido = pedidosSelecionados.length === 1 ? t('pedido.barra.label_pedido_one') : t('pedido.barra.label_pedido_other')
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
            icone={<StackPlus size={14} weight="duotone" />}
            aria-label={t('pedido.barra.duplicar')}
            disabled={!podeEditarLista || (pedidosSelecionados.length === 0 && itensSelecionados.length === 0)}
            onClick={() => setModalDuplicarAberto(true)}
          />
        </TooltipGlobal>

        {/* Gerar Documento — aceita pedido, item ou misto (agrupa itens por pedido) */}
        <TooltipGlobal
          titulo={(() => {
            const labelItem = itensSelecionados.length === 1 ? t('pedido.barra.label_item_one') : t('pedido.barra.label_item_other')
            const labelPedido = pedidosSelecionados.length === 1 ? t('pedido.barra.label_pedido_one') : t('pedido.barra.label_pedido_other')
            if (pedidosSelecionados.length > 0 && itensSelecionados.length > 0) {
              return `${t('pedido.barra.gerar_documento')} · ${pedidosSelecionados.length} ${labelPedido} + ${itensSelecionados.length} ${labelItem}`
            }
            if (pedidosSelecionados.length > 0) {
              return `${t('pedido.barra.gerar_documento')} · ${pedidosSelecionados.length} ${labelPedido}`
            }
            if (itensSelecionados.length > 0) {
              return `${t('pedido.barra.gerar_documento')} · ${itensSelecionados.length} ${labelItem}`
            }
            return t('pedido.barra.gerar_documento')
          })()}
          descricao={t('pedido.barra.gerar_documento_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<FilePdf size={14} weight="duotone" />}
            disabled={pedidosSelecionados.length === 0 && itensSelecionados.length === 0}
            onClick={() => setModalGerarPdfAberto(true)}
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
      {(Object.keys(filtrosAtivos).length > 0 || busca || rotuloEscopoWorkspaces || filtroStatus) && (
        <FiltroChips
          colunas={COLUNAS_PAI}
          filtrosAtivos={filtrosAtivos}
          onLimparFiltro={handleLimparFiltro}
          onLimparTodos={handleLimparTodosFiltros}
          onEditarFiltro={onFiltroColuna}
          thresholdConsolidar={2}
          prefixo={(
            <>
              {rotuloEscopoWorkspaces ? (
                <TooltipGlobal
                  titulo={t('pedido.lista.chip_escopo_workspaces', { defaultValue: 'Workspaces' })}
                  descricao={tooltipEscopoWorkspaces ?? rotuloEscopoWorkspaces}
                  interativo
                  posicaoPreferida="abaixo"
                >
                  <button
                    type="button"
                    className="fc-chip fc-chip--escopo fc-chip--escopo-btn"
                    onClick={onAbrirMenuWorkspaces}
                    aria-label={t('pedido.lista.chip_escopo_workspaces_hint', { defaultValue: 'Alterar workspaces selecionados' })}
                  >
                    <span className="fc-chip-label">{t('pedido.lista.chip_escopo_workspaces', { defaultValue: 'Workspaces' })}:</span>
                    <span className="fc-chip-valor">{rotuloEscopoWorkspaces}</span>
                  </button>
                </TooltipGlobal>
              ) : null}
              {filtroStatus ? <FiltroChipStatus {...filtroStatus} /> : null}
              {busca ? (
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
            </>
          )}
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
  const { unidadesPeso, unidadesCubagem, mapaFatorParaKg } = useUnidadesPedido()
  const { volumesOpcoes } = useVolumesPedido()
  // Incoterms — SSOT cadastros.incoterm via hook (substitui hardcode em 2026-05-13).
  const { incotermsOpcoes } = useIncotermsPedido()
  const { coberturaCambialOpcoes, modalidadePagamentoOpcoes } = useCambioSiscomexPedido()
  // Moedas — SSOT cadastros.moeda via hook (select inline em moeda_pedido).
  const { moedasOpcoes } = useMoedasPedido()
  const {
    paisesOpcoes: paisesLogisticaOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
  } = useLogisticaCadastrosPedido()
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

  // SSOT de nomes: /me (shell) carrega antes do /hub/init da Lista — mesclar evita coluna Workspace/Importador IMP com ID cru.
  const workspacesShell = useShellStore(s => s.workspaces)

  // Declarado antes de workspacesMap/workspaceOpcoesLista (enriquecimento de nomes a partir dos pedidos carregados).
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  const workspacesMap = useMemo(() => {
    const m = new Map<string, { nome: string; cnpj?: string | null }>()
    const registrar = (id: string, nome: string, cnpj?: string | null) => {
      const idWs = id.trim()
      if (!idWs) return
      const label = nome.trim() || idWs
      const prev = m.get(idWs)
      if (!prev || (prev.nome === idWs && label !== idWs)) {
        m.set(idWs, { nome: label, cnpj: cnpj ?? prev?.cnpj ?? null })
      }
    }
    for (const w of workspacesDisponiveis) {
      registrar(w.id_workspace, w.nome_workspace, w.cnpj_workspace ?? null)
    }
    for (const w of workspacesShell) {
      registrar(w.id, w.nome_workspace)
    }
    for (const p of pedidos) {
      if (tipoOperacaoLista(p) !== 'importacao') continue
      const id = extrairIdWorkspaceDePedido(p)
      const snap = snapshotNomeImportadorLegivel(p.nome_importador)
      if (snap) registrar(id, snap)
    }
    return m
  }, [workspacesDisponiveis, workspacesShell, pedidos])

  // Colunas pai reativas — rebuild quando o idioma muda OU quando o catálogo
  // de unidades do Cadastros termina de carregar (primeiro render: vazio).
  // ── Colunas do Usuário ────────────────────────────────────────────────────────
  const [colunasUsuario, setColunasUsuario] = useState<ColunaUsuario[]>([])
  const [temExpandido, setTemExpandido] = useState(false)

  // Status customizados — declarado antes de mapaColunasFilho/colunasComUsuario (ambos usam statusOpts).
  const [statusOpts, setStatusOpts] = useState<{ valor: string; label: string }[]>(() => {
    const abas = lerAbasDoLocalStorage(t)
    return abas
      ? abas.filter(a => a.valor !== 'todos').map(a => ({ valor: a.valor, label: a.label }))
      : [
          { valor: 'rascunho',      label: t('pedido.status.rascunho')      },
          { valor: 'aberto',        label: t('pedido.status.aberto')        },
          { valor: 'em_andamento',  label: t('pedido.status.em_andamento')  },
          { valor: 'aprovado',      label: t('pedido.status.aprovado')      },
          { valor: 'transferencia', label: t('pedido.status.transferencia') },
          { valor: 'consolidado',   label: t('pedido.status.consolidado')   },
          { valor: 'cancelado',     label: t('pedido.status.cancelado')     },
        ]
  })

  /** Opções do select de Workspace — usado em id_workspace e Importador (importação). */
  const workspaceOpcoesLista = useMemo(() => {
    const seen = new Set<string>()
    const opcoes: { valor: string; label: string }[] = []
    const push = (id: string, label: string) => {
      const valor = id.trim()
      if (!valor || seen.has(valor)) return
      seen.add(valor)
      opcoes.push({ valor, label: label.trim() || valor })
    }
    for (const w of workspacesDisponiveis) {
      push(w.id_workspace, w.nome_workspace.trim() || w.id_workspace)
    }
    for (const w of workspacesShell) {
      push(w.id, w.nome_workspace.trim() || w.id)
    }
    // Sempre mesclar workspaces dos pedidos carregados — hub/init pode falhar ou atrasar.
    for (const p of pedidos) {
      const id = extrairIdWorkspaceDePedido(p)
      const snap = tipoOperacaoLista(p) === 'importacao'
        ? snapshotNomeImportadorLegivel(p.nome_importador)
        : null
      const label = nomeLegivelWorkspace(id, workspacesMap, undefined, snap)
      const fallback = workspacesMap.get(id)?.nome?.trim()
      push(id, label !== '—' ? label : (fallback && !pareceIdInternoGravity(fallback) ? fallback : id))
    }
    return opcoes.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [workspacesDisponiveis, workspacesShell, pedidos, workspacesMap])

  const idOrganizacao = useShellStore(s => s.currentUser.idOrganizacao ?? (import.meta.env.VITE_DEV_ID_ORGANIZACAO as string | undefined) ?? '')

  const [opcoesImportadoresExp, setOpcoesImportadoresExp] = useState<{ valor: string; label: string }[]>([])
  const [opcoesExportadoresImp, setOpcoesExportadoresImp] = useState<{ valor: string; label: string }[]>([])

  useEffect(() => {
    if (!idOrganizacao) return
    let cancelado = false
    cadastrosApi.listarImportadores()
      .then((res) => {
        if (cancelado) return
        setOpcoesImportadoresExp(mapearOpcoesImportadorExportacao(res.itens))
      })
      .catch(() => {
        if (!cancelado) setOpcoesImportadoresExp([])
      })
    cadastrosApi.listarExportadores()
      .then((res) => {
        if (cancelado) return
        setOpcoesExportadoresImp(mapearOpcoesExportadorImportacao(res.itens))
      })
      .catch(() => {
        if (!cancelado) setOpcoesExportadoresImp([])
      })
    return () => { cancelado = true }
  }, [idOrganizacao])

  /** EXP: só fornecedores importadores — nunca workspaces (mesmo nome). */
  const opcoesImportadoresExpLista = useMemo(
    () => filtrarOpcoesImportadorExpSemWorkspaces(opcoesImportadoresExp, workspaceOpcoesLista),
    [opcoesImportadoresExp, workspaceOpcoesLista],
  )

  /** IMP: só fornecedores exportadores — nunca workspaces (mesmo nome). */
  const opcoesExportadoresImpLista = useMemo(
    () => filtrarOpcoesExportadorImpSemWorkspaces(opcoesExportadoresImp, workspaceOpcoesLista),
    [opcoesExportadoresImp, workspaceOpcoesLista],
  )

  // Re-sanitiza quando workspaces ou fornecedores terminam de carregar (corrige CUID residual).
  useEffect(() => {
    setPedidos((prev) => {
      if (prev.length === 0) return prev
      const next = sanitizarNomesPartesListaPedidos(
        prev,
        workspacesDisponiveis,
        workspacesShell,
        opcoesImportadoresExp,
        opcoesExportadoresImp,
      )
      const mudou = next.some((p, i) =>
        p.nome_importador !== prev[i]?.nome_importador
        || p.nome_exportador !== prev[i]?.nome_exportador,
      )
      return mudou ? next : prev
    })
  }, [opcoesImportadoresExp, opcoesExportadoresImp, workspacesDisponiveis, workspacesShell, workspaceOpcoesLista])

  const opcoesUnidadesColunas = useMemo<OpcoesUnidadesColunas>(
    () => ({
      unidadesPeso,
      unidadesCubagem,
      mapaFatorParaKg,
      volumesOpcoes,
      incotermsOpcoes,
      coberturaCambialOpcoes,
      modalidadePagamentoOpcoes,
      moedasOpcoes,
      workspacesMap,
      workspaceOpcoesLista,
      opcoesImportadoresExpLista,
      opcoesExportadoresImpLista,
      paisesOpcoes: paisesLogisticaOpcoes,
      portosOpcoes,
      aeroportosOpcoes,
    }),
    [
      unidadesPeso,
      unidadesCubagem,
      mapaFatorParaKg,
      volumesOpcoes,
      incotermsOpcoes,
      coberturaCambialOpcoes,
      modalidadePagamentoOpcoes,
      moedasOpcoes,
      workspacesMap,
      workspaceOpcoesLista,
      opcoesImportadoresExpLista,
      paisesLogisticaOpcoes,
      portosOpcoes,
      aeroportosOpcoes,
    ],
  )

  const colunasPai = useMemo(
    () => buildColunasPai(t, opcoesUnidadesColunas),
    [t, i18n.language, opcoesUnidadesColunas],
  )

  const mapaColunasFilho = useMemo(() => {
    const base = buildMapaColunasFilho(t, opcoesUnidadesColunas)
    const chavesColunaPersonalizada = new Set(
      colunasUsuario
        .filter(c => {
          const escopoCol = c.escopo || 'ambos'
          return c.tipo !== 'formula' && (escopoCol === 'item' || escopoCol === 'ambos')
        })
        .map(c => c.chave),
    )
    const custom: Record<string, GTMapaColunasFilho<PedidoItem>> = {}
    for (const col of colunasUsuario) {
      const escopo = col.escopo || 'ambos'
      if (col.tipo === 'anexo') {
        if (escopo === 'pedido') {
          custom[col.chave] = {
            editavel: false,
            tooltipBloqueado: t('pedido.config.colunas.personalizadas.tooltip_escopo_pedido', 'Esta coluna é exclusiva do pedido. Para editar, clique na linha do pedido.'),
            render: () => <span style={{ opacity: 0.4 }}>—</span>,
          }
        } else {
          custom[col.chave] = {
            editavel: false,
            render: (row: PedidoItem) =>
              renderCelulaAnexoLista({
                vinculo: 'item',
                vinculo_id: row.id,
                chaveColuna: col.chave,
                colunaNome: col.nome,
                categoriaOverride: col.id,
              }),
          }
        }
        continue
      }
      if (escopo === 'pedido') {
        custom[col.chave] = {
          editavel: false,
          tooltipBloqueado: t('pedido.config.colunas.personalizadas.tooltip_escopo_pedido', 'Esta coluna é exclusiva do pedido. Para editar, clique na linha do pedido.'),
          render: () => <span style={{ opacity: 0.4 }}>—</span>,
        }
        continue
      }
      const renderValorColunaPersonalizada = (row: PedidoItem) => {
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
      }
      const editavelItem = col.tipo !== 'formula'
      custom[col.chave] = {
        editavel: editavelItem,
        tooltipInline: true,
        tooltipTitulo: col.nome,
        opcoes: col.tipo === 'checkbox'
          ? [{ valor: 'true', label: '✓ Sim' }, { valor: 'false', label: '✗ Não' }]
          : (col.tipo === 'select' || col.tipo === 'tipo_documento') && col.opcoes?.length
            ? col.opcoes.map(o => ({ valor: o, label: o }))
            : undefined,
        render: (row: PedidoItem) => wrapCelulaListaRegras(renderValorColunaPersonalizada(row), t, {
          key: col.chave,
          nivel: 'item',
          colunaPersonalizada: true,
          descricaoUsuario: col.descricao,
          cursorBloqueado: !editavelItem,
        }),
        getValorEditar: (row: PedidoItem) => {
          const valores = (row as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> | undefined
          const raw = valores?.[col.id]
          if (raw == null) return col.tipo === 'numero' || col.tipo === 'percentual' ? 0 : ''
          if (col.tipo === 'numero' || col.tipo === 'percentual') return Number(raw) || 0
          return raw
        },
      }
    }
    if (base.status) {
      const STATUS_OPTS_FILHO = statusOpts
      base.status = {
        ...base.status,
        opcoes: STATUS_OPTS_FILHO,
        render: (row: PedidoItem) => {
          const enr = row as PedidoItemEnriquecido
          const p = enr._p
          if (!p) return null
          const itemStatus = p.status
          const cor = getStatusCor(itemStatus)
          const badge = (
            <StatusBadgeGlobal
              valor={getStatusLabel(itemStatus)}
              genero="masculino"
              style={{ color: cor, background: `${cor}1e`, border: `1px solid ${cor}33` }}
            />
          )
          const pedidoPai = pedidos.find(pd => pd.id === p.id)
          const pedidoStatus = pedidoPai?.status
          const itensCache = itensCarregadosRef.current.get(p.id) ?? []
          const statusesItens = itensCache
            .map(i => (i as PedidoItemEnriquecido)._p?.status)
            .filter((s): s is string => s != null && s !== '')
          const distintosItens = new Set(statusesItens).size
          const divergente = (pedidoStatus != null && itemStatus !== pedidoStatus) || distintosItens > 1
          if (!divergente) return badge
          return (
            <TooltipGlobal
              titulo={t('pedido.coluna_pai.status')}
              descricao={t('pedido.coluna_pai.status_divergente', 'Status divergente entre pedido e itens')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {badge}
                <Warning size={14} weight="fill" style={{ color: '#F59E0B', flexShrink: 0 }} />
              </span>
            </TooltipGlobal>
          )
        },
      }
    }
    if (base.nome_importador) {
      base.nome_importador = {
        ...base.nome_importador,
        editavel: false,
        tooltipBloqueado: t('pedido.coluna_filho.mapa_nome_importador.tooltip_bloqueado'),
      }
    }
    if (base.nome_exportador) {
      base.nome_exportador = {
        ...base.nome_exportador,
        editavel: false,
        tooltipBloqueado: t('pedido.coluna_filho.mapa_nome_exportador.tooltip_bloqueado_cond'),
      }
    }
    const merged = { ...base, ...custom }
    if (base.moeda_pedido) {
      merged.moeda_pedido = {
        ...base.moeda_pedido,
        ...custom.moeda_pedido,
        campo: 'moeda_item',
        render: base.moeda_pedido.render,
      }
    }
    const renderMoedaItemBase = merged.moeda_pedido?.render
    const renderPesoLiqItemBase = merged.peso_liquido_total_pedido?.render
    const renderPesoBruItemBase = merged.peso_bruto_total_pedido?.render
    const comRegra = enriquecerMapaColunasFilhoComRegraTooltip(merged, t, { chavesColunaPersonalizada })
    const mapaInline = enriquecerMapaFilhoTooltipInline(comRegra, t, CHAVES_TOOLTIP_INLINE_LISTA, {
      moeda_pedido: t('pedido.coluna_pai.aviso_impacto_moeda', { defaultValue: '' }) || undefined,
      moeda_cambio_pedido: t('pedido.coluna_pai.aviso_impacto_moeda_cambio', { defaultValue: '' }) || undefined,
      valor_total_cambio_pedido: t('pedido.lista.regras_coluna.valor_total_cambio_impacto_edicao', { defaultValue: '' }) || undefined,
      unidade_comercializada_pedido: t('pedido.coluna_pai.aviso_impacto_unidade_full', { defaultValue: '' }) || undefined,
      peso_liquido_total_pedido: t('pedido.coluna_pai.aviso_impacto_peso_bruto', { defaultValue: '' }) || undefined,
      peso_bruto_total_pedido: t('pedido.coluna_pai.aviso_impacto_peso_liquido', { defaultValue: '' }) || undefined,
      tipo_volume_pedido: t('pedido.coluna_pai.aviso_impacto_tipo_volume', { defaultValue: '' }) || undefined,
      quantidade_volumes_pedido: t('pedido.coluna_pai.aviso_impacto_quantidade_volumes', { defaultValue: '' }) || undefined,
    })
    // P0 moeda item: garantia explícita — TooltipListaColuna nível item (não depende de flags do núcleo).
    if (renderMoedaItemBase && mapaInline.moeda_pedido) {
      const avisoMoeda = t('pedido.coluna_pai.aviso_impacto_moeda', { defaultValue: '' }) || undefined
      mapaInline.moeda_pedido = {
        ...mapaInline.moeda_pedido,
        tooltipInline: true,
        tooltipTitulo: t('pedido.coluna_pai.moeda_item_titulo'),
        campo: 'moeda_item',
        render: (row: PedidoItem) => wrapCelulaListaRegras(renderMoedaItemBase(row), t, {
          key: 'moeda_pedido',
          nivel: 'item',
          avisoImpactoColuna: avisoMoeda,
        }),
      }
    }
    const renderMoedaCambioItemBase = merged.moeda_cambio_pedido?.render
    if (renderMoedaCambioItemBase && mapaInline.moeda_cambio_pedido) {
      const avisoMoedaCambio = t('pedido.coluna_pai.aviso_impacto_moeda_cambio', { defaultValue: '' }) || undefined
      mapaInline.moeda_cambio_pedido = {
        ...mapaInline.moeda_cambio_pedido,
        tooltipInline: true,
        tooltipTitulo: t('pedido.coluna_pai.moeda_cambio_titulo', { defaultValue: t('pedido.coluna_pai.moeda_cambio') }),
        campo: 'moeda_cambio_item_pedido',
        render: (row: PedidoItem) => wrapCelulaListaRegras(renderMoedaCambioItemBase(row), t, {
          key: 'moeda_cambio_pedido',
          nivel: 'item',
          avisoImpactoColuna: avisoMoedaCambio,
        }),
      }
    }
    if (renderPesoLiqItemBase && mapaInline.peso_liquido_total_pedido) {
      const avisoPesoBruto = t('pedido.coluna_pai.aviso_impacto_peso_bruto', { defaultValue: '' }) || undefined
      mapaInline.peso_liquido_total_pedido = {
        ...mapaInline.peso_liquido_total_pedido,
        tooltipInline: true,
        tooltipTitulo: t('pedido.coluna_pai.peso_liquido_item_titulo'),
        render: (row: PedidoItem) => wrapCelulaListaRegras(renderPesoLiqItemBase(row), t, {
          key: 'peso_liquido_total_pedido',
          nivel: 'item',
          modoDinamicoPedidoItem: true,
          avisoImpactoColuna: avisoPesoBruto,
        }),
      }
    }
    if (renderPesoBruItemBase && mapaInline.peso_bruto_total_pedido) {
      const avisoPesoLiq = t('pedido.coluna_pai.aviso_impacto_peso_liquido', { defaultValue: '' }) || undefined
      mapaInline.peso_bruto_total_pedido = {
        ...mapaInline.peso_bruto_total_pedido,
        tooltipInline: true,
        tooltipTitulo: t('pedido.coluna_pai.peso_bruto_item_titulo'),
        render: (row: PedidoItem) => wrapCelulaListaRegras(renderPesoBruItemBase(row), t, {
          key: 'peso_bruto_total_pedido',
          nivel: 'item',
          modoDinamicoPedidoItem: true,
          avisoImpactoColuna: avisoPesoLiq,
        }),
      }
    }
    return mapaInline
  }, [t, i18n.language, opcoesUnidadesColunas, colunasUsuario, statusOpts, pedidos, opcoesImportadoresExp, opcoesExportadoresImp, workspacesMap])
  const {
    prefs: cardPrefs,
    visiveis: cardsVisiveis,
    periodo: periodoCards,
    persistir: persistirCardPrefs,
    setPeriodo: setPeriodoCards,
  } = useCardPreferences()
  const cardsVisiveisIdsKey = useMemo(
    () => cardsVisiveis.map(c => c.id).join('\0'),
    [cardsVisiveis],
  )
  const navigate = useNavigate()
  const location = useLocation()
  const addNotification = useShellStore(s => s.addNotification)

  // ── Escopo multi-workspace (menu lateral — SSOT do produto) ─────────────────
  const idsWorkspacesEscopo = useEscopoWorkspacesPedido(s => s.idsWorkspacesEscopo)
  const escopoHidratado = useEscopoWorkspacesPedido(s => s.hidratado)
  const versaoEscopo = useEscopoWorkspacesPedido(s => s.versaoEscopo)
  const workspaceAtivo = useShellStore(s => s.idWorkspaceAtivo ?? '')
  const pedirAbrirMenuWorkspaces = useEscopoWorkspacesPedido(s => s.pedirAbrirMenuWorkspaces)
  const workspacesSelecionados = idsWorkspacesEscopo

  const {
    paineis: paineisLista,
    setPaineis: setPaineisLista,
    painelAtualId: painelListaAtualId,
    setPainelAtualId: setPainelListaAtualId,
    painelAtual: painelListaAtual,
    carregando: carregandoPaineisLista,
    aplicarConfigDoPainel,
    persistirPainelAtual,
    trocarPainel: trocarPainelLista,
    criarPainel: criarPainelLista,
  } = useListaPainelPedido()
  const painelListaAplicadoRef = useRef<string | null>(null)
  /** Evita 2º carregarInicial do efeito de escopo antes do painel hidratar (causava flash → zero). */
  const escopoListaInicialDisparadoRef = useRef(false)
  const versaoEscopoAnteriorRef = useRef(0)
  /** Carga do painel adiada até escopo de workspaces ter ao menos uma filial. */
  const painelSnapshotPendenteRef = useRef<SnapshotAplicarListaPainel | null>(null)
  /** Cache da última listagem de colunas manuais — merge só após hidratação do painel. */
  const colunasUsuarioListaRef = useRef<ColunaUsuario[]>([])

  useEffect(() => {
    painelListaAplicadoRef.current = null
    escopoListaInicialDisparadoRef.current = false
    versaoEscopoAnteriorRef.current = 0
    painelSnapshotPendenteRef.current = null
  }, [idOrganizacao])

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
        'x-internal-key': (import.meta as any).env?.VITE_CHAVE_INTERNA_SERVICO || '',
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
  const [carregando, setCarregando]         = useState(true)
  // Erro do ultimo carregamento — usado pelo empty state para diferenciar
  // "lista vazia" de "falhou ao carregar" (Mand. 08, sem fallback silencioso).
  const [erroCarga, setErroCarga]           = useState<string | null>(null)
  // Total global de matches no find-in-page (calculado via pré-scan de todos os registros)
  const [findTotalExterno, setFindTotalExterno] = useState<number | null>(null)
  const [paginaAtual, setPaginaAtual]       = useState(1)
  const [total, setTotal]                   = useState(0)
  const [totalItensBanco, setTotalItensBanco] = useState(0)
  const [tabelaConfig, setTabelaConfig] = useState<TabelaConfigPedido>(carregarTabelaConfigPedido)
  const ITENS_POR_PAGINA = tabelaConfig.linhasPorPagina

  useEffect(() => {
    const sync = () => setTabelaConfig(carregarTabelaConfigPedido())
    window.addEventListener(SYNC_EVENT_TABELA_PEDIDO, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT_TABELA_PEDIDO, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const hojeIsoLista = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const classNameLinhaPai = useCallback((linha: Pedido) => {
    if (!tabelaConfig.destacarAtrasados) return undefined
    return isPedidoAtrasado(linha, hojeIsoLista) ? 'gtv-linha--atrasado' : undefined
  }, [tabelaConfig.destacarAtrasados, hojeIsoLista])

  // ── Seleção de pedidos/itens via selecaoStore (Zustand) ──────────────────────
  const { setPedidosSelecionados, setItensSelecionados } = useSelecaoStore()
  const pedidosSelecionados = usePedidosSelecionados()
  const itensSelecionados = useItensSelecionados()
  const hasMixedTipos = useHasMixedTipos()

  // Pedidos para edição em massa: prioridade pedidos selecionados, fallback pedidos pais dos itens
  const pedidosParaEdicaoMassa = useMemo(() => {
    // Caso 1: apenas itens selecionados (sem pais) → resolve pais únicos
    if (pedidosSelecionados.length === 0) {
      if (itensSelecionados.length === 0) return []
      const idsPais = [...new Set(itensSelecionados.map(i => i.pedido_id))]
      const mapa = new Map(pedidos.map(p => [p.id, p]))
      return idsPais.map(id => mapa.get(id)).filter((p): p is Pedido => p != null)
    }
    // Caso 2: apenas pais selecionados (sem itens avulsos)
    if (itensSelecionados.length === 0) return pedidosSelecionados
    // Caso 3: misto — pais selecionados + itens avulsos de outros pedidos.
    // Merge ambas as fontes com dedup por ID para incluir todos os pedidos afetados.
    const idsJaInclusos = new Set(pedidosSelecionados.map(p => p.id))
    const mapa = new Map(pedidos.map(p => [p.id, p]))
    const extras: Pedido[] = []
    for (const item of itensSelecionados) {
      if (!idsJaInclusos.has(item.pedido_id)) {
        const p = mapa.get(item.pedido_id)
        if (p) {
          extras.push(p)
          idsJaInclusos.add(item.pedido_id)
        }
      }
    }
    return extras.length > 0 ? [...pedidosSelecionados, ...extras] : pedidosSelecionados
  }, [pedidosSelecionados, itensSelecionados, pedidos])

  // IDs de itens para edição em massa — REGRA: editar APENAS o que está selecionado.
  // Quando itens estão selecionados, sempre enviar seus IDs ao backend.
  // Quando pedidos estão selecionados (sem itens avulsos), não enviar item_ids
  // para que o backend edite todos os itens desses pedidos.
  // Caso misto: itens selecionados + pedidos explícitos → incluir itens selecionados
  // + todos os itens dos pedidos explicitamente selecionados (cujos itens estão carregados).
  const itensSelecionadosIdsParaMassa = useMemo((): string[] | undefined => {
    // Caso 2: apenas pedidos selecionados → backend edita todos os itens deles
    if (itensSelecionados.length === 0) return undefined

    // Caso 1: apenas itens selecionados (sem pedidos explícitos)
    if (pedidosSelecionados.length === 0) {
      return itensSelecionados.map(i => i.id)
    }

    // Caso 3: misto — pedidos explícitos + itens avulsos.
    // Incluir TODOS os itens dos pedidos explicitamente selecionados (seleção de
    // pedido = "todos os seus itens") + os itens selecionados individualmente.
    const idsSet = new Set<string>()
    // Itens dos pedidos explicitamente selecionados
    for (const p of pedidosSelecionados) {
      if (p.itens && p.itens.length > 0) {
        for (const item of p.itens) idsSet.add(item.id)
      }
    }
    // Itens selecionados individualmente (podem ser de outros pedidos)
    for (const item of itensSelecionados) idsSet.add(item.id)
    return Array.from(idsSet)
  }, [pedidosSelecionados, itensSelecionados])

  // Caso misto: pedidos explicitamente selecionados recebem tratamento completo
  // (campos de nível pedido + itens), mesmo quando item_ids está presente.
  const pedidoIdsCompletoParaMassa = useMemo((): string[] | undefined => {
    if (pedidosSelecionados.length === 0 || itensSelecionados.length === 0) return undefined
    return pedidosSelecionados.map(p => p.id)
  }, [pedidosSelecionados, itensSelecionados])

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
  const [sortCampo, setSortCampo]           = useState(SORT_LISTA_NOVOS_PEDIDO.campo)
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>(SORT_LISTA_NOVOS_PEDIDO.direcao)
  const [busca, setBusca]                   = useState('')
  const [pedidoFocoId, setPedidoFocoId]       = useState<string | null>(null)
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

  useEffect(() => {
    const sync = () => {
      const abasLocal = lerAbasDoLocalStorage(t)
      if (abasLocal && abasLocal.length > 1) {
        setAbas(abasLocal)
        setStatusOpts(abasLocal.filter(a => a.valor !== 'todos').map(a => ({ valor: a.valor, label: a.label })))
      }
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
            const divergente = (row as Record<string, unknown>).status_divergente === true
            const badge = (
              <StatusBadgeGlobal
                valor={getStatusLabel(row.status)}
                genero="masculino"
                style={{ color: cor, background: `${cor}1e`, border: `1px solid ${cor}33`, cursor: 'pointer' }}
              />
            )
            return renderAgregado(
              badge,
              divergente,
              t('pedido.coluna_pai.status_divergente', 'Status divergente entre pedido e itens'),
            )
          },
        }
      }

      if (col.key === 'id_workspace') {
        return {
          ...col,
          editavel: true,
          opcoes: workspaceOpcoesLista,
          getValorEditar: (row: Pedido) => extrairIdWorkspaceDePedido(row),
          render: (_val: unknown, row: Pedido) => {
            const id = extrairIdWorkspaceDePedido(row)
            const nome = nomeLegivelWorkspace(
              id,
              workspacesMap,
              workspaceOpcoesLista,
              row.tipo_operacao === 'importacao' ? row.nome_importador : null,
            )
            return <span style={{ display: 'block', textAlign: 'left' }}>{nome}</span>
          },
        }
      }

      if (col.key === 'nome_exportador') {
        // EXP: lista workspaces (igual id_workspace). IMP: lista fornecedores exportadores.
        const WORKSPACE_OPTS_EXP = workspaceOpcoesLista
        return enriquecerColunaComRegraTooltip({
          ...col,
          tipo: 'enum',
          opcoes: WORKSPACE_OPTS_EXP,
          editavel: (row: Pedido) => {
            const tipo = comportamentoExportadorLista(row)
            return tipo === 'importacao' || tipo === 'exportacao'
          },
          getOpcoes: (row: Pedido) => {
            const tipo = comportamentoExportadorLista(row)
            if (tipo === 'exportacao') {
              return garantirOpcoesWorkspaceImportador(row, WORKSPACE_OPTS_EXP, workspacesMap)
            }
            if (tipo === 'importacao') return opcoesExportadoresImpLista
            return []
          },
          getValorEditar: (row: Pedido) => {
            const tipo = comportamentoExportadorLista(row)
            if (tipo === 'exportacao') return extrairIdWorkspaceDePedido(row)
            const idForn = row.importacao_exportador_id?.trim()
            if (idForn && !pareceIdInternoGravity(idForn)) return idForn
            return ''
          },
          linkPopoverEdicao: (row: Pedido) => {
            if (comportamentoExportadorLista(row) !== 'importacao') return undefined
            const idExp = row.importacao_exportador_id
            return {
              label: idExp
                ? t('pedido.coluna_pai.clique_editar_exportador')
                : t('pedido.coluna_pai.vincular_exportador'),
              href: urlVincularExportador(idExp, row.id),
            }
          },
          render: (val: unknown, row: Pedido) => {
            const tipo = comportamentoExportadorLista(row)
            const resolverTexto = () => {
              const exibir = nomeExibicaoExportadorPedido(row, workspacesMap, WORKSPACE_OPTS_EXP, opcoesExportadoresImpLista)
              if (exibir && exibir !== '—' && !pareceIdInternoGravity(exibir)) return exibir
              if (tipoOperacaoLista(row) === 'exportacao') {
                const doWs = nomeLegivelWorkspace(extrairIdWorkspaceDePedido(row), workspacesMap, WORKSPACE_OPTS_EXP, null)
                if (doWs !== '—') return doWs
              }
              if (typeof val === 'string' && val.trim() && !pareceIdInternoGravity(val)) return val.trim()
              return '—'
            }
            if (tipo === 'exportacao') {
              return <span style={{ display: 'block', textAlign: 'left' }}>{resolverTexto()}</span>
            }
            if (!tipo && typeof val === 'string' && pareceIdInternoGravity(val)) {
              return <span style={{ display: 'block', textAlign: 'left' }}>—</span>
            }
            const nome = resolverTexto()
            if (!nome || nome === '—') {
              return (
                <span style={{ color: '#818cf8', fontSize: '0.75rem', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                  {t('pedido.coluna_pai.vincular_exportador')}
                </span>
              )
            }
            return renderBadgeParteVinculada({
              nome,
              titulo: t('pedido.coluna_pai.parte_exportador_titulo'),
              descricao: t('pedido.coluna_pai.clique_editar_exportador'),
            })
          },
        }, t, 'pai')
      }

      if (col.key === 'nome_importador') {
        // IMP: lista todos workspaces (igual id_workspace). EXP: lista fornecedores importadores.
        const WORKSPACE_OPTS_IMP = workspaceOpcoesLista
        return enriquecerColunaComRegraTooltip({
          ...col,
          tipo: 'enum',
          opcoes: WORKSPACE_OPTS_IMP,
          editavel: (row: Pedido) => {
            const tipo = comportamentoImportadorLista(row)
            return tipo === 'importacao' || tipo === 'exportacao'
          },
          getOpcoes: (row: Pedido) => {
            const tipo = comportamentoImportadorLista(row)
            if (tipo === 'importacao') {
              return garantirOpcoesWorkspaceImportador(row, WORKSPACE_OPTS_IMP, workspacesMap)
            }
            if (tipo === 'exportacao') return opcoesImportadoresExpLista
            return []
          },
          getValorEditar: (row: Pedido) => {
            const tipo = comportamentoImportadorLista(row)
            if (tipo === 'importacao') return extrairIdWorkspaceDePedido(row)
            const idForn = row.exportacao_importador_id?.trim()
            if (idForn && !pareceIdInternoGravity(idForn)) return idForn
            return ''
          },
          linkPopoverEdicao: (row: Pedido) => {
            if (comportamentoImportadorLista(row) !== 'exportacao') return undefined
            const idImp = row.exportacao_importador_id
            return {
              label: idImp
                ? t('pedido.lista.popover.editar_importador')
                : t('pedido.coluna_pai.vincular_importador'),
              href: urlVincularImportador(idImp, row.id),
            }
          },
          render: (val: unknown, row: Pedido) => {
            const tipo = comportamentoImportadorLista(row)
            const resolverTexto = () => {
              const exibir = nomeExibicaoImportadorPedido(row, workspacesMap, WORKSPACE_OPTS_IMP, opcoesImportadoresExpLista)
              if (exibir && exibir !== '—' && !pareceIdInternoGravity(exibir)) return exibir
              if (tipoOperacaoLista(row) === 'importacao') {
                const doWs = nomeLegivelWorkspace(extrairIdWorkspaceDePedido(row), workspacesMap, WORKSPACE_OPTS_IMP, null)
                if (doWs !== '—') return doWs
              }
              if (typeof val === 'string' && val.trim() && !pareceIdInternoGravity(val)) return val.trim()
              return '—'
            }
            if (tipo === 'importacao') {
              return <span style={{ display: 'block', textAlign: 'left' }}>{resolverTexto()}</span>
            }
            if (!tipo && typeof val === 'string' && pareceIdInternoGravity(val)) {
              return <span style={{ display: 'block', textAlign: 'left' }}>—</span>
            }
            const nome = nomeExibicaoImportadorPedido(row, workspacesMap, WORKSPACE_OPTS_IMP, opcoesImportadoresExpLista)
            if (!nome) {
              return (
                <span style={{ color: '#818cf8', fontSize: '0.75rem', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                  {t('pedido.coluna_pai.vincular_importador')}
                </span>
              )
            }
            return renderBadgeParteVinculada({
              nome,
              titulo: t('pedido.coluna_pai.parte_importador_titulo'),
              descricao: t('pedido.coluna_pai.clique_editar_importador_lista'),
            })
          },
        }, t, 'pai')
      }

      const COLUNAS_DINAMICAS_PEDIDO_ITEM: Record<string, string> = {
        valor_total_pedido:                   t('pedido.lista.coluna_dinamica.valor_total'),
        valor_total_cambio_pedido:            t('pedido.lista.coluna_dinamica.valor_total_cambio'),
        quantidade_total_pedido:              t('pedido.lista.coluna_dinamica.qtd_inicial'),
        quantidade_pronta_itens_pedido_total: t('pedido.lista.coluna_dinamica.qtd_pronta'),
        saldo_itens_do_pedido:                t('pedido.lista.coluna_dinamica.saldo'),
        quantidade_transferida_total:         t('pedido.lista.coluna_dinamica.qtd_transferida'),
        quantidade_cancelada_total_pedido:    t('pedido.lista.coluna_dinamica.qtd_cancelada'),
        peso_liquido_total_pedido:            t('pedido.lista.coluna_dinamica.peso_liquido'),
        peso_bruto_total_pedido:              t('pedido.lista.coluna_dinamica.peso_bruto'),
        cubagem_total_pedido:                 t('pedido.lista.coluna_dinamica.cubagem'),
      }

      if (CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO.has(col.key)) {
        const labelDinamico = temExpandido && col.key in COLUNAS_DINAMICAS_PEDIDO_ITEM
          ? COLUNAS_DINAMICAS_PEDIDO_ITEM[col.key]
          : undefined
        return enriquecerColunaBloqueadaInlinePedido(col, t, {
          label: labelDinamico,
          modoDinamicoPedidoItem: temExpandido,
        })
      }

      if (temExpandido && col.key in COLUNAS_DINAMICAS_PEDIDO_ITEM) {
        const label = COLUNAS_DINAMICAS_PEDIDO_ITEM[col.key]
        return enriquecerColunaComRegraTooltip(
          { ...col, label },
          t,
          'pai',
          { modoDinamicoPedidoItem: true },
        )
      }

      return col
    })

    const customEnriquecidas = custom.map(c => {
      const origem = colunasUsuario.find(u => u.chave === String(c.key))
      return enriquecerColunaComRegraTooltip(c, t, 'pai', {
        colunaPersonalizada: true,
        descricaoUsuario: origem?.descricao ?? undefined,
      })
    })

    return [...colunasBase, ...customEnriquecidas]
  }, [colunasPai, colunasUsuario, statusOpts, saldoFormulaAST, temExpandido, t, workspaceOpcoesLista, pedidos, workspacesMap, opcoesImportadoresExpLista, opcoesExportadoresImpLista])

  const colunasManuaisKeys = useMemo(
    () => new Set(colunasUsuario.map(c => String(c.chave))),
    [colunasUsuario],
  )

  const colunasSeletorLista = useMemo(
    () => colunasComUsuario.map(c => ({
      key: String(c.key),
      label: c.label,
      naoOcultavel: c.naoOcultavel,
      manual: colunasManuaisKeys.has(String(c.key)),
    })),
    [colunasComUsuario, colunasManuaisKeys],
  )

  // Campos editáveis em linhas filho — estáticos + chaves das colunas customizadas editáveis
  const camposEditaveisFilhosComCustom = useMemo(() => {
    const customKeys = colunasUsuario
      .filter(c => c.tipo !== 'formula' && c.tipo !== 'anexo'
                 && ((c.escopo || 'ambos') === 'item' || (c.escopo || 'ambos') === 'ambos'))
      .map(c => c.chave)
    // id_workspace e logística são exclusivos do pedido — itens herdam/exibem, sem PATCH em item.
    const exclusivosPedido = new Set<string>([
      'id_workspace',
      'tipo_operacao',
      'nome_importador',
      'nome_exportador',
      ...CAMPOS_LOGISTICA_PEDIDO,
    ])
    return [...CAMPOS_EDITAVEIS_PAI, ...customKeys]
      .filter(k => !exclusivosPedido.has(k) && !isChaveColunaAnexo(k))
  }, [colunasUsuario])

  // ── Estado de filtros de coluna ───────────────────────────────────────────────
  const [filtrosAtivos, setFiltrosAtivos]   = useState<FiltrosAtivosMap>({})
  const filtrosAtivosKeys = useMemo(() => new Set(Object.keys(filtrosAtivos)), [filtrosAtivos])
  const [popoverAberto, setPopoverAberto]   = useState<string | null>(null)
  const [popoverPos, setPopoverPos]         = useState({ top: 0, left: 0 })

  // ── Pedidos filtrados (client-side) ───────────────────────────────────────────
  const pedidosFiltrados = useMemo<Pedido[]>(() => {
    let resultado = pedidos
    if (pedidoFocoId) {
      resultado = resultado.filter(p => p.id === pedidoFocoId)
    }
    // Filtro por aba de status (client-side para dev/mock; produção filtra no servidor)
    if (abaAtiva !== 'todos') {
      resultado = resultado.filter(p => p.status === abaAtiva)
    }
    // Busca global client-side (em dev o mock ignora o param de busca do servidor).
    // Espelha as condições do backend (montarCondicoesBuscaPedido) — Mand. 07:
    // sem isso, pedidos que o servidor retornou por match em coluna do usuário
    // seriam re-filtrados para fora aqui.
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase()
      const idsColunasNomeBate = new Set(
        colunasUsuario.filter(c => c.nome.toLowerCase().includes(termo)).map(c => c.id),
      )
      const matchColunasUsuario = (registro: Record<string, unknown>): boolean => {
        const valores = registro['_colunas_usuario'] as Record<string, string> | undefined
        if (!valores) return false
        return Object.entries(valores).some(([idColuna, valor]) =>
          (valor !== '' && idsColunasNomeBate.has(idColuna))
          || String(valor).toLowerCase().includes(termo),
        )
      }
      resultado = resultado.filter(p =>
        [p.numero_pedido, p.nome_exportador, p.nome_fabricante,
         p.referencia_importador, p.referencia_exportador,
         p.numero_proforma, p.numero_invoice]
          .some(v => v != null && String(v).toLowerCase().includes(termo))
        || matchColunasUsuario(p as unknown as Record<string, unknown>)
        || (p.itens ?? []).some(i => matchColunasUsuario(i as unknown as Record<string, unknown>)),
      )
    }
    if (Object.keys(filtrosAtivos).length === 0) return resultado
    return resultado.filter(p => {
      const row = p as Record<string, unknown>
      for (const [campo, filtro] of Object.entries(filtrosAtivos)) {
        let val: unknown = row[campo]
        if (campo === 'id_workspace') {
          const idWs = extrairIdWorkspaceDePedido(p)
          val = workspacesMap.get(idWs)?.nome ?? idWs
        }
        if (filtro.tipo === 'texto') {
          if (!String(val ?? '').toLowerCase().includes(filtro.valor.toLowerCase())) return false
        } else if (filtro.tipo === 'enum') {
          const strVal = String(val ?? '')
          const inverso = getLabelsFiltroInverso(campo, t)
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
  }, [pedidos, filtrosAtivos, abaAtiva, busca, pedidoFocoId, workspacesMap, colunasUsuario, t])

  const temFiltroColunaCliente = useMemo(
    () => Object.keys(filtrosAtivos).length > 0,
    [filtrosAtivos],
  )

  const rotuloEscopoWorkspaces = useMemo(() => {
    if (!escopoHidratado || workspacesSelecionados.length === 0) return null
    const nomes = workspacesSelecionados
      .map(id => workspacesMap.get(id)?.nome)
      .filter((n): n is string => Boolean(n))
    if (nomes.length === 0) return null
    if (nomes.length === 1) return nomes[0]
    if (nomes.length === 2) return nomes.join(', ')
    return t('pedido.lista.escopo_workspaces_resumo', {
      count: nomes.length,
      defaultValue: `${nomes.length} selecionados`,
    })
  }, [escopoHidratado, workspacesSelecionados, workspacesMap, t])

  const tooltipEscopoWorkspaces = useMemo(() => {
    if (!escopoHidratado || workspacesSelecionados.length === 0) return null
    const nomes = workspacesSelecionados
      .map(id => workspacesMap.get(id)?.nome)
      .filter((n): n is string => Boolean(n))
    if (nomes.length === 0) return null
    return <ListaNumeradaWorkspacesTooltip nomes={nomes} />
  }, [escopoHidratado, workspacesSelecionados, workspacesMap])

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
    setPedidoFocoId(null)
    handleBuscar('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Estado dos modais de criação ─────────────────────────────────────────────
  const [drawerAberto, setDrawerAberto]           = useState(false)
  const [pedidoEditandoId, setPedidoEditandoId]   = useState<string | undefined>(undefined)
  const [drawerInitialTab, setDrawerInitialTab]   = useState<'dados' | 'itens' | 'transferencias'>('dados')
  const [drawerFocusField, setDrawerFocusField]   = useState<string | undefined>(undefined)

  // ── Ref imperativo da tabela + edição inline pendente (navegação via Kanban) ─
  type PendingEdicaoKanban =
    | { tipo: 'pai'; id: string; campo: string }
    | { tipo: 'item'; idPedido: string; colunaPai: string; campoItem: string }
    | { tipo: 'visualizar'; idPedido: string; colunaPai: string }

  const tabelaRef = useRef<GTVirtualHandle | null>(null)
  const pendingInlineEditRef = useRef<PendingEdicaoKanban | null>(null)
  const pendingOpenDrawerRef = useRef<string | null>(null)
  const pendingExpandirItensRef = useRef<string | null>(null)

  // Navegação via Kanban / Visão Geral:
  //   { openPedidoId, editCampo, numeroPedido } → edição inline na célula
  //   { openPedidoId, abrirDrawer, numeroPedido } → abre drawer na lista
  //   { openPedidoId, expandirItens, numeroPedido } → foca pedido e expande itens na lista
  //   { numeroPedido }                          → apenas filtrar na lista (Abrir pedido completo)
  useEffect(() => {
    const st = location.state as {
      openPedidoId?: string
      editCampo?: string
      abrirDrawer?: boolean
      expandirItens?: boolean
      numeroPedido?: string
    } | null
    if (!st?.openPedidoId && !st?.numeroPedido) return
    window.history.replaceState({}, '')

    if (st.openPedidoId && st.expandirItens) {
      pendingExpandirItensRef.current = st.openPedidoId
      setPedidoFocoId(st.openPedidoId)
    } else if (st.openPedidoId && st.abrirDrawer) {
      pendingOpenDrawerRef.current = st.openPedidoId
      setPedidoFocoId(st.openPedidoId)
    } else if (st.openPedidoId && st.editCampo) {
      const destino = resolverEdicaoKanbanParaLista(st.editCampo, st.openPedidoId)
      setPedidoFocoId(st.openPedidoId)
      if (destino.nivel === 'pai') {
        pendingInlineEditRef.current = { tipo: 'pai', id: st.openPedidoId, campo: destino.campo }
      } else if (destino.nivel === 'item') {
        pendingInlineEditRef.current = {
          tipo: 'item',
          idPedido: destino.idPedido,
          colunaPai: destino.colunaPai,
          campoItem: destino.campoItem,
        }
      } else {
        pendingInlineEditRef.current = {
          tipo: 'visualizar',
          idPedido: destino.idPedido,
          colunaPai: destino.colunaPai,
        }
      }
    } else if (st.numeroPedido) {
      // Fluxo "Abrir pedido completo": apenas filtrar na lista
      handleBuscar(st.numeroPedido)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  // Abre drawer quando navegação pede abrirPedidoId (Visão Geral, etc.)
  useEffect(() => {
    const pendingId = pendingOpenDrawerRef.current
    if (!pendingId || carregando) return
    const pedido = pedidos.find(p => p.id === pendingId)
    if (!pedido) return
    pendingOpenDrawerRef.current = null
    setPedidoEditandoId(pedido.id)
    setDrawerAberto(true)
  }, [pedidos, carregando])

  // Expande itens do pedido na tabela (tooltip KPI Insights, etc.)
  useEffect(() => {
    const pendingId = pendingExpandirItensRef.current
    if (!pendingId || carregando) return
    const pedido = pedidos.find(p => p.id === pendingId)
    if (!pedido) return
    pendingExpandirItensRef.current = null
    tabelaRef.current?.expandir(pendingId)
    for (const ms of [300, 700, 1200]) {
      setTimeout(() => {
        tabelaRef.current?.rolarParaCelula(pendingId, 'numero_pedido')
      }, ms)
    }
  }, [pedidos, carregando])

  // Dispara edição inline assim que o pedido estiver no array e o carregamento terminar
  useEffect(() => {
    const pending = pendingInlineEditRef.current
    if (!pending || carregando) return

    if (pending.tipo === 'visualizar') {
      const pedido = pedidos.find(p => p.id === pending.idPedido)
      if (!pedido) return
      pendingInlineEditRef.current = null
      tabelaRef.current?.expandir(pending.idPedido)
      for (const ms of [300, 700, 1200]) {
        setTimeout(() => {
          tabelaRef.current?.rolarParaCelula(pending.idPedido, pending.colunaPai)
        }, ms)
      }
      return
    }

    if (pending.tipo === 'pai') {
      const pedido = pedidos.find(p => p.id === pending.id)
      if (!pedido) return
      pendingInlineEditRef.current = null
      const valorAtual = (pedido as Record<string, unknown>)[pending.campo] ?? null
      setTimeout(() => {
        tabelaRef.current?.iniciarEdicao(pending.id, pending.campo, valorAtual)
      }, 200)
      return
    }

    const pedido = pedidos.find(p => p.id === pending.idPedido)
    if (!pedido) return
    tabelaRef.current?.expandir(pending.idPedido)

    let tentativas = 0
    const timer = window.setInterval(() => {
      tentativas += 1
      const itens = itensCarregadosRef.current.get(pending.idPedido) ?? pedido.itens ?? []
      const item = itens[0]
      if (!item) {
        if (tentativas >= 20) {
          window.clearInterval(timer)
          pendingInlineEditRef.current = null
        }
        return
      }
      pendingInlineEditRef.current = null
      window.clearInterval(timer)
      const mapaEntry = mapaColunasFilho[pending.colunaPai]
      const valorAtual = mapaEntry?.getValorEditar
        ? mapaEntry.getValorEditar(item)
        : (item as Record<string, unknown>)[pending.campoItem] ?? null
      setTimeout(() => {
        tabelaRef.current?.iniciarEdicaoFilho(
          item.id,
          pending.campoItem,
          valorAtual,
          pending.colunaPai,
        )
      }, 200)
    }, 200)
    return () => window.clearInterval(timer)
  }, [pedidos, carregando, mapaColunasFilho])
  const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false)
  const [modalNovoItemAberto, setModalNovoItemAberto]     = useState(false)
  const [smartImportAberto, setSmartImportAberto] = useState(false)
  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)
  const [novoSubmenu, setNovoSubmenu]             = useState<'pedido' | 'item' | 'painel' | null>(null)
  const [modalCockpitAberto, setModalCockpitAberto] = useState(false)
  const novoDropdownRef = useRef<HTMLDivElement>(null)

  // ── Refs para evitar duplo carregamento ──────────────────────────────────────
  const carregandoRef = useRef(false)
  /** Descarta respostas obsoletas quando escopo/filtros mudam durante fetch in-flight. */
  const cargaListaSeqRef = useRef(0)
  // Cache de itens carregados por pedido: pedidoId → PedidoItem[]
  // Não-reativo: evita que setPedidos dispare re-loads em useGTExpandir
  const itensCarregadosRef = useRef<Map<string, PedidoItem[]>>(new Map())
  /** Patches acumulados durante seleção em lote — flush único evita N× setPedidos. */
  const patchPedidosCarregarFilhosLoteRef = useRef<Map<string, { itens: PedidoItem[]; divergencias: Partial<Pedido> }>>(new Map())

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
    forcar = false,
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

    if (carregandoRef.current && !forcar) return
    const seq = ++cargaListaSeqRef.current
    carregandoRef.current = true
    setCarregando(true)
    setErroCarga(null)
    setPaginaAtual(novaPagina)
    try {
      // Filtro multi-workspace: envia query param quando a seleção difere do
      // default (= só o workspace ativo) e quando NÃO são todos os disponíveis.
      const idsWorkspacesFiltro = resolverIdsWorkspacesParaApi(workspacesSelecionados, workspaceAtivo)

      const res = await pedidoVirtualApi.listar({
        sort: novaOrdem,
        dir: novaDir,
        limit: ITENS_POR_PAGINA,
        page: novaPagina,
        status: novaAba !== 'todos' ? novaAba : undefined,
        busca: novaBusca || undefined,
        idsWorkspacesFiltro,
      })
      if (seq !== cargaListaSeqRef.current) return
      // Pré-computa flags de divergência no carregamento inicial — pedidos vem
      // com itens populados do backend (include itens_pedido na rota /listar).
      const pedidosSanitizados = sanitizarNomesPartesListaPedidos(
        res.data,
        workspacesDisponiveis,
        workspacesShell,
        opcoesImportadoresExp,
        opcoesExportadoresImp,
      )
      const pedidosComDivergencias = pedidosSanitizados.map(p => {
        if (!p.itens || p.itens.length === 0) return p
        const { itens, divergencias } = sincronizarItensPedido(p.itens, p)
        return { ...p, itens, ...divergencias }
      })

      setPedidos(pedidosComDivergencias)
      setTotal(res.total)
      setTotalItensBanco(res.totalItens ?? 0)
    } catch (err) {
      if (seq !== cargaListaSeqRef.current) return
      // keepPreviousData: mantém os pedidos atualmente exibidos caso o fetch falhe
      // (ex: token Clerk expirando após idle timeout, race condition de refresh).
      // Sem isso, qualquer falha transitória zera a tela e mostra Empty State
      // mesmo quando o usuário tem dados válidos carregados.
      // Mand. 08 — registramos o erro no estado para que o empty state possa
      // diferenciar "vazio legítimo" de "falhou ao carregar" (sem fallback silencioso).
      setErroCarga(err instanceof Error ? err.message : t('pedido.lista.erro.desconhecido'))
    } finally {
      if (seq === cargaListaSeqRef.current) {
        setCarregando(false)
        carregandoRef.current = false
      }
    }
  }, [abaAtiva, sortCampo, sortDir, busca, ITENS_POR_PAGINA, workspacesSelecionados, workspaceAtivo, workspacesDisponiveis, workspacesShell, opcoesImportadoresExp, opcoesExportadoresImp, t])

  const aplicarCardsTopoDoPainel = useCallback((
    cardsTopo: { ids_visiveis: string[]; periodo?: string } | undefined,
  ) => {
    if (!cardsTopo) return
    const periodosValidos = ['7d', '30d', '6m', '1a', 'tudo'] as const
    if (cardsTopo.periodo && periodosValidos.includes(cardsTopo.periodo as typeof periodosValidos[number])) {
      setPeriodoCards(cardsTopo.periodo as typeof periodosValidos[number])
    }
    if (cardsTopo.ids_visiveis.length > 0) {
      const algumIdValido = painelCardsTopoTemIntersecaoComPrefs(cardPrefs, cardsTopo.ids_visiveis)
      if (algumIdValido) {
        persistirCardPrefs(mesclarVisibilidadeCardsTopoPainel(cardPrefs, cardsTopo.ids_visiveis))
      } else {
        console.warn(
          '[Pedidos] cards_topo.ids_visiveis do painel não batem com nenhum card local — mantendo visibilidade atual',
          cardsTopo.ids_visiveis,
        )
      }
    }
  }, [cardPrefs, persistirCardPrefs, setPeriodoCards])

  const aplicarSnapshotPainelNaUi = useCallback((snapshot: SnapshotAplicarListaPainel) => {
    setAbaAtiva(snapshot.aba)
    setSortCampo(snapshot.sortCampo)
    setSortDir(snapshot.sortDir)
    setBusca(snapshot.busca)
    aplicarCardsTopoDoPainel(snapshot.cardsTopo)
    setFiltrosAtivos(snapshot.filtrosColuna)
  }, [aplicarCardsTopoDoPainel])

  const executarCargaComSnapshotPainel = useCallback((snapshot: SnapshotAplicarListaPainel) => {
    if (workspacesSelecionados.length === 0) {
      painelSnapshotPendenteRef.current = snapshot
      return
    }
    painelSnapshotPendenteRef.current = null
    setPedidoFocoId(null)
    void carregarInicial(
      snapshot.aba,
      snapshot.sortCampo,
      snapshot.sortDir,
      snapshot.busca,
      1,
      true,
    ).finally(() => {
      aplicarSnapshotPainelNaUi(snapshot)
      escopoListaInicialDisparadoRef.current = true
    })
  }, [workspacesSelecionados, carregarInicial, aplicarSnapshotPainelNaUi])

  const mesclarColunasManuaisNasPreferencias = useCallback((
    lista: ColunaUsuario[],
    opcoes?: { preservarOrdemSalva?: boolean },
  ) => {
    const preservarOrdemSalva = opcoes?.preservarOrdemSalva ?? false
    const activeCustomKeys = lista
      .filter(c => c.ativo && ((c.escopo || 'ambos') === 'pedido' || (c.escopo || 'ambos') === 'ambos'))
      .map(c => c.chave)

    setPreferencias(prev => {
      if (!prev?.colunas_visiveis?.length) {
        return prev
      }
      const savedVisible: string[] = prev.colunas_visiveis
      const savedSet = new Set(savedVisible)
      const conhecidasAntigas = new Set(prev?.colunas_manuais_conhecidas ?? [])
      const novas = activeCustomKeys.filter(k => !savedSet.has(k) && !conhecidasAntigas.has(k))
      const conhecidasNovas = Array.from(new Set([...conhecidasAntigas, ...activeCustomKeys]))

      const passoInserir = inserirColunaAposAncora(
        savedVisible,
        'id_workspace',
        ['tipo_operacao', 'numero_pedido'],
      )
      let atual = passoInserir.resultado
      let mudouPosicao = passoInserir.mudou

      if (!preservarOrdemSalva) {
        const passoMover = moverColunaParaAposAncora(atual, 'id_workspace', 'tipo_operacao')
        atual = passoMover.resultado
        mudouPosicao = mudouPosicao || passoMover.mudou
      }

      const passoDescItem = inserirColunaAposAncora(atual, 'descricao_item', ['ncm'])
      atual = passoDescItem.resultado
      mudouPosicao = mudouPosicao || passoDescItem.mudou

      const passoMoeda = inserirColunaAposAncora(atual, 'moeda_pedido', ['descricao_item', 'ncm'])
      atual = passoMoeda.resultado
      mudouPosicao = mudouPosicao || passoMoeda.mudou

      const passoUnidade = inserirColunaAposAncora(
        atual,
        'unidade_comercializada_pedido',
        ['quantidade_pronta_itens_pedido_total', 'valor_total_pedido', 'quantidade_total_pedido'],
      )
      atual = passoUnidade.resultado
      mudouPosicao = mudouPosicao || passoUnidade.mudou

      const passoLogisticaInsert = inserirBlocoColunasFaltantes(
        atual,
        CAMPOS_LOGISTICA_PEDIDO,
        'incoterm',
      )
      atual = passoLogisticaInsert.resultado
      mudouPosicao = mudouPosicao || passoLogisticaInsert.mudou

      if (!preservarOrdemSalva) {
        const passoLogisticaOrder = reordenarBlocoColunas(atual, CAMPOS_LOGISTICA_PEDIDO)
        atual = passoLogisticaOrder.resultado
        mudouPosicao = mudouPosicao || passoLogisticaOrder.mudou
      }

      const visivelComMigracao = atual
      const novasBuiltin = [
        ...(passoInserir.mudou ? ['id_workspace'] : []),
        ...(passoDescItem.mudou ? ['descricao_item'] : []),
        ...(passoMoeda.mudou ? ['moeda_pedido'] : []),
        ...(passoUnidade.mudou ? ['unidade_comercializada_pedido'] : []),
        ...(passoLogisticaInsert.mudou
          ? CAMPOS_LOGISTICA_PEDIDO.filter(k => passoLogisticaInsert.resultado.includes(k) && !savedSet.has(k))
          : []),
      ]

      const finalVisible = novas.length > 0 || novasBuiltin.length > 0 || mudouPosicao
        ? [...visivelComMigracao, ...novas]
        : savedVisible

      return {
        colunas_visiveis: finalVisible,
        ...(prev?.colunas_largura ? { colunas_largura: prev.colunas_largura } : {}),
        colunas_manuais_conhecidas: conhecidasNovas,
      }
    })
  }, [])

  const listaPainelCallbacks = useMemo(() => ({
    setPreferencias,
    setAbaAtiva,
    setSortCampo,
    setSortDir,
    setBusca,
    setFiltrosAtivos,
    setCardsTopoDoPainel: aplicarCardsTopoDoPainel,
    onConfigAplicada: (snapshot: SnapshotAplicarListaPainel) => {
      executarCargaComSnapshotPainel(snapshot)
    },
    onPainelHidratado: (id: string) => {
      painelListaAplicadoRef.current = id
      if (colunasUsuarioListaRef.current.length > 0) {
        mesclarColunasManuaisNasPreferencias(colunasUsuarioListaRef.current, { preservarOrdemSalva: true })
      }
    },
  }), [executarCargaComSnapshotPainel, aplicarCardsTopoDoPainel, mesclarColunasManuaisNasPreferencias])

  useEffect(() => {
    if (!escopoHidratado || !idOrganizacao) return
    if (workspacesSelecionados.length === 0) return
    if (!painelSnapshotPendenteRef.current) return
    executarCargaComSnapshotPainel(painelSnapshotPendenteRef.current)
  }, [escopoHidratado, idOrganizacao, workspacesSelecionados, executarCargaComSnapshotPainel])

  useEffect(() => {
    if (!escopoHidratado || !idOrganizacao) return
    if (workspacesSelecionados.length === 0) return
    if (!painelListaAtual || carregandoPaineisLista) return
    if (painelListaAplicadoRef.current === painelListaAtual.id) return
    aplicarConfigDoPainel(painelListaAtual, listaPainelCallbacks)
  }, [
    escopoHidratado,
    idOrganizacao,
    workspacesSelecionados.length,
    painelListaAtual?.id,
    painelListaAtual?.config_json,
    carregandoPaineisLista,
    aplicarConfigDoPainel,
    listaPainelCallbacks,
  ])

  const estadoListaParaPainel = useCallback((): EstadoListaParaPainel => ({
    preferencias,
    abaAtiva,
    sortCampo,
    sortDir,
    busca,
    filtrosAtivos,
    cardsVisiveisIds: cardsVisiveis.map(c => c.id),
    periodoCards,
  }), [preferencias, abaAtiva, sortCampo, sortDir, busca, filtrosAtivos, cardsVisiveis, periodoCards])

  const handleCriarPainelLista = useCallback(async (nome: string): Promise<boolean> => {
    painelListaAplicadoRef.current = null
    try {
      const criado = await criarPainelLista(nome, estadoListaParaPainel(), listaPainelCallbacks)
      if (!criado) {
        addNotification({
          type: 'error',
          message: t('pedido.lista.painel_criado_erro', {
            defaultValue: 'Não foi possível salvar o painel. Verifique a API /lista/paineis e a migration no banco.',
          }),
        })
        return false
      }
      addNotification({
        type: 'success',
        message: t('pedido.lista.painel_criado_sucesso', {
          defaultValue: 'Painel "{{nome}}" criado — use as abas roxas acima dos cards de totais.',
          nome: criado.nome,
        }),
      })
      return true
    } catch (err) {
      const detalhe = err instanceof Error ? err.message : ''
      addNotification({
        type: 'error',
        message: detalhe
          ? `${t('pedido.lista.painel_criado_erro', { defaultValue: 'Não foi possível salvar o painel.' })} ${detalhe}`
          : t('pedido.lista.painel_criado_erro', {
              defaultValue: 'Não foi possível salvar o painel. Verifique a API /lista/paineis e a migration no banco.',
            }),
      })
      return false
    }
  }, [criarPainelLista, estadoListaParaPainel, listaPainelCallbacks, addNotification, t])

  const handleTrocarPainelLista = useCallback((id: string) => {
    painelListaAplicadoRef.current = null
    void trocarPainelLista(
      id,
      {
        preferencias,
        abaAtiva,
        sortCampo,
        sortDir,
        busca,
        filtrosAtivos,
        cardsVisiveisIds: cardsVisiveis.map(c => c.id),
        periodoCards,
      },
      listaPainelCallbacks,
    )
  }, [
    trocarPainelLista,
    preferencias,
    abaAtiva,
    sortCampo,
    sortDir,
    busca,
    filtrosAtivos,
    cardsVisiveis,
    periodoCards,
    listaPainelCallbacks,
  ])

  useEffect(() => {
    if (!painelListaAtualId || carregandoPaineisLista) return
    if (painelListaAplicadoRef.current !== painelListaAtualId) return
    persistirPainelAtual({
      preferencias,
      abaAtiva,
      sortCampo,
      sortDir,
      busca,
      filtrosAtivos,
      cardsVisiveisIds: cardsVisiveisIdsKey ? cardsVisiveisIdsKey.split('\0') : [],
      periodoCards,
    })
  }, [
    preferencias,
    abaAtiva,
    sortCampo,
    sortDir,
    busca,
    filtrosAtivos,
    cardsVisiveisIdsKey,
    periodoCards,
    painelListaAtualId,
    carregandoPaineisLista,
    persistirPainelAtual,
  ])

  /** Mesmo padrão de Edição em Massa / Consolidar — limpa cache de filhos antes de listar. */
  const recarregarListaPosImportacao = useCallback(async () => {
    itensCarregadosRef.current.clear()
    setPedidos(prev => prev.map(p => ({ ...p, itens: [] })))
    setResetFilhos(prev => prev + 1)
    setSortCampo(SORT_LISTA_NOVOS_PEDIDO.campo)
    setSortDir(SORT_LISTA_NOVOS_PEDIDO.direcao)
    await carregarInicial(abaAtiva, SORT_LISTA_NOVOS_PEDIDO.campo, SORT_LISTA_NOVOS_PEDIDO.direcao, busca, 1, true)
  }, [carregarInicial, abaAtiva, busca])

  // Recarrega lista quando mudou escopo de workspaces (menu lateral) ou quando
  // idOrganizacao hidrata do /me. A primeira carga com painel salvo fica só no onConfigAplicada.
  useEffect(() => {
    if (!idOrganizacao || !escopoHidratado) return
    if (carregandoPaineisLista) return

    const escopoAlteradoPeloUsuario = versaoEscopo > versaoEscopoAnteriorRef.current
    versaoEscopoAnteriorRef.current = versaoEscopo

    if (escopoAlteradoPeloUsuario) {
      setPedidos([])
      setTotal(0)
      setTotalItensBanco(0)
      void carregarInicial(abaAtiva, sortCampo, sortDir, busca, 1, true)
      return
    }

    if (!escopoListaInicialDisparadoRef.current) {
      if (painelListaAtualId && painelListaAplicadoRef.current !== painelListaAtualId) return
      if (painelListaAtualId) return
      escopoListaInicialDisparadoRef.current = true
    }

    void carregarInicial(abaAtiva, sortCampo, sortDir, busca, 1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versaoEscopo, escopoHidratado, idOrganizacao, carregandoPaineisLista])

  // Sincroniza com mudanças feitas em outras views (Kanban, Dashboard)
  useEffect(() => {
    const handler = (e: Event) => {
      const { origem } = (e as CustomEvent<{ origem: string }>).detail ?? {}
      if (origem === 'smart-import') {
        void recarregarListaPosImportacao()
        return
      }
      if (origem !== 'lista') carregarInicial()
    }
    window.addEventListener('pedido:atualizado', handler)
    return () => window.removeEventListener('pedido:atualizado', handler)
  }, [carregarInicial, recarregarListaPosImportacao])

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

  // ── Deep-link: vincular exportador/importador ao retornar do Configurador ──
  // URL params ?vincular_exportador_id=<suid>&vincular_exportador_nome=<nome>&expandir=<pedidoId>
  // Captura na montagem (antes do efeito de expandir limpar o param)
  const vincularParamsRef = useRef<{
    pedidoId: string | null
    exportadorId: string | null
    exportadorNome: string | null
    importadorId: string | null
    importadorNome: string | null
  } | null>(null)
  if (vincularParamsRef.current === null) {
    const p = new URLSearchParams(window.location.search)
    vincularParamsRef.current = {
      pedidoId: p.get('expandir'),
      exportadorId: p.get('vincular_exportador_id'),
      exportadorNome: p.get('vincular_exportador_nome'),
      importadorId: p.get('vincular_importador_id'),
      importadorNome: p.get('vincular_importador_nome'),
    }
  }
  const vincularAutoFeito = useRef(false)
  useEffect(() => {
    if (vincularAutoFeito.current) return
    if (carregando || pedidos.length === 0) return
    const vp = vincularParamsRef.current
    if (!vp) return
    const { pedidoId, exportadorId, exportadorNome, importadorId, importadorNome } = vp
    if (!pedidoId || (!exportadorId && !importadorId)) return
    vincularAutoFeito.current = true
    // Limpa params de vínculo da URL (expandir já foi limpo pelo efeito anterior)
    const params = new URLSearchParams(window.location.search)
    params.delete('vincular_exportador_id')
    params.delete('vincular_exportador_nome')
    params.delete('vincular_importador_id')
    params.delete('vincular_importador_nome')
    const novaUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', novaUrl)
    // Atualiza o pedido no backend via editarCampo (suporta aliases legados)
    const chamadas: Promise<Pedido>[] = []
    if (exportadorId) {
      chamadas.push(pedidoVirtualApi.editarCampo(pedidoId, 'importacao_exportador_id', exportadorId))
      if (exportadorNome) {
        chamadas.push(pedidoVirtualApi.editarCampo(pedidoId, 'nome_exportador', exportadorNome))
      }
    }
    if (importadorId) {
      chamadas.push(pedidoVirtualApi.editarCampo(pedidoId, 'exportacao_importador_id', importadorId))
      if (importadorNome) {
        chamadas.push(pedidoVirtualApi.editarCampo(pedidoId, 'nome_importador', importadorNome))
      }
    }
    Promise.all(chamadas)
      .then((resultados) => {
        // Último resultado contém o estado mais atualizado do pedido
        const pedidoAtualizado = resultados[resultados.length - 1]
        if (pedidoAtualizado) {
          setPedidos((prev: Pedido[]) =>
            prev.map((p: Pedido) => p.id === pedidoId ? { ...p, ...pedidoAtualizado } : p)
          )
        }
      })
      .catch((err) => {
        console.warn('[Pedidos] erro ao vincular exportador/importador:', err)
      })
  }, [carregando, pedidos])

  const acoesPai = useMemo(() => ([
    {
      id: 'editar',
      tooltip: t('pedido.lista.acao.editar_pedido'),
      icone: <PencilLine size={14} weight="duotone" />,
      onClick: (pedido: Pedido) => {
        setPedidoEditandoId(pedido.id)
        setDrawerAberto(true)
      },
    },
  ]), [t])

  const acoesFilhoEstavel = useCallback((item: PedidoItem) => ([
    {
      label: t('pedido.barra.transferir'),
      icone: <ArrowsLeftRight size={13} weight="duotone" />,
      onClick: () => {
        setItensSelecionados([item])
        setModalTransferirAberto(true)
      },
    },
    {
      label: t('pedido.barra.duplicar'),
      icone: <StackPlus size={13} weight="duotone" />,
      onClick: () => {
        setItensSelecionados([item])
        setModalDuplicarAberto(true)
      },
    },
    {
      label: t('pedido.barra.excluir'),
      icone: <Trash size={13} weight="duotone" />,
      perigo: true,
      onClick: async () => {
        setExcluindoItens(true)
        try {
          await pedidoExcluirApi.excluirItens(item.pedido_id, [item.id])
          addNotification({ type: 'success', message: t('pedido.lista.notif.item_excluido') })
          await carregarInicial()
        } catch {
          addNotification({ type: 'error', message: t('pedido.lista.notif.erro_excluir_item') })
        } finally {
          setExcluindoItens(false)
        }
      },
    },
  ]), [carregarInicial, addNotification, t])

  const onSelecaoFilhoEstavel = useCallback(
    (itens: PedidoItem[]) => setItensSelecionados(itens),
    [setItensSelecionados],
  )

  // ── Indicador de transferência (seta à esquerda da linha) ───────────────────
  // Azul ↓ = recebeu quantidade (pedido destino de uma transferência)
  // Vermelho ↑ = enviou quantidade (teve itens transferidos para outro pedido)
  // Campos virtuais `enviou_transferencia` e `recebeu_transferencia` vêm
  // do backend (tagTransferencias) — fonte de verdade é a tabela PedidoTransferencia.
  const renderIndicadorLinhaPedido = useCallback((pedido: Pedido) => {
    const recebeu = pedido.recebeu_transferencia === true
    const enviou = pedido.enviou_transferencia === true
    const consolidado = (pedido.status ?? '').toLowerCase() === 'consolidado'

    if (!recebeu && !enviou && !consolidado) return null

    const temAmbosIndicadores = (recebeu || enviou) && consolidado
    const tamTransf = temAmbosIndicadores ? 15 : (recebeu && enviou ? 26 : 18)
    const tamConsol = temAmbosIndicadores ? 15 : 18

    let iconeTransf: ReactNode = null
    if (recebeu && enviou) {
      iconeTransf = (
        <TooltipGlobal titulo={t('pedido.lista.indicador.recebeu_enviou')} descricao="">
          <svg width={tamTransf} height={tamTransf} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
            <polygon points="12,1 5,9 19,9" fill="#f87171" />
            <rect x="10.5" y="8.5" width="3" height="7" fill="url(#gradTransf)" />
            <polygon points="12,23 5,15 19,15" fill="#60a5fa" />
            <defs>
              <linearGradient id="gradTransf" x1="12" y1="8.5" x2="12" y2="15.5" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </svg>
        </TooltipGlobal>
      )
    } else if (recebeu) {
      iconeTransf = (
        <TooltipGlobal titulo={t('pedido.lista.indicador.recebeu')} descricao="">
          <svg width={tamTransf} height={tamTransf} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
            <polygon points="12,22 4,12 20,12" fill="#60a5fa" />
            <rect x="10.5" y="2" width="3" height="11" fill="#60a5fa" />
          </svg>
        </TooltipGlobal>
      )
    } else if (enviou) {
      iconeTransf = (
        <TooltipGlobal titulo={t('pedido.lista.indicador.enviou')} descricao="">
          <svg width={tamTransf} height={tamTransf} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
            <polygon points="12,2 4,12 20,12" fill="#f87171" />
            <rect x="10.5" y="11" width="3" height="11" fill="#f87171" />
          </svg>
        </TooltipGlobal>
      )
    }

    const iconeConsol = consolidado ? (
      <TooltipGlobal titulo={t('pedido.lista.indicador.consolidado')} descricao="">
        <GitMerge size={tamConsol} weight="duotone" style={{ color: '#a78bfa', opacity: 0.3 }} />
      </TooltipGlobal>
    ) : null

    if (iconeTransf && iconeConsol) {
      return <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{iconeTransf}{iconeConsol}</span>
    }
    return iconeTransf ?? iconeConsol
  }, [t])

  const renderIndicadorLinhaItem = useCallback((item: PedidoItem) => {
    const transferiu = (item.quantidade_transferida_pedido ?? 0) > 0
    if (!transferiu) return null
    return (
      <TooltipGlobal titulo={t('pedido.lista.indicador.item_transferido')} descricao="">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
          <polygon points="12,2 4,12 20,12" fill="#f87171" />
          <rect x="10.5" y="11" width="3" height="11" fill="#f87171" />
        </svg>
      </TooltipGlobal>
    )
  }, [t])

  const onFiltroColuna = useCallback((key: string, anchor: HTMLElement) => {
    setPopoverAberto(prev => prev === key ? null : key)
    const rect = anchor.getBoundingClientRect()
    // ws-fade-up retém transform:translateY(0) após animação (fill:forwards),
    // criando containing block para position:fixed — compensar offset do parent.
    const page = anchor.closest('.lp-page') as HTMLElement | null
    const offset = page ? page.getBoundingClientRect() : { top: 0, left: 0 }
    const maxW = page ? page.clientWidth : window.innerWidth
    const adjustedLeft = rect.left - offset.left
    const left = Math.max(0, Math.min(adjustedLeft, maxW - 292))
    setPopoverPos({ top: rect.bottom + 4 - offset.top, left })
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
    navigate('/pedido/configuracoes?tab=colunas-personalizadas&acao=nova')
    setNovoDropdownAberto(false)
  }, [navigate])

  const handleMudarAba = useCallback((aba: string) => {
    setAbaAtiva(aba)
    setFindTotalExterno(null)
    carregarInicial(aba, sortCampo, sortDir, busca)
  }, [carregarInicial, sortCampo, sortDir, busca])

  const filtroStatusToolbar = useMemo(
    () => resolverFiltroStatusToolbar(
      abas,
      abaAtiva,
      'todos',
      handleMudarAba,
      t('pedido.lista.chip_status', { defaultValue: 'Status' }),
    ),
    [abas, abaAtiva, handleMudarAba, t],
  )

  const acoesBarra = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
      {/* Botao Expandir/Recolher todos itens — icone-only com TooltipGlobal
          (padrao Linear/Notion para acoes utilitarias frequentes em tabelas
          hierarquicas). */}
      <TooltipGlobal
        descricao={temExpandido ? 'Recolher todos os itens' : 'Expandir todos os itens'}
      >
        <button
          type="button"
          onClick={() => {
            if (temExpandido) tabelaRef.current?.recolherTodos()
            else void tabelaRef.current?.expandirTodos()
          }}
          aria-label={temExpandido ? 'Recolher todos os itens' : 'Expandir todos os itens'}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '8px',
            color: 'var(--ws-muted, #94a3b8)',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {temExpandido
            ? <CaretDoubleUp   size={14} weight="bold" />
            : <CaretDoubleDown size={14} weight="bold" />}
        </button>
      </TooltipGlobal>

      {/* Escopo de workspaces = menu lateral; filtros de coluna = client-side */}
      <BarraAcoesPedido
        novoDropdownRef={novoDropdownRef}
        novoDropdownAberto={novoDropdownAberto}
        novoSubmenu={novoSubmenu}
        onCriarPainelLista={handleCriarPainelLista}
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
        rotuloEscopoWorkspaces={rotuloEscopoWorkspaces}
        tooltipEscopoWorkspaces={tooltipEscopoWorkspaces}
        onAbrirMenuWorkspaces={pedirAbrirMenuWorkspaces}
        onFiltroColuna={onFiltroColuna}
        podeEditarLista={podeEditarLista}
        filtroStatus={filtroStatusToolbar}
      />
    </div>
  ), [
    novoDropdownAberto, novoSubmenu, handleCriarPainelLista, pedidosSelecionados, itensSelecionados, excluindoLote, filtrosAtivos, busca, rotuloEscopoWorkspaces, tooltipEscopoWorkspaces, pedirAbrirMenuWorkspaces,
    novoDropdownRef, setNovoDropdownAberto, setNovoSubmenu, setSmartImportAberto,
    setModalCockpitAberto, setModalNovoPedidoAberto, setModalNovoItemAberto,
    setModalTransferirAberto, setModalConsolidarAberto, setModalEdicaoMassaAberto,
    setModalGerarPdfAberto, setModalDuplicarAberto,
    handleExcluirLote, handleNavConfiguracoes, handleLimparFiltro, handleLimparTodosFiltros,
    onFiltroColuna, podeEditarLista,
    filtroStatusToolbar,
    temExpandido,
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
      const labelMap = getLabelsFiltro(col.key, t)
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
  }, [pedidos, colunasPai, workspacesDisponiveis, t])

  // ── Abas de status (rótulo único: rotulo do banco / localStorage) ───────────
  useEffect(() => {
    const abasLocal = lerAbasDoLocalStorage(t)
    if (abasLocal && abasLocal.length > 1) setAbas(abasLocal)

    if (!idOrganizacao) return

    pedidoConfigApi.listarStatus()
      .then(res => {
        if (res.data.length === 0) return
        const sorted = res.data.sort((a, b) => a.ordem - b.ordem)
        const abasApi: GTAbaTipo[] = [
          { valor: 'todos', label: t('pedido.status.todos') },
          ...sorted.map((s: PedidoStatusConfig) => ({
            valor: s.nome,
            label: s.rotulo,
            cor: s.cor,
          })),
        ]
        setAbas(abasApi)
        setStatusOpts(abasApi.filter(a => a.valor !== 'todos').map(a => ({ valor: a.valor, label: a.label })))
        const map: Record<string, { label: string; cor: string }> = {}
        for (const s of sorted) map[s.nome] = { label: s.rotulo, cor: s.cor }
        try { localStorage.setItem(PEDIDO_STATUS_STORAGE_KEY, JSON.stringify(map)) } catch { /* quota */ }
      })
      .catch(() => {
        if (abasLocal && abasLocal.length > 1) setAbas(abasLocal)
      })
  }, [idOrganizacao, t])

  // ── Colunas customizadas do usuário (sem recarregar abas de status) ─────────
  useEffect(() => {
    if (!idOrganizacao) return

    colunasUsuarioApi.listar().catch(() => [] as ColunaUsuario[]).then((lista) => {
      colunasUsuarioListaRef.current = lista
      setColunasUsuario(lista)

      // Merge só DEPOIS da hidratação do painel. Se rodar antes (login/remount),
      // `prev` ainda não tem config_json do banco → expande para ~140 e sobrescreve ocultações.
      if (
        painelListaAtualId
        && painelListaAplicadoRef.current === painelListaAtualId
      ) {
        mesclarColunasManuaisNasPreferencias(lista, { preservarOrdemSalva: true })
      }
    })
  }, [idOrganizacao, painelListaAtualId, mesclarColunasManuaisNasPreferencias, t])

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

  // ── Ordenação ────────────────────────────────────────────────────────────────
  const handleOrdenar = useCallback((campo: string, dir: 'asc' | 'desc') => {
    setSortCampo(campo)
    setSortDir(dir)
    carregarInicial(abaAtiva, campo, dir, busca)
    if (painelListaAtualId) {
      persistirPainelAtual({
        preferencias,
        abaAtiva,
        sortCampo: campo,
        sortDir: dir,
        busca,
        filtrosAtivos,
        cardsVisiveisIds: cardsVisiveis.map(c => c.id),
        periodoCards,
      }, { imediato: true, acaoUsuario: true })
    }
  }, [
    carregarInicial,
    abaAtiva,
    busca,
    painelListaAtualId,
    persistirPainelAtual,
    preferencias,
    filtrosAtivos,
    cardsVisiveis,
    periodoCards,
  ])

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
    } catch {
      addNotification({ type: 'error', message: t('pedido.lista.notif.erro_reordenar') })
    }
  }, [addNotification, t])

  // ── Busca ────────────────────────────────────────────────────────────────────
  const handleBuscar = useCallback((termo: string) => {
    if (!termo.trim()) setPedidoFocoId(null)
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

  // ── Edição inline (pai) ──────────────────────────────────────────────────────
  const handleEditar = useCallback(async (
    id: string,
    campo: string,
    valor: unknown,
    opts?: { replicar_em_itens?: boolean },
  ): Promise<Pedido> => {
    if (campo === 'nome_exportador') {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (comportamentoExportadorLista(pedidoAtual ?? {} as Pedido) === 'exportacao') {
        return handleEditar(id, 'id_workspace', valor, { replicar_em_itens: true })
      }
      if (comportamentoExportadorLista(pedidoAtual ?? {} as Pedido) === 'importacao') {
        const idFornecedor = String(valor ?? '').trim()
        if (!idFornecedor) throw new Error(t('pedido.lista.erro.exportador_obrigatorio', 'Selecione um exportador'))
        const nomeFornecedor = opcoesExportadoresImpLista.find((o) => o.valor === idFornecedor)?.label
          ?? pedidoAtual?.nome_exportador
          ?? ''
        const resultados = await Promise.all([
          pedidoVirtualApi.editarCampo(id, 'importacao_exportador_id', idFornecedor),
          pedidoVirtualApi.editarCampo(id, 'nome_exportador', nomeFornecedor),
        ])
        const pedidoAtualizado = {
          ...pedidoAtual,
          ...resultados[resultados.length - 1],
          importacao_exportador_id: idFornecedor,
          nome_exportador: nomeFornecedor,
        } as Pedido
        setPedidos((prev) => prev.map((p) => (p.id === id ? pedidoAtualizado : p)))
        return pedidoAtualizado
      }
    }
    if (campo === 'nome_importador') {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (comportamentoImportadorLista(pedidoAtual ?? {} as Pedido) === 'importacao') {
        return handleEditar(id, 'id_workspace', valor, { replicar_em_itens: true })
      }
      if (comportamentoImportadorLista(pedidoAtual ?? {} as Pedido) === 'exportacao') {
        const idFornecedor = String(valor ?? '').trim()
        if (!idFornecedor) throw new Error(t('pedido.lista.erro.importador_obrigatorio', 'Selecione um importador'))
        const nomeFornecedor = opcoesImportadoresExpLista.find((o) => o.valor === idFornecedor)?.label
          ?? pedidoAtual.nome_importador
          ?? ''
        const resultados = await Promise.all([
          pedidoVirtualApi.editarCampo(id, 'exportacao_importador_id', idFornecedor),
          pedidoVirtualApi.editarCampo(id, 'nome_importador', nomeFornecedor),
        ])
        const pedidoAtualizado = {
          ...pedidoAtual,
          ...resultados[resultados.length - 1],
          exportacao_importador_id: idFornecedor,
          nome_importador: nomeFornecedor,
        } as Pedido
        setPedidos((prev) => prev.map((p) => (p.id === id ? pedidoAtualizado : p)))
        return pedidoAtualizado
      }
    }
    // Coluna customizada do usuário — salva via endpoint próprio
    const colunaCustom = colunasUsuario.find(c => c.chave === campo)
    if (colunaCustom) {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error(t('pedido.lista.erro.pedido_nao_encontrado'))
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
        ? sincronizarItensPedido(itensFinais as PedidoItem[], atualizado)
        : { itens: itensFinais as PedidoItem[], divergencias: {} as Partial<Pedido> }
      setPedidos(prev => prev.map(p => p.id === id
        ? { ...atualizado, itens: divergenciasCustom.itens, ...divergenciasCustom.divergencias }
        : p))
      return atualizado
    }
    if (campo === 'status') {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error(t('pedido.lista.erro.pedido_nao_encontrado'))
      const novoStatus = String(valor)
      const replicar = opts?.replicar_em_itens ?? false
      const statusAnterior = pedidoAtual.status
      const pedidoTemItens = pedidoPossuiItensNaLista(pedidoAtual as Record<string, unknown>)
      const snapshotPersistente = pedidoAtual.status_itens_snapshot ?? statusAnterior
      const atualizado = {
        ...pedidoAtual,
        status: novoStatus as Pedido['status'],
        status_itens_snapshot: replicar
          ? null
          : pedidoTemItens
            ? snapshotPersistente
            : pedidoAtual.status_itens_snapshot ?? null,
      } as Pedido
      await pedidoLoteApi.mudarStatusConfirmar([id], novoStatus).catch(err => {
        if (!import.meta.env.DEV) throw err
        // DEV: sem servidor → aplica localmente mesmo assim
      })
      let itensCache = itensCarregadosRef.current.get(id) ?? []
      if (replicar && itensCache.length > 0) {
        itensCache = itensCache.map(i => {
          const enr = i as PedidoItemEnriquecido
          if (!enr._p) return i
          return { ...i, _p: { ...enr._p, status: novoStatus } } as PedidoItem
        })
        itensCarregadosRef.current.set(id, itensCache)
      }
      const sinc = itensCache.length > 0
        ? sincronizarItensPedido(itensCache, atualizado)
        : {
          itens: itensCache,
          divergencias: {
            ...calcularDivergencias(itensCache, atualizado),
            status_divergente: !replicar && pedidoTemItens && statusAnterior !== novoStatus,
          } as Partial<Pedido>,
        }
      setPedidos(prev => prev.map(p => p.id === id
        ? { ...atualizado, itens: sinc.itens, ...sinc.divergencias }
        : p
      ))
      if (replicar && itensCache.length > 0) {
        setResetFilhos(prev => prev + 1)
      }
      return { ...atualizado, ...sinc.divergencias }
    }
    // Cobertura cambial — coluna no pedido (cobertura_cambial_pedido); PATCH no pai.
    if (campo === 'cobertura_cambial' || campo === 'cobertura_cambial_pedido') {
      const campoApi = 'cobertura_cambial'
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error(t('pedido.lista.erro.pedido_nao_encontrado'))
      const valorStr = valor == null || valor === '' ? null : String(valor)
      if (!valorStr) {
        throw new Error(t('pedido.lista.erro.cobertura_obrigatoria', 'Selecione uma cobertura cambial.'))
      }
      const replicar = opts?.replicar_em_itens ?? false
      const updatedRaw = await pedidoVirtualApi.editarCampo(id, campoApi, valorStr, replicar)
      let updatedPedido = {
        ...updatedRaw,
        cobertura_cambial: valorStr,
        cobertura_cambial_valor_unico: valorStr,
      } as Pedido
      if (replicar && isPropagavel(campoApi)) {
        const itensApi = updatedRaw.itens
        const itensCache = itensCarregadosRef.current.get(id) ?? []
        if (Array.isArray(itensApi) && itensApi.length > 0) {
          const enriquecidos = itensApi.map(i => ({
            ...i,
            _p: montarContextoPaiItem(updatedPedido, i),
          })) as PedidoItemEnriquecido[]
          itensCarregadosRef.current.set(id, enriquecidos)
          setResetFilhos(prev => prev + 1)
        } else if (itensCache.length > 0) {
          itensCarregadosRef.current.set(
            id,
            itensCache.map(i => aplicarPropagacaoPedidoNoItem(i, campoApi, valorStr)),
          )
          setResetFilhos(prev => prev + 1)
        }
      }
      const itensAtuais = itensCarregadosRef.current.get(id) ?? []
      setPedidos(prev => prev.map(p => {
        if (p.id !== id) return p
        let itensFallback = itensAtuais.length > 0 ? itensAtuais : (p.itens ?? [])
        if (replicar && isPropagavel(campoApi) && itensAtuais.length === 0 && itensFallback.length > 0) {
          itensFallback = itensFallback.map(i => aplicarPropagacaoPedidoNoItem(i, campoApi, valorStr))
        }
        const sinc = itensFallback.length > 0
          ? sincronizarItensPedido(itensFallback, updatedPedido)
          : { itens: itensFallback, divergencias: {} as Partial<Pedido> }
        const divergencias = mesclarDivergenciasPreservandoCoberturaPedido(
          updatedPedido as Record<string, unknown>,
          sinc.divergencias as Record<string, unknown>,
        )
        if (sinc.itens.length > 0) {
          return montarPedidoComItensCarregados(
            { ...updatedPedido, ...divergencias },
            sinc.itens,
            divergencias as Partial<Pedido>,
          )
        }
        return { ...updatedPedido, ...divergencias, itens: p.itens }
      }))
      return updatedPedido
    }
    // Moeda câmbio — coluna no pedido (moeda_cambio_pedido); PATCH no pai.
    if (campo === 'moeda_cambio_pedido') {
      const campoApi = 'moeda_cambio_pedido'
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error(t('pedido.lista.erro.pedido_nao_encontrado'))
      const valorStr = extrairCodigoMoedaLista(valor)
      if (!valorStr) {
        throw new Error(t('pedido.lista.erro.moeda_cambio_obrigatoria', 'Selecione uma moeda do câmbio.'))
      }
      const replicar = opts?.replicar_em_itens ?? false
      const updatedRaw = await pedidoVirtualApi.editarCampo(id, campoApi, valorStr, replicar)
      const updatedPedido = {
        ...updatedRaw,
        moeda_cambio_pedido: valorStr,
        moeda_cambio_pedido_valor_unico: valorStr,
      } as Pedido
      if (replicar && isPropagavel(campoApi)) {
        const itensApi = Array.isArray(updatedRaw.itens) ? updatedRaw.itens : []
        const itensCache = itensCarregadosRef.current.get(id) ?? []
        const base = itensCache.length > 0 ? itensCache : itensApi
        if (base.length > 0) {
          const porId = new Map(itensApi.map(i => [i.id, i]))
          const enriquecidos = base.map(item => {
            const fromApi = porId.get(item.id)
            const merged = aplicarPropagacaoPedidoNoItem(
              fromApi ? { ...item, ...fromApi } : item,
              campoApi,
              valorStr,
            )
            return {
              ...merged,
              _p: montarContextoPaiItem(updatedPedido, merged),
            }
          }) as PedidoItemEnriquecido[]
          itensCarregadosRef.current.set(id, enriquecidos)
          setResetFilhos(prev => prev + 1)
        }
      }
      const itensAtuais = itensCarregadosRef.current.get(id) ?? []
      setPedidos(prev => prev.map(p => {
        if (p.id !== id) return p
        let itensFallback = itensAtuais.length > 0 ? itensAtuais : (p.itens ?? [])
        if (replicar && isPropagavel(campoApi) && itensAtuais.length === 0 && itensFallback.length > 0) {
          itensFallback = itensFallback.map(i => aplicarPropagacaoPedidoNoItem(i, campoApi, valorStr))
        }
        const sinc = itensFallback.length > 0
          ? sincronizarItensPedido(itensFallback, updatedPedido)
          : { itens: itensFallback, divergencias: {} as Partial<Pedido> }
        const divergencias = mesclarDivergenciasPreservandoMoedaCambioPedido(
          updatedPedido as Record<string, unknown>,
          sinc.divergencias as Record<string, unknown>,
        )
        if (sinc.itens.length > 0) {
          return montarPedidoComItensCarregados(
            { ...updatedPedido, ...divergencias },
            sinc.itens,
            divergencias as Partial<Pedido>,
          )
        }
        return { ...updatedPedido, ...divergencias, itens: p.itens }
      }))
      return updatedPedido
    }
    // ── Ghost: campos que existem no item mas NÃO como coluna directa no pai ────
    // PATCH directo nos itens. Lógica de propagação real fica no servidor para
    // campos normais (isPropagavel) — o frontend é apenas o reflexo visual.
    if (isCampoGhostItemNoPedido(campo)) {
      const pedidoAtual = pedidos.find(p => p.id === id)
      if (!pedidoAtual) throw new Error(t('pedido.lista.erro.pedido_nao_encontrado'))
      const valorEnviar = campo === 'data_emissao_pedido' ? normalizarDataISO(valor) : valor
      const replicar = opts?.replicar_em_itens ?? false

      // Descrição na linha pai: sem checkbox → só valor canônico do pedido (itens intactos).
      if (campo === 'descricao_item' && !replicar) {
        const valorStr = String(valorEnviar ?? '')
        let itensExistentes = itensCarregadosRef.current.get(id) ?? []
        if (itensExistentes.length === 0 && (pedidoAtual.itens?.length ?? 0) > 0) {
          itensExistentes = pedidoAtual.itens as PedidoItem[]
        }
        const pedidoComValor = {
          ...pedidoAtual,
          descricao_item: valorStr,
          descricao_item_valor_unico: valorStr,
        } as Pedido
        const sinc = sincronizarItensPedido(itensExistentes, pedidoComValor)
        const divergencias = mesclarDivergenciasPreservandoDescricaoPedido(
          pedidoComValor as Record<string, unknown>,
          sinc.divergencias as Record<string, unknown>,
        )
        const pedidoAtualizado = {
          ...pedidoComValor,
          ...divergencias,
          itens: sinc.itens,
        } as Pedido
        if (itensExistentes.length > 0) {
          itensCarregadosRef.current.set(id, sinc.itens)
        }
        setPedidos(prev => prev.map(p => (p.id === id ? pedidoAtualizado : p)))
        return pedidoAtualizado
      }

      // NCM na linha pai: sem checkbox → só valor canônico do pedido (itens intactos).
      if (campo === 'ncm' && !replicar) {
        const valorStr = String(valorEnviar ?? '')
        let itensExistentes = itensCarregadosRef.current.get(id) ?? []
        if (itensExistentes.length === 0 && (pedidoAtual.itens?.length ?? 0) > 0) {
          itensExistentes = pedidoAtual.itens as PedidoItem[]
        }
        const pedidoComValor = {
          ...pedidoAtual,
          ncm: valorStr,
          ncm_valor_unico: valorStr,
        } as Pedido
        const sinc = sincronizarItensPedido(itensExistentes, pedidoComValor)
        const divergencias = mesclarDivergenciasPreservandoNcmPedido(
          pedidoComValor as Record<string, unknown>,
          sinc.divergencias as Record<string, unknown>,
        )
        const pedidoAtualizado = {
          ...pedidoComValor,
          ...divergencias,
          itens: sinc.itens,
        } as Pedido
        if (itensExistentes.length > 0) {
          itensCarregadosRef.current.set(id, sinc.itens)
        }
        setPedidos(prev => prev.map(p => (p.id === id ? pedidoAtualizado : p)))
        return pedidoAtualizado
      }

      // NCM com checkbox OU cobertura: propaga PATCH em todos os itens.
      let itensGhost = itensCarregadosRef.current.get(id) ?? []
      if (itensGhost.length === 0) {
        itensGhost = (pedidoAtual.itens?.length ?? 0) > 0
          ? (pedidoAtual.itens as PedidoItem[])
          : await pedidoItemApi.listar(id)
      }
      if (itensGhost.length === 0) {
        throw new Error(t('pedido.lista.erro.pedido_sem_itens_para_campo', 'Este pedido não tem itens para atualizar.'))
      }
      const itensAtualizados = await Promise.all(
        itensGhost.map(item => pedidoItemApi.editarCampo(id, item.id, campo, valorEnviar))
      )
      const itensComValor = itensAtualizados.map(i => ({ ...i, [campo]: valorEnviar } as PedidoItem))
      const pedidoComValorCanonico = { ...pedidoAtual, [campo]: valorEnviar } as Pedido
      const { itens: itensSinc, divergencias } = sincronizarItensPedido(itensComValor, pedidoComValorCanonico)
      itensCarregadosRef.current.set(id, itensSinc)
      const divMesclada = campo === 'ncm'
        ? mesclarDivergenciasPreservandoNcmPedido(
          pedidoComValorCanonico as Record<string, unknown>,
          divergencias as Record<string, unknown>,
        )
        : mesclarDivergenciasPreservandoDescricaoPedido(
          pedidoComValorCanonico as Record<string, unknown>,
          divergencias as Record<string, unknown>,
        )
      const pedidoAtualizado = { ...pedidoComValorCanonico, ...divMesclada, itens: itensSinc } as Pedido
      setPedidos(prev => prev.map(p => (p.id === id ? pedidoAtualizado : p)))
      setResetFilhos(prev => prev + 1)
      return pedidoAtualizado
    }
    const pedidoAtual = pedidos.find(p => p.id === id)
    if (
      campo === 'quantidade_volumes_pedido'
      && valor != null
      && typeof valor === 'object'
      && 'unit' in (valor as object)
      && 'quantity' in (valor as object)
    ) {
      const { unit, quantity } = valor as { unit: string; quantity: number }
      const qtdEnviar = Math.max(0, Math.round(Number(quantity) || 0))
      const replicarVol = opts?.replicar_em_itens ?? false
      const updatedQtdRaw = await pedidoVirtualApi.editarCampo(id, 'quantidade_volumes_pedido', qtdEnviar, replicarVol)
      let resultado = { ...updatedQtdRaw, quantidade_volumes_pedido: qtdEnviar } as Pedido
      const tipoAtual = pedidoAtual?.tipo_volume_pedido ?? null
      if (unit && unit !== tipoAtual) {
        const updatedTipoRaw = await pedidoVirtualApi.editarCampo(id, 'tipo_volume_pedido', unit, replicarVol)
        resultado = { ...updatedTipoRaw, quantidade_volumes_pedido: qtdEnviar, tipo_volume_pedido: unit } as Pedido
      } else if (unit) {
        resultado = { ...resultado, tipo_volume_pedido: unit }
      }
      setPedidos(prev => prev.map(p => (p.id === id ? resultado : p)))
      atualizarCacheItensContextoPai(id, resultado, itensCarregadosRef)
      setResetFilhos(prev => prev + 1)
      return resultado
    }
    // GTValorMoeda { currency, amount } → campos moeda_*_pedido armazenam apenas o código ISO (String)
    // O overlay tipo='moeda' envia objeto composto; extraímos só `currency` para campos de código.
    const CAMPOS_MOEDA_CODIGO = new Set(['moeda_pedido', 'moeda_cambio_pedido'])
    const isMoedaObj = valor != null && typeof valor === 'object' && 'currency' in (valor as object)
    // GTValorUnidade { unit, quantity } → extrai quantity, aplica conversão para KG em campos de peso
    const CAMPOS_PESO_PAI = new Set(['peso_liquido_total_pedido', 'peso_bruto_total_pedido'])
    // apenasUnidade: true — grava só a sigla (string), não quantity
    const CAMPOS_UNIDADE_CODIGO_PAI = new Set(['unidade_comercializada_pedido', 'tipo_volume_pedido'])
    const isUnidadePai = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)
    const valorEnviarPaiBruto: unknown = isMoedaObj && CAMPOS_MOEDA_CODIGO.has(campo)
      ? (valor as { currency: string }).currency
      : isUnidadePai && CAMPOS_UNIDADE_CODIGO_PAI.has(campo)
        ? (valor as { unit: string }).unit
        : isUnidadePai
          ? (() => {
              const { unit, quantity } = valor as { unit: string; quantity: number }
              return CAMPOS_PESO_PAI.has(campo) ? quantidadeExibicaoParaKg(quantity, unit, mapaFatorParaKg) : quantity
            })()
          : valor
    const valorEnviarPaiBrutoNorm = isCampoLogisticaPedido(campo)
      ? normalizarCodigoLogisticaPedido(valorEnviarPaiBruto)
      : valorEnviarPaiBruto
    const valorEnviarPai: unknown = campo.startsWith('data_')
      ? (normalizarDataISO(valorEnviarPaiBrutoNorm) ?? valorEnviarPaiBrutoNorm)
      : valorEnviarPaiBrutoNorm
    // replicar_em_itens vem do checkbox "Aplicar a todos os itens" no popover
    // do pai (Decisão UX 2026-05-13). Default false — comportamento divergente.
    // Exceção: id_workspace e tipo_operacao SEMPRE replicam — sem checkbox no popover.
    const replicar = campo === 'id_workspace' || campo === 'tipo_operacao'
      ? true
      : (opts?.replicar_em_itens ?? false)
    const updatedPedidoRaw = await pedidoVirtualApi.editarCampo(id, campo, valorEnviarPai, replicar)
    const valorPedidoAposSave = campo.startsWith('data_')
      ? ((updatedPedidoRaw as Record<string, unknown>)[campo] as string | null | undefined) ?? valorEnviarPai
      : valorEnviarPai
    let updatedPedido = {
      ...updatedPedidoRaw,
      [campo]: valorPedidoAposSave,
    } as Pedido
    // Trocar workspace atualiza parte espelhada (IMP→importador, EXP→exportador).
    if (campo === 'id_workspace') {
      const pai = pedidos.find(p => p.id === id)
      const tipo = tipoOperacaoLista(pai ?? {})
      const idWs = String(valorEnviarPai ?? '').trim()
      const nomeWs = nomeLegivelWorkspace(idWs, workspacesMap, workspaceOpcoesLista)
      if (nomeWs !== '—') {
        if (tipo === 'importacao') {
          updatedPedido = { ...updatedPedido, nome_importador: nomeWs }
        } else if (tipo === 'exportacao') {
          updatedPedido = { ...updatedPedido, nome_exportador: nomeWs }
        }
      }
    }
    // Quando replicou, o servidor atualizou os itens filhos via updateMany.
    // ATUALIZA o cache local de itens com o novo valor (em vez de só invalidar
    // — invalidar sozinho exige refetch ao expandir e mantém flag stale).
    // Decisão UX 2026-05-13: refletir imediatamente nos itens em memória.
    if (replicar && isPropagavel(campo)) {
      const itensApi = updatedPedidoRaw.itens
      const itensCache = itensCarregadosRef.current.get(id) ?? []
      if (Array.isArray(itensApi) && itensApi.length > 0) {
        const enriquecidos = itensApi.map(i => ({
          ...i,
          _p: montarContextoPaiItem(updatedPedido, i),
        })) as PedidoItemEnriquecido[]
        itensCarregadosRef.current.set(id, enriquecidos)
        setResetFilhos(prev => prev + 1)
      } else if (itensCache.length > 0) {
        itensCarregadosRef.current.set(
          id,
          itensCache.map(i => aplicarPropagacaoPedidoNoItem(i, campo, valorEnviarPai)),
        )
        setResetFilhos(prev => prev + 1)
      }
    }
    // Recalcula flags de divergência com o novo valor do pai. Necessário pra
    // campos como data_emissao_pedido onde a regra é "pai != filhos -> alerta"
    // (decisão UX 2026-05-13). Sem isso, a flag continua stale após edição do pai.
    const itensAtuais = itensCarregadosRef.current.get(id) ?? []
    // Se o ref cache está vazio (pedido nunca expandido), tenta usar p.itens do state
    // para não perder flags de divergência que já vieram do backend.
    setPedidos(prev => prev.map(p => {
      if (p.id !== id) return p
      let itensFallback = itensAtuais.length > 0 ? itensAtuais : (p.itens ?? [])
      if (replicar && isPropagavel(campo) && itensAtuais.length === 0 && itensFallback.length > 0) {
        itensFallback = itensFallback.map(i => aplicarPropagacaoPedidoNoItem(i, campo, valorEnviarPai))
      }
      const sinc = itensFallback.length > 0
        ? sincronizarItensPedido(itensFallback, updatedPedido)
        : { itens: itensFallback, divergencias: {} as Partial<Pedido> }
      if (sinc.itens.length > 0) {
        return montarPedidoComItensCarregados(updatedPedido, sinc.itens, sinc.divergencias)
      }
      return { ...updatedPedido, itens: p.itens, ...sinc.divergencias }
    }))
    return updatedPedido
  }, [pedidos, colunasUsuario, opcoesImportadoresExpLista, opcoesExportadoresImpLista, workspacesMap, workspaceOpcoesLista, mapaFatorParaKg, t])

  // ── Recalcula flags de divergência a partir dos itens carregados ─────────────
  // SSOT: pedidoDivergencias.ts (shared) + getAlertavelKeys() em columnAlertConfig.ts
  function calcularDivergencias(itens: PedidoItem[], pedidoPai?: Pedido): Partial<Pedido> {
    return calcularDivergenciasPedido(
      itens as unknown as Record<string, unknown>[],
      pedidoPai as unknown as Record<string, unknown> | undefined,
    ) as Partial<Pedido>
  }

  /** Marca PN duplicado nos itens + recalcula divergências pai/filho (SSOT local). */
  function sincronizarItensPedido(itens: PedidoItem[], pedidoPai?: Pedido): {
    itens: PedidoItem[]
    divergencias: Partial<Pedido>
  } {
    const itensMarcados = marcarPartNumbersDuplicados(itens)
    const divergencias = {
      ...calcularDivergencias(itensMarcados, pedidoPai),
      part_number_duplicado_no_pedido: pedidoTemPartNumberDuplicado(itensMarcados),
    }
    return {
      itens: itensMarcados,
      divergencias: mesclarDivergenciasPreservandoDescricaoPedido(
        pedidoPai as Record<string, unknown> | undefined,
        divergencias as Record<string, unknown>,
      ) as Partial<Pedido>,
    }
  }

  // ── Edição inline (filho / item) ──────────────────────────────────────────────
  const handleEditarFilho = useCallback(async (
    id: string,
    campo: string,
    valor: unknown,
    opts?: { replicar_em_itens?: boolean },
  ): Promise<PedidoItem> => {
    // Localiza o pedido pai via cache de itens carregados (p.itens é sempre [] na list view)
    let pedidoId: string | undefined
    for (const [pId, itensCache] of itensCarregadosRef.current) {
      if (itensCache.some(i => i.id === id)) { pedidoId = pId; break }
    }
    const pedido = pedidoId ? pedidos.find(p => p.id === pedidoId) : undefined
    if (!pedido) throw new Error(t('pedido.lista.erro.pedido_item_nao_localizado'))
    // Helper: itens carregados via handleCarregarFilhos (lista view retorna itens:[])
    const getItensCache = () => itensCarregadosRef.current.get(pedido.id) ?? []

    if (campo === 'id_workspace' || campo === 'company_id') {
      throw new Error(t('pedido.lista.erro.workspace_somente_pedido', 'Workspace é definido no pedido e aplica-se a todos os itens.'))
    }

    // Moeda câmbio item: col.key = moeda_cambio_pedido; mapa.campo = moeda_cambio_item_pedido (espelha moeda_pedido→moeda_item).
    if (campo === 'moeda_cambio_pedido' || campo === 'moeda_cambio_item_pedido') {
      const moedaCodigo = extrairCodigoMoedaLista(valor)
      if (!moedaCodigo) throw new Error(t('pedido.lista.erro.moeda_cambio_obrigatoria', 'Selecione uma moeda do câmbio.'))
      const itemAtualMc = getItensCache().find(i => i.id === id)
      let atualizadoMcRaw: PedidoItem
      try {
        atualizadoMcRaw = await pedidoItemApi.editarCampo(pedido.id, id, 'moeda_cambio_item_pedido', moedaCodigo)
      } catch {
        atualizadoMcRaw = await pedidoItemApi.atualizar(
          pedido.id,
          id,
          { moeda_cambio_item_pedido: moedaCodigo } as Partial<PedidoItem>,
        )
      }
      const atualizadoMc = {
        ...(itemAtualMc ?? {}),
        ...atualizadoMcRaw,
        moeda_cambio_item_pedido: moedaCodigo,
      } as PedidoItem
      const enriquecidoMc: PedidoItemEnriquecido = {
        ...atualizadoMc,
        _p: montarContextoPaiItem(pedido, atualizadoMc),
      }
      const { itens: itensAposMc, divergencias: divMc } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoMc : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposMc)
      setPedidos(prev => prev.map(p => p.id !== pedido.id ? p : { ...p, ...divMc, itens: itensAposMc }))
      return itensAposMc.find(i => i.id === id) ?? enriquecidoMc
    }

    if (isCampoLogisticaPedido(campo)) {
      const valorNorm = normalizarCodigoLogisticaPedido(valor)
      const updatedPedidoRaw = await pedidoVirtualApi.editarCampo(pedido.id, campo, valorNorm, false)
      const updatedPedido = {
        ...updatedPedidoRaw,
        [campo]: valorNorm,
      } as Pedido
      const itensCache = getItensCache()
      const itensAtualizados = itensCache.map(i => ({
        ...i,
        _p: montarContextoPaiItem(updatedPedido, i),
      })) as PedidoItemEnriquecido[]
      itensCarregadosRef.current.set(pedido.id, itensAtualizados)
      setPedidos(prev => prev.map(p => (p.id !== pedido.id ? p : { ...updatedPedido, itens: p.itens })))
      setResetFilhos(prev => prev + 1)
      const itemAtual = itensAtualizados.find(i => i.id === id)
      if (!itemAtual) throw new Error(t('pedido.lista.erro.pedido_item_nao_localizado'))
      return itemAtual
    }

    if (campo === 'nome_importador') {
      throw new Error(t('pedido.coluna_filho.mapa_nome_importador.tooltip_bloqueado'))
    }

    if (campo === 'nome_exportador') {
      throw new Error(t('pedido.coluna_filho.mapa_nome_exportador.tooltip_bloqueado_cond'))
    }

    if (campo === 'status') {
      const novoStatus = String(valor)
      const item = getItensCache().find(i => i.id === id)
      if (!item) throw new Error(t('pedido.lista.erro.pedido_item_nao_localizado'))
      const itemAtualizado = {
        ...item,
        _p: { ...(item as PedidoItemEnriquecido)._p, status: novoStatus },
      } as PedidoItem
      const itensCache = getItensCache().map(i => i.id === id ? itemAtualizado : i)
      itensCarregadosRef.current.set(pedido.id, itensCache)
      const sinc = sincronizarItensPedido(itensCache, pedido)
      itensCarregadosRef.current.set(pedido.id, sinc.itens)
      setPedidos(prev => prev.map(p => p.id !== pedido.id
        ? p
        : { ...p, itens: sinc.itens, ...sinc.divergencias }
      ))
      const retorno = sinc.itens.find(i => i.id === id)
      if (!retorno) throw new Error(t('pedido.lista.erro.pedido_item_nao_localizado'))
      return retorno
    }

    // valor_total_item retorna GTValorMoeda { currency, amount } → salva amount + moeda_item no item (por item)
    if (campo === 'valor_total_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const atualizadoMv = await pedidoItemApi.atualizar(pedido.id, id, {
        valor_total_item: mv.amount,
        moeda_item: mv.currency,
      } as Partial<PedidoItem>)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_valor_total_item')))
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
      const { itens: itensAposEdicaoMv, divergencias: divergenciasMv } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoMv : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoMv)

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

    // valor_total_cambio_item_pedido — espelha valor_total_item: salva amount + moeda câmbio do item.
    if (campo === 'valor_total_cambio_item_pedido' || campo === 'valor_total_cambio_pedido') {
      let amount: number
      let moedaCambio: string | null = null
      if (valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
        const mv = valor as { currency?: string; amount?: unknown }
        amount = Number(mv.amount)
        moedaCambio = extrairCodigoMoedaLista(mv.currency) ?? null
      } else {
        amount = Number(valor)
      }
      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error(t('pedido.lista.erro.editar_valor_total_cambio_item', 'Valor total do câmbio inválido.'))
      }
      const atualizadoVtc = await pedidoItemApi.atualizar(pedido.id, id, {
        valor_total_cambio_item_pedido: amount,
        ...(moedaCambio ? { moeda_cambio_item_pedido: moedaCambio } : {}),
      } as Partial<PedidoItem>)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_valor_total_cambio_item', 'Erro ao salvar valor total do câmbio.')))
      const enriquecidoVtc: PedidoItemEnriquecido = {
        ...atualizadoVtc,
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
          moeda_cambio_pedido: pedido.moeda_cambio_pedido ?? null,
        },
      }
      const { itens: itensAposEdicaoVtc, divergencias: divergenciasVtc } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoVtc : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoVtc)

      const moedasCambioContrib = new Set(
        itensAposEdicaoVtc
          .filter(i => Number(i.valor_total_cambio_item_pedido ?? 0) > 0 && i.moeda_cambio_item_pedido)
          .map(i => i.moeda_cambio_item_pedido as string)
      )
      const valorTotalCambioLocal = moedasCambioContrib.size > 1
        ? null
        : itensAposEdicaoVtc.reduce((s, i) => s + (Number(i.valor_total_cambio_item_pedido) || 0), 0)

      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasVtc,
          itens: itensAposEdicaoVtc,
          valor_total_cambio_pedido: valorTotalCambioLocal,
        }
      }))
      return enriquecidoVtc
    }

    // moeda_pedido editado a partir de uma linha FILHO (tipo='select' → valor é string pura, ex: 'USD').
    // Salva no campo moeda_item do item (mapeamento: moeda_pedido → moeda_item).
    if (campo === 'moeda_pedido') {
      const moedaCodigo = String(valor)
      const atualizadoMp = await pedidoItemApi.atualizar(pedido.id, id, {
        moeda_item: moedaCodigo,
      } as Partial<PedidoItem>)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_moeda_item')))
      const enriquecidoMp: PedidoItemEnriquecido = {
        ...atualizadoMp,
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
      const { itens: itensAposEdicaoMp, divergencias: divergenciasMp } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoMp : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoMp)
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasMp,
          itens: itensAposEdicaoMp,
        }
      }))
      return enriquecidoMp
    }

    // moeda_item: o editor tipo 'moeda' retorna GTValorMoeda { currency, amount }.
    // Precisamos extrair apenas o currency e salvar no campo moeda_item.
    if (campo === 'moeda_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const atualizadoMi = await pedidoItemApi.atualizar(pedido.id, id, {
        moeda_item: mv.currency,
      } as Partial<PedidoItem>)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_moeda_item_obj')))
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
          condicao_pagamento: pedido.condicao_pagamento ?? null,
          data_emissao_pedido: pedido.data_emissao_pedido ?? null,
          status: pedido.status,
          moeda_pedido: (pedido as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
        },
      }
      const { itens: itensAposEdicaoMi, divergencias: divergenciasMi } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoMi : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoMi)
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasMi,
          itens: itensAposEdicaoMi,
        }
      }))
      return enriquecidoMi
    }

    if (campo === 'tipo_volume_item' && valor != null && typeof valor === 'object' && 'unit' in (valor as object)) {
      const unit = (valor as { unit: string }).unit
      let pedidoAtualizado = pedido
      const tipoAtualPedido = pedido.tipo_volume_pedido ?? null
      if (unit && unit !== tipoAtualPedido) {
        const updatedTipoRaw = await pedidoVirtualApi.editarCampo(pedido.id, 'tipo_volume_pedido', unit)
        pedidoAtualizado = { ...updatedTipoRaw, tipo_volume_pedido: unit } as Pedido
      }
      const atualizadoTv = await pedidoItemApi.editarCampo(pedido.id, id, 'tipo_volume_item', unit)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_tipo_volume_item', 'Erro ao editar tipo de volume do item')))
      const enriquecidoTv: PedidoItemEnriquecido = {
        ...atualizadoTv,
        _p: montarContextoPaiItem(pedidoAtualizado, atualizadoTv),
      }
      const { itens: itensAposEdicaoTv, divergencias: divergenciasTv } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoTv : i),
        pedidoAtualizado,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoTv)
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return { ...pedidoAtualizado, ...divergenciasTv, itens: itensAposEdicaoTv }
      }))
      setResetFilhos(prev => prev + 1)
      return enriquecidoTv
    }

    if (
      campo === 'quantidade_volumes_pedido'
      && valor != null
      && typeof valor === 'object'
      && 'unit' in (valor as object)
      && 'quantity' in (valor as object)
    ) {
      const { unit, quantity } = valor as { unit: string; quantity: number }
      const qtdEnviar = Math.max(0, Math.round(Number(quantity) || 0))
      const updatedQtdRaw = await pedidoVirtualApi.editarCampo(pedido.id, 'quantidade_volumes_pedido', qtdEnviar)
      let pedidoAtualizado = { ...updatedQtdRaw, quantidade_volumes_pedido: qtdEnviar } as Pedido
      const tipoAtualPedido = pedido.tipo_volume_pedido ?? null
      if (unit && unit !== tipoAtualPedido) {
        const updatedTipoRaw = await pedidoVirtualApi.editarCampo(pedido.id, 'tipo_volume_pedido', unit)
        pedidoAtualizado = {
          ...updatedTipoRaw,
          quantidade_volumes_pedido: qtdEnviar,
          tipo_volume_pedido: unit,
        } as Pedido
      } else if (unit) {
        pedidoAtualizado = { ...pedidoAtualizado, tipo_volume_pedido: unit }
      }
      const itemAtualQv = getItensCache().find(i => i.id === id)
      const tipoItemAtual = itemAtualQv?.tipo_volume_item ?? null
      let atualizadoQv = itemAtualQv!
      if (unit && unit !== tipoItemAtual) {
        atualizadoQv = await pedidoItemApi.editarCampo(pedido.id, id, 'tipo_volume_item', unit)
          .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_tipo_volume_item', 'Erro ao editar tipo de volume do item')))
      }
      const enriquecidoQv: PedidoItemEnriquecido = {
        ...atualizadoQv,
        _p: montarContextoPaiItem(pedidoAtualizado, atualizadoQv),
      }
      const { itens: itensAposEdicaoQv, divergencias: divergenciasQv } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoQv : i),
        pedidoAtualizado,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoQv)
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return { ...pedidoAtualizado, ...divergenciasQv, itens: itensAposEdicaoQv }
      }))
      setResetFilhos(prev => prev + 1)
      return enriquecidoQv
    }

    // unidade_comercializada_item: o editor tipo 'unidade' retorna
    // GTValorUnidade { unit, quantity }. Extraímos apenas o unit.
    if (campo === 'unidade_comercializada_item' && valor != null && typeof valor === 'object' && 'unit' in (valor as object)) {
      const uv = valor as { unit: string; quantity: number }
      const atualizadoUi = await pedidoItemApi.atualizar(pedido.id, id, {
        unidade_comercializada_item: uv.unit,
      } as Partial<PedidoItem>)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_unidade_item')))
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
          condicao_pagamento: pedido.condicao_pagamento ?? null,
          data_emissao_pedido: pedido.data_emissao_pedido ?? null,
          status: pedido.status,
          moeda_pedido: (pedido as Pedido & { moeda_pedido?: string }).moeda_pedido ?? 'USD',
        },
      }
      const { itens: itensAposEdicaoUi, divergencias: divergenciasUi } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoUi : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoUi)
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasUi,
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
      const atualizadoVu = await pedidoItemApi.atualizar(pedido.id, id, {
        valor_por_unidade_item: mv.amount,
        moeda_item: mv.currency,
      } as Partial<PedidoItem>)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_valor_unidade_item')))
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
      const { itens: itensAposEdicaoVu, divergencias: divergenciasVu } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoVu : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicaoVu)
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

    // quantidade_pronta_item → endpoint dedicado PATCH /pronta
    if (campo === 'quantidade_pronta_item') {
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
          .catch((err) => relancarErroApi(err, t('pedido.lista.erro.atualizar_unidade_item')))
      }

      const atualizadoPronta = await pedidoItemApi.atualizarPronta(pedido.id, id, qtd)
        .catch((err) => relancarErroApi(err, t('pedido.lista.erro.atualizar_qtd_pronta')))
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
      const { itens: itensAposEdicao, divergencias: divergenciasPronta } = sincronizarItensPedido(
        getItensCache().map(i => i.id === id ? enriquecidoPronta : i),
        pedido,
      )
      itensCarregadosRef.current.set(pedido.id, itensAposEdicao)
      // Recalcula divergencias: se unidade mudou e divergem entre itens, a flag
      // `unidade_comercializada_item_divergente` é setada e a coluna mostra o
      // alerta "⚠ Unidades divergentes entre itens" via renderQtdPedido.
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...divergenciasPronta,
          itens: itensAposEdicao,
          quantidade_pronta_itens_pedido_total: itensAposEdicao.reduce((s, i) => s + (Number(i.quantidade_pronta_item) || 0), 0),
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
        const sincFilho = itensDivCache.length > 0
          ? sincronizarItensPedido(itensDivCache as PedidoItem[], p)
          : { itens: itensAtualizados, divergencias: {} as Partial<Pedido> }
        itensCarregadosRef.current.set(pedido.id, sincFilho.itens)
        return {
          ...p,
          ...sincFilho.divergencias,
          itens: sincFilho.itens,
        }
      }))

      if (aceitaPorItem) setResetFilhos(prev => prev + 1)

      const item = getItensCache().find(i => i.id === id)!
      const colunasAtuais = (item as Record<string, unknown>)['_colunas_usuario'] as Record<string, string> ?? {}
      return { ...item, _colunas_usuario: { ...colunasAtuais, [colunaCustomFilho.id]: String(valor) } } as PedidoItem
    }

    let payload: Partial<PedidoItem>
    {
      // Datas replicáveis — PATCH /itens/:id/campo (PUT strict não aceita data_*).
      if (campo.startsWith('data_')) {
        const isoData = normalizarDataISO(valor)
        const atualizadoData = await pedidoItemApi.editarCampo(pedido.id, id, campo, isoData)
          .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_campo', { campo })))
        const enriquecidoData: PedidoItemEnriquecido = {
          ...atualizadoData,
          _p: montarContextoPaiItem(pedido, atualizadoData),
        }
        const { itens: itensAposEdicaoData, divergencias: divergenciasData } = sincronizarItensPedido(
          getItensCache().map(i => i.id === id ? enriquecidoData : i),
          pedido,
        )
        itensCarregadosRef.current.set(pedido.id, itensAposEdicaoData)
        setPedidos(prev => prev.map(p => {
          if (p.id !== pedido.id) return p
          return { ...p, ...divergenciasData, itens: itensAposEdicaoData }
        }))
        return enriquecidoData
      }

      // GTValorUnidade { unit, quantity } → extrai quantity para campos numéricos + salva unidade
      const isUnidade = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)
      // Fatores de conversão para kg (todos os campos de peso são persistidos em kg)
      const CAMPOS_PESO_ITEM = new Set(['peso_liquido_unitario', 'peso_bruto_unitario'])
      const valorFinal: unknown = (
        campo === 'valor_total_cambio_item_pedido' || campo === 'valor_total_cambio_pedido'
      ) && valor != null && typeof valor === 'object' && 'currency' in (valor as object)
        ? Number((valor as { amount?: unknown }).amount)
        : CAMPOS_NUMERICOS_ITEM.has(campo)
        ? (() => {
            const qty = isUnidade ? (valor as { quantity: number }).quantity : Number(valor) || 0
            if (CAMPOS_PESO_ITEM.has(campo) && isUnidade) {
              const unit = (valor as { unit: string }).unit
              return quantidadeExibicaoParaKg(qty, unit, mapaFatorParaKg)
            }
            return qty
          })()
        : valor
      const chavePayload = campo === 'valor_total_cambio_pedido' ? 'valor_total_cambio_item_pedido' : campo
      payload = { [chavePayload]: valorFinal } as Partial<PedidoItem>
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

    const atualizado = await pedidoItemApi.atualizar(pedido.id, id, payload)
      .catch((err) => relancarErroApi(err, t('pedido.lista.erro.editar_campo', { campo })))

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
      _p: montarContextoPaiItem(pedido, atualizado),
    }

    // Atualiza cache e recalcula os aggregates do pedido pai
    const { itens: itensAposEdicao, divergencias } = sincronizarItensPedido(
      getItensCache().map(i => i.id === id ? enriquecido : i),
      pedido,
    )
    itensCarregadosRef.current.set(pedido.id, itensAposEdicao)
    setPedidos(prev => prev.map(p => {
      if (p.id !== pedido.id) return p
      return {
        ...p,
        ...divergencias,
        descricao_item: p.descricao_item,
        itens: itensAposEdicao,
        quantidade_total_pedido: somaQuantidadeTotalPedidoLocal(itensAposEdicao),
        quantidade_transferida_total:    itensAposEdicao.reduce((s, i) => s + (Number(i.quantidade_transferida_pedido)    || 0), 0),
        peso_liquido_total_pedido:       somaPesoLiquidoItensLista(itensAposEdicao),
        peso_bruto_total_pedido:         somaPesoBrutoItensLista(itensAposEdicao),
        cubagem_total_pedido:            somaCubagemItensLista(itensAposEdicao),
        valor_total_pedido:              somaValorTotalPedidoLocal(itensAposEdicao),
      }
    }))
    return itensAposEdicao.find(i => i.id === id) ?? enriquecido
  }, [pedidos, handleEditar, mapaFatorParaKg, t])

  // ── Carregar filhos (itens do pedido) ────────────────────────────────────────
  function montarPedidoComItensCarregados(
    p: Pedido,
    itensComAlertas: PedidoItem[],
    divergencias: Partial<Pedido>,
  ): Pedido {
    return {
      ...p,
      ...divergencias,
      itens: itensComAlertas,
      quantidade_total_pedido: somaQuantidadeTotalPedidoLocal(itensComAlertas),
      quantidade_transferida_total: itensComAlertas.reduce((s, i) => s + (Number(i.quantidade_transferida_pedido) || 0), 0),
      peso_liquido_total_pedido: somaPesoLiquidoItensLista(itensComAlertas),
      peso_bruto_total_pedido: somaPesoBrutoItensLista(itensComAlertas),
      cubagem_total_pedido: somaCubagemItensLista(itensComAlertas),
    }
  }

  const handleCarregarFilhos = useCallback(async (
    pedido: Pedido,
    opts?: GTCarregarFilhosOpts,
  ): Promise<PedidoItem[]> => {
    // BUG fix 2026-05-13: removida atribuição `_colunas_usuario: parentColunas`.
    // Sobrescrever `_colunas_usuario` do ITEM com o do PAI é incorreto —
    // colunas de escopo='item' têm valores PRÓPRIOS por id_item. O backend agora
    // injeta o `_colunas_usuario` correto em cada item (GET /:id/itens + init),
    // então só preservamos o que veio da rede via spread `...item`.
    // Init e paginação já incluem itens no pedido. Só busca via API se não vieram carregados.
    // Após "Aplicar a todos os itens", itensCarregadosRef já tem os valores
    // propagados — priorizar o ref evita filhosCache vazio no resetCacheFilhos.
    const itensEmRef = itensCarregadosRef.current.get(pedido.id)
    const rawItens = (itensEmRef?.length ?? 0) > 0
      ? itensEmRef
      : (pedido.itens?.length ?? 0) > 0
        ? pedido.itens
        : await pedidoItemApi.listar(pedido.id)
    const itensEnriquecidos = rawItens.map(item => ({
      ...item,
      _p: montarContextoPaiItem(pedido, item),
    }))
    // Popula cache para handleEditarFilho (não-reativo, evita re-loads em useGTExpandir)
    const { itens: itensComAlertas, divergencias } = sincronizarItensPedido(itensEnriquecidos, pedido)
    itensCarregadosRef.current.set(pedido.id, itensComAlertas)
    if (opts?.modo === 'selecao-lote') {
      patchPedidosCarregarFilhosLoteRef.current.set(pedido.id, {
        itens: itensComAlertas,
        divergencias,
      })
      return itensComAlertas
    }
    // Atualiza pedidos state com itens carregados + recalcula aggregates e divergências.
    setPedidos(prev => prev.map(p => (
      p.id !== pedido.id ? p : montarPedidoComItensCarregados(p, itensComAlertas, divergencias)
    )))
    return itensComAlertas
  }, [])

  const flushPedidosAposCarregarFilhosLote = useCallback(() => {
    const patches = patchPedidosCarregarFilhosLoteRef.current
    if (patches.size === 0) return
    patchPedidosCarregarFilhosLoteRef.current = new Map()
    setPedidos(prev => prev.map(p => {
      const patch = patches.get(p.id)
      if (!patch) return p
      return montarPedidoComItensCarregados(p, patch.itens, patch.divergencias)
    }))
  }, [])

  // ── Salvar preferências ──────────────────────────────────────────────────────
  const pedidoItemVersion = useCallback((p: Pedido) => p.updated_at, [])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    if (painelListaAtualId) {
      persistirPainelAtual({
        preferencias: prefs,
        abaAtiva,
        sortCampo,
        sortDir,
        busca,
        filtrosAtivos,
        cardsVisiveisIds: cardsVisiveis.map(c => c.id),
        periodoCards,
      }, { imediato: true, acaoUsuario: true })
    }
  }, [
    painelListaAtualId,
    persistirPainelAtual,
    abaAtiva,
    sortCampo,
    sortDir,
    busca,
    filtrosAtivos,
    cardsVisiveis,
    periodoCards,
  ])

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
          _tipo_linha: t('pedido.lista.export_linha.item'),
          numero_item: i.part_number ?? '',
          part_number: i.part_number,
          descricao_item: i.descricao_item,
          ncm: i.ncm,
          quantidade_item: i.quantidade_atual_pedido,
          quantidade_inicial_item: i.quantidade_inicial_pedido,
          valor_item: i.valor_total_item,
        }))
        return itensDoPedido.length > 0
          ? [{ ...pai, _tipo_linha: t('pedido.lista.export_linha.pedido'), numero_item: '' }, ...itensDoPedido]
          : [{ ...pai, _tipo_linha: t('pedido.lista.export_linha.pedido') }]
      })
    } else {
      dados = base.map(p => ({ ...(p as unknown as Record<string, unknown>), _tipo_linha: t('pedido.lista.export_linha.pedido') }))
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
        exportarExcel(dados, colunasExport, { nomeArquivo: 'pedidos', titulo: t('pedido.lista.export_titulo') })
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
        void exportarPDF(dados, colunasExport, { nomeArquivo: 'pedidos', titulo: t('pedido.lista.export_titulo') })
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [pedidos, pedidosFiltrados, pedidosSelecionados, colunasUsuario])

  return (
    <div className="ws-fade-up lp-page">

      {/* ── GABI Token Badge — exibe consumo mensal quando quota estiver configurada ── */}
      {gabiQuota && gabiQuota.quota_mensal > 0 && (
        <div style={{ position: 'fixed', top: '0.75rem', right: '1rem', zIndex: 500 }}>
          <GabiTokenBadge tokensUsados={gabiQuota.tokens_usados} quotaMensal={gabiQuota.quota_mensal} />
        </div>
      )}

      {/* ── KPI cards ── */}
      <ListaPedidoCards
        cardsVisiveis={cardsVisiveis}
        pedidos={pedidos}
        pedidosFiltrados={pedidosFiltrados}
        total={total}
        totalItensBanco={totalItensBanco}
        periodo={periodoCards}
        abaAtiva={abaAtiva}
        busca={busca}
        workspacesSelecionados={workspacesSelecionados}
        workspaceAtivo={workspaceAtivo}
        temFiltroColunaCliente={temFiltroColunaCliente}
        taxasVenda={taxasVenda}
      />

      {/* ── Feedback de erro em lote ── */}
      {erroLote && (
        <div className="lp-erro-lote" role="alert">
          <Warning size={16} weight="duotone" />
          <span>{erroLote}</span>
          <button onClick={() => setErroLote(null)} aria-label={t('pedido.lista.fechar_erro')}><X size={14} /></button>
        </div>
      )}

      {/* ── Popovers de filtro (renderizados no nível do page para z-index correto) ── */}
      {popoverAberto && (() => {
        const col = colunasPai.find(c => c.key === popoverAberto)
        if (!col) return null
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
            anchorPos={popoverPos}
            labelInverso={getLabelsFiltroInverso(col.key, t)}
          />
        )
      })()}

      {/* ── Tabela virtual (painéis + status na mesma faixa do chrome) ── */}
      <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada">
        <div className="lp-tabela-chrome">
          <PedidosListaFaixaNavegacao
            paineis={paineisLista}
            painelAtualId={painelListaAtualId}
            setPaineis={setPaineisLista}
            setPainelAtualId={setPainelListaAtualId}
            onTrocarPainel={handleTrocarPainelLista}
            onCriarPainel={handleCriarPainelLista}
            carregando={carregandoPaineisLista}
            abas={abas}
            abaAtiva={abaAtiva}
            onMudarAba={handleMudarAba}
          />
        <TabelaVirtualGlobal<Pedido, PedidoItem>
          imperativeRef={tabelaRef}
          dados={pedidosFiltrados}
          colunas={colunasComUsuario}
          colunasSeletor={colunasSeletorLista}
          itemId={pedidoItemId}

          mapaColunasFilho={mapaColunasFilho}
          onCarregarFilhos={handleCarregarFilhos}
          onCarregarFilhosLoteConcluido={flushPedidosAposCarregarFilhosLote}
          onExpandidosMudar={(count) => setTemExpandido(count > 0)}
          itemVersion={pedidoItemVersion}
          filhoId={pedidoFilhoId}
          renderConectorFilho={pedidoRenderConectorFilho}
          itensPorPagina={ITENS_POR_PAGINA}
          totalItens={total}
          paginaAtual={paginaAtual}
          onMudarPagina={handleMudarPagina}
          labelPai={[t('pedido.barra.label_pedido_one'), t('pedido.barra.label_pedido_other')]}
          totalFilhos={totalItensBanco}

          acoes={acoesPai}
          acoesExportacao={acoesExportacao}
          onSelecaoMudar={setPedidosSelecionados}
          onFiltroColuna={onFiltroColuna}
          filtrosAtivosKeys={filtrosAtivosKeys}

          renderIndicadorLinha={renderIndicadorLinhaPedido}
          renderIndicadorLinhaFilho={renderIndicadorLinhaItem}
          classNameLinhaPai={classNameLinhaPai}

          selecionavelFilhos
          onSelecaoFilho={onSelecaoFilhoEstavel}
          resetSelecaoFilhos={resetFilhos}
          resetCacheFilhos={resetFilhos}
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
          mensagemSemPermissaoEditar={!podeEditarLista ? t('pedido.lista.sem_permissao_editar') : undefined}
          onEditar={podeEditarLista ? async (id: string, campo: string, valor: unknown, opts) => {
            let idReal = id;
            if (!pedidosFiltrados.some(p => p.id === idReal)) {
               const pedidoCerto = pedidosFiltrados.find(p => p.numero_pedido === idReal || (p as any)._idVirtual === idReal);
               if (pedidoCerto) idReal = pedidoCerto.id;
            }
            const pedidoAntes = pedidos.find(p => p.id === idReal)
            const numeroAnterior = pedidoAntes?.numero_pedido
            const resultado = await handleEditar(idReal, campo, valor, opts)
            if (campo === 'numero_pedido' && numeroAnterior && busca.trim() === numeroAnterior) {
              setBusca(String(resultado.numero_pedido ?? valor ?? ''))
            }
            setPedidoFocoId(prev => (prev === idReal ? null : prev))
            return resultado
          } : undefined}
          permiteReplicacaoPaiEmItens={podeEditarLista ? (campo) => {
            const COLUNAS_SEM_REPLICACAO = new Set([
              'id_workspace', // replicação automática — sem checkbox
              'tipo_operacao', // sempre replica — sem checkbox
              'nome_importador', // IMP: workspace; EXP: fornecedor — sem checkbox
              'nome_exportador', // EXP: workspace; IMP: fornecedor — sem checkbox
              'numero_pedido',
              'valor_total_pedido',
              'valor_por_unidade_item',
              'valor_total_cambio_pedido',
              // moeda_cambio_pedido: AGORA replicável — mostra checkbox "Aplicar a todos os itens"
              'quantidade_total_pedido',
              'saldo_itens_do_pedido',
              'quantidade_transferida_total',
              'quantidade_volumes_pedido',
              // Logística: só no Pedido (sem coluna em PedidoItem) — checkbox engana o usuário.
              ...CAMPOS_LOGISTICA_PEDIDO,
            ])
            return !COLUNAS_SEM_REPLICACAO.has(campo)
          } : undefined}
          camposEditaveisFilhos={camposEditaveisFilhosComCustom}
          onEditarFilho={podeEditarLista ? async (id: string, campo: string, valor: unknown, opts?: { replicar_em_itens?: boolean }) => {
            const resultado = await handleEditarFilho(id, campo, valor, opts)
            for (const [pId, itensCache] of itensCarregadosRef.current) {
              if (itensCache.some(i => i.id === id)) {
                setPedidoFocoId(prev => (prev === pId ? null : prev))
                break
              }
            }
            return resultado
          } : undefined}

          onSalvoComSucesso={() => addNotification({ type: 'success', message: t('pedido.lista.notif.campo_atualizado') })}
          onErroAoSalvar={(msg) => addNotification({ type: 'error', message: mensagemErro(msg, t) })}

          arrastavelPai
          onReordenarPai={handleReordenarPedidos}
          arrastavelFilho
          onReordenarFilho={handleReordenarItens}
          filhoSequenciaKey="sequencia_item"
          onOrdemManualResetada={() => addNotification({ type: 'info', message: t('pedido.lista.notif.ordem_resetada') })}

          preferencias={preferencias}
          onSalvarPreferencias={handleSalvarPreferencias}
          colunasPadrao={COLUNAS_PADRAO_VISIVEIS}

          carregando={carregando}
          exibirCabecalhoQuandoVazio
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

          ariaLabel={t('pedido.lista.aria_lista_pedidos')}
        />
        </div>
      </div>

      {/* ── Modal Criar Novo Pedido (wizard 2 passos) ── */}
      <ModalNovoPedido
        aberto={modalNovoPedidoAberto}
        onFechar={() => setModalNovoPedidoAberto(false)}
        onSalvo={async (pedidoCriado) => {
          setModalNovoPedidoAberto(false)
          setSortCampo(SORT_LISTA_NOVOS_PEDIDO.campo)
          setSortDir(SORT_LISTA_NOVOS_PEDIDO.direcao)
          await carregarInicial(abaAtiva, SORT_LISTA_NOVOS_PEDIDO.campo, SORT_LISTA_NOVOS_PEDIDO.direcao, busca, 1)
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
        onListaAlterada={recarregarListaPosImportacao}
        onConcluido={async (idsCriados) => {
          setSmartImportAberto(false)
          await recarregarListaPosImportacao()
          // Abre o(s) pedido(s) recém-importado(s) para conferência. Se mais
          // de um, expande todos — vêm no topo (data_atualizacao_pedido desc).
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
              {t('pedido.lista.modal_transferir.titulo', { part: modalTransferir.item.part_number })}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {t('pedido.lista.modal_transferir.saldo_disponivel')}: <strong>{fmtQuantidade(modalTransferir.item.quantidade_atual_pedido, getCasas('quantidade_item', 0))}</strong>
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                {t('pedido.lista.modal_transferir.quantidade_label')}
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
              <BotaoGlobal variante="secundario" onClick={() => { setModalTransferir(null); setQtdTransferir('') }}>{t('comum.cancelar')}</BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                icone={<ArrowRight size={14} />}
                onClick={async () => {
                  const qtd = parseFloat(qtdTransferir)
                  if (!qtd || qtd <= 0 || qtd > modalTransferir.item.quantidade_atual_pedido) return
                  console.info('[Pedido] Transferir:', { item: modalTransferir.item.id, quantidade: qtd })
                  window.alert(t('pedido.lista.modal_transferir.confirmado', { qtd: fmtQuantidade(qtd, getCasas('quantidade_item', 0)) }))
                  setModalTransferir(null)
                  setQtdTransferir('')
                }}
              >
                {t('pedido.barra.transferir')}
              </BotaoGlobal>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Transferir Pedidos ── */}
      {modalTransferirAberto && (pedidosSelecionados.length > 0 || itensSelecionados.length > 0) && (
        <ModalTransferirPedido
          pedidos={(() => {
            // Regra universal: todos os pedidos envolvidos (selecionados + pais de itens selecionados)
            const idsPedidosSelecionados = new Set(pedidosSelecionados.map(p => p.id))
            const idsPedidosDeItens = new Set(itensSelecionados.map(i => i.pedido_id))
            const todosIds = new Set([...idsPedidosSelecionados, ...idsPedidosDeItens])
            const resultado = [...pedidosSelecionados]
            for (const p of pedidos) {
              if (todosIds.has(p.id) && !idsPedidosSelecionados.has(p.id)) resultado.push(p)
            }
            // Hidrata itens do cache da lista (pedido.itens vem vazio na view virtual)
            return resultado.map(p => ({
              ...p,
              itens: itensCarregadosRef.current.get(p.id) ?? p.itens ?? [],
            }))
          })()}
          itens={itensSelecionados}
          todosPedidos={pedidos}
          itensSelecionadosIds={itensSelecionados.length > 0 ? itensSelecionados.map(i => i.id) : undefined}
          onFechar={() => setModalTransferirAberto(false)}
          onConcluido={() => {
            setModalTransferirAberto(false)
            setPedidosSelecionados([])
            setItensSelecionados([])
            itensCarregadosRef.current.clear()
            setPedidos(prev => prev.map(p => ({ ...p, itens: [] })))
            setResetFilhos(prev => prev + 1)
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Edição em Massa ── */}
      {modalEdicaoMassaAberto && pedidosParaEdicaoMassa.length > 0 && (
        <ModalEdicaoMassaPedidos
          pedidos={pedidosParaEdicaoMassa}
          itensSelecionadosIds={itensSelecionadosIdsParaMassa}
          pedidoIdsCompleto={pedidoIdsCompletoParaMassa}
          onFechar={() => setModalEdicaoMassaAberto(false)}
          onConcluido={() => {
            setModalEdicaoMassaAberto(false)
            setPedidosSelecionados([])
            setItensSelecionados([])
            // Limpa cache de itens expandidos para forçar reload do backend.
            // Sem isso, useGTExpandir compara itemVersion (updated_at) do pedido,
            // que pode não mudar quando apenas itens foram editados (item_ids),
            // e mantém filhos velhos no cache.
            itensCarregadosRef.current.clear()
            // Limpa itens embutidos nos pedidos para forçar fetch via API.
            // handleCarregarFilhos tem otimização que reutiliza pedido.itens se
            // presente — sem esta limpeza, o resetCacheFilhos recarrega itens stale
            // do próprio objeto JS em vez de buscar dados frescos do servidor.
            setPedidos(prev => prev.map(p => ({ ...p, itens: [] })))
            setResetFilhos(prev => prev + 1)
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Consolidar Pedidos ── */}
      {modalConsolidarAberto && (
        <ModalConsolidarPedidos
          pedidosSelecionados={pedidosSelecionados}
          itensSelecionados={itensSelecionados}
          conflito_tipo_operacao={hasMixedTipos}
          onFechar={() => setModalConsolidarAberto(false)}
          onConcluido={async () => {
            setModalConsolidarAberto(false)
            setPedidosSelecionados([])
            setItensSelecionados([])
            itensCarregadosRef.current.clear()
            setPedidos(prev => prev.map(p => ({ ...p, itens: [] })))
            setResetFilhos(prev => prev + 1)
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
            itensCarregadosRef.current.clear()
            setPedidos(prev => prev.map(p => ({ ...p, itens: [] })))
            setResetFilhos(prev => prev + 1)
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
      {modalGerarPdfAberto && (pedidosSelecionados.length > 0 || itensSelecionados.length > 0) && (
        <ModalGerarPdfPedido
          pedidos={(() => {
            // Pedido inteiro selecionado → todos os itens; itens avulsos → agrupa por pedido pai
            const numeroPorPedido = new Map(pedidos.map(p => [p.id, p.numero_pedido]))
            const inteiros = pedidosSelecionados.map(p => ({ id: p.id, numero: p.numero_pedido }))
            const idsInteiros = new Set(pedidosSelecionados.map(p => p.id))
            const itensPorPedido = new Map<string, string[]>()
            for (const item of itensSelecionados) {
              if (idsInteiros.has(item.pedido_id)) continue // pedido inteiro prevalece
              const lista = itensPorPedido.get(item.pedido_id) ?? []
              lista.push(item.id)
              itensPorPedido.set(item.pedido_id, lista)
            }
            const parciais = Array.from(itensPorPedido.entries()).map(([idPedido, itemIds]) => ({
              id: idPedido,
              numero: numeroPorPedido.get(idPedido) ?? idPedido,
              item_ids: itemIds,
            }))
            return [...inteiros, ...parciais]
          })()}
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
                    {t('pedido.lista.cockpit.titulo')}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>{t('pedido.lista.cockpit.subtitulo')}</p>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center' }}
                onClick={() => setModalCockpitAberto(false)}
                aria-label={t('comum.fechar')}
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Endpoint */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                {t('pedido.lista.cockpit.endpoint')}
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--ws-accent)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>
                POST /api/v1/cockpit/pedidos
              </code>
            </div>

            {/* Auth */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                {t('pedido.lista.cockpit.autenticacao')}
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)', whiteSpace: 'pre' }}>
                {`Authorization: Bearer gravity_token_api_producao_...`}
              </code>
            </div>

            {/* Payload */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                {t('pedido.lista.cockpit.exemplo_payload')}
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
              {t('pedido.lista.cockpit.gerencie_tokens_prefixo')} <strong style={{ color: 'var(--ws-accent)' }}>{t('pedido.lista.cockpit.gerencie_tokens_link')}</strong>
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

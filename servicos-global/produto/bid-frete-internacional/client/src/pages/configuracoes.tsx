/**
 * Configuracoes.tsx — Configurações do BID Frete Internacional (Replica Pedido Premium)
 * Visual & Behavioral Replica — Dark Theme Slate UI
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  SquaresFour, Table, Bell, DownloadSimple,
  ArrowCounterClockwise, Eye, EyeSlash, Plus, X, DotsSixVertical,
  Package, CurrencyDollar, Scales, Warning, CheckCircle, Coins,
  ClipboardText, ArrowRight, Gauge, ArrowsLeftRight, StackSimple, Money,
  Hash, Sliders, Folder, Trash, FloppyDisk, PencilSimple, Tag,
  Columns, TextT, CalendarBlank, Percent, ListBullets, CheckSquare, MathOperations,
  Paperclip, CurrencyCircleDollar, ArrowsClockwise, Clock, CaretDown, Info, ChartBar,
} from '@phosphor-icons/react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import { useShellStore } from '@gravity/shell'
import { SwitchGlobal } from '@nucleo/switch-global'
import { PedidoSnapshotCadastros } from './configuracoes/PedidoSnapshotCadastros'
import {
  carregarTabelaConfigBidFrete,
  DEFAULT_TABELA_CONFIG_BID_FRETE,
  salvarTabelaConfigBidFrete,
  type TabelaConfigBidFrete,
} from '../shared/tabela-config-bid-frete'
import {
  carregarCasasDecimaisBidFrete,
  COLUNAS_NUMERICAS_BID_FRETE,
  GRUPOS_CASAS_DECIMAIS_BID_FRETE,
  PADRAO_CASAS_COLUNA_PERSONALIZADA,
  salvarCasasDecimaisBidFrete,
  tipoColunaUsaCasasDecimais,
} from '../shared/casas-config-bid-frete'
import {
  carregarFormatoDataBidFrete,
  FORMATOS_DATA_BID_FRETE,
  previewFormatoDataBidFrete,
  salvarFormatoDataBidFrete,
  type FormatoDataBidFrete,
} from '../shared/formato-data-bid-frete'
import {
  CARD_PERIODOS as PERIODOS,
  DEFAULT_CARD_PREFERENCIAS,
  CARDS_CATALOGO,
  registrarCardCustomizado,
  useCardPreferencesBidFrete,
  type CardDefinicao,
  type CardPeriodoCodigo,
  type CardPreferencia,
} from '../shared/use-card-preferences'
import { encodeMetricaCard } from '../shared/card-metrica-catalog-bid-frete'
import { resolverIconeCard } from '../shared/card-icone-map-bid-frete'
import { ModalNovoCardUsuario } from '../components/ModalNovoCardUsuario'
import {
  BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS,
  useDashboardTopKpiBidFrete,
  type BidFreteDashboardTopKpiWidgetId,
} from '../shared/use-dashboard-top-kpi-bid-frete'
import {
  KANBAN_BF_CARD_GRUPOS,
  KANBAN_BF_CARD_PADRAO,
  KANBAN_BF_DATAS_CRITICAS,
  normalizarCardConfigBidFrete,
  type KanbanCardConfigBidFrete,
} from '../shared/kanban-bid-frete-card'
import {
  KANBAN_BF_MODAL_CAMPOS_DISPONIVEIS,
  KANBAN_BF_MODAL_LIMITES,
  KANBAN_BF_MODAL_PADRAO,
  normalizarModalConfigBidFrete,
  clonarModalConfigBidFrete,
  type KanbanModalAbaBidFrete,
  type KanbanModalCampoDisponivelBidFrete,
  type KanbanModalConfigBidFrete,
} from '../shared/kanban-bid-frete-modal'
import { notificarKanbanConfigBidFreteAtualizado } from '../shared/use-kanban-preferences-bid-frete'
import type { EscopoCardsBidFrete } from '../shared/use-card-preferences'
import { useBidFreteConfiguracoesVisao, todasAbasConfigPermitidas } from '../shared/bid-frete-configuracoes-visao-context'
import './configuracoes.css'

// ─── Tipos e Interfaces Locais ───────────────────────────────────────────────────

interface ColunaUsuario {
  id: string
  chave: string
  nome: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade_cotacao_bid_frete_internacional: VisibilidadeColunaUsuario
  obrigatorio: boolean
  valor_padrao: string
  descricao: string
  opcoes: string[]
  formula_expressao: string
  ativo: boolean
}

type TipoColunaUsuario =
  | 'texto'
  | 'numero'
  | 'data'
  | 'percentual'
  | 'select'
  | 'checkbox'
  | 'tipo_documento'
  | 'formula'
  | 'anexo'

type EscopoColunaUsuario = 'pedido' | 'item' | 'ambos'
type VisibilidadeColunaUsuario = 'todos' | 'roles' | 'privado'

interface NotificacoesConfig {
  respostaFornecedor: boolean
  novaCotacao: boolean
  cotacaoExpirada: boolean
  cotacaoAprovada: boolean
  erroIntegracao: boolean
}

interface ExportacaoConfig {
  formatoPadrao: 'csv' | 'xlsx' | 'pdf'
  incluirPropostas: boolean
  apenasAprovada: boolean
  separadorCsv: 'virgula' | 'ponto-virgula' | 'tab'
}

interface NumeracaoConfig {
  prefixo: string
  incluirAno: boolean
  digitosSequencia: number
  reiniciar: 'nunca' | 'ano' | 'mes'
  automaticoCriar: boolean
}

interface RegrasConfig {
  respostaAutomatica: boolean
  prazoPadraoHoras: number
  alertasDivergencia: boolean
  aprovarAbaixoDoTeto: boolean
}

interface TemplateLocal {
  id: string
  nome: string
  documento_tipo: string
  codigo_fonte: string
  created_at: string
}

interface CategoriaAnexo {
  id: string
  nome: string
  sistema: boolean
}

interface NovaColuna {
  nome: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade_cotacao_bid_frete_internacional: VisibilidadeColunaUsuario
  obrigatorio: boolean
  valor_padrao: string
  descricao: string
  opcoes: string[]
  formula_expressao: string
}

type SaldoToken =
  | { tipo: 'campo'; chave: string; label: string }
  | { tipo: 'op'; valor: string }

// ─── Constants & Catalogs ────────────────────────────────────────────────────────

const BID_FRETE_DASHBOARD_TOP_KPI_PREVIEW_VISUAL: Record<BidFreteDashboardTopKpiWidgetId, { icone: React.ReactNode; cor: string }> = {
  kpi_cotacoes_andamento: { icone: <ClipboardText     weight="duotone" size={15} />, cor: '#fbbf24' },
  kpi_cotacoes_aprovadas: { icone: <CheckCircle       weight="duotone" size={15} />, cor: '#10b981' },
  kpi_valor_em_aberto:    { icone: <CurrencyDollar    weight="duotone" size={15} />, cor: '#818cf8' },
  kpi_cotacoes_expiradas: { icone: <Warning           weight="duotone" size={15} />, cor: '#d1d5db' },
}

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total_cotacoes:        { icone: <Package           weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  valor_total_frete:     { icone: <CurrencyDollar    weight="duotone" size={18} />, cor: '#34d399' },
  propostas_recebidas:   { icone: <ClipboardText     weight="duotone" size={18} />, cor: '#60a5fa' },
  saving_total:          { icone: <Coins             weight="duotone" size={18} />, cor: '#fb923c' },
  tempo_medio_resposta:  { icone: <Gauge             weight="duotone" size={18} />, cor: '#a78bfa' },
  cotacoes_expiradas:    { icone: <Warning           weight="duotone" size={18} />, cor: '#f87171' },
  cotacoes_em_atraso:    { icone: <Clock             weight="duotone" size={18} />, cor: '#fb923c' },
  cotacoes_acima_meta:   { icone: <Gauge             weight="duotone" size={18} />, cor: '#f87171' },
}

const NOME_EXIBICAO_CARDS: Record<string, string> = {
  total_cotacoes: 'Total de Cotações',
  valor_total_frete: 'Valor Total de Frete',
  propostas_recebidas: 'Propostas Recebidas',
  saving_total: 'Saving Total',
  tempo_medio_resposta: 'Tempo Médio de Resposta',
  cotacoes_expiradas: 'Cotações Expiradas',
  cotacoes_em_atraso: 'Cotações em Atraso',
  cotacoes_acima_meta: 'Quantidade cotações acima da meta',
}

function obterNomeExibicaoCard(card: CardDefinicao): string {
  return NOME_EXIBICAO_CARDS[card.id] || card.labelKey
}

function resolverVisualCard(def: CardDefinicao): { icone: React.ReactNode; cor: string } {
  const nativo = CARD_VISUAL[def.id]
  if (nativo) return nativo
  return {
    icone: resolverIconeCard(def.icone, 18, def.cor),
    cor: def.cor ?? 'var(--ws-accent, #818cf8)',
  }
}

const SIDEBAR_ITEMS = [
  { tipo: 'grupo',  label: 'VISUALIZAÇÕES', labelKey: 'bidfrete.config.sidebar.grupo_visualizacoes' },
  { tipo: 'item',   id: 'cards',                 label: 'Cards',             labelKey: 'bidfrete.config.sidebar.cards',             icone: <SquaresFour size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'dashboard-kpi',         label: 'Visão Geral',       labelKey: 'bidfrete.config.sidebar.dashboard_kpi',     icone: <ChartBar size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'tabela',                label: 'Tabela',            labelKey: 'bidfrete.config.sidebar.tabela',            icone: <Table size={15} weight="duotone" />, ativo: true },
  { tipo: 'parent', id: 'colunas-casas-decimais',label: 'Colunas',           labelKey: 'bidfrete.config.sidebar.colunas',           icone: <Columns size={15} weight="duotone" />, ativo: true, filhos: ['colunas-casas-decimais', 'colunas-formato-data', 'colunas-personalizadas', 'colunas-campos-calculados'] },
  { tipo: 'sub',    id: 'colunas-casas-decimais',label: 'Casas Decimais',    labelKey: 'bidfrete.config.sidebar.casas_decimais',    icone: <Hash size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-formato-data',  label: 'Formato de Data',   labelKey: 'bidfrete.config.sidebar.formato_data',      icone: <CalendarBlank size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-personalizadas',label: 'Personalizadas',    labelKey: 'bidfrete.config.sidebar.personalizadas',    icone: <Columns size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-campos-calculados', label: 'Campos Calculados', labelKey: 'bidfrete.config.sidebar.campos_calculados', icone: <MathOperations size={15} weight="duotone" />, ativo: true },
  { tipo: 'parent', id: 'kanban',                label: 'Kanban',            labelKey: 'bidfrete.config.sidebar.kanban',            icone: <Columns size={15} weight="duotone" />, ativo: true, filhos: ['kanban-colunas', 'kanban-card', 'kanban-modal'] },
  { tipo: 'sub',    id: 'kanban-colunas',        label: 'Colunas',           labelKey: 'bidfrete.config.sidebar.kanban_colunas',    icone: <Sliders size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'kanban-card',           label: 'Card',              labelKey: 'bidfrete.config.sidebar.card',              icone: <SquaresFour size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'kanban-modal',          label: 'Modal',             labelKey: 'bidfrete.config.sidebar.modal',             icone: <Columns size={15} weight="duotone" />, ativo: true },
  
  { tipo: 'grupo',  label: 'BID FRETE INTERNACIONAL', labelKey: 'bidfrete.config.sidebar.grupo_bidfrete' },
  { tipo: 'item',   id: 'status',                label: 'Status Cotação',    labelKey: 'bidfrete.config.sidebar.status',            icone: <Tag size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'status-bid-frete-internacional', label: 'Status BID', labelKey: 'bidfrete.config.sidebar.status_bid', icone: <Tag size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'numeracao',             label: 'Numeração',         labelKey: 'bidfrete.config.sidebar.numeracao',         icone: <Hash size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'templates-pdf',         label: 'Templates PDF',     labelKey: 'bidfrete.config.sidebar.templates_pdf',     icone: <FloppyDisk size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'regras',                label: 'Regras',            labelKey: 'bidfrete.config.sidebar.regras',            icone: <Sliders size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'categorias-anexos',     label: 'Categ. Anexos',     labelKey: 'bidfrete.config.sidebar.categ_anexos',      icone: <Folder size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'taxa-cambio',           label: 'Taxa de Câmbio',    labelKey: 'bidfrete.config.sidebar.taxa_cambio',       icone: <CurrencyCircleDollar size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'snapshot-cadastros',    label: 'Cadastros',         labelKey: 'bidfrete.config.sidebar.snapshot_cadastros',icone: <ArrowsClockwise size={15} weight="duotone" />, ativo: true },
  
  { tipo: 'grupo',  label: 'SISTEMA',            labelKey: 'bidfrete.config.sidebar.grupo_sistema' },
  { tipo: 'item',   id: 'notificacoes',          label: 'Notificações',      labelKey: 'bidfrete.config.sidebar.notificacoes',      icone: <Bell size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'exportacao',            label: 'Exportação',        labelKey: 'bidfrete.config.sidebar.exportacao',        icone: <DownloadSimple size={15} weight="duotone" />, ativo: true },
]

const COLUNAS_FILHOS = [
  'colunas-casas-decimais',
  'colunas-formato-data',
  'colunas-personalizadas',
  'colunas-campos-calculados',
] as const

const TIPOS_COLUNA = [
  { id: 'texto',          label: 'Texto',         icone: <TextT size={16} weight="duotone" /> },
  { id: 'numero',         label: 'Numérico',      icone: <Hash size={16} weight="duotone" /> },
  { id: 'data',           label: 'Data',          icone: <CalendarBlank size={16} weight="duotone" /> },
  { id: 'percentual',     label: 'Percentual %',  icone: <Percent size={16} weight="duotone" /> },
  { id: 'select',         label: 'Select/Lista',  icone: <ListBullets size={16} weight="duotone" /> },
  { id: 'checkbox',       label: 'Checkbox',      icone: <CheckSquare size={16} weight="duotone" /> },
  { id: 'tipo_documento', label: 'Tipo Documento',icone: <Tag size={16} weight="duotone" /> },
  { id: 'formula',        label: 'Fórmula',       icone: <MathOperations size={16} weight="duotone" /> },
  { id: 'anexo',          label: 'Anexo',         icone: <Paperclip size={16} weight="duotone" /> },
]

const FORMULA_FIELDS = [
  { chave: 'valor_frete_proposta_bid_frete_internacional', label: 'Valor do Frete' },
  { chave: 'taxas_origem_proposta_bid_frete_internacional', label: 'Taxas Origem' },
  { chave: 'taxas_destino_proposta_bid_frete_internacional', label: 'Taxas Destino' },
]

// ─── Sub-Components (Sortable and Helpers) ───────────────────────────────────────

function CardSortavel({
  pref, def, onToggle, onRemover, periodoAtivo,
}: {
  pref: CardPreferencia
  def: CardDefinicao
  onToggle: () => void
  onRemover: () => void
  periodoAtivo: string
}) {
  const visual = resolverVisualCard(def)
  const [detalheAberto, setDetalheAberto] = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: pref.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const periodoLabel = PERIODOS.find(p => p.id === periodoAtivo)?.label ?? periodoAtivo
  const subtitulo = `${def.tipoAgg} · ${def.origem} · ${periodoLabel}`

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}${detalheAberto ? ' cfg-card-row--detalhe' : ''}`}>
        <button
          type="button"
          className="cfg-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <div className="cfg-card-row__info">
          <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
            {visual.icone}
          </span>
          <div>
            <p className="cfg-card-row__nome">{obterNomeExibicaoCard(def)}</p>
            <p className="cfg-card-row__desc">{subtitulo}</p>
          </div>
        </div>

        <span className="cfg-origem-badge cfg-origem-badge--meus">{def.origem}</span>

        <TooltipGlobal descricao="Ver detalhes do card">
          <button
            type="button"
            className={`cfg-eye-btn${detalheAberto ? ' cfg-eye-btn--on' : ''}`}
            onClick={() => setDetalheAberto(v => !v)}
            aria-label="Ver detalhes do card"
          >
            <Info size={15} weight="bold" />
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao={pref.visible ? 'Ocultar card' : 'Exibir card'}>
          <button
            type="button"
            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
            onClick={onToggle}
            aria-label={pref.visible ? 'Ocultar' : 'Exibir'}
          >
            {pref.visible ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao="Remover card">
          <button
            type="button"
            className="cfg-remove-btn"
            onClick={onRemover}
            aria-label="Remover card"
          >
            <X size={13} weight="bold" />
          </button>
        </TooltipGlobal>
      </div>

      {detalheAberto && (
        <div className="cfg-card-detail-panel">
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Campo base</span>
            <span className="cfg-card-detail-panel__value">{def.campoBase}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Agregação</span>
            <span className="cfg-card-detail-panel__value">{def.tipoAgg}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Origem</span>
            <span className="cfg-card-detail-panel__value">{def.origem}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Período</span>
            <span className="cfg-card-detail-panel__value">{periodoLabel}</span>
          </div>
          <div className="cfg-card-detail-panel__row cfg-card-detail-panel__row--full">
            <span className="cfg-card-detail-panel__label">Descrição</span>
            <span className="cfg-card-detail-panel__value">{def.descricao}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function CardDisponivel({
  def, onAdicionar, periodoAtivo,
}: {
  def: CardDefinicao
  onAdicionar: () => void
  periodoAtivo: string
}) {
  const visual = CARD_VISUAL[def.id]
  const [detalheAberto, setDetalheAberto] = useState(false)
  const periodoLabel = PERIODOS.find(p => p.id === periodoAtivo)?.label ?? periodoAtivo

  return (
    <div>
      <div className={`cfg-card-row cfg-card-row--disponivel${detalheAberto ? ' cfg-card-row--detalhe' : ''}`}>
        <span className="cfg-drag-handle cfg-drag-handle--ghost">
          <DotsSixVertical size={16} weight="bold" />
        </span>
        <div className="cfg-card-row__info">
          <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
            {visual.icone}
          </span>
          <div>
            <p className="cfg-card-row__nome">{obterNomeExibicaoCard(def)}</p>
            <p className="cfg-card-row__desc">{def.descricao}</p>
          </div>
        </div>
        <span className="cfg-origem-badge cfg-origem-badge--pedido">{def.origem}</span>
        <span className="cfg-agg-badge">{def.tipoAgg}</span>
        <TooltipGlobal descricao="Ver detalhes do card">
          <button
            type="button"
            className={`cfg-eye-btn${detalheAberto ? ' cfg-eye-btn--on' : ''}`}
            onClick={() => setDetalheAberto(v => !v)}
            aria-label="Ver detalhes do card"
          >
            <Info size={15} weight="bold" />
          </button>
        </TooltipGlobal>
        <TooltipGlobal descricao="Adicionar aos meus cards">
          <button
            type="button"
            className="cfg-add-btn"
            onClick={onAdicionar}
            aria-label="Adicionar card"
          >
            <Plus size={13} weight="bold" />
          </button>
        </TooltipGlobal>
      </div>

      {detalheAberto && (
        <div className="cfg-card-detail-panel">
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Campo base</span>
            <span className="cfg-card-detail-panel__value">{def.campoBase}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Agregação</span>
            <span className="cfg-card-detail-panel__value">{def.tipoAgg}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Origem</span>
            <span className="cfg-card-detail-panel__value">{def.origem}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">Período</span>
            <span className="cfg-card-detail-panel__value">{periodoLabel}</span>
          </div>
          <div className="cfg-card-detail-panel__row cfg-card-detail-panel__row--full">
            <span className="cfg-card-detail-panel__label">Descrição</span>
            <span className="cfg-card-detail-panel__value">{def.descricao}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ColunaSortavel({
  col, onToggleAtivo, onRemover, onEditar, editando,
}: {
  col: ColunaUsuario
  onToggleAtivo: () => void
  onRemover: () => void
  onEditar: () => void
  editando: boolean
}) {
  const tipoInfo = TIPOS_COLUNA.find(t => t.id === col.tipo)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: col.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className={`cfg-kanban-campo-row${!col.ativo ? ' cfg-kanban-campo-row--oculto' : ''}${editando ? ' cfg-kanban-campo-row--editando' : ''}`}>
      <button type="button" className="cfg-drag-handle" {...attributes} {...listeners} aria-label="Arrastar para reordenar">
        <DotsSixVertical size={15} weight="bold" />
      </button>
      <div className="cfg-kanban-campo-row__info">
        <span className="cfg-kanban-campo-row__nome">{col.nome}</span>
        <span className="cfg-kanban-campo-row__tipo">{tipoInfo?.label ?? col.tipo}</span>
      </div>
      <TooltipGlobal descricao="Editar propriedades">
        <button type="button" className={`cfg-kanban-campo-btn${editando ? ' cfg-kanban-campo-btn--ativo' : ''}`} onClick={onEditar} aria-label={`Editar ${col.nome}`}>
          <PencilSimple size={14} weight="duotone" />
        </button>
      </TooltipGlobal>
      <TooltipGlobal descricao={col.ativo ? 'Ocultar coluna' : 'Exibir coluna'}>
        <button type="button" className="cfg-kanban-campo-btn" onClick={onToggleAtivo} aria-label={col.ativo ? 'Ocultar' : 'Exibir'}>
          {col.ativo ? <Eye size={14} weight="duotone" /> : <EyeSlash size={14} weight="duotone" />}
        </button>
      </TooltipGlobal>
      <TooltipGlobal descricao="Excluir coluna">
        <button type="button" className="cfg-kanban-campo-btn cfg-kanban-campo-btn--remove" onClick={onRemover} aria-label={`Excluir ${col.nome}`}>
          <X size={13} weight="bold" />
        </button>
      </TooltipGlobal>
    </div>
  )
}

interface PedidoStatusConfig {
  id: string
  nome: string
  rotulo: string
  cor: string
  ordem: number
  is_sistema: boolean
}

function StatusSortavel({
  status,
  editandoId,
  editLabel,
  editCor,
  onIniciarEdicao,
  onSalvarEdicao,
  onCancelarEdicao,
  onChangeLabel,
  onChangeCor,
  onExcluir,
}: {
  status: PedidoStatusConfig
  editandoId: string | null
  editLabel: string
  editCor: string
  onIniciarEdicao: (s: PedidoStatusConfig) => void
  onSalvarEdicao: () => void
  onCancelarEdicao: () => void
  onChangeLabel: (v: string) => void
  onChangeCor: (v: string) => void
  onExcluir: (id: string) => void
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: status.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const isEditando = editandoId === status.id

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`cfg-status-row${isEditando ? ' cfg-status-row--editando' : ''}`}>
        <button
          type="button"
          className="cfg-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Arrastar"
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <span
          className="cfg-status-dot"
          style={{ background: status.cor }}
        />

        <span className="cfg-status-label">{status.rotulo}</span>

        <div className="cfg-status-acoes">
          <TooltipGlobal descricao="Editar">
            <button
              type="button"
              className="cfg-eye-btn"
              onClick={() => onIniciarEdicao(status)}
              aria-label="Editar"
            >
              <PencilSimple size={14} weight="bold" />
            </button>
          </TooltipGlobal>
          <TooltipGlobal descricao="Excluir">
            <button
              type="button"
              className="cfg-remove-btn"
              onClick={() => onExcluir(status.id)}
              aria-label="Excluir"
            >
              <Trash size={14} weight="bold" />
            </button>
          </TooltipGlobal>
        </div>
      </div>

      {isEditando && (
        <div className="cfg-status-edit-panel">
          <div className="cfg-status-edit-fields">
            <input
              type="text"
              className="cfg-input cfg-input--grow"
              placeholder="Nome do status"
              value={editLabel}
              onChange={e => onChangeLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSalvarEdicao() }}
              autoFocus
            />
            <div className="cfg-status-color-picker">
              <span className="cfg-status-color-label">Cor</span>
              <input
                type="color"
                className="cfg-status-color-input"
                value={editCor}
                onChange={e => onChangeCor(e.target.value)}
              />
              <span className="cfg-status-color-preview" style={{ background: editCor }} />
            </div>
          </div>
          <div className="cfg-tpl-form__actions">
            <button type="button" className="cfg-btn-primario cfg-btn-primario--xs" onClick={onSalvarEdicao}>
              <FloppyDisk size={13} weight="bold" />
              Salvar
            </button>
            <button type="button" className="cfg-btn-secundario cfg-btn-secundario--xs" onClick={onCancelarEdicao}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <label className="cfg-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="cfg-toggle__input"
      />
      <span className="cfg-toggle__track" />
    </label>
  )
}

function ToggleRow({ label, desc, checked, onChange, id }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <div className="cfg-toggle-row">
      <div className="cfg-toggle-row__text">
        <label className="cfg-toggle-row__label" htmlFor={id}>{label}</label>
        {desc && <p className="cfg-toggle-row__desc">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} id={id} />
    </div>
  )
}

// ─── Modal Nova Coluna ──────────────────────────────────────────────────────────

function ModalNovaColunaUsuario({
  onFechar, onSalvo
}: {
  onFechar: () => void
  onSalvo: (col: { nome: string; tipo: TipoColunaUsuario; escopo: EscopoColunaUsuario; visibilidade_cotacao_bid_frete_internacional: VisibilidadeColunaUsuario }) => void
}) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoColunaUsuario>('texto')

  const handleSalvar = () => {
    if (!nome.trim()) return
    onSalvo({ nome, tipo, escopo: 'ambos', visibilidade_cotacao_bid_frete_internacional: 'todos' })
  }

  return (
    <div className="mcu-overlay" onClick={onFechar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="mcu-modal" onClick={e => e.stopPropagation()} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: '420px' }}>
        <h3 className="mcu-header__titulo" style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>Nova Coluna Personalizada</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            Nome da Coluna
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            Tipo de Dado
            <select value={tipo} onChange={e => setTipo(e.target.value as TipoColunaUsuario)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }}>
              {TIPOS_COLUNA.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button type="button" onClick={onFechar} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#f1f5f9', cursor: 'pointer' }}>Cancelar</button>
            <button type="button" onClick={handleSalvar} style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: '#818cf8', color: '#fff', cursor: 'pointer' }}>Criar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────────

export default function Configuracoes() {
  const { t } = useTranslation()
  const addNotification = useShellStore(s => s.addNotification)
  const [searchParams] = useSearchParams()
  const cfgVisao = useBidFreteConfiguracoesVisao()
  const escopoCards: EscopoCardsBidFrete = cfgVisao.modo === 'fornecedor' ? 'fornecedor' : 'operacional'

  const tabParam = searchParams.get('tab') as string | null
  const categoriaInicial = useMemo(() => {
    const candidato = tabParam ?? 'cards'
    if (todasAbasConfigPermitidas(cfgVisao)) return candidato
    return cfgVisao.sidebarIdsPermitidos.has(candidato) ? candidato : 'cards'
  }, [tabParam, cfgVisao])
  const [categoria, setCategoria] = useState<string>(categoriaInicial)

  const sidebarItems = useMemo(() => {
    if (todasAbasConfigPermitidas(cfgVisao)) return SIDEBAR_ITEMS
    return SIDEBAR_ITEMS.filter(item => {
      if (item.tipo === 'grupo') return true
      const id = item.id ?? ''
      return cfgVisao.sidebarIdsPermitidos.has(id)
    })
  }, [cfgVisao])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'colunas-casas-decimais': COLUNAS_FILHOS.includes(tabParam as typeof COLUNAS_FILHOS[number]),
    'kanban': ['kanban-colunas', 'kanban-card', 'kanban-modal'].includes(tabParam ?? ''),
  })

  // ─── Mocks & Persistence Hook ─────────────────────────────────────────────────

  const useConfigState = <T,>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>, T, () => void, () => void, boolean] => {
    const storageKey = `${cfgVisao.storagePrefix}:${key}`
    const [savedState, setSavedState] = useState<T>(() => {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) return JSON.parse(raw) as T
      } catch { /* ignored */ }
      return initial
    })
    const [currentState, setCurrentState] = useState<T>(savedState)

    const isDirty = JSON.stringify(currentState) !== JSON.stringify(savedState)

    const save = () => {
      localStorage.setItem(storageKey, JSON.stringify(currentState))
      setSavedState(currentState)
      addNotification({ type: 'success', message: 'Configurações salvas com sucesso!' })
    }

    const reset = () => {
      setCurrentState(savedState)
    }

    return [currentState, setCurrentState, savedState, save, reset, isDirty]
  }

  // ─── States declarations ──────────────────────────────────────────────────────

  const {
    prefs: cardsSalvos,
    catalogo: cardsCatalogo,
    periodo: periodoSalvo,
    persistir: persistirCards,
    setPeriodo: persistirPeriodoCards,
  } = useCardPreferencesBidFrete(escopoCards)

  const [pendingCardsPrefs, setPendingCardsPrefs] = useState<CardPreferencia[]>(cardsSalvos)
  const [pendingPeriodoCards, setPendingPeriodoCards] = useState<CardPeriodoCodigo>(periodoSalvo)
  const [cardsPrefsBaseline, setCardsPrefsBaseline] = useState<CardPreferencia[]>(cardsSalvos)
  const [periodoCardsBaseline, setPeriodoCardsBaseline] = useState<CardPeriodoCodigo>(periodoSalvo)

  useEffect(() => {
    setPendingCardsPrefs(cardsSalvos)
    setCardsPrefsBaseline(cardsSalvos)
    setPendingPeriodoCards(periodoSalvo)
    setPeriodoCardsBaseline(periodoSalvo)
  }, [cardsSalvos, periodoSalvo])

  const cardsConfigDirty =
    JSON.stringify(pendingCardsPrefs) !== JSON.stringify(cardsPrefsBaseline)
    || pendingPeriodoCards !== periodoCardsBaseline

  const cardsDisponiveis = useMemo(
    () => cardsCatalogo.filter(c => !pendingCardsPrefs.some(p => p.id === c.id)),
    [cardsCatalogo, pendingCardsPrefs],
  )

  const salvarCardsConfig = useCallback(() => {
    persistirCards(pendingCardsPrefs)
    persistirPeriodoCards(pendingPeriodoCards)
    setCardsPrefsBaseline(pendingCardsPrefs)
    setPeriodoCardsBaseline(pendingPeriodoCards)
    addNotification({ type: 'success', message: t('bidfrete.config.cards.msg_salvo') })
  }, [pendingCardsPrefs, pendingPeriodoCards, persistirCards, persistirPeriodoCards, addNotification, t])

  const restaurarCardsPadrao = useCallback(() => {
    setPendingCardsPrefs([...DEFAULT_CARD_PREFERENCIAS])
    setPendingPeriodoCards('30d')
  }, [])

  const {
    mapa: dashboardTopKpiSalvo,
    persistirMapa: persistirDashboardTopKpi,
    defaults: dashboardTopKpiDefaults,
  } = useDashboardTopKpiBidFrete()
  const [pendingDashboardTopKpi, setPendingDashboardTopKpi] = useState(dashboardTopKpiSalvo)

  useEffect(() => {
    setPendingDashboardTopKpi(dashboardTopKpiSalvo)
  }, [dashboardTopKpiSalvo])

  const dashboardKpiDirty = JSON.stringify(pendingDashboardTopKpi) !== JSON.stringify(dashboardTopKpiSalvo)

  const salvarDashboardTopKpiConfig = useCallback(() => {
    persistirDashboardTopKpi(pendingDashboardTopKpi)
    addNotification({ type: 'success', message: t('bidfrete.config.dashboard_kpi.msg_salvo') })
  }, [pendingDashboardTopKpi, persistirDashboardTopKpi, addNotification, t])

  const restaurarDashboardTopKpiPadrao = useCallback(() => {
    setPendingDashboardTopKpi({ ...dashboardTopKpiDefaults })
  }, [dashboardTopKpiDefaults])

  const [tabelaConfig, setTabelaConfig] = useState<TabelaConfigBidFrete>(() => carregarTabelaConfigBidFrete())
  const [tabelaConfigSalva, setTabelaConfigSalva] = useState<TabelaConfigBidFrete>(() => carregarTabelaConfigBidFrete())
  const tabelaDirty = JSON.stringify(tabelaConfig) !== JSON.stringify(tabelaConfigSalva)

  const salvarTabelaConfig = useCallback(() => {
    salvarTabelaConfigBidFrete(tabelaConfig)
    setTabelaConfigSalva(tabelaConfig)
    addNotification({ type: 'success', message: 'Preferências da tabela salvas com sucesso!' })
  }, [tabelaConfig, addNotification])

  const restaurarTabelaConfig = useCallback(() => {
    setTabelaConfig({ ...DEFAULT_TABELA_CONFIG_BID_FRETE })
  }, [])

  const [colunasPersonalizadas, setColunasPersonalizadas] = useConfigState<ColunaUsuario[]>('colunas-personalizadas', [
    { id: 'col_margem', chave: 'margem', nome: 'Margem Comercial', tipo: 'numero', escopo: 'pedido', visibilidade_cotacao_bid_frete_internacional: 'todos', obrigatorio: false, valor_padrao: '', descricao: 'Margem do frete', opcoes: [], formula_expressao: '', ativo: true }
  ])

  const [casasDecimaisSalvas, setCasasDecimaisSalvas] = useState<Record<string, number>>(() => carregarCasasDecimaisBidFrete())
  const [pendingCasas, setPendingCasas] = useState<Record<string, number>>(() => carregarCasasDecimaisBidFrete())
  const casasDirty = JSON.stringify(pendingCasas) !== JSON.stringify(casasDecimaisSalvas)

  const colunasNumericasPersonalizadas = useMemo(
    () => colunasPersonalizadas.filter(col => tipoColunaUsaCasasDecimais(col.tipo)),
    [colunasPersonalizadas],
  )

  useEffect(() => {
    setPendingCasas(prev => {
      let next: Record<string, number> | null = null
      for (const col of colunasNumericasPersonalizadas) {
        if (prev[col.id] === undefined) {
          if (!next) next = { ...prev }
          next[col.id] = PADRAO_CASAS_COLUNA_PERSONALIZADA
        }
      }
      return next ?? prev
    })
  }, [colunasNumericasPersonalizadas])

  const handleCasasDecimaisChange = useCallback((campo: string, valor: number) => {
    setPendingCasas(prev => ({ ...prev, [campo]: valor }))
  }, [])

  const salvarCasasDecimaisConfig = useCallback(() => {
    const payload: Record<string, number> = {}
    for (const col of COLUNAS_NUMERICAS_BID_FRETE) {
      payload[col.campo] = pendingCasas[col.campo] ?? col.padrao
    }
    for (const col of colunasNumericasPersonalizadas) {
      payload[col.id] = pendingCasas[col.id] ?? PADRAO_CASAS_COLUNA_PERSONALIZADA
    }
    salvarCasasDecimaisBidFrete(payload)
    setCasasDecimaisSalvas(payload)
    setPendingCasas(payload)
    addNotification({ type: 'success', message: 'Casas decimais salvas com sucesso!' })
  }, [pendingCasas, colunasNumericasPersonalizadas, addNotification])

  const restaurarCasasDecimaisConfig = useCallback(() => {
    setPendingCasas(casasDecimaisSalvas)
  }, [casasDecimaisSalvas])

  const [formatoDataSalvo, setFormatoDataSalvo] = useState<FormatoDataBidFrete>(() => carregarFormatoDataBidFrete())
  const [pendingFormato, setPendingFormato] = useState<FormatoDataBidFrete>(() => carregarFormatoDataBidFrete())
  const formatoDirty = pendingFormato !== formatoDataSalvo

  const salvarFormatoDataConfig = useCallback(() => {
    salvarFormatoDataBidFrete(pendingFormato)
    setFormatoDataSalvo(pendingFormato)
    addNotification({ type: 'success', message: 'Formato de data salvo com sucesso!' })
  }, [pendingFormato, addNotification])

  const restaurarFormatoDataConfig = useCallback(() => {
    setPendingFormato(formatoDataSalvo)
  }, [formatoDataSalvo])

  const [saldoTokens, setSaldoTokens] = useConfigState<SaldoToken[]>('campos-calculados', [
    { tipo: 'campo', chave: 'valor_frete_proposta_bid_frete_internacional', label: 'Valor do Frete' },
    { tipo: 'op', valor: '+' },
    { tipo: 'campo', chave: 'taxas_origem_proposta_bid_frete_internacional', label: 'Taxas Origem' }
  ])

  const [
    statusList,
    setStatusList,
    ,
    salvarStatusConfig,
    restaurarStatusConfig,
    statusConfigDirty,
  ] = useConfigState<PedidoStatusConfig[]>('status', [
    { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: false },
    { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: false },
    { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: false },
    { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: false },
    { id: 'aprovada', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#10b981', ordem: 5, is_sistema: false },
    { id: 'reprovada', nome: 'REPROVADA', rotulo: 'Reprovada', cor: '#ef4444', ordem: 6, is_sistema: false },
    { id: 'cancelada', nome: 'CANCELADA', rotulo: 'Cancelada', cor: '#6b7280', ordem: 7, is_sistema: false },
    { id: 'falta_informacao', nome: 'FALTA_INFORMACAO', rotulo: 'Falta de informação', cor: '#fb7185', ordem: 8, is_sistema: false },
    { id: 'expirada', nome: 'EXPIRADA', rotulo: 'Expirada', cor: '#d1d5db', ordem: 9, is_sistema: false }
  ])

  // Migração automática de status antigos (caso possua apenas os 4 status iniciais)
  useEffect(() => {
    if (statusList.length < 9) {
      const canonicals: PedidoStatusConfig[] = [
        { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: false },
        { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: false },
        { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: false },
        { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: false },
        { id: 'aprovada', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#10b981', ordem: 5, is_sistema: false },
        { id: 'reprovada', nome: 'REPROVADA', rotulo: 'Reprovada', cor: '#ef4444', ordem: 6, is_sistema: false },
        { id: 'cancelada', nome: 'CANCELADA', rotulo: 'Cancelada', cor: '#6b7280', ordem: 7, is_sistema: false },
        { id: 'falta_informacao', nome: 'FALTA_INFORMACAO', rotulo: 'Falta de informação', cor: '#fb7185', ordem: 8, is_sistema: false },
        { id: 'expirada', nome: 'EXPIRADA', rotulo: 'Expirada', cor: '#d1d5db', ordem: 9, is_sistema: false }
      ]
      setStatusList(canonicals)
      localStorage.setItem('bid-frete:config:status', JSON.stringify(canonicals))
    }
  }, [statusList, setStatusList])

  useEffect(() => {
    setStatusList(prev => {
      if (!prev.some(s => s.is_sistema)) return prev
      return prev.map(s => ({ ...s, is_sistema: false }))
    })
  }, [setStatusList])

  const [statusBidList, setStatusBidList] = useConfigState<PedidoStatusConfig[]>('status-bid-frete-internacional', [
    { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: true },
    { id: 'em_andamento', nome: 'EM_ANDAMENTO', rotulo: 'Em andamento', cor: '#60a5fa', ordem: 2, is_sistema: true },
    { id: 'parcial', nome: 'PARCIALMENTE_CONCLUIDO', rotulo: 'Parcialmente concluído', cor: '#fbbf24', ordem: 3, is_sistema: false },
    { id: 'concluido', nome: 'CONCLUIDO', rotulo: 'Concluído', cor: '#10b981', ordem: 4, is_sistema: false },
    { id: 'cancelado', nome: 'CANCELADO', rotulo: 'Cancelado', cor: '#6b7280', ordem: 5, is_sistema: true },
  ])

  const [numeracaoConfig, setNumeracaoConfig] = useConfigState<NumeracaoConfig>('numeracao', {
    prefixo: 'BID-',
    incluirAno: true,
    digitosSequencia: 5,
    reiniciar: 'ano',
    automaticoCriar: true,
  })

  const [templatesPdf, setTemplatesPdf] = useConfigState<TemplateLocal[]>('templates-pdf', [
    { id: 'tpl_resumo', nome: 'Resumo do Bid de Frete', documento_tipo: 'pdf', codigo_fonte: '<h1>Bid de Frete {{numero_cotacao_bid_frete_internacional}}</h1>', created_at: new Date().toISOString() }
  ])

  const [regrasConfig, setRegrasConfig] = useConfigState<RegrasConfig>('regras', {
    respostaAutomatica: true,
    prazoPadraoHoras: 72,
    alertasDivergencia: true,
    aprovarAbaixoDoTeto: false,
  })

  const [categoriasAnexos, setCategoriasAnexos] = useConfigState<CategoriaAnexo[]>('categorias-anexos', [
    { id: 'bl', nome: 'Bill of Lading (B/L)', sistema: true },
    { id: 'proposta', nome: 'Proposta do Fornecedor', sistema: false }
  ])

  const [taxasCambio, setTaxasCambio] = useConfigState<Record<string, number>>('taxa-cambio', {
    USD: 5.25,
    EUR: 5.65,
  })

  const [notificacoesConfig, setNotificacoesConfig] = useConfigState<NotificacoesConfig>('notificacoes', {
    respostaFornecedor: true,
    novaCotacao: true,
    cotacaoExpirada: false,
    cotacaoAprovada: true,
    erroIntegracao: true,
  })

  const [exportConfig, setExportConfig] = useConfigState<ExportacaoConfig>('exportacao', {
    formatoPadrao: 'xlsx',
    incluirPropostas: true,
    apenasAprovada: false,
    separadorCsv: 'ponto-virgula',
  })

  // ─── Kanban Specific States ──────────────────────────────────────────────────

  const [kanbanColunasOcultas, setKanbanColunasOcultas] = useConfigState<string[]>('kanban-colunas-ocultas', [])
  const [
    kanbanCardConfig,
    setKanbanCardConfig,
    ,
    salvarKanbanCardConfig,
    ,
    kanbanCardDirty,
  ] = useConfigState<KanbanCardConfigBidFrete>(
    'kanban-card-config',
    KANBAN_BF_CARD_PADRAO,
  )

  useEffect(() => {
    const norm = normalizarCardConfigBidFrete(kanbanCardConfig)
    if (JSON.stringify(norm) !== JSON.stringify(kanbanCardConfig)) {
      setKanbanCardConfig(norm)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- migração legado uma vez no mount

  // ─── Active Sub-Tab/Group Controls ────────────────────────────────────────────

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ─── Modal State Variables ────────────────────────────────────────────────────

  const [criandoCard, setCriandoCard] = useState(false)
  const [criandoColuna, setCriandoColuna] = useState(false)
  const [editandoColunaId, setEditandoColunaId] = useState<string | null>(null)
  
  // Status editing substate
  const [editandoStatusId, setEditandoStatusId] = useState<string | null>(null)
  const [editStatusLabel, setEditStatusLabel] = useState('')
  const [editStatusCor, setEditStatusCor] = useState('#818cf8')
  const [statusCriando, setStatusCriando] = useState(false)
  const [statusNovoLabel, setStatusNovoLabel] = useState('')
  const [statusNovoCor, setStatusNovoCor] = useState('#818cf8')

  // Template editing substate
  const [criandoTemplate, setCriandoTemplate] = useState(false)
  const [editandoTemplateId, setEditandoTemplateId] = useState<string | null>(null)
  const [tplNome, setTplNome] = useState('')
  const [tplConteudo, setTplConteudo] = useState('')

  // Attachment Category substate
  const [novoAnexoNome, setNovoAnexoNome] = useState('')

  // Global save trigger detection
  // ─── Drag & Drop Event Handlers ────────────────────────────────────────────────

  const handleDragEndCards = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = pendingCardsPrefs.findIndex(p => p.id === active.id)
    const newIdx = pendingCardsPrefs.findIndex(p => p.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    setPendingCardsPrefs(arrayMove(pendingCardsPrefs, oldIdx, newIdx))
  }

  const handleDragEndColunas = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setColunasPersonalizadas(prev => {
      const oldIdx = prev.findIndex(p => p.id === active.id)
      const newIdx = prev.findIndex(p => p.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  const kanbanCardCampos = useCallback(() => {
    return (kanbanCardConfig.campos ?? KANBAN_BF_CARD_PADRAO.campos).map(c => ({
      ...c,
      grupo: c.grupo ?? KANBAN_BF_CARD_PADRAO.campos.find(d => d.campo === c.campo)?.grupo,
    }))
  }, [kanbanCardConfig])

  const kanbanCardToggle = useCallback((campo: string) => {
    setKanbanCardConfig(prev => ({
      ...prev,
      campos: prev.campos.map(c => (c.campo === campo ? { ...c, visivel: !c.visivel } : c)),
    }))
  }, [setKanbanCardConfig])

  const kanbanCardSetDataCritica = useCallback((valor: string | null) => {
    setKanbanCardConfig(prev => ({ ...prev, dataCritica: valor }))
  }, [setKanbanCardConfig])

  const kanbanCardRestaurarPadrao = useCallback(() => {
    setKanbanCardConfig({
      campos: KANBAN_BF_CARD_PADRAO.campos.map(c => ({ ...c })),
      dataCritica: KANBAN_BF_CARD_PADRAO.dataCritica,
    })
  }, [setKanbanCardConfig])

  const kanbanCardSalvar = useCallback(() => {
    salvarKanbanCardConfig()
    notificarKanbanConfigBidFreteAtualizado(cfgVisao.kanbanEscopo)
  }, [salvarKanbanCardConfig, cfgVisao.kanbanEscopo])

  const [abaAtivaModal, setAbaAtivaModal] = useState<KanbanModalAbaBidFrete>('cotacao')
  const [
    kanbanModalConfig,
    setKanbanModalConfig,
    ,
    salvarKanbanModalConfig,
    ,
    kanbanModalDirty,
  ] = useConfigState<KanbanModalConfigBidFrete>(
    'kanban-modal-config',
    KANBAN_BF_MODAL_PADRAO,
  )

  useEffect(() => {
    const norm = normalizarModalConfigBidFrete(kanbanModalConfig)
    if (JSON.stringify(norm) !== JSON.stringify(kanbanModalConfig)) {
      setKanbanModalConfig(norm)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const kanbanModalCamposDeAba = useCallback((aba: KanbanModalAbaBidFrete) => {
    return [...(kanbanModalConfig.abas.find(a => a.aba === aba)?.campos ?? [])].sort((a, b) => a.ordem - b.ordem)
  }, [kanbanModalConfig])

  const kanbanModalCamposEmUso = useCallback(() => {
    const todos = new Set<string>()
    kanbanModalConfig.abas.forEach(a => a.campos.forEach(c => todos.add(c.campo)))
    return todos
  }, [kanbanModalConfig])

  const kanbanModalAdicionarCampo = useCallback((aba: KanbanModalAbaBidFrete, campo: KanbanModalCampoDisponivelBidFrete) => {
    setKanbanModalConfig(prev => {
      const abaAtual = prev.abas.find(a => a.aba === aba)
      if (!abaAtual) return prev
      if (abaAtual.campos.length >= (KANBAN_BF_MODAL_LIMITES[aba] ?? 10)) return prev
      const novaOrdem = abaAtual.campos.length
      const novoCampo = { campo: campo.campo, label: campo.label, visivel: true, ordem: novaOrdem }
      return {
        abas: prev.abas.map(a =>
          a.aba === aba ? { ...a, campos: [...a.campos, novoCampo] } : a,
        ),
      }
    })
  }, [setKanbanModalConfig])

  const kanbanModalRemoverCampo = useCallback((aba: KanbanModalAbaBidFrete, campo: string) => {
    setKanbanModalConfig(prev => ({
      abas: prev.abas.map(a =>
        a.aba === aba
          ? { ...a, campos: a.campos.filter(c => c.campo !== campo).map((c, i) => ({ ...c, ordem: i })) }
          : a,
      ),
    }))
  }, [setKanbanModalConfig])

  const kanbanModalToggleVisivel = useCallback((aba: KanbanModalAbaBidFrete, campo: string) => {
    setKanbanModalConfig(prev => ({
      abas: prev.abas.map(a =>
        a.aba === aba
          ? { ...a, campos: a.campos.map(c => c.campo === campo ? { ...c, visivel: !c.visivel } : c) }
          : a,
      ),
    }))
  }, [setKanbanModalConfig])

  const kanbanModalRestaurarPadrao = useCallback(() => {
    setKanbanModalConfig(clonarModalConfigBidFrete(KANBAN_BF_MODAL_PADRAO))
  }, [setKanbanModalConfig])

  const kanbanModalSalvar = useCallback(() => {
    salvarKanbanModalConfig()
    notificarKanbanConfigBidFreteAtualizado(cfgVisao.kanbanEscopo)
    addNotification({ type: 'success', message: t('bidfrete.config.cards.msg_salvo', 'Preferências do modal salvas com sucesso!') })
  }, [salvarKanbanModalConfig, addNotification, t, cfgVisao.kanbanEscopo])

  const KANBAN_BF_MODAL_ABA_LABELS: Record<KanbanModalAbaBidFrete | 'lembrete', string> = {
    cotacao: 'Cotação',
    rota: 'Rota',
    datas: 'Datas',
    lembrete: 'Lembrete',
  }

  const handleDragEndStatus = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setStatusList(prev => {
      const oldIdx = prev.findIndex(p => p.id === active.id)
      const newIdx = prev.findIndex(p => p.id === over.id)
      if (oldIdx < 0 || newIdx < 0) return prev
      return arrayMove(prev, oldIdx, newIdx).map((s, idx) => ({ ...s, ordem: idx + 1 }))
    })
  }

  const iniciarEdicaoStatus = useCallback((status: PedidoStatusConfig) => {
    setEditandoStatusId(status.id)
    setEditStatusLabel(status.rotulo)
    setEditStatusCor(status.cor)
    setStatusCriando(false)
  }, [])

  const salvarEdicaoStatus = useCallback(() => {
    if (!editStatusLabel.trim() || !editandoStatusId) return
    setStatusList(prev => prev.map(s => (
      s.id === editandoStatusId
        ? { ...s, rotulo: editStatusLabel.trim(), cor: editStatusCor }
        : s
    )))
    setEditandoStatusId(null)
    setEditStatusLabel('')
    setEditStatusCor('#818cf8')
  }, [editStatusLabel, editStatusCor, editandoStatusId, setStatusList])

  const cancelarEdicaoStatus = useCallback(() => {
    setEditandoStatusId(null)
    setEditStatusLabel('')
    setEditStatusCor('#818cf8')
  }, [])

  const excluirStatus = useCallback((id: string) => {
    setStatusList(prev => prev.filter(x => x.id !== id))
  }, [setStatusList])

  const adicionarStatus = useCallback(() => {
    if (!statusNovoLabel.trim()) return
    const ordem = statusList.length + 1
    const nome = statusNovoLabel.trim().toUpperCase().replace(/\s+/g, '_')
    const newId = `status_${Date.now()}`
    setStatusList(prev => [...prev, {
      id: newId,
      nome,
      rotulo: statusNovoLabel.trim(),
      cor: statusNovoCor,
      ordem,
      is_sistema: false,
    }])
    setStatusNovoLabel('')
    setStatusNovoCor('#818cf8')
    setStatusCriando(false)
  }, [statusNovoLabel, statusNovoCor, statusList.length, setStatusList])

  const restaurarStatusPadrao = useCallback(() => {
    restaurarStatusConfig()
    setEditandoStatusId(null)
    setStatusCriando(false)
    setStatusNovoLabel('')
    setStatusNovoCor('#818cf8')
  }, [restaurarStatusConfig])

  return (
    <div className="cfg-page ws-fade-up">
        {/* ── Sidebar ── */}
        <aside className="cfg-sidebar">
        <nav className="cfg-sidebar__nav">
          {sidebarItems.map((item, idx) => {
            if (item.tipo === 'grupo') {
              return (
                <div key={idx} className="cfg-sidebar__titulo--grupo">
                  {item.label}
                </div>
              )
            }
            const itemId = item.id || ''
            if (item.tipo === 'parent') {
              const isOpen = expandedGroups[itemId] || false
              return (
                <div key={itemId} className="cfg-sidebar__group">
                  <button
                    type="button"
                    className={`cfg-sidebar__item ${isOpen ? 'cfg-sidebar__item--parent-open' : ''}`}
                    onClick={() => toggleGroup(itemId)}
                  >
                    <span className="cfg-sidebar__item-icon">{item.icone}</span>
                    <span className="cfg-sidebar__item-label">{item.label}</span>
                    <CaretDown className={`cfg-sidebar__chevron ${isOpen ? 'cfg-sidebar__chevron--open' : ''}`} size={12} />
                  </button>
                  <div className={`cfg-sidebar__submenu ${isOpen ? 'cfg-sidebar__submenu--open' : ''}`}>
                    {sidebarItems.filter(s => s.tipo === 'sub' && s.id && item.filhos?.includes(s.id)).map(sub => {
                      const subId = sub.id || ''
                      const subAtivo = categoria === subId
                      return (
                        <button
                          key={subId}
                          type="button"
                          className={`cfg-sidebar__subitem ${subAtivo ? 'cfg-sidebar__subitem--ativo' : ''}`}
                          onClick={() => setCategoria(subId)}
                        >
                          {sub.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            }
            if (item.tipo === 'sub') return null

            const isAtivo = categoria === itemId
            return (
              <button
                key={itemId}
                type="button"
                className={`cfg-sidebar__item ${isAtivo ? 'cfg-sidebar__item--ativo' : ''}`}
                onClick={() => setCategoria(itemId)}
              >
                <span className="cfg-sidebar__item-icon">{item.icone}</span>
                <span className="cfg-sidebar__item-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Conteúdo Central ── */}
      <main className="cfg-conteudo">
        
        {/* ── CATEGORIA: CARDS ── */}
        {categoria === 'cards' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">
                    {t('bidfrete.configuracoes.meus_cards_titulo', 'Meus Cards')}
                  </h2>
                  <p className="cfg-secao__desc">
                    {t('bidfrete.configuracoes.meus_cards_desc', 'Defina quais cards numéricos aparecem no topo da tela, ordene e oculte os não utilizados.')}
                  </p>
                </div>
                <div className="cfg-secao__header-actions">
                  <button type="button" className="cfg-add-row-btn" onClick={() => setCriandoCard(true)}>
                    <Plus size={13} weight="bold" />
                    {t('bidfrete.configuracoes.adicionar_card_kpi', 'Adicionar card KPI customizado')}
                  </button>
                </div>
              </div>

              <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.periodo_comparacao', 'Período de Comparação')} />
              <div className="cfg-periodo-row">
                <div className="cfg-periodo-pills">
                  {PERIODOS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`cfg-periodo-pill ${pendingPeriodoCards === p.id ? 'cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setPendingPeriodoCards(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Grid */}
              <div className="cfg-cards-preview-wrap">
                <p className="cfg-cards-preview-label">
                  <SquaresFour size={12} weight="fill" />
                  Preview — Como ficará na tela
                </p>
                <div className="cfg-cards-preview-grid">
                  {pendingCardsPrefs.map((pref, i) => {
                    const card = cardsCatalogo.find(c => c.id === pref.id)
                    if (!card) return null
                    const visual = resolverVisualCard(card)
                    return (
                      <div key={card.id} className={`cfg-kpi-preview-card ${!pref.visible ? 'cfg-kpi-preview-card--oculto' : ''}`}>
                        <span className="cfg-kpi-preview-card__pos">{i + 1}</span>
                        <div className="cfg-kpi-preview-card__icon" style={{ color: visual.cor }}>
                          {visual.icone}
                        </div>
                        <div className="cfg-kpi-preview-card__line" style={{ background: visual.cor }} />
                        <p className="cfg-kpi-preview-card__label">{obterNomeExibicaoCard(card)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Ativos List (DnD Context) */}
              <ConfiguracaoSecaoGlobal label="ATIVOS" count={`${pendingCardsPrefs.length} cards`} />
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndCards}>
                <SortableContext items={pendingCardsPrefs.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
                    {pendingCardsPrefs.map(pref => {
                      const def = cardsCatalogo.find(c => c.id === pref.id)
                      if (!def) return null
                      return (
                        <CardSortavel
                          key={pref.id}
                          pref={pref}
                          def={def}
                          periodoAtivo={pendingPeriodoCards}
                          onToggle={() => setPendingCardsPrefs(prev =>
                            prev.map(p => (p.id === pref.id ? { ...p, visible: !p.visible } : p)),
                          )}
                          onRemover={() => setPendingCardsPrefs(prev => prev.filter(p => p.id !== pref.id))}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Disponíveis para adicionar */}
              <div className="cfg-list-section-header">
                <p className="cfg-list-section-label">Disponíveis para adicionar</p>
              </div>
              <div className="cfg-cards-lista">
                {cardsDisponiveis.map(def => (
                  <CardDisponivel
                    key={def.id}
                    def={def}
                    periodoAtivo={pendingPeriodoCards}
                    onAdicionar={() => {
                      if (pendingCardsPrefs.some(p => p.id === def.id)) return
                      setPendingCardsPrefs(prev => [...prev, { id: def.id, visible: true }])
                    }}
                  />
                ))}
              </div>

              <div className="cfg-secao__footer">
                <BotaoCancelar
                  dirty={cardsConfigDirty}
                  rotulo={t('bidfrete.config.acao.restaurar_padrao', 'Restaurar padrão')}
                  onClick={restaurarCardsPadrao}
                />
                <BotaoSalvar
                  dirty={cardsConfigDirty}
                  rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                  onClick={salvarCardsConfig}
                />
              </div>
            </section>
          </div>
        )}

        {/* ── CATEGORIA: VISÃO GERAL — KPIs do topo ── */}
        {categoria === 'dashboard-kpi' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">
                    {t('bidfrete.config.dashboard_kpi.titulo')}
                  </h2>
                  <p className="cfg-secao__desc">
                    {t('bidfrete.config.dashboard_kpi.descricao')}
                  </p>
                </div>
              </div>

              {statusList.length > 0 && (
                <div className="cfg-cards-preview-wrap">
                  <p className="cfg-cards-preview-label">
                    <ChartBar size={12} weight="fill" />
                    {t('bidfrete.config.dashboard_kpi.preview')}
                  </p>
                  <div className="cfg-cards-preview-grid">
                    {BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS.map((widgetId, index) => {
                      const slugPendente = pendingDashboardTopKpi[widgetId as BidFreteDashboardTopKpiWidgetId]
                      const slugValido = statusList.some(s => s.nome === slugPendente)
                        ? slugPendente
                        : (statusList[index]?.nome ?? statusList[0]?.nome ?? '')
                      const statusCfg = statusList.find(s => s.nome === slugValido)
                      const visual = BID_FRETE_DASHBOARD_TOP_KPI_PREVIEW_VISUAL[widgetId as BidFreteDashboardTopKpiWidgetId]
                      const cor = statusCfg?.cor ?? visual.cor
                      return (
                        <div
                          key={widgetId}
                          className="cfg-kpi-preview-card"
                          style={{ borderTopColor: cor }}
                        >
                          <span className="cfg-kpi-preview-card__pos">{index + 1}</span>
                          <span className="cfg-kpi-preview-card__icon" style={{ color: cor }}>
                            {visual.icone}
                          </span>
                          <div className="cfg-kpi-preview-card__line" style={{ background: cor }} />
                          <p className="cfg-kpi-preview-card__valor">0</p>
                          <p className="cfg-kpi-preview-card__label">{statusCfg?.rotulo ?? '—'}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <ConfiguracaoSecaoGlobal label={t('bidfrete.config.dashboard_kpi.cards_topo')} count="4" />

              {statusList.length === 0 ? (
                <p className="cfg-empty">{t('bidfrete.config.dashboard_kpi.sem_status')}</p>
              ) : (
                <div className="cfg-cards-lista" style={{ gap: '0.75rem' }}>
                  {BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS.map((widgetId, index) => {
                    const numero = String(index + 1).padStart(2, '0')
                    const slugPendente = pendingDashboardTopKpi[widgetId as BidFreteDashboardTopKpiWidgetId]
                    const slugValido = statusList.some(s => s.nome === slugPendente)
                      ? slugPendente
                      : (statusList[index]?.nome ?? statusList[0]?.nome ?? '')
                    return (
                      <div key={widgetId} className="cfg-toggle-row" style={{ alignItems: 'center' }}>
                        <label className="cfg-toggle-row__label" style={{ flex: 1 }}>
                          {t('bidfrete.config.dashboard_kpi.card_status', { n: numero, defaultValue: `Card ${numero} — Status` })}
                        </label>
                        <div className="cfg-dashboard-kpi-select" style={{ maxWidth: '280px', flexShrink: 0, width: '100%' }}>
                          <SelectGlobal
                            buscavel
                            placeholder={t('bidfrete.config.dashboard_kpi.selecionar_status')}
                            opcoes={statusList.map(s => ({ valor: s.nome, rotulo: s.rotulo }))}
                            valor={slugValido || null}
                            aoMudarValor={v => setPendingDashboardTopKpi(prev => ({
                              ...prev,
                              [widgetId]: v != null ? String(v) : '',
                            }))}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="cfg-secao__footer">
                <BotaoCancelar
                  dirty={dashboardKpiDirty}
                  rotulo={t('bidfrete.config.acao.restaurar_padrao', 'Restaurar padrão')}
                  onClick={restaurarDashboardTopKpiPadrao}
                />
                <BotaoSalvar
                  dirty={dashboardKpiDirty}
                  rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                  onClick={salvarDashboardTopKpiConfig}
                />
              </div>
            </section>
          </div>
        )}

        {/* ── CATEGORIA: TABELA (padrão Pedido) ── */}
        {categoria === 'tabela' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">
                    {t('bidfrete.config.tabela.titulo', 'Preferências da Tabela')}
                  </h2>
                  <p className="cfg-secao__desc">
                    {t('bidfrete.config.tabela.descricao', 'Configure paginação e destaque visual na listagem de cotações.')}
                  </p>
                </div>
              </div>

              <ConfiguracaoSecaoGlobal
                label={t('bidfrete.config.tabela.linhas_por_pagina', 'Linhas por página padrão')}
              />
              <div className="cfg-periodo-pills" style={{ marginBottom: '1.5rem' }}>
                {([25, 50, 100, 200] as const).map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`cfg-periodo-pill${tabelaConfig.linhasPorPagina === n ? ' cfg-periodo-pill--ativo' : ''}`}
                    onClick={() => setTabelaConfig(prev => ({ ...prev, linhasPorPagina: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <ConfiguracaoSecaoGlobal
                label={t('bidfrete.config.tabela.preferencias', 'Preferências de exibição')}
              />
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="tab-destaque"
                  label={t('bidfrete.config.tabela.destacar_expirar', 'Destacar cotações prestes a expirar')}
                  desc={t(
                    'bidfrete.config.tabela.destacar_expirar_desc',
                    'Aplica borda sutil avermelhada a cotações com menos de 2 horas restantes para expiração.',
                  )}
                  checked={tabelaConfig.destacarAtrasados}
                  onChange={v => setTabelaConfig(prev => ({ ...prev, destacarAtrasados: v }))}
                />
              </div>

              <div className="cfg-secao__footer">
                <BotaoCancelar
                  dirty={tabelaDirty}
                  rotulo={t('bidfrete.config.acao.restaurar_padrao', 'Restaurar padrão')}
                  onClick={restaurarTabelaConfig}
                />
                <BotaoSalvar
                  dirty={tabelaDirty}
                  rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                  onClick={salvarTabelaConfig}
                />
              </div>
            </section>
          </div>
        )}

        {/* ── COLUNAS (padrão Pedido) ── */}
        {COLUNAS_FILHOS.includes(categoria as typeof COLUNAS_FILHOS[number]) && (
          <div className="cfg-cards-wrapper">

        {categoria === 'colunas-casas-decimais' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">
                  {t('bidfrete.config.colunas.casas_decimais.titulo', 'Casas decimais por coluna')}
                </h2>
                <p className="cfg-secao__desc">
                  {t('bidfrete.config.colunas.casas_decimais.descricao', 'Define quantas casas decimais são exibidas em colunas numéricas. Padrão: 2.')}
                </p>
              </div>
            </div>

            <div className="cfg-colunas-lista">
              {GRUPOS_CASAS_DECIMAIS_BID_FRETE.map(grupo => (
                <React.Fragment key={grupo}>
                  <ConfiguracaoSecaoGlobal label={grupo.toUpperCase()} />
                  {COLUNAS_NUMERICAS_BID_FRETE.filter(col => col.categoria === grupo).map(col => {
                    const val = pendingCasas[col.campo] ?? col.padrao
                    return (
                      <div key={col.campo} className="cfg-coluna-row">
                        <div className="cfg-coluna-row__info">
                          <span className="cfg-coluna-row__label">{col.label}</span>
                          {col.itemHint && (
                            <span className="cfg-coluna-row__hint">{col.itemHint}</span>
                          )}
                        </div>
                        <div className="cfg-casas-stepper" aria-label={`Casas decimais para ${col.label}`}>
                          <button
                            type="button"
                            className="cfg-casas-stepper__btn"
                            disabled={val <= 0}
                            onClick={() => handleCasasDecimaisChange(col.campo, val - 1)}
                            aria-label="Diminuir casas decimais"
                          >
                            −
                          </button>
                          <span className="cfg-casas-stepper__value">{val}</span>
                          <button
                            type="button"
                            className="cfg-casas-stepper__btn"
                            disabled={val >= 8}
                            onClick={() => handleCasasDecimaisChange(col.campo, val + 1)}
                            aria-label="Aumentar casas decimais"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}

              {colunasNumericasPersonalizadas.length > 0 && (
                <>
                  <ConfiguracaoSecaoGlobal
                    label={t('bidfrete.config.colunas.casas_decimais.grupo_personalizadas', 'Personalizadas')}
                  />
                  {colunasNumericasPersonalizadas.map(col => {
                    const val = pendingCasas[col.id] ?? PADRAO_CASAS_COLUNA_PERSONALIZADA
                    return (
                      <div key={col.id} className="cfg-coluna-row">
                        <span className="cfg-coluna-row__label">{col.nome}</span>
                        <div className="cfg-casas-stepper" aria-label={`Casas decimais para ${col.nome}`}>
                          <button
                            type="button"
                            className="cfg-casas-stepper__btn"
                            disabled={val <= 0}
                            onClick={() => handleCasasDecimaisChange(col.id, val - 1)}
                            aria-label="Diminuir casas decimais"
                          >
                            −
                          </button>
                          <span className="cfg-casas-stepper__value">{val}</span>
                          <button
                            type="button"
                            className="cfg-casas-stepper__btn"
                            disabled={val >= 8}
                            onClick={() => handleCasasDecimaisChange(col.id, val + 1)}
                            aria-label="Aumentar casas decimais"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            <div className="cfg-secao__footer">
              <BotaoCancelar
                dirty={casasDirty}
                rotulo={t('bidfrete.config.acao.descartar', 'Descartar')}
                onClick={restaurarCasasDecimaisConfig}
              />
              <BotaoSalvar
                dirty={casasDirty}
                rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                onClick={salvarCasasDecimaisConfig}
              />
            </div>
          </section>
        )}

        {categoria === 'colunas-formato-data' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">
                  {t('bidfrete.config.colunas.formato_data.titulo', 'Formato de Data')}
                </h2>
                <p className="cfg-secao__desc">
                  {t(
                    'bidfrete.config.colunas.formato_data.descricao',
                    'Define como as datas são exibidas em todas as colunas da tabela, nos inputs de edição e nas exportações.',
                  )}
                </p>
              </div>
            </div>

            <div className="cfg-campo-linha" style={{ marginTop: 20 }}>
              <div className="cfg-formato-data-grid">
                {FORMATOS_DATA_BID_FRETE.map(fmt => (
                  <button
                    key={fmt.valor}
                    type="button"
                    className={`cfg-formato-data-opcao${pendingFormato === fmt.valor ? ' cfg-formato-data-opcao--ativo' : ''}`}
                    onClick={() => setPendingFormato(fmt.valor)}
                  >
                    <span className="cfg-formato-data-label">{fmt.label}</span>
                    <span className="cfg-formato-data-exemplo">{fmt.exemplo}</span>
                    <span className="cfg-formato-data-regiao">{fmt.regiao}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cfg-formato-data-preview" style={{ marginTop: 16 }}>
              <span className="cfg-formato-data-preview__label">
                {t('bidfrete.config.colunas.formato_data.preview_label', 'Preview com a data de hoje:')}
              </span>
              <strong className="cfg-formato-data-preview__valor">
                {previewFormatoDataBidFrete(pendingFormato)}
              </strong>
            </div>

            <div className="cfg-secao__footer" style={{ marginTop: 20 }}>
              <BotaoCancelar
                dirty={formatoDirty}
                rotulo={t('bidfrete.config.acao.descartar', 'Cancelar')}
                onClick={restaurarFormatoDataConfig}
              />
              <BotaoSalvar
                dirty={formatoDirty}
                rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                onClick={salvarFormatoDataConfig}
              />
            </div>
          </section>
        )}

        {categoria === 'colunas-personalizadas' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                <p className="cfg-secao__desc">Adicione colunas personalizadas extras para as cotações de frete.</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label="SUAS COLUNAS" count={`${colunasPersonalizadas.length} colunas`} />
            
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndColunas}>
              <SortableContext items={colunasPersonalizadas.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
                  {colunasPersonalizadas.map(col => (
                    <ColunaSortavel
                      key={col.id}
                      col={col}
                      editando={editandoColunaId === col.id}
                      onToggleAtivo={() => setColunasPersonalizadas(prev => prev.map(c => c.id === col.id ? { ...c, ativo: !c.ativo } : c))}
                      onEditar={() => setEditandoColunaId(col.id === editandoColunaId ? null : col.id)}
                      onRemover={() => setColunasPersonalizadas(prev => prev.filter(c => c.id !== col.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {editandoColunaId && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#334155', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>Editar descrição</p>
                <input
                  type="text"
                  className="cfg-input"
                  style={{ width: '100%', marginTop: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px' }}
                  value={colunasPersonalizadas.find(c => c.id === editandoColunaId)?.descricao ?? ''}
                  onChange={e => setColunasPersonalizadas(prev => prev.map(c => c.id === editandoColunaId ? { ...c, descricao: e.target.value } : c))}
                />
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={() => setCriandoColuna(true)}>
                <Plus size={14} weight="bold" /> Criar Coluna Personalizada
              </BotaoGlobal>
            </div>
          </section>
        )}

        {categoria === 'colunas-campos-calculados' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Campos Calculados</h2>
                <p className="cfg-secao__desc">Configure fórmulas matemáticas customizadas com campos nativos de frete.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Custo Total Estimado do Frete</p>
              <div className="mcu-formula-area mcu-formula-area--ok" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: '#0f172a', borderRadius: '8px', border: '1px solid #818cf8' }}>
                {saldoTokens.map((tk, idx) => (
                  <span key={idx} className={`mcu-token ${tk.tipo === 'campo' ? 'mcu-token--campo' : 'mcu-token--op'}`}>
                    <span>{tk.tipo === 'campo' ? tk.label : tk.valor}</span>
                    <button type="button" className="mcu-token__remove" onClick={() => setSaldoTokens(prev => prev.filter((_, i) => i !== idx))}>
                      <X size={9} weight="bold" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="mcu-ops">
                {['+', '-', '*', '/'].map(op => (
                  <button key={op} type="button" className="mcu-op-btn" onClick={() => setSaldoTokens(prev => [...prev, { tipo: 'op', valor: op }])}>{op}</button>
                ))}
              </div>

              <div>
                <span className="cfg-list-section-label" style={{ marginBottom: '0.5rem' }}>Campos disponíveis</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {FORMULA_FIELDS.map(f => (
                    <button
                      key={f.chave}
                      type="button"
                      className="mcu-chip-campo"
                      onClick={() => setSaldoTokens(prev => [...prev, { tipo: 'campo', chave: f.chave, label: f.label }])}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

          </div>
        )}

        {/* ── CATEGORIA: KANBAN COLUNAS ── */}
        {categoria === 'kanban-colunas' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Colunas do Kanban</h2>
                <p className="cfg-secao__desc">Configure quais colunas de status devem aparecer no seu Kanban de BID de Frete.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {statusList.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#334155', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.cor }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{s.rotulo}</span>
                  </div>
                  <TooltipGlobal descricao={kanbanColunasOcultas.includes(s.id) ? 'Exibir no Kanban' : 'Ocultar do Kanban'}>
                    <button
                      type="button"
                      className={`cfg-eye-btn ${!kanbanColunasOcultas.includes(s.id) ? 'cfg-eye-btn--on' : ''}`}
                      onClick={() => setKanbanColunasOcultas(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                    >
                      {kanbanColunasOcultas.includes(s.id) ? <EyeSlash size={14} /> : <Eye size={14} />}
                    </button>
                  </TooltipGlobal>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CATEGORIA: KANBAN CARD (paridade Pedido) ── */}
        {categoria === 'kanban-card' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Card do Kanban</h2>
                <p className="cfg-secao__desc">
                  Defina quais campos aparecem nos cards de cotação — mesmo padrão visual do Kanban de Pedido.
                </p>
              </div>
            </div>

            {(() => {
              const todosCampos = kanbanCardCampos()
              const ativos = todosCampos.filter(c => c.visivel)
              const disponiveis = todosCampos.filter(c => !c.visivel)
              const dataCritica = kanbanCardConfig.dataCritica
              const dataCriticaLabel = KANBAN_BF_DATAS_CRITICAS.find(c => c.campo === dataCritica)?.label ?? null
              return (
                <>
                  <div className="cfg-cards-preview-wrap">
                    <p className="cfg-cards-preview-label">
                      <SquaresFour size={12} weight="fill" />
                      Preview — Como ficará no Kanban
                    </p>
                    <div className="cfg-card-preview">
                      <div className="cfg-card-preview__header">
                        <span className="cfg-card-preview__numero">BF-2025-0001</span>
                        <span className="cfg-card-preview__fixo-badge">Fixo</span>
                      </div>
                      <div className="cfg-card-preview__campos">
                        {ativos.map(c => (
                          <div key={c.campo} className="cfg-card-preview__campo">
                            <span className="cfg-card-preview__campo-label">{c.label}</span>
                            <span className="cfg-card-preview__campo-valor">—</span>
                          </div>
                        ))}
                        {ativos.length === 0 && (
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.25rem 0' }}>
                            Nenhum campo ativo além do número da cotação.
                          </p>
                        )}
                      </div>
                      {dataCritica && (
                        <div className="cfg-card-preview__data-critica">
                          <CalendarBlank size={10} />
                          {dataCriticaLabel ?? dataCritica}
                        </div>
                      )}
                    </div>
                  </div>

                  <ConfiguracaoSecaoGlobal label="Ativos" count={`${ativos.length + 1} campos`} />
                  <p className="cfg-hint">O número da cotação e o tipo de operação são sempre exibidos no topo do card.</p>
                  <div className="cfg-kanban-campos-lista">
                    <div className="cfg-kanban-campo-row cfg-kanban-campo-row--fixo">
                      <span className="cfg-kanban-campo-label">Nº da Cotação + Tipo</span>
                      <span className="cfg-kanban-aba-fixa-badge">Fixo</span>
                    </div>
                    {KANBAN_BF_CARD_GRUPOS.map(grupo => {
                      const cols = ativos.filter(c => c.grupo === grupo.key)
                      if (cols.length === 0) return null
                      return (
                        <React.Fragment key={grupo.key}>
                          <div className="cfg-card-grupo-divider">{grupo.label}</div>
                          {cols.map(cfg => (
                            <div key={cfg.campo} className="cfg-kanban-campo-row">
                              <span className="cfg-kanban-campo-label">{cfg.label}</span>
                              <button
                                type="button"
                                className="cfg-eye-btn cfg-eye-btn--on"
                                onClick={() => kanbanCardToggle(cfg.campo)}
                                aria-label="Ocultar campo do card"
                              >
                                <Eye size={14} weight="bold" />
                              </button>
                            </div>
                          ))}
                        </React.Fragment>
                      )
                    })}
                  </div>

                  <ConfiguracaoSecaoGlobal label="Disponíveis para adicionar" hint="Clique em + para exibir no card" style={{ marginTop: '1.5rem' }} />
                  <div className="cfg-kanban-disponivel-lista">
                    <div className="cfg-kanban-disponivel-header">
                      <span>Campo</span>
                      <span>Grupo</span>
                      <span></span>
                    </div>
                    {disponiveis.length === 0 && (
                      <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        Todos os campos estão ativos.
                      </p>
                    )}
                    {disponiveis.map(cfg => (
                      <div key={cfg.campo} className="cfg-kanban-disponivel-row">
                        <span className="cfg-kanban-disponivel-label">{cfg.label}</span>
                        <span className="cfg-origem-badge cfg-origem-badge--pedido">
                          {KANBAN_BF_CARD_GRUPOS.find(g => g.key === cfg.grupo)?.label ?? '—'}
                        </span>
                        <TooltipGlobal descricao="Exibir no card">
                          <button
                            type="button"
                            className="cfg-kanban-add-btn"
                            onClick={() => kanbanCardToggle(cfg.campo)}
                            aria-label="Exibir campo no card"
                          >
                            <Plus size={13} weight="bold" />
                          </button>
                        </TooltipGlobal>
                      </div>
                    ))}
                  </div>

                  <ConfiguracaoSecaoGlobal label="Data crítica" style={{ marginTop: '1.5rem' }} />
                  <p className="cfg-hint">Badge colorido no card (verde / amarelo / vermelho conforme proximidade da data).</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <SelectGlobal
                      buscavel={false}
                      placeholder="Não exibir data crítica"
                      opcoes={[
                        { valor: '', rotulo: 'Não exibir' },
                        ...KANBAN_BF_DATAS_CRITICAS.map(c => ({ valor: c.campo, rotulo: c.label })),
                      ]}
                      valor={dataCritica ?? ''}
                      aoMudarValor={v => kanbanCardSetDataCritica(v != null && String(v) !== '' ? String(v) : null)}
                    />
                  </div>

                  <div className="cfg-secao__footer">
                    <BotaoCancelar
                      dirty={kanbanCardDirty}
                      rotulo={t('bidfrete.config.acao.restaurar_padrao', 'Restaurar padrão')}
                      onClick={kanbanCardRestaurarPadrao}
                    />
                    <BotaoSalvar
                      dirty={kanbanCardDirty}
                      rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                      onClick={kanbanCardSalvar}
                    />
                  </div>
                </>
              )
            })()}
          </section>
        )}

        {/* ── CATEGORIA: KANBAN MODAL (paridade Pedido) ── */}
        {categoria === 'kanban-modal' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Campos do Modal Rápido</h2>
                <p className="cfg-secao__desc">Decida quais informações da cotação são editáveis no modal pop-up lateral.</p>
              </div>
            </div>

            {(() => {
              const campos = kanbanModalCamposDeAba(abaAtivaModal)
              const limite = KANBAN_BF_MODAL_LIMITES[abaAtivaModal] ?? 10
              const nomeAba = KANBAN_BF_MODAL_ABA_LABELS[abaAtivaModal]
              const disponiveis = KANBAN_BF_MODAL_CAMPOS_DISPONIVEIS.filter(cd => cd.categoria === abaAtivaModal)
              return (
                <>
                  <div className="cfg-cards-preview-wrap">
                    <p className="cfg-cards-preview-label">
                      <SquaresFour size={12} weight="fill" />
                      Preview — como ficará no modal
                    </p>
                    <div className="cfg-modal-preview">
                      <div className="cfg-modal-preview__tabs">
                        {(['cotacao', 'rota', 'datas', 'lembrete'] as const).map(tab => (
                          <span key={tab} className={`cfg-modal-preview__tab${tab === abaAtivaModal ? ' cfg-modal-preview__tab--ativo' : ''}`}>
                            {KANBAN_BF_MODAL_ABA_LABELS[tab]}
                          </span>
                        ))}
                      </div>
                      <div className="cfg-modal-preview__campos">
                        {campos.filter(c => c.visivel).map(c => (
                          <div key={c.campo} className="cfg-modal-preview__campo">
                            <span className="cfg-modal-preview__campo-label">{c.label}</span>
                            <span className="cfg-modal-preview__campo-valor">—</span>
                          </div>
                        ))}
                        {campos.length === 0 && (
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                            Nenhum campo nesta aba
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="cfg-periodo-pills" style={{ marginBottom: '1.25rem' }}>
                    {(['cotacao', 'rota', 'datas'] as const).map(aba => {
                      const qtd = kanbanModalCamposDeAba(aba).length
                      const lim = KANBAN_BF_MODAL_LIMITES[aba] ?? 10
                      return (
                        <button
                          key={aba}
                          type="button"
                          className={`cfg-periodo-pill${abaAtivaModal === aba ? ' cfg-periodo-pill--ativo' : ''}`}
                          onClick={() => setAbaAtivaModal(aba)}
                        >
                          {KANBAN_BF_MODAL_ABA_LABELS[aba]}
                          <span style={{ marginLeft: '0.375rem', fontSize: '0.6875rem', opacity: 0.7 }}>
                            {qtd}/{lim}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <ConfiguracaoSecaoGlobal label="ATIVOS" count={`${campos.length}/${limite} campos`} />
                  <p className="cfg-hint">Oculte ou remova campos que não deseja no modal da aba {nomeAba}. Detalhe completo permanece em Detalhes.</p>

                  <div className="cfg-kanban-campos-lista">
                    {campos.map(cfg => (
                      <div key={cfg.campo} className={`cfg-kanban-campo-row${!cfg.visivel ? ' cfg-kanban-campo-row--oculto' : ''}`}>
                        <span className="cfg-drag-handle" aria-label="Arrastar">
                          <DotsSixVertical size={15} weight="bold" />
                        </span>
                        <span className="cfg-kanban-campo-label">{cfg.label}</span>
                        <button
                          type="button"
                          className={`cfg-eye-btn${cfg.visivel ? ' cfg-eye-btn--on' : ''}`}
                          onClick={() => kanbanModalToggleVisivel(abaAtivaModal, cfg.campo)}
                          aria-label={cfg.visivel ? 'Ocultar campo' : 'Exibir campo'}
                        >
                          {cfg.visivel ? <Eye size={14} weight="bold" /> : <EyeSlash size={14} weight="bold" />}
                        </button>
                        <button
                          type="button"
                          className="cfg-remove-btn"
                          onClick={() => kanbanModalRemoverCampo(abaAtivaModal, cfg.campo)}
                          aria-label="Remover campo"
                        >
                          <X size={12} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <ConfiguracaoSecaoGlobal label="DISPONÍVEIS PARA ADICIONAR" hint="Clique em + para incluir na aba ativa" style={{ marginTop: '1.5rem' }} />
                  <div className="cfg-kanban-disponivel-lista">
                    {disponiveis.filter(cd => !kanbanModalCamposEmUso().has(cd.campo)).map(cd => {
                      const cheio = campos.length >= limite
                      return (
                        <div key={cd.campo} className="cfg-kanban-disponivel-row">
                          <span className="cfg-kanban-disponivel-label">{cd.label}</span>
                          <TooltipGlobal descricao={cheio ? `Limite de ${limite} campos` : `Adicionar à aba ${nomeAba}`}>
                            <button
                              type="button"
                              className={`cfg-kanban-add-btn${cheio ? ' cfg-kanban-add-btn--disabled' : ''}`}
                              onClick={() => { if (!cheio) kanbanModalAdicionarCampo(abaAtivaModal, cd) }}
                              disabled={cheio}
                              aria-label="Adicionar campo"
                            >
                              <Plus size={13} weight="bold" />
                            </button>
                          </TooltipGlobal>
                        </div>
                      )
                    })}
                  </div>

                  <div className="cfg-kanban-aba cfg-kanban-aba--fixa" style={{ marginTop: '1.5rem' }}>
                    <ConfiguracaoSecaoGlobal
                      label="ABA LEMBRETE"
                      action={<span className="cfg-kanban-aba-fixa-badge">Fixa</span>}
                    />
                    <p className="cfg-hint">Aba fixa — não configurável.</p>
                  </div>

                  <div className="cfg-secao__footer">
                    <BotaoCancelar
                      dirty={kanbanModalDirty}
                      rotulo={t('bidfrete.config.acao.restaurar_padrao', 'Restaurar padrão')}
                      onClick={kanbanModalRestaurarPadrao}
                    />
                    <BotaoSalvar
                      dirty={kanbanModalDirty}
                      rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                      onClick={kanbanModalSalvar}
                    />
                  </div>
                </>
              )
            })()}
          </section>
        )}

        {/* ── CATEGORIA: STATUS ── */}
        {categoria === 'status' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">
                    {t('bidfrete.config.status.titulo', 'Status de Cotação')}
                  </h2>
                  <p className="cfg-secao__desc">
                    {t('bidfrete.config.status.descricao', 'Arraste para reordenar · edite o nome e a cor')}
                  </p>
                </div>
                {!statusCriando && (
                  <button
                    type="button"
                    className="cfg-add-row-btn"
                    onClick={() => { setStatusCriando(true); setEditandoStatusId(null) }}
                  >
                    <Plus size={13} weight="bold" />
                    {t('bidfrete.config.status.novo_status', 'Novo Status')}
                  </button>
                )}
              </div>

              {statusList.length === 0 ? (
                <p className="cfg-empty">{t('bidfrete.config.status.nenhum_status', 'Nenhum status configurado.')}</p>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndStatus}>
                  <SortableContext items={statusList.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="cfg-cards-lista">
                      {statusList.map(s => (
                        <StatusSortavel
                          key={s.id}
                          status={s}
                          editandoId={editandoStatusId}
                          editLabel={editStatusLabel}
                          editCor={editStatusCor}
                          onIniciarEdicao={iniciarEdicaoStatus}
                          onSalvarEdicao={salvarEdicaoStatus}
                          onCancelarEdicao={cancelarEdicaoStatus}
                          onChangeLabel={setEditStatusLabel}
                          onChangeCor={setEditStatusCor}
                          onExcluir={excluirStatus}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {statusCriando && (
                <div className="cfg-status-novo-form">
                  <div className="cfg-status-edit-fields">
                    <input
                      type="text"
                      className="cfg-input cfg-input--grow"
                      placeholder={t('bidfrete.config.status.placeholder_novo', 'Nome do novo status (ex.: Em Análise do Armador)')}
                      value={statusNovoLabel}
                      onChange={e => setStatusNovoLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') adicionarStatus() }}
                      autoFocus
                    />
                    <div className="cfg-status-color-picker">
                      <span className="cfg-status-color-label">{t('bidfrete.config.status.cor', 'Cor')}</span>
                      <input
                        type="color"
                        className="cfg-status-color-input"
                        value={statusNovoCor}
                        onChange={e => setStatusNovoCor(e.target.value)}
                      />
                      <span className="cfg-status-color-preview" style={{ background: statusNovoCor }} />
                    </div>
                  </div>
                  <div className="cfg-tpl-form__actions">
                    <button type="button" className="cfg-btn-primario cfg-btn-primario--xs" onClick={adicionarStatus}>
                      <FloppyDisk size={13} weight="bold" />
                      {t('bidfrete.config.acao.salvar', 'Salvar')}
                    </button>
                    <button
                      type="button"
                      className="cfg-btn-secundario cfg-btn-secundario--xs"
                      onClick={() => { setStatusCriando(false); setStatusNovoLabel(''); setStatusNovoCor('#818cf8') }}
                    >
                      {t('bidfrete.config.acao.cancelar', 'Cancelar')}
                    </button>
                  </div>
                </div>
              )}

              <div className="cfg-secao__footer">
                <BotaoCancelar
                  dirty={statusConfigDirty}
                  rotulo={t('bidfrete.config.acao.restaurar_padrao', 'Restaurar padrão')}
                  onClick={restaurarStatusPadrao}
                />
                <BotaoSalvar
                  dirty={statusConfigDirty}
                  rotulo={t('bidfrete.config.acao.salvar', 'Salvar')}
                  onClick={salvarStatusConfig}
                />
              </div>
            </section>
          </div>
        )}

        {/* ── CATEGORIA: STATUS BID ── */}
        {categoria === 'status-bid-frete-internacional' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Gerenciar Status do BID</h2>
                <p className="cfg-secao__desc">Configure status do conjunto BID (agrupador de pedidos de cotação).</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label="STATUS BID ATIVOS" count={`${statusBidList.length} status`} />

            <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
              {statusBidList.map(s => (
                <div key={s.id} className="cfg-status-row">
                  <span className="cfg-status-dot" style={{ background: s.cor }} />
                  <span className="cfg-status-label">{s.rotulo}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CATEGORIA: NUMERAÇÃO ── */}
        {categoria === 'numeracao' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Máscara e Sequência Numérica</h2>
                <p className="cfg-secao__desc">Configure o formato padrão dos IDs gerados para cada BID.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', color: '#f1f5f9' }}>
                Prefixo do ID
                <input
                  type="text"
                  value={numeracaoConfig.prefixo}
                  onChange={e => setNumeracaoConfig(prev => ({ ...prev, prefixo: e.target.value }))}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </label>
              <ToggleRow
                id="num-ano"
                label="Incluir Ano Atual (EX: BID-2026-00001)"
                desc="Anexa o ano corrente ao ID numérico de cada cotação."
                checked={numeracaoConfig.incluirAno}
                onChange={v => setNumeracaoConfig(prev => ({ ...prev, incluirAno: v }))}
              />
            </div>
          </section>
        )}

        {/* ── CATEGORIA: TEMPLATES PDF ── */}
        {categoria === 'templates-pdf' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Templates PDF</h2>
                <p className="cfg-secao__desc">Personalize o design visual e fontes de relatórios em PDF de BIDs de Frete.</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label="SEUS TEMPLATES" count={`${templatesPdf.length} templates`} />

            <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
              {templatesPdf.map(tpl => (
                <div key={tpl.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#334155', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardText size={18} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{tpl.nome}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="cfg-eye-btn"
                      onClick={() => {
                        setEditandoTemplateId(tpl.id)
                        setTplNome(tpl.nome)
                        setTplConteudo(tpl.codigo_fonte)
                      }}
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      type="button"
                      className="cfg-remove-btn"
                      onClick={() => setTemplatesPdf(prev => prev.filter(t => t.id !== tpl.id))}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editandoTemplateId && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#1e293b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>Editar Template</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={tplNome}
                    onChange={e => setTplNome(e.target.value)}
                    style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                  />
                  <textarea
                    rows={4}
                    value={tplConteudo}
                    onChange={e => setTplConteudo(e.target.value)}
                    style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontFamily: 'monospace' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" className="cfg-btn-secundario cfg-btn-secundario--xs" onClick={() => setEditandoTemplateId(null)}>Cancelar</button>
                    <button type="button" className="cfg-btn-primario cfg-btn-primario--xs" onClick={() => {
                      if (!tplNome.trim()) return
                      setTemplatesPdf(prev => prev.map(t => t.id === editandoTemplateId ? { ...t, nome: tplNome, codigo_fonte: tplConteudo } : t))
                      setEditandoTemplateId(null)
                    }}>Salvar</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={() => {
                const newId = `tpl_${Date.now()}`
                setTemplatesPdf(prev => [...prev, { id: newId, nome: 'Novo Template PDF', documento_tipo: 'pdf', codigo_fonte: '<p>Novo</p>', created_at: new Date().toISOString() }])
              }}>
                <Plus size={14} /> Novo Template PDF
              </BotaoGlobal>
            </div>
          </section>
        )}

        {/* ── CATEGORIA: REGRAS ── */}
        {categoria === 'regras' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Regras de Negócio</h2>
                <p className="cfg-secao__desc">Configure as regras de envio, validação e automações do BID Frete Internacional.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ToggleRow
                id="reg-resp"
                label="Envio Automático aos Fornecedores"
                desc="Dispara o edital de BID instantaneamente aos parceiros preferenciais ao aprovar o rascunho."
                checked={regrasConfig.respostaAutomatica}
                onChange={v => setRegrasConfig(prev => ({ ...prev, respostaAutomatica: v }))}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Prazo Limite Padrão (Horas)</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Define o tempo limite recomendado para respostas dos fornecedores.</p>
                </div>
                <input
                  type="number"
                  value={regrasConfig.prazoPadraoHoras}
                  onChange={e => setRegrasConfig(prev => ({ ...prev, prazoPadraoHoras: Number(e.target.value) }))}
                  style={{ width: '80px', padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', textAlign: 'center' }}
                />
              </div>
              <ToggleRow
                id="reg-div"
                label="Alertar Divergências de Incoterms"
                desc="Mostra ícone de alerta caso um fornecedor responda com Incoterm diferente do solicitado no edital."
                checked={regrasConfig.alertasDivergencia}
                onChange={v => setRegrasConfig(prev => ({ ...prev, alertasDivergencia: v }))}
              />
            </div>
          </section>
        )}

        {/* ── CATEGORIA: CATEGORIAS ANEXOS ── */}
        {categoria === 'categorias-anexos' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Categorias de Anexo</h2>
                <p className="cfg-secao__desc">Configure as tags de anexo obrigatórias e opcionais para documentos anexados.</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label="CATEGORIAS REGISTRADAS" count={`${categoriasAnexos.length} categorias`} />

            <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
              {categoriasAnexos.map(anexo => (
                <div key={anexo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#334155', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Folder size={18} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{anexo.nome}</span>
                  </div>
                  {!anexo.sistema && (
                    <button
                      type="button"
                      className="cfg-remove-btn"
                      onClick={() => setCategoriasAnexos(prev => prev.filter(a => a.id !== anexo.id))}
                    >
                      <X size={12} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ex: Certificado de Origem"
                value={novoAnexoNome}
                onChange={e => setNovoAnexoNome(e.target.value)}
                style={{ flex: 1, padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }}
              />
              <BotaoGlobal variante="primario" tamanho="pequeno" onClick={() => {
                if (!novoAnexoNome.trim()) return
                const newId = `anexo_${Date.now()}`
                setCategoriasAnexos(prev => [...prev, { id: newId, nome: novoAnexoNome, sistema: false }])
                setNovoAnexoNome('')
              }}>
                <Plus size={14} /> Adicionar Categoria
              </BotaoGlobal>
            </div>
          </section>
        )}

        {/* ── CATEGORIA: TAXA DE CÂMBIO ── */}
        {categoria === 'taxa-cambio' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Boletim Cambial</h2>
                <p className="cfg-secao__desc">Configure as cotações das moedas de referência para as cotações internacionais de frete.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(taxasCambio).map(([moeda_ganho_bid_frete_internacional, valor]) => (
                <div key={moeda_ganho_bid_frete_internacional} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CurrencyCircleDollar size={20} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{moeda_ganho_bid_frete_internacional} / BRL</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={e => setTaxasCambio(prev => ({ ...prev, [moeda_ganho_bid_frete_internacional]: Number(e.target.value) }))}
                    style={{ width: '100px', padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', textAlign: 'center' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CATEGORIA: SNAPSHOT CADASTROS ── */}
        {categoria === 'snapshot-cadastros' && (
          <PedidoSnapshotCadastros />
        )}

        {/* ── CATEGORIA: NOTIFICAÇÕES ── */}
        {categoria === 'notificacoes' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Preferências de Notificação</h2>
                <p className="cfg-secao__desc">Ajuste os disparos e alertas de cotação de frete por email e WhatsApp.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ToggleRow
                id="not-resp"
                label="Fornecedor respondeu ao BID"
                desc="Notifica o analista quando armadores ou agentes enviam uma proposta de frete."
                checked={notificacoesConfig.respostaFornecedor}
                onChange={v => setNotificacoesConfig(prev => ({ ...prev, respostaFornecedor: v }))}
              />
              <ToggleRow
                id="not-nova"
                label="Nova Cotação Criada"
                desc="Avisa os fornecedores cadastrados que há um novo edital aberto para lances."
                checked={notificacoesConfig.novaCotacao}
                onChange={v => setNotificacoesConfig(prev => ({ ...prev, novaCotacao: v }))}
              />
              <ToggleRow
                id="not-exp"
                label="Cotação Expirada"
                desc="Notifica quando a data limite para cotação passou sem propostas aprovadas."
                checked={notificacoesConfig.cotacaoExpirada}
                onChange={v => setNotificacoesConfig(prev => ({ ...prev, cotacaoExpirada: v }))}
              />
            </div>
          </section>
        )}

        {/* ── CATEGORIA: EXPORTAÇÃO ── */}
        {categoria === 'exportacao' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Exportação de Relatórios</h2>
                <p className="cfg-secao__desc">Configure as preferências de download e layout de arquivos de propostas geradas.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Formato Padrão</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Selecione o formato padrão preferido para relatórios gerados.</p>
                </div>
                <select
                  value={exportConfig.formatoPadrao}
                  onChange={e => setExportConfig(prev => ({ ...prev, formatoPadrao: e.target.value as 'csv' | 'xlsx' | 'pdf' }))}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                >
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="csv">CSV delimitado</option>
                  <option value="pdf">PDF Compactado</option>
                </select>
              </div>
              <div className="cfg-divider" style={{ margin: '0.5rem 0' }} />
              <ToggleRow
                id="exp-prop"
                label="Incluir Histórico de Propostas"
                desc="Exporta todas as respostas do armador juntamente com a vencedora aprovada."
                checked={exportConfig.incluirPropostas}
                onChange={v => setExportConfig(prev => ({ ...prev, incluirPropostas: v }))}
              />
            </div>
          </section>
        )}

      </main>

      {/* ── Modais Auxiliares ── */}
      {criandoCard && (
        <ModalNovoCardUsuario
          onFechar={() => setCriandoCard(false)}
          onSalvo={card => {
            const metricDef = CARDS_CATALOGO.find(c => c.id === card.metricaId)
            if (!metricDef) return
            const newId = `card_${Date.now()}`
            registrarCardCustomizado({
              id: newId,
              campoBase: metricDef.campoBase,
              tipoAgg: metricDef.tipoAgg,
              origem: metricDef.origem,
              labelKey: card.nome.trim(),
              descKey: encodeMetricaCard(card.metricaId),
              descricao: metricDef.descricao,
              icone: card.icone,
              cor: card.cor,
            }, escopoCards)
            setPendingCardsPrefs(prev => {
              if (prev.some(p => p.id === newId)) return prev
              return [...prev, { id: newId, visible: true }]
            })
            setCriandoCard(false)
          }}
        />
      )}

      {criandoColuna && (
        <ModalNovaColunaUsuario
          onFechar={() => setCriandoColuna(false)}
          onSalvo={col => {
            const newId = `col_${Date.now()}`
            setColunasPersonalizadas(prev => [...prev, {
              id: newId,
              chave: col.nome.toLowerCase().replace(/\s+/g, '_'),
              nome: col.nome,
              tipo: col.tipo,
              escopo: col.escopo,
              visibilidade_cotacao_bid_frete_internacional: col.visibilidade_cotacao_bid_frete_internacional,
              obrigatorio: false,
              valor_padrao: '',
              descricao: 'Nova coluna personalizada',
              opcoes: [],
              formula_expressao: '',
              ativo: true
            }])
            if (tipoColunaUsaCasasDecimais(col.tipo)) {
              setPendingCasas(prev => ({
                ...prev,
                [newId]: PADRAO_CASAS_COLUNA_PERSONALIZADA,
              }))
            }
            setCriandoColuna(false)
          }}
        />
      )}
    </div>
  )
}

function GearSixWrapper() {
  return <GearSixIcon />
}

function GearSixIcon() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 15) % 360)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span style={{ display: 'inline-block', transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s ease-out' }}>
      <Sliders size={22} weight="duotone" />
    </span>
  )
}

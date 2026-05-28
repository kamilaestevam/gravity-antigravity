/**
 * Configuracoes.tsx — Configurações do BID Frete (Replica Pedido Premium)
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
  Paperclip, CurrencyCircleDollar, ArrowsClockwise, Clock, CaretDown, Info,
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
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import { useShellStore } from '@gravity/shell'
import { PaginaGlobal } from '@nucleo/pagina-global'
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
  registrarCardCustomizado,
  useCardPreferencesBidFrete,
  type CardDefinicao,
  type CardPeriodoCodigo,
  type CardPreferencia,
} from '../shared/use-card-preferences'
import {
  KANBAN_BF_CARD_GRUPOS,
  KANBAN_BF_CARD_PADRAO,
  KANBAN_BF_DATAS_CRITICAS,
  normalizarCardConfigBidFrete,
  type KanbanCardConfigBidFrete,
} from '../shared/kanban-bid-frete-card'
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

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total_cotacoes:        { icone: <Package           weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  valor_total_frete:     { icone: <CurrencyDollar    weight="duotone" size={18} />, cor: '#34d399' },
  propostas_recebidas:   { icone: <ClipboardText     weight="duotone" size={18} />, cor: '#60a5fa' },
  saving_total:          { icone: <Coins             weight="duotone" size={18} />, cor: '#fb923c' },
  tempo_medio_resposta:  { icone: <Gauge             weight="duotone" size={18} />, cor: '#a78bfa' },
  cotacoes_expiradas:    { icone: <Warning           weight="duotone" size={18} />, cor: '#f87171' },
}

const NOME_EXIBICAO_CARDS: Record<string, string> = {
  total_cotacoes: 'Total de Cotações',
  valor_total_frete: 'Valor Total de Frete',
  propostas_recebidas: 'Propostas Recebidas',
  saving_total: 'Saving Total',
  tempo_medio_resposta: 'Tempo Médio de Resposta',
  cotacoes_expiradas: 'Cotações Expiradas',
}

function obterNomeExibicaoCard(card: CardDefinicao): string {
  return NOME_EXIBICAO_CARDS[card.id] || card.labelKey
}

const SIDEBAR_ITEMS = [
  { tipo: 'grupo',  label: 'VISUALIZAÇÕES', labelKey: 'bidfrete.config.sidebar.grupo_visualizacoes' },
  { tipo: 'item',   id: 'cards',                 label: 'Cards',             labelKey: 'bidfrete.config.sidebar.cards',             icone: <SquaresFour size={15} weight="duotone" />, ativo: true },
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
  
  { tipo: 'grupo',  label: 'BID FRETE',          labelKey: 'bidfrete.config.sidebar.grupo_bidfrete' },
  { tipo: 'item',   id: 'status',                label: 'Status',            labelKey: 'bidfrete.config.sidebar.status',            icone: <Tag size={15} weight="duotone" />, ativo: true },
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
  const visual = CARD_VISUAL[pref.id] ?? {
    icone: <Package weight="duotone" size={18} />,
    cor: def.cor ?? 'var(--ws-accent, #818cf8)',
  }
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

        {status.is_sistema && (
          <span className="cfg-badge-sistema">sistema</span>
        )}

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
          {!status.is_sistema && (
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
          )}
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

// ─── Modal Novo Card ─────────────────────────────────────────────────────────────

function ModalNovoCardUsuario({
  onFechar, onSalvo
}: {
  onFechar: () => void
  onSalvo: (card: { nome: string; icone: string; cor: string; formula_expressao: string }) => void
}) {
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('Package')
  const [cor, setCor] = useState('#818cf8')
  const [formula, setFormula] = useState('')

  const ICONES = ['Package', 'CurrencyDollar', 'Scales', 'Warning', 'CheckCircle', 'Coins', 'ClipboardText', 'Gauge']
  const CORES = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#fb923c']

  const handleSalvar = () => {
    if (!nome.trim()) return
    onSalvo({ nome, icone, cor, formula_expressao: formula })
  }

  return (
    <div className="mcu-overlay" onClick={onFechar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="mcu-modal" onClick={e => e.stopPropagation()} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: '420px' }}>
        <h3 className="mcu-header__titulo" style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>Novo Card Personalizado</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            Nome do Card
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }} />
          </label>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Ícone
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {ICONES.map(ic => (
                <button key={ic} type="button" onClick={() => setIcone(ic)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid transparent', background: icone === ic ? '#818cf8' : '#334155', color: '#f1f5f9', cursor: 'pointer' }}>
                  {ic.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Cor
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {CORES.map(c => (
                <button key={c} type="button" onClick={() => setCor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: cor === c ? '2px solid white' : 'none', background: c, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            Fórmula Simplificada
            <input type="text" placeholder="Ex: valor_frete_proposta_bid_frete_internacional * 1.05" value={formula} onChange={e => setFormula(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }} />
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

  const tabParam = searchParams.get('tab') as string | null
  const [categoria, setCategoria] = useState<string>(tabParam ?? 'cards')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'colunas-casas-decimais': COLUNAS_FILHOS.includes(tabParam as typeof COLUNAS_FILHOS[number]),
    'kanban': ['kanban-colunas', 'kanban-card', 'kanban-modal'].includes(tabParam ?? ''),
  })

  // ─── Mocks & Persistence Hook ─────────────────────────────────────────────────

  const useConfigState = <T,>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>, T, () => void, () => void, boolean] => {
    const storageKey = `bid-frete:config:${key}`
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
    prefs: cardsPref,
    catalogo: cardsCatalogo,
    disponiveis: cardsDisponiveis,
    periodo: periodoCards,
    setPeriodo: setPeriodoCards,
    adicionar: adicionarCard,
    remover: removerCard,
    toggle: toggleCard,
    reordenar: reordenarCards,
    resetar: resetarCards,
  } = useCardPreferencesBidFrete()

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

  const [statusList, setStatusList] = useConfigState<PedidoStatusConfig[]>('status', [
    { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: true },
    { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: true },
    { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: true },
    { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: true },
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
        { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: true },
        { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: true },
        { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: true },
        { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: true },
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
  const [kanbanCardConfig, setKanbanCardConfig] = useConfigState<KanbanCardConfigBidFrete>(
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
    const oldIdx = cardsPref.findIndex(p => p.id === active.id)
    const newIdx = cardsPref.findIndex(p => p.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    reordenarCards(arrayMove(cardsPref, oldIdx, newIdx))
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
  }, [])

  const kanbanCardSetDataCritica = useCallback((valor: string | null) => {
    setKanbanCardConfig(prev => ({ ...prev, dataCritica: valor }))
  }, [])

  const handleDragEndStatus = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setStatusList(prev => {
      const oldIdx = prev.findIndex(p => p.id === active.id)
      const newIdx = prev.findIndex(p => p.id === over.id)
      const reordered = arrayMove(prev, oldIdx, newIdx)
      return reordered.map((s, idx) => ({ ...s, ordem: idx + 1 }))
    })
  }

  return (
    <PaginaGlobal
      className="bf-configuracoes bid-frete-page-shell"
    >
      <div className="cfg-page">
        {/* ── Sidebar ── */}
        <aside className="cfg-sidebar">
        <nav className="cfg-sidebar__nav">
          {SIDEBAR_ITEMS.map((item, idx) => {
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
                    {SIDEBAR_ITEMS.filter(s => s.tipo === 'sub' && s.id && item.filhos?.includes(s.id)).map(sub => {
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
                  <h2 className="cfg-secao__titulo">Meus Cards</h2>
                  <p className="cfg-secao__desc">Defina quais cards numéricos aparecem no topo da tela, ordene e oculte os não utilizados.</p>
                </div>
                <button type="button" className="cfg-btn-header--restaurar" onClick={resetarCards}>
                  <ArrowCounterClockwise size={13} weight="bold" />
                  Restaurar padrão
                </button>
              </div>

              {/* Período */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p className="cfg-list-section-label" style={{ marginBottom: '0.5rem' }}>Período de Comparação</p>
                <div className="cfg-periodo-pills">
                  {PERIODOS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`cfg-periodo-pill ${periodoCards === p.id ? 'cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setPeriodoCards(p.id)}
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
                  {cardsPref.map((pref, i) => {
                    const card = cardsCatalogo.find(c => c.id === pref.id)
                    if (!card) return null
                    return (
                      <div key={card.id} className={`cfg-kpi-preview-card ${!pref.visible ? 'cfg-kpi-preview-card--oculto' : ''}`}>
                        <span className="cfg-kpi-preview-card__pos">{i + 1}</span>
                        <div className="cfg-kpi-preview-card__icon" style={{ color: CARD_VISUAL[card.id]?.cor }}>
                          {CARD_VISUAL[card.id]?.icone}
                        </div>
                        <div className="cfg-kpi-preview-card__line" style={{ background: CARD_VISUAL[card.id]?.cor }} />
                        <p className="cfg-kpi-preview-card__label">{obterNomeExibicaoCard(card)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Ativos List (DnD Context) */}
              <ConfiguracaoSecaoGlobal label="ATIVOS" count={`${cardsPref.length} cards`} />
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndCards}>
                <SortableContext items={cardsPref.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
                    {cardsPref.map(pref => {
                      const def = cardsCatalogo.find(c => c.id === pref.id)
                      if (!def) return null
                      return (
                        <CardSortavel
                          key={pref.id}
                          pref={pref}
                          def={def}
                          periodoAtivo={periodoCards}
                          onToggle={() => toggleCard(pref.id)}
                          onRemover={() => removerCard(pref.id)}
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
                    periodoAtivo={periodoCards}
                    onAdicionar={() => adicionarCard(def.id)}
                  />
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={() => setCriandoCard(true)}>
                  <Plus size={14} weight="bold" /> Adicionar card KPI customizado
                </BotaoGlobal>
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
                </>
              )
            })()}
          </section>
        )}

        {/* ── CATEGORIA: KANBAN MODAL ── */}
        {categoria === 'kanban-modal' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Campos do Modal Rápido</h2>
                <p className="cfg-secao__desc">Decida quais informações da cotação são editáveis no modal pop-up lateral.</p>
              </div>
            </div>
            <p className="cfg-hint">Todas as informações completas continuam acessíveis através do botão Detalhes na cotação.</p>
          </section>
        )}

        {/* ── CATEGORIA: STATUS ── */}
        {categoria === 'status' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Gerenciar Status</h2>
                <p className="cfg-secao__desc">Configure, ordene e crie status customizados para as suas cotações.</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label="STATUS ATIVOS" count={`${statusList.length} status`} />

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndStatus}>
              <SortableContext items={statusList.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
                  {statusList.map(s => (
                    <StatusSortavel
                      key={s.id}
                      status={s}
                      editandoId={editandoStatusId}
                      editLabel={editStatusLabel}
                      editCor={editStatusCor}
                      onIniciarEdicao={status => {
                        setEditandoStatusId(status.id)
                        setEditStatusLabel(status.rotulo)
                        setEditStatusCor(status.cor)
                      }}
                      onSalvarEdicao={() => {
                        if (!editStatusLabel.trim()) return
                        setStatusList(prev => prev.map(s => s.id === editandoStatusId ? { ...s, rotulo: editStatusLabel, cor: editStatusCor } : s))
                        setEditandoStatusId(null)
                      }}
                      onCancelarEdicao={() => setEditandoStatusId(null)}
                      onChangeLabel={setEditStatusLabel}
                      onChangeCor={setEditStatusCor}
                      onExcluir={id => setStatusList(prev => prev.filter(x => x.id !== id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ex: Em Análise do Armador"
                value={editStatusLabel}
                onChange={e => setEditStatusLabel(e.target.value)}
                style={{ flex: 1, padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }}
              />
              <input
                type="color"
                value={editStatusCor}
                onChange={e => setEditStatusCor(e.target.value)}
                style={{ width: '40px', height: '34px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
              <BotaoGlobal variante="primario" tamanho="pequeno" onClick={() => {
                if (!editStatusLabel.trim()) return
                const newId = `status_${Date.now()}`
                setStatusList(prev => [...prev, { id: newId, nome: editStatusLabel.toUpperCase().replace(/\s+/g, '_'), rotulo: editStatusLabel, cor: editStatusCor, ordem: prev.length + 1, is_sistema: false }])
                setEditStatusLabel('')
              }}>
                <Plus size={14} /> Adicionar Status
              </BotaoGlobal>
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
                <p className="cfg-secao__desc">Configure as regras de envio, validação e automações do BID Frete.</p>
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
      </div>

      {/* ── Modais Auxiliares ── */}
      {criandoCard && (
        <ModalNovoCardUsuario
          onFechar={() => setCriandoCard(false)}
          onSalvo={card => {
            const newId = `card_${Date.now()}`
            registrarCardCustomizado({
              id: newId,
              campoBase: 'valor_total_proposta_bid_frete_internacional',
              tipoAgg: 'Soma',
              origem: 'Proposta',
              labelKey: card.nome.trim(),
              descKey: card.formula_expressao.trim() || card.nome.trim(),
              descricao: card.formula_expressao.trim() || 'Card customizado pelo usuário',
              icone: card.icone,
              cor: card.cor,
            })
            adicionarCard(newId)
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
    </PaginaGlobal>
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

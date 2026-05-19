/**
 * Configuracoes.tsx — Página de configurações do produto Pedido
 *
 * Categorias:
 *  ├── Cards              ← DnD + toggle + período padrão + catálogo de colunas
 *  ├── Tabela             ← linhas por página, flags de exibição
 *  ├── Colunas            ← casas decimais + criar coluna personalizada
 *  ├── Status             ← criar / editar / reordenar / excluir status de pedido
 *  ├── Notificações       ← toggles de alertas
 *  ├── Exportação         ← formato padrão, flags de exportação
 *  ├── Numeração          ← prefixo, ano, sequência, reinício
 *  ├── Templates PDF      ← listar / criar / editar / excluir templates Handlebars
 *  ├── Regras             ← regras de negócio (duplicar, excluir, transferir, consolidar)
 *  └── Categorias Anexos  ← gerenciar categorias de anexo
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
import { useCardPreferences, CARDS_CATALOGO, type CardPreferencia, type CardDefinicao } from '../shared/useCardPreferences'
import { ICONE_CUSTOM_MAP } from '../shared/cardRegistry'
import { useCardsUsuario } from '../shared/useCardsUsuario'
import { ModalNovoCardUsuario } from '../components/ConfiguracaoCards/ModalNovoCardUsuario'
import type { CardUsuario } from '../shared/types'
import { TaxasMoedaResponseSchema, HistoricoTaxasResponseSchema, SyncTaxasResponseSchema, type BoletimCambio } from '../shared/useTaxasCambio'
import { templatePedidoApi, colunasUsuarioApi, configRegrasApi, kanbanConfigApi, pedidoConfigApi, casasDecimaisApi, saldoFormulaApi, obterSnapshotAtualizacaoPolicy, salvarSnapshotAtualizacaoPolicy, SNAPSHOT_ATUALIZACAO_DEFAULT, type TemplateLocal } from '../shared/api'
import type { SnapshotAtualizacaoPolicy } from '../shared/types'
import { FORMATOS_DATA, setFormatoData, getFormatoData, type FormatoData } from '../shared/useFormatoData'

const FMT_REGIAO_KEYS: Record<string, string> = {
  'DD/MM/AAAA': 'brasil_europa',
  'MM/DD/AAAA': 'eua',
  'AAAA-MM-DD': 'iso_asia',
  'DD.MM.AAAA': 'alemanha_russia',
  'DD/MM/AA':   'compacto',
}
import { SecaoKanbanColunas } from './SecaoKanbanColunas'
import type { KanbanPreferencias, KanbanCampoConfig, KanbanCampoDisponivel, PedidoStatusConfig } from '../shared/types'
import { KANBAN_LIMITES, KANBAN_PADRAO, KANBAN_CAMPOS_DISPONIVEIS, KANBAN_CARD_CAMPOS_DISPONIVEIS, KANBAN_CARD_GRUPOS } from '../shared/types'
import { ModalNovaColunaUsuario } from '../components/ConfiguracaoColunas/ModalNovaColunaUsuario'
import { parsearFormula, detectarCircular } from '../shared/formulaEngine'
import type { FormulaAST } from '../shared/formulaEngine'
import { analisarSemanticaFormula, SEMANTICA_CAMPOS } from '../shared/gabiSemantica'
import type {
  ColunaUsuario as ColunaUsuarioApi,
  TipoColunaUsuario,
  EscopoColunaUsuario,
  VisibilidadeColunaUsuario,
} from '../shared/types'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import { useShellStore } from '@gravity/shell'
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
import { PedidoSnapshotCadastros } from './configuracoes/PedidoSnapshotCadastros'
import './Configuracoes.css'

// ─── Mapa visual dos cards ────────────────────────────────────────────────────

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total_pedidos:        { icone: <Package           weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  valor_total:          { icone: <CurrencyDollar    weight="duotone" size={18} />, cor: '#34d399' },
  valor_total_brl:      { icone: <CurrencyCircleDollar weight="duotone" size={18} />, cor: '#34d399' },
  qtd_total:            { icone: <Scales            weight="duotone" size={18} />, cor: '#fbbf24' },
  pedidos_atrasados:    { icone: <Warning           weight="duotone" size={18} />, cor: '#f87171' },
  pedidos_abertos:      { icone: <ClipboardText     weight="duotone" size={18} />, cor: '#60a5fa' },
  pedidos_em_andamento: { icone: <ArrowRight        weight="duotone" size={18} />, cor: '#a78bfa' },
  cobertura_pendente:   { icone: <Coins             weight="duotone" size={18} />, cor: '#fb923c' },
  itens_prontos:        { icone: <CheckCircle       weight="duotone" size={18} />, cor: '#34d399' },
  qtd_atual_total:      { icone: <Gauge             weight="duotone" size={18} />, cor: '#38bdf8' },
  qtd_transferida_total:{ icone: <ArrowsLeftRight   weight="duotone" size={18} />, cor: '#a3e635' },
  qtd_inicial_total:    { icone: <StackSimple       weight="duotone" size={18} />, cor: '#94a3b8' },
  valor_itens_total:    { icone: <Money             weight="duotone" size={18} />, cor: '#f59e0b' },
}

const PERIODOS = [
  { id: '7d',   label: '7 dias'  },
  { id: '30d',  label: '30 dias' },
  { id: '6m',   label: '6 meses' },
  { id: '1a',   label: '1 ano'   },
  { id: 'tudo', label: 'Tudo'    },
]

// ─── Item sortável (DnD) ──────────────────────────────────────────────────────

function CardSortavel({
  pref, onToggle, onRemover, periodoAtivo,
}: {
  pref: CardPreferencia
  onToggle: () => void
  onRemover: () => void
  periodoAtivo: string
}) {
  const { t } = useTranslation()
  const def    = CARDS_CATALOGO.find(c => c.id === pref.id)!
  const visual = CARD_VISUAL[pref.id]
  const [detalheAberto, setDetalheAberto] = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: pref.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 999 : undefined,
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
            <p className="cfg-card-row__nome">{t(def.labelKey)}</p>
            <p className="cfg-card-row__desc">{subtitulo}</p>
          </div>
        </div>

        <span className="cfg-origem-badge cfg-origem-badge--meus">{t(`pedido.config.cards.origem_${def.origem.toLowerCase()}`)}</span>

        <TooltipGlobal descricao={t('pedido.config.cards.tooltip_detalhes')}>
          <button
            type="button"
            className={`cfg-eye-btn${detalheAberto ? ' cfg-eye-btn--on' : ''}`}
            onClick={() => setDetalheAberto(v => !v)}
            aria-label="Ver detalhes do card"
          >
            <Info size={15} weight="bold" />
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao={pref.visible ? t('pedido.config.cards.tooltip_ocultar') : t('pedido.config.cards.tooltip_exibir')}>
          <button
            type="button"
            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
            onClick={onToggle}
            aria-label={pref.visible ? t('pedido.config.cards.tooltip_ocultar') : t('pedido.config.cards.tooltip_exibir')}
          >
            {pref.visible
              ? <Eye      size={15} weight="bold" />
              : <EyeSlash size={15} weight="bold" />
            }
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao={t('pedido.config.cards.tooltip_remover')}>
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

// ─── Card disponível (catálogo, com painel de detalhe) ───────────────────────

function CardDisponivel({
  def, onAdicionar, periodoAtivo,
}: {
  def: CardDefinicao
  onAdicionar: () => void
  periodoAtivo: string
}) {
  const { t } = useTranslation()
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
            <p className="cfg-card-row__nome">{t(def.labelKey)}</p>
            <p className="cfg-card-row__desc">{t(def.descKey)}</p>
          </div>
        </div>
        <span className={`cfg-origem-badge ${def.origem === 'Pedido' ? 'cfg-origem-badge--pedido' : 'cfg-origem-badge--item'}`}>
          {t(`pedido.config.cards.origem_${def.origem.toLowerCase()}`)}
        </span>
        <span className="cfg-agg-badge">{t(`pedido.config.cards.agg_${def.tipoAgg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}`)}</span>
        <TooltipGlobal descricao={t('pedido.config.cards.tooltip_detalhes')}>
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

// ─── Coluna sortável (DnD — Colunas Personalizadas) ──────────────────────────

function ColunaSortavel({
  col, onToggleAtivo, onRemover, onEditar, editando,
}: {
  col: import('../shared/types').ColunaUsuario
  onToggleAtivo: () => void
  onRemover: () => void
  onEditar: () => void
  editando: boolean
}) {
  const tipoInfo = [
    { id: 'texto', label: 'Texto' }, { id: 'numero', label: 'Numérico' },
    { id: 'data', label: 'Data' }, { id: 'percentual', label: 'Percentual %' },
    { id: 'select', label: 'Select/Lista' }, { id: 'checkbox', label: 'Checkbox' },
    { id: 'tipo_documento', label: 'Tipo Documento' }, { id: 'formula', label: 'Fórmula' },
    { id: 'anexo', label: 'Anexo' },
  ].find(t => t.id === col.tipo)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: col.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 999 : undefined,
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
    zIndex:  isDragging ? 999 : undefined,
  }

  const { t } = useTranslation()
  const isEditando = editandoId === status.id

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`cfg-status-row${isEditando ? ' cfg-status-row--editando' : ''}`}>
        <button
          type="button"
          className="cfg-drag-handle"
          {...attributes}
          {...listeners}
          aria-label={t('pedido.config.acao.arrastar')}
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <span
          className="cfg-status-dot"
          style={{ background: status.cor }}
        />

        <span className="cfg-status-label">{status.rotulo}</span>

        {status.is_sistema && (
          <span className="cfg-badge-sistema">{t('pedido.config.status.badge_sistema')}</span>
        )}

        <div className="cfg-status-acoes">
          <TooltipGlobal descricao={t('pedido.config.status.editar_tooltip')}>
            <button
              type="button"
              className="cfg-eye-btn"
              onClick={() => onIniciarEdicao(status)}
              aria-label={t('pedido.config.status.aria_editar')}
            >
              <PencilSimple size={14} weight="bold" />
            </button>
          </TooltipGlobal>
          {!status.is_sistema && (
            <TooltipGlobal descricao={t('pedido.config.status.excluir_tooltip')}>
              <button
                type="button"
                className="cfg-remove-btn"
                onClick={() => onExcluir(status.id)}
                aria-label={t('pedido.config.status.aria_excluir')}
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
              placeholder={t('pedido.config.status.placeholder_nome')}
              value={editLabel}
              onChange={e => onChangeLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSalvarEdicao() }}
              autoFocus
            />
            <div className="cfg-status-color-picker">
              <span className="cfg-status-color-label">{t('pedido.config.status.cor')}</span>
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
              {t('pedido.config.acao.salvar')}
            </button>
            <button type="button" className="cfg-btn-secundario cfg-btn-secundario--xs" onClick={onCancelarEdicao}>
              {t('pedido.config.acao.cancelar')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sidebar hierárquica ───────────────────────────────────────────────────────

type SidebarItemTipo =
  | { tipo: 'item';   id: string; label: string; labelKey: string; icone: React.ReactNode; ativo: boolean }
  | { tipo: 'grupo';  label: string; labelKey: string }
  | { tipo: 'parent'; id: string; label: string; labelKey: string; icone: React.ReactNode; ativo: boolean; filhos: string[] }
  | { tipo: 'sub';    id: string; label: string; labelKey: string; icone: React.ReactNode; ativo: boolean }

const KANBAN_FILHOS  = ['kanban-colunas', 'kanban-card', 'kanban-modal']
const COLUNAS_FILHOS = ['colunas-casas-decimais', 'colunas-formato-data', 'colunas-personalizadas', 'colunas-campos-calculados']

const SIDEBAR_ITEMS: SidebarItemTipo[] = [
  // ── VISUALIZAÇÕES ──────────────────────────────────────────────────────────
  { tipo: 'grupo',  label: 'VISUALIZAÇÕES', labelKey: 'pedido.config.sidebar.grupo_visualizacoes' },
  { tipo: 'item',   id: 'cards',                          label: 'Cards',             labelKey: 'pedido.config.sidebar.cards',             icone: <SquaresFour          size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'tabela',                         label: 'Tabela',            labelKey: 'pedido.config.sidebar.tabela',            icone: <Table                size={15} weight="duotone" />, ativo: true },
  { tipo: 'parent', id: 'colunas-casas-decimais',         label: 'Colunas',           labelKey: 'pedido.config.sidebar.colunas',           icone: <Columns              size={15} weight="duotone" />, ativo: true, filhos: COLUNAS_FILHOS },
  { tipo: 'sub',    id: 'colunas-casas-decimais',         label: 'Casas Decimais',    labelKey: 'pedido.config.sidebar.casas_decimais',    icone: <Hash                 size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-formato-data',           label: 'Formato de Data',   labelKey: 'pedido.config.sidebar.formato_data',      icone: <CalendarBlank        size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-personalizadas',         label: 'Personalizadas',    labelKey: 'pedido.config.sidebar.personalizadas',    icone: <Columns              size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-campos-calculados',      label: 'Campos Calculados', labelKey: 'pedido.config.sidebar.campos_calculados', icone: <MathOperations       size={15} weight="duotone" />, ativo: true },
  { tipo: 'parent', id: 'kanban',                         label: 'Kanban',            labelKey: 'pedido.config.sidebar.kanban',            icone: <Columns              size={15} weight="duotone" />, ativo: true, filhos: KANBAN_FILHOS },
  { tipo: 'sub',    id: 'kanban-colunas',                 label: 'Colunas',           labelKey: 'pedido.config.sidebar.kanban_colunas',    icone: <Sliders              size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'kanban-card',                    label: 'Card',              labelKey: 'pedido.config.sidebar.card',              icone: <SquaresFour          size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'kanban-modal',                   label: 'Modal',             labelKey: 'pedido.config.sidebar.modal',             icone: <Columns              size={15} weight="duotone" />, ativo: true },
  // ── PEDIDO ─────────────────────────────────────────────────────────────────
  { tipo: 'grupo',  label: 'PEDIDO', labelKey: 'pedido.config.sidebar.grupo_pedido' },
  { tipo: 'item',   id: 'status',            label: 'Status',         labelKey: 'pedido.config.sidebar.status',         icone: <Tag                  size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'numeracao',         label: 'Numeração',      labelKey: 'pedido.config.sidebar.numeracao',      icone: <Hash                 size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'templates-pdf',     label: 'Templates PDF',  labelKey: 'pedido.config.sidebar.templates_pdf',  icone: <FloppyDisk           size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'regras',            label: 'Regras',         labelKey: 'pedido.config.sidebar.regras',         icone: <Sliders              size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'categorias-anexos', label: 'Categ. Anexos',  labelKey: 'pedido.config.sidebar.categ_anexos',   icone: <Folder               size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'taxa-cambio',       label: 'Taxa de Câmbio', labelKey: 'pedido.config.sidebar.taxa_cambio',    icone: <CurrencyCircleDollar size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'snapshot-cadastros',label: 'Cadastros',      labelKey: 'pedido.config.sidebar.snapshot_cadastros', icone: <ArrowsClockwise     size={15} weight="duotone" />, ativo: true },
  // ── SISTEMA ────────────────────────────────────────────────────────────────
  { tipo: 'grupo',  label: 'SISTEMA', labelKey: 'pedido.config.sidebar.grupo_sistema' },
  { tipo: 'item',   id: 'notificacoes',      label: 'Notificações',   labelKey: 'pedido.config.sidebar.notificacoes',   icone: <Bell                 size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'exportacao',        label: 'Exportação',     labelKey: 'pedido.config.sidebar.exportacao',     icone: <DownloadSimple       size={15} weight="duotone" />, ativo: true },
]

type CategoriaId = string

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface TabelaConfig {
  linhasPorPagina: 25 | 50 | 100 | 200
  destacarAtrasados: boolean
}

interface NotificacoesConfig {
  pedidoAtrasado: boolean
  novoPedido: boolean
  itemTransferido: boolean
  pedidoExcluido: boolean
  importacaoConcluida: boolean
}

interface ExportacaoConfig {
  formatoPadrao: 'csv' | 'xlsx' | 'pdf'
  incluirColunasUsuario: boolean
  incluirItens: boolean
  apenasSelection: boolean
  incluirCabecalho: boolean
  separadorCsv: 'virgula' | 'ponto-virgula' | 'tab'
}

interface NumeracaoConfig {
  prefixo: string
  incluirAno: boolean
  digitosSequencia: number
  reiniciar: 'nunca' | 'ano' | 'mes'
  automaticoCriar: boolean
  automaticoDuplicar: boolean
  automaticoConsolidar: boolean
}

interface RegrasConfig {
  duplicar: {
    copiarDatas: boolean
    numeracaoAutomatica: boolean
    statusInicial: 'rascunho' | 'aberto' | 'em_andamento'
    duplicarItens: boolean
  }
  duplicarItem: {
    numeracaoAutomatica: boolean
    copiarDatas: boolean
    copiarDados: boolean
  }
  excluir: {
    statusPermitidos: string[]
    semItensPermitido: boolean
    confirmarComPreview: boolean
  }
  transferir: {
    encerrarOrigemZero: boolean
    excluirItemOrigemZero: boolean
    excluirPedidoOrigemZero: boolean
    bloquearTransferenciaAcimaInicial: boolean
  }
  consolidar: {
    avisosDivergentes: boolean
    fundirPartNumber: boolean
    usuarioEscolheDivergentes: boolean
    numeroPedidoResultante: 'mais_antigo' | 'automatico' | 'mais_recente'
  }
  alertas: {
    numeroDuplicado: boolean
    valorTotalDivergente: boolean
    quantidadeTotalDivergente: boolean
    quantidadeProntaDivergente: boolean
    pesoLiquidoDivergente: boolean
    pesoBrutoDivergente: boolean
    cubagemDivergente: boolean
  }
}

interface CategoriaAnexo {
  id: string
  nome: string
  sistema: boolean
}

// ─── Tipos para colunas personalizadas ───────────────────────────────────────

interface NovaColuna {
  nome: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade: VisibilidadeColunaUsuario
  obrigatorio: boolean
  valor_padrao: string
  descricao: string
  opcoes: string[]
  formula_expressao: string
}

// ─── Colunas numéricas nativas — casas decimais ───────────────────────────────

// Spec: mapas_pedido.pdf — apenas grupo PEDIDO; itens herdam automaticamente
const COLUNAS_NUMERICAS = [
  { campo: 'valor_total_pedido',                    label: 'Valor Total do Pedido',          categoria: 'Pedido', padrao: 2, itemHint: 'Itens: Valor Total do Item terá as mesmas casas' },
  { campo: 'valor_por_unidade_item',                   label: 'Valor do Item',                  categoria: 'Pedido', padrao: 2, itemHint: null },
  { campo: 'quantidade_total_pedido',       label: 'Qtd. Inicial do Pedido',         categoria: 'Pedido', padrao: 2, itemHint: 'Itens: Qtd. Inicial, Transferida e Cancelada do item terão as mesmas casas' },
  { campo: 'quantidade_pronta_pedido_total',        label: 'Qtd. Pronta do Pedido',          categoria: 'Pedido', padrao: 2, itemHint: null },
  { campo: 'saldo_itens_do_pedido',                 label: 'Saldo do Pedido',                categoria: 'Pedido', padrao: 2, itemHint: null },
  { campo: 'quantidade_transferida_total',          label: 'Qtd. Transferida do Pedido',     categoria: 'Pedido', padrao: 2, itemHint: null },
  { campo: 'quantidade_cancelada_total_pedido',     label: 'Qtd. Cancelada do Pedido',       categoria: 'Pedido', padrao: 2, itemHint: null },
  { campo: 'peso_liquido_total_pedido',             label: 'Peso Líquido Total do Pedido',   categoria: 'Pedido', padrao: 3, itemHint: 'Itens: Peso Líquido Unitário do item terá as mesmas casas' },
  { campo: 'peso_bruto_total_pedido',               label: 'Peso Bruto Total do Pedido',     categoria: 'Pedido', padrao: 3, itemHint: 'Itens: Peso Bruto Unitário do item terá as mesmas casas' },
  { campo: 'cubagem_total_pedido',                  label: 'Cubagem Total do Pedido',        categoria: 'Pedido', padrao: 3, itemHint: 'Itens: Cubagem Unitária do item terá as mesmas casas' },
] as const

const TIPOS_COLUNA: { id: TipoColunaUsuario; label: string; icone: React.ReactNode }[] = [
  { id: 'texto',          label: 'Texto',         icone: <TextT          size={16} weight="duotone" /> },
  { id: 'numero',         label: 'Numérico',      icone: <Hash           size={16} weight="duotone" /> },
  { id: 'data',           label: 'Data',          icone: <CalendarBlank  size={16} weight="duotone" /> },
  { id: 'percentual',     label: 'Percentual %',  icone: <Percent        size={16} weight="duotone" /> },
  { id: 'select',         label: 'Select/Lista',  icone: <ListBullets    size={16} weight="duotone" /> },
  { id: 'checkbox',       label: 'Checkbox',      icone: <CheckSquare    size={16} weight="duotone" /> },
  { id: 'tipo_documento', label: 'Tipo Documento',icone: <Tag            size={16} weight="duotone" /> },
  { id: 'formula',        label: 'Fórmula',        icone: <MathOperations size={16} weight="duotone" /> },
  { id: 'anexo',          label: 'Anexo',           icone: <Paperclip      size={16} weight="duotone" /> },
]

const VISIBILIDADE_OPCOES: { valor: VisibilidadeColunaUsuario; label: string; descricao: string }[] = [
  { valor: 'todos',   label: 'Todos',           descricao: 'Visível para todos os usuários'             },
  { valor: 'roles',   label: 'Por perfil/role', descricao: 'Visível apenas para os perfis selecionados' },
  { valor: 'privado', label: 'Só eu',           descricao: 'Coluna visível apenas para você'            },
]

const TABELA_CONFIG_KEY = 'pedido:tabela_config'

const TABELA_CONFIG_PADRAO: TabelaConfig = {
  linhasPorPagina: 100,
  destacarAtrasados: true,
}

function carregarTabelaConfig(): TabelaConfig {
  try {
    const raw = localStorage.getItem(TABELA_CONFIG_KEY)
    if (raw) return { ...TABELA_CONFIG_PADRAO, ...JSON.parse(raw) as Partial<TabelaConfig> }
  } catch { /* ignore */ }
  return { ...TABELA_CONFIG_PADRAO }
}

const EXPORT_CONFIG_KEY = 'pedido:export_config'

function carregarExportConfig(): ExportacaoConfig {
  try {
    const raw = localStorage.getItem(EXPORT_CONFIG_KEY)
    if (raw) return JSON.parse(raw) as ExportacaoConfig
  } catch { /* ignore */ }
  return { formatoPadrao: 'xlsx', incluirColunasUsuario: true, incluirItens: true, apenasSelection: false, incluirCabecalho: true, separadorCsv: 'ponto-virgula' }
}

const CASAS_KEY     = 'pedido:casas_decimais'
const CASAS_VERSION = 2  // bump quando os defaults mudarem — invalida dados antigos

function carregarCasasDecimais(): Record<string, number> {
  const defaults = Object.fromEntries(COLUNAS_NUMERICAS.map(c => [c.campo, c.padrao]))
  try {
    const raw = localStorage.getItem(CASAS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number> & { _v?: number }
      if (parsed._v === CASAS_VERSION) {
        const { _v, ...values } = parsed
        return { ...defaults, ...values }
      }
      // Versão antiga — ignora e começa do zero com defaults novos
    }
  } catch { /* ignore */ }
  return defaults
}

const NOVA_COLUNA_PADRAO: NovaColuna = {
  nome: '',
  tipo: 'texto',
  escopo: 'ambos',
  visibilidade: 'todos',
  obrigatorio: false,
  valor_padrao: '',
  descricao: '',
  opcoes: [],
  formula_expressao: '',
}

// ── Alias de campos — nomes amigáveis para os editores de fórmula ─────────────
// Aliases são os identificadores que o usuário vê/digita; chaves são os nomes internos.
// Sorted longest-chave-first to avoid partial replacements on chave→alias.
const FORMULA_ALIAS_MAP = [
  { chave: 'quantidade_total_pedido',      alias: 'quantidade_inicial',     label: 'Quantidade Inicial' },
  { chave: 'quantidade_cancelada_total_pedido',    alias: 'quantidade_cancelada',   label: 'Quantidade Cancelada' },
  { chave: 'quantidade_transferida_total',         alias: 'quantidade_transferida', label: 'Quantidade Transferida' },
  { chave: 'quantidade_pronta_itens_pedido_total', alias: 'quantidade_pronta',      label: 'Quantidade Pronta' },
  { chave: 'saldo_itens_do_pedido',                alias: 'saldo',                  label: 'Saldo' },
  { chave: 'peso_liquido_total_pedido',            alias: 'peso_liquido',           label: 'Peso Líquido' },
  { chave: 'peso_bruto_total_pedido',              alias: 'peso_bruto',             label: 'Peso Bruto' },
  { chave: 'cubagem_total_pedido',                 alias: 'cubagem',                label: 'Cubagem' },
  // valor_total já é legível — sem alias
] as const

/** Fórmula com chaves internas → fórmula com aliases legíveis (para exibição) */
function formulaParaAlias(formula: string): string {
  const sorted = [...FORMULA_ALIAS_MAP].sort((a, b) => b.chave.length - a.chave.length)
  let r = formula
  for (const { chave, alias } of sorted) {
    r = r.replace(new RegExp(`\\b${chave}\\b`, 'g'), alias)
  }
  return r
}

/** Fórmula com aliases → fórmula com chaves internas (para salvar/validar) */
function formulaParaChave(formula: string): string {
  let r = formula
  for (const { chave, alias } of FORMULA_ALIAS_MAP) {
    r = r.replace(new RegExp(`\\b${alias}\\b`, 'g'), chave)
  }
  return r
}

// ── Campos Calculados — editor tokenizado (pill-based) ───────────────────────
type SaldoToken =
  | { tipo: 'campo';    chave: string; label: string }
  | { tipo: 'op';       valor: string }

/** Tokens → string de alias (para validação) */
function tokensParaAliasFormula(tokens: SaldoToken[]): string {
  return tokens.map(t => t.tipo === 'campo' ? t.chave : t.valor).join(' ')
}

/** Tokens → string de chave interna (para armazenamento) */
function tokensParaChaveFormula(tokens: SaldoToken[]): string {
  return formulaParaChave(tokensParaAliasFormula(tokens))
}

/** String de alias → lista de tokens (para carregar do localStorage) */
function aliasFormulaParaTokens(formulaAlias: string): SaldoToken[] {
  if (!formulaAlias.trim()) return []
  const aliasSet = new Map<string, string>(FORMULA_ALIAS_MAP.map(m => [m.alias, m.label]))
  return formulaAlias.trim().split(/\s+/).map(part => {
    const label = aliasSet.get(part)
    if (label) return { tipo: 'campo' as const, chave: part, label }
    return { tipo: 'op' as const, valor: part }
  })
}

function carregarSaldoTokensDefault(): SaldoToken[] {
  return aliasFormulaParaTokens(carregarSaldoFormulaDefault())
}

// ── Campos Calculados — Saldo do Pedido ──────────────────────────────────────
// A fórmula vive no backend (tabela PedidoSaldoFormulaConfig, uma por tenant)
// e é acessada via saldoFormulaApi. Aqui mantemos apenas o default local para
// renderização imediata antes do carregamento assíncrono.
const SALDO_FORMULA_PADRAO =
  'quantidade_total_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido'

/** Default síncrono enquanto o fetch assíncrono não retorna. */
function carregarSaldoFormulaDefault(): string {
  return formulaParaAlias(SALDO_FORMULA_PADRAO)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sincronizarStatusLocal(lista: PedidoStatusConfig[]) {
  const map: Record<string, { label: string; cor: string }> = {}
  for (const s of lista) map[s.nome] = { label: s.rotulo, cor: s.cor }
  try { localStorage.setItem('pedido:status_config', JSON.stringify(map)) } catch { /* ignore */ }
}

function gerarNomeSlug(rotulo: string, ordem: number): string {
  const base = rotulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 40)
  return base || `status_${ordem}`
}

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  id?: string
}) {
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

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  id,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}) {
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

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Configuracoes() {
  const { t } = useTranslation()
  const addNotification = useShellStore(s => s.addNotification)
  // Gating `pedido:configuracao:editar` (decisão dono + Líder + Coordenador 2026-05-13).
  // `podeEditar` é ESTRITO durante load — evita flash de campos editáveis em
  // estado intermediário. Backend rejeita 403 nos PUT/POST de config.
  const { podeEditar, carregando: carregandoPermissoes } = usePermissoesPedido()
  const podeEditarConfig = podeEditar('configuracao')
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as CategoriaId | null
  const acaoParam = searchParams.get('acao')
  const [categoria, setCategoria] = useState<CategoriaId>(tabParam ?? 'cards')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    colunas: COLUNAS_FILHOS.includes(tabParam ?? ''),
    kanban:  KANBAN_FILHOS.includes(tabParam ?? ''),
  })

  function toggleGroup(id: string) {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }
  const [abaAtiva, setAbaAtiva]     = useState<'pedido' | 'quantidades' | 'datas'>('pedido')
  const [periodoAtivo, setPeriodoAtivo] = useState('30d')

  // ── Estado: casas decimais ──
  const [casasDecimais, setCasasDecimais] = useState<Record<string, number>>(carregarCasasDecimais)
  const [pendingCasas,  setPendingCasas]  = useState<Record<string, number>>(carregarCasasDecimais)
  const [salvandoCasas, setSalvandoCasas] = useState(false)
  const [aguardandoConfirmacaoCasas, setAguardandoConfirmacaoCasas] = useState(false)
  const [auditoriaCasas, setAuditoriaCasas] = useState<{ total_pedidos: number; total_itens: number } | null>(null)
  const casasDirty = JSON.stringify(pendingCasas) !== JSON.stringify(casasDecimais)

  // ── Estado: formato de data ──
  const [formatoData,       setFormatoDataLocal]   = useState<FormatoData>(() => getFormatoData())
  const [pendingFormato,    setPendingFormato]      = useState<FormatoData>(() => getFormatoData())
  const [salvandoFormato,   setSalvandoFormato]     = useState(false)
  const formatoDirty = pendingFormato !== formatoData

  // Carregar casas decimais e formato de data do servidor no mount
  useEffect(() => {
    casasDecimaisApi.obter()
      .then(res => {
        const config = Object.fromEntries(
          Object.entries(res.data).map(([k, v]) => [k, v as number])
        )
        setCasasDecimais(config)
        setPendingCasas(config)
        localStorage.setItem(CASAS_KEY, JSON.stringify({ _v: CASAS_VERSION, ...config }))
        // Carrega formato de data
        if (res.data.formato_data) {
          const fmt = res.data.formato_data as FormatoData
          setFormatoData(fmt)
          setFormatoDataLocal(fmt)
          setPendingFormato(fmt)
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCasasDecimaisChange(campo: string, valor: number) {
    setPendingCasas(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvarCasasDecimais() {
    if (salvandoCasas) return
    setSalvandoCasas(true)
    try {
      const payload = Object.fromEntries(
        COLUNAS_NUMERICAS.map(c => [c.campo, pendingCasas[c.campo] ?? c.padrao])
      ) as Parameters<typeof casasDecimaisApi.salvar>[0]

      const res = await casasDecimaisApi.salvar({ ...payload, confirmar: false })
      setCasasDecimais(pendingCasas)
      localStorage.setItem(CASAS_KEY, JSON.stringify({ _v: CASAS_VERSION, ...pendingCasas }))
      setAuditoriaCasas({ total_pedidos: res.auditoria.total_pedidos, total_itens: res.auditoria.total_itens })

      if (res.auditoria.total_pedidos > 0) {
        setAguardandoConfirmacaoCasas(true)
      } else {
        addNotification({ type: 'success', message: 'Casas decimais salvas com sucesso.' })
      }
    } catch {
      addNotification({ type: 'error', message: 'Erro ao salvar casas decimais.' })
    } finally {
      setSalvandoCasas(false)
    }
  }

  async function confirmarMigracaoCasas() {
    setSalvandoCasas(true)
    try {
      const payload = Object.fromEntries(
        COLUNAS_NUMERICAS.map(c => [c.campo, casasDecimais[c.campo] ?? c.padrao])
      ) as Parameters<typeof casasDecimaisApi.salvar>[0]

      await casasDecimaisApi.salvar({ ...payload, confirmar: true })
      setAguardandoConfirmacaoCasas(false)
      setAuditoriaCasas(null)
      addNotification({ type: 'success', message: 'Configuração salva. Migração iniciada em background.' })
    } catch {
      addNotification({ type: 'error', message: 'Erro ao iniciar migração.' })
    } finally {
      setSalvandoCasas(false)
    }
  }

  function restaurarCasasDecimais() {
    setPendingCasas(casasDecimais)
    setAguardandoConfirmacaoCasas(false)
    setAuditoriaCasas(null)
  }

  // ── Handlers: formato de data ──
  async function salvarFormatoData() {
    if (salvandoFormato) return
    setSalvandoFormato(true)
    try {
      const payload = Object.fromEntries(
        COLUNAS_NUMERICAS.map(c => [c.campo, casasDecimais[c.campo] ?? c.padrao])
      ) as Parameters<typeof casasDecimaisApi.salvar>[0]
      await casasDecimaisApi.salvar({ ...payload, formato_data: pendingFormato })
      setFormatoData(pendingFormato)        // atualiza store global
      setFormatoDataLocal(pendingFormato)   // atualiza estado local
      addNotification({ type: 'success', message: 'Formato de data salvo com sucesso.' })
    } catch {
      addNotification({ type: 'error', message: 'Erro ao salvar formato de data.' })
    } finally {
      setSalvandoFormato(false)
    }
  }

  // ── Estado: colunas numéricas do usuário (via API — para exibir em Casas Decimais) ──
  const [colunasUsuarioApi_, setColunasUsuarioApi] = useState<ColunaUsuarioApi[]>([])
  useEffect(() => {
    colunasUsuarioApi.listar()
      .then(lista => setColunasUsuarioApi(lista))
      .catch(() => {})
  }, [])

  // ── Estado: gerenciamento de colunas existentes (pending — DnD + ativo) ──
  const [pendingColunas,    setPendingColunas]    = useState<ColunaUsuarioApi[]>([])
  const [salvandoColunas,   setSalvandoColunas]   = useState(false)

  // Sincroniza pending quando a lista da API muda (cria, exclui, etc.)
  useEffect(() => {
    setPendingColunas([...colunasUsuarioApi_])
  }, [colunasUsuarioApi_])

  const colunasDirty = useMemo(() => {
    if (pendingColunas.length !== colunasUsuarioApi_.length) return false
    return pendingColunas.some((col, i) => {
      const orig = colunasUsuarioApi_[i]
      return !orig || orig.id !== col.id || orig.ativo !== col.ativo
    })
  }, [pendingColunas, colunasUsuarioApi_])

  function handleToggleAtivoColuna(id: string) {
    setPendingColunas(prev => prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c))
  }

  function handleDragEndColunas(event: import('@dnd-kit/core').DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setPendingColunas(prev => {
      const oldIndex = prev.findIndex(c => c.id === active.id)
      const newIndex = prev.findIndex(c => c.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  async function salvarOrdemColunas() {
    setSalvandoColunas(true)
    try {
      await colunasUsuarioApi.reordenar(pendingColunas.map(c => c.id))
      const changed = pendingColunas.filter(col => {
        const orig = colunasUsuarioApi_.find(c => c.id === col.id)
        return orig && orig.ativo !== col.ativo
      })
      await Promise.all(changed.map(col => colunasUsuarioApi.atualizar(col.id, { ativo: col.ativo })))
      const lista = await colunasUsuarioApi.listar()
      setColunasUsuarioApi(lista)
      addNotification({ type: 'success', message: 'Colunas salvas com sucesso.' })
    } catch {
      addNotification({ type: 'error', message: 'Erro ao salvar colunas.' })
    } finally {
      setSalvandoColunas(false)
    }
  }

  function cancelarOrdemColunas() {
    setPendingColunas([...colunasUsuarioApi_])
  }

  // ── Estado: edição de coluna existente ──
  function escopoDeToggle(itensDiferentes: boolean, pedidoEditavel: boolean): EscopoColunaUsuario {
    if (!itensDiferentes) return 'pedido'
    return pedidoEditavel ? 'ambos' : 'item'
  }

  const [editandoColuna, setEditandoColuna] = useState<ColunaUsuarioApi | null>(null)
  const [criandoColuna, setCriandoColuna] = useState(false)

  function abrirEdicaoColuna(col: ColunaUsuarioApi) {
    setEditandoColuna(col)
  }

  function fecharEdicaoColuna() {
    setEditandoColuna(null)
  }

  async function handleColunaEditadaSalva() {
    setEditandoColuna(null)
    const lista = await colunasUsuarioApi.listar()
    setColunasUsuarioApi(lista)
    setPendingColunas(lista)
  }

  async function handleColunaCriadaViaModal() {
    setCriandoColuna(false)
    const lista = await colunasUsuarioApi.listar()
    setColunasUsuarioApi(lista)
    setPendingColunas(lista)
  }

  // ── Estado: colunas personalizadas (via API) ──
  const [novaColuna, setNovaColuna] = useState<NovaColuna>(NOVA_COLUNA_PADRAO)
  const [novaItensDif, setNovaItensDif] = useState(true)
  const [novaPedidoEdit, setNovaPedidoEdit] = useState(true)
  const [novaOpcao, setNovaOpcao] = useState('')
  const [salvandoColuna, setSalvandoColuna] = useState(false)
  const [erroColuna, setErroColuna] = useState<string | null>(null)
  const novaColunaSectionRef = useRef<HTMLElement>(null)
  const novaColunaInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (acaoParam === 'nova' && categoria === 'colunas-personalizadas') {
      setTimeout(() => {
        novaColunaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        novaColunaInputRef.current?.focus()
      }, 100)
    }
  }, [acaoParam, categoria])
  const formulaDebounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref que mantém os campos disponíveis atualizados para o validarFormulaConfig (evita TDZ com CAMPOS_FORMULA)
  const camposFormulaRef = useRef<Array<{ chave: string; label: string; unidade?: string; papel?: string }>>([])

  const [formulaErro,   setFormulaErro]   = useState<string | null>(null)
  const [formulaValida, setFormulaValida] = useState(false)
  const [formulaAviso,  setFormulaAviso]  = useState<string | null>(null)
  const [formulaGabi,   setFormulaGabi]   = useState<{ titulo: string; texto: string; sugestao?: string } | null>(null)

  // ── Nova Coluna — editor tokenizado (pill-based) para tipo 'formula' ──
  const [formulaTokens, setFormulaTokens] = useState<SaldoToken[]>([])

  // Sincroniza tokens → formula_expressao (alimenta handleFormulaChange que já valida)
  useEffect(() => {
    const alias = tokensParaAliasFormula(formulaTokens)
    handleFormulaChange(alias)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulaTokens])

  // Reset tokens quando tipo muda para fora de 'formula'
  useEffect(() => {
    if (novaColuna.tipo !== 'formula') {
      setFormulaTokens([])
    }
  }, [novaColuna.tipo])

  // ── Saldo do Pedido — Campos Calculados (editor tokenizado) ──
  // Começa com o default síncrono e é sobrescrito pelo fetch da API ao montar.
  const [saldoTokens,          setSaldoTokens]          = useState<SaldoToken[]>(carregarSaldoTokensDefault)
  const [saldoFormulaErro,     setSaldoFormulaErro]     = useState<string | null>(null)
  const [saldoFormulaValida,   setSaldoFormulaValida]   = useState(false)
  const [saldoFormulaGabi,     setSaldoFormulaGabi]     = useState<{ titulo: string; texto: string; sugestao?: string } | null>(null)
  const saldoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saldoCamposRef   = useRef<Array<{ chave: string; label: string; unidade?: string; papel?: string }>>([])
  const [saldoFormulaAnalisando, setSaldoFormulaAnalisando] = useState(false)
  // Baseline da fórmula salva no servidor — usada para calcular "alterada".
  const [saldoFormulaSalva, setSaldoFormulaSalva] = useState<string>(SALDO_FORMULA_PADRAO)

  // Carrega a fórmula do workspace ao montar
  useEffect(() => {
    let cancelado = false
    saldoFormulaApi.obter()
      .then(resp => {
        if (cancelado) return
        const chave = resp.data.formula_expressao
        setSaldoFormulaSalva(chave)
        setSaldoTokens(aliasFormulaParaTokens(formulaParaAlias(chave)))
      })
      .catch(() => { /* mantém default — erro já foi tratado no saldoFormulaApi.obter */ })
    return () => { cancelado = true }
  }, [])

  // Derivado — true quando fórmula difere do que está salvo no backend
  const saldoFormulaAlterada = tokensParaChaveFormula(saldoTokens) !== saldoFormulaSalva

  // ── Snapshot — Política de Atualização ─────────────────────────────────────
  const [snapPolicy,    setSnapPolicy]    = useState<SnapshotAtualizacaoPolicy>(SNAPSHOT_ATUALIZACAO_DEFAULT)
  const [snapPolicyBase, setSnapPolicyBase] = useState<SnapshotAtualizacaoPolicy>(SNAPSHOT_ATUALIZACAO_DEFAULT)
  const [snapPolicySalvando, setSnapPolicySalvando] = useState(false)

  useEffect(() => {
    let cancelado = false
    obterSnapshotAtualizacaoPolicy()
      .then(resp => {
        if (cancelado) return
        const valor = resp.data ?? SNAPSHOT_ATUALIZACAO_DEFAULT
        setSnapPolicy(valor)
        setSnapPolicyBase(valor)
      })
      .catch(() => { /* mantém default */ })
    return () => { cancelado = true }
  }, [])

  const snapPolicyAlterada = useMemo(
    () => JSON.stringify(snapPolicy) !== JSON.stringify(snapPolicyBase),
    [snapPolicy, snapPolicyBase],
  )

  function toggleSnapPolicy(chave: keyof SnapshotAtualizacaoPolicy) {
    setSnapPolicy(prev => ({ ...prev, [chave]: !prev[chave] }))
  }

  async function salvarSnapPolicy() {
    setSnapPolicySalvando(true)
    try {
      const resp = await salvarSnapshotAtualizacaoPolicy(snapPolicy)
      setSnapPolicyBase(resp.data)
      setSnapPolicy(resp.data)
      addNotification({ type: 'success', message: 'Política de snapshot salva.' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar política'
      addNotification({ type: 'error', message: msg })
    } finally {
      setSnapPolicySalvando(false)
    }
  }

  function cancelarSnapPolicy() {
    setSnapPolicy(snapPolicyBase)
  }

  // FIX #4: constante fora do ciclo de render para não recriar callbacks a cada render
  const TIPOS_NUMERICOS_FORMULA: TipoColunaUsuario[] = useMemo(() => ['numero', 'percentual', 'formula'], [])

  // Ref para o nome atual da coluna — evita closure stale no validarFormulaConfig async
  const nomeColRef = useRef(novaColuna.nome)
  useEffect(() => { nomeColRef.current = novaColuna.nome }, [novaColuna.nome])

  const validarFormulaConfig = useCallback(async (expressao: string) => {
    if (!expressao.trim()) {
      setFormulaErro(null); setFormulaValida(false); setFormulaAviso(null); setFormulaGabi(null)
      return
    }
    try {
      // expressao está em forma de alias (o que o usuário vê); traduzir para chave antes de parsear/semântica
      const expressaoChave = formulaParaChave(expressao)
      parsearFormula(expressaoChave)

      // FIX #1: usa ref para pegar nome atual — sem closure stale durante async
      const chave = nomeColRef.current.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || '__nova__'
      if (detectarCircular(chave, expressaoChave, colunasUsuarioApi_)) {
        setFormulaErro('Referência circular: a fórmula cria um ciclo de dependências. Remova a referência que volta para esta coluna.')
        setFormulaValida(false); setFormulaAviso(null); setFormulaGabi(null)
        return
      }

      // Detectar campos não-numéricos (checagem contra colunas do usuário — ainda usa chave real)
      const camposTexto: string[] = []
      const identRegex = /\b([a-z][a-z0-9_]*)\b/g
      let m: RegExpExecArray | null
      while ((m = identRegex.exec(expressao)) !== null) {
        const id = m[1]
        const colUsuario = colunasUsuarioApi_.find(c => c.chave === id || c.id === id)
        if (colUsuario && !TIPOS_NUMERICOS_FORMULA.includes(colUsuario.tipo)) {
          camposTexto.push(`"${colUsuario.nome}" (${colUsuario.tipo})`)
        }
      }
      if (camposTexto.length > 0) {
        setFormulaErro(null); setFormulaValida(true); setFormulaAviso(null)
        setFormulaGabi({
          titulo: 'Campo não-numérico detectado',
          texto:  `${camposTexto.join(', ')} ${camposTexto.length === 1 ? 'não é um campo numérico' : 'não são campos numéricos'}. Em operações aritméticas, campos texto, data ou checkbox serão tratados como 0.`,
        })
        return
      }

      // Detectar campos desconhecidos — verifica contra aliases (forma que o usuário digita)
      const palavrasReservadas = new Set(['SE', 'SOMA_ITENS'])
      const chavesValidas = new Set(camposFormulaRef.current.map(c => c.chave))
      const identRegex2 = /\b([a-z][a-z0-9_]*)\b/g
      const camposDesconhecidos: string[] = []
      let m2: RegExpExecArray | null
      while ((m2 = identRegex2.exec(expressao)) !== null) {
        const id = m2[1]
        if (!palavrasReservadas.has(id.toUpperCase()) && !chavesValidas.has(id)) {
          const ehColunaUsuario = colunasUsuarioApi_.some(c => c.chave === id || c.id === id)
          if (!ehColunaUsuario && !camposDesconhecidos.includes(id)) camposDesconhecidos.push(id)
        }
      }
      if (camposDesconhecidos.length > 0) {
        setFormulaErro(null); setFormulaValida(false); setFormulaAviso(null)
        const lista = camposDesconhecidos.map(c => `"${c}"`).join(', ')
        setFormulaGabi({
          titulo: 'Campo não reconhecido',
          texto:  `${lista} ${camposDesconhecidos.length === 1 ? 'não é um campo disponível' : 'não são campos disponíveis'}. Use os chips acima para inserir campos válidos ou verifique se há um erro de digitação.`,
        })
        return
      }

      // Análise local imediata (usa chave para SEMANTICA_CAMPOS)
      const gabiLocal = analisarSemanticaFormula(expressaoChave)
      setFormulaErro(null); setFormulaValida(true); setFormulaAviso(null); setFormulaGabi(gabiLocal)

      // Melhoria opcional via Gemini (async) — passa chave para o servidor entender
      const respostaGemini = await colunasUsuarioApi.gabiAnalisar(expressaoChave, camposFormulaRef.current)
      if (respostaGemini.gemini) {
        setFormulaGabi({ titulo: respostaGemini.titulo, texto: respostaGemini.texto, sugestao: respostaGemini.sugestao })
      }
      // Se Gemini desabilitado (gemini: false), resultado local já está correto — não faz nada
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fórmula inválida'

      // Detecta padrão "dois campos sem operador": campo1 campo2
      // O parser lança "Token inesperado após fim da fórmula: 'X'"
      if (msg.includes('Token inesperado após fim da fórmula:')) {
        const match = msg.match(/Token inesperado após fim da fórmula: '([^']+)'/)
        const tokenExtra = match?.[1]
        if (tokenExtra) {
          const idx = expressao.lastIndexOf(tokenExtra)
          const antes = idx > 0 ? expressao.slice(0, idx).trim() : null
          if (antes) {
            setFormulaErro(null)
            setFormulaValida(false); setFormulaAviso(null)
            setFormulaGabi({
              titulo:   'Falta um operador',
              texto:    `Parece que faltou um operador entre "${antes}" e "${tokenExtra}". Escolha o que faz mais sentido para o negócio e insira entre os dois campos.`,
              sugestao: `${antes} + ${tokenExtra}`,
            })
            return
          }
        }
      }

      setFormulaErro(msg)
      setFormulaValida(false); setFormulaAviso(null); setFormulaGabi(null)
    }
  }, [colunasUsuarioApi_, TIPOS_NUMERICOS_FORMULA])

  const handleFormulaChange = useCallback((valor: string) => {
    setNovaColuna(prev => ({ ...prev, formula_expressao: valor }))
    setFormulaErro(null); setFormulaValida(false); setFormulaAviso(null); setFormulaGabi(null)
    if (formulaDebounceRef.current) clearTimeout(formulaDebounceRef.current)
    if (valor.trim()) {
      formulaDebounceRef.current = setTimeout(() => {
        void validarFormulaConfig(valor)
      }, 600)
    }
  }, [validarFormulaConfig])

  useEffect(() => {
    return () => { if (formulaDebounceRef.current) clearTimeout(formulaDebounceRef.current) }
  }, [])

  // ── Saldo — handlers ──────────────────────────────────────────────────────────

  const validarSaldoFormula = useCallback(async (expressao: string) => {
    if (!expressao.trim()) {
      setSaldoFormulaErro(null); setSaldoFormulaValida(false); setSaldoFormulaGabi(null); setSaldoFormulaAnalisando(false)
      return
    }
    setSaldoFormulaAnalisando(true)
    // expressao está em forma de alias (o que o usuário vê); traduzir para chave antes de parsear/semântica
    const expressaoChave = formulaParaChave(expressao)
    try {
      parsearFormula(expressaoChave)

      // Detectar campos desconhecidos — verifica contra os aliases (forma que o usuário digita)
      const palavrasReservadas = new Set(['SE', 'SOMA_ITENS'])
      const chavesValidas = new Set(saldoCamposRef.current.map(c => c.chave))
      const identRegex = /\b([a-z][a-z0-9_]*)\b/g
      const camposDesconhecidos: string[] = []
      let m: RegExpExecArray | null
      while ((m = identRegex.exec(expressao)) !== null) {
        const id = m[1]
        if (!palavrasReservadas.has(id.toUpperCase()) && !chavesValidas.has(id) && !camposDesconhecidos.includes(id)) {
          camposDesconhecidos.push(id)
        }
      }
      if (camposDesconhecidos.length > 0) {
        setSaldoFormulaErro(null); setSaldoFormulaValida(false); setSaldoFormulaAnalisando(false)
        const lista = camposDesconhecidos.map(c => `"${c}"`).join(', ')
        setSaldoFormulaGabi({
          titulo: 'Campo não reconhecido',
          texto:  `${lista} ${camposDesconhecidos.length === 1 ? 'não é um campo disponível' : 'não são campos disponíveis'}. Use os chips acima para inserir campos válidos ou verifique se há erro de digitação.`,
        })
        return
      }

      // Análise local imediata (usa chave para SEMANTICA_CAMPOS)
      const gabiLocal = analisarSemanticaFormula(expressaoChave)
      setSaldoFormulaErro(null); setSaldoFormulaValida(true); setSaldoFormulaGabi(gabiLocal)

      // Melhoria opcional via Gemini (async) — passa chave para o servidor entender
      const respostaGemini = await colunasUsuarioApi.gabiAnalisar(expressaoChave, saldoCamposRef.current)
      setSaldoFormulaAnalisando(false)
      if (respostaGemini.gemini) {
        setSaldoFormulaGabi({ titulo: respostaGemini.titulo, texto: respostaGemini.texto, sugestao: respostaGemini.sugestao })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fórmula inválida'

      // Detecta padrão "dois campos sem operador"
      if (msg.includes('Token inesperado após fim da fórmula:')) {
        const match = msg.match(/Token inesperado após fim da fórmula: '([^']+)'/)
        const tokenExtra = match?.[1]
        if (tokenExtra) {
          const idx = expressao.lastIndexOf(tokenExtra)
          const antes = idx > 0 ? expressao.slice(0, idx).trim() : null
          if (antes) {
            setSaldoFormulaErro(null); setSaldoFormulaValida(false); setSaldoFormulaAnalisando(false)
            setSaldoFormulaGabi({
              titulo:   'Falta um operador',
              texto:    `Parece que faltou um operador entre "${antes}" e "${tokenExtra}". Escolha o que faz mais sentido e insira entre os dois campos.`,
              sugestao: `${antes} + ${tokenExtra}`,
            })
            return
          }
        }
      }

      setSaldoFormulaErro(msg); setSaldoFormulaValida(false); setSaldoFormulaGabi(null); setSaldoFormulaAnalisando(false)
    }
  }, [])

  // Tokens → validação via debounce sempre que os tokens mudam
  useEffect(() => {
    const formulaAlias = tokensParaAliasFormula(saldoTokens)
    setSaldoFormulaErro(null); setSaldoFormulaValida(false); setSaldoFormulaGabi(null)
    if (saldoDebounceRef.current) clearTimeout(saldoDebounceRef.current)
    if (!formulaAlias.trim()) { setSaldoFormulaAnalisando(false); return }
    setSaldoFormulaAnalisando(true)
    saldoDebounceRef.current = setTimeout(() => { void validarSaldoFormula(formulaAlias) }, 600)
  }, [saldoTokens, validarSaldoFormula])

  useEffect(() => {
    return () => { if (saldoDebounceRef.current) clearTimeout(saldoDebounceRef.current) }
  }, [])

  function adicionarCampoSaldo(campo: { chave: string; label: string }) {
    setSaldoTokens(prev => [...prev, { tipo: 'campo', chave: campo.chave, label: campo.label }])
  }

  function adicionarOpSaldo(op: string) {
    setSaldoTokens(prev => [...prev, { tipo: 'op', valor: op }])
  }

  function removerTokenSaldo(index: number) {
    setSaldoTokens(prev => prev.filter((_, i) => i !== index))
  }

  async function salvarSaldoFormula() {
    const expressao = tokensParaChaveFormula(saldoTokens)
    try {
      const resp = await saldoFormulaApi.salvar(expressao)
      setSaldoFormulaSalva(resp.data.formula_expressao)
      setSaldoFormulaErro(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar formula'
      setSaldoFormulaErro(msg)
    }
  }

  async function restaurarSaldoPadrao() {
    try {
      const resp = await saldoFormulaApi.restaurarPadrao()
      setSaldoFormulaSalva(resp.data.formula_expressao)
      setSaldoTokens(aliasFormulaParaTokens(formulaParaAlias(resp.data.formula_expressao)))
    } catch {
      // fallback — restaura só localmente
      setSaldoFormulaSalva(SALDO_FORMULA_PADRAO)
      setSaldoTokens(aliasFormulaParaTokens(formulaParaAlias(SALDO_FORMULA_PADRAO)))
    }
    setSaldoFormulaErro(null); setSaldoFormulaValida(false); setSaldoFormulaGabi(null); setSaldoFormulaAnalisando(false)
  }

  // Campos disponíveis para fórmulas — chave = alias legível (o que o chip insere e o usuário vê)
  const CAMPOS_FORMULA: { grupo: string; campos: { chave: string; label: string }[] }[] = [
    {
      grupo: 'Quantidades',
      campos: [
        { chave: 'quantidade_inicial',     label: 'Quantidade Inicial' },
        { chave: 'quantidade_cancelada',   label: 'Quantidade Cancelada' },
        { chave: 'quantidade_transferida', label: 'Quantidade Transferida' },
        { chave: 'quantidade_pronta',      label: 'Quantidade Pronta' },
        { chave: 'saldo',                  label: 'Saldo' },
      ],
    },
    {
      grupo: 'Financeiro',
      campos: [
        { chave: 'valor_total',  label: 'Valor Total' },
        { chave: 'peso_liquido', label: 'Peso Líquido' },
        { chave: 'peso_bruto',   label: 'Peso Bruto' },
        { chave: 'cubagem',      label: 'Cubagem' },
      ],
    },
    ...( colunasUsuarioApi_.filter(c => c.tipo !== 'formula' && c.ativo).length > 0 ? [{
      grupo: 'Minhas Colunas',
      campos: colunasUsuarioApi_
        .filter(c => c.tipo !== 'formula' && c.ativo)
        .map(c => ({ chave: c.chave ?? c.id, label: c.nome })),
    }] : []),
  ]

  // Campos disponíveis para Saldo do Pedido (apenas quantidades + colunas numéricas do usuário)
  // chave = alias legível (o que aparece na fórmula e o chip insere); label = nome exibido no chip
  const CAMPOS_SALDO: { grupo: string; campos: { chave: string; label: string }[] }[] = [
    {
      grupo: 'Quantidades Nativas',
      campos: [
        { chave: 'quantidade_inicial',     label: 'Quantidade Inicial' },
        { chave: 'quantidade_cancelada',   label: 'Quantidade Cancelada' },
        { chave: 'quantidade_transferida', label: 'Quantidade Transferida' },
        { chave: 'quantidade_pronta',      label: 'Quantidade Pronta' },
      ],
    },
    ...( colunasUsuarioApi_.filter(c => (c.tipo === 'numero' || c.tipo === 'formula') && c.ativo).length > 0 ? [{
      grupo: 'Colunas Personalizadas',
      campos: colunasUsuarioApi_
        .filter(c => (c.tipo === 'numero' || c.tipo === 'formula') && c.ativo)
        .map(c => ({ chave: c.chave ?? c.id, label: c.nome })),
    }] : []),
  ]

  // Mantém o ref atualizado com os campos atuais (usado pelo validarFormulaConfig async)
  camposFormulaRef.current = CAMPOS_FORMULA.flatMap(g =>
    g.campos.map(c => ({
      chave:   c.chave,
      label:   c.label,
      unidade: SEMANTICA_CAMPOS[c.chave]?.unidade as string | undefined,
      papel:   SEMANTICA_CAMPOS[c.chave]?.papel   as string | undefined,
    }))
  )

  // Mantém ref de campos do Saldo atualizado (usado pelo validarSaldoFormula async)
  saldoCamposRef.current = CAMPOS_SALDO.flatMap(g =>
    g.campos.map(c => ({
      chave:   c.chave,
      label:   c.label,
      unidade: SEMANTICA_CAMPOS[c.chave]?.unidade as string | undefined,
      papel:   SEMANTICA_CAMPOS[c.chave]?.papel   as string | undefined,
    }))
  )

  function adicionarCampoFormulaToken(campo: { chave: string; label: string }) {
    setFormulaTokens(prev => [...prev, { tipo: 'campo', chave: campo.chave, label: campo.label }])
  }

  function adicionarOpFormulaToken(op: string) {
    setFormulaTokens(prev => [...prev, { tipo: 'op', valor: op }])
  }

  function removerTokenFormula(index: number) {
    setFormulaTokens(prev => prev.filter((_, i) => i !== index))
  }

  async function handleCriarColuna() {
    const nomeTrimmed = novaColuna.nome.trim()
    if (!nomeTrimmed) return
    const tipoComOpcoes = novaColuna.tipo === 'select' || novaColuna.tipo === 'tipo_documento'
    if (tipoComOpcoes && novaColuna.opcoes.length === 0) {
      setErroColuna('Adicione ao menos uma opção à lista.')
      return
    }
    if (novaColuna.tipo === 'formula' && !novaColuna.formula_expressao.trim()) {
      setErroColuna('Digite a expressão da fórmula.')
      return
    }
    setSalvandoColuna(true)
    setErroColuna(null)
    try {
      await colunasUsuarioApi.criar({
        nome: nomeTrimmed,
        tipo: novaColuna.tipo,
        escopo: escopoDeToggle(novaItensDif, novaPedidoEdit),
        visibilidade: novaColuna.visibilidade,
        obrigatorio: novaColuna.obrigatorio,
        valor_padrao: novaColuna.valor_padrao.trim() || undefined,
        descricao: novaColuna.descricao.trim() || undefined,
        opcoes: tipoComOpcoes ? novaColuna.opcoes : undefined,
        formula_expressao: novaColuna.tipo === 'formula' ? formulaParaChave(novaColuna.formula_expressao.trim()) : undefined,
        ativo: true,
        ordem: colunasUsuarioApi_.length,
      })
      const lista = await colunasUsuarioApi.listar()
      setColunasUsuarioApi(lista)
      setNovaColuna(NOVA_COLUNA_PADRAO)
      setNovaItensDif(true)
      setNovaPedidoEdit(true)
      setNovaOpcao('')
      setFormulaTokens([])
    } catch (err) {
      setErroColuna(err instanceof Error ? err.message : 'Erro ao criar coluna.')
    } finally {
      setSalvandoColuna(false)
    }
  }

  async function handleRemoverColuna(id: string) {
    try {
      await colunasUsuarioApi.excluir(id)
      const lista = await colunasUsuarioApi.listar()
      setColunasUsuarioApi(lista)
    } catch { /* ignore */ }
  }

  function handleAdicionarOpcao() {
    const trimmed = novaOpcao.trim()
    if (!trimmed || novaColuna.opcoes.includes(trimmed)) return
    setNovaColuna(prev => ({ ...prev, opcoes: [...prev.opcoes, trimmed] }))
    setNovaOpcao('')
  }

  function handleRemoverOpcao(opcao: string) {
    setNovaColuna(prev => ({ ...prev, opcoes: prev.opcoes.filter(o => o !== opcao) }))
  }

  const { prefs, disponiveis, adicionar, remover, toggle, reordenar, resetar } = useCardPreferences()
  const { cards: cardsCustom, criar: criarCardCustom, excluir: excluirCardCustom, toggleAtivo: toggleCardCustom, carregando: carregandoCardsCustom } = useCardsUsuario()
  const [modalCardAberto, setModalCardAberto] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = prefs.findIndex(p => p.id === active.id)
    const newIndex = prefs.findIndex(p => p.id === over.id)
    reordenar(arrayMove(prefs, oldIndex, newIndex))
  }

  // ── Tabela state ──
  const [tabelaConfig,        setTabelaConfig]        = useState<TabelaConfig>(carregarTabelaConfig)
  const [tabelaConfigSalva,   setTabelaConfigSalva]   = useState<TabelaConfig>(carregarTabelaConfig)

  const tabelaDirty = JSON.stringify(tabelaConfig) !== JSON.stringify(tabelaConfigSalva)

  function salvarTabelaConfig() {
    try { localStorage.setItem(TABELA_CONFIG_KEY, JSON.stringify(tabelaConfig)) } catch { /* ignore */ }
    setTabelaConfigSalva(tabelaConfig)
    addNotification({ type: 'success', message: 'Preferências da tabela salvas com sucesso.' })
  }

  function restaurarTabelaConfig() {
    setTabelaConfig({ ...TABELA_CONFIG_PADRAO })
  }

  // ── Notificações state ──
  const [notifConfig, setNotifConfig] = useState<NotificacoesConfig>({
    pedidoAtrasado: true,
    novoPedido: true,
    itemTransferido: false,
    pedidoExcluido: false,
    importacaoConcluida: true,
  })

  // ── Exportação state ──
  const [exportConfig, setExportConfig] = useState<ExportacaoConfig>(carregarExportConfig)

  function atualizarExportConfig(updater: (prev: ExportacaoConfig) => ExportacaoConfig) {
    setExportConfig(prev => {
      const next = updater(prev)
      localStorage.setItem(EXPORT_CONFIG_KEY, JSON.stringify(next))
      return next
    })
  }

  // ── Numeração state ──
  const [numConfig, setNumConfig] = useState<NumeracaoConfig>({
    prefixo: 'PO-',
    incluirAno: true,
    digitosSequencia: 4,
    reiniciar: 'ano',
    automaticoCriar: true,
    automaticoDuplicar: true,
    automaticoConsolidar: true,
  })

  // ── Templates PDF state ──
  const [templates, setTemplates] = useState<TemplateLocal[]>([])
  const [templateEditando, setTemplateEditando] = useState<string | null>(null)
  const [templateNome, setTemplateNome] = useState('')
  const [templateConteudo, setTemplateConteudo] = useState('')
  const [templateCriandoNovo, setTemplateCriandoNovo] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [confirmarExcluirTemplateId, setConfirmarExcluirTemplateId] = useState<string | null>(null)
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null)

  const inserirVariavel = useCallback((variavel: string) => {
    const ta = templateTextareaRef.current
    if (!ta) {
      setTemplateConteudo(prev => prev + variavel)
      return
    }
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const novo  = templateConteudo.slice(0, start) + variavel + templateConteudo.slice(end)
    setTemplateConteudo(novo)
    // Reposicionar cursor após a variável inserida
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + variavel.length, start + variavel.length)
    })
  }, [templateConteudo])

  useEffect(() => {
    if (categoria === 'templates-pdf') {
      setTemplateLoading(true)
      templatePedidoApi.listarTemplates()
        .then(res => setTemplates(res.data))
        .catch(() => {
          // Em dev sem backend, usar dados demo
          setTemplates([
            { id: '1', nome: 'Template PO Padrão',        conteudo: '<h1>{{numero_pedido}}</h1>', criadoEm: '2026-04-01' },
            { id: '2', nome: 'Template Proforma Invoice',  conteudo: '<h1>{{exportador}}</h1>',   criadoEm: '2026-04-02' },
          ])
        })
        .finally(() => setTemplateLoading(false))
    }
  }, [categoria])

  function iniciarEdicaoTemplate(tpl: TemplateLocal) {
    setTemplateEditando(tpl.id)
    setTemplateNome(tpl.nome)
    setTemplateConteudo(tpl.conteudo)
    setTemplateCriandoNovo(false)
  }

  function iniciarNovoTemplate() {
    setTemplateEditando(null)
    setTemplateNome('')
    setTemplateConteudo('')
    setTemplateCriandoNovo(true)
  }

  function cancelarEdicaoTemplate() {
    setTemplateEditando(null)
    setTemplateCriandoNovo(false)
    setTemplateNome('')
    setTemplateConteudo('')
  }

  async function salvarTemplate() {
    if (!templateNome.trim()) return
    try {
      if (templateCriandoNovo) {
        const novo = await templatePedidoApi.criarTemplate({ nome: templateNome, conteudo: templateConteudo })
        setTemplates(prev => [...prev, novo])
      } else if (templateEditando) {
        const atualizado = await templatePedidoApi.atualizarTemplate(templateEditando, { nome: templateNome, conteudo: templateConteudo })
        setTemplates(prev => prev.map(t => t.id === templateEditando ? atualizado : t))
      }
    } catch {
      // silencia em dev
    }
    cancelarEdicaoTemplate()
  }

  function excluirTemplate(id: string) {
    setConfirmarExcluirTemplateId(id)
  }

  async function excluirTemplateConfirmado() {
    const id = confirmarExcluirTemplateId
    if (!id) return
    setConfirmarExcluirTemplateId(null)
    try {
      await templatePedidoApi.deletarTemplate(id)
    } catch {
      // silencia em dev
    }
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  // ── Regras state ──
  const [regrasAlterados, setRegrasAlterados] = useState(false)
  const regrasInicialRef = useRef<RegrasConfig | null>(null)

  const [regrasConfig, setRegrasConfig] = useState<RegrasConfig>({
    duplicar: {
      copiarDatas: true,
      numeracaoAutomatica: true,
      statusInicial: 'rascunho',
      duplicarItens: true,
    },
    duplicarItem: {
      numeracaoAutomatica: true,
      copiarDatas: true,
      copiarDados: true,
    },
    excluir: {
      statusPermitidos: ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'],
      semItensPermitido: true,
      confirmarComPreview: true,
    },
    transferir: {
      encerrarOrigemZero: true,
      excluirItemOrigemZero: true,
      excluirPedidoOrigemZero: true,
      bloquearTransferenciaAcimaInicial: true,
    },
    consolidar: {
      avisosDivergentes: true,
      fundirPartNumber: true,
      usuarioEscolheDivergentes: true,
      numeroPedidoResultante: 'automatico',
    },
    alertas: {
      numeroDuplicado: true,
      valorTotalDivergente: true,
      quantidadeTotalDivergente: true,
      quantidadeProntaDivergente: true,
      pesoLiquidoDivergente: true,
      pesoBrutoDivergente: true,
      cubagemDivergente: true,
    },
  })

  // Carrega regras do backend na montagem
  useEffect(() => {
    configRegrasApi.obter().then(backend => {
      setRegrasConfig(prev => ({
        ...prev,
        duplicar: {
          ...prev.duplicar,
          numeracaoAutomatica: backend.duplicar_numero_auto,
          copiarDatas: backend.duplicar_copiar_datas,
          statusInicial: (backend.duplicar_status_inicial === 'rascunho' || backend.duplicar_status_inicial === 'aberto' || backend.duplicar_status_inicial === 'em_andamento')
            ? backend.duplicar_status_inicial
            : prev.duplicar.statusInicial,
        },
        excluir: {
          ...prev.excluir,
          statusPermitidos: backend.excluir_status_permitidos,
          semItensPermitido: backend.excluir_pedido_sem_item_permitido,
          confirmarComPreview: backend.excluir_confirmar_com_preview,
        },
        alertas: {
          ...prev.alertas,
          numeroDuplicado: backend.alerta_numero_duplicado,
          valorTotalDivergente: backend.alerta_valor_total_divergente ?? true,
          quantidadeTotalDivergente: backend.alerta_quantidade_total_divergente ?? true,
          quantidadeProntaDivergente: backend.alerta_quantidade_pronta_divergente ?? true,
          pesoLiquidoDivergente: backend.alerta_peso_liquido_divergente ?? true,
          pesoBrutoDivergente: backend.alerta_peso_bruto_divergente ?? true,
          cubagemDivergente: backend.alerta_cubagem_divergente ?? true,
        },
      }))
      regrasInicialRef.current = null // reset para próxima renderização detectar mudanças
    }).catch(() => {
      // fallback: tenta localStorage
      try {
        const raw = localStorage.getItem('pedido:regras_config')
        if (raw) {
          const salvo = JSON.parse(raw) as RegrasConfig
          setRegrasConfig(salvo)
        }
      } catch { /* ignore */ }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Detecta mudanças nas regras (pula a primeira renderização)
  useEffect(() => {
    if (regrasInicialRef.current === null) {
      regrasInicialRef.current = regrasConfig
      return
    }
    setRegrasAlterados(true)
  }, [regrasConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarRegras() {
    try {
      await configRegrasApi.salvar({
        duplicar_numero_auto: regrasConfig.duplicar.numeracaoAutomatica,
        duplicar_copiar_datas: regrasConfig.duplicar.copiarDatas,
        duplicar_status_inicial: regrasConfig.duplicar.statusInicial,
        excluir_status_permitidos: regrasConfig.excluir.statusPermitidos,
        excluir_pedido_sem_item_permitido: regrasConfig.excluir.semItensPermitido,
        excluir_confirmar_com_preview: regrasConfig.excluir.confirmarComPreview,
        alerta_numero_duplicado: regrasConfig.alertas.numeroDuplicado,
        alerta_valor_total_divergente: regrasConfig.alertas.valorTotalDivergente,
        alerta_quantidade_total_divergente: regrasConfig.alertas.quantidadeTotalDivergente,
        alerta_quantidade_pronta_divergente: regrasConfig.alertas.quantidadeProntaDivergente,
        alerta_peso_liquido_divergente: regrasConfig.alertas.pesoLiquidoDivergente,
        alerta_peso_bruto_divergente: regrasConfig.alertas.pesoBrutoDivergente,
        alerta_cubagem_divergente: regrasConfig.alertas.cubagemDivergente,
      })
      localStorage.setItem('pedido:regras_config', JSON.stringify(regrasConfig))
      setRegrasAlterados(false)
    } catch { /* silenciar erros */ }
  }

  function toggleStatusExcluir(statusId: string) {
    setRegrasConfig(prev => {
      const atual = prev.excluir.statusPermitidos
      const novo = atual.includes(statusId)
        ? atual.filter(s => s !== statusId)
        : [...atual, statusId]
      return { ...prev, excluir: { ...prev.excluir, statusPermitidos: novo } }
    })
  }

  // ── Categorias Anexos state ──
  const [categAnexos, setCategAnexos] = useState<CategoriaAnexo[]>([
    { id: '1', nome: 'Invoice',      sistema: false },
    { id: '2', nome: 'Packing List', sistema: false },
    { id: '3', nome: 'BL',           sistema: false },
    { id: '4', nome: 'PDF Gerado',   sistema: true  },
  ])
  const [categEditandoId, setCategEditandoId] = useState<string | null>(null)
  const [categNomeEdit, setCategNomeEdit] = useState('')
  const [categNovaNome, setCategNovaNome] = useState('')
  const [categCriando, setCategCriando] = useState(false)

  function iniciarEdicaoCateg(cat: CategoriaAnexo) {
    setCategEditandoId(cat.id)
    setCategNomeEdit(cat.nome)
    setCategCriando(false)
  }

  function salvarEdicaoCateg() {
    if (!categNomeEdit.trim() || !categEditandoId) return
    setCategAnexos(prev => prev.map(c => c.id === categEditandoId ? { ...c, nome: categNomeEdit } : c))
    setCategEditandoId(null)
    setCategNomeEdit('')
  }

  function excluirCateg(id: string) {
    setCategAnexos(prev => prev.filter(c => c.id !== id))
  }

  function adicionarCateg() {
    if (!categNovaNome.trim()) return
    const nova: CategoriaAnexo = {
      id: String(Date.now()),
      nome: categNovaNome.trim(),
      sistema: false,
    }
    setCategAnexos(prev => [...prev, nova])
    setCategNovaNome('')
    setCategCriando(false)
  }

  // ── Kanban state ─────────────────────────────────────────────────────────

  const [kanbanPrefs, setKanbanPrefs]           = useState<KanbanPreferencias | null>(null)
  const [kanbanLoading, setKanbanLoading]       = useState(false)
  const [pendingColunasOcultas, setPendingColunasOcultas] = useState<string[]>([])
  const kanbanSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Status carregado da API — mesma fonte que o Kanban usa (garante que Colunas ↔ Kanban são consistentes)
  const [kanbanApiStatus, setKanbanApiStatus]   = useState<PedidoStatusConfig[]>([])

  useEffect(() => {
    if (!KANBAN_FILHOS.includes(categoria)) return
    setKanbanLoading(true)

    // Prefs: carrega apenas na primeira visita (cache). Status: sempre recarrega da API.
    const loadPrefs = kanbanPrefs === null
      ? kanbanConfigApi.obterPreferencias()
      : Promise.resolve(null)

    Promise.all([loadPrefs, pedidoConfigApi.listarStatus()])
      .then(([prefsRes, statusRes]) => {
        if (prefsRes !== null) setKanbanPrefs(prefsRes.data)
        setKanbanApiStatus(statusRes.data ?? [])
      })
      .catch(() => { if (kanbanPrefs === null) setKanbanPrefs(null) })
      .finally(() => setKanbanLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria])

  useEffect(() => {
    setPendingColunasOcultas(kanbanPrefs?.colunas_ocultas ?? [])
  }, [kanbanPrefs])

  function kanbanCamposDeAba(aba: 'pedido' | 'quantidades' | 'datas'): KanbanCampoConfig[] {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    return [...(prefs.abas.find(a => a.aba === aba)?.campos ?? [])].sort((a, b) => a.ordem - b.ordem)
  }

  function kanbanSalvar(novasPrefs: KanbanPreferencias) {
    setKanbanPrefs(novasPrefs)
    if (kanbanSaveRef.current) clearTimeout(kanbanSaveRef.current)
    kanbanSaveRef.current = setTimeout(() => {
      kanbanConfigApi.salvarPreferencias(novasPrefs)
        .then(() => window.dispatchEvent(new CustomEvent('kanban:preferencias:atualizadas')))
        .catch(() => {})
    }, 500)
  }

  const kanbanColunasDirty = JSON.stringify(pendingColunasOcultas) !== JSON.stringify(kanbanPrefs?.colunas_ocultas ?? [])

  function kanbanColunaToggle(nome: string) {
    const isSistema = kanbanApiStatus.find(s => s.nome === nome)?.is_sistema ?? false
    if (isSistema) return  // colunas de sistema são obrigatórias e não podem ser ocultadas
    setPendingColunasOcultas(prev =>
      prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome],
    )
  }

  function kanbanColunasSalvar() {
    const novas: KanbanPreferencias = { ...(kanbanPrefs ?? KANBAN_PADRAO), colunas_ocultas: pendingColunasOcultas }
    kanbanSalvar(novas)
  }

  function kanbanColunasDescartar() {
    setPendingColunasOcultas(kanbanPrefs?.colunas_ocultas ?? [])
  }

  function kanbanAdicionarCampo(aba: 'pedido' | 'quantidades' | 'datas', campo: KanbanCampoDisponivel) {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const abaAtual = prefs.abas.find(a => a.aba === aba)
    if (!abaAtual) return
    if (abaAtual.campos.length >= (KANBAN_LIMITES[aba] ?? 10)) return
    const novaOrdem = abaAtual.campos.length
    const novoCampo: KanbanCampoConfig = { campo: campo.campo, label: campo.label, visivel: true, ordem: novaOrdem }
    const novasAbas = prefs.abas.map(a =>
      a.aba === aba ? { ...a, campos: [...a.campos, novoCampo] } : a,
    )
    kanbanSalvar({ ...prefs, abas: novasAbas })
  }

  function kanbanRemoverCampo(aba: 'pedido' | 'quantidades' | 'datas', campo: string) {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const novasAbas = prefs.abas.map(a =>
      a.aba === aba
        ? { ...a, campos: a.campos.filter(c => c.campo !== campo).map((c, i) => ({ ...c, ordem: i })) }
        : a,
    )
    kanbanSalvar({ ...prefs, abas: novasAbas })
  }

  function kanbanToggleVisivel(aba: 'pedido' | 'quantidades' | 'datas', campo: string) {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const novasAbas = prefs.abas.map(a =>
      a.aba === aba
        ? { ...a, campos: a.campos.map(c => c.campo === campo ? { ...c, visivel: !c.visivel } : c) }
        : a,
    )
    kanbanSalvar({ ...prefs, abas: novasAbas })
  }

  async function kanbanRestaurarPadrao() {
    await kanbanConfigApi.restaurarPadrao().catch(() => {})
    setKanbanPrefs(null)
    window.dispatchEvent(new CustomEvent('kanban:preferencias:atualizadas'))
  }

  function kanbanCamposEmUso(): Set<string> {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const todos = new Set<string>()
    prefs.abas.forEach(a => a.campos.forEach(c => todos.add(c.campo)))
    return todos
  }

  function kanbanCardCampos() {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const campos = prefs.card?.campos ?? KANBAN_PADRAO.card.campos
    // Garantir que grupo está sempre presente (JSON do banco pode não ter)
    return campos.map(c => ({
      ...c,
      grupo: c.grupo ?? KANBAN_CARD_CAMPOS_DISPONIVEIS.find(d => d.campo === c.campo)?.grupo,
    }))
  }

  function kanbanCardToggle(campo: string) {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const card = prefs.card ?? KANBAN_PADRAO.card
    kanbanSalvar({
      ...prefs,
      card: {
        ...card,
        campos: card.campos.map(c => c.campo === campo ? { ...c, visivel: !c.visivel } : c),
      },
    })
  }

  function kanbanCardSetDataCritica(valor: string | null) {
    const prefs = kanbanPrefs ?? KANBAN_PADRAO
    const card = prefs.card ?? KANBAN_PADRAO.card
    kanbanSalvar({ ...prefs, card: { ...card, dataCritica: valor } })
  }

  // ── Status state (API-driven) ──
  const [statusList, setStatusList]           = useState<PedidoStatusConfig[]>([])
  const [statusLoading, setStatusLoading]     = useState(false)
  const [statusErro, setStatusErro]           = useState<string | null>(null)
  const [statusEditandoId, setStatusEditandoId] = useState<string | null>(null)
  const [statusEditLabel, setStatusEditLabel] = useState('')
  const [statusEditCor, setStatusEditCor]     = useState('')
  const [statusCriando, setStatusCriando]     = useState(false)
  const [statusNovoLabel, setStatusNovoLabel] = useState('')
  const [statusNovoCor, setStatusNovoCor]     = useState('#818cf8')

  // Carrega status da API quando entra na categoria 'status'
  useEffect(() => {
    if (categoria !== 'status') return
    setStatusLoading(true)
    setStatusErro(null)
    pedidoConfigApi.listarStatus()
      .then(res => {
        const lista = res.data ?? []
        setStatusList(lista)
        sincronizarStatusLocal(lista)
      })
      .catch((err: Error) => {
        console.warn('[Configuracoes/Status] Erro ao carregar status:', err.message)
        setStatusErro(t('pedido.config.status.erro_carregar'))
      })
      .finally(() => setStatusLoading(false))
  }, [categoria])

  // ── Taxa de Câmbio ────────────────────────────────────────────────────────
  // Tipo BoletimCambio + schemas Zod centralizados em useTaxasCambio.ts
  // (reuso pra evitar drift entre tela e hook do Pedidos.tsx).

  const [taxasHoje, setTaxasHoje] = useState<BoletimCambio[]>([])
  const [historicoTaxas, setHistoricoTaxas] = useState<BoletimCambio[]>([])
  const [moedaHistoricoTaxa, setMoedaHistoricoTaxa] = useState('USD')
  const [sincronizandoTaxa, setSincronizandoTaxa] = useState(false)
  const [carregandoTaxa, setCarregandoTaxa] = useState(false)
  const [ultimaSyncTaxa, setUltimaSyncTaxa] = useState<string | null>(null)
  const [erroSyncTaxa, setErroSyncTaxa] = useState<string | null>(null)

  const buscarTaxasAtuais = useCallback(async () => {
    setCarregandoTaxa(true)
    try {
      const res = await fetch('/api/v1/taxas-moeda')
      if (res.ok) {
        const raw = await res.json()
        const json = TaxasMoedaResponseSchema.parse(raw)
        // Aplanar por_moeda → array flat ordenado por moeda + boletim
        const flat: BoletimCambio[] = []
        for (const registros of Object.values(json.por_moeda)) {
          flat.push(...registros)
        }
        flat.sort((a, b) => {
          const oi = MOEDAS_ORDEM.indexOf(a.moeda)
          const oj = MOEDAS_ORDEM.indexOf(b.moeda)
          const orderDiff = (oi === -1 ? 99 : oi) - (oj === -1 ? 99 : oj)
          return orderDiff !== 0 ? orderDiff : a.boletim.localeCompare(b.boletim)
        })
        setTaxasHoje(flat)
      }
    } catch (err) {
      // Mand. 08 — registra erro pra investigacao em prod (nao mascara)
      console.warn('[Configuracoes/taxas-atuais] falha ao carregar:', err)
    } finally { setCarregandoTaxa(false) }
  }, [])

  const buscarHistoricoTaxa = useCallback(async (moeda: string) => {
    try {
      const res = await fetch(`/api/v1/taxas-moeda/historico?moeda=${moeda}&dias=30`)
      if (res.ok) {
        const raw = await res.json()
        const json = HistoricoTaxasResponseSchema.parse(raw)
        setHistoricoTaxas(json.historico)
      }
    } catch (err) {
      // Mand. 08 — registra erro; UX preservada com lista vazia
      console.warn('[Configuracoes/taxas-historico] falha ao carregar:', err)
      setHistoricoTaxas([])
    }
  }, [])

  useEffect(() => {
    if (categoria === 'taxa-cambio') buscarTaxasAtuais()
  }, [categoria, buscarTaxasAtuais])

  useEffect(() => {
    if (categoria === 'taxa-cambio') buscarHistoricoTaxa(moedaHistoricoTaxa)
  }, [categoria, moedaHistoricoTaxa, buscarHistoricoTaxa])

  const sincronizarTaxas = async () => {
    setSincronizandoTaxa(true); setErroSyncTaxa(null)
    try {
      const res = await fetch('/api/v1/taxas-moeda/sync', { method: 'POST' })
      const raw = await res.json()
      const json = SyncTaxasResponseSchema.parse(raw)
      if (json.total_ok === 0) { setErroSyncTaxa('Não foi possível sincronizar. O serviço pode estar offline.') }
      else { setUltimaSyncTaxa(new Date().toLocaleTimeString('pt-BR')); await buscarTaxasAtuais(); await buscarHistoricoTaxa(moedaHistoricoTaxa) }
    } catch (err) {
      // Mand. 08 — registra erro real (nao apenas mensagem generica) pra investigacao em prod
      console.warn('[Configuracoes/taxas-sync] falha ao sincronizar:', err)
      setErroSyncTaxa('Erro de comunicação.')
    } finally { setSincronizandoTaxa(false) }
  }

  const MOEDAS_ORDEM = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CHF', 'CAD']
  const MOEDAS_INFO: Record<string, string> = { USD: 'Dólar Americano', EUR: 'Euro', GBP: 'Libra Esterlina', CNY: 'Yuan Chinês', JPY: 'Iene Japonês', CHF: 'Franco Suíço', CAD: 'Dólar Canadense' }
  const BOLETIM_COR: Record<string, string> = { '1º Boletim': '#60a5fa', '2º Boletim': '#a78bfa', '3º Boletim': '#34d399', 'Fechamento': '#fbbf24' }

  function fmtTaxa(v: number | null | undefined) { return v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) }
  function fmtData(iso: string | null | undefined) { return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—' }

  // ── Status (sortable) ──────────────────────────────────────────────────────

  const statusSensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  function handleStatusDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = statusList.findIndex(s => s.id === active.id)
    const newIndex = statusList.findIndex(s => s.id === over.id)
    const novaLista = arrayMove(statusList, oldIndex, newIndex)
    setStatusList(novaLista)
    sincronizarStatusLocal(novaLista)
    pedidoConfigApi.reordenarStatus(novaLista.map(s => s.id)).catch(() => {})
  }

  function iniciarEdicaoStatus(s: PedidoStatusConfig) {
    setStatusEditandoId(s.id)
    setStatusEditLabel(s.rotulo)
    setStatusEditCor(s.cor)
    setStatusCriando(false)
  }

  function salvarEdicaoStatus() {
    if (!statusEditLabel.trim() || !statusEditandoId) return
    const novaLista = statusList.map(s => s.id === statusEditandoId
      ? { ...s, rotulo: statusEditLabel.trim(), cor: statusEditCor }
      : s,
    )
    setStatusList(novaLista)
    sincronizarStatusLocal(novaLista)
    pedidoConfigApi.atualizarStatus(statusEditandoId, {
      rotulo: statusEditLabel.trim(),
      cor:    statusEditCor,
    }).catch(() => {
      pedidoConfigApi.listarStatus().then(res => {
        setStatusList(res.data ?? [])
        sincronizarStatusLocal(res.data ?? [])
      }).catch(() => {})
    })
    setStatusEditandoId(null)
    setStatusEditLabel('')
    setStatusEditCor('')
  }

  function cancelarEdicaoStatus() {
    setStatusEditandoId(null)
    setStatusEditLabel('')
    setStatusEditCor('')
  }

  function excluirStatus(id: string) {
    const novaLista = statusList.filter(s => s.id !== id)
    setStatusList(novaLista)
    sincronizarStatusLocal(novaLista)
    setRegrasConfig(prev => ({
      ...prev,
      excluir: {
        ...prev.excluir,
        statusPermitidos: prev.excluir.statusPermitidos.filter(s => s !== id),
      },
    }))
    pedidoConfigApi.deletarStatus(id).catch(() => {
      pedidoConfigApi.listarStatus().then(res => {
        setStatusList(res.data ?? [])
        sincronizarStatusLocal(res.data ?? [])
      }).catch(() => {})
    })
  }

  function adicionarStatus() {
    if (!statusNovoLabel.trim()) return
    const ordem = statusList.length
    const nome  = gerarNomeSlug(statusNovoLabel.trim(), ordem)
    // Optimistic insert (id provisório até resposta da API)
    const provisorio: PedidoStatusConfig = {
      id:         `provisorio_${Date.now()}`,
      nome,
      rotulo:     statusNovoLabel.trim(),
      cor:        statusNovoCor,
      ordem,
      is_padrao:  false,
      is_sistema: false,
    }
    setStatusList(prev => [...prev, provisorio])
    setStatusNovoLabel('')
    setStatusNovoCor('#818cf8')
    setStatusCriando(false)

    pedidoConfigApi.criarStatus({ nome, rotulo: provisorio.rotulo, cor: provisorio.cor, ordem })
      .then(criado => {
        setStatusList(prev => {
          const lista = prev.map(s => s.id === provisorio.id ? criado : s)
          sincronizarStatusLocal(lista)
          return lista
        })
      })
      .catch(() => {
        setStatusList(prev => {
          const lista = prev.filter(s => s.id !== provisorio.id)
          sincronizarStatusLocal(lista)
          return lista
        })
        addNotification({ type: 'error', message: 'Erro ao criar status. Tente novamente.' })
      })
  }

  // ── Preview da numeração ──
  const previewNumeracao = (() => {
    const digitos = String(1).padStart(numConfig.digitosSequencia, '0')
    const ano = numConfig.incluirAno ? `${new Date().getFullYear()}/` : ''
    return `${numConfig.prefixo}${ano}${digitos}`
  })()

  return (
    <div className="cfg-page ws-fade-up">

      {/* ── Sidebar ── */}
      <aside className="cfg-sidebar">
        <nav className="cfg-sidebar__nav">
          {SIDEBAR_ITEMS.map((item, idx) => {
            // ── Grupo (label de seção) ──
            if (item.tipo === 'grupo') {
              return (
                <span key={`grupo-${idx}`} className="cfg-sidebar__titulo cfg-sidebar__titulo--grupo">
                  {t(item.labelKey)}
                </span>
              )
            }

            // ── Parent (expandível/contraível) ──
            if (item.tipo === 'parent') {
              const groupKey = item.filhos === COLUNAS_FILHOS ? 'colunas' : 'kanban'
              const isExpanded = !!expandedGroups[groupKey]
              const isAtivo = item.filhos.includes(categoria)
              return (
                <div key={`parent-${item.id}`} className="cfg-sidebar__group">
                  <button
                    type="button"
                    className={[
                      'cfg-sidebar__item',
                      isAtivo ? 'cfg-sidebar__item--ativo' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <span className="cfg-sidebar__item-icon">{item.icone}</span>
                    <span className="cfg-sidebar__item-label">{t(item.labelKey)}</span>
                    <CaretDown
                      size={12}
                      weight="bold"
                      className={`cfg-sidebar__chevron${isExpanded ? ' cfg-sidebar__chevron--open' : ''}`}
                    />
                  </button>
                  <div className={`cfg-sidebar__submenu${isExpanded ? ' cfg-sidebar__submenu--open' : ''}`}>
                    {SIDEBAR_ITEMS
                      .filter(s => s.tipo === 'sub' && item.filhos.includes(s.id))
                      .map(sub => {
                        if (sub.tipo !== 'sub') return null
                        const subAtivo = categoria === sub.id
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            className={[
                              'cfg-sidebar__subitem',
                              subAtivo ? 'cfg-sidebar__subitem--ativo' : '',
                              !sub.ativo ? 'cfg-sidebar__item--breve' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => sub.ativo && setCategoria(sub.id as CategoriaId)}
                          >
                            <span className="cfg-sidebar__item-label">{t(sub.labelKey)}</span>
                            {!sub.ativo && <span className="cfg-badge-breve">Em breve</span>}
                          </button>
                        )
                      })}
                  </div>
                </div>
              )
            }

            // ── Sub (renderizado dentro do parent acima, não aqui) ──
            if (item.tipo === 'sub') return null

            // ── Item normal ──
            const isAtivo = categoria === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={[
                  'cfg-sidebar__item',
                  isAtivo     ? 'cfg-sidebar__item--ativo' : '',
                  !item.ativo ? 'cfg-sidebar__item--breve' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => item.ativo && setCategoria(item.id as CategoriaId)}
              >
                <span className="cfg-sidebar__item-icon">{item.icone}</span>
                <span className="cfg-sidebar__item-label">{t(item.labelKey)}</span>
                {!item.ativo && <span className="cfg-badge-breve">Em breve</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      {/* Gating `configuracao:editar` (2026-05-13): usuário sem permissão
          vê área opaca + banner. Defesa em profundidade: backend rejeita 403. */}
      {!carregandoPermissoes && !podeEditarConfig && (
        <div
          role="note"
          aria-label="Sem permissão para editar configurações"
          style={{
            margin: '0 1.25rem',
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            color: '#fca5a5',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          🔒 Sem permissão para editar configurações. Os campos estão em modo leitura.
        </div>
      )}
      <main
        className="cfg-conteudo"
        style={podeEditarConfig || carregandoPermissoes ? undefined : { opacity: 0.65, pointerEvents: 'none' }}
      >

        {/* ════════════════════════ CARDS ════════════════════════ */}
        {categoria === 'cards' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">

              {/* ── Header unificado ── */}
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.cards.titulo')}</h2>
                  <p className="cfg-secao__desc">
                    {t('pedido.config.cards.descricao')}
                  </p>
                </div>
                <TooltipGlobal descricao={t('pedido.config.cards.restaurar_padrao_tooltip')}>
                  <button type="button" className="cfg-btn-header--restaurar" onClick={resetar}>
                    <ArrowCounterClockwise size={13} weight="bold" />
                    {t('pedido.config.cards.restaurar_padrao')}
                  </button>
                </TooltipGlobal>
              </div>

              {/* ── Período de comparação ── */}
              <ConfiguracaoSecaoGlobal label={t('pedido.config.cards.label_periodo')} />
              <div className="cfg-periodo-pills" style={{ marginTop: '0.75rem' }}>
                {PERIODOS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cfg-periodo-pill${periodoAtivo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                    onClick={() => setPeriodoAtivo(p.id)}
                  >
                    {t(`pedido.config.cards.periodo_${p.id}`)}
                  </button>
                ))}
              </div>

              {/* ── Preview ao vivo ── */}
              {prefs.length > 0 && (
                <div className="cfg-cards-preview-wrap">
                  <p className="cfg-cards-preview-label">
                    <SquaresFour size={12} weight="fill" />
                    {t('pedido.config.cards.preview')}
                  </p>
                  <div className="cfg-cards-preview-grid">
                    {prefs.map((pref, i) => {
                      const visual = CARD_VISUAL[pref.id]
                      const def    = CARDS_CATALOGO.find(c => c.id === pref.id)!
                      return (
                        <div
                          key={pref.id}
                          className={`cfg-kpi-preview-card${!pref.visible ? ' cfg-kpi-preview-card--oculto' : ''}`}
                          style={{ borderTopColor: visual.cor }}
                        >
                          <span className="cfg-kpi-preview-card__pos">{i + 1}</span>
                          <span className="cfg-kpi-preview-card__icon" style={{ color: visual.cor }}>
                            {visual.icone}
                          </span>
                          <div className="cfg-kpi-preview-card__line" style={{ background: visual.cor }} />
                          <p className="cfg-kpi-preview-card__label">{t(def.labelKey)}</p>
                        </div>
                      )
                    })}
                    {cardsCustom.filter(c => c.ativo).map((card, i) => (
                      <div
                        key={card.id}
                        className="cfg-kpi-preview-card"
                        style={{ borderTopColor: card.cor }}
                      >
                        <span className="cfg-kpi-preview-card__pos">{prefs.length + i + 1}</span>
                        <span className="cfg-kpi-preview-card__icon" style={{ color: card.cor }}>
                          {ICONE_CUSTOM_MAP[card.icone] ?? <Package size={16} weight="duotone" />}
                        </span>
                        <div className="cfg-kpi-preview-card__line" style={{ background: card.cor }} />
                        <p className="cfg-kpi-preview-card__label">{card.nome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Ativos ── */}
              <ConfiguracaoSecaoGlobal label={t('pedido.config.cards.ativos')} count={`${prefs.length} card${prefs.length !== 1 ? 's' : ''}`} />

              {prefs.length === 0 ? (
                <p className="cfg-empty">{t('pedido.config.cards.vazio')}</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={prefs.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="cfg-cards-lista">
                      {prefs.map(pref => (
                        <CardSortavel
                          key={pref.id}
                          pref={pref}
                          periodoAtivo={periodoAtivo}
                          onToggle={() => toggle(pref.id)}
                          onRemover={() => remover(pref.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* ── Disponíveis para adicionar ── */}
              <ConfiguracaoSecaoGlobal label={t('pedido.config.cards.disponiveis')} hint={t('pedido.config.cards.hint_adicionar')} style={{ marginTop: '1.5rem' }} />

              <div className="cfg-tabela-head">
                <span className="cfg-tabela-head__col cfg-tabela-head__col--nome">{t('pedido.config.cards.col_nome')}</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--origem">{t('pedido.config.cards.col_origem')}</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--agg">{t('pedido.config.cards.col_agregacao')}</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--acao" />
              </div>

              <div className="cfg-cards-lista">
                {CARDS_CATALOGO.filter(def => !prefs.find(p => p.id === def.id)).map(def => (
                  <CardDisponivel
                    key={def.id}
                    def={def}
                    onAdicionar={() => adicionar(def.id)}
                    periodoAtivo={periodoAtivo}
                  />
                ))}
                {CARDS_CATALOGO.filter(def => !prefs.find(p => p.id === def.id)).length === 0 && (
                  <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                    Todos os cards disponíveis já foram adicionados
                  </p>
                )}
              </div>

              {/* ── Cards Personalizados ── */}
              <ConfiguracaoSecaoGlobal
                label="Cards Personalizados"
                count={cardsCustom.length > 0 ? `${cardsCustom.length} card${cardsCustom.length !== 1 ? 's' : ''}` : undefined}
                style={{ marginTop: '1.5rem' }}
              />

              {carregandoCardsCustom ? (
                <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                  <GravityLoader tamanho="sm" />
                </div>
              ) : (
                <>
                  {cardsCustom.length > 0 && (
                    <div className="cfg-cards-lista">
                      {cardsCustom.map(card => (
                        <div key={card.id} className={`cfg-card-row${!card.ativo ? ' cfg-card-row--oculto' : ''}`}>
                          <span className="cfg-drag-handle cfg-drag-handle--ghost">
                            <DotsSixVertical size={16} weight="bold" />
                          </span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: card.cor }}>
                              {ICONE_CUSTOM_MAP[card.icone] ?? <Package size={16} weight="duotone" />}
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{card.nome}</p>
                              <p className="cfg-card-row__desc">Fórmula · Personalizado</p>
                            </div>
                          </div>
                          <span className="cfg-origem-badge cfg-origem-badge--meus">Custom</span>
                          <TooltipGlobal descricao={card.ativo ? 'Ocultar card' : 'Exibir card'}>
                            <button
                              type="button"
                              className={`cfg-eye-btn${card.ativo ? ' cfg-eye-btn--on' : ''}`}
                              onClick={() => toggleCardCustom(card.id)}
                              aria-label={card.ativo ? 'Ocultar' : 'Exibir'}
                            >
                              {card.ativo ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
                            </button>
                          </TooltipGlobal>
                          <TooltipGlobal descricao="Excluir card personalizado">
                            <button
                              type="button"
                              className="cfg-remove-btn"
                              onClick={() => excluirCardCustom(card.id)}
                              aria-label="Excluir card"
                            >
                              <X size={13} weight="bold" />
                            </button>
                          </TooltipGlobal>
                        </div>
                      ))}
                    </div>
                  )}

                  {podeEditarConfig && (
                    <button
                      type="button"
                      className="cfg-add-row-btn"
                      onClick={() => setModalCardAberto(true)}
                      style={{ marginTop: '0.75rem' }}
                    >
                      <Plus size={13} weight="bold" />
                      Criar Card Personalizado
                    </button>
                  )}
                </>
              )}

              {modalCardAberto && (
                <ModalNovoCardUsuario
                  onFechar={() => setModalCardAberto(false)}
                  onSalvo={async (data) => {
                    try {
                      await criarCardCustom(data)
                      setModalCardAberto(false)
                    } catch {
                      // backend indisponível — botão sai do loading via catch do modal
                    }
                  }}
                />
              )}

            </section>
          </div>
        )}

        {/* ════════════════════════ TABELA ════════════════════════ */}
        {categoria === 'tabela' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.tabela.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.tabela.descricao')}</p>
                </div>
              </div>

              <ConfiguracaoSecaoGlobal label={t('pedido.config.tabela.linhas_por_pagina')} />
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

              <ConfiguracaoSecaoGlobal label={t('pedido.config.tabela.preferencias')} />
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="tb-atrasados"
                  label={t('pedido.config.tabela.destacar_atrasados')}
                  checked={tabelaConfig.destacarAtrasados}
                  onChange={v => setTabelaConfig(prev => ({ ...prev, destacarAtrasados: v }))}
                />
              </div>

              <div className="cfg-secao__footer">
                <BotaoCancelar dirty={tabelaDirty} rotulo={t('pedido.config.acao.restaurar_padrao')} onClick={restaurarTabelaConfig} />
                <BotaoSalvar   dirty={tabelaDirty} rotulo={t('pedido.config.acao.salvar')}           onClick={salvarTabelaConfig} />
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════ KANBAN MODAL / CARD / COLUNAS ════════════════════════ */}
        {(categoria === 'kanban-modal' || categoria === 'kanban-card' || categoria === 'kanban-colunas') && (
          <div className="cfg-kanban-wrapper">

            {/* ── Sub: Modal ── */}
            {categoria === 'kanban-modal' && (
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.kanban.modal_titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.kanban.modal_descricao')}</p>
                </div>
              </div>

              {kanbanLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
                  <GravityLoader tamanho="sm" />
                </div>
              )}

              {!kanbanLoading && (() => {
                const campos  = kanbanCamposDeAba(abaAtiva)
                const limite  = KANBAN_LIMITES[abaAtiva] ?? 10
                const nomeAba = t(`pedido.config.kanban.aba_${abaAtiva}`)
                const disponiveis = KANBAN_CAMPOS_DISPONIVEIS.filter(cd => cd.categoria === abaAtiva)
                return (
                  <>
                    {/* ── Preview ao vivo — mini modal ── */}
                    <div className="cfg-cards-preview-wrap">
                      <p className="cfg-cards-preview-label">
                        <SquaresFour size={12} weight="fill" />
                        {t('pedido.config.kanban.modal_preview')}
                      </p>
                      <div className="cfg-modal-preview">
                        {/* Tab bar */}
                        <div className="cfg-modal-preview__tabs">
                          {(['pedido', 'quantidades', 'datas', 'lembrete'] as const).map(tab => (
                            <span key={tab} className={`cfg-modal-preview__tab${tab === abaAtiva ? ' cfg-modal-preview__tab--ativo' : ''}`}>
                              {t(`pedido.config.kanban.aba_${tab}`)}
                            </span>
                          ))}
                        </div>
                        {/* Campos da aba ativa */}
                        <div className="cfg-modal-preview__campos">
                          {campos.filter(c => c.visivel).map(c => (
                            <div key={c.campo} className="cfg-modal-preview__campo">
                              <span className="cfg-modal-preview__campo-label">{c.label}</span>
                              <span className="cfg-modal-preview__campo-valor">—</span>
                            </div>
                          ))}
                          {campos.filter(c => !c.visivel).map(c => (
                            <div key={c.campo} className="cfg-modal-preview__campo cfg-modal-preview__campo--oculto">
                              <span className="cfg-modal-preview__campo-label">{c.label}</span>
                              <span className="cfg-modal-preview__campo-valor">—</span>
                            </div>
                          ))}
                          {campos.length === 0 && (
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                              {t('pedido.config.kanban.campo_vazio')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Seletor de aba ── */}
                    <div className="cfg-periodo-pills" style={{ marginBottom: '1.25rem' }}>
                      {(['pedido', 'quantidades', 'datas'] as const).map(aba => {
                        const qtd = kanbanCamposDeAba(aba).length
                        const lim = KANBAN_LIMITES[aba] ?? 10
                        return (
                          <button
                            key={aba}
                            type="button"
                            className={`cfg-periodo-pill${abaAtiva === aba ? ' cfg-periodo-pill--ativo' : ''}`}
                            onClick={() => setAbaAtiva(aba)}
                          >
                            {t(`pedido.config.kanban.aba_${aba}`)}
                            <span style={{ marginLeft: '0.375rem', fontSize: '0.6875rem', opacity: 0.7 }}>
                              {qtd}/{lim}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* ── Ativos ── */}
                    <ConfiguracaoSecaoGlobal
                      label={t('pedido.config.cards.ativos')}
                      count={`${campos.length}/${limite} ${t('pedido.config.kanban.campos_label')}`}
                      action={
                        <TooltipGlobal descricao={t('pedido.config.kanban.restaurar_tooltip', { aba: nomeAba })}>
                          <button type="button" className="cfg-btn-header--restaurar" onClick={kanbanRestaurarPadrao}>
                            <ArrowCounterClockwise size={13} weight="bold" />
                            {t('pedido.config.acao.restaurar_padrao')}
                          </button>
                        </TooltipGlobal>
                      }
                    />
                    <p className="cfg-hint">{t('pedido.config.kanban.modal_hint')}</p>

                    <div className="cfg-kanban-campos-lista">
                      {campos.length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          {t('pedido.config.kanban.campo_vazio_add')}
                        </p>
                      )}
                      {campos.map(cfg => (
                        <div key={cfg.campo} className={`cfg-kanban-campo-row${!cfg.visivel ? ' cfg-kanban-campo-row--oculto' : ''}`}>
                          <span className="cfg-drag-handle" aria-label={t('pedido.config.kanban.aria_arrastar')}>
                            <DotsSixVertical size={15} weight="bold" />
                          </span>
                          <span className="cfg-kanban-campo-label">{cfg.label}</span>
                          <button
                            type="button"
                            className={`cfg-eye-btn${cfg.visivel ? ' cfg-eye-btn--on' : ''}`}
                            onClick={() => kanbanToggleVisivel(abaAtiva, cfg.campo)}
                            aria-label={cfg.visivel ? t('pedido.config.kanban.aria_ocultar_campo') : t('pedido.config.kanban.aria_exibir_campo')}
                          >
                            {cfg.visivel ? <Eye size={14} weight="bold" /> : <EyeSlash size={14} weight="bold" />}
                          </button>
                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => kanbanRemoverCampo(abaAtiva, cfg.campo)}
                            aria-label={t('pedido.config.kanban.aria_remover_campo')}
                          >
                            <X size={12} weight="bold" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ── Disponíveis para adicionar ── */}
                    <ConfiguracaoSecaoGlobal label={t('pedido.config.cards.disponiveis')} hint={t('pedido.config.cards.hint_adicionar')} style={{ marginTop: '1.5rem' }} />
                    <div className="cfg-kanban-disponivel-lista">
                      {disponiveis.filter(cd => !kanbanCamposEmUso().has(cd.campo)).map(cd => {
                        const cheio = campos.length >= limite
                        return (
                          <div key={cd.campo} className="cfg-kanban-disponivel-row">
                            <span className="cfg-kanban-disponivel-label">{cd.label}</span>
                            <TooltipGlobal descricao={cheio ? t('pedido.config.kanban.limite_atingido', { atual: campos.length, max: limite }) : t('pedido.config.kanban.tooltip_adicionar', { aba: nomeAba })}>
                              <button
                                type="button"
                                className={`cfg-kanban-add-btn${cheio ? ' cfg-kanban-add-btn--disabled' : ''}`}
                                onClick={() => { if (!cheio) kanbanAdicionarCampo(abaAtiva, cd) }}
                                disabled={cheio}
                                aria-label={t('pedido.config.kanban.aria_adicionar_campo')}
                              >
                                <Plus size={13} weight="bold" />
                              </button>
                            </TooltipGlobal>
                          </div>
                        )
                      })}
                      {disponiveis.filter(cd => !kanbanCamposEmUso().has(cd.campo)).length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          {t('pedido.config.kanban.todos_adicionados')}
                        </p>
                      )}
                    </div>

                    {/* Aba fixa Lembrete — informativa */}
                    <div className="cfg-kanban-aba cfg-kanban-aba--fixa" style={{ marginTop: '1.5rem' }}>
                      <ConfiguracaoSecaoGlobal
                        label={t('pedido.config.kanban.aba_lembrete_titulo')}
                        action={<span className="cfg-kanban-aba-fixa-badge">{t('pedido.config.kanban.badge_fixa')}</span>}
                      />
                      <p className="cfg-hint">{t('pedido.config.kanban.aba_fixa_hint')}</p>
                    </div>
                  </>
                )
              })()}
            </section>
            )}

            {/* ── Sub: Card ── */}
            {categoria === 'kanban-card' && (<>
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.kanban.card_titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.kanban.card_descricao')}</p>
                </div>
              </div>

              {!kanbanLoading && (() => {
                const todosCampos      = kanbanCardCampos()
                const ativos           = todosCampos.filter(c => c.visivel)
                const disponiveis      = todosCampos.filter(c => !c.visivel)
                const dataCritica      = (kanbanPrefs ?? KANBAN_PADRAO).card?.dataCritica ?? 'data_prevista_coleta_pedido'
                const dataCriticaLabel = KANBAN_CAMPOS_DISPONIVEIS.find(c => c.campo === dataCritica)?.label ?? null
                return (
                  <>
                    {/* ── Preview ao vivo ── */}
                    <div className="cfg-cards-preview-wrap">
                      <p className="cfg-cards-preview-label">
                        <SquaresFour size={12} weight="fill" />
                        {t('pedido.config.kanban.card_preview')}
                      </p>
                      <div className="cfg-card-preview">
                        <div className="cfg-card-preview__header">
                          <span className="cfg-card-preview__numero">PED-2025-0001</span>
                          <span className="cfg-card-preview__fixo-badge">{t('pedido.config.kanban.badge_fixo')}</span>
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
                              {t('pedido.config.kanban.campo_vazio')}
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

                    {/* ── Ativos ── */}
                    <ConfiguracaoSecaoGlobal label={t('pedido.config.cards.ativos')} count={`${ativos.length + 1} ${t('pedido.config.kanban.campos_label')}`} />
                    <p className="cfg-hint">{t('pedido.config.kanban.card_ativos_hint')}</p>
                    <div className="cfg-kanban-campos-lista">
                      {/* Campo fixo sempre no topo */}
                      <div className="cfg-kanban-campo-row cfg-kanban-campo-row--fixo">
                        <span className="cfg-kanban-campo-label">{t('pedido.config.kanban.num_pedido')}</span>
                        <span className="cfg-kanban-aba-fixa-badge">{t('pedido.config.kanban.badge_fixo')}</span>
                      </div>
                      {ativos.length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          {t('pedido.config.kanban.campo_vazio_add')}
                        </p>
                      )}
                      {KANBAN_CARD_GRUPOS.map(grupo => {
                        const cols = ativos.filter(c => c.grupo === grupo.key)
                        if (cols.length === 0) return null
                        return (
                          <React.Fragment key={grupo.key}>
                            <div className="cfg-card-grupo-divider">{t(`pedido.config.kanban.grupo_${grupo.key}`)}</div>
                            {cols.map(cfg => (
                              <div key={cfg.campo} className="cfg-kanban-campo-row">
                                <span className="cfg-kanban-campo-label">{cfg.label}</span>
                                <button
                                  type="button"
                                  className="cfg-eye-btn cfg-eye-btn--on"
                                  onClick={() => kanbanCardToggle(cfg.campo)}
                                  aria-label="Ocultar campo"
                                >
                                  <Eye size={14} weight="bold" />
                                </button>
                              </div>
                            ))}
                          </React.Fragment>
                        )
                      })}
                    </div>

                    {/* ── Disponíveis para adicionar ── */}
                    <ConfiguracaoSecaoGlobal label={t('pedido.config.cards.disponiveis')} hint={t('pedido.config.cards.hint_adicionar')} style={{ marginTop: '1.5rem' }} />
                    <div className="cfg-kanban-disponivel-lista">
                      <div className="cfg-kanban-disponivel-header">
                        <span>{t('pedido.config.kanban.col_campo')}</span>
                        <span>{t('pedido.config.kanban.col_grupo')}</span>
                        <span></span>
                      </div>
                      {disponiveis.length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          {t('pedido.config.kanban.todos_ativos')}
                        </p>
                      )}
                      {disponiveis.map(cfg => (
                        <div key={cfg.campo} className="cfg-kanban-disponivel-row">
                          <span className="cfg-kanban-disponivel-label">{cfg.label}</span>
                          <span className="cfg-origem-badge cfg-origem-badge--pedido">{t(`pedido.config.kanban.grupo_${cfg.grupo}`)}</span>
                          <TooltipGlobal descricao={t('pedido.config.kanban.tooltip_exibir_card')}>
                            <button
                              type="button"
                              className="cfg-kanban-add-btn"
                              onClick={() => kanbanCardToggle(cfg.campo)}
                              aria-label={t('pedido.config.kanban.aria_exibir_campo')}
                            >
                              <Plus size={13} weight="bold" />
                            </button>
                          </TooltipGlobal>
                        </div>
                      ))}
                    </div>

                    {/* ── Data crítica ── */}
                    <ConfiguracaoSecaoGlobal label={t('pedido.config.kanban.data_critica')} style={{ marginTop: '1.5rem' }} />
                    <p className="cfg-hint">{t('pedido.config.kanban.data_critica_hint')}</p>
                    <div style={{ marginTop: '0.5rem' }}>
                      <SelectGlobal
                        buscavel={false}
                        placeholder={t('pedido.config.kanban.data_critica_nao_exibir')}
                        opcoes={KANBAN_CAMPOS_DISPONIVEIS.filter(c => c.categoria === 'datas').map(c => ({ valor: c.campo, rotulo: c.label }))}
                        valor={dataCritica}
                        aoMudarValor={v => kanbanCardSetDataCritica(v != null ? String(v) : null)}
                      />
                    </div>
                  </>
                )
              })()}
            </section>
            </>)}

            {/* ── Sub: Colunas ── */}
            {categoria === 'kanban-colunas' && (
              <SecaoKanbanColunas
                statusConfig={kanbanApiStatus}
                loading={kanbanLoading}
                colunasOcultas={pendingColunasOcultas}
                dirty={kanbanColunasDirty}
                onToggle={kanbanColunaToggle}
                onSalvar={kanbanColunasSalvar}
                onDescartar={kanbanColunasDescartar}
              />
            )}

          </div>
        )}

        {/* ════════════════════════ STATUS ════════════════════════ */}
        {categoria === 'status' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.status.titulo')}</h2>
                  <p className="cfg-secao__desc">
                    {t('pedido.config.status.descricao')}
                  </p>
                </div>
                {!statusCriando && !statusLoading && (
                  <button
                    type="button"
                    className="cfg-add-row-btn"
                    onClick={() => { setStatusCriando(true); setStatusEditandoId(null) }}
                  >
                    <Plus size={13} weight="bold" />
                    {t('pedido.config.status.novo_status')}
                  </button>
                )}
              </div>

              {statusLoading ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                  <GravityLoader texto={t('pedido.config.status.carregando')} tamanho="sm" />
                </div>
              ) : statusErro ? (
                <div className="cfg-status-erro">
                  <p className="cfg-status-erro__msg">{statusErro}</p>
                  <button
                    type="button"
                    className="cfg-btn-secundario cfg-btn-secundario--xs"
                    onClick={() => {
                      setStatusLoading(true)
                      setStatusErro(null)
                      pedidoConfigApi.listarStatus()
                        .then(res => {
                          const lista = res.data ?? []
                          setStatusList(lista)
                          sincronizarStatusLocal(lista)
                        })
                        .catch((err: Error) => {
                          console.warn('[Configuracoes/Status] Retry falhou:', err.message)
                          setStatusErro(t('pedido.config.status.erro_carregar'))
                        })
                        .finally(() => setStatusLoading(false))
                    }}
                  >
                    {t('pedido.config.status.tentar_novamente')}
                  </button>
                </div>
              ) : statusList.length === 0 ? (
                <p className="cfg-empty-text">{t('pedido.config.status.nenhum_status')}</p>
              ) : (
              <DndContext
                sensors={statusSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleStatusDragEnd}
              >
                <SortableContext
                  items={statusList.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="cfg-cards-lista">
                    {statusList.map(s => (
                      <StatusSortavel
                        key={s.id}
                        status={s}
                        editandoId={statusEditandoId}
                        editLabel={statusEditLabel}
                        editCor={statusEditCor}
                        onIniciarEdicao={iniciarEdicaoStatus}
                        onSalvarEdicao={salvarEdicaoStatus}
                        onCancelarEdicao={cancelarEdicaoStatus}
                        onChangeLabel={setStatusEditLabel}
                        onChangeCor={setStatusEditCor}
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
                      placeholder={t('pedido.config.status.placeholder_novo')}
                      value={statusNovoLabel}
                      onChange={e => setStatusNovoLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') adicionarStatus() }}
                      autoFocus
                    />
                    <div className="cfg-status-color-picker">
                      <span className="cfg-status-color-label">{t('pedido.config.status.cor')}</span>
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
                      {t('pedido.config.acao.salvar')}
                    </button>
                    <button
                      type="button"
                      className="cfg-btn-secundario cfg-btn-secundario--xs"
                      onClick={() => { setStatusCriando(false); setStatusNovoLabel(''); setStatusNovoCor('#818cf8') }}
                    >
                      {t('pedido.config.acao.cancelar')}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ════════════════════════ NOTIFICAÇÕES ════════════════════════ */}
        {categoria === 'notificacoes' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.notificacoes.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.notificacoes.descricao')}</p>
                </div>
              </div>

              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="nf-atrasado"
                  label={t('pedido.config.notificacoes.pedido_atrasado')}
                  desc={t('pedido.config.notificacoes.pedido_atrasado_desc')}
                  checked={notifConfig.pedidoAtrasado}
                  onChange={v => setNotifConfig(prev => ({ ...prev, pedidoAtrasado: v }))}
                />
                <ToggleRow
                  id="nf-novo"
                  label={t('pedido.config.notificacoes.novo_pedido')}
                  desc={t('pedido.config.notificacoes.novo_pedido_desc')}
                  checked={notifConfig.novoPedido}
                  onChange={v => setNotifConfig(prev => ({ ...prev, novoPedido: v }))}
                />
                <ToggleRow
                  id="nf-transferencia"
                  label={t('pedido.config.notificacoes.item_transferido')}
                  desc={t('pedido.config.notificacoes.item_transferido_desc')}
                  checked={notifConfig.itemTransferido}
                  onChange={v => setNotifConfig(prev => ({ ...prev, itemTransferido: v }))}
                />
                <ToggleRow
                  id="nf-excluido"
                  label={t('pedido.config.notificacoes.pedido_excluido')}
                  desc={t('pedido.config.notificacoes.pedido_excluido_desc')}
                  checked={notifConfig.pedidoExcluido}
                  onChange={v => setNotifConfig(prev => ({ ...prev, pedidoExcluido: v }))}
                />
                <ToggleRow
                  id="nf-importacao"
                  label={t('pedido.config.notificacoes.importacao_concluida')}
                  desc={t('pedido.config.notificacoes.importacao_concluida_desc')}
                  checked={notifConfig.importacaoConcluida}
                  onChange={v => setNotifConfig(prev => ({ ...prev, importacaoConcluida: v }))}
                />
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════ EXPORTAÇÃO ════════════════════════ */}
        {categoria === 'exportacao' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.exportacao.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.exportacao.descricao')}</p>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">{t('pedido.config.exportacao.formato_padrao')}</p>
                <div className="cfg-periodo-pills">
                  {(['csv', 'xlsx', 'pdf'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      className={`cfg-periodo-pill${exportConfig.formatoPadrao === fmt ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => atualizarExportConfig(prev => ({ ...prev, formatoPadrao: fmt }))}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="exp-colunas-usuario"
                  label={t('pedido.config.exportacao.incluir_colunas')}
                  desc={t('pedido.config.exportacao.incluir_colunas_desc')}
                  checked={exportConfig.incluirColunasUsuario}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, incluirColunasUsuario: v }))}
                />
                <ToggleRow
                  id="exp-itens"
                  label={t('pedido.config.exportacao.incluir_itens')}
                  desc={t('pedido.config.exportacao.incluir_itens_desc')}
                  checked={exportConfig.incluirItens}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, incluirItens: v }))}
                />
                <ToggleRow
                  id="exp-apenas-sel"
                  label={t('pedido.config.exportacao.apenas_selecionados')}
                  desc={t('pedido.config.exportacao.apenas_selecionados_desc')}
                  checked={exportConfig.apenasSelection}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, apenasSelection: v }))}
                />
                <ToggleRow
                  id="exp-cabecalho"
                  label={t('pedido.config.exportacao.incluir_cabecalho')}
                  desc={t('pedido.config.exportacao.incluir_cabecalho_desc')}
                  checked={exportConfig.incluirCabecalho}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, incluirCabecalho: v }))}
                />
              </div>

              <div className="cfg-campo-grupo" style={{ marginTop: '1.25rem' }}>
                <p className="cfg-campo-grupo__label">{t('pedido.config.exportacao.separador_csv')}</p>
                <div className="cfg-periodo-pills">
                  {(['virgula', 'ponto-virgula', 'tab'] as const).map(sep => (
                    <button
                      key={sep}
                      type="button"
                      className={`cfg-periodo-pill${exportConfig.separadorCsv === sep ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => atualizarExportConfig(prev => ({ ...prev, separadorCsv: sep }))}
                    >
                      {t(`pedido.config.exportacao.sep_${sep.replace('-', '_')}`)}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════ NUMERAÇÃO ════════════════════════ */}
        {categoria === 'numeracao' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.numeracao.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.numeracao.descricao')}</p>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">{t('pedido.config.numeracao.formato')}</p>
                <div className="cfg-num-formato">
                  <div className="cfg-num-campo">
                    <label className="cfg-num-campo__label" htmlFor="num-prefixo">{t('pedido.config.numeracao.prefixo')}</label>
                    <input
                      id="num-prefixo"
                      type="text"
                      className="cfg-input"
                      value={numConfig.prefixo}
                      onChange={e => setNumConfig(prev => ({ ...prev, prefixo: e.target.value }))}
                      maxLength={10}
                    />
                  </div>
                  <div className="cfg-num-campo">
                    <label className="cfg-num-campo__label" htmlFor="num-digitos">{t('pedido.config.numeracao.digitos')}</label>
                    <div className="cfg-periodo-pills">
                      {([3, 4, 5, 6] as const).map(d => (
                        <button
                          key={d}
                          type="button"
                          className={`cfg-periodo-pill${numConfig.digitosSequencia === d ? ' cfg-periodo-pill--ativo' : ''}`}
                          onClick={() => setNumConfig(prev => ({ ...prev, digitosSequencia: d }))}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="cfg-num-preview">
                    <span className="cfg-num-preview__label">{t('pedido.config.numeracao.preview')}</span>
                    <span className="cfg-num-preview__valor">{previewNumeracao}</span>
                  </div>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <ToggleRow
                  id="num-ano"
                  label={t('pedido.config.numeracao.incluir_ano')}
                  desc={`Ex.: ${numConfig.prefixo}${new Date().getFullYear()}/0001`}
                  checked={numConfig.incluirAno}
                  onChange={v => setNumConfig(prev => ({ ...prev, incluirAno: v }))}
                />
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">{t('pedido.config.numeracao.reiniciar')}</p>
                <div className="cfg-periodo-pills">
                  {(['nunca', 'ano', 'mes'] as const).map(op => (
                    <button
                      key={op}
                      type="button"
                      className={`cfg-periodo-pill${numConfig.reiniciar === op ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setNumConfig(prev => ({ ...prev, reiniciar: op }))}
                    >
                      {t(`pedido.config.numeracao.reiniciar_${op}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cfg-toggles-lista" style={{ marginTop: '0.5rem' }}>
                <ToggleRow
                  id="num-criar"
                  label={t('pedido.config.numeracao.auto_criar')}
                  checked={numConfig.automaticoCriar}
                  onChange={v => setNumConfig(prev => ({ ...prev, automaticoCriar: v }))}
                />
                <ToggleRow
                  id="num-duplicar"
                  label={t('pedido.config.numeracao.auto_duplicar')}
                  checked={numConfig.automaticoDuplicar}
                  onChange={v => setNumConfig(prev => ({ ...prev, automaticoDuplicar: v }))}
                />
                <ToggleRow
                  id="num-consolidar"
                  label={t('pedido.config.numeracao.auto_consolidar')}
                  checked={numConfig.automaticoConsolidar}
                  onChange={v => setNumConfig(prev => ({ ...prev, automaticoConsolidar: v }))}
                />
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════ TEMPLATES PDF ════════════════════════ */}
        {categoria === 'templates-pdf' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.templates_pdf.titulo')}</h2>
                  <p className="cfg-secao__desc">
                    {t('pedido.config.templates_pdf.desc')}{' '}
                    <code className="cfg-code">{'{{numero_pedido}}'}</code>,{' '}
                    <code className="cfg-code">{'{{exportador}}'}</code>,{' '}
                    <code className="cfg-code">{'{{itens}}'}</code>
                  </p>
                </div>
                {!templateCriandoNovo && !templateEditando && (
                  <button type="button" className="cfg-add-row-btn" onClick={iniciarNovoTemplate}>
                    <Plus size={13} weight="bold" />
                    {t('pedido.config.templates_pdf.novo_template')}
                  </button>
                )}
              </div>

              {templateLoading && (
                <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                  <GravityLoader texto={t('pedido.config.templates_pdf.carregando')} tamanho="sm" />
                </div>
              )}

              {!templateLoading && (
                <>
                  {/* ── Formulário inline ── */}
                  {(templateCriandoNovo || templateEditando) && (
                    <div className="cfg-tpl-form">
                      <div className="cfg-tpl-form__fields">
                        <div className="cfg-tpl-form__field">
                          <label className="cfg-num-campo__label" htmlFor="tpl-nome">{t('pedido.config.templates_pdf.label_nome')}</label>
                          <input
                            id="tpl-nome"
                            type="text"
                            className="cfg-input"
                            placeholder="Ex.: Template Proforma"
                            value={templateNome}
                            onChange={e => setTemplateNome(e.target.value)}
                          />
                        </div>

                        {/* ── Variáveis disponíveis ── */}
                        <div className="cfg-tpl-form__field cfg-tpl-form__field--full">
                          <label className="cfg-num-campo__label">{t('pedido.config.templates_pdf.label_variaveis')}</label>
                          <div className="cfg-tpl-variaveis">
                            {[
                              { grupoKey: 'grupo_pedido',    vars: ['{{numero_pedido}}','{{tipo_operacao}}','{{status}}','{{incoterm}}','{{moeda_pedido}}','{{numero_proforma}}','{{numero_invoice}}','{{referencia_importador}}','{{referencia_exportador}}','{{condicao_pagamento}}'] },
                              { grupoKey: 'grupo_parceiros', vars: ['{{exportador}}','{{fabricante}}','{{importador}}'] },
                              { grupoKey: 'grupo_financeiro',vars: ['{{valor_total_pedido}}','{{peso_liquido_total}}','{{peso_bruto_total}}','{{cubagem_total}}'] },
                              { grupoKey: 'grupo_datas',     vars: ['{{data_emissao_pedido}}','{{data_embarque}}','{{data_prevista_pedido_pronto}}'] },
                              { grupoKey: 'grupo_itens',     vars: ['{{#each itens}}','{{part_number}}','{{ncm}}','{{descricao_item}}','{{quantidade_inicial_pedido}}','{{quantidade_atual_pedido}}','{{unidade}}','{{valor_por_unidade_item}}','{{valor_total_item}}','{{/each}}'] },
                            ].map(({ grupoKey, vars }) => (
                              <div key={grupoKey} className="cfg-tpl-variaveis__grupo">
                                <span className="cfg-tpl-variaveis__grupo-label">{t(`pedido.config.templates_pdf.${grupoKey}`)}</span>
                                <div className="cfg-tpl-variaveis__chips">
                                  {vars.map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      className="cfg-tpl-variavel-chip"
                                      onClick={() => inserirVariavel(v)}
                                      title={`Inserir ${v}`}
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="cfg-tpl-form__field cfg-tpl-form__field--full">
                          <label className="cfg-num-campo__label" htmlFor="tpl-conteudo">{t('pedido.config.templates_pdf.label_conteudo')}</label>
                          <textarea
                            id="tpl-conteudo"
                            ref={templateTextareaRef}
                            className="cfg-textarea cfg-textarea--codigo"
                            rows={10}
                            placeholder={'<h1>{{numero_pedido}}</h1>\n<p>Exportador: {{exportador}}</p>\n{{#each itens}}\n  <p>{{part_number}} — {{quantidade_inicial_pedido}} {{unidade}}</p>\n{{/each}}'}
                            value={templateConteudo}
                            onChange={e => setTemplateConteudo(e.target.value)}
                            spellCheck={false}
                          />
                        </div>
                      </div>
                      <div className="cfg-tpl-form__actions">
                        <button type="button" className="cfg-btn-primario" onClick={salvarTemplate}>
                          <FloppyDisk size={14} weight="bold" />
                          {t('pedido.config.templates_pdf.salvar')}
                        </button>
                        <button type="button" className="cfg-btn-secundario" onClick={cancelarEdicaoTemplate}>
                          {t('pedido.config.templates_pdf.cancelar')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Lista de templates ── */}
                  {templates.length === 0 && !templateCriandoNovo ? (
                    <p className="cfg-empty">{t('pedido.config.templates_pdf.empty')}</p>
                  ) : (
                    <div className="cfg-lista-simples">
                      {templates.map(tpl => (
                        <div key={tpl.id} className={`cfg-lista-simples__row${templateEditando === tpl.id ? ' cfg-lista-simples__row--editando' : ''}`}>
                          <div className="cfg-lista-simples__info">
                            <span className="cfg-lista-simples__nome">{tpl.nome}</span>
                            <span className="cfg-lista-simples__meta">
                              {t('pedido.config.templates_pdf.criado_em')} {new Date(tpl.criadoEm).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="cfg-lista-simples__acoes">
                            <TooltipGlobal descricao={t('pedido.config.templates_pdf.tooltip_editar')}>
                              <button
                                type="button"
                                className="cfg-eye-btn"
                                onClick={() => iniciarEdicaoTemplate(tpl)}
                                aria-label={t('pedido.config.templates_pdf.aria_editar')}
                              >
                                <PencilSimple size={14} weight="bold" />
                              </button>
                            </TooltipGlobal>
                            <TooltipGlobal descricao={t('pedido.config.templates_pdf.tooltip_excluir')}>
                              <button
                                type="button"
                                className="cfg-remove-btn"
                                onClick={() => excluirTemplate(tpl.id)}
                                aria-label={t('pedido.config.templates_pdf.aria_excluir')}
                              >
                                <Trash size={14} weight="bold" />
                              </button>
                            </TooltipGlobal>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {/* ════════════════════════ REGRAS ════════════════════════ */}
        {categoria === 'regras' && (
          <div className="cfg-cards-wrapper">

            {/* Duplicar */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.regras.duplicar.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.regras.duplicar.desc')}</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="dup-datas"
                  label={t('pedido.config.regras.duplicar.copiar_datas')}
                  checked={regrasConfig.duplicar.copiarDatas}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, copiarDatas: v } }))}
                />
                <ToggleRow
                  id="dup-numero"
                  label={t('pedido.config.regras.duplicar.numeracao_auto')}
                  checked={regrasConfig.duplicar.numeracaoAutomatica}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, numeracaoAutomatica: v } }))}
                />
                <ToggleRow
                  id="dup-itens"
                  label={t('pedido.config.regras.duplicar.duplicar_itens')}
                  desc={t('pedido.config.regras.duplicar.duplicar_itens_desc')}
                  checked={regrasConfig.duplicar.duplicarItens}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, duplicarItens: v } }))}
                />
              </div>
              <div className="cfg-campo-grupo" style={{ marginTop: '1rem' }}>
                <p className="cfg-campo-grupo__label">{t('pedido.config.regras.duplicar.status_inicial_label')}</p>
                <div className="cfg-periodo-pills">
                  {([
                    { id: 'rascunho',     labelKey: 'pedido.config.regras.duplicar.status_rascunho'     },
                    { id: 'aberto',       labelKey: 'pedido.config.regras.duplicar.status_aberto'       },
                    { id: 'em_andamento', labelKey: 'pedido.config.regras.duplicar.status_em_andamento' },
                  ] as const).map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`cfg-periodo-pill${regrasConfig.duplicar.statusInicial === s.id ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, statusInicial: s.id } }))}
                    >
                      {t(s.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Duplicar item */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.regras.duplicar_item.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.regras.duplicar_item.desc')}</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="dup-item-numero"
                  label={t('pedido.config.regras.duplicar_item.numeracao_auto')}
                  checked={regrasConfig.duplicarItem.numeracaoAutomatica}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicarItem: { ...prev.duplicarItem, numeracaoAutomatica: v } }))}
                />
                <ToggleRow
                  id="dup-item-datas"
                  label={t('pedido.config.regras.duplicar_item.copiar_datas')}
                  checked={regrasConfig.duplicarItem.copiarDatas}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicarItem: { ...prev.duplicarItem, copiarDatas: v } }))}
                />
                <ToggleRow
                  id="dup-item-dados"
                  label={t('pedido.config.regras.duplicar_item.copiar_dados')}
                  desc={t('pedido.config.regras.duplicar_item.copiar_dados_desc')}
                  checked={regrasConfig.duplicarItem.copiarDados}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicarItem: { ...prev.duplicarItem, copiarDados: v } }))}
                />
              </div>
            </section>

            {/* Excluir */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.regras.excluir.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.regras.excluir.desc')}</p>
                </div>
              </div>
              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">{t('pedido.config.regras.excluir.status_permitidos_label')}</p>
                <div className="cfg-check-lista">
                  {statusList.map(s => (
                    <label key={s.id} className="cfg-check-item">
                      <input
                        type="checkbox"
                        className="cfg-check-item__input"
                        checked={regrasConfig.excluir.statusPermitidos.includes(s.nome)}
                        onChange={() => toggleStatusExcluir(s.nome)}
                      />
                      <span className="cfg-check-item__label">{s.rotulo}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="exc-sem-itens"
                  label={t('pedido.config.regras.excluir.sem_itens')}
                  desc={t('pedido.config.regras.excluir.sem_itens_desc')}
                  checked={regrasConfig.excluir.semItensPermitido}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, excluir: { ...prev.excluir, semItensPermitido: v } }))}
                />
                <ToggleRow
                  id="exc-preview"
                  label={t('pedido.config.regras.excluir.confirmar_preview')}
                  checked={regrasConfig.excluir.confirmarComPreview}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, excluir: { ...prev.excluir, confirmarComPreview: v } }))}
                />
              </div>
            </section>

            {/* Transferir */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.regras.transferir.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.regras.transferir.desc')}</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="tra-encerrar"
                  label={t('pedido.config.regras.transferir.encerrar_origem')}
                  checked={regrasConfig.transferir.encerrarOrigemZero}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, encerrarOrigemZero: v } }))}
                />
                <ToggleRow
                  id="tra-excluir-item"
                  label={t('pedido.config.regras.transferir.excluir_item_origem')}
                  checked={regrasConfig.transferir.excluirItemOrigemZero}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, excluirItemOrigemZero: v } }))}
                />
                <ToggleRow
                  id="tra-excluir-pedido"
                  label={t('pedido.config.regras.transferir.excluir_pedido_origem')}
                  checked={regrasConfig.transferir.excluirPedidoOrigemZero}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, excluirPedidoOrigemZero: v } }))}
                />
                <ToggleRow
                  id="tra-bloquear-acima-inicial"
                  label={t('pedido.config.regras.transferir.bloquear_acima_inicial')}
                  desc={t('pedido.config.regras.transferir.bloquear_acima_inicial_desc')}
                  checked={regrasConfig.transferir.bloquearTransferenciaAcimaInicial}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, bloquearTransferenciaAcimaInicial: v } }))}
                />
              </div>
            </section>

            {/* Consolidar */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.regras.consolidar.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.regras.consolidar.desc')}</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="con-avisos"
                  label={t('pedido.config.regras.consolidar.avisos_divergentes')}
                  checked={regrasConfig.consolidar.avisosDivergentes}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, avisosDivergentes: v } }))}
                />
                <ToggleRow
                  id="con-fundir"
                  label={t('pedido.config.regras.consolidar.fundir_part_number')}
                  desc={t('pedido.config.regras.consolidar.fundir_part_number_desc')}
                  checked={regrasConfig.consolidar.fundirPartNumber}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, fundirPartNumber: v } }))}
                />
                <ToggleRow
                  id="con-usuario"
                  label={t('pedido.config.regras.consolidar.usuario_escolhe')}
                  desc={t('pedido.config.regras.consolidar.usuario_escolhe_desc')}
                  checked={regrasConfig.consolidar.usuarioEscolheDivergentes}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, usuarioEscolheDivergentes: v } }))}
                />
              </div>
              <div className="cfg-campo-grupo" style={{ marginTop: '1rem' }}>
                <p className="cfg-campo-grupo__label">{t('pedido.config.regras.consolidar.numero_resultante_label')}</p>
                <div className="cfg-periodo-pills">
                  {([
                    { id: 'mais_antigo',  labelKey: 'pedido.config.regras.consolidar.num_mais_antigo'  },
                    { id: 'automatico',   labelKey: 'pedido.config.regras.consolidar.num_automatico'   },
                    { id: 'mais_recente', labelKey: 'pedido.config.regras.consolidar.num_mais_recente' },
                  ] as const).map(op => (
                    <button
                      key={op.id}
                      type="button"
                      className={`cfg-periodo-pill${regrasConfig.consolidar.numeroPedidoResultante === op.id ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, numeroPedidoResultante: op.id } }))}
                    >
                      {t(op.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Alertas ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.regras.alertas.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.regras.alertas.desc')}</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="alerta-numero-duplicado"
                  label={t('pedido.config.regras.alertas.numero_duplicado')}
                  desc={t('pedido.config.regras.alertas.numero_duplicado_desc')}
                  checked={regrasConfig.alertas.numeroDuplicado}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, numeroDuplicado: v } }))}
                />
                <ToggleRow
                  id="alerta-valor-total-divergente"
                  label={t('pedido.config.regras.alertas.valor_total_divergente')}
                  desc={t('pedido.config.regras.alertas.valor_total_divergente_desc')}
                  checked={regrasConfig.alertas.valorTotalDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, valorTotalDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-quantidade-total-divergente"
                  label={t('pedido.config.regras.alertas.qtd_total_divergente')}
                  desc={t('pedido.config.regras.alertas.qtd_total_divergente_desc')}
                  checked={regrasConfig.alertas.quantidadeTotalDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, quantidadeTotalDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-quantidade-pronta-divergente"
                  label={t('pedido.config.regras.alertas.qtd_pronta_divergente')}
                  desc={t('pedido.config.regras.alertas.qtd_pronta_divergente_desc')}
                  checked={regrasConfig.alertas.quantidadeProntaDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, quantidadeProntaDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-peso-liquido-divergente"
                  label={t('pedido.config.regras.alertas.peso_liq_divergente')}
                  desc={t('pedido.config.regras.alertas.peso_liq_divergente_desc')}
                  checked={regrasConfig.alertas.pesoLiquidoDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, pesoLiquidoDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-peso-bruto-divergente"
                  label={t('pedido.config.regras.alertas.peso_bruto_divergente')}
                  desc={t('pedido.config.regras.alertas.peso_bruto_divergente_desc')}
                  checked={regrasConfig.alertas.pesoBrutoDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, pesoBrutoDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-cubagem-divergente"
                  label={t('pedido.config.regras.alertas.cubagem_divergente')}
                  desc={t('pedido.config.regras.alertas.cubagem_divergente_desc')}
                  checked={regrasConfig.alertas.cubagemDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, cubagemDivergente: v } }))}
                />
              </div>
            </section>

            {/* Botão salvar regras */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button
                type="button"
                className="cfg-btn-primario"
                disabled={!regrasAlterados}
                onClick={salvarRegras}
              >
                <FloppyDisk size={14} weight="bold" />
                {regrasAlterados ? t('pedido.config.regras.btn_salvar_alteracoes') : t('pedido.config.regras.btn_salvo')}
              </button>
            </div>

          </div>
        )}

        {/* ════════════════════════ CATEGORIAS ANEXOS ════════════════════════ */}
        {categoria === 'categorias-anexos' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.categ_anexos.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.categ_anexos.desc')}</p>
                </div>
                {!categCriando && (
                  <button
                    type="button"
                    className="cfg-add-row-btn"
                    onClick={() => setCategCriando(true)}
                  >
                    <Plus size={13} weight="bold" />
                    {t('pedido.config.categ_anexos.nova_categoria')}
                  </button>
                )}
              </div>

              {/* Formulário de nova categoria */}
              {categCriando && (
                <div className="cfg-tpl-form cfg-tpl-form--inline">
                  <input
                    type="text"
                    className="cfg-input cfg-input--grow"
                    placeholder={t('pedido.config.categ_anexos.placeholder_nome')}
                    value={categNovaNome}
                    onChange={e => setCategNovaNome(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') adicionarCateg() }}
                    autoFocus
                  />
                  <button type="button" className="cfg-btn-primario" onClick={adicionarCateg}>
                    <FloppyDisk size={14} weight="bold" />
                    {t('pedido.config.categ_anexos.salvar')}
                  </button>
                  <button type="button" className="cfg-btn-secundario" onClick={() => { setCategCriando(false); setCategNovaNome('') }}>
                    {t('pedido.config.categ_anexos.cancelar')}
                  </button>
                </div>
              )}

              {categAnexos.length === 0 ? (
                <p className="cfg-empty">{t('pedido.config.categ_anexos.empty')}</p>
              ) : (
                <div className="cfg-lista-simples">
                  {categAnexos.map(cat => (
                    <div key={cat.id} className="cfg-lista-simples__row">
                      <div className="cfg-lista-simples__info">
                        {categEditandoId === cat.id ? (
                          <input
                            type="text"
                            className="cfg-input cfg-input--inline"
                            value={categNomeEdit}
                            onChange={e => setCategNomeEdit(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') salvarEdicaoCateg() }}
                            autoFocus
                          />
                        ) : (
                          <span className="cfg-lista-simples__nome">{cat.nome}</span>
                        )}
                        {cat.sistema && (
                          <span className="cfg-badge-sistema">{t('pedido.config.categ_anexos.badge_sistema')}</span>
                        )}
                      </div>
                      <div className="cfg-lista-simples__acoes">
                        {categEditandoId === cat.id ? (
                          <>
                            <button type="button" className="cfg-btn-primario cfg-btn-primario--xs" onClick={salvarEdicaoCateg}>
                              <FloppyDisk size={13} weight="bold" />
                            </button>
                            <button type="button" className="cfg-btn-secundario cfg-btn-secundario--xs" onClick={() => { setCategEditandoId(null); setCategNomeEdit('') }}>
                              <X size={13} weight="bold" />
                            </button>
                          </>
                        ) : (
                          <>
                            {!cat.sistema && (
                              <TooltipGlobal descricao={t('pedido.config.categ_anexos.tooltip_renomear')}>
                                <button
                                  type="button"
                                  className="cfg-eye-btn"
                                  onClick={() => iniciarEdicaoCateg(cat)}
                                  aria-label={t('pedido.config.categ_anexos.aria_renomear')}
                                >
                                  <PencilSimple size={14} weight="bold" />
                                </button>
                              </TooltipGlobal>
                            )}
                            {!cat.sistema && (
                              <TooltipGlobal descricao={t('pedido.config.categ_anexos.tooltip_excluir')}>
                                <button
                                  type="button"
                                  className="cfg-remove-btn"
                                  onClick={() => excluirCateg(cat.id)}
                                  aria-label={t('pedido.config.categ_anexos.aria_excluir')}
                                >
                                  <Trash size={14} weight="bold" />
                                </button>
                              </TooltipGlobal>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ════════════════════════ COLUNAS ════════════════════════ */}
        {COLUNAS_FILHOS.includes(categoria) && (
          <div className="cfg-cards-wrapper">

            {/* ── Casas Decimais ── */}
            {categoria === 'colunas-casas-decimais' && <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.colunas.casas_decimais.titulo')}</h2>
                  <p className="cfg-secao__desc">
                    {t('pedido.config.colunas.casas_decimais.desc')}
                  </p>
                </div>
              </div>

              {/* Body — grupo Pedido */}
              <div className="cfg-colunas-lista">
                <ConfiguracaoSecaoGlobal label={t('pedido.config.colunas.casas_decimais.grupo_pedido')} hint={t('pedido.config.colunas.casas_decimais.grupo_pedido_hint')} />
                {COLUNAS_NUMERICAS.map(col => {
                  const val = pendingCasas[col.campo] ?? col.padrao
                  return (
                    <div key={col.campo} className="cfg-coluna-row">
                      <div className="cfg-coluna-row__info">
                        <span className="cfg-coluna-row__label">{t(`pedido.config.colunas.casas_decimais.col_${col.campo}`)}</span>
                        {col.itemHint && (
                          <span className="cfg-coluna-row__hint">{t(`pedido.config.colunas.casas_decimais.hint_${col.campo}`)}</span>
                        )}
                      </div>
                      <div className="cfg-casas-stepper" aria-label={t('pedido.config.colunas.casas_decimais.aria_casas_para', { label: t(`pedido.config.colunas.casas_decimais.col_${col.campo}`) })}>
                        <button type="button" className="cfg-casas-stepper__btn" disabled={val <= 0} onClick={() => handleCasasDecimaisChange(col.campo, val - 1)} aria-label={t('pedido.config.colunas.casas_decimais.aria_diminuir')}>−</button>
                        <span className="cfg-casas-stepper__value">{val}</span>
                        <button type="button" className="cfg-casas-stepper__btn" disabled={val >= 8} onClick={() => handleCasasDecimaisChange(col.campo, val + 1)} aria-label={t('pedido.config.colunas.casas_decimais.aria_aumentar')}>+</button>
                      </div>
                    </div>
                  )
                })}

                {/* Grupo de colunas personalizadas numéricas (se houver) */}
                {colunasUsuarioApi_.filter(col => col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula').length > 0 && (
                  <>
                    <ConfiguracaoSecaoGlobal label={t('pedido.config.colunas.casas_decimais.grupo_personalizadas')} />
                    {colunasUsuarioApi_
                      .filter(col => col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula')
                      .map(col => {
                        const val = pendingCasas[col.id] ?? 2
                        return (
                          <div key={col.id} className="cfg-coluna-row">
                            <span className="cfg-coluna-row__label">{col.nome}</span>
                            <div className="cfg-casas-stepper" aria-label={t('pedido.config.colunas.casas_decimais.aria_casas_para', { label: col.nome })}>
                              <button type="button" className="cfg-casas-stepper__btn" disabled={val <= 0} onClick={() => handleCasasDecimaisChange(col.id, val - 1)} aria-label={t('pedido.config.colunas.casas_decimais.aria_diminuir')}>−</button>
                              <span className="cfg-casas-stepper__value">{val}</span>
                              <button type="button" className="cfg-casas-stepper__btn" disabled={val >= 8} onClick={() => handleCasasDecimaisChange(col.id, val + 1)} aria-label={t('pedido.config.colunas.casas_decimais.aria_aumentar')}>+</button>
                            </div>
                          </div>
                        )
                      })
                    }
                  </>
                )}
              </div>

              {/* Banner de confirmação de migração */}
              {aguardandoConfirmacaoCasas && auditoriaCasas && (
                <div className="cfg-migracao-banner">
                  <p className="cfg-migracao-banner__texto">
                    {t('pedido.config.colunas.casas_decimais.banner_pre')} <strong>{auditoriaCasas.total_pedidos}</strong> {t('pedido.config.colunas.casas_decimais.banner_mid')} <strong>{auditoriaCasas.total_itens}</strong> {t('pedido.config.colunas.casas_decimais.banner_post')}
                  </p>
                  <div className="cfg-migracao-banner__acoes">
                    <button type="button" className="cfg-btn-secundario cfg-btn-secundario--xs" onClick={restaurarCasasDecimais}>{t('pedido.config.colunas.casas_decimais.btn_cancelar_migracao')}</button>
                    <button type="button" className="cfg-btn-primario cfg-btn-primario--xs" onClick={confirmarMigracaoCasas} disabled={salvandoCasas}>
                      {salvandoCasas ? t('pedido.config.colunas.casas_decimais.btn_iniciando') : t('pedido.config.colunas.casas_decimais.btn_confirmar_migracao')}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="cfg-secao__footer">
                <BotaoCancelar dirty={casasDirty} rotulo={t('pedido.config.colunas.casas_decimais.btn_descartar')} onClick={restaurarCasasDecimais} />
                <BotaoSalvar   dirty={casasDirty} rotulo={t('pedido.config.acao.salvar')}    onClick={salvarCasasDecimais} loading={salvandoCasas} />
              </div>
            </section>}

            {/* ── Formato de Data ── */}
            {categoria === 'colunas-formato-data' && <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.colunas.formato_data.titulo')}</h2>
                  <p className="cfg-secao__desc">
                    {t('pedido.config.colunas.formato_data.desc')}
                  </p>
                </div>
              </div>

              <div className="cfg-campo-linha" style={{ marginTop: 20 }}>
                <div className="cfg-formato-data-grid">
                  {FORMATOS_DATA.map(fmt => (
                    <button
                      key={fmt.valor}
                      type="button"
                      className={`cfg-formato-data-opcao${pendingFormato === fmt.valor ? ' cfg-formato-data-opcao--ativo' : ''}`}
                      onClick={() => setPendingFormato(fmt.valor)}
                    >
                      <span className="cfg-formato-data-label">{fmt.label}</span>
                      <span className="cfg-formato-data-exemplo">{fmt.exemplo}</span>
                      <span className="cfg-formato-data-regiao">{t(`pedido.config.colunas.formato_data.regiao_${FMT_REGIAO_KEYS[fmt.valor] ?? 'brasil_europa'}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview ao vivo */}
              <div className="cfg-formato-data-preview" style={{ marginTop: 16 }}>
                <span className="cfg-formato-data-preview__label">{t('pedido.config.colunas.formato_data.preview_label')}</span>
                <strong className="cfg-formato-data-preview__valor">
                  {(() => {
                    const hoje = new Date()
                    const d = String(hoje.getDate()).padStart(2, '0')
                    const m = String(hoje.getMonth() + 1).padStart(2, '0')
                    const aaaa = String(hoje.getFullYear())
                    const aa = aaaa.slice(2)
                    switch (pendingFormato) {
                      case 'DD/MM/AAAA': return `${d}/${m}/${aaaa}`
                      case 'MM/DD/AAAA': return `${m}/${d}/${aaaa}`
                      case 'AAAA-MM-DD': return `${aaaa}-${m}-${d}`
                      case 'DD.MM.AAAA': return `${d}.${m}.${aaaa}`
                      case 'DD/MM/AA':   return `${d}/${m}/${aa}`
                      default:           return `${d}/${m}/${aaaa}`
                    }
                  })()}
                </strong>
              </div>

              <div className="cfg-secao__footer" style={{ marginTop: 20 }}>
                <BotaoCancelar
                  dirty={formatoDirty && !salvandoFormato}
                  onClick={() => setPendingFormato(formatoData)}
                />
                <BotaoSalvar
                  dirty={formatoDirty}
                  carregando={salvandoFormato}
                  onClick={salvarFormatoData}
                />
              </div>
            </section>}

            {/* ── Colunas Personalizadas ── */}
            {categoria === 'colunas-personalizadas' && <section className="cfg-secao" ref={novaColunaSectionRef}>
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.colunas.personalizadas.titulo')}</h2>
                  <p className="cfg-secao__desc">
                    {t('pedido.config.colunas.personalizadas.desc')}
                  </p>
                </div>
              </div>

              {/* ── Ativas ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ConfiguracaoSecaoGlobal
                  label={t('pedido.config.colunas.personalizadas.label_ativas')}
                  count={pendingColunas.length}
                  hint={t('pedido.config.colunas.personalizadas.hint_ativas')}
                />
                <BotaoGlobal variante="primario" onClick={() => setCriandoColuna(true)}>
                  <Plus size={16} weight="bold" />
                  {t('pedido.config.colunas.personalizadas.btn_criar_coluna')}
                </BotaoGlobal>
              </div>

              {criandoColuna && (
                <ModalNovaColunaUsuario
                  onFechar={() => setCriandoColuna(false)}
                  onSalvo={handleColunaCriadaViaModal}
                  todasColunas={colunasUsuarioApi_}
                />
              )}
              {pendingColunas.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '1.5rem', textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                  border: '1px dashed rgba(255,255,255,0.08)',
                }}>
                  <Columns size={28} weight="duotone" style={{ color: 'var(--ws-muted, #64748b)' }} />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                    {t('pedido.config.colunas.personalizadas.empty_titulo')}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                    {t('pedido.config.colunas.personalizadas.empty_desc')}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndColunas}>
                      <SortableContext items={pendingColunas.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {pendingColunas.map(col => (
                          <ColunaSortavel
                            key={col.id}
                            col={col}
                            onToggleAtivo={() => handleToggleAtivoColuna(col.id)}
                            onRemover={() => handleRemoverColuna(col.id)}
                            onEditar={() => abrirEdicaoColuna(col)}
                            editando={false}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                  <div className="cfg-secao__footer" style={{ marginTop: '0.75rem' }}>
                    <BotaoCancelar dirty={colunasDirty} rotulo={t('pedido.config.colunas.personalizadas.btn_descartar')} onClick={cancelarOrdemColunas} />
                    <BotaoSalvar   dirty={colunasDirty} carregando={salvandoColunas} rotulo={t('pedido.config.colunas.personalizadas.btn_salvar_ordem')} onClick={salvarOrdemColunas} />
                  </div>
                </>
              )}

              {/* ── Modal Editar Coluna ── */}
              {editandoColuna && (
                <ModalNovaColunaUsuario
                  colunaEdicao={editandoColuna}
                  onFechar={fecharEdicaoColuna}
                  onSalvo={handleColunaEditadaSalva}
                  todasColunas={colunasUsuarioApi_}
                />
              )}

              {/* Formulário inline legado — mantido para referência, oculto */}
              {false && <div><div>

                  {/* Nome */}
                  <div className="cfg-form-group">
                    <label className="cfg-form-label" htmlFor="nova-coluna-nome">{t('pedido.config.colunas.personalizadas.form_nome_coluna')} <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
                    <input
                      id="nova-coluna-nome"
                      ref={novaColunaInputRef}
                      type="text"
                      className="cfg-form-input"
                      placeholder={t('pedido.config.colunas.personalizadas.form_nome_placeholder')}
                      value={novaColuna.nome}
                      onChange={e => setNovaColuna(prev => ({ ...prev, nome: e.target.value }))}
                      maxLength={50}
                    />
                  </div>

                  {/* Tipo */}
                  <div className="cfg-form-group">
                    <label className="cfg-form-label">{t('pedido.config.colunas.personalizadas.form_tipo_coluna')} <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
                    <div className="cfg-tipo-grid">
                      {TIPOS_COLUNA.map(tipo => (
                        <button
                          key={tipo.id}
                          type="button"
                          className={`cfg-tipo-btn${novaColuna.tipo === tipo.id ? ' cfg-tipo-btn--ativo' : ''}`}
                          onClick={() => setNovaColuna(prev => ({ ...prev, tipo: tipo.id }))}
                          aria-pressed={novaColuna.tipo === tipo.id}
                        >
                          <span className="cfg-tipo-btn__icone">{tipo.icone}</span>
                          <span className="cfg-tipo-btn__label">{t(`pedido.config.colunas.personalizadas.tipo_${tipo.id}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expressão (formula) — editor tokenizado pill-based */}
                  {novaColuna.tipo === 'formula' && (
                    <>
                      {/* Área de tokens */}
                      <div className="cfg-form-group" style={{ marginBottom: 0 }}>
                        <label className="cfg-form-label">
                          {t('pedido.config.colunas.personalizadas.formula_expressao')} <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span>
                        </label>
                      </div>
                      <div className="cfg-campo-calc-item__formula" style={{ border: 'none', padding: 0 }}>
                        <div className={[
                          'cfg-saldo-tokens',
                          formulaErro   ? 'cfg-saldo-tokens--erro' : '',
                          formulaValida && formulaTokens.length > 0 ? 'cfg-saldo-tokens--ok' : '',
                        ].filter(Boolean).join(' ')}>
                          {formulaTokens.length === 0 ? (
                            <span className="cfg-saldo-tokens__placeholder">
                              {t('pedido.config.colunas.personalizadas.formula_placeholder')}
                            </span>
                          ) : (
                            formulaTokens.map((token, i) =>
                              token.tipo === 'campo' ? (
                                <span key={i} className="cfg-saldo-token cfg-saldo-token--campo">
                                  <span className="cfg-saldo-token__label">{token.label}</span>
                                  <button type="button" className="cfg-saldo-token__remove" onClick={() => removerTokenFormula(i)} aria-label={`Remover ${token.label}`}>
                                    <X size={9} weight="bold" />
                                  </button>
                                </span>
                              ) : (
                                <button key={i} type="button" className="cfg-saldo-token cfg-saldo-token--op" onClick={() => removerTokenFormula(i)} title="Clique para remover">
                                  {token.valor}
                                </button>
                              )
                            )
                          )}
                        </div>

                        {/* Operadores */}
                        <div className="cfg-saldo-ops">
                          {(['+', '-', '*', '/', '(', ')'] as const).map(op => (
                            <button key={op} type="button" className="cfg-saldo-op-btn" onClick={() => adicionarOpFormulaToken(op)}>{op}</button>
                          ))}
                          {formulaTokens.length > 0 && (
                            <button type="button" className="cfg-saldo-op-btn cfg-saldo-op-btn--clear" onClick={() => setFormulaTokens([])}>{t('pedido.config.colunas.personalizadas.formula_limpar')}</button>
                          )}
                        </div>
                      </div>

                      {/* Campos disponíveis */}
                      <div className="cfg-campo-calc-item__campos" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0', padding: '0.75rem 0 0' }}>
                        <span className="cfg-campo-calc-item__campos-label">{t('pedido.config.colunas.personalizadas.formula_adicionar_campo')}</span>
                        {CAMPOS_FORMULA.flatMap(g => g.campos).map(campo => (
                          <button key={campo.chave} type="button" className="cfg-formula-chip" onClick={() => adicionarCampoFormulaToken(campo)}>
                            {campo.label}
                          </button>
                        ))}
                      </div>

                      {/* Gabi */}
                      {(() => {
                        if (formulaTokens.length === 0) return (
                          <div className="cfg-gabi-card cfg-gabi-card--info" role="note" style={{ marginTop: '0.5rem' }}>
                            <div className="cfg-gabi-card__header">
                              <span className="cfg-gabi-card__ico">✦</span>
                              <span className="cfg-gabi-card__titulo">Gabi · {t('pedido.config.colunas.personalizadas.gabi_como_montar')}</span>
                            </div>
                            <p className="cfg-gabi-card__texto">
                              {t('pedido.config.colunas.personalizadas.gabi_instrucoes')}
                            </p>
                          </div>
                        )
                        if (!formulaErro && !formulaGabi && !formulaValida) return null
                        const variante = formulaErro ? 'erro' : formulaGabi ? 'aviso' : 'ok'
                        const titulo   = formulaErro ? t('pedido.config.colunas.personalizadas.gabi_erro') : formulaGabi ? formulaGabi.titulo : t('pedido.config.colunas.personalizadas.gabi_formula_valida')
                        const texto    = formulaErro ?? formulaGabi?.texto ?? t('pedido.config.colunas.personalizadas.gabi_ok_preencher')
                        const sugestao = formulaGabi?.sugestao
                        return (
                          <div className={`cfg-gabi-card cfg-gabi-card--${variante}`} role="note" aria-live="polite" style={{ marginTop: '0.5rem' }}>
                            <div className="cfg-gabi-card__header">
                              <span className="cfg-gabi-card__ico">✦</span>
                              <span className="cfg-gabi-card__titulo">Gabi · {titulo}</span>
                            </div>
                            <p className="cfg-gabi-card__texto">{texto}</p>
                            {sugestao && (
                              <div className="cfg-gabi-card__sugestao-row">
                                <code className="cfg-gabi-card__sugestao">{sugestao}</code>
                                <button
                                  type="button"
                                  className="cfg-gabi-card__usar"
                                  onClick={() => {
                                    const tokens = sugestao.trim().split(/\s+/).map(part => {
                                      const campo = CAMPOS_FORMULA.flatMap(g => g.campos).find(c => c.chave === part)
                                      if (campo) return { tipo: 'campo' as const, chave: campo.chave, label: campo.label }
                                      return { tipo: 'op' as const, valor: part }
                                    })
                                    setFormulaTokens(tokens)
                                  }}
                                  title={t('pedido.config.colunas.personalizadas.gabi_usar')}
                                >
                                  {t('pedido.config.colunas.personalizadas.gabi_usar')}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </>
                  )}

                  {/* Opções (select / tipo_documento) */}
                  {(novaColuna.tipo === 'select' || novaColuna.tipo === 'tipo_documento') && (
                    <div className="cfg-form-group">
                      <label className="cfg-form-label">{t('pedido.config.colunas.personalizadas.form_opcoes_lista')} <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
                      <div className="cfg-opcoes-add-row">
                        <input
                          type="text"
                          className="cfg-form-input"
                          placeholder={t('pedido.config.colunas.personalizadas.form_opcoes_placeholder')}
                          value={novaOpcao}
                          onChange={e => setNovaOpcao(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionarOpcao() } }}
                        />
                        <button type="button" className="cfg-add-btn" onClick={handleAdicionarOpcao} aria-label="Adicionar opção">
                          <Plus size={13} weight="bold" />
                        </button>
                      </div>
                      <div className="cfg-opcoes-caixa">
                        <span className="cfg-opcoes-caixa__label">
                          {novaColuna.opcoes.length > 0
                            ? `${novaColuna.opcoes.length} ${novaColuna.opcoes.length === 1 ? 'opção adicionada' : 'opções adicionadas'}`
                            : 'Nenhuma opção adicionada'}
                        </span>
                        {novaColuna.opcoes.length > 0 ? (
                          <div className="cfg-opcoes-lista">
                            {novaColuna.opcoes.map(op => (
                              <span key={op} className="cfg-opcao-chip">
                                {op}
                                <button type="button" className="cfg-opcao-chip__remove" onClick={() => handleRemoverOpcao(op)} aria-label={`Remover opção ${op}`}>
                                  <X size={10} weight="bold" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="cfg-opcoes-vazio">
                            Adicione pelo menos uma opção para habilitar a criação da coluna.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Visibilidade */}
                  <div className="cfg-form-group">
                    <label className="cfg-form-label">{t('pedido.config.colunas.personalizadas.form_visibilidade')}</label>
                    <SelectGlobal
                      opcoes={VISIBILIDADE_OPCOES.map(o => ({ valor: o.valor, rotulo: t(`pedido.config.colunas.personalizadas.vis_${o.valor}_label`), descricao: t(`pedido.config.colunas.personalizadas.vis_${o.valor}_desc`) }))}
                      valor={novaColuna.visibilidade}
                      aoMudarValor={v => v != null && setNovaColuna(prev => ({ ...prev, visibilidade: v as VisibilidadeColunaUsuario }))}
                      buscavel={false}
                    />
                  </div>

                  {/* Itens com dados diferentes */}
                  <div className="cfg-form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <label className="cfg-form-label" style={{ margin: 0 }}>{t('pedido.config.colunas.personalizadas.form_itens_diferentes')}</label>
                      <p className="cfg-form-hint" style={{ marginTop: '0.125rem' }}>{t('pedido.config.colunas.personalizadas.form_itens_diferentes_hint')}</p>
                    </div>
                    <Toggle
                      checked={novaItensDif}
                      onChange={v => setNovaItensDif(v)}
                    />
                  </div>

                  {novaItensDif && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
                      <Warning size={16} weight="fill" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.05rem' }} />
                      <span>{t('pedido.config.colunas.personalizadas.form_alerta_migr')}</span>
                    </div>
                  )}

                  {novaItensDif && (
                    <div className="cfg-form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <label className="cfg-form-label" style={{ margin: 0 }}>{t('pedido.config.colunas.personalizadas.form_pedido_editavel')}</label>
                        <p className="cfg-form-hint" style={{ marginTop: '0.125rem' }}>{t('pedido.config.colunas.personalizadas.form_pedido_editavel_hint')}</p>
                      </div>
                      <Toggle
                        checked={novaPedidoEdit}
                        onChange={v => setNovaPedidoEdit(v)}
                      />
                    </div>
                  )}

                  {/* Obrigatório */}
                  {novaColuna.tipo !== 'anexo' && (
                    <div className="cfg-form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label className="cfg-form-label" htmlFor="nova-coluna-obrigatorio" style={{ margin: 0 }}>
                        {t('pedido.config.colunas.personalizadas.form_obrigatorio')}
                      </label>
                      <Toggle
                        id="nova-coluna-obrigatorio"
                        checked={novaColuna.obrigatorio}
                        onChange={v => setNovaColuna(prev => ({ ...prev, obrigatorio: v }))}
                      />
                    </div>
                  )}

                  {/* Valor padrão */}
                  {novaColuna.tipo !== 'anexo' && novaColuna.tipo !== 'formula' && (
                    <div className="cfg-form-group">
                      <label className="cfg-form-label" htmlFor="nova-coluna-padrao">{t('pedido.config.colunas.personalizadas.form_valor_padrao')}</label>
                      <p className="cfg-form-hint">{t('pedido.config.colunas.personalizadas.form_valor_padrao_hint')}</p>
                      {novaColuna.tipo === 'checkbox' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            id="nova-coluna-padrao"
                            type="checkbox"
                            checked={novaColuna.valor_padrao === 'true'}
                            onChange={e => setNovaColuna(prev => ({ ...prev, valor_padrao: e.target.checked ? 'true' : 'false' }))}
                          />
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            {novaColuna.valor_padrao === 'true' ? t('pedido.config.colunas.personalizadas.form_valor_checkbox_marcado') : t('pedido.config.colunas.personalizadas.form_valor_checkbox_desmarcado')}
                          </span>
                        </div>
                      ) : (novaColuna.tipo === 'select' || novaColuna.tipo === 'tipo_documento') ? (
                        novaColuna.opcoes.length > 0 ? (
                          <SelectGlobal
                            opcoes={[
                              { valor: '', rotulo: t('pedido.config.colunas.personalizadas.form_valor_sem_padrao') },
                              ...novaColuna.opcoes.map(o => ({ valor: o, rotulo: o })),
                            ]}
                            valor={novaColuna.valor_padrao}
                            aoMudarValor={v => setNovaColuna(prev => ({ ...prev, valor_padrao: v ?? '' }))}
                            buscavel={false}
                          />
                        ) : (
                          <p className="cfg-form-hint" style={{ fontStyle: 'italic' }}>{t('pedido.config.colunas.personalizadas.form_valor_add_opcoes_first')}</p>
                        )
                      ) : (
                        <input
                          id="nova-coluna-padrao"
                          type={novaColuna.tipo === 'numero' || novaColuna.tipo === 'percentual' ? 'number' : novaColuna.tipo === 'data' ? 'date' : 'text'}
                          className="cfg-form-input"
                          placeholder={t('pedido.config.colunas.personalizadas.form_valor_padrao_placeholder')}
                          value={novaColuna.valor_padrao}
                          onChange={e => setNovaColuna(prev => ({ ...prev, valor_padrao: e.target.value }))}
                          maxLength={1000}
                        />
                      )}
                    </div>
                  )}

                  {/* Descrição */}
                  <div className="cfg-form-group">
                    <label className="cfg-form-label" htmlFor="nova-coluna-desc">{t('pedido.config.colunas.personalizadas.form_descricao')}</label>
                    <p className="cfg-form-hint">{t('pedido.config.colunas.personalizadas.form_descricao_hint')}</p>
                    <input
                      id="nova-coluna-desc"
                      type="text"
                      className="cfg-form-input"
                      placeholder={t('pedido.config.colunas.personalizadas.form_descricao_placeholder')}
                      value={novaColuna.descricao}
                      onChange={e => setNovaColuna(prev => ({ ...prev, descricao: e.target.value }))}
                      maxLength={200}
                    />
                  </div>

                  {erroColuna && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger, #f87171)', margin: 0 }} role="alert">{erroColuna}</p>
                  )}
                </div>

                {/* ── Footer: ações ── */}
                {(() => {
                  const tipoComOpcoes = novaColuna.tipo === 'select' || novaColuna.tipo === 'tipo_documento'
                  const formDirty = novaColuna.nome.trim() !== '' || formulaTokens.length > 0 || novaColuna.opcoes.length > 0
                  const canSave = !salvandoColuna &&
                    !!novaColuna.nome.trim() &&
                    (novaColuna.tipo !== 'formula' || (!!novaColuna.formula_expressao.trim() && !formulaErro)) &&
                    (!tipoComOpcoes || novaColuna.opcoes.length > 0)
                  return (
                    <div className="cfg-campo-calc-item__footer">
                      <BotaoCancelar
                        dirty={formDirty}
                        rotulo={t('pedido.config.colunas.personalizadas.btn_limpar')}
                        onClick={() => { setNovaColuna(NOVA_COLUNA_PADRAO); setNovaItensDif(true); setNovaPedidoEdit(true); setNovaOpcao(''); setFormulaTokens([]) }}
                      />
                      <BotaoSalvar
                        dirty={canSave}
                        rotulo={salvandoColuna ? t('pedido.config.colunas.personalizadas.btn_criando') : t('pedido.config.colunas.personalizadas.btn_criar_coluna')}
                        onClick={handleCriarColuna}
                      />
                    </div>
                  )
                })()}
              </div>}

            </section>}

            {/* ── Campos Calculados ── */}
            {categoria === 'colunas-campos-calculados' && <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.colunas.campos_calculados.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.colunas.campos_calculados.desc')}</p>
                </div>
              </div>

              {/* Card: Saldo do Pedido */}
              <div className="cfg-campo-calc-item">

                {/* ── Cabeçalho ── */}
                <div className="cfg-campo-calc-item__header">
                  <div className="cfg-campo-calc-item__id">
                    <MathOperations size={14} weight="duotone" style={{ color: 'var(--ws-accent)', flexShrink: 0 }} />
                    <span className="cfg-campo-calc-item__nome">{t('pedido.config.colunas.campos_calculados.nome_saldo')}</span>
                    <span className="cfg-campo-calc-item__badge">{t('pedido.config.colunas.campos_calculados.badge_nativo')}</span>
                  </div>
                </div>

                {/* ── Fórmula (tokens) ── */}
                <div className="cfg-campo-calc-item__formula">
                  <div className={[
                    'cfg-saldo-tokens',
                    saldoFormulaErro ? 'cfg-saldo-tokens--erro' : '',
                    saldoFormulaValida && saldoTokens.length > 0 ? 'cfg-saldo-tokens--ok' : '',
                  ].filter(Boolean).join(' ')}>
                    <span className="cfg-saldo-tokens__label-fixo">{t('pedido.config.colunas.campos_calculados.nome_saldo')}&nbsp;=</span>
                    {saldoTokens.length === 0 ? (
                      <span className="cfg-saldo-tokens__placeholder">
                        {t('pedido.config.colunas.campos_calculados.formula_placeholder')}
                      </span>
                    ) : (
                      saldoTokens.map((token, i) =>
                        token.tipo === 'campo' ? (
                          <span key={i} className="cfg-saldo-token cfg-saldo-token--campo">
                            <span className="cfg-saldo-token__label">{token.label}</span>
                            <button type="button" className="cfg-saldo-token__remove" onClick={() => removerTokenSaldo(i)} aria-label={`Remover ${token.label}`}>
                              <X size={9} weight="bold" />
                            </button>
                          </span>
                        ) : (
                          <button key={i} type="button" className="cfg-saldo-token cfg-saldo-token--op" onClick={() => removerTokenSaldo(i)} title="Clique para remover">
                            {token.valor}
                          </button>
                        )
                      )
                    )}
                  </div>

                  {/* Operadores */}
                  <div className="cfg-saldo-ops">
                    {(['+', '-', '*', '/', '(', ')'] as const).map(op => (
                      <button key={op} type="button" className="cfg-saldo-op-btn" onClick={() => adicionarOpSaldo(op)}>{op}</button>
                    ))}
                    {saldoTokens.length > 0 && (
                      <button type="button" className="cfg-saldo-op-btn cfg-saldo-op-btn--clear" onClick={() => setSaldoTokens([])}>{t('pedido.config.colunas.campos_calculados.limpar')}</button>
                    )}
                  </div>
                </div>

                {/* ── Campos disponíveis ── */}
                <div className="cfg-campo-calc-item__campos">
                  <span className="cfg-campo-calc-item__campos-label">{t('pedido.config.colunas.campos_calculados.adicionar_campo')}</span>
                  {CAMPOS_SALDO.flatMap(g => g.campos).map(campo => (
                    <button key={campo.chave} type="button" className="cfg-formula-chip" onClick={() => adicionarCampoSaldo(campo)}>
                      {campo.label}
                    </button>
                  ))}
                  {colunasUsuarioApi_.some(c => (c.tipo === 'numero' || c.tipo === 'formula') && c.ativo) && (
                    <TooltipGlobal descricao={t('pedido.config.colunas.campos_calculados.tooltip_colunas_custom')}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ws-muted)', alignSelf: 'center', cursor: 'help' }}>
                        {t('pedido.config.colunas.campos_calculados.mais_colunas_custom')}
                      </span>
                    </TooltipGlobal>
                  )}
                </div>

                {/* ── Gabi (só com conteúdo) ── */}
                {(() => {
                  if (saldoTokens.length === 0) return null
                  if (saldoFormulaAnalisando && !saldoFormulaErro && !saldoFormulaGabi && !saldoFormulaValida) return (
                    <div className="cfg-gabi-card cfg-gabi-card--analisando" role="status" aria-live="polite" style={{ margin: '0 1rem 0' }}>
                      <div className="cfg-gabi-card__header">
                        <span className="cfg-gabi-card__ico">✦</span>
                        <span className="cfg-gabi-card__titulo">Gabi · {t('pedido.config.colunas.campos_calculados.gabi_analisando')}</span>
                      </div>
                    </div>
                  )
                  if (!saldoFormulaErro && !saldoFormulaGabi && !saldoFormulaValida) return null
                  const variante = saldoFormulaErro ? 'erro' : saldoFormulaGabi ? 'aviso' : 'ok'
                  const titulo   = saldoFormulaErro ? t('pedido.config.colunas.campos_calculados.gabi_erro') : saldoFormulaGabi ? saldoFormulaGabi.titulo : t('pedido.config.colunas.campos_calculados.gabi_formula_valida')
                  const texto    = saldoFormulaErro ?? saldoFormulaGabi?.texto ?? t('pedido.config.colunas.campos_calculados.gabi_ok')
                  const sugestao = saldoFormulaGabi?.sugestao
                  return (
                    <div className={`cfg-gabi-card cfg-gabi-card--${variante}`} role="note" aria-live="polite" style={{ margin: '0 1rem 0' }}>
                      <div className="cfg-gabi-card__header">
                        <span className="cfg-gabi-card__ico">✦</span>
                        <span className="cfg-gabi-card__titulo">Gabi · {titulo}</span>
                      </div>
                      <p className="cfg-gabi-card__texto">{texto}</p>
                      {sugestao && (
                        <div className="cfg-gabi-card__sugestao-row">
                          <code className="cfg-gabi-card__sugestao">{sugestao}</code>
                          <button type="button" className="cfg-gabi-card__usar" onClick={() => setSaldoTokens(aliasFormulaParaTokens(sugestao))}>{t('pedido.config.colunas.campos_calculados.gabi_usar')}</button>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* ── Footer: ações ── */}
                <div className="cfg-campo-calc-item__footer">
                  <BotaoCancelar
                    dirty={saldoFormulaAlterada}
                    rotulo={t('pedido.config.acao.restaurar_padrao')}
                    onClick={restaurarSaldoPadrao}
                  />
                  <BotaoSalvar
                    dirty={saldoFormulaAlterada && !saldoFormulaErro}
                    rotulo={t('pedido.config.acao.salvar')}
                    onClick={salvarSaldoFormula}
                  />
                </div>
              </div>
            </section>}
          </div>
        )}

        {categoria === 'taxa-cambio' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.taxa_cambio.titulo')}</h2>
                  <p className="cfg-secao__desc">{t('pedido.config.taxa_cambio.desc')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ultimaSyncTaxa && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--ws-muted)' }}>
                      <Clock size={13} /> {ultimaSyncTaxa}
                    </span>
                  )}
                  <button
                    type="button"
                    className="cfg-add-row-btn"
                    onClick={sincronizarTaxas}
                    disabled={sincronizandoTaxa}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ArrowsClockwise size={13} weight={sincronizandoTaxa ? 'regular' : 'duotone'} />
                    {sincronizandoTaxa ? t('pedido.config.taxa_cambio.sincronizando') : t('pedido.config.taxa_cambio.sincronizar')}
                  </button>
                </div>
              </div>

              {/* Banner informativo — 4 boletins diários */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: 'var(--ws-surface-2, rgba(255,255,255,0.04))',
                border: '1px solid var(--ws-border, rgba(255,255,255,0.08))',
                borderRadius: '6px', padding: '0.55rem 0.8rem', marginBottom: '0.75rem',
                fontSize: '0.78rem', color: 'var(--ws-muted)',
              }}>
                <Clock size={13} weight="duotone" style={{ flexShrink: 0, color: 'var(--ws-accent)' }} />
                <span>
                  {t('pedido.config.taxa_cambio.banner_auto')}&nbsp;
                  {([
                    'pedido.config.taxa_cambio.boletim_1',
                    'pedido.config.taxa_cambio.boletim_2',
                    'pedido.config.taxa_cambio.boletim_3',
                    'pedido.config.taxa_cambio.boletim_fechamento',
                  ] as const).map((key, i) => {
                    const cor = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24'][i]
                    return (
                      <span key={key} style={{ marginRight: '1.4rem', marginLeft: i === 0 ? '0.5rem' : 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: cor, flexShrink: 0 }} />
                        {t(key)}
                      </span>
                    )
                  })}
                </span>
              </div>

              {erroSyncTaxa && (
                <p style={{ color: 'var(--color-danger, #f87171)', fontSize: '0.82rem', margin: '0.5rem 0' }}>{erroSyncTaxa}</p>
              )}

              {/* Tabela cotações de hoje — todos os boletins */}
              {carregandoTaxa ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                  <GravityLoader texto={t('pedido.config.taxa_cambio.carregando')} tamanho="sm" />
                </div>
              ) : taxasHoje.length === 0 ? (
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{t('pedido.config.taxa_cambio.empty_cotacao')}</p>
              ) : (() => {
                const TAXA_COLS = '15px 4.5rem 10rem 9.5rem 8.5rem 8.5rem 8rem 6rem'
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: TAXA_COLS, alignItems: 'center', rowGap: '2px', columnGap: '0' }}>
                    {/* Header — célula vazia para a coluna do ícone */}
                    <span />
                    {([
                      'pedido.config.taxa_cambio.col_moeda',
                      'pedido.config.taxa_cambio.col_nome',
                      'pedido.config.taxa_cambio.col_boletim',
                      'pedido.config.taxa_cambio.col_compra',
                      'pedido.config.taxa_cambio.col_venda',
                      'pedido.config.taxa_cambio.col_data',
                      'pedido.config.taxa_cambio.col_hora',
                    ] as const).map(k => (
                      <span key={k} style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)', padding: '0.35rem 0.5rem', textAlign: 'center' }}>{t(k)}</span>
                    ))}
                    {/* Rows */}
                    {taxasHoje.map(taxa => (
                      <React.Fragment key={taxa.id}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
                          <CurrencyCircleDollar size={15} weight="duotone" style={{ color: 'var(--ws-accent)' }} />
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{taxa.moeda}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', textAlign: 'center' }}>{MOEDAS_INFO[taxa.moeda] ?? taxa.moeda}</span>
                        <span style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '0.73rem', fontWeight: 600,
                            background: (BOLETIM_COR[taxa.boletim] ?? '#94a3b8') + '22',
                            color: BOLETIM_COR[taxa.boletim] ?? '#94a3b8',
                            border: `1px solid ${(BOLETIM_COR[taxa.boletim] ?? '#94a3b8')}44`,
                          }}>{taxa.boletim}</span>
                        </span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtTaxa(taxa.compra)}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtTaxa(taxa.venda)}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', textAlign: 'center' }}>{fmtData(taxa.data_cotacao)}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>{taxa.hora_cotacao ?? '—'}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )
              })()}
            </section>

            {/* Histórico */}
            <section className="cfg-secao" style={{ marginTop: '1.5rem' }}>
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">{t('pedido.config.taxa_cambio.historico_titulo')}</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CHF', 'CAD'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMoedaHistoricoTaxa(m)}
                      className={moedaHistoricoTaxa === m ? 'cfg-add-row-btn' : 'cfg-remove-btn'}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', minWidth: 'auto' }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {historicoTaxas.length === 0 ? (
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{t('pedido.config.taxa_cambio.empty_historico', { moeda: moedaHistoricoTaxa })}</p>
              ) : (() => {
                const HIST_COLS = '8rem 9.5rem 8.5rem 8.5rem 6rem'
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: HIST_COLS, alignItems: 'center', rowGap: '2px', columnGap: '0' }}>
                    {([
                      'pedido.config.taxa_cambio.hist_col_data',
                      'pedido.config.taxa_cambio.hist_col_boletim',
                      'pedido.config.taxa_cambio.hist_col_compra',
                      'pedido.config.taxa_cambio.hist_col_venda',
                      'pedido.config.taxa_cambio.hist_col_hora',
                    ] as const).map(k => (
                      <span key={k} style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)', padding: '0.35rem 0.5rem', textAlign: 'center' }}>{t(k)}</span>
                    ))}
                    {historicoTaxas.map(h => (
                      <React.Fragment key={h.id}>
                        <span style={{ fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtData(h.data_cotacao)}</span>
                        <span style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '0.73rem', fontWeight: 600,
                            background: (BOLETIM_COR[h.boletim] ?? '#94a3b8') + '22',
                            color: BOLETIM_COR[h.boletim] ?? '#94a3b8',
                            border: `1px solid ${(BOLETIM_COR[h.boletim] ?? '#94a3b8')}44`,
                          }}>{h.boletim}</span>
                        </span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtTaxa(h.compra)}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtTaxa(h.venda)}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>{h.hora_cotacao ?? '—'}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )
              })()}
            </section>
          </div>
        )}

        {/* ════════════════════════ SNAPSHOT CADASTROS ════════════════════════ */}
        {categoria === 'snapshot-cadastros' && (
          <div className="cfg-cards-wrapper">

            {/* ── Snapshot — Política de Atualização ─────────────────────── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Snapshot — Política de Atualização</h2>
                  <p className="cfg-secao__desc">
                    Define quais papéis e gatilhos disparam re-snapshot automático
                    quando o cadastro-base muda. Persistido por workspace na tabela
                    <code> pedido_snapshot_atualizacao</code>.
                  </p>
                </div>
              </div>

              <ConfiguracaoSecaoGlobal label="Papéis (atualização automática)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {([
                  ['atualiza_importador',  'Importador'],
                  ['atualiza_exportador',  'Exportador'],
                  ['atualiza_fabricante',  'Fabricante'],
                  ['atualiza_agente',      'Agente'],
                  ['atualiza_despachante', 'Despachante'],
                  ['atualiza_armador',     'Armador'],
                  ['atualiza_ope',         'OPE (Operação Portal Único)'],
                ] as Array<[keyof SnapshotAtualizacaoPolicy, string]>).map(([chave, label]) => (
                  <label key={chave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={snapPolicy[chave]}
                      onChange={() => toggleSnapPolicy(chave)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <ConfiguracaoSecaoGlobal label="Gatilhos (transições de status que re-snapshotam)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {([
                  ['gatilho_emissao',     'Emissão do Pedido'],
                  ['gatilho_embarque',    'Embarque'],
                  ['gatilho_desembaraco', 'Desembaraço'],
                ] as Array<[keyof SnapshotAtualizacaoPolicy, string]>).map(([chave, label]) => (
                  <label key={chave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={snapPolicy[chave]}
                      onChange={() => toggleSnapPolicy(chave)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="cfg-secao__footer" style={{ marginTop: '1rem' }}>
                <BotaoCancelar onClick={cancelarSnapPolicy} dirty={snapPolicyAlterada} />
                <BotaoSalvar
                  onClick={salvarSnapPolicy}
                  dirty={snapPolicyAlterada}
                  carregando={snapPolicySalvando}
                />
              </div>
            </section>

            <PedidoSnapshotCadastros />
          </div>
        )}

      </main>

      <ModalConfirmarExcluirGlobal
        aberto={confirmarExcluirTemplateId !== null}
        titulo="Excluir template"
        descricao="Esta ação não pode ser desfeita."
        nomeItem={templates.find(t => t.id === confirmarExcluirTemplateId)?.nome}
        aoConfirmar={excluirTemplateConfirmado}
        aoCancelar={() => setConfirmarExcluirTemplateId(null)}
      />
    </div>
  )
}

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
  getStatusConfig,
  criarStatusConfig,
  editarStatusConfig,
  excluirStatusConfig,
  reordenarStatusConfig,
} from '../shared/api'
import type { StatusCotacaoBidFreteConfig } from '../shared/types'
import { sincronizarStatusLocal } from '../shared/types'
import './Configuracoes.css'

// ─── Tipos e Interfaces Locais ───────────────────────────────────────────────────

interface CardDefinicao {
  id: string
  campoBase: string
  tipoAgg: 'Contagem' | 'Soma' | 'Média'
  origem: 'Cotação' | 'Proposta'
  labelKey: string
  descKey: string
  descricao: string
}

interface CardPreferencia {
  id: string
  visible: boolean
}

interface ColunaUsuario {
  id: string
  chave: string
  nome: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade: VisibilidadeColunaUsuario
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

interface TabelaConfig {
  linhasPorPagina: 25 | 50 | 100 | 200
  destacarAtrasados: boolean
}

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
  visibilidade: VisibilidadeColunaUsuario
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

const CARDS_CATALOGO: CardDefinicao[] = [
  { id: 'total_cotacoes', campoBase: 'id', tipoAgg: 'Contagem', origem: 'Cotação', labelKey: 'bidfrete.config.cards.total_cotacoes', descKey: 'bidfrete.config.cards.total_cotacoes_desc', descricao: 'Total de cotações de frete iniciadas no período' },
  { id: 'valor_total_frete', campoBase: 'valor_total', tipoAgg: 'Soma', origem: 'Cotação', labelKey: 'bidfrete.config.cards.valor_total_frete', descKey: 'bidfrete.config.cards.valor_total_frete_desc', descricao: 'Valor acumulado das propostas de frete aprovadas' },
  { id: 'propostas_recebidas', campoBase: 'id', tipoAgg: 'Contagem', origem: 'Proposta', labelKey: 'bidfrete.config.cards.propostas_recebidas', descKey: 'bidfrete.config.cards.propostas_recebidas_desc', descricao: 'Quantidade total de respostas recebidas de fornecedores' },
  { id: 'saving_total', campoBase: 'saving_valor', tipoAgg: 'Soma', origem: 'Cotação', labelKey: 'bidfrete.config.cards.saving_total', descKey: 'bidfrete.config.cards.saving_total_desc', descricao: 'Economia gerada comparando a proposta vencedora com o teto' },
  { id: 'tempo_medio_resposta', campoBase: 'tempo_medio_resposta', tipoAgg: 'Média', origem: 'Proposta', labelKey: 'bidfrete.config.cards.tempo_medio_resposta', descKey: 'bidfrete.config.cards.tempo_medio_resposta_desc', descricao: 'Tempo médio de resposta dos armadores e agentes de carga' },
  { id: 'cotacoes_expiradas', campoBase: 'id', tipoAgg: 'Contagem', origem: 'Cotação', labelKey: 'bidfrete.config.cards.cotacoes_expiradas', descKey: 'bidfrete.config.cards.cotacoes_expiradas_desc', descricao: 'Cotações de frete expiradas sem aprovação' },
]

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total_cotacoes:        { icone: <Package           weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  valor_total_frete:     { icone: <CurrencyDollar    weight="duotone" size={18} />, cor: '#34d399' },
  propostas_recebidas:   { icone: <ClipboardText     weight="duotone" size={18} />, cor: '#60a5fa' },
  saving_total:          { icone: <Coins             weight="duotone" size={18} />, cor: '#fb923c' },
  tempo_medio_resposta:  { icone: <Gauge             weight="duotone" size={18} />, cor: '#a78bfa' },
  cotacoes_expiradas:    { icone: <Warning           weight="duotone" size={18} />, cor: '#f87171' },
}

const CARD_VISUAL_FALLBACK = { icone: <Warning weight="duotone" size={18} />, cor: '#f59e0b' }

function resolveCardVisual(id: string) {
  return CARD_VISUAL[id] ?? CARD_VISUAL_FALLBACK
}

const NOME_EXIBICAO_CARDS_KEYS: Record<string, string> = {
  total_cotacoes: 'bidfrete.configuracoes.card_total_cotacoes',
  valor_total_frete: 'bidfrete.configuracoes.card_valor_total_frete',
  propostas_recebidas: 'bidfrete.configuracoes.card_propostas_recebidas',
  saving_total: 'bidfrete.configuracoes.card_saving_total',
  tempo_medio_resposta: 'bidfrete.configuracoes.card_tempo_medio_resposta',
  cotacoes_expiradas: 'bidfrete.configuracoes.card_cotacoes_expiradas',
}

function obterNomeExibicaoCard(card: CardDefinicao, t: (key: string) => string): string {
  const key = NOME_EXIBICAO_CARDS_KEYS[card.id]
  return key ? t(key) : card.labelKey
}

const PERIODOS_KEYS = [
  { id: '7d',   labelKey: 'bidfrete.configuracoes.periodo_7d'  },
  { id: '30d',  labelKey: 'bidfrete.configuracoes.periodo_30d' },
  { id: '6m',   labelKey: 'bidfrete.configuracoes.periodo_6m'  },
  { id: '1a',   labelKey: 'bidfrete.configuracoes.periodo_1a'  },
  { id: 'tudo', labelKey: 'bidfrete.configuracoes.periodo_tudo' },
]

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

const COLUNAS_NUMERICAS_NATIVAS_KEYS = [
  { campo: 'valor_frete',         labelKey: 'bidfrete.configuracoes.col_valor_frete',  categoriaKey: 'bidfrete.configuracoes.cat_frete', padrao: 2 },
  { campo: 'taxas_origem',        labelKey: 'bidfrete.configuracoes.col_taxas_origem', categoriaKey: 'bidfrete.configuracoes.cat_frete', padrao: 2 },
  { campo: 'taxas_destino',       labelKey: 'bidfrete.configuracoes.col_taxas_destino',categoriaKey: 'bidfrete.configuracoes.cat_frete', padrao: 2 },
  { campo: 'peso_kg',             labelKey: 'bidfrete.configuracoes.col_peso_kg',      categoriaKey: 'bidfrete.configuracoes.cat_mercadoria', padrao: 2 },
  { campo: 'cubagem_m3',          labelKey: 'bidfrete.configuracoes.col_cubagem_m3',   categoriaKey: 'bidfrete.configuracoes.cat_mercadoria', padrao: 3 },
]

const TIPOS_COLUNA_KEYS = [
  { id: 'texto',          labelKey: 'bidfrete.configuracoes.tipo_texto',         icone: <TextT size={16} weight="duotone" /> },
  { id: 'numero',         labelKey: 'bidfrete.configuracoes.tipo_numerico',      icone: <Hash size={16} weight="duotone" /> },
  { id: 'data',           labelKey: 'bidfrete.configuracoes.tipo_data',          icone: <CalendarBlank size={16} weight="duotone" /> },
  { id: 'percentual',     labelKey: 'bidfrete.configuracoes.tipo_percentual',    icone: <Percent size={16} weight="duotone" /> },
  { id: 'select',         labelKey: 'bidfrete.configuracoes.tipo_select',        icone: <ListBullets size={16} weight="duotone" /> },
  { id: 'checkbox',       labelKey: 'bidfrete.configuracoes.tipo_checkbox',      icone: <CheckSquare size={16} weight="duotone" /> },
  { id: 'tipo_documento', labelKey: 'bidfrete.configuracoes.tipo_documento',     icone: <Tag size={16} weight="duotone" /> },
  { id: 'formula',        labelKey: 'bidfrete.configuracoes.tipo_formula',       icone: <MathOperations size={16} weight="duotone" /> },
  { id: 'anexo',          labelKey: 'bidfrete.configuracoes.tipo_anexo',         icone: <Paperclip size={16} weight="duotone" /> },
]

const FORMULA_FIELDS_KEYS = [
  { chave: 'valor_frete', labelKey: 'bidfrete.configuracoes.formula_valor_frete' },
  { chave: 'taxas_origem', labelKey: 'bidfrete.configuracoes.formula_taxas_origem' },
  { chave: 'taxas_destino', labelKey: 'bidfrete.configuracoes.formula_taxas_destino' },
]

// ─── Sub-Components (Sortable and Helpers) ───────────────────────────────────────

function CardSortavel({
  pref, onToggle, onRemover, periodoAtivo,
}: {
  pref: CardPreferencia
  onToggle: () => void
  onRemover: () => void
  periodoAtivo: string
}) {
  const { t } = useTranslation()
  const def = CARDS_CATALOGO.find(c => c.id === pref.id)!
  const visual = resolveCardVisual(pref.id)
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

  const periodoLabel = PERIODOS_KEYS.find(p => p.id === periodoAtivo)
    ? t(PERIODOS_KEYS.find(p => p.id === periodoAtivo)!.labelKey)
    : periodoAtivo
  const subtitulo = `${def.tipoAgg} · ${def.origem} · ${periodoLabel}`

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}${detalheAberto ? ' cfg-card-row--detalhe' : ''}`}>
        <button
          type="button"
          className="cfg-drag-handle"
          {...attributes}
          {...listeners}
          aria-label={t('bidfrete.configuracoes.arrastar_reordenar')}
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <div className="cfg-card-row__info">
          <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
            {visual.icone}
          </span>
          <div>
            <p className="cfg-card-row__nome">{obterNomeExibicaoCard(def, t)}</p>
            <p className="cfg-card-row__desc">{subtitulo}</p>
          </div>
        </div>

        <span className="cfg-origem-badge cfg-origem-badge--meus">{def.origem}</span>

        <TooltipGlobal descricao={t('bidfrete.configuracoes.ver_detalhes_card')}>
          <button
            type="button"
            className={`cfg-eye-btn${detalheAberto ? ' cfg-eye-btn--on' : ''}`}
            onClick={() => setDetalheAberto(v => !v)}
            aria-label={t('bidfrete.configuracoes.ver_detalhes_card')}
          >
            <Info size={15} weight="bold" />
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao={pref.visible ? t('bidfrete.configuracoes.ocultar_card') : t('bidfrete.configuracoes.exibir_card')}>
          <button
            type="button"
            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
            onClick={onToggle}
            aria-label={pref.visible ? t('bidfrete.configuracoes.ocultar') : t('bidfrete.configuracoes.exibir')}
          >
            {pref.visible ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
          </button>
        </TooltipGlobal>

        <TooltipGlobal descricao={t('bidfrete.configuracoes.remover_card')}>
          <button
            type="button"
            className="cfg-remove-btn"
            onClick={onRemover}
            aria-label={t('bidfrete.configuracoes.remover_card')}
          >
            <X size={13} weight="bold" />
          </button>
        </TooltipGlobal>
      </div>

      {detalheAberto && (
        <div className="cfg-card-detail-panel">
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.campo_base')}</span>
            <span className="cfg-card-detail-panel__value">{def.campoBase}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.agregacao')}</span>
            <span className="cfg-card-detail-panel__value">{def.tipoAgg}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.origem')}</span>
            <span className="cfg-card-detail-panel__value">{def.origem}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.periodo')}</span>
            <span className="cfg-card-detail-panel__value">{periodoLabel}</span>
          </div>
          <div className="cfg-card-detail-panel__row cfg-card-detail-panel__row--full">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.descricao')}</span>
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
  const { t } = useTranslation()
  const visual = resolveCardVisual(def.id)
  const [detalheAberto, setDetalheAberto] = useState(false)
  const periodoLabel = PERIODOS_KEYS.find(p => p.id === periodoAtivo)
    ? t(PERIODOS_KEYS.find(p => p.id === periodoAtivo)!.labelKey)
    : periodoAtivo

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
            <p className="cfg-card-row__nome">{obterNomeExibicaoCard(def, t)}</p>
            <p className="cfg-card-row__desc">{def.descricao}</p>
          </div>
        </div>
        <span className="cfg-origem-badge cfg-origem-badge--pedido">{def.origem}</span>
        <span className="cfg-agg-badge">{def.tipoAgg}</span>
        <TooltipGlobal descricao={t('bidfrete.configuracoes.ver_detalhes_card')}>
          <button
            type="button"
            className={`cfg-eye-btn${detalheAberto ? ' cfg-eye-btn--on' : ''}`}
            onClick={() => setDetalheAberto(v => !v)}
            aria-label={t('bidfrete.configuracoes.ver_detalhes_card')}
          >
            <Info size={15} weight="bold" />
          </button>
        </TooltipGlobal>
        <TooltipGlobal descricao={t('bidfrete.configuracoes.adicionar_meus_cards')}>
          <button
            type="button"
            className="cfg-add-btn"
            onClick={onAdicionar}
            aria-label={t('bidfrete.configuracoes.adicionar_card')}
          >
            <Plus size={13} weight="bold" />
          </button>
        </TooltipGlobal>
      </div>

      {detalheAberto && (
        <div className="cfg-card-detail-panel">
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.campo_base')}</span>
            <span className="cfg-card-detail-panel__value">{def.campoBase}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.agregacao')}</span>
            <span className="cfg-card-detail-panel__value">{def.tipoAgg}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.origem')}</span>
            <span className="cfg-card-detail-panel__value">{def.origem}</span>
          </div>
          <div className="cfg-card-detail-panel__row">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.periodo')}</span>
            <span className="cfg-card-detail-panel__value">{periodoLabel}</span>
          </div>
          <div className="cfg-card-detail-panel__row cfg-card-detail-panel__row--full">
            <span className="cfg-card-detail-panel__label">{t('bidfrete.configuracoes.descricao')}</span>
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
      <button type="button" className="cfg-drag-handle" {...attributes} {...listeners} aria-label={t('bidfrete.configuracoes.aria_arrastar')}>
        <DotsSixVertical size={15} weight="bold" />
      </button>
      <div className="cfg-kanban-campo-row__info">
        <span className="cfg-kanban-campo-row__nome">{col.nome}</span>
        <span className="cfg-kanban-campo-row__tipo">{tipoInfo?.label ?? col.tipo}</span>
      </div>
      <TooltipGlobal descricao={t('bidfrete.configuracoes.editar_propriedades')}>
        <button type="button" className={`cfg-kanban-campo-btn${editando ? ' cfg-kanban-campo-btn--ativo' : ''}`} onClick={onEditar} aria-label={`Editar ${col.nome}`}>
          <PencilSimple size={14} weight="duotone" />
        </button>
      </TooltipGlobal>
      <TooltipGlobal descricao={col.ativo ? t('bidfrete.configuracoes.ocultar_coluna') : t('bidfrete.configuracoes.exibir_coluna')}>
        <button type="button" className="cfg-kanban-campo-btn" onClick={onToggleAtivo} aria-label={col.ativo ? t('bidfrete.configuracoes.ocultar_coluna') : t('bidfrete.configuracoes.exibir_coluna')}>
          {col.ativo ? <Eye size={14} weight="duotone" /> : <EyeSlash size={14} weight="duotone" />}
        </button>
      </TooltipGlobal>
      <TooltipGlobal descricao={t('bidfrete.configuracoes.excluir_coluna')}>
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
  const { t } = useTranslation()
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
          aria-label={t('bidfrete.configuracoes.aria_arrastar')}
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <span
          className="cfg-status-dot"
          style={{ background: status.cor }}
        />

        <span className="cfg-status-label">{status.rotulo}</span>

        <div className="cfg-status-acoes">
          <TooltipGlobal descricao={t('comum.editar')}>
            <button
              type="button"
              className="cfg-eye-btn"
              onClick={() => onIniciarEdicao(status)}
              aria-label={t('comum.editar')}
            >
              <PencilSimple size={14} weight="bold" />
            </button>
          </TooltipGlobal>
          <TooltipGlobal descricao={t('comum.excluir')}>
            <button
              type="button"
              className="cfg-remove-btn"
              onClick={() => onExcluir(status.id)}
              aria-label={t('comum.excluir')}
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
              placeholder={t('bidfrete.configuracoes.placeholder_nome_status')}
              value={editLabel}
              onChange={e => onChangeLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSalvarEdicao() }}
              autoFocus
            />
            <div className="cfg-status-color-picker">
              <span className="cfg-status-color-label">{t('bidfrete.configuracoes.cor_label')}</span>
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
  const { t } = useTranslation()
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
        <h3 className="mcu-header__titulo" style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>{t('bidfrete.configuracoes.modal_novo_card_titulo')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            {t('bidfrete.configuracoes.modal_nome_card')}
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }} />
          </label>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {t('bidfrete.configuracoes.modal_icone')}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {ICONES.map(ic => (
                <button key={ic} type="button" onClick={() => setIcone(ic)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid transparent', background: icone === ic ? '#818cf8' : '#334155', color: '#f1f5f9', cursor: 'pointer' }}>
                  {ic.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {t('bidfrete.configuracoes.modal_cor')}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {CORES.map(c => (
                <button key={c} type="button" onClick={() => setCor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: cor === c ? '2px solid white' : 'none', background: c, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            {t('bidfrete.configuracoes.modal_formula')}
            <input type="text" placeholder="Ex: valor_frete * 1.05" value={formula} onChange={e => setFormula(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button type="button" onClick={onFechar} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#f1f5f9', cursor: 'pointer' }}>{t('bidfrete.configuracoes.cancelar')}</button>
            <button type="button" onClick={handleSalvar} style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: '#818cf8', color: '#fff', cursor: 'pointer' }}>{t('bidfrete.configuracoes.criar')}</button>
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
  onSalvo: (col: { nome: string; tipo: TipoColunaUsuario; escopo: EscopoColunaUsuario; visibilidade: VisibilidadeColunaUsuario }) => void
}) {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoColunaUsuario>('texto')

  const handleSalvar = () => {
    if (!nome.trim()) return
    onSalvo({ nome, tipo, escopo: 'ambos', visibilidade: 'todos' })
  }

  return (
    <div className="mcu-overlay" onClick={onFechar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="mcu-modal" onClick={e => e.stopPropagation()} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: '420px' }}>
        <h3 className="mcu-header__titulo" style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>{t('bidfrete.configuracoes.modal_nova_coluna_titulo')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            {t('bidfrete.configuracoes.modal_nome_coluna')}
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
            {t('bidfrete.configuracoes.modal_tipo_dado')}
            <select value={tipo} onChange={e => setTipo(e.target.value as TipoColunaUsuario)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#f1f5f9' }}>
              {TIPOS_COLUNA.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button type="button" onClick={onFechar} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#f1f5f9', cursor: 'pointer' }}>{t('bidfrete.configuracoes.cancelar')}</button>
            <button type="button" onClick={handleSalvar} style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: '#818cf8', color: '#fff', cursor: 'pointer' }}>{t('bidfrete.configuracoes.criar')}</button>
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
    'colunas-casas-decimais': ['colunas-casas-decimais', 'colunas-formato-data', 'colunas-personalizadas', 'colunas-campos-calculados'].includes(tabParam ?? ''),
    'kanban': ['kanban-colunas', 'kanban-card', 'kanban-modal'].includes(tabParam ?? ''),
  })

  const [periodoAtivo, setPeriodoAtivo] = useState('30d')

  // ─── DnD Sensors ──────────────────────────────────────────────────────────────
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    document.body.classList.add('bf-configuracoes-page')
    return () => {
      document.body.classList.remove('bf-configuracoes-page')
    }
  }, [])

  // ─── Mocks & Persistence Hook ─────────────────────────────────────────────────

  const useConfigState = <T,>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>, T, () => void, () => void, boolean, (v: T) => void] => {
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
      addNotification({ type: 'success', message: t('bidfrete.configuracoes.salvas_sucesso') })
    }

    const reset = () => {
      setCurrentState(savedState)
    }

    /** Atualiza currentState E savedState juntos (sem marcar dirty) — usado para sync com API */
    const syncBoth = (v: T) => {
      setCurrentState(v)
      setSavedState(v)
      localStorage.setItem(storageKey, JSON.stringify(v))
    }

    return [currentState, setCurrentState, savedState, save, reset, isDirty, syncBoth]
  }

  // ─── States declarations ──────────────────────────────────────────────────────

  const [cardsPref, setCardsPref, , saveCards, resetCards, cardsDirty] = useConfigState<CardPreferencia[]>('cards', [
    { id: 'total_cotacoes', visible: true },
    { id: 'valor_total_frete', visible: true },
    { id: 'propostas_recebidas', visible: true },
  ])

  const [tabelaConfig, setTabelaConfig, , saveTabela, resetTabela, tabelaDirty] = useConfigState<TabelaConfig>('tabela', {
    linhasPorPagina: 100,
    destacarAtrasados: true,
  })

  const [casasDecimais, setCasasDecimais, , saveCasas, resetCasas, casasDirty] = useConfigState<Record<string, number>>('casas-decimais', {
    valor_frete: 2,
    taxas_origem: 2,
    taxas_destino: 2,
    peso_kg: 2,
    cubagem_m3: 3,
  })

  const [formatoData, setFormatoData, , saveFormatoData, resetFormatoData, formatoDataDirty] = useConfigState<string>('formato-data', 'DD/MM/AAAA')

  const [colunasPersonalizadas, setColunasPersonalizadas, , saveColunas, resetColunas, colunasDirty] = useConfigState<ColunaUsuario[]>('colunas-personalizadas', [
    { id: 'col_margem', chave: 'margem', nome: 'Margem Comercial', tipo: 'numero', escopo: 'pedido', visibilidade: 'todos', obrigatorio: false, valor_padrao: '', descricao: 'Margem do frete', opcoes: [], formula_expressao: '', ativo: true }
  ])

  const [saldoTokens, setSaldoTokens, , saveSaldoFormula, resetSaldoFormula, saldoDirty] = useConfigState<SaldoToken[]>('campos-calculados', [
    { tipo: 'campo', chave: 'valor_frete', label: 'Valor do Frete' },
    { tipo: 'op', valor: '+' },
    { tipo: 'campo', chave: 'taxas_origem', label: 'Taxas Origem' }
  ])

  const [statusList, setStatusList, , saveStatus, resetStatus, statusDirty, syncStatusBoth] = useConfigState<PedidoStatusConfig[]>('status', [
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

  // Estado da API de status (fonte primária)
  const [statusApiCarregado, setStatusApiCarregado] = useState(false)

  // Carregar status da API (fonte primária) e sincronizar localStorage
  useEffect(() => {
    let cancelado = false
    async function carregarStatusApi() {
      try {
        const statusApi = await getStatusConfig()
        if (cancelado) return
        const convertidos: PedidoStatusConfig[] = statusApi.map(s => ({
          id: s.id_status_cotacao_bid_frete,
          nome: s.nome_status_cotacao_bid_frete,
          rotulo: s.rotulo_status_cotacao_bid_frete,
          cor: s.cor_status_cotacao_bid_frete,
          ordem: s.ordem_status_cotacao_bid_frete,
          is_sistema: false, // Todos editáveis/deletáveis pelo usuário
        }))
        // syncBoth atualiza current + saved + localStorage sem marcar dirty
        syncStatusBoth(convertidos)
        sincronizarStatusLocal(statusApi)
        setStatusApiCarregado(true)
      } catch (err) {
        console.warn('[Configuracoes] Falha ao carregar status da API, usando localStorage', err)
        setStatusApiCarregado(true)
      }
    }
    carregarStatusApi()
    return () => { cancelado = true }
  }, [])

  const [numeracaoConfig, setNumeracaoConfig, , saveNumeracao, resetNumeracao, numeracaoDirty] = useConfigState<NumeracaoConfig>('numeracao', {
    prefixo: 'BID-',
    incluirAno: true,
    digitosSequencia: 5,
    reiniciar: 'ano',
    automaticoCriar: true,
  })

  const [templatesPdf, setTemplatesPdf, , saveTemplates, resetTemplates, templatesDirty] = useConfigState<TemplateLocal[]>('templates-pdf', [
    { id: 'tpl_resumo', nome: 'Resumo do Bid de Frete', documento_tipo: 'pdf', codigo_fonte: '<h1>Bid de Frete {{numero}}</h1>', created_at: new Date().toISOString() }
  ])

  const [regrasConfig, setRegrasConfig, , saveRegras, resetRegras, regrasDirty] = useConfigState<RegrasConfig>('regras', {
    respostaAutomatica: true,
    prazoPadraoHoras: 72,
    alertasDivergencia: true,
    aprovarAbaixoDoTeto: false,
  })

  const [categoriasAnexos, setCategoriasAnexos, , saveAnexos, resetAnexos, anexosDirty] = useConfigState<CategoriaAnexo[]>('categorias-anexos', [
    { id: 'bl', nome: 'Bill of Lading (B/L)', sistema: true },
    { id: 'proposta', nome: 'Proposta do Fornecedor', sistema: false }
  ])

  const [taxasCambio, setTaxasCambio, , saveTaxas, resetTaxas, taxasDirty] = useConfigState<Record<string, number>>('taxa-cambio', {
    USD: 5.25,
    EUR: 5.65,
  })

  const [notificacoesConfig, setNotificacoesConfig, , saveNotif, resetNotif, notifDirty] = useConfigState<NotificacoesConfig>('notificacoes', {
    respostaFornecedor: true,
    novaCotacao: true,
    cotacaoExpirada: false,
    cotacaoAprovada: true,
    erroIntegracao: true,
  })

  const [exportConfig, setExportConfig, , saveExport, resetExport, exportDirty] = useConfigState<ExportacaoConfig>('exportacao', {
    formatoPadrao: 'xlsx',
    incluirPropostas: true,
    apenasAprovada: false,
    separadorCsv: 'ponto-virgula',
  })

  // ─── Kanban Specific States ──────────────────────────────────────────────────

  const [kanbanColunasOcultas, setKanbanColunasOcultas, , saveKanbanColunas, resetKanbanColunas, kanbanColunasDirty] = useConfigState<string[]>('kanban-colunas-ocultas', [])
  const [kanbanCardConfig, setKanbanCardConfig, , saveKanbanCard, resetKanbanCard, kanbanCardDirty] = useConfigState<Record<string, boolean>>('kanban-card-config', {
    exibirValor: true,
    exibirIncoterm: true,
    exibirArmador: false,
    exibirDatas: true,
  })

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
  const isDirtyGlobal = cardsDirty || tabelaDirty || casasDirty || formatoDataDirty || colunasDirty || saldoDirty || statusDirty || numeracaoDirty || templatesDirty || regrasDirty || anexosDirty || taxasDirty || notifDirty || exportDirty || kanbanColunasDirty || kanbanCardDirty

  const formulaFields = useMemo(
    () => FORMULA_FIELDS_KEYS.map(f => ({ chave: f.chave, label: t(f.labelKey) })),
    [t],
  )

  // ─── Drag & Drop Event Handlers ────────────────────────────────────────────────

  const handleDragEndCards = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setCardsPref(prev => {
      const oldIdx = prev.findIndex(p => p.id === active.id)
      const newIdx = prev.findIndex(p => p.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
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

  const handleDragEndStatus = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setStatusList(prev => {
      const oldIdx = prev.findIndex(p => p.id === active.id)
      const newIdx = prev.findIndex(p => p.id === over.id)
      const reordered = arrayMove(prev, oldIdx, newIdx)
      const comOrdem = reordered.map((s, idx) => ({ ...s, ordem: idx + 1 }))
      // Reordenar via API (fire-and-forget)
      reordenarStatusConfig(comOrdem.map(s => s.id)).catch(err =>
        console.warn('[Configuracoes] Erro ao reordenar status via API', err)
      )
      return comOrdem
    })
  }

  // ─── Save All Strategy ────────────────────────────────────────────────────────

  const handleSalvarTudo = () => {
    if (cardsDirty) saveCards()
    if (tabelaDirty) saveTabela()
    if (casasDirty) saveCasas()
    if (formatoDataDirty) saveFormatoData()
    if (colunasDirty) saveColunas()
    if (saldoDirty) saveSaldoFormula()
    if (statusDirty) saveStatus()
    if (numeracaoDirty) saveNumeracao()
    if (templatesDirty) saveTemplates()
    if (regrasDirty) saveRegras()
    if (anexosDirty) saveAnexos()
    if (taxasDirty) saveTaxas()
    if (notifDirty) saveNotif()
    if (exportDirty) saveExport()
    if (kanbanColunasDirty) saveKanbanColunas()
    if (kanbanCardDirty) saveKanbanCard()
  }

  const handleDescartarTudo = () => {
    resetCards()
    resetTabela()
    resetCasas()
    resetFormatoData()
    resetColunas()
    resetSaldoFormula()
    resetStatus()
    resetNumeracao()
    resetTemplates()
    resetRegras()
    resetAnexos()
    resetTaxas()
    resetNotif()
    resetExport()
    resetKanbanColunas()
    resetKanbanCard()
    addNotification({ type: 'info', message: 'Modificações descartadas.' })
  }

  return (
    <PaginaGlobal
      className="bf-configuracoes"
    >
      <div className={`cfg-page${isDirtyGlobal ? ' bf-cfg-page--dirty' : ''}`}>
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
                  <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.meus_cards_titulo')}</h2>
                  <p className="cfg-secao__desc">{t('bidfrete.configuracoes.meus_cards_desc')}</p>
                </div>
                <div className="cfg-secao__header-actions">
                  <button type="button" className="cfg-add-row-btn" onClick={() => setCriandoCard(true)}>
                    <Plus size={13} weight="bold" />
                    {t('bidfrete.configuracoes.adicionar_card_kpi')}
                  </button>
                  <button type="button" className="cfg-btn-header--restaurar" onClick={() => setCardsPref(CARDS_CATALOGO.map(c => ({ id: c.id, visible: true })))}>
                    <ArrowCounterClockwise size={13} weight="bold" />
                    {t('bidfrete.configuracoes.restaurar_padrao')}
                  </button>
                </div>
              </div>

              {/* Período */}
              <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.periodo_comparacao')} />
              <div className="cfg-periodo-row">
                <div className="cfg-periodo-pills">
                  {PERIODOS_KEYS.map(p => (
                    <button key={p.id} type="button" className={`cfg-periodo-pill ${periodoAtivo === p.id ? 'cfg-periodo-pill--ativo' : ''}`} onClick={() => setPeriodoAtivo(p.id)}>
                      {t(p.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Grid */}
              <div className="cfg-cards-preview-wrap">
                <p className="cfg-cards-preview-label">
                  <SquaresFour size={12} weight="fill" />
                  {t('bidfrete.configuracoes.preview_como_ficara')}
                </p>
                <div className="cfg-cards-preview-grid">
                  {cardsPref.map((pref, i) => {
                    const card = CARDS_CATALOGO.find(c => c.id === pref.id)
                    if (!card) return null
                    return (
                      <div key={card.id} className={`cfg-kpi-preview-card ${!pref.visible ? 'cfg-kpi-preview-card--oculto' : ''}`}>
                        <span className="cfg-kpi-preview-card__pos">{i + 1}</span>
                        <div className="cfg-kpi-preview-card__icon" style={{ color: resolveCardVisual(card.id).cor }}>
                          {resolveCardVisual(card.id).icone}
                        </div>
                        <div className="cfg-kpi-preview-card__line" style={{ background: resolveCardVisual(card.id).cor }} />
                        <p className="cfg-kpi-preview-card__label">{obterNomeExibicaoCard(card, t)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Ativos List (DnD Context) */}
              <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.ativos_label')} count={`${cardsPref.length} cards`} />
              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCards}>
                <SortableContext items={cardsPref.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="cfg-cards-lista" style={{ marginTop: '0.5rem' }}>
                    {cardsPref.map(pref => (
                      <CardSortavel
                        key={pref.id}
                        pref={pref}
                        periodoAtivo={periodoAtivo}
                        onToggle={() => setCardsPref(prev => prev.map(p => p.id === pref.id ? { ...p, visible: !p.visible } : p))}
                        onRemover={() => setCardsPref(prev => prev.filter(p => p.id !== pref.id))}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Disponíveis para adicionar */}
              <div className="cfg-list-section-header">
                <p className="cfg-list-section-label">{t('bidfrete.configuracoes.disponiveis_adicionar')}</p>
              </div>
              <div className="cfg-cards-lista">
                {CARDS_CATALOGO.filter(c => !cardsPref.some(p => p.id === c.id)).map(def => (
                  <CardDisponivel
                    key={def.id}
                    def={def}
                    periodoAtivo={periodoAtivo}
                    onAdicionar={() => setCardsPref(prev => [...prev, { id: def.id, visible: true }])}
                  />
                ))}
              </div>

            </section>
          </div>
        )}

        {/* ── CATEGORIA: TABELA ── */}
        {categoria === 'tabela' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.pref_tabela_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.pref_tabela_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{t('bidfrete.configuracoes.itens_por_pagina')}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('bidfrete.configuracoes.tabela_desc_linhas')}</p>
                </div>
                <select
                  value={tabelaConfig.linhasPorPagina}
                  onChange={e => setTabelaConfig(prev => ({ ...prev, linhasPorPagina: Number(e.target.value) as 25 | 50 | 100 | 200 }))}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                >
                  <option value={25}>{t('bidfrete.configuracoes.linhas', { count: 25 })}</option>
                  <option value={50}>{t('bidfrete.configuracoes.linhas', { count: 50 })}</option>
                  <option value={100}>{t('bidfrete.configuracoes.linhas', { count: 100 })}</option>
                  <option value={200}>{t('bidfrete.configuracoes.linhas', { count: 200 })}</option>
                </select>
              </div>
              <div className="cfg-divider" style={{ margin: '0.5rem 0' }} />
              <ToggleRow
                id="tab-destaque"
                label={t('bidfrete.configuracoes.destacar_expirar_label')}
                desc={t('bidfrete.configuracoes.destacar_expirar_desc')}
                checked={tabelaConfig.destacarAtrasados}
                onChange={v => setTabelaConfig(prev => ({ ...prev, destacarAtrasados: v }))}
              />
            </div>
          </section>
        )}

        {/* ── CATEGORIA: COLUNAS - CASAS DECIMAIS ── */}
        {categoria === 'colunas-casas-decimais' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.casas_decimais_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.casas_decimais_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {COLUNAS_NUMERICAS_NATIVAS.map(item => (
                <div key={item.campo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{item.label}</span>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('bidfrete.configuracoes.categoria')}: {item.categoria}</p>
                  </div>
                  <select
                    value={casasDecimais[item.campo] ?? item.padrao}
                    onChange={e => setCasasDecimais(prev => ({ ...prev, [item.campo]: Number(e.target.value) }))}
                    style={{ padding: '4px 10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                  >
                    {[0, 1, 2, 3, 4].map(v => (
                      <option key={v} value={v}>{t('bidfrete.configuracoes.n_casas', { count: v })}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CATEGORIA: COLUNAS - FORMATO DATA ── */}
        {categoria === 'colunas-formato-data' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.formato_data_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.formato_data_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['DD/MM/AAAA', 'MM/DD/AAAA', 'AAAA-MM-DD'].map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  className={`cfg-periodo-pill ${formatoData === fmt ? 'cfg-periodo-pill--ativo' : ''}`}
                  onClick={() => setFormatoData(fmt)}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── CATEGORIA: COLUNAS - PERSONALIZADAS ── */}
        {categoria === 'colunas-personalizadas' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.colunas_personalizadas_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.colunas_personalizadas_desc')}</p>
              </div>
              <div className="cfg-secao__header-actions">
                <button type="button" className="cfg-add-row-btn" onClick={() => setCriandoColuna(true)}>
                  <Plus size={13} weight="bold" />
                  {t('bidfrete.configuracoes.criar_coluna_personalizada')}
                </button>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.suas_colunas_label')} count={`${colunasPersonalizadas.length} ${t('bidfrete.configuracoes.colunas_count')}`} />
            
            <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndColunas}>
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
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>{t('bidfrete.configuracoes.editar_descricao')}</p>
                <input
                  type="text"
                  className="cfg-input"
                  style={{ width: '100%', marginTop: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px' }}
                  value={colunasPersonalizadas.find(c => c.id === editandoColunaId)?.descricao ?? ''}
                  onChange={e => setColunasPersonalizadas(prev => prev.map(c => c.id === editandoColunaId ? { ...c, descricao: e.target.value } : c))}
                />
              </div>
            )}

          </section>
        )}

        {/* ── CATEGORIA: COLUNAS - CAMPOS CALCULADOS ── */}
        {categoria === 'colunas-campos-calculados' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.campos_calculados_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.campos_calculados_desc')}</p>
              </div>
            </div>

            <div className="cfg-campo-calc-item">
              <div className="cfg-campo-calc-item__header">
                <div className="cfg-campo-calc-item__id">
                  <MathOperations size={14} weight="duotone" style={{ color: 'var(--ws-accent)', flexShrink: 0 }} />
                  <span className="cfg-campo-calc-item__nome">{t('bidfrete.configuracoes.custo_total_estimado')}</span>
                </div>
              </div>

              <div className="cfg-campo-calc-item__formula">
                <div className={`cfg-saldo-tokens${saldoTokens.length > 0 ? ' cfg-saldo-tokens--ok' : ''}`}>
                  <span className="cfg-saldo-tokens__label-fixo">{t('bidfrete.configuracoes.custo_total_estimado')}&nbsp;=</span>
                  {saldoTokens.length === 0 ? (
                    <span className="cfg-saldo-tokens__placeholder">{t('bidfrete.configuracoes.campos_disponiveis')}</span>
                  ) : (
                    saldoTokens.map((tk, idx) =>
                      tk.tipo === 'campo' ? (
                        <span key={idx} className="cfg-saldo-token cfg-saldo-token--campo">
                          <span className="cfg-saldo-token__label">{tk.label}</span>
                          <button type="button" className="cfg-saldo-token__remove" onClick={() => setSaldoTokens(prev => prev.filter((_, i) => i !== idx))} aria-label={t('bidfrete.configuracoes.remover')}>
                            <X size={9} weight="bold" />
                          </button>
                        </span>
                      ) : (
                        <button key={idx} type="button" className="cfg-saldo-token cfg-saldo-token--op" onClick={() => setSaldoTokens(prev => prev.filter((_, i) => i !== idx))}>
                          {tk.valor}
                        </button>
                      ),
                    )
                  )}
                </div>

                <div className="cfg-saldo-ops">
                  {(['+', '-', '*', '/'] as const).map(op => (
                    <button key={op} type="button" className="cfg-saldo-op-btn" onClick={() => setSaldoTokens(prev => [...prev, { tipo: 'op', valor: op }])}>{op}</button>
                  ))}
                  {saldoTokens.length > 0 && (
                    <button type="button" className="cfg-saldo-op-btn cfg-saldo-op-btn--clear" onClick={() => setSaldoTokens([])}>
                      {t('bidfrete.configuracoes.descartar')}
                    </button>
                  )}
                </div>
              </div>

              <div className="cfg-campo-calc-item__campos">
                <span className="cfg-campo-calc-item__campos-label">{t('bidfrete.configuracoes.campos_disponiveis')}</span>
                {formulaFields.map(f => (
                  <button
                    key={f.chave}
                    type="button"
                    className="cfg-formula-chip"
                    onClick={() => setSaldoTokens(prev => [...prev, { tipo: 'campo', chave: f.chave, label: f.label }])}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CATEGORIA: KANBAN COLUNAS ── */}
        {categoria === 'kanban-colunas' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.kanban_colunas_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.kanban_colunas_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {statusList.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#334155', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.cor }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{s.rotulo}</span>
                  </div>
                  <TooltipGlobal descricao={kanbanColunasOcultas.includes(s.id) ? t('bidfrete.configuracoes.exibir_kanban') : t('bidfrete.configuracoes.ocultar_kanban')}>
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

        {/* ── CATEGORIA: KANBAN CARD ── */}
        {categoria === 'kanban-card' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.kanban_card_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.kanban_card_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ToggleRow
                id="kcard-val"
                label={t('bidfrete.configuracoes.kcard_exibir_valor_label')}
                desc={t('bidfrete.configuracoes.kcard_exibir_valor_desc')}
                checked={kanbanCardConfig.exibirValor}
                onChange={v => setKanbanCardConfig(prev => ({ ...prev, exibirValor: v }))}
              />
              <ToggleRow
                id="kcard-inc"
                label={t('bidfrete.configuracoes.kcard_exibir_incoterm_label')}
                desc={t('bidfrete.configuracoes.kcard_exibir_incoterm_desc')}
                checked={kanbanCardConfig.exibirIncoterm}
                onChange={v => setKanbanCardConfig(prev => ({ ...prev, exibirIncoterm: v }))}
              />
              <ToggleRow
                id="kcard-arm"
                label={t('bidfrete.configuracoes.kcard_exibir_armador_label')}
                desc={t('bidfrete.configuracoes.kcard_exibir_armador_desc')}
                checked={kanbanCardConfig.exibirArmador}
                onChange={v => setKanbanCardConfig(prev => ({ ...prev, exibirArmador: v }))}
              />
              <ToggleRow
                id="kcard-dat"
                label={t('bidfrete.configuracoes.kcard_exibir_datas_label')}
                desc={t('bidfrete.configuracoes.kcard_exibir_datas_desc')}
                checked={kanbanCardConfig.exibirDatas}
                onChange={v => setKanbanCardConfig(prev => ({ ...prev, exibirDatas: v }))}
              />
            </div>
          </section>
        )}

        {/* ── CATEGORIA: KANBAN MODAL ── */}
        {categoria === 'kanban-modal' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.modal_rapido_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.modal_rapido_desc')}</p>
              </div>
            </div>
            <p className="cfg-hint">{t('bidfrete.configuracoes.modal_rapido_hint')}</p>
          </section>
        )}

        {/* ── CATEGORIA: STATUS ── */}
        {categoria === 'status' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.status_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.status_desc')}</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.status_ativos_label')} count={`${statusList.length} status`} />

            <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStatus}>
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
                        // Salvar via API
                        if (editandoStatusId) {
                          editarStatusConfig(editandoStatusId, {
                            rotulo_status_cotacao_bid_frete: editStatusLabel,
                            cor_status_cotacao_bid_frete: editStatusCor,
                          }).catch(err => console.warn('[Configuracoes] Erro ao editar status via API', err))
                        }
                        setEditandoStatusId(null)
                      }}
                      onCancelarEdicao={() => setEditandoStatusId(null)}
                      onChangeLabel={setEditStatusLabel}
                      onChangeCor={setEditStatusCor}
                      onExcluir={id => {
                        setStatusList(prev => prev.filter(x => x.id !== id))
                        // Excluir via API
                        excluirStatusConfig(id).catch(err =>
                          console.warn('[Configuracoes] Erro ao excluir status via API', err)
                        )
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={t('bidfrete.configuracoes.placeholder_novo_status')}
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
              <BotaoGlobal variante="primario" tamanho="pequeno" onClick={async () => {
                if (!editStatusLabel.trim()) return
                const nomeNovo = editStatusLabel.toUpperCase().replace(/\s+/g, '_')
                try {
                  const criado = await criarStatusConfig({
                    nome_status_cotacao_bid_frete: nomeNovo,
                    rotulo_status_cotacao_bid_frete: editStatusLabel,
                    cor_status_cotacao_bid_frete: editStatusCor,
                  })
                  setStatusList(prev => [...prev, {
                    id: criado.id_status_cotacao_bid_frete,
                    nome: criado.nome_status_cotacao_bid_frete,
                    rotulo: criado.rotulo_status_cotacao_bid_frete,
                    cor: criado.cor_status_cotacao_bid_frete,
                    ordem: criado.ordem_status_cotacao_bid_frete,
                    is_sistema: criado.gerenciado_sistema_status_cotacao_bid_frete,
                  }])
                  setEditStatusLabel('')
                } catch (err) {
                  // Fallback: adicionar localmente se API falhar
                  const newId = `status_${Date.now()}`
                  setStatusList(prev => [...prev, { id: newId, nome: nomeNovo, rotulo: editStatusLabel, cor: editStatusCor, ordem: prev.length + 1, is_sistema: false }])
                  setEditStatusLabel('')
                  console.warn('[Configuracoes] Erro ao criar status via API, adicionado localmente', err)
                }
              }}>
                <Plus size={14} /> {t('bidfrete.configuracoes.adicionar_status')}
              </BotaoGlobal>
            </div>
          </section>
        )}

        {/* ── CATEGORIA: NUMERAÇÃO ── */}
        {categoria === 'numeracao' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.numeracao_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.numeracao_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', color: '#f1f5f9' }}>
                {t('bidfrete.configuracoes.prefixo_id')}
                <input
                  type="text"
                  value={numeracaoConfig.prefixo}
                  onChange={e => setNumeracaoConfig(prev => ({ ...prev, prefixo: e.target.value }))}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </label>
              <ToggleRow
                id="num-ano"
                label={t('bidfrete.configuracoes.incluir_ano_label')}
                desc={t('bidfrete.configuracoes.incluir_ano_desc')}
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
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.templates_pdf_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.templates_pdf_desc')}</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.seus_templates_label')} count={`${templatesPdf.length} templates`} />

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
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '0.5rem' }}>{t('bidfrete.configuracoes.editar_template')}</p>
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
                    <button type="button" className="cfg-btn-secundario cfg-btn-secundario--xs" onClick={() => setEditandoTemplateId(null)}>{t('comum.cancelar')}</button>
                    <button type="button" className="cfg-btn-primario cfg-btn-primario--xs" onClick={() => {
                      if (!tplNome.trim()) return
                      setTemplatesPdf(prev => prev.map(t => t.id === editandoTemplateId ? { ...t, nome: tplNome, codigo_fonte: tplConteudo } : t))
                      setEditandoTemplateId(null)
                    }}>{t('comum.salvar')}</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={() => {
                const newId = `tpl_${Date.now()}`
                setTemplatesPdf(prev => [...prev, { id: newId, nome: t('bidfrete.configuracoes.novo_template_nome'), documento_tipo: 'pdf', codigo_fonte: '<p>Novo</p>', created_at: new Date().toISOString() }])
              }}>
                <Plus size={14} /> {t('bidfrete.configuracoes.novo_template_pdf')}
              </BotaoGlobal>
            </div>
          </section>
        )}

        {/* ── CATEGORIA: REGRAS ── */}
        {categoria === 'regras' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.regras_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.regras_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ToggleRow
                id="reg-resp"
                label={t('bidfrete.configuracoes.envio_auto_label')}
                desc={t('bidfrete.configuracoes.envio_auto_desc')}
                checked={regrasConfig.respostaAutomatica}
                onChange={v => setRegrasConfig(prev => ({ ...prev, respostaAutomatica: v }))}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{t('bidfrete.configuracoes.prazo_limite_titulo')}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('bidfrete.configuracoes.prazo_limite_desc')}</p>
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
                label={t('bidfrete.configuracoes.alertar_incoterm_label')}
                desc={t('bidfrete.configuracoes.alertar_incoterm_desc')}
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
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.categ_anexos_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.categ_anexos_desc')}</p>
              </div>
            </div>

            <ConfiguracaoSecaoGlobal label={t('bidfrete.configuracoes.categorias_registradas_label')} count={`${categoriasAnexos.length} ${t('bidfrete.configuracoes.categorias_count')}`} />

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
                placeholder={t('bidfrete.configuracoes.placeholder_nova_categoria')}
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
                <Plus size={14} /> {t('bidfrete.configuracoes.adicionar_categoria')}
              </BotaoGlobal>
            </div>
          </section>
        )}

        {/* ── CATEGORIA: TAXA DE CÂMBIO ── */}
        {categoria === 'taxa-cambio' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.boletim_cambial_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.boletim_cambial_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(taxasCambio).map(([moeda, valor]) => (
                <div key={moeda} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CurrencyCircleDollar size={20} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{moeda} / BRL</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={e => setTaxasCambio(prev => ({ ...prev, [moeda]: Number(e.target.value) }))}
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
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.notificacoes_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.notificacoes_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ToggleRow
                id="not-resp"
                label={t('bidfrete.configuracoes.not_resposta_label')}
                desc={t('bidfrete.configuracoes.not_resposta_desc')}
                checked={notificacoesConfig.respostaFornecedor}
                onChange={v => setNotificacoesConfig(prev => ({ ...prev, respostaFornecedor: v }))}
              />
              <ToggleRow
                id="not-nova"
                label={t('bidfrete.configuracoes.not_nova_cotacao_label')}
                desc={t('bidfrete.configuracoes.not_nova_cotacao_desc')}
                checked={notificacoesConfig.novaCotacao}
                onChange={v => setNotificacoesConfig(prev => ({ ...prev, novaCotacao: v }))}
              />
              <ToggleRow
                id="not-exp"
                label={t('bidfrete.configuracoes.not_expirada_label')}
                desc={t('bidfrete.configuracoes.not_expirada_desc')}
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
                <h2 className="cfg-secao__titulo">{t('bidfrete.configuracoes.exportacao_titulo')}</h2>
                <p className="cfg-secao__desc">{t('bidfrete.configuracoes.exportacao_desc')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{t('bidfrete.configuracoes.formato_padrao')}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{t('bidfrete.configuracoes.formato_padrao_desc')}</p>
                </div>
                <select
                  value={exportConfig.formatoPadrao}
                  onChange={e => setExportConfig(prev => ({ ...prev, formatoPadrao: e.target.value as 'csv' | 'xlsx' | 'pdf' }))}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                >
                  <option value="xlsx">{t('bidfrete.configuracoes.formato_xlsx')}</option>
                  <option value="csv">{t('bidfrete.configuracoes.formato_csv')}</option>
                  <option value="pdf">{t('bidfrete.configuracoes.formato_pdf')}</option>
                </select>
              </div>
              <div className="cfg-divider" style={{ margin: '0.5rem 0' }} />
              <ToggleRow
                id="exp-prop"
                label={t('bidfrete.configuracoes.incluir_historico_label')}
                desc={t('bidfrete.configuracoes.incluir_historico_desc')}
                checked={exportConfig.incluirPropostas}
                onChange={v => setExportConfig(prev => ({ ...prev, incluirPropostas: v }))}
              />
            </div>
          </section>
        )}

      </main>
      </div>

      {/* ── Barra de Salvamento Flutuante ── */}
      <div className={`bf-cfg-savebar ${isDirtyGlobal ? 'bf-cfg-savebar--visible' : ''}`}>
        <div className="bf-cfg-savebar-inner">
          <span className="bf-cfg-dirty-msg">{t('bidfrete.configuracoes.alteracoes_nao_salvas')}</span>
          <div className="bf-cfg-savebar-actions">
            <BotaoCancelar
              dirty={isDirtyGlobal}
              rotulo={t('bidfrete.configuracoes.descartar')}
              onClick={handleDescartarTudo}
            />
            <BotaoSalvar
              dirty={isDirtyGlobal}
              rotulo={t('bidfrete.configuracoes.salvar_alteracoes')}
              onClick={handleSalvarTudo}
            />
          </div>
        </div>
      </div>

      {/* ── Modais Auxiliares ── */}
      {criandoCard && (
        <ModalNovoCardUsuario
          onFechar={() => setCriandoCard(false)}
          onSalvo={card => {
            const newId = `card_${Date.now()}`
            CARDS_CATALOGO.push({
              id: newId,
              campoBase: 'valor_total',
              tipoAgg: 'Soma',
              origem: 'Cotação',
              labelKey: card.nome,
              descKey: 'Custom card desc',
              descricao: 'Card customizado pelo usuário'
            })
            setCardsPref(prev => [...prev, { id: newId, visible: true }])
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
              visibilidade: col.visibilidade,
              obrigatorio: false,
              valor_padrao: '',
              descricao: 'Nova coluna personalizada',
              opcoes: [],
              formula_expressao: '',
              ativo: true
            }])
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

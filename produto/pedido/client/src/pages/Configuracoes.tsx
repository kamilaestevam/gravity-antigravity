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
  Paperclip, CurrencyCircleDollar, ArrowsClockwise, Clock, CaretDown,
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
import { SelecaoExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { useCardPreferences, CARDS_CATALOGO, type CardPreferencia } from '../shared/useCardPreferences'
import { pdfApi, colunasUsuarioApi, configRegrasApi, kanbanConfigApi, type PdfTemplate } from '../shared/api'
import type { KanbanPreferencias, KanbanCampoConfig, KanbanCampoDisponivel } from '../shared/types'
import { KANBAN_LIMITES, KANBAN_PADRAO, KANBAN_CAMPOS_DISPONIVEIS, KANBAN_CARD_CAMPOS_DISPONIVEIS, KANBAN_CARD_GRUPOS } from '../shared/types'
import { parsearFormula, detectarCircular } from '../shared/formulaEngine'
import type { FormulaAST } from '../shared/formulaEngine'
import { analisarSemanticaFormula, SEMANTICA_CAMPOS } from '../shared/gabiSemantica'
import type {
  ColunaUsuario as ColunaUsuarioApi,
  TipoColunaUsuario,
  EscopoColunaUsuario,
  VisibilidadeColunaUsuario,
} from '../shared/types'
import { CfgSectionLabel } from '@nucleo/cabecalho-secao-global'
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
  pref, onToggle, onRemover,
}: {
  pref: CardPreferencia
  onToggle: () => void
  onRemover: () => void
}) {
  const { t } = useTranslation()
  const def    = CARDS_CATALOGO.find(c => c.id === pref.id)!
  const visual = CARD_VISUAL[pref.id]

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}`}
    >
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
          <p className="cfg-card-row__desc">{t(def.descKey)}</p>
        </div>
      </div>

      <span className="cfg-origem-badge cfg-origem-badge--meus">{def.origem}</span>

      <TooltipGlobal descricao={pref.visible ? 'Ocultar na lista' : 'Exibir na lista'}>
        <button
          type="button"
          className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
          onClick={onToggle}
          aria-label={pref.visible ? 'Ocultar card' : 'Exibir card'}
        >
          {pref.visible
            ? <Eye      size={15} weight="bold" />
            : <EyeSlash size={15} weight="bold" />
          }
        </button>
      </TooltipGlobal>

      <TooltipGlobal descricao="Remover da lista">
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
  )
}

// ─── Status sortável (DnD) ────────────────────────────────────────────────────

interface StatusPedido {
  id: string
  label: string
  cor: string
  sistema: boolean
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
  status: StatusPedido
  editandoId: string | null
  editLabel: string
  editCor: string
  onIniciarEdicao: (s: StatusPedido) => void
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

  const isEditando = editandoId === status.id

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`cfg-status-row${isEditando ? ' cfg-status-row--editando' : ''}`}>
        <button
          type="button"
          className="cfg-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>

        <span
          className="cfg-status-dot"
          style={{ background: status.cor }}
        />

        <span className="cfg-status-label">{status.label}</span>

        {status.sistema && (
          <span className="cfg-badge-sistema">sistema</span>
        )}

        <div className="cfg-status-acoes">
          <TooltipGlobal descricao="Editar status">
            <button
              type="button"
              className="cfg-eye-btn"
              onClick={() => onIniciarEdicao(status)}
              aria-label="Editar status"
            >
              <PencilSimple size={14} weight="bold" />
            </button>
          </TooltipGlobal>
          {!status.sistema && (
            <TooltipGlobal descricao="Excluir status">
              <button
                type="button"
                className="cfg-remove-btn"
                onClick={() => onExcluir(status.id)}
                aria-label="Excluir status"
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

// ── Sidebar hierárquica ───────────────────────────────────────────────────────

type SidebarItemTipo =
  | { tipo: 'item';   id: string; label: string; icone: React.ReactNode; ativo: boolean }
  | { tipo: 'grupo';  label: string }
  | { tipo: 'parent'; id: string; label: string; icone: React.ReactNode; ativo: boolean; filhos: string[] }
  | { tipo: 'sub';    id: string; label: string; icone: React.ReactNode; ativo: boolean }

const KANBAN_FILHOS  = ['kanban-modal', 'kanban-card']
const COLUNAS_FILHOS = ['colunas-casas-decimais', 'colunas-personalizadas', 'colunas-campos-calculados']

const SIDEBAR_ITEMS: SidebarItemTipo[] = [
  // ── VISUALIZAÇÕES ──────────────────────────────────────────────────────────
  { tipo: 'grupo',  label: 'VISUALIZAÇÕES' },
  { tipo: 'item',   id: 'cards',                          label: 'Cards',             icone: <SquaresFour          size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'tabela',                         label: 'Tabela',            icone: <Table                size={15} weight="duotone" />, ativo: true },
  { tipo: 'parent', id: 'colunas-casas-decimais',         label: 'Colunas',           icone: <Columns              size={15} weight="duotone" />, ativo: true, filhos: COLUNAS_FILHOS },
  { tipo: 'sub',    id: 'colunas-casas-decimais',         label: 'Casas Decimais',    icone: <Hash                 size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-personalizadas',         label: 'Personalizadas',    icone: <Columns              size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'colunas-campos-calculados',      label: 'Campos Calculados', icone: <MathOperations       size={15} weight="duotone" />, ativo: true },
  { tipo: 'parent', id: 'kanban',                         label: 'Kanban',            icone: <Columns              size={15} weight="duotone" />, ativo: true, filhos: KANBAN_FILHOS },
  { tipo: 'sub',    id: 'kanban-modal',                   label: 'Modal',             icone: <Columns              size={15} weight="duotone" />, ativo: true },
  { tipo: 'sub',    id: 'kanban-card',                    label: 'Card',              icone: <SquaresFour          size={15} weight="duotone" />, ativo: true },
  // ── PEDIDO ─────────────────────────────────────────────────────────────────
  { tipo: 'grupo',  label: 'PEDIDO' },
  { tipo: 'item',   id: 'status',            label: 'Status',         icone: <Tag                  size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'numeracao',         label: 'Numeração',      icone: <Hash                 size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'templates-pdf',     label: 'Templates PDF',  icone: <FloppyDisk           size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'regras',            label: 'Regras',         icone: <Sliders              size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'categorias-anexos', label: 'Categ. Anexos',  icone: <Folder               size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'taxa-cambio',       label: 'Taxa de Câmbio', icone: <CurrencyCircleDollar size={15} weight="duotone" />, ativo: true },
  // ── SISTEMA ────────────────────────────────────────────────────────────────
  { tipo: 'grupo',  label: 'SISTEMA' },
  { tipo: 'item',   id: 'notificacoes',      label: 'Notificações',   icone: <Bell                 size={15} weight="duotone" />, ativo: true },
  { tipo: 'item',   id: 'exportacao',        label: 'Exportação',     icone: <DownloadSimple       size={15} weight="duotone" />, ativo: true },
]

type CategoriaId = string

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface TabelaConfig {
  linhasPorPagina: 25 | 50 | 100 | 200
  expandirTodos: boolean
  manterSelecao: boolean
  exibirTotalItens: boolean
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

const COLUNAS_NUMERICAS = [
  // ── Pedido (pai) ──
  { campo: 'quantidade_total_inicial_pedido',   label: 'Quantidade Inicial',         categoria: 'Pedido', padrao: 0 },
  { campo: 'quantidade_pronta_itens_pedido_total', label: 'Quantidade Pronta',      categoria: 'Pedido', padrao: 0 },
  { campo: 'quantidade_cancelada_total_pedido', label: 'Quantidade Cancelada',      categoria: 'Pedido', padrao: 0 },
  { campo: 'quantidade_transferida_total',     label: 'Quantidade Transferida',     categoria: 'Pedido', padrao: 0 },
  { campo: 'peso_liquido_total_pedido',        label: 'Peso Líquido Total',         categoria: 'Pedido', padrao: 3 },
  { campo: 'peso_bruto_total_pedido',          label: 'Peso Bruto Total',           categoria: 'Pedido', padrao: 3 },
  { campo: 'cubagem_total_pedido',             label: 'Cubagem Total',              categoria: 'Pedido', padrao: 4 },
  // ── Item (filho) ──
  { campo: 'quantidade_item',                  label: 'Quantidades dos Itens',      categoria: 'Item',   padrao: 0 },
  { campo: 'peso_liquido_unitario',            label: 'Peso Líquido Unitário',      categoria: 'Item',   padrao: 3 },
  { campo: 'peso_bruto_unitario',              label: 'Peso Bruto Unitário',        categoria: 'Item',   padrao: 3 },
  { campo: 'cubagem_unitaria',                 label: 'Cubagem Unitária',           categoria: 'Item',   padrao: 4 },
  { campo: 'quantidade_unidade_estatistica',   label: 'Qtd. Unidade Estatística',   categoria: 'Item',   padrao: 2 },
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

const VISIBILIDADE_OPCOES: { valor: VisibilidadeColunaUsuario; label: string }[] = [
  { valor: 'todos',   label: 'Todos do tenant' },
  { valor: 'roles',   label: 'Por perfil/role' },
  { valor: 'privado', label: 'Só eu'           },
]

const EXPORT_CONFIG_KEY = 'pedido:export_config'

function carregarExportConfig(): ExportacaoConfig {
  try {
    const raw = localStorage.getItem(EXPORT_CONFIG_KEY)
    if (raw) return JSON.parse(raw) as ExportacaoConfig
  } catch { /* ignore */ }
  return { formatoPadrao: 'xlsx', incluirColunasUsuario: true, incluirItens: true, apenasSelection: false, incluirCabecalho: true, separadorCsv: 'ponto-virgula' }
}

function carregarCasasDecimais(): Record<string, number> {
  try {
    const raw = localStorage.getItem('pedido:casas_decimais')
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch { /* ignore */ }
  return Object.fromEntries(COLUNAS_NUMERICAS.map(c => [c.campo, c.padrao]))
}

const NOVA_COLUNA_PADRAO: NovaColuna = {
  nome: '',
  tipo: 'texto',
  escopo: 'pedido',
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
  { chave: 'quantidade_total_inicial_pedido',      alias: 'quantidade_inicial',     label: 'Quantidade Inicial' },
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

function carregarSaldoTokens(): SaldoToken[] {
  return aliasFormulaParaTokens(carregarSaldoFormula())
}

// ── Campos Calculados — Saldo do Pedido ──────────────────────────────────────
// SALDO_FORMULA_PADRAO fica em forma de chave (armazenamento); exibição usa alias.
const SALDO_FORMULA_PADRAO =
  'quantidade_total_inicial_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido'
const SALDO_FORMULA_KEY = 'pedido:saldo_formula'

function carregarSaldoFormula(): string {
  try {
    const raw = localStorage.getItem(SALDO_FORMULA_KEY)
    if (raw) return formulaParaAlias(raw)
  } catch { /* ignore */ }
  return formulaParaAlias(SALDO_FORMULA_PADRAO)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

  function handleCasasDecimaisChange(campo: string, valor: number) {
    const next = { ...casasDecimais, [campo]: valor }
    setCasasDecimais(next)
    localStorage.setItem('pedido:casas_decimais', JSON.stringify(next))
  }

  // ── Estado: colunas numéricas do usuário (via API — para exibir em Casas Decimais) ──
  const [colunasUsuarioApi_, setColunasUsuarioApi] = useState<ColunaUsuarioApi[]>([])
  useEffect(() => {
    colunasUsuarioApi.listar()
      .then(lista => setColunasUsuarioApi(lista))
      .catch(() => {})
  }, [])

  // ── Estado: colunas personalizadas (via API) ──
  const [novaColuna, setNovaColuna] = useState<NovaColuna>(NOVA_COLUNA_PADRAO)
  const [novaOpcao, setNovaOpcao] = useState('')
  const [salvandoColuna, setSalvandoColuna] = useState(false)
  const [erroColuna, setErroColuna] = useState<string | null>(null)
  const formulaTextareaRef = useRef<HTMLTextAreaElement>(null)
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

  // ── Saldo do Pedido — Campos Calculados (editor tokenizado) ──
  const [saldoTokens,          setSaldoTokens]          = useState<SaldoToken[]>(carregarSaldoTokens)
  const [saldoFormulaErro,     setSaldoFormulaErro]     = useState<string | null>(null)
  const [saldoFormulaValida,   setSaldoFormulaValida]   = useState(false)
  const [saldoFormulaGabi,     setSaldoFormulaGabi]     = useState<{ titulo: string; texto: string; sugestao?: string } | null>(null)
  const saldoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saldoCamposRef   = useRef<Array<{ chave: string; label: string; unidade?: string; papel?: string }>>([])
  const [saldoFormulaAnalisando, setSaldoFormulaAnalisando] = useState(false)

  // Derivado — true quando fórmula difere do padrão salvo
  const saldoFormulaAlterada = tokensParaChaveFormula(saldoTokens) !== SALDO_FORMULA_PADRAO

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

  function salvarSaldoFormula() {
    try { localStorage.setItem(SALDO_FORMULA_KEY, tokensParaChaveFormula(saldoTokens)) } catch { /* ignore */ }
  }

  function restaurarSaldoPadrao() {
    try { localStorage.removeItem(SALDO_FORMULA_KEY) } catch { /* ignore */ }
    setSaldoTokens(aliasFormulaParaTokens(formulaParaAlias(SALDO_FORMULA_PADRAO)))
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

  function inserirCampoFormula(chave: string) {
    const el = formulaTextareaRef.current
    if (!el) {
      const novo = novaColuna.formula_expressao + chave
      handleFormulaChange(novo)
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end   = el.selectionEnd   ?? el.value.length
    const antes  = el.value.slice(0, start)
    const depois = el.value.slice(end)
    const sep    = antes.length > 0 && !/[\s(+\-*/]$/.test(antes) ? ' ' : ''
    const novo   = antes + sep + chave + depois
    handleFormulaChange(novo)  // garante que debounce e estado GABI sejam atualizados
    // Reposicionar cursor após o campo inserido
    requestAnimationFrame(() => {
      el.focus()
      const pos = (antes + sep + chave).length
      el.setSelectionRange(pos, pos)
    })
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
        escopo: novaColuna.escopo,
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
      setNovaOpcao('')
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
  const [tabelaConfig, setTabelaConfig] = useState<TabelaConfig>({
    linhasPorPagina: 100,
    expandirTodos: true,
    manterSelecao: false,
    exibirTotalItens: true,
    destacarAtrasados: true,
  })

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
  const [templates, setTemplates] = useState<PdfTemplate[]>([])
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
      pdfApi.listarTemplates()
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

  function iniciarEdicaoTemplate(tpl: PdfTemplate) {
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
        const novo = await pdfApi.criarTemplate({ nome: templateNome, conteudo: templateConteudo })
        setTemplates(prev => [...prev, novo])
      } else if (templateEditando) {
        const atualizado = await pdfApi.atualizarTemplate(templateEditando, { nome: templateNome, conteudo: templateConteudo })
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
      await pdfApi.deletarTemplate(id)
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

  const [kanbanPrefs, setKanbanPrefs]       = useState<KanbanPreferencias | null>(null)
  const [kanbanLoading, setKanbanLoading]   = useState(false)
  const kanbanSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (categoria !== 'kanban') return
    setKanbanLoading(true)
    kanbanConfigApi.obterPreferencias()
      .then(res => setKanbanPrefs(res.data))
      .catch(() => setKanbanPrefs(null))
      .finally(() => setKanbanLoading(false))
  }, [categoria])

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

  // ── Status state ──
  const STATUS_INICIAIS: StatusPedido[] = [
    { id: 'rascunho',     label: 'Rascunho',     cor: '#94a3b8', sistema: false },
    { id: 'aberto',       label: 'Aberto',       cor: '#f472b6', sistema: false },
    { id: 'em_andamento', label: 'Em Andamento', cor: '#fb923c', sistema: false },
    { id: 'aprovado',     label: 'Aprovado',     cor: '#facc15', sistema: false },
    { id: 'transferencia',label: 'Transferido',  cor: '#2dd4bf', sistema: true  },
    { id: 'consolidado',  label: 'Consolidado',  cor: '#a78bfa', sistema: true  },
    { id: 'cancelado',    label: 'Cancelado',    cor: '#f87171', sistema: false },
  ]

  const [statusList, setStatusList] = useState<StatusPedido[]>(() => {
    try {
      const versao = localStorage.getItem('pedido:status_cores_version')
      const raw = localStorage.getItem('pedido:status_config')
      if (raw) {
        const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
        const from = STATUS_INICIAIS.map(s => ({
          ...s,
          // Se versão desatualizada, usa cor do STATUS_INICIAIS (novo padrão); senão, usa a salva
          cor: versao === 'v2' ? (parsed[s.id]?.cor ?? s.cor) : s.cor,
          label: parsed[s.id]?.label ?? s.label,
        }))
        // Adicionar status customizados salvos que não estão nos iniciais
        const extras = Object.entries(parsed)
          .filter(([id]) => !STATUS_INICIAIS.find(s => s.id === id))
          .map(([id, cfg]) => ({ id, label: cfg.label, cor: cfg.cor, sistema: false }))
        return [...from, ...extras]
      }
    } catch { /* fallback */ }
    return STATUS_INICIAIS
  })
  const [statusEditandoId, setStatusEditandoId] = useState<string | null>(null)
  const [statusEditLabel, setStatusEditLabel] = useState('')
  const [statusEditCor, setStatusEditCor] = useState('')
  const [statusCriando, setStatusCriando] = useState(false)
  const [statusNovoLabel, setStatusNovoLabel] = useState('')
  const [statusNovoCor, setStatusNovoCor] = useState('#818cf8')

  // Garante que o localStorage sempre tem os status (incluindo novos sistema) na primeira visita
  useEffect(() => {
    const raw = localStorage.getItem('pedido:status_config')
    if (!raw) {
      persistirStatusConfig(STATUS_INICIAIS)
    } else {
      // Garante que status de sistema novos (como transferencia) estejam presentes
      try {
        const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
        const faltando = STATUS_INICIAIS.filter(s => !parsed[s.id])
        if (faltando.length > 0) {
          const atualizado = { ...parsed }
          for (const s of faltando) atualizado[s.id] = { label: s.label, cor: s.cor }
          localStorage.setItem('pedido:status_config', JSON.stringify(atualizado))
        }
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Taxa de Câmbio ────────────────────────────────────────────────────────

  interface RegistroTaxa {
    id: string; moeda: string; compra: number; venda: number
    data_cotacao: string; hora_cotacao: string | null; boletim: string; fonte: string
  }

  const [taxasHoje, setTaxasHoje] = useState<RegistroTaxa[]>([])
  const [historicoTaxas, setHistoricoTaxas] = useState<RegistroTaxa[]>([])
  const [moedaHistoricoTaxa, setMoedaHistoricoTaxa] = useState('USD')
  const [sincronizandoTaxa, setSincronizandoTaxa] = useState(false)
  const [carregandoTaxa, setCarregandoTaxa] = useState(false)
  const [ultimaSyncTaxa, setUltimaSyncTaxa] = useState<string | null>(null)
  const [erroSyncTaxa, setErroSyncTaxa] = useState<string | null>(null)

  const buscarTaxasAtuais = useCallback(async () => {
    setCarregandoTaxa(true)
    try {
      const res = await fetch('/api/v1/taxa-cambio')
      if (res.ok) {
        const json = await res.json()
        // Aplanar por_moeda → array flat ordenado por moeda + boletim
        const flat: RegistroTaxa[] = []
        for (const registros of Object.values(json.por_moeda ?? {})) {
          flat.push(...(registros as RegistroTaxa[]))
        }
        flat.sort((a, b) => {
          const oi = MOEDAS_ORDEM.indexOf(a.moeda)
          const oj = MOEDAS_ORDEM.indexOf(b.moeda)
          const orderDiff = (oi === -1 ? 99 : oi) - (oj === -1 ? 99 : oj)
          return orderDiff !== 0 ? orderDiff : a.boletim.localeCompare(b.boletim)
        })
        setTaxasHoje(flat)
      }
    } catch { /* silent */ } finally { setCarregandoTaxa(false) }
  }, [])

  const buscarHistoricoTaxa = useCallback(async (moeda: string) => {
    try {
      const res = await fetch(`/api/v1/taxa-cambio/historico?moeda=${moeda}&dias=30`)
      if (res.ok) { const json = await res.json(); setHistoricoTaxas(json.historico ?? []) }
    } catch { setHistoricoTaxas([]) }
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
      const res = await fetch('/api/v1/taxa-cambio/sync', { method: 'POST' })
      const json = await res.json()
      if (json.total_ok === 0) { setErroSyncTaxa('Não foi possível sincronizar. O serviço pode estar offline.') }
      else { setUltimaSyncTaxa(new Date().toLocaleTimeString('pt-BR')); await buscarTaxasAtuais(); await buscarHistoricoTaxa(moedaHistoricoTaxa) }
    } catch { setErroSyncTaxa('Erro de comunicação.') } finally { setSincronizandoTaxa(false) }
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
    setStatusList(prev => arrayMove(prev, oldIndex, newIndex))
  }

  function iniciarEdicaoStatus(s: StatusPedido) {
    setStatusEditandoId(s.id)
    setStatusEditLabel(s.label)
    setStatusEditCor(s.cor)
    setStatusCriando(false)
  }

  function salvarEdicaoStatus() {
    if (!statusEditLabel.trim() || !statusEditandoId) return
    setStatusList(prev => {
      const nova = prev.map(s => s.id === statusEditandoId
        ? { ...s, label: statusEditLabel.trim(), cor: statusEditCor }
        : s
      )
      persistirStatusConfig(nova)
      return nova
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
    setStatusList(prev => {
      const nova = prev.filter(s => s.id !== id)
      persistirStatusConfig(nova)
      return nova
    })
    setRegrasConfig(prev => ({
      ...prev,
      excluir: {
        ...prev.excluir,
        statusPermitidos: prev.excluir.statusPermitidos.filter(s => s !== id),
      },
    }))
  }

  function adicionarStatus() {
    if (!statusNovoLabel.trim()) return
    const novo: StatusPedido = {
      id: `status_${Date.now()}`,
      label: statusNovoLabel.trim(),
      cor: statusNovoCor,
      sistema: false,
    }
    setStatusList(prev => {
      const nova = [...prev, novo]
      persistirStatusConfig(nova)
      return nova
    })
    setStatusNovoLabel('')
    setStatusNovoCor('#818cf8')
    setStatusCriando(false)
  }

  function persistirStatusConfig(lista: StatusPedido[]) {
    try {
      const mapa = Object.fromEntries(lista.map(s => [s.id, { label: s.label, cor: s.cor }]))
      localStorage.setItem('pedido:status_config', JSON.stringify(mapa))
      localStorage.setItem('pedido:status_cores_version', 'v2')
    } catch { /* silenciar erros de quota */ }
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
                  {item.label}
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
                    <span className="cfg-sidebar__item-label">{item.label}</span>
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
                            <span className="cfg-sidebar__item-label">{sub.label}</span>
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
                <span className="cfg-sidebar__item-label">{item.label}</span>
                {!item.ativo && <span className="cfg-badge-breve">Em breve</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="cfg-conteudo">

        {/* ════════════════════════ CARDS ════════════════════════ */}
        {categoria === 'cards' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">

              {/* ── Header unificado ── */}
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Meus Cards</h2>
                  <p className="cfg-secao__desc">
                    Cards exibidos no topo da tela · arraste para reordenar · olho para ocultar
                  </p>
                </div>
                <TooltipGlobal descricao="Restaura os 3 cards padrão do produto">
                  <button type="button" className="cfg-btn-header--restaurar" onClick={resetar}>
                    <ArrowCounterClockwise size={13} weight="bold" />
                    Restaurar padrão
                  </button>
                </TooltipGlobal>
              </div>

              {/* ── Período de comparação ── */}
              <CfgSectionLabel label="PERÍODO DE COMPARAÇÃO" />
              <div className="cfg-periodo-pills" style={{ marginTop: '0.75rem' }}>
                {PERIODOS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cfg-periodo-pill${periodoAtivo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                    onClick={() => setPeriodoAtivo(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* ── Preview ao vivo ── */}
              {prefs.length > 0 && (
                <div className="cfg-cards-preview-wrap">
                  <p className="cfg-cards-preview-label">
                    <SquaresFour size={12} weight="fill" />
                    Preview — como ficará na tela
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
                  </div>
                </div>
              )}

              {/* ── Ativos ── */}
              <CfgSectionLabel label="ATIVOS" count={`${prefs.length} card${prefs.length !== 1 ? 's' : ''}`} />

              {prefs.length === 0 ? (
                <p className="cfg-empty">Nenhum card adicionado. Escolha na lista abaixo.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={prefs.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="cfg-cards-lista">
                      {prefs.map(pref => (
                        <CardSortavel
                          key={pref.id}
                          pref={pref}
                          onToggle={() => toggle(pref.id)}
                          onRemover={() => remover(pref.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* ── Disponíveis para adicionar ── */}
              <CfgSectionLabel label="DISPONÍVEIS PARA ADICIONAR" hint="clique em + para adicionar" style={{ marginTop: '1.5rem' }} />

              <div className="cfg-tabela-head">
                <span className="cfg-tabela-head__col cfg-tabela-head__col--nome">Coluna</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--origem">Origem</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--agg">Agregação</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--acao" />
              </div>

              <div className="cfg-cards-lista">
                {CARDS_CATALOGO.filter(def => !prefs.find(p => p.id === def.id)).map(def => {
                  const visual = CARD_VISUAL[def.id]
                  return (
                    <div key={def.id} className="cfg-card-row cfg-card-row--disponivel">
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
                        {def.origem}
                      </span>
                      <span className="cfg-agg-badge">{def.tipoAgg}</span>
                      <TooltipGlobal descricao="Adicionar aos meus cards">
                        <button
                          type="button"
                          className="cfg-add-btn"
                          onClick={() => adicionar(def.id)}
                          aria-label="Adicionar card"
                        >
                          <Plus size={13} weight="bold" />
                        </button>
                      </TooltipGlobal>
                    </div>
                  )
                })}
                {CARDS_CATALOGO.filter(def => !prefs.find(p => p.id === def.id)).length === 0 && (
                  <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                    Todos os cards disponíveis já foram adicionados
                  </p>
                )}
              </div>

            </section>
          </div>
        )}

        {/* ════════════════════════ TABELA ════════════════════════ */}
        {categoria === 'tabela' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Tabela</h2>
                  <p className="cfg-secao__desc">Preferências de exibição da lista de pedidos</p>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">Linhas por página padrão</p>
                <div className="cfg-periodo-pills">
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
              </div>

              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="tb-expandir"
                  label="Expandir todos os pedidos ao abrir"
                  checked={tabelaConfig.expandirTodos}
                  onChange={v => setTabelaConfig(prev => ({ ...prev, expandirTodos: v }))}
                />
                <ToggleRow
                  id="tb-selecao"
                  label="Manter seleção ao mudar de página"
                  checked={tabelaConfig.manterSelecao}
                  onChange={v => setTabelaConfig(prev => ({ ...prev, manterSelecao: v }))}
                />
                <ToggleRow
                  id="tb-total-itens"
                  label="Exibir total de itens por pedido"
                  checked={tabelaConfig.exibirTotalItens}
                  onChange={v => setTabelaConfig(prev => ({ ...prev, exibirTotalItens: v }))}
                />
                <ToggleRow
                  id="tb-atrasados"
                  label="Destacar pedidos atrasados em vermelho"
                  checked={tabelaConfig.destacarAtrasados}
                  onChange={v => setTabelaConfig(prev => ({ ...prev, destacarAtrasados: v }))}
                />
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════ KANBAN MODAL ════════════════════════ */}
        {(categoria === 'kanban-modal' || categoria === 'kanban-card') && (
          <div className="cfg-kanban-wrapper">

            {/* ── Sub: Modal ── */}
            {categoria === 'kanban-modal' && (
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Campos do modal</h2>
                  <p className="cfg-secao__desc">Configure os campos exibidos em cada aba ao abrir um pedido no Kanban</p>
                </div>
              </div>

              {kanbanLoading && <p className="cfg-loading-msg">Carregando...</p>}

              {!kanbanLoading && (() => {
                const campos  = kanbanCamposDeAba(abaAtiva)
                const limite  = KANBAN_LIMITES[abaAtiva] ?? 10
                const nomeAba = abaAtiva === 'pedido' ? 'Pedido' : abaAtiva === 'quantidades' ? 'Quantidades' : 'Datas'
                const disponiveis = KANBAN_CAMPOS_DISPONIVEIS.filter(cd => cd.categoria === abaAtiva)
                return (
                  <>
                    {/* ── Preview ao vivo — mini modal ── */}
                    <div className="cfg-cards-preview-wrap">
                      <p className="cfg-cards-preview-label">
                        <SquaresFour size={12} weight="fill" />
                        Preview — como ficará no modal
                      </p>
                      <div className="cfg-modal-preview">
                        {/* Tab bar */}
                        <div className="cfg-modal-preview__tabs">
                          {(['pedido', 'quantidades', 'datas', 'lembrete'] as const).map(tab => {
                            const nome = tab === 'pedido' ? 'Pedido' : tab === 'quantidades' ? 'Quantidades' : tab === 'datas' ? 'Datas' : 'Lembrete'
                            return (
                              <span key={tab} className={`cfg-modal-preview__tab${tab === abaAtiva ? ' cfg-modal-preview__tab--ativo' : ''}`}>
                                {nome}
                              </span>
                            )
                          })}
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
                              Nenhum campo ativo
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
                        const nome = aba === 'pedido' ? 'Pedido' : aba === 'quantidades' ? 'Quantidades' : 'Datas'
                        return (
                          <button
                            key={aba}
                            type="button"
                            className={`cfg-periodo-pill${abaAtiva === aba ? ' cfg-periodo-pill--ativo' : ''}`}
                            onClick={() => setAbaAtiva(aba)}
                          >
                            {nome}
                            <span style={{ marginLeft: '0.375rem', fontSize: '0.6875rem', opacity: 0.7 }}>
                              {qtd}/{lim}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* ── Ativos ── */}
                    <CfgSectionLabel
                      label="ATIVOS"
                      count={`${campos.length}/${limite} campos`}
                      action={
                        <TooltipGlobal descricao={`Restaura os campos padrão da aba ${nomeAba}`}>
                          <button type="button" className="cfg-btn-header--restaurar" onClick={kanbanRestaurarPadrao}>
                            <ArrowCounterClockwise size={13} weight="bold" />
                            Restaurar padrão
                          </button>
                        </TooltipGlobal>
                      }
                    />
                    <p className="cfg-hint">Arraste para reordenar · olho para ocultar · × para remover</p>

                    <div className="cfg-kanban-campos-lista">
                      {campos.length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          Nenhum campo ativo — adicione abaixo
                        </p>
                      )}
                      {campos.map(cfg => (
                        <div key={cfg.campo} className={`cfg-kanban-campo-row${!cfg.visivel ? ' cfg-kanban-campo-row--oculto' : ''}`}>
                          <span className="cfg-drag-handle" aria-label="Arrastar">
                            <DotsSixVertical size={15} weight="bold" />
                          </span>
                          <span className="cfg-kanban-campo-label">{cfg.label}</span>
                          <button
                            type="button"
                            className={`cfg-eye-btn${cfg.visivel ? ' cfg-eye-btn--on' : ''}`}
                            onClick={() => kanbanToggleVisivel(abaAtiva, cfg.campo)}
                            aria-label={cfg.visivel ? 'Ocultar campo' : 'Exibir campo'}
                          >
                            {cfg.visivel ? <Eye size={14} weight="bold" /> : <EyeSlash size={14} weight="bold" />}
                          </button>
                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => kanbanRemoverCampo(abaAtiva, cfg.campo)}
                            aria-label="Remover campo"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ── Disponíveis para adicionar ── */}
                    <CfgSectionLabel label="DISPONÍVEIS PARA ADICIONAR" hint="clique em + para adicionar" style={{ marginTop: '1.5rem' }} />
                    <div className="cfg-kanban-disponivel-lista">
                      {disponiveis.filter(cd => !kanbanCamposEmUso().has(cd.campo)).map(cd => {
                        const cheio = campos.length >= limite
                        return (
                          <div key={cd.campo} className="cfg-kanban-disponivel-row">
                            <span className="cfg-kanban-disponivel-label">{cd.label}</span>
                            <TooltipGlobal descricao={cheio ? `Limite atingido (${campos.length}/${limite}) — remova um campo` : `Adicionar à aba ${nomeAba}`}>
                              <button
                                type="button"
                                className={`cfg-kanban-add-btn${cheio ? ' cfg-kanban-add-btn--disabled' : ''}`}
                                onClick={() => { if (!cheio) kanbanAdicionarCampo(abaAtiva, cd) }}
                                disabled={cheio}
                                aria-label="Adicionar campo"
                              >
                                <Plus size={13} weight="bold" />
                              </button>
                            </TooltipGlobal>
                          </div>
                        )
                      })}
                      {disponiveis.filter(cd => !kanbanCamposEmUso().has(cd.campo)).length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          Todos os campos disponíveis já foram adicionados
                        </p>
                      )}
                    </div>

                    {/* Aba fixa Lembrete — informativa */}
                    <div className="cfg-kanban-aba cfg-kanban-aba--fixa" style={{ marginTop: '1.5rem' }}>
                      <CfgSectionLabel
                        label="ABA LEMBRETE"
                        action={<span className="cfg-kanban-aba-fixa-badge">fixa</span>}
                      />
                      <p className="cfg-hint">Aba fixa — comportamento nativo, não configurável</p>
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
                  <h2 className="cfg-secao__titulo">Conteúdo do card</h2>
                  <p className="cfg-secao__desc">Escolha o que aparece em cada card do Kanban</p>
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
                        Preview — como ficará no card
                      </p>
                      <div className="cfg-card-preview">
                        <div className="cfg-card-preview__header">
                          <span className="cfg-card-preview__numero">PED-2025-0001</span>
                          <span className="cfg-card-preview__fixo-badge">fixo</span>
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
                              Nenhum campo ativo
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
                    <CfgSectionLabel label="ATIVOS" count={`${ativos.length + 1} campo${ativos.length + 1 !== 1 ? 's' : ''}`} />
                    <p className="cfg-hint">Olho para ocultar · Nº do Pedido é fixo e sempre exibido</p>
                    <div className="cfg-kanban-campos-lista">
                      {/* Campo fixo sempre no topo */}
                      <div className="cfg-kanban-campo-row cfg-kanban-campo-row--fixo">
                        <span className="cfg-kanban-campo-label">Nº do Pedido</span>
                        <span className="cfg-kanban-aba-fixa-badge">fixo</span>
                      </div>
                      {ativos.length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          Nenhum campo ativo — adicione abaixo
                        </p>
                      )}
                      {KANBAN_CARD_GRUPOS.map(grupo => {
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
                    <CfgSectionLabel label="DISPONÍVEIS PARA ADICIONAR" hint="clique em + para adicionar" style={{ marginTop: '1.5rem' }} />
                    <div className="cfg-kanban-disponivel-lista">
                      <div className="cfg-kanban-disponivel-header">
                        <span>Campo</span>
                        <span>Grupo</span>
                        <span></span>
                      </div>
                      {disponiveis.length === 0 && (
                        <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                          Todos os campos estão ativos
                        </p>
                      )}
                      {disponiveis.map(cfg => (
                        <div key={cfg.campo} className="cfg-kanban-disponivel-row">
                          <span className="cfg-kanban-disponivel-label">{cfg.label}</span>
                          <span className="cfg-origem-badge cfg-origem-badge--pedido">{cfg.grupo}</span>
                          <TooltipGlobal descricao={`Exibir no card`}>
                            <button
                              type="button"
                              className="cfg-kanban-add-btn"
                              onClick={() => kanbanCardToggle(cfg.campo)}
                              aria-label="Exibir campo"
                            >
                              <Plus size={13} weight="bold" />
                            </button>
                          </TooltipGlobal>
                        </div>
                      ))}
                    </div>

                    {/* ── Data crítica ── */}
                    <CfgSectionLabel label="DATA CRÍTICA" style={{ marginTop: '1.5rem' }} />
                    <p className="cfg-hint">Barra colorida de urgência (ok / alerta / urgente) baseada nesta data</p>
                    <select
                      className="cfg-select"
                      value={dataCritica}
                      onChange={e => kanbanCardSetDataCritica(e.target.value || null)}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <option value="">— Não exibir —</option>
                      {KANBAN_CAMPOS_DISPONIVEIS.filter(c => c.categoria === 'datas').map(c => (
                        <option key={c.campo} value={c.campo}>{c.label}</option>
                      ))}
                    </select>
                  </>
                )
              })()}
            </section>
            </>)}

          </div>
        )}

        {/* ════════════════════════ STATUS ════════════════════════ */}
        {categoria === 'status' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Status do Pedido</h2>
                  <p className="cfg-secao__desc">
                    Arraste para reordenar · edite o nome e a cor · status de sistema não podem ser excluídos
                  </p>
                </div>
                {!statusCriando && (
                  <button
                    type="button"
                    className="cfg-add-row-btn"
                    onClick={() => { setStatusCriando(true); setStatusEditandoId(null) }}
                  >
                    <Plus size={13} weight="bold" />
                    Novo Status
                  </button>
                )}
              </div>

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

              {statusCriando && (
                <div className="cfg-status-novo-form">
                  <div className="cfg-status-edit-fields">
                    <input
                      type="text"
                      className="cfg-input cfg-input--grow"
                      placeholder="Nome do novo status (ex.: Aguardando Aprovação)"
                      value={statusNovoLabel}
                      onChange={e => setStatusNovoLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') adicionarStatus() }}
                      autoFocus
                    />
                    <div className="cfg-status-color-picker">
                      <span className="cfg-status-color-label">Cor</span>
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
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="cfg-btn-secundario cfg-btn-secundario--xs"
                      onClick={() => { setStatusCriando(false); setStatusNovoLabel(''); setStatusNovoCor('#818cf8') }}
                    >
                      Cancelar
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
                  <h2 className="cfg-secao__titulo">Notificações</h2>
                  <p className="cfg-secao__desc">Escolha quais eventos geram alertas para você</p>
                </div>
              </div>

              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="nf-atrasado"
                  label="Pedido atrasado"
                  desc="Alerta quando um pedido passa da data estimada"
                  checked={notifConfig.pedidoAtrasado}
                  onChange={v => setNotifConfig(prev => ({ ...prev, pedidoAtrasado: v }))}
                />
                <ToggleRow
                  id="nf-novo"
                  label="Novo pedido criado"
                  desc="Notificação ao criar ou receber um novo pedido"
                  checked={notifConfig.novoPedido}
                  onChange={v => setNotifConfig(prev => ({ ...prev, novoPedido: v }))}
                />
                <ToggleRow
                  id="nf-transferencia"
                  label="Item transferido"
                  desc="Quando quantidade de um item é transferida para outro pedido"
                  checked={notifConfig.itemTransferido}
                  onChange={v => setNotifConfig(prev => ({ ...prev, itemTransferido: v }))}
                />
                <ToggleRow
                  id="nf-excluido"
                  label="Pedido excluído"
                  desc="Confirmação quando um pedido é removido"
                  checked={notifConfig.pedidoExcluido}
                  onChange={v => setNotifConfig(prev => ({ ...prev, pedidoExcluido: v }))}
                />
                <ToggleRow
                  id="nf-importacao"
                  label="Importação concluída"
                  desc="Aviso ao finalizar importação em lote"
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
                  <h2 className="cfg-secao__titulo">Exportação</h2>
                  <p className="cfg-secao__desc">Preferências padrão ao exportar pedidos</p>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">Formato padrão</p>
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
                  label="Incluir colunas do usuário"
                  desc="Adiciona colunas customizadas criadas por você"
                  checked={exportConfig.incluirColunasUsuario}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, incluirColunasUsuario: v }))}
                />
                <ToggleRow
                  id="exp-itens"
                  label="Incluir itens do pedido"
                  desc="Exporta também as linhas de item de cada pedido"
                  checked={exportConfig.incluirItens}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, incluirItens: v }))}
                />
                <ToggleRow
                  id="exp-apenas-sel"
                  label="Incluir apenas pedidos selecionados"
                  desc="Quando desmarcado, exporta todos os pedidos do filtro atual"
                  checked={exportConfig.apenasSelection}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, apenasSelection: v }))}
                />
                <ToggleRow
                  id="exp-cabecalho"
                  label="Incluir cabeçalho"
                  desc="Adiciona linha de cabeçalho com os nomes das colunas"
                  checked={exportConfig.incluirCabecalho}
                  onChange={v => atualizarExportConfig(prev => ({ ...prev, incluirCabecalho: v }))}
                />
              </div>

              <div className="cfg-campo-grupo" style={{ marginTop: '1.25rem' }}>
                <p className="cfg-campo-grupo__label">Separador CSV</p>
                <div className="cfg-periodo-pills">
                  {([
                    { id: 'virgula',       label: 'Vírgula'       },
                    { id: 'ponto-virgula', label: 'Ponto-e-vírgula' },
                    { id: 'tab',           label: 'Tab'           },
                  ] as const).map(sep => (
                    <button
                      key={sep.id}
                      type="button"
                      className={`cfg-periodo-pill${exportConfig.separadorCsv === sep.id ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => atualizarExportConfig(prev => ({ ...prev, separadorCsv: sep.id }))}
                    >
                      {sep.label}
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
                  <h2 className="cfg-secao__titulo">Numeração automática</h2>
                  <p className="cfg-secao__desc">Define o formato e as regras do número de pedido gerado automaticamente</p>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">Formato do número</p>
                <div className="cfg-num-formato">
                  <div className="cfg-num-campo">
                    <label className="cfg-num-campo__label" htmlFor="num-prefixo">Prefixo</label>
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
                    <label className="cfg-num-campo__label" htmlFor="num-digitos">Dígitos da sequência</label>
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
                    <span className="cfg-num-preview__label">Preview</span>
                    <span className="cfg-num-preview__valor">{previewNumeracao}</span>
                  </div>
                </div>
              </div>

              <div className="cfg-campo-grupo">
                <ToggleRow
                  id="num-ano"
                  label="Incluir ano no número"
                  desc={`Ex.: ${numConfig.prefixo}${new Date().getFullYear()}/0001`}
                  checked={numConfig.incluirAno}
                  onChange={v => setNumConfig(prev => ({ ...prev, incluirAno: v }))}
                />
              </div>

              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">Reiniciar numeração</p>
                <div className="cfg-periodo-pills">
                  {([
                    { id: 'nunca', label: 'Nunca'     },
                    { id: 'ano',   label: 'Todo ano'  },
                    { id: 'mes',   label: 'Todo mês'  },
                  ] as const).map(op => (
                    <button
                      key={op.id}
                      type="button"
                      className={`cfg-periodo-pill${numConfig.reiniciar === op.id ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setNumConfig(prev => ({ ...prev, reiniciar: op.id }))}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cfg-toggles-lista" style={{ marginTop: '0.5rem' }}>
                <ToggleRow
                  id="num-criar"
                  label="Número automático ao criar pedido"
                  checked={numConfig.automaticoCriar}
                  onChange={v => setNumConfig(prev => ({ ...prev, automaticoCriar: v }))}
                />
                <ToggleRow
                  id="num-duplicar"
                  label="Número automático ao duplicar pedido"
                  checked={numConfig.automaticoDuplicar}
                  onChange={v => setNumConfig(prev => ({ ...prev, automaticoDuplicar: v }))}
                />
                <ToggleRow
                  id="num-consolidar"
                  label="Número automático ao consolidar pedido"
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
                  <h2 className="cfg-secao__titulo">Templates PDF</h2>
                  <p className="cfg-secao__desc">
                    Gerencie templates Handlebars usados para geração de PDFs.
                    Variáveis: <code className="cfg-code">{'{{numero_pedido}}'}</code>,{' '}
                    <code className="cfg-code">{'{{exportador}}'}</code>,{' '}
                    <code className="cfg-code">{'{{itens}}'}</code>
                  </p>
                </div>
                {!templateCriandoNovo && !templateEditando && (
                  <button type="button" className="cfg-add-row-btn" onClick={iniciarNovoTemplate}>
                    <Plus size={13} weight="bold" />
                    Novo Template
                  </button>
                )}
              </div>

              {templateLoading && (
                <p className="cfg-empty">Carregando templates…</p>
              )}

              {!templateLoading && (
                <>
                  {/* ── Formulário inline ── */}
                  {(templateCriandoNovo || templateEditando) && (
                    <div className="cfg-tpl-form">
                      <div className="cfg-tpl-form__fields">
                        <div className="cfg-tpl-form__field">
                          <label className="cfg-num-campo__label" htmlFor="tpl-nome">Nome</label>
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
                          <label className="cfg-num-campo__label">Variáveis disponíveis — clique para inserir no cursor</label>
                          <div className="cfg-tpl-variaveis">
                            {[
                              { grupo: 'Pedido',      vars: ['{{numero_pedido}}','{{tipo_operacao}}','{{status}}','{{incoterm}}','{{moeda_pedido}}','{{numero_proforma}}','{{numero_invoice}}','{{referencia_importador}}','{{referencia_exportador}}','{{condicao_pagamento_pedido}}'] },
                              { grupo: 'Parceiros',   vars: ['{{exportador}}','{{fabricante}}','{{importador}}'] },
                              { grupo: 'Financeiro',  vars: ['{{valor_total_pedido}}','{{peso_liquido_total}}','{{peso_bruto_total}}','{{cubagem_total}}'] },
                              { grupo: 'Datas',       vars: ['{{data_emissao_pedido}}','{{data_embarque}}','{{data_prevista_pedido_pronto}}'] },
                              { grupo: 'Itens (loop)',vars: ['{{#each itens}}','{{part_number}}','{{ncm}}','{{descricao_item}}','{{quantidade_inicial_item_pedido}}','{{saldo_item_pedido}}','{{unidade}}','{{valor_unitario_item}}','{{valor_total_itens}}','{{/each}}'] },
                            ].map(({ grupo, vars }) => (
                              <div key={grupo} className="cfg-tpl-variaveis__grupo">
                                <span className="cfg-tpl-variaveis__grupo-label">{grupo}</span>
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
                          <label className="cfg-num-campo__label" htmlFor="tpl-conteudo">Conteúdo HTML / Handlebars</label>
                          <textarea
                            id="tpl-conteudo"
                            ref={templateTextareaRef}
                            className="cfg-textarea cfg-textarea--codigo"
                            rows={10}
                            placeholder={'<h1>{{numero_pedido}}</h1>\n<p>Exportador: {{exportador}}</p>\n{{#each itens}}\n  <p>{{part_number}} — {{quantidade_inicial_item_pedido}} {{unidade}}</p>\n{{/each}}'}
                            value={templateConteudo}
                            onChange={e => setTemplateConteudo(e.target.value)}
                            spellCheck={false}
                          />
                        </div>
                      </div>
                      <div className="cfg-tpl-form__actions">
                        <button type="button" className="cfg-btn-primario" onClick={salvarTemplate}>
                          <FloppyDisk size={14} weight="bold" />
                          Salvar
                        </button>
                        <button type="button" className="cfg-btn-secundario" onClick={cancelarEdicaoTemplate}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Lista de templates ── */}
                  {templates.length === 0 && !templateCriandoNovo ? (
                    <p className="cfg-empty">Nenhum template criado. Clique em "Novo Template" para começar.</p>
                  ) : (
                    <div className="cfg-lista-simples">
                      {templates.map(tpl => (
                        <div key={tpl.id} className={`cfg-lista-simples__row${templateEditando === tpl.id ? ' cfg-lista-simples__row--editando' : ''}`}>
                          <div className="cfg-lista-simples__info">
                            <span className="cfg-lista-simples__nome">{tpl.nome}</span>
                            <span className="cfg-lista-simples__meta">
                              Criado {new Date(tpl.criadoEm).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="cfg-lista-simples__acoes">
                            <TooltipGlobal descricao="Editar template">
                              <button
                                type="button"
                                className="cfg-eye-btn"
                                onClick={() => iniciarEdicaoTemplate(tpl)}
                                aria-label="Editar template"
                              >
                                <PencilSimple size={14} weight="bold" />
                              </button>
                            </TooltipGlobal>
                            <TooltipGlobal descricao="Excluir template">
                              <button
                                type="button"
                                className="cfg-remove-btn"
                                onClick={() => excluirTemplate(tpl.id)}
                                aria-label="Excluir template"
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
                  <h2 className="cfg-secao__titulo">Duplicar pedido</h2>
                  <p className="cfg-secao__desc">Comportamento ao duplicar um pedido existente</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="dup-datas"
                  label="Copiar datas do pedido original"
                  checked={regrasConfig.duplicar.copiarDatas}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, copiarDatas: v } }))}
                />
                <ToggleRow
                  id="dup-numero"
                  label="Numeração automática ao duplicar"
                  checked={regrasConfig.duplicar.numeracaoAutomatica}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, numeracaoAutomatica: v } }))}
                />
                <ToggleRow
                  id="dup-itens"
                  label="Duplicar também os itens"
                  desc="Copia todos os itens do pedido original para o novo"
                  checked={regrasConfig.duplicar.duplicarItens}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, duplicarItens: v } }))}
                />
              </div>
              <div className="cfg-campo-grupo" style={{ marginTop: '1rem' }}>
                <p className="cfg-campo-grupo__label">Status inicial do pedido duplicado</p>
                <div className="cfg-periodo-pills">
                  {([
                    { id: 'rascunho',     label: 'Rascunho'     },
                    { id: 'aberto',       label: 'Aberto'       },
                    { id: 'em_andamento', label: 'Em Andamento' },
                  ] as const).map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`cfg-periodo-pill${regrasConfig.duplicar.statusInicial === s.id ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setRegrasConfig(prev => ({ ...prev, duplicar: { ...prev.duplicar, statusInicial: s.id } }))}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Duplicar item */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Duplicar item</h2>
                  <p className="cfg-secao__desc">Comportamento ao duplicar um item existente</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="dup-item-numero"
                  label="Numeração automática ao duplicar"
                  checked={regrasConfig.duplicarItem.numeracaoAutomatica}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicarItem: { ...prev.duplicarItem, numeracaoAutomatica: v } }))}
                />
                <ToggleRow
                  id="dup-item-datas"
                  label="Copiar datas do item original"
                  checked={regrasConfig.duplicarItem.copiarDatas}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicarItem: { ...prev.duplicarItem, copiarDatas: v } }))}
                />
                <ToggleRow
                  id="dup-item-dados"
                  label="Copiar dados do item original"
                  desc="Copia todos os campos preenchidos do item original para o novo"
                  checked={regrasConfig.duplicarItem.copiarDados}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, duplicarItem: { ...prev.duplicarItem, copiarDados: v } }))}
                />
              </div>
            </section>

            {/* Excluir */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Excluir pedido</h2>
                  <p className="cfg-secao__desc">Permissões e comportamentos ao excluir pedidos</p>
                </div>
              </div>
              <div className="cfg-campo-grupo">
                <p className="cfg-campo-grupo__label">Status que permitem exclusão</p>
                <div className="cfg-check-lista">
                  {statusList.map(s => (
                    <label key={s.id} className="cfg-check-item">
                      <input
                        type="checkbox"
                        className="cfg-check-item__input"
                        checked={regrasConfig.excluir.statusPermitidos.includes(s.id)}
                        onChange={() => toggleStatusExcluir(s.id)}
                      />
                      <span className="cfg-check-item__label">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="exc-sem-itens"
                  label="Pedido pode ficar sem itens"
                  desc="Se desmarcado, excluir o último item exclui o pedido automaticamente"
                  checked={regrasConfig.excluir.semItensPermitido}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, excluir: { ...prev.excluir, semItensPermitido: v } }))}
                />
                <ToggleRow
                  id="exc-preview"
                  label="Solicitar confirmação com preview antes de excluir"
                  checked={regrasConfig.excluir.confirmarComPreview}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, excluir: { ...prev.excluir, confirmarComPreview: v } }))}
                />
              </div>
            </section>

            {/* Transferir */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Transferir itens</h2>
                  <p className="cfg-secao__desc">Comportamento ao transferir quantidades entre pedidos</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="tra-encerrar"
                  label="Encerrar item de origem quando quantidade chega a zero"
                  checked={regrasConfig.transferir.encerrarOrigemZero}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, encerrarOrigemZero: v } }))}
                />
                <ToggleRow
                  id="tra-excluir-item"
                  label="Excluir item de origem quando quantidade chega a zero"
                  checked={regrasConfig.transferir.excluirItemOrigemZero}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, excluirItemOrigemZero: v } }))}
                />
                <ToggleRow
                  id="tra-excluir-pedido"
                  label="Excluir pedido de origem quando todos os itens chegam a zero"
                  checked={regrasConfig.transferir.excluirPedidoOrigemZero}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, excluirPedidoOrigemZero: v } }))}
                />
                <ToggleRow
                  id="tra-bloquear-acima-inicial"
                  label="Não permitir transferir quantidade maior que a quantidade inicial"
                  desc="Quando ativo, bloqueia a transferência se o total transferido ultrapassar a quantidade inicial do pedido. Quando inativo, a coluna 'QTD. Transferida do Pedido' é destacada em vermelho para pedidos que ultrapassaram o limite."
                  checked={regrasConfig.transferir.bloquearTransferenciaAcimaInicial}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, transferir: { ...prev.transferir, bloquearTransferenciaAcimaInicial: v } }))}
                />
              </div>
            </section>

            {/* Consolidar */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Consolidar pedidos</h2>
                  <p className="cfg-secao__desc">Regras para fusão de múltiplos pedidos em um único</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="con-avisos"
                  label="Avisar sobre campos divergentes antes de consolidar"
                  checked={regrasConfig.consolidar.avisosDivergentes}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, avisosDivergentes: v } }))}
                />
                <ToggleRow
                  id="con-fundir"
                  label="Fundir itens com mesmo part_number automaticamente"
                  desc="Soma quantidades de itens com o mesmo código de produto"
                  checked={regrasConfig.consolidar.fundirPartNumber}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, fundirPartNumber: v } }))}
                />
                <ToggleRow
                  id="con-usuario"
                  label="Usuário escolhe valores divergentes campo a campo"
                  desc="Exibe seletor para cada campo com valores diferentes entre os pedidos"
                  checked={regrasConfig.consolidar.usuarioEscolheDivergentes}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, usuarioEscolheDivergentes: v } }))}
                />
              </div>
              <div className="cfg-campo-grupo" style={{ marginTop: '1rem' }}>
                <p className="cfg-campo-grupo__label">Pedido resultante usa número</p>
                <div className="cfg-periodo-pills">
                  {([
                    { id: 'mais_antigo',  label: 'Do pedido mais antigo'  },
                    { id: 'automatico',   label: 'Numeração automática'   },
                    { id: 'mais_recente', label: 'Do pedido mais recente' },
                  ] as const).map(op => (
                    <button
                      key={op.id}
                      type="button"
                      className={`cfg-periodo-pill${regrasConfig.consolidar.numeroPedidoResultante === op.id ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => setRegrasConfig(prev => ({ ...prev, consolidar: { ...prev.consolidar, numeroPedidoResultante: op.id } }))}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Alertas ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Alertas</h2>
                  <p className="cfg-secao__desc">Avisos visuais exibidos diretamente na tabela de pedidos</p>
                </div>
              </div>
              <div className="cfg-toggles-lista">
                <ToggleRow
                  id="alerta-numero-duplicado"
                  label="Mesmo número de pedido"
                  desc="Exibe ícone de aviso na célula quando dois ou mais pedidos têm o mesmo número"
                  checked={regrasConfig.alertas.numeroDuplicado}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, numeroDuplicado: v } }))}
                />
                <ToggleRow
                  id="alerta-valor-total-divergente"
                  label="Valor total divergente dos itens"
                  desc="Exibe ícone de aviso quando valor_total_pedido difere da soma dos valores dos itens"
                  checked={regrasConfig.alertas.valorTotalDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, valorTotalDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-quantidade-total-divergente"
                  label="Quantidade total divergente dos itens"
                  desc="Exibe ícone de aviso quando a quantidade total do pedido difere da soma das quantidades dos itens"
                  checked={regrasConfig.alertas.quantidadeTotalDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, quantidadeTotalDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-quantidade-pronta-divergente"
                  label="Quantidade pronta divergente dos itens"
                  desc="Exibe ícone de aviso quando a quantidade pronta do pedido difere da soma das quantidades prontas dos itens"
                  checked={regrasConfig.alertas.quantidadeProntaDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, quantidadeProntaDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-peso-liquido-divergente"
                  label="Peso líquido total divergente dos itens"
                  desc="Exibe ícone de aviso quando o peso líquido total difere da soma dos pesos líquidos unitários × quantidade dos itens"
                  checked={regrasConfig.alertas.pesoLiquidoDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, pesoLiquidoDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-peso-bruto-divergente"
                  label="Peso bruto total divergente dos itens"
                  desc="Exibe ícone de aviso quando o peso bruto total difere da soma dos pesos brutos unitários × quantidade dos itens"
                  checked={regrasConfig.alertas.pesoBrutoDivergente}
                  onChange={v => setRegrasConfig(prev => ({ ...prev, alertas: { ...prev.alertas, pesoBrutoDivergente: v } }))}
                />
                <ToggleRow
                  id="alerta-cubagem-divergente"
                  label="Cubagem total divergente dos itens"
                  desc="Exibe ícone de aviso quando a cubagem total difere da soma das cubagens unitárias × quantidade dos itens"
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
                {regrasAlterados ? 'Salvar alterações' : 'Salvo'}
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
                  <h2 className="cfg-secao__titulo">Categorias de Anexos</h2>
                  <p className="cfg-secao__desc">
                    Organize os documentos anexados aos pedidos por categoria
                  </p>
                </div>
                {!categCriando && (
                  <button
                    type="button"
                    className="cfg-add-row-btn"
                    onClick={() => setCategCriando(true)}
                  >
                    <Plus size={13} weight="bold" />
                    Nova Categoria
                  </button>
                )}
              </div>

              {/* Formulário de nova categoria */}
              {categCriando && (
                <div className="cfg-tpl-form cfg-tpl-form--inline">
                  <input
                    type="text"
                    className="cfg-input cfg-input--grow"
                    placeholder="Nome da categoria (ex.: Certificado de Origem)"
                    value={categNovaNome}
                    onChange={e => setCategNovaNome(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') adicionarCateg() }}
                    autoFocus
                  />
                  <button type="button" className="cfg-btn-primario" onClick={adicionarCateg}>
                    <FloppyDisk size={14} weight="bold" />
                    Salvar
                  </button>
                  <button type="button" className="cfg-btn-secundario" onClick={() => { setCategCriando(false); setCategNovaNome('') }}>
                    Cancelar
                  </button>
                </div>
              )}

              {categAnexos.length === 0 ? (
                <p className="cfg-empty">Nenhuma categoria criada.</p>
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
                          <span className="cfg-badge-sistema">sistema</span>
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
                              <TooltipGlobal descricao="Renomear categoria">
                                <button
                                  type="button"
                                  className="cfg-eye-btn"
                                  onClick={() => iniciarEdicaoCateg(cat)}
                                  aria-label="Renomear categoria"
                                >
                                  <PencilSimple size={14} weight="bold" />
                                </button>
                              </TooltipGlobal>
                            )}
                            {!cat.sistema && (
                              <TooltipGlobal descricao="Excluir categoria">
                                <button
                                  type="button"
                                  className="cfg-remove-btn"
                                  onClick={() => excluirCateg(cat.id)}
                                  aria-label="Excluir categoria"
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
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Casas Decimais por Coluna</h2>
                  <p className="cfg-secao__desc">
                    Define quantas casas decimais são exibidas em colunas numéricas. Padrão: 2
                  </p>
                </div>
              </div>
              <div className="cfg-colunas-lista">
                {(['Pedido', 'Item'] as const).map(cat => (
                  <React.Fragment key={cat}>
                    <p className="cfg-colunas-categoria">{cat}</p>
                    {COLUNAS_NUMERICAS.filter(c => c.categoria === cat).map(col => (
                      <div key={col.campo} className="cfg-coluna-row">
                        <span className="cfg-coluna-row__label">{col.label}</span>
                        <input
                          type="number"
                          min={0}
                          max={8}
                          className="cfg-casas-input"
                          value={casasDecimais[col.campo] ?? col.padrao}
                          onChange={e => handleCasasDecimaisChange(col.campo, Math.min(8, Math.max(0, Number(e.target.value))))}
                          aria-label={`Casas decimais para ${col.label}`}
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
                {colunasUsuarioApi_.filter(col => col.tipo === 'numero' || col.tipo === 'percentual').length > 0 && (
                  <React.Fragment>
                    <p className="cfg-colunas-categoria">Personalizadas</p>
                    {colunasUsuarioApi_
                      .filter(col => col.tipo === 'numero' || col.tipo === 'percentual')
                      .map(col => (
                        <div key={col.id} className="cfg-coluna-row">
                          <span className="cfg-coluna-row__label">{col.nome}</span>
                          <input
                            type="number"
                            min={0}
                            max={8}
                            className="cfg-casas-input"
                            value={casasDecimais[col.id] ?? 2}
                            onChange={e => handleCasasDecimaisChange(col.id, Math.min(8, Math.max(0, Number(e.target.value))))}
                            aria-label={`Casas decimais para ${col.nome}`}
                          />
                        </div>
                      ))
                    }
                  </React.Fragment>
                )}
              </div>
            </section>

            {/* ── Criar Coluna Personalizada ── */}
            <section className="cfg-secao" ref={novaColunaSectionRef}>
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                  <p className="cfg-secao__desc">
                    Adicione campos extras à tabela de pedidos. As colunas criadas ficam disponíveis para todos os usuários.
                  </p>
                </div>
              </div>

              {/* Formulário */}
              <div className="cfg-nova-coluna-form">

                {/* Nome */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label" htmlFor="nova-coluna-nome">Nome <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
                  <input
                    id="nova-coluna-nome"
                    ref={novaColunaInputRef}
                    type="text"
                    className="cfg-form-input"
                    placeholder="Ex: Código ERP, Margem %, Prioridade"
                    value={novaColuna.nome}
                    onChange={e => setNovaColuna(prev => ({ ...prev, nome: e.target.value }))}
                    maxLength={50}
                  />
                </div>

                {/* Tipo */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label">Tipo <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
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
                        <span className="cfg-tipo-btn__label">{tipo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expressão (formula) */}
                {novaColuna.tipo === 'formula' && (
                  <div className="cfg-form-group">
                    <label className="cfg-form-label">
                      Expressão <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span>
                    </label>

                    {/* Campos disponíveis agrupados */}
                    <div className="cfg-formula-campos">
                      {CAMPOS_FORMULA.map(grupo => (
                        <div key={grupo.grupo} className="cfg-formula-grupo">
                          <span className="cfg-formula-grupo-nome">{grupo.grupo}</span>
                          <div className="cfg-formula-chips">
                            {grupo.campos.map(c => (
                              <button
                                key={c.chave}
                                type="button"
                                className="cfg-formula-chip"
                                title={c.chave}
                                onClick={() => inserirCampoFormula(c.chave)}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <textarea
                      ref={formulaTextareaRef}
                      className={[
                        'cfg-form-input',
                        formulaErro   ? 'cfg-formula-input--erro'  : '',
                        formulaValida && novaColuna.formula_expressao.trim() ? 'cfg-formula-input--ok' : '',
                      ].filter(Boolean).join(' ')}
                      rows={3}
                      placeholder="Ex: quantidade_total_inicial_pedido - quantidade_transferida_total"
                      style={{ fontFamily: 'monospace', resize: 'vertical', marginTop: 8 }}
                      value={novaColuna.formula_expressao}
                      onChange={e => handleFormulaChange(e.target.value)}
                      aria-describedby={formulaErro ? 'cfg-formula-msg' : undefined}
                    />

                    {/* Card Gabi — regra: vazio → intro; com conteúdo → resultado da análise */}
                    {(() => {
                      const vazio = !novaColuna.formula_expressao.trim()

                      // Vazio: instrução inicial
                      if (vazio) return (
                        <div className="cfg-gabi-card cfg-gabi-card--info" role="note">
                          <div className="cfg-gabi-card__header">
                            <span className="cfg-gabi-card__ico">✦</span>
                            <span className="cfg-gabi-card__titulo">Gabi · Como montar sua fórmula</span>
                          </div>
                          <p className="cfg-gabi-card__texto">
                            Clique em um campo acima para inseri-lo, ou digite diretamente.
                            Use <code>+  −  *  /</code> entre campos numéricos.
                            Para divisão segura: <code>SE(denominador == 0, 0, numerador / denominador)</code>.
                            Campos texto, data ou checkbox valem 0 em aritmética.
                          </p>
                        </div>
                      )

                      // Durante debounce (estados limpos, campo não vazio) — sem card
                      if (!formulaErro && !formulaGabi && !formulaValida) return null

                      // Resultado da análise
                      const variante = formulaErro ? 'erro' : formulaGabi ? 'aviso' : 'ok'
                      const titulo   = formulaErro ? 'Erro na expressão'
                                     : formulaGabi ? formulaGabi.titulo
                                     : 'Fórmula válida ✓'
                      const texto    = formulaErro ?? formulaGabi?.texto ?? 'Tudo certo! Preencha os campos restantes e clique em Salvar.'
                      const sugestao = formulaGabi?.sugestao

                      return (
                        <div className={`cfg-gabi-card cfg-gabi-card--${variante}`} role="note" aria-live="polite">
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
                                onClick={() => handleFormulaChange(sugestao!)}
                                title="Usar esta sugestão"
                              >
                                Usar
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                      Operadores: <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '0 4px' }}>+ - * / ( )</code>
                      &nbsp;·&nbsp; Funções:
                      <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '0 4px', marginLeft: 4 }}>SE(cond, sim, não)</code>
                      <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '0 4px', marginLeft: 4 }}>SOMA_ITENS(campo)</code>
                    </p>
                  </div>
                )}

                {/* Opções (select / tipo_documento) */}
                {(novaColuna.tipo === 'select' || novaColuna.tipo === 'tipo_documento') && (
                  <div className="cfg-form-group">
                    <label className="cfg-form-label">Opções da lista <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
                    <div className="cfg-opcoes-add-row">
                      <input
                        type="text"
                        className="cfg-form-input"
                        placeholder="Digite e pressione Enter ou clique em +"
                        value={novaOpcao}
                        onChange={e => setNovaOpcao(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionarOpcao() } }}
                      />
                      <button
                        type="button"
                        className="cfg-add-btn"
                        onClick={handleAdicionarOpcao}
                        aria-label="Adicionar opção"
                      >
                        <Plus size={13} weight="bold" />
                      </button>
                    </div>
                    {novaColuna.opcoes.length > 0 && (
                      <div className="cfg-opcoes-lista">
                        {novaColuna.opcoes.map(op => (
                          <span key={op} className="cfg-opcao-chip">
                            {op}
                            <button
                              type="button"
                              className="cfg-opcao-chip__remove"
                              onClick={() => handleRemoverOpcao(op)}
                              aria-label={`Remover opção ${op}`}
                            >
                              <X size={10} weight="bold" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Escopo */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label">Escopo <span style={{ color: 'var(--color-danger, #f87171)' }}>*</span></label>
                  <div className="cfg-escopo-row">
                    {(['pedido', 'item', 'ambos'] as EscopoColunaUsuario[]).map(esc => {
                      const bloqueado = esc === 'item' || esc === 'ambos'
                      const radio = (
                        <label
                          key={esc}
                          className={`cfg-escopo-option${bloqueado ? ' cfg-escopo-option--disabled' : ''}`}
                          aria-disabled={bloqueado ? 'true' : undefined}
                        >
                          <input
                            type="radio"
                            name="escopo"
                            value={esc}
                            checked={novaColuna.escopo === esc}
                            onChange={() => !bloqueado && setNovaColuna(prev => ({ ...prev, escopo: esc }))}
                            disabled={bloqueado}
                          />
                          <span>{esc.charAt(0).toUpperCase() + esc.slice(1)}</span>
                        </label>
                      )
                      return bloqueado ? (
                        <TooltipGlobal key={esc} descricao="Em breve — colunas de item serão exibidas nas linhas expandidas">
                          {radio}
                        </TooltipGlobal>
                      ) : radio
                    })}
                  </div>
                </div>

                {/* Visibilidade */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label" htmlFor="nova-coluna-visibilidade">Visibilidade</label>
                  <select
                    id="nova-coluna-visibilidade"
                    className="cfg-form-input"
                    value={novaColuna.visibilidade}
                    onChange={e => setNovaColuna(prev => ({ ...prev, visibilidade: e.target.value as VisibilidadeColunaUsuario }))}
                  >
                    {VISIBILIDADE_OPCOES.map(o => (
                      <option key={o.valor} value={o.valor}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Obrigatório — não exibido para tipo 'anexo' */}
                {novaColuna.tipo !== 'anexo' && (
                  <div className="cfg-form-group">
                    <label className="cfg-toggle-row__label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={novaColuna.obrigatorio}
                        onChange={e => setNovaColuna(prev => ({ ...prev, obrigatorio: e.target.checked }))}
                        className="cfg-toggle__input"
                      />
                      <span>Obrigatório</span>
                    </label>
                  </div>
                )}

                {/* Valor padrão — não exibido para tipo 'anexo' */}
                {novaColuna.tipo !== 'anexo' && (
                  <div className="cfg-form-group">
                    <label className="cfg-form-label" htmlFor="nova-coluna-padrao">Valor padrão</label>
                    <input
                      id="nova-coluna-padrao"
                      type="text"
                      className="cfg-form-input"
                      placeholder="Deixe em branco para não definir"
                      value={novaColuna.valor_padrao}
                      onChange={e => setNovaColuna(prev => ({ ...prev, valor_padrao: e.target.value }))}
                      maxLength={1000}
                    />
                  </div>
                )}

                {/* Descrição */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label" htmlFor="nova-coluna-desc">Descrição</label>
                  <input
                    id="nova-coluna-desc"
                    type="text"
                    className="cfg-form-input"
                    placeholder="Descrição auxiliar exibida como tooltip"
                    value={novaColuna.descricao}
                    onChange={e => setNovaColuna(prev => ({ ...prev, descricao: e.target.value }))}
                    maxLength={200}
                  />
                </div>

                {erroColuna && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger, #f87171)', margin: 0 }} role="alert">{erroColuna}</p>
                )}

                <button
                  type="button"
                  className="cfg-criar-coluna-btn"
                  onClick={handleCriarColuna}
                  disabled={!novaColuna.nome.trim() || salvandoColuna}
                >
                  <Plus size={14} weight="bold" />
                  {salvandoColuna ? 'Criando...' : 'Criar Coluna'}
                </button>
              </div>

              {/* Lista de colunas criadas */}
              {colunasUsuarioApi_.length > 0 && (
                <div className="cfg-colunas-criadas">
                  <p className="cfg-colunas-criadas__titulo">Colunas criadas ({colunasUsuarioApi_.length})</p>
                  <div className="cfg-cards-lista">
                    {colunasUsuarioApi_.map(col => {
                      const tipoInfo = TIPOS_COLUNA.find(t => t.id === col.tipo)
                      return (
                        <div key={col.id} className="cfg-card-row">
                          <span className="cfg-coluna-tipo-icone">{tipoInfo?.icone}</span>
                          <div className="cfg-card-row__info">
                            <div>
                              <p className="cfg-card-row__nome">{col.nome}</p>
                              <p className="cfg-card-row__desc">
                                {tipoInfo?.label} · {col.escopo} · {col.visibilidade}
                                {col.obrigatorio && ' · Obrigatório'}
                                {(col.tipo === 'select' || col.tipo === 'tipo_documento') && col.opcoes && ` · ${col.opcoes.length} opções`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => handleRemoverColuna(col.id)}
                            aria-label={`Remover coluna ${col.nome}`}
                          >
                            <X size={13} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* ── Campos Calculados ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Campos Calculados</h2>
                  <p className="cfg-secao__desc">
                    Campos gerados automaticamente com base em fórmulas. A fórmula pode ser personalizada por workspace.
                  </p>
                </div>
              </div>

              {/* ── Saldo do Pedido ── */}
              <div className="cfg-nova-coluna-form" style={{ marginTop: 0 }}>

                {/* Cabeçalho do campo nativo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MathOperations size={15} weight="duotone" style={{ color: 'var(--ws-accent)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)' }}>Saldo do Pedido</span>
                    <span style={{
                      fontSize: '0.7rem', padding: '1px 6px', borderRadius: 999,
                      background: 'rgba(129,140,248,0.12)', color: 'var(--ws-accent)',
                      border: '1px solid rgba(129,140,248,0.25)',
                    }}>campo nativo</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {saldoFormulaAlterada && (
                      <button
                        type="button"
                        className="cfg-add-row-btn"
                        onClick={restaurarSaldoPadrao}
                        style={{ fontSize: '0.78rem' }}
                      >
                        Restaurar Padrão
                      </button>
                    )}
                    <button
                      type="button"
                      className="cfg-add-row-btn"
                      onClick={salvarSaldoFormula}
                      disabled={!saldoFormulaAlterada || !!saldoFormulaErro}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Salvar
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--ws-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  O nome <strong style={{ color: 'var(--ws-text)' }}>Saldo do Pedido</strong> é fixo. Apenas a fórmula de cálculo pode ser personalizada.
                  O resultado é exibido como coluna na tabela e nos cards.
                </p>

                {/* Chips de campos disponíveis */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label">Campos disponíveis — clique para adicionar</label>
                  {CAMPOS_SALDO.map(grupo => (
                    <div key={grupo.grupo} className="cfg-formula-grupo">
                      <span className="cfg-formula-grupo-nome">{grupo.grupo}</span>
                      <div className="cfg-formula-chips">
                        {grupo.campos.map(campo => (
                          <button
                            key={campo.chave}
                            type="button"
                            className="cfg-formula-chip"
                            title={campo.chave}
                            onClick={() => adicionarCampoSaldo(campo)}
                          >
                            {campo.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Editor tokenizado */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label">Fórmula</label>

                  {/* Display de tokens */}
                  <div className={[
                    'cfg-saldo-tokens',
                    saldoFormulaErro ? 'cfg-saldo-tokens--erro' : '',
                    saldoFormulaValida && saldoTokens.length > 0 ? 'cfg-saldo-tokens--ok' : '',
                  ].filter(Boolean).join(' ')}>
                    {saldoTokens.length === 0 ? (
                      <span className="cfg-saldo-tokens__placeholder">
                        Clique nos campos acima e nos operadores abaixo para montar a fórmula
                      </span>
                    ) : (
                      saldoTokens.map((token, i) =>
                        token.tipo === 'campo' ? (
                          <span key={i} className="cfg-saldo-token cfg-saldo-token--campo">
                            <span className="cfg-saldo-token__label">{token.label}</span>
                            <button
                              type="button"
                              className="cfg-saldo-token__remove"
                              onClick={() => removerTokenSaldo(i)}
                              aria-label={`Remover ${token.label}`}
                            >
                              <X size={9} weight="bold" />
                            </button>
                          </span>
                        ) : (
                          <button
                            key={i}
                            type="button"
                            className="cfg-saldo-token cfg-saldo-token--op"
                            onClick={() => removerTokenSaldo(i)}
                            title="Clique para remover"
                          >
                            {token.valor}
                          </button>
                        )
                      )
                    )}
                  </div>

                  {/* Botões de operadores */}
                  <div className="cfg-saldo-ops">
                    <span className="cfg-formula-grupo-nome" style={{ alignSelf: 'center' }}>Operadores</span>
                    {(['+', '-', '*', '/', '(', ')'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        className="cfg-saldo-op-btn"
                        onClick={() => adicionarOpSaldo(op)}
                      >
                        {op}
                      </button>
                    ))}
                    {saldoTokens.length > 0 && (
                      <button
                        type="button"
                        className="cfg-saldo-op-btn cfg-saldo-op-btn--clear"
                        onClick={() => setSaldoTokens([])}
                        title="Limpar fórmula"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Gabi — mesmo padrão de Colunas Personalizadas */}
                {(() => {
                  const vazio = saldoTokens.length === 0

                  // Vazio: instrução inicial
                  if (vazio) return (
                    <div className="cfg-gabi-card cfg-gabi-card--info" role="note">
                      <div className="cfg-gabi-card__header">
                        <span className="cfg-gabi-card__ico">✦</span>
                        <span className="cfg-gabi-card__titulo">Gabi · Como montar sua fórmula</span>
                      </div>
                      <p className="cfg-gabi-card__texto">
                        Clique em um campo acima para inseri-lo, ou digite diretamente.
                        Use <code>+  −  *  /</code> entre campos numéricos.
                        Para divisão segura: <code>SE(denominador == 0, 0, numerador / denominador)</code>.
                      </p>
                    </div>
                  )

                  // Durante debounce
                  if (saldoFormulaAnalisando && !saldoFormulaErro && !saldoFormulaGabi && !saldoFormulaValida) return (
                    <div className="cfg-gabi-card cfg-gabi-card--analisando" role="status" aria-live="polite">
                      <div className="cfg-gabi-card__header">
                        <span className="cfg-gabi-card__ico">✦</span>
                        <span className="cfg-gabi-card__titulo">Gabi · Analisando…</span>
                      </div>
                    </div>
                  )

                  // Sem resultado ainda (debounce pendente pós-reset)
                  if (!saldoFormulaErro && !saldoFormulaGabi && !saldoFormulaValida) return null

                  // Resultado da análise
                  const variante = saldoFormulaErro ? 'erro' : saldoFormulaGabi ? 'aviso' : 'ok'
                  const titulo   = saldoFormulaErro ? 'Erro na expressão'
                                 : saldoFormulaGabi ? saldoFormulaGabi.titulo
                                 : 'Fórmula válida ✓'
                  const texto    = saldoFormulaErro ?? saldoFormulaGabi?.texto ?? 'Tudo certo! Clique em Salvar para aplicar.'
                  const sugestao = saldoFormulaGabi?.sugestao

                  return (
                    <div className={`cfg-gabi-card cfg-gabi-card--${variante}`} role="note" aria-live="polite">
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
                            onClick={() => setSaldoTokens(aliasFormulaParaTokens(sugestao))}
                            title="Usar esta sugestão"
                          >
                            Usar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Aviso sobre novas colunas personalizadas */}
                {colunasUsuarioApi_.some(c => (c.tipo === 'numero' || c.tipo === 'formula') && c.ativo) && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: 6, marginTop: '0.5rem',
                    fontSize: '0.78rem', color: 'rgba(251,191,36,0.9)',
                  }}>
                    <Warning size={13} weight="duotone" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      Colunas personalizadas numéricas aparecem nos chips acima e podem ser incluídas nesta fórmula.
                      Se criar uma nova coluna de quantidade, volte aqui para adicioná-la ao cálculo do saldo.
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {categoria === 'taxa-cambio' && (
          <div className="cfg-cards-wrapper">
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Taxa de Câmbio — PTAX</h2>
                  <p className="cfg-secao__desc">Cotações oficiais do Banco Central do Brasil · usadas para conversão entre moedas nos pedidos</p>
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
                    {sincronizandoTaxa ? 'Sincronizando…' : 'Sincronizar PTAX'}
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
                  Atualização automática em dias úteis:&nbsp;
                  {(['1º Boletim · 10h03', '2º Boletim · 11h03', '3º Boletim · 12h03', 'Fechamento · 13h03'] as const).map((label, i) => {
                    const cor = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24'][i]
                    return (
                      <span key={label} style={{ marginRight: '1.4rem', marginLeft: i === 0 ? '0.5rem' : 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: cor, flexShrink: 0 }} />
                        {label}
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
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>Carregando…</p>
              ) : taxasHoje.length === 0 ? (
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>Nenhuma cotação armazenada. Clique em Sincronizar PTAX.</p>
              ) : (() => {
                const TAXA_COLS = '15px 4.5rem 10rem 9.5rem 8.5rem 8.5rem 8rem 6rem'
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: TAXA_COLS, alignItems: 'center', rowGap: '2px', columnGap: '0' }}>
                    {/* Header — célula vazia para a coluna do ícone */}
                    <span />
                    {['Moeda', 'Nome', 'Boletim', 'Compra (R$)', 'Venda (R$)', 'Data', 'Hora'].map(h => (
                      <span key={h} style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)', padding: '0.35rem 0.5rem', textAlign: 'center' }}>{h}</span>
                    ))}
                    {/* Rows */}
                    {taxasHoje.map(t => (
                      <React.Fragment key={t.id}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
                          <CurrencyCircleDollar size={15} weight="duotone" style={{ color: 'var(--ws-accent)' }} />
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{t.moeda}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', textAlign: 'center' }}>{MOEDAS_INFO[t.moeda] ?? t.moeda}</span>
                        <span style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '0.73rem', fontWeight: 600,
                            background: (BOLETIM_COR[t.boletim] ?? '#94a3b8') + '22',
                            color: BOLETIM_COR[t.boletim] ?? '#94a3b8',
                            border: `1px solid ${(BOLETIM_COR[t.boletim] ?? '#94a3b8')}44`,
                          }}>{t.boletim}</span>
                        </span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtTaxa(t.compra)}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>{fmtTaxa(t.venda)}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', textAlign: 'center' }}>{fmtData(t.data_cotacao)}</span>
                        <span style={{ color: 'var(--ws-muted)', fontSize: '0.8rem', padding: '0.5rem', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>{t.hora_cotacao ?? '—'}</span>
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
                  <h2 className="cfg-secao__titulo">Histórico — últimos 30 dias</h2>
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
                <p style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>Nenhum histórico de {moedaHistoricoTaxa} armazenado.</p>
              ) : (() => {
                const HIST_COLS = '8rem 9.5rem 8.5rem 8.5rem 6rem'
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: HIST_COLS, alignItems: 'center', rowGap: '2px', columnGap: '0' }}>
                    {['Data', 'Boletim', 'Compra (R$)', 'Venda (R$)', 'Hora'].map(h => (
                      <span key={h} style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)', padding: '0.35rem 0.5rem', textAlign: 'center' }}>{h}</span>
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

      </main>

      <SelecaoExcluirGlobal
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

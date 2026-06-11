/**
 * DashboardConstrutorConsulta — UI em 3 passos para criar/editar um widget customizado
 *
 * v2 — 2026-04-03
 * Passo 1: Selecionar campos com badges de tipo e validação de unidade (D3)
 * Passo 2: Operação individual por campo com auto-fill (D2)
 * Passo 3: Tipo de gráfico filtrado por compatibilidade + badge eixo duplo
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChartLine,
  ChartBar,
  ChartBarHorizontal,
  ChartDonut,
  Table,
  NumberSquareOne,
  Funnel,
  Gauge,
  ListBullets,
  SlidersHorizontal,
  Eye,
  MagnifyingGlass,
  X,
  Warning,
  ChartPieSlice,
} from '@phosphor-icons/react'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { buildDefaultPeriodOptions, type PeriodOption } from '../DashboardBarraFerramentas/DashboardBarraFerramentas.js'
import { PeriodoCampoFormulario } from '../periodoCampoFormulario.js'
import type { CatalogField, ChartType, WidgetQuerySpec, FieldQuerySpec, FieldUnitType } from '../tipos.js'
import { unitBadgeLabel } from '../utils/axisUtils.js'
import './dashboard-construtor-consulta.css'

export interface QueryBuilderProps {
  aberto: boolean
  availableFields: CatalogField[]
  onSave: (spec: WidgetQuerySpec, title: string, chartType: ChartType) => void
  onCancel: () => void
  /** Mesmas opções da barra do dashboard (Tudo, 7d, custom, etc.). Padrão: opções núcleo sem Tudo. */
  periodOptions?: PeriodOption[]
  /** Período inicial ao criar widget (ex.: slicer global do painel). */
  periodoInicial?: string
  initialWidget?: {
    id: string
    title: string
    chart_type: ChartType
    query_spec: WidgetQuerySpec
  }
}

// ── Passos ────────────────────────────────────────────────────────────────────

function buildPassos(t: (k: string) => string) {
  return [
    { id: 1, label: t('nucleo.dashboard.construtor.passo_campos'),     icone: <ListBullets size={14} /> },
    { id: 2, label: t('nucleo.dashboard.construtor.passo_operacao'),   icone: <SlidersHorizontal size={14} /> },
    { id: 3, label: t('nucleo.dashboard.construtor.passo_visualizar'), icone: <Eye size={14} /> },
  ]
}

/** Um widget = um campo de métrica por vez */
const MAX_FIELDS = 1

// ── Tipos de gráfico ──────────────────────────────────────────────────────────

interface ChartTypeOption {
  type: ChartType
  label: string
  icon: React.ReactNode
  minFields?: number
  maxFields?: number
  requiresSameUnit?: boolean
}

function buildChartOptions(t: (k: string) => string): ChartTypeOption[] {
  return [
    { type: 'KPI_CARD',       label: t('nucleo.dashboard.chart.kpi'),          icon: <NumberSquareOne size={22} />,      maxFields: 1 },
    { type: 'LINE',           label: t('nucleo.dashboard.chart.linha'),        icon: <ChartLine size={22} /> },
    { type: 'AREA',           label: t('nucleo.dashboard.chart.area'),         icon: <ChartLine size={22} weight="fill" /> },
    { type: 'BAR',            label: t('nucleo.dashboard.chart.barras'),       icon: <ChartBar size={22} /> },
    { type: 'BAR_HORIZONTAL', label: t('nucleo.dashboard.chart.barras_h'),     icon: <ChartBarHorizontal size={22} /> },
    { type: 'DISTRIBUTION',   label: t('nucleo.dashboard.chart.distribuicao'), icon: <ChartPieSlice size={22} />, minFields: 2, requiresSameUnit: true },
    { type: 'DONUT',          label: t('nucleo.dashboard.chart.donut'),        icon: <ChartDonut size={22} />,           maxFields: 1 },
    { type: 'TABLE',          label: t('nucleo.dashboard.chart.tabela'),       icon: <Table size={22} /> },
    { type: 'FUNNEL',         label: t('nucleo.dashboard.chart.funil'),        icon: <Funnel size={22} /> },
    { type: 'GAUGE',          label: t('nucleo.dashboard.chart.gauge'),        icon: <Gauge size={22} />,               maxFields: 1 },
  ]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFieldUnit(field: CatalogField): FieldUnitType {
  if (field.type === 'currency') return 'currency'
  if (field.type === 'percentage') return 'percentage'
  return 'number'
}

function getUnitTypes(fields: CatalogField[]): FieldUnitType[] {
  return [...new Set(fields.map(getFieldUnit))]
}

function hasMixedUnits(fields: CatalogField[]): boolean {
  return getUnitTypes(fields).length > 1
}

/** Verifica se um tipo de gráfico está disponível dado os campos selecionados */
function isChartTypeAvailable(
  opt: ChartTypeOption,
  selectedFields: CatalogField[],
  t: (k: string, opts?: Record<string, unknown>) => string,
): { available: boolean; reason?: string } {
  const count = selectedFields.length
  if (count === 0) return { available: true }

  if (opt.maxFields !== undefined && count > opt.maxFields) {
    return { available: false, reason: t('nucleo.dashboard.construtor.reason_max_campos', { count: opt.maxFields }) }
  }
  if (opt.minFields !== undefined && count < opt.minFields) {
    return { available: false, reason: t('nucleo.dashboard.construtor.reason_min_campos', { count: opt.minFields }) }
  }
  if (opt.requiresSameUnit && hasMixedUnits(selectedFields)) {
    return { available: false, reason: t('nucleo.dashboard.construtor.reason_mesma_unidade') }
  }
  return { available: true }
}

// ── Passo 1: Selecionar Campos ────────────────────────────────────────────────

interface Step1Props {
  fields: CatalogField[]
  selected: string[]
  onToggle: (key: string) => void
}

function Step1Fields({ fields, selected, onToggle }: Step1Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return q
      ? fields.filter(f => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q))
      : fields
  }, [fields, query])

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogField[]>()
    for (const f of filtered) {
      const arr = map.get(f.productId) ?? []
      arr.push(f)
      map.set(f.productId, arr)
    }
    return map
  }, [filtered])

  return (
    <div className="dq-construtor dq-construtor--campos">
      <p className="dq-construtor__hint">
        {t('nucleo.dashboard.construtor.hint_selecione_um', { defaultValue: 'Selecione um campo para o widget.' })}
      </p>

      <div className="dq-construtor__corpo">
        <div className="dq-secao">
          <span className="dq-secao-titulo">
            {t('nucleo.dashboard.construtor.secao_campos', { defaultValue: 'Campos' })}
          </span>

          <CampoGeralGlobal>
            <div className="dq-input-wrap dq-input-wrap--icone">
              <MagnifyingGlass size={14} className="dq-input-wrap__icone" aria-hidden />
              <input
                type="text"
                placeholder={t('nucleo.dashboard.construtor.buscar_campo_placeholder', {
                  defaultValue: 'Buscar campo...',
                })}
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label={t('nucleo.dashboard.construtor.buscar_campo_aria')}
              />
              {query.trim() !== '' && (
                <button
                  type="button"
                  className="dq-input-wrap__clear"
                  onClick={() => setQuery('')}
                  aria-label={t('tabela.limpar_busca', { defaultValue: 'Limpar busca' })}
                >
                  <X size={10} weight="bold" aria-hidden />
                </button>
              )}
            </div>
          </CampoGeralGlobal>

          <div className="dq-campos-lista">
            {filtered.length === 0 ? (
              <p className="dq-campos-vazio">{t('nucleo.dashboard.construtor.nenhum_campo')}</p>
            ) : (
              Array.from(grouped.entries()).map(([productId, productFields]) => (
                <div key={productId} className="dq-campos-grupo">
                  <span className="dq-grupo-titulo">{productId.toUpperCase()}</span>
                  {productFields.map(field => {
                  const isChecked = selected.includes(field.key)
                  const unitLabel = unitBadgeLabel(field.type)
                  const rowClass = [
                    'dq-campo-linha',
                    isChecked ? 'dq-campo-linha--selecionado' : '',
                  ].filter(Boolean).join(' ')
                  return (
                    <label
                      key={field.key}
                      className={rowClass}
                    >
                      <input
                        type="radio"
                        name="dq-campo-widget"
                        className="dq-campo-linha__radio"
                        checked={isChecked}
                        onChange={() => onToggle(field.key)}
                        tabIndex={-1}
                      />
                        <span className="dq-campo-linha__nome">{field.label}</span>
                        <span className="dq-campos__meta">
                          <span className="dq-campos__badge-unidade">{unitLabel}</span>
                          <span className="dq-campos__badge-tipo">{field.type}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Passo 2: Operação por campo ───────────────────────────────────────────────

interface Step2Props {
  fields: CatalogField[]
  selectedKeys: string[]
  fieldOps: Record<string, string>
  period: string
  title: string
  periodOptions: PeriodOption[]
  onFieldOp: (key: string, op: string) => void
  onPeriod: (v: string) => void
  onTitle: (v: string) => void
}

function Step2Config({
  fields, selectedKeys, fieldOps, period, title, periodOptions,
  onFieldOp, onPeriod, onTitle,
}: Step2Props) {
  const { t } = useTranslation()
  const selectedFields = fields.filter(f => selectedKeys.includes(f.key))

  // Verifica se todas as operações são iguais e há só uma opção por campo → colapsar
  const allSameOp = useMemo(() => {
    if (selectedFields.length <= 1) return false
    const ops = selectedFields.map(f => {
      const avail = f.aggregations
      return avail.length === 1 ? avail[0] : fieldOps[f.key]
    })
    return ops.every((op, _, arr) => op === arr[0])
  }, [selectedFields, fieldOps])

  const allAutoFill = useMemo(
    () => selectedFields.every(f => f.aggregations.length === 1),
    [selectedFields],
  )

  const collapsed = allSameOp && allAutoFill && selectedFields.length > 1

  return (
    <div className="dq-construtor dq-construtor--operacao">
      <p className="dq-construtor__hint">{t('nucleo.dashboard.construtor.step2_hint')}</p>

      <div className="dq-construtor__corpo">
        <div className="dq-secao">
          <span className="dq-secao-titulo">
            {t('nucleo.dashboard.construtor.secao_configuracao', { defaultValue: 'Configuração' })}
          </span>
          <div className="dq-form__stack">
        <CampoGeralGlobal
          label={t('nucleo.dashboard.construtor.titulo_widget')}
          htmlFor="qb-title"
          obrigatorio
          vazio={!title.trim()}
        >
          <input
            id="qb-title"
            type="text"
            placeholder={t('nucleo.dashboard.construtor.titulo_widget_placeholder')}
            value={title}
            onChange={e => onTitle(e.target.value)}
            maxLength={80}
            autoComplete="off"
          />
        </CampoGeralGlobal>

        {collapsed ? (
          <div className="dq-form__grupo">
            <span className="dq-form__label">{t('nucleo.dashboard.construtor.operacao_todos')}</span>
            <div className="dq-op__colapsado">
              <span className="dq-op__fixa">{selectedFields[0].aggregations[0]}</span>
              <span className="dq-op__colapsado-nota">{t('nucleo.dashboard.construtor.auto_preenchido_nota')}</span>
            </div>
          </div>
        ) : (
          <div className="dq-form__grupo">
            <span className="dq-form__label">{t('nucleo.dashboard.construtor.operacao_por_campo')}</span>
            <div className="dq-op__lista">
              {selectedFields.map(field => {
                const avail = field.aggregations
                const currentOp = avail.length === 1 ? avail[0] : (fieldOps[field.key] ?? avail[0])
                const unitLabel = unitBadgeLabel(field.type)
                return (
                  <div key={field.key} className="dq-op__linha">
                    <span className="dq-op__campo">
                      <span>{field.label}</span>
                      <span className="dq-campos__badge-unidade">{unitLabel}</span>
                    </span>
                    {avail.length === 1 ? (
                      <span className="dq-op__fixa">{avail[0]}</span>
                    ) : (
                      <div className="dq-op__pill-grupo" role="group" aria-label={field.label}>
                        {avail.map(op => (
                          <button
                            key={op}
                            type="button"
                            className={`dq-op__pill${currentOp === op ? ' dq-op__pill--ativa' : ''}`}
                            onClick={() => onFieldOp(field.key, op)}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <CampoGeralGlobal label={t('nucleo.dashboard.construtor.periodo')}>
          <PeriodoCampoFormulario
            value={period}
            options={periodOptions}
            onChange={onPeriod}
          />
        </CampoGeralGlobal>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Passo 3: Visualização ─────────────────────────────────────────────────────

interface Step3Props {
  chartType: ChartType
  selectedFields: CatalogField[]
  onSelect: (t: ChartType) => void
}

function Step3Visualization({ chartType, selectedFields, onSelect }: Step3Props) {
  const { t } = useTranslation()
  const CHART_OPTIONS = useMemo(() => buildChartOptions(t), [t])
  const mixedUnits = hasMixedUnits(selectedFields)

  return (
    <div className="dq-construtor dq-construtor--visualizar">
      <p className="dq-construtor__hint">{t('nucleo.dashboard.construtor.step3_hint')}</p>

      {mixedUnits && (
        <div className="dq-construtor__alert" role="status">
          <Warning size={14} weight="fill" color="var(--warning)" aria-hidden />
          <span>{t('nucleo.dashboard.construtor.eixo_duplo_ativado')}</span>
        </div>
      )}

      <div className="dq-construtor__corpo">
        <div className="dq-secao dq-secao--visualizar">
          <div className="dq-chart__grid">
        {CHART_OPTIONS.map(opt => {
          const { available, reason } = isChartTypeAvailable(opt, selectedFields, t)
          const isSelected = chartType === opt.type
          const cardClass = [
            'dq-chart__card',
            isSelected ? 'dq-chart__card--selecionado' : '',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={opt.type}
              type="button"
              className={cardClass}
              onClick={() => available && onSelect(opt.type)}
              disabled={!available}
              aria-pressed={isSelected}
              title={!available ? reason : opt.label}
            >
              <span className="dq-chart__card-inner">
                <span
                  className="dq-chart__icone"
                  style={{ color: isSelected ? 'var(--accent)' : available ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                >
                  {opt.icon}
                </span>
                <span className="dq-chart__rotulo">{opt.label}</span>
                {!available && reason && (
                  <span className="dq-chart__motivo">{reason}</span>
                )}
              </span>
            </button>
          )
        })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DashboardConstrutorConsulta({
  aberto,
  availableFields,
  onSave,
  onCancel,
  periodOptions,
  periodoInicial = '30d',
  initialWidget,
}: QueryBuilderProps) {
  const { t } = useTranslation()
  const PASSOS = useMemo(() => buildPassos(t), [t])
  const resolvedPeriodOptions = useMemo(
    () => periodOptions ?? buildDefaultPeriodOptions(t),
    [periodOptions, t],
  )
  const isEdit = !!initialWidget

  const [step,        setStep]       = useState<1 | 2 | 3>(1)
  const [selectedKeys, setSelected]  = useState<string[]>([])
  const [fieldOps,    setFieldOps]   = useState<Record<string, string>>({})
  const [period,      setPeriod]     = useState(periodoInicial)
  const [title,       setTitle]      = useState('')
  const [chartType,   setChartType]  = useState<ChartType>('BAR')

  useEffect(() => {
    if (aberto && initialWidget) {
      const keys = initialWidget.query_spec.fields.map(f => f.key).slice(0, MAX_FIELDS)
      const ops  = Object.fromEntries(
        initialWidget.query_spec.fields.slice(0, MAX_FIELDS).map(f => [f.key, f.operation]),
      )
      setSelected(keys)
      setFieldOps(ops)
      setPeriod(initialWidget.query_spec.filters.period ?? '30d')
      setTitle(initialWidget.title)
      setChartType(initialWidget.chart_type)
      setStep(1)
    }
    if (!aberto) {
      setStep(1)
      setSelected([])
      setFieldOps({})
      setPeriod(periodoInicial)
      setTitle('')
      setChartType('BAR')
    }
  }, [aberto, initialWidget, periodoInicial])

  function toggleField(key: string) {
    setSelected((prev: string[]) => (prev[0] === key ? [] : [key]))
  }

  function handleFieldOp(key: string, op: string) {
    setFieldOps(prev => ({ ...prev, [key]: op }))
  }

  function canAdvance(): boolean {
    if (step === 1) return selectedKeys.length > 0
    if (step === 2) return title.trim().length > 0
    return true
  }

  function handleNext() {
    if (step < 3) { setStep((step + 1) as 1 | 2 | 3); return }

    const selectedFields = availableFields.filter(f => selectedKeys.includes(f.key))
    const fields: FieldQuerySpec[] = selectedFields.map(f => ({
      key: f.key,
      operation: f.aggregations.length === 1
        ? f.aggregations[0]
        : (fieldOps[f.key] ?? f.aggregations[0]),
    }))

    onSave(
      { fields, filters: { period }, chartType },
      title.trim(),
      chartType,
    )
  }

  const selectedFields = availableFields.filter(f => selectedKeys.includes(f.key))

  return (
    <ModalPassoPassoGlobal
      titulo={isEdit ? t('nucleo.dashboard.construtor.editar_widget') : t('nucleo.dashboard.construtor.novo_widget')}
      icone={<Gauge size={20} weight="duotone" />}
      subtitulo={t('nucleo.dashboard.construtor.subtitulo_modal')}
      aberto={aberto}
      passos={PASSOS}
      passoAtual={step}
      podeAvancar={canAdvance()}
      labelBotaoFinal={t('nucleo.dashboard.construtor.salvar_widget')}
      onProximo={handleNext}
      onVoltar={() => step > 1 && setStep((step - 1) as 1 | 2 | 3)}
      onFechar={onCancel}
      tamanho="md"
      altura="600px"
    >
      {step === 1 && (
        <Step1Fields
          fields={availableFields}
          selected={selectedKeys}
          onToggle={toggleField}
        />
      )}
      {step === 2 && (
        <Step2Config
          fields={availableFields}
          selectedKeys={selectedKeys}
          fieldOps={fieldOps}
          period={period}
          title={title}
          periodOptions={resolvedPeriodOptions}
          onFieldOp={handleFieldOp}
          onPeriod={setPeriod}
          onTitle={setTitle}
        />
      )}
      {step === 3 && (
        <Step3Visualization
          chartType={chartType}
          selectedFields={selectedFields}
          onSelect={setChartType}
        />
      )}
    </ModalPassoPassoGlobal>
  )
}

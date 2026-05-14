/**
 * DashboardConstrutorConsulta — UI em 3 passos para criar/editar um widget customizado
 *
 * v2 — 2026-04-03
 * Passo 1: Selecionar campos com badges de tipo e validação de unidade (D3)
 * Passo 2: Operação individual por campo com auto-fill (D2)
 * Passo 3: Tipo de gráfico filtrado por compatibilidade + badge eixo duplo
 */

import React, { useState, useMemo, useEffect } from 'react'
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
  Warning,
  ChartPieSlice,
} from '@phosphor-icons/react'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { CatalogField, ChartType, WidgetQuerySpec, FieldQuerySpec, FieldUnitType } from '../tipos.js'
import { unitBadgeLabel, wouldExceedUnitLimit } from '../utils/axisUtils.js'

export interface QueryBuilderProps {
  aberto: boolean
  availableFields: CatalogField[]
  onSave: (spec: WidgetQuerySpec, title: string, chartType: ChartType) => void
  onCancel: () => void
  initialWidget?: {
    id: string
    title: string
    chart_type: ChartType
    query_spec: WidgetQuerySpec
  }
}

// ── Passos ────────────────────────────────────────────────────────────────────

const PASSOS = [
  { id: 1, label: 'Campos',     icone: <ListBullets size={14} /> },
  { id: 2, label: 'Operação',   icone: <SlidersHorizontal size={14} /> },
  { id: 3, label: 'Visualizar', icone: <Eye size={14} /> },
]

const MAX_FIELDS = 5
const MAX_UNIT_TYPES = 2

// ── Tipos de gráfico ──────────────────────────────────────────────────────────

interface ChartTypeOption {
  type: ChartType
  label: string
  icon: React.ReactNode
  minFields?: number
  maxFields?: number
  requiresSameUnit?: boolean
}

const CHART_OPTIONS: ChartTypeOption[] = [
  { type: 'KPI_CARD',       label: 'KPI',          icon: <NumberSquareOne size={22} />,      maxFields: 1 },
  { type: 'LINE',           label: 'Linha',         icon: <ChartLine size={22} /> },
  { type: 'AREA',           label: 'Área',          icon: <ChartLine size={22} weight="fill" /> },
  { type: 'BAR',            label: 'Barras',        icon: <ChartBar size={22} /> },
  { type: 'BAR_HORIZONTAL', label: 'Barras H.',     icon: <ChartBarHorizontal size={22} /> },
  { type: 'DISTRIBUTION',   label: 'Distribuição',  icon: <ChartPieSlice size={22} />, minFields: 2, requiresSameUnit: true },
  { type: 'DONUT',          label: 'Donut',         icon: <ChartDonut size={22} />,           maxFields: 1 },
  { type: 'TABLE',          label: 'Tabela',        icon: <Table size={22} /> },
  { type: 'FUNNEL',         label: 'Funil',         icon: <Funnel size={22} /> },
  { type: 'GAUGE',          label: 'Gauge',         icon: <Gauge size={22} />,               maxFields: 1 },
]

const PERIOD_OPTIONS = [
  { value: '7d',            label: '7 dias' },
  { value: '30d',           label: '30 dias' },
  { value: '90d',           label: '90 dias' },
  { value: '12m',           label: '12 meses' },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'current_year',  label: 'Ano atual' },
]

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
): { available: boolean; reason?: string } {
  const count = selectedFields.length
  if (count === 0) return { available: true }

  if (opt.maxFields !== undefined && count > opt.maxFields) {
    return { available: false, reason: `Máximo ${opt.maxFields} campo(s) para este tipo` }
  }
  if (opt.minFields !== undefined && count < opt.minFields) {
    return { available: false, reason: `Mínimo ${opt.minFields} campos para este tipo` }
  }
  if (opt.requiresSameUnit && hasMixedUnits(selectedFields)) {
    return { available: false, reason: 'Todos os campos devem ter a mesma unidade' }
  }
  return { available: true }
}

// ── Passo 1: Selecionar Campos ────────────────────────────────────────────────

interface Step1Props {
  fields: CatalogField[]
  selected: string[]
  chartType: ChartType
  onToggle: (key: string) => void
}

function Step1Fields({ fields, selected, chartType, onToggle }: Step1Props) {
  const [query, setQuery] = useState('')

  const selectedFields = useMemo(
    () => fields.filter(f => selected.includes(f.key)),
    [fields, selected],
  )

  const currentUnitTypes = useMemo(() => getUnitTypes(selectedFields), [selectedFields])
  const mixedUnits = currentUnitTypes.length > 1

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

  function getFieldState(field: CatalogField): {
    blocked: boolean
    reason?: string
  } {
    const isSelected = selected.includes(field.key)
    if (isSelected) return { blocked: false }
    if (selected.length >= MAX_FIELDS) return { blocked: true, reason: `Máximo ${MAX_FIELDS} campos` }

    // Verifica limite de tipos de unidade
    const fieldUnit = getFieldUnit(field)
    if (wouldExceedUnitLimit(currentUnitTypes, fieldUnit)) {
      return { blocked: true, reason: `Já há ${MAX_UNIT_TYPES} tipos de unidade. Remova um campo antes.` }
    }

    // Restrição de DISTRIBUTION: mesma unidade
    const chartOpt = CHART_OPTIONS.find(o => o.type === chartType)
    if (chartOpt?.requiresSameUnit && selectedFields.length > 0) {
      const firstUnit = getFieldUnit(selectedFields[0])
      if (fieldUnit !== firstUnit) {
        return { blocked: true, reason: 'Distribuição exige campos com a mesma unidade' }
      }
    }

    return { blocked: false }
  }

  return (
    <div style={s1.wrap}>
      <p style={s1.hint}>Selecione até {MAX_FIELDS} campos. Máximo 2 tipos de unidade (R$, # ou %).</p>

      {mixedUnits && (
        <div style={s1.warningBox}>
          <Warning size={13} weight="fill" color="var(--warning)" />
          <span>Campos com unidades diferentes usarão eixo Y duplo neste gráfico.</span>
        </div>
      )}

      <div style={s1.searchWrap}>
        <MagnifyingGlass size={14} color="var(--text-muted)" />
        <input
          style={s1.searchInput}
          type="text"
          placeholder="Buscar campo..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Buscar campo"
        />
      </div>

      <div style={s1.fieldList}>
        {Array.from(grouped.entries()).map(([productId, productFields]) => (
          <div key={productId} style={{ marginBottom: 'var(--space-3)' }}>
            <div style={s1.productBadge}>{productId.toUpperCase()}</div>
            {productFields.map(field => {
              const isChecked = selected.includes(field.key)
              const { blocked, reason } = getFieldState(field)
              const unitLabel = unitBadgeLabel(field.type)
              return (
                <label
                  key={field.key}
                  title={blocked ? reason : undefined}
                  style={{
                    ...s1.fieldRow,
                    opacity: blocked ? 0.4 : 1,
                    cursor: blocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={blocked}
                    onChange={() => onToggle(field.key)}
                    style={{ accentColor: 'var(--accent)', cursor: 'inherit' }}
                  />
                  <span style={s1.fieldLabel}>{field.label}</span>
                  <span style={s1.unitBadge}>{unitLabel}</span>
                  <span style={s1.fieldType}>{field.type}</span>
                </label>
              )
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={s1.emptySearch}>Nenhum campo encontrado</p>
        )}
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
  onFieldOp: (key: string, op: string) => void
  onPeriod: (v: string) => void
  onTitle: (v: string) => void
}

function Step2Config({
  fields, selectedKeys, fieldOps, period, title,
  onFieldOp, onPeriod, onTitle,
}: Step2Props) {
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
    <div style={s2.wrap}>
      <p style={s2.hint}>Configure o título, operação por campo e o período de análise.</p>

      <div style={s2.formGroup}>
        <label style={s2.label} htmlFor="qb-title">Título do widget</label>
        <input
          id="qb-title"
          style={s2.input}
          type="text"
          placeholder="Ex: Receita por Mês"
          value={title}
          onChange={e => onTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      {collapsed ? (
        <div style={s2.formGroup}>
          <label style={s2.label}>Operação (todos os campos)</label>
          <div style={s2.collapsedOp}>
            {selectedFields[0].aggregations[0]}
            <span style={s2.collapsedNote}>— auto-preenchido (todos os campos têm a mesma operação)</span>
          </div>
        </div>
      ) : (
        <div style={s2.formGroup}>
          <label style={s2.label}>Operação por campo</label>
          <div style={s2.fieldOpList}>
            {selectedFields.map(field => {
              const avail = field.aggregations
              const currentOp = avail.length === 1 ? avail[0] : (fieldOps[field.key] ?? avail[0])
              const unitLabel = unitBadgeLabel(field.type)
              return (
                <div key={field.key} style={s2.fieldOpRow}>
                  <span style={s2.fieldOpLabel}>
                    {field.label}
                    <span style={s2.unitBadge}>{unitLabel}</span>
                  </span>
                  {avail.length === 1 ? (
                    <span style={s2.fixedOp}>{avail[0]}</span>
                  ) : (
                    <select
                      style={s2.select}
                      value={currentOp}
                      onChange={e => onFieldOp(field.key, e.target.value)}
                    >
                      {avail.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={s2.formGroup}>
        <label style={s2.label} htmlFor="qb-period">Período</label>
        <select
          id="qb-period"
          style={s2.select}
          value={period}
          onChange={e => onPeriod(e.target.value)}
        >
          {PERIOD_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
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
  const mixedUnits = hasMixedUnits(selectedFields)

  return (
    <div style={s3.wrap}>
      <p style={s3.hint}>Escolha como os dados serão visualizados.</p>

      {mixedUnits && (
        <div style={s3.dualAxisBadge}>
          <Warning size={12} weight="fill" color="var(--warning)" />
          Eixo Y duplo será ativado (unidades incompatíveis)
        </div>
      )}

      <div style={s3.chartGrid}>
        {CHART_OPTIONS.map(opt => {
          const { available, reason } = isChartTypeAvailable(opt, selectedFields)
          const isSelected = chartType === opt.type
          return (
            <button
              key={opt.type}
              style={{
                ...s3.chartOption,
                ...(isSelected  ? s3.chartOptionSelected  : {}),
                ...(!available  ? s3.chartOptionDisabled  : {}),
              }}
              onClick={() => available && onSelect(opt.type)}
              disabled={!available}
              aria-pressed={isSelected}
              title={!available ? reason : opt.label}
            >
              <span style={{ color: isSelected ? 'var(--accent)' : available ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {opt.icon}
              </span>
              <span style={s3.chartLabel}>{opt.label}</span>
              {!available && reason && (
                <span style={s3.disabledReason}>{reason}</span>
              )}
            </button>
          )
        })}
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
  initialWidget,
}: QueryBuilderProps) {
  const isEdit = !!initialWidget

  const [step,        setStep]       = useState<1 | 2 | 3>(1)
  const [selectedKeys, setSelected]  = useState<string[]>([])
  const [fieldOps,    setFieldOps]   = useState<Record<string, string>>({})
  const [period,      setPeriod]     = useState('30d')
  const [title,       setTitle]      = useState('')
  const [chartType,   setChartType]  = useState<ChartType>('BAR')

  useEffect(() => {
    if (aberto && initialWidget) {
      const keys = initialWidget.query_spec.fields.map(f => f.key)
      const ops  = Object.fromEntries(initialWidget.query_spec.fields.map(f => [f.key, f.operation]))
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
      setPeriod('30d')
      setTitle('')
      setChartType('BAR')
    }
  }, [aberto, initialWidget])

  function toggleField(key: string) {
    setSelected((prev: string[]) => {
      if (prev.includes(key)) return prev.filter((k: string) => k !== key)
      return [...prev, key]
    })
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
      titulo={isEdit ? 'Editar Widget' : 'Novo Widget'}
      icone={<Gauge size={20} weight="duotone" />}
      subtitulo="Configure os dados e a visualização do widget"
      aberto={aberto}
      passos={PASSOS}
      passoAtual={step}
      podeAvancar={canAdvance()}
      labelBotaoFinal="Salvar Widget"
      onProximo={handleNext}
      onVoltar={() => step > 1 && setStep((step - 1) as 1 | 2 | 3)}
      onFechar={onCancel}
      tamanho="md"
      altura="560px"
    >
      {step === 1 && (
        <Step1Fields
          fields={availableFields}
          selected={selectedKeys}
          chartType={chartType}
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

// ── Estilos Passo 1 ───────────────────────────────────────────────────────────

const s1 = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' },
  hint: { fontSize: '13px', color: 'var(--text-secondary)', margin: 0 },
  warningBox: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', color: 'var(--warning)',
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 'var(--radius-md)', padding: '6px 10px',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', padding: '6px 10px',
  },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px' },
  fieldList: { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' },
  productBadge: {
    fontSize: '11px', fontWeight: 600, padding: '2px 8px',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', display: 'inline-block', marginBottom: '6px',
    textTransform: 'uppercase' as const, letterSpacing: '0.04em',
  },
  fieldRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
    padding: '6px 8px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)', marginBottom: '4px',
  },
  fieldLabel: { flex: 1, fontSize: '13px', color: 'var(--text-primary)' },
  unitBadge: {
    fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-sm)', padding: '1px 5px', minWidth: '20px', textAlign: 'center' as const,
  },
  fieldType: { fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 'var(--radius-sm)' },
  emptySearch: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' as const, margin: 'var(--space-4) 0' },
} as const

// ── Estilos Passo 2 ───────────────────────────────────────────────────────────

const s2 = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' },
  hint: { fontSize: '13px', color: 'var(--text-secondary)', margin: 0 },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' },
  label: { fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' },
  input: {
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontSize: '13px', padding: '8px 12px', outline: 'none',
  },
  select: {
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontSize: '13px', padding: '8px 12px', outline: 'none', cursor: 'pointer',
  },
  collapsedOp: {
    fontSize: '13px', color: 'var(--text-primary)', padding: '8px 12px',
    background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '8px',
  },
  collapsedNote: { fontSize: '11px', color: 'var(--text-muted)' },
  fieldOpList: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  fieldOpRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
    padding: '8px 12px', background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
  },
  fieldOpLabel: { flex: 1, fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' },
  unitBadge: {
    fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-sm)', padding: '1px 5px',
  },
  fixedOp: {
    fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
    background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '4px 10px',
  },
} as const

// ── Estilos Passo 3 ───────────────────────────────────────────────────────────

const s3 = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' },
  hint: { fontSize: '13px', color: 'var(--text-secondary)', margin: 0 },
  dualAxisBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', fontWeight: 600, color: 'var(--warning)',
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 'var(--radius-md)', padding: '4px 10px',
  },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' },
  chartOption: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    justifyContent: 'center', gap: '6px', padding: 'var(--space-3)',
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', cursor: 'pointer', position: 'relative' as const,
    transition: 'var(--transition-fast)',
  },
  chartOptionSelected: {
    background: 'var(--accent-dim)', border: '2px solid var(--accent)',
  } as React.CSSProperties,
  chartOptionDisabled: {
    opacity: 0.35, cursor: 'not-allowed',
  } as React.CSSProperties,
  chartLabel: { fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center' as const },
  disabledReason: {
    fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' as const,
    position: 'absolute' as const, bottom: '4px', left: '4px', right: '4px',
    lineHeight: 1.2,
  },
} as const

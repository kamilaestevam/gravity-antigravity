/**
 * QueryBuilder — UI em 3 passos para criar um widget customizado
 *
 * Passo 1: Selecionar campos do catálogo (máximo 5)
 * Passo 2: Configurar operação, período e título
 * Passo 3: Escolher tipo de visualização
 *
 * Utiliza @nucleo/modal-passo-passo-global para o chrome do wizard.
 */

import React, { useState, useMemo } from 'react'
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
} from '@phosphor-icons/react'
import { ModalPassoPassoGlobal } from '../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal.js'
import type { CatalogField, ChartType, WidgetQuerySpec } from '../tipos.js'

export interface QueryBuilderProps {
  aberto: boolean
  availableFields: CatalogField[]
  suggestedChartTypes?: ChartType[]
  onSave: (spec: WidgetQuerySpec, title: string, chartType: ChartType) => void
  onCancel: () => void
}

// ── Passos do wizard ──────────────────────────────────────────────────────────

const PASSOS = [
  { id: 1, label: 'Campos',     icone: <ListBullets size={14} /> },
  { id: 2, label: 'Operação',   icone: <SlidersHorizontal size={14} /> },
  { id: 3, label: 'Visualizar', icone: <Eye size={14} /> },
]

// ── Chart types ───────────────────────────────────────────────────────────────

interface ChartTypeOption {
  type: ChartType
  label: string
  icon: React.ReactNode
}

const CHART_OPTIONS: ChartTypeOption[] = [
  { type: 'KPI_CARD',       label: 'KPI',          icon: <NumberSquareOne size={22} /> },
  { type: 'LINE',           label: 'Linha',         icon: <ChartLine size={22} /> },
  { type: 'AREA',           label: 'Área',          icon: <ChartLine size={22} weight="fill" /> },
  { type: 'BAR',            label: 'Barras',        icon: <ChartBar size={22} /> },
  { type: 'BAR_HORIZONTAL', label: 'Barras Horiz.', icon: <ChartBarHorizontal size={22} /> },
  { type: 'DONUT',          label: 'Donut',         icon: <ChartDonut size={22} /> },
  { type: 'TABLE',          label: 'Tabela',        icon: <Table size={22} /> },
  { type: 'FUNNEL',         label: 'Funil',         icon: <Funnel size={22} /> },
  { type: 'GAUGE',          label: 'Gauge',         icon: <Gauge size={22} /> },
]

const PERIOD_OPTIONS = [
  { value: '7d',            label: '7 dias' },
  { value: '30d',           label: '30 dias' },
  { value: '90d',           label: '90 dias' },
  { value: '12m',           label: '12 meses' },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'current_year',  label: 'Ano atual' },
]

const MAX_FIELDS = 5

function productColor(_productId: string): string {
  return 'var(--accent)'
}

// ── Passo 1: Selecionar Campos ────────────────────────────────────────────────

interface Step1Props {
  fields: CatalogField[]
  selected: string[]
  onToggle: (key: string) => void
}

function Step1Fields({ fields, selected, onToggle }: Step1Props) {
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
    <div style={styles.stepContent}>
      <p style={styles.stepHint}>Selecione até {MAX_FIELDS} campos para o widget.</p>

      <div style={styles.searchWrap}>
        <MagnifyingGlass size={14} color="var(--text-muted)" />
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Buscar campo..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Buscar campo"
        />
      </div>

      <div style={styles.fieldList}>
        {Array.from(grouped.entries()).map(([productId, productFields]) => (
          <div key={productId} style={{ marginBottom: 'var(--space-3)' }}>
            <div style={styles.productGroupLabel}>
              <span
                style={{
                  ...styles.productBadge,
                  borderColor: productColor(productId),
                  color: productColor(productId),
                }}
              >
                {productId.toUpperCase()}
              </span>
            </div>

            {productFields.map(field => {
              const isChecked  = selected.includes(field.key)
              const isDisabled = !isChecked && selected.length >= MAX_FIELDS
              return (
                <label
                  key={field.key}
                  style={{
                    ...styles.fieldRow,
                    opacity: isDisabled ? 0.45 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => onToggle(field.key)}
                    style={{ accentColor: 'var(--accent)', cursor: 'inherit' }}
                  />
                  <span style={styles.fieldLabel}>{field.label}</span>
                  <span style={styles.fieldType}>{field.type}</span>
                </label>
              )
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={styles.emptySearch}>Nenhum campo encontrado</p>
        )}
      </div>
    </div>
  )
}

// ── Passo 2: Configurar Query ─────────────────────────────────────────────────

interface Step2Props {
  fields: CatalogField[]
  selectedKeys: string[]
  operation: string
  period: string
  title: string
  onOperation: (v: string) => void
  onPeriod: (v: string) => void
  onTitle: (v: string) => void
}

function Step2Config({
  fields, selectedKeys, operation, period, title,
  onOperation, onPeriod, onTitle,
}: Step2Props) {
  const aggregations = useMemo(() => {
    const selected = fields.filter(f => selectedKeys.includes(f.key))
    if (selected.length === 0) return []
    const union = new Set<string>()
    for (const f of selected) f.aggregations.forEach(a => union.add(a))
    return [...union]
  }, [fields, selectedKeys])

  return (
    <div style={styles.stepContent}>
      <p style={styles.stepHint}>Configure como os dados serão agregados e o período de análise.</p>

      <div style={styles.formGroup}>
        <label style={styles.formLabel} htmlFor="qb-title">Título do widget</label>
        <input
          id="qb-title"
          style={styles.formInput}
          type="text"
          placeholder="Ex: Receita por Mês"
          value={title}
          onChange={e => onTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel} htmlFor="qb-operation">Operação</label>
        <select
          id="qb-operation"
          style={styles.formSelect}
          value={operation}
          onChange={e => onOperation(e.target.value)}
        >
          {aggregations.length === 0 && (
            <option value="">Selecione campos primeiro</option>
          )}
          {aggregations.map(agg => (
            <option key={agg} value={agg}>{agg}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel} htmlFor="qb-period">Período</label>
        <select
          id="qb-period"
          style={styles.formSelect}
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

// ── Passo 3: Escolher Visualização ────────────────────────────────────────────

interface Step3Props {
  chartType: ChartType
  suggestedTypes: ChartType[]
  onSelect: (t: ChartType) => void
}

function Step3Visualization({ chartType, suggestedTypes, onSelect }: Step3Props) {
  return (
    <div style={styles.stepContent}>
      <p style={styles.stepHint}>Escolha como os dados serão visualizados.</p>

      <div style={styles.chartGrid}>
        {CHART_OPTIONS.map(opt => {
          const isSuggested = suggestedTypes.includes(opt.type)
          const isSelected  = chartType === opt.type
          return (
            <button
              key={opt.type}
              style={{
                ...styles.chartOption,
                ...(isSelected  ? styles.chartOptionSelected  : {}),
                ...(isSuggested && !isSelected ? styles.chartOptionSuggested : {}),
              }}
              onClick={() => onSelect(opt.type)}
              aria-pressed={isSelected}
              title={isSuggested ? `${opt.label} (sugerido)` : opt.label}
            >
              <span style={{ color: isSelected ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {opt.icon}
              </span>
              <span style={styles.chartLabel}>{opt.label}</span>
              {isSuggested && <span style={styles.suggestedDot} title="Sugerido" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function QueryBuilder({
  aberto,
  availableFields,
  suggestedChartTypes = [],
  onSave,
  onCancel,
}: QueryBuilderProps) {
  const [step,           setStep]          = useState<1 | 2 | 3>(1)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [operation,      setOperation]      = useState('sum')
  const [period,         setPeriod]         = useState('30d')
  const [title,          setTitle]          = useState('')
  const [chartType,      setChartType]      = useState<ChartType>('BAR')

  function toggleField(key: string) {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    )
  }

  function canAdvance(): boolean {
    if (step === 1) return selectedFields.length > 0
    if (step === 2) return title.trim().length > 0 && operation !== ''
    return true
  }

  function handleNext() {
    if (step < 3) { setStep((step + 1) as 1 | 2 | 3); return }
    onSave(
      { fields: selectedFields, operation, filters: { period }, chartType },
      title.trim(),
      chartType,
    )
  }

  function handleBack() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3)
  }

  function handleFechar() {
    // Reseta estado ao fechar
    setStep(1)
    setSelectedFields([])
    setOperation('sum')
    setPeriod('30d')
    setTitle('')
    setChartType('BAR')
    onCancel()
  }

  return (
    <ModalPassoPassoGlobal
      titulo="Novo Widget"
      aberto={aberto}
      passos={PASSOS}
      passoAtual={step}
      podeAvancar={canAdvance()}
      labelBotaoFinal="Salvar Widget"
      onProximo={handleNext}
      onVoltar={handleBack}
      onFechar={handleFechar}
      tamanho="md"
      altura="540px"
    >
      {step === 1 && (
        <Step1Fields
          fields={availableFields}
          selected={selectedFields}
          onToggle={toggleField}
        />
      )}
      {step === 2 && (
        <Step2Config
          fields={availableFields}
          selectedKeys={selectedFields}
          operation={operation}
          period={period}
          title={title}
          onOperation={setOperation}
          onPeriod={setPeriod}
          onTitle={setTitle}
        />
      )}
      {step === 3 && (
        <Step3Visualization
          chartType={chartType}
          suggestedTypes={suggestedChartTypes}
          onSelect={setChartType}
        />
      )}
    </ModalPassoPassoGlobal>
  )
}

// ── Estilos do conteúdo dos passos ────────────────────────────────────────────
// (apenas conteúdo interno — chrome do modal fica em modal-passo-passo.css)

const styles = {
  stepContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-3)',
  },
  stepHint: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '6px 10px',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  productGroupLabel: {
    marginBottom: 'var(--space-2)',
  },
  productBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: '6px 8px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    marginBottom: '4px',
  },
  fieldLabel: {
    flex: 1,
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  fieldType: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    background: 'var(--bg-elevated)',
    padding: '1px 5px',
    borderRadius: 'var(--radius-sm)',
  },
  emptySearch: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textAlign: 'center' as const,
    margin: 'var(--space-4) 0',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  formInput: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    padding: '8px 12px',
    outline: 'none',
  },
  formSelect: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    padding: '8px 12px',
    outline: 'none',
    cursor: 'pointer',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--space-2)',
  },
  chartOption: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: 'var(--space-3)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'var(--transition-fast)',
  },
  chartOptionSelected: {
    background: 'var(--accent-dim)',
    border: '2px solid var(--accent)',
  } as React.CSSProperties,
  chartOptionSuggested: {
    border: '1px solid var(--border-accent)',
  } as React.CSSProperties,
  chartLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    textAlign: 'center' as const,
  },
  suggestedDot: {
    position: 'absolute' as const,
    top: '6px',
    right: '6px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
  },
} as const

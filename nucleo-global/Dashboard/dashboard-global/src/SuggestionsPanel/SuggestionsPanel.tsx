/**
 * SuggestionsPanel — Painel de sugestões e métricas derivadas
 *
 * Componente puro: recebe sugestões e métricas como props.
 * O produto é responsável por calcular as sugestões (via generateSuggestions)
 * e passar as métricas derivadas built-in + user-defined.
 */

import React from 'react'
import { Lightbulb, Plus, X, PencilSimple } from '@phosphor-icons/react'
import type { DashboardWidgetConfig, DerivedMetric } from '../tipos.js'
import type { SuggestedWidget } from '../suggestionsEngine.js'

export interface SuggestionsPanelProps {
  suggestions: SuggestedWidget[]
  derivedMetrics: DerivedMetric[]
  onAdd: (widget: DashboardWidgetConfig) => void
  onClose: () => void
  /** Callback para abrir o QueryBuilder (criar widget do zero) */
  onCreateCustom?: () => void
}

export function SuggestionsPanel({
  suggestions,
  derivedMetrics,
  onAdd,
  onClose,
  onCreateCustom,
}: SuggestionsPanelProps) {
  const confidenceColor: Record<string, string> = {
    high:   '#34d399',
    medium: '#f59e0b',
    low:    '#94a3b8',
  }

  const s = panelStyles

  return (
    <div style={s.overlay}>
      <div style={s.panel}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={s.header}>
          <span style={s.headerTitle}>
            <Lightbulb size={16} weight="duotone" /> Sugestões para o seu dashboard
          </span>
          <button type="button" style={s.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <p style={s.hint}>Geradas automaticamente a partir das métricas do produto.</p>

        {/* ── Sugestões automáticas ────────────────────────────────────────── */}
        <div style={s.list}>
          {suggestions.map(sug => (
            <div key={sug.id} style={s.item}>
              <div style={s.itemLeft}>
                <span style={{ ...s.badge, color: confidenceColor[sug.confidence] }}>
                  {sug.confidence === 'high' ? '● Alta' : sug.confidence === 'medium' ? '● Média' : '● Baixa'}
                </span>
                <strong style={s.itemTitle}>{sug.title}</strong>
                <span style={s.itemDesc}>{sug.description}</span>
                <span style={s.itemFields}>{sug.fields.join(' + ')}</span>
              </div>
              <button
                type="button"
                style={s.addBtn}
                onClick={() => { onAdd(sug.config); onClose() }}
              >
                <Plus size={13} /> Adicionar
              </button>
            </div>
          ))}
        </div>

        {/* ── Métricas derivadas ───────────────────────────────────────────── */}
        {derivedMetrics.length > 0 && (
          <>
            <div style={s.divider} />
            <p style={s.sectionTitle}>Métricas Derivadas</p>
            <div style={s.list}>
              {derivedMetrics.map(dm => (
                <div key={dm.id} style={s.item}>
                  <div style={s.itemLeft}>
                    <strong style={s.itemTitle}>{dm.label}</strong>
                    <span style={s.itemDesc}>{dm.description}</span>
                    <span style={s.itemFields}>{dm.inputFields.join(' ÷ ')}</span>
                  </div>
                  <button
                    type="button"
                    style={s.addBtn}
                    onClick={() => {
                      const widget: DashboardWidgetConfig = {
                        id: `derived_${dm.id}_${Date.now()}`,
                        title: dm.label,
                        chart_type: 'KPI_CARD',
                        query_spec: {
                          fields: dm.inputFields.map(k => ({ key: k, operation: dm.operation })),
                          filters: { period: '30d' },
                        },
                        position: { x: 0, y: 12, w: 3, h: 1 },
                        config: { derivedMetricId: dm.id },
                      }
                      onAdd(widget)
                      onClose()
                    }}
                  >
                    <Plus size={13} /> Adicionar
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Footer — criar widget do zero ───────────────────────────────── */}
        {onCreateCustom && (
          <>
            <div style={s.divider} />
            <div style={s.footer}>
              <span style={s.footerText}>Não encontrou o que precisa?</span>
              <button
                type="button"
                style={s.footerBtn}
                onClick={() => { onCreateCustom(); onClose() }}
              >
                <PencilSimple size={13} /> Criar widget do zero →
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

const panelStyles = {
  overlay: {
    position: 'fixed' as const, inset: 0,
    background: 'rgba(0,0,0,0.6)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem',
    width: '100%', maxWidth: '680px', maxHeight: '80vh',
    overflowY: 'auto' as const, boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '0.75rem',
  },
  headerTitle: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  hint: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: 0 },
  list: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 1rem', background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
    gap: '1rem',
  },
  itemLeft: { display: 'flex', flexDirection: 'column' as const, gap: '2px', minWidth: 0 },
  badge: { fontSize: '10px', fontWeight: 700 },
  itemTitle: { fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 },
  itemDesc: { fontSize: '12px', color: 'var(--text-secondary)' },
  itemFields: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' },
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0,
    fontSize: '12px', padding: '5px 12px', borderRadius: 'var(--radius-md)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 500,
  },
  divider: { height: '1px', background: 'var(--border-default)', margin: '1rem 0' },
  sectionTitle: {
    fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
    marginBottom: '0.75rem', marginTop: 0,
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '0.5rem', flexWrap: 'wrap' as const, paddingTop: '0.25rem',
  },
  footerText: {
    fontSize: '12px', color: 'var(--text-muted)',
  },
  footerBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', fontWeight: 600, padding: '5px 12px',
    borderRadius: '9999px', cursor: 'pointer',
    background: 'transparent', border: '1px solid var(--border-accent)',
    color: 'var(--accent)',
  },
} as const

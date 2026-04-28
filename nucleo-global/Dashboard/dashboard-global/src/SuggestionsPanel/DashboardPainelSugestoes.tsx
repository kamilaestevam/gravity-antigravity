/**
 * DashboardPainelSugestoes — Painel de sugestões e métricas derivadas
 *
 * Componente puro: recebe sugestões e métricas como props.
 * O produto é responsável por calcular as sugestões (via generateSuggestions)
 * e passar as métricas derivadas built-in + user-defined.
 */

import React from 'react'
import { ChartBar, Plus, X, PencilSimple } from '@phosphor-icons/react'
import type { DashboardWidgetConfig, DerivedMetric } from '../tipos.js'
import type { SuggestedWidget } from '../suggestionsEngine.js'

export interface SuggestionsPanelProps {
  suggestions: SuggestedWidget[]
  derivedMetrics: DerivedMetric[]
  onAdd: (widget: DashboardWidgetConfig) => void
  onClose: () => void
  /** Callback para abrir o DashboardConstrutorConsulta (criar widget do zero) */
  onCreateCustom?: () => void
}

export function DashboardPainelSugestoes({
  suggestions,
  derivedMetrics,
  onAdd,
  onClose,
  onCreateCustom,
}: SuggestionsPanelProps) {
  const confidenceMeta: Record<string, { label: string; color: string; bg: string }> = {
    high:   { label: 'Alta',  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    medium: { label: 'Média', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    low:    { label: 'Baixa', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  }

  const s = panelStyles

  return (
    <div style={s.overlay}>
      <div style={s.panel}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={s.header}>
          <span style={s.headerTitle}>
            <ChartBar size={16} weight="duotone" color="var(--accent)" /> Sugestões para o seu dashboard
          </span>
          <button type="button" style={s.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* ── Body (scrollável) ────────────────────────────────────────────── */}
        <div style={s.body}>
          <p style={s.hint}>Geradas automaticamente a partir das métricas do produto.</p>

          {/* ── Sugestões automáticas ──────────────────────────────────────── */}
          <div style={s.list}>
            {suggestions.map(sug => (
              <div key={sug.id} style={s.item}>
                <div style={s.itemLeft}>
                  <span style={{
                    ...s.badge,
                    color: confidenceMeta[sug.confidence]?.color,
                    background: confidenceMeta[sug.confidence]?.bg,
                  }}>
                    {confidenceMeta[sug.confidence]?.label ?? sug.confidence}
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

          {/* ── Métricas derivadas ─────────────────────────────────────────── */}
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
                          position: { x: 0, y: 12, w: 3, h: 2 },
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
        </div>

        {/* ── Footer fixo — criar widget do zero ──────────────────────────── */}
        {onCreateCustom && (
          <div style={s.footer}>
            <span style={s.footerText}>Não encontrou o que precisa?</span>
            <button
              type="button"
              style={s.footerBtn}
              onClick={() => { onCreateCustom(); onClose() }}
            >
              <PencilSimple size={13} /> Criar widget do zero
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

const panelStyles = {
  overlay: {
    position: 'fixed' as const, inset: 0,
    background: 'rgba(0,0,0,0.65)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    width: '100%', maxWidth: '680px', maxHeight: '82vh',
    overflowY: 'hidden' as const,
    boxShadow: 'var(--shadow-md)',
    display: 'flex', flexDirection: 'column' as const,
  },
  // Modal header — bg-surface + border-bottom (Design System § 14)
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-default)',
    flexShrink: 0,
  },
  headerTitle: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
    padding: '4px', borderRadius: 'var(--radius-sm)',
  },
  // Modal body — bg-base (Design System § 14)
  body: {
    flex: 1, overflowY: 'auto' as const,
    padding: '1.25rem 1.5rem',
  },
  hint: {
    fontSize: '0.8125rem', color: 'var(--text-secondary)',  /* #94a3b8 */
    marginBottom: '1rem', marginTop: 0,
  },
  list: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1rem', background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
    gap: '1rem',
  },
  itemLeft: { display: 'flex', flexDirection: 'column' as const, gap: '4px', minWidth: 0 },
  // Badge com fundo colorido (Design System § 5)
  badge: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
    padding: '2px 8px', borderRadius: '9999px',
    width: 'fit-content',
  },
  itemTitle: { fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 },
  itemDesc: { fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 },
  // DM Mono obrigatório para código (Design System § 2)
  itemFields: {
    fontSize: '0.75rem', color: 'var(--text-secondary)',  /* #94a3b8 */
    fontFamily: "'DM Mono', monospace",
  },
  // Botão pill (Design System: botões sempre pill)
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0,
    fontSize: '0.8125rem', padding: '5px 14px', borderRadius: '9999px',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 600,
  },
  divider: { height: '1px', background: 'var(--border-default)', margin: '1rem 0' },
  sectionTitle: {
    fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: 0,
  },
  // Modal footer — bg-surface + border-top (Design System § 14)
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '0.5rem', flexWrap: 'wrap' as const,
    padding: '1rem 1.5rem',
    background: 'var(--bg-surface)',
    borderTop: '1px solid var(--border-default)',
    flexShrink: 0,
  },
  footerText: { fontSize: '0.8125rem', color: 'var(--text-secondary)' },  /* #94a3b8 */
  footerBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '0.8125rem', fontWeight: 600, padding: '6px 14px',
    borderRadius: '9999px', cursor: 'pointer',
    background: 'transparent', border: '1px solid var(--border-accent)',
    color: 'var(--accent)',
  },
} as const

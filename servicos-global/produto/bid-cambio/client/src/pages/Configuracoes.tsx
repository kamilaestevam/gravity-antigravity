/**
 * Configuracoes.tsx — Preferencias do tenant para BID Cambio
 * Toggles para alertas, email, vencimentos
 *
 * Design System: Solid Slate, Plus Jakarta Sans, Lucide React icons
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Save,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Bell,
  Mail,
  CalendarClock,
  Send,
} from 'lucide-react'

import { getPreferencias, atualizarPreferencias } from '../shared/api'
import type { BidCambioPreferenciaUsuario } from '../shared/types'

// ─── Toggle Switch ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        width: 40,
        height: 22,
        borderRadius: 9999,
        border: 'none',
        background: checked ? 'var(--accent, #6366f1)' : 'var(--bg-elevated, #475569)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        transition: 'background 0.2s',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: checked ? 20 : 2,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        pointerEvents: 'none',
      }} />
    </button>
  )
}

// ─── Config Row ────────────────────────────────────────────────────────────

function ConfigRow({ icon, label, description, children }: {
  icon: React.ReactNode
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
      padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
        <div style={{ marginTop: 2, color: 'var(--text-muted, #64748b)' }}>{icon}</div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>{label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>{description}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {children}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--bg-elevated, #475569)', margin: '0 1.25rem' }} />
}

// ─── Componente Principal ──────────────────────────────────────────────────

interface LocalConfig {
  mostrarCambiosPagos: boolean
  alertarVencimentoEmail: boolean
  alertarVencimentoDias: number
  enviarEmailExportador: boolean
  enviarFimDeSemana: boolean
}

const DEFAULT_CONFIG: LocalConfig = {
  mostrarCambiosPagos: true,
  alertarVencimentoEmail: true,
  alertarVencimentoDias: 3,
  enviarEmailExportador: false,
  enviarFimDeSemana: false,
}

export default function Configuracoes() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<LocalConfig>(DEFAULT_CONFIG)
  const [originalConfig, setOriginalConfig] = useState<LocalConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const prefs = await getPreferencias()
      const loaded: LocalConfig = {
        mostrarCambiosPagos: prefs.mostrar_no_financeiro_preferencia_bid_cambio,
        alertarVencimentoEmail: prefs.alerta_email_vencimento_preferencia_bid_cambio,
        alertarVencimentoDias: prefs.dias_antecedencia_alerta_preferencia_bid_cambio ?? 3,
        enviarEmailExportador: prefs.enviar_email_exportador_preferencia_bid_cambio,
        enviarFimDeSemana: prefs.enviar_email_fim_de_semana_preferencia_bid_cambio,
      }
      setConfig(loaded)
      setOriginalConfig(loaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preferencias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(originalConfig)
  }, [config, originalConfig])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      await atualizarPreferencias({
        mostrar_no_financeiro_preferencia_bid_cambio: config.mostrarCambiosPagos,
        alerta_email_vencimento_preferencia_bid_cambio: config.alertarVencimentoEmail,
        dias_antecedencia_alerta_preferencia_bid_cambio: config.alertarVencimentoEmail ? config.alertarVencimentoDias : 0,
        enviar_email_exportador_preferencia_bid_cambio: config.enviarEmailExportador,
        enviar_email_fim_de_semana_preferencia_bid_cambio: config.enviarFimDeSemana,
      })
      setOriginalConfig(config)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }, [config])

  // ── Styles ─────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary, #f1f5f9)', maxWidth: 720, paddingBottom: '5rem',
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface, #334155)', borderRadius: 12, padding: '0.25rem 0',
  }

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Settings size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.configuracoes.titulo')}</h1>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ color: 'var(--accent, #6366f1)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.75rem' }}>{t('bidcambio.configuracoes.carregando')}</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error && !config) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Settings size={22} style={{ color: 'var(--accent, #6366f1)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.configuracoes.titulo')}</h1>
        </div>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
          <AlertTriangle size={32} style={{ color: 'var(--danger, #ef4444)' }} />
          <p style={{ fontWeight: 600, margin: '0.75rem 0 0.5rem' }}>{t('comum.erro_carregar')}</p>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{error}</p>
          <button onClick={carregar} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: 9999, fontSize: '0.875rem', fontWeight: 600,
            border: 'none', background: 'var(--accent, #6366f1)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <RefreshCw size={14} /> {t('comum.tentar_novamente')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Filled ────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Settings size={22} style={{ color: 'var(--accent, #6366f1)' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('bidcambio.configuracoes.titulo')}</h1>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>{t('bidcambio.configuracoes.preferencias_titulo')}</span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger, #ef4444)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--danger, #ef4444)' }}>{error}</span>
        </div>
      )}

      {/* Config Card */}
      <div style={cardStyle}>
        <ConfigRow
          icon={<CalendarClock size={16} />}
          label={t('bidcambio.configuracoes.mostrar_cambios_pagos')}
          description={t('bidcambio.configuracoes.mostrar_cambios_pagos_desc')}
        >
          <Toggle
            checked={config.mostrarCambiosPagos}
            onChange={(v) => setConfig({ ...config, mostrarCambiosPagos: v })}
            disabled={disabled}
          />
        </ConfigRow>

        <Divider />

        <ConfigRow
          icon={<Bell size={16} />}
          label={t('bidcambio.configuracoes.alertar_vencimentos')}
          description={t('bidcambio.configuracoes.alertar_vencimentos_desc')}
        >
          <Toggle
            checked={config.alertarVencimentoEmail}
            onChange={(v) => setConfig({ ...config, alertarVencimentoEmail: v })}
            disabled={disabled}
          />
        </ConfigRow>

        {config.alertarVencimentoEmail && (
          <>
            <Divider />
            <div style={{ padding: '0.75rem 1.25rem 0.75rem 3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>{t('bidcambio.configuracoes.alertar_com')}</span>
                <input
                  type="number"
                  value={config.alertarVencimentoDias}
                  onChange={(e) => setConfig({ ...config, alertarVencimentoDias: Math.max(1, Number(e.target.value) || 1) })}
                  min={1}
                  max={30}
                  disabled={disabled}
                  style={{
                    width: 60,
                    padding: '0.35rem 0.5rem',
                    borderRadius: 8,
                    border: '1px solid var(--bg-elevated, #475569)',
                    background: 'var(--bg-base, #1e293b)',
                    color: 'var(--text-primary, #f1f5f9)',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>{t('bidcambio.configuracoes.dias_antecedencia')}</span>
              </div>
            </div>
          </>
        )}

        <Divider />

        <ConfigRow
          icon={<Send size={16} />}
          label={t('bidcambio.configuracoes.enviar_email_exportador')}
          description={t('bidcambio.configuracoes.enviar_email_exportador_desc')}
        >
          <Toggle
            checked={config.enviarEmailExportador}
            onChange={(v) => setConfig({ ...config, enviarEmailExportador: v })}
            disabled={disabled}
          />
        </ConfigRow>

        <Divider />

        <ConfigRow
          icon={<Mail size={16} />}
          label={t('bidcambio.configuracoes.enviar_fins_semana')}
          description={t('bidcambio.configuracoes.enviar_fins_semana_desc')}
        >
          <Toggle
            checked={config.enviarFimDeSemana}
            onChange={(v) => setConfig({ ...config, enviarFimDeSemana: v })}
            disabled={disabled}
          />
        </ConfigRow>
      </div>

      {/* Save Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transform: isDirty ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        pointerEvents: isDirty ? 'auto' : 'none',
      }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.75rem 1.25rem',
          background: 'var(--bg-surface, #334155)',
          borderRadius: 12,
          border: '1px solid var(--bg-elevated, #475569)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
        }}>
          {savedMsg ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--success, #22c55e)' }}>
              <CheckCircle2 size={16} /> {t('bidcambio.configuracoes.salvas')}
            </span>
          ) : (
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--warning, #f59e0b)' }}>
              {t('bidcambio.configuracoes.nao_salvas')}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: 9999,
              fontSize: '0.875rem', fontWeight: 600,
              border: 'none', background: 'var(--accent, #6366f1)', color: '#fff',
              cursor: (saving || !isDirty) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: (saving || !isDirty) ? 0.5 : 1,
            }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? t('bidcambio.configuracoes.salvando') : t('bidcambio.configuracoes.salvar')}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

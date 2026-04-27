/**
 * ConfigCorretora.tsx — Portal da Corretora: Configuracoes e perfil
 * Dados da empresa (read-only), contato (editavel), moedas, toggle portal
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  User,
  Globe,
} from 'lucide-react'
import type { CambioMoeda } from '../../shared/types'
import { MOEDA_CAMBIO_LABELS } from '../../shared/types'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConfigData {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  email: string
  telefone: string
  contato_nome: string
  contato_cargo: string
  moedas_operadas: CambioMoeda[]
  portal_habilitado: boolean
}

type PageState = 'loading' | 'error' | 'empty' | 'filled' | 'disabled'

const MOEDAS_DISPONIVEIS: CambioMoeda[] = ['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY']

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    minHeight: '100vh',
    background: 'var(--bg-body-dark, #0f172a)',
    padding: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  headerIcon: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    color: 'var(--accent, #6366f1)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
  } as React.CSSProperties,
  card: {
    background: 'var(--bg-surface, #1e293b)',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.25rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--bg-base, #334155)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  } as React.CSSProperties,
  fieldWide: {
    gridColumn: '1 / -1',
  } as React.CSSProperties,
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary, #94a3b8)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  } as React.CSSProperties,
  input: {
    background: 'var(--bg-base, #334155)',
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f1f5f9)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  inputReadonly: {
    background: 'var(--bg-base, #334155)',
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted, #64748b)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'not-allowed',
    opacity: 0.7,
  } as React.CSSProperties,
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginTop: '0.75rem',
  } as React.CSSProperties,
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--text-secondary, #94a3b8)',
    userSelect: 'none' as const,
  } as React.CSSProperties,
  checkboxItemActive: {
    background: 'rgba(99,102,241,0.15)',
    color: 'var(--accent, #6366f1)',
    fontWeight: 600,
  } as React.CSSProperties,
  checkboxItemInactive: {
    background: 'var(--bg-base, #334155)',
  } as React.CSSProperties,
  checkbox: {
    width: 16,
    height: 16,
    accentColor: 'var(--accent, #6366f1)',
    cursor: 'pointer',
  } as React.CSSProperties,
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'var(--bg-base, #334155)',
    borderRadius: 8,
    marginTop: '0.75rem',
  } as React.CSSProperties,
  toggleLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
  } as React.CSSProperties,
  toggleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted, #64748b)',
    margin: 0,
  } as React.CSSProperties,
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 9999,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    position: 'relative' as const,
    flexShrink: 0,
  } as React.CSSProperties,
  toggleKnob: {
    position: 'absolute' as const,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
  } as React.CSSProperties,
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
    borderRadius: 9999,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'var(--accent, #6366f1)',
    color: '#fff',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  successMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--success, #22c55e)',
    marginTop: '0.75rem',
  } as React.CSSProperties,
  errorMsg: {
    fontSize: '0.8125rem',
    color: 'var(--danger, #ef4444)',
    background: 'rgba(239,68,68,0.1)',
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    marginTop: '0.75rem',
  } as React.CSSProperties,
  center: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '1rem',
    color: 'var(--text-muted, #64748b)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
} as const

// ─── Component ──────────────────────────────────────────────────────────────

interface ConfigCorretoraProps {
  disabled?: boolean
}

export default function ConfigCorretora({ disabled = false }: ConfigCorretoraProps) {
  const { t } = useTranslation()
  const [config, setConfig] = useState<ConfigData>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    contato_nome: '',
    contato_cargo: '',
    moedas_operadas: [],
    portal_habilitado: true,
  })
  const [pageState, setPageState] = useState<PageState>('loading')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    if (disabled) {
      setPageState('disabled')
      return
    }
    setPageState('loading')
    try {
      const { getPortalConfigCorretora } = await import('../../shared/api')
      const data = await getPortalConfigCorretora()
      const d = data as unknown as ConfigData
      setConfig(d)
      setPageState(d.razao_social ? 'filled' : 'empty')
    } catch {
      setPageState('error')
    }
  }, [disabled])

  useEffect(() => {
    carregar()
  }, [carregar])

  function handleChange(field: keyof ConfigData, value: string | boolean) {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setSucesso(false)
    setErro('')
  }

  function toggleMoeda(moeda: CambioMoeda) {
    setConfig((prev) => {
      const current = prev.moedas_operadas
      const next = current.includes(moeda)
        ? current.filter((m) => m !== moeda)
        : [...current, moeda]
      return { ...prev, moedas_operadas: next }
    })
    setSucesso(false)
    setErro('')
  }

  async function handleSave() {
    if (!config.email) {
      setErro(t('bidcambio.portal.config.erro_email'))
      return
    }
    setSalvando(true)
    setErro('')
    setSucesso(false)
    try {
      const { salvarPortalConfigCorretora } = await import('../../shared/api')
      await salvarPortalConfigCorretora({
        email: config.email,
        telefone: config.telefone,
        contato_nome: config.contato_nome,
        contato_cargo: config.contato_cargo,
        moedas_operadas: config.moedas_operadas,
        portal_habilitado: config.portal_habilitado,
      })
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar configuracoes')
    } finally {
      setSalvando(false)
    }
  }

  // ─── Render States ──────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Settings size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.config.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <Loader2 size={48} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
          <p>{t('bidcambio.portal.config.carregando')}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Settings size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.config.titulo')}</h1></div>
        </div>
        <div style={s.center}>
          <AlertCircle size={48} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
          <p style={{ color: 'var(--danger, #ef4444)' }}>{t('bidcambio.portal.config.erro_carregar')}</p>
          <button onClick={carregar} style={s.saveBtn}>{t('acoes.tentar_novamente')}</button>
        </div>
      </div>
    )
  }

  if (pageState === 'disabled') {
    return (
      <div style={{ ...s.page, opacity: 0.5, pointerEvents: 'none' }}>
        <div style={s.header}>
          <div style={s.headerIcon}><Settings size={22} /></div>
          <div><h1 style={s.title}>{t('bidcambio.portal.config.titulo')}</h1><p style={s.subtitle}>{t('comum.desabilitado')}</p></div>
        </div>
        <div style={s.center}>
          <Settings size={48} style={{ opacity: 0.3 }} />
          <p>{t('comum.funcionalidade_desabilitada')}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'empty') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.headerIcon}><Settings size={22} /></div>
          <div>
            <h1 style={s.title}>{t('bidcambio.portal.config.titulo')}</h1>
            <p style={s.subtitle}>{t('bidcambio.portal.config.perfil_corretora')}</p>
          </div>
        </div>
        <div style={s.center}>
          <Building2 size={48} style={{ opacity: 0.3 }} />
          <p>{t('bidcambio.portal.config.nenhum_dado')}</p>
        </div>
      </div>
    )
  }

  // ─── Filled State ───────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerIcon}><Settings size={22} /></div>
        <div>
          <h1 style={s.title}>{t('bidcambio.portal.config.titulo')}</h1>
          <p style={s.subtitle}>{t('bidcambio.portal.config.gerencie')}</p>
        </div>
      </div>

      {/* {t('bidcambio.portal.config.dados_empresa')} (read-only) */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>
          <Building2 size={16} />
          {t('bidcambio.portal.config.dados_empresa')}
        </h3>
        <div style={s.formGrid}>
          <div style={s.field}>
            <label style={s.label}>{t('bidcambio.portal.config.razao_social')}</label>
            <input style={s.inputReadonly} value={config.razao_social} readOnly />
          </div>
          <div style={s.field}>
            <label style={s.label}>{t('bidcambio.portal.config.nome_fantasia')}</label>
            <input style={s.inputReadonly} value={config.nome_fantasia} readOnly />
          </div>
          <div style={s.field}>
            <label style={s.label}>{t('bidcambio.portal.config.cnpj')}</label>
            <input style={s.inputReadonly} value={config.cnpj} readOnly />
          </div>
        </div>
      </div>

      {/* {t('bidcambio.portal.config.contato')} (editavel) */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>
          <User size={16} />
          {t('bidcambio.portal.config.contato')}
        </h3>
        <div style={s.formGrid}>
          <div style={s.field}>
            <label style={s.label}>
              <Mail size={12} /> Email *
            </label>
            <input
              style={s.input}
              type="email"
              value={config.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@corretora.com.br"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>
              <Phone size={12} /> Telefone
            </label>
            <input
              style={s.input}
              type="tel"
              value={config.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Nome do {t('bidcambio.portal.config.contato')}</label>
            <input
              style={s.input}
              type="text"
              value={config.contato_nome}
              onChange={(e) => handleChange('contato_nome', e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>{t('bidcambio.portal.config.cargo')}</label>
            <input
              style={s.input}
              type="text"
              value={config.contato_cargo}
              onChange={(e) => handleChange('contato_cargo', e.target.value)}
              placeholder="Ex: Gerente de Mesa"
            />
          </div>
        </div>
      </div>

      {/* {t('bidcambio.portal.config.moedas_operadas')} */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>
          <Globe size={16} />
          {t('bidcambio.portal.config.moedas_operadas')}
        </h3>
        <div style={s.checkboxGrid}>
          {MOEDAS_DISPONIVEIS.map((moeda) => {
            const ativo = config.moedas_operadas.includes(moeda)
            return (
              <label
                key={moeda}
                style={{
                  ...s.checkboxItem,
                  ...(ativo ? s.checkboxItemActive : s.checkboxItemInactive),
                }}
              >
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={() => toggleMoeda(moeda)}
                  style={s.checkbox}
                />
                {moeda} — {MOEDA_CAMBIO_LABELS[moeda]}
              </label>
            )
          })}
        </div>
      </div>

      {/* Portal Toggle */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>
          <Settings size={16} />
          Portal
        </h3>
        <div style={s.toggleRow}>
          <div>
            <div style={s.toggleLabel}>{t('bidcambio.portal.config.portal_habilitado')}</div>
            <p style={s.toggleDesc}>{t('bidcambio.portal.config.portal_desc')}</p>
          </div>
          <button
            style={{
              ...s.toggle,
              background: config.portal_habilitado ? 'var(--accent, #6366f1)' : 'var(--bg-base, #334155)',
            }}
            onClick={() => handleChange('portal_habilitado', !config.portal_habilitado)}
            type="button"
          >
            <div style={{
              ...s.toggleKnob,
              left: config.portal_habilitado ? 22 : 2,
            }} />
          </button>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          style={{
            ...s.saveBtn,
            opacity: salvando ? 0.6 : 1,
            cursor: salvando ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSave}
          disabled={salvando}
        >
          <Save size={16} />
          {salvando ? t('bidcambio.portal.config.salvando') : t('bidcambio.portal.config.salvar')}
        </button>

        {sucesso && (
          <div style={s.successMsg}>
            <CheckCircle size={16} />
            {t('bidcambio.portal.config.sucesso')}
          </div>
        )}
      </div>

      {erro && <p style={s.errorMsg}>{erro}</p>}
    </div>
  )
}

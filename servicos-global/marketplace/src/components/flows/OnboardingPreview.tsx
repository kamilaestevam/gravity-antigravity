import { useState, useEffect } from 'react'
import {
  X,
  Palette,
  CheckCircle,
  Lightning,
  ChartBar,
  Code,
  Pencil,
  Briefcase,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useTranslation } from 'react-i18next'

interface OnboardingPreviewProps {
  open: boolean
  onClose: () => void
}

type AccentColor = '#818cf8' | '#818cf8' | '#34d399' | '#f472b6' | '#fb923c'
type UserProfile = 'Dev' | 'Designer' | 'Manager' | null

export function OnboardingPreview({ open, onClose }: OnboardingPreviewProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [accent, setAccent] = useState<AccentColor>('#818cf8')
  const [profile, setProfile] = useState<UserProfile>(null)
  const [previewAccent, setPreviewAccent] = useState<AccentColor | null>(null)

  const ACCENT_COLORS: { value: AccentColor; label: string }[] = [
    { value: '#818cf8', label: t('marketplace.onboarding.azul_ceu') },
    { value: '#818cf8', label: t('marketplace.onboarding.violeta') },
    { value: '#34d399', label: t('marketplace.onboarding.esmeralda') },
    { value: '#f472b6', label: t('marketplace.onboarding.rosa') },
    { value: '#fb923c', label: t('marketplace.onboarding.ambar') },
  ]

  const STEPS = [
    t('marketplace.onboarding.passo_personalizar'),
    t('marketplace.onboarding.passo_perfil'),
    t('marketplace.onboarding.passo_dashboard'),
  ]

  const MOCK_ACTIVITIES = [
    { id: 1, label: t('marketplace.onboarding.atividade_proposta'), value: 'R$ 48.000', status: 'success' },
    { id: 2, label: t('marketplace.onboarding.atividade_reuniao'), value: 'Amanhã 14h', status: 'warning' },
    { id: 3, label: t('marketplace.onboarding.atividade_simulacao'), value: '3 itens', status: 'accent' },
  ]

  const previewTabs = [
    t('marketplace.onboarding.tab_atividades'),
    t('marketplace.onboarding.tab_relatorios'),
    t('marketplace.onboarding.tab_email'),
  ]

  // Volta ao step 0 ao abrir
  useEffect(() => {
    if (open) {
      setStep(0)
      setProfile(null)
    }
  }, [open])

  const currentAccent = previewAccent ?? accent

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 60,
          animation: 'fade-up 0.2s ease',
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Modal enxuto — Fluxo A */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('marketplace.onboarding.aria_label')}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-base)',
          border: '1px solid var(--bg-elevated)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          zIndex: 61,
          overflow: 'hidden',
          animation: 'fade-up 0.25s ease',
        }}
      >
        {/* Header do Modal */}
        <div className="modal-header" style={{ background: 'var(--bg-surface)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Stepper */}
          <div className="stepper" style={{ flex: 1, maxWidth: '260px' }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div
                    className={`step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}
                    style={i === step ? { background: currentAccent, color: '#0f172a' } : {}}
                  >
                    {i < step ? <CheckCircle size={14} weight="bold" /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, color: i === step ? currentAccent : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`step-connector ${i < step ? 'done' : ''}`}
                    style={{ marginBottom: '1rem', ...(i < step ? { background: 'var(--success)' } : {}) }}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label={t('marketplace.onboarding.fechar')}
            style={{ padding: '0.375rem', marginLeft: '1rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem 1.5rem', background: 'var(--bg-base)' }}>
          {/* Passo 1 — Personalizar */}
          {step === 0 && (
            <div>
              <Palette size={32} color={currentAccent} weight="duotone" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('marketplace.onboarding.qual_cara')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {t('marketplace.onboarding.escolha_cor')}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(c => (
                  <TooltipGlobal key={c.value} descricao={c.label}>
                    <button
                      onClick={() => { setAccent(c.value); setPreviewAccent(null) }}
                      onMouseEnter={() => setPreviewAccent(c.value)}
                      onMouseLeave={() => setPreviewAccent(null)}
                      aria-label={c.label}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        minWidth: '2.5rem',
                        flexShrink: 0,
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        background: c.value,
                        boxShadow: accent === c.value
                          ? `0 0 0 3px var(--bg-base), 0 0 0 5px ${c.value}`
                          : 'none',
                        transform: accent === c.value ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  </TooltipGlobal>
                ))}
              </div>

              {/* Preview do sistema repintado */}
              <div style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${currentAccent}30`,
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Lightning size={16} color={currentAccent} weight="duotone" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: currentAccent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('marketplace.onboarding.preview_tempo_real')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <div style={{ height: '8px', flex: 3, background: currentAccent, borderRadius: '99px', opacity: 0.9 }} />
                  <div style={{ height: '8px', flex: 2, background: 'var(--bg-elevated)', borderRadius: '99px' }} />
                  <div style={{ height: '8px', flex: 1, background: 'var(--bg-elevated)', borderRadius: '99px' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {previewTabs.map((tab, idx) => (
                    <span
                      key={tab}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: idx === 0 ? `${currentAccent}20` : 'transparent',
                        color: idx === 0 ? currentAccent : 'var(--text-muted)',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: idx === 0 ? `1px solid ${currentAccent}40` : '1px solid transparent',
                      }}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              <TooltipGlobal descricao={t('marketplace.onboarding.tooltip_avancar')}>
                <button
                  className="btn btn-primary"
                  id="onboarding-next-step1"
                  onClick={() => setStep(1)}
                  style={{ background: currentAccent, width: '100%', justifyContent: 'center' }}
                >
                  {t('marketplace.onboarding.ficou_perfeito')}
                </button>
              </TooltipGlobal>
            </div>
          )}

          {/* Passo 2 — Perfil */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t('marketplace.onboarding.voce_e')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {t('marketplace.onboarding.personalizar_experiencia')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {([
                  { value: 'Dev', label: t('marketplace.onboarding.dev_label'), desc: t('marketplace.onboarding.dev_desc'), icon: <Code size={24} weight="duotone" /> },
                  { value: 'Designer', label: t('marketplace.onboarding.designer_label'), desc: t('marketplace.onboarding.designer_desc'), icon: <Pencil size={24} weight="duotone" /> },
                  { value: 'Manager', label: t('marketplace.onboarding.manager_label'), desc: t('marketplace.onboarding.manager_desc'), icon: <Briefcase size={24} weight="duotone" /> },
                ] as { value: UserProfile; label: string; desc: string; icon: React.ReactNode }[]).map(opt => (
                  <button
                    key={opt.value}
                    id={`profile-${opt.value?.toLowerCase()}`}
                    onClick={() => setProfile(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      background: profile === opt.value ? `${currentAccent}15` : 'var(--bg-surface)',
                      border: `2px solid ${profile === opt.value ? currentAccent : 'var(--bg-elevated)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ color: profile === opt.value ? currentAccent : 'var(--text-muted)' }}>
                      {opt.icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {opt.desc}
                      </div>
                    </div>
                    {profile === opt.value && (
                      <CheckCircle size={20} color={currentAccent} weight="fill" style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                ))}
              </div>

              <TooltipGlobal descricao={t('marketplace.onboarding.tooltip_finalizar')}>
                <button
                  className="btn btn-primary"
                  id="onboarding-next-step2"
                  onClick={() => setStep(2)}
                  disabled={!profile}
                  style={{ background: currentAccent, width: '100%', justifyContent: 'center' }}
                >
                  {t('marketplace.onboarding.continuar')}
                </button>
              </TooltipGlobal>
            </div>
          )}

          {/* Passo 3 — Dashboard com mock data */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <CheckCircle size={28} color="var(--success)" weight="duotone" />
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {t('marketplace.onboarding.workspace_pronto')}
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('marketplace.onboarding.dados_reais')}</p>
                </div>
              </div>

              {/* KPI Cards Mock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: t('marketplace.onboarding.kpi_receita'), value: 'R$ 284k', icon: <ChartBar size={16} weight="duotone" /> },
                  { label: t('marketplace.onboarding.kpi_atividades'), value: '47', icon: <Lightning size={16} weight="duotone" /> },
                ].map(kpi => (
                  <div key={kpi.label} className="kpi-card" style={{ padding: '1rem' }}>
                    <span style={{ color: currentAccent }}>{kpi.icon}</span>
                    <p className="kpi-label">{kpi.label}</p>
                    <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Atividades mock */}
              <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                {MOCK_ACTIVITIES.map((a, i) => (
                  <div key={a.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderBottom: i < MOCK_ACTIVITIES.length - 1 ? '1px solid var(--bg-elevated)' : 'none',
                  }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{a.label}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '99px',
                      background: a.status === 'success' ? 'var(--success-10)' : a.status === 'warning' ? 'var(--warning-10)' : `${currentAccent}20`,
                      color: a.status === 'success' ? 'var(--success)' : a.status === 'warning' ? 'var(--warning)' : currentAccent,
                    }}>
                      {a.value}
                    </span>
                  </div>
                ))}
              </div>

              <TooltipGlobal descricao={t('marketplace.onboarding.tooltip_iniciar_trial')}>
                <a
                  href={`${import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.usegravity.com.br'}/trial?trial=true&profile=${profile?.toLowerCase()}`}
                  className="btn btn-gradient"
                  id="onboarding-start-trial"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {t('marketplace.onboarding.comecar_trial')}
                </a>
              </TooltipGlobal>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.625rem' }}>
                {t('marketplace.onboarding.sem_cartao')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

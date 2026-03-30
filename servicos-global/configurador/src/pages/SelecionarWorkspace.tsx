import React, { useState, useEffect } from 'react'
import { useClerk, useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  UserPlus,
  Envelope,
  CheckCircle,
  Sparkle,
  ShieldCheck,
  SpinnerGap,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import './workspace/workspace.css'

interface Empresa {
  id: string
  nome: string
}

type Step = 'loading' | 'select' | 'workspace' | 'usuario'

export function SelecionarWorkspace() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('loading')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [workspaceName, setWorkspaceName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = user?.publicMetadata?.role === 'gravity_admin'

  // Verifica se o user tem tenant e empresas
  useEffect(() => {
    async function checkTenantAndCompanies() {
      try {
        const token = await getToken()
        const res = await fetch('/api/v1/tenants/companies', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // User sem tenant no DB → precisa fazer onboarding
        if (res.status === 401) {
          navigate('/trial', { replace: true })
          return
        }

        if (res.ok) {
          const data = await res.json()
          const mapped = (data.companies || []).map((c: any) => ({
            id: c.id,
            nome: c.name,
          }))
          setEmpresas(mapped)

          if (mapped.length === 1) {
            // Auto-seleciona se so tem 1 workspace
            sessionStorage.setItem('gravity_company_id', mapped[0].id)
            sessionStorage.setItem('gravity_company_name', mapped[0].nome)
            navigate('/hub', { replace: true })
            return
          }

          if (mapped.length > 1) {
            setStep('select')
          } else {
            // Tenant existe mas sem companies (edge case)
            setStep('workspace')
          }
        } else {
          // Resposta nao-ok (500, 403, etc) — vai para onboarding
          console.error('[SelecionarWorkspace] API retornou status', res.status)
          setStep('workspace')
        }
      } catch (err) {
        console.error('[SelecionarWorkspace] Erro:', err)
        setStep('workspace')
      }
    }
    checkTenantAndCompanies()
  }, [getToken, navigate])

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = await getToken()
      const res = await fetch('/api/v1/tenants/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: workspaceName }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Erro ao criar workspace')
      }

      const data = await res.json()
      const id = data.company?.id || data.id
      sessionStorage.setItem('gravity_company_id', id)
      sessionStorage.setItem('gravity_company_name', workspaceName)

      setStep('usuario')
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = await getToken()
      const res = await fetch('/api/v1/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteEmail.split('@')[0],
          role: 'STANDARD',
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Erro ao convidar usuario')
      }

      navigate('/hub')
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  function handleSkipInvite() {
    navigate('/hub')
  }

  function handleVoltar() {
    if (step === 'usuario') {
      setStep('workspace')
      setError('')
    } else {
      signOut({ redirectUrl: '/sign-in' })
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font)',
      padding: '1.5rem',
      position: 'relative',
    }}>

      {/* Gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 70%)',
        }} />
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid rgba(129,140,248,0.12)',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative',
        animation: 'swFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

        {/* Botao voltar */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <TooltipGlobal descricao={step === 'usuario' ? 'Voltar para workspace' : 'Voltar para login'}>
            <button
              type="button"
              onClick={handleVoltar}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'
                e.currentTarget.style.color = '#818cf8'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
              aria-label="Voltar"
            >
              <ArrowLeft weight="bold" size={14} />
            </button>
          </TooltipGlobal>
        </div>

        {/* Step indicator */}
        <div style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.375rem',
        }}>
          <div style={{
            width: 24, height: 4, borderRadius: 2,
            background: '#818cf8',
            transition: 'all 0.3s',
          }} />
          <div style={{
            width: 24, height: 4, borderRadius: 2,
            background: step === 'usuario' ? '#818cf8' : 'rgba(255,255,255,0.08)',
            transition: 'all 0.3s',
          }} />
        </div>

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
            <SpinnerGap size={28} className="hs-spin" color="#818cf8" />
          </div>
        )}

        {/* ── SELECT: escolher entre workspaces existentes ── */}
        {step === 'select' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 48, borderRadius: '14px',
                background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                marginBottom: '1.25rem',
              }}>
                <Buildings weight="duotone" size={24} color="#818cf8" />
              </div>

              <h1 style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.02em',
              }}>
                Selecionar workspace
              </h1>
              <p style={{
                fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                margin: '0 auto', maxWidth: '380px',
              }}>
                Escolha o workspace que deseja acessar
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {empresas.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('gravity_company_id', emp.id)
                    sessionStorage.setItem('gravity_company_name', emp.nome)
                    navigate('/hub')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    width: '100%', padding: '1rem 1.25rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#f1f5f9', fontSize: '0.9375rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font)',
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(129,140,248,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'rgba(129,140,248,0.15)',
                    color: '#818cf8', fontWeight: 700, fontSize: '0.8125rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {emp.nome.substring(0, 2).toUpperCase()}
                  </div>
                  {emp.nome}
                </button>
              ))}
            </div>

            <BotaoGlobal
              variante="secundario"
              blocoCompleto
              centralizado
              onClick={() => setStep('workspace')}
              icone={<Buildings weight="bold" size={14} />}
            >
              Criar novo workspace
            </BotaoGlobal>
          </>
        )}

        {/* ── STEP 1: Criar workspace ── */}
        {step === 'workspace' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 48, borderRadius: '14px',
                background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                marginBottom: '1.25rem',
              }}>
                <Buildings weight="duotone" size={24} color="#818cf8" />
              </div>

              <h1 style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.02em',
              }}>
                Crie seu primeiro workspace
              </h1>
              <p style={{
                fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                margin: '0 auto', maxWidth: '380px',
              }}>
                Digite o nome da sua empresa para comecar.
                Seus dados, produtos e equipe ficam organizados dentro do workspace.
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <GeralCampoGlobal
                label="Nome do workspace"
                obrigatorio
                tooltipTitulo="Workspace"
                tooltipDescricao="Pode ser o nome da sua empresa, filial ou divisao. Voce pode criar mais workspaces depois."
              >
                <div className="ws-input-icon-wrap">
                  <Buildings size={16} />
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    placeholder="Ex: Matriz Sao Paulo"
                    autoFocus
                  />
                </div>
              </GeralCampoGlobal>

              <BotaoGlobal
                variante="primario"
                blocoCompleto
                centralizado
                disabled={loading || !workspaceName.trim()}
                type="submit"
                icone={!loading ? <ArrowRight weight="bold" size={14} /> : undefined}
              >
                {loading ? 'Criando...' : 'Continuar'}
              </BotaoGlobal>
            </form>

            <div style={{
              display: 'flex', justifyContent: 'center', marginTop: '1.5rem',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
                fontSize: '0.75rem', fontWeight: 500,
                color: '#818cf8', letterSpacing: '0.01em',
              }}>
                <Sparkle weight="fill" size={12} />
                Voce pode criar mais workspaces depois
              </span>
            </div>

            {/* Gabi Insight Card */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('gabi:open', { detail: { message: 'O que e um workspace?' } })
                )
              }}
              style={{
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                width: '100%', marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)',
                border: 'none', borderRadius: '14px',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font)',
                transition: 'all 0.2s',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Background glow */}
              <div style={{
                position: 'absolute', top: '-50%', right: '-20%',
                width: '60%', height: '200%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                position: 'relative',
              }}>
                <Sparkle weight="fill" size={14} color="rgba(255,255,255,0.9)" />
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 700,
                  color: 'rgba(255,255,255,0.85)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Gabi IA
                </span>
              </div>

              <p style={{
                fontSize: '0.8125rem', fontWeight: 500,
                color: '#fff', lineHeight: 1.55,
                margin: 0, position: 'relative',
              }}>
                Primeira vez na plataforma? Posso te explicar o que e um workspace,
                como organizar sua empresa e por onde comecar.
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                alignSelf: 'flex-end', position: 'relative',
                padding: '0.3125rem 0.75rem',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                fontSize: '0.75rem', fontWeight: 600,
                color: '#fff',
              }}>
                Me explica
                <ArrowRight weight="bold" size={12} />
              </div>
            </button>
          </>
        )}

        {/* ── STEP 2: Convidar usuario ── */}
        {step === 'usuario' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 48, borderRadius: '14px',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                marginBottom: '1.25rem',
              }}>
                <UserPlus weight="duotone" size={24} color="#34d399" />
              </div>

              <h1 style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.02em',
              }}>
                Convide alguem do time
              </h1>
              <p style={{
                fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                margin: '0 auto', maxWidth: '380px',
              }}>
                Usuarios sao as pessoas que vao acessar o workspace com voce.
                Cada um tem seu proprio login e permissoes.
              </p>
            </div>

            {/* Workspace criado — feedback */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(52,211,153,0.06)',
              border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.8125rem',
              color: '#34d399',
            }}>
              <CheckCircle weight="fill" size={18} />
              <span>
                Workspace <strong>{workspaceName}</strong> criado com sucesso
              </span>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <GeralCampoGlobal
                label="E-mail do colega"
                tooltipTitulo="Convite"
                tooltipDescricao="Ele vai receber um e-mail para criar a conta e acessar o workspace"
              >
                <div className="ws-input-icon-wrap">
                  <Envelope size={16} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colega@empresa.com"
                    autoFocus
                  />
                </div>
              </GeralCampoGlobal>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <BotaoGlobal
                  variante="secundario"
                  blocoCompleto
                  centralizado
                  onClick={handleSkipInvite}
                  type="button"
                >
                  Pular por agora
                </BotaoGlobal>

                <BotaoGlobal
                  variante="primario"
                  blocoCompleto
                  centralizado
                  disabled={loading || !inviteEmail.trim()}
                  type="submit"
                  icone={!loading ? <UserPlus weight="bold" size={14} /> : undefined}
                >
                  {loading ? 'Enviando...' : 'Convidar e entrar'}
                </BotaoGlobal>
              </div>
            </form>

            <div style={{
              display: 'flex', justifyContent: 'center', marginTop: '1.5rem',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
                fontSize: '0.75rem', fontWeight: 500,
                color: '#818cf8', letterSpacing: '0.01em',
              }}>
                <Sparkle weight="fill" size={12} />
                Voce pode convidar mais pessoas depois nas configuracoes
              </span>
            </div>
          </>
        )}

        {/* Admin access */}
        {isAdmin && step === 'workspace' && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(129,140,248,0.08)' }}>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                width: '100%', padding: '0.8125rem',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px',
                color: '#10b981', fontSize: '0.875rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all 0.15s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <ShieldCheck weight="duotone" size={20} />
              Acessar Painel Admin
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes swFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

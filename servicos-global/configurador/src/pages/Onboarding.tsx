import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser, SignIn, useAuth, useClerk } from '@clerk/clerk-react'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Storefront, Buildings, ArrowLeft, Sparkle, RocketLaunch, Users, ShoppingBagOpen } from '@phosphor-icons/react'
import './workspace/workspace.css'

export function Onboarding() {
  const { t } = useTranslation()
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (!isLoaded) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>{t('comum.carregando')}</div>

  if (!isSignedIn || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <SignIn routing="hash" />
      </div>
    )
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = await getToken()

      const slug = companyName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const payload = {
        name: companyName,
        slug,
        clerkUserId: user?.id ?? '',
        owner: {
          email: user?.primaryEmailAddress?.emailAddress ?? '',
          name: user?.fullName ?? user?.firstName ?? 'Usuario',
        },
      }

      const res = await fetch('/api/v1/organizacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Falha ao criar a organizacao. Tente um nome diferente.')
      }

      // Sucesso — redireciona para selecionar workspace (que agora tem 1 company)
      window.location.href = '/selecionar-workspace'

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Verifique a conexao com o servidor.')
    } finally {
      setLoading(false)
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
    }}>
      {/* Orbs de fundo */}
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

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid rgba(129,140,248,0.12)',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative',
        animation: 'onbFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <TooltipGlobal descricao="Voltar para login">
            <button
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
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
              aria-label="Voltar para login"
            >
              <ArrowLeft weight="bold" size={14} />
            </button>
          </TooltipGlobal>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.02em',
          }}>
            Bem-vindo a bordo, {user.firstName}! 🚀
          </h1>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            margin: '0 auto',
          }}>
            Digite o nome da empresa que esta contratando a plataforma
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

        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GeralCampoGlobal
            label="Nome da empresa"
            obrigatorio
            tooltipTitulo="Organizacao"
            tooltipDescricao="Este sera o nome da sua organizacao na plataforma. Voce pode alterar depois."
          >
            <div className="ws-input-icon-wrap">
              <Buildings size={16} />
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ex: Empresa ABC Ltda."
                autoFocus
              />
            </div>
          </GeralCampoGlobal>

          <BotaoGlobal
            variante="primario"
            blocoCompleto
            centralizado
            disabled={loading || !companyName.trim()}
            type="submit"
            icone={!loading ? <Storefront weight="duotone" size={14} /> : undefined}
          >
            {loading ? 'Criando...' : 'Ir para Gravity Store'}
          </BotaoGlobal>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '1.5rem',
        }}>
          <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.15)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#818cf8',
              letterSpacing: '0.01em',
            }}>
            ✦ 14 dias gratis para explorar — sem compromisso
          </span>
        </div>

      </div>

      {/* GABI AI — card de boas-vindas (canto superior direito) */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        width: '300px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '20px',
        padding: '1.25rem 1.5rem',
        color: '#fff',
        boxShadow: '0 12px 32px rgba(79,70,229,0.4)',
        overflow: 'hidden',
        animation: 'onbFadeUp 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both',
        zIndex: 10,
      }}>
        {/* watermark */}
        <div style={{ position: 'absolute', top: '50%', right: '-30px', transform: 'translateY(-50%) rotate(15deg)', color: 'rgba(255,255,255,0.05)', pointerEvents: 'none', lineHeight: 0 }}>
          <Sparkle weight="fill" size={160} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 26, height: 26, borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', top: '-1px' }}>
                <Sparkle weight="fill" size={13} color="#fff" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>GABI AI · Insights</span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px rgba(255,255,255,0.8)', animation: 'onbLivePulse 2s ease infinite', display: 'inline-block' }} />
              ao vivo
            </span>
          </div>

          {/* Dicas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {/* Dica 1 */}
            <div style={{ background: 'rgba(10,4,20,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5f3fc' }}>
                <RocketLaunch size={11} weight="fill" />
                Passo 1 · Configurar
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Digite o <strong style={{ color: '#fff' }}>nome da sua empresa</strong> ao lado para criar sua organização na plataforma.
              </p>
            </div>

            {/* Dica 2 */}
            <div style={{ background: 'rgba(10,4,20,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5f3fc' }}>
                <ShoppingBagOpen size={11} weight="fill" />
                Passo 2 · Explorar
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Na <strong style={{ color: '#fff' }}>Gravity Store</strong> você encontra módulos para câmbio, frete, fiscal e muito mais.
              </p>
            </div>

            {/* Dica 3 */}
            <div style={{ background: 'rgba(10,4,20,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5f3fc' }}>
                <Users size={11} weight="fill" />
                Passo 3 · Equipe
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                Após criar sua organização, <strong style={{ color: '#fff' }}>convide sua equipe</strong> e defina permissões por perfil.
              </p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes onbFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes onbLivePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}

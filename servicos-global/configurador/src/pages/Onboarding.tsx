import { useState } from 'react'
import { useUser, SignIn, useAuth } from '@clerk/clerk-react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ArrowRight, Buildings } from '@phosphor-icons/react'
import './workspace/workspace.css'

export function Onboarding() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isLoaded) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Carregando...</div>

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

      const res = await fetch('/api/v1/tenants', {
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

    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Verifique a conexao com o servidor.')
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

          <TooltipGlobal descricao="Criar sua organizacao e explorar os modulos disponiveis na Gravity Store">
            <div style={{ width: '100%' }}>
              <BotaoGlobal
                variante="primario"
                blocoCompleto
                centralizado
                disabled={loading || !companyName.trim()}
                type="submit"
              >
                {loading ? 'Criando...' : (
                  <>
                    Ir para Gravity Store <ArrowRight weight="bold" size={16} />
                  </>
                )}
              </BotaoGlobal>
            </div>
          </TooltipGlobal>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#475569',
          marginTop: '1.5rem',
          lineHeight: 1.5,
        }}>
          14 dias gratis para explorar. Sem compromisso.
        </p>
      </div>

      <style>{`
        @keyframes onbFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

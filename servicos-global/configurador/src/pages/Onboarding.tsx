import { useState } from 'react'
import { useUser, SignIn, useAuth } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export function Onboarding() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const [searchParams] = useSearchParams()
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const produto = searchParams.get('produto') || 'simulador-comex'
  const plano = searchParams.get('plano') || 'profissional'

  if (!isLoaded) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Carregando Segurança...</div>

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

      // Gera slug a partir do nome: lowercase, sem espaços, sem caracteres especiais
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
          name: user?.fullName ?? user?.firstName ?? 'Usuário',
        },
      }
      
      const res = await fetch('/api/v1/tenants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Falha ao criar o Workspace. Tente um nome diferente.')
      }

      const { tenant } = await res.json()

      // Tenta criar sessão de checkout no Stripe
      const checkoutRes = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          tenantId: tenant?.id,
          priceId: `price_${plano}`,
          successUrl: `${window.location.origin}/admin`,
          cancelUrl: window.location.href
        })
      })
      
      const checkout = await checkoutRes.json().catch(() => ({}))
      
      if (checkout.url) {
        window.location.href = checkout.url
      } else {
        // Sem chave Stripe real → vai para o Hub do workspace
        window.location.href = '/hub'
      }

    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Verifique a conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '80px auto', padding: 48, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <h1 style={{ marginBottom: 16, fontSize: '28px' }}>Bem-vindo a bordo, {user.firstName}! 🚀</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 40, fontSize: '16px', lineHeight: 1.6 }}>
        Você está prestes a assinar o <strong>{String(produto).toUpperCase()}</strong> no plano <em>{String(plano)}</em>. Para prosseguir, só precisamos saber o nome do seu novo QG (seu Workspace/Empresa).
      </p>

      {error && <div style={{ background: 'var(--color-danger)', padding: 16, borderRadius: 8, marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>Qual o nome espetacular da sua Empresa?</label>
          <input 
            type="text" 
            required
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 20px', 
              background: 'var(--color-surface-2)', 
              border: '2px solid var(--color-border)', 
              outline: 'none',
              borderRadius: 12, color: 'white', fontSize: 16,
              transition: 'border-color 0.2s'
            }} 
            placeholder="Ex: Minha Empresa Inovadora LTDA"
          />
        </div>

        <TooltipGlobal descricao="Prosseguir para a etapa de faturamento e configuração do seu workspace">
          <button 
            type="submit" 
            disabled={loading || !companyName}
            style={{ 
              marginTop: 16,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))', 
              color: 'white', 
              padding: '16px 32px', borderRadius: 12, border: 'none', 
              fontSize: 18, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              width: '100%'
            }}
          >
            {loading ? 'Preparando os Motores...' : 'Ir para o Pagamento'}
          </button>
        </TooltipGlobal>
      </form>
    </div>
  )
}

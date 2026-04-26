import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser, SignIn, useAuth, useClerk } from '@clerk/clerk-react'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Storefront, Buildings, IdentificationCard, ArrowLeft, Sparkle, RocketLaunch, Users, ShoppingBagOpen, ArrowRight } from '@phosphor-icons/react'
import './workspace/workspace.css'

// ─── Helpers de CNPJ (inline — evita dependência de @nucleo/utils) ────────────

function mascararCNPJ(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function validarCNPJ(cnpj: string): boolean {
  const numeros = cnpj.replace(/\D/g, '')
  if (numeros.length !== 14) return false
  if (/^(\d)\1+$/.test(numeros)) return false
  const calcDig = (base: string, pesos: number[]): number => {
    const soma = base.split('').reduce((acc, n, i) => acc + parseInt(n) * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  const d1 = calcDig(numeros.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2])
  if (d1 !== parseInt(numeros[12])) return false
  const d2 = calcDig(numeros.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2])
  return d2 === parseInt(numeros[13])
}

export function Onboarding() {
  const { t } = useTranslation()
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [passo, setPasso] = useState<1 | 2>(1)
  const [companyName, setCompanyName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [cnpjTouched, setCnpjTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nomeValido = companyName.trim().length >= 2
  const cnpjValido = validarCNPJ(cnpj)
  const erroCnpjInline = cnpjTouched && cnpj.length > 0 && !cnpjValido
    ? 'CNPJ inválido. Verifique os dígitos.'
    : ''
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
        pais: 'BR',
        cnpj_organizacao: cnpj,
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
          <TooltipGlobal descricao={passo === 2 ? 'Voltar ao passo anterior' : 'Voltar para login'}>
            <button
              onClick={() => passo === 2 ? setPasso(1) : signOut({ redirectUrl: '/sign-in' })}
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.4 : 1,
              }}
              onMouseEnter={e => {
                if (loading) return
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'
                e.currentTarget.style.color = '#818cf8'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
              aria-label={passo === 2 ? 'Voltar ao passo anterior' : 'Voltar para login'}
            >
              <ArrowLeft weight="bold" size={14} />
            </button>
          </TooltipGlobal>
        </div>

        {/* Stepper 2 quadrados — canto superior-direito do modal, só visual */}
        <div
          role="progressbar"
          aria-label={`Passo ${passo} de 2`}
          aria-valuenow={passo}
          aria-valuemin={1}
          aria-valuemax={2}
          style={{
            position: 'absolute',
            top: '1.375rem',
            right: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <StepSquare ativo={passo === 1} concluido={passo > 1} />
          <StepSquare ativo={passo === 2} concluido={false} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.02em',
          }}>
            {passo === 1
              ? <>Bem-vindo a bordo, {user.firstName}! 🚀</>
              : <>Confirme o CNPJ da empresa</>}
          </h1>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            margin: '0 auto',
          }}>
            {passo === 1
              ? 'Digite o nome da empresa que esta contratando a plataforma'
              : <>Informe o CNPJ de <strong style={{ color: '#f1f5f9' }}>{companyName}</strong></>}
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

        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Slot único: troca o campo conforme o passo. O modal mantém tamanho
              pois ambos os campos usam o mesmo wrapper de altura fixa. */}
          <div
            key={passo}
            style={{ animation: 'onbStepSlide 0.28s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            {passo === 1 && (
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
                    onKeyDown={e => {
                      if (e.key === 'Enter' && nomeValido) {
                        e.preventDefault()
                        setPasso(2)
                      }
                    }}
                  />
                </div>
              </GeralCampoGlobal>
            )}

            {passo === 2 && (
              <GeralCampoGlobal
                label="CNPJ da empresa"
                obrigatorio
                tooltipTitulo="CNPJ"
                tooltipDescricao="Informe o CNPJ da empresa contratante. Validamos formato e digitos verificadores."
                erro={erroCnpjInline || undefined}
              >
                <div
                  className="ws-input-icon-wrap"
                  style={erroCnpjInline ? { borderColor: 'rgba(239,68,68,0.5)' } : undefined}
                >
                  <IdentificationCard size={16} />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cnpj}
                    onChange={e => {
                      setCnpj(mascararCNPJ(e.target.value))
                      if (!cnpjTouched) setCnpjTouched(true)
                    }}
                    onBlur={() => setCnpjTouched(true)}
                    placeholder="00.000.000/0000-00"
                    autoFocus
                    maxLength={18}
                  />
                </div>
              </GeralCampoGlobal>
            )}
          </div>

          {passo === 1 && (
            <BotaoGlobal
              variante="primario"
              blocoCompleto
              centralizado
              disabled={!nomeValido}
              type="button"
              onClick={() => setPasso(2)}
              icone={<ArrowRight weight="bold" size={14} />}
            >
              Continuar
            </BotaoGlobal>
          )}

          {passo === 2 && (
            <BotaoGlobal
              variante="primario"
              blocoCompleto
              centralizado
              disabled={loading || !cnpjValido}
              type="submit"
              icone={!loading ? <Storefront weight="duotone" size={14} /> : undefined}
            >
              {loading ? 'Criando...' : 'Ir para Gravity Store'}
            </BotaoGlobal>
          )}
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
        @keyframes onbStepSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// ─── StepSquare ─────────────────────────────────────────────────────────────
// Dois quadradinhos no topo do modal indicando Passo 1/2 e 2/2.
// Ativo: preenchido com gradiente + glow. Concluído: gradiente sólido.
// Inativo: outline sutil. Sem texto.

function StepSquare({ ativo, concluido }: { ativo: boolean; concluido: boolean }) {
  const corFundo = ativo || concluido
    ? 'linear-gradient(135deg, #818cf8, #a78bfa)'
    : 'rgba(255,255,255,0.05)'
  const corBorda = ativo || concluido
    ? 'rgba(167,139,250,0.7)'
    : 'rgba(255,255,255,0.12)'
  const glow = ativo
    ? '0 0 0 3px rgba(129,140,248,0.15), 0 0 10px rgba(129,140,248,0.4)'
    : concluido
      ? '0 0 8px rgba(129,140,248,0.25)'
      : 'none'
  return (
    <span
      aria-hidden="true"
      style={{
        width: '22px',
        height: '4px',
        borderRadius: '2px',
        background: corFundo,
        border: `1px solid ${corBorda}`,
        boxShadow: glow,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        display: 'inline-block',
      }}
    />
  )
}

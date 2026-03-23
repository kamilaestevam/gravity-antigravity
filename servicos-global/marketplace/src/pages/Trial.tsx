import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle,
  Clock,
  CreditCard,
  ArrowRight,
  Rocket,
  Shield,
} from '@phosphor-icons/react'

const INCLUDED = [
  'Acesso completo a todos os módulos do plano',
  '14 dias de trial sem custo',
  'Suporte via chat durante o período',
  'Dados reais, não mock — seu negócio, agora',
  'Export de dados antes de finalizar, se quiser',
]

const NOT_REQUIRED = [
  { icon: <CreditCard size={18} weight="duotone" />, text: 'Sem cartão de crédito' },
  { icon: <Shield size={18} weight="duotone" />, text: 'Sem compromisso' },
  { icon: <Clock size={18} weight="duotone" />, text: 'Cancele a qualquer hora' },
]

export function Trial() {
  const [searchParams] = useSearchParams()
  const produto = searchParams.get('produto') ?? ''
  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'

  const trialUrl = `${CONFIGURADOR}/trial?trial=true${produto ? `&produto=${produto}` : ''}`

  const productLabel: Record<string, string> = {
    'simulador-comex': 'Simulador Comex',
    'nf-importacao': 'NF Importação',
    'dashboard': 'Dashboard Analítico',
    'simulacusto': 'SimulaCusto',
  }

  return (
    <div>
      {/* Header */}
      <section style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)', padding: '3rem 0' }}>
        <div className="container container-narrow" style={{ textAlign: 'center' }}>
          <p className="text-micro" style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>
            Trial Gratuito
          </p>
          <h1 className="text-h1" style={{ marginBottom: '0.75rem' }}>
            14 dias para sentir o{' '}
            <span className="gradient-text">valor real</span>
          </h1>
          {produto && productLabel[produto] && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Você selecionou: <strong style={{ color: 'var(--text-primary)' }}>{productLabel[produto]}</strong>
            </p>
          )}
        </div>
      </section>

      {/* Conteúdo */}
      <section className="section">
        <div className="container container-narrow">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* O que está incluído */}
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                O que está incluído
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {INCLUDED.map(item => (
                  <div key={item} className="feature-item">
                    <div className="feature-item-icon">
                      <CheckCircle size={14} weight="bold" />
                    </div>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* SEM pedido de cartão — regra obrigatória */}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.875rem' }}>
                Não é necessário
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {NOT_REQUIRED.map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: 'var(--success)' }}>
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="pricing-card" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Rocket size={40} color="var(--accent)" weight="duotone" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Comece em 60 segundos
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  Crie sua conta no Configurador e acesse o ambiente completo agora mesmo.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>Duração</span>
                  <strong style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 800 }}>14 dias</strong>
                </div>
              </div>

              {/* CTA — redireciona ao Configurador, sem pedir cartão */}
              <a
                href={trialUrl}
                className="btn btn-gradient"
                id="trial-mao-na-massa"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.875rem' }}
              >
                <Rocket size={18} weight="duotone" />
                Mão na Massa!
                <ArrowRight size={16} weight="bold" />
              </a>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Você será redirecionado para o Configurador para criar sua conta.
                Sem cartão. Sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

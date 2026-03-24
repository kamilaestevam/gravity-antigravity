import React from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  ChartBar,
  ChatCircleText,
  Plugs,
  Sparkle,
  Headset,
  CheckCircle,
  RocketLaunch,
  LockSimple,
} from '@phosphor-icons/react'
import './hub-store.css'
import { BotaoGlobal } from '@nucleo/botao-global'

const useSafeAuth = () => {
  try { return useAuth() }
  catch { return { orgRole: 'org:admin' } }
}

const PRODUCTS = [
  {
    id: 'dashboard',
    name: 'Dashboard Global',
    category: 'Analytics',
    icon: <ChartBar weight="duotone" size={28} color="var(--color-primary)" />,
    price: 'R$ 99',
    period: '/mês',
    desc: 'Métricas integradas de todos os serviços em um só painel com gráficos avançados.',
    status: 'owned',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Atendimento',
    icon: <ChatCircleText weight="duotone" size={28} color="var(--color-success)" />,
    price: 'R$ 149',
    period: '/mês',
    desc: 'Atendimento omnichannel integrado, funis automatizados e chatbots com IA.',
    status: 'trial',
  },
  {
    id: 'conector-erp',
    name: 'Conector ERP',
    category: 'Integração',
    icon: <Plugs weight="duotone" size={28} color="var(--color-primary)" />,
    price: 'R$ 299',
    period: '/mês',
    desc: 'Sincronização bidirecional com Omie, ContaAzul, TOTVS e SAP S/4HANA.',
    status: 'available',
  },
  {
    id: 'gabi',
    name: 'Gabi IA Assistant',
    category: 'Machine Learning',
    icon: <Sparkle weight="duotone" size={28} color="var(--color-warning)" />,
    price: 'R$ 199',
    period: '/mês',
    desc: 'Assistente virtual treinada nos dados corporativos para escalar sua operação.',
    status: 'available',
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk Premium',
    category: 'Atendimento',
    icon: <Headset weight="duotone" size={28} color="var(--color-text-muted)" />,
    price: 'R$ 129',
    period: '/mês',
    desc: 'Gestão de tickets e SLA automático para o atendimento dos seus clientes.',
    status: 'available',
  },
]

export function Store() {
  const { orgRole } = useSafeAuth()
  const canBuy = orgRole === 'org:admin' || orgRole === 'org:owner'

  return (
    <div className="hs-page">

      {/* Hero */}
      <div className="hs-store-hero hs-fade-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <RocketLaunch weight="fill" size={14} color="var(--color-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
            Plataforma Gravity — Ecossistema Completo
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2, color: 'var(--color-text)' }}>
          Gravity Store
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
          Adicione módulos e serviços de alto desempenho à sua operação com apenas um clique.
        </p>

        {!canBuy && (
          <div style={{ marginTop: '1.5rem', padding: '0.875rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius)', display: 'inline-flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-warning)', fontSize: '0.875rem', fontWeight: 500 }}>
            <LockSimple weight="bold" size={16} />
            Somente Administradores podem ativar ou comprar planos.
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="hs-fade-up hs-fade-up-d1">
        <p className="hs-section-title" style={{ marginBottom: '1.25rem' }}>Módulos Disponíveis</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {PRODUCTS.map(p => (
            <div key={p.id} className="hs-store-card">
              <div className="hs-store-card__body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="hs-icon-box">{p.icon}</div>
                  {p.status === 'owned' && (
                    <span className="hs-badge hs-badge-success">
                      <CheckCircle weight="bold" size={10} /> Contratado
                    </span>
                  )}
                  {p.status === 'trial' && (
                    <span className="hs-badge hs-badge-warning">Trial Ativo</span>
                  )}
                </div>

                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                  {p.category}
                </span>

                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</h3>

                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>{p.desc}</p>

                <div className="hs-price">
                  {p.price} <span>{p.period}</span>
                </div>
              </div>

              <div className="hs-store-card__footer">
                {p.status === 'owned' ? (
                  <BotaoGlobal variante="secundario" disabled blocoCompleto centralizado>
                    Licença Ativa
                  </BotaoGlobal>
                ) : p.status === 'trial' ? (
                  <BotaoGlobal variante="primario" disabled={!canBuy} blocoCompleto centralizado>
                    Efetivar Assinatura
                  </BotaoGlobal>
                ) : (
                  <>
                    <BotaoGlobal variante="secundario" disabled={!canBuy} blocoCompleto centralizado>
                      7 dias grátis
                    </BotaoGlobal>
                    <BotaoGlobal variante="primario" disabled={!canBuy} blocoCompleto centralizado>
                      Assinar
                    </BotaoGlobal>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

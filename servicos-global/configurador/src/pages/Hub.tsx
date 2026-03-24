import React, { useState, useRef, useEffect } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  ChartBar,
  CheckCircle,
  Desktop,
  Sparkle,
  ChatCircleText,
  Plugs,
  Headset,
  ClockAfternoon,
  CaretDown,
  ArrowUpRight,
  ShoppingBagOpen,
  MonitorPlay,
  Pulse,
  Calculator,
  SignOut,
  Buildings,
  Users,
  Gear,
} from '@phosphor-icons/react'
import './hub-store.css'
import { BotaoGlobal } from '@nucleo/botao-global'

export function Hub() {
  const [hoveredUpsell, setHoveredUpsell] = useState<string | null>(null)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeProducts = [
    { id: 'dashboard', name: 'Dashboard Global', icon: <ChartBar weight="duotone" size={22} color="var(--color-primary)" />, url: null },
    { id: 'atividades', name: 'Gestão de Atividades', icon: <CheckCircle weight="duotone" size={22} color="var(--color-success)" />, url: null },
    { id: 'historico', name: 'Auditoria & Logs', icon: <Desktop weight="duotone" size={22} color="var(--color-text-muted)" />, url: null },
    { id: 'simula-custo', name: 'SimulaCusto', icon: <Calculator weight="duotone" size={22} color="#f59e0b" />, url: 'http://localhost:8020' },
  ]

  const trialProducts = [
    { id: 'gabi', name: 'Gabi IA Assistant', icon: <Sparkle weight="duotone" size={22} color="var(--color-warning)" />, daysLeft: 7, desc: 'Assistente treinada nos seus dados corporativos' },
    { id: 'whatsapp', name: 'WhatsApp Business', icon: <ChatCircleText weight="duotone" size={22} color="var(--color-success)" />, daysLeft: 12, desc: 'Funis, chatbots e omnichannel integrado' },
  ]

  const upsellProducts = [
    { id: 'conector-erp', name: 'Conector ERP', icon: <Plugs weight="duotone" size={18} color="var(--color-primary)" />, desc: 'Sincronização com Omie, TOTVS, SAP' },
    { id: 'helpdesk', name: 'Helpdesk Premium', icon: <Headset weight="duotone" size={18} color="var(--color-text-muted)" />, desc: 'Tickets e SLA para seus clientes' },
  ]

  return (
    <div className="hs-page">

      {/* Page Header */}
      <header className="hs-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-text)' }}>Bom dia, Daniel.</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Aqui está o resumo da sua operação.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Tenant badge with workspace dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              id="hub-tenant-badge"
              className="hs-tenant-badge"
              type="button"
              onClick={() => setShowWorkspaceMenu(v => !v)}
              aria-expanded={showWorkspaceMenu}
            >
              <div className="hs-tenant-avatar">AC</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Acme Corporation</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Plano Enterprise · Workspace</p>
              </div>
              <CaretDown
                weight="bold"
                size={14}
                color="var(--color-text-muted)"
                style={{ transition: 'transform 0.2s', transform: showWorkspaceMenu ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {/* Dropdown menu */}
            {showWorkspaceMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: '10px', padding: '0.375rem', zIndex: 50,
                minWidth: '200px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                animation: 'fadeUp 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
              }}>
                {[
                  { label: 'Gerenciar Workspace', icon: <Gear weight="duotone" size={15} />,      path: '/workspace' },
                  { label: 'Empresas Filhas',      icon: <Buildings weight="duotone" size={15} />, path: '/workspace/empresas' },
                  { label: 'Usuários',             icon: <Users weight="duotone" size={15} />,     path: '/workspace/usuarios' },
                ].map(item => (
                  <button
                    key={item.path}
                    id={`hub-ws-${item.path.split('/').pop()}`}
                    type="button"
                    onClick={() => { navigate(item.path); setShowWorkspaceMenu(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      width: '100%', textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '0.5rem 0.75rem', borderRadius: '7px',
                      fontSize: '0.875rem', fontWeight: 500,
                      color: 'var(--color-text-muted)', fontFamily: 'var(--font)',
                      transition: 'background 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            id="hub-sign-out"
            onClick={() => signOut(() => navigate('/'))}
            title="Sair da conta"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '9999px',
              color: 'var(--color-text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--color-danger, #ef4444)'
              el.style.color = 'var(--color-danger, #ef4444)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--color-border)'
              el.style.color = 'var(--color-text-muted)'
            }}
          >
            <SignOut weight="bold" size={15} />
            Sair
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>

        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Active Products */}
          <section className="hs-fade-up hs-fade-up-d1">
            <p className="hs-section-title">
              <MonitorPlay weight="duotone" size={14} color="var(--color-primary)" />
              Seus AppModules Ativos
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
              {activeProducts.map(p => (
                <div
                  key={p.id}
                  className="hs-product-card"
                  style={{ cursor: p.url ? 'pointer' : 'default' }}
                  onClick={() => p.url && window.open(p.url, '_blank')}
                >
                  <div className="hs-icon-box" style={{ width: 40 }}>{p.icon}</div>
                  <div style={{ width: '100%' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)', margin: '0 0 0.25rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.8125rem', color: p.url ? 'var(--color-primary)' : 'var(--color-text-muted)', margin: 0 }}>
                      {p.url ? 'Abrir produto ↗' : 'Acesso direto →'}
                    </p>
                  </div>
                  <span className="hs-badge hs-badge-success">● Ativo</span>
                </div>
              ))}
            </div>
          </section>

          {/* Trial Products */}
          <section className="hs-fade-up hs-fade-up-d2">
            <p className="hs-section-title">
              <Pulse weight="duotone" size={14} color="var(--color-warning)" />
              Trials em Andamento
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trialProducts.map(p => (
                <div key={p.id} className="hs-trial-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="hs-icon-box">{p.icon}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)', margin: '0 0 0.125rem' }}>{p.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>{p.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-warning)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                        <ClockAfternoon weight="bold" size={14} />{p.daysLeft} dias restantes
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>no período grátis</p>
                    </div>
                    <BotaoGlobal variante="primario">Assinar Agora</BotaoGlobal>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Upsell Sidebar */}
        <aside className="hs-fade-up hs-fade-up-d3">
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
            <p className="hs-section-title" style={{ marginBottom: '0.5rem' }}>Expandir Operação</p>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>
              Conheça Mais Soluções Gravity
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upsellProducts.map(p => (
                <div
                  key={p.id}
                  className="hs-upsell-card"
                  onMouseEnter={() => setHoveredUpsell(p.id)}
                  onMouseLeave={() => setHoveredUpsell(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {p.icon}
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>{p.name}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{p.desc}</p>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: hoveredUpsell === p.id ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Saber mais <ArrowUpRight weight="bold" size={13} />
                  </span>
                </div>
              ))}
            </div>

            <BotaoGlobal
              variante="primario"
              blocoCompleto
              centralizado
              style={{ marginTop: '1.25rem' }}
            >
              <ShoppingBagOpen weight="fill" size={16} /> Abrir Gravity Store
            </BotaoGlobal>
          </div>
        </aside>

      </div>
    </div>
  )
}

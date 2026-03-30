import React, { useEffect, useState } from 'react'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  RocketLaunch,
  LockSimple,
  Calculator,
  FileMagnifyingGlass,
  SpinnerGap,
  ArrowRight,
  ShoppingBagOpen,
  Sparkle,
  Info,
} from '@phosphor-icons/react'
import './hub-store.css'
import '../pages/workspace/workspace.css'
import { BotaoGlobal } from '@nucleo/botao-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { ToastContainer, useShellStore } from '@gravity/shell'
import { Notificacoes } from '../../../tenant/notificacoes/src/Notificacoes'
import { type ProductApi } from '../services/apiClient'

const API_URL = '/api/v1'

interface CatalogProduct {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  type_billing: string | null
  unit_price: number | string
  currency: string
  backend_module: string | null
}

// Mapa de ícones por slug para renderização dinâmica
const ICON_MAP: Record<string, React.ReactNode> = {
  'simula-custo': <Calculator weight="duotone" size={28} color="var(--color-primary)" />,
  'smart-read': <FileMagnifyingGlass weight="duotone" size={28} color="var(--color-warning)" />,
  'bid-frete': <Package weight="duotone" size={28} color="var(--color-success)" />,
  'dashboard': <ChartBar weight="duotone" size={28} color="var(--color-primary)" />,
  'whatsapp': <ChatCircleText weight="duotone" size={28} color="var(--color-success)" />,
  'conector-erp': <Plugs weight="duotone" size={28} color="var(--color-primary)" />,
  'gabi': <Sparkle weight="duotone" size={28} color="var(--color-warning)" />,
  'helpdesk': <Headset weight="duotone" size={28} color="var(--color-text-muted)" />,
}

// Mapa de categorias por slug
const CATEGORY_MAP: Record<string, string> = {
  'simula-custo': 'Comércio Exterior',
  'smart-read': 'Inteligência Documental',
  'bid-frete': 'Logística',
  'dashboard': 'Analytics',
  'whatsapp': 'Atendimento',
  'conector-erp': 'Integração',
  'gabi': 'Machine Learning',
  'helpdesk': 'Atendimento',
}

const BILLING_TYPE_LABELS: Record<string, string> = {
  MONTHLY: '/mês',
  PER_PROCESS: '/processo',
  PER_DOCUMENT: '/documento',
  PER_ESTIMATE: '/estimativa',
  PER_DI_DUIMP: '/DI',
  PER_DUE: '/DUE',
  PER_PRODUCT: '/produto',
  PER_FLOW: '/fluxo',
  PER_LPCO: '/LPCO',
}

function formatPrice(value: string, currency: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return `${currency} 0,00`
  const symbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency
  return `${symbol} ${num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

interface StoreProduct {
  id: string
  name: string
  slug: string
  category: string
  icon: React.ReactNode
  price: string
  period: string
  desc: string
  status: 'owned' | 'trial' | 'available'
}

function apiToStoreProduct(p: ProductApi): StoreProduct {
  return {
    id: p.slug,
    name: p.name,
    slug: p.slug,
    category: CATEGORY_MAP[p.slug] ?? 'Produto',
    icon: ICON_MAP[p.slug] ?? <Package weight="duotone" size={28} color="var(--color-primary)" />,
    price: formatPrice(p.unit_price, p.unit_currency),
    period: BILLING_TYPE_LABELS[p.billing_type] ?? '/mês',
    desc: p.description,
    status: 'available',
  }
}


interface SubscribedProduct {
  product_key: string
  is_active: boolean
}

export function Store() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const canBuy = true // Qualquer usuário logado pode contratar. Master pode restringir via permissões.

  const { user } = useUser()
  const { signOut } = useClerk()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()
  const isLight = currentTheme === 'light'
  
  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'usuario@gravity.com.br'

  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [subscribed, setSubscribed] = useState<Map<string, SubscribedProduct>>(new Map())
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  // Carrega catálogo e produtos contratados
  useEffect(() => {
    async function load() {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/tenants/products`, {
            headers: { Authorization: `Bearer ${await getToken()}` },
          }).catch(() => null),
        ])

        if (catRes.ok) {
          const catData = await catRes.json()
          setCatalog(catData.products.filter((p: CatalogProduct) => p.status === 'Ativo'))
        }

        if (subRes?.ok) {
          const subData = await subRes.json()
          const map = new Map<string, SubscribedProduct>()
          subData.products.forEach((p: SubscribedProduct) => map.set(p.product_key, p))
          setSubscribed(map)
        }
      } catch (err) {
        console.error('[Store] Erro ao carregar:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubscribe = async (slug: string) => {
    setSubscribing(slug)
    try {
      const token = await getToken()

      // 1. Contrata no tenant
      const res = await fetch(`${API_URL}/tenants/products/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_key: slug }),
      })

      if (res.ok) {
        // 2. Auto-habilita na company atual (se selecionada)
        const companyId = sessionStorage.getItem('gravity_company_id')
        if (companyId) {
          await fetch(`${API_URL}/companies/${companyId}/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_key: slug }),
          }).catch(() => {}) // silently fail — produto já fica no tenant
        }

        setSubscribed(prev => {
          const next = new Map(prev)
          next.set(slug, { product_key: slug, is_active: true })
          return next
        })
      }
    } catch (err) {
      console.error('[Store] Erro ao contratar:', err)
    } finally {
      setSubscribing(null)
    }
  }

  const getStatus = (slug: string): 'owned' | 'available' => {
    const sub = subscribed.get(slug)
    return sub?.is_active ? 'owned' : 'available'
  }

  const formatPrice = (price: number | string, currency: string) => {
    const num = Number(price)
    if (!num) return 'Sob consulta'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(num)
  }

  if (loading) {
    return (
      <div className="hs-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <SpinnerGap size={32} className="hs-spin" color="var(--color-primary)" />
      </div>
    )
  }

  return (
    <div className="ws-shell" style={{ display: 'block', overflowY: 'auto' }}>
      {/* ── Global Actions (Floating over content) ── */}
      <div className="ws-global-actions" style={{ position: 'fixed' }}>
        <LocalizarExpandidoCampoGlobal 
          onBuscarNavigate={() => {}} 
        />

        <TooltipGlobal
          titulo="Dicas e Explicações"
          descricao={
            <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={14} weight="fill" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
                <span><strong style={{ color: '#f1f5f9' }}>Habilitadas</strong> — dicas aparecem ao passar o mouse</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                <span><strong style={{ color: '#f1f5f9' }}>Desabilitadas</strong> — nenhuma dica é exibida</span>
              </span>
              <span style={{ marginTop: '0.15rem', color: '#64748b', fontSize: '0.7rem' }}>
                Agora: <strong style={{ color: tooltipsDisabled ? '#f87171' : '#34d399' }}>
                  {tooltipsDisabled ? 'desabilitadas' : 'habilitadas'}
                </strong>
              </span>
            </span>
          }
        >
          <button
            className="ws-global-btn"
            onClick={toggleTooltips}
            style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
            type="button"
          >
            <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
          </button>
        </TooltipGlobal>

        <Notificacoes tenantId="store" userId={user?.id ?? 'mock-user'} />

        <UsuarioGlobal
          userName={userName}
          userEmail={userEmail}
          userInitials={userInitials}
          userRole="Admin"
          isLight={isLight}
          onToggleTheme={toggleTheme}
          onNavigateOrganizacao={() => navigate('/workspace/organizacao')}
          onNavigateMarketPlace={() => navigate('/store')}
          onSignOut={() => signOut()}
          isAdmin={true}
          onNavigateAdmin={() => navigate('/admin/visao-geral')}
        />
      </div>

      <PaginaGlobal
        className="ws-fade-up"
        layout="lista"
        cabecalho={
          <CabecalhoGlobal
            icone={<RocketLaunch size={24} weight="duotone" color="#6366f1" />}
            titulo="Gravity Ecosystem"
            subtitulo="Expanda sua Operação. Descubra módulos inteligentes projetados para escalar seu negócio com eficiência e dados centralizados."
          />
        }
      >
        <div style={{ paddingTop: '1rem' }}>
          <div className="hs-fade-up hs-fade-up-d1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="hs-section-title" style={{ margin: 0 }}>
            <ShoppingBagOpen weight="duotone" size={18} color="var(--color-primary)" />
            Módulos Disponíveis ({catalog.length})
          </h2>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
              Premium Access
            </div>
          </div>
        </div>

        {catalog.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            background: 'var(--color-surface)', 
            borderRadius: '16px',
            border: '1px dashed var(--color-border)'
          }}>
            <Package weight="duotone" size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
              Nenhum produto disponível no catálogo no momento.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {catalog.map((p, idx) => {
              const status = getStatus(p.slug)
              const isSubscribing = subscribing === p.slug
              const delayClass = idx < 4 ? `hs-fade-up-d${idx + 1}` : ''

              return (
                <div
                  key={p.id}
                  className={`hs-store-card hs-fade-up ${delayClass}`}
                  onClick={status === 'owned' ? () => navigate(`/produto/${p.slug}`) : undefined}
                  style={status === 'owned' ? { cursor: 'pointer' } : undefined}
                >
                  <div className="hs-store-card__body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="hs-icon-box">
                        <Package weight="duotone" size={28} color="var(--color-primary)" />
                      </div>
                      {status === 'owned' ? (
                        <span className="hs-badge hs-badge-success">
                          <CheckCircle weight="fill" size={14} /> Ativo
                        </span>
                      ) : (
                        <div title="Módulo disponível para contratação">
                          <Sparkle weight="duotone" size={18} color="var(--color-warning)" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span style={{ 
                        fontSize: '0.6875rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        color: 'var(--color-primary)',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        {p.type_billing || 'Subscription'}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                        {p.name}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {p.description || 'Impulsione sua produtividade com este módulo especializado da Gravity.'}
                      </p>
                    </div>

                    <div className="hs-price">
                      {formatPrice(p.unit_price, p.currency)} <span>/mês</span>
                    </div>
                  </div>

                  <div className="hs-store-card__footer">
                    {status === 'owned' ? (
                      <BotaoGlobal
                        variante="primario"
                        blocoCompleto
                        centralizado
                        onClick={(e) => { e.stopPropagation(); navigate(`/produto/${p.slug}`) }}
                      >
                        Acessar Dashboard
                      </BotaoGlobal>
                    ) : (
                      <BotaoGlobal
                        variante="primario"
                        disabled={!canBuy || isSubscribing}
                        blocoCompleto
                        centralizado
                        onClick={(e) => { e.stopPropagation(); handleSubscribe(p.slug) }}
                      >
                        {isSubscribing ? (
                          <>
                            <SpinnerGap size={16} className="hs-spin" /> Contratando...
                          </>
                        ) : (
                          <>
                            Contratar Agora <ArrowRight weight="bold" size={16} />
                          </>
                        )}
                      </BotaoGlobal>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Mock Products: Em Breve */}
            {[
              {
                id: 'mock-1',
                name: 'Smart Read',
                description: 'Plataforma de automação (IDP) e IA para extração e validação inteligente de documentos de Comércio Exterior.',
                type_billing: 'Subscription'
              },
              {
                id: 'mock-2',
                name: 'BID Frete Internacional',
                description: 'Centralize cotações marítimas e aéreas, comparando agentes de carga em tempo real.',
                type_billing: 'Transactional'
              },
              {
                id: 'mock-3',
                name: 'BID Câmbio',
                description: 'Otimize transações de fechamento ao competir taxas entre corretoras e bancos em uma única interface.',
                type_billing: 'Transactional'
              }
            ].map((p, idx) => {
              const delayClass = `hs-fade-up-d${Math.min(catalog.length + idx + 1, 4)}`

              return (
                <div key={p.id} className={`hs-store-card hs-fade-up ${delayClass}`} style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                  <div className="hs-store-card__body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="hs-icon-box" style={{ filter: 'grayscale(1)', opacity: 0.5 }}>
                        <Package weight="duotone" size={28} color="var(--color-text-muted)" />
                      </div>
                      <div title="Lançamento previsto para os próximos meses">
                        <span className="hs-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                          Em Breve
                        </span>
                      </div>
                    </div>

                    <div>
                      <span style={{ 
                        fontSize: '0.6875rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        color: 'var(--color-text-muted)',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        {p.type_billing}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                        {p.name}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {p.description}
                      </p>
                    </div>

                    <div className="hs-price" style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>
                      Em breve
                    </div>
                  </div>

                  <div className="hs-store-card__footer" style={{ borderTopColor: 'rgba(255,255,255,0.02)' }}>
                    <BotaoGlobal
                      variante="fantasma"
                      disabled
                      blocoCompleto
                      centralizado
                      onClick={() => {}}
                    >
                      Aguarde o Lançamento
                    </BotaoGlobal>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="hs-fade-up hs-fade-up-d3" style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.5, paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} Gravity Platform · Todos os módulos incluem suporte priorizado.
        </p>
      </div>
        </div>
      </PaginaGlobal>

      <ToastContainer />
    </div>
  )
}

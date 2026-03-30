import React, { useState, useRef, useEffect } from 'react'
import { useClerk, useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  SpinnerGap,
  CaretDown,
  ArrowUpRight,
  ShoppingBagOpen,
  MonitorPlay,
  SignOut,
  Buildings,
  Users,
  Gear,
  Plugs,
  Headset,
  Rocket,
  Lightning,
  CheckCircle,
  ShieldCheck,
  Sparkle,
  CaretRight,
} from '@phosphor-icons/react'
import './hub-store.css'
import { BotaoGlobal } from '@nucleo/botao-global'

const API_URL = '/api/v1'

interface CompanyProduct {
  product_key: string
  is_active: boolean
  catalog: {
    id: string
    name: string
    slug: string
    description: string | null
    backend_module: string | null
  } | null
}

export function Hub() {
  const [hoveredUpsell, setHoveredUpsell] = useState<string | null>(null)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [products, setProducts] = useState<CompanyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const isAdmin = user?.publicMetadata?.role === 'gravity_admin'
  const menuRef = useRef<HTMLDivElement>(null)

  // companyId vem da URL ou do sessionStorage (salvo na seleção do workspace)
  const companyId = sessionStorage.getItem('gravity_company_id')
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWorkspaceMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Carrega produtos ativos do workspace.
  // Se a company não tem produtos mas o tenant tem, auto-habilita na company.
  useEffect(() => {
    async function loadProducts() {
      if (!companyId) {
        setLoading(false)
        return
      }

      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/companies/${companyId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          const activeProducts = data.products.filter((p: CompanyProduct) => p.is_active)

          if (activeProducts.length > 0) {
            setProducts(activeProducts)
          } else {
            // Company sem produtos — verifica se o tenant tem produtos contratados
            const tenantRes = await fetch(`${API_URL}/tenants/products`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (tenantRes.ok) {
              const tenantData = await tenantRes.json()
              const tenantActive = tenantData.products?.filter((p: any) => p.is_active) || []

              // Auto-habilita cada produto do tenant nesta company
              for (const tp of tenantActive) {
                await fetch(`${API_URL}/companies/${companyId}/products`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ product_key: tp.product_key }),
                }).catch(() => {})
              }

              // Recarrega os produtos da company
              if (tenantActive.length > 0) {
                const refreshRes = await fetch(`${API_URL}/companies/${companyId}/products`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json()
                  setProducts(refreshData.products.filter((p: CompanyProduct) => p.is_active))
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('[Hub] Erro ao carregar produtos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [companyId])

  const handleOpenProduct = (slug: string) => {
    // Navega dentro da mesma SPA para a rota do produto
    navigate(`/produto/${slug}`)
  }

  const initials = companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const upsellProducts = [
    { id: 'bid-frete', name: 'BID Frete Internacional', icon: <Plugs weight="duotone" size={18} color="var(--color-success)" />, desc: 'Licitação inteligente de fretes com fornecedores' },
    { id: 'conector-erp', name: 'Conector ERP', icon: <Plugs weight="duotone" size={18} color="var(--color-primary)" />, desc: 'Sincronização com Omie, TOTVS, SAP' },
    { id: 'helpdesk', name: 'Helpdesk Premium', icon: <Headset weight="duotone" size={18} color="var(--color-text-muted)" />, desc: 'Tickets e SLA para seus clientes' },
  ]

  return (
    <div className="hs-page hs-page-hub">
      {/* Ambient Glow */}
      <div className="hs-ambient-glow"></div>

      {/* Top Navbar */}
      <header className="hs-fade-up hs-hub-header">
        <div className="hs-hub-title">
          <div className="hs-hub-icon-wrap">
            <MonitorPlay weight="duotone" size={24} color="#818cf8" />
          </div>
          <div>
            <h1 className="hs-gradient-text-subtle">
              Bem-vindo ao Gravity.
            </h1>
            <p>Gerencie sua operação e expanda módulos no seu workspace.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="hs-glass-badge"
              type="button"
              onClick={() => setShowWorkspaceMenu(v => !v)}
              aria-expanded={showWorkspaceMenu}
            >
              <div className="hs-tenant-avatar">{initials}</div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="hs-badge-title">{companyName}</span>
                <span className="hs-badge-sub">Workspace Principal</span>
              </div>
              <CaretDown
                weight="bold"
                size={14}
                color="var(--color-text-muted)"
                style={{ transition: 'transform 0.2s', transform: showWorkspaceMenu ? 'rotate(180deg)' : 'none', marginLeft: '0.5rem' }}
              />
            </button>

            {showWorkspaceMenu && (
              <div className="hs-glass-menu" style={{ animation: 'fadeUp 0.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
                <div className="hs-menu-header">
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontWeight: 700 }}>Alternar / Configurar</span>
                </div>
                {[
                  { label: 'Gerenciar Workspace', icon: <Gear weight="duotone" size={16} />, path: '/workspace' },
                  { label: 'Workspaces', icon: <Buildings weight="duotone" size={16} />, path: '/workspace/workspaces' },
                  { label: 'Usuários', icon: <Users weight="duotone" size={16} />, path: '/workspace/usuarios' },
                  { label: 'Gravity Store', icon: <ShoppingBagOpen weight="duotone" size={16} />, path: '/store' },
                  { label: 'Trocar Workspace', icon: <Buildings weight="duotone" size={16} />, path: '/selecionar-workspace' },
                ].map((item, idx) => (
                  <button
                    key={item.path}
                    className="hs-menu-item"
                    type="button"
                    onClick={() => { navigate(item.path); setShowWorkspaceMenu(false) }}
                    style={{ borderTop: idx === 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingTop: idx === 3 ? '0.5rem' : '0.25rem', marginTop: idx === 3 ? '0.25rem' : 0 }}
                  >
                    <span className="hs-menu-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                {isAdmin && (
                  <>
                    <div style={{ borderTop: '1px solid rgba(99, 102, 241, 0.15)', margin: '0.5rem 0.25rem 0.25rem' }} />
                    <button
                      className="hs-menu-item hs-menu-item-admin"
                      type="button"
                      onClick={() => { navigate('/admin'); setShowWorkspaceMenu(false) }}
                    >
                      <span className="hs-menu-icon"><ShieldCheck weight="duotone" size={16} color="#818cf8" /></span>
                      Painel Admin
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            className="hs-glass-btn-danger"
            type="button"
            onClick={() => signOut(() => navigate('/'))}
            title="Encerrar sessão"
          >
            <SignOut weight="bold" size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="hs-fade-up hs-fade-up-d1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="hs-section-title" style={{ margin: 0, fontSize: '0.8125rem' }}>
            <Package weight="bold" size={16} color="var(--color-text-muted)" />
            Seus Módulos Ativos
          </h2>
          <BotaoGlobal variante="fantasma" tamanho="pequeno" onClick={() => navigate('/store')}>
            <ShoppingBagOpen weight="bold" /> Ir para a Store
          </BotaoGlobal>
        </div>

        {loading ? (
          <div className="hs-loading-container">
            <SpinnerGap size={40} className="hs-spin" color="var(--color-primary)" />
            <p>Carregando ecossistema...</p>
          </div>
        ) : products.length === 0 ? (
          <>
            {/* Onboarding Steps */}
            <div className="hs-onboard-steps">
              {[
                { icon: <Gear weight="duotone" size={22} />, label: 'Configure', desc: 'Personalize seu workspace', path: '/workspace', color: '#818cf8' },
                { icon: <ShoppingBagOpen weight="duotone" size={22} />, label: 'Ative Módulos', desc: 'Explore o catálogo Gravity', path: '/store', color: '#a78bfa' },
                { icon: <Users weight="duotone" size={22} />, label: 'Convide', desc: 'Adicione sua equipe', path: '/workspace/usuarios', color: '#6ee7b7' },
              ].map((step, idx) => (
                <button
                  key={step.path}
                  className={`hs-onboard-card hs-fade-up hs-fade-up-d${idx + 1}`}
                  type="button"
                  onClick={() => navigate(step.path)}
                >
                  <div className="hs-onboard-step-number">{idx + 1}</div>
                  <div className="hs-onboard-icon" style={{ color: step.color }}>
                    {step.icon}
                  </div>
                  <div className="hs-onboard-text">
                    <strong>{step.label}</strong>
                    <span>{step.desc}</span>
                  </div>
                  <ArrowUpRight weight="bold" size={14} className="hs-onboard-arrow" />
                </button>
              ))}
            </div>

            {/* Empty State Central */}
            <div className="hs-empty-state">
              <div className="hs-empty-icon-wrap">
                <Rocket weight="duotone" size={48} />
              </div>
              <h3>Pronto para decolar</h3>
              <p>Seu workspace <strong>{companyName}</strong> está configurado. Ative seu primeiro módulo na Store e comece a operar.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <BotaoGlobal variante="primario" onClick={() => navigate('/store')}>
                  <ShoppingBagOpen weight="fill" size={18} /> Explorar Catálogo
                </BotaoGlobal>
              </div>
            </div>

            {/* Gabi AI Insight */}
            <div className="hs-gabi-insight hs-fade-up hs-fade-up-d2" style={{ marginTop: '2.5rem', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
              <div className="hs-gabi-watermark">
                <Sparkle weight="fill" size={120} />
              </div>
              <div className="hs-gabi-header">
                <div className="hs-gabi-avatar">
                  <Sparkle weight="fill" size={14} color="#fff" />
                </div>
                <span className="hs-gabi-title">GABI AI &bull; INSIGHT</span>
              </div>
              <p className="hs-gabi-text">
                Identificamos que 40% das suas simulações recentes para NCM 8471 poderiam economizar até 12% em ICMS se o desembaraço fosse feito via Santa Catarina.
              </p>
              <div className="hs-gabi-footer">
                <button className="hs-gabi-btn" type="button">
                  Ver Detalhes <CaretRight size={12} />
                </button>
              </div>
            </div>

            {/* Recommended Products */}
            <div className="hs-fade-up hs-fade-up-d3" style={{ marginTop: '3rem' }}>
              <h2 className="hs-section-title" style={{ fontSize: '0.8125rem' }}>
                <Lightning weight="fill" size={16} color="#f59e0b" />
                Recomendados para você
              </h2>
              <div className="hs-upsell-grid">
                {upsellProducts.map(up => (
                  <div
                    key={up.id}
                    className="hs-upsell-card"
                    onClick={() => navigate('/store')}
                    onMouseEnter={() => setHoveredUpsell(up.id)}
                    onMouseLeave={() => setHoveredUpsell(null)}
                  >
                    <div className="hs-upsell-header">
                      <div className="hs-upsell-icon">{up.icon}</div>
                      <div className="hs-upsell-info">
                        <strong>{up.name}</strong>
                        <span>{up.desc}</span>
                      </div>
                    </div>
                    <div className={`hs-upsell-cta ${hoveredUpsell === up.id ? 'hs-upsell-cta-visible' : ''}`}>
                      <span>Ver na Store</span>
                      <ArrowUpRight weight="bold" size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="hs-product-grid">
            {products.map((p, idx) => (
              <div
                key={p.product_key}
                className={`hs-product-card-premium hs-fade-up hs-fade-up-d${Math.min(idx + 1, 3)}`}
                onClick={() => handleOpenProduct(p.product_key)}
              >
                <div className="hs-product-card-bg">
                  <div className="hs-product-card-glow"></div>
                </div>
                
                <div className="hs-product-card-content">
                  <div className="hs-product-card-header">
                    <div className="hs-icon-box-glass">
                      <Package weight="duotone" size={28} color="#818cf8" />
                    </div>
                    <span className="hs-badge hs-badge-success-glass">
                      <div className="hs-pulse-dot"></div> Ativo
                    </span>
                  </div>
                  
                  <div className="hs-product-card-info">
                    <span className="hs-product-type">Módulo de Plataforma</span>
                    <h3>{p.catalog?.name || p.product_key}</h3>
                    <p>{p.catalog?.description || 'Acesse o dashboard principal deste produto para visualizar dados detalhados.'}</p>
                  </div>

                  <div className="hs-product-card-footer">
                    <span>Acessar Dashboard</span>
                    <div className="hs-product-arrow">
                      <ArrowUpRight weight="bold" size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

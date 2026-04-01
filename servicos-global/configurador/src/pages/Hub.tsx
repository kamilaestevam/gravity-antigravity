import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useShellStore } from '@gravity/shell'
import { useLoadSystemRole } from '../hooks/useLoadSystemRole'

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
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const [hoveredUpsell, setHoveredUpsell] = useState<string | null>(null)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [products, setProducts] = useState<CompanyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const { isGravityAdmin: isAdmin } = useLoadSystemRole()
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
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('hub.erro_carregar_produtos') })
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
    { id: 'bid-frete', name: t('hub.upsell_frete_nome'), icon: <Plugs weight="duotone" size={28} color="var(--color-success)" />, desc: t('hub.upsell_frete_desc') },
    { id: 'conector-erp', name: t('hub.upsell_erp_nome'), icon: <Plugs weight="duotone" size={28} color="var(--color-primary)" />, desc: t('hub.upsell_erp_desc') },
    { id: 'helpdesk', name: t('hub.upsell_helpdesk_nome'), icon: <Headset weight="duotone" size={28} color="var(--color-text-muted)" />, desc: t('hub.upsell_helpdesk_desc') },
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
              {t('hub.titulo')}
            </h1>
            <p>{t('hub.subtitulo')}</p>
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
                <span className="hs-badge-sub">{t('hub.workspace_principal')}</span>
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
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontWeight: 700 }}>{t('hub.menu_alternar')}</span>
                </div>
                {[
                  { label: t('hub.menu_gerenciar_workspace'), icon: <Gear weight="duotone" size={16} />, path: '/workspace' },
                  { label: t('hub.menu_workspaces'), icon: <Buildings weight="duotone" size={16} />, path: '/workspace/workspaces' },
                  { label: t('hub.menu_usuarios'), icon: <Users weight="duotone" size={16} />, path: '/workspace/usuarios' },
                  { label: t('hub.menu_gravity_store'), icon: <ShoppingBagOpen weight="duotone" size={16} />, path: '/store' },
                  { label: t('hub.menu_trocar_workspace'), icon: <Buildings weight="duotone" size={16} />, path: '/hub' },
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
                      {t('hub.menu_painel_admin')}
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
            title={t('hub.btn_sair_titulo')}
          >
            <SignOut weight="bold" size={16} />
            {t('hub.btn_sair')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="hs-fade-up hs-fade-up-d1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="hs-section-title" style={{ margin: 0, fontSize: '0.8125rem' }}>
            <Package weight="bold" size={16} color="var(--color-text-muted)" />
            {t('hub.modulos_ativos')}
          </h2>
          <BotaoGlobal variante="fantasma" tamanho="pequeno" onClick={() => navigate('/store')}>
            <ShoppingBagOpen weight="bold" /> {t('hub.ir_para_store')}
          </BotaoGlobal>
        </div>

        {loading ? (
          <div className="hs-loading-container">
            <SpinnerGap size={40} className="hs-spin" color="var(--color-primary)" />
            <p>{t('hub.carregando')}</p>
          </div>
        ) : products.length === 0 ? (
          <>
            {/* Onboarding Steps */}
            <div className="hs-onboard-steps">
              {[
                { icon: <Gear weight="duotone" size={22} />, label: t('hub.onboard_configure_label'), desc: t('hub.onboard_configure_desc'), path: '/workspace', color: '#818cf8' },
                { icon: <ShoppingBagOpen weight="duotone" size={22} />, label: t('hub.onboard_ative_label'), desc: t('hub.onboard_ative_desc'), path: '/store', color: '#a78bfa' },
                { icon: <Users weight="duotone" size={22} />, label: t('hub.onboard_convide_label'), desc: t('hub.onboard_convide_desc'), path: '/workspace/usuarios', color: '#6ee7b7' },
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
              <h3>{t('hub.empty_titulo')}</h3>
              <p>{t('hub.empty_desc', { nome: companyName })}</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <BotaoGlobal variante="primario" onClick={() => navigate('/store')}>
                  <ShoppingBagOpen weight="fill" size={18} /> {t('hub.explorar_catalogo')}
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
                <span className="hs-gabi-title">{t('hub.gabi_header')}</span>
              </div>
              <p className="hs-gabi-text">
                {t('hub.gabi_texto')}
              </p>
              <div className="hs-gabi-footer">
                <button className="hs-gabi-btn" type="button">
                  {t('hub.ver_detalhes')} <CaretRight size={12} />
                </button>
              </div>
            </div>

            {/* Recommended Products */}
            <div className="hs-fade-up hs-fade-up-d3" style={{ marginTop: '3rem' }}>
              <h2 className="hs-section-title" style={{ margin: 0, fontSize: '0.8125rem' }}>
                <Lightning weight="bold" size={16} color="#f59e0b" />
                {t('hub.recomendados')}
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
                      <div className="hs-icon-box-glass">{up.icon}</div>
                      <div className="hs-upsell-info">
                        <strong>{up.name}</strong>
                        <span>{up.desc}</span>
                      </div>
                    </div>
                    <div className={`hs-upsell-cta ${hoveredUpsell === up.id ? 'hs-upsell-cta-visible' : ''}`}>
                      <span>{t('hub.ver_na_store')}</span>
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
                      <div className="hs-pulse-dot"></div> {t('hub.produto_ativo')}
                    </span>
                  </div>
                  
                  <div className="hs-product-card-info">
                    <span className="hs-product-type">{t('hub.produto_modulo')}</span>
                    <h3>{p.catalog?.name || p.product_key}</h3>
                    <p>{p.catalog?.description || t('hub.produto_desc_fallback')}</p>
                  </div>

                  <div className="hs-product-card-footer">
                    <span>{t('hub.produto_acessar')}</span>
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

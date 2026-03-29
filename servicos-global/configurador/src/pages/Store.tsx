import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  RocketLaunch,
  SpinnerGap,
  ArrowRight,
  ShoppingBagOpen,
  Sparkle,
} from '@phosphor-icons/react'
import './hub-store.css'
import { BotaoGlobal } from '@nucleo/botao-global'

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

interface SubscribedProduct {
  product_key: string
  is_active: boolean
}

export function Store() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const canBuy = true // Qualquer usuário logado pode contratar. Master pode restringir via permissões.

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
      const res = await fetch(`${API_URL}/tenants/products/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_key: slug }),
      })

      if (res.ok) {
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
    <div className="hs-page">
      {/* Hero */}
      <div className="hs-store-hero hs-fade-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ 
            background: 'rgba(79, 70, 229, 0.15)', 
            padding: '0.5rem', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <RocketLaunch weight="duotone" size={20} color="var(--color-primary)" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)' }}>
            Gravity Ecosystem
          </span>
        </div>
        
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Expanda sua <span className="hs-gradient-text">Operação.</span>
        </h1>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', maxWidth: 600, lineHeight: 1.6, marginBottom: 0 }}>
          Descubra módulos inteligentes projetados para escalar seu negócio com eficiência e dados centralizados.
        </p>
      </div>

      {/* Content Grid */}
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
          </div>
        )}
      </div>
      
      {/* Footer info */}
      <div className="hs-fade-up hs-fade-up-d3" style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} Gravity Platform · Todos os módulos incluem suporte priorizado.
        </p>
      </div>
    </div>
  )
}

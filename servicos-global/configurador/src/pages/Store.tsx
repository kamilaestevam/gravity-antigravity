import React, { useState, useEffect } from 'react'
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
  Calculator,
  FileMagnifyingGlass,
  Package,
} from '@phosphor-icons/react'
import './hub-store.css'
import { BotaoGlobal } from '@nucleo/botao-global'
import { publicCatalogApi, type ProductApi } from '../services/apiClient'

const useSafeAuth = () => {
  try { return useAuth() }
  catch { return { orgRole: 'org:admin' } }
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

export function Store() {
  const { orgRole } = useSafeAuth()
  const canBuy = orgRole === 'org:admin' || orgRole === 'org:owner'
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { products: apiProducts } = await publicCatalogApi.listProducts()
        if (!cancelled) {
          setProducts(apiProducts.map(apiToStoreProduct))
        }
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Carregando catálogo...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Nenhum produto disponível no momento.
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {products.map(p => (
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
        )}
      </div>

    </div>
  )
}

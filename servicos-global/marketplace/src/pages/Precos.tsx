import { useState } from 'react'
import { Package, Sparkle, Truck } from '@phosphor-icons/react'
import type { ComponentType, CSSProperties } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import '../styles/precos.css'

interface PlanoPreco {
  id: string
  Icon: ComponentType<IconProps>
  name: string
  tag: string
  tagColor: string
  sub: string
  annual: number
  monthly: number
  popular: boolean
  features: string[]
}

const PLANS: PlanoPreco[] = [
  {
    id: 'pedido',
    Icon: Package,
    name: 'Pedido',
    tag: 'OPERAÇÕES',
    tagColor: '#8b7bff',
    sub: 'Gestão de processos de COMEX',
    annual: 97,
    monthly: 127,
    popular: false,
    features: [
      '3 usuários inclusos',
      'Processos ilimitados',
      'Saldo automático e etapas',
      'Rastreabilidade ponta a ponta',
      'Suporte via chat',
    ],
  },
  {
    id: 'smart-read',
    Icon: Sparkle,
    name: 'Smart Docs',
    tag: 'INTELIGÊNCIA',
    tagColor: '#b6a6ff',
    sub: 'Inteligência documental com IA',
    annual: 147,
    monthly: 190,
    popular: true,
    features: [
      '5 usuários inclusos',
      '500 documentos / mês',
      'Extração e conferência por IA',
      'Síntese analítica',
      'Automações entre módulos',
      'Suporte prioritário',
    ],
  },
  {
    id: 'bid-frete',
    Icon: Truck,
    name: 'BID Frete',
    tag: 'COTAÇÕES',
    tagColor: '#f2a33c',
    sub: 'Licitação de fretes internacionais',
    annual: 197,
    monthly: 257,
    popular: false,
    features: [
      'Usuários ilimitados',
      'Cotações ilimitadas',
      'Ranking automático e savings',
      'Histórico completo',
      'Multi-fornecedor',
    ],
  },
]

function estiloTag(tagColor: string): CSSProperties {
  return {
    '--tag-color': tagColor,
    '--tag-bg': `${tagColor}1c`,
    '--tag-border': `${tagColor}3a`,
    '--icon-bg': `${tagColor}18`,
    '--icon-border': `${tagColor}30`,
  } as CSSProperties
}

export function Precos() {
  const [annual, setAnnual] = useState(true)
  const configurador = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.usegravity.com.br'

  return (
    <section className="precos-page">
      <div className="precos-page__hero">
        <h1 className="precos-page__titulo">
          Preço <span className="precos-page__titulo-destaque">por produto.</span>
        </h1>
        <p className="precos-page__sub">
          Pague só pelos módulos que usar. Combine à vontade — cada produto tem seu próprio preço.
        </p>

        <div className="precos-page__toggle-row">
          <div className="precos-page__toggle">
            <button
              type="button"
              className={`precos-page__toggle-btn${annual ? ' precos-page__toggle-btn--active' : ''}`}
              onClick={() => setAnnual(true)}
            >
              Anual
            </button>
            <button
              type="button"
              className={`precos-page__toggle-btn${!annual ? ' precos-page__toggle-btn--active' : ''}`}
              onClick={() => setAnnual(false)}
            >
              Mensal
            </button>
          </div>
          <span className="precos-page__economia">★ Economize 23%</span>
        </div>
      </div>

      <div className="precos-page__conteudo">
        <div className="precos-page__grid">
          {PLANS.map(p => {
            const price = annual ? p.annual : p.monthly
            return (
              <article
                key={p.id}
                className={`precos-card${p.popular ? ' precos-card--popular' : ''}`}
                style={estiloTag(p.tagColor)}
              >
                {p.popular ? (
                  <div className="precos-card__popular">MAIS POPULAR</div>
                ) : null}

                <div className="precos-card__topo">
                  <span className="precos-card__icone">
                    <p.Icon size={22} weight="duotone" />
                  </span>
                  <span className="precos-card__badge">{p.tag}</span>
                </div>

                <div className="precos-card__nome">{p.name}</div>
                <div className="precos-card__sub">{p.sub}</div>

                <div className="precos-card__preco-linha">
                  <span className="precos-card__moeda">R$</span>
                  <span
                    className="precos-card__valor"
                    style={{ color: p.popular ? '#b6a6ff' : '#c9c3ff' }}
                  >
                    {price}
                  </span>
                  <span className="precos-card__periodo">/mês</span>
                </div>
                <div className="precos-card__cobranca">
                  {annual ? 'Cobrado anualmente' : 'Cobrado mensalmente'}
                </div>

                <a
                  href={`${configurador}/trial?produto=${p.id}&trial=true`}
                  className={`precos-card__cta${p.popular ? ' precos-card__cta--popular' : ''}`}
                >
                  Começar com {p.name} <span>→</span>
                </a>

                <div className="precos-card__divisor" />

                <div className="precos-card__features">
                  {p.features.map(f => (
                    <div key={f} className="precos-card__feature">
                      <span className="precos-card__check">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        <p className="precos-page__rodape">
          Precisa de vários módulos ou volume alto?{' '}
          <a href={`${configurador}/contato`} className="precos-page__vendas">
            Fale com Vendas
          </a>{' '}
          para um plano combinado.
        </p>
      </div>
    </section>
  )
}

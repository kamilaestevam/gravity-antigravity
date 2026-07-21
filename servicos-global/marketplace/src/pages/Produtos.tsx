import {
  Package,
  Truck,
  CurrencyDollar,
  Calculator,
  FileText,
  Sparkle,
} from '@phosphor-icons/react'
import type { ComponentType, CSSProperties } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import '../styles/produtos.css'

type CatKey = 'op' | 'cot' | 'sim' | 'ia'

const CATS: Record<CatKey, { label: string; color: string }> = {
  op: { label: 'OPERAÇÕES', color: '#8b7bff' },
  cot: { label: 'COTAÇÕES', color: '#f2a33c' },
  sim: { label: 'SIMULAÇÃO', color: '#3ddc97' },
  ia: { label: 'INTELIGÊNCIA', color: '#b6a6ff' },
}

const DATA: {
  id: string
  Icon: ComponentType<IconProps>
  cat: CatKey
  name: string
  sub: string
  desc: string
  chips: string[]
}[] = [
  {
    id: 'pedido',
    Icon: Package,
    cat: 'op',
    name: 'Pedido',
    sub: 'Gestão de processos de importação e exportação',
    desc: 'Controle completo do ciclo de vida dos seus pedidos: saldo automático, etapas customizáveis, controle de quantidades e rastreabilidade de ponta a ponta.',
    chips: ['Saldo automático', 'Rastreabilidade', 'Etapas customizáveis', 'Multi-usuário'],
  },
  {
    id: 'bid-frete',
    Icon: Truck,
    cat: 'cot',
    name: 'BID Frete',
    sub: 'Licitação inteligente de fretes internacionais',
    desc: 'Compare ofertas de múltiplos fornecedores com ranking automático, cálculo de savings e aprovação em 2 cliques. Histórico completo de cotações.',
    chips: ['Ranking automático', 'Multi-fornecedor', 'Savings', 'Histórico'],
  },
  {
    id: 'bid-cambio',
    Icon: CurrencyDollar,
    cat: 'cot',
    name: 'BID Câmbio',
    sub: 'Marketplace de corretoras de câmbio',
    desc: 'Comparativo automático entre corretoras com PTAX integrado e cálculo de economia real para operações de COMEX. Histórico de spreads e performance.',
    chips: ['Comparativo', 'PTAX integrado', 'Economia real', 'Spreads'],
  },
  {
    id: 'simula-custo',
    Icon: Calculator,
    cat: 'sim',
    name: 'Simula Custo',
    sub: 'Simulação de custos de importação e exportação',
    desc: 'Calcule o custo real das suas operações com múltiplos cenários, impostos, câmbio e frete — antes de fechar o negócio.',
    chips: ['Multi-cenário', 'Impostos', 'Câmbio', 'Comparativo'],
  },
  {
    id: 'nf-importacao',
    Icon: FileText,
    cat: 'op',
    name: 'NF Importação',
    sub: 'Notas fiscais de importação sem burocracia',
    desc: 'Gestão completa de NFs de importação com DI integrada, conferência automática e emissão em lote — direto do seu processo.',
    chips: ['DI integrada', 'Conferência', 'Multi-NF', 'Exportável'],
  },
  {
    id: 'smart-read',
    Icon: Sparkle,
    cat: 'ia',
    name: 'Smart Read',
    sub: 'Inteligência documental com IA para COMEX',
    desc: 'Extração automática de dados, conferência e análise de documentos de COMEX com IA — invoices, packing lists e mais, em segundos.',
    chips: ['Extração IA', 'Conferência', 'Análise', 'COMEX'],
  },
]

function estiloCat(color: string): CSSProperties {
  return {
    '--cat-color': color,
    '--cat-bg': `${color}1c`,
    '--cat-border': `${color}3a`,
    '--cat-icon-bg': `${color}18`,
    '--cat-icon-border': `${color}30`,
  } as CSSProperties
}

export function Produtos() {
  return (
    <section className="produtos-page">
      <div className="produtos-page__inner">
        <div className="produtos-page__intro">
          <h1 className="produtos-page__titulo">
            Navegue agora e descubra
            <span className="produtos-page__titulo-destaque"> o mundo Gravity.</span>
          </h1>
          <p className="produtos-page__sub">
            Cada módulo resolve uma etapa da sua operação de COMEX. Contrate o que usar, escale quando precisar —
            sem lacunas, sem pagar pelo que não precisa.
          </p>
        </div>

        <div className="produtos-page__grid">
          {DATA.map(p => {
            const c = CATS[p.cat]
            return (
              <article
                key={p.id}
                className="produtos-card"
                style={estiloCat(c.color)}
              >
                <div className="produtos-card__topo">
                  <span className="produtos-card__icone">
                    <p.Icon size={22} weight="duotone" />
                  </span>
                  <span className="produtos-card__badge">{c.label}</span>
                </div>

                <div className="produtos-card__nome">{p.name}</div>
                <div className="produtos-card__sub">{p.sub}</div>
                <p className="produtos-card__desc">{p.desc}</p>

                <div className="produtos-card__chips">
                  {p.chips.map(chip => (
                    <span key={chip} className="produtos-card__chip">
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="produtos-card__divisor" />

                <button type="button" className="produtos-card__demo">
                  <span className="produtos-card__demo-play">▶</span>
                  Ver demonstração <span>→</span>
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

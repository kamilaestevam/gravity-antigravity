import { Link } from 'react-router-dom'
import {
  ClipboardText,
  Truck,
  CurrencyDollar,
  Calculator,
  FileText,
  Sparkle,
  ArrowRight,
} from '@phosphor-icons/react'

const PRODUCTS = [
  {
    id: 'pedido',
    icon: <ClipboardText size={32} weight="duotone" />,
    name: 'Pedido',
    tagline: 'Gestão de processos de importação e exportação',
    desc: 'Controle completo do ciclo de vida dos seus pedidos: saldo automático, etapas customizáveis, controle de quantidades e rastreabilidade de ponta a ponta.',
    tags: ['Saldo automático', 'Rastreabilidade', 'Etapas customizáveis', 'Multi-usuário'],
    cat: 'Operações',
    catColor: '#818cf8',
    catBg: 'rgba(99,102,241,0.1)',
    price: 'R$ 1,99',
    unit: '/ processo',
  },
  {
    id: 'bid-frete',
    icon: <Truck size={32} weight="duotone" />,
    name: 'BID Frete',
    tagline: 'Licitação inteligente de fretes internacionais',
    desc: 'Compare ofertas de múltiplos fornecedores com ranking automático, cálculo de savings e aprovação em 2 cliques. Histórico completo de cotações.',
    tags: ['Ranking automático', 'Multi-fornecedor', 'Savings', 'Histórico'],
    cat: 'Cotações',
    catColor: '#fbbf24',
    catBg: 'rgba(245,158,11,0.1)',
    price: 'R$ 1,99',
    unit: '/ cotação',
  },
  {
    id: 'bid-cambio',
    icon: <CurrencyDollar size={32} weight="duotone" />,
    name: 'BID Câmbio',
    tagline: 'Marketplace de corretoras de câmbio',
    desc: 'Comparativo automático entre corretoras com PTAX integrado e cálculo de economia real para operações de COMEX. Histórico de spreads e performance.',
    tags: ['Comparativo', 'PTAX integrado', 'Economia real', 'Spreads'],
    cat: 'Cotações',
    catColor: '#fbbf24',
    catBg: 'rgba(245,158,11,0.1)',
    price: 'R$ 2,99',
    unit: '/ cotação',
  },
  {
    id: 'simula-custo',
    icon: <Calculator size={32} weight="duotone" />,
    name: 'Simula Custo',
    tagline: 'Simulação de custos de importação e exportação',
    desc: 'Calcule o custo real das suas operações com múltiplos cenários, impostos automáticos e projeção de margens. Exporte em PDF para análise.',
    tags: ['Multi-cenário', 'Impostos automáticos', 'Margem', 'Exportação PDF'],
    cat: 'Simulação',
    catColor: '#34d399',
    catBg: 'rgba(16,185,129,0.1)',
    price: 'R$ 10,99',
    unit: '/ mês',
  },
  {
    id: 'nf-importacao',
    icon: <FileText size={32} weight="duotone" />,
    name: 'NF Importação',
    tagline: 'Notas fiscais de importação sem burocracia',
    desc: 'Gestão completa de NFs de importação com DI vinculada, rateio automático de despesas aduaneiras e exportação para sistemas contábeis.',
    tags: ['DI vinculada', 'Rateio automático', 'Integração contábil', 'Arquivamento'],
    cat: 'Operações',
    catColor: '#818cf8',
    catBg: 'rgba(99,102,241,0.1)',
    price: 'R$ 1,99',
    unit: '/ documento',
  },
  {
    id: 'smart-read',
    icon: <Sparkle size={32} weight="duotone" />,
    name: 'Smart Read',
    tagline: 'Inteligência documental com IA para COMEX',
    desc: 'Extração automática de dados, conferência, análise de riscos e Q&A conversacional com IA sobre qualquer documento de comércio exterior.',
    tags: ['Extração com IA', 'Q&A documental', 'Análise de riscos', 'Multi-formato'],
    cat: 'Inteligência',
    catColor: '#a78bfa',
    catBg: 'rgba(139,92,246,0.1)',
    price: 'R$ 2,00',
    unit: '/ análise',
  },
]

export function Produtos() {
  return (
    <div>
      {/* Header */}
      <section className="section-sm" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)' }}>
        <div className="container">
          <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Módulos</p>
          <h1 className="text-h1" style={{ marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Tudo que você precisa<br />
            <span className="gradient-text">para operar COMEX</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', fontSize: '1.0625rem' }}>
            Módulos independentes que se integram nativamente. Contrate só o que usar, escale quando precisar.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {PRODUCTS.map(p => (
              <div
                key={p.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{
                    width: '56px', height: '56px', minWidth: '56px', flexShrink: 0,
                    borderRadius: '14px', background: p.catBg, color: p.catColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {p.icon}
                  </div>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: '9999px',
                    background: p.catBg, color: p.catColor,
                    border: `1px solid ${p.catBg.replace('0.1', '0.25')}`,
                    flexShrink: 0,
                  }}>{p.cat}</span>
                </div>

                {/* Body */}
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{p.name}</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{p.tagline}</p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem' }}>{p.desc}</p>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {p.tags.map(tag => (
                    <span key={tag} className="badge badge-accent">{tag}</span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--bg-elevated)', marginTop: 'auto' }}>
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '2px' }}>A partir de</p>
                    <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '1.0625rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {p.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.unit}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`/cadastro?produto=${p.id}&trial=true`}
                      className="btn btn-secondary btn-sm"
                    >
                      Testar
                    </a>
                    <Link
                      to={`/produtos/${p.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Detalhes
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--bg-elevated)' }}>
        <div className="container container-narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Não sabe por onde começar?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Fale com nosso time e monte o stack ideal para a sua operação.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cadastro?trial=true" className="btn btn-primary">Testar gratuitamente</a>
            <Link to="/precos" className="btn btn-secondary">Ver preços</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

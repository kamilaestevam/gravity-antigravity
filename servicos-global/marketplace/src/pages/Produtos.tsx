import { Link } from 'react-router-dom'
import {
  Globe,
  FileText,
  ArrowRight,
  ChartBar,
  Calculator,
  Star,
} from '@phosphor-icons/react'

const PRODUCTS = [
  {
    id: 'simulador-comex',
    icon: <Globe size={32} weight="duotone" />,
    name: 'Simulador Comex',
    tagline: 'Inteligência para importação e exportação',
    desc: 'Calcule custos reais de operações de comércio exterior com precisão. Impostos, fretes, variações cambiais — tudo em um único simulador.',
    tags: ['Importação', 'Exportação', 'Custos Reais'],
    rating: 4.9,
    reviews: 128,
    color: '#818cf8',
  },
  {
    id: 'nf-importacao',
    icon: <FileText size={32} weight="duotone" />,
    name: 'NF Importação',
    tagline: 'Notas fiscais de importação sem burocracia',
    desc: 'Emissão e gestão de notas fiscais de importação. Integração com SEFAZ, validação automática e arquivamento seguro.',
    tags: ['NF-e', 'SEFAZ', 'Compliance'],
    rating: 4.7,
    reviews: 84,
    color: '#818cf8',
  },
  {
    id: 'dashboard',
    icon: <ChartBar size={32} weight="duotone" />,
    name: 'Dashboard Analítico',
    tagline: 'Métricas que guiam decisões',
    desc: 'Dashboards personalizados com KPIs em tempo real. Conecta automaticamente com todos os módulos contratados.',
    tags: ['KPIs', 'Tempo Real', 'Personalizado'],
    rating: 4.8,
    reviews: 203,
    color: '#34d399',
    comingSoon: false,
  },
  {
    id: 'simulacusto',
    icon: <Calculator size={32} weight="duotone" />,
    name: 'SimulaCusto',
    tagline: 'Precificação inteligente de produtos',
    desc: 'Calcule o custo real dos seus produtos considerando insumos, mão de obra, impostos e margem. Precifique com confiança.',
    tags: ['Custos', 'Precificação', 'Margem'],
    rating: 4.6,
    reviews: 67,
    color: '#fb923c',
    comingSoon: true,
  },
  {
    id: 'bid-frete',
    icon: <Globe size={32} weight="duotone" />,
    name: 'BID Frete Internacional',
    tagline: 'Licitação de fretes com inteligência artificial',
    desc: 'Compare ofertas de múltiplos fornecedores internacionais. Automatize a seleção com IA baseada em preço, tempo de trânsito e histórico. Aprove em 2 cliques.',
    tags: ['Frete', 'Logística', 'IA'],
    rating: 4.8,
    reviews: 142,
    color: '#34d399',
  },
]

export function Produtos() {
  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'

  return (
    <div>
      {/* Header */}
      <section className="section-sm" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)' }}>
        <div className="container">
          <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Catálogo</p>
          <h1 className="text-h1" style={{ marginBottom: '0.75rem' }}>
            Produtos <span className="gradient-text">especializados</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', fontSize: '1.0625rem' }}>
            Cada produto consome os serviços compartilhados da plataforma.
            Você paga uma vez pelos serviços, usa em todos os produtos.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {PRODUCTS.map(p => (
              <div
                key={p.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}
              >
                {p.comingSoon && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'var(--warning-10)',
                    color: 'var(--warning)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.625rem',
                    borderRadius: '99px',
                    border: '1px solid rgba(245,158,11,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    Em breve
                  </div>
                )}

                <div style={{ display: 'flex', align: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    minWidth: '56px',
                    flexShrink: 0,
                    borderRadius: '14px',
                    background: `${p.color}18`,
                    color: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {p.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {p.name}
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{p.tagline}</p>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem', flex: 1 }}>
                  {p.desc}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {p.tags.map(tag => (
                    <span key={tag} className="badge badge-accent">{tag}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} color={i < Math.floor(p.rating) ? 'var(--warning)' : 'var(--bg-elevated)'} weight="fill" />
                    ))}
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>{p.rating} ({p.reviews} avaliações)</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  {!p.comingSoon ? (
                    <>
                      <Link
                        to={`/trial?produto=${p.id}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        Teste Grátis
                      </Link>
                      <Link
                        to={`/produtos/${p.id}`}
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        Ver Detalhes
                        <ArrowRight size={15} />
                      </Link>
                    </>
                  ) : (
                    <a
                      href={`${CONFIGURADOR}/waitlist?produto=${p.id}`}
                      className="btn btn-secondary"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Entrar na Waitlist
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

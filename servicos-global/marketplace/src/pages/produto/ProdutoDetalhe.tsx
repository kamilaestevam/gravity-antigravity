import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Globe,
  FileText,
  ChartBar,
  Calculator,
  Rocket,
  Star,
} from '@phosphor-icons/react'

const PRODUCTS: Record<string, {
  name: string
  tagline: string
  desc: string
  icon: JSX.Element
  color: string
  tags: string[]
  rating: number
  reviews: number
  features: string[]
  comingSoon?: boolean
}> = {
  'simulador-comex': {
    name: 'Simulador Comex',
    tagline: 'Inteligencia para importacao e exportacao',
    desc: 'Calcule custos reais de operacoes de comercio exterior com precisao. Impostos, fretes, variacoes cambiais — tudo em um unico simulador.',
    icon: <Globe size={40} weight="duotone" />,
    color: '#818cf8',
    tags: ['Importacao', 'Exportacao', 'Custos Reais'],
    rating: 4.9,
    reviews: 128,
    features: [
      'Todos os paises do mundo',
      'Simulacoes ilimitadas',
      'Relatorios exportaveis',
      'Integracao WhatsApp para alertas',
      'Historico completo de simulacoes',
      'Calculo de impostos automatico',
    ],
  },
  'nf-importacao': {
    name: 'NF Importacao',
    tagline: 'Notas fiscais de importacao sem burocracia',
    desc: 'Emissao e gestao de notas fiscais de importacao. Integracao com SEFAZ, validacao automatica e arquivamento seguro.',
    icon: <FileText size={40} weight="duotone" />,
    color: '#818cf8',
    tags: ['NF-e', 'SEFAZ', 'Compliance'],
    rating: 4.7,
    reviews: 84,
    features: [
      'Emissao automatica de NF-e',
      'Validacao com SEFAZ em tempo real',
      'Arquivamento digital seguro',
      'Relatorios fiscais completos',
      'Integracao com ERP',
      'Suporte a retificacoes',
    ],
  },
  'dashboard': {
    name: 'Dashboard Analitico',
    tagline: 'Metricas que guiam decisoes',
    desc: 'Dashboards personalizados com KPIs em tempo real. Conecta automaticamente com todos os modulos contratados.',
    icon: <ChartBar size={40} weight="duotone" />,
    color: '#34d399',
    tags: ['KPIs', 'Tempo Real', 'Personalizado'],
    rating: 4.8,
    reviews: 203,
    features: [
      'KPIs em tempo real',
      'Widgets personalizaveis',
      'Conexao automatica com modulos',
      'Exportacao de dados',
      'Filtros por periodo e equipe',
      'Alertas configuráveis',
    ],
  },
  'simulacusto': {
    name: 'SimulaCusto',
    tagline: 'Precificacao inteligente de produtos',
    desc: 'Calcule o custo real dos seus produtos considerando insumos, mao de obra, impostos e margem. Precifique com confianca.',
    icon: <Calculator size={40} weight="duotone" />,
    color: '#fb923c',
    tags: ['Custos', 'Precificacao', 'Margem'],
    rating: 4.6,
    reviews: 67,
    features: [
      'Calculo de custo unitario',
      'Gestao de insumos e componentes',
      'Margem e markup automaticos',
      'Simulacoes em lote',
      'Comparativo entre cenarios',
      'Exportacao para Excel/PDF',
    ],
    comingSoon: true,
  },
  'bid-frete': {
    name: 'BID Frete Internacional',
    tagline: 'Licitacao de fretes com inteligencia artificial',
    desc: 'Compare ofertas de multiplos fornecedores internacionais. Automatize a selecao com IA baseada em preco, tempo de transito e historico. Aprove em 2 cliques.',
    icon: <Globe size={40} weight="duotone" />,
    color: '#34d399',
    tags: ['Frete', 'Logistica', 'IA'],
    rating: 4.8,
    reviews: 142,
    features: [
      'Cotacao com multiplos fornecedores',
      'Ranking automatico por IA',
      'Portal do fornecedor integrado',
      'Historico e rating de fornecedores',
      'Comparativo lado a lado',
      'Aprovacao em 2 cliques',
    ],
  },
}

export function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'

  // Redireciona simulador-comex para sua pagina dedicada
  if (id === 'simulador-comex') {
    return <Navigate to="/produtos/simulador-comex" replace />
  }

  const product = id ? PRODUCTS[id] : undefined

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <p style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--bg-elevated)', lineHeight: 1 }}>404</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Produto nao encontrado</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>O produto que voce procura nao existe no catalogo.</p>
        <Link to="/produtos" className="btn btn-primary">Ver Todos os Produtos</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <section className="section-sm" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)' }}>
        <div className="container">
          <Link to="/produtos" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} />
            Voltar para Produtos
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              minWidth: '72px',
              borderRadius: '18px',
              background: `${product.color}18`,
              color: product.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {product.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{product.name}</h1>
                {product.comingSoon && (
                  <span style={{
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
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem' }}>{product.tagline}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} color={i < Math.floor(product.rating) ? 'var(--warning)' : 'var(--bg-elevated)'} weight="fill" />
              ))}
            </div>
            <span style={{ color: 'var(--text-muted)' }}>{product.rating} ({product.reviews} avaliacoes)</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container" style={{ maxWidth: '720px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            {product.desc}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {product.tags.map(tag => (
              <span key={tag} className="badge badge-accent">{tag}</span>
            ))}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Recursos inclusos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {product.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={18} weight="bold" color="var(--success)" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {product.comingSoon ? (
              <a
                href={`${CONFIGURADOR}/waitlist?produto=${id}`}
                className="btn btn-primary btn-lg"
                style={{ justifyContent: 'center' }}
              >
                Entrar na Waitlist
              </a>
            ) : (
              <>
                <Link
                  to={`/trial?produto=${id}`}
                  className="btn btn-primary btn-lg"
                  style={{ justifyContent: 'center' }}
                >
                  <Rocket size={18} weight="duotone" />
                  Comecar Trial Gratis
                </Link>
                <Link to="/precos" className="btn btn-secondary btn-lg">
                  Ver Precos
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

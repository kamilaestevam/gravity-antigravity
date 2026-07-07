import React from 'react'
import {
  Bell,
  ChartBar,
  ChartPie,
  CurrencyDollar,
  Funnel,
  Globe,
  ListBullets,
  ThumbsUp,
  Trophy,
  Warning,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type BlocoInsightBidFrete = {
  num: number
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const BLOCOS_UX10: BlocoInsightBidFrete[] = [
  {
    num: 1,
    rotulo: 'KPIs do topo',
    descricao:
      'Três cards fixos: **Aguardando aprovação** (cotações pendentes de autorização de quem solicitou), **Aguardando resposta** e **Tempo médio de resposta**, com contagem, volume USD/meta e tooltip com lista de cotações e distribuição por modal.',
    icone: Warning,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.28)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: 2,
    rotulo: 'Mapa global',
    descricao:
      'Globo ou mapa plano com **rotas** operacionais, pins por terminal e painel **Refinar mapa** (operação, modal, origem, destino, status). Clique na rota abre o detalhe.',
    icone: Globe,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: 3,
    rotulo: 'Alertas do dia',
    descricao:
      'Cards de atenção (vencimentos, respostas, aprovações, novas cotações) com contagem por **dia de referência**. Setas ◀▶ trocam a data; clique abre modal com a lista.',
    icone: Bell,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.28)',
    fundo: 'rgba(248,113,113,.08)',
  },
  {
    num: 4,
    rotulo: 'Funil por status',
    descricao:
      'Barras horizontais mostram a distribuição das **cotações ativas** em cada status configurado do workspace (paridade com a config de status).',
    icone: Funnel,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: 5,
    rotulo: 'Evolução mensal',
    descricao:
      'Gráfico de barras por mês: cotações **aprovadas**, **em andamento** e **recusadas** nos últimos seis meses do escopo selecionado.',
    icone: ChartBar,
    cor: '#3b82f6',
    borda: 'rgba(59,130,246,.28)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    num: 6,
    rotulo: 'Distribuição por modal',
    descricao:
      'Donut com a divisão **Marítimo × Aéreo × Rodoviário** e legenda com contagem e percentual por modal.',
    icone: ChartPie,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: 7,
    rotulo: 'Câmbio PTAX',
    descricao:
      'Taxas **BACEN** (USD, EUR, CNY…) em abas **Hoje**, **Histórico** e **Futuro**; ao lado, **spread médio** compara a taxa configurada no produto com a PTAX.',
    icone: CurrencyDollar,
    cor: '#3b82f6',
    borda: 'rgba(59,130,246,.28)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    num: 8,
    rotulo: 'Melhor cotação',
    descricao:
      'Destaque da cotação de **maior saving** do mês: rota origem→destino, transit time, percentual e valor USD ganho.',
    icone: Trophy,
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.28)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    num: 9,
    rotulo: 'Top Incoterms',
    descricao:
      'Ranking dos **Incoterms** mais usados nas cotações, com barra de progresso e percentual por termo.',
    icone: ListBullets,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.28)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: 10,
    rotulo: 'Taxa de aprovação',
    descricao:
      'Donut de prazos: cotações **em tempo**, **atrasadas** e **sem resposta** no fluxo de aprovação do workspace.',
    icone: ThumbsUp,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

function CardBlocoInsightBidFrete({ bloco }: { bloco: BlocoInsightBidFrete }) {
  const Icone = bloco.icone
  return (
    <div
      style={{
        borderRadius: 12,
        padding: '12px 14px',
        background: bloco.fundo,
        border: `1px solid ${bloco.borda}`,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8,12,24,.35)',
            border: `1px solid ${bloco.borda}`,
          }}
        >
          <Icone size={17} weight="duotone" color={bloco.cor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '.76rem', color: '#e2e8f0', lineHeight: 1.35 }}>
            <span style={{ color: '#818cf8', marginRight: 6, fontSize: '.68rem' }}>
              {String(bloco.num).padStart(2, '0')}
            </span>
            {bloco.rotulo}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
            {bloco.descricao.split('**').map((parte, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>
                  {parte}
                </strong>
              ) : (
                parte
              ),
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ManualInfograficoBidFreteInsights() {
  return (
    <div
      style={{
        background:
          'linear-gradient(165deg, rgba(96,165,250,.06) 0%, rgba(148,163,184,.04) 48%, rgba(129,140,248,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: 20,
      }}
    >
      <p
        style={{
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          margin: '0 0 6px',
        }}
      >
        Mapa das métricas · UX 10
      </p>
      <p style={{ margin: '0 0 16px', fontSize: '.82rem', fontWeight: 700, color: '#e2e8f0' }}>
        O que cada bloco da tela Insights mostra
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {BLOCOS_UX10.map(bloco => (
          <CardBlocoInsightBidFrete key={bloco.num} bloco={bloco} />
        ))}
      </div>
    </div>
  )
}

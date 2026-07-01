import React from 'react'
import {
  ChartBar,
  ChartPie,
  ChartDonut,
  CurrencyDollar,
  Files,
  ListChecks,
  Timer,
  TrendUp,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type MetricaInsight = {
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

type GrupoMetricas = {
  titulo: string
  subtitulo?: string
  metricas: MetricaInsight[]
  colunas?: number
}

const GRUPOS: GrupoMetricas[] = [
  {
    titulo: 'KPIs do topo',
    subtitulo: 'Quatro cards resumem volume, acurácia e economia do workspace',
    colunas: 2,
    metricas: [
      {
        rotulo: 'Documentos lidos',
        descricao: 'Total de documentos extraídos nas leituras concluídas da amostra.',
        icone: Files,
        cor: '#818cf8',
        borda: 'rgba(129,140,248,.28)',
        fundo: 'rgba(99,102,241,.08)',
      },
      {
        rotulo: 'Campos lidos',
        descricao: 'Soma de todos os campos que a IA preencheu — base para acerto, erro e savings.',
        icone: ListChecks,
        cor: '#60a5fa',
        borda: 'rgba(96,165,250,.28)',
        fundo: 'rgba(96,165,250,.08)',
      },
      {
        rotulo: 'Saving digitação',
        descricao: 'Tempo economizado vs. digitação manual (base do estudo − cronômetro da leitura).',
        icone: Timer,
        cor: '#34d399',
        borda: 'rgba(52,211,153,.28)',
        fundo: 'rgba(52,211,153,.08)',
      },
      {
        rotulo: 'Saving em erros',
        descricao: 'Quantidade de campos alterados na conferência; o tempo evitado aparece no tooltip e em Economia estimada.',
        icone: TrendUp,
        cor: '#a78bfa',
        borda: 'rgba(167,139,250,.28)',
        fundo: 'rgba(139,92,246,.08)',
      },
    ],
  },
  {
    titulo: 'Evolução e acurácia',
    colunas: 2,
    metricas: [
      {
        rotulo: 'Evolução diária',
        descricao: 'Barras por dia — verde = acertos, vermelho = erros editados. Filtros de 7, 30, 60 ou 90 dias (ou intervalo customizado).',
        icone: ChartBar,
        cor: '#3b82f6',
        borda: 'rgba(59,130,246,.28)',
        fundo: 'rgba(59,130,246,.08)',
      },
      {
        rotulo: 'Campos lidos — corretos × errados',
        descricao: 'Donut e taxa de acerto. **Acerto** = campo não editado na conferência; **erro** = campo alterado pelo usuário.',
        icone: ChartPie,
        cor: '#34d399',
        borda: 'rgba(52,211,153,.28)',
        fundo: 'rgba(52,211,153,.08)',
      },
    ],
  },
  {
    titulo: 'Distribuição, economia e rankings',
    colunas: 3,
    metricas: [
      {
        rotulo: 'Tipos de documento',
        descricao: 'Barras horizontais com volume e % por tipo (Invoice, BL, AWB, etc.) na amostra.',
        icone: Files,
        cor: '#818cf8',
        borda: 'rgba(129,140,248,.28)',
        fundo: 'rgba(99,102,241,.08)',
      },
      {
        rotulo: 'Economia estimada',
        descricao: 'Detalha digitação evitada e correção de erros. Na tela, **Base de cálculo →** abre a metodologia completa.',
        icone: CurrencyDollar,
        cor: '#fbbf24',
        borda: 'rgba(251,191,36,.28)',
        fundo: 'rgba(251,191,36,.08)',
      },
      {
        rotulo: 'Resultado por tipo de fornecedor',
        descricao: 'Rankings top 5 de maiores acertos e erros por emissor (exportador, agente de carga, etc.), conforme o tipo de documento.',
        icone: UsersThree,
        cor: '#f59e0b',
        borda: 'rgba(245,158,11,.28)',
        fundo: 'rgba(245,158,11,.08)',
      },
    ],
  },
]

function CardMetricaInsight({ metrica }: { metrica: MetricaInsight }) {
  const Icone = metrica.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '12px 14px',
      background: metrica.fundo,
      border: `1px solid ${metrica.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${metrica.borda}`,
        }}>
          <Icone size={17} weight="duotone" color={metrica.cor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontWeight: 800,
            fontSize: '.76rem',
            color: '#e2e8f0',
            lineHeight: 1.35,
            letterSpacing: '.01em',
          }}>
            {metrica.rotulo}
          </p>
          <p style={{
            margin: '6px 0 0',
            fontSize: '.72rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            {metrica.descricao.split('**').map((parte, i) =>
              i % 2 === 1
                ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
                : parte,
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Manual Smart Docs §03 — mapa das métricas da tela Insights */
export function ManualInfograficoSmartDocsInsights() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 48%, rgba(52,211,153,.04) 100%)',
      border: '1px solid rgba(148,163,184,.16)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 20,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'var(--ws-muted,#94a3b8)', margin: '0 0 6px',
          }}>
            Mapa das métricas
          </p>
          <p style={{
            margin: 0,
            fontSize: '.82rem',
            fontWeight: 700,
            color: '#e2e8f0',
            lineHeight: 1.35,
          }}>
            O que cada bloco da tela Insights mostra
          </p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(52,211,153,.1)',
          border: '1px solid rgba(52,211,153,.22)',
          fontSize: '.64rem',
          fontWeight: 700,
          color: '#6ee7b7',
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          <ChartDonut size={14} weight="duotone" />
          Cockpit Smart Docs
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {GRUPOS.map((grupo) => (
          <section key={grupo.titulo}>
            <p style={{
              margin: '0 0 10px',
              fontSize: '.7rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}>
              {grupo.titulo}
            </p>
            {grupo.subtitulo && (
              <p style={{
                margin: '-4px 0 10px',
                fontSize: '.7rem',
                color: CORPO_70,
                lineHeight: 1.45,
              }}>
                {grupo.subtitulo}
              </p>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${grupo.colunas === 3 ? 200 : 240}px, 1fr))`,
              gap: 10,
            }}>
              {grupo.metricas.map((metrica) => (
                <CardMetricaInsight key={metrica.rotulo} metrica={metrica} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p style={{
        fontSize: '.68rem',
        color: CORPO_70,
        margin: '16px 0 0',
        lineHeight: 1.5,
        paddingTop: 14,
        borderTop: '1px solid rgba(148,163,184,.12)',
      }}>
        Todos os números usam leituras <strong style={{ color: '#cbd5e1' }}>concluídas</strong> do workspace atual.
        Rankings atribuem acertos e erros ao <strong style={{ color: '#cbd5e1' }}>emissor do documento</strong> (exportador em invoice, agente de carga em BL, etc.).
      </p>
    </div>
  )
}

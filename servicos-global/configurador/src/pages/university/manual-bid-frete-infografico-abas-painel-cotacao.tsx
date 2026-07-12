import React from 'react'
import {
  ChatCircleDots,
  Compass,
  Files,
  PaperPlaneTilt,
  Scales,
  SlidersHorizontal,
  Sparkle,
  SquaresFour,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type ManualPilarAbasPainelCotacaoBidFreteId = '01' | '02' | '03' | '04' | '05' | '06'

type PilarAbasPainelCotacao = {
  num: ManualPilarAbasPainelCotacaoBidFreteId
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

export const MANUAL_PILARES_ABAS_PAINEL_COTACAO_BID_FRETE: Record<
  ManualPilarAbasPainelCotacaoBidFreteId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: Compass, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '02': { icone: SlidersHorizontal, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '03': { icone: PaperPlaneTilt, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
  '04': { icone: Scales, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(251,191,36,.08)' },
  '05': { icone: ChatCircleDots, cor: '#f87171', borda: 'rgba(248,113,113,.32)', fundo: 'rgba(239,68,68,.08)' },
  '06': { icone: Files, cor: '#818cf8', borda: 'rgba(129,140,248,.32)', fundo: 'rgba(99,102,241,.1)' },
}

const PILARES: PilarAbasPainelCotacao[] = [
  {
    num: '01',
    rotulo: 'Visão geral',
    descricao:
      'Cockpit com **cabeçalho**, **prazo**, **métricas**, **linha do tempo**, **Insights Inteligente** e cards **Detalhes gerais**, **Rota** e **Carga**.',
    icone: Compass,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '02',
    rotulo: 'Dados gerais',
    descricao:
      '**Alguns campos da cotação podem ser editados** — **tipo de operação**, **modal**, **incoterm**, **visibilidade**, **datas** e identificadores da solicitação.',
    icone: SlidersHorizontal,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '03',
    rotulo: 'Solicitação de Cotação',
    descricao:
      'Cada **disparo** aos fornecedores: e-mails enviados, visualizações, **respostas** e **recusas** por agente de carga.',
    icone: PaperPlaneTilt,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: '04',
    rotulo: 'Propostas',
    descricao:
      'Compare **frete total**, **transit time**, **escala/transbordo** e **prazo de pagamento** — aprove a melhor oferta.',
    icone: Scales,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: '05',
    rotulo: 'Comentários',
    descricao:
      'Histórico de observações internas e trocas com fornecedores sobre a negociação (**em breve**).',
    icone: ChatCircleDots,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.32)',
    fundo: 'rgba(239,68,68,.08)',
  },
  {
    num: '06',
    rotulo: 'Documentos',
    descricao:
      'Anexos comerciais, **packing lists** e demais arquivos vinculados à cotação (**em breve**).',
    icone: Files,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.1)',
  },
]

export function ManualPilaresAbasPainelCotacaoBidFreteChips({
  pilares,
}: {
  pilares: ManualPilarAbasPainelCotacaoBidFreteId[]
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Abas ${pilares.join(' e ')} do cockpit da cotação`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_ABAS_PAINEL_COTACAO_BID_FRETE[num]
        const Icone = pilar.icone
        return (
          <div
            key={num}
            title={`Aba ${num}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
              {num}
            </span>
            <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

function CardPilar({ pilar }: { pilar: PilarAbasPainelCotacao }) {
  const Icone = pilar.icone
  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 10px 9px',
      background: pilar.fundo,
      border: `1px solid ${pilar.borda}`,
      height: '100%',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${pilar.borda}`,
        }}>
          <Icone size={14} weight="duotone" color={pilar.cor} />
        </div>
        <p style={{
          margin: 0,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          color: pilar.cor,
        }}>
          {pilar.num}
        </p>
      </div>
      <p style={{
        margin: 0,
        fontSize: '.72rem',
        fontWeight: 800,
        color: '#e2e8f0',
        lineHeight: 1.3,
      }}>
        {pilar.rotulo}
      </p>
      <p style={{
        margin: '6px 0 0',
        fontSize: '.66rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        <ManualInfograficoRichText texto={pilar.descricao} />
      </p>
    </div>
  )
}

function RodapeAbasPainelCotacao() {
  const abas: ManualPilarAbasPainelCotacaoBidFreteId[] = ['01', '02', '03', '04', '05', '06']

  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 12px',
      background: 'rgba(8,12,24,.25)',
      border: '1px solid rgba(148,163,184,.12)',
      fontSize: '.68rem',
      lineHeight: 1.5,
      color: CORPO_70,
    }}>
      <p style={{ margin: 0, fontWeight: 800, color: '#c7d2fe', fontSize: '.72rem', lineHeight: 1.4 }}>
        Seis abas · cockpit da cotação
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 5,
          margin: '10px 0 8px',
        }}
        aria-hidden
      >
        {abas.map((num, indice) => {
          const pilar = MANUAL_PILARES_ABAS_PAINEL_COTACAO_BID_FRETE[num]
          return (
            <React.Fragment key={num}>
              {indice > 0 ? (
                <span style={{ color: '#64748b', fontWeight: 800, fontSize: '.7rem', lineHeight: 1 }}>×</span>
              ) : null}
              <span
                title={PILARES[indice]?.rotulo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 28,
                  height: 24,
                  padding: '0 7px',
                  borderRadius: 6,
                  border: `1px solid ${pilar.borda}`,
                  background: pilar.fundo,
                  color: pilar.cor,
                  fontSize: '.62rem',
                  fontWeight: 800,
                  letterSpacing: '.04em',
                }}
              >
                {num}
              </span>
            </React.Fragment>
          )
        })}
        <span style={{ color: '#64748b', fontWeight: 800, fontSize: '.75rem', lineHeight: 1, margin: '0 2px' }}>→</span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 9px',
          borderRadius: 999,
          border: '1px solid rgba(52,211,153,.35)',
          background: 'rgba(52,211,153,.12)',
          color: '#6ee7b7',
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          Painel completo
        </span>
      </div>

      <p style={{ margin: 0 }}>
        <ManualInfograficoRichText texto="Navegue entre **Visão geral**, **Dados gerais**, **Solicitação**, **Propostas**, **Comentários** e **Documentos** — cada aba detalhada nos passos abaixo." />
      </p>
    </div>
  )
}

/** Manual BID Frete §7.02 — mapa das seis abas do Painel da Cotação */
export function ManualInfograficoBidFreteAbasPainelCotacao() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(129,140,248,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 20,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <SquaresFour size={18} weight="duotone" color="#818cf8" />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#c7d2fe',
              background: 'rgba(129,140,248,.12)',
              border: '1px solid rgba(129,140,248,.32)',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              <Sparkle size={12} weight="fill" />
              Painel da Cotação · abas
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.9rem',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.35,
            letterSpacing: '-.01em',
          }}>
            <ManualInfograficoRichText texto="As **seis abas** do cockpit da cotação" />
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        gap: 8,
        marginBottom: 14,
      }}>
        {PILARES.map((pilar) => (
          <CardPilar key={pilar.num} pilar={pilar} />
        ))}
      </div>

      <RodapeAbasPainelCotacao />
    </div>
  )
}

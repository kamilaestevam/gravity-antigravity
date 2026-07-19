import React from 'react'
import {
  ArrowsLeftRight,
  PencilSimple,
  Sparkle,
  UploadSimple,
  type Icon,
} from '@phosphor-icons/react'
import { MANUAL_TITULO_INFOGRAFICO_ESTILO } from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type FormaCotacaoAvulsa = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  disponivel: boolean
}

const FORMAS: FormaCotacaoAvulsa[] = [
  {
    num: '01',
    rotulo: 'Manual',
    descricao: 'Preencher o **formulário** passo a passo no assistente.',
    icone: PencilSimple,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.35)',
    fundo: 'rgba(52,211,153,.08)',
    disponivel: true,
  },
  {
    num: '02',
    rotulo: 'Via planilha',
    descricao: 'Importe **Excel**, **CSV** ou **XML** para gerar a cotação em lote.',
    icone: UploadSimple,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
    disponivel: false,
  },
  {
    num: '03',
    rotulo: 'Via Smart Docs',
    descricao: 'A **IA** extrai dados do documento comercial e pré-preenche a cotação.',
    icone: Sparkle,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
    disponivel: true,
  },
  {
    num: '04',
    rotulo: 'Por API',
    descricao: 'Integre via **API Cockpit** ou **ERP** para criar cotações sem abrir a tela.',
    icone: ArrowsLeftRight,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.06)',
    disponivel: false,
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function badgeStatusForma(disponivel: boolean): React.CSSProperties {
  if (disponivel) {
    return {
      color: '#6ee7b7',
      background: 'rgba(52,211,153,.12)',
      border: '1px solid rgba(52,211,153,.28)',
    }
  }
  return {
    color: '#fbbf24',
    background: 'rgba(251,191,36,.1)',
    border: '1px solid rgba(251,191,36,.32)',
  }
}

function CardForma({ forma }: { forma: FormaCotacaoAvulsa }) {
  const Icone = forma.icone
  const badgeStatus = badgeStatusForma(forma.disponivel)
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: forma.fundo,
      border: `1px ${forma.disponivel ? 'solid' : 'dashed'} ${forma.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${forma.borda}`,
        }}>
          <Icone size={20} weight="duotone" color={forma.cor} aria-hidden />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 4,
          }}>
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              color: forma.cor,
            }}>
              {forma.num}
            </span>
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.35,
            }}>
              {forma.rotulo}
            </p>
            <span style={{
              fontSize: '.56rem',
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              borderRadius: 999,
              padding: '2px 8px',
              ...badgeStatus,
            }}>
              {forma.disponivel ? 'Disponível' : 'Em breve'}
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.68rem',
            lineHeight: 1.45,
            color: CORPO_70,
          }}>
            {renderizarNegrito(forma.descricao)}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Manual BID Frete § Nova cotação — mapa das quatro formas de criar cotação. */
export function ManualInfograficoBidFreteCotacaoAvulsaFormas() {
  return (
    <div
      role="group"
      aria-label="Quatro formas de criar cotação — Manual, planilha, Smart Docs e API"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(56,189,248,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Quatro formas de criar cotação
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {FORMAS.map((forma) => (
          <CardForma key={forma.num} forma={forma} />
        ))}
      </div>
    </div>
  )
}

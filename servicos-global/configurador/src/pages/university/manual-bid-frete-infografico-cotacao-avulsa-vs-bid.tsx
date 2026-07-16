import React from 'react'
import { ArrowsLeftRight, FileText, Stack, type Icon } from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type ColunaComparacao = {
  rotulo: string
  subtitulo: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  bullets: string[]
}

const COLUNAS: ColunaComparacao[] = [
  {
    rotulo: 'Cotação avulsa',
    subtitulo: 'Solicitação única',
    icone: FileText,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.35)',
    fundo: 'rgba(52,211,153,.08)',
    bullets: [
      '**Uma** cotação por vez',
      'Uma rota ou operação isolada',
      'Envio independente aos fornecedores',
    ],
  },
  {
    rotulo: 'BID',
    subtitulo: 'Conjunto de cotações',
    icone: Stack,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.1)',
    bullets: [
      '**Várias** cotações no mesmo pacote',
      'Negociação conjunta com fornecedores',
      'Referência única para o grupo',
    ],
  },
]

function CardComparacao({ coluna }: { coluna: ColunaComparacao }) {
  const Icone = coluna.icone
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${coluna.borda}`,
        background: coluna.fundo,
        padding: '14px 14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${coluna.borda}`,
            background: 'rgba(8,12,24,.35)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icone size={18} weight="duotone" color={coluna.cor} aria-hidden />
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1.3 }}>
            {coluna.rotulo}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '.66rem', fontWeight: 600, color: coluna.cor, lineHeight: 1.35 }}>
            {coluna.subtitulo}
          </p>
        </div>
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {coluna.bullets.map((item) => (
          <li
            key={item}
            style={{ fontSize: '.68rem', lineHeight: 1.45, color: CORPO_70 }}
          >
            <ManualInfograficoRichText texto={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Manual BID Frete §6.02 — diferença entre cotação avulsa (única) e BID (pacote). */
export function ManualInfograficoBidFreteCotacaoAvulsaVsBid() {
  return (
    <div
      role="group"
      aria-label="Diferença entre Cotação avulsa e BID"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={{
        margin: '0 0 12px',
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#818cf8',
      }}>
        Cotação avulsa × BID
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        gap: 12,
        alignItems: 'stretch',
      }}>
        <CardComparacao coluna={COLUNAS[0]} />
        <div
          aria-hidden
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            paddingTop: 24,
          }}
        >
          <ArrowsLeftRight size={20} weight="bold" />
        </div>
        <CardComparacao coluna={COLUNAS[1]} />
      </div>

      <p style={{
        margin: '14px 0 0',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        <ManualInfograficoRichText texto="No menu **+ Nova**, escolha **Cotação avulsa** para uma solicitação isolada ou **BID** para agrupar várias cotações." />
      </p>
    </div>
  )
}

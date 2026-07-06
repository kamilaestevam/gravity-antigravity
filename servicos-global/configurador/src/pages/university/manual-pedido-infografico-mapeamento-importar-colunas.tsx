import React from 'react'
import {
  ArrowsLeftRight,
  Sparkle,
  Table,
  TextAa,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type PilarMapeamento = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const PILARES: PilarMapeamento[] = [
  {
    num: 'A',
    rotulo: 'Coluna do arquivo',
    descricao: 'Cabeçalho detectado na planilha (nome da coluna no `.xlsx`).',
    icone: Table,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: 'B',
    rotulo: 'Valor extraído',
    descricao: 'Amostra da **primeira linha de dados** — valide antes de confirmar.',
    icone: TextAa,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: 'C',
    rotulo: 'Campo do sistema',
    descricao: 'Campo do **Pedido** (Gravity). A **IA sugere o match**; ajuste no dropdown se preciso.',
    icone: ArrowsLeftRight,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.1)',
  },
  {
    num: 'D',
    rotulo: 'Confiança',
    descricao: 'Certeza da sugestão da IA no pareamento.',
    icone: Sparkle,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardPilar({ pilar }: { pilar: PilarMapeamento }) {
  const Icone = pilar.icone
  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 11px 9px',
      background: pilar.fundo,
      border: `1px solid ${pilar.borda}`,
      height: '100%',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0,
        width: 30,
        height: 30,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8,12,24,.35)',
        border: `1px solid ${pilar.borda}`,
        fontSize: '.58rem',
        fontWeight: 800,
        color: pilar.cor,
        letterSpacing: '.04em',
      }}>
        {pilar.num}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
          <Icone size={14} weight="duotone" color={pilar.cor} aria-hidden />
          <p style={{
            margin: 0,
            fontSize: '.72rem',
            fontWeight: 800,
            color: '#e2e8f0',
            lineHeight: 1.3,
          }}>
            {pilar.rotulo}
          </p>
        </div>
        <p style={{
          margin: 0,
          fontSize: '.66rem',
          lineHeight: 1.45,
          color: CORPO_70,
        }}>
          {renderizarNegrito(pilar.descricao)}
        </p>
        {pilar.num === 'D' ? (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 7,
          }}>
            {[
              { rotulo: '≥90%', cor: '#34d399', fundo: 'rgba(52,211,153,.15)' },
              { rotulo: '50–89%', cor: '#fbbf24', fundo: 'rgba(251,191,36,.12)' },
              { rotulo: '<50%', cor: '#94a3b8', fundo: 'rgba(148,163,184,.12)' },
            ].map((faixa) => (
              <span
                key={faixa.rotulo}
                style={{
                  fontSize: '.58rem',
                  fontWeight: 700,
                  color: faixa.cor,
                  background: faixa.fundo,
                  border: `1px solid color-mix(in srgb, ${faixa.cor} 35%, transparent)`,
                  borderRadius: 999,
                  padding: '2px 7px',
                  letterSpacing: '.02em',
                }}
              >
                {faixa.rotulo}
              </span>
            ))}
          </div>
        ) : null}
        {pilar.num === 'C' ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 7,
            fontSize: '.58rem',
            fontWeight: 700,
            color: '#c7d2fe',
            background: 'rgba(99,102,241,.14)',
            border: '1px solid rgba(129,140,248,.28)',
            borderRadius: 999,
            padding: '3px 8px',
            letterSpacing: '.03em',
          }}>
            <Sparkle size={11} weight="fill" aria-hidden />
            Match por IA
          </span>
        ) : null}
      </div>
    </div>
  )
}

/** Manual Pedido § Importar — mapa das 4 colunas do modal de Mapeamento (ao lado do print 08). */
export function ManualInfograficoPedidoListaImportarMapeamentoColunas() {
  return (
    <div
      role="group"
      aria-label="Mapa das colunas do modal de mapeamento na importação"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, rgba(99,102,241,.08) 0%, rgba(96,165,250,.05) 48%, rgba(52,211,153,.04) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 12,
        padding: '10px 10px 9px',
        boxShadow: '0 8px 28px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        flexShrink: 0,
      }}>
        <ArrowsLeftRight size={15} weight="duotone" color="#818cf8" aria-hidden />
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.07em',
          textTransform: 'uppercase',
          color: '#c7d2fe',
        }}>
          Mapa · colunas do mapeamento
        </span>
      </div>
      <div style={{
        flex: '1 1 0',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 8,
        alignItems: 'stretch',
      }}>
        {PILARES.map((pilar) => (
          <CardPilar key={pilar.num} pilar={pilar} />
        ))}
      </div>
      <p style={{
        margin: '8px 0 0',
        fontSize: '.62rem',
        lineHeight: 1.4,
        color: CORPO_70,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        Fluxo da tabela: <strong style={{ color: '#cbd5e1' }}>arquivo</strong>
        {' → '}
        <strong style={{ color: '#cbd5e1' }}>amostra</strong>
        {' → '}
        <strong style={{ color: '#cbd5e1' }}>campo Gravity</strong>
        {' · '}
        confiança da IA
      </p>
    </div>
  )
}

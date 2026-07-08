import React from 'react'
import {
  Airplane,
  Anchor,
  MapPin,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CampoOrigemDestino = {
  num: string
  rotulo: string
  descricaoPontos: string[]
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const CAMPOS: CampoOrigemDestino[] = [
  {
    num: '01',
    rotulo: 'Porto de origem',
    descricaoPontos: [
      'Selecione entre **16.950 portos**',
      'Busque pelo **nome do porto**',
      'Busque pelo **país**',
      '**Portos preferenciais**',
    ],
    icone: Anchor,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
  },
  {
    num: '02',
    rotulo: 'Aeroporto de origem',
    descricaoPontos: [
      'Selecione entre **7.914 aeroportos**',
      'Busque pelo **nome do aeroporto**',
      'Busque pelo **país**',
      '**Aeroportos preferenciais**',
    ],
    icone: Airplane,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '03',
    rotulo: 'Porto de destino',
    descricaoPontos: [
      'Selecione entre **16.950 portos**',
      'Busque pelo **nome do porto**',
      'Busque pelo **país**',
      '**Portos preferenciais**',
    ],
    icone: Anchor,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: '04',
    rotulo: 'Aeroporto de destino',
    descricaoPontos: [
      'Selecione entre **7.914 aeroportos**',
      'Busque pelo **nome do aeroporto**',
      'Busque pelo **país**',
      '**Aeroportos preferenciais**',
    ],
    icone: Airplane,
    cor: '#6ee7b7',
    borda: 'rgba(110,231,183,.28)',
    fundo: 'rgba(52,211,153,.06)',
  },
  {
    num: '05',
    rotulo: 'Local de origem/destino',
    descricaoPontos: [
      '**País**, **Estado** e **Cidade**',
      'Origem e destino na mesma lógica',
      'Usado para cotação de **coletas locais**',
    ],
    icone: MapPin,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.32)',
    fundo: 'rgba(45,212,191,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardCampo({ campo }: { campo: CampoOrigemDestino }) {
  const Icone = campo.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: campo.fundo,
      border: `1px solid ${campo.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${campo.borda}`,
        }}>
          <Icone size={20} weight="duotone" color={campo.cor} aria-hidden />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              color: campo.cor,
            }}>
              {campo.num}
            </span>
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.35,
            }}>
              {campo.rotulo}
            </p>
          </div>
        </div>
      </div>
      <ul style={{
        margin: 0,
        paddingLeft: 18,
        width: '100%',
        fontSize: '12px',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        {campo.descricaoPontos.map((ponto) => (
          <li key={ponto} style={{ marginBottom: 2 }}>{renderizarNegrito(ponto)}</li>
        ))}
      </ul>
    </div>
  )
}

/** Manual BID Frete §4.02.01 — campos do passo Origem e Destino. */
export function ManualInfograficoBidFreteOrigemDestinoCampos() {
  return (
    <div
      role="group"
      aria-label="Campos do passo Origem e Destino — Nova cotação manual"
      style={{
        background: 'linear-gradient(165deg, rgba(56,189,248,.07) 0%, rgba(148,163,184,.04) 55%, rgba(129,140,248,.05) 100%)',
        border: '1px solid rgba(56,189,248,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.03)',
      }}
    >
      <p style={{
        margin: '0 0 12px',
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#c4b5fd',
      }}>
        Campos deste passo
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {CAMPOS.map((campo) => (
          <CardCampo key={campo.num} campo={campo} />
        ))}
      </div>
    </div>
  )
}

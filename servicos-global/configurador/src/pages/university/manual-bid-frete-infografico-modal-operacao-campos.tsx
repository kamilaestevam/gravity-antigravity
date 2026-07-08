import React from 'react'
import {
  ArrowDown,
  Boat,
  Hash,
  ListChecks,
  Warning,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CampoModalOperacao = {
  num: string
  rotulo: string
  descricao?: string
  descricaoPontos?: string[]
  icone: Icon
  cor: string
  borda: string
  fundo: string
  opcoes?: { rotulo: string; cor: string; icone?: Icon }[]
}

const CAMPOS: CampoModalOperacao[] = [
  {
    num: '01',
    rotulo: 'Nº da cotação',
    descricaoPontos: ['Identificador único', 'Gerado pelo sistema', 'Pode ser editado'],
    icone: Hash,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: '02',
    rotulo: 'Tipo de operação',
    descricaoPontos: ['Importação', 'Exportação'],
    icone: ArrowDown,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.32)',
    fundo: 'rgba(45,212,191,.08)',
  },
  {
    num: '03',
    rotulo: 'Modal de frete',
    descricaoPontos: ['Marítimo', 'Aéreo', 'Rodoviário'],
    icone: Boat,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
  },
  {
    num: '04',
    rotulo: 'Modalidade',
    descricaoPontos: [
      'Somente após selecionar o modal de frete',
      'Marítimo: FCL ou LCL',
      'Rodoviário: FTL ou LTL',
    ],
    icone: ListChecks,
    cor: '#c4b5fd',
    borda: 'rgba(196,181,253,.28)',
    fundo: 'rgba(167,139,250,.08)',
  },
  {
    num: '05',
    rotulo: 'Carga perigosa',
    descricaoPontos: [
      'Mercadoria classificada ONU (IMDG / ADR / IATA DGR)',
      'Informe o número ONU no passo Carga',
    ],
    icone: Warning,
    cor: '#fb7185',
    borda: 'rgba(251,113,133,.28)',
    fundo: 'rgba(244,63,94,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardCampo({ campo }: { campo: CampoModalOperacao }) {
  const Icone = campo.icone
  const descricaoAbaixoTitulo = Boolean(campo.descricaoPontos?.length)
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
      <div style={{ display: 'flex', gap: 12, alignItems: descricaoAbaixoTitulo ? 'center' : 'flex-start' }}>
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
            marginBottom: descricaoAbaixoTitulo ? 0 : 4,
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
          {!descricaoAbaixoTitulo && campo.descricao ? (
            <p style={{
              margin: 0,
              fontSize: '.68rem',
              lineHeight: 1.45,
              color: CORPO_70,
            }}>
              {renderizarNegrito(campo.descricao)}
            </p>
          ) : null}
        </div>
      </div>
      {descricaoAbaixoTitulo && campo.descricaoPontos?.length ? (
        <ul style={{
          margin: 0,
          paddingLeft: 18,
          width: '100%',
          fontSize: '12px',
          lineHeight: 1.45,
          color: CORPO_70,
        }}>
          {campo.descricaoPontos.map((ponto) => (
            <li key={ponto} style={{ marginBottom: 2 }}>{ponto}</li>
          ))}
        </ul>
      ) : null}
      {campo.opcoes?.length ? (
        <div style={{
          display: 'flex',
          flexWrap: campo.num === '02' ? 'nowrap' : 'wrap',
          gap: '6px 8px',
          paddingLeft: 48,
        }}>
          {campo.opcoes.map((opcao) => {
            const IconeOpcao = opcao.icone
            return (
              <span
                key={opcao.rotulo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '.62rem',
                  fontWeight: 700,
                  color: opcao.cor,
                  background: 'rgba(8,12,24,.28)',
                  border: `1px solid color-mix(in srgb, ${opcao.cor} 35%, transparent)`,
                  borderRadius: 999,
                  padding: '3px 9px',
                }}
              >
                {IconeOpcao ? <IconeOpcao size={12} weight="duotone" aria-hidden /> : null}
                {opcao.rotulo}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/** Manual BID Frete §4.02.01 — campos do passo Modal e Operação (sem print por campo). */
export function ManualInfograficoBidFreteModalOperacaoCampos() {
  return (
    <div
      role="group"
      aria-label="Campos do passo Modal e Operação — Nova cotação manual"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.07) 0%, rgba(148,163,184,.04) 55%, rgba(45,212,191,.04) 100%)',
        border: '1px solid rgba(129,140,248,.18)',
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

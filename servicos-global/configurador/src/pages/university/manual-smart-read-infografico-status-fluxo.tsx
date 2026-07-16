import React, { useState } from 'react'
import { ArrowRight, CaretDown, FlagCheckered, Play, WarningCircle } from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'
import {
  ETAPAS_STATUS_FLUXO_ABAS_MANUAL,
  ETAPAS_STATUS_FLUXO_ATIVAS_MANUAL,
  type EtapaStatusFluxoManualSmartRead,
} from './manual-smart-read-status-fluxo-dados'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const estiloSecaoComTitulo: React.CSSProperties = {
  borderTop: '1px solid rgba(148,163,184,.1)',
  marginTop: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
  paddingTop: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
}

const thGatilho: React.CSSProperties = {
  padding: '9px 14px',
  textAlign: 'left',
  fontSize: '.58rem',
  fontWeight: 800,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  borderBottom: '1px solid rgba(148,163,184,.12)',
  background: 'rgba(8,12,24,.22)',
}

const thPasso: React.CSSProperties = {
  ...thGatilho,
  width: '14%',
  minWidth: 96,
  textAlign: 'center',
}

const tdGatilho: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '.72rem',
  lineHeight: 1.55,
  verticalAlign: 'top',
  color: CORPO_70,
  borderBottom: '1px solid rgba(148,163,184,.08)',
}

const tdPasso: React.CSSProperties = {
  ...tdGatilho,
  textAlign: 'center',
  fontWeight: 700,
  fontSize: '.68rem',
  color: '#94a3b8',
  whiteSpace: 'nowrap',
}

const bordaColunaEsquerda: React.CSSProperties = {
  borderLeft: '1px solid rgba(148,163,184,.08)',
}

function rotuloColunaPasso(etapa: EtapaStatusFluxoManualSmartRead): string {
  if (etapa.reservado) return 'Reservado'
  if (etapa.passoWizard != null) return `Passo ${etapa.passoWizard}`
  return '—'
}

function renderizarNegrito(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte.slice(2, -2)}</strong>
    }
    return parte
  })
}

function PillStatusFluxoManual({ etapa }: { etapa: EtapaStatusFluxoManualSmartRead }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '.68rem',
      fontWeight: 700,
      letterSpacing: '.02em',
      color: etapa.estilo.cor,
      background: etapa.estilo.fundo,
      border: `1px solid ${etapa.estilo.borda}`,
      borderRadius: 999,
      padding: '5px 11px',
      whiteSpace: 'nowrap',
    }}>
      {etapa.rotulo}
    </span>
  )
}

function TabelaGatilhosEtapa({ etapa }: { etapa: EtapaStatusFluxoManualSmartRead }) {
  return (
    <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(148,163,184,.08)' }}>
      <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={thGatilho}>Gatilho de entrada</th>
            <th style={{ ...thGatilho, ...bordaColunaEsquerda }}>Gatilho de saída</th>
            <th style={{ ...thPasso, ...bordaColunaEsquerda }}>Passo</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: 'rgba(8,12,24,.14)' }}>
            <td style={tdGatilho}>{renderizarNegrito(etapa.gatilhoEntrada)}</td>
            <td style={{ ...tdGatilho, ...bordaColunaEsquerda }}>
              {renderizarNegrito(etapa.gatilhoSaida)}
            </td>
            <td style={{ ...tdPasso, ...bordaColunaEsquerda, color: etapa.estilo.cor }}>
              {rotuloColunaPasso(etapa)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function BotaoAbaEtapa({
  etapa,
  aberto,
  onClick,
  ariaControls,
}: {
  etapa: EtapaStatusFluxoManualSmartRead
  aberto: boolean
  onClick: () => void
  ariaControls: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={aberto}
      aria-controls={ariaControls}
      style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        background: aberto ? etapa.estilo.fundo : 'rgba(148,163,184,.04)',
        color: 'var(--ws-text, #f1f5f9)',
        transition: 'background .15s',
      }}
    >
      <CaretDown
        size={15}
        weight="bold"
        color={etapa.estilo.cor}
        style={{
          flexShrink: 0,
          transform: aberto ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform .2s',
        }}
      />
      <span style={{
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        color: etapa.estilo.cor,
      }}>
        {etapa.ordem}
      </span>
      <span style={{
        fontSize: '.78rem',
        fontWeight: 700,
        letterSpacing: '.01em',
        color: etapa.estilo.cor,
      }}>
        {etapa.rotulo}
      </span>
      {etapa.inicioFluxo ? (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '.58rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#fde68a',
          marginLeft: 'auto',
        }}>
          <Play size={11} weight="fill" />
          Início
        </span>
      ) : null}
      {etapa.fimFluxo ? (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '.58rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#6ee7b7',
          marginLeft: 'auto',
        }}>
          <FlagCheckered size={11} weight="fill" />
          Fim
        </span>
      ) : null}
      {etapa.codigo === 'FALHOU' ? (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '.58rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#fca5a5',
          marginLeft: 'auto',
        }}>
          <WarningCircle size={11} weight="fill" />
          Ramo de erro
        </span>
      ) : null}
    </button>
  )
}

function SecaoAccordionEtapas({
  etapas,
  etapasAbertas,
  alternarEtapa,
}: {
  etapas: EtapaStatusFluxoManualSmartRead[]
  etapasAbertas: Record<string, boolean>
  alternarEtapa: (codigo: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {etapas.map((etapa) => {
        const aberto = etapasAbertas[etapa.codigo] ?? false
        const painelId = `status-fluxo-${etapa.codigo}`
        return (
          <section
            key={etapa.codigo}
            style={{
              borderRadius: 12,
              border: `1px solid ${aberto ? etapa.estilo.borda : 'rgba(148,163,184,.14)'}`,
              background: 'rgba(8,12,24,.24)',
              overflow: 'hidden',
            }}
          >
            <BotaoAbaEtapa
              etapa={etapa}
              aberto={aberto}
              onClick={() => alternarEtapa(etapa.codigo)}
              ariaControls={painelId}
            />
            {aberto ? (
              <div id={painelId}>
                <TabelaGatilhosEtapa etapa={etapa} />
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

const FLUXO_LINEAR = ETAPAS_STATUS_FLUXO_ATIVAS_MANUAL.filter((e) => e.codigo !== 'FALHOU')

export function ManualInfograficoSmartDocsStatusFluxo({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  const [etapasAbertas, setEtapasAbertas] = useState<Record<string, boolean>>({})

  function alternarEtapa(codigo: string) {
    setEtapasAbertas((prev) => ({ ...prev, [codigo]: !prev[codigo] }))
  }

  function abrirEtapa(codigo: string) {
    setEtapasAbertas((prev) => ({ ...prev, [codigo]: true }))
  }

  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: margemSuperiorPx,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
        <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
          Status de fluxo do wizard
        </p>
        <p style={{
          margin: 0,
          fontSize: '.88rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          Começa em <strong style={{ color: '#fde68a' }}>Anexar arquivo</strong>
          {' · '}
          termina em <strong style={{ color: '#6ee7b7' }}>Resultado das leituras</strong>
          {' · '}
          pill na coluna <strong style={{ color: '#cbd5e1' }}>Status</strong> da Lista
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginBottom: 0,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'rgba(8,12,24,.32)',
        border: '1px solid rgba(148,163,184,.12)',
      }}>
        {FLUXO_LINEAR.map((etapa, i) => (
          <React.Fragment key={etapa.codigo}>
            <button
              type="button"
              onClick={() => abrirEtapa(etapa.codigo)}
              aria-label={`Abrir detalhes: ${etapa.rotulo}`}
              style={{
                border: 'none',
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <PillStatusFluxoManual etapa={etapa} />
            </button>
            {i < FLUXO_LINEAR.length - 1 ? (
              <ArrowRight size={14} weight="bold" color="#64748b" aria-hidden />
            ) : null}
          </React.Fragment>
        ))}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginLeft: 4,
          fontSize: '.62rem',
          fontWeight: 700,
          color: '#fca5a5',
        }}>
          <WarningCircle size={13} weight="fill" />
          <button
            type="button"
            onClick={() => abrirEtapa('FALHOU')}
            aria-label="Abrir detalhes: Falhou"
            style={{
              border: 'none',
              padding: 0,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <PillStatusFluxoManual
              etapa={ETAPAS_STATUS_FLUXO_ATIVAS_MANUAL.find((e) => e.codigo === 'FALHOU')!}
            />
          </button>
        </span>
      </div>

      <div style={estiloSecaoComTitulo}>
        <SecaoAccordionEtapas
          etapas={ETAPAS_STATUS_FLUXO_ABAS_MANUAL}
          etapasAbertas={etapasAbertas}
          alternarEtapa={alternarEtapa}
        />
      </div>
    </div>
  )
}

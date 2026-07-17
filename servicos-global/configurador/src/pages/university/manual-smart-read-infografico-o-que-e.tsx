import React from 'react'
import {
  ArrowsLeftRight,
  FileMagnifyingGlass,
  Files,
  Lightbulb,
  ListChecks,
  ShieldWarning,
  Sparkle,
  UploadSimple,
  type Icon,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
  MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 72%, transparent)'
const ROXO = '#a78bfa'
const VERDE = '#34d399'
const INDIGO = '#818cf8'
const AZUL = '#60a5fa'

const ESTILO_TITULO_GRUPO: React.CSSProperties = {
  margin: 0,
  fontSize: '.72rem',
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: '#818cf8',
}

const ESTILO_SUBTITULO_GRUPO: React.CSSProperties = {
  margin: 0,
  fontSize: '.7rem',
  color: CORPO,
  lineHeight: 1.45,
}

function TituloSubtituloGrupo({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div style={{ marginBottom: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX }}>
      <p style={{
        ...ESTILO_TITULO_GRUPO,
        marginBottom: subtitulo ? 4 : 0,
      }}>
        {titulo}
      </p>
      {subtitulo && (
        <p style={ESTILO_SUBTITULO_GRUPO}>{subtitulo}</p>
      )}
    </div>
  )
}

type EtapaFluxo = {
  num: string
  rotulo: string
  detalhe: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const ETAPAS: EtapaFluxo[] = [
  {
    num: '1',
    rotulo: 'Entrada',
    detalhe: 'Tela, API Cockpit ou ERP',
    icone: UploadSimple,
    cor: AZUL,
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '2',
    rotulo: 'IA classifica',
    detalhe: 'Tipo do documento + campos',
    icone: FileMagnifyingGlass,
    cor: ROXO,
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: '3',
    rotulo: 'IA confere',
    detalhe: 'Conferência assistida',
    icone: ListChecks,
    cor: INDIGO,
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    num: '4',
    rotulo: 'Saída',
    detalhe: 'ERP, COMEX ou API',
    icone: ArrowsLeftRight,
    cor: VERDE,
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

type Pilar = {
  titulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const PILARES: Pilar[] = [
  {
    titulo: 'Leitura',
    descricao: 'Classificação, extração e **conferência assistida**.',
    icone: Sparkle,
    cor: ROXO,
    borda: 'rgba(167,139,250,.28)',
    fundo: 'rgba(139,92,246,.06)',
  },
  {
    titulo: 'Gestão',
    descricao: '**Insights**, **Lista** e **Nova Leitura** no workspace.',
    icone: Files,
    cor: INDIGO,
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.06)',
  },
  {
    titulo: 'Integração',
    descricao: '**Entrada** e **saída** via tela, **API Cockpit** ou ERP.',
    icone: ArrowsLeftRight,
    cor: AZUL,
    borda: 'rgba(96,165,250,.28)',
    fundo: 'rgba(96,165,250,.06)',
  },
  {
    titulo: 'Riscos',
    descricao: 'Checklists e alertas aduaneiros antes do embarque.',
    icone: ShieldWarning,
    cor: VERDE,
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.06)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function EtapaFluxoCard({ etapa }: { etapa: EtapaFluxo }) {
  const Icone = etapa.icone
  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 0,
      borderRadius: 12,
      padding: '13px 12px 12px',
      background: etapa.fundo,
      border: `1px solid ${etapa.borda}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 10,
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.04), 0 0 18px ${etapa.borda.replace(/[\d.]+\)$/, '.06)')}`,
    }}>
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 6,
        display: 'grid',
        placeItems: 'center',
        fontSize: '.6rem',
        fontWeight: 800,
        color: etapa.cor,
        background: 'rgba(8,12,24,.45)',
        border: `1px solid ${etapa.borda}`,
      }}>
        {etapa.num}
      </div>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(145deg, rgba(8,12,24,.55), rgba(8,12,24,.2))',
        border: `1px solid ${etapa.borda}`,
        boxShadow: `0 0 16px ${etapa.borda}`,
        flexShrink: 0,
      }}>
        <Icone size={19} weight="duotone" color={etapa.cor} aria-hidden />
      </div>
      <div style={{ minWidth: 0, width: '100%', paddingInline: 2 }}>
        <p style={{
          margin: 0,
          fontSize: '.74rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.3,
        }}>
          {etapa.rotulo}
        </p>
        <p style={{
          margin: '5px 0 0',
          fontSize: '.66rem',
          lineHeight: 1.45,
          color: CORPO,
        }}>
          {etapa.detalhe}
        </p>
      </div>
    </div>
  )
}

function SetaFluxo() {
  return (
    <div
      className="uni-smart-docs-oque-e-seta"
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(129,140,248,.6)',
        flexShrink: 0,
        padding: '0 1px',
        fontSize: '1rem',
        fontWeight: 700,
      }}
    >
      →
    </div>
  )
}

function PilarCard({ pilar }: { pilar: Pilar }) {
  const Icone = pilar.icone
  return (
    <div style={{
      borderRadius: 10,
      padding: '12px 10px 11px',
      background: 'rgba(8,12,24,.28)',
      border: '1px solid rgba(148,163,184,.14)',
      borderTop: `3px solid ${pilar.cor}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 9,
      minWidth: 0,
      height: '100%',
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: pilar.fundo,
        border: `1px solid ${pilar.borda}`,
      }}>
        <Icone size={16} weight="duotone" color={pilar.cor} aria-hidden />
      </div>
      <div style={{ minWidth: 0, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '.7rem', color: '#e2e8f0', lineHeight: 1.3 }}>
          {pilar.titulo}
        </p>
        <p style={{
          margin: 0,
          fontSize: '.64rem',
          lineHeight: 1.45,
          color: CORPO,
          flex: 1,
        }}>
          {renderizarNegrito(pilar.descricao)}
        </p>
      </div>
    </div>
  )
}

/** Manual Smart Docs §01 — mapa conceitual do produto */
export function ManualInfograficoSmartDocsOQueE() {
  return (
    <div
      role="group"
      aria-label="Infográfico: o que é o Smart Docs"
      style={{
        background: 'rgba(148,163,184,.04)',
        border: '1px solid rgba(148,163,184,.14)',
        borderRadius: 14,
        padding: '16px 18px 18px',
      }}
    >
      <style>{`
        @media (max-width: 720px) {
          .uni-smart-docs-oque-e-fluxo {
            flex-direction: column !important;
          }
          .uni-smart-docs-oque-e-seta {
            display: none !important;
          }
          .uni-smart-docs-oque-e-subtitulo {
            white-space: normal !important;
          }
          .uni-smart-docs-oque-e-pilares {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 480px) {
          .uni-smart-docs-oque-e-pilares {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        O que é o Smart Docs
      </p>

      {/* Cabeçalho */}
      <div style={{
        borderRadius: 14,
        padding: '16px 16px 14px',
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
        background:
          'linear-gradient(135deg, rgba(139,92,246,.14) 0%, rgba(15,23,42,.6) 55%, rgba(52,211,153,.08) 100%)',
        border: '1px solid rgba(167,139,250,.22)',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '.6rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#ddd6fe',
          marginBottom: 10,
        }}>
          <Sparkle size={11} weight="fill" color={ROXO} aria-hidden />
          Produto Gravity · COMEX
        </span>
        <p style={{
          margin: 0,
          fontSize: '1.05rem',
          fontWeight: 800,
          color: '#f8fafc',
          lineHeight: 1.3,
          letterSpacing: '-.01em',
        }}>
          Documento entra → <span style={{ color: ROXO }}>IA lê e confere</span> → operação integra
        </p>
        <p
          className="uni-smart-docs-oque-e-subtitulo"
          style={{
          margin: '8px 0 0',
          fontSize: '.76rem',
          lineHeight: 1.5,
          color: CORPO,
          whiteSpace: 'nowrap',
        }}>
          {renderizarNegrito(
            'Transforma documentos, imagens e planilhas do comércio exterior em dados estruturados com integração na **entrada** e na **saída**.',
          )}
        </p>
      </div>

      {/* Fluxo: pipeline sequencial */}
      <section style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
        <TituloSubtituloGrupo
          titulo="Fluxo de processamento"
          subtitulo="Da entrada à saída, em quatro passos"
        />
        <div
          className="uni-smart-docs-oque-e-fluxo"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 8,
            padding: '14px 12px',
            borderRadius: 12,
            background:
              'linear-gradient(90deg, rgba(96,165,250,.07) 0%, rgba(139,92,246,.07) 48%, rgba(52,211,153,.07) 100%)',
            border: '1px solid rgba(129,140,248,.18)',
          }}
        >
          {ETAPAS.map((etapa, i) => (
            <React.Fragment key={etapa.rotulo}>
              <EtapaFluxoCard etapa={etapa} />
              {i < ETAPAS.length - 1 && <SetaFluxo />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Pilares: highlights descritivos */}
      <section style={{
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
        paddingTop: MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
        borderTop: '1px solid rgba(148,163,184,.12)',
      }}>
        <TituloSubtituloGrupo
          titulo="Pilares do produto"
          subtitulo="O que o Smart Docs entrega no workspace"
        />
        <div
          className="uni-smart-docs-oque-e-pilares"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            alignItems: 'stretch',
          }}
        >
          {PILARES.map((pilar) => (
            <PilarCard key={pilar.titulo} pilar={pilar} />
          ))}
        </div>
      </section>

      {/* Síntese */}
      <div style={{
        borderRadius: 12,
        padding: '12px 14px',
        background: 'rgba(99,102,241,.07)',
        border: '1px solid rgba(129,140,248,.2)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <Lightbulb weight="fill" size={18} style={{ color: INDIGO, flexShrink: 0, marginTop: 1 }} aria-hidden />
        <p style={{ margin: 0, fontSize: '.76rem', lineHeight: 1.5, color: '#e2e8f0' }}>
          <strong style={{ color: INDIGO, fontWeight: 700 }}>Em uma frase: </strong>
          leitura e conferência com IA, gestão centralizada de documentos, integração entrada/saída e
          gestão de riscos no COMEX.
        </p>
      </div>
    </div>
  )
}

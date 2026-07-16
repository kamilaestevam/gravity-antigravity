import React from 'react'
import {
  ArrowRight,
  ChartPie,
  CheckCircle,
  PencilSimpleLine,
  Sparkle,
  WarningCircle,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function BadgeAlterado() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '.58rem',
      fontWeight: 700,
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: '#c4b5fd',
      background: 'rgba(139,92,246,.18)',
      border: '1px solid rgba(167,139,250,.38)',
      borderRadius: 6,
      padding: '3px 8px',
      lineHeight: 1.2,
    }}>
      Alterado
    </span>
  )
}

/** Manual Smart Docs — regra de acerto × erro quando o usuário edita um campo na Conferência. */
export function ManualInfograficoSmartDocsEditarCamposMetrica({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(245,158,11,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: margemSuperiorPx,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
        <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
          Métrica de acertos e erros
        </p>
        <p style={{
          margin: 0,
          fontSize: '.88rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          {renderizarNegrito('Cada edição na Conferência alimenta os gráficos de **Insights**')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1.1fr)',
        gap: 10,
        alignItems: 'stretch',
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
      }}>
        <div style={{
          borderRadius: 12,
          padding: '12px 12px 11px',
          background: 'rgba(96,165,250,.08)',
          border: '1px solid rgba(96,165,250,.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkle size={16} weight="duotone" color="#60a5fa" />
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#93c5fd' }}>IA extrai</span>
          </div>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
            {renderizarNegrito('Campo preenchido na **Conferência de Campos** (ex.: **INCOTERM · FOB**).')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
          <ArrowRight size={18} weight="bold" />
        </div>

        <div style={{
          borderRadius: 12,
          padding: '12px 12px 11px',
          background: 'rgba(139,92,246,.08)',
          border: '1px solid rgba(167,139,250,.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PencilSimpleLine size={16} weight="duotone" color="#a78bfa" />
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#c4b5fd' }}>Você revisa</span>
          </div>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
            {renderizarNegrito('Clique no valor para **editar**. Se mudar o texto, o campo ganha o selo ')}
            <BadgeAlterado />.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
          <ArrowRight size={18} weight="bold" />
        </div>

        <div style={{
          borderRadius: 12,
          padding: '12px 12px 11px',
          background: 'rgba(8,12,24,.28)',
          border: '1px solid rgba(148,163,184,.16)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Contagem na métrica
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <CheckCircle size={16} weight="fill" color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
                {renderizarNegrito('**Acerto** — campo **não editado** após a extração.')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <WarningCircle size={16} weight="fill" color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
                {renderizarNegrito('**Erro** — campo **editado** na conferência (selo **Alterado**).')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}>
        <ChartPie size={18} weight="duotone" color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: '.7rem', lineHeight: 1.5, color: CORPO_70 }}>
          {renderizarNegrito('Essa regra alimenta o **donut** de acertos × erros, a **evolução diária** e os **rankings por fornecedor** na aba **Insights**.')}
        </p>
      </div>
    </div>
  )
}

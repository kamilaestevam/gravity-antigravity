import React from 'react'
import {
  ArrowRight,
  CloudArrowDown,
  CloudArrowUp,
  PlugsConnected,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'
import { AcademyLinkGuia } from './guia-academy-link'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'
const HREF_MANUAL_API_COCKPIT = '/university-gravity/docs/api-cockpit'

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

/** Manual Smart Docs § Nova Leitura Resultado — integração automática entrada/saída. */
export function ManualInfograficoSmartDocsResultadoIntegracaoAutomatica({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div
      role="group"
      aria-label="Integração automática de entrada e saída via API Cockpit"
      style={{
        background: 'linear-gradient(165deg, rgba(96,165,250,.08) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.06) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: margemSuperiorPx,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
        <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
          Integração automática
        </p>
        <p style={{
          margin: 0,
          fontSize: '.88rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          {renderizarNegrito('Com **integração entre sistemas**, todo esse fluxo é feito de forma **automática**.')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)',
        gap: 10,
        alignItems: 'stretch',
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
      }}>
        <div style={{
          borderRadius: 12,
          padding: '12px 12px 11px',
          background: 'rgba(99,102,241,.08)',
          border: '1px solid rgba(129,140,248,.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudArrowUp size={16} weight="duotone" color="#818cf8" />
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#a5b4fc' }}>Sistema externo</span>
          </div>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
            {renderizarNegrito('**ERP**, **COMEX** ou outro parceiro conectado')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
          <ArrowRight size={18} weight="bold" />
        </div>

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
            <PlugsConnected size={16} weight="duotone" color="#60a5fa" />
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#93c5fd' }}>
              <AcademyLinkGuia href={HREF_MANUAL_API_COCKPIT} rotulo="API Cockpit" />
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
            {renderizarNegrito('Token, **POST** na entrada e **GET** ou **Webhook** na saída')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
          <ArrowRight size={18} weight="bold" />
        </div>

        <div style={{
          borderRadius: 12,
          padding: '12px 12px 11px',
          background: 'rgba(52,211,153,.08)',
          border: '1px solid rgba(52,211,153,.32)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudArrowDown size={16} weight="duotone" color="#34d399" />
            <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#6ee7b7' }}>Smart Docs</span>
          </div>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
            {renderizarNegrito('IA classifica, extrai e devolve **campos estruturados**')}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        <div style={{
          borderRadius: 10,
          padding: '11px 12px',
          background: 'rgba(8,12,24,.25)',
          border: '1px solid rgba(129,140,248,.18)',
        }}>
          <p style={{
            margin: '0 0 6px',
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#a5b4fc',
          }}>
            Entrada automática
          </p>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('O parceiro **envia o documento** (ex.: PDF) via API — **sem** anexar na tela **Nova Leitura**.')}
          </p>
        </div>
        <div style={{
          borderRadius: 10,
          padding: '11px 12px',
          background: 'rgba(8,12,24,.25)',
          border: '1px solid rgba(52,211,153,.18)',
        }}>
          <p style={{
            margin: '0 0 6px',
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#6ee7b7',
          }}>
            Saída automática
          </p>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Após a leitura, o parceiro **consulta** ou recebe **Webhook** e **grava** os dados no sistema de origem — **sem** exportar planilha manualmente.')}
          </p>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Sparkle } from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'
import {
  CONTAGEM_REGRAS_POR_TIPO_CHECKLIST,
  TOTAL_REGRAS_CHECKLIST_SMART_READ,
  TOTAL_SECOES_CHECKLIST_SMART_READ,
  TOTAL_TIPOS_DOCUMENTO_CHECKLIST_SMART_READ,
} from './manual-smart-read-checklist-conferencia-dados'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

/** Manual Smart Docs — resumo do checklist de Conferência (detalhe no accordion abaixo). */
export function ManualInfograficoSmartDocsChecklistConferencia({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  const maiorTipo = CONTAGEM_REGRAS_POR_TIPO_CHECKLIST.reduce((a, b) => (a.regras >= b.regras ? a : b))

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
          Checklist de validação
        </p>
        <p style={{
          margin: 0,
          fontSize: '.88rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          {TOTAL_REGRAS_CHECKLIST_SMART_READ} regras em {TOTAL_TIPOS_DOCUMENTO_CHECKLIST_SMART_READ} tipos de documento · {TOTAL_SECOES_CHECKLIST_SMART_READ} seções no accordion
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <div style={{
          borderRadius: 12,
          padding: '10px 14px',
          background: 'rgba(8,12,24,.35)',
          border: '1px solid rgba(129,140,248,.28)',
          minWidth: 120,
        }}>
          <p style={{ margin: 0, fontSize: '.58rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Total de regras
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#c7d2fe', lineHeight: 1.1 }}>
            {TOTAL_REGRAS_CHECKLIST_SMART_READ}
          </p>
        </div>
        <div style={{
          borderRadius: 12,
          padding: '10px 14px',
          background: 'rgba(52,211,153,.08)',
          border: '1px solid rgba(52,211,153,.28)',
        }}>
          <p style={{ margin: 0, fontSize: '.62rem', fontWeight: 700, color: '#6ee7b7' }}>
            Tipos de documento
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '.9rem', fontWeight: 800, color: '#a7f3d0' }}>
            {TOTAL_TIPOS_DOCUMENTO_CHECKLIST_SMART_READ} matrizes · {TOTAL_SECOES_CHECKLIST_SMART_READ} seções
          </p>
        </div>
        <div style={{
          borderRadius: 12,
          padding: '10px 14px',
          background: 'rgba(245,158,11,.08)',
          border: '1px solid rgba(245,158,11,.28)',
        }}>
          <p style={{ margin: 0, fontSize: '.62rem', fontWeight: 700, color: '#fcd34d' }}>
            Maior matriz
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '.9rem', fontWeight: 800, color: '#fde68a' }}>
            {maiorTipo.tipo} · {maiorTipo.regras} regras
          </p>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#fde68a',
          background: 'rgba(251,191,36,.12)',
          border: '1px solid rgba(251,191,36,.32)',
          borderRadius: 999,
          padding: '6px 10px',
        }}>
          <Sparkle size={12} weight="fill" />
          Seções recolhidas: expanda abaixo
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
      }}>
        {['CONFORME', 'ATENÇÃO', 'FALHA', 'PENDENTE', 'N/A'].map((status) => (
          <span
            key={status}
            style={{
              fontSize: '.58rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              borderRadius: 999,
              padding: '4px 9px',
              color: status === 'CONFORME' ? '#6ee7b7'
                : status === 'ATENÇÃO' ? '#fcd34d'
                  : status === 'FALHA' ? '#fca5a5'
                    : status === 'PENDENTE' ? '#94a3b8'
                      : '#cbd5e1',
              background: status === 'CONFORME' ? 'rgba(52,211,153,.12)'
                : status === 'ATENÇÃO' ? 'rgba(245,158,11,.12)'
                  : status === 'FALHA' ? 'rgba(239,68,68,.1)'
                    : status === 'PENDENTE' ? 'rgba(148,163,184,.12)'
                      : 'rgba(148,163,184,.08)',
              border: `1px solid ${
                status === 'CONFORME' ? 'rgba(52,211,153,.3)'
                  : status === 'ATENÇÃO' ? 'rgba(245,158,11,.3)'
                    : status === 'FALHA' ? 'rgba(248,113,113,.3)'
                      : 'rgba(148,163,184,.2)'
              }`,
            }}
          >
            {status}
          </span>
        ))}
      </div>
    </div>
  )
}

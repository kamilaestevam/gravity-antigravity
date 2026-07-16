import React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BellRinging,
  Buildings,
  Key,
  PlugsConnected,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX,
  MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const COLUNAS = [
  {
    icone: Key,
    rotulo: 'Token + API',
    quemInicia: 'Seu sistema inicia',
    direcao: 'erp-para-gravity' as const,
    itens: [
      'Envia documentos, pedidos e dados',
      'Consulta status e resultados quando quiser',
    ],
    obrigatorio: true,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    icone: BellRinging,
    rotulo: 'Webhook',
    quemInicia: 'A Gravity avisa você',
    direcao: 'gravity-para-erp' as const,
    itens: [
      'Notifica sua URL quando um evento termina',
      'Ex.: pedido criado, leitura pronta, cotação aprovada',
    ],
    obrigatorio: false,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
] as const

function FaixaDirecao({ direcao }: { direcao: 'erp-para-gravity' | 'gravity-para-erp' }) {
  const erpPrimeiro = direcao === 'erp-para-gravity'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      margin: '8px 0 10px',
      flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '.64rem',
        fontWeight: 700,
        color: erpPrimeiro ? '#fde68a' : CORPO_70,
      }}>
        <Buildings size={14} weight="duotone" />
        Seu ERP / sistema
      </div>
      {erpPrimeiro ? (
        <ArrowRight size={18} weight="bold" color="#94a3b8" />
      ) : (
        <ArrowLeft size={18} weight="bold" color="#94a3b8" />
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '.64rem',
        fontWeight: 700,
        color: !erpPrimeiro ? '#bfdbfe' : CORPO_70,
      }}>
        <PlugsConnected size={14} weight="duotone" />
        Gravity
      </div>
      {!erpPrimeiro && (
        <>
          <ArrowRight size={18} weight="bold" color="#94a3b8" />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '.64rem',
            fontWeight: 700,
            color: '#fde68a',
          }}>
            <Buildings size={14} weight="duotone" />
            Seu endpoint HTTPS
          </div>
        </>
      )}
    </div>
  )
}

/** Comparação visual Token+API vs Webhook — público não técnico (API Cockpit § Webhooks). */
export function ManualInfograficoApiCockpitWebhookVsApi() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(52,211,153,.07) 0%, rgba(148,163,184,.04) 48%, rgba(251,191,36,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '20px 20px 18px',
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <p style={{
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: 'var(--ws-muted,#94a3b8)',
        margin: 0,
        paddingBottom: MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX,
      }}>
        O que é webhook — e como difere da API?
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
        alignItems: 'stretch',
      }}>
        {COLUNAS.map((col) => {
          const Icone = col.icone
          return (
            <div
              key={col.rotulo}
              style={{
                borderRadius: 12,
                padding: '14px 14px 14px',
                background: col.fundo,
                border: `1px solid ${col.borda}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icone size={18} weight="duotone" style={{ color: col.cor, flexShrink: 0 }} />
                <span style={{ fontWeight: 900, fontSize: '.8rem', color: '#e2e8f0', lineHeight: 1.25 }}>
                  {col.rotulo}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '.58rem',
                  fontWeight: 800,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: col.obrigatorio ? '#fde68a' : '#a7f3d0',
                  background: col.obrigatorio ? 'rgba(251,191,36,.14)' : 'rgba(52,211,153,.12)',
                  border: `1px solid ${col.obrigatorio ? 'rgba(251,191,36,.35)' : 'rgba(52,211,153,.28)'}`,
                  borderRadius: 6,
                  padding: '3px 7px',
                }}>
                  {col.obrigatorio ? 'Obrigatório' : 'Opcional'}
                </span>
              </div>

              <p style={{
                fontSize: '.72rem',
                fontWeight: 700,
                color: '#cbd5e1',
                margin: `0 0 ${MANUAL_ESPACO_PARAGRAFO_PX}px`,
                lineHeight: 1.35,
              }}>
                {col.quemInicia}
              </p>

              <FaixaDirecao direcao={col.direcao} />

              <ul style={{
                margin: 0,
                marginTop: 'auto',
                paddingLeft: 16,
                paddingTop: MANUAL_ESPACO_PARAGRAFO_PX,
                fontSize: '.66rem',
                color: CORPO_70,
                lineHeight: 1.5,
              }}>
                {col.itens.map((item) => (
                  <li key={item} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <p style={{
        fontSize: '.7rem',
        color: CORPO_70,
        lineHeight: 1.55,
        margin: 0,
        paddingTop: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
        textAlign: 'center',
      }}>
        São <strong style={{ color: '#cbd5e1' }}>complementares</strong>: o webhook{' '}
        <strong style={{ color: '#cbd5e1' }}>não substitui</strong> o token.
        Depois do aviso, seu time ainda busca os dados completos pela{' '}
        <strong style={{ color: '#cbd5e1' }}>mesma API</strong> — o webhook só avisa que chegou a hora.
      </p>
    </div>
  )
}

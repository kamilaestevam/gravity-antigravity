import React from 'react'
import {
  ArrowsLeftRight,
  Buildings,
  ChartLineUp,
  Key,
  PlugsConnected,
  Pulse,
  Sparkle,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const SISTEMAS_EXTERNOS = ['ERP', 'COMEX', 'WMS'] as const

const PRODUTOS_GRAVITY = [
  { rotulo: 'Smart Docs', cor: '#34d399' },
  { rotulo: 'Pedido', cor: '#818cf8' },
  { rotulo: 'Processo', cor: '#60a5fa' },
] as const

const PAPEIS_GESTOR = [
  {
    icone: Key,
    titulo: 'Gerar token',
    descricao: 'Cria a chave de acesso que autoriza a conexão, primeiro passo antes de ligar o ERP.',
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    icone: Pulse,
    titulo: 'Monitorar servidores',
    descricao: 'Confere se a plataforma está online e respondendo bem.',
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.28)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    icone: ChartLineUp,
    titulo: 'Acompanhar consumo',
    descricao: 'Vê quantas integrações rodaram e se houve falhas.',
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
] as const

/** Ponte visual — API Cockpit como integração com ERP/COMEX (público não técnico). */
export function ManualInfograficoApiCockpitIntegracao() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(96,165,250,.05) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: 14 }}>
        <p style={{
          fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--ws-muted,#94a3b8)', margin: 0,
        }}>
          Ponte de integração: Gravity ↔ sistemas da sua empresa
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1.1fr) auto minmax(0, 1fr)',
        gap: 10,
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{
          borderRadius: 12,
          padding: '12px 10px',
          textAlign: 'center',
          background: 'rgba(99,102,241,.08)',
          border: '1px solid rgba(129,140,248,.25)',
        }}>
          <Buildings size={18} weight="duotone" style={{ marginBottom: 6, color: '#818cf8' }} />
          <div style={{ fontWeight: 800, fontSize: '.74rem', color: '#e2e8f0', lineHeight: 1.3 }}>
            Sistemas externos
          </div>
          <div style={{ fontSize: '.64rem', color: CORPO_70, marginTop: 6, lineHeight: 1.45 }}>
            {SISTEMAS_EXTERNOS.map((s, i) => (
              <span key={s}>
                {i > 0 ? ' · ' : ''}
                <strong style={{ color: '#c7d2fe', fontWeight: 700 }}>{s}</strong>
              </span>
            ))}
          </div>
          <div style={{ fontSize: '.62rem', color: CORPO_70, marginTop: 6 }}>
            SAP, TOTVS, Thomson, WMS…
          </div>
        </div>

        <ArrowsLeftRight size={20} weight="bold" color="#64748b" style={{ flexShrink: 0 }} />

        <div style={{
          borderRadius: 12,
          padding: '12px 12px',
          textAlign: 'center',
          background: 'rgba(96,165,250,.12)',
          border: '1px solid rgba(96,165,250,.35)',
          boxShadow: '0 0 0 1px rgba(96,165,250,.08) inset',
        }}>
          <PlugsConnected size={20} weight="duotone" style={{ marginBottom: 6, color: '#60a5fa' }} />
          <div style={{ fontWeight: 900, fontSize: '.78rem', color: '#dbeafe', lineHeight: 1.25 }}>
            API Cockpit
          </div>
          <div style={{ fontSize: '.64rem', color: CORPO_70, marginTop: 6, lineHeight: 1.45 }}>
            Porta oficial de entrada e saída: é <strong style={{ color: '#bfdbfe' }}>daqui</strong> que a integração acontece
          </div>
        </div>

        <ArrowsLeftRight size={20} weight="bold" color="#64748b" style={{ flexShrink: 0 }} />

        <div style={{
          borderRadius: 12,
          padding: '12px 10px',
          textAlign: 'center',
          background: 'rgba(52,211,153,.06)',
          border: '1px solid rgba(52,211,153,.22)',
        }}>
          <Sparkle size={18} weight="duotone" style={{ marginBottom: 6, color: '#34d399' }} />
          <div style={{ fontWeight: 800, fontSize: '.74rem', color: '#d1fae5', lineHeight: 1.3 }}>
            Produtos Gravity
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 8,
          }}>
            {PRODUTOS_GRAVITY.map((p) => (
              <span
                key={p.rotulo}
                style={{
                  fontSize: '.62rem', fontWeight: 700, color: p.cor,
                  background: 'rgba(148,163,184,.08)',
                  border: `1px solid color-mix(in srgb, ${p.cor} 35%, transparent)`,
                  borderRadius: 6, padding: '3px 8px',
                }}
              >
                {p.rotulo}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '.72rem', color: CORPO_70, lineHeight: 1.55, margin: 0, textAlign: 'center',
        padding: `0 0 ${MANUAL_ESPACO_PARAGRAFO_PX}px`,
      }}>
        O ERP ou sistema de Comex <strong style={{ color: '#cbd5e1' }}>envia e consulta dados</strong> pelo API Cockpit.
        Você não precisa programar; seu time de TI usa o <strong style={{ color: '#cbd5e1' }}>token</strong> que você gera aqui.
      </p>

      {/* padding (não margin): no Guia, `.uni-player-aula__ritmo p { margin: 0 !important }` anula margin. */}
      <div style={{
        paddingTop: MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
        display: 'flex',
        flexDirection: 'column',
        gap: MANUAL_ESPACO_PARAGRAFO_PX,
      }}>
        <p style={{
          fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
          color: 'var(--ws-muted,#94a3b8)', margin: 0,
        }}>
          O que você faz nesta tela
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10,
        }}>
          {PAPEIS_GESTOR.map((papel) => {
            const Icone = papel.icone
            return (
              <div
                key={papel.titulo}
                style={{
                  borderRadius: 10,
                  padding: '10px 12px',
                  background: papel.fundo,
                  border: `1px solid ${papel.borda}`,
                }}
              >
                <Icone size={15} weight="duotone" style={{ marginBottom: 4, color: papel.cor }} />
                <div style={{ fontWeight: 700, fontSize: '.72rem', color: '#e2e8f0', lineHeight: 1.3 }}>
                  {papel.titulo}
                </div>
                <div style={{ fontSize: '.64rem', color: CORPO_70, marginTop: 4, lineHeight: 1.45 }}>
                  {papel.descricao}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

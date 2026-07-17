import React from 'react'
import {
  ArrowDown,
  CheckCircle,
  Circle,
  FileText,
  Package,
  Stack,
  UsersThree,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CotacaoExemplo = {
  numero: string
  rota: string
  selecionada: boolean
}

const COTACOES_WORKSPACE: CotacaoExemplo[] = [
  { numero: 'COT-2026-0142', rota: 'Shanghai → Santos', selecionada: true },
  { numero: 'COT-2026-0158', rota: 'Ningbo → Paranaguá', selecionada: true },
  { numero: 'COT-2026-0161', rota: 'Hong Kong → Itajaí', selecionada: true },
  { numero: 'COT-2026-0173', rota: 'Busan → Rio', selecionada: false },
]

function CardCotacaoWorkspace({ cotacao }: { cotacao: CotacaoExemplo }) {
  const ativa = cotacao.selecionada
  return (
    <div
      style={{
        borderRadius: 10,
        padding: '10px 11px',
        background: ativa ? 'rgba(52,211,153,.1)' : 'rgba(8,12,24,.28)',
        border: `1px solid ${ativa ? 'rgba(52,211,153,.35)' : 'rgba(148,163,184,.14)'}`,
        opacity: ativa ? 1 : 0.55,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        minWidth: 0,
      }}
    >
      {ativa ? (
        <CheckCircle size={16} weight="duotone" color="#34d399" aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      ) : (
        <Circle size={16} weight="regular" color="#64748b" aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      )}
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '.68rem', fontWeight: 800, color: ativa ? '#6ee7b7' : '#94a3b8', lineHeight: 1.25 }}>
          {cotacao.numero}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '.6rem', color: CORPO_70, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cotacao.rota}
        </p>
      </div>
    </div>
  )
}

function ChipCotacaoDentroBid({ numero, rota }: { numero: string; rota: string }) {
  return (
    <div
      style={{
        borderRadius: 8,
        padding: '8px 10px',
        background: 'rgba(99,102,241,.14)',
        border: '1px solid rgba(129,140,248,.28)',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        minWidth: 0,
      }}
    >
      <FileText size={14} weight="duotone" color="#a5b4fc" aria-hidden style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '.64rem', fontWeight: 800, color: '#c7d2fe', lineHeight: 1.2 }}>
          {numero}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '.56rem', color: CORPO_70, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {rota}
        </p>
      </div>
    </div>
  )
}

/** Manual BID Frete §6.03.01 — estrutura visual: BID como pacote de cotações existentes. */
export function ManualInfograficoBidFreteBidPacoteCotacoes() {
  const selecionadas = COTACOES_WORKSPACE.filter((c) => c.selecionada)

  return (
    <div
      role="group"
      aria-label="Estrutura de um BID: pacote com várias cotações"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.1) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.06) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={{
        margin: '0 0 4px',
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#818cf8',
      }}>
        Como funciona o BID
      </p>
      <p style={{
        margin: '0 0 14px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        Um pacote que agrupa cotações já existentes
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1.15fr)',
        gap: 14,
        alignItems: 'stretch',
      }}>
        <div style={{
          borderRadius: 12,
          padding: '12px 12px 10px',
          background: 'rgba(8,12,24,.32)',
          border: '1px solid rgba(148,163,184,.16)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <p style={{
            margin: 0,
            fontSize: '.6rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}>
            Cotações no workspace
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {COTACOES_WORKSPACE.map((cotacao) => (
              <CardCotacaoWorkspace key={cotacao.numero} cotacao={cotacao} />
            ))}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '.58rem', lineHeight: 1.4, color: CORPO_70 }}>
            <ManualInfograficoRichText texto="Cada linha é uma **cotação avulsa** já criada: rotas independentes." />
          </p>
        </div>

        <div
          aria-hidden
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingTop: 28,
            color: '#64748b',
            minWidth: 52,
          }}
        >
          <ArrowDown size={22} weight="bold" color="#818cf8" />
          <p style={{
            margin: 0,
            fontSize: '.56rem',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.3,
            color: '#818cf8',
            maxWidth: 52,
          }}>
            Marcar no modal
          </p>
        </div>

        <div style={{
          borderRadius: 12,
          padding: '12px 12px 10px',
          background: 'linear-gradient(160deg, rgba(99,102,241,.16) 0%, rgba(99,102,241,.06) 100%)',
          border: '2px solid rgba(129,140,248,.4)',
          boxShadow: '0 0 0 4px rgba(99,102,241,.08), inset 0 1px 0 rgba(255,255,255,.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid rgba(129,140,248,.35)',
              background: 'rgba(8,12,24,.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Stack size={18} weight="duotone" color="#818cf8" aria-hidden />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 800, color: '#e0e7ff', lineHeight: 1.25 }}>
                BID-2026-0088
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '.62rem', fontWeight: 600, color: '#a5b4fc', lineHeight: 1.3 }}>
                Pacote de {selecionadas.length} cotações
              </p>
            </div>
            <Package
              size={20}
              weight="duotone"
              color="#818cf8"
              aria-hidden
              style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.7 }}
            />
          </div>

          <div style={{
            borderRadius: 10,
            padding: '10px 10px 8px',
            background: 'rgba(8,12,24,.28)',
            border: '1px dashed rgba(129,140,248,.28)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <p style={{
              margin: '0 0 2px',
              fontSize: '.56rem',
              fontWeight: 700,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}>
              Cotações dentro do BID
            </p>
            {selecionadas.map((cotacao) => (
              <ChipCotacaoDentroBid key={cotacao.numero} numero={cotacao.numero} rota={cotacao.rota} />
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 8,
            background: 'rgba(52,211,153,.08)',
            border: '1px solid rgba(52,211,153,.22)',
          }}>
            <UsersThree size={15} weight="duotone" color="#34d399" aria-hidden style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '.6rem', lineHeight: 1.4, color: CORPO_70 }}>
              <ManualInfograficoRichText texto="Fornecedores recebem **uma negociação** sobre o conjunto: não três cotações separadas." />
            </p>
          </div>
        </div>
      </div>

      <p style={{
        margin: '14px 0 0',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        <ManualInfograficoRichText texto="O **BID** não substitui as cotações: ele as **agrupa**. Você marca as existentes no modal e o sistema cria **uma referência única** para negociar o pacote inteiro." />
      </p>
    </div>
  )
}

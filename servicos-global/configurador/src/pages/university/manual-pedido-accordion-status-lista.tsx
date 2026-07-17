import React, { useMemo, useState } from 'react'
import { CaretDown, FlowArrow, LockSimple, MagnifyingGlass } from '@phosphor-icons/react'
import {
  CATALOGO_STATUS_PADRAO_PEDIDO,
  TOTAL_STATUS_PADRAO_PEDIDO,
  type StatusPedidoManual,
} from './manual-pedido-catalogo-status-pedido-dados'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function renderizarTextoComNegrito(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>
    }
    return parte
  })
}

function normalizarBusca(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function statusCorrespondeBusca(status: StatusPedidoManual, busca: string) {
  if (!busca) return true
  const alvo = normalizarBusca(
    `${status.rotulo} ${status.gatilho} ${status.comeca} ${status.termina} ${status.eh_sistema ? 'sistema' : 'personalizavel editavel'}`,
  )
  return alvo.includes(busca)
}

function BadgeTipoStatus({ ehSistema }: { ehSistema: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '.56rem',
      fontWeight: 800,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: ehSistema ? '#fde68a' : '#ddd6fe',
      background: ehSistema ? 'rgba(251,191,36,.14)' : 'rgba(139,92,246,.14)',
      border: ehSistema ? '1px solid rgba(251,191,36,.32)' : '1px solid rgba(167,139,250,.32)',
      borderRadius: 999,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {ehSistema ? (
        <>
          <LockSimple size={10} weight="fill" />
          Sistema
        </>
      ) : 'Personalizável'}
    </span>
  )
}

/** Manual Pedido §08 Configurações — catálogo padrão com gatilho / início / fim (accordion recolhido). */
export function ManualPedidoAccordionCatalogoStatusLista() {
  const [busca, setBusca] = useState('')
  const [statusAbertos, setStatusAbertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATALOGO_STATUS_PADRAO_PEDIDO.map((s) => [s.slug, false])),
  )

  const buscaNormalizada = normalizarBusca(busca)

  const statusFiltrados = useMemo(
    () => CATALOGO_STATUS_PADRAO_PEDIDO.filter((s) => statusCorrespondeBusca(s, buscaNormalizada)),
    [buscaNormalizada],
  )

  function alternarStatus(slug: string) {
    setStatusAbertos((prev) => ({ ...prev, [slug]: !prev[slug] }))
  }

  const thBase: React.CSSProperties = {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: '.62rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    color: '#94a3b8',
    borderBottom: '1px solid rgba(148,163,184,.12)',
    background: 'rgba(8,12,24,.18)',
  }

  const tdBase: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '.76rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
    color: CORPO_70,
  }

  return (
    <div style={{
      marginTop: 0,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(59,130,246,.06) 0%, rgba(148,163,184,.04) 50%, rgba(139,92,246,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
      }}>
        <p style={{
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 auto',
        }}>
          <FlowArrow size={16} weight="duotone" color="#60a5fa" />
          Status do fluxo
          <span style={{
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            textTransform: 'none',
            color: '#bfdbfe',
            background: 'rgba(96,165,250,.18)',
            border: '1px solid rgba(96,165,250,.35)',
            borderRadius: 999,
            padding: '2px 8px',
          }}>
            {buscaNormalizada ? `${statusFiltrados.length} de ${TOTAL_STATUS_PADRAO_PEDIDO}` : `${TOTAL_STATUS_PADRAO_PEDIDO} status padrão`}
          </span>
        </p>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 220px',
          maxWidth: 320,
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid rgba(148,163,184,.2)',
          background: 'rgba(8,12,24,.35)',
        }}>
          <MagnifyingGlass size={15} weight="bold" color="#64748b" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar status…"
            aria-label="Filtrar status do fluxo"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--ws-text, #f1f5f9)',
              fontSize: '.78rem',
            }}
          />
        </label>
      </div>

      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {statusFiltrados.length === 0 ? (
          <p style={{ margin: '8px 4px', fontSize: '.78rem', color: CORPO_70 }}>
            Nenhum status corresponde a «{busca}».
          </p>
        ) : statusFiltrados.map((status) => {
          const aberto = statusAbertos[status.slug] ?? false
          return (
            <section
              key={status.slug}
              style={{
                borderRadius: 12,
                border: `1px solid color-mix(in srgb, ${status.cor} 32%, rgba(148,163,184,.12))`,
                background: 'rgba(8,12,24,.22)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => alternarStatus(status.slug)}
                aria-expanded={aberto}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: aberto
                    ? `color-mix(in srgb, ${status.cor} 12%, rgba(8,12,24,.22))`
                    : 'rgba(148,163,184,.04)',
                  color: 'var(--ws-text, #f1f5f9)',
                  textAlign: 'left',
                }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  color={status.cor}
                  style={{
                    flexShrink: 0,
                    transform: aberto ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform .2s',
                  }}
                />
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: status.cor,
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px color-mix(in srgb, ${status.cor} 28%, transparent)`,
                }} />
                <span style={{ fontWeight: 700, fontSize: '.78rem', flex: 1 }}>
                  {status.rotulo}
                </span>
                <BadgeTipoStatus ehSistema={status.eh_sistema} />
              </button>
              {aberto && (
                <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(148,163,184,.08)' }}>
                  <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thBase, width: '34%', color: '#93c5fd' }}>Gatilho</th>
                        <th style={{ ...thBase, width: '33%', color: '#86efac' }}>Onde começa</th>
                        <th style={{ ...thBase, width: '33%', color: '#fca5a5' }}>Onde termina</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={tdBase}>{renderizarTextoComNegrito(status.gatilho)}</td>
                        <td style={tdBase}>{renderizarTextoComNegrito(status.comeca)}</td>
                        <td style={tdBase}>{renderizarTextoComNegrito(status.termina)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <p style={{
        margin: 0,
        padding: '12px 18px 14px',
        fontSize: '.68rem',
        lineHeight: 1.55,
        color: CORPO_70,
        borderTop: '1px solid rgba(148,163,184,.1)',
      }}>
        <strong style={{ color: '#ddd6fe' }}>+ Novo Status</strong> cria etapas extras do workspace (ex.: Aguardando fornecedor): editáveis com lápis e lixeira enquanto não forem sistema. A ordem salva aqui vale para Lista, Kanban e filtros.
      </p>
    </div>
  )
}

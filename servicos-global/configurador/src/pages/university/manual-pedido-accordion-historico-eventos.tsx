import React, { useMemo, useState } from 'react'
import { CaretDown, ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react'
import {
  GRUPOS_CATALOGO_HISTORICO_PEDIDO,
  TOTAL_EVENTOS_CATALOGO_HISTORICO_PEDIDO,
  type EventoCatalogoHistoricoPedido,
  type GrupoCatalogoHistoricoPedido,
} from './manual-pedido-catalogo-historico-dados'

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

function eventoCorrespondeBusca(evento: EventoCatalogoHistoricoPedido, busca: string) {
  if (!busca) return true
  const alvo = normalizarBusca(
    `${evento.rotulo} ${evento.acao} ${evento.tela} ${evento.quando} ${evento.observacao ?? ''}`,
  )
  return alvo.includes(busca)
}

type PropsAccordionHistorico = {
  titulo?: string
  badge?: string
  grupos?: GrupoCatalogoHistoricoPedido[]
  totalEventos?: number
  abertoPorPadrao?: boolean
  marginTop?: number
  rodape?: string
}

export function ManualPedidoAccordionHistoricoEventos({
  titulo = 'O que o Histórico registra',
  badge = `${TOTAL_EVENTOS_CATALOGO_HISTORICO_PEDIDO} eventos auditados`,
  grupos = GRUPOS_CATALOGO_HISTORICO_PEDIDO,
  totalEventos = TOTAL_EVENTOS_CATALOGO_HISTORICO_PEDIDO,
  abertoPorPadrao = false,
  marginTop = 20,
  rodape = 'Coluna **Ação** usa os mesmos rótulos da tela de Histórico (`rotuloAcao`). Coluna **Local** mostra **Pedido** + tipo de recurso. Algumas operações podem gerar **duas linhas** (log dedicado + captura automática da API).',
}: PropsAccordionHistorico) {
  const [busca, setBusca] = useState('')
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(grupos.map((g) => [g.id, abertoPorPadrao])),
  )

  const buscaNormalizada = normalizarBusca(busca)
  const corIcone = '#34d399'
  const corBadge = '#6ee7b7'
  const fundoBadge = 'rgba(52,211,153,.15)'
  const bordaBadge = 'rgba(52,211,153,.35)'
  const fundoHeaderAberto = 'rgba(52,211,153,.1)'

  const gruposFiltrados = useMemo(() => {
    return grupos
      .map((grupo) => ({
        ...grupo,
        eventos: grupo.eventos.filter((e) => eventoCorrespondeBusca(e, buscaNormalizada)),
      }))
      .filter((grupo) => grupo.eventos.length > 0)
  }, [buscaNormalizada, grupos])

  const totalVisivel = gruposFiltrados
    .filter((g) => g.id !== 'nao-registra')
    .reduce((acc, g) => acc + g.eventos.length, 0)

  function alternarGrupo(id: string) {
    setGruposAbertos((prev) => ({ ...prev, [id]: !prev[id] }))
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
  }

  return (
    <div style={{
      marginTop,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(52,211,153,.06) 0%, rgba(148,163,184,.04) 50%, rgba(99,102,241,.04) 100%)',
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
          <ClockCounterClockwise size={16} weight="duotone" color={corIcone} />
          {titulo}
          <span style={{
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            textTransform: 'none',
            color: corBadge,
            background: fundoBadge,
            border: `1px solid ${bordaBadge}`,
            borderRadius: 999,
            padding: '2px 8px',
          }}>
            {buscaNormalizada ? `${totalVisivel} de ${totalEventos}` : badge}
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
            placeholder="Filtrar evento…"
            aria-label="Filtrar catálogo de eventos do histórico"
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
        {gruposFiltrados.length === 0 ? (
          <p style={{ margin: '8px 4px', fontSize: '.78rem', color: CORPO_70 }}>
            Nenhum evento corresponde a «{busca}».
          </p>
        ) : gruposFiltrados.map((grupo) => {
          const aberto = gruposAbertos[grupo.id] ?? abertoPorPadrao
          const ehNaoRegistra = grupo.id === 'nao-registra'
          return (
            <section
              key={grupo.id}
              style={{
                borderRadius: 12,
                border: `1px solid ${ehNaoRegistra ? 'rgba(148,163,184,.1)' : 'rgba(148,163,184,.12)'}`,
                background: ehNaoRegistra ? 'rgba(8,12,24,.12)' : 'rgba(8,12,24,.22)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => alternarGrupo(grupo.id)}
                aria-expanded={aberto}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: aberto ? fundoHeaderAberto : 'transparent',
                  color: 'var(--ws-text, #f1f5f9)',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, lineHeight: 1.35 }}>
                    {grupo.titulo}
                    <span style={{
                      marginLeft: 8,
                      fontSize: '.65rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                    }}>
                      {grupo.eventos.length}
                    </span>
                  </span>
                  {grupo.descricao ? (
                    <span style={{ fontSize: '.72rem', color: CORPO_70, lineHeight: 1.45 }}>
                      {grupo.descricao}
                    </span>
                  ) : null}
                </span>
                <CaretDown
                  size={16}
                  weight="bold"
                  color="#94a3b8"
                  style={{
                    flexShrink: 0,
                    transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .18s ease',
                  }}
                />
              </button>

              {aberto ? (
                <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(148,163,184,.08)' }}>
                  <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thBase, width: '14%' }}>Código</th>
                        <th style={{ ...thBase, width: '16%', color: '#6ee7b7' }}>Ação (tela)</th>
                        <th style={{ ...thBase, width: '18%' }}>Tela</th>
                        <th style={{ ...thBase, width: '34%' }}>Quando acontece</th>
                        <th style={{ ...thBase, width: '18%' }}>Obs.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.eventos.map((evento, i) => (
                        <tr
                          key={`${grupo.id}-${evento.acao}-${evento.tela}-${i}`}
                          style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.12)' : 'transparent' }}
                        >
                          <td style={{
                            ...tdBase,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '.68rem',
                            color: evento.acao === '—' ? '#64748b' : '#94a3b8',
                          }}>
                            {evento.acao}
                          </td>
                          <td style={{ ...tdBase, fontWeight: 600, color: ehNaoRegistra ? '#94a3b8' : '#a7f3d0' }}>
                            {evento.rotulo}
                          </td>
                          <td style={{ ...tdBase, color: CORPO_70, fontSize: '.74rem' }}>
                            {evento.tela}
                          </td>
                          <td style={{ ...tdBase, color: '#e2e8f0' }}>
                            {renderizarTextoComNegrito(evento.quando)}
                          </td>
                          <td style={{ ...tdBase, color: CORPO_70, fontSize: '.72rem' }}>
                            {evento.observacao ? renderizarTextoComNegrito(evento.observacao) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>

      {rodape ? (
        <p style={{
          margin: 0,
          padding: '12px 18px 16px',
          fontSize: '.74rem',
          lineHeight: 1.55,
          color: CORPO_70,
          borderTop: '1px solid rgba(148,163,184,.08)',
        }}>
          {renderizarTextoComNegrito(rodape)}
        </p>
      ) : null}
    </div>
  )
}

/** Manual Pedido §09 Histórico — catálogo completo expandível. */
export function ManualPedidoCatalogoHistoricoEventos() {
  return (
    <ManualPedidoAccordionHistoricoEventos
      abertoPorPadrao={false}
      marginTop={12}
    />
  )
}

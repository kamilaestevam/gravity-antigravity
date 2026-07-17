import React, { useMemo, useState } from 'react'
import { CaretDown, ChartBar, MagnifyingGlass } from '@phosphor-icons/react'
import {
  GRUPOS_SUGESTOES_DASHBOARD_PEDIDO,
  TOTAL_SUGESTOES_DASHBOARD_PEDIDO,
  type ManualPedidoLinhaSugestaoDashboard,
} from './manual-pedido-catalogo-dashboard-sugestoes-dados'

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

function linhaCorrespondeBusca(linha: ManualPedidoLinhaSugestaoDashboard, busca: string) {
  if (!busca) return true
  const alvo = normalizarBusca(
    `${linha.titulo} ${linha.tipoGrafico} ${linha.periodo} ${linha.campos} ${linha.oQueFaz}`,
  )
  return alvo.includes(busca)
}

/** Manual Pedido §06 — catálogo de sugestões do modal Explorar sugestões */
export function ManualPedidoAccordionDashboardSugestoes() {
  const [busca, setBusca] = useState('')
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GRUPOS_SUGESTOES_DASHBOARD_PEDIDO.map((g) => [g.id, false])),
  )

  const buscaNormalizada = normalizarBusca(busca)

  const gruposFiltrados = useMemo(() => {
    return GRUPOS_SUGESTOES_DASHBOARD_PEDIDO
      .map((grupo) => ({
        ...grupo,
        itens: grupo.itens.filter((item) => linhaCorrespondeBusca(item, buscaNormalizada)),
      }))
      .filter((grupo) => grupo.itens.length > 0)
  }, [buscaNormalizada])

  const totalVisivel = gruposFiltrados.reduce((acc, g) => acc + g.itens.length, 0)

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
      marginTop: 16,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <ChartBar size={18} weight="duotone" color="#818cf8" />
          <div>
            <p style={{ margin: 0, fontSize: '.88rem', fontWeight: 800, color: '#f1f5f9' }}>
              Referência: sugestões do modal
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '.7rem', color: CORPO_70 }}>
              Consulta opcional · {totalVisivel} de {TOTAL_SUGESTOES_DASHBOARD_PEDIDO} sugestões · expanda para detalhar
            </p>
          </div>
        </div>
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
            placeholder="Filtrar sugestão…"
            aria-label="Filtrar sugestões do dashboard"
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
            Nenhuma sugestão corresponde a «{busca}».
          </p>
        ) : gruposFiltrados.map((grupo) => {
          const aberto = gruposAbertos[grupo.id] ?? false
          return (
            <div
              key={grupo.id}
              style={{
                borderRadius: 12,
                border: '1px solid rgba(148,163,184,.12)',
                background: 'rgba(8,12,24,.22)',
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
                  background: aberto ? 'rgba(99,102,241,.1)' : 'transparent',
                  color: '#f1f5f9',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '.82rem', fontWeight: 700 }}>{grupo.titulo}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '.62rem',
                    fontWeight: 700,
                    color: '#c7d2fe',
                    background: 'rgba(99,102,241,.18)',
                    border: '1px solid rgba(129,140,248,.35)',
                    borderRadius: 999,
                    padding: '2px 8px',
                  }}>
                    {grupo.itens.length}
                  </span>
                  <CaretDown
                    size={16}
                    weight="bold"
                    color="#94a3b8"
                    style={{
                      transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform .2s ease',
                    }}
                  />
                </span>
              </button>
              {aberto ? (
                <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(148,163,184,.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={thBase}>Sugestão</th>
                        <th style={thBase}>Gráfico</th>
                        <th style={thBase}>Período</th>
                        <th style={thBase}>Campos</th>
                        <th style={thBase}>O que faz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.itens.map((item) => (
                        <tr key={item.titulo}>
                          <td style={{ ...tdBase, fontWeight: 600, color: '#e2e8f0', minWidth: 160 }}>
                            {item.titulo}
                          </td>
                          <td style={{ ...tdBase, color: '#a5b4fc', whiteSpace: 'nowrap' }}>{item.tipoGrafico}</td>
                          <td style={{ ...tdBase, color: CORPO_70, minWidth: 140 }}>{item.periodo}</td>
                          <td style={{ ...tdBase, color: CORPO_70, fontSize: '.72rem', minWidth: 160 }}>
                            {item.campos}
                          </td>
                          <td style={{ ...tdBase, color: CORPO_70, minWidth: 220 }}>
                            {renderizarTextoComNegrito(item.oQueFaz)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <p style={{
        margin: 0,
        padding: '12px 18px 16px',
        fontSize: '.72rem',
        lineHeight: 1.55,
        color: CORPO_70,
        borderTop: '1px solid rgba(148,163,184,.1)',
      }}>
        A lista do modal é **dinâmica**: sugestões **somem** quando o widget equivalente já está no painel ou quando o campo já está em uso.
        Badge **Alta confiança** indica combinação recomendada pelo catálogo do Pedido.
      </p>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { CaretDown, MagnifyingGlass, Warning } from '@phosphor-icons/react'
import {
  GRUPOS_ALERTAS_COLUNAS_PEDIDO_LISTA,
  TOTAL_ALERTAS_COLUNAS_PEDIDO_LISTA,
  type ManualPedidoLinhaAlertaLista,
} from './manual-pedido-alertas-colunas-dados'

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

function linhaCorrespondeBusca(linha: ManualPedidoLinhaAlertaLista, busca: string) {
  if (!busca) return true
  const alvo = normalizarBusca(
    `${linha.coluna} ${linha.nivel} ${linha.tipoAlerta} ${linha.acionamento}`,
  )
  return alvo.includes(busca)
}

/** Manual Pedido §05 — catálogo de colunas com alerta e condição de acionamento */
export function ManualPedidoTabelaAlertasLista() {
  const [busca, setBusca] = useState('')
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GRUPOS_ALERTAS_COLUNAS_PEDIDO_LISTA.map((g) => [g.id, false])),
  )

  const buscaNormalizada = normalizarBusca(busca)

  const gruposFiltrados = useMemo(() => {
    return GRUPOS_ALERTAS_COLUNAS_PEDIDO_LISTA
      .map((grupo) => ({
        ...grupo,
        colunas: grupo.colunas.filter((coluna) => linhaCorrespondeBusca(coluna, buscaNormalizada)),
      }))
      .filter((grupo) => grupo.colunas.length > 0)
  }, [buscaNormalizada])

  const totalVisivel = gruposFiltrados.reduce((acc, g) => acc + g.colunas.length, 0)

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
      background: 'linear-gradient(145deg, rgba(251,191,36,.06) 0%, rgba(148,163,184,.04) 50%, rgba(248,113,113,.04) 100%)',
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
          <Warning size={18} weight="duotone" color="#fbbf24" />
          <div>
            <p style={{ margin: 0, fontSize: '.88rem', fontWeight: 800, color: '#f1f5f9' }}>
              Colunas e campos com alerta
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '.7rem', color: CORPO_70 }}>
              {totalVisivel} de {TOTAL_ALERTAS_COLUNAS_PEDIDO_LISTA} registros · {gruposFiltrados.length} grupos
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.05em',
          color: '#fde68a',
          background: 'rgba(251,191,36,.14)',
          border: '1px solid rgba(251,191,36,.32)',
          borderRadius: 999,
          padding: '5px 11px',
        }}>
          SSOT: columnAlertConfig + pills da Lista
        </span>
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 200,
          flex: '1 1 220px',
          maxWidth: 320,
        }}>
          <MagnifyingGlass size={16} color="#94a3b8" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar coluna ou regra…"
            aria-label="Buscar colunas com alerta"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(148,163,184,.2)',
              background: 'rgba(8,12,24,.35)',
              color: '#f1f5f9',
              fontSize: '.74rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 0 4px' }}>
        {gruposFiltrados.map((grupo) => {
          const aberto = gruposAbertos[grupo.id] ?? false
          return (
            <div key={grupo.id} style={{ borderBottom: '1px solid rgba(148,163,184,.08)' }}>
              <button
                type="button"
                onClick={() => alternarGrupo(grupo.id)}
                aria-expanded={aberto}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 18px',
                  background: aberto ? 'rgba(251,191,36,.08)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  color="#fbbf24"
                  style={{
                    transform: aberto ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform .15s ease',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '.78rem', fontWeight: 800, color: '#e2e8f0', flex: 1 }}>
                  {grupo.titulo}
                </span>
                <span style={{
                  fontSize: '.62rem',
                  fontWeight: 700,
                  color: '#fcd34d',
                  background: 'rgba(251,191,36,.12)',
                  borderRadius: 999,
                  padding: '3px 9px',
                }}>
                  {grupo.colunas.length}
                </span>
              </button>
              {aberto && (
                <div style={{ overflowX: 'auto', padding: '0 12px 12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th style={thBase}>Coluna</th>
                        <th style={{ ...thBase, width: '14%' }}>Nível</th>
                        <th style={{ ...thBase, width: '18%' }}>Tipo</th>
                        <th style={thBase}>Quando aciona</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.colunas.map((linha) => (
                        <tr key={linha.key}>
                          <td style={{ ...tdBase, fontWeight: 700, color: '#e2e8f0' }}>
                            {linha.coluna}
                          </td>
                          <td style={{ ...tdBase, color: CORPO_70, fontSize: '.72rem' }}>
                            {linha.nivel}
                          </td>
                          <td style={{ ...tdBase, color: '#fcd34d', fontSize: '.72rem', fontWeight: 600 }}>
                            {linha.tipoAlerta}
                          </td>
                          <td style={{ ...tdBase, color: CORPO_70, fontSize: '.72rem' }}>
                            {renderizarTextoComNegrito(linha.acionamento)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
        Campos **NCM** e **Descrição** agregam vários valores no pedido: não exibem alerta âmbar. **Anexos** e **contatos** também ficam fora desta tabela.
      </p>
    </div>
  )
}

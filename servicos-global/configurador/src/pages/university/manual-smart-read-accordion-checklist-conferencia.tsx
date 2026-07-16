import React, { useMemo, useState } from 'react'
import { CaretDown, ClipboardText, MagnifyingGlass } from '@phosphor-icons/react'
import {
  GRUPOS_CHECKLIST_CONFERENCIA_SMART_READ,
  TOTAL_REGRAS_CHECKLIST_SMART_READ,
  type GrupoChecklistManual,
  type LinhaChecklistManual,
} from './manual-smart-read-checklist-conferencia-dados'

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

function linhaCorrespondeBusca(linha: LinhaChecklistManual, busca: string) {
  if (!busca) return true
  const alvo = normalizarBusca(
    `${linha.oQueE} ${linha.comoFeito} ${linha.baseLegal} ${linha.documentos}`,
  )
  return alvo.includes(busca)
}

type Props = {
  marginTop?: number
}

export function ManualSmartReadAccordionChecklistConferencia({ marginTop = 20 }: Props) {
  const [busca, setBusca] = useState('')
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({})

  const buscaNormalizada = normalizarBusca(busca)

  const gruposFiltrados = useMemo(() => {
    return GRUPOS_CHECKLIST_CONFERENCIA_SMART_READ
      .map((grupo) => ({
        ...grupo,
        colunas: grupo.colunas.filter((linha) => linhaCorrespondeBusca(linha, buscaNormalizada)),
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
    fontSize: '.58rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    color: '#94a3b8',
    borderBottom: '1px solid rgba(148,163,184,.12)',
    background: 'rgba(8,12,24,.18)',
  }

  const tdBase: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '.72rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
    color: CORPO_70,
  }

  return (
    <div style={{
      marginTop,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
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
          <ClipboardText size={16} weight="duotone" color="#818cf8" />
          Regras do checklist
          <span style={{
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            textTransform: 'none',
            color: '#c7d2fe',
            background: 'rgba(99,102,241,.18)',
            border: '1px solid rgba(129,140,248,.35)',
            borderRadius: 999,
            padding: '2px 8px',
          }}>
            {buscaNormalizada ? `${totalVisivel} de ${TOTAL_REGRAS_CHECKLIST_SMART_READ}` : `${TOTAL_REGRAS_CHECKLIST_SMART_READ} regras`}
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
            placeholder="Filtrar regra…"
            aria-label="Filtrar regras do checklist"
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
            Nenhuma regra corresponde a «{busca}».
          </p>
        ) : gruposFiltrados.map((grupo: GrupoChecklistManual) => {
          const aberto = gruposAbertos[grupo.id] ?? false
          return (
            <section
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
                  gap: 10,
                  padding: '11px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: aberto ? 'rgba(99,102,241,.1)' : 'rgba(148,163,184,.04)',
                  color: 'var(--ws-text, #f1f5f9)',
                  textAlign: 'left',
                }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  color="#818cf8"
                  style={{
                    flexShrink: 0,
                    transform: aberto ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform .2s',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '.78rem', flex: 1 }}>
                  {grupo.tipoDocumento} · {grupo.titulo}
                </span>
                <span style={{
                  fontSize: '.62rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  background: 'rgba(148,163,184,.12)',
                  borderRadius: 999,
                  padding: '2px 8px',
                }}>
                  {grupo.colunas.length}
                </span>
              </button>
              {aberto && (
                <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(148,163,184,.08)' }}>
                  <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thBase, width: '4%' }}>#</th>
                        <th style={{ ...thBase, width: '22%' }}>O que é</th>
                        <th style={{ ...thBase, width: '16%' }}>Como é feito</th>
                        <th style={{ ...thBase, width: '20%' }}>Base legal</th>
                        <th style={{ ...thBase, width: '18%' }}>Resultados possíveis</th>
                        <th style={{ ...thBase, width: '20%' }}>Documentos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.colunas.map((linha, i) => (
                        <tr
                          key={`${grupo.id}-${linha.ordem}`}
                          style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.12)' : 'transparent' }}
                        >
                          <td style={{ ...tdBase, color: '#64748b', fontWeight: 700, fontSize: '.68rem' }}>
                            {String(linha.ordem).padStart(2, '0')}
                          </td>
                          <td style={tdBase}>{renderizarTextoComNegrito(linha.oQueE)}</td>
                          <td style={{ ...tdBase, color: '#fde68a' }}>{linha.comoFeito}</td>
                          <td style={{ ...tdBase, color: '#a7f3d0', fontSize: '.68rem' }}>{linha.baseLegal}</td>
                          <td style={{ ...tdBase, fontSize: '.68rem' }}>{linha.resultadosPossiveis}</td>
                          <td style={tdBase}>{linha.documentos}</td>
                        </tr>
                      ))}
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
        borderTop: '1px solid rgba(148,163,184,.08)',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        Matriz alimentada pelo SSOT do produto — mesmas regras exibidas no modal **Checklist** da Conferência.
        Status no padrão aviação: **CONFORME**, **ATENÇÃO**, **FALHA**, **PENDENTE** e **N/A**.
      </p>
    </div>
  )
}

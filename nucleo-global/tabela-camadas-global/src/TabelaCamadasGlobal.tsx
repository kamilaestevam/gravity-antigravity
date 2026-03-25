// @nucleo/tabela-camadas-global — componente principal
// Tabela em camadas: linhas pai (Organizações) com accordion expansível para filhos (Espaços de Trabalho).
// NÃO altera nem depende de tabela-global.

import React, { useState, useMemo, useRef, useEffect } from 'react'
import './tabela-camadas.css'
import type { TabelaCamadasGlobalProps, TCGColuna, TCGAcao } from './tipos.js'

// ─── Ícones internos (SVG inline para não depender de phosphor) ───────────────

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeBusca() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconeExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeAnterior() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeProximo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Célula ───────────────────────────────────────────────────────────────────

function renderCelula<T>(coluna: TCGColuna<T>, item: T, isPai: boolean): React.ReactNode {
  const valor = (item as any)[coluna.key]
  if (coluna.render) return coluna.render(valor, item)
  if (valor === null || valor === undefined) return <span style={{ color: 'var(--tcg-muted)' }}>—</span>
  return <span>{String(valor)}</span>
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLinhas({ colunas }: { colunas: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="tcg-tr-pai">
          <td className="tcg-td tcg-td--expand">
            <div className="tcg-skeleton" style={{ width: 24, height: 24, borderRadius: 6 }} />
          </td>
          {Array.from({ length: colunas }).map((_, j) => (
            <td key={j} className="tcg-td">
              <div className="tcg-skeleton" style={{ width: j === 0 ? '70%' : '50%' }} />
            </td>
          ))}
          <td className="tcg-td tcg-td--acoes">
            <div className="tcg-skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} />
          </td>
        </tr>
      ))}
    </>
  )
}

// ─── Ações de linha ───────────────────────────────────────────────────────────

function AcoesLinha<T>({ acoes, item }: { acoes: TCGAcao<T>[]; item: T }) {
  if (!acoes.length) return null
  return (
    <div className="tcg-acoes-grupo">
      {acoes.map((acao) => {
        if (acao.renderCustom) return <React.Fragment key={acao.id}>{acao.renderCustom(item)}</React.Fragment>
        return (
          <button
            key={acao.id}
            type="button"
            className="tcg-acao-btn"
            title={acao.tooltip}
            onClick={(e) => { e.stopPropagation(); acao.onClick?.(item) }}
          >
            {acao.icone}
          </button>
        )
      })}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function TabelaCamadasGlobal<T = any, C = any>(props: TabelaCamadasGlobalProps<T, C>) {
  const {
    dados,
    colunas,
    colunasFilhas,
    filhos,
    acoes = [],
    acoesFilhas = [],
    acoesExportacao = [],
    placeholderBusca = 'Localizar',
    campoBusca,
    mensagemVazio = 'Nenhum item encontrado.',
    carregando = false,
    expandidosPadrao = [],
    itemId = (item: T) => (item as any).id,
    itensPorPagina: itensPorPaginaInicial = 10,
  } = props

  const [busca, setBusca] = useState('')
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set(expandidosPadrao))
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaInicial)
  const [exportMenuAberto, setExportMenuAberto] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Fechar menu de export ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filtro de busca
  const dadosFiltrados = useMemo(() => {
    if (!busca.trim()) return dados
    const q = busca.toLowerCase()
    return dados.filter(item => {
      if (campoBusca) return String((item as any)[campoBusca]).toLowerCase().includes(q)
      // Busca em todos os campos string
      return Object.values(item as any).some(v => typeof v === 'string' && v.toLowerCase().includes(q))
    })
  }, [dados, busca, campoBusca])

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const dadosPagina = dadosFiltrados.slice(inicio, inicio + itensPorPagina)

  function toggleExpandido(id: string) {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const temExport = acoesExportacao.length > 0
  const colSpanTotal = colunas.length + 2 // expand + colunas + acoes

  return (
    <div className="tcg-container">

      {/* ── Toolbar ── */}
      <div className="tcg-toolbar">
        <div className="tcg-toolbar-esquerda">
          <div className="tcg-busca-wrapper">
            <span className="tcg-busca-icone"><IconeBusca /></span>
            <input
              className="tcg-busca-input"
              type="text"
              placeholder={placeholderBusca}
              value={busca}
              onChange={e => { setBusca(e.target.value); setPagina(1) }}
            />
          </div>
        </div>

        {temExport && (
          <div className="tcg-toolbar-direita">
            <div className="tcg-export-wrapper" ref={exportRef}>
              <button
                type="button"
                className="tcg-btn"
                onClick={() => setExportMenuAberto(v => !v)}
              >
                <IconeExport />
                Exportar
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {exportMenuAberto && (
                <div className="tcg-export-menu">
                  {acoesExportacao.map((acao, i) => (
                    <button
                      key={i}
                      type="button"
                      className="tcg-export-item"
                      onClick={() => { acao.onClick(); setExportMenuAberto(false) }}
                    >
                      {acao.icone}
                      {acao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Tabela ── */}
      <div className="tcg-scroll">
        <table className="tcg-tabela">
          <thead className="tcg-cabecalho">
            <tr>
              {/* Coluna expand */}
              <th className="tcg-th tcg-th--expand" />
              {/* Colunas pai */}
              {colunas.map(col => (
                <th
                  key={col.key}
                  className={`tcg-th${col.align === 'center' ? ' tcg-th--center' : col.align === 'right' ? ' tcg-th--right' : ''}`}
                >
                  <span className="tcg-th-inner">
                    {col.label}
                    {col.tooltipTitulo && (
                      <span
                        title={`${col.tooltipTitulo}${col.tooltipDescricao ? '\n\n' + col.tooltipDescricao : ''}`}
                        style={{ cursor: 'help', opacity: 0.5, fontSize: '0.625rem' }}
                      >▾</span>
                    )}
                  </span>
                </th>
              ))}
              {/* Coluna ações */}
              {acoes.length > 0 && <th className="tcg-th tcg-th--acoes">AÇÕES</th>}
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <SkeletonLinhas colunas={colunas.length} />
            ) : dadosPagina.length === 0 ? (
              <tr>
                <td colSpan={colSpanTotal} className="tcg-vazio">
                  {mensagemVazio}
                </td>
              </tr>
            ) : (
              dadosPagina.map(item => {
                const id = itemId(item)
                const aberto = expandidos.has(id)
                const filhosItem = filhos(item)
                const temFilhos = filhosItem.length > 0

                return (
                  <React.Fragment key={id}>
                    {/* ── Linha PAI ── */}
                    <tr
                      className={`tcg-tr-pai${aberto ? ' tcg-tr-pai--expandida' : ''}`}
                      onClick={() => temFilhos && toggleExpandido(id)}
                    >
                      {/* Chevron */}
                      <td className="tcg-td tcg-td--expand">
                        {temFilhos ? (
                          <button
                            type="button"
                            className="tcg-chevron-btn"
                            onClick={e => { e.stopPropagation(); toggleExpandido(id) }}
                            aria-label={aberto ? 'Recolher' : 'Expandir'}
                          >
                            <span className={`tcg-chevron-icon${aberto ? ' tcg-chevron-icon--aberto' : ''}`}>
                              <IconeChevron />
                            </span>
                          </button>
                        ) : (
                          <span style={{ display: 'inline-block', width: 24 }} />
                        )}
                      </td>

                      {/* Células pai — injetamos o badge de contagem na primeira coluna */}
                      {colunas.map((col, colIdx) => (
                        <td
                          key={col.key}
                          className={`tcg-td${col.align === 'center' ? ' tcg-td--center' : col.align === 'right' ? ' tcg-td--right' : ''}`}
                        >
                          {colIdx === 0 && temFilhos ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
                              {renderCelula(col, item, true)}
                              <span className="tcg-badge-filhos">{filhosItem.length}</span>
                            </span>
                          ) : (
                            renderCelula(col, item, true)
                          )}
                        </td>
                      ))}

                      {/* Ações pai */}
                      {acoes.length > 0 && (
                        <td className="tcg-td tcg-td--acoes" onClick={e => e.stopPropagation()}>
                          <AcoesLinha acoes={acoes} item={item} />
                        </td>
                      )}
                    </tr>

                    {/* ── Linha de accordion (filhos) ── */}
                    {temFilhos && (
                      <tr className="tcg-tr-filhos-wrapper">
                        <td colSpan={colSpanTotal} style={{ padding: 0 }}>
                          <div className={`tcg-accordion${aberto ? ' tcg-accordion--aberto' : ''}`}>
                            <div className="tcg-subtabela-wrapper">
                              <table className="tcg-subtabela">
                                {/* Cabeçalho sub-tabela */}
                                <thead className="tcg-subtabela-cabecalho">
                                  <tr>
                                    {colunasFilhas.map(col => (
                                      <th
                                        key={col.key}
                                        className={`tcg-sub-th${col.align === 'center' ? ' tcg-sub-th--center' : col.align === 'right' ? ' tcg-sub-th--right' : ''}`}
                                      >
                                        {col.label}
                                      </th>
                                    ))}
                                    {acoesFilhas.length > 0 && <th className="tcg-sub-th tcg-sub-th--acoes">AÇÕES</th>}
                                  </tr>
                                </thead>
                                {/* Linhas filhas */}
                                <tbody>
                                  {filhosItem.map((filho, fi) => (
                                    <tr key={(filho as any).id ?? fi} className="tcg-tr-filho">
                                      {colunasFilhas.map((col, i) => (
                                        <td
                                          key={col.key}
                                          className={`tcg-sub-td${col.align === 'center' ? ' tcg-sub-td--center' : col.align === 'right' ? ' tcg-sub-td--right' : ''}`}
                                        >
                                          {renderCelula(col, filho, false)}
                                        </td>
                                      ))}
                                      {acoesFilhas.length > 0 && (
                                        <td className="tcg-sub-td tcg-sub-td--acoes">
                                          <AcoesLinha acoes={acoesFilhas} item={filho} />
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginação ── */}
      <div className="tcg-paginacao">
        <span className="tcg-paginacao-info">
          {carregando
            ? 'Carregando...'
            : `${inicio + 1}–${Math.min(inicio + itensPorPagina, dadosFiltrados.length)} de ${dadosFiltrados.length}`
          }
        </span>

        <div className="tcg-paginacao-controles">
          <button className="tcg-pag-btn" disabled={paginaAtual <= 1} onClick={() => setPagina(1)}>«</button>
          <button className="tcg-pag-btn" disabled={paginaAtual <= 1} onClick={() => setPagina(p => p - 1)}>
            <IconeAnterior />
          </button>
          <span className="tcg-paginacao-pagina">{paginaAtual} / {totalPaginas}</span>
          <button className="tcg-pag-btn" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(p => p + 1)}>
            <IconeProximo />
          </button>
          <button className="tcg-pag-btn" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(totalPaginas)}>»</button>
        </div>

        <div className="tcg-paginacao-tamanho">
          <span>Por página:</span>
          <select
            className="tcg-select-pagina"
            value={itensPorPagina}
            onChange={e => { setItensPorPagina(Number(e.target.value)); setPagina(1) }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

    </div>
  )
}

// @nucleo/tabela-camadas-global — componente principal
// Tabela em camadas: linhas pai (Organizações) com linhas filhas (Workspaces)
// diretamente no mesmo <tbody> — garantindo alinhamento perfeito com as colunas pai.
// NÃO altera nem depende de tabela-global.

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Columns } from '@phosphor-icons/react'
import { useTablePersistence } from '../../tabela-global/src/hooks/useTablePersistence.js'
import { VisibilidadeColunasGlobal } from '../../tabela-global/src/componentes/VisibilidadeColunasGlobal.js'
import './tabela-camadas.css'
import type { TabelaCamadasGlobalProps, TCGColuna, TCGAcao } from './tipos.js'

// ─── Ícones internos ──────────────────────────────────────────────────────────

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeBusca() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconeExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

// ─── Render de célula ─────────────────────────────────────────────────────────

function renderCelula<T>(coluna: TCGColuna<T>, item: T): React.ReactNode {
  const valor = (item as any)[coluna.key]
  if (coluna.render) return coluna.render(valor, item)
  if (valor === null || valor === undefined) return <span style={{ color: 'var(--tcg-muted)' }}>—</span>
  return <span>{String(valor)}</span>
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLinhas({ colunas, temAcoes }: { colunas: number; temAcoes: boolean }) {
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
          {temAcoes && (
            <td className="tcg-td tcg-td--acoes">
              <div className="tcg-skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} />
            </td>
          )}
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
          <TooltipGlobal key={acao.id} descricao={acao.tooltip}>
            <button
              type="button"
              className="tcg-acao-btn"
              onClick={(e) => { e.stopPropagation(); acao.onClick?.(item) }}
            >
              {acao.icone}
            </button>
          </TooltipGlobal>
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
    placeholderBusca,
    campoBusca,
    mensagemVazio,
    carregando = false,
    expandidosPadrao = [],
    itemId = (item: T) => (item as any).id,
    itensPorPagina: itensPorPaginaInicial = 10,
    id: tableId
  } = props

  const { t } = useTranslation()
  const resolvedPlaceholderBusca = placeholderBusca ?? t('tabela.localizar')
  const resolvedMensagemVazio = mensagemVazio ?? t('tabela.nenhum_item')

  // ─── Visibilidade de Colunas (Persistência) ───
  const colunasConfig = useMemo(() => colunas.map(c => ({ 
    key: c.key as string, 
    label: c.label, 
    naoOcultavel: (c as any).naoOcultavel 
  })), [colunas])

  const {
    visibleKeys,
    isVisible,
    toggleVisibility,
    resetToDefault,
    setAllVisible,
    clearAllVisible
  } = useTablePersistence({
    tableId: tableId || 'tcg-default',
    initialKeys: colunas.map(c => c.key as string),
    defaultHiddenKeys: colunas.filter(c => (c as any).oculta).map(c => c.key as string)
  })

  const colunasVisiveis = useMemo(() => 
    tableId ? colunas.filter(c => isVisible(c.key as string)) : colunas,
    [colunas, tableId, isVisible]
  )

  const colunasFilhasVisiveis = useMemo(() => 
    tableId ? colunasFilhas.filter(c => isVisible(c.key as string)) : colunasFilhas,
    [colunasFilhas, tableId, isVisible]
  )

  const [visibilidadeAberta, setVisibilidadeAberta] = useState(false)
  const visibilidadeBtnRef = useRef<HTMLButtonElement>(null)

  const [busca, setBusca] = useState('')
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set(expandidosPadrao))
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaInicial)
  const [exportMenuAberto, setExportMenuAberto] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dadosFiltrados = useMemo(() => {
    if (!busca.trim()) return dados
    const q = busca.toLowerCase()
    return dados.filter(item => {
      if (campoBusca) return String((item as any)[campoBusca]).toLowerCase().includes(q)
      return colunasVisiveis.some(c => String((item as any)[c.key]).toLowerCase().includes(q))
    })
  }, [dados, busca, campoBusca, colunasVisiveis])

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
  const temAcoes = acoes.length > 0

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
              placeholder={resolvedPlaceholderBusca}
              value={busca}
              onChange={e => { setBusca(e.target.value); setPagina(1) }}
            />
          </div>
        </div>

        <div className="tcg-toolbar-direita" style={{ display: 'flex', gap: '0.5rem' }}>
          {tableId && (
            <div style={{ position: 'relative' }}>
              <TooltipGlobal descricao={t('tabela.gerenciar_colunas')}>
                <button
                  ref={visibilidadeBtnRef}
                  type="button"
                  className="tcg-btn"
                  onClick={() => setVisibilidadeAberta(v => !v)}
                  style={{ minWidth: 'auto', padding: '0.4375rem 0.625rem' }}
                >
                  <Columns size={13} weight="bold" />
                </button>
              </TooltipGlobal>
              {visibilidadeAberta && (
                <VisibilidadeColunasGlobal 
                  colunas={colunasConfig}
                  visibleKeys={visibleKeys}
                  onToggle={toggleVisibility}
                  onReset={resetToDefault}
                  onShowAll={setAllVisible}
                  onHideAll={clearAllVisible}
                  onFechar={() => setVisibilidadeAberta(false)}
                  triggerRef={visibilidadeBtnRef as React.RefObject<HTMLButtonElement | null>}
                />
              )}
            </div>
          )}

          {temExport && (
            <div className="tcg-export-wrapper" ref={exportRef}>
              <button type="button" className="tcg-btn" onClick={() => setExportMenuAberto(v => !v)}>
                <IconeExport />
                {t('tabela.exportar')}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {exportMenuAberto && (
                <div className="tcg-export-menu">
                  {acoesExportacao.map((acao, i) => (
                    <button key={i} type="button" className="tcg-export-item" onClick={() => { acao.onClick(); setExportMenuAberto(false) }}>
                      {acao.icone}
                      {acao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="tcg-scroll">
        <table className="tcg-tabela">

          {/* Cabeçalho — compartilhado por pai e filho */}
          <thead className="tcg-cabecalho">
            <tr>
              <th className="tcg-th tcg-th--expand" />
              {colunasVisiveis.map(col => (
                <th
                  key={col.key as string}
                  className={`tcg-th${col.align === 'center' ? ' tcg-th--center' : col.align === 'right' ? ' tcg-th--right' : ''}`}
                >
                  <span className="tcg-th-inner">
                    {col.label}
                    {(col as any).tooltipTitulo && (
                      <TooltipGlobal titulo={(col as any).tooltipTitulo} descricao={(col as any).tooltipDescricao}>
                        <span
                          style={{ opacity: 0.4, fontSize: '0.625rem' }}
                        >▾</span>
                      </TooltipGlobal>
                    )}
                  </span>
                </th>
              ))}
              {temAcoes && <th className="tcg-th tcg-th--acoes">{t('tabela.acoes')}</th>}
            </tr>
          </thead>

          {/* Body — pai e filho no mesmo tbody */}
          <tbody>
            {carregando ? (
              <SkeletonLinhas colunas={colunas.length} temAcoes={temAcoes} />
            ) : dadosPagina.length === 0 ? (
              <tr>
                <td colSpan={colunas.length + (temAcoes ? 2 : 1)} className="tcg-vazio">
                  {resolvedMensagemVazio}
                </td>
              </tr>
            ) : (
              dadosPagina.map(item => {
                const id = itemId(item)
                const aberto = expandidos.has(id)
                const filhosItem = filhos(item)
                const temFilhos = filhosItem.length > 0
                const ehUltimoGrupo = dadosPagina[dadosPagina.length - 1] === item

                return (
                  <React.Fragment key={id}>

                    {/* ── Linha PAI ── */}
                    <tr
                      className={`tcg-tr-pai${aberto ? ' tcg-tr-pai--expandida' : ''}${!aberto && !ehUltimoGrupo ? ' tcg-tr-pai--borda' : ''}`}
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

                      {/* Células pai */}
                      {colunasVisiveis.map((col, colIdx) => (
                        <td
                          key={col.key as string}
                          className={`tcg-td${col.align === 'center' ? ' tcg-td--center' : col.align === 'right' ? ' tcg-td--right' : ''}`}
                        >
                          {colIdx === 0 && temFilhos ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
                              {renderCelula(col, item)}
                              <span className="tcg-badge-filhos">{filhosItem.length}</span>
                            </span>
                          ) : (
                            renderCelula(col, item)
                          )}
                        </td>
                      ))}

                      {/* Ações pai */}
                      {temAcoes && (
                        <td className="tcg-td tcg-td--acoes" onClick={e => e.stopPropagation()}>
                          <AcoesLinha acoes={acoes} item={item} />
                        </td>
                      )}
                    </tr>

                    {/* ── Linhas FILHAS — mesmo tbody, alinhadas com pai ── */}
                    {temFilhos && filhosItem.map((filho, fi) => {
                      const isUltimo = fi === filhosItem.length - 1
                      return (
                        <tr
                          key={(filho as any).id ?? fi}
                          className={`tcg-tr-filho${aberto ? ' tcg-tr-filho--visivel' : ''}${isUltimo ? ' tcg-tr-filho--ultimo' : ''}`}
                          style={{ animationDelay: `${fi * 20}ms` }}
                        >
                          {/* Indicador de hierarquia */}
                          <td className="tcg-td tcg-td--filho-expand">
                            <span className="tcg-conector">
                              {isUltimo ? '└' : '├'}
                            </span>
                          </td>

                          {/* Células filha — alinhadas com colunas pai */}
                          {colunasFilhas.map((col, colIdx) => (
                            <td
                              key={col.key}
                              className={`tcg-td tcg-td--filho${col.align === 'center' ? ' tcg-td--center' : col.align === 'right' ? ' tcg-td--right' : ''}${colIdx === 0 ? ' tcg-td--filho-first' : ''}`}
                            >
                              {renderCelula(col, filho)}
                            </td>
                          ))}

                          {/* Ações filha */}
                          {temAcoes && (
                            <td className="tcg-td tcg-td--acoes tcg-td--filho">
                              {acoesFilhas.length > 0
                                ? <AcoesLinha acoes={acoesFilhas} item={filho} />
                                : null
                              }
                            </td>
                          )}
                        </tr>
                      )
                    })}

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
            ? t('comum.carregando')
            : `${inicio + 1}–${Math.min(inicio + itensPorPagina, dadosFiltrados.length)} de ${dadosFiltrados.length}`
          }
        </span>

        <div className="tcg-paginacao-controles">
          <button className="tcg-pag-btn" disabled={paginaAtual <= 1} onClick={() => setPagina(1)}>«</button>
          <button className="tcg-pag-btn" disabled={paginaAtual <= 1} onClick={() => setPagina((p: number) => p - 1)}>
            <IconeAnterior />
          </button>
          <span className="tcg-paginacao-pagina">{paginaAtual} / {totalPaginas}</span>
          <button className="tcg-pag-btn" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina((p: number) => p + 1)}>
            <IconeProximo />
          </button>
          <button className="tcg-pag-btn" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(totalPaginas)}>»</button>
        </div>

        <div className="tcg-paginacao-tamanho">
          <span>{t('tabela.por_pagina_label')}</span>
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

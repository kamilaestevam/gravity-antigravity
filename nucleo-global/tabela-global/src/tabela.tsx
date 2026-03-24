/**
 * @nucleo/tabela-global — tabela
 * TabelaGlobal: tabela genérica e reutilizável com filtros, paginação e export.
 * Sem estado de servidor. Sem API calls.
 */

import React, { useState, useMemo, useId, useRef, useEffect } from 'react'
import { MagnifyingGlass, DownloadSimple } from '@phosphor-icons/react'
import { CabecalhoTabela } from './cabecalho.js'
import { Celula } from './celula.js'
import type {
  TabelaProps,
  RegistroTabela,
  EstadoOrdenacao,
  EstadoFiltros,
  IdRegistro,
  DirecaoOrdenacao,
  FormatoExport,
} from './tipos.js'
import './tabela.css'

// ─── Helpers de sort local ────────────────────────────────────────────────────

function compararValores(a: unknown, b: unknown, direcao: DirecaoOrdenacao): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return direcao === 'asc' ? a - b : b - a
  }

  const sa = String(a).toLowerCase()
  const sb = String(b).toLowerCase()
  const cmp = sa.localeCompare(sb, 'pt-BR')
  return direcao === 'asc' ? cmp : -cmp
}

// ─── Export helpers ───────────────────────────────────────────────────────────

function exportarCSV<T extends RegistroTabela>(dados: T[], colunas: TabelaProps<T>['colunas'], nomeArquivo: string) {
  const cols = colunas.filter((c) => !c.oculta)
  const header = cols.map((c) => `"${c.label}"`).join(',')
  const linhas = dados.map((linha) =>
    cols
      .map((c) => {
        const v = linha[c.key]
        return `"${v != null ? String(v).replace(/"/g, '""') : ''}"`
      })
      .join(',')
  )
  const csv = [header, ...linhas].join('\n')
  downloadTexto(csv, `${nomeArquivo}.csv`, 'text/csv;charset=utf-8;')
}

function exportarTXT<T extends RegistroTabela>(dados: T[], colunas: TabelaProps<T>['colunas'], nomeArquivo: string) {
  const cols = colunas.filter((c) => !c.oculta)
  const header = cols.map((c) => c.label).join('\t')
  const linhas = dados.map((linha) =>
    cols.map((c) => (linha[c.key] != null ? String(linha[c.key]) : '')).join('\t')
  )
  downloadTexto([header, ...linhas].join('\n'), `${nomeArquivo}.txt`, 'text/plain;charset=utf-8;')
}

function escaparXML(str: string): string {
  return str.replace(/[<>&"']/g, (ch) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[ch] ?? ch))
}

function exportarXML<T extends RegistroTabela>(dados: T[], colunas: TabelaProps<T>['colunas'], nomeArquivo: string) {
  const cols = colunas.filter((c) => !c.oculta)
  const rows = dados
    .map((linha) => {
      const fields = cols
        .map((c) => `    <${c.key}>${escaparXML(linha[c.key] != null ? String(linha[c.key]) : '')}</${c.key}>`)
        .join('\n')
      return `  <registro>\n${fields}\n  </registro>`
    })
    .join('\n')
  downloadTexto(
    `<?xml version="1.0" encoding="UTF-8"?>\n<dados>\n${rows}\n</dados>`,
    `${nomeArquivo}.xml`,
    'application/xml'
  )
}

function exportarExcel<T extends RegistroTabela>(dados: T[], colunas: TabelaProps<T>['colunas'], nomeArquivo: string) {
  const cols = colunas.filter((c) => !c.oculta)
  const header = `<tr>${cols.map((c) => `<th>${c.label}</th>`).join('')}</tr>`
  const rows = dados
    .map(
      (linha) =>
        `<tr>${cols.map((c) => `<td>${linha[c.key] != null ? String(linha[c.key]) : ''}</td>`).join('')}</tr>`
    )
    .join('')
  const html = [
    `<html xmlns:o="urn:schemas-microsoft-com:office:office"`,
    ` xmlns:x="urn:schemas-microsoft-com:office:excel"`,
    ` xmlns="http://www.w3.org/TR/REC-html40">`,
    `<head><meta charset="UTF-8"></head>`,
    `<body><table border="1">${header}${rows}</table></body></html>`,
  ].join('')
  downloadTexto(html, `${nomeArquivo}.xls`, 'application/vnd.ms-excel')
}

function exportarJSON<T extends RegistroTabela>(dados: T[], nomeArquivo: string) {
  const json = JSON.stringify(dados, null, 2)
  downloadTexto(json, `${nomeArquivo}.json`, 'application/json')
}

function downloadTexto(conteudo: string, nomeArquivo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function TabelaGlobal<T extends RegistroTabela = RegistroTabela>({
  colunas,
  dados,
  itensPorPagina: itensPorPaginaInicial = 20,
  opcoesItensPorPagina = [10, 20, 50, 100],
  buscaGlobal = true,
  buscaPlaceholder = 'Buscar...',
  filtros,
  selecao = false,
  selecionados: selecionadosExterno,
  aoMudarSelecao,
  acoesLinha,
  exportConfig,
  carregando = false,
  mensagemVazia = 'Nenhum registro encontrado.',
  renderizarVazio,
  aoClicarLinha,
}: TabelaProps<T>) {
  const id = useId()

  // Estado interno
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<EstadoOrdenacao | null>(null)
  const [estadoFiltros, setEstadoFiltros] = useState<EstadoFiltros>(() => {
    const inicial: EstadoFiltros = {}
    filtros?.forEach((f) => {
      if (f.valorInicial !== undefined) inicial[f.key] = f.valorInicial
    })
    return inicial
  })
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaInicial)
  const [selecionadosInternos, setSelecionadosInternos] = useState<Set<IdRegistro>>(new Set())
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [exportMenuAberto, setExportMenuAberto] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Fecha o menu de export ao clicar fora
  useEffect(() => {
    if (!exportMenuAberto) return
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportMenuAberto])

  // Seleção controlada ou interna
  const selecionados = useMemo(
    () => (selecionadosExterno ? new Set(selecionadosExterno) : selecionadosInternos),
    [selecionadosExterno, selecionadosInternos]
  )

  const setarSelecionados = (novos: Set<IdRegistro>) => {
    if (!selecionadosExterno) setSelecionadosInternos(novos)
    aoMudarSelecao?.([...novos])
  }

  // ─── Filtragem e ordenação ──────────────────────────────────────────────────

  const dadosFiltrados = useMemo(() => {
    let resultado = [...dados]

    // Busca global
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase()
      const colunasFiltraveis = colunas.filter((c) => c.filtravel !== false)
      resultado = resultado.filter((linha) =>
        colunasFiltraveis.some((col) => {
          const v = linha[col.key]
          return v != null && String(v).toLowerCase().includes(termo)
        })
      )
    }

    // Filtros configuráveis
    Object.entries(estadoFiltros).forEach(([key, valor]) => {
      if (valor === undefined || valor === null || valor === '') return
      resultado = resultado.filter((linha) => {
        const v = linha[key as keyof T]
        if (typeof valor === 'string') {
          return String(v ?? '').toLowerCase().includes(valor.toLowerCase())
        }
        return v === valor
      })
    })

    // Ordenação
    if (ordenacao) {
      resultado.sort((a, b) =>
        compararValores(a[ordenacao.coluna as keyof T], b[ordenacao.coluna as keyof T], ordenacao.direcao)
      )
    }

    return resultado
  }, [dados, busca, estadoFiltros, ordenacao, colunas])

  // ─── Paginação ─────────────────────────────────────────────────────────────

  const totalPaginas = Math.max(1, Math.ceil(dadosFiltrados.length / itensPorPagina))
  const paginaSegura = Math.min(paginaAtual, totalPaginas)
  const dadosPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * itensPorPagina
    return dadosFiltrados.slice(inicio, inicio + itensPorPagina)
  }, [dadosFiltrados, paginaSegura, itensPorPagina])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleOrdenar = (coluna: string, direcao: DirecaoOrdenacao) => {
    setOrdenacao({ coluna, direcao })
    setPaginaAtual(1)
  }

  const handleBusca = (valor: string) => {
    setBusca(valor)
    setPaginaAtual(1)
  }

  const handleFiltro = (key: string, valor: unknown) => {
    setEstadoFiltros((prev) => ({ ...prev, [key]: valor }))
    setPaginaAtual(1)
  }

  const handleSelecionarLinha = (id: IdRegistro, selecionado: boolean) => {
    const novo = new Set(selecionados)
    if (selecionado) novo.add(id)
    else novo.delete(id)
    setarSelecionados(novo)
  }

  const handleSelecionarTodos = (selecionado: boolean) => {
    setarSelecionados(selecionado ? new Set(dadosFiltrados.map((d) => d.id)) : new Set())
  }

  const todosSelecionados =
    dadosFiltrados.length > 0 && dadosFiltrados.every((d) => selecionados.has(d.id))

  const handleExportar = (formato: FormatoExport) => {
    const fonte = exportConfig?.apenasSelecao
      ? dadosFiltrados.filter((d) => selecionados.has(d.id))
      : dadosFiltrados
    const nome = exportConfig?.nomeArquivo ?? 'dados'
    if (formato === 'csv')   exportarCSV(fonte, colunas, nome)
    else if (formato === 'txt')   exportarTXT(fonte, colunas, nome)
    else if (formato === 'xml')   exportarXML(fonte, colunas, nome)
    else if (formato === 'excel') exportarExcel(fonte, colunas, nome)
    else if (formato === 'json')  exportarJSON(fonte, nome)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const colunasVisiveis = colunas.filter((c) => !c.oculta)

  return (
    <div className="tg-container" role="region" aria-label="Tabela de dados">
      {/* Toolbar */}
      <div className="tg-toolbar">
        <div className="tg-toolbar-esquerda">
          {buscaGlobal && (
            <div className="tg-busca-wrapper" role="search">
              <span className="tg-busca-icone" aria-hidden="true">
                <MagnifyingGlass weight="bold" size={14} />
              </span>
              <input
                id={`${id}-busca`}
                className="tg-busca-input"
                type="search"
                placeholder={buscaPlaceholder}
                value={busca}
                onChange={(e) => handleBusca(e.target.value)}
                aria-label={buscaPlaceholder}
              />
            </div>
          )}
          {filtros && filtros.length > 0 && (
            <button
              className={`tg-btn tg-btn-filtros ${mostrarFiltros ? 'tg-btn-filtros--ativo' : ''}`}
              onClick={() => setMostrarFiltros((p) => !p)}
              aria-expanded={mostrarFiltros}
              aria-controls={`${id}-filtros`}
            >
              Filtros {mostrarFiltros ? '▲' : '▼'}
            </button>
          )}
        </div>

        <div className="tg-toolbar-direita">
          {selecionados.size > 0 && (
            <span className="tg-selecao-contador text-sm">
              {selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}
            </span>
          )}
          {exportConfig && (
            <div className="tg-export-wrapper" ref={exportMenuRef}>
              <button
                className="tg-btn tg-btn-export"
                onClick={() => setExportMenuAberto((p) => !p)}
                aria-label="Exportar dados"
                aria-haspopup="true"
                aria-expanded={exportMenuAberto}
              >
                <DownloadSimple weight="bold" size={14} />
                Exportar
              </button>
              {exportMenuAberto && (
                <div className="tg-export-menu" role="menu">
                  {([
                    { fmt: 'excel' as FormatoExport, label: 'Excel (.xls)',  icon: '📊' },
                    { fmt: 'csv'   as FormatoExport, label: 'CSV (.csv)',    icon: '📄' },
                    { fmt: 'txt'   as FormatoExport, label: 'TXT (.txt)',    icon: '📝' },
                    { fmt: 'xml'   as FormatoExport, label: 'XML (.xml)',    icon: '🗂️' },
                    { fmt: 'json'  as FormatoExport, label: 'JSON (.json)',  icon: '{ }' },
                  ]).map(({ fmt, label, icon }) => (
                    <button
                      key={fmt}
                      className="tg-export-menu-item"
                      role="menuitem"
                      onClick={() => {
                        handleExportar(fmt)
                        setExportMenuAberto(false)
                      }}
                    >
                      <span className="tg-export-menu-icon">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Painel de filtros */}
      {mostrarFiltros && filtros && filtros.length > 0 && (
        <div id={`${id}-filtros`} className="tg-filtros-painel">
          {filtros.map((filtro) => (
            <div key={filtro.key} className="input-group tg-filtro-campo">
              <label htmlFor={`${id}-filtro-${filtro.key}`}>{filtro.rotulo ?? filtro.key}</label>
              {filtro.tipo === 'select' ? (
                <select
                  id={`${id}-filtro-${filtro.key}`}
                  className="tg-filtro-select"
                  value={String(estadoFiltros[filtro.key] ?? '')}
                  onChange={(e) => handleFiltro(filtro.key, e.target.value)}
                >
                  <option value="">Todos</option>
                  {filtro.opcoes?.map((op) => (
                    <option key={String(op.valor)} value={String(op.valor)}>
                      {op.rotulo}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${id}-filtro-${filtro.key}`}
                  type={filtro.tipo === 'data' ? 'date' : 'text'}
                  className="tg-filtro-input"
                  value={String(estadoFiltros[filtro.key] ?? '')}
                  onChange={(e) => handleFiltro(filtro.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <button
            className="tg-filtros-limpar"
            onClick={() => {
              setEstadoFiltros({})
              setPaginaAtual(1)
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="tg-scroll-wrapper">
        <table className="tg-tabela" aria-busy={carregando}>
          <CabecalhoTabela
            colunas={colunas}
            ordenacao={ordenacao}
            aoOrdenar={handleOrdenar}
            selecao={selecao}
            todosSelecionados={todosSelecionados}
            aoSelecionarTodos={handleSelecionarTodos}
            temAcoesLinha={!!acoesLinha?.length}
          />
          <tbody className="tg-body">
            {carregando ? (
              Array.from({ length: itensPorPagina }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="tg-tr tg-tr--skeleton">
                  {selecao && <td className="tg-td"><div className="tg-skeleton" /></td>}
                  {colunasVisiveis.map((c) => (
                    <td key={c.key} className="tg-td">
                      <div className="tg-skeleton" />
                    </td>
                  ))}
                  {!!acoesLinha?.length && <td className="tg-td"><div className="tg-skeleton" /></td>}
                </tr>
              ))
            ) : dadosPagina.length === 0 ? (
              <tr>
                <td
                  colSpan={colunasVisiveis.length + (selecao ? 1 : 0) + (acoesLinha?.length ? 1 : 0)}
                  className="tg-td tg-vazio"
                >
                  {renderizarVazio ? renderizarVazio() : mensagemVazia}
                </td>
              </tr>
            ) : (
              dadosPagina.map((linha) => (
                <tr
                  key={linha.id}
                  className={`tg-tr ${selecionados.has(linha.id) ? 'tg-tr--selecionada' : ''} ${aoClicarLinha ? 'tg-tr--clicavel' : ''}`}
                  onClick={() => aoClicarLinha?.(linha)}
                >
                  {selecao && (
                    <td className="tg-td tg-td--checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="tg-checkbox"
                        checked={selecionados.has(linha.id)}
                        onChange={(e) => handleSelecionarLinha(linha.id, e.target.checked)}
                        aria-label={`Selecionar linha ${linha.id}`}
                      />
                    </td>
                  )}
                  {colunasVisiveis.map((coluna) => (
                    <Celula key={coluna.key} coluna={coluna} linha={linha} />
                  ))}
                  {acoesLinha && acoesLinha.length > 0 && (
                    <td className="tg-td tg-td--acoes" onClick={(e) => e.stopPropagation()}>
                      <div className="tg-acoes-grupo">
                        {acoesLinha
                          .filter((acao) => !acao.mostrar || acao.mostrar(linha))
                          .map((acao) => (
                            <button
                              key={acao.id}
                              className={`tg-acao-btn ${acao.variante === 'danger' ? 'tg-acao-btn--danger' : ''}`}
                              onClick={() => acao.ao_clicar(linha)}
                              title={acao.rotulo}
                              aria-label={acao.rotulo}
                            >
                              {acao.icone || acao.rotulo}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="tg-paginacao" aria-label="Paginação">
        <div className="tg-paginacao-info text-sm">
          {dadosFiltrados.length === 0
            ? 'Nenhum registro'
            : `${(paginaSegura - 1) * itensPorPagina + 1}–${Math.min(paginaSegura * itensPorPagina, dadosFiltrados.length)} de ${dadosFiltrados.length}`}
        </div>

        <div className="tg-paginacao-controles">
          <button
            className="tg-pag-btn"
            onClick={() => setPaginaAtual(1)}
            disabled={paginaSegura === 1}
            aria-label="Primeira página"
          >
            «
          </button>
          <button
            className="tg-pag-btn"
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaSegura === 1}
            aria-label="Página anterior"
          >
            ‹
          </button>

          <span className="tg-paginacao-pagina text-sm">
            {paginaSegura} / {totalPaginas}
          </span>

          <button
            className="tg-pag-btn"
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura === totalPaginas}
            aria-label="Próxima página"
          >
            ›
          </button>
          <button
            className="tg-pag-btn"
            onClick={() => setPaginaAtual(totalPaginas)}
            disabled={paginaSegura === totalPaginas}
            aria-label="Última página"
          >
            »
          </button>
        </div>

        <div className="tg-paginacao-tamanho">
          <label htmlFor={`${id}-itens-por-pagina`} className="text-sm">
            por página:
          </label>
          <select
            id={`${id}-itens-por-pagina`}
            className="tg-select-pagina"
            value={itensPorPagina}
            onChange={(e) => {
              setItensPorPagina(Number(e.target.value))
              setPaginaAtual(1)
            }}
          >
            {opcoesItensPorPagina.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

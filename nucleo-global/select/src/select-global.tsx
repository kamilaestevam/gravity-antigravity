/**
 * @nucleo/select — SelectGlobal
 * Select customizado — nunca usa <select> nativo.
 * Suporta single e multi select, busca interna, grupos e opções desabilitadas.
 * CSS Variables do design system Solid Slate.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
} from 'react'
import type { SelectProps, SelectOpcao } from './tipos.js'
import './select.css'

// ─── Chip (para multi-select) ─────────────────────────────────────────────────

function Chip({
  opcao,
  aoRemover,
  desabilitado,
}: {
  opcao: SelectOpcao
  aoRemover: () => void
  desabilitado?: boolean
}) {
  return (
    <span className="sg-chip">
      {opcao.rotulo}
      {!desabilitado && (
        <button
          className="sg-chip-remover"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            aoRemover()
          }}
          aria-label={`Remover ${opcao.rotulo}`}
        >
          ✕
        </button>
      )}
    </span>
  )
}

// ─── Item de opção ────────────────────────────────────────────────────────────

function ItemOpcao({
  opcao,
  selecionada,
  multiplo,
  aoSelecionar,
  renderizarOpcao,
}: {
  opcao: SelectOpcao
  selecionada: boolean
  multiplo: boolean
  aoSelecionar: (opcao: SelectOpcao) => void
  renderizarOpcao?: SelectProps['renderizarOpcao']
}) {
  return (
    <li
      className={`sg-opcao ${selecionada ? 'sg-opcao--selecionada' : ''} ${opcao.desabilitada ? 'sg-opcao--desabilitada' : ''}`}
      role="option"
      aria-selected={selecionada}
      aria-disabled={opcao.desabilitada}
      onClick={() => !opcao.desabilitada && aoSelecionar(opcao)}
    >
      {multiplo && (
        <span className="sg-check-box" aria-hidden="true">
          {selecionada ? '✓' : ''}
        </span>
      )}
      {renderizarOpcao ? (
        renderizarOpcao(opcao)
      ) : (
        <span className="sg-opcao-conteudo">
          <span className="sg-opcao-rotulo">{opcao.rotulo}</span>
          {opcao.descricao && (
            <span className="sg-opcao-descricao">{opcao.descricao}</span>
          )}
        </span>
      )}
      {!multiplo && selecionada && (
        <span className="sg-check-mark" aria-hidden="true">✓</span>
      )}
    </li>
  )
}

// ─── SelectGlobal ─────────────────────────────────────────────────────────────

export function SelectGlobal({
  opcoes = [],
  grupos = [],
  valor,
  valores = [],
  aoMudarValor,
  aoMudarValores,
  multiplo = false,
  buscavel = true,
  placeholder = 'Selecionar...',
  desabilitado = false,
  carregando = false,
  obrigatorio = false,
  erro,
  label,
  hint,
  renderizarOpcao,
  renderizarValorSelecionado,
  id: idExterno,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: SelectProps) {
  const idGerado = useId()
  const id = idExterno ?? idGerado
  const idLista = `${id}-lista`
  const idErro = `${id}-erro`
  const idHint = `${id}-hint`

  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  // ─── Fechar ao clicar fora ────────────────────────────────────────────────

  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  // ─── ESC fecha o dropdown ─────────────────────────────────────────────────

  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto])

  // ─── Foco na busca ao abrir ───────────────────────────────────────────────

  useEffect(() => {
    if (aberto && buscavel) {
      setTimeout(() => buscaRef.current?.focus(), 50)
    }
  }, [aberto, buscavel])

  // ─── Opções planas (flatten grupos) ──────────────────────────────────────

  const todasOpcoes: SelectOpcao[] = useMemo(() => {
    if (grupos.length > 0) {
      return grupos.flatMap((g) => g.opcoes)
    }
    return opcoes
  }, [opcoes, grupos])

  // ─── Filtro por busca ─────────────────────────────────────────────────────

  const opcoesFiltradas: SelectOpcao[] = useMemo(() => {
    if (!busca.trim()) return todasOpcoes
    const termo = busca.trim().toLowerCase()
    return todasOpcoes.filter(
      (op) =>
        op.rotulo.toLowerCase().includes(termo) ||
        op.descricao?.toLowerCase().includes(termo)
    )
  }, [todasOpcoes, busca])

  // ─── Opções filtradas por grupo ───────────────────────────────────────────

  const gruposFiltrados = useMemo(() => {
    if (grupos.length === 0) return []
    return grupos
      .map((g) => ({
        ...g,
        opcoes: g.opcoes.filter((op) => {
          if (!busca.trim()) return true
          const termo = busca.trim().toLowerCase()
          return op.rotulo.toLowerCase().includes(termo)
        }),
      }))
      .filter((g) => g.opcoes.length > 0)
  }, [grupos, busca])

  // ─── Estado de seleção ────────────────────────────────────────────────────

  const valoresSelecionados = useMemo((): (string | number)[] => {
    if (multiplo) return valores
    return valor != null ? [valor] : []
  }, [multiplo, valores, valor])

  const opcoesSelecionadas = useMemo(
    () => todasOpcoes.filter((op) => valoresSelecionados.includes(op.valor)),
    [todasOpcoes, valoresSelecionados]
  )

  const isSelecionada = useCallback(
    (op: SelectOpcao) => valoresSelecionados.includes(op.valor),
    [valoresSelecionados]
  )

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSelecionar = (opcao: SelectOpcao) => {
    if (multiplo) {
      const novo = isSelecionada(opcao)
        ? valoresSelecionados.filter((v) => v !== opcao.valor)
        : [...valoresSelecionados, opcao.valor]
      aoMudarValores?.(novo)
    } else {
      const novoValor = isSelecionada(opcao) ? null : opcao.valor
      aoMudarValor?.(novoValor)
      setAberto(false)
      setBusca('')
    }
  }

  const handleRemoverChip = (opcao: SelectOpcao) => {
    if (multiplo) {
      aoMudarValores?.(valoresSelecionados.filter((v) => v !== opcao.valor))
    }
  }

  const handleLimpar = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiplo) aoMudarValores?.([])
    else aoMudarValor?.(null)
  }

  const handleToggle = () => {
    if (desabilitado || carregando) return
    setAberto((p) => !p)
    if (aberto) setBusca('')
  }

  // ─── Renderização do gatilho ──────────────────────────────────────────────

  function renderizarGatilho() {
    if (carregando) {
      return <span className="sg-placeholder sg-loading">Carregando...</span>
    }

    if (opcoesSelecionadas.length === 0) {
      return <span className="sg-placeholder">{placeholder}</span>
    }

    if (renderizarValorSelecionado) {
      return renderizarValorSelecionado(multiplo ? opcoesSelecionadas : opcoesSelecionadas[0])
    }

    if (multiplo) {
      return (
        <div className="sg-chips">
          {opcoesSelecionadas.map((op) => (
            <Chip
              key={op.valor}
              opcao={op}
              aoRemover={() => handleRemoverChip(op)}
              desabilitado={desabilitado}
            />
          ))}
        </div>
      )
    }

    return <span className="sg-valor-selecionado">{opcoesSelecionadas[0].rotulo}</span>
  }

  // ─── Lista de opções ──────────────────────────────────────────────────────

  function renderizarLista() {
    const temGrupos = grupos.length > 0 && gruposFiltrados.length > 0
    const listaParaRenderizar = temGrupos ? [] : opcoesFiltradas

    if (temGrupos) {
      return gruposFiltrados.map((grupo) => (
        <li key={grupo.rotulo} className="sg-grupo" role="group" aria-label={grupo.rotulo}>
          <span className="sg-grupo-rotulo">{grupo.rotulo}</span>
          <ul className="sg-grupo-lista" role="presentation">
            {grupo.opcoes.map((op) => (
              <ItemOpcao
                key={op.valor}
                opcao={op}
                selecionada={isSelecionada(op)}
                multiplo={multiplo}
                aoSelecionar={handleSelecionar}
                renderizarOpcao={renderizarOpcao}
              />
            ))}
          </ul>
        </li>
      ))
    }

    if (listaParaRenderizar.length === 0) {
      return (
        <li className="sg-vazio">Nenhuma opção encontrada</li>
      )
    }

    return listaParaRenderizar.map((op) => (
      <ItemOpcao
        key={op.valor}
        opcao={op}
        selecionada={isSelecionada(op)}
        multiplo={multiplo}
        aoSelecionar={handleSelecionar}
        renderizarOpcao={renderizarOpcao}
      />
    ))
  }

  // ─── Aria describedby composto ────────────────────────────────────────────

  const describedby = [
    ariaDescribedby,
    erro ? idErro : undefined,
    hint ? idHint : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`sg-wrapper input-group ${erro ? 'sg-wrapper--erro' : ''}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="sg-label">
          {label}
          {obrigatorio && <span className="sg-obrigatorio" aria-hidden="true"> *</span>}
        </label>
      )}

      {/* Campo gatilho */}
      <div
        id={id}
        className={`sg-campo ${aberto ? 'sg-campo--aberto' : ''} ${desabilitado ? 'sg-campo--desabilitado' : ''} ${carregando ? 'sg-campo--carregando' : ''}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-label={ariaLabel ?? label}
        aria-describedby={describedby || undefined}
        aria-required={obrigatorio}
        aria-disabled={desabilitado}
        tabIndex={desabilitado ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
      >
        <div className="sg-valor">{renderizarGatilho()}</div>

        <div className="sg-acoes">
          {/* Limpar */}
          {opcoesSelecionadas.length > 0 && !desabilitado && !carregando && (
            <button
              type="button"
              className="sg-btn-limpar"
              onClick={handleLimpar}
              aria-label="Limpar seleção"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
          {/* Chevron */}
          <span
            className={`sg-chevron ${aberto ? 'sg-chevron--aberto' : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {aberto && (
        <div className="sg-dropdown">
          {buscavel && (
            <div className="sg-busca-wrapper">
              <input
                ref={buscaRef}
                className="sg-busca-input"
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Buscar opções"
                autoComplete="off"
              />
            </div>
          )}

          <ul
            id={idLista}
            className="sg-lista"
            role="listbox"
            aria-multiselectable={multiplo}
            aria-label={ariaLabel ?? label ?? 'Opções'}
          >
            {renderizarLista()}
          </ul>
        </div>
      )}

      {/* Hint */}
      {hint && !erro && (
        <span id={idHint} className="sg-hint text-sm">
          {hint}
        </span>
      )}

      {/* Erro */}
      {erro && (
        <span id={idErro} className="sg-erro text-sm" role="alert">
          {erro}
        </span>
      )}

      {/* Input hidden para forms nativos */}
      {name && (
        <>
          {multiplo
            ? valoresSelecionados.map((v) => (
                <input key={v} type="hidden" name={name} value={String(v)} />
              ))
            : valor != null && (
                <input type="hidden" name={name} value={String(valor)} />
              )}
        </>
      )}
    </div>
  )
}

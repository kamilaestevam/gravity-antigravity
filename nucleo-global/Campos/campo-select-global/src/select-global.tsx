/**
 * @nucleo/select — SelectGlobal
 * Select customizado — nunca usa <select> nativo.
 * Suporta single e multi select, busca interna, grupos e opções desabilitadas.
 * CSS Variables do design system Solid Slate.
 *
 * Dropdown renderizado via ReactDOM.createPortal (position: fixed) para
 * escapar de qualquer stacking context criado pelos containers pai.
 *
 * Usa <GeralCampoGlobal> como wrapper unificado (label, hint, erro).
 */

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
} from 'react'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import type { SelectProps, SelectOpcao } from './tipos.js'
import './select.css'

// ─── Posição do dropdown (fixed) ──────────────────────────────────────────────

type DropdownPos = { top: number; left: number; width: number; above: boolean; maxHeight?: number }

function calcPos(trigger: HTMLElement): DropdownPos {
  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const above = spaceBelow < 260 && spaceAbove > spaceBelow
  return {
    top: above ? rect.top : rect.bottom + 4,
    left: rect.left,
    width: rect.width,
    above,
    maxHeight: above ? Math.min(260, spaceAbove - 16) : Math.min(260, spaceBelow - 16)
  }
}

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
  const { t } = useTranslation()
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
          aria-label={t('campo.remover', { label: opcao.rotulo })}
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
  iconeEsquerda,
  renderizarOpcao,
  renderizarValorSelecionado,
  id: idExterno,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: SelectProps) {
  const { t } = useTranslation()
  const idGerado = useId()
  const id = idExterno ?? idGerado
  const idLista = `${id}-lista`

  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [pos, setPos] = useState<DropdownPos | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLDivElement>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  // ─── Calcular posição do dropdown ─────────────────────────────────────────

  useEffect(() => {
    if (!aberto || !campoRef.current) return
    setPos(calcPos(campoRef.current))

    // Recalcular se a janela rolar ou redimensionar enquanto aberto
    const update = () => {
      if (campoRef.current) setPos(calcPos(campoRef.current))
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [aberto])

  // ─── Fechar ao clicar fora ────────────────────────────────────────────────

  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        // também verifica se o clique não foi dentro do portal do dropdown
        const ddEl = document.getElementById(`${idLista}-portal`)
        if (ddEl && ddEl.contains(e.target as Node)) return
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto, idLista])

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
    // Remove opções com valor vazio (ex: { valor: '', rotulo: 'Selecione...' })
    // O placeholder prop já cobre esse caso visual
    const semVazias = todasOpcoes.filter(
      (op) => op.valor !== '' && op.valor != null
    )
    if (!busca.trim()) return semVazias
    const termo = busca.trim().toLowerCase()
    return semVazias.filter(
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
      return <span className="sg-placeholder sg-loading">{t('campo.carregando')}</span>
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
        <li className="sg-vazio">{t('campo.nenhuma_opcao')}</li>
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
  ]
    .filter(Boolean)
    .join(' ')

  // ─── Dropdown via Portal (position: fixed) ────────────────────────────────

  const dropdown = aberto && pos && ReactDOM.createPortal(
    <div
      id={`${idLista}-portal`}
      className={`sg-dropdown sg-dropdown--portal ${pos.above ? 'sg-dropdown--acima' : ''}`}
      style={{
        position: 'fixed',
        top: pos.above ? undefined : pos.top,
        bottom: pos.above ? window.innerHeight - pos.top : undefined,
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight ? `${pos.maxHeight}px` : undefined,
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {buscavel && (
        <div className="sg-busca-wrapper">
          <span className="sg-busca-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
          </span>
          <input
            ref={buscaRef}
            className="sg-busca-input"
            type="text"
            placeholder={t('campo.buscar_placeholder')}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label={t('campo.buscar_opcoes')}
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
    </div>,
    document.body
  )

  // ─── Conteúdo interno (campo gatilho + dropdown + hidden inputs) ──────────

  const conteudoInterno = (
    <div ref={containerRef} className="sg-wrapper-inner">
      {/* Campo gatilho */}
      <div
        id={id}
        ref={campoRef}
        className={`sg-campo ${aberto ? 'sg-campo--aberto' : ''} ${desabilitado ? 'sg-campo--desabilitado' : ''} ${carregando ? 'sg-campo--carregando' : ''} ${iconeEsquerda ? 'sg-campo--com-icone' : ''}`}
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
        {iconeEsquerda && (
          <span className="sg-icone-esquerda" aria-hidden="true">
            {iconeEsquerda}
          </span>
        )}
        <div className="sg-valor">{renderizarGatilho()}</div>

        <div className="sg-acoes">
          {/* Limpar */}
          {opcoesSelecionadas.length > 0 && !desabilitado && !carregando && (
            <button
              type="button"
              className="sg-btn-limpar"
              onClick={handleLimpar}
              aria-label={t('campo.limpar_selecao')}
              tabIndex={-1}
            >
              ✕
            </button>
          )}
          {/* Chevron — SVG inline */}
          <span
            className={`sg-chevron ${aberto ? 'sg-chevron--aberto' : ''}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {/* Dropdown via portal */}
      {dropdown}

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

  // ─── Se tem label/hint/erro, renderiza com GeralCampoGlobal ───────────────
  // Se não tem, renderiza só o campo (ex: select inline dentro de calendário)

  if (label || hint || erro) {
    return (
      <GeralCampoGlobal
        label={label}
        obrigatorio={obrigatorio}
        erro={erro}
        hint={hint}
      >
        {conteudoInterno}
      </GeralCampoGlobal>
    )
  }

  return conteudoInterno
}

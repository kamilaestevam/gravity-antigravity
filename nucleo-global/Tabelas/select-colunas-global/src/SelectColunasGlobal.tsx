import React, { useRef, useEffect, useState, useMemo, memo } from 'react'
import './select-colunas.css'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ColunaSelectConfig {
  key: string
  label: string
  /** Se true: não pode ser ocultada nem reordenada — exibe cadeado */
  naoOcultavel?: boolean
  /** Grupo de agrupamento — colunas com o mesmo grupo são agrupadas sob um cabeçalho colapsável */
  grupo?: string
}

export interface SelectColunasGlobalProps {
  /** Todas as colunas disponíveis */
  colunas: ColunaSelectConfig[]
  /** Keys das colunas atualmente visíveis */
  colunasVisiveis: string[]
  /** Chamado ao marcar/desmarcar uma coluna */
  onToggle: (key: string) => void
  /** Chamado ao clicar "Selecionar tudo" */
  onSelecionarTodos?: () => void
  /** Chamado ao clicar "Restaurar padrão" */
  onRestaurarPadrao?: () => void
  /** Chamado ao fechar o popover */
  onFechar: () => void
  /** Chamado ao arrastar uma coluna para reordenar */
  onReordenar?: (fromKey: string, toKey: string) => void
  /** Ref do botão que abre o popover (usado para fechar ao clicar fora) */
  triggerRef?: React.RefObject<HTMLElement | null>
  /** Posicionamento CSS inline do popover */
  posicao?: React.CSSProperties
}

// ── Ícones inline (sem dependência de lib de ícones) ─────────────────────────

function IcoLupa() {
  return (
    <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className="scg-busca-icone">
      <path d="M229.66,218.34l-50.07-50.07a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
    </svg>
  )
}

function IcoX() {
  return (
    <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
    </svg>
  )
}

function IcoCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192Z"/>
    </svg>
  )
}

function IcoRestore() {
  return (
    <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H168a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8Z"/>
    </svg>
  )
}

function IcoCadeado() {
  return (
    <svg width="10" height="12" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className="scg-lock">
      <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-32a16,16,0,1,0-16-16A16,16,0,0,0,128,176Z"/>
    </svg>
  )
}

function IcoDrag() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true" className="scg-drag-handle">
      <circle cx="3" cy="3"  r="1.2" fill="currentColor"/>
      <circle cx="7" cy="3"  r="1.2" fill="currentColor"/>
      <circle cx="3" cy="7"  r="1.2" fill="currentColor"/>
      <circle cx="7" cy="7"  r="1.2" fill="currentColor"/>
      <circle cx="3" cy="11" r="1.2" fill="currentColor"/>
      <circle cx="7" cy="11" r="1.2" fill="currentColor"/>
    </svg>
  )
}

interface IcoChevronProps {
  expandido: boolean
}

function IcoChevron({ expandido }: IcoChevronProps) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
      className={`scg-grupo-chevron${expandido ? ' scg-grupo-chevron--expandido' : ''}`}
    >
      <path d="M96.59,209.66l96-96a8,8,0,0,0,0-11.32l-96-96a8,8,0,0,0-11.32,11.32L175.31,128,85.25,218.34a8,8,0,1,0,11.34,11.32Z"/>
    </svg>
  )
}

// ── Tipos internos ────────────────────────────────────────────────────────────

interface GrupoInterno {
  nome: string
  colunas: ColunaSelectConfig[]
}

const GRUPO_GERAL = 'Geral'

// ── Componente ────────────────────────────────────────────────────────────────

export const SelectColunasGlobal = memo(function SelectColunasGlobal({
  colunas,
  colunasVisiveis,
  onToggle,
  onSelecionarTodos,
  onRestaurarPadrao,
  onFechar,
  onReordenar,
  triggerRef,
  posicao,
}: SelectColunasGlobalProps) {
  const ref        = useRef<HTMLDivElement>(null)
  const dragKeyRef = useRef<string | null>(null)
  const dragGrupoRef = useRef<string | null>(null)
  const [busca, setBusca] = useState('')
  const [gruposColapsados, setGruposColapsados] = useState<Set<string>>(() => {
    const nomes = new Set<string>()
    for (const col of colunas) {
      nomes.add(col.grupo ?? GRUPO_GERAL)
    }
    return nomes
  })

  // Fechar ao clicar fora
  useEffect(() => {
    function handleFora(e: MouseEvent) {
      const target = e.target as Node
      const dentroPopover  = ref.current?.contains(target)
      const dentroTrigger  = triggerRef?.current?.contains(target)
      if (!dentroPopover && !dentroTrigger) onFechar()
    }
    document.addEventListener('mousedown', handleFora)
    return () => document.removeEventListener('mousedown', handleFora)
  }, [onFechar, triggerRef])

  // Fechar com Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onFechar])

  // Verifica se alguma coluna tem grupo definido
  const temGrupos = useMemo(() => colunas.some(c => c.grupo !== undefined), [colunas])

  // Lista plana filtrada — usada quando há busca ativa
  const colunasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) {
      return [
        ...colunas.filter(c =>  c.naoOcultavel),
        ...colunas.filter(c => !c.naoOcultavel),
      ]
    }
    const filtradas = colunas.filter(c => c.label.toLowerCase().includes(termo))
    const sorted = [...filtradas].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
    return [
      ...sorted.filter(c =>  c.naoOcultavel),
      ...sorted.filter(c => !c.naoOcultavel),
    ]
  }, [colunas, busca])

  // Grupos — usado quando não há busca ativa e há colunas com grupo
  const grupos = useMemo<GrupoInterno[]>(() => {
    if (!temGrupos) return []

    const mapa = new Map<string, ColunaSelectConfig[]>()

    // Preserva a ordem de aparição dos grupos conforme a ordem das colunas
    for (const col of colunas) {
      const nome = col.grupo ?? GRUPO_GERAL
      if (!mapa.has(nome)) mapa.set(nome, [])
      mapa.get(nome)!.push(col)
    }

    return Array.from(mapa.entries()).map(([nome, cols]) => ({
      nome,
      colunas: [
        ...cols.filter(c =>  c.naoOcultavel),
        ...cols.filter(c => !c.naoOcultavel),
      ],
    }))
  }, [colunas, temGrupos])

  function toggleGrupo(nome: string) {
    setGruposColapsados(prev => {
      const next = new Set(prev)
      if (next.has(nome)) {
        next.delete(nome)
      } else {
        next.add(nome)
      }
      return next
    })
  }

  // ── Renderização de um item de coluna ──────────────────────────────────────

  function renderItem(col: ColunaSelectConfig, idx: number, lista: ColunaSelectConfig[], grupoNome?: string) {
    const prevObrigatorio = idx > 0 && lista[idx - 1].naoOcultavel
    const visivel = colunasVisiveis.includes(col.key)

    return (
      <React.Fragment key={col.key}>
        {/* Divisor entre obrigatórias e opcionais (apenas na lista plana sem grupos) */}
        {!grupoNome && !col.naoOcultavel && prevObrigatorio && (
          <div className="scg-divisor" />
        )}
        <label
          className={`scg-item${col.naoOcultavel ? ' scg-item--locked' : ''}`}
          draggable={!!onReordenar && !col.naoOcultavel}
          onDragStart={() => {
            dragKeyRef.current = col.key
            dragGrupoRef.current = grupoNome ?? null
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => {
            const fromKey   = dragKeyRef.current
            const fromGrupo = dragGrupoRef.current
            // Só permite drop dentro do mesmo grupo (ou ambos sem grupo)
            if (fromKey && fromKey !== col.key && fromGrupo === (grupoNome ?? null)) {
              onReordenar?.(fromKey, col.key)
            }
            dragKeyRef.current   = null
            dragGrupoRef.current = null
          }}
        >
          {/* Cadeado ou handle de drag */}
          {onReordenar && (
            col.naoOcultavel ? <IcoCadeado /> : <IcoDrag />
          )}

          <input
            type="checkbox"
            className="scg-checkbox"
            checked={visivel}
            disabled={col.naoOcultavel}
            onChange={() => !col.naoOcultavel && onToggle(col.key)}
            aria-label={col.label}
          />
          <span className="scg-label">{col.label}</span>
        </label>
      </React.Fragment>
    )
  }

  // ── Renderização de um grupo colapsável ────────────────────────────────────

  function renderGrupo(grupo: GrupoInterno) {
    const expandido  = !gruposColapsados.has(grupo.nome)
    const totalGrupo = grupo.colunas.length
    const visivelGrupo = grupo.colunas.filter(c => colunasVisiveis.includes(c.key)).length

    return (
      <div key={grupo.nome} className="scg-grupo">
        <button
          type="button"
          className="scg-grupo-header"
          onClick={() => toggleGrupo(grupo.nome)}
          aria-expanded={expandido}
          aria-label={`${grupo.nome} — ${expandido ? 'recolher' : 'expandir'} grupo`}
        >
          <IcoChevron expandido={expandido} />
          <span className="scg-grupo-nome">{grupo.nome}</span>
          <span className="scg-grupo-badge">{visivelGrupo}&nbsp;/&nbsp;{totalGrupo}</span>
        </button>

        {expandido && (
          <div className="scg-grupo-itens">
            {grupo.colunas.map((col, idx) => renderItem(col, idx, grupo.colunas, grupo.nome))}
          </div>
        )}
      </div>
    )
  }

  const estaFiltrando = busca.trim() !== ''
  const usarGrupos    = temGrupos && !estaFiltrando

  return (
    <div
      ref={ref}
      className="scg-popover"
      style={posicao}
      role="dialog"
      aria-label="Seletor de colunas visíveis"
      onClick={e => e.stopPropagation()}
    >
      {/* ── Busca ── */}
      <div className="scg-busca">
        <IcoLupa />
        <input
          type="text"
          className="scg-busca-input"
          placeholder="Buscar coluna..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          autoFocus
          aria-label="Buscar coluna"
        />
        {busca && (
          <button
            type="button"
            className="scg-busca-clear"
            onClick={() => setBusca('')}
            aria-label="Limpar busca"
          >
            <IcoX />
          </button>
        )}
      </div>

      {/* ── Ações em lote ── */}
      <div className="scg-acoes">
        <button type="button" className="scg-acao-btn" onClick={onSelecionarTodos}>
          <IcoCheck /> Selecionar tudo
        </button>
        <button type="button" className="scg-acao-btn scg-acao-btn--reset" onClick={onRestaurarPadrao}>
          <IcoRestore /> Restaurar padrão
        </button>
      </div>

      {/* ── Lista ── */}
      <div className="scg-lista">
        {usarGrupos ? (
          grupos.length === 0 ? (
            <div className="scg-vazio">Nenhuma coluna encontrada</div>
          ) : (
            grupos.map(grupo => renderGrupo(grupo))
          )
        ) : (
          colunasFiltradas.length === 0 ? (
            <div className="scg-vazio">Nenhuma coluna encontrada</div>
          ) : (
            colunasFiltradas.map((col, idx) => renderItem(col, idx, colunasFiltradas))
          )
        )}
      </div>
    </div>
  )
})

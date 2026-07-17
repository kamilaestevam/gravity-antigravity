import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlass, XCircle } from '@phosphor-icons/react'
import { useLocation } from 'react-router-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface LocalizarExpandidoCampoGlobalProps {
  onBuscarNavigate?: (termo: string) => void
  placeholder?: string
  value?: string
  onChange?: (termo: string) => void
  disableGlobalDOMFilter?: boolean
  alwaysExpanded?: boolean
  className?: string
  style?: React.CSSProperties
}

/** Blocos filtráveis na tela atual (listas, cards, Guia Academy…). */
const SELETORES_BUSCA_TELA = [
  'tbody tr',
  '.ws-stat-card',
  '.ws-mini-dash',
  '.cg-card',
  '.ws-card',
  '.em-card',
  'fieldset',
  '.form-group',
  '.em-field',
  '.em-list-item',
  '.uni-player-aula__bloco',
  '.uni-player-aula__nav-item',
  '.uni-academy-card',
  '.uni-dashboard-card',
  '[data-searchable="true"]',
].join(', ')

const SELETORES_ZONA_IGNORADA = [
  '.ws-sidebar',
  '.ws-global-actions',
  '.uni-player-aula__rodape-nav',
].join(', ')

function nodeEmZonaIgnorada(node: Node): boolean {
  const el = node instanceof Element ? node : node.parentElement
  if (!el) return true
  return Boolean(el.closest(SELETORES_ZONA_IGNORADA))
}

function limparMarcacoesTexto(): void {
  document.querySelectorAll('mark.ws-search-mark').forEach(mark => {
    const parent = mark.parentNode
    if (!parent) return
    parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark)
    parent.normalize()
  })
}

function marcarOcorrenciasTexto(termo: string): void {
  limparMarcacoesTexto()
  const termoNormalizado = termo.trim()
  if (!termoNormalizado) return

  const raiz = document.querySelector('.ws-main')
  if (!raiz) return

  const termoLower = termoNormalizado.toLowerCase()
  const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT)
  const candidatos: Text[] = []

  let atual: Node | null
  while ((atual = walker.nextNode())) {
    if (nodeEmZonaIgnorada(atual)) continue
    const parentEl = atual.parentElement
    if (!parentEl) continue
    if (parentEl.closest('.ws-search-hidden, input, textarea, select, button, mark.ws-search-mark')) continue
    const texto = atual.textContent ?? ''
    if (!texto.trim()) continue
    if (texto.toLowerCase().includes(termoLower)) candidatos.push(atual as Text)
  }

  for (const textNode of candidatos) {
    const texto = textNode.textContent ?? ''
    const lower = texto.toLowerCase()
    const fragmentos: Array<Text | HTMLElement> = []
    let inicio = 0

    while (inicio < texto.length) {
      const idx = lower.indexOf(termoLower, inicio)
      if (idx === -1) {
        fragmentos.push(document.createTextNode(texto.slice(inicio)))
        break
      }
      if (idx > inicio) fragmentos.push(document.createTextNode(texto.slice(inicio, idx)))
      const mark = document.createElement('mark')
      mark.className = 'ws-search-mark'
      mark.textContent = texto.slice(idx, idx + termoNormalizado.length)
      fragmentos.push(mark)
      inicio = idx + termoNormalizado.length
    }

    if (fragmentos.length <= 1) continue
    const parent = textNode.parentNode
    if (!parent) continue
    fragmentos.forEach(fragmento => parent.insertBefore(fragmento, textNode))
    parent.removeChild(textNode)
  }
}

function limparFiltroTela(): void {
  document.querySelectorAll(SELETORES_BUSCA_TELA).forEach(node => {
    node.classList.remove('ws-search-hidden', 'ws-search-match')
  })
  limparMarcacoesTexto()
}

function aplicarFiltroTela(termo: string): void {
  const searchables = document.querySelectorAll(SELETORES_BUSCA_TELA)
  if (!termo.trim()) {
    limparFiltroTela()
    return
  }

  const term = termo.toLowerCase()
  searchables.forEach(node => {
    if (node.closest(SELETORES_ZONA_IGNORADA)) return

    const text = node.textContent?.toLowerCase() ?? ''
    if (text.includes(term)) {
      node.classList.remove('ws-search-hidden')
      node.classList.add('ws-search-match')
    } else {
      node.classList.add('ws-search-hidden')
      node.classList.remove('ws-search-match')
    }
  })

  marcarOcorrenciasTexto(termo)
}

export function CampoLocalizarExpandidoGlobal({
  onBuscarNavigate,
  placeholder,
  value,
  onChange,
  disableGlobalDOMFilter = false,
  alwaysExpanded = false,
  className = '',
  style
}: LocalizarExpandidoCampoGlobalProps) {
  const { t } = useTranslation()
  const defaultPlaceholder = placeholder ?? t('campo.localizar_sistema')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const location = useLocation()
  const searchTerm = value !== undefined ? value : internalSearchTerm

  const limparBuscaVisual = useCallback(() => {
    if (!disableGlobalDOMFilter) limparFiltroTela()
  }, [disableGlobalDOMFilter])

  // Limpa a busca nativa ao trocar de página
  useEffect(() => {
    if (value === undefined) setInternalSearchTerm('')
    setIsSearchExpanded(false)
    limparBuscaVisual()
  }, [location.pathname, value, limparBuscaVisual])

  // Filtra blocos visíveis e marca ocorrências de texto na tela
  useEffect(() => {
    if (disableGlobalDOMFilter) return undefined
    aplicarFiltroTela(searchTerm)
    return () => limparFiltroTela()
  }, [searchTerm, disableGlobalDOMFilter])

  const handleSearchClick = () => {
    setIsSearchExpanded(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  const handleSearchBlur = () => {
    if (!searchTerm) {
      setIsSearchExpanded(false)
    }
  }

  const handleSearchChange = (val: string) => {
    if (value === undefined) setInternalSearchTerm(val)
    if (onChange) onChange(val)
  }

  return (
    <div className={`ws-global-search ${isSearchExpanded || alwaysExpanded ? 'expanded' : ''} ${className}`} style={style}>
      <TooltipGlobal titulo={t('campo.localizar_tela')} descricao={t('campo.localizar_tela_desc')}>
        <button className="ws-global-btn" onClick={handleSearchClick} type="button">
          <MagnifyingGlass weight="bold" size={18} />
        </button>
      </TooltipGlobal>
      <input
        ref={searchInputRef}
        type="text"
        className="ws-global-search__input"
        placeholder={defaultPlaceholder}
        value={searchTerm}
        onChange={e => handleSearchChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            handleSearchChange('')
            setIsSearchExpanded(false)
          } else if (e.key === 'Enter' && searchTerm.trim()) {
            if (onBuscarNavigate) {
              onBuscarNavigate(searchTerm.trim())
            } else {
              // Reseta apenas no enter global (se for controlado, deixa a cargo do pai)
              if (value === undefined) handleSearchChange('')
              setIsSearchExpanded(false)
            }
          }
        }}
        onBlur={handleSearchBlur}
      />
      {isSearchExpanded && !searchTerm && <kbd className="ws-global-cmd">⌘K</kbd>}
      {isSearchExpanded && searchTerm && (
        <button
          type="button"
          className="ws-global-clear"
          onMouseDown={e => {
            // Previne o blur antes do clique ser processado
            e.preventDefault()
            handleSearchChange('')
            setIsSearchExpanded(false)
          }}
        >
          <XCircle weight="fill" size={18} />
        </button>
      )}
    </div>
  )
}

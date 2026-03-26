import React, { useEffect, useState, useRef } from 'react'
import { MagnifyingGlass, XCircle } from '@phosphor-icons/react'
import { useLocation } from 'react-router-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface LocalizarCampoGlobalProps {
  onBuscarNavigate?: (termo: string) => void
  placeholder?: string
  value?: string
  onChange?: (termo: string) => void
  disableGlobalDOMFilter?: boolean
  alwaysExpanded?: boolean
  className?: string
  style?: React.CSSProperties
}

export function LocalizarCampoGlobal({
  onBuscarNavigate,
  placeholder = 'Localizar no sistema...',
  value,
  onChange,
  disableGlobalDOMFilter = false,
  alwaysExpanded = false,
  className = '',
  style
}: LocalizarCampoGlobalProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const location = useLocation()
  const searchTerm = value !== undefined ? value : internalSearchTerm

  // Limpa a busca nativa ao trocar de página
  useEffect(() => {
    if (value === undefined) setInternalSearchTerm('')
    setIsSearchExpanded(false)
  }, [location.pathname])

  // Handle frontend search filtering ("buscar tudo")
  useEffect(() => {
    if (disableGlobalDOMFilter) return;

    // Busca ampla: qualquer card, linha, formulário ou item listado na interface
    const searchables = document.querySelectorAll(
      'tbody tr, .ws-stat-card, .ws-mini-dash, .cg-card, .ws-card, .em-card, fieldset, .form-group, .em-field, .em-list-item, li, [data-searchable="true"]'
    )
    if (!searchTerm) {
      searchables.forEach(node => node.classList.remove('ws-search-hidden'))
      return
    }
    const term = searchTerm.toLowerCase()
    searchables.forEach(node => {
      // Impede de ocultar a si mesmo ou a navegação global
      if (node.closest('.ws-sidebar') || node.closest('.ws-global-actions')) return

      const text = node.textContent?.toLowerCase() || ''
      if (text.includes(term)) {
        node.classList.remove('ws-search-hidden')
      } else {
        node.classList.add('ws-search-hidden')
      }
    })
  }, [searchTerm])

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
      <TooltipGlobal titulo="Localizar na Tela" descricao="Filtre rapidamente dados e registros visíveis na página atual">
        <button className="ws-global-btn" onClick={handleSearchClick} type="button">
          <MagnifyingGlass weight="bold" size={18} />
        </button>
      </TooltipGlobal>
      <input
        ref={searchInputRef}
        type="text"
        className="ws-global-search__input"
        placeholder={placeholder}
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

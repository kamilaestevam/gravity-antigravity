import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlass, Info, Cube, Hexagon, X } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { UsuarioGlobal, type UsuarioGlobalProps } from '@nucleo/usuario-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import {
  LocalizadorGlobal,
  type LocalizadorEntry,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import './menu-topo-global.css'

// ── Agrupamentos de props ─────────────────────────────────────────────────────

export interface MenuTopoLocalizadorConfig {
  workspaceName: string
  currentProductId: string
  currentProductLabel: string
  currentProductColor: string
  currentPageLabel: string
  history: LocalizadorEntry[]
  nodes: EcosystemNode[]
  onNavigate: (node: EcosystemNode) => void
}

export type MenuTopoUsuarioConfig = Omit<UsuarioGlobalProps, 'isAdminPanel' | 'onNavigateConfigurador' | 'compact'>

export interface MenuTopoGlobalProps {
  /** Nome do produto/módulo exibido no chip esquerdo */
  productName: string
  /** Cor de destaque do produto */
  productColor?: string
  /** Ícone React do produto — vem do registry @nucleo/logo-produtos */
  productIcon?: React.ReactElement
  /** Estado do toggle de dicas */
  tooltipsDisabled: boolean
  onToggleTooltips: () => void
  /** Props para o LocalizadorGlobal */
  localizador: MenuTopoLocalizadorConfig
  /** Props para o UsuarioGlobal */
  usuario: MenuTopoUsuarioConfig
  /** Navegar para o Hub — omitir ou passar false oculta o botão (ex: na tela Hub) */
  onNavigateHub?: () => void
  /** Navegar para o Core — omitir ou passar false oculta o botão (ex: na tela Core) */
  onNavigateCore?: () => void
}

// ── Componente ───────────────────────────────────────────────────────────────

export function MenuTopoGlobal({
  productName,
  productColor = '#818cf8',
  productIcon,
  tooltipsDisabled,
  onToggleTooltips,
  localizador,
  usuario,
  onNavigateHub,
  onNavigateCore,
}: MenuTopoGlobalProps) {
  const { t } = useTranslation()

  // ── Busca funcional ───────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 30)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
    window.dispatchEvent(new CustomEvent('shell:search', { detail: { query: '' } }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    window.dispatchEvent(new CustomEvent('shell:search', { detail: { query } }))
  }

  // Fecha com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && searchOpen) closeSearch() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  const cssVars = {
    '--mtg-accent':        productColor,
    '--mtg-accent-dim':    `${productColor}18`,
    '--mtg-accent-border': `${productColor}33`,
  } as React.CSSProperties

  return (
    <header className="mtg-header" style={cssVars} role="banner">

      {/* ── ESQUERDA: logo + chip do produto ── */}
      <div className="mtg-left">
        <LogoGlobal iconSize={20} iconColor={productColor} iconOnly />
        <div className="mtg-divider" />
        <div
          className="mtg-product-chip"
          style={{
            background:   `linear-gradient(135deg, ${productColor}18 0%, ${productColor}08 100%)`,
            borderColor:  `${productColor}35`,
          }}
        >
          {productIcon ? (
            <span className="mtg-product-chip__icon" style={{ color: productColor }}>
              {productIcon}
            </span>
          ) : (
            <span
              className="mtg-product-chip__dot"
              style={{ backgroundColor: productColor, boxShadow: `0 0 6px ${productColor}99` }}
            />
          )}
          <span className="mtg-product-chip__name" style={{ color: productColor }}>
            {productName}
          </span>
        </div>
      </div>

      {/* ── DIREITA: ações + usuário ── */}
      <div className="mtg-right">

        {/* Busca funcional — expande para input ao clicar */}
        {searchOpen ? (
          <div className="mtg-search-bar">
            <MagnifyingGlass size={15} className="mtg-search-bar__icon" />
            <input
              ref={searchInputRef}
              className="mtg-search-bar__input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('shell.buscar_na_tela', 'Buscar na tela…')}
              aria-label={t('shell.buscar_na_tela', 'Buscar na tela')}
            />
            <button
              className="mtg-search-bar__clear"
              type="button"
              onClick={closeSearch}
              aria-label={t('comum.fechar', 'Fechar')}
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        ) : (
          <button
            className="mtg-icon-btn"
            type="button"
            aria-label={t('shell.busca_global', 'Buscar na tela')}
            title={t('shell.busca_global', 'Buscar na tela')}
            onClick={openSearch}
          >
            <MagnifyingGlass size={17} />
          </button>
        )}

        {/* Toggle de dicas */}
        <button
          className="mtg-icon-btn"
          type="button"
          aria-label={tooltipsDisabled ? t('shell.habilitar_dicas', 'Habilitar dicas') : t('shell.desabilitar_dicas', 'Desabilitar dicas')}
          title={tooltipsDisabled ? t('shell.label_habilitar_dicas', 'Habilitar dicas') : t('shell.label_desabilitar_dicas', 'Desabilitar dicas')}
          onClick={onToggleTooltips}
          style={{ color: tooltipsDisabled ? 'var(--text-muted)' : productColor }}
        >
          <Info size={17} weight={tooltipsDisabled ? 'regular' : 'fill'} />
        </button>

        {/* Seletor de idioma */}
        <LanguageSwitcherGlobal iconOnly />

        {/* Localizador — onde estou */}
        <LocalizadorGlobal
          workspaceName={localizador.workspaceName}
          currentProductId={localizador.currentProductId}
          currentProductLabel={localizador.currentProductLabel}
          currentProductColor={localizador.currentProductColor}
          currentPageLabel={localizador.currentPageLabel}
          history={localizador.history}
          nodes={localizador.nodes}
          onNavigate={localizador.onNavigate}
          iconOnly
        />

        <div className="mtg-sep" />

        {/* Atalho Hub — oculto quando onNavigateHub não fornecido (ex: tela Hub) */}
        {onNavigateHub && (
          <button
            className="mtg-nav-btn"
            type="button"
            title={t('shell.voltar_hub', 'Voltar ao Hub')}
            onClick={onNavigateHub}
            style={{
              '--mtg-btn-color':        '#818cf8',
              '--mtg-btn-bg':           'rgba(129,140,248,0.08)',
              '--mtg-btn-border':       'rgba(129,140,248,0.22)',
              '--mtg-btn-bg-hover':     'rgba(129,140,248,0.16)',
              '--mtg-btn-border-hover': 'rgba(129,140,248,0.4)',
            } as React.CSSProperties}
          >
            <Hexagon size={13} weight="duotone" />
            Hub
          </button>
        )}

        {/* Atalho Core — oculto quando onNavigateCore não fornecido (ex: tela Core) */}
        {onNavigateCore && (
          <button
            className="mtg-nav-btn"
            type="button"
            title={t('shell.ir_core', 'Ir para o Core')}
            onClick={onNavigateCore}
            style={{
              '--mtg-btn-color':        productColor,
              '--mtg-btn-bg':           `${productColor}12`,
              '--mtg-btn-border':       `${productColor}2e`,
              '--mtg-btn-bg-hover':     `${productColor}22`,
              '--mtg-btn-border-hover': `${productColor}55`,
            } as React.CSSProperties}
          >
            <Cube size={13} weight="duotone" />
            Core
          </button>
        )}

        <div className="mtg-sep" />

        {/* Usuário — modo compacto (só avatar) */}
        <UsuarioGlobal {...usuario} compact />
      </div>
    </header>
  )
}

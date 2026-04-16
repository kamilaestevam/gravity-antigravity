import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlass, Info, X } from '@phosphor-icons/react'
import { LogoHub, LogoCore } from '@nucleo/logo-produtos'
import { LogoGlobal } from '@nucleo/logo-global'
import { UsuarioGlobal, type UsuarioGlobalProps } from '@nucleo/usuario-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
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
  /** Toggle de visualização (Dashboard | Lista | Kanban) — renderizado no topo esquerdo */
  viewToggle?: React.ReactNode
  /** Estado do toggle de dicas */
  tooltipsDisabled: boolean
  onToggleTooltips: () => void
  /** Props para o LocalizadorGlobal */
  localizador: MenuTopoLocalizadorConfig
  /** Props para o UsuarioGlobal */
  usuario: MenuTopoUsuarioConfig
  /** Quando o menu lateral está recolhido — substitui breadcrumb pelo nome do produto */
  sidebarCollapsed?: boolean
  /** Navegar para o Hub — omitir ou passar false oculta o botão (ex: na tela Hub) */
  onNavigateHub?: () => void
  /** Navegar para o Core — omitir ou passar false oculta o botão (ex: na tela Core) */
  onNavigateCore?: () => void
  /** Slot para ações extras no header (ex: sininho de notificações). Renderizado entre
   *  o toggle de dicas e o seletor de idioma — mesma posição que no shell Header. */
  headerActions?: React.ReactNode
}

// ── Componente ───────────────────────────────────────────────────────────────

export function MenuTopoGlobal({
  productName,
  productColor = '#818cf8',
  productIcon,
  viewToggle,
  sidebarCollapsed = false,
  tooltipsDisabled,
  onToggleTooltips,
  localizador,
  usuario,
  onNavigateHub,
  onNavigateCore,
  headerActions,
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

      {/* ── ESQUERDA: nome do produto (collapsed) ou produto › view (expanded) ── */}
      <div className="mtg-left">
        {viewToggle
          ? viewToggle
          : (
            <span className="mtg-left__page-title">
              {sidebarCollapsed ? productName : localizador.currentPageLabel}
            </span>
          )
        }
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
          <TooltipGlobal descricao={t('shell.busca_global', 'Buscar na tela')}>
            <button
              className="mtg-icon-btn"
              type="button"
              aria-label={t('shell.busca_global', 'Buscar na tela')}
              onClick={openSearch}
            >
              <MagnifyingGlass size={17} />
            </button>
          </TooltipGlobal>
        )}

        {/* Toggle de dicas */}
        <TooltipGlobal descricao={tooltipsDisabled ? t('shell.habilitar_dicas', 'Habilitar dicas') : t('shell.desabilitar_dicas', 'Desabilitar dicas')}>
          <button
            className="mtg-icon-btn"
            type="button"
            aria-label={tooltipsDisabled ? t('shell.habilitar_dicas', 'Habilitar dicas') : t('shell.desabilitar_dicas', 'Desabilitar dicas')}
            onClick={onToggleTooltips}
            style={{ color: tooltipsDisabled ? 'var(--text-muted)' : '#818cf8' }}
          >
            <Info size={17} weight={tooltipsDisabled ? 'regular' : 'fill'} />
          </button>
        </TooltipGlobal>

        {/* Ações extras (ex: sininho de notificações) */}
        {headerActions}

        {/* Seletor de idioma */}
        <LanguageSwitcherGlobal iconOnly />

        {/* Localizador — onde estou (cor fixa Gravity, não herda cor do produto) */}
        <div style={{ '--lcg-color': '#818cf8' } as React.CSSProperties}>
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
        </div>

        <div className="mtg-sep" />

        {/* Atalho Hub */}
        {onNavigateHub && (
          <TooltipGlobal descricao={t('shell.voltar_hub', 'Voltar ao Hub')}>
            <button
              className="mtg-nav-btn"
              type="button"
              aria-label={t('shell.voltar_hub', 'Voltar ao Hub')}
              onClick={onNavigateHub}
              style={{
                '--mtg-btn-color':        '#818cf8',
                '--mtg-btn-bg':           'rgba(129,140,248,0.08)',
                '--mtg-btn-border':       'rgba(129,140,248,0.22)',
                '--mtg-btn-bg-hover':     'rgba(129,140,248,0.16)',
                '--mtg-btn-border-hover': 'rgba(129,140,248,0.4)',
              } as React.CSSProperties}
            >
              <LogoHub size={13} color="#818cf8" />
              Hub
            </button>
          </TooltipGlobal>
        )}

        {/* Atalho Core — cor fixa #818cf8 (identidade Gravity), não herda cor do produto */}
        {onNavigateCore && (
          <TooltipGlobal descricao={t('shell.ir_core', 'Ir para o Core')}>
            <button
              className="mtg-nav-btn"
              type="button"
              aria-label={t('shell.ir_core', 'Ir para o Core')}
              onClick={onNavigateCore}
              style={{
                '--mtg-btn-color':        '#818cf8',
                '--mtg-btn-bg':           'rgba(129,140,248,0.08)',
                '--mtg-btn-border':       'rgba(129,140,248,0.22)',
                '--mtg-btn-bg-hover':     'rgba(129,140,248,0.16)',
                '--mtg-btn-border-hover': 'rgba(129,140,248,0.4)',
              } as React.CSSProperties}
            >
              <LogoCore size={13} color="#818cf8" />
              Core
            </button>
          </TooltipGlobal>
        )}

        <div className="mtg-sep" />

        {/* Usuário — modo compacto (só avatar) */}
        <UsuarioGlobal {...usuario} compact />
      </div>
    </header>
  )
}

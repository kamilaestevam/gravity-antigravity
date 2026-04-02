import React from 'react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlass, Info, ArrowLeft, Cube } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { UsuarioGlobal, type UsuarioGlobalProps } from '@nucleo/usuario-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import {
  LocalizadorGlobal,
  type LocalizadorEntry,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import './menu-topo-global.css'

// ── Agrupamentos de props para evitar interface achatada ─────────────────────

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

export type MenuTopoUsuarioConfig = Omit<UsuarioGlobalProps, 'isAdminPanel' | 'onNavigateConfigurador'>

export interface MenuTopoGlobalProps {
  /** Nome do produto/módulo exibido no chip esquerdo */
  productName: string
  /** Cor de destaque do produto — ex: '#06b6d4'. Padrão: accent indigo */
  productColor?: string
  /** Estado do toggle de dicas */
  tooltipsDisabled: boolean
  onToggleTooltips: () => void
  /** Props para o LocalizadorGlobal */
  localizador: MenuTopoLocalizadorConfig
  /** Props para o UsuarioGlobal */
  usuario: MenuTopoUsuarioConfig
  /** Navegar para o Hub */
  onNavigateHub: () => void
  /** Navegar para o Core */
  onNavigateCore: () => void
}

// ── Componente ───────────────────────────────────────────────────────────────

export function MenuTopoGlobal({
  productName,
  productColor = '#818cf8',
  tooltipsDisabled,
  onToggleTooltips,
  localizador,
  usuario,
  onNavigateHub,
  onNavigateCore,
}: MenuTopoGlobalProps) {
  const { t } = useTranslation()

  const cssVars = {
    '--mtg-accent': productColor,
    '--mtg-accent-dim': `${productColor}18`,
    '--mtg-accent-border': `${productColor}33`,
  } as React.CSSProperties

  return (
    <header className="mtg-header" style={cssVars} role="banner">

      {/* ── ESQUERDA: logo + chip do produto ── */}
      <div className="mtg-left">
        <LogoGlobal iconSize={22} iconColor={productColor} iconOnly />
        <div className="mtg-divider" />
        <div className="mtg-product-chip">
          <span
            className="mtg-product-chip__dot"
            style={{
              backgroundColor: productColor,
              boxShadow: `0 0 6px ${productColor}99`,
            }}
          />
          <span className="mtg-product-chip__name">{productName}</span>
        </div>
      </div>

      {/* ── DIREITA: ações + usuário ── */}
      <div className="mtg-right">

        {/* Busca global — dispara evento, sem lógica de produto */}
        <button
          className="mtg-icon-btn"
          type="button"
          aria-label={t('shell.busca_global', 'Busca global')}
          title={t('shell.busca_global', 'Busca global')}
          onClick={() => window.dispatchEvent(new CustomEvent('shell:global-search'))}
        >
          <MagnifyingGlass size={18} />
        </button>

        {/* Toggle de dicas */}
        <button
          className="mtg-icon-btn"
          type="button"
          aria-label={
            tooltipsDisabled
              ? t('shell.habilitar_dicas', 'Habilitar dicas')
              : t('shell.desabilitar_dicas', 'Desabilitar dicas')
          }
          title={
            tooltipsDisabled
              ? t('shell.label_habilitar_dicas', 'Habilitar dicas')
              : t('shell.label_desabilitar_dicas', 'Desabilitar dicas')
          }
          onClick={onToggleTooltips}
          style={{ color: tooltipsDisabled ? 'var(--text-muted)' : productColor }}
        >
          <Info size={18} weight={tooltipsDisabled ? 'regular' : 'fill'} />
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

        {/* Atalho Hub */}
        <button
          className="mtg-nav-btn"
          type="button"
          title={t('shell.voltar_hub', 'Voltar ao Hub')}
          onClick={onNavigateHub}
          style={{
            '--mtg-btn-color': '#818cf8',
            '--mtg-btn-bg': 'rgba(129,140,248,0.08)',
            '--mtg-btn-border': 'rgba(129,140,248,0.25)',
            '--mtg-btn-bg-hover': 'rgba(129,140,248,0.16)',
            '--mtg-btn-border-hover': 'rgba(129,140,248,0.4)',
          } as React.CSSProperties}
        >
          <ArrowLeft size={14} weight="bold" />
          Hub
        </button>

        {/* Atalho Core */}
        <button
          className="mtg-nav-btn"
          type="button"
          title={t('shell.ir_core', 'Ir para o Core')}
          onClick={onNavigateCore}
          style={{
            '--mtg-btn-color': productColor,
            '--mtg-btn-bg': `${productColor}12`,
            '--mtg-btn-border': `${productColor}30`,
            '--mtg-btn-bg-hover': `${productColor}22`,
            '--mtg-btn-border-hover': `${productColor}55`,
          } as React.CSSProperties}
        >
          <Cube size={14} weight="duotone" />
          Core
        </button>

        <div className="mtg-sep" />

        {/* Usuário */}
        <UsuarioGlobal {...usuario} />
      </div>
    </header>
  )
}

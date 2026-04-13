import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  List,
  Sun,
  Moon,
  MagnifyingGlass,
  Info,
  ArrowLeft,
  Hexagon,
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import { AvisoInternoGlobal, type AvisoInterno } from '@nucleo/mensageria-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import {
  LocalizadorGlobal,
  useLocalizadorHistory,
  type EcosystemNode,
} from '@nucleo/localizador-global'

// ── Mapa estático de produtos do ecossistema ─────────────────────────────────
const PRODUCT_META: Record<string, { label: string; color: string; sublabel: string }> = {
  'bid-cambio':    { label: 'Bid Câmbio',    color: '#06b6d4', sublabel: 'cotações · câmbio' },
  'simulacusto':   { label: 'SimulaCusto',   color: '#34d399', sublabel: 'fiscal · NCM'      },
  'lpco':          { label: 'LPCO',          color: '#fb923c', sublabel: 'licenças COMEX'     },
  'nf-importacao': { label: 'NF Importação', color: '#c084fc', sublabel: 'nota fiscal'        },
}

// Detecta nó e contexto pelo pathname — URL é a fonte de verdade
function resolveContextFromPath(pathname: string): { productId: string; label: string; color: string; sublabel: string } {
  if (pathname === '/' || pathname.startsWith('/hub')) {
    return { productId: 'hub', label: 'Hub', color: '#818cf8', sublabel: 'ecossistema' }
  }
  if (pathname.startsWith('/core')) {
    return { productId: 'core', label: 'Core', color: '#a78bfa', sublabel: 'dashboard' }
  }
  if (pathname.startsWith('/store')) {
    return { productId: 'hub-store', label: 'HUB Store', color: '#fbbf24', sublabel: 'marketplace' }
  }
  const prodMatch = pathname.match(/^\/produto\/([^/]+)/)
  if (prodMatch) {
    const slug = prodMatch[1]
    const found = PRODUCT_META[slug]
      ?? Object.entries(PRODUCT_META).find(([k]) => k.replace(/-/g, '') === slug.replace(/-/g, ''))?.[1]
    if (found) return { productId: slug, ...found }
  }
  // Fallback: HUB
  return { productId: 'hub', label: 'Hub', color: '#818cf8', sublabel: 'ecossistema' }
}

/**
 * Mapa de rota → chave i18n de breadcrumb
 * Expandir conforme novos módulos forem integrados (Onda 3+)
 */
const ROUTE_LABEL_KEYS: Record<string, string> = {
  '/dashboard':     'shell.menu.dashboard',
  '/relatorios':    'shell.menu.relatorios',
  '/email':         'shell.menu.email',
  '/whatsapp':      'shell.menu.whatsapp',
  '/notificacoes':  'shell.menu.notificacoes',
  '/atividades':    'shell.menu.atividades',
  '/cronometro':    'shell.menu.cronometro',
  '/historico':     'shell.menu.historico',
  '/gabi':          'shell.menu.gabi',
  '/helpdesk':      'shell.menu.helpdesk',
  '/conector-erp':  'shell.menu.conector_erp',
  '/configurador':  'shell.menu.configuracoes',
}



/**
 * Header — barra superior do shell.
 *
 * Exibe:
 * - Botão toggle da sidebar
 * - Breadcrumb da rota atual
 * - Botão de busca (evento, sem lógica de produto)
 * - Toggle de tema dark/light
 * - Badge de notificações pendentes
 *
 * Info de usuário/tenant exibida na sidebar (footer).
 * Nunca contém lógica de produto.
 */
interface HeaderProps {
  moduleName?: string
  moduleColor?: string
}

export function Header({ moduleName, moduleColor }: HeaderProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const {
    toggleSidebar,
    toggleTheme,
    currentTheme,
    tooltipsDisabled,
    toggleTooltips,
    currentUser,
    clearCurrentUser,
    allowedProducts,
  } = useShellStore()

  // ── Localizador ──────────────────────────────────────────────────────────
  const ctx = resolveContextFromPath(location.pathname)
  const { history, addEntry } = useLocalizadorHistory(ctx.productId)

  // Rastro de navegação: acumula todos os nós visitados na sessão
  const visitedSetRef  = useRef<Set<string>>(new Set<string>())
  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([])

  // Registra navegação no histórico e no rastro a cada mudança de rota
  useEffect(() => {
    addEntry({
      productId:    ctx.productId,
      productLabel: ctx.label,
      productColor: ctx.color,
      pageLabel:    getPageLabel(location.pathname),
      pagePath:     location.pathname,
    })
    if (!visitedSetRef.current.has(ctx.productId)) {
      visitedSetRef.current.add(ctx.productId)
      setVisitedNodeIds(Array.from(visitedSetRef.current))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Monta nós do ecossistema
  const ecosystemNodes: EcosystemNode[] = [
    {
      id:       'hub',
      label:    'Hub',
      sublabel: 'ecossistema',
      color:    '#818cf8',
      type:     'hub',
      status:   ctx.productId === 'hub' ? 'current' : 'accessible',
    },
    {
      id:       'core',
      label:    'Core',
      sublabel: 'dashboard',
      color:    '#a78bfa',
      type:     'core',
      status:   ctx.productId === 'core' ? 'current' : 'accessible',
    },
    {
      id:       'hub-store',
      label:    'HUB Store',
      sublabel: 'marketplace',
      color:    '#fbbf24',
      type:     'hub-store',
      status:   ctx.productId === 'hub-store' ? 'current' : 'accessible',
    },
    {
      id:       'configurador',
      label:    'Configurador',
      sublabel: 'auth · billing',
      color:    '#f472b6',
      type:     'configurador',
      status:   'accessible',
    },
    // Produtos — habilitados ou bloqueados conforme contrato
    ...Object.entries(PRODUCT_META).map(([id, meta]): EcosystemNode => {
      const isAllowed = allowedProducts.some(p => p.product_key === id && p.is_active)
      return {
        id,
        label:    meta.label,
        sublabel: meta.sublabel,
        color:    meta.color,
        type:     'produto',
        status:   id === ctx.productId ? 'current' : isAllowed ? 'accessible' : 'locked',
      }
    }),
  ]

  const avisosMock: AvisoInterno[] = [
    {
      id: '1',
      conteudo: t('shell.notificacoes_mock.boas_vindas'),
      autor: { nome: t('shell.sistema') },
      dataHora: new Date().toLocaleString('pt-BR'),
      lido: false,
      tipo: 'sistema',
    },
    {
      id: '2',
      conteudo: t('shell.notificacoes_mock.simulacao_concluida'),
      autor: { nome: 'SimulaCusto' },
      dataHora: new Date(Date.now() - 3600_000).toLocaleString('pt-BR'),
      lido: false,
      tipo: 'aviso',
    },
  ]

  const [avisos, setAvisos] = useState<AvisoInterno[]>(avisosMock)

  function getPageLabel(pathname: string): string {
    const key = ROUTE_LABEL_KEYS[pathname]
    if (key) return t(key)
    const base = '/' + pathname.split('/')[1]
    const baseKey = ROUTE_LABEL_KEYS[base]
    return baseKey ? t(baseKey) : t('shell.gravity')
  }

  const pageLabel = getPageLabel(location.pathname)

  const handleMarcarLido = (id: string) => {
    setAvisos(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a))
  }

  const handleMarcarTodosLidos = () => {
    setAvisos(prev => prev.map(a => ({ ...a, lido: true })))
  }

  const handleCriarAviso = (texto: string) => {
    const novo: AvisoInterno = {
      id: `aviso-${Date.now()}`,
      conteudo: texto,
      autor: { nome: t('shell.voce') },
      dataHora: new Date().toLocaleString('pt-BR'),
      lido: false,
      tipo: 'aviso',
    }
    setAvisos(prev => [novo, ...prev])
  }

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <header className="shell-header" role="banner">

      {/* ESQUERDA: logo + label de contexto */}
      <div className="shell-header__left">
        <div className="shell-header__logo">
          <Hexagon weight="duotone" size={22} color="#818cf8" />
          <span className="shell-header__logo-name">Gravity</span>
        </div>
        <div className="shell-header__logo-div" />
        <span className="shell-header__logo-label">{pageLabel}</span>
      </div>

      {/* DIREITA: ações + usuário (Floating Header) */}
      <div className="shell-header__right">
        {/* Botão Voltar ao Hub */}
        <button
          onClick={() => { window.location.href = '/hub' }}
          type="button"
          title={t('shell.voltar_hub', 'Voltar ao Hub')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            border: '1px solid rgba(129,140,248,0.25)',
            background: 'rgba(129,140,248,0.08)',
            color: '#818cf8',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)' }}
        >
          <ArrowLeft size={16} weight="bold" />
          Hub
        </button>

        {/* Busca global — dispara evento, sem lógica de produto */}
        <button
          className="shell-header__icon-btn"
          aria-label={t('shell.busca_global')}
          title={t('shell.busca_global')}
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('shell:global-search'))
          }}
        >
          <MagnifyingGlass size={18} />
        </button>

        {/* Toggle de tooltips */}
        <button
          className="shell-header__icon-btn"
          aria-label={tooltipsDisabled ? t('shell.habilitar_dicas') : t('shell.desabilitar_dicas')}
          title={tooltipsDisabled ? t('shell.label_habilitar_dicas') : t('shell.label_desabilitar_dicas')}
          type="button"
          onClick={toggleTooltips}
          style={{ color: tooltipsDisabled ? 'var(--text-muted)' : 'var(--accent)' }}
        >
          <Info size={18} weight={tooltipsDisabled ? 'regular' : 'fill'} />
        </button>

        {/* Mensageria — Quadro de Avisos Internos */}
        <div className="shell-header__icon-btn" style={{ padding: 0, background: 'none', border: 'none' }}>
          <AvisoInternoGlobal
            avisos={avisos}
            onMarcarLido={handleMarcarLido}
            onMarcarTodosLidos={handleMarcarTodosLidos}
            onCriarAviso={handleCriarAviso}
          />
        </div>

        {/* Localizador — Onde estou (sempre visível) */}
        <LocalizadorGlobal
          workspaceName={currentUser.tenantName ?? t('shell.organizacao_padrao')}
          currentProductId={ctx.productId}
          currentProductLabel={ctx.label}
          currentProductColor={ctx.color}
          currentPageLabel={getPageLabel(location.pathname)}
          history={history}
          nodes={ecosystemNodes}
          visitedNodeIds={visitedNodeIds}
          onNavigate={(node) => {
            if (node.type === 'hub')          window.location.href = '/hub'
            else if (node.type === 'core')        window.location.href = '/core'
            else if (node.type === 'hub-store')   window.location.href = '/store'
            else if (node.type === 'configurador') window.location.href = '/configurador'
            else if (node.type === 'produto')      window.location.href = `/produto/${node.id}`
          }}
        />

        {/* Seletor de idioma */}
        <LanguageSwitcherGlobal />

        {/* Divisor visual */}
        <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

        {/* Usuário Global — Perfil e Conta */}
        <UsuarioGlobal
          userName={currentUser.name || t('shell.usuario_padrao')}
          userEmail={currentUser.email || t('shell.email_padrao')}
          userInitials={initials}
          userRole={currentUser.role ?? t('shell.papel_membro')}
          isLight={currentTheme === 'light'}
          onToggleTheme={toggleTheme}
          onNavigateWorkspace={() => console.log('Navegar para Organização')}
          onNavigateMarketPlace={() => window.location.href = '/store'}
          onSignOut={() => {
            clearCurrentUser()
            window.location.href = '/'
          }}
          isAdmin={currentUser.role === 'Super Admin' || currentUser.role === 'Admin'}
          onNavigateAdmin={() => window.location.href = '/admin'}
          compact
        />
      </div>
    </header>
  )
}

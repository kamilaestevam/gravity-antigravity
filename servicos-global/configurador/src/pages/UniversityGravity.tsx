/**
 * UniversityGravity — layout da Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP. Mesmo layout do Configurador: MenuLateralGlobal (sidebar)
 * com título "Gravity University" + opções e dropdown de organizações, e as
 * mesmas ações de topo (Hub, busca/localizar, dica, notificações, localizador,
 * idioma, usuário). Textos via i18n (namespace `university`). Implementação real em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import {
  Books, FileText, PuzzlePiece, Path, Sparkle, GraduationCap, Info,
  SignIn, ShieldStar, Gear, SquaresFour, ShoppingBag, Package,
  MagnifyingGlass, AirplaneTilt, ArrowsLeftRight, GitBranch, CheckCircle,
  Clock, CheckFat,
} from '@phosphor-icons/react'
import { useShellStore, Notificacoes, ToastContainer, useMeSync, type OrganizacaoShell } from '@gravity/shell'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { mapRole } from '../types/niveis-acesso'
import { HubBotao } from '../components/HubBotao'
import { PlayerAula } from './university/PlayerAula'
import { getAulaDemo, getAulasDemo } from './university/conteudo-demo'
import './configurador/workspace.css'

const UNI_COR = '#818cf8'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Fase {
  slug: string
  nome: string
  duracao: string
  concluida: boolean
}
interface Trilha {
  tag: string
  emoji: string
  nome: string
  modulos: number
  duracao: string
  prog: number
  fases: Fase[]
}

// ── Catálogo WIP — virá do banco via API ───────────────────────────────────
const TRILHAS_POR_PRODUTO: Record<string, Trilha[]> = {
  login: [{
    tag: '#60a5fa', emoji: '🔑', nome: 'Primeiros Passos — Login', modulos: 3, duracao: '30m', prog: 100,
    fases: [
      { slug: 'o-que-e-o-gravity',       nome: 'O que é o Gravity',     duracao: '10m', concluida: true },
      { slug: 'criando-sua-conta',        nome: 'Criando sua conta',     duracao: '10m', concluida: true },
      { slug: 'configurando-seu-perfil',  nome: 'Configurando seu perfil', duracao: '10m', concluida: true },
    ],
  }],
  admin: [{
    tag: '#f43f5e', emoji: '🛡️', nome: 'Painel Administrativo', modulos: 3, duracao: '1h', prog: 0,
    fases: [
      { nome: 'Visão geral do Admin', duracao: '20m', concluida: false },
      { nome: 'Impersonação de usuário', duracao: '20m', concluida: false },
      { nome: 'Monitor de APIs e deploys', duracao: '20m', concluida: false },
    ],
  }],
  configurador: [{
    tag: '#60a5fa', emoji: '🧭', nome: 'Conhecendo o Gravity', modulos: 3, duracao: '1h', prog: 100,
    fases: [
      { nome: 'Criando a Organização', duracao: '20m', concluida: true },
      { nome: 'Configurando Workspaces', duracao: '20m', concluida: true },
      { nome: 'Convidando usuários', duracao: '20m', concluida: true },
    ],
  }],
  hub: [{
    tag: '#a78bfa', emoji: '🏠', nome: 'Hub e Navegação', modulos: 2, duracao: '30m', prog: 0,
    fases: [
      { nome: 'Navegando pelo Hub', duracao: '15m', concluida: false },
      { nome: 'Trocando de Workspace', duracao: '15m', concluida: false },
    ],
  }],
  store: [{
    tag: '#10b981', emoji: '🛒', nome: 'Gravity Store', modulos: 2, duracao: '45m', prog: 0,
    fases: [
      { nome: 'Explorando o Marketplace', duracao: '25m', concluida: false },
      { nome: 'Contratando um produto', duracao: '20m', concluida: false },
    ],
  }],
  pedido: [{
    tag: '#f59e0b', emoji: '📦', nome: 'Onboarding Pedido', modulos: 5, duracao: '2h', prog: 62,
    fases: [
      { nome: 'Lista de Pedidos', duracao: '25m', concluida: true },
      { nome: 'Criando um Pedido', duracao: '20m', concluida: true },
      { nome: 'Edição em Massa', duracao: '25m', concluida: true },
      { nome: 'Colunas e Filtros', duracao: '25m', concluida: false },
      { nome: 'Relatórios e Exportação', duracao: '25m', concluida: false },
    ],
  }],
  'smart-read': [{
    tag: '#c084fc', emoji: '📄', nome: 'Onboarding Smart Docs', modulos: 4, duracao: '1h30', prog: 0,
    fases: [
      { nome: 'Anexando documentos', duracao: '25m', concluida: false },
      { nome: 'Leitura inteligente', duracao: '25m', concluida: false },
      { nome: 'Análise de Riscos', duracao: '25m', concluida: false },
      { nome: 'Exportando Insights', duracao: '15m', concluida: false },
    ],
  }],
  'bid-frete': [{
    tag: '#60a5fa', emoji: '✈️', nome: 'BID Frete Internacional', modulos: 4, duracao: '1h30', prog: 0,
    fases: [
      { nome: 'Nova Cotação', duracao: '25m', concluida: false },
      { nome: 'Comparando Fretes', duracao: '25m', concluida: false },
      { nome: 'Aprovação e Follow-up', duracao: '25m', concluida: false },
      { nome: 'Relatórios de Frete', duracao: '15m', concluida: false },
    ],
  }],
  'bid-cambio': [{
    tag: '#facc15', emoji: '💱', nome: 'BID Câmbio', modulos: 3, duracao: '1h', prog: 0,
    fases: [
      { nome: 'Simulação de Câmbio', duracao: '20m', concluida: false },
      { nome: 'Fechamento de Câmbio', duracao: '20m', concluida: false },
      { nome: 'Histórico e Relatórios', duracao: '20m', concluida: false },
    ],
  }],
  processo: [{
    tag: '#facc15', emoji: '🔀', nome: 'Onboarding Processo', modulos: 6, duracao: '2h30', prog: 0,
    fases: [
      { nome: 'Criando um Processo', duracao: '25m', concluida: false },
      { nome: 'Dados Técnicos', duracao: '25m', concluida: false },
      { nome: 'Vinculando Pedidos', duracao: '25m', concluida: false },
      { nome: 'Containers e Taxas', duracao: '25m', concluida: false },
      { nome: 'Workflow e Status', duracao: '25m', concluida: false },
      { nome: 'Relatórios', duracao: '25m', concluida: false },
    ],
  }],
}

// Produtos que esta organização contratou (WIP — virá do backend)
const PRODUTOS_CONTRATADOS: (keyof typeof TRILHAS_POR_PRODUTO)[] = [
  'login', 'configurador', 'pedido', 'processo', 'smart-read',
]

// Visão geral agrupada (sem produto selecionado)
const GRUPOS_TRILHAS = [
  { tituloKey: 'university.grupo.comece_aqui',  trilhas: [TRILHAS_POR_PRODUTO.login[0], TRILHAS_POR_PRODUTO.configurador[0]] },
  { tituloKey: 'university.grupo.seus_produtos', trilhas: [TRILHAS_POR_PRODUTO.pedido[0], TRILHAS_POR_PRODUTO.processo[0], TRILHAS_POR_PRODUTO['smart-read'][0]] },
  { tituloKey: 'university.grupo.explorar',      trilhas: [TRILHAS_POR_PRODUTO['bid-frete'][0], TRILHAS_POR_PRODUTO['bid-cambio'][0], TRILHAS_POR_PRODUTO.store[0]] },
]

const ICON_MAP = {
  login:        SignIn,
  admin:        ShieldStar,
  configurador: Gear,
  hub:          SquaresFour,
  store:        ShoppingBag,
  pedido:       Package,
  'smart-read': MagnifyingGlass,
  'bid-frete':  AirplaneTilt,
  'bid-cambio': ArrowsLeftRight,
  processo:     GitBranch,
} as const

type ProdutoSlug = keyof typeof ICON_MAP

// ── Helpers ────────────────────────────────────────────────────────────────
function BarraProgresso({ pct, cor = UNI_COR, altura = 7 }: { pct: number; cor?: string; altura?: number }) {
  return (
    <div style={{ height: altura, borderRadius: 9, background: 'rgba(148,163,184,.12)', overflow: 'hidden', flex: 1 }}>
      <span style={{
        display: 'block', height: '100%', width: `${Math.min(100, pct)}%`,
        background: pct >= 100 ? 'linear-gradient(90deg,#34d399,#10b981)' : `linear-gradient(90deg,${cor},#a78bfa)`,
        transition: 'width .4s ease',
      }} />
    </div>
  )
}

export function UniversityGravity() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const {
    currentUser, currentTheme, toggleTheme,
    tooltipsDisabled, toggleTooltips,
    organizacoes, setOrganizacoes,
  } = useShellStore()
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole } = useCarregarTipoUsuario()
  const isLight = currentTheme === 'light'

  useMeSync()

  const secao = pathname.includes('/docs') ? 'docs'
    : pathname.includes('/builders') ? 'builders'
    : pathname.includes('/minha-jornada') ? 'jornada'
    : 'academy'

  const partes = pathname.replace('/university-gravity/academy', '').split('/').filter(Boolean)
  const produtoSlug = (partes[0] ?? null) as ProdutoSlug | null
  const faseSlug = partes[1] ?? null

  const trilhasAtivas: Trilha[] | null = (produtoSlug && !faseSlug)
    ? (TRILHAS_POR_PRODUTO[produtoSlug] ?? null)
    : null

  // Controle local de aulas concluídas (WIP — virá do banco via API)
  const [aulasConcluidas, setAulasConcluidas] = useState<Set<string>>(() => {
    const salvo = sessionStorage.getItem('university_concluidas')
    return salvo ? new Set(JSON.parse(salvo)) : new Set(['o-que-e-o-gravity', 'criando-sua-conta', 'configurando-seu-perfil'])
  })
  const marcarConcluida = useCallback((slug: string) => {
    setAulasConcluidas(prev => {
      const novo = new Set(prev)
      novo.add(slug)
      sessionStorage.setItem('university_concluidas', JSON.stringify([...novo]))
      return novo
    })
  }, [])

  // Progresso geral nos produtos contratados
  const progressoContratados = PRODUTOS_CONTRATADOS.map(slug => ({
    slug,
    prog: TRILHAS_POR_PRODUTO[slug]?.[0]?.prog ?? 0,
    emoji: TRILHAS_POR_PRODUTO[slug]?.[0]?.emoji ?? '📦',
  }))
  const concluidos = progressoContratados.filter(p => p.prog >= 100).length
  const pctGeral = Math.round((concluidos / progressoContratados.length) * 100)

  const nomeOrganizacao = currentUser?.nomeOrganizacao ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@usegravity.com.br'

  const orgsFetchedRef = useRef(false)
  useEffect(() => {
    if (!isGravityAdmin || orgsFetchedRef.current) return
    orgsFetchedRef.current = true
    ;(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch('/api/v1/me/organizacoes', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.organizacoes)) setOrganizacoes(data.organizacoes)
      } catch { /* UX opcional */ }
    })()
  }, [isGravityAdmin, getToken, setOrganizacoes])

  const handleTrocarOrganizacao = async (idOrg: string) => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/v1/me/organizacao-ativa', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_organizacao: idOrg }),
      })
      if (!res.ok) return
      sessionStorage.removeItem('gravity_company_id')
      window.location.href = '/university-gravity/academy'
    } catch { /* silencioso */ }
  }

  const orgWorkspaceItems = isGravityAdmin
    ? organizacoes.map((org: OrganizacaoShell) => ({ id: org.id_organizacao, name: org.nome_organizacao, plan: org.subdominio_organizacao }))
    : []

  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('configurador')
  const [ecoNodes] = useState<EcosystemNode[]>(buildEcosystemNodes({ currentProductId: 'configurador' }))
  useEffect(() => {
    locAddEntry({ productId: 'configurador', productLabel: t('university.modulo_nome'), productColor: UNI_COR, pageLabel: t('university.modulo_nome'), pagePath: '/university-gravity' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { document.body.classList.toggle('light-theme', isLight) }, [isLight])
  useEffect(() => { document.body.classList.toggle('tooltips-disabled', tooltipsDisabled) }, [tooltipsDisabled])

  const produtoIcon = (slug: ProdutoSlug, size = 16) => {
    const IconComp = ICON_MAP[slug]
    const prog = TRILHAS_POR_PRODUTO[slug]?.[0]?.prog ?? 0
    return prog >= 100
      ? <CheckCircle weight="fill" size={size} style={{ color: '#34d399' }} />
      : <IconComp weight="duotone" size={size} />
  }

  const navItems = [
    {
      to: '/university-gravity/academy',
      label: t('university.nav.academy'),
      icon: <Books weight="duotone" size={18} />,
      children: [
        { to: '/university-gravity/academy/login',        label: t('university.produto.login'),        icon: produtoIcon('login') },
        { to: '/university-gravity/academy/admin',        label: t('university.produto.admin'),        icon: produtoIcon('admin'), badge: t('university.badge.restrito'), badgeVariant: 'muted' as const },
        { to: '/university-gravity/academy/configurador', label: t('university.produto.configurador'), icon: produtoIcon('configurador') },
        { to: '/university-gravity/academy/hub',          label: t('university.produto.hub'),          icon: produtoIcon('hub') },
        { to: '/university-gravity/academy/store',        label: t('university.produto.store'),        icon: produtoIcon('store') },
        { to: '/university-gravity/academy/pedido',       label: t('university.produto.pedido'),       icon: produtoIcon('pedido') },
        { to: '/university-gravity/academy/smart-read',   label: t('university.produto.smart_read'),   icon: produtoIcon('smart-read') },
        { to: '/university-gravity/academy/bid-frete',    label: t('university.produto.bid_frete'),    icon: produtoIcon('bid-frete') },
        { to: '/university-gravity/academy/bid-cambio',   label: t('university.produto.bid_cambio'),   icon: produtoIcon('bid-cambio') },
        { to: '/university-gravity/academy/processo',     label: t('university.produto.processo'),     icon: produtoIcon('processo') },
      ],
    },
    { to: '/university-gravity/docs',          label: t('university.nav.docs'),          icon: <FileText weight="duotone" size={18} />,    badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
    { to: '/university-gravity/builders',      label: t('university.nav.builders'),      icon: <PuzzlePiece weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
    { to: '/university-gravity/minha-jornada', label: t('university.nav.minha_jornada'), icon: <Path weight="duotone" size={18} /> },
  ]

  const tituloSecao = produtoSlug
    ? t(`university.produto.${produtoSlug.replaceAll('-', '_')}`)
    : secao === 'jornada' ? t('university.nav.minha_jornada')
    : secao === 'docs' ? t('university.nav.docs')
    : secao === 'builders' ? t('university.nav.builders')
    : t('university.nav.academy')

  return (
    <div className="ws-shell">
      <MenuLateralGlobal
        tenantName={nomeOrganizacao}
        tenantPlan={isGravityAdmin ? 'Super Admin' : (currentUser?.nomeWorkspacePreferido ?? nomeOrganizacao)}
        navItems={navItems}
        moduleName={t('university.modulo_nome')}
        moduleColor={UNI_COR}
        defaultCollapsed={false}
        workspaces={isGravityAdmin ? orgWorkspaceItems : undefined}
        onSwitchWorkspace={isGravityAdmin ? handleTrocarOrganizacao : undefined}
        dropdownSearchPlaceholder={isGravityAdmin ? t('university.busca.organizacao') : undefined}
      />

      <div className="ws-main">
        <div className="ws-global-actions">
          <HubBotao onClick={() => navigate('/hub?select=1')} />

          <CampoLocalizarExpandidoGlobal
            onBuscarNavigate={(term) => {
              const alvo = navItems.find(i => i.label.toLowerCase().includes(term.toLowerCase()))
              if (alvo) navigate(alvo.to ?? '/university-gravity/academy')
            }}
          />

          <TooltipGlobal
            titulo={t('university.dica.titulo')}
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: UNI_COR, flexShrink: 0 }} />
                  <span>{t('university.dica.habilitadas')}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                  <span>{t('university.dica.desabilitadas')}</span>
                </span>
              </span>
            }
          >
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          <Notificacoes />

          <LocalizadorGlobal
            workspaceName={nomeOrganizacao}
            currentProductId="configurador"
            currentProductLabel={t('university.modulo_nome')}
            currentProductColor={UNI_COR}
            currentPageLabel={tituloSecao}
            history={locHistory}
            nodes={ecoNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub?select=1')
              else if (node.type === 'configurador') navigate('/configurador/workspaces')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
            iconOnly
          />

          <SeletorIdiomaGlobal />

          <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={mapRole(dbRole)}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            compact
          />
        </div>

        {/* ══ Player de aula (rota /academy/{produto}/{fase}) ══ */}
        {secao === 'academy' && faseSlug && produtoSlug && (() => {
          const aula = getAulaDemo(produtoSlug, faseSlug)
          const todasAulas = getAulasDemo(produtoSlug)
          if (!aula) return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ws-muted,#94a3b8)' }}>
              Aula não encontrada.
            </div>
          )
          return (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PlayerAula
                produtoSlug={produtoSlug}
                faseSlug={faseSlug}
                aula={aula}
                todasAulas={todasAulas}
                concluidas={aulasConcluidas}
                onMarcarConcluida={marcarConcluida}
              />
            </div>
          )
        })()}

        {/* ══ Resto das views (overview, jornada, docs, builders) ══ */}
        {!(secao === 'academy' && faseSlug) && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem 3rem' }}>

          {/* ── Cabeçalho ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <GraduationCap weight="duotone" size={24} color={UNI_COR} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ws-text,#f1f5f9)' }}>
              {tituloSecao}
            </h1>
          </div>

          {/* ── Banner ── */}
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: 'linear-gradient(135deg, rgba(167,139,250,.12), rgba(129,140,248,.05))',
            border: '1px solid rgba(167,139,250,.28)', borderRadius: 14, padding: '14px 16px', marginBottom: 24,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#a78bfa,#818cf8)', color: '#0b1220' }}>
              <Sparkle weight="fill" size={18} />
            </div>
            <div>
              <div style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.08em', color: '#a78bfa', textTransform: 'uppercase' }}>
                {t('university.banner.em_construcao')}
              </div>
              <p style={{ fontSize: '.86rem', marginTop: 4, lineHeight: 1.55, color: 'var(--ws-text,#f1f5f9)' }}>
                {t('university.banner.descricao')}
              </p>
            </div>
          </div>

          {/* ══ BARRA 3 — Progresso nos produtos contratados (sempre visível no academy) ══ */}
          {secao === 'academy' && (
            <div style={{
              background: 'var(--bg-base,#1e293b)',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>
                  {t('university.progresso.produtos_contratados')}
                </span>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: pctGeral >= 100 ? '#34d399' : 'var(--ws-text,#f1f5f9)' }}>
                  {concluidos} / {progressoContratados.length} {t('university.progresso.concluidos')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <BarraProgresso pct={pctGeral} altura={8} />
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', whiteSpace: 'nowrap' }}>{pctGeral}%</span>
              </div>
              {/* Pills de produto */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {progressoContratados.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => navigate(`/university-gravity/academy/${p.slug}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '.72rem', fontWeight: 700,
                      background: p.prog >= 100 ? 'rgba(52,211,153,.15)' : p.prog > 0 ? 'rgba(129,140,248,.15)' : 'rgba(148,163,184,.08)',
                      color: p.prog >= 100 ? '#34d399' : p.prog > 0 ? UNI_COR : 'var(--ws-muted,#94a3b8)',
                    }}
                  >
                    <span>{p.emoji}</span>
                    <span>{t(`university.produto.${p.slug.replaceAll('-', '_')}`)}</span>
                    {p.prog >= 100 && <CheckFat weight="fill" size={11} />}
                    {p.prog > 0 && p.prog < 100 && <span style={{ color: 'var(--ws-muted,#94a3b8)' }}>{p.prog}%</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ VIEW: produto específico ══ */}
          {secao === 'academy' && trilhasAtivas && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {trilhasAtivas.map(tr => {
                const fasesFeitas = tr.fases.filter(f => f.concluida).length
                const pctModulo = Math.round((fasesFeitas / tr.fases.length) * 100)

                return (
                  <div key={tr.nome}>
                    {/* ── CARD: header do módulo ── */}
                    <div style={{
                      background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)',
                      borderRadius: 14, padding: '18px 20px',
                    }}>
                      {/* Título + tempo total */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 11, display: 'grid', placeItems: 'center', background: `${tr.tag}22`, fontSize: 22 }}>
                            {tr.emoji}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tr.nome}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--ws-muted,#94a3b8)', marginTop: 2 }}>
                              {t('university.trilha.modulos', { count: tr.modulos })}
                            </div>
                          </div>
                        </div>
                        {/* Tempo total */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'rgba(148,163,184,.08)', borderRadius: 9999, padding: '5px 12px',
                          fontSize: '.75rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', flexShrink: 0,
                        }}>
                          <Clock weight="duotone" size={14} style={{ color: UNI_COR }} />
                          {t('university.trilha.total')} {tr.duracao}
                        </div>
                      </div>

                      {/* ── BARRA 2 — conclusão do módulo ── */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <BarraProgresso pct={pctModulo} />
                        <span style={{ fontSize: '.75rem', fontWeight: 700, color: pctModulo >= 100 ? '#34d399' : 'var(--ws-muted,#94a3b8)', whiteSpace: 'nowrap' }}>
                          {pctModulo >= 100 ? t('university.acao.concluida') : `${pctModulo}%`}
                        </span>
                      </div>

                      {/* ── BARRA 1 — fases individuais ── */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {tr.fases.map((fase, idx) => (
                          <div
                            key={fase.nome}
                            onClick={() => navigate(`/university-gravity/academy/${produtoSlug}/${fase.slug}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                              borderTop: idx > 0 ? '1px solid rgba(148,163,184,.07)' : 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {/* Indicador */}
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                              display: 'grid', placeItems: 'center',
                              background: fase.concluida ? 'rgba(52,211,153,.15)' : 'rgba(148,163,184,.08)',
                              border: fase.concluida ? '1.5px solid rgba(52,211,153,.4)' : '1.5px solid rgba(148,163,184,.15)',
                            }}>
                              {fase.concluida
                                ? <CheckCircle weight="fill" size={14} style={{ color: '#34d399' }} />
                                : <span style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--ws-muted,#94a3b8)' }}>{idx + 1}</span>
                              }
                            </div>
                            {/* Nome */}
                            <span style={{
                              flex: 1, fontSize: '.86rem', fontWeight: fase.concluida ? 400 : 600,
                              color: fase.concluida ? 'var(--ws-muted,#94a3b8)' : 'var(--ws-text,#f1f5f9)',
                              textDecoration: fase.concluida ? 'line-through' : 'none',
                            }}>
                              {fase.nome}
                            </span>
                            {/* Tempo individual */}
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: '.72rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', flexShrink: 0,
                            }}>
                              <Clock size={12} />
                              {fase.duracao}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div style={{ marginTop: 16 }}>
                        <button style={{
                          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '9px 18px',
                          borderRadius: 9999,
                          background: pctModulo >= 100 ? 'rgba(52,211,153,.15)' : UNI_COR,
                          color: pctModulo >= 100 ? '#34d399' : '#0b1220',
                        }}>
                          {pctModulo >= 100 ? t('university.acao.concluida') : pctModulo > 0 ? t('university.acao.continuar') : t('university.acao.iniciar_jornada')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ══ VIEW: visão geral agrupada ══ */}
          {secao === 'academy' && !trilhasAtivas && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {GRUPOS_TRILHAS.map(grupo => (
                <div key={grupo.tituloKey}>
                  <h2 style={{ fontSize: '.74rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ws-muted,#94a3b8)', marginBottom: 12 }}>
                    {t(grupo.tituloKey)}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {grupo.trilhas.map(tr => (
                      <div key={tr.nome} style={{
                        background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)',
                        borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 11,
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: `${tr.tag}22`, fontSize: 20 }}>
                          {tr.emoji}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tr.nome}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--ws-muted,#94a3b8)' }}>
                          <Clock size={12} />
                          {t('university.trilha.modulos', { count: tr.modulos })} · {tr.duracao}
                        </div>
                        {tr.prog > 0 && <BarraProgresso pct={tr.prog} />}
                        <button style={{
                          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '8px 14px',
                          borderRadius: 9999,
                          background: tr.prog >= 100 ? 'rgba(52,211,153,.15)' : UNI_COR,
                          color: tr.prog >= 100 ? '#34d399' : '#0b1220',
                        }}>
                          {tr.prog >= 100 ? t('university.acao.concluida') : tr.prog > 0 ? t('university.acao.continuar') : t('university.acao.iniciar_jornada')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {secao === 'jornada' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { k: 'university.jornada.pontos', v: '1.240' },
                { k: 'university.jornada.concluidas', v: '2' },
                { k: 'university.jornada.em_andamento', v: '1' },
                { k: 'university.jornada.certificados', v: '2' },
              ].map(kpi => (
                <div key={kpi.k} style={{ background: 'var(--bg-surface,#334155)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>{t(kpi.k)}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6 }}>{kpi.v}</div>
                </div>
              ))}
            </div>
          )}

          {(secao === 'docs' || secao === 'builders') && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>{secao === 'docs' ? '📚' : '🧩'}</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>{t('university.vazio.em_breve', { secao: tituloSecao })}</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>
                {secao === 'docs' ? t('university.docs.descricao') : t('university.builders.descricao')}
              </p>
            </div>
          )}

        </div>
        )}
      </div>

      <ToastContainer />
    </div>
  )
}

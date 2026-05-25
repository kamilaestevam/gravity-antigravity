import React, { useEffect, useMemo, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { ToastContainer, useShellStore, useUserPreferences, useMeSync, useOrganizacaoOverride, type OrganizacaoShell } from '@gravity/shell'
import { useCarregarTipoUsuario } from '../../hooks/use-carregar-tipo-usuario'
import { ModalTrocarOrganizacao } from '../../components/modal-trocar-organizacao'
import { Notificacoes } from '../../../../servicos-plataforma/notificacoes/src/Notificacoes'
import {
  Crown,
  Buildings,
  Users,
  CreditCard,
  Receipt,
  Pulse,
  CurrencyCircleDollar,
  ClockCounterClockwise,
  Sun,
  Moon,
  MagnifyingGlass,
  Bell,
  CaretDown,
  XCircle,
  User,
  ShieldCheck,
  Gear,
  Lifebuoy,
  Sparkle,
  SignOut,
  Robot,
  Truck,
  Info,
} from '@phosphor-icons/react'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { HubBotao } from '../../components/HubBotao'
import GabiChat from '@plataforma/gabi/src/Gabi'
import './workspace.css'
import './gabi.css'
import { WsAreaConteudo } from '../../shared/WsAreaConteudo'
import { resolverPageLabelTopo } from '../../shared/page-meta-topo'

export function WorkspaceLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const pageLabel = useMemo(
    () => resolverPageLabelTopo(pathname, t, 'configurador'),
    [pathname, t],
  )

  const navItems = [
    { to: '/configurador/organizacao',  label: t('workspace.layout.organizacao'),    icon: <Crown       weight="duotone" size={18} /> },
    { to: '/configurador/workspaces',     label: t('workspace.layout.workspaces'), icon: <Buildings   weight="duotone" size={18} /> },
    { to: '/configurador/usuarios',     label: t('workspace.layout.usuarios'),        icon: <Users       weight="duotone" size={18} /> },
    { to: '/configurador/empresas-e-parceiros', label: 'Empresas e Parceiros',          icon: <Buildings   weight="duotone" size={18} /> },
    { to: '/configurador/assinaturas',  label: t('workspace.layout.assinaturas'),     icon: <CreditCard  weight="duotone" size={18} /> },
    { to: '/configurador/financeiro',   label: t('workspace.layout.financeiro'),      icon: <Receipt     weight="duotone" size={18} /> },
    { to: '/configurador/api-cockpit',  label: t('workspace.layout.api-cockpit'),     icon: <Pulse weight="duotone" size={18} /> },
    { to: '/configurador/taxas-moeda',  label: t('workspace.layout.taxa-cambio'),       icon: <CurrencyCircleDollar weight="duotone" size={18} /> },
    { to: '/configurador/historico-organizacao', label: t('workspace.layout.historico-organizacao'), icon: <ClockCounterClockwise weight="duotone" size={18} /> },
  ]

  const navigate = useNavigate()
  const { user } = useUser()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, currentUser } = useShellStore()

  // Popula ShellStore via GET /api/v1/me (Clerk = porteiro, backend = fonte de verdade)
  const { refetchMe } = useMeSync()
  // Sincroniza preferências de UI com o backend (cross-device)
  useUserPreferences({ id_usuario: currentUser.id || user?.id, id_organizacao: currentUser.idOrganizacao })
  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)

  const nomeOrganizacao = currentUser?.nomeOrganizacao ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@usegravity.com.br'

  const { tipoUsuario: dbRole, gravityAdmin: isGravityAdmin } = useCarregarTipoUsuario()
  const { podeAtivarOverride, overrideAtivo, limparOverride } = useOrganizacaoOverride()
  const [modalTrocarOrgAberto, setModalTrocarOrgAberto] = useState(false)
  const { signOut } = useClerk()
  const { getToken } = useAuth()

  const { organizacoes, setOrganizacoes } = useShellStore()
  const orgsFetchedRef = useRef(false)

  useEffect(() => {
    if (!isGravityAdmin || orgsFetchedRef.current) return
    orgsFetchedRef.current = true

    async function fetchOrganizacoes() {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch('/api/v1/me/organizacoes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.organizacoes)) {
          setOrganizacoes(data.organizacoes)
        }
      } catch { /* silencioso — lista de orgs é UX opcional */ }
    }
    fetchOrganizacoes()
  }, [isGravityAdmin, getToken, setOrganizacoes])

  const handleTrocarOrganizacao = async (idOrg: string) => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/v1/me/organizacao-ativa', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_organizacao: idOrg }),
      })
      if (!res.ok) {
        console.warn('[WorkspaceLayout] Falha ao trocar organização:', res.status)
        return
      }
      sessionStorage.removeItem('gravity_company_id')
      window.location.href = '/configurador/workspaces'
    } catch (err) {
      console.warn('[WorkspaceLayout] Erro ao trocar organização:', err)
    }
  }

  const orgWorkspaceItems = isGravityAdmin
    ? organizacoes.map((org: OrganizacaoShell) => ({
        id: org.id_organizacao,
        name: org.nome_organizacao,
        plan: org.subdominio_organizacao,
      }))
    : []

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN:       'Admin',
    MASTER:      'Master',
    PADRAO:      'Standard',
    FORNECEDOR:  'Fornecedor',
  }
  const userRole = ROLE_LABELS[dbRole ?? ''] ?? 'Standard'

  // ── Localizador ────────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('configurador')
  const [wsEcosystemNodes] = useState<EcosystemNode[]>(
    buildEcosystemNodes({ currentProductId: 'configurador' })
  )

  useEffect(() => {
    locAddEntry({ productId: 'configurador', productLabel: 'Configurador', productColor: '#7dd3fc', pageLabel: 'Configurador', pagePath: '/configurador' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [tipoEmpresa, setTipoEmpresa] = useState('')

  useEffect(() => {
    async function fetchTipoEmpresa() {
      try {
        const token = await getToken()
        const res = await fetch('/api/v1/organizacoes/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const { organizacao } = await res.json()
          setTipoEmpresa(organizacao?.tipo_organizacao ?? '')
        }
      } catch { /* silencioso */ }
    }
    fetchTipoEmpresa()
  }, [])

  // Handle frontend search filtering e estado foi movido para o componente CampoLocalizarExpandidoGlobal
  
  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  // Sincroniza desabilitação global de tooltips com o body
  useEffect(() => {
    if (tooltipsDisabled) {
      document.body.classList.add('tooltips-disabled')
    } else {
      document.body.classList.remove('tooltips-disabled')
    }
  }, [tooltipsDisabled])

  return (
    <div className="ws-shell">
      {/* ── Sidebar ── */}
      <MenuLateralGlobal
        tenantName={nomeOrganizacao}
        tenantPlan={isGravityAdmin ? 'Super Admin' : (currentUser?.nomeWorkspacePreferido ?? nomeOrganizacao)}
        navItems={navItems}
        moduleName={t('workspace.layout.modulo_nome')}
        moduleColor="#7dd3fc"
        defaultCollapsed={false}
        workspaces={isGravityAdmin ? orgWorkspaceItems : undefined}
        onSwitchWorkspace={isGravityAdmin ? handleTrocarOrganizacao : undefined}
        dropdownSearchPlaceholder={isGravityAdmin ? 'Buscar organização…' : undefined}
      />

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions (Floating over content, no bar) ── */}
        <div className="ws-global-actions">
          <HubBotao onClick={() => navigate('/hub?select=1')} />

          <CampoLocalizarExpandidoGlobal
            onBuscarNavigate={(term) => {
              const termLower = term.toLowerCase()
              const target = navItems.find(item => item.label.toLowerCase().includes(termLower))
              if (target) {
                navigate(target.to)
              }
            }}
          />

          {/* Theme button estava duplicado. Removido da barra, agora vive apenas no UX Dropdown */}

          {/* NOVO: Toggle de tooltips */}
          <TooltipGlobal
            titulo="Dicas e Explicações"
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
                  <span><strong style={{ color: '#f1f5f9' }}>Habilitadas</strong> — dicas aparecem ao passar o mouse</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                  <span><strong style={{ color: '#f1f5f9' }}>Desabilitadas</strong> — nenhuma dica é exibida</span>
                </span>
                <span style={{ marginTop: '0.15rem', color: '#64748b', fontSize: '0.7rem' }}>
                  Agora: <strong style={{ color: tooltipsDisabled ? '#f87171' : '#34d399' }}>
                    {tooltipsDisabled ? 'desabilitadas' : 'habilitadas'}
                  </strong>
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
            currentProductLabel="Configurador"
            currentProductColor="#7dd3fc"
            currentPageLabel={pageLabel}
            history={locHistory}
            nodes={wsEcosystemNodes}
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

          {/* Divisor visual */}
          <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRole}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            temAcessoTrocarOrganizacao={podeAtivarOverride}
            organizacaoOverrideAtiva={overrideAtivo}
            aoTrocarOrganizacao={() => setModalTrocarOrgAberto(true)}
            aoVoltarParaGravity={() => { limparOverride(); navigate('/hub') }}
            compact
          />
        </div>

        <WsAreaConteudo accentColor="#7dd3fc" area="configurador" />
      </div>

      <ModalTrocarOrganizacao
        aberto={modalTrocarOrgAberto}
        aoFechar={() => setModalTrocarOrgAberto(false)}
      />

      {/* ── Gabi IA Floating Panel ── */}
      {isGabiOpen && (
        <div className="ws-gabi-panel">
          <GabiChat onClose={() => setIsGabiOpen(false)} />
        </div>
      )}
      
      {!isGabiOpen && (
        <TooltipGlobal descricao="Falar com a Gabi IA">
          <button 
            className="ws-gabi-trigger" 
            onClick={() => setIsGabiOpen(true)}
          >
            <Sparkle weight="fill" size={28} />
          </button>
        </TooltipGlobal>
      )}

      {/* ── Notificações Globais ── */}
      <ToastContainer />
    </div>
  )
}

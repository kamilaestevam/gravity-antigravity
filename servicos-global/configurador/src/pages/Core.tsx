/**
 * Core.tsx — Tela principal do workspace após seleção
 *
 * Menu lateral com:
 *   - Meu Espaço (Dashboard, Atividades, Email, WhatsApp)
 *   - Produtos Gravity (dinamico baseado em produtos ativos)
 *   - Notificações, Histórico, Conector ERP, Configurações
 *
 * O conteúdo muda conforme a rota filha (Outlet).
 * Botão "← Hub" no header para voltar à seleção de workspace.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import {
  House,
  ListChecks,
  Envelope,
  WhatsappLogo,
  ShoppingBagOpen,
  Package,
  Bell,
  ClockCounterClockwise,
  Plug,
  GearSix,
  Folders,
  FileText,
  Sparkle,
  MagnifyingGlass,
  Info,
  Handshake,
} from '@phosphor-icons/react'
import { ehSlugProdutoBidFrete } from '../../shared/index.js'
import { iconeOficialBidFreteInternacional } from '../data/product-meta'
import { MenuLateralGlobal, type NavItem } from '@nucleo/menu-lateral-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { HubBotao } from '../components/HubBotao'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { buildTenantProductNodes } from '../utils/ecosystem-nodes'
import { produtosWorkspaceApi } from '../services/api-client'
import { temBypassPermissao } from '../../shared/index.js'
import {
  expandirCardsProdutosCore,
  ehSlugInfraProcessoCore,
  carregarPermissoesUsuarioWorkspace,
  type VarianteCardProdutoCore,
} from '../shared/entrada-produtos-core'
import { ToastContainer, useShellStore, useUserPreferences, useMeSync, useOrganizacaoOverride } from '@gravity/shell'
import { limparCacheTipoUsuario, useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { ModalTrocarOrganizacao } from '../components/modal-trocar-organizacao'
import './configurador/workspace.css'
import './configurador/gabi.css'

// Lazy-load componentes pesados — antes eram estáticos e bloqueavam o render do Core
const Notificacoes = React.lazy(() => import('../../../servicos-plataforma/notificacoes/src/Notificacoes').then(m => ({ default: m.Notificacoes })))
const GabiChat = React.lazy(() => import('@plataforma/gabi/src/Gabi'))

interface ProdutoAtivo {
  key: string
  nome: string
  slug: string
  rota: string
  variant: VarianteCardProdutoCore
}

export function Core() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, addNotification, currentUser } = useShellStore()

  useMeSync()

  const id_workspace = sessionStorage.getItem('gravity_company_id')
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'

  // ── Localizador ────────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('core')
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole, idUsuarioPrisma, pronto: tipoUsuarioPronto } = useCarregarTipoUsuario()
  const { podeAtivarOverride, overrideAtivo, limparOverride } = useOrganizacaoOverride()
  const [modalTrocarOrgAberto, setModalTrocarOrgAberto] = useState(false)
  useEffect(() => {
    locAddEntry({ productId: 'core', productLabel: 'Core', productColor: '#a78bfa', pageLabel: 'Core', pagePath: '/core' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nós do ecossistema — populados dinamicamente após carregar produtos
  const [coreEcosystemNodes, setCoreEcosystemNodes] = useState<EcosystemNode[]>(
    buildEcosystemNodes({ currentProductId: 'core', includeAdmin: false })
  )

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

  useUserPreferences({
    id_usuario: user?.id,
    id_organizacao: currentUser.idOrganizacao,
  })

  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutoAtivo[]>([])

  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  // Carregar produtos ativos do workspace
  useEffect(() => {
    if (!id_workspace) return
    async function loadProducts() {
      try {
        // Wrapper Zod-validado (REGRA 06 — sem cast direto da response)
        const data = await produtosWorkspaceApi.listar(id_workspace!)
        const allProds = data.products
        const ativosProdutos = allProds.filter(p => p.is_active)

        const bypass = tipoUsuarioPronto && temBypassPermissao({ tipo_usuario: dbRole })
        let permissoes: Set<string> | null = null
        if (tipoUsuarioPronto && !bypass && idUsuarioPrisma) {
          try {
            permissoes = await carregarPermissoesUsuarioWorkspace(getToken, idUsuarioPrisma, id_workspace!)
          } catch (errPerm) {
            console.warn('[Core] Falha ao carregar permissões do workspace:', errPerm)
          }
        }

        const cards = expandirCardsProdutosCore(ativosProdutos, permissoes, bypass, t)
        setProdutosAtivos(cards.map(c => ({
          key: c.key,
          nome: c.nome,
          slug: c.slug,
          rota: c.rota,
          variant: c.variant,
        })))
        // Mapa do ecossistema — usa builder único
        const productNodes = buildTenantProductNodes(allProds)
        setCoreEcosystemNodes(buildEcosystemNodes({
          currentProductId: 'core',
          produtoNodes: productNodes,
          includeAdmin: isGravityAdmin,
        }))
      } catch (err) {
        // REGRA 08 — log alto na falha (Opção B); não engole o erro com fallback silencioso
        console.warn('[Core] Falha ao carregar produtos do workspace:', err)
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('hub.erro_carregar_produtos') })
      }
    }
    loadProducts()
  }, [id_workspace, isGravityAdmin, idUsuarioPrisma, dbRole, tipoUsuarioPronto, getToken, t])

  // Menu lateral
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = []

    // Meu Espaço
    items.push({
      label: t('shell.menu.meu_espaco'),
      icon: <House weight="duotone" size={18} />,
      children: [
        { to: '/core', label: t('hub.seus_processos', 'Seus processos'), icon: <Folders weight="duotone" size={18} /> },
        { to: '/core/atividades', label: t('shell.menu.minhas_atividades'), icon: <ListChecks weight="duotone" size={18} /> },
        { to: '/core/email', label: t('shell.menu.email'), icon: <Envelope weight="duotone" size={18} /> },
        { to: '/core/whatsapp', label: t('shell.menu.whatsapp'), icon: <WhatsappLogo weight="duotone" size={18} /> },
      ],
    })

    const navMeusProdutos = produtosAtivos.filter(p => p.variant !== 'bid_fornecedor' && !ehSlugInfraProcessoCore(p.slug))
    const navComoFornecedor = produtosAtivos.filter(p => p.variant === 'bid_fornecedor')

    if (produtosAtivos.length > 0) {
      if (navMeusProdutos.length > 0) {
        items.push({
          label: t('hub.produtos_workspace', 'Produtos do workspace'),
          sectionDivider: true,
          icon: <ShoppingBagOpen weight="duotone" size={18} />,
        })
        for (const prod of navMeusProdutos) {
          items.push({
            to: prod.rota,
            label: prod.nome,
            icon: ehSlugProdutoBidFrete(prod.slug)
              ? iconeOficialBidFreteInternacional(18)
              : <Package weight="duotone" size={18} />,
          })
        }
      }

      if (navComoFornecedor.length > 0) {
        items.push({
          label: t('hub.zona_como_fornecedor', 'Como fornecedor'),
          sectionDivider: true,
          icon: <Handshake weight="duotone" size={18} />,
        })
        for (const prod of navComoFornecedor) {
          items.push({
            to: prod.rota,
            label: prod.nome,
            icon: iconeOficialBidFreteInternacional(18),
          })
        }
      }
    } else {
      items.push({
        label: t('shell.menu.produtos_gravity'),
        sectionDivider: true,
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })
      items.push({
        to: '/store',
        label: t('hub.explorar_catalogo'),
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })
    }

    // Divisor
    items.push({ label: '', sectionDivider: true, icon: null })

    // Notificações
    items.push({
      to: '/core/notificacoes',
      label: t('shell.menu.notificacoes'),
      icon: <Bell weight="duotone" size={18} />,
    })

    // Historico — item removido em 2026-05-07. Acesso ao historico de auditoria
    // do cliente fica em /workspace/historico-organizacao (rota canonica para
    // Master/Standard/Fornecedor). Admins Gravity usam /admin/historico-global.

    // Conector ERP
    items.push({
      to: '/core/conector-erp',
      label: t('shell.menu.conector_erp'),
      icon: <Plug weight="duotone" size={18} />,
    })

    // Configurações
    items.push({
      to: '/core/configuracoes',
      label: t('shell.menu.configuracoes'),
      icon: <GearSix weight="duotone" size={18} />,
    })

    return items
  }, [produtosAtivos])

  // Theme sync — força o tema correto ao montar
  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  useEffect(() => {
    document.body.classList.toggle('tooltips-disabled', tooltipsDisabled)
  }, [tooltipsDisabled])

  // Se não selecionou workspace, volta ao Hub (após todos os hooks)
  if (!id_workspace) {
    return <Navigate to="/hub" replace />
  }

  return (
    <div className="ws-shell">
      {/* ── Menu Lateral ── */}
      <MenuLateralGlobal
        tenantName={companyName}
        tenantPlan={currentUser?.nomeOrganizacao ?? ''}
        navItems={navItems}
        moduleName="Core"
        moduleColor="#818cf8"
        defaultCollapsed={false}
      />

      {/* ── Área principal ── */}
      <div className="ws-main">
        {/* ── Header ── */}
        <div className="ws-global-actions">
          {/* ?select=1: escape hatch que força SelecionarWorkspace mesmo com workspace preferido */}
          <HubBotao onClick={() => navigate('/hub?select=1')} tooltip={t('shell.voltar_hub')} />

          <CampoLocalizarExpandidoGlobal
            onBuscarNavigate={(term) => {
              const termLower = term.toLowerCase()
              const flat = navItems.flatMap(i => i.children ? i.children : [i])
              const target = flat.find(item => item.label?.toLowerCase().includes(termLower))
              if (target?.to) navigate(target.to)
            }}
          />

          <TooltipGlobal titulo={t('shell.label_habilitar_dicas')} descricao={tooltipsDisabled ? t('shell.habilitar_dicas') : t('shell.desabilitar_dicas')}>
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          {/* Localizador — Onde estou */}
          <LocalizadorGlobal
            workspaceName={companyName}
            currentProductId="core"
            currentProductLabel="Core"
            currentProductColor="#a78bfa"
            currentPageLabel="Core"
            history={locHistory}
            nodes={coreEcosystemNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub?select=1')
              else if (node.type === 'configurador') navigate('/configurador')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
          />

          <SeletorIdiomaGlobal />

          <React.Suspense fallback={null}>
            <Notificacoes />
          </React.Suspense>

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={currentUser.role ?? t('shell.papel_membro')}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => {
              limparCacheTipoUsuario()
              sessionStorage.removeItem('gravity_company_id')
              sessionStorage.removeItem('gravity_company_name')
              signOut()
            }}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            onNavigateConfigurador={() => navigate('/configurador/workspaces')}
            temAcessoTrocarOrganizacao={podeAtivarOverride}
            organizacaoOverrideAtiva={overrideAtivo}
            aoTrocarOrganizacao={() => setModalTrocarOrgAberto(true)}
            aoVoltarParaGravity={() => { limparOverride(); navigate('/hub') }}
            compact
          />
        </div>
        <ModalTrocarOrganizacao
          aberto={modalTrocarOrgAberto}
          aoFechar={() => setModalTrocarOrgAberto(false)}
        />

        {/* ── Conteúdo ── */}
        <div className="ws-content">
          <Outlet />
        </div>
      </div>

      {/* ── Gabi IA ── */}
      {isGabiOpen && (
        <div className="ws-gabi-panel">
          <React.Suspense fallback={null}>
            <GabiChat onClose={() => setIsGabiOpen(false)} />
          </React.Suspense>
        </div>
      )}

      {!isGabiOpen && (
        <TooltipGlobal descricao={t('shell.menu.gabi')}>
          <button className="ws-gabi-trigger" onClick={() => setIsGabiOpen(true)}>
            <Sparkle weight="fill" size={28} />
          </button>
        </TooltipGlobal>
      )}

      <ToastContainer />
    </div>
  )
}

export default Core

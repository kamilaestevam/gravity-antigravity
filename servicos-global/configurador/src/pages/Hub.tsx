import React, { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useTranslation } from 'react-i18next'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Gear,
  Sparkle,
  ChartBar,
  Rocket,
  CheckCircle,
  WarningCircle,
  Info,
  CalendarBlank,
} from '@phosphor-icons/react'
import './hub-store.css'
import './hub.css'
import { useShellStore, useOrganizacaoOverride, useMeSync, useShellBodyClasses } from '@gravity/shell'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { produtosWorkspaceApi, type ProdutoWorkspaceItem } from '../services/api-client'
import { ModalTrocarOrganizacao } from '../components/modal-trocar-organizacao'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import {
  LogoHub,
  visualProdutoGravityHub,
  visualProdutoGravityFallback,
} from '@nucleo/logo-produtos'
import { resolverProdVisualHub } from '../utils/resolver-prod-visual-hub'
import { temBypassPermissao } from '../../shared/index.js'
import {
  expandirCardsProdutosCore,
  agruparCardsProdutosCore,
  temDuasZonasProdutosCore,
  carregarPermissoesUsuarioWorkspace,
  type CardProdutoCoreExibicao,
} from '../shared/entrada-produtos-core'
import { GradeProdutosCore } from '../components/grade-produtos-core'
import { ListaProcessosCore, type ProcessoCoreResumo } from '../components/lista-processos-core'
import { LogoGlobal } from '@nucleo/logo-global'
import {
  LocalizadorGlobal,
  useLocalizadorHistory,
  buildEcosystemNodes,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { Notificacoes } from '@gravity/shell'

// Tipo dos produtos vem do api-client (Zod-validado, contrato bilateral REGRA 09)

// ── Mapa visual por produto ────────────────────────────────────────────────
interface ProdVisual {
  color: string
  dim: string
  icon: React.ReactNode
  description: string
}

function prodVisualEntry(slug: string, description: string): ProdVisual {
  return {
    ...visualProdutoGravityHub(slug),
    description,
  }
}

const getProdVisual = (t: (key: string) => string): Record<string, ProdVisual> => ({
  'simula-custo': prodVisualEntry('simula-custo', t('hub.produto_visual_simula_custo')),
  'nf-importacao': prodVisualEntry('nf-importacao', t('hub.produto_visual_nf_importacao')),
  'nf-import': prodVisualEntry('nf-importacao', t('hub.produto_visual_nf_importacao')),
  'processo': prodVisualEntry('processo', t('hub.produto_visual_processo')),
  'bid-frete': prodVisualEntry('bid-frete', t('hub.produto_visual_bid_frete')),
  'bid-frete-internacional': prodVisualEntry('bid-frete-internacional', t('hub.produto_visual_bid_frete')),
  'bid-cambio': prodVisualEntry('bid-cambio', t('hub.produto_visual_bid_cambio')),
  'pedido': prodVisualEntry('pedido', t('hub.produto_visual_pedido')),
  'smart-read': prodVisualEntry('smart-read', t('hub.produto_visual_smart_read')),
})

const getDefaultVisual = (t: (key: string) => string): ProdVisual => ({
  ...visualProdutoGravityFallback(24),
  description: t('hub.produto_visual_default'),
})

// ── Dados mock para KPIs e atividade (substituir por API futuramente) ───────
const getMockActivity = (t: (key: string, fallback?: string) => string) => [
  { id: 'a1', color: '#818cf8', text: <><strong>IMP-2026/0150</strong> {t('hub.mock_avancou_embarque', 'avançou para Embarque')}</>,          time: t('hub.mock_ha_23_min', 'há 23 min') },
  { id: 'a2', color: '#34d399', text: <><strong>EST-0412</strong> {t('hub.mock_estimativa_sucesso', 'estimativa calculada com sucesso')}</>,    time: t('hub.mock_ha_1_hora', 'há 1 hora') },
  { id: 'a3', color: '#fbbf24', text: <><strong>NF 000.234</strong> {t('hub.mock_aguarda_sefaz', 'aguarda aprovação SEFAZ')}</>,           time: t('hub.mock_ha_2_horas', 'há 2 horas') },
  { id: 'a4', color: '#818cf8', text: <><strong>BL_MSKU1234567.pdf</strong> {t('hub.mock_documento_enviado', 'documento enviado')}</>,         time: t('hub.mock_ha_3_horas', 'há 3 horas') },
  { id: 'a5', color: '#f472b6', text: <><strong>Maria S.</strong> {t('hub.mock_adicionada_workspace', 'adicionada ao workspace')}</>,             time: t('hub.mock_ontem_1742', 'ontem, 17:42') },
  { id: 'a6', color: '#34d399', text: <><strong>IMP-2026/0148</strong> {t('hub.mock_concluido_entrega', 'concluído — Entrega realizada')}</>,  time: t('hub.mock_ontem_1410', 'ontem, 14:10') },
]

const getMockProcesses = (t: (key: string, fallback?: string) => string): ProcessoCoreResumo[] => [
  {
    id: 'p1',
    num: 'IMP-2026/0150',
    name: 'Acme Importações · Shanghai Electronics',
    sub: 'US$ 108.050 · 18.771 kg · CIF · Marítima',
    badge: t('hub.mock_badge_embarque', 'Embarque'),
    badgeCls: 'hb-proc-badge--em-andamento',
    etapas: [1, 1, 1, 2, 0, 0],
    plugins: [
      { key: 'pedido', label: '3 PO', status: 'ok' },
      { key: 'bid', label: '1 BID', status: 'ok' },
      { key: 'nf', label: 'NF ⚠', status: 'warn' },
      { key: 'fin', label: 'Fin ✓', status: 'ok' },
    ],
  },
  {
    id: 'p2',
    num: 'IMP-2026/0149',
    name: 'Acme Importações · Korea Tech Ltd.',
    sub: 'US$ 54.200 · 8.400 kg · FOB · Aérea',
    badge: t('hub.mock_badge_desembaraco', 'Desembaraço'),
    badgeCls: 'hb-proc-badge--desembaraco',
    etapas: [1, 1, 1, 1, 2, 0],
    plugins: [
      { key: 'pedido', label: '2 PO', status: 'ok' },
      { key: 'bid', label: '1 BID', status: 'ok' },
      { key: 'nf', label: 'NF ✓', status: 'ok' },
      { key: 'fin', label: 'Fin ⚠', status: 'warn' },
    ],
  },
  {
    id: 'p3',
    num: 'IMP-2026/0148',
    name: 'Acme Importações · Vietnam Goods SA',
    sub: 'US$ 32.900 · 5.100 kg · EXW · Marítima',
    badge: t('hub.mock_badge_entregue', 'Entregue ✓'),
    badgeCls: 'hb-proc-badge--concluido',
    etapas: [1, 1, 1, 1, 1, 1],
    plugins: [
      { key: 'pedido', label: '1 PO', status: 'ok' },
      { key: 'bid', label: '1 BID', status: 'ok' },
      { key: 'nf', label: 'NF ✓', status: 'ok' },
      { key: 'fin', label: 'Fin ✓', status: 'ok' },
    ],
  },
]

const hubOperacoesResumoSchema = z.object({
  processos_em_andamento: z.number(),
  aguardando_acao: z.number(),
  notas_fiscais_pendentes: z.number(),
  processos_hoje: z.number(),
  processos: z.array(z.object({
    id: z.string(),
    id_processo: z.string(),
    nome: z.string(),
    detalhe: z.string(),
    badge: z.string(),
    badge_variant: z.enum(['embarque', 'desembaraco']),
  })),
  produtos_contratados: z.array(z.string()).default([]),
  fontes_respondidas: z.array(z.string()).default([]),
  fontes_disponiveis: z.array(z.string()).default([]),
  pendencias_por_produto: z.array(z.object({
    produto: z.string(),
    quantidade: z.number(),
  })).default([]),
})

// ── Helpers ────────────────────────────────────────────────────────────────
function getGreeting(name: string, t: (key: string) => string): string {
  const h = new Date().getHours()
  const saudacao = h < 12 ? t('hub.bom_dia') : h < 18 ? t('hub.boa_tarde') : t('hub.boa_noite')
  return `${saudacao}, ${name}`
}

function formatDate(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Componente ─────────────────────────────────────────────────────────────
export function Hub() {
  const { t } = useTranslation()
  const prodVisual = getProdVisual(t)
  const defaultVisual = getDefaultVisual(t)
  const addNotification = useShellStore((s) => s.addNotification)
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, currentUser } = useShellStore()
  const allowedProducts = useShellStore((s) => s.allowedProducts) ?? []

  useShellBodyClasses()

  const [products, setProducts] = useState<ProdutoWorkspaceItem[]>([])
  const [loading, setLoading] = useState(true)

  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [cardsCore, setCardsCore] = useState<CardProdutoCoreExibicao[]>([])
  const { gravityAdmin: isAdmin, tipoUsuario: dbRole, idUsuarioPrisma, pronto: tipoUsuarioPronto } = useCarregarTipoUsuario()
  // Popula currentUser.tipoUsuario no ShellStore (consumido por
  // useOrganizacaoOverride — Pendência #4). Sem isso, /hub acessado
  // direto pós-login deixa o store vazio e o item "Trocar Organização"
  // não renderiza para SUPER_ADMIN/ADMIN.
  useMeSync()
  const { podeAtivarOverride, overrideAtivo, limparOverride } = useOrganizacaoOverride()
  const [modalTrocarOrgAberto, setModalTrocarOrgAberto] = useState(false)

  const id_workspace   = sessionStorage.getItem('gravity_company_id')
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'
  const userName      = currentUser.name || user?.fullName || user?.firstName || 'Usuário'
  const userEmail     = currentUser.email || user?.primaryEmailAddress?.emailAddress || ''
  const userInitials  = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const isLight       = currentTheme === 'light'
  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: t('hub.role_super_admin', 'Super Admin'),
    ADMIN:       t('hub.role_admin', 'Admin'),
    MASTER:      t('hub.role_master', 'Master'),
    PADRAO:      t('hub.role_standard', 'Standard'),
    FORNECEDOR:  t('hub.role_fornecedor', 'Fornecedor'),
  }
  const userRole = ROLE_LABELS[dbRole ?? ''] ?? t('hub.role_standard', 'Standard')

  // Carrega produtos ativos do workspace
  useEffect(() => {
    async function loadProducts() {
      if (!id_workspace) { setLoading(false); return }

      try {
        // Wrapper Zod-validado (REGRA 06 — sem cast direto da response)
        const data = await produtosWorkspaceApi.listar(id_workspace)
        const active = data.products.filter((p) => p.is_active)

        // Empty state quando nenhum produto está habilitado neste workspace.
        // Habilitação é manual via /workspace/assinaturas (sem auto-bootstrap).
        setProducts(active)

        const bypass = tipoUsuarioPronto && temBypassPermissao({ tipo_usuario: dbRole })
        let permissoes: Set<string> | null = null
        if (tipoUsuarioPronto && !bypass && idUsuarioPrisma) {
          try {
            permissoes = await carregarPermissoesUsuarioWorkspace(getToken, idUsuarioPrisma, id_workspace)
          } catch (errPerm) {
            console.warn('[Hub] Falha ao carregar permissões do workspace:', errPerm)
          }
        }
        setCardsCore(expandirCardsProdutosCore(active, permissoes, bypass, t))
      } catch (err) {
        // REGRA 08 — log alto na falha (Opção B); não engole o erro com fallback silencioso
        console.warn('[Hub] Falha ao carregar produtos do workspace:', err)
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('hub.erro_carregar_produtos') })
        setCardsCore([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [id_workspace, idUsuarioPrisma, dbRole, tipoUsuarioPronto, getToken, addNotification, t])

  const handleOpenProduct = (rota: string) => {
    if (rota.startsWith('/bid-frete-internacional/visao-fornecedor')) {
      window.location.href = rota
      return
    }
    navigate(rota)
  }

  const activeCount = cardsCore.length
  const grupoCards = useMemo(() => agruparCardsProdutosCore(cardsCore), [cardsCore])
  const duasZonasProdutos = temDuasZonasProdutosCore(grupoCards)

  const [hubOperacoes, setHubOperacoes] = useState<z.infer<typeof hubOperacoesResumoSchema>>({
    processos_em_andamento: 0,
    aguardando_acao: 0,
    notas_fiscais_pendentes: 0,
    processos_hoje: 0,
    processos: [],
    fontes_disponiveis: [],
    produtos_contratados: [],
    fontes_respondidas: [],
    pendencias_por_produto: [],
  })

  useEffect(() => {
    if (!tipoUsuarioPronto) return
    let cancelled = false

    async function carregarOperacoes() {
      try {
        const token = await getToken()
        if (!token || cancelled) return
        const res = await fetch('/api/v1/hub/operacoes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok || cancelled) return
        const raw: unknown = await res.json()
        const parsed = z.object({ operacoes: hubOperacoesResumoSchema }).safeParse(raw)
        if (parsed.success && !cancelled) setHubOperacoes(parsed.data.operacoes)
      } catch {
        // mantém zeros — resiliente
      }
    }

    carregarOperacoes()
    return () => { cancelled = true }
  }, [tipoUsuarioPronto, getToken])

  const processosCore = useMemo<ProcessoCoreResumo[]>(
    () =>
      hubOperacoes.processos.map((proc) => ({
        id: proc.id_processo,
        num: proc.detalhe.split(' · ')[0] ?? proc.detalhe,
        name: proc.nome,
        sub: proc.detalhe,
        badge: proc.badge,
        badgeCls: proc.badge_variant === 'desembaraco'
          ? 'hb-proc-badge--desembaraco'
          : 'hb-proc-badge--em-andamento',
        etapas: [],
        plugins: [],
      })),
    [hubOperacoes.processos],
  )

  const textoHeroProcessos = t(
    'hub.hero_processos',
    '{{ativos}} processos em andamento · {{pendentes}} aguardando ação · {{plugins}} produtos no workspace',
    {
      ativos: hubOperacoes.processos_em_andamento,
      pendentes: hubOperacoes.aguardando_acao,
      plugins: activeCount,
    },
  )

  const abrirProcesso = (idProcesso: string) => {
    const qs = new URLSearchParams({ id: idProcesso })
    navigate(`/processo/detalhe/workflow?${qs.toString()}`)
  }

  // ── Localizador — nós do ecossistema ──────────────────────────────────────
  const { history, addEntry } = useLocalizadorHistory('hub')

  const produtoNodes: EcosystemNode[] = cardsCore.map(card => {
    const v = resolverProdVisualHub(card.slug, prodVisual, defaultVisual, card.produto.product_key)
    return {
      id:       card.key,
      label:    card.nome,
      sublabel: 'produto',
      color:    v.color,
      type:     'produto',
      status:   allowedProducts.some(a => a.product_key === card.produto.product_key && a.is_active) ? 'accessible' : 'locked',
    }
  })

  const ecosystemNodes = buildEcosystemNodes({
    currentProductId: 'hub',
    produtoNodes,
    includeAdmin: isAdmin,
  })

  return (
    <div className="hb-shell">

      {/* ── Topbar ── */}
      <header className="hb-topbar">
        <div className="hb-topbar-left">
          <div className="hb-logo">
            <LogoGlobal iconSize={22} iconColor="#818cf8" />
          </div>
          <div className="hb-topbar-div" />
          <span className="hb-topbar-label">Core</span>
        </div>

        <div className="hb-topbar-right">
          {/* Atalhos de navegação rápida */}
          <button
            className="hb-topbar-navlink"
            type="button"
            title={t('hub.titulo_selecionar_workspace', 'Hub — Selecionar Workspace')}
            onClick={() => navigate('/hub?select=1')}
          >
            <LogoHub size={13} color="#818cf8" />
            Hub
          </button>

          <div className="hb-topbar-sep" />

          <button className="hb-topbar-btn" type="button" title={t('comum.buscar')}>
            <MagnifyingGlass weight="bold" size={16} />
          </button>

          <div className="hb-notif-wrap">
            <Notificacoes />
          </div>

          {/* Tooltip toggle */}
          <button
            className="hb-topbar-btn"
            type="button"
            title={tooltipsDisabled ? t('shell.label_habilitar_dicas') : t('shell.label_desabilitar_dicas')}
            onClick={toggleTooltips}
            style={{ color: tooltipsDisabled ? 'var(--hb-muted)' : 'var(--hb-accent)' }}
          >
            <Info weight={tooltipsDisabled ? 'regular' : 'fill'} size={16} />
          </button>

          {/* Localizador — ecosistema */}
          <LocalizadorGlobal
            workspaceName={companyName}
            iconOnly
            currentProductId="hub"
            currentProductLabel="Hub"
            currentProductColor="#818cf8"
            currentPageLabel="Hub"
            history={history}
            nodes={ecosystemNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub?select=1')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'configurador') navigate('/configurador')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
          />

          {/* Seletor de idioma */}
          <SeletorIdiomaGlobal iconOnly />

          <div className="hb-topbar-sep" />

          <button
            className="hb-topbar-btn"
            type="button"
            title={t('workspace.layout.modulo_nome')}
            onClick={() => navigate('/configurador')}
          >
            <Gear weight="duotone" size={16} />
          </button>

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRole}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => {
              sessionStorage.removeItem('gravity_company_id')
              sessionStorage.removeItem('gravity_company_name')
              signOut(() => navigate('/'))
            }}
            isAdmin={isAdmin}
            onNavigateAdmin={() => navigate('/admin')}
            temAcessoTrocarOrganizacao={podeAtivarOverride}
            organizacaoOverrideAtiva={overrideAtivo}
            aoTrocarOrganizacao={() => setModalTrocarOrgAberto(true)}
            aoVoltarParaGravity={() => { limparOverride(); navigate('/hub') }}
            compact
          />
        </div>
      </header>
      <ModalTrocarOrganizacao
        aberto={modalTrocarOrgAberto}
        aoFechar={() => setModalTrocarOrgAberto(false)}
      />

      {/* ── Content ── */}
      <div className="hb-content">

        {/* Hero */}
        <div className="hb-hero hb-d1">
          <div>
            <h1>{getGreeting(userName, t).split(',')[0]}, <span>{userName}</span> 👋</h1>
            <p className="hb-hero-sub">
              {companyName}&nbsp;·&nbsp;{textoHeroProcessos}
            </p>
          </div>
          <div className="hb-hero-meta">
            <span className="hb-hero-date">
              <CalendarBlank size={14} weight="duotone" aria-hidden="true" />
              {formatDate()}
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="hb-kpi-row hb-d2">
          <div className="hb-kpi" style={{ '--hb-kpi-color': '#818cf8', '--hb-kpi-dim': 'rgba(129,140,248,0.12)' } as React.CSSProperties}>
            <div className="hb-kpi-top">
              <div className="hb-kpi-icon"><Package weight="duotone" size={18} /></div>
              <span className="hb-kpi-delta hb-kpi-delta--up">▲ {t('hub.kpi_delta_2_hoje', '2 hoje')}</span>
            </div>
            <div>
              <div className="hb-kpi-value">7</div>
              <div className="hb-kpi-label">{t('hub.kpi_processos', 'Processos em andamento')}</div>
            </div>
          </div>

          <div className="hb-kpi" style={{ '--hb-kpi-color': '#14b8a6', '--hb-kpi-dim': 'rgba(20,184,166,0.12)' } as React.CSSProperties}>
            <div className="hb-kpi-top">
              <div className="hb-kpi-icon"><WarningCircle weight="duotone" size={18} /></div>
              <span className="hb-kpi-delta hb-kpi-delta--warn">⚠ {t('hub.kpi_delta_3_pendentes', '3 pendentes')}</span>
            </div>
            <div>
              <div className="hb-kpi-value">3</div>
              <div className="hb-kpi-label">{t('hub.kpi_aguardando_acao', 'Aguardando ação')}</div>
            </div>
          </div>

          <div className="hb-kpi" style={{ '--hb-kpi-color': '#f59e0b', '--hb-kpi-dim': 'rgba(245,158,11,0.12)' } as React.CSSProperties}>
            <div className="hb-kpi-top">
              <div className="hb-kpi-icon"><FileText weight="duotone" size={18} /></div>
              <span className="hb-kpi-delta hb-kpi-delta--warn">⚠ {t('hub.kpi_delta_3_pendentes', '3 pendentes')}</span>
            </div>
            <div>
              <div className="hb-kpi-value">12</div>
              <div className="hb-kpi-label">{t('hub.kpi_notas', 'NFs de importação')}</div>
            </div>
          </div>

          <div className="hb-kpi" style={{ '--hb-kpi-color': '#ec4899', '--hb-kpi-dim': 'rgba(236,72,153,0.12)' } as React.CSSProperties}>
            <div className="hb-kpi-top">
              <div className="hb-kpi-icon"><Sparkle weight="duotone" size={18} /></div>
              <span className="hb-kpi-delta hb-kpi-delta--up">▲ {t('hub.kpi_delta_ativo', 'ativo')}</span>
            </div>
            <div>
              <div className="hb-kpi-value">91%</div>
              <div className="hb-kpi-label">{t('hub.kpi_gabi', 'Assertividade da Gabi IA')}</div>
            </div>
          </div>
        </div>

        {/* Dossiês — protagonista do Core (infra, não produto) */}
        <div className="hb-d3">
          <ListaProcessosCore
            processos={processosCore}
            onAbrirProcesso={abrirProcesso}
            onNovoProcesso={() => abrirProcesso('p1')}
            t={t}
          />
        </div>

        {/* Produtos (plugins) + Atividade */}
        <div className="hb-two-col hb-two-col--secundaria hb-d4">

          {/* Produtos — plugins contratados, sem Processo */}
          <div className="hb-produtos-secundarios">
            <div className="hb-section-actions">
              <span className="hb-section-heading hb-section-heading--muted">
                {duasZonasProdutos
                  ? t('hub.produtos_workspace', 'Produtos do workspace')
                  : t('hub.produtos_workspace', 'Produtos do workspace')}
              </span>
              <button className="hb-section-link hb-section-link--store" type="button" onClick={() => navigate('/store')}>
                {t('hub.ir_para_store')} →
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', minHeight: 200 }}>
                <GravityLoader texto="Carregando" tamanho="md" />
              </div>
            ) : cardsCore.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem 0', minHeight: 200, color: 'var(--hb-muted)', fontSize: '0.875rem' }}>
                <Rocket weight="duotone" size={48} color="var(--hb-muted)" />
                <p style={{ textAlign: 'center', maxWidth: 320 }}>{t('hub.empty_desc', { nome: companyName })}</p>
                <button className="hb-gabi-btn" type="button" onClick={() => navigate('/store')}>
                  {t('hub.explorar_catalogo')}
                </button>
              </div>
            ) : (
              <GradeProdutosCore
                cards={cardsCore}
                prodVisual={prodVisual}
                defaultVisual={defaultVisual}
                onAbrirProduto={handleOpenProduct}
                t={t}
                compact
              />
            )}
          </div>

          {/* Atividade recente */}
          <div>
            <div className="hb-section-title">{t('hub.atividade_recente', 'Atividade recente')}</div>
            <div className="hb-activity">
              <div className="hb-activity-header">
                <span className="hb-activity-title">{t('hub.ultimas_atualizacoes', 'Últimas atualizações')}</span>
                <button className="hb-section-link" type="button">{t('hub.ver_tudo', 'ver tudo')} →</button>
              </div>
              {getMockActivity(t).map(a => (
                <div key={a.id} className="hb-activity-item">
                  <div className="hb-act-dot" style={{ background: a.color }} />
                  <div>
                    <div className="hb-act-text">{a.text}</div>
                    <div className="hb-act-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gabi */}
        <div className="hb-gabi hb-d5" onClick={() => {}}>
          <div className="hb-gabi-left">
            <div className="hb-gabi-icon">
              <Sparkle weight="fill" size={20} />
            </div>
            <div>
              <span className="hb-gabi-title">{t('hub.gabi_header', 'Gabi IA está disponível')}</span>
              <span className="hb-gabi-sub">{t('hub.gabi_texto', 'Pergunte sobre processos, custos, legislação aduaneira ou análises')}</span>
            </div>
          </div>
          <button className="hb-gabi-btn" type="button">
            {t('hub.falar_gabi', 'Falar com a Gabi')} →
          </button>
        </div>

      </div>
    </div>
  )
}

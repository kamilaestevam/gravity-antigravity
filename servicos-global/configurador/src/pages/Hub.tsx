import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useClerk, useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  SpinnerGap,
  ArrowUpRight,
  Gear,
  Sparkle,
  Calculator,
  FileText,
  ArrowsClockwise,
  Truck,
  CurrencyDollar,
  ClipboardText,
  Package,
  Bell,
  MagnifyingGlass,
  ChartBar,
  Rocket,
  CheckCircle,
  WarningCircle,
  Info,
} from '@phosphor-icons/react'
import './hub-store.css'
import './hub.css'
import { useShellStore } from '@gravity/shell'
import { useLoadSystemRole } from '../hooks/useLoadSystemRole'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import { LogoHub } from '@nucleo/logo-produtos'
import { LogoGlobal } from '@nucleo/logo-global'
import {
  LocalizadorGlobal,
  useLocalizadorHistory,
  buildEcosystemNodes,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'

const API_URL = '/api/v1'

interface CompanyProduct {
  product_key: string
  is_active: boolean
  catalog: {
    id: string
    name: string
    slug: string
    description: string | null
    backend_module: string | null
  } | null
}

// ── Mapa visual por produto ────────────────────────────────────────────────
interface ProdVisual {
  color: string
  dim: string
  icon: React.ReactNode
  description: string
}

const getProdVisual = (t: (key: string) => string): Record<string, ProdVisual> => ({
  'simula-custo': {
    color: '#818cf8',
    dim: 'rgba(129,140,248,0.12)',
    icon: <Calculator weight="duotone" size={22} />,
    description: t('hub.produto_visual_simula_custo'),
  },
  'nf-importacao': {
    color: '#f59e0b',
    dim: 'rgba(245,158,11,0.12)',
    icon: <FileText weight="duotone" size={22} />,
    description: t('hub.produto_visual_nf_importacao'),
  },
  'processo': {
    color: '#14b8a6',
    dim: 'rgba(20,184,166,0.12)',
    icon: <ArrowsClockwise weight="duotone" size={22} />,
    description: t('hub.produto_visual_processo'),
  },
  'bid-frete': {
    color: '#ec4899',
    dim: 'rgba(236,72,153,0.12)',
    icon: <Truck weight="duotone" size={22} />,
    description: t('hub.produto_visual_bid_frete'),
  },
  'bid-cambio': {
    color: '#38bdf8',
    dim: 'rgba(56,189,248,0.12)',
    icon: <CurrencyDollar weight="duotone" size={22} />,
    description: t('hub.produto_visual_bid_cambio'),
  },
  'lpco': {
    color: '#a78bfa',
    dim: 'rgba(167,139,250,0.12)',
    icon: <ClipboardText weight="duotone" size={22} />,
    description: t('hub.produto_visual_lpco'),
  },
})

const getDefaultVisual = (t: (key: string) => string): ProdVisual => ({
  color: '#6366f1',
  dim: 'rgba(99,102,241,0.12)',
  icon: <Package weight="duotone" size={22} />,
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

const getMockProcesses = (t: (key: string, fallback?: string) => string) => [
  { id: 'p1', num: 'IMP-2026/0150', name: 'Acme Importações · Shanghai Electronics', sub: 'US$ 108.050 · 18.771 kg · CIF · Marítima', badge: t('hub.mock_badge_embarque', 'Embarque'),       badgeCls: 'hb-proc-badge--em-andamento', etapas: [1,1,1,2,0,0] },
  { id: 'p2', num: 'IMP-2026/0149', name: 'Acme Importações · Korea Tech Ltd.',       sub: 'US$ 54.200 · 8.400 kg · FOB · Aérea',     badge: t('hub.mock_badge_desembaraco', 'Desembaraço'), badgeCls: 'hb-proc-badge--desembaraco',  etapas: [1,1,1,1,2,0] },
  { id: 'p3', num: 'IMP-2026/0148', name: 'Acme Importações · Vietnam Goods SA',      sub: 'US$ 32.900 · 5.100 kg · EXW · Marítima',  badge: t('hub.mock_badge_entregue', 'Entregue ✓'),    badgeCls: 'hb-proc-badge--concluido',   etapas: [1,1,1,1,1,1] },
]

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
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()
  const allowedProducts = useShellStore((s) => s.allowedProducts) ?? []

  useEffect(() => {
    document.body.classList.toggle('light-theme', currentTheme === 'light')
  }, [currentTheme])

  const [products, setProducts] = useState<CompanyProduct[]>([])
  const [loading, setLoading] = useState(true)

  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const { isGravityAdmin: isAdmin, role: dbRole } = useLoadSystemRole()

  const companyId   = sessionStorage.getItem('gravity_company_id')
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'
  const userName      = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userEmail     = user?.primaryEmailAddress?.emailAddress ?? ''
  const userInitials  = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const isLight       = currentTheme === 'light'
  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: t('hub.role_super_admin', 'Super Admin'),
    ADMIN:       t('hub.role_admin', 'Admin'),
    MASTER:      t('hub.role_master', 'Master'),
    STANDARD:    t('hub.role_standard', 'Standard'),
    SUPPLIER:    t('hub.role_fornecedor', 'Fornecedor'),
  }
  const userRole = ROLE_LABELS[dbRole ?? ''] ?? t('hub.role_standard', 'Standard')

  // Carrega produtos ativos do workspace
  useEffect(() => {
    async function loadProducts() {
      if (!companyId) { setLoading(false); return }

      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/companies/${companyId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          const active = data.products.filter((p: CompanyProduct) => p.is_active)

          if (active.length > 0) {
            setProducts(active)
          } else {
            // Auto-habilita produtos do tenant nesta company
            const tenantRes = await fetch(`${API_URL}/tenants/products`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (tenantRes.ok) {
              const tenantData = await tenantRes.json()
              const tenantActive = (tenantData.products as CompanyProduct[] | undefined)?.filter(p => p.is_active) ?? []

              for (const tp of tenantActive) {
                await fetch(`${API_URL}/companies/${companyId}/products`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ product_key: tp.product_key }),
                }).catch(() => {})
              }

              if (tenantActive.length > 0) {
                const refresh = await fetch(`${API_URL}/companies/${companyId}/products`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                if (refresh.ok) {
                  const d = await refresh.json()
                  setProducts(d.products.filter((p: CompanyProduct) => p.is_active))
                }
              }
            }
          }
        }
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('hub.erro_carregar_produtos') })
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [companyId])

  const handleOpenProduct = (slug: string) => navigate(`/produto/${slug}`)

  const activeCount = products.length

  // ── Localizador — nós do ecossistema ──────────────────────────────────────
  const { history, addEntry } = useLocalizadorHistory('hub')

  const produtoNodes: EcosystemNode[] = products.map(p => {
    const v = prodVisual[p.product_key] ?? defaultVisual
    return {
      id:       p.product_key,
      label:    p.catalog?.name ?? p.product_key,
      sublabel: 'produto',
      color:    v.color,
      type:     'produto',
      status:   allowedProducts.some(a => a.product_key === p.product_key && a.is_active) ? 'accessible' : 'locked',
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
            onClick={() => navigate('/hub')}
          >
            <LogoHub size={13} color="#818cf8" />
            Hub
          </button>

          <div className="hb-topbar-sep" />

          <button className="hb-topbar-btn" type="button" title={t('comum.buscar')}>
            <MagnifyingGlass weight="bold" size={16} />
          </button>

          <button className="hb-topbar-btn hb-topbar-btn--notif" type="button" title={t('shell.menu.notificacoes')}>
            <Bell weight="duotone" size={16} />
            <div className="hb-notif-dot" />
          </button>

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
              if (node.type === 'hub')               navigate('/hub')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'configurador') navigate('/workspace')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
          />

          {/* Seletor de idioma */}
          <LanguageSwitcherGlobal iconOnly />

          <div className="hb-topbar-sep" />

          <button
            className="hb-topbar-btn"
            type="button"
            title={t('workspace.layout.modulo_nome')}
            onClick={() => navigate('/workspace')}
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
            onNavigateWorkspace={() => navigate('/workspace')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => {
              sessionStorage.removeItem('gravity_company_id')
              sessionStorage.removeItem('gravity_company_name')
              signOut(() => navigate('/'))
            }}
            isAdmin={isAdmin}
            onNavigateAdmin={() => navigate('/admin')}
            compact
          />
        </div>
      </header>

      {/* ── Content ── */}
      <div className="hb-content">

        {/* Hero */}
        <div className="hb-hero hb-d1">
          <div>
            <h1>{getGreeting(userName, t).split(',')[0]}, <span>{userName}</span> 👋</h1>
            <p className="hb-hero-sub">
              {companyName}&nbsp;·&nbsp;{t('hub.workspace_principal')}&nbsp;·&nbsp;{activeCount} {t('hub.modulos_ativos')}
            </p>
          </div>
          <div className="hb-hero-meta">
            <div className="hb-status-badge">
              <div className="hb-status-dot" />
              {t('hub.sistema_operacional', 'Sistema operacional')}
            </div>
            <span className="hb-hero-date">{formatDate()}</span>
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
              <div className="hb-kpi-icon"><Calculator weight="duotone" size={18} /></div>
              <span className="hb-kpi-delta hb-kpi-delta--up">▲ {t('hub.kpi_delta_12_mes', '12 este mês')}</span>
            </div>
            <div>
              <div className="hb-kpi-value">34</div>
              <div className="hb-kpi-label">{t('hub.kpi_estimativas', 'Estimativas geradas')}</div>
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

        {/* Produtos + Atividade */}
        <div className="hb-two-col hb-d3">

          {/* Produtos */}
          <div>
            <div className="hb-section-actions">
              <span className="hb-section-title" style={{ marginBottom: 0 }}>
                {t('hub.seus_produtos', 'Seus produtos')}
              </span>
              <button className="hb-section-link" type="button" onClick={() => navigate('/store')}>
                {t('hub.ir_para_store')} →
              </button>
            </div>

            {loading ? (
              <div className="hb-loading">
                <SpinnerGap size={36} className="hs-spin" color="var(--hb-accent)" />
                <span>{t('hub.carregando')}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="hb-loading" style={{ flexDirection: 'column', gap: '1rem' }}>
                <Rocket weight="duotone" size={48} color="var(--hb-muted)" />
                <p style={{ textAlign: 'center', maxWidth: 320 }}>{t('hub.empty_desc', { nome: companyName })}</p>
                <button className="hb-gabi-btn" type="button" onClick={() => navigate('/store')}>
                  {t('hub.explorar_catalogo')}
                </button>
              </div>
            ) : (
              <div className="hb-products-grid">
                {products.map((p) => {
                  const slug = p.catalog?.slug ?? p.product_key
                  const v = prodVisual[slug] ?? defaultVisual
                  return (
                    <div
                      key={p.product_key}
                      className="hb-prod-card"
                      style={{ '--hb-prod-color': v.color, '--hb-prod-dim': v.dim } as React.CSSProperties}
                      onClick={() => handleOpenProduct(slug)}
                    >
                      <div className="hb-prod-top">
                        <div className="hb-prod-icon">{v.icon}</div>
                        <span className="hb-prod-status hb-prod-status--active">{t('hub.produto_ativo')}</span>
                      </div>
                      <div>
                        <div className="hb-prod-name">{p.catalog?.name ?? p.product_key}</div>
                        <div className="hb-prod-desc">{p.catalog?.description ?? v.description}</div>
                      </div>
                      <div className="hb-prod-footer">
                        <span className="hb-prod-stat">{t('hub.produto_acessar')}</span>
                        <div className="hb-prod-arrow">
                          <ArrowUpRight weight="bold" size={14} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
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

        {/* Processos recentes */}
        <div className="hb-d4">
          <div className="hb-section-actions">
            <span className="hb-section-title" style={{ marginBottom: 0 }}>
              {t('hub.processos_recentes', 'Processos recentes')}
            </span>
            <button className="hb-section-link" type="button" onClick={() => navigate('/produto/processo')}>
              {t('hub.ver_todos', 'ver todos')} →
            </button>
          </div>
          <div className="hb-proc-list">
            {getMockProcesses(t).map(p => (
              <div key={p.id} className="hb-proc-item" onClick={() => navigate('/produto/processo')}>
                <div className="hb-proc-num">{p.num}</div>
                <div className="hb-proc-info">
                  <div className="hb-proc-name">{p.name}</div>
                  <div className="hb-proc-sub">{p.sub}</div>
                </div>
                <span className={`hb-proc-badge ${p.badgeCls}`}>{p.badge}</span>
                <div className="hb-etapas">
                  {p.etapas.map((e, i) => (
                    <div key={i} className={`hb-etapa ${e === 1 ? 'hb-etapa--done' : e === 2 ? 'hb-etapa--cur' : 'hb-etapa--pend'}`} />
                  ))}
                </div>
              </div>
            ))}
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

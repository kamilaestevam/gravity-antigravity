/**
 * UniversityGravity — layout da Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP. Mesmo layout do Configurador: MenuLateralGlobal (sidebar)
 * com título "Gravity University" + opções e dropdown de organizações, e as
 * mesmas ações de topo (Hub, busca/localizar, dica, notificações, localizador,
 * idioma, usuário). Textos via i18n (namespace `university`). Implementação real em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { Books, FileText, PuzzlePiece, Path, Sparkle, GraduationCap, Info } from '@phosphor-icons/react'
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
import './configurador/workspace.css'

const UNI_COR = '#818cf8'

// Dados de exemplo — virão do banco (catálogo de trilhas). Nomes próprios/demo.
const TRILHAS_DEMO = [
  { tag: '#f59e0b', icon: <Package />, nome: 'Onboarding Pedido', modulos: 5, duracao: '2h', prog: 62 },
  { tag: '#facc15', icon: <FlowArrow />, nome: 'Onboarding Processo', modulos: 6, duracao: '2h30', prog: 0 },
  { tag: '#a78bfa', icon: <PuzzlePiece weight="fill" />, nome: 'Integração via API', modulos: 4, duracao: '1h30', prog: 0 },
]

function Package() { return <span style={{ fontSize: 20 }}>📦</span> }
function FlowArrow() { return <span style={{ fontSize: 20 }}>🔀</span> }

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

  const nomeOrganizacao = currentUser?.nomeOrganizacao ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@usegravity.com.br'

  // ── Dropdown de organizações (gravity_admin) — igual ao Configurador ──
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
      } catch { /* lista de orgs é UX opcional */ }
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

  // ── Localizador ──
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('configurador')
  const [ecoNodes] = useState<EcosystemNode[]>(buildEcosystemNodes({ currentProductId: 'configurador' }))
  useEffect(() => {
    locAddEntry({ productId: 'configurador', productLabel: t('university.modulo_nome'), productColor: UNI_COR, pageLabel: t('university.modulo_nome'), pagePath: '/university-gravity' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Body classes (tema + dicas) ──
  useEffect(() => {
    document.body.classList.toggle('light-theme', isLight)
  }, [isLight])
  useEffect(() => {
    document.body.classList.toggle('tooltips-disabled', tooltipsDisabled)
  }, [tooltipsDisabled])

  const navItems = [
    { to: '/university-gravity/academy', label: t('university.nav.academy'), icon: <Books weight="duotone" size={18} /> },
    { to: '/university-gravity/minha-jornada', label: t('university.nav.minha_jornada'), icon: <Path weight="duotone" size={18} /> },
    { to: '/university-gravity/docs', label: t('university.nav.docs'), icon: <FileText weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
    { to: '/university-gravity/builders', label: t('university.nav.builders'), icon: <PuzzlePiece weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
  ]

  const tituloSecao = secao === 'jornada' ? t('university.nav.minha_jornada')
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
              if (alvo) navigate(alvo.to)
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem 3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <GraduationCap weight="duotone" size={24} color={UNI_COR} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ws-text,#f1f5f9)' }}>
              {tituloSecao}
            </h1>
          </div>

          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            background: 'linear-gradient(135deg, rgba(167,139,250,.12), rgba(129,140,248,.05))',
            border: '1px solid rgba(167,139,250,.28)', borderRadius: 14, padding: '14px 16px', marginBottom: 24,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center',
              background: 'linear-gradient(135deg,#a78bfa,#818cf8)', color: '#0b1220',
            }}>
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

          {secao === 'academy' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {TRILHAS_DEMO.map(tr => (
                <div key={tr.nome} style={{
                  background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)',
                  borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 11,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: `${tr.tag}22`, color: tr.tag }}>
                    {tr.icon}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tr.nome}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--ws-muted,#94a3b8)' }}>
                    {t('university.trilha.modulos', { count: tr.modulos })} · {tr.duracao}
                  </div>
                  {tr.prog > 0 && (
                    <div style={{ height: 7, borderRadius: 9, background: '#0e1626', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${tr.prog}%`, background: 'linear-gradient(90deg,#818cf8,#a78bfa)' }} />
                    </div>
                  )}
                  <button style={{
                    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '8px 14px',
                    borderRadius: 9999, background: UNI_COR, color: '#0b1220',
                  }}>{tr.prog > 0 ? t('university.acao.continuar') : t('university.acao.iniciar_jornada')}</button>
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
      </div>

      <ToastContainer />
    </div>
  )
}

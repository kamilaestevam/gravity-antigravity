/**
 * UniversityGravity — layout da Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP. Mesmo layout do Configurador: MenuLateralGlobal (sidebar)
 * com o título "Gravity University" + opções, e a área de conteúdo à direita.
 * A implementação real (Academy/Docs/Builders) está em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Books, FileText, PuzzlePiece, Path, Sparkle, GraduationCap } from '@phosphor-icons/react'
import { useShellStore, Notificacoes, ToastContainer } from '@gravity/shell'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { mapRole } from '../types/niveis-acesso'
import { HubBotao } from '../components/HubBotao'
import './configurador/workspace.css'

const UNI_COR = '#818cf8'

const TRILHAS_DEMO = [
  { tag: '#f59e0b', icon: <Package />, nome: 'Onboarding Pedido', meta: '5 módulos · 2h', prog: 62, cta: 'Continuar' },
  { tag: '#facc15', icon: <FlowArrow />, nome: 'Onboarding Processo', meta: '6 módulos · 2h30', prog: 0, cta: 'Iniciar jornada' },
  { tag: '#a78bfa', icon: <PuzzlePiece weight="fill" />, nome: 'Integração via API', meta: '4 módulos · 1h30', prog: 0, cta: 'Iniciar jornada' },
]

function Package() { return <span style={{ fontSize: 20 }}>📦</span> }
function FlowArrow() { return <span style={{ fontSize: 20 }}>🔀</span> }

export function UniversityGravity() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { currentUser, currentTheme, toggleTheme } = useShellStore()
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole } = useCarregarTipoUsuario()
  const isLight = currentTheme === 'light'

  const secao = pathname.includes('/docs') ? 'docs'
    : pathname.includes('/builders') ? 'builders'
    : pathname.includes('/minha-jornada') ? 'jornada'
    : 'academy'

  const nomeOrganizacao = currentUser?.nomeOrganizacao ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@usegravity.com.br'

  const navItems = [
    { to: '/university-gravity/academy', label: 'Academy', icon: <Books weight="duotone" size={18} /> },
    { to: '/university-gravity/minha-jornada', label: 'Minha Jornada', icon: <Path weight="duotone" size={18} /> },
    { to: '/university-gravity/docs', label: 'Docs', icon: <FileText weight="duotone" size={18} />, badge: 'Em Breve', badgeVariant: 'muted' as const },
    { to: '/university-gravity/builders', label: 'Builders', icon: <PuzzlePiece weight="duotone" size={18} />, badge: 'Em Breve', badgeVariant: 'muted' as const },
  ]

  const titulos: Record<string, string> = { academy: 'Academy', jornada: 'Minha Jornada', docs: 'Docs', builders: 'Builders' }

  return (
    <div className="ws-shell">
      <MenuLateralGlobal
        tenantName={nomeOrganizacao}
        tenantPlan={currentUser?.nomeWorkspacePreferido ?? nomeOrganizacao}
        navItems={navItems}
        moduleName="Gravity University"
        moduleColor={UNI_COR}
        defaultCollapsed={false}
      />

      <div className="ws-main">
        <div className="ws-global-actions">
          <HubBotao onClick={() => navigate('/hub?select=1')} />
          <Notificacoes />
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
          {/* Cabeçalho da seção */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <GraduationCap weight="duotone" size={24} color={UNI_COR} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ws-text,#f1f5f9)' }}>
              {titulos[secao]}
            </h1>
          </div>

          {/* Banner em construção */}
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
                Em construção
              </div>
              <p style={{ fontSize: '.86rem', marginTop: 4, lineHeight: 1.55, color: 'var(--ws-text,#f1f5f9)' }}>
                Hub único de aprendizado da plataforma — onboarding por produto, jornada gamificada e certificado,
                com a GABI como fonte de conhecimento e tutora.
              </p>
            </div>
          </div>

          {/* Conteúdo por seção */}
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
                  <div style={{ fontSize: '.78rem', color: 'var(--ws-muted,#94a3b8)' }}>{tr.meta}</div>
                  {tr.prog > 0 && (
                    <div style={{ height: 7, borderRadius: 9, background: '#0e1626', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${tr.prog}%`, background: 'linear-gradient(90deg,#818cf8,#a78bfa)' }} />
                    </div>
                  )}
                  <button style={{
                    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '8px 14px',
                    borderRadius: 9999, background: UNI_COR, color: '#0b1220',
                  }}>{tr.cta}</button>
                </div>
              ))}
            </div>
          )}

          {secao === 'jornada' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[['Pontos', '1.240'], ['Concluídas', '2'], ['Em andamento', '1'], ['Certificados', '2']].map(([l, v]) => (
                <div key={l} style={{ background: 'var(--bg-surface,#334155)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>{l}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6 }}>{v}</div>
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
              <p style={{ marginTop: 10, fontWeight: 600 }}>{titulos[secao]} — em breve</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>
                {secao === 'docs' ? 'Manuais e vídeos navegáveis (base de conhecimento da GABI).' : 'Direcionamento para integradores e desenvolvedores (API Cockpit).'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

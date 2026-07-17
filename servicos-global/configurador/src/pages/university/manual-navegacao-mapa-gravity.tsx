import React from 'react'
import { AcademyLinkGuia } from './guia-academy-link'
import {
  SquaresFour,
  ShoppingBag,
  PuzzlePiece,
  Gear,
  GraduationCap,
  MagnifyingGlass,
  Bell,
  Info,
  User,
  ArrowRight,
  SignIn,
  Package,
  FileText,
  Boat,
  CurrencyCircleDollar,
  FlowArrow,
  Buildings,
  Users,
  CreditCard,
  BookOpen,
  Rocket,
  Sparkle,
} from '@phosphor-icons/react'
import { ICONES_MENU_SUPERIOR_MANUAL } from './manual-navegacao-conteudo'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'
const ACCENT = '#818cf8'
const LINK: React.CSSProperties = {
  color: ACCENT,
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

type ZonaMenu = 'superior' | 'lateral-produto' | 'lateral-config' | 'lateral-university' | 'nenhum'

interface NoMapa {
  id: string
  titulo: string
  subtitulo: string
  icone: React.ElementType
  cor: string
  borda: string
  fundo: string
  menu: ZonaMenu
  itens?: string[]
  href?: string
}

interface CaminhoMapa {
  de: string
  para: string
  rotulo: string
}

const ZONAS: NoMapa[] = [
  {
    id: 'login',
    titulo: 'Login',
    subtitulo: 'Entrada na plataforma',
    icone: SignIn,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.07)',
    menu: 'nenhum',
    itens: ['/login', 'SSO Google / e-mail'],
  },
  {
    id: 'hub',
    titulo: 'Hub',
    subtitulo: 'Tela principal pós-login',
    icone: SquaresFour,
    cor: ACCENT,
    borda: 'rgba(129,140,248,.38)',
    fundo: 'rgba(99,102,241,.14)',
    menu: 'nenhum',
    itens: ['Produtos Gravity', 'Gravity Store', 'Gabi Insights', 'Aguardando ação'],
    href: '/university-gravity/docs/hub',
  },
  {
    id: 'store',
    titulo: 'Gravity Store',
    subtitulo: 'Catálogo e contratação',
    icone: ShoppingBag,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.1)',
    menu: 'nenhum',
    itens: ['Planos e assinaturas', 'Ativar produtos'],
    href: '/university-gravity/docs/store',
  },
  {
    id: 'produtos',
    titulo: 'Produtos Gravity',
    subtitulo: 'Shell operacional',
    icone: PuzzlePiece,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.1)',
    menu: 'lateral-produto',
    itens: ['Pedido', 'Smart Docs', 'BID Frete', 'BID Câmbio', 'Processo', 'Troca rápida de produto', 'Troca rápida de workspace'],
  },
  {
    id: 'configurador',
    titulo: 'Configurador',
    subtitulo: 'Gestão da organização',
    icone: Gear,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.35)',
    fundo: 'rgba(251,191,36,.09)',
    menu: 'lateral-config',
    itens: ['Organização', 'Workspaces', 'Usuários', 'Assinaturas', 'Financeiro'],
    href: '/university-gravity/docs/configurador',
  },
  {
    id: 'university',
    titulo: 'Gravity University',
    subtitulo: 'Manuais e trilhas',
    icone: GraduationCap,
    cor: '#c084fc',
    borda: 'rgba(192,132,252,.35)',
    fundo: 'rgba(192,132,252,.1)',
    menu: 'lateral-university',
    itens: ['Onboarding', 'Manuais', 'Minha Jornada'],
    href: '/university-gravity/docs/navegacao',
  },
]

const CAMINHOS: CaminhoMapa[] = [
  { de: 'login', para: 'hub', rotulo: 'Após autenticar' },
  { de: 'hub', para: 'produtos', rotulo: 'Ícone do produto' },
  { de: 'hub', para: 'store', rotulo: 'Vitrine / carrossel' },
  { de: 'store', para: 'hub', rotulo: 'Ícone Hub' },
  { de: 'hub', para: 'university', rotulo: 'Ícone University' },
  { de: 'produtos', para: 'hub', rotulo: 'Ícone Hub' },
  { de: 'configurador', para: 'hub', rotulo: 'Ícone Hub' },
  { de: 'university', para: 'hub', rotulo: 'Ícone Hub' },
  { de: 'hub', para: 'configurador', rotulo: 'Ícone ⚙ ou menu usuário' },
  { de: 'store', para: 'configurador', rotulo: 'Menu usuário' },
  { de: 'produtos', para: 'configurador', rotulo: 'Ícone ⚙ no topo' },
]

const PRODUTO_ICONES = [
  { nome: 'Pedido', icone: Package },
  { nome: 'Smart Docs', icone: FileText },
  { nome: 'BID Frete', icone: Boat },
  { nome: 'BID Câmbio', icone: CurrencyCircleDollar },
  { nome: 'Processo', icone: FlowArrow },
] as const

const CONFIG_ICONES = [
  { nome: 'Organização', icone: Buildings },
  { nome: 'Workspaces', icone: SquaresFour },
  { nome: 'Usuários', icone: Users },
  { nome: 'Assinaturas', icone: CreditCard },
] as const

const UNIVERSITY_ICONES = [
  { nome: 'Onboarding', icone: Rocket },
  { nome: 'Manuais', icone: BookOpen },
  { nome: 'Gabi', icone: Sparkle },
] as const

function BadgeMenu({ tipo }: { tipo: ZonaMenu }) {
  const map = {
    superior: { label: 'Menu superior', cor: '#818cf8', bg: 'rgba(99,102,241,.15)', borda: 'rgba(129,140,248,.35)' },
    'lateral-produto': { label: 'Menu lateral · produto', cor: '#34d399', bg: 'rgba(52,211,153,.12)', borda: 'rgba(52,211,153,.3)' },
    'lateral-config': { label: 'Menu lateral · configurações', cor: '#fbbf24', bg: 'rgba(251,191,36,.12)', borda: 'rgba(251,191,36,.3)' },
    'lateral-university': { label: 'Sidebar University', cor: '#c084fc', bg: 'rgba(192,132,252,.12)', borda: 'rgba(192,132,252,.3)' },
    nenhum: { label: 'Só menu superior', cor: '#94a3b8', bg: 'rgba(148,163,184,.1)', borda: 'rgba(148,163,184,.25)' },
  } as const
  const s = map[tipo]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '.58rem',
      fontWeight: 700,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: s.cor,
      background: s.bg,
      border: `1px solid ${s.borda}`,
      borderRadius: 999,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

function IconeToolbarMini({ slug }: { slug: string }) {
  const props = { size: 13, weight: 'duotone' as const }
  switch (slug) {
    case 'hub':
      return <span style={{ fontSize: '.58rem', fontWeight: 800, color: ACCENT }}>Hub</span>
    case 'localizar':
      return <MagnifyingGlass size={13} weight="bold" />
    case 'university':
      return <GraduationCap {...props} />
    case 'notificacoes':
      return <Bell size={13} weight="duotone" />
    case 'tooltip':
      return <Info size={13} weight="fill" color={ACCENT} />
    case 'idioma':
      return <span style={{ fontSize: '.55rem', fontWeight: 800 }}>BR</span>
    case 'configurador':
      return <Gear {...props} />
    case 'usuario':
      return <User size={13} weight="duotone" />
    default:
      return null
  }
}

function CardZona({ no }: { no: NoMapa }) {
  const Icone = no.icone
  const titulo = no.href
    ? <AcademyLinkGuia href={no.href} rotulo={no.titulo} />
    : <span style={{ fontWeight: 700, fontSize: '.88rem', color: '#f1f5f9' }}>{no.titulo}</span>

  return (
    <article style={{
      borderRadius: 14,
      padding: '14px 16px',
      background: `linear-gradient(145deg, ${no.fundo} 0%, rgba(8,12,24,.4) 100%)`,
      border: `1px solid ${no.borda}`,
      boxShadow: `0 4px 24px -8px ${no.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${no.fundo}`,
          border: `1px solid ${no.borda}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icone size={20} weight="duotone" color={no.cor} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ marginBottom: 4 }}>{titulo}</div>
          <p style={{ margin: 0, fontSize: '.72rem', color: CORPO_70, lineHeight: 1.4 }}>{no.subtitulo}</p>
        </div>
      </div>
      <div><BadgeMenu tipo={no.menu} /></div>
      {no.itens && (
        <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '.7rem', color: CORPO_70, lineHeight: 1.55 }}>
          {no.itens.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

const ROTULO_ZONA: Record<string, string> = {
  login: 'Login',
  hub: 'Hub',
  store: 'Gravity Store',
  produtos: 'Produto Gravity',
  configurador: 'Configurador',
  university: 'University',
}

function LinhaCaminho({ caminho }: { caminho: CaminhoMapa }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '.68rem',
      color: CORPO_70,
      padding: '6px 10px',
      borderRadius: 8,
      background: 'rgba(148,163,184,.04)',
      border: '1px dashed rgba(148,163,184,.18)',
    }}>
      <span style={{ fontWeight: 600, color: '#cbd5e1', minWidth: 100 }}>
        {ROTULO_ZONA[caminho.de] ?? caminho.de}
      </span>
      <ArrowRight size={12} weight="bold" color={ACCENT} />
      <span style={{ fontWeight: 600, color: '#cbd5e1', minWidth: 100 }}>
        {ROTULO_ZONA[caminho.para] ?? caminho.para}
      </span>
      <span style={{ marginLeft: 'auto', color: ACCENT, fontWeight: 600, fontSize: '.64rem' }}>
        {caminho.rotulo}
      </span>
    </div>
  )
}

function ChipModulo({ nome, icone: Icone, cor }: { nome: string; icone: React.ElementType; cor: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 9px',
      borderRadius: 8,
      fontSize: '.64rem',
      fontWeight: 600,
      color: '#e2e8f0',
      background: 'rgba(148,163,184,.06)',
      border: '1px solid rgba(148,163,184,.14)',
    }}>
      <Icone size={12} weight="duotone" color={cor} />
      {nome}
    </span>
  )
}

/** Mapa completo — caminhos e menus da plataforma (manual Navegação §01). */
export function ManualInfograficoMapaNavegacaoGravity() {
  const login = ZONAS.find(z => z.id === 'login')!
  const hub = ZONAS.find(z => z.id === 'hub')!

  return (
    <div style={{
      borderRadius: 16,
      padding: '20px 22px 22px',
      background: 'linear-gradient(165deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.03) 45%, rgba(8,12,24,.2) 100%)',
      border: '1px solid rgba(129,140,248,.22)',
      boxShadow: '0 8px 40px -12px rgba(99,102,241,.25)',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <p style={{
          margin: 0,
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--ws-muted,#94a3b8)',
        }}>
          Mapa de navegação: plataforma Gravity
        </p>
        <span style={{
          marginLeft: 'auto',
          fontSize: '.62rem',
          color: CORPO_70,
          fontWeight: 500,
        }}>
          Dois tipos de menu: <strong style={{ color: ACCENT }}>superior</strong> (sempre) + <strong style={{ color: '#34d399' }}>lateral</strong> (produto, configurações ou University)
        </span>
      </div>

      {/* Menu superior: faixa transversal */}
      <div style={{
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 20,
        background: 'rgba(99,102,241,.1)',
        border: '1px solid rgba(129,140,248,.3)',
      }}>
        <p style={{
          margin: '0 0 10px',
          fontSize: '.62rem',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#c7d2fe',
        }}>
          Menu superior: presente em todas as telas autenticadas
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 6,
          justifyContent: 'flex-end',
        }}>
          {ICONES_MENU_SUPERIOR_MANUAL.map(item => (
            <div
              key={item.slug}
              title={item.titulo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                height: 32,
                padding: '0 8px',
                borderRadius: 8,
                border: '1px solid rgba(148,163,184,.2)',
                background: 'rgba(8,12,24,.35)',
                color: '#e2e8f0',
              }}
            >
              <IconeToolbarMini slug={item.slug} />
            </div>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '.66rem', color: CORPO_70, lineHeight: 1.45 }}>
          Mesma ordem no Hub, produtos, Store, Configurador e University: retorno ao Hub, busca, manuais, notificações, idioma e conta.
        </p>
      </div>

      {/* Fluxo principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        <CardZona no={login} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
          <ArrowRight size={22} weight="bold" />
        </div>
        <CardZona no={hub} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <CardZona no={ZONAS.find(z => z.id === 'store')!} />
        <CardZona no={ZONAS.find(z => z.id === 'produtos')!} />
        <CardZona no={ZONAS.find(z => z.id === 'configurador')!} />
        <CardZona no={ZONAS.find(z => z.id === 'university')!} />
      </div>

      {/* Módulos laterais */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 20,
      }}>
        <div style={{
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid rgba(52,211,153,.22)',
          background: 'rgba(52,211,153,.05)',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '.64rem', fontWeight: 700, color: '#34d399', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Menu lateral · produtos
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRODUTO_ICONES.map(p => (
              <ChipModulo key={p.nome} nome={p.nome} icone={p.icone} cor="#34d399" />
            ))}
            <ChipModulo nome="Lista / Insights / Kanban" icone={Package} cor="#34d399" />
          </div>
        </div>
        <div style={{
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid rgba(251,191,36,.22)',
          background: 'rgba(251,191,36,.05)',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '.64rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Menu lateral · configurações
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CONFIG_ICONES.map(c => (
              <ChipModulo key={c.nome} nome={c.nome} icone={c.icone} cor="#fbbf24" />
            ))}
            <ChipModulo nome="Financeiro · Fornecedores" icone={CreditCard} cor="#fbbf24" />
          </div>
        </div>
        <div style={{
          borderRadius: 12,
          padding: '12px 14px',
          border: '1px solid rgba(192,132,252,.22)',
          background: 'rgba(192,132,252,.05)',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '.64rem', fontWeight: 700, color: '#c084fc', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Sidebar · University
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {UNIVERSITY_ICONES.map(u => (
              <ChipModulo key={u.nome} nome={u.nome} icone={u.icone} cor="#c084fc" />
            ))}
            <ChipModulo nome="Manuais por produto" icone={BookOpen} cor="#c084fc" />
          </div>
        </div>
      </div>

      {/* Caminhos */}
      <div>
        <p style={{
          margin: '0 0 10px',
          fontSize: '.64rem',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: 'var(--ws-muted,#94a3b8)',
        }}>
          Principais caminhos entre áreas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CAMINHOS.map(c => (
            <LinhaCaminho key={`${c.de}-${c.para}-${c.rotulo}`} caminho={c} />
          ))}
        </div>
      </div>

      <p style={{
        margin: '16px 0 0',
        padding: '10px 12px',
        borderRadius: 10,
        fontSize: '.7rem',
        lineHeight: 1.5,
        color: CORPO_70,
        background: 'rgba(99,102,241,.06)',
        border: '1px solid rgba(129,140,248,.18)',
      }}>
        <strong style={{ color: '#e2e8f0' }}>Regra rápida:</strong> Hub e Store não têm menu lateral.
        Produto aberto pelo Hub = menu lateral do produto.
        Configurador = menu lateral de configurações (entrada pelo ícone ⚙ ou menu do usuário).
        University = sidebar própria de manuais e trilhas.
      </p>
    </div>
  )
}

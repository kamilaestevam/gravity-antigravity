import React from 'react'
import {
  MagnifyingGlass,
  GraduationCap,
  Bell,
  Info,
  Gear,
  GlobeHemisphereWest,
  type Icon,
} from '@phosphor-icons/react'
import { ICONES_MENU_SUPERIOR_MANUAL, type IconeMenuSuperiorSlug } from './manual-navegacao-conteudo'
import { ManualFiguraScreenshot } from './manual-figura-screenshot'
import {
  MANUAL_ESPACO_GRADE_GALERIA_PX,
  MANUAL_GRID_TEXTO_IMAGEM,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type MetaIconeMenu = {
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const META_ICONES: Record<IconeMenuSuperiorSlug, MetaIconeMenu> = {
  hub: {
    icone: GlobeHemisphereWest,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.1)',
  },
  localizar: {
    icone: MagnifyingGlass,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.08)',
  },
  university: {
    icone: GraduationCap,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.1)',
  },
  notificacoes: {
    icone: Bell,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
  tooltip: {
    icone: Info,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(59,130,246,.1)',
  },
  idioma: {
    icone: GlobeHemisphereWest,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
  configurador: {
    icone: Gear,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  usuario: {
    icone: GlobeHemisphereWest,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(129,140,248,.1)',
  },
}

function renderIconeToolbar(slug: IconeMenuSuperiorSlug, dicasAtivas = true) {
  const meta = META_ICONES[slug]
  const props = { size: 17, weight: 'duotone' as const, color: meta.cor }

  switch (slug) {
    case 'hub':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', fontWeight: 700, color: meta.cor }}>
          <GlobeHemisphereWest size={13} weight="duotone" color={meta.cor} aria-hidden />
          Hub
        </span>
      )
    case 'localizar':
      return <MagnifyingGlass size={17} weight="bold" color={meta.cor} />
    case 'university':
      return <GraduationCap {...props} />
    case 'notificacoes':
      return (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Bell size={17} weight="duotone" color={meta.cor} />
          <span style={{
            position: 'absolute', top: -2, right: -4,
            width: 7, height: 7, borderRadius: '50%',
            background: '#f97316', border: '1.5px solid rgba(8,12,24,.9)',
          }} aria-hidden />
        </span>
      )
    case 'tooltip':
      return <Info size={17} weight={dicasAtivas ? 'fill' : 'regular'} color={dicasAtivas ? meta.cor : '#94a3b8'} />
    case 'idioma':
      return <span style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.05em', color: meta.cor }}>BR</span>
    case 'configurador':
      return <Gear {...props} />
    case 'usuario':
      return (
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: meta.fundo, border: `1px solid ${meta.borda}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '.62rem', fontWeight: 700, color: meta.cor,
        }}>GR</span>
      )
    default:
      return null
  }
}

function BotaoToolbarMock({ children, destaque }: { children: React.ReactNode; destaque?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 34, height: 34, padding: '0 8px',
      borderRadius: 9,
      border: `1px solid ${destaque ? 'rgba(129,140,248,.35)' : 'rgba(148,163,184,.2)'}`,
      background: destaque ? 'rgba(129,140,248,.1)' : 'rgba(148,163,184,.05)',
      color: 'var(--ws-text,#e2e8f0)',
      flexShrink: 0,
    }}>
      {children}
    </span>
  )
}

function CaixaIconeLista({ slug, dicasAtivas = true }: { slug: IconeMenuSuperiorSlug; dicasAtivas?: boolean }) {
  const meta = META_ICONES[slug]
  const Icone = meta.icone

  if (slug === 'hub') {
    return (
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 11,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2,
        background: meta.fundo, border: `1px solid ${meta.borda}`,
      }}>
        <GlobeHemisphereWest size={16} weight="duotone" color={meta.cor} aria-hidden />
        <span style={{ fontSize: '.5rem', fontWeight: 800, letterSpacing: '.04em', color: meta.cor, lineHeight: 1 }}>Hub</span>
      </div>
    )
  }

  if (slug === 'notificacoes') {
    return (
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 11,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: meta.fundo, border: `1px solid ${meta.borda}`, position: 'relative',
      }}>
        <Bell size={20} weight="duotone" color={meta.cor} />
        <span style={{
          position: 'absolute', top: 8, right: 9,
          width: 7, height: 7, borderRadius: '50%',
          background: '#f97316', border: '1.5px solid rgba(8,12,24,.85)',
        }} aria-hidden />
      </div>
    )
  }

  if (slug === 'tooltip') {
    return (
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 11,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: meta.fundo, border: `1px solid ${meta.borda}`,
      }}>
        <Info size={20} weight={dicasAtivas ? 'fill' : 'regular'} color={dicasAtivas ? meta.cor : '#94a3b8'} />
      </div>
    )
  }

  if (slug === 'idioma') {
    return (
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 11,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: meta.fundo, border: `1px solid ${meta.borda}`,
        fontSize: '.72rem', fontWeight: 800, letterSpacing: '.06em', color: meta.cor,
      }}>
        BR
      </div>
    )
  }

  if (slug === 'usuario') {
    return (
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: meta.fundo, border: `1px solid ${meta.borda}`,
        fontSize: '.68rem', fontWeight: 700, color: meta.cor,
      }}>
        GR
      </div>
    )
  }

  return (
    <div style={{
      flexShrink: 0, width: 44, height: 44, borderRadius: 11,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: meta.fundo, border: `1px solid ${meta.borda}`,
    }}>
      <Icone size={20} weight={slug === 'localizar' ? 'bold' : 'duotone'} color={meta.cor} />
    </div>
  )
}

function MiniaturaIconeMenu({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <ManualFiguraScreenshot
        src={src}
        alt={alt}
        larguraTotal
        ampliarInferiorDireito
      />
    )
  }
  return (
    <div style={{
      minHeight: 140,
      borderRadius: 14,
      border: '1px dashed rgba(148,163,184,.22)',
      background: 'rgba(8,12,24,.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      color: 'var(--ws-muted,#94a3b8)',
      fontSize: '.72rem',
      lineHeight: 1.45,
      textAlign: 'center',
    }}>
      Miniatura em breve
    </div>
  )
}

function LinhaIconeMenu({ item }: { item: (typeof ICONES_MENU_SUPERIOR_MANUAL)[number] }) {
  const meta = META_ICONES[item.slug]

  return (
    <article style={{
      display: 'grid',
      gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
      gap: MANUAL_ESPACO_GRADE_GALERIA_PX + 8,
      alignItems: 'start',
      padding: '18px 16px',
      borderRadius: 12,
      background: 'rgba(8,12,24,.28)',
      border: `1px solid ${meta.borda}`,
    }}>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <CaixaIconeLista slug={item.slug} />
          <div style={{ minWidth: 0, flex: 1, paddingTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 10px', marginBottom: 8 }}>
              <span style={{
                fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em',
                color: meta.cor, flexShrink: 0,
              }}>
                {String(item.ordem).padStart(2, '0')}
              </span>
              <h4 style={{ margin: 0, fontSize: '.92rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35 }}>
                {item.titulo}
              </h4>
              <BotaoToolbarMock destaque={item.slug === 'hub'}>
                {renderIconeToolbar(item.slug)}
              </BotaoToolbarMock>
            </div>
            <p style={{ margin: 0, fontSize: '.82rem', lineHeight: 1.6, color: '#e2e8f0', fontWeight: 600 }}>
              {item.resumo}
            </p>
          </div>
        </div>
        {item.detalhe && (
          <p style={{
            margin: 0, fontSize: '.78rem', lineHeight: 1.6, color: CORPO_70,
            paddingLeft: 60,
          }}>
            {item.detalhe}
          </p>
        )}
        {item.dica && (
          <p style={{
            margin: 0, marginLeft: 60, padding: '10px 12px', borderRadius: 9,
            fontSize: '.74rem', lineHeight: 1.55, color: '#fbbf24',
            background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.16)',
          }}>
            {item.dica}
          </p>
        )}
      </div>
      <div style={{ width: '100%', minWidth: 0, paddingTop: 2 }}>
        <MiniaturaIconeMenu src={item.imagem} alt={item.titulo} />
      </div>
    </article>
  )
}

/** Barra de referência + lista texto à esquerda / miniatura à direita (manual Navegação §03). */
export function ManualInfograficoIconesMenuSuperior() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Ordem fixa — da esquerda para a direita
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
        padding: '14px 16px', borderRadius: 12,
        background: 'rgba(2,6,23,.55)', border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 14,
      }}>
        {ICONES_MENU_SUPERIOR_MANUAL.map((item) => (
          <React.Fragment key={item.slug}>
            {item.slug === 'configurador' && (
              <span style={{ width: 1, height: 24, background: 'rgba(148,163,184,.22)', margin: '0 4px' }} aria-hidden />
            )}
            <BotaoToolbarMock destaque={item.slug === 'hub'}>
              {renderIconeToolbar(item.slug)}
            </BotaoToolbarMock>
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ICONES_MENU_SUPERIOR_MANUAL.map(item => (
          <LinhaIconeMenu key={item.slug} item={item} />
        ))}
      </div>
    </div>
  )
}

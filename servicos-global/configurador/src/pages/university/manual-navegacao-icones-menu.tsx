import React from 'react'
import {
  MagnifyingGlass,
  GraduationCap,
  Bell,
  Info,
  Gear,
} from '@phosphor-icons/react'
import { ICONES_MENU_SUPERIOR_MANUAL, type IconeMenuSuperiorSlug } from './manual-navegacao-conteudo'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'
const ACCENT = '#818cf8'

function renderIconeToolbar(slug: IconeMenuSuperiorSlug, dicasAtivas = true) {
  const props = { size: 15, weight: 'duotone' as const }
  switch (slug) {
    case 'hub':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.62rem', fontWeight: 800, color: ACCENT }}>
          <span style={{
            width: 12, height: 12, borderRadius: 3,
            background: 'rgba(129,140,248,.35)', display: 'inline-block',
          }} aria-hidden />
          Hub
        </span>
      )
    case 'localizar':
      return <MagnifyingGlass size={15} weight="bold" />
    case 'university':
      return <GraduationCap {...props} />
    case 'notificacoes':
      return (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Bell size={15} weight="duotone" />
          <span style={{
            position: 'absolute', top: -2, right: -3,
            width: 6, height: 6, borderRadius: '50%',
            background: '#f97316', border: '1.5px solid rgba(8,12,24,.9)',
          }} aria-hidden />
        </span>
      )
    case 'tooltip':
      return <Info size={15} weight={dicasAtivas ? 'fill' : 'regular'} color={dicasAtivas ? ACCENT : undefined} />
    case 'idioma':
      return <span style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.04em' }}>BR</span>
    case 'configurador':
      return <Gear {...props} />
    case 'usuario':
      return (
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(129,140,248,.22)', border: '1px solid rgba(129,140,248,.35)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '.58rem', fontWeight: 700, color: ACCENT,
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
      minWidth: 30, height: 30, padding: '0 6px',
      borderRadius: 8,
      border: `1px solid ${destaque ? 'rgba(129,140,248,.35)' : 'rgba(148,163,184,.18)'}`,
      background: destaque ? 'rgba(129,140,248,.1)' : 'rgba(148,163,184,.04)',
      color: 'var(--ws-text,#e2e8f0)',
      flexShrink: 0,
    }}>
      {children}
    </span>
  )
}

function CardIconeMenu({ item }: { item: (typeof ICONES_MENU_SUPERIOR_MANUAL)[number] }) {
  return (
    <article style={{
      borderRadius: 12,
      padding: '14px 16px 16px',
      background: 'rgba(8,12,24,.35)',
      border: '1px solid rgba(148,163,184,.14)',
      display: 'flex', flexDirection: 'column', gap: 10,
      minHeight: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(129,140,248,.12)', border: '1px solid rgba(129,140,248,.25)',
          color: ACCENT,
        }}>
          {renderIconeToolbar(item.slug, true)}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: '.62rem', fontWeight: 800, letterSpacing: '.06em',
              color: ACCENT, flexShrink: 0,
            }}>
              {String(item.ordem).padStart(2, '0')}
            </span>
            <h4 style={{ margin: 0, fontSize: '.88rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
              {item.titulo}
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '.8rem', lineHeight: 1.55, color: '#e2e8f0', fontWeight: 600 }}>
            {item.resumo}
          </p>
        </div>
      </div>
      {item.detalhe && (
        <p style={{ margin: 0, fontSize: '.76rem', lineHeight: 1.55, color: CORPO_70, paddingLeft: 48 }}>
          {item.detalhe}
        </p>
      )}
      {item.dica && (
        <p style={{
          margin: '2px 0 0', padding: '8px 10px', borderRadius: 8,
          fontSize: '.72rem', lineHeight: 1.5, color: '#fbbf24',
          background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.16)',
        }}>
          {item.dica}
        </p>
      )}
    </article>
  )
}

/** Barra de referência + grade dos 8 atalhos do menu superior (manual Navegação §03). */
export function ManualInfograficoIconesMenuSuperior() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--ws-muted,#94a3b8)', margin: '0 0 12px',
      }}>
        Ordem fixa — da esquerda para a direita
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        padding: '12px 14px', borderRadius: 12,
        background: 'rgba(2,6,23,.55)', border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 18,
      }}>
        {ICONES_MENU_SUPERIOR_MANUAL.map((item) => (
          <React.Fragment key={item.slug}>
            {item.slug === 'configurador' && (
              <span style={{ width: 1, height: 22, background: 'rgba(148,163,184,.2)', margin: '0 2px' }} aria-hidden />
            )}
            <BotaoToolbarMock destaque={item.slug === 'hub'}>
              {renderIconeToolbar(item.slug)}
            </BotaoToolbarMock>
          </React.Fragment>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {ICONES_MENU_SUPERIOR_MANUAL.map(item => (
          <CardIconeMenu key={item.slug} item={item} />
        ))}
      </div>
    </div>
  )
}

import React from 'react'
import {
  ShoppingBag,
  Sun,
  Sparkle,
  SignOut,
  type Icon,
} from '@phosphor-icons/react'
import { ITENS_MENU_USUARIO_MANUAL, type ItemMenuUsuarioSlug } from './manual-navegacao-conteudo'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'
import { MANUAL_TITULO_INFOGRAFICO_ESTILO, MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX } from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type MetaItemMenu = {
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const META_ITENS: Record<ItemMenuUsuarioSlug, MetaItemMenu> = {
  store: {
    icone: ShoppingBag,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  tema: {
    icone: Sun,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.1)',
  },
  novidades: {
    icone: Sparkle,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(59,130,246,.1)',
  },
  sair: {
    icone: SignOut,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.28)',
    fundo: 'rgba(248,113,113,.08)',
  },
}

function LinhaItemMenuUsuario({ item }: { item: (typeof ITENS_MENU_USUARIO_MANUAL)[number] }) {
  const meta = META_ITENS[item.slug]
  const Icone = meta.icone

  return (
    <article style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      padding: '16px 18px',
      borderRadius: 12,
      background: 'rgba(8,12,24,.28)',
      border: `1px solid ${meta.borda}`,
    }}>
      <div style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 11,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: meta.fundo, border: `1px solid ${meta.borda}`,
      }}>
        <Icone size={20} weight="duotone" color={meta.cor} />
      </div>
      <div style={{ minWidth: 0, flex: 1, paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 10px', marginBottom: 6 }}>
          <span style={{
            fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', color: meta.cor,
          }}>
            {String(item.ordem).padStart(2, '0')}
          </span>
          <h4 style={{ margin: 0, fontSize: '.9rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35 }}>
            {item.titulo}
          </h4>
          {item.emBreve && (
            <span style={{
              fontSize: '.58rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 999,
              color: '#fbbf24', background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)',
            }}>
              Em breve
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '.82rem', lineHeight: 1.6, color: '#e2e8f0', fontWeight: 600 }}>
          <ManualInfograficoRichText texto={item.resumo} />
        </p>
        {item.detalhe && (
          <p style={{ margin: '8px 0 0', fontSize: '.76rem', lineHeight: 1.55, color: CORPO_70 }}>
            <ManualInfograficoRichText texto={item.detalhe} />
          </p>
        )}
      </div>
    </article>
  )
}

/** Demais opções do menu do avatar — após os passos de Configuração (manual Navegação). */
export function ManualInfograficoItensMenuUsuario() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Demais opções do menu do usuário
      </p>
      <p style={{
        margin: `0 0 ${MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX}px`, fontSize: '.78rem', lineHeight: 1.55, color: CORPO_70,
      }}>
        <ManualInfograficoRichText texto="Além do **Configurador**, o painel aberto pelo **avatar** no canto superior direito reúne estes atalhos de sessão e preferências." />
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ITENS_MENU_USUARIO_MANUAL.map(item => (
          <LinhaItemMenuUsuario key={item.slug} item={item} />
        ))}
      </div>
      <p style={{
        margin: '14px 0 0', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70,
        padding: '10px 12px', borderRadius: 9,
        background: 'rgba(129,140,248,.06)', border: '1px solid rgba(129,140,248,.14)',
      }}>
        <ManualInfograficoRichText texto="Masters e admins veem também **Painel Admin** e **Trocar organização**, quando habilitado para o perfil." />
      </p>
    </div>
  )
}

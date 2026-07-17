import React from 'react'
import {
  MagnifyingGlass,
  Funnel,
  Export,
  DotsSixVertical,
  Gear,
  Package,
  Boat,
  FileText,
  type Icon,
} from '@phosphor-icons/react'
import {
  FUNCIONALIDADES_LISTA_PLATAFORMA_MANUAL,
  LOCAIS_LISTA_PLATAFORMA_MANUAL,
  type FuncionalidadeListaPlataformaSlug,
  type LocalListaPlataformaSlug,
} from './manual-navegacao-conteudo'
import { ManualFiguraScreenshot } from './manual-figura-screenshot'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'
import {
  MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
  MANUAL_ESPACO_GRADE_GALERIA_PX,
  MANUAL_GRID_TEXTO_IMAGEM,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type MetaLocal = { icone: Icon; cor: string; borda: string; fundo: string }

const META_LOCAIS: Record<LocalListaPlataformaSlug, MetaLocal> = {
  configurador: {
    icone: Gear,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  pedido: {
    icone: Package,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.1)',
  },
  'bid-frete': {
    icone: Boat,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
  'smart-docs': {
    icone: FileText,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(59,130,246,.1)',
  },
}

type MetaFuncionalidade = { icone: Icon; cor: string; borda: string; fundo: string }

const META_FUNCIONALIDADES: Record<FuncionalidadeListaPlataformaSlug, MetaFuncionalidade> = {
  localizar: {
    icone: MagnifyingGlass,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.08)',
  },
  arrastar: {
    icone: DotsSixVertical,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(59,130,246,.1)',
  },
  filtros: {
    icone: Funnel,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
  exportar: {
    icone: Export,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.1)',
  },
}

function MiniaturaFuncionalidade({ src, alt }: { src?: string; alt: string }) {
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

function CardLocalLista({ item }: { item: (typeof LOCAIS_LISTA_PLATAFORMA_MANUAL)[number] }) {
  const meta = META_LOCAIS[item.slug]
  const Icone = meta.icone

  return (
    <article style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '14px 14px 12px',
      borderRadius: 12,
      background: 'rgba(8,12,24,.28)',
      border: `1px solid ${meta.borda}`,
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: meta.fundo, border: `1px solid ${meta.borda}`,
        }}>
          <Icone size={18} weight="duotone" color={meta.cor} />
        </div>
        <h4 style={{ margin: 0, fontSize: '.86rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.35 }}>
          {item.titulo}
        </h4>
      </div>
      <p style={{ margin: 0, fontSize: '.74rem', lineHeight: 1.55, color: CORPO_70 }}>
        <ManualInfograficoRichText texto={item.resumo} />
      </p>
      <div style={{ marginTop: 'auto' }}>
        <ManualFiguraScreenshot src={item.imagem} alt={item.titulo} larguraTotal ampliarInferiorDireito />
      </div>
    </article>
  )
}

function LinhaFuncionalidadeLista({ item }: { item: (typeof FUNCIONALIDADES_LISTA_PLATAFORMA_MANUAL)[number] }) {
  const meta = META_FUNCIONALIDADES[item.slug]
  const Icone = meta.icone

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
          <div style={{
            flexShrink: 0, width: 44, height: 44, borderRadius: 11,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: meta.fundo, border: `1px solid ${meta.borda}`,
          }}>
            <Icone size={20} weight={item.slug === 'localizar' ? 'bold' : 'duotone'} color={meta.cor} />
          </div>
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
            </div>
            <p style={{ margin: 0, fontSize: '.82rem', lineHeight: 1.6, color: '#e2e8f0', fontWeight: 600 }}>
              <ManualInfograficoRichText texto={item.resumo} />
            </p>
          </div>
        </div>
        {item.detalhe && (
          <p style={{
            margin: 0, fontSize: '.78rem', lineHeight: 1.6, color: CORPO_70,
            paddingLeft: 60,
          }}>
            <ManualInfograficoRichText texto={item.detalhe} />
          </p>
        )}
      </div>
      <div style={{ width: '100%', minWidth: 0, paddingTop: 2 }}>
        <MiniaturaFuncionalidade src={item.imagem} alt={item.titulo} />
      </div>
    </article>
  )
}

/** Onde a lista aparece + gestos comuns GTV (manual Navegação). */
export function ManualInfograficoFuncionalidadesLista() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Onde a lista aparece na plataforma
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
      }}>
        {LOCAIS_LISTA_PLATAFORMA_MANUAL.map(item => (
          <CardLocalLista key={item.slug} item={item} />
        ))}
      </div>

      <p style={{ ...MANUAL_TITULO_INFOGRAFICO_ESTILO, marginTop: 0 }}>
        O que sempre é igual — Localizar, arrastar, filtros e Exportar
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FUNCIONALIDADES_LISTA_PLATAFORMA_MANUAL.map(item => (
          <LinhaFuncionalidadeLista key={item.slug} item={item} />
        ))}
      </div>
    </div>
  )
}

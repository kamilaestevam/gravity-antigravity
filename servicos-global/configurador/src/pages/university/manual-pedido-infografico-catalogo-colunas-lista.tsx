import React from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { TOTAL_COLUNAS_CATALOGO_PEDIDO, GRUPOS_CATALOGO_COLUNAS_PEDIDO, TOTAL_COLUNAS_PADRAO_LISTA_PEDIDO } from './manual-pedido-catalogo-colunas-dados'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const TOTAL_PEDIDO = GRUPOS_CATALOGO_COLUNAS_PEDIDO
  .filter((g) => g.nivel === 'pedido')
  .reduce((acc, g) => acc + g.colunas.length, 0)

const TOTAL_ITEM = GRUPOS_CATALOGO_COLUNAS_PEDIDO
  .filter((g) => g.nivel === 'item')
  .reduce((acc, g) => acc + g.colunas.length, 0)

const GRUPOS_PEDIDO = GRUPOS_CATALOGO_COLUNAS_PEDIDO.filter((g) => g.nivel === 'pedido').length
const GRUPOS_ITEM = GRUPOS_CATALOGO_COLUNAS_PEDIDO.filter((g) => g.nivel === 'item').length

/** Manual Pedido §05 — resumo do catálogo nativo (detalhe no accordion abaixo). */
export function ManualInfograficoPedidoCatalogoColunasLista() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 42%, rgba(245,158,11,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 20,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <p style={{
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        margin: '0 0 6px',
      }}>
        Catálogo nativo
      </p>
      <p style={{
        margin: '0 0 14px',
        fontSize: '.88rem',
        fontWeight: 800,
        color: '#f1f5f9',
        lineHeight: 1.35,
        letterSpacing: '-.01em',
      }}>
        {TOTAL_COLUNAS_CATALOGO_PEDIDO} colunas no menu Colunas — {TOTAL_COLUNAS_PADRAO_LISTA_PEDIDO} já vêm ligadas no painel Padrão
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <div style={{
          borderRadius: 12,
          padding: '10px 14px',
          background: 'rgba(8,12,24,.35)',
          border: '1px solid rgba(129,140,248,.28)',
          minWidth: 120,
        }}>
          <p style={{ margin: 0, fontSize: '.58rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Total nativo
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#c7d2fe', lineHeight: 1.1 }}>
            {TOTAL_COLUNAS_CATALOGO_PEDIDO}
          </p>
        </div>
        <div style={{
          borderRadius: 12,
          padding: '10px 14px',
          background: 'rgba(245,158,11,.08)',
          border: '1px solid rgba(245,158,11,.28)',
        }}>
          <p style={{ margin: 0, fontSize: '.62rem', fontWeight: 700, color: '#fcd34d' }}>
            Linha mãe (pedido)
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '.9rem', fontWeight: 800, color: '#fde68a' }}>
            {TOTAL_PEDIDO} colunas · {GRUPOS_PEDIDO} grupos
          </p>
        </div>
        <div style={{
          borderRadius: 12,
          padding: '10px 14px',
          background: 'rgba(52,211,153,.08)',
          border: '1px solid rgba(52,211,153,.28)',
        }}>
          <p style={{ margin: 0, fontSize: '.62rem', fontWeight: 700, color: '#6ee7b7' }}>
            Linha filha (item)
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '.9rem', fontWeight: 800, color: '#a7f3d0' }}>
            {TOTAL_ITEM} colunas · {GRUPOS_ITEM} grupos
          </p>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#fde68a',
          background: 'rgba(251,191,36,.12)',
          border: '1px solid rgba(251,191,36,.32)',
          borderRadius: 999,
          padding: '6px 10px',
        }}>
          <Sparkle size={12} weight="fill" />
          Grupos recolhidos — expanda abaixo
        </span>
      </div>

      <p style={{
        margin: 0,
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        Marque só o que importa no menu <strong style={{ color: '#cbd5e1' }}>Colunas</strong>, reordene e salve no painel. O catálogo completo tem{' '}
        <strong style={{ color: '#cbd5e1' }}>{TOTAL_COLUNAS_CATALOGO_PEDIDO}</strong> colunas ({TOTAL_PEDIDO} linha mãe + {TOTAL_ITEM} linha filha);{' '}
        <strong style={{ color: '#cbd5e1' }}>{TOTAL_COLUNAS_PADRAO_LISTA_PEDIDO}</strong> já vêm visíveis no painel{' '}
        <strong style={{ color: '#cbd5e1' }}>Padrão</strong> (coluna Padrão = Sim no accordion abaixo).{' '}
        <strong style={{ color: '#cbd5e1' }}>Edição P</strong> / <strong style={{ color: '#cbd5e1' }}>I</strong>,{' '}
        <strong style={{ color: '#cbd5e1' }}>Soma</strong> e <strong style={{ color: '#cbd5e1' }}>Espelha</strong> seguem o SSOT da Lista.
      </p>
    </div>
  )
}

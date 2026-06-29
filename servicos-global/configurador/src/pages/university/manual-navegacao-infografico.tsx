import React from 'react'
import {
  SquaresFour,
  ShoppingBag,
  PuzzlePiece,
  Gear,
  ArrowDown,
  X,
  Check,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function BlocoMenu({
  titulo,
  itens,
  icone: Icone,
  cor,
  borda,
  fundo,
  semMenu,
}: {
  titulo: string
  itens: string[]
  icone: React.ElementType
  cor: string
  borda: string
  fundo: string
  semMenu?: boolean
}) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '12px 14px',
      background: fundo,
      border: `1px solid ${borda}`,
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icone size={16} weight="duotone" style={{ color: cor, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '.78rem', color: '#e2e8f0' }}>{titulo}</span>
        {semMenu !== undefined && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            color: semMenu ? '#f87171' : '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {semMenu ? <X size={12} weight="bold" /> : <Check size={12} weight="bold" />}
            {semMenu ? 'Sem menu lateral' : 'Com menu lateral'}
          </span>
        )}
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '.72rem', color: CORPO_70, lineHeight: 1.55 }}>
        {itens.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/** Mapa — onde existe menu lateral na plataforma (manual Navegação §03). */
export function ManualInfograficoMenuLateral() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--ws-muted,#94a3b8)', margin: '0 0 14px',
      }}>
        Onde existe menu lateral?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          background: 'rgba(99,102,241,.1)',
          border: '1px solid rgba(129,140,248,.3)',
          color: '#c7d2fe',
          fontSize: '.72rem',
          fontWeight: 600,
        }}>
          Menu superior — presente em quase todas as telas autenticadas
        </div>

        <ArrowDown size={14} weight="bold" color="#64748b" />

        <BlocoMenu
          titulo="Antes de abrir um produto"
          itens={['Hub — tela principal', 'Gravity Store — catálogo de contratação']}
          icone={SquaresFour}
          cor="#94a3b8"
          borda="rgba(148,163,184,.25)"
          fundo="rgba(148,163,184,.06)"
          semMenu
        />

        <div style={{
          fontSize: '.68rem',
          fontWeight: 600,
          color: '#818cf8',
          textAlign: 'center',
          padding: '4px 8px',
          lineHeight: 1.45,
        }}>
          No Hub, clique em um ícone de Produto Gravity contratado
        </div>

        <ArrowDown size={14} weight="bold" color="#64748b" />

        <BlocoMenu
          titulo="Dentro de um produto Gravity"
          itens={['Pedido, Smart Docs, BID Frete, Processo…', 'Itens do menu = módulos daquele produto']}
          icone={PuzzlePiece}
          cor="#34d399"
          borda="rgba(52,211,153,.25)"
          fundo="rgba(52,211,153,.08)"
          semMenu={false}
        />

        <div style={{
          width: '100%',
          height: 1,
          background: 'rgba(148,163,184,.15)',
          margin: '4px 0',
        }} />

        <BlocoMenu
          titulo="Configurador da organização"
          itens={[
            'Área de gestão (Organização, Usuários, Workspaces…)',
            'Acesso pelo menu do usuário — não passa pelo Hub de produtos',
          ]}
          icone={Gear}
          cor="#fbbf24"
          borda="rgba(251,191,36,.25)"
          fundo="rgba(251,191,36,.08)"
          semMenu={false}
        />

        <p style={{
          margin: '6px 0 0',
          fontSize: '.66rem',
          color: CORPO_70,
          textAlign: 'center',
          lineHeight: 1.45,
        }}>
          A <strong style={{ color: '#e2e8f0' }}>Gravity Store</strong>{' '}
          <ShoppingBag size={11} weight="duotone" style={{ verticalAlign: '-2px', color: '#fbbf24' }} />{' '}
          também usa só o menu superior — não confunda com o menu de um produto já aberto.
        </p>
      </div>
    </div>
  )
}

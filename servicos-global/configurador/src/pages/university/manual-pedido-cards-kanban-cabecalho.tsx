import React from 'react'
import { Tag, Hash, SortDescending } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CardKanbanCabecalho = {
  num: string
  titulo: string
  icone: React.ReactNode
  cor: string
  borda: string
  fundo: string
  linhas: string[]
}

const CARDS: CardKanbanCabecalho[] = [
  {
    num: '01',
    titulo: 'Status da coluna',
    icone: <Tag size={18} weight="duotone" />,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.08)',
    linhas: [
      'Cada coluna é reflexo **1:1** do status configurado no workspace — rótulo, **ícone** e **cor** vêm de **GET /api/v1/pedidos/config/status**.',
      'Ex.: **Rascunho**, **Aberto**, **Aprovado** — subtítulo da tela: **Pedidos organizados por status**.',
    ],
  },
  {
    num: '02',
    titulo: 'Contagem',
    icone: <Hash size={18} weight="duotone" />,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(129,140,248,.08)',
    linhas: [
      'Badge numérico no cabeçalho — quantidade de **cartões** na coluna naquele status.',
      'Com **Localizar pedido…** ativo, a contagem (e o total **X pedidos** na barra) recalculam só com os pedidos que passam no filtro por número, parceiro, incoterm ou status.',
    ],
  },
  {
    num: '03',
    titulo: 'Ordenar coluna',
    icone: <SortDescending size={18} weight="duotone" />,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
    linhas: [
      'Botão com tooltip **Ordenar coluna** + nome do status — abre o popover **Ordenar lista**.',
      'Opções exatas: **Mais recente primeiro**, **Mais antigo primeiro** ou **Ordem alfabética**. Oculto em colunas **somente leitura**.',
    ],
  },
]

function ManualTextoCard({ texto }: { texto: string }) {
  const partes = texto.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {partes.map((parte, i) => (
        i % 2 === 1
          ? <strong key={`${parte}-${i}`} style={{ color: '#e2e8f0', fontWeight: 600 }}>{parte}</strong>
          : parte
      ))}
    </>
  )
}

/** Manual Pedido §07 — cabeçalho da coluna Kanban (status, contagem, ordenação) */
export function ManualPedidoCardsKanbanCabecalho() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
        marginTop: 16,
      }}
    >
      {CARDS.map((card) => (
        <div
          key={card.num}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 12,
            border: `1px solid ${card.borda}`,
            background: card.fundo,
            minHeight: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: '.62rem',
                fontWeight: 800,
                letterSpacing: '.08em',
                color: card.cor,
                background: 'rgba(8,12,24,.35)',
                border: `1px solid ${card.borda}`,
                borderRadius: 6,
                padding: '3px 8px',
              }}
            >
              {card.num}
            </span>
            <span style={{ color: card.cor, display: 'flex' }} aria-hidden>{card.icone}</span>
            <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#e2e8f0' }}>
              {card.titulo}
            </span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              fontSize: '.74rem',
              lineHeight: 1.55,
              color: CORPO_70,
            }}
          >
            {card.linhas.map((linha) => (
              <li key={linha} style={{ marginBottom: 6 }}>
                <ManualTextoCard texto={linha} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

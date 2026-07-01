import React from 'react'
import {
  BookmarkSimple,
  Funnel,
  Layout,
  Plus,
  SlidersHorizontal,
  Sparkle,
  Table,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CardPainel = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const CARDS: CardPainel[] = [
  {
    num: '01',
    rotulo: 'Como planilhas no Excel',
    descricao: 'Várias **abas** no mesmo arquivo — troque entre elas sem perder o layout de cada uma.',
    icone: Layout,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.1)',
  },
  {
    num: '02',
    rotulo: 'Layout próprio',
    descricao: 'Guarda **colunas**, **ordem**, **filtros**, **larguras** e **busca** — um recorte completo da lista.',
    icone: Table,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '03',
    rotulo: 'Novo painel',
    descricao: 'Ao criar (**+**), nasce uma **nova aba** com o estado atual da tabela — pronta para você ajustar ao recorte desejado.',
    icone: Plus,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '04',
    rotulo: 'Filtros por painel',
    descricao: 'Em cada aba, aplique filtros e colunas diferentes — o painel **Padrão** vem com o produto; os demais são seus.',
    icone: Funnel,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
]

const EXEMPLOS_ABAS = [
  'Em andamento',
  'Finalizadas',
  'Conferidas',
  'Não conferidas',
  'Por região',
] as const

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardItem({ card }: { card: CardPainel }) {
  const Icone = card.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: card.fundo,
      border: `1px solid ${card.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.1em',
          color: card.cor,
          opacity: 0.9,
        }}>
          {card.num}
        </span>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${card.borda}`,
        }}>
          <Icone size={18} weight="duotone" color={card.cor} />
        </div>
      </div>
      <div>
        <p style={{
          margin: 0,
          fontWeight: 800,
          fontSize: '.78rem',
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {card.rotulo}
        </p>
        <p style={{
          margin: '7px 0 0',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderizarNegrito(card.descricao)}
        </p>
      </div>
    </div>
  )
}

function FaixaAbasExemplo() {
  return (
    <div style={{
      borderRadius: 10,
      padding: '12px 14px',
      background: 'rgba(8,12,24,.28)',
      border: '1px solid rgba(129,140,248,.28)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        flexWrap: 'wrap',
      }}>
        <SlidersHorizontal size={15} weight="duotone" color="#818cf8" />
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#a5b4fc',
        }}>
          Exemplos de abas
        </span>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: '.7rem',
          fontWeight: 700,
          padding: '5px 12px',
          borderRadius: 8,
          background: 'rgba(99,102,241,.22)',
          border: '1px solid rgba(129,140,248,.45)',
          color: '#e0e7ff',
        }}>
          Padrão
        </span>
        {EXEMPLOS_ABAS.map((aba) => (
          <span
            key={aba}
            style={{
              fontSize: '.7rem',
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 8,
              background: 'rgba(148,163,184,.08)',
              border: '1px solid rgba(148,163,184,.2)',
              color: '#cbd5e1',
            }}
          >
            {aba}
          </span>
        ))}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'rgba(52,211,153,.12)',
          border: '1px dashed rgba(52,211,153,.4)',
          color: '#6ee7b7',
          fontSize: '.85rem',
          fontWeight: 700,
        }}>
          +
        </span>
      </div>
      <p style={{
        margin: 0,
        fontSize: '.72rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        Monte quantas abas precisar — como planilhas no Excel, cada uma com filtros e colunas para o fluxo do seu time.
      </p>
    </div>
  )
}

/** Manual Smart Docs §05 — mapa dos painéis da Lista */
export function ManualInfograficoSmartDocsListaPaineis() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(96,165,250,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 20,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <BookmarkSimple size={18} weight="duotone" color="#818cf8" />
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
            padding: '4px 10px',
          }}>
            <Sparkle size={12} weight="fill" />
            Por usuário no workspace
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: '.9rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          Como o Excel — várias planilhas no mesmo arquivo
        </p>
        <p style={{
          margin: '8px 0 0',
          fontSize: '.74rem',
          lineHeight: 1.5,
          color: CORPO_70,
          whiteSpace: 'nowrap',
        }}>
          Cada painel é uma <strong style={{ color: '#cbd5e1' }}>aba</strong> com layout próprio sobre a mesma lista de leituras.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {CARDS.map((card) => (
          <CardItem key={card.num} card={card} />
        ))}
      </div>

      <FaixaAbasExemplo />
    </div>
  )
}

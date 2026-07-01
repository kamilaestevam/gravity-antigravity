import React from 'react'
import {
  ArrowsLeftRight,
  ClockCounterClockwise,
  FilePdf,
  GearSix,
  Package,
  PencilSimpleLine,
  PlusCircle,
  Scissors,
  Stack,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CardPedido = {
  num: number
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

type GrupoPedido = {
  titulo: string
  subtitulo?: string
  colunas?: number
  fluxo?: boolean
  cards: CardPedido[]
}

const GRUPOS: GrupoPedido[] = [
  {
    titulo: 'Ciclo do PO — antes do embarque',
    subtitulo: 'Do rascunho à consolidação, no mesmo workspace',
    fluxo: true,
    colunas: 4,
    cards: [
      {
        num: 1,
        rotulo: 'Pedidos criados',
        descricao: 'PO e itens em montagem.',
        icone: PlusCircle,
        cor: '#818cf8',
        borda: 'rgba(129,140,248,.32)',
        fundo: 'rgba(99,102,241,.1)',
      },
      {
        num: 2,
        rotulo: 'Pedidos parciais',
        descricao: 'Saldo em aberto, quantidades transferidas e itens ainda pendentes.',
        icone: Scissors,
        cor: '#fbbf24',
        borda: 'rgba(251,191,36,.32)',
        fundo: 'rgba(251,191,36,.08)',
      },
      {
        num: 3,
        rotulo: 'Transferir',
        descricao: 'Pedidos e itens para **novo pedido** ou **pedido existente**.',
        icone: ArrowsLeftRight,
        cor: '#38bdf8',
        borda: 'rgba(56,189,248,.32)',
        fundo: 'rgba(56,189,248,.08)',
      },
      {
        num: 4,
        rotulo: 'Consolidar',
        descricao: 'Unir pedidos diferentes para o embarque.',
        icone: Stack,
        cor: '#34d399',
        borda: 'rgba(52,211,153,.32)',
        fundo: 'rgba(52,211,153,.08)',
      },
    ],
  },
  {
    titulo: 'Ações e governança',
    colunas: 3,
    cards: [
      {
        num: 5,
        rotulo: 'Novo pedido e item',
        descricao: 'Criação do PO e das linhas de produto.',
        icone: Package,
        cor: '#fb923c',
        borda: 'rgba(251,146,60,.32)',
        fundo: 'rgba(251,146,60,.08)',
      },
      {
        num: 6,
        rotulo: 'Edição em massa · Documentos',
        descricao: 'Alterações em lote e PDFs a partir da seleção na lista.',
        icone: PencilSimpleLine,
        cor: '#e879f9',
        borda: 'rgba(232,121,249,.32)',
        fundo: 'rgba(232,121,249,.08)',
      },
      {
        num: 7,
        rotulo: 'Configurações · Histórico',
        descricao: 'Preferências do workspace e trilha de auditoria.',
        icone: GearSix,
        cor: '#94a3b8',
        borda: 'rgba(148,163,184,.28)',
        fundo: 'rgba(148,163,184,.08)',
      },
    ],
  },
]

function renderDescricao(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardPedidoVisaoGeral({ card }: { card: CardPedido }) {
  const Icone = card.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '13px 14px',
      background: card.fundo,
      border: `1px solid ${card.borda}`,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '.62rem',
        fontWeight: 800,
        color: card.cor,
        background: 'rgba(8,12,24,.4)',
        border: `1px solid ${card.borda}`,
      }}>
        {card.num}
      </div>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        background: 'linear-gradient(145deg, rgba(8,12,24,.55), rgba(8,12,24,.2))',
        border: `1px solid ${card.borda}`,
        boxShadow: `0 0 20px ${card.borda}`,
      }}>
        <Icone size={22} weight="duotone" color={card.cor} />
      </div>
      <p style={{
        margin: 0,
        fontWeight: 800,
        fontSize: '.78rem',
        color: '#e2e8f0',
        lineHeight: 1.35,
        paddingRight: 26,
      }}>
        {card.rotulo}
      </p>
      <p style={{
        margin: '7px 0 0',
        fontSize: '.72rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        {renderDescricao(card.descricao)}
      </p>
    </div>
  )
}

function SetaFluxo() {
  return (
    <div
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(129,140,248,.55)',
        fontSize: '1.1rem',
        fontWeight: 700,
        padding: '0 2px',
        flexShrink: 0,
      }}
    >
      →
    </div>
  )
}

/** Manual Pedido §01 — mapa visual do produto antes do embarque */
export function ManualInfograficoPedidoVisaoGeral() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(245,158,11,.07) 0%, rgba(99,102,241,.06) 42%, rgba(148,163,184,.04) 100%)',
      border: '1px solid rgba(148,163,184,.16)',
      borderRadius: 14,
      padding: '18px 18px 14px',
      marginTop: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 18,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'var(--ws-muted,#94a3b8)', margin: '0 0 6px',
          }}>
            Mapa do produto
          </p>
          <p style={{
            margin: 0,
            fontSize: '.84rem',
            fontWeight: 700,
            color: '#e2e8f0',
            lineHeight: 1.35,
          }}>
            Tudo o que o Pedido cobre antes do embarque
          </p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 11px',
          borderRadius: 999,
          background: 'rgba(245,158,11,.12)',
          border: '1px solid rgba(245,158,11,.28)',
          fontSize: '.64rem',
          fontWeight: 700,
          color: '#fbbf24',
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          <Package size={14} weight="duotone" />
          Gestão de PO
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GRUPOS.map((grupo) => (
          <section key={grupo.titulo}>
            <p style={{
              margin: '0 0 6px',
              fontSize: '.7rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}>
              {grupo.titulo}
            </p>
            {grupo.subtitulo && (
              <p style={{
                margin: '0 0 12px',
                fontSize: '.7rem',
                color: CORPO_70,
                lineHeight: 1.45,
              }}>
                {grupo.subtitulo}
              </p>
            )}
            {grupo.fluxo ? (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'stretch',
                gap: 8,
              }}>
                {grupo.cards.map((card, i) => (
                  <React.Fragment key={card.rotulo}>
                    <div style={{ flex: '1 1 200px', minWidth: 180, maxWidth: '100%' }}>
                      <CardPedidoVisaoGeral card={card} />
                    </div>
                    {i < grupo.cards.length - 1 && <SetaFluxo />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${grupo.colunas === 3 ? 220 : 200}px, 1fr))`,
                gap: 10,
              }}>
                {grupo.cards.map((card) => (
                  <CardPedidoVisaoGeral key={card.rotulo} card={card} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid rgba(148,163,184,.12)',
        flexWrap: 'wrap',
      }}>
        <FilePdf size={16} weight="duotone" color="#818cf8" />
        <p style={{
          margin: 0,
          fontSize: '.68rem',
          color: CORPO_70,
          lineHeight: 1.5,
          flex: 1,
          minWidth: 200,
        }}>
          O Pedido integra <strong style={{ color: '#cbd5e1' }}>Processo</strong>, <strong style={{ color: '#cbd5e1' }}>BID Frete</strong> e demais módulos COMEX — este mapa resume o que você opera aqui até o embarque.
        </p>
        <ClockCounterClockwise size={16} weight="duotone" color="#94a3b8" aria-hidden />
      </div>
    </div>
  )
}

import React from 'react'
import {
  ArrowsLeftRight,
  ArrowDown,
  ArrowUp,
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
import {
  MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
  MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CardOperacaoPedido = {
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  gradiente: string
}

const OPERACOES_PEDIDO: CardOperacaoPedido[] = [
  {
    rotulo: 'Importação',
    descricao: 'Pedidos de **entrada**: compra no exterior e recebimento no país.',
    icone: ArrowDown,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.38)',
    fundo: 'rgba(45,212,191,.1)',
    gradiente: 'linear-gradient(135deg, rgba(45,212,191,.14) 0%, rgba(8,12,24,.35) 72%)',
  },
  {
    rotulo: 'Exportação',
    descricao: 'Pedidos de **saída**: venda para o exterior a partir do workspace.',
    icone: ArrowUp,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.38)',
    fundo: 'rgba(251,191,36,.1)',
    gradiente: 'linear-gradient(135deg, rgba(251,191,36,.14) 0%, rgba(8,12,24,.35) 72%)',
  },
]

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
    titulo: 'Ciclo do PO: antes do embarque',
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
    subtitulo: 'Do cadastro de POs às preferências e trilha de auditoria do workspace',
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

/** Espaço título de seção ↔ subtítulo (bloco de cabeçalho interno). */
const ESPACO_TITULO_SUBTITULO_GRUPO_PX = 4

const ESTILO_TITULO_GRUPO: React.CSSProperties = {
  margin: 0,
  fontSize: '.72rem',
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: '#818cf8',
}

const ESTILO_SUBTITULO_GRUPO: React.CSSProperties = {
  margin: 0,
  fontSize: '.7rem',
  color: CORPO_70,
  lineHeight: 1.45,
}

function TituloSubtituloGrupo({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
      <p style={{
        ...ESTILO_TITULO_GRUPO,
        marginBottom: subtitulo ? ESPACO_TITULO_SUBTITULO_GRUPO_PX : 0,
      }}>
        {titulo}
      </p>
      {subtitulo && (
        <p style={ESTILO_SUBTITULO_GRUPO}>{subtitulo}</p>
      )}
    </div>
  )
}

function renderDescricao(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardOperacaoPedidoVisaoGeral({ card }: { card: CardOperacaoPedido }) {
  const Icone = card.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 15px',
      background: card.gradiente,
      border: `1px solid ${card.borda}`,
      height: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.04), 0 0 24px ${card.borda.replace(/[\d.]+\)$/, '.08)')}`,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: card.fundo,
        border: `1px solid ${card.borda}`,
        boxShadow: `0 0 22px ${card.borda}`,
      }}>
        <Icone size={24} weight="duotone" color={card.cor} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          margin: 0,
          fontWeight: 800,
          fontSize: '.8rem',
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {card.rotulo}
        </p>
        <p style={{
          margin: '6px 0 0',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderDescricao(card.descricao)}
        </p>
      </div>
    </div>
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
      padding: '16px 18px 18px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
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

      <div style={{ marginTop: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: MANUAL_ESPACO_PARAGRAFO_PX,
        }}>
          {OPERACOES_PEDIDO.map((card) => (
            <CardOperacaoPedidoVisaoGeral key={card.rotulo} card={card} />
          ))}
        </div>

        {GRUPOS.map((grupo) => (
          <section
            key={grupo.titulo}
            style={{ marginTop: MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX }}
          >
            <TituloSubtituloGrupo titulo={grupo.titulo} subtitulo={grupo.subtitulo} />
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
        marginTop: MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
        paddingTop: 14,
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
          O Pedido integra <strong style={{ color: '#cbd5e1' }}>Processo</strong>, <strong style={{ color: '#cbd5e1' }}>BID Frete</strong> e demais módulos COMEX: este mapa resume o que você opera aqui até o embarque.
        </p>
        <ClockCounterClockwise size={16} weight="duotone" color="#94a3b8" aria-hidden />
      </div>
    </div>
  )
}

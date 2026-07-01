import React from 'react'
import {
  ArrowsOutLineVertical,
  CloudArrowUp,
  Columns,
  Export,
  Layout,
  MagnifyingGlass,
  PencilSimpleLine,
  Plus,
  Rows,
  SquaresFour,
  Table,
  Trash,
  TreeStructure,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const IMG = {
  lista: '/university/screenshots/smart-docs-lista.png',
  listaVisaoGeral: '/university/screenshots/smart-docs-lista-visao-geral.png',
  transacoesApi: '/university/screenshots/smart-docs-lista-transacoes-api.png',
  paineis: '/university/screenshots/smart-docs-lista-paineis-seta.png',
  painelNovo: '/university/screenshots/smart-docs-lista-paineis-novo-seta.png',
  excluirSeta: '/university/screenshots/smart-docs-lista-excluir-seta.png',
  colunas: '/university/screenshots/smart-docs-lista-colunas-customizar.png',
  expandirSeta: '/university/screenshots/smart-docs-lista-expandir-seta.png',
  expandirTodos: '/university/screenshots/smart-docs-lista-expandir-todos-seta.png',
  linhaExpandida: '/university/screenshots/smart-docs-lista-linha-expandida.png',
  novaLeitura: '/university/screenshots/smart-docs-lista-nova-leitura.png',
} as const

type CapituloRef = {
  num: number
  rotulo: string
}

type RecorteTela = {
  objectPosition?: string
}

type ItemZona = {
  rotulo: string
  descricao: string
  icone: Icon
  capitulos: CapituloRef[]
  imagem: string
  recorte?: RecorteTela
}

type ZonaLista = {
  id: string
  titulo: string
  faixa: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  itens: ItemZona[]
}

const ZONAS: ZonaLista[] = [
  {
    id: 'visoes',
    titulo: 'Visões (abas)',
    faixa: 'Topo da Lista',
    icone: SquaresFour,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.1)',
    itens: [
      {
        rotulo: 'Visão geral',
        descricao: 'Todas as leituras do workspace — interface e consolidado.',
        icone: Table,
        capitulos: [{ num: 1, rotulo: 'Visão geral' }],
        imagem: IMG.listaVisaoGeral,
        recorte: { objectPosition: 'center 22%' },
      },
      {
        rotulo: 'Transações (API)',
        descricao: 'Só leituras com origem API — reconciliar integrações.',
        icone: CloudArrowUp,
        capitulos: [{ num: 8, rotulo: 'API' }],
        imagem: IMG.transacoesApi,
        recorte: { objectPosition: 'center 28%' },
      },
    ],
  },
  {
    id: 'paineis',
    titulo: 'Painéis',
    faixa: 'Abaixo das visões',
    icone: Layout,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.35)',
    fundo: 'rgba(139,92,246,.09)',
    itens: [
      {
        rotulo: 'Padrão e salvos',
        descricao: 'Troca layouts com colunas, ordem e filtros por usuário.',
        icone: Layout,
        capitulos: [{ num: 6, rotulo: 'Painéis' }],
        imagem: IMG.paineis,
        recorte: { objectPosition: 'center 38%' },
      },
      {
        rotulo: 'Novo painel (+)',
        descricao: 'Crie um painel com nome único e salve preferências.',
        icone: Plus,
        capitulos: [{ num: 7, rotulo: 'Novo painel' }],
        imagem: IMG.painelNovo,
        recorte: { objectPosition: 'center 40%' },
      },
    ],
  },
  {
    id: 'barra',
    titulo: 'Barra da tabela',
    faixa: 'Acima da grade',
    icone: Rows,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
    itens: [
      {
        rotulo: 'Localizar',
        descricao: 'Filtro rápido por texto na página visível.',
        icone: MagnifyingGlass,
        capitulos: [{ num: 1, rotulo: 'Visão geral' }],
        imagem: IMG.lista,
        recorte: { objectPosition: '18% 46%', altura: 72 },
      },
      {
        rotulo: 'Novo',
        descricao: 'Abre o wizard Nova Leitura (seção 06 do manual).',
        icone: Plus,
        capitulos: [],
        imagem: IMG.novaLeitura,
        recorte: { objectPosition: 'center top' },
      },
      {
        rotulo: 'Excluir',
        descricao: 'Remove leituras marcadas no checkbox.',
        icone: Trash,
        capitulos: [{ num: 4, rotulo: 'Excluir' }],
        imagem: IMG.excluirSeta,
        recorte: { objectPosition: 'center 42%' },
      },
      {
        rotulo: 'Colunas',
        descricao: 'Ocultar, exibir, arrastar e criar colunas.',
        icone: Columns,
        capitulos: [{ num: 2, rotulo: 'Customizar' }],
        imagem: IMG.colunas,
        recorte: { objectPosition: 'right 35%' },
      },
      {
        rotulo: 'Exportar',
        descricao: 'Excel, CSV, PDF ou JSON do recorte atual.',
        icone: Export,
        capitulos: [{ num: 5, rotulo: 'Exportar' }],
        imagem: IMG.lista,
        recorte: { objectPosition: '88% 44%', altura: 72 },
      },
      {
        rotulo: 'Expandir todos',
        descricao: 'Abre todas as linhas visíveis de uma vez.',
        icone: ArrowsOutLineVertical,
        capitulos: [{ num: 3, rotulo: 'Expandir' }],
        imagem: IMG.expandirTodos,
        recorte: { objectPosition: 'center 48%' },
      },
    ],
  },
  {
    id: 'grade',
    titulo: 'Grade de leituras',
    faixa: 'Corpo da tela',
    icone: Table,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    itens: [
      {
        rotulo: 'Checkbox',
        descricao: 'Seleção em lote para Excluir e outras ações.',
        icone: Rows,
        capitulos: [{ num: 4, rotulo: 'Excluir' }],
        imagem: IMG.excluirSeta,
        recorte: { objectPosition: 'left 52%', altura: 76 },
      },
      {
        rotulo: 'Seta expandir',
        descricao: 'Linha mãe e documentos filhos na mesma lista.',
        icone: TreeStructure,
        capitulos: [{ num: 3, rotulo: 'Expandir' }],
        imagem: IMG.expandirSeta,
        recorte: { objectPosition: 'center 55%' },
      },
      {
        rotulo: 'Nome da leitura',
        descricao: 'Link para retomar conferência e editar campos extraídos.',
        icone: PencilSimpleLine,
        capitulos: [],
        imagem: IMG.lista,
        recorte: { objectPosition: '28% 58%', altura: 76 },
      },
      {
        rotulo: 'Colunas de métricas',
        descricao: 'Status, tipos, acertos, origem Interface ou API.',
        icone: Columns,
        capitulos: [{ num: 2, rotulo: 'Customizar' }],
        imagem: IMG.linhaExpandida,
        recorte: { objectPosition: 'center 62%' },
      },
    ],
  },
]

function scrollParaCapitulo(num: number) {
  const alvo = document.getElementById(`manual-passo-lista-${num}`)
  alvo?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function CapituloPill({ cap }: { cap: CapituloRef }) {
  return (
    <button
      type="button"
      onClick={() => scrollParaCapitulo(cap.num)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 999,
        border: '1px solid rgba(129,140,248,.35)',
        background: 'rgba(99,102,241,.12)',
        color: '#c7d2fe',
        fontSize: '.6rem',
        fontWeight: 800,
        letterSpacing: '.04em',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background .15s, border-color .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(99,102,241,.22)'
        e.currentTarget.style.borderColor = 'rgba(129,140,248,.55)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(99,102,241,.12)'
        e.currentTarget.style.borderColor = 'rgba(129,140,248,.35)'
      }}
    >
      {String(cap.num).padStart(2, '0')} · {cap.rotulo}
    </button>
  )
}

function MiniaturaTelaPequena({
  src,
  alt,
  corBorda,
  recorte,
}: {
  src: string
  alt: string
  corBorda: string
  recorte?: RecorteTela
}) {
  return (
    <div
      title={alt}
      style={{
        width: 92,
        height: 52,
        flexShrink: 0,
        borderRadius: 6,
        overflow: 'hidden',
        border: `1px solid ${corBorda}`,
        background: '#0b1220',
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: recorte?.objectPosition ?? 'center center',
          display: 'block',
        }}
      />
    </div>
  )
}

function CardItemZona({ item, corZona, bordaZona }: {
  item: ItemZona
  corZona: string
  bordaZona: string
}) {
  const IconeItem = item.icone
  return (
    <div style={{
      borderRadius: 9,
      padding: '9px 10px',
      background: 'rgba(8,12,24,.22)',
      border: '1px solid rgba(148,163,184,.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <IconeItem size={15} weight="duotone" color={corZona} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: '.72rem', fontWeight: 800, color: '#e2e8f0' }}>
            {item.rotulo}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '.68rem', lineHeight: 1.45, color: CORPO_70 }}>
            {item.descricao}
          </p>
          {item.capitulos.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {item.capitulos.map((cap) => (
                <CapituloPill key={`${item.rotulo}-${cap.num}`} cap={cap} />
              ))}
            </div>
          ) : null}
        </div>
        <MiniaturaTelaPequena
          src={item.imagem}
          alt={item.rotulo}
          corBorda={bordaZona}
          recorte={item.recorte}
        />
      </div>
    </div>
  )
}

function CardZona({ zona }: { zona: ZonaLista }) {
  const IconeZona = zona.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: zona.fundo,
      border: `1px solid ${zona.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{
            margin: 0,
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: zona.cor,
            opacity: 0.95,
          }}>
            {zona.faixa}
          </p>
          <p style={{
            margin: '4px 0 0',
            fontSize: '.82rem',
            fontWeight: 800,
            color: '#e2e8f0',
            lineHeight: 1.3,
          }}>
            {zona.titulo}
          </p>
        </div>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${zona.borda}`,
          flexShrink: 0,
        }}>
          <IconeZona size={18} weight="duotone" color={zona.cor} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {zona.itens.map((item) => (
          <CardItemZona
            key={item.rotulo}
            item={item}
            corZona={zona.cor}
            bordaZona={zona.borda}
          />
        ))}
      </div>
    </div>
  )
}

/** Manual Smart Docs §05 — mapa visual da tela Lista (visão geral). */
export function ManualInfograficoSmartDocsListaVisaoGeral() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(15,23,42,.4) 38%, rgba(52,211,153,.06) 100%)',
      border: '1px solid rgba(148,163,184,.2)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 16,
      boxShadow: '0 12px 40px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{
          margin: 0,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}>
          Mapa da tela
        </p>
        <p style={{
          margin: '6px 0 0',
          fontSize: '.9rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
        }}>
          Quatro camadas — do topo à grade
        </p>
        <p style={{
          margin: '8px 0 0',
          fontSize: '.74rem',
          lineHeight: 1.5,
          color: CORPO_70,
          maxWidth: 620,
        }}>
          Cada área abaixo corresponde a um capítulo desta seção. Clique no chip numerado para ir direto ao passo.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {ZONAS.map((zona) => (
          <CardZona key={zona.id} zona={zona} />
        ))}
      </div>

      <div style={{
        borderRadius: 10,
        padding: '11px 14px',
        background: 'rgba(8,12,24,.28)',
        border: '1px solid rgba(129,140,248,.28)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px 10px',
      }}>
        <span style={{ fontSize: '.7rem', fontWeight: 800, color: '#c7d2fe' }}>
          Ir aos capítulos:
        </span>
        {[2, 3, 4, 5, 6, 7, 8].map((num) => {
          const labels: Record<number, string> = {
            2: 'Customizar',
            3: 'Expandir',
            4: 'Excluir',
            5: 'Exportar',
            6: 'Painéis',
            7: 'Novo painel',
            8: 'API',
          }
          return <CapituloPill key={num} cap={{ num, rotulo: labels[num] ?? '' }} />
        })}
      </div>
    </div>
  )
}

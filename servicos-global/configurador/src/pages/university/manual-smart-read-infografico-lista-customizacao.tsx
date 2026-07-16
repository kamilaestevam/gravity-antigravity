import React from 'react'
import {
  Columns,
  Eye,
  EyeSlash,
  ArrowsOutLineVertical,
  PlusCircle,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type PilarCustomizacao = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const PILARES: PilarCustomizacao[] = [
  {
    num: '01',
    rotulo: 'Ocultar coluna nativa',
    descricao: 'Desmarque métricas da leitura ou campos do catálogo que não quer ver na tabela.',
    icone: EyeSlash,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.32)',
    fundo: 'rgba(239,68,68,.08)',
  },
  {
    num: '02',
    rotulo: 'Exibir coluna nativa',
    descricao: 'Marque de volta colunas padrão ou do catálogo de documentos — a lista atualiza na hora.',
    icone: Eye,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '03',
    rotulo: 'Arrastar com sua preferência',
    descricao: 'Reordene os itens no menu **Colunas**; a sequência fica salva no painel ativo.',
    icone: ArrowsOutLineVertical,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '04',
    rotulo: 'Criar coluna customizada',
    descricao: 'Monte campos próprios além do catálogo — o fluxo completo está em **Configurações**.',
    icone: PlusCircle,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardPilar({ pilar }: { pilar: PilarCustomizacao }) {
  const Icone = pilar.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: pilar.fundo,
      border: `1px solid ${pilar.borda}`,
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
          color: pilar.cor,
          opacity: 0.9,
        }}>
          {pilar.num}
        </span>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${pilar.borda}`,
        }}>
          <Icone size={18} weight="duotone" color={pilar.cor} />
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
          {pilar.rotulo}
        </p>
        <p style={{
          margin: '7px 0 0',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderizarNegrito(pilar.descricao)}
        </p>
      </div>
    </div>
  )
}

/** Manual Smart Docs §05 — mapa da customização da Lista */
export function ManualInfograficoSmartDocsListaCustomizacao({
  margemSuperiorPx = 20,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: margemSuperiorPx,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Columns size={18} weight="duotone" color="#818cf8" />
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
              Altamente customizável
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
            A Lista do Smart Docs se adapta ao seu jeito de trabalhar
          </p>
          <p style={{
            margin: '8px 0 0',
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
            whiteSpace: 'nowrap',
          }}>
            Quatro ações no menu <strong style={{ color: '#cbd5e1' }}>Colunas</strong> montam a visualização ideal — nativas, catálogo ou campos próprios.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {PILARES.map((pilar) => (
          <CardPilar key={pilar.num} pilar={pilar} />
        ))}
      </div>

      <div style={{
        borderRadius: 10,
        padding: '12px 14px',
        background: 'rgba(8,12,24,.28)',
        border: '1px solid rgba(251,191,36,.28)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <p style={{
          margin: 0,
          fontSize: '.76rem',
          fontWeight: 800,
          color: '#fde68a',
          lineHeight: 1.4,
          letterSpacing: '.02em',
        }}>
          Ocultar + Exibir + Arrastar + Criar colunas = customização completa
        </p>
        <p style={{
          margin: 0,
          fontSize: '.72rem',
          lineHeight: 1.45,
          color: CORPO_70,
        }}>
          Uma vez salva, o sistema grava essa preferência <strong style={{ color: '#e2e8f0' }}>por usuário</strong>.
          Abaixo, o passo a passo de cada ação.
        </p>
      </div>
    </div>
  )
}

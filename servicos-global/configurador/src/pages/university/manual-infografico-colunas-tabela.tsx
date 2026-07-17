import React from 'react'
import {
  Article,
  Clock,
  Lightning,
  MapTrifold,
  Table,
  User,
  type Icon,
} from '@phosphor-icons/react'
import type { DocColunaTabela } from './manual-configurador-conteudo'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const ICONES_POR_COLUNA: Record<string, Icon> = {
  'Data/Hora': Clock,
  'Ação': Lightning,
  'Local': MapTrifold,
  'Usuário': User,
  'Detalhes': Article,
}

function renderizarTextoComNegrito(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>
    }
    return parte
  })
}

function iconeColuna(nome: string) {
  return ICONES_POR_COLUNA[nome] ?? Table
}

type Props = {
  colunas: DocColunaTabela[]
  titulo?: string
  subtitulo?: string
  marginTop?: number
}

/** Infográfico em cards — explica cada coluna da tabela de auditoria (Histórico, Pedido, etc.). */
export function ManualInfograficoColunasTabela({
  colunas,
  titulo = 'Colunas da tabela',
  subtitulo,
  marginTop = 16,
}: Props) {
  if (colunas.length === 0) return null

  const colunasGrade = colunas.length >= 5
    ? 'repeat(5, minmax(0, 1fr))'
    : `repeat(auto-fit, minmax(200px, 1fr))`

  return (
    <div style={{
      marginTop,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.07) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
      }}>
        <p style={{
          margin: 0,
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 auto',
        }}>
          <Table size={16} weight="duotone" color="#a5b4fc" aria-hidden />
          {titulo}
          <span style={{
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            textTransform: 'none',
            color: '#a5b4fc',
            background: 'rgba(99,102,241,.15)',
            border: '1px solid rgba(99,102,241,.35)',
            borderRadius: 999,
            padding: '2px 8px',
          }}>
            {colunas.length} colunas
          </span>
        </p>
        {subtitulo ? (
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70, flex: '1 1 220px' }}>
            {subtitulo}
          </p>
        ) : null}
      </div>

      <div style={{
        padding: '14px 16px 16px',
        display: 'grid',
        gridTemplateColumns: colunasGrade,
        gap: 10,
      }}>
        {colunas.map((col, i) => {
          const Icone = iconeColuna(col.coluna)
          return (
            <article
              key={col.coluna}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: '100%',
                borderRadius: 12,
                border: '1px solid rgba(129,140,248,.22)',
                background: 'rgba(8,12,24,.28)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderBottom: '1px solid rgba(148,163,184,.1)',
                background: 'rgba(99,102,241,.1)',
              }}>
                <span style={{
                  fontSize: '.58rem',
                  fontWeight: 800,
                  letterSpacing: '.06em',
                  color: '#c7d2fe',
                  background: 'rgba(99,102,241,.2)',
                  borderRadius: 6,
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Icone size={16} weight="duotone" color="#818cf8" aria-hidden />
                <p style={{
                  margin: 0,
                  fontSize: '.72rem',
                  fontWeight: 700,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: '#e2e8f0',
                  lineHeight: 1.3,
                }}>
                  {col.coluna}
                </p>
              </div>
              <div style={{ padding: '10px 12px 12px', flex: 1 }}>
                {col.imagem ? (
                  <img
                    src={col.imagem}
                    alt={`Coluna ${col.coluna}`}
                    style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                  />
                ) : null}
                {col.tituloColuna ? (
                  <p style={{ margin: '0 0 6px', fontSize: '.74rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {col.tituloColuna}
                  </p>
                ) : null}
                <p style={{ margin: col.detalhes?.length ? '0 0 8px' : 0, fontSize: '.74rem', lineHeight: 1.5, color: CORPO_70 }}>
                  {renderizarTextoComNegrito(col.descricao)}
                </p>
                {col.detalhes && col.detalhes.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: '.7rem', color: CORPO_70, lineHeight: 1.45 }}>
                    {col.detalhes.map((item) => (
                      <li key={item} style={{ marginBottom: 3 }}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

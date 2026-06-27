/**
 * PlayerAula — Reader de aula da Gravity University.
 * Layout: painel esquerdo (navegador de fases) + área principal (blocos de conteúdo).
 * Design: área de conteúdo com fundo claro (feel de documento/artigo).
 */

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ArrowRight, CheckCircle, Clock, Play,
  Quotes, Lightbulb, Image as ImageIcon,
} from '@phosphor-icons/react'
import type { AulaDemo, BlocoConteudo } from './conteudo-demo'

const UNI_COR = '#818cf8'
const CONTENT_BG = '#f8fafc'
const CONTENT_TEXT = '#0f172a'
const CONTENT_MUTED = '#64748b'
const ACCENT = '#6d28d9'

// ── Renderizador de bloco ──────────────────────────────────────────────────

function BlocoRenderer({ bloco }: { bloco: BlocoConteudo }) {
  switch (bloco.tipo) {
    case 'heading': {
      const nivel = (bloco.dados.nivel as number) ?? 1
      const Tag = (`h${nivel}`) as keyof JSX.IntrinsicElements
      const styles: Record<number, React.CSSProperties> = {
        1: { fontSize: '1.6rem', fontWeight: 800, color: CONTENT_TEXT, lineHeight: 1.2, margin: '2rem 0 0.5rem', paddingBottom: '0.5rem', borderBottom: `3px solid ${ACCENT}` },
        2: { fontSize: '1.15rem', fontWeight: 700, color: CONTENT_TEXT, margin: '1.75rem 0 0.4rem' },
        3: { fontSize: '1rem', fontWeight: 700, color: ACCENT, margin: '1.5rem 0 0.3rem' },
      }
      return <Tag style={styles[nivel] ?? styles[1]}>{String(bloco.dados.text)}</Tag>
    }

    case 'texto':
      return (
        <p style={{ fontSize: '.95rem', lineHeight: 1.75, color: CONTENT_TEXT, margin: '0.75rem 0' }}>
          {String(bloco.dados.text)}
        </p>
      )

    case 'imagem':
      return (
        <figure style={{ margin: '1.5rem 0' }}>
          <div style={{
            width: '100%', aspectRatio: '16/7', borderRadius: 10,
            background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
              <ImageIcon size={40} weight="duotone" />
              <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{String(bloco.dados.alt)}</span>
            </div>
          </div>
          {bloco.dados.caption && (
            <figcaption style={{ textAlign: 'center', fontSize: '.78rem', color: CONTENT_MUTED, marginTop: 8, fontStyle: 'italic' }}>
              {String(bloco.dados.caption)}
            </figcaption>
          )}
        </figure>
      )

    case 'video':
      return (
        <div style={{ margin: '1.5rem 0' }}>
          <div style={{
            width: '100%', aspectRatio: '16/9', borderRadius: 10,
            background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, cursor: 'pointer', border: '1px solid rgba(99,102,241,.3)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(129,140,248,.2)', border: '2px solid rgba(129,140,248,.5)',
              display: 'grid', placeItems: 'center',
            }}>
              <Play weight="fill" size={22} style={{ color: UNI_COR, marginLeft: 3 }} />
            </div>
            <div style={{ color: '#c7d2fe', fontWeight: 600, fontSize: '.9rem' }}>
              {String(bloco.dados.titulo)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#818cf8', fontSize: '.75rem' }}>
              <Clock size={13} />
              {String(bloco.dados.duracao)}
            </div>
          </div>
        </div>
      )

    case 'citacao':
      return (
        <blockquote style={{
          margin: '1.75rem 0',
          padding: '1.25rem 1.5rem',
          borderLeft: `4px solid ${ACCENT}`,
          background: `${ACCENT}08`,
          borderRadius: '0 10px 10px 0',
        }}>
          <Quotes weight="fill" size={28} style={{ color: ACCENT, opacity: .5, display: 'block', marginBottom: 8 }} />
          <p style={{ fontSize: '1.05rem', fontWeight: 700, fontStyle: 'italic', color: CONTENT_TEXT, margin: 0, lineHeight: 1.5 }}>
            {String(bloco.dados.texto)}
          </p>
          {bloco.dados.autor && (
            <footer style={{ marginTop: 10, fontSize: '.78rem', color: CONTENT_MUTED, fontWeight: 600 }}>
              — {String(bloco.dados.autor)}
            </footer>
          )}
        </blockquote>
      )

    case 'destaque':
      return (
        <div style={{
          margin: '1.5rem 0', padding: '1rem 1.25rem',
          background: `${ACCENT}0a`, border: `1px solid ${ACCENT}30`,
          borderRadius: 10, display: 'flex', gap: 12,
        }}>
          <Lightbulb weight="fill" size={20} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
          <div>
            {bloco.dados.titulo && (
              <div style={{ fontWeight: 700, color: ACCENT, fontSize: '.82rem', marginBottom: 4 }}>
                {String(bloco.dados.titulo)}
              </div>
            )}
            <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: CONTENT_TEXT, margin: 0 }}>
              {String(bloco.dados.text)}
            </p>
          </div>
        </div>
      )

    default:
      return null
  }
}

// ── Componente principal ───────────────────────────────────────────────────

interface PlayerAulaProps {
  produtoSlug: string
  faseSlug: string
  aula: AulaDemo
  todasAulas: AulaDemo[]
  concluidas: Set<string>
  onMarcarConcluida: (slug: string) => void
}

export function PlayerAula({ produtoSlug, faseSlug, aula, todasAulas, concluidas, onMarcarConcluida }: PlayerAulaProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const idxAtual = todasAulas.findIndex(a => a.slug === faseSlug)
  const anterior = idxAtual > 0 ? todasAulas[idxAtual - 1] : null
  const proxima = idxAtual < todasAulas.length - 1 ? todasAulas[idxAtual + 1] : null
  const jaConcluida = concluidas.has(faseSlug)

  const navParaFase = (slug: string) => navigate(`/university-gravity/academy/${produtoSlug}/${slug}`)

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', overflow: 'hidden' }}>

      {/* ── Painel esquerdo: navegador de fases ── */}
      <nav style={{
        width: 220, flexShrink: 0, borderRight: '1px solid rgba(148,163,184,.1)',
        overflowY: 'auto', padding: '1rem 0',
      }}>
        <button
          onClick={() => navigate(`/university-gravity/academy/${produtoSlug}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem', fontWeight: 600,
            padding: '0 16px', marginBottom: 12,
          }}
        >
          <ArrowLeft size={14} />
          {t('university.aula.voltar')}
        </button>

        <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {todasAulas.map((a, idx) => {
            const ativa = a.slug === faseSlug
            const feita = concluidas.has(a.slug)
            return (
              <button
                key={a.slug}
                onClick={() => navParaFase(a.slug)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: ativa ? `${UNI_COR}18` : 'transparent',
                  color: ativa ? UNI_COR : feita ? 'var(--ws-muted,#94a3b8)' : 'var(--ws-text,#f1f5f9)',
                  fontWeight: ativa ? 700 : 500, fontSize: '.82rem', width: '100%',
                  borderLeft: ativa ? `3px solid ${UNI_COR}` : '3px solid transparent',
                }}
              >
                {feita
                  ? <CheckCircle weight="fill" size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                  : (
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'grid', placeItems: 'center', fontSize: '.65rem', fontWeight: 800,
                      background: ativa ? `${UNI_COR}30` : 'rgba(148,163,184,.1)',
                      color: ativa ? UNI_COR : 'var(--ws-muted,#94a3b8)',
                    }}>
                      {idx + 1}
                    </span>
                  )
                }
                <span style={{ flex: 1, lineHeight: 1.3 }}>{a.titulo}</span>
                <span style={{ fontSize: '.68rem', color: 'var(--ws-muted,#94a3b8)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} />{a.duracao}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Área de conteúdo ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          maxWidth: 760, margin: '0 auto', width: '100%',
          padding: '1.5rem 2rem 2rem',
          background: CONTENT_BG,
          minHeight: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: CONTENT_MUTED, marginBottom: '1.5rem' }}>
            <span style={{ cursor: 'pointer', color: ACCENT, fontWeight: 600 }} onClick={() => navigate('/university-gravity/academy')}>
              Onboarding
            </span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: ACCENT, fontWeight: 600 }} onClick={() => navigate(`/university-gravity/academy/${produtoSlug}`)}>
              {t(`university.produto.${produtoSlug.replaceAll('-', '_')}`)}
            </span>
            <span>/</span>
            <span style={{ color: CONTENT_MUTED }}>{aula.titulo}</span>
          </div>

          {/* Blocos de conteúdo */}
          <div>
            {aula.blocos.map((bloco, idx) => (
              <BlocoRenderer key={idx} bloco={bloco} />
            ))}
          </div>

          {/* ── Navegação de rodapé ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '2.5rem', paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
          }}>
            {/* Anterior */}
            <button
              onClick={() => anterior && navParaFase(anterior.slug)}
              disabled={!anterior}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: '1px solid #e2e8f0', borderRadius: 9999,
                padding: '9px 16px', cursor: anterior ? 'pointer' : 'not-allowed',
                opacity: anterior ? 1 : .35,
                fontSize: '.82rem', fontWeight: 600, color: CONTENT_TEXT,
              }}
            >
              <ArrowLeft size={15} />
              {anterior ? anterior.titulo : t('university.aula.inicio')}
            </button>

            {/* Marcar concluída */}
            <button
              onClick={() => { onMarcarConcluida(faseSlug); if (proxima) navParaFase(proxima.slug) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: 'none', borderRadius: 9999, padding: '10px 22px',
                cursor: 'pointer', fontWeight: 700, fontSize: '.86rem',
                background: jaConcluida ? 'rgba(52,211,153,.15)' : ACCENT,
                color: jaConcluida ? '#059669' : '#fff',
              }}
            >
              <CheckCircle weight={jaConcluida ? 'fill' : 'regular'} size={16} />
              {jaConcluida ? t('university.acao.concluida') : t('university.aula.marcar_concluida')}
            </button>

            {/* Próxima */}
            <button
              onClick={() => proxima && navParaFase(proxima.slug)}
              disabled={!proxima}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: '1px solid #e2e8f0', borderRadius: 9999,
                padding: '9px 16px', cursor: proxima ? 'pointer' : 'not-allowed',
                opacity: proxima ? 1 : .35,
                fontSize: '.82rem', fontWeight: 600, color: CONTENT_TEXT,
              }}
            >
              {proxima ? proxima.titulo : t('university.aula.fim')}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

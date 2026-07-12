/**
 * PlayerAula — Reader de aula da Gravity University.
 * Layout: painel esquerdo (navegador de fases) + área principal (blocos de conteúdo).
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ArrowRight, CheckCircle, Clock, Play,
  Quotes, Lightbulb, Image as ImageIcon, BookOpen,
} from '@phosphor-icons/react'
import type { AulaDemo, BlocoConteudo } from './conteudo-demo'

const UNI_COR = '#818cf8'
const CONTENT_TEXT = 'var(--ws-text, #f1f5f9)'
const CONTENT_MUTED = 'var(--ws-muted, #94a3b8)'
const ACCENT = '#a78bfa'

// ── Sub-componentes com fallback para mídia ────────────────────────────────

function BlocoImagem({ bloco }: { bloco: BlocoConteudo }) {
  const [falhou, setFalhou] = useState(false)
  const temSrc = !!bloco.dados.src && !falhou
  return (
    <figure style={{ margin: '1.75rem 0' }}>
      {temSrc ? (
        <img
          src={String(bloco.dados.src)}
          alt={String(bloco.dados.alt ?? '')}
          onError={() => setFalhou(true)}
          style={{ width: '100%', borderRadius: 12, display: 'block', border: '1px solid rgba(148,163,184,.14)' }}
        />
      ) : (
        <div style={{
          width: '100%', aspectRatio: '16/7', borderRadius: 12,
          background: 'rgba(148,163,184,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(148,163,184,.12)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
            <ImageIcon size={44} weight="duotone" />
            <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{String(bloco.dados.alt ?? '')}</span>
          </div>
        </div>
      )}
      {bloco.dados.caption && (
        <figcaption style={{ textAlign: 'center', fontSize: '.78rem', color: CONTENT_MUTED, marginTop: 10, fontStyle: 'italic' }}>
          {String(bloco.dados.caption)}
        </figcaption>
      )}
    </figure>
  )
}

function BlocoVideo({ bloco }: { bloco: BlocoConteudo }) {
  const [falhou, setFalhou] = useState(false)
  const temSrc = !!bloco.dados.src && !falhou
  return (
    <div style={{ margin: '1.75rem 0' }}>
      {temSrc ? (
        <video
          src={String(bloco.dados.src)}
          controls
          onError={() => setFalhou(true)}
          style={{ width: '100%', borderRadius: 12, display: 'block', background: '#0f172a' }}
        />
      ) : (
        <div style={{
          width: '100%', aspectRatio: '16/9', borderRadius: 12,
          background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, border: '1px solid rgba(99,102,241,.3)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(129,140,248,.2)', border: '2px solid rgba(129,140,248,.5)',
            display: 'grid', placeItems: 'center',
          }}>
            <Play weight="fill" size={26} style={{ color: UNI_COR, marginLeft: 4 }} />
          </div>
          <div style={{ color: '#c7d2fe', fontWeight: 600, fontSize: '.92rem' }}>
            {String(bloco.dados.titulo ?? '')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#818cf8', fontSize: '.78rem' }}>
            <Clock size={13} /> {String(bloco.dados.duracao ?? '')}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Renderizador de bloco ──────────────────────────────────────────────────

function BlocoRenderer({ bloco }: { bloco: BlocoConteudo }) {
  switch (bloco.tipo) {
    case 'heading': {
      const nivel = (bloco.dados.nivel as number) ?? 1
      const Tag = (`h${nivel}`) as keyof JSX.IntrinsicElements
      const base: React.CSSProperties = { fontFamily: 'inherit', color: CONTENT_TEXT }
      const styles: Record<number, React.CSSProperties> = {
        1: { ...base, fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.2, margin: '2rem 0 0.6rem', paddingBottom: '0.6rem', borderBottom: `3px solid ${ACCENT}` },
        2: { ...base, fontSize: '1.2rem',  fontWeight: 700, margin: '1.75rem 0 0.4rem' },
        3: { ...base, fontSize: '1rem',    fontWeight: 700, color: ACCENT, margin: '1.5rem 0 0.3rem' },
      }
      return <Tag style={styles[nivel] ?? styles[1]}>{String(bloco.dados.text)}</Tag>
    }

    case 'texto':
      return (
        <p style={{ fontSize: '.96rem', lineHeight: 1.8, color: CONTENT_TEXT, margin: '0.8rem 0', fontFamily: 'inherit', whiteSpace: 'pre-line' }}>
          {String(bloco.dados.text)}
        </p>
      )

    case 'imagem':
      return <BlocoImagem bloco={bloco} />

    case 'video':
      return <BlocoVideo bloco={bloco} />

    case 'citacao':
      return (
        <div style={{
          margin: '1.75rem 0', padding: '1.5rem 1.75rem',
          borderLeft: `4px solid ${ACCENT}`,
          background: 'rgba(167,139,250,0.07)',
          borderRadius: '0 12px 12px 0',
        }}>
          <Quotes weight="fill" size={32} style={{ color: ACCENT, opacity: .4, display: 'block', marginBottom: 10 }} />
          <p style={{
            fontSize: '1.08rem', fontWeight: 700, fontStyle: 'italic',
            color: CONTENT_TEXT, margin: '0 0 10px 0', lineHeight: 1.6,
          }}>
            {String(bloco.dados.texto ?? '')}
          </p>
          {bloco.dados.autor && (
            <span style={{ fontSize: '.8rem', color: CONTENT_MUTED, fontWeight: 600 }}>
              — {String(bloco.dados.autor)}
            </span>
          )}
        </div>
      )

    case 'destaque':
      return (
        <div style={{
          margin: '1.5rem 0', padding: '1.1rem 1.4rem',
          background: 'rgba(167,139,250,0.08)', border: `1px solid rgba(167,139,250,0.2)`,
          borderRadius: 12, display: 'flex', gap: 14,
        }}>
          <Lightbulb weight="fill" size={20} style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
          <div>
            {bloco.dados.titulo && (
              <div style={{ fontWeight: 700, color: ACCENT, fontSize: '.82rem', marginBottom: 5 }}>
                {String(bloco.dados.titulo)}
              </div>
            )}
            <p style={{ fontSize: '.92rem', lineHeight: 1.65, color: CONTENT_TEXT, margin: 0 }}>
              {String(bloco.dados.text ?? '')}
            </p>
          </div>
        </div>
      )

    case 'definicao':
      return (
        <div style={{
          margin: '1.5rem 0', padding: '1.1rem 1.4rem',
          background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 12, display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <BookOpen weight="duotone" size={20} style={{ color: UNI_COR, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: UNI_COR, fontSize: '.82rem', marginBottom: 4 }}>
              {String(bloco.dados.termo)}
            </div>
            <p style={{ fontSize: '.92rem', lineHeight: 1.65, color: CONTENT_TEXT, margin: 0 }}>
              {String(bloco.dados.definicao)}
            </p>
          </div>
        </div>
      )

    case 'dois_colunas': {
      const lado = String(bloco.dados.imagem_lado ?? 'direita')
      const imgEl = (
        <div style={{
          flex: '0 0 45%', borderRadius: 10, overflow: 'hidden',
          background: 'rgba(148,163,184,.08)', border: '1px solid rgba(148,163,184,.12)',
          aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: CONTENT_MUTED }}>
            <ImageIcon size={32} weight="duotone" />
            <span style={{ fontSize: '.75rem', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>
              {String(bloco.dados.imagem_alt ?? '')}
            </span>
          </div>
        </div>
      )
      const txtEl = (
        <p style={{ flex: 1, fontSize: '.95rem', lineHeight: 1.8, color: CONTENT_TEXT, margin: 0, alignSelf: 'center' }}>
          {String(bloco.dados.texto ?? '')}
        </p>
      )
      return (
        <div style={{ display: 'flex', gap: '2rem', margin: '1.75rem 0', alignItems: 'center' }}>
          {lado === 'esquerda' ? <>{imgEl}{txtEl}</> : <>{txtEl}{imgEl}</>}
        </div>
      )
    }

    case 'timeline': {
      type TimelineItem = { label: string; descricao: string }
      const itens = JSON.parse(String(bloco.dados.itens ?? '[]')) as TimelineItem[]
      return (
        <div style={{ margin: '1.75rem 0' }}>
          {bloco.dados.titulo && (
            <div style={{ fontWeight: 700, color: CONTENT_TEXT, fontSize: '1rem', marginBottom: '1.25rem' }}>
              {String(bloco.dados.titulo)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {itens.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `${UNI_COR}20`, border: `2px solid ${UNI_COR}`,
                    display: 'grid', placeItems: 'center',
                    fontWeight: 800, fontSize: '.75rem', color: UNI_COR, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  {idx < itens.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 24, background: `${UNI_COR}30`, margin: '4px 0' }} />
                  )}
                </div>
                <div style={{ paddingBottom: idx < itens.length - 1 ? 20 : 0, paddingTop: 5 }}>
                  <div style={{ fontWeight: 700, color: CONTENT_TEXT, fontSize: '.9rem', marginBottom: 3 }}>
                    {item.label}
                  </div>
                  <p style={{ fontSize: '.85rem', color: CONTENT_MUTED, margin: 0, lineHeight: 1.6 }}>
                    {item.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'destaque_escuro':
      return (
        <div style={{
          margin: '1.75rem 0', borderRadius: 14,
          background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(148,163,184,.12)',
          overflow: 'hidden', display: 'flex',
        }}>
          <div style={{ flex: 1, padding: '1.75rem 2rem' }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem', marginBottom: 12 }}>
              {String(bloco.dados.titulo ?? '')}
            </div>
            <p style={{ fontSize: '.92rem', lineHeight: 1.75, color: '#94a3b8', margin: 0 }}>
              {String(bloco.dados.texto ?? '')}
            </p>
          </div>
          <div style={{
            flex: '0 0 38%', background: 'rgba(148,163,184,.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderLeft: '1px solid rgba(148,163,184,.08)', minHeight: 160,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#475569' }}>
              <ImageIcon size={30} weight="duotone" />
              <span style={{ fontSize: '.72rem', textAlign: 'center', padding: '0 12px' }}>
                {String(bloco.dados.imagem_alt ?? '')}
              </span>
            </div>
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
  const proxima  = idxAtual < todasAulas.length - 1 ? todasAulas[idxAtual + 1] : null
  const jaConcluida = concluidas.has(faseSlug)

  const navParaFase = (slug: string) => navigate(`/university-gravity/academy/${produtoSlug}/${slug}`)

  return (
    <div className="uni-player-aula">

      {/* ── Painel esquerdo: navegador de fases ── */}
      <nav className="uni-player-aula__nav">
        <button
          onClick={() => navigate(`/university-gravity/academy/${produtoSlug}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem', fontWeight: 600,
            padding: '0 16px', marginBottom: 14,
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
                  color: ativa ? UNI_COR : feita ? CONTENT_MUTED : CONTENT_TEXT,
                  fontWeight: ativa ? 700 : 500, fontSize: '.82rem', width: '100%',
                  borderLeft: ativa ? `3px solid ${UNI_COR}` : '3px solid transparent',
                }}
              >
                {feita
                  ? <CheckCircle weight="fill" size={16} style={{ color: UNI_COR, flexShrink: 0 }} />
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
                  <Clock size={10} /> {a.duracao}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Área de conteúdo ── */}
      <div className="uni-player-aula__content">
        <div className="uni-player-aula__article">

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: CONTENT_MUTED, marginBottom: '2rem' }}>
            <span style={{ cursor: 'pointer', color: ACCENT, fontWeight: 600 }} onClick={() => navigate('/university-gravity/academy')}>
              {t('university.nav.academy')}
            </span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ cursor: 'pointer', color: ACCENT, fontWeight: 600 }} onClick={() => navigate(`/university-gravity/academy/${produtoSlug}`)}>
              {t(`university.produto.${produtoSlug.replaceAll('-', '_')}`)}
            </span>
            <span style={{ color: '#cbd5e1' }}>/</span>
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
            marginTop: '3rem', paddingTop: '1.75rem',
            borderTop: '1px solid rgba(148,163,184,.12)', gap: 12,
          }}>
            {/* Anterior */}
            <button
              type="button"
              className="uni-player-aula__footer-btn"
              onClick={() => anterior && navParaFase(anterior.slug)}
              disabled={!anterior}
            >
              <ArrowLeft size={15} />
              <span style={{ flex: 1, textAlign: 'left' }}>{anterior ? anterior.titulo : t('university.aula.inicio')}</span>
            </button>

            {/* Marcar concluída */}
            <button
              type="button"
              className={`uni-player-aula__footer-btn--primary${jaConcluida ? ' is-concluida' : ''}`}
              onClick={() => { onMarcarConcluida(faseSlug); if (proxima) navParaFase(proxima.slug) }}
            >
              <CheckCircle weight={jaConcluida ? 'fill' : 'regular'} size={17} />
              {jaConcluida ? t('university.acao.concluida') : t('university.aula.marcar_concluida')}
            </button>

            {/* Próxima */}
            <button
              type="button"
              className="uni-player-aula__footer-btn uni-player-aula__footer-btn--next"
              onClick={() => proxima && navParaFase(proxima.slug)}
              disabled={!proxima}
            >
              <span style={{ flex: 1, textAlign: 'right' }}>{proxima ? proxima.titulo : t('university.aula.fim')}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

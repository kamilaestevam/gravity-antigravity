/**
 * Guia Gravity — infográfico "O que é o Gravity"
 * Referência visual: plataforma modular (peças) + DATI / DNA / Missão + em uma frase.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, GlobeHemisphereWest, Lightbulb } from '@phosphor-icons/react'

const CORPO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 72%, transparent)'
const UNI = '#818cf8'

const PRODUTOS = [
  { nome: 'Pedido', cor: '#fbbf24' },
  { nome: 'Smart Docs', cor: '#a78bfa' },
  { nome: 'BID Frete', cor: '#60a5fa' },
  { nome: 'BID Câmbio', cor: '#2dd4bf' },
] as const

const PILARES = [
  {
    num: '1',
    titulo: 'DATI',
    desc: 'Empresa de tecnologia em COMEX, Florianópolis, desde 2018.',
  },
  {
    num: '2',
    titulo: 'DNA',
    desc: 'Comércio Exterior + tecnologia + Inteligência Artificial.',
  },
  {
    num: '3',
    titulo: 'Missão',
    desc: 'Descomplicar rotinas e processos do dia a dia.',
  },
] as const

function PecaPuzzle({
  cor,
  style,
  path,
}: {
  cor: string
  style?: React.CSSProperties
  path: string
}) {
  return (
    <div style={{
      position: 'relative',
      width: 72,
      height: 72,
      ...style,
    }}>
      <svg
        viewBox="0 0 72 72"
        width="72"
        height="72"
        aria-hidden
        style={{
          display: 'block',
          filter: `drop-shadow(0 0 10px ${cor}55)`,
        }}
      >
        <path
          d={path}
          fill={`${cor}18`}
          stroke={cor}
          strokeWidth="1.6"
        />
        <circle cx="36" cy="36" r="5" fill={cor} />
      </svg>
    </div>
  )
}

/** Quatro peças encaixadas (metáfora da plataforma modular). */
function GradePecasModulares() {
  // Peças com “tabs” simples nas bordas internas para sugerir encaixe.
  const paths = [
    'M8 8 H40 C40 8 48 8 48 16 C48 24 40 24 40 32 H64 V64 H32 C32 64 32 56 24 56 C16 56 16 64 8 64 Z',
    'M8 8 H32 C32 8 32 16 40 16 C48 16 48 8 56 8 H64 V40 C64 40 56 40 56 48 C56 56 64 56 64 64 H8 V32 C8 32 16 32 16 24 C16 16 8 16 8 8 Z',
    'M8 8 H64 V32 C64 32 56 32 56 40 C56 48 64 48 64 56 V64 H40 C40 64 40 56 32 56 C24 56 24 64 8 64 V40 C8 40 16 40 16 32 C16 24 8 24 8 8 Z',
    'M8 8 H32 C32 8 32 16 40 16 C48 16 48 8 64 8 V64 H8 V40 C8 40 16 40 16 32 C16 24 8 24 8 8 Z',
  ]
  const cores = PRODUTOS.map(p => p.cor)

  return (
    <div
      aria-hidden
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 72px',
        gridTemplateRows: '72px 72px',
        gap: 6,
        padding: 8,
        flexShrink: 0,
      }}
    >
      {paths.map((path, i) => (
        <PecaPuzzle key={cores[i]} cor={cores[i]} path={path} />
      ))}
    </div>
  )
}

export function ManualInfograficoOQueEGravity() {
  return (
    <div
      role="group"
      aria-label="Infográfico: plataforma modular Gravity, DATI, DNA e missão"
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <style>{`
        @media (max-width: 720px) {
          .uni-infografico-modular-hero {
            flex-direction: column !important;
          }
          .uni-infografico-modular-pilares {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Hero: plataforma modular */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
        padding: '22px 22px 20px',
        background: 'linear-gradient(145deg, rgba(99,102,241,.2) 0%, rgba(15,23,42,.94) 50%, rgba(45,212,191,.08) 100%)',
        border: '1px solid rgba(129,140,248,.32)',
        boxShadow: '0 18px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)',
      }}>
        <div style={{
          position: 'absolute',
          inset: '-35% -10% auto auto',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,.28) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div
          className="uni-infografico-modular-hero"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#c7d2fe',
              background: 'rgba(99,102,241,.16)',
              border: '1px solid rgba(129,140,248,.35)',
              borderRadius: 999,
              padding: '5px 12px',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: UNI,
                boxShadow: `0 0 8px ${UNI}`,
              }} />
              Plataforma modular
            </span>

            <div>
              <p style={{
                margin: 0,
                padding: 0,
                fontSize: '1.28rem',
                fontWeight: 800,
                color: '#f8fafc',
                lineHeight: 1.25,
              }}>
                Monte o seu <span style={{ color: '#a78bfa' }}>Gravity</span>, peça por peça
              </p>
              <p style={{
                margin: 0,
                padding: '10px 0 0',
                fontSize: '.82rem',
                lineHeight: 1.55,
                color: CORPO,
                maxWidth: 440,
              }}>
                Você contrata só o que precisa hoje e acrescenta produtos depois: sem trocar de ecossistema.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {PRODUTOS.map((p) => (
                <span
                  key={p.nome}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: '.72rem',
                    fontWeight: 700,
                    color: '#e2e8f0',
                    background: 'rgba(8,12,24,.45)',
                    border: `1px solid ${p.cor}55`,
                    borderRadius: 999,
                    padding: '6px 12px',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: p.cor,
                    boxShadow: `0 0 8px ${p.cor}`,
                  }} />
                  {p.nome}
                </span>
              ))}
              <Link
                to="/store"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                  textDecoration: 'none',
                  padding: '6px 4px',
                  whiteSpace: 'nowrap',
                }}
              >
                Veja mais na Gravity Store
                <ArrowRight size={14} weight="bold" aria-hidden />
              </Link>
            </div>
          </div>

          <GradePecasModulares />
        </div>
      </div>

      {/* Dica */}
      <div style={{
        borderRadius: 14,
        padding: '14px 16px',
        background: 'rgba(167,139,250,.08)',
        border: '1px solid rgba(167,139,250,.22)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <Lightbulb weight="fill" size={20} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 1 }} aria-hidden />
        <div>
          <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '.78rem', marginBottom: 4 }}>
            Dica
          </div>
          <p style={{ margin: 0, fontSize: '.82rem', lineHeight: 1.55, color: CORPO }}>
            O ecossistema Gravity se adapta à sua empresa. Conforme você cresce, pode acoplar novos produtos para cobrir mais etapas da sua cadeia de suprimentos sem sair da plataforma.
          </p>
        </div>
      </div>

      {/* DATI · DNA · Missão */}
      <div
        className="uni-infografico-modular-pilares"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 10,
        }}
      >
        {PILARES.map((pilar) => (
          <div
            key={pilar.titulo}
            style={{
              borderRadius: 14,
              padding: '14px 14px 13px',
              background: 'rgba(148,163,184,.05)',
              border: '1px solid rgba(148,163,184,.14)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                fontSize: '.7rem',
                fontWeight: 800,
                color: '#c7d2fe',
                background: 'rgba(99,102,241,.18)',
                border: '1px solid rgba(129,140,248,.35)',
                flexShrink: 0,
              }}>
                {pilar.num}
              </span>
              <p style={{ margin: 0, fontSize: '.88rem', fontWeight: 800, color: '#f1f5f9' }}>
                {pilar.titulo}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: '.74rem', lineHeight: 1.5, color: CORPO }}>
              {pilar.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Em uma frase */}
      <div style={{
        borderRadius: 14,
        padding: '14px 16px',
        background: 'rgba(99,102,241,.08)',
        border: '1px solid rgba(129,140,248,.24)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <Lightbulb weight="fill" size={20} style={{ color: UNI, flexShrink: 0, marginTop: 1 }} aria-hidden />
        <div>
          <div style={{ fontWeight: 700, color: UNI, fontSize: '.78rem', marginBottom: 4 }}>
            Em uma frase
          </div>
          <p style={{ margin: 0, fontSize: '.85rem', lineHeight: 1.55, color: '#e2e8f0', fontWeight: 600 }}>
            Gravity = plataforma modular de COMEX + operação do time no mesmo ecossistema.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Card: Comércio Exterior + Tecnologia/IA = DNA do Gravity */
export function ManualInfograficoDnaGravity() {
  const lado: React.CSSProperties = {
    flex: 1,
    minWidth: 160,
    textAlign: 'center',
    padding: '4px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  }
  return (
    <div
      role="group"
      aria-label="DNA do Gravity: Comércio Exterior e Tecnologia com IA"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
        padding: '26px 22px 20px',
        background: 'linear-gradient(180deg, rgba(15,23,42,.98) 0%, rgba(12,10,28,.98) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        boxShadow: '0 16px 40px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: '40% auto auto 50%',
        width: 220,
        height: 220,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,.14) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flexWrap: 'wrap',
      }}>
        <div style={lado}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(45,212,191,.1)',
            border: '1px solid rgba(45,212,191,.35)',
            boxShadow: '0 0 22px rgba(45,212,191,.18)',
          }}>
            <GlobeHemisphereWest size={28} weight="duotone" color="#2dd4bf" aria-hidden />
          </div>
          <div>
            <p style={{ margin: 0, padding: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
              Comércio Exterior
            </p>
            <p style={{ margin: 0, padding: '6px 0 0', fontSize: '.78rem', lineHeight: 1.45, color: 'rgba(226,232,240,.62)' }}>
              Décadas de operação real em COMEX
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 8px',
          minWidth: 40,
          alignSelf: 'stretch',
          minHeight: 110,
        }}>
          <div style={{
            width: 1,
            flex: 1,
            minHeight: 16,
            background: 'linear-gradient(180deg, transparent, rgba(167,139,250,.55))',
          }} />
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(129,140,248,.18)',
            border: '1px solid rgba(167,139,250,.55)',
            boxShadow: '0 0 16px rgba(129,140,248,.35)',
            color: '#e2e8f0',
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1,
            flexShrink: 0,
          }}>
            +
          </div>
          <div style={{
            width: 1,
            flex: 1,
            minHeight: 16,
            background: 'linear-gradient(180deg, rgba(167,139,250,.55), transparent)',
          }} />
        </div>

        <div style={lado}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(167,139,250,.12)',
            border: '1px solid rgba(167,139,250,.4)',
            boxShadow: '0 0 22px rgba(167,139,250,.2)',
          }}>
            <Cpu size={28} weight="duotone" color="#a78bfa" aria-hidden />
          </div>
          <div>
            <p style={{ margin: 0, padding: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
              Tecnologia + IA
            </p>
            <p style={{ margin: 0, padding: '6px 0 0', fontSize: '.78rem', lineHeight: 1.45, color: 'rgba(226,232,240,.62)' }}>
              Software e Inteligência Artificial
            </p>
          </div>
        </div>
      </div>

      <p style={{
        position: 'relative',
        margin: '18px 0 0',
        padding: 0,
        textAlign: 'center',
        fontSize: '.88rem',
        fontWeight: 600,
        color: '#a5b4fc',
        letterSpacing: '.01em',
      }}>
        = o DNA do Gravity
      </p>
    </div>
  )
}

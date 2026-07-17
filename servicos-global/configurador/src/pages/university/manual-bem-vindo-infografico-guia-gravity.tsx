/**
 * Guia Gravity — infográfico da aula "O Guia Gravity"
 * (ecossistema onboarding+consulta+manual, GABI ao lado, jornada, mapa mental).
 */

import React from 'react'
import {
  Books,
  CheckCircle,
  Gear,
  GraduationCap,
  HandWaving,
  MagnifyingGlass,
  Path,
  SignIn,
  Sparkle,
  Stack,
  Steps,
  BookOpenText,
  type Icon,
} from '@phosphor-icons/react'

const CORPO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 72%, transparent)'
const CORPO_FRACO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 55%, transparent)'
const UNI = '#818cf8'
const GABI = '#c084fc'

type EtapaJornada = {
  num: string
  titulo: string
  desc: string
  icone: Icon
  cor: string
}

const JORNADA: EtapaJornada[] = [
  {
    num: '01',
    titulo: 'Bem Vindo',
    desc: 'Entenda a plataforma e o próprio guia.',
    icone: HandWaving,
    cor: '#a78bfa',
  },
  {
    num: '02',
    titulo: 'Login',
    desc: 'Primeiro acesso, conta e convites.',
    icone: SignIn,
    cor: '#60a5fa',
  },
  {
    num: '03',
    titulo: 'Configurador',
    desc: 'Organização, workspaces e usuários.',
    icone: Gear,
    cor: '#38bdf8',
  },
  {
    num: '04',
    titulo: 'Produtos',
    desc: 'Pedido, Processo, Smart Docs e BIDs.',
    icone: Stack,
    cor: '#34d399',
  },
  {
    num: '05',
    titulo: 'Domínio',
    desc: 'Operar com confiança no dia a dia.',
    icone: CheckCircle,
    cor: '#fbbf24',
  },
]

type NoMapa = {
  titulo: string
  desc: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const NOS_MAPA: NoMapa[] = [
  {
    titulo: 'Módulo',
    desc: 'Item do menu (Bem Vindo, Login, Configurador…).',
    icone: Books,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.35)',
    fundo: 'rgba(167,139,250,.1)',
  },
  {
    titulo: 'Aula (card)',
    desc: 'Uma etapa da jornada com XP e duração.',
    icone: GraduationCap,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.35)',
    fundo: 'rgba(96,165,250,.1)',
  },
  {
    titulo: 'Passos',
    desc: 'Sequência visual na tela (PASSO 01…).',
    icone: Steps,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.35)',
    fundo: 'rgba(52,211,153,.1)',
  },
  {
    titulo: 'Progresso',
    desc: 'Marque concluída e avance no ritmo.',
    icone: Path,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.35)',
    fundo: 'rgba(251,191,36,.1)',
  },
]

const PILARES_GUIA: {
  titulo: string
  desc: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}[] = [
  {
    titulo: 'Onboarding',
    desc: 'Trilha guiada: aprenda a plataforma do zero, no seu ritmo.',
    icone: HandWaving,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.4)',
    fundo: 'rgba(167,139,250,.12)',
  },
  {
    titulo: 'Consulta',
    desc: 'Volte a qualquer aula quando surgir a dúvida do dia a dia.',
    icone: MagnifyingGlass,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.4)',
    fundo: 'rgba(96,165,250,.12)',
  },
  {
    titulo: 'Manual',
    desc: 'Mesmo tema, em profundidade: fluxos, campos e regras.',
    icone: BookOpenText,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.4)',
    fundo: 'rgba(52,211,153,.12)',
  },
]

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '.62rem',
      fontWeight: 800,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: '#c7d2fe',
      background: 'rgba(99,102,241,.14)',
      border: '1px solid rgba(129,140,248,.32)',
      borderRadius: 999,
      padding: '4px 10px',
    }}>
      {children}
    </span>
  )
}

function TituloBloco({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: 0,
      padding: '0 0 12px',
      fontSize: '.78rem',
      fontWeight: 800,
      color: '#e2e8f0',
      letterSpacing: '.02em',
    }}>
      {children}
    </p>
  )
}

/** Infográfico completo: o que é o Guia Gravity, jornada e mapa mental. */
export function ManualInfograficoGuiaGravity({
  mostrarJornada = true,
  mostrarMapa = true,
}: {
  mostrarJornada?: boolean
  mostrarMapa?: boolean
} = {}) {
  return (
    <div
      role="group"
      aria-label="Infográfico do Guia Gravity: onboarding, consulta, manual e GABI AI"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <style>{`
        @media (max-width: 820px) {
          .uni-infografico-guia-ecossistema {
            grid-template-columns: 1fr !important;
          }
          .uni-infografico-guia-ecossistema__conecta {
            display: none !important;
          }
        }
        @media (max-width: 560px) {
          .uni-infografico-guia-pilares {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── Ecossistema: Guia (tudo junto) + GABI ao lado ── */}
      <div
        className="uni-infografico-guia-ecossistema"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) auto minmax(200px, .9fr)',
          gap: 14,
          alignItems: 'stretch',
        }}
      >
        {/* Guia Gravity: tudo junto */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 18,
          padding: '20px 18px 18px',
          background: 'linear-gradient(145deg, rgba(99,102,241,.24) 0%, rgba(15,23,42,.92) 48%, rgba(52,211,153,.1) 100%)',
          border: '1px solid rgba(129,140,248,.38)',
          boxShadow: '0 18px 48px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)',
          minWidth: 0,
        }}>
          <div style={{
            position: 'absolute',
            inset: '-30% -15% auto auto',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,.4) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <Badge>
                <GraduationCap size={14} weight="duotone" aria-hidden />
                Guia Gravity · tudo junto
              </Badge>
              <span style={{
                fontSize: '.62rem',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: '#a5b4fc',
              }}>
                um só lugar
              </span>
            </div>
            <div>
              <p style={{
                margin: 0,
                padding: 0,
                fontSize: '1.12rem',
                fontWeight: 800,
                color: '#f8fafc',
                lineHeight: 1.3,
              }}>
                Onboarding, consulta e manual: no mesmo espaço
              </p>
              <p style={{
                margin: 0,
                padding: '8px 0 0',
                fontSize: '.78rem',
                lineHeight: 1.55,
                color: CORPO,
                maxWidth: 520,
              }}>
                Você aprende, revisita e aprofunda sem mudar de produto. Três modos, uma experiência.
              </p>
            </div>
            <div
              className="uni-infografico-guia-pilares"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {PILARES_GUIA.map((pilar) => {
                const Icone = pilar.icone
                return (
                  <div
                    key={pilar.titulo}
                    style={{
                      borderRadius: 14,
                      padding: '14px 12px 12px',
                      background: pilar.fundo,
                      border: `1px solid ${pilar.borda}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      minWidth: 0,
                    }}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(8,12,24,.4)',
                      border: `1px solid ${pilar.borda}`,
                    }}>
                      <Icone size={18} weight="duotone" color={pilar.cor} aria-hidden />
                    </div>
                    <p style={{ margin: 0, padding: 0, fontSize: '.82rem', fontWeight: 800, color: '#f1f5f9' }}>
                      {pilar.titulo}
                    </p>
                    <p style={{ margin: 0, padding: 0, fontSize: '.66rem', lineHeight: 1.45, color: CORPO }}>
                      {pilar.desc}
                    </p>
                  </div>
                )
              })}
            </div>
            <p style={{
              margin: 0,
              padding: '2px 0 0',
              fontSize: '.68rem',
              fontWeight: 600,
              letterSpacing: '.04em',
              color: '#a5b4fc',
              textAlign: 'center',
            }}>
              Onboarding + Consulta + Manual = Guia Gravity
            </p>
          </div>
        </div>

        {/* Conector visual */}
        <div
          className="uni-infografico-guia-ecossistema__conecta"
          aria-hidden
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minWidth: 28,
            color: CORPO_FRACO,
          }}
        >
          <div style={{ width: 1, flex: 1, minHeight: 24, background: 'linear-gradient(180deg, transparent, rgba(192,132,252,.5), transparent)' }} />
          <span style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '.58rem',
            fontWeight: 800,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: '#c4b5fd',
          }}>
            ao lado
          </span>
          <div style={{ width: 1, flex: 1, minHeight: 24, background: 'linear-gradient(180deg, transparent, rgba(192,132,252,.5), transparent)' }} />
        </div>

        {/* GABI AI: fora, ao lado */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 18,
          padding: '20px 16px 18px',
          background: 'linear-gradient(160deg, rgba(192,132,252,.22) 0%, rgba(15,23,42,.95) 55%, rgba(244,114,182,.08) 100%)',
          border: '1px dashed rgba(192,132,252,.55)',
          boxShadow: '0 18px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minWidth: 0,
        }}>
          <div style={{
            position: 'absolute',
            inset: 'auto auto -20% -20%',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,132,252,.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
            <span style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '.58rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#e9d5ff',
              background: 'rgba(192,132,252,.16)',
              border: '1px solid rgba(192,132,252,.4)',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              Ao lado
            </span>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(192,132,252,.18)',
              border: '1px solid rgba(192,132,252,.45)',
              boxShadow: `0 0 28px ${GABI}33`,
            }}>
              <Sparkle size={24} weight="fill" color={GABI} aria-hidden />
            </div>
            <div>
              <p style={{ margin: 0, padding: 0, fontSize: '1.05rem', fontWeight: 800, color: '#faf5ff', lineHeight: 1.25 }}>
                GABI AI
              </p>
              <p style={{ margin: 0, padding: '6px 0 0', fontSize: '.72rem', lineHeight: 1.5, color: CORPO }}>
                Assistente inteligente da plataforma: responde dúvidas e acelera a operação: <strong style={{ color: '#e9d5ff', fontWeight: 700 }}>fora</strong> do Guia, mas sempre <strong style={{ color: '#e9d5ff', fontWeight: 700 }}>ao lado</strong> quando você precisar.
              </p>
            </div>
            <div style={{
              marginTop: 'auto',
              borderRadius: 10,
              padding: '10px 12px',
              background: 'rgba(8,12,24,.4)',
              border: '1px solid rgba(192,132,252,.28)',
              fontSize: '.66rem',
              lineHeight: 1.45,
              color: CORPO_FRACO,
            }}>
              Guia ensina o caminho · GABI ajuda no momento
            </div>
          </div>
        </div>
      </div>

      {mostrarJornada && (
      <div style={{
        borderRadius: 16,
        padding: '18px 16px 16px',
        background: 'rgba(148,163,184,.04)',
        border: '1px solid rgba(148,163,184,.16)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', paddingBottom: 4 }}>
          <TituloBloco>Jornada recomendada</TituloBloco>
          <Badge>
            <Path size={13} weight="duotone" aria-hidden />
            5 etapas
          </Badge>
        </div>
        <p style={{
          margin: 0,
          padding: '0 0 16px',
          fontSize: '.72rem',
          lineHeight: 1.45,
          color: CORPO_FRACO,
        }}>
          Siga nesta ordem na primeira vez. Depois, use qualquer módulo como referência rápida.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
          alignItems: 'stretch',
        }}>
          {JORNADA.map((etapa) => {
            const Icone = etapa.icone
            return (
              <div key={etapa.num} style={{ display: 'flex', alignItems: 'stretch', gap: 8, minWidth: 0 }}>
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: 12,
                  padding: '12px 10px',
                  background: 'rgba(8,12,24,.35)',
                  border: `1px solid ${etapa.cor}55`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.06em', color: etapa.cor }}>
                      {etapa.num}
                    </span>
                    <Icone size={16} weight="duotone" color={etapa.cor} aria-hidden />
                  </div>
                  <p style={{ margin: 0, padding: 0, fontSize: '.78rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3 }}>
                    {etapa.titulo}
                  </p>
                  <p style={{ margin: 0, padding: 0, fontSize: '.66rem', lineHeight: 1.4, color: CORPO }}>
                    {etapa.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )}

      {mostrarMapa && (
      <div style={{
        borderRadius: 16,
        padding: '18px 16px 16px',
        background: 'linear-gradient(165deg, rgba(99,102,241,.1) 0%, rgba(148,163,184,.03) 48%, rgba(56,189,248,.06) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <TituloBloco>Mapa mental: como o guia se organiza</TituloBloco>
          <Badge>hierarquia</Badge>
        </div>
        <p style={{
          margin: 0,
          padding: '0 0 16px',
          fontSize: '.72rem',
          lineHeight: 1.45,
          color: CORPO_FRACO,
        }}>
          Tudo parte do centro. Cada módulo abre aulas; cada aula pode ter passos e progresso.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 14,
          justifyItems: 'center',
        }}>
          <div style={{
            width: 'min(100%, 280px)',
            borderRadius: 16,
            padding: '16px 18px',
            textAlign: 'center',
            background: `linear-gradient(145deg, ${UNI}33 0%, rgba(15,23,42,.9) 100%)`,
            border: `1px solid ${UNI}66`,
            boxShadow: `0 0 32px ${UNI}22`,
          }}>
            <GraduationCap size={28} weight="duotone" color={UNI} aria-hidden />
            <p style={{ margin: 0, padding: '8px 0 4px', fontSize: '.95rem', fontWeight: 800, color: '#f8fafc' }}>
              Guia Gravity
            </p>
            <p style={{ margin: 0, padding: 0, fontSize: '.68rem', color: CORPO, lineHeight: 1.4 }}>
              onboarding · consulta · manual
            </p>
          </div>

          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
          }}>
            {NOS_MAPA.map((no) => {
              const Icone = no.icone
              return (
                <div
                  key={no.titulo}
                  style={{
                    borderRadius: 12,
                    padding: '12px 12px 11px',
                    background: no.fundo,
                    border: `1px solid ${no.borda}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    minHeight: 108,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(8,12,24,.35)',
                      border: `1px solid ${no.borda}`,
                      flexShrink: 0,
                    }}>
                      <Icone size={16} weight="duotone" color={no.cor} aria-hidden />
                    </div>
                    <p style={{ margin: 0, padding: 0, fontSize: '.78rem', fontWeight: 800, color: '#f1f5f9' }}>
                      {no.titulo}
                    </p>
                  </div>
                  <p style={{ margin: 0, padding: 0, fontSize: '.66rem', lineHeight: 1.45, color: CORPO }}>
                    {no.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      )}

    </div>
  )
}

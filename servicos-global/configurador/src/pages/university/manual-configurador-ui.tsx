import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gear, Crown, Buildings, Users, Handshake, CreditCard, Receipt, Pulse,
  CurrencyCircleDollar, ClockCounterClockwise, ArrowsOut, CaretDown,
  UserPlus, IdentificationCard, ArrowRight,
  type Icon,
} from '@phosphor-icons/react'
import {
  type ConfiguradorManualSlug,
  type DocTooltipKpi,
  type DocColunaTabela,
  type DocFluxo,
  type DocOrigemDados,
  type DocPassoVisual,
  type DocSecao,
  metadadosConfiguradorPagina,
  SCREENSHOT_HUB_ACESSO_CONFIGURADOR,
  secaoConfiguradorPorSlug,
} from './manual-configurador-conteudo'

const MANUAL_TITULO_COR = 'var(--ws-text,#f1f5f9)'
const MANUAL_CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const MANUAL_TIPO = {
  titulo: MANUAL_TITULO_COR,
  corpo: MANUAL_CORPO_70,
  secundario: 'var(--ws-muted,#c8d1dc)',
  meta: 'var(--ws-muted,#94a3b8)',
} as const

const MANUAL_ESTILO_PASSO_ROTULO: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', color: '#818cf8',
  textTransform: 'uppercase', margin: '0 0 8px',
}

const MANUAL_ESTILO_PASSO_TITULO: React.CSSProperties = {
  fontWeight: 700, fontSize: '.92rem', color: MANUAL_TITULO_COR, margin: '0 0 10px',
}

const MANUAL_ESTILO_CORPO: React.CSSProperties = {
  fontSize: '.9rem', color: MANUAL_CORPO_70, lineHeight: 1.8,
}

const MANUAL_LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

const MANUAL_ICONE_INLINE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  verticalAlign: 'text-bottom',
  margin: '0 3px',
  color: MANUAL_TIPO.secundario,
}

const CALLOUT_STYLE: Record<string, { bg: string; borda: string; label: string; cor: string }> = {
  aviso: { bg: 'rgba(239,68,68,.08)', borda: 'rgba(248,113,113,.35)', label: 'Aviso', cor: '#f87171' },
  exemplo: { bg: 'rgba(148,163,184,.08)', borda: 'rgba(148,163,184,.25)', label: 'Exemplo', cor: '#94a3b8' },
  dica: { bg: 'rgba(99,102,241,.08)', borda: 'rgba(129,140,248,.35)', label: 'Dica', cor: '#818cf8' },
  seguranca: { bg: 'rgba(52,211,153,.08)', borda: 'rgba(52,211,153,.35)', label: 'Segurança', cor: '#34d399' },
}

const MANUAL_ESTILO_CALLOUT_CORPO: React.CSSProperties = {
  fontSize: '.82rem', color: MANUAL_CORPO_70, lineHeight: 1.65,
}

function ManualTextoRich({ texto }: { texto: string }) {
  const linhas = texto.split('\n')
  return (
    <>
      {linhas.map((linha, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <ManualTextoRichLinha texto={linha} />
        </React.Fragment>
      ))}
    </>
  )
}

function ManualTextoRichLinha({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(https:\/\/[^\s]+|\{\{link:([^|]+)\|([^}]+)\}\})/g
  let ultimo = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index))
    if (match[1].startsWith('https://')) {
      partes.push(
        <a key={match.index} href={match[1]} target="_blank" rel="noreferrer" style={MANUAL_LINK_STYLE}>
          {match[1]}
        </a>,
      )
    } else if (match[2] !== undefined) {
      partes.push(
        <Link key={match.index} to={match[2]} style={MANUAL_LINK_STYLE}>
          {match[3]}
        </Link>,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes}</>
}

function ManualParagrafo({
  texto,
  marginBottom,
}: {
  texto: string
  marginBottom?: number | string
}) {
  return (
    <p style={{ ...MANUAL_ESTILO_CORPO, margin: marginBottom === 0 ? 0 : `0 0 ${marginBottom ?? 10}px` }}>
      <ManualTextoRich texto={texto} />
    </p>
  )
}

const ESTILO_BOTAO_AMPLIAR: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 11px', borderRadius: 9,
  background: 'rgba(99,102,241,.88)', border: '1px solid rgba(165,180,252,.45)',
  color: '#f8fafc', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.03em',
  backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,.28)',
  cursor: 'pointer',
}

function ManualFiguraScreenshot({ src, alt }: { src: string; alt: string }) {
  const [telaCheia, setTelaCheia] = useState(false)
  const ampliarAbaixo = src === SCREENSHOT_HUB_ACESSO_CONFIGURADOR

  useEffect(() => {
    if (!telaCheia) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTelaCheia(false)
    }
    document.addEventListener('keydown', onTecla)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onTecla)
      document.body.style.overflow = overflowAnterior
    }
  }, [telaCheia])

  const abrirTelaCheia = () => setTelaCheia(true)

  return (
    <>
      <div style={ampliarAbaixo ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' } : undefined}>
        <figure
          role="button"
          tabIndex={0}
          aria-label={`${alt} — abrir em tela cheia`}
          onClick={abrirTelaCheia}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              abrirTelaCheia()
            }
          }}
          style={{
            margin: 0, borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in',
            border: '1px solid rgba(148,163,184,.15)', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
            background: 'rgba(8,12,24,.55)', position: 'relative',
            width: ampliarAbaixo ? '100%' : undefined,
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', display: 'block', verticalAlign: 'top', objectFit: 'contain' }}
            onError={(e) => {
              const el = e.currentTarget.parentElement!
              el.style.maxHeight = 'unset'
              el.style.cursor = 'default'
              el.removeAttribute('role')
              el.innerHTML = `<div style="padding:48px;text-align:center;color:#475569;font-size:.8rem;background:rgba(148,163,184,.04)">📸 Salve o screenshot em<br/><code style="color:#818cf8;font-size:.75rem">${src}</code></div>`
            }}
          />
          {!ampliarAbaixo && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              ...ESTILO_BOTAO_AMPLIAR,
              pointerEvents: 'none',
            }}>
              <ArrowsOut size={15} weight="duotone" aria-hidden />
              Ampliar
            </span>
          )}
        </figure>
        {ampliarAbaixo && (
          <button
            type="button"
            onClick={abrirTelaCheia}
            aria-label={`${alt} — ampliar`}
            style={{ ...ESTILO_BOTAO_AMPLIAR, marginTop: 10 }}
          >
            <ArrowsOut size={15} weight="duotone" aria-hidden />
            Ampliar
          </button>
        )}
      </div>

      {telaCheia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setTelaCheia(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'rgba(2,6,23,.92)', backdropFilter: 'blur(4px)',
          }}
        >
          <button
            type="button"
            onClick={() => setTelaCheia(false)}
            aria-label="Fechar visualização em tela cheia"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(148,163,184,.12)', border: '1px solid rgba(148,163,184,.25)',
              color: '#f1f5f9', borderRadius: 8, padding: '8px 14px',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Fechar ✕
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(96vw, 1920px)', maxHeight: '92vh',
              width: 'auto', height: 'auto', objectFit: 'contain',
              borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,.55)',
            }}
          />
        </div>
      )}
    </>
  )
}

function ManualCalloutBloco({ callout, marginTop = 12 }: {
  callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca'; texto: string }
  marginTop?: number
}) {
  const c = CALLOUT_STYLE[callout.tipo]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8,
      padding: '12px 16px', marginTop,
    }}>
      <p style={{
        fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5,
        letterSpacing: '.06em', textTransform: 'uppercase',
      }}>{c.label}</p>
      <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={callout.texto} /></p>
    </div>
  )
}

function ManualColunasTabela({ colunas }: { colunas: DocColunaTabela[] }) {
  return (
    <div style={{
      marginTop: 16,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 14,
    }}>
      {colunas.map((col) => (
        <div
          key={col.coluna}
          style={{
            background: 'rgba(99,102,241,.06)',
            border: '1px solid rgba(99,102,241,.18)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {col.imagem && (
            <ManualFiguraScreenshot
              src={col.imagem}
              alt={`Coluna ${col.coluna}`}
            />
          )}
          <div style={{ padding: '12px 14px' }}>
            <p style={{
              fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
              color: '#818cf8', margin: '0 0 4px',
            }}>
              {col.coluna}
            </p>
            {col.tituloColuna && (
              <p style={{ fontSize: '.72rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' }}>
                {col.tituloColuna}
              </p>
            )}
            <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: col.detalhes?.length ? '0 0 8px' : 0, lineHeight: 1.45 }}>
              {col.descricao}
            </p>
            {col.detalhes && col.detalhes.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: '.72rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
                {col.detalhes.map((item) => (
                  <li key={item} style={{ marginBottom: 3 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ManualTooltipsKpi({ tooltips }: { tooltips: DocTooltipKpi[] }) {
  return (
    <div style={{
      marginTop: 16,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 10,
    }}>
      {tooltips.map((tooltip) => (
        <div
          key={tooltip.card}
          style={{
            background: 'rgba(99,102,241,.06)',
            border: '1px solid rgba(99,102,241,.18)',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <p style={{
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
            color: '#818cf8', margin: '0 0 4px',
          }}>
            {tooltip.card}
          </p>
          <p style={{ fontSize: '.72rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' }}>
            Tooltip: {tooltip.tituloTooltip}
          </p>
          <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 8px', lineHeight: 1.45 }}>
            {tooltip.descricao}
          </p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '.72rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
            {tooltip.detalhes.map((item) => (
              <li key={item} style={{ marginBottom: 3 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ManualBlocoPassoVisual({ passo }: { passo: DocPassoVisual }) {
  const blocoBase: React.CSSProperties = {
    paddingTop: passo.num === 1 ? 8 : 22,
    borderTop: passo.num === 1 ? undefined : '1px solid rgba(148,163,184,.1)',
    marginTop: passo.num === 1 ? 18 : 0,
  }

  const blocoTexto = (
    <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)' }}>
      <p style={MANUAL_ESTILO_PASSO_ROTULO}>
        Passo {String(passo.num).padStart(2, '0')}
      </p>
      <p style={MANUAL_ESTILO_PASSO_TITULO}>{passo.titulo}</p>
      {passo.paragrafos.map((p, i) => (
        <ManualParagrafo
          key={i}
          texto={p}
          marginBottom={i === passo.paragrafos.length - 1 ? 0 : 10}
        />
      ))}
      {passo.linkCapitulo && (
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link to={passo.linkCapitulo.href} style={MANUAL_LINK_STYLE}>
            {passo.linkCapitulo.texto}
          </Link>
        </p>
      )}
      {passo.tooltipsKpi && passo.tooltipsKpi.length > 0 && (
        <ManualTooltipsKpi tooltips={passo.tooltipsKpi} />
      )}
      {(passo.callouts ?? (passo.callout ? [passo.callout] : [])).map((callout, i) => (
        <ManualCalloutBloco key={i} callout={callout} marginTop={i === 0 ? 12 : 8} />
      ))}
    </div>
  )

  const gradeColunas = passo.colunasTabela && passo.colunasTabela.length > 0
    ? <ManualColunasTabela colunas={passo.colunasTabela} />
    : null

  const colunaTexto = (
    <>
      {blocoTexto}
      {!passo.imagem && !passo.galeriaTelas?.length ? gradeColunas : null}
    </>
  )

  if (passo.galeriaTelas?.length || (passo.colunasTabela?.length && !passo.imagem)) {
    const galeria = passo.galeriaTelas?.length ? (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 14,
        marginTop: 20,
      }}>
        {passo.galeriaTelas.map((tela) => (
          <div key={tela.legenda}>
            <p style={{
              fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
              marginBottom: 8, textAlign: 'center', letterSpacing: '.04em',
            }}>{tela.legenda}</p>
            <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} />
          </div>
        ))}
      </div>
    ) : null

    if (passo.imagem) {
      return (
        <div style={blocoBase}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
            gap: 28,
            alignItems: 'start',
          }}>
            {colunaTexto}
            <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
          </div>
          {galeria}
        </div>
      )
    }

    return (
      <div style={blocoBase}>
        {colunaTexto}
        {galeria}
      </div>
    )
  }

  if (gradeColunas && passo.imagem) {
    return (
      <div style={blocoBase}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
        }}>
          {blocoTexto}
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
        </div>
        {gradeColunas}
      </div>
    )
  }

  return (
    <div style={{
      ...blocoBase,
      display: 'grid',
      gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
      gap: 28,
      alignItems: 'start',
    }}>
      {colunaTexto}
      {passo.imagem && <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />}
    </div>
  )
}

const MANUAL_ESTILO_SECAO_NUMERO: React.CSSProperties = {
  color: '#818cf8', fontSize: '.85rem', fontWeight: 700, flexShrink: 0, minWidth: 28,
}

function montarItensSumario(secao: DocSecao): { num: number; titulo: string }[] {
  const itens: { num: number; titulo: string }[] = [{ num: 1, titulo: secao.titulo }]
  secao.fluxos?.forEach((fluxo, i) => {
    itens.push({ num: i + 2, titulo: fluxo.tituloSumario ?? fluxo.titulo })
  })
  return itens
}

function ManualSecaoFluxo({ fluxo }: { fluxo: DocFluxo }) {
  return (
    <>
      {fluxo.paragrafos?.map((p, i) => (
        <ManualParagrafo
          key={i}
          texto={p}
          marginBottom={i === (fluxo.paragrafos?.length ?? 0) - 1 ? 4 : 12}
        />
      ))}
      {fluxo.passosVisuais.map(passo => (
        <ManualBlocoPassoVisual key={passo.num} passo={passo} />
      ))}
    </>
  )
}

function ManualBlocoOrigemDados({ origem }: { origem: DocOrigemDados }) {
  const titulo = origem.titulo ?? 'De onde vem esse dado'
  return (
    <div
      id="doc-origem-dados"
      style={{
        marginTop: 24,
        background: 'rgba(251,191,36,.04)',
        border: '1px solid rgba(251,191,36,.18)',
        borderRadius: 14,
        padding: '20px 22px 24px',
      }}
    >
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: '#fbbf24', margin: '0 0 12px',
      }}>
        {titulo}
      </p>
      {origem.paragrafos.map((p, i) => (
        <ManualParagrafo
          key={i}
          texto={p}
          marginBottom={i === origem.paragrafos.length - 1 ? 18 : 10}
        />
      ))}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {origem.etapas.map((etapa) => (
          <div key={etapa.legenda}>
            <p style={{
              fontSize: '.72rem', fontWeight: 700, color: '#fbbf24',
              marginBottom: 8, letterSpacing: '.04em',
            }}>
              {etapa.legenda}
            </p>
            {etapa.paragrafos.map((p, i) => (
              <ManualParagrafo key={i} texto={p} marginBottom={i === etapa.paragrafos.length - 1 ? 12 : 8} />
            ))}
            <ManualFiguraScreenshot src={etapa.imagem} alt={etapa.legenda} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ManualSecaoIntro({ secao }: { secao: DocSecao }) {
  return (
    <div style={{ padding: '4px 0 8px' }}>
      {secao.layoutTextoImagemLateral && secao.imagem ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
          marginBottom: secao.lista ? 28 : 0,
        }}>
          <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)' }}>
            {secao.paragrafos.map((p, i) => (
              <ManualParagrafo
                key={i}
                texto={p}
                marginBottom={i === secao.paragrafos.length - 1 ? 0 : 12}
              />
            ))}
          </div>
          <ManualFiguraScreenshot src={secao.imagem} alt={secao.titulo} />
        </div>
      ) : (
        <>
          {secao.paragrafos.map((p, i) => (
            <ManualParagrafo
              key={i}
              texto={p}
              marginBottom={i === secao.paragrafos.length - 1 && !secao.fluxos?.length ? 0 : 12}
            />
          ))}

          {secao.imagem && !secao.fluxos?.length && (
            <div style={{ marginTop: 20 }}>
              <ManualFiguraScreenshot src={secao.imagem} alt={secao.titulo} />
            </div>
          )}
        </>
      )}

      {secao.mostrarInfograficoOrganizacao && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoOrganizacaoConta />
        </div>
      )}

      {secao.origemDados && (
        <ManualBlocoOrigemDados origem={secao.origemDados} />
      )}

      {secao.mostrarInfograficoOrganizacaoWorkspaces && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoOrganizacaoWorkspaces />
          <ManualTabelaComparativaOrganizacaoWorkspace />
        </div>
      )}

      {secao.lista && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 10,
          marginTop: 20,
        }}>
          {secao.lista.map((item, i) => {
            const [label, ...rest] = item.replace(/^–\s*/, '').split(':')
            const desc = rest.join(':').trim()
            return (
              <div key={i} style={{
                background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '.75rem', color: '#818cf8', fontWeight: 700,
                }}>{i + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600, fontSize: '.82rem',
                    color: MANUAL_TITULO_COR, marginBottom: desc ? 3 : 0, lineHeight: 1.35,
                  }}><ManualTextoRich texto={label.trim()} /></p>
                  {desc && <p style={{
                    fontSize: '.78rem',
                    color: MANUAL_CORPO_70, lineHeight: 1.45,
                  }}><ManualTextoRich texto={desc} /></p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {secao.callout && (() => {
        const c = CALLOUT_STYLE[secao.callout!.tipo]
        return (
          <div style={{ background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8, padding: '12px 16px', marginTop: 14 }}>
            <p style={{ fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.label}</p>
            <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={secao.callout!.texto} /></p>
          </div>
        )
      })()}
    </div>
  )
}

const INFO_BOX: React.CSSProperties = {
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: '.78rem',
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.35,
}

const INFO_ORG: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(99,102,241,.14)',
  border: '1px solid rgba(129,140,248,.35)',
  color: '#c7d2fe',
}

const INFO_WS: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(148,163,184,.08)',
  border: '1px solid rgba(148,163,184,.2)',
  color: '#e2e8f0',
  fontSize: '.72rem',
  fontWeight: 500,
}

const INFO_ETAPA: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(148,163,184,.06)',
  border: '1px solid rgba(148,163,184,.18)',
  color: '#e2e8f0',
  fontSize: '.72rem',
  fontWeight: 500,
  flex: 1,
  minWidth: 0,
}

const INFO_PILULA: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(251,191,36,.08)',
  border: '1px solid rgba(251,191,36,.22)',
  color: '#fde68a',
  fontSize: '.7rem',
  fontWeight: 600,
  textAlign: 'left',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
}

function ManualInfograficoOrganizacaoConta() {
  const etapas = [
    {
      icone: UserPlus,
      cor: '#94a3b8',
      titulo: 'Cadastro',
      subtitulo: 'E-mail e senha em /login',
    },
    {
      icone: IdentificationCard,
      cor: '#a5b4fc',
      titulo: 'Onboarding',
      subtitulo: 'Nome da empresa + CNPJ',
    },
    {
      icone: Crown,
      cor: '#fbbf24',
      titulo: 'Organização',
      subtitulo: 'Conta ativa na Gravity',
    },
  ] as const

  const responsabilidades = [
    { icone: IdentificationCard, texto: 'Identidade legal — CNPJ e razão social' },
    { icone: CreditCard, texto: 'Assinaturas e produtos contratados' },
    { icone: Receipt, texto: 'Faturamento e cobrança da conta' },
    { icone: Users, texto: 'Usuários Master e convites da organização' },
  ] as const

  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 18px',
      }}>
        Da conta à empresa — o que é a Organização
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Jornada de criação */}
        <div style={{
          background: 'rgba(99,102,241,.06)',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#818cf8', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Como ela nasce
          </p>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, flexWrap: 'wrap' }}>
            {etapas.map((etapa, i) => {
              const Icone = etapa.icone
              return (
                <React.Fragment key={etapa.titulo}>
                  <div style={INFO_ETAPA}>
                    <Icone size={18} weight="duotone" style={{ marginBottom: 6, color: etapa.cor }} />
                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{etapa.titulo}</div>
                    <div style={{ fontSize: '.66rem', opacity: .85, lineHeight: 1.4 }}>{etapa.subtitulo}</div>
                  </div>
                  {i < etapas.length - 1 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', color: '#64748b', flexShrink: 0, padding: '0 2px',
                    }}>
                      <ArrowRight size={14} weight="bold" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
          <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '12px 0 0', lineHeight: 1.5 }}>
            A organização é criada uma única vez, no onboarding. Depois disso você só revisa e atualiza os dados em Configurador → Organização.
          </p>
          <p style={{
            fontSize: '.68rem', fontWeight: 600, color: '#a5b4fc', margin: '10px 0 0',
            letterSpacing: '.03em',
          }}>
            ↓ Veja as telas reais desse passo em &quot;De onde vem esse dado&quot;, logo abaixo
          </p>
        </div>

        {/* Papel na plataforma */}
        <div style={{
          background: 'rgba(251,191,36,.05)',
          border: '1px solid rgba(251,191,36,.18)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 14px', letterSpacing: '.04em' }}>
            O que fica na organização
          </p>
          <div style={{
            ...INFO_ORG,
            width: '100%',
            marginBottom: 12,
            background: 'rgba(251,191,36,.1)',
            borderColor: 'rgba(251,191,36,.3)',
            color: '#fde68a',
          }}>
            <Crown size={18} weight="duotone" style={{ marginBottom: 4, color: '#fbbf24' }} />
            <div>Empresa contratante</div>
            <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>
              Uma conta Gravity = uma organização no contrato
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {responsabilidades.map(({ icone: Icone, texto }) => (
              <div key={texto} style={INFO_PILULA}>
                <Icone size={14} weight="duotone" style={{ flexShrink: 0, marginTop: 1, color: '#fbbf24' }} />
                <span>{texto}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '12px 0 0', lineHeight: 1.5 }}>
            Filiais, clientes e operações do dia a dia ficam nos{' '}
            <Link to="/university-gravity/docs/configurador/workspaces" style={MANUAL_LINK_STYLE}>workspaces</Link>
            {' '}— a organização é a raiz da conta, não a unidade operacional.
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 16, paddingTop: 12,
        borderTop: '1px dashed rgba(148,163,184,.15)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#fbbf24' }}>
          <Crown size={13} weight="duotone" /> Organização = identidade e contrato com a Gravity
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94a3b8' }}>
          <IdentificationCard size={13} weight="duotone" /> Nasce no onboarding com nome + CNPJ
        </span>
      </div>
    </div>
  )
}

export function ManualInfograficoOrganizacaoWorkspaces() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 18px',
      }}>
        Organização × Workspaces — dois cenários comuns
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Cenário 1 */}
        <div style={{
          background: 'rgba(99,102,241,.06)',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#818cf8', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Cenário 1 — Importador / Exportador
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%' }}>
              <Crown size={16} weight="duotone" style={{ marginBottom: 4, color: '#a5b4fc' }} />
              <div>Organização</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Empresa contratante (matriz)</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '.75rem' }}>↓ pode ter 1 ou vários</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                Workspace<br />Matriz SP
              </div>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                Workspace<br />Filial RJ
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Matriz e filiais que importam ou exportam — cada unidade opera com dados isolados.
            </p>
          </div>
        </div>

        {/* Cenário 2 */}
        <div style={{
          background: 'rgba(52,211,153,.06)',
          border: '1px solid rgba(52,211,153,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#34d399', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Cenário 2 — Despachante / Agente
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%', background: 'rgba(52,211,153,.12)', borderColor: 'rgba(52,211,153,.35)', color: '#a7f3d0' }}>
              <Crown size={16} weight="duotone" style={{ marginBottom: 4, color: '#6ee7b7' }} />
              <div>Organização</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Despachante ou agente de carga</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '.75rem' }}>↓ clientes como workspaces</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                Workspace<br />Importador A
              </div>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                Workspace<br />Exportador B
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              O despachante é a organização; cada cliente importador ou exportador vira um workspace separado.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 16, paddingTop: 12,
        borderTop: '1px dashed rgba(148,163,184,.15)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#818cf8' }}>
          <Crown size={13} weight="duotone" /> Organização = quem contrata o Gravity
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94a3b8' }}>
          <Buildings size={13} weight="duotone" /> Workspace = unidade operacional dentro da org
        </span>
      </div>
    </div>
  )
}

const COMPARATIVO_ORG_WS: { criterio: string; organizacao: string; workspace: string }[] = [
  {
    criterio: 'O que é',
    organizacao: 'Empresa que contrata o Gravity (tenant da conta)',
    workspace: 'Unidade operacional — pode ser importador, exportador, filial ou cliente',
  },
  {
    criterio: 'Quantidade',
    organizacao: 'Uma por contrato / conta Gravity',
    workspace: 'Uma ou várias por organização',
  },
  {
    criterio: 'Como nasce',
    organizacao: 'Signup + onboarding (nome e CNPJ)',
    workspace: 'Configurador → Workspaces (criação manual)',
  },
  {
    criterio: 'Identidade legal',
    organizacao: 'CNPJ da empresa contratante (bloqueado após onboarding)',
    workspace: 'CNPJ próprio da filial ou do cliente, quando aplicável',
  },
  {
    criterio: 'Registros operacionais',
    organizacao: 'Não concentra operações — apenas gestão da conta (contrato, usuários, assinaturas)',
    workspace: 'DUIMP, Pedidos, Cotações de frete, Câmbio e demais registros ficam sempre no workspace',
  },
  {
    criterio: 'Faturamento',
    organizacao: 'Assinaturas, planos e cobrança da conta',
    workspace: 'Não fatura — consome produtos da organização',
  },
  {
    criterio: 'Quem acessa',
    organizacao: 'Usuários Master veem toda a conta',
    workspace: 'Standard e Fornecedor só veem workspaces vinculados',
  },
  {
    criterio: 'Exemplos',
    organizacao: 'Matriz importadora, despachante de carga',
    workspace: 'Filial RJ, Importador A, Exportador B',
  },
]

function ManualTabelaComparativaOrganizacaoWorkspace() {
  const thBase: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '.68rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(148,163,184,.15)',
  }

  const tdBase: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '.78rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
  }

  return (
    <div style={{
      marginTop: 20,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: 0, padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        Comparativo — Organização × Workspace
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, color: '#94a3b8', width: '22%' }}>Critério</th>
              <th style={{
                ...thBase,
                color: '#a5b4fc',
                background: 'rgba(99,102,241,.08)',
                width: '39%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={14} weight="duotone" />
                  Organização
                </span>
              </th>
              <th style={{
                ...thBase,
                color: '#cbd5e1',
                background: 'rgba(148,163,184,.06)',
                width: '39%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Buildings size={14} weight="duotone" />
                  Workspace
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVO_ORG_WS.map((linha, i) => (
              <tr
                key={linha.criterio}
                style={{
                  background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent',
                }}
              >
                <td style={{ ...tdBase, fontWeight: 600, color: '#94a3b8' }}>{linha.criterio}</td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(99,102,241,.04)' }}>
                  {linha.organizacao}
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(148,163,184,.03)' }}>
                  {linha.workspace}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ICONES_MANUAL: Record<ConfiguradorManualSlug, Icon> = {
  'visao-geral': Gear,
  organizacao: Crown,
  workspaces: Buildings,
  usuarios: Users,
  fornecedores: Handshake,
  assinaturas: CreditCard,
  financeiro: Receipt,
  'api-cockpit': Pulse,
  'taxas-moeda': CurrencyCircleDollar,
  historico: ClockCounterClockwise,
}

export function iconeConfiguradorManual(slug: ConfiguradorManualSlug, size = 16) {
  const Icon = ICONES_MANUAL[slug]
  return <Icon weight="duotone" size={size} />
}

export interface DocManualMetadado {
  rotulo: string
  valor: string
  href?: boolean
}

export function DocManualUmaSecao({
  secao,
  metadados,
}: {
  secao: DocSecao
  metadados: DocManualMetadado[]
}) {
  const itensSumario = montarItensSumario(secao)
  const todosNums = itensSumario.map(i => i.num)
  const [abertos, setAbertos] = useState<number[]>([1])
  const todosAbertos = todosNums.length > 0 && todosNums.every(n => abertos.includes(n))
  const toggle = (n: number) => setAbertos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTodos = () => setAbertos(todosAbertos ? [] : [...todosNums])
  const scrollTo = (n: number) => {
    if (!abertos.includes(n)) setAbertos(prev => [...prev, n])
    setTimeout(() => document.getElementById(`doc-sec-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div style={{ maxWidth: '100%', color: 'var(--ws-text,#f1f5f9)' }}>
      <span style={{
        display: 'inline-block', background: 'rgba(99,102,241,.12)', color: '#818cf8',
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', padding: '4px 12px',
        borderRadius: 999, border: '1px solid rgba(99,102,241,.3)', marginBottom: 16,
        textTransform: 'uppercase',
      }}>Manual Descritivo de Tela</span>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
        paddingBottom: 22,
        borderBottom: '1px solid rgba(148,163,184,.12)',
        marginBottom: 28,
      }}>
        {metadados.map(meta => (
          <div
            key={meta.rotulo}
            style={{
              background: 'rgba(148,163,184,.05)',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 10,
              padding: '10px 14px',
              minWidth: 0,
              ...(meta.href ? { gridColumn: 'span 2' } : {}),
            }}
          >
            <p style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--ws-muted,#64748b)', margin: '0 0 4px',
            }}>
              {meta.rotulo}
            </p>
            <p style={{
              fontSize: '.82rem', color: 'var(--ws-text,#e2e8f0)', margin: 0, lineHeight: 1.4,
              overflowWrap: 'anywhere', wordBreak: 'break-word',
            }}>
              {meta.href ? (
                <a href={meta.valor} target="_blank" rel="noreferrer" style={{ ...MANUAL_LINK_STYLE, overflowWrap: 'anywhere' }}>{meta.valor}</a>
              ) : meta.valor}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
        borderRadius: 14, padding: '20px 26px', marginBottom: 16,
      }}>
        <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--ws-muted,#64748b)', textTransform: 'uppercase', marginBottom: 14 }}>
          Sumário
        </p>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', columns: 2, gap: 24, fontSize: '.85rem' }}>
          {itensSumario.map(item => (
            <li key={item.num} style={{ marginBottom: 7, display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ ...MANUAL_ESTILO_SECAO_NUMERO, minWidth: 22 }}>{item.num}.</span>
              <button
                type="button"
                onClick={() => scrollTo(item.num)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', padding: 0, textAlign: 'left', lineHeight: 1.4 }}
              >
                {item.titulo}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          type="button"
          onClick={toggleTodos}
          title={todosAbertos ? 'Recolher todas as seções' : 'Expandir todas as seções'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem', fontWeight: 600, padding: '4px 2px',
          }}
        >
          <CaretDown
            weight="bold"
            size={12}
            style={{
              transform: todosAbertos ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          />
          {todosAbertos ? 'Recolher todas' : 'Expandir todas'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          id="doc-sec-1"
          style={{
            border: `1px solid ${abertos.includes(1) ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
            borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
          }}
        >
          <button
            type="button"
            onClick={() => toggle(1)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 16,
              background: abertos.includes(1) ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
              border: 'none', cursor: 'pointer', padding: '16px 22px',
              color: 'var(--ws-text,#f1f5f9)', textAlign: 'left', transition: 'background .15s',
            }}
          >
            <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(1).padStart(2, '0')}</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0 }}>{secao.titulo}</span>
            <span style={{
              color: '#818cf8', flexShrink: 0,
              transform: abertos.includes(1) ? 'rotate(180deg)' : 'none', transition: 'transform .25s', fontSize: '.9rem',
            }}>▾</span>
          </button>
          {abertos.includes(1) && (
            <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
              <ManualSecaoIntro secao={secao} />
            </div>
          )}
        </div>

        {secao.fluxos?.map((fluxo, i) => {
          const num = i + 2
          const aberto = abertos.includes(num)
          return (
            <div
              key={fluxo.titulo}
              id={`doc-sec-${num}`}
              style={{
                border: `1px solid ${aberto ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
                borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
              }}
            >
              <button
                type="button"
                onClick={() => toggle(num)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  background: aberto ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
                  border: 'none', cursor: 'pointer', padding: '16px 22px',
                  color: 'var(--ws-text,#f1f5f9)', textAlign: 'left', transition: 'background .15s',
                }}
              >
                <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(num).padStart(2, '0')}</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0 }}>{fluxo.titulo}</span>
                <span style={{
                  color: '#818cf8', flexShrink: 0,
                  transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform .25s', fontSize: '.9rem',
                }}>▾</span>
              </button>
              {aberto && (
                <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
                  <ManualSecaoFluxo fluxo={fluxo} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DocConfiguradorManual({ paginaSlug }: { paginaSlug: ConfiguradorManualSlug }) {
  const secao = secaoConfiguradorPorSlug(paginaSlug)
  const metadados = metadadosConfiguradorPagina(paginaSlug)

  if (!secao) {
    return (
      <div style={{ color: 'var(--ws-muted,#94a3b8)', padding: '40px 0', textAlign: 'center' }}>
        Capítulo não encontrado.
      </div>
    )
  }

  return <DocManualUmaSecao secao={secao} metadados={metadados} />
}

export type { DocSecao, DocPassoVisual, DocFluxo, DocTooltipKpi, DocColunaTabela }

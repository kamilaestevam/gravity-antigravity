import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeSlash, Lightbulb, Warning } from '@phosphor-icons/react'
import type { DocPassoVisual } from './manual-configurador-conteudo'
import { ManualFiguraScreenshot } from './manual-figura-screenshot'
import { ManualGaleriaComparacaoIntro, ManualGaleriaTelasBloco } from './manual-configurador-ui'
import { ManualInfograficoColunasTabela } from './manual-infografico-colunas-tabela'
import { ManualPainelRequisitosCadastro } from './manual-login-painel-requisitos'
import { AcademyLinkGuia } from './guia-academy-link'
import {
  MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_GUIA_CORPO_TIPOGRAFIA,
} from './manual-tipografia'

function galeriaComparacaoAposParagrafoPasso(passo: DocPassoVisual, indice: number) {
  return (passo.galeriaComparacaoAposParagrafo ?? []).filter((g) => g.indice === indice)
}

function figurasAposParagrafoPasso(passo: DocPassoVisual, indice: number) {
  return (passo.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

const MANUAL_TITULO_COR = 'var(--ws-text,#f1f5f9)'
const MANUAL_CORPO_70 = 'rgba(226,232,240,.72)'

const ACADEMY_ICONES: Record<string, React.ComponentType<{ size?: number }>> = {
  olho: Eye,
  'olho-riscado': EyeSlash,
}

const ESTILO_PASSO_ROTULO: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', color: '#818cf8',
  textTransform: 'uppercase',
}

const ESTILO_PASSO_TITULO: React.CSSProperties = {
  fontWeight: 700, fontSize: '.92rem', color: MANUAL_TITULO_COR,
}

function AcademyPassoRotuloLinha({ passo }: { passo: DocPassoVisual }) {
  if (passo.ocultarRotuloPasso) return null
  return (
    <div
      className="uni-player-aula__passo-rotulo-linha"
      style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
    >
      <p style={{ ...ESTILO_PASSO_ROTULO, margin: 0 }}>
        {passo.rotuloPasso ?? `Passo ${String(passo.num).padStart(2, '0')}`}
      </p>
      {passo.tagEmConstrucao ? (
        <span className="ws-badge ws-badge-warning">Em construção</span>
      ) : null}
    </div>
  )
}

const ESTILO_CORPO: React.CSSProperties = {
  ...MANUAL_GUIA_CORPO_TIPOGRAFIA,
  color: MANUAL_CORPO_70,
  fontFamily: 'inherit',
}

const LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

const CALLOUT_STYLE: Record<string, { bg: string; borda: string; cor: string; label: string }> = {
  dica: { bg: 'rgba(99,102,241,.08)', borda: 'rgba(99,102,241,.25)', cor: '#818cf8', label: 'Dica' },
  aviso: { bg: 'rgba(245,158,11,.08)', borda: 'rgba(245,158,11,.25)', cor: '#fbbf24', label: 'Aviso importante' },
  exemplo: { bg: 'rgba(148,163,184,.06)', borda: 'rgba(148,163,184,.18)', cor: '#94a3b8', label: 'Exemplo' },
  seguranca: { bg: 'rgba(239,68,68,.08)', borda: 'rgba(239,68,68,.25)', cor: '#f87171', label: 'Segurança' },
}

function AcademyTextoRich({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(\*\*([^*]+)\*\*|\*\_([^*]+)\_\*|\{\{link:([^|]+)\|([^}]+)\}\}|\{\{icone:([a-z0-9-]+)\}\}|https:\/\/[^\s.,;:!?)\]}]+)/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index))
    if (match[2] !== undefined) {
      partes.push(<strong key={`b-${ki++}`} style={{ fontWeight: 700, color: MANUAL_TITULO_COR }}>{match[2]}</strong>)
    } else if (match[3] !== undefined) {
      partes.push(
        <em key={`ui-${ki++}`} style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 600 }}>
          {match[3]}
        </em>,
      )
    } else if (match[4]) {
      const href = match[4]
      const rotulo = match[5]
      partes.push(
        href.startsWith('http://') || href.startsWith('https://') ? (
          <a key={`l-${ki++}`} href={href} target="_blank" rel="noreferrer" style={LINK_STYLE}>{rotulo}</a>
        ) : (
          <AcademyLinkGuia key={`l-${ki++}`} href={href} rotulo={rotulo} />
        ),
      )
    } else if (match[6]) {
      const Icon = ACADEMY_ICONES[match[6]]
      partes.push(
        Icon ? (
          <span key={`i-${ki++}`} style={{ display: 'inline-flex', verticalAlign: 'text-bottom', margin: '0 3px', color: MANUAL_CORPO_70 }} aria-hidden>
            <Icon size={16} />
          </span>
        ) : match[0],
      )
    } else if (match[0].startsWith('https://')) {
      partes.push(
        <a key={`a-${ki++}`} href={match[0]} target="_blank" rel="noreferrer" style={LINK_STYLE}>
          {match[0]}
        </a>,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes}</>
}

const CALLOUT_ICONE: Record<string, React.ComponentType<{ size?: number; weight?: 'fill' | 'regular' }>> = {
  dica: Lightbulb,
  aviso: Warning,
}

function CalloutPasso({ callout }: { callout: { tipo: string; texto: string } }) {
  const c = CALLOUT_STYLE[callout.tipo] ?? CALLOUT_STYLE.dica
  const Icone = CALLOUT_ICONE[callout.tipo]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8,
      padding: '12px 16px', display: 'flex', gap: 14,
    }}>
      {Icone ? (
        <Icone weight="fill" size={20} style={{ color: c.cor, flexShrink: 0, marginTop: 2 }} />
      ) : null}
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5,
          letterSpacing: '.06em', textTransform: 'uppercase',
        }}>{c.label}</p>
        <p style={{ ...ESTILO_CORPO, fontSize: '.82rem', margin: 0 }}>
          <AcademyTextoRich texto={callout.texto} />
        </p>
      </div>
    </div>
  )
}

/**
 * Passo visual — ritmo Guia (`/modelo-espacamento-guia`): 12px no corpo e entre partes
 * (rótulo↔título↔parágrafos↔screenshot↔callout). Margem externa do bloco vem do PlayerAula.
 */
export function AcademyBlocoPassoVisual({ passo }: { passo: DocPassoVisual; primeiro?: boolean }) {
  const calloutLista = passo.dicaAoLadoImagem || passo.calloutAposImagem
    ? []
    : (passo.callouts ?? (passo.callout ? [passo.callout] : []))
  const semRotulo = passo.ocultarRotuloPasso === true
  const semTitulo = passo.ocultarTituloPasso === true
  const temCabecalho = !semRotulo || !semTitulo
  const temParagrafos = (passo.paragrafos?.length ?? 0) > 0
  const temSequenciaTextoFigura = temParagrafos
    && (passo.figurasAposParagrafo?.length ?? 0) > 0
    && !passo.imagem
  const temCorpoTexto = !temSequenciaTextoFigura
    && (temCabecalho || temParagrafos || Boolean(passo.linkCapitulo))

  const blocoCalloutsFinal = calloutLista.length > 0 ? (
    <div
      className="uni-player-aula__passo-callouts"
      style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_PARAGRAFO_PX }}
    >
      {calloutLista.map((callout, i) => (
        <CalloutPasso key={i} callout={callout} />
      ))}
    </div>
  ) : null

  if (temSequenciaTextoFigura) {
    return (
      <div className="uni-player-aula__bloco-passo">
        {passo.calloutAntes ? (
          <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
            <CalloutPasso callout={passo.calloutAntes} />
          </div>
        ) : null}
        {passo.paragrafos!.map((p, i) => (
          <div key={i} className="uni-player-aula__passo-etapa">
            {i === 0 ? (
              <div className="uni-player-aula__passo-corpo">
                {!semRotulo ? (
                  <AcademyPassoRotuloLinha passo={passo} />
                ) : null}
                {!semTitulo ? (
                  <p style={ESTILO_PASSO_TITULO}>{passo.titulo}</p>
                ) : null}
                <p style={{ ...ESTILO_CORPO, margin: 0 }}>
                  <AcademyTextoRich texto={p} />
                </p>
              </div>
            ) : (
              <p className="uni-player-aula__passo-texto-continuacao" style={{ ...ESTILO_CORPO, margin: 0 }}>
                <AcademyTextoRich texto={p} />
              </p>
            )}
            {figurasAposParagrafoPasso(passo, i).map((fig) => (
              <ManualFiguraScreenshot
                key={fig.imagem}
                src={fig.imagem}
                alt={fig.legenda ?? passo.titulo}
                larguraTotal
                className="uni-player-aula__figura"
                semSombraExterna
              />
            ))}
          </div>
        ))}
        {passo.galeriaTelas?.length ? (
          <div className="uni-player-aula__passo-galeria">
            <ManualGaleriaTelasBloco
              telas={passo.galeriaTelas}
              fraseAposIndice={passo.galeriaFraseAposIndice}
              fraseEntreCardsEImagens={passo.galeriaFraseEntreCardsEImagens}
            />
          </div>
        ) : null}
        {passo.painelRequisitosCadastro ? (
          <div className="uni-player-aula__passo-painel">
            <ManualPainelRequisitosCadastro semMargemSuperior compactoGuia />
          </div>
        ) : null}
        {blocoCalloutsFinal}
      </div>
    )
  }

  return (
    <div className="uni-player-aula__bloco-passo">
      {passo.calloutAntes ? (
        <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <CalloutPasso callout={passo.calloutAntes} />
        </div>
      ) : null}
      {temCorpoTexto ? (
        <div className="uni-player-aula__passo-corpo">
          {!semRotulo ? (
            <AcademyPassoRotuloLinha passo={passo} />
          ) : null}
          {!semTitulo ? (
            <p style={ESTILO_PASSO_TITULO}>{passo.titulo}</p>
          ) : null}
          {temParagrafos ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX }}>
              {passo.paragrafos!.map((p, i) => (
                <React.Fragment key={i}>
                  <p style={{ ...ESTILO_CORPO, margin: 0 }}>
                    <AcademyTextoRich texto={p} />
                  </p>
                  {galeriaComparacaoAposParagrafoPasso(passo, i).map((galeria, idxGaleria) => (
                    <div
                      key={`galeria-par-${i}-${idxGaleria}-${galeria.telas.map((t) => t.imagem).join('|')}`}
                      className="uni-player-aula__passo-galeria"
                    >
                      <ManualGaleriaComparacaoIntro
                        telas={galeria.telas}
                        ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                        colunas={galeria.colunas}
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : null}
          {passo.linkCapitulo && (
            <p style={{ margin: 0 }}>
              <Link to={passo.linkCapitulo.href} style={LINK_STYLE}>
                {passo.linkCapitulo.texto}
              </Link>
            </p>
          )}
        </div>
      ) : null}
      {(passo.paragrafos?.length ?? 0) === 0
        ? galeriaComparacaoAposParagrafoPasso(passo, 0).map((galeria, idxGaleria) => (
          <div
            key={`galeria-sem-par-${idxGaleria}-${galeria.telas.map((t) => t.imagem).join('|')}`}
            className="uni-player-aula__passo-galeria"
          >
            <ManualGaleriaComparacaoIntro
              telas={galeria.telas}
              ampliarInferiorDireito={galeria.ampliarInferiorDireito}
              colunas={galeria.colunas}
            />
          </div>
        ))
        : null}
      {passo.imagem ? (
        <ManualFiguraScreenshot
          src={passo.imagem}
          alt={passo.titulo}
          larguraTotal
          className="uni-player-aula__figura"
          semSombraExterna
        />
      ) : null}
      {passo.colunasTabela?.length ? (
        <div className="uni-player-aula__passo-colunas">
          <ManualInfograficoColunasTabela
            colunas={passo.colunasTabela}
            titulo="Colunas da auditoria"
            subtitulo="Cada card resume o que você vê na tabela de Histórico."
            marginTop={MANUAL_ESPACO_PARAGRAFO_PX}
          />
        </div>
      ) : null}
      {passo.calloutAposImagem ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <CalloutPasso callout={passo.calloutAposImagem} />
        </div>
      ) : null}
      {passo.galeriaTelas?.length ? (
        <div className="uni-player-aula__passo-galeria">
          <ManualGaleriaTelasBloco
            telas={passo.galeriaTelas}
            fraseAposIndice={passo.galeriaFraseAposIndice}
            fraseEntreCardsEImagens={passo.galeriaFraseEntreCardsEImagens}
          />
        </div>
      ) : null}
      {passo.painelRequisitosCadastro && (
        <div className="uni-player-aula__passo-painel">
          <ManualPainelRequisitosCadastro semMargemSuperior compactoGuia />
        </div>
      )}
      {calloutLista.length > 0 && blocoCalloutsFinal}
    </div>
  )
}

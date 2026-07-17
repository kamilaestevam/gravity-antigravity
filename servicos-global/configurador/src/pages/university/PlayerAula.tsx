/**
 * PlayerAula — Reader de aula da Gravity University.
 * Layout: painel esquerdo (navegador de fases) + área principal (blocos de conteúdo).
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ArrowRight, CheckCircle, Clock, Play,
  Quotes, Lightbulb, Warning, Image as ImageIcon, BookOpen, Eye, EyeSlash,
  LinkedinLogo,
} from '@phosphor-icons/react'
import type { AulaDemo, BlocoConteudo } from './conteudo-demo'
import {
  MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX,
  MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX,
  MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX,
  MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_GUIA_CORPO_TIPOGRAFIA,
} from './manual-tipografia'
import { AcademyInfografico, AcademyOrigemDados } from './academy-infograficos'
import { ManualGabiExemplosConversa } from './manual-gabi-exemplo-conversa'
import { ManualConfiguradorAccordionHistoricoCatalogo } from './manual-configurador-accordion-historico-catalogo'
import { ManualFiguraScreenshot } from './manual-figura-screenshot'
import { AcademyBlocoPassoVisual } from './academy-bloco-passo-visual'
import { AcademyBlocoCenariosGrade, type PayloadCenariosGradeAcademy } from './academy-bloco-cenarios-grade'
import { AcademyBlocoFluxoManual } from './academy-bloco-fluxo-manual'
import type { DocPassoVisual } from './manual-login-conteudo'
import type { DocFluxo, DocTopicoImagemLateral } from './manual-configurador-conteudo'
import { ManualGaleriaComparacaoIntro, ManualTagPassoWizard, ManualTopicosImagemLateral } from './manual-configurador-ui'
import { ManualPainelRequisitosCadastro } from './manual-login-painel-requisitos'
import { UniBotaoVoltarPadrao } from './uni-botao-voltar-padrao'
import { GuiaAcademyNavigationProvider, AcademyLinkGuia, lerRetornoGuiaAcademy, restaurarScrollGuia, voltarNoGuiaAcademy } from './guia-academy-link'

const UNI_COR = '#818cf8'
const CONTENT_TEXT = 'var(--ws-text, #f1f5f9)'
const CONTENT_MUTED = 'var(--ws-muted, #94a3b8)'
const ACCENT = '#a78bfa'

function slugifyTituloGuia(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Títulos de seção (H2+) ou, se não houver, o H1 da aula — passos não entram no menu. */
function extrairTitulosSumarioAula(blocos: BlocoConteudo[]): { id: string; texto: string; nivel: number; indiceBloco: number }[] {
  const usados = new Set<string>()
  const novoId = (base: string, indiceBloco: number) => {
    let id = `guia-titulo-${slugifyTituloGuia(base) || 'secao'}`
    if (usados.has(id)) id = `${id}-${indiceBloco}`
    usados.add(id)
    return id
  }

  const headings: { id: string; texto: string; nivel: number; indiceBloco: number }[] = []
  const h1s: { id: string; texto: string; nivel: number; indiceBloco: number }[] = []

  blocos.forEach((bloco, indiceBloco) => {
    if (bloco.tipo !== 'heading') return
    const nivel = Number(bloco.dados.nivel ?? 1)
    const texto = String(bloco.dados.text ?? '').trim()
    if (!texto) return
    if (nivel <= 1) {
      h1s.push({ id: novoId(texto, indiceBloco), texto, nivel: 1, indiceBloco })
      return
    }
    if (bloco.dados.ocultarNoSumario) return
    headings.push({ id: novoId(texto, indiceBloco), texto, nivel, indiceBloco })
  })

  // H2/H3 = tópicos. Sem subtítulo (ex.: Boas-vindas / Esqueci minha senha) → só o H1.
  return headings.length > 0 ? headings : h1s.slice(0, 1)
}

/** Blocos internos sem margem: espaçamento externo é sempre calculado pelo wrapper do Guia. */
const SEM_MARGEM: React.CSSProperties = { margin: 0 }

type ClassificacaoBlocoGuia = 'titulo' | 'subtitulo' | 'passo' | 'visual' | 'texto' | 'normal'

function classificarBlocoGuia(bloco: BlocoConteudo): ClassificacaoBlocoGuia {
  if (bloco.tipo === 'passo_visual') return 'passo'
  if (bloco.tipo === 'texto') return 'texto'
  if (bloco.tipo === 'heading') {
    const nivel = Number(bloco.dados.nivel ?? 1)
    return nivel <= 1 ? 'titulo' : 'subtitulo'
  }
  if (['imagem', 'video', 'infografico', 'origem_dados', 'catalogo_historico', 'gabi_conversas', 'topicos_imagem_lateral', 'cenarios_grade', 'fluxo_manual', 'galeria_comparacao'].includes(bloco.tipo)) return 'visual'
  return 'normal'
}

/** Ignora H2 `ocultarNoCorpo` (âncora fantasma do sumário) ao medir ritmo entre passos visíveis. */
function blocoAnteriorEfetivoGuia(blocos: BlocoConteudo[], indice: number): BlocoConteudo | null {
  for (let i = indice - 1; i >= 0; i--) {
    const candidato = blocos[i]!
    if (candidato.tipo === 'heading' && candidato.dados.ocultarNoCorpo) continue
    return candidato
  }
  return null
}

function calcularEspacoSuperiorBlocoGuia(
  bloco: BlocoConteudo,
  indice: number,
  blocos: BlocoConteudo[],
): number {
  const blocoAnterior = indice > 0 ? blocos[indice - 1]! : null
  const anteriorEfetivo = blocoAnteriorEfetivoGuia(blocos, indice)

  if (bloco.tipo === 'heading' && bloco.dados.ocultarNoCorpo) {
    // H2 só no sumário: sem faixa vazia entre sub-passos do mesmo fluxo (ex.: Card → Excluir em Anexar).
    return 0
  }

  // Passo Academy após outro passo visível, com H2 fantasma do sumário no meio (ex.: Cotação manual → BID manual).
  if (
    bloco.tipo === 'fluxo_manual'
    && String(bloco.dados.modo ?? 'completo') === 'passo'
    && anteriorEfetivo?.tipo === 'fluxo_manual'
    && String(anteriorEfetivo.dados.modo ?? 'completo') === 'passo'
    && blocoAnterior !== anteriorEfetivo
  ) {
    return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
  }

  if (bloco.tipo === 'texto' && blocoAnterior?.tipo === 'texto') {
    return MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX
  }
  // H1 → tituloTopico (H2 roxo logo após a linha do título)
  if (
    bloco.tipo === 'heading'
    && Number(bloco.dados.nivel ?? 1) === 2
    && blocoAnterior?.tipo === 'heading'
    && Number(blocoAnterior.dados.nivel ?? 1) <= 1
  ) {
    return MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX
  }
  // Linha do título H1 → primeiro parágrafo (sem tituloTopico)
  if (
    bloco.tipo === 'texto'
    && blocoAnterior?.tipo === 'heading'
    && Number(blocoAnterior.dados.nivel ?? 1) <= 1
  ) {
    return MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX
  }
  // H1 → intro do fluxo (parágrafos + UX10 antes do primeiro subtópico)
  if (
    bloco.tipo === 'fluxo_manual'
    && blocoAnterior?.tipo === 'heading'
    && Number(blocoAnterior.dados.nivel ?? 1) <= 1
    && String(bloco.dados.modo ?? 'completo') === 'intro'
  ) {
    return MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX
  }
  // H2 tituloTopico → intro do fluxo
  if (
    bloco.tipo === 'fluxo_manual'
    && blocoAnterior?.tipo === 'heading'
    && Number(blocoAnterior.dados.nivel ?? 1) === 2
    && String(bloco.dados.modo ?? 'completo') === 'intro'
  ) {
    return MANUAL_ESPACO_PARAGRAFO_PX
  }

  // H2 subtópico → corpo do passo (1º parágrafo ou infográfico na Academy)
  if (
    bloco.tipo === 'fluxo_manual'
    && blocoAnterior?.tipo === 'heading'
    && Number(blocoAnterior.dados.nivel ?? 1) === 2
    && String(bloco.dados.modo ?? 'completo') === 'passo'
  ) {
    if (blocoAnterior.dados.ocultarNoCorpo) {
      if (
        anteriorEfetivo?.tipo === 'fluxo_manual'
        && String(anteriorEfetivo.dados.modo ?? 'completo') === 'passo'
      ) {
        return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
      }
      return MANUAL_ESPACO_PARAGRAFO_PX
    }
    return MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX
  }

  // Fim de um passo (fluxo modo passo) → H2 do próximo subtópico
  if (
    bloco.tipo === 'heading'
    && Number(bloco.dados.nivel ?? 1) === 2
    && blocoAnterior?.tipo === 'fluxo_manual'
    && String(blocoAnterior.dados.modo ?? 'completo') === 'passo'
  ) {
    if (bloco.dados.ocultarNoCorpo) return 0
    return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
  }

  // Passo Academy após outro passo (H2 fantasma do sumário ou adjacente) — 32px
  if (
    bloco.tipo === 'fluxo_manual'
    && String(bloco.dados.modo ?? 'completo') === 'passo'
    && anteriorEfetivo?.tipo === 'fluxo_manual'
    && String(anteriorEfetivo.dados.modo ?? 'completo') === 'passo'
    && blocoAnterior?.tipo !== 'fluxo_manual'
  ) {
    return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
  }

  // Passo com `rotuloPasso` (sem H2) → passo anterior adjacente
  if (
    bloco.tipo === 'fluxo_manual'
    && String(bloco.dados.modo ?? 'completo') === 'passo'
    && blocoAnterior?.tipo === 'fluxo_manual'
    && String(blocoAnterior.dados.modo ?? 'completo') === 'passo'
  ) {
    return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
  }

  const classificacao = classificarBlocoGuia(bloco)

  // Screenshot → screenshot (galeria da mesma seção)
  if (bloco.tipo === 'imagem' && blocoAnterior?.tipo === 'imagem') {
    return 16
  }
  // Screenshot → infográfico (mapa mental após print da seção)
  if (bloco.tipo === 'infografico' && blocoAnterior?.tipo === 'imagem') {
    return MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX
  }
  // Screenshot de passo → infográfico (ex.: Gabi Insights — Como usar o painel)
  if (bloco.tipo === 'infografico' && blocoAnterior?.tipo === 'passo_visual') {
    return MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX
  }
  // Infográfico → screenshot seguinte (mesma seção visual)
  if (bloco.tipo === 'imagem' && blocoAnterior?.tipo === 'infografico') {
    return MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX
  }
  // Screenshot de fluxo → primeiro passo visual do fluxo
  if (classificacao === 'passo' && blocoAnterior?.tipo === 'imagem') {
    return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
  }
  // Fim da tela/screenshot de um passo → rótulo do próximo passo
  if (classificacao === 'passo' && blocoAnterior?.tipo === 'passo_visual') {
    return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
  }
  // Infográfico → fluxo manual (H2 «Como acessar…»)
  if (bloco.tipo === 'fluxo_manual' && blocoAnterior?.tipo === 'infografico') {
    return MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX
  }
  // Infográfico → primeiro passo do fluxo (ex.: «Cadastrar webhook»)
  if (classificacao === 'passo' && blocoAnterior?.tipo === 'infografico') {
    return MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX
  }
  // Fim de fluxo_manual → H2 de seção irmã (ex.: Tipos → Nova cotação na aula unificada)
  if (
    bloco.tipo === 'heading'
    && Number(bloco.dados.nivel ?? 1) === 2
    && !bloco.dados.ocultarNoCorpo
    && blocoAnterior?.tipo === 'fluxo_manual'
  ) {
    const modoAnterior = String(blocoAnterior.dados.modo ?? 'completo')
    if (modoAnterior === 'passo' || modoAnterior === 'completo' || modoAnterior === 'intro') {
      return MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
    }
  }

  // Callout / visual / texto → título de fluxo (H2/H3), ex.: «Acessar organização», «Convidar usuário»
  if (classificacao === 'subtitulo' && blocoAnterior) {
    return MANUAL_ESPACO_ANTES_TITULO_FLUXO_GUIA_PX
  }
  // Intro/parágrafo → primeiro passo (e demais blocos padrão)
  return MANUAL_ESPACO_PARAGRAFO_PX
}

function estiloBlocoGuia(
  bloco: BlocoConteudo,
  indice: number,
  blocos: BlocoConteudo[],
): React.CSSProperties {
  // marginTop no wrapper: o ritmo é flex column (não colapsa). CSS não deve forçar margin-top nos blocos.
  return {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    paddingTop: 0,
    marginTop: calcularEspacoSuperiorBlocoGuia(bloco, indice, blocos),
  }
}

/** Corpo narrativo Academy — alinhamento justificado (SSOT: MANUAL-GRAVITY-ONBOARDING §9.1.2) */
const PLAYER_CORPO: React.CSSProperties = {
  ...MANUAL_GUIA_CORPO_TIPOGRAFIA,
  color: CONTENT_TEXT,
  fontFamily: 'inherit',
}

const ACADEMY_ICONES: Record<string, React.ComponentType<{ size?: number; color?: string; weight?: 'fill' | 'regular' | 'duotone' }>> = {
  olho: Eye,
  'olho-riscado': EyeSlash,
  linkedin: LinkedinLogo,
}

const LINK_RICH: React.CSSProperties = {
  color: ACCENT,
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  fontWeight: 600,
}

function AcademyTextoRich({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(\*\*([^*]+)\*\*|\{\{link:([^|]+)\|([^}]+)\}\}|\[([^\]]+)\]\((https:\/\/[^)\s]+)\)|\{\{icone:([a-z0-9-]+)\}\}|https:\/\/[^\s.,;:!?)\]}]+)/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index))
    if (match[2] !== undefined) {
      partes.push(<strong key={`b-${ki++}`} style={{ fontWeight: 700 }}>{match[2]}</strong>)
    } else if (match[3] !== undefined && match[4] !== undefined) {
      partes.push(
        <AcademyLinkGuia key={`l-${ki++}`} href={match[3]} rotulo={match[4]} />,
      )
    } else if (match[5] && match[6]) {
      partes.push(
        <a key={`md-${ki++}`} href={match[6]} target="_blank" rel="noreferrer" style={LINK_RICH}>
          {match[5]}
        </a>,
      )
    } else if (match[7]) {
      const Icon = ACADEMY_ICONES[match[7]]
      const corIcone = match[7] === 'linkedin' ? '#0A66C2' : CONTENT_MUTED
      partes.push(
        Icon ? (
          <span key={`i-${ki++}`} style={{ display: 'inline-flex', verticalAlign: 'text-bottom', margin: '0 3px', color: corIcone }} aria-hidden>
            <Icon size={16} weight="fill" />
          </span>
        ) : match[0],
      )
    } else if (match[0].startsWith('https://')) {
      partes.push(
        <a key={`a-${ki++}`} href={match[0]} target="_blank" rel="noreferrer" style={LINK_RICH}>
          {match[0]}
        </a>,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes}</>
}

type LinkExternoItem = { label: string; descricao?: string; href: string }

function BlocoLinksExternos({ bloco }: { bloco: BlocoConteudo }) {
  const itens = JSON.parse(String(bloco.dados.itens ?? '[]')) as LinkExternoItem[]
  const titulo = String(bloco.dados.titulo ?? 'LinkedIn')
  return (
    <div style={{
      margin: 0,
      padding: '1rem 1.2rem',
      borderRadius: 12,
      background: 'rgba(10,102,194,.08)',
      border: '1px solid rgba(10,102,194,.22)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: itens.length ? 12 : 0,
        color: CONTENT_TEXT, fontWeight: 700, fontSize: '.88rem',
      }}>
        <LinkedinLogo weight="fill" size={20} style={{ color: '#0A66C2' }} aria-hidden />
        {titulo}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {itens.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', flexDirection: 'column', gap: 2,
              textDecoration: 'none', color: 'inherit',
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(148,163,184,.05)',
              border: '1px solid rgba(148,163,184,.12)',
            }}
          >
            <span style={{ color: ACCENT, fontWeight: 600, fontSize: '.9rem' }}>{item.label}</span>
            {item.descricao ? (
              <span style={{ color: CONTENT_MUTED, fontSize: '.78rem', lineHeight: 1.4 }}>{item.descricao}</span>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Sub-componentes com fallback para mídia ────────────────────────────────

function BlocoImagem({ bloco }: { bloco: BlocoConteudo; semMargemVertical?: boolean }) {
  const src = String(bloco.dados.src ?? '')
  const alt = String(bloco.dados.alt ?? '')
  const larguraMaximaRaw = bloco.dados.larguraMaxima
  const larguraMaxima = larguraMaximaRaw != null && larguraMaximaRaw !== ''
    ? Number(larguraMaximaRaw)
    : undefined
  const figuraStyle: React.CSSProperties = {
    ...SEM_MARGEM,
    ...(larguraMaxima != null && Number.isFinite(larguraMaxima)
      ? { maxWidth: larguraMaxima, marginLeft: 'auto', marginRight: 'auto' }
      : {}),
  }
  if (!src) {
    return (
      <figure style={figuraStyle}>
        <div style={{
          width: '100%', aspectRatio: '16/7', borderRadius: 12,
          background: 'rgba(148,163,184,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(148,163,184,.12)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
            <ImageIcon size={44} weight="duotone" />
            <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{alt}</span>
          </div>
        </div>
        {bloco.dados.caption && (
          <figcaption style={{ textAlign: 'center', fontSize: '.78rem', color: CONTENT_MUTED, marginTop: 10, fontStyle: 'italic' }}>
            {String(bloco.dados.caption)}
          </figcaption>
        )}
      </figure>
    )
  }
  return (
    <figure style={figuraStyle}>
      <ManualFiguraScreenshot
        src={src}
        alt={alt}
        larguraTotal={larguraMaxima == null}
        larguraMaxima={larguraMaxima}
        className="uni-player-aula__figura"
        semSombraExterna
      />
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
  const [revelado, setRevelado] = useState(false)
  const audioBoostAplicado = React.useRef(false)
  const temSrc = !!bloco.dados.src && !falhou
  const titulo = String(bloco.dados.titulo ?? '')
  const duracao = String(bloco.dados.duracao ?? '')
  const legendaSrc = bloco.dados.legenda ? String(bloco.dados.legenda) : ''
  const ganhoAudio = Number(bloco.dados.ganho_audio ?? 1)

  if (temSrc && revelado) {
    return (
      <div style={SEM_MARGEM}>
        {titulo ? (
          <div style={{ color: '#c7d2fe', fontWeight: 600, fontSize: '.92rem', marginBottom: 10 }}>
            {titulo}
          </div>
        ) : null}
        <video
          key={String(bloco.dados.src)}
          src={String(bloco.dados.src)}
          controls
          autoPlay
          crossOrigin="anonymous"
          onLoadedMetadata={(e) => {
            const video = e.currentTarget
            video.volume = 1
            if (audioBoostAplicado.current) return
            if (!(ganhoAudio > 1 && Number.isFinite(ganhoAudio))) return
            try {
              const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
              const ctx = new Ctx()
              const source = ctx.createMediaElementSource(video)
              const gain = ctx.createGain()
              gain.gain.value = Math.min(ganhoAudio, 2.5)
              source.connect(gain)
              gain.connect(ctx.destination)
              audioBoostAplicado.current = true
              void ctx.resume()
            } catch {
              // Sem Web Audio: mantém volume nativo.
            }
          }}
          onEnded={() => {
            audioBoostAplicado.current = false
            setRevelado(false)
          }}
          onError={() => {
            setFalhou(true)
            setRevelado(false)
          }}
          style={{ width: '100%', borderRadius: 12, display: 'block', background: '#0f172a' }}
        >
          {legendaSrc ? (
            <track
              kind="captions"
              src={legendaSrc}
              srcLang="pt"
              label="Português"
              default
            />
          ) : null}
        </video>
      </div>
    )
  }

  return (
    <div style={SEM_MARGEM}>
      <button
        type="button"
        onClick={() => {
          if (temSrc) {
            audioBoostAplicado.current = false
            setRevelado(true)
          }
        }}
        aria-label={titulo || 'Reproduzir vídeo'}
        style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 12,
          background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          border: '1px solid rgba(99,102,241,.3)',
          cursor: temSrc ? 'pointer' : 'default',
          padding: 0,
          font: 'inherit',
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(129,140,248,.2)', border: '2px solid rgba(129,140,248,.5)',
          display: 'grid', placeItems: 'center',
        }}>
          <Play weight="fill" size={26} style={{ color: UNI_COR, marginLeft: 4 }} />
        </div>
        {titulo ? (
          <div style={{ color: '#c7d2fe', fontWeight: 600, fontSize: '.92rem' }}>
            {titulo}
          </div>
        ) : null}
        {duracao ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#818cf8', fontSize: '.78rem' }}>
            <Clock size={13} /> {duracao}
          </div>
        ) : null}
      </button>
    </div>
  )
}

// ── Renderizador de bloco ──────────────────────────────────────────────────

function BlocoRenderer({ bloco }: { bloco: BlocoConteudo }) {
  switch (bloco.tipo) {
    case 'heading': {
      const nivel = Number(bloco.dados.nivel ?? 1)
      const Tag = (`h${Math.min(Math.max(nivel, 1), 6)}`) as keyof JSX.IntrinsicElements
      const base: React.CSSProperties = { fontFamily: 'inherit', color: CONTENT_TEXT }
      const styles: Record<number, React.CSSProperties> = {
        1: { ...base, fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.2, margin: 0 },
        /** Título de fluxo/seção (não passo): roxo, mesmo tamanho do H3 — ex.: «Acessar organização». */
        2: { ...base, fontSize: '1rem', fontWeight: 700, color: ACCENT, margin: 0 },
        3: { ...base, fontSize: '1rem', fontWeight: 700, color: ACCENT, margin: 0 },
      }
      const texto = String(bloco.dados.text)
      const idAncora = bloco.dados.idAncora ? String(bloco.dados.idAncora) : undefined
      const ocultarNoCorpo = Boolean(bloco.dados.ocultarNoCorpo)
      const etapaWizard = bloco.dados.etapaWizard != null ? Number(bloco.dados.etapaWizard) : undefined
      const estiloOculto: React.CSSProperties = {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }
      // Título H1: padding-bottom + border (padrão da tela correta) — spacer separado falhava visualmente.
      if (nivel <= 1) {
        return (
          <h1 id={idAncora} className="uni-player-aula__titulo-guia" style={styles[1]}>
            {texto}
          </h1>
        )
      }
      return (
        <Tag
          id={idAncora}
          className={etapaWizard != null && Number.isFinite(etapaWizard) && !ocultarNoCorpo
            ? 'uni-player-aula__titulo-etapa-wizard'
            : undefined}
          style={ocultarNoCorpo ? estiloOculto : (styles[nivel] ?? styles[1])}
          aria-hidden={ocultarNoCorpo || undefined}
        >
          {etapaWizard != null && Number.isFinite(etapaWizard) && !ocultarNoCorpo ? (
            <>
              <ManualTagPassoWizard numero={etapaWizard} />
              <span>{texto}</span>
            </>
          ) : (
            texto
          )}
        </Tag>
      )
    }

    case 'texto':
      if (String(bloco.dados.variante ?? '') === 'links-externos') {
        return <BlocoLinksExternos bloco={bloco} />
      }
      return (
        <p style={{ ...PLAYER_CORPO, margin: 0, whiteSpace: 'pre-line' }}>
          <AcademyTextoRich texto={String(bloco.dados.text)} />
        </p>
      )

    case 'imagem':
      return <BlocoImagem bloco={bloco} />

    case 'video':
      return <BlocoVideo bloco={bloco} />

    case 'citacao':
      return (
        <div style={{
          margin: 0, padding: '1.5rem 1.75rem',
          borderLeft: `4px solid ${ACCENT}`,
          background: 'rgba(167,139,250,0.07)',
          borderRadius: '0 12px 12px 0',
        }}>
          <Quotes weight="fill" size={32} style={{ color: ACCENT, opacity: .4, display: 'block', marginBottom: 10 }} />
          <p style={{
            ...PLAYER_CORPO,
            fontSize: '1.08rem', fontWeight: 700, fontStyle: 'italic',
            margin: '0 0 10px 0',
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

    case 'destaque': {
      const tituloDestaque = String(bloco.dados.titulo ?? '')
      const ehAviso = tituloDestaque === 'Aviso importante' || tituloDestaque === 'Atenção' || tituloDestaque === 'Aviso'
      const corDestaque = ehAviso ? '#fbbf24' : ACCENT
      const IconeDestaque = ehAviso ? Warning : Lightbulb
      return (
        <div style={{
          margin: 0, padding: '1.1rem 1.4rem',
          background: ehAviso ? 'rgba(245,158,11,.08)' : 'rgba(167,139,250,0.08)',
          border: `1px solid ${ehAviso ? 'rgba(245,158,11,.25)' : 'rgba(167,139,250,0.2)'}`,
          borderRadius: 12, display: 'flex', gap: 14,
        }}>
          <IconeDestaque weight="fill" size={20} style={{ color: corDestaque, flexShrink: 0, marginTop: 2 }} />
          <div>
            {bloco.dados.titulo && (
              <div style={{ fontWeight: 700, color: corDestaque, fontSize: '.82rem', marginBottom: 5 }}>
                {tituloDestaque}
              </div>
            )}
            <p style={{ ...PLAYER_CORPO, fontSize: '.92rem', margin: 0 }}>
              <AcademyTextoRich texto={String(bloco.dados.text ?? '')} />
            </p>
          </div>
        </div>
      )
    }

    case 'definicao':
      return (
        <div style={{
          margin: 0, padding: '1.1rem 1.4rem',
          background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 12, display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <BookOpen weight="duotone" size={20} style={{ color: UNI_COR, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: UNI_COR, fontSize: '.82rem', marginBottom: 4 }}>
              {String(bloco.dados.termo)}
            </div>
            <p style={{ ...PLAYER_CORPO, fontSize: '.92rem', margin: 0 }}>
              {String(bloco.dados.definicao)}
            </p>
          </div>
        </div>
      )

    case 'dois_colunas': {
      const lado = String(bloco.dados.imagem_lado ?? 'direita')
      const src = bloco.dados.src ? String(bloco.dados.src) : ''
      const imgEl = src ? (
        <div style={{ flex: '0 0 45%', minWidth: 0 }}>
          <BlocoImagem bloco={{ tipo: 'imagem', dados: { src, alt: String(bloco.dados.imagem_alt ?? ''), largura: 'full' } }} semMargemVertical />
        </div>
      ) : (
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
        <p style={{ ...PLAYER_CORPO, flex: 1, fontSize: '.95rem', margin: 0, alignSelf: 'center', whiteSpace: 'pre-line' }}>
          {String(bloco.dados.texto ?? '')}
        </p>
      )
      return (
        <div style={{ display: 'flex', gap: '2rem', margin: 0, alignItems: 'flex-start' }}>
          {lado === 'esquerda' ? <>{imgEl}{txtEl}</> : <>{txtEl}{imgEl}</>}
        </div>
      )
    }

    case 'lista_legenda': {
      type ItemLegenda = { label: string; descricao: string; linkHref?: string; linkRotulo?: string }
      const itens = JSON.parse(String(bloco.dados.itens ?? '[]')) as ItemLegenda[]
      const emLinha = Number(bloco.dados.emLinha) === 1
      const colunas = Number(bloco.dados.colunas) || (emLinha ? 3 : 0)
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: emLinha
            ? `repeat(${colunas}, minmax(0, 1fr))`
            : 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: emLinha ? 8 : 10,
          margin: 0,
        }}>
          {itens.map((item, i) => (
            <div key={`${item.label}-${i}`} style={{
              background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 10, padding: emLinha ? '10px 10px' : '12px 14px',
              display: 'flex', gap: emLinha ? 8 : 10, alignItems: 'flex-start',
              minWidth: 0,
            }}>
              <div style={{
                width: emLinha ? 24 : 28, height: emLinha ? 24 : 28, borderRadius: 8,
                background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontSize: emLinha ? '.7rem' : '.75rem', color: '#818cf8', fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontWeight: 600, fontSize: emLinha ? '.75rem' : '.82rem',
                  color: CONTENT_TEXT, marginBottom: item.descricao ? 3 : 0, lineHeight: 1.35,
                }}>
                  {item.linkHref && item.linkRotulo ? (
                    <AcademyLinkGuia href={item.linkHref} rotulo={item.linkRotulo} />
                  ) : (
                    <AcademyTextoRich texto={item.label} />
                  )}
                </p>
                {item.descricao && (
                  <p style={{ fontSize: emLinha ? '.68rem' : '.78rem', color: CONTENT_MUTED, lineHeight: 1.45, margin: 0 }}>
                    <AcademyTextoRich texto={item.descricao} />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    case 'requisitos_cadastro':
      return (
        <div style={SEM_MARGEM}>
          <ManualPainelRequisitosCadastro semMargemSuperior />
        </div>
      )

    case 'passo_visual': {
      const passo = JSON.parse(String(bloco.dados.payload ?? '{}')) as DocPassoVisual
      const idAncora = bloco.dados.idAncora ? String(bloco.dados.idAncora) : undefined
      return (
        <div id={idAncora}>
          <AcademyBlocoPassoVisual
            passo={passo}
            primeiro={Number(bloco.dados.primeiro) === 1}
          />
        </div>
      )
    }

    case 'timeline': {
      type TimelineItem = { label: string; descricao: string }
      const itens = JSON.parse(String(bloco.dados.itens ?? '[]')) as TimelineItem[]
      return (
        <div style={SEM_MARGEM}>
          {bloco.dados.titulo && (
            <div style={{ fontWeight: 700, color: CONTENT_TEXT, fontSize: '1rem', marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
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
                  <p style={{ ...PLAYER_CORPO, fontSize: '.85rem', color: CONTENT_MUTED, margin: 0 }}>
                    {item.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'destaque_escuro': {
      const src = bloco.dados.src ? String(bloco.dados.src) : ''
      const alt = String(bloco.dados.imagem_alt ?? '')
      const etapasResumo = ['Bem Vindo', 'Login', 'Configurador', 'Produtos']
      return (
        <div style={{
          margin: 0, borderRadius: 14,
          background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(148,163,184,.12)',
          overflow: 'hidden', display: 'flex', flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 280px', padding: '1.75rem 2rem', minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem', marginBottom: 12 }}>
              {String(bloco.dados.titulo ?? '')}
            </div>
            <p style={{ ...PLAYER_CORPO, fontSize: '.92rem', color: '#94a3b8', margin: 0 }}>
              {String(bloco.dados.texto ?? '')}
            </p>
          </div>
          <div style={{
            flex: '1 1 220px',
            maxWidth: '100%',
            background: 'linear-gradient(160deg, rgba(99,102,241,.16) 0%, rgba(15,23,42,.9) 55%, rgba(52,211,153,.1) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderLeft: '1px solid rgba(148,163,184,.08)', minHeight: 180,
            padding: '1.25rem 1.1rem',
          }}>
            {src ? (
              <img
                src={src}
                alt={alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 10 }}
              />
            ) : (
              <div style={{
                width: '100%',
                maxWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  background: 'rgba(52,211,153,.15)',
                  border: '1px solid rgba(52,211,153,.45)',
                  boxShadow: '0 0 28px rgba(52,211,153,.2)',
                }}>
                  <CheckCircle weight="fill" size={28} style={{ color: '#34d399' }} aria-hidden />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '.88rem', marginBottom: 4 }}>
                    {alt || 'Jornada concluída'}
                  </div>
                  <div style={{ fontSize: '.68rem', color: CONTENT_MUTED, lineHeight: 1.4 }}>
                    Do primeiro olá ao domínio — no seu ritmo
                  </div>
                </div>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
                }}>
                  {etapasResumo.map((etapa) => (
                    <span
                      key={etapa}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: '.62rem', fontWeight: 700, color: '#bbf7d0',
                        background: 'rgba(52,211,153,.1)',
                        border: '1px solid rgba(52,211,153,.28)',
                        borderRadius: 999, padding: '3px 8px',
                      }}
                    >
                      <CheckCircle weight="fill" size={11} aria-hidden />
                      {etapa}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'infografico':
      return (
        <div style={SEM_MARGEM}>
          <AcademyInfografico id={String(bloco.dados.id ?? '')} />
        </div>
      )

    case 'origem_dados':
      return (
        <div style={SEM_MARGEM}>
          <AcademyOrigemDados manualCapitulo={String(bloco.dados.manualCapitulo ?? '')} />
        </div>
      )

    case 'catalogo_historico':
      return (
        <div style={SEM_MARGEM}>
          <ManualConfiguradorAccordionHistoricoCatalogo marginTop={12} />
        </div>
      )

    case 'gabi_conversas': {
      const ids = JSON.parse(String(bloco.dados.ids ?? '[]')) as string[]
      return (
        <div style={SEM_MARGEM}>
          <ManualGabiExemplosConversa ids={ids} />
        </div>
      )
    }

    case 'topicos_imagem_lateral': {
      const topicos = JSON.parse(String(bloco.dados.payload ?? '[]')) as DocTopicoImagemLateral[]
      return (
        <div style={SEM_MARGEM}>
          <ManualTopicosImagemLateral topicos={topicos} />
        </div>
      )
    }

    case 'cenarios_grade': {
      const payload = JSON.parse(String(bloco.dados.payload ?? '{}')) as PayloadCenariosGradeAcademy
      return (
        <div style={SEM_MARGEM}>
          <AcademyBlocoCenariosGrade payload={payload} />
        </div>
      )
    }

    case 'fluxo_manual': {
      const fluxo = JSON.parse(String(bloco.dados.payload ?? '{}')) as DocFluxo
      const numeroSecaoFluxo = Number(bloco.dados.numeroSecaoFluxo ?? 1)
      const modo = String(bloco.dados.modo ?? 'completo') as 'completo' | 'intro' | 'passo' | 'rodape'
      const passoNumRaw = bloco.dados.passoNum
      const passoNum = passoNumRaw != null ? Number(passoNumRaw) : undefined
      return (
        <div style={SEM_MARGEM}>
          <AcademyBlocoFluxoManual
            fluxo={fluxo}
            numeroSecaoFluxo={numeroSecaoFluxo}
            modo={modo}
            passoNum={passoNum}
          />
        </div>
      )
    }

    case 'galeria_comparacao': {
      type GaleriaPayload = {
        telas: { legenda: string; imagem: string; paragrafoAntes?: string }[]
        colunas?: number
        ampliarInferiorDireito?: boolean
        textoAcimaEstiloCorpo?: boolean
      }
      const galeria = JSON.parse(String(bloco.dados.payload ?? '{}')) as GaleriaPayload
      return (
        <div style={SEM_MARGEM}>
          <ManualGaleriaComparacaoIntro
            telas={galeria.telas}
            colunas={galeria.colunas}
            ampliarInferiorDireito={galeria.ampliarInferiorDireito}
            textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
          />
        </div>
      )
    }

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
  const location = useLocation()
  const { t } = useTranslation()
  const retornoGuia = lerRetornoGuiaAcademy(location.state)

  const idxAtual = todasAulas.findIndex(a => a.slug === faseSlug)
  const anterior = idxAtual > 0 ? todasAulas[idxAtual - 1] : null
  const proxima = idxAtual < todasAulas.length - 1 ? todasAulas[idxAtual + 1] : null
  const jaConcluida = concluidas.has(faseSlug)

  const idPorIndiceBloco = useMemo(() => {
    const mapa = new Map<number, string>()
    for (const item of extrairTitulosSumarioAula(aula.blocos)) mapa.set(item.indiceBloco, item.id)
    return mapa
  }, [aula.blocos])

  const titulosSumario = useMemo(() => {
    const todos = extrairTitulosSumarioAula(aula.blocos)
    const tituloAula = aula.titulo.trim().toLocaleLowerCase('pt-BR')
    // Só remove H1 que repete o nome da aula — H2 (ex.: «O que é Organização?») permanece no menu.
    const filtrados = todos.filter(
      (item) => !(item.nivel <= 1 && item.texto.trim().toLocaleLowerCase('pt-BR') === tituloAula),
    )
    // Aula com um único tópico (ex.: Boas-vindas): mantém o item mesmo se repetir o título.
    if (filtrados.length === 0 && todos.length > 0) return todos.slice(0, 1)
    return filtrados
  }, [aula.blocos, aula.titulo])

  const [idSecaoAtiva, setIdSecaoAtiva] = useState<string | null>(titulosSumario[0]?.id ?? null)

  useEffect(() => {
    setIdSecaoAtiva(titulosSumario[0]?.id ?? null)
  }, [faseSlug, titulosSumario])

  useEffect(() => {
    const scrollRestaurar = (location.state as { restaurarScrollGuia?: number } | null)?.restaurarScrollGuia
    if (typeof scrollRestaurar === 'number' && scrollRestaurar >= 0) {
      const timer = window.setTimeout(() => {
        restaurarScrollGuia(scrollRestaurar)
      }, 120)
      return () => window.clearTimeout(timer)
    }

    const hash = location.hash.replace(/^#/, '')
    if (!hash) return
    const timer = window.setTimeout(() => {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setIdSecaoAtiva(hash)
      }
    }, 120)
    return () => window.clearTimeout(timer)
  }, [faseSlug, location.pathname, location.hash, location.state])

  useEffect(() => {
    if (!idSecaoAtiva) return
    const btn = document.querySelector<HTMLElement>(`[data-sumario-id="${CSS.escape(idSecaoAtiva)}"]`)
    btn?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [idSecaoAtiva])

  useEffect(() => {
    if (titulosSumario.length === 0) return

    const ids = titulosSumario.map((t) => t.id)
    const visiveis = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (!id) continue
          if (entry.isIntersecting) {
            visiveis.set(id, entry.intersectionRatio)
          } else {
            visiveis.delete(id)
          }
        }
        if (visiveis.size === 0) return
        let melhorId = ids[0]!
        let melhorTop = Number.POSITIVE_INFINITY
        for (const id of ids) {
          if (!visiveis.has(id)) continue
          const el = document.getElementById(id)
          if (!el) continue
          const top = el.getBoundingClientRect().top
          const distancia = Math.abs(top - 120)
          if (top <= 160 && distancia < melhorTop) {
            melhorTop = distancia
            melhorId = id
          }
        }
        if (melhorTop === Number.POSITIVE_INFINITY) {
          for (const id of ids) {
            if (visiveis.has(id)) {
              melhorId = id
              break
            }
          }
        }
        setIdSecaoAtiva(melhorId)
      },
      {
        root: null,
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 1],
      },
    )

    // Aguarda o DOM dos blocos (âncoras) após o paint da aula.
    const timer = window.setTimeout(() => {
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      }
    }, 0)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [titulosSumario, aula.blocos])

  const navParaFase = (slug: string) => navigate(`/university-gravity/academy/${produtoSlug}/${slug}`)

  const irParaTitulo = (id: string) => {
    setIdSecaoAtiva(id)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const voltarGuia = () => {
    voltarNoGuiaAcademy(navigate, produtoSlug, retornoGuia)
  }

  return (
    <GuiaAcademyNavigationProvider produtoSlug={produtoSlug}>
      <div className="uni-player-aula">

        {/* ── Painel esquerdo: tópicos/passos da aula atual ── */}
        <nav className="uni-player-aula__nav">
          <UniBotaoVoltarPadrao
            label={t('university.aula.voltar')}
            onClick={voltarGuia}
          />

          <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!aula.ocultarCabecalhoNavSumario
              && !(titulosSumario.length === 1
              && titulosSumario[0]!.texto.trim().toLocaleLowerCase('pt-BR') === aula.titulo.trim().toLocaleLowerCase('pt-BR')) && (
                <div style={{
                  padding: '10px 10px 6px',
                  fontSize: '.72rem',
                  fontWeight: 700,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: CONTENT_MUTED,
                }}>
                  {aula.titulo}
                </div>
              )}

            {titulosSumario.length > 0 ? (
              titulosSumario.map((titulo, idx) => {
                const ativo = idSecaoAtiva === titulo.id || titulosSumario.length === 1
                return (
                  <button
                    key={titulo.id}
                    type="button"
                    data-sumario-id={titulo.id}
                    onClick={() => irParaTitulo(titulo.id)}
                    title={titulo.texto}
                    aria-current={ativo ? 'location' : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: ativo ? 'rgba(129,140,248,.14)' : 'transparent',
                      color: ativo ? UNI_COR : CONTENT_MUTED,
                      fontWeight: ativo ? 700 : 500, fontSize: '.82rem', width: '100%',
                      borderLeft: ativo ? `3px solid ${UNI_COR}` : '3px solid transparent',
                      boxShadow: ativo ? `0 0 0 1px rgba(129,140,248,.25)` : 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'grid', placeItems: 'center', fontSize: '.65rem', fontWeight: 800,
                      background: ativo ? UNI_COR : 'transparent',
                      border: ativo ? 'none' : '1.5px solid rgba(148,163,184,.35)',
                      color: ativo ? '#0f172a' : 'var(--ws-muted,#94a3b8)',
                      boxShadow: ativo ? `0 0 0 3px ${UNI_COR}40` : 'none',
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.3, color: ativo ? undefined : CONTENT_TEXT }}>
                      {titulo.texto}
                    </span>
                  </button>
                )
              })
            ) : null}
          </div>
        </nav>

        {/* ── Área de conteúdo ── */}
        <div className="uni-player-aula__content">
          <div className="uni-player-aula__article">

            {/* Breadcrumb + blocos — ritmo centralizado em `calcularEspacoSuperiorBlocoGuia`. */}
            <div className="uni-player-aula__ritmo uni-ritmo-r3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: CONTENT_MUTED }}>
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
              {aula.blocos.map((bloco, idx) => {
                const idAncora = idPorIndiceBloco.get(idx)
                const blocoComAncora = idAncora && (bloco.tipo === 'heading' || bloco.tipo === 'passo_visual')
                  ? { ...bloco, dados: { ...bloco.dados, idAncora } }
                  : bloco
                return (
                  <div
                    key={idx}
                    className={`uni-player-aula__bloco uni-player-aula__bloco--${classificarBlocoGuia(bloco)}`}
                    style={estiloBlocoGuia(bloco, idx, aula.blocos)}
                  >
                    <BlocoRenderer bloco={blocoComAncora} />
                  </div>
                )
              })}
            </div>

            {/* ── Navegação de rodapé ── */}
            <div
              className="uni-player-aula__rodape-nav"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid rgba(148,163,184,.12)', gap: 12,
              }}
            >
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
    </GuiaAcademyNavigationProvider>
  )
}

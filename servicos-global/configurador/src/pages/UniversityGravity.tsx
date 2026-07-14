/**
 * UniversityGravity: layout da Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP. Mesmo layout do Configurador: MenuLateralGlobal (sidebar)
 * com título "Gravity University" + opções e dropdown de organizações, e as
 * mesmas ações de topo (Hub, busca/localizar, dica, notificações, localizador,
 * idioma, usuário). Textos via i18n (namespace `university`). Implementação real em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import {
  Books, FileText, PuzzlePiece, Path, Sparkle, GraduationCap, Info,
  SignIn, ShieldStar, Gear, SquaresFour, ShoppingBag, Package,
  MagnifyingGlass, AirplaneTilt, ArrowsLeftRight, GitBranch, CheckCircle,
  Clock, CheckFat, WarningCircle, Eye, EyeSlash, Envelope, Lock, ArrowsOut,
  Compass, CaretDown, SealCheck, HandWaving,
} from '@phosphor-icons/react'
import { useShellStore, Notificacoes, ToastContainer, useMeSync, type OrganizacaoShell } from '@gravity/shell'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { mapRole } from '../types/niveis-acesso'
import { HubBotao } from '../components/HubBotao'
import { PlayerAula } from './university/PlayerAula'
import { UniBotaoVoltarPadrao } from './university/uni-botao-voltar-padrao'
import { LOGIN_FASES_TRILHA } from './university/manual-login-academy'
import { BEM_VINDO_TRILHA } from './university/manual-bem-vindo-academy'
import { GABI_TRILHA } from './university/manual-gabi-academy'
import { CONFIGURADOR_TRILHAS } from './university/manual-configurador-academy'
import {
  DOC_LOGIN_METADADOS,
  DOC_LOGIN_SECOES,
  DOC_LOGIN_SUBTITULO,
  montarEntradasSumarioLogin,
  type DocPassoVisual,
  type DocSecao,
} from './university/manual-login-conteudo'
import { getAulaDemo, getAulasCapituloDemo } from './university/conteudo-demo'
import { CONFIGURADOR_MANUAL_ITENS, resolverConfiguradorManualSlug, type DocFluxo, type DocSecao as DocSecaoConfigurador } from './university/manual-configurador-conteudo'
import {
  DocConfiguradorManual,
  iconeConfiguradorManual,
  MANUAL_ESTILO_ACORDEON_SECAO,
  useManualSumarioScroll,
  ManualSumarioBloco,
  ManualLeituraContext,
  ManualBotaoMarcarLido,
} from './university/manual-configurador-ui'
import {
  ancoraPassosLogin,
  calcularEstadoCapitulo,
  calcularEstadoLeitura,
  carregarLidosManual,
  contarLidosManual,
  idPassoManual,
  idSecaoManual,
  idsPassosFluxo,
  montarFluxoPorSecaoLogin,
  montarIdsRastreaveisLeituraLogin,
  percentualLeituraManual,
  salvarLidosManual,
} from './university/manual-leitura-progresso'
import { DOC_HUB_SUBTITULO } from './university/manual-hub-conteudo'
import { DOC_NAVEGACAO_SUBTITULO } from './university/manual-navegacao-conteudo'
import { DOC_STORE_SUBTITULO } from './university/manual-store-conteudo'
import { DOC_SMART_READ_SUBTITULO } from './university/manual-smart-read-conteudo'
import { DOC_PEDIDO_SUBTITULO } from './university/manual-pedido-conteudo'
import { DocNavegacaoManual } from './university/manual-navegacao-ui'
import { DocHubManual } from './university/manual-hub-ui'
import { DocStoreManual } from './university/manual-store-ui'
import { DocSmartReadManual } from './university/manual-smart-read-ui'
import { DocPedidoManual } from './university/manual-pedido-ui'
import { DocBidFreteManual } from './university/manual-bid-frete-ui'
import { DocApiCockpitManual } from './university/manual-api-cockpit-ui'
import { DOC_API_COCKPIT_SUBTITULO } from './university/manual-api-cockpit-conteudo'
import { MANUAL_ESPACO_PARAGRAFO_PX, MANUAL_ALINHAMENTO_CORPO, MANUAL_CORPO_TIPOGRAFIA, MANUAL_ESPACO_ENTRE_PASSOS_PX, manualMargemParagrafo } from './university/manual-tipografia'
import { ManualPainelRequisitosCadastro } from './university/manual-login-painel-requisitos'
import './configurador/workspace.css'

const UNI_COR = '#818cf8'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Fase {
  /** Slug da aula; ausente em trilhas ainda sem conteúdo publicado (WIP). */
  slug?: string
  nome: string
  duracao: string
  concluida: boolean
}
interface Trilha {
  /** Identificador do capítulo (onboarding fatiado por capítulo). */
  slug?: string
  tag: string
  emoji: string
  nome: string
  modulos: number
  duracao: string
  prog: number
  fases: Fase[]
}

// ── Catálogo WIP: virá do banco via API ───────────────────────────────────
const TRILHAS_POR_PRODUTO: Record<string, Trilha[]> = {
  'bem-vindo': [{ ...BEM_VINDO_TRILHA, prog: 0 }],
  login: [{
    tag: '#60a5fa', emoji: '🔑', nome: 'Primeiros Passos: Login', modulos: 3, duracao: '19m', prog: 0,
    fases: LOGIN_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
  }],
  admin: [{
    tag: '#f43f5e', emoji: '🛡️', nome: 'Painel Administrativo', modulos: 3, duracao: '1h', prog: 0,
    fases: [
      { nome: 'Visão geral do Admin', duracao: '20m', concluida: false },
      { nome: 'Impersonação de usuário', duracao: '20m', concluida: false },
      { nome: 'Monitor de APIs e deploys', duracao: '20m', concluida: false },
    ],
  }],
  configurador: CONFIGURADOR_TRILHAS.map(tr => ({ ...tr, prog: 0 })),
  gabi: [{ ...GABI_TRILHA, prog: 0 }],
  hub: [{
    tag: '#a78bfa', emoji: '🏠', nome: 'Hub e Navegação', modulos: 2, duracao: '30m', prog: 0,
    fases: [
      { nome: 'Navegando pelo Hub', duracao: '15m', concluida: false },
      { nome: 'Trocando de Workspace', duracao: '15m', concluida: false },
    ],
  }],
  store: [{
    tag: '#10b981', emoji: '🛒', nome: 'Gravity Store', modulos: 2, duracao: '45m', prog: 0,
    fases: [
      { nome: 'Explorando o Marketplace', duracao: '25m', concluida: false },
      { nome: 'Contratando um produto', duracao: '20m', concluida: false },
    ],
  }],
  pedido: [{
    tag: '#f59e0b', emoji: '📦', nome: 'Guia Pedido', modulos: 5, duracao: '2h', prog: 0,
    fases: [
      { nome: 'Lista de Pedidos', duracao: '25m', concluida: false },
      { nome: 'Criando um Pedido', duracao: '20m', concluida: false },
      { nome: 'Edição em Massa', duracao: '25m', concluida: false },
      { nome: 'Colunas e Filtros', duracao: '25m', concluida: false },
      { nome: 'Relatórios e Exportação', duracao: '25m', concluida: false },
    ],
  }],
  'smart-read': [{
    tag: '#c084fc', emoji: '📄', nome: 'Guia Smart Docs', modulos: 4, duracao: '1h30', prog: 0,
    fases: [
      { nome: 'Anexando documentos', duracao: '25m', concluida: false },
      { nome: 'Leitura inteligente', duracao: '25m', concluida: false },
      { nome: 'Análise de Riscos', duracao: '25m', concluida: false },
      { nome: 'Exportando Insights', duracao: '15m', concluida: false },
    ],
  }],
  'bid-frete': [{
    tag: '#60a5fa', emoji: '✈️', nome: 'BID Frete Internacional', modulos: 4, duracao: '1h30', prog: 0,
    fases: [
      { nome: 'Nova Cotação', duracao: '25m', concluida: false },
      { nome: 'Comparando Fretes', duracao: '25m', concluida: false },
      { nome: 'Aprovação e Follow-up', duracao: '25m', concluida: false },
      { nome: 'Relatórios de Frete', duracao: '15m', concluida: false },
    ],
  }],
  'bid-cambio': [{
    tag: '#facc15', emoji: '💱', nome: 'BID Câmbio', modulos: 3, duracao: '1h', prog: 0,
    fases: [
      { nome: 'Simulação de Câmbio', duracao: '20m', concluida: false },
      { nome: 'Fechamento de Câmbio', duracao: '20m', concluida: false },
      { nome: 'Histórico e Relatórios', duracao: '20m', concluida: false },
    ],
  }],
  processo: [{
    tag: '#facc15', emoji: '🔀', nome: 'Guia Processo', modulos: 6, duracao: '2h30', prog: 0,
    fases: [
      { nome: 'Criando um Processo', duracao: '25m', concluida: false },
      { nome: 'Dados Técnicos', duracao: '25m', concluida: false },
      { nome: 'Vinculando Pedidos', duracao: '25m', concluida: false },
      { nome: 'Containers e Taxas', duracao: '25m', concluida: false },
      { nome: 'Workflow e Status', duracao: '25m', concluida: false },
      { nome: 'Relatórios', duracao: '25m', concluida: false },
    ],
  }],
}

// Produtos que esta organização contratou (WIP: virá do backend)
const PRODUTOS_CONTRATADOS: (keyof typeof TRILHAS_POR_PRODUTO)[] = [
  'bem-vindo', 'login', 'configurador', 'pedido', 'processo', 'smart-read',
]

// Visão geral agrupada (sem produto selecionado)
const GRUPOS_TRILHAS = [
  { tituloKey: 'university.grupo.comece_aqui',  trilhas: [TRILHAS_POR_PRODUTO['bem-vindo'][0], TRILHAS_POR_PRODUTO.login[0], TRILHAS_POR_PRODUTO.configurador[0]] },
  { tituloKey: 'university.grupo.seus_produtos', trilhas: [TRILHAS_POR_PRODUTO.pedido[0], TRILHAS_POR_PRODUTO.processo[0], TRILHAS_POR_PRODUTO['smart-read'][0]] },
  { tituloKey: 'university.grupo.explorar',      trilhas: [TRILHAS_POR_PRODUTO['bid-frete'][0], TRILHAS_POR_PRODUTO['bid-cambio'][0], TRILHAS_POR_PRODUTO.store[0]] },
]

const ICON_MAP = {
  'bem-vindo':  HandWaving,
  login:        SignIn,
  navegacao:    Compass,
  admin:        ShieldStar,
  configurador: Gear,
  gabi:         Sparkle,
  hub:          SquaresFour,
  store:        ShoppingBag,
  pedido:       Package,
  'smart-read': MagnifyingGlass,
  'bid-frete':  AirplaneTilt,
  'bid-cambio': ArrowsLeftRight,
  processo:     GitBranch,
} as const

type ProdutoSlug = keyof typeof ICON_MAP

/** Módulos da plataforma — disponíveis independente do produto contratado */
const MODULOS_PLATAFORMA: ProdutoSlug[] = [
  'bem-vindo', 'login', 'admin', 'configurador', 'gabi', 'hub', 'store',
]

// ── Componente Manual Login ─────────────────────────────────────────────────
const CALLOUT_STYLE: Record<string, { bg: string; borda: string; label: string; cor: string }> = {
  aviso:    { bg: 'rgba(251,191,36,.07)',  borda: 'rgba(251,191,36,.3)',  label: '⚠ Atenção',   cor: '#fbbf24' },
  exemplo:  { bg: 'rgba(99,102,241,.07)',  borda: 'rgba(99,102,241,.3)',  label: '💡 Exemplo',  cor: '#818cf8' },
  dica:     { bg: 'rgba(99,102,241,.07)',  borda: 'rgba(99,102,241,.3)',  label: '💡 Dica',     cor: '#818cf8' },
  seguranca:{ bg: 'rgba(239,68,68,.07)',   borda: 'rgba(239,68,68,.3)',   label: '🔒 Segurança', cor: '#f87171' },
}

/** Manual descritivo: tokens SSOT: MANUAL-GRAVITY-ONBOARDING.md §9 */
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
  ...MANUAL_CORPO_TIPOGRAFIA,
  color: MANUAL_CORPO_70,
}

const UNI_ESTILO_PAGE_HEADER: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
}

const UNI_ESTILO_PAGE_ICON: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}

const UNI_ESTILO_PAGE_TITLES: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0,
}

const UNI_ESTILO_PAGE_TITLE: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.1,
  color: 'var(--ws-text,#f1f5f9)', margin: 0,
}

const UNI_ESTILO_PAGE_SUBTITULO: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.8rem', color: 'var(--ws-muted,#94a3b8)', lineHeight: 1.5, margin: 0,
}

const MANUAL_ESTILO_SECAO_NUMERO: React.CSSProperties = {
  color: '#818cf8', fontSize: '.85rem', fontWeight: 700, flexShrink: 0, minWidth: 28,
}

const MANUAL_ESTILO_CALLOUT_CORPO: React.CSSProperties = {
  fontSize: '.82rem', color: MANUAL_CORPO_70, lineHeight: 1.65,
  textAlign: MANUAL_ALINHAMENTO_CORPO, textJustify: 'inter-word',
}

/** Ícones inline: token `{{icone:slug}}` + escrita descritiva no mesmo parágrafo */
const MANUAL_ICONES: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  olho: Eye,
  'olho-riscado': EyeSlash,
  envelope: Envelope,
  cadeado: Lock,
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

function ManualTextoRichSegmento({ texto }: { texto: string }) {
  if (!texto.includes('**')) return texto
  const partes: React.ReactNode[] = []
  const re = /\*\*([^*]+)\*\*/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index))
    partes.push(
      <strong key={`b-${ki++}`} style={{ color: MANUAL_TIPO.titulo, fontWeight: 700 }}>
        {match[1]}
      </strong>,
    )
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes}</>
}

function ManualTextoRichLinha({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(https:\/\/[^\s]+|\{\{link:([^|]+)\|([^}]+)\}\}|\{\{icone:([a-z0-9-]+)\}\})/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo, match.index)} />)
    }
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
    } else {
      const Icon = MANUAL_ICONES[match[4]]
      partes.push(
        Icon ? (
          <span key={match.index} style={MANUAL_ICONE_INLINE_STYLE} aria-hidden>
            <Icon size={16} />
          </span>
        ) : (
          match[0]
        ),
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) {
    partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo)} />)
  }
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
    <p style={{ ...MANUAL_ESTILO_CORPO, margin: marginBottom === 0 ? 0 : `0 0 ${marginBottom ?? MANUAL_ESPACO_PARAGRAFO_PX}px` }}>
      <ManualTextoRich texto={texto} />
    </p>
  )
}

function ManualFiguraScreenshot({ src, alt }: { src: string; alt: string }) {
  const [telaCheia, setTelaCheia] = useState(false)

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

  const abrir = () => setTelaCheia(true)
  const fechar = () => setTelaCheia(false)

  return (
    <>
      <figure
        role="button"
        tabIndex={0}
        aria-label={`${alt}: Abrir em tela cheia`}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            abrir()
          }
        }}
        style={{
          margin: 0, borderRadius: 14, overflow: 'hidden', cursor: 'zoom-in',
          border: '1px solid rgba(148,163,184,.15)', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
          background: 'rgba(8,12,24,.55)', position: 'relative',
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
        <span style={{
          position: 'absolute', top: 10, right: 10,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 11px', borderRadius: 9,
          background: 'rgba(99,102,241,.88)', border: '1px solid rgba(165,180,252,.45)',
          color: '#f8fafc', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.03em',
          backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,.28)',
          pointerEvents: 'none',
        }}>
          <ArrowsOut size={15} weight="duotone" aria-hidden />
          Ampliar
        </span>
      </figure>

      {telaCheia && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={fechar}
          style={{
            position: 'fixed', inset: 0, zIndex: 200000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: '#020617',
          }}
        >
          <button
            type="button"
            onClick={fechar}
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
              background: '#0b0f1a',
            }}
          />
        </div>,
        document.body,
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

function ManualBlocoPassoVisual({ passo, ancoraPassoId }: { passo: DocPassoVisual; ancoraPassoId?: string }) {
  const calloutLista = passo.callouts ?? (passo.callout ? [passo.callout] : [])
  const empilharImagem =
    passo.imagemAbaixoTexto ??
    (Boolean(passo.imagem) &&
      calloutLista.length >= 2 &&
      calloutLista.every((c) => c.tipo === 'dica'))

  const blocoBase: React.CSSProperties = {
    paddingTop: passo.num === 1 ? 8 : MANUAL_ESPACO_ENTRE_PASSOS_PX,
    borderTop: passo.num === 1 ? undefined : '1px solid rgba(148,163,184,.1)',
    marginTop: passo.num === 1 ? 18 : 0,
  }

  const colunaTexto = (
    <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)' }}>
      <p style={MANUAL_ESTILO_PASSO_ROTULO}>
        Passo {String(passo.num).padStart(2, '0')}
      </p>
      <p style={MANUAL_ESTILO_PASSO_TITULO}>{passo.titulo}</p>
      {passo.paragrafos.map((p, i) => (
        <ManualParagrafo
          key={i}
          texto={p}
          marginBottom={
            i === passo.paragrafos.length - 1 && !passo.painelRequisitosCadastro
              ? 0
              : manualMargemParagrafo(i, passo.paragrafos.length)
          }
        />
      ))}
      {passo.linkCapitulo && (
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link to={passo.linkCapitulo.href} style={MANUAL_LINK_STYLE}>
            {passo.linkCapitulo.texto}
          </Link>
        </p>
      )}
      {passo.painelRequisitosCadastro && <ManualPainelRequisitosCadastro />}
      {calloutLista.map((callout, i) => (
        <ManualCalloutBloco
          key={i}
          callout={callout}
          marginTop={i === 0 ? MANUAL_ESPACO_PARAGRAFO_PX : 8}
        />
      ))}
    </div>
  )

  if (passo.galeriaTelas?.length) {
    return (
      <div id={ancoraPassoId} style={blocoBase}>
        {colunaTexto}
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
      </div>
    )
  }

  if (empilharImagem && passo.imagem) {
    return (
      <div id={ancoraPassoId} style={blocoBase}>
        {colunaTexto}
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
        </div>
      </div>
    )
  }

  return (
    <div id={ancoraPassoId} style={{
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

function DocLoginManual() {
  const location = useLocation()
  const manualSlug = 'login'
  const fluxoPorSecao = useMemo(() => montarFluxoPorSecaoLogin(DOC_LOGIN_SECOES), [])
  const idsRastreaveis = useMemo(() => montarIdsRastreaveisLeituraLogin(DOC_LOGIN_SECOES), [])
  const [lidos, setLidos] = useState<Set<string>>(() => carregarLidosManual(manualSlug))
  useEffect(() => {
    setLidos(carregarLidosManual(manualSlug))
  }, [])
  const persistirLidos = useCallback((next: Set<string>) => {
    setLidos(next)
    salvarLidosManual(manualSlug, next)
  }, [])
  const toggleCapitulo = useCallback((secaoNum: number) => {
    const fluxo = fluxoPorSecao.get(secaoNum)
    const filhos = fluxo ? idsPassosFluxo(fluxo) : []
    const next = new Set(lidos)
    if (filhos.length > 0) {
      const estado = calcularEstadoLeitura(lidos, filhos)
      if (estado === 'lido') filhos.forEach(id => next.delete(id))
      else filhos.forEach(id => next.add(id))
    } else {
      const id = idSecaoManual(secaoNum)
      if (next.has(id)) next.delete(id)
      else next.add(id)
    }
    persistirLidos(next)
  }, [fluxoPorSecao, lidos, persistirLidos])
  const togglePasso = useCallback((id: string) => {
    const next = new Set(lidos)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    persistirLidos(next)
  }, [lidos, persistirLidos])
  const leituraCtx = useMemo(() => ({
    ativo: true,
    fluxoPorSecao,
    isLido: (id: string) => lidos.has(id),
    estadoCapitulo: (secaoNum: number) => {
      const fluxo = fluxoPorSecao.get(secaoNum)
      return calcularEstadoCapitulo(lidos, secaoNum, fluxo)
    },
    toggleCapitulo,
    togglePasso,
    totalRastreaveis: idsRastreaveis.length,
    totalLidos: contarLidosManual(lidos, idsRastreaveis),
    percentual: percentualLeituraManual(lidos, idsRastreaveis),
  }), [fluxoPorSecao, lidos, toggleCapitulo, togglePasso, idsRastreaveis])

  const entradasSumario = useMemo(() => montarEntradasSumarioLogin(), [])
  const totalCapitulosSumario = entradasSumario.length
  const totalSubcapitulosSumario = entradasSumario.reduce(
    (acc, e) => acc + (e.subitens?.length ?? 0),
    0,
  )
  const todosNums = DOC_LOGIN_SECOES.map(s => s.num)
  const [abertos, setAbertos] = useState<number[]>([])
  const [gruposSumarioAbertos, setGruposSumarioAbertos] = useState<Record<number, boolean>>({})
  const todosAbertos = todosNums.every(n => abertos.includes(n))
  const toggle = (n: number) => setAbertos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTodos = () => setAbertos(todosAbertos ? [] : [...todosNums])
  const toggleGrupoSumario = useCallback((secaoNum: number) => {
    setGruposSumarioAbertos(prev => ({ ...prev, [secaoNum]: !prev[secaoNum] }))
  }, [])
  const expandirGrupoSumario = useCallback((secaoNum: number) => {
    setGruposSumarioAbertos(prev => (prev[secaoNum] ? prev : { ...prev, [secaoNum]: true }))
  }, [])
  const secaoScroll = useMemo((): DocSecaoConfigurador => ({
    num: 1,
    titulo: 'Login',
    paragrafos: [],
    fluxos: DOC_LOGIN_SECOES
      .filter(s => (s.passosVisuais?.length ?? 0) > 0)
      .map((s): DocFluxo => ({
        titulo: s.titulo,
        paragrafos: [],
        passosVisuais: s.passosVisuais as DocFluxo['passosVisuais'],
        ancoraPassosPrefix: ancoraPassosLogin(s.num),
      })),
  }), [])
  const { scrollToSecao, scrollToItem } = useManualSumarioScroll(abertos, setAbertos, undefined, undefined, secaoScroll)

  useEffect(() => {
    const m = /^#doc-sec-(\d+)$/.exec(location.hash)
    if (m) scrollToSecao(Number(m[1]))
  }, [location.hash, scrollToSecao])

  return (
    <ManualLeituraContext.Provider value={leituraCtx}>
    <div style={{ maxWidth: '100%', color: 'var(--ws-text,#f1f5f9)' }}>
      {/* Badge */}
      <span style={{
        display: 'inline-block', background: 'rgba(99,102,241,.12)', color: '#818cf8',
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', padding: '4px 12px',
        borderRadius: 999, border: '1px solid rgba(99,102,241,.3)', marginBottom: 16,
        textTransform: 'uppercase',
      }}>Manual Descritivo de Tela</span>

      {/* Metadados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
        paddingBottom: 22,
        borderBottom: '1px solid rgba(148,163,184,.12)',
        marginBottom: 28,
      }}>
        {DOC_LOGIN_METADADOS.map(meta => (
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

      <ManualSumarioBloco
        entradas={entradasSumario}
        totalCapitulos={totalCapitulosSumario}
        totalSubcapitulos={totalSubcapitulosSumario}
        gruposAbertos={gruposSumarioAbertos}
        onToggleGrupo={toggleGrupoSumario}
        onExpandirGrupo={expandirGrupoSumario}
        scrollToItem={scrollToItem}
        todosAbertos={todosAbertos}
        toggleTodos={toggleTodos}
      />

      {/* Seções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {DOC_LOGIN_SECOES.map(s => {
          const aberto = abertos.includes(s.num)
          const estadoCap = leituraCtx.estadoCapitulo(s.num)
          return (
            <div key={s.num} id={`doc-sec-${s.num}`} style={{
              ...MANUAL_ESTILO_ACORDEON_SECAO,
              border: `1px solid ${aberto ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
              borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
            }}>
              {/* Header da seção */}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: aberto ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
                padding: '16px 22px',
                color: 'var(--ws-text,#f1f5f9)',
                transition: 'background .15s',
              }}>
                <button
                  type="button"
                  onClick={() => toggle(s.num)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'inherit',
                    textAlign: 'left',
                  }}
                >
                <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(s.num).padStart(2, '0')}</span>
                <span style={{
                    fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0,
                    opacity: estadoCap === 'lido' ? 0.65 : 1,
                  }}>{s.titulo}</span>
              </button>
                <ManualBotaoMarcarLido
                  estado={estadoCap}
                  onToggle={() => toggleCapitulo(s.num)}
                  rotulo={s.titulo}
                />
                <button
                  type="button"
                  onClick={() => toggle(s.num)}
                  aria-label={aberto ? `Recolher ${s.titulo}` : `Expandir ${s.titulo}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#818cf8',
                    flexShrink: 0,
                    transform: aberto ? 'rotate(180deg)' : 'none',
                    transition: 'transform .25s',
                    fontSize: '.9rem',
                    padding: 0,
                  }}
                >▾</button>
              </div>

              {/* Corpo da seção */}
              {aberto && (
                <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>

                  {s.layoutTextoImagemLateral && s.imagem ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
                      gap: 28,
                      alignItems: 'start',
                      marginBottom: s.lista ? 28 : 0,
                    }}>
                      <div style={{
                        padding: '2px 0 0 18px',
                        borderLeft: '3px solid rgba(99,102,241,.45)',
                      }}>
                        {s.paragrafos.map((p, i) => (
                          <ManualParagrafo
                            key={i}
                            texto={p}
                            marginBottom={manualMargemParagrafo(i, s.paragrafos.length)}
                          />
                        ))}
                      </div>
                      <ManualFiguraScreenshot src={s.imagem} alt={s.titulo} />
                    </div>
                  ) : s.passosVisuais ? (
                    <>
                      {s.paragrafos.map((p, i) => (
                        <ManualParagrafo
                          key={i}
                          texto={p}
                          marginBottom={manualMargemParagrafo(i, s.paragrafos.length)}
                        />
                      ))}
                      {s.passosVisuais.map(passo => (
                        <ManualBlocoPassoVisual
                          key={passo.num}
                          passo={passo}
                          ancoraPassoId={idPassoManual(ancoraPassosLogin(s.num), passo.num)}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {s.paragrafos.map((p, i) => (
                        <ManualParagrafo key={i} texto={p} marginBottom={manualMargemParagrafo(i, s.paragrafos.length)} />
                      ))}

                      {s.imagem && (
                        <div style={{ marginTop: 20 }}>
                          <ManualFiguraScreenshot src={s.imagem} alt={s.titulo} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Legenda: cards visuais em grid */}
                  {s.lista && !s.cardsBilaterais && !s.timeline && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: s.listaEmLinha
                        ? 'repeat(3, minmax(0, 1fr))'
                        : 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: s.listaEmLinha ? 8 : 10,
                      marginTop: 20,
                    }}>
                      {s.lista.map((item, i) => {
                        const [label, ...rest] = item.replace(/^[-–]\s*/, '').split(':')
                        const desc = rest.join(':').trim()
                        return (
                          <div key={i} style={{
                            background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
                            borderRadius: 10, padding: s.listaEmLinha ? '10px 10px' : '12px 14px',
                            display: 'flex', gap: s.listaEmLinha ? 8 : 10, alignItems: 'flex-start',
                            minWidth: s.listaEmLinha ? 0 : undefined,
                          }}>
                            <div style={{
                              width: s.listaEmLinha ? 24 : 28, height: s.listaEmLinha ? 24 : 28, borderRadius: 8,
                              background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              fontSize: s.listaEmLinha ? '.7rem' : '.75rem', color: '#818cf8', fontWeight: 700,
                            }}>{i + 1}</div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{
                                fontWeight: 600, fontSize: s.listaEmLinha ? '.75rem' : '.82rem',
                                color: MANUAL_TITULO_COR, marginBottom: desc ? 3 : 0, lineHeight: 1.35,
                              }}><ManualTextoRich texto={label.trim()} /></p>
                              {desc && <p style={{
                                fontSize: s.listaEmLinha ? '.68rem' : '.78rem',
                                color: MANUAL_CORPO_70, lineHeight: 1.45,
                              }}><ManualTextoRich texto={desc} /></p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Cards bilaterais */}
                  {s.cardsBilaterais && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '18px 0' }}>
                      {[s.cardsBilaterais.esquerdo, s.cardsBilaterais.direito].map((card, i) => (
                        <div key={i} style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 10, padding: '16px 18px' }}>
                          <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: '#818cf8', textTransform: 'uppercase', marginBottom: 6 }}>{card.label}</p>
                          <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 10, color: 'var(--ws-text,#f1f5f9)' }}>{card.titulo}</p>
                          {card.itens.map((it, j) => (
                            <p key={j} style={{ fontSize: '.8rem', color: MANUAL_CORPO_70, marginBottom: 4, lineHeight: 1.5 }}>
                              <ManualTextoRich texto={it} />
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timeline */}
                  {s.timeline && (
                    <div style={{ margin: '18px 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 17, top: 20, bottom: 20, width: 2, background: 'rgba(99,102,241,.2)' }} />
                      {s.timeline.map((t) => (
                        <div key={t.passo} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 999, background: 'rgba(99,102,241,.15)',
                            border: '2px solid rgba(99,102,241,.4)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0, color: '#818cf8', fontWeight: 700, fontSize: '.8rem',
                          }}>{t.passo}</div>
                          <div style={{ paddingTop: 6 }}>
                            <p style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--ws-text,#f1f5f9)', marginBottom: 3 }}>{t.titulo}</p>
                            <p style={{ fontSize: '.8rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
                              <ManualTextoRich texto={t.desc} />
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}


                  {/* Callout */}
                  {s.callout && (() => {
                    const c = CALLOUT_STYLE[s.callout.tipo]
                    return (
                      <div style={{ background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8, padding: '12px 16px', marginTop: 14 }}>
                        <p style={{ fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.label}</p>
                        <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={s.callout.texto} /></p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
    </ManualLeituraContext.Provider>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function BarraProgresso({ pct, cor = UNI_COR, altura = 7 }: { pct: number; cor?: string; altura?: number }) {
  return (
    <div style={{ height: altura, borderRadius: 9, background: 'rgba(148,163,184,.12)', overflow: 'hidden', flex: 1 }}>
      <span style={{
        display: 'block', height: '100%', width: `${Math.min(100, pct)}%`,
        background: pct >= 100 ? 'linear-gradient(90deg,#818cf8,#a78bfa)' : `linear-gradient(90deg,${cor},#a78bfa)`,
        transition: 'width .4s ease',
      }} />
    </div>
  )
}

// ── Jornada do Módulo (Academy · detalhe gamificado) ─────────────────────────
// Traduz o protótipo "Jornada do Módulo" para o design system do University.
// XP/GP/ranking são derivados do progresso demo (WIP: virá do banco via API).
const JORNADA_XP_TOTAL = 100
/** Segmento reservado: /academy/login/jornada abre a trilha do módulo (não a aula). */
const FASE_RESERVA_JORNADA = 'jornada'

// Colegas fictícios para o ranking do módulo (WIP: virá do banco via API).
const JORNADA_RANKING_DEMO: { nome: string; xp: number }[] = [
  { nome: 'Marina Alves', xp: 82 },
  { nome: 'Diego Ramos', xp: 65 },
  { nome: 'Bruno Costa', xp: 44 },
  { nome: 'Ana Paula', xp: 30 },
]

interface JornadaEtapa {
  fase: Fase
  numero: number
  xp: number
  feita: boolean
  atual: boolean
  bloqueada: boolean
  clicavel: boolean
}

/**
 * Slugs renomeados/unificados na curadoria — progresso legado continua válido.
 * Valores: slugs antigos que contam como conclusão do slug atual.
 */
const SLUGS_LEGADOS_AULA_CONCLUIDA: Partial<Record<string, readonly string[]>> = {
  'acessar-workspaces': [
    'gerenciando-workspaces',
    'configurando-workspaces',
    'criar-workspace',
    'editar-workspace',
    'ativar-workspace',
    'excluir-workspace',
  ],
  'administrando-usuarios': ['convidando-usuarios', 'gerenciando-usuarios', 'organize-usuarios-na-plataforma'],
  'gerenciando-assinaturas': ['assinaturas-e-financeiro', 'gerenciando-assinaturas'],
  'financeiro-da-conta': ['assinaturas-e-financeiro', 'financeiro-da-conta'],
}

function faseEstaConcluida(fase: Fase, concluidas: Set<string>): boolean {
  if (!fase.slug) return fase.concluida
  if (concluidas.has(fase.slug)) return true
  const legados = SLUGS_LEGADOS_AULA_CONCLUIDA[fase.slug]
  if (!legados?.length) return false
  return legados.some(slug => concluidas.has(slug))
}

/** Promove slugs legados → atuais para persistência e desbloqueio linear. */
function normalizarSlugsConclusaoAcademy(slugs: Iterable<string>): Set<string> {
  const s = new Set(slugs)
  for (const [atual, legados] of Object.entries(SLUGS_LEGADOS_AULA_CONCLUIDA)) {
    if (s.has(atual)) continue
    const legadoOk = legados.some(slug => s.has(slug))
    if (legadoOk) s.add(atual)
  }
  return s
}

/** Distribui `total` XP entre `n` etapas; o resto sobra na última. */
function xpPorEtapa(total: number, n: number): number[] {
  if (n <= 0) return []
  const base = Math.floor(total / n)
  const xps = Array.from({ length: n }, () => base)
  xps[n - 1] += total - base * n
  return xps
}

function iniciaisNome(nome: string): string {
  return nome.split(' ').map(parte => parte[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function calcularIndiceAtualGlobal(trilhas: Trilha[], aulasConcluidas: Set<string>): number {
  let idx = 0
  for (const trilha of trilhas) {
    for (const fase of trilha.fases) {
      const feita = faseEstaConcluida(fase, aulasConcluidas)
      if (!feita) return idx
      idx += 1
    }
  }
  return idx
}

function calcularEtapasJornada(
  fases: Fase[],
  aulasConcluidas: Set<string>,
  opts?: { offsetNumero?: number; indiceAtualGlobal?: number },
): JornadaEtapa[] {
  const offset = opts?.offsetNumero ?? 0
  const xps = xpPorEtapa(JORNADA_XP_TOTAL, fases.length)
  const feitas = fases.map(fase => faseEstaConcluida(fase, aulasConcluidas))
  const idxAtualLocal = feitas.findIndex(feita => !feita)
  return fases.map((fase, i) => {
    const indiceGlobal = offset + i
    const atual = opts?.indiceAtualGlobal !== undefined
      ? indiceGlobal === opts.indiceAtualGlobal
      : i === idxAtualLocal
    const feita = feitas[i]
    return {
      fase,
      numero: indiceGlobal + 1,
      xp: xps[i],
      feita,
      atual,
      bloqueada: !feita && !atual,
      clicavel: Boolean(fase.slug) && (feita || atual),
    }
  })
}

function calcularProgressoModulo(trilha: Trilha, aulasConcluidas: Set<string>) {
  const etapas = calcularEtapasJornada(trilha.fases, aulasConcluidas)
  const feitas = etapas.filter(e => e.feita).length
  const total = etapas.length
  const xp = etapas.filter(e => e.feita).reduce((soma, e) => soma + e.xp, 0)
  const pct = total > 0 ? Math.round((feitas / total) * 100) : trilha.prog
  return { feitas, total, xp, pct }
}

function calcularProgressoProduto(slug: keyof typeof TRILHAS_POR_PRODUTO, aulasConcluidas: Set<string>) {
  const trilhas = TRILHAS_POR_PRODUTO[slug]
  if (!trilhas?.length) return { feitas: 0, total: 0, xp: 0, pct: 0 }
  let feitas = 0
  let total = 0
  let xp = 0
  for (const trilha of trilhas) {
    const p = calcularProgressoModulo(trilha, aulasConcluidas)
    feitas += p.feitas
    total += p.total
    xp += p.xp
  }
  const pct = total > 0 ? Math.round((feitas / total) * 100) : 0
  return { feitas, total, xp, pct }
}

function calcularMetricasOnboarding(aulasConcluidas: Set<string>) {
  const modulos = PRODUTOS_CONTRATADOS.map(slug => {
    const trilha = TRILHAS_POR_PRODUTO[slug][0]
    const progresso = calcularProgressoProduto(slug, aulasConcluidas)
    return { slug, trilha, ...progresso }
  })
  const xpTotal = modulos.reduce((soma, m) => soma + m.xp, 0)
  const concluidas = modulos.filter(m => m.pct >= 100).length
  const emAndamento = modulos.filter(m => m.pct > 0 && m.pct < 100).length
  return { modulos, xpTotal, concluidas, emAndamento, certificados: concluidas, gp: xpTotal * 2 }
}

function JornadaNode({ etapa }: { etapa: JornadaEtapa }) {
  const anelPulsante = etapa.atual ? ' uni-jornada-node--current' : ''
  return (
    <div
      className={`uni-jornada-node${anelPulsante}`}
      style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: '50%', zIndex: 1,
        display: 'grid', placeItems: 'center',
        background: etapa.feita ? 'rgba(129,140,248,.45)' : 'var(--bg-base,#1e293b)',
        border: `2px solid ${etapa.feita || etapa.atual ? (etapa.feita ? 'rgba(129,140,248,.65)' : UNI_COR) : 'rgba(148,163,184,.22)'}`,
      }}
    >
      {etapa.feita
        ? <CheckFat weight="fill" size={12} style={{ color: '#c7d2fe' }} />
        : <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.72rem',
            color: etapa.atual ? UNI_COR : 'var(--ws-muted,#94a3b8)',
          }}>{etapa.numero}</span>}
    </div>
  )
}

function EtapaStatusTag({ etapa }: { etapa: JornadaEtapa }) {
  const { t } = useTranslation()
  const { atual, feita, bloqueada } = etapa
  const destaqueConcluido = feita && !atual

  if (atual) {
    return (
      <span className="uni-jornada-etapa-tag uni-jornada-etapa-tag--current">
        <Clock size={12} weight="fill" />
        {t('university.jornada.em_andamento')}
      </span>
    )
  }
  if (destaqueConcluido) {
    return (
      <span className="uni-jornada-etapa-tag uni-jornada-etapa-tag--done">
        <CheckCircle size={12} weight="fill" />
        {t('university.jornada.etapa_concluida')}
      </span>
    )
  }
  if (bloqueada) {
    return (
      <span className="uni-jornada-etapa-tag uni-jornada-etapa-tag--blocked">
        <Lock size={12} weight="fill" />
        {t('university.jornada.etapa_bloqueada')}
      </span>
    )
  }
  return null
}

function JornadaEtapaCard({ etapa, onAbrir }: {
  etapa: JornadaEtapa
  onAbrir: (slug: string) => void
}) {
  const { fase, atual, feita, bloqueada, clicavel, xp } = etapa
  const destaqueConcluido = feita && !atual
  const abrir = () => { if (clicavel && fase.slug) onAbrir(fase.slug) }
  return (
    <div
      role={clicavel ? 'button' : undefined}
      tabIndex={clicavel ? 0 : undefined}
      onClick={abrir}
      onKeyDown={(e) => { if (clicavel && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrir() } }}
      className={`uni-jornada-etapa${atual ? ' uni-jornada-etapa--current' : ''}${destaqueConcluido ? ' uni-jornada-etapa--done' : ''}`}
      style={{
        flex: 1, borderRadius: 14, padding: '14px 18px',
        cursor: clicavel ? 'pointer' : 'default',
        background: destaqueConcluido ? 'rgba(129,140,248,.08)' : 'var(--bg-base,#1e293b)',
        border: `1px solid ${destaqueConcluido || atual ? UNI_COR : 'rgba(148,163,184,.12)'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '.95rem', marginBottom: 4,
            color: bloqueada ? 'var(--ws-muted,#94a3b8)' : 'var(--ws-text,#f1f5f9)',
          }}>{fase.nome}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem' }}>
            <Clock size={12} />{fase.duracao}
          </div>
        </div>
        <div style={{
          flexShrink: 0, background: 'rgba(129,140,248,.12)', color: UNI_COR,
          fontSize: '.72rem', fontWeight: 700, padding: '4px 9px', borderRadius: 9999,
        }}>{xp} XP</div>
      </div>
      <EtapaStatusTag etapa={etapa} />
    </div>
  )
}

function JornadaCardBox({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 14, padding: 16 }}>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: 'var(--ws-muted,#94a3b8)',
        fontSize: '.68rem', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10,
      }}>{titulo}</div>
      {children}
    </div>
  )
}

function JornadaRanking({ xpUsuario }: { xpUsuario: number }) {
  const { t } = useTranslation()
  const linhas = [...JORNADA_RANKING_DEMO, { nome: t('university.jornada.voce'), xp: xpUsuario, isYou: true }]
    .sort((a, b) => b.xp - a.xp)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {linhas.map((p, i) => {
        const isYou = 'isYou' in p && p.isYou
        return (
          <div key={`${p.nome}-${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8,
            background: isYou ? 'rgba(129,140,248,.1)' : 'transparent',
          }}>
            <div style={{
              width: 18, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '.72rem', color: i === 0 ? '#fbbf24' : 'var(--ws-muted,#94a3b8)',
            }}>{i + 1}</div>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
              fontSize: '.6rem', fontWeight: 700, color: '#f8fafc',
              background: isYou ? UNI_COR : 'rgba(148,163,184,.25)',
            }}>{iniciaisNome(p.nome)}</div>
            <div style={{
              flex: 1, fontSize: '.82rem', fontWeight: 600,
              color: isYou ? UNI_COR : 'var(--ws-text,#f1f5f9)',
            }}>{p.nome}</div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)' }}>{p.xp} XP</div>
          </div>
        )
      })}
    </div>
  )
}

function JornadaSidebar({ xp, gp, feitas, total, xpMeta = JORNADA_XP_TOTAL, rankingTituloKey = 'university.jornada.ranking_modulo' }: {
  xp: number; gp: number; feitas: number; total: number; xpMeta?: number; rankingTituloKey?: string
}) {
  const { t } = useTranslation()
  const pct = xpMeta > 0 ? Math.round((xp / xpMeta) * 100) : 0
  const badgeAtiva = feitas >= 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <JornadaCardBox titulo={t('university.jornada.seu_progresso')}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.6rem', color: 'var(--ws-text,#f1f5f9)' }}>
          {xp}<span style={{ fontSize: '.9rem', color: 'var(--ws-muted,#94a3b8)', fontWeight: 600 }}> XP</span>
        </div>
        {xpMeta > 0 && (
          <>
            <div style={{ marginTop: 10 }}><BarraProgresso pct={Math.min(pct, 100)} altura={6} /></div>
        <div style={{ color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem', marginTop: 8 }}>
          {t('university.jornada.tarefas_concluidas', { feitas, total })}
        </div>
          </>
        )}
      </JornadaCardBox>

      <JornadaCardBox titulo={t('university.jornada.recompensas')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: badgeAtiva ? UNI_COR : 'rgba(148,163,184,.18)',
              display: 'grid', placeItems: 'center', color: '#0b1220',
            }}><Sparkle weight="fill" size={14} /></div>
            <div style={{ color: 'var(--ws-text,#f1f5f9)', fontSize: '.82rem', fontWeight: 600 }}>
              {t('university.jornada.badge_iniciante')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(167,139,250,.22)', border: '1.5px solid #a78bfa',
            }} />
            <div style={{ color: 'var(--ws-text,#f1f5f9)', fontSize: '.82rem', fontWeight: 600 }}>
              {gp} {t('university.jornada.gravity_points')}
            </div>
          </div>
        </div>
      </JornadaCardBox>

      <JornadaCardBox titulo={t(rankingTituloKey)}>
        <JornadaRanking xpUsuario={xp} />
      </JornadaCardBox>
    </div>
  )
}

function BarraSegmentada({ total, preenchidos, cor }: { total: number; preenchidos: number; cor: string }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 12, borderRadius: 5,
            background: i < preenchidos ? cor : 'rgba(148,163,184,.18)',
          }}
        />
      ))}
    </div>
  )
}

function siglaModuloOnboarding(slug: keyof typeof TRILHAS_POR_PRODUTO): string {
  if (slug === 'bem-vindo') return 'BV'
  if (slug === 'pedido') return 'P'
  if (slug === 'processo') return 'Pr'
  if (slug === 'smart-read') return 'S'
  if (slug === 'login') return 'L'
  if (slug === 'configurador') return 'C'
  return slug.slice(0, 2).toUpperCase()
}

function calcularNivelOnboarding(xpTotal: number) {
  const nivel = Math.max(1, Math.floor(xpTotal / 75) + 1)
  const xpMetaNivel = nivel * 75
  const xpParaSubir = Math.max(0, xpMetaNivel - xpTotal)
  const titulos = ['Iniciante', 'Aprendiz', 'Praticante', 'Explorador', 'Especialista'] as const
  const titulo = titulos[Math.min(nivel - 1, titulos.length - 1)]
  return { nivel, xpMetaNivel, xpParaSubir, titulo, pctNivel: Math.min(100, Math.round((xpTotal / xpMetaNivel) * 100)) }
}

/** WIP demo — virá do banco via API. */
const MANUAIS_LIDOS_DEMO = { lidos: 0, total: 8 }
const OFENSIVA_DIAS_DEMO = 0

/** Chave sessionStorage — bump para resetar progresso local entre demos. */
const CHAVE_AULAS_CONCLUIDAS = 'university_academy_concluidas_v1'

function RankingGeralDashboard({ xpUsuario }: { xpUsuario: number }) {
  const { t } = useTranslation()
  const linhas = [...JORNADA_RANKING_DEMO, { nome: t('university.jornada.voce'), xp: xpUsuario, isYou: true }]
    .sort((a, b) => b.xp - a.xp)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {linhas.map((p, i) => {
        const isYou = 'isYou' in p && p.isYou
        return (
          <div
            key={`${p.nome}-${i}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', margin: '0 -4px', borderRadius: 9,
              background: isYou ? 'rgba(129,140,248,.12)' : 'transparent',
              border: isYou ? '1px solid rgba(129,140,248,.4)' : '1px solid transparent',
            }}
          >
            <div style={{
              width: 16, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '.75rem',
              color: i === 0 ? '#fbbf24' : i === 1 ? 'var(--ws-muted,#94a3b8)' : i === 2 ? '#d97706' : 'var(--ws-muted,#64748b)',
            }}>{i + 1}</div>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
              fontSize: '.6rem', fontWeight: 700, color: '#f8fafc',
              background: isYou ? '#818cf8' : 'rgba(148,163,184,.25)',
            }}>{iniciaisNome(p.nome)}</div>
            <div style={{
              flex: 1, fontSize: '.82rem', fontWeight: 600,
              color: isYou ? '#818cf8' : 'var(--ws-text,#f1f5f9)',
            }}>{p.nome}</div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)' }}>{p.xp} XP</div>
          </div>
        )
      })}
    </div>
  )
}

function RailDashboardOnboarding({ xpTotal, gp, feitas }: { xpTotal: number; gp: number; feitas: number }) {
  const { t } = useTranslation()
  const { nivel, xpMetaNivel, xpParaSubir, titulo, pctNivel } = calcularNivelOnboarding(xpTotal)
  const badgeObtida = feitas >= 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(30,41,59,.6))',
        border: '1px solid rgba(251,191,36,.28)', borderRadius: 15, padding: 16,
      }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: 'var(--ws-muted,#94a3b8)',
          fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12,
        }}>{t('university.dashboard.nivel_ofensiva')}</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--ws-text,#f1f5f9)' }}>
          {t('university.dashboard.nivel_rotulo', { nivel, titulo })}
        </div>
        <div style={{ height: 8, borderRadius: 9999, background: 'rgba(148,163,184,.18)', overflow: 'hidden', margin: '10px 0 6px' }}>
          <div style={{ height: '100%', width: `${pctNivel}%`, borderRadius: 9999, background: '#818cf8' }} />
        </div>
        <div style={{ color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem' }}>
          {xpTotal} / {xpMetaNivel} XP
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14 }}>
          <div className="uni-dashboard-ofensiva-icone" aria-hidden>
            <span style={{ fontSize: 14 }}>🔥</span>
          </div>
          <div style={{ fontSize: '.82rem', color: '#fbbf24', fontWeight: 700 }}>
            {t('university.dashboard.ofensiva_dias', { dias: OFENSIVA_DIAS_DEMO })}
          </div>
        </div>
      </div>

      <JornadaCardBox titulo={t('university.jornada.recompensas')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: badgeObtida ? 'linear-gradient(135deg, #818cf8, #a78bfa)' : 'rgba(148,163,184,.18)',
            }} />
            <div style={{ color: 'var(--ws-text,#f1f5f9)', fontSize: '.82rem', fontWeight: 600, flex: 1 }}>
              {t('university.jornada.badge_iniciante')}
            </div>
            {badgeObtida && (
              <div style={{ fontSize: '.66rem', fontWeight: 700, color: '#818cf8' }}>
                {t('university.dashboard.badge_obtido')}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(167,139,250,.22)', border: '1.5px solid #a78bfa',
            }} />
            <div style={{ color: 'var(--ws-text,#f1f5f9)', fontSize: '.82rem', fontWeight: 600 }}>
              {gp} {t('university.jornada.gravity_points')}
            </div>
          </div>
        </div>
      </JornadaCardBox>

      <JornadaCardBox titulo={t('university.jornada.ranking_geral')}>
        <RankingGeralDashboard xpUsuario={xpTotal} />
      </JornadaCardBox>
    </div>
  )
}

function PainelDashboardOnboarding({ aulasConcluidas, onAbrirModulo }: {
  aulasConcluidas: Set<string>
  onAbrirModulo: (slug: keyof typeof TRILHAS_POR_PRODUTO) => void
}) {
  const { t } = useTranslation()
  const metricas = calcularMetricasOnboarding(aulasConcluidas)
  const { modulos, xpTotal, concluidas, emAndamento, certificados, gp } = metricas
  const { xpParaSubir, nivel } = calcularNivelOnboarding(xpTotal)

  const moduloAtual = modulos.find(m => m.pct > 0 && m.pct < 100) ?? modulos.find(m => m.pct < 100) ?? modulos[0]
  const etapasAtual = calcularEtapasJornada(moduloAtual.trilha.fases, aulasConcluidas)
  const idxEtapaAtual = etapasAtual.findIndex(e => e.atual)
  const etapaAtual = idxEtapaAtual >= 0 ? etapasAtual[idxEtapaAtual] : etapasAtual.find(e => !e.feita)
  const faltam = modulos.filter(m => m.pct < 100)

  const kpis = [
    { k: 'university.jornada.pontos', v: xpTotal.toLocaleString('pt-BR') },
    { k: 'university.jornada.concluidas', v: String(concluidas) },
    { k: 'university.jornada.em_andamento', v: String(emAndamento) },
    { k: 'university.jornada.certificados', v: String(certificados) },
  ]

  const pctAnel = moduloAtual.total > 0 ? Math.round((moduloAtual.feitas / moduloAtual.total) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.62fr) minmax(220px, 1fr)', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Hero — continue de onde parou */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(129,140,248,.14), rgba(30,41,59,.8))',
          border: '1px solid rgba(129,140,248,.28)', borderRadius: 18, padding: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#818cf8',
                fontSize: '.66rem', letterSpacing: '.1em', textTransform: 'uppercase',
              }}>{t('university.dashboard.continuar_titulo')}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: 'var(--ws-text,#f1f5f9)', margin: '7px 0 3px' }}>
                {moduloAtual.trilha.nome}
              </div>
              <div style={{ color: 'var(--ws-muted,#94a3b8)', fontSize: '.84rem' }}>
                {etapaAtual
                  ? t('university.dashboard.etapa_atual', {
                    atual: etapaAtual.numero,
                    total: moduloAtual.total,
                    nome: etapaAtual.fase.nome,
                  })
                  : t('university.dashboard.etapas_progresso', { feitas: moduloAtual.feitas, total: moduloAtual.total })}
              </div>
            </div>
            <div
              style={{
                position: 'relative', width: 80, height: 80, flexShrink: 0, borderRadius: '50%',
                background: `conic-gradient(#818cf8 0 ${pctAnel}%, rgba(148,163,184,.18) ${pctAnel}% 100%)`,
              }}
              aria-hidden
            >
              <div style={{
                position: 'absolute', inset: 9, borderRadius: '50%', background: 'var(--bg-base,#1e293b)',
                display: 'grid', placeItems: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.95rem', color: 'var(--ws-text,#f1f5f9)',
              }}>{moduloAtual.feitas}/{moduloAtual.total}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onAbrirModulo(moduloAtual.slug)}
              style={{
                border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '.84rem', color: '#0b1220', background: '#818cf8',
                padding: '10px 20px', borderRadius: 10,
              }}
            >{t('university.dashboard.continuar_jornada')}</button>
            <div style={{ color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem' }}>
              {t('university.dashboard.nivel_xp_faltam', { nivel, xp: xpParaSubir })}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {kpis.map(kpi => (
            <div key={kpi.k} style={{ background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 13, padding: '13px 14px' }}>
              <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>{t(kpi.k)}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginTop: 5, color: 'var(--ws-text,#f1f5f9)' }}>{kpi.v}</div>
            </div>
          ))}
        </div>

        {/* Barras segmentadas */}
        <div style={{ background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 15, padding: '18px 20px' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
              <div style={{ fontWeight: 700, color: 'var(--ws-text,#f1f5f9)', fontSize: '.86rem' }}>
                {t('university.dashboard.produtos_onboarding_concluido')}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#818cf8', fontSize: '.88rem' }}>
                {concluidas}<span style={{ color: 'var(--ws-muted,#64748b)', fontWeight: 600 }}>/{modulos.length}</span>
              </div>
            </div>
            <BarraSegmentada total={modulos.length} preenchidos={concluidas} cor="#818cf8" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
              <div style={{ fontWeight: 700, color: 'var(--ws-text,#f1f5f9)', fontSize: '.86rem' }}>
                {t('university.dashboard.manuais_lidos')}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: UNI_COR, fontSize: '.88rem' }}>
                {MANUAIS_LIDOS_DEMO.lidos}<span style={{ color: 'var(--ws-muted,#64748b)', fontWeight: 600 }}>/{MANUAIS_LIDOS_DEMO.total}</span>
              </div>
            </div>
            <BarraSegmentada total={MANUAIS_LIDOS_DEMO.total} preenchidos={MANUAIS_LIDOS_DEMO.lidos} cor={UNI_COR} />
          </div>
        </div>

        {/* O que falta */}
        <div style={{ background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)', borderRadius: 15, padding: '18px 20px' }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: 'var(--ws-muted,#94a3b8)',
            fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12,
          }}>{t('university.dashboard.o_que_falta')}</div>
          {faltam.map(({ slug, trilha, feitas, total, pct }, idx) => (
            <div
              key={slug}
              style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '10px 0',
                borderTop: idx > 0 ? '1px solid rgba(148,163,184,.1)' : undefined,
              }}
            >
              <div style={{
                width: 34, height: 34, flexShrink: 0, borderRadius: 10,
                background: trilha.tag, display: 'grid', placeItems: 'center',
                color: '#0b1220', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '.8rem',
              }}>{siglaModuloOnboarding(slug)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--ws-text,#f1f5f9)', fontSize: '.86rem' }}>{trilha.nome}</div>
                <div style={{ color: 'var(--ws-muted,#94a3b8)', fontSize: '.72rem', marginTop: 1 }}>
                  {t('university.dashboard.etapas_progresso', { feitas, total })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAbrirModulo(slug)}
                style={{
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.72rem',
                  padding: '6px 13px', borderRadius: 8,
                  background: pct > 0 ? '#818cf8' : UNI_COR,
                  color: pct > 0 ? '#0b1220' : '#0b1220',
                }}
              >
                {pct > 0 ? t('university.acao.continuar') : t('university.dashboard.iniciar')}
              </button>
            </div>
          ))}
        </div>
      </div>

      <RailDashboardOnboarding xpTotal={xpTotal} gp={gp} feitas={modulos.reduce((s, m) => s + m.feitas, 0)} />
    </div>
  )
}

function SeletorCapitulosAcademy({ trilhas, ativo, onSelecionar, aulasConcluidas }: {
  trilhas: Trilha[]
  ativo: number
  onSelecionar: (idx: number) => void
  aulasConcluidas: Set<string>
}) {
  if (trilhas.length <= 1) return null
  return (
    <div className="uni-academy-capitulos">
      {trilhas.map((tr, i) => {
        const prog = calcularProgressoModulo(tr, aulasConcluidas)
        return (
          <button
            key={tr.slug ?? tr.nome}
            type="button"
            className={`uni-academy-capitulos__item${i === ativo ? ' is-ativo' : ''}${prog.pct >= 100 ? ' is-concluido' : ''}`}
            onClick={() => onSelecionar(i)}
          >
            <span aria-hidden>{tr.emoji}</span>
            {tr.nome}
            <span className="uni-academy-capitulos__badge">
              {prog.feitas}/{prog.total}
              {prog.pct >= 100 && <CheckFat weight="fill" size={10} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function JornadaModulo({ trilha, aulasConcluidas, onAbrirFase, exibirSidebar = true, offsetNumero = 0, indiceAtualGlobal }: {
  trilha: Trilha
  aulasConcluidas: Set<string>
  onAbrirFase: (slug: string) => void
  exibirSidebar?: boolean
  /** Deslocamento para numeração contínua entre capítulos (Configurador). */
  offsetNumero?: number
  /** Índice global (0-based) da etapa em andamento na jornada multi-capítulo. */
  indiceAtualGlobal?: number
}) {
  const etapas = calcularEtapasJornada(trilha.fases, aulasConcluidas, {
    offsetNumero,
    indiceAtualGlobal,
  })
  const feitas = etapas.filter(e => e.feita).length
  const xp = etapas.filter(e => e.feita).reduce((soma, e) => soma + e.xp, 0)
  const gp = xp * 2
  const pct = Math.round((xp / JORNADA_XP_TOTAL) * 100)

  return (
    <div>
      {/* Título + progresso do módulo */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', background: `${trilha.tag}22`, fontSize: 20 }}>
              {trilha.emoji}
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--ws-text,#f1f5f9)' }}>
              {trilha.nome}
            </div>
          </div>
          <div style={{ color: UNI_COR, fontSize: '.82rem', fontWeight: 700 }}>{xp}/{JORNADA_XP_TOTAL} XP</div>
        </div>
        <BarraProgresso pct={pct} altura={8} />
      </div>

      {/* Caminho (+ sidebar opcional) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: exibirSidebar ? 'minmax(0, 1.5fr) minmax(240px, 1fr)' : 'minmax(0, 1fr)',
        gap: 24,
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 13, top: 48, bottom: 48, width: 2,
            background: 'linear-gradient(180deg, ' + UNI_COR + ', rgba(148,163,184,.15))',
          }} />
          {etapas.map(etapa => (
            <div key={etapa.fase.slug ?? `${trilha.slug}-${etapa.numero}`} style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <JornadaNode etapa={etapa} />
              <JornadaEtapaCard etapa={etapa} onAbrir={onAbrirFase} />
            </div>
          ))}
        </div>
        {exibirSidebar && <JornadaSidebar xp={xp} gp={gp} feitas={feitas} total={etapas.length} />}
      </div>
    </div>
  )
}

function JornadaMultiCapitulos({ trilhas, aulasConcluidas, onAbrirFase, capituloAtivo, onSelecionarCapitulo }: {
  trilhas: Trilha[]
  aulasConcluidas: Set<string>
  onAbrirFase: (slug: string) => void
  capituloAtivo: number
  onSelecionarCapitulo: (idx: number) => void
}) {
  const { t } = useTranslation()
  let feitasTotal = 0
  let aulasTotal = 0
  let xpTotal = 0
  for (const trilha of trilhas) {
    const p = calcularProgressoModulo(trilha, aulasConcluidas)
    feitasTotal += p.feitas
    aulasTotal += p.total
    xpTotal += p.xp
  }
  const xpMeta = trilhas.length * JORNADA_XP_TOTAL
  const indiceAtualGlobal = calcularIndiceAtualGlobal(trilhas, aulasConcluidas)

  const irParaCapitulo = useCallback((idx: number) => {
    onSelecionarCapitulo(idx)
    const slug = trilhas[idx]?.slug
    if (slug) {
      document.getElementById(`uni-cap-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [onSelecionarCapitulo, trilhas])

  return (
    <div>
      <div className="uni-academy-capitulos-wrap">
        <div className="uni-academy-capitulos__titulo">{t('university.capitulos.titulo')}</div>
        <p className="uni-academy-capitulos__sub">{t('university.capitulos.subtitulo')}</p>
        <SeletorCapitulosAcademy
          trilhas={trilhas}
          ativo={capituloAtivo}
          onSelecionar={irParaCapitulo}
          aulasConcluidas={aulasConcluidas}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(240px, 1fr)', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {trilhas.map((trilha, i) => {
            const offsetNumero = trilhas.slice(0, i).reduce((soma, tr) => soma + tr.fases.length, 0)
            return (
            <section
              key={trilha.slug ?? trilha.nome}
              id={trilha.slug ? `uni-cap-${trilha.slug}` : undefined}
              className={`uni-academy-capitulo-secao${i === capituloAtivo ? ' is-ativo' : ''}`}
            >
              <JornadaModulo
                trilha={trilha}
                aulasConcluidas={aulasConcluidas}
                onAbrirFase={onAbrirFase}
                exibirSidebar={false}
                offsetNumero={offsetNumero}
                indiceAtualGlobal={indiceAtualGlobal}
              />
            </section>
            )
          })}
        </div>
        <JornadaSidebar xp={xpTotal} gp={xpTotal * 2} feitas={feitasTotal} total={aulasTotal} xpMeta={xpMeta} />
      </div>
    </div>
  )
}

export function UniversityGravity() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const origemAcademy = searchParams.get('origem')
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const {
    currentUser, currentTheme, toggleTheme,
    tooltipsDisabled, toggleTooltips,
    organizacoes, setOrganizacoes,
  } = useShellStore()
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole } = useCarregarTipoUsuario()
  const isLight = currentTheme === 'light'

  useMeSync()

  const secao = pathname.includes('/docs') ? 'docs'
    : pathname.includes('/builders') ? 'builders'
    : pathname.includes('/minha-jornada') ? 'jornada'
    : 'academy'

  const academyPathSuffix = secao === 'academy'
    ? pathname.replace(/^\/university-gravity(?:\/academy)?\/?/, '')
    : ''
  const partesAcademy = academyPathSuffix.split('/').filter(Boolean)
  const produtoSlugBruto = (partesAcademy[0] ?? null) as ProdutoSlug | null
  const produtoSlug = produtoSlugBruto && produtoSlugBruto in ICON_MAP ? produtoSlugBruto : null
  const faseSlugBruto = produtoSlug ? (partesAcademy[1] ?? null) : null
  const faseReservaJornada = faseSlugBruto === FASE_RESERVA_JORNADA
  const faseAulaSlug = faseSlugBruto && !faseReservaJornada ? faseSlugBruto : null

  const exibirDashboardGeral = secao === 'academy' && !faseSlugBruto && !produtoSlug
  const exibirJornadaModulo = Boolean(secao === 'academy' && produtoSlug && !faseSlugBruto)

  const docsPathPartes = secao === 'docs'
    ? pathname.replace('/university-gravity/docs', '').split('/').filter(Boolean)
    : []

  const docsProdutoSlug = (docsPathPartes[0] ?? null) as ProdutoSlug | null

  const docsConfiguradorPagina = docsProdutoSlug === 'configurador'
    ? resolverConfiguradorManualSlug(docsPathPartes[1])
    : null

  const configuradorManualItem = docsConfiguradorPagina
    ? CONFIGURADOR_MANUAL_ITENS.find(i => i.pathSeg === docsConfiguradorPagina) ?? null
    : null

  const trilhasAtivas: Trilha[] | null = exibirJornadaModulo && produtoSlug
    ? (TRILHAS_POR_PRODUTO[produtoSlug] ?? null)
    : null

  const [capituloAtivo, setCapituloAtivo] = useState(0)
  useEffect(() => { setCapituloAtivo(0) }, [produtoSlug])

  const trilhaAtiva = trilhasAtivas?.[capituloAtivo] ?? null

  // Controle local de aulas concluídas (WIP: virá do banco via API)
  const [aulasConcluidas, setAulasConcluidas] = useState<Set<string>>(() => {
    const salvo = sessionStorage.getItem(CHAVE_AULAS_CONCLUIDAS)
    const bruto = salvo ? (JSON.parse(salvo) as string[]) : []
    const norm = normalizarSlugsConclusaoAcademy(bruto)
    const normArr = [...norm]
    if (normArr.length !== bruto.length || normArr.some(s => !bruto.includes(s))) {
      sessionStorage.setItem(CHAVE_AULAS_CONCLUIDAS, JSON.stringify(normArr))
    }
    return norm
  })
  const marcarConcluida = useCallback((slug: string) => {
    setAulasConcluidas(prev => {
      const novo = normalizarSlugsConclusaoAcademy([...prev, slug])
      sessionStorage.setItem(CHAVE_AULAS_CONCLUIDAS, JSON.stringify([...novo]))
      return novo
    })
  }, [])

  // Progresso geral nos produtos contratados (derivado do progresso real + demo estático)
  const progressoContratados = PRODUTOS_CONTRATADOS.map(slug => {
    const trilhas = TRILHAS_POR_PRODUTO[slug]
    const trilha = trilhas?.[0]
    const agregado = trilhas?.length
      ? calcularProgressoProduto(slug as keyof typeof TRILHAS_POR_PRODUTO, aulasConcluidas)
      : { pct: 0 }
    return {
    slug,
      prog: agregado.pct,
      emoji: trilha?.emoji ?? '📦',
    }
  })
  const concluidos = progressoContratados.filter(p => p.prog >= 100).length
  const pctGeral = Math.round((concluidos / progressoContratados.length) * 100)

  const nomeOrganizacao = currentUser?.nomeOrganizacao ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@usegravity.com.br'

  const orgsFetchedRef = useRef(false)
  useEffect(() => {
    if (!isGravityAdmin || orgsFetchedRef.current) return
    orgsFetchedRef.current = true
    ;(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch('/api/v1/me/organizacoes', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.organizacoes)) setOrganizacoes(data.organizacoes)
      } catch { /* UX opcional */ }
    })()
  }, [isGravityAdmin, getToken, setOrganizacoes])

  const handleTrocarOrganizacao = async (idOrg: string) => {
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch('/api/v1/me/organizacao-ativa', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_organizacao: idOrg }),
      })
      if (!res.ok) return
      sessionStorage.removeItem('gravity_company_id')
      window.location.href = '/university-gravity/academy'
    } catch { /* silencioso */ }
  }

  const orgWorkspaceItems = isGravityAdmin
    ? organizacoes.map((org: OrganizacaoShell) => ({ id: org.id_organizacao, name: org.nome_organizacao, plan: org.subdominio_organizacao }))
    : []

  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('configurador')
  const [ecoNodes] = useState<EcosystemNode[]>(buildEcosystemNodes({ currentProductId: 'configurador' }))
  useEffect(() => {
    locAddEntry({ productId: 'configurador', productLabel: t('university.modulo_nome'), productColor: UNI_COR, pageLabel: t('university.modulo_nome'), pagePath: '/university-gravity' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { document.body.classList.toggle('light-theme', isLight) }, [isLight])
  useEffect(() => { document.body.classList.toggle('tooltips-disabled', tooltipsDisabled) }, [tooltipsDisabled])

  const produtoIconManual = (slug: ProdutoSlug, size = 16) => {
    const IconComp = ICON_MAP[slug]
    return <IconComp weight="duotone" size={size} />
  }

  const produtoIconAcademy = (slug: ProdutoSlug, size = 16) => {
    const IconComp = ICON_MAP[slug]
    return <IconComp weight="duotone" size={size} />
  }

  const produtoComprado = (slug: ProdutoSlug) =>
    MODULOS_PLATAFORMA.includes(slug)
    || (PRODUTOS_CONTRATADOS as readonly string[]).includes(slug)

  const produtoConcluido = (slug: ProdutoSlug) => {
    const trilhas = TRILHAS_POR_PRODUTO[slug as keyof typeof TRILHAS_POR_PRODUTO]
    return trilhas ? calcularProgressoProduto(slug as keyof typeof TRILHAS_POR_PRODUTO, aulasConcluidas).pct >= 100 : false
  }

  const iconesStatusNavAcademy = (slug: ProdutoSlug) => {
    const comprado = produtoComprado(slug)
    const concluido = produtoConcluido(slug)
    const verdeStatus = '#34d399'
    const iconCompradoOn = { color: verdeStatus, opacity: 0.42 }
    const iconConcluidoOn = { color: verdeStatus }
    const iconOff = { color: '#64748b', opacity: 0.3 }
    return (
      <span className="uni-nav-status-icons">
        <TooltipGlobal
          titulo={t(comprado ? 'university.nav_status.comprado_titulo' : 'university.nav_status.nao_comprado_titulo')}
          descricao={t(comprado ? 'university.nav_status.comprado_desc' : 'university.nav_status.nao_comprado_desc')}
        >
          <span className="uni-nav-status-icons__icone" aria-hidden>
            <SealCheck
              size={14}
              weight={comprado ? 'fill' : 'regular'}
              style={comprado ? iconCompradoOn : iconOff}
            />
          </span>
        </TooltipGlobal>
        <TooltipGlobal
          titulo={t(concluido ? 'university.nav_status.concluido_titulo' : 'university.nav_status.nao_concluido_titulo')}
          descricao={t(concluido ? 'university.nav_status.concluido_desc' : 'university.nav_status.nao_concluido_desc')}
        >
          <span className="uni-nav-status-icons__icone" aria-hidden>
            <CheckCircle
              size={14}
              weight={concluido ? 'fill' : 'regular'}
              style={concluido ? iconConcluidoOn : iconOff}
            />
          </span>
        </TooltipGlobal>
      </span>
    )
  }

  const badgeEmBreve = { badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const }
  const badgeAdminOnboarding = {
    badge: t('university.badge.restrito'),
    badgeSecundario: t('university.badge.em_breve'),
    badgeVariant: 'muted' as const,
  }

  const navItems = [
    {
      to: '/university-gravity/academy',
      label: t('university.nav.academy'),
      icon: <Books weight="duotone" size={18} />,
      ...badgeEmBreve,
      children: [
        { to: '/university-gravity/academy',              label: t('university.nav.visao_geral'),    icon: <SquaresFour weight="duotone" size={16} /> },
        { label: t('university.nav.modulos_plataforma'), sectionDivider: true, icon: <></> },
        { to: '/university-gravity/academy/bem-vindo',    label: t('university.produto.bem_vindo'),    icon: produtoIconAcademy('bem-vindo'),    trailing: iconesStatusNavAcademy('bem-vindo') },
        { to: '/university-gravity/academy/login',        label: t('university.produto.login'),        icon: produtoIconAcademy('login'),        trailing: iconesStatusNavAcademy('login'),        ...badgeEmBreve },
        { to: '/university-gravity/academy/admin',        label: t('university.produto.admin'),        icon: produtoIconAcademy('admin'),        trailing: iconesStatusNavAcademy('admin'),        ...badgeAdminOnboarding },
        { to: '/university-gravity/academy/configurador', label: t('university.produto.configurador'), icon: produtoIconAcademy('configurador'), trailing: iconesStatusNavAcademy('configurador'), ...badgeEmBreve },
        { to: '/university-gravity/academy/gabi',         label: t('university.produto.gabi'),         icon: produtoIconAcademy('gabi'),         trailing: iconesStatusNavAcademy('gabi') },
        { to: '/university-gravity/academy/hub',          label: t('university.produto.hub'),          icon: produtoIconAcademy('hub'),          trailing: iconesStatusNavAcademy('hub'),          ...badgeEmBreve },
        { to: '/university-gravity/academy/store',        label: t('university.produto.store'),        icon: produtoIconAcademy('store'),        trailing: iconesStatusNavAcademy('store'),        ...badgeEmBreve },
        { label: t('university.nav.produtos_gravity'), sectionDivider: true, icon: <></> },
        { to: '/university-gravity/academy/pedido',       label: t('university.produto.pedido'),       icon: produtoIconAcademy('pedido'),       trailing: iconesStatusNavAcademy('pedido'),       ...badgeEmBreve },
        { to: '/university-gravity/academy/smart-read',   label: t('university.produto.smart_read'),   icon: produtoIconAcademy('smart-read'),   trailing: iconesStatusNavAcademy('smart-read'),   ...badgeEmBreve },
        { to: '/university-gravity/academy/bid-frete',    label: t('university.produto.bid_frete'),    icon: produtoIconAcademy('bid-frete'),    trailing: iconesStatusNavAcademy('bid-frete'),    ...badgeEmBreve },
        { to: '/university-gravity/academy/bid-cambio',   label: t('university.produto.bid_cambio'),   icon: produtoIconAcademy('bid-cambio'),   trailing: iconesStatusNavAcademy('bid-cambio'),   ...badgeEmBreve },
        { to: '/university-gravity/academy/processo',     label: t('university.produto.processo'),     icon: produtoIconAcademy('processo'),     trailing: iconesStatusNavAcademy('processo'),     ...badgeEmBreve },
      ],
    },
    {
      to: '/university-gravity/docs',
      label: t('university.nav.docs'),
      icon: <FileText weight="duotone" size={18} />,
      children: [
        { to: '/university-gravity/docs/login',        label: t('university.produto.login'),        icon: produtoIconManual('login') },
        { to: '/university-gravity/docs/navegacao',    label: t('university.produto.navegacao'),    icon: produtoIconManual('navegacao') },
        { to: '/university-gravity/docs/admin',        label: t('university.produto.admin'),        icon: produtoIconManual('admin'),        ...badgeAdminOnboarding },
        {
          to: '/university-gravity/docs/configurador',
          label: t('university.produto.configurador'),
          icon: produtoIconManual('configurador'),
          children: CONFIGURADOR_MANUAL_ITENS.map(item => {
            const badgeEmBreveCapitulo: Partial<Record<typeof item.pathSeg, typeof badgeEmBreve>> = {
            }
            return {
              to: `/university-gravity/docs/configurador/${item.pathSeg}`,
              label: item.label,
              icon: iconeConfiguradorManual(item.pathSeg, 16),
              ...(badgeEmBreveCapitulo[item.pathSeg] ?? {}),
            }
          }),
        },
        { to: '/university-gravity/docs/gabi',         label: t('university.produto.gabi'),         icon: produtoIconManual('gabi'),         ...badgeEmBreve },
        { to: '/university-gravity/docs/hub',          label: t('university.produto.hub'),          icon: produtoIconManual('hub') },
        { to: '/university-gravity/docs/store',        label: t('university.produto.store'),        icon: produtoIconManual('store') },
        {
          to: '/university-gravity/docs/smart-read',
          label: t('university.nav.produtos_gravity'),
          icon: <PuzzlePiece weight="duotone" size={16} />,
          children: [
            { to: '/university-gravity/docs/pedido',     label: t('university.produto.pedido'),     icon: produtoIconManual('pedido') },
            { to: '/university-gravity/docs/smart-read', label: t('university.produto.smart_read'), icon: produtoIconManual('smart-read') },
            { to: '/university-gravity/docs/bid-frete',  label: t('university.produto.bid_frete'), icon: produtoIconManual('bid-frete') },
            { to: '/university-gravity/docs/bid-cambio', label: t('university.produto.bid_cambio'), icon: produtoIconManual('bid-cambio'), ...badgeEmBreve },
          ],
        },
        { to: '/university-gravity/docs/processo',     label: t('university.produto.processo'),     icon: produtoIconManual('processo') },
      ],
    },
    { to: '/university-gravity/builders',      label: t('university.nav.builders'),      icon: <PuzzlePiece weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
    { to: '/university-gravity/minha-jornada', label: t('university.nav.minha_jornada'), icon: <Path weight="duotone" size={18} />, badge: t('university.badge.em_breve'), badgeVariant: 'muted' as const },
  ]

  const tituloSecao = secao === 'docs'
    ? (configuradorManualItem
      ? configuradorManualItem.label
      : docsProdutoSlug === 'navegacao'
        ? t('university.manual.titulo_navegacao')
      : docsProdutoSlug
        ? t('university.manual.titulo_produto', {
          produto: t(`university.produto.${docsProdutoSlug.replaceAll('-', '_')}`),
        })
        : t('university.nav.docs'))
    : exibirDashboardGeral
    ? t('university.dashboard.titulo')
    : produtoSlug
    ? t(`university.produto.${produtoSlug.replaceAll('-', '_')}`)
    : secao === 'jornada' ? t('university.nav.minha_jornada')
    : secao === 'builders' ? t('university.nav.builders')
    : t('university.nav.academy')

  return (
    <div className={`ws-shell${secao === 'academy' && faseAulaSlug ? ' uni-academy-player' : ''}`}>
      <MenuLateralGlobal
        tenantName={nomeOrganizacao}
        tenantPlan={isGravityAdmin ? 'Super Admin' : (currentUser?.nomeWorkspacePreferido ?? nomeOrganizacao)}
        navItems={navItems}
        moduleName={t('university.modulo_nome')}
        moduleColor={UNI_COR}
        defaultCollapsed={false}
        workspaces={isGravityAdmin ? orgWorkspaceItems : undefined}
        onSwitchWorkspace={isGravityAdmin ? handleTrocarOrganizacao : undefined}
        dropdownSearchPlaceholder={isGravityAdmin ? t('university.busca.organizacao') : undefined}
      />

      <div className="ws-main">
        <div className="ws-global-actions">
          <HubBotao onClick={() => navigate('/hub?select=1')} />

          <CampoLocalizarExpandidoGlobal
            onBuscarNavigate={(term) => {
              const alvo = navItems.find(i => i.label.toLowerCase().includes(term.toLowerCase()))
              if (alvo) navigate(alvo.to ?? '/university-gravity/academy')
            }}
          />

          <button
            className="ws-global-btn"
            type="button"
            title={t('university.modulo_nome', 'Gravity University')}
            aria-label={t('university.modulo_nome', 'Gravity University')}
            onClick={() => navigate('/university-gravity')}
          >
            <GraduationCap size={20} weight="duotone" />
          </button>

          <TooltipGlobal
            titulo={t('university.dica.titulo')}
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: UNI_COR, flexShrink: 0 }} />
                  <span>{t('university.dica.habilitadas')}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                  <span>{t('university.dica.desabilitadas')}</span>
                </span>
              </span>
            }
          >
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          <Notificacoes />

          <LocalizadorGlobal
            workspaceName={nomeOrganizacao}
            currentProductId="configurador"
            currentProductLabel={t('university.modulo_nome')}
            currentProductColor={UNI_COR}
            currentPageLabel={tituloSecao}
            history={locHistory}
            nodes={ecoNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub?select=1')
              else if (node.type === 'configurador') navigate('/configurador/workspaces')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
            iconOnly
          />

          <SeletorIdiomaGlobal />

          <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={mapRole(dbRole)}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            compact
          />
        </div>

        {/* ══ Player de aula (rota /academy/{produto}/{fase}) ══ */}
        {secao === 'academy' && faseAulaSlug && produtoSlug && (() => {
          const aula = getAulaDemo(produtoSlug, faseAulaSlug)
          const todasAulas = getAulasCapituloDemo(produtoSlug, faseAulaSlug)
          if (!aula) return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ws-muted,#94a3b8)' }}>
              Aula não encontrada.
            </div>
          )
          return (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PlayerAula
                produtoSlug={produtoSlug}
                faseSlug={faseAulaSlug}
                aula={aula}
                todasAulas={todasAulas}
                concluidas={aulasConcluidas}
                onMarcarConcluida={marcarConcluida}
              />
            </div>
          )
        })()}

        {/* ══ Resto das views (overview, jornada, docs, builders) ══ */}
        {!(secao === 'academy' && faseAulaSlug) && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem 3rem' }} data-manual-scroll-root>

          {secao === 'docs' && origemAcademy && (
            <div className="uni-docs-voltar-academy">
              <UniBotaoVoltarPadrao
                label={t('university.aula.voltar_onboarding')}
                onClick={() => navigate(origemAcademy)}
              />
            </div>
          )}

          {/* ── Cabeçalho (padrão MenuTopoGlobal: Insights) ── */}
          <div style={UNI_ESTILO_PAGE_HEADER}>
            <span style={{
              ...UNI_ESTILO_PAGE_ICON,
              color: secao === 'docs' && docsProdutoSlug === 'login' ? '#60a5fa' : UNI_COR,
            }}>
              {secao === 'docs' && docsProdutoSlug === 'login'
                ? <SignIn weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'navegacao'
                  ? <Compass weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'hub'
                  ? <SquaresFour weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'store'
                  ? <ShoppingBag weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'smart-read'
                  ? <MagnifyingGlass weight="duotone" size={22} />
                : secao === 'docs' && docsProdutoSlug === 'api-cockpit'
                  ? iconeConfiguradorManual('api-cockpit', 22)
                : secao === 'docs' && docsConfiguradorPagina
                  ? iconeConfiguradorManual(docsConfiguradorPagina, 22)
                  : <GraduationCap weight="duotone" size={22} />}
            </span>
            <div style={UNI_ESTILO_PAGE_TITLES}>
              <h1 style={UNI_ESTILO_PAGE_TITLE}>{tituloSecao}</h1>
              {exibirDashboardGeral && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{t('university.dashboard.subtitulo')}</span>
              )}
              {secao === 'academy' && !produtoSlug && !exibirDashboardGeral && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{t('university.academy.subtitulo')}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'login' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_LOGIN_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'navegacao' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_NAVEGACAO_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'hub' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_HUB_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'store' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_STORE_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'smart-read' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_SMART_READ_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'pedido' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_PEDIDO_SUBTITULO}</span>
              )}
              {secao === 'docs' && docsProdutoSlug === 'api-cockpit' && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{DOC_API_COCKPIT_SUBTITULO}</span>
              )}
              {secao === 'docs' && configuradorManualItem && (
                <span style={UNI_ESTILO_PAGE_SUBTITULO}>{configuradorManualItem.subtitulo}</span>
              )}
            </div>
          </div>

          {/* ══ BARRA 3: Progresso nos produtos contratados (módulo específico) ══ */}
          {secao === 'academy' && !exibirDashboardGeral && (
            <div style={{
              background: 'var(--bg-base,#1e293b)',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 14, padding: '14px 18px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>
                  {t('university.progresso.produtos_contratados')}
                </span>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: pctGeral >= 100 ? '#818cf8' : 'var(--ws-text,#f1f5f9)' }}>
                  {concluidos} / {progressoContratados.length} {t('university.progresso.concluidos')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <BarraProgresso pct={pctGeral} altura={8} />
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ws-muted,#94a3b8)', whiteSpace: 'nowrap' }}>{pctGeral}%</span>
              </div>
              {/* Pills de produto */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {progressoContratados.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => navigate(`/university-gravity/academy/${p.slug}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '.72rem', fontWeight: 700,
                      background: p.prog >= 100 ? 'rgba(129,140,248,.15)' : p.prog > 0 ? 'rgba(129,140,248,.15)' : 'rgba(148,163,184,.08)',
                      color: p.prog >= 100 ? '#818cf8' : p.prog > 0 ? UNI_COR : 'var(--ws-muted,#94a3b8)',
                    }}
                  >
                    <span>{p.emoji}</span>
                    <span>{t(`university.produto.${p.slug.replaceAll('-', '_')}`)}</span>
                    {p.prog >= 100 && <CheckFat weight="fill" size={11} />}
                    {p.prog > 0 && p.prog < 100 && <span style={{ color: 'var(--ws-muted,#94a3b8)' }}>{p.prog}%</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ VIEW: dashboard geral de onboarding (entrada Login / Academy) ══ */}
          {secao === 'academy' && exibirDashboardGeral && (
            <PainelDashboardOnboarding
              aulasConcluidas={aulasConcluidas}
              onAbrirModulo={(slug) => navigate(`/university-gravity/academy/${slug}`)}
            />
          )}

          {/* ══ VIEW: produto específico — Jornada do Módulo (gamificada) ══ */}
          {secao === 'academy' && trilhasAtivas && trilhaAtiva && produtoSlug && (
            trilhasAtivas.length > 1 ? (
              <JornadaMultiCapitulos
                trilhas={trilhasAtivas}
                aulasConcluidas={aulasConcluidas}
                capituloAtivo={capituloAtivo}
                onSelecionarCapitulo={setCapituloAtivo}
                onAbrirFase={(slug) => navigate(`/university-gravity/academy/${produtoSlug}/${slug}`)}
              />
            ) : (
                <JornadaModulo
                trilha={trilhaAtiva}
                  aulasConcluidas={aulasConcluidas}
                  onAbrirFase={(slug) => navigate(`/university-gravity/academy/${produtoSlug}/${slug}`)}
                />
            )
          )}

          {/* ══ VIEW: visão geral agrupada ══ */}
          {secao === 'academy' && !trilhasAtivas && !exibirDashboardGeral && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {GRUPOS_TRILHAS.map(grupo => (
                <div key={grupo.tituloKey}>
                  <h2 style={{ fontSize: '.74rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ws-muted,#94a3b8)', marginBottom: 12 }}>
                    {t(grupo.tituloKey)}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {grupo.trilhas.map(tr => (
                      <div key={tr.nome} style={{
                        background: 'var(--bg-base,#1e293b)', border: '1px solid rgba(148,163,184,.12)',
                        borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 11,
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', background: `${tr.tag}22`, fontSize: 20 }}>
                          {tr.emoji}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700 }}>{tr.nome}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--ws-muted,#94a3b8)' }}>
                          <Clock size={12} />
                          {t('university.trilha.modulos', { count: tr.modulos })} · {tr.duracao}
                        </div>
                        {tr.prog > 0 && <BarraProgresso pct={tr.prog} />}
                        <button style={{
                          border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.82rem', padding: '8px 14px',
                          borderRadius: 9999,
                          background: tr.prog >= 100 ? 'rgba(129,140,248,.15)' : UNI_COR,
                          color: tr.prog >= 100 ? '#818cf8' : '#0b1220',
                        }}>
                          {tr.prog >= 100 ? t('university.acao.concluida') : tr.prog > 0 ? t('university.acao.continuar') : t('university.acao.iniciar_jornada')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {secao === 'jornada' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { k: 'university.jornada.pontos', v: '1.240' },
                { k: 'university.jornada.concluidas', v: '2' },
                { k: 'university.jornada.em_andamento', v: '1' },
                { k: 'university.jornada.certificados', v: '2' },
              ].map(kpi => (
                <div key={kpi.k} style={{ background: 'var(--bg-surface,#334155)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ws-muted,#94a3b8)' }}>{t(kpi.k)}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6 }}>{kpi.v}</div>
                </div>
              ))}
            </div>
          )}

          {secao === 'docs' && !docsProdutoSlug && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>📚</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>Selecione um produto no menu lateral</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>{t('university.docs.descricao')}</p>
            </div>
          )}

          {secao === 'docs' && docsProdutoSlug === 'navegacao' && (
            <DocNavegacaoManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'login' && (
            <DocLoginManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'hub' && (
            <DocHubManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'store' && (
            <DocStoreManual />
          )}

          {secao === 'docs' && docsConfiguradorPagina && (
            <DocConfiguradorManual paginaSlug={docsConfiguradorPagina} />
          )}

          {secao === 'docs' && docsProdutoSlug === 'smart-read' && (
            <DocSmartReadManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'pedido' && (
            <DocPedidoManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'bid-frete' && (
            <DocBidFreteManual />
          )}

          {secao === 'docs' && docsProdutoSlug === 'api-cockpit' && (
            <DocApiCockpitManual />
          )}

          {secao === 'docs' && docsProdutoSlug && docsProdutoSlug !== 'login' && docsProdutoSlug !== 'navegacao' && docsProdutoSlug !== 'hub' && docsProdutoSlug !== 'store' && docsProdutoSlug !== 'smart-read' && docsProdutoSlug !== 'pedido' && docsProdutoSlug !== 'bid-frete' && docsProdutoSlug !== 'api-cockpit' && docsProdutoSlug !== 'configurador' && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>📄</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>Manual em construção</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>O manual de <strong>{docsProdutoSlug}</strong> estará disponível em breve.</p>
            </div>
          )}

          {secao === 'builders' && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', color: 'var(--ws-muted,#94a3b8)',
              border: '1px dashed rgba(148,163,184,.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, opacity: .2 }}>🧩</div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>{t('university.vazio.em_breve', { secao: tituloSecao })}</p>
              <p style={{ fontSize: '.82rem', marginTop: 4 }}>{t('university.builders.descricao')}</p>
            </div>
          )}

        </div>
        )}
      </div>

      <ToastContainer />
    </div>
  )
}

// TODO(preview-temp, 2026-07-11): export só para conferência visual manual — remover após validar.
export { JornadaModulo, TRILHAS_POR_PRODUTO as __TRILHAS_PREVIEW_TEMP }

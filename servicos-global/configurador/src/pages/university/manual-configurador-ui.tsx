import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Gear, Crown, Buildings, Users, Handshake, CreditCard, Receipt, Pulse,
  CurrencyCircleDollar, ClockCounterClockwise, ArrowsOut, CaretDown,
  UserPlus, IdentificationCard, ArrowRight, ShieldCheck, User, Key, Check,
  Package, Truck, ArrowDown, ArrowUp, EnvelopeSimple, Desktop,
  Eye, EyeSlash, PlusCircle, ArrowsOutLineVertical, PencilSimple, UploadSimple, ArrowsLeftRight, Sparkle,
  List, SquaresFour, ChartBar,
  ShieldStar, UserGear, Boat, Airplane, TruckTrailer, Warehouse, Bank, Factory,
  Circle, CheckCircle, CircleHalf, Prohibit,
  type Icon,
} from '@phosphor-icons/react'
import {
  HISTORICO_CATALOGO_SECOES,
  type HistoricoCatalogoSecao,
} from './manual-historico-catalogo'
import {
  type ConfiguradorManualSlug,
  type DocTooltipKpi,
  type DocColunaTabela,
  type DocFiguraAposParagrafo,
  type DocFluxo,
  type DocGaleriaTela,
  type DocGaleriaComparacaoTela,
  type DocCalloutManual,
  type DocOrigemDados,
  type DocPassoVisual,
  type DocSecao,
  type DocTopicoImagemLateral,
  type DocWizardEtapa,
  metadadosConfiguradorPagina,
  montarItensSumarioManual,
  montarEntradasSumarioManual,
  type DocItemSumarioManual,
  type DocEntradaSumarioManual,
  SCREENSHOT_HUB_ACESSO_CONFIGURADOR,
  SCREENSHOT_USUARIOS_PERMISSAO_COTAR_FRETE,
  SCREENSHOT_USUARIOS_PERMISSAO_MODAL,
  LINK_MANUAL_PERMISSOES,
  secaoConfiguradorPorSlug,
} from './manual-configurador-conteudo'
import { MANUAL_ESPACO_PARAGRAFO_PX, MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX, MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX, MANUAL_RAIO_CHIP, MANUAL_ALINHAMENTO_CORPO, MANUAL_CORPO_TIPOGRAFIA, MANUAL_GRID_TEXTO_IMAGEM, manualMargemParagrafo, manualMargemParagrafoAntesCallout, manualMargemCalloutAposParagrafo, MANUAL_ESPACO_ENTRE_PASSOS_PX } from './manual-tipografia'
import {
  type ManualEstadoLeitura,
  idSecaoManual,
  idPassoManual,
  idsPassosFluxo,
  extrairSlugManualDaRota,
  carregarLidosManual,
  salvarLidosManual,
  calcularEstadoLeitura,
  calcularEstadoCapitulo,
  montarIdsRastreaveisLeituraManual,
  contarLidosManual,
  percentualLeituraManual,
} from './manual-leitura-progresso'
import { ManualInfograficoHubTelas } from './manual-hub-infografico'
import { ManualInfograficoPedidoVisaoGeral } from './manual-pedido-infografico-visao-geral'
import { ManualInfograficoPedidoInsights } from './manual-pedido-infografico-insights'
import { ManualInfograficoPedidoListaCustomizacao } from './manual-pedido-infografico-lista-customizacao'
import { ManualInfograficoPedidoCatalogoColunasLista } from './manual-pedido-infografico-catalogo-colunas-lista'
import { ManualPedidoTabelaCatalogoColunasLista } from './manual-pedido-accordion-colunas-lista'
import { ManualInfograficoPedidoListaAlertas } from './manual-pedido-infografico-lista-alertas'
import { ManualInfograficoPedidoListaImportarFormas } from './manual-pedido-infografico-lista-importar-formas'
import { ManualInfograficoPedidoListaTransferirFluxo } from './manual-pedido-infografico-lista-transferir-fluxo'
import { ManualInfograficoPedidoListaImportarMapeamentoColunas } from './manual-pedido-infografico-mapeamento-importar-colunas'
import { ManualPedidoTabelaAlertasLista } from './manual-pedido-tabela-alertas-lista'
import { ManualPedidoFormatosExportacaoLista } from './manual-pedido-formatos-exportacao-lista'
import { ManualPedidoFormatosImportacaoLista } from './manual-pedido-formatos-importacao-lista'
import { ManualPedidoCaminhosImportacaoPlanilha } from './manual-pedido-caminhos-importacao-planilha'
import { ManualInfograficoSmartDocsDocumentos } from './manual-smart-read-infografico-documentos'
import { ManualInfograficoSmartDocsInsights } from './manual-smart-read-infografico-insights'
import { ManualInfograficoSmartDocsListaCustomizacao } from './manual-smart-read-infografico-lista-customizacao'
import { ManualInfograficoSmartDocsListaPaineis } from './manual-smart-read-infografico-lista-paineis'
import { ManualInfograficoListaLeituraSmartReadIntegracaoApiCockpit } from './manual-lista-leitura-smart-read-infografico-integracao-api-cockpit'
import { ManualSmartReadTabelaCatalogoColunasLista } from './manual-smart-read-tabela-colunas-lista'
import { ManualInfograficoMenuLateral } from './manual-navegacao-infografico'
import { ManualInfograficoIconesMenuSuperior } from './manual-navegacao-icones-menu'
import { ManualInfograficoMapaNavegacaoGravity } from './manual-navegacao-mapa-gravity'
import { DOC_API_COCKPIT_SECAO } from './manual-api-cockpit-conteudo'

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
  fontWeight: 700, fontSize: '.92rem', color: MANUAL_TITULO_COR, margin: `0 0 ${MANUAL_ESPACO_PARAGRAFO_PX}px`,
}

const MANUAL_ESTILO_CORPO: React.CSSProperties = {
  ...MANUAL_CORPO_TIPOGRAFIA,
  color: MANUAL_CORPO_70,
}

const MANUAL_LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

type ManualPilarCustomizacaoId = '01' | '02' | '03' | '04'

const MANUAL_PILARES_CUSTOMIZACAO: Record<
  ManualPilarCustomizacaoId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: EyeSlash, cor: '#f87171', borda: 'rgba(248,113,113,.32)', fundo: 'rgba(239,68,68,.08)' },
  '02': { icone: Eye, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '03': { icone: ArrowsOutLineVertical, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '04': { icone: PlusCircle, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
}

function ManualPilaresCustomizacaoChips({ pilares }: { pilares: ManualPilarCustomizacaoId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Passos ${pilares.join(' e ')} do infográfico de customização`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_CUSTOMIZACAO[num]
        const Icone = pilar.icone
        return (
          <div
            key={num}
            title={`Passo ${num}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
              {num}
            </span>
            <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

type ManualPilarImportarFormaId = '01' | '02' | '03' | '04'

const MANUAL_PILARES_IMPORTAR_FORMAS: Record<
  ManualPilarImportarFormaId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: UploadSimple, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '02': { icone: ArrowsLeftRight, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '03': { icone: Sparkle, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
  '04': { icone: PencilSimple, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(245,158,11,.1)' },
}

function ManualPilaresImportarFormasChips({ pilares }: { pilares: ManualPilarImportarFormaId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Passos ${pilares.join(' e ')} do infográfico de importação`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_IMPORTAR_FORMAS[num]
        const Icone = pilar.icone
        return (
          <div
            key={num}
            title={`Passo ${num}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
              {num}
            </span>
            <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

function ManualGaleriaCabecalhoPasso({
  legendaPasso,
  pilaresImportarFormas,
  pilaresCustomizacao,
}: {
  legendaPasso: string
  pilaresImportarFormas?: ManualPilarImportarFormaId[]
  pilaresCustomizacao?: ManualPilarCustomizacaoId[]
}) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 10,
    }}>
      {pilaresImportarFormas?.length ? (
        <ManualPilaresImportarFormasChips pilares={pilaresImportarFormas} />
      ) : pilaresCustomizacao?.length ? (
        <ManualPilaresCustomizacaoChips pilares={pilaresCustomizacao} />
      ) : null}
      <ManualGaleriaTelaLegendaStep legenda={legendaPasso} alinhamento="left" />
    </div>
  )
}

const LINK_DOC_WORKSPACES = '/university-gravity/docs/configurador/workspaces'

const ManualScrollSecaoContext = createContext<((n: number) => void) | null>(null)

type ManualSubtopicosContextValue = {
  abertosPorPrefix: Record<string, number[]>
  toggle: (prefix: string, num: number) => void
  abrir: (prefix: string, num: number) => void
}

const ManualSubtopicosContext = createContext<ManualSubtopicosContextValue | null>(null)

type ManualLeituraContextValue = {
  ativo: boolean
  fluxoPorSecao: Map<number, DocFluxo>
  isLido: (id: string) => boolean
  estadoCapitulo: (secaoNum: number) => ManualEstadoLeitura
  toggleCapitulo: (secaoNum: number) => void
  togglePasso: (id: string) => void
  totalRastreaveis: number
  totalLidos: number
  percentual: number
}

const ManualLeituraContext = createContext<ManualLeituraContextValue | null>(null)

function ManualBotaoMarcarLido({
  estado,
  onToggle,
  rotulo,
}: {
  estado: ManualEstadoLeitura
  onToggle: () => void
  rotulo: string
}) {
  const titulo = estado === 'lido' ? `Desmarcar ${rotulo}` : `Marcar ${rotulo} como lido`
  const Icone = estado === 'lido' ? CheckCircle : estado === 'parcial' ? CircleHalf : Circle
  const cor = estado === 'lido' ? '#22c55e' : estado === 'parcial' ? '#818cf8' : '#64748b'
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      title={titulo}
      aria-label={titulo}
      aria-pressed={estado === 'lido'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Icone size={14} weight={estado === 'nao_lido' ? 'regular' : 'fill'} color={cor} />
    </button>
  )
}

function parseElementoPassoManual(elementoId: string): { prefix: string; num: number } | null {
  const m = /^manual-passo-(.+)-(\d+)$/.exec(elementoId)
  if (!m) return null
  return { prefix: m[1], num: Number(m[2]) }
}

function numeroSecaoDeHashManual(hash: string | undefined): number | null {
  if (!hash) return null
  const m = /^#?doc-sec-(\d+)$/.exec(hash)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

function ManualLinkInterno({ href, rotulo }: { href: string; rotulo: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollToSecao = useContext(ManualScrollSecaoContext)
  const hashIdx = href.indexOf('#')
  const pathname = (hashIdx >= 0 ? href.slice(0, hashIdx) : href).replace(/\/$/, '')
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : ''
  const secaoNum = numeroSecaoDeHashManual(hash || undefined)
  const pathnameAtual = location.pathname.replace(/\/$/, '')
  const mesmaPagina = pathnameAtual === pathname

  const estiloBotaoLink: React.CSSProperties = {
    ...MANUAL_LINK_STYLE,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit',
  }

  if (secaoNum != null && scrollToSecao && mesmaPagina) {
    return (
      <button
        type="button"
        onClick={() => scrollToSecao(secaoNum)}
        style={estiloBotaoLink}
      >
        {rotulo}
      </button>
    )
  }

  if (secaoNum != null) {
    return (
      <button
        type="button"
        onClick={() => navigate({ pathname, hash })}
        style={estiloBotaoLink}
      >
        {rotulo}
      </button>
    )
  }

  return (
    <Link to={href} style={MANUAL_LINK_STYLE}>
      {rotulo}
    </Link>
  )
}

function textoComLinkWorkspaces(texto: string): string {
  return texto.replace(/\bworkspaces?\b/gi, (m) => `{{link:${LINK_DOC_WORKSPACES}|${m}}}`)
}

function gridColunasGaleriaTelas(quantidade: number): string {
  if (quantidade <= 1) return '1fr'
  if (quantidade === 2) return 'repeat(2, minmax(0, 1fr))'
  if (quantidade >= 4) return `repeat(${quantidade}, minmax(0, 1fr))`
  return 'repeat(3, minmax(0, 1fr))'
}

const MANUAL_ICONE_INLINE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  verticalAlign: 'text-bottom',
  margin: '0 3px',
  color: MANUAL_TIPO.secundario,
}

const CALLOUT_STYLE: Record<string, { bg: string; borda: string; label: string; cor: string }> = {
  destaque: { bg: 'rgba(251,191,36,.1)', borda: 'rgba(251,191,36,.38)', label: 'Bom saber', cor: '#fbbf24' },
  aviso: { bg: 'rgba(239,68,68,.08)', borda: 'rgba(248,113,113,.35)', label: 'Aviso', cor: '#f87171' },
  exemplo: { bg: 'rgba(148,163,184,.08)', borda: 'rgba(148,163,184,.25)', label: '💡 Exemplo', cor: '#94a3b8' },
  dica: { bg: 'rgba(99,102,241,.07)', borda: 'rgba(99,102,241,.3)', label: '💡 Dica', cor: '#818cf8' },
  lembrete: { bg: 'rgba(251,191,36,.08)', borda: 'rgba(251,191,36,.32)', label: 'Lembrete', cor: '#fbbf24' },
  seguranca: { bg: 'rgba(52,211,153,.08)', borda: 'rgba(52,211,153,.35)', label: 'Segurança', cor: '#34d399' },
}

const MANUAL_ESTILO_CALLOUT_CORPO: React.CSSProperties = {
  fontSize: '.82rem', color: MANUAL_CORPO_70, lineHeight: 1.65,
  textAlign: MANUAL_ALINHAMENTO_CORPO, textJustify: 'inter-word',
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
      <strong key={`b-${ki++}`} style={{ color: MANUAL_TITULO_COR, fontWeight: 700 }}>
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
  const re = /(https:\/\/[^\s]+|\{\{link:([^|]+)\|([^}]+)\}\})/g
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
        <ManualLinkInterno key={match.index} href={match[2]} rotulo={match[3]} />,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) {
    partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo)} />)
  }
  return <>{partes}</>
}

function splitLabelDescListaManual(item: string): { label: string; desc: string } {
  const cleaned = item.replace(/^[-–]\s*/, '').trim()
  const re = /^((?:[^{]|(?:\{\{link:[^}]+\}\}))+):\s*(.*)$/s
  const match = cleaned.match(re)
  if (!match) return { label: cleaned, desc: '' }
  return { label: match[1].trim(), desc: match[2].trim() }
}

function ManualIndicadorCursorVisualizacao() {
  return (
    <div
      role="img"
      aria-label="Cursor bloqueado — somente visualização"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 14,
        marginBottom: 4,
        padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid rgba(248,113,113,.32)',
        background: 'linear-gradient(135deg, rgba(239,68,68,.12) 0%, rgba(148,163,184,.04) 100%)',
      }}
    >
      <Prohibit size={32} weight="fill" color="#ef4444" aria-hidden />
      <span style={{ fontSize: '.78rem', lineHeight: 1.45, color: MANUAL_CORPO_70 }}>
        Cursor de <strong style={{ color: '#fca5a5', fontWeight: 700 }}>bloqueio</strong> — a Lista é{' '}
        <strong style={{ color: MANUAL_TITULO_COR, fontWeight: 700 }}>somente visualização</strong>
      </span>
    </div>
  )
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

const ESTILO_BOTAO_AMPLIAR: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 11px', borderRadius: 9,
  background: 'rgba(99,102,241,.88)', border: '1px solid rgba(165,180,252,.45)',
  color: '#f8fafc', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.03em',
  backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,.28)',
  cursor: 'pointer',
}

/** Bump ao adicionar PNGs novos — evita cache de HTML (SPA fallback) quando o arquivo ainda não existia. */
const MANUAL_SCREENSHOT_CACHE_KEY = '146'

function urlScreenshotManual(src: string): string {
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}ssv=${MANUAL_SCREENSHOT_CACHE_KEY}`
}

function ManualFiguraScreenshot({
  src,
  alt,
  larguraMaxima,
  larguraTotal,
  ampliarInferiorDireito,
}: {
  src: string
  alt: string
  larguraMaxima?: number
  larguraTotal?: boolean
  /** Só para casos pontuais — botão Ampliar no canto inferior direito da figura. */
  ampliarInferiorDireito?: boolean
}) {
  const [telaCheia, setTelaCheia] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const srcEfetivo = urlScreenshotManual(src)
  const ampliarAbaixo = src === SCREENSHOT_HUB_ACESSO_CONFIGURADOR
  const compacta = larguraMaxima != null
  const larguraCheia = ampliarAbaixo || compacta || larguraTotal

  useEffect(() => {
    setErroCarregamento(false)
  }, [srcEfetivo])

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
      <div style={
        ampliarAbaixo
          ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }
          : compacta || larguraTotal
            ? { maxWidth: larguraMaxima, width: '100%' }
            : undefined
      }>
        <figure
          role={erroCarregamento ? undefined : 'button'}
          tabIndex={erroCarregamento ? undefined : 0}
          aria-label={erroCarregamento ? undefined : `${alt}: abrir em tela cheia`}
          onClick={erroCarregamento ? undefined : abrirTelaCheia}
          onKeyDown={erroCarregamento ? undefined : (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              abrirTelaCheia()
            }
          }}
          style={{
            margin: 0, borderRadius: 14, overflow: 'hidden',
            cursor: erroCarregamento ? 'default' : 'zoom-in',
            border: '1px solid rgba(148,163,184,.15)', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
            background: 'rgba(8,12,24,.55)', position: 'relative',
            width: larguraCheia ? '100%' : undefined,
            maxWidth: larguraMaxima,
          }}
        >
          {erroCarregamento ? (
            <div style={{
              padding: 48, textAlign: 'center', color: '#475569', fontSize: '.8rem',
              background: 'rgba(148,163,184,.04)',
            }}>
              📸 Salve o screenshot em
              <br />
              <code style={{ color: '#818cf8', fontSize: '.75rem' }}>{src}</code>
            </div>
          ) : (
            <img
              key={srcEfetivo}
              src={srcEfetivo}
              alt={alt}
              style={{ width: '100%', display: 'block', verticalAlign: 'top', objectFit: 'contain' }}
              onError={() => setErroCarregamento(true)}
            />
          )}
          {!ampliarAbaixo && !erroCarregamento && (
            <span style={{
              position: 'absolute',
              ...(ampliarInferiorDireito ? { bottom: 10, right: 10 } : { top: 10, right: 10 }),
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
            aria-label={`${alt}: ampliar`}
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
            src={srcEfetivo}
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

function ManualTextoUx10AcimaFigura({ texto }: { texto: string }) {
  return (
    <div style={{
      marginBottom: 10,
      background: 'rgba(99,102,241,.06)',
      border: '1px solid rgba(99,102,241,.18)',
      borderRadius: 10,
      padding: '10px 12px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <p style={{ ...MANUAL_ESTILO_CORPO, margin: 0, fontSize: '.75rem', lineHeight: 1.5 }}>
        <ManualTextoRich texto={texto} />
      </p>
    </div>
  )
}

function ManualGaleriaTelaLegendaStep({
  legenda,
  alinhamento = 'center',
}: {
  legenda: string
  alinhamento?: 'center' | 'left'
}) {
  return (
    <p style={{
      fontSize: '14.5px', fontWeight: 700, color: '#818cf8',
      margin: 0, marginBottom: alinhamento === 'center' ? 6 : 0,
      textAlign: alinhamento, letterSpacing: '.04em',
    }}>{legenda}</p>
  )
}

function ManualGaleriaTelaLegendaFigura({ legenda }: { legenda: string }) {
  return (
    <p style={{
      fontSize: '.68rem', fontWeight: 600, color: '#94a3b8',
      marginBottom: 6, textAlign: 'center', letterSpacing: '.03em',
    }}>{legenda}</p>
  )
}

function ManualGaleriaTelaLegendaLinha({ texto }: { texto: string }) {
  return (
    <p style={{
      fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
      margin: '4px 0 0', textAlign: 'center', letterSpacing: '.04em', lineHeight: 1.55,
    }}>
      <ManualTextoRich texto={texto} />
    </p>
  )
}

function ManualGaleriaTelaParagrafoFigura({
  texto,
  entreLinhas = false,
}: {
  texto: string
  /** Texto entre linhas de prints — menos margem e sem altura mínima de coluna. */
  entreLinhas?: boolean
}) {
  return (
    <div style={{
      marginBottom: entreLinhas ? 4 : 6,
      textAlign: 'left',
      minHeight: entreLinhas ? undefined : '2.75rem',
    }}>
      <ManualParagrafo texto={texto} marginBottom={0} />
    </div>
  )
}

/** Print numerado (**08.** …) — chip indigo + legenda, distinto do bloco 💡 Dica. */
function ManualGaleriaChipNumeroPasso({ numero }: { numero: string }) {
  return (
    <div
      title={`Passo ${numero}`}
      style={{
        minWidth: 52,
        height: 38,
        padding: '0 7px',
        borderRadius: 8,
        border: '1px solid rgba(129,140,248,.32)',
        background: 'rgba(99,102,241,.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: '7px', fontWeight: 800, color: '#818cf8', letterSpacing: '.1em',
        lineHeight: 1, textTransform: 'uppercase',
      }}>
        Passo
      </span>
      <span style={{
        fontSize: '11px', fontWeight: 800, color: '#818cf8', letterSpacing: '.04em', lineHeight: 1,
      }}>
        {numero}
      </span>
    </div>
  )
}

function ManualGaleriaLegendaPrintPasso({
  texto,
  entreLinhas = false,
}: {
  texto: string
  entreLinhas?: boolean
}) {
  const match = texto.match(/^\*\*(\d{2})\.\*\*\s+([\s\S]+)$/)
  if (!match) {
    return <ManualGaleriaTelaParagrafoFigura texto={texto} entreLinhas={entreLinhas} />
  }
  const [, numero, legenda] = match
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      marginBottom: entreLinhas ? 4 : 6,
      minHeight: entreLinhas ? undefined : '2.75rem',
    }}>
      <ManualGaleriaChipNumeroPasso numero={numero} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <ManualParagrafo texto={legenda.trim()} marginBottom={0} />
      </div>
    </div>
  )
}

function ManualGaleriaRotuloLinhaDicas() {
  return (
    <p style={{
      ...MANUAL_ESTILO_PASSO_ROTULO,
      margin: '0 0 10px',
    }}>
      Dicas desta etapa
    </p>
  )
}

function ManualGaleriaTelaFigurasCompostas({
  linhas,
  legendaPrincipal,
}: {
  linhas: NonNullable<DocGaleriaTela['imagensCompostas']>
  legendaPrincipal: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {linhas.map((linha, indiceLinha) => {
        const centralizar = linha.centralizar ?? linha.figuras.length === 1
        const figurasLinha = centralizar && linha.figuras.length === 1 ? (
          <div
            key={`linha-${indiceLinha}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            {linha.figuras[0].paragrafoAntes ? (
              <ManualGaleriaTelaParagrafoFigura texto={linha.figuras[0].paragrafoAntes} />
            ) : linha.figuras[0].legenda ? (
              <ManualGaleriaTelaLegendaFigura legenda={linha.figuras[0].legenda} />
            ) : null}
            <ManualFiguraScreenshot
              src={linha.figuras[0].imagem}
              alt={linha.figuras[0].legenda ?? legendaPrincipal}
              larguraMaxima={linha.figuras[0].larguraMaxima ?? 720}
            />
          </div>
        ) : (
          <div
            key={`linha-${indiceLinha}`}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${linha.figuras.length}, minmax(0, 1fr))`,
              gap: 14,
              alignItems: 'start',
            }}
          >
            {linha.figuras.map((figura, indiceFigura) => {
              const alt = figura.legenda ?? `${legendaPrincipal} — figura ${indiceFigura + 1}`
              return (
                <div key={`fig-${indiceFigura}`}>
                  {figura.paragrafoAntes ? (
                    <ManualGaleriaTelaParagrafoFigura texto={figura.paragrafoAntes} />
                  ) : figura.legenda ? (
                    <ManualGaleriaTelaLegendaFigura legenda={figura.legenda} />
                  ) : null}
                  <ManualFiguraScreenshot src={figura.imagem} alt={alt} larguraTotal />
                </div>
              )
            })}
          </div>
        )

        return (
          <React.Fragment key={`bloco-${indiceLinha}`}>
            {figurasLinha}
            {linha.paragrafoApos ? (
              <ManualGaleriaTelaParagrafoFigura texto={linha.paragrafoApos} entreLinhas />
            ) : linha.legendaApos ? (
              <ManualGaleriaTelaLegendaLinha texto={linha.legendaApos} />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function ManualGaleriaTelaCelula({ tela }: { tela: DocGaleriaTela }) {
  const pilares = tela.pilaresCustomizacao

  const figuras = tela.imagensCompostas?.length
    ? (
      <ManualGaleriaTelaFigurasCompostas
        linhas={tela.imagensCompostas}
        legendaPrincipal={tela.legenda}
      />
    )
    : tela.imagem
      ? <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} />
      : null

  const restoAposParagrafo = (
    <>
      {tela.tooltipKpi ? (
        <div style={{ marginBottom: 12 }}>
          <ManualTooltipKpiCard tooltip={tela.tooltipKpi} />
        </div>
      ) : null}
      {!pilares?.length && tela.legendaAlinhamento !== 'left' ? (
        <ManualGaleriaTelaLegendaStep
          legenda={tela.legenda}
          alinhamento={tela.legendaAlinhamento ?? 'center'}
        />
      ) : null}
      {figuras}
      {tela.calloutDepois ? (
        <ManualCalloutBloco callout={tela.calloutDepois} marginTop={12} />
      ) : tela.paragrafoDepois ? (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          <ManualParagrafo texto={tela.paragrafoDepois} marginBottom={0} />
        </div>
      ) : null}
    </>
  )

  if (!pilares?.length) {
    const legendaEsquerda = tela.legendaAlinhamento === 'left' ? (
      <div style={{ marginBottom: 10 }}>
        <ManualGaleriaTelaLegendaStep legenda={tela.legenda} alinhamento="left" />
      </div>
    ) : null

    return (
      <div>
        {legendaEsquerda}
        {tela.paragrafoAntes ? (
          <div style={{ marginBottom: 10, textAlign: 'left' }}>
            <ManualParagrafo texto={tela.paragrafoAntes} marginBottom={0} />
          </div>
        ) : null}
        {restoAposParagrafo}
      </div>
    )
  }

  return (
    <div>
      <ManualGaleriaCabecalhoPasso
        legendaPasso={tela.legenda}
        pilaresCustomizacao={pilares}
      />
      {tela.paragrafoAntes ? (
        <div style={{ marginBottom: 10, textAlign: 'left' }}>
          <ManualParagrafo texto={tela.paragrafoAntes} marginBottom={0} />
        </div>
      ) : null}
      {restoAposParagrafo}
    </div>
  )
}

function ManualGaleriaTelaImagemCelula({ tela }: { tela: DocGaleriaTela }) {
  const figuras = tela.imagensCompostas?.length
    ? (
      <ManualGaleriaTelaFigurasCompostas
        linhas={tela.imagensCompostas}
        legendaPrincipal={tela.legenda}
      />
    )
    : tela.imagem
      ? <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} larguraTotal />
      : null

  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
        marginBottom: 8, textAlign: 'center', letterSpacing: '.04em',
        minHeight: '2.25rem',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}>{tela.legenda}</p>
      {figuras}
    </div>
  )
}

function ManualGaleriaTelasBloco({
  telas,
  fraseAposIndice,
}: {
  telas: DocGaleriaTela[]
  fraseAposIndice?: { indice: number; texto: string }
}) {
  if (telas.length === 0) return null

  const gradeTelas = (items: DocGaleriaTela[], marginTop: number) => {
    const alinharCards = items.length > 0 && items.every((tela) => tela.tooltipKpi != null)

    if (alinharCards) {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: gridColunasGaleriaTelas(items.length),
          gap: 14,
          marginTop,
          alignItems: 'stretch',
        }}>
          {items.map((tela) => (
            <ManualTooltipKpiCard
              key={`card-${tela.legenda}`}
              tooltip={tela.tooltipKpi!}
              preencherAltura
            />
          ))}
          {items.map((tela) => (
            <ManualGaleriaTelaImagemCelula key={`img-${tela.legenda}`} tela={tela} />
          ))}
        </div>
      )
    }

    return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: gridColunasGaleriaTelas(items.length),
      gap: 14,
      marginTop,
    }}>
      {items.map((tela) => (
        <div key={tela.legenda}>
          <ManualGaleriaTelaCelula tela={tela} />
        </div>
      ))}
    </div>
    )
  }

  if (
    !fraseAposIndice
    || fraseAposIndice.indice < 0
    || fraseAposIndice.indice >= telas.length - 1
  ) {
    return gradeTelas(telas, 20)
  }

  const antes = telas.slice(0, fraseAposIndice.indice + 1)
  const depois = telas.slice(fraseAposIndice.indice + 1)

  return (
    <>
      {gradeTelas(antes, 20)}
      <div style={{
        marginTop: 16,
        padding: '2px 0 0 18px',
        borderLeft: '3px solid rgba(99,102,241,.45)',
      }}>
        <ManualParagrafo texto={fraseAposIndice.texto} marginBottom={0} />
      </div>
      {gradeTelas(depois, 16)}
    </>
  )
}

function ManualCalloutBloco({ callout, marginTop = 12, marginBottom = 0 }: {
  callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  marginTop?: number
  marginBottom?: number
}) {
  const c = CALLOUT_STYLE[callout.tipo]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8,
      padding: '12px 16px', marginTop, marginBottom,
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

function ManualTooltipKpiCard({
  tooltip,
  preencherAltura = false,
}: {
  tooltip: DocTooltipKpi
  preencherAltura?: boolean
}) {
  return (
    <div
      style={{
        background: 'rgba(99,102,241,.06)',
        border: '1px solid rgba(99,102,241,.18)',
        borderRadius: 10,
        padding: '12px 14px',
        ...(preencherAltura ? {
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
        } : {}),
      }}
    >
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
        color: '#818cf8', margin: '0 0 10px',
      }}>
        {tooltip.card}
      </p>
      <p style={{ fontSize: '.72rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 10px' }}>
        Tooltip: {tooltip.tituloTooltip}
      </p>
      <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 8px', lineHeight: 1.45 }}>
        <ManualTextoRich texto={tooltip.descricao} />
      </p>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: '.72rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
        {tooltip.detalhes.map((item) => (
          <li key={item} style={{ marginBottom: 3 }}><ManualTextoRichLinha texto={item} /></li>
        ))}
      </ul>
    </div>
  )
}

function ManualTooltipsKpi({ tooltips }: { tooltips: DocTooltipKpi[] }) {
  const umaColuna = tooltips.length === 1
  return (
    <div style={{
      marginTop: 16,
      display: 'grid',
      gridTemplateColumns: umaColuna ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 10,
    }}>
      {tooltips.map((tooltip) => (
        <ManualTooltipKpiCard key={tooltip.card} tooltip={tooltip} />
      ))}
    </div>
  )
}

function figurasAposParagrafoPasso(
  passo: DocPassoVisual,
  indice: number,
): DocFiguraAposParagrafo[] {
  return (passo.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function galeriaComparacaoAposParagrafoPasso(passo: DocPassoVisual, indice: number) {
  return (passo.galeriaComparacaoAposParagrafo ?? []).filter((g) => g.indice === indice)
}

/** Nova etapa após bloco da etapa anterior (ex.: dicas → Etapa 3) — paridade com espaço Etapa 1 → Etapa 2. */
function espacoSuperiorAntesTituloEtapaGaleria(
  galerias: Array<{ tituloEtapa?: string }>,
  indice: number,
  galeria: { tituloEtapa?: string },
): boolean {
  return Boolean(
    galeria.tituloEtapa
    && indice > 0
    && !galerias[indice - 1]?.tituloEtapa,
  )
}

function ManualPassosSubtopicosAcordeao({
  fluxo,
  numeroSecaoFluxo,
  propsPasso,
}: {
  fluxo: DocFluxo
  numeroSecaoFluxo: number
  propsPasso: (passo: DocPassoVisual) => {
    passo: DocPassoVisual
    prefixoPasso?: string
    wizardEtapas?: DocWizardEtapa[]
    ancoraPassoId?: string
  }
}) {
  const ctx = useContext(ManualSubtopicosContext)
  const leitura = useContext(ManualLeituraContext)
  const ancoraPrefix = fluxo.ancoraPassosPrefix
  const passos = fluxo.passosVisuais ?? []
  if (!ctx || !ancoraPrefix || passos.length === 0) return null

  const abertosPasso = ctx.abertosPorPrefix[ancoraPrefix] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
      {passos.map((passo) => {
        const ancoraPassoId = `manual-passo-${ancoraPrefix}-${passo.num}`
        const rotuloCurto = passo.tituloCurto ?? passo.titulo
        const aberto = abertosPasso.includes(passo.num)
        const rotuloSecao = `${numeroSecaoFluxo}.${String(passo.num).padStart(2, '0')}`
        const passoId = idPassoManual(ancoraPrefix, passo.num)
        const estadoPasso: ManualEstadoLeitura = leitura?.isLido(passoId) ? 'lido' : 'nao_lido'

        return (
          <div
            key={passo.num}
            id={ancoraPassoId}
            style={{
              ...MANUAL_ESTILO_ACORDEON_SECAO,
              scrollMarginTop: MANUAL_SCROLL_MARGEM_TOPO_PX,
              border: `1px solid ${aberto ? 'rgba(129,140,248,.28)' : 'rgba(148,163,184,.12)'}`,
              borderRadius: 10,
              overflow: 'hidden',
              transition: 'border-color .2s',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                color: 'var(--ws-text, #f1f5f9)',
                background: aberto ? 'rgba(99,102,241,.08)' : 'rgba(148,163,184,.04)',
                transition: 'background .15s',
              }}
            >
              <button
                type="button"
                onClick={() => ctx.toggle(ancoraPrefix, passo.num)}
                aria-expanded={aberto}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  background: 'transparent',
                  padding: 0,
                }}
              >
                <span style={{
                  ...MANUAL_ESTILO_SECAO_NUMERO,
                  minWidth: 36,
                  fontSize: '.78rem',
                  color: aberto ? '#a5b4fc' : '#818cf8',
                }}>
                  {rotuloSecao}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: '.86rem', lineHeight: 1.35, opacity: estadoPasso === 'lido' ? 0.65 : 1 }}>
                  {rotuloCurto}
                </span>
              </button>
              {leitura?.ativo && (
                <ManualBotaoMarcarLido
                  estado={estadoPasso}
                  onToggle={() => leitura.togglePasso(passoId)}
                  rotulo={rotuloCurto}
                />
              )}
              <button
                type="button"
                onClick={() => ctx.toggle(ancoraPrefix, passo.num)}
                aria-label={aberto ? `Recolher ${rotuloCurto}` : `Expandir ${rotuloCurto}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'inline-flex',
                  flexShrink: 0,
                }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  color="#818cf8"
                  style={{
                    transform: aberto ? 'rotate(180deg)' : 'rotate(-90deg)',
                    transition: 'transform .2s',
                  }}
                />
              </button>
            </div>
            {aberto && (
              <div style={{ padding: '18px 20px 24px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
                <ManualBlocoPassoVisual
                  {...propsPasso(passo)}
                  ocultarRotuloPasso
                  emAcordeaoSubtopico
                />
                <ManualInfograficoPermissoesUsuarioEmbutido fluxo={fluxo} aposPassoNum={passo.num} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ManualMiniStepperWizard({
  etapas,
  etapaAtiva,
}: {
  etapas: DocWizardEtapa[]
  etapaAtiva: number
}) {
  if (etapas.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      padding: '10px 14px',
      borderRadius: 10,
      border: '1px solid rgba(129,140,248,.22)',
      background: 'linear-gradient(90deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.03) 100%)',
    }}>
      {etapas.map((etapa, indice) => {
        const ativa = etapa.numero === etapaAtiva
        const concluida = etapa.numero < etapaAtiva
        return (
          <React.Fragment key={etapa.numero}>
            {indice > 0 ? (
              <span style={{
                color: concluida || ativa ? 'rgba(129,140,248,.45)' : 'rgba(100,116,139,.35)',
                fontSize: '.7rem',
                userSelect: 'none',
              }}>
                ·
              </span>
            ) : null}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: '.7rem',
              lineHeight: 1.2,
              fontWeight: ativa ? 700 : 500,
              color: ativa ? '#e0e7ff' : concluida ? '#94a3b8' : '#64748b',
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '.62rem',
                fontWeight: 800,
                letterSpacing: 0,
                background: ativa
                  ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                  : concluida
                    ? 'rgba(99,102,241,.18)'
                    : 'transparent',
                border: ativa
                  ? 'none'
                  : concluida
                    ? '1px solid rgba(129,140,248,.35)'
                    : '1px solid rgba(148,163,184,.3)',
                color: ativa ? '#fff' : concluida ? '#a5b4fc' : '#64748b',
                boxShadow: ativa ? '0 0 0 3px rgba(99,102,241,.18)' : undefined,
              }}>
                {ativa ? '●' : etapa.numero}
              </span>
              {etapa.rotulo}
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}

function ManualBlocoPassoVisual({
  passo,
  ocultarRotuloPasso = false,
  emAcordeaoSubtopico = false,
  emGradeCenarios = false,
  cenarioParte = 'completo',
  prefixoPasso,
  ancoraPassoId,
  wizardEtapas,
}: {
  passo: DocPassoVisual
  ocultarRotuloPasso?: boolean
  emAcordeaoSubtopico?: boolean
  emGradeCenarios?: boolean
  /** Com grade lado a lado + imagens alinhadas: `texto` ou `figuras` em linhas separadas. */
  cenarioParte?: 'completo' | 'texto' | 'figuras'
  prefixoPasso?: string
  ancoraPassoId?: string
  wizardEtapas?: DocWizardEtapa[]
}) {
  const semRotuloPasso = ocultarRotuloPasso || passo.ocultarRotuloPasso || passo.estiloTituloWizard === true || emAcordeaoSubtopico
  const omitirFigurasNoTexto = cenarioParte === 'texto'
  const blocoBase: React.CSSProperties = emAcordeaoSubtopico
    ? { paddingTop: 0, marginTop: 0 }
    : emGradeCenarios
    ? { paddingTop: 0, marginTop: cenarioParte === 'figuras' ? 0 : 18 }
    : {
      paddingTop: passo.num === 1 ? 8 : MANUAL_ESPACO_ENTRE_PASSOS_PX,
      borderTop: passo.num === 1 ? undefined : '1px solid rgba(148,163,184,.1)',
      marginTop: passo.num === 1 ? 18 : MANUAL_ESPACO_ENTRE_PASSOS_PX,
    }

  const estiloBlocoRaiz: React.CSSProperties = ancoraPassoId && !emAcordeaoSubtopico
    ? { ...blocoBase, scrollMarginTop: MANUAL_SCROLL_MARGEM_TOPO_PX }
    : blocoBase

  const espacoParagrafoPx = emAcordeaoSubtopico ? MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX : MANUAL_ESPACO_PARAGRAFO_PX
  const margemParagrafo = (indice: number, total: number, indiceCallout?: number) => {
    if (indiceCallout === indice) return 0
    return indice < total - 1 ? espacoParagrafoPx : 0
  }

  const margemCalloutAposParagrafo = (indiceCallout: number, totalParagrafos: number) => ({
    marginTop: espacoParagrafoPx,
    marginBottom: indiceCallout < totalParagrafos - 1 ? espacoParagrafoPx : 0,
  })

  const calloutsLista = passo.dicaAoLadoImagem || passo.calloutAposImagem
    ? []
    : (passo.callouts ?? (passo.callout ? [passo.callout] : []))

  const blocoCallouts = calloutsLista.map((callout, i) => (
    <ManualCalloutBloco
      key={i}
      callout={callout}
      marginTop={i === 0 ? ((passo.paragrafos?.length ?? 0) > 0 ? MANUAL_ESPACO_PARAGRAFO_PX : 0) : 8}
    />
  ))

  const blocoTexto = (
    <div style={{
      padding: emAcordeaoSubtopico ? '4px 0 0 0' : '2px 0 0 18px',
      borderLeft: emAcordeaoSubtopico ? undefined : '3px solid rgba(99,102,241,.45)',
      width: '100%',
      minWidth: 0,
    }}>
      {!semRotuloPasso && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '0 0 8px' }}>
          <span style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
            {String(passo.num).padStart(2, '0')}
          </span>
          {prefixoPasso && (
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#a5b4fc',
              background: 'rgba(99,102,241,.14)',
              border: '1px solid rgba(129,140,248,.3)',
              borderRadius: MANUAL_RAIO_CHIP,
              padding: '3px 10px',
            }}>
              {prefixoPasso}
            </span>
          )}
        </div>
      )}
      {!passo.ocultarTituloPasso && !emAcordeaoSubtopico && (
        passo.estiloTituloWizard && passo.etapaWizard != null && wizardEtapas ? (
          <ManualMiniStepperWizard etapas={wizardEtapas} etapaAtiva={passo.etapaWizard} />
        ) : (
          <>
            {prefixoPasso ? (
              <p style={{ ...MANUAL_ESTILO_PASSO_TITULO, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX + 4 }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{prefixoPasso}</span>
                <span style={{ color: '#64748b', margin: '0 6px', fontWeight: 400 }}>—</span>
                <span>{passo.titulo}</span>
              </p>
            ) : (
              <p style={{ ...MANUAL_ESTILO_PASSO_TITULO, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX + 4 }}>
                {passo.titulo}
              </p>
            )}
          </>
        )
      )}
      {passo.mostrarInfograficoPedidoListaImportarFormas ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoPedidoListaImportarFormas />
        </div>
      ) : null}
      {passo.mostrarInfograficoSmartDocsListaPaineis ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoSmartDocsListaPaineis />
        </div>
      ) : null}
      {passo.paragrafos?.map((p, i) => {
        const caminhosImportacaoIdx = passo.caminhosImportacaoPlanilhaAposParagrafo ?? 1
        const calloutAntesParagrafoCaminhosImportacao = Boolean(
          passo.mostrarCaminhosImportacaoPlanilhaPedidoLista
          && passo.calloutAposParagrafo?.indice === i
          && caminhosImportacaoIdx === i,
        )
        const calloutBloco = passo.calloutAposParagrafo?.indice === i ? (() => {
          const margens = margemCalloutAposParagrafo(
            i,
            passo.paragrafos?.length ?? 0,
          )
          return (
            <ManualCalloutBloco
              callout={passo.calloutAposParagrafo.callout}
              marginTop={calloutAntesParagrafoCaminhosImportacao
                ? MANUAL_ESPACO_ENTRE_PASSOS_PX
                : margens.marginTop}
              marginBottom={calloutAntesParagrafoCaminhosImportacao
                ? MANUAL_ESPACO_PARAGRAFO_PX
                : margens.marginBottom}
            />
          )
        })() : null

        return (
        <div key={i}>
          {calloutAntesParagrafoCaminhosImportacao ? calloutBloco : null}
          {passo.mostrarCaminhosImportacaoPlanilhaPedidoLista
          && (passo.caminhosImportacaoPlanilhaAposParagrafo ?? 1) === i ? (
            <ManualGaleriaCabecalhoPasso
              legendaPasso="01 · Importar via planilha"
              pilaresImportarFormas={['01']}
            />
          ) : null}
          <ManualParagrafo
            texto={p}
            marginBottom={margemParagrafo(
              i,
              passo.paragrafos?.length ?? 0,
              passo.calloutAposParagrafo?.indice,
            )}
          />
          {passo.mostrarIndicadorCursorVisualizacao
          && (passo.indicadorCursorVisualizacaoAposParagrafo ?? 1) === i ? (
            <ManualIndicadorCursorVisualizacao />
          ) : null}
          {!calloutAntesParagrafoCaminhosImportacao ? calloutBloco : null}
          {omitirFigurasNoTexto
            ? null
            : figurasAposParagrafoPasso(passo, i).map((fig) => (
              <div key={fig.imagem} style={{ margin: '12px 0 16px' }}>
                <ManualFiguraScreenshot
                  src={fig.imagem}
                  alt={fig.legenda ?? passo.titulo}
                  larguraMaxima={fig.larguraMaxima}
                />
              </div>
            ))}
          {passo.mostrarCatalogoColunasPedidoLista
          && (passo.catalogoColunasPedidoAposParagrafo ?? 0) === i ? (
            <ManualPedidoTabelaCatalogoColunasLista />
          ) : null}
          {passo.mostrarFormatosExportacaoPedidoLista
          && (passo.formatosExportacaoPedidoAposParagrafo ?? 1) === i ? (
            <ManualPedidoFormatosExportacaoLista />
          ) : null}
          {passo.mostrarCaminhosImportacaoPlanilhaPedidoLista
          && (passo.caminhosImportacaoPlanilhaAposParagrafo ?? 1) === i ? (
            <>
              <ManualPedidoCaminhosImportacaoPlanilha />
              {(passo.galeriaComparacaoAposCaminhosImportacao ?? []).map((galeria) => (
                <ManualGaleriaComparacaoIntro
                  key={galeria.telas.map((t) => t.imagem).join('|')}
                  telas={galeria.telas}
                  ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                  colunas={galeria.colunas}
                  textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                  legendaPasso={galeria.legendaPasso}
                  pilaresImportarFormas={galeria.pilaresImportarFormas}
                  tituloEtapa={galeria.tituloEtapa}
                  textoIntro={galeria.textoIntro}
                  textoAoLado={galeria.textoAoLado}
                  infograficoMapeamentoImportarColunas={galeria.infograficoMapeamentoImportarColunas}
                  calloutApos={galeria.calloutApos}
                />
              ))}
            </>
          ) : null}
          {passo.mostrarFormatosImportacaoPedidoLista
          && (passo.formatosImportacaoPedidoAposParagrafo ?? 1) === i ? (
            <ManualPedidoFormatosImportacaoLista />
          ) : null}
          {passo.mostrarInfograficoPedidoListaTransferirFluxo
          && (passo.transferirInfograficoAposParagrafo ?? 1) === i ? (
            <ManualInfograficoPedidoListaTransferirFluxo />
          ) : null}
          {(() => {
            const galeriasParagrafo = galeriaComparacaoAposParagrafoPasso(passo, i)
            return galeriasParagrafo.map((galeria, idxGaleria) => (
            <ManualGaleriaComparacaoIntro
              key={galeria.telas.map((t) => t.imagem).join('|')}
              telas={galeria.telas}
              ampliarInferiorDireito={galeria.ampliarInferiorDireito}
              colunas={galeria.colunas}
              textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
              legendaPasso={galeria.legendaPasso}
              pilaresImportarFormas={galeria.pilaresImportarFormas}
              tituloEtapa={galeria.tituloEtapa}
              textoIntro={galeria.textoIntro}
              textoAoLado={galeria.textoAoLado}
              infograficoMapeamentoImportarColunas={galeria.infograficoMapeamentoImportarColunas}
              calloutApos={galeria.calloutApos}
              espacoSuperiorEtapa={espacoSuperiorAntesTituloEtapaGaleria(galeriasParagrafo, idxGaleria, galeria)}
            />
          ))
          })()}
        </div>
        )
      })}
      {(passo.paragrafos?.length ?? 0) === 0
        ? galeriaComparacaoAposParagrafoPasso(passo, 0).map((galeria) => (
          <ManualGaleriaComparacaoIntro
            key={galeria.telas.map((t) => t.imagem).join('|')}
            telas={galeria.telas}
            ampliarInferiorDireito={galeria.ampliarInferiorDireito}
            colunas={galeria.colunas}
            textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
            legendaPasso={galeria.legendaPasso}
            pilaresImportarFormas={galeria.pilaresImportarFormas}
          />
        ))
        : null}
      {passo.linkCapitulo && (
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link to={passo.linkCapitulo.href} style={MANUAL_LINK_STYLE}>
            {passo.linkCapitulo.texto}
          </Link>
        </p>
      )}
      {passo.tooltipsKpi && passo.tooltipsKpi.length > 0 && !passo.tooltipsKpiAposImagem && (
        <ManualTooltipsKpi tooltips={passo.tooltipsKpi} />
      )}
      {(passo.dicaAoLadoImagem
        ? (passo.callouts ?? [])
        : []
      ).map((callout, i) => (
        <ManualCalloutBloco key={i} callout={callout} marginTop={i === 0 ? 12 : 8} />
      ))}
      {!passo.calloutAoLadoTexto && blocoCallouts}
    </div>
  )

  const rodapeDicaImagem = passo.dicaAoLadoImagem ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(200px, 34%) minmax(0, 1fr)',
      gap: 20,
      marginTop: 20,
      alignItems: 'start',
    }}>
      <ManualCalloutBloco callout={passo.dicaAoLadoImagem.callout} marginTop={0} />
      <ManualFiguraScreenshot
        src={passo.dicaAoLadoImagem.imagem}
        alt={passo.dicaAoLadoImagem.legenda ?? 'Menu do usuário'}
      />
    </div>
  ) : null

  const gradeColunas = passo.colunasTabela && passo.colunasTabela.length > 0
    ? <ManualColunasTabela colunas={passo.colunasTabela} />
    : null

  const tabelaCatalogoColunasSmartRead = passo.mostrarCatalogoColunasListaSmartRead
    ? <ManualSmartReadTabelaCatalogoColunasLista />
    : null

  const infograficoListaCustomizacao = passo.mostrarInfograficoSmartDocsListaCustomizacao
    ? <ManualInfograficoSmartDocsListaCustomizacao />
    : passo.mostrarInfograficoPedidoListaCustomizacao
      ? <ManualInfograficoPedidoListaCustomizacao />
      : null

  const infograficoCatalogoColunasPedido = passo.mostrarInfograficoPedidoCatalogoColunasLista
    ? <ManualInfograficoPedidoCatalogoColunasLista />
    : null

  const tabelaCatalogoColunasPedido = passo.mostrarInfograficoPedidoCatalogoColunasLista
    ? <ManualPedidoTabelaCatalogoColunasLista />
    : null

  const infograficoListaAlertas = passo.mostrarInfograficoPedidoListaAlertas
    ? <ManualInfograficoPedidoListaAlertas />
    : null

  const tabelaAlertasPedidoLista = passo.mostrarTabelaAlertasPedidoLista
    ? <ManualPedidoTabelaAlertasLista />
    : null

  const galeriaAposTabela = passo.galeriaTelasAposTabela?.length ? (
    <div style={{ marginTop: 24 }}>
      {passo.galeriaTelasAposTabela.map((tela) => (
        <div key={tela.legenda} style={{ marginTop: 20 }}>
          <ManualGaleriaTelaCelula tela={tela} />
        </div>
      ))}
    </div>
  ) : null

  const paragrafoAposGaleriaTabela = passo.paragrafoAposGaleriaTabela ? (
    <div style={{ marginTop: 20 }}>
      <ManualParagrafo texto={passo.paragrafoAposGaleriaTabela} marginBottom={0} />
    </div>
  ) : null

  const calloutAposGaleriaTabela = passo.calloutAposGaleriaTabela ? (
    <ManualCalloutBloco callout={passo.calloutAposGaleriaTabela} marginTop={24} />
  ) : null

  const calloutAposTabelaColunasPadrao = passo.calloutAposTabelaColunasPadrao ? (
    <ManualCalloutBloco callout={passo.calloutAposTabelaColunasPadrao} marginTop={16} />
  ) : null

  const blocoListaCustomizacao = (infograficoListaCustomizacao || infograficoCatalogoColunasPedido || tabelaCatalogoColunasPedido || infograficoListaAlertas || tabelaAlertasPedidoLista || passo.mostrarTabelaColunasPadraoLista
    || tabelaCatalogoColunasSmartRead || calloutAposTabelaColunasPadrao || galeriaAposTabela || paragrafoAposGaleriaTabela || calloutAposGaleriaTabela) ? (
    <>
      {infograficoListaCustomizacao}
      {infograficoCatalogoColunasPedido}
      {tabelaCatalogoColunasPedido}
      {infograficoListaAlertas}
      {tabelaAlertasPedidoLista}
      {gradeColunas}
      {tabelaCatalogoColunasSmartRead}
      {calloutAposTabelaColunasPadrao}
      {galeriaAposTabela}
      {paragrafoAposGaleriaTabela}
      {calloutAposGaleriaTabela}
    </>
  ) : null

  const colunaTexto = (
    <>
      {blocoTexto}
      {!passo.imagem && !passo.galeriaTelas?.length && !passo.galeriaComparacao?.length
        ? gradeColunas
        : null}
    </>
  )

  const galeriaComparacao = passo.galeriaComparacao?.length ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(passo.galeriaComparacao.length, 2)}, minmax(0, 1fr))`,
      gap: 14,
      alignItems: 'start',
    }}>
      {passo.galeriaComparacao.map((tela) => (
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

  if (passo.imagemAbaixoTexto && passo.imagem) {
    const galeriaAbaixo = passo.galeriaTelas?.length ? (
      <ManualGaleriaTelasBloco
        telas={passo.galeriaTelas}
        fraseAposIndice={passo.galeriaFraseAposIndice}
      />
    ) : null

    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {passo.calloutAoLadoTexto && calloutsLista.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 38%)',
            gap: 20,
            alignItems: 'center',
          }}>
            {blocoTexto}
            <div>{blocoCallouts}</div>
          </div>
        ) : blocoTexto}
        <div style={{
          marginTop: emAcordeaoSubtopico
            ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
            : (calloutsLista.length > 0 ? MANUAL_ESPACO_ENTRE_PASSOS_PX : 20),
        }}>
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
        </div>
        {passo.calloutAposImagem ? (
          <ManualCalloutBloco callout={passo.calloutAposImagem} marginTop={20} />
        ) : null}
        {passo.paragrafosAposImagem && passo.paragrafosAposImagem.length > 0 && (
          <div style={{ marginTop: 20 }}>
            {passo.paragrafosAposImagem.map((p, i) => (
              <ManualParagrafo
                key={p}
                texto={p}
                marginBottom={i < passo.paragrafosAposImagem!.length - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0}
              />
            ))}
          </div>
        )}
        {passo.mostrarInfograficoListaLeituraSmartReadIntegracaoApiCockpit ? (
          <ManualInfograficoListaLeituraSmartReadIntegracaoApiCockpit />
        ) : null}
        {passo.tooltipsKpiAposImagem && passo.tooltipsKpi && passo.tooltipsKpi.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <ManualTooltipsKpi tooltips={passo.tooltipsKpi} />
          </div>
        )}
        {galeriaAbaixo}
        {blocoListaCustomizacao}
      </div>
    )
  }

  if (galeriaComparacao) {
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
        }}>
          {colunaTexto}
          {galeriaComparacao}
        </div>
      </div>
    )
  }

  if (passo.galeriaTelas?.length || (passo.colunasTabela?.length && !passo.imagem)) {
    const galeria = passo.galeriaTelas?.length ? (
      <ManualGaleriaTelasBloco
        telas={passo.galeriaTelas}
        fraseAposIndice={passo.galeriaFraseAposIndice}
      />
    ) : null

    if (passo.imagem) {
      return (
        <div id={ancoraPassoId} style={estiloBlocoRaiz}>
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
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {colunaTexto}
        {galeria}
        {blocoListaCustomizacao}
      </div>
    )
  }

  if (gradeColunas && passo.imagem) {
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
        }}>
          {blocoTexto}
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
        </div>
        {blocoListaCustomizacao ?? gradeColunas}
      </div>
    )
  }

  if (cenarioParte === 'figuras') {
    const figuras = passo.figurasAposParagrafo ?? []
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {figuras.map((fig) => (
          <div key={fig.imagem} style={{ margin: 0 }}>
            <ManualFiguraScreenshot
              src={fig.imagem}
              alt={fig.legenda ?? passo.titulo}
              larguraMaxima={fig.larguraMaxima}
            />
          </div>
        ))}
      </div>
    )
  }

  if (cenarioParte === 'texto' && !passo.imagem && !passo.galeriaComparacao?.length && !passo.galeriaTelas?.length) {
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {blocoTexto}
        {blocoListaCustomizacao}
      </div>
    )
  }

  if (!passo.imagem && !passo.galeriaComparacao?.length && !passo.galeriaTelas?.length) {
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {blocoTexto}
        {blocoListaCustomizacao}
        {rodapeDicaImagem}
      </div>
    )
  }

  return (
    <div
      id={ancoraPassoId}
      style={{
      ...estiloBlocoRaiz,
      display: 'grid',
      gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
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

const MANUAL_SCROLL_MARGEM_TOPO_PX = 32

export const MANUAL_ESTILO_ACORDEON_SECAO: React.CSSProperties = {
  scrollMarginTop: MANUAL_SCROLL_MARGEM_TOPO_PX,
}

function encontrarContainerScrollManual(el: HTMLElement): HTMLElement | null {
  const marcado = document.querySelector<HTMLElement>('[data-manual-scroll-root]')
  if (marcado) return marcado
  let atual: HTMLElement | null = el.parentElement
  while (atual) {
    const { overflowY } = getComputedStyle(atual)
    if (overflowY === 'auto' || overflowY === 'scroll') return atual
    atual = atual.parentElement
  }
  return null
}

/** Rola até seção do manual dentro do container scrollável da University (não o `window`). */
export function rolarParaSecaoManual(idSecao: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(idSecao)
  if (!el) return false
  const container = encontrarContainerScrollManual(el)
  const margem = MANUAL_SCROLL_MARGEM_TOPO_PX
  if (container) {
    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const top = elRect.top - containerRect.top + container.scrollTop - margem
    const topFinal = Math.max(0, top)
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ top: topFinal, behavior })
    } else {
      container.scrollTop = topFinal
    }
  } else {
    el.scrollIntoView({ behavior, block: 'start' })
  }
  return true
}

export function useManualSumarioScroll(
  abertos: number[],
  setAbertos: React.Dispatch<React.SetStateAction<number[]>>,
  abrirSubtopico: (prefix: string, num: number) => void,
  subtopicosAbertos: Record<string, number[]>,
) {
  const [pendenteScroll, setPendenteScroll] = useState<{
    secao: number
    elemento?: string
    passo?: { prefix: string; num: number }
  } | null>(null)

  const scrollToSecao = useCallback((n: number) => {
    const id = `doc-sec-${n}`
    if (!abertos.includes(n)) {
      setAbertos(prev => (prev.includes(n) ? prev : [...prev, n]))
      setPendenteScroll({ secao: n })
    } else {
      rolarParaSecaoManual(id)
    }
  }, [abertos, setAbertos])

  const scrollToItem = useCallback((item: DocItemSumarioManual) => {
    const n = item.secaoAcordeao
    if (item.elementoScroll) {
      const passo = parseElementoPassoManual(item.elementoScroll)
      if (passo) abrirSubtopico(passo.prefix, passo.num)
      if (!abertos.includes(n)) {
        setAbertos(prev => (prev.includes(n) ? prev : [...prev, n]))
        setPendenteScroll({ secao: n, elemento: item.elementoScroll, passo: passo ?? undefined })
      } else {
        rolarParaSecaoManual(item.elementoScroll)
      }
      return
    }
    scrollToSecao(n)
  }, [abertos, scrollToSecao, setAbertos, abrirSubtopico])

  useEffect(() => {
    if (pendenteScroll == null || !abertos.includes(pendenteScroll.secao)) return
    if (pendenteScroll.passo) {
      const abertosPasso = subtopicosAbertos[pendenteScroll.passo.prefix] ?? []
      if (!abertosPasso.includes(pendenteScroll.passo.num)) return
    }
    const id = pendenteScroll.elemento ?? `doc-sec-${pendenteScroll.secao}`
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rolarParaSecaoManual(id)
        setPendenteScroll(null)
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [abertos, pendenteScroll, subtopicosAbertos])

  return { scrollToSecao, scrollToItem }
}

function figurasAposParagrafoFluxo(
  fluxo: DocFluxo,
  indice: number,
): { imagem: string; legenda?: string }[] {
  return (fluxo.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function ManualInfograficoPermissoesUsuarioEmbutido({ fluxo, aposPassoNum }: {
  fluxo: DocFluxo
  aposPassoNum: number
}) {
  if (!fluxo.mostrarInfograficoPermissoesUsuario) return null
  if (fluxo.infograficoPermissoesUsuarioAposPasso !== aposPassoNum) return null
  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <ManualInfograficoPermissoesUsuario />
    </div>
  )
}

function ManualSecaoFluxo({ fluxo, numeroSecaoFluxo }: { fluxo: DocFluxo; numeroSecaoFluxo: number }) {
  const prefixoPasso = fluxo.prefixoPassosVisuais
  const ancoraPassosPrefix = fluxo.ancoraPassosPrefix

  const propsPasso = (passo: DocPassoVisual) => ({
    passo,
    prefixoPasso,
    wizardEtapas: fluxo.wizardEtapas,
    ancoraPassoId: ancoraPassosPrefix
      ? `manual-passo-${ancoraPassosPrefix}-${passo.num}`
      : undefined,
  })

  return (
    <>
      {fluxo.paragrafos?.map((p, i) => (
        <div key={i}>
          <ManualParagrafo
            texto={p}
            marginBottom={manualMargemParagrafoAntesCallout(
              i,
              fluxo.paragrafos?.length ?? 0,
              fluxo.calloutAposParagrafo?.indice,
            )}
          />
          {fluxo.calloutAposParagrafo?.indice === i && (() => {
            const margens = manualMargemCalloutAposParagrafo(
              i,
              fluxo.paragrafos?.length ?? 0,
            )
            const marginBottomCallout = margens.marginBottom > 0
              ? margens.marginBottom
              : (fluxo.mostrarMapaSubtopicosPassos ? 16 : 0)
            return (
              <ManualCalloutBloco
                callout={fluxo.calloutAposParagrafo.callout}
                marginTop={margens.marginTop}
                marginBottom={marginBottomCallout}
              />
            )
          })()}
          {figurasAposParagrafoFluxo(fluxo, i).map((fig) => (
            <div key={fig.imagem} style={{ margin: '12px 0 20px' }}>
              <ManualFiguraScreenshot
                src={fig.imagem}
                alt={fig.legenda ?? fluxo.titulo}
                larguraMaxima={fig.larguraMaxima}
              />
            </div>
          ))}
        </div>
      ))}
      {fluxo.callout && !fluxo.calloutAposPassos && (
        <ManualCalloutBloco callout={fluxo.callout} marginTop={12} />
      )}
      {fluxo.mostrarInfograficoPermissoesUsuario && fluxo.infograficoPermissoesUsuarioAposPasso == null && (
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <ManualInfograficoPermissoesUsuario />
        </div>
      )}
      {fluxo.mostrarInfograficoPapeisFornecedor && (
        <div style={{ marginTop: 8, marginBottom: 20 }}>
          <ManualInfograficoPapeisFornecedor />
        </div>
      )}
      {fluxo.mostrarInfograficoMenuLateral && (
        <div style={{ marginTop: 8, marginBottom: 20 }}>
          <ManualInfograficoMenuLateral />
        </div>
      )}
      {fluxo.mostrarInfograficoIconesMenuSuperior && !fluxo.infograficoIconesMenuSuperiorAposPassos && (
        <div style={{ marginTop: 8, marginBottom: 4 }}>
          <ManualInfograficoIconesMenuSuperior />
        </div>
      )}
      {fluxo.mostrarInfograficoTiposUsuario && (
        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <ManualInfograficoTiposUsuario />
        </div>
      )}
      {fluxo.mostrarInfograficoSmartDocsInsights && (
        <div style={{ marginTop: 8, marginBottom: 4 }}>
          <ManualInfograficoSmartDocsInsights />
        </div>
      )}
      {fluxo.mostrarInfograficoPedidoInsights && (
        <div style={{ marginTop: 8, marginBottom: 4 }}>
          <ManualInfograficoPedidoInsights />
        </div>
      )}
      {fluxo.modoCenarios && fluxo.cenariosLadoALado && (fluxo.passosVisuais?.length ?? 0) > 0 ? (
        fluxo.cenariosImagensAlinhadas ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 24,
              alignItems: 'start',
              marginTop: 18,
            }}>
              {fluxo.passosVisuais.map(passo => (
                <ManualBlocoPassoVisual
                  key={`${passo.num}-texto`}
                  {...propsPasso(passo)}
                  ocultarRotuloPasso
                  emGradeCenarios
                  cenarioParte="texto"
                />
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 24,
              alignItems: 'start',
              marginTop: 16,
            }}>
              {fluxo.passosVisuais.map(passo => (
                <ManualBlocoPassoVisual
                  key={`${passo.num}-figuras`}
                  {...propsPasso(passo)}
                  ocultarRotuloPasso
                  emGradeCenarios
                  cenarioParte="figuras"
                />
              ))}
            </div>
          </>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 24,
            alignItems: 'start',
            marginTop: 18,
          }}>
            {fluxo.passosVisuais.map(passo => (
              <ManualBlocoPassoVisual
                key={passo.num}
                {...propsPasso(passo)}
                ocultarRotuloPasso
                emGradeCenarios
              />
            ))}
          </div>
        )
      ) : fluxo.mostrarMapaSubtopicosPassos && fluxo.ancoraPassosPrefix ? (
        <ManualPassosSubtopicosAcordeao
          fluxo={fluxo}
          numeroSecaoFluxo={numeroSecaoFluxo}
          propsPasso={propsPasso}
        />
      ) : (
        (fluxo.passosVisuais ?? []).map(passo => (
          <React.Fragment key={passo.num}>
            <ManualBlocoPassoVisual
              {...propsPasso(passo)}
              ocultarRotuloPasso={fluxo.modoCenarios}
            />
            <ManualInfograficoPermissoesUsuarioEmbutido fluxo={fluxo} aposPassoNum={passo.num} />
          </React.Fragment>
        ))
      )}
      {fluxo.mostrarCatalogoHistoricoCompleto && (
        <ManualCatalogoHistoricoCompleto />
      )}
      {fluxo.callout && fluxo.calloutAposPassos && (
        <ManualCalloutBloco callout={fluxo.callout} marginTop={12} />
      )}
      {fluxo.mostrarInfograficoIconesMenuSuperior && fluxo.infograficoIconesMenuSuperiorAposPassos && (
        <div style={{ marginTop: 20, marginBottom: 4 }}>
          <ManualInfograficoIconesMenuSuperior />
        </div>
      )}
      {fluxo.mostrarInfograficoHubTelas && fluxo.infograficoHubTelasAposPassos && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoHubTelas />
        </div>
      )}
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
          marginBottom={
            i === origem.paragrafos.length - 1 && origem.etapas.length > 0
              ? 20
              : manualMargemParagrafo(i, origem.paragrafos.length)
          }
        />
      ))}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginTop: origem.paragrafos.length === 0 ? 0 : undefined,
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
              <ManualParagrafo key={i} texto={p} marginBottom={manualMargemParagrafo(i, etapa.paragrafos.length)} />
            ))}
            <ManualFiguraScreenshot src={etapa.imagem} alt={etapa.legenda} />
          </div>
        ))}
      </div>
    </div>
  )
}

function figurasAposParagrafo(
  secao: DocSecao,
  indice: number,
): { imagem: string; legenda?: string }[] {
  return (secao.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function galeriaComparacaoAposParagrafoSecao(secao: DocSecao, indice: number) {
  return (secao.galeriaComparacaoAposParagrafo ?? []).filter((g) => g.indice === indice)
}

function ManualGaleriaComparacaoIntro({
  telas,
  ampliarInferiorDireito,
  colunas,
  textoAcimaEstiloCorpo = false,
  legendaPasso,
  pilaresImportarFormas,
  pilaresCustomizacao,
  tituloEtapa,
  textoIntro,
  textoAoLado,
  infograficoMapeamentoImportarColunas,
  calloutApos,
  espacoSuperiorEtapa = false,
}: {
  telas: DocGaleriaComparacaoTela[]
  ampliarInferiorDireito?: boolean
  colunas?: number
  textoAcimaEstiloCorpo?: boolean
  legendaPasso?: string
  pilaresImportarFormas?: ManualPilarImportarFormaId[]
  pilaresCustomizacao?: ManualPilarCustomizacaoId[]
  tituloEtapa?: string
  textoIntro?: string
  textoAoLado?: string[]
  infograficoMapeamentoImportarColunas?: boolean
  calloutApos?: DocCalloutManual
  espacoSuperiorEtapa?: boolean
}) {
  if (telas.length === 0) return null
  const colunasGrade = colunas ?? Math.min(telas.length, 2)
  const cabecalhoPasso = legendaPasso && (pilaresImportarFormas?.length || pilaresCustomizacao?.length) ? (
    <ManualGaleriaCabecalhoPasso
      legendaPasso={legendaPasso}
      pilaresImportarFormas={pilaresImportarFormas}
      pilaresCustomizacao={pilaresCustomizacao}
    />
  ) : null

  const alinharCalloutsNaGrade = telas.length > 1 && telas.some((t) => t.calloutAntes)

  const renderTela = (tela: DocGaleriaComparacaoTela) => (
    <div
      key={tela.imagem}
      style={alinharCalloutsNaGrade ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}
    >
      {tela.calloutAntes ? (
        <div style={alinharCalloutsNaGrade ? { flex: '1 1 0', marginBottom: 10 } : undefined}>
          <ManualCalloutBloco callout={tela.calloutAntes} marginTop={0} marginBottom={alinharCalloutsNaGrade ? 0 : 10} />
        </div>
      ) : tela.paragrafoAntes ? (
        textoAcimaEstiloCorpo
          ? <ManualGaleriaLegendaPrintPasso texto={tela.paragrafoAntes} entreLinhas />
          : <ManualTextoUx10AcimaFigura texto={tela.paragrafoAntes} />
      ) : null}
      {tela.legenda.trim() ? (
        <p style={{
          fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
          marginBottom: 10, textAlign: 'center', letterSpacing: '.03em', lineHeight: 1.4,
        }}>
          {tela.legenda}
        </p>
      ) : null}
      <ManualFiguraScreenshot
        src={tela.imagem}
        alt={tela.legenda.trim() || tela.paragrafoAntes?.replace(/\*\*/g, '') || 'Captura de tela'}
        ampliarInferiorDireito={ampliarInferiorDireito}
      />
    </div>
  )

  const gradeComTextoAoLado = (textoAoLado?.length || infograficoMapeamentoImportarColunas)
    && telas.length === 1
    && colunasGrade === 4

  const linhaSoDicas = telas.length > 0
    && telas.every((t) => t.calloutAntes)
    && !tituloEtapa

  return (
    <div style={{
      margin: textoAcimaEstiloCorpo ? '12px 0 16px' : '16px 0 22px',
      paddingTop: espacoSuperiorEtapa ? MANUAL_ESPACO_ENTRE_PASSOS_PX : undefined,
    }}>
      {linhaSoDicas ? <ManualGaleriaRotuloLinhaDicas /> : null}
      {tituloEtapa ? <ManualGaleriaTelaParagrafoFigura texto={tituloEtapa} /> : null}
      {textoIntro ? <ManualParagrafo texto={textoIntro} marginBottom={6} /> : null}
      {cabecalhoPasso}
      {gradeComTextoAoLado ? (
        <>
          {infograficoMapeamentoImportarColunas && telas[0].paragrafoAntes ? (
            <ManualGaleriaLegendaPrintPasso texto={telas[0].paragrafoAntes} entreLinhas />
          ) : null}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            alignItems: 'stretch',
          }}>
            {infograficoMapeamentoImportarColunas ? (
              <>
                <ManualFiguraScreenshot
                  src={telas[0].imagem}
                  alt={telas[0].paragrafoAntes?.replace(/\*\*/g, '') || 'Captura de tela'}
                  ampliarInferiorDireito={ampliarInferiorDireito}
                />
                <div style={{ gridColumn: 'span 3', display: 'flex', minHeight: 0 }}>
                  <ManualInfograficoPedidoListaImportarMapeamentoColunas />
                </div>
              </>
            ) : (
              <>
                {renderTela(telas[0])}
                <div style={{ gridColumn: 'span 3', paddingTop: 2 }}>
                  {textoAoLado?.map((paragrafo, idx) => (
                    <ManualParagrafo
                      key={paragrafo.slice(0, 24)}
                      texto={paragrafo}
                      marginBottom={idx === (textoAoLado?.length ?? 0) - 1 ? 0 : MANUAL_ESPACO_PARAGRAFO_PX}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
      <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${colunasGrade}, minmax(0, 1fr))`,
      gap: colunasGrade >= 4 ? 10 : 16,
      alignItems: alinharCalloutsNaGrade ? 'stretch' : 'start',
    }}>
      {telas.map((tela) => renderTela(tela))}
      </div>
      )}
      {calloutApos ? (
        <ManualCalloutBloco callout={calloutApos} marginTop={12} marginBottom={0} />
      ) : null}
    </div>
  )
}

function ManualTopicoImagemLateralTexto({
  topico,
  indice,
}: {
  topico: DocTopicoImagemLateral
  indice: number
}) {
  return (
    <div style={{
      padding: '2px 0 0 18px',
      borderLeft: '3px solid rgba(99,102,241,.45)',
      minWidth: 0,
    }}>
      <p style={{
        ...MANUAL_ESTILO_PASSO_TITULO,
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: '.72rem', fontWeight: 800, color: '#818cf8', flexShrink: 0,
        }}>
          {String(indice + 1).padStart(2, '0')}
        </span>
        {topico.titulo}
      </p>
      <ManualParagrafo texto={topico.texto} marginBottom={0} />
    </div>
  )
}

function ManualTopicosImagemLateral({ topicos }: { topicos: DocTopicoImagemLateral[] }) {
  if (topicos.length === 0) return null

  if (topicos.length > 1) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
        columnGap: 28,
        rowGap: 28,
        marginTop: 20,
        alignItems: 'start',
      }}>
        {topicos.map((topico, i) => (
          <React.Fragment key={topico.titulo}>
            <div style={{ gridColumn: 1, gridRow: i + 1 }}>
              <ManualTopicoImagemLateralTexto topico={topico} indice={i} />
            </div>
            <div style={{ gridColumn: 2, gridRow: i + 1, width: '100%', minWidth: 0 }}>
              <ManualFiguraScreenshot
                src={topico.imagem}
                alt={topico.titulo}
                larguraMaxima={topico.larguraMaxima}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    )
  }

  const topico = topicos[0]
  return (
    <ul style={{
      listStyle: 'none', margin: '20px 0 0', padding: 0,
    }}>
      <li>
        <div style={{
          display: 'grid',
          gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
          gap: 28,
          alignItems: 'start',
        }}>
          <ManualTopicoImagemLateralTexto topico={topico} indice={0} />
          <ManualFiguraScreenshot
            src={topico.imagem}
            alt={topico.titulo}
            larguraMaxima={topico.larguraMaxima}
          />
        </div>
      </li>
    </ul>
  )
}

function ManualSecaoIntro({ secao }: { secao: DocSecao }) {
  return (
    <div style={{ padding: '4px 0 8px' }}>
      {secao.layoutTextoImagemLateral && (secao.imagem || secao.dicaAoLadoImagem) ? (
        <>
        <div style={{
          display: 'grid',
          gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
          gap: 28,
          alignItems: 'start',
          marginBottom: secao.lista ? 28 : 0,
        }}>
          <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)', width: '100%', minWidth: 0 }}>
            {secao.paragrafos.map((p, i) => (
              <div key={i}>
                <ManualParagrafo
                  texto={p}
                  marginBottom={manualMargemParagrafoAntesCallout(
                    i,
                    secao.paragrafos.length,
                    secao.calloutAposParagrafo?.indice,
                  )}
                />
                {figurasAposParagrafo(secao, i).map((fig) => (
                  <div key={fig.imagem} style={{ margin: '12px 0 20px' }}>
                    <ManualFiguraScreenshot
                      src={fig.imagem}
                      alt={fig.legenda ?? secao.titulo}
                      larguraMaxima={fig.larguraMaxima}
                    />
                  </div>
                ))}
                {galeriaComparacaoAposParagrafoSecao(secao, i).map((galeria) => (
                  <ManualGaleriaComparacaoIntro
                    key={galeria.telas.map(t => t.imagem).join('|')}
                    telas={galeria.telas}
                    ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                    colunas={galeria.colunas}
                    textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                    legendaPasso={galeria.legendaPasso}
                    pilaresImportarFormas={galeria.pilaresImportarFormas}
                  />
                ))}
                {secao.calloutAposParagrafo?.indice === i && (() => {
                  const margens = manualMargemCalloutAposParagrafo(i, secao.paragrafos.length)
                  return (
                    <ManualCalloutBloco
                      callout={secao.calloutAposParagrafo.callout}
                      marginTop={margens.marginTop}
                      marginBottom={margens.marginBottom}
                    />
                  )
                })()}
              </div>
            ))}
          </div>
          {secao.dicaAoLadoImagem ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 34%) minmax(0, 1fr)',
              gap: 20,
              alignItems: 'start',
            }}>
              <ManualCalloutBloco callout={secao.dicaAoLadoImagem.callout} marginTop={0} />
              <ManualFiguraScreenshot
                src={secao.dicaAoLadoImagem.imagem}
                alt={secao.dicaAoLadoImagem.legenda ?? secao.titulo}
              />
            </div>
          ) : (
            <ManualFiguraScreenshot src={secao.imagem!} alt={secao.titulo} />
          )}
        </div>
        {secao.topicosImagemLateral && secao.topicosImagemLateral.length > 0 && (
          <ManualTopicosImagemLateral topicos={secao.topicosImagemLateral} />
        )}
        </>
      ) : (
        <>
          {secao.paragrafos.map((p, i) => (
            <div key={i}>
              <ManualParagrafo
                texto={p}
                marginBottom={
                  secao.calloutAposParagrafo?.indice === i
                    ? 0
                    : i === secao.paragrafos.length - 1 && !secao.fluxos?.length
                      ? 0
                      : manualMargemParagrafoAntesCallout(
                        i,
                        secao.paragrafos.length,
                        secao.calloutAposParagrafo?.indice,
                      )
                }
              />
              {figurasAposParagrafo(secao, i).map((fig) => (
                <div key={fig.imagem} style={{ margin: '12px 0 20px' }}>
                  <ManualFiguraScreenshot
                    src={fig.imagem}
                    alt={fig.legenda ?? secao.titulo}
                    larguraMaxima={fig.larguraMaxima}
                  />
                </div>
              ))}
              {galeriaComparacaoAposParagrafoSecao(secao, i).map((galeria) => (
                <ManualGaleriaComparacaoIntro
                  key={galeria.telas.map(t => t.imagem).join('|')}
                  telas={galeria.telas}
                  ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                  colunas={galeria.colunas}
                  textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                  legendaPasso={galeria.legendaPasso}
                  pilaresImportarFormas={galeria.pilaresImportarFormas}
                />
              ))}
              {secao.calloutAposParagrafo?.indice === i && (() => {
                const margens = manualMargemCalloutAposParagrafo(i, secao.paragrafos.length)
                return (
                  <ManualCalloutBloco
                    callout={secao.calloutAposParagrafo.callout}
                    marginTop={margens.marginTop}
                    marginBottom={margens.marginBottom}
                  />
                )
              })()}
            </div>
          ))}

          {secao.topicosImagemLateral && secao.topicosImagemLateral.length > 0 && (
            <ManualTopicosImagemLateral topicos={secao.topicosImagemLateral} />
          )}

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

      {secao.mostrarInfograficoFornecedoresComex && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoFornecedoresComex />
        </div>
      )}

      {secao.mostrarInfograficoHubTelas && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoHubTelas />
        </div>
      )}

      {secao.mostrarInfograficoSmartDocsDocumentos && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoSmartDocsDocumentos />
        </div>
      )}

      {secao.mostrarInfograficoPedidoVisaoGeral && (
        <div style={{ marginTop: 16, marginBottom: 0 }}>
          <ManualInfograficoPedidoVisaoGeral />
        </div>
      )}

      {secao.mostrarInfograficoMapaNavegacaoGravity && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoMapaNavegacaoGravity />
        </div>
      )}

      {secao.lista && !secao.mostrarInfograficoPedidoVisaoGeral && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 10,
          marginTop: 20,
        }}>
          {secao.lista.map((item, i) => {
            const { label, desc } = splitLabelDescListaManual(item)
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
                    textAlign: MANUAL_ALINHAMENTO_CORPO,
                    textJustify: 'inter-word',
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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
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
    { icone: IdentificationCard, texto: 'Identidade legal: CNPJ e razão social' },
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
        Da conta à empresa: o que é a Organização
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
            {' '},  a organização é a raiz da conta, não a unidade operacional.
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
  const definicoesWorkspace = [
    {
      cor: '#818cf8',
      bg: 'rgba(99,102,241,.08)',
      borda: 'rgba(99,102,241,.22)',
      rotulo: 'Matriz e filial do importador e exportador',
    },
    {
      cor: '#34d399',
      bg: 'rgba(52,211,153,.08)',
      borda: 'rgba(52,211,153,.22)',
      rotulo: 'Clientes importadores e exportadores de despachantes, agentes, etc.',
    },
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
        color: MANUAL_TIPO.meta, margin: '0 0 14px',
      }}>
        O que é um workspace
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
        marginBottom: 22,
      }}>
        {definicoesWorkspace.map((item) => (
          <div
            key={item.rotulo}
            style={{
              background: item.bg,
              border: `1px solid ${item.borda}`,
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
            }}
          >
            <Buildings size={18} weight="duotone" style={{ color: item.cor, flexShrink: 0 }} />
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 600,
              color: '#e2e8f0',
              lineHeight: 1.45,
            }}>
              {item.rotulo}
            </p>
            <p style={{
              margin: 0,
              fontSize: '.72rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: item.cor,
            }}>
              = Workspace
            </p>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 18px',
      }}>
        Organização × Workspaces: dois cenários comuns
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
            Cenário 1: Importador / Exportador
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
                <div>
                  Workspace
                  <br />
                  Matriz SP
                </div>
              </div>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                <div>
                  Workspace
                  <br />
                  Filial RJ
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Cada matriz ou filial que importa ou exporta é um workspace com dados isolados.
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
            Cenário 2: Despachante / Agente
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
                <div>
                  Workspace
                  <br />
                  Importador A
                </div>
              </div>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                <div>
                  Workspace
                  <br />
                  Exportador B
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Cada cliente importador ou exportador atendido vira um workspace separado.
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

function ManualInfograficoFornecedoresComex() {
  const INFO_FORN: React.CSSProperties = {
    ...INFO_WS,
    padding: '12px 14px',
    fontSize: '.78rem',
    lineHeight: 1.45,
    textAlign: 'center' as const,
  }

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
        Papéis COMEX do fornecedor: relação com a sua operação
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Importação */}
        <div style={{
          background: 'rgba(96,165,250,.06)',
          border: '1px solid rgba(96,165,250,.22)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#60a5fa', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Sua operação: Importação
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%', background: 'rgba(96,165,250,.1)', borderColor: 'rgba(96,165,250,.3)', color: '#bfdbfe' }}>
              <Buildings size={16} weight="duotone" style={{ marginBottom: 4, color: '#93c5fd' }} />
              <div>Seu workspace</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Quem importa a mercadoria</div>
            </div>
            <ArrowDown size={18} weight="bold" color="#64748b" />
            <div style={{ ...INFO_FORN, width: '100%', borderColor: 'rgba(52,211,153,.35)', background: 'rgba(52,211,153,.08)', color: '#a7f3d0' }}>
              <Truck size={14} weight="duotone" style={{ marginBottom: 4, color: '#34d399' }} />
              <strong>Fornecedor · Exportador</strong>
              <div style={{ fontSize: '.68rem', marginTop: 4, opacity: .9 }}>Vendedor no exterior: exporta para você</div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.55, textAlign: 'center' }}>
              <strong style={{ color: '#34d399' }}>Exportador na importação</strong>: cadastre o fabricante ou trading company que vende a mercadoria que sua empresa está importando.
            </p>
          </div>
        </div>

        {/* Exportação */}
        <div style={{
          background: 'rgba(52,211,153,.06)',
          border: '1px solid rgba(52,211,153,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#34d399', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Sua operação: Exportação
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%', background: 'rgba(52,211,153,.12)', borderColor: 'rgba(52,211,153,.35)', color: '#a7f3d0' }}>
              <Buildings size={16} weight="duotone" style={{ marginBottom: 4, color: '#6ee7b7' }} />
              <div>Seu workspace</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Quem exporta a mercadoria</div>
            </div>
            <ArrowUp size={18} weight="bold" color="#64748b" />
            <div style={{ ...INFO_FORN, width: '100%', borderColor: 'rgba(96,165,250,.35)', background: 'rgba(96,165,250,.08)', color: '#bfdbfe' }}>
              <Package size={14} weight="duotone" style={{ marginBottom: 4, color: '#60a5fa' }} />
              <strong>Fornecedor · Importador</strong>
              <div style={{ fontSize: '.68rem', marginTop: 4, opacity: .9 }}>Comprador no exterior: importa de você</div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.55, textAlign: 'center' }}>
              <strong style={{ color: '#60a5fa' }}>Importador na exportação</strong>: cadastre o cliente estrangeiro que compra a mercadoria que sua empresa exporta. Ele atua como importador na operação.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: '14px 16px',
        background: 'rgba(251,191,36,.05)',
        border: '1px solid rgba(251,191,36,.18)',
        borderRadius: 12,
      }}>
        <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#fbbf24' }}>Fornecedor ≠ Workspace.</strong> Workspace é a sua unidade operacional (filial ou cliente do despachante). Fornecedor é um terceiro cadastrado no Configurador: aparece em pedidos, processos, cotações de frete e demais fluxos COMEX. Além de Importador e Exportador, você pode marcar Agente, Despachante, Armador e outros papéis no mesmo cadastro.
        </p>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 14, paddingTop: 12,
        borderTop: '1px dashed rgba(148,163,184,.15)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#34d399' }}>
          <Truck size={13} weight="duotone" /> Exportador = vende na sua importação
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#60a5fa' }}>
          <Package size={13} weight="duotone" /> Importador = compra na sua exportação
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94a3b8' }}>
          <Handshake size={13} weight="duotone" /> Terceiro cadastrado em Fornecedores
        </span>
      </div>
    </div>
  )
}

interface ManualCamadaPasso {
  id: number
  icone: Icon
  cor: string
  corBorda: string
  corFundo: string
  titulo: string
  descricao: string
  badge?: string
}

function ManualCamadaAcessoFluxo() {
  const [ativo, setAtivo] = useState<number | null>(null)

  const passos: ManualCamadaPasso[] = [
    {
      id: 0,
      icone: User,
      cor: '#94a3b8',
      corBorda: 'rgba(148,163,184,.28)',
      corFundo: 'rgba(148,163,184,.08)',
      titulo: 'Standard ou Fornecedor',
      descricao: 'Convidado pelo Master na organização',
    },
    {
      id: 1,
      icone: Buildings,
      cor: '#818cf8',
      corBorda: 'rgba(99,102,241,.35)',
      corFundo: 'rgba(99,102,241,.1)',
      titulo: '1ª camada · Workspaces',
      descricao: 'Quais unidades pode acessar: uma, várias ou nenhuma até o Master marcar',
      badge: '1',
    },
    {
      id: 2,
      icone: Key,
      cor: '#34d399',
      corBorda: 'rgba(52,211,153,.32)',
      corFundo: 'rgba(52,211,153,.08)',
      titulo: '2ª camada · Permissões',
      descricao: 'Dentro de cada produto: Ver e Editar (Dashboard, Lista, Kanban…)',
      badge: '2',
    },
    {
      id: 3,
      icone: Pulse,
      cor: '#818cf8',
      corBorda: 'rgba(129,140,248,.28)',
      corFundo: 'rgba(129,140,248,.08)',
      titulo: 'Produtos Gravity',
      descricao: 'Só opera nos workspaces e telas liberados nas duas camadas',
    },
  ]

  return (
    <div style={{
      marginBottom: 22,
      padding: '18px 20px 20px',
      background: 'linear-gradient(135deg, rgba(99,102,241,.08) 0%, rgba(8,12,24,.35) 50%, rgba(52,211,153,.06) 100%)',
      border: '1px solid rgba(99,102,241,.2)',
      borderRadius: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,.08), transparent 70%)',
      }} />
      <p style={{
        position: 'relative',
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: '#a5b4fc', margin: '0 0 16px',
      }}>
        Fluxo de acesso: Standard e Fornecedor
      </p>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'stretch', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {passos.map((passo, i) => {
          const Icone = passo.icone
          const destacado = ativo === passo.id
          const vizinho = ativo !== null && (ativo === passo.id, 1 || ativo === passo.id + 1)
          return (
            <React.Fragment key={passo.id}>
              <div
                role="group"
                tabIndex={0}
                onMouseEnter={() => setAtivo(passo.id)}
                onMouseLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(passo.id)}
                onBlur={() => setAtivo(null)}
                style={{
                  position: 'relative',
                  flex: '1 1 130px',
                  minWidth: 120,
                  maxWidth: 200,
                  padding: '14px 12px',
                  borderRadius: 12,
                  textAlign: 'center',
                  fontSize: '.72rem',
                  lineHeight: 1.45,
                  cursor: 'default',
                  outline: 'none',
                  background: passo.corFundo,
                  border: `1px solid ${destacado ? passo.cor : passo.corBorda}`,
                  boxShadow: destacado ? `0 8px 24px ${passo.corFundo}, 0 0 0 1px ${passo.corBorda}` : 'none',
                  transform: destacado ? 'translateY(-3px) scale(1.02)' : 'none',
                  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                }}
              >
                {passo.badge && (
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    right: 10,
                    width: 20, height: 20, borderRadius: 999,
                    background: passo.cor, color: '#0f172a',
                    fontSize: '.62rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.25)',
                  }}>{passo.badge}</span>
                )}
                <Icone size={20} weight="duotone" style={{ marginBottom: 8, color: passo.cor }} />
                <div style={{ fontWeight: 700, marginBottom: 5, color: '#e2e8f0', fontSize: '.74rem' }}>{passo.titulo}</div>
                <div style={{ fontSize: '.66rem', color: MANUAL_CORPO_70 }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(passo.descricao)} />
                </div>
              </div>
              {i < passos.length - 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center', color: destacado || vizinho ? passo.cor : '#475569',
                  flexShrink: 0, padding: '0 2px',
                  transition: 'color .2s ease, transform .2s ease',
                  transform: destacado ? 'translateX(2px)' : 'none',
                }}>
                  <ArrowRight size={16} weight="bold" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div style={{
        position: 'relative',
        marginTop: 16,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(251,191,36,.08)',
        border: '1px solid rgba(251,191,36,.22)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <Crown size={16} weight="duotone" color="#fbbf24" />
        <span style={{ fontSize: '.74rem', color: MANUAL_CORPO_70, lineHeight: 1.5, textAlign: 'center' }}>
          <strong style={{ color: '#fde68a' }}>Master</strong> ignora este fluxo: acesso irrestrito em toda a organização
        </span>
      </div>
    </div>
  )
}

function ManualInfograficoPermissoesUsuario() {
  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    padding: '14px 16px',
    background: 'rgba(8,12,24,.28)',
    border: '1px solid rgba(148,163,184,.14)',
  }

  const telasPadrao: { icone: Icon; rotulo: string }[] = [
    { icone: ChartBar, rotulo: 'Dashboard' },
    { icone: List, rotulo: 'Lista' },
    { icone: SquaresFour, rotulo: 'Kanban' },
    { icone: ChartBar, rotulo: 'Relatórios' },
    { icone: ClockCounterClockwise, rotulo: 'Histórico' },
    { icone: Gear, rotulo: 'Configuração' },
  ]

  return (
    <div style={{
      background: 'rgba(99,102,241,.04)',
      border: '1px solid rgba(99,102,241,.18)',
      borderRadius: 16,
      padding: '20px 22px 22px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 16px',
      }}>
        Como funcionam as permissões granulares
      </p>

      <p style={{ ...MANUAL_ESTILO_CORPO, margin: '0 0 16px', fontSize: '.82rem' }}>
        Cada Produto Gravity contratado pela organização aparece como um bloco na aba Permissões.
        Por linha, você define se o usuário só consulta ou também altera dados naquela visualização.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
        <div style={{
          ...cardBase,
          background: 'linear-gradient(145deg, rgba(99,102,241,.1) 0%, rgba(99,102,241,.03) 100%)',
          borderColor: 'rgba(129,140,248,.28)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(99,102,241,.15)', border: '1px solid rgba(129,140,248,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Eye size={18} weight="duotone" color="#818cf8" />
            </span>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '.88rem', color: '#c7d2fe' }}>Ver</p>
          </div>
          <p style={{ margin: 0, fontSize: '.76rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
            O usuário acessa a tela e consulta informações, sem alterar registros.
            Use quando a pessoa só precisa acompanhar ou extrair dados.
          </p>
        </div>

        <div style={{
          ...cardBase,
          background: 'linear-gradient(145deg, rgba(52,211,153,.08) 0%, rgba(52,211,153,.02) 100%)',
          borderColor: 'rgba(52,211,153,.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PencilSimple size={18} weight="duotone" color="#34d399" />
            </span>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '.88rem', color: '#a7f3d0' }}>Editar</p>
          </div>
          <p style={{ margin: 0, fontSize: '.76rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
            Inclui tudo de Ver e permite criar, alterar ou excluir naquela visualização.
            Marque só onde a operação exige mudança de dados.
          </p>
        </div>
        </div>

        <div style={{
          ...cardBase,
          background: 'rgba(148,163,184,.04)',
        }}>
        <p style={{
          margin: '0 0 12px', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.05em',
          textTransform: 'uppercase', color: '#94a3b8',
        }}>
          Visualizações padrão por produto
        </p>
        <p style={{ margin: '0 0 14px', fontSize: '.76rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
          Cada produto segue o mesmo padrão de telas. Na grade, localize o produto (ex.: Pedido, Smart Docs)
          e marque Ver ou Editar na linha correspondente: basta selecionar o local indicado.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {telasPadrao.map(({ icone: Icone, rotulo }) => (
            <span key={rotulo} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(99,102,241,.08)', border: '1px solid rgba(129,140,248,.22)',
              fontSize: '.72rem', fontWeight: 600, color: '#c7d2fe',
            }}>
              <Icone size={14} weight="duotone" color="#818cf8" />
              {rotulo}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <ManualFiguraScreenshot
            src={SCREENSHOT_USUARIOS_PERMISSAO_MODAL}
            alt="Modal Editar usuário — aba Permissões com colunas Ver e Editar"
          />
        </div>
        </div>
      </div>
    </div>
  )
}

function ManualBlocoFornecedorInteracao() {
  const itemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'rgba(8,12,24,.25)',
    border: '1px solid rgba(148,163,184,.12)',
  }

  return (
    <div style={{
      marginTop: 18,
      padding: '16px 18px 18px',
      borderRadius: 14,
      background: 'linear-gradient(145deg, rgba(52,211,153,.08) 0%, rgba(52,211,153,.02) 100%)',
      border: '1px solid rgba(52,211,153,.22)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Handshake size={18} weight="duotone" color="#34d399" />
        <p style={{
          margin: 0, fontSize: '.72rem', fontWeight: 800, letterSpacing: '.06em',
          textTransform: 'uppercase', color: '#6ee7b7',
        }}>
          Fornecedor: como interage com a organização
        </p>
      </div>
      <p style={{ fontSize: '.78rem', color: MANUAL_CORPO_70, margin: '0 0 14px', lineHeight: 1.55 }}>
        O parceiro pode operar com a organização de duas formas. O Master escolhe qual modelo usar;
        <strong style={{ color: '#a7f3d0' }}> o acesso à plataforma não é obrigatório</strong>.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        <div style={itemBase}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(99,102,241,.12)', border: '1px solid rgba(129,140,248,.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Desktop size={18} weight="duotone" color="#818cf8" />
          </span>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.8rem', color: '#e2e8f0' }}>
              Com usuário na plataforma
            </p>
            <p style={{ margin: 0, fontSize: '.74rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
              O Master convida um usuário tipo Fornecedor. A pessoa acessa as telas liberadas
              {' '}(<ManualTextoRichLinha texto={`{{link:/university-gravity/docs/configurador/workspaces|workspaces}} e ${LINK_MANUAL_PERMISSOES} granulares`} />).
            </p>
          </div>
        </div>
        <div style={itemBase}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EnvelopeSimple size={18} weight="duotone" color="#34d399" />
          </span>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.8rem', color: '#e2e8f0' }}>
              Só por e-mail, sem acesso
            </p>
            <p style={{ margin: 0, fontSize: '.74rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
              Se o Master preferir, não há convite nem login. As interações ocorrem por respostas
              de e-mail, fora do Gravity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const PAPEL_FORNECEDOR_INFO: {
  label: string
  descricao: string
  cor: string
  icone: React.ReactNode
}[] = [
  { label: 'Fabricante', descricao: 'Quem produz a mercadoria negociada na operação.', cor: '#fbbf24', icone: <Factory weight="duotone" size={16} /> },
  { label: 'Agente de Carga', descricao: 'Logística internacional: contrata frete, consolida cargas e coordena o embarque.', cor: '#c084fc', icone: <UserGear weight="duotone" size={16} /> },
  { label: 'Despachante Aduaneiro', descricao: 'Representante legal da empresa perante a Receita: desembaraço e compliance aduaneiro.', cor: '#f472b6', icone: <ShieldStar weight="duotone" size={16} /> },
  { label: 'Armador', descricao: 'Companhia marítima que opera o navio e o espaço no porão/contêiner.', cor: '#22d3ee', icone: <Boat weight="duotone" size={16} /> },
  { label: 'Cia Aérea', descricao: 'Transporte aéreo de carga: AWB e embarques urgentes.', cor: '#818cf8', icone: <Airplane weight="duotone" size={16} /> },
  { label: 'Transportadora Rodoviária', descricao: 'Coleta e entrega no trecho nacional ou internacional por rodovia.', cor: '#a3e635', icone: <TruckTrailer weight="duotone" size={16} /> },
  { label: 'Armazém Alfandegado', descricao: 'Recinto alfandegado: mercadoria sob controle aduaneiro antes do desembaraço.', cor: '#fb923c', icone: <Warehouse weight="duotone" size={16} /> },
  { label: 'Armazém Nacional', descricao: 'Armazenagem geral fora de regime alfandegado.', cor: '#fdba74', icone: <Warehouse weight="duotone" size={16} /> },
  { label: 'Banco', descricao: 'Instituição financeira em operações de comércio exterior.', cor: '#10b981', icone: <Bank weight="duotone" size={16} /> },
  { label: 'Seguradora / Corretora', descricao: 'Seguro de carga internacional ou corretagem de câmbio.', cor: '#06b6d4', icone: <ShieldCheck weight="duotone" size={16} /> },
]

function ManualInfograficoPapeisFornecedor() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 6px',
      }}>
        Outros papéis COMEX: o que é cada um
      </p>
      <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 16px', lineHeight: 1.55 }}>
        Marque na aba Papéis COMEX todos os papéis que o terceiro exerce. A plataforma usa esses flags para filtrar dropdowns, convites e cotações.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {PAPEL_FORNECEDOR_INFO.map((papel) => (
          <div
            key={papel.label}
            style={{
              background: `${papel.cor}0d`,
              border: `1px solid ${papel.cor}33`,
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <p style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '.72rem', fontWeight: 700, color: papel.cor, margin: '0 0 6px',
            }}>
              {papel.icone}
              {papel.label}
            </p>
            <p style={{ fontSize: '.7rem', color: MANUAL_CORPO_70, margin: 0, lineHeight: 1.45 }}>
              {papel.descricao}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16,
        padding: '14px 16px',
        background: 'rgba(99,102,241,.06)',
        border: '1px solid rgba(99,102,241,.2)',
        borderRadius: 12,
      }}>
        <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 10px', lineHeight: 1.6 }}>
          <strong style={{ color: '#a5b4fc' }}>Uma empresa, vários papéis.</strong> O mesmo CNPJ ou TIN pode ser Despachante e Agente de Carga: marque os dois no mesmo cadastro. Os chips na listagem mostram a combinação (ex.: Despachante + Agente).
        </p>
        <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#a5b4fc' }}>Por que cadastrar bem?</strong> Contato correto para comunicações e convites · seleção em cotações de frete e câmbio · vínculo de usuários tipo Fornecedor · registros consistentes em Pedido, Processo e documentos legais.
        </p>
      </div>
    </div>
  )
}

function ManualInfograficoTiposUsuario() {
  const tipos = [
    {
      icone: Crown,
      cor: '#fbbf24',
      titulo: 'Master',
      subtitulo: 'Administrador da Empresa e todos os Workspaces',
      pilulas: ['Acesso total: sem camadas', 'Convida e edita usuários', 'Todos os workspaces e Produtos Gravity'],
    },
    {
      icone: User,
      cor: '#818cf8',
      titulo: 'Standard',
      subtitulo: 'Colaborador interno da Organização',
      pilulas: ['1º Workspaces habilitados', '2º Permissões granulares', 'Só opera onde o Master liberar'],
    },
    {
      icone: Handshake,
      cor: '#34d399',
      titulo: 'Fornecedor',
      subtitulo: 'Parceiro externo',
      pilulas: ['1º Workspaces habilitados', '2º Permissões sempre granulares', 'Plataforma opcional: ou só e-mail'],
    },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
          Tipos de usuário na organização
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={{
          background: 'rgba(251,191,36,.05)',
          border: '1px solid rgba(251,191,36,.18)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Quem gerencia a conta
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              ...INFO_ORG,
              width: '100%',
              background: 'rgba(251,191,36,.1)',
              borderColor: 'rgba(251,191,36,.3)',
              color: '#fde68a',
            }}>
              <Crown size={18} weight="duotone" style={{ marginBottom: 4, color: '#fbbf24' }} />
              <div>Master</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>
                Primeiro usuário da organização: sempre Master
              </div>
            </div>
            <div
              role="presentation"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                gap: 5,
                padding: '4px 0 2px',
              }}
            >
              <div style={{
                width: 1,
                height: 14,
                borderRadius: 1,
                background: 'linear-gradient(180deg, rgba(251,191,36,.35), rgba(251,191,36,.08))',
              }} />
              <span style={{
                fontSize: '.72rem',
                fontWeight: 600,
                color: '#e7d4a8',
                letterSpacing: '.01em',
                lineHeight: 1.4,
                textAlign: 'center',
              }}>
                convida e define acesso
              </span>
              <ArrowDown size={13} weight="bold" color="rgba(251, 191, 36, 0.45)" aria-hidden />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div style={INFO_WS}>
                <User size={14} weight="duotone" style={{ marginBottom: 4, color: '#818cf8' }} />
                <div>
                  Standard
                  <br />
                  Equipe interna
                </div>
              </div>
              <div style={INFO_WS}>
                <Handshake size={14} weight="duotone" style={{ marginBottom: 4, color: '#34d399' }} />
                <div>
                  Fornecedor
                  <br />
                  Parceiro externo
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Só o Master convida pessoas e altera patentes, permissões e{' '}
              <Link to={LINK_DOC_WORKSPACES} style={MANUAL_LINK_STYLE}>workspaces</Link>
              {' '}de outros usuários.
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(99,102,241,.06)',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#818cf8', margin: '0 0 14px', letterSpacing: '.04em' }}>
            O que muda entre os tipos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tipos.map(({ icone: Icone, cor, titulo, subtitulo, pilulas }) => (
              <div
                key={titulo}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${cor}55`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,.12)'
                  e.currentTarget.style.transform = 'none'
                }}
                style={{
                  background: 'rgba(8,12,24,.2)',
                  border: '1px solid rgba(148,163,184,.12)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  transition: 'transform .18s ease, border-color .18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icone size={16} weight="duotone" style={{ color: cor, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#e2e8f0' }}>{titulo}</div>
                    <div style={{ fontSize: '.68rem', color: MANUAL_CORPO_70 }}>
                      <ManualTextoRichLinha texto={textoComLinkWorkspaces(subtitulo)} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {pilulas.map((texto) => (
                    <span key={texto} style={{
                      ...INFO_PILULA,
                      fontSize: '.66rem',
                      padding: '4px 8px',
                    }}>
                      <ManualTextoRichLinha texto={textoComLinkWorkspaces(texto)} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '12px 0 0', lineHeight: 1.5 }}>
            Standard e Fornecedor enxergam somente a si mesmos na lista de Usuários. O Master vê toda a organização.
          </p>
        </div>
      </div>

        <ManualTabelaComparativaTiposUsuario />
      </div>

      <ManualBlocoFornecedorInteracao />

      <ManualParagrafo
        texto={`O **Master** configura cada **Standard** e **Fornecedor** em três passos: quais ${textoComLinkWorkspaces('workspaces')} a pessoa acessa, quais **permissões** (telas e ações) tem nesses ambientes e qual ou quais **produtos Gravity** ficam liberados.`}
        marginBottom={0}
      />

      <ManualCamadaAcessoFluxo />
    </div>
  )
}

const HISTORICO_TABELA_TH: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'left',
  fontSize: '.66rem',
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(148,163,184,.15)',
}

const HISTORICO_TABELA_TD: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: '.76rem',
  lineHeight: 1.45,
  verticalAlign: 'top',
  borderBottom: '1px solid rgba(148,163,184,.08)',
  color: '#e2e8f0',
}

function ManualHistoricoTabelaSecao({ secao }: { secao: HistoricoCatalogoSecao }) {
  const minWidth = Math.max(480, secao.colunas.length * 110)

  return (
    <div style={{
      marginTop: 18,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: 0, padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        {secao.titulo}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {secao.colunas.map((col) => (
                <th
                  key={col.chave}
                  style={{
                    ...HISTORICO_TABELA_TH,
                    width: col.largura,
                    color: col.destaque ? '#a5b4fc' : '#94a3b8',
                    background: col.destaque ? 'rgba(99,102,241,.08)' : 'transparent',
                  }}
                >
                  {col.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {secao.linhas.map((linha, i) => (
              <tr
                key={`${secao.titulo}-${i}`}
                style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent' }}
              >
                {secao.colunas.map((col) => {
                  const valor = linha[col.chave] ?? ''
                  const ehNum = col.chave === 'num'
                  const ehTecnico = col.chave === 'acao' || col.chave === 'campo' || col.chave === 'gatilho' || col.chave === 'prefixo'
                  const ehUsuario = col.chave === 'traducao'
                  return (
                    <td
                      key={col.chave}
                      style={{
                        ...HISTORICO_TABELA_TD,
                        fontWeight: ehNum || col.destaque || ehUsuario ? 600 : 400,
                        color: ehNum ? '#94a3b8' : '#e2e8f0',
                        background: col.destaque ? 'rgba(99,102,241,.04)' : undefined,
                        fontFamily: ehTecnico
                          ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                          : undefined,
                        fontSize: ehTecnico ? '.7rem' : '.76rem',
                      }}
                    >
                      <ManualTextoRich texto={valor} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {secao.notaRodape && (
        <p style={{
          margin: 0,
          padding: '10px 16px 14px',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: MANUAL_CORPO_70,
          borderTop: '1px solid rgba(148,163,184,.08)',
        }}>
          <ManualTextoRich texto={secao.notaRodape} />
        </p>
      )}
    </div>
  )
}

function ManualCatalogoHistoricoCompleto() {
  return (
    <div style={{ marginTop: 8, marginBottom: 8 }}>
      {HISTORICO_CATALOGO_SECOES.map((secao) => (
        <ManualHistoricoTabelaSecao key={secao.titulo} secao={secao} />
      ))}
    </div>
  )
}

const COMPARATIVO_TIPOS_USUARIO: {
  criterio: string
  master: string
  standard: string
  fornecedor: string
}[] = [
  {
    criterio: 'Camadas de acesso',
    master: 'Nenhuma: acesso direto a tudo',
    standard: '1º workspaces habilitados · 2º permissões granulares por produto',
    fornecedor: '1º workspaces habilitados · 2º permissões granulares (obrigatórias)',
  },
  {
    criterio: 'O que é',
    master: 'Administrador da Empresa e todos os Workspaces',
    standard: 'Colaborador interno da empresa que contratou Gravity (Organização)',
    fornecedor: 'Usuário de empresa parceira (frete, câmbio, despacho etc.)',
  },
  {
    criterio: 'Escopo',
    master: 'Toda a organização e todos os workspaces',
    standard: 'Apenas o que o Master liberar',
    fornecedor: 'Apenas recursos explicitamente liberados',
  },
  {
    criterio: 'Workspaces',
    master: 'Acesso automático a todos: sem vínculo manual',
    standard: 'Somente unidades marcadas: sem marcação, não entra no workspace',
    fornecedor: 'Somente unidades marcadas + empresa fornecedora vinculada',
  },
  {
    criterio: 'Permissões granulares',
    master: 'Não se aplica: bypass total',
    standard: 'Ver e Editar por produto (Dashboard, Lista, Kanban…): definidas pelo Master',
    fornecedor: 'Obrigatórias: sempre Ver/Editar explícito por produto',
  },
  {
    criterio: 'Configurador',
    master: 'Acesso total às áreas da organização',
    standard: 'Somente áreas com permissão marcada',
    fornecedor: 'Somente áreas com permissão marcada',
  },
  {
    criterio: 'Produtos Gravity',
    master: 'Todos os produtos contratados pela organização',
    standard: 'Conforme permissões granulares por produto',
    fornecedor: 'Conforme permissões granulares: sempre obrigatórias',
  },
  {
    criterio: 'Convida usuários',
    master: 'Sim: Master, Standard e Fornecedor',
    standard: 'Não',
    fornecedor: 'Não',
  },
  {
    criterio: 'Lista de Usuários',
    master: 'Vê todos os usuários da organização',
    standard: 'Vê somente a si',
    fornecedor: 'Vê somente a si',
  },
  {
    criterio: 'Acesso à plataforma',
    master: ', ',
    standard: 'Sempre: opera nas telas liberadas pelo Master',
    fornecedor: 'Opcional: usuário nas telas ou só interação por e-mail, sem login',
  },
  {
    criterio: 'Quem atribui',
    master: 'Sistema: primeiro usuário da conta',
    standard: 'Master da organização',
    fornecedor: 'Master da organização',
  },
]

function ManualTabelaComparativaTiposUsuario() {
  const thBase: React.CSSProperties = {
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: '.66rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(148,163,184,.15)',
  }

  const tdBase: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: '.76rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
  }

  return (
    <div style={{
      marginTop: 20,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(251,191,36,.06) 0%, rgba(99,102,241,.05) 45%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: 0, padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        Comparativo: Master × Standard × Fornecedor
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, color: '#94a3b8', width: '18%' }}>Critério</th>
              <th style={{
                ...thBase,
                color: '#fde68a',
                background: 'rgba(251,191,36,.08)',
                width: '27%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={14} weight="duotone" />
                  Master
                </span>
              </th>
              <th style={{
                ...thBase,
                color: '#a5b4fc',
                background: 'rgba(99,102,241,.08)',
                width: '27%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} weight="duotone" />
                  Standard
                </span>
              </th>
              <th style={{
                ...thBase,
                color: '#6ee7b7',
                background: 'rgba(52,211,153,.06)',
                width: '28%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Handshake size={14} weight="duotone" />
                  Fornecedor
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVO_TIPOS_USUARIO.map((linha, i) => (
              <tr
                key={linha.criterio}
                style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent' }}
              >
                <td style={{ ...tdBase, fontWeight: 600, color: '#94a3b8' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.criterio)} />
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(251,191,36,.04)' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.master)} />
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(99,102,241,.04)' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.standard)} />
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(52,211,153,.03)' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.fornecedor)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const COMPARATIVO_ORG_WS: { criterio: string; organizacao: string; workspace: string }[] = [
  {
    criterio: 'O que é',
    organizacao: 'Empresa que contrata o Gravity',
    workspace: 'Matriz e filial do importador/exportador, ou cliente de despachante e agente',
  },
  {
    criterio: 'Quantidade',
    organizacao: 'Uma por contrato / conta Gravity',
    workspace: 'Uma ou várias por organização — o usuário Master decide quantas criar',
  },
  {
    criterio: 'Como nasce',
    organizacao: 'Primeiro acesso do usuário Master: no onboarding, informa nome da empresa e CNPJ',
    workspace: 'Usuário Master cria novo workspace em Configurador → Workspaces',
  },
  {
    criterio: 'Identidade legal',
    organizacao: 'CNPJ da empresa contratante (bloqueado após onboarding)',
    workspace: 'CNPJ próprio da filial ou do cliente, quando aplicável',
  },
  {
    criterio: 'Registros operacionais',
    organizacao: 'Não concentra operações: apenas gestão da conta (contrato, usuários, assinaturas)',
    workspace: 'DUIMP, Pedidos, Cotações de frete, Câmbio e demais registros ficam sempre no workspace',
  },
  {
    criterio: 'Faturamento',
    organizacao: 'Assinaturas, planos e cobrança da conta',
    workspace: 'Não fatura: consome produtos da organização',
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
        Comparativo: Organização × Workspace
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

const MANUAL_ESTILO_BOTAO_SUMARIO: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 0',
  textAlign: 'left',
  lineHeight: 1.4,
  borderRadius: 6,
  transition: 'color .15s, background .15s',
}

function ManualSumarioBloco({
  entradas,
  totalCapitulos,
  totalSubcapitulos,
  gruposAbertos,
  onToggleGrupo,
  onExpandirGrupo,
  scrollToItem,
  todosAbertos,
  toggleTodos,
}: {
  entradas: DocEntradaSumarioManual[]
  totalCapitulos: number
  totalSubcapitulos: number
  gruposAbertos: Record<number, boolean>
  onToggleGrupo: (secaoNum: number) => void
  onExpandirGrupo: (secaoNum: number) => void
  scrollToItem: (item: DocItemSumarioManual) => void
  todosAbertos: boolean
  toggleTodos: () => void
}) {
  const leitura = useContext(ManualLeituraContext)
  const irParaItem = (item: DocItemSumarioManual) => {
    if (item.subitem) onExpandirGrupo(item.secaoAcordeao)
    scrollToItem(item)
  }

  return (
    <>
      <div style={{
        background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
        borderRadius: 14, padding: '20px 26px', marginBottom: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}>
          <p style={{
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em',
            color: 'var(--ws-muted,#64748b)', textTransform: 'uppercase', margin: 0,
          }}>
            Sumário
          </p>
          <span style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 500 }}>
            {totalCapitulos} capítulos
            {totalSubcapitulos > 0 ? ` / ${totalSubcapitulos} subcapítulos` : ''}
            {leitura?.ativo && leitura.totalRastreaveis > 0 ? ` · ${leitura.totalLidos} lidos` : ''}
          </span>
        </div>

        {leitura?.ativo && leitura.totalRastreaveis > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              height: 4,
              borderRadius: 2,
              background: 'rgba(148,163,184,.15)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${leitura.percentual}%`,
                height: '100%',
                borderRadius: 2,
                background: '#6366f1',
                transition: 'width .25s ease',
              }} />
            </div>
            <p style={{ fontSize: '.68rem', color: '#64748b', margin: '6px 0 0' }}>
              {leitura.percentual}% concluído
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          fontSize: '.85rem',
        }}>
          {entradas.map(({ capitulo, subitens }) => {
            const temSubitens = (subitens?.length ?? 0) > 0
            const grupoAberto = gruposAbertos[capitulo.secaoAcordeao] === true
            const estadoCap = leitura?.estadoCapitulo(capitulo.secaoAcordeao) ?? 'nao_lido'
            const totalSubs = subitens?.length ?? 0
            const idsSubs = subitens?.map(s => s.elementoScroll).filter((id): id is string => Boolean(id)) ?? []
            const lidosSubs = idsSubs.filter(id => leitura?.isLido(id)).length
            const rotuloContagemSubs = leitura?.ativo && lidosSubs > 0
              ? `${lidosSubs}/${totalSubs} subcapítulos`
              : `${totalSubs} subcapítulos`

            return (
              <div key={`${capitulo.rotulo}-${capitulo.titulo}`}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}>
                  <span style={{
                    ...MANUAL_ESTILO_SECAO_NUMERO,
                    minWidth: 22,
                    color: estadoCap === 'lido' ? '#64748b' : '#818cf8',
                    lineHeight: 1.35,
                    paddingTop: 2,
                  }}>
                    {capitulo.rotulo}.
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}>
                      {estadoCap === 'lido' && (
                        <CheckCircle size={14} weight="fill" color="#22c55e" style={{ flexShrink: 0 }} />
                      )}
                      {estadoCap === 'parcial' && (
                        <CircleHalf size={14} weight="fill" color="#818cf8" style={{ flexShrink: 0 }} />
                      )}
                      <button
                        type="button"
                        onClick={() => irParaItem(capitulo)}
                        style={{
                          ...MANUAL_ESTILO_BOTAO_SUMARIO,
                          color: estadoCap === 'lido' ? '#64748b' : '#c7d2fe',
                          fontWeight: 600,
                          flex: 1,
                          minWidth: 0,
                          opacity: estadoCap === 'lido' ? 0.75 : 1,
                        }}
                      >
                        {capitulo.titulo}
                      </button>
                    </div>

                    {temSubitens && (
                      <button
                        type="button"
                        onClick={() => onToggleGrupo(capitulo.secaoAcordeao)}
                        aria-expanded={grupoAberto}
                        aria-label={grupoAberto
                          ? `Recolher ${totalSubs} subcapítulos de ${capitulo.titulo}`
                          : `Expandir ${totalSubs} subcapítulos de ${capitulo.titulo}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 4,
                          background: 'rgba(148,163,184,.05)',
                          border: '1px solid rgba(148,163,184,.12)',
                          borderRadius: MANUAL_RAIO_CHIP,
                          cursor: 'pointer',
                          color: '#a5b4fc',
                          fontSize: '.6rem',
                          fontWeight: 700,
                          letterSpacing: '.02em',
                          padding: '3px 8px',
                          lineHeight: 1.2,
                        }}
                      >
                        <CaretDown
                          weight="bold"
                          size={10}
                          style={{
                            flexShrink: 0,
                            transform: grupoAberto ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: 'transform .2s',
                          }}
                        />
                        <span>{rotuloContagemSubs}</span>
                      </button>
                    )}

                    {temSubitens && grupoAberto && (
                      <div style={{
                        marginTop: 6,
                        paddingLeft: 12,
                        borderLeft: '2px solid rgba(99,102,241,.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}>
                    {subitens!.map(sub => {
                      const subLido = sub.elementoScroll ? leitura?.isLido(sub.elementoScroll) : false
                      return (
                      <div
                        key={`${sub.rotulo}-${sub.titulo}`}
                        style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}
                      >
                        <span style={{
                          ...MANUAL_ESTILO_SECAO_NUMERO,
                          minWidth: 44,
                          fontSize: '.72rem',
                          color: '#64748b',
                          flexShrink: 0,
                        }}>
                          {sub.rotulo}
                        </span>
                        {subLido && (
                          <CheckCircle size={12} weight="fill" color="#22c55e" style={{ flexShrink: 0 }} />
                        )}
                        <button
                          type="button"
                          onClick={() => irParaItem(sub)}
                          style={{
                            ...MANUAL_ESTILO_BOTAO_SUMARIO,
                            color: subLido ? '#64748b' : '#94a3b8',
                            fontWeight: 500,
                            fontSize: '.8rem',
                            minWidth: 0,
                            opacity: subLido ? 0.75 : 1,
                          }}
                        >
                          {sub.titulo}
                        </button>
                      </div>
                    )})}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
    </>
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
  secoesAbertasInicial,
  manualSlug,
}: {
  secao: DocSecao
  metadados: DocManualMetadado[]
  /** Seções expandidas ao carregar (padrão: só a intro §01). */
  secoesAbertasInicial?: number[]
  /** Slug do manual para persistência de leitura (ex.: `pedido`). */
  manualSlug?: string
}) {
  const location = useLocation()
  const slug = manualSlug ?? extrairSlugManualDaRota(location.pathname)
  const leituraAtivo = Boolean(slug)
  const idsRastreaveis = useMemo(() => montarIdsRastreaveisLeituraManual(secao), [secao])
  const fluxoPorSecao = useMemo(() => {
    const map = new Map<number, DocFluxo>()
    secao.fluxos?.forEach((fluxo, i) => map.set(i + 2, fluxo))
    return map
  }, [secao.fluxos])
  const [lidos, setLidos] = useState<Set<string>>(() => (slug ? carregarLidosManual(slug) : new Set()))
  useEffect(() => {
    if (slug) setLidos(carregarLidosManual(slug))
  }, [slug])
  const persistirLidos = useCallback((next: Set<string>) => {
    setLidos(next)
    if (slug) salvarLidosManual(slug, next)
  }, [slug])
  const toggleCapitulo = useCallback((secaoNum: number) => {
    if (!slug) return
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
  }, [slug, fluxoPorSecao, lidos, persistirLidos])
  const togglePasso = useCallback((id: string) => {
    if (!slug) return
    const next = new Set(lidos)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    persistirLidos(next)
  }, [slug, lidos, persistirLidos])
  const leituraCtx = useMemo<ManualLeituraContextValue>(() => ({
    ativo: leituraAtivo,
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
  }), [leituraAtivo, fluxoPorSecao, lidos, toggleCapitulo, togglePasso, idsRastreaveis])
  const itensSumario = montarItensSumarioManual(secao)
  const entradasSumario = useMemo(() => montarEntradasSumarioManual(secao), [secao])
  const totalCapitulosSumario = entradasSumario.length
  const totalSubcapitulosSumario = entradasSumario.reduce(
    (acc, e) => acc + (e.subitens?.length ?? 0),
    0,
  )
  const todosNums = itensSumario.flatMap(i => (i.num != null ? [i.num] : []))
  const [abertos, setAbertos] = useState<number[]>(secoesAbertasInicial ?? [])
  const [gruposSumarioAbertos, setGruposSumarioAbertos] = useState<Record<number, boolean>>({})
  const [subtopicosAbertos, setSubtopicosAbertos] = useState<Record<string, number[]>>({})
  const abrirSubtopico = useCallback((prefix: string, num: number) => {
    setSubtopicosAbertos(prev => {
      const atual = prev[prefix] ?? []
      if (atual.includes(num)) return prev
      return { ...prev, [prefix]: [...atual, num] }
    })
  }, [])
  const toggleSubtopico = useCallback((prefix: string, num: number) => {
    setSubtopicosAbertos(prev => {
      const atual = prev[prefix] ?? []
      return {
        ...prev,
        [prefix]: atual.includes(num) ? atual.filter(n => n !== num) : [...atual, num],
      }
    })
  }, [])
  const subtopicosCtx = useMemo<ManualSubtopicosContextValue>(() => ({
    abertosPorPrefix: subtopicosAbertos,
    toggle: toggleSubtopico,
    abrir: abrirSubtopico,
  }), [subtopicosAbertos, toggleSubtopico, abrirSubtopico])
  const todosAbertos = todosNums.length > 0 && todosNums.every(n => abertos.includes(n))
  const toggle = (n: number) => setAbertos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTodos = () => setAbertos(todosAbertos ? [] : [...todosNums])
  const toggleGrupoSumario = useCallback((secaoNum: number) => {
    setGruposSumarioAbertos(prev => ({ ...prev, [secaoNum]: !prev[secaoNum] }))
  }, [])
  const expandirGrupoSumario = useCallback((secaoNum: number) => {
    setGruposSumarioAbertos(prev => (prev[secaoNum] ? prev : { ...prev, [secaoNum]: true }))
  }, [])
  const { scrollToSecao, scrollToItem } = useManualSumarioScroll(
    abertos,
    setAbertos,
    abrirSubtopico,
    subtopicosAbertos,
  )

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    const secaoNum = numeroSecaoDeHashManual(location.hash)
    if (secaoNum != null) scrollToSecao(secaoNum)
    if (!hash) return
    const item = itensSumario.find(i => i.elementoScroll === hash)
    if (item) {
      if (item.subitem) expandirGrupoSumario(item.secaoAcordeao)
      scrollToItem(item)
      return
    }
    const passo = parseElementoPassoManual(hash)
    if (!passo) return
    abrirSubtopico(passo.prefix, passo.num)
    const fluxIdx = secao.fluxos?.findIndex(f => f.ancoraPassosPrefix === passo.prefix) ?? -1
    if (fluxIdx < 0) return
    const secNum = fluxIdx + 2
    expandirGrupoSumario(secNum)
    if (!abertos.includes(secNum)) {
      setAbertos(prev => (prev.includes(secNum) ? prev : [...prev, secNum]))
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => rolarParaSecaoManual(hash))
    })
    return () => cancelAnimationFrame(frame)
  }, [scrollToSecao, scrollToItem, abrirSubtopico, expandirGrupoSumario, location.pathname, location.hash, itensSumario, secao.fluxos, abertos])

  return (
    <ManualScrollSecaoContext.Provider value={scrollToSecao}>
    <ManualSubtopicosContext.Provider value={subtopicosCtx}>
    <ManualLeituraContext.Provider value={leituraCtx}>
    <div style={{ maxWidth: '100%', color: 'var(--ws-text,#f1f5f9)' }}>
      <span style={{
        display: 'inline-block',
        background: 'rgba(148,163,184,.05)',
        color: '#818cf8',
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.1em',
        padding: '6px 12px',
        borderRadius: MANUAL_RAIO_CHIP,
        border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 16,
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          id="doc-sec-1"
          style={{
            ...MANUAL_ESTILO_ACORDEON_SECAO,
            border: `1px solid ${abertos.includes(1) ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
            borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: abertos.includes(1) ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
              padding: '16px 22px',
              color: 'var(--ws-text,#f1f5f9)',
              transition: 'background .15s',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(1)}
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
              <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(1).padStart(2, '0')}</span>
              <span style={{
                fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0,
                opacity: leituraCtx.ativo && leituraCtx.estadoCapitulo(1) === 'lido' ? 0.65 : 1,
              }}>{secao.titulo}</span>
            </button>
            {leituraCtx.ativo && (
              <ManualBotaoMarcarLido
                estado={leituraCtx.estadoCapitulo(1)}
                onToggle={() => leituraCtx.toggleCapitulo(1)}
                rotulo={secao.titulo}
              />
            )}
            <button
              type="button"
              onClick={() => toggle(1)}
              aria-label={abertos.includes(1) ? `Recolher ${secao.titulo}` : `Expandir ${secao.titulo}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: '#818cf8',
                flexShrink: 0,
                fontSize: '.9rem',
                lineHeight: 1,
              }}
            >
              <span style={{
                display: 'inline-block',
                transform: abertos.includes(1) ? 'rotate(180deg)' : 'none',
                transition: 'transform .25s',
              }}>▾</span>
            </button>
          </div>
          {abertos.includes(1) && (
            <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
              <ManualSecaoIntro secao={secao} />
            </div>
          )}
        </div>

        {secao.fluxos?.map((fluxo, i) => {
          const num = i + 2
          const aberto = abertos.includes(num)
          const estadoCap = leituraCtx.ativo ? leituraCtx.estadoCapitulo(num) : 'nao_lido'
          const idsSubs = idsPassosFluxo(fluxo)
          const lidosSubs = idsSubs.filter(id => leituraCtx.isLido(id)).length
          const totalSubs = fluxo.passosVisuais?.length ?? 0
          const rotuloBadgeSubs = leituraCtx.ativo && lidosSubs > 0 && lidosSubs < idsSubs.length
            ? `${lidosSubs}/${totalSubs} subtópicos`
            : `${totalSubs} subtópicos`
          return (
            <div
              key={`${num}-${fluxo.titulo}`}
              id={`doc-sec-${num}`}
              style={{
                ...MANUAL_ESTILO_ACORDEON_SECAO,
                border: `1px solid ${aberto ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
                borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: aberto ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
                  padding: '16px 22px',
                  color: 'var(--ws-text,#f1f5f9)',
                  transition: 'background .15s',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(num)}
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
                  <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(num).padStart(2, '0')}</span>
                  <span style={{
                    fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0,
                    opacity: estadoCap === 'lido' ? 0.65 : 1,
                  }}>{fluxo.titulo}</span>
                  {fluxo.mostrarMapaSubtopicosPassos && totalSubs > 0 && (
                    <span style={{
                      fontSize: '.62rem',
                      fontWeight: 700,
                      letterSpacing: '.04em',
                      color: '#a5b4fc',
                      background: 'rgba(148,163,184,.05)',
                      border: '1px solid rgba(148,163,184,.12)',
                      borderRadius: MANUAL_RAIO_CHIP,
                      padding: '6px 12px',
                      flexShrink: 0,
                    }}>
                      {rotuloBadgeSubs}
                    </span>
                  )}
                </button>
                {leituraCtx.ativo && (
                  <ManualBotaoMarcarLido
                    estado={estadoCap}
                    onToggle={() => leituraCtx.toggleCapitulo(num)}
                    rotulo={fluxo.titulo}
                  />
                )}
                <button
                  type="button"
                  onClick={() => toggle(num)}
                  aria-label={aberto ? `Recolher ${fluxo.titulo}` : `Expandir ${fluxo.titulo}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: '#818cf8',
                    flexShrink: 0,
                    fontSize: '.9rem',
                    lineHeight: 1,
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    transform: aberto ? 'rotate(180deg)' : 'none',
                    transition: 'transform .25s',
                  }}>▾</span>
                </button>
              </div>
              {aberto && (
                <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
                  <ManualSecaoFluxo fluxo={fluxo} numeroSecaoFluxo={num} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
    </ManualLeituraContext.Provider>
    </ManualSubtopicosContext.Provider>
    </ManualScrollSecaoContext.Provider>
  )
}

export function DocConfiguradorManual({ paginaSlug }: { paginaSlug: ConfiguradorManualSlug }) {
  const secao = paginaSlug === 'api-cockpit'
    ? DOC_API_COCKPIT_SECAO
    : secaoConfiguradorPorSlug(paginaSlug)
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

export type { DocSecao, DocPassoVisual, DocFluxo, DocTooltipKpi, DocColunaTabela, DocTopicoImagemLateral }

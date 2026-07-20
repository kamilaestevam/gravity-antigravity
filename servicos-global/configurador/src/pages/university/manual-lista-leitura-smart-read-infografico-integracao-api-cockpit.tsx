import React, { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Z_INDEX_MANUAL_AMPLIAR_TELA_CHEIA } from './manual-figura-screenshot'
import { ManualInfograficoMiniaturaSequenciaTelas } from './manual-university-infografico-sequencia-telas'
import { TELAS_INFOGRAFICO_INTEGRACAO_API_COCKPIT } from './manual-lista-leitura-smart-read-infografico-integracao-api-cockpit-telas'
import { AcademyLinkGuia } from './guia-academy-link'
import { ArrowsLeftRight, GearSix, GitBranch, MapPin, Sparkle, Target, UploadSimple } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const L = {
  cockpit: '{{link:/university-gravity/docs/api-cockpit|Configurador · API Cockpit}}',
  tokens: '{{link:/university-gravity/docs/api-cockpit|API Cockpit · Tokens}}',
  webhooks: '{{link:/university-gravity/docs/api-cockpit|API Cockpit · Webhooks}}',
  consumo: '{{link:/university-gravity/docs/api-cockpit|API Cockpit · Consumo}}',
  transacoes: '{{link:/university-gravity/docs/smart-read#manual-passo-lista-10|Lista · Transações API}}',
} as const

const FAIXAS = [
  {
    id: 'externo',
    rotulo: 'Sistema Externo',
    subtitulo: 'ERP · COMEX · WMS',
    cor: '#818cf8',
    fundo: 'rgba(99,102,241,.07)',
    borda: 'rgba(129,140,248,.22)',
    headerFundo: 'rgba(99,102,241,.16)',
  },
  {
    id: 'cockpit',
    rotulo: 'API Cockpit',
    subtitulo: 'Fronteira Gravity',
    cor: '#60a5fa',
    fundo: 'rgba(96,165,250,.06)',
    borda: 'rgba(96,165,250,.2)',
    headerFundo: 'rgba(96,165,250,.14)',
  },
  {
    id: 'smartdocs',
    rotulo: 'Smart Docs · IA',
    subtitulo: 'Processamento Gravity',
    cor: '#34d399',
    fundo: 'rgba(52,211,153,.06)',
    borda: 'rgba(52,211,153,.2)',
    headerFundo: 'rgba(52,211,153,.12)',
  },
] as const

type FormatoCaixa = 'inicio' | 'detalhe' | 'decisao'

type MetaPassoFluxo = {
  badge: string
  tipo?: 'paralelo' | 'feedback' | 'decisao' | 'fim'
  ramo?: 'sim' | 'nao'
  opcional?: boolean
}

/** Numeração — 1 criar token, 2 integrar; A1/A2 webhook (opcional); fluxo principal 3–13. */
const META_PASSO_FLUXO: Record<string, MetaPassoFluxo> = {
  token: { badge: '1' },
  'token-ext': { badge: '2' },
  'webhook-ext': { badge: 'A1', tipo: 'paralelo', opcional: true },
  webhook: { badge: 'A2', tipo: 'paralelo', opcional: true },
  pdf: { badge: '3' },
  post: { badge: '4' },
  valida: { badge: '5' },
  recebe: { badge: '6' },
  id: { badge: '↩', tipo: 'feedback' },
  ia: { badge: '7' },
  grava: { badge: '8' },
  decisao: { badge: 'Decisão', tipo: 'decisao' },
  'wh-post': { badge: '9', ramo: 'sim' },
  'wh-recv': { badge: '10', ramo: 'sim' },
  'get-wh': { badge: '11', ramo: 'sim' },
  'get-api': { badge: '9', ramo: 'nao' },
  resp: { badge: '12' },
  fim: { badge: '13', tipo: 'fim' },
}

type CaixaFluxo = {
  id: string
  faixa: 0 | 1 | 2
  linha: number
  texto: string
  onde: string
  como: string
  textoSufixo?: string
  formato?: FormatoCaixa
}

type SetaFluxo = {
  de: string
  para: string
  rotulo?: string
  tracejada?: boolean
  /** Rota pelo corredor esquerdo (evita cruzar cartão na mesma coluna). */
  desvio?: boolean
}

const CAIXAS: CaixaFluxo[] = [
  { id: 'inicio', faixa: 0, linha: 0, texto: 'Início', onde: '', como: '', formato: 'inicio' },
  {
    id: 'token-ext',
    faixa: 0,
    linha: 1,
    texto: '**Integrar** token na API',
    textoSufixo: '(SAP · TOTVS · Thomson…)',
    onde: 'Job ou exportação do **ERP/COMEX**',
    como: 'Guarde o **Bearer token** · **POST** multipart · persista **`id_leitura`** · **GET** resultado',
  },
  {
    id: 'token',
    faixa: 1,
    linha: 1,
    texto: '**Criar token** de API',
    textoSufixo: '(escrita + workspace)',
    onde: `${L.tokens} → **Novo token**`,
    como: 'Gere o token · escopo **Escrita** · defina validade e rate limit',
  },
  {
    id: 'webhook-ext',
    faixa: 0,
    linha: 2,
    texto: '**Publicar** endpoint HTTPS',
    onde: 'Servidor do **Sistema Externo**: middleware, API gateway ou iPaaS',
    como: 'Publique a **URL** do seu endpoint · responda **2xx** · o **secret** virá após o cadastro (A2)',
  },
  {
    id: 'webhook',
    faixa: 1,
    linha: 2,
    texto: '**Configurar** endpoint Webhook',
    onde: `${L.webhooks} → **+ Novo Webhook**`,
    como: 'Cadastre a **URL HTTPS** · o Cockpit gera o **secret**: guarde-o e valide **`X-Gravity-Signature`**',
  },
  {
    id: 'pdf',
    faixa: 0,
    linha: 3,
    texto: 'ERP emite o **documento do Pedido #4521**',
    onde: 'No **Sistema Externo**: exportação do pedido (ERP/COMEX)',
    como: 'Use o documento que **já emite hoje**: **PDF, imagem ou planilha** (até 50 MB)',
  },
  {
    id: 'post',
    faixa: 0,
    linha: 4,
    texto: '**POST** documento + token',
    onde: '**Sistema Externo** → API Smart Docs via **API Cockpit**',
    como: 'REST **POST** · header `Authorization: Bearer {token}` · multipart do **documento** (PDF, JPG/PNG, XML, CSV, XLS/XLSX)',
  },
  {
    id: 'valida',
    faixa: 1,
    linha: 4,
    texto: 'Valida token · roteia ao Smart Docs',
    onde: `${L.cockpit} · rota **/configurador/api-cockpit**`,
    como: 'Gateway da org autentica e encaminha ao workspace do token',
  },
  {
    id: 'recebe',
    faixa: 2,
    linha: 4,
    texto: 'Recebe arquivo',
    onde: 'Serviço **Smart Docs** do **workspace** ligado ao token',
    como: 'Entrada automática após roteamento pelo Cockpit',
  },
  {
    id: 'id',
    faixa: 0,
    linha: 5,
    texto: 'Recebe **id da leitura**',
    onde: 'Resposta JSON da API Smart Docs',
    como: 'Campo **`id_leitura`**: use nas consultas **GET** e no webhook',
  },
  {
    id: 'ia',
    faixa: 2,
    linha: 5,
    texto: '**IA** classifica documento · extrai campos',
    onde: 'Pipeline **Smart Docs · IA** do workspace',
    como: '**Análise + IA** (paridade com wizard **Nova Leitura**)',
  },
  {
    id: 'grava',
    faixa: 2,
    linha: 6,
    texto: 'Grava leitura · **Transações API**',
    onde: `${L.transacoes}`,
    como: 'Tag **`origem_leitura: API`** na lista do workspace',
  },
  {
    id: 'decisao',
    faixa: 1,
    linha: 7,
    texto: 'Retorno via **Webhook**?',
    onde: 'Decisão na implementação do **Sistema Externo**',
    como: '**Push** (webhook) vs **polling** (só API)',
    formato: 'decisao',
  },
  {
    id: 'wh-post',
    faixa: 2,
    linha: 8,
    texto: 'POST «leitura concluída» + id',
    onde: 'Gravity → URL cadastrada em **Webhooks**',
    como: `Gravity dispara **POST** na URL do ${L.webhooks}`,
  },
  {
    id: 'wh-recv',
    faixa: 0,
    linha: 8,
    texto: 'Endpoint recebe aviso',
    onde: '**URL HTTPS** cadastrada no Cockpit',
    como: 'Servidor do **Sistema Externo** recebe o POST de conclusão',
  },
  {
    id: 'get-wh',
    faixa: 0,
    linha: 9,
    texto: '**GET** dados completos (token)',
    onde: 'API Smart Docs · endpoint de leitura por id',
    como: `**GET** com token · auditar em ${L.consumo}`,
  },
  {
    id: 'get-api',
    faixa: 0,
    linha: 10,
    texto: '**GET** status/resultado (loop)',
    onde: 'API Smart Docs · mesmo **id_leitura**',
    como: `Polling até status concluído · log em ${L.consumo}`,
  },
  {
    id: 'resp',
    faixa: 2,
    linha: 9,
    texto: 'Retorna **campos extraídos**',
    onde: 'Resposta HTTP da API Smart Docs',
    como: 'JSON com campos do documento (nº pedido, itens, valores…)',
  },
  {
    id: 'fim',
    faixa: 0,
    linha: 11,
    texto: 'Atualiza **pedido / COMEX**',
    onde: '**Sistema Externo**: ERP/processo de destino',
    como: 'Persiste o resultado no pedido ou fluxo COMEX',
  },
]

/** Tramos do fluxo — ordem lógica ponta a ponta. */
const TRAMOS_FLUXO: SetaFluxo[] = [
  { de: 'inicio', para: 'token' },
  { de: 'token', para: 'token-ext' },
  { de: 'token-ext', para: 'webhook-ext', tracejada: true },
  { de: 'webhook-ext', para: 'webhook', tracejada: true },
  { de: 'token-ext', para: 'pdf', desvio: true },
  { de: 'pdf', para: 'post' },
  { de: 'post', para: 'valida' },
  { de: 'valida', para: 'recebe' },
  { de: 'valida', para: 'id', tracejada: true },
  { de: 'recebe', para: 'ia' },
  { de: 'ia', para: 'grava' },
  { de: 'grava', para: 'decisao' },
  { de: 'decisao', para: 'wh-post', rotulo: 'Sim' },
  { de: 'wh-post', para: 'wh-recv' },
  { de: 'wh-recv', para: 'get-wh' },
  { de: 'get-wh', para: 'resp' },
  { de: 'decisao', para: 'get-api', rotulo: 'Não' },
  { de: 'get-api', para: 'resp' },
  { de: 'resp', para: 'fim' },
]

/** Padrão visual — todos os cartões de detalhe compartilham estas medidas. */
const LARGURA_CARD = 410
const ALTURA_CARD = 152
const GAP_ENTRE_CARTOES = 48
const ALTURA_LINHA = ALTURA_CARD + GAP_ENTRE_CARTOES
const ALTURA_SECAO_TOPO_CARD = 96
const ALTURA_OQUE_CARD = 44
const PADDING_TOP = 12
const MEIO_CARD = LARGURA_CARD / 2
const INICIO_DIAM = 46
const INICIO_RAIO = INICIO_DIAM / 2
const INICIO_TOP = 8
const GAP_SETA = 4
const CARD_WRAPPER_TOP = 2
const RAIO_CURVA = 10

type BboxCaixa = {
  id: string
  cx: number
  cy: number
  top: number
  bottom: number
  left: number
  right: number
  col: number
  linha: number
  /** Centro do badge numerado (A1, A2, 1, 2…) no topo-esquerdo do cartão. */
  badgeX: number
  badgeY: number
}

function topoLinha(linha: number) {
  return PADDING_TOP + linha * ALTURA_LINHA
}

/** Corredor horizontal logo acima do badge da linha destino. */
const Y_CORREDOR_ANTES_BADGE = 26
/** Ponta da seta — pequeno respiro acima do badge. */
const Y_PONTA_ANTES_BADGE = 16

function pathSegmentoArredondado(
  pontos: Array<{ x: number; y: number }>,
  raio = RAIO_CURVA,
): string {
  if (pontos.length < 2) return ''
  if (pontos.length === 2) {
    const [a, b] = pontos
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  }

  let d = `M ${pontos[0].x} ${pontos[0].y}`
  for (let i = 1; i < pontos.length; i += 1) {
    const prev = pontos[i - 1]
    const curr = pontos[i]
    const next = pontos[i + 1]
    if (!next) {
      d += ` L ${curr.x} ${curr.y}`
      break
    }

    const dx1 = curr.x - prev.x
    const dy1 = curr.y - prev.y
    const dx2 = next.x - curr.x
    const dy2 = next.y - curr.y
    const len1 = Math.hypot(dx1, dy1)
    const len2 = Math.hypot(dx2, dy2)
    if (len1 < 1 || len2 < 1) {
      d += ` L ${curr.x} ${curr.y}`
      continue
    }

    const rr = Math.min(raio, len1 / 2, len2 / 2)
    const p1x = curr.x - (dx1 / len1) * rr
    const p1y = curr.y - (dy1 / len1) * rr
    const p2x = curr.x + (dx2 / len2) * rr
    const p2y = curr.y + (dy2 / len2) * rr
    d += ` L ${p1x} ${p1y} Q ${curr.x} ${curr.y} ${p2x} ${p2y}`
  }
  return d
}

function tracarTramo(o: BboxCaixa, d: BboxCaixa, desvio?: boolean): { d: string; rotuloX: number; rotuloY: number } {
  const dy = d.linha - o.linha
  const yCorredor = d.top - Y_CORREDOR_ANTES_BADGE
  const fim = { x: d.badgeX, y: d.top - Y_PONTA_ANTES_BADGE }

  if (o.id === 'inicio') {
    const pontos = [
      { x: o.cx, y: o.bottom + GAP_SETA },
      { x: o.cx, y: yCorredor },
      { x: d.badgeX, y: yCorredor },
      fim,
    ]
    return {
      d: pathSegmentoArredondado(pontos),
      rotuloX: (o.cx + d.badgeX) / 2,
      rotuloY: yCorredor - 10,
    }
  }

  if (dy > 0 && desvio) {
    const xCorredor = Math.max(6, Math.min(o.left, d.left) - 14)
    const pontos = [
      { x: o.badgeX - 12, y: o.badgeY },
      { x: xCorredor, y: o.badgeY },
      { x: xCorredor, y: yCorredor },
      { x: d.badgeX, y: yCorredor },
      fim,
    ]
    return {
      d: pathSegmentoArredondado(pontos),
      rotuloX: xCorredor + 20,
      rotuloY: yCorredor - 10,
    }
  }

  if (dy > 0) {
    const pontos = [
      { x: o.badgeX, y: o.bottom + 8 },
      { x: o.badgeX, y: yCorredor },
      { x: d.badgeX, y: yCorredor },
      fim,
    ]
    return {
      d: pathSegmentoArredondado(pontos),
      rotuloX: (o.badgeX + d.badgeX) / 2,
      rotuloY: yCorredor - 10,
    }
  }

  if (dy === 0) {
    const indoDireita = d.badgeX > o.badgeX
    const saida = { x: o.badgeX + (indoDireita ? 14 : -14), y: o.badgeY }
    const chegada = { x: d.badgeX + (indoDireita ? -16 : 16), y: d.badgeY }
    return {
      d: pathSegmentoArredondado([saida, chegada]),
      rotuloX: (saida.x + chegada.x) / 2,
      rotuloY: o.badgeY - 12,
    }
  }

  const xCorredor = Math.max(6, o.left - 14)
  const pontos = [
    { x: o.badgeX - 12, y: o.badgeY },
    { x: xCorredor, y: o.badgeY },
    { x: xCorredor, y: yCorredor },
    { x: d.badgeX, y: yCorredor },
    fim,
  ]
  return {
    d: pathSegmentoArredondado(pontos),
    rotuloX: (xCorredor + d.badgeX) / 2,
    rotuloY: yCorredor - 10,
  }
}

function bboxCaixa(caixa: CaixaFluxo, colWidth: number): BboxCaixa {
  const cx = (caixa.faixa + 0.5) * colWidth
  const rowTop = topoLinha(caixa.linha)

  if (caixa.formato === 'inicio') {
    const top = rowTop + INICIO_TOP
    const bottom = top + INICIO_DIAM
    return {
      id: caixa.id,
      cx,
      cy: (top + bottom) / 2,
      top,
      bottom,
      left: cx - INICIO_RAIO,
      right: cx + INICIO_RAIO,
      col: caixa.faixa,
      linha: caixa.linha,
      badgeX: cx,
      badgeY: bottom,
    }
  }

  const cardTop = rowTop + CARD_WRAPPER_TOP
  const cardBottom = cardTop + ALTURA_CARD
  const cardLeft = cx - MEIO_CARD

  return {
    id: caixa.id,
    cx,
    cy: (cardTop + cardBottom) / 2,
    top: cardTop,
    bottom: cardBottom,
    left: cardLeft,
    right: cx + MEIO_CARD,
    col: caixa.faixa,
    linha: caixa.linha,
    badgeX: cardLeft + 24,
    badgeY: cardTop - 3,
  }
}

function SetasSwimlaneSvg({ largura, markerId, markerTracejadoId, gradId }: {
  largura: number
  markerId: string
  markerTracejadoId: string
  gradId: string
}) {
  const colWidth = largura / 3
  const maxLinha = Math.max(...CAIXAS.map((c) => c.linha))
  const altura = PADDING_TOP + (maxLinha + 1) * ALTURA_LINHA + 32
  const mapa = new Map(CAIXAS.map((c) => [c.id, bboxCaixa(c, colWidth)]))

  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: altura,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(129,140,248,.92)" />
          <stop offset="55%" stopColor="rgba(96,165,250,.88)" />
          <stop offset="100%" stopColor="rgba(52,211,153,.85)" />
        </linearGradient>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,8 L8,4 Z" fill={`url(#${gradId})`} />
        </marker>
        <marker id={markerTracejadoId} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,7 L7,3.5 Z" fill="rgba(148,163,184,.8)" />
        </marker>
      </defs>
      {TRAMOS_FLUXO.map((tramo, idx) => {
        const o = mapa.get(tramo.de)
        const d = mapa.get(tramo.para)
        if (!o || !d) return null

        const { d: pathD, rotuloX, rotuloY } = tracarTramo(o, d, tramo.desvio)
        const marker = tramo.tracejada ? markerTracejadoId : markerId

        return (
          <g key={`${tramo.de}-${tramo.para}-${idx}`}>
            <path
              d={pathD}
              fill="none"
              stroke={tramo.tracejada ? 'rgba(148,163,184,.55)' : `url(#${gradId})`}
              strokeWidth={tramo.tracejada ? 1.65 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={tramo.tracejada ? '6 5' : undefined}
              markerEnd={`url(#${marker})`}
              opacity={tramo.tracejada ? 0.88 : 0.94}
            />
            {tramo.rotulo ? (
              <>
                <rect
                  x={rotuloX - (tramo.rotulo.length > 6 ? 42 : 28)}
                  y={rotuloY - 11}
                  width={tramo.rotulo.length > 6 ? 84 : 56}
                  height={16}
                  rx={8}
                  fill={tramo.rotulo.startsWith('Sim') ? 'rgba(52,211,153,.18)' : tramo.rotulo.startsWith('Não') ? 'rgba(251,191,36,.16)' : 'rgba(99,102,241,.14)'}
                  stroke={tramo.rotulo.startsWith('Sim') ? 'rgba(52,211,153,.45)' : tramo.rotulo.startsWith('Não') ? 'rgba(251,191,36,.4)' : 'rgba(129,140,248,.28)'}
                  strokeWidth={1}
                />
                <text
                  x={rotuloX}
                  y={rotuloY}
                  fill={tramo.rotulo.startsWith('Sim') ? '#6ee7b7' : tramo.rotulo.startsWith('Não') ? '#fcd34d' : '#cbd5e1'}
                  fontSize="8.5"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {tramo.rotulo}
                </text>
              </>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

function ManualInfograficoRichText({ texto }: { texto: string }) {
  const re = /(\{\{link:([^|]+)\|([^}]+)\}\}|\*\*([^*]+)\*\*)/g
  const partes: React.ReactNode[] = []
  let ultimo = 0
  let k = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(texto.slice(ultimo, match.index))
    }
    if (match[2] && match[3]) {
      partes.push(
        <AcademyLinkGuia key={k++} href={match[2]} rotulo={match[3]} />,
      )
    } else if (match[4]) {
      partes.push(
        <strong key={k++} style={{ color: '#cbd5e1', fontWeight: 700 }}>
          {match[4]}
        </strong>,
      )
    }
    ultimo = match.index + match[0].length
  }
  if (ultimo < texto.length) {
    partes.push(texto.slice(ultimo))
  }
  return <>{partes}</>
}

function RotuloSecaoCard({
  rotulo,
  cor,
  icone: Icone,
}: {
  rotulo: string
  cor: string
  icone: typeof Target
}) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '10px',
      fontWeight: 800,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: cor,
    }}>
      <Icone size={10} weight="fill" aria-hidden />
      {rotulo}
    </span>
  )
}

function BadgePassoFluxo({ meta }: { meta: MetaPassoFluxo }) {
  const isDecisao = meta.tipo === 'decisao'
  const isParalelo = meta.tipo === 'paralelo'
  const isFeedback = meta.tipo === 'feedback'
  const isFim = meta.tipo === 'fim'
  const ramoSim = meta.ramo === 'sim'
  const ramoNao = meta.ramo === 'nao'

  const corFundo = isDecisao
    ? 'linear-gradient(135deg, rgba(251,191,36,.28) 0%, rgba(245,158,11,.22) 100%)'
    : isParalelo
      ? 'rgba(96,165,250,.22)'
      : isFeedback
        ? 'rgba(148,163,184,.16)'
        : isFim
          ? 'rgba(52,211,153,.2)'
          : ramoSim
            ? 'rgba(52,211,153,.18)'
            : ramoNao
              ? 'rgba(251,191,36,.16)'
              : 'rgba(99,102,241,.22)'

  const corBorda = isDecisao
    ? 'rgba(251,191,36,.55)'
    : isParalelo
      ? 'rgba(96,165,250,.45)'
      : isFeedback
        ? 'rgba(148,163,184,.35)'
        : isFim
          ? 'rgba(52,211,153,.45)'
          : ramoSim
            ? 'rgba(52,211,153,.4)'
            : ramoNao
              ? 'rgba(251,191,36,.4)'
              : 'rgba(129,140,248,.42)'

  const corTexto = isDecisao
    ? '#fde68a'
    : isParalelo
      ? '#93c5fd'
      : isFeedback
        ? '#94a3b8'
        : isFim
          ? '#6ee7b7'
          : ramoSim
            ? '#6ee7b7'
            : ramoNao
              ? '#fcd34d'
              : '#c7d2fe'

  return (
    <span style={{
      position: 'absolute',
      top: -11,
      left: 10,
      zIndex: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      pointerEvents: 'none',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isDecisao ? 4 : 0,
        minWidth: isDecisao ? undefined : 22,
        justifyContent: 'center',
        padding: isDecisao ? '3px 8px' : '3px 6px',
        borderRadius: isDecisao ? 8 : 999,
        background: corFundo,
        border: `1px solid ${corBorda}`,
        boxShadow: '0 2px 10px rgba(0,0,0,.28)',
        color: corTexto,
        fontSize: isDecisao ? '8px' : '10px',
        fontWeight: 800,
        letterSpacing: isDecisao ? '.06em' : '.02em',
        textTransform: isDecisao ? 'uppercase' : undefined,
        lineHeight: 1,
      }}>
        {isDecisao ? <GitBranch size={10} weight="bold" aria-hidden /> : null}
        {meta.badge}
        {ramoSim ? (
          <span style={{ fontSize: '6px', fontWeight: 700, opacity: 0.85, marginLeft: 2 }}>Sim</span>
        ) : null}
        {ramoNao ? (
          <span style={{ fontSize: '6px', fontWeight: 700, opacity: 0.85, marginLeft: 2 }}>Não</span>
        ) : null}
      </span>
      {meta.opcional ? (
        <span style={{
          padding: '2px 6px',
          borderRadius: 999,
          background: 'rgba(148,163,184,.12)',
          border: '1px solid rgba(148,163,184,.28)',
          color: '#94a3b8',
          fontSize: '7px',
          fontWeight: 700,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          opcional
        </span>
      ) : null}
    </span>
  )
}

const VARIANTES_SAP: Array<{ sigla: string; nome: string; corpo: string }> = [
  {
    sigla: 'ECC',
    nome: 'SAP ECC (on-premise)',
    corpo: 'Sem CPI? Use **PI/PO** (canal REST receiver) ou **job ABAP** clássico: saída de mensagem **NAST** na liberação do pedido (ME21N/ME22N) ou BAdI, chamando **`CL_HTTP_CLIENT`**. Credencial no destino **SM59** (HTTPS tipo G) e certificado da Gravity no **STRUST**.',
  },
  {
    sigla: 'S/4',
    nome: 'S/4HANA (on-premise / private)',
    corpo: 'Todos os caminhos do ECC valem (**ABAP**, **PI/PO**) e o recomendado é o **CPI / Integration Suite (BTP)**: iFlow disparado por **Output Management** (BRF+) ou evento do pedido, com credencial no **Security Material**.',
  },
  {
    sigla: 'S/4C',
    nome: 'S/4HANA Cloud (public)',
    corpo: 'Não há ABAP clássico nem SM59: a integração sai **obrigatoriamente pelo CPI/BTP**: configure o **Output Management** do pedido para disparar o iFlow, que faz o POST multipart no Smart Docs. Extensões só via **Side-by-Side (BTP)** ou **Key User Extensions**.',
  },
]

const PASSOS_FLUXO_SAP: Array<{ titulo: string; corpo: string }> = [
  {
    titulo: 'Gere e guarde o token',
    corpo: 'No **Configurador → API Cockpit → Tokens → Novo token** (escopo **Escrita**, defina validade e rate limit). Guarde no lugar seguro da sua versão: **CPI/BTP** → Security Material (User Credentials); **on-premise** → **SM59** (destino HTTPS tipo G) + certificado no **STRUST**. Nunca deixe o token em código ABAP ou variável de iFlow.',
  },
  {
    titulo: 'Identifique sua versão e monte a saída do pedido',
    corpo: 'Veja o quadro acima (**ECC**, **S/4 on-premise** ou **S/4HANA Cloud**): o gatilho é sempre o mesmo evento: **liberação/exportação do pedido de compra** gera o **documento que você já emite hoje** (PDF Adobe Forms/SmartForms: também aceito em imagem ou planilha) e dispara a chamada.',
  },
  {
    titulo: 'Monte a chamada HTTP',
    corpo: '**POST** `multipart/form-data` com o **documento do pedido** (**PDF, JPG/PNG, XML, CSV ou XLS/XLSX** · até **50 MB**) · header **`Authorization: Bearer {token}`** · endpoint da API Smart Docs publicado no **API Cockpit**. No CPI use o **HTTP receiver adapter**; no ABAP, `CL_HTTP_CLIENT` com `IF_HTTP_ENTITY` multipart. Respeite o **rate limit** definido no token.',
  },
  {
    titulo: 'Persista o retorno',
    corpo: 'A resposta traz o **`id_leitura`**: grave numa tabela **Z** (ex.: `ZSDOCS_LEITURA`: nº do pedido, id_leitura, status, timestamp). No S/4HANA Cloud, use um **Custom Business Object** (Key User) ou persistência no BTP.',
  },
  {
    titulo: 'Receba o resultado',
    corpo: '**Com webhook** (passos A1/A2): exponha um endpoint HTTPS (no próprio CPI, um iFlow com sender HTTPS resolve), valide **`X-Gravity-Signature`** com o secret e dispare o GET na hora. **Sem webhook**: job agendado (**SM36** on-premise, **Job Scheduling Service** no BTP) faz **GET** por `id_leitura` até o status **concluída**.',
  },
  {
    titulo: 'Atualize o pedido no SAP',
    corpo: 'Grave os **campos extraídos** (nº do pedido, itens, valores, datas…) de volta no fluxo **MM/COMEX**: via BAPI (`BAPI_PO_CHANGE`), API OData padrão (S/4) ou processo custom. Audite as chamadas em **API Cockpit → Consumo**.',
  },
]

function MiniCardFluxoSap() {
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aberto])

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        title="Fluxo completo para SAP"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 9px 4px 5px',
          borderRadius: 8,
          border: '1px solid rgba(56,182,255,.45)',
          background: 'linear-gradient(135deg, rgba(0,112,199,.28) 0%, rgba(8,12,24,.85) 100%)',
          boxShadow: '0 3px 12px rgba(0,112,199,.22)',
          cursor: 'pointer',
          color: '#bae6fd',
          fontSize: '9px',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        <span style={{
          padding: '3px 6px',
          borderRadius: 5,
          background: 'linear-gradient(135deg, #0aa1dd 0%, #0a6ed1 100%)',
          color: '#fff',
          fontSize: '9px',
          fontWeight: 900,
          fontStyle: 'italic',
          letterSpacing: '.04em',
          lineHeight: 1,
        }}>
          SAP
        </span>
        Tenho SAP: ver fluxo
      </button>
      {aberto ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fluxo de integração SAP com Smart Docs"
          onClick={() => setAberto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_INDEX_MANUAL_AMPLIAR_TELA_CHEIA,
            background: 'rgba(2,6,16,.78)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(920px, 96vw)',
              maxHeight: '86vh',
              overflowY: 'auto',
              borderRadius: 14,
              border: '1px solid rgba(56,182,255,.3)',
              background: 'linear-gradient(165deg, rgba(15,23,42,.98) 0%, rgba(8,12,24,.99) 100%)',
              boxShadow: '0 24px 80px rgba(0,0,0,.5)',
              padding: '20px 22px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #0aa1dd 0%, #0a6ed1 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  letterSpacing: '.04em',
                }}>
                  SAP
                </span>
                <p style={{ margin: 0, fontSize: '.92rem', fontWeight: 800, color: '#f1f5f9' }}>
                  Tenho SAP: como integrar ao Smart Docs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                style={{
                  border: '1px solid rgba(148,163,184,.3)',
                  background: 'rgba(148,163,184,.1)',
                  color: '#cbd5e1',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fechar · Esc
              </button>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
              Passo a passo do lado SAP para enviar documentos ao Smart Docs e receber os campos extraídos: o passo 1 (token) e o bloco A1/A2 (webhook) são os mesmos do infográfico. O fluxo REST é <strong style={{ color: '#cbd5e1' }}>igual para todo SAP</strong>; o que muda por versão é a ferramenta que monta a saída:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {VARIANTES_SAP.map((v) => (
                <div
                  key={v.sigla}
                  style={{
                    padding: '10px 11px',
                    borderRadius: 10,
                    border: '1px solid rgba(56,182,255,.22)',
                    background: 'rgba(10,110,209,.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 5,
                      background: 'rgba(10,161,221,.25)',
                      border: '1px solid rgba(56,182,255,.4)',
                      color: '#7dd3fc',
                      fontSize: '8.5px',
                      fontWeight: 900,
                      letterSpacing: '.04em',
                    }}>
                      {v.sigla}
                    </span>
                    <p style={{ margin: 0, fontSize: '.68rem', fontWeight: 800, color: '#e2e8f0' }}>
                      {v.nome}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '.66rem', lineHeight: 1.5, color: '#94a3b8' }}>
                    <ManualInfograficoRichText texto={v.corpo} />
                  </p>
                </div>
              ))}
            </div>
            {PASSOS_FLUXO_SAP.map((passo, idx) => (
              <div
                key={passo.titulo}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,.14)',
                  background: 'rgba(148,163,184,.05)',
                  marginBottom: 8,
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(10,161,221,.2)',
                  border: '1px solid rgba(56,182,255,.4)',
                  color: '#7dd3fc',
                  fontSize: '10px',
                  fontWeight: 800,
                }}>
                  {idx + 1}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>
                    {passo.titulo}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: '.72rem', lineHeight: 1.55, color: '#94a3b8' }}>
                    <ManualInfograficoRichText texto={passo.corpo} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  )
}

function CaixaDetalhe({
  caixa,
  faixa,
}: {
  caixa: CaixaFluxo
  faixa: (typeof FAIXAS)[number]
}) {
  const telas = TELAS_INFOGRAFICO_INTEGRACAO_API_COCKPIT[caixa.id] ?? []
  const meta = META_PASSO_FLUXO[caixa.id]
  const isDecisao = caixa.formato === 'decisao'

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 2,
        zIndex: 3,
      }}
    >
      <div
        id={`fluxo-caixa-${caixa.id}`}
        style={{
          position: 'relative',
          width: LARGURA_CARD,
          minWidth: LARGURA_CARD,
          maxWidth: LARGURA_CARD,
          height: ALTURA_CARD,
          minHeight: ALTURA_CARD,
          maxHeight: ALTURA_CARD,
          padding: 0,
          textAlign: 'left',
          borderRadius: 11,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
          background: isDecisao
            ? 'linear-gradient(165deg, rgba(245,158,11,.1) 0%, rgba(15,23,42,.82) 48%, rgba(8,12,24,.92) 100%)'
            : 'linear-gradient(165deg, rgba(15,23,42,.78) 0%, rgba(8,12,24,.92) 100%)',
          border: isDecisao ? '1px solid rgba(251,191,36,.38)' : `1px solid ${faixa.borda}`,
          boxShadow: isDecisao
            ? 'inset 3px 0 0 #fbbf24, inset 0 1px 0 rgba(255,255,255,.05), 0 6px 18px rgba(245,158,11,.12)'
            : `inset 3px 0 0 ${faixa.cor}, inset 0 1px 0 rgba(255,255,255,.05), 0 6px 18px rgba(0,0,0,.24)`,
          boxSizing: 'border-box',
        }}
      >
      {meta ? <BadgePassoFluxo meta={meta} /> : null}
      {caixa.id === 'token-ext' ? (
        <div style={{ position: 'absolute', bottom: -13, right: 10, zIndex: 5 }}>
          <MiniCardFluxoSap />
        </div>
      ) : null}
      {telas.length > 0 ? (
        <div style={{ position: 'absolute', top: -34, right: -24, zIndex: 5 }}>
          <ManualInfograficoMiniaturaSequenciaTelas telas={telas} rotulo={caixa.texto.replace(/\*\*/g, '')} />
        </div>
      ) : null}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: `0 0 ${ALTURA_SECAO_TOPO_CARD}px`,
        minHeight: ALTURA_SECAO_TOPO_CARD,
        maxHeight: ALTURA_SECAO_TOPO_CARD,
        borderBottom: '1px solid rgba(148,163,184,.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: `0 0 ${ALTURA_OQUE_CARD}px`,
          minHeight: ALTURA_OQUE_CARD,
          maxHeight: ALTURA_OQUE_CARD,
          padding: '5px 10px 4px',
          borderBottom: '1px solid rgba(148,163,184,.08)',
          overflow: 'hidden',
        }}>
          <RotuloSecaoCard rotulo="O quê" cor="#e2e8f0" icone={Target} />
          <p style={{
            margin: '2px 0 0',
            fontSize: '10px',
            lineHeight: 1.35,
            color: '#f1f5f9',
            fontWeight: 700,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            <ManualInfograficoRichText texto={caixa.texto} />
            {caixa.textoSufixo ? (
              <span style={{
                fontSize: '8px',
                fontWeight: 500,
                color: '#94a3b8',
                whiteSpace: 'nowrap',
              }}>
                {'\u00a0'}
                {caixa.textoSufixo}
              </span>
            ) : null}
          </p>
        </div>
        <div style={{
          flex: 1,
          minHeight: 0,
          padding: '4px 10px 5px',
          background: 'rgba(99,102,241,.06)',
          overflow: 'hidden',
        }}>
          <RotuloSecaoCard rotulo="Onde" cor="#a5b4fc" icone={MapPin} />
          <p style={{
            margin: '2px 0 0',
            fontSize: '10px',
            lineHeight: 1.38,
            color: '#94a3b8',
            fontWeight: 500,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            <ManualInfograficoRichText texto={caixa.onde} />
          </p>
        </div>
      </div>
      <div style={{
        flex: 1,
        minHeight: 0,
        padding: '5px 10px 6px',
        borderTop: '1px solid rgba(148,163,184,.12)',
        background: 'rgba(148,163,184,.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <RotuloSecaoCard rotulo="Como" cor="#94a3b8" icone={GearSix} />
        <p style={{
          margin: '4px 0 0',
          fontSize: '10px',
          lineHeight: 1.4,
          color: '#94a3b8',
          fontWeight: 500,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isDecisao ? 2 : 3,
          WebkitBoxOrient: 'vertical',
        }}>
          <ManualInfograficoRichText texto={caixa.como} />
        </p>
        {isDecisao ? (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '7px',
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 999,
              background: 'rgba(52,211,153,.14)',
              border: '1px solid rgba(52,211,153,.35)',
              color: '#6ee7b7',
            }}>
              Sim → push webhook
            </span>
            <span style={{
              fontSize: '7px',
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: 999,
              background: 'rgba(251,191,36,.12)',
              border: '1px solid rgba(251,191,36,.32)',
              color: '#fcd34d',
            }}>
              Não → polling API
            </span>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  )
}

function CaixaSwimlane({
  caixa,
  faixa,
}: {
  caixa: CaixaFluxo
  faixa: (typeof FAIXAS)[number]
}) {
  if (caixa.formato === 'inicio') {
    return (
      <div
        id={`fluxo-caixa-${caixa.id}`}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: 8,
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(8,12,24,.55)',
          border: `2px solid ${faixa.cor}`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04), 0 4px 14px rgba(0,0,0,.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '.56rem',
          fontWeight: 800,
          color: faixa.cor,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          zIndex: 2,
        }}
      >
        Início
      </div>
    )
  }

  return <CaixaDetalhe caixa={caixa} faixa={faixa} />
}

/** Manual Smart Docs §05 — swimlane Sistema Externo → Gravity → Sistema Externo */
export function ManualInfograficoListaLeituraSmartReadIntegracaoApiCockpit() {
  const markerUid = useId().replace(/:/g, '')
  const markerId = `seta-${markerUid}`
  const markerTracejadoId = `seta-tr-${markerUid}`
  const gradId = `seta-grad-${markerUid}`
  const maxLinha = Math.max(...CAIXAS.map((c) => c.linha))
  const larguraGrid = 1280
  const alturaGrid = PADDING_TOP + (maxLinha + 1) * ALTURA_LINHA + 40

  return (
    <div
      role="group"
      aria-label="Swimlane: integração API e Webhook Smart Docs"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: 20,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ArrowsLeftRight size={18} weight="duotone" color="#818cf8" aria-hidden />
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
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
            <Sparkle size={12} weight="fill" aria-hidden />
            Integração
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.35 }}>
          Fluxo completo (Sistema Externo → Gravity → Sistema Externo)
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '.74rem', lineHeight: 1.5, color: CORPO_70 }}>
          Cada cartão traz <strong style={{ color: '#cbd5e1' }}>O quê</strong>,{' '}
          <strong style={{ color: '#cbd5e1' }}>Onde</strong> e{' '}
          <strong style={{ color: '#cbd5e1' }}>Como</strong> em faixas verticais; quando houver prints, a <strong style={{ color: '#cbd5e1' }}>miniatura</strong> à direita abre a sequência de telas no padrão do manual.
        </p>
      </div>

      <div style={{
        borderRadius: 12,
        border: '1px solid rgba(148,163,184,.16)',
        background: 'rgba(8,12,24,.32)',
        overflowX: 'auto',
        overflowY: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.03)',
      }}>
        <div style={{ minWidth: larguraGrid }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: '1px solid rgba(148,163,184,.12)',
          }}>
            {FAIXAS.map((faixa, idx) => (
              <div
                key={faixa.id}
                style={{
                  background: faixa.headerFundo,
                  textAlign: 'center',
                  padding: '11px 10px',
                  borderRight: idx < 2 ? '1px solid rgba(148,163,184,.1)' : undefined,
                  borderBottom: `2px solid ${faixa.cor}`,
                }}
              >
                <p style={{ margin: 0, fontSize: '.74rem', fontWeight: 800, color: faixa.cor, letterSpacing: '.02em' }}>
                  {faixa.rotulo}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '.58rem', color: CORPO_70, fontWeight: 600 }}>
                  {faixa.subtitulo}
                </p>
              </div>
            ))}
          </div>

          <div
            data-swimlane-grid
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              minHeight: alturaGrid,
              background: 'rgba(8,12,24,.12)',
            }}
          >
            <SetasSwimlaneSvg largura={larguraGrid} markerId={markerId} markerTracejadoId={markerTracejadoId} gradId={gradId} />

            {FAIXAS.map((faixa, faixaIdx) => (
              <div
                key={faixa.id}
                style={{
                  position: 'relative',
                  minHeight: alturaGrid,
                  borderRight: faixaIdx < 2 ? `1px solid ${faixa.borda}` : undefined,
                  overflow: 'visible',
                }}
              >
                {CAIXAS.filter((c) => c.faixa === faixaIdx).map((caixa) => (
                  <div
                    key={caixa.id}
                    style={{
                      position: 'absolute',
                      top: PADDING_TOP + caixa.linha * ALTURA_LINHA,
                      left: 0,
                      right: 0,
                      minHeight: caixa.formato === 'inicio' ? 60 : ALTURA_LINHA - 8,
                      overflow: 'visible',
                    }}
                  >
                    <CaixaSwimlane caixa={caixa} faixa={faixa} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(245,158,11,.08)',
        border: '1px solid rgba(251,191,36,.22)',
      }}>
        <UploadSimple size={16} weight="duotone" color="#fbbf24" aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
          <strong style={{ color: '#cbd5e1' }}>Webhook sozinho não substitui token</strong>
          {' '}— cadastro em <ManualInfograficoRichText texto={L.webhooks} />; token em{' '}
          <ManualInfograficoRichText texto={L.tokens} />. Detalhes passo a passo no manual do API Cockpit.
        </p>
      </div>
    </div>
  )
}

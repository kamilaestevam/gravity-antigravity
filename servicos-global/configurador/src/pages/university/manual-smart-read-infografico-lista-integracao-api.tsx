import React, { useId } from 'react'
import { Link } from 'react-router-dom'
import { ArrowsLeftRight, GearSix, MapPin, Sparkle, Target, UploadSimple } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'
const LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}

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

type FormatoCaixa = 'inicio' | 'processo' | 'decisao' | 'detalhe'

type CaixaFluxo = {
  id: string
  faixa: 0 | 1 | 2
  linha: number
  texto: string
  manual?: string
  onde?: string
  como?: string
  formato?: FormatoCaixa
}

type SetaFluxo = {
  de: string
  para: string
  rotulo?: string
  tracejada?: boolean
}

const CAIXAS: CaixaFluxo[] = [
  { id: 'inicio', faixa: 0, linha: 0, texto: 'Início', formato: 'inicio' },
  {
    id: 'webhook',
    faixa: 0,
    linha: 1,
    texto: 'Cadastra **endpoint Webhook** (opcional)',
    onde: `${L.cockpit} → aba **Webhooks** → **+ Novo Webhook**`,
    como: 'Informe a **URL HTTPS** do Sistema Externo · ver manual § **Webhooks**',
    formato: 'detalhe',
  },
  {
    id: 'token',
    faixa: 1,
    linha: 1,
    texto: 'Admin gera **token** (escrita + workspace)',
    manual: `Onde: ${L.tokens} → **Novo token** · escopo **Escrita** · validade e rate limit.`,
  },
  {
    id: 'pdf',
    faixa: 0,
    linha: 2,
    texto: 'ERP gera **PDF Pedido #4521**',
    manual: 'Onde: no **Sistema Externo** — exportação do pedido (ERP/COMEX).',
  },
  {
    id: 'post',
    faixa: 0,
    linha: 3,
    texto: '**POST** PDF + token',
    manual: 'Como: REST **POST** Smart Docs · header `Authorization: Bearer {token}` · multipart do PDF.',
  },
  {
    id: 'valida',
    faixa: 1,
    linha: 3,
    texto: 'Valida token · roteia ao Smart Docs',
    manual: `Onde: ${L.cockpit} · rota app **/configurador/api-cockpit** (gateway da org).`,
  },
  {
    id: 'recebe',
    faixa: 2,
    linha: 3,
    texto: 'Recebe arquivo',
    manual: 'Onde: serviço **Smart Docs** do **workspace** ligado ao token.',
  },
  {
    id: 'id',
    faixa: 0,
    linha: 4,
    texto: 'Recebe **id da leitura**',
    manual: 'Resposta JSON com **`id_leitura`** — use nas consultas GET e no webhook.',
  },
  {
    id: 'ia',
    faixa: 2,
    linha: 4,
    texto: '**IA** classifica documento · extrai campos',
    manual: 'Como: pipeline **Análise + IA** (paridade com wizard **Nova Leitura**).',
  },
  {
    id: 'grava',
    faixa: 2,
    linha: 5,
    texto: 'Grava leitura · **Transações API**',
    manual: `Onde: ${L.transacoes} · tag **origem_leitura: API**.`,
  },
  {
    id: 'decisao',
    faixa: 1,
    linha: 6,
    texto: 'Retorno via **Webhook**?',
    manual: 'Decisão na implementação do Sistema Externo (push vs polling).',
    formato: 'decisao',
  },
  {
    id: 'wh-post',
    faixa: 2,
    linha: 7,
    texto: 'POST «leitura concluída» + id',
    manual: `Como: Gravity dispara **POST** na URL do ${L.webhooks}.`,
  },
  {
    id: 'wh-recv',
    faixa: 0,
    linha: 7,
    texto: 'Endpoint recebe aviso',
    manual: 'Onde: **URL HTTPS** cadastrada no Cockpit (servidor do Sistema Externo).',
  },
  {
    id: 'get-wh',
    faixa: 0,
    linha: 8,
    texto: '**GET** dados completos (token)',
    manual: `Como: **GET** leitura por id · auditar em ${L.consumo}.`,
  },
  {
    id: 'get-api',
    faixa: 0,
    linha: 9,
    texto: '**GET** status/resultado (loop)',
    manual: `Como: polling até status concluído · log em ${L.consumo}.`,
  },
  {
    id: 'resp',
    faixa: 2,
    linha: 8,
    texto: 'Retorna **campos extraídos**',
    manual: 'Payload JSON com campos do documento (nº pedido, itens, valores…).',
  },
  {
    id: 'fim',
    faixa: 0,
    linha: 10,
    texto: 'Atualiza **pedido / COMEX**',
    manual: 'Onde: **Sistema Externo** persiste o resultado no ERP/processo.',
  },
]

const SETAS: SetaFluxo[] = [
  { de: 'inicio', para: 'webhook' },
  { de: 'inicio', para: 'token' },
  { de: 'webhook', para: 'pdf' },
  { de: 'token', para: 'pdf' },
  { de: 'pdf', para: 'post' },
  { de: 'post', para: 'valida', rotulo: 'API REST' },
  { de: 'valida', para: 'recebe' },
  { de: 'recebe', para: 'id', tracejada: true },
  { de: 'recebe', para: 'ia' },
  { de: 'ia', para: 'grava' },
  { de: 'grava', para: 'decisao' },
  { de: 'decisao', para: 'wh-post', rotulo: 'Sim' },
  { de: 'wh-post', para: 'wh-recv' },
  { de: 'wh-recv', para: 'get-wh' },
  { de: 'get-wh', para: 'resp' },
  { de: 'resp', para: 'fim', tracejada: true },
  { de: 'decisao', para: 'get-api', rotulo: 'Não · só API' },
  { de: 'get-api', para: 'resp' },
]

const ALTURA_LINHA = 108
const PADDING_TOP = 10

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
        <Link key={k++} to={match[2]} style={LINK_STYLE}>
          {match[3]}
        </Link>,
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
      fontSize: '.46rem',
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

function CaixaDetalhePremium({
  caixa,
  faixa,
  base,
}: {
  caixa: CaixaFluxo
  faixa: (typeof FAIXAS)[number]
  base: React.CSSProperties
}) {
  return (
    <div
      id={`fluxo-caixa-${caixa.id}`}
      style={{
        ...base,
        top: 2,
        width: 'calc(100% + 28px)',
        maxWidth: 292,
        padding: 0,
        textAlign: 'left',
        borderRadius: 11,
        background: 'linear-gradient(165deg, rgba(15,23,42,.78) 0%, rgba(8,12,24,.92) 100%)',
        border: `1px solid ${faixa.borda}`,
        boxShadow: `inset 3px 0 0 ${faixa.cor}, inset 0 1px 0 rgba(255,255,255,.05), 0 6px 18px rgba(0,0,0,.24)`,
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        borderBottom: caixa.como ? '1px solid rgba(148,163,184,.1)' : undefined,
      }}>
        <div style={{ padding: '8px 10px 7px', borderRight: '1px solid rgba(148,163,184,.1)' }}>
          <RotuloSecaoCard rotulo="O quê" cor="#e2e8f0" icone={Target} />
          <p style={{ margin: '4px 0 0', fontSize: '.62rem', lineHeight: 1.35, color: '#f1f5f9', fontWeight: 700 }}>
            <ManualInfograficoRichText texto={caixa.texto} />
          </p>
        </div>
        {caixa.onde ? (
          <div style={{ padding: '8px 10px 7px', background: 'rgba(99,102,241,.06)' }}>
            <RotuloSecaoCard rotulo="Onde" cor="#a5b4fc" icone={MapPin} />
            <p style={{ margin: '4px 0 0', fontSize: '.52rem', lineHeight: 1.38, color: '#94a3b8', fontWeight: 500 }}>
              <ManualInfograficoRichText texto={caixa.onde} />
            </p>
          </div>
        ) : null}
      </div>
      {caixa.como ? (
        <div style={{
          padding: '6px 10px 8px',
          background: 'rgba(245,158,11,.06)',
        }}>
          <RotuloSecaoCard rotulo="Como" cor="#fbbf24" icone={GearSix} />
          <p style={{ margin: '4px 0 0', fontSize: '.54rem', lineHeight: 1.4, color: '#94a3b8', fontWeight: 500 }}>
            <ManualInfograficoRichText texto={caixa.como} />
          </p>
        </div>
      ) : null}
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
  const base: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 16px)',
    maxWidth: 208,
    boxSizing: 'border-box',
    textAlign: 'center',
    zIndex: 2,
  }

  const fundoCaixa = 'rgba(8,12,24,.55)'
  const sombraCaixa = 'inset 0 1px 0 rgba(255,255,255,.04), 0 4px 14px rgba(0,0,0,.18)'

  const linhaManual = caixa.manual ? (
    <p style={{
      margin: '6px 0 0',
      paddingTop: 6,
      borderTop: '1px solid rgba(148,163,184,.12)',
      fontSize: '.56rem',
      lineHeight: 1.42,
      color: '#94a3b8',
      fontWeight: 500,
      textAlign: 'left',
    }}>
      <ManualInfograficoRichText texto={caixa.manual} />
    </p>
  ) : null

  if (caixa.formato === 'detalhe') {
    return <CaixaDetalhePremium caixa={caixa} faixa={faixa} base={base} />
  }

  if (caixa.formato === 'inicio') {
    return (
      <div
        id={`fluxo-caixa-${caixa.id}`}
        style={{
          ...base,
          top: 8,
          width: 46,
          height: 46,
          maxWidth: 46,
          borderRadius: '50%',
          background: fundoCaixa,
          border: `2px solid ${faixa.cor}`,
          boxShadow: sombraCaixa,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '.56rem',
          fontWeight: 800,
          color: faixa.cor,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}
      >
        Início
      </div>
    )
  }

  if (caixa.formato === 'decisao') {
    return (
      <div style={{ ...base, top: 4, maxWidth: 208 }}>
        <div
          id={`fluxo-caixa-${caixa.id}`}
          style={{
            margin: '0 auto',
            width: 118,
            height: 68,
            background: fundoCaixa,
            border: `2px solid ${faixa.cor}`,
            boxShadow: sombraCaixa,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            fontSize: '.6rem',
            lineHeight: 1.35,
            color: CORPO_70,
            fontWeight: 600,
          }}
        >
          <ManualInfograficoRichText texto={caixa.texto} />
        </div>
        {linhaManual}
      </div>
    )
  }

  return (
    <div
      id={`fluxo-caixa-${caixa.id}`}
      style={{
        ...base,
        top: 8,
        padding: '9px 11px',
        borderRadius: 10,
        background: fundoCaixa,
        border: `1px solid ${faixa.borda}`,
        boxShadow: sombraCaixa,
      }}
    >
      <p style={{ margin: 0, fontSize: '.67rem', lineHeight: 1.4, color: CORPO_70, fontWeight: 600 }}>
        <ManualInfograficoRichText texto={caixa.texto} />
      </p>
      {linhaManual}
    </div>
  )
}

function centroCaixa(caixa: CaixaFluxo, colWidth: number) {
  const extra = caixa.formato === 'detalhe' ? 28 : caixa.manual ? 14 : 0
  const x = (caixa.faixa + 0.5) * colWidth
  const y = PADDING_TOP + caixa.linha * ALTURA_LINHA + (caixa.formato === 'decisao' ? 48 : caixa.formato === 'inicio' ? 31 : 38 + extra)
  return { x, y, col: caixa.faixa, linha: caixa.linha }
}

function SetasSwimlaneSvg({ largura, maxLinha, markerId }: { largura: number; maxLinha: number; markerId: string }) {
  const colWidth = largura / 3
  const altura = PADDING_TOP + (maxLinha + 1) * ALTURA_LINHA + 24
  const mapa = new Map(CAIXAS.map((c) => [c.id, centroCaixa(c, colWidth)]))

  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: altura,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="rgba(129,140,248,.75)" />
        </marker>
      </defs>
      {SETAS.map((seta) => {
        const o = mapa.get(seta.de)
        const d = mapa.get(seta.para)
        if (!o || !d) return null

        const oW = CAIXAS.find((c) => c.id === seta.de)?.formato === 'inicio' ? 23 : 92
        const dW = 92

        let x1 = o.x
        let y1 = o.y
        let x2 = d.x
        let y2 = d.y

        if (o.linha === d.linha && o.col !== d.col) {
          x1 = o.x + (d.col > o.col ? oW : -oW)
          x2 = d.x + (d.col > o.col ? -dW : dW)
        } else if (o.col === d.col) {
          y1 = o.y + 30
          y2 = d.y - 30
        } else {
          x1 = o.x + (d.col > o.col ? oW : -oW)
          y1 = o.y
          x2 = d.x + (d.col > o.col ? -dW : dW)
          y2 = d.y
        }

        const midX = (x1 + x2) / 2
        const path = o.col === d.col
          ? `M ${x1} ${y1} L ${x2} ${y2}`
          : `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`

        return (
          <g key={`${seta.de}-${seta.para}`}>
            <path
              d={path}
              fill="none"
              stroke={seta.tracejada ? 'rgba(148,163,184,.45)' : 'rgba(129,140,248,.55)'}
              strokeWidth={1.5}
              strokeDasharray={seta.tracejada ? '5 4' : undefined}
              markerEnd={`url(#${markerId})`}
            />
            {seta.rotulo && (
              <text
                x={midX}
                y={(y1 + y2) / 2 - 6}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="700"
                textAnchor="middle"
              >
                {seta.rotulo}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Manual Smart Docs §05 — swimlane Sistema Externo → Gravity → Sistema Externo */
export function ManualInfograficoSmartDocsListaIntegracaoApi() {
  const markerId = useId().replace(/:/g, '')
  const maxLinha = Math.max(...CAIXAS.map((c) => c.linha))
  const alturaGrid = PADDING_TOP + (maxLinha + 1) * ALTURA_LINHA + 32

  return (
    <div
      role="group"
      aria-label="Swimlane — integração API e Webhook Smart Docs"
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
          Cada caixa traz <strong style={{ color: '#cbd5e1' }}>o quê</strong> fazer; a linha abaixo indica{' '}
          <strong style={{ color: '#cbd5e1' }}>onde / como</strong>, com link para o manual do{' '}
          <ManualInfograficoRichText texto={L.cockpit} /> quando a tela é na Gravity.
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
        <div style={{ minWidth: 740 }}>
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
              background: 'repeating-linear-gradient(to bottom, transparent, transparent 107px, rgba(148,163,184,.06) 107px, rgba(148,163,184,.06) 108px)',
            }}
          >
            <SetasSwimlaneSvg largura={740} maxLinha={maxLinha} markerId={markerId} />

            {FAIXAS.map((faixa, faixaIdx) => (
              <div
                key={faixa.id}
                style={{
                  position: 'relative',
                  minHeight: alturaGrid,
                  background: faixa.fundo,
                  borderRight: faixaIdx < 2 ? `1px solid ${faixa.borda}` : undefined,
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
                      height: caixa.formato === 'detalhe' ? ALTURA_LINHA + 36 : ALTURA_LINHA - 4,
                      zIndex: caixa.formato === 'detalhe' ? 3 : 2,
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

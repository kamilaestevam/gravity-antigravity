/**
 * painel-cotacao-simulador-bid-frete.tsx — Painel da Cotação do simulador de
 * marketing. Réplica do cockpit real (cotacao-detalhe.tsx) para uma cotação
 * recém-criada (status Enviada, sem propostas):
 * - Hero: métricas de competição + timeline de 6 etapas
 * - Painel de Insights Inteligente no estado "Aguardando propostas"
 * - Abas: Visão geral / Dados gerais / Solicitação de Cotação / Propostas
 *   (Comentários e Documentos "Em breve", como no produto)
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  AirplaneTilt,
  Anchor,
  CalendarBlank,
  ChatCircleText,
  ChartLineUp,
  Check,
  CheckCircle,
  Circle,
  Clock,
  ClockCounterClockwise,
  Cube,
  CurrencyCircleDollar,
  Envelope,
  Eye,
  EyeSlash,
  FunnelSimple,
  Handshake,
  Hash,
  Hourglass,
  IdentificationCard,
  LinkSimple,
  MagnifyingGlass,
  Package,
  PaperPlaneTilt,
  PencilSimple,
  Scales,
  SealCheck,
  Tag,
  ThermometerSimple,
  Trash,
  Trophy,
  Truck,
  X,
  XCircle,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '../../../Feedback/tooltip-global/src/tooltip'
import {
  MODAL_SIMULADOR_BID_FRETE,
  OPERACAO_SIMULADOR_BID_FRETE,
  STATUS_SIMULADOR_BID_FRETE,
  formatarUsdSimuladorBidFrete,
  savingsCotacaoSimuladorBidFrete,
  type CotacaoSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import '@produto/bid-frete-internacional/client/src/pages/cotacao-detalhe-cockpit.css'
import './painel-cotacao-simulador-bid-frete.css'
import {
  SparkBarrasComparativo,
} from '@produto/bid-frete-internacional/client/src/shared/graficos-insights-cotacao-bid-frete-internacional'
import {
  buildComparativoMetrica,
  type BarraComparativoInsight,
  type ComparativoMetricaPainel,
} from '@produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'
import type { PropostaRankingBidFreteInternacional } from '@produto/bid-frete-internacional/client/src/shared/types'

// ─── Dados que o wizard entrega ao painel ─────────────────────────────────────

export type DadosPainelCotacaoSimulador = {
  cotacao: CotacaoSimuladorBidFrete
  /** ISO datetime da criação (para "19/07/2026, 12:10") */
  criadaEmIso: string
  descricaoMercadoria: string
  /** NCM já formatado "XXXX.XX.XX" ou '' */
  ncm: string
  hsCode: string
  cargaPerigosa: boolean
  numeroOnu: string
  visibilidade: 'DIRECIONADA' | 'ABERTA'
  anonima: boolean
  moedaMeta: string
  pesoKg: string
  cubagemM3: string
  quantidadeVolumes: string
  tipoContainer: string
  prazoHora: string
  fornecedoresConvidados: { id: string; nome: string }[]
}

type AbaPainel = 'visao_geral' | 'dados_gerais' | 'disparos' | 'respostas'

// ─── Painel para cotações da demonstração (não criadas no wizard) ─────────────

const FORNECEDORES_PAINEL_DEMO: { id: string; nome: string; modais: CotacaoSimuladorBidFrete['modal'][] }[] = [
  { id: 'maersk', nome: 'Maersk Line', modais: ['MARITIMO'] },
  { id: 'msc', nome: 'MSC Mediterranean', modais: ['MARITIMO'] },
  { id: 'cma-cgm', nome: 'CMA CGM', modais: ['MARITIMO'] },
  { id: 'hapag', nome: 'Hapag-Lloyd', modais: ['MARITIMO'] },
  { id: 'kuehne', nome: 'Kuehne+Nagel', modais: ['MARITIMO', 'AEREO', 'RODOVIARIO'] },
  { id: 'dhl', nome: 'DHL Global Forwarding', modais: ['AEREO', 'RODOVIARIO'] },
  { id: 'schenker', nome: 'DB Schenker', modais: ['MARITIMO', 'AEREO', 'RODOVIARIO'] },
  { id: 'expeditors', nome: 'Expeditors', modais: ['AEREO', 'MARITIMO'] },
]

const NOMES_FORNECEDOR_EXTRA_DEMO = [
  'Task Agente Ltda',
  'DHL Agente',
  'ASIA SUPPLY CO LTD',
  'KN Agente',
  'Blue Ocean Freight',
  'Global Link Agent',
]

function listarFornecedoresConvidadosDemo(
  cotacao: CotacaoSimuladorBidFrete,
): { id: string; nome: string }[] {
  if (cotacao.status === 'RASCUNHO' || cotacao.fornecedoresConvidados === 0) return []
  const elegiveis = FORNECEDORES_PAINEL_DEMO.filter((f) => f.modais.includes(cotacao.modal))
  const qtd = cotacao.fornecedoresConvidados
  const resultado: { id: string; nome: string }[] = []

  const nomesElegiveis = new Set(elegiveis.map((f) => f.nome))
  if (cotacao.fornecedorLider && !nomesElegiveis.has(cotacao.fornecedorLider)) {
    const pool = [
      cotacao.fornecedorLider,
      ...NOMES_FORNECEDOR_EXTRA_DEMO.filter((n) => n !== cotacao.fornecedorLider),
    ]
    for (let i = 0; i < qtd; i++) {
      resultado.push({ id: `demo-${i}`, nome: pool[i] ?? `Agente ${i + 1}` })
    }
    return resultado
  }

  for (let i = 0; i < qtd; i++) {
    if (i < elegiveis.length) {
      resultado.push({ id: elegiveis[i].id, nome: elegiveis[i].nome })
    } else {
      const nomeExtra = NOMES_FORNECEDOR_EXTRA_DEMO[i - elegiveis.length] ?? `Agente ${i + 1}`
      resultado.push({ id: `demo-extra-${i}`, nome: nomeExtra })
    }
  }
  return resultado
}

const MERCADORIA_DEMO_POR_MODALIDADE: Record<CotacaoSimuladorBidFrete['modalidade'], string> = {
  FCL: 'Carga geral consolidada — bens industriais',
  LCL: 'Carga fracionada — componentes e peças',
  'Aéreo Geral': 'Carga aérea geral — itens de alto valor',
  FTL: 'Carga rodoviária completa — produtos acabados',
  LTL: 'Carga rodoviária fracionada — volumes paletizados',
}

/**
 * Monta os dados do Painel da Cotação a partir de uma cotação da demonstração
 * (as criadas no wizard já registram o painel com os dados reais do formulário).
 */
export function montarPainelDemoCotacaoSimulador(
  cotacao: CotacaoSimuladorBidFrete,
): DadosPainelCotacaoSimulador {
  const convidados = listarFornecedoresConvidadosDemo(cotacao)
  const ehFcl = cotacao.modalidade === 'FCL'
  return {
    cotacao,
    criadaEmIso: `${cotacao.dataCriacao}T09:00:00`,
    descricaoMercadoria: MERCADORIA_DEMO_POR_MODALIDADE[cotacao.modalidade],
    ncm: '',
    hsCode: '',
    cargaPerigosa: false,
    numeroOnu: '',
    visibilidade: 'DIRECIONADA',
    anonima: false,
    moedaMeta: 'USD',
    pesoKg: '',
    cubagemM3: '',
    quantidadeVolumes: '',
    tipoContainer: ehFcl ? cotacao.equipamento : '',
    prazoHora: '23:59',
    fornecedoresConvidados: convidados.map(({ id, nome }) => ({ id, nome })),
  }
}

// ─── Timeline — mesmas 6 etapas do fluxo real (FLUXO_ETAPAS_RESUMIDAS) ────────

const ETAPAS_FLUXO: { label: string; icone: ReactNode }[] = [
  { label: 'Rascunho', icone: <CheckCircle weight="duotone" size={14} /> },
  { label: 'Enviada', icone: <PaperPlaneTilt weight="duotone" size={14} /> },
  { label: 'Em Cotação', icone: <Hourglass weight="duotone" size={14} /> },
  { label: 'Aguardando aprovação', icone: <Hourglass weight="duotone" size={14} /> },
  { label: 'Fornecedor concordou', icone: <Handshake weight="duotone" size={14} /> },
  { label: 'Aprovada', icone: <SealCheck weight="duotone" size={14} /> },
]
// Etapa atual da timeline por status da cotação (recém-criada = Enviada)
const INDICE_ETAPA_POR_STATUS: Record<CotacaoSimuladorBidFrete['status'], number> = {
  RASCUNHO: 0,
  ENVIADA_FORNECEDORES: 1,
  EM_COTACAO: 2,
  AGUARDANDO_APROVACAO: 3,
  APROVADA: 5,
  REPROVADA: 3,
}

function resolverRecusasDemo(cotacao: CotacaoSimuladorBidFrete): number {
  if (cotacao.status === 'RASCUNHO' || cotacao.fornecedoresConvidados === 0) return 0
  if (cotacao.status === 'ENVIADA_FORNECEDORES' || cotacao.propostasRecebidas === 0) return 0
  const pendentes = cotacao.fornecedoresConvidados - cotacao.propostasRecebidas
  if (pendentes <= 0) return 0
  if (cotacao.status === 'AGUARDANDO_APROVACAO' || cotacao.status === 'EM_COTACAO') {
    return Math.min(pendentes, Math.max(1, Math.floor(pendentes / 2)))
  }
  return pendentes
}

function cotacaoExibeComparativoPropostas(status: CotacaoSimuladorBidFrete['status']): boolean {
  return (
    status === 'EM_COTACAO'
    || status === 'AGUARDANDO_APROVACAO'
    || status === 'APROVADA'
    || status === 'REPROVADA'
  )
}

type BannerInsightsPainel = {
  classe: string
  icone: ReactNode
  titulo: string
  paragrafo: ReactNode
  bullets: ReactNode[]
}

function resolverBannerInsights(
  cotacao: CotacaoSimuladorBidFrete,
  qtdConvidados: number,
): BannerInsightsPainel | null {
  const qtdPropostas = cotacao.propostasRecebidas
  const qtdDisparos =
    cotacao.status === 'RASCUNHO'
      ? 0
      : Math.max(qtdConvidados, cotacao.fornecedoresConvidados)

  // Paridade montarConteudoAvisoGraficosInsights (produto real)
  if (cotacao.status === 'APROVADA' || cotacao.status === 'REPROVADA') return null
  if (qtdPropostas >= 2) return null

  if (qtdPropostas === 1) {
    return {
      classe: 'pcs-insights-banner pcs-insights-banner--cotacao',
      icone: <ChartLineUp weight="duotone" size={18} />,
      titulo: 'Comparativo visual quase pronto',
      paragrafo:
        'Já existe 1 proposta. Os mini-gráficos de Transit Time, Free Time e Escala aparecem quando houver pelo menos 2 respostas para comparar.',
      bullets: [
        <>Aguarde mais uma resposta ou convide fornecedores adicionais.</>,
        <>Com 2+ propostas, o ranking e a Melhor proposta exibem barras comparativas.</>,
      ],
    }
  }

  if (cotacao.status === 'RASCUNHO' && qtdDisparos === 0) {
    return {
      classe: 'pcs-insights-banner pcs-insights-banner--rascunho',
      icone: <PencilSimple weight="duotone" size={18} />,
      titulo: 'Gráficos liberados após o disparo',
      paragrafo:
        'Esta cotação ainda está em rascunho. Envie aos fornecedores para iniciar o leilão e popular o painel.',
      bullets: [
        <>Finalize os dados e dispare a cotação.</>,
        <>Com as respostas, liberamos Melhor proposta, ranking e mini-gráficos.</>,
        <>O termômetro histórico usa dados reais após aprovações na mesma rota.</>,
      ],
    }
  }

  if (qtdDisparos > 0) {
    return {
      classe: 'pcs-insights-banner pcs-insights-banner--enviada',
      icone: <PaperPlaneTilt weight="duotone" size={18} />,
      titulo: 'Aguardando propostas dos fornecedores',
      paragrafo: (
        <>
          {qtdDisparos} disparo(s) enviado(s). Os gráficos comparativos aparecem assim que chegar a primeira resposta.
        </>
      ),
      bullets: [
        <>Melhor proposta e métricas Transit / Free Time / Escala dependem de propostas recebidas.</>,
        <>Com 2 ou mais respostas, as barras comparativas são exibidas em todos os cards.</>,
      ],
    }
  }

  return null
}

function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${data}, ${hora}`
}

function IconeModal({ modal, size = 16 }: { modal: CotacaoSimuladorBidFrete['modal']; size?: number }) {
  if (modal === 'MARITIMO') return <Anchor weight="duotone" size={size} />
  if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={size} />
  return <Truck weight="duotone" size={size} />
}

function InfoRow({ icone, label, value }: { icone?: ReactNode; label: string; value: string }) {
  return (
    <div className="pcs-info-row">
      <span className="pcs-info-label">
        {icone}
        {label}
      </span>
      <span className="pcs-info-value">{value}</span>
    </div>
  )
}

function MetricaHeroCotacao({
  tituloTooltip,
  valor,
  variante,
  icone,
  rotulo,
  rotuloLinhas,
}: {
  tituloTooltip: string
  valor: number
  variante: 'disparos' | 'respostas' | 'recusas'
  icone: ReactNode
  rotulo?: string
  rotuloLinhas?: readonly [string, string]
}) {
  const rotuloConteudo = rotuloLinhas != null ? (
    <span className="pcs-hero-metrica-rotulo pcs-hero-metrica-rotulo--duas-linhas">
      <span className="pcs-hero-metrica-rotulo-linha">{rotuloLinhas[0]}</span>
      <span className="pcs-hero-metrica-rotulo-linha">{rotuloLinhas[1]}</span>
    </span>
  ) : (
    <span className="pcs-hero-metrica-rotulo">{rotulo}</span>
  )

  return (
    <TooltipGlobal titulo={tituloTooltip} posicaoPreferida="abaixo">
      <span className="pcs-metrica-wrap">
        <span
          className={`dc-competicao-seg dc-competicao-seg--${variante}`}
          aria-label={`${tituloTooltip}: ${valor}`}
        >
          <span className="dc-competicao-seg-icone" aria-hidden>
            {icone}
          </span>
          <span className="dc-competicao-seg-val">{valor}</span>
          {rotuloConteudo}
        </span>
      </span>
    </TooltipGlobal>
  )
}

function BotaoDemoDesativado({
  titulo,
  descricao,
  className,
  children,
}: {
  titulo: string
  descricao: string
  className: string
  children: ReactNode
}) {
  return (
    <TooltipGlobal titulo={titulo} descricao={descricao} posicaoPreferida="abaixo">
      <span className="pcs-demo-wrap">
        <button type="button" className={className} disabled>
          {children}
        </button>
      </span>
    </TooltipGlobal>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PainelCotacaoSimuladorBidFrete({
  dados,
}: {
  dados: DadosPainelCotacaoSimulador
}) {
  const { cotacao } = dados
  const [aba, setAba] = useState<AbaPainel>('visao_geral')
  const convidados = dados.fornecedoresConvidados
  const dataCriacaoTag = formatarDataCurta(cotacao.dataCriacao)
  const dataEnvio = formatarDataHora(dados.criadaEmIso)
  const indiceEtapaAtual = INDICE_ETAPA_POR_STATUS[cotacao.status] ?? 1
  const ehRascunho = cotacao.status === 'RASCUNHO'
  const ehReprovada = cotacao.status === 'REPROVADA'
  const ehAguardandoAprovacao = cotacao.status === 'AGUARDANDO_APROVACAO'
  const recusas = resolverRecusasDemo(cotacao)
  const banner = resolverBannerInsights(cotacao, convidados.length)
  const exibirAcoesHero = ehRascunho
  const qtdDisparos = ehRascunho ? 0 : Math.max(convidados.length, cotacao.fornecedoresConvidados)

  return (
    <div className="pcs-root">
      {/* ── Hero (paridade cockpit) ── */}
      <div className={`pcs-hero${exibirAcoesHero ? '' : ' pcs-hero--sem-acoes'}`}>
        <div
          className="dc-cockpit-competicao-resumo pcs-hero-metricas"
          role="group"
          aria-label="Métricas da competição"
        >
          <MetricaHeroCotacao
            tituloTooltip="Solicitações de cotação"
            rotuloLinhas={['Solicitações', 'de cotação']}
            valor={qtdDisparos}
            variante="disparos"
            icone={<PaperPlaneTilt weight="duotone" size={16} />}
          />
          <span className="dc-competicao-seg-divider" aria-hidden />
          <MetricaHeroCotacao
            tituloTooltip="Respostas"
            rotulo="Respostas"
            valor={cotacao.propostasRecebidas}
            variante="respostas"
            icone={<ChatCircleText weight="duotone" size={16} />}
          />
          <span className="dc-competicao-seg-divider" aria-hidden />
          <MetricaHeroCotacao
            tituloTooltip="Recusas"
            rotulo="Recusas"
            valor={recusas}
            variante="recusas"
            icone={<XCircle weight="duotone" size={16} />}
          />
        </div>

        <div
          className={[
            'pcs-hero-card pcs-hero-timeline',
            ehReprovada ? 'pcs-hero-timeline--reprovada' : '',
            ehAguardandoAprovacao ? 'pcs-hero-timeline--aprovacao' : '',
          ].filter(Boolean).join(' ')}
          aria-label="Status"
        >
          <div className="pcs-timeline-track" aria-hidden>
            <div
              className="pcs-timeline-track-fill"
              style={{ width: `${((indiceEtapaAtual + 0.5) / ETAPAS_FLUXO.length) * 100}%` }}
            />
          </div>
          <div className="pcs-timeline-etapas" role="list">
            {ETAPAS_FLUXO.map((etapa, i) => {
              const concluida = i < indiceEtapaAtual
              const atual = i === indiceEtapaAtual
              return (
                <div
                  key={etapa.label}
                  role="listitem"
                  className={[
                    'pcs-timeline-etapa',
                    concluida ? 'pcs-timeline-etapa--concluida' : '',
                    atual && ehReprovada ? 'pcs-timeline-etapa--reprovada' : '',
                    atual && ehAguardandoAprovacao ? 'pcs-timeline-etapa--aprovacao' : '',
                    atual && !ehReprovada && !ehAguardandoAprovacao ? 'pcs-timeline-etapa--atual' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="pcs-timeline-node" aria-hidden>{etapa.icone}</span>
                  <span className="pcs-timeline-label">
                    {ehReprovada && atual ? 'Reprovada' : etapa.label}
                  </span>
                  {atual && (
                    <span className="pcs-timeline-data-tag">{dataCriacaoTag}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {ehRascunho ? (
          <div className="pcs-hero-card pcs-hero-acoes">
            <BotaoDemoDesativado
              titulo="Excluir cotação"
              descricao="Disponível apenas em rascunho — recurso do tenant completo"
              className="pcs-acao-icone"
            >
              <Trash weight="duotone" size={18} />
            </BotaoDemoDesativado>
          </div>
        ) : null}
      </div>

      {/* ── Painel de Insights Inteligente ── */}
      <div className="pcs-insights-divisor" aria-hidden>
        <span>Painel de Insights Inteligente</span>
      </div>
      {banner ? (
        <div className={banner.classe} role="status">
        <span className="pcs-insights-banner-icone" aria-hidden>
          {banner.icone}
        </span>
        <div className="pcs-insights-banner-corpo">
          <strong>{banner.titulo}</strong>
          <p>{banner.paragrafo}</p>
          {banner.bullets.length > 0 ? (
            <ul>
              {banner.bullets.map((bullet, idx) => (
                <li key={idx}>
                  <CheckCircle weight="fill" size={12} />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          <span className="pcs-insights-banner-nota">
            O termômetro histórico será preenchido quando existirem dados nas mesmas condições.
          </span>
        </div>
      </div>
      ) : null}
      <InsightsGridPainel cotacao={cotacao} convidados={convidados} />

      {/* ── Abas do cockpit ── */}
      <nav className="dc-cockpit-tabs pcs-tabs" aria-label="Abas">
        <button
          type="button"
          className={`dc-cockpit-tab${aba === 'visao_geral' ? ' dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setAba('visao_geral')}
        >
          Visão geral
        </button>
        <button
          type="button"
          className={`dc-cockpit-tab${aba === 'dados_gerais' ? ' dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setAba('dados_gerais')}
        >
          Dados gerais
        </button>
        <button
          type="button"
          className={`dc-cockpit-tab${aba === 'disparos' ? ' dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setAba('disparos')}
        >
          Solicitação de Cotação
        </button>
        <button
          type="button"
          className={`dc-cockpit-tab${aba === 'respostas' ? ' dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setAba('respostas')}
        >
          Propostas
        </button>
        <button type="button" className="dc-cockpit-tab dc-cockpit-tab--em-breve" disabled>
          Comentários
          <span className="cfg-badge-breve">Em breve</span>
        </button>
        <button type="button" className="dc-cockpit-tab dc-cockpit-tab--em-breve" disabled>
          Documentos
          <span className="cfg-badge-breve">Em breve</span>
        </button>
      </nav>

      {aba === 'visao_geral' && <AbaVisaoGeral dados={dados} />}
      {aba === 'dados_gerais' && <AbaDadosGerais dados={dados} dataEnvio={dataEnvio} />}
      {aba === 'disparos' && <AbaSolicitacaoCotacao dados={dados} dataEnvio={dataEnvio} />}
      {aba === 'respostas' && (
        <AbaRespostasPainel cotacao={cotacao} convidados={convidados} />
      )}
    </div>
  )
}


type PropostaDemoPainel = {
  fornecedor: string
  valorUsd: number
  transitDias: number
  freeTimeDias: number
  escala: string
  colocacaoGeral: number
  colocacaoFrete: string
  colocacaoTransit: string
  colocacaoEscala: string
}

type DisparoDemoPainel = {
  fornecedor: string
  status: 'ENVIADO' | 'VISUALIZADO' | 'RESPONDIDO' | 'RECUSADO'
  motivo: string | null
  dataResposta: string | null
}

function montarPropostasDemo(
  cotacao: CotacaoSimuladorBidFrete,
  fornecedores: { id: string; nome: string }[],
): PropostaDemoPainel[] {
  if (cotacao.propostasRecebidas === 0) return []
  const base = cotacao.melhorLanceUsd ?? 5000
  const transitBase = cotacao.transitTimeDias ?? 20
  const respondentes = fornecedores.slice(0, cotacao.propostasRecebidas)
  const propostas = respondentes
    .map((f, i) => ({
      fornecedor: i === 0 && cotacao.fornecedorLider ? cotacao.fornecedorLider : f.nome,
      valorUsd: i === 0 ? base : Math.round(base * (1 + 0.05 * i)),
      transitDias: i === 0 ? transitBase : transitBase + i * 3,
      freeTimeDias: 30 - i * 2,
      escala: i === 0 ? 'Direto' : i === 1 ? 'Direto' : `${i} escala(s)`,
    }))
    .sort((a, b) => a.valorUsd - b.valorUsd)

  const total = propostas.length
  const ordenadoTransit = [...propostas].sort((a, b) => a.transitDias - b.transitDias)

  return propostas.map((p) => {
    const rankFrete = propostas.findIndex((x) => x.fornecedor === p.fornecedor) + 1
    const rankTransit = ordenadoTransit.findIndex((x) => x.fornecedor === p.fornecedor) + 1
    const rotulo = (rank: number) => (rank === 1 ? 'Melhor' : `${rank}º de ${total}`)
    return {
      ...p,
      colocacaoGeral: rankFrete,
      colocacaoFrete: rotulo(rankFrete),
      colocacaoTransit: `${rankTransit}º de ${total}`,
      colocacaoEscala: p.escala === 'Direto' ? rotulo(rankFrete) : `${rankTransit}º de ${total}`,
    }
  })
}

function montarDisparosDemo(
  cotacao: CotacaoSimuladorBidFrete,
  fornecedores: { id: string; nome: string }[],
  dataEnvio: string,
): DisparoDemoPainel[] {
  if (cotacao.status === 'RASCUNHO') return []
  const respondidos = cotacao.propostasRecebidas
  const recusas = resolverRecusasDemo(cotacao)
  const dataResposta = formatarDataCurta(cotacao.dataLimiteResposta)

  return fornecedores.map((f, i) => {
    if (i < respondidos) {
      return { fornecedor: f.nome, status: 'RESPONDIDO', motivo: null, dataResposta }
    }
    if (i < respondidos + recusas) {
      return {
        fornecedor: f.nome,
        status: 'RECUSADO',
        motivo: 'Sem disponibilidade na rota',
        dataResposta: null,
      }
    }
    if (cotacao.status === 'ENVIADA_FORNECEDORES') {
      return { fornecedor: f.nome, status: 'ENVIADO', motivo: null, dataResposta: null }
    }
    return { fornecedor: f.nome, status: 'VISUALIZADO', motivo: null, dataResposta: null }
  })
}

function rotuloStatusDisparo(status: DisparoDemoPainel['status']): string {
  switch (status) {
    case 'RESPONDIDO':
      return 'Respondido'
    case 'RECUSADO':
      return 'Recusado'
    case 'VISUALIZADO':
      return 'Visualizado'
    default:
      return 'Enviado'
  }
}

function classeStatusDisparo(status: DisparoDemoPainel['status']): string {
  switch (status) {
    case 'RESPONDIDO':
      return 'pcs-disparos-status pcs-disparos-status--respondido'
    case 'RECUSADO':
      return 'pcs-disparos-status pcs-disparos-status--recusado'
    case 'VISUALIZADO':
      return 'pcs-disparos-status pcs-disparos-status--visualizado'
    default:
      return 'pcs-disparos-status'
  }
}

function parseEscalaContagemDemo(escala: string): number {
  if (escala.toLowerCase().includes('direto')) return 0
  const match = escala.match(/\d+/)
  return match ? Number(match[0]) : 1
}

const ID_PROPOSTA_DESTAQUE_DEMO_PREFIX = 'prop-demo-'

const CAMPOS_BASE_PROPOSTA_RANKING_DEMO = {
  id_cotacao_bid_frete_internacional: 'cot-sim-demo',
  id_organizacao: 'org-sim-demo',
  id_fornecedor_bid_frete_internacional: 'forn-demo',
  id_disparo_cotacao_bid_frete_internacional: 'disp-demo',
  moeda_proposta_bid_frete_internacional: 'USD',
  taxas_origem_proposta_bid_frete_internacional: 0,
  taxas_destino_proposta_bid_frete_internacional: 0,
  quantidade_transbordo_proposta_bid_frete_internacional: 0,
  validade_proposta_bid_frete_internacional: '2026-12-31',
  observacoes_proposta_bid_frete_internacional: null,
  status_proposta_bid_frete_internacional: 'ENVIADA',
  data_criacao_proposta_bid_frete_internacional: '2026-07-01T12:00:00.000Z',
  data_atualizacao_proposta_bid_frete_internacional: '2026-07-01T12:00:00.000Z',
} as const

function propostasDemoParaRankingBidFrete(
  propostas: PropostaDemoPainel[],
): PropostaRankingBidFreteInternacional[] {
  return propostas.map((p, i) => ({
    ...CAMPOS_BASE_PROPOSTA_RANKING_DEMO,
    id_proposta_bid_frete_internacional: `${ID_PROPOSTA_DESTAQUE_DEMO_PREFIX}${i}`,
    id_fornecedor_bid_frete_internacional: `forn-demo-${i}`,
    id_disparo_cotacao_bid_frete_internacional: `disp-demo-${i}`,
    fornecedor_nome: p.fornecedor,
    ranking_geral: p.colocacaoGeral,
    valor_frete_proposta_bid_frete_internacional: p.valorUsd,
    valor_total_proposta_bid_frete_internacional: p.valorUsd,
    dias_transito_proposta_bid_frete_internacional: p.transitDias,
    dias_free_time_proposta_bid_frete_internacional: p.freeTimeDias,
    quantidade_escala_proposta_bid_frete_internacional: parseEscalaContagemDemo(p.escala),
  }))
}

function criarTextoVsGanhadorSparkDemo(
  t: TFunction,
  melhorMenor: boolean,
  sufixoDiff: string,
): (barra: BarraComparativoInsight, valorGanhador: number) => string {
  return (barra, valorGanhador) => {
    if (barra.destaque) {
      return t('bidfrete.detalhe_cotacao.spark_melhor_proposta', 'Melhor proposta (ganhador)')
    }
    const diff = Math.abs(barra.valor - valorGanhador)
    if (diff === 0) {
      return t('bidfrete.detalhe_cotacao.spark_igual_ganhador', 'Igual ao ganhador')
    }
    const diffFmt = sufixoDiff ? `${diff} ${sufixoDiff}` : String(diff)
    if (melhorMenor) {
      if (barra.valor > valorGanhador) {
        return t('bidfrete.detalhe_cotacao.spark_pior_vs_ganhador', '+{{diff}} vs ganhador', { diff: diffFmt })
      }
      return t('bidfrete.detalhe_cotacao.spark_melhor_vs_ganhador', '{{diff}} melhor que o ganhador', { diff: diffFmt })
    }
    if (barra.valor < valorGanhador) {
      return t('bidfrete.detalhe_cotacao.spark_pior_vs_ganhador_menos', '−{{diff}} vs ganhador', { diff: diffFmt })
    }
    return t('bidfrete.detalhe_cotacao.spark_melhor_vs_ganhador_mais', '+{{diff}} vs ganhador', { diff: diffFmt })
  }
}

const MESES_ABREV_TERMOMETRO_DEMO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

type PontoTermometroHistoricoDemo = { mes: string; valor: number }

type DadosTermometroHistoricoDemo = {
  serie: PontoTermometroHistoricoDemo[]
  valorDele: number
  mediaMercado: number
  savings: number
}

const INCOTERMS_TERMOMETRO_DEMO = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF',
] as const

type TipoBaseTermometroDemo = 'CONTRATADO' | 'PROPOSTAS_RECEBIDAS'

type ComponentePrecoTermometroDemo = 'FRETE_BASE' | 'TAXAS_ORIGEM' | 'TAXAS_DESTINO' | 'TOTAL'

const COMPONENTES_TERMOMETRO_DEMO: ComponentePrecoTermometroDemo[] = [
  'FRETE_BASE',
  'TAXAS_ORIGEM',
  'TAXAS_DESTINO',
  'TOTAL',
]

type FiltrosTermometroHistoricoDemo = {
  bases: TipoBaseTermometroDemo[]
  componentes: ComponentePrecoTermometroDemo[]
  incotermsSelecionados: string[]
  incotermCotacao: string
}

function rotuloComponenteTermometroDemo(componente: ComponentePrecoTermometroDemo): string {
  switch (componente) {
    case 'FRETE_BASE':
      return 'Frete base'
    case 'TAXAS_ORIGEM':
      return 'Taxas origem'
    case 'TAXAS_DESTINO':
      return 'Taxas destino'
    case 'TOTAL':
      return 'Total'
    default:
      return componente
  }
}

function fatorAjusteTermometroDemo(filtros: FiltrosTermometroHistoricoDemo): number {
  let fator = 1
  const { componentes, bases, incotermsSelecionados, incotermCotacao } = filtros

  if (componentes.includes('TOTAL')) {
    fator *= 1.18
  } else {
    if (componentes.includes('TAXAS_ORIGEM')) fator *= 1.08
    if (componentes.includes('TAXAS_DESTINO')) fator *= 1.06
  }

  const contratado = bases.includes('CONTRATADO')
  const propostas = bases.includes('PROPOSTAS_RECEBIDAS')
  if (contratado && propostas) fator *= 1.02
  else if (propostas) fator *= 1.05

  if (incotermsSelecionados.length > 0) {
    fator *= incotermsSelecionados.includes(incotermCotacao) ? 0.97 : 1.04
  }

  return fator
}

function rotuloMesAnoTermometroDemo(data: Date): string {
  const mes = MESES_ABREV_TERMOMETRO_DEMO[data.getMonth()]
  if (mes == null) return '—'
  return `${mes}/${String(data.getFullYear()).slice(-2)}`
}

function ultimos6MesesRotulosTermometroDemo(): string[] {
  const agora = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
    return rotuloMesAnoTermometroDemo(d)
  })
}

function montarTermometroHistoricoDemo(
  valorDeleBase: number,
  filtros?: Partial<FiltrosTermometroHistoricoDemo>,
): DadosTermometroHistoricoDemo {
  const filtrosCompletos: FiltrosTermometroHistoricoDemo = {
    bases: filtros?.bases ?? ['CONTRATADO'],
    componentes: filtros?.componentes ?? ['FRETE_BASE'],
    incotermsSelecionados: filtros?.incotermsSelecionados ?? [],
    incotermCotacao: filtros?.incotermCotacao ?? 'FOB',
  }
  const valorDele = Math.round(valorDeleBase * fatorAjusteTermometroDemo(filtrosCompletos))
  const meses = ultimos6MesesRotulosTermometroDemo()
  const mediaMercado = Math.round(valorDele * 1.11)
  const fatores = [0.92, 0.96, 1.02, 0.98, 1.05, 1.0]
  const serie = meses.map((mes, i) => ({
    mes,
    valor: Math.round(mediaMercado * (fatores[i] ?? 1)),
  }))
  return {
    serie,
    valorDele,
    mediaMercado,
    savings: Math.max(0, mediaMercado - valorDele),
  }
}

const TERMOMETRO_PLOT = { W: 320, H: 132, pad: { left: 42, right: 12, top: 10, bottom: 28 } }
const TERMOMETRO_PASSO_EIXO_Y = 500

function calcularEscalaYTermometroHistoricoDemo(valores: number[], passo = TERMOMETRO_PASSO_EIXO_Y) {
  const dataMax = valores.length > 0 ? Math.max(...valores, 1) : 1
  const max = Math.ceil((dataMax * 1.1) / passo) * passo
  const ticks: number[] = []
  for (let valor = 0; valor <= max; valor += passo) ticks.push(valor)
  return { min: 0, max, ticks }
}

function viewBoxParaTelaTermometroDemo(
  x: number,
  y: number,
  viewW: number,
  viewH: number,
  rect: DOMRect,
): { left: number; top: number } {
  const scale = Math.min(rect.width / viewW, rect.height / viewH)
  const offsetX = (rect.width - viewW * scale) / 2
  const offsetY = (rect.height - viewH * scale) / 2
  return {
    left: rect.left + offsetX + x * scale,
    top: rect.top + offsetY + y * scale,
  }
}

function GraficoTermometroHistoricoDemo({
  serie,
  moeda = 'USD',
}: {
  serie: PontoTermometroHistoricoDemo[]
  moeda?: string
}) {
  const uid = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const [indiceAtivo, setIndiceAtivo] = useState<number | null>(null)
  const [ancoraTooltip, setAncoraTooltip] = useState<{ left: number; top: number } | null>(null)
  const { W, H, pad } = TERMOMETRO_PLOT
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const { escalaY, coords } = useMemo(() => {
    const pontosValidos = serie.filter((p) => Number.isFinite(p.valor) && p.valor > 0)
    if (pontosValidos.length === 0) {
      return {
        escalaY: calcularEscalaYTermometroHistoricoDemo([1]),
        coords: [] as Array<{ x: number; y: number; valor: number; mes: string; indice: number }>,
      }
    }

    const valores = pontosValidos.map((p) => p.valor)
    const escalaY = calcularEscalaYTermometroHistoricoDemo(valores)
    const span = Math.max(escalaY.max - escalaY.min, 1)

    const coords = serie.map((p, i) => {
      const valor = Number(p.valor) || 0
      const x = pad.left + (i / Math.max(serie.length - 1, 1)) * innerW
      const y = valor > 0
        ? pad.top + (1 - (valor - escalaY.min) / span) * innerH
        : pad.top + innerH
      return { x, y, valor, mes: p.mes, indice: i }
    })
    return { escalaY, coords }
  }, [serie, innerW, innerH, pad.left, pad.top])

  const linePath = coords
    .filter((c) => c.valor > 0)
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`)
    .join(' ')
  const pontosComValor = coords.filter((c) => c.valor > 0)
  const areaPath =
    pontosComValor.length > 0
      ? `${linePath} L${pontosComValor[pontosComValor.length - 1].x},${pad.top + innerH} L${pontosComValor[0].x},${pad.top + innerH} Z`
      : ''

  const pontoAtivo = indiceAtivo != null ? coords[indiceAtivo] : null

  const atualizarAncoraTooltip = useCallback(
    (indice: number | null) => {
      const wrap = wrapRef.current
      if (wrap == null || indice == null) {
        setAncoraTooltip(null)
        return
      }
      const ponto = coords[indice]
      if (ponto == null || ponto.valor <= 0) {
        setAncoraTooltip(null)
        return
      }
      const tela = viewBoxParaTelaTermometroDemo(ponto.x, ponto.y, W, H, wrap.getBoundingClientRect())
      setAncoraTooltip(tela)
    },
    [coords, W, H],
  )

  const indicePorPosicaoX = useCallback(
    (ratioX: number) => {
      if (serie.length === 0) return null
      const plotRatio = (ratioX - pad.left / W) / (innerW / W)
      const clamped = Math.max(0, Math.min(1, plotRatio))
      return Math.round(clamped * (serie.length - 1))
    },
    [serie.length, pad.left, innerW, W],
  )

  const atualizarPorEvento = useCallback(
    (clientX: number, rect: DOMRect) => {
      const idx = indicePorPosicaoX((clientX - rect.left) / rect.width)
      setIndiceAtivo(idx)
      atualizarAncoraTooltip(idx)
    },
    [indicePorPosicaoX, atualizarAncoraTooltip],
  )

  useEffect(() => {
    if (indiceAtivo == null) return undefined
    const reposicionar = () => atualizarAncoraTooltip(indiceAtivo)
    window.addEventListener('scroll', reposicionar, true)
    window.addEventListener('resize', reposicionar)
    return () => {
      window.removeEventListener('scroll', reposicionar, true)
      window.removeEventListener('resize', reposicionar)
    }
  }, [atualizarAncoraTooltip, indiceAtivo])

  const formatarValor = (valor: number) => formatarUsdSimuladorBidFrete(valor).replace('USD ', `${moeda} `)

  if (coords.length === 0) return null

  return (
    <div
      ref={wrapRef}
      className="pcs-termometro-chart-wrap"
      onMouseMove={(e) => atualizarPorEvento(e.clientX, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => {
        setIndiceAtivo(null)
        setAncoraTooltip(null)
      }}
      role="img"
      aria-label="Histórico de frete pago nas mesmas condições operacionais"
    >
      {pontoAtivo != null && pontoAtivo.valor > 0 && ancoraTooltip != null
        ? ReactDOM.createPortal(
            <div
              role="tooltip"
              className="pcs-termometro-chart-tooltip pcs-termometro-chart-tooltip--portal"
              style={{ top: ancoraTooltip.top, left: ancoraTooltip.left }}
            >
              <span className="pcs-termometro-chart-tooltip-mes">{pontoAtivo.mes}</span>
              <span className="pcs-termometro-chart-tooltip-valor">{formatarValor(pontoAtivo.valor)}</span>
            </div>,
            document.body,
          )
        : null}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="pcs-termometro-chart"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={`pcs-term-area-${uid}`}
            gradientUnits="userSpaceOnUse"
            x1={pad.left}
            y1={pad.top}
            x2={W - pad.right}
            y2={pad.top + innerH}
          >
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.5)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.15)" />
          </linearGradient>
          <linearGradient id={`pcs-term-line-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="rgba(15, 23, 42, 0.25)"
          rx={6}
        />
        {escalaY.ticks.map((valorTick) => {
          const y = pad.top + (1 - valorTick / escalaY.max) * innerH
          const linhaBase = valorTick === 0
          return (
            <g key={valorTick}>
              <line
                x1={pad.left}
                y1={y}
                x2={W - pad.right}
                y2={y}
                stroke="rgba(148, 163, 184, 0.18)"
                strokeDasharray={linhaBase ? undefined : '4,5'}
              />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="600">
                {valorTick}
              </text>
            </g>
          )
        })}
        {areaPath ? <path d={areaPath} fill={`url(#pcs-term-area-${uid})`} className="pcs-termometro-area-fill" /> : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke={`url(#pcs-term-line-${uid})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {pontoAtivo != null && pontoAtivo.valor > 0 ? (
          <line
            x1={pontoAtivo.x}
            y1={pad.top}
            x2={pontoAtivo.x}
            y2={pad.top + innerH}
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ) : null}
        {coords.map((c) => {
          if (c.valor <= 0) return null
          const ativo = indiceAtivo === c.indice
          return (
            <g key={`${c.mes}-${c.indice}`}>
              <circle
                cx={c.x}
                cy={c.y}
                r={ativo ? 7 : 4}
                fill={ativo ? '#34d399' : '#60a5fa'}
                stroke={ativo ? '#ecfdf5' : '#1e293b'}
                strokeWidth={ativo ? 2 : 1}
              />
              <text
                x={c.x}
                y={H - 8}
                textAnchor="middle"
                fill={ativo ? '#f1f5f9' : '#94a3b8'}
                fontSize="9"
                fontWeight={ativo ? '700' : '600'}
              >
                {c.mes}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function CardTermometroHistoricoInsight({ dados }: { dados: DadosTermometroHistoricoDemo }) {
  return (
    <div className="pcs-termometro-canvas">
      <div className="pcs-termometro-metricas">
        <div className="pcs-termometro-dele-mercado">
          <div className="pcs-termometro-preco pcs-termometro-preco--mercado">
            <span className="pcs-termometro-preco-rotulo">Mercado</span>
            <p className="pcs-termometro-valor">{formatarUsdSimuladorBidFrete(dados.mediaMercado)}</p>
            <span className="pcs-termometro-sub">Média 6 meses</span>
          </div>
          {dados.savings > 0 ? (
            <span className="pcs-termometro-savings">
              {`Savings de ${formatarUsdSimuladorBidFrete(dados.savings)}`}
            </span>
          ) : null}
        </div>
      </div>
      <div className="pcs-termometro-chart-slot">
        <GraficoTermometroHistoricoDemo serie={dados.serie} />
      </div>
    </div>
  )
}


function TermometroHistoricoCardDemo({
  valorDeleUsd,
  incotermCotacao,
  exibirConteudo,
}: {
  valorDeleUsd: number | null
  incotermCotacao: string
  exibirConteudo: boolean
}) {
  const [bases, setBases] = useState<TipoBaseTermometroDemo[]>(['CONTRATADO'])
  const [componentes, setComponentes] = useState<ComponentePrecoTermometroDemo[]>(['FRETE_BASE'])
  const [incotermsSelecionados, setIncotermsSelecionados] = useState<string[]>([])
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const filtroBotaoRef = useRef<HTMLDivElement>(null)
  const filtroPainelRef = useRef<HTMLDivElement>(null)
  const [filtroCoords, setFiltroCoords] = useState({ top: 0, right: 0 })

  const alternarIncoterm = useCallback((item: string) => {
    setIncotermsSelecionados((atual) => (
      atual.includes(item) ? atual.filter((i) => i !== item) : [...atual, item]
    ))
  }, [])

  const alternarBase = useCallback((item: TipoBaseTermometroDemo) => {
    setBases((atual) => {
      const proximo = atual.includes(item)
        ? atual.filter((b) => b !== item)
        : [...atual, item]
      return proximo.length > 0 ? proximo : atual
    })
  }, [])

  const alternarComponente = useCallback((item: ComponentePrecoTermometroDemo) => {
    setComponentes((atual) => {
      if (item === 'TOTAL') return ['TOTAL']
      const semTotal = atual.filter((c) => c !== 'TOTAL')
      const proximo = semTotal.includes(item)
        ? semTotal.filter((c) => c !== item)
        : [...semTotal, item]
      return proximo.length > 0 ? proximo : atual
    })
  }, [])

  const atualizarFiltroCoords = useCallback(() => {
    if (!filtroBotaoRef.current) return
    const rect = filtroBotaoRef.current.getBoundingClientRect()
    setFiltroCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
  }, [])

  useEffect(() => {
    if (!filtrosAbertos) return undefined
    atualizarFiltroCoords()
    window.addEventListener('resize', atualizarFiltroCoords)
    window.addEventListener('scroll', atualizarFiltroCoords, true)
    return () => {
      window.removeEventListener('resize', atualizarFiltroCoords)
      window.removeEventListener('scroll', atualizarFiltroCoords, true)
    }
  }, [filtrosAbertos, atualizarFiltroCoords])

  useEffect(() => {
    if (!filtrosAbertos) return undefined
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (filtroBotaoRef.current?.contains(target)) return
      if (filtroPainelRef.current?.contains(target)) return
      setFiltrosAbertos(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filtrosAbertos])

  const dados = useMemo(() => {
    if (valorDeleUsd == null) return null
    return montarTermometroHistoricoDemo(valorDeleUsd, {
      bases,
      componentes,
      incotermsSelecionados,
      incotermCotacao,
    })
  }, [valorDeleUsd, bases, componentes, incotermsSelecionados, incotermCotacao])

  const filtrosDestacados =
    bases.length !== 1
    || bases[0] !== 'CONTRATADO'
    || componentes.length !== 1
    || componentes[0] !== 'FRETE_BASE'
    || incotermsSelecionados.length > 0

  const selecoesFiltros = [
    ...(['CONTRATADO', 'PROPOSTAS_RECEBIDAS'] as const)
      .filter((item) => bases.includes(item))
      .map((item) => (item === 'CONTRATADO' ? 'Contratado' : 'Propostas')),
    ...componentes.map((item) => rotuloComponenteTermometroDemo(item)),
    ...incotermsSelecionados,
  ]

  const valorChipFiltros = selecoesFiltros.length <= 2
    ? selecoesFiltros.join(', ')
    : `${selecoesFiltros.length} selecionados`

  const limparFiltrosTermometro = () => {
    setBases(['CONTRATADO'])
    setComponentes(['FRETE_BASE'])
    setIncotermsSelecionados([])
  }

  const painelFiltros = filtrosAbertos
    ? ReactDOM.createPortal(
        <div
          ref={filtroPainelRef}
          className="pcs-termometro-filtros-painel"
          style={{ top: filtroCoords.top, right: filtroCoords.right }}
          role="dialog"
          aria-label="Filtros do termômetro histórico"
        >
          <div className="pcs-termometro-filtros-secao" role="listbox" aria-multiselectable="true" aria-label="Base do termômetro histórico">
            <span className="pcs-termometro-filtros-secao-titulo">Base</span>
            {(['CONTRATADO', 'PROPOSTAS_RECEBIDAS'] as const).map((item) => {
              const ativo = bases.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  className={`pcs-termometro-filtros-opcao${ativo ? ' pcs-termometro-filtros-opcao--ativa' : ''}`}
                  onClick={() => alternarBase(item)}
                >
                  <span
                    className={`pcs-termometro-filtros-check pcs-termometro-filtros-check--caixa${ativo ? ' pcs-termometro-filtros-check--marcado' : ''}`}
                    aria-hidden
                  >
                    {ativo ? <Check size={11} weight="bold" /> : null}
                  </span>
                  {item === 'CONTRATADO' ? 'Contratado' : 'Propostas'}
                </button>
              )
            })}
          </div>
          <div className="pcs-termometro-filtros-separador" role="separator" />
          <div className="pcs-termometro-filtros-secao" role="listbox" aria-multiselectable="true" aria-label="Componente de preço">
            <span className="pcs-termometro-filtros-secao-titulo">Componente</span>
            {COMPONENTES_TERMOMETRO_DEMO.map((item) => {
              const ativo = componentes.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  className={`pcs-termometro-filtros-opcao${ativo ? ' pcs-termometro-filtros-opcao--ativa' : ''}`}
                  onClick={() => alternarComponente(item)}
                >
                  <span
                    className={`pcs-termometro-filtros-check pcs-termometro-filtros-check--caixa${ativo ? ' pcs-termometro-filtros-check--marcado' : ''}`}
                    aria-hidden
                  >
                    {ativo ? <Check size={11} weight="bold" /> : null}
                  </span>
                  {rotuloComponenteTermometroDemo(item)}
                </button>
              )
            })}
          </div>
          <div className="pcs-termometro-filtros-separador" role="separator" />
          <div className="pcs-termometro-filtros-secao" role="listbox" aria-multiselectable="true" aria-label="Filtrar por incoterm">
            <span className="pcs-termometro-filtros-secao-titulo">Incoterm</span>
            <button
              type="button"
              role="option"
              aria-selected={incotermsSelecionados.length === 0}
              className={`pcs-termometro-filtros-opcao${incotermsSelecionados.length === 0 ? ' pcs-termometro-filtros-opcao--ativa' : ''}`}
              onClick={() => setIncotermsSelecionados([])}
            >
              <span
                className={`pcs-termometro-filtros-check pcs-termometro-filtros-check--caixa${incotermsSelecionados.length === 0 ? ' pcs-termometro-filtros-check--marcado' : ''}`}
                aria-hidden
              >
                {incotermsSelecionados.length === 0 ? <Check size={11} weight="bold" /> : null}
              </span>
              Todos
            </button>
            <div className="pcs-termometro-filtros-incoterm-grid">
              {INCOTERMS_TERMOMETRO_DEMO.map((item) => {
                const ativo = incotermsSelecionados.includes(item)
                const daCotacao = item === incotermCotacao
                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={ativo}
                    className={`pcs-termometro-filtros-incoterm-chip${ativo ? ' pcs-termometro-filtros-incoterm-chip--ativo' : ''}${daCotacao ? ' pcs-termometro-filtros-incoterm-chip--cotacao' : ''}`}
                    title={daCotacao ? 'Incoterm desta cotação' : undefined}
                    onClick={() => alternarIncoterm(item)}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <div className="pcs-insight-card-cabecalho">
        <span className="pcs-insight-card-titulo">Termômetro histórico</span>
        <div className="pcs-termometro-head-acoes" ref={filtroBotaoRef}>
          {filtrosDestacados ? (
            <span className="pcs-termometro-chip" role="status">
              <TooltipGlobal
                titulo="Filtros"
                descricao={(
                  <ol className="pcs-termometro-chip-lista">
                    {selecoesFiltros.map((item, i) => (
                      <li key={`${item}-${i}`}>
                        <span className="pcs-termometro-chip-lista-indice">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              >
                <button
                  type="button"
                  className="pcs-termometro-chip-body"
                  onClick={() => setFiltrosAbertos(true)}
                >
                  <span className="pcs-termometro-chip-label">Filtros:</span>
                  <span className="pcs-termometro-chip-valor">{valorChipFiltros}</span>
                </button>
              </TooltipGlobal>
              <button
                type="button"
                className="pcs-termometro-chip-remove"
                aria-label="Limpar filtros do termômetro"
                onClick={limparFiltrosTermometro}
              >
                <X size={9} weight="bold" aria-hidden />
              </button>
            </span>
          ) : null}
          <button
            type="button"
            className={`pcs-termometro-filtros-botao${filtrosDestacados ? ' pcs-termometro-filtros-botao--destacado' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={filtrosAbertos}
            aria-label="Filtros do termômetro histórico"
            title="Filtros"
            onClick={() => setFiltrosAbertos((v) => !v)}
          >
            <FunnelSimple weight={filtrosDestacados ? 'fill' : 'bold'} size={13} aria-hidden />
            {!filtrosDestacados ? (
              <span className="pcs-termometro-filtros-botao-rotulo">Filtros</span>
            ) : null}
          </button>
        </div>
      </div>
      {painelFiltros}
      {exibirConteudo && dados ? (
        <CardTermometroHistoricoInsight dados={dados} />
      ) : (
        <div className="pcs-insight-vazio pcs-insight-vazio--termometro">
          <ThermometerSimple weight="duotone" size={26} />
          <span>Aguardando cotações aprovadas nas mesmas condições.</span>
          <small>Mesma operação, rota e modal — ver documentação para faixas.</small>
        </div>
      )}
    </>
  )
}
function CelulaMetricaSparkDemo({
  label,
  valor,
  comparativo,
  rotuloMetrica,
  formatarValor,
  sufixoDiff = '',
}: {
  label: string
  valor: string
  comparativo: ComparativoMetricaPainel | null
  rotuloMetrica: string
  formatarValor: (v: number) => string
  sufixoDiff?: string
}) {
  const { t } = useTranslation()
  const textoVsGanhador = comparativo != null
    ? criarTextoVsGanhadorSparkDemo(t, comparativo.melhorMenor, sufixoDiff)
    : () => ''

  if (comparativo == null || comparativo.barras.length === 0) {
    return (
      <div className="pcs-insight-metrica">
        <span className="pcs-insight-metrica-label">{label}</span>
        <strong>{valor}</strong>
      </div>
    )
  }

  return (
    <div className="pcs-insight-metrica pcs-insight-metrica--spark">
      <div className="pcs-insight-metrica-texto">
        <span className="pcs-insight-metrica-label">{label}</span>
        <strong>{valor}</strong>
      </div>
      <div className="pcs-insight-metrica-spark dc-smart-metrica-spark dc-smart-metrica-spark--melhor-proposta">
        <SparkBarrasComparativo
          barras={comparativo.barras}
          melhorMenor={comparativo.melhorMenor}
          variante="indigo"
          rotuloMetrica={rotuloMetrica}
          formatarValor={formatarValor}
          textoVsGanhador={textoVsGanhador}
          ancoraBarras="base"
          preencherSlot
        />
      </div>
    </div>
  )
}

function InsightsGridPainel({
  cotacao,
  convidados,
}: {
  cotacao: CotacaoSimuladorBidFrete
  convidados: { id: string; nome: string }[]
}) {
  const { t } = useTranslation()
  const temRespostas = cotacao.propostasRecebidas > 0
  const lance = cotacao.melhorLanceUsd != null ? formatarUsdSimuladorBidFrete(cotacao.melhorLanceUsd) : null
  const fornecedor = cotacao.fornecedorLider
  const propostas = montarPropostasDemo(cotacao, convidados)
  const maxValor = propostas[0]?.valorUsd ?? 1
  const melhor = propostas[0]
  const exibirComparativoCompleto =
    propostas.length >= 2 && cotacaoExibeComparativoPropostas(cotacao.status)
  const idDestaque = `${ID_PROPOSTA_DESTAQUE_DEMO_PREFIX}0`
  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const fmtDias = useCallback((v: number) => `${v} ${diasLabel}`, [diasLabel])
  const fmtEscala = useCallback(
    (v: number) => (v === 0 ? t('bidfrete.comparativo.direto', 'Direto') : String(v)),
    [t],
  )
  const comparativos = useMemo(() => {
    const ranking = propostasDemoParaRankingBidFrete(propostas)
    return {
      transito: buildComparativoMetrica(
        ranking,
        (p) => p.dias_transito_proposta_bid_frete_internacional,
        true,
        fmtDias,
        idDestaque,
      ),
      freeTime: buildComparativoMetrica(
        ranking,
        (p) => p.dias_free_time_proposta_bid_frete_internacional ?? 0,
        false,
        (v) => (v > 0 ? fmtDias(v) : '—'),
        idDestaque,
      ),
      escala: buildComparativoMetrica(
        ranking,
        (p) => p.quantidade_escala_proposta_bid_frete_internacional,
        true,
        fmtEscala,
        idDestaque,
      ),
    }
  }, [propostas, fmtDias, fmtEscala, idDestaque])

  const vazio = (
    <div className="pcs-insight-vazio">
      <PaperPlaneTilt weight="duotone" size={26} />
      <span>Nenhuma resposta recebida ainda</span>
    </div>
  )

  return (
    <div className="pcs-insights-grid">
      <div className={`pcs-insight-card pcs-insight-card--melhor-layout${exibirComparativoCompleto ? ' pcs-insight-card--melhor' : ''}`}>
        <div className="pcs-insight-card-cabecalho">
          <span className="pcs-insight-card-titulo">Melhor proposta</span>
          {exibirComparativoCompleto ? <Trophy weight="duotone" size={18} className="pcs-insight-trofeu" aria-hidden /> : null}
        </div>
        {exibirComparativoCompleto && melhor && lance ? (
          <>
            <div className="pcs-insight-melhor-body">
              <p className="pcs-insight-valor-hero">{lance}</p>
              <div className="pcs-insight-metricas-row">
                <CelulaMetricaSparkDemo
                  label="Transit Time"
                  valor={`${melhor.transitDias} dias`}
                  comparativo={comparativos.transito}
                  rotuloMetrica={t('bidfrete.detalhe_cotacao.cockpit_transit_time', 'Transit Time')}
                  formatarValor={fmtDias}
                  sufixoDiff="dias"
                />
                <CelulaMetricaSparkDemo
                  label="Free Time"
                  valor={`${melhor.freeTimeDias} dias`}
                  comparativo={comparativos.freeTime}
                  rotuloMetrica={t('bidfrete.detalhe_cotacao.info_free_time', 'Free Time')}
                  formatarValor={(v) => (v > 0 ? fmtDias(v) : '—')}
                  sufixoDiff="dias"
                />
                <CelulaMetricaSparkDemo
                  label="Escala"
                  valor={melhor.escala}
                  comparativo={comparativos.escala}
                  rotuloMetrica={t('bidfrete.detalhe_cotacao.cockpit_escala', 'Escala')}
                  formatarValor={fmtEscala}
                  sufixoDiff="escala(s)"
                />
              </div>
            </div>
            <footer className="pcs-insight-fornecedor-foot">
              <span className="pcs-insight-fornecedor-avatar" aria-hidden>
                {melhor.fornecedor.slice(0, 1).toUpperCase()}
              </span>
              <span className="pcs-insight-fornecedor-nome" title={melhor.fornecedor}>
                {melhor.fornecedor.length > 24 ? `${melhor.fornecedor.slice(0, 22)}…` : melhor.fornecedor}
              </span>
              {cotacao.status === 'AGUARDANDO_APROVACAO' ? (
                <BotaoDemoDesativado
                  titulo="Aprovar proposta"
                  descricao="Confirma o fornecedor vencedor — recurso do tenant completo"
                  className="pcs-btn-aprovar pcs-btn-aprovar--foot"
                >
                  <CheckCircle weight="bold" size={14} />
                  Aprovar
                </BotaoDemoDesativado>
              ) : null}
            </footer>
          </>
        ) : temRespostas && fornecedor && lance ? (
          <div className="pcs-insight-preenchido">
            <strong>{fornecedor}</strong>
            <span className="pcs-insight-valor">{lance}</span>
          </div>
        ) : (
          vazio
        )}
      </div>
      <div className="pcs-insight-card pcs-insight-card--ranking">
        <span className="pcs-insight-card-titulo">Ranking das respostas</span>
        {propostas.length >= 2 ? (
          <ul className="pcs-insight-ranking">
            {propostas.map((p, idx) => (
              <li key={`${p.fornecedor}-${idx}`}>
                <span className="pcs-insight-ranking-nome">{p.fornecedor}</span>
                <span className="pcs-insight-ranking-barra" aria-hidden>
                  <span style={{ width: `${Math.round((maxValor / p.valorUsd) * 100)}%` }} />
                </span>
                <span className="pcs-insight-ranking-valor">{formatarUsdSimuladorBidFrete(p.valorUsd)}</span>
              </li>
            ))}
          </ul>
        ) : temRespostas && fornecedor && lance ? (
          <div className="pcs-insight-preenchido pcs-insight-preenchido--compacto">
            <strong>{fornecedor}</strong>
            <span className="pcs-insight-valor">{lance}</span>
            <small>Aguardando mais respostas para o ranking comparativo.</small>
          </div>
        ) : (
          vazio
        )}
      </div>
      <div className="pcs-insight-card pcs-insight-card--termometro">
        <TermometroHistoricoCardDemo
          valorDeleUsd={exibirComparativoCompleto && melhor ? melhor.valorUsd : null}
          incotermCotacao={cotacao.incoterm}
          exibirConteudo={exibirComparativoCompleto && !!melhor}
        />
      </div>
    </div>
  )
}

function AbaRespostasPainel({
  cotacao,
  convidados,
}: {
  cotacao: CotacaoSimuladorBidFrete
  convidados: { id: string; nome: string }[]
}) {
  const propostas = montarPropostasDemo(cotacao, convidados)
  const exibirComparativo = propostas.length > 0 && cotacaoExibeComparativoPropostas(cotacao.status)

  if (propostas.length === 0) {
    return (
      <div className="pcs-respostas-vazio">
        <PaperPlaneTilt weight="duotone" size={30} />
        <span>
          {cotacao.status === 'RASCUNHO'
            ? 'Envie a cotação para receber propostas dos fornecedores.'
            : 'Nenhuma resposta recebida ainda'}
        </span>
      </div>
    )
  }

  if (exibirComparativo) {
    return (
      <div className="pcs-propostas-comparativo">
        <div className="pcs-propostas-ordenar">
          <span className="pcs-propostas-ordenar-label">Ordenar por:</span>
          <span className="pcs-propostas-ordenar-chip pcs-propostas-ordenar-chip--ativa">Score geral</span>
          <span className="pcs-propostas-ordenar-chip">Menor preço</span>
          <span className="pcs-propostas-ordenar-chip">Melhor trânsito</span>
          <span className="pcs-propostas-ordenar-chip">Melhor avaliação</span>
          <span className="pcs-propostas-ordenar-chip">Menor transbordo</span>
          <span className="pcs-propostas-ordenar-chip">Maior free time</span>
        </div>
        <div className="pcs-propostas-grid">
          {propostas.map((p) => (
            <article
              key={p.fornecedor}
              className={`pcs-proposta-card${p.colocacaoGeral === 1 ? ' pcs-proposta-card--lider' : ''}`}
            >
              <div className="pcs-proposta-card-topo">
                <span className="pcs-proposta-rank">
                  {p.colocacaoGeral === 1 ? <Trophy weight="duotone" size={16} /> : null}
                  {p.colocacaoGeral}º
                </span>
                <strong>{p.fornecedor}</strong>
                <span className="pcs-proposta-valor">{formatarUsdSimuladorBidFrete(p.valorUsd)}</span>
              </div>
              <div className="pcs-proposta-eixos">
                <span className="pcs-proposta-eixos-titulo">Colocação por eixo</span>
                <div className="pcs-proposta-eixo">
                  <small>Frete total</small>
                  <strong>{p.colocacaoFrete}</strong>
                </div>
                <div className="pcs-proposta-eixo">
                  <small>Transit Time</small>
                  <strong>{p.colocacaoTransit}</strong>
                </div>
                <div className="pcs-proposta-eixo">
                  <small>Escala / Transbordo</small>
                  <strong>{p.colocacaoEscala}</strong>
                </div>
                <div className="pcs-proposta-eixo">
                  <small>Prazo pagamento</small>
                  <strong>—</strong>
                </div>
              </div>
              {cotacao.status === 'AGUARDANDO_APROVACAO' ? (
                <BotaoDemoDesativado
                  titulo="Aprovar proposta"
                  descricao="Confirma este fornecedor — recurso do tenant completo"
                  className="pcs-btn-aprovar pcs-btn-aprovar--card"
                >
                  <SealCheck weight="duotone" size={16} />
                  Aprovar
                </BotaoDemoDesativado>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pcs-respostas-lista">
      {propostas.map((p) => (
        <article
          key={p.fornecedor}
          className={`pcs-resposta-card${p.colocacaoGeral === 1 ? ' pcs-resposta-card--lider' : ''}`}
        >
          <div className="pcs-resposta-card-topo">
            <strong>{p.fornecedor}</strong>
            {p.colocacaoGeral === 1 ? <span className="pcs-resposta-lider">Melhor proposta</span> : null}
          </div>
          <div className="pcs-resposta-metricas">
            <span>{formatarUsdSimuladorBidFrete(p.valorUsd)}</span>
            <span>{p.transitDias} dias · Transit</span>
          </div>
        </article>
      ))}
    </div>
  )
}

// ─── Aba: Visão geral ─────────────────────────────────────────────────────────

function AbaVisaoGeral({ dados }: { dados: DadosPainelCotacaoSimulador }) {
  const { cotacao } = dados
  return (
    <div className="pcs-cards-grid">
      <section className="pcs-card pcs-card--gerais">
        <h3 className="pcs-card-titulo">Detalhes Gerais</h3>
        <InfoRow
          icone={<Package weight="duotone" size={16} />}
          label="Tipo de operação"
          value={OPERACAO_SIMULADOR_BID_FRETE[cotacao.operacao]}
        />
        <InfoRow
          icone={<IconeModal modal={cotacao.modal} />}
          label="Modal"
          value={MODAL_SIMULADOR_BID_FRETE[cotacao.modal].rotulo}
        />
        <InfoRow
          icone={<Cube weight="duotone" size={16} />}
          label="Modalidade"
          value={cotacao.modalidade}
        />
        <InfoRow
          icone={<Scales weight="duotone" size={16} />}
          label="Incoterm"
          value={cotacao.incoterm || '—'}
        />
        <InfoRow
          icone={dados.visibilidade === 'ABERTA'
            ? <Eye weight="duotone" size={16} />
            : <EyeSlash weight="duotone" size={16} />}
          label="Visibilidade"
          value={dados.visibilidade === 'ABERTA'
            ? dados.anonima ? 'Aberta (anônima)' : 'Aberta'
            : 'Direcionada'}
        />
        <InfoRow
          icone={<CurrencyCircleDollar weight="duotone" size={16} />}
          label="Taxa de fechamento paga por"
          value="Fornecedor"
        />
      </section>

      <section className="pcs-card pcs-card--rota">
        <h3 className="pcs-card-titulo">Rota</h3>
        <div className="pcs-rota-visual">
          <div className="pcs-rota-box">
            <span className="pcs-rota-tag pcs-rota-tag--origem">
              <Circle weight="fill" size={7} />
              Origem
            </span>
            <span className="pcs-rota-flag-chip">
              <span aria-hidden>{cotacao.origem.flag}</span>
              {cotacao.origem.pais}
            </span>
            <span className="pcs-rota-cidade">{cotacao.origem.cidade}</span>
            <span className="pcs-rota-codigo">{cotacao.origem.codigo}</span>
          </div>
          <div className="pcs-rota-linha" aria-hidden>
            <span className="pcs-rota-linha-traco" />
            <span className="pcs-rota-linha-icone">
              <IconeModal modal={cotacao.modal} size={15} />
            </span>
            <span className="pcs-rota-linha-traco" />
          </div>
          <div className="pcs-rota-box">
            <span className="pcs-rota-tag pcs-rota-tag--destino">
              <Circle weight="fill" size={7} />
              Destino
            </span>
            <span className="pcs-rota-flag-chip">
              <span aria-hidden>{cotacao.destino.flag}</span>
              {cotacao.destino.pais}
            </span>
            <span className="pcs-rota-cidade">{cotacao.destino.cidade}</span>
            <span className="pcs-rota-codigo">{cotacao.destino.codigo}</span>
          </div>
        </div>
      </section>

      <section className="pcs-card pcs-card--carga">
        <h3 className="pcs-card-titulo">Detalhes da Carga</h3>
        <div className="pcs-mercadoria-destaque">
          <Cube weight="duotone" size={20} className="pcs-mercadoria-icone" />
          <div>
            <span className="pcs-info-label">Mercadoria</span>
            <p className="pcs-mercadoria-texto">{dados.descricaoMercadoria || '—'}</p>
          </div>
        </div>
        <InfoRow label="NCM" value={dados.ncm || '—'} />
        <InfoRow label="Quantidade de volumes" value={dados.quantidadeVolumes || '—'} />
        <InfoRow
          label="Peso"
          value={dados.pesoKg ? `${Number(dados.pesoKg).toLocaleString('pt-BR')} Kg` : '—'}
        />
        {dados.tipoContainer && <InfoRow label="Tipo de container" value={dados.tipoContainer} />}
        <InfoRow label="Cubagem" value={dados.cubagemM3 ? `${dados.cubagemM3} m³` : '—'} />
        {dados.cargaPerigosa && (
          <InfoRow
            label="Carga perigosa"
            value={dados.numeroOnu ? `ONU ${dados.numeroOnu}` : 'Sim'}
          />
        )}
      </section>
    </div>
  )
}

// ─── Aba: Dados gerais (campos editáveis do produto — somente leitura na demo) ─

function CampoDado({
  icone,
  label,
  valor,
  badge = 'EDITÁVEL',
}: {
  icone: ReactNode
  label: string
  valor: string
  badge?: 'EDITÁVEL' | 'SOMENTE LEITURA'
}) {
  return (
    <div className={`pcs-dado-card${badge === 'EDITÁVEL' ? ' pcs-dado-card--editavel' : ''}`}>
      <div className="pcs-dado-card-topo">
        <span className="pcs-dado-card-label">
          {icone}
          {label}
        </span>
        <span className={`pcs-dado-badge${badge === 'EDITÁVEL' ? '' : ' pcs-dado-badge--leitura'}`}>
          {badge === 'EDITÁVEL' ? <Tag size={10} weight="fill" /> : <Eye size={10} weight="fill" />}
          {badge}
        </span>
      </div>
      <span className="pcs-dado-card-valor">{valor}</span>
    </div>
  )
}

function AbaDadosGerais({
  dados,
  dataEnvio,
}: {
  dados: DadosPainelCotacaoSimulador
  dataEnvio: string
}) {
  const { cotacao } = dados
  const prazo = `${formatarDataCurta(cotacao.dataLimiteResposta)}, ${dados.prazoHora || '23:59'}`
  return (
    <div className="pcs-dados-gerais">
      <section className="pcs-dados-secao">
        <div className="pcs-dados-secao-cabecalho">
          <span className="pcs-dados-secao-titulo">
            <IdentificationCard weight="duotone" size={16} />
            Identificação
          </span>
          <span className="pcs-dados-secao-progresso">
            <span className="pcs-dados-secao-progresso-barra"><span style={{ width: '66%' } as CSSProperties} /></span>
            2/3
          </span>
        </div>
        <div className="pcs-dados-secao-grid">
          <CampoDado icone={<Hash weight="duotone" size={13} />} label="Número" valor={cotacao.numero} />
          <CampoDado icone={<Tag weight="duotone" size={13} />} label="Referência interna" valor="—" />
          <CampoDado icone={<Circle weight="duotone" size={13} />} label="Status" valor={STATUS_SIMULADOR_BID_FRETE[cotacao.status].rotulo} />
        </div>
      </section>

      <section className="pcs-dados-secao">
        <div className="pcs-dados-secao-cabecalho">
          <span className="pcs-dados-secao-titulo">
            <ClockCounterClockwise weight="duotone" size={16} />
            Cronograma
          </span>
          <span className="pcs-dados-secao-progresso">
            <span className="pcs-dados-secao-progresso-barra"><span style={{ width: '57%' } as CSSProperties} /></span>
            4/7
          </span>
        </div>
        <div className="pcs-dados-secao-grid">
          <CampoDado icone={<CalendarBlank weight="duotone" size={13} />} label="Data de criação" valor={dataEnvio} />
          <CampoDado
            icone={<PaperPlaneTilt weight="duotone" size={13} />}
            label="Primeiro envio"
            valor={cotacao.status === 'RASCUNHO' ? '—' : dataEnvio}
            badge="SOMENTE LEITURA"
          />
          <CampoDado icone={<Clock weight="duotone" size={13} />} label="Prazo para resposta" valor={prazo} />
          <CampoDado
            icone={<ChatCircleText weight="duotone" size={13} />}
            label="Última resposta"
            valor={cotacao.propostasRecebidas > 0 ? formatarDataCurta(cotacao.dataLimiteResposta) : '—'}
            badge="SOMENTE LEITURA"
          />
          <CampoDado
            icone={<SealCheck weight="duotone" size={13} />}
            label="Data aprovação"
            valor={cotacao.status === 'APROVADA' ? formatarDataCurta(cotacao.dataLimiteResposta) : '—'}
          />
          <CampoDado
            icone={<XCircle weight="duotone" size={13} />}
            label="Data cancelamento"
            valor={cotacao.status === 'REPROVADA' ? formatarDataCurta(cotacao.dataLimiteResposta) : '—'}
          />
        </div>
      </section>
    </div>
  )
}

// ─── Aba: Solicitação de Cotação (disparos aos fornecedores) ──────────────────

function AbaSolicitacaoCotacao({
  dados,
  dataEnvio,
}: {
  dados: DadosPainelCotacaoSimulador
  dataEnvio: string
}) {
  const { cotacao } = dados
  const dataEnvioCurta = formatarDataCurta(cotacao.dataCriacao)
  const disparos = montarDisparosDemo(cotacao, dados.fornecedoresConvidados, dataEnvioCurta)

  if (cotacao.status === 'RASCUNHO' || disparos.length === 0) {
    return (
      <div className="pcs-respostas-vazio">
        <PaperPlaneTilt weight="duotone" size={30} />
        <span>Envie a cotação para disparar solicitações aos fornecedores.</span>
      </div>
    )
  }

  return (
    <div className="pcs-disparos">
      <div className="pcs-disparos-acoes-topo">
        <BotaoDemoDesativado
          titulo="Enviar aos fornecedores"
          descricao="Reenvia a solicitação por e-mail — recurso do tenant completo"
          className="pcs-btn-enviar-fornecedores"
        >
          <PaperPlaneTilt weight="duotone" size={14} />
          Enviar aos fornecedores
        </BotaoDemoDesativado>
      </div>
      <div className="pcs-disparos-card">
        <div className="pcs-disparos-toolbar">
          <span className="pcs-disparos-busca">
            <MagnifyingGlass size={13} />
            Buscar…
          </span>
          <BotaoDemoDesativado
            titulo="Exportar"
            descricao="Exporta a tabela de disparos — recurso do tenant completo"
            className="pcs-disparos-exportar"
          >
            Exportar
          </BotaoDemoDesativado>
        </div>
        <table className="pcs-disparos-tabela">
          <thead>
            <tr>
              <th className="pcs-disparos-col-check" aria-label="Selecionar" />
              <th>Fornecedor</th>
              <th>Canal da solicitação</th>
              <th>Status</th>
              <th>Motivo</th>
              <th>Link resposta</th>
              <th>Data de envio</th>
              <th>Data de resposta</th>
            </tr>
          </thead>
          <tbody>
            {disparos.map((d, idx) => (
              <tr key={`${d.fornecedor}-${idx}`}>
                <td className="pcs-disparos-col-check">
                  <input type="checkbox" aria-label={`Selecionar ${d.fornecedor}`} disabled />
                </td>
                <td className="pcs-disparos-fornecedor">{d.fornecedor}</td>
                <td>
                  <span className="pcs-disparos-canal">
                    <Envelope size={13} />
                    Email
                  </span>
                </td>
                <td>
                  <span className={classeStatusDisparo(d.status)}>{rotuloStatusDisparo(d.status)}</span>
                </td>
                <td className="pcs-disparos-mudo">{d.motivo ?? '—'}</td>
                <td>
                  {d.status === 'RESPONDIDO' || d.status === 'VISUALIZADO' ? (
                    <span className="pcs-disparos-link">
                      <LinkSimple size={13} />
                      Abrir
                    </span>
                  ) : (
                    <span className="pcs-disparos-mudo">—</span>
                  )}
                </td>
                <td className="pcs-disparos-data">{dataEnvioCurta}</td>
                <td className="pcs-disparos-data">{d.dataResposta ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pcs-disparos-rodape">
          <span>
            1–
            {disparos.length}
            {' '}
            de
            {' '}
            {disparos.length}
          </span>
          <span>1/1</span>
          <span>
            Por página
            {' '}
            <strong>10</strong>
          </span>
        </div>
      </div>
    </div>
  )
}

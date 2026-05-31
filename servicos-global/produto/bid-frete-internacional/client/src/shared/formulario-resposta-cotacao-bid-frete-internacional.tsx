/**
 * UI compartilhada — formulário de resposta do fornecedor (público e logado).
 */

import React from 'react'
import type { TFunction } from 'i18next'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  Truck,
  Anchor,
  AirplaneTilt,
  Van,
  MapPin,
  Package,
  PaperPlaneTilt,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react'
import type { ModalFrete, PropostaBidFreteInternacional, TipoOperacao } from './types'
import type { CodigoBloqueioRespostaDisparoBidFreteInternacional } from './visao-fornecedor-bid-frete-internacional-schemas'
import { MODAL_LABELS } from './types'
import {
  montarPartesCabecalhoRespostaCotacao,
  type ContextoCabecalhoRespostaCotacao,
} from './cabecalho-resposta-cotacao-bid-frete-internacional'
import { SecaoTaxasLinhaPropostaBidFreteInternacional } from './secao-taxas-linha-proposta-bid-frete-internacional'
import { TabelaResumoPropostaBidFreteInternacional } from './resumo-composicao-total-frete-bid-frete-internacional'
import {
  linhasFromPropostaTaxas,
  parseValorLinhaTaxa,
  agruparValorTotalPropostaResposta,
  calcularComposicaoPropostaResposta,
  formatarValorTotalPropostaResposta,
  type LinhaTaxaPropostaBidFreteInternacional,
  type TotalPorMoedaBidFreteInternacional,
} from './taxas-linha-proposta-bid-frete-internacional'
import './formulario-resposta-cotacao-bid-frete-internacional.css'

export const MOEDAS_RESPOSTA_COTACAO = ['USD', 'EUR', 'BRL', 'CNY', 'GBP'] as const

export const MODAL_ICONS_RESPOSTA: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={16} />,
  AEREO: <AirplaneTilt weight="duotone" size={16} />,
  RODOVIARIO: <Van weight="duotone" size={16} />,
}

export interface DetalhesCotacaoResposta {
  numero_cotacao_bid_frete_internacional: string
  tipo_operacao_cotacao_bid_frete_internacional?: TipoOperacao
  anonima_cotacao_bid_frete_internacional?: boolean
  nome_cliente_operacao_cotacao_bid_frete_internacional?: string | null
  origem_nome_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional?: ModalFrete
  incoterm_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  quantidade_cotacao_bid_frete_internacional?: number
  peso_kg_cotacao_bid_frete_internacional?: number | null
  cubagem_m3_cotacao_bid_frete_internacional?: number | null
}

export interface EstadoFormularioRespostaCotacao {
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: string
  linhas_taxa_origem: LinhaTaxaPropostaBidFreteInternacional[]
  linhas_taxa_destino: LinhaTaxaPropostaBidFreteInternacional[]
  dias_transito_proposta_bid_frete_internacional: string
  dias_free_time_proposta_bid_frete_internacional: string
  validade_proposta_bid_frete_internacional: string
  transbordos_proposta_bid_frete_internacional: string
  escalas_proposta_bid_frete_internacional: string
  observacoes_proposta_bid_frete_internacional: string
}

export function estadoFormularioFromProposta(
  proposta: PropostaBidFreteInternacional,
): EstadoFormularioRespostaCotacao {
  const validadeRaw = proposta.validade_proposta_bid_frete_internacional
  const validade =
    validadeRaw.includes('T') ? validadeRaw.slice(0, 10) : validadeRaw.slice(0, 10)

  const linhasOrigem =
    proposta.taxas_origem?.length
      ? linhasFromPropostaTaxas(proposta.taxas_origem, 'origem')
      : []
  const linhasDestino =
    proposta.taxas_destino?.length
      ? linhasFromPropostaTaxas(proposta.taxas_destino, 'destino')
      : []

  return {
    moeda_proposta_bid_frete_internacional: proposta.moeda_proposta_bid_frete_internacional,
    valor_frete_proposta_bid_frete_internacional: String(proposta.valor_frete_proposta_bid_frete_internacional),
    linhas_taxa_origem: linhasOrigem,
    linhas_taxa_destino: linhasDestino,
    dias_transito_proposta_bid_frete_internacional: String(proposta.dias_transito_proposta_bid_frete_internacional),
    dias_free_time_proposta_bid_frete_internacional:
      proposta.dias_free_time_proposta_bid_frete_internacional != null
        ? String(proposta.dias_free_time_proposta_bid_frete_internacional)
        : '',
    validade_proposta_bid_frete_internacional: validade,
    transbordos_proposta_bid_frete_internacional: String(
      proposta.quantidade_transbordo_proposta_bid_frete_internacional,
    ),
    escalas_proposta_bid_frete_internacional: proposta.escalas_proposta_bid_frete_internacional ?? '',
    observacoes_proposta_bid_frete_internacional: proposta.observacoes_proposta_bid_frete_internacional ?? '',
  }
}

export function chaveTituloBloqueioRespostaPublico(
  codigo: CodigoBloqueioRespostaDisparoBidFreteInternacional,
): string {
  if (codigo == null) return 'bidfrete.portal.publico.invalido_titulo'
  return `bidfrete.portal.publico.bloqueio.${codigo}_titulo`
}

export function chaveDescricaoBloqueioRespostaPublico(
  codigo: CodigoBloqueioRespostaDisparoBidFreteInternacional,
): string {
  if (codigo == null) return 'bidfrete.portal.publico.invalido_desc'
  return `bidfrete.portal.publico.bloqueio.${codigo}_desc`
}

export function calcularComposicaoPropostaRespostaForm(
  form: EstadoFormularioRespostaCotacao,
) {
  return calcularComposicaoPropostaResposta({
    moeda_frete: form.moeda_proposta_bid_frete_internacional,
    valor_frete: form.valor_frete_proposta_bid_frete_internacional,
    linhas_taxa_origem: form.linhas_taxa_origem,
    linhas_taxa_destino: form.linhas_taxa_destino,
  })
}

export function calcularTotaisPropostaResposta(
  form: EstadoFormularioRespostaCotacao,
): TotalPorMoedaBidFreteInternacional[] {
  return agruparValorTotalPropostaResposta({
    moeda_frete: form.moeda_proposta_bid_frete_internacional,
    valor_frete: form.valor_frete_proposta_bid_frete_internacional,
    linhas_taxa_origem: form.linhas_taxa_origem,
    linhas_taxa_destino: form.linhas_taxa_destino,
  })
}

export function formatarResumoTotalPropostaResposta(form: EstadoFormularioRespostaCotacao): string {
  return formatarValorTotalPropostaResposta({
    moeda_frete: form.moeda_proposta_bid_frete_internacional,
    valor_frete: form.valor_frete_proposta_bid_frete_internacional,
    linhas_taxa_origem: form.linhas_taxa_origem,
    linhas_taxa_destino: form.linhas_taxa_destino,
  })
}

export const ESTADO_INICIAL_FORMULARIO_RESPOSTA: EstadoFormularioRespostaCotacao = {
  moeda_proposta_bid_frete_internacional: 'USD',
  valor_frete_proposta_bid_frete_internacional: '',
  linhas_taxa_origem: [],
  linhas_taxa_destino: [],
  dias_transito_proposta_bid_frete_internacional: '',
  dias_free_time_proposta_bid_frete_internacional: '',
  validade_proposta_bid_frete_internacional: '',
  transbordos_proposta_bid_frete_internacional: '0',
  escalas_proposta_bid_frete_internacional: '',
  observacoes_proposta_bid_frete_internacional: '',
}

function LabelObrigatorio({ children }: { children: React.ReactNode }) {
  return (
    <label className="brc-label">
      {children}
      <span className="brc-label-obrigatorio" aria-hidden>*</span>
    </label>
  )
}

export function SecaoDetalhesCotacaoResposta({
  cotacao,
  tituloSecao,
  rotuloNumero,
  rotuloRota,
  rotuloModal,
  rotuloIncoterm,
  rotuloCarga,
  numeroFallback,
}: {
  cotacao: DetalhesCotacaoResposta | null
  tituloSecao: string
  rotuloNumero: string
  rotuloRota: string
  rotuloModal: string
  rotuloIncoterm: string
  rotuloCarga: string
  numeroFallback?: string
}) {
  const partesCarga: string[] = []
  if (cotacao?.descricao_mercadoria_cotacao_bid_frete_internacional) {
    partesCarga.push(cotacao.descricao_mercadoria_cotacao_bid_frete_internacional)
  }
  if (cotacao?.quantidade_cotacao_bid_frete_internacional != null) {
    partesCarga.push(`${cotacao.quantidade_cotacao_bid_frete_internacional} un`)
  }
  if (cotacao?.peso_kg_cotacao_bid_frete_internacional != null) {
    partesCarga.push(`${cotacao.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} kg`)
  }
  if (cotacao?.cubagem_m3_cotacao_bid_frete_internacional != null) {
    partesCarga.push(`${cotacao.cubagem_m3_cotacao_bid_frete_internacional} m³`)
  }

  return (
    <section className="brc-secao" aria-labelledby="brc-detalhes-titulo">
      <h2 id="brc-detalhes-titulo" className="brc-secao-titulo">{tituloSecao}</h2>
      <div className="brc-detalhes-grid">
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">{rotuloNumero}</span>
          <span className="brc-detalhe-valor brc-detalhe-valor--mono">
            {cotacao?.numero_cotacao_bid_frete_internacional ?? numeroFallback ?? '—'}
          </span>
        </div>
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">{rotuloRota}</span>
          <span className="brc-detalhe-valor">
            <MapPin weight="duotone" size={14} aria-hidden />
            {cotacao?.origem_nome_cotacao_bid_frete_internacional ?? '—'}
            {' → '}
            {cotacao?.destino_nome_cotacao_bid_frete_internacional ?? '—'}
          </span>
        </div>
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">{rotuloModal}</span>
          <span className="brc-detalhe-valor">
            {cotacao?.modal_cotacao_bid_frete_internacional
              ? MODAL_ICONS_RESPOSTA[cotacao.modal_cotacao_bid_frete_internacional]
              : null}
            {cotacao?.modal_cotacao_bid_frete_internacional
              ? MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional]
              : '—'}
          </span>
        </div>
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">{rotuloIncoterm}</span>
          <span className="brc-detalhe-valor">
            {cotacao?.incoterm_cotacao_bid_frete_internacional ?? '—'}
          </span>
        </div>
        <div className="brc-detalhe brc-detalhe--wide">
          <span className="brc-detalhe-label">{rotuloCarga}</span>
          <span className="brc-detalhe-valor">
            <Package weight="duotone" size={14} aria-hidden />
            {partesCarga.length > 0 ? partesCarga.join(' · ') : '—'}
          </span>
        </div>
      </div>
    </section>
  )
}

export function FormPropostaRespostaCotacao({
  form,
  onChange,
  onLinhasOrigemChange,
  onLinhasDestinoChange,
  taxasOrigemInicializado,
  taxasDestinoInicializado,
  onTaxasOrigemInicializado,
  onTaxasDestinoInicializado,
  onSubmit,
  tituloSecao,
  rotulos,
  erro,
  enviando,
  textoEnviar,
  textoEnviando,
}: {
  form: EstadoFormularioRespostaCotacao
  onChange: (field: keyof EstadoFormularioRespostaCotacao, value: string) => void
  onLinhasOrigemChange: (linhas: LinhaTaxaPropostaBidFreteInternacional[]) => void
  onLinhasDestinoChange: (linhas: LinhaTaxaPropostaBidFreteInternacional[]) => void
  taxasOrigemInicializado: boolean
  taxasDestinoInicializado: boolean
  onTaxasOrigemInicializado: () => void
  onTaxasDestinoInicializado: () => void
  onSubmit: (e: React.FormEvent) => void
  tituloSecao: string
  rotulos: {
    moeda: string
    valorFrete: string
    taxasOrigem: string
    taxasDestino: string
    taxasAdicionarManual: string
    taxasNome: string
    taxasValor: string
    taxasMoeda: string
    taxasSubtotal: string
    taxasTotalOrigem: string
    taxasTotalDestino: string
    totaisPorMoeda: string
    composicaoFreteBase: string
    composicaoTaxasOrigem: string
    composicaoTaxasDestino: string
    composicaoAcessibilidade: string
    tabelaColunaFreteBase: string
    tabelaColunaTaxasOrigem: string
    tabelaColunaTaxasDestino: string
    tabelaColunaValorTotal: string
    tabelaSubtotal: string
    tabelaSemTaxas: string
    semConversaoCambial: string
    taxasSecaoSomenteOrigem: string
    taxasSecaoSomenteDestino: string
    taxasPlaceholderNomeManual: string
    totalFrete: string
    totalFreteLegenda: string
    total: string
    transit: string
    freeTime: string
    validade: string
    transbordos: string
    escalas: string
    observacoes: string
    placeholderEscalas: string
    placeholderObservacoes: string
  }
  erro: string
  enviando: boolean
  textoEnviar: string
  textoEnviando: string
}) {
  const composicaoProposta = calcularComposicaoPropostaResposta({
    moeda_frete: form.moeda_proposta_bid_frete_internacional,
    valor_frete: form.valor_frete_proposta_bid_frete_internacional,
    linhas_taxa_origem: form.linhas_taxa_origem,
    linhas_taxa_destino: form.linhas_taxa_destino,
  })

  return (
    <section className="brc-secao" aria-labelledby="brc-proposta-titulo">
      <form onSubmit={onSubmit} noValidate>
        <h2 id="brc-proposta-titulo" className="brc-secao-titulo">{tituloSecao}</h2>
        <div className="brc-form-grid">
          <div className="brc-field">
            <LabelObrigatorio>{rotulos.moeda}</LabelObrigatorio>
            <select
              className="brc-input"
              value={form.moeda_proposta_bid_frete_internacional}
              onChange={(e) => onChange('moeda_proposta_bid_frete_internacional', e.target.value)}
            >
              {MOEDAS_RESPOSTA_COTACAO.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="brc-field">
            <LabelObrigatorio>{rotulos.valorFrete}</LabelObrigatorio>
            <input
              className="brc-input brc-input--mono"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.valor_frete_proposta_bid_frete_internacional}
              onChange={(e) => onChange('valor_frete_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field brc-field--wide">
            <SecaoTaxasLinhaPropostaBidFreteInternacional
              secao="origem"
              titulo={rotulos.taxasOrigem}
              rotuloAdicionarManual={rotulos.taxasAdicionarManual}
              rotuloNome={rotulos.taxasNome}
              rotuloValor={rotulos.taxasValor}
              rotuloMoeda={rotulos.taxasMoeda}
              rotuloSubtotal={rotulos.taxasTotalOrigem}
              rotuloTotaisPorMoeda={rotulos.totaisPorMoeda}
              rotuloSomenteTaxasSecao={rotulos.taxasSecaoSomenteOrigem}
              placeholderNomeManual={rotulos.taxasPlaceholderNomeManual}
              linhas={form.linhas_taxa_origem}
              onChange={onLinhasOrigemChange}
              moedaPadrao={form.moeda_proposta_bid_frete_internacional}
              inicializado={taxasOrigemInicializado}
              onInicializado={onTaxasOrigemInicializado}
            />
          </div>

          <div className="brc-field brc-field--wide">
            <SecaoTaxasLinhaPropostaBidFreteInternacional
              secao="destino"
              titulo={rotulos.taxasDestino}
              rotuloAdicionarManual={rotulos.taxasAdicionarManual}
              rotuloNome={rotulos.taxasNome}
              rotuloValor={rotulos.taxasValor}
              rotuloMoeda={rotulos.taxasMoeda}
              rotuloSubtotal={rotulos.taxasTotalDestino}
              rotuloTotaisPorMoeda={rotulos.totaisPorMoeda}
              rotuloSomenteTaxasSecao={rotulos.taxasSecaoSomenteDestino}
              placeholderNomeManual={rotulos.taxasPlaceholderNomeManual}
              linhas={form.linhas_taxa_destino}
              onChange={onLinhasDestinoChange}
              moedaPadrao={form.moeda_proposta_bid_frete_internacional}
              inicializado={taxasDestinoInicializado}
              onInicializado={onTaxasDestinoInicializado}
            />
          </div>

          <div className="brc-field brc-field--total">
            <div className="brc-total brc-total--geral" aria-live="polite">
              <span className="brc-total-rotulo brc-total-rotulo--bloco">{rotulos.totalFrete}</span>
              <TabelaResumoPropostaBidFreteInternacional
                moedaFrete={form.moeda_proposta_bid_frete_internacional}
                valorFrete={form.valor_frete_proposta_bid_frete_internacional}
                linhasOrigem={form.linhas_taxa_origem}
                linhasDestino={form.linhas_taxa_destino}
                composicao={composicaoProposta}
                rotulos={{
                  colunaFreteBase: rotulos.tabelaColunaFreteBase,
                  colunaTaxasOrigem: rotulos.tabelaColunaTaxasOrigem,
                  colunaTaxasDestino: rotulos.tabelaColunaTaxasDestino,
                  colunaValorTotal: rotulos.tabelaColunaValorTotal,
                  subtotal: rotulos.tabelaSubtotal,
                  semTaxas: rotulos.tabelaSemTaxas,
                  acessibilidade: rotulos.composicaoAcessibilidade,
                }}
              />
              <p className="brc-total-legenda">{rotulos.totalFreteLegenda}</p>
              <p className="brc-total-legenda brc-total-legenda--secundaria">
                {rotulos.semConversaoCambial}
              </p>
            </div>
          </div>

          <div className="brc-field">
            <LabelObrigatorio>{rotulos.transit}</LabelObrigatorio>
            <input
              className="brc-input brc-input--mono"
              type="number"
              min="1"
              placeholder="0"
              value={form.dias_transito_proposta_bid_frete_internacional}
              onChange={(e) => onChange('dias_transito_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field">
            <label className="brc-label">{rotulos.freeTime}</label>
            <input
              className="brc-input brc-input--mono"
              type="number"
              min="0"
              placeholder="0"
              value={form.dias_free_time_proposta_bid_frete_internacional}
              onChange={(e) => onChange('dias_free_time_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field">
            <LabelObrigatorio>{rotulos.validade}</LabelObrigatorio>
            <input
              className="brc-input"
              type="date"
              value={form.validade_proposta_bid_frete_internacional}
              onChange={(e) => onChange('validade_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field">
            <label className="brc-label">{rotulos.transbordos}</label>
            <input
              className="brc-input brc-input--mono"
              type="number"
              min="0"
              placeholder="0"
              value={form.transbordos_proposta_bid_frete_internacional}
              onChange={(e) => onChange('transbordos_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field brc-field--wide">
            <label className="brc-label">{rotulos.escalas}</label>
            <input
              className="brc-input"
              type="text"
              placeholder={rotulos.placeholderEscalas}
              value={form.escalas_proposta_bid_frete_internacional}
              onChange={(e) => onChange('escalas_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field brc-field--wide">
            <label className="brc-label">{rotulos.observacoes}</label>
            <textarea
              className="brc-input brc-textarea"
              rows={3}
              placeholder={rotulos.placeholderObservacoes}
              value={form.observacoes_proposta_bid_frete_internacional}
              onChange={(e) => onChange('observacoes_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>
        </div>

        {erro ? <p className="brc-erro" role="alert">{erro}</p> : null}

        <div className="brc-acoes-form">
          <BotaoGlobal
            type="submit"
            variante="primario"
            tamanho="medio"
            carregando={enviando}
            textoCarregando={textoEnviando}
            icone={<PaperPlaneTilt weight="bold" size={16} />}
          >
            {textoEnviar}
          </BotaoGlobal>
        </div>
      </form>
    </section>
  )
}

export function AvisoEdicaoPropostaResposta({ texto }: { texto: string }) {
  return (
    <div className="brc-aviso-edicao" role="status">
      <p>{texto}</p>
    </div>
  )
}

export type VarianteMensagemRespostaCotacao = 'sucesso' | 'invalido' | 'bloqueado' | 'carregando'

export function ShellPaginaRespostaCotacao({
  modo,
  children,
}: {
  modo: 'publico' | 'logado'
  children: React.ReactNode
}) {
  return (
    <div className={`brc-page brc-page--${modo}`}>
      <div className="brc-shell">{children}</div>
    </div>
  )
}

export function EstadoMensagemRespostaCotacao({
  variante,
  titulo,
  descricao,
  descricaoExtra,
  acao,
  children,
}: {
  variante: VarianteMensagemRespostaCotacao
  titulo: string
  descricao?: string
  descricaoExtra?: string
  acao?: React.ReactNode
  /** Conteúdo alternativo (ex.: spinner de carregamento). */
  children?: React.ReactNode
}) {
  const Icone =
    variante === 'sucesso'
      ? CheckCircle
      : variante === 'invalido' || variante === 'bloqueado'
        ? WarningCircle
        : null

  return (
    <div
      className={`brc-card brc-card--mensagem brc-card--${variante}`}
      role={variante === 'invalido' || variante === 'bloqueado' ? 'alert' : 'status'}
      aria-live="polite"
      aria-label={titulo || undefined}
    >
      <div className="brc-mensagem-corpo">
        {children ?? (
          <>
            {Icone != null && (
              <span className="brc-mensagem-icone" aria-hidden>
                <Icone weight="duotone" size={40} />
              </span>
            )}
            <div className="brc-mensagem-textos">
              <h2 className="brc-estado-titulo">{titulo}</h2>
              {(descricao != null || descricaoExtra != null) && (
                <div className="brc-mensagem-painel">
                  {descricao != null && <p className="brc-estado-texto">{descricao}</p>}
                  {descricaoExtra != null && <p className="brc-estado-texto">{descricaoExtra}</p>}
                </div>
              )}
            </div>
            {acao != null && <div className="brc-mensagem-acoes">{acao}</div>}
          </>
        )}
      </div>
    </div>
  )
}

export function CabecalhoFormularioRespostaCotacao({
  titulo,
  contextoCabecalho,
  t,
}: {
  titulo: string
  contextoCabecalho: ContextoCabecalhoRespostaCotacao
  t: TFunction
}) {
  const partes = montarPartesCabecalhoRespostaCotacao(contextoCabecalho, t)

  return (
    <header className="brc-header">
      <span className="brc-header-icone" aria-hidden>
        <Truck weight="duotone" size={26} />
      </span>
      <div className="brc-header-corpo">
        <h1 className="brc-header-titulo">{titulo}</h1>
        {partes.length > 0 ? (
          <div className="brc-header-meta" aria-label={t('bidfrete.portal.responder.cabecalho_partes', 'Participantes')}>
            {partes.map((parte) => (
              <span
                key={parte.id}
                className={`brc-header-chip${parte.oculto ? ' brc-header-chip--oculto' : ''}`}
              >
                <span className="brc-header-chip-label">{parte.rotulo}</span>
                <span className="brc-header-chip-valor">{parte.valor}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}

/** @deprecated use CabecalhoFormularioRespostaCotacao */
export function CabecalhoFormularioRespostaPublico({
  titulo,
  subtitulo,
}: {
  titulo: string
  subtitulo?: string | null
}) {
  return (
    <header className="brc-header">
      <span className="brc-header-icone" aria-hidden>
        <Truck weight="duotone" size={26} />
      </span>
      <div className="brc-header-corpo">
        <h1 className="brc-header-titulo">{titulo}</h1>
        {subtitulo ? <p className="brc-header-sub">{subtitulo}</p> : null}
      </div>
    </header>
  )
}

export function criarRotulosFormularioResposta(
  t: TFunction,
  prefixo: 'bidfrete.portal.responder' | 'bidfrete.visao_fornecedor_bid_frete_internacional.responder_cotacao',
) {
  return {
    detalhes: t(`${prefixo}.detalhes`),
    proposta: t(`${prefixo}.proposta`),
    numero: t(`${prefixo}.campo_numero`),
    rota: t(`${prefixo}.campo_rota`),
    modal: t(`${prefixo}.campo_modal`),
    incoterm: t(`${prefixo}.campo_incoterm`),
    carga: t(`${prefixo}.campo_carga`),
    moeda: t(`${prefixo}.campo_moeda`),
    valorFrete: t(`${prefixo}.campo_valor_frete`),
    taxasOrigem: t(`${prefixo}.campo_taxas_origem`),
    taxasDestino: t(`${prefixo}.campo_taxas_destino`),
    taxasAdicionarManual: t('bidfrete.portal.responder.taxas_adicionar_manual', 'Adicionar taxa manual'),
    taxasNome: t('bidfrete.portal.responder.taxas_nome', 'Taxa'),
    taxasValor: t('bidfrete.portal.responder.taxas_valor', 'Valor'),
    taxasMoeda: t('bidfrete.portal.responder.taxas_moeda', 'Moeda'),
    taxasSubtotal: t('bidfrete.portal.responder.taxas_subtotal', 'Subtotal'),
    taxasTotalOrigem: t(
      'bidfrete.portal.responder.taxas_total_origem',
      'Total Taxas de Origem',
    ),
    taxasTotalDestino: t(
      'bidfrete.portal.responder.taxas_total_destino',
      'Total Taxas de Destino',
    ),
    totaisPorMoeda: t(
      'bidfrete.portal.responder.totais_por_moeda',
      'Totais por moeda',
    ),
    composicaoFreteBase: t(
      'bidfrete.portal.responder.composicao_frete_base',
      'Frete',
    ),
    composicaoTaxasOrigem: t(
      'bidfrete.portal.responder.composicao_taxas_origem',
      'Origem',
    ),
    composicaoTaxasDestino: t(
      'bidfrete.portal.responder.composicao_taxas_destino',
      'Destino',
    ),
    composicaoAcessibilidade: t(
      'bidfrete.portal.responder.composicao_acessibilidade',
      'Composição do valor total por moeda',
    ),
    tabelaColunaFreteBase: t(
      'bidfrete.portal.responder.tabela_coluna_frete_base',
      'Frete Base',
    ),
    tabelaColunaTaxasOrigem: t(
      'bidfrete.portal.responder.tabela_coluna_taxas_origem',
      'Taxas de Origem',
    ),
    tabelaColunaTaxasDestino: t(
      'bidfrete.portal.responder.tabela_coluna_taxas_destino',
      'Taxas de Destino',
    ),
    tabelaColunaValorTotal: t(
      'bidfrete.portal.responder.tabela_coluna_valor_total',
      'Valor Total',
    ),
    tabelaSubtotal: t(
      'bidfrete.portal.responder.tabela_subtotal',
      'Subtotal',
    ),
    tabelaSemTaxas: t(
      'bidfrete.portal.responder.tabela_sem_taxas',
      '—',
    ),
    semConversaoCambial: t(
      'bidfrete.portal.responder.sem_conversao_cambial',
      'Valores somados por moeda, sem conversão cambial.',
    ),
    taxasSecaoSomenteOrigem: t(
      'bidfrete.portal.responder.taxas_secao_somente_origem',
      'Somente taxas de origem nesta seção',
    ),
    taxasSecaoSomenteDestino: t(
      'bidfrete.portal.responder.taxas_secao_somente_destino',
      'Somente taxas de destino nesta seção',
    ),
    taxasPlaceholderNomeManual: t(
      'bidfrete.portal.responder.taxas_placeholder_nome_manual',
      'Nome da taxa (digitação livre)',
    ),
    totalFrete: t(
      'bidfrete.portal.responder.valor_total_frete',
      'Valor Total do Frete',
    ),
    totalFreteLegenda: t(
      'bidfrete.portal.responder.valor_total_frete_legenda',
      'Frete Base + Taxas de Origem + Taxa de Destino',
    ),
    total: t(`${prefixo}.campo_total`),
    transit: t(`${prefixo}.campo_transit`),
    freeTime: t(`${prefixo}.campo_free_time`),
    validade: t(`${prefixo}.campo_validade`),
    transbordos: t(`${prefixo}.campo_transbordos`),
    escalas: t(`${prefixo}.campo_escalas`),
    observacoes: t(`${prefixo}.campo_observacoes`),
    placeholderEscalas: 'Ex: Singapore, Colombo',
    placeholderObservacoes: t(`${prefixo}.campo_observacoes`),
    enviar: t(`${prefixo}.enviar`),
    enviando: t(`${prefixo}.enviando`),
  }
}

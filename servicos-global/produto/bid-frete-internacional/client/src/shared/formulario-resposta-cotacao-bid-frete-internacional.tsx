/**
 * UI compartilhada — formulário de resposta do fornecedor (público e logado).
 */

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { CampoValorMonetarioResposta } from './campo-valor-monetario-resposta-bid-frete-internacional'
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
  BellRinging,
  HandCoins,
  RocketLaunch,
  Table,
} from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import type { ModalFrete, ModalidadeCarga, PropostaBidFreteInternacional, TipoOperacao } from './types'
import {
  exigeArmazenagemFornecedorRespostaCotacao,
} from './armazenagem-lcl-maritimo-bid-frete-internacional'
import type { CodigoBloqueioRespostaDisparoBidFreteInternacional } from './visao-fornecedor-bid-frete-internacional-schemas'
import { MODAL_LABELS, MODALIDADE_LABELS } from './types'
import {
  montarPartesCabecalhoRespostaCotacao,
  type ContextoCabecalhoRespostaCotacao,
} from './cabecalho-resposta-cotacao-bid-frete-internacional'
import { SecaoTaxasLinhaPropostaBidFreteInternacional } from './secao-taxas-linha-proposta-bid-frete-internacional'
import { SecaoPeriodosArmazenagemPropostaBidFreteInternacional } from './secao-periodos-armazenagem-proposta-bid-frete-internacional'
import {
  criarLinhaPeriodoArmazenagemVazia,
  linhasPeriodoArmazenagemFromProposta,
  periodosArmazenagemFormularioValidos,
  type LinhaPeriodoArmazenagemFormBidFreteInternacional,
} from './periodos-armazenagem-proposta-bid-frete-internacional'
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
import { formatarRotaExibicaoCotacao } from './formatacao-local-logistico-bid-frete-internacional'
import { parseObservacoesPropostaComLocais } from '../../../shared/local-proposta-resposta-bid-frete-internacional'
import { ROTA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL } from '../../../shared/condicoes-plataforma-fornecedor-bid-frete-internacional'
import {
  normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity,
  rotuloEmpresaPagadoraTaxaFechamentoPlataformaGravity,
  type EmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional'
import { montarTextoAceiteCondicoesPortalRespostaBidFrete } from '../../../shared/textos-taxa-fechamento-plataforma-bid-frete-internacional'
import {
  exigeSelecaoLocalFornecedorRespostaBidFrete,
  type ContextoLocaisOpcionaisCotacaoBidFrete,
} from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional'
import {
  rotuloExibicaoLocaisOpcionaisCotacaoBidFrete,
  rotuloSelecaoLocalFornecedorRespostaBidFrete,
  useLocaisSelecaoFornecedorRespostaBidFrete,
  useTextosLocaisOpcionaisCotacaoBidFrete,
} from './locais-opcionais-cotacao-bid-frete-internacional'
import { useOpcoesMoedaCadastrosBidFreteInternacional } from './use-opcoes-moeda-cadastros-bid-frete-internacional'
import { urlMarketplaceBidFreteInternacional } from './url-marketplace-gravity-bid-frete-internacional'
import { montarTextoLocalizacaoComplementarEmailDisparoBidFrete } from '../../../shared/localizacao-complementar-resumo-nova-cotacao-bid-frete-internacional'
import './formulario-resposta-cotacao-bid-frete-internacional.css'

const PROP_LINK_MARKETPLACE = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

function useTravaScrollPortalEstadoResposta(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return

    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')
    const anterior = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      rootOverflow: root?.style.overflow ?? '',
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
      rootHeight: root?.style.height ?? '',
    }

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.height = '100%'
    if (root) {
      root.style.overflow = 'hidden'
      root.style.height = '100%'
    }

    return () => {
      html.style.overflow = anterior.htmlOverflow
      body.style.overflow = anterior.bodyOverflow
      html.style.height = anterior.htmlHeight
      body.style.height = anterior.bodyHeight
      if (root) {
        root.style.overflow = anterior.rootOverflow
        root.style.height = anterior.rootHeight
      }
    }
  }, [ativo])
}

export const MODAL_ICONS_RESPOSTA: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={16} />,
  AEREO: <AirplaneTilt weight="duotone" size={16} />,
  RODOVIARIO: <Van weight="duotone" size={16} />,
}

export interface DetalhesCotacaoResposta {
  numero_cotacao_bid_frete_internacional: string
  referencia_interna_cotacao_bid_frete_internacional?: string | null
  tipo_operacao_cotacao_bid_frete_internacional?: TipoOperacao
  anonima_cotacao_bid_frete_internacional?: boolean
  nome_cliente_operacao_cotacao_bid_frete_internacional?: string | null
  origem_nome_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional?: string | null
  destino_pais_cotacao_bid_frete_internacional?: string | null
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional?: string | null
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional?: string | null
  cidade_origem_rodoviario_cotacao_bid_frete_internacional?: string | null
  cidade_destino_rodoviario_cotacao_bid_frete_internacional?: string | null
  endereco_origem_cotacao_bid_frete_internacional?: string | null
  endereco_destino_cotacao_bid_frete_internacional?: string | null
  modal_cotacao_bid_frete_internacional?: ModalFrete
  modalidade_cotacao_bid_frete_internacional?: ModalidadeCarga
  incoterm_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional?: string | null
  hs_code_cotacao_bid_frete_internacional?: string | null
  quantidade_volume_cotacao_bid_frete_internacional?: number
  tipo_container_cotacao_bid_frete_internacional?: string | null
  peso_kg_cotacao_bid_frete_internacional?: number | null
  peso_ton_cotacao_bid_frete_internacional?: number | null
  cubagem_m3_cotacao_bid_frete_internacional?: number | null
  codigo_unidade_cubagem_cotacao_bid_frete_internacional?: string | null
  comprimento_cubagem_cotacao_bid_frete_internacional?: number | null
  largura_cubagem_cotacao_bid_frete_internacional?: number | null
  altura_cubagem_cotacao_bid_frete_internacional?: number | null
  eh_carga_perigosa_cotacao_bid_frete_internacional?: boolean
  numero_onu_cotacao_bid_frete_internacional?: string | null
  nome_tecnico_embarque_cotacao_bid_frete_internacional?: string | null
  classe_carga_perigosa_cotacao_bid_frete_internacional?: number | null
  divisao_carga_perigosa_cotacao_bid_frete_internacional?: string | null
  grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional?: string | null
  observacoes_carga_perigosa_cotacao_bid_frete_internacional?: string | null
  data_limite_resposta_cotacao_bid_frete_internacional?: string | null
  incluir_armazenagem_cotacao_bid_frete_internacional?: boolean
  nomes_armazem_alfandegado_cotacao_bid_frete_internacional?: string[] | null
  porto_origem_cotacao_bid_frete_internacional?: string | null
  porto_destino_cotacao_bid_frete_internacional?: string | null
  aeroporto_origem_cotacao_bid_frete_internacional?: string | null
  aeroporto_destino_cotacao_bid_frete_internacional?: string | null
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional?: boolean
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional?: string[] | null
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional?: boolean
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional?: string[] | null
  empresa_pagadora_taxa_fechamento_plataforma_gravity?: EmpresaPagadoraTaxaFechamentoPlataformaGravity | null
}

/** "120 × 100 × 90 cm" — só quando as 3 dimensões da cubagem foram preenchidas. */
export function formatarDimensoesCubagemDetalhesResposta(
  cotacao: DetalhesCotacaoResposta | null,
): string | null {
  const c = cotacao?.comprimento_cubagem_cotacao_bid_frete_internacional
  const l = cotacao?.largura_cubagem_cotacao_bid_frete_internacional
  const a = cotacao?.altura_cubagem_cotacao_bid_frete_internacional
  if (c == null || l == null || a == null || c <= 0 || l <= 0 || a <= 0) return null
  const unidade = cotacao?.codigo_unidade_cubagem_cotacao_bid_frete_internacional?.trim().toLowerCase() || 'm'
  const fmt = (v: number) => v.toLocaleString('pt-BR')
  return `${fmt(c)} × ${fmt(l)} × ${fmt(a)} ${unidade}`
}

/** "UN 1263 · Tintas · Classe 3 · GE II" — null quando não é carga perigosa. */
export function formatarCargaPerigosaDetalhesResposta(
  cotacao: DetalhesCotacaoResposta | null,
): string | null {
  if (!cotacao?.eh_carga_perigosa_cotacao_bid_frete_internacional) return null
  const partes: string[] = []
  if (cotacao.numero_onu_cotacao_bid_frete_internacional?.trim()) {
    partes.push(`UN ${cotacao.numero_onu_cotacao_bid_frete_internacional.trim()}`)
  }
  if (cotacao.nome_tecnico_embarque_cotacao_bid_frete_internacional?.trim()) {
    partes.push(cotacao.nome_tecnico_embarque_cotacao_bid_frete_internacional.trim())
  }
  if (cotacao.classe_carga_perigosa_cotacao_bid_frete_internacional != null) {
    partes.push(`Classe ${cotacao.classe_carga_perigosa_cotacao_bid_frete_internacional}`)
  }
  if (cotacao.divisao_carga_perigosa_cotacao_bid_frete_internacional?.trim()) {
    partes.push(`Divisão ${cotacao.divisao_carga_perigosa_cotacao_bid_frete_internacional.trim()}`)
  }
  if (cotacao.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional?.trim()) {
    partes.push(`GE ${cotacao.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional.trim()}`)
  }
  if (cotacao.observacoes_carga_perigosa_cotacao_bid_frete_internacional?.trim()) {
    partes.push(cotacao.observacoes_carga_perigosa_cotacao_bid_frete_internacional.trim())
  }
  return partes.length > 0 ? partes.join(' · ') : null
}

export interface EstadoFormularioRespostaCotacao {
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: string
  linhas_taxa_origem: LinhaTaxaPropostaBidFreteInternacional[]
  linhas_taxa_destino: LinhaTaxaPropostaBidFreteInternacional[]
  dias_transito_proposta_bid_frete_internacional: string
  dias_free_time_proposta_bid_frete_internacional: string
  dias_prazo_pagamento_proposta_bid_frete_internacional: string
  validade_proposta_bid_frete_internacional: string
  transbordos_proposta_bid_frete_internacional: string
  escalas_proposta_bid_frete_internacional: string
  observacoes_proposta_bid_frete_internacional: string
  codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: string
  codigo_porto_aeroporto_destino_proposta_bid_frete_internacional: string
  linhas_periodo_armazenagem: LinhaPeriodoArmazenagemFormBidFreteInternacional[]
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

  const { locais, observacoes } = parseObservacoesPropostaComLocais(
    proposta.observacoes_proposta_bid_frete_internacional,
  )

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
    dias_prazo_pagamento_proposta_bid_frete_internacional:
      proposta.dias_prazo_pagamento_proposta_bid_frete_internacional != null
        ? String(proposta.dias_prazo_pagamento_proposta_bid_frete_internacional)
        : '',
    validade_proposta_bid_frete_internacional: validade,
    transbordos_proposta_bid_frete_internacional: String(
      proposta.quantidade_transbordo_proposta_bid_frete_internacional ?? 0,
    ),
    escalas_proposta_bid_frete_internacional: quantidadeEscalasTextoFromProposta(proposta),
    observacoes_proposta_bid_frete_internacional: observacoes,
    codigo_porto_aeroporto_origem_proposta_bid_frete_internacional:
      locais.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional ?? '',
    codigo_porto_aeroporto_destino_proposta_bid_frete_internacional:
      locais.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional ?? '',
    linhas_periodo_armazenagem: linhasPeriodoArmazenagemFromProposta(
      proposta.periodos_armazenagem_proposta_bid_frete_internacional,
      {
        dias_periodo_armazenagem_proposta_bid_frete_internacional:
          (proposta as { dias_periodo_armazenagem_proposta_bid_frete_internacional?: number | null })
            .dias_periodo_armazenagem_proposta_bid_frete_internacional,
        valor_armazenagem_reais_proposta_bid_frete_internacional:
          (proposta as { valor_armazenagem_reais_proposta_bid_frete_internacional?: number | null })
            .valor_armazenagem_reais_proposta_bid_frete_internacional,
      },
    ),
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

/** Quantidade de escalas persistida em `escalas_proposta_*` (string numérica) até coluna Int dedicada. */
export function quantidadeEscalasTextoFromProposta(proposta: PropostaBidFreteInternacional): string {
  const q = proposta.quantidade_escala_proposta_bid_frete_internacional
  if (Number.isFinite(q) && q >= 0) return String(q)
  const raw = proposta.escalas_proposta_bid_frete_internacional?.trim()
  if (raw != null && raw !== '' && /^\d+$/.test(raw)) return raw
  return ''
}

export function exibeCampoTransbordosRespostaCotacao(modal?: ModalFrete | null): boolean {
  return modal === 'MARITIMO' || modal === 'RODOVIARIO'
}

export function exibeCampoEscalasRespostaCotacao(modal?: ModalFrete | null): boolean {
  return modal === 'AEREO'
}

export function exibeCampoFreeTimeRespostaCotacao(
  modal?: ModalFrete | null,
  modalidade?: ModalidadeCarga | null,
): boolean {
  return modal === 'MARITIMO' && modalidade === 'FCL'
}

export function exigeFreeTimeObrigatorioRespostaCotacao(
  modalidade?: ModalidadeCarga | null,
): boolean {
  return modalidade === 'FCL'
}

function diasInteiroNaoNegativoValido(valor: string): boolean {
  const v = valor.trim()
  if (v === '') return false
  const n = Number(v)
  return Number.isInteger(n) && n >= 0
}

export function camposLogisticaRespostaCotacaoValidos(
  form: EstadoFormularioRespostaCotacao,
  modal?: ModalFrete | null,
  modalidade?: ModalidadeCarga | null,
  incluir_armazenagem_cotacao_bid_frete_internacional?: boolean | null,
): boolean {
  if (exibeCampoTransbordosRespostaCotacao(modal)) {
    const v = form.transbordos_proposta_bid_frete_internacional.trim()
    if (v === '' || Number.isNaN(Number(v)) || Number(v) < 0) return false
  }
  if (exibeCampoEscalasRespostaCotacao(modal)) {
    const v = form.escalas_proposta_bid_frete_internacional.trim()
    if (v === '' || Number.isNaN(Number(v)) || Number(v) < 0) return false
  }
  if (!diasInteiroNaoNegativoValido(form.dias_prazo_pagamento_proposta_bid_frete_internacional)) {
    return false
  }
  if (exigeFreeTimeObrigatorioRespostaCotacao(modalidade)) {
    if (!diasInteiroNaoNegativoValido(form.dias_free_time_proposta_bid_frete_internacional)) {
      return false
    }
  }
  if (exigeArmazenagemFornecedorRespostaCotacao(incluir_armazenagem_cotacao_bid_frete_internacional)) {
    if (!periodosArmazenagemFormularioValidos(form.linhas_periodo_armazenagem)) return false
  }
  return true
}

/** Validação única antes do envio — mensagem específica só para armazenagem. */
export function obterErroValidacaoFormularioRespostaCotacao(
  form: EstadoFormularioRespostaCotacao,
  opts: {
    modal?: ModalFrete | null
    modalidade?: ModalidadeCarga | null
    incluirArmazenagem?: boolean | null
    cotacao?: DetalhesCotacaoResposta | ContextoLocaisOpcionaisCotacaoBidFrete | null
    mensagemCamposObrigatorios: string
    mensagemArmazenagemInvalida: string
    mensagemLocalObrigatorio?: string
  },
): string | null {
  if (
    !form.moeda_proposta_bid_frete_internacional.trim()
    || !form.valor_frete_proposta_bid_frete_internacional.trim()
    || !form.dias_transito_proposta_bid_frete_internacional.trim()
    || !form.validade_proposta_bid_frete_internacional.trim()
  ) {
    return opts.mensagemCamposObrigatorios
  }

  if (
    exigeArmazenagemFornecedorRespostaCotacao(opts.incluirArmazenagem)
    && !periodosArmazenagemFormularioValidos(form.linhas_periodo_armazenagem)
  ) {
    return opts.mensagemArmazenagemInvalida
  }

  if (!camposLogisticaRespostaCotacaoValidos(
    form,
    opts.modal,
    opts.modalidade,
    opts.incluirArmazenagem,
  )) {
    return opts.mensagemCamposObrigatorios
  }

  if (opts.cotacao) {
    for (const lado of ['origem', 'destino'] as const) {
      if (!exigeSelecaoLocalFornecedorRespostaBidFrete(opts.cotacao, lado)) continue
      const valor = lado === 'origem'
        ? form.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional.trim()
        : form.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional.trim()
      if (!valor) {
        return opts.mensagemLocalObrigatorio ?? opts.mensagemCamposObrigatorios
      }
    }
  }

  return null
}

export const ESTADO_INICIAL_FORMULARIO_RESPOSTA: EstadoFormularioRespostaCotacao = {
  moeda_proposta_bid_frete_internacional: '',
  valor_frete_proposta_bid_frete_internacional: '',
  linhas_taxa_origem: [],
  linhas_taxa_destino: [],
  dias_transito_proposta_bid_frete_internacional: '',
  dias_free_time_proposta_bid_frete_internacional: '',
  dias_prazo_pagamento_proposta_bid_frete_internacional: '',
  validade_proposta_bid_frete_internacional: '',
  transbordos_proposta_bid_frete_internacional: '',
  escalas_proposta_bid_frete_internacional: '',
  observacoes_proposta_bid_frete_internacional: '',
  codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: '',
  codigo_porto_aeroporto_destino_proposta_bid_frete_internacional: '',
  linhas_periodo_armazenagem: [criarLinhaPeriodoArmazenagemVazia()],
}

function dataIsoParaCalendario(iso: string): { inicio: Date | null; fim: Date | null } {
  const normalizada = iso.trim().slice(0, 10)
  if (!normalizada) return { inicio: null, fim: null }
  const data = new Date(`${normalizada}T00:00:00`)
  if (Number.isNaN(data.getTime())) return { inicio: null, fim: null }
  return { inicio: data, fim: data }
}

function calendarioParaDataIso(inicio: Date | null): string {
  if (!inicio) return ''
  return `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`
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
  const { t } = useTranslation()
  const textosOpcionais = useTextosLocaisOpcionaisCotacaoBidFrete(cotacao ?? {})
  const localizacaoOrigemTexto = cotacao
    ? montarTextoLocalizacaoComplementarEmailDisparoBidFrete({
      paisCodigo: cotacao.origem_pais_cotacao_bid_frete_internacional,
      estadoProvincia: cotacao.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional,
      cidade: cotacao.cidade_origem_rodoviario_cotacao_bid_frete_internacional,
      endereco: cotacao.endereco_origem_cotacao_bid_frete_internacional,
    })
    : null
  const localizacaoDestinoTexto = cotacao
    ? montarTextoLocalizacaoComplementarEmailDisparoBidFrete({
      paisCodigo: cotacao.destino_pais_cotacao_bid_frete_internacional,
      estadoProvincia: cotacao.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional,
      cidade: cotacao.cidade_destino_rodoviario_cotacao_bid_frete_internacional,
      endereco: cotacao.endereco_destino_cotacao_bid_frete_internacional,
    })
    : null
  const partesCarga: string[] = []
  if (cotacao?.descricao_mercadoria_cotacao_bid_frete_internacional) {
    partesCarga.push(cotacao.descricao_mercadoria_cotacao_bid_frete_internacional)
  }
  if (
    cotacao?.tipo_container_cotacao_bid_frete_internacional?.trim()
    && cotacao?.quantidade_volume_cotacao_bid_frete_internacional != null
  ) {
    partesCarga.push(
      `${cotacao.quantidade_volume_cotacao_bid_frete_internacional}× ${cotacao.tipo_container_cotacao_bid_frete_internacional.trim()}`,
    )
  } else if (cotacao?.quantidade_volume_cotacao_bid_frete_internacional != null) {
    partesCarga.push(`${cotacao.quantidade_volume_cotacao_bid_frete_internacional} un`)
  }
  if (cotacao?.peso_kg_cotacao_bid_frete_internacional != null) {
    partesCarga.push(`${cotacao.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} kg`)
  }
  if (cotacao?.peso_ton_cotacao_bid_frete_internacional != null && cotacao.peso_ton_cotacao_bid_frete_internacional > 0) {
    partesCarga.push(`${cotacao.peso_ton_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} t`)
  }
  if (cotacao?.cubagem_m3_cotacao_bid_frete_internacional != null) {
    partesCarga.push(`${cotacao.cubagem_m3_cotacao_bid_frete_internacional} m³`)
  }

  const modalidadeLabel = cotacao?.modalidade_cotacao_bid_frete_internacional
    ? MODALIDADE_LABELS[cotacao.modalidade_cotacao_bid_frete_internacional]
      ?? cotacao.modalidade_cotacao_bid_frete_internacional
    : null
  const dimensoesCubagem = formatarDimensoesCubagemDetalhesResposta(cotacao)
  const cargaPerigosaTexto = cotacao?.eh_carga_perigosa_cotacao_bid_frete_internacional
    ? formatarCargaPerigosaDetalhesResposta(cotacao)
      ?? t('bidfrete.portal.detalhes.carga_perigosa_sim', { defaultValue: 'Sim' })
    : null
  const prazoResposta = cotacao?.data_limite_resposta_cotacao_bid_frete_internacional
    ? (() => {
        const data = new Date(cotacao.data_limite_resposta_cotacao_bid_frete_internacional as string)
        return Number.isNaN(data.getTime())
          ? null
          : data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      })()
    : null
  const nomesArmazensRaw = cotacao?.nomes_armazem_alfandegado_cotacao_bid_frete_internacional
  const nomesArmazensPreferencia = (Array.isArray(nomesArmazensRaw) ? nomesArmazensRaw : [])
    .filter((nome): nome is string => typeof nome === 'string')
    .map((nome) => nome.trim())
    .filter(Boolean)

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
            {formatarRotaExibicaoCotacao(
              cotacao?.origem_nome_cotacao_bid_frete_internacional ?? '',
              cotacao?.destino_nome_cotacao_bid_frete_internacional ?? '',
            )}
          </span>
        </div>
        {textosOpcionais.origem ? (
          <div className="brc-detalhe brc-detalhe--wide">
            <span className="brc-detalhe-label">
              {rotuloExibicaoLocaisOpcionaisCotacaoBidFrete(t, 'origem', cotacao ?? {})}
            </span>
            <span className="brc-detalhe-valor">{textosOpcionais.origem}</span>
          </div>
        ) : null}
        {localizacaoOrigemTexto ? (
          <div className="brc-detalhe brc-detalhe--wide">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.origem_complementar', { defaultValue: 'Origem' })}
            </span>
            <span className="brc-detalhe-valor">{localizacaoOrigemTexto}</span>
          </div>
        ) : null}
        {textosOpcionais.destino ? (
          <div className="brc-detalhe brc-detalhe--wide">
            <span className="brc-detalhe-label">
              {rotuloExibicaoLocaisOpcionaisCotacaoBidFrete(t, 'destino', cotacao ?? {})}
            </span>
            <span className="brc-detalhe-valor">{textosOpcionais.destino}</span>
          </div>
        ) : null}
        {localizacaoDestinoTexto ? (
          <div className="brc-detalhe brc-detalhe--wide">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.destino_complementar', { defaultValue: 'Destino' })}
            </span>
            <span className="brc-detalhe-valor">{localizacaoDestinoTexto}</span>
          </div>
        ) : null}
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">{rotuloModal}</span>
          <span className="brc-detalhe-valor">
            {cotacao?.modal_cotacao_bid_frete_internacional
              ? MODAL_ICONS_RESPOSTA[cotacao.modal_cotacao_bid_frete_internacional]
              : null}
            {cotacao?.modal_cotacao_bid_frete_internacional
              ? `${MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional]}${modalidadeLabel ? ` · ${modalidadeLabel}` : ''}`
              : '—'}
          </span>
        </div>
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">{rotuloIncoterm}</span>
          <span className="brc-detalhe-valor">
            {cotacao?.incoterm_cotacao_bid_frete_internacional ?? '—'}
          </span>
        </div>
        {cotacao?.referencia_interna_cotacao_bid_frete_internacional?.trim() ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.referencia_interna', { defaultValue: 'Referência interna' })}
            </span>
            <span className="brc-detalhe-valor">
              {cotacao.referencia_interna_cotacao_bid_frete_internacional.trim()}
            </span>
          </div>
        ) : null}
        {cotacao?.ncm_cotacao_bid_frete_internacional?.trim() ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.ncm', { defaultValue: 'NCM' })}
            </span>
            <span className="brc-detalhe-valor">
              {cotacao.ncm_cotacao_bid_frete_internacional.trim()}
            </span>
          </div>
        ) : null}
        {cotacao?.hs_code_cotacao_bid_frete_internacional?.trim() ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.hs_code', { defaultValue: 'HS Code' })}
            </span>
            <span className="brc-detalhe-valor">
              {cotacao.hs_code_cotacao_bid_frete_internacional.trim()}
            </span>
          </div>
        ) : null}
        <div className="brc-detalhe brc-detalhe--wide">
          <span className="brc-detalhe-label">{rotuloCarga}</span>
          <span className="brc-detalhe-valor">
            <Package weight="duotone" size={14} aria-hidden />
            {partesCarga.length > 0 ? partesCarga.join(' · ') : '—'}
          </span>
        </div>
        {dimensoesCubagem ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.dimensoes_cubagem', { defaultValue: 'Dimensões (C × L × A)' })}
            </span>
            <span className="brc-detalhe-valor">{dimensoesCubagem}</span>
          </div>
        ) : null}
        {prazoResposta ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.prazo_resposta', { defaultValue: 'Prazo de resposta' })}
            </span>
            <span className="brc-detalhe-valor">{prazoResposta}</span>
          </div>
        ) : null}
        <div className="brc-detalhe">
          <span className="brc-detalhe-label">
            {t('bidfrete.portal.detalhes.pagador_taxa_fechamento', {
              defaultValue: 'Taxa de fechamento paga por',
            })}
          </span>
          <span className="brc-detalhe-valor">
            {rotuloEmpresaPagadoraTaxaFechamentoPlataformaGravity(
              cotacao?.empresa_pagadora_taxa_fechamento_plataforma_gravity,
            )}
          </span>
        </div>
        {cargaPerigosaTexto ? (
          <div className="brc-detalhe brc-detalhe--wide">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.carga_perigosa', { defaultValue: 'Carga perigosa' })}
            </span>
            <span className="brc-detalhe-valor">
              <WarningCircle weight="duotone" size={14} aria-hidden />
              {cargaPerigosaTexto}
            </span>
          </div>
        ) : null}
        {cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.armazenagem', { defaultValue: 'Armazenagem' })}
            </span>
            <span className="brc-detalhe-valor">
              {t('bidfrete.portal.detalhes.armazenagem_incluida', { defaultValue: 'Incluir armazenagem na cotação' })}
            </span>
          </div>
        ) : null}
        {cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional && nomesArmazensPreferencia.length > 0 ? (
          <div className="brc-detalhe">
            <span className="brc-detalhe-label">
              {t('bidfrete.portal.detalhes.armazens_preferencia', {
                defaultValue: 'Armazéns alfandegados de preferência',
              })}
            </span>
            <span className="brc-detalhe-valor">{nomesArmazensPreferencia.join(', ')}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function FormPropostaRespostaCotacao({
  form,
  modalCotacao,
  modalidadeCotacao,
  cotacaoLocais,
  incluirArmazenagemCotacao = false,
  onChange,
  onLinhasOrigemChange,
  onLinhasDestinoChange,
  onLinhasPeriodoArmazenagemChange,
  onSubmit,
  tituloSecao,
  rotulos,
  erro,
  enviando,
  textoEnviar,
  textoEnviando,
}: {
  form: EstadoFormularioRespostaCotacao
  modalCotacao?: ModalFrete | null
  modalidadeCotacao?: ModalidadeCarga | null
  cotacaoLocais?: DetalhesCotacaoResposta | ContextoLocaisOpcionaisCotacaoBidFrete | null
  incluirArmazenagemCotacao?: boolean
  onChange: (field: keyof EstadoFormularioRespostaCotacao, value: string) => void
  onLinhasOrigemChange: (linhas: LinhaTaxaPropostaBidFreteInternacional[]) => void
  onLinhasDestinoChange: (linhas: LinhaTaxaPropostaBidFreteInternacional[]) => void
  onLinhasPeriodoArmazenagemChange: (linhas: LinhaPeriodoArmazenagemFormBidFreteInternacional[]) => void
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
    prazoPagamento: string
    validade: string
    transbordos: string
    escalas: string
    observacoes: string
    placeholderTransit: string
    placeholderFreeTime: string
    placeholderPrazoPagamento: string
    placeholderTransbordos: string
    placeholderEscalas: string
    placeholderValorFrete: string
    placeholderValidade: string
    placeholderObservacoes: string
    armazenagem: string
    adicionarPeriodoArmazenagem: string
    diasPeriodoArmazenagem: string
    tipoTarifaPeriodoArmazenagem: string
    valorTarifaReais: string
    valorTarifaPercentual: string
    minimoReaisPeriodoArmazenagem: string
    placeholderDiasPeriodoArmazenagem: string
    placeholderValorReaisArmazenagem: string
    placeholderValorPercentualArmazenagem: string
    placeholderMinimoArmazenagem: string
  }
  erro: string
  enviando: boolean
  textoEnviar: string
  textoEnviando: string
}) {
  const { t } = useTranslation()
  const {
    opcoes: opcoesMoeda,
    loading: carregandoMoedas,
    erro: erroMoedas,
    indisponivel: moedasIndisponiveis,
  } = useOpcoesMoedaCadastrosBidFreteInternacional()

  const placeholderMoeda = erroMoedas
    ? t('bidfrete.portal.responder.moeda_erro', {
      erro: erroMoedas,
      defaultValue: 'Erro ao carregar moedas: {{erro}}',
    })
    : (!carregandoMoedas && opcoesMoeda.length === 0)
      ? t('bidfrete.portal.responder.moeda_sem_cadastro', {
        defaultValue: 'Nenhuma moeda cadastrada',
      })
      : t('bidfrete.portal.responder.moeda_selecionar', {
        defaultValue: 'Selecionar moeda',
      })

  const mostrarTransbordos = exibeCampoTransbordosRespostaCotacao(modalCotacao)
  const mostrarEscalas = exibeCampoEscalasRespostaCotacao(modalCotacao)
  const freeTimeObrigatorio = exigeFreeTimeObrigatorioRespostaCotacao(modalidadeCotacao)
  const mostrarArmazenagem = exigeArmazenagemFornecedorRespostaCotacao(incluirArmazenagemCotacao)
  const pagadorTaxaFechamento = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(
    cotacaoLocais?.empresa_pagadora_taxa_fechamento_plataforma_gravity,
  )
  const textoAceiteCondicoes = montarTextoAceiteCondicoesPortalRespostaBidFrete(pagadorTaxaFechamento)

  const composicaoProposta = calcularComposicaoPropostaResposta({
    moeda_frete: form.moeda_proposta_bid_frete_internacional,
    valor_frete: form.valor_frete_proposta_bid_frete_internacional,
    linhas_taxa_origem: form.linhas_taxa_origem,
    linhas_taxa_destino: form.linhas_taxa_destino,
  })

  const ctxLocais = cotacaoLocais ?? {}
  const exigeLocalOrigem = exigeSelecaoLocalFornecedorRespostaBidFrete(ctxLocais, 'origem')
  const exigeLocalDestino = exigeSelecaoLocalFornecedorRespostaBidFrete(ctxLocais, 'destino')
  const {
    opcoesOrigem: opcoesLocalOrigem,
    opcoesDestino: opcoesLocalDestino,
    carregando: carregandoLocais,
  } = useLocaisSelecaoFornecedorRespostaBidFrete(ctxLocais)

  return (
    <section className="brc-secao" aria-labelledby="brc-proposta-titulo">
      <form onSubmit={onSubmit} noValidate>
        <h2 id="brc-proposta-titulo" className="brc-secao-titulo">{tituloSecao}</h2>
        <div className="brc-form-grid">
          {exigeLocalOrigem ? (
            <div className="brc-field brc-field--wide">
              <LabelObrigatorio>
                {rotuloSelecaoLocalFornecedorRespostaBidFrete(t, 'origem', ctxLocais)}
              </LabelObrigatorio>
              <SelectGlobal
                id="brc-local-origem-proposta"
                opcoes={opcoesLocalOrigem}
                valor={form.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional || null}
                aoMudarValor={(v) =>
                  onChange(
                    'codigo_porto_aeroporto_origem_proposta_bid_frete_internacional',
                    v == null ? '' : String(v),
                  )
                }
                buscavel
                carregando={carregandoLocais}
                placeholder={t('bidfrete.portal.responder.selecionar_local_origem', {
                  defaultValue: 'Selecionar origem',
                })}
                posicao="auto"
              />
            </div>
          ) : null}
          {exigeLocalDestino ? (
            <div className="brc-field brc-field--wide">
              <LabelObrigatorio>
                {rotuloSelecaoLocalFornecedorRespostaBidFrete(t, 'destino', ctxLocais)}
              </LabelObrigatorio>
              <SelectGlobal
                id="brc-local-destino-proposta"
                opcoes={opcoesLocalDestino}
                valor={form.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional || null}
                aoMudarValor={(v) =>
                  onChange(
                    'codigo_porto_aeroporto_destino_proposta_bid_frete_internacional',
                    v == null ? '' : String(v),
                  )
                }
                buscavel
                carregando={carregandoLocais}
                placeholder={t('bidfrete.portal.responder.selecionar_local_destino', {
                  defaultValue: 'Selecionar destino',
                })}
                posicao="auto"
              />
            </div>
          ) : null}
          <div className="brc-field">
            <LabelObrigatorio>{rotulos.moeda}</LabelObrigatorio>
            <SelectGlobal
              id="brc-moeda-proposta"
              opcoes={opcoesMoeda}
              valor={form.moeda_proposta_bid_frete_internacional || null}
              aoMudarValor={(v) =>
                onChange('moeda_proposta_bid_frete_internacional', v == null ? '' : String(v))
              }
              buscavel
              placeholder={placeholderMoeda}
              carregando={carregandoMoedas}
              desabilitado={moedasIndisponiveis}
              posicao="auto"
            />
          </div>

          <div className="brc-field">
            <LabelObrigatorio>{rotulos.valorFrete}</LabelObrigatorio>
            <CampoValorMonetarioResposta
              id="brc-valor-frete"
              valor={form.valor_frete_proposta_bid_frete_internacional}
              onChange={(v) => onChange('valor_frete_proposta_bid_frete_internacional', v)}
              placeholder={rotulos.placeholderValorFrete}
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
            />
          </div>

          {mostrarArmazenagem && (
            <div className="brc-field brc-field--wide">
              <SecaoPeriodosArmazenagemPropostaBidFreteInternacional
                titulo={rotulos.armazenagem}
                rotuloAdicionarPeriodo={rotulos.adicionarPeriodoArmazenagem}
                rotuloDias={rotulos.diasPeriodoArmazenagem}
                rotuloTipoTarifa={rotulos.tipoTarifaPeriodoArmazenagem}
                rotuloValorTarifa={rotulos.valorTarifaReais}
                rotuloValorPercentual={rotulos.valorTarifaPercentual}
                rotuloMinimoReais={rotulos.minimoReaisPeriodoArmazenagem}
                placeholderDias={rotulos.placeholderDiasPeriodoArmazenagem}
                placeholderValorReais={rotulos.placeholderValorReaisArmazenagem}
                placeholderValorPercentual={rotulos.placeholderValorPercentualArmazenagem}
                placeholderMinimo={rotulos.placeholderMinimoArmazenagem}
                linhas={form.linhas_periodo_armazenagem}
                onChange={onLinhasPeriodoArmazenagemChange}
              />
            </div>
          )}

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
              placeholder={rotulos.placeholderTransit}
              value={form.dias_transito_proposta_bid_frete_internacional}
              onChange={(e) => onChange('dias_transito_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field">
            {freeTimeObrigatorio ? (
              <LabelObrigatorio>{rotulos.freeTime}</LabelObrigatorio>
            ) : (
              <label className="brc-label">{rotulos.freeTime}</label>
            )}
            <input
              className="brc-input brc-input--mono"
              type="number"
              min="0"
              step="1"
              placeholder={rotulos.placeholderFreeTime}
              value={form.dias_free_time_proposta_bid_frete_internacional}
              onChange={(e) => onChange('dias_free_time_proposta_bid_frete_internacional', e.target.value)}
            />
          </div>

          <div className="brc-field brc-field--calendario">
            <LabelObrigatorio>{rotulos.validade}</LabelObrigatorio>
            <CampoCalendarioGlobal
              className="brc-calendario-campo"
              valor={dataIsoParaCalendario(form.validade_proposta_bid_frete_internacional)}
              aoMudarValor={(v) =>
                onChange('validade_proposta_bid_frete_internacional', calendarioParaDataIso(v.inicio))
              }
              placeholder={rotulos.placeholderValidade}
              modoUnico
            />
          </div>

          {mostrarTransbordos ? (
            <div className="brc-field">
              <LabelObrigatorio>{rotulos.transbordos}</LabelObrigatorio>
              <input
                className="brc-input brc-input--mono"
                type="number"
                min={0}
                step={1}
                placeholder={rotulos.placeholderTransbordos}
                value={form.transbordos_proposta_bid_frete_internacional}
                onChange={(e) => onChange('transbordos_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
          ) : null}

          {mostrarEscalas ? (
            <div className="brc-field">
              <LabelObrigatorio>{rotulos.escalas}</LabelObrigatorio>
              <input
                className="brc-input brc-input--mono"
                type="number"
                min={0}
                step={1}
                placeholder={rotulos.placeholderEscalas}
                value={form.escalas_proposta_bid_frete_internacional}
                onChange={(e) => onChange('escalas_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
          ) : null}

          <div className="brc-field">
            <LabelObrigatorio>{rotulos.prazoPagamento}</LabelObrigatorio>
            <input
              className="brc-input brc-input--mono"
              type="number"
              min="0"
              step="1"
              placeholder={rotulos.placeholderPrazoPagamento}
              value={form.dias_prazo_pagamento_proposta_bid_frete_internacional}
              onChange={(e) => onChange('dias_prazo_pagamento_proposta_bid_frete_internacional', e.target.value)}
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
          <p className="brc-aceite-condicoes">
            {t(
              'bidfrete.portal.responder.aviso_aceite_condicoes',
              textoAceiteCondicoes,
            )}{' '}
            <a
              className="brc-aceite-condicoes__link"
              href={ROTA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL}
              target="_blank"
              rel="noreferrer"
            >
              {t('bidfrete.portal.responder.aviso_aceite_condicoes_link', 'Leia as condições')}
            </a>
          </p>
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

export function FaixaUltimaAlteracaoPropostaResposta({
  registro,
  t,
}: {
  registro: import('./types').RegistroAlteracaoPropostaBidFreteInternacional | null | undefined
  t: TFunction
}) {
  if (!registro || registro.tipo_registro_alteracao_proposta_bid_frete_internacional !== 'ATUALIZAR') {
    return null
  }

  const alteracoes = registro.alteracoes_registro_alteracao_proposta_bid_frete_internacional
  if (alteracoes.length === 0) return null

  const data = new Date(registro.data_registro_alteracao_proposta_bid_frete_internacional).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="brc-aviso-edicao brc-aviso-edicao--alteracao" role="status">
      <p className="brc-aviso-edicao__titulo">
        {t('bidfrete.portal.publico.ultima_alteracao_titulo', 'Última alteração em {{data}}', { data })}
      </p>
      <ul className="brc-aviso-edicao__lista">
        {alteracoes.map(item => (
          <li key={item.campo}>
            {item.rotulo}: {String(item.valor_antes)} → {String(item.valor_depois)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export type VarianteMensagemRespostaCotacao = 'sucesso' | 'invalido' | 'bloqueado' | 'carregando'

function FundoGravityRespostaPublica() {
  return (
    <div className="brc-auth-fundo" aria-hidden>
      <div className="brc-auth-brand-grid" />
    </div>
  )
}

function MarcaLateralGravityRespostaPublica({ estiloMarca }: { estiloMarca?: React.CSSProperties }) {
  const { t } = useTranslation()
  const urlMarketplace = urlMarketplaceBidFreteInternacional()

  const features = [
    {
      icon: <Table size={20} weight="duotone" className="brc-auth-feature-icon" />,
      title: t('bidfrete.resposta_publica.marca_feature_1_titulo'),
      desc: t('bidfrete.resposta_publica.marca_feature_1_desc'),
    },
    {
      icon: <BellRinging size={20} weight="duotone" className="brc-auth-feature-icon" />,
      title: t('bidfrete.resposta_publica.marca_feature_2_titulo'),
      desc: t('bidfrete.resposta_publica.marca_feature_2_desc'),
    },
    {
      icon: <HandCoins size={20} weight="duotone" className="brc-auth-feature-icon" />,
      title: t('bidfrete.resposta_publica.marca_feature_3_titulo'),
      desc: t('bidfrete.resposta_publica.marca_feature_3_desc'),
    },
    {
      icon: <RocketLaunch size={20} weight="duotone" className="brc-auth-feature-icon" />,
      title: t('bidfrete.resposta_publica.marca_feature_4_titulo'),
      desc: t('bidfrete.resposta_publica.marca_feature_4_desc'),
    },
  ]

  return (
    <aside
      className="brc-auth-marca-login"
      style={estiloMarca}
      aria-label={t('bidfrete.resposta_publica.marca_aria')}
    >
      <div className="brc-auth-marca-conteudo">
        <a
          href={urlMarketplace}
          {...PROP_LINK_MARKETPLACE}
          className="brc-auth-marca-link brc-auth-logo"
        >
          <LogoGlobal iconSize={30} iconColor="#818cf8" />
        </a>

        <a
          href={urlMarketplace}
          {...PROP_LINK_MARKETPLACE}
          className="brc-auth-marca-link brc-auth-marca-hero"
        >
          <h1 className="brc-auth-headline">
            {t('bidfrete.resposta_publica.marca_headline')}{' '}
            <span className="brc-auth-headline-accent">{t('bidfrete.resposta_publica.marca_headline_destaque')}</span>
          </h1>

          <p className="brc-auth-subheadline">{t('bidfrete.resposta_publica.marca_subheadline')}</p>
        </a>

        <div className="brc-auth-features">
          {features.map((feature, index) => (
            <a
              key={feature.title}
              href={urlMarketplace}
              {...PROP_LINK_MARKETPLACE}
              className="brc-auth-feature brc-auth-marca-link"
              style={{ '--i': index } as React.CSSProperties}
            >
              <div className="brc-auth-feature-icon-wrapper">{feature.icon}</div>
              <div className="brc-auth-feature-content">
                <h2 className="brc-auth-feature-title">{feature.title}</h2>
                <p className="brc-auth-feature-desc">{feature.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function ShellPaginaRespostaCotacao({
  modo,
  layoutPainel = 'formulario',
  children,
}: {
  modo: 'publico' | 'logado'
  /** formulario = scroll no painel direito; estado = card compacto centralizado (invalido, sucesso, etc.) */
  layoutPainel?: 'formulario' | 'estado'
  children: React.ReactNode
}) {
  useTravaScrollPortalEstadoResposta(modo === 'publico' && layoutPainel === 'estado')

  if (modo === 'logado') {
    return (
      <div className="brc-page brc-page--logado">
        <div className="brc-shell">{children}</div>
      </div>
    )
  }

  if (layoutPainel === 'estado') {
    return createPortal(
      <div
        className="brc-page brc-page--publico brc-auth-layout brc-auth-layout--estado brc-auth-portal-estado"
        data-brc-layout-estado=""
      >
        <FundoGravityRespostaPublica />
        <MarcaLateralGravityRespostaPublica />
        <div className="brc-auth-painel-direito-estado">
          <div className="brc-auth-estado-conteudo">{children}</div>
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <div className="brc-page brc-page--publico brc-auth-layout brc-auth-layout--formulario">
      <FundoGravityRespostaPublica />
      <MarcaLateralGravityRespostaPublica />
      <div className="brc-auth-scroll-rail">
        <div className="brc-auth-modal-wrap">
          <div className="brc-auth-painel-form">
            <div className="brc-shell">{children}</div>
          </div>
        </div>
      </div>
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
    moeda: t(`${prefixo}.campo_moeda`, {
      defaultValue: 'Moeda do Frete Base',
    }),
    valorFrete: t(`${prefixo}.campo_valor_frete`, {
      defaultValue: 'Valor do Frete Base',
    }),
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
    prazoPagamento: t(`${prefixo}.campo_prazo_pagamento`, {
      defaultValue: 'Prazo de pagamento (dias)',
    }),
    validade: t(`${prefixo}.campo_validade`),
    transbordos: t(`${prefixo}.campo_transbordos`, {
      defaultValue: 'Quantidade de transbordos',
    }),
    escalas: t(`${prefixo}.campo_escalas`, {
      defaultValue: 'Quantidade de escalas',
    }),
    observacoes: t(`${prefixo}.campo_observacoes`),
    placeholderTransit: t('bidfrete.portal.responder.placeholder_transit', {
      defaultValue: 'Informar dias',
    }),
    placeholderFreeTime: t('bidfrete.portal.responder.placeholder_free_time', {
      defaultValue: 'Informar dias',
    }),
    placeholderPrazoPagamento: t('bidfrete.portal.responder.placeholder_prazo_pagamento', {
      defaultValue: 'Informar dias',
    }),
    placeholderTransbordos: t('bidfrete.portal.responder.placeholder_transbordos', {
      defaultValue: 'Informar quantidade',
    }),
    placeholderEscalas: t('bidfrete.portal.responder.placeholder_escalas', {
      defaultValue: 'Informar quantidade',
    }),
    placeholderValorFrete: t('bidfrete.portal.responder.placeholder_valor_frete', {
      defaultValue: 'Informar valor',
    }),
    placeholderValidade: t('bidfrete.portal.responder.placeholder_validade', {
      defaultValue: 'Informar data',
    }),
    placeholderObservacoes: t('bidfrete.portal.publico.placeholder_observacoes', {
      defaultValue: 'Informações adicionais, condições especiais, observações...',
    }),
    armazenagem: t('bidfrete.portal.responder.armazenagem', {
      defaultValue: 'Armazenagem',
    }),
    adicionarPeriodoArmazenagem: t('bidfrete.portal.responder.armazenagem_adicionar_periodo', {
      defaultValue: 'Adicionar período',
    }),
    diasPeriodoArmazenagem: t('bidfrete.portal.responder.armazenagem_dias', {
      defaultValue: 'Dias',
    }),
    tipoTarifaPeriodoArmazenagem: t('bidfrete.portal.responder.armazenagem_tipo_tarifa', {
      defaultValue: 'Tipo de tarifa',
    }),
    valorTarifaReais: t('bidfrete.portal.responder.armazenagem_valor_reais', {
      defaultValue: 'Valor em R$',
    }),
    valorTarifaPercentual: t('bidfrete.portal.responder.armazenagem_valor_percentual', {
      defaultValue: 'Percentual sobre mercadoria (%)',
    }),
    minimoReaisPeriodoArmazenagem: t('bidfrete.portal.responder.armazenagem_minimo_reais', {
      defaultValue: 'Mínimo em R$',
    }),
    placeholderDiasPeriodoArmazenagem: t('bidfrete.portal.responder.armazenagem_placeholder_dias', {
      defaultValue: 'Informar dias',
    }),
    placeholderValorReaisArmazenagem: t('bidfrete.portal.responder.armazenagem_placeholder_valor_reais', {
      defaultValue: 'Informar valor em reais',
    }),
    placeholderValorPercentualArmazenagem: t('bidfrete.portal.responder.armazenagem_placeholder_percentual', {
      defaultValue: 'Ex.: 2,5',
    }),
    placeholderMinimoArmazenagem: t('bidfrete.portal.responder.armazenagem_placeholder_minimo', {
      defaultValue: 'Informar mínimo em R$',
    }),
    enviar: t(`${prefixo}.enviar`),
    enviando: t(`${prefixo}.enviando`),
  }
}

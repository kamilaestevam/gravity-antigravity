import type { ModalFrete } from './types'
import { exigeArmazenagemFornecedorRespostaCotacao } from './armazenagem-lcl-maritimo-bid-frete-internacional'
import {
  exibeCampoEscalasRespostaCotacao,
  exibeCampoTransbordosRespostaCotacao,
  type EstadoFormularioRespostaCotacao,
} from './formulario-resposta-cotacao-bid-frete-internacional'
import {
  linhasPeriodoArmazenagemParaPayload,
} from './periodos-armazenagem-proposta-bid-frete-internacional'
import {
  linhasParaPayloadTaxas,
  parseValorLinhaTaxa,
  somarLinhasTaxa,
} from './taxas-linha-proposta-bid-frete-internacional'

export function montarPayloadPropostaRespostaBidFreteInternacional(
  form: EstadoFormularioRespostaCotacao,
  modalCotacao?: ModalFrete | null,
  incluir_armazenagem_cotacao_bid_frete_internacional?: boolean | null,
) {
  const valorFrete = parseValorLinhaTaxa(form.valor_frete_proposta_bid_frete_internacional)
  const taxasOrigem = somarLinhasTaxa(form.linhas_taxa_origem)
  const taxasDestino = somarLinhasTaxa(form.linhas_taxa_destino)
  const taxasDetalhe = [
    ...linhasParaPayloadTaxas(form.linhas_taxa_origem, 'origem'),
    ...linhasParaPayloadTaxas(form.linhas_taxa_destino, 'destino'),
  ]

  const exigeArmazenagem = exigeArmazenagemFornecedorRespostaCotacao(
    incluir_armazenagem_cotacao_bid_frete_internacional,
  )
  const periodosArmazenagem = exigeArmazenagem
    ? linhasPeriodoArmazenagemParaPayload(form.linhas_periodo_armazenagem)
    : null

  return {
    moeda_proposta_bid_frete_internacional: form.moeda_proposta_bid_frete_internacional,
    valor_frete_proposta_bid_frete_internacional: valorFrete,
    taxas_origem_proposta_bid_frete_internacional: taxasOrigem,
    taxas_destino_proposta_bid_frete_internacional: taxasDestino,
    valor_total_proposta_bid_frete_internacional: valorFrete + taxasOrigem + taxasDestino,
    dias_transito_proposta_bid_frete_internacional: parseInt(form.dias_transito_proposta_bid_frete_internacional, 10),
    dias_free_time_proposta_bid_frete_internacional: form.dias_free_time_proposta_bid_frete_internacional
      ? parseInt(form.dias_free_time_proposta_bid_frete_internacional, 10)
      : null,
    dias_prazo_pagamento_proposta_bid_frete_internacional: parseInt(
      form.dias_prazo_pagamento_proposta_bid_frete_internacional,
      10,
    ),
    validade_proposta_bid_frete_internacional: form.validade_proposta_bid_frete_internacional,
    transbordos_proposta_bid_frete_internacional: exibeCampoTransbordosRespostaCotacao(modalCotacao)
      ? parseInt(form.transbordos_proposta_bid_frete_internacional, 10) || 0
      : 0,
    escalas_proposta_bid_frete_internacional: exibeCampoEscalasRespostaCotacao(modalCotacao)
      ? String(parseInt(form.escalas_proposta_bid_frete_internacional, 10) || 0)
      : undefined,
    observacoes_proposta_bid_frete_internacional: form.observacoes_proposta_bid_frete_internacional || null,
    periodos_armazenagem_proposta_bid_frete_internacional: periodosArmazenagem,
    taxas: taxasDetalhe,
  }
}

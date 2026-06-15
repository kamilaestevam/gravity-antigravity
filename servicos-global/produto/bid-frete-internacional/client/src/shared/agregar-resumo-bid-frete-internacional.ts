/**
 * Agrega resumo de rotas/modais das cotações filhas no registro BID (função pura — client + server).
 */
export function agregarResumoBidFreteInternacional(
  cotacoes: Array<{
    modal_cotacao_bid_frete_internacional: string
    origem_nome_cotacao_bid_frete_internacional: string
    origem_codigo_cotacao_bid_frete_internacional: string
    origem_pais_cotacao_bid_frete_internacional: string
    destino_nome_cotacao_bid_frete_internacional: string
    destino_codigo_cotacao_bid_frete_internacional: string
    destino_pais_cotacao_bid_frete_internacional: string
    tipo_operacao_cotacao_bid_frete_internacional: string
    modalidade_cotacao_bid_frete_internacional: string
  }>,
): {
  modais_bid_bid_frete_internacional: string[]
  origens_bid_bid_frete_internacional: Array<{ codigo: string; nome: string; pais: string }>
  destinos_bid_bid_frete_internacional: Array<{ codigo: string; nome: string; pais: string }>
  tipo_operacao_bid_bid_frete_internacional: string | null
  modalidade_bid_bid_frete_internacional: string | null
} {
  const modais = [...new Set(cotacoes.map(c => c.modal_cotacao_bid_frete_internacional))]
  const origensMap = new Map<string, { codigo: string; nome: string; pais: string }>()
  const destinosMap = new Map<string, { codigo: string; nome: string; pais: string }>()

  for (const c of cotacoes) {
    origensMap.set(c.origem_codigo_cotacao_bid_frete_internacional, {
      codigo: c.origem_codigo_cotacao_bid_frete_internacional,
      nome: c.origem_nome_cotacao_bid_frete_internacional,
      pais: c.origem_pais_cotacao_bid_frete_internacional,
    })
    destinosMap.set(c.destino_codigo_cotacao_bid_frete_internacional, {
      codigo: c.destino_codigo_cotacao_bid_frete_internacional,
      nome: c.destino_nome_cotacao_bid_frete_internacional,
      pais: c.destino_pais_cotacao_bid_frete_internacional,
    })
  }

  const tipos = new Set(cotacoes.map(c => c.tipo_operacao_cotacao_bid_frete_internacional))
  const modalidades = new Set(cotacoes.map(c => c.modalidade_cotacao_bid_frete_internacional))

  return {
    modais_bid_bid_frete_internacional: modais,
    origens_bid_bid_frete_internacional: [...origensMap.values()],
    destinos_bid_bid_frete_internacional: [...destinosMap.values()],
    tipo_operacao_bid_bid_frete_internacional: tipos.size === 1 ? [...tipos][0] : null,
    modalidade_bid_bid_frete_internacional: modalidades.size === 1 ? [...modalidades][0] : null,
  }
}

export {
  gerarNumeroBidFreteInternacional,
  gerarNumeroCotacaoFreteInternacional,
} from '../../../shared/numeracao-bid-frete-internacional.js'

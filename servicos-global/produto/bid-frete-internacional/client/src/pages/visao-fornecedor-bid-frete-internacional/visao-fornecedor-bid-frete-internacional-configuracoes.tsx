import Configuracoes from '../configuracoes'
import {
  BidFreteConfiguracoesVisaoProvider,
  CONFIG_CONFIGURACOES_FORNECEDOR,
} from '../../shared/bid-frete-configuracoes-visao-context'

/**
 * Configurações — visão fornecedor (mesma UI operacional, storage e kanban isolados).
 */
export default function VisaoFornecedorConfiguracoes() {
  return (
    <BidFreteConfiguracoesVisaoProvider config={CONFIG_CONFIGURACOES_FORNECEDOR}>
      <Configuracoes />
    </BidFreteConfiguracoesVisaoProvider>
  )
}

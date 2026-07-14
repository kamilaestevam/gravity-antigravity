/**
 * Hidrata o formulário Nova Cotação com prefill vindo do Smart Docs (sessionStorage).
 */
import type { PacotePrefillCotacaoBidFreteSmartRead } from '../../../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import { linhaContainerCotacaoVazia } from './containers-cotacao-bid-frete-internacional'

export type FormularioNovaCotacaoBidFreteBase = {
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  modalidade_cotacao_bid_frete_internacional: string
  porto_origem_cotacao_bid_frete_internacional: string
  porto_destino_cotacao_bid_frete_internacional: string
  aeroporto_origem_cotacao_bid_frete_internacional: string
  aeroporto_destino_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional: string
  destino_pais_cotacao_bid_frete_internacional: string
  exibir_campos_extras_origem_cotacao: boolean
  exibir_campos_extras_destino_cotacao: boolean
  estado_provincia_origem_cotacao_bid_frete_internacional: string
  estado_provincia_destino_cotacao_bid_frete_internacional: string
  endereco_origem_cotacao_bid_frete_internacional: string
  endereco_destino_cotacao_bid_frete_internacional: string
  pais_origem_rodoviario_cotacao_bid_frete_internacional: string
  pais_destino_rodoviario_cotacao_bid_frete_internacional: string
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: string
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: string
  cidade_origem_rodoviario_cotacao_bid_frete_internacional: string
  cidade_destino_rodoviario_cotacao_bid_frete_internacional: string
  eh_carga_perigosa_cotacao_bid_frete_internacional: boolean
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
  hs_code_cotacao_bid_frete_internacional: string
  quantidade_volume_cotacao_bid_frete_internacional: number
  tipo_container_cotacao_bid_frete_internacional: string
  linhas_container_fcl_cotacao: ReturnType<typeof linhaContainerCotacaoVazia>[]
  peso_kg_cotacao_bid_frete_internacional: string
  cubagem_m3_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  opcao_incluir_armazenagem_cotacao: '' | 'sim' | 'nao'
}

export function aplicarPrefillSmartReadFormularioNovaCotacaoBidFrete<T extends FormularioNovaCotacaoBidFreteBase>(
  formAtual: T,
  pacote: PacotePrefillCotacaoBidFreteSmartRead,
): T {
  const p = pacote.prefill
  const modal = p.modal_cotacao_bid_frete_internacional ?? formAtual.modal_cotacao_bid_frete_internacional
  const modalidade = p.modalidade_cotacao_bid_frete_internacional ?? formAtual.modalidade_cotacao_bid_frete_internacional
  const exigeFcl = modal === 'MARITIMO' && modalidade === 'FCL'

  const linhasContainer = exigeFcl && p.tipo_container_cotacao_bid_frete_internacional
    ? [{
        ...linhaContainerCotacaoVazia(1),
        tipo_container: p.tipo_container_cotacao_bid_frete_internacional,
        quantidade: p.quantidade_volume_cotacao_bid_frete_internacional ?? 1,
      }]
    : formAtual.linhas_container_fcl_cotacao

  return {
    ...formAtual,
    tipo_operacao_cotacao_bid_frete_internacional:
      p.tipo_operacao_cotacao_bid_frete_internacional ?? formAtual.tipo_operacao_cotacao_bid_frete_internacional,
    modal_cotacao_bid_frete_internacional: modal,
    modalidade_cotacao_bid_frete_internacional: modalidade,
    porto_origem_cotacao_bid_frete_internacional:
      p.porto_origem_cotacao_bid_frete_internacional ?? formAtual.porto_origem_cotacao_bid_frete_internacional,
    porto_destino_cotacao_bid_frete_internacional:
      p.porto_destino_cotacao_bid_frete_internacional ?? formAtual.porto_destino_cotacao_bid_frete_internacional,
    aeroporto_origem_cotacao_bid_frete_internacional:
      p.aeroporto_origem_cotacao_bid_frete_internacional ?? formAtual.aeroporto_origem_cotacao_bid_frete_internacional,
    aeroporto_destino_cotacao_bid_frete_internacional:
      p.aeroporto_destino_cotacao_bid_frete_internacional ?? formAtual.aeroporto_destino_cotacao_bid_frete_internacional,
    origem_pais_cotacao_bid_frete_internacional:
      p.origem_pais_cotacao_bid_frete_internacional ?? formAtual.origem_pais_cotacao_bid_frete_internacional,
    destino_pais_cotacao_bid_frete_internacional:
      p.destino_pais_cotacao_bid_frete_internacional ?? formAtual.destino_pais_cotacao_bid_frete_internacional,
    exibir_campos_extras_origem_cotacao:
      p.exibir_campos_extras_origem_cotacao ?? formAtual.exibir_campos_extras_origem_cotacao,
    exibir_campos_extras_destino_cotacao:
      p.exibir_campos_extras_destino_cotacao ?? formAtual.exibir_campos_extras_destino_cotacao,
    estado_provincia_origem_cotacao_bid_frete_internacional:
      p.estado_provincia_origem_cotacao_bid_frete_internacional
      ?? formAtual.estado_provincia_origem_cotacao_bid_frete_internacional,
    estado_provincia_destino_cotacao_bid_frete_internacional:
      p.estado_provincia_destino_cotacao_bid_frete_internacional
      ?? formAtual.estado_provincia_destino_cotacao_bid_frete_internacional,
    endereco_origem_cotacao_bid_frete_internacional:
      p.endereco_origem_cotacao_bid_frete_internacional ?? formAtual.endereco_origem_cotacao_bid_frete_internacional,
    endereco_destino_cotacao_bid_frete_internacional:
      p.endereco_destino_cotacao_bid_frete_internacional ?? formAtual.endereco_destino_cotacao_bid_frete_internacional,
    pais_origem_rodoviario_cotacao_bid_frete_internacional:
      p.pais_origem_rodoviario_cotacao_bid_frete_internacional
      ?? formAtual.pais_origem_rodoviario_cotacao_bid_frete_internacional,
    pais_destino_rodoviario_cotacao_bid_frete_internacional:
      p.pais_destino_rodoviario_cotacao_bid_frete_internacional
      ?? formAtual.pais_destino_rodoviario_cotacao_bid_frete_internacional,
    estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional:
      p.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional
      ?? formAtual.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional,
    estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional:
      p.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional
      ?? formAtual.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional,
    cidade_origem_rodoviario_cotacao_bid_frete_internacional:
      p.cidade_origem_rodoviario_cotacao_bid_frete_internacional
      ?? formAtual.cidade_origem_rodoviario_cotacao_bid_frete_internacional,
    cidade_destino_rodoviario_cotacao_bid_frete_internacional:
      p.cidade_destino_rodoviario_cotacao_bid_frete_internacional
      ?? formAtual.cidade_destino_rodoviario_cotacao_bid_frete_internacional,
    eh_carga_perigosa_cotacao_bid_frete_internacional:
      p.eh_carga_perigosa_cotacao_bid_frete_internacional
      ?? formAtual.eh_carga_perigosa_cotacao_bid_frete_internacional,
    descricao_mercadoria_cotacao_bid_frete_internacional:
      p.descricao_mercadoria_cotacao_bid_frete_internacional ?? formAtual.descricao_mercadoria_cotacao_bid_frete_internacional,
    ncm_cotacao_bid_frete_internacional:
      p.ncm_cotacao_bid_frete_internacional ?? formAtual.ncm_cotacao_bid_frete_internacional,
    hs_code_cotacao_bid_frete_internacional:
      p.hs_code_cotacao_bid_frete_internacional ?? formAtual.hs_code_cotacao_bid_frete_internacional,
    quantidade_volume_cotacao_bid_frete_internacional:
      p.quantidade_volume_cotacao_bid_frete_internacional ?? formAtual.quantidade_volume_cotacao_bid_frete_internacional,
    tipo_container_cotacao_bid_frete_internacional:
      p.tipo_container_cotacao_bid_frete_internacional ?? formAtual.tipo_container_cotacao_bid_frete_internacional,
    linhas_container_fcl_cotacao: linhasContainer,
    peso_kg_cotacao_bid_frete_internacional:
      p.peso_kg_cotacao_bid_frete_internacional ?? formAtual.peso_kg_cotacao_bid_frete_internacional,
    cubagem_m3_cotacao_bid_frete_internacional:
      p.cubagem_m3_cotacao_bid_frete_internacional ?? formAtual.cubagem_m3_cotacao_bid_frete_internacional,
    incoterm_cotacao_bid_frete_internacional:
      p.incoterm_cotacao_bid_frete_internacional ?? formAtual.incoterm_cotacao_bid_frete_internacional,
    opcao_incluir_armazenagem_cotacao:
      p.opcao_incluir_armazenagem_cotacao ?? formAtual.opcao_incluir_armazenagem_cotacao,
  }
}

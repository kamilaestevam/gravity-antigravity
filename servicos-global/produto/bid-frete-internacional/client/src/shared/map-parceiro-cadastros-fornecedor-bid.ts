/**
 * Mapeia parceiro COMEX (Cadastros SSOT) → shape Fornecedor do BID Frete Internacional.
 */

import type { Fornecedor, StatusFornecedor, TipoFornecedor } from './types'

export type ParceiroCadastrosFrete = {
  id_fornecedor: string
  id_organizacao: string
  nome_fornecedor: string
  cnpj_fornecedor?: string | null
  pais_fornecedor: string
  cidade_fornecedor?: string | null
  email_principal_fornecedor?: string | null
  telefone_principal_fornecedor?: string | null
  whatsapp_principal_fornecedor?: string | null
  pode_ser_agente_fornecedor: boolean
  pode_ser_armador_fornecedor: boolean
  pode_ser_cia_aerea_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
  ativo_fornecedor: boolean
  criado_em_fornecedor?: string
  atualizado_em_fornecedor?: string
}

export function ehParceiroFreteInternacional(parceiro: ParceiroCadastrosFrete): boolean {
  return (
    parceiro.pode_ser_agente_fornecedor
    || parceiro.pode_ser_armador_fornecedor
    || parceiro.pode_ser_cia_aerea_fornecedor
    || parceiro.pode_ser_transportadora_rodoviaria_nacional_fornecedor
    || parceiro.pode_ser_transportadora_rodoviaria_internacional_fornecedor
  )
}

function inferirTipo(parceiro: ParceiroCadastrosFrete): TipoFornecedor {
  if (parceiro.pode_ser_agente_fornecedor) return 'AGENTE_CARGA'
  if (parceiro.pode_ser_armador_fornecedor) return 'ARMADOR'
  if (parceiro.pode_ser_cia_aerea_fornecedor) return 'CIA_AEREA'
  if (
    parceiro.pode_ser_transportadora_rodoviaria_internacional_fornecedor
    || parceiro.pode_ser_transportadora_rodoviaria_nacional_fornecedor
  ) {
    return 'TRANSPORTADORA'
  }
  return 'AGENTE_CARGA'
}

function resolverEmail(parceiro: ParceiroCadastrosFrete): string {
  const email = parceiro.email_principal_fornecedor?.trim()
  if (email) return email.toLowerCase()
  return `cadastros+${parceiro.id_fornecedor}@interno.gravity.local`
}

export function mapParceiroCadastrosParaFornecedorBid(parceiro: ParceiroCadastrosFrete): Fornecedor {
  const agora = new Date().toISOString()
  const status: StatusFornecedor = parceiro.ativo_fornecedor ? 'ATIVO' : 'INATIVO'
  return {
    id_fornecedor_bid_frete_internacional: parceiro.id_fornecedor,
    id_organizacao: parceiro.id_organizacao,
    nome_fornecedor_bid_frete_internacional: parceiro.nome_fornecedor,
    nome_fantasia_fornecedor_bid_frete_internacional: null,
    tipo_fornecedor_bid_frete_internacional: inferirTipo(parceiro),
    status_fornecedor_bid_frete_internacional: status,
    cnpj_fornecedor_bid_frete_internacional: parceiro.cnpj_fornecedor ?? null,
    email_fornecedor_bid_frete_internacional: resolverEmail(parceiro),
    telefone_fornecedor_bid_frete_internacional: parceiro.telefone_principal_fornecedor ?? null,
    whatsapp_fornecedor_bid_frete_internacional: parceiro.whatsapp_principal_fornecedor ?? null,
    website_fornecedor_bid_frete_internacional: null,
    pais_fornecedor_bid_frete_internacional: parceiro.pais_fornecedor,
    cidade_fornecedor_bid_frete_internacional: parceiro.cidade_fornecedor ?? null,
    aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    cotacao_automatica_fornecedor_bid_frete_internacional: false,
    data_criacao_fornecedor_bid_frete_internacional: parceiro.criado_em_fornecedor ?? agora,
    data_atualizacao_fornecedor_bid_frete_internacional: parceiro.atualizado_em_fornecedor ?? agora,
  }
}

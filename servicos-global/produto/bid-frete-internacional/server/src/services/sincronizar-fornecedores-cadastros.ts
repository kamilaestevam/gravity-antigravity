/**
 * Sincroniza parceiros de frete do Cadastros (SSOT) para fornecedor_bid_frete_internacional.
 * A UI cadastra via ModalEditarFornecedor; esta camada materializa o espelho operacional do BID.
 */

import { fetchCadastrosJson } from '../lib/cadastros-client.js'

export type FornecedorCadastrosFrete = {
  id_fornecedor: string
  nome_fornecedor: string
  cnpj_fornecedor?: string | null
  pais_fornecedor: string
  cidade_fornecedor?: string | null
  email_fornecedor?: string | null
  /** @deprecated compat API legada — preferir email_fornecedor */
  email_principal_fornecedor?: string | null
  telefone_fornecedor?: string | null
  telefone_principal_fornecedor?: string | null
  whatsapp_fornecedor?: string | null
  whatsapp_principal_fornecedor?: string | null
  pode_ser_agente_fornecedor: boolean
  pode_ser_armador_fornecedor: boolean
  pode_ser_cia_aerea_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
  ativo_fornecedor: boolean
}

export function extrairEmailParceiroCadastros(fornecedor: FornecedorCadastrosFrete): string | null {
  const email = (fornecedor.email_fornecedor ?? fornecedor.email_principal_fornecedor)?.trim()
  return email ? email.toLowerCase() : null
}

export function extrairTelefoneParceiroCadastros(fornecedor: FornecedorCadastrosFrete): string | null {
  return fornecedor.telefone_fornecedor ?? fornecedor.telefone_principal_fornecedor ?? null
}

export function extrairWhatsappParceiroCadastros(fornecedor: FornecedorCadastrosFrete): string | null {
  return fornecedor.whatsapp_fornecedor ?? fornecedor.whatsapp_principal_fornecedor ?? null
}

type ListaFornecedoresCadastros = {
  itens: FornecedorCadastrosFrete[]
  total: number
}

export type TipoFornecedorBidFrete = 'AGENTE_CARGA' | 'ARMADOR' | 'CIA_AEREA' | 'TRANSPORTADORA'

export function ehParceiroFreteInternacional(fornecedor: FornecedorCadastrosFrete): boolean {
  return (
    fornecedor.pode_ser_agente_fornecedor
    || fornecedor.pode_ser_armador_fornecedor
    || fornecedor.pode_ser_cia_aerea_fornecedor
    || fornecedor.pode_ser_transportadora_rodoviaria_nacional_fornecedor
    || fornecedor.pode_ser_transportadora_rodoviaria_internacional_fornecedor
  )
}

export function inferirTipoFornecedorBidFrete(fornecedor: FornecedorCadastrosFrete): TipoFornecedorBidFrete {
  if (fornecedor.pode_ser_agente_fornecedor) return 'AGENTE_CARGA'
  if (fornecedor.pode_ser_armador_fornecedor) return 'ARMADOR'
  if (fornecedor.pode_ser_cia_aerea_fornecedor) return 'CIA_AEREA'
  if (
    fornecedor.pode_ser_transportadora_rodoviaria_internacional_fornecedor
    || fornecedor.pode_ser_transportadora_rodoviaria_nacional_fornecedor
  ) {
    return 'TRANSPORTADORA'
  }
  return 'AGENTE_CARGA'
}

export function resolverEmailFornecedorBidFrete(fornecedor: FornecedorCadastrosFrete): string {
  const email = extrairEmailParceiroCadastros(fornecedor)
  if (email) return email
  return `cadastros+${fornecedor.id_fornecedor}@interno.gravity.local`
}

export function mapCadastrosParaBidFornecedor(fornecedor: FornecedorCadastrosFrete) {
  return {
    id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor,
    id_produto_gravity: 'bid-frete-internacional',
    nome_fornecedor_bid_frete_internacional: fornecedor.nome_fornecedor,
    tipo_fornecedor_bid_frete_internacional: inferirTipoFornecedorBidFrete(fornecedor),
    pode_ser_agente_fornecedor: fornecedor.pode_ser_agente_fornecedor,
    pode_ser_armador_fornecedor: fornecedor.pode_ser_armador_fornecedor,
    pode_ser_cia_aerea_fornecedor: fornecedor.pode_ser_cia_aerea_fornecedor,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor:
      fornecedor.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor:
      fornecedor.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
    cnpj_fornecedor_bid_frete_internacional: fornecedor.cnpj_fornecedor ?? null,
    email_fornecedor_bid_frete_internacional: resolverEmailFornecedorBidFrete(fornecedor),
    telefone_fornecedor_bid_frete_internacional: extrairTelefoneParceiroCadastros(fornecedor),
    whatsapp_fornecedor_bid_frete_internacional: extrairWhatsappParceiroCadastros(fornecedor),
    pais_fornecedor_bid_frete_internacional: fornecedor.pais_fornecedor,
    cidade_fornecedor_bid_frete_internacional: fornecedor.cidade_fornecedor ?? null,
    status_fornecedor_bid_frete_internacional: fornecedor.ativo_fornecedor ? 'ATIVO' : 'INATIVO',
    aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    cotacao_automatica_fornecedor_bid_frete_internacional: false,
  }
}

export async function listarParceirosFreteCadastros(idOrganizacao: string): Promise<FornecedorCadastrosFrete[]> {
  const lista = await fetchCadastrosJson<ListaFornecedoresCadastros>(
    '/api/v1/fornecedores',
    { pagina: '1', por_pagina: '200', escopo: 'parceiros' },
    { idOrganizacao },
  )
  return (lista.itens ?? []).filter(ehParceiroFreteInternacional)
}

export async function obterParceiroFreteCadastros(
  idOrganizacao: string,
  idFornecedor: string,
): Promise<FornecedorCadastrosFrete | null> {
  try {
    const fornecedor = await fetchCadastrosJson<FornecedorCadastrosFrete>(
      `/api/v1/fornecedores/${encodeURIComponent(idFornecedor)}`,
      undefined,
      { idOrganizacao },
    )
    return ehParceiroFreteInternacional(fornecedor) ? fornecedor : null
  } catch {
    return null
  }
}

export async function sincronizarFornecedorCadastros(
  db: {
    fornecedorBidFreteInternacional: {
      findFirst: (args: unknown) => Promise<{ id_fornecedor_bid_frete_internacional: string } | null>
      create: (args: unknown) => Promise<unknown>
      update: (args: unknown) => Promise<unknown>
    }
  },
  idOrganizacao: string,
  fornecedor: FornecedorCadastrosFrete,
): Promise<void> {
  const dados = mapCadastrosParaBidFornecedor(fornecedor)
  const existente = await db.fornecedorBidFreteInternacional.findFirst({
    where: {
      id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor,
      id_organizacao: idOrganizacao,
    },
  })

  const updateData = {
    nome_fornecedor_bid_frete_internacional: dados.nome_fornecedor_bid_frete_internacional,
    tipo_fornecedor_bid_frete_internacional: dados.tipo_fornecedor_bid_frete_internacional,
    cnpj_fornecedor_bid_frete_internacional: dados.cnpj_fornecedor_bid_frete_internacional,
    email_fornecedor_bid_frete_internacional: dados.email_fornecedor_bid_frete_internacional,
    telefone_fornecedor_bid_frete_internacional: dados.telefone_fornecedor_bid_frete_internacional,
    whatsapp_fornecedor_bid_frete_internacional: dados.whatsapp_fornecedor_bid_frete_internacional,
    pais_fornecedor_bid_frete_internacional: dados.pais_fornecedor_bid_frete_internacional,
    cidade_fornecedor_bid_frete_internacional: dados.cidade_fornecedor_bid_frete_internacional,
    status_fornecedor_bid_frete_internacional: dados.status_fornecedor_bid_frete_internacional,
  }

  if (existente) {
    await db.fornecedorBidFreteInternacional.update({
      where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor },
      data: updateData,
    })
    return
  }

  await db.fornecedorBidFreteInternacional.create({
    data: { ...dados, id_organizacao: idOrganizacao },
  })
}

export async function sincronizarFornecedoresCadastros(
  db: Parameters<typeof sincronizarFornecedorCadastros>[0],
  idOrganizacao: string,
): Promise<number> {
  const parceiros = await listarParceirosFreteCadastros(idOrganizacao)
  for (const parceiro of parceiros) {
    await sincronizarFornecedorCadastros(db, idOrganizacao, parceiro)
  }
  return parceiros.length
}

/**
 * pedidoSnapshots.ts — Helper para montar PedidoSnapshotEmpresa a partir
 * de uma Empresa vinda do serviço Cadastros.
 *
 * Fase 4 PASSO 06 DDD: snapshot é congelado no momento da emissão do Pedido.
 * Mudanças futuras na Empresa em Cadastros NÃO afetam snapshots já gravados.
 */

import type { Empresa } from '../../../cadastros/shared/schemas/index.js'

export type PapelEmpresa = 'importador' | 'exportador' | 'fabricante'

export interface SnapshotEmpresaData {
  id_organizacao: string
  id_workspace?: string | null
  papel: PapelEmpresa
  suid_empresa: string
  nome_empresa: string
  documento_principal: string
  tipo_documento: 'CNPJ' | 'TIN'
  cnpj_raiz: string | null
  endereco_cidade: string | null
  endereco_uf: string | null
  endereco_cep: string | null
  endereco_pais: string | null
  endereco_logradouro: string | null
  contato_email: string | null
  contato_whatsapp: string | null
  motivo_congelamento: 'emissao'
}

/**
 * Converte uma Empresa do Cadastros em dados para PedidoSnapshotEmpresa.
 *
 * - documento_principal = cnpj se BR; caso contrário tin
 * - cnpj_raiz = 8 primeiros dígitos do cnpj (apenas BR)
 *
 * Lança erro se a empresa não tiver documento válido para o país — isso é
 * falha de contrato do Cadastros (não deveria persistir empresa sem documento).
 */
export function montarSnapshotEmpresa(
  empresa: Empresa,
  papel: PapelEmpresa,
  idOrganizacao: string,
  idWorkspace: string | null = null,
): SnapshotEmpresaData {
  const ehBr = empresa.pais_empresa === 'BR'
  const documento = ehBr ? empresa.cnpj_empresa : empresa.tin_empresa
  if (!documento) {
    throw new Error(
      `Empresa ${empresa.suid_empresa} sem documento (${ehBr ? 'cnpj' : 'tin'}) — snapshot não pode ser gerado`,
    )
  }

  return {
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    papel,
    suid_empresa: empresa.suid_empresa,
    nome_empresa: empresa.nome_empresa,
    documento_principal: documento,
    tipo_documento: ehBr ? 'CNPJ' : 'TIN',
    cnpj_raiz: ehBr && empresa.cnpj_empresa ? empresa.cnpj_empresa.replace(/\D/g, '').slice(0, 8) : null,
    endereco_cidade: empresa.cidade_empresa,
    endereco_uf: empresa.estado_empresa,
    endereco_cep: empresa.zipcode_empresa ?? null,
    endereco_pais: empresa.pais_empresa,
    endereco_logradouro: empresa.endereco_empresa ?? null,
    contato_email: empresa.email_empresa ?? null,
    contato_whatsapp: empresa.whatsapp_empresa ?? null,
    motivo_congelamento: 'emissao',
  }
}

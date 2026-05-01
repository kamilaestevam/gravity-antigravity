/**
 * pedidoSnapshots.ts — Helpers para montar snapshots tipados do Pedido a partir
 * de entidades vindas do serviço Cadastros.
 *
 * Snapshots cobertos (FASE 06D — DDD ubíquo):
 *   - PedidoSnapshotEmpresa (importador/exportador/fabricante/agente/despachante/armador)
 *   - PedidoSnapshotOpe     (Operação SISCOMEX)
 *   - PedidoSnapshotNcm     (catálogo NCM)
 *   - PedidoSnapshotMoeda   (catálogo Moeda)
 *   - PedidoSnapshotUnidade (catálogo Unidade)
 *
 * Princípio: snapshot é congelado no momento da emissão do Pedido. Mudanças
 * futuras nas entidades em Cadastros NÃO afetam snapshots já gravados.
 *
 * REGRA 03 (DDD): variáveis TS em camelCase (idOrganizacao, idWorkspace, idPedido).
 * Os helpers retornam objetos com chaves snake_case em DDD para gravação direta
 * via Prisma `db.pedidoSnapshot*.create({ data })`.
 */

import type {
  Empresa,
  Moeda,
  NCM,
  OPE,
  Unidade,
} from '../../../cadastros/shared/schemas/index.js'

// ────────────────────────────────────────────────────────────────────────────
// Empresa
// ────────────────────────────────────────────────────────────────────────────

export type PapelEmpresa =
  | 'importador'
  | 'exportador'
  | 'fabricante'
  | 'agente'
  | 'despachante'
  | 'armador'

export type MotivoCongelamento = 'emissao' | 'atualizacao_manual' | 'transicao_status'

export interface SnapshotEmpresaData {
  id_organizacao: string
  id_workspace?: string | null
  id_pedido?: string  // omitido quando snapshot é criado via nested write
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
  motivo_congelamento: MotivoCongelamento
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
  motivo: MotivoCongelamento = 'emissao',
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
    cnpj_raiz:
      ehBr && empresa.cnpj_empresa
        ? empresa.cnpj_empresa.replace(/\D/g, '').slice(0, 8)
        : null,
    endereco_cidade: empresa.cidade_empresa,
    endereco_uf: empresa.estado_empresa,
    endereco_cep: empresa.zipcode_empresa ?? null,
    endereco_pais: empresa.pais_empresa,
    endereco_logradouro: empresa.endereco_empresa ?? null,
    contato_email: empresa.email_empresa ?? null,
    contato_whatsapp: empresa.whatsapp_empresa ?? null,
    motivo_congelamento: motivo,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// OPE (Operação SISCOMEX)
// ────────────────────────────────────────────────────────────────────────────

export interface SnapshotOpeData {
  id_organizacao: string
  id_workspace?: string | null
  id_pedido?: string
  suid_ope: string | null
  codigo_ope: string
  versao_ope: string | null
  situacao_ope: string | null
  nome_ope: string | null
  cnpj_raiz_empresa: string | null
  pais_ope: string | null
  estado_ope: string | null
  cidade_ope: string | null
  endereco_ope: string | null
  zip_ope: string | null
  tin_ope: string | null
  email_ope: string | null
  motivo_congelamento: MotivoCongelamento
}

/**
 * Converte uma OPE do Cadastros em dados para PedidoSnapshotOpe.
 *
 * Espelha do banco Cadastros (que por sua vez veio do Portal Único SISCOMEX).
 * Lança erro se faltar identidade mínima (codigo_portal_unico_ope).
 */
export function montarSnapshotOpe(
  ope: OPE,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotOpeData {
  if (!ope.codigo_portal_unico_ope) {
    throw new Error(
      `OPE ${ope.suid_ope} sem codigo_portal_unico_ope — snapshot não pode ser gerado`,
    )
  }

  return {
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    suid_ope: ope.suid_ope ?? null,
    codigo_ope: ope.codigo_portal_unico_ope,
    versao_ope: ope.versao_ope ?? null,
    situacao_ope: ope.situacao_ope ?? null,
    nome_ope: ope.nome_ope ?? null,
    cnpj_raiz_empresa: ope.cnpj_raiz_empresa_ope ?? null,
    pais_ope: ope.pais_ope ?? null,
    estado_ope: ope.estado_ope ?? null,
    cidade_ope: ope.cidade_ope ?? null,
    endereco_ope: ope.endereco_ope ?? null,
    zip_ope: ope.zip_ope ?? null,
    tin_ope: ope.tin_ope ?? null,
    email_ope: ope.email_ope ?? null,
    motivo_congelamento: motivo,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// NCM (catálogo global)
// ────────────────────────────────────────────────────────────────────────────

export interface SnapshotNcmData {
  id_organizacao: string
  id_workspace?: string | null
  id_pedido?: string
  codigo_ncm: string
  descricao_ncm: string
  ipi_ncm: number | null
  ii_ncm: number | null
  pis_ncm: number | null
  cofins_ncm: number | null
  motivo_congelamento: MotivoCongelamento
}

/**
 * Converte um NCM do Cadastros em dados para PedidoSnapshotNcm.
 *
 * NCM é catálogo global no Cadastros (sem id_organizacao). O snapshot vive
 * no banco do Pedido com escopo de organização/workspace/pedido.
 *
 * Lança erro se descricao_ncm vier vazio — contrato bilateral exige.
 */
export function montarSnapshotNcm(
  ncm: NCM,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotNcmData {
  if (!ncm.descricao_ncm) {
    throw new Error(
      `NCM ${ncm.codigo_ncm} sem descricao_ncm — snapshot não pode ser gerado`,
    )
  }

  return {
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    codigo_ncm: ncm.codigo_ncm,
    descricao_ncm: ncm.descricao_ncm,
    ipi_ncm: ncm.ipi_ncm ?? null,
    ii_ncm: ncm.ii_ncm ?? null,
    pis_ncm: ncm.pis_ncm ?? null,
    cofins_ncm: ncm.cofins_ncm ?? null,
    motivo_congelamento: motivo,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Moeda (catálogo global)
// ────────────────────────────────────────────────────────────────────────────

export interface SnapshotMoedaData {
  id_organizacao: string
  id_workspace?: string | null
  id_pedido?: string
  codigo_moeda: string
  nome_moeda: string
  simbolo_moeda: string
  motivo_congelamento: MotivoCongelamento
}

/**
 * Converte uma Moeda do Cadastros em dados para PedidoSnapshotMoeda.
 *
 * Moeda é catálogo global no Cadastros (sem id_organizacao). O snapshot vive
 * no banco do Pedido com escopo de organização/workspace/pedido.
 */
export function montarSnapshotMoeda(
  moeda: Moeda,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotMoedaData {
  if (!moeda.codigo_moeda || !moeda.nome_moeda || !moeda.simbolo_moeda) {
    throw new Error(
      `Moeda ${moeda.codigo_moeda ?? '<sem-codigo>'} incompleta — snapshot não pode ser gerado`,
    )
  }

  return {
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    codigo_moeda: moeda.codigo_moeda,
    nome_moeda: moeda.nome_moeda,
    simbolo_moeda: moeda.simbolo_moeda,
    motivo_congelamento: motivo,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Unidade (catálogo global)
// ────────────────────────────────────────────────────────────────────────────

export interface SnapshotUnidadeData {
  id_organizacao: string
  id_workspace?: string | null
  id_pedido?: string
  codigo_unidade: string
  nome_unidade: string
  tipo_unidade: string
  motivo_congelamento: MotivoCongelamento
}

/**
 * Converte uma Unidade do Cadastros em dados para PedidoSnapshotUnidade.
 *
 * Unidade é catálogo global no Cadastros (sem id_organizacao). O snapshot vive
 * no banco do Pedido com escopo de organização/workspace/pedido.
 */
export function montarSnapshotUnidade(
  unidade: Unidade,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotUnidadeData {
  if (!unidade.codigo_unidade || !unidade.nome_unidade || !unidade.tipo_unidade) {
    throw new Error(
      `Unidade ${unidade.codigo_unidade ?? '<sem-codigo>'} incompleta — snapshot não pode ser gerado`,
    )
  }

  return {
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    codigo_unidade: unidade.codigo_unidade,
    nome_unidade: unidade.nome_unidade,
    tipo_unidade: unidade.tipo_unidade,
    motivo_congelamento: motivo,
  }
}

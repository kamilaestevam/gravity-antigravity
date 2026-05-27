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
  Fornecedor,
  IdentidadeComex,
  Moeda,
  NCM,
  OPE,
  Unidade,
} from '../../../../cadastros/shared/schemas/index.js'
import { ehEmpresaCadastros } from '../../../../cadastros/shared/schemas/identidade-comex.schema.js'

// ────────────────────────────────────────────────────────────────────────────
// Empresa / Fornecedor → PedidoSnapshotEmpresa
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
  documento_principal: string | null
  tipo_documento: 'CNPJ' | 'TIN' | null
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

interface CamposIdentidadeSnapshot {
  suid: string
  nome: string
  pais: string
  cnpj: string | null
  tin: string | null
  cidade: string | null
  uf: string | null
  cep: string | null
  endereco: string | null
  email: string | null
  whatsapp: string | null
  rotuloEntidade: 'Empresa' | 'Fornecedor'
}

function extrairCamposIdentidade(identidade: IdentidadeComex): CamposIdentidadeSnapshot {
  if (ehEmpresaCadastros(identidade)) {
    return {
      suid: identidade.id_empresa,
      nome: identidade.nome_empresa,
      pais: identidade.pais_empresa,
      cnpj: identidade.cnpj_empresa,
      tin: identidade.tin_empresa,
      cidade: identidade.cidade_empresa,
      uf: identidade.estado_provincia_empresa,
      cep: identidade.cep_zipcode_empresa,
      endereco: identidade.endereco_empresa,
      email: identidade.email_principal_empresa,
      whatsapp: identidade.whatsapp_principal_empresa,
      rotuloEntidade: 'Empresa',
    }
  }
  return {
    suid: identidade.id_fornecedor,
    nome: identidade.nome_fornecedor,
    pais: identidade.pais_fornecedor,
    cnpj: identidade.cnpj_fornecedor,
    tin: identidade.tin_fornecedor,
    cidade: identidade.cidade_fornecedor,
    uf: identidade.estado_provincia_fornecedor,
    cep: identidade.cep_zipcode_fornecedor,
    endereco: identidade.endereco_fornecedor,
    email: identidade.email_principal_fornecedor,
    whatsapp: identidade.whatsapp_principal_fornecedor,
    rotuloEntidade: 'Fornecedor',
  }
}

/**
 * Monta PedidoSnapshotEmpresa a partir de Empresa (1:1 org) ou Fornecedor (parceiro).
 * Saída usa nomes legados do banco do Pedido (`suid_empresa`, `nome_empresa`).
 */
export function montarSnapshotIdentidadeComex(
  identidade: IdentidadeComex,
  papel: PapelEmpresa,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotEmpresaData {
  const campos = extrairCamposIdentidade(identidade)
  const suidEmpresa = campos.suid?.trim()
  const nomeEmpresa = campos.nome?.trim()
  if (!suidEmpresa || !nomeEmpresa) {
    throw new Error(
      `${campos.rotuloEntidade} incompleto para snapshot (suid=${campos.suid ?? '<ausente>'}, nome=${campos.nome ?? '<ausente>'})`,
    )
  }

  const ehBr = campos.pais === 'BR'
  const documentoBruto = ehBr ? campos.cnpj : campos.tin
  const documento = documentoBruto && documentoBruto.trim() ? documentoBruto.trim() : null

  return {
    id_organizacao: idOrganizacao,
    id_workspace: idWorkspace,
    papel,
    suid_empresa: suidEmpresa,
    nome_empresa: nomeEmpresa,
    documento_principal: documento,
    tipo_documento: documento ? (ehBr ? 'CNPJ' : 'TIN') : null,
    cnpj_raiz:
      ehBr && campos.cnpj
        ? campos.cnpj.replace(/\D/g, '').slice(0, 8)
        : null,
    endereco_cidade: campos.cidade ?? null,
    endereco_uf: campos.uf ?? null,
    endereco_cep: campos.cep ?? null,
    endereco_pais: campos.pais,
    endereco_logradouro: campos.endereco ?? null,
    contato_email: campos.email ?? null,
    contato_whatsapp: campos.whatsapp ?? null,
    motivo_congelamento: motivo,
  }
}

/** @deprecated Use `montarSnapshotIdentidadeComex` — mantido para imports legados. */
export function montarSnapshotEmpresa(
  identidade: IdentidadeComex,
  papel: PapelEmpresa,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotEmpresaData {
  return montarSnapshotIdentidadeComex(identidade, papel, idOrganizacao, idWorkspace, motivo)
}

export function montarSnapshotDeEmpresa(
  empresa: Empresa,
  papel: PapelEmpresa,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotEmpresaData {
  return montarSnapshotIdentidadeComex(empresa, papel, idOrganizacao, idWorkspace, motivo)
}

export function montarSnapshotDeFornecedor(
  fornecedor: Fornecedor,
  papel: PapelEmpresa,
  idOrganizacao: string,
  idWorkspace: string | null = null,
  motivo: MotivoCongelamento = 'emissao',
): SnapshotEmpresaData {
  return montarSnapshotIdentidadeComex(fornecedor, papel, idOrganizacao, idWorkspace, motivo)
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

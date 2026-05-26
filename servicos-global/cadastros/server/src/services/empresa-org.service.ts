import type { Empresa as PrismaEmpresa, Fornecedor as PrismaFornecedor } from '../../../generated/index.js'
import { prisma } from '../lib/prisma.js'

async function buscarSuidOrganizacaoNoConfigurador(idOrganizacao: string): Promise<string | null> {
  const baseUrl = process.env.CONFIGURADOR_BASE_URL ?? 'http://localhost:8005'
  const internalKey = process.env.CHAVE_INTERNA_SERVICO
  if (!internalKey) return null

  try {
    const res = await fetch(
      `${baseUrl.replace(/\/$/, '')}/api/v1/internal/organizacoes/${encodeURIComponent(idOrganizacao)}`,
      {
        headers: {
          'x-chave-interna-servico': internalKey,
          'x-internal-key': internalKey,
        },
        signal: AbortSignal.timeout(5_000),
      },
    )
    if (!res.ok) return null
    const org = (await res.json()) as { suid_empresa_organizacao?: string | null }
    return org.suid_empresa_organizacao ?? null
  } catch {
    return null
  }
}

/** Converte Fornecedor → shape Empresa para reutilizar empresaParaFornecedorCompatDto. */
function fornecedorComoEmpresa(f: PrismaFornecedor): PrismaEmpresa {
  return {
    id_empresa: f.id_fornecedor,
    id_organizacao_empresa: f.id_organizacao_cadastro_fornecedor,
    nome_empresa: f.nome_fornecedor,
    cnpj_empresa: f.cnpj_fornecedor,
    tin_empresa: f.tin_fornecedor,
    pais_empresa: f.pais_fornecedor,
    estado_provincia_empresa: f.estado_provincia_fornecedor,
    cidade_empresa: f.cidade_fornecedor,
    endereco_empresa: f.endereco_fornecedor,
    cep_zipcode_empresa: f.cep_zipcode_fornecedor,
    email_principal_empresa: f.email_principal_fornecedor,
    telefone_principal_empresa: f.telefone_principal_fornecedor,
    whatsapp_principal_empresa: f.whatsapp_principal_fornecedor,
    pode_ser_importador_empresa: f.pode_ser_importador_fornecedor,
    pode_ser_exportador_empresa: f.pode_ser_exportador_fornecedor,
    pode_ser_fabricante_empresa: f.pode_ser_fabricante_fornecedor,
    pode_ser_agente_empresa: f.pode_ser_agente_fornecedor,
    pode_ser_despachante_empresa: f.pode_ser_despachante_fornecedor,
    pode_ser_armador_empresa: f.pode_ser_armador_fornecedor,
    pode_ser_cia_aerea_empresa: f.pode_ser_cia_aerea_fornecedor,
    pode_ser_transportadora_rodoviaria_nacional_empresa: f.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
    pode_ser_transportadora_rodoviaria_internacional_empresa: f.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
    pode_ser_armazem_alfandegado_empresa: f.pode_ser_armazem_alfandegado_fornecedor,
    pode_ser_armazem_nacional_empresa: f.pode_ser_armazem_nacional_fornecedor,
    pode_ser_banco_empresa: f.pode_ser_banco_fornecedor,
    pode_ser_seguradora_internacional_empresa: f.pode_ser_seguradora_internacional_fornecedor,
    pode_ser_seguradora_corretora_cambio_empresa: f.pode_ser_seguradora_corretora_cambio_fornecedor,
    ativo_empresa: f.ativo_fornecedor,
    criado_em_empresa: f.criado_em_fornecedor,
    atualizado_em_empresa: f.atualizado_em_fornecedor,
  }
}

/**
 * Empresa 1:1 da organização (importador/exportador da própria org).
 *
 * Ordem de resolução:
 * 1. Tabela `empresa` por id_organizacao_empresa (SSOT onboarding)
 * 2. SUID em Configurador.suid_empresa_organizacao → fornecedor ou empresa por id
 */
export async function obterEmpresaDaOrganizacao(idOrganizacao: string): Promise<PrismaEmpresa | null> {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id_organizacao_empresa: idOrganizacao },
    })
    if (empresa) return empresa
  } catch (err) {
    console.warn('[cadastros][empresa-org] falha ao ler tabela empresa', {
      id_organizacao: idOrganizacao,
      erro: err instanceof Error ? err.message : String(err),
    })
  }

  const suid = await buscarSuidOrganizacaoNoConfigurador(idOrganizacao)
  if (!suid) return null

  try {
    const fornecedor = await prisma.fornecedor.findFirst({
      where: {
        id_fornecedor: suid,
        id_organizacao_cadastro_fornecedor: idOrganizacao,
      },
    })
    if (fornecedor) return fornecedorComoEmpresa(fornecedor)
  } catch (err) {
    console.warn('[cadastros][empresa-org] falha ao resolver fornecedor por SUID', {
      id_organizacao: idOrganizacao,
      suid,
      erro: err instanceof Error ? err.message : String(err),
    })
  }

  try {
    const empresaPorSuid = await prisma.empresa.findFirst({
      where: { id_empresa: suid, id_organizacao_empresa: idOrganizacao },
    })
    if (empresaPorSuid) return empresaPorSuid
  } catch {
    /* fallback opcional */
  }

  return null
}

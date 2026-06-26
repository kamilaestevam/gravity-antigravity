/**
 * resolver-vinculo-smart-read-legado.ts
 * Resolve id_company (legado dati) para uma organização Gravity com Smart Read contratado.
 *
 * Prioridade:
 *   1. SMART_READ_DE_PARA_ORGANIZACAO (override operacional por org)
 *   2. configuracao_config_produto_gravity.id_company_smart_read_legado
 *   3. SMART_READ_ID_COMPANY_LEGADO_PADRAO (org com assinatura ATIVA/EM_TESTE)
 */

import { StatusAssinaturaProdutoGravity } from '../../../../configurador/generated/index.js'
import { AppError } from './appError.js'
import { prisma } from './prisma.js'
import { productConfigService } from '../services/produto-gravity-configuracao-service.js'

export const SLUG_PRODUTO_SMART_READ = 'smart-read'
export const CHAVE_CONFIG_ID_COMPANY_SMART_READ_LEGADO = 'id_company_smart_read_legado'

function mapaDeParaOrganizacaoEnv(): Record<string, string> {
  const bruto = process.env.SMART_READ_DE_PARA_ORGANIZACAO ?? '{}'
  try {
    return JSON.parse(bruto) as Record<string, string>
  } catch {
    throw new AppError('SMART_READ_DE_PARA_ORGANIZACAO inválido (JSON malformado)', 500, 'CONFIG_ERROR')
  }
}

export function idCompanySmartReadLegadoDeConfig(config: unknown): string | null {
  if (!config || typeof config !== 'object') return null
  const valor = (config as Record<string, unknown>)[CHAVE_CONFIG_ID_COMPANY_SMART_READ_LEGADO]
  return typeof valor === 'string' && valor.trim().length > 0 ? valor.trim() : null
}

/** Config JSON inicial gravado ao assinar Smart Read (usa company padrão do ambiente). */
export function configuracaoInicialSmartReadLegado(): Record<string, string> {
  const padrao = process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO?.trim()
  if (!padrao) return {}
  return { [CHAVE_CONFIG_ID_COMPANY_SMART_READ_LEGADO]: padrao }
}

export async function resolverVinculoSmartReadLegado(id_organizacao: string): Promise<string> {
  const produto = await prisma.produtoGravity.findFirst({
    where: { slug_produto_gravity: SLUG_PRODUTO_SMART_READ },
    select: { id_produto_gravity: true, status_produto_gravity: true },
  })
  if (!produto) {
    throw new AppError('Produto Smart Docs não encontrado no catálogo Gravity', 500, 'CONFIG_ERROR')
  }

  const assinatura = await prisma.produtoGravityAssinatura.findUnique({
    where: {
      id_organizacao_id_produto_gravity: {
        id_organizacao,
        id_produto_gravity: produto.id_produto_gravity,
      },
    },
    select: { status_assinatura_produto_gravity: true },
  })

  const assinaturaAtiva =
    assinatura?.status_assinatura_produto_gravity === StatusAssinaturaProdutoGravity.ATIVA ||
    assinatura?.status_assinatura_produto_gravity === StatusAssinaturaProdutoGravity.EM_TESTE

  if (!assinaturaAtiva) {
    throw new AppError(
      `Organização ${id_organizacao} não possui assinatura ativa do Smart Docs`,
      422,
      'PRODUTO_NAO_CONTRATADO',
    )
  }

  const mapa = mapaDeParaOrganizacaoEnv()
  const overrideMapa = mapa[id_organizacao]?.trim()
  if (overrideMapa) {
    return overrideMapa
  }

  const productConfig = await productConfigService.getConfig(id_organizacao, SLUG_PRODUTO_SMART_READ)
  const idCompanyConfig = idCompanySmartReadLegadoDeConfig(
    productConfig?.configuracao_config_produto_gravity,
  )
  if (idCompanyConfig) {
    return idCompanyConfig
  }

  const padrao = process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO?.trim()
  if (padrao) {
    return padrao
  }

  throw new AppError(
    `Organização ${id_organizacao} sem vínculo com o Smart Docs legado (defina SMART_READ_ID_COMPANY_LEGADO_PADRAO ou id_company_smart_read_legado na configuração)`,
    422,
    'ORGANIZACAO_SEM_VINCULO',
  )
}

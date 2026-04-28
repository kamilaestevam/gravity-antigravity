// server/services/productConfigService.ts
// Gestão do PRODUCT_CONFIG por tenant — persistência no banco

import { prisma } from '../lib/prisma.js'

// Chave composta auto-gerada pelo Prisma para o @@unique de ConfiguracaoProduto
const COMPOUND_KEY = 'id_organizacao_config_produto_gravity_chave_produto_config_produto_gravity'

export const productConfigService = {
  /**
   * Busca a configuração de um produto para um tenant específico
   */
  async getConfig(id_organizacao: string, productKey: string) {
    return prisma.produtoGravityConfiguracao.findUnique({
      where: {
        [COMPOUND_KEY]: {
          id_organizacao_config_produto_gravity: id_organizacao,
          chave_produto_config_produto_gravity: productKey,
        },
      } as never,
    })
  },

  /**
   * Cria ou atualiza a configuração de um produto para um tenant
   * Merges o objeto de config existente com o novo
   */
  async upsertConfig(
    id_organizacao: string,
    productKey: string,
    config: Record<string, unknown>,
    isActive = true
  ) {
    return prisma.produtoGravityConfiguracao.upsert({
      where: {
        [COMPOUND_KEY]: {
          id_organizacao_config_produto_gravity: id_organizacao,
          chave_produto_config_produto_gravity: productKey,
        },
      } as never,
      create: {
        id_organizacao_config_produto_gravity: id_organizacao,
        chave_produto_config_produto_gravity: productKey,
        configuracao_config_produto_gravity: config as object,
        ativo_config_produto_gravity: isActive,
      },
      update: {
        configuracao_config_produto_gravity: config as object,
        ativo_config_produto_gravity: isActive,
      },
    })
  },

  /**
   * Lista todos os produtos habilitados para um tenant
   */
  async listActiveProducts(id_organizacao: string) {
    return prisma.produtoGravityConfiguracao.findMany({
      where: {
        id_organizacao_config_produto_gravity: id_organizacao,
        ativo_config_produto_gravity: true,
      },
      select: {
        chave_produto_config_produto_gravity: true,
        configuracao_config_produto_gravity: true,
        data_atualizacao_config_produto_gravity: true,
      },
    })
  },

  /**
   * Desabilita um produto para um tenant (sem deletar a config)
   */
  async disableProduct(id_organizacao: string, productKey: string) {
    return prisma.produtoGravityConfiguracao.updateMany({
      where: {
        id_organizacao_config_produto_gravity: id_organizacao,
        chave_produto_config_produto_gravity: productKey,
      },
      data: { ativo_config_produto_gravity: false },
    })
  },
}

// server/services/productConfigService.ts
// Gestão do PRODUCT_CONFIG por tenant — persistência no banco

import { prisma } from '../lib/prisma.js'

export const productConfigService = {
  /**
   * Busca a configuração de um produto para um tenant específico
   */
  async getConfig(tenantId: string, productKey: string) {
    return prisma.productConfig.findUnique({
      where: {
        tenant_id_product_key: { tenant_id: tenantId, product_key: productKey },
      },
    })
  },

  /**
   * Cria ou atualiza a configuração de um produto para um tenant
   * Merges o objeto de config existente com o novo
   */
  async upsertConfig(
    tenantId: string,
    productKey: string,
    config: Record<string, unknown>,
    isActive = true
  ) {
    return prisma.productConfig.upsert({
      where: {
        tenant_id_product_key: { tenant_id: tenantId, product_key: productKey },
      },
      create: {
        tenant_id: tenantId,
        product_key: productKey,
        config,
        is_active: isActive,
      },
      update: { config, is_active: isActive },
    })
  },

  /**
   * Lista todos os produtos habilitados para um tenant
   */
  async listActiveProducts(tenantId: string) {
    return prisma.productConfig.findMany({
      where: { tenant_id: tenantId, is_active: true },
      select: { product_key: true, config: true, updated_at: true },
    })
  },

  /**
   * Desabilita um produto para um tenant (sem deletar a config)
   */
  async disableProduct(tenantId: string, productKey: string) {
    return prisma.productConfig.updateMany({
      where: { tenant_id: tenantId, product_key: productKey },
      data: { is_active: false },
    })
  },
}

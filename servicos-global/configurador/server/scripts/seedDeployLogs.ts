/**
 * server/scripts/seedDeployLogs.ts
 * Popula alguns deploys de exemplo no Deploy para smoke test visual.
 * Uso: npx tsx server/scripts/seedDeployLogs.ts
 * Deletar ou limpar depois via tela admin.
 */

import 'dotenv/config'
import { deployLogService } from '../services/deployLogService.js'
import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'

const log = logger.child({ module: 'seed-deploys' })

const SAMPLES = [
  {
    area: 'configurador',
    version: 'v1.4.0',
    description: 'Detetive de Tela: Produtos Gravity — 18 fixes aplicados (logger, Zod, paginação, soft-delete, 5 status, Trash icon, extractCatchError)',
    environment: 'PRODUCAO' as const,
    status: 'SUCESSO' as const,
    deployed_by: 'Daniel Martins Mendes',
  },
  {
    area: 'configurador',
    version: 'v1.5.0',
    description: 'Detetive de Tela: Financeiro Global — abstração BillingProvider (Conta Azul oficial + skeletons Itaú/Santander), NfseProvider, refactor completo da tela, graceful degradation',
    environment: 'PRODUCAO' as const,
    status: 'SUCESSO' as const,
    deployed_by: 'Daniel Martins Mendes',
  },
  {
    area: 'nucleo-global',
    version: 'v2.1.3',
    description: 'Fix de tipos em TabelaGlobal para aceitar generics mais flexíveis no exportHelper',
    environment: 'TODOS' as const,
    status: 'SUCESSO' as const,
    deployed_by: 'Daniel Martins Mendes',
  },
  {
    area: 'pedido',
    version: 'v0.9.2',
    description: 'Rota GET /api/v1/pedidos/:id/itens (corrige chevron de expandir que estava 404) + refactor colunasPai/colunasFilho',
    environment: 'HOMOLOGACAO' as const,
    status: 'SUCESSO' as const,
    deployed_by: 'Daniel Martins Mendes',
  },
  {
    area: 'devops',
    version: 'migration-20260414',
    description: 'Migration Prisma: add gabi_quota_mensal + deleted_at soft-delete no ProdutoGravity',
    environment: 'PRODUCAO' as const,
    status: 'SUCESSO' as const,
    deployed_by: 'Daniel Martins Mendes',
  },
] as const

async function main(): Promise<void> {
  log.info('seeding deploy logs for smoke test')

  for (const sample of SAMPLES) {
    const created = await deployLogService.create({ ...sample })
    log.info('deploy log created', {
      deploy_number: created.deploy_number,
      area: created.area,
      version: created.version,
    })
  }

  const { pagination } = await deployLogService.list({ limit: 1 })
  log.info('seed complete', { total: pagination.total })
}

main()
  .catch((err: unknown) => {
    log.error('seed failed', { error: err instanceof Error ? err.message : String(err) })
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })

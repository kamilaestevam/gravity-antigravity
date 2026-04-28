/**
 * Setup compartilhado para testes funcionais.
 *
 * - Carrega .env.local da raiz (CADASTROS_DATABASE_URL aponta pra
 *   `gravity-cadastros-teste` no Railway).
 * - Define INTERNAL_SERVICE_KEY de teste no processo (não bagunça produção).
 * - Expõe `prisma` real e helpers de cleanup por prefixo SUID/codigo.
 */
import { config as carregarEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
carregarEnv({ path: resolve(__dir, '../../../../../.env.local') })
carregarEnv({ path: resolve(__dir, '../../.env') })

import { CHAVE_INTERNA_TESTE, PREFIXO_SUID_TESTE } from '../helpers/app-de-teste.js'
import { PrismaClient } from '../../generated/index.js'

process.env.INTERNAL_SERVICE_KEY = CHAVE_INTERNA_TESTE

export const prismaTeste = new PrismaClient({ log: ['error'] })

export async function limparDadosDeTeste(): Promise<void> {
  await prismaTeste.empresa.deleteMany({ where: { suid_empresa: { startsWith: PREFIXO_SUID_TESTE } } })
  await prismaTeste.moeda.deleteMany({ where: { codigo_moeda: { startsWith: 'ZZ' } } })
  await prismaTeste.unidade.deleteMany({ where: { codigo_unidade: { startsWith: 'ZZ' } } })
  await prismaTeste.ncm.deleteMany({ where: { codigo_ncm: { startsWith: '99' } } })
}

export { CHAVE_INTERNA_TESTE, PREFIXO_SUID_TESTE }

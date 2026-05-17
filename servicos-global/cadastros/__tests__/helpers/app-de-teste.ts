/**
 * Helper para construir um app Express isolado para testes funcionais.
 *
 * Não importa o `bootstrap` real do `server/src/index.ts` (evita listen na
 * porta) — monta apenas Express + middlewares + routers + errorHandler.
 *
 * O caller injeta o PrismaClient via `setPrismaClient` antes de usar.
 */
import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { empresasRouter } from '../../server/src/routes/empresas.js'
import { adminEmpresasRouter } from '../../server/src/routes/admin-empresas.js'
import { moedasRouter } from '../../server/src/routes/moedas.js'
import { unidadesRouter } from '../../server/src/routes/unidades.js'
import { ncmRouter } from '../../server/src/routes/ncm.js'
import { opeRouter } from '../../server/src/routes/ope.js'
import { errorHandler } from '../../server/src/lib/app-error.js'

export function montarAppDeTeste(): Express {
  const app = express()
  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use('/api/v1/empresas', empresasRouter)
  app.use('/api/v1/admin/empresas', adminEmpresasRouter)
  app.use('/api/v1/cadastros/moedas', moedasRouter)
  app.use('/api/v1/cadastros/unidades', unidadesRouter)
  app.use('/api/v1/cadastros/ncm', ncmRouter)
  app.use('/api/v1/cadastros/operacoes-comex', opeRouter)
  app.use(errorHandler)
  return app
}

/**
 * Chave fake usada pelos testes — precisa bater com `CHAVE_INTERNA_SERVICO`
 * configurada via `process.env` no `beforeAll` do teste.
 */
export const CHAVE_INTERNA_TESTE = 'chave-interna-teste-cadastros'

/** Prefixo de SUID usado em todos os testes — facilita cleanup. */
export const PREFIXO_SUID_TESTE = 'TEST-'

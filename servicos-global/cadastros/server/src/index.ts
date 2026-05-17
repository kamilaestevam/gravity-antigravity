import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (INTERNAL_SERVICE_KEY etc.) vêm do .env.local da raiz
// __dir = cadastros/server/src/ → ../../../../ = raiz do monorepo
dotenv.config({ path: resolve(__dir, '../../../../.env.local') })
// Chaves específicas do serviço vêm do .env local
dotenv.config({ path: resolve(__dir, '../../.env') })

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { empresasRouter } from './routes/empresas.js'
import { moedasRouter } from './routes/moedas.js'
import { unidadesRouter } from './routes/unidades.js'
import { incotermsRouter } from './routes/incoterms.js'
import { ncmRouter } from './routes/ncm.js'
import { opeRouter } from './routes/ope.js'
import { paisesRouter } from './routes/paises.js'
import { adminNcmSyncRouter } from './routes/adminNcmSync.js'
import { adminCertificadosRouter } from './routes/adminCertificados.js'
import { adminEmpresasRouter } from './routes/admin-empresas.js'
import { exportadoresQuandoImportacaoRouter } from './routes/exportadores-quando-importacao.js'
import { importadoresQuandoExportacaoRouter } from './routes/importadores-quando-exportacao.js'
import { errorHandler } from './lib/app-error.js'
import { initNcmSync } from './initNcmSync.js'

const app = express()
// Porta 8031 — alinhada ao Vite proxy '/api/v1/cadastros' do configurador
// (8030 é do produto Pedido). Variável PORT pode sobrescrever.
const PORT = Number(process.env.PORT ?? 8031)

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '60mb' }))
app.use(express.urlencoded({ extended: false }))

// Correlation ID universal
app.use((req, _res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
  req.headers['x-correlation-id'] = correlationId
  next()
})

app.use('/api/v1/empresas', empresasRouter)
app.use('/api/v1/cadastros/moedas', moedasRouter)
app.use('/api/v1/cadastros/unidades', unidadesRouter)
app.use('/api/v1/cadastros/incoterms', incotermsRouter)
app.use('/api/v1/cadastros/ncm', ncmRouter)
app.use('/api/v1/cadastros/operacoes-comex', opeRouter)
app.use('/api/v1/cadastros/paises', paisesRouter)
app.use('/api/v1/cadastros/exportadores-quando-importacao', exportadoresQuandoImportacaoRouter)
app.use('/api/v1/cadastros/importadores-quando-exportacao', importadoresQuandoExportacaoRouter)

// Admin NCM Sync — chamado pelo configurador via S2S (x-internal-key).
// Endpoints: /, /historico, /sincronizar, /agendamento, /agendamento/executar
app.use('/api/v1/cadastros/admin/ncm-sync', adminNcmSyncRouter)

// Admin Certificados Digitais Siscomex — upload, gestão e validação de e-CNPJ.
// Usado para autenticação mTLS com Portal Único (TTCE/alíquotas).
app.use('/api/v1/cadastros/admin/certificados', adminCertificadosRouter)

// Admin Empresas — listagem CROSS-ORGANIZAÇÃO (S2S only, audit logged
// pelo proxy do Configurador). Ver routes/admin-empresas.ts (LINT-EXCEPTION).
app.use('/api/v1/admin/empresas', adminEmpresasRouter)

app.get('/health', (_req, res) => {
  res.status(200).json({
    service: '@tenant/cadastros',
    status: 'ok',
    fase: 'fase_1_funcional',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
  })
})

// Handler global de erros (Zod, AppError, fallback). Sempre por último.
app.use(errorHandler)

async function bootstrap(): Promise<void> {
  const databaseUrl = process.env.CADASTROS_DATABASE_URL
  if (!databaseUrl) {
    console.warn('[cadastros] CADASTROS_DATABASE_URL não definida — esperado durante Fase 1 (banco ainda não foi criado)')
  }

  const server = app.listen(PORT, () => {
    console.log(`[cadastros] Serviço rodando na porta ${PORT}`)
    console.log(`[cadastros] Health check: http://localhost:${PORT}/health`)
  })
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[cadastros] Porta ${PORT} já em uso. Execute: npm run dev:reset`)
      process.exit(1)
    }
    throw err
  })

  // Inicializa cron NCM Sync (recovery de jobs órfãos + reagendamento)
  // Não-fatal: se a tabela ainda não existir, apenas loga warning.
  await initNcmSync().catch((e: unknown) =>
    console.warn('[cadastros] initNcmSync falhou (não-fatal):', (e as Error).message))

  const shutdown = (): void => {
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 2000)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

bootstrap().catch((err) => {
  console.error('[cadastros] Falha ao iniciar:', err)
  process.exit(1)
})

export { app }

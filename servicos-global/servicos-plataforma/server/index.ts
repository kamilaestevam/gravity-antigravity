/**
 * servicos-global/tenant/server/index.ts
 * Super-Servidor de Tenant — porta 3001
 *
 * Único processo Node.js que serve todos os serviços de tenant.
 * Cada serviço exporta apenas seu router — este arquivo os monta.
 *
 * Serviços:
 *   /api/v1/atividades              — CRM, tarefas, pipelines
 *   /api/v1/atividades/:id/cronometro — timer de sessões
 *   /api/v1/cronometros             — sessões individuais de cronômetro
 *   /api/v1/threads-email           — inbox unificada (Resend)
 *   /api/v1/gabi                    — assistente IA (Gemini)
 *   /api/v1/dashboards              — widgets e KPIs consolidados
 *   /api/v1/relatorios              — relatórios customizados
 *   /api/v1/historico               — audit trail imutável
 *   /api/v1/notificacoes            — alertas multi-canal
 *   /api/v1/agendas                 — calendário por usuário
 *   /api/v1/preferencias            — preferências do usuário
 *   /api/v1/whatsapp                — Meta Cloud API
 *   /health                 — health check geral
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (GEMINI_API_KEY, INTERNAL_SERVICE_KEY) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../.env.local') })
// Chaves específicas do serviço vêm do .env local
dotenv.config({ path: resolve(__dir, '.env') })
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { correlationMiddleware }       from '@plataforma/middleware/correlation.js'
import { authMiddleware }              from '@plataforma/middleware/auth.js'
import { withInternalKeyValidation }   from '@plataforma/middleware/withInternalKeyValidation.js'
import { errorHandler }                from '@plataforma/middleware/errorHandler.js'
import { prisma }                      from './lib/prisma.js'

// ── Routers dos serviços ──────────────────────────────────────────────────────
import { atividadesServiceRouter }  from '@plataforma/atividades/server/routes.js'
import { cronometroServiceRouter }  from '@plataforma/cronometro/server/routes.js'
import { emailServiceRouter }       from '@plataforma/email/server/routes.js'
import { gabiServiceRouter }        from '@plataforma/gabi/server/routes.js'
import { dashboardServiceRouter }   from '@plataforma/dashboard/server/routes.js'
import { relatoriosServiceRouter }  from '@plataforma/relatorios/server/routes.js'
import { historicoServiceRouter }   from '@plataforma/historico-global/server/routes.js'
import { notificacoesServiceRouter } from '@plataforma/notificacoes/server/routes.js'
import { agendamentoServiceRouter } from '@plataforma/agendamento/server/routes.js'
import { preferenciasServiceRouter } from '@plataforma/preferencias-usuario/server/routes.js'
import { whatsappServiceRouter }    from '@plataforma/whatsapp/server/routes.js'
import { ncmSyncServiceRouter }     from '@plataforma/ncm-sync/server/routes.js'

// ── Inicializações assíncronas ────────────────────────────────────────────────
import { initHistorico }     from '@plataforma/historico-global/server/init.js'
import { initNotificacoes }  from '@plataforma/notificacoes/server/init.js'
import { initNcmSync }       from '@plataforma/ncm-sync/server/init.js'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

// ── 1. Security Headers ───────────────────────────────────────────────────────
app.use(helmet())

// ── 2. CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: true,
}))

// ── 2a. Raw body para webhook Resend (deve vir ANTES do express.json()) ───────
app.use('/api/v1/envios-email/webhook-provedor', express.raw({ type: 'application/json' }))

// ── 3. Body Parser ────────────────────────────────────────────────────────────
app.use(express.json())

// ── 4. Correlation ID ─────────────────────────────────────────────────────────
app.use(correlationMiddleware)

// ── 5. Health Check — sem autenticação ───────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      service: 'tenant-server',
      port: PORT,
      services: [
        'atividades', 'cronometro', 'email', 'gabi',
        'dashboard', 'relatorios', 'historico', 'notificacoes',
        'agendamento', 'preferencias', 'whatsapp', 'ncm-sync',
      ],
    })
  } catch {
    res.status(503).json({ status: 'down', service: 'tenant-server' })
  }
})

// ── 6. Auth — extrai tenant_id e user_id dos headers ─────────────────────────
app.use(authMiddleware)

// ── 7. S2S — valida x-internal-key em toda chamada inter-serviço ─────────────
app.use(withInternalKeyValidation)

// ── 8. Rotas de negócio ───────────────────────────────────────────────────────
app.use(atividadesServiceRouter)
app.use(cronometroServiceRouter)
app.use(emailServiceRouter)
app.use(gabiServiceRouter)
app.use(dashboardServiceRouter)
app.use(relatoriosServiceRouter)
app.use(historicoServiceRouter)
app.use(notificacoesServiceRouter)
app.use(agendamentoServiceRouter)
app.use(preferenciasServiceRouter)
app.use(whatsappServiceRouter)
app.use(ncmSyncServiceRouter)

// ── 9. Error Handler — sempre o último ───────────────────────────────────────
app.use(errorHandler)

// ── Inicialização ─────────────────────────────────────────────────────────────
async function bootstrap() {
  // Serviços com workers/crons — falha não impede o servidor de responder HTTP
  await initHistorico().catch((e: unknown) =>
    console.warn('[tenant-server] initHistorico falhou (não-fatal):', (e as Error).message))

  await initNotificacoes().catch((e: unknown) =>
    console.warn('[tenant-server] initNotificacoes falhou (não-fatal):', (e as Error).message))

  await initNcmSync().catch((e: unknown) =>
    console.warn('[tenant-server] initNcmSync falhou (não-fatal):', (e as Error).message))

  app.listen(PORT, () => {
    console.log(`[tenant-server] rodando na porta ${PORT}`)
    console.log(`[tenant-server] serviços: atividades, cronometro, email, gabi, dashboard,`)
    console.log(`[tenant-server]           relatorios, historico, notificacoes, agendamento,`)
    console.log(`[tenant-server]           preferencias, whatsapp, ncm-sync`)
  })
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('[tenant-server] Falha ao iniciar:', err)
    process.exit(1)
  })
}

export { app }

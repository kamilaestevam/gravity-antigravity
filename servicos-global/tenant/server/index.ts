/**
 * servicos-global/tenant/server/index.ts
 * Super-Servidor de Tenant — porta 3001
 *
 * Único processo Node.js que serve todos os serviços de tenant.
 * Cada serviço exporta apenas seu router — este arquivo os monta.
 *
 * Serviços:
 *   /api/v1/atividades      — CRM, tarefas, pipelines
 *   /api/v1/cronometro      — timer de sessões (via /api/v1/timers)
 *   /api/v1/email           — inbox unificada (Resend)
 *   /api/v1/gabi            — assistente IA (Gemini)
 *   /api/v1/dashboard       — widgets e KPIs consolidados
 *   /api/v1/relatorios      — relatórios customizados
 *   /api/v1/historico       — audit trail imutável
 *   /api/v1/notificacoes    — alertas multi-canal
 *   /api/v1/agendamento     — calendário por usuário
 *   /api/v1/preferencias    — preferências do usuário
 *   /api/v1/whatsapp        — Meta Cloud API
 *   /health                 — health check geral
 */

import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { correlationMiddleware }       from '@tenant/middleware/correlation.js'
import { authMiddleware }              from '@tenant/middleware/auth.js'
import { withInternalKeyValidation }   from '@tenant/middleware/withInternalKeyValidation.js'
import { errorHandler }                from '@tenant/middleware/errorHandler.js'
import { prisma }                      from './lib/prisma.js'

// ── Routers dos serviços ──────────────────────────────────────────────────────
import { atividadesServiceRouter }  from '@tenant/atividades/server/routes.js'
import { cronometroServiceRouter }  from '@tenant/cronometro/server/routes.js'
import { emailServiceRouter }       from '@tenant/email/server/routes.js'
import { gabiServiceRouter }        from '@tenant/gabi/server/routes.js'
import { dashboardServiceRouter }   from '@tenant/dashboard/server/routes.js'
import { relatoriosServiceRouter }  from '@tenant/relatorios/server/routes.js'
import { historicoServiceRouter }   from '@tenant/historico-global/server/routes.js'
import { notificacoesServiceRouter } from '@tenant/notificacoes/server/routes.js'
import { agendamentoServiceRouter } from '@tenant/agendamento/server/routes.js'
import { preferenciasServiceRouter } from '@tenant/preferencias-usuario/server/routes.js'
import { whatsappServiceRouter }    from '@tenant/whatsapp/server/routes.js'

// ── Inicializações assíncronas ────────────────────────────────────────────────
import { initHistorico }     from '@tenant/historico-global/server/init.js'
import { initNotificacoes }  from '@tenant/notificacoes/server/init.js'

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
app.use('/api/v1/email/webhook', express.raw({ type: 'application/json' }))

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
        'agendamento', 'preferencias', 'whatsapp',
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

// ── 9. Error Handler — sempre o último ───────────────────────────────────────
app.use(errorHandler)

// ── Inicialização ─────────────────────────────────────────────────────────────
async function bootstrap() {
  await initHistorico()
  await initNotificacoes()

  app.listen(PORT, () => {
    console.log(`[tenant-server] rodando na porta ${PORT}`)
    console.log(`[tenant-server] serviços: atividades, cronometro, email, gabi, dashboard,`)
    console.log(`[tenant-server]           relatorios, historico, notificacoes, agendamento,`)
    console.log(`[tenant-server]           preferencias, whatsapp`)
  })
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('[tenant-server] Falha ao iniciar:', err)
    process.exit(1)
  })
}

export { app }

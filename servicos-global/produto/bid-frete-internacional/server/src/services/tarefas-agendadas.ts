/**
 * tarefas-agendadas.ts — Jobs automáticos do BID Frete Internacional
 * Executados periodicamente (a cada 5 minutos) para:
 * 1. Expirar cotações vencidas
 * 2. Alertar sobre cotações próximas ao vencimento
 * 3. Detectar fornecedores sem resposta
 *
 * SEGURANÇA: Cron jobs operam cross-tenant por natureza (varrem todos os tenants).
 * Cada operação de escrita inclui id_organizacao explícito no WHERE para evitar
 * que um bug altere dados de tenant incorreto. Leituras selecionam id_organizacao
 * para rastreabilidade e notificações por tenant.
 */

import { PrismaClient } from '../generated/client/index.js'
import { withTenantIsolation } from '../middleware/isolamento-tenant.js'
import { atividadesIntegration, notificacoesIntegration } from './integracoes-tenant.js'

// Prisma global — usado APENAS para leituras cross-tenant nos cron jobs.
// Escrita SEMPRE via withTenantIsolation ou com id_organizacao explícito no WHERE.
const cronPrisma = new PrismaClient()

/**
 * Job 1: Expirar cotações que passaram da data limite
 * Segurança: update inclui id_organizacao no WHERE para impedir cross-tenant write
 */
async function expirarCotacoesVencidas() {
  const agora = new Date()

  // Leitura cross-tenant: buscar todas as cotações vencidas (necessário para cron)
  const cotacoesVencidas = await cronPrisma.bidFreteInternacionalCotacao.findMany({
    where: {
      status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
      data_limite_resposta_cotacao_bid_frete_internacional: { lt: agora },
    } as any,
    select: {
      id_cotacao_bid_frete_internacional: true,
      numero_cotacao_bid_frete_internacional: true,
      id_organizacao: true,
      id_usuario: true,
    },
  } as any)

  for (const cotacao of cotacoesVencidas as any[]) {
    // Escrita isolada por tenant
    const tenantDb = withTenantIsolation(cronPrisma, cotacao.id_organizacao)

    await tenantDb.bidFreteInternacionalCotacao.update({
      where: { id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional },
      data: { status_cotacao_bid_frete_internacional: 'EXPIRADA' } as any,
    } as any)

    // Notificar o criador
    notificacoesIntegration.cotacaoExpirada(cotacao.id_organizacao, cotacao.id_usuario, {
      cotacao_numero: cotacao.numero_cotacao_bid_frete_internacional,
      id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
    })

    // Expirar Pedidos de Cotacao pendentes — isolado por tenant
    await tenantDb.bidFreteInternacionalPedidoCotacao.updateMany({
      where: {
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        status_pedido_cotacao_bid_frete_internacional: { in: ['PENDENTE', 'ENVIADO', 'VISUALIZADO'] },
      } as any,
      data: { status_pedido_cotacao_bid_frete_internacional: 'EXPIRADO' } as any,
    } as any)
  }

  if ((cotacoesVencidas as any[]).length > 0) {
    console.log(`[Cron] ${(cotacoesVencidas as any[]).length} cotações expiradas`)
  }
}

/**
 * Job 2: Alertar sobre cotações que vencem em 24h
 * Segurança: leitura cross-tenant com select mínimo, notificação por tenant
 */
async function alertarProximoVencimento() {
  const agora = new Date()
  const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000)

  const cotacoesVencendo = await cronPrisma.bidFreteInternacionalCotacao.findMany({
    where: {
      status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
      data_limite_resposta_cotacao_bid_frete_internacional: { gte: agora, lte: em24h },
    } as any,
    select: {
      id_cotacao_bid_frete_internacional: true,
      numero_cotacao_bid_frete_internacional: true,
      id_organizacao: true,
      id_usuario: true,
      data_limite_resposta_cotacao_bid_frete_internacional: true,
    },
  } as any)

  for (const cotacao of cotacoesVencendo as any[]) {
    atividadesIntegration.proximoVencimento(cotacao.id_organizacao, cotacao.id_usuario, {
      numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
      data_limite: cotacao.data_limite_resposta_cotacao_bid_frete_internacional.toISOString(),
    })
  }

  if ((cotacoesVencendo as any[]).length > 0) {
    console.log(`[Cron] ${(cotacoesVencendo as any[]).length} cotações próximas ao vencimento alertadas`)
  }
}

/**
 * Job 3: Detectar fornecedores sem resposta (cotações com >48h sem retorno)
 * Segurança: leitura cross-tenant com select mínimo, atividade criada por tenant
 */
async function detectarSemResposta() {
  const ha48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const requestsSemResposta = await cronPrisma.bidFreteInternacionalPedidoCotacao.findMany({
    where: {
      status_pedido_cotacao_bid_frete_internacional: 'ENVIADO',
      data_envio_pedido_cotacao_bid_frete_internacional: { lt: ha48h },
    } as any,
    include: {
      cotacao: {
        select: {
          id_cotacao_bid_frete_internacional: true,
          numero_cotacao_bid_frete_internacional: true,
          id_organizacao: true,
          id_usuario: true,
        },
      },
      fornecedor: {
        select: {
          nome_fornecedor_bid_frete_internacional: true,
          email_fornecedor_bid_frete_internacional: true,
        },
      },
    } as any,
  } as any)

  for (const req of requestsSemResposta as any[]) {
    atividadesIntegration.criarAtividade(req.cotacao.id_organizacao, {
      titulo: `Lembrar fornecedor ${req.fornecedor.nome_fornecedor_bid_frete_internacional}`,
      descricao: `O fornecedor ${req.fornecedor.nome_fornecedor_bid_frete_internacional} (${req.fornecedor.email_fornecedor_bid_frete_internacional}) não respondeu a cotação ${req.cotacao.numero_cotacao_bid_frete_internacional} em 48h.`,
      tipo: 'FOLLOW_UP',
      prioridade: 'ALTA',
      id_usuario: req.cotacao.id_usuario,
    })
  }

  if ((requestsSemResposta as any[]).length > 0) {
    console.log(`[Cron] ${(requestsSemResposta as any[]).length} fornecedores sem resposta detectados`)
  }
}

/**
 * Inicia todos os cron jobs
 * Intervalo: a cada 5 minutos
 */
let cronInterval: ReturnType<typeof setInterval> | null = null

export function startCronJobs() {
  console.log('[Cron] Jobs automáticos iniciados (intervalo: 5min)')

  // Executar imediatamente
  runAll()

  // Agendar a cada 5 minutos
  cronInterval = setInterval(runAll, 5 * 60 * 1000)
}

export function stopCronJobs() {
  if (cronInterval) {
    clearInterval(cronInterval)
    cronInterval = null
    console.log('[Cron] Jobs automáticos parados')
  }
}

async function runAll() {
  try {
    await expirarCotacoesVencidas()
    await alertarProximoVencimento()
    await detectarSemResposta()
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[Cron] Erro nos jobs:', errorMessage)
  }
}

export { expirarCotacoesVencidas, alertarProximoVencimento, detectarSemResposta }

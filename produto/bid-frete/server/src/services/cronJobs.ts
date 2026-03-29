/**
 * cronJobs.ts — Jobs automáticos do BID Frete
 * Executados periodicamente (a cada 5 minutos) para:
 * 1. Expirar cotações vencidas
 * 2. Alertar sobre cotações próximas ao vencimento
 * 3. Detectar fornecedores sem resposta
 * 4. Recalcular ratings globais
 */

import { PrismaClient } from '@prisma/client'
import { atividadesIntegration, notificacoesIntegration } from './tenantIntegrations.js'

const prisma = new PrismaClient()

/**
 * Job 1: Expirar cotações que passaram da data limite
 */
async function expirarCotacoesVencidas() {
  const agora = new Date()

  const cotacoesVencidas = await prisma.cotacao.findMany({
    where: {
      status: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
      data_limite_resposta: { lt: agora },
    } as any,
  } as any)

  for (const cotacao of cotacoesVencidas as any[]) {
    await prisma.cotacao.update({
      where: { id: cotacao.id },
      data: { status: 'EXPIRADA' } as any,
    } as any)

    // Notificar o criador
    notificacoesIntegration.cotacaoExpirada(cotacao.tenant_id, cotacao.user_id, {
      cotacao_numero: cotacao.numero,
      cotacao_id: cotacao.id,
    })

    // Expirar BidRequests pendentes
    await prisma.bidRequest.updateMany({
      where: {
        cotacao_id: cotacao.id,
        status: { in: ['PENDENTE', 'ENVIADO', 'VISUALIZADO'] },
      } as any,
      data: { status: 'EXPIRADO' } as any,
    } as any)
  }

  if ((cotacoesVencidas as any[]).length > 0) {
    console.log(`[Cron] ${(cotacoesVencidas as any[]).length} cotações expiradas`)
  }
}

/**
 * Job 2: Alertar sobre cotações que vencem em 24h
 */
async function alertarProximoVencimento() {
  const agora = new Date()
  const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000)

  const cotacoesVencendo = await prisma.cotacao.findMany({
    where: {
      status: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
      data_limite_resposta: { gte: agora, lte: em24h },
    } as any,
  } as any)

  for (const cotacao of cotacoesVencendo as any[]) {
    atividadesIntegration.proximoVencimento(cotacao.tenant_id, cotacao.user_id, {
      numero: cotacao.numero,
      data_limite: cotacao.data_limite_resposta.toISOString(),
    })
  }

  if ((cotacoesVencendo as any[]).length > 0) {
    console.log(`[Cron] ${(cotacoesVencendo as any[]).length} cotações próximas ao vencimento alertadas`)
  }
}

/**
 * Job 3: Detectar fornecedores sem resposta (cotações com >48h sem retorno)
 */
async function detectarSemResposta() {
  const ha48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const requestsSemResposta = await prisma.bidRequest.findMany({
    where: {
      status: 'ENVIADO',
      enviado_em: { lt: ha48h },
    } as any,
    include: {
      cotacao: { select: { id: true, numero: true, tenant_id: true, user_id: true } },
      fornecedor: { select: { nome: true, email: true } },
    } as any,
  } as any)

  for (const req of requestsSemResposta as any[]) {
    // Criar atividade para lembrar o fornecedor
    atividadesIntegration.criarAtividade(req.cotacao.tenant_id, {
      titulo: `Lembrar fornecedor ${req.fornecedor.nome}`,
      descricao: `O fornecedor ${req.fornecedor.nome} (${req.fornecedor.email}) não respondeu a cotação ${req.cotacao.numero} em 48h.`,
      tipo: 'FOLLOW_UP',
      prioridade: 'ALTA',
      user_id: req.cotacao.user_id,
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
  } catch (err: any) {
    console.error('[Cron] Erro nos jobs:', err.message)
  }
}

export { expirarCotacoesVencidas, alertarProximoVencimento, detectarSemResposta }

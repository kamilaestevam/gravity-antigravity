/**
 * gabi/server/routes/admin.ts
 * Endpoints administrativos da GABI (visao cross-organizacao).
 *
 * Diferente do /uso (que opera em UMA org via header x-id-organizacao),
 * /admin/uso-global itera TODAS as orgs ativas e agrega — mesma estrutura
 * de resposta do /uso, mas com soma cross-org.
 *
 * Premissa GABI: "sabe tudo do sistema, acessa o BANCO da org/workspace
 * que tenha autorizacao". Aqui o ator e gravity_admin -> autorizacao em
 * todas as orgs.
 *
 * Auth: requer x-chave-interna-servico (S2S) — esse endpoint e chamado
 * pelo Configurador, nunca direto do browser.
 *
 * Nao usa o SDK @gravity/resolver-organizacao porque GABI ainda nao foi
 * refatorada pra adotar o middleware. Replica o padrao do SDK localmente:
 * SET LOCAL search_path dentro de $transaction, com schema name validado
 * por regex pra prevenir SQL injection.
 */

import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { listarOrganizacoes } from '../services/configurador-client.js'

export const adminRouter = Router()

const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/

interface UsoOrgResultado {
  modelo:       string | null
  tokensInput:  number
  tokensOutput: number
  custoUsd:     number
  dataCriacao:  Date
}

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

/**
 * GET /api/v1/gabi/admin/uso-global
 * Resposta: mesmo formato do /api/v1/gabi/uso, agregado de todas orgs ATIVAS.
 *
 * Implementacao:
 *   1. Lista orgs ativas no Configurador (S2S)
 *   2. Promise.allSettled — query gabi_log_uso em cada schema da org via SET LOCAL search_path
 *   3. Agrega tudo
 *
 * Falha parcial (org X cai no meio) NAO derruba a resposta — log de erro
 * por org, retorna o que conseguiu somar.
 */
adminRouter.get('/api/v1/gabi/admin/uso-global', async (req, res, next) => {
  try {
    const { month } = querySchema.parse(req.query)

    const now = new Date()
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [year, mon] = targetMonth.split('-').map(Number)
    const startDate = new Date(year, mon - 1, 1)
    const endDate   = new Date(year, mon, 1)

    // 1. Listar organizacoes ativas
    const organizacoes = await listarOrganizacoes()

    // 2. Query cross-schema em paralelo. allSettled para tolerar falha parcial.
    const resultados = await Promise.allSettled(
      organizacoes.map(async (org) => {
        const schemaName = `tenant_${org.id_organizacao}`
        if (!SCHEMA_NAME_REGEX.test(schemaName)) {
          throw new Error(`Schema name invalido: ${schemaName}`)
        }
        return prisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
          const linhas = await tx.$queryRawUnsafe<UsoOrgResultado[]>(
            `SELECT
               modelo_gabi_log_uso          AS "modelo",
               tokens_input_gabi_log_uso    AS "tokensInput",
               tokens_output_gabi_log_uso   AS "tokensOutput",
               custo_usd_gabi_log_uso       AS "custoUsd",
               data_criacao_gabi_log_uso    AS "dataCriacao"
             FROM gabi_log_uso
             WHERE data_criacao_gabi_log_uso >= $1
               AND data_criacao_gabi_log_uso <  $2`,
            startDate,
            endDate,
          )
          return linhas
        })
      }),
    )

    // 3. Agregar
    const byModel: Record<string, { calls: number; tokensIn: number; tokensOut: number; cost: number }> = {}
    const byDay:   Record<string, number> = {}
    let totalCalls       = 0
    let totalTokensIn    = 0
    let totalTokensOut   = 0
    let totalCost        = 0
    const orgsComFalha: string[] = []

    resultados.forEach((res, idx) => {
      if (res.status === 'rejected') {
        orgsComFalha.push(organizacoes[idx].id_organizacao)
        console.warn('[gabi/admin/uso-global] falha em uma org', {
          id_organizacao: organizacoes[idx].id_organizacao,
          erro:           res.reason instanceof Error ? res.reason.message : String(res.reason),
        })
        return
      }
      for (const linha of res.value) {
        const modelo = linha.modelo ?? 'unknown'
        if (!byModel[modelo]) byModel[modelo] = { calls: 0, tokensIn: 0, tokensOut: 0, cost: 0 }
        byModel[modelo].calls++
        byModel[modelo].tokensIn  += Number(linha.tokensInput)
        byModel[modelo].tokensOut += Number(linha.tokensOutput)
        byModel[modelo].cost      += Number(linha.custoUsd)

        totalCalls++
        totalTokensIn  += Number(linha.tokensInput)
        totalTokensOut += Number(linha.tokensOutput)
        totalCost      += Number(linha.custoUsd)

        const dia = new Date(linha.dataCriacao).toISOString().slice(0, 10)
        byDay[dia] = (byDay[dia] || 0) + Number(linha.custoUsd)
      }
    })

    res.json({
      month:              targetMonth,
      total_calls:        totalCalls,
      total_tokens_input: totalTokensIn,
      total_tokens_output: totalTokensOut,
      total_cost_usd:     Math.round(totalCost * 1_000_000) / 1_000_000,
      by_model:           byModel,
      by_day:             byDay,
      orgs_consultadas:   organizacoes.length,
      orgs_com_falha:     orgsComFalha.length,
    })
  } catch (err) {
    console.error('[gabi/admin/uso-global] erro fatal', {
      mensagem: err instanceof Error ? err.message : String(err),
      stack:    err instanceof Error ? err.stack    : undefined,
    })
    // DEBUG TEMPORARIO: expor erro no body pra diagnostico (remover apos resolver)
    res.status(500).json({
      _debug_erro:        err instanceof Error ? err.message : String(err),
      _debug_stack_top:   err instanceof Error && err.stack ? err.stack.split('\n').slice(0, 5).join(' | ') : undefined,
    })
  }
})

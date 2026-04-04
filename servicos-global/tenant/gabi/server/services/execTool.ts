// server/services/execTool.ts
// Executor de tools da GABI — roteamento por nome para o conector correto
// Segue o padrão do Journey: switch por nome + contexto do usuário injetado

import {
  listLpcos, getLpco, createLpco, updateLpco,
  listNfs, getNf, createNf,
  listPedidos, getPedido,
  simulateCost,
  getUserSummary,
  type ConnectorCtx,
} from './connectors.js'
import { WRITE_TOOLS, DESTRUCTIVE_TOOLS } from './tools.js'
import { AppError } from '../lib/errors.js'

export interface ToolContext extends ConnectorCtx {
  userRole: string
}

// Ações realizadas nesta chamada (para sinalizar refresh no frontend)
export interface ActionRecord {
  tool: string
  success: boolean
  id?: string
}

export async function execTool(
  name: string,
  args: any,
  ctx: ToolContext,
): Promise<{ result: any; action?: ActionRecord }> {

  // Usuário anônimo não pode escrever
  if (WRITE_TOOLS.has(name) && ctx.userId === 'anonymous') {
    throw new AppError('Autenticação necessária para executar esta ação.', 401, 'UNAUTHORIZED')
  }

  // Tools destrutivas precisam de confirmed: true nos args
  if (DESTRUCTIVE_TOOLS.has(name) && !args.confirmed) {
    return {
      result: {
        requiresConfirmation: true,
        message: `Esta ação é irreversível. Confirme para continuar.`,
      },
    }
  }

  const connCtx: ConnectorCtx = { tenantId: ctx.tenantId, userId: ctx.userId }

  switch (name) {

    // ── Resumo ──────────────────────────────────────────────────────────────
    case 'get_user_summary':
      return { result: await getUserSummary(connCtx) }

    // ── LPCO ────────────────────────────────────────────────────────────────
    case 'list_lpcos':
      return { result: await listLpcos(args, connCtx) }

    case 'get_lpco':
      return { result: await getLpco(args, connCtx) }

    case 'create_lpco': {
      const data = await createLpco(args, connCtx)
      return {
        result: data,
        action: { tool: name, success: true, id: data?.id },
      }
    }

    case 'update_lpco': {
      const data = await updateLpco(args, connCtx)
      return {
        result: data,
        action: { tool: name, success: true, id: args.lpco_id },
      }
    }

    // ── NF Importação ────────────────────────────────────────────────────────
    case 'list_nfs':
      return { result: await listNfs(args, connCtx) }

    case 'get_nf':
      return { result: await getNf(args, connCtx) }

    case 'create_nf': {
      const data = await createNf(args, connCtx)
      return {
        result: data,
        action: { tool: name, success: true, id: data?.id },
      }
    }

    // ── Pedido ───────────────────────────────────────────────────────────────
    case 'list_pedidos':
      return { result: await listPedidos(args, connCtx) }

    case 'get_pedido':
      return { result: await getPedido(args, connCtx) }

    // ── SimulaCusto ──────────────────────────────────────────────────────────
    case 'simulate_cost':
      return { result: await simulateCost(args, connCtx) }

    default:
      return { result: { error: `Tool desconhecida: ${name}` } }
  }
}

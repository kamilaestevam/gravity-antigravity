// server/services/execTool.ts
// Executor de tools da GABI — roteamento por nome para o conector correto
// Segue o padrão do Journey: switch por nome + contexto do usuário injetado

import {
  listLpcos, getLpco, createLpco, updateLpco,
  listNfs, getNf, createNf,
  listPedidos, getPedido, createPedido, updatePedido, deletePedido,
  getOrganizacao, listUsuarios,
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
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<{ result: unknown; action?: ActionRecord }> {

  // Usuário anônimo não pode escrever
  if ((WRITE_TOOLS.has(name) || DESTRUCTIVE_TOOLS.has(name)) && ctx.userId === 'anonymous') {
    throw new AppError('Autenticação necessária para executar esta ação.', 401, 'UNAUTHORIZED')
  }

  // Tools destrutivas precisam de confirmed: true nos args (com aviso especial)
  if (DESTRUCTIVE_TOOLS.has(name) && !args.confirmed) {
    return {
      result: {
        requiresConfirmation: true,
        destructive: true,
        message: `⚠️ Ação DESTRUTIVA e IRREVERSÍVEL. Descreva ao usuário exatamente o que será feito e peça confirmação explícita. Só execute novamente com confirmed=true após o usuário confirmar.`,
      },
    }
  }

  // Tools de escrita (WRITE) precisam de confirmed: true nos args
  if (WRITE_TOOLS.has(name) && !args.confirmed) {
    return {
      result: {
        requiresConfirmation: true,
        message: `Ação de escrita requer confirmação do usuário. Descreva ao usuário exatamente o que será feito e peça confirmação. Só execute novamente com confirmed=true após o usuário confirmar.`,
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

    case 'create_pedido': {
      const data = await createPedido(args, connCtx)
      return {
        result: data,
        action: { tool: name, success: true, id: (data as any)?.pedido?.id_pedido },
      }
    }

    case 'update_pedido': {
      const data = await updatePedido(args, connCtx)
      return {
        result: data,
        action: { tool: name, success: true, id: args.pedido_id as string },
      }
    }

    case 'delete_pedido': {
      const data = await deletePedido(args, connCtx)
      return {
        result: data,
        action: { tool: name, success: true, id: args.pedido_id as string },
      }
    }

    // ── Configurador (Organização / Usuários) ────────────────────────────────
    case 'get_organizacao':
      return { result: await getOrganizacao(connCtx) }

    case 'list_usuarios':
      return { result: await listUsuarios(connCtx) }

    // ── SimulaCusto ──────────────────────────────────────────────────────────
    case 'simulate_cost':
      return { result: await simulateCost(args, connCtx) }

    default:
      return { result: { error: `Tool desconhecida: ${name}` } }
  }
}

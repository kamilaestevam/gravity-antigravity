import { z } from 'zod'

export const pedidoDuplicataResumoSchema = z.object({
  id_pedido: z.string(),
  numero_pedido: z.string(),
})

export const duplicatasNumeroResponseSchema = z.object({
  pedidos_existentes: z.array(pedidoDuplicataResumoSchema),
})

export type PedidoDuplicataResumo = z.infer<typeof pedidoDuplicataResumoSchema>

export const CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED = 'DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED'

export type ErroApiPedido = Error & {
  codeBackend?: string
  pedidosExistentesDuplicata?: PedidoDuplicataResumo[]
}

export function deveAbrirConfirmacaoDuplicata(pedidosExistentes: PedidoDuplicataResumo[]): boolean {
  return pedidosExistentes.length > 0
}

export function montarMensagemCancelamentoDuplicata(
  numeroPedido: string,
  quantidadeDuplicatas: number,
  traduzir: (key: string, opts?: Record<string, unknown>) => string,
): string {
  return traduzir('pedido.modal_novo.confirm_duplicata_msg', {
    numero: numeroPedido,
    count: quantidadeDuplicatas,
  })
}

export function interpretarErroCriacaoDuplicata(err: unknown): {
  requerConfirmacao: boolean
  pedidosExistentes: PedidoDuplicataResumo[]
} {
  if (!(err instanceof Error)) {
    return { requerConfirmacao: false, pedidosExistentes: [] }
  }

  const erroApi = err as ErroApiPedido
  if (erroApi.codeBackend !== CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED) {
    return { requerConfirmacao: false, pedidosExistentes: [] }
  }

  return {
    requerConfirmacao: true,
    pedidosExistentes: erroApi.pedidosExistentesDuplicata ?? [],
  }
}

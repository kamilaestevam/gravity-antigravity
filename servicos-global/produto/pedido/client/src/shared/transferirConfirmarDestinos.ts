import type { CenarioTransfer, TransferDestino } from './types'

/**
 * Monta destinos do payload de /confirmar para um item do loop multi-item.
 * Em split_novo_pedido, itens após o primeiro devem ir para o pedido já criado
 * (id persistido do 1º confirmar), não para o resultado do item anterior.
 */
export function montarDestinosConfirmarTransferir(
  cenario: CenarioTransfer,
  destinos: TransferDestino[],
  quantidadeItem: number,
  indiceItem: number,
  idPedidoDestinoCriado: string | undefined,
): TransferDestino[] {
  if (cenario === 'reducao_simples') return []
  return destinos.map(d => ({
    ...d,
    quantidade: quantidadeItem,
    ...(indiceItem > 0 && cenario === 'split_novo_pedido' && idPedidoDestinoCriado
      ? { tipo: 'existente' as const, pedido_id: idPedidoDestinoCriado }
      : {}),
  }))
}

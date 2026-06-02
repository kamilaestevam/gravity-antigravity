/**
 * buildExportDadosProcesso — flatten hierárquico para exportação client-side.
 */
import type { Pedido, PedidoItem } from './pedidoTypes'
import type { ProcessoAvoLinha } from './mockListaHierarquica'
import { fmtDataLista } from './mockListaHierarquica'

export function buildExportDadosProcesso(
  processos: ProcessoAvoLinha[],
  pedidos: ReadonlyArray<Pedido & { id_processo: string }>,
  itens: ReadonlyArray<PedidoItem>,
  pedidosExpandidos: ReadonlySet<string>,
): Record<string, unknown>[] {
  const linhas: Record<string, unknown>[] = []

  for (const proc of processos) {
    linhas.push({
      _tipo_linha: 'Processo',
      numero_processo: proc.numero_processo,
      referencia_interna_processo: proc.referencia_interna_processo ?? '',
      rotulo_status_processo: proc.rotulo_status_processo,
      tipo_operacao: proc.tipo_operacao_processo === 'importacao' ? 'Importação' : 'Exportação',
      nome_importador: proc.nome_importador,
      nome_exportador: proc.nome_exportador,
      valor_total: proc.valor_total_agregado,
      status: proc.rotulo_status_processo,
    })

    const pedidosProc = pedidos.filter(p => p.id_processo === proc.id_processo)
    for (const pedido of pedidosProc) {
      linhas.push({
        _tipo_linha: 'Pedido',
        numero_processo: proc.numero_processo,
        referencia_interna_processo: proc.referencia_interna_processo ?? '',
        rotulo_status_processo: proc.rotulo_status_processo,
        numero_pedido: pedido.numero_pedido,
        tipo_operacao: pedido.tipo_operacao,
        status: pedido.status,
        nome_importador: pedido.nome_importador ?? '',
        nome_exportador: pedido.nome_exportador ?? '',
        referencia_importador: pedido.referencia_importador ?? '',
        referencia_exportador: pedido.referencia_exportador ?? '',
        incoterm: pedido.incoterm ?? '',
        valor_total: pedido.valor_total_pedido ?? '',
        quantidade_inicial: pedido.quantidade_total_pedido ?? '',
        data_emissao_pedido: fmtDataLista(pedido.data_emissao_pedido),
      })

      if (!pedidosExpandidos.has(pedido.id)) continue

      for (const item of itens.filter(i => i.pedido_id === pedido.id)) {
        linhas.push({
          _tipo_linha: 'Item',
          numero_processo: proc.numero_processo,
          referencia_interna_processo: proc.referencia_interna_processo ?? '',
          rotulo_status_processo: proc.rotulo_status_processo,
          numero_pedido: pedido.numero_pedido,
          numero_item: item.part_number ?? '',
          tipo_operacao: pedido.tipo_operacao,
          status: pedido.status,
          nome_importador: pedido.nome_importador ?? '',
          nome_exportador: pedido.nome_exportador ?? '',
          referencia_importador: pedido.referencia_importador ?? '',
          referencia_exportador: pedido.referencia_exportador ?? '',
          incoterm: pedido.incoterm ?? '',
          descricao_item: item.descricao_item ?? '',
          ncm: item.ncm ?? '',
          valor_total: item.valor_total_item ?? '',
          quantidade_inicial: item.quantidade_inicial_pedido ?? '',
          data_emissao_pedido: fmtDataLista(pedido.data_emissao_pedido),
        })
      }
    }
  }

  return linhas
}

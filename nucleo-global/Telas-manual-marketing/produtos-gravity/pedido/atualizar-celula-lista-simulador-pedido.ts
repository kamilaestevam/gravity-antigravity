import type {
  ItemListaPedidoSimulador,
  LinhaListaPedidoSimulador,
  StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import { pedidoTemAlertaIncoterm } from './regras-celula-lista-simulador-pedido'

function sincronizarCamposPai(linha: LinhaListaPedidoSimulador): LinhaListaPedidoSimulador {
  const campos = { ...linha.campos }
  return {
    ...linha,
    numeroPedido: campos.numero_pedido ?? linha.numeroPedido,
    tipoOperacao: (campos.tipo_operacao as LinhaListaPedidoSimulador['tipoOperacao']) ?? linha.tipoOperacao,
    status: (campos.status as StatusListaPedidoSimulador) ?? linha.status,
    workspace: campos.id_workspace ?? linha.workspace,
    exportador: campos.nome_exportador ?? linha.exportador,
    vincularExportador: !campos.nome_exportador && linha.vincularExportador,
    incoterm: campos.incoterm ?? linha.incoterm,
    portoOrigem: campos.porto_origem ?? linha.portoOrigem,
    campos,
    alertaIncoterm: pedidoTemAlertaIncoterm({ ...linha, campos }),
  }
}

function sincronizarCamposItem(
  item: ItemListaPedidoSimulador,
  linha: LinhaListaPedidoSimulador,
): ItemListaPedidoSimulador {
  const campos = { ...item.campos }
  const numeroItem = campos.numero_pedido ?? item.numeroItem
  const atualizado = {
    ...item,
    numeroItem,
    tipoOperacao: (campos.tipo_operacao as ItemListaPedidoSimulador['tipoOperacao']) ?? item.tipoOperacao,
    status: (campos.status as StatusListaPedidoSimulador) ?? item.status,
    campos,
  }
  return {
    ...atualizado,
    alerta: atualizado.alerta || celulaDivergente('numero_pedido', linha, atualizado),
  }
}

export function celulaDivergente(
  colunaId: string,
  linha: LinhaListaPedidoSimulador,
  item: ItemListaPedidoSimulador,
): boolean {
  const valorPai = linha.campos[colunaId] ?? null
  const valorItem = item.campos[colunaId] ?? null
  if (valorPai == null || valorItem == null) return false
  return valorPai !== valorItem
}

export function atualizarCelulaListaSimulador(
  linhas: LinhaListaPedidoSimulador[],
  linhaId: string,
  colunaId: string,
  valor: string | null,
  itemId?: string,
): LinhaListaPedidoSimulador[] {
  return linhas.map((linha) => {
    if (linha.id !== linhaId) return linha

    if (itemId) {
      const detalhesItens = linha.detalhesItens.map((item) => {
        if (item.id !== itemId) return item
        const campos = { ...item.campos, [colunaId]: valor }
        return sincronizarCamposItem({ ...item, campos }, linha)
      })
      return sincronizarCamposPai({ ...linha, detalhesItens, alertaIncoterm: pedidoTemAlertaIncoterm({ ...linha, detalhesItens }) })
    }

    const campos = { ...linha.campos, [colunaId]: valor }
    const atualizada = sincronizarCamposPai({ ...linha, campos })

    if (colunaId === 'nome_exportador' && valor) {
      return { ...atualizada, vincularExportador: false, exportador: valor }
    }

    if (colunaId === 'incoterm' || colunaId === 'status' || colunaId === 'tipo_operacao') {
      const detalhesItens = atualizada.detalhesItens.map((item) => {
        const camposItem = { ...item.campos }
        if (camposItem[colunaId] == null || camposItem[colunaId] === linha.campos[colunaId]) {
          camposItem[colunaId] = valor
        }
        return sincronizarCamposItem({ ...item, campos: camposItem }, atualizada)
      })
      return sincronizarCamposPai({ ...atualizada, detalhesItens })
    }

    return atualizada
  })
}

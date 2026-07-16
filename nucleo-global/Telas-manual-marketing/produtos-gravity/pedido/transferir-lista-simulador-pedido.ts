import type {
  ItemListaPedidoSimulador,
  LinhaListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import { filtrarItensAvulsosSelecao } from './duplicar-excluir-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'

export type CenarioTransferSimulador =
  | 'reducao_simples'
  | 'split_novo_pedido'
  | 'split_pedido_existente'

export type TransferDestinoSimulador = {
  tipo: 'novo' | 'existente'
  pedido_id?: string
  quantidade: number
}

export type ItemComPedidoTransferirSimulador = {
  item: ItemListaPedidoSimulador
  pedido: LinhaListaPedidoSimulador
}

export type TransferPreviewSimulador = {
  cenario: CenarioTransferSimulador
  origem: {
    pedido_numero: string
    item_part_number: string
    quantidade_atual_pedido: number
    quantidade_apos: number
    encerra: boolean
  }
  destinos: {
    tipo: 'novo' | 'existente'
    pedido_numero?: string
    quantidade: number
    alertas: string[]
  }[]
  alertas_globais: string[]
  aviso_tipo_operacao?: boolean
}

export type ResumoTransferenciaListaSimulador = {
  cenario: CenarioTransferSimulador
  itensProcessados: number
  quantidadeTotal: number
  pedidoOrigemId: string
  pedidoOrigemNumero: string
  pedidoDestinoId?: string
  pedidoNovoNumero?: string
  pedidosDestinoNumeros: string[]
  itensOrigemIds: string[]
  itensDestinoIds: string[]
  quantidadesPorItemOrigem: Record<string, number>
  /** Valor acumulado em `quantidade_transferida_total` do 1º item de origem após a operação. */
  quantidadeTransferidaAcumuladaOrigem: number
  /** Total em `quantidade_transferida_total` do item de origem antes desta operação. */
  quantidadeTransferidaAnteriorOrigem: number
  quantidadeInicialItemOrigem: number
  quantidadeInicialItemDestino: number
  saldoItemOrigemAntes: number
  saldoItemOrigemApos: number
  saldoItemDestinoApos: number
}

export const COLUNAS_DESTAQUE_POS_TRANSFERENCIA_SIMULADOR = [
  'status',
  'id_workspace',
  'nome_exportador',
] as const

export const COLUNAS_DESTAQUE_SALDOS_POS_TRANSFERENCIA_SIMULADOR = [
  'quantidade_total_pedido',
  'quantidade_transferida_total',
  'saldo_itens_do_pedido',
] as const

export type PassoGuiaPosTransferenciaSimulador = 1 | 2 | 3

const TOTAL_PASSOS_GUIA_POS_TRANSFERENCIA_SIMULADOR = 3

export function totalPassosGuiaPosTransferenciaSimulador(): number {
  return TOTAL_PASSOS_GUIA_POS_TRANSFERENCIA_SIMULADOR
}

/** Uma coluna por passo: 1 = qtd. inicial, 2 = qtd. transferida, 3 = saldo. */
export function colunasDestaqueGuiaPosTransferenciaSimulador(
  passo: PassoGuiaPosTransferenciaSimulador,
): readonly string[] {
  if (passo === 1) return ['quantidade_total_pedido']
  if (passo === 2) return ['quantidade_transferida_total']
  if (passo === 3) return ['saldo_itens_do_pedido']
  return []
}

export function itemDestaqueGuiaPosTransferencia(
  passo: PassoGuiaPosTransferenciaSimulador,
  resumo: ResumoTransferenciaListaSimulador,
  itemId: string,
): boolean {
  const envolvido =
    resumo.itensOrigemIds.includes(itemId) || resumo.itensDestinoIds.includes(itemId)
  if (!envolvido) return false
  return passo === 1 || passo === 2 || passo === 3
}

export function fmtQuantidadeSimulador(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  })
}

/** Rótulo do guia: sempre inclui "pedido" e remove hífen do código (PO-9810 → pedido PO 9810). */
export function rotuloPedidoGuiaPosTransferencia(numero: string | undefined | null): string {
  const bruto = String(numero ?? '').trim()
  if (!bruto || bruto === '—' || bruto === '-') return 'pedido destino'
  let codigo = bruto.replace(/^pedido\s+/i, '').trim()
  codigo = codigo.replace(/^PO-/i, 'PO ')
  return `pedido ${codigo}`
}

function lerQuantidadeTransferidaAcumuladaItemOrigem(
  linhas: readonly LinhaListaPedidoSimulador[],
  itemOrigemId: string | undefined,
): number {
  if (!itemOrigemId) return 0
  for (const linha of linhas) {
    const item = linha.detalhesItens.find((i) => i.id === itemOrigemId)
    if (!item) continue
    return parseQuantidadeCampoSimulador(item.campos.quantidade_transferida_total) ?? 0
  }
  return 0
}

function lerCampoNumericoItemSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  itemId: string | undefined,
  campo: 'quantidade_inicial_item' | 'saldo_itens_do_pedido',
): number {
  if (!itemId) return 0
  for (const linha of linhas) {
    const item = linha.detalhesItens.find((i) => i.id === itemId)
    if (!item) continue
    return parseQuantidadeCampoSimulador(item.campos[campo]) ?? 0
  }
  return 0
}

export function lerPartNumberItemSimulador(item: ItemListaPedidoSimulador): string {
  return item.campos.part_number_item ?? item.campos.descricao_item ?? item.numeroItem
}

function parseQuantidadeCampoSimulador(raw: string | null | undefined): number | null {
  const limpo = String(raw ?? '').replace(/\./g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : null
}

export function lerQuantidadeItemSimulador(item: ItemListaPedidoSimulador): number {
  const raw =
    item.campos.quantidade_inicial_item
    ?? item.campos.quantidade_total_pedido
    ?? item.campos.saldo_itens_do_pedido
  const n = parseQuantidadeCampoSimulador(raw)
  if (n != null && n > 0) return n
  return 10 + item.sequencia
}

/** Saldo disponível para transferir — não usa qtd. inicial congelada. */
export function lerSaldoTransferivelItemSimulador(item: ItemListaPedidoSimulador): number {
  const n =
    parseQuantidadeCampoSimulador(item.campos.saldo_itens_do_pedido)
    ?? parseQuantidadeCampoSimulador(item.campos.quantidade_total_pedido)
    ?? parseQuantidadeCampoSimulador(item.campos.quantidade_inicial_item)
  if (n != null && n > 0) return n
  return 10 + item.sequencia
}

function atualizarCamposItemOrigemAposTransferencia(
  campos: Record<string, string | null>,
  qtyTransferida: number,
): Record<string, string | null> {
  const saldoAtual =
    parseQuantidadeCampoSimulador(campos.saldo_itens_do_pedido)
    ?? parseQuantidadeCampoSimulador(campos.quantidade_inicial_item)
    ?? parseQuantidadeCampoSimulador(campos.quantidade_total_pedido)
    ?? 0
  const inicialCongelada =
    parseQuantidadeCampoSimulador(campos.quantidade_inicial_item)
    ?? saldoAtual
  const transferidoAtual = parseQuantidadeCampoSimulador(campos.quantidade_transferida_total) ?? 0
  const saldoNovo = Math.max(0, saldoAtual - qtyTransferida)
  const transferidoNovo = transferidoAtual + qtyTransferida
  return {
    ...campos,
    quantidade_inicial_item: campos.quantidade_inicial_item ?? String(inicialCongelada),
    saldo_itens_do_pedido: String(saldoNovo),
    quantidade_transferida_total: String(transferidoNovo),
  }
}

function escreverQuantidadeCamposItemDestino(
  campos: Record<string, string | null>,
  qty: number,
): Record<string, string | null> {
  const s = String(qty)
  return {
    ...campos,
    quantidade_inicial_item: s,
    quantidade_total_pedido: s,
    saldo_itens_do_pedido: s,
    quantidade_transferida_total: '0',
  }
}

function atualizarTotaisPedidoAposTransferencia(
  linha: LinhaListaPedidoSimulador,
  qtyTransferida: number,
): LinhaListaPedidoSimulador {
  const saldoAtual = Number.parseFloat(String(linha.campos.saldo_itens_do_pedido ?? '').replace(',', '.')) || 0
  const transferidoAtual = Number.parseFloat(String(linha.campos.quantidade_transferida_total ?? '').replace(',', '.')) || 0
  const saldoNovo = Math.max(0, saldoAtual - qtyTransferida)
  const transferidoNovo = transferidoAtual + qtyTransferida
  return {
    ...linha,
    campos: {
      ...linha.campos,
      saldo_itens_do_pedido: String(saldoNovo),
      quantidade_transferida_total: String(transferidoNovo),
    },
  }
}

export function montarPedidosEnvolvidosTransferir(
  selecao: SelecaoListaSimuladorPedido,
  linhas: readonly LinhaListaPedidoSimulador[],
): LinhaListaPedidoSimulador[] {
  const ids = new Set(selecao.pedidos.map((p) => p.id))
  const resultado = [...selecao.pedidos]
  for (const { pai } of filtrarItensAvulsosSelecao(selecao)) {
    if (!ids.has(pai.id)) {
      const atual = linhas.find((l) => l.id === pai.id) ?? pai
      resultado.push(atual)
      ids.add(pai.id)
    }
  }
  return resultado
}

/** Espelha montarItensComPedidoParaTransferir — itens avulsos têm prioridade. */
export function montarItensComPedidoTransferirSimulador(
  pedidos: readonly LinhaListaPedidoSimulador[],
  itensAvulsos: readonly { item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador }[],
  todosPedidos: readonly LinhaListaPedidoSimulador[],
): ItemComPedidoTransferirSimulador[] {
  const mapa = new Map<string, LinhaListaPedidoSimulador>()
  for (const p of todosPedidos) mapa.set(p.id, p)
  for (const p of pedidos) mapa.set(p.id, p)

  if (itensAvulsos.length > 0) {
    return itensAvulsos.map(({ item, pai }) => ({
      item,
      pedido: mapa.get(pai.id) ?? pai,
    }))
  }

  const resultado: ItemComPedidoTransferirSimulador[] = []
  for (const pedido of pedidos) {
    const atual = mapa.get(pedido.id) ?? pedido
    for (const item of atual.detalhesItens) {
      resultado.push({ item, pedido: atual })
    }
  }
  return resultado
}

export function inicializarItensQuantidadesTransferirSimulador(
  itensComPedido: readonly ItemComPedidoTransferirSimulador[],
  itensSelecionadosIds: readonly string[] | undefined,
): Map<string, number> {
  const mapa = new Map<string, number>()
  const ids = itensComPedido.map(({ item }) => item.id)

  if (itensSelecionadosIds && itensSelecionadosIds.length > 0) {
    const set = new Set(itensSelecionadosIds)
    for (const id of ids) {
      if (set.has(id)) mapa.set(id, 0)
    }
    return mapa
  }

  return mapa
}

export function listarPedidosDestinoElegiveisSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  pedidosOrigem: readonly LinhaListaPedidoSimulador[],
  tipoOperacao: LinhaListaPedidoSimulador['tipoOperacao'],
): LinhaListaPedidoSimulador[] {
  const idsOrigem = new Set(pedidosOrigem.map((p) => p.id))
  return linhas.filter(
    (l) => l.tipoOperacao === tipoOperacao && !idsOrigem.has(l.id),
  )
}

export function montarDestinosConfirmarTransferirSimulador(
  cenario: CenarioTransferSimulador,
  destinos: TransferDestinoSimulador[],
  quantidadeItem: number,
  indiceItem: number,
  idPedidoDestinoCriado: string | undefined,
): TransferDestinoSimulador[] {
  if (cenario === 'reducao_simples') return []
  return destinos.map((d) => ({
    ...d,
    quantidade: quantidadeItem,
    ...(indiceItem > 0 && cenario === 'split_novo_pedido' && idPedidoDestinoCriado
      ? { tipo: 'existente' as const, pedido_id: idPedidoDestinoCriado }
      : {}),
  }))
}

export function gerarPreviewTransferenciaSimulador(
  cenario: CenarioTransferSimulador,
  item: ItemListaPedidoSimulador,
  pedido: LinhaListaPedidoSimulador,
  quantidade: number,
  destinos: TransferDestinoSimulador[],
  numeroPedidoNovo: string,
  linhas: readonly LinhaListaPedidoSimulador[],
  pedidoDestinoId?: string,
): TransferPreviewSimulador {
  const saldoAtual = lerSaldoTransferivelItemSimulador(item)
  const quantidadeApos = Math.max(0, saldoAtual - quantidade)
  const encerra = quantidadeApos <= 0
  const alertas: string[] = []
  if (encerra) alertas.push('Pedido de origem ficará com quantidade zero após a transferência')
  if (quantidade > saldoAtual) {
    alertas.push('Quantidade solicitada excede quantidade disponível no item')
  }

  let avisoTipo = false
  if (cenario === 'split_pedido_existente' && pedidoDestinoId) {
    const dest = linhas.find((l) => l.id === pedidoDestinoId)
    if (dest && dest.tipoOperacao !== pedido.tipoOperacao) avisoTipo = true
  }

  return {
    cenario,
    origem: {
      pedido_numero: pedido.numeroPedido,
      item_part_number: lerPartNumberItemSimulador(item),
      quantidade_atual_pedido: saldoAtual,
      quantidade_apos: quantidadeApos,
      encerra,
    },
    destinos:
      cenario === 'reducao_simples'
        ? []
        : destinos.map((d) => ({
            tipo: d.tipo,
            pedido_numero:
              d.tipo === 'novo'
                ? numeroPedidoNovo || undefined
                : linhas.find((l) => l.id === d.pedido_id)?.numeroPedido,
            quantidade: d.quantidade,
            alertas: [],
          })),
    alertas_globais: alertas,
    aviso_tipo_operacao: avisoTipo,
  }
}

function clonarItemTransferido(
  item: ItemListaPedidoSimulador,
  pedidoDestino: LinhaListaPedidoSimulador,
  sequencia: number,
  qty: number,
  sufixoId: string,
): ItemListaPedidoSimulador {
  const numeroItem = `${pedidoDestino.numeroPedido}-${String(sequencia).padStart(2, '0')}`
  const campos = {
    ...item.campos,
    numero_pedido: pedidoDestino.numeroPedido,
    numero_item: numeroItem,
    sequencia_item_pedido: String(sequencia),
  }
  return {
    id: `${pedidoDestino.id}-item-${sequencia}${sufixoId}`,
    sequencia,
    numeroItem,
    alerta: item.alerta,
    tipoOperacao: pedidoDestino.tipoOperacao,
    status: pedidoDestino.status,
    campos: escreverQuantidadeCamposItemDestino(campos, qty),
  }
}

function clonarPedidoDestinoNovo(
  modelo: LinhaListaPedidoSimulador,
  linhas: readonly LinhaListaPedidoSimulador[],
  numeroPedido: string,
): LinhaListaPedidoSimulador {
  const sufixo = `-trf-${Date.now()}`
  const id = `${modelo.id}${sufixo}`
  const campos = { ...modelo.campos, numero_pedido: numeroPedido }
  return {
    ...modelo,
    id,
    numeroPedido,
    status: 'ABERTO',
    itens: 0,
    detalhesItens: [],
    campos,
  }
}

function atualizarItemNaLinha(
  linha: LinhaListaPedidoSimulador,
  itemId: string,
  updater: (item: ItemListaPedidoSimulador) => ItemListaPedidoSimulador,
): LinhaListaPedidoSimulador {
  const detalhesItens = linha.detalhesItens.map((item) =>
    item.id === itemId ? updater(item) : item,
  )
  return { ...linha, detalhesItens, itens: detalhesItens.length }
}

export function aplicarTransferenciaListaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  params: {
    cenario: CenarioTransferSimulador
    itensQuantidades: Map<string, number>
    itemToPedido: Map<string, LinhaListaPedidoSimulador>
    destinos: TransferDestinoSimulador[]
    numeroPedidoNovo: string
  },
): { linhas: LinhaListaPedidoSimulador[]; resumo: ResumoTransferenciaListaSimulador; idsNovosPedidos: string[] } {
  const { cenario, itensQuantidades, itemToPedido, destinos, numeroPedidoNovo } = params
  let proximas = [...linhas]
  const idsNovosPedidos: string[] = []
  const pedidosDestinoNumeros: string[] = []
  let idPedidoDestinoCriado: string | undefined
  let quantidadeTotal = 0
  const itensOrigemIds: string[] = []
  const itensDestinoIds: string[] = []
  const quantidadesPorItemOrigem: Record<string, number> = {}
  let quantidadeTransferidaAnteriorOrigem = 0
  let saldoItemOrigemAntes = 0

  const entradas = Array.from(itensQuantidades.entries())
  const primeiroPedidoOrigem = entradas.length > 0 ? itemToPedido.get(entradas[0][0]) : undefined

  for (let idx = 0; idx < entradas.length; idx += 1) {
    const [itemId, qty] = entradas[idx]
    if (qty <= 0) continue
    const pedidoOrigem = itemToPedido.get(itemId)
    if (!pedidoOrigem) continue

    const linhaOrigem = proximas.find((l) => l.id === pedidoOrigem.id)
    if (!linhaOrigem) continue
    const itemOrigem = linhaOrigem.detalhesItens.find((i) => i.id === itemId)
    if (!itemOrigem) continue

    quantidadeTotal += qty
    quantidadesPorItemOrigem[itemId] = qty
    if (itensOrigemIds.length === 0) {
      quantidadeTransferidaAnteriorOrigem =
        parseQuantidadeCampoSimulador(itemOrigem.campos.quantidade_transferida_total) ?? 0
      saldoItemOrigemAntes = lerSaldoTransferivelItemSimulador(itemOrigem)
    }
    itensOrigemIds.push(itemId)
    const saldoAtual = lerSaldoTransferivelItemSimulador(itemOrigem)
    const saldoApos = Math.max(0, saldoAtual - qty)

    proximas = proximas.map((linha) => {
      if (linha.id !== pedidoOrigem.id) return linha
      const linhaAtualizada = atualizarItemNaLinha(linha, itemId, (item) => ({
        ...item,
        status: saldoApos <= 0 ? 'TRANSFERIDO' : item.status,
        campos: atualizarCamposItemOrigemAposTransferencia(item.campos, qty),
      }))
      return atualizarTotaisPedidoAposTransferencia(linhaAtualizada, qty)
    })

    if (cenario === 'reducao_simples') continue

    const destinosItem = montarDestinosConfirmarTransferirSimulador(
      cenario,
      destinos,
      qty,
      idx,
      idPedidoDestinoCriado,
    )
    const destino = destinosItem[0]
    if (!destino) continue

    if (cenario === 'split_novo_pedido') {
      if (!idPedidoDestinoCriado) {
        const novo = clonarPedidoDestinoNovo(linhaOrigem, proximas, numeroPedidoNovo.trim())
        idPedidoDestinoCriado = novo.id
        idsNovosPedidos.push(novo.id)
        pedidosDestinoNumeros.push(novo.numeroPedido)
        proximas = [novo, ...proximas]
      }
      const idDest = idPedidoDestinoCriado
      proximas = proximas.map((linha) => {
        if (linha.id !== idDest) return linha
        const seq = linha.detalhesItens.length + 1
        const sufixo = `-t${idx}`
        const novoItem = clonarItemTransferido(itemOrigem, linha, seq, qty, sufixo)
        itensDestinoIds.push(novoItem.id)
        const detalhesItens = [...linha.detalhesItens, novoItem]
        return {
          ...linha,
          detalhesItens,
          itens: detalhesItens.length,
          status: 'ABERTO',
          campos: {
            ...linha.campos,
            quantidade_total_pedido: String(qty),
            saldo_itens_do_pedido: String(qty),
            quantidade_transferida_total: '0',
          },
        }
      })
      continue
    }

    if (cenario === 'split_pedido_existente' && destino.pedido_id) {
      const destNumero = proximas.find((l) => l.id === destino.pedido_id)?.numeroPedido
      if (destNumero && !pedidosDestinoNumeros.includes(destNumero)) {
        pedidosDestinoNumeros.push(destNumero)
      }
      proximas = proximas.map((linha) => {
        if (linha.id !== destino.pedido_id) return linha
        const seq = linha.detalhesItens.length + 1
        const sufixo = `-t${idx}`
        const novoItem = clonarItemTransferido(itemOrigem, linha, seq, qty, sufixo)
        itensDestinoIds.push(novoItem.id)
        const detalhesItens = [...linha.detalhesItens, novoItem]
        return {
          ...linha,
          detalhesItens,
          itens: detalhesItens.length,
          status: linha.status === 'RASCUNHO' ? 'ABERTO' : linha.status,
          campos: {
            ...linha.campos,
            saldo_itens_do_pedido: String(
              (Number.parseFloat(String(linha.campos.saldo_itens_do_pedido ?? qty).replace(',', '.')) || 0) + qty,
            ),
          },
        }
      })
    }
  }

  return {
    linhas: proximas,
    idsNovosPedidos,
    resumo: {
      cenario,
      itensProcessados: entradas.filter(([, q]) => q > 0).length,
      quantidadeTotal,
      pedidoOrigemId: primeiroPedidoOrigem?.id ?? '',
      pedidoOrigemNumero: primeiroPedidoOrigem?.numeroPedido ?? '',
      pedidoDestinoId: idPedidoDestinoCriado ?? destinos[0]?.pedido_id,
      pedidoNovoNumero: (() => {
        const digitado = numeroPedidoNovo.trim()
        if (digitado) return digitado
        const gerado = pedidosDestinoNumeros.find((n) => n.trim())
        return gerado || undefined
      })(),
      pedidosDestinoNumeros,
      itensOrigemIds,
      itensDestinoIds,
      quantidadesPorItemOrigem,
      quantidadeTransferidaAcumuladaOrigem: lerQuantidadeTransferidaAcumuladaItemOrigem(
        proximas,
        itensOrigemIds[0],
      ),
      quantidadeTransferidaAnteriorOrigem,
      quantidadeInicialItemOrigem: lerCampoNumericoItemSimulador(
        proximas,
        itensOrigemIds[0],
        'quantidade_inicial_item',
      ),
      quantidadeInicialItemDestino: lerCampoNumericoItemSimulador(
        proximas,
        itensDestinoIds[0],
        'quantidade_inicial_item',
      ),
      saldoItemOrigemAntes,
      saldoItemOrigemApos: lerCampoNumericoItemSimulador(
        proximas,
        itensOrigemIds[0],
        'saldo_itens_do_pedido',
      ),
      saldoItemDestinoApos: lerCampoNumericoItemSimulador(
        proximas,
        itensDestinoIds[0],
        'saldo_itens_do_pedido',
      ),
    },
  }
}

export function montarMensagemToastTransferencia(resumo: ResumoTransferenciaListaSimulador): string {
  const partes: string[] = []
  partes.push(`${resumo.itensProcessados} item${resumo.itensProcessados !== 1 ? 's' : ''}`)
  partes.push(`${fmtQuantidadeSimulador(resumo.quantidadeTotal)} un.`)
  if (resumo.pedidoNovoNumero) partes.push(`novo pedido ${resumo.pedidoNovoNumero}`)
  if (resumo.pedidosDestinoNumeros.length > 0) {
    partes.push(`destino ${resumo.pedidosDestinoNumeros.join(', ')}`)
  }
  return partes.join(' · ')
}

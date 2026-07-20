import {
  materializarItensLinhaListaSimulador,
  type ItemListaPedidoSimulador,
  type LinhaListaPedidoSimulador,
  type StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import { filtrarItensAvulsosSelecao } from './duplicar-excluir-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'
import { selecaoTemTiposOperacaoIncompativeis } from './regras-acoes-barra-lista-simulador-pedido'
import {
  popularCamposPedidoListaSimulador,
  type ContextoCamposPedidoListaSimulador,
} from './popular-campos-lista-simulador-pedido'
import { lerPartNumberItemSimulador } from './transferir-lista-simulador-pedido'

export type ResumoConsolidacaoListaSimulador = {
  pedidosOrigem: number
  itensConsolidados: number
  numeroConsolidado: string
  numerosPedidosOrigem: string[]
}

export type ValorCampoPorPedidoConsolidacao = {
  pedido_id: string
  numero_pedido: string
  valor: string | number | null
}

export type CampoDivergenteConsolidacaoSimulador = {
  campo: string
  rotulo: string
  grupo: string
  valores: ValorCampoPorPedidoConsolidacao[]
  valor_sugerido: string | number | null
}

export type CampoIgualConsolidacaoSimulador = {
  campo: string
  rotulo: string
  grupo: string
  valor: string | number | null
}

export type ItemPreviewConsolidacaoSimulador = {
  part_number: string
  descricao_item: string | null
  quantidade_total: number
  pedidos_origem: string[]
  pode_fundir: boolean
}

export type PreviewConsolidacaoCompletoSimulador = {
  pedidosOrigem: LinhaListaPedidoSimulador[]
  pedidos_info: Array<{ id: string; numero: string; total_itens: number }>
  campos_divergentes: CampoDivergenteConsolidacaoSimulador[]
  campos_iguais: CampoIgualConsolidacaoSimulador[]
  itens: ItemPreviewConsolidacaoSimulador[]
  valor_total_soma: number
  moeda: string
  numero_sugerido: string
  conflito_tipo_operacao: boolean
}

export type OpcoesConsolidacaoListaSimulador = {
  numeroPedido?: string
  camposEscolhidos?: Record<string, string | number | null>
  fundirItensMesmoPartNumber?: boolean
}

/** Subconjunto dos campos do produto real — mapeados para `linha.campos` do simulador */
const CAMPOS_COMPARAR_CONSOLIDACAO: Array<{ campo: string; rotulo: string; grupo: string }> = [
  { campo: 'incoterm', rotulo: 'Incoterm', grupo: 'Comercial' },
  { campo: 'moeda_pedido', rotulo: 'Moeda', grupo: 'Comercial' },
  { campo: 'condicao_pagamento', rotulo: 'Condição de Pagamento', grupo: 'Comercial' },
  { campo: 'nome_exportador', rotulo: 'Exportador — Nome', grupo: 'Exportador' },
  { campo: 'cnpj_exportador', rotulo: 'Exportador — CNPJ', grupo: 'Exportador' },
  { campo: 'pais_exportador', rotulo: 'Exportador — País', grupo: 'Exportador' },
  { campo: 'porto_origem', rotulo: 'Porto Origem', grupo: 'Logística' },
  { campo: 'porto_destino', rotulo: 'Porto Destino', grupo: 'Logística' },
  { campo: 'referencia_exportador', rotulo: 'Referência Exportador', grupo: 'Documentos' },
  { campo: 'referencia_importador', rotulo: 'Referência Importador', grupo: 'Documentos' },
  { campo: 'moeda_cambio_pedido', rotulo: 'Moeda Câmbio', grupo: 'Câmbio' },
  { campo: 'data_emissao_pedido', rotulo: 'Data de Emissão', grupo: 'Datas' },
]

function lerValorCampoPedidoConsolidacao(
  pedido: LinhaListaPedidoSimulador,
  campo: string,
): string | number | null {
  if (campo === 'incoterm') return pedido.incoterm
  if (campo === 'moeda_pedido') return pedido.moeda
  if (campo === 'porto_origem') return pedido.portoOrigem
  if (campo === 'nome_exportador') return pedido.exportador || pedido.campos.nome_exportador || null
  return pedido.campos[campo] ?? null
}

function resolverPedidosEnvolvidosConsolidacao(
  selecao: SelecaoListaSimuladorPedido,
  linhas: readonly LinhaListaPedidoSimulador[],
): LinhaListaPedidoSimulador[] {
  const map = new Map<string, LinhaListaPedidoSimulador>()
  const linhaPorId = new Map(linhas.map((l) => [l.id, l]))

  for (const pedido of selecao.pedidos) {
    const linha = linhaPorId.get(pedido.id) ?? pedido
    map.set(pedido.id, materializarItensLinhaListaSimulador(linha))
  }
  for (const { pai } of filtrarItensAvulsosSelecao(selecao)) {
    if (!map.has(pai.id)) {
      const linha = linhaPorId.get(pai.id) ?? pai
      map.set(pai.id, materializarItensLinhaListaSimulador(linha))
    }
  }

  return [...map.values()]
}

function resolverItensParaConsolidar(
  pedidosOrigem: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
): ItemListaPedidoSimulador[] {
  const idsInteiros = new Set(selecao.pedidos.map((p) => p.id))
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const itens: ItemListaPedidoSimulador[] = []

  for (const pedido of pedidosOrigem) {
    if (idsInteiros.has(pedido.id)) {
      itens.push(...pedido.detalhesItens)
      continue
    }
    const idsAvulsos = new Set(
      itensAvulsos.filter(({ pai }) => pai.id === pedido.id).map(({ item }) => item.id),
    )
    itens.push(...pedido.detalhesItens.filter((item) => idsAvulsos.has(item.id)))
  }

  return itens
}

function lerQuantidadeItemSimulador(item: ItemListaPedidoSimulador): number {
  const bruto = item.campos.quantidade_total_pedido ?? item.campos.quantidade_atual_item
  if (bruto == null || bruto === '') return 1
  const n = Number.parseFloat(String(bruto).replace(',', '.'))
  return Number.isNaN(n) ? 1 : n
}

function montarItensPreviewConsolidacao(
  itens: readonly ItemListaPedidoSimulador[],
  pedidosOrigem: readonly LinhaListaPedidoSimulador[],
): ItemPreviewConsolidacaoSimulador[] {
  const numeroPorId = new Map(pedidosOrigem.map((p) => [p.id, p.numeroPedido]))
  const mapa = new Map<string, ItemPreviewConsolidacaoSimulador>()

  for (const item of itens) {
    const part = lerPartNumberItemSimulador(item)
    const pedidoId = item.id.split('-item-')[0] ?? ''
    const numeroPedido = numeroPorId.get(pedidoId) ?? pedidoId
    const qty = lerQuantidadeItemSimulador(item)
    const existente = mapa.get(part)
    if (!existente) {
      mapa.set(part, {
        part_number: part,
        descricao_item: item.campos.descricao_item ?? null,
        quantidade_total: qty,
        pedidos_origem: [numeroPedido],
        pode_fundir: false,
      })
      continue
    }
    existente.quantidade_total += qty
    if (!existente.pedidos_origem.includes(numeroPedido)) {
      existente.pedidos_origem.push(numeroPedido)
    }
    existente.pode_fundir = true
  }

  return [...mapa.values()]
}

function fundirItensPorPartNumber(itens: ItemListaPedidoSimulador[]): ItemListaPedidoSimulador[] {
  const mapa = new Map<string, ItemListaPedidoSimulador>()
  for (const item of itens) {
    const part = lerPartNumberItemSimulador(item)
    const existente = mapa.get(part)
    if (!existente) {
      mapa.set(part, item)
      continue
    }
    const qty = lerQuantidadeItemSimulador(item) + lerQuantidadeItemSimulador(existente)
    mapa.set(part, {
      ...existente,
      campos: {
        ...existente.campos,
        quantidade_atual_item: String(qty),
      },
    })
  }
  return [...mapa.values()]
}

function gerarNumeroConsolidado(linhas: readonly LinhaListaPedidoSimulador[]): string {
  const ano = new Date().getFullYear()
  const prefixo = `PO-CONS-${ano}/`
  let maxSeq = 0
  for (const linha of linhas) {
    if (!linha.numeroPedido.startsWith(prefixo)) continue
    const sufixo = linha.numeroPedido.slice(prefixo.length)
    const n = Number.parseInt(sufixo, 10)
    if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n)
  }
  return `${prefixo}${String(maxSeq + 1).padStart(3, '0')}`
}

function montarItensConsolidados(
  itensOrigem: readonly ItemListaPedidoSimulador[],
  ctxPai: ContextoCamposPedidoListaSimulador,
  novoId: string,
  numeroConsolidado: string,
  status: StatusListaPedidoSimulador,
): ItemListaPedidoSimulador[] {
  return itensOrigem.map((item, idx) => {
    const sequencia = idx + 1
    const numeroItem = `${numeroConsolidado}-${String(sequencia).padStart(2, '0')}`
    const campos = { ...item.campos }
    campos.sequencia_item_pedido = String(sequencia)
    campos.numero_item = numeroItem
    campos.numero_pedido = numeroConsolidado
    campos.status = status
    campos.tipo_operacao = ctxPai.tipoOperacao
    campos.id_workspace = ctxPai.workspace

    return {
      id: `${novoId}-item-${sequencia}`,
      sequencia,
      numeroItem,
      alerta: item.alerta,
      tipoOperacao: ctxPai.tipoOperacao,
      status,
      campos,
    }
  })
}

function aplicarCamposEscolhidosAoContexto(
  ctx: ContextoCamposPedidoListaSimulador,
  escolhidos: Record<string, string | number | null>,
): ContextoCamposPedidoListaSimulador {
  const next = { ...ctx }
  if (escolhidos.incoterm != null && escolhidos.incoterm !== '') {
    next.incoterm = String(escolhidos.incoterm)
  }
  if (escolhidos.moeda_pedido != null && escolhidos.moeda_pedido !== '') {
    next.moeda = String(escolhidos.moeda_pedido)
  }
  if (escolhidos.porto_origem != null && escolhidos.porto_origem !== '') {
    next.portoOrigem = String(escolhidos.porto_origem)
  }
  if (escolhidos.nome_exportador != null && escolhidos.nome_exportador !== '') {
    next.exportador = String(escolhidos.nome_exportador)
  }
  return next
}

export function gerarPreviewConsolidacaoListaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
): PreviewConsolidacaoCompletoSimulador {
  const pedidosOrigem = resolverPedidosEnvolvidosConsolidacao(selecao, linhas)
  const itens = resolverItensParaConsolidar(pedidosOrigem, selecao)
  const campos_divergentes: CampoDivergenteConsolidacaoSimulador[] = []
  const campos_iguais: CampoIgualConsolidacaoSimulador[] = []

  for (const { campo, rotulo, grupo } of CAMPOS_COMPARAR_CONSOLIDACAO) {
    const valores = pedidosOrigem.map((p) => ({
      pedido_id: p.id,
      numero_pedido: p.numeroPedido,
      valor: lerValorCampoPedidoConsolidacao(p, campo),
    }))
    const unicos = new Set(valores.map((v) => String(v.valor ?? '')))
    if (unicos.size > 1) {
      campos_divergentes.push({
        campo,
        rotulo,
        grupo,
        valores,
        valor_sugerido: valores[0]?.valor ?? null,
      })
    } else {
      campos_iguais.push({ campo, rotulo, grupo, valor: valores[0]?.valor ?? null })
    }
  }

  const valorInteiros = new Set(selecao.pedidos.map((p) => p.id))
  const valorParcial = pedidosOrigem
    .filter((p) => !valorInteiros.has(p.id))
    .reduce((acc, p) => {
      const avulsos = filtrarItensAvulsosSelecao(selecao).filter(({ pai }) => pai.id === p.id)
      return acc + p.valorFob * (avulsos.length / Math.max(p.itens, 1))
    }, 0)
  const valorInteiro = selecao.pedidos.reduce((acc, p) => acc + p.valorFob, 0)

  return {
    pedidosOrigem,
    pedidos_info: pedidosOrigem.map((p) => ({
      id: p.id,
      numero: p.numeroPedido,
      total_itens: p.itens,
    })),
    campos_divergentes,
    campos_iguais,
    itens: montarItensPreviewConsolidacao(itens, pedidosOrigem),
    valor_total_soma: valorInteiro + valorParcial,
    moeda: pedidosOrigem[0]?.moeda ?? 'USD',
    numero_sugerido: gerarNumeroConsolidado(linhas),
    conflito_tipo_operacao: selecaoTemTiposOperacaoIncompativeis(selecao),
  }
}

export function consolidarSelecaoListaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
  opcoes: OpcoesConsolidacaoListaSimulador = {},
): {
  linhas: LinhaListaPedidoSimulador[]
  resumo: ResumoConsolidacaoListaSimulador
  idNovoPedido: string
} {
  const pedidosOrigem = resolverPedidosEnvolvidosConsolidacao(selecao, linhas)
  if (pedidosOrigem.length < 2) {
    throw new Error('Selecione ao menos 2 pedidos para consolidar')
  }
  if (selecaoTemTiposOperacaoIncompativeis(selecao)) {
    throw new Error('Não é possível consolidar pedidos de importação com exportação')
  }

  const idsInteiros = new Set(selecao.pedidos.map((p) => p.id))
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const idsItensConsolidados = new Set(itensAvulsos.map(({ item }) => item.id))
  const idsPedidosOrigem = new Set(pedidosOrigem.map((p) => p.id))

  let itensOrigem = resolverItensParaConsolidar(pedidosOrigem, selecao)
  if (itensOrigem.length === 0) {
    throw new Error('Nenhum item elegível para consolidação')
  }
  if (opcoes.fundirItensMesmoPartNumber) {
    itensOrigem = fundirItensPorPartNumber(itensOrigem)
  }

  const primeiro = pedidosOrigem[0]
  const novoId = `cons-${Date.now()}`
  const numeroConsolidado = (opcoes.numeroPedido?.trim() || gerarNumeroConsolidado(linhas))
  const hoje = new Date().toLocaleDateString('pt-BR')
  const valorFob = pedidosOrigem.reduce((acc, p) => acc + p.valorFob, 0)
  const status: StatusListaPedidoSimulador = 'CONSOLIDADO'

  let ctxPai: ContextoCamposPedidoListaSimulador = {
    id: novoId,
    numeroPedido: numeroConsolidado,
    tipoOperacao: primeiro.tipoOperacao,
    status,
    workspace: primeiro.workspace,
    exportador: primeiro.exportador,
    vincularExportador: false,
    incoterm: primeiro.incoterm,
    alertaIncoterm: pedidosOrigem.some((p) => p.alertaIncoterm),
    portoOrigem: primeiro.portoOrigem,
    valorFob,
    moeda: primeiro.moeda,
    dataAbertura: hoje,
    qtdItens: itensOrigem.length,
  }

  if (opcoes.camposEscolhidos) {
    ctxPai = aplicarCamposEscolhidosAoContexto(ctxPai, opcoes.camposEscolhidos)
  }

  const detalhesItens = montarItensConsolidados(itensOrigem, ctxPai, novoId, numeroConsolidado, status)
  const campos = popularCamposPedidoListaSimulador(ctxPai)
  if (opcoes.camposEscolhidos) {
    for (const [chave, valor] of Object.entries(opcoes.camposEscolhidos)) {
      if (valor != null && valor !== '') campos[chave] = String(valor)
    }
  }
  campos.ids_origem_consolidacao_pedido = pedidosOrigem.map((p) => p.numeroPedido).join(', ')
  campos.data_consolidacao_pedido = hoje
  campos.valor_total_pedido = valorFob.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const novaLinha: LinhaListaPedidoSimulador = {
    id: novoId,
    numeroPedido: numeroConsolidado,
    tipoOperacao: ctxPai.tipoOperacao,
    status,
    idEmpresa: primeiro.idEmpresa,
    workspace: ctxPai.workspace,
    exportador: ctxPai.exportador,
    vincularExportador: false,
    incoterm: ctxPai.incoterm,
    alertaIncoterm: ctxPai.alertaIncoterm,
    portoOrigem: ctxPai.portoOrigem,
    valorFob,
    moeda: ctxPai.moeda,
    dataAbertura: hoje,
    itens: detalhesItens.length,
    detalhesItens,
    campos,
  }

  const linhasAtualizadas = linhas
    .filter((linha) => !idsInteiros.has(linha.id))
    .map((linha) => {
      if (!idsPedidosOrigem.has(linha.id) || idsInteiros.has(linha.id)) return linha
      const detalhes = linha.detalhesItens.filter((item) => !idsItensConsolidados.has(item.id))
      if (detalhes.length === linha.detalhesItens.length) return linha
      return { ...linha, detalhesItens: detalhes, itens: detalhes.length }
    })
    .filter((linha) => linha.itens > 0)

  return {
    linhas: [novaLinha, ...linhasAtualizadas],
    idNovoPedido: novoId,
    resumo: {
      pedidosOrigem: pedidosOrigem.length,
      itensConsolidados: detalhesItens.length,
      numeroConsolidado,
      numerosPedidosOrigem: pedidosOrigem.map((p) => p.numeroPedido),
    },
  }
}

export function montarMensagemResumoConsolidacao(resumo: ResumoConsolidacaoListaSimulador): string {
  return `${resumo.numeroConsolidado} criado com ${resumo.itensConsolidados} item${
    resumo.itensConsolidados !== 1 ? 's' : ''
  } a partir de ${resumo.pedidosOrigem} pedido${resumo.pedidosOrigem !== 1 ? 's' : ''}`
}

export function mensagemToastConsolidacao(resumo: ResumoConsolidacaoListaSimulador): string {
  return `${montarMensagemResumoConsolidacao(resumo)} (simulação).`
}

export function fmtValorCampoConsolidacao(valor: string | number | null): string {
  if (valor == null || valor === '') return '—'
  return String(valor)
}

export type GrupoCamposConsolidacaoSimulador = {
  grupo: string
  divergentes: CampoDivergenteConsolidacaoSimulador[]
  iguais: CampoIgualConsolidacaoSimulador[]
}

export function agruparCamposConsolidacaoSimulador(
  divergentes: CampoDivergenteConsolidacaoSimulador[],
  iguais: CampoIgualConsolidacaoSimulador[],
): GrupoCamposConsolidacaoSimulador[] {
  const mapa = new Map<string, GrupoCamposConsolidacaoSimulador>()
  for (const d of divergentes) {
    const g = mapa.get(d.grupo) ?? { grupo: d.grupo, divergentes: [], iguais: [] }
    g.divergentes.push(d)
    mapa.set(d.grupo, g)
  }
  for (const i of iguais) {
    const g = mapa.get(i.grupo) ?? { grupo: i.grupo, divergentes: [], iguais: [] }
    g.iguais.push(i)
    mapa.set(i.grupo, g)
  }
  return [...mapa.values()]
}

export type PassoGuiaPosConsolidacaoSimulador = 1 | 2 | 3

const TOTAL_PASSOS_GUIA_POS_CONSOLIDACAO = 3

export function totalPassosGuiaPosConsolidacaoSimulador(): number {
  return TOTAL_PASSOS_GUIA_POS_CONSOLIDACAO
}

/** Uma coluna por passo: 1 = nº pedido + status, 2 = itens, 3 = valor total. */
export function colunasDestaqueGuiaPosConsolidacaoSimulador(
  passo: PassoGuiaPosConsolidacaoSimulador,
): readonly string[] {
  if (passo === 1) return ['numero_pedido', 'status']
  if (passo === 2) return ['numero_pedido', 'status']
  if (passo === 3) return ['valor_total_pedido']
  return []
}

export function celulaDestaqueGuiaPosConsolidacao(
  passo: PassoGuiaPosConsolidacaoSimulador,
  idPedidoConsolidado: string,
  pedidoId: string,
  colunaId: string,
  itemId?: string,
): boolean {
  if (!colunasDestaqueGuiaPosConsolidacaoSimulador(passo).includes(colunaId)) return false
  if (pedidoId !== idPedidoConsolidado) return false
  if (passo === 1 || passo === 3) return !itemId
  if (passo === 2) return Boolean(itemId)
  return false
}

export function rotuloPedidoGuiaPosConsolidacao(numero: string | undefined | null): string {
  const bruto = String(numero ?? '').trim()
  if (!bruto) return 'pedido consolidado'
  let codigo = bruto.replace(/^pedido\s+/i, '').trim()
  codigo = codigo.replace(/^PO-/i, 'PO ')
  return `pedido ${codigo}`
}

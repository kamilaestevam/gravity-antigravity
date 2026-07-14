import { atualizarCelulaListaSimulador } from './atualizar-celula-lista-simulador-pedido'
import type {
  DefinicaoCampoEdicaoMassaSimulador,
  NivelEdicaoMassaSimulador,
  OperacaoCampoMassaSimulador,
  TipoCampoEdicaoMassaSimulador,
} from './campos-edicao-massa-simulador-pedido'
import type {
  ItemListaPedidoSimulador,
  LinhaListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import { filtrarItensAvulsosSelecao } from './duplicar-excluir-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'

export type CampoEmEdicaoMassaSimulador = {
  uid: string
  campo: string
  tipo: TipoCampoEdicaoMassaSimulador
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampoMassaSimulador
  valor: string
}

export type AlteracaoPreviewEdicaoMassaSimulador = {
  campo: string
  valor_atual: string
  valor_novo: string
  item_id?: string
}

export type PreviewPorPedidoEdicaoMassaSimulador = {
  pedido_id: string
  pedido_numero: string
  alteracoes: AlteracaoPreviewEdicaoMassaSimulador[]
}

export type PreviewCampoEdicaoMassaSimulador = {
  campo: string
  valores_distintos: string[]
}

export type PreviewEdicaoMassaSimulador = {
  pedidos_afetados: number
  itens_afetados: number
  campos: PreviewCampoEdicaoMassaSimulador[]
  por_pedido: PreviewPorPedidoEdicaoMassaSimulador[]
}

export type ResumoEdicaoMassaListaSimulador = {
  pedidosAtualizados: number
  itensAtualizados: number
  camposAlterados: string[]
}

const VAZIO = '(vazio)'

function formatarExibicao(valor: string | null | undefined): string {
  if (valor == null || valor.trim() === '') return VAZIO
  return valor
}

function parseNumero(valor: string | null | undefined): number {
  if (!valor) return 0
  const limpo = valor.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : 0
}

function parseDataBr(valor: string): Date | null {
  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, dd, mm, yyyy] = m
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return Number.isNaN(dt.getTime()) ? null : dt
}

function formatarDataBr(dt: Date): string {
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${dt.getFullYear()}`
}

export function calcularNovoValorCampo(
  valorAtual: string | null | undefined,
  tipo: TipoCampoEdicaoMassaSimulador,
  operacao: OperacaoCampoMassaSimulador,
  valorEntrada: string,
): string {
  if (operacao === 'substituir') return valorEntrada

  if (tipo === 'numero') {
    const base = parseNumero(valorAtual)
    const delta = parseNumero(valorEntrada)
    if (operacao === 'somar') return String(base + delta)
    if (operacao === 'subtrair') return String(Math.max(0, base - delta))
    if (operacao === 'percentual') return String(base * (1 + delta / 100))
  }

  if (tipo === 'data') {
    const base = parseDataBr(valorAtual ?? '') ?? new Date()
    const dias = Number.parseInt(valorEntrada, 10) || 0
    const dt = new Date(base)
    if (operacao === 'avancar_dias') dt.setDate(dt.getDate() + dias)
    if (operacao === 'recuar_dias') dt.setDate(dt.getDate() - dias)
    return formatarDataBr(dt)
  }

  return valorEntrada
}

function lerValorPedido(linha: LinhaListaPedidoSimulador, campo: string): string | null {
  if (campo === 'status') return linha.status
  if (campo === 'tipo_operacao') return linha.tipoOperacao
  if (campo === 'id_workspace') return linha.workspace
  if (campo === 'incoterm') return linha.incoterm
  if (campo === 'porto_origem') return linha.portoOrigem
  if (campo === 'nome_exportador') return linha.exportador
  return linha.campos[campo] ?? null
}

function lerValorItem(item: ItemListaPedidoSimulador, campo: string): string | null {
  if (campo === 'status') return item.status
  if (campo === 'tipo_operacao') return item.tipoOperacao
  return item.campos[campo] ?? null
}

export type AlvoEdicaoMassaSimulador = {
  pedidosCompletos: LinhaListaPedidoSimulador[]
  itensAvulsos: Array<{ item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador }>
}

export function resolverAlvosEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
): AlvoEdicaoMassaSimulador {
  return {
    pedidosCompletos: selecao.pedidos,
    itensAvulsos: filtrarItensAvulsosSelecao(selecao),
  }
}

function itensNoEscopo(
  alvos: AlvoEdicaoMassaSimulador,
  nivel: NivelEdicaoMassaSimulador,
  campoNivel: 'pedido' | 'item',
): Array<{ item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador }> {
  const lista: Array<{ item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador }> = []

  if (campoNivel === 'item') {
    if (nivel === 'item' || nivel === 'combinado') {
      for (const pedido of alvos.pedidosCompletos) {
        for (const item of pedido.detalhesItens) lista.push({ item, pai: pedido })
      }
      for (const avulso of alvos.itensAvulsos) lista.push(avulso)
    }
  }

  return lista
}

export function gerarPreviewEdicaoMassaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
  nivel: NivelEdicaoMassaSimulador,
  campos: CampoEmEdicaoMassaSimulador[],
): PreviewEdicaoMassaSimulador {
  const alvos = resolverAlvosEdicaoMassaSimulador(selecao)
  const camposValidos = campos.filter((c) => c.valor.trim() !== '')
  const porPedidoMap = new Map<string, PreviewPorPedidoEdicaoMassaSimulador>()
  let itensAfetados = 0

  const ensurePedido = (pedido: LinhaListaPedidoSimulador) => {
    if (!porPedidoMap.has(pedido.id)) {
      porPedidoMap.set(pedido.id, {
        pedido_id: pedido.id,
        pedido_numero: pedido.numeroPedido,
        alteracoes: [],
      })
    }
    return porPedidoMap.get(pedido.id)!
  }

  for (const campoEdit of camposValidos) {
    const aplicaPedido =
      campoEdit.nivel === 'pedido' &&
      (nivel === 'pedido' || nivel === 'combinado') &&
      alvos.pedidosCompletos.length > 0

    if (aplicaPedido) {
      for (const pedido of alvos.pedidosCompletos) {
        const atual = lerValorPedido(pedido, campoEdit.campo)
        const novo = calcularNovoValorCampo(atual, campoEdit.tipo, campoEdit.operacao, campoEdit.valor)
        ensurePedido(pedido).alteracoes.push({
          campo: campoEdit.campo,
          valor_atual: formatarExibicao(atual),
          valor_novo: novo,
        })
      }
    }

    const aplicaItem = campoEdit.nivel === 'item' && (nivel === 'item' || nivel === 'combinado')
    if (aplicaItem) {
      const itens = itensNoEscopo(alvos, nivel, 'item')
      itensAfetados = itens.length
      for (const { item, pai } of itens) {
        const atual = lerValorItem(item, campoEdit.campo)
        const novo = calcularNovoValorCampo(atual, campoEdit.tipo, campoEdit.operacao, campoEdit.valor)
        ensurePedido(pai).alteracoes.push({
          campo: campoEdit.campo,
          valor_atual: formatarExibicao(atual),
          valor_novo: novo,
          item_id: item.id,
        })
      }
    }
  }

  const por_pedido = [...porPedidoMap.values()]
  const pedidos_afetados = por_pedido.length

  const camposPreview: PreviewCampoEdicaoMassaSimulador[] = camposValidos.map((c) => {
    const valores = new Set<string>()
    if (c.nivel === 'pedido') {
      for (const p of alvos.pedidosCompletos) valores.add(formatarExibicao(lerValorPedido(p, c.campo)))
    } else {
      for (const { item } of itensNoEscopo(alvos, nivel, 'item')) {
        valores.add(formatarExibicao(lerValorItem(item, c.campo)))
      }
    }
    return { campo: c.campo, valores_distintos: [...valores] }
  })

  if (itensAfetados === 0 && camposValidos.some((c) => c.nivel === 'item')) {
    itensAfetados = itensNoEscopo(alvos, nivel, 'item').length
  }

  return {
    pedidos_afetados,
    itens_afetados: itensAfetados,
    campos: camposPreview,
    por_pedido,
  }
}

export function aplicarEdicaoMassaListaSimulador(
  linhas: LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
  nivel: NivelEdicaoMassaSimulador,
  campos: CampoEmEdicaoMassaSimulador[],
): { linhas: LinhaListaPedidoSimulador[]; resumo: ResumoEdicaoMassaListaSimulador } {
  const preview = gerarPreviewEdicaoMassaSimulador(linhas, selecao, nivel, campos)
  let proximas = [...linhas]
  const camposAlterados = new Set<string>()
  let itensAtualizados = 0

  for (const bloco of preview.por_pedido) {
    for (const alt of bloco.alteracoes) {
      if (alt.valor_atual === alt.valor_novo) continue
      camposAlterados.add(alt.campo)
      if (alt.item_id) {
        proximas = atualizarCelulaListaSimulador(proximas, bloco.pedido_id, alt.campo, alt.valor_novo, alt.item_id)
        itensAtualizados += 1
      } else {
        proximas = atualizarCelulaListaSimulador(proximas, bloco.pedido_id, alt.campo, alt.valor_novo)
      }
    }
  }

  return {
    linhas: proximas,
    resumo: {
      pedidosAtualizados: preview.pedidos_afetados,
      itensAtualizados: itensAtualizados || preview.itens_afetados,
      camposAlterados: [...camposAlterados],
    },
  }
}

export function montarTituloModalEdicaoMassaSimulador(selecao: SelecaoListaSimuladorPedido): string {
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const nPed = selecao.pedidos.length
  const nItem = itensAvulsos.length
  if (nPed > 0 && nItem > 0) {
    return `Editar em massa · ${nPed} pedido${nPed !== 1 ? 's' : ''} e ${nItem} item${nItem !== 1 ? 's' : ''}`
  }
  if (nItem > 0 && nPed === 0) {
    return `Editar em massa · ${nItem} item${nItem !== 1 ? 's' : ''}`
  }
  return `Editar em massa · ${nPed} pedido${nPed !== 1 ? 's' : ''}`
}

export function mensagemToastEdicaoMassa(resumo: ResumoEdicaoMassaListaSimulador): string {
  const partes: string[] = []
  if (resumo.pedidosAtualizados > 0) {
    partes.push(`${resumo.pedidosAtualizados} pedido${resumo.pedidosAtualizados !== 1 ? 's' : ''}`)
  }
  if (resumo.itensAtualizados > 0) {
    partes.push(`${resumo.itensAtualizados} item${resumo.itensAtualizados !== 1 ? 's' : ''}`)
  }
  const alvo = partes.length > 0 ? partes.join(' e ') : 'registros'
  return `${alvo} atualizado(s) · ${resumo.camposAlterados.length} campo${resumo.camposAlterados.length !== 1 ? 's' : ''} (simulação).`
}

export function criarCampoEdicaoVazioSimulador(
  def: DefinicaoCampoEdicaoMassaSimulador,
): CampoEmEdicaoMassaSimulador {
  const tipoOps = {
    texto: ['substituir'],
    select: ['substituir'],
    ncm: ['substituir'],
    numero: ['substituir', 'somar', 'subtrair', 'percentual'],
    data: ['substituir', 'avancar_dias', 'recuar_dias'],
  } as const
  const ops = tipoOps[def.tipo]
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    campo: def.campo,
    tipo: def.tipo,
    nivel: def.nivel,
    operacao: ops[0],
    valor: '',
  }
}

export function detectarMultiplosValoresPedidoSimulador(
  pedidos: LinhaListaPedidoSimulador[],
  campo: string,
): boolean {
  const valores = pedidos.map((p) => formatarExibicao(lerValorPedido(p, campo)))
  return new Set(valores).size > 1
}

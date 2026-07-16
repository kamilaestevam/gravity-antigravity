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
  pedidosEscopo: LinhaListaPedidoSimulador[]
  pedidosCompletosIds: Set<string>
  itemIdsEscopo: Set<string> | null
}

export type EstatisticasEscopoEdicaoMassaSimulador = {
  pedidos: number
  itens: number
  inteiros: Array<{ numero: string; itens: number }>
  parciais: Array<{ numero: string; itensSel: number; itensTotal: number }>
}

/** Espelha `pedidosParaEdicaoMassa` em Pedidos.tsx — pedidos pais únicos no escopo. */
export function resolverPedidosParaEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
  linhas: readonly LinhaListaPedidoSimulador[],
): LinhaListaPedidoSimulador[] {
  if (selecao.pedidos.length === 0) {
    if (selecao.itens.length === 0) return []
    const idsPais = [...new Set(selecao.itens.map((i) => i.pai.id))]
    const mapa = new Map(linhas.map((l) => [l.id, l]))
    return idsPais.map((id) => mapa.get(id)).filter((p): p is LinhaListaPedidoSimulador => p != null)
  }
  if (selecao.itens.length === 0) return [...selecao.pedidos]

  const idsJaInclusos = new Set(selecao.pedidos.map((p) => p.id))
  const extras: LinhaListaPedidoSimulador[] = []
  for (const { pai } of selecao.itens) {
    if (!idsJaInclusos.has(pai.id)) {
      extras.push(pai)
      idsJaInclusos.add(pai.id)
    }
  }
  return extras.length > 0 ? [...selecao.pedidos, ...extras] : [...selecao.pedidos]
}

/** Espelha `itensSelecionadosIdsParaMassa` — null = todos os itens dos pedidos do escopo. */
export function resolverItensIdsEscopoEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
): string[] | null {
  if (selecao.itens.length === 0) return null
  if (selecao.pedidos.length === 0) {
    return selecao.itens.map((i) => i.item.id)
  }
  const idsSet = new Set<string>()
  for (const pedido of selecao.pedidos) {
    for (const item of pedido.detalhesItens) idsSet.add(item.id)
  }
  for (const { item } of selecao.itens) idsSet.add(item.id)
  return [...idsSet]
}

/** Espelha `pedidoIdsCompletoParaMassa` — pedidos com seleção integral (cabeçalho + todos os itens). */
export function resolverPedidoIdsCompletoEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
): Set<string> | null {
  if (selecao.pedidos.length === 0 || selecao.itens.length === 0) return null
  return new Set(selecao.pedidos.map((p) => p.id))
}

export function calcularEstatisticasEscopoEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
  linhas: readonly LinhaListaPedidoSimulador[],
): EstatisticasEscopoEdicaoMassaSimulador {
  const pedidosEscopo = resolverPedidosParaEdicaoMassaSimulador(selecao, linhas)
  const itemIdsEscopo = resolverItensIdsEscopoEdicaoMassaSimulador(selecao)
  const pedidosCompletos = resolverPedidoIdsCompletoEdicaoMassaSimulador(selecao)
  const temSelecaoItens = selecao.itens.length > 0

  let totalItens = 0
  const inteiros: EstatisticasEscopoEdicaoMassaSimulador['inteiros'] = []
  const parciais: EstatisticasEscopoEdicaoMassaSimulador['parciais'] = []

  if (!temSelecaoItens) {
    for (const pedido of pedidosEscopo) {
      const n = pedido.detalhesItens.length
      totalItens += n
      inteiros.push({ numero: pedido.numeroPedido, itens: n })
    }
  } else {
    const itensSel = new Set(itemIdsEscopo ?? [])
    for (const pedido of pedidosEscopo) {
      const totalPedido = pedido.detalhesItens.length
      if (pedidosCompletos?.has(pedido.id)) {
        totalItens += totalPedido
        inteiros.push({ numero: pedido.numeroPedido, itens: totalPedido })
      } else {
        const qtdSelecionada = pedido.detalhesItens.filter((i) => itensSel.has(i.id)).length
        totalItens += qtdSelecionada
        if (qtdSelecionada >= totalPedido && totalPedido > 0) {
          inteiros.push({ numero: pedido.numeroPedido, itens: totalPedido })
        } else if (qtdSelecionada > 0) {
          parciais.push({
            numero: pedido.numeroPedido,
            itensSel: qtdSelecionada,
            itensTotal: totalPedido,
          })
        }
      }
    }
  }

  return {
    pedidos: pedidosEscopo.length,
    itens: totalItens,
    inteiros,
    parciais,
  }
}

export function resolverAlvosEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
  linhas: readonly LinhaListaPedidoSimulador[],
): AlvoEdicaoMassaSimulador {
  const pedidosEscopo = resolverPedidosParaEdicaoMassaSimulador(selecao, linhas)
  const itemIdsArray = resolverItensIdsEscopoEdicaoMassaSimulador(selecao)
  const pedidosCompletos = resolverPedidoIdsCompletoEdicaoMassaSimulador(selecao)
  return {
    pedidosEscopo,
    pedidosCompletosIds: pedidosCompletos ?? new Set(pedidosEscopo.map((p) => p.id)),
    itemIdsEscopo: itemIdsArray ? new Set(itemIdsArray) : null,
  }
}

function itensNoEscopo(
  alvos: AlvoEdicaoMassaSimulador,
  nivel: NivelEdicaoMassaSimulador,
  campoNivel: 'pedido' | 'item',
): Array<{ item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador }> {
  const lista: Array<{ item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador }> = []

  if (campoNivel !== 'item' || nivel === 'pedido') return lista

  for (const pedido of alvos.pedidosEscopo) {
    const candidatos = alvos.itemIdsEscopo
      ? pedido.detalhesItens.filter((item) => alvos.itemIdsEscopo!.has(item.id))
      : pedido.detalhesItens
    for (const item of candidatos) lista.push({ item, pai: pedido })
  }

  return lista
}

function pedidosNoEscopoPedido(
  alvos: AlvoEdicaoMassaSimulador,
): LinhaListaPedidoSimulador[] {
  return alvos.pedidosEscopo
}

export function gerarPreviewEdicaoMassaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
  nivel: NivelEdicaoMassaSimulador,
  campos: CampoEmEdicaoMassaSimulador[],
): PreviewEdicaoMassaSimulador {
  const alvos = resolverAlvosEdicaoMassaSimulador(selecao, linhas)
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
      alvos.pedidosEscopo.length > 0

    if (aplicaPedido) {
      for (const pedido of pedidosNoEscopoPedido(alvos)) {
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
  const escopo = calcularEstatisticasEscopoEdicaoMassaSimulador(selecao, linhas)

  const camposPreview: PreviewCampoEdicaoMassaSimulador[] = camposValidos.map((c) => {
    const valores = new Set<string>()
    if (c.nivel === 'pedido') {
      for (const p of alvos.pedidosEscopo) valores.add(formatarExibicao(lerValorPedido(p, c.campo)))
    } else {
      for (const { item } of itensNoEscopo(alvos, nivel, 'item')) {
        valores.add(formatarExibicao(lerValorItem(item, c.campo)))
      }
    }
    return { campo: c.campo, valores_distintos: [...valores] }
  })

  const temCamposItem =
    camposValidos.some((c) => c.nivel === 'item') &&
    (nivel === 'item' || nivel === 'combinado')

  return {
    pedidos_afetados: escopo.pedidos,
    itens_afetados: temCamposItem ? itensAfetados : escopo.itens,
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

export function montarTituloModalEdicaoMassaSimulador(
  selecao: SelecaoListaSimuladorPedido,
  linhas: readonly LinhaListaPedidoSimulador[],
): string {
  const n = resolverPedidosParaEdicaoMassaSimulador(selecao, linhas).length
  return `Editar em massa · ${n} pedido${n !== 1 ? 's' : ''}`
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

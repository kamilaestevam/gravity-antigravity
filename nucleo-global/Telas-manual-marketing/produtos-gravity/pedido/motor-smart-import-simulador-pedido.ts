import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import type { ItemListaPedidoSimulador, LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import { EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO } from './dados-fornecedores-simulador-novo-pedido'
import {
  montarPreviewSmartImportSimuladorPedido,
  parseArquivoSmartImportSimuladorPedido,
} from './parsear-arquivo-smart-import-simulador-pedido'
import { ALIAS_CAMPO_IMPORTACAO_SIMULADOR } from './dados-smart-import-simulador-pedido'
import { popularCamposItemListaSimulador, popularCamposPedidoListaSimulador } from './popular-campos-lista-simulador-pedido'
import type {
  DecisaoDuplicataSimulador,
  SmartImportConfirmarSimulador,
  SmartImportLinhaSimulador,
  SmartImportPreviewSimulador,
  SmartImportResultadoSimulador,
} from './tipos-smart-import-simulador-pedido'

const WORKSPACE_POR_EMPRESA: Record<string, string> = {
  'filial-sc-importador': 'FILIAL SC',
  'matriz-sp-importador': 'MATRIZ SP',
  'filial-pr-exportador': 'FILIAL PR',
  'importador-ltda': 'IMPORTADOR LTDA',
  'exportador-ltda': 'EXPORTADOR LTDA',
}

function normalizarCampoImportacao(chave: string): string {
  return ALIAS_CAMPO_IMPORTACAO_SIMULADOR[chave] ?? chave
}

function normalizarDadosLinha(dados: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(dados)) {
    next[normalizarCampoImportacao(chave)] = valor
  }
  return next
}

function formatarValorLista(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatarNcmLista(raw: unknown): string | null {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (!d) return null
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`
}

function resolverNumeroPedidoLinha(
  linha: SmartImportLinhaSimulador,
  numerosEditados: Record<number, string> | undefined,
): string | null {
  const editado = numerosEditados?.[linha.linha_arquivo]
  if (editado?.trim()) return editado.trim()
  const bruto = linha.numero_pedido ?? linha.dados.numero_pedido
  return bruto ? String(bruto) : null
}

export function analisarArquivoSmartImportSimulador(arquivo: File): Promise<SmartImportPreviewSimulador> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      void (async () => {
        try {
          const parseado = await parseArquivoSmartImportSimuladorPedido(arquivo)
          resolve(montarPreviewSmartImportSimuladorPedido(parseado))
        } catch (err) {
          const ext = arquivo.name.split('.').pop()?.toLowerCase() ?? ''
          if (ext === 'pdf') {
            reject(new Error('PDF não é aceito no Smart Import — use Smart Docs para leitura de PDF'))
            return
          }
          reject(err)
        }
      })()
    }, 900)
  })
}

export function confirmarSmartImportSimulador(
  payload: SmartImportConfirmarSimulador,
): SmartImportResultadoSimulador {
  const linhasIncluidas = payload.linhas.filter((l) => payload.linhas_incluidas.includes(l.linha_arquivo))
  const erros = linhasIncluidas
    .filter((l) => l.status === 'erro')
    .map((l) => ({
      linha: l.linha_arquivo,
      motivo: l.alertas[0]?.mensagem ?? 'Linha inválida',
    }))

  let criados = 0
  let atualizados = 0
  let pulados = 0
  const ids_criados: string[] = []

  const grupos = new Map<string, SmartImportLinhaSimulador[]>()
  for (const linha of linhasIncluidas) {
    if (linha.status === 'erro') continue
    const numero = resolverNumeroPedidoLinha(linha, payload.numeros_editados)
    if (!numero) continue
    const decisao = payload.decisoes_duplicatas[numero]
    if (decisao === 'pular') {
      pulados += 1
      continue
    }
    const lista = grupos.get(numero) ?? []
    lista.push(linha)
    grupos.set(numero, lista)
  }

  for (const [numero, itensLinha] of grupos) {
    void itensLinha
    const decisao = payload.decisoes_duplicatas[numero]
    const id = `imp-${Date.now()}-${criados + atualizados + pulados}`
    ids_criados.push(id)
    if (decisao === 'sobrescrever') atualizados += 1
    else criados += 1
  }

  return {
    criados,
    atualizados,
    pulados,
    erros,
    ids_criados,
  }
}

export function montarLinhasImportacaoSmartImportSimulador(
  payload: SmartImportConfirmarSimulador,
  empresaAtiva: PerfilEmpresaSimulador | undefined,
  idsCriados: string[],
): LinhaListaPedidoSimulador[] {
  const linhasIncluidas = payload.linhas.filter((l) => payload.linhas_incluidas.includes(l.linha_arquivo))
  const grupos = new Map<string, SmartImportLinhaSimulador[]>()

  for (const linha of linhasIncluidas) {
    if (linha.status === 'erro') continue
    const numero = resolverNumeroPedidoLinha(linha, payload.numeros_editados)
    if (!numero) continue
    if (payload.decisoes_duplicatas[numero] === 'pular') continue
    const lista = grupos.get(numero) ?? []
    lista.push(linha)
    grupos.set(numero, lista)
  }

  const idEmpresa = empresaAtiva?.id ?? 'matriz-sp-importador'
  const workspace = WORKSPACE_POR_EMPRESA[idEmpresa] ?? empresaAtiva?.nome ?? 'MATRIZ SP'
  const saida: LinhaListaPedidoSimulador[] = []
  let idxId = 0

  for (const [numeroPedido, linhasGrupo] of grupos) {
    const id = idsCriados[idxId] ?? `imp-${Date.now()}-${idxId}`
    idxId += 1

    const linhaPedido = linhasGrupo.find((l) => String(l.dados.tipo_linha ?? '').toUpperCase() === 'PEDIDO')
    const linhasItem = linhasGrupo.filter((l) => String(l.dados.tipo_linha ?? '').toUpperCase() === 'ITEM')
    const linhasParaItens = linhasItem.length > 0 ? linhasItem : linhasGrupo

    const dadosPedido = normalizarDadosLinha(linhaPedido?.dados ?? linhasGrupo[0].dados)
    const moeda = String(dadosPedido.moeda_pedido ?? dadosPedido.moeda_item ?? 'USD')
    const exportador = String(dadosPedido.nome_exportador ?? '')
    const incoterm = String(dadosPedido.incoterm_pedido ?? dadosPedido.incoterm_item ?? '—')
    const tipoRaw = String(dadosPedido.tipo_operacao_pedido ?? 'importacao')
    const tipoOperacao = tipoRaw === 'exportacao' ? 'EXPORTAÇÃO' : 'IMPORTAÇÃO'

    const detalhesItens: ItemListaPedidoSimulador[] = linhasParaItens.map((linhaImp, idx) => {
      const dados = { ...dadosPedido, ...normalizarDadosLinha(linhaImp.dados) }
      const sequencia = idx + 1
      const numeroItem = `${numeroPedido}-${String(sequencia).padStart(2, '0')}`
      const qtd = Number(dados.quantidade_inicial_item) || 0
      const unit = Number(dados.valor_por_unidade_item) || 0

      const ctxItem = {
        id,
        numeroPedido,
        tipoOperacao,
        status: 'RASCUNHO' as const,
        workspace,
        exportador,
        vincularExportador: !exportador,
        incoterm,
        alertaIncoterm: !incoterm || incoterm === '—',
        portoOrigem: '—',
        valorFob: qtd * unit,
        moeda,
        dataAbertura: String(dados.data_emissao_pedido ?? ''),
        qtdItens: linhasGrupo.length,
        sequencia,
        numeroItem,
      }

      const campos = popularCamposItemListaSimulador(ctxItem)
      if (dados.part_number_item) campos.descricao_item = String(dados.part_number_item)
      if (dados.descricao_item) campos.descricao_item = String(dados.descricao_item)
      const ncm = formatarNcmLista(dados.ncm_item ?? dados.ncm)
      if (ncm) campos.ncm = ncm
      if (unit > 0) campos.valor_por_unidade_item = `${moeda} ${formatarValorLista(unit)}`
      if (qtd > 0) {
        campos.quantidade_total_pedido = String(qtd)
        campos.saldo_itens_do_pedido = String(qtd)
      }
      if (qtd > 0 && unit > 0) {
        campos.valor_total_pedido = `${moeda} ${formatarValorLista(qtd * unit)}`
      }
      if (dados.unidade_comercializada_item ?? dados.unidade_comercializada_pedido) {
        campos.unidade_comercializada_pedido = String(dados.unidade_comercializada_item ?? dados.unidade_comercializada_pedido)
      }
      campos.moeda_pedido = moeda
      campos.nome_exportador = exportador || null
      campos.incoterm = incoterm !== '—' ? incoterm : null

      return {
        id: `${id}-item-${sequencia}`,
        sequencia,
        numeroItem,
        alerta: linhaImp.status === 'aviso',
        tipoOperacao,
        status: 'RASCUNHO',
        campos,
      }
    })

    const valorFob = detalhesItens.reduce((sum, item) => {
      const unitStr = item.campos.valor_por_unidade_item ?? ''
      const qtdStr = item.campos.quantidade_total_pedido ?? '0'
      const unit = Number(String(unitStr).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
      const qtd = Number(qtdStr) || 0
      return sum + unit * qtd
    }, 0)

    const quantidadeTotal = detalhesItens.reduce(
      (sum, item) => sum + (Number(item.campos.quantidade_total_pedido) || 0),
      0,
    )

    const ctxPai = {
      id,
      numeroPedido,
      tipoOperacao,
      status: 'RASCUNHO' as const,
      workspace,
      exportador,
      vincularExportador: !exportador,
      incoterm,
      alertaIncoterm: !incoterm || incoterm === '—',
      portoOrigem: '—',
      valorFob,
      moeda,
      dataAbertura: String(dadosPedido.data_emissao_pedido ?? ''),
      qtdItens: detalhesItens.length,
    }

    const campos = popularCamposPedidoListaSimulador(ctxPai)
    campos.numero_pedido = numeroPedido
    campos.tipo_operacao = tipoOperacao
    campos.incoterm = incoterm !== '—' ? incoterm : null
    campos.moeda_pedido = moeda
    campos.nome_exportador = exportador || null
    campos.nome_importador = tipoOperacao === 'IMPORTAÇÃO'
      ? EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.nome_empresa
      : null
    if (valorFob > 0) campos.valor_total_pedido = `${moeda} ${formatarValorLista(valorFob)}`
    if (quantidadeTotal > 0) campos.quantidade_total_pedido = String(quantidadeTotal)
    if (dadosPedido.data_emissao_pedido) campos.data_emissao_pedido = String(dadosPedido.data_emissao_pedido)

    saida.push({
      id,
      numeroPedido,
      tipoOperacao,
      status: 'RASCUNHO',
      idEmpresa,
      workspace,
      exportador,
      vincularExportador: !exportador,
      incoterm,
      alertaIncoterm: !incoterm || incoterm === '—',
      portoOrigem: '—',
      valorFob,
      moeda,
      dataAbertura: String(dadosPedido.data_emissao_pedido ?? ''),
      itens: detalhesItens.length,
      detalhesItens,
      campos,
    })
  }

  return saida
}

export function calcularConflitosMapeamentoSimulador(
  mapeamento: SmartImportConfirmarSimulador['mapeamento_confirmado'],
): Array<{ campo_sistema: string; colunas_arquivo: string[] }> {
  const grupos = new Map<string, string[]>()
  for (const col of mapeamento) {
    if (!col.campo_sistema) continue
    if (col.nivel === 'ignorado') continue
    const arr = grupos.get(col.campo_sistema) ?? []
    arr.push(col.coluna_arquivo)
    grupos.set(col.campo_sistema, arr)
  }
  return Array.from(grupos.entries())
    .filter(([, cols]) => cols.length >= 2)
    .map(([campo_sistema, colunas_arquivo]) => ({ campo_sistema, colunas_arquivo }))
}

export function linhasSelecionaveisIniciaisSmartImport(
  preview: SmartImportPreviewSimulador,
): Set<number> {
  return new Set(
    preview.linhas
      .filter((l) => l.status !== 'erro')
      .map((l) => l.linha_arquivo),
  )
}

export function decisoesDuplicataIniciaisSmartImport(
  preview: SmartImportPreviewSimulador,
): Record<string, DecisaoDuplicataSimulador> {
  const decisoes: Record<string, DecisaoDuplicataSimulador> = {}
  for (const linha of preview.linhas) {
    if (
      linha.numero_pedido
      && linha.alertas.some((a) => a.tipo === 'duplicado_sistema')
      && !decisoes[linha.numero_pedido]
    ) {
      decisoes[linha.numero_pedido] = 'sobrescrever'
    }
  }
  return decisoes
}

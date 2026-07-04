/**
 * Converte LeituraSchema (snapshot Smart Read) → payload canônico Pedido + linha DE/PARA.
 */
import type {
  DetalheMapeamentoCampoSmartReadPedido,
  DetalheMapeamentoSmartReadPedido,
} from './conversao-leitura-pedido-smart-read-schema.js'

/** Subconjunto do LeituraSchema — evita import circular server↔shared. */
export type LeituraParaConversaoPedido = {
  id_leitura: string
  arquivos: Array<{
    resultado_extracao: Array<{
      tipo_documento: string | null
      dados: Record<string, unknown>
    }> | null
  }>
}

type GrupoPedidoExtraido = {
  numero_pedido: string
  dados_pedido: Record<string, unknown>
  itens: Record<string, unknown>[]
}

const REGRAS_PEDIDO: Array<{ caminhos: string[][]; campo: string }> = [
  { caminhos: [['document', 'documentNumber'], ['document', 'number']], campo: 'numero_pedido' },
  { caminhos: [['document', 'incoterm']], campo: 'incoterm_pedido' },
  { caminhos: [['currency', 'type'], ['payment', 'currency']], campo: 'codigo_moeda_pedido' },
  { caminhos: [['document', 'documentDate'], ['document', 'date']], campo: 'data_documento_proforma_pedido' },
  { caminhos: [['payment', 'terms']], campo: 'condicao_pagamento_pedido' },
]

const REGRAS_ITEM: Array<{ caminhos: string[][]; campo: string }> = [
  { caminhos: [['partNumber'], ['part_number']], campo: 'part_number_item' },
  { caminhos: [['quantity'], ['qty']], campo: 'quantidade_inicial_item' },
  {
    caminhos: [['description'], ['productDescription'], ['descriptions', 'portuguese']],
    campo: 'descricao_item',
  },
  { caminhos: [['ncm'], ['hsCode'], ['hs_code']], campo: 'ncm_item' },
  { caminhos: [['gross_weight'], ['weights', 'gross']], campo: 'peso_bruto_unitario_item' },
  { caminhos: [['net_weight'], ['weights', 'net']], campo: 'peso_liquido_unitario_item' },
  { caminhos: [['unitPrice'], ['price'], ['unit_price']], campo: 'valor_por_unidade_item' },
]

function lerCaminho(obj: Record<string, unknown>, segmentos: string[]): unknown {
  let atual: unknown = obj
  for (const seg of segmentos) {
    if (atual == null || typeof atual !== 'object') return undefined
    atual = (atual as Record<string, unknown>)[seg]
  }
  return atual
}

function valorTexto(valor: unknown): string | null {
  if (valor == null) return null
  const texto = String(valor).trim()
  return texto.length > 0 ? texto : null
}

function valorNumero(valor: unknown): number | null {
  if (valor == null || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function aplicarRegras(
  origem: Record<string, unknown>,
  prefixoCaminho: string,
  regras: Array<{ caminhos: string[][]; campo: string }>,
  destino: Record<string, unknown>,
  detalhe: DetalheMapeamentoCampoSmartReadPedido[],
): void {
  for (const regra of regras) {
    let encontrado: unknown
    let caminhoUsado = ''
    for (const caminho of regra.caminhos) {
      const v = lerCaminho(origem, caminho)
      if (v != null && String(v).trim() !== '') {
        encontrado = v
        caminhoUsado = `${prefixoCaminho}.${caminho.join('.')}`
        break
      }
    }
    if (encontrado == null) {
      detalhe.push({
        caminho_origem: `${prefixoCaminho}.{${regra.caminhos.map((c) => c.join('.')).join('|')}}`,
        campo_destino: regra.campo,
        valor_origem: null,
        valor_destino: null,
        status_mapeamento: 'ignorado',
        motivo: 'ausente_na_leitura',
      })
      continue
    }
    const ehNumero =
      regra.campo.includes('quantidade') ||
      regra.campo.includes('valor') ||
      regra.campo.includes('peso')
    const convertido = ehNumero ? valorNumero(encontrado) : valorTexto(encontrado)
    if (convertido == null) {
      detalhe.push({
        caminho_origem: caminhoUsado,
        campo_destino: regra.campo,
        valor_origem: encontrado,
        valor_destino: null,
        status_mapeamento: 'rejeitado',
        motivo: 'tipo_invalido',
      })
      continue
    }
    destino[regra.campo] = convertido
    detalhe.push({
      caminho_origem: caminhoUsado,
      campo_destino: regra.campo,
      valor_origem: encontrado,
      valor_destino: convertido,
      status_mapeamento: 'mapeado',
    })
  }
}

function extrairItensBrutos(dados: Record<string, unknown>): Record<string, unknown>[] {
  const candidatos = [dados.items, dados.goods, dados.lineItems]
  for (const c of candidatos) {
    if (Array.isArray(c) && c.length > 0) {
      return c.filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    }
  }
  return []
}

function resolverNumeroPedido(dados: Record<string, unknown>, fallback: string): string {
  for (const caminho of [
    ['document', 'documentNumber'],
    ['document', 'number'],
    ['invoice', 'number'],
    ['order', 'number'],
  ]) {
    const v = valorTexto(lerCaminho(dados, caminho))
    if (v) return v
  }
  return fallback
}

export type ResultadoConversaoLeituraPedido = {
  grupos: GrupoPedidoExtraido[]
  detalhe_mapeamento: DetalheMapeamentoSmartReadPedido
  erros_bloqueantes: string[]
}

export function converterLeituraParaPedido(leitura: LeituraParaConversaoPedido): ResultadoConversaoLeituraPedido {
  const detalheCampos: DetalheMapeamentoCampoSmartReadPedido[] = []
  const mapaGrupos = new Map<string, GrupoPedidoExtraido>()
  const erros: string[] = []

  leitura.arquivos.forEach((arquivo, idxArquivo) => {
    const extracao = arquivo.resultado_extracao ?? []
    extracao.forEach((doc, idxDoc) => {
      const dados = doc.dados ?? {}
      const prefixo = `arquivos[${idxArquivo}].resultado_extracao[${idxDoc}].dados`
      const numero = resolverNumeroPedido(dados, `SR-${leitura.id_leitura.slice(-8)}`)
      let grupo = mapaGrupos.get(numero)
      if (!grupo) {
        grupo = { numero_pedido: numero, dados_pedido: {}, itens: [] }
        mapaGrupos.set(numero, grupo)
        aplicarRegras(dados, prefixo, REGRAS_PEDIDO, grupo.dados_pedido, detalheCampos)
        grupo.dados_pedido.numero_pedido = numero
      }

      const itensBrutos = extrairItensBrutos(dados)
      if (itensBrutos.length === 0) {
        detalheCampos.push({
          caminho_origem: `${prefixo}.items`,
          campo_destino: null,
          valor_origem: null,
          valor_destino: null,
          status_mapeamento: 'pendente',
          motivo: 'nenhum_item_no_documento',
        })
        return
      }

      itensBrutos.forEach((itemBruto, idxItem) => {
        const item: Record<string, unknown> = {}
        aplicarRegras(itemBruto, `${prefixo}.items[${idxItem}]`, REGRAS_ITEM, item, detalheCampos)
        if (!item.part_number_item) {
          erros.push(
            `Item ${idxItem + 1} do documento ${doc.tipo_documento ?? idxDoc}: part_number ausente`,
          )
        }
        if (item.quantidade_inicial_item == null) {
          item.quantidade_inicial_item = 1
          detalheCampos.push({
            caminho_origem: `${prefixo}.items[${idxItem}].quantity`,
            campo_destino: 'quantidade_inicial_item',
            valor_origem: null,
            valor_destino: 1,
            status_mapeamento: 'mapeado',
            motivo: 'default_quantidade_1',
          })
        }
        grupo!.itens.push(item)
      })
    })
  })

  if (mapaGrupos.size === 0) {
    erros.push('Nenhum documento com dados extraídos na leitura')
  }

  return {
    grupos: [...mapaGrupos.values()],
    detalhe_mapeamento: { campos: detalheCampos, versao_contrato: 1 },
    erros_bloqueantes: erros,
  }
}

/**
 * agregar-caminhos-campos-dados-smart-read.ts
 * Achata `dados` / `data` do legado em caminhos (Exporter.nome) para catálogo de campos.
 */

const CHAVES_IGNORADAS = new Set(['accuracy', 'averageaccuracy', 'score', 'confidence', 'origem'])

export type CaminhoCampoDados = {
  caminho_campo: string
  preenchido: boolean
  tipo_valor: string
  valor_exemplo: string | null
}

function tipoValor(valor: unknown): string {
  if (valor === null) return 'null'
  if (Array.isArray(valor)) return 'array'
  return typeof valor
}

function valorExemploTexto(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'string') return valor.length > 120 ? `${valor.slice(0, 117)}…` : valor
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor)
  if (Array.isArray(valor)) return `[${valor.length} itens]`
  return '{objeto}'
}

function deveIgnorarChave(chave: string): boolean {
  return CHAVES_IGNORADAS.has(chave.toLowerCase())
}

export function listarCaminhosCamposDados(
  dados: Record<string, unknown> | null | undefined,
  prefixo = '',
): CaminhoCampoDados[] {
  if (!dados || typeof dados !== 'object') return []

  const saida: CaminhoCampoDados[] = []

  for (const [chave, valor] of Object.entries(dados)) {
    if (deveIgnorarChave(chave)) continue

    const caminho = prefixo ? `${prefixo}.${chave}` : chave

    if (valor !== null && typeof valor === 'object' && !Array.isArray(valor)) {
      saida.push(...listarCaminhosCamposDados(valor as Record<string, unknown>, caminho))
      continue
    }

    const preenchido =
      valor !== null &&
      valor !== undefined &&
      valor !== '' &&
      !(Array.isArray(valor) && valor.length === 0)

    saida.push({
      caminho_campo: caminho,
      preenchido,
      tipo_valor: tipoValor(valor),
      valor_exemplo: preenchido ? valorExemploTexto(valor) : null,
    })
  }

  return saida
}

export type EntradaCatalogoCampo = {
  caminho_campo: string
  tipo_documento: string
  ocorrencias: number
  preenchidos: number
  vazios: number
  tipos_valor: string[]
  arquivos_exemplo: string[]
  valor_exemplo: string | null
}

export type CatalogoCamposSmartRead = {
  gerado_em: string
  total_documentos_processados: number
  total_arquivos: number
  tipos_documento: string[]
  campos: EntradaCatalogoCampo[]
}

export function agregarEntradasCatalogo(
  acumulado: Map<string, EntradaCatalogoCampo>,
  params: {
    tipoDocumento: string
    caminhoCampo: string
    nomeArquivo: string
    preenchido: boolean
    tipoValor: string
    valorExemplo: string | null
  },
): void {
  const chave = `${params.tipoDocumento}\0${params.caminhoCampo}`
  const existente = acumulado.get(chave)
  if (!existente) {
    acumulado.set(chave, {
      caminho_campo: params.caminhoCampo,
      tipo_documento: params.tipoDocumento,
      ocorrencias: 1,
      preenchidos: params.preenchido ? 1 : 0,
      vazios: params.preenchido ? 0 : 1,
      tipos_valor: [params.tipoValor],
      arquivos_exemplo: [params.nomeArquivo],
      valor_exemplo: params.valorExemplo,
    })
    return
  }

  existente.ocorrencias += 1
  if (params.preenchido) existente.preenchidos += 1
  else existente.vazios += 1
  if (!existente.tipos_valor.includes(params.tipoValor)) {
    existente.tipos_valor.push(params.tipoValor)
  }
  if (existente.arquivos_exemplo.length < 5 && !existente.arquivos_exemplo.includes(params.nomeArquivo)) {
    existente.arquivos_exemplo.push(params.nomeArquivo)
  }
  if (!existente.valor_exemplo && params.valorExemplo) {
    existente.valor_exemplo = params.valorExemplo
  }
}

export function montarCatalogoCampos(
  acumulado: Map<string, EntradaCatalogoCampo>,
  meta: { totalDocumentos: number; totalArquivos: number },
): CatalogoCamposSmartRead {
  const campos = Array.from(acumulado.values()).sort((a, b) => {
    const tipo = a.tipo_documento.localeCompare(b.tipo_documento)
    if (tipo !== 0) return tipo
    return a.caminho_campo.localeCompare(b.caminho_campo)
  })
  const tipos = [...new Set(campos.map((c) => c.tipo_documento))].sort()

  return {
    gerado_em: new Date().toISOString(),
    total_documentos_processados: meta.totalDocumentos,
    total_arquivos: meta.totalArquivos,
    tipos_documento: tipos,
    campos,
  }
}

export function catalogoParaCsv(catalogo: CatalogoCamposSmartRead): string {
  const linhas = [
    'tipo_documento,caminho_campo,ocorrencias,preenchidos,vazios,tipos_valor,valor_exemplo,arquivos_exemplo',
  ]
  for (const item of catalogo.campos) {
    const cols = [
      item.tipo_documento,
      item.caminho_campo,
      String(item.ocorrencias),
      String(item.preenchidos),
      String(item.vazios),
      item.tipos_valor.join('|'),
      item.valor_exemplo ?? '',
      item.arquivos_exemplo.join('|'),
    ].map((c) => `"${c.replace(/"/g, '""')}"`)
    linhas.push(cols.join(','))
  }
  return linhas.join('\n')
}

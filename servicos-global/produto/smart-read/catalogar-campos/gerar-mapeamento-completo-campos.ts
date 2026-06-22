/**
 * Gera mapeamento completo legado → Gravity + label tela a partir de todos os JSONs em leituras/.
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listarCaminhosCamposDados } from '../server/src/lib/agregar-caminhos-campos-dados-smart-read.js'

const __dir = dirname(fileURLToPath(import.meta.url))

type LinhaMapeamento = {
  tipo_documento: string
  caminho_legado: string
  campo_gravity: string
  label_tela: string
  secao_tela: string
  sinonimos_legado: string
  arquivos_exemplo: string
  valor_exemplo: string
  status: 'mapeado' | 'pendente'
}

/** Regras: primeiro segmento ou caminho completo → metadados Gravity */
const REGRAS_SECAO: Array<{ match: RegExp; secao: string }> = [
  { match: /^document\b/i, secao: 'Documento' },
  { match: /^exporter\b/i, secao: 'Exportador' },
  { match: /^importer\b/i, secao: 'Importador' },
  { match: /^notify_party\b/i, secao: 'Notify party' },
  { match: /^carrier\b/i, secao: 'Transportadora' },
  { match: /^shipment\b/i, secao: 'Embarque' },
  { match: /^shipmentDetails\b/i, secao: 'Embarque' },
  { match: /^goods\b/i, secao: 'Mercadorias' },
  { match: /^containers\b/i, secao: 'Containers' },
  { match: /^containerNumbers\b/i, secao: 'Containers' },
  { match: /^lcl_cargo\b/i, secao: 'Carga LCL' },
  { match: /^packageSummary\b/i, secao: 'Resumo volumes' },
  { match: /^payment\b/i, secao: 'Pagamento' },
  { match: /^bankingDetails\b/i, secao: 'Dados bancários' },
  { match: /^currency\b/i, secao: 'Moeda' },
  { match: /^totals\b/i, secao: 'Totais' },
  { match: /^items\b/i, secao: 'Itens' },
  { match: /^additionalFields\b/i, secao: 'Campos adicionais' },
  { match: /^observations\b/i, secao: 'Observações' },
  { match: /^isSigned\b/i, secao: 'Documento' },
  { match: /^shipper\b/i, secao: 'Shipper' },
  { match: /^consignee\b/i, secao: 'Consignatário' },
  { match: /^issuer\b/i, secao: 'Emissor' },
  { match: /^flight\b/i, secao: 'Voo' },
  { match: /^routing\b/i, secao: 'Roteamento' },
  { match: /^charges\b/i, secao: 'Taxas' },
  { match: /^nf\b/i, secao: 'Nota fiscal' },
  { match: /^transportadora\b/i, secao: 'Transportadora' },
]

/** Caminho legado (regex) → { campo_gravity, label_tela } — ordem importa (mais específico primeiro) */
const REGRAS_CAMPO: Array<{ match: RegExp; campo: string; label: string }> = [
  { match: /document\.documentNumber$|^document\.number$/, campo: 'numero_documento', label: 'Número do documento' },
  { match: /document\.billOfLadingNumber$/, campo: 'numero_bl', label: 'Número do BL' },
  { match: /document\.masterBillOfLadingNumber$/, campo: 'numero_bl_master', label: 'Número do BL master' },
  { match: /document\.bookingReference$/, campo: 'referencia_booking', label: 'Referência booking' },
  { match: /document\.documentType$|^document\.type$/, campo: 'tipo_documento', label: 'Tipo do documento' },
  { match: /document\.documentDate$|^document\.date$/, campo: 'data_documento', label: 'Data do documento' },
  { match: /document\.shippedOnBoardDate$/, campo: 'data_embarque', label: 'Data shipped on board' },
  { match: /document\.incoterm$/, campo: 'incoterm', label: 'Incoterm' },
  { match: /document\.incotermLocation$/, campo: 'local_incoterm', label: 'Local incoterm' },
  { match: /document\.originCountry$/, campo: 'pais_origem', label: 'País de origem' },
  { match: /document\.countryOfAcquisition$/, campo: 'pais_aquisicao', label: 'País de aquisição' },
  { match: /document\.countryOfProvenance$/, campo: 'pais_procedencia', label: 'País de procedência' },
  { match: /\.name$/, campo: 'nome', label: 'Nome' },
  { match: /\.address$/, campo: 'endereco', label: 'Endereço' },
  { match: /\.country$/, campo: 'pais', label: 'País' },
  { match: /\.state$|\.state_province$/, campo: 'estado', label: 'Estado / UF' },
  { match: /\.city$/, campo: 'cidade', label: 'Cidade' },
  { match: /\.zipCode$|\.zip_code$/, campo: 'cep', label: 'CEP / Código postal' },
  { match: /\.taxId$/, campo: 'documento_fiscal', label: 'CNPJ / Tax ID' },
  { match: /\.cnpj$/, campo: 'cnpj', label: 'CNPJ' },
  { match: /\.phone$/, campo: 'telefone', label: 'Telefone' },
  { match: /\.email$/, campo: 'email', label: 'E-mail' },
  { match: /shipment\.vessel_name$|shipment\.vesselName$/, campo: 'nome_navio', label: 'Nome do navio' },
  { match: /shipment\.voyage_number$/, campo: 'numero_viagem', label: 'Número da viagem' },
  { match: /shipment\.port_of_origin$|shipment\.ports\.origin$|shipment\.ports\.loading$/, campo: 'porto_origem', label: 'Porto origem' },
  { match: /shipment\.port_of_destination$|shipment\.ports\.destination$|shipment\.ports\.discharge$/, campo: 'porto_destino', label: 'Porto destino' },
  { match: /shipment\.place_of_origin$/, campo: 'local_origem', label: 'Local origem' },
  { match: /shipment\.place_of_destination$/, campo: 'local_destino', label: 'Local destino' },
  { match: /shipment\.origin_country$/, campo: 'pais_origem_embarque', label: 'País origem embarque' },
  { match: /shipment\.destination_state$/, campo: 'estado_destino', label: 'Estado destino' },
  { match: /shipment\.marksAndNumbers$/, campo: 'marcas_numeros', label: 'Marcas e números' },
  { match: /shipment\.modal$|shipmentDetails\.transportMode$/, campo: 'modal_transporte', label: 'Modal de transporte' },
  { match: /shipment\.carrier$/, campo: 'transportadora', label: 'Transportadora' },
  { match: /shipment\.costs\.freight$/, campo: 'valor_frete', label: 'Frete' },
  { match: /shipment\.costs\.insurance$/, campo: 'valor_seguro', label: 'Seguro' },
  { match: /goods\.ncm_code$|\.ncm$/, campo: 'ncm', label: 'NCM' },
  { match: /goods\.hs_code$|\.hsCode$/, campo: 'hs_code', label: 'HS Code' },
  { match: /goods\.bl_description$/, campo: 'descricao_bl', label: 'Descrição BL' },
  { match: /goods\.total_packages$/, campo: 'total_volumes', label: 'Total de volumes' },
  { match: /goods\.package_unit$/, campo: 'unidade_volume', label: 'Unidade de volume' },
  { match: /goods\.shipment_gross_weight$/, campo: 'peso_bruto_total', label: 'Peso bruto total' },
  { match: /goods\.shipment_net_weight$/, campo: 'peso_liquido_total', label: 'Peso líquido total' },
  { match: /goods\.total_shipment_volume$/, campo: 'volume_total', label: 'Volume total' },
  { match: /goods\.volume_unit$/, campo: 'unidade_volume_cubico', label: 'Unidade cubagem' },
  { match: /containerNumbers$/, campo: 'numeros_container', label: 'Números de container' },
  { match: /container_number$/, campo: 'numero_container', label: 'Número do container' },
  { match: /container_type$/, campo: 'tipo_container', label: 'Tipo do container' },
  { match: /container_seal$/, campo: 'lacre_container', label: 'Lacre' },
  { match: /container_gross_weight$/, campo: 'peso_bruto_container', label: 'Peso bruto container' },
  { match: /container_net_weight$/, campo: 'peso_liquido_container', label: 'Peso líquido container' },
  { match: /container_volume$/, campo: 'volume_container', label: 'Volume container' },
  { match: /packageSummary\.totalGrossWeight$/, campo: 'peso_bruto_total', label: 'Peso bruto total' },
  { match: /packageSummary\.totalNetWeight$/, campo: 'peso_liquido_total', label: 'Peso líquido total' },
  { match: /packageSummary\.totalPackages$/, campo: 'total_volumes', label: 'Total de volumes' },
  { match: /packageSummary\.commercialUnit$/, campo: 'unidade_comercial', label: 'Unidade comercial' },
  { match: /payment\.terms$/, campo: 'condicao_pagamento', label: 'Condição de pagamento' },
  { match: /payment\.method$/, campo: 'metodo_pagamento', label: 'Método de pagamento' },
  { match: /currency\.type$/, campo: 'moeda', label: 'Moeda' },
  { match: /currency\.exchangeRate$/, campo: 'taxa_cambio', label: 'Taxa de câmbio' },
  { match: /bankingDetails\.bankName$/, campo: 'nome_banco', label: 'Nome do banco' },
  { match: /bankingDetails\.iban$/, campo: 'iban', label: 'IBAN' },
  { match: /bankingDetails\.swift$/, campo: 'swift', label: 'SWIFT' },
  { match: /items\[\]\.description$/, campo: 'descricao_item', label: 'Descrição item' },
  { match: /items\[\]\.gross_weight$/, campo: 'peso_bruto_item', label: 'Peso bruto item' },
  { match: /items\[\]\.net_weight$/, campo: 'peso_liquido_item', label: 'Peso líquido item' },
  { match: /items\[\]\.volume$/, campo: 'volume_item', label: 'Volume item' },
  { match: /items\[\]\.quantity$/, campo: 'quantidade_item', label: 'Quantidade item' },
  { match: /items\[\]\.shipper$/, campo: 'shipper_item', label: 'Shipper item' },
  { match: /items\[\]\.invoice$/, campo: 'invoice_item', label: 'Invoice item' },
  { match: /containers\[\]\.container_type$/, campo: 'tipo_container', label: 'Tipo do container' },
  { match: /containers\[\]\.container_number$/, campo: 'numero_container', label: 'Número do container' },
  { match: /containers\[\]\.container_seal$/, campo: 'lacre_container', label: 'Lacre' },
  { match: /containers\[\]\.container_gross_weight$/, campo: 'peso_bruto_container', label: 'Peso bruto container' },
  { match: /containers\[\]\.container_net_weight$/, campo: 'peso_liquido_container', label: 'Peso líquido container' },
  { match: /containers\[\]\.container_volume$/, campo: 'volume_container', label: 'Volume container' },
  { match: /containers\[\]\.dangerous_goods_indicator$/, campo: 'indicador_carga_perigosa', label: 'Carga perigosa' },
  { match: /containers\[\]\.dangerous_goods_class$/, campo: 'classe_carga_perigosa', label: 'Classe carga perigosa' },
  { match: /containers\[\]\.packaging\[\]\.type$/, campo: 'tipo_embalagem', label: 'Tipo embalagem' },
  { match: /containers\[\]\.packaging\[\]\.quantity$/, campo: 'quantidade_embalagem', label: 'Quantidade embalagem' },
  { match: /goods\.packaging_summary\[\]\.type$/, campo: 'tipo_embalagem_resumo', label: 'Tipo embalagem (resumo)' },
  { match: /goods\.packaging_summary\[\]\.total_quantity$/, campo: 'quantidade_embalagem_resumo', label: 'Qtd embalagem (resumo)' },
  { match: /items\..*\.descriptions\.portuguese$/, campo: 'descricao_item_pt', label: 'Descrição item (PT)' },
  { match: /items\..*\.productDescription$/, campo: 'descricao_produto', label: 'Descrição do produto' },
  { match: /items\..*\.partNumber$/, campo: 'codigo_peca', label: 'Código peça / Part number' },
  { match: /items\..*\.gross_weight$|items\..*\.weights\.gross$/, campo: 'peso_bruto_item', label: 'Peso bruto item' },
  { match: /items\..*\.net_weight$|items\..*\.weights\.net$/, campo: 'peso_liquido_item', label: 'Peso líquido item' },
  { match: /items\..*\.volume$/, campo: 'volume_item', label: 'Volume item' },
  { match: /items\..*\.quantity$/, campo: 'quantidade_item', label: 'Quantidade item' },
  { match: /observations$/, campo: 'observacoes', label: 'Observações' },
  { match: /isSigned$/, campo: 'documento_assinado', label: 'Documento assinado' },
]

function inferirSecao(caminho: string): string {
  const raiz = caminho.split('.')[0] ?? caminho
  for (const r of REGRAS_SECAO) {
    if (r.match.test(caminho) || r.match.test(raiz)) return r.secao
  }
  return 'Outros'
}

function humanizarUltimoSegmento(caminho: string): string {
  const leaf = caminho.split('.').pop() ?? caminho
  return leaf
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function mapearCampo(caminho: string, secao: string): { campo: string; label: string; status: 'mapeado' | 'pendente' } {
  if (caminho.startsWith('additionalFields.')) {
    const label = caminho.replace('additionalFields.', '')
    const slug = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
    return { campo: `campo_adicional_${slug}`, label, status: 'mapeado' }
  }

  for (const r of REGRAS_CAMPO) {
    if (r.match.test(caminho)) {
      const prefixo = secao
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
      return {
        campo: `${r.campo}_${prefixo}`.replace(/_documento_documento/g, '_documento'),
        label: `${r.label} (${secao})`,
        status: 'mapeado',
      }
    }
  }

  const slug = caminho
    .replace(/\[\d+\]/g, '_item')
    .replace(/\./g, '_')
    .toLowerCase()
  return {
    campo: slug,
    label: humanizarUltimoSegmento(caminho),
    status: 'pendente',
  }
}

function escCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function achatarDados(dados: Record<string, unknown> | null | undefined, prefixo = ''): string[] {
  if (!dados || typeof dados !== 'object') return []
  const saida: string[] = []
  for (const [chave, valor] of Object.entries(dados)) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    if (Array.isArray(valor)) {
      valor.forEach((item, indice) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          saida.push(...achatarDados(item as Record<string, unknown>, `${caminho}[${indice}]`))
        } else {
          saida.push(`${caminho}[${indice}]`)
        }
      })
    } else if (valor !== null && typeof valor === 'object') {
      saida.push(...achatarDados(valor as Record<string, unknown>, caminho))
    } else {
      saida.push(caminho)
    }
  }
  return saida
}

function coletarCamposComValor(
  dados: Record<string, unknown> | null | undefined,
): Array<{ caminho: string; valor: unknown; preenchido: boolean }> {
  const caminhosFlat = achatarDados(dados)
  const base = listarCaminhosCamposDados(dados)
  const mapaBase = new Map(base.map((c) => [c.caminho_campo, c]))

  const saida: Array<{ caminho: string; valor: unknown; preenchido: boolean }> = []
  const vistos = new Set<string>()
  for (const caminho of caminhosFlat) {
    const normalizado = caminho.replace(/\[\d+\]/g, '[]')
    if (vistos.has(normalizado)) continue
    vistos.add(normalizado)
    const existente = mapaBase.get(normalizado) ?? mapaBase.get(caminho)
    if (existente) {
      saida.push({ caminho: normalizado, valor: existente.valor_exemplo, preenchido: existente.preenchido })
      continue
    }
    // valor direto de array flatten
    const valor = obterValorPorCaminho(dados, caminho)
    const preenchido = valor !== null && valor !== undefined && valor !== ''
    saida.push({ caminho: normalizado, valor, preenchido })
  }
  return saida
}

function obterValorPorCaminho(obj: Record<string, unknown>, caminho: string): unknown {
  const partes = caminho.replace(/\[\d+\]/g, (m) => m).split(/\.|\[|\]/).filter(Boolean)
  let atual: unknown = obj
  for (const p of partes) {
    if (atual === null || atual === undefined) return undefined
    if (Array.isArray(atual)) {
      atual = atual[Number(p)]
    } else if (typeof atual === 'object') {
      atual = (atual as Record<string, unknown>)[p]
    } else return undefined
  }
  return atual
}

async function coletarLeituras(): Promise<
  Map<string, { arquivos: Set<string>; exemplos: string[]; preenchido: boolean }>
> {
  const dirs = [
    join(__dir, 'leituras'),
    join(__dir, 'invoices-analise/leituras'),
  ]
  const indice = new Map<string, { arquivos: Set<string>; exemplos: string[]; preenchido: boolean }>()

  for (const dir of dirs) {
    let files: string[] = []
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
    } catch {
      continue
    }

    for (const f of files) {
      const bruto = JSON.parse(await readFile(join(dir, f), 'utf8')) as {
        gravity?: {
          arquivos?: Array<{
            resultado_extracao?: Array<{ tipo_documento?: string | null; dados?: Record<string, unknown> }> | null
          }>
        }
      }
      const nomeArq = f.split('__')[0] ?? f

      for (const arq of bruto.gravity?.arquivos ?? []) {
        for (const ext of arq.resultado_extracao ?? []) {
          const tipo = ext.tipo_documento ?? 'SEM_TIPO'
          for (const c of coletarCamposComValor(ext.dados)) {
            const chave = `${tipo}|${c.caminho}`
            if (!indice.has(chave)) {
              indice.set(chave, { arquivos: new Set(), exemplos: [], preenchido: false })
            }
            const ent = indice.get(chave)!
            ent.arquivos.add(nomeArq)
            if (c.preenchido) ent.preenchido = true
            const ex = c.valor != null ? String(c.valor).slice(0, 120) : ''
            if (ex && ent.exemplos.length < 2 && !ent.exemplos.includes(ex)) {
              ent.exemplos.push(ex)
            }
          }
        }
      }
    }
  }

  return indice
}

function agruparSinonimos(linhas: LinhaMapeamento[]): LinhaMapeamento[] {
  const porGravity = new Map<string, LinhaMapeamento[]>()
  for (const l of linhas) {
    const k = `${l.tipo_documento}|${l.campo_gravity}|${l.secao_tela}`
    if (!porGravity.has(k)) porGravity.set(k, [])
    porGravity.get(k)!.push(l)
  }

  return linhas.map((l) => {
    const grupo = porGravity.get(`${l.tipo_documento}|${l.campo_gravity}|${l.secao_tela}`) ?? [l]
    const outros = grupo.filter((g) => g.caminho_legado !== l.caminho_legado).map((g) => g.caminho_legado)
    return { ...l, sinonimos_legado: outros.join(' · ') }
  })
}

async function main() {
  const indice = await coletarLeituras()
  const linhas: LinhaMapeamento[] = []

  for (const [chave, meta] of [...indice.entries()].sort()) {
    const [tipo, caminho] = chave.split('|')
    const secao = inferirSecao(caminho)
    const { campo, label, status } = mapearCampo(caminho, secao)
    linhas.push({
      tipo_documento: tipo,
      caminho_legado: caminho,
      campo_gravity: campo,
      label_tela: label,
      secao_tela: secao,
      sinonimos_legado: '',
      arquivos_exemplo: [...meta.arquivos].sort().join('; '),
      valor_exemplo: meta.exemplos[0] ?? '',
      status,
    })
  }

  const linhasComSinonimos = agruparSinonimos(linhas)

  const csvHeader =
    'tipo_documento,caminho_legado,campo_gravity,label_tela,secao_tela,sinonimos_legado,arquivos_exemplo,valor_exemplo,status'
  const csv = [
    csvHeader,
    ...linhasComSinonimos.map((l) =>
      [
        escCsv(l.tipo_documento),
        escCsv(l.caminho_legado),
        escCsv(l.campo_gravity),
        escCsv(l.label_tela),
        escCsv(l.secao_tela),
        escCsv(l.sinonimos_legado),
        escCsv(l.arquivos_exemplo),
        escCsv(l.valor_exemplo),
        escCsv(l.status),
      ].join(','),
    ),
  ].join('\n')

  await writeFile(join(__dir, 'mapeamento-campos-completo.csv'), csv, 'utf8')

  const tipos = [...new Set(linhas.map((l) => l.tipo_documento))].sort()
  const pendente = linhas.filter((l) => l.status === 'pendente').length

  let md = `# Atlas Smart Read — Mapeamento completo campos legado → Gravity

> Gerado automaticamente a partir dos JSONs em \`catalogar-campos/leituras/\` e \`invoices-analise/leituras/\`.
> Total: **${linhas.length}** caminhos · **${tipos.length}** tipos documento · **${pendente}** pendentes de revisão manual.

## Tipos documento

${tipos.map((t) => `- \`${t}\``).join('\n')}

## Como ler

| Coluna | Significado |
|---|---|
| caminho_legado | Chave no JSON do legado (IA) |
| campo_gravity | Nome canônico proposto (contrato/tela) |
| label_tela | Texto exibido na conferência |
| secao_tela | Agrupamento na UI |
| sinonimos_legado | Outros caminhos legado que mapeiam para o mesmo campo_gravity |

---

`

  for (const tipo of tipos) {
    const doTipo = linhasComSinonimos.filter((l) => l.tipo_documento === tipo)
    const secoes = [...new Set(doTipo.map((l) => l.secao_tela))].sort()
    md += `## ${tipo}\n\n`
    for (const secao of secoes) {
      const rows = doTipo.filter((l) => l.secao_tela === secao)
      md += `### ${secao}\n\n`
      md += '| caminho_legado | campo_gravity | label_tela | sinonimos | status |\n'
      md += '|---|---|---|---|---|\n'
      for (const r of rows) {
        md += `| \`${r.caminho_legado}\` | \`${r.campo_gravity}\` | ${r.label_tela} | ${r.sinonimos_legado || '—'} | ${r.status} |\n`
      }
      md += '\n'
    }
  }

  const atlasDir = join(__dir, '../../../../documentos-tecnicos/ddd-atlas/smart-read')
  await mkdir(atlasDir, { recursive: true })
  await writeFile(join(atlasDir, '01-mapeamento-campos-legado.md'), md, 'utf8')

  console.log(`Mapeamento: ${linhas.length} linhas`)
  console.log(`  CSV: catalogar-campos/mapeamento-campos-completo.csv`)
  console.log(`  MD:  documentos-tecnicos/ddd-atlas/smart-read/01-mapeamento-campos-legado.md`)
  console.log(`  Pendentes: ${pendente}`)
}

main().catch(console.error)

import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listarCaminhosCamposDados } from '../server/src/lib/agregar-caminhos-campos-dados-smart-read.js'

const __dir = dirname(fileURLToPath(import.meta.url))

const GRUPOS: Record<string, string[]> = {
  'Número do documento': [
    'document.number',
    'document.documentNumber',
    'document.invoiceNumber',
    'invoiceNumber',
  ],
  'Tipo do documento': ['document.type', 'document.documentType'],
  'Data do documento': ['document.date', 'document.documentDate', 'document.invoiceDate'],
  Incoterm: ['document.incoterm', 'incoterm'],
  'Local incoterm': ['document.incotermLocation', 'incotermLocation'],
  'País origem': ['document.originCountry', 'originCountry', 'document.countryOfOrigin'],
  'Nome exportador': ['exporter.name', 'seller.name', 'shipper.name', 'vendor.name'],
  'Endereço exportador': ['exporter.address', 'seller.address', 'shipper.address'],
  'País exportador': ['exporter.country', 'seller.country', 'shipper.country'],
  'Nome importador': ['importer.name', 'buyer.name', 'consignee.name', 'customer.name'],
  'Endereço importador': ['importer.address', 'buyer.address', 'consignee.address'],
  Moeda: ['currency.type', 'currency.code', 'document.currency'],
  'Total geral': ['totals.grandTotal', 'totalAmount', 'totals.total', 'payment.total'],
  'Peso bruto total': ['packageSummary.totalGrossWeight', 'totalGrossWeight', 'totals.grossWeight'],
  'Peso líquido total': ['packageSummary.totalNetWeight', 'totalNetWeight', 'totals.netWeight'],
  'Termos pagamento': ['payment.terms', 'payment.method', 'payment.paymentTerms'],
}

function grupoSemantico(caminho: string): string {
  const n = caminho.toLowerCase()
  for (const [grupo, paths] of Object.entries(GRUPOS)) {
    if (paths.some((p) => n === p || n.endsWith(`.${p}`))) return grupo
  }
  return `Outros › ${caminho.split('.').slice(0, -1).join('.') || caminho}`
}

async function main() {
  const dir = join(__dir, 'invoices-analise/leituras')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'))

  type DocInfo = { tipo: string; campos: Map<string, string | null> }
  const porArquivo = new Map<string, DocInfo[]>()

  for (const f of files) {
    const bruto = JSON.parse(await readFile(join(dir, f), 'utf8')) as {
      gravity?: { arquivos?: Array<{ resultado_extracao?: Array<{ tipo_documento?: string | null; dados?: Record<string, unknown> }> | null }> }
    }
    const nome = f.split('__')[0] ?? f
    const docs: DocInfo[] = []
    for (const arq of bruto.gravity?.arquivos ?? []) {
      for (const ext of arq.resultado_extracao ?? []) {
        const campos = new Map<string, string | null>()
        for (const c of listarCaminhosCamposDados(ext.dados)) {
          if (c.preenchido) campos.set(c.caminho_campo, c.valor_exemplo)
        }
        docs.push({ tipo: ext.tipo_documento ?? 'SEM_TIPO', campos })
      }
    }
    porArquivo.set(nome, docs)
  }

  const semMap = new Map<
    string,
    { caminhos: Set<string>; ocorrencias: Set<string>; exemplos: string[] }
  >()

  for (const [arq, docs] of porArquivo) {
    for (const doc of docs) {
      for (const [caminho, ex] of doc.campos) {
        const sem = grupoSemantico(caminho)
        if (!semMap.has(sem)) semMap.set(sem, { caminhos: new Set(), ocorrencias: new Set(), exemplos: [] })
        const g = semMap.get(sem)!
        g.caminhos.add(caminho)
        g.ocorrencias.add(`${arq} (${doc.tipo})`)
        if (ex && !g.exemplos.includes(ex) && g.exemplos.length < 3) g.exemplos.push(ex)
      }
    }
  }

  console.log('RESUMO ARQUIVOS')
  for (const [a, docs] of porArquivo) {
    console.log(`  ${a}: ${docs.map((d) => d.tipo).join(', ')}`)
  }

  console.log('\nSINONIMOS|grupo|caminhos_legado|qtd_caminhos|arquivos|exemplo')
  const conflitos = [...semMap.entries()]
    .filter(([, v]) => v.caminhos.size > 1)
    .sort((a, b) => b[1].caminhos.size - a[1].caminhos.size)

  for (const [sem, v] of conflitos) {
    console.log(
      `SINONIMOS|${sem}|${[...v.caminhos].join(' · ')}|${v.caminhos.size}|${[...v.ocorrencias].join('; ')}|${v.exemplos[0] ?? ''}`,
    )
  }

  console.log('\nCAMPOS_POR_TIPO|tipo|total_caminhos_unicos')
  const porTipo = new Map<string, Set<string>>()
  for (const [, docs] of porArquivo) {
    for (const doc of docs) {
      if (!porTipo.has(doc.tipo)) porTipo.set(doc.tipo, new Set())
      for (const c of doc.campos.keys()) porTipo.get(doc.tipo)!.add(c)
    }
  }
  for (const [tipo, paths] of [...porTipo.entries()].sort()) {
    console.log(`CAMPOS_POR_TIPO|${tipo}|${paths.size}`)
  }

  console.log('\nCAMPOS_SO_INVOICE|presente_em_invoice|ausente_em_packing')
  const inv = porTipo.get('INVOICE') ?? new Set()
  const pl = porTipo.get('PACKING_LIST') ?? new Set()
  const soInvoice = [...inv].filter((p) => !pl.has(p))
  console.log(`  ${soInvoice.length} caminhos exclusivos de INVOICE`)
  const soPacking = [...pl].filter((p) => !inv.has(p))
  console.log(`  ${soPacking.length} caminhos exclusivos de PACKING_LIST`)
  const compartilhados = [...inv].filter((p) => pl.has(p))
  console.log(`  ${compartilhados.length} caminhos em comum`)
}

main().catch(console.error)

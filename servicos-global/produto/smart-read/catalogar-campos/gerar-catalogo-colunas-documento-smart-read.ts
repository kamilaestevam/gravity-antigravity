/**
 * gerar-catalogo-colunas-documento-smart-read.ts
 *
 * Lê `mapeamento-campos-completo.csv` (catálogo de campos legado → Gravity) e emite
 * o catálogo de COLUNAS da lista do Smart Read, consolidando por `campo_gravity`
 * (uma coluna única de negócio, ainda que o campo apareça em vários tipos de documento).
 *
 * Saída commitada: `client/src/shared/catalogo-colunas-documento-smart-read.ts`
 *
 * Rodar: `npx tsx catalogar-campos/gerar-catalogo-colunas-documento-smart-read.ts`
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))

type LinhaCsv = {
  tipo_documento: string
  caminho_legado: string
  campo_gravity: string
  label_tela: string
  secao_tela: string
  sinonimos_legado: string
  status: string
}

/** Parser CSV simples com suporte a campos entre aspas e aspas escapadas (""). */
function parsearCsv(conteudo: string): string[][] {
  const linhas: string[][] = []
  let campo = ''
  let registro: string[] = []
  let dentroAspas = false

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i]
    if (dentroAspas) {
      if (c === '"') {
        if (conteudo[i + 1] === '"') {
          campo += '"'
          i++
        } else {
          dentroAspas = false
        }
      } else {
        campo += c
      }
      continue
    }
    if (c === '"') {
      dentroAspas = true
    } else if (c === ',') {
      registro.push(campo)
      campo = ''
    } else if (c === '\n') {
      registro.push(campo)
      linhas.push(registro)
      registro = []
      campo = ''
    } else if (c === '\r') {
      // ignora CR
    } else {
      campo += c
    }
  }
  if (campo.length > 0 || registro.length > 0) {
    registro.push(campo)
    linhas.push(registro)
  }
  return linhas
}

type ColunaConsolidada = {
  key: string
  label: string
  secao: string
  tipos: Set<string>
  caminhos: Set<string>
  status: 'mapeado' | 'pendente'
}

function contarMaisFrequente(valores: string[]): string {
  const cont = new Map<string, number>()
  for (const v of valores) cont.set(v, (cont.get(v) ?? 0) + 1)
  let melhor = valores[0] ?? ''
  let max = -1
  for (const [v, n] of cont) {
    if (n > max) {
      max = n
      melhor = v
    }
  }
  return melhor
}

async function main() {
  const csvPath = join(__dir, 'mapeamento-campos-completo.csv')
  const conteudo = await readFile(csvPath, 'utf8')
  const linhas = parsearCsv(conteudo)

  const cabecalho = linhas[0]
  const idx = (nome: string) => cabecalho.indexOf(nome)
  const iTipo = idx('tipo_documento')
  const iCaminho = idx('caminho_legado')
  const iCampo = idx('campo_gravity')
  const iLabel = idx('label_tela')
  const iSecao = idx('secao_tela')
  const iSin = idx('sinonimos_legado')
  const iStatus = idx('status')

  const registros: LinhaCsv[] = linhas
    .slice(1)
    .filter((l) => l.length > iStatus && l[iCampo])
    .map((l) => ({
      tipo_documento: l[iTipo] ?? '',
      caminho_legado: l[iCaminho] ?? '',
      campo_gravity: l[iCampo] ?? '',
      label_tela: l[iLabel] ?? '',
      secao_tela: l[iSecao] ?? '',
      sinonimos_legado: l[iSin] ?? '',
      status: l[iStatus] ?? '',
    }))

  // Acumula labels/secoes por campo para escolher o mais frequente.
  const labelsPorCampo = new Map<string, string[]>()
  const secoesPorCampo = new Map<string, string[]>()
  const colunas = new Map<string, ColunaConsolidada>()

  for (const r of registros) {
    if (!colunas.has(r.campo_gravity)) {
      colunas.set(r.campo_gravity, {
        key: r.campo_gravity,
        label: r.label_tela,
        secao: r.secao_tela,
        tipos: new Set(),
        caminhos: new Set(),
        status: 'pendente',
      })
      labelsPorCampo.set(r.campo_gravity, [])
      secoesPorCampo.set(r.campo_gravity, [])
    }
    const col = colunas.get(r.campo_gravity)!
    col.tipos.add(r.tipo_documento)
    if (r.caminho_legado) col.caminhos.add(r.caminho_legado.replace(/\[\d+\]/g, '[]'))
    for (const sin of r.sinonimos_legado.split('·').map((s) => s.trim()).filter(Boolean)) {
      col.caminhos.add(sin.replace(/\[\d+\]/g, '[]'))
    }
    if (r.status === 'mapeado') col.status = 'mapeado'
    labelsPorCampo.get(r.campo_gravity)!.push(r.label_tela)
    secoesPorCampo.get(r.campo_gravity)!.push(r.secao_tela)
  }

  for (const [campo, col] of colunas) {
    col.label = contarMaisFrequente(labelsPorCampo.get(campo)!.filter(Boolean))
    col.secao = contarMaisFrequente(secoesPorCampo.get(campo)!.filter(Boolean))
  }

  const ordenadas = [...colunas.values()].sort((a, b) => {
    if (a.secao !== b.secao) return a.secao.localeCompare(b.secao, 'pt-BR')
    return a.label.localeCompare(b.label, 'pt-BR')
  })

  const tiposTotais = [...new Set(registros.map((r) => r.tipo_documento))].sort()

  const entradasTs = ordenadas
    .map((c) => {
      const tipos = [...c.tipos].sort().map((t) => JSON.stringify(t)).join(', ')
      const caminhos = [...c.caminhos].sort().map((p) => JSON.stringify(p)).join(', ')
      return `  { key: ${JSON.stringify(c.key)}, label: ${JSON.stringify(c.label)}, secao: ${JSON.stringify(c.secao)}, tipos: [${tipos}], caminhos: [${caminhos}], status: ${JSON.stringify(c.status)} },`
    })
    .join('\n')

  const ts = `/**
 * catalogo-colunas-documento-smart-read.ts — GERADO AUTOMATICAMENTE. NÃO EDITAR À MÃO.
 *
 * Fonte: catalogar-campos/mapeamento-campos-completo.csv
 * Gerador: catalogar-campos/gerar-catalogo-colunas-documento-smart-read.ts
 *
 * Catálogo de colunas possíveis na lista do Smart Read, consolidado por campo de
 * negócio (\`key\` = campo_gravity). Cada coluna conhece em quais tipos de documento
 * aparece (\`tipos\`) e quais caminhos do JSON legado a alimentam (\`caminhos\`).
 *
 * Total: ${ordenadas.length} colunas · ${tiposTotais.length} tipos de documento.
 */

export type TipoDocumentoSmartRead = ${tiposTotais.map((t) => JSON.stringify(t)).join(' | ')}

export type StatusMapeamentoColunaSmartRead = 'mapeado' | 'pendente'

export type ColunaDocumentoCatalogoSmartRead = {
  /** Id estável da coluna (campo_gravity DDD). */
  key: string
  /** Rótulo exibido no cabeçalho/seletor. */
  label: string
  /** Seção de agrupamento (Exportador, Mercadorias, Taxas…). */
  secao: string
  /** Tipos de documento em que a coluna aparece. */
  tipos: string[]
  /** Caminhos canônicos no JSON legado que alimentam o valor da coluna. */
  caminhos: string[]
  /** \`mapeado\` (regra DDD validada) ou \`pendente\` (slug automático). */
  status: StatusMapeamentoColunaSmartRead
}

export const CATALOGO_COLUNAS_DOCUMENTO_SMART_READ: ColunaDocumentoCatalogoSmartRead[] = [
${entradasTs}
]

export const TIPOS_DOCUMENTO_SMART_READ: string[] = [${tiposTotais
    .map((t) => JSON.stringify(t))
    .join(', ')}]
`

  const saida = join(
    __dir,
    '../client/src/shared/catalogo-colunas-documento-smart-read.ts',
  )
  await writeFile(saida, ts, 'utf8')

  console.log(`Catálogo de colunas gerado: ${ordenadas.length} colunas, ${tiposTotais.length} tipos.`)
  console.log(`  Saída: client/src/shared/catalogo-colunas-documento-smart-read.ts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

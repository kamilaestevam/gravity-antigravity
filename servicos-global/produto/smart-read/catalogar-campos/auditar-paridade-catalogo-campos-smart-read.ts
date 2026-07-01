/**
 * auditar-paridade-catalogo-campos-smart-read.ts
 * Varre mapeamento-campos-completo.csv e mede paridade conferência × catálogo legado.
 *
 * Uso: npx tsx servicos-global/produto/smart-read/catalogar-campos/auditar-paridade-catalogo-campos-smart-read.ts
 */
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extrairSecoesConferenciaLeitura } from '../client/src/shared/extrair-secoes-conferencia-leitura-smart-read.ts'
import {
  auditarParidadeConferenciaDatiGravity,
  calcularCoberturaParidadeConferencia,
  montarDadosMinimosCatalogo,
  prepararDadosExibicaoLegado,
} from '../shared/auditar-paridade-conferencia-dati-gravity-smart-read.ts'
import { textoExtracaoEhPlaceholder } from '../shared/texto-analise-riscos-leitura-smart-read.ts'

const __dir = dirname(fileURLToPath(import.meta.url))

type LinhaCatalogo = {
  tipo_documento: string
  caminho_legado: string
  valor_exemplo: string
  status: string
}

function parseCsvLinha(linha: string): string[] {
  const campos: string[] = []
  let atual = ''
  let aspas = false

  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i]
    if (ch === '"') {
      if (aspas && linha[i + 1] === '"') {
        atual += '"'
        i++
      } else {
        aspas = !aspas
      }
      continue
    }
    if (ch === ',' && !aspas) {
      campos.push(atual)
      atual = ''
      continue
    }
    atual += ch
  }
  campos.push(atual)
  return campos
}

async function carregarCatalogo(): Promise<LinhaCatalogo[]> {
  const csv = await readFile(join(__dir, 'mapeamento-campos-completo.csv'), 'utf8')
  const linhas = csv.split(/\r?\n/).filter(Boolean)
  const [, ...corpo] = linhas

  return corpo.map((linha) => {
    const [
      tipo_documento,
      caminho_legado,
      ,
      ,
      ,
      ,
      ,
      valor_exemplo,
      status,
    ] = parseCsvLinha(linha)
    return {
      tipo_documento: tipo_documento ?? '',
      caminho_legado: caminho_legado ?? '',
      valor_exemplo: valor_exemplo ?? '',
      status: status ?? '',
    }
  })
}

async function main() {
  const catalogo = await carregarCatalogo()
  const porTipo = new Map<string, { total: number; gaps: number; pendentes: number }>()

  let totalAmostras = 0
  let totalGapsRender = 0
  let totalPendentes = 0

  for (const linha of catalogo) {
    const stats =
      porTipo.get(linha.tipo_documento) ?? { total: 0, gaps: 0, pendentes: 0 }
    stats.total++
    if (linha.status === 'pendente') {
      stats.pendentes++
      totalPendentes++
    }
    porTipo.set(linha.tipo_documento, stats)

    if (!linha.valor_exemplo.trim() || textoExtracaoEhPlaceholder(linha.valor_exemplo)) continue

    totalAmostras++
    const dadosBrutos = montarDadosMinimosCatalogo(linha.caminho_legado, linha.valor_exemplo)
    const dadosExibicao = prepararDadosExibicaoLegado(dadosBrutos)
    const secoes = extrairSecoesConferenciaLeitura(dadosExibicao)
    const relatorio = auditarParidadeConferenciaDatiGravity({
      dados_exibicao: dadosExibicao,
      secoes_conferencia: secoes,
      tipo_documento: linha.tipo_documento,
    })

    const perdas =
      relatorio.por_classe.CAMINHO_NAO_RENDERIZADO +
      relatorio.por_classe.VALOR_PRESENTE_MAS_VAZIO_NA_UI

    if (perdas > 0) {
      totalGapsRender += perdas
      stats.gaps += perdas
      porTipo.set(linha.tipo_documento, stats)
      for (const gap of relatorio.gaps) {
        if (
          gap.classe === 'CAMINHO_NAO_RENDERIZADO' ||
          gap.classe === 'VALOR_PRESENTE_MAS_VAZIO_NA_UI'
        ) {
          console.log(
            `[GAP] ${linha.tipo_documento} | ${gap.caminho_legado} | ${gap.valor_legado} | ${gap.classe}`,
          )
        }
      }
    }
  }

  console.log('\n=== AUDITORIA PARIDADE DATI × GRAVITY (catálogo estático) ===')
  console.log(`Campos no catálogo: ${catalogo.length}`)
  console.log(`Campos pendentes de mapeamento (label/campo Gravity): ${totalPendentes}`)
  console.log(`Amostras com valor_exemplo real: ${totalAmostras}`)
  console.log(`Gaps de renderização na conferência: ${totalGapsRender}`)
  console.log('\nPor tipo de documento:')
  for (const [tipo, stats] of [...porTipo.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(
      `  ${tipo}: ${stats.total} campos | ${stats.pendentes} pendentes catálogo | ${stats.gaps} gaps UI`,
    )
  }
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})

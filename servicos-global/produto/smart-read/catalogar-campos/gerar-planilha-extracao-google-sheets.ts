import { readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolverNomePrismaCampoLegado } from './resolver-nome-prisma-campo-legado.js'

const __dir = dirname(fileURLToPath(import.meta.url))

function escCsv(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`
  return v
}

function chaveJson(caminho: string): string {
  return caminho.split('.').pop()?.replace(/\[\]/g, '') ?? caminho
}

function achatar(
  dados: Record<string, unknown>,
  prefixo = '',
): Array<{ caminho: string; valor: string }> {
  const linhas: Array<{ caminho: string; valor: string }> = []
  for (const [chave, valor] of Object.entries(dados)) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    if (Array.isArray(valor)) {
      valor.forEach((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          linhas.push(...achatar(item as Record<string, unknown>, `${caminho}[${i}]`))
        } else {
          linhas.push({ caminho: `${caminho}[${i}]`, valor: item == null ? '' : String(item) })
        }
      })
    } else if (valor !== null && typeof valor === 'object') {
      linhas.push(...achatar(valor as Record<string, unknown>, caminho))
    } else {
      linhas.push({ caminho: caminho.replace(/\[\d+\]/g, '[]'), valor: valor == null ? '' : String(valor) })
    }
  }
  return linhas
}

async function main() {
  const dirs = [join(__dir, 'leituras'), join(__dir, 'invoices-analise/leituras')]
  const linhasCsv: string[] = [
    'numero_linha,nome_arquivo,tipo_documento,caminho_campo,nome_prisma,tabela_prisma,confianca_mapeamento,observacao_mapeamento,chave_json,valor_extraido,preenchido',
  ]
  let n = 0
  let mapeados = 0
  let sugestoes = 0

  for (const dir of dirs) {
    let files: string[] = []
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.json'))
    } catch {
      continue
    }

    for (const f of files.sort()) {
      const bruto = JSON.parse(await readFile(join(dir, f), 'utf8')) as {
        arquivo_origem?: string
        gravity?: {
          arquivos?: Array<{
            resultado_extracao?: Array<{
              tipo_documento?: string | null
              dados?: Record<string, unknown>
            }> | null
          }>
        }
      }

      const nomeArquivo =
        basename(bruto.arquivo_origem ?? f.split('__')[0] ?? f) || f.split('__')[0] || f

      for (const arq of bruto.gravity?.arquivos ?? []) {
        for (const ext of arq.resultado_extracao ?? []) {
          const tipo = ext.tipo_documento ?? 'SEM_TIPO'
          const campos = achatar(ext.dados ?? {})
          const vistos = new Set<string>()
          for (const c of campos) {
            if (vistos.has(c.caminho)) continue
            vistos.add(c.caminho)
            n += 1
            const mapa = await resolverNomePrismaCampoLegado(c.caminho, tipo)
            if (mapa.nome_prisma) {
              mapeados += 1
              if (mapa.confianca === 'sugestao') sugestoes += 1
            }
            linhasCsv.push(
              [
                String(n),
                escCsv(nomeArquivo),
                escCsv(tipo),
                escCsv(c.caminho),
                escCsv(mapa.nome_prisma),
                escCsv(mapa.tabela_prisma),
                escCsv(mapa.confianca),
                escCsv(mapa.observacao),
                escCsv(chaveJson(c.caminho)),
                escCsv(c.valor),
                c.valor.trim() !== '' ? 'sim' : 'nao',
              ].join(','),
            )
          }
        }
      }
    }
  }

  const csv = linhasCsv.join('\n')
  await writeFile(join(__dir, 'planilha_geral_gravity.csv'), csv, 'utf8')
  await writeFile(join(__dir, 'extracao-completa-google-sheets.csv'), csv, 'utf8')
  console.log(
    `${n} linhas | ${mapeados} com nome_prisma validado (${sugestoes} sugestao, ${mapeados - sugestoes} alta) | vazio = sem campo Prisma correspondente`,
  )
}

main().catch(console.error)

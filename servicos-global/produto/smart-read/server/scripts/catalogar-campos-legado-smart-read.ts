/**
 * catalogar-campos-legado-smart-read.ts
 *
 * Processa PDFs em lote via legado QA, salva JSON de cada leitura e gera catálogo de campos.
 *
 * Uso:
 *   cd servicos-global/produto/smart-read
 *   npm run catalogar-campos -- --pasta "./catalogar-campos/entrada" --saida "./catalogar-campos"
 *
 * Opções:
 *   --pasta          Diretório com PDFs (recursivo)
 *   --saida          Diretório de saída (default: ./catalogar-campos)
 *   --id-organizacao CUID Gravity (default: SMART_READ_ID_ORG ou env)
 *   --limite         Máx. arquivos (default: sem limite)
 *   --intervalo-ms   Pausa entre uploads (default: 2000)
 *   --somente-agregar  Só lê JSONs já salvos em --saida/leituras (não reenvia)
 *   --retomar-leitura  Busca leitura existente no legado (sem reenviar PDF)
 *   --nome-arquivo     Nome exibido no catálogo ao usar --retomar-leitura
 */

import dotenv from 'dotenv'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = fileURLToPath(new URL('.', import.meta.url))
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })
dotenv.config({ path: resolve(__dir, '../../.env') })

import {
  criarLeituraLegado,
  enviarArquivoLegado,
  obterLeituraLegado,
  resolverCompanyLegado,
} from '../src/lib/cliente-legado-smart-read.js'
import { normalizarLeitura, type LeituraLegado } from '../src/schemas/leitura-smart-read.js'
import {
  agregarEntradasCatalogo,
  catalogoParaCsv,
  listarCaminhosCamposDados,
  montarCatalogoCampos,
  type EntradaCatalogoCampo,
} from '../src/lib/agregar-caminhos-campos-dados-smart-read.js'

const INTERVALO_POLL_MS = 3000
const LIMITE_POLL_MS = 10 * 60 * 1000
const EXTENSOES = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.tif', '.tiff'])

type Args = {
  pasta: string
  saida: string
  idOrganizacao: string
  limite?: number
  intervaloMs: number
  somenteAgregar: boolean
  retomarLeitura?: string
  nomeArquivoRetomar?: string
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag)
    return i >= 0 ? argv[i + 1] : undefined
  }
  const pasta = get('--pasta')
  const retomarLeitura = get('--retomar-leitura')
  if (!pasta && !argv.includes('--somente-agregar') && !retomarLeitura) {
    console.error(
      'Informe --pasta com os PDFs, --retomar-leitura <id> ou --somente-agregar com JSONs em --saida/leituras',
    )
    process.exit(1)
  }
  const idOrganizacao =
    get('--id-organizacao') ??
    process.env.SMART_READ_CATALOGAR_ID_ORGANIZACAO ??
    process.env.VITE_DEV_TENANT_ID ??
    ''
  if (!idOrganizacao && !argv.includes('--somente-agregar') && !retomarLeitura) {
    console.error('Informe --id-organizacao ou SMART_READ_CATALOGAR_ID_ORGANIZACAO no env')
    process.exit(1)
  }
  return {
    pasta: pasta ? resolve(pasta) : resolve(get('--saida') ?? './catalogar-campos', 'entrada'),
    saida: resolve(get('--saida') ?? './catalogar-campos'),
    idOrganizacao,
    limite: get('--limite') ? Number(get('--limite')) : undefined,
    intervaloMs: get('--intervalo-ms') ? Number(get('--intervalo-ms')) : 2000,
    somenteAgregar: argv.includes('--somente-agregar'),
    retomarLeitura,
    nomeArquivoRetomar: get('--nome-arquivo'),
  }
}

async function listarArquivosRecursivo(dir: string): Promise<string[]> {
  const entradas = await readdir(dir, { withFileTypes: true })
  const arquivos: string[] = []
  for (const entrada of entradas) {
    const caminho = join(dir, entrada.name)
    if (entrada.isDirectory()) {
      arquivos.push(...(await listarArquivosRecursivo(caminho)))
    } else if (EXTENSOES.has(extname(entrada.name).toLowerCase())) {
      arquivos.push(caminho)
    }
  }
  return arquivos.sort()
}

async function aguardarLeitura(companyId: string, idLeitura: string): Promise<LeituraLegado> {
  const inicio = Date.now()
  while (Date.now() - inicio < LIMITE_POLL_MS) {
    const leitura = await obterLeituraLegado(companyId, idLeitura)
    const statusLeitura = normalizarLeitura(leitura).status_leitura
    if (statusLeitura === 'COMPLETED') {
      return leitura
    }
    if (statusLeitura === 'FAILED') {
      throw new Error(`Leitura ${idLeitura} falhou: ${leitura.status}`)
    }
    await new Promise((r) => setTimeout(r, INTERVALO_POLL_MS))
  }
  throw new Error(`Timeout aguardando leitura ${idLeitura}`)
}

function registrarLeituraNoCatalogo(
  acumulado: Map<string, EntradaCatalogoCampo>,
  nomeArquivo: string,
  legado: LeituraLegado,
): number {
  const normalizada = normalizarLeitura(legado)
  let documentos = 0

  for (const arquivo of normalizada.arquivos) {
    for (const extracao of arquivo.resultado_extracao ?? []) {
      documentos += 1
      const tipo = extracao.tipo_documento?.trim() || 'SEM_TIPO'
      for (const campo of listarCaminhosCamposDados(extracao.dados)) {
        agregarEntradasCatalogo(acumulado, {
          tipoDocumento: tipo,
          caminhoCampo: campo.caminho_campo,
          nomeArquivo,
          preenchido: campo.preenchido,
          tipoValor: campo.tipo_valor,
          valorExemplo: campo.valor_exemplo,
        })
      }
    }
  }
  return documentos
}

async function processarArquivo(
  companyId: string,
  caminhoArquivo: string,
  dirLeituras: string,
): Promise<{ legado: LeituraLegado; nome: string }> {
  const nome = basename(caminhoArquivo)
  const buffer = await readFile(caminhoArquivo)
  const mimeType = extname(nome).toLowerCase() === '.pdf' ? 'application/pdf' : 'application/octet-stream'

  const idLeitura = await criarLeituraLegado(companyId)
  await enviarArquivoLegado(companyId, idLeitura, { buffer, nome, mimeType })
  const legado = await aguardarLeitura(companyId, idLeitura)

  const slug = nome.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80)
  const arquivoJson = join(dirLeituras, `${slug}__${idLeitura}.json`)
  await writeFile(
    arquivoJson,
    JSON.stringify({ arquivo_origem: caminhoArquivo, legado, gravity: normalizarLeitura(legado) }, null, 2),
    'utf8',
  )

  return { legado, nome }
}

async function main(): Promise<void> {
  const args = parseArgs()
  await mkdir(args.saida, { recursive: true })
  const dirLeituras = join(args.saida, 'leituras')
  await mkdir(dirLeituras, { recursive: true })

  const acumulado = new Map<string, EntradaCatalogoCampo>()
  let totalArquivos = 0
  let totalDocumentos = 0

  if (args.retomarLeitura) {
    const companyId = await resolverCompanyLegado(args.idOrganizacao)
    const idLeitura = args.retomarLeitura
    console.log(`Retomando leitura ${idLeitura} (company ${companyId})…`)
    const legado = await aguardarLeitura(companyId, idLeitura)
    const nome =
      args.nomeArquivoRetomar ??
      legado.files?.[0]?.filename ??
      `retomada-${idLeitura.slice(0, 8)}`
    const slug = nome.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80)
    const arquivoJson = join(dirLeituras, `${slug}__${idLeitura}.json`)
    await writeFile(
      arquivoJson,
      JSON.stringify({ arquivo_origem: nome, legado, gravity: normalizarLeitura(legado) }, null, 2),
      'utf8',
    )
    totalArquivos += 1
    totalDocumentos += registrarLeituraNoCatalogo(acumulado, nome, legado)
    console.log(`OK — ${totalDocumentos} documento(s) identificado(s)`)
  } else if (args.somenteAgregar) {
    const jsons = await readdir(dirLeituras).catch(() => [] as string[])
    for (const arquivo of jsons.filter((f) => f.endsWith('.json'))) {
      const bruto = JSON.parse(await readFile(join(dirLeituras, arquivo), 'utf8')) as {
        arquivo_origem?: string
        legado: LeituraLegado
      }
      totalArquivos += 1
      totalDocumentos += registrarLeituraNoCatalogo(
        acumulado,
        basename(bruto.arquivo_origem ?? arquivo),
        bruto.legado,
      )
    }
    console.log(`Agregados ${totalArquivos} JSON(s) existentes`)
  } else {
    const companyId = await resolverCompanyLegado(args.idOrganizacao)
    let lista = await listarArquivosRecursivo(args.pasta)
    if (args.limite && args.limite > 0) lista = lista.slice(0, args.limite)

    console.log(`Encontrados ${lista.length} arquivo(s) em ${args.pasta}`)
    console.log(`Company legado: ${companyId} | Org: ${args.idOrganizacao}`)

    for (let i = 0; i < lista.length; i++) {
      const caminho = lista[i]
      const rotulo = `[${i + 1}/${lista.length}]`
      try {
        console.log(`${rotulo} Processando ${basename(caminho)}…`)
        const { legado, nome } = await processarArquivo(companyId, caminho, dirLeituras)
        totalArquivos += 1
        const docs = registrarLeituraNoCatalogo(acumulado, nome, legado)
        totalDocumentos += docs
        console.log(`${rotulo} OK — ${docs} documento(s) identificado(s)`)
      } catch (erro) {
        console.error(`${rotulo} ERRO ${basename(caminho)}:`, erro instanceof Error ? erro.message : erro)
      }
      if (i < lista.length - 1 && args.intervaloMs > 0) {
        await new Promise((r) => setTimeout(r, args.intervaloMs))
      }
    }
  }

  const catalogo = montarCatalogoCampos(acumulado, {
    totalDocumentos,
    totalArquivos,
  })

  await writeFile(join(args.saida, 'catalogo-campos.json'), JSON.stringify(catalogo, null, 2), 'utf8')
  await writeFile(join(args.saida, 'catalogo-campos.csv'), catalogoParaCsv(catalogo), 'utf8')

  console.log('')
  console.log(`Catálogo: ${catalogo.campos.length} caminho(s) únicos em ${catalogo.tipos_documento.length} tipo(s)`)
  console.log(`Saída: ${args.saida}`)
  console.log(`  - catalogo-campos.json / .csv`)
  console.log(`  - leituras/*.json (legado + gravity normalizado)`)
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})

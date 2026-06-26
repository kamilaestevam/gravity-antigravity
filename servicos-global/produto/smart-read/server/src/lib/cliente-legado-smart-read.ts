/**
 * cliente-legado-smart-read.ts — Cliente HTTP do Smart Read legado (dati/microservices)
 * Fala com o ExternalApiReadingsController via flag x-gravity-api-key + x-company-id.
 * O vínculo id_organizacao → company id legado é resolvido via Configurador (S2S).
 */

import { AppError } from './app-error.js'
import {
  criarLeituraMockLegado,
  enviarArquivoMockLegado,
  listarLeiturasMockLegado,
  obterArquivoMockLegado,
  obterLeituraMockLegado,
} from './mock-legado-smart-read.js'
import {
  CriarLeituraLegadoRespostaSchema,
  EnviarArquivoLegadoRespostaSchema,
  LeituraLegadoSchema,
  type LeituraLegado,
} from '../schemas/leitura-smart-read.js'
import { corrigirEncodingNomeArquivoSmartRead } from '../../../shared/corrigir-encoding-nome-arquivo-smart-read.js'
import {
  conteudoArquivoLeituraEhVisualizavel,
  resolverMimePorNomeArquivo,
} from '../../../shared/validar-conteudo-arquivo-leitura-smart-read.js'

function nomeArquivoLegadoCorrigido(nome: string | null | undefined): string | null {
  return corrigirEncodingNomeArquivoSmartRead(nome)
}

let avisoMockLegadoEmitido = false

/** Dev: mock quando SMART_READ_MOCK_LEGADO=1 ou legado não configurado. */
export function deveUsarMockLegadoSmartRead(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  if (process.env.SMART_READ_MOCK_LEGADO === '1') return true
  const urlBase = process.env.SMART_READ_LEGADO_URL?.trim()
  const chaveGravity = process.env.SMART_READ_LEGADO_CHAVE_GRAVITY?.trim()
  return !urlBase || !chaveGravity
}

function registrarUsoMockLegado(): void {
  if (avisoMockLegadoEmitido) return
  avisoMockLegadoEmitido = true
  console.warn(
    '[smart-read] Modo mock legado ativo (dev). Defina SMART_READ_LEGADO_URL + SMART_READ_LEGADO_CHAVE_GRAVITY para QA real.',
  )
}

const TIMEOUT_MS = 30_000
// Upload multipart pode levar minutos em arquivos grandes/conexoes lentas.
// O frontend de referencia (dati-import-frontend-v2) nao limita o upload.
const TIMEOUT_UPLOAD_MS = 600_000
const BASE_PATH = '/import-control-center/external-readings'

function configuracaoLegado(): { urlBase: string; chaveGravity: string } {
  const urlBase = process.env.SMART_READ_LEGADO_URL
  const chaveGravity = process.env.SMART_READ_LEGADO_CHAVE_GRAVITY
  if (!urlBase || !chaveGravity) {
    throw new AppError(
      'Integracao Smart Read nao configurada (SMART_READ_LEGADO_URL / SMART_READ_LEGADO_CHAVE_GRAVITY)',
      500,
      'CONFIG_ERROR',
    )
  }
  return { urlBase: urlBase.replace(/\/$/, ''), chaveGravity }
}

export { resolverCompanyLegado } from './resolver-vinculo-smart-read-legado.js'

function cabecalhosBase(companyId: string): Record<string, string> {
  const { chaveGravity } = configuracaoLegado()
  return {
    accept: 'application/json',
    'x-gravity-api-key': chaveGravity,
    'x-company-id': companyId,
  }
}

function cabecalhosBinarioLegado(companyId: string): Record<string, string> {
  const { chaveGravity } = configuracaoLegado()
  return {
    accept: 'application/octet-stream,*/*',
    'x-gravity-api-key': chaveGravity,
    'x-company-id': companyId,
  }
}

type MetadadosArquivoLegadoJson = {
  filename?: string
  mimeType?: string
  s3Key?: string
  url?: string
  downloadUrl?: string
  fileUrl?: string
}

function extrairUrlMetadadosArquivo(meta: MetadadosArquivoLegadoJson): string | null {
  return meta.downloadUrl ?? meta.url ?? meta.fileUrl ?? null
}

async function chamarLegado(caminho: string, init: RequestInit, timeoutMs = TIMEOUT_MS): Promise<unknown> {
  const { urlBase } = configuracaoLegado()
  let resposta: globalThis.Response
  try {
    resposta = await fetch(`${urlBase}${BASE_PATH}${caminho}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (erro) {
    throw new AppError(
      `Smart Read legado inacessivel: ${erro instanceof Error ? erro.message : 'erro de rede'}`,
      502,
      'LEGADO_INDISPONIVEL',
    )
  }
  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => '')
    throw new AppError(
      `Smart Read legado respondeu ${resposta.status}: ${corpo.slice(0, 300)}`,
      resposta.status === 401 || resposta.status === 403 ? 502 : resposta.status,
      'LEGADO_ERRO',
    )
  }
  return resposta.json()
}

export async function criarLeituraLegado(companyId: string): Promise<string> {
  if (deveUsarMockLegadoSmartRead()) {
    registrarUsoMockLegado()
    return criarLeituraMockLegado()
  }
  const corpo = await chamarLegado('', {
    method: 'POST',
    headers: { ...cabecalhosBase(companyId), 'x-smart-read-project-id': 'gravity' },
  })
  return CriarLeituraLegadoRespostaSchema.parse(corpo)._id
}

export async function enviarArquivoLegado(
  companyId: string,
  idLeitura: string,
  arquivo: { buffer: Buffer; nome: string; mimeType: string },
): Promise<string | null> {
  if (deveUsarMockLegadoSmartRead()) {
    registrarUsoMockLegado()
    return enviarArquivoMockLegado(idLeitura, {
      nome: arquivo.nome,
      mimeType: arquivo.mimeType,
      buffer: arquivo.buffer,
    })
  }
  const formulario = new FormData()
  formulario.append(
    'file',
    new Blob([new Uint8Array(arquivo.buffer)], { type: arquivo.mimeType }),
    arquivo.nome,
  )
  const corpo = await chamarLegado(
    `/${idLeitura}/files`,
    {
      method: 'POST',
      headers: cabecalhosBase(companyId),
      body: formulario,
    },
    TIMEOUT_UPLOAD_MS,
  )
  return EnviarArquivoLegadoRespostaSchema.parse(corpo).fileReferenceId ?? null
}

export async function obterLeituraLegado(companyId: string, idLeitura: string): Promise<LeituraLegado> {
  if (deveUsarMockLegadoSmartRead()) {
    return obterLeituraMockLegado(idLeitura)
  }
  const corpo = await chamarLegado(`/${idLeitura}`, {
    method: 'GET',
    headers: cabecalhosBase(companyId),
  })
  return LeituraLegadoSchema.parse(corpo)
}

async function chamarLegadoBinario(
  caminho: string,
  init: RequestInit,
  timeoutMs = TIMEOUT_MS,
): Promise<{ buffer: Buffer; contentType: string | null }> {
  const { urlBase } = configuracaoLegado()
  let resposta: globalThis.Response
  try {
    resposta = await fetch(`${urlBase}${BASE_PATH}${caminho}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (erro) {
    throw new AppError(
      `Smart Read legado inacessivel: ${erro instanceof Error ? erro.message : 'erro de rede'}`,
      502,
      'LEGADO_INDISPONIVEL',
    )
  }
  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => '')
    throw new AppError(
      `Smart Read legado respondeu ${resposta.status}: ${corpo.slice(0, 300)}`,
      resposta.status === 404 ? 404 : resposta.status === 401 || resposta.status === 403 ? 502 : resposta.status,
      'LEGADO_ARQUIVO_ERRO',
    )
  }
  const buffer = Buffer.from(await resposta.arrayBuffer())
  return { buffer, contentType: resposta.headers.get('content-type') }
}

async function baixarArquivoS3Legado(
  companyId: string,
  s3Key: string,
): Promise<{ buffer: Buffer; contentType: string | null }> {
  const { urlBase, chaveGravity } = configuracaoLegado()
  const chaveS3 = process.env.SMART_READ_LEGADO_CHAVE_S3?.trim() || chaveGravity
  let resposta: globalThis.Response
  try {
    resposta = await fetch(`${urlBase}/import-control-center/files/download`, {
      method: 'POST',
      headers: {
        accept: 'application/octet-stream,*/*',
        'Content-Type': 'application/json',
        'x-gravity-api-key': chaveS3,
        'x-company-id': companyId,
        'x-smart-read-project-id': 'gravity',
      },
      body: JSON.stringify({ s3Key }),
      signal: AbortSignal.timeout(20_000),
    })
  } catch (erro) {
    throw new AppError(
      `Download S3 legado inacessivel: ${erro instanceof Error ? erro.message : 'erro de rede'}`,
      502,
      'LEGADO_S3_INDISPONIVEL',
    )
  }
  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => '')
    const codigo =
      resposta.status === 401 || resposta.status === 403 ? 'LEGADO_S3_NAO_AUTORIZADO' : 'LEGADO_S3_ERRO'
    throw new AppError(
      resposta.status === 401 || resposta.status === 403
        ? 'Download do arquivo no storage DATI nao autorizado para a chave Gravity atual'
        : `Download S3 legado respondeu ${resposta.status}: ${corpo.slice(0, 200)}`,
      resposta.status === 404 ? 404 : 502,
      codigo,
    )
  }
  const buffer = Buffer.from(await resposta.arrayBuffer())
  return { buffer, contentType: resposta.headers.get('content-type') }
}

async function baixarUrlArquivoLegado(url: string): Promise<{ buffer: Buffer; contentType: string | null }> {
  let resposta: globalThis.Response
  try {
    resposta = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  } catch (erro) {
    throw new AppError(
      `URL do arquivo legado inacessivel: ${erro instanceof Error ? erro.message : 'erro de rede'}`,
      502,
      'LEGADO_URL_INDISPONIVEL',
    )
  }
  if (!resposta.ok) {
    throw new AppError(`URL do arquivo legado respondeu ${resposta.status}`, resposta.status, 'LEGADO_URL_ERRO')
  }
  const buffer = Buffer.from(await resposta.arrayBuffer())
  return { buffer, contentType: resposta.headers.get('content-type') }
}

function tentarExtrairBufferDeJsonLegado(buffer: Buffer): Buffer | null {
  if (buffer.length === 0 || (buffer[0] !== 0x7b && buffer[0] !== 0x5b)) return null
  try {
    const json = JSON.parse(buffer.toString('utf8')) as Record<string, unknown>
    const base64 =
      (typeof json.base64 === 'string' && json.base64) ||
      (typeof json.data === 'string' && json.data) ||
      (typeof json.content === 'string' && json.content) ||
      null
    if (base64) return Buffer.from(base64, 'base64')
    const url =
      (typeof json.url === 'string' && json.url) ||
      (typeof json.downloadUrl === 'string' && json.downloadUrl) ||
      (typeof json.fileUrl === 'string' && json.fileUrl) ||
      null
    if (url) return null
  } catch {
    return null
  }
  return null
}

function normalizarBufferArquivoLegado(
  buffer: Buffer,
  contentType: string | null,
  nomeArquivo: string | null,
): { buffer: Buffer; contentType: string } {
  const jsonBuffer = tentarExtrairBufferDeJsonLegado(buffer)
  const efetivo = jsonBuffer ?? buffer
  const nome = nomeArquivo ?? 'documento'
  if (!conteudoArquivoLeituraEhVisualizavel(efetivo, nome)) {
    const amostra = efetivo.subarray(0, 80).toString('utf8').replace(/\s+/g, ' ').trim()
    throw new AppError(
      `Conteudo retornado pelo legado nao e um arquivo visualizavel (${nome})${amostra ? `: ${amostra}` : ''}`,
      502,
      'LEGADO_ARQUIVO_INVALIDO',
    )
  }
  const mime = contentType?.split(';')[0]?.trim() || resolverMimePorNomeArquivo(nome)
  return { buffer: efetivo, contentType: mime }
}

async function baixarArquivoPorMetadadosLegado(
  companyId: string,
  meta: MetadadosArquivoLegadoJson,
  nomeFallback: string | null,
): Promise<{ buffer: Buffer; contentType: string; nomeArquivo: string | null }> {
  const nomeArquivo = nomeArquivoLegadoCorrigido(meta.filename ?? nomeFallback)
  const urlExterna = extrairUrlMetadadosArquivo(meta)
  if (urlExterna) {
    const remoto = await baixarUrlArquivoLegado(urlExterna)
    const normalizado = normalizarBufferArquivoLegado(remoto.buffer, remoto.contentType, nomeArquivo)
    return { ...normalizado, nomeArquivo }
  }
  if (meta.s3Key) {
    const remoto = await baixarArquivoS3Legado(companyId, meta.s3Key)
    const mime = meta.mimeType ?? remoto.contentType
    const normalizado = normalizarBufferArquivoLegado(remoto.buffer, mime, nomeArquivo)
    return { ...normalizado, nomeArquivo }
  }
  throw new AppError('Metadados do arquivo legado nao incluem URL nem s3Key', 502, 'LEGADO_ARQUIVO_SEM_FONTE')
}

export async function obterArquivoLegado(
  companyId: string,
  idLeitura: string,
  idArquivo: string,
): Promise<{ buffer: Buffer; contentType: string; nomeArquivo: string | null }> {
  if (deveUsarMockLegadoSmartRead()) {
    registrarUsoMockLegado()
    const mock = obterArquivoMockLegado(idLeitura, idArquivo)
    const normalizado = normalizarBufferArquivoLegado(mock.buffer, mock.contentType, mock.nomeArquivo)
    return { ...normalizado, nomeArquivo: mock.nomeArquivo }
  }

  const leitura = await obterLeituraLegado(companyId, idLeitura)
  const metaLista = leitura.files?.find((item) => item.fileReferenceId === idArquivo)
  const nomeArquivo = nomeArquivoLegadoCorrigido(metaLista?.filename ?? null)
  const urlLista = metaLista ? extrairUrlMetadadosArquivo(metaLista) : null
  if (urlLista) {
    const remoto = await baixarUrlArquivoLegado(urlLista)
    const normalizado = normalizarBufferArquivoLegado(remoto.buffer, remoto.contentType, nomeArquivo)
    return { ...normalizado, nomeArquivo }
  }

  try {
    const detalhe = (await chamarLegado(`/${idLeitura}/files/${idArquivo}`, {
      method: 'GET',
      headers: cabecalhosBase(companyId),
    })) as MetadadosArquivoLegadoJson
    return baixarArquivoPorMetadadosLegado(companyId, detalhe, nomeArquivo)
  } catch (erro) {
    if (!(erro instanceof AppError) || erro.statusCode !== 404) {
      throw erro
    }
  }

  const caminhos = [`/${idLeitura}/files/${idArquivo}/content`, `/files/${idArquivo}`]
  let ultimoErro: AppError | null = null
  for (const caminho of caminhos) {
    try {
      const { buffer, contentType } = await chamarLegadoBinario(
        caminho,
        {
          method: 'GET',
          headers: cabecalhosBinarioLegado(companyId),
        },
        20_000,
      )
      const jsonBuffer = tentarExtrairBufferDeJsonLegado(buffer)
      if (!jsonBuffer && buffer[0] === 0x7b) {
        try {
          const json = JSON.parse(buffer.toString('utf8')) as MetadadosArquivoLegadoJson
          return baixarArquivoPorMetadadosLegado(companyId, json, nomeArquivo)
        } catch (erroMetadados) {
          if (erroMetadados instanceof AppError) throw erroMetadados
        }
      }
      const normalizado = normalizarBufferArquivoLegado(buffer, contentType, nomeArquivo)
      return { ...normalizado, nomeArquivo }
    } catch (erro) {
      if (erro instanceof AppError && erro.statusCode === 404) {
        ultimoErro = erro
        continue
      }
      throw erro
    }
  }

  throw ultimoErro ?? new AppError('Arquivo nao encontrado no legado', 404, 'LEGADO_ARQUIVO_NAO_ENCONTRADO')
}

export async function listarLeiturasLegado(
  companyId: string,
  params: { pagina: number; limite: number; termo_busca?: string },
): Promise<unknown> {
  if (deveUsarMockLegadoSmartRead()) {
    registrarUsoMockLegado()
    return listarLeiturasMockLegado(params)
  }
  const paginaLegado = Math.max(0, params.pagina - 1)
  const query = new URLSearchParams({
    page: String(paginaLegado),
    size: String(params.limite),
  })
  if (params.termo_busca) query.set('search', params.termo_busca)
  return chamarLegado(`/list?${query.toString()}`, {
    method: 'GET',
    headers: {
      ...cabecalhosBase(companyId),
      'x-smart-read-project-id': 'gravity',
    },
  })
}

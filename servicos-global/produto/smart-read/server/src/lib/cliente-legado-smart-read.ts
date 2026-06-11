/**
 * cliente-legado-smart-read.ts — Cliente HTTP do Smart Read legado (dati/microservices)
 * Fala com o ExternalApiReadingsController via flag x-gravity-api-key + x-company-id.
 * O de-para id_organizacao (Gravity) → company id (legado) vem de
 * SMART_READ_DE_PARA_ORGANIZACAO (JSON), até existir cadastro no Configurador.
 */

import { AppError } from './app-error.js'
import {
  CriarLeituraLegadoRespostaSchema,
  EnviarArquivoLegadoRespostaSchema,
  LeituraLegadoSchema,
  type LeituraLegado,
} from '../schemas/leitura-smart-read.js'

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

export function resolverCompanyLegado(idOrganizacao: string): string {
  const mapaBruto = process.env.SMART_READ_DE_PARA_ORGANIZACAO ?? '{}'
  let mapa: Record<string, string>
  try {
    mapa = JSON.parse(mapaBruto) as Record<string, string>
  } catch {
    throw new AppError('SMART_READ_DE_PARA_ORGANIZACAO invalido (JSON malformado)', 500, 'CONFIG_ERROR')
  }
  const companyId = mapa[idOrganizacao]
  if (!companyId) {
    throw new AppError(
      `Organizacao ${idOrganizacao} sem vinculo com o Smart Read legado (de-para ausente)`,
      422,
      'ORGANIZACAO_SEM_VINCULO',
    )
  }
  return companyId
}

function cabecalhosBase(companyId: string): Record<string, string> {
  const { chaveGravity } = configuracaoLegado()
  return {
    accept: 'application/json',
    'x-gravity-api-key': chaveGravity,
    'x-company-id': companyId,
  }
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
  const corpo = await chamarLegado(`/${idLeitura}`, {
    method: 'GET',
    headers: cabecalhosBase(companyId),
  })
  return LeituraLegadoSchema.parse(corpo)
}

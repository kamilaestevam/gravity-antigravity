/**
 * cliente-consulta-cnpj-smart-read.ts — Passo 2: consulta CNPJ na base governamental (RFB via bureau)
 */

import { z } from 'zod'
import type { DadosOficiaisCnpjLeitura } from '../../../shared/analise-riscos-leitura-smart-read.js'

const FETCH_TIMEOUT_MS = 15_000

const BrasilApiCnpjSchema = z.object({
  cnpj: z.string().optional(),
  razao_social: z.string().optional(),
  nome_fantasia: z.string().nullable().optional(),
  descricao_situacao_cadastral: z.string().optional(),
  situacao_cadastral: z.number().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  municipio: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
})

function baseUrlConsultaCnpj(): string {
  return (
    process.env.CNPJ_CONSULTA_BASE_URL?.trim() ||
    process.env.BRASILAPI_BASE_URL?.trim() ||
    'https://brasilapi.com.br/api'
  ).replace(/\/$/, '')
}

export async function consultarCnpjReceitaSmartRead(
  cnpjBruto: string,
): Promise<DadosOficiaisCnpjLeitura | null> {
  const cnpj = cnpjBruto.replace(/\D/g, '')
  if (cnpj.length !== 14) return null

  const url = `${baseUrlConsultaCnpj()}/cnpj/v1/${cnpj}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!res.ok) return null
    const raw: unknown = await res.json()
    const parsed = BrasilApiCnpjSchema.safeParse(raw)
    if (!parsed.success) return null

    const situacao = parsed.data.descricao_situacao_cadastral?.toUpperCase() ?? ''
    const ativo = situacao.includes('ATIVA') || parsed.data.situacao_cadastral === 2

    return {
      cnpj,
      razao_social: parsed.data.razao_social ?? null,
      nome_fantasia: parsed.data.nome_fantasia ?? null,
      situacao_cadastral: parsed.data.descricao_situacao_cadastral ?? null,
      ativo,
      logradouro: parsed.data.logradouro ?? null,
      numero: parsed.data.numero ?? null,
      complemento: parsed.data.complemento ?? null,
      bairro: parsed.data.bairro ?? null,
      municipio: parsed.data.municipio ?? null,
      uf: parsed.data.uf ?? null,
      cep: parsed.data.cep?.replace(/\D/g, '') ?? null,
      fonte: 'brasilapi_rfb',
    }
  } catch {
    return null
  }
}

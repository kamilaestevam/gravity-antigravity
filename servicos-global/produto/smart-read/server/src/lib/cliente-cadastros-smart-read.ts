/**
 * cliente-cadastros-smart-read.ts — S2S para NCM (V3a)
 */

import { z } from 'zod'
import type { TributosNcmLeitura } from '../../../shared/analise-riscos-leitura-smart-read.js'

const FETCH_TIMEOUT_MS = 12_000

const NcmValidarRespostaSchema = z.object({
  valido: z.boolean(),
  descricao: z.string().nullable(),
  fonte: z.string().nullable(),
  motivo: z.string().nullable().optional(),
  ii: z.number().nullable().optional(),
  ipi: z.number().nullable().optional(),
  pis: z.number().nullable().optional(),
  cofins: z.number().nullable().optional(),
})

function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? process.env.CADASTROS_URL ?? 'http://localhost:8031'
}

function getInternalServiceKey(): string {
  const key = process.env.CHAVE_INTERNA_SERVICO?.trim()
  if (key) return key
  if (process.env.NODE_ENV !== 'production') {
    return process.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  }
  throw new Error('CHAVE_INTERNA_SERVICO ausente — Smart Read não pode chamar Cadastros')
}

export async function validarNcmCadastrosSmartRead(
  codigo: string,
  idOrganizacao: string,
): Promise<TributosNcmLeitura> {
  const url = `${getCadastrosUrl()}/api/v1/cadastros/ncm/${encodeURIComponent(codigo)}/validar`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': getInternalServiceKey(),
      'x-chave-interna-servico': getInternalServiceKey(),
      'x-id-organizacao': idOrganizacao,
      'x-correlation-id': crypto.randomUUID(),
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) {
    return {
      codigo_ncm: codigo,
      descricao_ncm: null,
      valido: false,
      fonte: null,
      ii: null,
      ipi: null,
      pis: null,
      cofins: null,
    }
  }

  const raw: unknown = await res.json()
  const parsed = NcmValidarRespostaSchema.parse(raw)
  return {
    codigo_ncm: codigo,
    descricao_ncm: parsed.descricao,
    valido: parsed.valido,
    fonte: parsed.fonte,
    ii: parsed.ii ?? null,
    ipi: parsed.ipi ?? null,
    pis: parsed.pis ?? null,
    cofins: parsed.cofins ?? null,
  }
}

export async function buscarTributosNcmsLeituraSmartRead(
  codigos: string[],
  idOrganizacao: string,
): Promise<TributosNcmLeitura[]> {
  const unicos = [...new Set(codigos.filter((c) => /^\d{8}$/.test(c)))]
  const resultados = await Promise.all(
    unicos.map((codigo) => validarNcmCadastrosSmartRead(codigo, idOrganizacao)),
  )
  return resultados
}

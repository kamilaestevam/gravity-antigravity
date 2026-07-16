/**
 * cliente-consulta-cnpj-smart-read.ts — Passo 2: consulta CNPJ na base governamental (RFB via bureau)
 */

import { z } from 'zod'
import type { DadosOficiaisCnpjLeitura } from '../../../shared/analise-riscos-leitura-smart-read.js'

const FETCH_TIMEOUT_MS = 2_800

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

const TENTATIVAS_POR_PROVEDOR = 1
const ESPERA_ENTRE_TENTATIVAS_MS = 1_000
const TTL_CACHE_CNPJ_MS = 30 * 60 * 1000

const cacheCnpjReceita = new Map<string, { dados: DadosOficiaisCnpjLeitura; expiraEm: number }>()

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function buscarCnpjEmProvedor(
  url: string,
  cnpj: string,
  fonte: string,
): Promise<DadosOficiaisCnpjLeitura | null> {
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
    fonte,
  }
}

export async function consultarCnpjReceitaSmartRead(
  cnpjBruto: string,
): Promise<DadosOficiaisCnpjLeitura | null> {
  const cnpj = cnpjBruto.replace(/\D/g, '')
  if (cnpj.length !== 14) return null

  const emCache = cacheCnpjReceita.get(cnpj)
  if (emCache && emCache.expiraEm > Date.now()) return emCache.dados

  // Provedores em ordem de preferência — minhareceita usa o mesmo payload da BrasilAPI.
  const provedores = [
    { url: `${baseUrlConsultaCnpj()}/cnpj/v1/${cnpj}`, fonte: 'brasilapi_rfb' },
    { url: `https://minhareceita.org/${cnpj}`, fonte: 'minhareceita_rfb' },
  ]

  for (let tentativa = 1; tentativa <= TENTATIVAS_POR_PROVEDOR; tentativa++) {
    for (const provedor of provedores) {
      try {
        const oficial = await buscarCnpjEmProvedor(provedor.url, cnpj, provedor.fonte)
        if (oficial) {
          cacheCnpjReceita.set(cnpj, { dados: oficial, expiraEm: Date.now() + TTL_CACHE_CNPJ_MS })
          return oficial
        }
      } catch {
        // timeout/erro de rede — tenta o próximo provedor ou a próxima rodada
      }
    }
    if (tentativa < TENTATIVAS_POR_PROVEDOR) await aguardar(ESPERA_ENTRE_TENTATIVAS_MS)
  }
  return null
}

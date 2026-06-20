/**
 * resolver-vinculo-smart-read-legado.ts — BFF consulta Configurador (S2S)
 * para obter o company id legado da organização com Smart Read contratado.
 */

import { z } from 'zod'
import { AppError } from './app-error.js'
import { extrairMensagemErroRespostaConfigurador } from './extrair-mensagem-erro-resposta.js'

const VinculoLegadoRespostaSchema = z.object({
  id_company_smart_read_legado: z.string().min(1),
})

function companyLegadoPadraoAmbiente(): string | null {
  const padrao = process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO?.trim()
  return padrao || null
}

function overrideLocalDePara(idOrganizacao: string): string | null {
  const bruto = process.env.SMART_READ_DE_PARA_ORGANIZACAO
  if (!bruto || bruto === '{}') return null
  try {
    const mapa = JSON.parse(bruto) as Record<string, string>
    const companyId = mapa[idOrganizacao]?.trim()
    return companyId || null
  } catch {
    throw new AppError('SMART_READ_DE_PARA_ORGANIZACAO inválido (JSON malformado)', 500, 'CONFIG_ERROR')
  }
}

export async function resolverCompanyLegado(idOrganizacao: string): Promise<string> {
  const override = overrideLocalDePara(idOrganizacao)
  if (override) return override

  const padraoLocal = companyLegadoPadraoAmbiente()

  const baseUrl = process.env.CONFIGURATOR_URL?.replace(/\/$/, '')
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO
  if (!baseUrl || !chaveInterna) {
    if (padraoLocal) return padraoLocal
    throw new AppError(
      'CONFIGURATOR_URL ou CHAVE_INTERNA_SERVICO ausente — impossível resolver vínculo Smart Read',
      500,
      'CONFIG_ERROR',
    )
  }

  const params = new URLSearchParams({ id_organizacao: idOrganizacao })
  let resposta: globalThis.Response
  try {
    resposta = await fetch(`${baseUrl}/api/v1/internal/smart-read/vinculo-legado?${params}`, {
      headers: { 'x-chave-interna-servico': chaveInterna },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (erro) {
    if (padraoLocal) return padraoLocal
    throw new AppError(
      `Configurador inacessível ao resolver vínculo Smart Read: ${erro instanceof Error ? erro.message : 'erro de rede'}`,
      503,
      'CONFIGURADOR_INDISPONIVEL',
    )
  }

  if (!resposta.ok) {
    if (resposta.status === 422 && padraoLocal) {
      return padraoLocal
    }

    const fallback = `Configurador respondeu ${resposta.status} ao resolver vínculo Smart Read`
    let mensagem = fallback
    try {
      const corpo: unknown = await resposta.json()
      mensagem = extrairMensagemErroRespostaConfigurador(corpo, fallback)
    } catch {
      const texto = await resposta.text().catch(() => '')
      if (texto) mensagem = texto.slice(0, 300)
    }
    const codigo =
      resposta.status === 422
        ? 'ORGANIZACAO_SEM_VINCULO'
        : resposta.status === 401
          ? 'CONFIG_ERROR'
          : 'CONFIGURADOR_ERRO'
    throw new AppError(mensagem, resposta.status >= 500 ? 503 : resposta.status, codigo)
  }

  const bruto: unknown = await resposta.json()
  return VinculoLegadoRespostaSchema.parse(bruto).id_company_smart_read_legado
}

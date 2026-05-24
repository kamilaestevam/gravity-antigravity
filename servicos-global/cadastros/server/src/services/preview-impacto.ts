/**
 * Consulta os 3 produtos consumidores (Pedido, LPCO, NF Importação) para
 * descobrir quantos registros ATIVOS usam uma Empresa específica hoje.
 *
 * Princípios (seção 8 do documento técnico, Fase 5):
 * - Cada produto expõe `GET /api/v1/fornecedores/:suid/uso` que retorna
 *   `{ ativos: number }`.
 * - URL base de cada produto vem de env opcional. Se ausente -> retorna
 *   `status: 'indisponivel'` (não derruba a resposta).
 * - Timeout de 3s por fetch (AbortSignal.timeout).
 * - Falha de UM produto NUNCA derruba o endpoint (M08 — falha ruidosa
 *   no log + status: 'erro' na resposta).
 */
import type { ImpactoProduto, PreviewImpacto } from '../../../shared/schemas/index.js'

const TIMEOUT_MS = 3000

interface ConfiguracaoProduto {
  produto: ImpactoProduto['produto']
  envBaseUrl: string
}

const PRODUTOS: ReadonlyArray<ConfiguracaoProduto> = [
  { produto: 'pedido', envBaseUrl: 'PEDIDO_BASE_URL' },
  { produto: 'lpco', envBaseUrl: 'LPCO_BASE_URL' },
  { produto: 'nf_importacao', envBaseUrl: 'NF_IMPORTACAO_BASE_URL' },
]

async function consultarUsoNoProduto(
  config: ConfiguracaoProduto,
  suid: string,
  idOrganizacao: string,
): Promise<ImpactoProduto> {
  const baseUrl = process.env[config.envBaseUrl]
  if (!baseUrl) {
    return {
      produto: config.produto,
      ativos: 0,
      status: 'indisponivel',
      mensagem: `${config.envBaseUrl} não configurada`,
    }
  }

  const internalKey = process.env.CHAVE_INTERNA_SERVICO
  if (!internalKey) {
    throw new Error('[preview-impacto] CHAVE_INTERNA_SERVICO ausente — não é possível consultar produtos')
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/fornecedores/${encodeURIComponent(suid)}/uso`
  try {
    const resposta = await fetch(url, {
      method: 'GET',
      headers: {
        'x-internal-key': internalKey,
        'x-id-organizacao': idOrganizacao, // DDD canônico (era x-organizacao-id)
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!resposta.ok) {
      return {
        produto: config.produto,
        ativos: 0,
        status: 'erro',
        mensagem: `HTTP ${resposta.status}`,
      }
    }
    const corpo = (await resposta.json()) as { ativos?: unknown }
    const ativos = typeof corpo.ativos === 'number' ? corpo.ativos : 0
    return { produto: config.produto, ativos, status: 'ok' }
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : String(err)
    console.warn(`[preview-impacto] falha ao consultar ${config.produto}`, { url, mensagem })
    return { produto: config.produto, ativos: 0, status: 'erro', mensagem }
  }
}

export async function consultarImpacto(
  suid: string,
  idOrganizacao: string,
): Promise<PreviewImpacto> {
  const resultados = await Promise.all(
    PRODUTOS.map((cfg) => consultarUsoNoProduto(cfg, suid, idOrganizacao)),
  )

  const total = resultados
    .filter((r) => r.status === 'ok')
    .reduce((acc, r) => acc + r.ativos, 0)

  return { id_fornecedor: suid, total, por_produto: resultados }
}

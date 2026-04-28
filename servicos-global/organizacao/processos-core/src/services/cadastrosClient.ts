/**
 * cadastrosClient.ts — Cliente HTTP do Pedido para o serviço Cadastros.
 *
 * Fase 4 do PASSO 06 DDD (greenfield): toda criação de Pedido busca as
 * Empresas envolvidas pelo SUID e grava um PedidoSnapshotEmpresa por papel
 * (importador/exportador/fabricante). Sem FK física — SUID é referência lógica.
 *
 * Contratos bilaterais (Mandamento 09): `empresaSchema` importado de
 * `tenant/cadastros/shared/schemas`. Nunca duplicar o schema Zod aqui.
 *
 * Autenticação: `x-internal-key` (INTERNAL_SERVICE_KEY).
 * Tenant context: `x-organizacao-id` (id da Organizacao dona do Pedido).
 * Observabilidade: `x-correlation-id` propagado entre serviços.
 *
 * Timeout: 5s — o POST /pedidos é síncrono, não pode segurar o usuário.
 */

import {
  empresaSchema,
  type Empresa,
} from '../../../cadastros/shared/schemas/index.js'
import { AppError } from './saldoEngine.js'

const CADASTROS_URL = process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8030'
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''
const FETCH_TIMEOUT_MS = 5_000

export interface CadastrosRequestContext {
  id_organizacao: string
  correlation_id: string
}

function headersPadrao(ctx: CadastrosRequestContext): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_SERVICE_KEY,
    'x-organizacao-id': ctx.id_organizacao,
    'x-correlation-id': ctx.correlation_id,
  }
}

async function lerCorpoErro(response: Response): Promise<string> {
  try {
    const body = await response.text()
    return body.slice(0, 500)
  } catch {
    return '<corpo ilegível>'
  }
}

/**
 * Busca uma Empresa no Cadastros pelo SUID.
 *
 * - 404 → erro de contrato do chamador (SUID inválido): `AppError(400)`
 * - 5xx / rede / timeout → `AppError(503)` para o caller decidir retry
 * - 2xx → valida resposta com `empresaSchema` (contrato bilateral)
 */
export async function buscarEmpresaPorSuid(
  suid: string,
  ctx: CadastrosRequestContext,
): Promise<Empresa> {
  let response: Response
  try {
    response = await fetch(
      `${CADASTROS_URL}/empresas/${encodeURIComponent(suid)}`,
      {
        method: 'GET',
        headers: headersPadrao(ctx),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
    )
  } catch {
    throw new AppError(503, 'Serviço Cadastros indisponível (rede/timeout)')
  }

  if (response.status === 404) {
    throw new AppError(400, `Empresa nao encontrada no Cadastros (suid=${suid})`)
  }

  if (!response.ok) {
    const corpo = await lerCorpoErro(response)
    if (response.status >= 400 && response.status < 500) {
      throw new AppError(response.status, `Cadastros rejeitou busca de Empresa: ${corpo}`)
    }
    throw new AppError(503, `Cadastros falhou com status ${response.status}`)
  }

  const raw = await response.json()
  return empresaSchema.parse(raw)
}

/**
 * Busca várias Empresas em paralelo. SUIDs duplicados são deduplicados antes
 * de chamar a rede. Retorna um mapa { suid → Empresa } para o caller indexar
 * por papel sem amarrar ordem.
 *
 * IMPORTANTE: chamar SEMPRE fora de `$transaction` — I/O de rede não deve
 * segurar conexão Prisma.
 */
export async function buscarEmpresasPorSuids(
  suids: readonly string[],
  ctx: CadastrosRequestContext,
): Promise<Map<string, Empresa>> {
  const unicos = Array.from(new Set(suids.filter((s) => s.length > 0)))
  if (unicos.length === 0) return new Map()

  const resultados = await Promise.all(
    unicos.map(async (suid) => [suid, await buscarEmpresaPorSuid(suid, ctx)] as const),
  )
  return new Map(resultados)
}

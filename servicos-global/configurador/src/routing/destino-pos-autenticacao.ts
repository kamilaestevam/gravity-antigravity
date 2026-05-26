// destino-pos-autenticacao.ts
// SSOT do porteiro pós-login: decide /trial (onboarding) vs /hub (cliente ativo).
// Fonte: GET /api/v1/me — Clerk só autentica (Mandamento 01).

import { z } from 'zod'

/** Destino enquanto /me não foi resolvido. */
export type DestinoPosAutenticacao = 'carregando' | 'trial' | 'hub'

/**
 * Contrato mínimo bilateral com GET /api/v1/me para o porteiro.
 * Campos além destes podem existir no payload e são ignorados.
 */
export const meDestinoPorteiroSchema = z.object({
  organizacao: z
    .object({
      id_organizacao: z.string().min(1),
    })
    .nullable(),
})

export type MeDestinoPorteiro = z.infer<typeof meDestinoPorteiroSchema>

/**
 * Resolve o destino a partir do status HTTP e do corpo (ou ausência) de /api/v1/me.
 *
 * - 401 / 404 → trial (Clerk autenticado, usuário ainda não provisionado no Prisma)
 * - 200 + organizacao → hub
 * - 200 sem organizacao (null) → trial
 * - Outros erros → trial (fail-safe para signup; onboarding revalida)
 */
export function resolverDestinoPosAutenticacao(
  statusHttp: number,
  corpo: unknown,
): DestinoPosAutenticacao {
  if (statusHttp === 401 || statusHttp === 404) {
    return 'trial'
  }

  if (!statusHttp || statusHttp < 200 || statusHttp >= 300) {
    return 'trial'
  }

  const parsed = meDestinoPorteiroSchema.safeParse(corpo)
  if (!parsed.success) {
    console.warn(
      '[porteiro-pos-autenticacao] payload /me fora do contrato — assumindo trial',
      parsed.error.issues,
    )
    return 'trial'
  }

  return parsed.data.organizacao ? 'hub' : 'trial'
}

export const ROTAS = {
  trial: '/trial',
  hub: '/hub',
  login: '/login',
} as const

const cacheDestino = new Map<string, DestinoPosAutenticacao>()

export function obterDestinoCacheado(userId: string): DestinoPosAutenticacao | undefined {
  return cacheDestino.get(userId)
}

export function gravarDestinoCache(userId: string, destino: DestinoPosAutenticacao): void {
  cacheDestino.set(userId, destino)
}

/** Limpa cache no logout — evita vazamento entre sessões. */
export function limparCacheDestinoPosAutenticacao(): void {
  cacheDestino.clear()
}

/** Invalida destino de um usuário (ex.: após criar organização no onboarding). */
export function invalidarCacheDestinoPosAutenticacao(userId: string): void {
  cacheDestino.delete(userId)
}

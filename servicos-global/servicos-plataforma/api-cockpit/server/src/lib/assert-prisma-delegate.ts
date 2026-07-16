import type { PrismaClient } from '../../../../generated/index.js'

export class PrismaModeloNaoProvisionadoError extends Error {
  readonly code = 'PRISMA_MODEL_NAO_PROVISIONADO'

  constructor(
    public readonly nomeModelo: string,
    public readonly contexto: string,
    public readonly dica?: string,
  ) {
    super(
      [
        `Modelo Prisma "${nomeModelo}" nao provisionado (${contexto}).`,
        dica ?? 'Execute prisma generate e confirme ORGANIZACAO_DATABASE_URL com kit integracao SAP.',
      ].join(' '),
    )
    this.name = 'PrismaModeloNaoProvisionadoError'
  }
}

/**
 * Valida que o delegate do modelo existe no PrismaClient gerado.
 */
export function assertPrismaDelegate<T extends keyof PrismaClient>(
  prisma: PrismaClient,
  nomeModelo: T,
  contexto: string,
): NonNullable<PrismaClient[T]> {
  const delegate = prisma[nomeModelo]
  if (delegate == null) {
    throw new PrismaModeloNaoProvisionadoError(
      String(nomeModelo),
      contexto,
      'Confirme ORGANIZACAO_DATABASE_URL e tabelas do kit integracao SAP (api_credencial_oauth).',
    )
  }
  return delegate as NonNullable<PrismaClient[T]>
}

type DelegateComCreate = { create: (...args: unknown[]) => unknown }

/**
 * Valida que o delegate existe antes de `.create()` — evita "reading 'create' of undefined".
 */
export function assertPrismaDelegateCreate(
  prisma: PrismaClient,
  nomeModelo: keyof PrismaClient,
  contexto: string,
): DelegateComCreate {
  const delegate = assertPrismaDelegate(prisma, nomeModelo, contexto) as DelegateComCreate
  if (typeof delegate.create !== 'function') {
    throw new PrismaModeloNaoProvisionadoError(String(nomeModelo), contexto, 'Delegate sem metodo create.')
  }
  return delegate
}

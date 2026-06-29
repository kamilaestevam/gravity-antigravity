import { Prisma } from '../../../generated/index.js'
import { AppError } from './errors.js'

/** Converte erro Prisma de tabela ausente em 503 fail-loud (não 500 genérico). */
export function relancarErroPrismaGabi(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021') {
      throw new AppError(
        'Banco GABI desatualizado (tabela ausente). Aguarde migrations ou contate suporte.',
        503,
        'GABI_DB_UNAVAILABLE',
      )
    }
  }
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('does not exist') && msg.includes('gabi_')) {
    throw new AppError(
      'Banco GABI desatualizado (schema incompleto). Aguarde migrations ou contate suporte.',
      503,
      'GABI_DB_UNAVAILABLE',
    )
  }
  throw err
}

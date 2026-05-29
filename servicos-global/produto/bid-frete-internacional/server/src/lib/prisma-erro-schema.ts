import { AppError } from './erros.js'

const CODIGOS_SCHEMA_DRIFT = new Set(['P2021', 'P2022', 'P2010'])

/** Converte erro Prisma de coluna/tabela ausente em 503 com mensagem acionável. */
export function relancarSeSchemaDrift(err: unknown): never {
  const code = (err as { code?: string })?.code
  if (typeof code === 'string' && CODIGOS_SCHEMA_DRIFT.has(code)) {
    throw new AppError(
      'Banco desatualizado para bid-frete-internacional. Rode: npm run prisma:generate && npx prisma migrate deploy (na pasta do produto).',
      503,
      'SCHEMA_DRIFT',
    )
  }
  throw err
}

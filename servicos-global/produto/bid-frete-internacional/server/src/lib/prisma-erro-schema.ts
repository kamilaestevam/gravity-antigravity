import { AppError } from './erros.js'

const CODIGOS_SCHEMA_DRIFT = new Set(['P2021', 'P2022', 'P2010'])

/** Campos novos (ex.: armazenagem LCL TASK-000290) — client gitignored exige prisma:generate após pull. */
const CAMPOS_CLIENTE_PRISMA_RECENTES = [
  'incluir_armazenagem_cotacao_bid_frete_internacional',
  'periodos_armazenagem_proposta_bid_frete_internacional',
  'valor_armazenagem_reais_proposta_bid_frete_internacional',
  'dias_periodo_armazenagem_proposta_bid_frete_internacional',
] as const

function mensagemClientePrismaDesatualizado(): string {
  return 'Cliente Prisma desatualizado para bid-frete-internacional. Pare o servidor, rode `npm run prisma:generate` em servicos-global/produto/bid-frete-internacional e reinicie.'
}

function mensagemBancoDesatualizado(): string {
  return 'Banco desatualizado para bid-frete-internacional. Rode `npx prisma migrate deploy` na pasta do produto e, se necessário, `npm run prisma:generate`.'
}

function ehErroClientePrismaDesatualizado(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  if (!message.includes('Unknown argument')) return false
  return CAMPOS_CLIENTE_PRISMA_RECENTES.some((campo) => message.includes(campo))
}

function ehErroIdOrganizacaoAusente(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('Argument `id_organizacao` is missing')
}

/** Converte erro Prisma de coluna/tabela ausente ou client desatualizado em 503 com mensagem acionável. */
export function relancarSeSchemaDrift(err: unknown): never {
  const code = (err as { code?: string })?.code
  if (typeof code === 'string' && CODIGOS_SCHEMA_DRIFT.has(code)) {
    throw new AppError(mensagemBancoDesatualizado(), 503, 'SCHEMA_DRIFT')
  }
  if (ehErroClientePrismaDesatualizado(err)) {
    throw new AppError(mensagemClientePrismaDesatualizado(), 503, 'SCHEMA_DRIFT')
  }
  if (ehErroIdOrganizacaoAusente(err)) {
    throw new AppError('x-id-organizacao obrigatorio — gateway deve propagar o header de tenant', 401, 'UNAUTHORIZED')
  }
  throw err
}

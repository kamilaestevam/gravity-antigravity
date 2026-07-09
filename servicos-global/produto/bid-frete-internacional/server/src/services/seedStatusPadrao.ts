/**
 * seedStatusPadrao.ts — Status kanban canônicos (BID Frete Internacional)
 */
import type { PrismaClient } from '../generated/client/index.js'

interface StatusSeed {
  nome_status_cotacao_config_bid_frete_internacional: string
  rotulo_status_cotacao_config_bid_frete_internacional: string
  cor_status_cotacao_config_bid_frete_internacional: string
  ordem_status_cotacao_config_bid_frete_internacional: number
  gerenciado_sistema_status_cotacao_config_bid_frete_internacional: boolean
  padrao_status_cotacao_config_bid_frete_internacional: boolean
}

const STATUS_CANONICOS: StatusSeed[] = [
  { nome_status_cotacao_config_bid_frete_internacional: 'RASCUNHO', rotulo_status_cotacao_config_bid_frete_internacional: 'Rascunho', cor_status_cotacao_config_bid_frete_internacional: '#94a3b8', ordem_status_cotacao_config_bid_frete_internacional: 1, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'ENVIADA_FORNECEDORES', rotulo_status_cotacao_config_bid_frete_internacional: 'Enviada ao fornecedor', cor_status_cotacao_config_bid_frete_internacional: '#60a5fa', ordem_status_cotacao_config_bid_frete_internacional: 2, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'EM_COTACAO', rotulo_status_cotacao_config_bid_frete_internacional: 'Em cotação', cor_status_cotacao_config_bid_frete_internacional: '#fbbf24', ordem_status_cotacao_config_bid_frete_internacional: 3, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'COTACAO_ALTERADA', rotulo_status_cotacao_config_bid_frete_internacional: 'Cotação alterada', cor_status_cotacao_config_bid_frete_internacional: '#f97316', ordem_status_cotacao_config_bid_frete_internacional: 4, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'AGUARDANDO_APROVACAO', rotulo_status_cotacao_config_bid_frete_internacional: 'Aprovação pendente', cor_status_cotacao_config_bid_frete_internacional: '#818cf8', ordem_status_cotacao_config_bid_frete_internacional: 5, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'APROVADA', rotulo_status_cotacao_config_bid_frete_internacional: 'Aprovada', cor_status_cotacao_config_bid_frete_internacional: '#10b981', ordem_status_cotacao_config_bid_frete_internacional: 6, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'REPROVADA', rotulo_status_cotacao_config_bid_frete_internacional: 'Reprovada', cor_status_cotacao_config_bid_frete_internacional: '#ef4444', ordem_status_cotacao_config_bid_frete_internacional: 7, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'CANCELADA', rotulo_status_cotacao_config_bid_frete_internacional: 'Cancelada', cor_status_cotacao_config_bid_frete_internacional: '#6b7280', ordem_status_cotacao_config_bid_frete_internacional: 8, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'FALTA_INFORMACAO', rotulo_status_cotacao_config_bid_frete_internacional: 'Falta de informação', cor_status_cotacao_config_bid_frete_internacional: '#fb7185', ordem_status_cotacao_config_bid_frete_internacional: 9, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
  { nome_status_cotacao_config_bid_frete_internacional: 'EXPIRADA', rotulo_status_cotacao_config_bid_frete_internacional: 'Expirada', cor_status_cotacao_config_bid_frete_internacional: '#d1d5db', ordem_status_cotacao_config_bid_frete_internacional: 10, gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true, padrao_status_cotacao_config_bid_frete_internacional: true },
]

export const NOMES_STATUS_CANONICOS = STATUS_CANONICOS.map(
  (s) => s.nome_status_cotacao_config_bid_frete_internacional,
)

export async function seedStatusPadrao(prisma: PrismaClient, idOrganizacao: string): Promise<void> {
  const creates = STATUS_CANONICOS.map((s) =>
    prisma.statusCotacaoConfigBidFreteInternacional.create({
      data: {
        id_organizacao: idOrganizacao,
        ...s,
      },
    }),
  )

  await prisma.$transaction(creates)
}

export async function garantirStatusCanonicos(
  prisma: PrismaClient,
  idOrganizacao: string,
): Promise<void> {
  const existentes = await prisma.statusCotacaoConfigBidFreteInternacional.findMany({
    where: { id_organizacao: idOrganizacao },
    select: { nome_status_cotacao_config_bid_frete_internacional: true },
  })
  const nomesExistentes = new Set(
    existentes.map((e) => e.nome_status_cotacao_config_bid_frete_internacional),
  )

  const faltantes = STATUS_CANONICOS.filter(
    (s) => !nomesExistentes.has(s.nome_status_cotacao_config_bid_frete_internacional),
  )

  if (faltantes.length > 0) {
    await prisma.$transaction(
      faltantes.map((s) =>
        prisma.statusCotacaoConfigBidFreteInternacional.create({
          data: {
            id_organizacao: idOrganizacao,
            ...s,
          },
        }),
      ),
    )
  }

  await prisma.statusCotacaoConfigBidFreteInternacional.updateMany({
    where: {
      id_organizacao: idOrganizacao,
      nome_status_cotacao_config_bid_frete_internacional: { in: NOMES_STATUS_CANONICOS },
    },
    data: {
      gerenciado_sistema_status_cotacao_config_bid_frete_internacional: true,
      padrao_status_cotacao_config_bid_frete_internacional: true,
    },
  })
}

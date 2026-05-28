/**
 * seedStatusBidPadrao.ts — Status kanban canônicos do BID (conjunto)
 */
import type { PrismaClient } from '../generated/client/index.js'

interface StatusBidSeed {
  nome_status_bid_config_bid_frete_internacional: string
  rotulo_status_bid_config_bid_frete_internacional: string
  cor_status_bid_config_bid_frete_internacional: string
  ordem_status_bid_config_bid_frete_internacional: number
  gerenciado_sistema_status_bid_config_bid_frete_internacional: boolean
  padrao_status_bid_config_bid_frete_internacional: boolean
}

const STATUS_BID_CANONICOS: StatusBidSeed[] = [
  { nome_status_bid_config_bid_frete_internacional: 'RASCUNHO', rotulo_status_bid_config_bid_frete_internacional: 'Rascunho', cor_status_bid_config_bid_frete_internacional: '#94a3b8', ordem_status_bid_config_bid_frete_internacional: 1, gerenciado_sistema_status_bid_config_bid_frete_internacional: true, padrao_status_bid_config_bid_frete_internacional: true },
  { nome_status_bid_config_bid_frete_internacional: 'EM_ANDAMENTO', rotulo_status_bid_config_bid_frete_internacional: 'Em andamento', cor_status_bid_config_bid_frete_internacional: '#60a5fa', ordem_status_bid_config_bid_frete_internacional: 2, gerenciado_sistema_status_bid_config_bid_frete_internacional: true, padrao_status_bid_config_bid_frete_internacional: false },
  { nome_status_bid_config_bid_frete_internacional: 'PARCIALMENTE_CONCLUIDO', rotulo_status_bid_config_bid_frete_internacional: 'Parcialmente concluído', cor_status_bid_config_bid_frete_internacional: '#fbbf24', ordem_status_bid_config_bid_frete_internacional: 3, gerenciado_sistema_status_bid_config_bid_frete_internacional: false, padrao_status_bid_config_bid_frete_internacional: false },
  { nome_status_bid_config_bid_frete_internacional: 'CONCLUIDO', rotulo_status_bid_config_bid_frete_internacional: 'Concluído', cor_status_bid_config_bid_frete_internacional: '#10b981', ordem_status_bid_config_bid_frete_internacional: 4, gerenciado_sistema_status_bid_config_bid_frete_internacional: false, padrao_status_bid_config_bid_frete_internacional: false },
  { nome_status_bid_config_bid_frete_internacional: 'CANCELADO', rotulo_status_bid_config_bid_frete_internacional: 'Cancelado', cor_status_bid_config_bid_frete_internacional: '#6b7280', ordem_status_bid_config_bid_frete_internacional: 5, gerenciado_sistema_status_bid_config_bid_frete_internacional: true, padrao_status_bid_config_bid_frete_internacional: false },
]

export async function seedStatusBidPadrao(prisma: PrismaClient, idOrganizacao: string): Promise<void> {
  const creates = STATUS_BID_CANONICOS.map((s) =>
    prisma.statusBidConfigBidFreteInternacional.create({
      data: {
        id_organizacao: idOrganizacao,
        ...s,
      },
    }),
  )

  await prisma.$transaction(creates)
}

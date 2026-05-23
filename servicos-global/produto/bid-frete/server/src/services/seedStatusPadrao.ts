/**
 * seedStatusPadrao.ts — Cria os 9 status canônicos para uma organização
 * Chamado via lazy seed no GET /config/status quando count === 0.
 */

interface StatusSeed {
  nome_status_cotacao_bid_frete: string
  rotulo_status_cotacao_bid_frete: string
  cor_status_cotacao_bid_frete: string
  ordem_status_cotacao_bid_frete: number
  gerenciado_sistema_status_cotacao_bid_frete: boolean
  padrao_status_cotacao_bid_frete: boolean
}

const STATUS_CANONICOS: StatusSeed[] = [
  { nome_status_cotacao_bid_frete: 'RASCUNHO', rotulo_status_cotacao_bid_frete: 'Rascunho', cor_status_cotacao_bid_frete: '#94a3b8', ordem_status_cotacao_bid_frete: 1, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: true },
  { nome_status_cotacao_bid_frete: 'ENVIADA_FORNECEDORES', rotulo_status_cotacao_bid_frete: 'Enviada ao fornecedor', cor_status_cotacao_bid_frete: '#60a5fa', ordem_status_cotacao_bid_frete: 2, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'EM_COTACAO', rotulo_status_cotacao_bid_frete: 'Em cotação', cor_status_cotacao_bid_frete: '#fbbf24', ordem_status_cotacao_bid_frete: 3, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'AGUARDANDO_APROVACAO', rotulo_status_cotacao_bid_frete: 'Aprovação pendente', cor_status_cotacao_bid_frete: '#818cf8', ordem_status_cotacao_bid_frete: 4, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'APROVADA', rotulo_status_cotacao_bid_frete: 'Aprovada', cor_status_cotacao_bid_frete: '#10b981', ordem_status_cotacao_bid_frete: 5, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'REPROVADA', rotulo_status_cotacao_bid_frete: 'Reprovada', cor_status_cotacao_bid_frete: '#ef4444', ordem_status_cotacao_bid_frete: 6, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'CANCELADA', rotulo_status_cotacao_bid_frete: 'Cancelada', cor_status_cotacao_bid_frete: '#6b7280', ordem_status_cotacao_bid_frete: 7, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'FALTA_INFORMACAO', rotulo_status_cotacao_bid_frete: 'Falta de informação', cor_status_cotacao_bid_frete: '#fb7185', ordem_status_cotacao_bid_frete: 8, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
  { nome_status_cotacao_bid_frete: 'EXPIRADA', rotulo_status_cotacao_bid_frete: 'Expirada', cor_status_cotacao_bid_frete: '#d1d5db', ordem_status_cotacao_bid_frete: 9, gerenciado_sistema_status_cotacao_bid_frete: false, padrao_status_cotacao_bid_frete: false },
]

import type { PrismaClient } from '@prisma/client'

export async function seedStatusPadrao(prisma: PrismaClient, idOrganizacao: string): Promise<void> {
  const creates = STATUS_CANONICOS.map((s) =>
    prisma.statusCotacaoBidFrete.create({
      data: {
        id_organizacao: idOrganizacao,
        ...s,
      },
    })
  )

  await prisma.$transaction(creates)
}

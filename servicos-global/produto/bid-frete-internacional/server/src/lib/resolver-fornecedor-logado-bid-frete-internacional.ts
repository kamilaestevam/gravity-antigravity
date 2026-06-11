/**
 * Resolve o fornecedor operacional (BID) do usuário logado.
 * Ordem: id_usuario/id_clerk no espelho BID → vínculo Cadastros (auto-grava id_usuario no BID).
 */

import type { Request } from 'express'
import { z } from 'zod'
import { AppError } from './erros.js'
import { fetchCadastrosJson } from './cadastros-client.js'
import {
  obterParceiroFreteCadastros,
  sincronizarFornecedorCadastros,
} from '../services/sincronizar-fornecedores-cadastros.js'
import { prisma as basePrisma } from '../middleware/isolamento-tenant.js'

const vinculosPorUsuarioCadastrosSchema = z.object({
  itens: z.array(
    z.object({
      id_fornecedor: z.string().min(1),
      id_organizacao: z.string().min(1),
      status_fornecedor_organizacao: z.enum(['ATIVO', 'INATIVO', 'PENDENTE_APROVACAO']),
      id_usuario: z.string().nullable(),
    }),
  ),
  total: z.number().int().nonnegative(),
})

type FornecedorBid = Record<string, unknown> & {
  id_fornecedor_bid_frete_internacional: string
}

async function listarVinculosCadastrosPorUsuario(
  idOrganizacao: string,
  idUsuario: string,
): Promise<z.infer<typeof vinculosPorUsuarioCadastrosSchema>['itens']> {
  const raw = await fetchCadastrosJson<unknown>(
    '/api/v1/cadastros/fornecedores-organizacao/por-usuario',
    { id_usuario: idUsuario, status: 'ATIVO' },
    { idOrganizacao },
  )
  const parsed = vinculosPorUsuarioCadastrosSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error('Resposta Cadastros inválida (por-usuario)')
  }
  return parsed.data.itens
}

export async function vincularUsuarioNoFornecedorBidFrete(args: {
  prisma: unknown
  idOrganizacao: string
  idFornecedor: string
  id_usuario: string
  id_clerk_usuario?: string | null
}): Promise<FornecedorBid> {
  const db = args.prisma as {
    fornecedorBidFreteInternacional: {
      findFirst: (q: unknown) => Promise<FornecedorBid | null>
      update: (q: unknown) => Promise<FornecedorBid>
    }
  }

  let fornecedor = await db.fornecedorBidFreteInternacional.findFirst({
    where: {
      id_fornecedor_bid_frete_internacional: args.idFornecedor,
      id_organizacao: args.idOrganizacao,
    },
  })

  if (!fornecedor) {
    const parceiro = await obterParceiroFreteCadastros(args.idOrganizacao, args.idFornecedor)
    if (!parceiro) {
      throw new AppError('Fornecedor nao encontrado no Cadastros', 404, 'FORNECEDOR_NAO_ENCONTRADO')
    }
    await sincronizarFornecedorCadastros(basePrisma, args.idOrganizacao, parceiro)
    fornecedor = await db.fornecedorBidFreteInternacional.findFirst({
      where: {
        id_fornecedor_bid_frete_internacional: args.idFornecedor,
        id_organizacao: args.idOrganizacao,
      },
    })
    if (!fornecedor) {
      throw new AppError('Fornecedor nao encontrado', 404, 'NOT_FOUND')
    }
  }

  const clerk =
    args.id_clerk_usuario && !args.id_clerk_usuario.startsWith('pending_')
      ? args.id_clerk_usuario
      : null

  return db.fornecedorBidFreteInternacional.update({
    where: { id_fornecedor_bid_frete_internacional: args.idFornecedor },
    data: {
      id_usuario: args.id_usuario,
      ...(clerk ? { id_clerk_usuario: clerk } : {}),
    },
  })
}

async function resolverPorVinculoCadastros(
  req: Request,
  userId: string,
  idOrganizacao: string,
): Promise<FornecedorBid | null> {
  let vinculos: z.infer<typeof vinculosPorUsuarioCadastrosSchema>['itens']
  try {
    vinculos = await listarVinculosCadastrosPorUsuario(idOrganizacao, userId)
  } catch (err) {
    console.warn('[bid-frete/resolver-fornecedor] Cadastros por-usuario indisponível:', err instanceof Error ? err.message : err)
    return null
  }

  const naOrg = vinculos.filter(v => v.id_organizacao === idOrganizacao && v.status_fornecedor_organizacao === 'ATIVO')
  const candidatos = naOrg.length > 0 ? naOrg : vinculos.filter(v => v.status_fornecedor_organizacao === 'ATIVO')
  const vinculo = candidatos[0]
  if (!vinculo) return null

  try {
    return await vincularUsuarioNoFornecedorBidFrete({
      prisma: req.prisma,
      idOrganizacao,
      idFornecedor: vinculo.id_fornecedor,
      id_usuario: userId,
    })
  } catch (err) {
    console.warn('[bid-frete/resolver-fornecedor] auto-vinculo Cadastros falhou:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function resolverFornecedorLogado(req: Request): Promise<FornecedorBid> {
  const userId = req.headers['x-id-usuario'] as string
  if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

  const idOrganizacao =
    (req.tenantId as string | undefined)
    ?? (req.headers['x-id-organizacao'] as string | undefined)
  if (!idOrganizacao) {
    throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')
  }

  const db = req.prisma as {
    fornecedorBidFreteInternacional: {
      findFirst: (q: unknown) => Promise<FornecedorBid | null>
    }
  }

  let fornecedor = await db.fornecedorBidFreteInternacional.findFirst({
    where: {
      id_organizacao: idOrganizacao,
      OR: [{ id_usuario: userId }, { id_clerk_usuario: userId }],
    },
  })

  if (!fornecedor) {
    fornecedor = await resolverPorVinculoCadastros(req, userId, idOrganizacao)
  }

  if (!fornecedor) {
    throw new AppError('Fornecedor nao encontrado para este usuario', 404, 'FORNECEDOR_NAO_ENCONTRADO')
  }

  return fornecedor
}

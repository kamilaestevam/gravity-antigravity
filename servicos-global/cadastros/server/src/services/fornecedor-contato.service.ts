import { randomUUID } from 'node:crypto'
import type { Prisma, FornecedorContato as PrismaFornecedorContato } from '../../generated/index.js'
import { prisma } from '../lib/prisma.js'
import {
  resolverEmailPrincipalFornecedor,
  type FornecedorContatoInput,
} from '../../../shared/schemas/fornecedor-contato.schema.js'

export function toFornecedorContatoDto(c: PrismaFornecedorContato): Record<string, unknown> {
  return {
    id_fornecedor_contato: c.id_fornecedor_contato,
    id_fornecedor: c.id_fornecedor,
    tipo_canal_fornecedor_contato: c.tipo_canal_fornecedor_contato,
    valor_fornecedor_contato: c.valor_fornecedor_contato,
    principal_fornecedor_contato: c.principal_fornecedor_contato,
    ordem_fornecedor_contato: c.ordem_fornecedor_contato,
  }
}

export async function listarContatosFornecedor(id_fornecedor: string): Promise<PrismaFornecedorContato[]> {
  return prisma.fornecedorContato.findMany({
    where: { id_fornecedor },
    orderBy: [{ tipo_canal_fornecedor_contato: 'asc' }, { ordem_fornecedor_contato: 'asc' }],
  })
}

export function resolverColunasEscalaresContato(contatos: FornecedorContatoInput[]): {
  email_fornecedor: string | null
  telefone_fornecedor: string | null
  whatsapp_fornecedor: string | null
} {
  const pickPrincipal = (tipo: FornecedorContatoInput['tipo_canal_fornecedor_contato']) => {
    const lista = contatos
      .filter((c) => c.tipo_canal_fornecedor_contato === tipo)
      .sort((a, b) => {
        if (a.principal_fornecedor_contato !== b.principal_fornecedor_contato) {
          return a.principal_fornecedor_contato ? -1 : 1
        }
        return a.ordem_fornecedor_contato - b.ordem_fornecedor_contato
      })
    const valor = lista[0]?.valor_fornecedor_contato?.trim()
    return valor || null
  }
  return {
    email_fornecedor: resolverEmailPrincipalFornecedor(contatos, null),
    telefone_fornecedor: pickPrincipal('TELEFONE'),
    whatsapp_fornecedor: pickPrincipal('WHATSAPP'),
  }
}

export async function sincronizarContatosFornecedor(args: {
  id_fornecedor: string
  id_organizacao: string
  contatos: FornecedorContatoInput[]
}): Promise<PrismaFornecedorContato[]> {
  const { id_fornecedor, id_organizacao, contatos } = args

  await prisma.$transaction(async (tx) => {
    await tx.fornecedorContato.deleteMany({ where: { id_fornecedor } })
    if (contatos.length > 0) {
      await tx.fornecedorContato.createMany({
        data: contatos.map((c) => ({
          id_fornecedor_contato: randomUUID(),
          id_fornecedor,
          id_organizacao_cadastro_fornecedor_contato: id_organizacao,
          tipo_canal_fornecedor_contato: c.tipo_canal_fornecedor_contato,
          valor_fornecedor_contato: c.valor_fornecedor_contato.trim(),
          principal_fornecedor_contato: c.principal_fornecedor_contato,
          ordem_fornecedor_contato: c.ordem_fornecedor_contato,
        })),
      })
    }
    const escalares = resolverColunasEscalaresContato(contatos)
    await tx.fornecedor.update({
      where: { id_fornecedor },
      data: {
        email_fornecedor: escalares.email_fornecedor,
        telefone_fornecedor: escalares.telefone_fornecedor,
        whatsapp_fornecedor: escalares.whatsapp_fornecedor,
      },
    })
  })

  return listarContatosFornecedor(id_fornecedor)
}

/** Monta contatos a partir do payload (contatos explícitos ou colunas legadas). */
export function normalizarContatosPayload(body: {
  contatos_fornecedor?: FornecedorContatoInput[]
  email_fornecedor?: string | null
  telefone_fornecedor?: string | null
  whatsapp_fornecedor?: string | null
}): FornecedorContatoInput[] | undefined {
  if (body.contatos_fornecedor !== undefined) {
    return body.contatos_fornecedor
  }
  const contatos: FornecedorContatoInput[] = []
  if (body.email_fornecedor?.trim()) {
    contatos.push({
      tipo_canal_fornecedor_contato: 'EMAIL',
      valor_fornecedor_contato: body.email_fornecedor.trim(),
      principal_fornecedor_contato: true,
      ordem_fornecedor_contato: 0,
    })
  }
  if (body.telefone_fornecedor?.trim()) {
    contatos.push({
      tipo_canal_fornecedor_contato: 'TELEFONE',
      valor_fornecedor_contato: body.telefone_fornecedor.trim(),
      principal_fornecedor_contato: true,
      ordem_fornecedor_contato: 0,
    })
  }
  if (body.whatsapp_fornecedor?.trim()) {
    contatos.push({
      tipo_canal_fornecedor_contato: 'WHATSAPP',
      valor_fornecedor_contato: body.whatsapp_fornecedor.trim(),
      principal_fornecedor_contato: true,
      ordem_fornecedor_contato: 0,
    })
  }
  if (
    body.email_fornecedor !== undefined
    || body.telefone_fornecedor !== undefined
    || body.whatsapp_fornecedor !== undefined
  ) {
    return contatos
  }
  return undefined
}

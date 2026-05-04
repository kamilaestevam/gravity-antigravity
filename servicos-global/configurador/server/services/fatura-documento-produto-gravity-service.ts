// server/services/fatura-documento-produto-gravity-service.ts
// CRUD de ProdutoGravityFaturaDocumento — anexos de fatura (boleto, NF-e, recibo, PDF, outro).
// Soft-delete via data_exclusao_*.

import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { getStorageAdapter } from '../lib/storage/storageAdapter.js'
import type { TipoDocumentoFaturaProdutoGravity } from '../../../../configurador/generated/index.js'

export interface AnexarDocumentoParams {
  id_organizacao:                                    string
  id_fatura_produto_gravity:                         string
  tipo_documento_fatura_produto_gravity:             TipoDocumentoFaturaProdutoGravity
  nome_documento_fatura_produto_gravity:             string
  conteudo:                                          Buffer
  mime_documento_fatura_produto_gravity?:            string
  id_usuario_anexou_documento_fatura_produto_gravity?: string
}

export const faturaDocumentoProdutoGravityServico = {
  async listar(id_organizacao: string, id_fatura_produto_gravity: string) {
    return prisma.produtoGravityFaturaDocumento.findMany({
      where: {
        id_organizacao,
        id_fatura_produto_gravity,
        data_exclusao_documento_fatura_produto_gravity: null,
      },
      orderBy: { data_criacao_documento_fatura_produto_gravity: 'asc' },
    })
  },

  async anexar(params: AnexarDocumentoParams) {
    // Confirma que a fatura existe e pertence à organização
    const fatura = await prisma.produtoGravityFatura.findFirst({
      where: {
        id_fatura_produto_gravity: params.id_fatura_produto_gravity,
        id_organizacao:            params.id_organizacao,
      },
      select: { id_fatura_produto_gravity: true },
    })
    if (!fatura) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }

    const storage = getStorageAdapter()
    const { chave, tamanho_bytes } = await storage.guardar({
      conteudo:                  params.conteudo,
      nome_original:             params.nome_documento_fatura_produto_gravity,
      mime:                      params.mime_documento_fatura_produto_gravity ?? 'application/octet-stream',
      id_organizacao:            params.id_organizacao,
      id_fatura_produto_gravity: params.id_fatura_produto_gravity,
    })

    return prisma.produtoGravityFaturaDocumento.create({
      data: {
        id_organizacao:                            params.id_organizacao,
        id_fatura_produto_gravity:                 params.id_fatura_produto_gravity,
        tipo_documento_fatura_produto_gravity:     params.tipo_documento_fatura_produto_gravity,
        nome_documento_fatura_produto_gravity:     params.nome_documento_fatura_produto_gravity,
        url_documento_fatura_produto_gravity:      chave,
        tamanho_documento_fatura_produto_gravity:  tamanho_bytes,
        mime_documento_fatura_produto_gravity:     params.mime_documento_fatura_produto_gravity,
        id_usuario_anexou_documento_fatura_produto_gravity: params.id_usuario_anexou_documento_fatura_produto_gravity,
      },
    })
  },

  async excluirSoftDelete(id_organizacao: string, id_documento: string) {
    const doc = await prisma.produtoGravityFaturaDocumento.findFirst({
      where: { id_documento_fatura_produto_gravity: id_documento, id_organizacao },
    })
    if (!doc) throw new AppError('Documento não encontrado', 404, 'NOT_FOUND')
    if (doc.data_exclusao_documento_fatura_produto_gravity) return doc

    return prisma.produtoGravityFaturaDocumento.update({
      where: { id_documento_fatura_produto_gravity: id_documento },
      data:  { data_exclusao_documento_fatura_produto_gravity: new Date() },
    })
  },

  async obterParaDownload(id_organizacao: string, id_documento: string) {
    const doc = await prisma.produtoGravityFaturaDocumento.findFirst({
      where: {
        id_documento_fatura_produto_gravity:            id_documento,
        id_organizacao,
        data_exclusao_documento_fatura_produto_gravity: null,
      },
    })
    if (!doc) throw new AppError('Documento não encontrado', 404, 'NOT_FOUND')
    return doc
  },
}

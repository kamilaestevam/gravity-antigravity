import { Prisma } from '../../../generated/index.js'
import type { Request } from 'express'

/**
 * Tipos de patente do usuário (campo `tipo_usuario`).
 * Alinhado ao enum Prisma `TipoUsuario` migrado em 2026-04-30
 * (`PADRAO`/`FORNECEDOR` substituíram os legados `STANDARD`/`SUPPLIER`).
 */
export type TipoUsuario =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MASTER'
  | 'PADRAO'
  | 'FORNECEDOR'

/**
 * Contexto autenticado de um usuário, extraído de `req.auth` populado
 * upstream pelo `requireAuth` do Configurador (Mandamento 01: Clerk só
 * autenticação, autorização vem do Prisma).
 */
export interface UsuarioAutenticado {
  id_usuario:     string
  nome_usuario:   string
  tipo_usuario:   TipoUsuario
  id_organizacao: string
}

/**
 * Constrói o filtro Prisma de visibilidade do `historico_log` baseado em
 * `tipo_usuario`.
 *
 * - SUPER_ADMIN / ADMIN  → veem tudo (sem filtro de organização)
 * - MASTER               → veem toda a organização (filtro por id_organizacao)
 * - PADRAO / FORNECEDOR  → veem registros onde figuram como ator (`id_ator_historico_log`)
 *                          ou alvo (`id_usuario`)
 */
export function montarFiltroVisibilidadeHistoricoLog(
  usuario: UsuarioAutenticado,
): Prisma.HistoricoLogWhereInput {
  if (usuario.tipo_usuario === 'SUPER_ADMIN' || usuario.tipo_usuario === 'ADMIN') {
    return {}
  }
  if (usuario.tipo_usuario === 'MASTER') {
    return { id_organizacao: usuario.id_organizacao }
  }
  return {
    id_organizacao: usuario.id_organizacao,
    OR: [
      { id_usuario: usuario.id_usuario },
      { id_ator_historico_log: usuario.id_usuario },
    ],
  }
}

/**
 * Extrai `UsuarioAutenticado` de `req.auth`. Retorna null em chamadas internas
 * S2S (que usam `x-internal-key` em vez de Clerk JWT).
 */
export function extrairUsuarioAutenticado(req: Request): UsuarioAutenticado | null {
  const auth = req.auth
  if (!auth?.id_usuario || !auth?.id_organizacao) return null
  return {
    id_usuario:     auth.id_usuario,
    nome_usuario:   auth.nome_usuario ?? auth.id_usuario,
    tipo_usuario:   (auth.tipo_usuario ?? 'PADRAO') as TipoUsuario,
    id_organizacao: auth.id_organizacao,
  }
}

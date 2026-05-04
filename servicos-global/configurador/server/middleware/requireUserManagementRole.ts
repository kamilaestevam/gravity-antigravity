// server/middleware/requireUserManagementRole.ts
//
// Autoriza ações de gestão de usuários da organização (alterar tipo_usuario,
// substituir vínculos de workspace).
//
// Aceita: SUPER_ADMIN, ADMIN (equipe Gravity — escopo global) e MASTER (cliente
// — escopo da própria id_organizacao). Substitui `requireMasterRole` nas rotas
// que fazem sentido para os três perfis (Mandamento 04 — LIMBO).
//
// Decisões NÃO embutidas neste middleware (ficam nas regras de cada rota):
//  - Anti-escalada (ator ≠ alvo)
//  - Anti-bricking (último Master da organização)
//  - Whitelist de tipos por ator (SAdmin pode setar SAdmin/Admin; Admin não)
//  - IDOR cross-organização (alvo precisa pertencer à mesma org, exceto SAdmin)
//
// Deve ser usado APÓS requireAuth.

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

const TIPOS_AUTORIZADOS = new Set(['SUPER_ADMIN', 'ADMIN', 'MASTER'])

export function requireUserManagementRole(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.auth?.tipo_usuario) {
    next(new AppError('Autenticação necessária', 401, 'UNAUTHORIZED'))
    return
  }

  if (!TIPOS_AUTORIZADOS.has(req.auth.tipo_usuario)) {
    next(new AppError(
      'Acesso restrito a Master, Admin ou Super Admin',
      403,
      'FORBIDDEN',
    ))
    return
  }

  next()
}

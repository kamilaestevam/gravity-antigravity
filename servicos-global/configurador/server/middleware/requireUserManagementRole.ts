// server/middleware/requireUserManagementRole.ts
//
// Autoriza ações de gestão de usuários da organização (alterar tipo_usuario,
// substituir vínculos de workspace, configurar permissões granulares).
//
// Aceita: SUPER_ADMIN (equipe Gravity — escopo global) e MASTER (cliente —
// escopo da própria id_organizacao). NÃO aceita ADMIN (decisão dono
// 2026-05-11): ADMIN é read-only global — visualiza tudo, edita só onde o
// SAdmin concedeu permissão explícita, e edição de tipo_usuario NÃO é uma
// das ações delegáveis (ver skill `seguranca/permissoes`).
//
// Decisões NÃO embutidas neste middleware (ficam nas regras de cada rota):
//  - Anti-escalada (ator ≠ alvo) — exceto SAdmin que pode editar próprio (Interpretação B)
//  - Anti-bricking (último Master da organização / último SAdmin do sistema)
//  - Whitelist de tipos por ator (SAdmin pode atribuir SAdmin/ADMIN apenas em
//    orgs com hospeda_colaboradores_gravity=true)
//  - IDOR cross-organização (alvo precisa pertencer à mesma org, exceto SAdmin)
//
// Deve ser usado APÓS requireAuth.

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

const TIPOS_AUTORIZADOS = new Set(['SUPER_ADMIN', 'MASTER'])

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
      'Acesso restrito a Master ou Super Admin (ADMIN é read-only global)',
      403,
      'FORBIDDEN',
    ))
    return
  }

  next()
}

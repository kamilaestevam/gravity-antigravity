// server/middleware/requireSelfOrUserManagementRole.ts
//
// Variante de `requireUserManagementRole` que aceita TAMBÉM auto-leitura:
// se `req.params.id_usuario === req.auth.id_usuario` o middleware deixa
// passar (qualquer tipo de usuário pode ler suas próprias permissões).
//
// Caso contrário, aplica a regra padrão (SUPER_ADMIN ou MASTER).
//
// Decisão dono 2026-05-13: STANDARD/FORNECEDOR precisam ler as próprias
// permissões granulares para que o frontend do produto Pedido (e futuros)
// monte a UI gateada. Sem self-read, eles caíam em 403 e o hook
// `usePermissao` falhava silenciosamente.
//
// Usar SOMENTE em GET (rotas de leitura). PUT/POST continuam usando
// `requireUserManagementRole` (mutar permissões nunca é self-read).
//
// Deve ser usado APÓS requireAuth — depende de `req.auth.id_usuario`.

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

const TIPOS_AUTORIZADOS = new Set(['SUPER_ADMIN', 'MASTER', 'ADMIN'])

export function requireSelfOrUserManagementRole(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.auth?.tipo_usuario || !req.auth?.id_usuario) {
    next(new AppError('Autenticação necessária', 401, 'UNAUTHORIZED'))
    return
  }

  // 1) Auto-leitura: id_usuario do path === id_usuario do ator.
  //    Permite que STANDARD/FORNECEDOR leiam as próprias permissões.
  if (req.params.id_usuario && req.params.id_usuario === req.auth.id_usuario) {
    next()
    return
  }

  // 2) Caso contrário, exige cargo de gestão.
  //    ADMIN aqui é apenas LEITURA — a rota GET nunca muta. O bloqueio de
  //    edição continua em `requireUserManagementRole` (que exclui ADMIN).
  if (!TIPOS_AUTORIZADOS.has(req.auth.tipo_usuario)) {
    next(new AppError(
      'Acesso restrito a Master, Super Admin ou Admin para ler permissões de outros usuários',
      403,
      'FORBIDDEN',
    ))
    return
  }

  next()
}

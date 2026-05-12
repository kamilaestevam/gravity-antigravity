// server/middleware/requireConfiguradorAccess.ts
//
// Autorização da área Configurador (/workspace/*).
//
// Modelo de 3 eixos (ver skill `seguranca/route-authorization`):
//   - LEITURA  : MASTER + SUPER_ADMIN + ADMIN   (ADMIN é read-only global)
//   - ESCRITA  : MASTER + SUPER_ADMIN           (ADMIN não muta)
//
// Mandamento 01: tipo_usuario vem de req.auth (banco), nunca de Clerk.
// Mandamento 08: fail-closed — sem tipo_usuario => 401, tipo não autorizado => 403.
// Mandamento 04: Master/SuperAdmin nunca são bloqueados.
//
// Deve ser usado APÓS requireAuth.

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

const TIPOS_LEITURA = new Set(['SUPER_ADMIN', 'ADMIN', 'MASTER'])
const TIPOS_ESCRITA = new Set(['SUPER_ADMIN', 'MASTER'])

/**
 * Permite leitura na área Configurador. ADMIN entra como read-only.
 * Use em rotas GET de /workspace/* (organização, workspaces, assinaturas, etc).
 */
export function requireConfiguradorAccess(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.auth?.tipo_usuario) {
    next(new AppError('Autenticação necessária', 401, 'UNAUTHORIZED'))
    return
  }

  if (!TIPOS_LEITURA.has(req.auth.tipo_usuario)) {
    next(new AppError(
      'Acesso restrito à administração da organização',
      403,
      'FORBIDDEN',
    ))
    return
  }

  next()
}

/**
 * Permite mutação na área Configurador. ADMIN é bloqueado (read-only).
 * Use em rotas POST/PATCH/DELETE de /workspace/* (organização, workspaces,
 * assinaturas, faturamento, integrações ERP, tokens API, webhooks, etc).
 */
export function requireConfiguradorMutation(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.auth?.tipo_usuario) {
    next(new AppError('Autenticação necessária', 401, 'UNAUTHORIZED'))
    return
  }

  if (!TIPOS_ESCRITA.has(req.auth.tipo_usuario)) {
    next(new AppError(
      'Apenas Master ou Super Admin podem alterar configurações da organização (ADMIN é read-only)',
      403,
      'FORBIDDEN',
    ))
    return
  }

  next()
}

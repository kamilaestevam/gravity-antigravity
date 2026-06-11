// server/middleware/requireAuth.ts
// Valida JWT do Clerk em rotas protegidas
// Injeta req.auth com { id_usuario, id_organizacao } após validação

import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { auditLog } from '../../../servicos-plataforma/historico-global/src/audit-client.js'
import { resolverUsuarioPorClerkSub } from '../services/usuario-clerk-resolver.js'

// TTL do cache de usuário no requireAuth.
// Configurável via env REQUIRE_AUTH_CACHE_TTL_MS — mitigação para kick-out
// stale em deploy multi-replica (Railway max=3, sem sticky session — ver skill
// `governanca/operacao/auto-scaling`). Sem fix de Redis pub/sub, baixar TTL
// reduz a janela onde réplicas-vizinhas mantêm usuário INATIVO no cache.
// Default 60s preserva comportamento anterior; mínimo defensivo 1s evita
// cache desabilitado por engano (que dobraria carga no Prisma sem aviso).
// TODO(multi-replica): substituir por invalidação distribuída via Redis
// pub/sub canal `requireAuth:invalidate` quando Redis chegar ao Configurador
// (consolidar com plano em skill `seguranca/rate-limiting`).
const TTL_RAW = Number.parseInt(process.env.REQUIRE_AUTH_CACHE_TTL_MS ?? '60000', 10)
const USER_CACHE_TTL = Math.max(1000, Number.isFinite(TTL_RAW) ? TTL_RAW : 60_000)
const USER_CACHE_MAX = 500 // limite máximo de entradas — evita memory leak
const userCache = new Map<string, { id_usuario: string; id_organizacao: string; tipo_usuario: string; nome_usuario: string; status_usuario: 'ATIVO' | 'INATIVO'; expiry: number }>()

/**
 * Invalida cache do usuário para forçar releitura do banco no próximo request.
 * Usado por PATCH /usuarios/:id/status — após mudar status_usuario do alvo,
 * a próxima request do usuário desativado bate no banco e leva 401 imediato
 * (kick-out efetivo sem chamar Clerk — Mand. 01).
 *
 * Recebe o id_clerk_usuario do alvo (que vem do select da rota PATCH).
 */
export function invalidarCacheRequireAuth(idClerkUsuario: string): void {
  userCache.delete(`user:${idClerkUsuario}`)
}

declare global {
  namespace Express {
    interface Request {
      auth: {
        id_usuario: string
        id_organizacao: string
        clerkUserId: string
        tipo_usuario: string
        nome_usuario: string
      }
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      logAuthFailure(req, 'Token de autenticação ausente')
      throw new AppError('Token de autenticação ausente', 401, 'UNAUTHORIZED')
    }

    const token = authHeader.slice(7)

    let verified: { sub: string } | null = null
    try {
      verified = await clerkClient.verifyToken(token)
    } catch {
      logAuthFailure(req, 'Token inválido ou expirado')
      throw new AppError('Token inválido ou expirado', 401, 'UNAUTHORIZED')
    }

    if (!verified?.sub) {
      logAuthFailure(req, 'Token sem subject')
      throw new AppError('Token inválido', 401, 'UNAUTHORIZED')
    }

    // Busca tenant vinculado ao clerk_user_id (com cache em memória)
    const cacheKey = `user:${verified.sub}`
    const cached = userCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      // Mesmo no cache hit, bloqueia se status_usuario === INATIVO.
      if (cached.status_usuario === 'INATIVO') {
        logAuthFailure(req, `USUARIO_INATIVO: cached id_usuario=${cached.id_usuario}`)
        throw new AppError('Seu acesso foi desativado. Contate um administrador.', 401, 'USUARIO_INATIVO')
      }
      req.auth = { id_usuario: cached.id_usuario, id_organizacao: cached.id_organizacao, clerkUserId: verified.sub, tipo_usuario: cached.tipo_usuario, nome_usuario: cached.nome_usuario }
      next()
      return
    }

    // Lookup + self-heal unificados em usuario-clerk-resolver.ts (mesmo caminho
    // que a rota interna do resolver SDK usa). Convidados com id_clerk_usuario
    // 'pending_*' são religados pelo e-mail verificado do Clerk. Ver service.
    const { usuario: user, motivo } = await resolverUsuarioPorClerkSub(verified.sub)

    if (!user) {
      logAuthFailure(req, motivo ?? `Usuário não encontrado para clerk_user_id: ${verified.sub}`)
      throw new AppError('Usuário não encontrado no sistema', 401, 'UNAUTHORIZED')
    }

    // Bloqueio de INATIVO (Mand. 01 — Clerk NÃO é invalidado; o bloqueio
    // é todo via banco interno). Resposta 401 USUARIO_INATIVO orienta o
    // frontend a deslogar e mostrar mensagem clara. Decisão dono 2026-05-12.
    if (user.status_usuario === 'INATIVO') {
      logAuthFailure(req, `USUARIO_INATIVO: id_usuario=${user.id_usuario}`)
      throw new AppError('Seu acesso foi desativado. Contate um administrador.', 401, 'USUARIO_INATIVO')
    }

    // Limpa entradas expiradas quando o cache atinge o limite
    if (userCache.size >= USER_CACHE_MAX) {
      const now = Date.now()
      for (const [key, val] of userCache) {
        if (val.expiry <= now) userCache.delete(key)
      }
      // Se ainda cheio após limpeza, remove as mais antigas (FIFO via Map insertion order)
      if (userCache.size >= USER_CACHE_MAX) {
        const first = userCache.keys().next().value
        if (first) userCache.delete(first)
      }
    }

    userCache.set(cacheKey, {
      id_usuario: user.id_usuario,
      id_organizacao: user.id_organizacao,
      tipo_usuario: user.tipo_usuario,
      nome_usuario: user.nome_usuario ?? '',
      status_usuario: user.status_usuario,
      expiry: Date.now() + USER_CACHE_TTL,
    })

    req.auth = {
      id_usuario: user.id_usuario,
      id_organizacao: user.id_organizacao,
      clerkUserId: verified.sub,
      tipo_usuario: user.tipo_usuario,
      nome_usuario: user.nome_usuario ?? '',
    }

    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Ponto Cego 2 — Registra falha de autenticação no histórico.
 * Fire-and-forget: nunca bloqueia o fluxo de erro.
 */
function logAuthFailure(req: Request, reason: string): void {
  setImmediate(() => {
    auditLog({
      id_organizacao: (req.headers['x-id-organizacao'] as string) ?? 'unknown',
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: 'anonymous',
      nome_ator_historico_log: 'anonymous',
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'auth',
      tipo_recurso_historico_log: 'Session',
      acao_historico_log: 'FALHAR_AUTENTICACAO',
      detalhe_acao_historico_log: `Falha de autenticação: ${reason}`,
      status_historico_log: 'FALHA',
      mensagem_erro_historico_log: reason,
      metadata_ator_historico_log: {
        endpoint: req.originalUrl || req.url,
        method: req.method,
        user_agent: req.headers['user-agent'],
      },
    })
  })
}

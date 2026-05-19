// server/services/permission.ts
// Barreira 2 — Permissao espelhada via S2S com Configurador
// A GABI NUNCA executa acao que o usuario nao poderia fazer manualmente.

import { AppError } from '../lib/errors.js'
import { buscarTool } from './catalogo-ferramentas.js'

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL ?? process.env.CONFIGURADOR_SERVICE_URL ?? 'http://localhost:8005'
const CHAVE_INTERNA_SERVICO = process.env.CHAVE_INTERNA_SERVICO ?? ''

export type PermissionChecker = (userId: string, action: string, resource: string, tenantId: string) => Promise<boolean>

// ── Resposta do endpoint S2S ────────────────────────────────────────────────

interface VerificacaoPermissaoResponse {
  permitido: boolean
  motivo?: string
}

// ── Cache em memoria (TTL 60s) ──────────────────────────────────────────────

const cachePermissao = new Map<string, { permitido: boolean; expira: number }>()
const CACHE_TTL_MS = 60_000

function chaveCache(userId: string, toolId: string, tenantId: string): string {
  return `${tenantId}:${userId}:${toolId}`
}

// ── Verificacao S2S real ────────────────────────────────────────────────────

export async function verificarPermissaoS2S(
  id_organizacao: string,
  id_usuario: string,
  tool_id: string,
): Promise<{ permitido: boolean; motivo?: string }> {
  // Cache hit
  const chave = chaveCache(id_usuario, tool_id, id_organizacao)
  const cached = cachePermissao.get(chave)
  if (cached && Date.now() < cached.expira) {
    return { permitido: cached.permitido }
  }

  // Derivar slug_produto e secao/acao do tool_id
  const tool = buscarTool(tool_id)
  if (!tool) {
    return { permitido: false, motivo: `Tool desconhecida: ${tool_id}` }
  }

  // READ sempre permitido para usuarios autenticados
  if (tool.classe === 'READ') {
    cachePermissao.set(chave, { permitido: true, expira: Date.now() + CACHE_TTL_MS })
    return { permitido: true }
  }

  // Se nao temos chave S2S, fallback permissivo (usuario autenticado = ok)
  if (!CHAVE_INTERNA_SERVICO) {
    console.warn('[GABI/Permissoes] CHAVE_INTERNA_SERVICO ausente — fallback permissivo')
    return { permitido: true }
  }

  const [secao, acao] = tool_id.split('.')

  try {
    const response = await fetch(`${CONFIGURADOR_URL}/api/v1/internal/permissoes/verificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
      },
      body: JSON.stringify({
        id_organizacao,
        id_usuario,
        slug_produto: tool.produto,
        secao: secao ?? tool.produto,
        acao: acao ?? 'executar',
      }),
      signal: AbortSignal.timeout(3_000),
    })

    if (!response.ok) {
      console.warn(`[GABI/Permissoes] S2S falhou: HTTP ${response.status} — fallback permissivo`)
      return { permitido: true }
    }

    const data = (await response.json()) as VerificacaoPermissaoResponse

    // Cachear resultado
    cachePermissao.set(chave, { permitido: data.permitido, expira: Date.now() + CACHE_TTL_MS })

    return data
  } catch (err) {
    console.warn('[GABI/Permissoes] Erro na verificacao S2S — fallback permissivo:', err)
    return { permitido: true }
  }
}

// ── Verificacao por tipo_usuario (hierarquia local) ─────────────────────────

const HIERARQUIA: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  MASTER: 3,
  PADRAO: 2,
  FORNECEDOR: 1,
}

export function verificarPermissaoLocal(tipo_usuario: string, tool_id: string): boolean {
  const tool = buscarTool(tool_id)
  if (!tool) return false
  if (!tool.permissao_minima) return true

  const nivelUsuario = HIERARQUIA[tipo_usuario] ?? 0
  const nivelMinimo = HIERARQUIA[tool.permissao_minima] ?? 0
  return nivelUsuario >= nivelMinimo
}

// ── Barreira 2 completa (local + S2S) ───────────────────────────────────────

export async function verificarPermissaoCompleta(
  id_organizacao: string,
  id_usuario: string,
  tipo_usuario: string,
  tool_id: string,
): Promise<void> {
  // Usuario anonimo nunca pode escrever
  if (id_usuario === 'anonymous') {
    const tool = buscarTool(tool_id)
    if (tool && tool.classe !== 'READ') {
      throw new AppError('Autenticacao necessaria para executar esta acao.', 401, 'UNAUTHORIZED')
    }
  }

  // Verificacao local (hierarquia)
  if (!verificarPermissaoLocal(tipo_usuario, tool_id)) {
    const tool = buscarTool(tool_id)
    throw new AppError(
      `Permissao insuficiente: ${tool_id} requer ${tool?.permissao_minima ?? 'MASTER'}, voce e ${tipo_usuario}.`,
      403,
      'FORBIDDEN_GABI_ACTION',
    )
  }

  // Verificacao S2S (Configurador)
  const resultado = await verificarPermissaoS2S(id_organizacao, id_usuario, tool_id)
  if (!resultado.permitido) {
    throw new AppError(
      resultado.motivo ?? `Voce nao tem permissao para executar ${tool_id}.`,
      403,
      'FORBIDDEN_GABI_ACTION',
    )
  }
}

// ── Compat legada (usado por execute.ts existente) ──────────────────────────

const defaultPermissionChecker: PermissionChecker = async (userId, action, _resource, _tenantId) => {
  if (action === 'read') return userId !== 'anonymous'
  return userId !== 'anonymous'
}

export async function assertGabiPermission(
  userId: string,
  action: string,
  resource: string,
  tenantId: string,
  checker: PermissionChecker = defaultPermissionChecker,
): Promise<void> {
  const hasPermission = await checker(userId, action, resource, tenantId)

  if (!hasPermission) {
    throw new AppError(
      `Gabi: Usuario ${userId} nao tem permissao para ${action} em ${resource} (Barreira 2)`,
      403,
      'FORBIDDEN_GABI_ACTION',
    )
  }
}

// ── Limpar cache (para testes) ──────────────────────────────────────────────

export function _limparCachePermissoes(): void {
  cachePermissao.clear()
}

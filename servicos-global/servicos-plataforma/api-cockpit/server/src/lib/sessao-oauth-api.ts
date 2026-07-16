/**
 * Sessoes OAuth client_credentials — token opaco em memoria (v1 single-instance).
 * Em escala horizontal, migrar para Redis com mesmo contrato.
 */

import { randomBytes } from 'node:crypto'
import { hashToken } from '../crypto'

export interface SessaoOAuthAcesso {
  id_organizacao: string
  escopo_api_token: string
  expira_em: number
}

const PREFIXO_OAUTH = 'gravity_oauth_access_'
const sessoes = new Map<string, SessaoOAuthAcesso>()

export function emitirTokenOAuthAcesso(
  idOrganizacao: string,
  escopo: string,
  ttlSegundos = 3600,
): { access_token: string; expires_in: number } {
  const valor = `${PREFIXO_OAUTH}${randomBytes(32).toString('hex')}`
  const hash = hashToken(valor)
  sessoes.set(hash, {
    id_organizacao: idOrganizacao,
    escopo_api_token: escopo,
    expira_em: Date.now() + ttlSegundos * 1000,
  })
  return { access_token: valor, expires_in: ttlSegundos }
}

export function resolverSessaoOAuthPorToken(
  tokenValor: string,
): SessaoOAuthAcesso | null {
  if (!tokenValor.startsWith(PREFIXO_OAUTH)) return null
  const hash = hashToken(tokenValor)
  const sessao = sessoes.get(hash)
  if (!sessao) return null
  if (sessao.expira_em < Date.now()) {
    sessoes.delete(hash)
    return null
  }
  return sessao
}

/** Limpa sessoes expiradas — chamado pelo worker. */
export function limparSessoesOAuthExpiradas(): number {
  const agora = Date.now()
  let removidas = 0
  for (const [hash, sessao] of sessoes) {
    if (sessao.expira_em < agora) {
      sessoes.delete(hash)
      removidas++
    }
  }
  return removidas
}

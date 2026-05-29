/** Bloqueia redirect Clerk para /login enquanto ativamos sessão pós-convite. */
export const CHAVE_ATIVANDO_SESSAO_CONVITE = 'gravity:convite:ativando-sessao'

/** Credenciais guardadas antes do signUp — Clerk pode recarregar a página em /login. */
export const CHAVE_LOGIN_PENDENTE_CONVITE = 'gravity:convite:login-pendente'

export interface LoginPendenteConvite {
  email: string
  senha: string
}

export function gravarLoginPendenteConvite(credenciais: LoginPendenteConvite): void {
  try {
    sessionStorage.setItem(CHAVE_LOGIN_PENDENTE_CONVITE, JSON.stringify(credenciais))
  } catch {
    /* quota / modo privado */
  }
}

export function lerLoginPendenteConvite(): LoginPendenteConvite | null {
  try {
    const raw = sessionStorage.getItem(CHAVE_LOGIN_PENDENTE_CONVITE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LoginPendenteConvite
    if (!parsed.email || !parsed.senha) return null
    return parsed
  } catch {
    return null
  }
}

export function limparLoginPendenteConvite(): void {
  try {
    sessionStorage.removeItem(CHAVE_LOGIN_PENDENTE_CONVITE)
  } catch {
    /* noop */
  }
}

export function pathDestinoClerk(destino: string): string {
  try {
    if (destino.startsWith('http')) return new URL(destino).pathname
  } catch {
    /* path relativo */
  }
  return destino.split('?')[0]
}

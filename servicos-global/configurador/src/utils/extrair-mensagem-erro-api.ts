/**
 * Extrai mensagem legível de respostas de erro da API (AppError, sidecar S2S, Zod).
 */
type IssueZod = { message?: string; path?: (string | number)[] }

type PayloadErroApi = {
  erro?: string
  error?: string | { message?: string; code?: string; details?: unknown }
  issues?: IssueZod[]
}

const ERROS_GENERICOS = new Set([
  'body invalido',
  'body inválido',
  'dados invalidos',
  'dados inválidos',
  'query invalida',
  'query inválida',
  'params invalidos',
  'params inválidos',
])

function combinarErroApi(erro: string, issuesMsg: string): string {
  const erroNorm = erro.trim().toLowerCase()
  if (issuesMsg && ERROS_GENERICOS.has(erroNorm)) return issuesMsg
  if (issuesMsg) return `${erro}: ${issuesMsg}`
  return erro
}

function formatarIssues(issues: IssueZod[]): string {
  return issues
    .map((issue) => {
      if (issue.message) return issue.message
      if (issue.path?.length) return `${issue.path.join('.')}: valor inválido`
      return ''
    })
    .filter(Boolean)
    .join('; ')
}

export function extrairMensagemErroApi(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== 'object') return fallback

  const payload = raw as PayloadErroApi
  const issuesMsg = Array.isArray(payload.issues) ? formatarIssues(payload.issues) : ''

  if (typeof payload.erro === 'string' && payload.erro.trim()) {
    return combinarErroApi(payload.erro, issuesMsg)
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error
  }

  if (payload.error && typeof payload.error === 'object') {
    const nested = payload.error.message
    if (typeof nested === 'string' && nested.trim()) {
      return issuesMsg ? `${nested}: ${issuesMsg}` : nested
    }
  }

  return issuesMsg || fallback
}

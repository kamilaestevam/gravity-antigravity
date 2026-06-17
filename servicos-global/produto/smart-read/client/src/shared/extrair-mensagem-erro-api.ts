/**
 * extrair-mensagem-erro-api.ts — Normaliza payloads de erro do Gravity (AppError, proxy, legado)
 */

export function extrairMensagemErroCorpo(corpo: unknown): string | null {
  if (!corpo || typeof corpo !== 'object') return null
  const registro = corpo as Record<string, unknown>
  const erro = registro.error

  if (typeof erro === 'string' && erro.trim()) return erro.trim()

  if (erro && typeof erro === 'object' && !Array.isArray(erro)) {
    const aninhado = erro as Record<string, unknown>
    if (typeof aninhado.message === 'string' && aninhado.message.trim()) {
      return aninhado.message.trim()
    }
  }

  if (typeof registro.message === 'string' && registro.message.trim()) {
    return registro.message.trim()
  }

  return null
}

export function mensagemDeExcecao(excecao: unknown, fallback: string): string {
  if (excecao instanceof Error) {
    const msg = excecao.message?.trim()
    if (msg && msg !== '[object Object]') return msg
  }
  if (typeof excecao === 'string' && excecao.trim()) return excecao.trim()
  return fallback
}

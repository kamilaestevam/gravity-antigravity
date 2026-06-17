/**
 * extrair-mensagem-erro-resposta.ts — Resposta HTTP do Configurador (AppError handler)
 */

export function extrairMensagemErroRespostaConfigurador(corpo: unknown, fallback: string): string {
  if (!corpo || typeof corpo !== 'object') return fallback
  const registro = corpo as Record<string, unknown>
  const erro = registro.error

  if (erro && typeof erro === 'object' && !Array.isArray(erro)) {
    const aninhado = erro as Record<string, unknown>
    if (typeof aninhado.message === 'string' && aninhado.message.trim()) {
      return aninhado.message.trim()
    }
  }

  if (typeof registro.message === 'string' && registro.message.trim()) {
    return registro.message.trim()
  }

  if (typeof erro === 'string' && erro.trim()) return erro.trim()

  return fallback
}

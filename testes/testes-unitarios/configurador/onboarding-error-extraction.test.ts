// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Testa a lógica de extração de erro usada no Onboarding.tsx (linha 126).
 * O backend retorna { error: { code, message } } via AppError handler.
 * O frontend deve ler body?.error?.message, não body?.message.
 */

function extrairMensagemErro(body: Record<string, unknown>): string {
  const error = body?.error as Record<string, unknown> | undefined
  return (error?.message as string) ?? 'Erro ao criar a organização. Tente novamente ou entre em contato com o suporte.'
}

describe('Onboarding — extração de mensagem de erro do backend', () => {
  it('extrai mensagem real quando backend retorna formato AppError padrão', () => {
    const body = { error: { code: 'CADASTROS_INDISPONIVEL', message: 'Serviço Cadastros indisponível (rede/timeout)' } }
    expect(extrairMensagemErro(body)).toBe('Serviço Cadastros indisponível (rede/timeout)')
  })

  it('extrai mensagem de erro de validação (400)', () => {
    const body = { error: { code: 'VALIDATION_ERROR', message: 'CNPJ é obrigatório quando país = BR' } }
    expect(extrairMensagemErro(body)).toBe('CNPJ é obrigatório quando país = BR')
  })

  it('extrai mensagem de usuário duplicado (409)', () => {
    const body = { error: { code: 'USUARIO_EXISTENTE', message: 'Usuário já possui uma organização' } }
    expect(extrairMensagemErro(body)).toBe('Usuário já possui uma organização')
  })

  it('retorna fallback quando body é objeto vazio (res.json() falhou)', () => {
    const body = {}
    expect(extrairMensagemErro(body)).toBe('Erro ao criar a organização. Tente novamente ou entre em contato com o suporte.')
  })

  it('retorna fallback quando body.error existe mas sem message', () => {
    const body = { error: { code: 'UNKNOWN' } }
    expect(extrairMensagemErro(body)).toBe('Erro ao criar a organização. Tente novamente ou entre em contato com o suporte.')
  })

  it('retorna fallback quando body.error é null', () => {
    const body = { error: null }
    expect(extrairMensagemErro(body)).toBe('Erro ao criar a organização. Tente novamente ou entre em contato com o suporte.')
  })

  it('NÃO lê body.message (formato antigo/incorreto) — deve cair no fallback', () => {
    const body = { message: 'Mensagem na raiz que NÃO deve ser lida' }
    expect(extrairMensagemErro(body)).toBe('Erro ao criar a organização. Tente novamente ou entre em contato com o suporte.')
  })
})

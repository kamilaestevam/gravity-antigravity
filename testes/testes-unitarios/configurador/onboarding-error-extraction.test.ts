// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Testa a lógica de extração + tradução de erro usada no Onboarding.tsx.
 * O backend retorna { error: { code, message } } via AppError handler.
 * O frontend traduz códigos conhecidos para mensagens amigáveis ao usuário.
 */

const mensagensAmigaveis: Record<string, string | undefined> = {
  CADASTROS_INDISPONIVEL: 'Estamos com uma instabilidade temporária. Tente novamente em alguns minutos.',
  CADASTROS_VALIDACAO: 'Dados da empresa foram rejeitados. Verifique o CNPJ e tente novamente.',
  CONFLICT: 'Sua conta já possui uma organização. Faça login para acessá-la.',
}
const FALLBACK = 'Erro ao criar a organização. Tente novamente ou entre em contato com o suporte.'

function extrairMensagemErro(body: Record<string, unknown>): string {
  const error = body?.error as Record<string, unknown> | undefined
  const codigo = error?.code as string | undefined
  const mensagemBackend = error?.message as string | undefined

  const mapa: Record<string, string> = {
    ...mensagensAmigaveis as Record<string, string>,
    VALIDATION_ERROR: mensagemBackend ?? 'Dados inválidos. Verifique os campos e tente novamente.',
  }

  return (codigo && mapa[codigo]) ?? FALLBACK
}

describe('Onboarding — tradução de erro do backend para mensagem amigável', () => {
  it('CADASTROS_INDISPONIVEL → mensagem amigável de instabilidade', () => {
    const body = { error: { code: 'CADASTROS_INDISPONIVEL', message: 'Serviço Cadastros indisponível (rede/timeout)' } }
    expect(extrairMensagemErro(body)).toBe('Estamos com uma instabilidade temporária. Tente novamente em alguns minutos.')
  })

  it('CADASTROS_VALIDACAO → mensagem amigável de dados rejeitados', () => {
    const body = { error: { code: 'CADASTROS_VALIDACAO', message: 'Cadastros rejeitou a criação de Empresa: ...' } }
    expect(extrairMensagemErro(body)).toBe('Dados da empresa foram rejeitados. Verifique o CNPJ e tente novamente.')
  })

  it('CONFLICT (usuário duplicado) → mensagem amigável de conta existente', () => {
    const body = { error: { code: 'CONFLICT', message: 'Usuário já possui uma organização' } }
    expect(extrairMensagemErro(body)).toBe('Sua conta já possui uma organização. Faça login para acessá-la.')
  })

  it('VALIDATION_ERROR → preserva mensagem original do backend (ex: CNPJ obrigatório)', () => {
    const body = { error: { code: 'VALIDATION_ERROR', message: 'CNPJ é obrigatório quando país = BR' } }
    expect(extrairMensagemErro(body)).toBe('CNPJ é obrigatório quando país = BR')
  })

  it('VALIDATION_ERROR sem message → fallback de validação genérico', () => {
    const body = { error: { code: 'VALIDATION_ERROR' } }
    expect(extrairMensagemErro(body)).toBe('Dados inválidos. Verifique os campos e tente novamente.')
  })

  it('código desconhecido → fallback genérico', () => {
    const body = { error: { code: 'ALGO_NOVO', message: 'mensagem técnica' } }
    expect(extrairMensagemErro(body)).toBe(FALLBACK)
  })

  it('body vazio (res.json() falhou) → fallback genérico', () => {
    expect(extrairMensagemErro({})).toBe(FALLBACK)
  })

  it('body.error null → fallback genérico', () => {
    expect(extrairMensagemErro({ error: null })).toBe(FALLBACK)
  })

  it('NÃO lê body.message (formato antigo/incorreto) → fallback genérico', () => {
    const body = { message: 'Mensagem na raiz que NÃO deve ser lida' }
    expect(extrairMensagemErro(body)).toBe(FALLBACK)
  })
})

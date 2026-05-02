import { describe, it, expect } from 'vitest'
import { computeDiff, computeIntegrityHash } from '../audit.service.js'
import type { AuditLogInput } from '../audit.service.js'

// ── computeDiff ───────────────────────────────────────────────────────────────

describe('computeDiff', () => {
  it('retorna changed=false quando objetos são idênticos', () => {
    const obj = { name: 'Acme', status: 'ATIVO', value: 100 }
    const result = computeDiff(obj, { ...obj })
    expect(result.changed).toBe(false)
    expect(result.before).toEqual({})
    expect(result.after).toEqual({})
  })

  it('retorna apenas os campos alterados', () => {
    const before = { name: 'Acme', status: 'ATIVO', value: 100 }
    const after  = { name: 'Acme', status: 'INATIVO', value: 100 }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
    expect(result.before).toEqual({ status: 'ATIVO' })
    expect(result.after).toEqual({ status: 'INATIVO' })
    expect(result.before).not.toHaveProperty('name')
  })

  it('detecta campo adicionado', () => {
    const before = { name: 'Acme' } as Record<string, unknown>
    const after  = { name: 'Acme', email: 'novo@acme.com' }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
    expect(result.before.email).toBeUndefined()
    expect(result.after.email).toBe('novo@acme.com')
  })

  it('detecta campo removido', () => {
    const before = { name: 'Acme', obs: 'antiga' }
    const after  = { name: 'Acme', obs: undefined } as Record<string, unknown>
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
    expect(result.before.obs).toBe('antiga')
  })

  it('compara objetos aninhados via JSON.stringify', () => {
    const before = { meta: { pais: 'BR', cidade: 'SP' } }
    const after  = { meta: { pais: 'BR', cidade: 'RJ' } }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
  })

  it('trata arrays como valores escalares', () => {
    const before = { tags: ['a', 'b'] }
    const after  = { tags: ['a', 'b', 'c'] }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
  })
})

// ── computeIntegrityHash ──────────────────────────────────────────────────────

const BASE_INPUT: AuditLogInput = {
  id_organizacao: 'org-123',
  tipo_ator_historico_log: 'USUARIO',
  id_ator_historico_log: 'user-456',
  nome_ator_historico_log: 'Daniel',
  modulo_historico_log: 'pedido',
  tipo_recurso_historico_log: 'Pedido',
  acao_historico_log: 'CREATE',
  detalhe_acao_historico_log: 'Criou pedido #001',
}

describe('computeIntegrityHash', () => {
  it('retorna string hexadecimal de 64 caracteres (SHA256)', () => {
    const hash = computeIntegrityHash(BASE_INPUT, new Date('2026-01-01T00:00:00Z'))
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('é determinístico — mesmo input → mesmo hash', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash(BASE_INPUT, date)
    expect(h1).toBe(h2)
  })

  it('muda ao alterar id_organizacao', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, id_organizacao: 'outra-org' }, date)
    expect(h1).not.toBe(h2)
  })

  it('muda ao alterar id_ator_historico_log', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, id_ator_historico_log: 'outro-user' }, date)
    expect(h1).not.toBe(h2)
  })

  it('muda ao alterar acao_historico_log', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, acao_historico_log: 'DELETE' }, date)
    expect(h1).not.toBe(h2)
  })

  it('muda ao alterar data_criacao_historico_log', () => {
    const h1 = computeIntegrityHash(BASE_INPUT, new Date('2026-01-01T00:00:00Z'))
    const h2 = computeIntegrityHash(BASE_INPUT, new Date('2026-01-02T00:00:00Z'))
    expect(h1).not.toBe(h2)
  })

  it('NÃO inclui nome_ator_historico_log no hash (campo de PII — pode ser anonimizado sem invalidar)', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, nome_ator_historico_log: '[Anonimizado LGPD]' }, date)
    // nome_ator_historico_log não faz parte do hash — anonimização LGPD não quebra integridade
    expect(h1).toBe(h2)
  })

  it('estado_anterior_historico_log/estado_posterior_historico_log null é equivalente a omitido', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, estado_anterior_historico_log: null as unknown, estado_posterior_historico_log: null as unknown }, date)
    expect(h1).toBe(h2)
  })

  it('status_historico_log padrão SUCESSO é equivalente a omitido', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, status_historico_log: 'SUCESSO' }, date)
    expect(h1).toBe(h2)
  })
})

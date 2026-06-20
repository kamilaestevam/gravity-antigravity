// TST-UNI-CONVITE-SUPER-ADMIN-ADMIN-000116 — contrato Zod do convite admin (TASK-000302)
/// <reference types="vitest/globals" />

import { describe, it, expect } from 'vitest'
import { adminConvidarUsuarioInputSchema } from '../../../../../../servicos-global/configurador/src/services/api-client.js'

describe('TST-UNI-CONVITE-SUPER-ADMIN-ADMIN-000116 — adminConvidarUsuarioInputSchema', () => {
  const base = {
    email_usuario: 'novo@exemplo.com',
    nome_usuario: 'Novo Usuário',
    tipo_usuario: 'SUPER_ADMIN' as const,
  }

  it('U01 — rejeita id_organizacao_alvo vazio', () => {
    const r = adminConvidarUsuarioInputSchema.safeParse({
      ...base,
      id_organizacao_alvo: '',
    })
    expect(r.success).toBe(false)
  })

  it('U02 — aceita SUPER_ADMIN com id_organizacao_alvo não vazio', () => {
    const r = adminConvidarUsuarioInputSchema.safeParse({
      ...base,
      id_organizacao_alvo: 'cmo6henln0000ly9mwvx3zbia',
    })
    expect(r.success).toBe(true)
  })

  it('U03 — aceita PADRAO com workspaces_alvo', () => {
    const r = adminConvidarUsuarioInputSchema.safeParse({
      ...base,
      tipo_usuario: 'PADRAO',
      id_organizacao_alvo: 'org_cliente_1',
      workspaces_alvo: 'all',
    })
    expect(r.success).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import {
  createProcessoBodySchema,
  updateProcessoBodySchema,
  mudarStatusProcessoBodySchema,
  createProcessoStatusBodySchema,
  createFollowUpBodySchema,
  createDocumentoBodySchema,
} from '../../../../servicos-global/produto/processo/server/src/contracts/processo-schemas.ts'

describe('processo-schemas', () => {
  it('aceita payload minimo de criacao', () => {
    const result = createProcessoBodySchema.safeParse({
      id_workspace: 'ws_abc',
      tipo_operacao_processo: 'importacao',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita tipo_operacao invalido', () => {
    const result = createProcessoBodySchema.safeParse({
      id_workspace: 'ws_abc',
      tipo_operacao_processo: 'invalido',
    })
    expect(result.success).toBe(false)
  })

  it('aceita patch parcial', () => {
    const result = updateProcessoBodySchema.safeParse({
      referencia_interna_processo: 'PO-123',
      id_transito_processo: null,
    })
    expect(result.success).toBe(true)
  })

  it('valida mudanca de status', () => {
    const result = mudarStatusProcessoBodySchema.safeParse({
      id_status_novo_processo: 'status_xyz',
    })
    expect(result.success).toBe(true)
  })

  it('valida criacao de status catalogo', () => {
    const result = createProcessoStatusBodySchema.safeParse({
      tipo_status_processo: 'em_transito',
      rotulo_status_processo: 'Em Trânsito',
    })
    expect(result.success).toBe(true)
  })

  it('valida follow-up', () => {
    const result = createFollowUpBodySchema.safeParse({
      id_processo: 'proc_1',
      titulo_follow_up_processo: 'BL recebido',
    })
    expect(result.success).toBe(true)
  })

  it('valida documento', () => {
    const result = createDocumentoBodySchema.safeParse({
      id_processo: 'proc_1',
      nome_documento_processo: 'bl.pdf',
      tipo_arquivo_documento_processo: 'pdf',
      url_documento_processo: 'https://storage.example/bl.pdf',
    })
    expect(result.success).toBe(true)
  })
})

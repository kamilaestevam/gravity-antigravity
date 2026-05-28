import { describe, expect, it } from 'vitest'
import {
  listaTaxasOrigemDestinoSchema,
  taxaOrigemDestinoSchema,
  tipoTaxaOrigemDestinoEnum,
} from '../../../servicos-global/cadastros/shared/schemas/taxa-origem-destino.schema.js'

describe('taxaOrigemDestinoSchema', () => {
  it('aceita taxa ORIGEM válida', () => {
    const raw = {
      id_taxa_origem_destino: 'clx123',
      nome_taxa_origem_destino: 'THC Origem',
      tipo_taxa_origem_destino: 'ORIGEM',
      codigo_taxa_origem_destino: 'THC_ORIGEM',
      ativo_taxa_origem_destino: true,
    }
    expect(taxaOrigemDestinoSchema.parse(raw)).toMatchObject(raw)
  })

  it('rejeita tipo inválido', () => {
    expect(() => tipoTaxaOrigemDestinoEnum.parse('origem')).toThrow()
  })

  it('valida lista de itens', () => {
    const lista = listaTaxasOrigemDestinoSchema.parse({
      itens: [
        {
          id_taxa_origem_destino: 'a',
          nome_taxa_origem_destino: 'BL Fee',
          tipo_taxa_origem_destino: 'ORIGEM',
          ativo_taxa_origem_destino: true,
        },
      ],
      total: 1,
    })
    expect(lista.total).toBe(1)
  })
})

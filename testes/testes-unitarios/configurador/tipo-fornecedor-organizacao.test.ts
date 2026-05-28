// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  flagsCadastroPorTipoFornecedorOrganizacao,
  ROTULOS_TIPO_FORNECEDOR_ORGANIZACAO,
  TIPOS_FORNECEDOR_BID_FRETE,
} from '../../../servicos-global/configurador/shared/tipo-fornecedor-organizacao.js'
import {
  chavesDefaultGranulares,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
} from '../../../servicos-global/configurador/shared/permissoes-canonicas.js'

describe('tipo-fornecedor-organizacao', () => {
  it('mapeia AGENTE_CARGA para pode_ser_agente_fornecedor', () => {
    const flags = flagsCadastroPorTipoFornecedorOrganizacao('AGENTE_CARGA')
    expect(flags.pode_ser_agente_fornecedor).toBe(true)
    expect(flags.pode_ser_armador_fornecedor).toBe(false)
  })

  it('expõe rótulos PT para categorias BID', () => {
    for (const tipo of TIPOS_FORNECEDOR_BID_FRETE) {
      expect(ROTULOS_TIPO_FORNECEDOR_ORGANIZACAO[tipo].length).toBeGreaterThan(2)
    }
  })
})

describe('permissoes bid-frete fornecedor', () => {
  it('bid-frete está em PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS', () => {
    expect(PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has('bid-frete')).toBe(true)
  })

  it('FORNECEDOR recebe defaults dashboard+lista no bid-frete', () => {
    const chaves = chavesDefaultGranulares('bid-frete', 'FORNECEDOR')
    expect(chaves).toContain('bid-frete:dashboard:ver')
    expect(chaves).toContain('bid-frete:lista:ver')
  })
})

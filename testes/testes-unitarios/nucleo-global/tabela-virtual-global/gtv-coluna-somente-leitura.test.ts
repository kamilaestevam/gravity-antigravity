import { describe, expect, it } from 'vitest'
import {
  colunaSomenteLeituraCompleta,
} from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/gtvColunaSomenteLeitura'
import type { GTColuna } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/tipos'

const col = (key: string, editavel?: boolean | ((row: unknown) => boolean)): GTColuna<unknown> => ({
  key,
  label: key,
  editavel,
})

describe('colunaSomenteLeituraCompleta', () => {
  it('lista plana: coluna fora de camposEditaveis → somente leitura completa', () => {
    expect(
      colunaSomenteLeituraCompleta(col('data_atualizacao'), [], undefined, undefined, false),
    ).toBe(true)
  })

  it('hierarquia: pedido editável + item não → coluna NÃO é somente leitura completa', () => {
    expect(
      colunaSomenteLeituraCompleta(
        col('porto_origem'),
        ['porto_origem'],
        [],
        undefined,
        true,
      ),
    ).toBe(false)
  })

  it('hierarquia: pedido e item não editáveis → somente leitura completa', () => {
    expect(
      colunaSomenteLeituraCompleta(
        col('pais_exportador'),
        [],
        [],
        undefined,
        true,
      ),
    ).toBe(true)
  })

  it('hierarquia: calculado no pedido, editável no item → coluna normal', () => {
    expect(
      colunaSomenteLeituraCompleta(
        col('valor_total_pedido'),
        [],
        ['valor_total_pedido'],
        undefined,
        true,
      ),
    ).toBe(false)
  })

  it('editavel função no pai → coluna não é somente leitura completa', () => {
    expect(
      colunaSomenteLeituraCompleta(
        col('nome_exportador', () => true),
        [],
        [],
        undefined,
        true,
      ),
    ).toBe(false)
  })
})

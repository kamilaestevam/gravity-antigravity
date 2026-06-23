import { describe, expect, it } from 'vitest'
import {
  montarAlertaDivergenciaCadastrosMapa,
  validarConsistenciaLocalRotaCadastros,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/divergencia-cadastros-rota-bid-frete-internacional'
import {
  rotuloAeroportoCadastroLogistica,
  rotuloPortoCadastroLogistica,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/rotulo-cadastro-logistica-bid-frete-internacional'

describe('divergencia-cadastros-rota-bid-frete-internacional', () => {
  it('detecta Athens gravado com MMI (EUA) no Cadastros', () => {
    const alerta = montarAlertaDivergenciaCadastrosMapa({
      codigo: 'MMI',
      nomeCotacao: 'Athens',
      paisCotacao: 'GR',
      nomeCadastros: 'McMinn County Airport',
      paisCadastros: 'US',
    })
    expect(alerta).toContain('País gravado (GR)')
    expect(alerta).toContain('Cadastros (US)')
    expect(alerta).toContain('Nome gravado (Athens)')
  })

  it('não alerta quando snapshot bate com Cadastros', () => {
    const alerta = montarAlertaDivergenciaCadastrosMapa({
      codigo: 'ATH',
      nomeCotacao: 'Athens',
      paisCotacao: 'GR',
      nomeCadastros: 'Athens International Airport',
      paisCadastros: 'GR',
    })
    expect(alerta).toBeNull()
  })

  it('rejeita código inexistente no Cadastros', () => {
    const erro = validarConsistenciaLocalRotaCadastros(
      'destino',
      { codigo: 'ZZZ', nome: 'ZZZ', pais: 'BR' },
      null,
    )
    expect(erro?.path).toBe('destino_codigo_cotacao_bid_frete_internacional')
  })
})

describe('rotulo-cadastro-logistica-bid-frete-internacional', () => {
  it('inclui país no rótulo do aeroporto', () => {
    expect(
      rotuloAeroportoCadastroLogistica({
        codigo_iata_aeroporto: 'MMI',
        codigo_unlocode_aeroporto: 'USMMI',
        nome_aeroporto: 'McMinn County',
        codigo_pais_aeroporto: 'US',
      }),
    ).toBe('MMI — McMinn County, US')
  })

  it('inclui país no rótulo do porto', () => {
    expect(
      rotuloPortoCadastroLogistica({
        codigo_unlocode_porto: 'BRSSZ',
        nome_porto: 'Santos',
        codigo_pais_porto: 'BR',
      }),
    ).toBe('BRSSZ — Santos, BR')
  })
})

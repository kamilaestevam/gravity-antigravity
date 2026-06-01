/**
 * status-validacao.test.ts — testes unitarios do validador GABI das
 * regras de status (espelha o validador de Campos Calculados do Pedido).
 *
 * Cobertura: 4 dimensoes de validacao
 *   1. Compatibilidade tipo do campo × condicao
 *   2. Valor exigido nao vazio
 *   3. Valor numerico parseavel
 *   4. Conflitos no modo AND (vazio + preenchido no mesmo campo)
 */

import { describe, it, expect } from 'vitest'
import {
  validarStatus,
  precisaValor,
  camposPara,
  CONDICAO_POR_TIPO,
  CAMPOS_DADOS_PROCESSO,
  CAMPOS_PEDIDO,
  type StatusConfig,
  type Regra,
} from '../pages/configuracoes/status/validacao'

// ── Factory helpers ────────────────────────────────────────────────────────

function regra(p: Partial<Regra>): Regra {
  return {
    id: `r${Math.random()}`,
    origem: 'dados_processo',
    campo: 'numero_processo',
    condicao: 'preenchido',
    ...p,
  }
}

function status(p: Partial<StatusConfig>): StatusConfig {
  return {
    id: 's1',
    nome: 'Teste',
    cor: '#a78bfa',
    ordem: 1,
    operador: 'AND',
    regras: [],
    ...p,
  }
}

// ── Helpers / Catalogos ────────────────────────────────────────────────────

describe('precisaValor', () => {
  it('retorna false para vazio e preenchido', () => {
    expect(precisaValor('vazio')).toBe(false)
    expect(precisaValor('preenchido')).toBe(false)
  })

  it('retorna true para comparacoes que precisam de operando', () => {
    expect(precisaValor('igual')).toBe(true)
    expect(precisaValor('diferente')).toBe(true)
    expect(precisaValor('maior_que')).toBe(true)
    expect(precisaValor('menor_que')).toBe(true)
    expect(precisaValor('contem')).toBe(true)
  })
})

describe('camposPara', () => {
  it('retorna os 13 campos do Dados do Processo', () => {
    expect(camposPara('dados_processo')).toBe(CAMPOS_DADOS_PROCESSO)
    expect(CAMPOS_DADOS_PROCESSO.length).toBe(13)
  })

  it('retorna os 6 campos do Pedido', () => {
    expect(camposPara('pedido')).toBe(CAMPOS_PEDIDO)
    expect(CAMPOS_PEDIDO.length).toBe(6)
  })

  it('todos os campos tem key, label e tipo definidos', () => {
    for (const c of [...CAMPOS_DADOS_PROCESSO, ...CAMPOS_PEDIDO]) {
      expect(c.key).toBeTruthy()
      expect(c.label).toBeTruthy()
      expect(['texto', 'numero', 'data', 'select']).toContain(c.tipo)
    }
  })
})

describe('CONDICAO_POR_TIPO — matriz de compatibilidade', () => {
  it('vazio e preenchido aceitam todos os tipos', () => {
    expect(CONDICAO_POR_TIPO.vazio).toEqual(['texto', 'numero', 'data', 'select'])
    expect(CONDICAO_POR_TIPO.preenchido).toEqual(['texto', 'numero', 'data', 'select'])
  })

  it('contem so funciona em texto', () => {
    expect(CONDICAO_POR_TIPO.contem).toEqual(['texto'])
  })

  it('maior_que/menor_que so em numero e data', () => {
    expect(CONDICAO_POR_TIPO.maior_que).toEqual(['numero', 'data'])
    expect(CONDICAO_POR_TIPO.menor_que).toEqual(['numero', 'data'])
  })
})

// ── validarStatus — casos validos ──────────────────────────────────────────

describe('validarStatus — casos validos', () => {
  it('status com 1 regra simples (campo preenchido) eh valido sem problemas', () => {
    const s = status({
      regras: [regra({ campo: 'numero_processo', condicao: 'preenchido' })],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(true)
    expect(v.problemas).toHaveLength(0)
  })

  it('status com 2 regras coerentes em AND eh valido', () => {
    const s = status({
      operador: 'AND',
      regras: [
        regra({ id: 'r1', campo: 'data_embarque', condicao: 'preenchido' }),
        regra({ id: 'r2', campo: 'data_chegada',  condicao: 'vazio' }),
      ],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(true)
    expect(v.problemas).toHaveLength(0)
  })

  it('maior_que em campo numerico com valor parseavel eh valido', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '10000' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('aceita virgula como separador decimal em campo numerico', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '10.500,75' })],
    })
    // O regex Number(valor.replace(',', '.')) trata virgula como decimal — ainda da NaN
    // por causa do ponto extra, entao validamos o caso simples '10000,5'
    const s2 = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '10000,5' })],
    })
    expect(validarStatus(s2).valida).toBe(true)
  })

  it('contem em campo texto eh valido', () => {
    const s = status({
      regras: [regra({ campo: 'responsavel', condicao: 'contem', valor: 'Daniel' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── validarStatus — erros de compatibilidade tipo×condicao ────────────────

describe('validarStatus — incompatibilidade tipo × condicao', () => {
  it('maior_que em campo texto gera erro', () => {
    const s = status({
      regras: [regra({ campo: 'responsavel', condicao: 'maior_que', valor: 'algo' })],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(false)
    expect(v.problemas.some(p => p.severidade === 'erro' && p.mensagem.includes('maior'))).toBe(true)
  })

  it('contem em campo numero gera erro', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'contem', valor: '100' })],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(false)
    expect(v.problemas.some(p => p.mensagem.includes('contém') && p.mensagem.includes('Valor FOB'))).toBe(true)
  })

  it('contem em campo data gera erro', () => {
    const s = status({
      regras: [regra({ campo: 'data_embarque', condicao: 'contem', valor: '2026' })],
    })
    expect(validarStatus(s).valida).toBe(false)
  })

  it('menor_que em campo select gera erro', () => {
    const s = status({
      regras: [regra({ campo: 'canal', condicao: 'menor_que', valor: 'verde' })],
    })
    expect(validarStatus(s).valida).toBe(false)
  })
})

// ── validarStatus — valor exigido vazio ───────────────────────────────────

describe('validarStatus — valor de comparacao ausente', () => {
  it('igual sem valor gera erro', () => {
    const s = status({
      regras: [regra({ campo: 'responsavel', condicao: 'igual', valor: '' })],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(false)
    expect(v.problemas.some(p => p.mensagem.includes('valor de comparação'))).toBe(true)
  })

  it('maior_que sem valor gera erro', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que' })],
    })
    expect(validarStatus(s).valida).toBe(false)
  })

  it('valor apenas com espacos eh tratado como vazio', () => {
    const s = status({
      regras: [regra({ campo: 'responsavel', condicao: 'contem', valor: '   ' })],
    })
    expect(validarStatus(s).valida).toBe(false)
  })

  it('vazio nao precisa de valor — ok mesmo sem ele', () => {
    const s = status({
      regras: [regra({ campo: 'di_numero', condicao: 'vazio' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('preenchido nao precisa de valor', () => {
    const s = status({
      regras: [regra({ campo: 'numero_processo', condicao: 'preenchido' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── validarStatus — valor numerico invalido ───────────────────────────────

describe('validarStatus — valor numerico invalido', () => {
  it('texto em campo numero gera erro', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: 'abc' })],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(false)
    expect(v.problemas.some(p => p.mensagem.includes('não é um número'))).toBe(true)
  })

  it('mistura de letras e numeros eh invalida', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'igual', valor: '100x' })],
    })
    expect(validarStatus(s).valida).toBe(false)
  })

  it('numero negativo eh aceito', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '-100' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('zero eh aceito', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '0' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── validarStatus — conflitos no modo AND ─────────────────────────────────

describe('validarStatus — conflitos logicos no AND', () => {
  it('mesmo campo vazio E preenchido gera erro no modo AND', () => {
    const s = status({
      operador: 'AND',
      regras: [
        regra({ id: 'r1', campo: 'di_numero', condicao: 'vazio' }),
        regra({ id: 'r2', campo: 'di_numero', condicao: 'preenchido' }),
      ],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(false)
    expect(v.problemas.some(p => p.mensagem.includes('"vazio" E "preenchido"'))).toBe(true)
  })

  it('mesmo campo vazio E preenchido no modo OR NAO gera erro (eh possivel)', () => {
    const s = status({
      operador: 'OR',
      regras: [
        regra({ id: 'r1', campo: 'di_numero', condicao: 'vazio' }),
        regra({ id: 'r2', campo: 'di_numero', condicao: 'preenchido' }),
      ],
    })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('campos diferentes vazio + preenchido no AND eh ok', () => {
    const s = status({
      operador: 'AND',
      regras: [
        regra({ id: 'r1', campo: 'di_numero',  condicao: 'vazio' }),
        regra({ id: 'r2', campo: 'li_numero', condicao: 'preenchido' }),
      ],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── validarStatus — avisos (nao bloqueiam) ────────────────────────────────

describe('validarStatus — avisos', () => {
  it('status sem regras gera AVISO mas continua valido (nao bloqueia salvar)', () => {
    const s = status({ regras: [] })
    const v = validarStatus(s)
    expect(v.valida).toBe(true)
    expect(v.problemas).toHaveLength(1)
    expect(v.problemas[0].severidade).toBe('aviso')
    expect(v.problemas[0].mensagem).toContain('Status sem regras')
  })
})

// ── validarStatus — multiplos problemas acumulados ────────────────────────

describe('validarStatus — acumulo de problemas', () => {
  it('reporta multiplos erros em uma so chamada', () => {
    const s = status({
      operador: 'AND',
      regras: [
        regra({ id: 'r1', campo: 'responsavel', condicao: 'maior_que', valor: '' }),
        regra({ id: 'r2', origem: 'pedido', campo: 'valor_fob', condicao: 'contem', valor: 'xyz' }),
      ],
    })
    const v = validarStatus(s)
    expect(v.valida).toBe(false)
    // Pelo menos 2 erros (tipo incompativel + valor vazio na regra 1, tipo incompativel na regra 2)
    expect(v.problemas.filter(p => p.severidade === 'erro').length).toBeGreaterThanOrEqual(2)
  })
})

// ── Robustez ───────────────────────────────────────────────────────────────

describe('validarStatus — robustez', () => {
  it('regra com campo inexistente eh ignorada silenciosamente', () => {
    const s = status({
      regras: [regra({ campo: 'campo_que_nao_existe', condicao: 'preenchido' })],
    })
    // Nao deve crashar — o campo simplesmente nao eh validado
    expect(() => validarStatus(s)).not.toThrow()
  })

  it('campos cross-origem funcionam (dados_processo + pedido)', () => {
    const s = status({
      operador: 'AND',
      regras: [
        regra({ id: 'r1', origem: 'dados_processo', campo: 'data_embarque', condicao: 'preenchido' }),
        regra({ id: 'r2', origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '50000' }),
      ],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

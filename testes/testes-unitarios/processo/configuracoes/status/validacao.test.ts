// TST-UNIT-PROC-STATUS-001 — Validador GABI das regras de Status do Processo
// Cobre validacao.ts (funcao validarStatus, catalogos, helpers).
// Espelha o padrao de teste de Campos Calculados do Pedido.
//
// Categorias do plano (status-unitario.md):
//   STATUS-U01..U05  catalogo de campos
//   STATUS-U06..U09  helpers (precisaValor, ROTULO_CONDICAO)
//   STATUS-U10..U13  matriz CONDICAO_POR_TIPO
//   STATUS-U14..U18  casos validos
//   STATUS-U19..U22  incompatibilidade tipo x condicao
//   STATUS-U23..U27  valor de comparacao ausente
//   STATUS-U28..U31  valor numerico invalido
//   STATUS-U32..U34  conflitos no modo AND
//   STATUS-U35       aviso (status sem regras)
//   STATUS-U36       acumulo de problemas
//   STATUS-U37..U38  robustez

/// <reference types="vitest/globals" />

import {
  validarStatus,
  precisaValor,
  camposPara,
  CONDICAO_POR_TIPO,
  CAMPOS_DADOS_PROCESSO,
  CAMPOS_PEDIDO,
  ROTULO_CONDICAO,
  type StatusConfig,
  type Regra,
} from '../../../../../servicos-global/produto/processo/client/src/pages/configuracoes/status/validacao.js'

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

// ── STATUS-U06..U09  helpers ───────────────────────────────────────────────

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

describe('ROTULO_CONDICAO', () => {
  it('cobre todas as 7 condicoes', () => {
    expect(Object.keys(ROTULO_CONDICAO).sort()).toEqual([
      'contem', 'diferente', 'igual', 'maior_que', 'menor_que', 'preenchido', 'vazio',
    ])
  })
})

// ── STATUS-U01..U05  catalogos ─────────────────────────────────────────────

describe('camposPara + catalogos', () => {
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

// ── STATUS-U10..U13  matriz de compatibilidade ─────────────────────────────

describe('CONDICAO_POR_TIPO — matriz de compatibilidade', () => {
  it('vazio e preenchido aceitam todos os tipos', () => {
    expect(CONDICAO_POR_TIPO.vazio).toEqual(['texto', 'numero', 'data', 'select'])
    expect(CONDICAO_POR_TIPO.preenchido).toEqual(['texto', 'numero', 'data', 'select'])
  })

  it('igual e diferente aceitam todos os tipos', () => {
    expect(CONDICAO_POR_TIPO.igual).toEqual(['texto', 'numero', 'data', 'select'])
    expect(CONDICAO_POR_TIPO.diferente).toEqual(['texto', 'numero', 'data', 'select'])
  })

  it('contem so funciona em texto', () => {
    expect(CONDICAO_POR_TIPO.contem).toEqual(['texto'])
  })

  it('maior_que/menor_que so em numero e data', () => {
    expect(CONDICAO_POR_TIPO.maior_que).toEqual(['numero', 'data'])
    expect(CONDICAO_POR_TIPO.menor_que).toEqual(['numero', 'data'])
  })
})

// ── STATUS-U14..U18  casos validos ─────────────────────────────────────────

describe('validarStatus — casos validos', () => {
  it('status com 1 regra simples (campo preenchido) eh valido', () => {
    const s = status({ regras: [regra({ condicao: 'preenchido' })] })
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
    expect(validarStatus(s).valida).toBe(true)
  })

  it('maior_que em campo numerico com valor eh valido', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '10000' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('aceita virgula como separador decimal', () => {
    const s = status({
      regras: [regra({ origem: 'pedido', campo: 'valor_fob', condicao: 'maior_que', valor: '10000,5' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('contem em campo texto eh valido', () => {
    const s = status({
      regras: [regra({ campo: 'responsavel', condicao: 'contem', valor: 'Daniel' })],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── STATUS-U19..U22  incompatibilidade tipo x condicao ────────────────────

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

// ── STATUS-U23..U27  valor de comparacao ausente ──────────────────────────

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

  it('valor com apenas espacos eh tratado como vazio', () => {
    const s = status({
      regras: [regra({ campo: 'responsavel', condicao: 'contem', valor: '   ' })],
    })
    expect(validarStatus(s).valida).toBe(false)
  })

  it('vazio nao precisa de valor — ok mesmo sem ele', () => {
    const s = status({ regras: [regra({ campo: 'di_numero', condicao: 'vazio' })] })
    expect(validarStatus(s).valida).toBe(true)
  })

  it('preenchido nao precisa de valor', () => {
    const s = status({ regras: [regra({ campo: 'numero_processo', condicao: 'preenchido' })] })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── STATUS-U28..U31  valor numerico invalido ──────────────────────────────

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

// ── STATUS-U32..U34  conflitos no AND ─────────────────────────────────────

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

  it('mesmo campo vazio OU preenchido (OR) NAO gera erro (eh possivel)', () => {
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
        regra({ id: 'r1', campo: 'di_numero', condicao: 'vazio' }),
        regra({ id: 'r2', campo: 'li_numero', condicao: 'preenchido' }),
      ],
    })
    expect(validarStatus(s).valida).toBe(true)
  })
})

// ── STATUS-U35  aviso ──────────────────────────────────────────────────────

describe('validarStatus — avisos', () => {
  it('status sem regras gera AVISO mas continua valido', () => {
    const s = status({ regras: [] })
    const v = validarStatus(s)
    expect(v.valida).toBe(true)
    expect(v.problemas).toHaveLength(1)
    expect(v.problemas[0].severidade).toBe('aviso')
    expect(v.problemas[0].mensagem).toContain('Status sem regras')
  })
})

// ── STATUS-U36  acumulo ───────────────────────────────────────────────────

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
    expect(v.problemas.filter(p => p.severidade === 'erro').length).toBeGreaterThanOrEqual(2)
  })
})

// ── STATUS-U37..U38  robustez ─────────────────────────────────────────────

describe('validarStatus — robustez', () => {
  it('regra com campo inexistente eh ignorada silenciosamente', () => {
    const s = status({
      regras: [regra({ campo: 'campo_que_nao_existe', condicao: 'preenchido' })],
    })
    expect(() => validarStatus(s)).not.toThrow()
  })

  it('campos cross-origem (dados_processo + pedido) funcionam', () => {
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

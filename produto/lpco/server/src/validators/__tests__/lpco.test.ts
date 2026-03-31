/**
 * lpco.test.ts — Testes unitarios para Zod schemas de validacao LPCO
 */

import { describe, it, expect } from 'vitest'
import {
  LpcoCreateSchema,
  LpcoItemCreateSchema,
  LpcoRegistroSchema,
  LpcoListaQuerySchema,
  LpcoAtributoSchema,
  LpcoExigenciaCreateSchema,
  LpcoExigenciaRespostaSchema,
  LpcoVinculoCreateSchema,
  LpcoCancelarSchema,
  LpcoAtualizarStatusSchema,
  TipoOperacaoEnum,
  TipoLpcoEnum,
  CanalEntradaEnum,
  LpcoStatusEnum,
} from '../lpco.js'

// ── LpcoCreateSchema ────────────────────────────────────────────────────────

describe('LpcoCreateSchema', () => {
  const dadosValidos = {
    tipo_operacao: 'IMPORTACAO',
    tipo_lpco: 'POR_OPERACAO',
    orgao_anuente: 'ANVISA',
    modelo_lpco: 'I00004',
    pais_procedencia: 'CN',
    fundamento_legal: 'RDC 81/2008',
  }

  it('deve aceitar dados validos completos', () => {
    const result = LpcoCreateSchema.safeParse(dadosValidos)
    expect(result.success).toBe(true)
  })

  it('deve aceitar dados com campos opcionais', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      unidade_entrada: 'SANTOS',
      recinto_armazenamento: 'CLIA-01',
      condicao_mercadoria: 'NOVA',
      canal_entrada: 'PLANILHA',
      pedido_origem_id: 'ped-123',
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar dados com itens', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      itens: [{
        ncm: '30049099',
        descricao_produto: 'Medicamento generico',
        quantidade_estatistica: 1000,
        unidade_medida: 'UN',
        peso_liquido: 500,
        vmle: 15000,
        moeda: 'USD',
      }],
    })
    expect(result.success).toBe(true)
  })

  it('deve aplicar canal_entrada padrao MANUAL', () => {
    const result = LpcoCreateSchema.safeParse(dadosValidos)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.canal_entrada).toBe('MANUAL')
    }
  })

  it('deve rejeitar tipo_operacao invalido', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      tipo_operacao: 'INVALIDO',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar tipo_lpco invalido', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      tipo_lpco: 'INVALIDO',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar orgao_anuente com menos de 2 chars', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      orgao_anuente: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar orgao_anuente com mais de 10 chars', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      orgao_anuente: 'A'.repeat(11),
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar modelo_lpco vazio', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      modelo_lpco: '',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar pais_procedencia com tamanho diferente de 2', () => {
    const result1 = LpcoCreateSchema.safeParse({ ...dadosValidos, pais_procedencia: 'C' })
    const result2 = LpcoCreateSchema.safeParse({ ...dadosValidos, pais_procedencia: 'CHN' })
    expect(result1.success).toBe(false)
    expect(result2.success).toBe(false)
  })

  it('deve rejeitar fundamento_legal vazio', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      fundamento_legal: '',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar canal_entrada invalido', () => {
    const result = LpcoCreateSchema.safeParse({
      ...dadosValidos,
      canal_entrada: 'EMAIL',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar se campos obrigatorios ausentes', () => {
    const result = LpcoCreateSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ── LpcoItemCreateSchema ────────────────────────────────────────────────────

describe('LpcoItemCreateSchema', () => {
  const itemValido = {
    ncm: '30049099',
    descricao_produto: 'Medicamento generico - Amoxicilina 500mg',
    quantidade_estatistica: 50000,
    unidade_medida: 'UN',
    peso_liquido: 2500,
    vmle: 15000,
    moeda: 'USD',
  }

  it('deve aceitar item valido', () => {
    const result = LpcoItemCreateSchema.safeParse(itemValido)
    expect(result.success).toBe(true)
  })

  it('deve aceitar item com campos opcionais', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      catalogo_produto_id: 'cat-001',
      fabricante: 'Shanghai Pharma Co.',
      exportador: 'China Export Inc.',
      quantidade_comercial: 50000,
      unidade_medida_comercial: 'UN',
      condicao_venda: 'CIF',
      atributos: [{
        codigo: 'ATTR001',
        nome: 'Principio Ativo',
        tipo: 'texto',
        obrigatorio: true,
        valor: 'Amoxicilina',
      }],
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar NCM com menos de 8 digitos', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      ncm: '3004',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar NCM com letras', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      ncm: '3004AB99',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar NCM com mais de 8 digitos', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      ncm: '300490999',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar descricao_produto vazia', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      descricao_produto: '',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar descricao_produto com mais de 500 chars', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      descricao_produto: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar quantidade_estatistica zero ou negativa', () => {
    const result1 = LpcoItemCreateSchema.safeParse({ ...itemValido, quantidade_estatistica: 0 })
    const result2 = LpcoItemCreateSchema.safeParse({ ...itemValido, quantidade_estatistica: -1 })
    expect(result1.success).toBe(false)
    expect(result2.success).toBe(false)
  })

  it('deve rejeitar peso_liquido zero ou negativo', () => {
    const result1 = LpcoItemCreateSchema.safeParse({ ...itemValido, peso_liquido: 0 })
    const result2 = LpcoItemCreateSchema.safeParse({ ...itemValido, peso_liquido: -100 })
    expect(result1.success).toBe(false)
    expect(result2.success).toBe(false)
  })

  it('deve rejeitar vmle zero ou negativo', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      vmle: -5000,
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar moeda com tamanho diferente de 3', () => {
    const result1 = LpcoItemCreateSchema.safeParse({ ...itemValido, moeda: 'US' })
    const result2 = LpcoItemCreateSchema.safeParse({ ...itemValido, moeda: 'USDT' })
    expect(result1.success).toBe(false)
    expect(result2.success).toBe(false)
  })

  it('deve rejeitar unidade_medida vazia', () => {
    const result = LpcoItemCreateSchema.safeParse({
      ...itemValido,
      unidade_medida: '',
    })
    expect(result.success).toBe(false)
  })
})

// ── LpcoRegistroSchema ──────────────────────────────────────────────────────

describe('LpcoRegistroSchema', () => {
  const registroValido = {
    tipo_operacao: 'IMPORTACAO',
    tipo_lpco: 'POR_OPERACAO',
    orgao_anuente: 'ANVISA',
    modelo_lpco: 'I00004',
    pais_procedencia: 'CN',
    fundamento_legal: 'RDC 81/2008',
    itens: [{
      ncm: '30049099',
      descricao_produto: 'Medicamento generico',
      quantidade_estatistica: 1000,
      unidade_medida: 'UN',
      peso_liquido: 500,
      vmle: 15000,
      moeda: 'USD',
    }],
  }

  it('deve aceitar registro valido com 1 item', () => {
    const result = LpcoRegistroSchema.safeParse(registroValido)
    expect(result.success).toBe(true)
  })

  it('deve aceitar registro com multiplos itens', () => {
    const result = LpcoRegistroSchema.safeParse({
      ...registroValido,
      itens: [
        { ncm: '30049099', descricao_produto: 'Item 1', quantidade_estatistica: 100, unidade_medida: 'UN', peso_liquido: 50, vmle: 1000, moeda: 'USD' },
        { ncm: '30042099', descricao_produto: 'Item 2', quantidade_estatistica: 200, unidade_medida: 'KG', peso_liquido: 100, vmle: 2000, moeda: 'EUR' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar registro sem itens', () => {
    const result = LpcoRegistroSchema.safeParse({
      ...registroValido,
      itens: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const itemError = result.error.issues.find(i => i.path.includes('itens'))
      expect(itemError?.message).toBe('LPCO deve ter pelo menos 1 item')
    }
  })

  it('deve rejeitar registro sem campo itens', () => {
    const { itens, ...semItens } = registroValido
    const result = LpcoRegistroSchema.safeParse(semItens)
    expect(result.success).toBe(false)
  })

  it('deve rejeitar registro com item invalido', () => {
    const result = LpcoRegistroSchema.safeParse({
      ...registroValido,
      itens: [{ ncm: '1234' }], // NCM invalido, campos faltando
    })
    expect(result.success).toBe(false)
  })
})

// ── LpcoListaQuerySchema ────────────────────────────────────────────────────

describe('LpcoListaQuerySchema', () => {
  it('deve aceitar query vazia (defaults)', () => {
    const result = LpcoListaQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
      expect(result.data.ordenar_por).toBe('created_at')
      expect(result.data.direcao).toBe('desc')
    }
  })

  it('deve aceitar todos os filtros', () => {
    const result = LpcoListaQuerySchema.safeParse({
      page: '2',
      limit: '50',
      status: 'deferida',
      tipo_operacao: 'IMPORTACAO',
      tipo_lpco: 'FLEX',
      orgao_anuente: 'ANVISA',
      canal_entrada: 'MANUAL',
      busca: 'teste',
      ordenar_por: 'status',
      direcao: 'asc',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(50)
      expect(result.data.status).toBe('deferida')
    }
  })

  it('deve coercer strings para numeros em page e limit', () => {
    const result = LpcoListaQuerySchema.safeParse({ page: '3', limit: '10' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.limit).toBe(10)
    }
  })

  it('deve rejeitar page menor que 1', () => {
    const result = LpcoListaQuerySchema.safeParse({ page: '0' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar limit maior que 100', () => {
    const result = LpcoListaQuerySchema.safeParse({ limit: '101' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar limit menor que 1', () => {
    const result = LpcoListaQuerySchema.safeParse({ limit: '0' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar status invalido', () => {
    const result = LpcoListaQuerySchema.safeParse({ status: 'aprovada' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar ordenar_por invalido', () => {
    const result = LpcoListaQuerySchema.safeParse({ ordenar_por: 'nome' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar direcao invalida', () => {
    const result = LpcoListaQuerySchema.safeParse({ direcao: 'random' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar busca com mais de 200 chars', () => {
    const result = LpcoListaQuerySchema.safeParse({ busca: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('deve aceitar todos os valores de ordenar_por', () => {
    for (const val of ['created_at', 'updated_at', 'numero_portal', 'status']) {
      const result = LpcoListaQuerySchema.safeParse({ ordenar_por: val })
      expect(result.success).toBe(true)
    }
  })
})

// ── Enums ────────────────────────────────────────────────────────────────────

describe('Enums', () => {
  it('TipoOperacaoEnum deve aceitar IMPORTACAO e EXPORTACAO', () => {
    expect(TipoOperacaoEnum.safeParse('IMPORTACAO').success).toBe(true)
    expect(TipoOperacaoEnum.safeParse('EXPORTACAO').success).toBe(true)
    expect(TipoOperacaoEnum.safeParse('TRANSITO').success).toBe(false)
  })

  it('TipoLpcoEnum deve aceitar POR_OPERACAO, FLEX e TAXA', () => {
    expect(TipoLpcoEnum.safeParse('POR_OPERACAO').success).toBe(true)
    expect(TipoLpcoEnum.safeParse('FLEX').success).toBe(true)
    expect(TipoLpcoEnum.safeParse('TAXA').success).toBe(true)
    expect(TipoLpcoEnum.safeParse('GLOBAL').success).toBe(false)
  })

  it('CanalEntradaEnum deve aceitar todos os canais', () => {
    for (const canal of ['MANUAL', 'PLANILHA', 'PEDIDO', 'SMART_READ', 'DUPLICAR', 'API']) {
      expect(CanalEntradaEnum.safeParse(canal).success).toBe(true)
    }
    expect(CanalEntradaEnum.safeParse('EMAIL').success).toBe(false)
  })

  it('LpcoStatusEnum deve aceitar todos os status', () => {
    const allStatus = [
      'rascunho', 'para_analise', 'em_analise', 'em_exigencia',
      'resposta_exigencia', 'deferida', 'indeferida', 'cancelada',
    ]
    for (const status of allStatus) {
      expect(LpcoStatusEnum.safeParse(status).success).toBe(true)
    }
    expect(LpcoStatusEnum.safeParse('aprovada').success).toBe(false)
  })
})

// ── Schemas auxiliares ──────────────────────────────────────────────────────

describe('schemas auxiliares', () => {
  describe('LpcoAtributoSchema', () => {
    it('deve aceitar atributo valido', () => {
      const result = LpcoAtributoSchema.safeParse({
        codigo: 'ATTR001',
        nome: 'Principio Ativo',
        tipo: 'texto',
        obrigatorio: true,
        valor: 'Amoxicilina',
      })
      expect(result.success).toBe(true)
    })

    it('deve aceitar atributo com valor numerico', () => {
      const result = LpcoAtributoSchema.safeParse({
        codigo: 'ATTR002',
        nome: 'Concentracao',
        tipo: 'numero',
        obrigatorio: false,
        valor: 500,
      })
      expect(result.success).toBe(true)
    })

    it('deve aceitar atributo com valor booleano', () => {
      const result = LpcoAtributoSchema.safeParse({
        codigo: 'ATTR003',
        nome: 'Controlado',
        tipo: 'booleano',
        obrigatorio: true,
        valor: true,
      })
      expect(result.success).toBe(true)
    })

    it('deve aceitar atributo composto', () => {
      const result = LpcoAtributoSchema.safeParse({
        codigo: 'ATTR004',
        nome: 'Composicao',
        tipo: 'composto',
        obrigatorio: false,
        valor: { principio: 'Amox', dose: '500mg' },
      })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar tipo invalido', () => {
      const result = LpcoAtributoSchema.safeParse({
        codigo: 'ATTR001',
        nome: 'Teste',
        tipo: 'arquivo',
        obrigatorio: false,
        valor: 'x',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('LpcoExigenciaCreateSchema', () => {
    it('deve aceitar exigencia valida', () => {
      const result = LpcoExigenciaCreateSchema.safeParse({
        numero_exigencia: 1,
        descricao_exigencia: 'Apresentar CBPF do fabricante',
        data_exigencia: '2026-02-20T00:00:00Z',
      })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar numero_exigencia zero', () => {
      const result = LpcoExigenciaCreateSchema.safeParse({
        numero_exigencia: 0,
        descricao_exigencia: 'Teste',
        data_exigencia: '2026-02-20T00:00:00Z',
      })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar descricao_exigencia vazia', () => {
      const result = LpcoExigenciaCreateSchema.safeParse({
        numero_exigencia: 1,
        descricao_exigencia: '',
        data_exigencia: '2026-02-20T00:00:00Z',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('LpcoVinculoCreateSchema', () => {
    it('deve aceitar vinculo valido', () => {
      const result = LpcoVinculoCreateSchema.safeParse({
        processo_id: 'proc-001',
        tipo_documento: 'DUIMP',
      })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar tipo_documento invalido', () => {
      const result = LpcoVinculoCreateSchema.safeParse({
        processo_id: 'proc-001',
        tipo_documento: 'NF',
      })
      expect(result.success).toBe(false)
    })

    it('deve aceitar DUIMP e DUE', () => {
      expect(LpcoVinculoCreateSchema.safeParse({ processo_id: 'p1', tipo_documento: 'DUIMP' }).success).toBe(true)
      expect(LpcoVinculoCreateSchema.safeParse({ processo_id: 'p1', tipo_documento: 'DUE' }).success).toBe(true)
    })
  })

  describe('LpcoCancelarSchema', () => {
    it('deve aceitar motivo valido', () => {
      const result = LpcoCancelarSchema.safeParse({ motivo: 'Nao e mais necessario' })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar motivo vazio', () => {
      const result = LpcoCancelarSchema.safeParse({ motivo: '' })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar motivo com mais de 1000 chars', () => {
      const result = LpcoCancelarSchema.safeParse({ motivo: 'x'.repeat(1001) })
      expect(result.success).toBe(false)
    })
  })

  describe('LpcoAtualizarStatusSchema', () => {
    it('deve aceitar status valido', () => {
      const result = LpcoAtualizarStatusSchema.safeParse({ status: 'deferida' })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar status invalido', () => {
      const result = LpcoAtualizarStatusSchema.safeParse({ status: 'aprovada' })
      expect(result.success).toBe(false)
    })
  })
})

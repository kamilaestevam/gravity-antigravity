// server/__tests__/test-schemas.test.ts
// Testes unitários para schemas Zod compartilhados e validação anti-alucinação

import { describe, it, expect } from 'vitest'
import {
  AiAnalysisSchema,
  validateDiffAgainstSource,
  PlanoTesteSchema,
  EscopoSchema,
  CriticidadeSchema,
  TipoTesteSchema,
  InteracaoSchema,
  AssercaoSchema,
  PassoSchema,
  CoberturaCategoriaSchema,
  MapeamentoTestidsSchema,
} from '../lib/test-schemas.js'

// ─── AiAnalysisSchema ────────────────────────────────────────────────────────

describe('AiAnalysisSchema', () => {
  const validAnalysis = {
    erroResumo: 'Botão Salvar não encontrado na tela',
    motivo: 'O teste procura getByTestId btn-salvar mas o componente agora usa btn-salvar-org. O commit abc1234 renomeou os testids.',
    sugestaoCorrecao: 'Atualizar o seletor no spec de btn-salvar para btn-salvar-org',
    arquivo: 'Organizacao.tsx:48',
    codigoDiff: {
      arquivo: 'Organizacao.tsx',
      linha: 48,
      old: "getByTestId('btn-salvar')",
      new: "getByTestId('btn-salvar-org')",
      explicacao: 'Sincroniza testid com componente',
    },
    categoria: 'TESTE_DESATUALIZADO' as const,
    confianca: 'alta' as const,
    commitSuspeito: {
      hash: 'abc1234',
      autor: 'Daniel',
      data: '2026-04-14',
      mensagem: 'refactor: renomeia testids',
    },
    tokensUsados: 5000,
    modeloUsado: 'gemini-2.0-flash',
  }

  it('aceita análise válida completa', () => {
    const result = AiAnalysisSchema.safeParse(validAnalysis)
    expect(result.success).toBe(true)
  })

  it('aceita análise com codigoDiff null', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      codigoDiff: null,
      confianca: 'baixa',
    })
    expect(result.success).toBe(true)
  })

  it('aceita análise com commitSuspeito null', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      commitSuspeito: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita erroResumo menor que 10 chars', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      erroResumo: 'curto',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita erroResumo maior que 160 chars', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      erroResumo: 'x'.repeat(161),
    })
    expect(result.success).toBe(false)
  })

  it('rejeita motivo menor que 50 chars', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      motivo: 'muito curto',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita categoria inválida', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      categoria: 'INEXISTENTE',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita confianca inválida', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      confianca: 'altissima',
    })
    expect(result.success).toBe(false)
  })

  it('valida todas as 6 categorias', () => {
    const categorias = ['BUG_REAL', 'TESTE_DESATUALIZADO', 'FLAKY_TIMING', 'REGRESSAO_RECENTE', 'INFRA', 'NAO_CLASSIFICAVEL']
    for (const cat of categorias) {
      const result = AiAnalysisSchema.safeParse({ ...validAnalysis, categoria: cat })
      expect(result.success).toBe(true)
    }
  })

  it('valida arquivo com formato arquivo:linha', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      arquivo: 'src/pages/Org.tsx:42',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita arquivo com : sem numero de linha', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      arquivo: 'src/pages:abc',
    })
    expect(result.success).toBe(false)
  })

  it('aceita arquivo sem :', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      arquivo: 'src/pages/Org.tsx',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita codigoDiff.old vazio', () => {
    const result = AiAnalysisSchema.safeParse({
      ...validAnalysis,
      codigoDiff: { ...validAnalysis.codigoDiff, old: '' },
    })
    expect(result.success).toBe(false)
  })
})

// ─── validateDiffAgainstSource ───────────────────────────────────────────────

describe('validateDiffAgainstSource', () => {
  const baseAnalysis = {
    erroResumo: 'Botão não encontrado na tela de teste',
    motivo: 'O teste procura um seletor que não existe mais no componente renderizado pela página.',
    sugestaoCorrecao: 'Atualizar o seletor no spec para o novo testid do componente',
    arquivo: 'test.tsx:10',
    codigoDiff: {
      arquivo: 'test.tsx',
      linha: 10,
      old: 'const x = 1',
      new: 'const x = 2',
      explicacao: 'corrige valor',
    },
    categoria: 'BUG_REAL' as const,
    confianca: 'alta' as const,
    commitSuspeito: null,
  }

  it('mantém análise quando diff.old existe no source', () => {
    const result = validateDiffAgainstSource(baseAnalysis, 'blah const x = 1 blah')
    expect(result.confianca).toBe('alta')
    expect(result.codigoDiff).not.toBeNull()
  })

  it('rebaixa confiança e remove diff quando diff.old não existe no source', () => {
    const result = validateDiffAgainstSource(baseAnalysis, 'nenhum match aqui')
    expect(result.confianca).toBe('media')
    expect(result.codigoDiff).toBeNull()
  })

  it('rebaixa confiança alta sem diff para media', () => {
    const noDiff = { ...baseAnalysis, codigoDiff: null }
    const result = validateDiffAgainstSource(noDiff, 'qualquer coisa')
    expect(result.confianca).toBe('media')
  })

  it('não altera análise com confiança media', () => {
    const media = { ...baseAnalysis, confianca: 'media' as const }
    const result = validateDiffAgainstSource(media, 'nenhum match')
    expect(result.confianca).toBe('media')
    expect(result.codigoDiff).not.toBeNull()
  })

  it('não altera análise com confiança baixa', () => {
    const baixa = { ...baseAnalysis, confianca: 'baixa' as const, codigoDiff: null }
    const result = validateDiffAgainstSource(baixa, 'nenhum match')
    expect(result.confianca).toBe('baixa')
  })
})

// ─── Enums ───────────────────────────────────────────────────────────────────

describe('Enums', () => {
  it('EscopoSchema aceita todos os 16 escopos', () => {
    const escopos = ['LOGIN', 'CONFIG', 'ADMIN', 'HUB', 'CORE', 'MARKET', 'TENANT', 'DBASE',
      'PEDIDO', 'NFIMP', 'LPCO', 'BIDFRT', 'BIDCAM', 'SIMCUS', 'FINCOM', 'PROCSO']
    for (const e of escopos) {
      expect(EscopoSchema.safeParse(e).success).toBe(true)
    }
    expect(EscopoSchema.safeParse('INVALIDO').success).toBe(false)
  })

  it('TipoTesteSchema aceita os 6 tipos', () => {
    for (const t of ['UNI', 'CON', 'FUN', 'CRO', 'E2E', 'PEN']) {
      expect(TipoTesteSchema.safeParse(t).success).toBe(true)
    }
  })

  it('CriticidadeSchema aceita os 4 níveis', () => {
    for (const c of ['baixa', 'media', 'alta', 'critica']) {
      expect(CriticidadeSchema.safeParse(c).success).toBe(true)
    }
  })
})

// ─── InteracaoSchema ─────────────────────────────────────────────────────────

describe('InteracaoSchema', () => {
  it('aceita goto', () => {
    expect(InteracaoSchema.safeParse({ tipo: 'goto', rota: '/workspace/org' }).success).toBe(true)
  })

  it('aceita click', () => {
    expect(InteracaoSchema.safeParse({ tipo: 'click', testid: 'btn-salvar' }).success).toBe(true)
  })

  it('aceita fill', () => {
    expect(InteracaoSchema.safeParse({ tipo: 'fill', testid: 'input-nome', valor: 'teste' }).success).toBe(true)
  })

  it('aceita resize', () => {
    expect(InteracaoSchema.safeParse({ tipo: 'resize', largura: 375, altura: 812 }).success).toBe(true)
  })

  it('aceita verificacao (sem campos extras)', () => {
    expect(InteracaoSchema.safeParse({ tipo: 'verificacao' }).success).toBe(true)
  })

  it('rejeita tipo inexistente', () => {
    expect(InteracaoSchema.safeParse({ tipo: 'drag' }).success).toBe(false)
  })
})

// ─── AssercaoSchema ──────────────────────────────────────────────────────────

describe('AssercaoSchema', () => {
  it('aceita visible', () => {
    expect(AssercaoSchema.safeParse({ tipo: 'visible', testid: 'btn-x' }).success).toBe(true)
  })

  it('aceita urlMatches', () => {
    expect(AssercaoSchema.safeParse({ tipo: 'urlMatches', regex: '/workspace' }).success).toBe(true)
  })

  it('aceita toastShown', () => {
    expect(AssercaoSchema.safeParse({ tipo: 'toastShown', texto: 'salvo' }).success).toBe(true)
  })

  it('aceita apiResponse', () => {
    expect(AssercaoSchema.safeParse({ tipo: 'apiResponse', rota: '/api/v1/usuarios', status: 200 }).success).toBe(true)
  })
})

// ─── PassoSchema ─────────────────────────────────────────────────────────────

describe('PassoSchema', () => {
  it('aceita passo válido completo', () => {
    const result = PassoSchema.safeParse({
      numero: 1,
      acao: 'Navegar para a tela de organização',
      categoria: 1,
      origem: 'humano-original',
      interacao: { tipo: 'goto', rota: '/workspace/org' },
      assercao: { tipo: 'urlMatches', regex: '/workspace/org' },
      resultadoEsperado: 'URL correta carregada no navegador',
      screenshot: '01_navegar',
      tiposAplicaveis: ['E2E'],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita acao muito curta', () => {
    const result = PassoSchema.safeParse({
      numero: 1,
      acao: 'go',
      categoria: 1,
      origem: 'agente-adicionado',
      interacao: { tipo: 'verificacao' },
      resultadoEsperado: 'Algo acontece no resultado esperado',
      screenshot: null,
      tiposAplicaveis: ['E2E'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita tiposAplicaveis vazio', () => {
    const result = PassoSchema.safeParse({
      numero: 1,
      acao: 'Verificar algo no teste',
      categoria: 1,
      origem: 'agente-adicionado',
      interacao: { tipo: 'verificacao' },
      resultadoEsperado: 'Resultado esperado do teste',
      screenshot: null,
      tiposAplicaveis: [],
    })
    expect(result.success).toBe(false)
  })
})

// ─── CoberturaCategoriaSchema ────────────────────────────────────────────────

describe('CoberturaCategoriaSchema', () => {
  it('aceita categoria coberta', () => {
    const result = CoberturaCategoriaSchema.safeParse({
      categoria: 1,
      nome: 'Carregamento da tela',
      status: 'coberta',
      passosAssociados: [1, 2, 3],
    })
    expect(result.success).toBe(true)
  })

  it('aceita nao_aplicavel com justificativa', () => {
    const result = CoberturaCategoriaSchema.safeParse({
      categoria: 6,
      nome: 'Create',
      status: 'nao_aplicavel',
      justificativa: 'Tela read-only',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita categoria fora do range 1-20', () => {
    const result = CoberturaCategoriaSchema.safeParse({
      categoria: 21,
      nome: 'Inexistente',
      status: 'coberta',
    })
    expect(result.success).toBe(false)
  })
})

// ─── MapeamentoTestidsSchema ─────────────────────────────────────────────────

describe('MapeamentoTestidsSchema', () => {
  it('aceita mapeamento válido', () => {
    const result = MapeamentoTestidsSchema.safeParse({
      componente: 'src/pages/Org.tsx',
      extraidoEm: '2026-04-15T14:30:00Z',
      elementos: {
        'btn-salvar': {
          testid: 'btn-salvar',
          tipo: 'botao',
          descricao: 'Botão Salvar',
        },
      },
    })
    expect(result.success).toBe(true)
  })

  it('aceita mapeamento com testidsFaltando', () => {
    const result = MapeamentoTestidsSchema.safeParse({
      componente: 'src/pages/Org.tsx',
      extraidoEm: '2026-04-15T14:30:00Z',
      elementos: {},
      testidsFaltando: ['btn-novo', 'input-nome'],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita tipo de elemento inválido', () => {
    const result = MapeamentoTestidsSchema.safeParse({
      componente: 'src/pages/Org.tsx',
      extraidoEm: '2026-04-15T14:30:00Z',
      elementos: {
        'btn-x': {
          testid: 'btn-x',
          tipo: 'widget_inventado',
          descricao: 'Tipo inválido',
        },
      },
    })
    expect(result.success).toBe(false)
  })
})

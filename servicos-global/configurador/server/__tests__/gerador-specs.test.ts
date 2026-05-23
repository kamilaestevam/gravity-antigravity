// server/__tests__/gerador-specs.test.ts
// Testes unitários para o gerador de specs Playwright

import { describe, it, expect, vi } from 'vitest'

// Mock fs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
})

import { generateSpec } from '../lib/gerador-specs.js'
import type { PlanoTeste } from '../lib/test-schemas.js'

const minimalPlan: PlanoTeste = {
  id: 'TST-E2E-CONFIG-000099',
  versao: '1.0',
  geradoEm: '2026-04-15T14:30:00Z',
  geradoPor: 'agente-plano-teste',
  escopo: 'CONFIG',
  sublocal: 'TestePuro',
  tela: 'Teste Puro',
  rota: '/configurador/teste',
  componenteFilePath: 'src/pages/Teste.tsx',
  mapeamentoFilePath: 'testes/_mapeamentos/configurador/teste.testids.json',
  ambientes: ['Local'],
  criticidade: 'baixa',
  temDinheiro: false,
  resumoExecutivo: 'Plano de teste mínimo para validação do gerador de specs Playwright do sistema de testes.',
  preRequisitos: {
    ambiente: 'Local',
    organizacao: 'Test',
    workspace: 'Test',
    roleUsuario: 'ADMIN',
    servicosAtivos: ['configurador-server-8005'],
  },
  mapeamentoTestids: {
    componente: 'src/pages/Teste.tsx',
    extraidoEm: '2026-04-15T14:30:00Z',
    elementos: {},
  },
  cobertura: Array.from({ length: 20 }, (_, i) => ({
    categoria: i + 1,
    nome: `Cat ${i + 1}`,
    status: i === 0 ? 'coberta' as const : 'nao_aplicavel' as const,
    passosAssociados: i === 0 ? [1, 2, 3] : [],
    justificativa: i > 0 ? 'Não aplicável para teste de validação do gerador de specs' : undefined,
  })),
  coberturaPercentual: 100,
  passos: [
    {
      numero: 1,
      acao: 'Navegar para a tela de teste',
      categoria: 1,
      origem: 'agente-adicionado',
      interacao: { tipo: 'goto', rota: '/configurador/teste' },
      assercao: { tipo: 'urlMatches', regex: '/configurador/teste' },
      resultadoEsperado: 'URL correta carregada',
      screenshot: '01_navegar',
      tiposAplicaveis: ['E2E'],
    },
    {
      numero: 2,
      acao: 'Clicar no botao salvar',
      categoria: 1,
      origem: 'agente-adicionado',
      interacao: { tipo: 'click', testid: 'btn-salvar' },
      assercao: { tipo: 'visible', testid: 'toast-sucesso' },
      resultadoEsperado: 'Toast de sucesso aparece',
      screenshot: '02_clicar',
      tiposAplicaveis: ['E2E'],
    },
    {
      numero: 3,
      acao: 'Preencher campo nome com valor',
      categoria: 1,
      origem: 'humano-original',
      interacao: { tipo: 'fill', testid: 'input-nome', valor: "Teste com 'aspas'" },
      resultadoEsperado: 'Campo aceita valor com aspas',
      screenshot: '03_fill',
      tiposAplicaveis: ['E2E'],
    },
  ],
  estimativaDuracao: '~1 min',
  estimativaCustoIA: 0.01,
  ultimaExecucao: null,
  ultimoResultado: null,
}

describe('generateSpec', () => {
  it('gera spec com header correto', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain('TST-E2E-CONFIG-000099')
    expect(spec).toContain('Teste Puro')
    expect(spec).toContain('Gerado automaticamente')
  })

  it('importa de playwright.fixtures.js (não @playwright/test)', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain('playwright.fixtures.js')
    expect(spec).not.toContain("from '@playwright/test'")
  })

  it('gera test.describe com ID e tela', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("test.describe('TST-E2E-CONFIG-000099 — Teste Puro'")
  })

  it('gera um test() por passo', () => {
    const spec = generateSpec(minimalPlan)
    const testMatches = spec.match(/test\('/g)
    expect(testMatches).toHaveLength(3)
  })

  it('gera goto para interacao tipo goto', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("await page.goto('/configurador/teste')")
  })

  it('gera getByTestId.click para interacao tipo click', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("await page.getByTestId('btn-salvar').click()")
  })

  it('gera getByTestId.fill para interacao tipo fill', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("await page.getByTestId('input-nome').fill(")
  })

  it('escapa aspas simples no valor de fill', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("\\'aspas\\'")
  })

  it('gera expect().toHaveURL para assercao urlMatches', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain('await expect(page).toHaveURL')
  })

  it('gera expect().toBeVisible para assercao visible', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("await expect(page.getByTestId('toast-sucesso')).toBeVisible()")
  })

  it('inclui numero do passo no nome do test', () => {
    const spec = generateSpec(minimalPlan)
    expect(spec).toContain("test('1. Navegar")
    expect(spec).toContain("test('2. Clicar")
    expect(spec).toContain("test('3. Preencher")
  })

  it('gera spec compilável (não tem erros de sintaxe óbvios)', () => {
    const spec = generateSpec(minimalPlan)
    // Verifica balanceamento de chaves
    const opens = (spec.match(/\{/g) ?? []).length
    const closes = (spec.match(/\}/g) ?? []).length
    expect(opens).toBe(closes)
    // Verifica que termina com fechamento
    expect(spec.trim().endsWith('})')).toBe(true)
  })
})
